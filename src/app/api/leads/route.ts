// ═══════════════════════════════════════════════════════════════════════
//  IMOVAI OS v13 — API Route: Leads CRUD
//  GET/POST /api/leads
// ═══════════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';

// In-memory store (substituir por Supabase/Prisma em produção)
const leadsStore: Map<number, Record<string, unknown>> = new Map();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const temp   = searchParams.get('temp');
  const limit  = parseInt(searchParams.get('limit') || '50');

  let leads = Array.from(leadsStore.values());

  if (status) leads = leads.filter(l => l.status === status);
  if (temp)   leads = leads.filter(l => l.temp   === temp);

  // Ordenar por score desc
  leads.sort((a, b) => ((b.score as number) || 0) - ((a.score as number) || 0));

  return NextResponse.json({
    leads: leads.slice(0, limit),
    total: leads.length,
    hot:   leads.filter(l => l.temp === 'hot').length,
    pipeline: leads.reduce((sum, l) => sum + ((l.revenueExpected as number) || 0), 0),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id   = Date.now();

    const lead = {
      id,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: body.status || 'novo',
      temp:   body.temp   || 'cold',
      score:  body.score  || 0,
    };

    leadsStore.set(id, lead);

    return NextResponse.json({ lead, success: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao criar lead' }, { status: 400 });
  }
}
