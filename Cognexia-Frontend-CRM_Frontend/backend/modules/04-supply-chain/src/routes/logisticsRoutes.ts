import express from 'express';
import { container } from '../../../core/container';
import { LogisticsController } from '../controllers/LogisticsController';
import { authMiddleware } from '../../../core/middleware/auth';
import { validateRequest } from '../../../core/middleware/validation';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();
const controller = container.get<LogisticsController>(LogisticsController);

// Rate limiting for different operations
const createRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs for create operations
  message: 'Too many logistics creation requests from this IP, please try again later.'
});

const optimizationRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // limit optimization requests due to computational intensity
  message: 'Too many optimization requests from this IP, please try again later.'
});

const standardRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // higher limit for logistics operations
  message: 'Too many requests from this IP, please try again later.'
});

// Apply standard rate limiting to all routes
router.use(standardRateLimit);

// ===================
// LOGISTICS ORDER ROUTES
// ===================

/**
 * @swagger
 * /api/supply-chain/logistics/orders:
 *   post:
 *     summary: Create logistics order with AI optimization
 *     tags: [Logistics Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shipments
 *             properties:
 *               shipments:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: Array of shipment objects
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               deliveryWindow:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date-time
 *                   end:
 *                     type: string
 *                     format: date-time
 *               constraints:
 *                 type: object
 *                 description: Delivery constraints and requirements
 *     responses:
 *       201:
 *         description: Logistics order created successfully with tracking
 *       400:
 *         description: Invalid shipment data
 */
router.post('/orders', 
  createRateLimit,
  authMiddleware, 
  validateRequest,
  controller.createLogisticsOrder.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/logistics/orders/{id}:
 *   get:
 *     summary: Get logistics order with real-time tracking
 *     tags: [Logistics Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Logistics order ID
 *       - in: query
 *         name: includeTracking
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include real-time tracking data
 *       - in: query
 *         name: includeAnalytics
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include performance analytics
 *     responses:
 *       200:
 *         description: Logistics order retrieved successfully
 *       404:
 *         description: Logistics order not found
 */
router.get('/orders/:id', 
  authMiddleware,
  controller.getLogisticsOrder.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/logistics/orders/{id}/status:
 *   put:
 *     summary: Update logistics order status
 *     tags: [Logistics Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Logistics order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, in_transit, delivered, cancelled, returned]
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *                   address:
 *                     type: string
 *               notes:
 *                 type: string
 *               updateTracking:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       404:
 *         description: Order not found
 */
router.put('/orders/:id/status', 
  authMiddleware, 
  validateRequest,
  controller.updateOrderStatus.bind(controller)
);

// ===================
// ROUTE OPTIMIZATION ROUTES
// ===================

/**
 * @swagger
 * /api/supply-chain/logistics/optimize-routes:
 *   post:
 *     summary: Optimize delivery routes using AI
 *     tags: [Route Optimization]
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
 *             properties:
 *               orders:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: Orders to be optimized for routing
 *               constraints:
 *                 type: object
 *                 properties:
 *                   maxVehicleCapacity:
 *                     type: number
 *                     default: 1000
 *                   maxDeliveryTime:
 *                     type: number
 *                     default: 8
 *                     description: Maximum delivery time in hours
 *                   fuelType:
 *                     type: string
 *                     enum: [electric, diesel, hybrid, hydrogen]
 *                     default: electric
 *                   trafficOptimization:
 *                     type: boolean
 *                     default: true
 *                   weatherConsideration:
 *                     type: boolean
 *                     default: true
 *               objectives:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [time, cost, fuel, carbon, distance]
 *                 default: [time, cost, fuel]
 *     responses:
 *       200:
 *         description: Routes optimized successfully
 *       400:
 *         description: Invalid order data
 */
router.post('/optimize-routes', 
  optimizationRateLimit,
  authMiddleware, 
  validateRequest,
  controller.optimizeRoutes.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/logistics/quantum-optimization:
 *   post:
 *     summary: Advanced route planning with quantum optimization
 *     tags: [Route Optimization]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deliveryPoints
 *             properties:
 *               deliveryPoints:
 *                 type: array
 *                 items:
 *                   type: object
 *                 minItems: 2
 *                 description: Delivery points for quantum optimization
 *               constraints:
 *                 type: object
 *                 description: Standard optimization constraints
 *               quantumParameters:
 *                 type: object
 *                 properties:
 *                   annealing:
 *                     type: boolean
 *                     default: true
 *                     description: Enable quantum annealing
 *                   dimensions:
 *                     type: integer
 *                     default: 5
 *                     description: Parallel quantum dimensions
 *                   entanglement:
 *                     type: number
 *                     default: 0.8
 *                     minimum: 0
 *                     maximum: 1
 *                     description: Quantum entanglement level
 *     responses:
 *       200:
 *         description: Quantum route optimization completed successfully
 *       400:
 *         description: Invalid delivery points
 */
router.post('/quantum-optimization', 
  optimizationRateLimit,
  authMiddleware, 
  validateRequest,
  controller.quantumRouteOptimization.bind(controller)
);

// ===================
// TRACKING ROUTES
// ===================

/**
 * @swagger
 * /api/supply-chain/logistics/track/{shipmentId}:
 *   get:
 *     summary: Track shipment in real-time
 *     tags: [Shipment Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shipmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment ID to track
 *       - in: query
 *         name: includePredictions
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include AI delivery predictions
 *     responses:
 *       200:
 *         description: Shipment tracking retrieved successfully
 *       404:
 *         description: Shipment not found
 */
router.get('/track/:shipmentId', 
  authMiddleware,
  controller.trackShipment.bind(controller)
);

// ===================
// DASHBOARD & ANALYTICS ROUTES
// ===================

/**
 * @swagger
 * /api/supply-chain/logistics/dashboard:
 *   get:
 *     summary: Get logistics analytics dashboard
 *     tags: [Logistics Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [1d, 7d, 30d, 90d, 1y]
 *           default: 7d
 *         description: Analytics timeframe
 *       - in: query
 *         name: metrics
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *           default: [all]
 *         description: Specific metrics to include
 *     responses:
 *       200:
 *         description: Logistics dashboard retrieved successfully
 */
router.get('/dashboard', 
  authMiddleware,
  controller.getLogisticsDashboard.bind(controller)
);

// ===================
// FLEET MANAGEMENT ROUTES
// ===================

/**
 * @swagger
 * /api/supply-chain/logistics/fleet:
 *   post:
 *     summary: Manage fleet vehicles
 *     tags: [Fleet Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - vehicleData
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [add, update, remove, schedule_maintenance]
 *               vehicleData:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Vehicle ID (required for update, remove, schedule_maintenance)
 *                   maintenanceData:
 *                     type: object
 *                     description: Maintenance data (required for schedule_maintenance)
 *     responses:
 *       200:
 *         description: Fleet operation completed successfully
 *       400:
 *         description: Invalid action or vehicle data
 */
router.post('/fleet', 
  authMiddleware, 
  validateRequest,
  controller.manageFleet.bind(controller)
);

// ===================
// MATERIAL FLOW OPTIMIZATION
// ===================

/**
 * @swagger
 * /api/supply-chain/logistics/optimize-material-flow:
 *   post:
 *     summary: Optimize material flow
 *     tags: [Material Flow]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - warehouseId
 *               - materials
 *             properties:
 *               warehouseId:
 *                 type: string
 *               materials:
 *                 type: array
 *                 items:
 *                   type: object
 *               constraints:
 *                 type: object
 *                 properties:
 *                   throughputGoals:
 *                     type: object
 *                     properties:
 *                       hourly:
 *                         type: number
 *                         default: 100
 *                       daily:
 *                         type: number
 *                         default: 2000
 *                   resourceLimits:
 *                     type: object
 *                   qualityRequirements:
 *                     type: object
 *     responses:
 *       200:
 *         description: Material flow optimized successfully
 */
router.post('/optimize-material-flow', 
  optimizationRateLimit,
  authMiddleware, 
  validateRequest,
  controller.optimizeMaterialFlow.bind(controller)
);

// ===================
// PREDICTIVE MAINTENANCE ROUTES
// ===================

/**
 * @swagger
 * /api/supply-chain/logistics/predictive-maintenance/{equipmentType}/{equipmentId}:
 *   get:
 *     summary: Predictive maintenance analysis for logistics equipment
 *     tags: [Predictive Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: equipmentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [vehicle, forklift, conveyor, robot, scanner]
 *         description: Type of equipment
 *       - in: path
 *         name: equipmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Equipment ID
 *       - in: query
 *         name: includeRecommendations
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include maintenance recommendations
 *     responses:
 *       200:
 *         description: Predictive maintenance analysis completed successfully
 */
router.get('/predictive-maintenance/:equipmentType/:equipmentId', 
  authMiddleware,
  controller.predictiveMaintenanceAnalysis.bind(controller)
);

// ===================
// ALERTS & NOTIFICATIONS ROUTES
// ===================

/**
 * @swagger
 * /api/supply-chain/logistics/alerts:
 *   get:
 *     summary: Get real-time logistics alerts and notifications
 *     tags: [Logistics Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [all, info, warning, critical]
 *           default: all
 *         description: Alert severity filter
 *       - in: query
 *         name: acknowledged
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include acknowledged alerts
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 200
 *         description: Maximum number of alerts to return
 *     responses:
 *       200:
 *         description: Logistics alerts retrieved successfully
 */
router.get('/alerts', 
  authMiddleware,
  controller.getLogisticsAlerts.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/logistics/alerts/{alertId}/acknowledge:
 *   post:
 *     summary: Acknowledge logistics alert
 *     tags: [Logistics Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alertId
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID to acknowledge
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Additional notes for acknowledgment
 *     responses:
 *       200:
 *         description: Alert acknowledged successfully
 */
router.post('/alerts/:alertId/acknowledge', 
  authMiddleware, 
  validateRequest,
  controller.acknowledgeAlert.bind(controller)
);

// ===================
// REPORTING ROUTES
// ===================

/**
 * @swagger
 * /api/supply-chain/logistics/reports:
 *   get:
 *     summary: Generate logistics reports
 *     tags: [Logistics Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [performance, efficiency, costs, carbon, delivery]
 *           default: performance
 *         description: Report type
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, quarterly, yearly]
 *           default: monthly
 *         description: Report period
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, pdf, excel, csv]
 *           default: json
 *         description: Report format
 *       - in: query
 *         name: includeAnalytics
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include advanced analytics
 *     responses:
 *       200:
 *         description: Logistics report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/reports', 
  authMiddleware,
  controller.generateReport.bind(controller)
);

export default router;
