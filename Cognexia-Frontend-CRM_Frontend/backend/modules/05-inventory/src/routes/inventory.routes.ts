import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { validationMiddleware } from '../../../middleware/validation.middleware';
import { permissionMiddleware } from '../../../middleware/permission.middleware';
import { rateLimit } from 'express-rate-limit';
import { 
  createInventoryItemSchema,
  updateInventoryItemSchema,
  stockTransactionSchema,
  cycleCountSchema,
  inventoryAdjustmentSchema,
  inventoryReportSchema,
  stockLocationSchema,
  reorderPointSchema
} from '../validation/inventory.schemas';

const router = Router();
const inventoryController = new InventoryController();

// Rate limiting for sensitive operations
const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const moderateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply authentication to all routes
router.use(authMiddleware);

// ===================== INVENTORY ITEMS ROUTES =====================

/**
 * @swagger
 * /api/inventory/items:
 *   post:
 *     summary: Create a new inventory item
 *     tags: [Inventory Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInventoryItemDto'
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryItem'
 *       400:
 *         description: Bad request
 *       409:
 *         description: Item with SKU already exists
 */
router.post('/items',
  strictRateLimit,
  permissionMiddleware('inventory:create'),
  validationMiddleware(createInventoryItemSchema),
  inventoryController.createItem.bind(inventoryController)
);

/**
 * @swagger
 * /api/inventory/items:
 *   get:
 *     summary: Get all inventory items with pagination and filtering
 *     tags: [Inventory Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: boolean
 *         description: Filter low stock items
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, SKU, or description
 *     responses:
 *       200:
 *         description: List of inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InventoryItem'
 *                 total:
 *                   type: integer
 *                 pages:
 *                   type: integer
 */
router.get('/items',
  moderateRateLimit,
  permissionMiddleware('inventory:read'),
  inventoryController.getItems.bind(inventoryController)
);

/**
 * @swagger
 * /api/inventory/items/{id}:
 *   get:
 *     summary: Get inventory item by ID
 *     tags: [Inventory Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Inventory item details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryItem'
 *       404:
 *         description: Item not found
 */
router.get('/items/:id',
  moderateRateLimit,
  permissionMiddleware('inventory:read'),
  inventoryController.getItemById.bind(inventoryController)
);

/**
 * @swagger
 * /api/inventory/items/{id}:
 *   put:
 *     summary: Update inventory item
 *     tags: [Inventory Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateInventoryItemDto'
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryItem'
 *       404:
 *         description: Item not found
 */
router.put('/items/:id',
  strictRateLimit,
  permissionMiddleware('inventory:update'),
  validationMiddleware(updateInventoryItemSchema),
  inventoryController.updateItem.bind(inventoryController)
);

/**
 * @swagger
 * /api/inventory/items/{id}:
 *   delete:
 *     summary: Delete inventory item
 *     tags: [Inventory Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       204:
 *         description: Item deleted successfully
 *       400:
 *         description: Cannot delete item with current stock
 *       404:
 *         description: Item not found
 */
router.delete('/items/:id',
  strictRateLimit,
  permissionMiddleware('inventory:delete'),
  inventoryController.deleteItem.bind(inventoryController)
);

// ===================== STOCK TRANSACTIONS ROUTES =====================

/**
 * @swagger
 * /api/inventory/transactions:
 *   post:
 *     summary: Create a stock transaction
 *     tags: [Stock Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockTransactionDto'
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StockTransaction'
 *       400:
 *         description: Insufficient stock or invalid transaction
 */
router.post('/transactions',
  strictRateLimit,
  permissionMiddleware('inventory:stock_transaction'),
  validationMiddleware(stockTransactionSchema),
  inventoryController.createStockTransaction.bind(inventoryController)
);

/**
 * @swagger
 * /api/inventory/transactions:
 *   get:
 *     summary: Get stock transactions with filtering
 *     tags: [Stock Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: itemId
 *         schema:
 *           type: string
 *         description: Filter by item ID
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
 *           enum: [INBOUND, OUTBOUND]
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of stock transactions
 */
router.get('/transactions',
  moderateRateLimit,
  permissionMiddleware('inventory:read'),
  inventoryController.getStockTransactions.bind(inventoryController)
);

// ===================== CYCLE COUNTS ROUTES =====================

/**
 * @swagger
 * /api/inventory/cycle-counts:
 *   post:
 *     summary: Create a cycle count
 *     tags: [Cycle Counts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CycleCountDto'
 *     responses:
 *       201:
 *         description: Cycle count created successfully
 */
router.post('/cycle-counts',
  strictRateLimit,
  permissionMiddleware('inventory:cycle_count'),
  validationMiddleware(cycleCountSchema),
  inventoryController.createCycleCount.bind(inventoryController)
);

/**
 * @swagger
 * /api/inventory/cycle-counts/{id}/complete:
 *   patch:
 *     summary: Complete a cycle count
 *     tags: [Cycle Counts]
 *     security:
 *       - bearerAuth: []
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
 *               - actualQuantity
 *               - notes
 *             properties:
 *               actualQuantity:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cycle count completed successfully
 */
router.patch('/cycle-counts/:id/complete',
  strictRateLimit,
  permissionMiddleware('inventory:cycle_count'),
  inventoryController.completeCycleCount.bind(inventoryController)
);

// ===================== INVENTORY ADJUSTMENTS ROUTES =====================

/**
 * @swagger
 * /api/inventory/adjustments:
 *   post:
 *     summary: Create an inventory adjustment
 *     tags: [Inventory Adjustments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventoryAdjustmentDto'
 *     responses:
 *       201:
 *         description: Adjustment created successfully
 */
router.post('/adjustments',
  strictRateLimit,
  permissionMiddleware('inventory:adjustment'),
  validationMiddleware(inventoryAdjustmentSchema),
  inventoryController.createInventoryAdjustment.bind(inventoryController)
);

// ===================== STOCK LOCATIONS ROUTES =====================

/**
 * @swagger
 * /api/inventory/locations:
 *   post:
 *     summary: Create a stock location
 *     tags: [Stock Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockLocationDto'
 *     responses:
 *       201:
 *         description: Stock location created successfully
 */
router.post('/locations',
  strictRateLimit,
  permissionMiddleware('inventory:create'),
  validationMiddleware(stockLocationSchema),
  inventoryController.createStockLocation.bind(inventoryController)
);

// ===================== REORDER POINTS ROUTES =====================

/**
 * @swagger
 * /api/inventory/reorder-points:
 *   post:
 *     summary: Create a reorder point
 *     tags: [Reorder Points]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReorderPointDto'
 *     responses:
 *       201:
 *         description: Reorder point created successfully
 */
router.post('/reorder-points',
  strictRateLimit,
  permissionMiddleware('inventory:create'),
  validationMiddleware(reorderPointSchema),
  inventoryController.createReorderPoint.bind(inventoryController)
);

// ===================== ALERTS ROUTES =====================

/**
 * @swagger
 * /api/inventory/alerts:
 *   get:
 *     summary: Get active inventory alerts
 *     tags: [Inventory Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active alerts
 */
router.get('/alerts',
  moderateRateLimit,
  permissionMiddleware('inventory:read'),
  inventoryController.getActiveAlerts.bind(inventoryController)
);

/**
 * @swagger
 * /api/inventory/alerts/{id}/resolve:
 *   patch:
 *     summary: Resolve an inventory alert
 *     tags: [Inventory Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alert resolved successfully
 */
router.patch('/alerts/:id/resolve',
  strictRateLimit,
  permissionMiddleware('inventory:update'),
  inventoryController.resolveAlert.bind(inventoryController)
);

// ===================== ANALYTICS & REPORTS ROUTES =====================

/**
 * @swagger
 * /api/inventory/analytics:
 *   get:
 *     summary: Get inventory analytics
 *     tags: [Inventory Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *     responses:
 *       200:
 *         description: Inventory analytics data
 */
router.get('/analytics',
  moderateRateLimit,
  permissionMiddleware('inventory:analytics'),
  inventoryController.getInventoryAnalytics.bind(inventoryController)
);

/**
 * @swagger
 * /api/inventory/reports:
 *   post:
 *     summary: Generate inventory report
 *     tags: [Inventory Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventoryReportDto'
 *     responses:
 *       200:
 *         description: Generated report data
 */
router.post('/reports',
  moderateRateLimit,
  permissionMiddleware('inventory:reports'),
  validationMiddleware(inventoryReportSchema),
  inventoryController.generateInventoryReport.bind(inventoryController)
);

// ===================== HEALTH CHECK ROUTES =====================

/**
 * @swagger
 * /api/inventory/health:
 *   get:
 *     summary: Get inventory module health status
 *     tags: [Health Checks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Health status information
 */
router.get('/health',
  moderateRateLimit,
  inventoryController.getHealthStatus.bind(inventoryController)
);

// ===================== BULK OPERATIONS ROUTES =====================

/**
 * @swagger
 * /api/inventory/items/bulk-update:
 *   patch:
 *     summary: Bulk update inventory items
 *     tags: [Bulk Operations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     updates:
 *                       $ref: '#/components/schemas/UpdateInventoryItemDto'
 *     responses:
 *       200:
 *         description: Bulk update completed
 */
router.patch('/items/bulk-update',
  strictRateLimit,
  permissionMiddleware('inventory:bulk_update'),
  inventoryController.bulkUpdateItems.bind(inventoryController)
);

/**
 * @swagger
 * /api/inventory/transactions/bulk:
 *   post:
 *     summary: Create bulk stock transactions
 *     tags: [Bulk Operations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactions:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/StockTransactionDto'
 *     responses:
 *       201:
 *         description: Bulk transactions created
 */
router.post('/transactions/bulk',
  strictRateLimit,
  permissionMiddleware('inventory:bulk_transaction'),
  inventoryController.bulkCreateTransactions.bind(inventoryController)
);

// ===================== IMPORT/EXPORT ROUTES =====================

/**
 * @swagger
 * /api/inventory/import:
 *   post:
 *     summary: Import inventory items from CSV
 *     tags: [Import/Export]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file containing inventory items
 *     responses:
 *       200:
 *         description: Import completed successfully
 */
router.post('/import',
  strictRateLimit,
  permissionMiddleware('inventory:import'),
  inventoryController.importInventoryItems.bind(inventoryController)
);

/**
 * @swagger
 * /api/inventory/export:
 *   get:
 *     summary: Export inventory items to CSV
 *     tags: [Import/Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, xlsx, pdf]
 *           default: csv
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export',
  moderateRateLimit,
  permissionMiddleware('inventory:export'),
  inventoryController.exportInventoryItems.bind(inventoryController)
);

// ===================== FORECASTING ROUTES =====================

/**
 * @swagger
 * /api/inventory/forecast/{itemId}:
 *   get:
 *     summary: Get demand forecast for an item
 *     tags: [Forecasting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: period
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Forecast period in days
 *     responses:
 *       200:
 *         description: Demand forecast data
 */
router.get('/forecast/:itemId',
  moderateRateLimit,
  permissionMiddleware('inventory:forecast'),
  inventoryController.getItemForecast.bind(inventoryController)
);

// ===================== OPTIMIZATION ROUTES =====================

/**
 * @swagger
 * /api/inventory/optimization/reorder-suggestions:
 *   get:
 *     summary: Get AI-powered reorder suggestions
 *     tags: [Optimization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reorder suggestions
 */
router.get('/optimization/reorder-suggestions',
  moderateRateLimit,
  permissionMiddleware('inventory:optimization'),
  inventoryController.getReorderSuggestions.bind(inventoryController)
);

/**
 * @swagger
 * /api/inventory/optimization/abc-analysis:
 *   get:
 *     summary: Get ABC analysis of inventory items
 *     tags: [Optimization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ABC analysis results
 */
router.get('/optimization/abc-analysis',
  moderateRateLimit,
  permissionMiddleware('inventory:analytics'),
  inventoryController.getABCAnalysis.bind(inventoryController)
);

export default router;
