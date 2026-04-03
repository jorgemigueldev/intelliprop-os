// ═══════════════════════════════════════════════════════════════════════
//  IMOVAI OS v14 — Property Scraper API
//  POST /api/properties/scrape
//  Suporta: ZAP Imóveis, VivaReal, OLX, URLs genéricas
// ═══════════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';

const NEXT_CODE = () => `JM-${Math.floor(1000 + Math.random() * 9000)}`;

// Extrai metadados de Open Graph e Schema.org sem Puppeteer (gratuito)
async function fetchWithMetadata(url: string) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(12000),
  });
  return await res.text();
}

function extractMeta(html: string, property: string): string {
  const patterns = [
    new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i'),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return m[1].trim();
  }
  return '';
}

function extractTitle(html: string): string {
  const og = extractMeta(html, 'og:title');
  if (og) return og;
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].trim() : '';
}

function extractPrice(html: string): number {
  // Padrões de preço brasileiro
  const patterns = [
    /R\$\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2})?)/gi,
    /"price":\s*"?([0-9]+(?:\.[0-9]+)?)"?/gi,
    /priceValue[^>]*>R\$\s*([0-9.,]+)/gi,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) {
      const val = m[0].replace(/[^0-9,]/g, '').replace(',', '.');
      const num = parseFloat(val.replace(/\./g, ''));
      if (num > 50000) return num;
    }
  }
  return 0;
}

function extractImage(html: string, baseUrl: string): string {
  const og = extractMeta(html, 'og:image');
  if (og && og.startsWith('http')) return og;
  
  // Tentar primeira imagem significativa
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+(?:\.jpg|\.jpeg|\.png|\.webp)[^"']*)["']/i);
  if (imgMatch) {
    const src = imgMatch[1];
    return src.startsWith('http') ? src : `${new URL(baseUrl).origin}${src}`;
  }
  return '';
}

function extractCity(html: string, url: string): string {
  const scCities = ['balneário piçarras', 'penha', 'barra velha', 'itapoá', 'navegantes', 
                    'joinville', 'balneário camboriú', 'itajaí', 'bombinhas', 'porto belo',
                    'florianópolis', 'blumenau', 'jaraguá do sul'];
  const content = (html + url).toLowerCase();
  return scCities.find(c => content.includes(c)) || 'Santa Catarina';
}

function detectPortal(url: string): string {
  if (url.includes('zapimoveis')) return 'ZAP Imóveis';
  if (url.includes('vivareal')) return 'VivaReal';
  if (url.includes('olx.com')) return 'OLX';
  if (url.includes('imovelweb')) return 'ImovelWeb';
  if (url.includes('quintoandar')) return 'QuintoAndar';
  return 'Portal Imobiliário';
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    
    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
    }

    let html = '';
    try {
      html = await fetchWithMetadata(url);
    } catch (err) {
      return NextResponse.json({ 
        error: 'Não foi possível acessar a URL. Verifique se é pública.',
        suggestion: 'Cole as informações manualmente no formulário.'
      }, { status: 422 });
    }

    // Extrair dados do imóvel
    const title = extractTitle(html)
      .replace(/\s*[-|]\s*ZAP.*$/i, '')
      .replace(/\s*[-|]\s*VivaReal.*$/i, '')
      .trim() || 'Imóvel importado';

    const price = extractPrice(html);
    const image = extractImage(html, url);
    const city  = extractCity(html, url);
    const portal = detectPortal(url);
    const description = extractMeta(html, 'og:description') || 
                        extractMeta(html, 'description') || 
                        'Imóvel importado automaticamente pelo IMOVAI OS.';

    // Extrair quartos/banheiros de padrões comuns
    const bedroomMatch = html.match(/(\d+)\s*(?:quarto|dorm|suite|suíte)/i);
    const bathMatch    = html.match(/(\d+)\s*banheiro/i);
    const areaMatch    = html.match(/(\d+)\s*m²/i);

    const property = {
      code:        NEXT_CODE(),
      title:       title.substring(0, 100),
      price:       price || 0,
      city,
      type:        title.toLowerCase().includes('casa') ? 'Casa' :
                   title.toLowerCase().includes('terreno') ? 'Terreno' :
                   title.toLowerCase().includes('cobertura') ? 'Cobertura' :
                   title.toLowerCase().includes('studio') ? 'Studio' : 'Apartamento',
      bedrooms:    bedroomMatch ? parseInt(bedroomMatch[1]) : 2,
      bathrooms:   bathMatch ? parseInt(bathMatch[1]) : 1,
      area:        areaMatch ? parseInt(areaMatch[1]) : 0,
      description: description.substring(0, 500),
      photo:       image || `https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80`,
      photos:      image ? [image] : [],
      sourceUrl:   url,
      sourcePortal: portal,
      status:      'disponível',
      importedAt:  new Date().toISOString(),
      yield:       0,
      commission:  price ? Math.round(price * 0.03) : 0,
      developer:   portal,
      tag:         'IMPORTADO',
      tagColor:    '#06B6D4',
    };

    return NextResponse.json({ 
      success: true, 
      property,
      fieldsExtracted: {
        title:    !!property.title,
        price:    price > 0,
        image:    !!image,
        city:     city !== 'Santa Catarina',
        bedrooms: !!bedroomMatch,
        area:     !!areaMatch,
      }
    });

  } catch (err) {
    console.error('[/api/properties/scrape]', err);
    return NextResponse.json({ error: 'Erro ao importar imóvel' }, { status: 500 });
  }
}
