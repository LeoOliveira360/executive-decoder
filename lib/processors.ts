// ============================================================================
// FUNÇÃO: EXTRAIR ACTION ITEMS DO TEXTO
// ============================================================================
export function extractActionItems(analysisText: string): string[] {
    const items: string[] = [];
  
    // Priorizar seção(ões) com títulos típicos de ações
    // Ex.: "## ⚡ Ações Imediatas", "## Recomendações Prioritárias", "## Próximos Passos"
    // Captura até o próximo heading de mesmo nível
    const sectionRegex = /(##+\s+.*?(Ações|Recomendações|Próximos Passos)[^\n]*)([\s\S]*?)(?=\n##\s|\n###\s|$)/gi;
    let secMatch;
    const preferredSections: string[] = [];
    while ((secMatch = sectionRegex.exec(analysisText)) !== null) {
      if (secMatch[3]) preferredSections.push(secMatch[3]);
    }

    const textToScan = preferredSections.length
      ? preferredSections.join('\n')
      : analysisText;

    // Padrão 1: Linhas com bullet points (- ou *)
    const bulletPattern = /^[\-\*]\s+(.+)$/gm;
    let matches = textToScan.matchAll(bulletPattern);
    for (const match of matches) {
      if (match[1] && match[1].trim().length > 10) {
        items.push(match[1].trim());
      }
    }
  
    // Padrão 2: Listas numeradas
    const numberedPattern = /^\d+\.\s+(.+)$/gm;
    matches = textToScan.matchAll(numberedPattern);
    for (const match of matches) {
      if (match[1] && match[1].trim().length > 10) {
        items.push(match[1].trim());
      }
    }
  
    // Padrão 3: Linhas com emoji de raio (⚡)
    const emojiPattern = /^⚡\s+(.+)$/gm;
    matches = textToScan.matchAll(emojiPattern);
    for (const match of matches) {
      if (match[1] && match[1].trim().length > 10) {
        items.push(match[1].trim());
      }
    }
  
    // Padrão 4: Linhas que começam com verbos de ação
    const actionVerbs = [
      'Agendar',
      'Revisar',
      'Verificar',
      'Aprovar',
      'Enviar',
      'Solicitar',
      'Contatar',
      'Preparar',
      'Analisar',
      'Implementar',
    ];
  
    const lines = textToScan.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      for (const verb of actionVerbs) {
        if (trimmed.startsWith(verb) && trimmed.length > 15) {
          items.push(trimmed);
          break;
        }
      }
    }
  
    // Remover duplicatas
    const uniqueItems = Array.from(new Set(items));
  
    // Limitar a 15 items
    return uniqueItems.slice(0, 15);
  }
  
  // ============================================================================
  // FUNÇÃO: DETERMINAR PRIORIDADE BASEADA EM KEYWORDS
  // ============================================================================
  export function determinePriority(
    subject: string,
    content: string
  ): 'Alta' | 'Média' | 'Baixa' {
    const fullText = `${subject} ${content}`.toLowerCase();
  
    // Keywords de alta prioridade
    const highPriorityKeywords = [
      'urgente',
      'imediato',
      'crítico',
      'emergência',
      'prazo',
      'hoje',
      'asap',
      'importante',
      'prioridade alta',
      'deadline',
      'vencimento',
    ];
  
    // Keywords de baixa prioridade
    const lowPriorityKeywords = [
      'fyi',
      'para conhecimento',
      'informativo',
      'lembrete',
      'quando possível',
      'sem pressa',
      'baixa prioridade',
    ];
  
    // Verificar alta prioridade
    for (const keyword of highPriorityKeywords) {
      if (fullText.includes(keyword)) {
        return 'Alta';
      }
    }
  
    // Verificar baixa prioridade
    for (const keyword of lowPriorityKeywords) {
      if (fullText.includes(keyword)) {
        return 'Baixa';
      }
    }
  
    // Padrão: média prioridade
    return 'Média';
  }