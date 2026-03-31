// ═══════════════════════════════════════════════════════════════════════
//  IMOVAI ENGINE v12.0 — 70+ Funções IA · TypeScript Puro
//  Zero recursão · Testável · OpenAI-ready · Vercel-ready
//  Ref: Salesforce Einstein · HubSpot Breeze · Gong.io · Reapit
//       Follow Up Boss · LionDesk · kvCORE · Propertybase · Chime
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
// ─────────────────────────────────────────────────────────────────────

export function computeEinsteinScore(lead: Lead): number {
  let score = lead.score || 0;
  if (lead.budgetNum >= 1000000)     score += 30;
  else if (lead.budgetNum >= 500000) score += 22;
  else if (lead.budgetNum >= 300000) score += 14;
  else                               score += 6;

  score += Math.min((lead.behavioralData?.siteVisits || 0) * 2, 14);
  score += Math.min((lead.behavioralData?.linkClicks || 0) * 3, 18);
  if ((lead.behavioralData?.emailOpenRate || 0) > 0.8)  score += 12;
  if ((lead.behavioralData?.averageTimeOnSite || 0) > 300) score += 8;

  if (lead.visitScheduled)                              score += 30;
  if (lead.partnerMentioned)                            score += 14;
  if (lead.fundingSimulated)                            score += 20;
  if (lead.intent === 'investimento')                   score += 12;
  if (lead.lifeEvent)                                   score += 16;
  if ((lead.memory?.offersMade?.length || 0) > 0)      score += 25;
  if ((lead.sentimentTrend?.slice(-1)[0] || 0) > 80)   score += 10;

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
  const intent  = lead.intent === 'investimento' ? 15 : 10;
  const budget  = lead.budgetNum >= 500000 ? 10 : lead.budgetNum >= 300000 ? 6 : 3;
  return Math.min(Math.round(recency + engagement + intent + budget), 99);
}

export function leadTemperature(score: number): Temperature {
  if (score >= 82) return 'hot';
  if (score >= 58) return 'warm';
  return 'cold';
}

export function behavioralScore(data: Lead['behavioralData']): number {
  if (!data) return 0;
  let s = 0;
  if (data.siteVisits > 6)         s += 20;
  if (data.linkClicks > 8)         s += 18;
  if (data.averageTimeOnSite > 300) s += 22;
  if (data.emailOpenRate > 0.75)   s += 12;
  if ((data.objectionHistory?.length || 0) > 0) s += 8;
  return Math.min(s, 80);
}

export function sentimentScore(trend: number[] | undefined): number {
  if (!trend || trend.length === 0) return 50;
  const last = trend[trend.length - 1];
  const avg  = trend.reduce((a, b) => a + b, 0) / trend.length;
  return Math.round((last * 0.7) + (avg * 0.3));
}

// ─────────────────────────────────────────────────────────────────────
// MÓDULO 2.2 — INTELIGÊNCIA CONVERSACIONAL
// ─────────────────────────────────────────────────────────────────────

const BUYING_SIGNALS = [
  'minha esposa adorou','adorei','quero fechar','podemos discutir',
  'aceita proposta','fechar negócio','quando posso','topo pagar',
  'fazendo a proposta','vou falar com meu contador','minha família gostou',
  'vou verificar o financiamento','qual a entrada mínima','pode reservar',
  'quando assino','vamos marcar visita','manda o contrato','faz a proposta',
];

const OBJECTIONS: Record<string, string> = {
  'caro':'preço', 'muito alto':'preço', 'não tenho':'capital',
  'juros':'financiamento', 'taxa':'financiamento', 'entrada alta':'capital',
  'longe':'localização', 'distante':'localização',
  'apertado':'dimensão', 'pequeno':'dimensão',
  'vou pensar':'indecisão', 'preciso pensar':'indecisão',
  'minha mulher':'decisor', 'meu marido':'decisor',
  'prazo':'entrega', 'quando entrega':'entrega',
};

export function detectBuyingIntent(text: string): boolean {
  const t = text.toLowerCase();
  return BUYING_SIGNALS.some(s => t.includes(s));
}

export function detectObjection(text: string): string | null {
  const t = text.toLowerCase();
  const key = Object.keys(OBJECTIONS).find(k => t.includes(k));
  return key ? OBJECTIONS[key] : null;
}

export function objectionCounterscript(objection: string | null, lead: Lead): string {
  if (!objection) return '';
  if (objection === 'preço' || objection === 'capital') {
    if (lead.intent === 'investimento')
      return `Este imóvel gera yield de ${lead.code ? '14,5%' : '12%'} ao ano — em 7 anos ele se paga. Posso mostrar a simulação completa?`;
    return `Posso simular um financiamento com a Caixa a partir de R$ 1.800/mês. Quer ver se encaixa no seu perfil?`;
  }
  if (objection === 'financiamento')
    return `Taxa atual 10,5% a.a. + IPCA. Tenho condição especial pelo Minha Casa Minha Vida. Faço a simulação gratuitamente?`;
  if (objection === 'localização')
    return `O bairro valoriza 18% ao ano e a praia fica a ${lead.code ? '20m' : '100m'} — o acesso mais do que compensa. Vamos fazer uma visita antes de decidir?`;
  if (objection === 'indecisão')
    return `Entendo! Uma boa decisão requer reflexão. Enquanto isso, posso reservar a unidade por 48h? As melhores unidades costumam ir rápido.`;
  if (objection === 'decisor')
    return `Claro! Que tal uma visita juntos no final de semana? Trago toda a documentação e um book completo para facilitar a conversa.`;
  if (objection === 'entrega')
    return `A entrega é em ${lead.code ? 'Dez/2025' : 'Jun/2026'} — tempo perfeito para planejar! E você já estaria protegido da valorização de agora até lá.`;
  return `Entendo sua preocupação. Posso apresentar alternativas que se encaixam melhor no seu perfil?`;
}

export function analyzeConversation(messages: Message[]): ConversationAnalysis {
  const texts = messages.map(m => m.text.toLowerCase()).join(' ');
  const buyingSignals = BUYING_SIGNALS.filter(s => texts.includes(s)).length;
  const objectionCount = Object.keys(OBJECTIONS).filter(k => texts.includes(k)).length;
  const positiveWords = ['ótimo','perfeito','adorei','incrível','maravilhoso','top','excelente'].filter(w => texts.includes(w)).length;
  const negativeWords = ['caro','difícil','problema','não consigo','não tenho'].filter(w => texts.includes(w)).length;
  const score = Math.min(100, 50 + (buyingSignals * 12) + (positiveWords * 5) - (negativeWords * 8) - (objectionCount * 6));
  return {
    score,
    label: score >= 75 ? 'Muito Positivo' : score >= 50 ? 'Positivo' : score >= 30 ? 'Neutro' : 'Negativo',
    buyingSignals,
    objections: objectionCount,
    dominantEmotion: buyingSignals > 2 ? 'entusiasmo' : objectionCount > 1 ? 'resistência' : 'neutro',
    nextStep: buyingSignals >= 2 ? '🚨 Proposta agora!' : objectionCount > 0 ? '🛡 Contornar objeção' : '💬 Nutrir engajamento',
  };
}

// ─────────────────────────────────────────────────────────────────────
// MÓDULO 2.3 — INTELIGÊNCIA COMPORTAMENTAL
// ─────────────────────────────────────────────────────────────────────

export function leadReputation(lead: Lead): ReputationResult {
  const score = lead.qualityScore || computeEinsteinScore(lead);
  if (score >= 85) return { tier:'A+', label:'Investor Prime', color:'#10B981', priority:1 };
  if (score >= 70) return { tier:'A',  label:'Qualified Buyer', color:'#3B82F6', priority:2 };
  if (score >= 55) return { tier:'B',  label:'Prospect',        color:'#F59E0B', priority:3 };
  return { tier:'C', label:'Lead Nurturing', color:'#64748B', priority:4 };
}

export function icpMatch(lead: Lead): number {
  let score = 0;
  if (lead.budgetNum >= 500000)       score += 30;
  else if (lead.budgetNum >= 300000)  score += 18;
  else                                score += 6;
  if (lead.intent === 'investimento') score += 20;
  if (lead.incomeNum >= 15000)        score += 15;
  if (lead.lifeEvent)                 score += 12;
  if (lead.fundingSimulated)          score += 10;
  if (['Balneário Piçarras','Penha','Barra Velha','Itapoá'].includes(lead.location)) score += 10;
  if (lead.partnerMentioned)          score += 8;
  return Math.min(score, 100);
}

export function documentStatus(lead: Lead): string {
  if (!lead.documents?.length) return '📋 Sem documentos';
  const sent    = lead.documents.filter(d => d.status === 'enviado').length;
  const pending = lead.documents.filter(d => d.status === 'pendente').length;
  if (pending > 0) return `⏳ ${pending} pendente(s)`;
  return `✅ ${sent} enviado(s)`;
}

export function dealVelocityScore(lead: Lead): number {
  const v = lead.dealVelocity || 0;
  const stages = ['novo','qualificado','agendado','visitou','proposta','fechado'];
  const idx    = stages.indexOf(lead.status);
  const days   = (Date.now() - (lead.lastMsgTs || Date.now())) / 86400000;
  return Math.max(0, Math.min(10, (v * 2) + (idx * 0.5) - (days * 0.1)));
}

// ─────────────────────────────────────────────────────────────────────
// MÓDULO 2.4 — INTELIGÊNCIA IMOBILIÁRIA
// ─────────────────────────────────────────────────────────────────────

const NEIGHBORHOODS: Record<string, NeighborhoodInsights> = {
  'Balneário Piçarras': { appreciation12m:18, appreciation3y:64, airbnbOccupancy:82, avgM2:9200, infraScore:88, demandScore:91, investScore:89, supplyTrend:'escasso' },
  'Penha':              { appreciation12m:22, appreciation3y:78, airbnbOccupancy:85, avgM2:8800, infraScore:86, demandScore:93, investScore:92, supplyTrend:'escasso' },
  'Barra Velha':        { appreciation12m:16, appreciation3y:55, airbnbOccupancy:78, avgM2:7900, infraScore:82, demandScore:87, investScore:85, supplyTrend:'moderado' },
  'Navegantes':         { appreciation12m:14, appreciation3y:48, airbnbOccupancy:74, avgM2:9600, infraScore:84, demandScore:85, investScore:83, supplyTrend:'moderado' },
  'Itapoá':             { appreciation12m:24, appreciation3y:88, airbnbOccupancy:80, avgM2:7200, infraScore:80, demandScore:88, investScore:90, supplyTrend:'escasso' },
  'Joinville':          { appreciation12m:12, appreciation3y:42, airbnbOccupancy:68, avgM2:8100, infraScore:92, demandScore:82, investScore:78, supplyTrend:'abundante' },
  'Jaraguá do Sul':     { appreciation12m:11, appreciation3y:38, airbnbOccupancy:62, avgM2:7600, infraScore:88, demandScore:78, investScore:74, supplyTrend:'moderado' },
};

export function getNeighborhoodInsights(city: string): NeighborhoodInsights {
  return NEIGHBORHOODS[city] ?? {
    appreciation12m:15, appreciation3y:52, airbnbOccupancy:75,
    avgM2:8500, infraScore:80, demandScore:80, investScore:80, supplyTrend:'moderado',
  };
}

export function calculateInvestmentROI(property: Property): ROIResult | null {
  if (!property.airbnb || !property.yield) return null;
  const grossYield    = property.yield;
  const expenses      = 0.28;
  const netYield      = Math.round((grossYield * (1 - expenses)) * 10) / 10;
  const monthlyRent   = Math.round(property.price * (grossYield / 100) / 12);
  const annualRent    = monthlyRent * 12;
  const netAnnual     = Math.round(annualRent * (1 - expenses));
  const paybackYears  = Math.round(property.price / netAnnual);
  const appreciation  = getNeighborhoodInsights(property.city).appreciation12m;
  const totalReturn   = Math.round(grossYield + appreciation);
  const rating        = totalReturn >= 30 ? '⭐ Investimento Excelente'
                      : totalReturn >= 20 ? '✅ Bom Investimento'
                      : '📊 Investimento Razoável';
  return { grossYield, netYield, monthlyRent, netAnnual, paybackYears, totalReturn, rating, appreciation };
}

export function propertyScore(lead: Lead, property: Property): number {
  let s = 0;
  if (property.city === lead.location)                                 s += 32;
  if (property.price <= lead.budgetNum)                               s += 28;
  if (property.price <= lead.budgetNum * 1.15 && property.price >= lead.budgetNum * 0.7) s += 12;
  if (lead.intent === 'investimento' && property.yield > 12)          s += 28;
  if (lead.intent === 'investimento' && property.yield > 9)           s += 14;
  if (lead.intent === 'investimento' && property.airbnb)              s += 12;
  if (lead.intent === 'moradia' && property.bedrooms >= 2)            s += 18;
  if (lead.intent === 'moradia' && property.bedrooms >= 3)            s += 10;
  if (property.status === 'disponível')                               s += 6;
  if (lead.memory?.propertiesViewed?.includes(property.code))         s += 16;
  return s;
}

export function recommendProperties(lead: Lead): (Property & { matchScore: number })[] {
  return [...PROPERTIES]
    .map(p => ({ ...p, matchScore: propertyScore(lead, p) }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .filter(p => p.matchScore > 0);
}

export function generatePropertyDescription(
  property: Property,
  mode: 'vendas' | 'profissional' | 'airbnb' = 'vendas',
): string {
  if (!property) return '';
  const roi = calculateInvestmentROI(property);
  const nb  = getNeighborhoodInsights(property.city);

  if (mode === 'airbnb')
    return `🏖 ${property.title} — ${property.beach} da praia em ${property.city}\n✨ ${property.area}m² | ${property.bedrooms > 0 ? property.bedrooms + ' dorms' : 'Studio'} | ${(property.features||[]).slice(0,3).join(' · ')}\n💰 Renda média: R$ ${roi ? (roi.monthlyRent/1000).toFixed(1) + 'k/mês' : 'consulte'} via Airbnb`;

  if (mode === 'profissional')
    return `${property.title} | ${property.city}\n${property.area}m² · ${property.bedrooms > 0 ? `${property.bedrooms} dorm` : 'Studio'} · ${property.beach} do mar${property.airbnb ? ` · Yield ${property.yield}% a.a.` : ''}\nR$ ${(property.price/1000).toFixed(0)}k · Comissão R$ ${(property.commission/1000).toFixed(0)}k\n${property.highlight}`;

  // vendas — persuasivo
  const urgency = property.units <= 2 ? `🔴 Apenas ${property.units} unidade(s) disponível!` : '';
  const yieldInfo = roi ? `📊 Yield ${roi.netYield}% líquido · R$ ${(roi.monthlyRent/1000).toFixed(1)}k/mês · Retorno em ${roi.paybackYears} anos` : '';
  return `✨ ${property.highlight}\n📍 ${property.city} · ${property.beach} da praia · +${nb.appreciation12m}% valorização/ano\n${yieldInfo}\n${urgency}`.trim();
}

// ─────────────────────────────────────────────────────────────────────
// MÓDULO 2.5 — NEXT BEST ACTION ENGINE
// ─────────────────────────────────────────────────────────────────────

export function riskOfLoss(lead: Lead): 'alto' | 'médio' | 'baixo' | null {
  const hours = (Date.now() - (lead.lastMsgTs || Date.now())) / 3600000;
  const temp  = leadTemperature(computeEinsteinScore(lead));
  if (temp === 'hot' && hours > 18)   return 'alto';
  if (temp === 'warm' && hours > 48)  return 'médio';
  if (hours > 96)                      return 'baixo';
  return null;
}

export function closingAlert(lead: Lead): boolean {
  return lead.closingProbability > 0.78 && leadTemperature(computeEinsteinScore(lead)) === 'hot';
}

export function alertSystem(lead: Lead): AlertResult | null {
  const es  = computeEinsteinScore(lead);
  const temp = leadTemperature(es);
  if (lead.closingProbability > 0.82 && temp === 'hot')
    return { type:'imminent', msg:'🚨 Fechamento iminente', color:'#F43F5E', priority:1 };
  if (riskOfLoss(lead) === 'alto')
    return { type:'risk', msg:'⚠️ Em risco de perda', color:'#F59E0B', priority:2 };
  if (lead.lifeEvent)
    return { type:'life', msg:'🔔 Evento de vida', color:'#8B5CF6', priority:3 };
  if (followupScheduler(lead)?.urgency === 'critical')
    return { type:'followup', msg:'⚡ Follow-up urgente', color:'#F43F5E', priority:4 };
  return null;
}

export function nextBestAction(lead: Lead): NBAResult {
  const risk = riskOfLoss(lead);
  if (lead.closingProbability > 0.85)
    return { action:'📞 LIGAR AGORA', priority:'critical', why:'Probabilidade de fechamento acima de 85%' };
  if (!lead.visitScheduled && leadTemperature(computeEinsteinScore(lead)) === 'hot')
    return { action:'🏠 Agendar visita imediata', priority:'high', why:'Lead quente sem visita marcada' };
  if (risk === 'alto')
    return { action:'🚨 Follow-up urgente', priority:'high', why:'Risco de perda detectado — intervir agora' };
  if (lead.intent === 'investimento')
    return { action:'📊 Enviar análise ROI', priority:'medium', why:'Perfil investidor — decisão por dados' };
  if (lead.lifeEvent)
    return { action:'🤝 Abordagem empática contextual', priority:'medium', why:`Life event: ${lead.lifeEvent}` };
  if (leadTemperature(computeEinsteinScore(lead)) === 'cold')
    return { action:'📧 Campanha de nutrição 30d', priority:'low', why:'Lead frio — reativar com conteúdo' };
  if (lead.fundingSimulated)
    return { action:'📋 Encaminhar para banco parceiro', priority:'medium', why:'Simulação feita — próximo passo' };
  return { action:'💬 Acompanhar plano atual', priority:'normal', why:'Pipeline saudável' };
}

export function followupScheduler(lead: Lead): FollowupResult | null {
  const hours = (Date.now() - (lead.lastMsgTs || Date.now())) / 3600000;
  const temp  = leadTemperature(computeEinsteinScore(lead));
  if (hours > 96)
    return { type:'reativação', urgency:'high', msg:'Reativação urgente — lead sem contato >96h', daysAgo: Math.floor(hours/24) };
  if (hours > 18 && temp === 'hot')
    return { type:'urgente', urgency:'critical', msg:'Lead quente sem resposta >18h — intervir agora', daysAgo: Math.round(hours/24) };
  if (hours > 48 && temp === 'warm')
    return { type:'nutrição', urgency:'medium', msg:'Lead morno — nutrição com novo conteúdo', daysAgo: Math.round(hours/24) };
  return null;
}

export function weightedRevenue(lead: Lead): number {
  const temp     = leadTemperature(computeEinsteinScore(lead));
  const tempMult = temp === 'hot' ? 1.25 : temp === 'warm' ? 1.0 : 0.65;
  return Math.round((lead.revenueExpected || 0) * (lead.closingProbability || 0.2) * tempMult);
}

// ─────────────────────────────────────────────────────────────────────
// MÓDULO 2.6 — MOTOR DE PERSUASÃO
// ─────────────────────────────────────────────────────────────────────

export function persuasionStyle(lead: Lead): string {
  if (lead.intent === 'investimento' && lead.budgetNum >= 800000) return '💎 Exclusividade + Dados Premium';
  if (lead.intent === 'investimento')  return '📊 ROI + Rentabilidade';
  if (lead.lifeEvent)                  return '🤝 Empatia + Segurança Emocional';
  if (lead.budgetNum >= 800000)        return '✨ Exclusividade + Valorização';
  return '💬 Benefícios Práticos + Prazo';
}

export function followUpMessage(lead: Lead): string {
  if (lead.intent === 'investimento') {
    const roi = lead.code ? '14,5%' : '12%';
    if (lead.lifeEvent) return `Pensei em você e encontrei uma oportunidade que pode transformar este momento em patrimônio consolidado. Yield de ${roi} a.a. com segurança real. Posso compartilhar?`;
    return `Identifiquei novos dados de rentabilidade para o seu perfil. O mercado de ${lead.location} valorizou mais 2,3% este mês. Quer ver a simulação atualizada?`;
  }
  if (lead.temp === 'hot') return `Consegui uma condição especial exclusiva para o imóvel que você gostou. Disponível só até sexta. Posso explicar em 2 minutos?`;
  if (lead.lifeEvent)      return `Encontrei algo que combina perfeitamente com sua nova fase. Uma oportunidade que raramente aparece. Posso compartilhar?`;
  if (lead.temp === 'cold') return `Oi! Preparei um guia exclusivo com os 3 melhores imóveis do Litoral Norte SC agora. Completamente gratuito. Quer receber?`;
  return `Vi novidades no mercado que combinam com o que você busca. Vale muito a pena conhecer! Me avisa se quiser?`;
}

export function bestContactTime(lead: Lead): string {
  const h = new Date().getHours();
  if (lead.behavioralData?.preferredChannels?.includes('whatsapp')) {
    if (h >= 19 || h <= 8) return '⚡ Agora (horário ideal)';
    if (h >= 12 && h <= 13) return '⚡ Agora (horário de almoço)';
    return '📅 Das 19h às 21h (melhor horário)';
  }
  return '🕘 Horário comercial 9h–18h';
}

export function generateCallScript(lead: Lead): CallScript {
  const rep = leadReputation(lead);
  return {
    opening: `Bom ${new Date().getHours() < 12 ? 'dia' : new Date().getHours() < 18 ? 'tarde' : 'noite'}, ${lead.name.split(' ')[0]}! Aqui é o Jorge Miguel. Tudo bem? Liguei porque tenho uma novidade que vai te interessar muito.`,
    qualification: lead.intent === 'investimento'
      ? `Você ainda está buscando aquele investimento com yield acima de 12% no Litoral Norte? Porque surgiu uma oportunidade única.`
      : `Você ainda está procurando o imóvel ideal para sua família em ${lead.location}?`,
    pitch: lead.code
      ? `O imóvel ${lead.code} que você viu tem exatamente o perfil que você busca. E tenho uma condição especial disponível só esta semana.`
      : `Tenho ${lead.intent === 'investimento' ? '3 opções com yield de 12 a 16% ao ano' : '2 imóveis perfeitos para o que você está buscando'} dentro do seu orçamento.`,
    objectionHandle: `Se você tiver qualquer dúvida sobre ${lead.memory?.objections?.[0] || 'condições'}, já tenho todas as respostas preparadas para você.`,
    cta: `Você tem 15 minutinhos agora para eu te mostrar isso? Ou prefere que eu te mande pelo WhatsApp primeiro?`,
    tier: rep.tier,
  };
}

export function generateVideoScript(lead: Lead): VideoScript {
  const roi = lead.code ? calculateInvestmentROI(PROPERTIES.find(p => p.code === lead.code) || PROPERTIES[0]) : null;
  return {
    hook: `${lead.name.split(' ')[0]}, vim te mostrar algo que pode mudar seus planos para ${new Date().getFullYear()}...`,
    context: `Sou o Jorge Miguel, corretor especialista em imóveis premium no Litoral Norte de SC. Separei isso especialmente para você.`,
    offer: lead.intent === 'investimento'
      ? `Este imóvel gera ${roi ? roi.netYield + '%' : '14%'} de yield líquido — R$ ${roi ? (roi.monthlyRent/1000).toFixed(1) : '7'}k por mês de renda passiva.`
      : `Este imóvel tem tudo que você me disse que precisava: localização, tamanho e dentro do seu orçamento.`,
    proof: `O mercado do Litoral Norte SC valoriza entre 18 e 24% ao ano. Os melhores imóveis somem rápido.`,
    cta: `Responde aqui no WhatsApp "QUERO VER" que eu te mando o book completo com fotos, planta e análise financeira. Hoje mesmo! 👇`,
    duration: '45-60 segundos',
  };
}

// ─────────────────────────────────────────────────────────────────────
// MÓDULO 2.7 — LIFE EVENT ENGINE
// ─────────────────────────────────────────────────────────────────────

export function lifeEventHint(lifeEvent: string | null): string | null {
  if (!lifeEvent) return null;
  const e = lifeEvent.toLowerCase();
  if (e.includes('emprego') || e.includes('empresa'))
    return 'Verificar nova capacidade de renda e elegibilidade para financiamento melhorado';
  if (e.includes('patrimônio') || e.includes('herança') || e.includes('venda'))
    return 'Capital disponível → oportunidade de upgrade imobiliário com yield';
  if (e.includes('divórcio') || e.includes('separação'))
    return 'Necessidade urgente de moradia própria — prioridade emocional e prática';
  if (e.includes('casamento') || e.includes('noivado'))
    return 'Planejamento familiar → ideal para imóvel maior ou primeiro imóvel conjunto';
  if (e.includes('filho') || e.includes('bebê') || e.includes('gravidez'))
    return 'Família crescendo → necessidade de mais espaço e segurança de localização';
  if (e.includes('aposentadoria') || e.includes('aposentou'))
    return 'Renda passiva torna-se prioridade → investimento em imóvel turístico ideal';
  return 'Oportunidade detectada — abordagem contextual personalizada recomendada';
}

export function lifeEventApproach(lead: Lead): string {
  if (!lead.lifeEvent) return '';
  const e = lead.lifeEvent.toLowerCase();
  if (e.includes('patrimônio') || e.includes('empresa'))
    return `Você acabou de ter um evento financeiro significativo. Investir parte disso em imóvel no Litoral Norte é proteger seu patrimônio com yield de até 16% ao ano.`;
  if (e.includes('casamento'))
    return `Parabéns pelo casamento! Que tal garantir o primeiro imóvel do casal? Temos opções perfeitas para quem está começando uma nova fase.`;
  if (e.includes('divórcio'))
    return `Entendo que você está em uma fase de transição. Posso te ajudar a encontrar um imóvel que seja um recomeço sólido — no seu ritmo.`;
  return `Vi que você está passando por uma mudança importante. Posso te ajudar a transformar esse momento em uma decisão patrimonial inteligente?`;
}

// ─────────────────────────────────────────────────────────────────────
// MÓDULO 2.8 — RADAR DE INVESTIDORES (NOVO v12)
// ─────────────────────────────────────────────────────────────────────

export function investorRadar(lead: Lead): { score: number; signals: string[]; recommendation: string } {
  const signals: string[] = [];
  let score = 0;

  if (lead.intent === 'investimento')           { signals.push('✅ Perfil declarado: investidor'); score += 30; }
  if (lead.budgetNum >= 500000)                  { signals.push(`✅ Budget premium: ${lead.budget}`); score += 25; }
  if (lead.incomeNum >= 15000)                   { signals.push(`✅ Renda qualificada: ${lead.income}`); score += 15; }
  if (lead.fundingSimulated)                     { signals.push('✅ Simulou financiamento'); score += 10; }
  if (lead.lifeEvent?.includes('patrimônio'))    { signals.push('✅ Life event: patrimônio cresceu'); score += 15; }
  if ((lead.memory?.propertiesViewed?.length||0) > 2) { signals.push('✅ Comparou múltiplos imóveis'); score += 10; }
  if ((lead.behavioralData?.siteVisits||0) > 5)  { signals.push('✅ Alto engajamento digital'); score += 8; }
  if ((lead.behavioralData?.emailOpenRate||0) > 0.8) { signals.push('✅ Taxa de abertura >80%'); score += 7; }

  const rec = score >= 80 ? 'PRIME: Apresentar portfólio completo + análise ROI personalizada'
            : score >= 55 ? 'QUALIFICADO: Enviar top 3 imóveis por yield + simulação'
            : 'POTENCIAL: Nutrir com conteúdo de valorização e cases';

  return { score: Math.min(score, 100), signals, recommendation: rec };
}

// ─────────────────────────────────────────────────────────────────────
// MÓDULO 2.9 — PREVISÃO DE VALORIZAÇÃO (NOVO v12)
// ─────────────────────────────────────────────────────────────────────

export function valuationForecast(property: Property): {
  current: number; y1: number; y3: number; y5: number;
  bestMonth: string; recommendation: string;
} {
  const nb    = getNeighborhoodInsights(property.city);
  const rate1 = nb.appreciation12m / 100;
  const rate3 = Math.pow(1 + rate1 * 0.9, 3) - 1;
  const rate5 = Math.pow(1 + rate1 * 0.8, 5) - 1;
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const peak = nb.airbnbOccupancy > 80 ? 'Jan–Mar (temporada alta)' : 'Nov–Jan';

  return {
    current:       property.price,
    y1:            Math.round(property.price * (1 + rate1)),
    y3:            Math.round(property.price * (1 + rate3)),
    y5:            Math.round(property.price * (1 + rate5)),
    bestMonth:     peak,
    recommendation: nb.supplyTrend === 'escasso' ? '🔥 Comprar agora — oferta limitada e demanda crescente' : '📊 Bom momento — mercado aquecido',
  };
}

// ─────────────────────────────────────────────────────────────────────
// MÓDULO 2.10 — ANALYTICS ENGINE
// ─────────────────────────────────────────────────────────────────────

export function analyticsEngine(leads: Lead[]): AnalyticsData {
  const enriched   = leads.map(l => ({ ...l, _e: enrichLead(l) }));
  const hot        = enriched.filter(l => l._e.derivedTemp === 'hot');
  const warm       = enriched.filter(l => l._e.derivedTemp === 'warm');
  const cold       = enriched.filter(l => l._e.derivedTemp === 'cold');
  const proposals  = leads.filter(l => ['proposta','fechado'].includes(l.status));
  const closed     = leads.filter(l => l.status === 'fechado');
  const avgDealSize = closed.length > 0
    ? Math.round(closed.reduce((s, l) => s + l.revenueExpected, 0) / closed.length)
    : Math.round(leads.reduce((s,l) => s + l.revenueExpected, 0) / Math.max(leads.length, 1));

  const bySource = leads.reduce<Record<string, Lead[]>>((acc, l) => {
    acc[l.source] = [...(acc[l.source] || []), l];
    return acc;
  }, {});

  const cacBySource = Object.entries(bySource).map(([src, srcLeads]) => {
    const rev = srcLeads.reduce((s, l) => s + l.revenueExpected, 0);
    const weighted = srcLeads.reduce((s, l) => s + weightedRevenue(l), 0);
    return { src, cnt: srcLeads.length, revenue: rev, weighted, roi: Math.round(rev / Math.max(srcLeads.length, 1) / 1000) };
  });

  const weightedPipeline    = leads.reduce((s, l) => s + weightedRevenue(l), 0);
  const totalRevenuePotential = leads.reduce((s, l) => s + l.revenueExpected, 0);
  const conversionRate      = Math.round((proposals.length / Math.max(leads.length, 1)) * 100);
  const forecastThisMonth   = Math.round(weightedPipeline * 0.35);

  return {
    totalLeads: leads.length, hotLeads: hot.length, warmLeads: warm.length, coldLeads: cold.length,
    avgDealSize, avgCloseTime: 14, cacBySource, conversionRate,
    weightedPipeline, totalRevenuePotential, forecastThisMonth,
  };
}

// ─────────────────────────────────────────────────────────────────────
// ORQUESTRADOR — enrichLead()
// ─────────────────────────────────────────────────────────────────────

export function enrichLead(lead: Lead): EnrichedLead {
  const predictiveScore = computeEinsteinScore(lead);
  const breezeScore     = computeBreezeScore(lead);
  const derivedTemp     = leadTemperature(predictiveScore);
  const bScore          = behavioralScore(lead.behavioralData);
  const prob            = lead.closingProbability ?? (predictiveScore > 85 ? 0.75 : predictiveScore > 70 ? 0.50 : 0.20);
  const risk            = riskOfLoss(lead);
  const imminentClose   = closingAlert(lead);
  const nba             = nextBestAction(lead);
  const followup        = followupScheduler(lead);
  const alert           = alertSystem(lead);
  const revenueValue    = weightedRevenue(lead);
  const icp             = icpMatch(lead);
  const reputation      = leadReputation(lead);
  const velocity        = lead.dealVelocity || 0;
  const docStatus       = documentStatus(lead);
  const callScript      = generateCallScript(lead);
  const videoScript     = generateVideoScript(lead);
  const neighborhood    = getNeighborhoodInsights(lead.location);
  const recommendations = recommendProperties(lead);
  const closeDate       = derivedTemp === 'hot' && prob > 0.7 ? 'Próximos 3 dias' : derivedTemp === 'warm' ? '7–14 dias' : '30+ dias';
  const priorityScore   = (predictiveScore * (derivedTemp === 'hot' ? 1.5 : derivedTemp === 'warm' ? 1.1 : 0.65)) + (revenueValue / 8000);
  const investor        = investorRadar(lead);

  return {
    ...lead,
    predictiveScore, breezeScore, derivedTemp, bScore, prob, risk,
    imminentClose, nba, followup, alert, revenueValue, icp, reputation,
    velocity, docStatus, callScript, videoScript, neighborhood,
    recommendations, closeDate, priorityScore,
    channel:      lead.behavioralData?.preferredChannels?.[0] || 'whatsapp',
    style:        persuasionStyle(lead),
    bestTime:     bestContactTime(lead),
    followUpMsg:  followUpMessage(lead),
    lifeHint:     lifeEventHint(lead.lifeEvent || null),
    investor,
  };
}
