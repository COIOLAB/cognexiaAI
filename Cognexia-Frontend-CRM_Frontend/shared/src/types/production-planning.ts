// Production Planning & Scheduling Types with AI/ML Integration

import { BaseEntity } from './core';
import { ProductionOrder, Equipment, Material } from './manufacturing';

export enum ForecastMethod {
  ARIMA = 'ARIMA',
  EXPONENTIAL_SMOOTHING = 'EXPONENTIAL_SMOOTHING',
  LINEAR_REGRESSION = 'LINEAR_REGRESSION',
  NEURAL_NETWORK = 'NEURAL_NETWORK',
  RANDOM_FOREST = 'RANDOM_FOREST',
  LSTM = 'LSTM',
  PROPHET = 'PROPHET',
  ENSEMBLE = 'ENSEMBLE'
}

export enum DemandPattern {
  STEADY = 'STEADY',
  SEASONAL = 'SEASONAL',
  TRENDING = 'TRENDING',
  CYCLICAL = 'CYCLICAL',
  IRREGULAR = 'IRREGULAR',
  LUMPY = 'LUMPY'
}

export enum SchedulingObjective {
  MINIMIZE_MAKESPAN = 'MINIMIZE_MAKESPAN',
  MINIMIZE_TARDINESS = 'MINIMIZE_TARDINESS',
  MAXIMIZE_UTILIZATION = 'MAXIMIZE_UTILIZATION',
  MINIMIZE_COST = 'MINIMIZE_COST',
  MAXIMIZE_THROUGHPUT = 'MAXIMIZE_THROUGHPUT',
  BALANCE_WORKLOAD = 'BALANCE_WORKLOAD',
  MINIMIZE_INVENTORY = 'MINIMIZE_INVENTORY'
}

export enum OptimizationAlgorithm {
  GENETIC_ALGORITHM = 'GENETIC_ALGORITHM',
  SIMULATED_ANNEALING = 'SIMULATED_ANNEALING',
  PARTICLE_SWARM = 'PARTICLE_SWARM',
  ANT_COLONY = 'ANT_COLONY',
  TABU_SEARCH = 'TABU_SEARCH',
  LINEAR_PROGRAMMING = 'LINEAR_PROGRAMMING',
  CONSTRAINT_PROGRAMMING = 'CONSTRAINT_PROGRAMMING',
  REINFORCEMENT_LEARNING = 'REINFORCEMENT_LEARNING'
}

export enum PlanStatus {
  DRAFT = 'DRAFT',
  OPTIMIZING = 'OPTIMIZING',
  OPTIMIZED = 'OPTIMIZED',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NEEDS_REVISION = 'NEEDS_REVISION'
}

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  URGENT = 'URGENT'
}

// Demand Forecasting Interfaces
export interface DemandForecast extends BaseEntity {
  productId: string;
  productName: string;
  forecastHorizon: number; // days
  method: ForecastMethod;
  accuracy: number; // percentage
  confidence: number; // percentage
  demandPattern: DemandPattern;
  seasonality?: SeasonalityInfo;
  trend?: TrendInfo;
  forecasts: DemandForecastPoint[];
  actualDemand: ActualDemandPoint[];
  modelMetrics: ModelMetrics;
  lastUpdated: Date;
  nextUpdate: Date;
}

export interface DemandForecastPoint {
  date: Date;
  predictedDemand: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  externalFactors?: ExternalFactor[];
}

export interface ActualDemandPoint {
  date: Date;
  actualDemand: number;
  variance?: number;
  notes?: string;
}

export interface SeasonalityInfo {
  hasSeasonality: boolean;
  seasonLength: number; // days
  seasonalIndices: number[];
  seasonalStrength: number;
}

export interface TrendInfo {
  hasTrend: boolean;
  trendDirection: 'up' | 'down' | 'stable';
  trendStrength: number;
  changePoints: Date[];
}

export interface ExternalFactor {
  factorName: string;
  impact: number; // -1 to 1
  confidence: number;
  source: string;
}

export interface ModelMetrics {
  mae: number; // Mean Absolute Error
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Square Error
  r2: number; // R-squared
  aic?: number; // Akaike Information Criterion
  bic?: number; // Bayesian Information Criterion
  trainingPeriod: {
    startDate: Date;
    endDate: Date;
  };
  validationPeriod?: {
    startDate: Date;
    endDate: Date;
  };
}

// Production Planning Interfaces
export interface ProductionPlan extends BaseEntity {
  planName: string;
  planType: 'master' | 'detailed' | 'operational';
  planHorizon: number; // days
  status: PlanStatus;
  objectives: PlanningObjective[];
  constraints: PlanningConstraint[];
  schedules: ProductionSchedule[];
  kpis: PlanningKPI[];
  optimizationResults: OptimizationResult[];
  approvals: PlanApproval[];
  revisions: PlanRevision[];
  effectiveDate: Date;
  expiryDate?: Date;
}

export interface PlanningObjective {
  type: SchedulingObjective;
  weight: number; // 0-1
  target?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface PlanningConstraint {
  constraintType: string;
  description: string;
  isHard: boolean; // true for hard constraints, false for soft
  penalty?: number;
  parameters: Record<string, any>;
}

export interface ProductionSchedule extends BaseEntity {
  productionPlanId: string;
  productionLineId: string;
  productionLineName: string;
  orders: ScheduledOrder[];
  capacity: CapacityPlan;
  utilization: UtilizationMetrics;
  bottlenecks: Bottleneck[];
  bufferTime: number; // minutes
  setupTime: number; // minutes
  totalMakespan: number; // minutes
}

export interface ScheduledOrder {
  productionOrderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  quantity: number;
  priority: number;
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  estimatedDuration: number; // minutes
  dependencies: string[]; // other order IDs
  assignedResources: AssignedResource[];
  operations: ScheduledOperation[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'delayed';
  actualStartTime?: Date;
  actualEndTime?: Date;
  delayReason?: string;
}

export interface ScheduledOperation {
  operationId: string;
  operationName: string;
  workstationId: string;
  workstationName: string;
  sequence: number;
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  estimatedDuration: number;
  setupTime: number;
  assignedWorkers: string[];
  requiredSkills: string[];
  toolRequirements: string[];
  qualityCheckpoints: string[];
  predecessor?: string;
  successor?: string;
}

export interface AssignedResource {
  resourceType: 'equipment' | 'worker' | 'material' | 'tool';
  resourceId: string;
  resourceName: string;
  quantity: number;
  utilization: number;
  availability: ResourceAvailability[];
}

export interface ResourceAvailability {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  reason?: string;
  capacity?: number;
}

export interface CapacityPlan {
  workstations: WorkstationCapacity[];
  totalCapacity: number;
  availableCapacity: number;
  utilizationRate: number;
  bottleneckCapacity: number;
  constrainingResource: string;
}

export interface WorkstationCapacity {
  workstationId: string;
  workstationName: string;
  nominalCapacity: number; // units per hour
  effectiveCapacity: number;
  scheduledLoad: number;
  utilization: number;
  efficiency: number;
  availability: number;
}

export interface UtilizationMetrics {
  overall: number;
  byWorkstation: Record<string, number>;
  byShift: Record<string, number>;
  byDay: Record<string, number>;
  byProduct: Record<string, number>;
  overtime: number;
  idleTime: number;
}

export interface Bottleneck {
  resourceId: string;
  resourceName: string;
  resourceType: string;
  severity: number; // 1-10
  impact: number; // hours of delay
  duration: number; // hours
  affectedOrders: string[];
  suggestions: BottleneckSuggestion[];
}

export interface BottleneckSuggestion {
  type: 'resource_addition' | 'schedule_adjustment' | 'process_improvement' | 'alternative_routing';
  description: string;
  estimatedImpact: number;
  cost?: number;
  implementationTime?: number;
  priority: 'low' | 'medium' | 'high';
}

// AI/ML Optimization Interfaces
export interface OptimizationResult extends BaseEntity {
  optimizationId: string;
  algorithm: OptimizationAlgorithm;
  objectives: SchedulingObjective[];
  parameters: OptimizationParameters;
  executionTime: number; // milliseconds
  iterations: number;
  convergence: ConvergenceMetrics;
  solutions: OptimizationSolution[];
  bestSolution: OptimizationSolution;
  improvements: ImprovementMetrics;
  recommendations: string[];
}

export interface OptimizationParameters {
  populationSize?: number;
  generations?: number;
  mutationRate?: number;
  crossoverRate?: number;
  temperature?: number; // for simulated annealing
  coolingRate?: number;
  tabooListSize?: number;
  learningRate?: number; // for RL
  epsilon?: number; // for RL
  customParameters?: Record<string, any>;
}

export interface ConvergenceMetrics {
  hasConverged: boolean;
  finalObjectiveValue: number;
  improvementRate: number;
  stabilityMeasure: number;
  diversityMeasure: number;
}

export interface OptimizationSolution {
  solutionId: string;
  objectiveValue: number;
  feasible: boolean;
  constraintViolations: ConstraintViolation[];
  schedule: ProductionSchedule[];
  kpis: SolutionKPI[];
  rank: number;
}

export interface ConstraintViolation {
  constraintId: string;
  constraintName: string;
  severity: number;
  description: string;
  suggestedFix?: string;
}

export interface SolutionKPI {
  name: string;
  value: number;
  target?: number;
  unit: string;
  category: string;
}

export interface ImprovementMetrics {
  makespanReduction: number; // percentage
  utilizationImprovement: number;
  costReduction: number;
  tardinesReduction: number;
  throughputIncrease: number;
  inventoryReduction: number;
}

// Planning KPIs and Analytics
export interface PlanningKPI extends BaseEntity {
  kpiName: string;
  category: 'efficiency' | 'utilization' | 'quality' | 'delivery' | 'cost';
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'improving' | 'declining' | 'stable';
  benchmark: number;
  calculationMethod: string;
  updateFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly';
  historicalData: KPIDataPoint[];
}

export interface KPIDataPoint {
  timestamp: Date;
  value: number;
  context?: Record<string, any>;
}

export interface PlanApproval {
  approverId: string;
  approverName: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approvalDate?: Date;
  conditions?: string[];
}

export interface PlanRevision {
  revisionNumber: number;
  revisorId: string;
  revisionDate: Date;
  reason: string;
  changes: PlanChange[];
  impact: RevisionImpact;
}

export interface PlanChange {
  changeType: 'order_added' | 'order_removed' | 'order_modified' | 'resource_changed' | 'constraint_modified';
  description: string;
  oldValue?: any;
  newValue?: any;
  affectedEntities: string[];
}

export interface RevisionImpact {
  scheduleChanges: number;
  resourceReallocation: number;
  deliveryDateChanges: number;
  costImpact: number;
  riskAssessment: string;
}

// Real-time Monitoring and Alerts
export interface ProductionAlert extends BaseEntity {
  alertType: 'delay' | 'quality_issue' | 'resource_shortage' | 'breakdown' | 'bottleneck' | 'demand_spike';
  severity: AlertSeverity;
  title: string;
  description: string;
  affectedEntities: AlertEntity[];
  rootCause?: string;
  recommendedActions: string[];
  estimatedImpact: AlertImpact;
  resolved: boolean;
  resolvedBy?: string;
  resolvedDate?: Date;
  resolution?: string;
}

export interface AlertEntity {
  entityType: 'order' | 'resource' | 'workstation' | 'product';
  entityId: string;
  entityName: string;
}

export interface AlertImpact {
  delayHours: number;
  affectedOrders: number;
  costImpact: number;
  qualityRisk: 'low' | 'medium' | 'high';
  deliveryRisk: 'low' | 'medium' | 'high';
}

// What-If Analysis
export interface WhatIfScenario extends BaseEntity {
  scenarioName: string;
  description: string;
  baselineId: string; // reference to current plan
  changes: ScenarioChange[];
  results: ScenarioResult;
  assumptions: string[];
  riskFactors: RiskFactor[];
  status: 'draft' | 'analyzing' | 'completed';
}

export interface ScenarioChange {
  changeType: 'demand' | 'capacity' | 'resource' | 'constraint' | 'external';
  description: string;
  parameters: Record<string, any>;
  magnitude: number;
  timeline: {
    startDate: Date;
    endDate: Date;
  };
}

export interface ScenarioResult {
  kpiComparison: KPIComparison[];
  scheduleComparison: ScheduleComparison;
  resourceImpact: ResourceImpact[];
  financialImpact: FinancialImpact;
  riskAssessment: RiskAssessment;
  recommendations: string[];
}

export interface KPIComparison {
  kpiName: string;
  baselineValue: number;
  scenarioValue: number;
  change: number;
  changePercentage: number;
  significance: 'low' | 'medium' | 'high';
}

export interface ScheduleComparison {
  ordersAffected: number;
  averageDelayChange: number;
  makespanChange: number;
  utilizationChange: number;
}

export interface ResourceImpact {
  resourceId: string;
  resourceName: string;
  utilizationChange: number;
  capacityRequirement: number;
  bottleneckRisk: number;
}

export interface FinancialImpact {
  productionCostChange: number;
  inventoryCostChange: number;
  delayPenalties: number;
  overtimeCosts: number;
  netImpact: number;
}

export interface RiskFactor {
  riskType: string;
  probability: number;
  impact: number;
  mitigation: string[];
  contingencyPlan?: string;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  mitigationStrategies: string[];
  contingencyPlans: string[];
}

// Machine Learning Model Management
export interface MLModel extends BaseEntity {
  modelName: string;
  modelType: 'demand_forecast' | 'capacity_optimization' | 'quality_prediction' | 'maintenance_prediction';
  algorithm: string;
  version: string;
  trainingData: TrainingDataInfo;
  performance: ModelPerformance;
  hyperparameters: Record<string, any>;
  features: ModelFeature[];
  deploymentStatus: 'training' | 'testing' | 'deployed' | 'deprecated';
  lastRetrained: Date;
  nextRetraining: Date;
}

export interface TrainingDataInfo {
  dataSource: string;
  dataRange: {
    startDate: Date;
    endDate: Date;
  };
  sampleSize: number;
  features: string[];
  dataQuality: DataQualityMetrics;
}

export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  outlierPercentage: number;
  missingValuePercentage: number;
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc?: number;
  crossValidationScore: number;
  testSetPerformance: number;
  productionPerformance?: number;
}

export interface ModelFeature {
  featureName: string;
  importance: number;
  dataType: string;
  description: string;
  transformation?: string;
}

// Digital Twin Integration
export interface DigitalTwin extends BaseEntity {
  twinName: string;
  physicalAssetId: string;
  physicalAssetType: string;
  twinType: 'equipment' | 'process' | 'system' | 'facility';
  synchronizationStatus: 'synced' | 'syncing' | 'out_of_sync' | 'error';
  lastSync: Date;
  model: DigitalTwinModel;
  sensors: TwinSensor[];
  simulations: TwinSimulation[];
  predictions: TwinPrediction[];
  optimizations: TwinOptimization[];
}

export interface DigitalTwinModel {
  modelType: string;
  parameters: Record<string, any>;
  equations: string[];
  constraints: string[];
  accuracy: number;
  validationResults: Record<string, number>;
}

export interface TwinSensor {
  sensorId: string;
  sensorType: string;
  parameter: string;
  unit: string;
  currentValue: number;
  lastReading: Date;
  status: 'online' | 'offline' | 'error';
}

export interface TwinSimulation {
  simulationId: string;
  scenarioName: string;
  parameters: Record<string, any>;
  results: SimulationResult[];
  executionTime: number;
  accuracy: number;
}

export interface SimulationResult {
  parameter: string;
  value: number;
  timestamp: Date;
  confidence: number;
}

export interface TwinPrediction {
  predictionType: string;
  horizon: number; // hours
  confidence: number;
  value: number;
  timestamp: Date;
  factors: string[];
}

export interface TwinOptimization {
  optimizationType: string;
  objective: string;
  constraints: string[];
  solution: Record<string, any>;
  improvement: number;
  feasibility: number;
}
