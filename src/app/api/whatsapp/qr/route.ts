// ═══════════════════════════════════════════════════════════════════════
//  IMOVAI OS v14 — WhatsApp QR Code (Evolution API corrigido)
//  GET /api/whatsapp/qr?action=status|qr|connect|disconnect
//  Número do Jorge: 47984863952
// ═══════════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';

const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY || 'imovai-key-2024';
const INSTANCE_NAME = process.env.WA_INSTANCE || 'imovai-jorge';
const JORGE_NUMBER  = '5547984863952'; // WhatsApp: 47984863952

const evoHeaders = { 
  'apikey': EVOLUTION_KEY, 
  'Content-Type': 'application/json' 
};

// Estado em memória (em produção: Redis/Supabase)
let waState = {
  connected: false,
  qrCode: null as string | null,
  qrExpiry: null as number | null,
  phone: JORGE_NUMBER,
  msgCount: 0,
  lastConnected: null as string | null,
  error: null as string | null,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'status';

  switch (action) {
    case 'status': {
      // Tentar verificar status real da Evolution API
      try {
        const res = await fetch(`${EVOLUTION_URL}/instance/connectionState/${INSTANCE_NAME}`, {
          headers: evoHeaders,
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const data = await res.json();
          waState.connected = data?.state?.instance?.state === 'open';
        }
      } catch {
        // Evolution API não disponível — retornar estado local
      }
      return NextResponse.json({
        ...waState,
        evolutionAvailable: false, // indica que a Evolution API está offline
        setupInstructions: getSetupInstructions(),
      });
    }

    case 'qr': {
      try {
        // Tentar buscar QR real da Evolution API
        const res = await fetch(`${EVOLUTION_URL}/instance/qrcode/${INSTANCE_NAME}`, {
          headers: evoHeaders,
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const data = await res.json();
          waState.qrCode = data?.base64 || data?.qrcode?.base64 || null;
          waState.qrExpiry = Date.now() + 60000;
          return NextResponse.json({ qrCode: waState.qrCode, expiry: waState.qrExpiry });
        }
      } catch {
        // Fallback: gerar QR de demonstração com link direto
      }
      
      // QR de demonstração — link WhatsApp direto
      const waLink = `https://wa.me/${JORGE_NUMBER}?text=Olá!+Tenho+interesse+em+imóveis+de+alto+padrão`;
      return NextResponse.json({
        qrCode: null,
        waLink,
        demoMode: true,
        message: 'Evolution API não configurada. Use o link direto do WhatsApp.',
        setupInstructions: getSetupInstructions(),
      });
    }

    case 'connect': {
      try {
        // Criar instância na Evolution API
        const res = await fetch(`${EVOLUTION_URL}/instance/create`, {
          method: 'POST',
          headers: evoHeaders,
          body: JSON.stringify({
            instanceName: INSTANCE_NAME,
            token: EVOLUTION_KEY,
            qrcode: true,
            integration: 'WHATSAPP-BAILEYS',
          }),
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          const data = await res.json();
          waState.qrCode = data?.qrcode?.base64 || null;
          return NextResponse.json({ 
            success: true, 
            qrCode: waState.qrCode,
            instanceName: INSTANCE_NAME,
          });
        }
      } catch {
        // Não conseguiu conectar
      }
      return NextResponse.json({
        success: false,
        demoMode: true,
        whatsappLink: `https://wa.me/${JORGE_NUMBER}`,
        instructions: getSetupInstructions(),
      });
    }

    case 'disconnect': {
      try {
        await fetch(`${EVOLUTION_URL}/instance/logout/${INSTANCE_NAME}`, {
          method: 'DELETE',
          headers: evoHeaders,
        });
      } catch { /* silently fail */ }
      waState.connected = false;
      waState.qrCode = null;
      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  }
}

function getSetupInstructions() {
  return {
    step1: 'Instale a Evolution API: git clone https://github.com/EvolutionAPI/evolution-api',
    step2: 'Configure no .env.local: EVOLUTION_API_URL=http://localhost:8080',
    step3: 'Configure no .env.local: EVOLUTION_API_KEY=sua-chave',
    step4: 'Execute: docker-compose up -d',
    step5: 'Clique em "Conectar" e escaneie o QR Code com o WhatsApp',
    alternativa: 'Use o link direto: https://wa.me/5547984863952',
    docsUrl: 'https://doc.evolution-api.com/v2/',
  };
}
