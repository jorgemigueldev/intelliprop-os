import { NextRequest, NextResponse } from 'next/server';
const WA='5547984863952',WA_DISPLAY='(47) 98486-3952';
export async function GET(req:NextRequest) {
  const action=new URL(req.url).searchParams.get('action');
  const evoUrl=process.env.EVOLUTION_API_URL,evoKey=process.env.EVOLUTION_API_KEY,inst=process.env.EVOLUTION_INSTANCE||'imovai-jorge';
  if(action==='status'){
    let status='demo';
    if(evoUrl&&evoKey){try{const r=await fetch(`${evoUrl}/instance/connectionState/${inst}`,{headers:{apikey:evoKey},signal:AbortSignal.timeout(4000)});if(r.ok){const d=await r.json();status=d.state==='open'?'connected':d.state==='connecting'?'qr':'disconnected';}}catch{}}
    return NextResponse.json({status,number:WA,display:WA_DISPLAY,waLink:`https://wa.me/${WA}`,evolutionConfigured:!!(evoUrl&&evoKey)});
  }
  if(action==='qr'){
    if(evoUrl&&evoKey){try{const r=await fetch(`${evoUrl}/instance/qrcode/${inst}`,{headers:{apikey:evoKey},signal:AbortSignal.timeout(8000)});if(r.ok){const d=await r.json();return NextResponse.json({qrCode:d.base64||d.qrcode,demoMode:false});}}catch{}}
    return NextResponse.json({demoMode:true,waLink:`https://wa.me/${WA}`,waNumber:WA,waDisplay:WA_DISPLAY});
  }
  return NextResponse.json({number:WA,display:WA_DISPLAY,waLink:`https://wa.me/${WA}`});
}
export async function POST(req:NextRequest) {
  try {
    const {phone,message,action}=await req.json();
    const evoUrl=process.env.EVOLUTION_API_URL,evoKey=process.env.EVOLUTION_API_KEY;
    if(action==='connect'){
      if(evoUrl&&evoKey){try{const r=await fetch(`${evoUrl}/instance/create`,{method:'POST',headers:{'Content-Type':'application/json',apikey:evoKey},body:JSON.stringify({instanceName:process.env.EVOLUTION_INSTANCE||'imovai-jorge',qrcode:true}),signal:AbortSignal.timeout(8000)});if(r.ok){const d=await r.json();return NextResponse.json({success:true,qrCode:d.qrcode?.base64});}}catch{}}
      return NextResponse.json({success:false,demoMode:true,waLink:`https://wa.me/${WA}`});
    }
    if(!phone||!message)return NextResponse.json({error:'phone e message obrigatórios'},{status:400});
    const clean=phone.replace(/\D/g,''),full=clean.startsWith('55')?clean:`55${clean}`;
    if(evoUrl&&evoKey){try{const r=await fetch(`${evoUrl}/message/sendText/${process.env.EVOLUTION_INSTANCE||'imovai-jorge'}`,{method:'POST',headers:{'Content-Type':'application/json',apikey:evoKey},body:JSON.stringify({number:full,text:message}),signal:AbortSignal.timeout(8000)});if(r.ok){const d=await r.json();return NextResponse.json({success:true,provider:'evolution',messageId:d.key?.id});}}catch{}}
    return NextResponse.json({success:false,provider:'link',waLink:`https://wa.me/${full}?text=${encodeURIComponent(message)}`});
  }catch(e){return NextResponse.json({error:String(e)},{status:500});}
}
