import { NextRequest, NextResponse } from 'next/server';

// ── 7 ROLE PROMPTS ──────────────────────────────────────────
const ROLES: Record<string,(ctx:any)=>string> = {
  BEATRIZ:(c)=>`Você é Beatriz, consultora IA da Jorge Miguel Imóveis — Litoral Norte SC.
LEAD: ${c.name||'?'} | Orçamento: ${c.budget||'?'} | Intent: ${c.intent||'?'} | Score: ${c.score||'?'} | Stage: ${c.stage||'novo'}
REGRAS: Máx 180 chars WA · Tom coloquial BR · Varie abertura sempre · Sem bullet points · Emoji máx 1 · Nunca diga IA
TÉCNICAS: SPIN + Challenger Sale + Never Split The Difference. Consultor, não vendedor.`,
  EINSTEIN:()=>`Analise o lead e retorne JSON puro sem markdown: {"score":0-100,"category":"cold|warm|hot|burning","stage":"string","nextAction":"string específica","urgency":"low|medium|high|urgent","insights":["array 3 itens"],"extractedData":{"budget":null,"propertyType":null,"purpose":null}}`,
  CHALLENGER:(c)=>`Follow-up Dia ${c.day||7} para ${c.name||'lead'}. Máx 160 chars. Challenger Sale — ensine algo do mercado SC. 1 CTA direto. Tom pessoal.`,
  RADAR:(c)=>`Analise: "${c.message||'mensagem'}". Retorne JSON: {"isInvestor":bool,"confidence":0-100,"signals":[],"profileType":"investidor_puro|investidor_airbnb|moradia_upgrade|primeiro_imovel","approach":"abordagem recomendada","estimatedBudgetRange":"string"}`,
  VALUATION:(c)=>`Análise investimento: ${c.budget||'R$ 650k'} | Litoral Norte SC | Yield médio 14%/ano | Airbnb 87% ocupação. Retorne: ROI anual, renda mensal, payback, valorização projetada 3 anos, recomendação. Formato compacto e direto.`,
  COPYWRITER:(c)=>`Copy imobiliário para ${c.channel||'WhatsApp'}. Sem clichês (não use "sonho", "oportunidade única", "realize seu sonho"). Use dados reais SC. CTA urgente específico. Tom ${c.tone||'premium'} e autêntico.`,
  ORCHESTRATOR:(c)=>`Sistema IMOVAI OS — Orquestrador. Perfil: ${JSON.stringify(c)}. Escolha o melhor agente e ação. Retorne: {"agent":"BEATRIZ|EINSTEIN|CHALLENGER|RADAR|VALUATION|COPYWRITER","action":"o que fazer","priority":"high|medium|low","reasoning":"motivo em 1 frase","urgency":"urgent|high|normal"}`,
};

const FALLBACKS: Record<string,string[]> = {
  BEATRIZ:['Com R$ 650k em Piçarras você tem apto 3Q beira-mar + yield 14%/ano. Quer a análise? 🏖️','BC valorizou 22% em 2024. Tenho 2 opções no seu orçamento. Quando pode visitar?','Entendo! Com yield 14%/ano o imóvel se paga em 7 anos. Posso mostrar os números?'],
  EINSTEIN:['{"score":78,"category":"warm","stage":"qualificando","nextAction":"Agendar visita presencial","urgency":"medium","insights":["Budget definido","Interesse confirmado","Prazo indefinido"],"extractedData":{"budget":650000,"propertyType":"Apartamento","purpose":"investimento"}}'],
  CHALLENGER:['Saiu dado: Litoral Norte SC +22% em 2024. Quem esperou perdeu R$ 140k de valorização. Seu perfil ainda encaixa — posso mostrar?'],
  RADAR:['{"isInvestor":true,"confidence":85,"signals":["Mencionou yield","Budget alto"],"profileType":"investidor_airbnb","approach":"Apresentar análise ROI + planilha Airbnb","estimatedBudgetRange":"R$ 500k - R$ 800k"}'],
  VALUATION:['R$ 650k → yield 14%/ano → R$ 7.6k/mês Airbnb → Payback 7 anos → Valorização +22%/ano projetada. ✅ Aprovado para investimento.'],
  COPYWRITER:['🏖️ EXCLUSIVO PIÇARRAS — Último 3 suítes frente mar. Yield 14%/ano comprovado. R$ 680k. Responda agora: wa.me/5547984863952'],
  ORCHESTRATOR:['{"agent":"BEATRIZ","action":"Qualificar orçamento e prazo com SPIN","priority":"high","reasoning":"Lead novo sem dados suficientes","urgency":"normal"}'],
};

const OBJECTIONS: [string,string][] = [
  ['caro','Com yield 14%/ano, o imóvel se paga em 7 anos pela renda Airbnb. Posso te mostrar a planilha?'],
  ['financiamento','Caixa financia até 80%. Com FGTS, entrada mínima. Simulo agora pra você?'],
  ['pensar','Sem pressão! Posso reservar 48h enquanto você decide, sem custo.'],
  ['concorrência','Qual outra proposta você recebeu? Faço um comparativo honesto do mercado.'],
  ['caro demais','Entendo. Tenho opções a partir de R$ 320k com yield similar. Posso te mostrar?'],
];

async function callProvider(msgs:any[], key:string, provider:string, model:string, baseUrl:string) {
  const r = await fetch(`${baseUrl}/chat/completions`,{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},
    body:JSON.stringify({model,messages:msgs,max_tokens:350,temperature:0.85}),
    signal:AbortSignal.timeout(9000),
  });
  if(!r.ok) throw new Error(`${provider} ${r.status}`);
  const d = await r.json();
  return {text:d.choices?.[0]?.message?.content||'',provider,model};
}

export async function POST(req:NextRequest) {
  const t0=Date.now();
  try {
    const body = await req.json();
    const {role='BEATRIZ',messages=[],leadContext={},keys={},leadName,budget,leadIntent,score,stage,day,channel} = body;
    const ctx = {...leadContext,name:leadName||leadContext.name,budget:budget||leadContext.budget,intent:leadIntent||leadContext.intent,score:score||leadContext.score,stage:stage||leadContext.stage,day,channel};
    const sys = ROLES[role]?.(ctx)||ROLES.BEATRIZ(ctx);
    const msgs = [{role:'system',content:sys},...messages.slice(-10)];
    const groqKey=keys.groq||process.env.GROQ_API_KEY;
    const grokKey=keys.grok||process.env.GROK_API_KEY;
    const openaiKey=keys.openai||process.env.OPENAI_API_KEY;
    const geminiKey=keys.gemini||process.env.GEMINI_API_KEY;
    let result:any=null;
    const tried:string[]=[];
    if(groqKey){try{result=await callProvider(msgs,groqKey,'groq','llama-3.3-70b-versatile','https://api.groq.com/openai/v1');}catch{tried.push('groq');}}
    if(!result&&grokKey){try{result=await callProvider(msgs,grokKey,'grok','grok-3-mini','https://api.x.ai/v1');}catch{tried.push('grok');}}
    if(!result&&openaiKey){try{result=await callProvider(msgs,openaiKey,'openai','gpt-4o-mini','https://api.openai.com/v1');}catch{tried.push('openai');}}
    if(!result&&geminiKey){
      try{
        const prompt=msgs.map((m:any)=>`${m.role==='user'?'Usuário':'Sistema/Assistente'}: ${m.content}`).join('\n');
        const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}]}),signal:AbortSignal.timeout(9000)});
        if(r.ok){const d=await r.json();result={text:d.candidates?.[0]?.content?.parts?.[0]?.text||'',provider:'gemini',model:'gemini-1.5-flash'};}
      }catch{tried.push('gemini');}
    }
    if(!result?.text){
      const fb=FALLBACKS[role]||FALLBACKS.BEATRIZ;
      result={text:fb[Math.floor(Math.random()*fb.length)],provider:'fallback',model:'local'};
    }
    // Detecção de objeções
    const lastUser=(messages.find((m:any)=>m.role==='user')?.content||messages.slice(-1)[0]?.content||'').toLowerCase();
    const obj=OBJECTIONS.find(([k])=>lastUser.includes(k));
    return NextResponse.json({message:result.text,role,provider:result.provider,model:result.model,triedProviders:tried,durationMs:Date.now()-t0,objectionDetected:obj?.[0]||null,objectionScript:obj?.[1]||null});
  } catch(e) {
    const fb=FALLBACKS.BEATRIZ;
    return NextResponse.json({message:fb[0],role:'BEATRIZ',provider:'fallback',model:'local',error:String(e)});
  }
}
