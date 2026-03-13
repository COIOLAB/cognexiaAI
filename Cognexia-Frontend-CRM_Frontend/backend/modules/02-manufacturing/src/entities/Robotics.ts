import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { WorkCenter } from './WorkCenter';
import { AIInsight } from './AIInsight';

export enum RobotType {
  INDUSTRIAL = 'industrial',
  COLLABORATIVE = 'collaborative',
  MOBILE = 'mobile',
  HUMANOID = 'humanoid',
  ARTICULATED = 'articulated',
  SCARA = 'scara',
  DELTA = 'delta',
  CARTESIAN = 'cartesian',
  SPECIALIZED = 'specialized',
}

export enum RobotStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
  CALIBRATING = 'calibrating',
  LEARNING = 'learning',
  EMERGENCY_STOP = 'emergency_stop',
  OFFLINE = 'offline',
}

export enum SafetyLevel {
  NONE = 'none',
  BASIC = 'basic',
  STANDARD = 'standard',
  ADVANCED = 'advanced',
  COLLABORATIVE = 'collaborative',
  AUTONOMOUS = 'autonomous',
}

export enum AutonomyLevel {
  MANUAL = 'manual',
  ASSISTED = 'assisted',
  SEMI_AUTONOMOUS = 'semi_autonomous',
  FULLY_AUTONOMOUS = 'fully_autonomous',
  SUPERINTELLIGENT = 'superintelligent',
}

@Entity('robotics')
@Index(['robotCode'], { unique: true })
@Index(['robotType'])
@Index(['status'])
@Index(['safetyLevel'])
@Index(['autonomyLevel'])
@Index(['workCenterId'])
export class Robotics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  robotCode: string;

  @Column({ length: 255 })
  robotName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: RobotType,
    default: RobotType.INDUSTRIAL,
  })
  robotType: RobotType;

  @Column({
    type: 'enum',
    enum: RobotStatus,
    default: RobotStatus.OFFLINE,
  })
  status: RobotStatus;

  @Column({
    type: 'enum',
    enum: SafetyLevel,
    default: SafetyLevel.STANDARD,
  })
  safetyLevel: SafetyLevel;

  @Column({
    type: 'enum',
    enum: AutonomyLevel,
    default: AutonomyLevel.SEMI_AUTONOMOUS,
  })
  autonomyLevel: AutonomyLevel;

  // Hardware Specifications
  @Column({ length: 100, nullable: true })
  manufacturer: string;

  @Column({ length: 100, nullable: true })
  model: string;

  @Column({ length: 100, nullable: true })
  serialNumber: string;

  @Column({ length: 50, nullable: true })
  firmwareVersion: string;

  @Column({ type: 'date', nullable: true })
  installationDate: Date;

  @Column({ type: 'date', nullable: true })
  warrantyExpiry: Date;

  // Physical Specifications
  @Column({ type: 'jsonb', nullable: true })
  physicalSpecs: {
    degreesOfFreedom: number;
    payload: number; // kg
    reach: number; // mm
    repeatability: number; // mm
    speed: number; // m/s
    acceleration: number; // m/s²
    weight: number; // kg
    dimensions: object; // length, width, height
    workingEnvelope: object;
  };

  // Kinematic Configuration
  @Column({ type: 'jsonb', nullable: true })
  kinematics: {
    configuration: string; // 6-axis, SCARA, etc.
    jointTypes: string[];
    jointLimits: object[];
    workspace: object;
    singularities: object[];
    calibration: object;
    forwardKinematics: object;
    inverseKinematics: object;
  };

  // Control System
  @Column({ type: 'jsonb', nullable: true })
  controlSystem: {
    controller: string;
    processingPower: string;
    memory: string;
    storage: string;
    operatingSystem: string;
    realTimeCapability: boolean;
    cycleTime: number; // ms
    interpolationRate: number; // Hz
  };

  // Sensor Integration
  @Column({ type: 'jsonb', nullable: true })
  sensors: {
    vision: object[];
    force: object[];
    torque: object[];
    position: object[];
    proximity: object[];
    temperature: object[];
    vibration: object[];
    audio: object[];
    tactile: object[];
    lidar: object[];
  };

  // End Effector Configuration
  @Column({ type: 'jsonb', nullable: true })
  endEffector: {
    type: string; // gripper, welding torch, tool changer, etc.
    specifications: object;
    toolChanging: boolean;
    tools: object[];
    adaptiveGripping: boolean;
    forceControl: boolean;
    compliance: object;
  };

  // AI and Machine Learning
  @Column({ type: 'jsonb', nullable: true })
  aiCapabilities: {
    visionSystem: boolean;
    pathPlanning: boolean;
    obstacleAvoidance: boolean;
    adaptiveLearning: boolean;
    reinforcementLearning: boolean;
    neuralNetworks: string[];
    computerVision: object;
    naturalLanguageProcessing: boolean;
    decisionMaking: object;
    predictiveAnalytics: boolean;
  };

  // Collaborative Features
  @Column({ type: 'jsonb', nullable: true })
  collaborativeFeatures: {
    humanDetection: boolean;
    safetyZones: object[];
    speedReduction: boolean;
    forceLimit: number; // N
    powerLimit: number; // W
    emergencyStop: boolean;
    handGuiding: boolean;
    voiceInteraction: boolean;
    gestureRecognition: boolean;
    augmentedReality: boolean;
  };

  // Safety Systems
  @Column({ type: 'jsonb', nullable: true })
  safetySystems: {
    emergencyStop: boolean;
    lightCurtains: boolean;
    safetyMats: boolean;
    laserScanners: boolean;
    cameraMonitoring: boolean;
    forceMonitoring: boolean;
    speedMonitoring: boolean;
    workspaceMonitoring: boolean;
    riskAssessment: object;
    safetyRating: string;
  };

  // Programming and Interfaces
  @Column({ type: 'jsonb', nullable: true })
  programming: {
    languages: string[];
    interfaces: string[];
    teachingMethods: string[];
    simulationTools: string[];
    offlineProgramming: boolean;
    onlineProgramming: boolean;
    parametricProgramming: boolean;
    visualProgramming: boolean;
    voiceProgramming: boolean;
  };

  // Communication and Connectivity
  @Column({ type: 'jsonb', nullable: true })
  connectivity: {
    ethernet: boolean;
    wifi: boolean;
    bluetooth: boolean;
    usb: boolean;
    rs232: boolean;
    canBus: boolean;
    profinet: boolean;
    ethercat: boolean;
    modbus: boolean;
    opcua: boolean;
    mqtt: boolean;
    protocols: string[];
  };

  // Performance Metrics
  @Column({ type: 'jsonb', nullable: true })
  performanceMetrics: {
    uptime: number; // percentage
    efficiency: number; // percentage
    throughput: number; // cycles per hour
    accuracy: number; // mm
    cycleTime: number; // seconds
    errorRate: number; // percentage
    availability: number; // percentage
    oee: number; // Overall Equipment Effectiveness
    mtbf: number; // Mean Time Between Failures (hours)
    mttr: number; // Mean Time To Repair (hours)
  };

  // Maintenance and Health
  @Column({ type: 'timestamp', nullable: true })
  lastMaintenance: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextMaintenanceDue: Date;

  @Column({ type: 'int', default: 90 })
  maintenanceIntervalDays: number;

  @Column({ type: 'jsonb', nullable: true })
  healthMonitoring: {
    vibrationLevel: number;
    temperature: number;
    powerConsumption: number;
    jointWear: object[];
    lubricationLevel: number;
    batteryLevel: number;
    diagnostics: object[];
    predictiveHealth: object;
  };

  // Current Task and Status
  @Column({ type: 'jsonb', nullable: true })
  currentTask: {
    taskId: string;
    taskName: string;
    startTime: Date;
    estimatedCompletion: Date;
    progress: number; // percentage
    operation: string;
    target: object;
    parameters: object;
    priority: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  taskQueue: {
    pending: object[];
    scheduled: object[];
    completed: object[];
    failed: object[];
    maxQueueSize: number;
    priorityLevels: string[];
  };

  // Learning and Adaptation
  @Column({ type: 'jsonb', nullable: true })
  learningCapabilities: {
    machineVision: boolean;
    adaptiveControl: boolean;
    skillLearning: boolean;
    environmentMapping: boolean;
    humanTeaching: boolean;
    imitationLearning: boolean;
    transferLearning: boolean;
    continuousLearning: boolean;
    experienceReplay: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  knowledgeBase: {
    skills: object[];
    procedures: object[];
    experiences: object[];
    patterns: object[];
    rules: object[];
    models: object[];
    updates: object[];
    version: string;
  };

  // Advanced Features
  @Column({ type: 'boolean', default: false })
  quantumProcessing: boolean;

  @Column({ type: 'jsonb', nullable: true })
  quantumFeatures: {
    quantumSensors: boolean;
    quantumComputing: boolean;
    quantumCommunication: boolean;
    quantumEncryption: boolean;
    entanglement: boolean;
    superposition: boolean;
    algorithms: string[];
  };

  @Column({ type: 'boolean', default: false })
  blockchainIntegration: boolean;

  @Column({ type: 'jsonb', nullable: true })
  blockchainFeatures: {
    taskVerification: boolean;
    qualityProvenance: boolean;
    maintenanceRecords: boolean;
    performanceMetrics: boolean;
    smartContracts: boolean;
    tokenization: boolean;
    consensus: string;
  };

  // Edge and Cloud Computing
  @Column({ type: 'jsonb', nullable: true })
  edgeComputing: {
    localProcessing: boolean;
    edgeAI: boolean;
    realTimeAnalytics: boolean;
    autonomousDecisions: boolean;
    offlineCapability: boolean;
    dataFiltering: boolean;
    latencyOptimization: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  cloudIntegration: {
    cloudAI: boolean;
    remoteMonitoring: boolean;
    softwareUpdates: boolean;
    dataBackup: boolean;
    collaboration: boolean;
    fleetManagement: boolean;
    analytics: boolean;
  };

  // Environmental Considerations
  @Column({ type: 'jsonb', nullable: true })
  environmental: {
    energyEfficiency: number; // percentage
    powerConsumption: number; // kW
    carbonFootprint: number; // kg CO2
    noiseLevel: number; // dB
    heatGeneration: number; // W
    sustainabilityRating: string;
    recyclingInfo: object;
  };

  // Cost and ROI
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  acquisitionCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  operatingCostPerHour: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  maintenanceCostPerYear: number;

  @Column({ type: 'jsonb', nullable: true })
  roiMetrics: {
    paybackPeriod: number; // months
    laborSavings: number; // per year
    productivityGain: number; // percentage
    qualityImprovement: number; // percentage
    costReduction: number; // per year
    roi: number; // percentage
  };

  // Integration and Interoperability
  @Column({ type: 'jsonb', nullable: true })
  integration: {
    erp: boolean;
    mes: boolean;
    scada: boolean;
    plc: boolean;
    hmi: boolean;
    databases: string[];
    apis: string[];
    standards: string[];
    protocols: string[];
  };

  // Location and Workspace
  @Column({ length: 100, nullable: true })
  location: string;

  @Column({ type: 'decimal', precision: 8, scale: 5, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 8, scale: 5, nullable: true })
  longitude: number;

  @Column({ type: 'jsonb', nullable: true })
  workspace: {
    boundaries: object;
    obstacles: object[];
    safeZones: object[];
    restrictedAreas: object[];
    calibrationPoints: object[];
    referenceFrames: object[];
  };

  // Relationships
  @Column({ type: 'varchar' })
  workCenterId: string;

  @ManyToOne(() => WorkCenter)
  @JoinColumn({ name: 'workCenterId' })
  workCenter: WorkCenter;

  @OneToMany(() => AIInsight, (insight) => insight.workCenter)
  aiInsights: AIInsight[];

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100, nullable: true })
  createdBy: string;

  @Column({ length: 100, nullable: true })
  updatedBy: string;

  @Column({ length: 100, nullable: true })
  lastOperatedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  lastOperatedAt: Date;

  // Methods
  isOperational(): boolean {
    return this.status === RobotStatus.RUNNING || 
           this.status === RobotStatus.IDLE;
  }

  isCollaborative(): boolean {
    return this.robotType === RobotType.COLLABORATIVE ||
           this.safetyLevel === SafetyLevel.COLLABORATIVE;
  }

  getOverallHealthScore(): number {
    if (!this.healthMonitoring) return 50;

    const health = this.healthMonitoring;
    let score = 100;

    // Deduct points for various health issues
    if (health.vibrationLevel > 10) score -= 20;
    if (health.temperature > 70) score -= 15;
    if (health.powerConsumption > 1000) score -= 10;
    if (health.lubricationLevel < 30) score -= 25;
    if (health.batteryLevel < 20) score -= 30;

    return Math.max(0, score);
  }

  calculateEfficiency(): number {
    if (!this.performanceMetrics) return 0;
    
    const metrics = this.performanceMetrics;
    const availability = metrics.availability || 0;
    const performance = (metrics.throughput || 0) / 100; // Normalize
    const quality = (100 - (metrics.errorRate || 0)) / 100;

    return availability * performance * quality;
  }

  needsMaintenance(): boolean {
    if (!this.nextMaintenanceDue) return false;
    return new Date() > this.nextMaintenanceDue;
  }

  isTaskActive(): boolean {
    return !!this.currentTask && 
           this.currentTask.progress < 100 &&
           this.status === RobotStatus.RUNNING;
  }

  assignTask(task: object, userId?: string): boolean {
    if (this.status !== RobotStatus.IDLE && this.status !== RobotStatus.RUNNING) {
      return false;
    }

    this.currentTask = {
      taskId: (task as any).id || 'auto-generated',
      taskName: (task as any).name || 'Unnamed Task',
      startTime: new Date(),
      estimatedCompletion: new Date(Date.now() + 3600000), // 1 hour default
      progress: 0,
      operation: (task as any).operation || 'generic',
      target: (task as any).target || {},
      parameters: (task as any).parameters || {},
      priority: (task as any).priority || 'normal',
    };

    this.status = RobotStatus.RUNNING;
    
    if (userId) {
      this.lastOperatedBy = userId;
      this.lastOperatedAt = new Date();
    }

    return true;
  }

  updateTaskProgress(progress: number): void {
    if (this.currentTask) {
      this.currentTask.progress = Math.min(100, Math.max(0, progress));
      
      if (this.currentTask.progress >= 100) {
        this.completeCurrentTask();
      }
    }
  }

  completeCurrentTask(): void {
    if (this.currentTask) {
      // Move to completed tasks
      if (!this.taskQueue) {
        this.taskQueue = { pending: [], scheduled: [], completed: [], failed: [], maxQueueSize: 50, priorityLevels: [] };
      }
      
      this.taskQueue.completed.unshift({
        ...this.currentTask,
        completedAt: new Date(),
      });

      // Keep only last 20 completed tasks
      this.taskQueue.completed = this.taskQueue.completed.slice(0, 20);
      
      this.currentTask = null;
      this.status = RobotStatus.IDLE;
    }
  }

  emergencyStop(reason?: string): void {
    this.status = RobotStatus.EMERGENCY_STOP;
    
    if (this.currentTask) {
      this.currentTask.progress = 0; // Reset current task
    }

    // Log emergency stop
    if (!this.healthMonitoring) {
      this.healthMonitoring = {} as any;
    }
    
    this.healthMonitoring.diagnostics = [
      ...(this.healthMonitoring.diagnostics || []),
      {
        timestamp: new Date(),
        type: 'emergency_stop',
        reason: reason || 'manual',
        severity: 'critical',
      }
    ];
  }

  calibrate(): boolean {
    if (this.status !== RobotStatus.IDLE) {
      return false;
    }

    this.status = RobotStatus.CALIBRATING;
    
    // Simulate calibration process
    setTimeout(() => {
      this.status = RobotStatus.IDLE;
      
      // Update kinematics calibration
      if (this.kinematics) {
        this.kinematics.calibration = {
          timestamp: new Date(),
          accuracy: 0.05, // mm
          success: true,
          adjustments: [],
        };
      }
    }, 5000);

    return true;
  }

  learn(skill: object): boolean {
    if (!this.learningCapabilities?.skillLearning) {
      return false;
    }

    if (!this.knowledgeBase) {
      this.knowledgeBase = {
        skills: [],
        procedures: [],
        experiences: [],
        patterns: [],
        rules: [],
        models: [],
        updates: [],
        version: '1.0',
      };
    }

    this.knowledgeBase.skills.push({
      ...skill,
      learnedAt: new Date(),
      confidence: 0.8,
      usage: 0,
    });

    return true;
  }

  collaborate(humanOperator: string, task: object): boolean {
    if (!this.isCollaborative()) {
      return false;
    }

    // Enable collaboration mode
    this.status = RobotStatus.RUNNING;
    
    const collaborativeTask = {
      ...task,
      collaborationType: 'human_robot',
      humanOperator: humanOperator,
      safetyProtocols: this.collaborativeFeatures,
      startTime: new Date(),
    };

    return this.assignTask(collaborativeTask, humanOperator);
  }

  predictMaintenance(): object {
    if (!this.healthMonitoring) {
      return { error: 'Health monitoring not available' };
    }

    const health = this.healthMonitoring;
    const prediction = {
      nextMaintenanceRecommended: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      maintenanceType: 'preventive',
      components: [],
      priority: 'normal',
      estimatedCost: 500,
      estimatedDowntime: 2, // hours
      confidence: 0.85,
    };

    // Analyze health metrics
    if (health.vibrationLevel > 8) {
      prediction.components.push('bearings');
      prediction.priority = 'high';
    }

    if (health.lubricationLevel < 40) {
      prediction.components.push('lubrication_system');
    }

    if (health.jointWear) {
      const wornJoints = Object.entries(health.jointWear)
        .filter(([_, wear]: [string, any]) => wear > 70)
        .map(([joint, _]) => joint);
      
      prediction.components.push(...wornJoints);
    }

    return prediction;
  }

  optimizePerformance(): object {
    const optimization = {
      currentEfficiency: this.calculateEfficiency(),
      recommendations: [],
      potentialImprovements: {},
      implementationTime: 0,
    };

    // Analyze performance and suggest optimizations
    if (this.performanceMetrics) {
      const metrics = this.performanceMetrics;
      
      if (metrics.cycleTime > 60) {
        optimization.recommendations.push('Optimize path planning');
        optimization.potentialImprovements['cycleTime'] = -15; // 15% improvement
      }

      if (metrics.accuracy > 0.1) {
        optimization.recommendations.push('Recalibrate positioning system');
        optimization.potentialImprovements['accuracy'] = 50; // 50% improvement
      }

      if (metrics.errorRate > 2) {
        optimization.recommendations.push('Update AI models');
        optimization.potentialImprovements['errorRate'] = -70; // 70% reduction
      }
    }

    return optimization;
  }

  generateReport(): object {
    return {
      robotCode: this.robotCode,
      robotName: this.robotName,
      type: this.robotType,
      status: this.status,
      operational: this.isOperational(),
      collaborative: this.isCollaborative(),
      healthScore: this.getOverallHealthScore(),
      efficiency: this.calculateEfficiency(),
      currentTask: this.currentTask,
      needsMaintenance: this.needsMaintenance(),
      location: this.location,
      workCenter: this.workCenter?.name,
      capabilities: {
        ai: !!this.aiCapabilities,
        quantum: this.quantumProcessing,
        blockchain: this.blockchainIntegration,
        collaborative: this.isCollaborative(),
        autonomous: this.autonomyLevel,
      },
      performance: this.performanceMetrics,
      predictions: this.predictMaintenance(),
      optimizations: this.optimizePerformance(),
      lastMaintenance: this.lastMaintenance,
      nextMaintenance: this.nextMaintenanceDue,
    };
  }

  clone(newRobotCode: string): Partial<Robotics> {
    return {
      robotCode: newRobotCode,
      robotName: `${this.robotName} (Copy)`,
      description: this.description,
      robotType: this.robotType,
      safetyLevel: this.safetyLevel,
      autonomyLevel: this.autonomyLevel,
      manufacturer: this.manufacturer,
      model: this.model,
      workCenterId: this.workCenterId,
      physicalSpecs: this.physicalSpecs,
      kinematics: this.kinematics,
      controlSystem: this.controlSystem,
      programming: this.programming,
      status: RobotStatus.OFFLINE,
    };
  }

  shutdown(): void {
    this.status = RobotStatus.OFFLINE;
    this.currentTask = null;
    
    if (this.taskQueue) {
      this.taskQueue.pending = [];
      this.taskQueue.scheduled = [];
    }
  }
}
