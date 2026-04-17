import { NextRequest, NextResponse } from 'next/server';
const FALLBACKS:Record<number,string>={
  3:'{nome}, o Litoral Norte SC valorizou 22% em 2024. Com {budget}, yield 14%/ano = retorno real. 5 min?',
  7:'{nome}, tenho um imóvel novo que encaixa perfeitamente no seu perfil. Posso te mostrar rapidinho?',
  30:'{nome}! Uma unidade reservada foi liberada — exatamente o que você busca. 24h de prioridade. Quer ver?',
};
export async function POST(req:NextRequest) {
  try {
    const {leadId,leadName='',leadPhone='',intent='',day=7,budget='',generateWithAI=true}=await req.json();
    const fn=leadName.split(' ')[0];
    let message=FALLBACKS[day]?.replace(/{nome}/g,fn).replace(/{budget}/g,budget)||FALLBACKS[7].replace(/{nome}/g,fn).replace(/{budget}/g,budget);
    const groqKey=process.env.GROQ_API_KEY;
    if(generateWithAI&&groqKey){
      try{
        const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${groqKey}`},body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:[{role:'system',content:'Corretor imobiliário brasileiro. Responda APENAS com a mensagem WA, sem explicações.'},{role:'user',content:`Follow-up Dia ${day} para ${fn}. Intent: ${intent}. Budget: ${budget}. Litoral Norte SC. Challenger Sale. Máx 160 chars. 1 CTA.`}],max_tokens:80,temperature:0.9}),signal:AbortSignal.timeout(7000)});
        if(r.ok){const d=await r.json();const m=d.choices?.[0]?.message?.content?.trim();if(m)message=m.replace(/^["']|["']$/g,'');}
      }catch{}
    }
    const clean=(leadPhone||'').replace(/\D/g,''),full=clean.startsWith('55')?clean:`55${clean}`,waLink=`https://wa.me/${full}?text=${encodeURIComponent(message)}`;
    const evoUrl=process.env.EVOLUTION_API_URL,evoKey=process.env.EVOLUTION_API_KEY;
    let sentViaAPI=false;
    if(evoUrl&&evoKey){try{const r=await fetch(`${evoUrl}/message/sendText/${process.env.EVOLUTION_INSTANCE||'imovai-jorge'}`,{method:'POST',headers:{'Content-Type':'application/json',apikey:evoKey},body:JSON.stringify({number:full,text:message}),signal:AbortSignal.timeout(5000)});if(r.ok)sentViaAPI=true;}catch{}}
    return NextResponse.json({success:true,message,waLink,sentViaAPI,day,leadId});
  }catch(e){return NextResponse.json({error:String(e)},{status:500});}
}
