// ═══════════════════════════════════════════════════════════════════════
//  IMOVAI OS v12 — Tipos TypeScript Centralizados
// ═══════════════════════════════════════════════════════════════════════

export type Temperature = 'hot' | 'warm' | 'cold';

export interface Lead {
  id:                  number;
  name:                string;
  phone:               string;
  email:               string;
  budget:              string;
  budgetNum:           number;
  income:              string;
  incomeNum:           number;
  entry:               string;
  entryNum:            number;
  location:            string;
  propertyType:        string;
  intent:              'moradia' | 'investimento';
  status:              'novo' | 'qualificado' | 'agendado' | 'visitou' | 'proposta' | 'fechado' | 'perdido';
  temp:                Temperature;
  score:               number;
  lifeEvent:           string | null;
  lastMsg:             string;
  lastMsgTs:           number;
  avatar:              string;
  code:                string | null;
  assignedTo:          string;
  aiNotes:             string;
  tags:                string[];
  paused:              boolean;
  source:              string;
  closingProbability:  number;
  revenueExpected:     number;
  visitScheduled:      boolean;
  partnerMentioned:    boolean;
  fundingSimulated:    boolean;
  satisfaction:        number | null;
  memory:              { propertiesViewed: string[]; offersMade: string[]; objections: string[]; favoriteRegions: string[] };
  timeline:            { event: string; time: string; icon: string; type: string }[];
  behavioralData:      { emailOpenRate: number; linkClicks: number; siteVisits: number; averageTimeOnSite: number; preferredChannels: string[]; objectionHistory: string[] };
  sentimentTrend:      number[];
  dealVelocity:        number;
  qualityScore:        number;
  documents:           { name: string; status: string; date: string | null }[];
}

export interface Property {
  id:          number;
  code:        string;
  title:       string;
  city:        string;
  type:        string;
  price:       number;
  area:        number;
  bedrooms:    number;
  beach:       string;
  airbnb:      boolean;
  status:      'disponível' | 'reservado' | 'vendido';
  views:       number;
  matches:     number;
  yield:       number;
  commission:  number;
  photo:       string;
  photos:      string[];
  highlight:   string;
  iptu:        number;
  condo:       number;
  features:    string[];
  description: string;
  address:     string;
  developer:   string;
  launchDate:  string;
  units:       number;
  totalUnits:  number;
  lat:         number;
  lng:         number;
  videoUrl:    string | null;
  tag:         string;
  tagColor:    string;
}

export interface Message {
  id:        number;
  from:      'client' | 'agent' | 'ai';
  text:      string;
  time:      string;
  sentiment: 'muito_positivo' | 'positivo' | 'neutro' | 'negativo' | 'muito_negativo';
}

export interface Stage {
  key:   string;
  label: string;
  color: string;
  icon:  string;
  order: number;
}

export interface Toast {
  id:    number;
  title: string;
  msg:   string;
  color: string;
}

export interface NBAResult     { action: string; priority: 'critical'|'high'|'medium'|'low'|'normal'; why: string }
export interface AlertResult   { type: string; msg: string; color: string; priority: number }
export interface FollowupResult{ type: string; urgency: 'critical'|'high'|'medium'|'low'; msg: string; daysAgo: number }
export interface ReputationResult { tier: string; label: string; color: string; priority: number }

export interface ROIResult {
  grossYield: number; netYield: number; monthlyRent: number;
  netAnnual: number; paybackYears: number; totalReturn: number;
  rating: string; appreciation: number;
}

export interface NeighborhoodInsights {
  appreciation12m: number; appreciation3y: number;
  airbnbOccupancy: number; avgM2: number;
  infraScore: number; demandScore: number; investScore: number;
  supplyTrend: 'escasso' | 'moderado' | 'abundante';
}

export interface ConversationAnalysis {
  score: number; label: string; buyingSignals: number;
  objections: number; dominantEmotion: string; nextStep: string;
}

export interface CallScript  { opening: string; qualification: string; pitch: string; objectionHandle: string; cta: string; tier: string }
export interface VideoScript { hook: string; context: string; offer: string; proof: string; cta: string; duration: string }

export interface AnalyticsData {
  totalLeads: number; hotLeads: number; warmLeads: number; coldLeads: number;
  avgDealSize: number; avgCloseTime: number;
  cacBySource: { src: string; cnt: number; revenue: number; weighted: number; roi: number }[];
  conversionRate: number; weightedPipeline: number;
  totalRevenuePotential: number; forecastThisMonth: number;
}

export interface EnrichedLead extends Lead {
  predictiveScore: number; breezeScore: number; derivedTemp: Temperature;
  bScore: number; prob: number; risk: ReturnType<typeof import('./engine').riskOfLoss>;
  imminentClose: boolean; nba: NBAResult; followup: FollowupResult | null;
  alert: AlertResult | null; revenueValue: number; icp: number;
  reputation: ReputationResult; velocity: number; docStatus: string;
  callScript: CallScript; videoScript: VideoScript;
  neighborhood: NeighborhoodInsights; closeDate: string;
  recommendations: (Property & { matchScore: number })[]; priorityScore: number;
  channel: string; style: string; bestTime: string;
  followUpMsg: string; lifeHint: string | null;
  investor: { score: number; signals: string[]; recommendation: string };
}
