import { StockItem } from './StockOptimizationTypes';

export interface OptimizationAlgorithm {
  algorithmId: string;
  name: string;
  type: string;
  parameters: any[];
  performance: any;
}

export interface OptimizationScenario {
  scenarioId: string;
  description: string;
  parameters: any[];
  outcomes: any[];
}

export interface StockState {
  stateId: string;
  metrics: any[];
  performance: any;
  timestamp: Date;
}

export interface RecommendedAction {
  actionId: string;
  type: string;
  description: string;
  impact: any;
  priority: string;
}

export interface OptimizationImpact {
  impactId: string;
  metrics: any[];
  analysis: any;
  benefits: any[];
}

export interface OptimizationImplementation {
  implementationId: string;
  steps: any[];
  timeline: any;
  resources: any[];
}

export interface OptimizationValidation {
  validationId: string;
  methods: any[];
  results: any[];
  confidence: number;
}

export interface OptimizationPerformance {
  performanceId: string;
  metrics: any[];
  improvements: any[];
  analysis: any;
}

export interface OptimizationCost {
  costId: string;
  breakdown: any[];
  total: number;
  analysis: any;
}

export interface OptimizationBenefit {
  benefitId: string;
  type: string;
  value: any;
  timeline: any;
}

export interface OptimizationRisk {
  riskId: string;
  type: string;
  impact: any;
  mitigation: any;
}

export interface OptimizationTimeline {
  timelineId: string;
  phases: any[];
  milestones: any[];
  progress: number;
}

export interface AIOptimizationModel {
  modelId: string;
  type: string;
  parameters: any;
  performance: any;
}

export interface HumanOptimizationCollaboration {
  collaborationId: string;
  participants: any[];
  reviews: any[];
  decisions: any[];
}

export interface OptimizationApproval {
  approvalId: string;
  status: string;
  approver: string;
  comments: string[];
}

export interface OptimizationExecution {
  executionId: string;
  status: string;
  progress: number;
  results: any[];
}

export interface OptimizationMonitoring {
  monitoringId: string;
  metrics: any[];
  alerts: any[];
  reports: any[];
}

export interface OptimizationLearning {
  learningId: string;
  insights: any[];
  improvements: any[];
  adaptations: any[];
}

export interface ReorderTriggerCondition {
  type: string;
  threshold: number;
  currentValue: number;
  parameters: any;
}

export interface ReorderWorkflow {
  workflowId: string;
  steps: any[];
  currentStep: string;
  progress: number;
}

export interface ReorderValidation {
  validationId: string;
  checks: any[];
  results: any[];
  status: string;
}

export interface ReorderConstraint {
  constraintId: string;
  type: string;
  value: any;
  priority: string;
}

export interface ReorderAlternative {
  alternativeId: string;
  supplier: any;
  quantity: number;
  cost: number;
  leadTime: number;
}

export interface AIReorderRecommendation {
  recommendationId: string;
  type: string;
  details: any;
  confidence: number;
}

export interface HumanReorderReview {
  reviewId: string;
  reviewer: string;
  decision: string;
  comments: string[];
}

export interface ReorderCollaboration {
  collaborationId: string;
  participants: any[];
  discussions: any[];
  decisions: any[];
}

export interface ReorderPerformance {
  performanceId: string;
  metrics: any[];
  analysis: any;
  improvements: any[];
}

export interface ReorderTracking {
  trackingId: string;
  status: string;
  location: any;
  timeline: any[];
}

export interface ReorderAlert {
  alertId: string;
  type: string;
  message: string;
  severity: string;
}

export interface ReorderHistory {
  historyId: string;
  timestamp: Date;
  event: string;
  details: any;
}

export interface AnalyticsTimeRange {
  start: Date;
  end: Date;
  interval: string;
}

export interface StockMetric {
  metricId: string;
  name: string;
  value: number;
  unit: string;
}

export interface StockKPI {
  kpiId: string;
  name: string;
  value: number;
  target: number;
}

export interface PerformanceAnalytics {
  metrics: any[];
  trends: any[];
  analysis: any;
}

export interface TurnoverAnalytics {
  rate: number;
  history: any[];
  analysis: any;
}

export interface CostAnalytics {
  breakdown: any[];
  trends: any[];
  optimization: any;
}

export interface AvailabilityAnalytics {
  metrics: any[];
  trends: any[];
  improvements: any[];
}

export interface AccuracyAnalytics {
  metrics: any[];
  deviations: any[];
  improvements: any[];
}

export interface EfficiencyAnalytics {
  metrics: any[];
  bottlenecks: any[];
  optimizations: any[];
}

export interface ProductivityAnalytics {
  metrics: any[];
  trends: any[];
  improvements: any[];
}

export interface QualityAnalytics {
  metrics: any[];
  issues: any[];
  improvements: any[];
}

export interface SustainabilityAnalytics {
  metrics: any[];
  impacts: any[];
  improvements: any[];
}

export interface RiskAnalytics {
  assessments: any[];
  mitigations: any[];
  monitoring: any[];
}

export interface TrendAnalysis {
  trendId: string;
  type: string;
  data: any[];
  analysis: any;
}

export interface PatternAnalysis {
  patternId: string;
  type: string;
  data: any[];
  insights: any[];
}

export interface CorrelationAnalysis {
  correlationId: string;
  variables: string[];
  strength: number;
  significance: number;
}

export interface ForecastAnalysis {
  forecastId: string;
  type: string;
  predictions: any[];
  accuracy: number;
}

export interface BenchmarkAnalysis {
  benchmarkId: string;
  metrics: any[];
  comparisons: any[];
  insights: any[];
}

export interface AnalyticsInsight {
  insightId: string;
  type: string;
  description: string;
  significance: number;
}

export interface AnalyticsRecommendation {
  recommendationId: string;
  type: string;
  description: string;
  impact: any;
  priority: string;
}

export interface AnalyticsAlert {
  alertId: string;
  type: string;
  message: string;
  severity: string;
}

export interface AIAnalytics {
  models: any[];
  insights: any[];
  recommendations: any[];
}

export interface HumanAnalyticsReview {
  reviewerId: string;
  comments: string[];
  insights: any[];
  decisions: any[];
}

export interface AnalyticsCollaboration {
  participants: any[];
  discussions: any[];
  decisions: any[];
}

export interface AnalyticsReporting {
  reports: any[];
  schedules: any[];
  distribution: any[];
}

export interface AnalyticsVisualization {
  charts: any[];
  dashboards: any[];
  interactivity: any[];
}
