// ═══════════════════════════════════════════════════════════════════════
//  IMOVAI OS v13 — API Route: Gerar PDF de Imóvel
//  POST /api/properties/pdf
// ═══════════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { property, lead } = await req.json();

    // Gerar conteúdo do PDF em HTML (em produção: usar Puppeteer ou @vercel/og)
    const pdfContent = generatePropertyPDF(property, lead);

    return NextResponse.json({
      success: true,
      html:    pdfContent,
      code:    property.code,
      title:   property.title,
      message: `PDF do ${property.code} gerado com sucesso!`,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao gerar PDF' }, { status: 500 });
  }
}

function generatePropertyPDF(property: Record<string, unknown>, lead?: Record<string, unknown>): string {
  const price   = (property.price as number) || 0;
  const yieldV  = (property.yield as number) || 0;
  const area    = (property.area as number)  || 0;
  const monthlyRent = yieldV > 0 ? Math.round((price * yieldV / 100) / 12) : 0;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${property.code} — ${property.title}</title>
  <style>
    body{font-family:'Georgia',serif;background:#F8F7F4;margin:0;padding:40px;color:#1A1A1A}
    .header{background:#020408;color:white;padding:32px;border-radius:12px;margin-bottom:32px}
    .logo{font-size:12px;letter-spacing:4px;color:#C9A84C;text-transform:uppercase;margin-bottom:8px}
    .title{font-size:28px;font-weight:700;margin-bottom:4px}
    .subtitle{font-size:14px;color:#8A9BB5}
    .price{font-size:36px;font-weight:900;color:#C9A84C;margin-top:16px}
    .section{background:white;border-radius:8px;padding:24px;margin-bottom:16px;border:1px solid #E8E4DC}
    .section-title{font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#888;margin-bottom:16px}
    .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
    .kpi{text-align:center;padding:16px;background:#F8F7F4;border-radius:6px}
    .kpi-val{font-size:24px;font-weight:700;color:#1A1A1A}
    .kpi-lab{font-size:11px;color:#888;margin-top:4px}
    .feat-list{display:flex;flex-wrap:wrap;gap:8px}
    .feat{background:#F0F0EC;padding:4px 12px;border-radius:4px;font-size:12px}
    .footer{text-align:center;margin-top:32px;font-size:11px;color:#888}
    .yield-highlight{background:#10B98115;border:1px solid #10B98130;border-radius:8px;padding:16px;text-align:center}
    .yield-num{font-size:32px;font-weight:900;color:#10B981}
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">⬡ JORGE MIGUEL IMÓVEIS</div>
    <div class="title">${property.title}</div>
    <div class="subtitle">${property.city} · ${property.developer} · ${property.type}</div>
    <div class="price">R$ ${price >= 1000000 ? (price/1000000).toFixed(2)+'M' : (price/1000).toFixed(0)+'k'}</div>
    ${lead ? `<div style="margin-top:12px;font-size:12px;color:#C9A84C">Apresentação exclusiva para ${lead.name}</div>` : ''}
  </div>

  <div class="section">
    <div class="section-title">Informações do Imóvel</div>
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-val">${area}m²</div><div class="kpi-lab">Área</div></div>
      <div class="kpi"><div class="kpi-val">${property.bedrooms}</div><div class="kpi-lab">Dormitórios</div></div>
      <div class="kpi"><div class="kpi-val">${property.beach}</div><div class="kpi-lab">Distância Praia</div></div>
      <div class="kpi"><div class="kpi-val">${property.launchDate}</div><div class="kpi-lab">Entrega</div></div>
    </div>
  </div>

  ${yieldV > 0 ? `
  <div class="section">
    <div class="section-title">Análise de Investimento — ROI</div>
    <div class="yield-highlight">
      <div class="yield-num">${yieldV}% a.a.</div>
      <div style="color:#059669;margin-top:4px">Yield Airbnb — R$ ${monthlyRent.toLocaleString('pt-BR')}/mês</div>
    </div>
    <div class="kpi-grid" style="margin-top:16px">
      <div class="kpi"><div class="kpi-val">R$ ${monthlyRent.toLocaleString('pt-BR')}</div><div class="kpi-lab">Renda Mensal</div></div>
      <div class="kpi"><div class="kpi-val">${Math.round(100/yieldV)} anos</div><div class="kpi-lab">Payback</div></div>
      <div class="kpi"><div class="kpi-val">${Math.round(yieldV*5)}%</div><div class="kpi-lab">Retorno 5 anos</div></div>
      <div class="kpi"><div class="kpi-val">+22%/ano</div><div class="kpi-lab">Valorização</div></div>
    </div>
  </div>` : ''}

  <div class="section">
    <div class="section-title">Características</div>
    <div class="feat-list">
      ${((property.features as string[]) || []).map((f: string) => `<span class="feat">${f}</span>`).join('')}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Descrição</div>
    <p style="line-height:1.8;color:#444">${property.description}</p>
    <p style="margin-top:12px;color:#888;font-size:13px">${property.address}</p>
  </div>

  <div class="footer">
    <strong>Jorge Miguel Imóveis</strong> · CRECI-SC · (47) 98916-0113 · @jorgemiguelimoveis<br>
    Balneário Piçarras · Penha · Barra Velha · Itapoá · Navegantes · Joinville<br>
    <em>Documento gerado pelo IMOVAI OS v13 em ${new Date().toLocaleDateString('pt-BR')}</em>
  </div>
</body>
</html>`;
}
