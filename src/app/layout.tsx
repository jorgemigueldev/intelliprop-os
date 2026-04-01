import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#020408',
};

export const metadata: Metadata = {
  title: 'IMOVAI OS v13 — Sistema Operacional do Corretor',
  description: 'CRM Imobiliário Premium com IA · 70+ funções · Pipeline Kanban · Analytics · WhatsApp Bot · Claude Sonnet · Jorge Miguel Imóveis · Litoral Norte SC',
  keywords: [
    'CRM imobiliário', 'IMOVAI OS', 'corretor imobiliário', 'IA imobiliária',
    'Litoral Norte SC', 'Balneário Piçarras', 'Penha', 'Barra Velha', 'Itapoá',
    'imóveis R$500k', 'investimento imobiliário', 'yield airbnb', 'Jorge Miguel Imóveis',
    'Claude Sonnet', 'PropTech', 'SaaS imobiliário',
  ],
  authors: [{ name: 'Jorge Miguel Imóveis', url: 'https://www.instagram.com/jorgemiguelimoveis' }],
  creator: 'Jorge Miguel',
  publisher: 'Jorge Miguel Imóveis',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'IMOVAI OS v13 — Sistema Operacional do Corretor Imobiliário',
    description: 'O CRM com IA mais completo para corretores de imóveis premium. 70+ funções, Claude Sonnet integrado, Pipeline, Analytics e WhatsApp Bot.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'IMOVAI OS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IMOVAI OS v13',
    description: 'Sistema Operacional do Corretor Imobiliário · IA Real · Jorge Miguel Imóveis',
    creator: '@jorgemiguelimoveis',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Syne:wght@700;800;900&display=swap" rel="stylesheet"/>
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
