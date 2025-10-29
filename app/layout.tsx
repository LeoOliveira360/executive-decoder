import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Executive Decoder | Leo Oliveira AI Stack',
  description: 'De 30 páginas para 30 segundos. Inteligência Acionável Instantânea.',
  keywords: 'IA, análise de documentos, insights, executive summary, Leo Oliveira',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}