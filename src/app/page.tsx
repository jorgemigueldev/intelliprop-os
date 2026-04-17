'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

// ─── DESIGN TOKENS ────────────────────────────────────────
const T = {
  bg:'#07090f', bg2:'#0d1117', bg3:'#111827', bg4:'#1a2332',
  border:'#1e2736', borderHi:'#2a3a52',
  gold:'#C9A84C', goldL:'#E8C96A', goldDim:'rgba(201,168,76,0.12)', goldGlow:'rgba(201,168,76,0.28)',
  navy:'#0A1628',
  green:'#00e676', red:'#ff1744', yellow:'#ffd600', orange:'#ff6d00',
  purple:'#b388ff', teal:'#1ABC9C', cyan:'#06B6D4', accent:'#00d4ff',
  wa:'#25D366', t1:'#e8edf5', t2:'#8899aa', t3:'#4a5a6a',
} as const;

// ─── DADOS INICIAIS ─────────────────────────────────────
const LEADS0 = [
  {id:1,name:'Carlos Mendonça',phone:'47991234567',email:'carlos@email.com',budget:'R$ 680k',budgetN:680000,intent:'investimento',source:'Instagram',city:'Balneário Piçarras',propType:'Apartamento',score:94,stage:'visita',lastContact:1,av:'CM',color:T.gold,notes:'Quer yield alto, patrimônio disponível',ch:'whatsapp',heatSignals:['Mencionou ROI','Perguntou yield','Urgência expressa'],purchasePower:'alto',profileType:'investidor_puro'},
  {id:2,name:'Fernanda Lima',phone:'47998765432',email:'fl@email.com',budget:'R$ 520k',budgetN:520000,intent:'moradia',source:'ZAP Imóveis',city:'Penha',propType:'Casa',score:76,stage:'proposta',lastContact:2,av:'FL',color:T.accent,notes:'Família 2 filhos, quer jardim',ch:'instagram',heatSignals:['Visitou 3x o site','Pediu planta baixa'],purchasePower:'médio',profileType:'familia_upgrade'},
  {id:3,name:'Ricardo Souza',phone:'47997654321',email:'rs@email.com',budget:'R$ 1.25M',budgetN:1250000,intent:'investimento',source:'Indicação',city:'Barra Velha',propType:'Cobertura',score:91,stage:'negociacao',lastContact:0,av:'RS',color:T.green,notes:'Empresário, portfólio imobiliário',ch:'linkedin',heatSignals:['Portfólio >R$5M','Decisão rápida','Referenciado VIP'],purchasePower:'muito_alto',profileType:'investidor_portfolio'},
  {id:4,name:'Ana Paula Vieira',phone:'47996543210',email:'ap@email.com',budget:'R$ 740k',budgetN:740000,intent:'moradia',source:'Google',city:'Balneário Piçarras',propType:'Apartamento',score:71,stage:'qualificando',lastContact:3,av:'AV',color:T.purple,notes:'Primeiro apê pós-casamento',ch:'whatsapp',heatSignals:['Recém casada','Mudança planejada'],purchasePower:'médio_alto',profileType:'moradia_primeira'},
  {id:5,name:'Marcos Oliveira',phone:'47995432109',email:'mo@email.com',budget:'R$ 2.1M',budgetN:2100000,intent:'investimento',source:'Instagram',city:'Joinville',propType:'Cobertura',score:89,stage:'visita',lastContact:0,av:'MO',color:T.orange,notes:'Escritório + moradia alto padrão',ch:'whatsapp',heatSignals:['Alta liquidez','BC como destino final','Airbnb mencionado'],purchasePower:'muito_alto',profileType:'investidor_airbnb'},
  {id:6,name:'Tatiana Luz',phone:'47994321098',email:'tl@email.com',budget:'R$ 1.8M',budgetN:1800000,intent:'investimento',source:'LinkedIn',city:'BC',propType:'Penthouse',score:95,stage:'fechamento',lastContact:0,av:'TL',color:T.teal,notes:'Portfólio SC, decisão rápida',ch:'linkedin',heatSignals:['Score máximo','Portfólio >R$10M','Urgência alta'],purchasePower:'muito_alto',profileType:'investidor_portfolio'},
  {id:7,name:'Bruno Cavalcanti',phone:'47993210987',email:'bc@email.com',budget:'R$ 290k',budgetN:290000,intent:'moradia',source:'TikTok',city:'Jaraguá',propType:'Geminado',score:55,stage:'novo',lastContact:8,av:'BC',color:'#f48fb1',notes:'Primeira compra, inseguro',ch:'whatsapp',heatSignals:['Primeira compra'],purchasePower:'médio_baixo',profileType:'moradia_primeira'},
  {id:8,name:'Rafael Mendes',phone:'47992109876',email:'rm@email.com',budget:'R$ 600k',budgetN:600000,intent:'investimento',source:'Facebook',city:'Itapoá',propType:'Apartamento',score:82,stage:'qualificando',lastContact:5,av:'RM',color:T.red,notes:'Airbnb investimento praia',ch:'facebook',heatSignals:['Airbnb pesquisado','Praia como critério'],purchasePower:'médio_alto',profileType:'investidor_airbnb'},
];

const PROPS0 = [
  {id:1,title:'Rôgga Oceano Club — 3 Suítes',dev:'Rôgga',city:'Balneário Piçarras',type:'Apartamento',price:648000,area:89,beds:3,status:'disponível',yield:14.2,photo:'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80',roi:'R$ 7.6k/mês · Payback 7 anos',tags:['frente-mar','smart-home']},
  {id:2,title:'Vetter Grand Residence',dev:'Vetter',city:'Barra Velha',type:'Cobertura',price:1240000,area:180,beds:4,status:'disponível',yield:13.8,photo:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80',roi:'R$ 14.2k/mês · Payback 8 anos',tags:['cobertura','piscina']},
  {id:3,title:'Hacasa Penha Residences',dev:'Hacasa',city:'Penha',type:'Apartamento',price:524000,area:72,beds:2,status:'disponível',yield:15.1,photo:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80',roi:'R$ 6.6k/mês · Payback 6.5 anos',tags:['praia','airbnb']},
  {id:4,title:'SBJ Marina Towers',dev:'SBJ',city:'Navegantes',type:'Apartamento',price:730000,area:95,beds:3,status:'reservado',yield:13.5,photo:'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=80',roi:'R$ 8.2k/mês · Payback 7.4 anos',tags:['marina','investimento']},
  {id:5,title:'Inbrasul Signature BC',dev:'Inbrasul',city:'Balneário Camboriú',type:'Penthouse',price:2100000,area:280,beds:4,status:'disponível',yield:12.8,photo:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',roi:'R$ 22.4k/mês · Payback 8 anos',tags:['bc','ultra-luxo']},
  {id:6,title:'Rottas Casa Geminada',dev:'Rottas',city:'Jaraguá do Sul',type:'Geminado',price:319000,area:58,beds:2,status:'disponível',yield:11.2,photo:'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80',roi:'R$ 2.9k/mês · Payback 9 anos',tags:['casa','condomínio']},
  {id:7,title:'Fabro Haas Premium',dev:'Fabro Haas',city:'Itapoá',type:'Apartamento',price:487000,area:68,beds:2,status:'disponível',yield:16.2,photo:'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&q=80',roi:'R$ 6.5k/mês · Payback 6 anos',tags:['melhor-yield','praia']},
];

const STAGES = ['novo','qualificando','visita','proposta','negociacao','fechamento','pós-venda'];
const STAGE_COLORS: Record<string,string> = {novo:T.t3,qualificando:T.cyan,visita:T.orange,proposta:T.purple,negociacao:T.red,fechamento:T.gold,['pós-venda']:T.green};
const STAGE_LABEL: Record<string,string> = {novo:'Novo',qualificando:'Qualificando',visita:'Visita',proposta:'Proposta',negociacao:'Negociação',fechamento:'Fechamento',['pós-venda']:'Pós-Venda'};

// ─── TIPOS ─────────────────────────────────────────────
type Lead = typeof LEADS0[0];
type Prop = typeof PROPS0[0];
type ChatMsg = {role:'user'|'ai';text:string;ts:string;role_label?:string};
type Toast = {id:number;title:string;msg:string;ico:string;type?:'success'|'warn'|'error'};

// ─── HELPERS ─────────────────────────────────────────
const fmtN = (n:number) => n.toLocaleString('pt-BR');
const fmtC = (n:number) => n>=1e6?`R$ ${(n/1e6).toFixed(1)}M`:n>=1e3?`R$ ${(n/1e3).toFixed(0)}k`:`R$ ${fmtN(n)}`;
const fmtScore = (s:number) => s>=90?{label:'🔥 Burning',c:T.gold}:s>=75?{label:'🔴 Hot',c:T.red}:s>=55?{label:'🟡 Warm',c:T.orange}:{label:'🔵 Cold',c:T.t3};
const waLink = (phone:string, msg:string='') => `https://wa.me/55${phone.replace(/\D/g,'')}${msg?`?text=${encodeURIComponent(msg)}`:''}`;
const now = () => new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});

// ─── ESTILOS BASE ────────────────────────────────────
const S = {
  btn:(c='gold') => ({padding:'7px 14px',background:c==='gold'?T.gold:'transparent',border:`1px solid ${c==='gold'?T.gold:T.border}`,borderRadius:8,color:c==='gold'?T.navy:T.t2,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}) as React.CSSProperties,
  card: {background:T.bg2,border:`1px solid ${T.border}`,borderRadius:12,padding:18} as React.CSSProperties,
  input: {background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,padding:'8px 12px',color:T.t1,fontSize:12,fontFamily:'inherit',outline:'none',width:'100%',boxSizing:'border-box'} as React.CSSProperties,
  label: {fontSize:9,fontWeight:600,color:T.t3,textTransform:'uppercase',letterSpacing:1.5,display:'block',marginBottom:4} as React.CSSProperties,
};

// ─── COMPONENTE TOAST ──────────────────────────────
function ToastContainer({toasts,remove}:{toasts:Toast[];remove:(id:number)=>void}) {
  return (
    <div style={{position:'fixed',bottom:20,right:20,zIndex:9999,display:'flex',flexDirection:'column',gap:8}}>
      {toasts.map(t => (
        <div key={t.id} onClick={()=>remove(t.id)} style={{background:T.bg3,border:`1px solid ${t.type==='error'?T.red:t.type==='warn'?T.orange:T.goldGlow}`,borderRadius:10,padding:'10px 14px',display:'flex',gap:10,alignItems:'flex-start',cursor:'pointer',animation:'slideIn .25s ease',minWidth:260,maxWidth:340,boxShadow:`0 8px 24px rgba(0,0,0,.5)`}}>
          <span style={{fontSize:16}}>{t.ico}</span>
          <div><div style={{fontSize:12,fontWeight:600,color:T.t1}}>{t.title}</div><div style={{fontSize:11,color:T.t2,marginTop:2}}>{t.msg}</div></div>
        </div>
      ))}
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ─── MODAL GENÉRICO ────────────────────────────────
function Modal({open,onClose,title,children,width=520}:{open:boolean;onClose:()=>void;title:string;children:React.ReactNode;width?:number}) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.bg2,border:`1px solid ${T.goldGlow}`,borderRadius:16,padding:28,width:'100%',maxWidth:width,maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',alignItems:'center',marginBottom:20}}>
          <h3 style={{margin:0,fontSize:16,fontFamily:'Syne, sans-serif',color:T.t1}}>{title}</h3>
          <button onClick={onClose} style={{marginLeft:'auto',background:'none',border:'none',color:T.t3,cursor:'pointer',fontSize:18}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── HEAT SCORE BADGE ──────────────────────────────
function HeatBadge({score}:{score:number}) {
  const {label,c} = fmtScore(score);
  return <span style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:9,background:`${c}22`,color:c}}>{label}</span>;
}

// ─── MINI STAT CARD ────────────────────────────────
function StatCard({label,value,delta,color,icon,onClick}:{label:string;value:string;delta?:string;color?:string;icon:string;onClick?:()=>void}) {
  const c = color || T.gold;
  return (
    <div onClick={onClick} style={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:12,padding:'16px 18px',position:'relative',overflow:'hidden',cursor:onClick?'pointer':'default',transition:'all .15s'}}
      onMouseEnter={e=>{if(onClick)(e.currentTarget as HTMLElement).style.borderColor=c+'66'}}
      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=T.border}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${c},transparent)`}}/>
      <div style={{position:'absolute',right:14,top:14,fontSize:22,opacity:.08}}>{icon}</div>
      <div style={{fontSize:9,fontWeight:600,color:T.t3,textTransform:'uppercase',letterSpacing:1.5,marginBottom:8}}>{label}</div>
      <div style={{fontFamily:'Syne, sans-serif',fontSize:22,fontWeight:700,color:c,lineHeight:1,marginBottom:6}}>{value}</div>
      {delta && <div style={{fontSize:10,color:T.green}}>▲ {delta}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
export default function IMOVAI() {
  const [tab, setTab] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>(LEADS0);
  const [props, setProps] = useState<Prop[]>(PROPS0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([{role:'ai',text:'Olá! Sou a Beatriz 🏖️ Sua consultora IA do Litoral Norte SC. Como posso te ajudar hoje?',ts:now(),role_label:'BEATRIZ'}]);
  const [chatIn, setChatIn] = useState('');
  const [chatLoad, setChatLoad] = useState(false);
  const [aiRole, setAiRole] = useState('BEATRIZ');
  const [selLead, setSelLead] = useState<Lead|null>(null);
  
  // Lead CRUD
  const [showLM, setShowLM] = useState(false);
  const [editL, setEditL] = useState<Lead|null>(null);
  const [lf, setLf] = useState({name:'',phone:'',email:'',budget:'',budgetN:0,intent:'investimento',source:'WhatsApp',city:'Balneário Piçarras',propType:'Apartamento',notes:'',stage:'novo'});
  const [lFilter, setLFilter] = useState('todos');
  const [lSearch, setLSearch] = useState('');
  
  // Prop CRUD
  const [showPM, setShowPM] = useState(false);
  const [editP, setEditP] = useState<Prop|null>(null);
  const [pf, setPf] = useState({title:'',dev:'',city:'',type:'Apartamento',price:0,area:0,beds:2,status:'disponível',yield:13,photo:'',notes:''});
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scrapeLoad, setScrapeLoad] = useState(false);
  
  // Blast
  const [blastTemplate, setBlastTemplate] = useState('Olá {nome}! 🏖️ Tenho uma novidade exclusiva no Litoral Norte SC que encaixa no seu perfil. Posso te mostrar em 5 min?');
  const [blastTarget, setBlastTarget] = useState('hot');
  const [blastLoad, setBlastLoad] = useState(false);
  const [blastResults, setBlastResults] = useState<any[]>([]);
  
  // Follow-up
  const [fuLoad, setFuLoad] = useState<number|null>(null);
  const [fuResults, setFuResults] = useState<Record<number,{msg:string;link:string}>>({});
  
  // Kanban drag
  const [dragging, setDragging] = useState<number|null>(null);
  
  // WA Status
  const [waStatus, setWaStatus] = useState<any>(null);
  
  // AI Test
  const [aiTestMsg, setAiTestMsg] = useState('');
  const [aiTestResult, setAiTestResult] = useState('');
  const [aiTestLoad, setAiTestLoad] = useState(false);
  const [aiTestRole, setAiTestRole] = useState('BEATRIZ');
  
  // Config keys
  const [keys, setKeys] = useState({groq:'',grok:'',openai:'',gemini:''});
  
  // Recommendations
  const [recommendations, setRecommendations] = useState<{lead:Lead;props:Prop[];score:number}[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const toast = useCallback((title:string, msg:string, ico='ℹ️', type?:'success'|'warn'|'error') => {
    const id = Date.now();
    setToasts(t=>[...t.slice(-3),{id,title,msg,ico,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),4000);
  },[]);

  // ── HEAT SCORE ENGINE ────────────────────────────
  const calcHeatScore = useCallback((lead: Lead) => {
    let score = lead.score;
    const signals = lead.heatSignals || [];
    // Boost por sinais
    if (signals.some(s=>s.includes('Urgência'))) score += 8;
    if (signals.some(s=>s.includes('ROI')||s.includes('yield'))) score += 6;
    if (signals.some(s=>s.includes('Portfólio'))) score += 10;
    if (lead.lastContact === 0) score += 5;
    if (lead.lastContact > 7) score -= 10;
    if (lead.intent === 'investimento' && lead.budgetN >= 500000) score += 5;
    return Math.min(100, Math.max(0, score));
  },[]);

  // ── RECOMMENDATION ENGINE (Netflix Style) ────────
  const buildRecommendations = useCallback(() => {
    const recs = leads.map(lead => {
      const scored = props.map(prop => {
        let score = 0;
        // Budget match
        if (prop.price <= lead.budgetN * 1.1 && prop.price >= lead.budgetN * 0.7) score += 40;
        else if (prop.price <= lead.budgetN) score += 20;
        // City match
        if (prop.city.toLowerCase().includes(lead.city.toLowerCase()) || lead.city.toLowerCase().includes(prop.city.toLowerCase())) score += 30;
        // Intent match
        if (lead.intent === 'investimento' && prop.yield > 13) score += 20;
        if (lead.intent === 'moradia' && (prop.tags.includes('airbnb')||prop.tags.includes('praia'))) score += 10;
        // Type match
        if (prop.type === lead.propType) score += 15;
        // Availability
        if (prop.status === 'disponível') score += 10;
        return {prop, score};
      }).sort((a,b)=>b.score-a.score).slice(0,3);
      return {lead, props: scored.map(s=>s.prop), score: scored[0]?.score || 0};
    }).sort((a,b)=>b.score-a.score).slice(0,4);
    setRecommendations(recs);
  },[leads, props]);

  useEffect(()=>{ buildRecommendations(); },[buildRecommendations]);

  // ── BUSCAR STATUS WA ─────────────────────────────
  useEffect(()=>{
    fetch('/api/whatsapp?action=status').then(r=>r.json()).then(setWaStatus).catch(()=>{});
  },[]);

  // ── SCROLL CHAT ──────────────────────────────────
  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:'smooth'}); },[chatMsgs]);

  // ── SEND CHAT ────────────────────────────────────
  const sendChat = async () => {
    if (!chatIn.trim() || chatLoad) return;
    const msg = chatIn.trim();
    setChatIn('');
    setChatMsgs(m=>[...m,{role:'user',text:msg,ts:now()}]);
    setChatLoad(true);
    try {
      const r = await fetch('/api/ai/unified',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          role:aiRole,
          messages:[...chatMsgs.slice(-8).map(m=>({role:m.role==='user'?'user':'assistant',content:m.text})),{role:'user',content:msg}],
          leadContext: selLead || {name:'Visitante',intent:'investimento'},
          keys,
        }),
      });
      const d = await r.json();
      const text = d.message || 'Desculpe, erro ao processar.';
      setChatMsgs(m=>[...m,{role:'ai',text,ts:now(),role_label:d.role}]);
      if (d.objectionDetected) {
        setTimeout(()=>setChatMsgs(m=>[...m,{role:'ai',text:`💡 Script Objeção "${d.objectionDetected}": ${d.objectionScript}`,ts:now(),role_label:'CHALLENGER'}]),800);
      }
    } catch { setChatMsgs(m=>[...m,{role:'ai',text:'Erro de conexão. Verifique a API.',ts:now()}]); }
    setChatLoad(false);
  };

  // ── SALVAR LEAD ──────────────────────────────────
  const saveLead = () => {
    if (!lf.name.trim()) { toast('Erro','Nome é obrigatório','⚠️','warn'); return; }
    if (editL) {
      setLeads(ls=>ls.map(l=>l.id===editL.id?{...l,...lf,budgetN:parseInt(lf.budget.replace(/\D/g,''))||l.budgetN}:l));
      toast('Lead Atualizado',`${lf.name} atualizado com sucesso`,'✅','success');
    } else {
      const nl:Lead = {...lf as any,id:Date.now(),budgetN:parseInt(lf.budget.replace(/\D/g,''))||0,score:50,av:lf.name.split(' ').map(w=>w[0]).slice(0,2).join(''),color:T.gold,heatSignals:[],purchasePower:'médio',profileType:'desconhecido',ch:'whatsapp'};
      setLeads(ls=>[nl,...ls]);
      toast('Lead Criado',`${lf.name} adicionado ao CRM`,'✅','success');
    }
    setShowLM(false);
    setEditL(null);
  };

  const deleteLead = (id:number) => {
    if (!confirm('Excluir este lead?')) return;
    setLeads(ls=>ls.filter(l=>l.id!==id));
    toast('Lead Removido','Lead excluído do CRM','🗑️');
  };

  // ── SALVAR IMÓVEL ────────────────────────────────
  const saveProp = () => {
    if (!pf.title.trim()) { toast('Erro','Título obrigatório','⚠️','warn'); return; }
    if (editP) {
      setProps(ps=>ps.map(p=>p.id===editP.id?{...p,...pf}:p));
      toast('Imóvel Atualizado','','✅','success');
    } else {
      const np:Prop = {...pf,id:Date.now(),roi:`R$ ${Math.round(pf.price*pf.yield/100/12/1000)}k/mês`,tags:[]};
      setProps(ps=>[np,...ps]);
      toast('Imóvel Criado',pf.title,'✅','success');
    }
    setShowPM(false);
    setEditP(null);
  };

  const deleteProp = (id:number) => {
    if (!confirm('Excluir este imóvel?')) return;
    setProps(ps=>ps.filter(p=>p.id!==id));
    toast('Imóvel Removido','','🗑️');
  };

  // ── SCRAPER ──────────────────────────────────────
  const runScrape = async () => {
    if (!scrapeUrl) return;
    setScrapeLoad(true);
    try {
      const r = await fetch('/api/properties/scrape',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:scrapeUrl})});
      const d = await r.json();
      if (d.property) {
        const p = d.property;
        setPf({title:p.title||'',dev:p.developer||'',city:p.city||'',type:'Apartamento',price:p.price||0,area:p.area||0,beds:p.bedrooms||2,status:'disponível',yield:13.5,photo:p.photo||'',notes:p.description||''});
        toast('Importado!',`${p.title||'Imóvel'} importado de ${d.portal}`,'🔗','success');
      }
    } catch { toast('Erro no Scraper','Verifique a URL','⚠️','warn'); }
    setScrapeLoad(false);
  };

  // ── BLAST ─────────────────────────────────────────
  const runBlast = async () => {
    const targets = blastTarget==='todos'?leads:blastTarget==='hot'?leads.filter(l=>l.score>=75):blastTarget==='investidores'?leads.filter(l=>l.intent==='investimento'):leads.filter(l=>l.intent==='moradia');
    if (!targets.length) { toast('Sem leads','Nenhum lead neste segmento','⚠️','warn'); return; }
    setBlastLoad(true);
    try {
      const r = await fetch('/api/blast',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({targets,template:blastTemplate,channel:'wa',campaignName:'Campanha IMOVAI'})});
      const d = await r.json();
      setBlastResults(d.results||[]);
      toast('Disparos Prontos!',d.summary||`${targets.length} mensagens geradas`,'🚀','success');
    } catch { toast('Erro','Falha nos disparos','⚠️','error'); }
    setBlastLoad(false);
  };

  // ── FOLLOW-UP ─────────────────────────────────────
  const runFollowup = async (lead:Lead, day:number) => {
    setFuLoad(lead.id);
    try {
      const r = await fetch('/api/followup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({leadId:lead.id,leadName:lead.name,leadPhone:lead.phone,intent:lead.intent,day,budget:lead.budget,generateWithAI:true})});
      const d = await r.json();
      setFuResults(fr=>({...fr,[lead.id]:{msg:d.message,link:d.waLink}}));
      toast('Follow-up Gerado',`Dia ${day} para ${lead.name}`,'🤖','success');
    } catch { toast('Erro','Falha no follow-up','⚠️','error'); }
    setFuLoad(null);
  };

  // ── AI TEST ───────────────────────────────────────
  const runAiTest = async () => {
    if (!aiTestMsg.trim()) return;
    setAiTestLoad(true);
    try {
      const r = await fetch('/api/ai/unified',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:aiTestRole,messages:[{role:'user',content:aiTestMsg}],leadContext:{name:'Lead Teste',budget:'R$ 650k',intent:'investimento',score:75,stage:'qualificando'},keys})});
      const d = await r.json();
      setAiTestResult(`[${d.role} via ${d.provider}/${d.model}]\n\n${d.message}${d.objectionDetected?`\n\n💡 Objeção detectada: "${d.objectionDetected}"\nScript: ${d.objectionScript}`:''}`);
    } catch (e) { setAiTestResult('Erro: '+String(e)); }
    setAiTestLoad(false);
  };

  // ── KANBAN DROP ───────────────────────────────────
  const handleDrop = (stage:string) => {
    if (dragging===null) return;
    setLeads(ls=>ls.map(l=>l.id===dragging?{...l,stage}:l));
    toast('Lead Movido',`Movido para ${STAGE_LABEL[stage]}`,'📋','success');
    setDragging(null);
  };

  // ── FILTERED LEADS ────────────────────────────────
  const filteredLeads = leads.filter(l=>{
    const matchFilter = lFilter==='todos'||lFilter===l.stage||(lFilter==='hot'&&l.score>=75)||(lFilter==='investidores'&&l.intent==='investimento');
    const matchSearch = !lSearch||(l.name.toLowerCase().includes(lSearch.toLowerCase())||l.phone.includes(lSearch)||l.city.toLowerCase().includes(lSearch.toLowerCase()));
    return matchFilter&&matchSearch;
  });

  // ── VGV TOTAL ─────────────────────────────────────
  const vgvTotal = leads.filter(l=>['proposta','negociacao','fechamento'].includes(l.stage)).reduce((a,l)=>a+l.budgetN,0);
  const hotLeads = leads.filter(l=>l.score>=75).length;
  const avgscore = Math.round(leads.reduce((a,l)=>a+calcHeatScore(l),0)/leads.length);

  // ─── SIDEBAR ─────────────────────────────────────
  const NAV = [
    {id:'dashboard',label:'Dashboard',icon:'📊',section:'Principal'},
    {id:'chat',label:'Chat IA',icon:'💬',badge:3,section:'Principal'},
    {id:'crm',label:'Leads CRM',icon:'👥',badge:hotLeads,badgeColor:T.gold,section:'Principal'},
    {id:'kanban',label:'Funil Kanban',icon:'🏆',section:'Comercial'},
    {id:'imoveis',label:'Imóveis',icon:'🏠',section:'Comercial'},
    {id:'visitas',label:'Visitas',icon:'📅',section:'Comercial'},
    {id:'propostas',label:'Propostas',icon:'📄',section:'Comercial'},
    {id:'blast',label:'Disparos',icon:'📣',section:'WhatsApp'},
    {id:'followup',label:'Follow-up',icon:'🔄',section:'WhatsApp'},
    {id:'whatsapp',label:'WhatsApp',icon:'📱',section:'WhatsApp'},
    {id:'recomendacoes',label:'Recomendações',icon:'🎯',badge:'AI',badgeColor:T.teal,section:'Inteligência'},
    {id:'agentes',label:'7 Agentes IA',icon:'🤖',section:'Inteligência'},
    {id:'analytics',label:'Analytics',icon:'📈',section:'Inteligência'},
    {id:'automacoes',label:'Automações',icon:'⚡',section:'Inteligência'},
    {id:'config',label:'Configurações',icon:'⚙️',section:'Sistema'},
  ];

  const sections = Array.from(new Set(NAV.map(n=>n.section)));

  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:T.bg,fontFamily:'DM Sans, sans-serif',fontSize:13,color:T.t1}}>
      
      {/* ── SIDEBAR ── */}
      <aside style={{width:230,background:T.bg2,borderRight:`1px solid ${T.border}`,display:'flex',flexDirection:'column',flexShrink:0,overflowY:'auto'}}>
        {/* Logo */}
        <div style={{padding:'18px 16px 12px',borderBottom:`1px solid ${T.border}`}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:38,height:38,background:`linear-gradient(135deg,${T.gold},${T.goldL})`,clipPath:'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:T.navy,fontFamily:'Syne, sans-serif'}}>I</div>
            <div>
              <div style={{fontFamily:'Syne, sans-serif',fontSize:14,fontWeight:800,color:T.gold}}>IMOVAI OS</div>
              <div style={{fontSize:9,color:T.t3,letterSpacing:2,textTransform:'uppercase'}}>v16 · PropTech</div>
            </div>
          </div>
          <div style={{marginTop:10,background:T.goldDim,border:`1px solid rgba(201,168,76,.22)`,borderRadius:8,padding:'7px 11px'}}>
            <div style={{fontFamily:'Syne, sans-serif',fontSize:11,fontWeight:700,color:T.gold}}>Jorge Miguel Imóveis</div>
            <div style={{fontSize:9,color:T.t3,marginTop:1}}>CRECI 7441F · Litoral Norte SC</div>
          </div>
        </div>
        
        {/* Nav */}
        <nav style={{flex:1,padding:'6px 0'}}>
          {sections.map(sec => (
            <div key={sec}>
              <div style={{padding:'8px 16px 3px',fontSize:9,fontWeight:600,color:'rgba(201,168,76,.4)',textTransform:'uppercase',letterSpacing:2}}>{sec}</div>
              {NAV.filter(n=>n.section===sec).map(n=>(
                <div key={n.id} onClick={()=>setTab(n.id)}
                  style={{display:'flex',alignItems:'center',gap:9,padding:'8px 16px',cursor:'pointer',color:tab===n.id?T.gold:T.t2,fontSize:12,borderRadius:7,margin:'1px 8px',background:tab===n.id?T.goldDim:'transparent',fontWeight:tab===n.id?500:400,position:'relative',transition:'all .12s'}}
                  onMouseEnter={e=>{if(tab!==n.id)(e.currentTarget as HTMLElement).style.background=T.goldDim}}
                  onMouseLeave={e=>{if(tab!==n.id)(e.currentTarget as HTMLElement).style.background='transparent'}}>
                  {tab===n.id && <div style={{position:'absolute',left:-8,top:'50%',transform:'translateY(-50%)',width:3,height:'55%',background:T.gold,borderRadius:'0 2px 2px 0'}}/>}
                  <span style={{fontSize:14,width:16,textAlign:'center'}}>{n.icon}</span>
                  {n.label}
                  {n.badge!==undefined && n.badge!==0 && <span style={{marginLeft:'auto',background:n.badgeColor||T.red,color:n.badgeColor===T.gold||n.badgeColor===T.teal?T.navy:'#fff',fontSize:8,fontWeight:700,padding:'1px 5px',borderRadius:7,minWidth:16,textAlign:'center'}}>{n.badge}</span>}
                </div>
              ))}
            </div>
          ))}
        </nav>
        
        {/* Bottom */}
        <div style={{padding:'10px 12px 14px'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',background:T.bg3,borderRadius:8,marginBottom:8}}>
            <div style={{width:26,height:26,background:`linear-gradient(135deg,${T.gold},${T.goldL})`,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:800,color:T.navy,fontFamily:'Syne, sans-serif'}}>JM</div>
            <div>
              <div style={{fontSize:11,fontWeight:600}}>Jorge Miguel</div>
              <div style={{fontSize:9,color:T.t3}}>(47) 98486-3952</div>
            </div>
            <div style={{marginLeft:'auto',width:6,height:6,borderRadius:'50%',background:waStatus?.status==='connected'?T.green:T.red}}/>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* Topbar */}
        <div style={{display:'flex',alignItems:'center',padding:'0 20px',height:56,background:T.bg2,borderBottom:`1px solid ${T.border}`,flexShrink:0,gap:12}}>
          <div>
            <div style={{fontFamily:'Syne, sans-serif',fontSize:16,fontWeight:700}}>{NAV.find(n=>n.id===tab)?.icon} {NAV.find(n=>n.id===tab)?.label||'Dashboard'}</div>
          </div>
          <div style={{flex:1}}/>
          <input placeholder="🔍 Buscar lead, imóvel..." value={lSearch} onChange={e=>setLSearch(e.target.value)}
            style={{...S.input,width:200}} />
          <button onClick={()=>toast('WA','Abrindo WhatsApp...','📱')} style={{...S.btn('outline'),padding:'6px 10px',fontSize:12}}>
            <span style={{color:waStatus?.status==='connected'?T.green:T.red}}>●</span> WA {waStatus?.status==='connected'?'Ativo':'Offline'}
          </button>
          <button onClick={()=>{setEditL(null);setLf({name:'',phone:'',email:'',budget:'',budgetN:0,intent:'investimento',source:'WhatsApp',city:'Balneário Piçarras',propType:'Apartamento',notes:'',stage:'novo'});setShowLM(true);}} style={S.btn()}>+ Novo Lead</button>
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:'auto',padding:18}}>
          <style>{`*::-webkit-scrollbar{width:4px;height:4px}*::-webkit-scrollbar-thumb{background:${T.bg4};border-radius:4px}`}</style>

          {/* ═══ DASHBOARD ═══ */}
          {tab==='dashboard' && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
                <StatCard label="VGV Pipeline" value={fmtC(vgvTotal)} delta="leads ativos" color={T.gold} icon="💰" onClick={()=>setTab('kanban')}/>
                <StatCard label="Leads Ativos" value={String(leads.length)} delta={`${hotLeads} leads quentes`} color={T.cyan} icon="👥" onClick={()=>setTab('crm')}/>
                <StatCard label="Heat Score Médio" value={`${avgscore}/100`} delta="portfólio total" color={T.red} icon="🔥" onClick={()=>setTab('crm')}/>
                <StatCard label="Imóveis Disponíveis" value={String(props.filter(p=>p.status==='disponível').length)} delta={`${props.length} total`} color={T.green} icon="🏠" onClick={()=>setTab('imoveis')}/>
              </div>

              {/* Funil + Distribuição */}
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:12,marginBottom:12}}>
                <div style={S.card}>
                  <div style={{fontFamily:'Syne, sans-serif',fontSize:13,fontWeight:600,marginBottom:14}}>Funil de Conversão</div>
                  {STAGES.slice(0,6).map(stage => {
                    const cnt = leads.filter(l=>l.stage===stage).length;
                    const pct = Math.round(cnt/leads.length*100);
                    return (
                      <div key={stage} onClick={()=>{setTab('crm');setLFilter(stage)}} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 8px',borderRadius:6,cursor:'pointer',marginBottom:4}}
                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=T.bg3}
                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                        <div style={{width:7,height:7,borderRadius:'50%',background:STAGE_COLORS[stage],flexShrink:0}}/>
                        <div style={{flex:1,fontSize:11,color:T.t2}}>{STAGE_LABEL[stage]}</div>
                        <div style={{width:80,height:3,background:T.bg4,borderRadius:2}}><div style={{height:'100%',width:`${pct}%`,background:STAGE_COLORS[stage],borderRadius:2}}/></div>
                        <div style={{fontSize:11,fontFamily:'JetBrains Mono, monospace',color:T.t1,minWidth:16,textAlign:'right'}}>{cnt}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={S.card}>
                  <div style={{fontFamily:'Syne, sans-serif',fontSize:13,fontWeight:600,marginBottom:14}}>🔥 Top Leads Quentes</div>
                  {leads.sort((a,b)=>calcHeatScore(b)-calcHeatScore(a)).slice(0,5).map(l=>(
                    <div key={l.id} onClick={()=>{setSelLead(l);setTab('chat');}} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 0',borderBottom:`1px solid ${T.border}`,cursor:'pointer'}}>
                      <div style={{width:26,height:26,borderRadius:'50%',background:`${l.color}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:l.color,flexShrink:0}}>{l.av}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11,fontWeight:500}}>{l.name}</div>
                        <div style={{fontSize:9,color:T.t3}}>{l.budget} · {l.city}</div>
                      </div>
                      <HeatBadge score={calcHeatScore(l)}/>
                    </div>
                  ))}
                </div>
              </div>

              {/* Imóveis em destaque */}
              <div style={S.card}>
                <div style={{fontFamily:'Syne, sans-serif',fontSize:13,fontWeight:600,marginBottom:14}}>🏠 Portfólio em Destaque</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
                  {props.filter(p=>p.status==='disponível').slice(0,4).map(p=>(
                    <div key={p.id} onClick={()=>setTab('imoveis')} style={{background:T.bg3,borderRadius:10,overflow:'hidden',cursor:'pointer',border:`1px solid ${T.border}`,transition:'all .15s'}}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor=T.goldGlow}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor=T.border}>
                      <div style={{height:90,background:`url(${p.photo}) center/cover`,position:'relative'}}>
                        <div style={{position:'absolute',top:6,right:6,background:`${T.green}22`,border:`1px solid ${T.green}44`,borderRadius:4,padding:'2px 6px',fontSize:8,fontWeight:700,color:T.green}}>DISP.</div>
                      </div>
                      <div style={{padding:10}}>
                        <div style={{fontSize:10,fontWeight:600,marginBottom:3}}>{p.title}</div>
                        <div style={{fontFamily:'JetBrains Mono, monospace',fontSize:11,color:T.gold}}>{fmtC(p.price)}</div>
                        <div style={{fontSize:9,color:T.green,marginTop:2}}>yield {p.yield}%/ano</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ CHAT IA ═══ */}
          {tab==='chat' && (
            <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:12,height:'calc(100vh - 130px)'}}>
              {/* Sidebar Leads */}
              <div style={{...S.card,overflowY:'auto',padding:12}}>
                <div style={{fontSize:11,fontWeight:600,color:T.t3,marginBottom:10}}>LEADS PARA ATENDER</div>
                <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:10}}>
                  {['BEATRIZ','EINSTEIN','CHALLENGER','RADAR','VALUATION','COPYWRITER'].map(r=>(
                    <button key={r} onClick={()=>setAiRole(r)} style={{...S.btn(aiRole===r?'gold':'outline'),padding:'3px 7px',fontSize:9,letterSpacing:.5}}>{r}</button>
                  ))}
                </div>
                {leads.sort((a,b)=>calcHeatScore(b)-calcHeatScore(a)).map(l=>(
                  <div key={l.id} onClick={()=>setSelLead(selLead?.id===l.id?null:l)}
                    style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:8,cursor:'pointer',marginBottom:4,background:selLead?.id===l.id?T.goldDim:T.bg3,border:`1px solid ${selLead?.id===l.id?T.gold:T.border}`,transition:'all .12s'}}>
                    <div style={{width:28,height:28,borderRadius:'50%',background:`${l.color}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:l.color,flexShrink:0}}>{l.av}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:500,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{l.name}</div>
                      <div style={{fontSize:9,color:T.t3}}>{l.budget}</div>
                    </div>
                    <HeatBadge score={calcHeatScore(l)}/>
                  </div>
                ))}
              </div>
              
              {/* Chat */}
              <div style={{...S.card,display:'flex',flexDirection:'column',padding:0,overflow:'hidden'}}>
                {/* Header */}
                <div style={{padding:'12px 16px',borderBottom:`1px solid ${T.border}`,display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:`linear-gradient(135deg,${T.gold},${T.goldL})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:T.navy}}>B</div>
                  <div>
                    <div style={{fontFamily:'Syne, sans-serif',fontSize:13,fontWeight:700}}>Beatriz IA <span style={{fontSize:9,background:T.goldDim,color:T.gold,padding:'1px 6px',borderRadius:4,marginLeft:4}}>{aiRole}</span></div>
                    {selLead && <div style={{fontSize:10,color:T.teal}}>↑ Contexto: {selLead.name} · {selLead.budget} · {selLead.intent}</div>}
                  </div>
                  <div style={{marginLeft:'auto',display:'flex',gap:4}}>
                    {['BEATRIZ','EINSTEIN','CHALLENGER'].map(r=>(
                      <button key={r} onClick={()=>setAiRole(r)} style={{...S.btn(aiRole===r?'gold':'outline'),padding:'3px 8px',fontSize:9}}>{r}</button>
                    ))}
                  </div>
                </div>
                {/* Msgs */}
                <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12}}>
                  {chatMsgs.map((m,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',gap:8,alignItems:'flex-end'}}>
                      {m.role==='ai' && <div style={{width:24,height:24,borderRadius:'50%',background:T.goldDim,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,flexShrink:0}}>🤖</div>}
                      <div style={{maxWidth:'78%'}}>
                        {m.role_label && <div style={{fontSize:8,color:T.teal,marginBottom:2,fontWeight:600}}>{m.role_label}</div>}
                        <div style={{padding:'9px 12px',borderRadius:m.role==='user'?'12px 12px 2px 12px':'12px 12px 12px 2px',background:m.role==='user'?T.gold:T.bg3,color:m.role==='user'?T.navy:T.t1,fontSize:12,lineHeight:1.5,border:m.role==='ai'?`1px solid ${T.border}`:'none'}}>
                          {m.text}
                        </div>
                        <div style={{fontSize:9,color:T.t3,marginTop:3,textAlign:m.role==='user'?'right':'left'}}>{m.ts}</div>
                      </div>
                    </div>
                  ))}
                  {chatLoad && (
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:24,height:24,borderRadius:'50%',background:T.goldDim,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10}}>🤖</div>
                      <div style={{padding:'9px 12px',borderRadius:'12px 12px 12px 2px',background:T.bg3,border:`1px solid ${T.border}`,color:T.t3,fontSize:12}}>digitando...</div>
                    </div>
                  )}
                  <div ref={chatEndRef}/>
                </div>
                {/* Suggestions */}
                <div style={{padding:'0 16px 8px',display:'flex',gap:6,flexWrap:'wrap'}}>
                  {['Oi, quero investir R$ 650k em BC','Qual o yield médio no Litoral Norte?','Tenho FGTS, como funciona?','Preciso de imóvel Airbnb'].map(s=>(
                    <button key={s} onClick={()=>setChatIn(s)} style={{...S.btn('outline'),padding:'3px 8px',fontSize:10,borderRadius:20}}>{s}</button>
                  ))}
                </div>
                {/* Input */}
                <div style={{padding:'0 16px 16px',display:'flex',gap:8}}>
                  <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&sendChat()}
                    placeholder="Digite uma mensagem..." style={{...S.input,flex:1,padding:'10px 14px'}}/>
                  <button onClick={sendChat} disabled={chatLoad||!chatIn.trim()} style={{...S.btn(),padding:'10px 16px',opacity:chatLoad||!chatIn.trim()?.length?0.5:1}}>→</button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ CRM LEADS ═══ */}
          {tab==='crm' && (
            <div>
              {/* Filters */}
              <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
                {['todos','hot','investidores',...STAGES].map(v=>(
                  <button key={v} onClick={()=>setLFilter(v)} style={{...S.btn(lFilter===v?'gold':'outline'),padding:'5px 10px',fontSize:10,textTransform:'capitalize'}}>{v==='todos'?'Todos':v==='hot'?'🔥 Hot':v==='investidores'?'💼 Investidores':STAGE_LABEL[v]||v}</button>
                ))}
                <div style={{marginLeft:'auto'}}>
                  <button onClick={()=>{setEditL(null);setLf({name:'',phone:'',email:'',budget:'',budgetN:0,intent:'investimento',source:'WhatsApp',city:'Balneário Piçarras',propType:'Apartamento',notes:'',stage:'novo'});setShowLM(true);}} style={S.btn()}>+ Novo Lead</button>
                </div>
              </div>

              {/* Table */}
              <div style={{...S.card,padding:0,overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr>
                      {['Contato','Heat Score','Estágio','Orçamento','Perfil','Último Contato','Ações'].map(h=>(
                        <th key={h} style={{textAlign:'left',padding:'10px 14px',fontSize:9,fontWeight:600,color:T.t3,textTransform:'uppercase',letterSpacing:1,borderBottom:`1px solid ${T.border}`}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(l=>(
                      <tr key={l.id}
                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=T.bg3}
                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                        <td style={{padding:'10px 14px',borderBottom:`1px solid ${T.border}22`}}>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <div style={{width:28,height:28,borderRadius:'50%',background:`${l.color}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:l.color,flexShrink:0}}>{l.av}</div>
                            <div>
                              <div style={{fontWeight:500,fontSize:12}}>{l.name}</div>
                              <div style={{fontSize:10,color:T.t3}}>{l.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{padding:'10px 14px',borderBottom:`1px solid ${T.border}22`}}>
                          <div style={{display:'flex',alignItems:'center',gap:6}}>
                            <div style={{width:32,fontSize:10,fontFamily:'JetBrains Mono, monospace',color:calcHeatScore(l)>=75?T.gold:T.t2,fontWeight:600}}>{calcHeatScore(l)}</div>
                            <div style={{width:50,height:3,background:T.bg4,borderRadius:2}}><div style={{height:'100%',width:`${calcHeatScore(l)}%`,background:calcHeatScore(l)>=75?T.gold:calcHeatScore(l)>=55?T.orange:T.t3,borderRadius:2}}/></div>
                            <HeatBadge score={calcHeatScore(l)}/>
                          </div>
                        </td>
                        <td style={{padding:'10px 14px',borderBottom:`1px solid ${T.border}22`}}>
                          <span style={{fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:9,background:`${STAGE_COLORS[l.stage]}22`,color:STAGE_COLORS[l.stage]}}>{STAGE_LABEL[l.stage]}</span>
                        </td>
                        <td style={{padding:'10px 14px',borderBottom:`1px solid ${T.border}22`,fontFamily:'JetBrains Mono, monospace',color:T.gold,fontSize:11}}>{l.budget}</td>
                        <td style={{padding:'10px 14px',borderBottom:`1px solid ${T.border}22`}}>
                          <div style={{fontSize:10,color:T.t2}}>{l.intent==='investimento'?'💼 Investidor':'🏡 Moradia'}</div>
                          <div style={{fontSize:9,color:T.t3}}>{l.city} · {l.propType}</div>
                        </td>
                        <td style={{padding:'10px 14px',borderBottom:`1px solid ${T.border}22`,color:l.lastContact===0?T.green:l.lastContact<=2?T.gold:T.t3,fontSize:11}}>
                          {l.lastContact===0?'Hoje':l.lastContact===1?'1 dia':l.lastContact>1?`${l.lastContact}d atrás`:'—'}
                        </td>
                        <td style={{padding:'10px 14px',borderBottom:`1px solid ${T.border}22`}}>
                          <div style={{display:'flex',gap:4}}>
                            <a href={waLink(l.phone)} target="_blank" rel="noreferrer" style={{...S.btn('outline'),padding:'3px 7px',fontSize:10,textDecoration:'none'}}>💬</a>
                            <button onClick={()=>{setSelLead(l);setTab('chat');}} style={{...S.btn('outline'),padding:'3px 7px',fontSize:10}}>🤖</button>
                            <button onClick={()=>{setEditL(l);setLf({name:l.name,phone:l.phone,email:l.email||'',budget:l.budget,budgetN:l.budgetN,intent:l.intent,source:l.source||'',city:l.city,propType:l.propType,notes:l.notes,stage:l.stage});setShowLM(true);}} style={{...S.btn('outline'),padding:'3px 7px',fontSize:10}}>✏️</button>
                            <button onClick={()=>deleteLead(l.id)} style={{...S.btn('outline'),padding:'3px 7px',fontSize:10,borderColor:`${T.red}44`,color:T.red}}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLeads.length===0 && <div style={{textAlign:'center',padding:40,color:T.t3}}>Nenhum lead encontrado</div>}
              </div>
            </div>
          )}

          {/* ═══ KANBAN ═══ */}
          {tab==='kanban' && (
            <div>
              <div style={{marginBottom:12,display:'flex',gap:8,alignItems:'center'}}>
                <div style={{fontFamily:'Syne, sans-serif',fontSize:14,fontWeight:700}}>VGV Total: <span style={{color:T.gold}}>{fmtC(vgvTotal)}</span></div>
                <button onClick={()=>{setEditL(null);setLf({name:'',phone:'',email:'',budget:'',budgetN:0,intent:'investimento',source:'WhatsApp',city:'Balneário Piçarras',propType:'Apartamento',notes:'',stage:'novo'});setShowLM(true);}} style={{...S.btn(),marginLeft:'auto'}}>+ Novo Lead</button>
              </div>
              <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:8}}>
                {STAGES.map(stage=>{
                  const stageleads = leads.filter(l=>l.stage===stage);
                  const stageVGV = stageleads.reduce((a,l)=>a+l.budgetN,0);
                  return (
                    <div key={stage} style={{minWidth:190,maxWidth:190,background:T.bg2,borderRadius:12,border:`1px solid ${T.border}`,overflow:'hidden'}}
                      onDragOver={e=>e.preventDefault()} onDrop={()=>handleDrop(stage)}>
                      <div style={{padding:'10px 12px',display:'flex',alignItems:'center',gap:7,borderBottom:`1px solid ${T.border}`}}>
                        <div style={{width:7,height:7,borderRadius:'50%',background:STAGE_COLORS[stage]}}/>
                        <div style={{fontFamily:'Syne, sans-serif',fontSize:11,fontWeight:600,flex:1}}>{STAGE_LABEL[stage]}</div>
                        <div style={{fontSize:9,color:T.t3,background:T.bg3,padding:'1px 6px',borderRadius:9}}>{stageleads.length}</div>
                      </div>
                      {stageVGV>0 && <div style={{padding:'4px 12px',fontSize:9,color:T.gold,fontFamily:'JetBrains Mono, monospace',borderBottom:`1px solid ${T.border}`}}>{fmtC(stageVGV)}</div>}
                      <div style={{padding:8,display:'flex',flexDirection:'column',gap:6,minHeight:60}}>
                        {stageleads.map(l=>(
                          <div key={l.id} draggable onDragStart={()=>setDragging(l.id)} onClick={()=>{setSelLead(l);setTab('chat');}}
                            style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,padding:10,cursor:'grab',transition:'all .12s'}}
                            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor=T.goldGlow}
                            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor=T.border}>
                            <div style={{fontSize:11,fontWeight:500,marginBottom:5}}>{l.name}</div>
                            <div style={{display:'flex',flexWrap:'wrap',gap:3,marginBottom:6}}>
                              <span style={{fontSize:8,padding:'1px 5px',borderRadius:3,background:T.bg4,color:T.t3}}>{l.propType}</span>
                              <span style={{fontSize:8,padding:'1px 5px',borderRadius:3,background:T.bg4,color:T.t3}}>{l.city}</span>
                            </div>
                            <div style={{display:'flex',alignItems:'center',gap:4}}>
                              <span style={{fontFamily:'JetBrains Mono, monospace',fontSize:10,color:T.gold,flex:1}}>{l.budget}</span>
                              <HeatBadge score={calcHeatScore(l)}/>
                            </div>
                          </div>
                        ))}
                        <div onClick={()=>{setEditL(null);setLf({name:'',phone:'',email:'',budget:'',budgetN:0,intent:'investimento',source:'WhatsApp',city:'Balneário Piçarras',propType:'Apartamento',notes:'',stage});setShowLM(true);}}
                          style={{border:`1px dashed ${T.border}`,borderRadius:8,padding:8,textAlign:'center',fontSize:10,color:T.t3,cursor:'pointer',transition:'all .12s'}}
                          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor=T.goldGlow}
                          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor=T.border}>
                          + Adicionar
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ IMÓVEIS ═══ */}
          {tab==='imoveis' && (
            <div>
              {/* Scraper + Actions */}
              <div style={{...S.card,marginBottom:14}}>
                <div style={{fontFamily:'Syne, sans-serif',fontSize:12,fontWeight:700,marginBottom:10,color:T.gold}}>🔗 Importar Imóvel por URL (ZAP / VivaReal / OLX)</div>
                <div style={{display:'flex',gap:8}}>
                  <input value={scrapeUrl} onChange={e=>setScrapeUrl(e.target.value)} placeholder="https://www.zapimoveis.com.br/..." style={{...S.input,flex:1}}/>
                  <button onClick={runScrape} disabled={scrapeLoad||!scrapeUrl} style={{...S.btn(),opacity:scrapeLoad?0.5:1}}>
                    {scrapeLoad?'Importando...':'🔗 Importar'}
                  </button>
                  <button onClick={()=>{setEditP(null);setPf({title:'',dev:'',city:'',type:'Apartamento',price:0,area:0,beds:2,status:'disponível',yield:13,photo:'',notes:''});setShowPM(true);}} style={S.btn()}>+ Novo</button>
                </div>
              </div>
              {/* Grid */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
                {props.map(p=>(
                  <div key={p.id} style={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:12,overflow:'hidden',transition:'all .15s'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor=T.goldGlow}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor=T.border}>
                    <div style={{height:140,background:p.photo?`url(${p.photo}) center/cover`:`linear-gradient(135deg,${T.bg3},${T.bg4})`,position:'relative',display:'flex',alignItems:'flex-end'}}>
                      <div style={{position:'absolute',top:8,right:8}}>
                        <span style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:9,background:p.status==='disponível'?`${T.green}22`:`${T.orange}22`,color:p.status==='disponível'?T.green:T.orange}}>{p.status.toUpperCase()}</span>
                      </div>
                      <div style={{padding:'8px 12px',background:'linear-gradient(transparent,rgba(7,9,15,.9))',width:'100%'}}>
                        <div style={{fontSize:10,color:T.t3}}>{p.dev} · {p.city}</div>
                      </div>
                    </div>
                    <div style={{padding:14}}>
                      <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>{p.title}</div>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                        <div style={{fontFamily:'JetBrains Mono, monospace',fontSize:14,fontWeight:700,color:T.gold}}>{fmtC(p.price)}</div>
                        <div style={{fontSize:9,color:T.green,fontWeight:600}}>yield {p.yield}%/ano</div>
                      </div>
                      <div style={{fontSize:10,color:T.t3,marginBottom:10}}>{p.area}m² · {p.beds}Q · {p.roi}</div>
                      <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:10}}>
                        {p.tags.map(tg=><span key={tg} style={{fontSize:8,padding:'1px 6px',borderRadius:3,background:T.bg3,color:T.t3}}>{tg}</span>)}
                      </div>
                      <div style={{display:'flex',gap:6}}>
                        <button onClick={()=>{setEditP(p);setPf({title:p.title,dev:p.dev,city:p.city,type:p.type,price:p.price,area:p.area,beds:p.beds,status:p.status,yield:p.yield,photo:p.photo,notes:''});setShowPM(true);}} style={{...S.btn('outline'),flex:1,textAlign:'center'}}>✏️ Editar</button>
                        <button onClick={()=>deleteProp(p.id)} style={{...S.btn('outline'),padding:'6px 10px',borderColor:`${T.red}44`,color:T.red}}>🗑️</button>
                        <button onClick={()=>{toast('Compartilhando',p.title,'📤','success')}} style={{...S.btn('outline'),padding:'6px 10px'}}>📤</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ DISPAROS ═══ */}
          {tab==='blast' && (
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <div>
                <div style={S.card}>
                  <div style={{fontFamily:'Syne, sans-serif',fontSize:14,fontWeight:700,marginBottom:16,color:T.gold}}>📣 Configurar Disparo</div>
                  <div style={{marginBottom:12}}>
                    <label style={S.label}>Segmentação</label>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      {[['todos','Todos'],['hot','🔥 Hot Leads'],['investidores','💼 Investidores'],['moradia','🏡 Moradia']].map(([v,lb])=>(
                        <button key={v} onClick={()=>setBlastTarget(v)} style={{...S.btn(blastTarget===v?'gold':'outline'),padding:'5px 10px',fontSize:10}}>{lb} ({v==='todos'?leads.length:v==='hot'?leads.filter(l=>l.score>=75).length:leads.filter(l=>(v==='investidores'?l.intent==='investimento':l.intent==='moradia')).length})</button>
                      ))}
                    </div>
                  </div>
                  <div style={{marginBottom:12}}>
                    <label style={S.label}>Template da Mensagem</label>
                    <textarea value={blastTemplate} onChange={e=>setBlastTemplate(e.target.value)} rows={4}
                      style={{...S.input,resize:'vertical'}} placeholder="Use {nome} para personalizar..."/>
                    <div style={{fontSize:9,color:T.t3,marginTop:4}}>Use: &#123;nome&#125; &#123;cidade&#125; &#123;orcamento&#125; para personalizar</div>
                  </div>
                  <button onClick={runBlast} disabled={blastLoad} style={{...S.btn(),width:'100%',padding:12,fontSize:13}}>
                    {blastLoad?'Gerando Disparos...':'🚀 Disparar Mensagens'}
                  </button>
                </div>

                <div style={{...S.card,marginTop:12}}>
                  <div style={{fontFamily:'Syne, sans-serif',fontSize:13,fontWeight:600,marginBottom:10}}>📊 Últimas Campanhas</div>
                  {[{n:'Lançamento Rôgga',s:342,r:67,d:'04/04'},
                    {n:'Vetter Alta Renda',s:560,r:89,d:'10/03'},
                    {n:'Black Friday Imóveis',s:1200,r:134,d:'29/11'}].map((c,i)=>(
                    <div key={i} style={{padding:'8px 0',borderBottom:`1px solid ${T.border}`}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <span style={{fontSize:11,fontWeight:500}}>{c.n}</span>
                        <span style={{fontSize:9,color:T.t3}}>{c.d}</span>
                      </div>
                      <div style={{display:'flex',gap:12}}>
                        <span style={{fontSize:10,color:T.t2}}>Enviadas: <b style={{color:T.t1}}>{c.s}</b></span>
                        <span style={{fontSize:10,color:T.t2}}>Respostas: <b style={{color:T.green}}>{c.r}</b></span>
                        <span style={{fontSize:10,color:T.t2}}>Taxa: <b style={{color:T.gold}}>{Math.round(c.r/c.s*100)}%</b></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resultados */}
              <div style={S.card}>
                <div style={{fontFamily:'Syne, sans-serif',fontSize:14,fontWeight:700,marginBottom:16}}>
                  {blastResults.length>0?`✅ ${blastResults.length} Disparos Prontos`:'Resultados aparecerão aqui'}
                </div>
                {blastResults.length===0?(
                  <div style={{textAlign:'center',padding:40,color:T.t3}}>
                    <div style={{fontSize:40,marginBottom:12}}>📣</div>
                    <div>Configure e clique em "Disparar" para gerar mensagens personalizadas para cada lead</div>
                  </div>
                ):(
                  <div style={{display:'flex',flexDirection:'column',gap:8,maxHeight:500,overflowY:'auto'}}>
                    {blastResults.map((r,i)=>(
                      <div key={i} style={{background:T.bg3,borderRadius:8,padding:12,border:`1px solid ${T.border}`}}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                          <span style={{fontSize:11,fontWeight:600}}>{r.name}</span>
                          <span style={{fontSize:9,color:r.sent?T.green:T.gold}}>● {r.sent?'Enviado via API':'Link gerado'}</span>
                        </div>
                        <div style={{fontSize:11,color:T.t2,marginBottom:8,lineHeight:1.5}}>{r.message}</div>
                        {!r.sent && r.waLink && (
                          <a href={r.waLink} target="_blank" rel="noreferrer" style={{...S.btn(),display:'inline-block',textDecoration:'none',padding:'5px 10px',fontSize:10}}>
                            📱 Abrir WhatsApp
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ FOLLOW-UP ═══ */}
          {tab==='followup' && (
            <div>
              <div style={{...S.card,marginBottom:14}}>
                <div style={{fontFamily:'Syne, sans-serif',fontSize:14,fontWeight:700,marginBottom:4,color:T.gold}}>🔄 Follow-up Automático — Cadência 3-7-30 dias</div>
                <div style={{fontSize:11,color:T.t3}}>IA gera mensagem personalizada por lead usando Challenger Sale + SPIN + NSD</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {leads.filter(l=>l.lastContact>=3).sort((a,b)=>b.lastContact-a.lastContact).map(l=>{
                  const day = l.lastContact>=30?30:l.lastContact>=7?7:3;
                  const fr = fuResults[l.id];
                  return (
                    <div key={l.id} style={{...S.card,padding:16}}>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div style={{width:36,height:36,borderRadius:'50%',background:`${l.color}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:l.color,flexShrink:0}}>{l.av}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600,fontSize:13}}>{l.name}</div>
                          <div style={{fontSize:10,color:T.t3}}>{l.budget} · {l.intent} · {l.city}</div>
                          {l.heatSignals?.length>0 && <div style={{fontSize:9,color:T.teal,marginTop:2}}>🔍 {l.heatSignals.join(' · ')}</div>}
                        </div>
                        <div style={{textAlign:'center'}}>
                          <div style={{fontSize:20,fontFamily:'JetBrains Mono, monospace',fontWeight:700,color:l.lastContact>=30?T.red:l.lastContact>=7?T.orange:T.yellow}}>{l.lastContact}d</div>
                          <div style={{fontSize:9,color:T.t3}}>sem contato</div>
                        </div>
                        <div style={{display:'flex',gap:6}}>
                          {[3,7,30].map(d=>(
                            <button key={d} onClick={()=>runFollowup(l,d)} disabled={fuLoad===l.id}
                              style={{...S.btn(day===d?'gold':'outline'),padding:'6px 10px',fontSize:11,opacity:fuLoad===l.id?.5:1}}>
                              Dia {d}
                            </button>
                          ))}
                          <a href={waLink(l.phone)} target="_blank" rel="noreferrer" style={{...S.btn('outline'),padding:'6px 10px',textDecoration:'none',fontSize:11}}>💬 WA</a>
                        </div>
                      </div>
                      {fr && (
                        <div style={{marginTop:12,background:T.bg3,borderRadius:8,padding:12,border:`1px solid ${T.goldGlow}`}}>
                          <div style={{fontSize:9,color:T.gold,fontWeight:600,marginBottom:6}}>🤖 MENSAGEM GERADA PELA IA:</div>
                          <div style={{fontSize:12,color:T.t1,marginBottom:8,lineHeight:1.6}}>{fr.msg}</div>
                          <a href={fr.link} target="_blank" rel="noreferrer" style={{...S.btn(),display:'inline-block',textDecoration:'none',padding:'5px 12px',fontSize:11}}>📱 Enviar no WhatsApp</a>
                        </div>
                      )}
                    </div>
                  );
                })}
                {leads.filter(l=>l.lastContact>=3).length===0 && (
                  <div style={{...S.card,textAlign:'center',padding:40,color:T.t3}}>Todos os leads foram contatados recentemente 🎉</div>
                )}
              </div>
            </div>
          )}

          {/* ═══ WHATSAPP ═══ */}
          {tab==='whatsapp' && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:14}}>
                {/* Status Card */}
                <div style={{...S.card}}>
                  <div style={{fontFamily:'Syne, sans-serif',fontSize:14,fontWeight:700,marginBottom:16,color:T.gold}}>📱 Conexão WhatsApp</div>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:waStatus?.status==='connected'?T.green:T.red,boxShadow:`0 0 8px ${waStatus?.status==='connected'?T.green:T.red}`}}/>
                    <span style={{color:waStatus?.status==='connected'?T.green:T.red,fontWeight:600}}>{waStatus?.status==='connected'?'Conectado':'Desconectado'}</span>
                  </div>
                  <div style={{fontFamily:'JetBrains Mono, monospace',fontSize:16,fontWeight:700,marginBottom:4}}>+55 47 98486-3952</div>
                  <div style={{fontSize:11,color:T.t3,marginBottom:16}}>Jorge Miguel Imóveis · Principal</div>
                  <div style={{display:'flex',gap:8}}>
                    <a href="https://wa.me/5547984863952" target="_blank" rel="noreferrer" style={{...S.btn(),textDecoration:'none',flex:1,textAlign:'center',padding:10}}>💬 Abrir WhatsApp</a>
                    <button onClick={()=>fetch('/api/whatsapp?action=status').then(r=>r.json()).then(d=>{setWaStatus(d);toast('Status Atualizado',d.status,'📱','success');})} style={{...S.btn('outline'),padding:10}}>🔄</button>
                  </div>
                </div>
                
                {/* Evolution API */}
                <div style={{...S.card}}>
                  <div style={{fontFamily:'Syne, sans-serif',fontSize:14,fontWeight:700,marginBottom:12}}>⚡ Evolution API</div>
                  <div style={{fontSize:11,color:T.t3,marginBottom:14}}>Conecte a Evolution API para envio automático de mensagens</div>
                  {[['Docker','docker pull atendai/evolution-api','⬛'],['URL','https://seu-evolution.com','🔗'],['Chave','Configurar em Configurações','🔑']].map(([label,val,ico])=>(
                    <div key={label} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 0',borderBottom:`1px solid ${T.border}`}}>
                      <span>{ico}</span>
                      <span style={{fontSize:11,color:T.t3,minWidth:50}}>{label}:</span>
                      <code style={{fontSize:10,color:T.cyan,flex:1}}>{val}</code>
                    </div>
                  ))}
                  <button onClick={()=>setTab('config')} style={{...S.btn(),marginTop:12,width:'100%',padding:10}}>⚙️ Configurar Evolution API</button>
                </div>
              </div>

              {/* Engines */}
              <div style={S.card}>
                <div style={{fontFamily:'Syne, sans-serif',fontSize:13,fontWeight:600,marginBottom:12}}>Engines WhatsApp Disponíveis</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                  {[{n:'Baileys',st:'on',d:'Multi-device · Open-source · Padrão',ico:'🐻'},{n:'Evolution API',st:'config',d:'REST API · Docker · Recomendado',ico:'⚡'},{n:'WPPConnect',st:'off',d:'Browser-based · Open-source',ico:'🔗'}].map(e=>(
                    <div key={e.n} style={{background:T.bg3,borderRadius:10,padding:14,border:`1px solid ${e.st==='on'?`${T.green}44`:T.border}`,textAlign:'center'}}>
                      <div style={{fontSize:24,marginBottom:8}}>{e.ico}</div>
                      <div style={{fontFamily:'Syne, sans-serif',fontSize:12,fontWeight:600,marginBottom:4}}>{e.n}</div>
                      <div style={{fontSize:9,color:e.st==='on'?T.green:T.t3,marginBottom:8}}>● {e.st==='on'?'Integrado':'Disponível'}</div>
                      <div style={{fontSize:10,color:T.t3}}>{e.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ RECOMENDAÇÕES IA ═══ */}
          {tab==='recomendacoes' && (
            <div>
              <div style={{...S.card,marginBottom:14}}>
                <div style={{fontFamily:'Syne, sans-serif',fontSize:14,fontWeight:700,marginBottom:4,color:T.gold}}>🎯 Recomendações Inteligentes — Estilo Netflix</div>
                <div style={{fontSize:11,color:T.t3}}>Motor de IA analisa perfil comportamental, budget e intent de cada lead para recomendar os imóveis mais compatíveis</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                {recommendations.map(({lead,props:rprops,score})=>(
                  <div key={lead.id} style={{...S.card}}>
                    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14,paddingBottom:12,borderBottom:`1px solid ${T.border}`}}>
                      <div style={{width:40,height:40,borderRadius:'50%',background:`${lead.color}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:lead.color}}>{lead.av}</div>
                      <div>
                        <div style={{fontFamily:'Syne, sans-serif',fontSize:14,fontWeight:700}}>{lead.name}</div>
                        <div style={{fontSize:11,color:T.t3}}>{lead.budget} · {lead.intent} · {lead.city}</div>
                      </div>
                      <div style={{marginLeft:'auto',display:'flex',gap:8,alignItems:'center'}}>
                        <HeatBadge score={calcHeatScore(lead)}/>
                        <span style={{fontSize:9,padding:'2px 8px',borderRadius:4,background:T.teal+'22',color:T.teal,fontWeight:700}}>Match {score}pts</span>
                        <button onClick={()=>{setSelLead(lead);setTab('chat');}} style={{...S.btn(),padding:'5px 12px',fontSize:11}}>🤖 Consultar IA</button>
                      </div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                      {rprops.map((p,idx)=>(
                        <div key={p.id} style={{background:T.bg3,borderRadius:10,overflow:'hidden',border:`1px solid ${idx===0?T.goldGlow:T.border}`,position:'relative'}}>
                          {idx===0 && <div style={{position:'absolute',top:6,left:6,fontSize:9,fontWeight:700,padding:'2px 7px',background:T.gold,color:T.navy,borderRadius:4,zIndex:1}}>MELHOR MATCH</div>}
                          <div style={{height:80,background:`url(${p.photo}) center/cover`}}/>
                          <div style={{padding:10}}>
                            <div style={{fontSize:10,fontWeight:600,marginBottom:4}}>{p.title}</div>
                            <div style={{fontFamily:'JetBrains Mono, monospace',fontSize:12,color:T.gold,marginBottom:2}}>{fmtC(p.price)}</div>
                            <div style={{fontSize:9,color:T.green}}>yield {p.yield}%/ano</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ 7 AGENTES IA ═══ */}
          {tab==='agentes' && (
            <div>
              <div style={{...S.card,marginBottom:14}}>
                <div style={{fontFamily:'Syne, sans-serif',fontSize:14,fontWeight:700,marginBottom:4,color:T.gold}}>🤖 Central de 7 Agentes IA</div>
                <div style={{fontSize:11,color:T.t3}}>Cada agente usa o contexto do lead anterior. Fallback: Groq (grátis) → Grok → GPT-4o Mini → Gemini → Local</div>
              </div>
              
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:14}}>
                {[
                  {id:'BEATRIZ',icon:'💬',desc:'Atendimento WA 24/7. SPIN+Challenger+NSD. Máx 180 chars.',cap:['WhatsApp','Personalidade','Follow-up'],c:T.gold},
                  {id:'EINSTEIN',icon:'🧪',desc:'Qualifica lead 0-100. Detecta perfil, urgência, budget real.',cap:['Score JSON','Estágio','Próxima ação'],c:T.cyan},
                  {id:'CHALLENGER',icon:'🎯',desc:'Follow-up 3-7-30 dias com persuasão avançada. Challenger Sale.',cap:['Follow-up IA','Objeções','Cadência'],c:T.orange},
                  {id:'RADAR',icon:'📡',desc:'Detecta perfil investidor. ROI, Airbnb, portfólio.',cap:['Investidor','Airbnb','ROI'],c:T.teal},
                  {id:'VALUATION',icon:'💰',desc:'Análise de investimento: yield, payback, valorização SC.',cap:['ROI calc','Payback','Comparativo'],c:T.green},
                  {id:'COPYWRITER',icon:'✍️',desc:'Copy imobiliário premium. Instagram, WA, Facebook. Sem clichês.',cap:['Instagram','WhatsApp','Anúncio'],c:T.purple},
                  {id:'ORCHESTRATOR',icon:'🧠',desc:'Coordena todos os agentes. Decide qual IA acionar para cada lead.',cap:['Orquestra','Prioriza','Direciona'],c:T.accent},
                ].map(ag=>(
                  <div key={ag.id} style={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:12,padding:16,cursor:'pointer',transition:'all .15s'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor=ag.c+'66'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor=T.border}
                    onClick={()=>{setAiRole(ag.id);setTab('chat');toast(`${ag.id} Ativado`,'Abra o chat para interagir','🤖','success');}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                      <div style={{width:36,height:36,borderRadius:9,background:`${ag.c}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{ag.icon}</div>
                      <div>
                        <div style={{fontFamily:'Syne, sans-serif',fontSize:13,fontWeight:700,color:ag.c}}>{ag.id}</div>
                        <div style={{fontSize:9,color:T.t3}}>Agente IA Especializado</div>
                      </div>
                      <button style={{...S.btn('outline'),marginLeft:'auto',padding:'4px 10px',fontSize:10,borderColor:ag.c+'44',color:ag.c}}>Usar →</button>
                    </div>
                    <div style={{fontSize:11,color:T.t2,marginBottom:10,lineHeight:1.5}}>{ag.desc}</div>
                    <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                      {ag.cap.map(c=><span key={c} style={{fontSize:8,padding:'2px 6px',borderRadius:3,background:`${ag.c}12`,color:ag.c,fontWeight:600}}>{c}</span>)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Teste ao vivo */}
              <div style={S.card}>
                <div style={{fontFamily:'Syne, sans-serif',fontSize:13,fontWeight:700,marginBottom:12,color:T.gold}}>🧪 Testar Agente ao Vivo</div>
                <div style={{display:'flex',gap:8,marginBottom:10}}>
                  {['BEATRIZ','EINSTEIN','CHALLENGER','RADAR','VALUATION','COPYWRITER','ORCHESTRATOR'].map(r=>(
                    <button key={r} onClick={()=>setAiTestRole(r)} style={{...S.btn(aiTestRole===r?'gold':'outline'),padding:'4px 9px',fontSize:9}}>{r}</button>
                  ))}
                </div>
                <textarea value={aiTestMsg} onChange={e=>setAiTestMsg(e.target.value)} rows={3} placeholder="Ex: Oi, quero comprar um apartamento em Balneário com R$ 650k..."
                  style={{...S.input,resize:'vertical',marginBottom:8}}/>
                <button onClick={runAiTest} disabled={aiTestLoad||!aiTestMsg.trim()} style={{...S.btn(),marginBottom:10,opacity:aiTestLoad?.5:1}}>
                  {aiTestLoad?'Processando...':'▶ Gerar Resposta'}
                </button>
                {aiTestResult && (
                  <div style={{background:T.bg3,borderRadius:8,padding:14,border:`1px solid ${T.goldGlow}`,whiteSpace:'pre-wrap',fontSize:12,color:T.t1,lineHeight:1.6}}>
                    {aiTestResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ ANALYTICS ═══ */}
          {tab==='analytics' && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:14}}>
                <StatCard label="Taxa de Conversão" value="3.8%" delta="0.4pp este mês" color={T.green} icon="📈"/>
                <StatCard label="Custo por Lead" value="R$ 18" delta="12% menor" color={T.cyan} icon="💰"/>
                <StatCard label="Ciclo Médio" value="42 dias" delta="8 dias mais rápido" color={T.orange} icon="⏱️"/>
              </div>
              <div style={{...S.card,marginBottom:12}}>
                <div style={{fontFamily:'Syne, sans-serif',fontSize:13,fontWeight:600,marginBottom:14}}>Performance por Origem de Lead</div>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr>{['Origem','Leads','Visitas','Propostas','Fechados','Conv.','VGV'].map(h=><th key={h} style={{textAlign:'left',padding:'8px 12px',fontSize:9,color:T.t3,textTransform:'uppercase',letterSpacing:1,borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {[['Instagram',142,38,14,5,'3.5%','R$ 1.8M'],['WhatsApp Ativo',98,31,12,4,'4.1%','R$ 1.2M'],['Portais (Zap/OLX)',76,22,8,2,'2.6%','R$ 0.6M'],['Indicação',34,18,9,5,'14.7%','R$ 2.1M'],['Facebook Leads',28,9,3,1,'3.6%','R$ 312k']].map((row,i)=>(
                      <tr key={i} onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=T.bg3} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                        {row.map((c,j)=>(
                          <td key={j} style={{padding:'10px 12px',fontSize:11,borderBottom:`1px solid ${T.border}22`,color:j===5?T.green:j===6?T.gold:T.t1,fontFamily:j>=1&&j<=4?'JetBrains Mono, monospace':'inherit',fontWeight:j===5?700:400}}>{c}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ AUTOMAÇÕES ═══ */}
          {tab==='automacoes' && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
                {[
                  {id:1,n:'Boas-vindas Instantâneo',desc:'Novo lead → mensagem personalizada em <2min',trigger:'Novo lead',ch:'WhatsApp',active:true,runs:1247,conv:'18%'},
                  {id:2,n:'Follow-up Dia 3',desc:'3 dias sem resposta → Challenger Sale Dia 3',trigger:'Sem resposta 3d',ch:'WhatsApp',active:true,runs:342,conv:'9%'},
                  {id:3,n:'Follow-up Dia 7',desc:'7 dias sem resposta → SPIN + dado de mercado',trigger:'Sem resposta 7d',ch:'WhatsApp',active:true,runs:189,conv:'12%'},
                  {id:4,n:'Follow-up Dia 30',desc:'30 dias sem resposta → Reativação NSD',trigger:'Sem resposta 30d',ch:'WhatsApp',active:true,runs:67,conv:'6%'},
                  {id:5,n:'Alerta Lead Quente',desc:'Score ≥ 85 → notificação Jorge no Telegram',trigger:'Score ≥ 85',ch:'Telegram',active:true,runs:23,conv:'—'},
                  {id:6,n:'Script Objeção: Preço',desc:'"Tá caro" → script Challenger com dados ROI',trigger:'Palavra "caro"',ch:'WhatsApp',active:true,runs:89,conv:'34%'},
                ].map(auto=>(
                  <div key={auto.id} style={{...S.card,position:'relative'}}>
                    <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:12}}>
                      <div style={{flex:1}}>
                        <div style={{fontFamily:'Syne, sans-serif',fontSize:13,fontWeight:600,marginBottom:4}}>{auto.n}</div>
                        <div style={{fontSize:11,color:T.t3,marginBottom:8}}>{auto.desc}</div>
                        <div style={{display:'flex',gap:8}}>
                          <span style={{fontSize:9,padding:'2px 7px',borderRadius:4,background:T.bg3,color:T.t2}}>Trigger: {auto.trigger}</span>
                          <span style={{fontSize:9,padding:'2px 7px',borderRadius:4,background:T.bg3,color:T.t2}}>{auto.ch}</span>
                        </div>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                        <div style={{width:40,height:20,borderRadius:20,background:auto.active?T.green:T.bg3,position:'relative',cursor:'pointer'}} onClick={()=>toast(auto.n,'Toggle alterado','⚡','success')}>
                          <div style={{width:16,height:16,borderRadius:'50%',background:'white',position:'absolute',top:2,transition:'all .2s',left:auto.active?22:2}}/>
                        </div>
                        <span style={{fontSize:9,color:auto.active?T.green:T.t3}}>● {auto.active?'Ativa':'Pausada'}</span>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:12,paddingTop:10,borderTop:`1px solid ${T.border}`}}>
                      <span style={{fontSize:10,color:T.t2}}>Execuções: <b style={{color:T.t1}}>{auto.runs}</b></span>
                      <span style={{fontSize:10,color:T.t2}}>Conversão: <b style={{color:T.green}}>{auto.conv}</b></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ VISITAS / PROPOSTAS ═══ */}
          {tab==='visitas' && (
            <div style={S.card}>
              <div style={{fontFamily:'Syne, sans-serif',fontSize:14,fontWeight:700,marginBottom:16,color:T.gold}}>📅 Agenda de Visitas</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
                <StatCard label="Agendadas" value="23" delta="3 esta semana" color={T.cyan} icon="📅"/>
                <StatCard label="Esta Semana" value="7" color={T.orange} icon="📆"/>
                <StatCard label="Confirmadas" value="5" delta="71% taxa" color={T.green} icon="✅"/>
              </div>
              {leads.filter(l=>['visita','proposta'].includes(l.stage)).map(l=>(
                <div key={l.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:`1px solid ${T.border}`}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:`${l.color}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:l.color}}>{l.av}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:12}}>{l.name}</div>
                    <div style={{fontSize:10,color:T.t3}}>{l.budget} · {l.city} · {l.propType}</div>
                  </div>
                  <span style={{fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:9,background:`${STAGE_COLORS[l.stage]}22`,color:STAGE_COLORS[l.stage]}}>{STAGE_LABEL[l.stage]}</span>
                  <a href={waLink(l.phone,'Confirmando nossa visita amanhã! Alguma dúvida?')} target="_blank" rel="noreferrer" style={{...S.btn(),textDecoration:'none',padding:'5px 10px',fontSize:11}}>💬 Confirmar</a>
                </div>
              ))}
            </div>
          )}
          
          {tab==='propostas' && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:14}}>
                <StatCard label="Total" value="24" color={T.cyan} icon="📄"/>
                <StatCard label="Aprovadas" value="9" delta="37.5% taxa" color={T.green} icon="✅"/>
                <StatCard label="Aguardando" value="8" color={T.orange} icon="⏳"/>
                <StatCard label="VGV Propostas" value="R$ 4.2M" color={T.gold} icon="💰"/>
              </div>
              {leads.filter(l=>['proposta','negociacao','fechamento'].includes(l.stage)).map(l=>(
                <div key={l.id} style={{...S.card,display:'flex',alignItems:'center',gap:14,marginBottom:8,padding:14}}>
                  <div style={{width:36,height:36,borderRadius:9,background:`${l.color}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>{l.stage==='fechamento'?'✍️':'📄'}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:12}}>{l.name}</div>
                    <div style={{fontSize:10,color:T.t3}}>{l.city} · {l.propType}</div>
                  </div>
                  <span style={{fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:9,background:`${STAGE_COLORS[l.stage]}22`,color:STAGE_COLORS[l.stage]}}>{STAGE_LABEL[l.stage]}</span>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontFamily:'JetBrains Mono, monospace',fontSize:13,color:T.gold}}>{l.budget}</div>
                    <div style={{fontSize:10,color:T.t3}}>Comissão: {fmtC(l.budgetN*.06)}</div>
                  </div>
                  <button onClick={()=>toast('Proposta','Abrindo preview...','📄','success')} style={{...S.btn('outline'),padding:'5px 10px',fontSize:11}}>Ver →</button>
                </div>
              ))}
            </div>
          )}

          {/* ═══ CONFIG ═══ */}
          {tab==='config' && (
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              {/* Chaves IA */}
              <div style={S.card}>
                <div style={{fontFamily:'Syne, sans-serif',fontSize:14,fontWeight:700,marginBottom:16,color:T.gold}}>🤖 Chaves de IA</div>
                <div style={{fontSize:10,color:T.teal,marginBottom:14}}>Fallback automático: Groq → Grok → GPT-4o Mini → Gemini</div>
                {([['groq','Groq API Key (GRÁTIS)','gsk_...'],['grok','Grok xAI Key','xai-...'],['openai','OpenAI API Key','sk-...'],['gemini','Google Gemini Key','AIza...']] as const).map(([k,label,ph])=>(
                  <div key={k} style={{marginBottom:10}}>
                    <label style={S.label}>{label}</label>
                    <input type="password" value={(keys as any)[k]} onChange={e=>setKeys(ks=>({...ks,[k]:e.target.value}))} placeholder={ph} style={S.input}/>
                  </div>
                ))}
                <button onClick={()=>toast('Salvo!','Chaves configuradas','✅','success')} style={{...S.btn(),width:'100%',padding:10}}>💾 Salvar Chaves</button>
              </div>

              {/* Evolution API */}
              <div style={S.card}>
                <div style={{fontFamily:'Syne, sans-serif',fontSize:14,fontWeight:700,marginBottom:16,color:T.gold}}>📱 WhatsApp — Evolution API</div>
                {[['URL da API','https://seu-evolution.com'],['Chave da API','sua-chave-aqui'],['Instância','imovai-jorge']].map(([label,ph])=>(
                  <div key={label} style={{marginBottom:10}}>
                    <label style={S.label}>{label}</label>
                    <input placeholder={ph} style={S.input}/>
                  </div>
                ))}
                <div style={{...S.card,background:T.bg3,padding:12,marginBottom:12}}>
                  <div style={{fontSize:10,color:T.gold,fontWeight:600,marginBottom:6}}>🐳 Instalar Evolution API:</div>
                  <code style={{fontSize:10,color:T.cyan,display:'block',lineHeight:1.8}}>
                    docker pull atendai/evolution-api<br/>
                    docker run -d -p 8080:8080 atendai/evolution-api
                  </code>
                </div>
                <button onClick={()=>toast('Salvo!','Evolution API configurada','✅','success')} style={{...S.btn(),width:'100%',padding:10}}>💾 Salvar Configuração</button>
              </div>

              {/* Beatriz Behavior */}
              <div style={{...S.card,gridColumn:'1/-1'}}>
                <div style={{fontFamily:'Syne, sans-serif',fontSize:14,fontWeight:700,marginBottom:16,color:T.gold}}>🤖 Comportamento da Beatriz</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
                  {[['Temperatura (Criatividade)','range',0.8,0,1,0.05],['Máx. Tokens/Resposta','range',200,50,600,50],['Delay de Digitação (ms)','range',1500,500,5000,100]].map(([label,type,val,min,max,step])=>(
                    <div key={String(label)}>
                      <label style={S.label}>{label}</label>
                      <input type="range" min={Number(min)} max={Number(max)} step={Number(step)} defaultValue={Number(val)} style={{width:'100%',accentColor:T.gold}} onInput={e=>{const el=e.currentTarget.nextElementSibling as HTMLElement;if(el)el.textContent=String((e.target as HTMLInputElement).value);}}/>
                      <div style={{fontFamily:'JetBrains Mono, monospace',fontSize:11,color:T.gold,marginTop:3}}>{val}</div>
                    </div>
                  ))}
                  {[['Follow-up Automático',['Cadência 3-7-30 dias','Apenas Dia 3','Dia 7 e 30','Desabilitado']],['Escalada p/ Humano',['2h sem resposta','30min sem resposta','1h sem resposta','Nunca']],['Objeções Detectadas',['Responder automaticamente','Alertar corretor','Ignorar']]].map(([label,opts])=>(
                    <div key={String(label)}>
                      <label style={S.label}>{label}</label>
                      <select style={{...S.input}}>{(opts as string[]).map(o=><option key={o}>{o}</option>)}</select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ═══ MODAIS CRUD ═══ */}
      {/* Modal Lead */}
      <Modal open={showLM} onClose={()=>{setShowLM(false);setEditL(null);}} title={editL?'✏️ Editar Lead':'➕ Novo Lead'}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {([['name','Nome Completo *','Carlos Mendonça'],['phone','Telefone (WhatsApp)','47991234567'],['email','E-mail','carlos@email.com'],['budget','Orçamento','R$ 650k']] as const).map(([k,label,ph])=>(
            <div key={k}>
              <label style={S.label}>{label}</label>
              <input value={(lf as any)[k]} onChange={e=>setLf(f=>({...f,[k]:e.target.value}))} placeholder={ph} style={S.input}/>
            </div>
          ))}
          {([['city','Cidade',['Balneário Piçarras','Penha','Barra Velha','Navegantes','Itapoá','BC','Joinville','Jaraguá do Sul']],['intent','Intenção',['investimento','moradia']],['source','Origem',['WhatsApp','Instagram','ZAP Imóveis','VivaReal','Google','Facebook','Indicação','LinkedIn','TikTok']],['stage','Estágio',STAGES],['propType','Tipo de Imóvel',['Apartamento','Casa','Cobertura','Geminado','Penthouse','Terreno']]] as const).map(([k,label,opts])=>(
            <div key={k}>
              <label style={S.label}>{label}</label>
              <select value={(lf as any)[k]} onChange={e=>setLf(f=>({...f,[k]:e.target.value}))} style={{...S.input}}>
                {(opts as readonly string[]).map(o=><option key={o} value={o}>{STAGE_LABEL[o]||o}</option>)}
              </select>
            </div>
          ))}
          <div style={{gridColumn:'1/-1'}}>
            <label style={S.label}>Observações</label>
            <textarea value={lf.notes} onChange={e=>setLf(f=>({...f,notes:e.target.value}))} rows={2} style={{...S.input,resize:'vertical'}}/>
          </div>
        </div>
        <div style={{display:'flex',gap:8,marginTop:16}}>
          <button onClick={saveLead} style={{...S.btn(),flex:1,padding:12}}>{editL?'💾 Salvar Alterações':'✅ Criar Lead'}</button>
          <button onClick={()=>{setShowLM(false);setEditL(null);}} style={{...S.btn('outline'),padding:12}}>Cancelar</button>
        </div>
      </Modal>

      {/* Modal Imóvel */}
      <Modal open={showPM} onClose={()=>{setShowPM(false);setEditP(null);}} title={editP?'✏️ Editar Imóvel':'➕ Novo Imóvel'} width={600}>
        {/* Scraper dentro do modal */}
        <div style={{...S.card,background:T.bg3,padding:12,marginBottom:16}}>
          <div style={{fontSize:10,color:T.gold,fontWeight:600,marginBottom:8}}>🔗 Importar de URL (ZAP / VivaReal / OLX)</div>
          <div style={{display:'flex',gap:8}}>
            <input value={scrapeUrl} onChange={e=>setScrapeUrl(e.target.value)} placeholder="https://www.zapimoveis.com.br/..." style={{...S.input,flex:1}}/>
            <button onClick={runScrape} disabled={scrapeLoad} style={{...S.btn(),opacity:scrapeLoad?.5:1,whiteSpace:'nowrap'}}>{scrapeLoad?'...':'Importar'}</button>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div style={{gridColumn:'1/-1'}}>
            <label style={S.label}>Título *</label>
            <input value={pf.title} onChange={e=>setPf(f=>({...f,title:e.target.value}))} placeholder="Rôgga Oceano Club — 3 Suítes" style={S.input}/>
          </div>
          {([['dev','Construtora',['Rôgga','Vetter','Hacasa','SBJ','Inbrasul','Rottas','Fabro Haas','Outro']],['city','Cidade',['Balneário Piçarras','Penha','Barra Velha','Navegantes','Itapoá','BC','Joinville','Jaraguá do Sul']],['type','Tipo',['Apartamento','Casa','Cobertura','Geminado','Penthouse','Terreno']],['status','Status',['disponível','reservado','vendido']]] as const).map(([k,label,opts])=>(
            <div key={k}>
              <label style={S.label}>{label}</label>
              <select value={(pf as any)[k]} onChange={e=>setPf(f=>({...f,[k]:e.target.value}))} style={{...S.input}}>{(opts as readonly string[]).map(o=><option key={o}>{o}</option>)}</select>
            </div>
          ))}
          {([['price','Preço (R$)',640000,'number'],['area','Área (m²)',89,'number'],['beds','Quartos',3,'number'],['yield','Yield (%/ano)',13.5,'number']] as const).map(([k,label,ph,type])=>(
            <div key={k}>
              <label style={S.label}>{label}</label>
              <input type={type} value={(pf as any)[k]} onChange={e=>setPf(f=>({...f,[k]:parseFloat(e.target.value)||0}))} placeholder={String(ph)} style={S.input}/>
            </div>
          ))}
          <div style={{gridColumn:'1/-1'}}>
            <label style={S.label}>URL da Foto</label>
            <input value={pf.photo} onChange={e=>setPf(f=>({...f,photo:e.target.value}))} placeholder="https://..." style={S.input}/>
          </div>
        </div>
        <div style={{display:'flex',gap:8,marginTop:16}}>
          <button onClick={saveProp} style={{...S.btn(),flex:1,padding:12}}>{editP?'💾 Salvar':'✅ Criar Imóvel'}</button>
          <button onClick={()=>{setShowPM(false);setEditP(null);}} style={{...S.btn('outline'),padding:12}}>Cancelar</button>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} remove={id=>setToasts(t=>t.filter(x=>x.id!==id))}/>
    </div>
  );
}
