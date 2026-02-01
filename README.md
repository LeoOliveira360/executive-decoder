

# Executive Decoder

> Decodifique artigos e documentos em insights executivos acionáveis em segundos. Criado em ~2 horas para demonstrar um fluxo real de “SaaS profissional” com Next.js 14, streaming e Vercel AI SDK.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC)
![Vercel%20AI%20SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-Gemini%2FOpenAI%2FGroq-000)
![Cheerio](https://img.shields.io/badge/Cheerio-Scraping-ff69b4)
![React%20Markdown](https://img.shields.io/badge/React%20Markdown-9-61dafb)

## Demonstração
- Imagens: `docs/screenshot-*.png` (opcional)
 - Documentação de Testes: `docs/TESTING.md`
 - Roadmap/Novos Recursos: `docs/FEATURES_AND_ROADMAP.md`

## Testing

Para instruções completas de como testar localmente, exportar análises para o Notion e realizar validações de ponta a ponta, consulte:

- [docs/TESTING.md](docs/TESTING.md)
 - [docs/NOTION_SETUP.md](docs/NOTION_SETUP.md) ← Guia atualizado para criar a Integration e o Database no Notion (inclui prompt para Notion AI)

## Recursos Principais
- **Quatro estados de UX claros**: Vazio, Carregando (skeleton), Resultado (Markdown), Erro.
- **Streaming de resposta**: experiência fluida durante a geração.
- **App Router (Next.js 14)**: estrutura moderna, rotas `app/api/*` e componentes client.
- **Markdown profissional**: renderizado via `react-markdown` com hierarquia visual coerente.
- **Formas de entrada**: Texto, URL (scraping via Cheerio) e PDF.

## Arquitetura e Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS.
- **Backend**: rotas serverless em `app/api/decode` com streaming.
- **AI**: Vercel AI SDK (compatível com Gemini/OpenAI/Groq). O blueprint original define um “Prompt Mestre” e uma estrutura de saída em Markdown (H3, bullets, 💡, ⚡).
- **Scraping**: Cheerio para parse de HTML.
- **Renderização**: `react-markdown` para exibir o resultado com fidelidade.

## Estrutura do Projeto
```
executive-decoder/
├── app/
│   ├── api/
│   │   └── decode/            # Endpoint de decodificação (streaming)
│   ├── layout.tsx             # Layout principal
│   ├── page.tsx               # Página inicial (UX principal)
│   └── globals.css            # Estilos globais
├── lib/
│   └── utils.ts               # Utilitários
├── package.json               # Dependências
├── tailwind.config.ts         # Configuração Tailwind
├── tsconfig.json              # Configuração TypeScript
└── next.config.js             # Configuração Next.js
```

## Início Rápido
1. Clone o repositório
```bash
git clone https://github.com/SEU_USUARIO/executive-decoder.git
cd executive-decoder
```
2. Instale dependências
```bash
npm install
```
3. Defina variáveis de ambiente em `.env.local`
```env
# IA (exemplos — use o provedor que estiver no seu backend)
GROQ_API_KEY="sua-chave-groq"
# ou
OPENAI_API_KEY="sua-chave-openai"
# ou
GOOGLE_GENERATIVE_AI_API_KEY="sua-chave-gemini"
```
4. Rode em desenvolvimento
```bash
npm run dev
```
5. Abra `http://localhost:3000`

## Deploy
- **Vercel (recomendado)**: push no Git → Preview/Production automáticos; APIs serverless e streaming funcionam sem ajustes.
- **Outros**: Firebase Hosting + Cloud Functions/Run requer mais configuração para SSR e streaming.

## Conectar Gmail (OAuth2) — MVP Guiado
Este fluxo permite que qualquer usuário conecte sua conta Gmail sem expor senha. Você autoriza o app e copia os tokens gerados para configurar o serviço de monitoramento de e‑mail.

### 1) Criar credenciais no Google Cloud
- Acesse Google Cloud Console → APIs & Services → Credentials.
- Crie um OAuth consent screen (External ou Internal) e publique (Testing ou In Production).
- Crie um OAuth Client ID do tipo Web Application.
  - Adicione em Authorized redirect URIs:
    - Dev: `http://localhost:3000/api/oauth/google/callback`
    - Prod: `https://SEU_DOMINIO/api/oauth/google/callback`

### 2) Configurar variáveis no app (Next.js)
Crie/edite `.env.local` na raiz do projeto:
```env
GOOGLE_CLIENT_ID=...      # do OAuth Client
GOOGLE_CLIENT_SECRET=...  # do OAuth Client
GOOGLE_REDIRECT_URI=http://localhost:3000/api/oauth/google/callback
```

### 3) Rodar o app e autorizar
```bash
npm install
npm run dev
# abra http://localhost:3000
```
Clique no botão "Conectar Gmail" (no topo da página). Ao autorizar, você verá um JSON com `access_token`, `refresh_token` etc.

### 4) Aplicar no serviço de monitoramento (email-monitor)
No diretório `email-monitor/.env`, configure:
```env





GMAIL_USER=seu-email@gmail.com
GOOGLE_CLIENT_ID=...         # mesmo do app
GOOGLE_CLIENT_SECRET=...     # mesmo do app
GOOGLE_REFRESH_TOKEN=...     # copie do callback OAuth (JSON)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_TLS=true
WEBHOOK_URL=https://SEU_APP/api/automation/webhook
WEBHOOK_SECRET=chave-secreta
LOG_LEVEL=info
NODE_ENV=production
```

### 5) Registrar escopos
No Google Cloud, garanta o escopo: `https://mail.google.com/` no consent screen (Sensitive scope). Caso necessário, mantenha em modo Testing e adicione os test users.

### 6) Dicas de produção
- Redirect URI em produção deve usar HTTPS do seu domínio/Vercel.
- O endpoint `WEBHOOK_URL` deve ser público e seguro.
- Guarde `refresh_token` com segurança; o serviço usará ele para obter `access_token` automaticamente.

### 7) Resolver problemas comuns
- Se não aparecer `refresh_token`, repita o consent (use `prompt=consent`) e verifique o `access_type=offline`.
- Se a autorização falhar, valide `GOOGLE_REDIRECT_URI` e as URIs cadastradas no OAuth Client.
- Gmail IMAP precisa estar ativado nas configurações da conta.

### Visualizar a Análise no Notion
- A visão "Tabela Completa" mostra apenas as propriedades do Database (ex.: Assunto, Status, Prioridade). O conteúdo integral da análise é criado como blocks dentro da página do Notion, não em uma coluna.
- Para ver a análise completa:
  1. Clique na linha correspondente no Database `Controle de Emails`.
  2. Abra a entrada em "Abrir como página".
  3. Você verá o heading "🔑 Análise Completa" seguido das seções (headings, listas, quotes e divisores) preservadas.
- Os itens de ação são adicionados como `to_do` blocks dentro da mesma página (por opção de design), não como páginas separadas do Kanban.
- Em reenvios da mesma análise, a página existente é atualizada com uma seção "🔁 Atualização de Análise" e a data em `Última Atualização`.

## Como Usar (Passo a Passo)
### Básico
- Cole a URL do artigo → clique em “Alavancar Agora” → copie a análise (botão “Copiar Análise”).

### Intermediário
- Selecione o método (framework) e a fonte de entrada (Texto/URL/PDF).
- Para PDF: arraste o arquivo (até ~30 páginas) e envie.

### Avançado
- Ajuste o “Prompt Mestre” no backend (se aplicável) para personalizar o estilo de saída.
- Personalize a renderização do Markdown (ex.: classes do Tailwind Typography se desejar).

## Variáveis de Ambiente (Detalhado)
- `GROQ_API_KEY` ou `OPENAI_API_KEY` ou `GOOGLE_GENERATIVE_AI_API_KEY` dependendo do provedor utilizado no backend.
- Configure também na plataforma de deploy (ex.: Vercel → Project Settings → Environment Variables).

## Troubleshooting
- **URL privada ou bloqueada**: tente artigos públicos; bloqueios de paywall impedem scraping.
- **PDF muito grande**: reduza o tamanho/ páginas; limites variam por ambiente.
- **Timeouts**: verifique logs da plataforma e aumente limites se possível.
- **Streaming não aparece**: confirme suporte a streams no ambiente e no navegador.
- **CORS/Headers**: como o Next.js roda o backend junto, raramente ocorre; se usar domínios distintos, configure CORS.

## FAQ
- Posso usar outro provedor de IA? Sim, via Vercel AI SDK (OpenAI, Groq, Gemini etc.).
- Posso trocar o layout? Sim, as mudanças de UX são isoladas na `app/page.tsx`.
- O scraping quebra? Sites dinâmicos/JS pesado podem exigir fallback (ex.: via APIs de conteúdo ou puppeteer/Playwright).
- A saída não está no formato esperado? Ajuste o Prompt Mestre e valide os tokens/limites.
- Preciso de Tailwind Typography? Opcional, mas melhora a leitura do Markdown.

## Roadmap
- Modo “Comparar duas fontes” (A/B de artigos)
- Exportação para PDF/Notion
- Templates de prompts específicos por indústria

## Contribuindo
- Abra uma issue para discutir mudanças.
- Faça PRs focados e documentados: descrição clara, motivação e screenshots.
- Padrão de commits sugerido: `feat:`, `fix:`, `docs:`, `chore:`.

## Licença
- Este projeto é distribuído sob a licença MIT. Veja `LICENSE` para detalhes.

## Créditos e Agradecimentos
- Next.js, React, Tailwind CSS, Vercel AI SDK, Cheerio, React Markdown.
- Criado com apoio de IDEs modernas (ex.: Cursor) e modelos de IA (ex.: Groq, Claude, Gemini) para acelerar o fluxo.

## 👨‍💻 Autor
Leo Oliveira - Desenvolvedor e Estudioso de IA

Desenvolvido com ❤️ usando as aplicações e serviços citados acima.

## 🚀 Siga para Mais Conteúdo de IA
Estou criando uma nova aplicação de IA TODO DIA para demonstrar o poder da tecnologia e ajudar empreendedores a aumentar sua produtividade!

- 📱 Novidades diárias sobre ferramentas de IA
- 💼 Aplicações práticas para aumentar produtividade
- 🎓 Tutoriais de como implementar IA nos seus projetos
- 🔥 Dicas e truques para empreendedores

### 🌐 Conecte-se Comigo
- 🐙 GitHub: github.com/LeoOliveira360
- 💼 LinkedIn: leonardooliveira360
- 📸 Instagram: @LeoOliveira360
- 🌐 WINIIA: www.winiia.com.br

Não deixe de me seguir! Todo dia tem aplicação nova e muita novidade para todos que estão buscando aprender sobre IA, ferramentas de IA para empreendedores e produtividade! 🚀
