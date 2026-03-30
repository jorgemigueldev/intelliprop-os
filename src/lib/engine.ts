// ═══════════════════════════════════════════════════════════════════════
//  IMOVAI ENGINE v10.0 — 50+ Funções de IA · TypeScript Puro
//  Zero recursão · Testável · OpenAI-ready · NestJS-ready
//  Baseado em: Salesforce Einstein · HubSpot Breeze · Gong.io ·
//  Reapit · Follow Up Boss · LionDesk · kvCORE · Propertybase
// ═══════════════════════════════════════════════════════════════════════

import type {
  Lead, Property, Message, EnrichedLead, AnalyticsData,
  Temperature, NBAResult, AlertResult, FollowupResult,
  ReputationResult, ROIResult, NeighborhoodInsights,
  CallScript, VideoScript, ConversationAnalysis,
} from './types';

import { PROPERTIES } from './data';

// ─────────────────────────────────────────────────────────────────────
// MÓDULO 2.1 — INTELIGÊNCIA PREDITIVA
// Salesforce Einstein + HubSpot Breeze
// ─────────────────────────────────────────────────────────────────────

export function computeEinsteinScore(lead: Lead): number {
  let score = lead.score || 0;
  if (lead.budgetNum > 500000)      score += 25;
  else if (lead.budgetNum > 300000) score += 15;
  else if (lead.budgetNum > 150000) score += 8;
  else                              score += 3;

  score += Math.min((lead.behavioralData?.siteVisits || 0) * 2, 12);
  score += Math.min((lead.behavioralData?.linkClicks || 0) * 3, 15);
  if ((lead.behavioralData?.emailOpenRate || 0) > 0.8) score += 12;

  if (lead.visitScheduled)                             score += 30;
  if (lead.partnerMentioned)                           score += 12;
  if (lead.fundingSimulated)                           score += 20;
  if (lead.intent === 'investimento')                  score += 10;
  if (lead.lifeEvent)                                  score += 15;
  if ((lead.memory?.offersMade?.length || 0) > 0)     score += 25;

  return Math.min(Math.round(score), 99);
}

export function computeBreezeScore(lead: Lead): number {
  const hoursElapsed = (Date.now() - (lead.lastMsgTs || Date.now())) / 3600000;
  const recency      = Math.max(0, 40 - hoursElapsed * 0.5);
  const engagement   = (
    (lead.behavioralData?.emailOpenRate || 0) * 20 +
    Math.min((lead.behavioralData?.linkClicks || 0) * 3, 15) +
    Math.min((lead.behavioralData?.siteVisits || 0) * 3, 15)
  );
  const fit = (
    (lead.visitScheduled   ? 15 : 0) +
    (lead.fundingSimulated ? 10 : 0) +
    (lead.partnerMentioned ?  5 : 0)
  );
  return Math.min(99, Math.round(recency + engagement + fit));
}

export function leadTemperature(score: number): Temperature {
  if (score >= 85) return 'hot';
  if (score >= 55) return 'warm';
  return 'cold';
}

export function behavioralScore(data: Lead['behavioralData']): number {
  if (!data) return 0;
  return Math.min(Math.round(
    (data.emailOpenRate || 0) * 30 +
    (data.linkClicks    || 0) * 4 +
    (data.siteVisits    || 0) * 5 +
    Math.min((data.averageTimeOnSite || 0) / 30, 15)
  ), 99);
}

export function predictCloseDate(lead: Lead): string {
  const score = computeEinsteinScore(lead);
  const temp  = leadTemperature(score);
  if (lead.closingProbability > 0.85 && temp === 'hot')  return '3–5 dias';
  if (lead.closingProbability > 0.65 && temp === 'warm') return '7–14 dias';
  if (lead.closingProbability > 0.40)                    return '15–30 dias';
  return '+60 dias';
}

// ─────────────────────────────────────────────────────────────────────
// MÓDULO 2.2 — INTELIGÊNCIA CONVERSACIONAL
// Gong.io Conversation Intelligence
// ─────────────────────────────────────────────────────────────────────

const INTENT_SIGNALS = [
  'quando posso visitar','quero agendar','vou comprar','fechar semana',
  'minha esposa adorou','gostamos muito','quando assinar','como é o contrato',
  'quero fechar','data de entrega','quero comprar','tenho o dinheiro',
  'posso financiar','aprovado no banco','tenho entrada','aceito a proposta',
  'mande o contrato','pode preparar','vamos fechar','quanto dá a parcela',
  'prefiro esse','já decidi','é exatamente o que','vamos marcar',
];

export function detectBuyingIntent(text: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  return INTENT_SIGNALS.some(s => t.includes(s));
}

const OBJECTION_PATTERNS: Record<string, string[]> = {
  preço:         ['caro','preço alto','além do orçamento','não tenho esse valor','muito caro','não cabe no bolso'],
  prazo:         ['muito longe','prazo longo','demorando','não quero esperar','entrega distante'],
  localização:   ['longe','localização','fica longe','muito distante','não conheço a região'],
  financiamento: ['banco não aprovou','financiamento','crédito','score baixo','juros altos'],
  tamanho:       ['muito pequeno','espaço','m²','área pequena','apertado','não cabe'],
  duvida:        ['preciso pensar','ver outras opções','não tenho certeza','vou analisar'],
  concorrente:   ['outro corretor','outra imobiliária','achei mais barato','vi num portal'],
  documentação:  ['documentação','escritura','matrícula','regularização','IPTU atrasado'],
  condominio:    ['condomínio muito alto','taxa de condomínio','muita taxa'],
};

export function detectObjection(text: string): string | null {
  if (!text) return null;
  const t = text.toLowerCase();
  for (const [type, patterns] of Object.entries(OBJECTION_PATTERNS)) {
    if (patterns.some(p => t.includes(p))) return type;
  }
  return null;
}

const COUNTER_SCRIPTS: Record<string, (l: Lead) => string> = {
  preço:        l => l.intent === 'investimento'
    ? `Entendo! Esse imóvel gera yield até 13% ao ano — em 8 anos você recupera 100% do valor. Posso mostrar a simulação?`
    : `Com entrada de ${l.entry} e financiamento CEF, a parcela fica abaixo de 30% da sua renda. Posso simular agora?`,
  prazo:        () => `Tenho imóveis prontos para morar que atendem melhor. Posso mostrar?`,
  localização:  () => `Posso mostrar o mapa de acesso — a maioria dos clientes se surpreende com a proximidade a serviços.`,
  financiamento: l => `Trabalhamos com correspondentes que aprovam mesmo com score mais baixo. Posso agendar pré-análise gratuita para ${l.name.split(' ')[0]}?`,
  tamanho:      () => `Esse imóvel tem planta inteligente — na visita parece muito maior. Posso mostrar o tour virtual?`,
  duvida:       l => `Natural analisar bem! Posso deixar a proposta por escrito para ${l.name.split(' ')[0]}?`,
  concorrente:  () => `Posso preparar comparação detalhada. O que mais importa na decisão — localização, preço ou rentabilidade?`,
  documentação: () => `Toda a documentação está 100% regularizada. Posso enviar a matrícula atualizada imediatamente.`,
  condominio:   () => `O condomínio inclui piscina, segurança 24h e lazer completo. Por m², é muito competitivo para a região.`,
};

export function objectionCounterscript(objection: string, lead: Lead): string {
  const fn = COUNTER_SCRIPTS[objection];
  return fn ? fn(lead) : `Entendo sua preocupação. Posso ajudar a encontrar a melhor solução para ${lead.name.split(' ')[0]}.`;
}

export function analyzeConversation(messages: Message[]): ConversationAnalysis {
  if (!messages?.length) return { score:50, trend:'neutro', label:'Neutro', talkRatio:'1.0', buyingSignals:0, objections:0, engagement:'baixo' };
  const clientMsgs = messages.filter(m => m.from === 'client');
  const agentMsgs  = messages.filter(m => ['agent','ai'].includes(m.from));
  const sentMap: Record<string, number> = { muito_positivo:100, positivo:75, neutro:50, negativo:20 };
  const scores = clientMsgs.map(m => sentMap[m.sentiment] ?? 50);
  const avg    = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 50;
  return {
    score:         avg,
    trend:         avg > 70 ? 'positivo' : avg > 40 ? 'neutro' : 'negativo',
    label:         avg > 70 ? 'Positivo' : avg > 40 ? 'Neutro' : 'Negativo',
    talkRatio:     (clientMsgs.length / Math.max(agentMsgs.length, 1)).toFixed(1),
    buyingSignals: clientMsgs.filter(m => detectBuyingIntent(m.text)).length,
    objections:    clientMsgs.filter(m => !!detectObjection(m.text)).length,
    engagement:    clientMsgs.length > 3 ? 'alto' : clientMsgs.length > 1 ? 'médio' : 'baixo',
  };
}

// ─────────────────────────────────────────────────────────────────────
// MÓDULO 2.3 — INTELIGÊNCIA COMPORTAMENTAL
// kvCORE + Chime + LionDesk
// ─────────────────────────────────────────────────────────────────────

export function leadReputation(lead: Lead): ReputationResult {
  const e      = lead.behavioralData?.emailOpenRate || 0;
  const clicks = lead.behavioralData?.linkClicks    || 0;
  const visits = lead.behavioralData?.siteVisits    || 0;
  if (e > 0.8 && clicks > 8) return { label:'Altamente Engajado', color:'#10B981', score:95 };
  if (e > 0.5 || clicks > 4) return { label:'Engajado',           color:'#F59E0B', score:70 };
  if (visits > 0)             return { label:'Explorando',         color:'#3B82F6', score:40 };
  return                             { label:'Frio',               color:'#5A7090', score:15 };
}

export function icpMatch(lead: Lead): number {
  let score = 0;
  if (lead.budgetNum > 250000)                              score += 25;
  if (lead.intent === 'investimento')                       score += 20;
  if ((lead.behavioralData?.siteVisits || 0) > 3)          score += 20;
  if (lead.visitScheduled)                                  score += 20;
  if (lead.source === 'indicacao')                          score += 15;
  return Math.min(score, 100);
}

export function documentStatus(lead: Lead): { icon: string; label: string; color: string } | null {
  if (!lead.documents?.length) return null;
  const opened = lead.documents.find(d => d.status?.includes('x'));
  if (opened) return { icon:'👁', label:`Proposta aberta ${opened.status}`, color:'#10B981' };
  const sent  = lead.documents.find(d => d.status === 'enviado');
  if (sent)   return { icon:'📄', label:'Documentos enviados',              color:'#3B82F6' };
  return null;
}

// ─────────────────────────────────────────────────────────────────────
// MÓDULO 2.4 — INTELIGÊNCIA IMOBILIÁRIA
// Reapit + Propertybase
// ─────────────────────────────────────────────────────────────────────

export function propertyScore(lead: Lead, property: Property): number {
  let score = 0;
  if (lead.budgetNum >= property.price)           score += 30;
  else if (lead.budgetNum >= property.price*0.90) score += 15;
  if (lead.propertyType === property.type)        score += 25;
  if (lead.location === property.city)            score += 20;
  if (lead.intent === 'investimento' && property.airbnb) score += 15;
  if (property.yield > 10)                        score += 10;
  if ((lead.memory?.propertiesViewed || []).includes(property.code)) score += 15;
  if (property.status === 'disponível')           score += 5;
  return score;
}

export function recommendProperties(lead: Lead, limit = 3): (Property & { matchScore: number })[] {
  return [...PROPERTIES]
    .map(p => ({ ...p, matchScore: propertyScore(lead, p) }))
    .filter(p => p.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

export function calculateInvestmentROI(property: Property): ROIResult | null {
  if (!property || property.yield === 0) return null;
  const annualRent  = property.price * (property.yield / 100);
  const annualCost  = (property.condo || 0) * 12 + (property.iptu || 0);
  const netIncome   = annualRent - annualCost;
  return {
    grossYield:   property.yield.toFixed(1),
    netYield:     ((netIncome / property.price) * 100).toFixed(1),
    monthlyRent:  Math.round(annualRent / 12),
    paybackYears: (property.price / Math.max(netIncome, 1)).toFixed(1),
    rating:       property.yield > 10 ? 'EXCELENTE' : property.yield > 7 ? 'BOM' : 'REGULAR',
  };
}

const NEIGHBORHOOD_DB: Record<string, NeighborhoodInsights> = {
  'Balneário Piçarras': { appreciation12m:12.3, appreciation24m:25.8, avgM2:8500,  demandScore:92, airbnbOccupancy:78 },
  'Penha':              { appreciation12m:8.7,  appreciation24m:18.2, avgM2:6200,  demandScore:78, airbnbOccupancy:65 },
  'Navegantes':         { appreciation12m:15.2, appreciation24m:32.5, avgM2:7500,  demandScore:95, airbnbOccupancy:82 },
  'Barra Velha':        { appreciation12m:9.1,  appreciation24m:19.3, avgM2:7100,  demandScore:82, airbnbOccupancy:70 },
  'Balneário Camboriú': { appreciation12m:18.5, appreciation24m:41.2, avgM2:18000, demandScore:99, airbnbOccupancy:91 },
  'Itapoá':             { appreciation12m:22.1, appreciation24m:48.3, avgM2:5200,  demandScore:88, airbnbOccupancy:85 },
};

export function getNeighborhoodInsights(city: string): NeighborhoodInsights {
  return NEIGHBORHOOD_DB[city] || { appreciation12m:10, appreciation24m:21, avgM2:7000, demandScore:70, airbnbOccupancy:65 };
}

export function generatePropertyDescription(property: Property, mode: 'vendas' | 'profissional' = 'vendas'): string {
  if (!property) return '';
  if (mode === 'profissional') {
    return `${property.title} | ${property.city}\n${property.area}m² · ${property.bedrooms > 0 ? `${property.bedrooms} dorm` : 'Studio'} · ${property.beach} do mar${property.airbnb ? ` · Airbnb ${property.yield}% a.a.` : ''}\nR$ ${(property.price/1000).toFixed(0)}k · Comissão R$ ${(property.commission/1000).toFixed(0)}k\n${property.highlight}`;
  }
  return `🏖 ${property.title}\n\n✅ ${property.area}m² | ${property.bedrooms > 0 ? `${property.bedrooms} dorms` : 'Studio'}\n📍 ${property.city} · ${property.beach} da praia\n💰 R$ ${(property.price/1000).toFixed(0)}k${property.airbnb ? `\n📊 Yield Airbnb: ${property.yield}% ao ano` : ''}\n⭐ ${property.highlight}\n\n📞 Jorge Miguel: (47) 98916-0113`;
}

// ─────────────────────────────────────────────────────────────────────
// MÓDULO 2.5 — NEXT BEST ACTION ENGINE
// Salesforce Einstein NBA
// ─────────────────────────────────────────────────────────────────────

export function weightedRevenue(lead: Lead): number {
  const temp  = leadTemperature(computeEinsteinScore(lead));
  const boost = temp === 'hot' ? 1.2 : temp === 'warm' ? 1.0 : 0.7;
  return Math.round((lead.revenueExpected || 0) * (lead.closingProbability || 0.2) * boost);
}

export function riskOfLoss(lead: Lead): 'alto' | 'médio' | 'baixo' {
  const elapsed = (Date.now() - (lead.lastMsgTs || Date.now())) / 3600000;
  const temp    = leadTemperature(computeEinsteinScore(lead));
  if (temp === 'hot'  && elapsed > 24)  return 'alto';
  if (temp === 'warm' && elapsed > 72)  return 'alto';
  if (temp === 'cold' && elapsed > 168) return 'alto';
  if (elapsed > 48)                     return 'médio';
  return 'baixo';
}

export function closingAlert(lead: Lead): boolean {
  return lead.closingProbability > 0.80 && leadTemperature(computeEinsteinScore(lead)) === 'hot';
}

export function followupScheduler(lead: Lead): FollowupResult | null {
  const temp  = leadTemperature(computeEinsteinScore(lead));
  const hours = (Date.now() - (lead.lastMsgTs || Date.now())) / 3600000;
  if (hours > 120 && temp === 'cold') return { type:'reativacao', urgency:'critical', msg:`Reativação urgente — ${Math.round(hours/24)}d sem resposta` };
  if (hours > 24  && temp === 'hot')  return { type:'urgente',    urgency:'critical', msg:'Lead quente esfriando — contato IMEDIATO' };
  if (hours > 48  && temp === 'warm') return { type:'nutricao',   urgency:'high',     msg:'Enviar conteúdo relevante hoje' };
  if (hours > 72  && temp === 'cold') return { type:'reativacao', urgency:'medium',   msg:'Sequência de reativação automática' };
  return null;
}

export function nextBestAction(lead: Lead): NBAResult {
  const score   = computeEinsteinScore(lead);
  const temp    = leadTemperature(score);
  const elapsed = (Date.now() - (lead.lastMsgTs || Date.now())) / 3600000;
  const prob    = lead.closingProbability;

  if (prob > 0.85 && temp === 'hot')
    return { priority:'critical', action:'📞 LIGAR AGORA',          why:`${Math.round(prob*100)}% fechamento · Janela crítica`,           urgency:'immediate', icon:'🚨' };
  if (temp === 'hot' && elapsed > 24)
    return { priority:'high',     action:'📲 WhatsApp urgente',      why:'Lead quente sem resposta +24h — risco de perda',                 urgency:'today',     icon:'⚠️' };
  if ((lead.memory?.offersMade?.length||0) > 0 && elapsed < 48)
    return { priority:'high',     action:'📞 Follow-up proposta',    why:'Proposta enviada — momento ideal para follow-up',                urgency:'today',     icon:'📄' };
  if (lead.visitScheduled && temp === 'warm')
    return { priority:'medium',   action:'📅 Confirmar visita',      why:'Visita agendada — confirmar +24h aumenta show rate 42%',         urgency:'tomorrow',  icon:'🏠' };
  if (temp === 'warm' && elapsed > 48)
    return { priority:'medium',   action:'📧 Nutrição personalizada', why:'Warm lead em silêncio — reengajamento com conteúdo relevante',  urgency:'this_week', icon:'💌' };
  if (lead.lifeEvent)
    return { priority:'medium',   action:'🔔 Abordagem empática',    why:`Life event: ${lead.lifeEvent}`,                                  urgency:'this_week', icon:'🔔' };
  return   { priority:'low',      action:'💬 Qualificação ativa',    why:'Lead em fase inicial — aprofundar qualificação',                 urgency:'when_possible', icon:'💬' };
}

export function alertSystem(lead: Lead): AlertResult | null {
  if (closingAlert(lead))          return { type:'imminent', label:'🚨 FECHAR AGORA',      color:'#F43F5E' };
  if (riskOfLoss(lead) === 'alto') return { type:'risk',     label:'⚠️ RISCO DE PERDA',    color:'#F59E0B' };
  if (lead.lifeEvent)              return { type:'life',     label:'🔔 LIFE EVENT',         color:'#8B5CF6' };
  const fs = followupScheduler(lead);
  if (fs?.urgency === 'critical')  return { type:'followup', label:'📅 FOLLOW-UP CRÍTICO', color:'#F59E0B' };
  return null;
}

// ─────────────────────────────────────────────────────────────────────
// MÓDULO 2.6 — MOTOR DE PERSUASÃO
// SPIN Selling + Challenger Sale + Never Split the Difference
// ─────────────────────────────────────────────────────────────────────

export function persuasionStyle(lead: Lead): string {
  if (lead.intent === 'investimento' && lead.budgetNum > 300000) return 'ROI';
  if (lead.lifeEvent)                                            return 'empatia';
  if (lead.budgetNum > 450000)                                   return 'exclusividade';
  if (lead.partnerMentioned)                                     return 'casal';
  return 'prático';
}

export function bestContactTime(lead: Lead): string {
  const ch = lead.behavioralData?.preferredChannels || [];
  if (ch.includes('email'))     return '9h–11h (email) · 19h–21h (WhatsApp)';
  if (ch.includes('phone'))     return '10h–12h · 17h–19h (ligação)';
  if (ch.includes('instagram')) return '19h–22h (Instagram/WhatsApp)';
  return '18h–21h (WhatsApp)';
}

export function followUpMessage(lead: Lead): string {
  const name  = lead.name.split(' ')[0];
  const style = persuasionStyle(lead);
  if (lead.lifeEvent?.includes('Divórcio'))   return `Oi ${name}! 💙 Pensei em você — encontrei um imóvel perfeito para esse novo começo. Posso te mostrar?`;
  if (lead.lifeEvent?.includes('emprego'))    return `Oi ${name}! Parabéns pela nova fase! Com sua nova renda, você se qualifica para opções ainda melhores. Posso atualizar sua simulação?`;
  if (lead.lifeEvent?.includes('patrimônio')) return `Oi ${name}! Com o aumento do seu patrimônio, tenho uma oportunidade exclusiva que se encaixa perfeitamente. Podemos conversar?`;
  if (lead.lifeEvent?.includes('empresa'))    return `${name}, sei que você encerrou um grande ciclo. Tenho um investimento imobiliário de alto rendimento para te apresentar. 5 minutos?`;
  if (lead.intent === 'investimento')         return `Oi ${name}! Novo imóvel com yield 13,2% em Airbnb acabou de entrar. Sei que você valoriza rentabilidade — posso enviar os números?`;
  if (style === 'exclusividade')              return `${name}, tenho um imóvel exclusivo que se encaixa perfeitamente. Tenho apenas uma janela hoje — posso reservar 15 min?`;
  if (style === 'casal')                      return `Oi ${name}! Lembrei de vocês e encontrei uma opção perfeita para a família. Posso enviar as fotos?`;
  return `Oi ${name}! 👋 Tenho novidades que podem te interessar muito. Podemos conversar rapidinho?`;
}

export function generateCallScript(lead: Lead): CallScript {
  const name  = lead.name.split(' ')[0];
  const style = persuasionStyle(lead);
  const nba   = nextBestAction(lead);
  return {
    abertura:     `Oi ${name}, tudo bem? Aqui é o Jorge Miguel Imóveis. Estou ligando porque ${nba.why.toLowerCase()}.`,
    qualificacao: `Você ainda está procurando ${lead.propertyType?.toLowerCase() || 'imóvel'} em ${lead.location}? Sua preferência ainda é ${lead.intent === 'investimento' ? 'investimento com rentabilidade' : 'moradia própria'}?`,
    proposta:     style === 'ROI'
      ? `Tenho um imóvel com yield de 12% ao ano em Airbnb — R$ ${Math.round((lead.budgetNum||300000)*0.12/1000)}k/ano de renda passiva. Posso enviar a simulação?`
      : style === 'exclusividade'
      ? `Tenho uma oportunidade exclusiva que acabou de entrar. Poucos corretores têm acesso. Posso apresentar hoje?`
      : `Encontrei uma opção que se encaixa no que você busca — ${lead.budget}, na região de ${lead.location}. Posso enviar as fotos?`,
    fechamento:   `Quando seria o melhor momento para fazermos uma visita? Tenho disponibilidade ${lead.visitScheduled ? 'para confirmação' : 'ainda esta semana'}.`,
  };
}

export function generateVideoScript(lead: Lead): VideoScript {
  const name = lead.name.split(' ')[0];
  const recs  = recommendProperties(lead, 1);
  const prop  = recs[0];
  return {
    hook:      `${name}, em 60 segundos vou te mostrar ${lead.intent === 'investimento' ? 'como gerar renda passiva com imóvel' : 'o lar perfeito para você e sua família'}.`,
    problema:  `Muita gente passa meses procurando sem encontrar o imóvel ideal por falta de critérios claros. Já ajudei mais de 200 famílias em Santa Catarina.`,
    solucao:   prop
      ? `Esse é o ${prop.title}, em ${prop.city}, a ${prop.beach} da praia.${prop.airbnb ? ` Yield de ${prop.yield}% ao ano em Airbnb.` : ''} R$ ${(prop.price/1000).toFixed(0)}k.`
      : `Temos opções exclusivas em ${lead.location} a partir de ${lead.budget}.`,
    cta:       `Me chama no WhatsApp agora: (47) 98916-0113. Agenda a visita e garante as condições especiais de lançamento.`,
    hashtags:  `#ImóveisLitoralSC #${(lead.location||'LitoralSC').replace(/\s/g,'')} #JorgeMiguelImóveis #${lead.intent==='investimento'?'InvestimentoImobiliário':'PrimeiroImóvel'}`,
  };
}

export function generateNewsletterContent(lead: Lead): string {
  const name     = lead.name.split(' ')[0];
  const insights = getNeighborhoodInsights(lead.location);
  return `Oi ${name}! Separei 3 informações sobre ${lead.location} que podem te interessar:\n\n📈 Valorização 12 meses: +${insights.appreciation12m}%\n🏖 Ocupação Airbnb: ${insights.airbnbOccupancy}%\n💰 Média m²: R$ ${insights.avgM2.toLocaleString()}\n\nEncontre sua oportunidade: (47) 98916-0113`;
}

// ─────────────────────────────────────────────────────────────────────
// MÓDULO 2.7 — LIFE EVENT ENGINE (Exclusivo IMOVAI)
// ─────────────────────────────────────────────────────────────────────

export function lifeEventHint(event: string | null): string | null {
  if (!event) return null;
  const ev = event.toLowerCase();
  if (ev.includes('emprego'))    return '💼 Nova renda = novo poder de compra. Atualizar simulação AGORA.';
  if (ev.includes('divórcio'))   return '💙 Momento de reconstrução. Prioridade = novo lar. Linguagem acolhedora.';
  if (ev.includes('patrimônio')) return '💰 Aumento de patrimônio = maior ticket. Apresentar opções premium.';
  if (ev.includes('empresa'))    return '🚀 Capital liberado = investidor prime. Foco em portfolio e ROI.';
  if (ev.includes('filho') || ev.includes('bebê')) return '👶 Expansão familiar = necessidade de espaço. Focar 2+ dorms.';
  return '🔔 Life event detectado — personalizar abordagem imediatamente.';
}

export function lifeEventApproach(lead: Lead): string {
  const name = lead.name.split(' ')[0];
  if (!lead.lifeEvent) return followUpMessage(lead);
  if (lead.lifeEvent.includes('Divórcio'))   return `Oi ${name} 💙 Sei que recomeços exigem coragem. Encontrei um imóvel que pode ser o novo capítulo da sua história.`;
  if (lead.lifeEvent.includes('emprego'))    return `Oi ${name}! Essa mudança de carreira abre novas possibilidades. Atualizei sua simulação com a nova renda. Posso enviar?`;
  if (lead.lifeEvent.includes('patrimônio')) return `${name}, com esse crescimento você se qualifica para oportunidades exclusivas. Tenho algo específico para você.`;
  if (lead.lifeEvent.includes('empresa'))    return `${name}, parabéns pelo grande passo! Capital em imóvel de alto padrão é a decisão mais inteligente agora.`;
  return followUpMessage(lead);
}

// ─────────────────────────────────────────────────────────────────────
// ANALYTICS ENGINE
// Salesforce + HubSpot Revenue Analytics
// ─────────────────────────────────────────────────────────────────────

export function analyticsEngine(leads: Lead[]): AnalyticsData {
  const inPipeline = leads.filter(l => !['fechado','perdido'].includes(l.status));
  const weighted   = inPipeline.reduce((sum, l) => {
    const temp  = leadTemperature(computeEinsteinScore(l));
    const boost = temp === 'hot' ? 1.2 : temp === 'warm' ? 1.0 : 0.7;
    return sum + l.revenueExpected * l.closingProbability * boost;
  }, 0);
  const cacBySource = ['instagram','google','indicacao','trafego_pago','organico'].map(src => {
    const group = leads.filter(l => l.source === src);
    const rev   = group.filter(l => l.status === 'fechado').reduce((s,l) => s + l.revenueExpected, 0);
    return { src, cnt:group.length, revenue:rev, roi:group.length > 0 ? Math.round(rev / (group.length * 80)) : 0 };
  }).filter(s => s.cnt > 0);
  return {
    weightedPipeline:      Math.round(weighted),
    avgDealSize:           inPipeline.length > 0 ? Math.round(inPipeline.reduce((s,l)=>s+l.revenueExpected,0)/inPipeline.length) : 0,
    conversionRate:        Math.round((leads.filter(l=>['proposta','fechado'].includes(l.status)).length / leads.length) * 100),
    avgCloseTime:          18,
    cacBySource,
    totalLeads:            leads.length,
    hotLeads:              leads.filter(l=>leadTemperature(computeEinsteinScore(l))==='hot').length,
    warmLeads:             leads.filter(l=>leadTemperature(computeEinsteinScore(l))==='warm').length,
    coldLeads:             leads.filter(l=>leadTemperature(computeEinsteinScore(l))==='cold').length,
    totalRevenuePotential: leads.reduce((s,l)=>s+l.revenueExpected,0),
    forecastThisMonth:     Math.round(weighted * 0.4),
  };
}

// ─────────────────────────────────────────────────────────────────────
// FUNÇÃO MESTRE — enrichLead()
// Zero recursão · Orquestra todos os 7 módulos
// ─────────────────────────────────────────────────────────────────────

export function enrichLead(lead: Lead): EnrichedLead {
  const predictiveScore = computeEinsteinScore(lead);
  const breezeScore     = computeBreezeScore(lead);
  const derivedTemp     = leadTemperature(predictiveScore);
  const bScore          = behavioralScore(lead.behavioralData);
  const prob            = lead.closingProbability || 0.2;
  const risk            = riskOfLoss(lead);
  const imminentClose   = closingAlert(lead);
  const nba             = nextBestAction(lead);
  const followup        = followupScheduler(lead);
  const alert           = alertSystem(lead);
  const revenueValue    = weightedRevenue(lead);
  const priorityScore   = predictiveScore * prob * (derivedTemp==='hot'?1.5:derivedTemp==='warm'?1.0:0.5);
  const recommendations = recommendProperties(lead);
  const closeDate       = predictCloseDate(lead);
  const channel         = (lead.behavioralData?.preferredChannels||['whatsapp'])[0];
  const style           = persuasionStyle(lead);
  const bestTime        = bestContactTime(lead);
  const followUpMsg     = followUpMessage(lead);
  const lifeHint        = lifeEventHint(lead.lifeEvent);
  const icp             = icpMatch(lead);
  const reputation      = leadReputation(lead);
  const velocity        = lead.dealVelocity || 0;
  const docStatus       = documentStatus(lead);
  const callScript      = generateCallScript(lead);
  const videoScript     = generateVideoScript(lead);
  const neighborhood    = getNeighborhoodInsights(lead.location);
  return {
    predictiveScore, breezeScore, derivedTemp, bScore, prob,
    risk, imminentClose, nba, followup, alert,
    revenueValue, priorityScore, recommendations, closeDate,
    channel, style, bestTime, followUpMsg, lifeHint,
    icp, reputation, velocity, docStatus, callScript, videoScript, neighborhood,
  };
}
