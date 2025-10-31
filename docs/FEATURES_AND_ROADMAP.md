# Novos Recursos e Roadmap

Este documento resume os novos recursos pensados e o status atual de cada um, para guiar testes e contribuições.

## Recursos Implementados (MVP)
- **Exportação Manual para Notion**
  - Botão "🧠 Gerar no Notion" em `app/page.tsx`
  - Endpoint `POST /api/automation/manual-export`
  - Reuso de `processors.ts` e `lib/notion.ts`
  - Metadados suportados: Tipo de Fonte, Framework, URL de Origem, Score de Confiança (quando presente), Impacto/Esforço/ROI (priorização)
- **Notion Properties estendidas (opcionais)**
  - `lib/notion.ts` envia apenas quando valor existir; compatível com o schema atual
- **Id de correlação e hash (apenas no fluxo webhook)**
  - `app/api/automation/webhook/route.ts` gera `correlationId` e `contentHash` para rastreio

## Em Progresso / Próximos
- **Gmail OAuth (UI e fluxo VPS)**
  - Status: Desativado no UI via `NEXT_PUBLIC_GMAIL_DISABLED`
  - Motivo: VPS/IMAP em ajustes
  - Próximo passo: reativar CTA quando o fluxo de OAuth e refresh estiver validado
- **WhatsApp via Twilio**
  - Status: Implementado no código (`lib/whatsapp.ts`), depende de credenciais
  - Próximo passo: habilitar sandbox/configurar variáveis e ativar no fluxo manual quando desejado
- **Idempotência no Notion (manual-export)**
  - Status: presente no webhook (via hashes), manual ainda não usa
  - Próximo passo: aplicar mesmo hash à rota manual

## Itens Planejados
- Observabilidade (requestId ponta-a-ponta)
- Retries com backoff para Notion/Twilio em erros transitórios
- Testes unitários para `processors.ts` e um teste E2E controlado

## Link do Database para Testes
- Controle de Emails (Notion):
  - https://biografiapreta.notion.site/29c9400d7b02801a8b23c223be5be615?v=29c9400d7b028095accc000c2934c75c
