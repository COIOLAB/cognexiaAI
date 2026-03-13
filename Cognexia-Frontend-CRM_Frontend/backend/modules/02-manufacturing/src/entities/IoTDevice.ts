import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { WorkCenter } from './WorkCenter';

export enum DeviceType {
  SENSOR = 'sensor',
  ACTUATOR = 'actuator',
  GATEWAY = 'gateway',
  CAMERA = 'camera',
  CONTROLLER = 'controller',
  MONITOR = 'monitor',
  ANALYZER = 'analyzer',
  BEACON = 'beacon',
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  CALIBRATING = 'calibrating',
  STANDBY = 'standby',
}

export enum CommunicationProtocol {
  MQTT = 'mqtt',
  HTTP = 'http',
  WEBSOCKET = 'websocket',
  MODBUS = 'modbus',
  OPCUA = 'opcua',
  BLUETOOTH = 'bluetooth',
  WIFI = 'wifi',
  ETHERNET = 'ethernet',
}

@Entity('iot_devices')
@Index(['deviceCode'], { unique: true })
@Index(['deviceType'])
@Index(['status'])
@Index(['workCenterId'])
export class IoTDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  deviceCode: string;

  @Column({ length: 255 })
  deviceName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DeviceType,
    default: DeviceType.SENSOR,
  })
  deviceType: DeviceType;

  @Column({
    type: 'enum',
    enum: DeviceStatus,
    default: DeviceStatus.OFFLINE,
  })
  status: DeviceStatus;

  @Column({ length: 100, nullable: true })
  manufacturer: string;

  @Column({ length: 100, nullable: true })
  model: string;

  @Column({ length: 100, nullable: true })
  serialNumber: string;

  @Column({ length: 50, nullable: true })
  firmwareVersion: string;

  @Column({ length: 50, nullable: true })
  hardwareVersion: string;

  // Network Configuration
  @Column({ length: 45, nullable: true })
  ipAddress: string;

  @Column({ length: 17, nullable: true })
  macAddress: string;

  @Column({
    type: 'enum',
    enum: CommunicationProtocol,
    default: CommunicationProtocol.MQTT,
  })
  communicationProtocol: CommunicationProtocol;

  @Column({ type: 'int', nullable: true })
  port: number;

  @Column({ type: 'jsonb', nullable: true })
  networkConfig: {
    ssid: string;
    security: string;
    signalStrength: number;
    bandwidth: number;
    latency: number;
  };

  // Physical Location
  @Column({ length: 100, nullable: true })
  location: string;

  @Column({ type: 'decimal', precision: 8, scale: 5, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 8, scale: 5, nullable: true })
  longitude: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  altitude: number;

  @Column({ type: 'jsonb', nullable: true })
  physicalProperties: {
    dimensions: object;
    weight: number;
    mountingType: string;
    enclosureRating: string;
    operatingTemperature: object;
    operatingHumidity: object;
  };

  // Data Collection
  @Column({ type: 'jsonb', nullable: true })
  dataPoints: {
    parameters: string[];
    units: object;
    ranges: object;
    accuracy: object;
    precision: object;
    samplingRate: number; // Hz
  };

  @Column({ type: 'int', default: 60 })
  reportingInterval: number; // seconds

  @Column({ type: 'timestamp', nullable: true })
  lastDataReceived: Date;

  @Column({ type: 'jsonb', nullable: true })
  currentReadings: {
    values: object;
    timestamp: Date;
    quality: string;
    alarms: object[];
  };

  // Power Management
  @Column({ type: 'jsonb', nullable: true })
  powerConfig: {
    powerSource: string; // battery, mains, solar, etc.
    voltage: number;
    current: number;
    batteryLevel: number; // percentage
    batteryType: string;
    powerConsumption: number; // watts
    sleepMode: boolean;
  };

  // Security
  @Column({ type: 'jsonb', nullable: true })
  securityConfig: {
    authentication: string;
    encryption: string;
    certificates: string[];
    accessKeys: string[];
    permissions: object;
  };

  // Calibration and Maintenance
  @Column({ type: 'timestamp', nullable: true })
  lastCalibration: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextCalibrationDue: Date;

  @Column({ type: 'int', default: 90 })
  calibrationIntervalDays: number;

  @Column({ type: 'jsonb', nullable: true })
  calibrationData: {
    procedure: string;
    reference: string;
    results: object[];
    accuracy: number;
    drift: number;
    adjustments: object[];
  };

  @Column({ type: 'timestamp', nullable: true })
  lastMaintenance: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextMaintenanceDue: Date;

  // Alerts and Thresholds
  @Column({ type: 'jsonb', nullable: true })
  alertConfig: {
    thresholds: object[];
    recipients: string[];
    methods: string[];
    escalation: object[];
    suppressionRules: object[];
  };

  @Column({ type: 'jsonb', nullable: true })
  activeAlerts: {
    alerts: object[];
    acknowledgements: object[];
    suppressions: object[];
  };

  // Performance Metrics
  @Column({ type: 'jsonb', nullable: true })
  performance: {
    uptime: number; // percentage
    availability: number; // percentage
    reliability: number; // MTBF
    dataQuality: number; // percentage
    responseTime: number; // milliseconds
    throughput: number; // messages per second
  };

  // Health Monitoring
  @Column({ type: 'jsonb', nullable: true })
  healthMetrics: {
    cpu: number; // percentage
    memory: number; // percentage
    storage: number; // percentage
    temperature: number; // celsius
    humidity: number; // percentage
    vibration: number; // mm/s
    diagnostics: object[];
  };

  // Edge Computing
  @Column({ type: 'boolean', default: false })
  hasEdgeComputing: boolean;

  @Column({ type: 'jsonb', nullable: true })
  edgeConfig: {
    capabilities: string[];
    storage: number; // MB
    processing: string;
    aiModels: string[];
    localAnalytics: boolean;
    offlineMode: boolean;
  };

  // Integration
  @Column({ type: 'jsonb', nullable: true })
  integrationConfig: {
    protocols: string[];
    apis: string[];
    subscriptions: object[];
    publications: object[];
    dataFormat: string;
    compression: string;
  };

  // Installation Information
  @Column({ type: 'date', nullable: true })
  installationDate: Date;

  @Column({ length: 100, nullable: true })
  installedBy: string;

  @Column({ type: 'date', nullable: true })
  warrantyExpiry: Date;

  @Column({ type: 'jsonb', nullable: true })
  installationNotes: {
    procedure: string;
    configuration: object;
    testing: object[];
    issues: string[];
    photos: string[];
  };

  // Lifecycle Management
  @Column({ type: 'jsonb', nullable: true })
  lifecycle: {
    stage: string; // planning, installation, operation, maintenance, retirement
    expectedLife: number; // years
    actualLife: number; // years
    replacementPlan: object;
    upgradePath: string[];
  };

  // Cost Information
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  purchaseCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  installationCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  maintenanceCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  operatingCost: number;

  // Relationships
  @Column({ type: 'varchar' })
  workCenterId: string;

  @ManyToOne(() => WorkCenter, (workCenter) => workCenter.iotDevices)
  @JoinColumn({ name: 'workCenterId' })
  workCenter: WorkCenter;

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100, nullable: true })
  createdBy: string;

  @Column({ length: 100, nullable: true })
  updatedBy: string;

  // Methods
  isOnline(): boolean {
    return this.status === DeviceStatus.ONLINE;
  }

  isHealthy(): boolean {
    return this.status === DeviceStatus.ONLINE && 
           this.getHealthScore() > 80;
  }

  getHealthScore(): number {
    if (!this.healthMetrics) return 50;
    
    const cpu = 100 - (this.healthMetrics.cpu || 0);
    const memory = 100 - (this.healthMetrics.memory || 0);
    const storage = 100 - (this.healthMetrics.storage || 0);
    const uptime = this.performance?.uptime || 0;
    
    return (cpu + memory + storage + uptime) / 4;
  }

  needsCalibration(): boolean {
    if (!this.nextCalibrationDue) return false;
    return new Date() > this.nextCalibrationDue;
  }

  needsMaintenance(): boolean {
    if (!this.nextMaintenanceDue) return false;
    return new Date() > this.nextMaintenanceDue;
  }

  getUptimePercentage(): number {
    return this.performance?.uptime || 0;
  }

  getDataFreshness(): number {
    if (!this.lastDataReceived) return 0;
    
    const now = new Date();
    const lastReceived = new Date(this.lastDataReceived);
    const minutesSinceLastData = (now.getTime() - lastReceived.getTime()) / (1000 * 60);
    
    if (minutesSinceLastData < 5) return 100;
    if (minutesSinceLastData < 15) return 80;
    if (minutesSinceLastData < 60) return 60;
    if (minutesSinceLastData < 240) return 40;
    return 0;
  }

  getBatteryStatus(): string {
    if (!this.powerConfig?.batteryLevel) return 'N/A';
    
    const level = this.powerConfig.batteryLevel;
    if (level > 75) return 'Good';
    if (level > 50) return 'Fair';
    if (level > 25) return 'Low';
    if (level > 10) return 'Critical';
    return 'Empty';
  }

  updateStatus(newStatus: DeviceStatus, userId?: string): void {
    this.status = newStatus;
    
    if (newStatus === DeviceStatus.ONLINE) {
      this.lastDataReceived = new Date();
    }
    
    if (userId) {
      this.updatedBy = userId;
    }
  }

  recordData(data: object): void {
    this.currentReadings = {
      values: data,
      timestamp: new Date(),
      quality: 'good',
      alarms: [],
    };
    
    this.lastDataReceived = new Date();
  }

  addAlert(alert: object): void {
    if (!this.activeAlerts) {
      this.activeAlerts = { alerts: [], acknowledgements: [], suppressions: [] };
    }
    
    this.activeAlerts.alerts.push(alert);
  }

  acknowledgeAlert(alertId: string, userId: string): void {
    if (!this.activeAlerts) return;
    
    const acknowledgement = {
      alertId,
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
    };
    
    this.activeAlerts.acknowledgements.push(acknowledgement);
  }

  performCalibration(results: object, userId?: string): void {
    this.calibrationData = {
      ...this.calibrationData,
      results: [...(this.calibrationData?.results || []), results],
    };
    
    this.lastCalibration = new Date();
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + this.calibrationIntervalDays);
    this.nextCalibrationDue = nextDue;
    
    if (userId) {
      this.updatedBy = userId;
    }
  }

  validateConfiguration(): string[] {
    const errors: string[] = [];
    
    if (!this.deviceCode || this.deviceCode.trim().length === 0) {
      errors.push('Device code is required');
    }
    
    if (!this.deviceName || this.deviceName.trim().length === 0) {
      errors.push('Device name is required');
    }
    
    if (!this.workCenterId) {
      errors.push('Work center assignment is required');
    }
    
    if (this.reportingInterval <= 0) {
      errors.push('Reporting interval must be positive');
    }
    
    if (this.powerConfig?.batteryLevel && 
        (this.powerConfig.batteryLevel < 0 || this.powerConfig.batteryLevel > 100)) {
      errors.push('Battery level must be between 0 and 100');
    }
    
    return errors;
  }

  generateStatusReport(): object {
    return {
      deviceCode: this.deviceCode,
      deviceName: this.deviceName,
      type: this.deviceType,
      status: this.status,
      location: this.location,
      healthScore: this.getHealthScore(),
      uptime: this.getUptimePercentage(),
      dataFreshness: this.getDataFreshness(),
      batteryStatus: this.getBatteryStatus(),
      lastData: this.lastDataReceived,
      needsCalibration: this.needsCalibration(),
      needsMaintenance: this.needsMaintenance(),
      activeAlerts: this.activeAlerts?.alerts?.length || 0,
      workCenter: this.workCenter?.name,
    };
  }

  clone(newDeviceCode: string): Partial<IoTDevice> {
    return {
      deviceCode: newDeviceCode,
      deviceName: `${this.deviceName} (Copy)`,
      description: this.description,
      deviceType: this.deviceType,
      manufacturer: this.manufacturer,
      model: this.model,
      communicationProtocol: this.communicationProtocol,
      workCenterId: this.workCenterId,
      reportingInterval: this.reportingInterval,
      calibrationIntervalDays: this.calibrationIntervalDays,
      status: DeviceStatus.OFFLINE,
    };
  }

  estimateRemainingLife(): number {
    if (!this.lifecycle?.expectedLife || !this.installationDate) return 0;
    
    const now = new Date();
    const installation = new Date(this.installationDate);
    const ageYears = (now.getTime() - installation.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    return Math.max(0, this.lifecycle.expectedLife - ageYears);
  }

  calculateTotalCost(): number {
    return (this.purchaseCost || 0) + 
           (this.installationCost || 0) + 
           (this.maintenanceCost || 0) + 
           (this.operatingCost || 0);
  }

  updateHealthMetrics(metrics: object): void {
    this.healthMetrics = {
      ...this.healthMetrics,
      ...metrics,
      diagnostics: [...(this.healthMetrics?.diagnostics || []), {
        timestamp: new Date(),
        metrics,
      }],
    };
  }
}
