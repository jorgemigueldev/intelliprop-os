// ═══════════════════════════════════════════════════════════════════════
//  IMOVAI OS v13 — API Route: Lead Individual
//  GET/PATCH/DELETE /api/leads/[id]
// ═══════════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Em produção: buscar do DB
  return NextResponse.json({ id: params.id, message: 'Lead endpoint ativo' });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body   = await req.json();
    const id     = parseInt(params.id);
    const update = { ...body, updatedAt: new Date().toISOString() };

    // Em produção: atualizar no DB (Supabase/Prisma)
    return NextResponse.json({ id, ...update, success: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar lead' }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Em produção: soft delete no DB
  return NextResponse.json({ id: params.id, deleted: true });
}
