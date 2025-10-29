'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function WikiPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Visão Geral', icon: '🏠' },
    { id: 'metodologias', title: 'Metodologias', icon: '📊' },
    { id: 'swot', title: 'SWOT Analysis', icon: '💪' },
    { id: 'pestel', title: 'PESTEL Analysis', icon: '🌍' },
    { id: 'priorizacao', title: 'Priorização', icon: '⚡' },
    { id: 'riscos', title: 'Análise de Riscos', icon: '⚠️' },
    { id: 'canvas', title: 'Business Model', icon: '💼' },
    { id: 'hibrida', title: 'Híbrida', icon: '🔄' },
    { id: 'como-usar', title: 'Como Usar', icon: '🚀' },
    { id: 'faq', title: 'FAQ', icon: '❓' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Menu */}
      <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700 p-6 fixed h-screen overflow-y-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold gradient-text">
            ← Executive Decoder
          </Link>
        </div>

        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                activeSection === section.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{section.icon}</span>
                <span className="font-medium">{section.title}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="mt-12 pt-8 border-t border-gray-700">
          <Link 
            href="/"
            className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all inline-block text-center"
          >
            Começar Agora →
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 bg-gradient-to-br from-gray-900 to-gray-950">
        <div className="max-w-4xl mx-auto p-12">
          
          {/* Hero Section */}
          <div id="overview" className="mb-16 scroll-mt-8">
            <div className="mb-6">
              <h1 className="text-5xl font-extrabold gradient-text mb-4">
                Executive Decoder
              </h1>
              <p className="text-2xl text-gray-300 leading-relaxed">
                Sua vantagem competitiva em análise estratégica
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">🎯 O que fazemos</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                Transformamos documentos complexos em <strong className="text-purple-400">inteligência acionável</strong> usando 
                metodologias consagradas de análise estratégica. De 30 páginas para 30 segundos de insights críticos.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span>Análise baseada em frameworks de MBAs e consultorias globais</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span>Foco em dados reais, sem invenções ou suposições vazias</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <span>Economia de tempo: análises que levariam horas, em minutos</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">💎 Valor Estratégico</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="font-semibold text-purple-300">Velocidade</div>
                  <div className="text-sm text-gray-400">Decisões em minutos, não semanas</div>
                </div>
                <div>
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="font-semibold text-blue-300">Precisão</div>
                  <div className="text-sm text-gray-400">Análises baseadas em dados reais</div>
                </div>
                <div>
                  <div className="text-3xl mb-2">🚀</div>
                  <div className="font-semibold text-green-300">Vantagem</div>
                  <div className="text-sm text-gray-400">Insights que seus concorrentes não têm</div>
                </div>
              </div>
            </div>
          </div>

          {/* Metodologias Overview */}
          <div id="metodologias" className="mb-16 scroll-mt-8">
            <h2 className="text-4xl font-bold text-white mb-6">📊 Metodologias Disponíveis</h2>
            <p className="text-gray-300 mb-8 text-lg">
              Cada metodologia é uma ferramenta de elite usada por consultorias globais e estrategistas C-Level. 
              Escolha a que melhor se adapta ao seu momento de decisão.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <FrameworkCard
                icon="💪"
                title="SWOT Analysis"
                description="Estratégia completa: Forças, Fraquezas, Oportunidades, Ameaças"
                link="swot"
                bestFor="Avaliar posicionamento estratégico, planejamento de negócios, decisões de investimento"
              />
              <FrameworkCard
                icon="🌍"
                title="PESTEL Analysis"
                description="Análise macro: Político, Econômico, Social, Tecnológico, Ambiental, Legal"
                link="pestel"
                bestFor="Entender contexto externo, entrar em novos mercados, due diligence"
              />
              <FrameworkCard
                icon="⚡"
                title="Matriz de Priorização"
                description="Impacto × Esforço: maximize ROI com decisões inteligentes"
                link="priorizacao"
                bestFor="Otimizar recursos, focar no que importa, decidir o que fazer primeiro"
              />
              <FrameworkCard
                icon="⚠️"
                title="Análise de Riscos"
                description="Probabilidade × Impacto: identifique ameaças antes que aconteçam"
                link="riscos"
                bestFor="Mitigar riscos, compliance, proteção do negócio"
              />
              <FrameworkCard
                icon="💼"
                title="Business Model Canvas"
                description="Estrutura completa: proposta de valor, clientes, receitas, custos"
                link="canvas"
                bestFor="Validar modelo de negócio, startups, inovação"
              />
              <FrameworkCard
                icon="🔄"
                title="Metodologia Híbrida"
                description="Análise completa com múltiplas perspectivas em um só relatório"
                link="hibrida"
                bestFor="Visão 360°, análises executivas, primeiras impressões estratégicas"
              />
            </div>
          </div>

          {/* SWOT Analysis */}
          <div id="swot" className="mb-16 scroll-mt-8">
            <FrameworkDetail
              icon="💪"
              title="SWOT Analysis"
              subtitle="A estratégia definitiva dos grandes estrategistas"
              description="Criado pela Harvard Business School, usado por consultorias como McKinsey e BCG. É a arma secreta de CEOs para decisões complexas."
            >
              <div className="space-y-6">
                <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-purple-300 mb-3">🎓 Origens</h3>
                  <p className="text-gray-300">
                    Desenvolvido na década de 1960 por Albert Humphrey na Universidade de Stanford, 
                    o SWOT é usado há mais de 50 anos por empresas Fortune 500 para planejamento estratégico.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Como Funciona</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card title="💪 Forças" color="green">
                      O que você faz bem. Recursos, capacidades, vantagens competitivas internas.
                    </Card>
                    <Card title="⚠️ Fraquezas" color="red">
                      O que precisa melhorar. Limitações, desvantagens, gaps internos.
                    </Card>
                    <Card title="🌟 Oportunidades" color="blue">
                      Condições externas favoráveis. Mercados em crescimento, tendências, gaps.
                    </Card>
                    <Card title="⚡ Ameaças" color="orange">
                      Riscos externos. Competição, mudanças de mercado, regulações.
                    </Card>
                  </div>
                </div>

                <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-blue-300 mb-3">🎯 Por que usar</h3>
                  <p className="text-gray-300 mb-4">
                    O SWOT gera 4 matrizes de estratégias que transformam análise em ação:
                  </p>
                  <ul className="space-y-2 text-gray-300">
                    <li><strong className="text-blue-300">S-O:</strong> Use forças para capitalizar oportunidades</li>
                    <li><strong className="text-blue-300">W-O:</strong> Supere fraquezas para aproveitar oportunidades</li>
                    <li><strong className="text-blue-300">S-T:</strong> Use forças para minimizar ameaças</li>
                    <li><strong className="text-blue-300">W-T:</strong> Estratégias defensivas</li>
                  </ul>
                </div>

                <UseCaseExamples 
                  examples={[
                    "Decidir se entra em novo mercado",
                    "Avaliar proposta de aquisição",
                    "Planejamento estratégico anual",
                    "Validar posicionamento competitivo"
                  ]}
                />
              </div>
            </FrameworkDetail>
          </div>

          {/* PESTEL Analysis */}
          <div id="pestel" className="mb-16 scroll-mt-8">
            <FrameworkDetail
              icon="🌍"
              title="PESTEL Analysis"
              subtitle="A lente macro dos analistas globais"
              description="Usado por fundos de investimento e multinacionais para entender contexto. Indispensável para decisões que envolvem fatores externos."
            >
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <Card title="🏛️ Político" color="blue">Regulações, políticas governamentais, estabilidade</Card>
                  <Card title="💰 Econômico" color="green">Ciclos, inflação, taxa de câmbio, PIB</Card>
                  <Card title="👥 Social" color="purple">Demografia, cultura, tendências comportamentais</Card>
                  <Card title="💻 Tecnológico" color="cyan">Inovação, automação, disrupção</Card>
                  <Card title="🌱 Ambiental" color="emerald">Sustentabilidade, recursos, mudanças climáticas</Card>
                  <Card title="⚖️ Legal" color="amber">Compliance, leis que afetam o negócio</Card>
                </div>

                <div className="bg-green-600/10 border border-green-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-green-300 mb-3">💡 Quando usar</h3>
                  <p className="text-gray-300 mb-4">
                    PESTEL é especialmente valioso quando você está:
                  </p>
                  <ul className="space-y-2 text-gray-300">
                    <li>💼 <strong>Entrando em novos mercados</strong> - especialmente internacionais</li>
                    <li>📊 <strong>Fazendo due diligence</strong> - entender riscos externos de um investimento</li>
                    <li>🚀 <strong>Lançando produtos</strong> - validar timing e contexto de mercado</li>
                    <li>🏢 <strong>Tomando decisões de longo prazo</strong> - onde fatores externos têm peso crítico</li>
                  </ul>
                </div>
              </div>
            </FrameworkDetail>
          </div>

          {/* Matriz de Priorização */}
          <div id="priorizacao" className="mb-16 scroll-mt-8">
            <FrameworkDetail
              icon="⚡"
              title="Matriz de Priorização"
              subtitle="A arte de focar no que importa"
              description="Usado por COOs e gerentes de produto. Separa o essencial do acessório com precisão matemática."
            >
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border border-yellow-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-yellow-300 mb-3">📊 A Matriz</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="font-bold text-yellow-400 mb-2">🚀 FAÇA PRIMEIRO (Alto Impacto, Baixo Esforço)</div>
                      <p className="text-gray-300 text-sm">Quick Wins - Máximo retorno, mínimo investimento. Prioridade absoluta.</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="font-bold text-blue-400 mb-2">📊 PLANEJE (Alto Impacto, Alto Esforço)</div>
                      <p className="text-gray-300 text-sm">Grandes Projetos - Alto retorno mas requerem planejamento cuidadoso.</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="font-bold text-red-400 mb-2">⏰ DELEGUE/EVITE (Baixo Impacto, Alto Esforço)</div>
                      <p className="text-gray-300 text-sm">Time Killers - Elimine ou delegue. Não vale o investimento.</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="font-bold text-green-400 mb-2">📌 SE SOBRAR TEMPO (Baixo Impacto, Baixo Esforço)</div>
                      <p className="text-gray-300 text-sm">Low Priority - Apenas se recursos permitirem.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-blue-300 mb-3">💰 Valor Real</h3>
                  <p className="text-gray-300">
                    Esta metodologia economiza <strong className="text-blue-300">60-80% do seu tempo</strong> ao eliminar atividades 
                    de baixo valor. CEOs usam essa abordagem para focar equipes em resultados reais, não em "parecer ocupado".
                  </p>
                </div>
              </div>
            </FrameworkDetail>
          </div>

          {/* Análise de Riscos */}
          <div id="riscos" className="mb-16 scroll-mt-8">
            <FrameworkDetail
              icon="⚠️"
              title="Análise de Riscos"
              subtitle="Proteção estratégica para seu patrimônio"
              description="Metodologia de bancos de investimento e empresas de rating. Transforma incerteza em mitigação inteligente."
            >
              <div className="space-y-6">
                <div className="bg-red-600/10 border border-red-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-red-300 mb-3">🎲 A Matriz de Risco</h3>
                  <p className="text-gray-300 mb-4">
                    Cada risco é avaliado por <strong className="text-red-300">Probabilidade × Impacto</strong>:
                  </p>
                  <ul className="space-y-2 text-gray-300">
                    <li><strong className="text-red-400">🔴 Crítico:</strong> Alta probabilidade + Alto impacto - Ação imediata</li>
                    <li><strong className="text-orange-400">🟡 Alto:</strong> Média probabilidade + Alto impacto - Monitorar</li>
                    <li><strong className="text-green-400">🟢 Baixo:</strong> Baixa probabilidade + Baixo impacto - Aceitar</li>
                  </ul>
                </div>

                <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-purple-300 mb-3">🛡️ Você recebe</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>✅ Lista priorizada de riscos críticos a mitigar AGORA</li>
                    <li>✅ Plano de contingência para os 3 maiores riscos</li>
                    <li>✅ Sinais de alerta para detectar riscos antes de se materializarem</li>
                    <li>✅ Framework de monitoramento contínuo</li>
                  </ul>
                </div>
              </div>
            </FrameworkDetail>
          </div>

          {/* Business Model Canvas */}
          <div id="canvas" className="mb-16 scroll-mt-8">
            <FrameworkDetail
              icon="💼"
              title="Business Model Canvas"
              subtitle="A ferramenta de startups unicórnio"
              description="Criado por Alexander Osterwalder. Usado por Y Combinator, 500 Startups e aceleradoras de elite."
            >
              <div className="space-y-6">
                <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-blue-300 mb-3">🎯 Os 9 Componentes</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card title="Proposta de Valor" color="purple">Que problemas você resolve?</Card>
                    <Card title="Segmentos" color="blue">Para quem você cria valor?</Card>
                    <Card title="Canais" color="cyan">Como você atinge clientes?</Card>
                    <Card title="Relacionamento" color="emerald">Que relacionamento você estabelece?</Card>
                    <Card title="Fontes de Receita" color="green">Como você monetiza?</Card>
                    <Card title="Recursos-Chave" color="amber">Quais recursos são essenciais?</Card>
                    <Card title="Atividades-Chave" color="orange">Que atividades são críticas?</Card>
                    <Card title="Parceiros-Chave" color="red">Quem são seus aliados?</Card>
                    <Card title="Estrutura de Custos" color="pink">Quais são seus principais custos?</Card>
                  </div>
                </div>
              </div>
            </FrameworkDetail>
          </div>

          {/* Híbrida */}
          <div id="hibrida" className="mb-16 scroll-mt-8">
            <FrameworkDetail
              icon="🔄"
              title="Metodologia Híbrida"
              subtitle="A análise executiva completa"
              description="Combinação inteligente de múltiplas perspectivas. Ideal para quem quer uma visão 360° rapidamente."
            >
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-purple-300 mb-4">🎯 O que você recebe</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <strong className="text-white">Resumo Executivo</strong> - 3 insights críticos que importam agora
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <strong className="text-white">Ações Imediatas</strong> - O que fazer HOJE para capitalizar
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">❓</span>
                    <div>
                      <strong className="text-white">FAQ Auto-Gerado</strong> - As 5 perguntas críticas + respostas
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <strong className="text-white">Dados-Chave</strong> - Números e fatos que você precisa saber
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <strong className="text-white">Oportunidades</strong> - Onde está o dinheiro/vantagem competitiva
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <strong className="text-white">Score de Relevância</strong> - Aprovação profissional (X/10)
                    </div>
                  </li>
                </ul>
              </div>
            </FrameworkDetail>
          </div>

          {/* Como Usar */}
          <div id="como-usar" className="mb-16 scroll-mt-8">
            <h2 className="text-4xl font-bold text-white mb-6">🚀 Como Usar</h2>
            <div className="space-y-6">
              <Step number="1" title="Escolha sua Fonte">
                Cole texto, envie PDF (até 30 páginas) ou forneça uma URL de artigo/documento.
              </Step>
              <Step number="2" title="Selecione a Metodologia">
                Escolha o framework que melhor se adapta à sua decisão:
                <ul className="mt-3 space-y-2 text-gray-300">
                  <li>📊 <strong>SWOT</strong> para posicionamento estratégico</li>
                  <li>🌍 <strong>PESTEL</strong> para contexto de mercado</li>
                  <li>⚡ <strong>Priorização</strong> para focar recursos</li>
                  <li>⚠️ <strong>Riscos</strong> para proteção</li>
                  <li>💼 <strong>Business Model</strong> para inovação</li>
                  <li>🔄 <strong>Híbrida</strong> para visão completa</li>
                </ul>
              </Step>
              <Step number="3" title="Receba a Análise">
                Insights estruturados, baseados em dados reais do documento. Sem fluff, só valor.
              </Step>
              <Step number="4" title="Tome Decisões">
                Use os insights para decisões rápidas, acertadas e baseadas em evidências.
              </Step>
            </div>
          </div>

          {/* FAQ */}
          <div id="faq" className="mb-16 scroll-mt-8">
            <h2 className="text-4xl font-bold text-white mb-6">❓ Perguntas Frequentes</h2>
            <div className="space-y-4">
              <FAQItem 
                question="Os dados são reais ou inventados?"
                answer="100% reais. Extraímos APENAS do documento fornecido. Se algo não está no documento, admitimos claramente e sugerimos quais dados adicionais seriam necessários."
              />
              <FAQItem 
                question="Quanto tempo economizo?"
                answer="Analises que levariam 3-8 horas de trabalho de um analista, entregamos em 30-60 segundos. Multiplique isso por decisões frequentes e você tem ROI significativo."
              />
              <FAQItem 
                question="Preciso conhecer os frameworks?"
                answer="Não. Cada análise explica o framework usado e como interpretar os resultados. Aprenda durante o uso."
              />
              <FAQItem 
                question="Posso confiar nas análises?"
                answer="Sim, com ressalvas. Fornecemos o score de confiança (X/10) baseado na completude dos dados do documento. Se o documento tem gaps, você saberá exatamente quais são."
              />
              <FAQItem 
                question="Como escolher o framework certo?"
                answer="🎯 SWOT para decisões de negócio | 🌍 PESTEL para contexto externo | ⚡ Priorização para recursos limitados | ⚠️ Riscos para proteção | 💼 Canvas para modelos | 🔄 Híbrida quando não tem certeza"
              />
            </div>
          </div>

          <div className="mt-20 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para começar?
            </h2>
            <p className="text-gray-300 mb-6 text-lg">
              Transforme documentos em decisões acertadas. De 30 páginas para 30 segundos.
            </p>
            <Link 
              href="/"
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all glow-effect"
            >
              Analisar Documento Agora →
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}

// Componentes auxiliares
function FrameworkCard({ icon, title, description, link, bestFor }: any) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-3">{description}</p>
      <div className="text-sm text-purple-400 font-semibold">
        💡 {bestFor}
      </div>
    </div>
  );
}

function FrameworkDetail({ icon, title, subtitle, description, children }: any) {
  return (
    <>
      <div className="mb-6">
        <div className="text-6xl mb-4">{icon}</div>
        <h2 className="text-4xl font-bold text-white mb-2">{title}</h2>
        <p className="text-xl text-purple-300 mb-2">{subtitle}</p>
        <p className="text-gray-400 text-lg">{description}</p>
      </div>
      {children}
    </>
  );
}

function Card({ title, color, children }: any) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
      <h4 className={`font-bold text-${color}-400 mb-2`}>{title}</h4>
      <p className="text-gray-300 text-sm">{children}</p>
    </div>
  );
}

function UseCaseExamples({ examples }: any) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">💼 Casos de Uso Reais</h3>
      <div className="grid md:grid-cols-2 gap-3">
        {examples.map((ex: string, i: number) => (
          <div key={i} className="flex items-start gap-2 text-gray-300">
            <span className="text-green-400">✓</span>
            <span>{ex}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step({ number, title, children }: any) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center font-bold text-white">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <div className="text-gray-300">{children}</div>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: any) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-3">{question}</h3>
      <p className="text-gray-300">{answer}</p>
    </div>
  );
}
