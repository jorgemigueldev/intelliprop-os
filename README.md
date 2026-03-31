<div align="center">

# ⬡ IMOVAI OS v12.0

### Sistema Operacional do Corretor Imobiliário Premium

**O CRM + IA mais completo e inteligente da categoria para imóveis R$500k+ no Litoral Norte SC**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jorgemigueldev/intelliprop-os)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://typescriptlang.org)
[![Build](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/jorgemigueldev/intelliprop-os/actions)

[Demo](https://intelliprop-os.vercel.app) · [Docs](#documentação) · [Deploy](#deploy-1-clique)

</div>

---

## 🧠 O que é o IMOVAI OS?

IMOVAI OS é um **Sistema Operacional completo para Corretores Imobiliários** com Inteligência Artificial integrada. Mais do que um CRM — é infraestrutura inteligente para capturar, qualificar, nutrir e fechar leads de imóveis de alto padrão no Litoral Norte de SC.

### 🏆 Por que é diferente?

| Feature | IMOVAI OS v12 | CRMs Tradicionais |
|---------|:---:|:---:|
| Score preditivo (Einstein + Breeze) | ✅ | ❌ |
| NBA Engine (Next Best Action) | ✅ | ❌ |
| Life Event Detection | ✅ | ❌ |
| PDF de Apresentação automático | ✅ | ❌ |
| Análise ROI por imóvel | ✅ | ❌ |
| WhatsApp QR Code integrado | ✅ | 💰 |
| Forecast IA (3 cenários) | ✅ | 💰 |
| Radar de Investidores | ✅ | ❌ |
| Previsão de Valorização | ✅ | ❌ |
| Gong.io-style Conversation IA | ✅ | 💰 |

---

## 🏗 Arquitetura — 5 Camadas + Engine v12

```
IMOVAI OS v12
├── Camada 1 — Dados Centrais         (Leads R$500k+, Imóveis, Pipeline)
├── Camada 2 — Engine IA (70+ fns)    (10 Módulos, TypeScript Puro)
├── Camada 3 — Automação              (Drip 3-7-30, Webhooks, Sequências)
├── Camada 4 — Comunicação            (WhatsApp QR, Email, SMS)
└── Camada 5 — Experiência            (Dashboard, Kanban, PDF, Analytics)
```

## 🤖 Engine v12 — 10 Módulos de IA

| Módulo | Nome | Referência |
|--------|------|------------|
| 2.1 | Inteligência Preditiva | Salesforce Einstein + HubSpot Breeze |
| 2.2 | Inteligência Conversacional | Gong.io |
| 2.3 | Inteligência Comportamental | kvCORE + LionDesk |
| 2.4 | Inteligência Imobiliária | Reapit + Propertybase |
| 2.5 | Next Best Action Engine | Salesforce Einstein NBA |
| 2.6 | Motor de Persuasão | SPIN + Challenger + NSTD |
| 2.7 | Life Event Engine | Exclusivo IMOVAI |
| 2.8 | Radar de Investidores ★ | Exclusivo IMOVAI v12 |
| 2.9 | Previsão de Valorização ★ | Exclusivo IMOVAI v12 |
| 2.10 | Analytics Engine | Exclusivo IMOVAI |

---

## 🚀 Deploy em 1 Clique

### Via Vercel (Recomendado)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jorgemigueldev/intelliprop-os)

### Via GitHub Actions (CI/CD Automático)

Todo push para `main` faz deploy automático. Configure os secrets:

```
VERCEL_TOKEN      → vercel.com/account/tokens
VERCEL_ORG_ID     → vercel.com/account → Settings → Team ID
VERCEL_PROJECT_ID → Painel do projeto → Settings
```

### Local

```bash
git clone https://github.com/jorgemigueldev/intelliprop-os
cd intelliprop-os
npm install
npm run dev
# → http://localhost:3000
```

---

## 📁 Estrutura

```
src/
├── app/
│   ├── page.tsx              # App principal — 11 abas
│   ├── layout.tsx            # Layout + SEO
│   └── components/
│       └── ui.tsx            # Design System "Obsidian Luxury"
└── lib/
    ├── types.ts              # Tipos TypeScript
    ├── data.ts               # Dados + Constantes
    └── engine.ts             # Engine IA — 70+ funções puras
```

---

## 📱 11 Abas do Sistema

| Aba | Função |
|-----|--------|
| **Dashboard** | KPIs, pipeline sparkline, ações prioritárias, life events |
| **Leads** | Tabela ranqueada por IA, filtros, painel de detalhe |
| **Pipeline** | Kanban visual com quick-advance por estágio |
| **Imóveis** | Portfólio R$500k+ com fotos reais, ROI, PDF |
| **Chat IA** | Omnicanal com detecção de intenção e objeção |
| **Insights** | NBA, Risk Analyzer, Radar de Investidores |
| **Automações** | Sequências, Drip, Webhooks, WhatsApp Bot |
| **Analytics** | CAC por canal, ROI, Matriz Velocity × ICP |
| **Forecast** | 3 cenários + Revenue Intelligence |
| **WhatsApp** | QR Code + Bot Autônomo + 5 fluxos |
| **Engine** | Documentação viva dos 10 módulos IA |

---

## 🏠 Portfólio — Imóveis R$500k+

| Código | Imóvel | Cidade | Preço | Yield |
|--------|--------|--------|-------|-------|
| JM-2041 | Cobertura Beira Mar Duplex | Balneário Piçarras | R$ 890k | 13,2% |
| JM-3098 | Penthouse Vista Mar 4 Suítes | Penha | R$ 1,25M | 11,8% |
| JM-4055 | Apartamento Gourmet Beira Mar | Barra Velha | R$ 680k | 14,5% |
| JM-5012 | Casa Luxo Condomínio Fechado | Balneário Piçarras | R$ 1,48M | — |
| JM-6088 | Studio Investimento Prime | Navegantes | R$ 520k | 16,2% |
| JM-7033 | Apartamento Frente Mar 3 Suítes | Itapoá | R$ 740k | 12,4% |
| JM-8091 | Cobertura Garden Ultra Luxo | Joinville | R$ 2,1M | — |

---

## 🛣 Roadmap

| Versão | Feature |
|--------|---------|
| v12 ✅ | Radar de Investidores + Previsão Valorização + CI/CD GitHub Actions |
| v13 | Copiloto IA em Tempo Real (Jarvis imobiliário) |
| v14 | Integração ZAP/VivaReal/OLX + portais automáticos |
| v15 | App Mobile (React Native) |
| v16 | Multi-tenant SaaS White Label |

---

## 👤 Autor

**Jorge Miguel** — Corretor CRECI-SC · Litoral Norte SC  
📞 (47) 98916-0113 · 📸 @jorgemiguelimoveis  
🏖 Balneário Piçarras · Penha · Barra Velha · Navegantes · Itapoá · Joinville

---

*IMOVAI OS — Do corretor. Para o corretor. Com IA.*
