'use client';

import { useCompletion } from 'ai/react';
import ReactMarkdown from 'react-markdown';
import { useState, useRef, DragEvent } from 'react';
import Link from 'next/link';

type InputType = 'url' | 'pdf' | 'text';
type FrameworkType = 'hybrid' | 'swot' | 'pestel' | 'priorization' | 'risk' | 'business-model';

export default function HomePage() {
  const [inputType, setInputType] = useState<InputType>('text');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<FrameworkType>('hybrid');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { completion, isLoading, error, setCompletion, setInput } = useCompletion({
    api: '/api/decode',
  });

  // Handler para submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompletion(''); // Limpa resultado anterior

    const formData = new FormData();
    formData.append('inputType', inputType);
    formData.append('framework', selectedFramework);

    if (inputType === 'url') {
      if (!urlInput.trim()) {
        alert('Por favor, insira uma URL válida.');
        return;
      }
      formData.append('url', urlInput.trim());
    } else if (inputType === 'pdf') {
      if (!pdfFile) {
        alert('Por favor, selecione um arquivo PDF.');
        return;
      }
      formData.append('file', pdfFile);
    } else if (inputType === 'text') {
      if (textInput.trim().length < 100) {
        alert('Por favor, insira um texto com pelo menos 100 caracteres.');
        return;
      }
      formData.append('text', textInput.trim());
    }

    try {
      const response = await fetch('/api/decode', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao processar');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('Stream não disponível');

      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              // O conteúdo após "0:" é uma string JSON escapada
              const jsonContent = line.slice(2).trim();
              const content = JSON.parse(jsonContent);
              accumulatedText += content;
              setCompletion(accumulatedText);
            } catch (e) {
              // Fallback: se não for JSON válido, pegar o texto direto
              const content = line.slice(2);
              accumulatedText += content;
              setCompletion(accumulatedText);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Erro:', err);
      alert(err.message || 'Erro ao processar documento');
    }
  };

  // Handlers para Drag & Drop
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
        setInputType('pdf');
      } else {
        alert('Por favor, arraste apenas arquivos PDF');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setPdfFile(files[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="py-12 px-6 text-center border-b border-gray-800 bg-gray-900 relative">
        {/* Navigation */}
        <div className="absolute top-6 right-6">
          <Link
            href="/wiki"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg font-semibold transition-all inline-flex items-center gap-2"
          >
            📚 Documentação
          </Link>
        </div>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-100">
            Executive Decoder
          </h1>
          <h2 className="text-lg text-gray-400 mt-2">
            De 'Info-excesso' a 'Insight-Ação' em 5 segundos.
          </h2>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 container mx-auto px-6 py-12 max-w-7xl">
        {/* Seção: Por que usar */}
        {!completion && !isLoading && (
          <div className="mb-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-2xl p-6">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-4 text-white">
                  Para quem foi feito?
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">✓</span>
                    <span><strong>CEOs</strong> que precisam entender propostas complexas rápido</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">✓</span>
                    <span><strong>CTOs</strong> avaliando novas tecnologias ou vendors</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">✓</span>
                    <span><strong>Fundadores</strong> analisando oportunidades de negócio</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">✓</span>
                    <span><strong>Investidores</strong> que precisam de due diligence rápido</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
                <div className="text-sm text-gray-400 mb-3">EXEMPLO DE OUTPUT:</div>
                <div className="space-y-3 text-sm">
                  <div className="bg-purple-500/20 border-l-4 border-purple-500 p-3 rounded">
                    <div className="font-semibold text-purple-300">📊 Resumo Executivo</div>
                    <div className="text-gray-300 mt-2">1. Mercado de IA cresce 40% ao ano...</div>
                    <div className="text-gray-300">2. Competidores investem em RPA...</div>
                    <div className="text-gray-300">3. Oportunidade de $2M em 12 meses...</div>
                  </div>
                  <div className="bg-green-500/20 border-l-4 border-green-500 p-3 rounded">
                    <div className="font-semibold text-green-300">⚡ Ações Imediatas</div>
                    <div className="text-gray-300 mt-2">• Validar MVP com 3 clientes-chave até Q2...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* === INPUT SECTION === */}
          <div className="space-y-6 fade-in">
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-6">
              <h3 className="text-2xl font-bold mb-4 text-gray-100">📥 Selecione sua Fonte</h3>

              {/* SELETOR DE FRAMEWORK */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  🎯 Método de Análise
                </label>
                <select
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value as FrameworkType)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isLoading}
                >
                  <option value="hybrid">🔄 Metodologia Híbrida (Recomendado)</option>
                  <option value="swot">📊 SWOT Analysis</option>
                  <option value="pestel">🌍 PESTEL Analysis</option>
                  <option value="priorization">⚡ Matriz de Priorização</option>
                  <option value="risk">⚠️ Análise de Riscos</option>
                  <option value="business-model">💼 Business Model Canvas</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  {selectedFramework === 'hybrid' && 'Análise completa com múltiplas perspectivas'}
                  {selectedFramework === 'swot' && 'Forças, Fraquezas, Oportunidades e Ameaças'}
                  {selectedFramework === 'pestel' && 'Político, Econômico, Social, Tecnológico, Ambiental e Legal'}
                  {selectedFramework === 'priorization' && 'Priorize ações por Impacto x Esforço'}
                  {selectedFramework === 'risk' && 'Identifique e avalie riscos estratégicos'}
                  {selectedFramework === 'business-model' && 'Estrutura de modelo de negócio e value proposition'}
                </p>
              </div>

              {/* SELETOR DE TIPO */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => setInputType('text')}
                  className={`py-3 px-4 rounded-lg border-2 transition-all ${
                    inputType === 'text'
                      ? 'border-purple-500 bg-purple-500/20 shadow-lg'
                      : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                  }`}
                  disabled={isLoading}
                >
                  <div className="text-2xl mb-1">📝</div>
                  <div className="text-sm font-semibold">Texto</div>
                </button>

                <button
                  onClick={() => setInputType('url')}
                  className={`py-3 px-4 rounded-lg border-2 transition-all ${
                    inputType === 'url'
                      ? 'border-purple-500 bg-purple-500/20 shadow-lg'
                      : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                  }`}
                  disabled={isLoading}
                >
                  <div className="text-2xl mb-1">🔗</div>
                  <div className="text-sm font-semibold">URL</div>
                </button>

                <button
                  onClick={() => setInputType('pdf')}
                  className={`py-3 px-4 rounded-lg border-2 transition-all ${
                    inputType === 'pdf'
                      ? 'border-purple-500 bg-purple-500/20 shadow-lg'
                      : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                  }`}
                  disabled={isLoading}
                >
                  <div className="text-2xl mb-1">📄</div>
                  <div className="text-sm font-semibold">PDF</div>
                </button>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* INPUT: TEXTO */}
                {inputType === 'text' && (
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Cole seu texto aqui...

Pode ser: artigo, documentação técnica, procedimento operacional, relatório, etc.

Mínimo: 100 caracteres"
                    className="w-full h-72 bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    disabled={isLoading}
                  />
                )}

                {/* INPUT: URL */}
                {inputType === 'url' && (
                  <div>
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://exemplo.com/artigo"
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      📌 Funciona com: artigos de blog, notícias, documentações públicas
                    </p>
                  </div>
                )}

                {/* INPUT: PDF */}
                {inputType === 'pdf' && (
                  <div>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                        isDragging
                          ? 'border-purple-500 bg-purple-500/10 drag-active'
                          : 'border-gray-700 bg-gray-800/30'
                      }`}
                    >
                      {pdfFile ? (
                        <div className="space-y-3">
                          <div className="text-4xl">✅</div>
                          <div className="text-green-400 font-semibold">{pdfFile.name}</div>
                          <div className="text-sm text-gray-400">
                            {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                          <button
                            type="button"
                            onClick={() => setPdfFile(null)}
                            className="text-red-400 hover:text-red-300 text-sm underline"
                          >
                            Remover arquivo
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-5xl">📄</div>
                          <div className="text-gray-300 font-semibold">
                            Arraste seu PDF aqui
                          </div>
                          <div className="text-sm text-gray-500">ou</div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                          >
                            Selecionar Arquivo
                          </button>
                          <div className="text-xs text-gray-500 mt-3">
                            Máximo: 30 páginas
                          </div>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}

                {/* BOTÃO SUBMIT */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-6 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processando…' : 'Decodificar Agora'}
                </button>
              </form>
            </div>

            {/* INFO BOX */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
              <div className="flex gap-4">
                <div className="text-3xl">💎</div>
                <div>
                  <div className="font-bold text-blue-300 mb-3 text-lg">O que você receberá:</div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="bg-green-500/20 text-green-400 rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span>
                      <span><strong>Resumo Executivo:</strong> 3 insights críticos que importam</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="bg-yellow-500/20 text-yellow-400 rounded-full w-5 h-5 flex items-center justify-center text-xs">⚡</span>
                      <span><strong>Ações Imediatas:</strong> O que fazer HOJE para capitalizar</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="bg-purple-500/20 text-purple-400 rounded-full w-5 h-5 flex items-center justify-center text-xs">❓</span>
                      <span><strong>FAQ Auto-Gerado:</strong> 5 perguntas que você faria</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="bg-blue-500/20 text-blue-400 rounded-full w-5 h-5 flex items-center justify-center text-xs">📊</span>
                      <span><strong>Dados-Chave:</strong> Números e fatos importantes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="bg-orange-500/20 text-orange-400 rounded-full w-5 h-5 flex items-center justify-center text-xs">💰</span>
                      <span><strong>Oportunidades:</strong> Onde está o dinheiro/vantagem</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* === OUTPUT SECTION === */}
          <div className="space-y-6 fade-in">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-2xl min-h-[600px]">
              <h3 className="text-2xl font-bold mb-4 text-blue-400">✨ Inteligência Decodificada</h3>

              {/* LOADING */}
              {isLoading && (
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-700 rounded w-4/6"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/6"></div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-4/6"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              )}

              {/* ERROR */}
              {error && (
                <div className="border border-red-500 bg-red-900/20 text-red-300 rounded-lg p-6">
                  <p className="font-semibold">Falha na Análise. Não foi possível acessar ou ler a URL. Por favor, tente um artigo público diferente.</p>
                </div>
              )}

              {/* RESULT */}
              {completion && !isLoading && (
                <div className="space-y-4">
                  <div className="relative bg-gray-800 rounded-xl p-8 border border-gray-700">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(completion);
                        alert('Análise copiada! ✅');
                      }}
                      className="absolute top-3 right-3 px-3 py-1.5 text-sm rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 transition"
                      aria-label="Copiar análise"
                    >
                      📋 Copiar
                    </button>
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown>{completion}</ReactMarkdown>
                    </div>
                  </div>

                  {/* AÇÕES */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(completion);
                        alert('Análise copiada! ✅');
                      }}
                      className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-semibold"
                    >
                      📋 Copiar Análise
                    </button>
                    <button
                      onClick={() => {
                        setCompletion('');
                        setTextInput('');
                        setUrlInput('');
                        setPdfFile(null);
                      }}
                      className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all font-semibold"
                    >
                      🔄 Nova Análise
                    </button>
                  </div>
                </div>
              )}

              {/* EMPTY STATE */}
              {!completion && !isLoading && !error && (
                <div className="mt-8 border-2 border-dashed border-gray-700 rounded-xl p-12 text-center text-gray-500">
                  <div className="text-5xl mb-3">⚡</div>
                  <p className="text-base">Seu insight acionável aparecerá aqui. Cole uma URL acima para começar.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto text-center py-6 text-gray-500 text-sm border-t border-gray-800">
        <div>
          Construído em 75 minutos. | Powered by Leo Oliveira's AI Stack. | Isto é um "Bêbe RAG". Acelerando sua Inteligência.
        </div>
      </footer>
    </div>
  );
}