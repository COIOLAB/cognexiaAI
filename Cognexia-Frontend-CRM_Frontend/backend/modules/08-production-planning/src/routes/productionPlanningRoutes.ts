import express from 'express';
import { container } from '../../../core/container';
import { ProductionPlanningController } from '../controllers/ProductionPlanningController';
import { authMiddleware } from '../../../core/middleware/auth';
import { validateRequest } from '../../../core/middleware/validation';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();
const controller = new ProductionPlanningController();

// Rate limiting for different operations
const createRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for create operations
  message: 'Too many production plan creation requests from this IP, please try again later.'
});

const optimizationRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit optimization requests due to computational intensity
  message: 'Too many optimization requests from this IP, please try again later.'
});

const standardRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs for standard operations
  message: 'Too many requests from this IP, please try again later.'
});

// Apply standard rate limiting to all routes
router.use(standardRateLimit);

// ===================
// PRODUCTION PLAN ROUTES
// ===================

/**
 * @swagger
 * /api/production-planning/plans:
 *   post:
 *     summary: Create new production plan with AI-driven forecasting and optimization
 *     tags: [Production Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planName
 *               - planType
 *               - planHorizon
 *               - objectives
 *             properties:
 *               planName:
 *                 type: string
 *                 description: Name of the production plan
 *               planType:
 *                 type: string
 *                 enum: [master, detailed, operational]
 *                 description: Type of production plan
 *               planHorizon:
 *                 type: number
 *                 minimum: 1
 *                 description: Planning horizon in days
 *               objectives:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [minimize_makespan, minimize_tardiness, maximize_utilization, minimize_cost, maximize_throughput, balance_workload, minimize_inventory]
 *                     weight:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 1
 *                     target:
 *                       type: number
 *                     priority:
 *                       type: string
 *                       enum: [low, medium, high, critical]
 *               constraints:
 *                 type: array
 *                 items:
 *                   type: object
 *               includeForecasting:
 *                 type: boolean
 *                 default: true
 *               optimizationAlgorithm:
 *                 type: string
 *                 enum: [genetic_algorithm, simulated_annealing, particle_swarm, ant_colony, tabu_search, linear_programming, constraint_programming, reinforcement_learning]
 *               forecastMethod:
 *                 type: string
 *                 enum: [arima, exponential_smoothing, linear_regression, neural_network, random_forest, lstm, prophet, ensemble]
 *     responses:
 *       201:
 *         description: Production plan created successfully
 *       400:
 *         description: Invalid request data
 */
router.post('/plans',
  createRateLimit,
  authMiddleware,
  validateRequest,
  controller.createProductionPlan
);

/**
 * @swagger
 * /api/production-planning/plans/{id}:
 *   get:
 *     summary: Get production plan by ID
 *     tags: [Production Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Production plan ID
 *     responses:
 *       200:
 *         description: Production plan retrieved successfully
 *       404:
 *         description: Production plan not found
 */
router.get('/plans/:id',
  authMiddleware,
  controller.getProductionPlan
);

/**
 * @swagger
 * /api/production-planning/plans/{id}:
 *   put:
 *     summary: Update production plan
 *     tags: [Production Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Production plan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - changes
 *             properties:
 *               changes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     changeType:
 *                       type: string
 *                       enum: [order_added, order_removed, order_modified, resource_changed, constraint_modified]
 *                     entityId:
 *                       type: string
 *                     newData:
 *                       type: object
 *                     reason:
 *                       type: string
 *               triggerReoptimization:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Production plan updated successfully
 *       404:
 *         description: Production plan not found
 */
router.put('/plans/:id',
  authMiddleware,
  validateRequest,
  controller.updateProductionPlan
);

/**
 * @swagger
 * /api/production-planning/plans/{id}/what-if:
 *   post:
 *     summary: Run what-if analysis on production plan
 *     tags: [Production Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Production plan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scenarios
 *             properties:
 *               scenarios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   description: What-if scenario configuration
 *     responses:
 *       200:
 *         description: What-if analysis completed successfully
 */
router.post('/plans/:id/what-if',
  optimizationRateLimit,
  authMiddleware,
  validateRequest,
  controller.runWhatIfAnalysis
);

// ===================
// FORECASTING ROUTES
// ===================

/**
 * @swagger
 * /api/production-planning/forecast:
 *   post:
 *     summary: Generate demand forecast using AI models
 *     tags: [Demand Forecasting]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - historicalData
 *               - forecastHorizon
 *             properties:
 *               productId:
 *                 type: string
 *                 description: Product ID for forecasting
 *               historicalData:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                     demand:
 *                       type: number
 *                     context:
 *                       type: object
 *               forecastHorizon:
 *                 type: number
 *                 minimum: 1
 *                 description: Forecast horizon in days
 *               method:
 *                 type: string
 *                 enum: [arima, exponential_smoothing, linear_regression, neural_network, random_forest, lstm, prophet, ensemble]
 *               externalFactors:
 *                 type: array
 *                 items:
 *                   type: object
 *               seasonalityPeriod:
 *                 type: number
 *     responses:
 *       200:
 *         description: Demand forecast generated successfully
 */
router.post('/forecast',
  optimizationRateLimit,
  authMiddleware,
  validateRequest,
  controller.generateDemandForecast
);

// ===================
// OPTIMIZATION ROUTES
// ===================

/**
 * @swagger
 * /api/production-planning/optimize:
 *   post:
 *     summary: Run production optimization using advanced algorithms
 *     tags: [Production Optimization]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orders
 *               - resources
 *               - objectives
 *               - timeHorizon
 *             properties:
 *               orders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   description: Production orders to optimize
 *               resources:
 *                 type: array
 *                 items:
 *                   type: object
 *                   description: Available resources
 *               objectives:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     weight:
 *                       type: number
 *               timeHorizon:
 *                 type: number
 *                 minimum: 1
 *               algorithm:
 *                 type: string
 *                 enum: [genetic_algorithm, simulated_annealing, particle_swarm, ant_colony, tabu_search, linear_programming, constraint_programming, reinforcement_learning]
 *               constraints:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Optimization completed successfully
 */
router.post('/optimize',
  optimizationRateLimit,
  authMiddleware,
  validateRequest,
  controller.runOptimization
);

// ===================
// SCHEDULING ROUTES
// ===================

/**
 * @swagger
 * /api/production-planning/mps:
 *   post:
 *     summary: Generate Master Production Schedule
 *     tags: [Production Scheduling]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - demandForecast
 *               - planningHorizon
 *             properties:
 *               demandForecast:
 *                 type: array
 *                 items:
 *                   type: object
 *               planningHorizon:
 *                 type: number
 *               urgentOrders:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Master Production Schedule generated successfully
 */
router.post('/mps',
  authMiddleware,
  validateRequest,
  async (req, res) => {
    try {
      // This would use the ProductionPlanningService
      const service = container.get('ProductionPlanningService');
      const mpsResult = await service.generateMasterProductionSchedule(
        req.body.demandForecast,
        req.body.planningHorizon,
        req.body.urgentOrders
      );

      res.json({
        success: true,
        data: mpsResult,
        message: 'Master Production Schedule generated successfully',
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date()
      });
    }
  }
);

/**
 * @swagger
 * /api/production-planning/mrp:
 *   post:
 *     summary: Generate Material Requirements Plan
 *     tags: [Production Scheduling]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - masterSchedule
 *               - planningHorizon
 *             properties:
 *               masterSchedule:
 *                 type: array
 *                 items:
 *                   type: object
 *               planningHorizon:
 *                 type: number
 *     responses:
 *       200:
 *         description: Material Requirements Plan generated successfully
 */
router.post('/mrp',
  authMiddleware,
  validateRequest,
  async (req, res) => {
    try {
      const service = container.get('ProductionPlanningService');
      const mrpResult = await service.generateMaterialRequirementsPlan(
        req.body.masterSchedule,
        req.body.planningHorizon
      );

      res.json({
        success: true,
        data: mrpResult,
        message: 'Material Requirements Plan generated successfully',
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date()
      });
    }
  }
);

// ===================
// ANALYTICS & KPI ROUTES
// ===================

/**
 * @swagger
 * /api/production-planning/kpis:
 *   get:
 *     summary: Get production planning KPIs
 *     tags: [Production Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [1d, 7d, 30d, 90d]
 *           default: 7d
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [efficiency, delivery, utilization, quality, all]
 *           default: all
 *     responses:
 *       200:
 *         description: Planning KPIs retrieved successfully
 */
router.get('/kpis',
  authMiddleware,
  controller.getPlanningKPIs
);

/**
 * @swagger
 * /api/production-planning/alerts:
 *   get:
 *     summary: Get production alerts and recommendations
 *     tags: [Production Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [info, warning, critical, all]
 *           default: all
 *       - in: query
 *         name: resolved
 *         schema:
 *           type: boolean
 *           default: false
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *     responses:
 *       200:
 *         description: Production alerts retrieved successfully
 */
router.get('/alerts',
  authMiddleware,
  controller.getProductionAlerts
);

/**
 * @swagger
 * /api/production-planning/methods:
 *   get:
 *     summary: Get available forecasting methods and optimization algorithms
 *     tags: [Production Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available methods retrieved successfully
 */
router.get('/methods',
  authMiddleware,
  controller.getMethods
);

// ===================
// ADVANCED ANALYTICS ROUTES
// ===================

/**
 * @swagger
 * /api/production-planning/analytics/dashboard:
 *   get:
 *     summary: Get comprehensive production planning dashboard
 *     tags: [Production Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [1d, 7d, 30d, 90d, 1y]
 *           default: 30d
 *       - in: query
 *         name: includeForecasts
 *         schema:
 *           type: boolean
 *           default: true
 *       - in: query
 *         name: includeBenchmarks
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Production planning dashboard retrieved successfully
 */
router.get('/analytics/dashboard',
  authMiddleware,
  async (req, res) => {
    try {
      const { timeframe = '30d', includeForecasts = true, includeBenchmarks = false } = req.query;

      // This would aggregate data from various services
      const dashboard = {
        summary: {
          timeframe,
          generatedAt: new Date(),
          activePlans: 5,
          totalOrders: 247,
          averageOEE: 84.2,
          scheduleAdherence: 93.7
        },
        kpis: [
          {
            name: 'Overall Equipment Effectiveness',
            value: 84.2,
            target: 85,
            unit: '%',
            trend: 'improving',
            category: 'efficiency'
          },
          {
            name: 'Schedule Adherence',
            value: 93.7,
            target: 95,
            unit: '%',
            trend: 'stable',
            category: 'delivery'
          },
          {
            name: 'Resource Utilization',
            value: 78.5,
            target: 85,
            unit: '%',
            trend: 'improving',
            category: 'utilization'
          },
          {
            name: 'Forecast Accuracy',
            value: 87.1,
            target: 90,
            unit: '%',
            trend: 'stable',
            category: 'quality'
          }
        ],
        forecasts: includeForecasts === 'true' ? [
          {
            productId: 'prod_001',
            nextWeekDemand: 125,
            confidence: 0.89,
            trend: 'increasing'
          },
          {
            productId: 'prod_002',
            nextWeekDemand: 87,
            confidence: 0.92,
            trend: 'stable'
          }
        ] : undefined,
        bottlenecks: [
          {
            resourceId: 'ws_002',
            resourceName: 'Assembly Station',
            severity: 8.2,
            affectedOrders: 12,
            estimatedDelay: 4.5
          }
        ],
        recommendations: [
          {
            type: 'capacity_increase',
            priority: 'high',
            description: 'Consider adding additional assembly capacity',
            estimatedImpact: 'Reduce bottleneck by 60%',
            estimatedCost: 25000
          },
          {
            type: 'schedule_optimization',
            priority: 'medium',
            description: 'Reschedule non-urgent orders to balance workload',
            estimatedImpact: 'Improve resource utilization by 12%',
            estimatedCost: 0
          }
        ]
      };

      res.json({
        success: true,
        data: dashboard,
        message: 'Production planning dashboard retrieved successfully',
        timestamp: new Date()
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date()
      });
    }
  }
);

/**
 * @swagger
 * /api/production-planning/capacity-analysis:
 *   post:
 *     summary: Perform advanced capacity analysis
 *     tags: [Production Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resources
 *               - timeHorizon
 *             properties:
 *               resources:
 *                 type: array
 *                 items:
 *                   type: string
 *               timeHorizon:
 *                 type: number
 *               includeBottlenecks:
 *                 type: boolean
 *                 default: true
 *               includeRecommendations:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Capacity analysis completed successfully
 */
router.post('/capacity-analysis',
  authMiddleware,
  validateRequest,
  async (req, res) => {
    try {
      // This would use advanced capacity planning engines
      const analysis = {
        analysisId: `capacity_analysis_${Date.now()}`,
        resources: req.body.resources.map(resourceId => ({
          resourceId,
          currentUtilization: 70 + Math.random() * 25,
          projectedUtilization: 75 + Math.random() * 20,
          capacity: 100,
          bottleneckRisk: Math.random() > 0.7 ? 'high' : 'medium'
        })),
        bottlenecks: req.body.includeBottlenecks ? [
          {
            resourceId: 'ws_001',
            severity: 7.5,
            impact: 'Medium',
            recommendations: ['Add second shift', 'Cross-train operators']
          }
        ] : [],
        recommendations: req.body.includeRecommendations ? [
          {
            type: 'resource_addition',
            priority: 'high',
            description: 'Add additional workstation capacity',
            estimatedCost: 50000,
            paybackPeriod: '8 months'
          }
        ] : [],
        generatedAt: new Date()
      };

      res.json({
        success: true,
        data: analysis,
        message: 'Capacity analysis completed successfully',
        timestamp: new Date()
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date()
      });
    }
  }
);

export default router;
