import express from 'express';
import { container } from '../../../core/container';
import { AdvancedSupplyChainController } from '../controllers/AdvancedSupplyChainController';
import { authMiddleware } from '../../../core/middleware/auth';
import { validateRequest } from '../../../core/middleware/validation';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();
const controller = container.get<AdvancedSupplyChainController>(AdvancedSupplyChainController);

// Rate limiting for API endpoints
const createRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs for create operations
  message: 'Too many create requests from this IP, please try again later.'
});

const standardRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs for standard operations
  message: 'Too many requests from this IP, please try again later.'
});

// Apply standard rate limiting to all routes
router.use(standardRateLimit);

// ===================
// INVENTORY ROUTES
// ===================

/**
 * @swagger
 * /api/supply-chain/inventory:
 *   get:
 *     summary: Get inventory items with advanced features
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: warehouse
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: includeIoT
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: includeAI
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: includeBlockchain
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Inventory items retrieved successfully
 */
router.get('/inventory', 
  authMiddleware, 
  controller.getInventoryItems.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/inventory/{id}:
 *   get:
 *     summary: Get single inventory item with full integration
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory item retrieved successfully
 *       404:
 *         description: Item not found
 */
router.get('/inventory/:id', 
  authMiddleware, 
  controller.getInventoryItem.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/inventory:
 *   post:
 *     summary: Create new inventory item with advanced features
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sku
 *               - category
 *               - warehouse
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               category:
 *                 type: string
 *               warehouse:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: object
 *               quantity:
 *                 type: object
 *               pricing:
 *                 type: object
 *               iotSensors:
 *                 type: array
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 */
router.post('/inventory', 
  createRateLimit,
  authMiddleware, 
  validateRequest,
  controller.createInventoryItem.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/inventory/{id}/quantity:
 *   patch:
 *     summary: Update inventory quantity with full traceability
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adjustment
 *               - reason
 *             properties:
 *               adjustment:
 *                 type: number
 *               reason:
 *                 type: string
 *               location:
 *                 type: object
 *     responses:
 *       200:
 *         description: Inventory quantity updated successfully
 */
router.patch('/inventory/:id/quantity', 
  authMiddleware, 
  validateRequest,
  controller.updateInventoryQuantity.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/inventory/{id}/transfer:
 *   post:
 *     summary: Transfer inventory between locations
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromWarehouse
 *               - toWarehouse
 *               - quantity
 *             properties:
 *               fromWarehouse:
 *                 type: string
 *               toWarehouse:
 *                 type: string
 *               quantity:
 *                 type: number
 *               reason:
 *                 type: string
 *               newLocation:
 *                 type: object
 *     responses:
 *       200:
 *         description: Inventory transfer completed successfully
 */
router.post('/inventory/:id/transfer', 
  authMiddleware, 
  validateRequest,
  controller.transferInventoryItem.bind(controller)
);

// ===================
// WAREHOUSE ROUTES
// ===================

/**
 * @swagger
 * /api/supply-chain/warehouses:
 *   get:
 *     summary: Get all warehouses with advanced analytics
 *     tags: [Warehouses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: includeAnalytics
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Warehouses retrieved successfully
 */
router.get('/warehouses', 
  authMiddleware, 
  controller.getWarehouses.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/warehouses/{id}:
 *   get:
 *     summary: Get warehouse with full integration
 *     tags: [Warehouses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouse retrieved successfully
 *       404:
 *         description: Warehouse not found
 */
router.get('/warehouses/:id', 
  authMiddleware, 
  controller.getWarehouse.bind(controller)
);

// ===================
// IOT ROUTES
// ===================

/**
 * @swagger
 * /api/supply-chain/iot/dashboard:
 *   get:
 *     summary: Get IoT dashboard data
 *     tags: [IoT]
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: IoT dashboard data retrieved successfully
 */
router.get('/iot/dashboard', 
  authMiddleware, 
  controller.getIoTDashboard.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/iot/devices:
 *   post:
 *     summary: Register new IoT device
 *     tags: [IoT]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *               - type
 *             properties:
 *               deviceId:
 *                 type: string
 *               type:
 *                 type: string
 *               assetId:
 *                 type: string
 *               location:
 *                 type: object
 *               configuration:
 *                 type: object
 *     responses:
 *       200:
 *         description: IoT device registered successfully
 */
router.post('/iot/devices', 
  createRateLimit,
  authMiddleware, 
  validateRequest,
  controller.registerIoTDevice.bind(controller)
);

// ===================
// AI ROUTES
// ===================

/**
 * @swagger
 * /api/supply-chain/ai/predictions/{type}/{itemId}:
 *   get:
 *     summary: Get AI predictions for an item
 *     tags: [AI]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [demand, quality, optimization]
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: AI prediction retrieved successfully
 */
router.get('/ai/predictions/:type/:itemId', 
  authMiddleware, 
  controller.getAIPredictions.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/ai/optimization/{type}/{warehouseId}:
 *   get:
 *     summary: Generate optimization recommendations
 *     tags: [AI]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [layout, inventory, workflow, energy]
 *       - in: path
 *         name: warehouseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Optimization recommendations generated successfully
 */
router.get('/ai/optimization/:type/:warehouseId', 
  authMiddleware, 
  controller.generateOptimizations.bind(controller)
);

// =======================
// BLOCKCHAIN ROUTES
// =======================

/**
 * @swagger
 * /api/supply-chain/blockchain/history/{itemId}:
 *   get:
 *     summary: Get supply chain history for an item
 *     tags: [Blockchain]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Supply chain history retrieved successfully
 */
router.get('/blockchain/history/:itemId', 
  authMiddleware, 
  controller.getSupplyChainHistory.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/blockchain/verify/{itemId}:
 *   get:
 *     summary: Verify supply chain integrity
 *     tags: [Blockchain]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Supply chain verification completed
 */
router.get('/blockchain/verify/:itemId', 
  authMiddleware, 
  controller.verifySupplyChain.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/blockchain/compliance/{itemId}:
 *   get:
 *     summary: Generate compliance report
 *     tags: [Blockchain]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Compliance report generated successfully
 */
router.get('/blockchain/compliance/:itemId', 
  authMiddleware, 
  controller.generateComplianceReport.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/blockchain/status:
 *   get:
 *     summary: Get blockchain network status
 *     tags: [Blockchain]
 *     responses:
 *       200:
 *         description: Blockchain status retrieved successfully
 */
router.get('/blockchain/status', 
  authMiddleware, 
  controller.getBlockchainStatus.bind(controller)
);

// =======================
// ANALYTICS & REPORTING ROUTES
// =======================

/**
 * @swagger
 * /api/supply-chain/analytics/dashboard:
 *   get:
 *     summary: Get comprehensive analytics dashboard
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           default: '7d'
 *     responses:
 *       200:
 *         description: Analytics dashboard retrieved successfully
 */
router.get('/analytics/dashboard', 
  authMiddleware, 
  controller.getAnalyticsDashboard.bind(controller)
);

/**
 * @swagger
 * /api/supply-chain/export:
 *   get:
 *     summary: Export data for external systems
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [inventory, warehouses, iot]
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data exported successfully
 */
router.get('/export', 
  authMiddleware, 
  controller.exportData.bind(controller)
);

export default router;
