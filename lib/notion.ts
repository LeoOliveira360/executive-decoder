import { Client } from '@notionhq/client';

// ============================================================================
// INICIALIZAR CLIENTE NOTION
// ============================================================================
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID || '';

// ============================================================================
// TIPOS
// ============================================================================
interface CreateNotionPageParams {
  subject: string;
  from: string;
  date: string;
  insights: string;
  actionItems: string[];
  priority: 'Alta' | 'Média' | 'Baixa';
  // Campos opcionais para produtividade (adicionados somente se definidos)
  tipoFonte?: 'Texto' | 'URL' | 'PDF';
  framework?: 'Híbrida' | 'SWOT' | 'PESTEL' | 'Priorização' | 'Riscos' | 'Canvas';
  urlOrigem?: string;
  scoreConfianca?: number; // 0-10
  impacto?: 'Alto' | 'Médio' | 'Baixo';
  esforco?: 'Alto' | 'Médio' | 'Baixo';
  roi?: 'Alto' | 'Médio' | 'Baixo';
  tags?: string[]; // multi-select
  responsavelId?: string; // people → user id do Notion (opcional)
  prazoSugeridoISO?: string; // date
  origemAnalise?: 'Manual' | 'Webhook Email';
  correlationId?: string;
  contentHash?: string;
  whatsappLink?: string;
  appLink?: string;
  ultimaAtualizacaoISO?: string;
}

interface NotionPageResult {
  success: boolean;
  pageUrl: string;
  pageId: string;
}

// ============================================================================
// CONSTANTES E HELPERS
// ============================================================================
const MAX_RICH_TEXT = 1900; // margem de segurança abaixo dos ~2000 chars
const APPEND_BATCH_SIZE = 80; // número conservador de blocks por append

/**
 * Divide um texto em pedaços seguros para rich_text do Notion
 */
function chunkRichText(text: string, maxLength: number = MAX_RICH_TEXT): { text: { content: string } }[] {
  const chunks: { text: { content: string } }[] = [];
  let remaining = text || '';
  while (remaining.length > maxLength) {
    let slice = remaining.slice(0, maxLength);
    // tentar cortar em limite de palavra
    const lastSpace = slice.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.6) {
      slice = slice.slice(0, lastSpace);
    }
    chunks.push({ text: { content: slice } });
    remaining = remaining.slice(slice.length);
  }
  if (remaining.length) chunks.push({ text: { content: remaining } });
  return chunks;
}

/**
 * Conversão simples de Markdown para blocks do Notion (subset)
 * Suporta: headings (###/##), listas numeradas e com bullets, parágrafos,
 * quotes e divisores (---). Mantém fallback em parágrafos
 */
export function markdownToBlocks(markdown: string): any[] {
  if (!markdown || typeof markdown !== 'string') return [];

  const lines = markdown.split('\n');
  const blocks: any[] = [];
  let listBuffer: { type: 'bulleted' | 'numbered'; items: string[] } | null = null;

  const flushList = () => {
    if (!listBuffer) return;
    if (listBuffer.type === 'bulleted') {
      for (const item of listBuffer.items) {
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: chunkRichText(item),
          },
        });
      }
    } else {
      for (const item of listBuffer.items) {
        blocks.push({
          object: 'block',
          type: 'numbered_list_item',
          numbered_list_item: {
            rich_text: chunkRichText(item),
          },
        });
      }
    }
    listBuffer = null;
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/g, '');

    // Divider
    if (/^\s*---\s*$/.test(line)) {
      flushList();
      blocks.push({ object: 'block', type: 'divider', divider: {} });
      continue;
    }

    // Headings (### > heading_3, ## > heading_2)
    const h3 = line.match(/^###\s+(.+)/);
    if (h3) {
      flushList();
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: { rich_text: chunkRichText(h3[1].trim()) },
      });
      continue;
    }
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      flushList();
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: chunkRichText(h2[1].trim()) },
      });
      continue;
    }

    // Quote
    const q = line.match(/^>\s+(.+)/);
    if (q) {
      flushList();
      blocks.push({
        object: 'block',
        type: 'quote',
        quote: { rich_text: chunkRichText(q[1].trim()) },
      });
      continue;
    }

    // Lists
    const bul = line.match(/^[-\*]\s+(.+)/);
    if (bul) {
      if (!listBuffer) listBuffer = { type: 'bulleted', items: [] };
      listBuffer.items.push(bul[1].trim());
      continue;
    }
    const num = line.match(/^\d+\.\s+(.+)/);
    if (num) {
      if (!listBuffer) listBuffer = { type: 'numbered', items: [] };
      listBuffer.items.push(num[1].trim());
      continue;
    }

    // Empty line => separador de parágrafo
    if (!line.trim()) {
      flushList();
      continue;
    }

    // Paragraph
    flushList();
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: { rich_text: chunkRichText(line) },
    });
  }

  flushList();
  return blocks;
}

/**
 * Append de blocks paginado com retries simples
 */
async function appendBlocksInBatches(pageId: string, children: any[]): Promise<number> {
  let appended = 0;
  for (let i = 0; i < children.length; i += APPEND_BATCH_SIZE) {
    const batch = children.slice(i, i + APPEND_BATCH_SIZE);
    // retries
    let attempt = 0;
    // @ts-ignore - `notion` é importado acima
    while (attempt < 3) {
      try {
        await notion.blocks.children.append({
          block_id: pageId,
          children: batch,
        } as any);
        appended += batch.length;
        break;
      } catch (e: any) {
        attempt++;
        if (attempt >= 3) throw e;
        await new Promise((r) => setTimeout(r, 300 * attempt));
      }
    }
  }
  return appended;
}

/**
 * Adiciona uma nova seção de análise (divider + heading com timestamp + blocks convertidos)
 */
export async function appendAnalysisSection(pageId: string, markdown: string, sectionTitle?: string): Promise<{ appended: number }>{
  const now = new Date().toISOString();
  const header = sectionTitle || `📎 Anexo de Análise (${now})`;
  const section: any[] = [
    { object: 'block', type: 'divider', divider: {} },
    { object: 'block', type: 'heading_3', heading_3: { rich_text: [{ text: { content: header } }] } },
  ];
  const converted = markdownToBlocks(markdown);
  const children = section.concat(converted);
  const appended = await appendBlocksInBatches(pageId, children);
  return { appended };
}

/**
 * Consulta página por Hash de Conteúdo (idempotência)
 */
export async function findPageByContentHash(hash: string): Promise<{ id: string; url: string } | null> {
  if (!DATABASE_ID) throw new Error('NOTION_DATABASE_ID não configurado');
  if (!hash) return null;
  const res = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: {
      property: 'Hash de Conteúdo',
      rich_text: { equals: hash },
    },
    page_size: 1,
  } as any);
  const page = (res as any).results?.[0];
  if (!page) return null;
  return { id: page.id, url: page.url };
}

/**
 * Atualiza propriedades básicas da página
 */
export async function updatePageProperties(pageId: string, properties: any): Promise<void> {
  await notion.pages.update({ page_id: pageId, properties } as any);
}

// ============================================================================
// FUNÇÃO: DIVIDIR TEXTO EM BLOCOS (máx 2000 chars por bloco)
// ============================================================================
function splitIntoBlocks(text: string, maxLength: number = 1900): string[] {
  const blocks: string[] = [];
  let current = '';

  const lines = text.split('\n');

  for (const line of lines) {
    if ((current + line + '\n').length > maxLength) {
      if (current) {
        blocks.push(current.trim());
        current = '';
      }

      if (line.length > maxLength) {
        // Linha única muito longa - dividir por palavras
        const words = line.split(' ');
        for (const word of words) {
          if ((current + word + ' ').length > maxLength) {
            blocks.push(current.trim());
            current = word + ' ';
          } else {
            current += word + ' ';
          }
        }
      } else {
        current = line + '\n';
      }
    } else {
      current += line + '\n';
    }
  }

  if (current.trim()) {
    blocks.push(current.trim());
  }

  return blocks;
}

// ============================================================================
// FUNÇÃO: CRIAR PÁGINA NO NOTION
// ============================================================================
export async function createNotionPage(
  params: CreateNotionPageParams
): Promise<NotionPageResult> {
  try {
    console.log(`[Notion] Criando página para: ${params.subject}`);

    // Validar configuração
    if (!DATABASE_ID) {
      throw new Error('NOTION_DATABASE_ID não configurado');
    }

    if (!process.env.NOTION_API_KEY) {
      throw new Error('NOTION_API_KEY não configurado');
    }

    // Converter insights (Markdown) para blocks do Notion
    const converted = markdownToBlocks(params.insights);

    // Montar blocos iniciais (heading + primeiros N blocks) para criação
    const contentBlocks: any[] = [];
    contentBlocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: { rich_text: [{ text: { content: '🔑 Análise Completa' } }] },
    });

    const INITIAL_CREATE_LIMIT = 20;
    for (const b of converted.slice(0, INITIAL_CREATE_LIMIT)) {
      contentBlocks.push(b);
    }

    // Seção: Action Items (se existirem)
    if (params.actionItems.length > 0) {
      contentBlocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              text: {
                content: '⚡ Itens de Ação',
              },
            },
          ],
        },
      });

      for (const item of params.actionItems.slice(0, 20)) {
        contentBlocks.push({
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [
              {
                text: {
                  content: item,
                },
              },
            ],
            checked: false,
          },
        });
      }
    }

    // Divider
    contentBlocks.push({
      object: 'block',
      type: 'divider',
      divider: {},
    });

    // Criar página
    const properties: any = {
        // Title (nome exato deve corresponder ao Notion)
        '📧 Assunto': {
          title: [
            {
              text: {
                content: params.subject.substring(0, 100),
              },
            },
          ],
        },

        // Status
        'Status': {
          select: {
            name: 'Pendente',
          },
        },

        // Data
        '📅 Data Recebimento': {
          date: {
            start: params.date,
          },
        },

        // Email
        '👤 Remetente': {
          email: params.from.includes('<')
            ? params.from.match(/<(.+)>/)?.[1] || params.from
            : params.from,
        },

        // Prioridade
        '🎯 Prioridade': {
          select: {
            name: params.priority,
          },
        },
    };

    // Campos opcionais (apenas se definidos no DB e na chamada)
    if (params.tipoFonte) {
      properties['Tipo de Fonte'] = { select: { name: params.tipoFonte } };
    }
    if (params.framework) {
      properties['Framework'] = { select: { name: params.framework } };
    }
    if (params.urlOrigem) {
      properties['URL de Origem'] = { url: params.urlOrigem };
    }
    if (typeof params.scoreConfianca === 'number') {
      properties['Score de Confiança'] = { number: params.scoreConfianca };
    }
    if (params.impacto) {
      properties['Impacto'] = { select: { name: params.impacto } };
    }
    if (params.esforco) {
      properties['Esforço'] = { select: { name: params.esforco } };
    }
    if (params.roi) {
      properties['ROI Estimado'] = { select: { name: params.roi } };
    }
    if (params.tags && params.tags.length) {
      properties['Tags/Temas'] = {
        multi_select: params.tags.map((t) => ({ name: t })),
      };
    }
    if (params.prazoSugeridoISO) {
      properties['Prazo Sugerido'] = { date: { start: params.prazoSugeridoISO } };
    }
    if (params.origemAnalise) {
      properties['Origem da Análise'] = { select: { name: params.origemAnalise } };
    }
    if (params.correlationId) {
      properties['ID de Correlação'] = { rich_text: [{ text: { content: params.correlationId } }] };
    }
    if (params.contentHash) {
      properties['Hash de Conteúdo'] = { rich_text: [{ text: { content: params.contentHash } }] };
    }
    if (params.whatsappLink) {
      properties['Link WhatsApp'] = { url: params.whatsappLink };
    }
    if (params.appLink) {
      properties['Link da Análise'] = { url: params.appLink };
    }
    if (params.ultimaAtualizacaoISO) {
      properties['Última Atualização'] = { date: { start: params.ultimaAtualizacaoISO } };
    }
    if (params.responsavelId) {
      properties['Responsável'] = { people: [{ id: params.responsavelId }] };
    }

    const response = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties,
      children: contentBlocks,
    });

    console.log(`[Notion] ✓ Página criada: ${(response as any).url}`);

    // Append restante dos blocks de análise (se houver)
    const leftover = converted.slice(INITIAL_CREATE_LIMIT);
    if (leftover.length > 0) {
      const appended = await appendBlocksInBatches(response.id, leftover);
      console.log(`[Notion] Blocks de análise anexados: ${appended}`);
    }

    return {
      success: true,
      pageUrl: (response as any).url,
      pageId: response.id,
    };
  } catch (error: any) {
    console.error(`[Notion] ✗ Erro ao criar página: ${error.message}`);

    if (error.code === 'object_not_found') {
      throw new Error('Database não encontrado - verifique NOTION_DATABASE_ID');
    }

    if (error.code === 'unauthorized') {
      throw new Error('Não autorizado - verifique NOTION_API_KEY e conexão do database');
    }

    if (error.code === 'validation_error') {
      console.error('[Notion] Detalhes do erro:', JSON.stringify(error.body, null, 2));
      throw new Error(`Erro de validação: ${error.message}`);
    }

    throw error;
  }
}