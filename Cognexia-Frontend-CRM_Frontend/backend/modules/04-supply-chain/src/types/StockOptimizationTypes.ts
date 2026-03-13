import { GeographicLocation } from './SupplyChainTypes';

export enum StockOptimizationType {
  INVENTORY_LEVEL = 'inventory_level',
  REORDER_POINT = 'reorder_point',
  SAFETY_STOCK = 'safety_stock',
  LEAD_TIME = 'lead_time',
  COST = 'cost',
  SERVICE_LEVEL = 'service_level'
}

export enum ReorderStatus {
  CREATED = 'created',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SENT = 'sent',
  RECEIVED = 'received',
  CANCELLED = 'cancelled'
}

export enum ReorderPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ReorderUrgency {
  NORMAL = 'normal',
  URGENT = 'urgent',
  EMERGENCY = 'emergency'
}

export enum AlertStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum CollaborationStatus {
  INITIATED = 'initiated',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum OptimizationStatus {
  CREATED = 'created',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface StockItem {
  stockId: string;
  name: string;
  description: string;
  category: string;
  classification: string;
  unitOfMeasure: string;
  specifications: string[];
  currentStock: number;
  stockLevels: StockLevel;
  locations: StockLocation[];
  suppliers: string[];
  costData: CostData;
  demandData: DemandData;
  forecastData: ForecastData;
  optimization: StockOptimization;
  quality: QualityData;
  lifecycle: LifecycleData;
  constraints: string[];
  performance: PerformanceData;
  analytics: StockAnalytics;
  aiInsights: AIInsight[];
  humanInput: HumanInput[];
  alerts: StockAlert[];
  history: StockHistory[];
  digitalTwin: DigitalTwin;
  collaboration: StockCollaboration;
  sustainability: SustainabilityData;
  compliance: ComplianceData;
  createdAt: Date;
  lastUpdated: Date;
}

export interface StockLevel {
  minimum: number;
  maximum: number;
  reorderPoint: number;
  safetyStock: number;
  economicOrderQuantity: number;
}

export interface StockLocation {
  locationId: string;
  name: string;
  type: string;
  address: GeographicLocation;
  capacity: number;
  currentUtilization: number;
}

export interface CostData {
  unitCost: number;
  holdingCost: number;
  orderingCost: number;
  transportationCost: number;
  totalCost: number;
}

export interface DemandData {
  historicalDemand: number[];
  seasonality: number;
  trends: string[];
  variability: number;
  patterns: string[];
}

export interface ForecastData {
  forecastId: string;
  timeRange: string;
  predictions: number[];
  accuracy: number;
  confidence: number;
  methodology: string;
  assumptions: string[];
  adjustments: string[];
  validation: ForecastValidation;
  performance: ForecastPerformance;
  aiModels: AIForecastModel[];
  humanReview: HumanForecastReview;
  collaboration: ForecastCollaboration;
  alerts: ForecastAlert[];
  benchmarks: ForecastBenchmark[];
  sensitivity: SensitivityAnalysis;
  riskAssessment: ForecastRiskAssessment;
  recommendations: ForecastRecommendation[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface ForecastValidation {
  validationId: string;
  methods: string[];
  results: any[];
  accuracy: number;
  reliability: number;
}

export interface ForecastPerformance {
  performanceId: string;
  metrics: any[];
  scores: any[];
  improvements: any[];
}

export interface AIForecastModel {
  modelId: string;
  type: string;
  parameters: any;
  performance: any;
}

export interface HumanForecastReview {
  reviewId: string;
  reviewer: string;
  comments: string[];
  adjustments: any[];
  approval: boolean;
}

export interface ForecastCollaboration {
  collaborationId: string;
  participants: string[];
  discussions: any[];
  decisions: any[];
}

export interface ForecastAlert {
  alertId: string;
  type: string;
  message: string;
  severity: string;
}

export interface ForecastBenchmark {
  benchmarkId: string;
  metrics: any[];
  comparisons: any[];
  analysis: any;
}

export interface SensitivityAnalysis {
  analysisId: string;
  parameters: any[];
  impacts: any[];
  recommendations: any[];
}

export interface ForecastRiskAssessment {
  assessmentId: string;
  risks: any[];
  impacts: any[];
  mitigations: any[];
}

export interface ForecastRecommendation {
  recommendationId: string;
  type: string;
  description: string;
  impact: any;
  implementation: any;
}

export interface StockOptimization {
  optimizationId: string;
  optimizationType: StockOptimizationType;
  objectives: OptimizationObjective[];
  constraints: OptimizationConstraint[];
  parameters: OptimizationParameter[];
  algorithms: OptimizationAlgorithm[];
  scenarios: OptimizationScenario[];
  currentState: StockState;
  recommendedActions: RecommendedAction[];
  impact: OptimizationImpact;
  implementation: OptimizationImplementation;
  validation: OptimizationValidation;
  performance: OptimizationPerformance;
  costs: OptimizationCost;
  benefits: OptimizationBenefit[];
  risks: OptimizationRisk[];
  timeline: OptimizationTimeline;
  aiModel: AIOptimizationModel;
  humanCollaboration: HumanOptimizationCollaboration;
  approval: OptimizationApproval;
  execution: OptimizationExecution;
  monitoring: OptimizationMonitoring;
  learning: OptimizationLearning;
  status: OptimizationStatus;
  confidence: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface OptimizationObjective {
  objectiveId: string;
  type: string;
  target: any;
  weight: number;
  constraints: any[];
}

export interface OptimizationConstraint {
  constraintId: string;
  type: string;
  parameters: any;
  priority: string;
}

export interface OptimizationParameter {
  parameterId: string;
  name: string;
  value: any;
  range: any;
}

export interface OptimizationAlgorithm {
  algorithmId: string;
  type: string;
  parameters: any;
  performance: any;
}

export interface OptimizationScenario {
  scenarioId: string;
  description: string;
  parameters: any;
  outcomes: any;
}

export interface StockState {
  stateId: string;
  metrics: any;
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

export interface QualityData {
  qualityId: string;
  metrics: any[];
  standards: string[];
  inspections: any[];
  issues: any[];
}

export interface LifecycleData {
  lifecycleId: string;
  stage: string;
  timeline: any;
  events: any[];
  transitions: any[];
}

export interface PerformanceData {
  performanceId: string;
  metrics: any[];
  kpis: any[];
  analysis: any;
  improvements: any[];
}

export interface StockAnalytics {
  analyticsId: string;
  stockId: string;
  timeRange: AnalyticsTimeRange;
  metrics: StockMetric[];
  kpis: StockKPI[];
  performance: PerformanceAnalytics;
  turnover: TurnoverAnalytics;
  cost: CostAnalytics;
  availability: AvailabilityAnalytics;
  accuracy: AccuracyAnalytics;
  efficiency: EfficiencyAnalytics;
  productivity: ProductivityAnalytics;
  quality: QualityAnalytics;
  sustainability: SustainabilityAnalytics;
  risk: RiskAnalytics;
  trends: TrendAnalysis[];
  patterns: PatternAnalysis[];
  correlations: CorrelationAnalysis[];
  forecasts: ForecastAnalysis[];
  benchmarks: BenchmarkAnalysis[];
  insights: AnalyticsInsight[];
  recommendations: AnalyticsRecommendation[];
  alerts: AnalyticsAlert[];
  aiAnalysis: AIAnalytics;
  humanReview: HumanAnalyticsReview;
  collaboration: AnalyticsCollaboration;
  reporting: AnalyticsReporting;
  visualization: AnalyticsVisualization;
  generatedAt: Date;
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

export interface AIInsight {
  insightId: string;
  type: string;
  description: string;
  confidence: number;
}

export interface HumanInput {
  inputId: string;
  userId: string;
  type: string;
  content: any;
}

export interface StockAlert {
  alertId: string;
  type: string;
  message: string;
  description: string;
  context: StockAlertContext;
  impact: AlertImpact;
  recommendations: AlertRecommendation[];
  actions: AlertAction[];
  escalation: AlertEscalation;
  recipients: AlertRecipient[];
  channels: NotificationChannel[];
  status: AlertStatus;
  acknowledgment: AlertAcknowledgment;
  resolution: AlertResolution;
  performance: AlertPerformance;
  learning: AlertLearning;
  aiGenerated: boolean;
  humanReviewed: boolean;
  collaboration: AlertCollaboration;
  history: AlertHistory[];
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

export interface StockAlertContext {
  contextId: string;
  data: any;
  analysis: any;
}

export interface AlertImpact {
  severity: string;
  scope: string;
  metrics: any[];
}

export interface AlertRecommendation {
  recommendationId: string;
  type: string;
  description: string;
  priority: string;
}

export interface AlertAction {
  actionId: string;
  type: string;
  description: string;
  status: string;
}

export interface AlertEscalation {
  level: string;
  protocol: any;
  timeline: any;
}

export interface AlertRecipient {
  recipientId: string;
  type: string;
  contact: any;
}

export interface NotificationChannel {
  channelId: string;
  type: string;
  config: any;
}

export interface AlertAcknowledgment {
  by: string;
  timestamp: Date;
  notes: string;
}

export interface AlertResolution {
  by: string;
  timestamp: Date;
  solution: string;
}

export interface AlertPerformance {
  metrics: any[];
  analysis: any;
}

export interface AlertLearning {
  insights: any[];
  improvements: any[];
}

export interface AlertCollaboration {
  participants: any[];
  interactions: any[];
}

export interface AlertHistory {
  eventId: string;
  type: string;
  timestamp: Date;
  details: any;
}

export interface StockHistory {
  historyId: string;
  type: string;
  timestamp: Date;
  changes: any;
  reason: string;
}

export interface DigitalTwin {
  twinId: string;
  model: any;
  data: any;
  simulations: any[];
}

export interface StockCollaboration {
  collaborationId: string;
  stockId: string;
  collaborationType: StockCollaborationType[];
  participants: StockCollaborationParticipant[];
  aiAgents: AIStockAgent[];
  sessions: CollaborationSession[];
  decisions: CollaborativeDecision[];
  planning: CollaborativePlanning[];
  forecasting: CollaborativeForecasting[];
  optimization: CollaborativeOptimization[];
  reviews: CollaborativeReview[];
  approvals: CollaborativeApproval[];
  feedback: CollaborationFeedback[];
  consensus: CollaborationConsensus;
  conflicts: CollaborationConflict[];
  resolutions: ConflictResolution[];
  knowledge: SharedKnowledge[];
  learning: CollaborativeLearning;
  tools: CollaborationTool[];
  workspace: CollaborativeWorkspace;
  communication: CollaborationCommunication;
  coordination: CollaborationCoordination;
  effectiveness: CollaborationEffectiveness;
  satisfaction: CollaborationSatisfaction;
  outcomes: CollaborationOutcome[];
  status: CollaborationStatus;
  startedAt: Date;
  completedAt?: Date;
}

export interface StockCollaborationType {
  type: string;
  description: string;
  requirements: any[];
}

export interface StockCollaborationParticipant {
  participantId: string;
  type: string;
  role: string;
  permissions: string[];
}

export interface AIStockAgent {
  agentId: string;
  type: string;
  capabilities: string[];
  performance: any;
}

export interface CollaborationSession {
  sessionId: string;
  type: string;
  participants: string[];
  activities: any[];
}

export interface CollaborativeDecision {
  decisionId: string;
  type: string;
  context: any;
  outcome: any;
}

export interface CollaborativePlanning {
  planningId: string;
  objectives: any[];
  strategies: any[];
  outcomes: any[];
}

export interface CollaborativeForecasting {
  forecastingId: string;
  methods: any[];
  results: any[];
  consensus: any;
}

export interface CollaborativeOptimization {
  optimizationId: string;
  objectives: any[];
  solutions: any[];
  evaluation: any;
}

export interface CollaborativeReview {
  reviewId: string;
  type: string;
  content: any;
  feedback: any[];
}

export interface CollaborativeApproval {
  approvalId: string;
  type: string;
  status: string;
  details: any;
}

export interface CollaborationFeedback {
  feedbackId: string;
  type: string;
  content: any;
  rating: number;
}

export interface CollaborationConsensus {
  consensusId: string;
  topic: string;
  agreement: any;
  process: any;
}

export interface CollaborationConflict {
  conflictId: string;
  type: string;
  parties: string[];
  status: string;
}

export interface ConflictResolution {
  resolutionId: string;
  method: string;
  outcome: any;
  acceptance: any;
}

export interface SharedKnowledge {
  knowledgeId: string;
  type: string;
  content: any;
  usage: any;
}

export interface CollaborativeLearning {
  learningId: string;
  objectives: any[];
  progress: any;
  outcomes: any[];
}

export interface CollaborationTool {
  toolId: string;
  type: string;
  features: any[];
  usage: any;
}

export interface CollaborativeWorkspace {
  workspaceId: string;
  type: string;
  resources: any[];
  activities: any[];
}

export interface CollaborationCommunication {
  communicationId: string;
  channels: any[];
  interactions: any[];
  effectiveness: any;
}

export interface CollaborationCoordination {
  coordinationId: string;
  mechanisms: any[];
  activities: any[];
  performance: any;
}

export interface CollaborationEffectiveness {
  effectivenessId: string;
  metrics: any[];
  analysis: any;
  improvements: any[];
}

export interface CollaborationSatisfaction {
  satisfactionId: string;
  metrics: any[];
  feedback: any[];
  improvements: any[];
}

export interface CollaborationOutcome {
  outcomeId: string;
  type: string;
  results: any;
  impact: any;
}

export interface SustainabilityData {
  sustainabilityId: string;
  metrics: any[];
  initiatives: any[];
  impact: any;
}

export interface ComplianceData {
  complianceId: string;
  requirements: any[];
  status: any;
  audits: any[];
}
