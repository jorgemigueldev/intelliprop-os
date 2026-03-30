// ─────────────────────────────────────────────────────────────────────
// IMOVAI OS v10 — Tipos TypeScript Centralizados
// ─────────────────────────────────────────────────────────────────────

export interface BehavioralData {
  emailOpenRate:      number;
  linkClicks:         number;
  siteVisits:         number;
  averageTimeOnSite:  number;
  preferredChannels:  string[];
  objectionHistory:   string[];
}

export interface LeadMemory {
  propertiesViewed:  string[];
  offersMade:        string[];
  objections:        string[];
  favoriteRegions:   string[];
}

export interface TimelineEvent {
  event: string;
  time:  string;
  icon:  string;
  type:  'contact' | 'insight' | 'ai' | 'action' | 'behavior' | 'capture' | 'visit' | 'proposal' | 'referral';
}

export interface Document {
  name:   string;
  status: string;
  date:   string | null;
}

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
  status:              StageKey;
  temp:                Temperature;
  score:               number;
  lifeEvent:           string | null;
  lastMsg:             string;
  lastMsgTs:           number;
  avatar:              string;
  code:                string | null;
  aiNotes:             string;
  tags:                string[];
  paused:              boolean;
  source:              SourceKey;
  assignedTo:          string;
  closingProbability:  number;
  revenueExpected:     number;
  visitScheduled:      boolean;
  partnerMentioned:    boolean;
  fundingSimulated:    boolean;
  satisfaction:        number | null;
  memory:              LeadMemory;
  timeline:            TimelineEvent[];
  behavioralData:      BehavioralData;
  sentimentTrend:      number[];
  dealVelocity:        number;
  qualityScore:        number;
  documents:           Document[];
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
  sentiment: 'muito_positivo' | 'positivo' | 'neutro' | 'negativo';
}

export interface Stage {
  key:         StageKey;
  label:       string;
  color:       string;
  icon:        string;
  order:       number;
}

export type Temperature = 'hot' | 'warm' | 'cold';
export type StageKey    = 'novo' | 'qualificado' | 'agendado' | 'visitou' | 'proposta' | 'fechado' | 'perdido';
export type SourceKey   = 'instagram' | 'google' | 'indicacao' | 'trafego_pago' | 'organico' | 'tiktok' | 'facebook' | 'zap' | 'vivareal';

// ── Engine Output ──────────────────────────────────────────────────────
export interface NBAResult {
  priority: 'critical' | 'high' | 'medium' | 'low';
  action:   string;
  why:      string;
  urgency:  string;
  icon:     string;
}

export interface AlertResult {
  type:  string;
  label: string;
  color: string;
}

export interface FollowupResult {
  type:    string;
  urgency: string;
  msg:     string;
}

export interface ReputationResult {
  label: string;
  color: string;
  score: number;
}

export interface ROIResult {
  grossYield:   string;
  netYield:     string;
  monthlyRent:  number;
  paybackYears: string;
  rating:       string;
}

export interface NeighborhoodInsights {
  appreciation12m:   number;
  appreciation24m:   number;
  avgM2:             number;
  demandScore:       number;
  airbnbOccupancy:   number;
}

export interface CallScript {
  abertura:      string;
  qualificacao:  string;
  proposta:      string;
  fechamento:    string;
}

export interface VideoScript {
  hook:      string;
  problema:  string;
  solucao:   string;
  cta:       string;
  hashtags:  string;
}

export interface ConversationAnalysis {
  score:         number;
  trend:         string;
  label:         string;
  talkRatio:     string;
  buyingSignals: number;
  objections:    number;
  engagement:    string;
}

export interface EnrichedLead {
  predictiveScore: number;
  breezeScore:     number;
  derivedTemp:     Temperature;
  bScore:          number;
  prob:            number;
  risk:            'alto' | 'médio' | 'baixo';
  imminentClose:   boolean;
  nba:             NBAResult;
  followup:        FollowupResult | null;
  alert:           AlertResult | null;
  revenueValue:    number;
  priorityScore:   number;
  recommendations: (Property & { matchScore: number })[];
  closeDate:       string;
  channel:         string;
  style:           string;
  bestTime:        string;
  followUpMsg:     string;
  lifeHint:        string | null;
  icp:             number;
  reputation:      ReputationResult;
  velocity:        number;
  docStatus:       { icon: string; label: string; color: string } | null;
  callScript:      CallScript;
  videoScript:     VideoScript;
  neighborhood:    NeighborhoodInsights;
}

export interface AnalyticsData {
  weightedPipeline:      number;
  avgDealSize:           number;
  conversionRate:        number;
  avgCloseTime:          number;
  cacBySource:           { src: string; cnt: number; revenue: number; roi: number }[];
  totalLeads:            number;
  hotLeads:              number;
  warmLeads:             number;
  coldLeads:             number;
  totalRevenuePotential: number;
  forecastThisMonth:     number;
}

export interface Toast {
  id:    number;
  title: string;
  msg:   string;
  color: string;
}

// ── Property extendida v11 ────────────────────────────────────────────
declare module './types' {}
