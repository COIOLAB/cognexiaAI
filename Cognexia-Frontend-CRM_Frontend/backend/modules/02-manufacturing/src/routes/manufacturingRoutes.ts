import { Router } from 'express';
import { body, param, query } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { validateRequest } from '../../../middleware/validateRequest';
import manufacturingController from '../controllers/ManufacturingController';
import { logger } from '../../../utils/logger';

const router = Router();

// Rate limiting configurations
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: 'Too many write requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware logging
const logEndpointAccess = (endpointName: string) => (req: any, res: any, next: any) => {
  logger.info(`Manufacturing endpoint accessed: ${endpointName}`, {
    requestId: req.requestId,
    userId: req.user?.id,
    ip: req.ip
  });
  next();
};

// Production Process Routes
router.post(
  '/processes',
  strictRateLimit,
  authMiddleware,
  [
    body('processName').notEmpty().withMessage('Process name is required'),
    body('processType').notEmpty().withMessage('Process type is required'),
    body('facility').notEmpty().withMessage('Facility is required'),
    body('description').optional().isLength({ max: 1000 }),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('status').optional().isIn(['draft', 'active', 'inactive', 'archived']),
    body('steps').isArray().withMessage('Process steps must be an array'),
    body('steps.*.stepName').notEmpty().withMessage('Step name is required'),
    body('steps.*.stepOrder').isInt({ min: 1 }).withMessage('Step order must be a positive integer'),
    body('steps.*.duration').isInt({ min: 0 }).withMessage('Duration must be non-negative'),
    body('qualityRequirements').optional().isArray(),
    body('resourceRequirements').optional().isArray(),
    body('safetyRequirements').optional().isArray()
  ],
  manufacturingController.createProductionProcess
);

router.get(
  '/processes',
  authorize(['manufacturing_manager', 'production_supervisor', 'quality_manager', 'operator']),
  [
    query('status').optional().isIn(['draft', 'active', 'inactive', 'archived']),
    query('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    query('type').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  manufacturingController.getProductionProcesses
);

router.get(
  '/processes/:processId',
  authorize(['manufacturing_manager', 'production_supervisor', 'quality_manager', 'operator']),
  [
    param('processId').isUUID().withMessage('Invalid process ID format')
  ],
  manufacturingController.getProductionProcessById
);

router.put(
  '/processes/:processId',
  authorize(['manufacturing_manager', 'production_supervisor']),
  [
    param('processId').isUUID().withMessage('Invalid process ID format'),
    body('processName').optional().notEmpty().withMessage('Process name cannot be empty'),
    body('processType').optional().notEmpty().withMessage('Process type cannot be empty'),
    body('description').optional().isLength({ max: 1000 }),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('status').optional().isIn(['draft', 'active', 'inactive', 'archived']),
    body('steps').optional().isArray().withMessage('Process steps must be an array'),
    body('steps.*.stepName').optional().notEmpty().withMessage('Step name is required'),
    body('steps.*.stepOrder').optional().isInt({ min: 1 }).withMessage('Step order must be a positive integer'),
    body('steps.*.duration').optional().isInt({ min: 0 }).withMessage('Duration must be non-negative')
  ],
  manufacturingController.updateProductionProcess
);

router.delete(
  '/processes/:processId',
  authorize(['manufacturing_manager']),
  [
    param('processId').isUUID().withMessage('Invalid process ID format')
  ],
  manufacturingController.deleteProductionProcess
);

// Production Line Routes
router.post(
  '/lines',
  authorize(['manufacturing_manager', 'production_supervisor']),
  [
    body('lineName').notEmpty().withMessage('Line name is required'),
    body('facility').notEmpty().withMessage('Facility is required'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
    body('description').optional().isLength({ max: 1000 }),
    body('status').optional().isIn(['active', 'inactive', 'maintenance', 'offline']),
    body('workstations').isArray().withMessage('Workstations must be an array'),
    body('workstations.*.workstationId').notEmpty().withMessage('Workstation ID is required'),
    body('workstations.*.position').isInt({ min: 1 }).withMessage('Position must be a positive integer'),
    body('equipment').optional().isArray(),
    body('operators').optional().isArray()
  ],
  manufacturingController.createProductionLine
);

router.get(
  '/lines',
  authorize(['manufacturing_manager', 'production_supervisor', 'quality_manager', 'operator']),
  [
    query('status').optional().isIn(['active', 'inactive', 'maintenance', 'offline']),
    query('facility').optional().isString(),
    query('efficiency').optional().isFloat({ min: 0, max: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  manufacturingController.getProductionLines
);

router.get(
  '/lines/:lineId',
  authorize(['manufacturing_manager', 'production_supervisor', 'quality_manager', 'operator']),
  [
    param('lineId').isUUID().withMessage('Invalid line ID format')
  ],
  manufacturingController.getProductionLineById
);

router.put(
  '/lines/:lineId',
  authorize(['manufacturing_manager', 'production_supervisor']),
  [
    param('lineId').isUUID().withMessage('Invalid line ID format'),
    body('lineName').optional().notEmpty().withMessage('Line name cannot be empty'),
    body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
    body('description').optional().isLength({ max: 1000 }),
    body('status').optional().isIn(['active', 'inactive', 'maintenance', 'offline']),
    body('workstations').optional().isArray().withMessage('Workstations must be an array'),
    body('equipment').optional().isArray(),
    body('operators').optional().isArray()
  ],
  manufacturingController.updateProductionLine
);

// Production Monitoring and Analytics Routes
router.get(
  '/metrics',
  authorize(['manufacturing_manager', 'production_supervisor', 'quality_manager']),
  [
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
    query('lineId').optional().isUUID().withMessage('Invalid line ID format'),
    query('processId').optional().isUUID().withMessage('Invalid process ID format')
  ],
  manufacturingController.getProductionMetrics
);

router.get(
  '/dashboard',
  authorize(['manufacturing_manager', 'production_supervisor', 'quality_manager']),
  [
    query('timeframe').optional().isIn(['1h', '4h', '8h', '24h', '7d', '30d'])
  ],
  manufacturingController.getProductionDashboard
);

router.get(
  '/status/realtime',
  authorize(['manufacturing_manager', 'production_supervisor', 'quality_manager', 'operator']),
  manufacturingController.getRealTimeProductionStatus
);

// Digital Twin Routes
router.post(
  '/digital-twins',
  authorize(['manufacturing_manager', 'production_supervisor', 'digital_twin_specialist']),
  [
    body('entityId').notEmpty().withMessage('Entity ID is required'),
    body('entityType').isIn(['production_line', 'process', 'equipment', 'facility']).withMessage('Invalid entity type'),
    body('name').notEmpty().withMessage('Name is required'),
    body('description').optional().isLength({ max: 1000 }),
    body('configuration').isObject().withMessage('Configuration must be an object'),
    body('sensors').optional().isArray(),
    body('actuators').optional().isArray(),
    body('simulationParameters').optional().isObject()
  ],
  manufacturingController.createDigitalTwin
);

router.get(
  '/digital-twins',
  authorize(['manufacturing_manager', 'production_supervisor', 'digital_twin_specialist', 'quality_manager']),
  [
    query('entityType').optional().isIn(['production_line', 'process', 'equipment', 'facility']),
    query('status').optional().isIn(['active', 'inactive', 'syncing', 'error']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  manufacturingController.getDigitalTwins
);

router.get(
  '/digital-twins/:twinId',
  authorize(['manufacturing_manager', 'production_supervisor', 'digital_twin_specialist', 'quality_manager']),
  [
    param('twinId').isUUID().withMessage('Invalid twin ID format')
  ],
  manufacturingController.getDigitalTwinById
);

router.post(
  '/digital-twins/:twinId/sync',
  authorize(['manufacturing_manager', 'production_supervisor', 'digital_twin_specialist']),
  [
    param('twinId').isUUID().withMessage('Invalid twin ID format')
  ],
  manufacturingController.syncDigitalTwin
);

router.post(
  '/digital-twins/:twinId/simulate',
  authorize(['manufacturing_manager', 'production_supervisor', 'digital_twin_specialist']),
  [
    param('twinId').isUUID().withMessage('Invalid twin ID format'),
    body('simulationDuration').isInt({ min: 1 }).withMessage('Simulation duration must be positive'),
    body('parameters').isObject().withMessage('Parameters must be an object'),
    body('scenarios').optional().isArray(),
    body('outputMetrics').optional().isArray()
  ],
  manufacturingController.simulateDigitalTwin
);

// AI-Optimized Production Routes
router.post(
  '/ai/optimize-schedule',
  authorize(['manufacturing_manager', 'production_supervisor', 'ai_specialist']),
  [
    body('timeHorizon').isInt({ min: 1 }).withMessage('Time horizon must be positive'),
    body('objectives').isArray().withMessage('Objectives must be an array'),
    body('constraints').isArray().withMessage('Constraints must be an array'),
    body('productionOrders').isArray().withMessage('Production orders must be an array'),
    body('resources').isObject().withMessage('Resources must be an object'),
    body('optimizationLevel').optional().isIn(['basic', 'standard', 'advanced'])
  ],
  manufacturingController.optimizeProductionSchedule
);

router.post(
  '/ai/predict-outcomes',
  authorize(['manufacturing_manager', 'production_supervisor', 'ai_specialist']),
  [
    body('predictionType').isIn(['quality', 'efficiency', 'throughput', 'maintenance']).withMessage('Invalid prediction type'),
    body('timeHorizon').isInt({ min: 1 }).withMessage('Time horizon must be positive'),
    body('inputParameters').isObject().withMessage('Input parameters must be an object'),
    body('confidence').optional().isFloat({ min: 0, max: 1 }),
    body('includeProbabilities').optional().isBoolean()
  ],
  manufacturingController.predictProductionOutcomes
);

router.get(
  '/ai/recommendations',
  authorize(['manufacturing_manager', 'production_supervisor', 'ai_specialist']),
  [
    query('type').optional().isIn(['optimization', 'quality', 'efficiency', 'maintenance', 'safety']),
    query('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  manufacturingController.getAIRecommendations
);

// Intelligent Manufacturing Routes
router.post(
  '/intelligent/enable',
  authorize(['manufacturing_manager', 'ai_specialist']),
  [
    body('processId').isUUID().withMessage('Invalid process ID format'),
    body('configData').isObject().withMessage('Configuration data must be an object'),
    body('configData.aiModels').isArray().withMessage('AI models must be an array'),
    body('configData.learningEnabled').isBoolean().withMessage('Learning enabled must be boolean'),
    body('configData.adaptationSpeed').optional().isIn(['slow', 'moderate', 'fast']),
    body('configData.safetyOverrides').optional().isObject()
  ],
  manufacturingController.enableIntelligentManufacturing
);

router.get(
  '/intelligent/status/:processId',
  authorize(['manufacturing_manager', 'production_supervisor', 'ai_specialist']),
  [
    param('processId').isUUID().withMessage('Invalid process ID format')
  ],
  manufacturingController.getIntelligentManufacturingStatus
);

router.put(
  '/intelligent/parameters/:processId',
  authorize(['manufacturing_manager', 'ai_specialist']),
  [
    param('processId').isUUID().withMessage('Invalid process ID format'),
    body('parameters').isObject().withMessage('Parameters must be an object'),
    body('parameters.learningRate').optional().isFloat({ min: 0, max: 1 }),
    body('parameters.adaptationThreshold').optional().isFloat({ min: 0, max: 1 }),
    body('parameters.safetyMargin').optional().isFloat({ min: 0, max: 1 }),
    body('parameters.qualityTargets').optional().isArray()
  ],
  manufacturingController.adjustIntelligentParameters
);

// Production Alerts and Notifications Routes
router.get(
  '/alerts',
  authorize(['manufacturing_manager', 'production_supervisor', 'quality_manager', 'operator']),
  [
    query('severity').optional().isIn(['info', 'warning', 'error', 'critical']),
    query('status').optional().isIn(['active', 'acknowledged', 'resolved', 'dismissed']),
    query('category').optional().isIn(['quality', 'efficiency', 'safety', 'equipment', 'schedule']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  manufacturingController.getProductionAlerts
);

router.put(
  '/alerts/:alertId/acknowledge',
  authorize(['manufacturing_manager', 'production_supervisor', 'quality_manager', 'operator']),
  [
    param('alertId').isUUID().withMessage('Invalid alert ID format'),
    body('userId').isUUID().withMessage('Invalid user ID format'),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters')
  ],
  manufacturingController.acknowledgeAlert
);

// Production Reports Routes
router.post(
  '/reports/generate',
  authorize(['manufacturing_manager', 'production_supervisor', 'quality_manager']),
  [
    body('reportType').isIn(['production', 'quality', 'efficiency', 'oee', 'custom']).withMessage('Invalid report type'),
    body('dateRange').isObject().withMessage('Date range must be an object'),
    body('dateRange.startDate').isISO8601().withMessage('Start date must be valid'),
    body('dateRange.endDate').isISO8601().withMessage('End date must be valid'),
    body('filters').optional().isObject(),
    body('format').optional().isIn(['pdf', 'excel', 'csv', 'json']),
    body('includeCharts').optional().isBoolean(),
    body('recipients').optional().isArray()
  ],
  manufacturingController.generateProductionReport
);

router.get(
  '/reports',
  authorize(['manufacturing_manager', 'production_supervisor', 'quality_manager']),
  [
    query('type').optional().isIn(['production', 'quality', 'efficiency', 'oee', 'custom']),
    query('dateRange').optional().isIn(['today', 'week', 'month', 'quarter', 'year']),
    query('status').optional().isIn(['generating', 'completed', 'failed']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  manufacturingController.getProductionReports
);

// Equipment Management Routes
router.get(
  '/equipment/status',
  authorize(['manufacturing_manager', 'production_supervisor', 'maintenance_manager', 'operator']),
  [
    query('lineId').optional().isUUID().withMessage('Invalid line ID format'),
    query('equipmentType').optional().isString(),
    query('status').optional().isIn(['operational', 'maintenance', 'offline', 'error'])
  ],
  manufacturingController.getEquipmentStatus
);

router.post(
  '/equipment/maintenance/schedule',
  authorize(['manufacturing_manager', 'production_supervisor', 'maintenance_manager']),
  [
    body('equipmentId').isUUID().withMessage('Invalid equipment ID format'),
    body('maintenanceType').isIn(['preventive', 'predictive', 'corrective', 'emergency']).withMessage('Invalid maintenance type'),
    body('scheduledDate').isISO8601().withMessage('Scheduled date must be valid'),
    body('priority').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
    body('estimatedDuration').isInt({ min: 1 }).withMessage('Duration must be positive'),
    body('requiredSkills').optional().isArray(),
    body('requiredParts').optional().isArray(),
    body('description').optional().isLength({ max: 1000 })
  ],
  manufacturingController.scheduleEquipmentMaintenance
);

/**
 * Health check endpoint for Manufacturing module
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Manufacturing module is healthy',
    timestamp: new Date(),
    requestId: req.requestId,
    features: {
      productionProcesses: 'active',
      productionLines: 'active',
      productionMonitoring: 'active',
      digitalTwins: 'active',
      aiOptimization: 'active',
      intelligentManufacturing: 'active',
      alerts: 'active',
      reports: 'active',
      equipmentManagement: 'active'
    },
    endpoints: {
      processes: 5,
      lines: 4,
      monitoring: 3,
      digitalTwins: 5,
      aiOptimization: 3,
      intelligentManufacturing: 3,
      alerts: 2,
      reports: 2,
      equipment: 2,
      total: 29
    }
  });
});

export default router;
