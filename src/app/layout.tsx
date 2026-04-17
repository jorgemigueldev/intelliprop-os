import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export const metadata: Metadata = {
  title: 'IMOVAI OS v16 — Sistema Operacional Imobiliário | Jorge Miguel Imóveis',
  description: 'CRM inteligente com IA para corretores premium. Litoral Norte SC.',
  keywords: ['CRM imobiliário','IA para corretores','Litoral Norte SC','Balneário Piçarras','automação imobiliária'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body style={{margin:0,padding:0,background:'#07090f'}}>{children}</body>
    </html>
  )
}
