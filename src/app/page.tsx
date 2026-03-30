'use client';
// ═══════════════════════════════════════════════════════════════════════
//  IMOVAI OS v10.0 — page.tsx
//  Sistema Operacional do Corretor Imobiliário
//  Next.js 14 · TypeScript · 5 Camadas · 50+ Funções IA
// ═══════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
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

// ── Tipos locais ───────────────────────────────────────────────────────
type TabKey = 'dashboard' | 'leads' | 'pipeline' | 'imoveis' | 'chat' | 'insights' | 'automations' | 'analytics' | 'forecast' | 'engine';
type ScriptModalState = { type: 'call' | 'video'; lead: Lead } | null;

const TABS: { k: TabKey; icon: string; label: string }[] = [
  { k:'dashboard',   icon:'◈',  label:'Dashboard'  },
  { k:'leads',       icon:'◉',  label:'Leads'       },
  { k:'pipeline',    icon:'⊞',  label:'Pipeline'    },
  { k:'imoveis',     icon:'⊟',  label:'Imóveis'     },
  { k:'chat',        icon:'◎',  label:'Chat IA'     },
  { k:'insights',    icon:'🔍', label:'Insights'    },
  { k:'automations', icon:'⚡', label:'Automações'  },
  { k:'analytics',   icon:'📈', label:'Analytics'   },
  { k:'forecast',    icon:'🔮', label:'Forecast'    },
  { k:'engine',      icon:'⬡',  label:'Engine'      },
];

// ══════════════════════════════════════════════════════════════════════
export default function IMAOVAIApp() {
  // ── Estado ────────────────────────────────────────────────────────
  const [tab,           setTab]          = useState<TabKey>('dashboard');
  const [leads,         setLeads]        = useState<Lead[]>(LEADS_INIT);
  const [lead,          setLead]         = useState<Lead | null>(null);
  const [propFilter,    setPropFilter]   = useState('all');
  const [tempFilter,    setTempFilter]   = useState('all');
  const [searchQuery,   setSearchQuery]  = useState('');
  const [chatInput,     setChatInput]    = useState('');
  const [chatHistories, setChatHistories] = useState<Record<number, Message[]>>({ 1: MSGS_INIT });
  const [typing,        setTyping]       = useState(false);
  const [activeLead,    setActiveLead]   = useState<Lead>(LEADS_INIT[0]);
  const [hotAlert,      setHotAlert]     = useState(true);
  const [insightMode,   setInsightMode]  = useState('all');
  const [autoMode,      setAutoMode]     = useState(true);
  const [intentAlert,   setIntentAlert]  = useState<{ type: string; msg: string; script?: string } | null>(null);
  const [toasts,        setToasts]       = useState<Toast[]>([]);
  const [toastId,       setToastId]      = useState(0);
  const [activeAutoTab, setActiveAutoTab] = useState('sequences');
  const [scriptModal,   setScriptModal]  = useState<ScriptModalState>(null);
  const [propDesc,      setPropDesc]     = useState<string | null>(null);
  const chatRef   = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const msgs = chatHistories[activeLead?.id] || [];

  useEffect(() => { chatRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────
  const addToast = useCallback((title: string, msg: string, color: string = T.accent as string) => {
    const id = toastId + 1;
    setToastId(id);
    setToasts(p => [...p, { id, title, msg, color }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4200);
  }, [toastId]);

  const dismissToast = useCallback((id: number) => setToasts(p => p.filter(t => t.id !== id)), []);

  const updateLeadStatus = useCallback((leadId: number, newStatus: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus as Lead['status'] } : l));
    const l = leads.find(l => l.id === leadId);
    addToast('Status atualizado', `${l?.name} → ${STAGES.find(s=>s.key===newStatus)?.label}`, (SC as Record<string,string>)[newStatus] || T.accent as string);
  }, [leads, addToast]);

  // ── Dados derivados (memoizados) ──────────────────────────────────
  const enrichedLeads = useMemo(() => leads.map(l => ({ ...l, _e: enrichLead(l) })), [leads]);

  const sorted = useMemo(() => enrichedLeads.filter(l => {
    const mT = tempFilter === 'all' || l._e.derivedTemp === tempFilter;
    const mS = propFilter === 'all' || l.status === propFilter;
    const mQ = !searchQuery ||
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery);
    return mT && mS && mQ;
  }).sort((a,b) => b._e.priorityScore - a._e.priorityScore), [enrichedLeads, tempFilter, propFilter, searchQuery]);

  const imminentLeads = useMemo(() => enrichedLeads.filter(l => l._e.imminentClose), [enrichedLeads]);
  const riskLeads     = useMemo(() => enrichedLeads.filter(l => l._e.risk === 'alto'), [enrichedLeads]);
  const lifeLeads     = useMemo(() => leads.filter(l => l.lifeEvent), [leads]);
  const hotLeads      = useMemo(() => enrichedLeads.filter(l => l._e.derivedTemp === 'hot'), [enrichedLeads]);
  const analytics     = useMemo(() => analyticsEngine(leads), [leads]);
  const sparkData     = useMemo(() => [42,48,45,53,61,58,Math.round(analytics.weightedPipeline/1000)], [analytics]);

  // ── Chat ──────────────────────────────────────────────────────────
  const sendMsg = useCallback(() => {
    if (!chatInput.trim()) return;
    if (detectBuyingIntent(chatInput)) {
      setIntentAlert({ type:'intent', msg:'🔥 Intenção de compra detectada!' });
      addToast('Intenção detectada', `${activeLead?.name} demonstrou sinal de compra`, T.amber);
    }
    const obj = detectObjection(chatInput);
    if (obj) {
      const script = objectionCounterscript(obj, activeLead);
      setIntentAlert({ type:'objection', msg:`🚫 Objeção "${obj}" detectada.`, script });
    }
    const m: Message = {
      id: msgs.length + 1, from:'agent', text:chatInput,
      time: new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),
      sentiment:'neutro',
    };
    setChatHistories(prev => ({ ...prev, [activeLead.id]:[...(prev[activeLead.id]||[]),m] }));
    setChatInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setIntentAlert(null);
      const aiReply: Message = {
        id: msgs.length + 2, from:'ai',
        text:'Motor IMOVAI IA v10 analisando perfil · Score preditivo · Recomendações · Melhor abordagem... 🧠✨',
        time: new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),
        sentiment:'neutro',
      };
      setChatHistories(prev => ({ ...prev, [activeLead.id]:[...(prev[activeLead.id]||[]),aiReply] }));
    }, 1800);
  }, [chatInput, msgs, activeLead, addToast]);

  const doAction = useCallback((act: string, l: Lead) => {
    if (act === 'call') {
      setChatInput(followUpMessage(l));
      setActiveLead(l);
      setTab('chat');
      addToast('NBA Executado', `Iniciando contato com ${l.name}`, T.rose);
    } else {
      setLead(l);
      setTab('leads');
    }
  }, [addToast]);

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily:"'IBM Plex Mono','Courier New',monospace", background:T.bg,
      minHeight:'100vh', color:T.text, display:'flex', flexDirection:'column' }}>

      <style>{`
        .tab-content { animation: fadeUp 0.2s ease; }
        .hov:hover   { background: ${T.surfaceHover} !important; cursor: pointer; }
        .btn         { transition: all .12s; cursor: pointer; }
        .btn:hover   { opacity: .85; transform: scale(.97); }
        .prop:hover  { border-color: ${T.accent}50 !important; transform: translateY(-2px);
                       transition: all .2s; box-shadow: 0 8px 24px #00000040; }
      `}</style>

      <ToastContainer toasts={toasts} onDismiss={dismissToast}/>
      {scriptModal && (
        <ScriptModal lead={scriptModal.lead} type={scriptModal.type} onClose={() => setScriptModal(null)}/>
      )}

      {/* ── HEADER ── */}
      <header style={{ background:'rgba(7,12,20,0.92)', borderBottom:`1px solid ${T.border}`,
        padding:'10px 20px', display:'flex', alignItems:'center', gap:16,
        backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:50, flexShrink:0 }}>

        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:'linear-gradient(135deg,#3B82F6,#8B5CF6)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>⬡</div>
          <div>
            <div style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:13, letterSpacing:'-0.5px' }}>IMOVAI OS</div>
            <div style={{ fontSize:7, color:T.textSoft, letterSpacing:1 }}>v10.0 · SISTEMA OPERACIONAL</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ flex:1, maxWidth:360, position:'relative' }}>
          <input ref={searchRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="⌘K · Buscar leads, imóveis, regiões..."
            style={{ width:'100%', background:T.surface, border:`1px solid ${T.border}`,
              borderRadius:8, padding:'6px 12px', color:T.text, fontSize:10, fontFamily:'inherit' }}/>
          {searchQuery && (
            <div style={{ position:'absolute', top:'100%', left:0, right:0, background:T.surface,
              border:`1px solid ${T.border}`, borderRadius:8, marginTop:4, zIndex:100,
              boxShadow:'0 8px 32px #00000080', maxHeight:200, overflowY:'auto' }}>
              {sorted.slice(0,5).map(l => (
                <div key={l.id} onClick={() => { setLead(l); setTab('leads'); setSearchQuery(''); }}
                  className="hov" style={{ display:'flex', alignItems:'center', gap:8,
                    padding:'8px 12px', cursor:'pointer', borderBottom:`1px solid ${T.border}15` }}>
                  <Av i={l.avatar} color={(TC as Record<string,string>)[l._e.derivedTemp] || T.accent} size={26}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10, fontWeight:700 }}>{l.name}</div>
                    <div style={{ fontSize:8, color:T.textSoft }}>{l.location} · {l.budget}</div>
                  </div>
                  <ScoreRing v={l._e.predictiveScore} size={26}/>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badges */}
        <div style={{ display:'flex', gap:6, marginLeft:'auto', flexWrap:'wrap' }}>
          {hotAlert && hotLeads.length > 0 && (
            <button onClick={() => { setTab('insights'); setHotAlert(false); }} className="btn"
              style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px',
                background:T.roseDim, border:`1px solid ${T.rose}30`, borderRadius:6,
                color:T.rose, fontSize:8, fontFamily:'inherit', fontWeight:700, animation:'pulse 2s infinite' }}>
              🔥 {hotLeads.length} HOT
            </button>
          )}
          {imminentLeads.length > 0 && (
            <button onClick={() => setTab('insights')} className="btn"
              style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px',
                background:T.roseDim, border:`1px solid ${T.rose}40`, borderRadius:6,
                color:T.rose, fontSize:8, fontFamily:'inherit', fontWeight:700, animation:'glow 2s infinite' }}>
              🚨 {imminentLeads.length} FECHAR
            </button>
          )}
          <div style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', cursor:'pointer',
            background:autoMode?T.emeraldDim:T.amberDim,
            border:`1px solid ${autoMode?T.emerald:T.amber}25`, borderRadius:6 }}
            onClick={() => setAutoMode(!autoMode)}>
            <div style={{ width:5, height:5, borderRadius:'50%',
              background:autoMode?T.emerald:T.amber, animation:'pulse 2s infinite' }}/>
            <span style={{ fontSize:8, color:autoMode?T.emerald:T.amber, fontWeight:700 }}>
              {autoMode ? 'AUTO ON' : 'AUTO OFF'}
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px',
            background:T.accentDim, border:`1px solid ${T.accent}25`, borderRadius:6 }}>
            <div style={{ width:22, height:22, borderRadius:'50%',
              background:'linear-gradient(135deg,#3B82F6,#1D4ED8)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:9 }}>JM</div>
            <span style={{ fontSize:9, color:T.text, fontWeight:600 }}>Jorge</span>
          </div>
        </div>
      </header>

      {/* ── LAYOUT ── */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* ── SIDEBAR ── */}
        <nav style={{ width:52, background:T.surface, borderRight:`1px solid ${T.border}`,
          display:'flex', flexDirection:'column', alignItems:'center',
          paddingTop:8, gap:2, flexShrink:0 }}>
          {TABS.map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} title={t.label} className="btn"
              style={{ width:36, height:36, borderRadius:8, border:'none',
                background: tab===t.k ? T.surfaceHover : 'transparent',
                color: tab===t.k ? T.text : T.textSoft, cursor:'pointer',
                fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              {t.icon}
              {t.k==='insights' && imminentLeads.length>0 && (
                <div style={{ position:'absolute', top:3, right:3, width:6, height:6,
                  borderRadius:'50%', background:T.rose, border:`1.5px solid ${T.bg}` }}/>
              )}
              {t.k==='forecast' && (
                <div style={{ position:'absolute', top:3, right:3, width:6, height:6,
                  borderRadius:'50%', background:T.emerald, border:`1.5px solid ${T.bg}`, animation:'pulse 3s infinite' }}/>
              )}
            </button>
          ))}
        </nav>

        {/* ── MAIN ── */}
        <main style={{ flex:1, overflowY:'auto', padding:16 }}>

          {/* ════════════ DASHBOARD ════════════ */}
          {tab === 'dashboard' && (
            <div className="tab-content">
              <div style={{ marginBottom:16 }}>
                <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22 }}>Dashboard</h1>
                <p style={{ fontSize:10, color:T.textSoft, marginTop:2 }}>IMOVAI OS v10.0 · Sistema Operacional do Corretor · Litoral Norte SC</p>
              </div>

              {/* KPIs */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))', gap:10, marginBottom:14 }}>
                <StatCard label="Pipeline Ponderado" value={`R$ ${Math.round(analytics.weightedPipeline/1000)}k`} sub={`${analytics.totalLeads} leads ativos`} icon="💰" color={T.gold} trend={18} onClick={() => setTab('forecast')}/>
                <StatCard label="Forecast Mensal"    value={`R$ ${Math.round(analytics.forecastThisMonth/1000)}k`} sub="previsão 30 dias" icon="🔮" color={T.emerald} onClick={() => setTab('forecast')}/>
                <StatCard label="Hot Leads"          value={analytics.hotLeads.toString()} sub="alta probabilidade" icon="🔥" color={T.rose} onClick={() => setTab('leads')}/>
                <StatCard label="NBA Crítico"        value={imminentLeads.length.toString()} sub="ação imediata" icon="🚨" color={T.rose} onClick={() => setTab('insights')}/>
                <StatCard label="Conversão"          value={`${analytics.conversionRate}%`} sub="lead → proposta" icon="📈" color={T.accent}/>
                <StatCard label="Deal Médio"         value={`R$ ${(analytics.avgDealSize/1000).toFixed(0)}k`} sub="comissão/fechamento" icon="💎" color={T.violet}/>
              </div>

              {/* Pipeline + Ações */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                    <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13 }}>📊 Pipeline — 7 semanas</span>
                    <span style={{ fontSize:9, color:T.gold, fontWeight:700 }}>R$ {Math.round(analytics.totalRevenuePotential/1000)}k total</span>
                  </div>
                  <Sparkline data={sparkData} color={T.gold} width={280} height={50}/>
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
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                    <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13 }}>🚨 Ações Prioritárias</span>
                    <button onClick={() => setTab('leads')} style={{ fontSize:8, color:T.accent, background:'none', border:`1px solid ${T.accent}30`, borderRadius:4, padding:'2px 6px', cursor:'pointer', fontFamily:'inherit' }}>Ver todos</button>
                  </div>
                  {sorted.slice(0,4).map(l => (
                    <div key={l.id} onClick={() => { setLead(l); setTab('leads'); }}
                      className="hov" style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 8px', borderRadius:7, marginBottom:4, cursor:'pointer' }}>
                      <Av i={l.avatar} color={(TC as Record<string,string>)[l._e.derivedTemp] || T.accent} size={28}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:10, fontWeight:700 }}>{l.name}</div>
                        <NBAChip nba={l._e.nba}/>
                      </div>
                      <ScoreRing v={l._e.predictiveScore} size={30}/>
                    </div>
                  ))}
                </div>
              </div>

              {/* Life Events + Canal */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div style={{ background:T.surface, border:`1px solid ${T.violet}20`, borderRadius:10, padding:16 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:T.violet, marginBottom:12 }}>🔔 Life Events Ativos</div>
                  {lifeLeads.length === 0 ? (
                    <div style={{ fontSize:9, color:T.textSoft }}>Nenhum life event detectado.</div>
                  ) : lifeLeads.map(l => {
                    const hint = lifeEventHint(l.lifeEvent);
                    return (
                      <div key={l.id} onClick={() => { setLead(l); setTab('leads'); }}
                        className="hov" style={{ display:'flex', gap:8, padding:8, background:T.card,
                          borderRadius:7, marginBottom:6, cursor:'pointer', border:`1px solid ${T.violet}15` }}>
                        <Av i={l.avatar} color={T.violet} size={26}/>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:10, fontWeight:700 }}>{l.name}</div>
                          <div style={{ fontSize:8, color:T.violet, marginTop:2 }}>{l.lifeEvent}</div>
                          {hint && <div style={{ fontSize:8, color:T.textSoft, marginTop:2 }}>{hint}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, marginBottom:12 }}>📡 ROI por Canal de Captação</div>
                  {analytics.cacBySource.map(({ src, cnt, roi }) => (
                    <div key={src} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                      <span style={{ fontSize:13 }}>{(SRC_IC as Record<string,string>)[src] || '📌'}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:9, fontWeight:600 }}>{(SRC_LB as Record<string,string>)[src] || src} · {cnt} leads</div>
                        <div style={{ height:4, background:T.border, borderRadius:2, marginTop:3 }}>
                          <div style={{ width:`${Math.min(roi/15*100,100)}%`, height:'100%', borderRadius:2,
                            background:roi>5?T.emerald:roi>0?T.amber:T.rose }}/>
                        </div>
                      </div>
                      <span style={{ fontSize:9, fontWeight:700, color:roi>5?T.emerald:roi>0?T.amber:T.rose }}>{roi}x ROI</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════ LEADS ════════════ */}
          {tab === 'leads' && (
            <div className="tab-content">
              {/* Filtros */}
              <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap', alignItems:'center' }}>
                <div style={{ flex:1, fontSize:11, fontFamily:'Syne,sans-serif', fontWeight:800 }}>Leads · {sorted.length} ativos</div>
                {(['all','hot','warm','cold'] as const).map(f => (
                  <button key={f} onClick={() => setTempFilter(f)} className="btn"
                    style={{ padding:'3px 10px', borderRadius:14,
                      border:`1px solid ${tempFilter===f?((TC as Record<string,string>)[f]||T.accent):T.border}`,
                      background:tempFilter===f?`${((TC as Record<string,string>)[f]||T.accent)}14`:'transparent',
                      color:tempFilter===f?((TC as Record<string,string>)[f]||T.accent):T.textSoft,
                      fontSize:8, fontFamily:'inherit', fontWeight:700 }}>
                    {f==='all'?'Todos':f==='hot'?'🔥 Hot':f==='warm'?'☀️ Warm':'❄️ Cold'}
                  </button>
                ))}
                {STAGES.map(s => (
                  <button key={s.key} onClick={() => setPropFilter(s.key===propFilter?'all':s.key)} className="btn"
                    style={{ padding:'3px 10px', borderRadius:14,
                      border:`1px solid ${propFilter===s.key?s.color:T.border}`,
                      background:propFilter===s.key?`${s.color}14`:'transparent',
                      color:propFilter===s.key?s.color:T.textSoft,
                      fontSize:8, fontFamily:'inherit', fontWeight:700 }}>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Cabeçalho da tabela */}
              <div style={{ display:'grid', gridTemplateColumns:'2.2fr 0.9fr 1fr 60px 50px 55px',
                padding:'6px 16px', fontSize:7, color:T.textSoft, textTransform:'uppercase',
                letterSpacing:1.5, borderBottom:`1px solid ${T.border}`, marginBottom:2 }}>
                <span>Lead</span><span>Budget</span><span>Status</span>
                <span style={{ textAlign:'center' }}>Score</span>
                <span style={{ textAlign:'center' }}>Vel.</span>
                <span style={{ textAlign:'center' }}>Prob.</span>
              </div>

              {sorted.map(l => (
                <LeadRow key={l.id} l={l} selected={lead?.id === l.id}
                  onClick={() => setLead(lead?.id === l.id ? null : l)}
                  onStatusChange={updateLeadStatus}/>
              ))}

              {/* Painel de detalhe */}
              {lead && (() => {
                const e = enrichLead(lead);
                const tc = (TC as Record<string,string>)[e.derivedTemp] || T.textSoft;
                return (
                  <div style={{ marginTop:16, background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:20 }}>
                    {/* Header */}
                    <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:16,
                      paddingBottom:16, borderBottom:`1px solid ${T.border}` }}>
                      <div style={{ position:'relative' }}>
                        <Av i={lead.avatar} color={tc} size={48}/>
                        {e.derivedTemp==='hot' && <div style={{ position:'absolute', inset:-3, borderRadius:'50%', boxShadow:`0 0 12px ${T.rose}60`, pointerEvents:'none' }}/>}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:16, marginBottom:4 }}>{lead.name}</div>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                          <Pill label={e.derivedTemp==='hot'?'🔥 Hot':e.derivedTemp==='warm'?'☀️ Warm':'❄️ Cold'} color={tc}/>
                          <Pill label={`Score ${e.predictiveScore}`} color={T.accent}/>
                          <Pill label={`Breeze ${e.breezeScore}`} color={T.cyan}/>
                          <Pill label={`ICP ${e.icp}%`} color={e.icp>=80?T.emerald:e.icp>=50?T.amber:T.rose}/>
                          {lead.lifeEvent && <Pill label="🔔 Life Event" color={T.violet}/>}
                          {e.imminentClose && <Pill label="🚨 FECHAR AGORA" color={T.rose}/>}
                        </div>
                        <div style={{ fontSize:9, color:T.textSoft, marginTop:6 }}>
                          📞 {lead.phone} · 📧 {lead.email || '—'} · 📍 {lead.location}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={() => setScriptModal({type:'call', lead})} className="btn"
                          style={{ padding:'6px 12px', background:T.roseDim, border:`1px solid ${T.rose}30`,
                            borderRadius:7, color:T.rose, fontSize:9, fontFamily:'inherit', fontWeight:700 }}>
                          📞 Script
                        </button>
                        <button onClick={() => setScriptModal({type:'video', lead})} className="btn"
                          style={{ padding:'6px 12px', background:T.violetDim, border:`1px solid ${T.violet}30`,
                            borderRadius:7, color:T.violet, fontSize:9, fontFamily:'inherit', fontWeight:700 }}>
                          🎬 Vídeo
                        </button>
                        <button onClick={() => { setActiveLead(lead); setTab('chat'); }} className="btn"
                          style={{ padding:'6px 12px', background:T.accentDim, border:`1px solid ${T.accent}30`,
                            borderRadius:7, color:T.accent, fontSize:9, fontFamily:'inherit', fontWeight:700 }}>
                          💬 Chat IA
                        </button>
                      </div>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                      {/* NBA + Dados */}
                      <div>
                        <div style={{ fontSize:9, color:T.textSoft, marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>NBA Engine</div>
                        <NBAChip nba={e.nba}/>
                        {e.lifeHint && <div style={{ marginTop:8, padding:'7px 10px', background:T.violetDim, borderRadius:7, fontSize:9, color:T.violet }}>{e.lifeHint}</div>}
                        <div style={{ marginTop:10, fontSize:8, color:T.textSoft, lineHeight:1.8 }}>
                          <div>💰 Budget: <span style={{ color:T.emerald, fontWeight:700 }}>{lead.budget}</span></div>
                          <div>📥 Entrada: <span style={{ color:T.text }}>{lead.entry}</span></div>
                          <div>💼 Renda: <span style={{ color:T.text }}>{lead.income}</span></div>
                          <div>🎯 Intenção: <span style={{ color:T.accent }}>{lead.intent}</span></div>
                          <div>📊 Prob: <span style={{ color:e.prob>=0.7?T.emerald:e.prob>=0.5?T.amber:T.rose, fontWeight:700 }}>{Math.round(e.prob*100)}%</span></div>
                          <div>📅 Fechar em: <span style={{ color:T.cyan }}>{e.closeDate}</span></div>
                          <div>⏰ Melhor hora: <span style={{ color:T.gold }}>{e.bestTime}</span></div>
                        </div>
                      </div>

                      {/* Imóveis recomendados */}
                      <div>
                        <div style={{ fontSize:9, color:T.textSoft, marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Imóveis Recomendados</div>
                        {e.recommendations.map(p => {
                          const roi = calculateInvestmentROI(p);
                          return (
                            <div key={p.code} style={{ marginBottom:8, padding:'8px 10px', background:T.card,
                              borderRadius:8, border:`1px solid ${T.accent}15` }}>
                              <div style={{ fontSize:10 }}>{p.photo} <strong>{p.code}</strong> — {p.title.slice(0,22)}</div>
                              <div style={{ fontSize:8, color:T.textSoft, marginTop:2 }}>{p.city} · {p.area}m²</div>
                              <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                                <span style={{ fontSize:8, color:T.emerald, fontWeight:700 }}>{p.matchScore}pts</span>
                                {roi && <span style={{ fontSize:8, color:T.cyan }}>ROI {roi.netYield}% · {roi.paybackYears}a</span>}
                                <span style={{ fontSize:8, color:T.accent }}>R$ {(p.price/1000).toFixed(0)}k</span>
                              </div>
                              <ProbBar v={p.matchScore/100}/>
                            </div>
                          );
                        })}
                        <div style={{ marginTop:8, padding:'8px 10px', background:T.card, borderRadius:8, border:`1px solid ${T.gold}15` }}>
                          <div style={{ fontSize:9, color:T.gold, fontWeight:700, marginBottom:4 }}>📍 {lead.location}</div>
                          <div style={{ fontSize:8, color:T.textSoft }}>
                            Valorização 12m: <span style={{ color:T.emerald }}>+{e.neighborhood?.appreciation12m}%</span><br/>
                            Airbnb: <span style={{ color:T.cyan }}>{e.neighborhood?.airbnbOccupancy}% ocupação</span>
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div>
                        <div style={{ fontSize:9, color:T.textSoft, marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Timeline</div>
                        {lead.timeline?.map((ev, i) => (
                          <div key={i} style={{ display:'flex', gap:8, marginBottom:8, alignItems:'flex-start' }}>
                            <div style={{ width:18, height:18, borderRadius:'50%',
                              background:ev.type==='ai'?T.accentDim:ev.type==='insight'?T.violetDim:T.emeraldDim,
                              border:`1px solid ${ev.type==='ai'?T.accent:ev.type==='insight'?T.violet:T.emerald}30`,
                              display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, flexShrink:0 }}>{ev.icon}</div>
                            <div>
                              <div style={{ fontSize:9, color:T.text }}>{ev.event}</div>
                              <div style={{ fontSize:8, color:T.textSoft }}>{ev.time}</div>
                            </div>
                          </div>
                        ))}
                        <div style={{ marginTop:10 }}>
                          <div style={{ fontSize:8, color:T.textSoft, marginBottom:6 }}>MENSAGEM SUGERIDA</div>
                          <div onClick={() => { setActiveLead(lead); setChatInput(e.followUpMsg); setTab('chat'); }}
                            style={{ fontSize:9, background:T.card, padding:'8px 10px', borderRadius:7,
                              color:T.textSoft, border:`1px solid ${T.border}`, cursor:'pointer', lineHeight:1.5 }}>
                            {e.followUpMsg}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ════════════ PIPELINE ════════════ */}
          {tab === 'pipeline' && (
            <div className="tab-content">
              <div style={{ marginBottom:16 }}>
                <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22 }}>Pipeline Kanban</h1>
                <p style={{ fontSize:10, color:T.textSoft, marginTop:2 }}>Pipeline ponderado R$ {Math.round(analytics.weightedPipeline/1000)}k · Quick advance por estágio</p>
              </div>
              <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:10 }}>
                {STAGES.map(stage => {
                  const sLeads = leads.filter(l => l.status === stage.key);
                  const sRev   = sLeads.reduce((s,l) => s + l.revenueExpected, 0);
                  return (
                    <div key={stage.key} style={{ minWidth:180, maxWidth:200, flexShrink:0 }}>
                      <div style={{ padding:'8px 12px', background:`${stage.color}12`,
                        border:`1px solid ${stage.color}25`, borderRadius:'8px 8px 0 0',
                        display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                          <div style={{ fontSize:9, fontWeight:700, color:stage.color, textTransform:'uppercase', letterSpacing:1 }}>{stage.label}</div>
                          <div style={{ fontSize:8, color:T.textSoft }}>R$ {(sRev/1000).toFixed(0)}k</div>
                        </div>
                        <div style={{ width:18, height:18, borderRadius:'50%', background:`${stage.color}20`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:9, fontWeight:700, color:stage.color }}>{sLeads.length}</div>
                      </div>
                      <div style={{ background:T.surface, border:`1px solid ${stage.color}15`,
                        borderTop:'none', borderRadius:'0 0 8px 8px', minHeight:60, padding:6 }}>
                        {sLeads.length === 0 ? (
                          <div style={{ textAlign:'center', padding:'12px 0', color:T.textSoft, fontSize:9 }}>Vazio</div>
                        ) : sLeads.map(l => {
                          const e = enrichLead(l);
                          return (
                            <div key={l.id} onClick={() => { setLead(l); setTab('leads'); }}
                              className="hov" style={{ background:T.card, borderRadius:7, padding:'8px 10px',
                                marginBottom:6, cursor:'pointer',
                                border:`1px solid ${e.imminentClose?T.rose:T.border}20`, position:'relative' }}>
                              {e.imminentClose && <div style={{ position:'absolute', top:6, right:6,
                                width:5, height:5, borderRadius:'50%', background:T.rose, animation:'pulse 1s infinite' }}/>}
                              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
                                <Av i={l.avatar} color={(TC as Record<string,string>)[e.derivedTemp]||T.textSoft} size={22}/>
                                <div style={{ flex:1, minWidth:0 }}>
                                  <div style={{ fontSize:9, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.name}</div>
                                  <div style={{ fontSize:8, color:T.textSoft }}>{l.budget}</div>
                                </div>
                              </div>
                              <ProbBar v={l.closingProbability}/>
                              <div style={{ display:'flex', justifyContent:'space-between', marginTop:5 }}>
                                <ScoreRing v={e.predictiveScore} size={24}/>
                                <div style={{ fontSize:8, color:T.emerald, fontWeight:700 }}>R$ {(l.revenueExpected/1000).toFixed(0)}k</div>
                              </div>
                              {(() => {
                                const idx  = STAGES.findIndex(s => s.key === l.status);
                                const next = STAGES[idx + 1];
                                return next && next.key !== 'perdido' ? (
                                  <button onClick={ev => { ev.stopPropagation(); updateLeadStatus(l.id, next.key); }}
                                    style={{ marginTop:5, width:'100%', fontSize:8, padding:'2px 0',
                                      background:`${next.color}12`, border:`1px solid ${next.color}25`,
                                      borderRadius:4, color:next.color, cursor:'pointer', fontFamily:'inherit' }}>
                                    → {next.label}
                                  </button>
                                ) : null;
                              })()}
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

          {/* ════════════ IMÓVEIS ════════════ */}
          {tab === 'imoveis' && (
            <div className="tab-content">
              <div style={{ marginBottom:16 }}>
                <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22 }}>Imóveis</h1>
                <p style={{ fontSize:10, color:T.textSoft, marginTop:2 }}>Portfólio ativo · ROI calculado · Valorização por bairro · {PROPERTIES.length} imóveis</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:12 }}>
                {PROPERTIES.map(p => {
                  const roi = calculateInvestmentROI(p);
                  const nb  = getNeighborhoodInsights(p.city);
                  const desc = propDesc === p.code ? generatePropertyDescription(p, 'vendas') : null;
                  return (
                    <div key={p.code} className="prop"
                      style={{ background:T.surface, border:`1px solid ${propDesc===p.code?T.accent:T.border}`,
                        borderRadius:10, overflow:'hidden', cursor:'pointer', transition:'all .2s' }}>
                      <div style={{ height:80, background:`linear-gradient(135deg,${p.airbnb?T.cyanDim:T.accentDim},${T.card})`,
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, position:'relative' }}>
                        {p.photo}
                        <div style={{ position:'absolute', top:8, right:8, display:'flex', gap:4 }}>
                          {p.airbnb && <span style={{ fontSize:7, padding:'2px 5px', borderRadius:3, background:T.cyan, color:T.bg, fontWeight:700 }}>AIRBNB</span>}
                          <span style={{ fontSize:7, padding:'2px 5px', borderRadius:3, background:p.status==='disponível'?T.emerald:T.amber, color:T.bg, fontWeight:700 }}>{p.status.toUpperCase()}</span>
                        </div>
                        <div style={{ position:'absolute', bottom:4, left:8, fontSize:8, color:T.textSoft, background:'rgba(7,12,20,0.92)', padding:'1px 5px', borderRadius:3 }}>
                          +{nb.appreciation12m}% /ano
                        </div>
                      </div>
                      <div style={{ padding:12 }}>
                        <div style={{ fontSize:11, fontWeight:700, marginBottom:2 }}>{p.title}</div>
                        <div style={{ fontSize:9, color:T.textSoft, marginBottom:8 }}>{p.city} · {p.area}m² · {p.bedrooms>0?`${p.bedrooms} dorms`:'Studio'}</div>
                        {p.highlight && <div style={{ fontSize:8, color:T.gold, marginBottom:8 }}>⭐ {p.highlight}</div>}
                        <div style={{ fontSize:16, fontWeight:800, color:T.emerald, marginBottom:6 }}>R$ {(p.price/1000).toFixed(0)}k</div>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                          {p.yield > 0 && <Pill label={`Yield ${p.yield}%`} color={T.cyan}/>}
                          <Pill label={`📍 ${p.beach}`} color={T.accent}/>
                          <Pill label={`${p.matches} match(es)`} color={T.violet}/>
                          {roi && <Pill label={roi.rating} color={roi.rating==='EXCELENTE'?T.emerald:roi.rating==='BOM'?T.amber:T.rose}/>}
                        </div>
                        {roi && (
                          <div style={{ background:T.card, borderRadius:7, padding:'7px 10px', marginBottom:8 }}>
                            <div style={{ display:'flex', gap:10 }}>
                              <div><div style={{ fontSize:7, color:T.textSoft }}>Yield bruto</div><div style={{ fontSize:11, fontWeight:700, color:T.cyan }}>{roi.grossYield}%</div></div>
                              <div><div style={{ fontSize:7, color:T.textSoft }}>Yield líq.</div><div style={{ fontSize:11, fontWeight:700, color:T.emerald }}>{roi.netYield}%</div></div>
                              <div><div style={{ fontSize:7, color:T.textSoft }}>Aluguel/mês</div><div style={{ fontSize:11, fontWeight:700, color:T.gold }}>R$ {(roi.monthlyRent/1000).toFixed(1)}k</div></div>
                              <div><div style={{ fontSize:7, color:T.textSoft }}>Retorno</div><div style={{ fontSize:11, fontWeight:700, color:T.accent }}>{roi.paybackYears}a</div></div>
                            </div>
                          </div>
                        )}
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div style={{ fontSize:9, color:T.emerald, fontWeight:700 }}>Comissão: R$ {(p.commission/1000).toFixed(0)}k</div>
                          <button onClick={() => setPropDesc(propDesc===p.code?null:p.code)}
                            style={{ fontSize:8, padding:'2px 7px', background:T.accentDim, border:`1px solid ${T.accent}25`, borderRadius:4, color:T.accent, cursor:'pointer', fontFamily:'inherit' }}>
                            {propDesc===p.code?'Fechar':'Ver descrição'}
                          </button>
                        </div>
                        {desc && (
                          <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${T.border}` }}>
                            <div style={{ fontSize:8, color:T.textSoft, marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>Descrição IA — Pronto para WhatsApp</div>
                            <div style={{ fontSize:9, color:T.text, lineHeight:1.6, background:T.bg, borderRadius:6, padding:'8px 10px', whiteSpace:'pre-line' }}>{desc}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════ CHAT ════════════ */}
          {tab === 'chat' && (
            <div className="tab-content" style={{ display:'grid', gridTemplateColumns:'220px 1fr 220px', gap:12, height:'calc(100vh - 130px)' }}>
              {/* Lead Selector */}
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, overflow:'hidden', display:'flex', flexDirection:'column' }}>
                <div style={{ padding:'10px 12px', borderBottom:`1px solid ${T.border}`, fontSize:9, fontWeight:700, color:T.textSoft }}>LEADS ATIVOS</div>
                <div style={{ overflowY:'auto', flex:1 }}>
                  {leads.map(l => {
                    const e = enrichLead(l);
                    const chatLen = (chatHistories[l.id] || []).length;
                    return (
                      <div key={l.id} onClick={() => setActiveLead(l)} className="hov"
                        style={{ padding:'9px 12px', borderBottom:`1px solid ${T.border}15`, cursor:'pointer',
                          background:activeLead?.id===l.id?T.accentDim:'transparent', display:'flex', alignItems:'center', gap:7 }}>
                        <div style={{ position:'relative' }}>
                          <Av i={l.avatar} color={(TC as Record<string,string>)[e.derivedTemp]||T.textSoft} size={26}/>
                          {e.imminentClose && <div style={{ position:'absolute', inset:-1, borderRadius:'50%', border:`1.5px solid ${T.rose}`, animation:'pulse 1s infinite' }}/>}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:9, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.name}</div>
                          <div style={{ fontSize:8, color:T.textSoft }}>{l.lastMsg}</div>
                        </div>
                        {chatLen > 0 && <span style={{ fontSize:7, background:T.accent, color:T.bg, borderRadius:8, padding:'1px 4px', fontWeight:700 }}>{chatLen}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chat Window */}
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                <div style={{ padding:'10px 14px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                  <Av i={activeLead.avatar} color={(TC as Record<string,string>)[enrichLead(activeLead).derivedTemp]||T.textSoft} size={28}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, fontWeight:700 }}>{activeLead.name}</div>
                    <div style={{ fontSize:8, color:T.textSoft }}>{activeLead.location} · {activeLead.budget}</div>
                  </div>
                  <Pill label={enrichLead(activeLead).derivedTemp==='hot'?'🔥 Hot':enrichLead(activeLead).derivedTemp==='warm'?'☀️ Warm':'❄️ Cold'}
                    color={(TC as Record<string,string>)[enrichLead(activeLead).derivedTemp]||T.textSoft}/>
                </div>

                <div style={{ flex:1, overflowY:'auto', padding:14, display:'flex', flexDirection:'column', gap:8 }}>
                  {msgs.length === 0 ? (
                    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8, color:T.textSoft }}>
                      <div style={{ fontSize:28 }}>💬</div>
                      <button onClick={() => setChatInput(followUpMessage(activeLead))} className="btn"
                        style={{ fontSize:9, padding:'5px 12px', background:T.accentDim, border:`1px solid ${T.accent}30`, borderRadius:6, color:T.accent, cursor:'pointer', fontFamily:'inherit' }}>
                        Usar mensagem IA →
                      </button>
                    </div>
                  ) : msgs.map(m => (
                    <div key={m.id} style={{ display:'flex', justifyContent:m.from==='client'?'flex-start':m.from==='ai'?'flex-start':'flex-end' }}>
                      {m.from==='ai' && <div style={{ width:20, height:20, borderRadius:'50%', background:T.accentDim, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, marginRight:6, flexShrink:0, marginTop:2 }}>⬡</div>}
                      <div style={{ maxWidth:'78%', padding:'8px 12px',
                        borderRadius:m.from==='agent'?'10px 10px 2px 10px':'10px 10px 10px 2px',
                        background:m.from==='agent'?T.accent:m.from==='ai'?`${T.accent}12`:T.card,
                        color:m.from==='agent'?'#fff':T.text, fontSize:10 }}>
                        {m.text.split('\n').map((line,i) => <div key={i}>{line}</div>)}
                        <div style={{ fontSize:7, marginTop:4, opacity:0.6 }}>
                          {m.from==='ai'?'IA ·':m.from==='agent'?'Você ·':'Cliente ·'} {m.time}
                        </div>
                      </div>
                    </div>
                  ))}
                  {typing && (
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:20, height:20, borderRadius:'50%', background:T.accentDim, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9 }}>⬡</div>
                      <div style={{ display:'flex', gap:3, padding:'6px 10px', background:T.card, borderRadius:10 }}>
                        {[0,1,2].map(i => <div key={i} style={{ width:5, height:5, borderRadius:'50%', background:T.accent, animation:`pulse ${1+i*0.2}s infinite` }}/>)}
                      </div>
                    </div>
                  )}
                  {intentAlert && (
                    <div style={{ padding:'8px 10px', background:intentAlert.type==='intent'?T.amberDim:T.roseDim,
                      border:`1px solid ${intentAlert.type==='intent'?T.amber:T.rose}25`, borderRadius:7 }}>
                      <div style={{ fontSize:9, fontWeight:700, color:intentAlert.type==='intent'?T.amber:T.rose }}>{intentAlert.msg}</div>
                      {intentAlert.script && <div style={{ fontSize:8, color:T.textSoft, marginTop:4, fontStyle:'italic' }}>💡 {intentAlert.script.slice(0,120)}...</div>}
                    </div>
                  )}
                  <div ref={chatRef}/>
                </div>

                <div style={{ padding:'10px 12px', borderTop:`1px solid ${T.border}`, flexShrink:0, display:'flex', gap:7 }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && sendMsg()}
                    placeholder={`Mensagem para ${activeLead?.name?.split(' ')[0] || 'lead'}...`}
                    style={{ flex:1, background:T.bg, border:`1px solid ${T.border}`, borderRadius:7, padding:'7px 10px', color:T.text, fontSize:10, fontFamily:'inherit' }}/>
                  <button onClick={sendMsg} className="btn"
                    style={{ padding:'7px 12px', background:T.accent, border:'none', borderRadius:7, color:'#fff', fontSize:10, fontWeight:700 }}>→</button>
                </div>
              </div>

              {/* Painel lateral */}
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:14, overflowY:'auto' }}>
                {(() => {
                  const e = enrichLead(activeLead);
                  const chatAnalysis = analyzeConversation(msgs);
                  return (
                    <>
                      <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:11, marginBottom:12 }}>🧠 Assistente IA</div>
                      <NBAChip nba={e.nba}/>
                      {e.lifeHint && <div style={{ marginTop:8, padding:7, background:T.violetDim, borderRadius:7, fontSize:9, color:T.violet }}>{e.lifeHint}</div>}
                      <div style={{ marginTop:10 }}>
                        <div style={{ fontSize:8, color:T.textSoft, marginBottom:5 }}>ANÁLISE DA CONVERSA</div>
                        <div style={{ background:T.card, borderRadius:7, padding:'8px 10px', fontSize:8, color:T.textSoft, lineHeight:1.8 }}>
                          Sentimento: <span style={{ color:chatAnalysis.score>70?T.emerald:T.amber, fontWeight:700 }}>{chatAnalysis.label}</span><br/>
                          Sinais compra: <span style={{ color:T.emerald, fontWeight:700 }}>{chatAnalysis.buyingSignals}</span><br/>
                          Objeções: <span style={{ color:T.rose, fontWeight:700 }}>{chatAnalysis.objections}</span>
                        </div>
                      </div>
                      <div style={{ marginTop:10 }}>
                        <div style={{ fontSize:8, color:T.textSoft, marginBottom:6 }}>FOLLOW-UP SUGERIDO</div>
                        <div onClick={() => setChatInput(e.followUpMsg)}
                          style={{ fontSize:9, background:T.card, padding:'8px 10px', borderRadius:7, color:T.textSoft, border:`1px solid ${T.border}`, cursor:'pointer', lineHeight:1.4 }}>
                          {e.followUpMsg}
                        </div>
                      </div>
                      <div style={{ marginTop:10 }}>
                        <div style={{ fontSize:8, color:T.textSoft, marginBottom:6 }}>IMÓVEIS RECOMENDADOS</div>
                        {e.recommendations.slice(0,2).map(p => (
                          <div key={p.code} style={{ marginBottom:5, padding:'6px 8px', background:T.card, borderRadius:6, fontSize:9 }}>
                            {p.photo} <strong>{p.code}</strong> — {p.title.slice(0,18)}
                            <div style={{ color:T.emerald, fontSize:8 }}>{p.matchScore}pts · R$ {(p.price/1000).toFixed(0)}k</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop:8, display:'flex', gap:5 }}>
                        <button onClick={() => setScriptModal({type:'call', lead:activeLead})} className="btn"
                          style={{ flex:1, padding:5, background:T.roseDim, border:`1px solid ${T.rose}25`, borderRadius:5, color:T.rose, fontSize:8, fontFamily:'inherit', fontWeight:700 }}>
                          📞 Script
                        </button>
                        <button onClick={() => setScriptModal({type:'video', lead:activeLead})} className="btn"
                          style={{ flex:1, padding:5, background:T.violetDim, border:`1px solid ${T.violet}25`, borderRadius:5, color:T.violet, fontSize:8, fontFamily:'inherit', fontWeight:700 }}>
                          🎬 Vídeo
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ════════════ INSIGHTS ════════════ */}
          {tab === 'insights' && (
            <div className="tab-content">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div>
                  <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22 }}>Insights IA</h1>
                  <p style={{ fontSize:10, color:T.textSoft, marginTop:2 }}>NBA Engine · Risk Analyzer · Life Events · Sentimento · Velocity · ICP Match</p>
                </div>
                <div style={{ display:'flex', gap:5 }}>
                  {['all','imminent','risk','life','followup'].map(s => (
                    <button key={s} onClick={() => setInsightMode(s)} className="btn"
                      style={{ padding:'4px 10px', borderRadius:16,
                        border:`1px solid ${insightMode===s?T.accent:T.border}`,
                        background:insightMode===s?T.accentDim:'transparent',
                        color:insightMode===s?T.accent:T.textSoft, fontSize:8,
                        fontFamily:'inherit', fontWeight:700 }}>
                      {s==='all'?'Todos':s==='imminent'?'🚨 Imin.':s==='risk'?'⚠️ Risco':s==='life'?'🔔 Life':'📅 Follow'}
                    </button>
                  ))}
                </div>
              </div>

              {/* NBA Crítico */}
              <div style={{ background:T.roseDim, border:`1px solid ${T.rose}25`, borderRadius:10, padding:16, marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:T.rose }}>🚨 NBA Engine · Ações Críticas</span>
                  <span style={{ fontSize:9, background:T.roseDim, color:T.rose, padding:'2px 6px', borderRadius:4 }}>{imminentLeads.length} detectados</span>
                </div>
                {imminentLeads.length > 0 ? (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:10 }}>
                    {imminentLeads.map(l => {
                      const e = enrichLead(l);
                      return (
                        <div key={l.id} style={{ background:T.card, border:`1px solid ${T.rose}25`, borderRadius:8, padding:12 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                            <Av i={l.avatar} color={T.rose} size={30}/>
                            <div>
                              <div style={{ fontSize:12, fontWeight:700 }}>{l.name}</div>
                              <div style={{ fontSize:9, color:T.rose }}>{Math.round(l.closingProbability*100)}% · {e.closeDate}</div>
                            </div>
                          </div>
                          <ProbBar v={l.closingProbability}/>
                          <div style={{ marginTop:8 }}><NBAChip nba={e.nba}/></div>
                          <div style={{ display:'flex', gap:5, marginTop:8 }}>
                            <button onClick={() => doAction('call', l)} className="btn"
                              style={{ flex:1, padding:5, background:T.rose, border:'none', borderRadius:6, color:'#fff', fontSize:9, fontWeight:700, fontFamily:'inherit' }}>
                              🚨 Executar NBA
                            </button>
                            <button onClick={() => setScriptModal({type:'call', lead:l})} className="btn"
                              style={{ padding:'5px 8px', background:T.roseDim, border:`1px solid ${T.rose}25`, borderRadius:6, color:T.rose, fontSize:9, fontFamily:'inherit' }}>
                              📞
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : <div style={{ fontSize:10, color:T.textSoft, padding:'10px 0' }}>Nenhuma ação crítica. 🎉</div>}
              </div>

              {/* Velocity + ICP */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, marginBottom:12 }}>⚡ Deal Velocity Ranking</div>
                  {[...leads].sort((a,b)=>(b.dealVelocity||0)-(a.dealVelocity||0)).map(l => {
                    const temp = leadTemperature(computeEinsteinScore(l));
                    return (
                      <div key={l.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, padding:'6px 8px', background:T.card, borderRadius:7 }}>
                        <Av i={l.avatar} color={(TC as Record<string,string>)[temp]||T.textSoft} size={24}/>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:10, fontWeight:700 }}>{l.name}</div>
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:2 }}>
                            <VelocityChip v={l.dealVelocity||0}/>
                            <span style={{ fontSize:8, color:T.textSoft }}>{(l.dealVelocity||0).toFixed(1)}x</span>
                          </div>
                        </div>
                        <div style={{ fontSize:9, color:T.emerald, fontWeight:700 }}>R$ {(l.revenueExpected/1000).toFixed(0)}k</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, marginBottom:12 }}>🎯 ICP Match — Perfil Ideal</div>
                  {leads.map(l => {
                    const icp = icpMatch(l);
                    const color = icp>=80?T.emerald:icp>=50?T.amber:T.rose;
                    return (
                      <div key={l.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                        <Av i={l.avatar} color={color} size={24}/>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:9, fontWeight:700 }}>{l.name}</div>
                          <div style={{ height:4, background:T.border, borderRadius:2, marginTop:3 }}>
                            <div style={{ width:`${icp}%`, height:'100%', background:color, borderRadius:2 }}/>
                          </div>
                        </div>
                        <span style={{ fontSize:9, fontWeight:800, color, minWidth:30 }}>{icp}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Risk + Follow-up */}
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13 }}>⚠️ Risk Analyzer · Follow-up Scheduler</span>
                  <span style={{ fontSize:9, background:T.amberDim, color:T.amber, padding:'2px 6px', borderRadius:4 }}>{riskLeads.length} risco alto</span>
                </div>
                {leads.map(l => {
                  const e  = enrichLead(l);
                  const fs = followupScheduler(l);
                  if (!e.risk && !fs) return null;
                  return (
                    <div key={l.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                      marginBottom:7, padding:'8px 10px', background:T.card, borderRadius:7,
                      border:`1px solid ${e.risk==='alto'?T.amber:T.border}20` }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <Av i={l.avatar} color={e.risk==='alto'?T.amber:T.textSoft} size={26}/>
                        <div>
                          <div style={{ fontSize:10, fontWeight:700 }}>{l.name}</div>
                          <div style={{ fontSize:9, color:T.textSoft }}>{l.lastMsg}</div>
                          {fs && <div style={{ fontSize:8, color:fs.urgency==='critical'?T.rose:T.amber, marginTop:2 }}>{fs.msg}</div>}
                        </div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        {e.risk && <div style={{ fontSize:9, color:T.amber, fontWeight:700 }}>⚠️ Risco {e.risk}</div>}
                        <div style={{ fontSize:8, color:T.gold }}>R$ {(l.revenueExpected/1000).toFixed(0)}k</div>
                        <button onClick={() => doAction('call', l)} className="btn"
                          style={{ marginTop:3, fontSize:8, padding:'2px 7px', background:T.amberDim,
                            border:`1px solid ${T.amber}25`, borderRadius:3, color:T.amber, fontFamily:'inherit' }}>Reativar</button>
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            </div>
          )}

          {/* ════════════ AUTOMAÇÕES ════════════ */}
          {tab === 'automations' && (
            <div className="tab-content">
              <div style={{ marginBottom:16 }}>
                <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22 }}>Automações</h1>
                <p style={{ fontSize:10, color:T.textSoft, marginTop:2 }}>Sequências · Drip 3-7-30 · Webhooks · WhatsApp Bot · Life Events</p>
              </div>
              <div style={{ display:'flex', gap:6, marginBottom:14 }}>
                {['sequences','cadencias','webhooks','whatsapp'].map(s => (
                  <button key={s} onClick={() => setActiveAutoTab(s)} className="btn"
                    style={{ padding:'5px 12px', borderRadius:16,
                      border:`1px solid ${activeAutoTab===s?T.accent:T.border}`,
                      background:activeAutoTab===s?T.accentDim:'transparent',
                      color:activeAutoTab===s?T.accent:T.textSoft,
                      fontSize:9, fontFamily:'inherit', fontWeight:700 }}>
                    {s==='sequences'?'Sequências':s==='cadencias'?'Cadências':s==='webhooks'?'Webhooks':'WhatsApp Bot'}
                  </button>
                ))}
              </div>

              {activeAutoTab === 'sequences' && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
                  {([
                    { name:'🔥 NBA Critical Flow',    trigger:'Prob >85% + Hot',           steps:['closingAlert() detectado','alertSystem() → IMMINENTE','nextBestAction() → Ligar AGORA','Script + Toast disparados'],    color:T.rose,    active:true,  runs:12 },
                    { name:'⚠️ Risk Intervention',    trigger:'riskOfLoss() = alto',        steps:['Lead hot sem resposta +24h','followupScheduler() urgente','WhatsApp automático','Escalada humano'],                     color:T.amber,   active:true,  runs:8  },
                    { name:'🌱 Drip 3–7–30 dias',     trigger:'Lead cold s/ resposta',      steps:['Dia 3: Imóvel ideal','Dia 7: Case de sucesso','Dia 30: Proposta especial','Requalificação auto'],                        color:T.accent,  active:true,  runs:23 },
                    { name:'🔔 Life Event Protocol',  trigger:'lifeEvent detectado',         steps:['followUpMessage() empático','Imóveis re-ranqueados','Abordagem personalizada','Follow-up 48h'],                          color:T.violet,  active:true,  runs:5  },
                    { name:'🏠 Property Match Alert', trigger:'Novo imóvel match >40pts',    steps:['recommendProperties() calc','Leads por fit','Notificação personalizada','Agendamento visita auto'],                      color:T.cyan,    active:false, runs:0  },
                    { name:'📊 Monthly ROI Report',   trigger:'Todo dia 1 do mês',          steps:['analyticsEngine() rodando','CAC + ROI por canal','Relatório IA gerado','Enviado para investidores'],                     color:T.gold,    active:false, runs:0  },
                  ] as const).map(seq => (
                    <div key={seq.name} style={{ background:T.surface, border:`1px solid ${seq.color}20`, borderRadius:10, padding:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                        <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:11, color:seq.color }}>{seq.name}</span>
                        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                          <span style={{ fontSize:8, color:T.textSoft }}>{seq.runs}x</span>
                          <div style={{ width:5, height:5, borderRadius:'50%', background:seq.active?seq.color:T.textSoft, animation:seq.active?'pulse 2s infinite':'none' }}/>
                        </div>
                      </div>
                      <div style={{ fontSize:8, color:T.textSoft, background:`${seq.color}08`, padding:'4px 8px', borderRadius:5, marginBottom:10 }}>
                        <span style={{ color:seq.color, fontWeight:700 }}>Trigger: </span>{seq.trigger}
                      </div>
                      {seq.steps.map((step, i) => (
                        <div key={i} style={{ display:'flex', gap:6, marginBottom:3, fontSize:9, color:T.textSoft }}>
                          <span style={{ color:seq.color, flexShrink:0 }}>{i+1}.</span><span>{step}</span>
                        </div>
                      ))}
                      <button style={{ marginTop:10, width:'100%', padding:4,
                        background:seq.active?`${seq.color}10`:`${T.emerald}10`,
                        border:`1px solid ${seq.active?seq.color:T.emerald}25`, borderRadius:5,
                        color:seq.active?seq.color:T.emerald, fontSize:8, cursor:'pointer', fontFamily:'inherit', fontWeight:700 }}>
                        {seq.active ? '✓ Ativo — Pausar' : '▶ Ativar'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeAutoTab === 'cadencias' && (
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, marginBottom:14 }}>📅 Cadência de Contatos Ativa</div>
                  {leads.map(l => {
                    const e  = enrichLead(l);
                    const fs = followupScheduler(l);
                    return (
                      <div key={l.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
                        background:T.card, borderRadius:8, marginBottom:7, border:`1px solid ${T.border}15` }}>
                        <Av i={l.avatar} color={(TC as Record<string,string>)[e.derivedTemp]||T.textSoft} size={28}/>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:11, fontWeight:700 }}>{l.name}</div>
                          <div style={{ fontSize:9, color:T.textSoft }}>{l.lastMsg} · {l.behavioralData?.preferredChannels?.[0]||'whatsapp'}</div>
                          {fs && <div style={{ fontSize:9, color:fs.urgency==='critical'?T.rose:T.amber, marginTop:3 }}>⚡ {fs.type.toUpperCase()} — {fs.msg}</div>}
                        </div>
                        <span style={{ fontSize:8, padding:'2px 7px', background:T.goldDim, border:`1px solid ${T.gold}25`, borderRadius:4, color:T.gold }}>{e.bestTime}</span>
                        <button onClick={() => doAction('call', l)} className="btn"
                          style={{ fontSize:8, padding:'3px 8px', background:T.accent, border:'none', borderRadius:5, color:'#fff', fontFamily:'inherit', fontWeight:700 }}>Contatar</button>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeAutoTab === 'webhooks' && (
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, marginBottom:12 }}>🔗 Integrações e Webhooks</div>
                  {([
                    { name:'Meta WhatsApp Business', desc:'Leads de formulários Meta Ads',  status:'conectado',    url:'/api/webhook/meta',      color:T.emerald },
                    { name:'Instagram DM',           desc:'Captura leads via Direct',        status:'conectado',    url:'/api/webhook/instagram',  color:T.emerald },
                    { name:'Google Ads',             desc:'Leads de campanhas Google',       status:'conectado',    url:'/api/webhook/google',     color:T.accent  },
                    { name:'ZAP / VivaReal',         desc:'Portais imobiliários nacionais',  status:'pendente',     url:'/api/webhook/portais',    color:T.amber   },
                    { name:'N8N / Make Automation',  desc:'Orquestrador no-code',            status:'configurando', url:'/api/webhook/n8n',        color:T.cyan    },
                    { name:'OpenAI / Claude API',    desc:'Qualificação com LLM',            status:'pendente',     url:'/api/ai/completions',     color:T.violet  },
                  ] as const).map(w => (
                    <div key={w.name} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
                      background:T.card, borderRadius:7, marginBottom:6, border:`1px solid ${w.color}15` }}>
                      <div style={{ width:8, height:8, borderRadius:'50%',
                        background:w.status==='conectado'?T.emerald:w.status==='pendente'?T.amber:T.accent,
                        animation:'pulse 2s infinite', flexShrink:0 }}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:10, fontWeight:700 }}>{w.name}</div>
                        <div style={{ fontSize:8, color:T.textSoft }}>{w.desc}</div>
                        <div style={{ fontSize:8, color:T.textDim, fontFamily:'monospace', marginTop:2 }}>{w.url}</div>
                      </div>
                      <span style={{ fontSize:8, padding:'2px 7px', borderRadius:10, background:`${w.color}15`, color:w.color, fontWeight:700 }}>{w.status.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeAutoTab === 'whatsapp' && (
                <div style={{ background:T.surface, border:`1px solid ${T.emerald}20`, borderRadius:10, padding:16 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, marginBottom:4, color:T.emerald }}>📱 WhatsApp Bot — IMOVAI Agent Omnicanal</div>
                  <div style={{ fontSize:10, color:T.textSoft, marginBottom:16 }}>Qualificação · Agendamento · Objeções · Follow-up · Drip Automático</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {([
                      { flow:'Qualificação Inicial', steps:['Recebe mensagem','Pergunta renda + entrada','Pergunta localização','Qualifica e pontua auto','Entrega ao corretor c/ briefing'], color:T.accent },
                      { flow:'Agendamento de Visita', steps:['Lead quente detectado','Apresenta 3 horários','Confirma via WhatsApp','Lembrete 24h antes','Registra no CRM auto'], color:T.emerald },
                      { flow:'Drip 3–7–30 dias', steps:['Dia 3: Imóvel relevante','Dia 7: Case similar','Dia 14: Oferta especial','Dia 30: Feedback','Dia 60: Re-qualificação'], color:T.amber },
                      { flow:'Objeção Handler', steps:['detectObjection() real-time','Script gerado por IA','Resposta personalizada','Registra histórico','Ajusta abordagem futura'], color:T.violet },
                    ] as const).map(f => (
                      <div key={f.flow} style={{ background:T.card, borderRadius:8, padding:12, border:`1px solid ${f.color}15` }}>
                        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:11, color:f.color, marginBottom:8 }}>{f.flow}</div>
                        {f.steps.map((s, i) => (
                          <div key={i} style={{ display:'flex', gap:6, fontSize:9, color:T.textSoft, marginBottom:3 }}>
                            <span style={{ color:f.color, fontWeight:700, flexShrink:0 }}>{i+1}.</span><span>{s}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════ ANALYTICS ════════════ */}
          {tab === 'analytics' && (
            <div className="tab-content">
              <div style={{ marginBottom:16 }}>
                <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22 }}>Analytics</h1>
                <p style={{ fontSize:10, color:T.textSoft, marginTop:2 }}>CAC · ROI · Velocity × Sentimento × ICP · Pipeline health</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))', gap:10, marginBottom:14 }}>
                <StatCard label="Pipeline Ponderado" value={`R$ ${Math.round(analytics.weightedPipeline/1000)}k`} sub="receita × prob × temp" icon="💰" color={T.gold} trend={18}/>
                <StatCard label="Forecast Mensal"    value={`R$ ${Math.round(analytics.forecastThisMonth/1000)}k`} sub="previsão deste mês" icon="🔮" color={T.emerald}/>
                <StatCard label="Deal Médio"         value={`R$ ${(analytics.avgDealSize/1000).toFixed(0)}k`} sub="comissão/fechamento" icon="📊" color={T.cyan}/>
                <StatCard label="Conversão"          value={`${analytics.conversionRate}%`} sub="lead → proposta" icon="📈" color={T.accent}/>
                <StatCard label="Tempo Médio"        value={`${analytics.avgCloseTime}d`} sub="entrada ao fechamento" icon="⏱" color={T.violet}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, marginBottom:14 }}>💡 CAC + ROI por Canal</div>
                  {analytics.cacBySource.map(({ src, cnt, roi }) => (
                    <div key={src} style={{ marginBottom:10, padding:'8px 10px', background:T.card, borderRadius:7 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                        <div style={{ fontSize:10, fontWeight:700 }}>{(SRC_IC as Record<string,string>)[src]} {(SRC_LB as Record<string,string>)[src]}</div>
                        <div style={{ display:'flex', gap:8 }}>
                          <span style={{ fontSize:9, color:T.textSoft }}>{cnt} leads</span>
                          <span style={{ fontSize:9, fontWeight:700, color:roi>5?T.emerald:roi>0?T.amber:T.rose }}>ROI {roi}x</span>
                        </div>
                      </div>
                      <div style={{ height:3, background:T.border, borderRadius:2 }}>
                        <div style={{ width:`${Math.min((roi/15)*100,100)}%`, height:'100%', background:roi>5?T.emerald:roi>0?T.amber:T.rose, borderRadius:2 }}/>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, marginBottom:14 }}>🌡 Temperatura + Pipeline</div>
                  {([{label:'Hot 🔥',val:analytics.hotLeads,color:T.rose},{label:'Warm ☀️',val:analytics.warmLeads,color:T.amber},{label:'Cold ❄️',val:analytics.coldLeads,color:T.accent}] as const).map(d => (
                    <div key={d.label} style={{ marginBottom:10 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:10, fontWeight:700, color:d.color }}>{d.label}</span>
                        <span style={{ fontSize:10, color:T.textSoft }}>{d.val} ({Math.round(d.val/analytics.totalLeads*100)}%)</span>
                      </div>
                      <div style={{ height:6, background:T.border, borderRadius:3 }}>
                        <div style={{ width:`${(d.val/analytics.totalLeads)*100}%`, height:'100%', background:d.color, borderRadius:3 }}/>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${T.border}` }}>
                    <div style={{ fontSize:10, color:T.textSoft, marginBottom:8 }}>Total: <span style={{ color:T.gold, fontWeight:700 }}>R$ {(analytics.totalRevenuePotential/1000).toFixed(0)}k</span></div>
                    <Sparkline data={sparkData} color={T.gold} width={220} height={36}/>
                  </div>
                </div>
              </div>
              {/* Matriz */}
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, marginBottom:14 }}>📡 Matriz Velocity × Sentimento × ICP</div>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ fontSize:8, color:T.textSoft, textTransform:'uppercase', letterSpacing:1 }}>
                        {['Lead','Einstein','Breeze','Velocity','Sentimento','ICP','Fechar em','Comissão'].map(h => (
                          <th key={h} style={{ padding:'6px 10px', textAlign:h==='Lead'?'left':'center', borderBottom:`1px solid ${T.border}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...leads].sort((a,b) => {
                        const sa = computeEinsteinScore(a)*a.closingProbability*(leadTemperature(computeEinsteinScore(a))==='hot'?1.5:1.0);
                        const sb = computeEinsteinScore(b)*b.closingProbability*(leadTemperature(computeEinsteinScore(b))==='hot'?1.5:1.0);
                        return sb - sa;
                      }).map(l => {
                        const e    = enrichLead(l);
                        const sent = l.sentimentTrend?.[l.sentimentTrend.length-1] ?? 50;
                        return (
                          <tr key={l.id} style={{ fontSize:9, borderBottom:`1px solid ${T.border}10`, cursor:'pointer' }}
                            onClick={() => { setLead(l); setTab('leads'); }}>
                            <td style={{ padding:'8px 10px' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                <Av i={l.avatar} color={(TC as Record<string,string>)[e.derivedTemp]||T.textSoft} size={22}/>
                                <span style={{ fontWeight:700 }}>{l.name}</span>
                              </div>
                            </td>
                            <td style={{ padding:'8px 10px', textAlign:'center' }}><ScoreRing v={e.predictiveScore} size={26}/></td>
                            <td style={{ padding:'8px 10px', textAlign:'center' }}>
                              <span style={{ fontSize:9, fontWeight:700, color:e.breezeScore>70?T.emerald:e.breezeScore>40?T.amber:T.rose }}>{e.breezeScore}</span>
                            </td>
                            <td style={{ padding:'8px 10px', textAlign:'center' }}><VelocityChip v={e.velocity}/></td>
                            <td style={{ padding:'8px 10px', textAlign:'center' }}><SentimentBar score={sent}/></td>
                            <td style={{ padding:'8px 10px', textAlign:'center' }}><ICPBadge score={e.icp}/></td>
                            <td style={{ padding:'8px 10px', textAlign:'center', fontSize:8, color:T.cyan }}>{e.closeDate}</td>
                            <td style={{ padding:'8px 10px', textAlign:'right', color:T.emerald, fontWeight:700 }}>R$ {(l.revenueExpected/1000).toFixed(0)}k</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════════════ FORECAST ════════════ */}
          {tab === 'forecast' && (
            <div className="tab-content">
              <div style={{ marginBottom:16 }}>
                <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22 }}>Forecast IA</h1>
                <p style={{ fontSize:10, color:T.textSoft, marginTop:2 }}>Previsão de receita · Cenários · Revenue Intelligence · Fechamentos por data</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:14 }}>
                {([
                  { label:'🐻 Conservador', sub:'Apenas hot >80%', val:Math.round(analytics.weightedPipeline*0.25/1000), color:T.rose, pct:'25%' },
                  { label:'🎯 Realista',    sub:'Pipeline × 40%',  val:Math.round(analytics.forecastThisMonth/1000),      color:T.amber, pct:'40%' },
                  { label:'🚀 Otimista',    sub:'Pipeline full',   val:Math.round(analytics.weightedPipeline*0.7/1000),   color:T.emerald, pct:'70%' },
                ] as const).map(s => (
                  <div key={s.label} style={{ background:T.surface, border:`1px solid ${s.color}25`, borderRadius:10, padding:16, textAlign:'center' }}>
                    <div style={{ fontSize:11, fontWeight:700, color:s.color, marginBottom:8 }}>{s.label}</div>
                    <div style={{ fontSize:28, fontWeight:900, color:s.color, letterSpacing:'-1px' }}>R$ {s.val}k</div>
                    <div style={{ fontSize:8, color:T.textSoft, marginTop:6 }}>{s.sub}</div>
                    <div style={{ fontSize:9, color:s.color, marginTop:4, fontWeight:700 }}>Confiança: {s.pct}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16, marginBottom:14 }}>
                <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, marginBottom:14 }}>📅 Previsão por Lead</div>
                {[...leads].filter(l => l.closingProbability > 0.3).sort((a,b) => b.closingProbability - a.closingProbability).map(l => {
                  const e = enrichLead(l);
                  return (
                    <div key={l.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px',
                      background:T.card, borderRadius:8, marginBottom:7,
                      border:`1px solid ${e.imminentClose?T.rose:T.border}15` }}>
                      <Av i={l.avatar} color={(TC as Record<string,string>)[e.derivedTemp]||T.textSoft} size={30}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11, fontWeight:700 }}>{l.name}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:3 }}>
                          <ProbBar v={l.closingProbability}/>
                          <span style={{ fontSize:9, color:T.cyan, fontWeight:700, flexShrink:0 }}>{e.closeDate}</span>
                        </div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:12, fontWeight:800, color:T.emerald }}>R$ {(l.revenueExpected/1000).toFixed(0)}k</div>
                        <div style={{ fontSize:8, color:T.textSoft }}>Comissão</div>
                      </div>
                      <VelocityChip v={e.velocity}/>
                    </div>
                  );
                })}
              </div>
              <div style={{ background:T.surface, border:`1px solid ${T.gold}20`, borderRadius:10, padding:16 }}>
                <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:T.gold, marginBottom:10 }}>💰 Revenue Intelligence</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:10 }}>
                  {([
                    { label:'Pipeline Total',   value:`R$ ${(analytics.totalRevenuePotential/1000).toFixed(0)}k`, color:T.gold },
                    { label:'Ponderado',        value:`R$ ${Math.round(analytics.weightedPipeline/1000)}k`,        color:T.accent },
                    { label:'Forecast 30d',     value:`R$ ${Math.round(analytics.forecastThisMonth/1000)}k`,       color:T.emerald },
                    { label:'Ticket Médio',     value:`R$ ${(leads.reduce((s,l)=>s+l.budgetNum,0)/leads.length/1000).toFixed(0)}k`, color:T.cyan },
                    { label:'Leads Ativos',     value:analytics.totalLeads.toString(),                              color:T.violet },
                    { label:'Receita/Lead',     value:`R$ ${Math.round(analytics.avgDealSize/1000)}k`,             color:T.amber },
                  ] as const).map(m => (
                    <div key={m.label} style={{ background:T.card, borderRadius:8, padding:'10px 12px' }}>
                      <div style={{ fontSize:8, color:T.textSoft }}>{m.label}</div>
                      <div style={{ fontSize:18, fontWeight:800, color:m.color, letterSpacing:'-0.5px' }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════ ENGINE ════════════ */}
          {tab === 'engine' && (
            <div className="tab-content">
              <div style={{ marginBottom:16 }}>
                <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:900, fontSize:22 }}>IMOVAI Engine v10</h1>
                <p style={{ fontSize:10, color:T.textSoft, marginTop:2 }}>50+ funções IA · 7 Módulos · TypeScript Puro · Zero recursão · OpenAI-ready · NestJS Backend</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:10, marginBottom:14 }}>
                {([
                  { mod:'2.1', title:'Inteligência Preditiva',      ref:'Salesforce Einstein + HubSpot Breeze', color:T.accent,  fns:['computeEinsteinScore()','computeBreezeScore()','leadTemperature()','behavioralScore()','predictCloseDate()'] },
                  { mod:'2.2', title:'Inteligência Conversacional',  ref:'Gong.io Conversation Intelligence',   color:T.rose,    fns:['detectBuyingIntent()','detectObjection()','objectionCounterscript()','analyzeConversation()'] },
                  { mod:'2.3', title:'Inteligência Comportamental',  ref:'kvCORE + Chime + LionDesk',          color:T.cyan,    fns:['leadReputation()','icpMatch()','dealVelocityScore()','documentStatus()'] },
                  { mod:'2.4', title:'Inteligência Imobiliária',     ref:'Reapit + Propertybase',               color:T.emerald, fns:['propertyScore()','recommendProperties()','calculateInvestmentROI()','getNeighborhoodInsights()','generatePropertyDescription()'] },
                  { mod:'2.5', title:'Next Best Action Engine',      ref:'Salesforce Einstein NBA',             color:T.amber,   fns:['nextBestAction()','alertSystem()','closingAlert()','riskOfLoss()','followupScheduler()','weightedRevenue()'] },
                  { mod:'2.6', title:'Motor de Persuasão',           ref:'SPIN Selling + Challenger + NSTD',   color:T.violet,  fns:['persuasionStyle()','bestContactTime()','followUpMessage()','generateCallScript()','generateVideoScript()'] },
                  { mod:'2.7', title:'Life Event Engine',            ref:'Exclusivo IMOVAI OS',                 color:T.gold,    fns:['lifeEventHint()','lifeEventApproach()'] },
                ] as const).map(m => (
                  <div key={m.mod} style={{ background:T.surface, border:`1px solid ${m.color}20`, borderRadius:10, padding:14 }}>
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
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:16 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, marginBottom:12 }}>🏗 5 Camadas — Arquitetura IMOVAI OS</div>
                  {([
                    { n:1, layer:'Dados Centrais',         items:'Leads · Imóveis · Pipeline · Histórico',     color:T.accent },
                    { n:2, layer:'Inteligência Artificial', items:'7 Módulos · 50+ Funções · Motor Puro',       color:T.violet },
                    { n:3, layer:'Automação',              items:'Sequências · Drip · Webhooks · N8N',         color:T.amber },
                    { n:4, layer:'Comunicação',            items:'WhatsApp · Email · SMS · Omnicanal',          color:T.emerald },
                    { n:5, layer:'Experiência',            items:'Dashboard · Kanban · Chat · Analytics',       color:T.cyan },
                  ] as const).map(l => (
                    <div key={l.n} style={{ display:'flex', gap:8, padding:'8px 10px', background:T.card, borderRadius:7, marginBottom:6, border:`1px solid ${l.color}12` }}>
                      <div style={{ width:20, height:20, borderRadius:5, background:`${l.color}20`, border:`1px solid ${l.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:l.color, flexShrink:0 }}>{l.n}</div>
                      <div>
                        <div style={{ fontSize:10, fontWeight:700, color:l.color }}>{l.layer}</div>
                        <div style={{ fontSize:8, color:T.textSoft }}>{l.items}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background:T.surface, border:`1px solid ${T.gold}20`, borderRadius:10, padding:16 }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:T.gold, marginBottom:12 }}>🗺 Roadmap v10 → v15</div>
                  {([
                    { v:'v11', title:'Agente IA Autônomo',       desc:'WhatsApp que qualifica e agenda sozinho', color:T.accent },
                    { v:'v12', title:'Radar de Investidores',     desc:'Detecta automaticamente quem quer investir', color:T.emerald },
                    { v:'v13', title:'Previsão de Valorização',   desc:'Cruza infraestrutura, demografia e oferta', color:T.cyan },
                    { v:'v14', title:'Copiloto do Corretor',      desc:'Jarvis imobiliário em tempo real', color:T.violet },
                    { v:'v15', title:'Infraestrutura do Mercado', desc:'IMOVAI OS como plataforma B2B nacional', color:T.gold },
                  ] as const).map(r => (
                    <div key={r.v} style={{ background:T.card, borderRadius:8, padding:12, marginBottom:8, border:`1px solid ${r.color}20` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:10, fontWeight:800, color:r.color }}>{r.v}</span>
                        <span style={{ fontSize:8, color:T.textSoft }}>Em desenvolvimento</span>
                      </div>
                      <div style={{ fontSize:10, fontWeight:700, marginBottom:3 }}>{r.title}</div>
                      <div style={{ fontSize:8, color:T.textSoft }}>{r.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
