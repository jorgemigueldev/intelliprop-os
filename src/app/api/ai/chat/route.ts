// ═══════════════════════════════════════════════════════════════════════
//  IMOVAI OS v13 — API Route: Chat IA com Claude Sonnet
//  POST /api/ai/chat
// ═══════════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Você é Beatriz, a assistente de IA do IMOVAI OS — o sistema operacional do corretor imobiliário Jorge Miguel.

CONTEXTO:
- Jorge Miguel é corretor premium no Litoral Norte SC (Balneário Piçarras, Penha, Barra Velha, Itapoá)
- Portfólio: imóveis R$500k+ em parceria com Rôgga, Vetter, Hacasa, SBJ, Inbrasul, Rottas, Fabro Haas
- Foco: investidores (yield Airbnb 12-16%), famílias upgrade, compradores argentinos/uruguaios

PERSONALIDADE:
- Nome: Beatriz (IA do IMOVAI)
- Tom: profissional, consultiva, objetiva, com vocabulário do mercado imobiliário premium
- Responde sempre em português brasileiro
- Usa dados reais quando disponíveis
- Identifica objeções e sugere counterscripts (SPIN Selling, Challenger Sale, NSTD)
- Detecta sinais de compra e alerta o corretor
- Máximo 3 parágrafos curtos por resposta

FRAMEWORKS:
- SPIN Selling: Situação → Problema → Implicação → Necessidade
- Challenger Sale: ensinar, adaptar, tomar controle
- Never Split the Difference (Chris Voss): espelhamento, rotulagem emocional
- Caminho do Lobo (Jordan Belfort): entusiasmo, certeza, tonalidade

IMÓVEIS DISPONÍVEIS:
- JM-2041: Cobertura Duplex Beira Mar, Balneário Piçarras, R$890k, yield 13.2% (Rôgga)
- JM-3098: Penthouse 4 Suítes, Penha, R$1,25M, yield 11.8% (Vetter)
- JM-4055: Apto Gourmet Beira Mar, Barra Velha, R$680k, yield 14.5% (Hacasa)
- JM-5012: Casa Luxo Cond. Fechado, Balneário Piçarras, R$1,48M (SBJ)
- JM-6088: Studio Prime, Navegantes, R$520k, yield 16.2% (Inbrasul)
- JM-7033: Apto Frente Mar 3 Suítes, Itapoá, R$740k, yield 12.4% (Rottas)
- JM-8091: Cobertura Garden Ultra Luxo, Joinville, R$2,1M (Fabro Haas)`;

export async function POST(req: NextRequest) {
  try {
    const { messages, leadContext } = await req.json();

    const systemWithContext = leadContext
      ? `${SYSTEM_PROMPT}\n\nCONTEXTO DO LEAD ATUAL:\n${JSON.stringify(leadContext, null, 2)}`
      : SYSTEM_PROMPT;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemWithContext,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || 'Erro ao processar resposta.';

    return NextResponse.json({
      message: text,
      usage: data.usage,
      model: data.model,
    });
  } catch (err) {
    console.error('[/api/ai/chat] Erro:', err);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
