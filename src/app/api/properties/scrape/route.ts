import { NextRequest, NextResponse } from 'next/server';
export async function POST(req:NextRequest){
  try{
    const {url}=await req.json();
    if(!url?.startsWith('http'))return NextResponse.json({error:'URL inválida'},{status:400});
    const portal=url.includes('zapimoveis')?'ZAP Imóveis':url.includes('vivareal')?'VivaReal':url.includes('olx')?'OLX':url.includes('rogga')||url.includes('vetter')||url.includes('hacasa')?'Construtora':'Portal';
    let property:any=null;
    try{
      const res=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36','Accept-Language':'pt-BR,pt;q=0.9'},signal:AbortSignal.timeout(8000)});
      if(res.ok){
        const html=await res.text();
        let title='',price=0,photo='',city='SC',area=0,bedrooms=0,description='';
        const tm=html.match(/<h1[^>]*>([^<]{10,100})<\/h1>/i)||html.match(/<title>([^<]{10,80})<\/title>/i);
        if(tm)title=tm[1].replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').trim();
        const pm=html.match(/R\$\s*([\d.,]+)/i);if(pm)price=parseFloat(pm[1].replace(/\./g,'').replace(',','.'));
        const im=html.match(/og:image.*?content="([^"]+)"/i)||html.match(/<img[^>]+src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp))[^"]*"/i);if(im)photo=im[1];
        const am=html.match(/(\d+)\s*m²/i);if(am)area=parseInt(am[1]);
        const bm=html.match(/(\d+)\s*(?:quartos?|dormitórios?)/i);if(bm)bedrooms=parseInt(bm[1]);
        const dm=html.match(/og:description.*?content="([^"]{20,300})"/i);if(dm)description=dm[1].replace(/&amp;/g,'&').trim();
        if(html.toLowerCase().includes('balneário camboriú'))city='Balneário Camboriú';
        else if(html.toLowerCase().includes('piçarras')||url.includes('picarra'))city='Balneário Piçarras';
        else if(html.toLowerCase().includes('penha'))city='Penha';
        else if(html.toLowerCase().includes('barra velha'))city='Barra Velha';
        else if(html.toLowerCase().includes('navegantes'))city='Navegantes';
        else if(html.toLowerCase().includes('joinville'))city='Joinville';
        if(title||price||photo)property={title:title||`Imóvel ${portal}`,price,description,photo,city,area,bedrooms,developer:portal,source:url};
      }
    }catch{}
    if(!property){
      const isBeach=url.includes('balneario')||url.includes('penha')||url.includes('picarra')||url.includes('barra');
      property={title:`Imóvel ${portal}`,price:0,description:`Importado de ${portal}. URL: ${url}`,photo:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',city:isBeach?'Balneário Piçarras':'Joinville',area:0,bedrooms:2,developer:portal,source:url};
    }
    return NextResponse.json({success:true,property,portal,sourceUrl:url});
  }catch(e){return NextResponse.json({error:String(e)},{status:500});}
}
