# 📝 Guia Completo: Integração com Notion (Atualizado)

Este guia ensina como criar a Integration no Notion, montar o Database com todas as propriedades usadas pela aplicação, conectar a Integration ao Database, configurar variáveis e testar. Inclui um prompt pronto para a Notion AI criar a tabela automaticamente.

---

## Índice
- Visão Geral
- Parte 1: Criar a Integration (API Key)
- Parte 2: Criar o Database (Tabela)
- Parte 3: Conectar a Integration ao Database
- Parte 4: Obter Credenciais (API Key e Database ID)
- Parte 5: Configurar Ambiente (.env local e Vercel)
- Parte 6: Testar a Integração
- Troubleshooting
- Checklist Final

---

## Visão Geral
Fluxo: criar Integration → criar Database → conectar → configurar variáveis → testar → usar. Tempo estimado: 15–20 minutos.

---

## Parte 1: Criar a Integration
1. Acesse `https://www.notion.so/my-integrations` → [+ New integration].
2. Configure: Workspace (o seu), Type = Internal, Name = Executive Decoder Bot (ou outro). Submit.
3. Capabilities: marque Read content, Update content, Insert content.
4. Secrets: copie o Internal Integration Token (NOTION_API_KEY) e guarde com segurança.

---

## Parte 2: Criar o Database (Tabela)
Crie uma página no Notion (New page) e insira uma tabela ("/table" → Table – Inline). Renomeie/adicione colunas conforme abaixo.

### Estrutura obrigatória (nomes EXATOS)
- 📧 Assunto (Title)
- Status (Select: Pendente, Em Análise, Concluído)
- 📅 Data Recebimento (Date)
- 👤 Remetente (Email)
- 🎯 Prioridade (Select: Alta, Média, Baixa)

### Estrutura opcional recomendada (suportada pela aplicação)
- Tipo de Fonte (Select: Texto, URL, PDF)
- Framework (Select: Híbrida, SWOT, PESTEL, Priorização, Riscos, Canvas)
- URL de Origem (URL)
- Score de Confiança (Number)
- Impacto (Select: Alto, Médio, Baixo)
- Esforço (Select: Alto, Médio, Baixo)
- ROI Estimado (Select: Alto, Médio, Baixo)
- Tags/Temas (Multi-select)
- Responsável (People)
- Prazo Sugerido (Date)
- Origem da Análise (Select: Manual, Webhook Email)
- ID de Correlação (Rich text)
- Hash de Conteúdo (Rich text)
- Link WhatsApp (URL)
- Link da Análise (URL)
- Última Atualização (Date)

Observação: a análise completa é salva como blocks dentro da página (children). A visão de tabela mostra apenas as propriedades.

### Prompt para Notion AI (criar a tabela automaticamente)
Cole este prompt na Notion AI dentro da página e execute:

```text
Crie um Database (Table) chamado "Controle de Emails" com as seguintes properties (nomes EXATOS e tipos):

Obrigatórias:
- 📧 Assunto: Title
- Status: Select (Pendente, Em Análise, Concluído)
- 📅 Data Recebimento: Date
- 👤 Remetente: Email
- 🎯 Prioridade: Select (Alta, Média, Baixa)

Opcionais recomendadas:
- Tipo de Fonte: Select (Texto, URL, PDF)
- Framework: Select (Híbrida, SWOT, PESTEL, Priorização, Riscos, Canvas)
- URL de Origem: URL
- Score de Confiança: Number
- Impacto: Select (Alto, Médio, Baixo)
- Esforço: Select (Alto, Médio, Baixo)
- ROI Estimado: Select (Alto, Médio, Baixo)
- Tags/Temas: Multi-select
- Responsável: People
- Prazo Sugerido: Date
- Origem da Análise: Select (Manual, Webhook Email)
- ID de Correlação: Rich text
- Hash de Conteúdo: Rich text
- Link WhatsApp: URL
- Link da Análise: URL
- Última Atualização: Date

Regras: usar exatamente estes nomes; não remover o Title; não criar colunas extras; ao final, listar as properties criadas.
```

---

## Parte 3: Conectar a Integration ao Database
- Página do database → `•••` → Add connections → selecione a sua Integration → Confirm. Verifique em `•••` → Connections (Connected).

---

## Parte 4: Obter Credenciais
- NOTION_API_KEY: token `secret_...` da Integration.
- NOTION_DATABASE_ID: copie da URL do database (32 caracteres entre a última barra e `?v=`), sem o `?v=...`.

---

## Parte 5: Configurar Ambiente
Em `.env.local` na raiz do projeto:

```env
NOTION_API_KEY=secret_xxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Em produção (Vercel): adicione as mesmas variáveis em Settings → Environment Variables (Production, Preview, Development).

---

## Parte 6: Testar a Integração
1. Rode `npm run dev` e gere uma análise; clique em “🧠 Gerar no Notion”.
2. No Notion, veja a nova linha. Abra como página para ver a análise completa (headings, listas) e os `to_do`.
3. Reenvio do mesmo conteúdo atualiza a mesma página (idempotência por "Hash de Conteúdo").

---

## Troubleshooting
- object_not_found: Database ID incorreto ou Integration não conectada.
- unauthorized: API Key incorreta ou sem permissões.
- validation_error: nomes/tipos das properties divergentes.
- Select option not found: faltam opções em Status/Prioridade/etc.

---

## Checklist Final
- Integration criada com Read/Update/Insert ✅
- Database com todas as properties ✅
- Integration conectada ao Database ✅
- NOTION_API_KEY/NOTION_DATABASE_ID configuradas ✅
- Teste concluído com página criada e conteúdo visível ✅
