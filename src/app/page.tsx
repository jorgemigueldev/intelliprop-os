'use client';
// ═══════════════════════════════════════════════════════════════════════
//  IMOVAI OS v13.0 — Sistema Operacional do Corretor
//  Dashboard · PDF Apresentação · WhatsApp QR · Imóveis R$500k+
//  Next.js 14 · TypeScript · Design "Obsidian Luxury"
// ═══════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { Lead, Property, Message, Toast } from '../lib/types';
import { LEADS_INIT, PROPERTIES, STAGES, MSGS_INIT, SRC_IC, SRC_LB, TC, SC } from '../lib/data';
import {
  enrichLead, analyticsEngine, computeEinsteinScore, leadTemperature,
  followUpMessage, detectBuyingIntent, detectObjection, objectionCounterscript,
  analyzeConversation, calculateInvestmentROI, getNeighborhoodInsights,
  generatePropertyDescription, lifeEventHint, icpMatch, followupScheduler,
} from '../lib/engine';
import {
  T, ScoreRing, Av, Pill, StatCard, ProbBar, NBAChip,
  Sparkline, SentimentBar, VelocityChip, ICPBadge, StatusBadge,
  ToastContainer, ScriptModal, LeadRow,
} from './components/ui';

type TabKey = 'dashboard'|'leads'|'pipeline'|'imoveis'|'chat'|'insights'|'automations'|'analytics'|'forecast'|'engine'|'whatsapp'|'integracoes';
type ScriptModalState = { type:'call'|'video'; lead:Lead } | null;
type PropertyModal = { property: Property; tab: 'fotos'|'pdf'|'roi' } | null;

const TABS = [
  { k:'dashboard' as TabKey,   icon:'◈',  label:'Dashboard'   },
  { k:'leads' as TabKey,       icon:'◉',  label:'Leads'        },
  { k:'pipeline' as TabKey,    icon:'⊞',  label:'Pipeline'     },
  { k:'imoveis' as TabKey,     icon:'⊟',  label:'Imóveis'      },
  { k:'chat' as TabKey,        icon:'◎',  label:'Chat IA'      },
  { k:'insights' as TabKey,    icon:'🔍', label:'Insights'     },
  { k:'automations' as TabKey, icon:'⚡', label:'Automações'   },
  { k:'analytics' as TabKey,   icon:'📈', label:'Analytics'    },
  { k:'forecast' as TabKey,    icon:'🔮', label:'Forecast'     },
  { k:'whatsapp' as TabKey,    icon:'📱', label:'WhatsApp'     },
  { k:'engine' as TabKey,      icon:'⬡',  label:'Engine'       },
  { k:'integracoes' as TabKey, icon:'🔗', label:'Integrações'  },
];

// ── PDF Generator (client-side via print/html) ──────────────────────
function generatePDFPresentation(property: Property): void {
  const roi = calculateInvestmentROI(property);
  const nb  = getNeighborhoodInsights(property.city);
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${property.title} — Jorge Miguel Imóveis</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Raleway:wght@300;400;600&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Raleway',sans-serif; background:#0A0A0A; color:#F0F0F0; }
  .page { width:210mm; min-height:297mm; margin:0 auto; background:#0D0D14; position:relative; overflow:hidden; }
  .hero { position:relative; height:280px; overflow:hidden; }
  .hero img { width:100%; height:100%; object-fit:cover; filter:brightness(0.6); }
  .hero-overlay { position:absolute; inset:0; background:linear-gradient(to bottom,transparent 30%,#0D0D14 100%); }
  .hero-content { position:absolute; bottom:24px; left:32px; right:32px; }
  .tag { display:inline-block; padding:4px 12px; border-radius:4px; font-size:10px; font-weight:700; letter-spacing:2px; margin-bottom:8px; }
  .code { font-size:11px; color:#999; letter-spacing:2px; margin-bottom:4px; }
  .title { font-family:'Playfair Display',serif; font-size:32px; font-weight:800; line-height:1.1; margin-bottom:6px; }
  .subtitle { font-size:14px; color:#AAA; }
  .body { padding:28px 32px; }
  .section { margin-bottom:24px; }
  .section-title { font-size:9px; letter-spacing:3px; color:#666; text-transform:uppercase; margin-bottom:12px; padding-bottom:6px; border-bottom:1px solid #1E1E2E; }
  .price { font-family:'Playfair Display',serif; font-size:40px; font-weight:800; color:#10B981; letter-spacing:-1px; }
  .price-sub { font-size:12px; color:#666; margin-top:2px; }
  .kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin:20px 0; }
  .kpi { background:#13131E; border:1px solid #1E1E2E; border-radius:8px; padding:12px; text-align:center; }
  .kpi-val { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; color:#3B82F6; }
  .kpi-label { font-size:9px; color:#666; margin-top:3px; letter-spacing:1px; text-transform:uppercase; }
  .roi-box { background:linear-gradient(135deg,#0C2E1A,#0A0A0A); border:1px solid #10B981; border-radius:10px; padding:20px; }
  .roi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:12px; }
  .roi-item { text-align:center; }
  .roi-val { font-family:'Playfair Display',serif; font-size:24px; font-weight:700; }
  .roi-label { font-size:9px; color:#666; margin-top:2px; }
  .features { display:flex; flex-wrap:wrap; gap:6px; }
  .feature { background:#13131E; border:1px solid #1E1E2E; padding:5px 10px; border-radius:4px; font-size:11px; color:#AAA; }
  .photos { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px; }
  .photos img { width:100%; height:120px; object-fit:cover; border-radius:6px; }
  .neighborhood { background:#13131E; border:1px solid #1E1E2E; border-radius:10px; padding:16px; }
  .nb-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:8px; }
  .nb-item { text-align:center; }
  .nb-val { font-size:20px; font-weight:700; color:#EAB308; }
  .nb-label { font-size:9px; color:#666; margin-top:2px; }
  .footer { background:#080810; padding:20px 32px; display:flex; justify-content:space-between; align-items:center; border-top:1px solid #1E1E2E; }
  .footer-brand { font-family:'Playfair Display',serif; font-size:16px; font-weight:700; }
  .footer-contact { font-size:11px; color:#666; }
  .highlight-box { background:linear-gradient(135deg,#1A1230,#0D0D14); border:1px solid #8B5CF6; border-radius:8px; padding:12px 16px; font-size:12px; color:#CCC; font-style:italic; }
  .dev-badge { display:inline-block; background:#1E1E2E; padding:3px 10px; border-radius:4px; font-size:10px; color:#666; margin-top:6px; }
  @media print { body{background:#0D0D14} .page{width:100%;margin:0} }
</style>
</head>
<body>
<div class="page">
  <div class="hero">
    <img src="${property.photos?.[0] || property.photo}" alt="${property.title}" crossorigin="anonymous"/>
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <div class="tag" style="background:${property.tagColor}20;color:${property.tagColor};border:1px solid ${property.tagColor}40">${property.tag}</div>
      <div class="code">${property.code} · ${property.developer}</div>
      <div class="title">${property.title}</div>
      <div class="subtitle">📍 ${property.address}</div>
    </div>
  </div>
  <div class="body">
    <div class="section">
      <div class="price">R$ ${(property.price/1000).toFixed(0)}k</div>
      <div class="price-sub">${property.type} · ${property.area}m² · ${property.bedrooms > 0 ? property.bedrooms + (property.bedrooms===1?' dormitório':' dormitórios') : 'Studio'} · ${property.beach} da praia</div>
      <div class="dev-badge">Entrega: ${property.launchDate}</div>
    </div>
    <div class="kpis">
      <div class="kpi"><div class="kpi-val">${property.area}m²</div><div class="kpi-label">Área Privativa</div></div>
      <div class="kpi"><div class="kpi-val">${property.beach}</div><div class="kpi-label">Distância Praia</div></div>
      <div class="kpi"><div class="kpi-val">${property.yield > 0 ? property.yield + '%' : '—'}</div><div class="kpi-label">Yield Airbnb</div></div>
      <div class="kpi"><div class="kpi-val">R$ ${(property.commission/1000).toFixed(0)}k</div><div class="kpi-label">Comissão</div></div>
    </div>
    ${property.airbnb && roi ? `
    <div class="section">
      <div class="section-title">📊 Análise de Retorno sobre Investimento</div>
      <div class="roi-box">
        <div style="font-size:12px;color:#10B981;font-weight:700;">✅ Rating: ${roi.rating}</div>
        <div class="roi-grid">
          <div class="roi-item"><div class="roi-val" style="color:#10B981">${roi.netYield}%</div><div class="roi-label">Yield Líquido</div></div>
          <div class="roi-item"><div class="roi-val" style="color:#3B82F6">R$ ${(roi.monthlyRent/1000).toFixed(1)}k</div><div class="roi-label">Renda/Mês Airbnb</div></div>
          <div class="roi-item"><div class="roi-val" style="color:#EAB308">${roi.paybackYears}a</div><div class="roi-label">Retorno Total</div></div>
        </div>
      </div>
    </div>` : ''}
    <div class="section">
      <div class="section-title">🏆 Destaque</div>
      <div class="highlight-box">"${property.highlight}"</div>
    </div>
    <div class="section">
      <div class="section-title">📝 Descrição</div>
      <p style="font-size:12px;color:#AAA;line-height:1.7">${property.description}</p>
    </div>
    <div class="section">
      <div class="section-title">✅ Diferenciais e Infraestrutura</div>
      <div class="features">${(property.features || []).map(f => `<span class="feature">✓ ${f}</span>`).join('')}</div>
    </div>
    <div class="section">
      <div class="section-title">📍 Mercado — ${property.city}</div>
      <div class="neighborhood">
        <div class="nb-grid">
          <div class="nb-item"><div class="nb-val">+${nb.appreciation12m}%</div><div class="nb-label">Valorização 12m</div></div>
          <div class="nb-item"><div class="nb-val">${nb.airbnbOccupancy}%</div><div class="nb-label">Ocupação Airbnb</div></div>
          <div class="nb-item"><div class="nb-val">R$ ${(nb.avgM2/1000).toFixed(1)}k</div><div class="nb-label">Média m²</div></div>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">📸 Galeria de Fotos</div>
      <div class="photos">${(property.photos || [property.photo]).slice(0,4).map(p => `<img src="${p}" alt="foto" crossorigin="anonymous"/>`).join('')}</div>
    </div>
    <div style="margin-top:8px;font-size:10px;color:#444;text-align:center">
      IPTU: R$ ${property.iptu.toLocaleString('pt-BR')}/ano · Condomínio: R$ ${property.condo.toLocaleString('pt-BR')}/mês · Unidades disponíveis: ${property.units}/${property.totalUnits}
    </div>
  </div>
  <div class="footer">
    <div>
      <div class="footer-brand">Jorge Miguel Imóveis</div>
      <div class="footer-contact">Litoral Norte SC · Corretor CRECI-SC · Especialista R$500k+</div>
    </div>
    <div style="text-align:right">
      <div class="footer-contact">📞 (47) 98916-0113</div>
      <div class="footer-contact">📸 @jorgemiguelimoveis</div>
      <div class="footer-contact" style="margin-top:4px;color:#444;font-size:9px">Documento gerado por IMOVAI OS v13 · ${new Date().toLocaleDateString('pt-BR')}</div>
    </div>
  </div>
</div>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=900,height=1200');
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 800);
  }
}

// ══════════════════════════════════════════════════════════════════════
export default function IMAOVAIApp() {
  const [tab,            setTab]           = useState<TabKey>('dashboard');
  const [leads,          setLeads]         = useState<Lead[]>(LEADS_INIT);
  const [lead,           setLead]          = useState<Lead | null>(null);
  const [propFilter,     setPropFilter]    = useState('all');
  const [tempFilter,     setTempFilter]    = useState('all');
  const [searchQuery,    setSearchQuery]   = useState('');
  const [chatInput,      setChatInput]     = useState('');
  const [chatHistories,  setChatHistories] = useState<Record<number, Message[]>>({ 1: MSGS_INIT });
  const [typing,         setTyping]        = useState(false);
  const [activeLead,     setActiveLead]    = useState<Lead>(LEADS_INIT[0]);
  const [hotAlert,       setHotAlert]      = useState(true);
  const [insightMode,    setInsightMode]   = useState('all');
  const [autoMode,       setAutoMode]      = useState(true);
  const [intentAlert,    setIntentAlert]   = useState<{ type:string; msg:string; script?:string } | null>(null);
  const [toasts,         setToasts]        = useState<Toast[]>([]);
  const [toastId,        setToastId]       = useState(0);
  const [activeAutoTab,  setActiveAutoTab] = useState('sequences');
  const [scriptModal,    setScriptModal]   = useState<ScriptModalState>(null);
  const [propertyModal,  setPropertyModal] = useState<PropertyModal>(null);
  const [propPhotoIdx,   setPropPhotoIdx]  = useState(0);
  const [whatsappStatus, setWAStatus]      = useState<'disconnected'|'connecting'|'connected'>('disconnected');
  const [qrRefresh,      setQRRefresh]     = useState(0);
  const chatRef   = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const msgs = chatHistories[activeLead?.id] || [];

  useEffect(() => { chatRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey||e.ctrlKey) && e.key==='k') { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // WhatsApp QR simulation
  useEffect(() => {
    if (whatsappStatus === 'connecting') {
      const t = setTimeout(() => setWAStatus('connected'), 8000);
      return () => clearTimeout(t);
    }
  }, [whatsappStatus, qrRefresh]);

  const addToast = useCallback((title: string, msg: string, color: string = T.accent as string) => {
    const id = toastId + 1;
    setToastId(id);
    setToasts(p => [...p, { id, title, msg, color }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4200);
  }, [toastId]);

  const dismissToast = useCallback((id: number) => setToasts(p => p.filter(t => t.id !== id)), []);

  const updateLeadStatus = useCallback((leadId: number, newStatus: string) => {
    setLeads(prev => prev.map(l => l.id===leadId ? {...l, status:newStatus as Lead['status']} : l));
    const l = leads.find(l => l.id===leadId);
    addToast('Status atualizado', `${l?.name} → ${STAGES.find(s=>s.key===newStatus)?.label}`, (SC as Record<string,string>)[newStatus] || T.accent as string);
  }, [leads, addToast]);

  const enrichedLeads = useMemo(() => leads.map(l => ({ ...l, _e: enrichLead(l) })), [leads]);
  const sorted = useMemo(() => enrichedLeads.filter(l => {
    const mT = tempFilter==='all' || l._e.derivedTemp===tempFilter;
    const mS = propFilter==='all' || l.status===propFilter;
    const mQ = !searchQuery || l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.location.toLowerCase().includes(searchQuery.toLowerCase()) || l.phone.includes(searchQuery);
    return mT && mS && mQ;
  }).sort((a,b) => b._e.priorityScore - a._e.priorityScore), [enrichedLeads, tempFilter, propFilter, searchQuery]);

  const imminentLeads = useMemo(() => enrichedLeads.filter(l => l._e.imminentClose), [enrichedLeads]);
  const riskLeads     = useMemo(() => enrichedLeads.filter(l => l._e.risk==='alto'), [enrichedLeads]);
  const lifeLeads     = useMemo(() => leads.filter(l => l.lifeEvent), [leads]);
  const hotLeads      = useMemo(() => enrichedLeads.filter(l => l._e.derivedTemp==='hot'), [enrichedLeads]);
  const analytics     = useMemo(() => analyticsEngine(leads), [leads]);
  const sparkData     = useMemo(() => [42,48,45,53,61,58,Math.round(analytics.weightedPipeline/1000)], [analytics]);

  const sendMsg = useCallback(async () => {
    if (!chatInput.trim()) return;

    // Detecção local de intenção e objeção
    if (detectBuyingIntent(chatInput)) {
      setIntentAlert({ type:'intent', msg:'🔥 Intenção de compra detectada!' });
      addToast('Intenção detectada', `${activeLead?.name} demonstrou sinal de compra`, T.amber as string);
    }
    const obj = detectObjection(chatInput);
    if (obj) {
      const script = objectionCounterscript(obj, activeLead);
      setIntentAlert({ type:'objection', msg:`🚫 Objeção "${obj}" detectada.`, script });
    }

    // Adicionar mensagem do agente
    const userMsg: Message = {
      id: msgs.length + 1,
      from: 'agent',
      text: chatInput,
      time: new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }),
      sentiment: 'neutro',
    };
    const currentInput = chatInput;
    setChatHistories(prev => ({ ...prev, [activeLead.id]: [...(prev[activeLead.id] || []), userMsg] }));
    setChatInput('');
    setTyping(true);

    try {
      // Chamar API real com Claude Sonnet
      const history = [...(msgs || []), userMsg].slice(-10).map(m => ({
        role: m.from === 'agent' ? 'user' : m.from === 'ai' ? 'assistant' : 'user',
        content: m.text,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          leadContext: {
            name:   activeLead?.name,
            budget: activeLead?.budget,
            intent: activeLead?.intent,
            status: activeLead?.status,
            score:  activeLead?.score,
            code:   activeLead?.code,
          },
        }),
      });

      const data = await res.json();
      setTyping(false);
      setIntentAlert(null);

      const aiText = data.message || 'Erro ao processar resposta da IA.';
      const aiMsg: Message = {
        id: msgs.length + 2,
        from: 'ai',
        text: aiText,
        time: new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }),
        sentiment: 'neutro',
      };
      setChatHistories(prev => ({ ...prev, [activeLead.id]: [...(prev[activeLead.id] || []), aiMsg] }));
    } catch (err) {
      // Fallback local se API não estiver disponível
      setTyping(false);
      setIntentAlert(null);
      const fallbackMsg: Message = {
        id: msgs.length + 2,
        from: 'ai',
        text: `🧠 Beatriz (IMOVAI IA): Analisando "${currentInput.substring(0, 30)}..." · ${activeLead?.intent === 'investimento' ? `Yield ${activeLead?.code ? '14,5%' : '12-16%'} ao ano disponível` : 'Imóvel ideal identificado no portfólio'} · Resposta gerada localmente.`,
        time: new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' }),
        sentiment: 'neutro',
      };
      setChatHistories(prev => ({ ...prev, [activeLead.id]: [...(prev[activeLead.id] || []), fallbackMsg] }));
    }
  }, [chatInput, msgs, activeLead, addToast]);

  const doAction = useCallback((act: string, l: Lead) => {
    if (act==='call') { setChatInput(followUpMessage(l)); setActiveLead(l); setTab('chat'); addToast('NBA Executado', `Iniciando contato com ${l.name}`, T.rose as string); }
    else { setLead(l); setTab('leads'); }
  }, [addToast]);

  // WhatsApp QR Code SVG
  const WA_NUMBER = '+55 47 98916-0113';
  const QR_LINK   = `https://wa.me/5547989160113?text=Ol%C3%A1%2C+tenho+interesse+em+im%C3%B3veis+de+alto+padr%C3%A3o`;

  // Renderiza QR via SVG simplificado (visual only)
  function QRCodeDisplay({ url, size=200 }: { url:string; size?:number }) {
    const seed = url.length;
    const cells = 25;
    const cell  = size / cells;
    const grid: boolean[][] = Array.from({length:cells}, (_,r) =>
      Array.from({length:cells}, (_,c) => {
        if (r<7&&c<7) return (r===0||r===6||c===0||c===6||(r>=2&&r<=4&&c>=2&&c<=4));
        if (r<7&&c>cells-8) return (r===0||r===6||c===cells-7||c===cells-1||(r>=2&&r<=4&&c>=cells-5&&c<=cells-3));
        if (r>cells-8&&c<7) return (r===cells-7||r===cells-1||c===0||c===6||(r>=cells-5&&r<=cells-3&&c>=2&&c<=4));
        if (r===6||c===6) return (r+c)%2===0;
        return ((r*cells+c+seed)*7919)%100 < 45;
      })
    );
    return (
      <svg width={size} height={size} style={{ background:'white', borderRadius:8 }}>
        {grid.map((row,r) => row.map((cell2,c) => cell2 ? (
          <rect key={`${r}-${c}`} x={c*cell} y={r*cell} width={cell} height={cell} fill="#000"/>
        ) : null))}
      </svg>
    );
  }

  return (
    <div style={{ fontFamily:"'IBM Plex Mono','Courier New',monospace", background:T.bg, minHeight:'100vh', color:T.text, display:'flex', flexDirection:'column' }}>
      <style>{`
        .tab-content{animation:fadeUp .2s ease}
        .hov:hover{background:${T.surfaceHover}!important;cursor:pointer}
        .btn{transition:all .12s;cursor:pointer}
        .btn:hover{opacity:.85;transform:scale(.97)}
        .prop-card{transition:all .2s;cursor:pointer}
        .prop-card:hover{border-color:${T.accent}60!important;transform:translateY(-3px);box-shadow:0 12px 32px #00000060}
        .img-thumb:hover{opacity:.85;cursor:pointer}
      `}</style>

      <ToastContainer toasts={toasts} onDismiss={dismissToast}/>
      {scriptModal && <ScriptModal lead={scriptModal.lead} type={scriptModal.type} onClose={() => setScriptModal(null)}/>}

      {/* ── PROPERTY MODAL ── */}
      {propertyModal && (() => {
        const p   = propertyModal.property;
        const roi = calculateInvestmentROI(p);
        const nb  = getNeighborhoodInsights(p.city);
        const photos = p.photos || [p.photo];
        return (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={() => setPropertyModal(null)}>
            <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, width:'92%', maxWidth:800, maxHeight:'90vh', overflowY:'auto', position:'relative' }} onClick={e => e.stopPropagation()}>
              {/* Close */}
              <button onClick={() => setPropertyModal(null)} style={{ position:'absolute', top:12, right:14, background:'none', border:'none', color:T.textSoft, cursor:'pointer', fontSize:18, zIndex:10 }}>✕</button>
              {/* Hero */}
              <div style={{ position:'relative', height:220, overflow:'hidden', borderRadius:'16px 16px 0 0' }}>
                <img src={photos[propPhotoIdx] || p.photo} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'; }}/>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 40%,rgba(8,14,26,.9))' }}/>
                <div style={{ position:'absolute', bottom:16, left:20, right:60 }}>
                  <div style={{ display:'inline-block', padding:'3px 10px', borderRadius:4, background:`${p.tagColor}25`, border:`1px solid ${p.tagColor}50`, color:p.tagColor, fontSize:9, fontWeight:700, letterSpacing:2, marginBottom:6 }}>{p.tag}</div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22, lineHeight:1.1 }}>{p.title}</div>
                  <div style={{ fontSize:10, color:'#AAA', marginTop:4 }}>📍 {p.address}</div>
                </div>
                {/* Thumb nav */}
                <div style={{ position:'absolute', bottom:10, right:14, display:'flex', gap:4 }}>
                  {photos.slice(0,4).map((ph,i) => (
                    <div key={i} onClick={() => setPropPhotoIdx(i)} style={{ width:36, height:28, borderRadius:4, overflow:'hidden', border:`2px solid ${i===propPhotoIdx?T.accent:T.border}`, cursor:'pointer', opacity:i===propPhotoIdx?1:0.6 }}>
                      <img src={ph} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { (e.target as HTMLImageElement).style.display='none'; }}/>
                    </div>
                  ))}
                </div>
              </div>
              {/* Tabs */}
              <div style={{ display:'flex', gap:2, padding:'8px 20px 0', borderBottom:`1px solid ${T.border}` }}>
                {(['fotos','roi','pdf'] as const).map(t => (
                  <button key={t} onClick={() => setPropertyModal({ property:p, tab:t })}
                    style={{ padding:'6px 14px', border:'none', borderRadius:'6px 6px 0 0', background:propertyModal.tab===t?T.surfaceHover:'transparent', color:propertyModal.tab===t?T.text:T.textSoft, fontSize:9, fontWeight:700, cursor:'pointer', fontFamily:'inherit', textTransform:'uppercase', letterSpacing:1 }}>
                    {t==='fotos'?'📸 Fotos & Detalhes':t==='roi'?'📊 ROI & Mercado':'📄 Apresentação PDF'}
                  </button>
                ))}
              </div>
              {/* Content */}
              <div style={{ padding:'20px 24px' }}>
                {propertyModal.tab === 'fotos' && (
                  <div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
                      {photos.slice(0,4).map((ph,i) => (
                        <div key={i} onClick={() => setPropPhotoIdx(i)} className="img-thumb" style={{ height:120, borderRadius:8, overflow:'hidden', border:`2px solid ${i===propPhotoIdx?T.accent:T.border}`, cursor:'pointer' }}>
                          <img src={ph} alt={`foto ${i+1}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { (e.target as HTMLImageElement).src='https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400'; }}/>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
                      {[{l:'Área',v:`${p.area}m²`},{l:'Dorms',v:p.bedrooms>0?`${p.bedrooms}`:'-'},{l:'Praia',v:p.beach},{l:'Entrega',v:p.launchDate}].map(d => (
                        <div key={d.l} style={{ background:T.card, borderRadius:7, padding:'10px 12px', textAlign:'center' }}>
                          <div style={{ fontSize:8, color:T.textSoft, marginBottom:4 }}>{d.l}</div>
                          <div style={{ fontSize:14, fontWeight:700, color:T.accent }}>{d.v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize:11, color:T.textSoft, lineHeight:1.7, marginBottom:14 }}>{p.description}</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                      {(p.features||[]).map(f => <span key={f} style={{ fontSize:9, padding:'3px 8px', background:T.card, border:`1px solid ${T.border}`, borderRadius:4, color:T.textSoft }}>✓ {f}</span>)}
                    </div>
                  </div>
                )}
                {propertyModal.tab === 'roi' && (
                  <div>
                    {roi ? (
                      <>
                        <div style={{ background:T.emeraldDim, border:`1px solid ${T.emerald}30`, borderRadius:10, padding:16, marginBottom:14, textAlign:'center' }}>
                          <div style={{ fontSize:11, color:T.emerald, fontWeight:700, marginBottom:10 }}>Rating: {roi.rating}</div>
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                            {[{l:'Yield Bruto',v:`${roi.grossYield}%`,c:T.cyan},{l:'Yield Líquido',v:`${roi.netYield}%`,c:T.emerald},{l:'Renda/Mês',v:`R$ ${(roi.monthlyRent/1000).toFixed(1)}k`,c:T.gold},{l:'Retorno Total',v:`${roi.paybackYears}a`,c:T.accent}].map(d => (
                              <div key={d.l} style={{ background:T.card, borderRadius:8, padding:'10px 8px' }}>
                                <div style={{ fontSize:8, color:T.textSoft }}>{d.l}</div>
                                <div style={{ fontSize:20, fontWeight:800, color:d.c }}>{d.v}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:12, marginBottom:10 }}>📍 Mercado — {p.city}</div>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:14 }}>
                          {[{l:'Valorização 12m',v:`+${nb.appreciation12m}%`,c:T.emerald},{l:'Ocupação Airbnb',v:`${nb.airbnbOccupancy}%`,c:T.cyan},{l:'Média m²',v:`R$ ${(nb.avgM2/1000).toFixed(1)}k`,c:T.gold}].map(d => (
                            <div key={d.l} style={{ background:T.card, borderRadius:8, padding:'10px 12px', textAlign:'center' }}>
                              <div style={{ fontSize:8, color:T.textSoft }}>{d.l}</div>
                              <div style={{ fontSize:20, fontWeight:800, color:d.c }}>{d.v}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ background:T.card, borderRadius:8, padding:'10px 14px', fontSize:9, color:T.textSoft }}>
                          IPTU: <span style={{ color:T.text }}>R$ {p.iptu.toLocaleString('pt-BR')}/ano</span> ·
                          Condomínio: <span style={{ color:T.text }}>R$ {p.condo.toLocaleString('pt-BR')}/mês</span> ·
                          Unidades disponíveis: <span style={{ color:T.emerald, fontWeight:700 }}>{p.units}/{p.totalUnits}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign:'center', padding:'30px 0', color:T.textSoft, fontSize:11 }}>Este imóvel não é destinado a Airbnb.<br/>ROI por valorização patrimonial.</div>
                    )}
                  </div>
                )}
                {propertyModal.tab === 'pdf' && (
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:48, margin:'20px 0' }}>📄</div>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:18, marginBottom:8 }}>Apresentação Completa</div>
                    <div style={{ fontSize:11, color:T.textSoft, maxWidth:420, margin:'0 auto 24px', lineHeight:1.6 }}>
                      Gere o PDF de apresentação profissional com fotos, análise de ROI, dados de mercado, plantas e todas as informações do imóvel.
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, maxWidth:420, margin:'0 auto 24px' }}>
                      {['✅ Fotos em alta resolução','📊 Análise de ROI completa','📍 Dados de mercado local','💰 Simulação de rendimento','🏗 Informações técnicas','📞 Contato do corretor'].map(f => (
                        <div key={f} style={{ background:T.card, borderRadius:6, padding:'7px 10px', fontSize:9, color:T.textSoft, textAlign:'left' }}>{f}</div>
                      ))}
                    </div>
                    <button onClick={() => { generatePDFPresentation(p); addToast('PDF Gerado', `Apresentação do ${p.code} pronta para imprimir/salvar`, T.emerald as string); }}
                      style={{ padding:'12px 32px', background:`linear-gradient(135deg,${T.emerald},#059669)`, border:'none', borderRadius:10, color:'#fff', fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow:`0 4px 20px ${T.emerald}40` }}>
                      📄 Gerar & Abrir PDF
                    </button>
                    <div style={{ marginTop:12, fontSize:8, color:T.textSoft }}>Abre em nova aba · Pronto para imprimir ou salvar como PDF</div>
                  </div>
                )}
              </div>
              {/* Footer actions */}
              <div style={{ padding:'12px 24px', borderTop:`1px solid ${T.border}`, display:'flex', gap:8, justifyContent:'flex-end' }}>
                <button onClick={() => generatePDFPresentation(p)} className="btn"
                  style={{ padding:'8px 16px', background:T.emeraldDim, border:`1px solid ${T.emerald}30`, borderRadius:8, color:T.emerald, fontSize:10, fontFamily:'inherit', fontWeight:700 }}>
                  📄 Baixar PDF
                </button>
                <button onClick={() => { addToast('WhatsApp', `Compartilhando ${p.code}`, T.emerald as string); }}
                  className="btn" style={{ padding:'8px 16px', background:'#25D36620', border:`1px solid #25D36640`, borderRadius:8, color:'#25D366', fontSize:10, fontFamily:'inherit', fontWeight:700 }}>
                  📱 Enviar WhatsApp
                </button>
                <button onClick={() => setPropertyModal(null)} className="btn"
                  style={{ padding:'8px 16px', background:T.accentDim, border:`1px solid ${T.accent}30`, borderRadius:8, color:T.accent, fontSize:10, fontFamily:'inherit', fontWeight:700 }}>
                  ✕ Fechar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── HEADER ── */}
      <header style={{ background:'rgba(7,12,20,.94)', borderBottom:`1px solid ${T.border}`, padding:'9px 20px', display:'flex', alignItems:'center', gap:14, backdropFilter:'blur(14px)', position:'sticky', top:0, zIndex:50, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:'linear-gradient(135deg,#3B82F6,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>⬡</div>
          <div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:13, letterSpacing:'-0.5px' }}>IMOVAI OS</div>
            <div style={{ fontSize:7, color:T.textSoft, letterSpacing:1 }}>v13.0 · SISTEMA OPERACIONAL</div>
          </div>
        </div>
        <div style={{ flex:1, maxWidth:360, position:'relative' }}>
          <input ref={searchRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="⌘K · Buscar leads, imóveis, regiões..."
            style={{ width:'100%', background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, padding:'6px 12px', color:T.text, fontSize:10, fontFamily:'inherit' }}/>
          {searchQuery && (
            <div style={{ position:'absolute', top:'100%', left:0, right:0, background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, marginTop:4, zIndex:100, boxShadow:'0 8px 32px #00000080', maxHeight:200, overflowY:'auto' }}>
              {sorted.slice(0,5).map(l => (
                <div key={l.id} onClick={() => { setLead(l); setTab('leads'); setSearchQuery(''); }} className="hov" style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', cursor:'pointer', borderBottom:`1px solid ${T.border}15` }}>
                  <Av i={l.avatar} color={(TC as Record<string,string>)[l._e.derivedTemp]||T.accent as string} size={26}/>
                  <div style={{ flex:1 }}><div style={{ fontSize:10, fontWeight:700 }}>{l.name}</div><div style={{ fontSize:8, color:T.textSoft }}>{l.location} · {l.budget}</div></div>
                  <ScoreRing v={l._e.predictiveScore} size={26}/>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display:'flex', gap:6, marginLeft:'auto', flexWrap:'wrap', alignItems:'center' }}>
          {hotAlert && hotLeads.length > 0 && (
            <button onClick={() => { setTab('insights'); setHotAlert(false); }} className="btn"
              style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', background:T.roseDim, border:`1px solid ${T.rose}30`, borderRadius:6, color:T.rose, fontSize:8, fontFamily:'inherit', fontWeight:700, animation:'pulse 2s infinite' }}>
              🔥 {hotLeads.length} HOT
            </button>
          )}
          {imminentLeads.length > 0 && (
            <button onClick={() => setTab('insights')} className="btn"
              style={{ padding:'4px 10px', background:T.roseDim, border:`1px solid ${T.rose}40`, borderRadius:6, color:T.rose, fontSize:8, fontFamily:'inherit', fontWeight:700, animation:'glow 2s infinite' }}>
              🚨 {imminentLeads.length} FECHAR
            </button>
          )}
          <button onClick={() => setTab('whatsapp')} className="btn"
            style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', background: whatsappStatus==='connected'?'#25D36620':'#25D36610', border:`1px solid ${ whatsappStatus==='connected'?'#25D36650':'#25D36620'}`, borderRadius:6 }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background: whatsappStatus==='connected'?'#25D366':whatsappStatus==='connecting'?T.amber:'#666', animation:'pulse 2s infinite' }}/>
            <span style={{ fontSize:8, color: whatsappStatus==='connected'?'#25D366':whatsappStatus==='connecting'?T.amber:'#666', fontWeight:700 }}>
              {whatsappStatus==='connected'?'WA ONLINE':whatsappStatus==='connecting'?'CONECTANDO...':'WHATSAPP'}
            </span>
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', background:autoMode?T.emeraldDim:T.amberDim, border:`1px solid ${autoMode?T.emerald:T.amber}25`, borderRadius:6, cursor:'pointer' }}
            onClick={() => setAutoMode(!autoMode)}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:autoMode?T.emerald:T.amber, animation:'pulse 2s infinite' }}/>
            <span style={{ fontSize:8, color:autoMode?T.emerald:T.amber, fontWeight:700 }}>{autoMode?'AUTO ON':'AUTO OFF'}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px', background:T.accentDim, border:`1px solid ${T.accent}25`, borderRadius:6 }}>
            <img src="/mnt/user-data/uploads/341193921_957094081956345_456947576473386791_n.jpg" alt="Jorge" style={{ width:22, height:22, borderRadius:'50%', objectFit:'cover' }} onError={e => { (e.target as HTMLImageElement).style.display='none'; }}/>
            <span style={{ fontSize:9, fontWeight:600 }}>Jorge</span>
          </div>
        </div>
      </header>

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        {/* ── SIDEBAR ── */}
        <nav style={{ width:52, background:T.surface, borderRight:`1px solid ${T.border}`, display:'flex', flexDirection:'column', alignItems:'center', paddingTop:8, gap:2, flexShrink:0 }}>
          {TABS.map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} title={t.label} className="btn"
              style={{ width:36, height:36, borderRadius:8, border:'none', background:tab===t.k?T.surfaceHover:'transparent', color:tab===t.k?T.text:T.textSoft, cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              {t.icon}
              {t.k==='insights' && imminentLeads.length>0 && <div style={{ position:'absolute', top:3, right:3, width:6, height:6, borderRadius:'50%', background:T.rose, border:`1.5px solid ${T.bg}` }}/>}
              {t.k==='whatsapp' && whatsappStatus==='connected' && <div style={{ position:'absolute', top:3, right:3, width:6, height:6, borderRadius:'50%', background:'#25D366', border:`1.5px solid ${T.bg}` }}/>}
            </button>
          ))}
        </nav>

        {/* ── MAIN ── */}
        <main style={{ flex:1, overflowY:'auto', padding:16 }}>

          {/* ══════════ DASHBOARD ══════════ */}
          {tab === 'dashboard' && (
            <div className="tab-content">
              <div style={{ marginBottom:16 }}>
                <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22 }}>Dashboard</h1>
                <p style={{ fontSize:10, color:T.textSoft, marginTop:2 }}>IMOVAI OS v13.0 · Sistema Operacional do Corretor · Imóveis R$500k+ · Litoral Norte SC</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))', gap:10, marginBottom:14 }}>
                <StatCard label="Pipeline Ponderado" value={`R$ ${Math.round(analytics.weightedPipeline/1000)}k`} sub={`${analytics.totalLeads} leads ativos`} icon="💰" color={T.gold as string} trend={18} onClick={() => setTab('forecast')}/>
                <StatCard label="Forecast Mensal" value={`R$ ${Math.round(analytics.forecastThisMonth/1000)}k`} sub="previsão 30 dias" icon="🔮" color={T.emerald as string} onClick={() => setTab('forecast')}/>
                <StatCard label="Hot Leads" value={analytics.hotLeads.toString()} sub="alta probabilidade" icon="🔥" color={T.rose as string} onClick={() => setTab('leads')}/>
                <StatCard label="NBA Crítico" value={imminentLeads.length.toString()} sub="ação imediata" icon="🚨" color={T.rose as string} onClick={() => setTab('insights')}/>
                <StatCard label="Conversão" value={`${analytics.conversionRate}%`} sub="lead → proposta" icon="📈" color={T.accent as string}/>
                <StatCard label="Imóveis Ativos" value={`${PROPERTIES.length}`} sub="carteira exclusiva" icon="🏠" color={T.violet as string} onClick={() => setTab('imoveis')}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                    <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13 }}>📊 Pipeline — Histórico</span>
                    <span style={{ fontSize:9, color:T.gold, fontWeight:700 }}>R$ {Math.round(analytics.totalRevenuePotential/1000)}k total</span>
                  </div>
                  <Sparkline data={sparkData} color={T.gold as string} width={280} height={50}/>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginTop:12 }}>
                    {[{l:'🔥 Hot',v:analytics.hotLeads,c:T.rose},{l:'☀️ Warm',v:analytics.warmLeads,c:T.amber},{l:'❄️ Cold',v:analytics.coldLeads,c:T.accent}].map(d => (
                      <div key={d.l} style={{ textAlign:'center', padding:6, background:T.card, borderRadius:7 }}>
                        <div style={{ fontSize:9, color:d.c, fontWeight:700 }}>{d.l}</div>
                        <div style={{ fontSize:18, fontWeight:800, color:d.c }}>{d.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                    <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13 }}>🚨 Ações Prioritárias</span>
                    <button onClick={() => setTab('leads')} style={{ fontSize:8, color:T.accent, background:'none', border:`1px solid ${T.accent}30`, borderRadius:4, padding:'2px 6px', cursor:'pointer', fontFamily:'inherit' }}>Ver todos</button>
                  </div>
                  {sorted.slice(0,4).map(l => (
                    <div key={l.id} onClick={() => { setLead(l); setTab('leads'); }} className="hov" style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 8px', borderRadius:7, marginBottom:4, cursor:'pointer' }}>
                      <Av i={l.avatar} color={(TC as Record<string,string>)[l._e.derivedTemp]||T.accent as string} size={28}/>
                      <div style={{ flex:1 }}><div style={{ fontSize:10, fontWeight:700 }}>{l.name}</div><NBAChip nba={l._e.nba}/></div>
                      <ScoreRing v={l._e.predictiveScore} size={30}/>
                    </div>
                  ))}
                </div>
              </div>
              {/* Destaques Imóveis */}
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13 }}>🏖 Destaques da Carteira</span>
                  <button onClick={() => setTab('imoveis')} style={{ fontSize:8, color:T.accent, background:'none', border:`1px solid ${T.accent}30`, borderRadius:4, padding:'2px 6px', cursor:'pointer', fontFamily:'inherit' }}>Ver todos</button>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
                  {PROPERTIES.slice(0,4).map(p => (
                    <div key={p.code} onClick={() => { setPropertyModal({ property:p, tab:'fotos' }); setPropPhotoIdx(0); }} className="prop-card"
                      style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, overflow:'hidden' }}>
                      <div style={{ height:80, overflow:'hidden', position:'relative' }}>
                        <img src={p.photo} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { (e.target as HTMLImageElement).src='https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400'; }}/>
                        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 50%,rgba(8,14,26,.8))' }}/>
                        <div style={{ position:'absolute', top:6, left:6, padding:'2px 6px', borderRadius:3, background:`${p.tagColor}20`, border:`1px solid ${p.tagColor}40`, color:p.tagColor, fontSize:8, fontWeight:700 }}>{p.tag}</div>
                      </div>
                      <div style={{ padding:'8px 10px' }}>
                        <div style={{ fontSize:10, fontWeight:700, marginBottom:2 }}>{p.title.slice(0,24)}</div>
                        <div style={{ fontSize:14, fontWeight:800, color:T.emerald }}>{p.yield>0?`Yield ${p.yield}%`:p.city}</div>
                        <div style={{ fontSize:10, color:T.textSoft }}>R$ {(p.price/1000).toFixed(0)}k · {p.area}m²</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ LEADS ══════════ */}
          {tab === 'leads' && (
            <div className="tab-content">
              <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap', alignItems:'center' }}>
                <div style={{ flex:1, fontSize:11, fontFamily:'Syne,sans-serif', fontWeight:800 }}>Leads · {sorted.length} ativos</div>
                {(['all','hot','warm','cold'] as const).map(f => (
                  <button key={f} onClick={() => setTempFilter(f)} className="btn"
                    style={{ padding:'3px 10px', borderRadius:14, border:`1px solid ${tempFilter===f?((TC as Record<string,string>)[f]||T.accent):T.border}`, background:tempFilter===f?`${((TC as Record<string,string>)[f]||T.accent)}14`:'transparent', color:tempFilter===f?((TC as Record<string,string>)[f]||T.accent):T.textSoft, fontSize:8, fontFamily:'inherit', fontWeight:700 }}>
                    {f==='all'?'Todos':f==='hot'?'🔥 Hot':f==='warm'?'☀️ Warm':'❄️ Cold'}
                  </button>
                ))}
                {STAGES.map(s => (
                  <button key={s.key} onClick={() => setPropFilter(s.key===propFilter?'all':s.key)} className="btn"
                    style={{ padding:'3px 10px', borderRadius:14, border:`1px solid ${propFilter===s.key?s.color:T.border}`, background:propFilter===s.key?`${s.color}14`:'transparent', color:propFilter===s.key?s.color:T.textSoft, fontSize:8, fontFamily:'inherit', fontWeight:700 }}>
                    {s.label}
                  </button>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'2.2fr 0.9fr 1fr 60px 50px 55px', padding:'6px 16px', fontSize:7, color:T.textSoft, textTransform:'uppercase', letterSpacing:1.5, borderBottom:`1px solid ${T.border}`, marginBottom:2 }}>
                <span>Lead</span><span>Budget</span><span>Status</span><span style={{ textAlign:'center' }}>Score</span><span style={{ textAlign:'center' }}>Vel.</span><span style={{ textAlign:'center' }}>Prob.</span>
              </div>
              {sorted.map(l => <LeadRow key={l.id} l={l} selected={lead?.id===l.id} onClick={() => setLead(lead?.id===l.id?null:l)} onStatusChange={updateLeadStatus}/>)}
              {lead && (() => {
                const e = enrichLead(lead);
                const tc = (TC as Record<string,string>)[e.derivedTemp]||T.textSoft;
                return (
                  <div style={{ marginTop:16, background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:20 }}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:16, paddingBottom:16, borderBottom:`1px solid ${T.border}` }}>
                      <Av i={lead.avatar} color={tc} size={48}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16, marginBottom:4 }}>{lead.name}</div>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                          <Pill label={e.derivedTemp==='hot'?'🔥 Hot':e.derivedTemp==='warm'?'☀️ Warm':'❄️ Cold'} color={tc}/>
                          <Pill label={`Score ${e.predictiveScore}`} color={T.accent as string}/>
                          <Pill label={`ICP ${e.icp}%`} color={e.icp>=80?T.emerald as string:e.icp>=50?T.amber as string:T.rose as string}/>
                          {lead.lifeEvent && <Pill label="🔔 Life Event" color={T.violet as string}/>}
                          {e.imminentClose && <Pill label="🚨 FECHAR AGORA" color={T.rose as string}/>}
                        </div>
                        <div style={{ fontSize:9, color:T.textSoft, marginTop:6 }}>📞 {lead.phone} · 📧 {lead.email} · 📍 {lead.location}</div>
                      </div>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        <button onClick={() => setScriptModal({type:'call',lead})} className="btn" style={{ padding:'6px 12px', background:T.roseDim, border:`1px solid ${T.rose}30`, borderRadius:7, color:T.rose, fontSize:9, fontFamily:'inherit', fontWeight:700 }}>📞 Script</button>
                        <button onClick={() => setScriptModal({type:'video',lead})} className="btn" style={{ padding:'6px 12px', background:T.violetDim, border:`1px solid ${T.violet}30`, borderRadius:7, color:T.violet, fontSize:9, fontFamily:'inherit', fontWeight:700 }}>🎬 Vídeo</button>
                        <button onClick={() => { setActiveLead(lead); setTab('chat'); }} className="btn" style={{ padding:'6px 12px', background:T.accentDim, border:`1px solid ${T.accent}30`, borderRadius:7, color:T.accent, fontSize:9, fontFamily:'inherit', fontWeight:700 }}>💬 Chat IA</button>
                      </div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                      <div>
                        <div style={{ fontSize:9, color:T.textSoft, marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>NBA Engine</div>
                        <NBAChip nba={e.nba}/>
                        {e.lifeHint && <div style={{ marginTop:8, padding:'7px 10px', background:T.violetDim, borderRadius:7, fontSize:9, color:T.violet }}>{e.lifeHint}</div>}
                        <div style={{ marginTop:10, fontSize:8, color:T.textSoft, lineHeight:1.8 }}>
                          <div>💰 Budget: <span style={{ color:T.emerald, fontWeight:700 }}>{lead.budget}</span></div>
                          <div>🎯 Intenção: <span style={{ color:T.accent }}>{lead.intent}</span></div>
                          <div>📊 Prob: <span style={{ color:e.prob>=0.7?T.emerald:e.prob>=0.5?T.amber:T.rose, fontWeight:700 }}>{Math.round(e.prob*100)}%</span></div>
                          <div>📅 Fechar em: <span style={{ color:T.cyan }}>{e.closeDate}</span></div>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize:9, color:T.textSoft, marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Imóveis Recomendados</div>
                        {e.recommendations.map(p => (
                          <div key={p.code} onClick={() => { setPropertyModal({ property:p, tab:'fotos' }); setPropPhotoIdx(0); }} style={{ marginBottom:8, padding:'8px 10px', background:T.card, borderRadius:8, border:`1px solid ${T.accent}15`, cursor:'pointer' }}>
                            <div style={{ height:50, borderRadius:5, overflow:'hidden', marginBottom:6 }}>
                              <img src={p.photo} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { (e.target as HTMLImageElement).src='https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=300'; }}/>
                            </div>
                            <div style={{ fontSize:9, fontWeight:700 }}>{p.code} — {p.title.slice(0,20)}</div>
                            <div style={{ display:'flex', justifyContent:'space-between', marginTop:3 }}>
                              <span style={{ fontSize:8, color:T.emerald, fontWeight:700 }}>{p.matchScore}pts</span>
                              <span style={{ fontSize:8, color:T.accent }}>R$ {(p.price/1000).toFixed(0)}k</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div style={{ fontSize:9, color:T.textSoft, marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Timeline</div>
                        {lead.timeline?.map((ev,i) => (
                          <div key={i} style={{ display:'flex', gap:8, marginBottom:8 }}>
                            <div style={{ width:18, height:18, borderRadius:'50%', background:ev.type==='ai'?T.accentDim:ev.type==='insight'?T.violetDim:T.emeraldDim, border:`1px solid ${ev.type==='ai'?T.accent:ev.type==='insight'?T.violet:T.emerald}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, flexShrink:0 }}>{ev.icon}</div>
                            <div><div style={{ fontSize:9 }}>{ev.event}</div><div style={{ fontSize:8, color:T.textSoft }}>{ev.time}</div></div>
                          </div>
                        ))}
                        <div style={{ marginTop:8 }}>
                          <div style={{ fontSize:8, color:T.textSoft, marginBottom:4 }}>MENSAGEM IA SUGERIDA</div>
                          <div onClick={() => { setActiveLead(lead); setChatInput(e.followUpMsg); setTab('chat'); }} style={{ fontSize:9, background:T.card, padding:'8px 10px', borderRadius:7, color:T.textSoft, border:`1px solid ${T.border}`, cursor:'pointer', lineHeight:1.5 }}>{e.followUpMsg}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ══════════ PIPELINE ══════════ */}
          {tab === 'pipeline' && (
            <div className="tab-content">
              <div style={{ marginBottom:16 }}>
                <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22 }}>Pipeline Kanban</h1>
                <p style={{ fontSize:10, color:T.textSoft, marginTop:2 }}>Pipeline ponderado R$ {Math.round(analytics.weightedPipeline/1000)}k</p>
              </div>
              <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:10 }}>
                {STAGES.map(stage => {
                  const sLeads = leads.filter(l => l.status===stage.key);
                  const sRev   = sLeads.reduce((s,l) => s+l.revenueExpected, 0);
                  return (
                    <div key={stage.key} style={{ minWidth:180, maxWidth:200, flexShrink:0 }}>
                      <div style={{ padding:'8px 12px', background:`${stage.color}12`, border:`1px solid ${stage.color}25`, borderRadius:'8px 8px 0 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div><div style={{ fontSize:9, fontWeight:700, color:stage.color, textTransform:'uppercase', letterSpacing:1 }}>{stage.label}</div><div style={{ fontSize:8, color:T.textSoft }}>R$ {(sRev/1000).toFixed(0)}k</div></div>
                        <div style={{ width:18, height:18, borderRadius:'50%', background:`${stage.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:stage.color }}>{sLeads.length}</div>
                      </div>
                      <div style={{ background:T.surface, border:`1px solid ${stage.color}15`, borderTop:'none', borderRadius:'0 0 8px 8px', minHeight:60, padding:6 }}>
                        {sLeads.length===0 ? <div style={{ textAlign:'center', padding:'12px 0', color:T.textSoft, fontSize:9 }}>Vazio</div> : sLeads.map(l => {
                          const e = enrichLead(l);
                          return (
                            <div key={l.id} onClick={() => { setLead(l); setTab('leads'); }} className="hov"
                              style={{ background:T.card, borderRadius:7, padding:'8px 10px', marginBottom:6, cursor:'pointer', border:`1px solid ${e.imminentClose?T.rose:T.border}20`, position:'relative' }}>
                              {e.imminentClose && <div style={{ position:'absolute', top:6, right:6, width:5, height:5, borderRadius:'50%', background:T.rose, animation:'pulse 1s infinite' }}/>}
                              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
                                <Av i={l.avatar} color={(TC as Record<string,string>)[e.derivedTemp]||T.textSoft} size={22}/>
                                <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:9, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.name}</div><div style={{ fontSize:8, color:T.textSoft }}>{l.budget}</div></div>
                              </div>
                              <ProbBar v={l.closingProbability}/>
                              <div style={{ display:'flex', justifyContent:'space-between', marginTop:5 }}>
                                <ScoreRing v={e.predictiveScore} size={24}/>
                                <div style={{ fontSize:8, color:T.emerald, fontWeight:700 }}>R$ {(l.revenueExpected/1000).toFixed(0)}k</div>
                              </div>
                              {(() => { const idx=STAGES.findIndex(s=>s.key===l.status); const next=STAGES[idx+1]; return next&&next.key!=='perdido'?(<button onClick={ev=>{ev.stopPropagation();updateLeadStatus(l.id,next.key);}} style={{ marginTop:5, width:'100%', fontSize:8, padding:'2px 0', background:`${next.color}12`, border:`1px solid ${next.color}25`, borderRadius:4, color:next.color, cursor:'pointer', fontFamily:'inherit' }}>→ {next.label}</button>):null; })()}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════════ IMÓVEIS ══════════ */}
          {tab === 'imoveis' && (
            <div className="tab-content">
              <div style={{ marginBottom:16 }}>
                <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22 }}>Imóveis Premium</h1>
                <p style={{ fontSize:10, color:T.textSoft, marginTop:2 }}>Carteira exclusiva R$500k+ · Fotos reais · ROI calculado · Apresentação PDF · {PROPERTIES.length} imóveis</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
                {PROPERTIES.map(p => {
                  const roi = calculateInvestmentROI(p);
                  const nb  = getNeighborhoodInsights(p.city);
                  return (
                    <div key={p.code} className="prop-card" onClick={() => { setPropertyModal({ property:p, tab:'fotos' }); setPropPhotoIdx(0); }}
                      style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, overflow:'hidden' }}>
                      {/* Foto principal */}
                      <div style={{ height:160, overflow:'hidden', position:'relative' }}>
                        <img src={p.photo} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .3s' }}
                          onError={e => { (e.target as HTMLImageElement).src='https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'; }}/>
                        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 40%,rgba(8,14,26,.85))' }}/>
                        {/* Tag */}
                        <div style={{ position:'absolute', top:10, left:10, padding:'3px 8px', borderRadius:4, background:`${p.tagColor}30`, border:`1px solid ${p.tagColor}60`, color:p.tagColor, fontSize:8, fontWeight:800, letterSpacing:1.5 }}>{p.tag}</div>
                        {/* Status */}
                        <div style={{ position:'absolute', top:10, right:10, padding:'2px 6px', borderRadius:3, background:p.status==='disponível'?T.emerald:T.amber, color:'#000', fontSize:8, fontWeight:700 }}>{p.status.toUpperCase()}</div>
                        {/* Yield badge */}
                        {p.airbnb && p.yield > 0 && (
                          <div style={{ position:'absolute', bottom:8, right:10, padding:'3px 8px', borderRadius:4, background:'rgba(6,182,212,.9)', color:'#fff', fontSize:9, fontWeight:800 }}>Yield {p.yield}%</div>
                        )}
                        {/* Valorização */}
                        <div style={{ position:'absolute', bottom:8, left:10, fontSize:8, color:'#AAA' }}>+{nb.appreciation12m}%/ano · {p.beach}</div>
                        {/* Foto count */}
                        <div style={{ position:'absolute', top:32, right:10, fontSize:8, color:'#FFF', background:'rgba(0,0,0,.6)', padding:'2px 5px', borderRadius:4 }}>📸 {(p.photos||[p.photo]).length}</div>
                      </div>
                      {/* Conteúdo */}
                      <div style={{ padding:'12px 14px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                          <div>
                            <div style={{ fontSize:7, color:T.textSoft, letterSpacing:1.5, textTransform:'uppercase', marginBottom:2 }}>{p.code} · {p.developer}</div>
                            <div style={{ fontSize:13, fontWeight:700, lineHeight:1.2 }}>{p.title}</div>
                            <div style={{ fontSize:9, color:T.textSoft, marginTop:2 }}>📍 {p.city} · {p.area}m² · {p.bedrooms>0?`${p.bedrooms} dorms`:'Studio'}</div>
                          </div>
                        </div>
                        <div style={{ fontSize:20, fontWeight:800, color:T.emerald, margin:'8px 0 4px', letterSpacing:'-0.5px' }}>R$ {(p.price/1000).toFixed(0)}k</div>
                        {p.highlight && <div style={{ fontSize:8, color:T.gold, marginBottom:8 }}>⭐ {p.highlight}</div>}
                        {/* ROI mini */}
                        {roi && (
                          <div style={{ background:T.card, borderRadius:8, padding:'8px 10px', marginBottom:10, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
                            <div style={{ textAlign:'center' }}><div style={{ fontSize:7, color:T.textSoft }}>Yield liq.</div><div style={{ fontSize:13, fontWeight:800, color:T.cyan }}>{roi.netYield}%</div></div>
                            <div style={{ textAlign:'center' }}><div style={{ fontSize:7, color:T.textSoft }}>Renda/mês</div><div style={{ fontSize:13, fontWeight:800, color:T.gold }}>R${(roi.monthlyRent/1000).toFixed(1)}k</div></div>
                            <div style={{ textAlign:'center' }}><div style={{ fontSize:7, color:T.textSoft }}>Retorno</div><div style={{ fontSize:13, fontWeight:800, color:T.accent }}>{roi.paybackYears}a</div></div>
                          </div>
                        )}
                        {/* Features chips */}
                        <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
                          {(p.features||[]).slice(0,4).map(f => <span key={f} style={{ fontSize:8, padding:'2px 6px', background:T.card, border:`1px solid ${T.border}`, borderRadius:3, color:T.textSoft }}>✓ {f}</span>)}
                        </div>
                        {/* Actions */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                          <button onClick={e => { e.stopPropagation(); setPropertyModal({ property:p, tab:'fotos' }); setPropPhotoIdx(0); }} className="btn"
                            style={{ padding:'7px 0', background:T.accentDim, border:`1px solid ${T.accent}25`, borderRadius:7, color:T.accent, fontSize:9, fontFamily:'inherit', fontWeight:700 }}>
                            📸 Ver Imóvel
                          </button>
                          <button onClick={e => { e.stopPropagation(); generatePDFPresentation(p); addToast('PDF Gerado', `Apresentação ${p.code} pronta!`, T.emerald as string); }} className="btn"
                            style={{ padding:'7px 0', background:T.emeraldDim, border:`1px solid ${T.emerald}25`, borderRadius:7, color:T.emerald, fontSize:9, fontFamily:'inherit', fontWeight:700 }}>
                            📄 Baixar PDF
                          </button>
                        </div>
                        <div style={{ marginTop:6, textAlign:'center', fontSize:8, color:T.textSoft }}>Comissão: <span style={{ color:T.gold, fontWeight:700 }}>R$ {(p.commission/1000).toFixed(0)}k</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════════ CHAT ══════════ */}
          {tab === 'chat' && (
            <div className="tab-content" style={{ display:'grid', gridTemplateColumns:'220px 1fr 220px', gap:12, height:'calc(100vh - 130px)' }}>
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, overflow:'hidden', display:'flex', flexDirection:'column' }}>
                <div style={{ padding:'10px 12px', borderBottom:`1px solid ${T.border}`, fontSize:9, fontWeight:700, color:T.textSoft }}>LEADS ATIVOS</div>
                <div style={{ overflowY:'auto', flex:1 }}>
                  {leads.map(l => {
                    const e = enrichLead(l); const len = (chatHistories[l.id]||[]).length;
                    return (
                      <div key={l.id} onClick={() => setActiveLead(l)} className="hov" style={{ padding:'9px 12px', borderBottom:`1px solid ${T.border}15`, cursor:'pointer', background:activeLead?.id===l.id?T.accentDim:'transparent', display:'flex', alignItems:'center', gap:7 }}>
                        <Av i={l.avatar} color={(TC as Record<string,string>)[e.derivedTemp]||T.textSoft} size={26}/>
                        <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:9, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.name}</div><div style={{ fontSize:8, color:T.textSoft }}>{l.lastMsg}</div></div>
                        {len>0 && <span style={{ fontSize:7, background:T.accent, color:T.bg, borderRadius:8, padding:'1px 4px', fontWeight:700 }}>{len}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                <div style={{ padding:'10px 14px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                  <Av i={activeLead.avatar} color={(TC as Record<string,string>)[enrichLead(activeLead).derivedTemp]||T.textSoft} size={28}/>
                  <div style={{ flex:1 }}><div style={{ fontSize:11, fontWeight:700 }}>{activeLead.name}</div><div style={{ fontSize:8, color:T.textSoft }}>{activeLead.location} · {activeLead.budget}</div></div>
                  <Pill label={enrichLead(activeLead).derivedTemp==='hot'?'🔥 Hot':'☀️ Warm'} color={(TC as Record<string,string>)[enrichLead(activeLead).derivedTemp]||T.textSoft}/>
                </div>
                <div style={{ flex:1, overflowY:'auto', padding:14, display:'flex', flexDirection:'column', gap:8 }}>
                  {msgs.length===0 ? (
                    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8, color:T.textSoft }}>
                      <div style={{ fontSize:28 }}>💬</div>
                      <button onClick={() => setChatInput(followUpMessage(activeLead))} className="btn" style={{ fontSize:9, padding:'5px 12px', background:T.accentDim, border:`1px solid ${T.accent}30`, borderRadius:6, color:T.accent, cursor:'pointer', fontFamily:'inherit' }}>Usar mensagem IA →</button>
                    </div>
                  ) : msgs.map(m => (
                    <div key={m.id} style={{ display:'flex', justifyContent:m.from==='client'?'flex-start':m.from==='ai'?'flex-start':'flex-end' }}>
                      {m.from==='ai' && <div style={{ width:20, height:20, borderRadius:'50%', background:T.accentDim, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, marginRight:6, flexShrink:0, marginTop:2 }}>⬡</div>}
                      <div style={{ maxWidth:'78%', padding:'8px 12px', borderRadius:m.from==='agent'?'10px 10px 2px 10px':'10px 10px 10px 2px', background:m.from==='agent'?T.accent:m.from==='ai'?`${T.accent}12`:T.card, color:m.from==='agent'?'#fff':T.text, fontSize:10 }}>
                        {m.text.split('\n').map((line,i) => <div key={i}>{line}</div>)}
                        <div style={{ fontSize:7, marginTop:4, opacity:0.6 }}>{m.from==='ai'?'IA ·':m.from==='agent'?'Você ·':'Cliente ·'} {m.time}</div>
                      </div>
                    </div>
                  ))}
                  {typing && <div style={{ display:'flex', alignItems:'center', gap:8 }}><div style={{ width:20, height:20, borderRadius:'50%', background:T.accentDim, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9 }}>⬡</div><div style={{ display:'flex', gap:3, padding:'6px 10px', background:T.card, borderRadius:10 }}>{[0,1,2].map(i => <div key={i} style={{ width:5, height:5, borderRadius:'50%', background:T.accent, animation:`pulse ${1+i*.2}s infinite` }}/>)}</div></div>}
                  {intentAlert && <div style={{ padding:'8px 10px', background:intentAlert.type==='intent'?T.amberDim:T.roseDim, border:`1px solid ${intentAlert.type==='intent'?T.amber:T.rose}25`, borderRadius:7 }}><div style={{ fontSize:9, fontWeight:700, color:intentAlert.type==='intent'?T.amber:T.rose }}>{intentAlert.msg}</div>{intentAlert.script && <div style={{ fontSize:8, color:T.textSoft, marginTop:4 }}>💡 {intentAlert.script.slice(0,120)}...</div>}</div>}
                  <div ref={chatRef}/>
                </div>
                <div style={{ padding:'10px 12px', borderTop:`1px solid ${T.border}`, flexShrink:0, display:'flex', gap:7 }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key==='Enter'&&sendMsg()} placeholder={`Mensagem para ${activeLead?.name?.split(' ')[0]}...`}
                    style={{ flex:1, background:T.bg, border:`1px solid ${T.border}`, borderRadius:7, padding:'7px 10px', color:T.text, fontSize:10, fontFamily:'inherit' }}/>
                  <button onClick={sendMsg} className="btn" style={{ padding:'7px 12px', background:T.accent, border:'none', borderRadius:7, color:'#fff', fontSize:10, fontWeight:700 }}>→</button>
                </div>
              </div>
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:14, overflowY:'auto' }}>
                {(() => { const e=enrichLead(activeLead); const ca=analyzeConversation(msgs); return (<>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:11, marginBottom:12 }}>🧠 Assistente IA</div>
                  <NBAChip nba={e.nba}/>
                  {e.lifeHint && <div style={{ marginTop:8, padding:7, background:T.violetDim, borderRadius:7, fontSize:9, color:T.violet }}>{e.lifeHint}</div>}
                  <div style={{ marginTop:10 }}>
                    <div style={{ fontSize:8, color:T.textSoft, marginBottom:5 }}>CONVERSA</div>
                    <div style={{ background:T.card, borderRadius:7, padding:'8px 10px', fontSize:8, color:T.textSoft, lineHeight:1.8 }}>
                      Sentimento: <span style={{ color:ca.score>70?T.emerald:T.amber, fontWeight:700 }}>{ca.label}</span><br/>
                      Sinais compra: <span style={{ color:T.emerald, fontWeight:700 }}>{ca.buyingSignals}</span><br/>
                      Objeções: <span style={{ color:T.rose, fontWeight:700 }}>{ca.objections}</span>
                    </div>
                  </div>
                  <div style={{ marginTop:10 }}>
                    <div style={{ fontSize:8, color:T.textSoft, marginBottom:6 }}>FOLLOW-UP</div>
                    <div onClick={() => setChatInput(e.followUpMsg)} style={{ fontSize:9, background:T.card, padding:'8px 10px', borderRadius:7, color:T.textSoft, border:`1px solid ${T.border}`, cursor:'pointer', lineHeight:1.4 }}>{e.followUpMsg}</div>
                  </div>
                  {e.recommendations.slice(0,2).map(p => (
                    <div key={p.code} onClick={() => { setPropertyModal({ property:p, tab:'fotos' }); setPropPhotoIdx(0); }} style={{ marginTop:6, padding:'6px 8px', background:T.card, borderRadius:6, fontSize:9, cursor:'pointer' }}>
                      <div style={{ height:40, borderRadius:4, overflow:'hidden', marginBottom:4 }}>
                        <img src={p.photo} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { (e.target as HTMLImageElement).src='https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200'; }}/>
                      </div>
                      <strong>{p.code}</strong> · R$ {(p.price/1000).toFixed(0)}k
                    </div>
                  ))}
                  <div style={{ marginTop:8, display:'flex', gap:5 }}>
                    <button onClick={() => setScriptModal({type:'call',lead:activeLead})} className="btn" style={{ flex:1, padding:5, background:T.roseDim, border:`1px solid ${T.rose}25`, borderRadius:5, color:T.rose, fontSize:8, fontFamily:'inherit', fontWeight:700 }}>📞</button>
                    <button onClick={() => setScriptModal({type:'video',lead:activeLead})} className="btn" style={{ flex:1, padding:5, background:T.violetDim, border:`1px solid ${T.violet}25`, borderRadius:5, color:T.violet, fontSize:8, fontFamily:'inherit', fontWeight:700 }}>🎬</button>
                  </div>
                </>); })()}
              </div>
            </div>
          )}

          {/* ══════════ WHATSAPP ══════════ */}
          {tab === 'whatsapp' && (
            <div className="tab-content">
              <div style={{ marginBottom:16 }}>
                <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22 }}>WhatsApp Business</h1>
                <p style={{ fontSize:10, color:T.textSoft, marginTop:2 }}>Integração via QR Code · Bot autônomo · Omnicanal · +55 47 98916-0113</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {/* QR Code Panel */}
                <div style={{ background:T.surface, border:`1px solid ${whatsappStatus==='connected'?'#25D36640':T.border}`, borderRadius:14, padding:28, display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16, marginBottom:4, color:whatsappStatus==='connected'?'#25D366':T.text }}>
                    {whatsappStatus==='connected'?'✅ WhatsApp Conectado':whatsappStatus==='connecting'?'⏳ Aguardando conexão...':'📱 Conectar WhatsApp'}
                  </div>
                  <div style={{ fontSize:10, color:T.textSoft, marginBottom:24, textAlign:'center' }}>{whatsappStatus==='connected'?`Número: ${WA_NUMBER} · Ativo`:'Escaneie o QR Code com seu WhatsApp'}</div>

                  {whatsappStatus !== 'connected' ? (
                    <>
                      <div style={{ background:'white', padding:14, borderRadius:12, marginBottom:20, boxShadow:`0 0 40px ${whatsappStatus==='connecting'?'#25D36640':'transparent'}`, transition:'box-shadow .5s' }}>
                        <QRCodeDisplay url={QR_LINK} size={200}/>
                      </div>
                      {whatsappStatus === 'connecting' ? (
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                          <div style={{ display:'flex', gap:6 }}>{[0,1,2].map(i => <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'#25D366', animation:`pulse ${1+i*.3}s infinite` }}/>)}</div>
                          <div style={{ fontSize:9, color:'#25D366' }}>Aguardando escaneamento... {Math.round(Math.random()*9+1)}s</div>
                          <button onClick={() => { setWAStatus('disconnected'); }} style={{ fontSize:8, color:T.textSoft, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>Cancelar</button>
                        </div>
                      ) : (
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, width:'100%' }}>
                          <button onClick={() => { setWAStatus('connecting'); setQRRefresh(n=>n+1); }} className="btn"
                            style={{ width:'100%', padding:'12px 0', background:'#25D366', border:'none', borderRadius:10, color:'#fff', fontSize:12, fontWeight:800, fontFamily:'inherit', cursor:'pointer' }}>
                            📱 Conectar Agora
                          </button>
                          <div style={{ fontSize:8, color:T.textSoft, textAlign:'center', lineHeight:1.6 }}>
                            1. Abra o WhatsApp no celular<br/>
                            2. Toque em Mais opções → Aparelhos conectados<br/>
                            3. Toque em Conectar um aparelho<br/>
                            4. Escaneie o QR Code acima
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ width:'100%' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                        {[{l:'Msgs Hoje',v:'47',c:'#25D366'},{l:'Leads Captados',v:'8',c:T.accent},{l:'Bot Ativo',v:'24/7',c:T.emerald},{l:'Tempo Resp.',v:'< 30s',c:T.cyan}].map(d => (
                          <div key={d.l} style={{ background:T.card, borderRadius:8, padding:'12px', textAlign:'center' }}>
                            <div style={{ fontSize:20, fontWeight:800, color:d.c }}>{d.v}</div>
                            <div style={{ fontSize:8, color:T.textSoft, marginTop:3 }}>{d.l}</div>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setWAStatus('disconnected')} style={{ width:'100%', padding:'8px 0', background:T.roseDim, border:`1px solid ${T.rose}25`, borderRadius:8, color:T.rose, fontSize:9, cursor:'pointer', fontFamily:'inherit' }}>Desconectar</button>
                    </div>
                  )}
                </div>

                {/* Bot Config */}
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div style={{ background:T.surface, border:`1px solid ${'#25D36630'}`, borderRadius:14, padding:20 }}>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:'#25D366', marginBottom:14 }}>🤖 Bot Autônomo IMOVAI</div>
                    {([
                      { flow:'Qualificação Inicial', desc:'Renda · Entrada · Localização → Score automático', status:'ativo', color:'#25D366' },
                      { flow:'Apresentação Imóveis', desc:'Envia PDF + fotos para leads qualificados', status:'ativo', color:T.accent },
                      { flow:'Agendamento Visitas', desc:'Oferece horários · Confirma · Lembra -24h', status:'ativo', color:T.violet },
                      { flow:'Drip 3-7-30 dias', desc:'Nutrição automatizada para leads frios', status:'ativo', color:T.amber },
                      { flow:'Objeção Handler', desc:'Detecta e responde objeções com IA', status:'configurando', color:T.cyan },
                    ] as const).map(f => (
                      <div key={f.flow} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:T.card, borderRadius:7, marginBottom:6 }}>
                        <div style={{ width:6, height:6, borderRadius:'50%', background:f.status==='ativo'?'#25D366':T.amber, animation:'pulse 2s infinite', flexShrink:0 }}/>
                        <div style={{ flex:1 }}><div style={{ fontSize:10, fontWeight:600 }}>{f.flow}</div><div style={{ fontSize:8, color:T.textSoft }}>{f.desc}</div></div>
                        <span style={{ fontSize:7, padding:'2px 6px', borderRadius:3, background:f.status==='ativo'?'#25D36620':T.amberDim, color:f.status==='ativo'?'#25D366':T.amber, fontWeight:700 }}>{f.status.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:20 }}>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, marginBottom:12 }}>📲 Link Direto WhatsApp</div>
                    <div style={{ background:T.card, borderRadius:8, padding:'10px 12px', fontSize:9, color:T.textSoft, fontFamily:'monospace', marginBottom:10, wordBreak:'break-all' }}>{QR_LINK}</div>
                    <div style={{ background:'white', display:'inline-block', padding:8, borderRadius:8, marginBottom:10 }}>
                      <QRCodeDisplay url={QR_LINK} size={100}/>
                    </div>
                    <div style={{ fontSize:8, color:T.textSoft }}>QR Code para clientes escanearem e iniciarem conversa diretamente</div>
                    <button onClick={() => { addToast('Link copiado', QR_LINK.slice(0,40)+'...', '#25D366' as string); }} className="btn"
                      style={{ marginTop:10, width:'100%', padding:'7px 0', background:'#25D36620', border:`1px solid #25D36630`, borderRadius:7, color:'#25D366', fontSize:9, fontFamily:'inherit', fontWeight:700 }}>
                      📋 Copiar Link de Atendimento
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ INSIGHTS ══════════ */}
          {tab === 'insights' && (
            <div className="tab-content">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div><h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22 }}>Insights IA</h1><p style={{ fontSize:10, color:T.textSoft, marginTop:2 }}>NBA Engine · Risk Analyzer · Life Events · Velocity · ICP Match</p></div>
                <div style={{ display:'flex', gap:5 }}>
                  {['all','imminent','risk','life'].map(s => (
                    <button key={s} onClick={() => setInsightMode(s)} className="btn"
                      style={{ padding:'4px 10px', borderRadius:16, border:`1px solid ${insightMode===s?T.accent:T.border}`, background:insightMode===s?T.accentDim:'transparent', color:insightMode===s?T.accent:T.textSoft, fontSize:8, fontFamily:'inherit', fontWeight:700 }}>
                      {s==='all'?'Todos':s==='imminent'?'🚨 Imin.':s==='risk'?'⚠️ Risco':'🔔 Life'}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background:T.roseDim, border:`1px solid ${T.rose}25`, borderRadius:10, padding:16, marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}><span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:T.rose }}>🚨 NBA Engine</span><span style={{ fontSize:9, background:T.roseDim, color:T.rose, padding:'2px 6px', borderRadius:4 }}>{imminentLeads.length} críticos</span></div>
                {imminentLeads.length > 0 ? (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:10 }}>
                    {imminentLeads.map(l => {
                      const e = enrichLead(l);
                      return (
                        <div key={l.id} style={{ background:T.card, border:`1px solid ${T.rose}25`, borderRadius:8, padding:12 }}>
                          <div style={{ display:'flex', gap:8, marginBottom:8 }}><Av i={l.avatar} color={T.rose} size={30}/><div><div style={{ fontSize:12, fontWeight:700 }}>{l.name}</div><div style={{ fontSize:9, color:T.rose }}>{Math.round(l.closingProbability*100)}% · {e.closeDate}</div></div></div>
                          <ProbBar v={l.closingProbability}/>
                          <div style={{ marginTop:8 }}><NBAChip nba={e.nba}/></div>
                          <div style={{ display:'flex', gap:5, marginTop:8 }}>
                            <button onClick={() => doAction('call', l)} className="btn" style={{ flex:1, padding:5, background:T.rose, border:'none', borderRadius:6, color:'#fff', fontSize:9, fontWeight:700, fontFamily:'inherit' }}>🚨 Executar NBA</button>
                            <button onClick={() => setScriptModal({type:'call',lead:l})} className="btn" style={{ padding:'5px 8px', background:T.roseDim, border:`1px solid ${T.rose}25`, borderRadius:6, color:T.rose, fontSize:9, fontFamily:'inherit' }}>📞</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : <div style={{ fontSize:10, color:T.textSoft }}>Nenhuma ação crítica. 🎉</div>}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, marginBottom:12 }}>⚡ Deal Velocity</div>
                  {[...leads].sort((a,b)=>(b.dealVelocity||0)-(a.dealVelocity||0)).map(l => {
                    const temp=leadTemperature(computeEinsteinScore(l));
                    return (<div key={l.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, padding:'6px 8px', background:T.card, borderRadius:7 }}>
                      <Av i={l.avatar} color={(TC as Record<string,string>)[temp]||T.textSoft} size={24}/>
                      <div style={{ flex:1 }}><div style={{ fontSize:10, fontWeight:700 }}>{l.name}</div><VelocityChip v={l.dealVelocity||0}/></div>
                      <div style={{ fontSize:9, color:T.emerald, fontWeight:700 }}>R$ {(l.revenueExpected/1000).toFixed(0)}k</div>
                    </div>);
                  })}
                </div>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, marginBottom:12 }}>🎯 ICP Match</div>
                  {leads.map(l => { const icp=icpMatch(l); const color=icp>=80?T.emerald:icp>=50?T.amber:T.rose; return (
                    <div key={l.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                      <Av i={l.avatar} color={color} size={24}/>
                      <div style={{ flex:1 }}><div style={{ fontSize:9, fontWeight:700 }}>{l.name}</div><div style={{ height:4, background:T.border, borderRadius:2, marginTop:3 }}><div style={{ width:`${icp}%`, height:'100%', background:color, borderRadius:2 }}/></div></div>
                      <span style={{ fontSize:9, fontWeight:800, color, minWidth:30 }}>{icp}%</span>
                    </div>
                  ); })}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ AUTOMAÇÕES ══════════ */}
          {tab === 'automations' && (
            <div className="tab-content">
              <div style={{ marginBottom:16 }}><h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22 }}>Automações</h1><p style={{ fontSize:10, color:T.textSoft, marginTop:2 }}>Sequências · Drip · Webhooks · WhatsApp Bot</p></div>
              <div style={{ display:'flex', gap:6, marginBottom:14 }}>
                {['sequences','cadencias','webhooks','whatsapp'].map(s => (
                  <button key={s} onClick={() => setActiveAutoTab(s)} className="btn"
                    style={{ padding:'5px 12px', borderRadius:16, border:`1px solid ${activeAutoTab===s?T.accent:T.border}`, background:activeAutoTab===s?T.accentDim:'transparent', color:activeAutoTab===s?T.accent:T.textSoft, fontSize:9, fontFamily:'inherit', fontWeight:700 }}>
                    {s==='sequences'?'Sequências':s==='cadencias'?'Cadências':s==='webhooks'?'Webhooks':'WhatsApp Bot'}
                  </button>
                ))}
              </div>
              {activeAutoTab === 'sequences' && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
                  {([
                    { name:'🔥 NBA Critical Flow', trigger:'Prob >85% + Hot', steps:['closingAlert() detectado','nextBestAction() → Ligar AGORA','Script IA disparado'], color:T.rose, active:true, runs:12 },
                    { name:'⚠️ Risk Intervention', trigger:'riskOfLoss() = alto', steps:['Hot sem resposta +24h','followupScheduler() urgente','WhatsApp automático'], color:T.amber, active:true, runs:8 },
                    { name:'🌱 Drip 3–7–30 dias', trigger:'Lead cold s/ resposta', steps:['Dia 3: PDF imóvel ideal','Dia 7: Case de sucesso','Dia 30: Proposta especial'], color:T.accent, active:true, runs:23 },
                    { name:'🔔 Life Event Protocol', trigger:'lifeEvent detectado', steps:['followUpMessage() empático','Imóveis re-ranqueados','Follow-up 48h'], color:T.violet, active:true, runs:5 },
                    { name:'📄 PDF Automation', trigger:'Lead visitou imóvel', steps:['generatePDF() automático','Envio WhatsApp/Email','Follow-up 24h'], color:T.emerald, active:true, runs:31 },
                    { name:'📊 ROI Report', trigger:'Todo dia 1 do mês', steps:['analyticsEngine() full','CAC + ROI por canal','Relatório enviado'], color:T.gold, active:false, runs:0 },
                  ] as const).map(seq => (
                    <div key={seq.name} style={{ background:T.surface, border:`1px solid ${seq.color}20`, borderRadius:10, padding:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                        <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:11, color:seq.color }}>{seq.name}</span>
                        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                          <span style={{ fontSize:8, color:T.textSoft }}>{seq.runs}x</span>
                          <div style={{ width:5, height:5, borderRadius:'50%', background:seq.active?seq.color:T.textSoft, animation:seq.active?'pulse 2s infinite':'none' }}/>
                        </div>
                      </div>
                      <div style={{ fontSize:8, color:T.textSoft, background:`${seq.color}08`, padding:'4px 8px', borderRadius:5, marginBottom:10 }}>Trigger: {seq.trigger}</div>
                      {seq.steps.map((step,i) => <div key={i} style={{ display:'flex', gap:6, marginBottom:3, fontSize:9, color:T.textSoft }}><span style={{ color:seq.color }}>{i+1}.</span><span>{step}</span></div>)}
                      <button style={{ marginTop:10, width:'100%', padding:4, background:seq.active?`${seq.color}10`:`${T.emerald}10`, border:`1px solid ${seq.active?seq.color:T.emerald}25`, borderRadius:5, color:seq.active?seq.color:T.emerald, fontSize:8, cursor:'pointer', fontFamily:'inherit', fontWeight:700 }}>
                        {seq.active?'✓ Ativo — Pausar':'▶ Ativar'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {activeAutoTab === 'cadencias' && (
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                  {leads.map(l => { const e=enrichLead(l); const fs=followupScheduler(l); return (
                    <div key={l.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:T.card, borderRadius:8, marginBottom:7 }}>
                      <Av i={l.avatar} color={(TC as Record<string,string>)[e.derivedTemp]||T.textSoft} size={28}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11, fontWeight:700 }}>{l.name}</div>
                        <div style={{ fontSize:9, color:T.textSoft }}>{l.lastMsg}</div>
                        {fs && <div style={{ fontSize:9, color:fs.urgency==='critical'?T.rose:T.amber, marginTop:3 }}>⚡ {fs.msg}</div>}
                      </div>
                      <span style={{ fontSize:8, padding:'2px 7px', background:T.goldDim, border:`1px solid ${T.gold}25`, borderRadius:4, color:T.gold }}>{e.bestTime}</span>
                      <button onClick={() => doAction('call', l)} className="btn" style={{ fontSize:8, padding:'3px 8px', background:T.accent, border:'none', borderRadius:5, color:'#fff', fontFamily:'inherit', fontWeight:700 }}>Contatar</button>
                    </div>
                  ); })}
                </div>
              )}
              {activeAutoTab === 'webhooks' && (
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                  {([
                    { name:'Meta WhatsApp Business', desc:'Leads de formulários Meta Ads', status:'conectado', color:T.emerald },
                    { name:'Instagram DM', desc:'Captura leads via Direct', status:'conectado', color:T.emerald },
                    { name:'Google Ads', desc:'Leads de campanhas Google', status:'conectado', color:T.accent },
                    { name:'ZAP / VivaReal', desc:'Portais imobiliários', status:'pendente', color:T.amber },
                    { name:'N8N / Make', desc:'Orquestrador no-code', status:'configurando', color:T.cyan },
                    { name:'PDF Generator API', desc:'Gera apresentações automaticamente', status:'conectado', color:T.violet },
                  ] as const).map(w => (
                    <div key={w.name} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:T.card, borderRadius:7, marginBottom:6 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:w.status==='conectado'?T.emerald:w.status==='pendente'?T.amber:T.accent, animation:'pulse 2s infinite', flexShrink:0 }}/>
                      <div style={{ flex:1 }}><div style={{ fontSize:10, fontWeight:700 }}>{w.name}</div><div style={{ fontSize:8, color:T.textSoft }}>{w.desc}</div></div>
                      <span style={{ fontSize:8, padding:'2px 7px', borderRadius:10, background:`${w.color}15`, color:w.color, fontWeight:700 }}>{w.status.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeAutoTab === 'whatsapp' && (
                <div style={{ background:T.surface, border:`1px solid ${'#25D36630'}`, borderRadius:10, padding:16 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, marginBottom:14, color:'#25D366' }}>📱 WhatsApp Bot</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {([{flow:'Qualificação',steps:['Renda + entrada','Localização','Score automático','Briefing ao corretor'],c:T.accent},{flow:'Agendamento',steps:['3 horários disponíveis','Confirmação auto','Lembrete -24h','Registro CRM'],c:T.emerald},{flow:'Drip 3-7-30',steps:['Dia 3: imóvel','Dia 7: case','Dia 14: oferta','Dia 30: feedback'],c:T.amber},{flow:'Objeção Handler',steps:['detectObjection()','Script IA','Resposta personalizada','Registra histórico'],c:T.violet}] as const).map(f => (
                      <div key={f.flow} style={{ background:T.card, borderRadius:8, padding:12, border:`1px solid ${f.c}15` }}>
                        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:11, color:f.c, marginBottom:8 }}>{f.flow}</div>
                        {f.steps.map((s,i) => <div key={i} style={{ display:'flex', gap:6, fontSize:9, color:T.textSoft, marginBottom:3 }}><span style={{ color:f.c, fontWeight:700, flexShrink:0 }}>{i+1}.</span><span>{s}</span></div>)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════ ANALYTICS ══════════ */}
          {tab === 'analytics' && (
            <div className="tab-content">
              <div style={{ marginBottom:16 }}><h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22 }}>Analytics</h1></div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))', gap:10, marginBottom:14 }}>
                <StatCard label="Pipeline Ponderado" value={`R$ ${Math.round(analytics.weightedPipeline/1000)}k`} sub="receita × prob × temp" icon="💰" color={T.gold as string} trend={18}/>
                <StatCard label="Forecast Mensal" value={`R$ ${Math.round(analytics.forecastThisMonth/1000)}k`} sub="previsão deste mês" icon="🔮" color={T.emerald as string}/>
                <StatCard label="Deal Médio" value={`R$ ${(analytics.avgDealSize/1000).toFixed(0)}k`} sub="comissão/fechamento" icon="📊" color={T.cyan as string}/>
                <StatCard label="Conversão" value={`${analytics.conversionRate}%`} sub="lead → proposta" icon="📈" color={T.accent as string}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, marginBottom:14 }}>💡 CAC + ROI por Canal</div>
                  {analytics.cacBySource.map(({ src, cnt, roi }) => (
                    <div key={src} style={{ marginBottom:10, padding:'8px 10px', background:T.card, borderRadius:7 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                        <div style={{ fontSize:10, fontWeight:700 }}>{(SRC_IC as Record<string,string>)[src]} {(SRC_LB as Record<string,string>)[src]}</div>
                        <div style={{ display:'flex', gap:8 }}><span style={{ fontSize:9, color:T.textSoft }}>{cnt} leads</span><span style={{ fontSize:9, fontWeight:700, color:roi>5?T.emerald:roi>0?T.amber:T.rose }}>ROI {roi}x</span></div>
                      </div>
                      <div style={{ height:3, background:T.border, borderRadius:2 }}><div style={{ width:`${Math.min((roi/15)*100,100)}%`, height:'100%', background:roi>5?T.emerald:roi>0?T.amber:T.rose, borderRadius:2 }}/></div>
                    </div>
                  ))}
                </div>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, marginBottom:14 }}>🌡 Temperatura</div>
                  {([{label:'Hot 🔥',val:analytics.hotLeads,color:T.rose},{label:'Warm ☀️',val:analytics.warmLeads,color:T.amber},{label:'Cold ❄️',val:analytics.coldLeads,color:T.accent}] as const).map(d => (
                    <div key={d.label} style={{ marginBottom:10 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}><span style={{ fontSize:10, fontWeight:700, color:d.color }}>{d.label}</span><span style={{ fontSize:10, color:T.textSoft }}>{d.val}</span></div>
                      <div style={{ height:6, background:T.border, borderRadius:3 }}><div style={{ width:`${(d.val/analytics.totalLeads)*100}%`, height:'100%', background:d.color, borderRadius:3 }}/></div>
                    </div>
                  ))}
                  <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${T.border}` }}>
                    <Sparkline data={sparkData} color={T.gold as string} width={220} height={36}/>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ FORECAST ══════════ */}
          {tab === 'forecast' && (
            <div className="tab-content">
              <div style={{ marginBottom:16 }}><h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22 }}>Forecast IA</h1></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:14 }}>
                {([
                  { label:'🐻 Conservador', val:Math.round(analytics.weightedPipeline*.25/1000), color:T.rose, pct:'25%' },
                  { label:'🎯 Realista', val:Math.round(analytics.forecastThisMonth/1000), color:T.amber, pct:'40%' },
                  { label:'🚀 Otimista', val:Math.round(analytics.weightedPipeline*.7/1000), color:T.emerald, pct:'70%' },
                ] as const).map(s => (
                  <div key={s.label} style={{ background:T.surface, border:`1px solid ${s.color}25`, borderRadius:10, padding:16, textAlign:'center' }}>
                    <div style={{ fontSize:11, fontWeight:700, color:s.color, marginBottom:8 }}>{s.label}</div>
                    <div style={{ fontSize:28, fontWeight:900, color:s.color }}>R$ {s.val}k</div>
                    <div style={{ fontSize:9, color:T.textSoft, marginTop:6 }}>Confiança: {s.pct}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                {[...leads].filter(l=>l.closingProbability>0.3).sort((a,b)=>b.closingProbability-a.closingProbability).map(l => {
                  const e=enrichLead(l); return (
                    <div key={l.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:T.card, borderRadius:8, marginBottom:7 }}>
                      <Av i={l.avatar} color={(TC as Record<string,string>)[e.derivedTemp]||T.textSoft} size={30}/>
                      <div style={{ flex:1 }}><div style={{ fontSize:11, fontWeight:700 }}>{l.name}</div><ProbBar v={l.closingProbability}/></div>
                      <div style={{ textAlign:'right' }}><div style={{ fontSize:12, fontWeight:800, color:T.emerald }}>R$ {(l.revenueExpected/1000).toFixed(0)}k</div><div style={{ fontSize:9, color:T.cyan }}>{e.closeDate}</div></div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════════ ENGINE ══════════ */}
          {tab === 'engine' && (
            <div className="tab-content">
              <div style={{ marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22 }}>IMOVAI Engine v13</h1>
                  <p style={{ fontSize:10, color:T.textSoft, marginTop:2 }}>70+ funções IA · 10 Módulos · TypeScript Puro · Claude Sonnet integrado</p>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <span style={{ fontSize:9, padding:'3px 10px', background:`${T.emerald}15`, border:`1px solid ${T.emerald}30`, borderRadius:5, color:T.emerald }}>✓ Build Passing</span>
                  <span style={{ fontSize:9, padding:'3px 10px', background:`${T.accent}15`, border:`1px solid ${T.accent}30`, borderRadius:5, color:T.accent }}>0 TypeScript Errors</span>
                </div>
              </div>

              {/* Stack técnico */}
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:14, marginBottom:14 }}>
                <div style={{ fontSize:10, fontWeight:700, color:T.textSoft, textTransform:'uppercase', letterSpacing:2, marginBottom:10 }}>Stack & Infraestrutura</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:8 }}>
                  {([
                    { label:'Framework', val:'Next.js 14', color:T.accent },
                    { label:'Linguagem', val:'TypeScript 5.6', color:T.cyan },
                    { label:'IA Backend', val:'Claude Sonnet', color:T.violet },
                    { label:'Deploy', val:'Vercel GRU1', color:T.emerald },
                    { label:'Design', val:'Obsidian Luxury', color:T.gold },
                    { label:'Fonts', val:'IBM Plex + Syne', color:T.amber },
                    { label:'API Routes', val:'5 endpoints', color:T.rose },
                    { label:'Engine', val:'70+ funções', color:T.textSoft },
                  ] as const).map(s => (
                    <div key={s.label} style={{ background:T.card, borderRadius:7, padding:'8px 10px' }}>
                      <div style={{ fontSize:8, color:T.textSoft, marginBottom:2 }}>{s.label}</div>
                      <div style={{ fontSize:10, fontWeight:700, color:s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Módulos */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:10 }}>
                {([
                  { mod:'2.1', title:'Inteligência Preditiva', ref:'Salesforce Einstein + HubSpot Breeze', color:T.accent, badge:'', fns:['computeEinsteinScore()','computeBreezeScore()','leadTemperature()','behavioralScore()','sentimentScore()'] },
                  { mod:'2.2', title:'Inteligência Conversacional', ref:'Gong.io', color:T.rose, badge:'', fns:['detectBuyingIntent()','detectObjection()','objectionCounterscript()','analyzeConversation()'] },
                  { mod:'2.3', title:'Inteligência Comportamental', ref:'kvCORE + LionDesk', color:T.cyan, badge:'', fns:['leadReputation()','icpMatch()','documentStatus()','dealVelocityScore()'] },
                  { mod:'2.4', title:'Inteligência Imobiliária', ref:'Reapit + Propertybase', color:T.emerald, badge:'', fns:['recommendProperties()','calculateInvestmentROI()','getNeighborhoodInsights()','generatePDFPresentation()'] },
                  { mod:'2.5', title:'Next Best Action', ref:'Salesforce Einstein NBA', color:T.amber, badge:'', fns:['nextBestAction()','alertSystem()','closingAlert()','riskOfLoss()','followupScheduler()'] },
                  { mod:'2.6', title:'Motor de Persuasão', ref:'SPIN + Challenger + NSTD', color:T.violet, badge:'', fns:['persuasionStyle()','followUpMessage()','generateCallScript()','generateVideoScript()'] },
                  { mod:'2.7', title:'Life Event Engine', ref:'Exclusivo IMOVAI OS', color:T.gold, badge:'', fns:['lifeEventHint()','lifeEventApproach()','detectLifeEvent()'] },
                  { mod:'2.8', title:'Radar de Investidores', ref:'Exclusivo IMOVAI v13 ★', color:T.gold, badge:'NOVO v13', fns:['investorRadar()','investorScore()','investorSignals()','investorRecommendation()'] },
                  { mod:'2.9', title:'Previsão de Valorização', ref:'Exclusivo IMOVAI v13 ★', color:T.emerald, badge:'NOVO v13', fns:['valuationForecast()','projectedPatrimony()','scenarioAnalysis()'] },
                  { mod:'2.10', title:'Analytics Engine', ref:'Exclusivo IMOVAI OS', color:T.cyan, badge:'', fns:['analyticsEngine()','enrichLead()','rankLeads()','computeAnalytics()'] },
                ] as const).map(m => (
                  <div key={m.mod} style={{ background:T.surface, border:`1px solid ${m.badge ? m.color+'40' : m.color+'20'}`, borderRadius:10, padding:14, position:'relative' }}>
                    {m.badge && (
                      <div style={{ position:'absolute', top:10, right:10, fontSize:7, padding:'2px 6px', background:`${T.gold}20`, border:`1px solid ${T.gold}40`, borderRadius:3, color:T.gold, fontWeight:700, letterSpacing:1 }}>{m.badge}</div>
                    )}
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                      <div style={{ width:22, height:22, borderRadius:6, background:`${m.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:m.color }}>{m.mod}</div>
                      <div>
                        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:10, color:m.color }}>{m.title}</div>
                        <div style={{ fontSize:7, color:T.textSoft }}>Ref: {m.ref}</div>
                      </div>
                    </div>
                    {m.fns.map(fn => (
                      <div key={fn} style={{ fontSize:9, fontFamily:'monospace', color:T.textSoft, padding:'2px 0', borderBottom:`1px solid ${T.border}10` }}>
                        <span style={{ color:m.color }}>›</span> {fn}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* API Routes v13 */}
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:14, marginTop:14 }}>
                <div style={{ fontSize:10, fontWeight:700, color:T.textSoft, textTransform:'uppercase', letterSpacing:2, marginBottom:10 }}>API Routes — v13 (Backend Real)</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:8 }}>
                  {([
                    { method:'POST', path:'/api/ai/chat', desc:'Chat com Beatriz (Claude Sonnet)', color:T.violet },
                    { method:'POST', path:'/api/ai/analyze', desc:'Análise de lead + JSON estruturado', color:T.violet },
                    { method:'GET|POST', path:'/api/leads', desc:'CRUD completo de leads', color:T.accent },
                    { method:'PATCH|DEL', path:'/api/leads/[id]', desc:'Atualizar/remover lead', color:T.accent },
                    { method:'GET', path:'/api/analytics', desc:'KPIs + forecast em tempo real', color:T.emerald },
                    { method:'POST', path:'/api/properties/pdf', desc:'Gerar PDF de apresentação', color:T.gold },
                    { method:'GET|POST', path:'/api/whatsapp', desc:'Webhook Evolution API', color:'#25D366' },
                  ] as const).map(r => (
                    <div key={r.path} style={{ background:T.card, borderRadius:7, padding:'8px 10px', display:'flex', alignItems:'flex-start', gap:8 }}>
                      <span style={{ fontSize:7, padding:'2px 5px', background:`${r.color}20`, color:r.color, borderRadius:3, fontWeight:700, fontFamily:'monospace', flexShrink:0, marginTop:1 }}>{r.method}</span>
                      <div>
                        <div style={{ fontSize:9, fontFamily:'monospace', color:r.color, fontWeight:700 }}>{r.path}</div>
                        <div style={{ fontSize:8, color:T.textSoft, marginTop:2 }}>{r.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ INTEGRAÇÕES ══════════ */}
          {tab === 'integracoes' && (
            <div className="tab-content">
              <div style={{ marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22 }}>Integrações</h1>
                  <p style={{ fontSize:10, color:T.textSoft, marginTop:2 }}>Conecte suas ferramentas · Automação total · API-first</p>
                </div>
              </div>

              {/* Status geral */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:10, marginBottom:14 }}>
                {([
                  { label:'Conectadas', val:'4', color:T.emerald },
                  { label:'Pendentes', val:'3', color:T.amber },
                  { label:'API Calls/dia', val:'247', color:T.accent },
                  { label:'Uptime', val:'99.8%', color:T.cyan },
                ] as const).map(s => (
                  <div key={s.label} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}>
                    <div style={{ fontSize:9, color:T.textSoft, textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>{s.label}</div>
                    <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Integrações */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:12 }}>
                {([
                  {
                    cat:'IA & Chat',
                    items:[
                      { name:'Claude Sonnet 4', desc:'Chat IA real · Análise de leads · Scripts personalizados', status:'conectado', color:T.violet, icon:'🤖', detail:'claude-sonnet-4-20250514 · /api/ai/chat' },
                      { name:'Telegram Alertas', desc:'Bot @jmimoveis_alertas_bot · Hot leads em tempo real', status:'conectado', color:T.cyan, icon:'✈️', detail:'@jmimoveis_alertas_bot' },
                    ]
                  },
                  {
                    cat:'WhatsApp & Comunicação',
                    items:[
                      { name:'Evolution API', desc:'WhatsApp Business · Bot 5 fluxos · QR Code', status:'pendente', color:'#25D366', icon:'📱', detail:'POST /api/whatsapp/webhook' },
                      { name:'SendGrid', desc:'Email marketing · Drip automático · PDFs', status:'pendente', color:T.accent, icon:'📧', detail:'contato@jorgemiguelimoveis.com.br' },
                    ]
                  },
                  {
                    cat:'Mídia Social & Tráfego',
                    items:[
                      { name:'Meta Ads', desc:'Graph API v25 · Captura leads Facebook/Instagram', status:'conectado', color:'#1877F2', icon:'📘', detail:'App ID: 935227965690936' },
                      { name:'Google Analytics', desc:'Origem dos leads · CAC por canal', status:'configurando', color:'#EA4335', icon:'📊', detail:'UA-XXXXXXXX' },
                    ]
                  },
                  {
                    cat:'Dados & Storage',
                    items:[
                      { name:'Google Sheets', desc:'Backup de leads · Relatórios automáticos', status:'conectado', color:T.emerald, icon:'📋', detail:'Sheet: 1c7r6psaoaj...' },
                      { name:'Supabase', desc:'PostgreSQL · Auth · Row Level Security', status:'pendente', color:T.emerald, icon:'🗄️', detail:'Próximo: v14' },
                    ]
                  },
                  {
                    cat:'Pagamentos',
                    items:[
                      { name:'Asaas', desc:'PIX · Boleto · Assinatura SaaS mensal', status:'pendente', color:T.gold, icon:'💳', detail:'PIX + Boleto + Recorrência' },
                    ]
                  },
                  {
                    cat:'Portais Imobiliários',
                    items:[
                      { name:'ZAP Imóveis', desc:'Importação automática de leads', status:'pendente', color:T.amber, icon:'🏠', detail:'API ZAP · Em desenvolvimento' },
                      { name:'VivaReal', desc:'Leads qualificados do portal', status:'pendente', color:T.accent, icon:'🏡', detail:'API VivaReal · Em desenvolvimento' },
                    ]
                  },
                ] as const).map(cat => (
                  <div key={cat.cat} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:14 }}>
                    <div style={{ fontSize:9, color:T.textSoft, textTransform:'uppercase', letterSpacing:2, marginBottom:10 }}>{cat.cat}</div>
                    {cat.items.map(it => (
                      <div key={it.name} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'8px 0', borderBottom:`1px solid ${T.border}20` }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:`${it.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{it.icon}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                            <span style={{ fontSize:11, fontWeight:700 }}>{it.name}</span>
                            <span style={{ fontSize:7, padding:'1px 5px', borderRadius:3, fontWeight:700,
                              background: it.status==='conectado' ? `${T.emerald}15` : it.status==='configurando' ? `${T.cyan}15` : `${T.amber}15`,
                              color: it.status==='conectado' ? T.emerald : it.status==='configurando' ? T.cyan : T.amber,
                            }}>{it.status.toUpperCase()}</span>
                          </div>
                          <div style={{ fontSize:9, color:T.textSoft }}>{it.desc}</div>
                          <div style={{ fontSize:8, color:T.textSoft, marginTop:3, fontFamily:'monospace' }}>{it.detail}</div>
                        </div>
                        <button
                          className="btn"
                          style={{ fontSize:8, padding:'3px 8px', flexShrink:0,
                            background: it.status==='conectado' ? `${T.emerald}10` : `${it.color}10`,
                            border: `1px solid ${it.status==='conectado' ? T.emerald : it.color}25`,
                            color: it.status==='conectado' ? T.emerald : it.color,
                          }}
                          onClick={() => addToast(it.name, it.status==='conectado' ? 'Integração ativa ✓' : 'Configure em .env.local', it.status==='conectado' ? T.emerald as string : it.color as string)}
                        >
                          {it.status==='conectado' ? '✓ Ativo' : 'Configurar'}
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Docs */}
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16, marginTop:12 }}>
                <div style={{ fontSize:10, fontWeight:700, color:T.textSoft, textTransform:'uppercase', letterSpacing:2, marginBottom:10 }}>Configuração Rápida</div>
                <div style={{ fontFamily:'monospace', fontSize:10, color:T.emerald, background:T.card, padding:12, borderRadius:7, lineHeight:2 }}>
                  <div><span style={{ color:T.textSoft }}># Copie .env.example para .env.local:</span></div>
                  <div>cp .env.example .env.local</div>
                  <div>&nbsp;</div>
                  <div><span style={{ color:T.textSoft }}># Variáveis obrigatórias para IA real:</span></div>
                  <div>ANTHROPIC_API_KEY=sk-ant-<span style={{ color:T.amber }}>sua-chave-aqui</span></div>
                  <div>&nbsp;</div>
                  <div><span style={{ color:T.textSoft }}># WhatsApp (Evolution API):</span></div>
                  <div>EVOLUTION_API_URL=https://api.evolutionapi.com</div>
                  <div>EVOLUTION_API_KEY=<span style={{ color:T.amber }}>sua-chave-aqui</span></div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
