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
import { DeviceAlert } from './device-alert.entity';
import { SensorReading } from './sensor-reading.entity';
import { DeviceCommand } from './device-command.entity';
import { Gateway } from './gateway.entity';

// Enums for Industry 5.0 IoT
export enum DeviceType {
  SENSOR = 'sensor',
  ACTUATOR = 'actuator',
  GATEWAY = 'gateway',
  EDGE_DEVICE = 'edge_device',
  SMART_DEVICE = 'smart_device',
  ROBOT = 'robot',
  COLLABORATIVE_ROBOT = 'collaborative_robot',
  AGV = 'agv', // Automated Guided Vehicle
  DRONE = 'drone',
  WEARABLE = 'wearable',
  BEACON = 'beacon',
  CAMERA = 'camera',
  AI_ACCELERATOR = 'ai_accelerator',
  QUANTUM_SENSOR = 'quantum_sensor'
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  CALIBRATING = 'calibrating',
  UPDATING = 'updating',
  SLEEPING = 'sleeping',
  DEGRADED = 'degraded',
  CRITICAL = 'critical'
}

export enum SecurityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  QUANTUM_SAFE = 'quantum_safe'
}

export enum ConnectivityType {
  WIFI = 'wifi',
  ETHERNET = 'ethernet',
  BLUETOOTH = 'bluetooth',
  ZIGBEE = 'zigbee',
  LORA = 'lora',
  CELLULAR_4G = 'cellular_4g',
  CELLULAR_5G = 'cellular_5g',
  SATELLITE = 'satellite',
  MESH_NETWORK = 'mesh_network',
  QUANTUM_CHANNEL = 'quantum_channel'
}

export interface DeviceCapabilities {
  hasAI: boolean;
  hasEdgeComputing: boolean;
  hasQuantumSensing: boolean;
  hasBlockchainWallet: boolean;
  supportsMachineLearning: boolean;
  hasComputerVision: boolean;
  hasNaturalLanguageProcessing: boolean;
  hasDigitalTwin: boolean;
  canLearn: boolean;
  hasAutonomousMode: boolean;
}

export interface TechnicalSpecs {
  processingPower: number; // FLOPS
  memorySize: number; // MB
  storageCapacity: number; // GB
  batteryCapacity?: number; // mAh
  operatingTemperatureMin: number; // Celsius
  operatingTemperatureMax: number; // Celsius
  ipRating?: string; // IP65, IP67, etc.
  powerConsumption: number; // Watts
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  certifications: string[]; // CE, FCC, UL, etc.
}

export interface AIConfiguration {
  modelVersions: Record<string, string>;
  inferenceAcceleration: boolean;
  edgeTensorProcessing: boolean;
  quantumMLEnabled: boolean;
  federatedLearning: boolean;
  continuousLearning: boolean;
  explainableAI: boolean;
}

export interface SecurityConfiguration {
  encryption: {
    algorithm: string;
    keyLength: number;
    quantumResistant: boolean;
  };
  authentication: {
    method: string;
    certificateAuth: boolean;
    biometricAuth: boolean;
    blockchainAuth: boolean;
  };
  networkSecurity: {
    vpnEnabled: boolean;
    firewallEnabled: boolean;
    intrusionDetection: boolean;
    zeroTrustEnabled: boolean;
  };
}

@Entity('iot_devices')
@Index(['type', 'status'])
@Index(['location', 'status'])
@Index(['gatewayId', 'status'])
export class IoTDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  @Index()
  name: string;

  @Column({ 
    type: 'enum', 
    enum: DeviceType,
    default: DeviceType.SENSOR 
  })
  @Index()
  type: DeviceType;

  @Column({ 
    type: 'enum', 
    enum: DeviceStatus,
    default: DeviceStatus.OFFLINE 
  })
  @Index()
  status: DeviceStatus;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({ length: 255, nullable: true })
  @Index()
  location?: string;

  @Column({ length: 255, nullable: true })
  @Index()
  facility?: string;

  @Column({ length: 255, nullable: true })
  department?: string;

  @Column({ length: 255, nullable: true })
  workCenter?: string;

  // Network and Connectivity
  @Column({ length: 45, nullable: true })
  ipAddress?: string;

  @Column({ length: 17, unique: true })
  macAddress: string;

  @Column({ 
    type: 'enum', 
    enum: ConnectivityType,
    array: true,
    default: [ConnectivityType.WIFI]
  })
  connectivityTypes: ConnectivityType[];

  @Column({ nullable: true })
  firmwareVersion?: string;

  @Column({ nullable: true })
  hardwareRevision?: string;

  @Column({ nullable: true })
  serialNumber?: string;

  @Column({ nullable: true })
  manufacturerName?: string;

  @Column({ nullable: true })
  modelNumber?: string;

  @Column({ 
    type: 'enum', 
    enum: SecurityLevel,
    default: SecurityLevel.MEDIUM 
  })
  securityLevel: SecurityLevel;

  // Industry 5.0 Advanced Features
  @Column({ type: 'jsonb' })
  capabilities: DeviceCapabilities;

  @Column({ type: 'jsonb' })
  technicalSpecs: TechnicalSpecs;

  @Column({ type: 'jsonb', nullable: true })
  aiConfiguration?: AIConfiguration;

  @Column({ type: 'jsonb' })
  securityConfiguration: SecurityConfiguration;

  // Operational Data
  @Column({ type: 'timestamp', nullable: true })
  lastSeen?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastDataReceived?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastMaintenanceDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextMaintenanceDate?: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  batteryLevel?: number; // Percentage 0-100

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  powerConsumption?: number; // Current power consumption in watts

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  signalStrength?: number; // Signal strength percentage

  @Column({ type: 'int', default: 0 })
  dataPointsCollected: number;

  @Column({ type: 'int', default: 0 })
  commandsExecuted: number;

  @Column({ type: 'int', default: 0 })
  alertsGenerated: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude?: number;

  @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true })
  altitude?: number; // Meters above sea level

  // Environmental Data
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  currentTemperature?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  currentHumidity?: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  currentPressure?: number;

  // Configuration and Metadata
  @Column({ type: 'jsonb', nullable: true })
  configuration?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  customAttributes?: Record<string, any>;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSimulated: boolean; // For testing and digital twin purposes

  @Column({ default: false })
  hasDigitalTwin: boolean;

  @Column({ nullable: true })
  digitalTwinId?: string;

  // Relationships
  @ManyToOne(() => Gateway, gateway => gateway.devices, { nullable: true })
  gateway?: Gateway;

  @Column({ nullable: true })
  gatewayId?: string;

  @OneToMany(() => SensorReading, reading => reading.device)
  sensorReadings: SensorReading[];

  @OneToMany(() => DeviceAlert, alert => alert.device)
  alerts: DeviceAlert[];

  @OneToMany(() => DeviceCommand, command => command.device)
  commands: DeviceCommand[];

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  updatedBy?: string;

  // Methods for Industry 5.0 operations
  @BeforeInsert()
  @BeforeUpdate()
  updateTimestamps() {
    if (this.status === DeviceStatus.ONLINE) {
      this.lastSeen = new Date();
    }
  }

  // Helper methods
  isOnline(): boolean {
    return this.status === DeviceStatus.ONLINE;
  }

  isHealthy(): boolean {
    return [DeviceStatus.ONLINE, DeviceStatus.CALIBRATING].includes(this.status);
  }

  needsMaintenance(): boolean {
    if (!this.nextMaintenanceDate) return false;
    return new Date() >= this.nextMaintenanceDate;
  }

  hasLowBattery(): boolean {
    return this.batteryLevel !== undefined && this.batteryLevel < 20;
  }

  hasWeakSignal(): boolean {
    return this.signalStrength !== undefined && this.signalStrength < 30;
  }

  hasAICapabilities(): boolean {
    return this.capabilities?.hasAI || false;
  }

  hasQuantumCapabilities(): boolean {
    return this.capabilities?.hasQuantumSensing || false;
  }

  canPerformEdgeComputing(): boolean {
    return this.capabilities?.hasEdgeComputing || false;
  }

  isQuantumSecure(): boolean {
    return this.securityLevel === SecurityLevel.QUANTUM_SAFE;
  }

  getDeviceHealth(): {
    overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    factors: Record<string, any>;
  } {
    const factors = {
      connectivity: this.isOnline(),
      battery: this.batteryLevel || 100,
      signal: this.signalStrength || 100,
      maintenance: !this.needsMaintenance(),
      lastSeen: this.lastSeen ? (Date.now() - this.lastSeen.getTime()) / 1000 / 60 : 0 // minutes
    };

    let healthScore = 0;
    if (factors.connectivity) healthScore += 30;
    if (factors.battery > 80) healthScore += 20;
    else if (factors.battery > 50) healthScore += 15;
    else if (factors.battery > 20) healthScore += 10;
    
    if (factors.signal > 80) healthScore += 20;
    else if (factors.signal > 50) healthScore += 15;
    else if (factors.signal > 30) healthScore += 10;
    
    if (factors.maintenance) healthScore += 15;
    if (factors.lastSeen < 10) healthScore += 15; // Last seen within 10 minutes
    else if (factors.lastSeen < 60) healthScore += 10;

    let overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    if (healthScore >= 90) overall = 'excellent';
    else if (healthScore >= 75) overall = 'good';
    else if (healthScore >= 60) overall = 'fair';
    else if (healthScore >= 40) overall = 'poor';
    else overall = 'critical';

    return { overall, factors };
  }

  updateLastSeen(): void {
    this.lastSeen = new Date();
    if (this.status === DeviceStatus.OFFLINE) {
      this.status = DeviceStatus.ONLINE;
    }
  }

  recordDataPoint(): void {
    this.dataPointsCollected++;
    this.lastDataReceived = new Date();
  }

  executeCommand(): void {
    this.commandsExecuted++;
  }

  generateAlert(): void {
    this.alertsGenerated++;
  }
}
