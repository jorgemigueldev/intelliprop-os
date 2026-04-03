// ═══════════════════════════════════════════════════════════════════════
//  IMOVAI OS v14 — WhatsApp Send Messages
//  POST /api/whatsapp/send
// ═══════════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';

const EVOLUTION_URL  = process.env.EVOLUTION_API_URL  || 'http://localhost:8080';
const EVOLUTION_KEY  = process.env.EVOLUTION_API_KEY  || 'imovai-key-2024';
const INSTANCE_NAME  = process.env.WA_INSTANCE        || 'imovai-jorge';

export async function POST(req: NextRequest) {
  try {
    const { number, text, mediaUrl, type = 'text' } = await req.json();
    
    if (!number || !text) {
      return NextResponse.json({ error: 'number e text são obrigatórios' }, { status: 400 });
    }

    // Formatar número brasileiro
    const formattedNumber = formatBRNumber(number);

    // Tentar enviar via Evolution API
    try {
      const endpoint = type === 'image' 
        ? `${EVOLUTION_URL}/message/sendMedia/${INSTANCE_NAME}`
        : `${EVOLUTION_URL}/message/sendText/${INSTANCE_NAME}`;

      const body = type === 'image'
        ? { number: formattedNumber, media: mediaUrl, caption: text, mediatype: 'image' }
        : { number: formattedNumber, text };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'apikey': EVOLUTION_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ success: true, messageId: data.key?.id, provider: 'evolution' });
      }
    } catch { /* Fallback */ }

    // Fallback: retornar link WhatsApp direto
    const encodedText = encodeURIComponent(text);
    const waLink = `https://wa.me/${formattedNumber}?text=${encodedText}`;
    
    return NextResponse.json({
      success: false,
      demoMode: true,
      waLink,
      message: 'Evolution API offline. Use o link direto.',
      simulatedSend: { number: formattedNumber, text, timestamp: new Date().toISOString() },
    });

  } catch (err) {
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}

function formatBRNumber(number: string): string {
  // Remove tudo que não é dígito
  const digits = number.replace(/\D/g, '');
  
  // Se já começa com 55 (Brasil), retornar como está
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  
  // Se tem 10-11 dígitos, adicionar 55
  if (digits.length >= 10 && digits.length <= 11) return `55${digits}`;
  
  return digits;
}
