import { NextRequest, NextResponse } from 'next/server';
export async function POST(req:NextRequest) {
  try {
    const {targets=[],template='',channel='wa',campaignName='Campanha'} = await req.json();
    const evoUrl=process.env.EVOLUTION_API_URL,evoKey=process.env.EVOLUTION_API_KEY,inst=process.env.EVOLUTION_INSTANCE||'imovai-jorge';
    const results=[]; let sentViaAPI=0;
    for(const t of targets) {
      const fn=(t.name||'').split(' ')[0];
      const msg=template.replace(/{nome}/gi,fn).replace(/{cidade}/gi,t.city||'SC').replace(/{orcamento}/gi,t.budget||'').replace(/{intent}/gi,t.intent||'');
      const clean=(t.phone||'').replace(/\D/g,''),full=clean.startsWith('55')?clean:`55${clean}`,waLink=`https://wa.me/${full}?text=${encodeURIComponent(msg)}`;
      let sent=false;
      if(evoUrl&&evoKey&&channel==='wa'){try{const r=await fetch(`${evoUrl}/message/sendText/${inst}`,{method:'POST',headers:{'Content-Type':'application/json',apikey:evoKey},body:JSON.stringify({number:full,text:msg}),signal:AbortSignal.timeout(5000)});if(r.ok){sent=true;sentViaAPI++;}}catch{}}
      results.push({id:t.id,name:t.name,phone:full,message:msg,waLink,sent,channel});
    }
    return NextResponse.json({success:true,total:results.length,sentViaAPI,generatedLinks:results.length-sentViaAPI,campaignName,summary:sentViaAPI>0?`${sentViaAPI} enviados via Evolution API, ${results.length-sentViaAPI} links gerados`:`${results.length} links WhatsApp gerados`,results});
  } catch(e){return NextResponse.json({error:String(e)},{status:500});}
}
export async function GET() {
  return NextResponse.json({history:[{id:1,name:'Lançamento Rôgga',sent:342,read:298,replies:67,date:'04/04/2026'},{id:2,name:'Vetter Alta Renda',sent:560,read:412,replies:89,date:'10/03/2026'}]});
}
