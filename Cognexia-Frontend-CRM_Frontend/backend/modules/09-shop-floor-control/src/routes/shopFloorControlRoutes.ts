import { Router } from 'express';
import { body, param, query } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../../../middleware/authMiddleware';
import { validateRequest } from '../../../middleware/validateRequest';
import { ShopFloorControlController } from '../controllers/ShopFloorControlController';
import { logger } from '../../../utils/logger';

const router = Router();
const controller = new ShopFloorControlController();

// Rate limiting configurations
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const emergencyRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit emergency stops to 5 per minute
  message: 'Too many emergency stop requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const trainingRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit training requests to 10 per hour
  message: 'Too many training requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware logging
const logEndpointAccess = (endpointName: string) => (req: any, res: any, next: any) => {
  logger.info(`Shop Floor Control endpoint accessed: ${endpointName}`, {
    requestId: req.requestId,
    userId: req.user?.id,
    ip: req.ip
  });
  next();
};

/**
 * Main Dashboard & System Health Routes
 */

// Get comprehensive shop floor dashboard
router.get('/dashboard',
  generalRateLimit,
  authMiddleware,
  logEndpointAccess('Dashboard'),
  controller.getDashboard
);

// Get system health status
router.get('/system/health',
  generalRateLimit,
  authMiddleware,
  logEndpointAccess('System Health'),
  controller.getSystemHealth
);

// Emergency stop all operations
router.post('/emergency-stop',
  emergencyRateLimit,
  authMiddleware,
  [
    body('reason').optional().isString().withMessage('Reason must be a string')
  ],
  validateRequest,
  logEndpointAccess('Emergency Stop'),
  controller.emergencyStop
);

/**
 * Robotics Management Routes
 */

// Register a new robot
router.post('/robots',
  generalRateLimit,
  authMiddleware,
  [
    body('id').isString().notEmpty().withMessage('Robot ID is required'),
    body('model').isString().notEmpty().withMessage('Robot model is required'),
    body('type').isIn(['collaborative', 'industrial', 'mobile', 'pick-place', 'assembly'])
      .withMessage('Invalid robot type'),
    body('capabilities').isArray().notEmpty().withMessage('Robot capabilities must be an array'),
    body('safetyRating').isIn(['SIL1', 'SIL2', 'SIL3', 'PLa', 'PLb', 'PLc', 'PLd', 'PLe'])
      .withMessage('Invalid safety rating'),
    body('workspaceConfig.position').isObject().withMessage('Position configuration is required'),
    body('workspaceConfig.dimensions').isObject().withMessage('Dimensions configuration is required')
  ],
  validateRequest,
  logEndpointAccess('Register Robot'),
  controller.registerRobot
);

// Get robot status by ID
router.get('/robots/:robotId/status',
  generalRateLimit,
  authMiddleware,
  [
    param('robotId').isString().notEmpty().withMessage('Robot ID is required')
  ],
  validateRequest,
  logEndpointAccess('Get Robot Status'),
  controller.getRobotStatus
);

// Create collaborative task
router.post('/robots/tasks/collaborative',
  generalRateLimit,
  authMiddleware,
  [
    body('name').isString().notEmpty().withMessage('Task name is required'),
    body('description').isString().notEmpty().withMessage('Task description is required'),
    body('priority').isIn(['low', 'normal', 'high', 'critical']).withMessage('Invalid priority level'),
    body('requirements.minimumRobots').isInt({ min: 1 }).withMessage('Minimum robots must be at least 1'),
    body('requirements.humanSupervision').isBoolean().withMessage('Human supervision flag must be boolean'),
    body('steps').isArray().notEmpty().withMessage('Task steps are required')
  ],
  validateRequest,
  logEndpointAccess('Create Collaborative Task'),
  controller.createCollaborativeTask
);

/**
 * Safety System Routes
 */

// Register human operator
router.post('/safety/humans',
  generalRateLimit,
  authMiddleware,
  [
    body('id').isString().notEmpty().withMessage('Operator ID is required'),
    body('name').isString().notEmpty().withMessage('Operator name is required'),
    body('role').isIn(['operator', 'supervisor', 'technician', 'engineer', 'safety_officer'])
      .withMessage('Invalid operator role'),
    body('clearanceLevel').isIn(['basic', 'advanced', 'expert', 'administrator'])
      .withMessage('Invalid clearance level'),
    body('safetyTraining').isArray().notEmpty().withMessage('Safety training records required')
  ],
  validateRequest,
  logEndpointAccess('Register Human Operator'),
  controller.registerHuman
);

// Get safety dashboard
router.get('/safety/dashboard',
  generalRateLimit,
  authMiddleware,
  logEndpointAccess('Safety Dashboard'),
  controller.getSafetyDashboard
);

/**
 * Robot Coordination Routes
 */

// Create robot group for coordination
router.post('/coordination/groups',
  generalRateLimit,
  authMiddleware,
  [
    body('name').isString().notEmpty().withMessage('Group name is required'),
    body('description').isString().optional(),
    body('robots').isArray().notEmpty().withMessage('Robot list is required'),
    body('coordinationType').isIn(['centralized', 'distributed', 'hierarchical'])
      .withMessage('Invalid coordination type'),
    body('communicationProtocol').isIn(['mqtt', 'ros', 'opcua', 'ethernet_ip'])
      .withMessage('Invalid communication protocol')
  ],
  validateRequest,
  logEndpointAccess('Create Robot Group'),
  controller.createRobotGroup
);

// Get coordination analytics
router.get('/coordination/analytics',
  generalRateLimit,
  authMiddleware,
  logEndpointAccess('Coordination Analytics'),
  controller.getCoordinationAnalytics
);

/**
 * Task Execution Routes
 */

// Create execution task
router.post('/tasks',
  generalRateLimit,
  authMiddleware,
  [
    body('name').isString().notEmpty().withMessage('Task name is required'),
    body('description').isString().notEmpty().withMessage('Task description is required'),
    body('priority').isIn(['low', 'normal', 'high', 'critical']).withMessage('Invalid priority level'),
    body('assignedRobots').isArray().notEmpty().withMessage('Assigned robots are required'),
    body('expectedDuration').isInt({ min: 1 }).withMessage('Expected duration must be positive'),
    body('safetyRequirements').isArray().withMessage('Safety requirements must be an array')
  ],
  validateRequest,
  logEndpointAccess('Create Execution Task'),
  controller.createExecutionTask
);

// Execute task by ID
router.post('/tasks/:taskId/execute',
  generalRateLimit,
  authMiddleware,
  [
    param('taskId').isString().notEmpty().withMessage('Task ID is required')
  ],
  validateRequest,
  logEndpointAccess('Execute Task'),
  controller.executeTask
);

// Get task execution analytics
router.get('/tasks/analytics',
  generalRateLimit,
  authMiddleware,
  logEndpointAccess('Task Analytics'),
  controller.getTaskAnalytics
);

/**
 * Digital Twin Routes
 */

// Create digital twin
router.post('/digital-twins',
  generalRateLimit,
  authMiddleware,
  [
    body('name').isString().notEmpty().withMessage('Digital twin name is required'),
    body('description').isString().optional(),
    body('type').isIn(['robot', 'production_line', 'facility', 'process', 'product'])
      .withMessage('Invalid digital twin type'),
    body('physicalEntityId').isString().notEmpty().withMessage('Physical entity ID is required'),
    body('modelingLevel').isIn(['geometric', 'kinematic', 'dynamic', 'behavioral'])
      .withMessage('Invalid modeling level'),
    body('updateFrequency').isInt({ min: 1 }).withMessage('Update frequency must be positive')
  ],
  validateRequest,
  logEndpointAccess('Create Digital Twin'),
  controller.createDigitalTwin
);

// Run simulation on digital twin
router.post('/digital-twins/:twinId/simulate',
  generalRateLimit,
  authMiddleware,
  [
    param('twinId').isString().notEmpty().withMessage('Twin ID is required'),
    body('type').isIn(['performance', 'safety', 'optimization', 'stress_test', 'failure_analysis'])
      .withMessage('Invalid simulation type'),
    body('parameters').isObject().notEmpty().withMessage('Simulation parameters are required'),
    body('duration').isInt({ min: 1 }).withMessage('Simulation duration must be positive'),
    body('iterations').isInt({ min: 1 }).withMessage('Iteration count must be positive')
  ],
  validateRequest,
  logEndpointAccess('Run Simulation'),
  controller.runSimulation
);

// Get digital twin dashboard
router.get('/digital-twins/dashboard',
  generalRateLimit,
  authMiddleware,
  logEndpointAccess('Digital Twin Dashboard'),
  controller.getDigitalTwinDashboard
);

/**
 * AI Learning Routes
 */

// Create learning agent for a robot
router.post('/ai/agents',
  trainingRateLimit,
  authMiddleware,
  [
    body('robotId').isString().notEmpty().withMessage('Robot ID is required'),
    body('name').isString().notEmpty().withMessage('Agent name is required'),
    body('type').isIn(['reinforcement', 'deep_learning', 'genetic_algorithm', 'swarm_intelligence'])
      .withMessage('Invalid agent type'),
    body('capabilities').isArray().notEmpty().withMessage('Agent capabilities are required'),
    body('learningGoals').isObject().notEmpty().withMessage('Learning goals configuration is required'),
    body('safetyConstraints').isArray().withMessage('Safety constraints must be an array')
  ],
  validateRequest,
  logEndpointAccess('Create Learning Agent'),
  controller.createLearningAgent
);

// Train learning agent
router.post('/ai/agents/:agentId/train',
  trainingRateLimit,
  authMiddleware,
  [
    param('agentId').isString().notEmpty().withMessage('Agent ID is required'),
    body('trainingType').isIn(['simulation', 'real_world', 'mixed', 'transfer_learning'])
      .withMessage('Invalid training type'),
    body('dataset').isObject().notEmpty().withMessage('Training dataset is required'),
    body('hyperparameters').isObject().withMessage('Hyperparameters configuration required'),
    body('maxIterations').isInt({ min: 1 }).withMessage('Max iterations must be positive')
  ],
  validateRequest,
  logEndpointAccess('Train Agent'),
  controller.trainAgent
);

// Transfer knowledge between agents
router.post('/ai/knowledge-transfer',
  trainingRateLimit,
  authMiddleware,
  [
    body('sourceAgentId').isString().notEmpty().withMessage('Source agent ID is required'),
    body('targetAgentId').isString().notEmpty().withMessage('Target agent ID is required'),
    body('transferType').isIn(['model_weights', 'experience_replay', 'skill_distillation', 'meta_learning'])
      .withMessage('Invalid knowledge transfer type'),
    body('verificationRequired').isBoolean().withMessage('Verification requirement must be boolean')
  ],
  validateRequest,
  logEndpointAccess('Knowledge Transfer'),
  controller.transferKnowledge
);

// Get learning analytics
router.get('/ai/analytics',
  generalRateLimit,
  authMiddleware,
  logEndpointAccess('Learning Analytics'),
  controller.getLearningAnalytics
);

/**
 * Health check endpoint for Shop Floor Control module
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Shop Floor Control module is healthy',
    timestamp: new Date(),
    requestId: req.requestId,
    features: {
      collaborativeRobotics: 'active',
      humanRobotSafety: 'active',
      autonomousCoordination: 'active',
      taskExecution: 'active',
      digitalTwins: 'active',
      aiLearning: 'active'
    },
    endpoints: {
      dashboard: 3,
      robotics: 3,
      safety: 2,
      coordination: 2,
      tasks: 3,
      digitalTwins: 3,
      aiLearning: 4,
      total: 20
    }
  });
});

export { router as shopFloorControlRoutes };
