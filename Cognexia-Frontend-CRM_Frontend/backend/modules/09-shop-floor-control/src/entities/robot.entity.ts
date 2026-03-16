import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  Index,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { WorkCell } from './work-cell.entity';
import { RobotTask } from './robot-task.entity';
import { SafetyIncident } from './safety-incident.entity';
import { MaintenanceRecord } from './maintenance-record.entity';

// Enums for Industry 5.0 Robotics
export enum RobotType {
  ARTICULATED = 'articulated',
  SCARA = 'scara',
  DELTA = 'delta',
  CARTESIAN = 'cartesian',
  COLLABORATIVE = 'collaborative',
  MOBILE = 'mobile',
  HUMANOID = 'humanoid',
  AGV = 'agv', // Automated Guided Vehicle
  DRONE = 'drone',
  EXOSKELETON = 'exoskeleton'
}

export enum RobotState {
  IDLE = 'idle',
  ASSIGNED = 'assigned',
  EXECUTING = 'executing',
  PAUSED = 'paused',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
  CALIBRATING = 'calibrating',
  LEARNING = 'learning',
  EMERGENCY_STOP = 'emergency_stop',
  OFFLINE = 'offline'
}

export enum OperatingMode {
  MANUAL = 'manual',
  SEMI_AUTOMATIC = 'semi_automatic',
  AUTOMATIC = 'automatic',
  COLLABORATIVE = 'collaborative',
  AUTONOMOUS = 'autonomous',
  AI_DRIVEN = 'ai_driven',
  SWARM = 'swarm'
}

export enum SafetyStandard {
  ISO_10218 = 'iso_10218',
  ISO_13849 = 'iso_13849',
  IEC_61508 = 'iec_61508',
  ANSI_RIA_R15_06 = 'ansi_ria_r15_06',
  ISO_TS_15066 = 'iso_ts_15066'
}

export enum AICapability {
  MACHINE_LEARNING = 'machine_learning',
  COMPUTER_VISION = 'computer_vision',
  NATURAL_LANGUAGE = 'natural_language',
  PREDICTIVE_ANALYTICS = 'predictive_analytics',
  REINFORCEMENT_LEARNING = 'reinforcement_learning',
  FEDERATED_LEARNING = 'federated_learning',
  QUANTUM_ML = 'quantum_ml'
}

// Interfaces for complex data structures
export interface RobotCapabilities {
  // Physical capabilities
  payloadKg: number;
  reachMm: number;
  axes: number;
  maxSpeedMmS: number;
  repeatabilityMm: number;
  workingSpace: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    zMin: number;
    zMax: number;
  };
  
  // Advanced capabilities
  forceSensing: boolean;
  visionSystem: boolean;
  tactileSensors: boolean;
  voiceCommands: boolean;
  gestureRecognition: boolean;
  emotionalIntelligence: boolean;
  
  // Collaborative features
  humanAwareness: boolean;
  adaptiveSpeed: boolean;
  predictivePathPlanning: boolean;
  intentRecognition: boolean;
  
  // AI/ML capabilities
  aiCapabilities: AICapability[];
  neuralNetworkCapacity: number; // FLOPS
  memoryCapacity: number; // GB
  
  // Connectivity
  protocols: string[]; // Ethernet/IP, PROFINET, OPC-UA, etc.
  wirelessCapabilities: string[]; // WiFi, 5G, LoRa
  quantumCommunication: boolean;
}

export interface RobotPosition {
  x: number;
  y: number;
  z: number;
  roll: number;   // Rx
  pitch: number;  // Ry
  yaw: number;    // Rz
  
  // Joint positions (for articulated robots)
  joints?: number[];
  
  // Confidence and accuracy
  confidence: number;
  accuracy: number;
  
  // Timestamp
  timestamp: Date;
}

export interface SafetyConfiguration {
  safetyStandards: SafetyStandard[];
  emergencyStopType: 'category_0' | 'category_1' | 'category_2';
  safetyZones: SafetyZone[];
  collaborativeFeatures: {
    powerForceMonitoring: boolean;
    speedSeparationMonitoring: boolean;
    safetyRatedMonitoredStop: boolean;
    handGuiding: boolean;
  };
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    lastAssessment: Date;
    assessor: string;
  };
}

export interface SafetyZone {
  id: string;
  type: 'restricted' | 'collaborative' | 'human_only' | 'robot_only';
  shape: 'sphere' | 'cylinder' | 'box' | 'polygon';
  parameters: Record<string, number>;
  priority: number;
}

export interface PerformanceMetrics {
  // Operational metrics
  cycleTime: number; // seconds
  throughput: number; // parts per hour
  uptime: number; // percentage
  oee: number; // Overall Equipment Effectiveness
  
  // Quality metrics
  accuracy: number; // percentage
  precision: number; // mm
  defectRate: number; // percentage
  firstPassYield: number; // percentage
  
  // Energy metrics
  powerConsumption: number; // kW
  energyEfficiency: number; // parts per kWh
  carbonFootprint: number; // kg CO2
  
  // Maintenance metrics
  mtbf: number; // Mean Time Between Failures (hours)
  mttr: number; // Mean Time To Repair (hours)
  maintenanceCost: number; // currency per hour
  
  // Learning metrics
  learningRate: number;
  adaptabilityScore: number;
  collaborationEfficiency: number;
  
  // Update timestamp
  lastUpdated: Date;
}

export interface AILearningProfile {
  modelVersion: string;
  learningAlgorithm: string;
  trainingDataSize: number;
  accuracy: number;
  lastTraining: Date;
  adaptationRate: number;
  knowledgeBase: Record<string, any>;
  personalizedBehaviors: Record<string, any>;
  collaborationPatterns: Record<string, any>;
}

@Entity('robots')
@Index(['type', 'status'])
@Index(['workCellId', 'status'])
@Index(['manufacturer', 'model'])
@Index(['operatingMode'])
export class Robot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  @Index()
  name: string;

  @Column({ length: 100, nullable: true })
  displayName?: string;

  @Column({
    type: 'enum',
    enum: RobotType
  })
  @Index()
  type: RobotType;

  @Column({
    type: 'enum',
    enum: RobotState,
    default: RobotState.OFFLINE
  })
  @Index()
  status: RobotState;

  @Column({
    type: 'enum',
    enum: OperatingMode,
    default: OperatingMode.MANUAL
  })
  @Index()
  operatingMode: OperatingMode;

  // Manufacturer and Model Information
  @Column({ length: 100 })
  @Index()
  manufacturer: string;

  @Column({ length: 100 })
  @Index()
  model: string;

  @Column({ length: 50, nullable: true })
  serialNumber?: string;

  @Column({ length: 50, nullable: true })
  firmwareVersion?: string;

  @Column({ length: 50, nullable: true })
  softwareVersion?: string;

  @Column({ type: 'date', nullable: true })
  manufacturingDate?: Date;

  @Column({ type: 'date', nullable: true })
  installationDate?: Date;

  @Column({ type: 'date', nullable: true })
  lastCalibrationDate?: Date;

  // Network and Connectivity
  @Column({ length: 45, nullable: true })
  ipAddress?: string;

  @Column({ length: 17, nullable: true })
  macAddress?: string;

  @Column({ type: 'int', nullable: true })
  port?: number;

  // Physical Location and Setup
  @ManyToOne(() => WorkCell, workCell => workCell.robots, { nullable: true })
  workCell?: WorkCell;

  @Column({ nullable: true })
  workCellId?: string;

  @Column({ length: 255, nullable: true })
  location?: string;

  @Column({ length: 100, nullable: true })
  facility?: string;

  @Column({ length: 100, nullable: true })
  department?: string;

  @Column({ length: 100, nullable: true })
  productionLine?: string;

  @Column({ length: 100, nullable: true })
  workstation?: string;

  // Capabilities and Specifications
  @Column({ type: 'jsonb' })
  capabilities: RobotCapabilities;

  @Column({ type: 'jsonb' })
  safetyConfiguration: SafetyConfiguration;

  // Current State Information
  @Column({ type: 'jsonb', nullable: true })
  currentPosition?: RobotPosition;

  @Column({ type: 'jsonb', nullable: true })
  targetPosition?: RobotPosition;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  currentSpeed?: number; // mm/s

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  currentLoad?: number; // kg

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  batteryLevel?: number; // percentage (for mobile robots)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperature?: number; // Celsius

  // Performance and Analytics
  @Column({ type: 'jsonb', nullable: true })
  performanceMetrics?: PerformanceMetrics;

  @Column({ type: 'jsonb', nullable: true })
  aiLearningProfile?: AILearningProfile;

  // Task Management
  @Column({ nullable: true })
  currentTaskId?: string;

  @Column({ type: 'text', array: true, nullable: true })
  taskQueue?: string[];

  @Column({ type: 'int', default: 0 })
  tasksCompleted: number;

  @Column({ type: 'int', default: 0 })
  tasksFailedToday: number;

  // Operational Counters
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalOperatingHours: number;

  @Column({ type: 'int', default: 0 })
  totalCycles: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalEnergyConsumed: number; // kWh

  @Column({ type: 'int', default: 0 })
  totalMaintenanceEvents: number;

  // Status Tracking
  @Column({ type: 'timestamp', nullable: true })
  lastSeen?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastTaskCompleted?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastMaintenanceDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextMaintenanceDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastErrorOccurred?: Date;

  // Error and Alert Management
  @Column({ type: 'text', array: true, nullable: true })
  currentAlerts?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  recentErrors?: string[];

  @Column({ type: 'int', default: 0 })
  errorCount: number;

  // Configuration and Metadata
  @Column({ type: 'jsonb', nullable: true })
  configuration?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  // Flags
  @Column({ default: true })
  @Index()
  isActive: boolean;

  @Column({ default: false })
  isCollaborative: boolean;

  @Column({ default: false })
  hasAI: boolean;

  @Column({ default: false })
  hasVision: boolean;

  @Column({ default: false })
  hasForceSensing: boolean;

  @Column({ default: false })
  isLearning: boolean;

  @Column({ default: false })
  isSimulated: boolean;

  @Column({ default: false })
  needsCalibration: boolean;

  @Column({ default: false })
  isEmergencyStopped: boolean;

  // Digital Twin Integration
  @Column({ default: false })
  hasDigitalTwin: boolean;

  @Column({ nullable: true })
  digitalTwinId?: string;

  // Relationships
  @OneToMany(() => RobotTask, task => task.robot)
  tasks: RobotTask[];

  @OneToMany(() => SafetyIncident, incident => incident.robot)
  safetyIncidents: SafetyIncident[];

  @OneToMany(() => MaintenanceRecord, record => record.robot)
  maintenanceRecords: MaintenanceRecord[];

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  updatedBy?: string;

  // Hooks
  @BeforeInsert()
  @BeforeUpdate()
  updateTimestamps() {
    if (this.status !== RobotState.OFFLINE && this.status !== RobotState.ERROR) {
      this.lastSeen = new Date();
    }
  }

  // Helper Methods
  isOnline(): boolean {
    return ![RobotState.OFFLINE, RobotState.ERROR, RobotState.EMERGENCY_STOP].includes(this.status);
  }

  isAvailable(): boolean {
    return this.status === RobotState.IDLE && this.isActive && !this.needsCalibration;
  }

  isCollaborativeMode(): boolean {
    return this.operatingMode === OperatingMode.COLLABORATIVE && this.isCollaborative;
  }

  needsMaintenance(): boolean {
    if (!this.nextMaintenanceDate) return false;
    return new Date() >= this.nextMaintenanceDate;
  }

  hasActiveAlerts(): boolean {
    return this.currentAlerts && this.currentAlerts.length > 0;
  }

  hasRecentErrors(): boolean {
    return this.recentErrors && this.recentErrors.length > 0;
  }

  getUtilization(): number {
    if (!this.performanceMetrics) return 0;
    return this.performanceMetrics.uptime || 0;
  }

  getOEE(): number {
    if (!this.performanceMetrics) return 0;
    return this.performanceMetrics.oee || 0;
  }

  isCapableOf(requirement: Partial<RobotCapabilities>): boolean {
    if (requirement.payloadKg && this.capabilities.payloadKg < requirement.payloadKg) return false;
    if (requirement.reachMm && this.capabilities.reachMm < requirement.reachMm) return false;
    if (requirement.axes && this.capabilities.axes < requirement.axes) return false;
    if (requirement.maxSpeedMmS && this.capabilities.maxSpeedMmS < requirement.maxSpeedMmS) return false;
    if (requirement.visionSystem && !this.capabilities.visionSystem) return false;
    if (requirement.forceSensing && !this.capabilities.forceSensing) return false;
    return true;
  }

  updatePosition(position: Partial<RobotPosition>): void {
    this.currentPosition = {
      ...this.currentPosition!,
      ...position,
      timestamp: new Date()
    };
  }

  addAlert(alert: string): void {
    if (!this.currentAlerts) this.currentAlerts = [];
    this.currentAlerts.push(alert);
  }

  clearAlerts(): void {
    this.currentAlerts = [];
  }

  addError(error: string): void {
    if (!this.recentErrors) this.recentErrors = [];
    this.recentErrors.push(error);
    
    // Keep only last 10 errors
    if (this.recentErrors.length > 10) {
      this.recentErrors = this.recentErrors.slice(-10);
    }
    
    this.errorCount++;
    this.lastErrorOccurred = new Date();
  }

  clearErrors(): void {
    this.recentErrors = [];
  }

  emergencyStop(reason: string): void {
    this.status = RobotState.EMERGENCY_STOP;
    this.isEmergencyStopped = true;
    this.addAlert(`Emergency stop: ${reason}`);
  }

  reset(): void {
    this.status = RobotState.IDLE;
    this.isEmergencyStopped = false;
    this.clearAlerts();
    this.currentTaskId = null;
  }

  startTask(taskId: string): void {
    this.currentTaskId = taskId;
    this.status = RobotState.EXECUTING;
  }

  completeTask(): void {
    this.status = RobotState.IDLE;
    this.currentTaskId = null;
    this.tasksCompleted++;
    this.lastTaskCompleted = new Date();
  }

  failTask(reason: string): void {
    this.status = RobotState.ERROR;
    this.currentTaskId = null;
    this.tasksFailedToday++;
    this.addError(`Task failed: ${reason}`);
  }

  updatePerformanceMetrics(metrics: Partial<PerformanceMetrics>): void {
    this.performanceMetrics = {
      ...this.performanceMetrics,
      ...metrics,
      lastUpdated: new Date()
    } as PerformanceMetrics;
  }

  updateAIProfile(profile: Partial<AILearningProfile>): void {
    this.aiLearningProfile = {
      ...this.aiLearningProfile,
      ...profile
    } as AILearningProfile;
  }

  getHealthScore(): number {
    let score = 100;
    
    if (this.hasActiveAlerts()) score -= 10;
    if (this.hasRecentErrors()) score -= 15;
    if (this.needsMaintenance()) score -= 20;
    if (this.needsCalibration) score -= 10;
    if (this.errorCount > 5) score -= 15;
    if (this.performanceMetrics?.uptime && this.performanceMetrics.uptime < 85) score -= 20;
    if (this.batteryLevel && this.batteryLevel < 20) score -= 10;
    
    return Math.max(0, score);
  }

  getRobotSummary(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      operatingMode: this.operatingMode,
      manufacturer: this.manufacturer,
      model: this.model,
      location: this.location,
      healthScore: this.getHealthScore(),
      utilization: this.getUtilization(),
      oee: this.getOEE(),
      isAvailable: this.isAvailable(),
      currentTaskId: this.currentTaskId,
      tasksCompleted: this.tasksCompleted,
      lastSeen: this.lastSeen,
      capabilities: {
        payload: this.capabilities.payloadKg,
        reach: this.capabilities.reachMm,
        collaborative: this.isCollaborative,
        hasAI: this.hasAI,
        hasVision: this.hasVision,
        hasForceSensing: this.hasForceSensing
      }
    };
  }
}
