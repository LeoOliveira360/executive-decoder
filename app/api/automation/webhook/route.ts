import { NextRequest } from 'next/server';
import { EmailPayload, WebhookResponse, AnalysisResult } from '@/lib/types';
import { createNotionPage } from '@/lib/notion';
import { sendWhatsAppNotification } from '@/lib/whatsapp';
import { extractActionItems, determinePriority } from '@/lib/processors';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 60;

// ============================================================================
// FUNÇÃO: VALIDAR WEBHOOK SECRET
// ============================================================================
function validateWebhookSecret(req: NextRequest): boolean {
  const secret = req.headers.get('x-webhook-secret');
  const expectedSecret = process.env.WEBHOOK_SECRET;

  if (!expectedSecret) {
    console.error('WEBHOOK_SECRET não configurado no ambiente');
    return false;
  }

  return secret === expectedSecret;
}

// ============================================================================
// FUNÇÃO: CHAMAR API DE ANÁLISE (EXISTENTE)
// ============================================================================
async function analyzeEmailContent(emailData: EmailPayload): Promise<string> {
  const contentToAnalyze = `
ASSUNTO: ${emailData.subject}

DE: ${emailData.from}

DATA: ${emailData.date}

CONTEÚDO:
${emailData.text || emailData.html || 'Sem conteúdo'}

${emailData.attachments && emailData.attachments.length > 0 
  ? `\nANEXOS: ${emailData.attachments.map(a => a.filename).join(', ')}`
  : ''
}
`.trim();

  // Reutilizar lógica existente do /api/decode
  // Importar diretamente a função do Groq
  const Groq = require('groq-sdk').default;
  
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || '',
  });

  const ANALYSIS_PROMPT = `Você é um analista executivo especializado em extrair insights acionáveis de emails corporativos.

Analise o email abaixo e retorne uma análise estruturada em Markdown seguindo exatamente este formato:

### 🔑 Resumo Executivo
[Parágrafo de 2-3 linhas com o ponto principal do email]

### 📊 Principais Insights
- Insight 1
- Insight 2
- Insight 3

### ⚡ Ações Recomendadas
- Ação 1 [Prazo: X dias]
- Ação 2 [Responsável: Y]
- Ação 3 [Prioridade: Alta/Média/Baixa]

### 🎯 Próximos Passos
[Parágrafo de 2-3 linhas com direcionamento estratégico]

---

EMAIL A ANALISAR:
${contentToAnalyze}`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: ANALYSIS_PROMPT }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return completion.choices[0]?.message?.content || 'Erro ao gerar análise';
  } catch (error: any) {
    console.error('Erro ao chamar Groq:', error.message);
    throw new Error(`Falha na análise: ${error.message}`);
  }
}

// ============================================================================
// HANDLER PRINCIPAL
// ============================================================================
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  console.log('='.repeat(80));
  console.log('WEBHOOK RECEBIDO');
  console.log('='.repeat(80));

  try {
    // PASSO 1: Validar autenticação
    if (!validateWebhookSecret(req)) {
      console.error('Tentativa de acesso não autorizada');
      return Response.json(
        { error: 'Unauthorized - Invalid webhook secret' },
        { status: 401 }
      );
    }

    console.log('✓ Webhook secret validado');

    // PASSO 2: Parse do payload
    const emailData: EmailPayload = await req.json();

    console.log('✓ Payload recebido:');
    console.log(`  Assunto: ${emailData.subject}`);
    console.log(`  De: ${emailData.from}`);
    console.log(`  Data: ${emailData.date}`);
    console.log(`  Anexos: ${emailData.attachments?.length || 0}`);

    // PASSO 3: Validar campos obrigatórios
    if (!emailData.subject || !emailData.from) {
      console.error('Payload inválido: campos obrigatórios ausentes');
      return Response.json(
        { error: 'Invalid payload - missing required fields' },
        { status: 400 }
      );
    }

    // PASSO 4: Análise com IA
    console.log('Iniciando análise com Groq...');
    const analysisText = await analyzeEmailContent(emailData);
    console.log('✓ Análise concluída');

    // PASSO 5: Processar resultado da análise
    const actionItems = extractActionItems(analysisText);
    const priority = determinePriority(emailData.subject, analysisText);

    const analysis: AnalysisResult = {
      text: analysisText,
      insights: analysisText,
      actionItems,
      priority,
    };

    console.log(`✓ Action items extraídos: ${actionItems.length}`);
    console.log(`✓ Prioridade classificada: ${priority}`);

    // Identificadores para rastreabilidade / idempotência
    const correlationId = crypto
      .createHash('sha256')
      .update(`${emailData.subject}|${emailData.from}|${emailData.date}|${emailData.attachments?.reduce((s,a)=>s+(a.size||0),0) || 0}`)
      .digest('hex')
      .slice(0, 32);

    const contentHash = crypto
      .createHash('sha256')
      .update(analysisText)
      .digest('hex')
      .slice(0, 32);

    // PASSO 6: Criar página no Notion
    console.log('Criando página no Notion...');
    const notionResult = await createNotionPage({
      subject: emailData.subject,
      from: emailData.from,
      date: emailData.date,
      insights: analysisText,
      actionItems,
      priority,
      origemAnalise: 'Webhook Email',
      correlationId,
      contentHash,
    });
    console.log(`✓ Página criada: ${notionResult.pageUrl}`);

    // PASSO 7: Enviar notificação WhatsApp
    console.log('Enviando notificação WhatsApp...');
    const whatsappResult = await sendWhatsAppNotification({
      subject: emailData.subject,
      from: emailData.from,
      notionUrl: notionResult.pageUrl,
      priority,
    });
    console.log(`✓ WhatsApp enviado: ${whatsappResult.messageSid}`);

    // PASSO 8: Resposta final
    const processingTime = Date.now() - startTime;

    console.log('='.repeat(80));
    console.log(`PROCESSAMENTO CONCLUÍDO EM ${processingTime}ms`);
    console.log('='.repeat(80));

    const response: WebhookResponse = {
      success: true,
      message: 'Email processado com sucesso',
      processingTime,
      notion: notionResult,
      whatsapp: whatsappResult,
      analysis,
    };

    return Response.json(response, { status: 200 });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;

    console.error('='.repeat(80));
    console.error(`ERRO NO PROCESSAMENTO (${processingTime}ms)`);
    console.error(error.message);
    console.error(error.stack);
    console.error('='.repeat(80));

    return Response.json(
      {
        error: 'Internal server error',
        message: error.message,
        processingTime,
      },
      { status: 500 }
    );
  }
}