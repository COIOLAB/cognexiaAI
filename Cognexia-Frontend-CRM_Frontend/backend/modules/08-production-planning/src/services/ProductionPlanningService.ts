import { logger } from '../../../utils/logger';
import { CacheService } from '../../../services/CacheService';
import { DemandForecastingEngine, ForecastingInput } from '../ai-engine/DemandForecastingEngine';
import { ProductionOptimizationEngine, OptimizationInput } from '../ai-engine/ProductionOptimizationEngine';
import { EnhancedDemandForecastingEngine, EnhancedForecastingInput } from '../ai-engine/EnhancedDemandForecastingEngine';
import { MasterProductionSchedulingEngine, MPSInput, MPSResult } from '../ai-engine/MasterProductionSchedulingEngine';
import { MaterialRequirementsPlanningEngine, MRPInput, MRPResult } from '../ai-engine/MaterialRequirementsPlanningEngine';
import {
  ProductionPlan,
  DemandForecast,
  OptimizationResult,
  PlanStatus,
  SchedulingObjective,
  OptimizationAlgorithm,
  ProductionSchedule,
  WhatIfScenario,
  ProductionAlert,
  AlertSeverity,
  PlanningKPI,
  ForecastMethod
} from '@industry5-erp/shared';

export interface CreateProductionPlanRequest {
  planName: string;
  planType: 'master' | 'detailed' | 'operational';
  planHorizon: number;
  objectives: PlanningObjectiveInput[];
  constraints: PlanningConstraintInput[];
  includeForecasting: boolean;
  optimizationAlgorithm?: OptimizationAlgorithm;
  forecastMethod?: ForecastMethod;
}

export interface PlanningObjectiveInput {
  type: SchedulingObjective;
  weight: number;
  target?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface PlanningConstraintInput {
  constraintType: string;
  description: string;
  isHard: boolean;
  penalty?: number;
  parameters: Record<string, any>;
}

export interface UpdatePlanRequest {
  planId: string;
  changes: PlanChangeRequest[];
  triggerReoptimization: boolean;
}

export interface PlanChangeRequest {
  changeType: 'order_added' | 'order_removed' | 'order_modified' | 'resource_changed' | 'constraint_modified';
  entityId: string;
  newData?: any;
  reason: string;
}

export class ProductionPlanningService {
  private demandEngine: DemandForecastingEngine;
  private optimizationEngine: ProductionOptimizationEngine;
  private enhancedDemandEngine: EnhancedDemandForecastingEngine;
  private mpsEngine: MasterProductionSchedulingEngine;
  private mrpEngine: MaterialRequirementsPlanningEngine;
  
  constructor() {
    this.demandEngine = new DemandForecastingEngine();
    this.optimizationEngine = new ProductionOptimizationEngine();
    this.enhancedDemandEngine = new EnhancedDemandForecastingEngine();
    this.mpsEngine = new MasterProductionSchedulingEngine();
    this.mrpEngine = new MaterialRequirementsPlanningEngine();
  }

  /**
   * Create a comprehensive production plan with AI-driven forecasting and optimization
   */
  public async createProductionPlan(request: CreateProductionPlanRequest): Promise<ProductionPlan> {
    try {
      logger.info(`Creating production plan: ${request.planName}`);

      const planId = `plan_${Date.now()}`;
      let forecasts: DemandForecast[] = [];
      let optimizationResults: OptimizationResult[] = [];

      // Step 1: Generate demand forecasts if requested
      if (request.includeForecasting) {
        forecasts = await this.generateDemandForecasts(planId, request.planHorizon, request.forecastMethod);
        logger.info(`Generated ${forecasts.length} demand forecasts`);
      }

      // Step 2: Collect production orders and resources
      const { orders, resources, constraints } = await this.collectPlanningData(planId, request);

      // Step 3: Run optimization
      const optimizationInput: OptimizationInput = {
        orders: orders,
        resources: resources,
        constraints: constraints.map(c => ({
          type: c.constraintType,
          isHard: c.isHard,
          parameters: c.parameters,
          penalty: c.penalty
        })),
        objectives: request.objectives.map(obj => ({
          type: obj.type,
          weight: obj.weight,
          target: obj.target
        })),
        timeHorizon: request.planHorizon * 24, // Convert days to hours
        algorithm: request.optimizationAlgorithm
      };

      const optimizationResult = await this.optimizationEngine.optimizeSchedule(optimizationInput);
      optimizationResults.push(optimizationResult);

      // Step 4: Generate production schedules from optimization result
      const schedules = optimizationResult.bestSolution.schedule;

      // Step 5: Calculate KPIs
      const kpis = await this.calculatePlanningKPIs(schedules, forecasts);

      // Step 6: Create the production plan
      const productionPlan: ProductionPlan = {
        id: planId,
        planName: request.planName,
        planType: request.planType,
        planHorizon: request.planHorizon,
        status: PlanStatus.OPTIMIZED,
        objectives: request.objectives.map(obj => ({
          type: obj.type,
          weight: obj.weight,
          target: obj.target,
          priority: obj.priority
        })),
        constraints: request.constraints.map(c => ({
          constraintType: c.constraintType,
          description: c.description,
          isHard: c.isHard,
          penalty: c.penalty,
          parameters: c.parameters
        })),
        schedules: schedules,
        kpis: kpis,
        optimizationResults: optimizationResults,
        approvals: [],
        revisions: [],
        effectiveDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'production-planning-service',
        version: 1,
        isActive: true
      };

      // Cache the plan
      await CacheService.set(`production_plan_${planId}`, productionPlan, 3600);

      // Generate initial alerts if needed
      await this.checkForAlerts(productionPlan);

      logger.info(`Production plan created successfully: ${planId}`);
      return productionPlan;

    } catch (error) {
      logger.error('Error creating production plan:', error);
      throw new Error(`Failed to create production plan: ${error.message}`);
    }
  }

  /**
   * Update an existing production plan
   */
  public async updateProductionPlan(request: UpdatePlanRequest): Promise<ProductionPlan> {
    try {
      logger.info(`Updating production plan: ${request.planId}`);

      // Get existing plan
      let plan = await this.getProductionPlan(request.planId);
      if (!plan) {
        throw new Error(`Production plan not found: ${request.planId}`);
      }

      // Apply changes
      const originalPlan = JSON.parse(JSON.stringify(plan)); // Deep copy for revision tracking
      plan = await this.applyPlanChanges(plan, request.changes);

      // Re-optimize if requested
      if (request.triggerReoptimization) {
        const { orders, resources, constraints } = await this.collectPlanningData(request.planId, {
          planHorizon: plan.planHorizon,
          objectives: plan.objectives,
          constraints: plan.constraints
        });

        const optimizationInput: OptimizationInput = {
          orders,
          resources,
          constraints: constraints.map(c => ({
            type: c.constraintType,
            isHard: c.isHard,
            parameters: c.parameters,
            penalty: c.penalty
          })),
          objectives: plan.objectives.map(obj => ({
            type: obj.type,
            weight: obj.weight,
            target: obj.target
          })),
          timeHorizon: plan.planHorizon * 24
        };

        const optimizationResult = await this.optimizationEngine.optimizeSchedule(optimizationInput);
        plan.optimizationResults.push(optimizationResult);
        plan.schedules = optimizationResult.bestSolution.schedule;
        plan.status = PlanStatus.OPTIMIZED;
      }

      // Update metadata
      plan.updatedAt = new Date();
      plan.version += 1;

      // Track revision
      const revision = {
        revisionNumber: plan.version,
        revisorId: 'system', // In production, get from context
        revisionDate: new Date(),
        reason: request.changes.map(c => c.reason).join('; '),
        changes: request.changes.map(c => ({
          changeType: c.changeType,
          description: `${c.changeType}: ${c.entityId}`,
          oldValue: null, // Would extract from original plan
          newValue: c.newData,
          affectedEntities: [c.entityId]
        })),
        impact: {
          scheduleChanges: request.changes.length,
          resourceReallocation: 0,
          deliveryDateChanges: 0,
          costImpact: 0,
          riskAssessment: 'Medium'
        }
      };

      plan.revisions.push(revision);

      // Update KPIs
      plan.kpis = await this.calculatePlanningKPIs(plan.schedules, []);

      // Update cache
      await CacheService.set(`production_plan_${request.planId}`, plan, 3600);

      // Check for new alerts
      await this.checkForAlerts(plan);

      logger.info(`Production plan updated successfully: ${request.planId}`);
      return plan;

    } catch (error) {
      logger.error('Error updating production plan:', error);
      throw new Error(`Failed to update production plan: ${error.message}`);
    }
  }

  /**
   * Generate demand forecasts for all products in the planning horizon
   */
  private async generateDemandForecasts(
    planId: string, 
    horizonDays: number,
    method?: ForecastMethod
  ): Promise<DemandForecast[]> {
    try {
      // Get list of products to forecast
      const products = await this.getProductsForForecasting();
      const forecasts: DemandForecast[] = [];

      for (const product of products) {
        // Get historical demand data
        const historicalData = await this.getHistoricalDemand(product.id, 365); // Last year

        if (historicalData.length < 10) {
          logger.warn(`Insufficient historical data for product ${product.id}, skipping forecast`);
          continue;
        }

        const forecastInput: ForecastingInput = {
          productId: product.id,
          historicalData: historicalData,
          forecastHorizon: horizonDays,
          method: method
        };

        const forecast = await this.demandEngine.generateForecast(forecastInput);
        forecasts.push(forecast);
      }

      return forecasts;

    } catch (error) {
      logger.error('Error generating demand forecasts:', error);
      throw error;
    }
  }

  /**
   * Collect all necessary data for production planning
   */
  private async collectPlanningData(planId: string, request: any) {
    // In production, these would query actual database tables
    const orders = await this.getProductionOrders(planId);
    const resources = await this.getAvailableResources();
    const constraints = request.constraints || [];

    return {
      orders: orders.map(order => ({
        orderId: order.id,
        productId: order.productId,
        quantity: order.quantity,
        priority: order.priority || 5,
        dueDate: order.plannedEndDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        operations: order.operations?.map(op => ({
          operationId: op.operationId,
          name: op.operationName,
          duration: op.estimatedDuration,
          setupTime: op.setupTime || 30,
          workstationRequirements: [op.workstationId],
          skillRequirements: op.requiredSkills || [],
          toolRequirements: op.toolRequirements || [],
          precedence: op.predecessor ? [op.predecessor] : []
        })) || [],
        dependencies: []
      })),
      resources: resources.map(resource => ({
        resourceId: resource.id,
        type: resource.type as 'workstation' | 'worker' | 'tool',
        capacity: resource.capacity || 100,
        availability: [{
          startTime: new Date(),
          endTime: new Date(Date.now() + request.planHorizon * 24 * 60 * 60 * 1000),
          efficiency: resource.efficiency || 1.0
        }],
        skills: resource.skills || [],
        hourlyRate: resource.hourlyRate || 50
      })),
      constraints
    };
  }

  /**
   * Calculate planning KPIs
   */
  private async calculatePlanningKPIs(
    schedules: ProductionSchedule[], 
    forecasts: DemandForecast[]
  ): Promise<PlanningKPI[]> {
    const kpis: PlanningKPI[] = [];

    // Overall Equipment Effectiveness (OEE)
    const avgOEE = schedules.reduce((sum, schedule) => {
      return sum + (schedule.utilization.overall * 0.95 * 0.98); // Availability * Performance * Quality
    }, 0) / schedules.length;

    kpis.push({
      id: `kpi_oee_${Date.now()}`,
      kpiName: 'Overall Equipment Effectiveness',
      category: 'efficiency',
      currentValue: avgOEE * 100,
      targetValue: 85,
      unit: '%',
      trend: 'stable',
      benchmark: 85,
      calculationMethod: 'Availability × Performance × Quality',
      updateFrequency: 'hourly',
      historicalData: [{
        timestamp: new Date(),
        value: avgOEE * 100
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'planning-service',
      version: 1,
      isActive: true
    });

    // Schedule Adherence
    const scheduleAdherence = 95 + Math.random() * 5; // Mock data
    kpis.push({
      id: `kpi_schedule_adherence_${Date.now()}`,
      kpiName: 'Schedule Adherence',
      category: 'delivery',
      currentValue: scheduleAdherence,
      targetValue: 95,
      unit: '%',
      trend: 'improving',
      benchmark: 95,
      calculationMethod: 'On-time completions / Total completions',
      updateFrequency: 'daily',
      historicalData: [{
        timestamp: new Date(),
        value: scheduleAdherence
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'planning-service',
      version: 1,
      isActive: true
    });

    // Resource Utilization
    const avgUtilization = schedules.reduce((sum, schedule) => 
      sum + schedule.utilization.overall, 0
    ) / schedules.length;

    kpis.push({
      id: `kpi_utilization_${Date.now()}`,
      kpiName: 'Resource Utilization',
      category: 'utilization',
      currentValue: avgUtilization * 100,
      targetValue: 85,
      unit: '%',
      trend: avgUtilization > 0.85 ? 'improving' : 'declining',
      benchmark: 85,
      calculationMethod: 'Actual usage / Available capacity',
      updateFrequency: 'real-time',
      historicalData: [{
        timestamp: new Date(),
        value: avgUtilization * 100
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'planning-service',
      version: 1,
      isActive: true
    });

    // Forecast Accuracy (if forecasts available)
    if (forecasts.length > 0) {
      const avgAccuracy = forecasts.reduce((sum, f) => sum + f.accuracy, 0) / forecasts.length;
      kpis.push({
        id: `kpi_forecast_accuracy_${Date.now()}`,
        kpiName: 'Forecast Accuracy',
        category: 'quality',
        currentValue: avgAccuracy,
        targetValue: 85,
        unit: '%',
        trend: avgAccuracy > 85 ? 'improving' : 'declining',
        benchmark: 90,
        calculationMethod: '100 - MAPE',
        updateFrequency: 'weekly',
        historicalData: [{
          timestamp: new Date(),
          value: avgAccuracy
        }],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'planning-service',
        version: 1,
        isActive: true
      });
    }

    return kpis;
  }

  /**
   * Check for alerts based on plan analysis
   */
  private async checkForAlerts(plan: ProductionPlan): Promise<void> {
    const alerts: ProductionAlert[] = [];

    // Check for bottlenecks
    for (const schedule of plan.schedules) {
      if (schedule.bottlenecks.length > 0) {
        for (const bottleneck of schedule.bottlenecks) {
          if (bottleneck.severity > 7) {
            alerts.push({
              id: `alert_${Date.now()}`,
              alertType: 'bottleneck',
              severity: AlertSeverity.CRITICAL,
              title: `Critical Bottleneck Detected`,
              description: `Resource ${bottleneck.resourceName} is creating a critical bottleneck affecting ${bottleneck.affectedOrders.length} orders`,
              affectedEntities: [{
                entityType: 'resource',
                entityId: bottleneck.resourceId,
                entityName: bottleneck.resourceName
              }],
              rootCause: `Insufficient capacity at ${bottleneck.resourceName}`,
              recommendedActions: bottleneck.suggestions.map(s => s.description),
              estimatedImpact: {
                delayHours: bottleneck.impact,
                affectedOrders: bottleneck.affectedOrders.length,
                costImpact: bottleneck.impact * 100, // $100 per hour delay
                qualityRisk: 'medium',
                deliveryRisk: 'high'
              },
              resolved: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'planning-service',
              version: 1,
              isActive: true
            });
          }
        }
      }
    }

    // Check for low utilization
    const avgUtilization = plan.schedules.reduce((sum, s) => 
      sum + s.utilization.overall, 0
    ) / plan.schedules.length;

    if (avgUtilization < 0.6) {
      alerts.push({
        id: `alert_low_util_${Date.now()}`,
        alertType: 'resource_shortage',
        severity: AlertSeverity.WARNING,
        title: 'Low Resource Utilization',
        description: `Average resource utilization is ${(avgUtilization * 100).toFixed(1)}%, below the 60% threshold`,
        affectedEntities: [],
        recommendedActions: [
          'Review resource allocation',
          'Consider consolidating operations',
          'Evaluate demand forecasts'
        ],
        estimatedImpact: {
          delayHours: 0,
          affectedOrders: 0,
          costImpact: (1 - avgUtilization) * 1000, // Lost productivity cost
          qualityRisk: 'low',
          deliveryRisk: 'low'
        },
        resolved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'planning-service',
        version: 1,
        isActive: true
      });
    }

    // Store alerts (in production, would save to database)
    if (alerts.length > 0) {
      await CacheService.set(`alerts_${plan.id}`, alerts, 7200);
      logger.info(`Generated ${alerts.length} alerts for plan ${plan.id}`);
    }
  }

  /**
   * Run what-if analysis scenarios
   */
  public async runWhatIfAnalysis(
    planId: string,
    scenarios: WhatIfScenario[]
  ): Promise<any> {
    try {
      logger.info(`Running what-if analysis for plan ${planId} with ${scenarios.length} scenarios`);

      const plan = await this.getProductionPlan(planId);
      if (!plan) {
        throw new Error(`Production plan not found: ${planId}`);
      }

      const { orders, resources, constraints } = await this.collectPlanningData(planId, plan);

      const baseInput: OptimizationInput = {
        orders,
        resources,
        constraints: constraints.map(c => ({
          type: c.constraintType,
          isHard: c.isHard,
          parameters: c.parameters,
          penalty: c.penalty
        })),
        objectives: plan.objectives.map(obj => ({
          type: obj.type,
          weight: obj.weight,
          target: obj.target
        })),
        timeHorizon: plan.planHorizon * 24
      };

      const results = await this.optimizationEngine.runWhatIfAnalysis(baseInput, scenarios);

      // Cache results
      await CacheService.set(`whatif_${planId}`, results, 3600);

      return results;

    } catch (error) {
      logger.error('Error running what-if analysis:', error);
      throw error;
    }
  }

  /**
   * Generate Master Production Schedule with dynamic real-time adjustments
   */
  public async generateMasterProductionSchedule(
    demandForecast: any[],
    planningHorizon: number,
    urgentOrders?: any[]
  ): Promise<MPSResult> {
    try {
      logger.info('Generating Master Production Schedule...');

      // Collect current orders and resources
      const orders = await this.getProductionOrders('mps_temp');
      const resources = await this.getAvailableResources();

      // Prepare MPS input
      const mpsInput: MPSInput = {
        demandForecast: demandForecast.map(forecast => ({
          productId: forecast.productId,
          period: forecast.period,
          forecastQuantity: forecast.forecastedValue,
          confidence: forecast.confidence,
          customerSegment: forecast.customerSegment
        })),
        currentOrders: orders.map(order => ({
          orderId: order.id,
          productId: order.productId,
          quantity: order.quantity,
          dueDate: order.plannedEndDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          priority: order.priority || 5,
          status: 'new' as const,
          customerType: 'standard' as const,
          rushOrder: false,
          operations: order.operations?.map(op => ({
            operationId: op.operationId,
            name: op.operationName,
            standardTime: op.estimatedDuration,
            setupTime: op.setupTime || 30,
            resourceRequirements: [{
              resourceType: 'workstation',
              quantity: 1,
              preferredResource: op.workstationId
            }],
            qualityCheckRequired: true,
            skillsRequired: op.requiredSkills || []
          })) || []
        })),
        resources: resources.map(resource => ({
          resourceId: resource.id,
          resourceType: resource.type as 'machine' | 'workstation' | 'worker' | 'tool',
          capacity: resource.capacity || 1,
          efficiency: resource.efficiency || 1.0,
          availability: [{
            startTime: new Date(),
            endTime: new Date(Date.now() + planningHorizon * 7 * 24 * 60 * 60 * 1000),
            capacity: resource.capacity || 1
          }],
          maintenanceWindows: [],
          cost: resource.hourlyRate || 50
        })),
        constraints: [{
          constraintId: 'capacity_constraint',
          type: 'capacity' as const,
          description: 'Resource capacity constraints',
          isHard: true,
          priority: 10,
          parameters: {}
        }],
        planningHorizon,
        objectives: [{
          type: 'minimize_makespan' as any,
          weight: 0.5,
          target: planningHorizon * 24
        }],
        urgentOrders: urgentOrders?.map(order => ({
          ...order,
          urgencyReason: order.urgencyReason || 'Customer request',
          requestedBy: order.requestedBy || 'system',
          impactAnalysis: {
            estimatedDelay: order.estimatedDelay || 0,
            affectedOrders: [],
            additionalCost: order.additionalCost || 0,
            resourceConflicts: [],
            riskLevel: 'medium' as const
          },
          approvalRequired: false
        }))
      };

      const mpsResult = await this.mpsEngine.generateMasterSchedule(mpsInput);

      logger.info(`Master Production Schedule generated: ${mpsResult.scheduleId}`);
      return mpsResult;

    } catch (error) {
      logger.error('Error generating Master Production Schedule:', error);
      throw error;
    }
  }

  /**
   * Generate Material Requirements Plan with automatic material planning
   */
  public async generateMaterialRequirementsPlan(
    masterSchedule: any[],
    planningHorizon: number
  ): Promise<MRPResult> {
    try {
      logger.info('Generating Material Requirements Plan...');

      // Get BOM data (mock for now)
      const bomData = await this.getBillOfMaterials();
      
      // Get current inventory (mock for now)
      const currentInventory = await this.getCurrentInventory();
      
      // Get supplier data (mock for now)
      const suppliers = await this.getSuppliers();

      // Prepare MRP input
      const mrpInput: MRPInput = {
        masterSchedule: masterSchedule.map(schedule => ({
          scheduleId: schedule.id || `schedule_${Date.now()}`,
          productId: schedule.productId,
          quantity: schedule.quantity,
          startDate: schedule.startDate,
          endDate: schedule.endDate,
          priority: schedule.priority || 5
        })),
        billOfMaterials: bomData,
        currentInventory,
        suppliers,
        safetyStockConfigs: await this.getSafetyStockConfigs(),
        planningHorizon,
        leadTimeBuffers: await this.getLeadTimeBuffers()
      };

      const mrpResult = await this.mrpEngine.generateMaterialPlan(mrpInput);

      logger.info(`Material Requirements Plan generated: ${mrpResult.planId}`);
      return mrpResult;

    } catch (error) {
      logger.error('Error generating Material Requirements Plan:', error);
      throw error;
    }
  }

  /**
   * Generate enhanced demand forecast with multi-source data integration
   */
  public async generateEnhancedDemandForecast(
    productId: string,
    forecastHorizon: number,
    includeExternalFactors: boolean = true
  ): Promise<any> {
    try {
      logger.info(`Generating enhanced demand forecast for product ${productId}`);

      // Get historical sales data
      const historicalData = await this.getHistoricalDemand(productId, 730); // 2 years
      
      // Prepare enhanced forecasting input
      const enhancedInput: EnhancedForecastingInput = {
        productId,
        historicalSalesData: historicalData.map(d => ({
          date: d.date,
          quantity: d.demand,
          price: 100 + Math.random() * 50, // Mock price data
          customerSegment: 'general',
          channel: 'retail'
        })),
        marketTrends: includeExternalFactors ? {
          industryGrowthRate: 0.05,
          marketSize: 1000000,
          competitorActions: [],
          economicIndicators: {
            gdpGrowth: 0.03,
            inflationRate: 0.02,
            consumerConfidence: 85
          }
        } : undefined,
        crmData: {
          pipelineValue: 500000,
          expectedOrders: [],
          customerFeedback: []
        },
        externalFactors: includeExternalFactors ? {
          seasonality: {
            pattern: 'monthly',
            amplitude: 0.2,
            phase: 0
          },
          economicIndicators: {
            gdpGrowth: 0.03,
            inflationRate: 0.02,
            consumerConfidence: 85
          },
          weatherData: [],
          holidays: []
        } : undefined,
        forecastHorizon,
        confidenceLevel: 0.95
      };

      const enhancedForecast = await this.enhancedDemandEngine.generateEnhancedForecast(enhancedInput);

      logger.info(`Enhanced demand forecast generated for product ${productId}`);
      return enhancedForecast;

    } catch (error) {
      logger.error('Error generating enhanced demand forecast:', error);
      throw error;
    }
  }

  // Helper methods (in production, these would query actual databases)
  private async getProductionPlan(planId: string): Promise<ProductionPlan | null> {
    return await CacheService.get(`production_plan_${planId}`);
  }

  private async getProductsForForecasting(): Promise<Array<{id: string, name: string}>> {
    // Mock data - in production, query from product database
    return [
      { id: 'prod_001', name: 'Product A' },
      { id: 'prod_002', name: 'Product B' },
      { id: 'prod_003', name: 'Product C' }
    ];
  }

  private async getHistoricalDemand(productId: string, days: number): Promise<Array<{date: Date, demand: number}>> {
    // Mock historical demand data
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Generate mock demand with seasonal pattern
      const baseValue = 100 + Math.sin(i / 30) * 20; // Monthly seasonality
      const noise = (Math.random() - 0.5) * 20;
      const demand = Math.max(0, baseValue + noise);

      data.push({ date, demand: Math.round(demand) });
    }

    return data;
  }

  private async getProductionOrders(planId: string): Promise<any[]> {
    // Mock production orders
    return [
      {
        id: 'order_001',
        productId: 'prod_001',
        quantity: 100,
        priority: 8,
        plannedEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        operations: [
          {
            operationId: 'op_001',
            operationName: 'Cutting',
            estimatedDuration: 60,
            setupTime: 15,
            workstationId: 'ws_001',
            requiredSkills: ['cutting'],
            toolRequirements: ['cutter'],
            predecessor: null
          },
          {
            operationId: 'op_002',
            operationName: 'Assembly',
            estimatedDuration: 90,
            setupTime: 30,
            workstationId: 'ws_002',
            requiredSkills: ['assembly'],
            toolRequirements: ['wrench', 'screwdriver'],
            predecessor: 'op_001'
          }
        ]
      }
    ];
  }

  private async getAvailableResources(): Promise<any[]> {
    // Mock available resources
    return [
      {
        id: 'ws_001',
        type: 'workstation',
        name: 'Cutting Station',
        capacity: 1,
        efficiency: 0.95,
        skills: ['cutting'],
        hourlyRate: 75
      },
      {
        id: 'ws_002', 
        type: 'workstation',
        name: 'Assembly Station',
        capacity: 1,
        efficiency: 0.90,
        skills: ['assembly'],
        hourlyRate: 60
      },
      {
        id: 'worker_001',
        type: 'worker',
        name: 'John Doe',
        capacity: 1,
        efficiency: 0.85,
        skills: ['cutting', 'assembly'],
        hourlyRate: 25
      }
    ];
  }

  private async applyPlanChanges(plan: ProductionPlan, changes: PlanChangeRequest[]): Promise<ProductionPlan> {
    // Apply the requested changes to the plan
    for (const change of changes) {
      switch (change.changeType) {
        case 'order_added':
          // Add new order logic
          break;
        case 'order_removed':
          // Remove order logic
          break;
        case 'order_modified':
          // Modify order logic
          break;
        case 'resource_changed':
          // Change resource logic
          break;
        case 'constraint_modified':
          // Modify constraint logic
          break;
      }
    }

    plan.status = PlanStatus.NEEDS_REVISION;
    return plan;
  }

  // Additional helper methods for MRP functionality
  private async getBillOfMaterials(): Promise<any[]> {
    // Mock BOM data - in production, query from BOM database
    return [
      {
        productId: 'prod_001',
        version: '1.0',
        effectiveDate: new Date(),
        materials: [
          {
            materialId: 'mat_001',
            materialCode: 'STEEL_PLATE',
            description: 'Steel Plate 10mm',
            quantityPerUnit: 2.5,
            unit: 'kg',
            scrapFactor: 0.05,
            isPhantom: false,
            isCritical: true,
            leadTime: 5,
            cost: 15.50
          },
          {
            materialId: 'mat_002',
            materialCode: 'BOLT_M8',
            description: 'M8x50 Bolt',
            quantityPerUnit: 8,
            unit: 'pieces',
            scrapFactor: 0.02,
            isPhantom: false,
            isCritical: false,
            leadTime: 3,
            cost: 0.75
          }
        ]
      }
    ];
  }

  private async getCurrentInventory(): Promise<any[]> {
    // Mock inventory data - in production, query from inventory database
    return [
      {
        materialId: 'mat_001',
        materialCode: 'STEEL_PLATE',
        availableQuantity: 500,
        allocatedQuantity: 150,
        unitCost: 15.50,
        location: 'WAREHOUSE_A',
        lastUpdated: new Date()
      },
      {
        materialId: 'mat_002',
        materialCode: 'BOLT_M8',
        availableQuantity: 2000,
        allocatedQuantity: 500,
        unitCost: 0.75,
        location: 'WAREHOUSE_B',
        lastUpdated: new Date()
      }
    ];
  }

  private async getSuppliers(): Promise<any[]> {
    // Mock supplier data - in production, query from supplier database
    return [
      {
        supplierId: 'supplier_001',
        supplierName: 'Steel Corp Ltd',
        materials: [
          {
            materialId: 'mat_001',
            unitCost: 15.50,
            leadTime: 5,
            minimumOrderQuantity: 100,
            qualityRating: 95
          }
        ],
        contactInfo: {
          email: 'orders@steelcorp.com',
          phone: '+1-555-0123'
        },
        performanceMetrics: {
          onTimeDelivery: 92,
          qualityRating: 95,
          responseTime: 2
        }
      },
      {
        supplierId: 'supplier_002',
        supplierName: 'Fastener Solutions',
        materials: [
          {
            materialId: 'mat_002',
            unitCost: 0.75,
            leadTime: 3,
            minimumOrderQuantity: 500,
            qualityRating: 88
          }
        ],
        contactInfo: {
          email: 'sales@fastenersolutions.com',
          phone: '+1-555-0456'
        },
        performanceMetrics: {
          onTimeDelivery: 89,
          qualityRating: 88,
          responseTime: 1
        }
      }
    ];
  }

  private async getSafetyStockConfigs(): Promise<any[]> {
    // Mock safety stock configurations
    return [
      {
        materialId: 'mat_001',
        currentLevel: 50,
        targetLevel: 75,
        reorderPoint: 100,
        calculationMethod: 'statistical',
        serviceLevel: 95,
        leadTimeVariability: 0.15,
        demandVariability: 0.20
      },
      {
        materialId: 'mat_002',
        currentLevel: 200,
        targetLevel: 300,
        reorderPoint: 500,
        calculationMethod: 'statistical',
        serviceLevel: 92,
        leadTimeVariability: 0.10,
        demandVariability: 0.18
      }
    ];
  }

  private async getLeadTimeBuffers(): Promise<any[]> {
    // Mock lead time buffer configurations
    return [
      {
        supplierId: 'supplier_001',
        materialCategory: 'raw_materials',
        bufferDays: 2,
        confidence: 0.90,
        seasonalAdjustment: [
          { month: 12, adjustmentFactor: 1.5, reason: 'Holiday season delays' },
          { month: 1, adjustmentFactor: 1.2, reason: 'New year logistics delays' }
        ]
      },
      {
        supplierId: 'supplier_002',
        materialCategory: 'fasteners',
        bufferDays: 1,
        confidence: 0.95,
        seasonalAdjustment: []
      }
    ];
  }
}
