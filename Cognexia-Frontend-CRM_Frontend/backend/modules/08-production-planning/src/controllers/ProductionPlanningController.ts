import { Request, Response } from 'express';
import { logger } from '../../../utils/logger';
import { ProductionPlanningService } from '../services/ProductionPlanningService';
import { ApiResponse, ValidationUtils } from '@industry5-erp/shared';
import {
  SchedulingObjective,
  OptimizationAlgorithm,
  ForecastMethod
} from '@industry5-erp/shared';

export class ProductionPlanningController {
  private planningService: ProductionPlanningService;

  constructor() {
    this.planningService = new ProductionPlanningService();
  }

  /**
   * Create a new production plan
   * POST /api/v1/production-planning/plans
   */
  public createProductionPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const requestId = req.requestId || 'unknown';
      logger.info(`[${requestId}] Creating production plan`);

      // Validate request body
      const validation = this.validateCreatePlanRequest(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          message: validation.errors.join(', '),
          timestamp: new Date(),
          requestId
        } as ApiResponse);
        return;
      }

      // Create the production plan
      const plan = await this.planningService.createProductionPlan(req.body);

      res.status(201).json({
        success: true,
        data: plan,
        message: 'Production plan created successfully',
        timestamp: new Date(),
        requestId
      } as ApiResponse);

    } catch (error) {
      logger.error('Error creating production plan:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date(),
        requestId: req.requestId || 'unknown'
      } as ApiResponse);
    }
  };

  /**
   * Get production plan by ID
   * GET /api/v1/production-planning/plans/:id
   */
  public getProductionPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const requestId = req.requestId || 'unknown';
      const planId = req.params.id;

      logger.info(`[${requestId}] Getting production plan: ${planId}`);

      // Get plan from cache/database
      const plan = await this.planningService['getProductionPlan'](planId);
      
      if (!plan) {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: `Production plan not found: ${planId}`,
          timestamp: new Date(),
          requestId
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        data: plan,
        message: 'Production plan retrieved successfully',
        timestamp: new Date(),
        requestId
      } as ApiResponse);

    } catch (error) {
      logger.error('Error getting production plan:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date(),
        requestId: req.requestId || 'unknown'
      } as ApiResponse);
    }
  };

  /**
   * Update production plan
   * PUT /api/v1/production-planning/plans/:id
   */
  public updateProductionPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const requestId = req.requestId || 'unknown';
      const planId = req.params.id;

      logger.info(`[${requestId}] Updating production plan: ${planId}`);

      // Validate request
      const validation = this.validateUpdatePlanRequest(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          message: validation.errors.join(', '),
          timestamp: new Date(),
          requestId
        } as ApiResponse);
        return;
      }

      // Update the plan
      const updateRequest = {
        planId,
        changes: req.body.changes,
        triggerReoptimization: req.body.triggerReoptimization || false
      };

      const updatedPlan = await this.planningService.updateProductionPlan(updateRequest);

      res.status(200).json({
        success: true,
        data: updatedPlan,
        message: 'Production plan updated successfully',
        timestamp: new Date(),
        requestId
      } as ApiResponse);

    } catch (error) {
      logger.error('Error updating production plan:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date(),
        requestId: req.requestId || 'unknown'
      } as ApiResponse);
    }
  };

  /**
   * Generate demand forecast
   * POST /api/v1/production-planning/forecast
   */
  public generateDemandForecast = async (req: Request, res: Response): Promise<void> => {
    try {
      const requestId = req.requestId || 'unknown';
      logger.info(`[${requestId}] Generating demand forecast`);

      // Validate request
      const validation = this.validateForecastRequest(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          message: validation.errors.join(', '),
          timestamp: new Date(),
          requestId
        } as ApiResponse);
        return;
      }

      // Generate forecast using the demand engine directly
      const demandEngine = this.planningService['demandEngine'];
      const forecast = await demandEngine.generateForecast(req.body);

      res.status(200).json({
        success: true,
        data: forecast,
        message: 'Demand forecast generated successfully',
        timestamp: new Date(),
        requestId
      } as ApiResponse);

    } catch (error) {
      logger.error('Error generating demand forecast:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date(),
        requestId: req.requestId || 'unknown'
      } as ApiResponse);
    }
  };

  /**
   * Run optimization
   * POST /api/v1/production-planning/optimize
   */
  public runOptimization = async (req: Request, res: Response): Promise<void> => {
    try {
      const requestId = req.requestId || 'unknown';
      logger.info(`[${requestId}] Running production optimization`);

      // Validate request
      const validation = this.validateOptimizationRequest(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          message: validation.errors.join(', '),
          timestamp: new Date(),
          requestId
        } as ApiResponse);
        return;
      }

      // Run optimization using the optimization engine directly
      const optimizationEngine = this.planningService['optimizationEngine'];
      const result = await optimizationEngine.optimizeSchedule(req.body);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Optimization completed successfully',
        timestamp: new Date(),
        requestId
      } as ApiResponse);

    } catch (error) {
      logger.error('Error running optimization:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date(),
        requestId: req.requestId || 'unknown'
      } as ApiResponse);
    }
  };

  /**
   * Run what-if analysis
   * POST /api/v1/production-planning/plans/:id/what-if
   */
  public runWhatIfAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
      const requestId = req.requestId || 'unknown';
      const planId = req.params.id;

      logger.info(`[${requestId}] Running what-if analysis for plan: ${planId}`);

      // Validate request
      if (!req.body.scenarios || !Array.isArray(req.body.scenarios)) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          message: 'Scenarios array is required',
          timestamp: new Date(),
          requestId
        } as ApiResponse);
        return;
      }

      const results = await this.planningService.runWhatIfAnalysis(planId, req.body.scenarios);

      res.status(200).json({
        success: true,
        data: results,
        message: 'What-if analysis completed successfully',
        timestamp: new Date(),
        requestId
      } as ApiResponse);

    } catch (error) {
      logger.error('Error running what-if analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date(),
        requestId: req.requestId || 'unknown'
      } as ApiResponse);
    }
  };

  /**
   * Get planning KPIs
   * GET /api/v1/production-planning/kpis
   */
  public getPlanningKPIs = async (req: Request, res: Response): Promise<void> => {
    try {
      const requestId = req.requestId || 'unknown';
      logger.info(`[${requestId}] Getting planning KPIs`);

      // In production, this would query actual KPI data
      const mockKPIs = [
        {
          name: 'Overall Equipment Effectiveness',
          value: 82.5,
          target: 85,
          unit: '%',
          trend: 'improving',
          category: 'efficiency'
        },
        {
          name: 'Schedule Adherence',
          value: 94.2,
          target: 95,
          unit: '%',
          trend: 'stable',
          category: 'delivery'
        },
        {
          name: 'Resource Utilization',
          value: 78.9,
          target: 85,
          unit: '%',
          trend: 'improving',
          category: 'utilization'
        },
        {
          name: 'Forecast Accuracy',
          value: 87.3,
          target: 90,
          unit: '%',
          trend: 'improving',
          category: 'quality'
        }
      ];

      res.status(200).json({
        success: true,
        data: mockKPIs,
        message: 'Planning KPIs retrieved successfully',
        timestamp: new Date(),
        requestId
      } as ApiResponse);

    } catch (error) {
      logger.error('Error getting planning KPIs:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date(),
        requestId: req.requestId || 'unknown'
      } as ApiResponse);
    }
  };

  /**
   * Get production alerts
   * GET /api/v1/production-planning/alerts
   */
  public getProductionAlerts = async (req: Request, res: Response): Promise<void> => {
    try {
      const requestId = req.requestId || 'unknown';
      logger.info(`[${requestId}] Getting production alerts`);

      // In production, this would query actual alerts
      const mockAlerts = [
        {
          id: 'alert_001',
          type: 'bottleneck',
          severity: 'critical',
          title: 'Critical Bottleneck at Assembly Station',
          description: 'Assembly Station is operating at 98% capacity, causing delays',
          timestamp: new Date(),
          resolved: false
        },
        {
          id: 'alert_002',
          type: 'demand_spike',
          severity: 'warning',
          title: 'Demand Spike Detected for Product A',
          description: 'Forecast shows 25% increase in demand for next week',
          timestamp: new Date(),
          resolved: false
        }
      ];

      res.status(200).json({
        success: true,
        data: mockAlerts,
        message: 'Production alerts retrieved successfully',
        timestamp: new Date(),
        requestId
      } as ApiResponse);

    } catch (error) {
      logger.error('Error getting production alerts:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date(),
        requestId: req.requestId || 'unknown'
      } as ApiResponse);
    }
  };

  /**
   * Get available algorithms and methods
   * GET /api/v1/production-planning/methods
   */
  public getMethods = async (req: Request, res: Response): Promise<void> => {
    try {
      const requestId = req.requestId || 'unknown';
      
      const methods = {
        forecastMethods: Object.values(ForecastMethod).map(method => ({
          value: method,
          label: method.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
          description: this.getForecastMethodDescription(method)
        })),
        optimizationAlgorithms: Object.values(OptimizationAlgorithm).map(algorithm => ({
          value: algorithm,
          label: algorithm.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
          description: this.getAlgorithmDescription(algorithm)
        })),
        objectives: Object.values(SchedulingObjective).map(objective => ({
          value: objective,
          label: objective.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
          description: this.getObjectiveDescription(objective)
        }))
      };

      res.status(200).json({
        success: true,
        data: methods,
        message: 'Available methods retrieved successfully',
        timestamp: new Date(),
        requestId
      } as ApiResponse);

    } catch (error) {
      logger.error('Error getting methods:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date(),
        requestId: req.requestId || 'unknown'
      } as ApiResponse);
    }
  };

  // Validation methods
  private validateCreatePlanRequest(body: any) {
    const errors: string[] = [];

    // Required fields
    if (!body.planName) errors.push('Plan name is required');
    if (!body.planType) errors.push('Plan type is required');
    if (!body.planHorizon) errors.push('Plan horizon is required');
    if (!body.objectives || !Array.isArray(body.objectives)) {
      errors.push('Objectives array is required');
    }

    // Validate plan type
    const validPlanTypes = ['master', 'detailed', 'operational'];
    if (body.planType && !validPlanTypes.includes(body.planType)) {
      errors.push('Invalid plan type');
    }

    // Validate plan horizon
    if (body.planHorizon && (typeof body.planHorizon !== 'number' || body.planHorizon <= 0)) {
      errors.push('Plan horizon must be a positive number');
    }

    // Validate objectives
    if (body.objectives && Array.isArray(body.objectives)) {
      body.objectives.forEach((obj: any, index: number) => {
        if (!obj.type) errors.push(`Objective ${index}: type is required`);
        if (typeof obj.weight !== 'number' || obj.weight < 0 || obj.weight > 1) {
          errors.push(`Objective ${index}: weight must be between 0 and 1`);
        }
        if (!Object.values(SchedulingObjective).includes(obj.type)) {
          errors.push(`Objective ${index}: invalid objective type`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateUpdatePlanRequest(body: any) {
    const errors: string[] = [];

    if (!body.changes || !Array.isArray(body.changes)) {
      errors.push('Changes array is required');
    }

    if (body.changes && Array.isArray(body.changes)) {
      body.changes.forEach((change: any, index: number) => {
        if (!change.changeType) errors.push(`Change ${index}: changeType is required`);
        if (!change.entityId) errors.push(`Change ${index}: entityId is required`);
        if (!change.reason) errors.push(`Change ${index}: reason is required`);
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateForecastRequest(body: any) {
    const errors: string[] = [];

    if (!body.productId) errors.push('Product ID is required');
    if (!body.historicalData || !Array.isArray(body.historicalData)) {
      errors.push('Historical data array is required');
    }
    if (!body.forecastHorizon) errors.push('Forecast horizon is required');

    if (body.method && !Object.values(ForecastMethod).includes(body.method)) {
      errors.push('Invalid forecast method');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateOptimizationRequest(body: any) {
    const errors: string[] = [];

    if (!body.orders || !Array.isArray(body.orders)) {
      errors.push('Orders array is required');
    }
    if (!body.resources || !Array.isArray(body.resources)) {
      errors.push('Resources array is required');
    }
    if (!body.objectives || !Array.isArray(body.objectives)) {
      errors.push('Objectives array is required');
    }
    if (!body.timeHorizon) errors.push('Time horizon is required');

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Description helpers
  private getForecastMethodDescription(method: ForecastMethod): string {
    const descriptions = {
      [ForecastMethod.ARIMA]: 'Auto-regressive integrated moving average for time series forecasting',
      [ForecastMethod.EXPONENTIAL_SMOOTHING]: 'Exponential smoothing for trend and seasonal data',
      [ForecastMethod.LINEAR_REGRESSION]: 'Linear regression for simple trend analysis',
      [ForecastMethod.NEURAL_NETWORK]: 'Deep learning neural network for complex patterns',
      [ForecastMethod.RANDOM_FOREST]: 'Random forest ensemble for robust predictions',
      [ForecastMethod.LSTM]: 'Long short-term memory network for sequential data',
      [ForecastMethod.PROPHET]: 'Facebook Prophet for seasonal and holiday effects',
      [ForecastMethod.ENSEMBLE]: 'Combination of multiple forecasting methods'
    };
    return descriptions[method] || 'Advanced forecasting method';
  }

  private getAlgorithmDescription(algorithm: OptimizationAlgorithm): string {
    const descriptions = {
      [OptimizationAlgorithm.GENETIC_ALGORITHM]: 'Evolutionary algorithm for complex optimization',
      [OptimizationAlgorithm.SIMULATED_ANNEALING]: 'Metaheuristic for finding global optimum',
      [OptimizationAlgorithm.PARTICLE_SWARM]: 'Swarm intelligence optimization',
      [OptimizationAlgorithm.ANT_COLONY]: 'Bio-inspired algorithm for routing problems',
      [OptimizationAlgorithm.TABU_SEARCH]: 'Local search with memory structure',
      [OptimizationAlgorithm.LINEAR_PROGRAMMING]: 'Mathematical optimization for linear problems',
      [OptimizationAlgorithm.CONSTRAINT_PROGRAMMING]: 'Constraint satisfaction problem solver',
      [OptimizationAlgorithm.REINFORCEMENT_LEARNING]: 'AI-based learning optimization'
    };
    return descriptions[algorithm] || 'Advanced optimization algorithm';
  }

  private getObjectiveDescription(objective: SchedulingObjective): string {
    const descriptions = {
      [SchedulingObjective.MINIMIZE_MAKESPAN]: 'Minimize total production time',
      [SchedulingObjective.MINIMIZE_TARDINESS]: 'Minimize delays and late deliveries',
      [SchedulingObjective.MAXIMIZE_UTILIZATION]: 'Maximize resource utilization',
      [SchedulingObjective.MINIMIZE_COST]: 'Minimize total production costs',
      [SchedulingObjective.MAXIMIZE_THROUGHPUT]: 'Maximize production output',
      [SchedulingObjective.BALANCE_WORKLOAD]: 'Balance workload across resources',
      [SchedulingObjective.MINIMIZE_INVENTORY]: 'Minimize inventory holding costs'
    };
    return descriptions[objective] || 'Production optimization objective';
  }
}
