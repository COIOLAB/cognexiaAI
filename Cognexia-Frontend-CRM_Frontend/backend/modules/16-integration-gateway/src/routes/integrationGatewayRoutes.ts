import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../../../middleware/auth';
import { authorize } from '../../../middleware/authorize';
import { rateLimiter } from '../../../middleware/rateLimiter';
import integrationGatewayController from '../controllers/IntegrationGatewayController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Apply rate limiting
router.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for integration operations
  message: 'Too many integration requests from this IP, please try again later.'
}));

// Integration System Management Routes
router.post(
  '/systems',
  authorize(['integration_manager', 'system_admin', 'it_manager']),
  [
    body('systemName').notEmpty().withMessage('System name is required'),
    body('systemType').isIn(['erp', 'mes', 'plc', 'scada', 'database', 'api', 'file_system', 'iot_platform']).withMessage('Invalid system type'),
    body('protocol').isIn(['http', 'https', 'modbus', 'mqtt', 'opcua', 'soap', 'rest', 'tcp', 'udp']).withMessage('Invalid protocol'),
    body('connectionConfig').isObject().withMessage('Connection configuration is required'),
    body('connectionConfig.host').notEmpty().withMessage('Host is required'),
    body('connectionConfig.port').optional().isInt({ min: 1, max: 65535 }),
    body('connectionConfig.username').optional().isString(),
    body('connectionConfig.password').optional().isString(),
    body('connectionConfig.database').optional().isString(),
    body('connectionConfig.timeout').optional().isInt({ min: 1000 }),
    body('securityConfig').optional().isObject(),
    body('dataFormat').optional().isIn(['json', 'xml', 'csv', 'binary', 'text']),
    body('retryConfig').optional().isObject(),
    body('tags').optional().isArray(),
    body('description').optional().isString()
  ],
  integrationGatewayController.registerIntegrationSystem
);

router.get(
  '/systems',
  authorize(['integration_manager', 'system_admin', 'it_manager', 'operator']),
  [
    query('status').optional().isIn(['active', 'inactive', 'error', 'connecting']),
    query('type').optional().isIn(['erp', 'mes', 'plc', 'scada', 'database', 'api', 'file_system', 'iot_platform']),
    query('protocol').optional().isIn(['http', 'https', 'modbus', 'mqtt', 'opcua', 'soap', 'rest', 'tcp', 'udp']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  integrationGatewayController.getIntegrationSystems
);

router.get(
  '/systems/:systemId',
  authorize(['integration_manager', 'system_admin', 'it_manager', 'operator']),
  [
    param('systemId').isUUID().withMessage('Invalid system ID format')
  ],
  integrationGatewayController.getIntegrationSystemById
);

router.put(
  '/systems/:systemId',
  authorize(['integration_manager', 'system_admin']),
  [
    param('systemId').isUUID().withMessage('Invalid system ID format'),
    body('systemName').optional().notEmpty().withMessage('System name cannot be empty'),
    body('systemType').optional().isIn(['erp', 'mes', 'plc', 'scada', 'database', 'api', 'file_system', 'iot_platform']),
    body('protocol').optional().isIn(['http', 'https', 'modbus', 'mqtt', 'opcua', 'soap', 'rest', 'tcp', 'udp']),
    body('connectionConfig').optional().isObject(),
    body('securityConfig').optional().isObject(),
    body('dataFormat').optional().isIn(['json', 'xml', 'csv', 'binary', 'text']),
    body('retryConfig').optional().isObject(),
    body('tags').optional().isArray(),
    body('description').optional().isString()
  ],
  integrationGatewayController.updateIntegrationSystem
);

router.delete(
  '/systems/:systemId',
  authorize(['integration_manager', 'system_admin']),
  [
    param('systemId').isUUID().withMessage('Invalid system ID format')
  ],
  integrationGatewayController.deleteIntegrationSystem
);

// Connection Management Routes
router.post(
  '/systems/:systemId/test-connection',
  authorize(['integration_manager', 'system_admin', 'it_manager']),
  [
    param('systemId').isUUID().withMessage('Invalid system ID format')
  ],
  integrationGatewayController.testConnection
);

router.post(
  '/systems/:systemId/connect',
  authorize(['integration_manager', 'system_admin', 'operator']),
  [
    param('systemId').isUUID().withMessage('Invalid system ID format')
  ],
  integrationGatewayController.establishConnection
);

router.post(
  '/systems/:systemId/disconnect',
  authorize(['integration_manager', 'system_admin', 'operator']),
  [
    param('systemId').isUUID().withMessage('Invalid system ID format')
  ],
  integrationGatewayController.closeConnection
);

router.get(
  '/systems/:systemId/status',
  authorize(['integration_manager', 'system_admin', 'it_manager', 'operator']),
  [
    param('systemId').isUUID().withMessage('Invalid system ID format')
  ],
  integrationGatewayController.getConnectionStatus
);

// Data Exchange Management Routes
router.post(
  '/systems/:systemId/send',
  authorize(['integration_manager', 'system_admin', 'data_manager']),
  [
    param('systemId').isUUID().withMessage('Invalid system ID format'),
    body('data').notEmpty().withMessage('Data is required'),
    body('options').optional().isObject(),
    body('options.priority').optional().isIn(['low', 'normal', 'high']),
    body('options.timeout').optional().isInt({ min: 1000 }),
    body('options.retry').optional().isBoolean(),
    body('options.format').optional().isIn(['json', 'xml', 'csv', 'binary', 'text'])
  ],
  integrationGatewayController.sendData
);

router.get(
  '/systems/:systemId/receive',
  authorize(['integration_manager', 'system_admin', 'data_manager', 'operator']),
  [
    param('systemId').isUUID().withMessage('Invalid system ID format'),
    query('filters').optional().isString()
  ],
  integrationGatewayController.receiveData
);

router.post(
  '/systems/:systemId/sync',
  authorize(['integration_manager', 'system_admin', 'data_manager']),
  [
    param('systemId').isUUID().withMessage('Invalid system ID format'),
    body('syncType').isIn(['full', 'incremental', 'delta']).withMessage('Invalid sync type'),
    body('direction').isIn(['push', 'pull', 'bidirectional']).withMessage('Invalid sync direction'),
    body('scheduleOptions').optional().isObject(),
    body('filters').optional().isObject(),
    body('transformationRules').optional().isArray()
  ],
  integrationGatewayController.synchronizeData
);

// Protocol-Specific Operation Routes
router.post(
  '/systems/:systemId/modbus/execute',
  authorize(['integration_manager', 'system_admin', 'plc_operator']),
  [
    param('systemId').isUUID().withMessage('Invalid system ID format'),
    body('operation').isIn(['read_coils', 'read_discrete_inputs', 'read_holding_registers', 'read_input_registers', 'write_single_coil', 'write_single_register', 'write_multiple_coils', 'write_multiple_registers']).withMessage('Invalid Modbus operation'),
    body('parameters').isObject().withMessage('Parameters are required'),
    body('parameters.address').isInt({ min: 0 }).withMessage('Address must be non-negative'),
    body('parameters.quantity').optional().isInt({ min: 1 }),
    body('parameters.value').optional(),
    body('parameters.unitId').optional().isInt({ min: 0, max: 255 })
  ],
  integrationGatewayController.executeModbusOperation
);

router.post(
  '/systems/:systemId/mqtt/execute',
  authorize(['integration_manager', 'system_admin', 'iot_operator']),
  [
    param('systemId').isUUID().withMessage('Invalid system ID format'),
    body('operation').isIn(['publish', 'subscribe', 'unsubscribe']).withMessage('Invalid MQTT operation'),
    body('parameters').isObject().withMessage('Parameters are required'),
    body('parameters.topic').notEmpty().withMessage('Topic is required'),
    body('parameters.message').optional(),
    body('parameters.qos').optional().isIn([0, 1, 2]),
    body('parameters.retain').optional().isBoolean()
  ],
  integrationGatewayController.executeMQTTOperation
);

router.post(
  '/systems/:systemId/opcua/execute',
  authorize(['integration_manager', 'system_admin', 'scada_operator']),
  [
    param('systemId').isUUID().withMessage('Invalid system ID format'),
    body('operation').isIn(['read', 'write', 'browse', 'subscribe', 'call_method']).withMessage('Invalid OPC UA operation'),
    body('parameters').isObject().withMessage('Parameters are required'),
    body('parameters.nodeId').optional().isString(),
    body('parameters.value').optional(),
    body('parameters.dataType').optional().isString(),
    body('parameters.methodId').optional().isString(),
    body('parameters.inputArguments').optional().isArray()
  ],
  integrationGatewayController.executeOPCUAOperation
);

// Integration Mapping Management Routes
router.post(
  '/mappings',
  authorize(['integration_manager', 'system_admin', 'data_manager']),
  [
    body('mappingName').notEmpty().withMessage('Mapping name is required'),
    body('sourceSystem').isUUID().withMessage('Invalid source system ID'),
    body('targetSystem').isUUID().withMessage('Invalid target system ID'),
    body('mappingRules').isArray().withMessage('Mapping rules are required'),
    body('mappingRules.*.sourceField').notEmpty().withMessage('Source field is required'),
    body('mappingRules.*.targetField').notEmpty().withMessage('Target field is required'),
    body('mappingRules.*.transformation').optional().isString(),
    body('mappingRules.*.validation').optional().isObject(),
    body('triggerConditions').optional().isArray(),
    body('scheduleConfig').optional().isObject(),
    body('errorHandling').optional().isObject()
  ],
  integrationGatewayController.createDataMapping
);

router.get(
  '/mappings',
  authorize(['integration_manager', 'system_admin', 'data_manager', 'operator']),
  [
    query('systemId').optional().isUUID(),
    query('sourceSystem').optional().isUUID(),
    query('targetSystem').optional().isUUID(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  integrationGatewayController.getDataMappings
);

router.put(
  '/mappings/:mappingId',
  authorize(['integration_manager', 'system_admin', 'data_manager']),
  [
    param('mappingId').isUUID().withMessage('Invalid mapping ID format'),
    body('mappingName').optional().notEmpty().withMessage('Mapping name cannot be empty'),
    body('mappingRules').optional().isArray(),
    body('mappingRules.*.sourceField').optional().notEmpty(),
    body('mappingRules.*.targetField').optional().notEmpty(),
    body('mappingRules.*.transformation').optional().isString(),
    body('triggerConditions').optional().isArray(),
    body('scheduleConfig').optional().isObject(),
    body('errorHandling').optional().isObject()
  ],
  integrationGatewayController.updateDataMapping
);

router.delete(
  '/mappings/:mappingId',
  authorize(['integration_manager', 'system_admin']),
  [
    param('mappingId').isUUID().withMessage('Invalid mapping ID format')
  ],
  integrationGatewayController.deleteDataMapping
);

// Integration Monitoring and Analytics Routes
router.get(
  '/dashboard',
  authorize(['integration_manager', 'system_admin', 'it_manager']),
  [
    query('timeframe').optional().isIn(['1h', '4h', '8h', '24h', '7d', '30d'])
  ],
  integrationGatewayController.getIntegrationDashboard
);

router.get(
  '/metrics',
  authorize(['integration_manager', 'system_admin', 'it_manager', 'analytics_manager']),
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('systemId').optional().isUUID(),
    query('metricType').optional().isIn(['throughput', 'latency', 'errors', 'availability', 'data_volume'])
  ],
  integrationGatewayController.getIntegrationMetrics
);

router.get(
  '/logs',
  authorize(['integration_manager', 'system_admin', 'it_manager']),
  [
    query('systemId').optional().isUUID(),
    query('level').optional().isIn(['debug', 'info', 'warn', 'error']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 1000 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  integrationGatewayController.getIntegrationLogs
);

// Integration Health and Status Routes
router.get(
  '/health',
  authorize(['integration_manager', 'system_admin', 'it_manager', 'operator']),
  integrationGatewayController.getIntegrationHealth
);

router.post(
  '/systems/:systemId/health-check',
  authorize(['integration_manager', 'system_admin', 'it_manager']),
  [
    param('systemId').isUUID().withMessage('Invalid system ID format')
  ],
  integrationGatewayController.performHealthCheck
);

// Integration Configuration Management Routes
router.get(
  '/systems/:systemId/config',
  authorize(['integration_manager', 'system_admin', 'it_manager']),
  [
    param('systemId').isUUID().withMessage('Invalid system ID format')
  ],
  integrationGatewayController.getIntegrationConfig
);

router.put(
  '/systems/:systemId/config',
  authorize(['integration_manager', 'system_admin']),
  [
    param('systemId').isUUID().withMessage('Invalid system ID format'),
    body('configuration').isObject().withMessage('Configuration is required'),
    body('configuration.connectionPool').optional().isObject(),
    body('configuration.caching').optional().isObject(),
    body('configuration.logging').optional().isObject(),
    body('configuration.security').optional().isObject(),
    body('configuration.performance').optional().isObject()
  ],
  integrationGatewayController.updateIntegrationConfig
);

// Data Transformation and Processing Routes
router.post(
  '/transform',
  authorize(['integration_manager', 'system_admin', 'data_manager']),
  [
    body('data').notEmpty().withMessage('Data is required'),
    body('transformationRules').isArray().withMessage('Transformation rules are required'),
    body('transformationRules.*.type').isIn(['map', 'filter', 'aggregate', 'calculate', 'format', 'validate']).withMessage('Invalid transformation type'),
    body('transformationRules.*.source').optional().isString(),
    body('transformationRules.*.target').optional().isString(),
    body('transformationRules.*.expression').optional().isString(),
    body('transformationRules.*.parameters').optional().isObject(),
    body('outputFormat').optional().isIn(['json', 'xml', 'csv', 'text'])
  ],
  integrationGatewayController.transformData
);

router.post(
  '/validate',
  authorize(['integration_manager', 'system_admin', 'data_manager', 'quality_manager']),
  [
    body('data').notEmpty().withMessage('Data is required'),
    body('validationSchema').isObject().withMessage('Validation schema is required'),
    body('validationSchema.fields').isArray().withMessage('Fields validation is required'),
    body('validationSchema.fields.*.name').notEmpty().withMessage('Field name is required'),
    body('validationSchema.fields.*.type').isIn(['string', 'number', 'boolean', 'date', 'email', 'url']).withMessage('Invalid field type'),
    body('validationSchema.fields.*.required').optional().isBoolean(),
    body('validationSchema.fields.*.minLength').optional().isInt({ min: 0 }),
    body('validationSchema.fields.*.maxLength').optional().isInt({ min: 1 }),
    body('validationSchema.fields.*.pattern').optional().isString(),
    body('stopOnFirstError').optional().isBoolean()
  ],
  integrationGatewayController.validateData
);

// Integration Flow Management Routes
router.post(
  '/flows',
  authorize(['integration_manager', 'system_admin', 'workflow_manager']),
  [
    body('flowName').notEmpty().withMessage('Flow name is required'),
    body('description').optional().isString(),
    body('sourceSystem').isUUID().withMessage('Invalid source system ID'),
    body('targetSystem').isUUID().withMessage('Invalid target system ID'),
    body('steps').isArray().withMessage('Flow steps are required'),
    body('steps.*.stepType').isIn(['extract', 'transform', 'validate', 'load', 'notify']).withMessage('Invalid step type'),
    body('steps.*.stepOrder').isInt({ min: 1 }).withMessage('Step order must be positive'),
    body('steps.*.configuration').isObject().withMessage('Step configuration is required'),
    body('triggerConfig').isObject().withMessage('Trigger configuration is required'),
    body('triggerConfig.type').isIn(['schedule', 'event', 'manual']).withMessage('Invalid trigger type'),
    body('errorHandling').optional().isObject(),
    body('notifications').optional().isArray()
  ],
  integrationGatewayController.createIntegrationFlow
);

router.get(
  '/flows',
  authorize(['integration_manager', 'system_admin', 'workflow_manager', 'operator']),
  [
    query('status').optional().isIn(['active', 'inactive', 'error', 'paused']),
    query('sourceSystem').optional().isUUID(),
    query('targetSystem').optional().isUUID(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  integrationGatewayController.getIntegrationFlows
);

router.post(
  '/flows/:flowId/execute',
  authorize(['integration_manager', 'system_admin', 'workflow_manager', 'operator']),
  [
    param('flowId').isUUID().withMessage('Invalid flow ID format'),
    body('inputData').optional(),
    body('executeMode').optional().isIn(['sync', 'async']),
    body('overrideConfig').optional().isObject()
  ],
  integrationGatewayController.executeIntegrationFlow
);

/**
 * Health check endpoint for Integration Gateway module
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Integration Gateway module is healthy',
    timestamp: new Date(),
    requestId: req.requestId,
    features: {
      systemManagement: 'active',
      connectionManagement: 'active',
      protocolSupport: 'active',
      dataTransformation: 'active',
      integrationFlows: 'active',
      realTimeMonitoring: 'active',
      errorHandling: 'active'
    },
    supportedProtocols: {
      modbus: 'active',
      mqtt: 'active',
      opcua: 'active',
      rest_api: 'active',
      soap: 'active',
      websockets: 'active'
    },
    endpoints: {
      systems: 5,
      connections: 4,
      protocols: 6,
      transformations: 4,
      flows: 4,
      monitoring: 3,
      total: 26
    }
  });
});

export default router;
