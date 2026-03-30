# IMOVAI OS v10.0 — Sistema Operacional do Corretor

> CRM Imobiliário com IA · Litoral Norte SC · Jorge Miguel Imóveis

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

## 🧠 O que é

IMOVAI OS é um **Sistema Operacional para Corretores Imobiliários** com IA integrada. Mais do que um CRM — é infraestrutura inteligente para captura, qualificação, nutrição e fechamento de leads em imóveis de alto padrão no Litoral Norte de SC.

**Referências de mercado usadas na arquitetura:**
- Salesforce Einstein (Score Preditivo)
- HubSpot Breeze (Breeze Score)
- Gong.io (Conversation Intelligence)
- Follow Up Boss (Deal Velocity)
- Reapit + Propertybase (Property Intelligence)
- LionDesk + kvCORE (Behavioral Intelligence)

---

## 🏗 Arquitetura — 5 Camadas

```
IMOVAI OS
├── Camada 1 — Dados Centrais      (Leads, Imóveis, Pipeline, Histórico)
├── Camada 2 — Inteligência de IA  (7 Módulos · 50+ Funções)
├── Camada 3 — Automação           (Sequências · Drip 3-7-30 · Webhooks)
├── Camada 4 — Comunicação         (WhatsApp · Email · SMS · Omnicanal)
└── Camada 5 — Experiência         (Dashboard · Kanban · Chat · Analytics)
```

---

## 🤖 Engine v10 — 7 Módulos de IA

| Módulo | Nome | Referência |
|--------|------|------------|
| 2.1 | Inteligência Preditiva | Salesforce Einstein + HubSpot Breeze |
| 2.2 | Inteligência Conversacional | Gong.io Conversation Intelligence |
| 2.3 | Inteligência Comportamental | kvCORE + Chime + LionDesk |
| 2.4 | Inteligência Imobiliária | Reapit + Propertybase |
| 2.5 | Next Best Action Engine | Salesforce Einstein NBA |
| 2.6 | Motor de Persuasão | SPIN Selling + Challenger Sale + NSTD |
| 2.7 | Life Event Engine | Exclusivo IMOVAI OS |

---

## 📱 10 Abas do Sistema

| Aba | Descrição |
|-----|-----------|
| Dashboard | KPIs, pipeline sparkline, ações prioritárias, life events |
| Leads | Tabela ranqueada por IA, filtros, painel de detalhe completo |
| Pipeline | Kanban visual com quick-advance por estágio |
| Imóveis | Portfólio com ROI calculado, valorização por bairro, descrição IA |
| Chat IA | Atendimento omnicanal com detecção de intenção e objeção em tempo real |
| Insights | NBA Engine, Velocity, ICP Match, Risk Analyzer, Sentimento |
| Automações | Sequências · Drip · Webhooks · WhatsApp Bot |
| Analytics | CAC por canal · ROI · Matriz Velocity × Sentimento × ICP |
| Forecast | Cenários conservador/realista/otimista · Revenue Intelligence |
| Engine | Documentação dos 7 módulos · Stack backend · Roadmap v11-v15 |

---

## 🚀 Como rodar

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build de produção
npm run build
npm start
```

Abrir: [http://localhost:3000](http://localhost:3000)

---

## 📁 Estrutura

```
src/
├── app/
│   ├── page.tsx          # App principal — 10 abas
│   ├── layout.tsx        # Layout + metadados SEO
│   ├── globals.css       # Design System CSS
│   └── components/
│       └── ui.tsx        # Componentes reutilizáveis
└── lib/
    ├── types.ts          # Tipos TypeScript centralizados
    ├── data.ts           # Dados iniciais + constantes
    └── engine.ts         # Motor IA — 50+ funções puras
```

---

## 🛣 Roadmap

| Versão | Feature |
|--------|---------|
| v11 | Agente IA Autônomo — WhatsApp que qualifica e agenda sozinho |
| v12 | Radar de Investidores — detecta automaticamente quem quer investir |
| v13 | Previsão de Valorização — cruza infraestrutura, demografia e oferta |
| v14 | Copiloto do Corretor — Jarvis imobiliário em tempo real |
| v15 | Infraestrutura do Mercado — plataforma B2B nacional |

---

## 👤 Autor

**Jorge Miguel** — Corretor de Imóveis · Litoral Norte SC  
📞 (47) 98916-0113 · 📸 @jorgemiguelimoveis  
🏖 Balneário Piçarras · Penha · Barra Velha · Navegantes · Itapoá

---

*IMOVAI OS — Do corretor. Para o corretor. Com IA.*
