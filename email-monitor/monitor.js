const { ImapFlow } = require("imapflow");
const axios = require("axios");
const winston = require("winston");
require("dotenv").config();

// ============================================================================
// CONFIGURAÇÃO DE LOGGING
// ============================================================================
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(
      ({ timestamp, level, message, stack }) =>
        `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? "\n" + stack : ""}`
    )
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: "./logs/monitor.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// ============================================================================
// VALIDAÇÃO DE CONFIGURAÇÃO
// ============================================================================
const requiredEnvVars = [
  "GMAIL_USER",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REFRESH_TOKEN",
  "IMAP_HOST",
  "WEBHOOK_URL",
  "WEBHOOK_SECRET",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Variável de ambiente obrigatória ausente: ${envVar}`);
    process.exit(1);
  }
}

// ============================================================================
// OAUTH2: OBTÉM ACCESS TOKEN VIA REFRESH TOKEN
// ============================================================================
async function getAccessToken() {
  const start = Date.now();
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    grant_type: "refresh_token",
  });
  let res;
  try {
    res = await axios.post(
      "https://oauth2.googleapis.com/token",
      params.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
  } catch (error) {
    const data = error.response?.data;
    logger.error(`Falha ao obter access token: ${error.message}${data ? ` | ${JSON.stringify(data)}` : ""}`);
    throw error;
  }
  const ms = Date.now() - start;
  logger.info(`Access token obtido via refresh em ${ms}ms`);
  return res.data.access_token;
}

// ============================================================================
// IMAPFLOW CLIENT (XOAUTH2)
// ============================================================================
let client;
async function createClient() {
  const accessToken = await getAccessToken();
  client = new ImapFlow({
    host: process.env.IMAP_HOST,
    port: parseInt(process.env.IMAP_PORT) || 993,
    secure: process.env.IMAP_TLS === "true",
    auth: {
      user: process.env.GMAIL_USER,
      accessToken,
    },
    logger: false,
  });
}

// ============================================================================
// FUNÇÃO: ENVIAR WEBHOOK PARA VERCEL
// ============================================================================
async function sendWebhook(emailData) {
  const startTime = Date.now();

  try {
    logger.info(`Enviando webhook para: ${process.env.WEBHOOK_URL}`);

    const response = await axios.post(
      process.env.WEBHOOK_URL,
      emailData,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": process.env.WEBHOOK_SECRET,
        },
        timeout: 60000, // 60 segundos
      }
    );

    const duration = Date.now() - startTime;
    logger.info(
      `Webhook enviado com sucesso em ${duration}ms - Status: ${response.status}`
    );

    return response.data;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      `Erro ao enviar webhook após ${duration}ms: ${error.message}`
    );

    if (error.response) {
      logger.error(`Status HTTP: ${error.response.status}`);
      logger.error(`Resposta: ${JSON.stringify(error.response.data)}`);
    }

    throw error;
  }
}

// ============================================================================
// FUNÇÃO: PROCESSAR ANEXOS
// ============================================================================
async function bufferStreamToBase64(stream) {
  return await new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (c) => chunks.push(c));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
    stream.on("error", reject);
  });
}

async function fetchMessageData(uid) {
  const lock = await client.getMailboxLock("INBOX");
  try {
    const fetchOpts = { envelope: true, bodyStructure: true };
    let text = "";
    let html = "";
    const meta = await client.fetchOne(uid, fetchOpts);

    // Buscar partes text/plain e text/html
    const parts = [];
    const stack = [meta.bodyStructure];
    while (stack.length) {
      const node = stack.pop();
      if (!node) continue;
      if (node.childNodes && node.childNodes.length) {
        for (const ch of node.childNodes) stack.push(ch);
      } else {
        parts.push(node);
      }
    }

    // texto
    const textPart = parts.find((p) => (p.type || "").toLowerCase() === "text" && (p.subtype || "").toLowerCase() === "plain");
    if (textPart) {
      const { content } = await client.download(uid, textPart.part);
      text = Buffer.concat(await content.toArray ? await content.toArray() : []).toString("utf8");
    }
    // html
    const htmlPart = parts.find((p) => (p.type || "").toLowerCase() === "text" && (p.subtype || "").toLowerCase() === "html");
    if (htmlPart) {
      const { content } = await client.download(uid, htmlPart.part);
      html = Buffer.concat(await content.toArray ? await content.toArray() : []).toString("utf8");
    }

    // anexos
    const attachmentParts = parts.filter((p) => (p.disposition || "").toLowerCase() === "attachment");
    const attachments = [];
    for (const ap of attachmentParts) {
      const { content } = await client.download(uid, ap.part);
      const base64 = await bufferStreamToBase64(content);
      attachments.push({
        filename: ap.parameters?.name || "unnamed",
        contentType: `${ap.type || "application"}/${ap.subtype || "octet-stream"}`,
        size: ap.size || base64.length * 0.75,
        content: base64,
      });
    }

    return { meta, text, html, attachments };
  } finally {
    lock.release();
  }
}

// ============================================================================
// FUNÇÃO: APLICAR FILTROS DE EMAIL
// ============================================================================
function shouldProcessEmail(mail) {
  // Filtro 1: Ignorar emails sem assunto
  if (!mail.subject || mail.subject.trim() === "") {
    logger.info("Email ignorado: sem assunto");
    return false;
  }

  // Filtro 2: Ignorar emails de notificação automática
  const autoReplyIndicators = [
    "automatic reply",
    "out of office",
    "resposta automática",
    "fora do escritório",
    "noreply",
    "no-reply",
  ];

  const subjectLower = mail.subject.toLowerCase();
  const fromLower = (mail.from?.text || "").toLowerCase();

  for (const indicator of autoReplyIndicators) {
    if (subjectLower.includes(indicator) || fromLower.includes(indicator)) {
      logger.info(`Email ignorado: resposta automática detectada`);
      return false;
    }
  }

  // Filtro 3: Aceitar todos os outros emails
  return true;
}

// ============================================================================
// LOOP DE MONITORAMENTO
// ============================================================================
async function handleNewMessages(uids) {
  for (const uid of uids) {
    try {
      const { meta, text, html, attachments } = await fetchMessageData(uid);
      const subject = meta.envelope?.subject || "Sem assunto";
      const fromText = meta.envelope?.from?.map((a) => `${a.name || ""} <${a.address}>`).join(", ") || "desconhecido";
      const toText = meta.envelope?.to?.map((a) => `${a.name || ""} <${a.address}>`).join(", ") || "";
      const mail = { subject, from: { text: fromText }, to: { text: toText } };

      logger.info("=".repeat(80));
      logger.info(`[${uid}-${Date.now()}] Novo email detectado`);
      logger.info(`Assunto: ${subject}`);
      logger.info(`De: ${fromText}`);
      logger.info(`Para: ${toText}`);

      if (!shouldProcessEmail(mail)) {
        logger.info(`[${uid}] Email não passou nos filtros - ignorado`);
        continue;
      }

      const emailPayload = {
        subject,
        from: fromText,
        to: toText,
        date: new Date().toISOString(),
        text: text || "",
        html: html || "",
        attachments,
      };

      logger.info(`[${uid}] Payload montado - tamanho: ${JSON.stringify(emailPayload).length} bytes`);
      const result = await sendWebhook(emailPayload);
      logger.info(`[${uid}] Processamento concluído com sucesso`);
      logger.info(`Resposta: ${JSON.stringify(result)}`);
    } catch (error) {
      logger.error(`[${uid}] Erro ao processar email: ${error.message}`);
    } finally {
      logger.info("=".repeat(80));
    }
  }
}

async function startMonitor() {
  await createClient();
  client.on("error", async (err) => {
    logger.error(`Erro no IMAP: ${err.message}`);
  });
  await client.connect();
  await client.mailboxOpen("INBOX");

  // Buscar não lidos ao iniciar
  const unseen = await client.search({ seen: false });
  if (unseen.length) await handleNewMessages(unseen);

  // Escutar novos emails
  client.on("exists", async () => {
    const uids = await client.search({ seen: false });
    if (uids.length) await handleNewMessages(uids);
  });
}

// (Eventos legacy do mail-listener5 removidos na migração para ImapFlow)

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================
logger.info("=".repeat(80));
logger.info("EMAIL MONITOR SERVICE - INICIANDO");
logger.info("=".repeat(80));
logger.info(`Usuário IMAP: ${process.env.GMAIL_USER}`);
logger.info(`Host IMAP: ${process.env.IMAP_HOST}:${process.env.IMAP_PORT}`);
logger.info(`Webhook URL: ${process.env.WEBHOOK_URL}`);
logger.info(`Ambiente: ${process.env.NODE_ENV || "development"}`);
logger.info("=".repeat(80));

startMonitor()
  .then(() => logger.info("Monitor de emails em execução - aguardando novos emails..."))
  .catch((err) => {
    logger.error(`Falha ao iniciar monitor: ${err.message}`);
    process.exit(1);
  });

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================
const shutdown = async (signal) => {
  logger.info(`\nRecebido sinal ${signal} - encerrando gracefully...`);

  try {
    if (client) { await client.logout(); }
  } catch (e) {
    logger.warn(`Falha ao encerrar IMAP: ${e.message}`);
  }

  setTimeout(() => {
    logger.info("Monitor de emails encerrado");
    process.exit(0);
  }, 1000);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// ============================================================================
// TRATAMENTO DE ERROS NÃO CAPTURADOS
// ============================================================================
process.on("uncaughtException", (error) => {
  logger.error(`Exceção não capturada: ${error.message}`);
  logger.error(error.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Promise rejeitada não tratada em: ${promise}`);
  logger.error(`Razão: ${reason}`);
});