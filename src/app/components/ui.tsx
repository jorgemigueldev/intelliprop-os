'use client';
// ─────────────────────────────────────────────────────────────────────
// IMOVAI OS v10 — Componentes UI Reutilizáveis
// Design System "Obsidian Luxury"
// ─────────────────────────────────────────────────────────────────────

import { memo, useState } from 'react';
import type { Lead, Property, EnrichedLead, Message, Toast } from '../../lib/types';
import { STAGES, SC, TC } from '../../lib/data';
import {
  enrichLead, computeEinsteinScore, leadTemperature,
  analyzeConversation, objectionCounterscript, detectObjection,
  detectBuyingIntent, followUpMessage, generateCallScript,
  generateVideoScript, calculateInvestmentROI,
} from '../../lib/engine';

// ── Design Tokens ──────────────────────────────────────────────────────
export const T = {
  bg:'#020408', surface:'#070C14', surfaceHover:'#0C1220', card:'#080E1A',
  border:'#0F1A2E', borderLight:'#162440',
  accent:'#3B82F6', accentDim:'#3B82F614',
  emerald:'#10B981', emeraldDim:'#10B98114',
  amber:'#F59E0B', amberDim:'#F59E0B14',
  rose:'#F43F5E', roseDim:'#F43F5E14',
  violet:'#8B5CF6', violetDim:'#8B5CF614',
  cyan:'#06B6D4', cyanDim:'#06B6D414',
  gold:'#EAB308', goldDim:'#EAB30814',
  text:'#F0F6FF', textSoft:'#5A7090', textDim:'#1E2D42',
} as const;

// ── ScoreRing ──────────────────────────────────────────────────────────
export const ScoreRing = memo(({ v, size = 38 }: { v: number; size?: number }) => {
  const r = (size - 6) / 2, circ = 2 * Math.PI * r;
  const dash  = (v / 99) * circ;
  const color = v >= 80 ? T.emerald : v >= 55 ? T.amber : T.rose;
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}20`} strokeWidth={3}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:size < 35 ? 8 : 9, fontWeight:800, color }}>{v}</div>
    </div>
  );
});
ScoreRing.displayName = 'ScoreRing';

// ── Avatar ─────────────────────────────────────────────────────────────
export const Av = memo(({ i, color, size = 36 }: { i: string; color: string; size?: number }) => (
  <div style={{ width:size, height:size, borderRadius:'50%', background:`${color}20`,
    border:`1.5px solid ${color}40`, display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:size*0.3, fontWeight:700, color, letterSpacing:'-0.5px', flexShrink:0 }}>{i}</div>
));
Av.displayName = 'Av';

// ── Pill ───────────────────────────────────────────────────────────────
export const Pill = memo(({ label, color }: { label: string; color: string }) => (
  <span style={{ fontSize:8, padding:'1px 5px', borderRadius:3, background:`${color}14`,
    color, border:`1px solid ${color}25`, fontWeight:600, letterSpacing:0.3, whiteSpace:'nowrap' }}>{label}</span>
));
Pill.displayName = 'Pill';

// ── StatCard ───────────────────────────────────────────────────────────
export const StatCard = memo(({
  label, value, sub, icon, color, trend, onClick,
}: { label: string; value: string; sub: string; icon: string; color: string; trend?: number; onClick?: () => void }) => (
  <div onClick={onClick} style={{ background:T.surface, border:`1px solid ${T.border}`,
    borderRadius:10, padding:'14px 16px', cursor:onClick ? 'pointer' : 'default',
    transition:'all .15s', position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,${color}06,transparent)`, pointerEvents:'none' }}/>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', position:'relative' }}>
      <div>
        <div style={{ fontSize:8, color:T.textSoft, textTransform:'uppercase', letterSpacing:2, marginBottom:8 }}>{label}</div>
        <div style={{ fontSize:20, fontWeight:800, color, letterSpacing:'-0.5px' }}>{value}</div>
        <div style={{ fontSize:9, color:T.textSoft, marginTop:4 }}>{sub}</div>
      </div>
      <div style={{ fontSize:18, opacity:0.5 }}>{icon}</div>
    </div>
    {trend != null && <div style={{ fontSize:9, color:T.emerald, marginTop:8 }}>▲ {trend}% vs mês anterior</div>}
  </div>
));
StatCard.displayName = 'StatCard';

// ── ProbBar ────────────────────────────────────────────────────────────
export const ProbBar = memo(({ v }: { v: number }) => {
  const color = v >= 0.7 ? T.emerald : v >= 0.5 ? T.amber : T.rose;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <div style={{ flex:1, height:4, background:T.border, borderRadius:2, overflow:'hidden' }}>
        <div style={{ width:`${v * 100}%`, height:'100%', background:color, borderRadius:2, transition:'width .3s' }}/>
      </div>
      <span style={{ fontSize:9, fontWeight:700, color, minWidth:28 }}>{Math.round(v * 100)}%</span>
    </div>
  );
});
ProbBar.displayName = 'ProbBar';

// ── NBAChip ────────────────────────────────────────────────────────────
export const NBAChip = memo(({ nba }: { nba: EnrichedLead['nba'] }) => {
  const colors: Record<string, string> = { critical:T.rose, high:T.amber, medium:T.accent, low:T.textSoft };
  const c = colors[nba.priority] || T.textSoft;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 8px',
      background:`${c}12`, border:`1px solid ${c}25`, borderRadius:6 }}>
      <span style={{ fontSize:11 }}>{nba.icon}</span>
      <div>
        <div style={{ fontSize:9, fontWeight:700, color:c }}>{nba.action}</div>
        <div style={{ fontSize:8, color:T.textSoft, marginTop:1 }}>{nba.why}</div>
      </div>
    </div>
  );
});
NBAChip.displayName = 'NBAChip';

// ── Sparkline ──────────────────────────────────────────────────────────
export function Sparkline({ data, color, width = 60, height = 20 }: {
  data: number[]; color: string; width?: number; height?: number;
}) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── SentimentBar ───────────────────────────────────────────────────────
export function SentimentBar({ score }: { score: number }) {
  const color = score > 70 ? T.emerald : score > 40 ? T.amber : T.rose;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
      <div style={{ width:50, height:3, background:T.border, borderRadius:2 }}>
        <div style={{ width:`${score}%`, height:'100%', background:color, borderRadius:2 }}/>
      </div>
      <span style={{ fontSize:8, color }}>{score > 70 ? '😊' : score > 40 ? '😐' : '😟'}</span>
    </div>
  );
}

// ── VelocityChip ───────────────────────────────────────────────────────
export function VelocityChip({ v }: { v: number }) {
  const color = v > 5 ? T.emerald : v > 2 ? T.amber : T.rose;
  const bars  = Math.round((v / 10) * 5);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:3 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ width:3, height:8+i*2, borderRadius:1,
          background:i <= bars ? color : T.border }}/>
      ))}
    </div>
  );
}

// ── ICPBadge ───────────────────────────────────────────────────────────
export function ICPBadge({ score }: { score: number }) {
  const color = score >= 80 ? T.emerald : score >= 50 ? T.amber : T.rose;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:3 }}>
      <span style={{ fontSize:8, color:T.textSoft }}>ICP</span>
      <div style={{ display:'flex', gap:1 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width:4, height:8, borderRadius:1,
            background:score >= (i+1)*25 ? color : T.border }}/>
        ))}
      </div>
    </div>
  );
}

// ── StatusBadge ────────────────────────────────────────────────────────
export function StatusBadge({ status, onChange }: { status: string; onChange: (s: string) => void }) {
  const [open, setOpen] = useState(false);
  const color = (SC as Record<string, string>)[status] || T.textSoft;
  const stage = STAGES.find(s => s.key === status);
  return (
    <div style={{ position:'relative' }}>
      <button onClick={e => { e.stopPropagation(); setOpen(!open); }}
        style={{ display:'flex', alignItems:'center', gap:4, padding:'2px 7px', borderRadius:10,
          border:`1px solid ${color}30`, background:`${color}12`, color, fontSize:8,
          cursor:'pointer', fontFamily:'inherit', fontWeight:700 }}>
        {stage?.icon} {stage?.label || status}
        <span style={{ fontSize:7, opacity:.6 }}>▼</span>
      </button>
      {open && (
        <div style={{ position:'absolute', top:'100%', left:0, zIndex:100, background:T.surface,
          border:`1px solid ${T.border}`, borderRadius:8, padding:4, marginTop:3,
          boxShadow:'0 8px 24px #00000060', minWidth:130 }}
          onClick={e => e.stopPropagation()}>
          {STAGES.map(s => (
            <button key={s.key} onClick={() => { onChange(s.key); setOpen(false); }}
              style={{ width:'100%', textAlign:'left', padding:'5px 9px', borderRadius:5,
                border:'none', background:status===s.key?`${s.color}15`:'transparent',
                color:s.color, fontSize:9, cursor:'pointer', fontFamily:'inherit',
                fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ToastContainer ─────────────────────────────────────────────────────
export function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div style={{ position:'fixed', bottom:20, right:20, zIndex:9999,
      display:'flex', flexDirection:'column', gap:8, pointerEvents:'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background:T.surface, border:`1px solid ${t.color}30`,
          borderRadius:10, padding:'10px 14px', minWidth:240, maxWidth:300,
          boxShadow:`0 4px 20px #00000070,0 0 0 1px ${t.color}15`,
          animation:'toastIn .2s ease', pointerEvents:'all',
          display:'flex', alignItems:'flex-start', gap:8 }}>
          <div style={{ width:3, height:36, borderRadius:2, background:t.color, flexShrink:0, marginTop:2 }}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, fontWeight:700, color:t.color }}>{t.title}</div>
            <div style={{ fontSize:9, color:T.textSoft, marginTop:2 }}>{t.msg}</div>
          </div>
          <button onClick={() => onDismiss(t.id)}
            style={{ background:'none', border:'none', color:T.textSoft, cursor:'pointer', fontSize:11 }}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ── ScriptModal ────────────────────────────────────────────────────────
export function ScriptModal({ lead, type, onClose }: {
  lead: Lead; type: 'call' | 'video'; onClose: () => void;
}) {
  const callScript  = generateCallScript(lead);
  const videoScript = generateVideoScript(lead);
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', zIndex:200,
      display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={onClose}>
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14,
        padding:24, maxWidth:520, width:'90%', maxHeight:'85vh', overflowY:'auto' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:15,
            color:type==='call'?T.rose:T.violet }}>
            {type==='call'?'📞 Script de Ligação':'🎬 Script de Vídeo'} — {lead.name}
          </span>
          <button onClick={onClose}
            style={{ background:'none', border:'none', color:T.textSoft, cursor:'pointer', fontSize:16 }}>✕</button>
        </div>

        {type === 'call' ? (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {([
              ['🎯 Abertura', callScript.abertura, T.accent],
              ['❓ Qualificação', callScript.qualificacao, T.violet],
              ['💡 Proposta', callScript.proposta, T.emerald],
              ['🤝 Fechamento', callScript.fechamento, T.gold],
            ] as [string, string, string][]).map(([label, text, color]) => (
              <div key={label} style={{ background:T.card, borderRadius:8, padding:12, border:`1px solid ${color}20` }}>
                <div style={{ fontSize:9, color, fontWeight:700, marginBottom:6 }}>{label}</div>
                <div style={{ fontSize:10, color:T.textSoft, lineHeight:1.6 }}>{text}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {([
              ['🪝 Hook (0–5s)',       videoScript.hook,      T.rose],
              ['😟 Problema (5–20s)',  videoScript.problema,  T.amber],
              ['✅ Solução (20–45s)',  videoScript.solucao,   T.emerald],
              ['📲 CTA (45–60s)',      videoScript.cta,       T.accent],
            ] as [string, string, string][]).map(([label, text, color]) => (
              <div key={label} style={{ background:T.card, borderRadius:8, padding:12, border:`1px solid ${color}20` }}>
                <div style={{ fontSize:9, color, fontWeight:700, marginBottom:6 }}>{label}</div>
                <div style={{ fontSize:10, color:T.textSoft, lineHeight:1.6 }}>{text}</div>
              </div>
            ))}
            <div style={{ background:T.card, borderRadius:8, padding:12, border:`1px solid ${T.violet}20` }}>
              <div style={{ fontSize:9, color:T.violet, fontWeight:700, marginBottom:6 }}>#️⃣ Hashtags</div>
              <div style={{ fontSize:9, color:T.textSoft }}>{videoScript.hashtags}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── LeadRow ────────────────────────────────────────────────────────────
export const LeadRow = memo(function LeadRow({
  l, selected, onClick, onStatusChange,
}: { l: Lead; selected: boolean; onClick: () => void; onStatusChange: (id: number, s: string) => void }) {
  const e = enrichLead(l);
  const tc = (TC as Record<string, string>)[e.derivedTemp] || T.textSoft;
  return (
    <div onClick={onClick} style={{
      display:'grid', gridTemplateColumns:'2.2fr 0.9fr 1fr 60px 50px 55px',
      padding:'10px 16px', borderBottom:`1px solid ${T.border}15`, alignItems:'center',
      cursor:'pointer', transition:'all .15s',
      background:selected?`${T.accent}08`:'transparent',
      borderLeft:selected?`2px solid ${T.accent}`:'2px solid transparent',
      boxShadow:e.imminentClose?`inset 0 0 0 1px ${T.rose}15`:'none',
      position:'relative',
    }}>
      {l.lifeEvent && <div style={{ position:'absolute', top:8, right:16, width:5, height:5,
        borderRadius:'50%', background:T.violet, boxShadow:`0 0 6px ${T.violet}` }}/>}
      {e.imminentClose && <div style={{ position:'absolute', top:8, left:16, width:5, height:5,
        borderRadius:'50%', background:T.rose, animation:'pulse 1s infinite' }}/>}

      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ position:'relative' }}>
          <Av i={l.avatar} color={tc}/>
          {e.derivedTemp==='hot' && <div style={{ position:'absolute', inset:-2, borderRadius:'50%',
            boxShadow:`0 0 8px ${T.rose}40`, pointerEvents:'none' }}/>}
        </div>
        <div>
          <div style={{ fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:4, flexWrap:'wrap' }}>
            {l.name}
            {l.paused && <Pill label="HUMANO" color={T.violet}/>}
            {e.imminentClose && <Pill label="🚨 FECHAR" color={T.rose}/>}
            {e.risk==='alto' && <Pill label="⚠️ RISCO" color={T.amber}/>}
          </div>
          <div style={{ fontSize:9, color:T.textSoft, marginTop:2, display:'flex', alignItems:'center', gap:6 }}>
            <span>{l.lastMsg}</span>
            <SentimentBar score={l.sentimentTrend?.[l.sentimentTrend.length-1] ?? 50}/>
          </div>
        </div>
      </div>

      <div style={{ fontSize:11, color:T.emerald, fontWeight:700 }}>{l.budget}</div>
      <div onClick={ev => ev.stopPropagation()}>
        <StatusBadge status={l.status} onChange={s => onStatusChange(l.id, s)}/>
      </div>
      <div style={{ display:'flex', justifyContent:'center' }}><ScoreRing v={e.predictiveScore} size={34}/></div>
      <div style={{ display:'flex', justifyContent:'center' }}><VelocityChip v={e.velocity}/></div>
      <div style={{ textAlign:'center', fontSize:10, fontWeight:800,
        color:e.prob>=0.7?T.emerald:e.prob>=0.5?T.amber:T.textSoft }}>
        {Math.round(e.prob*100)}%
      </div>
    </div>
  );
});
