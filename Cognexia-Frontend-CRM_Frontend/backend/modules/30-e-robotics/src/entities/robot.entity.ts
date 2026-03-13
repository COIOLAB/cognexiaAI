import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { RobotTask } from './robot-task.entity';
import { RobotFleet } from './robot-fleet.entity';
import { RobotCalibration } from './robot-calibration.entity';
import { RobotMaintenance } from './robot-maintenance.entity';
import { RobotSafety } from './robot-safety.entity';

export enum RobotType {
  INDUSTRIAL = 'industrial',
  COLLABORATIVE = 'collaborative',
  MOBILE = 'mobile',
  HUMANOID = 'humanoid',
  SCARA = 'scara',
  DELTA = 'delta',
  CARTESIAN = 'cartesian',
  CYLINDRICAL = 'cylindrical',
  SPHERICAL = 'spherical',
  ARTICULATED = 'articulated'
}

export enum RobotManufacturer {
  UNIVERSAL_ROBOTS = 'universal_robots',
  KUKA = 'kuka',
  ABB = 'abb',
  FANUC = 'fanuc',
  YASKAWA = 'yaskawa',
  OMRON = 'omron',
  MITSUBISHI = 'mitsubishi',
  DENSO = 'denso',
  KAWASAKI = 'kawasaki',
  STAUBLI = 'staubli',
  DOOSAN = 'doosan',
  FRANKA_EMIKA = 'franka_emika',
  BOSTON_DYNAMICS = 'boston_dynamics',
  OTHER = 'other'
}

export enum RobotStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
  CALIBRATING = 'calibrating',
  EMERGENCY_STOP = 'emergency_stop',
  OFFLINE = 'offline'
}

export enum RobotCapability {
  WELDING = 'welding',
  PAINTING = 'painting',
  ASSEMBLY = 'assembly',
  PICK_AND_PLACE = 'pick_and_place',
  MATERIAL_HANDLING = 'material_handling',
  INSPECTION = 'inspection',
  PACKAGING = 'packaging',
  MACHINING = 'machining',
  CUTTING = 'cutting',
  GRINDING = 'grinding',
  POLISHING = 'polishing',
  DISPENSING = 'dispensing',
  PALLETIZING = 'palletizing',
  DEPALLETIZING = 'depalletizing'
}

@Entity('robots')
@Index(['manufacturer', 'model'])
@Index(['status'])
@Index(['serialNumber'], { unique: true })
export class Robot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  serialNumber: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: RobotManufacturer,
    default: RobotManufacturer.OTHER
  })
  manufacturer: RobotManufacturer;

  @Column()
  model: string;

  @Column({ nullable: true })
  version?: string;

  @Column({
    type: 'enum',
    enum: RobotType,
    default: RobotType.INDUSTRIAL
  })
  type: RobotType;

  @Column({
    type: 'enum',
    enum: RobotStatus,
    default: RobotStatus.OFFLINE
  })
  status: RobotStatus;

  @Column('simple-array', { nullable: true })
  capabilities: RobotCapability[];

  // Physical specifications
  @Column('int', { nullable: true })
  degreesOfFreedom?: number;

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  reach?: number; // in millimeters

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  payload?: number; // in kilograms

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  weight?: number; // in kilograms

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  repeatability?: number; // in millimeters

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  maxSpeed?: number; // in m/s

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  maxAcceleration?: number; // in m/s²

  // Network and communication
  @Column({ nullable: true })
  ipAddress?: string;

  @Column('int', { nullable: true })
  port?: number;

  @Column({ nullable: true })
  protocol?: string; // TCP, UDP, Ethernet/IP, PROFINET, etc.

  @Column({ nullable: true })
  macAddress?: string;

  // Position and orientation
  @Column('json', { nullable: true })
  currentPosition?: {
    x: number;
    y: number;
    z: number;
    rx: number;
    ry: number;
    rz: number;
  };

  @Column('json', { nullable: true })
  homePosition?: {
    x: number;
    y: number;
    z: number;
    rx: number;
    ry: number;
    rz: number;
  };

  @Column('json', { nullable: true })
  workspaceLimit?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };

  // Joint information
  @Column('json', { nullable: true })
  jointPositions?: number[];

  @Column('json', { nullable: true })
  jointVelocities?: number[];

  @Column('json', { nullable: true })
  jointTorques?: number[];

  @Column('json', { nullable: true })
  jointLimits?: {
    min: number[];
    max: number[];
  };

  // Tool and end-effector
  @Column({ nullable: true })
  toolType?: string;

  @Column('json', { nullable: true })
  toolOffset?: {
    x: number;
    y: number;
    z: number;
    rx: number;
    ry: number;
    rz: number;
  };

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  toolWeight?: number;

  // Safety features
  @Column('boolean', { default: false })
  emergencyStopActivated: boolean;

  @Column('boolean', { default: true })
  safetyFunctionsEnabled: boolean;

  @Column('simple-array', { nullable: true })
  safetyZones?: string[];

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  maxSafetySpeed?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  maxSafetyForce?: number;

  // Operational data
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalOperatingHours: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalCycles: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  currentUtilization: number; // percentage

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  averageUtilization: number; // percentage

  @Column('json', { nullable: true })
  performance?: {
    cycleTime: number;
    throughput: number;
    efficiency: number;
    quality: number;
  };

  // Power and energy
  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  powerConsumption?: number; // in watts

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  energyEfficiency?: number; // percentage

  @Column('decimal', { precision: 10, scale: 3, nullable: true })
  batteryLevel?: number; // percentage for mobile robots

  // Temperature and environmental
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  operatingTemperature?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  maxOperatingTemperature?: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  humidity?: number;

  // Maintenance
  @Column('timestamp', { nullable: true })
  lastMaintenanceDate?: Date;

  @Column('timestamp', { nullable: true })
  nextMaintenanceDate?: Date;

  @Column('int', { default: 0 })
  maintenanceInterval: number; // in hours

  @Column('json', { nullable: true })
  maintenanceHistory?: Array<{
    date: Date;
    type: string;
    description: string;
    technician: string;
  }>;

  // Error and diagnostics
  @Column('json', { nullable: true })
  lastError?: {
    code: string;
    message: string;
    timestamp: Date;
    severity: string;
  };

  @Column('json', { nullable: true })
  diagnostics?: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    sensors: Record<string, any>;
  };

  // Configuration
  @Column('json', { nullable: true })
  configuration?: Record<string, any>;

  @Column('json', { nullable: true })
  parameters?: Record<string, any>;

  @Column('json', { nullable: true })
  calibrationData?: Record<string, any>;

  // Location and installation
  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  zone?: string;

  @Column({ nullable: true })
  workCell?: string;

  @Column({ nullable: true })
  productionLine?: string;

  @Column('timestamp', { nullable: true })
  installationDate?: Date;

  @Column('timestamp', { nullable: true })
  commissioningDate?: Date;

  // Firmware and software
  @Column({ nullable: true })
  firmwareVersion?: string;

  @Column({ nullable: true })
  softwareVersion?: string;

  @Column('timestamp', { nullable: true })
  lastUpdateDate?: Date;

  // Connectivity
  @Column('boolean', { default: false })
  isConnected: boolean;

  @Column('timestamp', { nullable: true })
  lastHeartbeat?: Date;

  @Column('int', { default: 0 })
  connectionRetries: number;

  // Quality and certification
  @Column('simple-array', { nullable: true })
  certifications?: string[];

  @Column('simple-array', { nullable: true })
  standards?: string[];

  @Column({ nullable: true })
  qualityRating?: string;

  // Integration
  @Column('simple-array', { nullable: true })
  integrations?: string[];

  @Column('json', { nullable: true })
  tags?: Record<string, string>;

  @Column('json', { nullable: true })
  metadata?: Record<string, any>;

  // Relationships
  @ManyToOne(() => RobotFleet, fleet => fleet.robots, { nullable: true })
  @JoinColumn({ name: 'fleetId' })
  fleet?: RobotFleet;

  @Column({ nullable: true })
  fleetId?: string;

  @OneToMany(() => RobotTask, task => task.robot)
  tasks: RobotTask[];

  @OneToMany(() => RobotCalibration, calibration => calibration.robot)
  calibrations: RobotCalibration[];

  @OneToMany(() => RobotMaintenance, maintenance => maintenance.robot)
  maintenanceRecords: RobotMaintenance[];

  @OneToMany(() => RobotSafety, safety => safety.robot)
  safetyRecords: RobotSafety[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get isOnline(): boolean {
    return this.status !== RobotStatus.OFFLINE;
  }

  get isOperational(): boolean {
    return this.status === RobotStatus.IDLE || this.status === RobotStatus.RUNNING;
  }

  get needsMaintenance(): boolean {
    if (!this.nextMaintenanceDate) return false;
    return new Date() >= this.nextMaintenanceDate;
  }

  get isOverdue(): boolean {
    if (!this.nextMaintenanceDate) return false;
    return new Date() > this.nextMaintenanceDate;
  }

  // Methods
  updatePosition(position: { x: number; y: number; z: number; rx: number; ry: number; rz: number }): void {
    this.currentPosition = position;
    this.updatedAt = new Date();
  }

  updateJointPositions(positions: number[]): void {
    this.jointPositions = positions;
    this.updatedAt = new Date();
  }

  setStatus(status: RobotStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  addOperatingHours(hours: number): void {
    this.totalOperatingHours += hours;
    this.updatedAt = new Date();
  }

  incrementCycles(count: number = 1): void {
    this.totalCycles += count;
    this.updatedAt = new Date();
  }

  setError(error: { code: string; message: string; severity: string }): void {
    this.lastError = {
      ...error,
      timestamp: new Date()
    };
    this.status = RobotStatus.ERROR;
    this.updatedAt = new Date();
  }

  clearError(): void {
    this.lastError = null;
    if (this.status === RobotStatus.ERROR) {
      this.status = RobotStatus.IDLE;
    }
    this.updatedAt = new Date();
  }

  scheduleMaintenace(date: Date): void {
    this.nextMaintenanceDate = date;
    this.updatedAt = new Date();
  }

  performMaintenance(): void {
    this.lastMaintenanceDate = new Date();
    this.nextMaintenanceDate = new Date(Date.now() + (this.maintenanceInterval * 60 * 60 * 1000));
    this.status = RobotStatus.IDLE;
    this.updatedAt = new Date();
  }
}
