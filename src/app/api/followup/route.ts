// ═══════════════════════════════════════════════════════════════════════
//  IMOVAI OS v14 — Follow-up Automático (Cadência 3-7-30 dias)
//  GET  /api/followup?leadId=x  → verificar status
//  POST /api/followup            → disparar follow-up manual
//  PUT  /api/followup            → configurar cadência
// ═══════════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';

const JORGE_NUMBER = '5547984863952';

// Templates de follow-up por perfil e dia
const FOLLOWUP_TEMPLATES = {
  investidor: {
    d3:  (name: string) => `Oi ${name.split(' ')[0]}! 👋 Vi que você viu o Studio JM-6088 em Navegantes. Ele ainda está disponível e o yield de 16,2% ao ano é o melhor da nossa carteira. R$7k/mês de renda passiva. Quer a simulação completa?`,
    d7:  (name: string) => `${name.split(' ')[0]}, aqui é o Jorge Miguel. Você sabia que o Litoral Norte SC valorizou 22% em 2024? Nossos imóveis de praia têm os melhores yields do Estado. Tenho 1 oportunidade especial que encaixa no seu perfil — posso te apresentar?`,
    d30: (name: string) => `Oi ${name.split(' ')[0]}! Tudo bem? 😊 Faz um tempinho que não conversamos. Tenho novidades no portfólio que podem ser do seu interesse. Qual é o seu foco: renda de aluguel ou valorização patrimonial? Me conta!`,
  },
  moradia: {
    d3:  (name: string) => `Oi ${name.split(' ')[0]}! Como foi a visita? Gostei muito de conversar com você. Se tiver alguma dúvida sobre o imóvel ou quiser comparar outras opções, é só chamar! Tenho mais 2 opções no perfil que você procura.`,
    d7:  (name: string) => `${name.split(' ')[0]}, aqui é o Jorge Miguel! 👋 Está ainda buscando o imóvel ideal para sua família? Tenho apartamentos prontos para morar em Balneário Piçarras e Penha. Posso te mostrar? Quando seria um bom horário?`,
    d30: (name: string) => `Oi ${name.split(' ')[0]}! Já encontrou o imóvel dos sonhos? 🏡 Se ainda estiver procurando, temos novidades no portfólio — peço ao meu time para te ligar. O mercado está aquecido e as melhores unidades saem rápido!`,
  },
  cold: {
    d7:  (name: string) => `${name.split(' ')[0]}, oi! Aqui é a Beatriz, assistente do Jorge Miguel Imóveis 😊 Notei que você demonstrou interesse em imóveis no Litoral Norte SC. Estamos com uma novidade especial na carteira — quer dar uma olhada?`,
    d30: (name: string) => `Oi ${name.split(' ')[0]}! Tudo bem? Acabamos de lançar um novo empreendimento em Balneário Piçarras com condições especiais. Sabe se ainda está no mercado? Posso te enviar os detalhes!`,
  },
};

// Simular banco de cadências (em produção: Supabase)
const cadencias: Record<string, { day: number; sentAt: string; status: string }[]> = {};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get('leadId');

  if (leadId) {
    return NextResponse.json({
      leadId,
      cadence: cadencias[leadId] || [],
      nextFollowup: getNextFollowup(leadId),
    });
  }

  // Retornar leads que precisam de follow-up hoje (simulado)
  return NextResponse.json({
    pendingToday: 3,
    leads: [
      { id: 1, name: 'Carlos Mendonça',  day: 3,  type: 'investidor', urgency: 'high' },
      { id: 2, name: 'Fernanda Lima',     day: 7,  type: 'investidor', urgency: 'medium' },
      { id: 4, name: 'Ana Paula Vieira',  day: 30, type: 'moradia',    urgency: 'low' },
    ],
  });
}

export async function POST(req: NextRequest) {
  try {
    const { leadId, leadName, leadPhone, intent, day, autoSend = false } = await req.json();

    const profile = intent === 'investimento' ? 'investidor' : 'moradia';
    const templates = FOLLOWUP_TEMPLATES[profile as keyof typeof FOLLOWUP_TEMPLATES] || FOLLOWUP_TEMPLATES.cold;
    
    const templateFn = (templates as Record<string, (n: string) => string>)[`d${day}`] || 
                       FOLLOWUP_TEMPLATES.cold[`d${day}` as keyof typeof FOLLOWUP_TEMPLATES.cold];
    
    const message = templateFn ? templateFn(leadName) : `Oi ${leadName.split(' ')[0]}! Aqui é o Jorge Miguel. Tudo bem? Como posso ajudar?`;

    // Registrar cadência
    if (!cadencias[leadId]) cadencias[leadId] = [];
    cadencias[leadId].push({ day, sentAt: new Date().toISOString(), status: 'queued' });

    let sendResult = null;

    if (autoSend && leadPhone) {
      // Tentar enviar via WhatsApp API
      try {
        const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/whatsapp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number: leadPhone, text: message }),
        });
        sendResult = await res.json();
      } catch { /* Não enviado automaticamente */ }
    }

    // Sempre gerar link WhatsApp como fallback
    const waLink = `https://wa.me/${(leadPhone || JORGE_NUMBER).replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

    return NextResponse.json({
      success: true,
      message,
      day,
      profile,
      waLink,
      autoSent: !!sendResult?.success,
      instruction: sendResult?.success 
        ? 'Mensagem enviada automaticamente via WhatsApp!'
        : 'Clique no link para enviar via WhatsApp:',
    });

  } catch (err) {
    return NextResponse.json({ error: 'Erro ao processar follow-up' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { config } = await req.json();
    // Configurar cadências personalizadas
    return NextResponse.json({ success: true, config, message: 'Configuração salva!' });
  } catch {
    return NextResponse.json({ error: 'Erro ao salvar configuração' }, { status: 500 });
  }
}

function getNextFollowup(leadId: string) {
  const cadence = cadencias[leadId] || [];
  const days = [3, 7, 30];
  const sentDays = cadence.map(c => c.day);
  const nextDay = days.find(d => !sentDays.includes(d));
  if (!nextDay) return null;
  return { day: nextDay, scheduledFor: new Date(Date.now() + nextDay * 86400000).toISOString() };
}
