// ═══════════════════════════════════════════════════════════════════════
//  IMOVAI OS v13 — API Route: Análise de Lead com IA
//  POST /api/ai/analyze
// ═══════════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { lead } = await req.json();

    const prompt = `Analise este lead imobiliário e retorne um JSON com insights acionáveis:

LEAD:
- Nome: ${lead.name}
- Orçamento: ${lead.budget}
- Intenção: ${lead.intent}
- Status: ${lead.status}
- Temperatura: ${lead.temp}
- Score: ${lead.score}
- Notas: ${lead.aiNotes || 'N/A'}
- Último contato: ${lead.lastMsg}
- Imóvel de interesse: ${lead.code || 'Nenhum'}
- Life Event: ${lead.lifeEvent || 'Nenhum'}

Retorne SOMENTE um JSON válido (sem markdown, sem explicações) com esta estrutura:
{
  "nextAction": "ação específica a tomar agora",
  "urgency": "critical|high|medium|low",
  "message": "mensagem WhatsApp pronta para enviar (max 2 linhas)",
  "objectionHandler": "como contornar a objeção principal",
  "insight": "insight psicológico sobre este lead",
  "recommendedProperty": "código do imóvel mais adequado",
  "closingTip": "dica de fechamento personalizada"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const raw = data.content?.[0]?.text || '{}';

    let analysis;
    try {
      analysis = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      analysis = { nextAction: raw, urgency: 'medium' };
    }

    return NextResponse.json({ analysis, leadId: lead.id });
  } catch (err) {
    console.error('[/api/ai/analyze] Erro:', err);
    return NextResponse.json({ error: 'Erro na análise' }, { status: 500 });
  }
}
