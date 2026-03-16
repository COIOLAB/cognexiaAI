import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../../../middleware/auth';
import { authorize } from '../../../middleware/authorize';
import { rateLimiter } from '../../../middleware/rateLimiter';
import maintenanceController from '../controllers/MaintenanceController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Apply rate limiting
router.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
}));

// Asset Management Routes
router.post(
  '/assets',
  authorize(['maintenance_manager', 'asset_manager', 'facility_manager']),
  [
    body('assetName').notEmpty().withMessage('Asset name is required'),
    body('assetType').notEmpty().withMessage('Asset type is required'),
    body('serialNumber').optional().isString(),
    body('manufacturer').optional().isString(),
    body('model').optional().isString(),
    body('location').notEmpty().withMessage('Location is required'),
    body('location.facility').notEmpty().withMessage('Facility is required'),
    body('location.area').optional().isString(),
    body('location.coordinates').optional().isObject(),
    body('criticality').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid criticality level'),
    body('status').optional().isIn(['active', 'inactive', 'maintenance', 'retired']),
    body('specifications').optional().isObject(),
    body('purchaseDate').optional().isISO8601(),
    body('warrantyExpiry').optional().isISO8601(),
    body('maintenanceInterval').optional().isInt({ min: 1 })
  ],
  maintenanceController.createAsset
);

router.get(
  '/assets',
  authorize(['maintenance_manager', 'asset_manager', 'facility_manager', 'technician']),
  [
    query('status').optional().isIn(['active', 'inactive', 'maintenance', 'retired']),
    query('type').optional().isString(),
    query('location').optional().isString(),
    query('criticality').optional().isIn(['low', 'medium', 'high', 'critical']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  maintenanceController.getAssets
);

router.get(
  '/assets/:assetId',
  authorize(['maintenance_manager', 'asset_manager', 'facility_manager', 'technician']),
  [
    param('assetId').isUUID().withMessage('Invalid asset ID format')
  ],
  maintenanceController.getAssetById
);

router.put(
  '/assets/:assetId',
  authorize(['maintenance_manager', 'asset_manager', 'facility_manager']),
  [
    param('assetId').isUUID().withMessage('Invalid asset ID format'),
    body('assetName').optional().notEmpty().withMessage('Asset name cannot be empty'),
    body('assetType').optional().notEmpty().withMessage('Asset type cannot be empty'),
    body('serialNumber').optional().isString(),
    body('manufacturer').optional().isString(),
    body('model').optional().isString(),
    body('location').optional().isObject(),
    body('criticality').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('status').optional().isIn(['active', 'inactive', 'maintenance', 'retired']),
    body('specifications').optional().isObject(),
    body('maintenanceInterval').optional().isInt({ min: 1 })
  ],
  maintenanceController.updateAsset
);

router.delete(
  '/assets/:assetId',
  authorize(['maintenance_manager', 'asset_manager']),
  [
    param('assetId').isUUID().withMessage('Invalid asset ID format')
  ],
  maintenanceController.deleteAsset
);

// Work Order Management Routes
router.post(
  '/work-orders',
  authorize(['maintenance_manager', 'maintenance_supervisor', 'technician']),
  [
    body('title').notEmpty().withMessage('Work order title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('assetId').isUUID().withMessage('Invalid asset ID format'),
    body('priority').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
    body('type').isIn(['preventive', 'corrective', 'predictive', 'emergency']).withMessage('Invalid work order type'),
    body('scheduledDate').optional().isISO8601().withMessage('Invalid scheduled date'),
    body('estimatedHours').optional().isFloat({ min: 0 }),
    body('requiredSkills').optional().isArray(),
    body('requiredParts').optional().isArray(),
    body('safetyRequirements').optional().isArray(),
    body('instructions').optional().isString()
  ],
  maintenanceController.createWorkOrder
);

router.get(
  '/work-orders',
  authorize(['maintenance_manager', 'maintenance_supervisor', 'technician']),
  [
    query('status').optional().isIn(['open', 'assigned', 'in_progress', 'completed', 'cancelled']),
    query('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    query('type').optional().isIn(['preventive', 'corrective', 'predictive', 'emergency']),
    query('assignedTo').optional().isUUID(),
    query('assetId').optional().isUUID(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  maintenanceController.getWorkOrders
);

router.get(
  '/work-orders/:workOrderId',
  authorize(['maintenance_manager', 'maintenance_supervisor', 'technician']),
  [
    param('workOrderId').isUUID().withMessage('Invalid work order ID format')
  ],
  maintenanceController.getWorkOrderById
);

router.put(
  '/work-orders/:workOrderId',
  authorize(['maintenance_manager', 'maintenance_supervisor', 'technician']),
  [
    param('workOrderId').isUUID().withMessage('Invalid work order ID format'),
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('type').optional().isIn(['preventive', 'corrective', 'predictive', 'emergency']),
    body('status').optional().isIn(['open', 'assigned', 'in_progress', 'completed', 'cancelled']),
    body('scheduledDate').optional().isISO8601(),
    body('estimatedHours').optional().isFloat({ min: 0 }),
    body('actualHours').optional().isFloat({ min: 0 }),
    body('completionNotes').optional().isString()
  ],
  maintenanceController.updateWorkOrder
);

router.put(
  '/work-orders/:workOrderId/assign',
  authorize(['maintenance_manager', 'maintenance_supervisor']),
  [
    param('workOrderId').isUUID().withMessage('Invalid work order ID format'),
    body('technicianId').isUUID().withMessage('Invalid technician ID format'),
    body('assignedBy').isUUID().withMessage('Invalid user ID format'),
    body('notes').optional().isLength({ max: 500 })
  ],
  maintenanceController.assignWorkOrder
);

router.put(
  '/work-orders/:workOrderId/complete',
  authorize(['maintenance_manager', 'maintenance_supervisor', 'technician']),
  [
    param('workOrderId').isUUID().withMessage('Invalid work order ID format'),
    body('completionData').isObject().withMessage('Completion data is required'),
    body('completionData.actualHours').isFloat({ min: 0 }).withMessage('Actual hours must be positive'),
    body('completionData.completionNotes').notEmpty().withMessage('Completion notes are required'),
    body('completionData.partsUsed').optional().isArray(),
    body('completionData.followUpRequired').optional().isBoolean(),
    body('completionData.assetCondition').optional().isIn(['excellent', 'good', 'fair', 'poor'])
  ],
  maintenanceController.completeWorkOrder
);

// Predictive Maintenance Routes
router.post(
  '/predictive/analysis',
  authorize(['maintenance_manager', 'predictive_analyst', 'data_scientist']),
  [
    body('assetId').isUUID().withMessage('Invalid asset ID format'),
    body('analysisType').isIn(['failure_prediction', 'condition_assessment', 'optimization', 'trend_analysis']).withMessage('Invalid analysis type'),
    body('timeHorizon').isInt({ min: 1, max: 365 }).withMessage('Time horizon must be between 1 and 365 days'),
    body('includeRecommendations').optional().isBoolean(),
    body('confidenceLevel').optional().isFloat({ min: 0, max: 1 })
  ],
  maintenanceController.generatePredictiveAnalysis
);

router.get(
  '/predictive/recommendations',
  authorize(['maintenance_manager', 'predictive_analyst', 'maintenance_supervisor']),
  [
    query('assetId').optional().isUUID(),
    query('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  maintenanceController.getPredictiveRecommendations
);

router.get(
  '/predictive/failure-predictions',
  authorize(['maintenance_manager', 'predictive_analyst', 'maintenance_supervisor']),
  [
    query('assetIds').optional().isString(),
    query('riskThreshold').optional().isFloat({ min: 0, max: 1 }),
    query('timeframe').optional().isIn(['7d', '30d', '90d', '180d', '365d'])
  ],
  maintenanceController.getFailurePredictions
);

// Smart Maintenance (AI/IoT Integration) Routes
router.post(
  '/smart/enable',
  authorize(['maintenance_manager', 'iot_specialist', 'ai_specialist']),
  [
    body('assetId').isUUID().withMessage('Invalid asset ID format'),
    body('configData').isObject().withMessage('Configuration data is required'),
    body('configData.sensors').isArray().withMessage('Sensors configuration is required'),
    body('configData.aiModels').optional().isArray(),
    body('configData.alertThresholds').optional().isObject(),
    body('configData.dataCollectionInterval').optional().isInt({ min: 1 }),
    body('configData.enablePredictive').optional().isBoolean()
  ],
  maintenanceController.enableSmartMaintenance
);

router.get(
  '/smart/status/:assetId',
  authorize(['maintenance_manager', 'iot_specialist', 'maintenance_supervisor', 'technician']),
  [
    param('assetId').isUUID().withMessage('Invalid asset ID format')
  ],
  maintenanceController.getSmartMaintenanceStatus
);

router.get(
  '/smart/sensor-data',
  authorize(['maintenance_manager', 'iot_specialist', 'predictive_analyst']),
  [
    query('assetId').isUUID().withMessage('Invalid asset ID format'),
    query('sensorType').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('aggregation').optional().isIn(['minute', 'hour', 'day', 'week'])
  ],
  maintenanceController.getIoTSensorData
);

// Maintenance Scheduling Routes
router.post(
  '/schedules',
  authorize(['maintenance_manager', 'maintenance_supervisor']),
  [
    body('scheduleName').notEmpty().withMessage('Schedule name is required'),
    body('assetId').isUUID().withMessage('Invalid asset ID format'),
    body('scheduleType').isIn(['time_based', 'usage_based', 'condition_based']).withMessage('Invalid schedule type'),
    body('frequency').isObject().withMessage('Frequency configuration is required'),
    body('frequency.interval').isInt({ min: 1 }).withMessage('Interval must be positive'),
    body('frequency.unit').isIn(['hours', 'days', 'weeks', 'months']).withMessage('Invalid frequency unit'),
    body('maintenanceTasks').isArray().withMessage('Maintenance tasks are required'),
    body('estimatedDuration').optional().isInt({ min: 1 }),
    body('requiredSkills').optional().isArray(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical'])
  ],
  maintenanceController.createMaintenanceSchedule
);

router.get(
  '/schedules',
  authorize(['maintenance_manager', 'maintenance_supervisor', 'technician']),
  [
    query('assetId').optional().isUUID(),
    query('scheduleType').optional().isIn(['time_based', 'usage_based', 'condition_based']),
    query('status').optional().isIn(['active', 'inactive', 'completed']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  maintenanceController.getMaintenanceSchedules
);

router.post(
  '/schedules/optimize',
  authorize(['maintenance_manager', 'maintenance_supervisor']),
  [
    body('timeHorizon').isInt({ min: 7, max: 365 }).withMessage('Time horizon must be between 7 and 365 days'),
    body('objectives').isArray().withMessage('Optimization objectives are required'),
    body('constraints').isArray().withMessage('Constraints are required'),
    body('assetIds').optional().isArray(),
    body('optimizationLevel').optional().isIn(['basic', 'standard', 'advanced'])
  ],
  maintenanceController.optimizeMaintenanceSchedule
);

// Maintenance Analytics and Reports Routes
router.get(
  '/dashboard',
  authorize(['maintenance_manager', 'maintenance_supervisor', 'facility_manager']),
  [
    query('timeframe').optional().isIn(['7d', '30d', '90d', '180d', '365d'])
  ],
  maintenanceController.getMaintenanceDashboard
);

router.get(
  '/metrics',
  authorize(['maintenance_manager', 'maintenance_supervisor', 'facility_manager']),
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('assetId').optional().isUUID(),
    query('metricType').optional().isIn(['mtbf', 'mttr', 'availability', 'cost', 'efficiency'])
  ],
  maintenanceController.getMaintenanceMetrics
);

router.post(
  '/reports/generate',
  authorize(['maintenance_manager', 'maintenance_supervisor', 'facility_manager']),
  [
    body('reportType').isIn(['asset_performance', 'maintenance_costs', 'technician_productivity', 'predictive_insights', 'custom']).withMessage('Invalid report type'),
    body('dateRange').isObject().withMessage('Date range is required'),
    body('dateRange.startDate').isISO8601().withMessage('Start date must be valid'),
    body('dateRange.endDate').isISO8601().withMessage('End date must be valid'),
    body('filters').optional().isObject(),
    body('format').optional().isIn(['pdf', 'excel', 'csv', 'json']),
    body('includeCharts').optional().isBoolean(),
    body('recipients').optional().isArray()
  ],
  maintenanceController.generateMaintenanceReport
);

// Spare Parts and Inventory Routes
router.get(
  '/spare-parts',
  authorize(['maintenance_manager', 'inventory_manager', 'technician']),
  [
    query('partNumber').optional().isString(),
    query('category').optional().isString(),
    query('location').optional().isString(),
    query('status').optional().isIn(['available', 'low_stock', 'out_of_stock', 'discontinued']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  maintenanceController.getSparePartsInventory
);

router.post(
  '/spare-parts/request',
  authorize(['maintenance_manager', 'maintenance_supervisor', 'technician']),
  [
    body('workOrderId').optional().isUUID(),
    body('requestedBy').isUUID().withMessage('Invalid user ID format'),
    body('parts').isArray().withMessage('Parts list is required'),
    body('parts.*.partNumber').notEmpty().withMessage('Part number is required'),
    body('parts.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be positive'),
    body('parts.*.urgency').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('justification').notEmpty().withMessage('Justification is required'),
    body('deliveryDate').optional().isISO8601()
  ],
  maintenanceController.requestSpareParts
);

// Technician Management Routes
router.get(
  '/technicians',
  authorize(['maintenance_manager', 'maintenance_supervisor', 'hr_manager']),
  [
    query('skillSet').optional().isString(),
    query('availability').optional().isIn(['available', 'busy', 'unavailable']),
    query('location').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  maintenanceController.getTechnicians
);

router.get(
  '/technicians/:technicianId/workload',
  authorize(['maintenance_manager', 'maintenance_supervisor']),
  [
    param('technicianId').isUUID().withMessage('Invalid technician ID format'),
    query('timeframe').optional().isIn(['7d', '30d', '90d'])
  ],
  maintenanceController.getTechnicianWorkload
);

/**
 * Health check endpoint for Maintenance module
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Maintenance module is healthy',
    timestamp: new Date(),
    requestId: req.requestId,
    features: {
      assetManagement: 'active',
      workOrderManagement: 'active',
      predictiveMaintenance: 'active',
      smartMaintenance: 'active',
      maintenanceScheduling: 'active',
      analyticsReports: 'active',
      sparePartsManagement: 'active',
      technicianManagement: 'active'
    },
    endpoints: {
      assets: 5,
      workOrders: 7,
      predictiveMaintenance: 3,
      smartMaintenance: 3,
      scheduling: 3,
      analytics: 3,
      spareParts: 2,
      technicians: 2,
      total: 28
    }
  });
});

export default router;
