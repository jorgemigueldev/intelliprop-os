// ═══════════════════════════════════════════════════════════════════════
//  IMOVAI OS v13 — API Route: WhatsApp Webhook
//  POST /api/whatsapp/webhook  — recebe mensagens da Evolution API
//  GET  /api/whatsapp/status   — status da conexão
// ═══════════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';

// Estado da conexão WhatsApp (em produção: Redis/Supabase)
let waStatus = {
  connected:  false,
  phone:      '+55 47 98916-0113',
  qrCode:     null as string | null,
  lastSeen:   null as string | null,
  msgCount:   0,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'status') {
    return NextResponse.json({
      ...waStatus,
      uptime: waStatus.connected ? '2h 34m' : null,
    });
  }

  if (action === 'qr') {
    // Em produção: gerar QR via Evolution API / Baileys
    return NextResponse.json({
      qrCode: 'data:image/png;base64,iVBORw0KGgo=', // placeholder
      expiresIn: 60,
    });
  }

  return NextResponse.json(waStatus);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, data } = body;

    console.log('[WhatsApp Webhook]', event, JSON.stringify(data).slice(0, 100));

    switch (event) {
      case 'connection.update':
        if (data.state === 'open') {
          waStatus.connected = true;
          waStatus.lastSeen  = new Date().toISOString();
        } else if (data.state === 'close') {
          waStatus.connected = false;
        }
        break;

      case 'qrcode.updated':
        waStatus.qrCode = data.qrcode?.base64 || null;
        break;

      case 'messages.upsert':
        const msgs = Array.isArray(data.messages) ? data.messages : [data];
        waStatus.msgCount += msgs.length;

        for (const msg of msgs) {
          if (!msg.key?.fromMe) {
            // Mensagem recebida de cliente
            const from    = msg.key?.remoteJid?.replace('@s.whatsapp.net', '');
            const text    = msg.message?.conversation
                         || msg.message?.extendedTextMessage?.text
                         || '[mídia]';

            console.log(`[WA] Mensagem de ${from}: ${text}`);

            // Em produção: processar com IA, atualizar lead, enviar resposta
            await processIncomingMessage(from, text);
          }
        }
        break;
    }

    return NextResponse.json({ ok: true, event });
  } catch (err) {
    console.error('[WA Webhook] Erro:', err);
    return NextResponse.json({ error: 'Erro no webhook' }, { status: 500 });
  }
}

async function processIncomingMessage(from: string | undefined, text: string) {
  if (!from) return;

  // Fluxo 1: Qualificação automática
  if (/interesse|comprar|investir|imóvel|apartamento|casa/i.test(text)) {
    console.log(`[Bot] Lead detectado de ${from}: "${text}"`);
    // Em produção: criar lead, enviar resposta via Evolution API
  }

  // Fluxo 2: Resposta a interesse em imóvel específico
  const codeMatch = text.match(/JM-\d+/i);
  if (codeMatch) {
    console.log(`[Bot] Interesse no imóvel ${codeMatch[0]} de ${from}`);
    // Em produção: enviar PDF do imóvel, ROI, agenda de visita
  }
}
