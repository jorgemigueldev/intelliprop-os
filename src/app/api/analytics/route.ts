// ═══════════════════════════════════════════════════════════════════════
//  IMOVAI OS v13 — API Route: Analytics em Tempo Real
//  GET /api/analytics
// ═══════════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  // Dados calculados em tempo real (substituir por queries DB em produção)
  const now = new Date();

  const analytics = {
    timestamp: now.toISOString(),

    // KPIs principais
    kpis: {
      totalLeads:      5,
      hotLeads:        3,
      warmLeads:       2,
      coldLeads:       0,
      avgScore:        84.2,
      pipeline:        158700,
      forecastMonth:   158700,
      conversionRate:  24,
    },

    // Funil de vendas
    funnel: [
      { stage: 'Novo',        count: 1, value: 63000 },
      { stage: 'Qualificado', count: 1, value: 20400 },
      { stage: 'Agendado',    count: 1, value: 22200 },
      { stage: 'Visitou',     count: 1, value: 15600 },
      { stage: 'Proposta',    count: 1, value: 37500 },
    ],

    // CAC por canal
    channels: [
      { name: 'Indicação',     leads: 3, revenue: 120900, cac: 0,    roi: 999 },
      { name: 'Instagram',     leads: 1, revenue: 22200,  cac: 380,  roi: 340 },
      { name: 'Google',        leads: 1, revenue: 15600,  cac: 480,  roi: 280 },
    ],

    // Imóveis mais vistos
    topProperties: [
      { code: 'JM-6088', views: 312, matches: 18, revenue: 15600 },
      { code: 'JM-4055', views: 203, matches: 12, revenue: 20400 },
      { code: 'JM-7033', views: 156, matches: 9,  revenue: 22200 },
    ],

    // Projeção 90 dias
    forecast: {
      pessimista: 82000,
      realista:   158700,
      otimista:   229000,
    },

    // Meta do mês
    meta: {
      target:   100000,
      current:  67000,
      percent:  67,
      daysLeft: 31 - now.getDate(),
    },
  };

  return NextResponse.json(analytics);
}
