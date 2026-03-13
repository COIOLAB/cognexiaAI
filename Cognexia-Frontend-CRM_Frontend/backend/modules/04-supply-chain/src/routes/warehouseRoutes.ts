import express from 'express';
import { container } from '../../../core/container';
import { WarehouseController } from '../controllers/WarehouseController';
import { authMiddleware } from '../../../core/middleware/auth';
import { validateRequest } from '../../../core/middleware/validation';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();
const controller = container.get<WarehouseController>(WarehouseController);

// Rate limiting for different operations
const createRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for create operations
  message: 'Too many warehouse creation requests from this IP, please try again later.'
});

const standardRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs for standard operations
  message: 'Too many requests from this IP, please try again later.'
});

// Apply standard rate limiting to all routes
router.use(standardRateLimit);

// ===================
// WAREHOUSE CRUD ROUTES
// ===================

/**
 * @swagger
 * /api/supply-chain/warehouses:
 *   post:
 *     summary: Create new warehouse with advanced setup
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - type
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *                 description: Warehouse name
 *               code:
 *                 type: string
 *                 description: Unique warehouse code
 *               type:
 *                 type: string
 *                 enum: [main, distribution, fulfillment, cold_storage, hazmat, cross_dock]
 *               location:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: object
 *                   coordinates:
 *                     type: object
 *                   timezone:
 *                     type: string
 *               capacity:
 *                 type: object
 *               automationSystems:
 *                 type: object
 *               iotSensors:
 *                 type: array
 *     responses:
 *       201:
 *         description: Warehouse created successfully with advanced features
 *       400:
 *         description: Invalid input data
 */
router.post('/', 
  createRateLimit,
  authMiddleware, 
  validateRequest,
  controller.createWarehouse.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/warehouses/{id}:
 *   put:
 *     summary: Update warehouse configuration
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Warehouse updated successfully
 *       404:
 *         description: Warehouse not found
 */
router.put('/:id', 
  authMiddleware, 
  validateRequest,
  controller.updateWarehouse.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/warehouses/{id}:
 *   delete:
 *     summary: Delete warehouse (soft delete)
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse ID
 *     responses:
 *       200:
 *         description: Warehouse deleted successfully
 *       400:
 *         description: Cannot delete warehouse with active inventory
 *       404:
 *         description: Warehouse not found
 */
router.delete('/:id', 
  authMiddleware,
  controller.deleteWarehouse.bind(controller)
);

// ===================
// OPTIMIZATION ROUTES
// ===================

/**
 * @swagger
 * /api/supply-chain/warehouses/{id}/optimize-layout:
 *   post:
 *     summary: Optimize warehouse layout using AI
 *     tags: [Warehouse Optimization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               objectives:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [efficiency, cost, throughput, safety, sustainability]
 *                 default: [efficiency, cost, throughput]
 *     responses:
 *       200:
 *         description: Layout optimization completed successfully
 *       404:
 *         description: Warehouse not found
 */
router.post('/:id/optimize-layout', 
  authMiddleware, 
  validateRequest,
  controller.optimizeLayout.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/warehouses/{id}/setup-crossdocking:
 *   post:
 *     summary: Setup cross-docking operations
 *     tags: [Warehouse Optimization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - configuration
 *             properties:
 *               configuration:
 *                 type: object
 *                 description: Cross-docking configuration parameters
 *     responses:
 *       200:
 *         description: Cross-docking setup completed successfully
 */
router.post('/:id/setup-crossdocking', 
  authMiddleware, 
  validateRequest,
  controller.setupCrossDocking.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/warehouses/{id}/optimize-storage:
 *   post:
 *     summary: Optimize storage locations
 *     tags: [Warehouse Optimization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse ID
 *     responses:
 *       200:
 *         description: Storage location optimization completed successfully
 */
router.post('/:id/optimize-storage', 
  authMiddleware,
  controller.optimizeStorageLocations.bind(controller)
);

// ===================
// ANALYTICS ROUTES
// ===================

/**
 * @swagger
 * /api/supply-chain/warehouses/{id}/analytics:
 *   get:
 *     summary: Get warehouse performance analytics
 *     tags: [Warehouse Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse ID
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
 *         description: Warehouse analytics retrieved successfully
 *       404:
 *         description: Warehouse not found
 */
router.get('/:id/analytics', 
  authMiddleware,
  controller.getWarehouseAnalytics.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/warehouses/{id}/dashboard:
 *   get:
 *     summary: Get real-time warehouse dashboard
 *     tags: [Warehouse Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse ID
 *     responses:
 *       200:
 *         description: Warehouse dashboard data retrieved successfully
 *       404:
 *         description: Warehouse not found
 */
router.get('/:id/dashboard', 
  authMiddleware,
  controller.getDashboard.bind(controller)
);

// ===================
// EQUIPMENT MANAGEMENT ROUTES
// ===================

/**
 * @swagger
 * /api/supply-chain/warehouses/{id}/equipment:
 *   post:
 *     summary: Manage warehouse equipment
 *     tags: [Warehouse Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [add, update, remove]
 *               equipmentId:
 *                 type: string
 *                 description: Required for update and remove actions
 *               data:
 *                 type: object
 *                 description: Equipment data for add and update actions
 *     responses:
 *       200:
 *         description: Equipment management operation completed successfully
 *       400:
 *         description: Invalid action or missing data
 *       404:
 *         description: Warehouse or equipment not found
 */
router.post('/:id/equipment', 
  authMiddleware, 
  validateRequest,
  controller.manageEquipment.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/warehouses/{id}/equipment/{equipmentId}/maintenance:
 *   post:
 *     summary: Schedule equipment maintenance
 *     tags: [Warehouse Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse ID
 *       - in: path
 *         name: equipmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Equipment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - maintenanceDate
 *               - type
 *             properties:
 *               maintenanceDate:
 *                 type: string
 *                 format: date-time
 *               type:
 *                 type: string
 *                 enum: [preventive, corrective, emergency, calibration]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Maintenance scheduled successfully
 *       404:
 *         description: Warehouse or equipment not found
 */
router.post('/:id/equipment/:equipmentId/maintenance', 
  authMiddleware, 
  validateRequest,
  controller.scheduleMaintenance.bind(controller)
);

// ===================
// REPORTING ROUTES
// ===================

/**
 * @swagger
 * /api/supply-chain/warehouses/{id}/reports:
 *   get:
 *     summary: Generate warehouse reports
 *     tags: [Warehouse Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Warehouse ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [operational, financial, performance, compliance, sustainability]
 *           default: operational
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
 *         name: includeRecommendations
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include AI-generated recommendations
 *     responses:
 *       200:
 *         description: Warehouse report generated successfully
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
router.get('/:id/reports', 
  authMiddleware,
  controller.generateReport.bind(controller)
);

export default router;
