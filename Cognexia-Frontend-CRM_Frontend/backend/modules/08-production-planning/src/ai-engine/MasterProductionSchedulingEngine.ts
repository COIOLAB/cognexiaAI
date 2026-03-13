import { logger } from '../../../utils/logger';
import { CacheService } from '../../../services/CacheService';
import { SocketService } from '../../../services/SocketService';
import {
  ProductionSchedule,
  ScheduledOrder,
  OptimizationAlgorithm,
  SchedulingObjective,
  ConstraintViolation,
  Bottleneck
} from '@industry5-erp/shared';

export interface MPSInput {
  demandForecast: DemandForecastData[];
  currentOrders: ProductionOrderData[];
  resources: ResourceData[];
  constraints: ConstraintData[];
  planningHorizon: number; // weeks
  objectives: SchedulingObjectiveData[];
  urgentOrders?: UrgentOrderData[];
}

export interface DemandForecastData {
  productId: string;
  period: Date;
  forecastQuantity: number;
  confidence: number;
  customerSegment?: string;
}

export interface ProductionOrderData {
  orderId: string;
  productId: string;
  quantity: number;
  dueDate: Date;
  priority: number;
  status: 'new' | 'scheduled' | 'in_progress' | 'completed';
  customerType: 'standard' | 'priority' | 'vip';
  rushOrder: boolean;
  operations: OperationData[];
  dependencies?: string[];
  constraints?: string[];
}

export interface ResourceData {
  resourceId: string;
  resourceType: 'machine' | 'workstation' | 'worker' | 'tool';
  capacity: number;
  efficiency: number;
  availability: AvailabilityWindow[];
  maintenanceWindows: MaintenanceWindow[];
  skills?: string[];
  cost: number;
  alternativeResources?: string[];
}

export interface AvailabilityWindow {
  startTime: Date;
  endTime: Date;
  capacity: number;
  shift?: string;
  notes?: string;
}

export interface MaintenanceWindow {
  startTime: Date;
  endTime: Date;
  type: 'preventive' | 'corrective' | 'emergency';
  description: string;
  impactsCapacity: boolean;
}

export interface OperationData {
  operationId: string;
  name: string;
  standardTime: number; // minutes
  setupTime: number;
  resourceRequirements: ResourceRequirement[];
  precedingOperations?: string[];
  qualityCheckRequired: boolean;
  skillsRequired: string[];
}

export interface ResourceRequirement {
  resourceType: string;
  quantity: number;
  alternativeResources?: string[];
  preferredResource?: string;
}

export interface ConstraintData {
  constraintId: string;
  type: 'capacity' | 'material' | 'sequence' | 'deadline' | 'quality';
  description: string;
  isHard: boolean;
  priority: number;
  parameters: Record<string, any>;
}

export interface SchedulingObjectiveData {
  type: SchedulingObjective;
  weight: number;
  target?: number;
  tolerance?: number;
}

export interface UrgentOrderData extends ProductionOrderData {
  urgencyReason: string;
  requestedBy: string;
  impactAnalysis: UrgencyImpact;
  approvalRequired: boolean;
  approved?: boolean;
  approvedBy?: string;
}

export interface UrgencyImpact {
  estimatedDelay: number; // hours
  affectedOrders: string[];
  additionalCost: number;
  resourceConflicts: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ScheduleChange {
  changeType: 'order_added' | 'order_modified' | 'order_cancelled' | 'resource_unavailable' | 'rush_order';
  orderId?: string;
  resourceId?: string;
  newData?: any;
  timestamp: Date;
  triggeredBy: 'user' | 'system' | 'external';
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface MPSResult {
  scheduleId: string;
  generatedAt: Date;
  validUntil: Date;
  schedules: ProductionSchedule[];
  kpis: ScheduleKPI[];
  alerts: ScheduleAlert[];
  changes: ScheduleChangeLog[];
  approvalRequired: boolean;
}

export interface ScheduleKPI {
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

export interface ScheduleAlert {
  alertType: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  affectedOrders: string[];
  suggestedActions: string[];
}

export interface ScheduleChangeLog {
  changeId: string;
  timestamp: Date;
  changeType: string;
  description: string;
  impact: ChangeImpact;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

export interface ChangeImpact {
  delayedOrders: string[];
  advancedOrders: string[];
  resourceReallocation: string[];
  costImpact: number;
  scheduleStability: number; // 0-1
}

export class MasterProductionSchedulingEngine {
  private schedulingAlgorithms: Map<OptimizationAlgorithm, any> = new Map();
  private activeSchedule?: MPSResult;
  private changeQueue: ScheduleChange[] = [];
  private isRescheduling = false;
  
  constructor() {
    this.initializeAlgorithms();
    this.startRealTimeMonitoring();
  }

  private initializeAlgorithms(): void {
    logger.info('Initializing MPS scheduling algorithms...');
    
    this.schedulingAlgorithms.set(OptimizationAlgorithm.GENETIC_ALGORITHM, new DynamicGeneticScheduler());
    this.schedulingAlgorithms.set(OptimizationAlgorithm.CONSTRAINT_PROGRAMMING, new ConstraintBasedScheduler());
    this.schedulingAlgorithms.set(OptimizationAlgorithm.REINFORCEMENT_LEARNING, new AdaptiveRLScheduler());
    
    logger.info('MPS scheduling algorithms initialized');
  }

  private startRealTimeMonitoring(): void {
    // Monitor for real-time changes every 30 seconds
    setInterval(async () => {
      if (this.changeQueue.length > 0 && !this.isRescheduling) {
        await this.processScheduleChanges();
      }
    }, 30000);
  }

  public async generateMasterSchedule(input: MPSInput): Promise<MPSResult> {
    try {
      logger.info('Generating Master Production Schedule...');

      // Step 1: Validate and prepare input data
      const validatedInput = await this.validateAndPrepareInput(input);

      // Step 2: Apply constraint-based pre-filtering
      const feasibleOrders = await this.applyConstraintFiltering(validatedInput);

      // Step 3: Generate initial schedule using selected algorithm
      const algorithm = this.selectOptimalAlgorithm(validatedInput);
      const initialSchedule = await this.generateInitialSchedule(feasibleOrders, algorithm);

      // Step 4: Apply real-time adjustments
      const adjustedSchedule = await this.applyRealTimeAdjustments(initialSchedule, validatedInput);

      // Step 5: Handle urgent orders
      const finalSchedule = await this.handleUrgentOrders(adjustedSchedule, input.urgentOrders);

      // Step 6: Calculate KPIs and generate alerts
      const kpis = await this.calculateScheduleKPIs(finalSchedule);
      const alerts = await this.generateScheduleAlerts(finalSchedule, validatedInput);

      // Step 7: Create MPS result
      const mpsResult: MPSResult = {
        scheduleId: `mps_${Date.now()}`,
        generatedAt: new Date(),
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        schedules: finalSchedule,
        kpis,
        alerts,
        changes: [],
        approvalRequired: this.requiresApproval(finalSchedule, input.urgentOrders)
      };

      // Cache the active schedule
      this.activeSchedule = mpsResult;
      await CacheService.set(`active_mps_schedule`, mpsResult, 3600);

      // Emit real-time update
      SocketService.emitPlanUpdate('master_schedule', mpsResult);

      logger.info(`Master Production Schedule generated: ${mpsResult.scheduleId}`);
      return mpsResult;

    } catch (error) {
      logger.error('Error generating Master Production Schedule:', error);
      throw new Error(`MPS generation failed: ${error.message}`);
    }
  }

  public async handleScheduleChange(change: ScheduleChange): Promise<void> {
    try {
      logger.info(`Processing schedule change: ${change.changeType}`);

      // Add change to queue
      this.changeQueue.push(change);

      // For critical changes, trigger immediate rescheduling
      if (change.urgency === 'critical') {
        await this.processScheduleChanges();
      }

    } catch (error) {
      logger.error('Error handling schedule change:', error);
      throw error;
    }
  }

  private async processScheduleChanges(): Promise<void> {
    if (this.isRescheduling || this.changeQueue.length === 0) return;

    try {
      this.isRescheduling = true;
      logger.info(`Processing ${this.changeQueue.length} schedule changes`);

      const changes = [...this.changeQueue];
      this.changeQueue = [];

      // Analyze change impact
      const impactAnalysis = await this.analyzeChangeImpact(changes);

      // Determine if full reschedule is needed
      if (impactAnalysis.requiresFullReschedule) {
        await this.triggerFullReschedule(changes);
      } else {
        await this.applyIncrementalChanges(changes, impactAnalysis);
      }

      // Update active schedule
      if (this.activeSchedule) {
        this.activeSchedule.changes.push(...changes.map(change => ({
          changeId: `change_${Date.now()}`,
          timestamp: change.timestamp,
          changeType: change.changeType,
          description: this.getChangeDescription(change),
          impact: impactAnalysis.overallImpact,
          approvalStatus: impactAnalysis.requiresApproval ? 'pending' : undefined
        })));

        await CacheService.set(`active_mps_schedule`, this.activeSchedule, 3600);
        SocketService.emitPlanUpdate('schedule_updated', this.activeSchedule);
      }

    } catch (error) {
      logger.error('Error processing schedule changes:', error);
    } finally {
      this.isRescheduling = false;
    }
  }

  private async analyzeChangeImpact(changes: ScheduleChange[]): Promise<{
    requiresFullReschedule: boolean;
    requiresApproval: boolean;
    overallImpact: ChangeImpact;
    affectedOrders: string[];
  }> {
    let requiresFullReschedule = false;
    let requiresApproval = false;
    const affectedOrders: string[] = [];
    let totalCostImpact = 0;

    for (const change of changes) {
      if (change.urgency === 'critical' || change.changeType === 'rush_order') {
        requiresFullReschedule = true;
        requiresApproval = true;
      }

      if (change.orderId) {
        affectedOrders.push(change.orderId);
      }

      // Estimate cost impact (simplified)
      totalCostImpact += this.estimateChangeCost(change);
    }

    const overallImpact: ChangeImpact = {
      delayedOrders: [],
      advancedOrders: [],
      resourceReallocation: [],
      costImpact: totalCostImpact,
      scheduleStability: Math.max(0, 1 - (changes.length * 0.1))
    };

    return {
      requiresFullReschedule,
      requiresApproval,
      overallImpact,
      affectedOrders: [...new Set(affectedOrders)]
    };
  }

  private async applyConstraintFiltering(input: MPSInput): Promise<MPSInput> {
    const filteredOrders = [];

    for (const order of input.currentOrders) {
      // Check capacity constraints
      const capacityFeasible = await this.checkCapacityFeasibility(order, input.resources);
      
      // Check material constraints
      const materialFeasible = await this.checkMaterialAvailability(order);
      
      // Check deadline feasibility
      const deadlineFeasible = await this.checkDeadlineFeasibility(order, input.resources);

      if (capacityFeasible && materialFeasible && deadlineFeasible) {
        filteredOrders.push(order);
      } else {
        // Create alert for infeasible order
        logger.warn(`Order ${order.orderId} is not feasible with current constraints`);
      }
    }

    return {
      ...input,
      currentOrders: filteredOrders
    };
  }

  private selectOptimalAlgorithm(input: MPSInput): OptimizationAlgorithm {
    const orderCount = input.currentOrders.length;
    const resourceCount = input.resources.length;
    const hasComplexConstraints = input.constraints.some(c => c.isHard);

    // Algorithm selection logic
    if (orderCount > 200 && hasComplexConstraints) {
      return OptimizationAlgorithm.REINFORCEMENT_LEARNING;
    } else if (orderCount > 100 || hasComplexConstraints) {
      return OptimizationAlgorithm.CONSTRAINT_PROGRAMMING;
    } else {
      return OptimizationAlgorithm.GENETIC_ALGORITHM;
    }
  }

  private async generateInitialSchedule(
    input: MPSInput, 
    algorithm: OptimizationAlgorithm
  ): Promise<ProductionSchedule[]> {
    const scheduler = this.schedulingAlgorithms.get(algorithm);
    if (!scheduler) {
      throw new Error(`Scheduler not found for algorithm: ${algorithm}`);
    }

    return await scheduler.generateSchedule(input);
  }

  private async applyRealTimeAdjustments(
    schedules: ProductionSchedule[],
    input: MPSInput
  ): Promise<ProductionSchedule[]> {
    const adjustedSchedules = [...schedules];

    // Check for machine availability changes
    for (const schedule of adjustedSchedules) {
      await this.checkMachineAvailability(schedule, input.resources);
      await this.optimizeSequencing(schedule);
      await this.balanceWorkload(schedule);
    }

    return adjustedSchedules;
  }

  private async handleUrgentOrders(
    schedules: ProductionSchedule[],
    urgentOrders?: UrgentOrderData[]
  ): Promise<ProductionSchedule[]> {
    if (!urgentOrders || urgentOrders.length === 0) {
      return schedules;
    }

    logger.info(`Handling ${urgentOrders.length} urgent orders`);

    // Sort urgent orders by priority and impact
    const sortedUrgent = urgentOrders.sort((a, b) => {
      return b.priority - a.priority || this.calculateUrgencyScore(a) - this.calculateUrgencyScore(b);
    });

    for (const urgentOrder of sortedUrgent) {
      if (urgentOrder.approved !== false) { // Include undefined as approved
        await this.insertUrgentOrder(schedules, urgentOrder);
      }
    }

    return schedules;
  }

  private calculateUrgencyScore(order: UrgentOrderData): number {
    let score = order.priority * 10;
    
    // Add urgency based on due date
    const daysUntilDue = Math.ceil((order.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    score += Math.max(0, 10 - daysUntilDue);
    
    // Add customer type weight
    if (order.customerType === 'vip') score += 15;
    else if (order.customerType === 'priority') score += 10;
    
    return score;
  }

  private async insertUrgentOrder(schedules: ProductionSchedule[], urgentOrder: UrgentOrderData): Promise<void> {
    // Find best insertion point with minimal impact
    let bestSchedule = schedules[0];
    let bestInsertionPoint = 0;
    let minImpact = Infinity;

    for (const schedule of schedules) {
      for (let i = 0; i <= schedule.orders.length; i++) {
        const impact = await this.calculateInsertionImpact(schedule, urgentOrder, i);
        if (impact < minImpact) {
          minImpact = impact;
          bestSchedule = schedule;
          bestInsertionPoint = i;
        }
      }
    }

    // Insert the urgent order
    const scheduledOrder = await this.createScheduledOrder(urgentOrder, bestSchedule);
    bestSchedule.orders.splice(bestInsertionPoint, 0, scheduledOrder);

    // Reschedule affected orders
    await this.rescheduleAffectedOrders(bestSchedule, bestInsertionPoint);
  }

  private async calculateScheduleKPIs(schedules: ProductionSchedule[]): Promise<ScheduleKPI[]> {
    const kpis: ScheduleKPI[] = [];

    // Calculate average utilization
    const avgUtilization = schedules.reduce((sum, s) => sum + s.utilization.overall, 0) / schedules.length;
    kpis.push({
      name: 'Resource Utilization',
      value: avgUtilization * 100,
      target: 85,
      unit: '%',
      status: avgUtilization >= 0.8 ? 'good' : avgUtilization >= 0.7 ? 'warning' : 'critical'
    });

    // Calculate on-time delivery performance
    const totalOrders = schedules.reduce((sum, s) => sum + s.orders.length, 0);
    const onTimeOrders = schedules.reduce((sum, s) => 
      sum + s.orders.filter(o => o.scheduledEndTime <= new Date(o.scheduledEndTime.getTime() + 24*60*60*1000)).length, 0
    );
    const onTimePerformance = totalOrders > 0 ? (onTimeOrders / totalOrders) * 100 : 100;
    
    kpis.push({
      name: 'On-Time Delivery',
      value: onTimePerformance,
      target: 95,
      unit: '%',
      status: onTimePerformance >= 95 ? 'good' : onTimePerformance >= 85 ? 'warning' : 'critical'
    });

    // Calculate schedule stability
    const stability = 95 - (this.changeQueue.length * 2); // Simplified calculation
    kpis.push({
      name: 'Schedule Stability',
      value: Math.max(0, stability),
      target: 90,
      unit: '%',
      status: stability >= 90 ? 'good' : stability >= 80 ? 'warning' : 'critical'
    });

    return kpis;
  }

  private async generateScheduleAlerts(
    schedules: ProductionSchedule[],
    input: MPSInput
  ): Promise<ScheduleAlert[]> {
    const alerts: ScheduleAlert[] = [];

    // Check for capacity overruns
    for (const schedule of schedules) {
      if (schedule.utilization.overall > 0.95) {
        alerts.push({
          alertType: 'capacity_overrun',
          severity: 'critical',
          message: `Production line ${schedule.productionLineName} is at ${(schedule.utilization.overall * 100).toFixed(1)}% utilization`,
          affectedOrders: schedule.orders.map(o => o.productionOrderId),
          suggestedActions: [
            'Consider overtime scheduling',
            'Evaluate alternative production lines',
            'Reschedule non-critical orders'
          ]
        });
      }
    }

    // Check for bottlenecks
    for (const schedule of schedules) {
      if (schedule.bottlenecks.length > 0) {
        for (const bottleneck of schedule.bottlenecks) {
          if (bottleneck.severity > 8) {
            alerts.push({
              alertType: 'bottleneck',
              severity: 'critical',
              message: `Critical bottleneck at ${bottleneck.resourceName}`,
              affectedOrders: bottleneck.affectedOrders,
              suggestedActions: bottleneck.suggestions.map(s => s.description)
            });
          }
        }
      }
    }

    return alerts;
  }

  // Helper methods (simplified implementations)
  private async validateAndPrepareInput(input: MPSInput): Promise<MPSInput> { return input; }
  private async checkCapacityFeasibility(order: ProductionOrderData, resources: ResourceData[]): Promise<boolean> { return true; }
  private async checkMaterialAvailability(order: ProductionOrderData): Promise<boolean> { return true; }
  private async checkDeadlineFeasibility(order: ProductionOrderData, resources: ResourceData[]): Promise<boolean> { return true; }
  private async checkMachineAvailability(schedule: ProductionSchedule, resources: ResourceData[]): Promise<void> {}
  private async optimizeSequencing(schedule: ProductionSchedule): Promise<void> {}
  private async balanceWorkload(schedule: ProductionSchedule): Promise<void> {}
  private async calculateInsertionImpact(schedule: ProductionSchedule, order: UrgentOrderData, position: number): Promise<number> { return 0; }
  private async createScheduledOrder(order: UrgentOrderData, schedule: ProductionSchedule): Promise<ScheduledOrder> { return {} as ScheduledOrder; }
  private async rescheduleAffectedOrders(schedule: ProductionSchedule, fromIndex: number): Promise<void> {}
  private requiresApproval(schedules: ProductionSchedule[], urgentOrders?: UrgentOrderData[]): boolean { return false; }
  private estimateChangeCost(change: ScheduleChange): number { return 0; }
  private getChangeDescription(change: ScheduleChange): string { return change.changeType; }
  private async triggerFullReschedule(changes: ScheduleChange[]): Promise<void> {}
  private async applyIncrementalChanges(changes: ScheduleChange[], impactAnalysis: any): Promise<void> {}
}

// Mock scheduler implementations
class DynamicGeneticScheduler {
  async generateSchedule(input: MPSInput): Promise<ProductionSchedule[]> {
    // Genetic Algorithm implementation with dynamic adaptation
    logger.info('Generating schedule using Dynamic Genetic Algorithm');
    return [];
  }
}

class ConstraintBasedScheduler {
  async generateSchedule(input: MPSInput): Promise<ProductionSchedule[]> {
    // Constraint Programming implementation
    logger.info('Generating schedule using Constraint-Based Scheduling');
    return [];
  }
}

class AdaptiveRLScheduler {
  async generateSchedule(input: MPSInput): Promise<ProductionSchedule[]> {
    // Reinforcement Learning implementation that learns from changes
    logger.info('Generating schedule using Adaptive Reinforcement Learning');
    return [];
  }
}
