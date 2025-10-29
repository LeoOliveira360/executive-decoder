// Utilitários para processamento de texto

/**
 * Cria chunks de texto com overlap para manter contexto
 */
export function createChunks(text: string, chunkSize: number = 3000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    chunks.push(chunk);
    
    // Se chegou ao fim, para
    if (end === text.length) break;
    
    // Próximo chunk começa com overlap
    start = end - overlap;
  }

  return chunks;
}

/**
 * Limpa e normaliza texto extraído
 */
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
    .replace(/\n{3,}/g, '\n\n') // Remove quebras excessivas
    .replace(/[^\S\n]+/g, ' ') // Normaliza espaços
    .trim();
}

/**
 * Trunca texto para tamanho máximo mantendo palavras completas
 */
export function truncateText(text: string, maxChars: number = 12000): string {
  if (text.length <= maxChars) return text;
  
  const truncated = text.slice(0, maxChars);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.slice(0, lastSpace) + '...';
}

/**
 * Valida se é uma URL válida
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Estima número de páginas baseado em caracteres
 */
export function estimatePages(text: string): number {
  // Média de 2000 chars por página
  return Math.ceil(text.length / 2000);
}