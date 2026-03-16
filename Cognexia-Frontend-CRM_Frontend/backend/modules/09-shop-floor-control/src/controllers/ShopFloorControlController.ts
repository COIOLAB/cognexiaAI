import { Request, Response } from 'express';
import { BaseController } from '../../../core/controllers/BaseController';
import { ShopFloorControlServiceFactory } from '../index';
import { 
  CollaborativeRoboticsControlService,
  HumanRobotSafetySystemService,
  AutonomousRobotCoordinationService,
  CollaborativeTaskExecutionService,
  DigitalTwinIntegrationService,
  AIPoweredRobotLearningService
} from '../services';

/**
 * Shop Floor Control Controller
 * Handles all shop floor operations including robotics, safety, digital twins, and AI learning
 */
export class ShopFloorControlController extends BaseController {
  private serviceFactory: ShopFloorControlServiceFactory;
  private roboticsService: CollaborativeRoboticsControlService;
  private safetyService: HumanRobotSafetySystemService;
  private coordinationService: AutonomousRobotCoordinationService;
  private taskExecutionService: CollaborativeTaskExecutionService;
  private digitalTwinService: DigitalTwinIntegrationService;
  private aiLearningService: AIPoweredRobotLearningService;

  constructor() {
    super();
    this.serviceFactory = ShopFloorControlServiceFactory.getInstance();
    this.initializeServices();
  }

  private async initializeServices(): Promise<void> {
    await this.serviceFactory.initializeServices();
    this.roboticsService = this.serviceFactory.getCollaborativeRoboticsService();
    this.safetyService = this.serviceFactory.getSafetySystemService();
    this.coordinationService = this.serviceFactory.getCoordinationService();
    this.taskExecutionService = this.serviceFactory.getTaskExecutionService();
    this.digitalTwinService = this.serviceFactory.getDigitalTwinService();
    this.aiLearningService = this.serviceFactory.getAILearningService();
  }

  /**
   * Get comprehensive shop floor dashboard
   */
  public getDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      this.logger.info('Fetching shop floor control dashboard', { requestId: req.requestId });

      const dashboard = await this.serviceFactory.getDashboard();

      res.status(200).json({
        success: true,
        message: 'Shop floor dashboard retrieved successfully',
        data: dashboard,
        requestId: req.requestId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to get shop floor dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve shop floor dashboard',
        error: error.message,
        requestId: req.requestId,
        timestamp: new Date()
      });
    }
  };

  // === ROBOTICS MANAGEMENT ===

  /**
   * Register a new robot
   */
  public registerRobot = async (req: Request, res: Response): Promise<void> => {
    try {
      const robotConfig = req.body;
      
      this.logger.info('Registering new robot', { 
        robotId: robotConfig.id,
        model: robotConfig.model,
        requestId: req.requestId 
      });

      await this.roboticsService.registerRobot(robotConfig);

      res.status(201).json({
        success: true,
        message: 'Robot registered successfully',
        data: { robotId: robotConfig.id },
        requestId: req.requestId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to register robot:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register robot',
        error: error.message,
        requestId: req.requestId,
        timestamp: new Date()
      });
    }
  };

  /**
   * Get robot status
   */
  public getRobotStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { robotId } = req.params;
      
      const status = await this.roboticsService.getRobotStatus(robotId);

      if (!status) {
        res.status(404).json({
          success: false,
          message: 'Robot not found',
          requestId: req.requestId,
          timestamp: new Date()
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Robot status retrieved successfully',
        data: status,
        requestId: req.requestId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to get robot status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve robot status',
        error: error.message,
        requestId: req.requestId,
        timestamp: new Date()
      });
    }
  };

  /**
   * Create collaborative task
   */
  public createCollaborativeTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const taskData = req.body;
      
      this.logger.info('Creating collaborative task', { 
        taskName: taskData.name,
        robotsRequired: taskData.requirements?.minimumRobots,
        requestId: req.requestId 
      });

      const taskId = await this.roboticsService.createTask(taskData);

      res.status(201).json({
        success: true,
        message: 'Collaborative task created successfully',
        data: { taskId },
        requestId: req.requestId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to create collaborative task:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create collaborative task',
        error: error.message,
        requestId: req.requestId,
        timestamp: new Date()
      });
    }
  };

  // === SAFETY SYSTEM ===

  /**
   * Register human operator
   */
  public registerHuman = async (req: Request, res: Response): Promise<void> => {
    try {
      const humanData = req.body;
      
      this.logger.info('Registering human operator', { 
        operatorId: humanData.id,
        name: humanData.name,
        requestId: req.requestId 
      });

      await this.safetyService.registerHuman(humanData);

      res.status(201).json({
        success: true,
        message: 'Human operator registered successfully',
        data: { operatorId: humanData.id },
        requestId: req.requestId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to register human operator:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register human operator',
        error: error.message,
        requestId: req.requestId,
        timestamp: new Date()
      });
    }
  };

  /**
   * Get safety dashboard
   */
  public getSafetyDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const dashboard = await this.safetyService.getDashboard();

      res.status(200).json({
        success: true,
        message: 'Safety dashboard retrieved successfully',
        data: dashboard,
        requestId: req.requestId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to get safety dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve safety dashboard',
        error: error.message,
        requestId: req.requestId,
        timestamp: new Date()
      });
    }
  };

  // === ROBOT COORDINATION ===

  /**
   * Create robot group
   */
  public createRobotGroup = async (req: Request, res: Response): Promise<void> => {
    try {
      const groupConfig = req.body;
      
      this.logger.info('Creating robot group', { 
        groupName: groupConfig.name,
        robotCount: groupConfig.robots?.length,
        requestId: req.requestId 
      });

      const groupId = await this.coordinationService.createGroup(groupConfig);

      res.status(201).json({
        success: true,
        message: 'Robot group created successfully',
        data: { groupId },
        requestId: req.requestId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to create robot group:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create robot group',
        error: error.message,
        requestId: req.requestId,
        timestamp: new Date()
      });
    }
  };

  /**
   * Get coordination analytics
   */
  public getCoordinationAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const analytics = await this.coordinationService.getDashboard();

      res.status(200).json({
        success: true,
        message: 'Coordination analytics retrieved successfully',
        data: analytics,
        requestId: req.requestId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to get coordination analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve coordination analytics',
        error: error.message,
        requestId: req.requestId,
        timestamp: new Date()
      });
    }
  };

  // === TASK EXECUTION ===

  /**
   * Create execution task
   */
  public createExecutionTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const taskRequest = req.body;
      
      this.logger.info('Creating execution task', { 
        taskName: taskRequest.name,
        priority: taskRequest.priority,
        requestId: req.requestId 
      });

      const taskId = await this.taskExecutionService.createTask(taskRequest);

      res.status(201).json({
        success: true,
        message: 'Execution task created successfully',
        data: { taskId },
        requestId: req.requestId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to create execution task:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create execution task',
        error: error.message,
        requestId: req.requestId,
        timestamp: new Date()
      });
    }
  };

  /**
   * Execute task
   */
  public executeTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { taskId } = req.params;
      
      this.logger.info('Executing task', { taskId, requestId: req.requestId });

      await this.taskExecutionService.executeTask(taskId);

      res.status(200).json({
        success: true,
        message: 'Task execution initiated successfully',
        data: { taskId },
        requestId: req.requestId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to execute task:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to execute task',
        error: error.message,
        requestId: req.requestId,
        timestamp: new Date()
      });
    }
  };

  /**
   * Get task execution analytics
   */
  public getTaskAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const analytics = await this.taskExecutionService.getAnalyticsDashboard();

      res.status(200).json({
        success: true,
        message: 'Task execution analytics retrieved successfully',
        data: analytics,
        requestId: req.requestId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to get task analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve task analytics',
        error: error.message,
        requestId: req.requestId,
        timestamp: new Date()
      });
    }
  };

  // === DIGITAL TWINS ===

  /**
   * Create digital twin
   */
  public createDigitalTwin = async (req: Request, res: Response): Promise<void> => {
    try {
      const twinConfig = req.body;
      
      this.logger.info('Creating digital twin', { 
        name: twinConfig.name,
        type: twinConfig.type,
        physicalEntityId: twinConfig.physicalEntityId,
        requestId: req.requestId 
      });

      const twinId = await this.digitalTwinService.createDigitalTwin(twinConfig);

      res.status(201).json({
        success: true,
        message: 'Digital twin created successfully',
        data: { twinId },
        requestId: req.requestId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to create digital twin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create digital twin',
        error: error.message,
        requestId: req.requestId,
        timestamp: new Date()
      });
    }
  };

  /**
   * Run simulation
   */
  public runSimulation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { twinId } = req.params;
      const scenario = req.body;
      
      this.logger.info('Running simulation', { 
        twinId,
        scenarioType: scenario.type,
        requestId: req.requestId 
      });

      const result = await this.digitalTwinService.runSimulation(twinId, scenario);

      res.status(200).json({
        success: true,
        message: 'Simulation completed successfully',
        data: result,
        requestId: req.requestId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to run simulation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to run simulation',
        error: error.message,
        requestId: req.requestId,
        timestamp: new Date()
      });
    }
  };

  /**
   * Get digital twin dashboard
   */
  public getDigitalTwinDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const dashboard = await this.digitalTwinService.getDashboard();

      res.status(200).json({
        success: true,
        message: 'Digital twin dashboard retrieved successfully',
        data: dashboard,
        requestId: req.requestId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to get digital twin dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve digital twin dashboard',
        error: error.message,
        requestId: req.requestId,
        timestamp: new Date()
      });
    }
  };

  // === AI LEARNING ===

  /**
   * Create learning agent
   */
  public createLearningAgent = async (req: Request, res: Response): Promise<void> => {
    try {
      const agentConfig = req.body;
      
      this.logger.info('Creating learning agent', { 
        robotId: agentConfig.robotId,
        name: agentConfig.name,
        type: agentConfig.type,
        requestId: req.requestId 
      });

      const agentId = await this.aiLearningService.createLearningAgent(agentConfig);

      res.status(201).json({
        success: true,
        message: 'Learning agent created successfully',
        data: { agentId },
        requestId: req.requestId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to create learning agent:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create learning agent',
        error: error.message,
        requestId: req.requestId,
        timestamp: new Date()
      });
    }
  };

  /**
   * Train agent
   */
  public trainAgent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { agentId } = req.params;
      const trainingData = req.body;
      
      this.logger.info('Training agent', { 
        agentId,
        trainingType: trainingData.type,
        requestId: req.requestId 
      });

      const result = await this.aiLearningService.trainAgent(agentId, trainingData);

      res.status(200).json({
        success: true,
        message: 'Agent training completed successfully',
        data: result,
        requestId: req.requestId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to train agent:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to train agent',
        error: error.message,
        requestId: req.requestId,
        timestamp: new Date()
      });
    }
  };

  /**
   * Get learning analytics
   */
  public getLearningAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const analytics = await this.aiLearningService.getLearningAnalytics();

      res.status(200).json({
        success: true,
        message: 'Learning analytics retrieved successfully',
        data: analytics,
        requestId: req.requestId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to get learning analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve learning analytics',
        error: error.message,
        requestId: req.requestId,
        timestamp: new Date()
      });
    }
  };

  /**
   * Transfer knowledge between agents
   */
  public transferKnowledge = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sourceAgentId, targetAgentId, knowledgeType } = req.body;
      
      this.logger.info('Transferring knowledge', { 
        sourceAgentId,
        targetAgentId,
        knowledgeType,
        requestId: req.requestId 
      });

      const result = await this.aiLearningService.transferKnowledge(
        sourceAgentId,
        targetAgentId,
        knowledgeType
      );

      res.status(200).json({
        success: true,
        message: 'Knowledge transfer completed successfully',
        data: result,
        requestId: req.requestId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to transfer knowledge:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to transfer knowledge',
        error: error.message,
        requestId: req.requestId,
        timestamp: new Date()
      });
    }
  };

  /**
   * Emergency stop all operations
   */
  public emergencyStop = async (req: Request, res: Response): Promise<void> => {
    try {
      const { reason } = req.body;
      
      this.logger.warn('Emergency stop initiated', { reason, requestId: req.requestId });

      // Stop all active operations
      await Promise.all([
        this.safetyService.emergencyStop(reason || 'Manual emergency stop'),
        this.roboticsService.emergencyStop(),
        this.taskExecutionService.emergencyStop()
      ]);

      res.status(200).json({
        success: true,
        message: 'Emergency stop executed successfully',
        data: { 
          reason,
          timestamp: new Date(),
          affectedSystems: ['safety', 'robotics', 'task-execution']
        },
        requestId: req.requestId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to execute emergency stop:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to execute emergency stop',
        error: error.message,
        requestId: req.requestId,
        timestamp: new Date()
      });
    }
  };

  /**
   * Get system health status
   */
  public getSystemHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const systemHealth = await this.serviceFactory.getSystemHealth();

      res.status(200).json({
        success: true,
        message: 'System health retrieved successfully',
        data: systemHealth,
        requestId: req.requestId,
        timestamp: new Date()
      });

    } catch (error) {
      this.logger.error('Failed to get system health:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve system health',
        error: error.message,
        requestId: req.requestId,
        timestamp: new Date()
      });
    }
  };
}
