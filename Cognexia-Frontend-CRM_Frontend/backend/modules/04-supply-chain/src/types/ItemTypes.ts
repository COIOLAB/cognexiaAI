export interface ItemSpecification {
  specId: string;
  name: string;
  value: any;
  unit?: string;
  constraints: any[];
  validations: any[];
}

export interface ItemCategory {
  categoryId: string;
  name: string;
  description: string;
  parent?: string;
  attributes: any[];
  requirements: any[];
}

export interface UnitOfMeasure {
  primary: string;
  secondary?: string;
  conversionFactor?: number;
}

export interface StockAccuracy {
  physical: number;
  system: number;
  discrepancy: number;
  lastCount: Date;
  countFrequency: string;
}

export interface StockVariance {
  quantity: number;
  value: number;
  percentage: number;
  reason?: string;
}

export interface AgingAnalysis {
  ranges: AgeRange[];
  totalValue: number;
  riskLevel: string;
}

export interface AgeRange {
  range: string;
  quantity: number;
  value: number;
  percentage: number;
}

export interface SeasonalAdjustment {
  season: string;
  factor: number;
  startDate: Date;
  endDate: Date;
}

export interface DynamicStockLevel {
  trigger: string;
  adjustment: number;
  duration: string;
}

export interface LevelOptimization {
  algorithm: string;
  parameters: any[];
  constraints: any[];
  results: any;
}

export interface AILevelRecommendation {
  recommendationId: string;
  type: string;
  value: number;
  confidence: number;
  reasoning: string[];
}

export interface HumanLevelOverride {
  overrideId: string;
  user: string;
  originalValue: number;
  newValue: number;
  reason: string;
  timestamp: Date;
}

export interface SupplierInfo {
  supplierId: string;
  name: string;
  reliabilityScore: number;
  leadTime: number;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  unitCost: number;
  lastDeliveryDate?: Date;
  performance: SupplierPerformance;
}

export interface SupplierPerformance {
  deliveryAccuracy: number;
  qualityScore: number;
  responseTime: number;
  flexibility: number;
  overall: number;
}

export interface StockCostData {
  unitCost: number;
  averageCost: number;
  totalValue: number;
  holdingCost: number;
  orderingCost: number;
  stockoutCost: number;
  overhead: number;
  lastUpdated: Date;
}

export interface StockQuality {
  qualityScore: number;
  inspectionResults: any[];
  defectRate: number;
  compliance: any[];
  certifications: any[];
}

export interface StockLifecycle {
  stage: string;
  introductionDate: Date;
  maturityDate?: Date;
  endOfLifeDate?: Date;
  replacementItem?: string;
}

export interface StockConstraint {
  constraintId: string;
  type: string;
  value: any;
  priority: string;
  enforced: boolean;
}

export interface StockPerformance {
  metrics: any[];
  trends: any[];
  benchmarks: any[];
  improvements: any[];
}

export interface AIStockInsight {
  insightId: string;
  type: string;
  content: any;
  confidence: number;
  timestamp: Date;
}

export interface HumanStockInput {
  inputId: string;
  userId: string;
  type: string;
  content: any;
  timestamp: Date;
}

export interface StockDigitalTwin {
  twinId: string;
  model: any;
  realTimeData: any;
  simulations: any[];
  predictions: any[];
}

export interface StockSustainability {
  carbonFootprint: number;
  energyEfficiency: number;
  wasteGeneration: number;
  recycling: number;
  sustainabilityScore: number;
}

export interface StockCompliance {
  regulations: any[];
  certifications: any[];
  audits: any[];
  violations: any[];
}

// Historical Data Types
export interface HistoricalDemand {
  period: string;
  quantity: number;
  value: number;
  factors: any[];
}

export interface CurrentDemand {
  daily: number;
  weekly: number;
  monthly: number;
  trend: string;
}

export interface PredictedDemand {
  period: string;
  quantity: number;
  confidence: number;
  scenarios: any[];
}

export interface DemandPattern {
  type: string;
  frequency: string;
  magnitude: number;
  confidence: number;
}

export interface SeasonalityData {
  pattern: string;
  index: number[];
  confidence: number;
}

export interface DemandTrend {
  direction: string;
  slope: number;
  significance: number;
}

export interface DemandVariability {
  coefficient: number;
  stability: string;
  factors: any[];
}

export interface DemandFactor {
  name: string;
  impact: number;
  correlation: number;
}

export interface MarketDemandData {
  marketSize: number;
  marketShare: number;
  growth: number;
  competition: any[];
}

export interface CustomerDemandSegment {
  segment: string;
  volume: number;
  growth: number;
  characteristics: any[];
}

export interface ChannelDemand {
  channel: string;
  volume: number;
  trend: string;
}

export interface GeographicDemand {
  region: string;
  volume: number;
  distribution: any[];
}

export interface DemandEvent {
  eventType: string;
  impact: number;
  duration: string;
  probability: number;
}

export interface DemandCorrelation {
  factor: string;
  coefficient: number;
  significance: number;
}

export interface DemandAccuracy {
  mape: number;
  rmse: number;
  bias: number;
}

export interface AIDemandAnalysis {
  models: any[];
  insights: any[];
  confidence: number;
}

export interface HumanDemandInsight {
  analyst: string;
  observation: string;
  impact: string;
  confidence: number;
}
