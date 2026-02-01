import twilio from 'twilio';

// ============================================================================
// TWILIO CLIENT LAZY INIT
// ============================================================================
function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID || '';
  const token = process.env.TWILIO_AUTH_TOKEN || '';
  if (!sid || !token) return null;
  try {
    return twilio(sid, token);
  } catch (_e) {
    return null;
  }
}

// ============================================================================
// TIPOS
// ============================================================================
interface SendWhatsAppParams {
  subject: string;
  from: string;
  notionUrl: string;
  priority: 'Alta' | 'Média' | 'Baixa';
}

interface WhatsAppResult {
  success: boolean;
  messageSid: string;
  status: string;
}

// ============================================================================
// FUNÇÃO: FORMATAR MENSAGEM WHATSAPP
// ============================================================================
function formatWhatsAppMessage(params: SendWhatsAppParams): string {
  const priorityEmoji = {
    'Alta': '🔴',
    'Média': '🟡',
    'Baixa': '🟢',
  }[params.priority];

  const message = `
${priorityEmoji} *Nova Análise de Email*

📧 *Assunto:* ${params.subject}

👤 *De:* ${params.from}

🎯 *Prioridade:* ${params.priority}

📝 *Ver análise completa:*
${params.notionUrl}

_Processado automaticamente pelo Executive Decoder_
`.trim();

  return message;
}

// ============================================================================
// FUNÇÃO: ENVIAR NOTIFICAÇÃO WHATSAPP
// ============================================================================
export async function sendWhatsAppNotification(
  params: SendWhatsAppParams
): Promise<WhatsAppResult> {
  try {
    console.log(`[WhatsApp] Enviando notificação para: ${process.env.TWILIO_WHATSAPP_TO}`);

    // Short-circuit opcional
    if (process.env.WHATSAPP_ENABLED === 'false') {
      return { success: true, messageSid: 'disabled', status: 'skipped' };
    }

    // Validar configuracao e cliente
    const client = getTwilioClient();
    if (!client || !process.env.TWILIO_WHATSAPP_FROM || !process.env.TWILIO_WHATSAPP_TO) {
      console.warn('[WhatsApp] Desabilitado: variaveis ausentes, pulando envio');
      return { success: true, messageSid: 'disabled', status: 'skipped' };
    }

    // Formatar mensagem
    const messageBody = formatWhatsAppMessage(params);

    // Enviar via Twilio
    const message = await client.messages.create({
      body: messageBody,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: process.env.TWILIO_WHATSAPP_TO,
    });

    console.log(`[WhatsApp] ✓ Mensagem enviada: ${message.sid}`);
    console.log(`[WhatsApp] Status: ${message.status}`);

    return {
      success: true,
      messageSid: message.sid,
      status: message.status,
    };
  } catch (error: any) {
    console.error(`[WhatsApp] ✗ Erro ao enviar: ${error.message}`);

    if (error.code === 20003) {
      throw new Error('Twilio: Não autorizado - verifique credenciais');
    }

    if (error.code === 21211) {
      throw new Error('Twilio: Número de destino inválido');
    }

    if (error.code === 21608) {
      throw new Error('Twilio: Número de origem não habilitado para WhatsApp');
    }

    throw error;
  }
}