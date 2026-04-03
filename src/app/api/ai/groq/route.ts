// ═══════════════════════════════════════════════════════════════════════
//  IMOVAI OS v14 — Multi-Provider IA (Groq FREE > DeepSeek > Claude)
//  POST /api/ai/groq
//  Groq: llama-3.3-70b-versatile — GRATUITO, ultra-rápido
//  Fallback: DeepSeek → Claude Sonnet
// ═══════════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';

const IMOVAI_SYSTEM = `Você é BEATRIZ, a IA autônoma do IMOVAI OS — sistema operacional do corretor imobiliário Jorge Miguel.

IDENTIDADE:
- Nome: Beatriz (IA do IMOVAI)
- Especialidade: imóveis premium R$500k+ no Litoral Norte SC
- Tom: consultiva, objetiva, profissional, levemente próxima
- Idioma: português brasileiro sempre

CORRETOR:
- Jorge Miguel | CRECI-SC | WhatsApp: (47) 98486-3952
- Instagram: @jorgemiguelimoveis
- Região: Balneário Piçarras, Penha, Barra Velha, Itapoá, Navegantes, Joinville
- Parceiros: Rôgga, Vetter, Hacasa, SBJ, Inbrasul, Rottas, Fabro Haas

PORTFÓLIO ATUAL:
- JM-2041: Cobertura Beira Mar Duplex | Balneário Piçarras | R$890k | Yield 13,2% | Rôgga
- JM-3098: Penthouse 4 Suítes Vista Mar | Penha | R$1,25M | Yield 11,8% | Vetter
- JM-4055: Apto Gourmet Beira Mar | Barra Velha | R$680k | Yield 14,5% | Hacasa
- JM-5012: Casa Luxo Cond. Fechado | Balneário Piçarras | R$1,48M | SBJ
- JM-6088: Studio Prime Investimento | Navegantes | R$520k | Yield 16,2% | Inbrasul
- JM-7033: Apto Frente Mar 3 Suítes | Itapoá | R$740k | Yield 12,4% | Rottas
- JM-8091: Cobertura Garden Ultra Luxo | Joinville | R$2,1M | Fabro Haas

CAPACIDADES:
1. Qualificar leads via SPIN Selling + Challenger Sale + NSTD
2. Detectar intenção de compra e objeções em tempo real
3. Sugerir imóvel ideal por perfil e orçamento
4. Calcular ROI, yield, payback para investidores
5. Criar scripts de ligação e vídeo personalizados
6. Detectar life events (casamento, herança, venda empresa)
7. Radar de investidores argentinos/uruguaios
8. Follow-up automático cadência 3-7-30 dias
9. Análise de valorização por cidade/região SC

REGRAS:
- Respostas objetivas, máximo 3 parágrafos curtos
- Sempre terminar com CTA (pergunta ou próximo passo)
- WhatsApp: máximo 280 caracteres por mensagem
- Nunca inventar dados de imóveis ou preços
- Se não souber algo, direcionar para Jorge: (47) 98486-3952`;

async function callGroq(messages: { role: string; content: string }[], system: string) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY || ''}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      temperature: 0.7,
      messages: [
        { role: 'system', content: system },
        ...messages,
      ],
    }),
  });
  if (!res.ok) throw new Error(`Groq error: ${res.status}`);
  const data = await res.json();
  return { text: data.choices[0].message.content, provider: 'groq', model: 'llama-3.3-70b-versatile' };
}

async function callDeepSeek(messages: { role: string; content: string }[], system: string) {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY || ''}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: system },
        ...messages,
      ],
    }),
  });
  if (!res.ok) throw new Error(`DeepSeek error: ${res.status}`);
  const data = await res.json();
  return { text: data.choices[0].message.content, provider: 'deepseek', model: 'deepseek-chat' };
}

async function callClaude(messages: { role: string; content: string }[], system: string) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`Claude error: ${res.status}`);
  const data = await res.json();
  return { text: data.content[0].text, provider: 'claude', model: 'claude-sonnet-4' };
}

export async function POST(req: NextRequest) {
  try {
    const { messages, leadContext, mode = 'chat' } = await req.json();

    const systemPrompt = leadContext
      ? `${IMOVAI_SYSTEM}\n\nCONTEXTO DO LEAD:\nNome: ${leadContext.name}\nOrçamento: ${leadContext.budget}\nIntenção: ${leadContext.intent}\nStatus: ${leadContext.status}\nScore IA: ${leadContext.score}\nImóvel de interesse: ${leadContext.code || 'Nenhum'}\nLife Event: ${leadContext.lifeEvent || 'Nenhum'}`
      : IMOVAI_SYSTEM;

    // Tentar provedores em ordem: Groq (free) → DeepSeek → Claude
    const providers = [
      { fn: callGroq, key: process.env.GROQ_API_KEY, name: 'groq' },
      { fn: callDeepSeek, key: process.env.DEEPSEEK_API_KEY, name: 'deepseek' },
      { fn: callClaude, key: process.env.ANTHROPIC_API_KEY, name: 'claude' },
    ];

    let result = null;
    let lastError = null;

    for (const provider of providers) {
      if (!provider.key) continue;
      try {
        result = await provider.fn(messages, systemPrompt);
        break;
      } catch (err) {
        lastError = err;
        continue;
      }
    }

    if (!result) {
      // Fallback local inteligente sem API
      const lastMsg = messages[messages.length - 1]?.content || '';
      result = {
        text: generateLocalFallback(lastMsg, leadContext),
        provider: 'local',
        model: 'imovai-engine-v14',
      };
    }

    return NextResponse.json({
      message: result.text,
      provider: result.provider,
      model: result.model,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[/api/ai/groq] Erro:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

function generateLocalFallback(userMsg: string, lead?: Record<string, unknown>): string {
  const msg = userMsg.toLowerCase();
  const name = (lead?.name as string)?.split(' ')[0] || 'cliente';

  if (msg.includes('yield') || msg.includes('investimento') || msg.includes('renda')) {
    return `Perfeito, ${name}! Para investidores, nosso destaque é o JM-6088 em Navegantes — Studio Prime com yield de 16,2% ao ano, gerando R$7.000/mês via Airbnb. Já vi seu perfil e esse é o melhor custo-benefício da nossa carteira agora. Quer que eu envie a análise de ROI completa?`;
  }
  if (msg.includes('preço') || msg.includes('valor') || msg.includes('quanto')) {
    return `Nossa carteira começa em R$520k (Studio Prime em Navegantes) e vai até R$2,1M (Cobertura Garden em Joinville). Tudo imóvel de alto padrão com potencial de valorização de 14-22% ao ano no Litoral Norte SC. Qual faixa você está considerando, ${name}?`;
  }
  if (msg.includes('visita') || msg.includes('ver') || msg.includes('conhecer')) {
    return `Ótimo, ${name}! Posso agendar uma visita presencial ou virtual com o Jorge. Qual imóvel te interessa mais? Tenho horários disponíveis esta semana. Fale diretamente com o Jorge: (47) 98486-3952 ou me diz um horário que funcione para você!`;
  }
  return `Olá, ${name}! Sou a Beatriz, IA do IMOVAI. Tenho 7 imóveis exclusivos no Litoral Norte SC — de studios R$520k até coberturas R$2,1M, todos com alto yield de Airbnb. O que você está buscando: moradia ou investimento?`;
}
