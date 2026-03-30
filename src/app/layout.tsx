import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IMOVAI OS — Sistema Operacional do Corretor',
  description: 'CRM Imobiliário com IA · 50+ funções · Pipeline · Analytics · WhatsApp · Jorge Miguel Imóveis',
  keywords: ['CRM imobiliário', 'IMOVAI', 'corretor', 'IA imobiliária', 'Litoral Norte SC'],
  authors: [{ name: 'Jorge Miguel Imóveis' }],
  openGraph: {
    title: 'IMOVAI OS v10',
    description: 'Sistema Operacional do Corretor Imobiliário',
    type: 'website',
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
