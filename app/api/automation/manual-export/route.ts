import { NextRequest } from 'next/server';
import { extractActionItems, determinePriority } from '@/lib/processors';
import { findPageByContentHash, appendAnalysisSection, updatePageProperties } from '@/lib/notion';
import crypto from 'crypto';
import { createNotionPage } from '@/lib/notion';

export const runtime = 'nodejs';

type Fonte = 'Texto' | 'URL' | 'PDF';
type Framework = 'Híbrida' | 'SWOT' | 'PESTEL' | 'Priorização' | 'Riscos' | 'Canvas';

interface ManualExportBody {
  subject: string;
  content: string; // markdown gerado no frontend
  from?: string;
  date?: string;
  tipoFonte?: Fonte;
  framework?: Framework;
  urlOrigem?: string;
}

// Extrai o score de confiança quando presente no markdown ("🎯 Score de Confiança da Análise: X/10")
function extractConfidenceScore(markdown: string): number | undefined {
  const m = markdown.match(/Score\s+de\s+Confiança[^:]*:\s*(\d{1,2})\s*\/\s*10/i);
  if (!m) return undefined;
  const n = Number(m[1]);
  return Number.isFinite(n) ? Math.max(0, Math.min(10, n)) : undefined;
}

// Heurísticas simples para impacto/esforço/roi quando existirem no conteúdo (framework de Priorização)
function extractPriorizationFields(markdown: string): { impacto?: 'Alto'|'Médio'|'Baixo'; esforco?: 'Alto'|'Médio'|'Baixo'; roi?: 'Alto'|'Médio'|'Baixo' } {
  const toLevel = (s?: string) => {
    if (!s) return undefined;
    const v = s.toLowerCase();
    if (v.includes('alto')) return 'Alto' as const;
    if (v.includes('médio') || v.includes('medio')) return 'Médio' as const;
    if (v.includes('baixo')) return 'Baixo' as const;
    return undefined;
  };

  const impacto = toLevel(markdown.match(/Impacto\s*:\s*([A-Za-zÀ-ÿ]+)/i)?.[1]);
  const esforco = toLevel(markdown.match(/Esfor\w*\s*:\s*([A-Za-zÀ-ÿ]+)/i)?.[1]);
  const roi = toLevel(markdown.match(/ROI\s*:\s*([A-Za-zÀ-ÿ]+)/i)?.[1]);

  return { impacto, esforco, roi };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ManualExportBody;

    if (!body || typeof body !== 'object') {
      return Response.json({ error: 'Body inválido' }, { status: 400 });
    }

    const subject = (body.subject || '').trim();
    const content = (body.content || '').trim();

    if (!subject) {
      return Response.json({ error: 'subject obrigatório' }, { status: 400 });
    }
    if (!content || content.length < 50) {
      return Response.json({ error: 'content inválido (mínimo 50 chars)' }, { status: 400 });
    }

    const from = body.from || 'Manual';
    const date = body.date || new Date().toISOString();

    // Processamento reutilizando a mesma lógica do webhook
    const actionItems = extractActionItems(content);
    const priority = determinePriority(subject, content);

    const scoreConfianca = extractConfidenceScore(content);
    const pri = extractPriorizationFields(content);

    const appLink = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}` : undefined;

    // Idempotência por Hash de Conteúdo
    const contentHash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 32);
    console.log('[manual-export] contentHash:', contentHash);
    const existing = await findPageByContentHash(contentHash).catch((e) => {
      console.warn('[manual-export] findPageByContentHash falhou:', e?.message);
      return null;
    });

    if (existing?.id) {
      // Atualizar propriedades básicas e anexar nova seção
      console.log('[manual-export] Página existente encontrada, atualizando properties e anexando seção...');
      await updatePageProperties(existing.id, {
        'Link da Análise': appLink ? { url: appLink } : undefined,
        'Última Atualização': { date: { start: new Date().toISOString() } },
      });

      const { appended } = await appendAnalysisSection(existing.id, content, '🔁 Atualização de Análise');
      console.log('[manual-export] Blocks anexados:', appended);

      // Adicionar seção de to_dos (evitando duplicatas internas)
      if (actionItems.length) {
        await appendAnalysisSection(existing.id, [
          '---',
          '## ⚡ Itens de Ação (Atualização)',
          ...Array.from(new Set(actionItems)).slice(0, 20).map(i => `- ${i}`),
        ].join('\n'));
      }

      const resp = {
        success: true,
        notion: { pageUrl: existing.url, pageId: existing.id },
        metrics: { appendedBlocks: appended, todosCount: actionItems.length },
        analysis: { actionItems, priority },
        idempotent: true,
      };
      console.log('[manual-export] response:', JSON.stringify(resp));
      return Response.json(resp);
    }

    console.log('[manual-export] Criando nova página no Notion...');
    const notion = await createNotionPage({
      subject,
      from,
      date,
      insights: content,
      actionItems,
      priority,
      tipoFonte: body.tipoFonte,
      framework: body.framework,
      urlOrigem: body.urlOrigem,
      scoreConfianca,
      impacto: pri.impacto,
      esforco: pri.esforco,
      roi: pri.roi,
      origemAnalise: 'Manual',
      appLink,
      ultimaAtualizacaoISO: new Date().toISOString(),
      contentHash,
    });

    const resp = {
      success: true,
      notion,
      analysis: { actionItems, priority },
      metrics: { createdBlocks: true, todosCount: actionItems.length },
    };
    console.log('[manual-export] response:', JSON.stringify(resp));
    return Response.json(resp);
  } catch (error: any) {
    return Response.json({ error: 'Falha ao exportar para Notion', message: error.message }, { status: 500 });
  }
}


