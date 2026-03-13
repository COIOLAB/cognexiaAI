import { StockAlert, StockClassification } from './StockOptimizationTypes';
import { PerformanceData } from './StockOptimizationTypes';

export interface StockMonitoringResult {
  monitoringId: string;
  timestamp: Date;
  stocksMonitored: number;
  results: StockMonitoringData[];
  overallPerformance: OverallStockPerformance;
  alerts: StockAlert[];
  reorders: AutomatedReorder[];
  opportunities: OptimizationOpportunity[];
  insights: MonitoringInsight[];
  recommendations: string[];
  nextMonitoring: Date;
}

export interface StockMonitoringData {
  stockId: string;
  itemName: string;
  classification: StockClassification;
  currentLevel: number;
  reorderPoint: number;
  performance: PerformanceData;
  anomalies: StockAnomaly[];
  alerts: StockAlert[];
  reorderTriggers: ReorderTrigger[];
  opportunities: OptimizationOpportunity[];
  lastMonitored: Date;
}

export interface OverallStockPerformance {
  serviceLevel: number;
  turnoverRate: number;
  stockoutRate: number;
  accuracyLevel: number;
  costEfficiency: number;
  sustainabilityScore: number;
  riskLevel: number;
  complianceLevel: number;
  trends: PerformanceTrend[];
  benchmarks: PerformanceBenchmark[];
}

export interface StockAnomaly {
  anomalyId: string;
  type: string;
  severity: string;
  description: string;
  impact: any;
  timestamp: Date;
  resolution?: string;
}

export interface ReorderTrigger {
  triggerId: string;
  type: string;
  condition: any;
  shouldReorder: boolean;
  urgency: string;
  timestamp: Date;
}

export interface OptimizationOpportunity {
  opportunityId: string;
  type: string;
  description: string;
  potentialImpact: any;
  priority: string;
  implementation: any;
}

export interface MonitoringInsight {
  insightId: string;
  type: string;
  description: string;
  importance: string;
  actionable: boolean;
  timestamp: Date;
}

export interface PerformanceTrend {
  metric: string;
  values: number[];
  direction: string;
  significance: number;
}

export interface PerformanceBenchmark {
  metric: string;
  actual: number;
  target: number;
  industry: number;
  deviation: number;
}

export interface StockDashboard {
  totalStockItems: number;
  activeStockItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockItems: number;
  totalStockValue: number;
  totalOptimizations: number;
  activeOptimizations: number;
  totalReorders: number;
  pendingReorders: number;
  stocksByClassification: Record<string, number>;
  stocksByCategory: Record<string, number>;
  reordersByStatus: Record<string, number>;
  activeAlerts: StockAlert[];
  performanceMetrics: DashboardPerformanceMetrics;
  turnoverMetrics: TurnoverMetrics;
  costMetrics: CostMetrics;
  accuracyMetrics: AccuracyMetrics;
  sustainabilityMetrics: SustainabilityMetrics;
  trends: TrendMetrics[];
  forecasts: ForecastSummary[];
  insights: DashboardInsight[];
  recommendations: string[];
  collaborationMetrics: CollaborationMetrics;
  aiInsights: AIInsight[];
  timestamp: Date;
}

export interface DashboardPerformanceMetrics {
  serviceLevel: number;
  stockAvailability: number;
  orderFulfillment: number;
  deliveryPerformance: number;
  qualityMetrics: number;
  efficiency: number;
}

export interface TurnoverMetrics {
  overall: number;
  byCategory: Record<string, number>;
  trend: number[];
  benchmark: number;
}

export interface CostMetrics {
  totalCost: number;
  holdingCost: number;
  orderingCost: number;
  stockoutCost: number;
  efficiencyRatio: number;
}

export interface AccuracyMetrics {
  inventoryAccuracy: number;
  forecastAccuracy: number;
  dataQuality: number;
  reconciliationRate: number;
}

export interface SustainabilityMetrics {
  carbonFootprint: number;
  wasteReduction: number;
  energyEfficiency: number;
  recyclingRate: number;
  sustainabilityScore: number;
}

export interface TrendMetrics {
  metric: string;
  values: number[];
  period: string;
  trend: string;
}

export interface ForecastSummary {
  category: string;
  accuracy: number;
  confidence: number;
  horizon: string;
  lastUpdate: Date;
}

export interface DashboardInsight {
  type: string;
  description: string;
  priority: string;
  impact: any;
  timestamp: Date;
}

export interface CollaborationMetrics {
  activeCollaborations: number;
  participationRate: number;
  decisionQuality: number;
  responseTime: number;
  satisfactionScore: number;
}

export interface AIInsight {
  type: string;
  description: string;
  confidence: number;
  recommendations: string[];
  timestamp: Date;
}
