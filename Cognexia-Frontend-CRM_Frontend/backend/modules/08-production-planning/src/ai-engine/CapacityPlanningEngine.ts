import { logger } from '../../../utils/logger';
import { CacheService } from '../../../services/CacheService';
import { SocketService } from '../../../services/SocketService';

export interface CapacityPlanningInput {
  planningMode: 'finite' | 'infinite';
  planningHorizon: number; // weeks
  productionOrders: CapacityOrderData[];
  resources: CapacityResourceData[];
  iotData: IoTDeviceData[];
  historicalUtilization: UtilizationHistory[];
  constraints: CapacityConstraint[];
  objectives: CapacityObjective[];
}

export interface CapacityOrderData {
  orderId: string;
  productId: string;
  quantity: number;
  priority: number;
  dueDate: Date;
  operations: CapacityOperation[];
  flexibilityRating: number; // 0-1, how flexible the schedule can be
  customerImportance: 'low' | 'medium' | 'high' | 'vip';
}

export interface CapacityOperation {
  operationId: string;
  operationName: string;
  resourceRequirements: CapacityResourceRequirement[];
  standardTime: number; // minutes
  setupTime: number;
  alternativeRoutes?: AlternativeRoute[];
  qualityRequirements: QualityRequirement[];
  skillRequirements: SkillRequirement[];
}

export interface CapacityResourceRequirement {
  resourceType: string;
  resourceId?: string;
  alternativeResources: string[];
  quantity: number;
  utilizationFactor: number; // efficiency factor
  priority: number;
}

export interface AlternativeRoute {
  routeId: string;
  operations: CapacityOperation[];
  efficiency: number;
  cost: number;
  leadTime: number;
  qualityImpact: number;
}

export interface CapacityResourceData {
  resourceId: string;
  resourceName: string;
  resourceType: 'machine' | 'workstation' | 'line' | 'cell';
  capacity: ResourceCapacity;
  availability: AvailabilitySchedule[];
  maintenanceSchedule: MaintenanceSchedule[];
  iotDevices: string[];
  constraints: ResourceConstraint[];
  capabilities: ResourceCapability[];
  energyProfile: ResourceEnergyProfile;
  location: LocationData;
  parentResource?: string;
  childResources?: string[];
}

export interface ResourceCapacity {
  maxThroughput: number; // units per hour
  maxConcurrentJobs: number;
  maxOperatingHours: number; // per day
  bufferCapacity: number; // percentage
  degradationFactor: number; // capacity loss over time
}

export interface AvailabilitySchedule {
  startTime: Date;
  endTime: Date;
  availableCapacity: number; // percentage
  shift: string;
  restrictions: string[];
  notes?: string;
}

export interface MaintenanceSchedule {
  maintenanceId: string;
  startTime: Date;
  endTime: Date;
  type: 'preventive' | 'predictive' | 'corrective' | 'emergency';
  capacityImpact: number; // percentage loss
  description: string;
  priority: number;
  canDefer: boolean;
  maxDeferralDays: number;
}

export interface IoTDeviceData {
  deviceId: string;
  deviceType: 'sensor' | 'actuator' | 'gateway' | 'controller';
  resourceId: string;
  location: string;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  lastUpdate: Date;
  metrics: IoTMetric[];
  alerts: IoTAlert[];
  capabilities: string[];
}

export interface IoTMetric {
  metricName: string;
  value: number;
  unit: string;
  timestamp: Date;
  threshold?: IoTThreshold;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface IoTThreshold {
  warning: number;
  critical: number;
  optimal?: number;
}

export interface IoTAlert {
  alertId: string;
  alertType: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export interface UtilizationHistory {
  resourceId: string;
  timestamp: Date;
  plannedUtilization: number;
  actualUtilization: number;
  efficiency: number;
  quality: number;
  downtime: number;
  downtimeReasons: DowntimeReason[];
}

export interface DowntimeReason {
  reason: string;
  category: 'planned' | 'unplanned';
  duration: number; // minutes
  cost: number;
  preventable: boolean;
}

export interface CapacityConstraint {
  constraintId: string;
  type: 'throughput' | 'utilization' | 'quality' | 'energy' | 'environmental';
  resourceIds: string[];
  limit: number;
  timeWindow: string; // '1h', '8h', '24h', '1w'
  isHard: boolean;
  penalty: number;
  description: string;
}

export interface CapacityObjective {
  type: 'maximize_utilization' | 'minimize_idle_time' | 'balance_load' | 'minimize_energy' | 'maximize_throughput';
  weight: number;
  target?: number;
  tolerance?: number;
  priority: number;
}

export interface CapacityPlanningResult {
  planId: string;
  planningMode: 'finite' | 'infinite';
  generatedAt: Date;
  validUntil: Date;
  capacityPlans: ResourceCapacityPlan[];
  bottlenecks: BottleneckAnalysis[];
  utilizationForecast: UtilizationForecast[];
  recommendations: CapacityRecommendation[];
  alerts: CapacityAlert[];
  kpis: CapacityKPI[];
  whatIfScenarios?: WhatIfScenario[];
  sustainability: SustainabilityImpact;
}

export interface ResourceCapacityPlan {
  resourceId: string;
  resourceName: string;
  planningHorizon: PlanningPeriod[];
  totalCapacity: number;
  allocatedCapacity: number;
  availableCapacity: number;
  utilizationRate: number;
  efficiency: number;
  loadDistribution: LoadDistribution[];
  constraints: ConstraintStatus[];
}

export interface PlanningPeriod {
  startTime: Date;
  endTime: Date;
  plannedCapacity: number;
  allocatedCapacity: number;
  utilizationRate: number;
  assignments: CapacityAssignment[];
  iotMetrics: IoTMetric[];
  predictedIssues: PredictedIssue[];
}

export interface CapacityAssignment {
  orderId: string;
  operationId: string;
  allocatedTime: number;
  allocatedCapacity: number;
  priority: number;
  flexibility: number;
  qualityRequirements: string[];
}

export interface LoadDistribution {
  timeSlot: Date;
  load: number; // percentage
  peakHours: boolean;
  capacity: number;
  demand: number;
  buffer: number;
}

export interface BottleneckAnalysis {
  bottleneckId: string;
  resourceId: string;
  resourceName: string;
  severity: number; // 1-10
  duration: number; // hours
  impact: BottleneckImpact;
  rootCauses: RootCause[];
  resolutionOptions: BottleneckResolution[];
  predictedOccurrence: Date;
  confidence: number; // 0-1
  affectedOrders: string[];
}

export interface BottleneckImpact {
  throughputReduction: number; // percentage
  delayedOrders: number;
  estimatedCost: number;
  qualityRisk: 'low' | 'medium' | 'high';
  cascadingEffects: CascadingEffect[];
}

export interface CascadingEffect {
  affectedResource: string;
  delayDuration: number;
  impactSeverity: number;
  mitigationPossible: boolean;
}

export interface RootCause {
  causeId: string;
  description: string;
  category: 'capacity' | 'quality' | 'maintenance' | 'skill' | 'material' | 'process';
  probability: number; // 0-1
  impact: number; // 1-10
  preventable: boolean;
  historicalOccurrence: number;
}

export interface BottleneckResolution {
  resolutionId: string;
  strategy: 'increase_capacity' | 'reschedule' | 'alternative_routing' | 'overtime' | 'outsourcing';
  description: string;
  estimatedCost: number;
  implementationTime: number; // hours
  effectiveness: number; // 0-1
  sideEffects: string[];
  feasibility: number; // 0-1
}

export interface UtilizationForecast {
  resourceId: string;
  forecastPeriods: ForecastPeriod[];
  confidence: number;
  trendAnalysis: TrendAnalysis;
  seasonalPatterns: SeasonalPattern[];
  anomalyPrediction: AnomalyPrediction[];
}

export interface ForecastPeriod {
  startTime: Date;
  endTime: Date;
  predictedUtilization: number;
  confidenceInterval: ConfidenceInterval;
  factorsConsidered: ForecastFactor[];
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
  confidence: number; // 0-1
}

export interface ForecastFactor {
  factor: string;
  weight: number;
  impact: number;
  reliability: number;
}

export interface TrendAnalysis {
  overallTrend: 'increasing' | 'stable' | 'decreasing';
  trendStrength: number;
  changePoints: Date[];
  volatility: number;
  cyclicality: boolean;
}

export interface SeasonalPattern {
  patternType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  amplitude: number;
  phase: number;
  confidence: number;
}

export interface AnomalyPrediction {
  predictedDate: Date;
  anomalyType: string;
  severity: number;
  probability: number;
  impact: string;
  mitigationActions: string[];
}

export interface CapacityRecommendation {
  recommendationId: string;
  type: 'capacity_increase' | 'load_balancing' | 'process_improvement' | 'maintenance_scheduling' | 'automation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  rationale: string;
  expectedBenefits: ExpectedBenefit[];
  implementationPlan: ImplementationStep[];
  cost: number;
  paybackPeriod: number; // months
  riskLevel: 'low' | 'medium' | 'high';
  dependencies: string[];
}

export interface ExpectedBenefit {
  benefitType: string;
  quantifiedValue: number;
  unit: string;
  confidence: number;
  timeframe: string;
}

export interface ImplementationStep {
  stepId: string;
  description: string;
  duration: number; // days
  cost: number;
  dependencies: string[];
  riskLevel: 'low' | 'medium' | 'high';
  requiredResources: string[];
}

export interface CapacityAlert {
  alertId: string;
  alertType: 'capacity_exceeded' | 'bottleneck_predicted' | 'utilization_low' | 'maintenance_due' | 'iot_anomaly';
  severity: 'info' | 'warning' | 'critical';
  resourceId: string;
  message: string;
  timestamp: Date;
  predictedImpact: string;
  recommendedActions: string[];
  autoResolved: boolean;
  escalationLevel: number;
}

// Supporting interfaces
interface QualityRequirement {
  parameter: string;
  target: number;
  tolerance: number;
  critical: boolean;
}

interface SkillRequirement {
  skillId: string;
  level: number;
  certification: boolean;
}

interface ResourceConstraint {
  constraintType: string;
  value: number;
  unit: string;
}

interface ResourceCapability {
  capability: string;
  rating: number;
  certified: boolean;
}

interface ResourceEnergyProfile {
  idlePower: number;
  operatingPower: number;
  peakPower: number;
  efficiency: number;
}

interface LocationData {
  area: string;
  building: string;
  floor: string;
  coordinates?: { x: number; y: number };
}

interface ConstraintStatus {
  constraintId: string;
  status: 'satisfied' | 'violated' | 'at_risk';
  currentValue: number;
  limit: number;
  violationTime?: Date;
}

interface PredictedIssue {
  issueType: string;
  probability: number;
  predictedTime: Date;
  impact: string;
  preventionActions: string[];
}

interface WhatIfScenario {
  scenarioId: string;
  description: string;
  results: CapacityPlanningResult;
}

interface SustainabilityImpact {
  energyConsumption: number;
  carbonFootprint: number;
  efficiency: number;
  wasteReduction: number;
  recommendations: string[];
}

interface CapacityKPI {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
}

export class CapacityPlanningEngine {
  private planningAlgorithms: Map<string, any> = new Map();
  private bottleneckAnalyzer: BottleneckAnalyzer;
  private iotDataProcessor: IoTDataProcessor;
  private utilizationPredictor: UtilizationPredictor;

  constructor() {
    this.initializePlanningAlgorithms();
    this.bottleneckAnalyzer = new BottleneckAnalyzer();
    this.iotDataProcessor = new IoTDataProcessor();
    this.utilizationPredictor = new UtilizationPredictor();
  }

  private initializePlanningAlgorithms(): void {
    logger.info('Initializing Capacity Planning algorithms...');
    this.planningAlgorithms.set('finite_capacity', new FiniteCapacityPlanner());
    this.planningAlgorithms.set('infinite_capacity', new InfiniteCapacityPlanner());
    this.planningAlgorithms.set('hybrid_planning', new HybridCapacityPlanner());
    this.planningAlgorithms.set('ml_predictor', new MLCapacityPredictor());
    logger.info('Capacity Planning algorithms initialized');
  }

  public async generateCapacityPlan(input: CapacityPlanningInput): Promise<CapacityPlanningResult> {
    try {
      logger.info(`Generating ${input.planningMode} capacity plan...`);

      // Step 1: Process real-time IoT data
      const processedIoTData = await this.iotDataProcessor.processRealTimeData(input.iotData);

      // Step 2: Update resource availability based on IoT data
      const updatedResources = await this.updateResourcesWithIoTData(input.resources, processedIoTData);

      // Step 3: Generate capacity plans
      const algorithm = this.planningAlgorithms.get(input.planningMode + '_capacity');
      const capacityPlans = await algorithm.generatePlans({
        ...input,
        resources: updatedResources,
        iotData: processedIoTData
      });

      // Step 4: Perform bottleneck analysis
      const bottlenecks = await this.bottleneckAnalyzer.analyzeBottlenecks(
        capacityPlans,
        input.productionOrders,
        updatedResources
      );

      // Step 5: Generate utilization forecasts
      const utilizationForecast = await this.utilizationPredictor.predictUtilization(
        updatedResources,
        input.historicalUtilization,
        processedIoTData
      );

      // Step 6: Generate recommendations
      const recommendations = await this.generateCapacityRecommendations(
        capacityPlans,
        bottlenecks,
        utilizationForecast
      );

      // Step 7: Generate alerts
      const alerts = await this.generateCapacityAlerts(capacityPlans, bottlenecks, processedIoTData);

      // Step 8: Calculate KPIs
      const kpis = await this.calculateCapacityKPIs(capacityPlans, input.objectives);

      // Step 9: Analyze sustainability impact
      const sustainability = await this.analyzeSustainabilityImpact(capacityPlans, updatedResources);

      const result: CapacityPlanningResult = {
        planId: `capacity_${Date.now()}`,
        planningMode: input.planningMode,
        generatedAt: new Date(),
        validUntil: new Date(Date.now() + input.planningHorizon * 7 * 24 * 60 * 60 * 1000),
        capacityPlans,
        bottlenecks,
        utilizationForecast,
        recommendations,
        alerts,
        kpis,
        sustainability
      };

      // Cache the result
      await CacheService.set(`capacity_plan_${result.planId}`, result, 7200);

      // Emit real-time update
      SocketService.emitPlanUpdate('capacity_plan_updated', result);

      logger.info(`Capacity planning completed: ${result.planId}`);
      return result;

    } catch (error) {
      logger.error('Error in capacity planning:', error);
      throw error;
    }
  }

  public async runWhatIfCapacityAnalysis(
    basePlan: CapacityPlanningResult,
    scenarios: WhatIfScenarioInput[]
  ): Promise<WhatIfScenario[]> {
    try {
      logger.info(`Running what-if capacity analysis with ${scenarios.length} scenarios`);

      const results: WhatIfScenario[] = [];

      for (const scenario of scenarios) {
        const modifiedInput = this.applyScenarioChanges(basePlan, scenario);
        const scenarioResult = await this.generateCapacityPlan(modifiedInput);

        results.push({
          scenarioId: scenario.scenarioId,
          description: scenario.description,
          results: scenarioResult
        });
      }

      logger.info(`What-if capacity analysis completed: ${results.length} scenarios processed`);
      return results;

    } catch (error) {
      logger.error('Error in what-if capacity analysis:', error);
      throw error;
    }
  }

  public async updateCapacityPlanWithIoT(
    planId: string,
    iotUpdates: IoTDeviceData[]
  ): Promise<CapacityPlanningResult> {
    try {
      logger.info(`Updating capacity plan ${planId} with IoT data`);

      // Get existing plan
      const currentPlan = await CacheService.get<CapacityPlanningResult>(`capacity_plan_${planId}`);
      if (!currentPlan) {
        throw new Error(`Capacity plan ${planId} not found`);
      }

      // Process IoT updates
      const processedUpdates = await this.iotDataProcessor.processRealTimeData(iotUpdates);

      // Check if updates require plan regeneration
      const impactAnalysis = await this.analyzeIoTImpact(processedUpdates, currentPlan);

      let updatedPlan: CapacityPlanningResult;
      if (impactAnalysis.requiresRegeneration) {
        logger.info('IoT updates require plan regeneration');
        updatedPlan = await this.regeneratePlanWithIoTData(currentPlan, processedUpdates);
      } else {
        logger.info('Applying incremental IoT updates');
        updatedPlan = await this.applyIncrementalIoTUpdates(currentPlan, processedUpdates);
      }

      // Update cache
      await CacheService.set(`capacity_plan_${planId}`, updatedPlan, 7200);

      // Emit real-time update
      SocketService.emitPlanUpdate('capacity_plan_iot_updated', updatedPlan);

      return updatedPlan;

    } catch (error) {
      logger.error('Error updating capacity plan with IoT data:', error);
      throw error;
    }
  }

  // Helper methods (simplified implementations)
  private async updateResourcesWithIoTData(resources: CapacityResourceData[], iotData: any): Promise<CapacityResourceData[]> { return resources; }
  private async generateCapacityRecommendations(plans: any, bottlenecks: any, forecast: any): Promise<CapacityRecommendation[]> { return []; }
  private async generateCapacityAlerts(plans: any, bottlenecks: any, iotData: any): Promise<CapacityAlert[]> { return []; }
  private async calculateCapacityKPIs(plans: any, objectives: CapacityObjective[]): Promise<CapacityKPI[]> { return []; }
  private async analyzeSustainabilityImpact(plans: any, resources: any): Promise<SustainabilityImpact> { return {} as SustainabilityImpact; }
  private applyScenarioChanges(basePlan: CapacityPlanningResult, scenario: any): CapacityPlanningInput { return {} as CapacityPlanningInput; }
  private async analyzeIoTImpact(iotData: any, plan: CapacityPlanningResult): Promise<any> { return { requiresRegeneration: false }; }
  private async regeneratePlanWithIoTData(plan: CapacityPlanningResult, iotData: any): Promise<CapacityPlanningResult> { return plan; }
  private async applyIncrementalIoTUpdates(plan: CapacityPlanningResult, iotData: any): Promise<CapacityPlanningResult> { return plan; }
}

interface WhatIfScenarioInput {
  scenarioId: string;
  description: string;
  changes: ScenarioChange[];
}

interface ScenarioChange {
  changeType: 'resource_capacity' | 'demand_increase' | 'maintenance_schedule' | 'new_orders';
  parameters: Record<string, any>;
}

// Supporting classes (simplified implementations)
class BottleneckAnalyzer {
  async analyzeBottlenecks(plans: any, orders: any, resources: any): Promise<BottleneckAnalysis[]> {
    logger.info('Analyzing capacity bottlenecks');
    return [];
  }
}

class IoTDataProcessor {
  async processRealTimeData(iotData: IoTDeviceData[]): Promise<any> {
    logger.info('Processing real-time IoT data');
    return {};
  }
}

class UtilizationPredictor {
  async predictUtilization(resources: any, history: any, iotData: any): Promise<UtilizationForecast[]> {
    logger.info('Predicting resource utilization');
    return [];
  }
}

// Mock planning algorithm implementations
class FiniteCapacityPlanner {
  async generatePlans(input: any): Promise<ResourceCapacityPlan[]> {
    logger.info('Running Finite Capacity Planning');
    return [];
  }
}

class InfiniteCapacityPlanner {
  async generatePlans(input: any): Promise<ResourceCapacityPlan[]> {
    logger.info('Running Infinite Capacity Planning');
    return [];
  }
}

class HybridCapacityPlanner {
  async generatePlans(input: any): Promise<ResourceCapacityPlan[]> {
    logger.info('Running Hybrid Capacity Planning');
    return [];
  }
}

class MLCapacityPredictor {
  async generatePlans(input: any): Promise<ResourceCapacityPlan[]> {
    logger.info('Running ML-based Capacity Prediction');
    return [];
  }
}
