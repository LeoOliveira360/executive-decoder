# Testes da Aplicação Executive Decoder

Esta documentação descreve como testar o fluxo completo no ambiente local, validar a criação de páginas no Notion e confirmar o funcionamento dos novos recursos de exportação manual.

> Database do Notion utilizado nos testes: [Controle de Emails](https://biografiapreta.notion.site/29c9400d7b02801a8b23c223be5be615?v=29c9400d7b028095accc000c2934c75c)

## Pré‑requisitos
- Node.js 18+
- Variáveis em `.env.local`:
```
GROQ_API_KEY=...
NOTION_API_KEY=...
NOTION_DATABASE_ID=29c9400d7b02801a8b23c223be5be615
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GMAIL_DISABLED=true
```
- Garanta que o database Notion está compartilhado com sua Integration (Notion → botão "Share" → Add connections → sua integration).

## Iniciar o ambiente
```
npm install
npm run dev
```
Acesse `http://localhost:3000`.

## Fluxos de Teste

### 1) Gerar análise (Texto / URL / PDF)
1. Escolha a fonte: Texto, URL ou PDF e um framework (ex.: Híbrida, SWOT, PESTEL ...).
2. Clique em “Decodificar Agora”.
3. Aguarde a análise aparecer na seção “Inteligência Decodificada”.

Validações:
- A análise deve aparecer em Markdown (Resumo, Ações, etc.).
- Sem erros na aba de Console.

### 2) Exportar manualmente para o Notion (Frontend → API manual-export)
1. Com a análise visível, clique em “🧠 Gerar no Notion”.
2. O app envia para `POST /api/automation/manual-export`:
   - subject (derivado do primeiro heading da análise ou um fallback)
   - content (Markdown completo)
   - metadados: Tipo de Fonte, Framework e URL de Origem (quando aplicável)
3. Ao sucesso, um alerta exibe o link da página criada.

Validações no Notion:
- Acesse o database: [link](https://biografiapreta.notion.site/29c9400d7b02801a8b23c223be5be615?v=29c9400d7b028095accc000c2934c75c)
- Verifique a nova linha com:
  - 📧 Assunto preenchido
  - Status = Pendente
  - 📅 Data Recebimento = agora
  - 👤 Remetente = Manual (ou valor enviado)
  - 🎯 Prioridade = derivada do conteúdo
  - Corpo da página contém a análise completa e “⚡ Itens de Ação” como to_do blocks
  - Se presentes, metadados: Tipo de Fonte, Framework, URL de Origem, Score de Confiança, Impacto/Esforço/ROI

### 3) Erros comuns e correção
- validation_error: `NOTION_DATABASE_ID` inválido (limpe caracteres extras e confirme o ID)
- unauthorized: reconecte a Integration ao database (Share → Add connections)
- botão do Gmail habilitado: faltou `NEXT_PUBLIC_GMAIL_DISABLED=true` e reiniciar o dev server

## Testes via cURL (endpoint manual)
```
curl -X POST http://localhost:3000/api/automation/manual-export \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Teste Manual",
    "content": "## 📊 Análise\n\n- Item 1\n- Item 2\n\n### ⚡ Ações Imediatas\n- Agendar reunião com time de produto",
    "tipoFonte": "Texto",
    "framework": "Híbrida"
  }'
```
Resposta esperada:
```
{
  "success": true,
  "notion": { "success": true, "pageUrl": "https://www.notion.so/...", "pageId": "..." },
  "analysis": { "actionItems": [ ... ], "priority": "Média" }
}
```

## Troubleshooting rápido
- Reinicie o dev server após mudanças no `.env.local`.
- Limpe cache do Next.js quando necessário:
```
# PowerShell
Remove-Item -Recurse -Force .next, .turbo, node_modules\.cache -ErrorAction SilentlyContinue
npm run dev
```
- Verifique logs do terminal em tempo real ao exportar (erros do Notion são claros e apontam a causa).

## Critérios de Aceite
- Exportação cria a página no database informado, com propriedades mínimas e conteúdo completo.
- Nenhum segredo exposto no frontend. O fluxo manual não usa `WEBHOOK_SECRET`.
- Botão “Gerar no Notion” só aparece quando há `completion` e bloqueia durante o envio.
