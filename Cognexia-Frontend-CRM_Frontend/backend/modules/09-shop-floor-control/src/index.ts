// Core Shop Floor Control Services
export { ShopFloorControlService } from './services/ShopFloorControlService';
export { HumanAICollaborationService } from './services/HumanAICollaborationService';
export { AdaptiveManufacturingService } from './services/AdaptiveManufacturingService';

// Advanced Industry 5.0 Robotics Services
export { CollaborativeRoboticsControlService } from './services/CollaborativeRoboticsControlService';
export { HumanRobotSafetySystemService } from './services/HumanRobotSafetySystemService';
export { AutonomousRobotCoordinationService } from './services/AutonomousRobotCoordinationService';
export { CollaborativeTaskExecutionService } from './services/CollaborativeTaskExecutionService';
export { DigitalTwinIntegrationService } from './services/DigitalTwinIntegrationService';
export { AIPoweredRobotLearningService } from './services/AIPoweredRobotLearningService';

// Shop Floor Control Types and Interfaces
export type {
  WorkstationConfig,
  WorkstationCapabilities,
  ProductionCapacity,
  DynamicCapacity,
  ProcessCapability,
  CollaborativeFeature,
  HumanRole,
  AIRole,
  OperatorAssignment,
  AICollaborationProfile,
  Equipment,
  EquipmentCapabilities,
  WorkOrder,
  WorkOrderRequirements,
  AIAssistance,
  RealTimeGuidance,
  QualityControl,
  AIQualityAnalysis,
  MaintenanceSchedule,
  PredictiveTrigger,
  AdaptiveManufacturing,
  AIDecisionEngine,
  SafetySystem,
  CollaborativeSafety
} from './services/ShopFloorControlService';

export {
  WorkstationType,
  ProcessType,
  ComplexityLevel,
  PrecisionLevel,
  QualityLevel,
  HumanRequirementLevel,
  AISupportLevel,
  AutomationLevel,
  CollaborationType,
  AIType,
  IntelligenceLevel,
  WorkOrderStatus,
  GuidanceType,
  InspectionType,
  MaintenanceType,
  TriggerType,
  AdaptationType,
  DecisionEngineType,
  SafetyLevel,
  Priority,
  WorkstationStatus,
  SkillLevel
} from './services/ShopFloorControlService';

// Human-AI Collaboration Types
export type {
  CollaborationSession,
  InteractionEvent,
  InteractionContent,
  InteractionContext,
  TaskContext,
  OperatorState,
  SkillProficiency,
  AttentionMetrics,
  EmotionalState,
  PhysicalState,
  CognitiveLoadMetrics,
  CollaborationMetrics,
  TrustMetrics,
  AdaptiveBehavior,
  LearningOutcome,
  CollaborationPattern,
  HumanRoleDefinition,
  AIRoleDefinition,
  InteractionProtocol,
  EscalationProcedure,
  FeedbackMechanism
} from './services/HumanAICollaborationService';

export {
  CollaborationSessionType,
  SessionStatus,
  CollaborationMode,
  InteractionEventType,
  InteractionSource,
  ContentType,
  UrgencyLevel,
  TaskPhase,
  CriticalityLevel,
  WorkloadLevel,
  StressLevel,
  FatigueLevel,
  MoodState,
  AdaptiveBehaviorType,
  LearningOutcomeType,
  CollaborationPatternType,
  CommunicationMode,
  FeedbackType,
  FeedbackFrequency,
  FeedbackFormat,
  CollaborationPreference,
  AdaptationSpeed,
  TrustTrend
} from './services/HumanAICollaborationService';

// Adaptive Manufacturing Types
export type {
  AdaptiveProcess,
  ProcessParameter,
  ParameterRange,
  CriticalLimit,
  ParameterDependency,
  ProcessObjective,
  MeasurementMethod,
  AdaptationStrategy,
  AdaptationTrigger,
  TriggerCondition,
  OptimizationAlgorithm,
  OptimizationObjective,
  OptimizationConstraint,
  LearningApproach,
  ProcessLearningModel,
  KnowledgeBase,
  KnowledgeItem,
  ExperienceBuffer,
  Experience,
  ProcessContext,
  ProcessAction,
  ProcessOutcome,
  AdaptiveManufacturingMetrics
} from './services/AdaptiveManufacturingService';

export {
  AdaptiveProcessType,
  LimitType,
  ControlMethod,
  DependencyType,
  ObjectiveType,
  ObjectivePriority,
  MeasurementFrequency,
  StrategyType,
  TriggerType as AdaptiveTriggerType,
  ComparisonOperator,
  TriggerPriority,
  AutomationLevel as AdaptiveAutomationLevel,
  AlgorithmType,
  OptimizationType,
  ConstraintType,
  LearningType,
  KnowledgeType,
  RelationshipType,
  RelationshipDirection,
  ActionType,
  TrendDirection,
  SustainabilityType,
  ProcessStatus
} from './services/AdaptiveManufacturingService';

// Shop Floor Control Factory and Utilities
export class ShopFloorControlFactory {
  /**
   * Creates a complete shop floor control system with all services
   */
  static async createShopFloorControlSystem(config: ShopFloorSystemConfig): Promise<ShopFloorControlSystem> {
    const shopFloorControl = new ShopFloorControlService();
    const humanAICollaboration = new HumanAICollaborationService();
    const adaptiveManufacturing = new AdaptiveManufacturingService();

    const system = new ShopFloorControlSystem(
      shopFloorControl,
      humanAICollaboration,
      adaptiveManufacturing
    );

    await system.initialize(config);
    return system;
  }

  /**
   * Creates a workstation configuration template
   */
  static createWorkstationConfig(
    id: string,
    name: string,
    type: WorkstationType,
    options: Partial<WorkstationConfig> = {}
  ): WorkstationConfig {
    return {
      id,
      name,
      type,
      capabilities: {
        productionCapacity: {
          maxThroughput: 100,
          avgCycleTime: 60,
          setupTime: 300,
          changoverTime: 600,
          efficiency: 0.85,
          utilization: 0.75,
          oee: 0.64,
          dynamicCapacity: {
            baseCapacity: 100,
            currentCapacity: 85,
            predictedCapacity: 90,
            capacityFactors: [],
            adaptiveAdjustments: []
          }
        },
        processCapabilities: [],
        qualityCapabilities: [],
        flexibilityIndex: 0.8,
        automationLevel: AutomationLevel.SEMI_AUTOMATED,
        collaborativeFeatures: [],
        adaptabilityScore: 0.7,
        learningCapabilities: []
      },
      location: {
        floor: 'Ground Floor',
        zone: 'Production Area A',
        coordinates: { x: 0, y: 0, z: 0 }
      },
      operatorAssignment: {
        operatorId: '',
        operatorName: '',
        skillLevel: SkillLevel.INTERMEDIATE,
        certifications: [],
        shiftSchedule: { shiftId: '', startTime: '08:00', endTime: '16:00' },
        performance: { efficiency: 0.8, quality: 0.9, safety: 0.95 },
        preferences: { preferredTasks: [], avoidedTasks: [] },
        aiCollaboration: {
          collaborationPreference: CollaborationPreference.BALANCED,
          trustLevel: 0.7,
          adaptationSpeed: AdaptationSpeed.MODERATE,
          feedbackStyle: FeedbackStyle.MULTIMODAL,
          autonomyComfortLevel: 0.6,
          preferredInteractionModes: []
        },
        continuousLearning: { learningPlan: [], progressTracking: {} }
      },
      equipment: [],
      qualityStandards: [],
      safetyRequirements: [],
      digitalTwin: { enabled: true, updateFrequency: 1000, syncMode: 'real-time' },
      aiAssistants: [],
      status: WorkstationStatus.IDLE,
      metrics: { oee: 0.64, quality: 0.9, performance: 0.8, availability: 0.9 },
      ...options
    };
  }

  /**
   * Creates a collaborative work order template
   */
  static createCollaborativeWorkOrder(
    productionOrderId: string,
    workstationId: string,
    operatorId: string,
    options: Partial<WorkOrder> = {}
  ): Partial<WorkOrder> {
    return {
      productionOrderId,
      workstationId,
      operatorId,
      priority: Priority.MEDIUM,
      complexity: ComplexityLevel.MEDIUM,
      status: WorkOrderStatus.QUEUED,
      requirements: {
        skillRequirements: [],
        toolRequirements: [],
        materialRequirements: [],
        qualityRequirements: [],
        safetyRequirements: [],
        environmentalRequirements: []
      },
      qualityTargets: [],
      instructions: [],
      ...options
    };
  }

  /**
   * Creates an adaptive process configuration
   */
  static createAdaptiveProcessConfig(
    processName: string,
    workstationId: string,
    processType: AdaptiveProcessType,
    options: Partial<AdaptiveProcess> = {}
  ): Partial<AdaptiveProcess> {
    return {
      processName,
      workstationId,
      processType,
      currentParameters: [],
      targetObjectives: [
        {
          objectiveId: 'productivity-001',
          objectiveName: 'Maximize Productivity',
          objectiveType: ObjectiveType.PRODUCTIVITY,
          targetValue: 100,
          currentValue: 85,
          priority: ObjectivePriority.HIGH,
          weight: 0.4,
          measurementMethod: {
            methodId: 'throughput-measurement',
            methodType: 'automated',
            frequency: MeasurementFrequency.REAL_TIME,
            accuracy: 0.95,
            calibration: {
              lastCalibrated: new Date(),
              calibrationInterval: 86400000,
              calibrationMethod: 'automated',
              accuracy: 0.95,
              drift: 0.01
            }
          },
          tolerance: 5,
          improvementRate: 0.02
        },
        {
          objectiveId: 'quality-001',
          objectiveName: 'Maintain Quality',
          objectiveType: ObjectiveType.QUALITY,
          targetValue: 99.5,
          currentValue: 98.8,
          priority: ObjectivePriority.CRITICAL,
          weight: 0.6,
          measurementMethod: {
            methodId: 'quality-measurement',
            methodType: 'vision-based',
            frequency: MeasurementFrequency.CONTINUOUS,
            accuracy: 0.98,
            calibration: {
              lastCalibrated: new Date(),
              calibrationInterval: 43200000,
              calibrationMethod: 'manual',
              accuracy: 0.98,
              drift: 0.005
            }
          },
          tolerance: 1,
          improvementRate: 0.01
        }
      ],
      constraints: [],
      ...options
    };
  }
}

// Unified Shop Floor Control System
export class ShopFloorControlSystem {
  private shopFloorControl: ShopFloorControlService;
  private humanAICollaboration: HumanAICollaborationService;
  private adaptiveManufacturing: AdaptiveManufacturingService;
  private systemStatus: SystemStatus = SystemStatus.STOPPED;

  constructor(
    shopFloorControl: ShopFloorControlService,
    humanAICollaboration: HumanAICollaborationService,
    adaptiveManufacturing: AdaptiveManufacturingService
  ) {
    this.shopFloorControl = shopFloorControl;
    this.humanAICollaboration = humanAICollaboration;
    this.adaptiveManufacturing = adaptiveManufacturing;
  }

  public async initialize(config: ShopFloorSystemConfig): Promise<void> {
    try {
      this.systemStatus = SystemStatus.INITIALIZING;

      // Initialize workstations
      for (const workstationConfig of config.workstations) {
        await this.shopFloorControl.registerWorkstation(workstationConfig);
      }

      // Initialize adaptive processes
      for (const processConfig of config.adaptiveProcesses || []) {
        await this.adaptiveManufacturing.registerAdaptiveProcess(processConfig);
      }

      // Set up cross-service integrations
      this.setupIntegrations();

      this.systemStatus = SystemStatus.RUNNING;

    } catch (error) {
      this.systemStatus = SystemStatus.ERROR;
      throw error;
    }
  }

  public async startCollaborativeWorkOrder(
    workstationId: string,
    operatorId: string,
    workOrderData: Partial<WorkOrder>
  ): Promise<{ workOrder: WorkOrder; collaborationSession: CollaborationSession }> {
    // Create work order with AI assistance
    const workOrder = await this.shopFloorControl.createWorkOrder(workOrderData);
    
    // Start collaboration session
    const collaborationSession = await this.humanAICollaboration.startCollaborationSession(
      workstationId,
      operatorId,
      'ai-assistant-001',
      CollaborationSessionType.TASK_EXECUTION
    );

    // Start work order execution
    await this.shopFloorControl.startWorkOrder(workOrder.workOrderId);

    return { workOrder, collaborationSession };
  }

  public async getSystemDashboard(): Promise<ShopFloorDashboard> {
    const shopFloorStatus = await this.shopFloorControl.getShopFloorStatus();
    const collaborationAnalytics = await this.humanAICollaboration.getCollaborationAnalytics();
    const adaptiveMetrics = await this.adaptiveManufacturing.getAdaptiveManufacturingMetrics();

    return {
      systemStatus: this.systemStatus,
      shopFloorStatus,
      collaborationAnalytics,
      adaptiveMetrics,
      timestamp: new Date()
    };
  }

  private setupIntegrations(): void {
    // Set up event forwarding between services
    this.shopFloorControl.on('work_order_started', (workOrder) => {
      // Trigger adaptive manufacturing optimization
      if (workOrder.workstationId) {
        this.adaptiveManufacturing.optimizeProcess(
          `process-${workOrder.workstationId}`,
          workOrder.qualityTargets.map(qt => ({
            objectiveId: qt.targetId,
            objectiveName: qt.standard.standardName,
            objectiveType: ObjectiveType.QUALITY,
            targetValue: qt.target,
            currentValue: 0,
            priority: ObjectivePriority.HIGH,
            weight: 1,
            measurementMethod: {
              methodId: 'integrated-measurement',
              methodType: 'automated',
              frequency: MeasurementFrequency.REAL_TIME,
              accuracy: 0.95,
              calibration: {
                lastCalibrated: new Date(),
                calibrationInterval: 86400000,
                calibrationMethod: 'automated',
                accuracy: 0.95,
                drift: 0.01
              }
            },
            tolerance: 5,
            improvementRate: 0.01
          }))
        );
      }
    });

    // Set up collaboration-adaptive manufacturing integration
    this.humanAICollaboration.on('session_ended', (session) => {
      // Update adaptive learning with collaboration outcomes
      if (session.learningOutcomes.length > 0) {
        const experiences = session.learningOutcomes.map(outcome => ({
          experienceId: `exp-${Date.now()}`,
          timestamp: new Date(),
          context: {
            parameters: [],
            environment: [],
            workload: {
              demandLevel: 0.8,
              urgency: 0.6,
              complexity: 0.7,
              variability: 0.5
            },
            resources: [],
            constraints: []
          },
          action: {
            actionId: `action-${Date.now()}`,
            actionType: ActionType.WORKFLOW_ADAPTATION,
            parameterChanges: [],
            strategyChanges: [],
            configurationChanges: [],
            timing: {
              plannedTime: session.startTime,
              executionTime: session.startTime,
              completionTime: session.endTime || new Date(),
              duration: session.endTime ? session.endTime.getTime() - session.startTime.getTime() : 0
            }
          },
          outcome: {
            outcomeId: `outcome-${Date.now()}`,
            objectiveResults: [],
            performanceMetrics: [],
            qualityIndicators: [],
            sideEffects: [],
            sustainability: []
          },
          reward: session.performanceMetrics.effectiveness,
          quality: {
            completeness: 1.0,
            accuracy: session.performanceMetrics.efficiency,
            relevance: 0.9
          }
        }));

        this.adaptiveManufacturing.updateProcessLearning(
          `process-${session.workstationId}`,
          experiences
        );
      }
    });
  }

  public getShopFloorControl(): ShopFloorControlService {
    return this.shopFloorControl;
  }

  public getHumanAICollaboration(): HumanAICollaborationService {
    return this.humanAICollaboration;
  }

  public getAdaptiveManufacturing(): AdaptiveManufacturingService {
    return this.adaptiveManufacturing;
  }
}

// Configuration interfaces
export interface ShopFloorSystemConfig {
  workstations: WorkstationConfig[];
  adaptiveProcesses?: Partial<AdaptiveProcess>[];
  globalSettings?: {
    enableAI: boolean;
    enableLearning: boolean;
    enableCollaboration: boolean;
    safetyLevel: SafetyLevel;
    qualityStandards: string[];
  };
}

export interface ShopFloorDashboard {
  systemStatus: SystemStatus;
  shopFloorStatus: any;
  collaborationAnalytics: any;
  adaptiveMetrics: AdaptiveManufacturingMetrics;
  timestamp: Date;
}

export enum SystemStatus {
  STOPPED = 'stopped',
  INITIALIZING = 'initializing',
  RUNNING = 'running',
  ERROR = 'error',
  MAINTENANCE = 'maintenance'
}

// Import required types from services
import { WorkstationType, AutomationLevel, Priority, ComplexityLevel, WorkOrderStatus, WorkstationStatus, SkillLevel } from './services/ShopFloorControlService';
import { CollaborationPreference, AdaptationSpeed, FeedbackStyle, CollaborationSessionType } from './services/HumanAICollaborationService';
import { AdaptiveProcessType, ObjectiveType, ObjectivePriority, MeasurementFrequency, ActionType } from './services/AdaptiveManufacturingService';

// Export utility functions
export const ShopFloorUtils = {
  /**
   * Calculate Overall Equipment Effectiveness (OEE)
   */
  calculateOEE: (availability: number, performance: number, quality: number): number => {
    return availability * performance * quality;
  },

  /**
   * Assess operator workload level
   */
  assessWorkload: (
    taskComplexity: number,
    timeConstraints: number,
    resourceAvailability: number
  ): WorkloadLevel => {
    const workloadScore = (taskComplexity + timeConstraints) / resourceAvailability;
    
    if (workloadScore < 0.3) return WorkloadLevel.UNDERUTILIZED;
    if (workloadScore < 0.7) return WorkloadLevel.OPTIMAL;
    if (workloadScore < 1.0) return WorkloadLevel.BUSY;
    if (workloadScore < 1.5) return WorkloadLevel.OVERLOADED;
    return WorkloadLevel.CRITICAL;
  },

  /**
   * Determine optimal collaboration mode
   */
  determineCollaborationMode: (
    operatorSkillLevel: SkillLevel,
    taskComplexity: ComplexityLevel,
    aiCapabilities: number
  ): CollaborationMode => {
    const skillScore = { beginner: 0.2, intermediate: 0.5, advanced: 0.8, expert: 1.0 }[operatorSkillLevel];
    const complexityScore = { low: 0.2, medium: 0.5, high: 0.8, ultra_high: 1.0 }[taskComplexity];
    
    const humanCapability = skillScore;
    const taskDemand = complexityScore;
    const aiSupport = aiCapabilities;
    
    if (taskDemand > humanCapability && aiSupport > 0.8) {
      return CollaborationMode.AI_ASSIST;
    } else if (humanCapability > taskDemand && aiSupport < 0.5) {
      return CollaborationMode.HUMAN_LEAD;
    } else {
      return CollaborationMode.BALANCED;
    }
  }
};

// Controllers
export * from './controllers';

// Routes
export * from './routes';

// Version information
export const SHOP_FLOOR_CONTROL_VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();

// Default export
export default {
  ShopFloorControlService,
  HumanAICollaborationService,
  AdaptiveManufacturingService,
  ShopFloorControlFactory,
  ShopFloorControlSystem,
  ShopFloorUtils,
  SHOP_FLOOR_CONTROL_VERSION,
  BUILD_DATE
};
