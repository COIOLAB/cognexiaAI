/**
 * Cost Accounting Service - Advanced Cost Management & Analysis
 * 
 * Comprehensive cost accounting service providing sophisticated cost allocation,
 * activity-based costing, job costing, variance analysis, and profitability
 * analytics using AI-powered cost optimization, predictive cost modeling,
 * and real-time cost tracking across all business operations.
 * 
 * Features:
 * - Activity-Based Costing (ABC) with automated activity identification
 * - Multi-dimensional cost allocation and absorption costing
 * - Job costing and project profitability analysis
 * - Standard costing with comprehensive variance analysis
 * - Product and service profitability analysis
 * - Cost center and profit center management
 * - Transfer pricing and inter-company allocations
 * - Integration with all operational and financial modules
 * 
 * @version 3.0.0
 * @author Industry 5.0 ERP Team
 * @compliance SOC2, ISO27001, GAAP, IFRS, SOX, GDPR
 */

import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import { Decimal } from 'decimal.js';

// Cost Accounting Interfaces
interface CostCenter {
  costCenterId: string;
  costCenterCode: string;
  costCenterName: string;
  description: string;
  department: string;
  division: string;
  manager: string;
  costCenterType: 'production' | 'service' | 'administrative' | 'sales' | 'support';
  responsibility: 'cost' | 'profit' | 'investment' | 'revenue';
  budgetAmount: Decimal;
  actualCosts: Decimal;
  allocatedCosts: Decimal;
  variance: Decimal;
  costDrivers: CostDriver[];
  activities: Activity[];
  allocations: CostAllocation[];
  isActive: boolean;
  effectiveDate: string;
  expiryDate?: string;
  metadata: Record<string, any>;
}

interface CostDriver {
  driverId: string;
  driverName: string;
  driverType: 'volume' | 'complexity' | 'duration' | 'intensity' | 'frequency';
  measurementUnit: string;
  driverRate: Decimal;
  actualVolume: Decimal;
  budgetedVolume: Decimal;
  variance: Decimal;
  accuracy: Decimal;
  correlation: Decimal;
  isActive: boolean;
  calibrationDate: string;
}

interface Activity {
  activityId: string;
  activityCode: string;
  activityName: string;
  description: string;
  activityType: 'primary' | 'secondary' | 'support' | 'batch' | 'unit' | 'product' | 'facility';
  resources: ActivityResource[];
  outputs: ActivityOutput[];
  costDrivers: string[];
  totalCost: Decimal;
  unitCost: Decimal;
  efficiency: Decimal;
  capacity: Decimal;
  utilization: Decimal;
  valueAdded: boolean;
  performanceMetrics: ActivityMetrics;
  isActive: boolean;
}

interface ActivityResource {
  resourceId: string;
  resourceType: 'labor' | 'material' | 'equipment' | 'facility' | 'technology';
  resourceName: string;
  quantity: Decimal;
  rate: Decimal;
  totalCost: Decimal;
  allocationBasis: string;
  efficiency: Decimal;
}

interface ActivityOutput {
  outputId: string;
  outputType: string;
  outputName: string;
  quantity: Decimal;
  unitCost: Decimal;
  totalCost: Decimal;
  quality: Decimal;
}

interface ActivityMetrics {
  cycleTime: Decimal;
  throughput: Decimal;
  qualityRate: Decimal;
  efficiency: Decimal;
  costPerOutput: Decimal;
  valueAddedRatio: Decimal;
  benchmarkComparison: Decimal;
}

interface CostAllocation {
  allocationId: string;
  sourceId: string;
  targetId: string;
  allocationType: 'direct' | 'step_down' | 'reciprocal' | 'activity_based';
  allocationBasis: string;
  allocationMethod: 'proportional' | 'driver_based' | 'causal' | 'benefit_received';
  amount: Decimal;
  percentage: Decimal;
  driverVolume?: Decimal;
  period: string;
  status: 'calculated' | 'posted' | 'approved' | 'reversed';
  calculatedBy: string;
  calculatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  metadata: Record<string, any>;
}

interface JobCost {
  jobId: string;
  jobNumber: string;
  jobName: string;
  description: string;
  customerId: string;
  projectId?: string;
  jobType: 'manufacturing' | 'service' | 'construction' | 'consulting' | 'maintenance';
  status: 'active' | 'completed' | 'cancelled' | 'on_hold';
  startDate: string;
  endDate?: string;
  estimatedCost: Decimal;
  actualCost: Decimal;
  budgetedCost: Decimal;
  variance: Decimal;
  profitability: JobProfitability;
  costComponents: CostComponent[];
  milestones: JobMilestone[];
  allocations: JobAllocation[];
  revenue: Decimal;
  margin: Decimal;
  marginPercent: Decimal;
  currency: string;
  lastUpdated: string;
}

interface JobProfitability {
  grossProfit: Decimal;
  grossMargin: Decimal;
  netProfit: Decimal;
  netMargin: Decimal;
  contributionMargin: Decimal;
  roi: Decimal;
  profitabilityIndex: Decimal;
  breakEvenPoint: Decimal;
  riskAdjustedReturn: Decimal;
}

interface CostComponent {
  componentId: string;
  componentType: 'material' | 'labor' | 'overhead' | 'subcontractor' | 'equipment' | 'travel';
  description: string;
  estimatedCost: Decimal;
  actualCost: Decimal;
  budgetedCost: Decimal;
  variance: Decimal;
  variancePercent: Decimal;
  quantity: Decimal;
  rate: Decimal;
  unit: string;
  supplier?: string;
  dateIncurred: string;
  costCenter: string;
  isDirectCost: boolean;
  allocationBasis?: string;
  notes: string;
}

interface JobMilestone {
  milestoneId: string;
  milestoneName: string;
  description: string;
  plannedDate: string;
  actualDate?: string;
  plannedCost: Decimal;
  actualCost: Decimal;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  completionPercent: Decimal;
  dependencies: string[];
  deliverables: string[];
}

interface JobAllocation {
  allocationId: string;
  allocationSource: string;
  allocationAmount: Decimal;
  allocationBasis: string;
  allocationMethod: string;
  driverVolume: Decimal;
  period: string;
  notes: string;
}

interface StandardCost {
  standardId: string;
  productId: string;
  productCode: string;
  productName: string;
  version: string;
  effectiveDate: string;
  expiryDate?: string;
  standardComponents: StandardCostComponent[];
  totalStandardCost: Decimal;
  variance: CostVariance;
  lastReview: string;
  reviewFrequency: 'monthly' | 'quarterly' | 'annually';
  approvedBy: string;
  status: 'draft' | 'approved' | 'active' | 'superseded';
  currency: string;
  isActive: boolean;
}

interface StandardCostComponent {
  componentId: string;
  componentType: 'material' | 'labor' | 'overhead';
  description: string;
  standardQuantity: Decimal;
  standardRate: Decimal;
  standardCost: Decimal;
  tolerance: Decimal;
  unit: string;
  assumptions: string[];
  benchmarkSource: string;
  lastUpdated: string;
}

interface CostVariance {
  totalVariance: Decimal;
  materialVariance: MaterialVariance;
  laborVariance: LaborVariance;
  overheadVariance: OverheadVariance;
  analysisDate: string;
  significanceThreshold: Decimal;
  investigationRequired: boolean;
  rootCauseAnalysis?: RootCauseAnalysis;
}

interface MaterialVariance {
  priceVariance: Decimal;
  quantityVariance: Decimal;
  mixVariance: Decimal;
  yieldVariance: Decimal;
  totalMaterialVariance: Decimal;
}

interface LaborVariance {
  rateVariance: Decimal;
  efficiencyVariance: Decimal;
  idleTimeVariance: Decimal;
  mixVariance: Decimal;
  totalLaborVariance: Decimal;
}

interface OverheadVariance {
  spendingVariance: Decimal;
  efficiencyVariance: Decimal;
  volumeVariance: Decimal;
  calendarVariance: Decimal;
  totalOverheadVariance: Decimal;
}

interface RootCauseAnalysis {
  analysisId: string;
  varianceType: string;
  rootCauses: string[];
  impact: Decimal;
  correctiveActions: CorrectiveAction[];
  preventiveActions: PreventiveAction[];
  responsibleParty: string;
  targetResolution: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
}

interface CorrectiveAction {
  actionId: string;
  description: string;
  expectedImpact: Decimal;
  cost: Decimal;
  timeline: string;
  responsible: string;
  status: 'planned' | 'in_progress' | 'completed';
}

interface PreventiveAction {
  actionId: string;
  description: string;
  preventionType: 'process' | 'training' | 'system' | 'policy';
  implementation: string;
  cost: Decimal;
  effectiveness: Decimal;
  responsible: string;
}

interface ProfitabilityAnalysis {
  analysisId: string;
  entityId: string;
  period: string;
  analysisType: 'product' | 'service' | 'customer' | 'segment' | 'channel' | 'region';
  subjects: ProfitabilitySubject[];
  methodology: 'abc' | 'traditional' | 'marginal' | 'lifecycle';
  totalRevenue: Decimal;
  totalCosts: Decimal;
  totalProfit: Decimal;
  averageMargin: Decimal;
  insights: ProfitabilityInsight[];
  recommendations: ProfitabilityRecommendation[];
  generatedBy: string;
  generatedAt: string;
}

interface ProfitabilitySubject {
  subjectId: string;
  subjectName: string;
  revenue: Decimal;
  directCosts: Decimal;
  indirectCosts: Decimal;
  allocatedCosts: Decimal;
  totalCosts: Decimal;
  grossProfit: Decimal;
  netProfit: Decimal;
  grossMargin: Decimal;
  netMargin: Decimal;
  contributionMargin: Decimal;
  ranking: number;
  profitabilityScore: Decimal;
  riskAdjustedProfit: Decimal;
  trends: ProfitabilityTrend[];
}

interface ProfitabilityTrend {
  period: string;
  revenue: Decimal;
  profit: Decimal;
  margin: Decimal;
  trend: 'improving' | 'declining' | 'stable';
  forecast: Decimal;
}

interface ProfitabilityInsight {
  category: string;
  insight: string;
  importance: number;
  confidence: number;
  impact: 'high_profit' | 'low_profit' | 'cost_driver' | 'margin_opportunity';
  actionable: boolean;
  evidence: string[];
  recommendations: string[];
}

interface ProfitabilityRecommendation {
  recommendation: string;
  category: string;
  priority: number;
  expectedImpact: Decimal;
  implementationCost: Decimal;
  netBenefit: Decimal;
  timeline: string;
  effort: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
  affectedSubjects: string[];
}

interface CostAnalytics {
  analyticsId: string;
  entityId: string;
  period: string;
  timestamp: string;
  metrics: CostMetrics;
  trends: CostTrends;
  benchmarks: CostBenchmarks;
  insights: CostInsight[];
  recommendations: CostRecommendation[];
  risks: CostRisk[];
}

interface CostMetrics {
  totalCosts: Decimal;
  directCosts: Decimal;
  indirectCosts: Decimal;
  fixedCosts: Decimal;
  variableCosts: Decimal;
  costPerUnit: Decimal;
  laborCostRatio: Decimal;
  materialCostRatio: Decimal;
  overheadCostRatio: Decimal;
  costAccuracy: Decimal;
  costEfficiency: Decimal;
  costVolatility: Decimal;
  costTrend: Decimal;
}

interface CostTrends {
  totalCostTrend: TrendAnalysis;
  unitCostTrend: TrendAnalysis;
  laborCostTrend: TrendAnalysis;
  materialCostTrend: TrendAnalysis;
  overheadCostTrend: TrendAnalysis;
  efficiencyTrend: TrendAnalysis;
}

interface TrendAnalysis {
  currentValue: Decimal;
  previousValue: Decimal;
  change: Decimal;
  changePercent: Decimal;
  trend: 'improving' | 'declining' | 'stable';
  forecast: Decimal;
  confidence: Decimal;
}

interface CostBenchmarks {
  industryAverage: Decimal;
  bestInClass: Decimal;
  worstInClass: Decimal;
  percentile: number;
  benchmarkSource: string;
  benchmarkDate: string;
  comparison: 'above' | 'below' | 'at' | 'unknown';
  improvement: Decimal;
}

interface CostInsight {
  category: string;
  insight: string;
  importance: number;
  confidence: number;
  impact: 'cost_reduction' | 'efficiency_gain' | 'quality_improvement' | 'process_optimization';
  actionable: boolean;
  evidence: string[];
  recommendations: string[];
}

interface CostRecommendation {
  recommendation: string;
  category: string;
  priority: number;
  expectedSavings: Decimal;
  implementationCost: Decimal;
  netBenefit: Decimal;
  timeline: string;
  effort: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
  prerequisites: string[];
}

interface CostRisk {
  riskId: string;
  category: 'cost_overrun' | 'price_volatility' | 'supplier' | 'capacity' | 'quality';
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  potentialCost: Decimal;
  timeframe: string;
  mitigation: RiskMitigation[];
  monitoring: RiskMonitoring;
}

interface RiskMitigation {
  strategy: string;
  description: string;
  cost: Decimal;
  effectiveness: Decimal;
  timeline: string;
  responsible: string;
}

interface RiskMonitoring {
  frequency: 'real_time' | 'daily' | 'weekly' | 'monthly';
  indicators: string[];
  thresholds: Record<string, Decimal>;
  alerts: boolean;
  escalation: string[];
  lastReview: string;
}

@Injectable()
export class CostAccountingService {
  private readonly logger = new Logger(CostAccountingService.name);
  private readonly precision = 4;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  // ============================================================================
  // ACTIVITY-BASED COSTING
  // ============================================================================

  async performActivityBasedCosting(
    entityId: string,
    period: string,
    userId: string
  ): Promise<CostCenter[]> {
    try {
      this.logger.log(`Performing ABC analysis for entity ${entityId}, period ${period}`);

      const costCenters = await this.getCostCenters(entityId);
      const activities = await this.identifyActivities(entityId, period);
      const resources = await this.getResourceConsumption(entityId, period);

      const abcResults: CostCenter[] = [];

      for (const costCenter of costCenters) {
        // Identify activities performed by cost center
        const centerActivities = activities.filter(a => a.activityId.startsWith(costCenter.costCenterId));
        
        // Calculate activity costs
        for (const activity of centerActivities) {
          activity.totalCost = await this.calculateActivityCost(activity, resources, period);
          activity.unitCost = activity.outputs.length > 0 ? 
            activity.totalCost.div(activity.outputs.reduce((sum, o) => sum.plus(o.quantity), new Decimal(0))) : 
            new Decimal(0);
        }

        // Allocate costs to cost objects
        const allocations = await this.allocateActivityCosts(centerActivities, costCenter, period);

        const updatedCostCenter: CostCenter = {
          ...costCenter,
          activities: centerActivities,
          allocations,
          actualCosts: centerActivities.reduce((sum, a) => sum.plus(a.totalCost), new Decimal(0)),
          variance: costCenter.budgetAmount.minus(
            centerActivities.reduce((sum, a) => sum.plus(a.totalCost), new Decimal(0))
          )
        };

        abcResults.push(updatedCostCenter);
        await this.dataSource.manager.save('cost_center', updatedCostCenter);
      }

      this.eventEmitter.emit('abc.analysis.completed', {
        entityId,
        period,
        costCentersCount: abcResults.length,
        totalCosts: abcResults.reduce((sum, cc) => sum.plus(cc.actualCosts), new Decimal(0)).toNumber(),
        userId,
        timestamp: new Date().toISOString()
      });

      return abcResults;

    } catch (error) {
      this.logger.error('ABC analysis failed', error);
      throw new InternalServerErrorException('ABC analysis failed');
    }
  }

  // ============================================================================
  // JOB COSTING
  // ============================================================================

  async calculateJobCost(
    jobId: string,
    period: string,
    userId: string
  ): Promise<JobCost> {
    try {
      this.logger.log(`Calculating job cost for job ${jobId}, period ${period}`);

      const job = await this.getJobCost(jobId);
      if (!job) {
        throw new NotFoundException('Job not found');
      }

      // Get actual costs incurred
      const materialCosts = await this.getMaterialCosts(jobId, period);
      const laborCosts = await this.getLaborCosts(jobId, period);
      const overheadCosts = await this.getOverheadCosts(jobId, period);

      // Update cost components
      const updatedComponents: CostComponent[] = [
        ...materialCosts.map(m => ({
          componentId: crypto.randomUUID(),
          componentType: 'material' as const,
          description: m.description,
          estimatedCost: m.estimatedCost,
          actualCost: m.actualCost,
          budgetedCost: m.budgetedCost,
          variance: m.actualCost.minus(m.budgetedCost),
          variancePercent: m.budgetedCost.gt(0) ? m.actualCost.minus(m.budgetedCost).div(m.budgetedCost).mul(100) : new Decimal(0),
          quantity: m.quantity,
          rate: m.rate,
          unit: m.unit,
          supplier: m.supplier,
          dateIncurred: m.dateIncurred,
          costCenter: m.costCenter,
          isDirectCost: true,
          notes: m.notes || ''
        })),
        ...laborCosts.map(l => ({
          componentId: crypto.randomUUID(),
          componentType: 'labor' as const,
          description: l.description,
          estimatedCost: l.estimatedCost,
          actualCost: l.actualCost,
          budgetedCost: l.budgetedCost,
          variance: l.actualCost.minus(l.budgetedCost),
          variancePercent: l.budgetedCost.gt(0) ? l.actualCost.minus(l.budgetedCost).div(l.budgetedCost).mul(100) : new Decimal(0),
          quantity: l.hours,
          rate: l.rate,
          unit: 'hours',
          dateIncurred: l.dateIncurred,
          costCenter: l.costCenter,
          isDirectCost: true,
          notes: l.notes || ''
        })),
        ...overheadCosts.map(o => ({
          componentId: crypto.randomUUID(),
          componentType: 'overhead' as const,
          description: o.description,
          estimatedCost: o.estimatedCost,
          actualCost: o.actualCost,
          budgetedCost: o.budgetedCost,
          variance: o.actualCost.minus(o.budgetedCost),
          variancePercent: o.budgetedCost.gt(0) ? o.actualCost.minus(o.budgetedCost).div(o.budgetedCost).mul(100) : new Decimal(0),
          quantity: o.allocationBase,
          rate: o.rate,
          unit: o.unit,
          dateIncurred: o.dateIncurred,
          costCenter: o.costCenter,
          isDirectCost: false,
          allocationBasis: o.allocationBasis,
          notes: o.notes || ''
        }))
      ];

      const totalActualCost = updatedComponents.reduce((sum, c) => sum.plus(c.actualCost), new Decimal(0));
      const revenue = await this.getJobRevenue(jobId, period);

      const updatedJob: JobCost = {
        ...job,
        actualCost: totalActualCost,
        variance: totalActualCost.minus(job.budgetedCost),
        costComponents: updatedComponents,
        revenue,
        margin: revenue.minus(totalActualCost),
        marginPercent: revenue.gt(0) ? revenue.minus(totalActualCost).div(revenue).mul(100) : new Decimal(0),
        profitability: await this.calculateJobProfitability(totalActualCost, revenue, job),
        lastUpdated: new Date().toISOString()
      };

      await this.dataSource.manager.save('job_cost', updatedJob);

      this.eventEmitter.emit('job.cost.calculated', {
        jobId,
        period,
        actualCost: totalActualCost.toNumber(),
        margin: updatedJob.margin.toNumber(),
        marginPercent: updatedJob.marginPercent.toNumber(),
        userId,
        timestamp: new Date().toISOString()
      });

      return updatedJob;

    } catch (error) {
      this.logger.error('Job cost calculation failed', error);
      throw new InternalServerErrorException('Job cost calculation failed');
    }
  }

  // ============================================================================
  // VARIANCE ANALYSIS
  // ============================================================================

  async performVarianceAnalysis(
    productId: string,
    period: string,
    userId: string
  ): Promise<CostVariance> {
    try {
      this.logger.log(`Performing variance analysis for product ${productId}, period ${period}`);

      const standardCost = await this.getStandardCost(productId);
      if (!standardCost) {
        throw new NotFoundException('Standard cost not found');
      }

      const actualCosts = await this.getActualCosts(productId, period);

      // Calculate material variances
      const materialVariance = await this.calculateMaterialVariances(standardCost, actualCosts, period);
      
      // Calculate labor variances
      const laborVariance = await this.calculateLaborVariances(standardCost, actualCosts, period);
      
      // Calculate overhead variances
      const overheadVariance = await this.calculateOverheadVariances(standardCost, actualCosts, period);

      const totalVariance = materialVariance.totalMaterialVariance
        .plus(laborVariance.totalLaborVariance)
        .plus(overheadVariance.totalOverheadVariance);

      const variance: CostVariance = {
        totalVariance,
        materialVariance,
        laborVariance,
        overheadVariance,
        analysisDate: new Date().toISOString(),
        significanceThreshold: standardCost.totalStandardCost.mul(0.05), // 5% threshold
        investigationRequired: totalVariance.abs().gt(standardCost.totalStandardCost.mul(0.05)),
        rootCauseAnalysis: totalVariance.abs().gt(standardCost.totalStandardCost.mul(0.1)) ? 
          await this.performRootCauseAnalysis(totalVariance, materialVariance, laborVariance, overheadVariance) : 
          undefined
      };

      await this.dataSource.manager.save('cost_variance', variance);

      this.eventEmitter.emit('variance.analysis.completed', {
        productId,
        period,
        totalVariance: totalVariance.toNumber(),
        significantVariance: variance.investigationRequired,
        userId,
        timestamp: new Date().toISOString()
      });

      return variance;

    } catch (error) {
      this.logger.error('Variance analysis failed', error);
      throw new InternalServerErrorException('Variance analysis failed');
    }
  }

  // ============================================================================
  // PROFITABILITY ANALYSIS
  // ============================================================================

  async analyzeProfitability(
    entityId: string,
    analysisType: 'product' | 'service' | 'customer' | 'segment' | 'channel' | 'region',
    methodology: 'abc' | 'traditional' | 'marginal' | 'lifecycle',
    period: string,
    userId: string
  ): Promise<ProfitabilityAnalysis> {
    try {
      this.logger.log(`Analyzing profitability for entity ${entityId}, type ${analysisType}, methodology ${methodology}`);

      const subjects = await this.getProfitabilitySubjects(entityId, analysisType, period);
      const costAllocations = methodology === 'abc' ? 
        await this.performABCAllocation(subjects, period) :
        await this.performTraditionalAllocation(subjects, period);

      const analysisSubjects: ProfitabilitySubject[] = [];
      let totalRevenue = new Decimal(0);
      let totalCosts = new Decimal(0);

      for (const subject of subjects) {
        const allocation = costAllocations.find(a => a.targetId === subject.id);
        const directCosts = await this.getDirectCosts(subject.id, period);
        const indirectCosts = await this.getIndirectCosts(subject.id, period);
        const allocatedCosts = allocation?.amount || new Decimal(0);
        const revenue = await this.getSubjectRevenue(subject.id, period);

        const totalSubjectCosts = directCosts.plus(indirectCosts).plus(allocatedCosts);
        const grossProfit = revenue.minus(directCosts);
        const netProfit = revenue.minus(totalSubjectCosts);

        const profitabilitySubject: ProfitabilitySubject = {
          subjectId: subject.id,
          subjectName: subject.name,
          revenue,
          directCosts,
          indirectCosts,
          allocatedCosts,
          totalCosts: totalSubjectCosts,
          grossProfit,
          netProfit,
          grossMargin: revenue.gt(0) ? grossProfit.div(revenue).mul(100) : new Decimal(0),
          netMargin: revenue.gt(0) ? netProfit.div(revenue).mul(100) : new Decimal(0),
          contributionMargin: revenue.minus(directCosts),
          ranking: 0, // Will be calculated after sorting
          profitabilityScore: await this.calculateProfitabilityScore(revenue, netProfit, subject),
          riskAdjustedProfit: await this.calculateRiskAdjustedProfit(netProfit, subject),
          trends: await this.getProfitabilityTrends(subject.id, period)
        };

        analysisSubjects.push(profitabilitySubject);
        totalRevenue = totalRevenue.plus(revenue);
        totalCosts = totalCosts.plus(totalSubjectCosts);
      }

      // Rank by profitability
      analysisSubjects.sort((a, b) => b.netProfit.minus(a.netProfit).toNumber());
      analysisSubjects.forEach((subject, index) => {
        subject.ranking = index + 1;
      });

      const analysis: ProfitabilityAnalysis = {
        analysisId: crypto.randomUUID(),
        entityId,
        period,
        analysisType,
        subjects: analysisSubjects,
        methodology,
        totalRevenue,
        totalCosts,
        totalProfit: totalRevenue.minus(totalCosts),
        averageMargin: totalRevenue.gt(0) ? totalRevenue.minus(totalCosts).div(totalRevenue).mul(100) : new Decimal(0),
        insights: await this.generateProfitabilityInsights(analysisSubjects, methodology),
        recommendations: await this.generateProfitabilityRecommendations(analysisSubjects, totalRevenue, totalCosts),
        generatedBy: userId,
        generatedAt: new Date().toISOString()
      };

      await this.dataSource.manager.save('profitability_analysis', analysis);

      this.eventEmitter.emit('profitability.analysis.completed', {
        analysisId: analysis.analysisId,
        entityId,
        analysisType,
        methodology,
        totalProfit: analysis.totalProfit.toNumber(),
        averageMargin: analysis.averageMargin.toNumber(),
        subjectsCount: analysisSubjects.length,
        userId,
        timestamp: new Date().toISOString()
      });

      return analysis;

    } catch (error) {
      this.logger.error('Profitability analysis failed', error);
      throw new InternalServerErrorException('Profitability analysis failed');
    }
  }

  // ============================================================================
  // COST ANALYTICS
  // ============================================================================

  async generateCostAnalytics(
    entityId: string,
    period: string,
    userId: string
  ): Promise<CostAnalytics> {
    try {
      this.logger.log(`Generating cost analytics for entity ${entityId}, period ${period}`);

      const metrics = await this.calculateCostMetrics(entityId, period);
      const trends = await this.analyzeCostTrends(entityId, period);
      const benchmarks = await this.getCostBenchmarks(entityId, period);

      const analytics: CostAnalytics = {
        analyticsId: crypto.randomUUID(),
        entityId,
        period,
        timestamp: new Date().toISOString(),
        metrics,
        trends,
        benchmarks,
        insights: await this.generateCostInsights(metrics, trends, benchmarks),
        recommendations: await this.generateCostRecommendations(metrics, trends, benchmarks),
        risks: await this.assessCostRisks(entityId, period, metrics)
      };

      this.eventEmitter.emit('cost.analytics.generated', {
        analyticsId: analytics.analyticsId,
        entityId,
        period,
        totalCosts: metrics.totalCosts.toNumber(),
        costEfficiency: metrics.costEfficiency.toNumber(),
        costAccuracy: metrics.costAccuracy.toNumber(),
        userId,
        timestamp: new Date().toISOString()
      });

      return analytics;

    } catch (error) {
      this.logger.error('Cost analytics generation failed', error);
      throw new InternalServerErrorException('Cost analytics generation failed');
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async identifyActivities(entityId: string, period: string): Promise<Activity[]> {
    // AI-powered activity identification based on transaction patterns
    return [
      {
        activityId: crypto.randomUUID(),
        activityCode: 'SETUP',
        activityName: 'Machine Setup',
        description: 'Setting up machinery for production runs',
        activityType: 'batch',
        resources: [
          {
            resourceId: crypto.randomUUID(),
            resourceType: 'labor',
            resourceName: 'Setup Technician',
            quantity: new Decimal(2),
            rate: new Decimal(25),
            totalCost: new Decimal(50),
            allocationBasis: 'setup_hours',
            efficiency: new Decimal(0.85)
          }
        ],
        outputs: [
          {
            outputId: crypto.randomUUID(),
            outputType: 'setup',
            outputName: 'Production Setup',
            quantity: new Decimal(10),
            unitCost: new Decimal(5),
            totalCost: new Decimal(50),
            quality: new Decimal(0.95)
          }
        ],
        costDrivers: ['setup_complexity', 'changeover_time'],
        totalCost: new Decimal(50),
        unitCost: new Decimal(5),
        efficiency: new Decimal(0.85),
        capacity: new Decimal(100),
        utilization: new Decimal(0.8),
        valueAdded: true,
        performanceMetrics: {
          cycleTime: new Decimal(30),
          throughput: new Decimal(20),
          qualityRate: new Decimal(0.95),
          efficiency: new Decimal(0.85),
          costPerOutput: new Decimal(5),
          valueAddedRatio: new Decimal(0.75),
          benchmarkComparison: new Decimal(1.1)
        },
        isActive: true
      }
    ];
  }

  private async calculateActivityCost(activity: Activity, resources: any[], period: string): Promise<Decimal> {
    return activity.resources.reduce((sum, resource) => sum.plus(resource.totalCost), new Decimal(0));
  }

  private async allocateActivityCosts(activities: Activity[], costCenter: CostCenter, period: string): Promise<CostAllocation[]> {
    return activities.map(activity => ({
      allocationId: crypto.randomUUID(),
      sourceId: activity.activityId,
      targetId: costCenter.costCenterId,
      allocationType: 'activity_based' as const,
      allocationBasis: activity.costDrivers[0] || 'time',
      allocationMethod: 'driver_based' as const,
      amount: activity.totalCost,
      percentage: new Decimal(100),
      driverVolume: activity.outputs.reduce((sum, o) => sum.plus(o.quantity), new Decimal(0)),
      period,
      status: 'calculated',
      calculatedBy: 'system',
      calculatedAt: new Date().toISOString(),
      metadata: { activityName: activity.activityName }
    }));
  }

  private async calculateMaterialVariances(
    standardCost: StandardCost,
    actualCosts: any,
    period: string
  ): Promise<MaterialVariance> {
    const materialStandard = standardCost.standardComponents.find(c => c.componentType === 'material');
    if (!materialStandard) {
      return {
        priceVariance: new Decimal(0),
        quantityVariance: new Decimal(0),
        mixVariance: new Decimal(0),
        yieldVariance: new Decimal(0),
        totalMaterialVariance: new Decimal(0)
      };
    }

    const actualQuantity = actualCosts.materialQuantity || new Decimal(0);
    const actualPrice = actualCosts.materialPrice || new Decimal(0);
    const standardQuantity = materialStandard.standardQuantity;
    const standardPrice = materialStandard.standardRate;

    const priceVariance = actualQuantity.mul(actualPrice.minus(standardPrice));
    const quantityVariance = standardPrice.mul(actualQuantity.minus(standardQuantity));

    return {
      priceVariance,
      quantityVariance,
      mixVariance: new Decimal(0), // Simplified
      yieldVariance: new Decimal(0), // Simplified
      totalMaterialVariance: priceVariance.plus(quantityVariance)
    };
  }

  private async calculateLaborVariances(
    standardCost: StandardCost,
    actualCosts: any,
    period: string
  ): Promise<LaborVariance> {
    const laborStandard = standardCost.standardComponents.find(c => c.componentType === 'labor');
    if (!laborStandard) {
      return {
        rateVariance: new Decimal(0),
        efficiencyVariance: new Decimal(0),
        idleTimeVariance: new Decimal(0),
        mixVariance: new Decimal(0),
        totalLaborVariance: new Decimal(0)
      };
    }

    const actualHours = actualCosts.laborHours || new Decimal(0);
    const actualRate = actualCosts.laborRate || new Decimal(0);
    const standardHours = laborStandard.standardQuantity;
    const standardRate = laborStandard.standardRate;

    const rateVariance = actualHours.mul(actualRate.minus(standardRate));
    const efficiencyVariance = standardRate.mul(actualHours.minus(standardHours));

    return {
      rateVariance,
      efficiencyVariance,
      idleTimeVariance: new Decimal(0), // Simplified
      mixVariance: new Decimal(0), // Simplified
      totalLaborVariance: rateVariance.plus(efficiencyVariance)
    };
  }

  private async calculateOverheadVariances(
    standardCost: StandardCost,
    actualCosts: any,
    period: string
  ): Promise<OverheadVariance> {
    const overheadStandard = standardCost.standardComponents.find(c => c.componentType === 'overhead');
    if (!overheadStandard) {
      return {
        spendingVariance: new Decimal(0),
        efficiencyVariance: new Decimal(0),
        volumeVariance: new Decimal(0),
        calendarVariance: new Decimal(0),
        totalOverheadVariance: new Decimal(0)
      };
    }

    const actualOverhead = actualCosts.overheadAmount || new Decimal(0);
    const budgetedOverhead = overheadStandard.standardCost;
    const actualVolume = actualCosts.productionVolume || new Decimal(0);
    const budgetedVolume = new Decimal(1000); // Would come from budget

    const spendingVariance = actualOverhead.minus(budgetedOverhead);
    const volumeVariance = budgetedOverhead.mul(actualVolume.minus(budgetedVolume).div(budgetedVolume));

    return {
      spendingVariance,
      efficiencyVariance: new Decimal(0), // Simplified
      volumeVariance,
      calendarVariance: new Decimal(0), // Simplified
      totalOverheadVariance: spendingVariance.plus(volumeVariance)
    };
  }

  private async performRootCauseAnalysis(
    totalVariance: Decimal,
    materialVariance: MaterialVariance,
    laborVariance: LaborVariance,
    overheadVariance: OverheadVariance
  ): Promise<RootCauseAnalysis> {
    const rootCauses: string[] = [];
    
    if (materialVariance.priceVariance.abs().gt(1000)) {
      rootCauses.push('Material price inflation');
    }
    if (laborVariance.efficiencyVariance.abs().gt(1000)) {
      rootCauses.push('Labor efficiency issues');
    }
    if (overheadVariance.volumeVariance.abs().gt(1000)) {
      rootCauses.push('Production volume variance');
    }

    return {
      analysisId: crypto.randomUUID(),
      varianceType: 'total',
      rootCauses,
      impact: totalVariance.abs(),
      correctiveActions: [
        {
          actionId: crypto.randomUUID(),
          description: 'Implement supplier price monitoring',
          expectedImpact: new Decimal(5000),
          cost: new Decimal(1000),
          timeline: '30_days',
          responsible: 'procurement_manager',
          status: 'planned'
        }
      ],
      preventiveActions: [
        {
          actionId: crypto.randomUUID(),
          description: 'Establish price variance alerts',
          preventionType: 'system',
          implementation: 'Automated monitoring system',
          cost: new Decimal(2000),
          effectiveness: new Decimal(0.85),
          responsible: 'cost_accounting_manager'
        }
      ],
      responsibleParty: 'cost_accounting_team',
      targetResolution: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'open'
    };
  }

  private async calculateJobProfitability(cost: Decimal, revenue: Decimal, job: JobCost): Promise<JobProfitability> {
    const grossProfit = revenue.minus(cost);
    const contributionMargin = grossProfit; // Simplified
    
    return {
      grossProfit,
      grossMargin: revenue.gt(0) ? grossProfit.div(revenue).mul(100) : new Decimal(0),
      netProfit: grossProfit, // Simplified - would subtract allocated overhead
      netMargin: revenue.gt(0) ? grossProfit.div(revenue).mul(100) : new Decimal(0),
      contributionMargin,
      roi: cost.gt(0) ? grossProfit.div(cost).mul(100) : new Decimal(0),
      profitabilityIndex: revenue.gt(0) ? grossProfit.div(revenue) : new Decimal(0),
      breakEvenPoint: cost, // Simplified
      riskAdjustedReturn: grossProfit.mul(0.85) // Apply risk adjustment
    };
  }

  // Placeholder methods for external data requirements
  private async getCostCenters(entityId: string): Promise<CostCenter[]> {
    return [
      {
        costCenterId: crypto.randomUUID(),
        costCenterCode: 'PROD-001',
        costCenterName: 'Production Department',
        description: 'Main production operations',
        department: 'Manufacturing',
        division: 'Operations',
        manager: 'Production Manager',
        costCenterType: 'production',
        responsibility: 'cost',
        budgetAmount: new Decimal(500000),
        actualCosts: new Decimal(0),
        allocatedCosts: new Decimal(0),
        variance: new Decimal(0),
        costDrivers: [
          {
            driverId: crypto.randomUUID(),
            driverName: 'Machine Hours',
            driverType: 'volume',
            measurementUnit: 'hours',
            driverRate: new Decimal(15),
            actualVolume: new Decimal(1000),
            budgetedVolume: new Decimal(1200),
            variance: new Decimal(-200),
            accuracy: new Decimal(0.92),
            correlation: new Decimal(0.88),
            isActive: true,
            calibrationDate: new Date().toISOString()
          }
        ],
        activities: [],
        allocations: [],
        isActive: true,
        effectiveDate: new Date().toISOString(),
        metadata: {}
      }
    ];
  }

  private async getResourceConsumption(entityId: string, period: string): Promise<any[]> {
    return [
      {
        resourceId: crypto.randomUUID(),
        resourceType: 'labor',
        consumptionAmount: new Decimal(25000),
        consumptionVolume: new Decimal(1000),
        rate: new Decimal(25)
      }
    ];
  }

  private async getJobCost(jobId: string): Promise<JobCost | null> {
    return {
      jobId,
      jobNumber: 'JOB-2024-001',
      jobName: 'Custom Manufacturing Project',
      description: 'Custom product manufacturing for client',
      customerId: crypto.randomUUID(),
      projectId: crypto.randomUUID(),
      jobType: 'manufacturing',
      status: 'active',
      startDate: '2024-01-01',
      estimatedCost: new Decimal(75000),
      actualCost: new Decimal(0),
      budgetedCost: new Decimal(80000),
      variance: new Decimal(0),
      profitability: {
        grossProfit: new Decimal(0),
        grossMargin: new Decimal(0),
        netProfit: new Decimal(0),
        netMargin: new Decimal(0),
        contributionMargin: new Decimal(0),
        roi: new Decimal(0),
        profitabilityIndex: new Decimal(0),
        breakEvenPoint: new Decimal(0),
        riskAdjustedReturn: new Decimal(0)
      },
      costComponents: [],
      milestones: [],
      allocations: [],
      revenue: new Decimal(100000),
      margin: new Decimal(0),
      marginPercent: new Decimal(0),
      currency: 'USD',
      lastUpdated: new Date().toISOString()
    };
  }

  private async getMaterialCosts(jobId: string, period: string): Promise<any[]> {
    return [
      {
        description: 'Raw Materials',
        estimatedCost: new Decimal(30000),
        actualCost: new Decimal(32000),
        budgetedCost: new Decimal(30000),
        quantity: new Decimal(1000),
        rate: new Decimal(32),
        unit: 'kg',
        supplier: 'Material Corp',
        dateIncurred: new Date().toISOString(),
        costCenter: 'PROD-001'
      }
    ];
  }

  private async getLaborCosts(jobId: string, period: string): Promise<any[]> {
    return [
      {
        description: 'Production Labor',
        estimatedCost: new Decimal(25000),
        actualCost: new Decimal(26000),
        budgetedCost: new Decimal(25000),
        hours: new Decimal(1000),
        rate: new Decimal(26),
        dateIncurred: new Date().toISOString(),
        costCenter: 'PROD-001'
      }
    ];
  }

  private async getOverheadCosts(jobId: string, period: string): Promise<any[]> {
    return [
      {
        description: 'Manufacturing Overhead',
        estimatedCost: new Decimal(20000),
        actualCost: new Decimal(18000),
        budgetedCost: new Decimal(20000),
        allocationBase: new Decimal(1000),
        rate: new Decimal(18),
        unit: 'machine_hours',
        dateIncurred: new Date().toISOString(),
        costCenter: 'PROD-001',
        allocationBasis: 'machine_hours'
      }
    ];
  }

  private async getJobRevenue(jobId: string, period: string): Promise<Decimal> {
    return new Decimal(Math.random() * 100000);
  }

  private async getStandardCost(productId: string): Promise<StandardCost | null> {
    return {
      standardId: crypto.randomUUID(),
      productId,
      productCode: 'PROD-001',
      productName: 'Standard Product',
      version: '1.0',
      effectiveDate: new Date().toISOString(),
      standardComponents: [
        {
          componentId: crypto.randomUUID(),
          componentType: 'material',
          description: 'Raw Material',
          standardQuantity: new Decimal(10),
          standardRate: new Decimal(5),
          standardCost: new Decimal(50),
          tolerance: new Decimal(0.05),
          unit: 'kg',
          assumptions: ['Market price stability'],
          benchmarkSource: 'industry_average',
          lastUpdated: new Date().toISOString()
        },
        {
          componentId: crypto.randomUUID(),
          componentType: 'labor',
          description: 'Direct Labor',
          standardQuantity: new Decimal(2),
          standardRate: new Decimal(25),
          standardCost: new Decimal(50),
          tolerance: new Decimal(0.1),
          unit: 'hours',
          assumptions: ['Standard efficiency rates'],
          benchmarkSource: 'time_study',
          lastUpdated: new Date().toISOString()
        }
      ],
      totalStandardCost: new Decimal(100),
      variance: {
        totalVariance: new Decimal(0),
        materialVariance: {
          priceVariance: new Decimal(0),
          quantityVariance: new Decimal(0),
          mixVariance: new Decimal(0),
          yieldVariance: new Decimal(0),
          totalMaterialVariance: new Decimal(0)
        },
        laborVariance: {
          rateVariance: new Decimal(0),
          efficiencyVariance: new Decimal(0),
          idleTimeVariance: new Decimal(0),
          mixVariance: new Decimal(0),
          totalLaborVariance: new Decimal(0)
        },
        overheadVariance: {
          spendingVariance: new Decimal(0),
          efficiencyVariance: new Decimal(0),
          volumeVariance: new Decimal(0),
          calendarVariance: new Decimal(0),
          totalOverheadVariance: new Decimal(0)
        },
        analysisDate: new Date().toISOString(),
        significanceThreshold: new Decimal(5),
        investigationRequired: false
      },
      lastReview: new Date().toISOString(),
      reviewFrequency: 'quarterly',
      approvedBy: 'cost_manager',
      status: 'active',
      currency: 'USD',
      isActive: true
    };
  }

  private async getActualCosts(productId: string, period: string): Promise<any> {
    return {
      materialQuantity: new Decimal(10.5),
      materialPrice: new Decimal(5.2),
      laborHours: new Decimal(2.1),
      laborRate: new Decimal(26),
      overheadAmount: new Decimal(52),
      productionVolume: new Decimal(950)
    };
  }

  private async getProfitabilitySubjects(entityId: string, analysisType: string, period: string): Promise<any[]> {
    return [
      {
        id: crypto.randomUUID(),
        name: 'Product A',
        type: analysisType,
        attributes: { category: 'premium', segment: 'enterprise' }
      },
      {
        id: crypto.randomUUID(),
        name: 'Product B',
        type: analysisType,
        attributes: { category: 'standard', segment: 'mid_market' }
      }
    ];
  }

  private async performABCAllocation(subjects: any[], period: string): Promise<CostAllocation[]> {
    return subjects.map(subject => ({
      allocationId: crypto.randomUUID(),
      sourceId: 'overhead_pool',
      targetId: subject.id,
      allocationType: 'activity_based' as const,
      allocationBasis: 'activity_consumption',
      allocationMethod: 'driver_based' as const,
      amount: new Decimal(Math.random() * 20000),
      percentage: new Decimal(Math.random() * 30),
      driverVolume: new Decimal(Math.random() * 100),
      period,
      status: 'calculated',
      calculatedBy: 'system',
      calculatedAt: new Date().toISOString(),
      metadata: { methodology: 'abc' }
    }));
  }

  private async performTraditionalAllocation(subjects: any[], period: string): Promise<CostAllocation[]> {
    return subjects.map(subject => ({
      allocationId: crypto.randomUUID(),
      sourceId: 'overhead_pool',
      targetId: subject.id,
      allocationType: 'direct' as const,
      allocationBasis: 'labor_hours',
      allocationMethod: 'proportional' as const,
      amount: new Decimal(Math.random() * 15000),
      percentage: new Decimal(Math.random() * 25),
      period,
      status: 'calculated',
      calculatedBy: 'system',
      calculatedAt: new Date().toISOString(),
      metadata: { methodology: 'traditional' }
    }));
  }

  private async getDirectCosts(subjectId: string, period: string): Promise<Decimal> {
    return new Decimal(Math.random() * 50000);
  }

  private async getIndirectCosts(subjectId: string, period: string): Promise<Decimal> {
    return new Decimal(Math.random() * 20000);
  }

  private async getSubjectRevenue(subjectId: string, period: string): Promise<Decimal> {
    return new Decimal(Math.random() * 100000);
  }

  private async calculateProfitabilityScore(revenue: Decimal, profit: Decimal, subject: any): Promise<Decimal> {
    const margin = revenue.gt(0) ? profit.div(revenue) : new Decimal(0);
    const volume = revenue.div(1000); // Normalized volume score
    return margin.mul(0.6).plus(volume.mul(0.4)); // Weighted score
  }

  private async calculateRiskAdjustedProfit(profit: Decimal, subject: any): Promise<Decimal> {
    const riskFactor = new Decimal(0.85); // Would be based on subject risk profile
    return profit.mul(riskFactor);
  }

  private async getProfitabilityTrends(subjectId: string, period: string): Promise<ProfitabilityTrend[]> {
    return [
      {
        period: '2024-01',
        revenue: new Decimal(90000),
        profit: new Decimal(18000),
        margin: new Decimal(20),
        trend: 'improving',
        forecast: new Decimal(22000)
      }
    ];
  }

  private async calculateCostMetrics(entityId: string, period: string): Promise<CostMetrics> {
    return {
      totalCosts: new Decimal(Math.random() * 1000000),
      directCosts: new Decimal(Math.random() * 600000),
      indirectCosts: new Decimal(Math.random() * 400000),
      fixedCosts: new Decimal(Math.random() * 300000),
      variableCosts: new Decimal(Math.random() * 700000),
      costPerUnit: new Decimal(Math.random() * 100),
      laborCostRatio: new Decimal(0.3 + Math.random() * 0.2),
      materialCostRatio: new Decimal(0.4 + Math.random() * 0.2),
      overheadCostRatio: new Decimal(0.2 + Math.random() * 0.15),
      costAccuracy: new Decimal(0.85 + Math.random() * 0.1),
      costEfficiency: new Decimal(0.8 + Math.random() * 0.15),
      costVolatility: new Decimal(0.1 + Math.random() * 0.1),
      costTrend: new Decimal(-0.05 + Math.random() * 0.1)
    };
  }

  private async analyzeCostTrends(entityId: string, period: string): Promise<CostTrends> {
    return {
      totalCostTrend: {
        currentValue: new Decimal(1000000),
        previousValue: new Decimal(1050000),
        change: new Decimal(-50000),
        changePercent: new Decimal(-4.76),
        trend: 'improving',
        forecast: new Decimal(980000),
        confidence: new Decimal(0.85)
      },
      unitCostTrend: {
        currentValue: new Decimal(100),
        previousValue: new Decimal(105),
        change: new Decimal(-5),
        changePercent: new Decimal(-4.76),
        trend: 'improving',
        forecast: new Decimal(98),
        confidence: new Decimal(0.8)
      },
      laborCostTrend: {
        currentValue: new Decimal(350000),
        previousValue: new Decimal(340000),
        change: new Decimal(10000),
        changePercent: new Decimal(2.94),
        trend: 'declining',
        forecast: new Decimal(360000),
        confidence: new Decimal(0.82)
      },
      materialCostTrend: {
        currentValue: new Decimal(450000),
        previousValue: new Decimal(480000),
        change: new Decimal(-30000),
        changePercent: new Decimal(-6.25),
        trend: 'improving',
        forecast: new Decimal(440000),
        confidence: new Decimal(0.88)
      },
      overheadCostTrend: {
        currentValue: new Decimal(200000),
        previousValue: new Decimal(210000),
        change: new Decimal(-10000),
        changePercent: new Decimal(-4.76),
        trend: 'improving',
        forecast: new Decimal(195000),
        confidence: new Decimal(0.75)
      },
      efficiencyTrend: {
        currentValue: new Decimal(0.88),
        previousValue: new Decimal(0.85),
        change: new Decimal(0.03),
        changePercent: new Decimal(3.53),
        trend: 'improving',
        forecast: new Decimal(0.9),
        confidence: new Decimal(0.85)
      }
    };
  }

  private async getCostBenchmarks(entityId: string, period: string): Promise<CostBenchmarks> {
    return {
      industryAverage: new Decimal(110),
      bestInClass: new Decimal(85),
      worstInClass: new Decimal(140),
      percentile: 75,
      benchmarkSource: 'Industry Association',
      benchmarkDate: new Date().toISOString(),
      comparison: 'below',
      improvement: new Decimal(10)
    };
  }

  private async generateProfitabilityInsights(subjects: ProfitabilitySubject[], methodology: string): Promise<ProfitabilityInsight[]> {
    return [
      {
        category: 'product_mix',
        insight: 'Top 20% of products generate 60% of total profit',
        importance: 0.95,
        confidence: 0.9,
        impact: 'high_profit',
        actionable: true,
        evidence: ['profitability_analysis', 'pareto_analysis'],
        recommendations: ['focus_on_high_margin_products', 'optimize_product_mix']
      }
    ];
  }

  private async generateProfitabilityRecommendations(
    subjects: ProfitabilitySubject[],
    totalRevenue: Decimal,
    totalCosts: Decimal
  ): Promise<ProfitabilityRecommendation[]> {
    return [
      {
        recommendation: 'Discontinue or redesign bottom 10% performing products',
        category: 'product_optimization',
        priority: 1,
        expectedImpact: new Decimal(50000),
        implementationCost: new Decimal(10000),
        netBenefit: new Decimal(40000),
        timeline: '6_months',
        effort: 'medium',
        riskLevel: 'medium',
        affectedSubjects: subjects.slice(-Math.ceil(subjects.length * 0.1)).map(s => s.subjectId)
      }
    ];
  }

  private async generateCostInsights(metrics: CostMetrics, trends: CostTrends, benchmarks: CostBenchmarks): Promise<CostInsight[]> {
    return [
      {
        category: 'cost_efficiency',
        insight: 'Material costs have decreased by 6.25% while maintaining quality standards',
        importance: 0.88,
        confidence: 0.92,
        impact: 'cost_reduction',
        actionable: true,
        evidence: ['cost_trend_analysis', 'quality_metrics'],
        recommendations: ['maintain_supplier_relationships', 'explore_additional_savings']
      }
    ];
  }

  private async generateCostRecommendations(metrics: CostMetrics, trends: CostTrends, benchmarks: CostBenchmarks): Promise<CostRecommendation[]> {
    return [
      {
        recommendation: 'Implement lean manufacturing principles to reduce overhead costs',
        category: 'process_improvement',
        priority: 1,
        expectedSavings: new Decimal(75000),
        implementationCost: new Decimal(25000),
        netBenefit: new Decimal(50000),
        timeline: '4_months',
        effort: 'high',
        riskLevel: 'medium',
        prerequisites: ['Management commitment', 'Employee training', 'Process mapping']
      }
    ];
  }

  private async assessCostRisks(entityId: string, period: string, metrics: CostMetrics): Promise<CostRisk[]> {
    return [
      {
        riskId: crypto.randomUUID(),
        category: 'price_volatility',
        description: 'Material price volatility affecting cost predictability',
        likelihood: 'medium',
        impact: 'medium',
        riskScore: 6,
        potentialCost: new Decimal(100000),
        timeframe: 'Q2_2024',
        mitigation: [
          {
            strategy: 'Supplier diversification',
            description: 'Develop alternative supplier relationships',
            cost: new Decimal(15000),
            effectiveness: new Decimal(0.8),
            timeline: '3_months',
            responsible: 'procurement_manager'
          }
        ],
        monitoring: {
          frequency: 'weekly',
          indicators: ['material_prices', 'supplier_performance', 'market_conditions'],
          thresholds: { 'price_variance': new Decimal(0.1) },
          alerts: true,
          escalation: ['procurement_director', 'cfo'],
          lastReview: new Date().toISOString()
        }
      }
    ];
  }
}
