import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { IsNotEmpty, IsMAC, IsIP } from 'class-validator';

export enum DeviceType {
  GPS_TRACKER = 'gps_tracker',
  TEMPERATURE_SENSOR = 'temperature_sensor',
  HUMIDITY_SENSOR = 'humidity_sensor',
  SHOCK_SENSOR = 'shock_sensor',
  RFID_TAG = 'rfid_tag',
  BARCODE_SCANNER = 'barcode_scanner',
  WEIGHT_SENSOR = 'weight_sensor',
  PROXIMITY_SENSOR = 'proximity_sensor',
  CAMERA = 'camera',
  ACCELEROMETER = 'accelerometer',
  GYROSCOPE = 'gyroscope',
  PRESSURE_SENSOR = 'pressure_sensor',
  LIGHT_SENSOR = 'light_sensor',
  SOUND_SENSOR = 'sound_sensor',
  AIR_QUALITY_SENSOR = 'air_quality_sensor',
  SMART_LOCK = 'smart_lock',
  GATEWAY = 'gateway',
  BEACON = 'beacon',
}

export enum DeviceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  OFFLINE = 'offline',
  ERROR = 'error',
  CALIBRATION = 'calibration',
  DECOMMISSIONED = 'decommissioned',
}

export enum ConnectionType {
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  BLUETOOTH = 'bluetooth',
  LORA = 'lora',
  ZIGBEE = 'zigbee',
  ETHERNET = 'ethernet',
  SATELLITE = 'satellite',
  NFC = 'nfc',
}

@Entity('iot_devices')
@Index(['deviceId'], { unique: true })
@Index(['status', 'type'])
@Index(['location', 'status'])
@Index(['lastDataReceived'])
@Index(['createdAt', 'updatedAt'])
export class IoTDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @IsNotEmpty()
  deviceId: string;

  @Column({ length: 200 })
  @IsNotEmpty()
  name: string;

  @Column({
    type: 'enum',
    enum: DeviceType,
  })
  type: DeviceType;

  @Column({
    type: 'enum',
    enum: DeviceStatus,
    default: DeviceStatus.ACTIVE,
  })
  status: DeviceStatus;

  @Column({ length: 100, nullable: true })
  manufacturer: string;

  @Column({ length: 100, nullable: true })
  model: string;

  @Column({ length: 50, nullable: true })
  firmwareVersion: string;

  @Column({ length: 50, nullable: true })
  hardwareVersion: string;

  @Column({ length: 50, nullable: true })
  serialNumber: string;

  // Network Configuration
  @Column({
    type: 'enum',
    enum: ConnectionType,
    default: ConnectionType.WIFI,
  })
  connectionType: ConnectionType;

  @Column({ length: 17, nullable: true })
  @IsMAC()
  macAddress: string;

  @Column({ length: 45, nullable: true })
  @IsIP()
  ipAddress: string;

  @Column({ type: 'int', nullable: true })
  port: number;

  @Column({ type: 'json', nullable: true })
  networkConfig: {
    ssid?: string;
    apn?: string;
    signalStrength?: number;
    dataUsage?: number;
    lastConnectionCheck?: Date;
  };

  // Physical Location
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  altitude: number;

  @Column({ length: 200, nullable: true })
  location: string;

  @Column({ length: 100, nullable: true })
  zone: string;

  @Column({ length: 100, nullable: true })
  facility: string;

  // Asset Assignment
  @Column({ type: 'json', nullable: true })
  assignedAssets: Array<{
    assetType: 'shipment' | 'container' | 'vehicle' | 'warehouse' | 'equipment';
    assetId: string;
    assetName: string;
    assignedAt: Date;
    assignedBy: string;
  }>;

  // Sensor Specifications
  @Column({ type: 'json', nullable: true })
  sensorSpecs: {
    measurementRange?: {
      min: number;
      max: number;
      unit: string;
    };
    accuracy?: string;
    resolution?: string;
    calibrationRequired?: boolean;
    calibrationInterval?: number; // days
    lastCalibration?: Date;
    nextCalibration?: Date;
  };

  // Data Configuration
  @Column({ type: 'int', default: 300 })
  reportingInterval: number; // seconds

  @Column({ type: 'json', nullable: true })
  dataSchema: Record<string, {
    type: 'number' | 'string' | 'boolean' | 'object';
    unit?: string;
    range?: { min: number; max: number };
    required: boolean;
  }>;

  @Column({ type: 'json', nullable: true })
  alertThresholds: Record<string, {
    parameter: string;
    warningMin?: number;
    warningMax?: number;
    criticalMin?: number;
    criticalMax?: number;
    unit: string;
  }>;

  // Latest Data
  @Column({ type: 'timestamp', nullable: true })
  lastDataReceived: Date;

  @Column({ type: 'json', nullable: true })
  lastKnownData: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  currentAlerts: Array<{
    id: string;
    severity: 'info' | 'warning' | 'critical';
    parameter: string;
    value: number;
    threshold: number;
    message: string;
    triggeredAt: Date;
    acknowledged: boolean;
  }>;

  // Performance Metrics
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  batteryLevel: number; // percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  signalStrength: number; // percentage or dBm

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  dataTransmitted: number; // MB

  @Column({ type: 'int', default: 0 })
  uptime: number; // seconds

  @Column({ type: 'int', default: 0 })
  messagesSent: number;

  @Column({ type: 'int', default: 0 })
  messagesReceived: number;

  @Column({ type: 'int', default: 0 })
  errorCount: number;

  // Maintenance Information
  @Column({ type: 'timestamp', nullable: true })
  lastMaintenanceDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextMaintenanceDate: Date;

  @Column({ type: 'json', nullable: true })
  maintenanceSchedule: Array<{
    type: 'battery_replacement' | 'calibration' | 'firmware_update' | 'physical_inspection';
    intervalDays: number;
    lastPerformed?: Date;
    nextDue?: Date;
    responsible: string;
  }>;

  @Column({ type: 'json', nullable: true })
  maintenanceHistory: Array<{
    date: Date;
    type: string;
    performedBy: string;
    description: string;
    partsReplaced?: string[];
    cost?: number;
    nextScheduled?: Date;
  }>;

  // Security and Access Control
  @Column({ type: 'json', nullable: true })
  securityConfig: {
    encryptionEnabled: boolean;
    authenticationMethod: string;
    certificateExpiry?: Date;
    lastSecurityUpdate?: Date;
    accessControlList?: Array<{
      userId: string;
      permissions: string[];
      grantedAt: Date;
    }>;
  };

  // Integration Settings
  @Column({ type: 'json', nullable: true })
  integrationSettings: {
    mqttBroker?: string;
    apiEndpoint?: string;
    webhookUrl?: string;
    dataFormat: 'json' | 'xml' | 'csv';
    compressionEnabled: boolean;
  };

  // AI and Edge Computing
  @Column({ type: 'json', nullable: true })
  edgeComputing: {
    enabled: boolean;
    capabilities: string[];
    models: Array<{
      name: string;
      version: string;
      type: 'prediction' | 'classification' | 'anomaly_detection';
      accuracy: number;
      lastTrained: Date;
    }>;
    processingPower: string;
  };

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 50, nullable: true })
  installedBy: string;

  @Column({ length: 50, nullable: true })
  updatedBy: string;

  // Computed Properties
  get isOnline(): boolean {
    if (!this.lastDataReceived) return false;
    const threshold = this.reportingInterval * 2 * 1000; // 2x reporting interval in ms
    return Date.now() - this.lastDataReceived.getTime() < threshold;
  }

  get batteryWarning(): boolean {
    return this.batteryLevel < 20;
  }

  get needsMaintenance(): boolean {
    if (!this.nextMaintenanceDate) return false;
    return new Date() >= this.nextMaintenanceDate;
  }

  get hasActiveAlerts(): boolean {
    return this.currentAlerts?.some(alert => !alert.acknowledged) || false;
  }

  get criticalAlertsCount(): number {
    return this.currentAlerts?.filter(alert => alert.severity === 'critical' && !alert.acknowledged).length || 0;
  }

  // Methods
  updateStatus(newStatus: DeviceStatus, updatedBy?: string): void {
    this.status = newStatus;
    this.updatedBy = updatedBy || 'system';
  }

  recordData(data: Record<string, any>): void {
    this.lastDataReceived = new Date();
    this.lastKnownData = data;
    this.messagesSent++;
    
    // Check thresholds and generate alerts
    this.checkAlertThresholds(data);
  }

  private checkAlertThresholds(data: Record<string, any>): void {
    if (!this.alertThresholds || !this.currentAlerts) {
      this.currentAlerts = [];
      return;
    }

    Object.keys(this.alertThresholds).forEach(parameter => {
      const threshold = this.alertThresholds[parameter];
      const value = data[parameter];
      
      if (value !== undefined && value !== null) {
        const alertId = `${parameter}_${Date.now()}`;
        
        if ((threshold.criticalMin !== undefined && value < threshold.criticalMin) ||
            (threshold.criticalMax !== undefined && value > threshold.criticalMax)) {
          this.currentAlerts.push({
            id: alertId,
            severity: 'critical',
            parameter,
            value,
            threshold: threshold.criticalMin || threshold.criticalMax,
            message: `${parameter} value ${value} ${threshold.unit} is in critical range`,
            triggeredAt: new Date(),
            acknowledged: false,
          });
        } else if ((threshold.warningMin !== undefined && value < threshold.warningMin) ||
                   (threshold.warningMax !== undefined && value > threshold.warningMax)) {
          this.currentAlerts.push({
            id: alertId,
            severity: 'warning',
            parameter,
            value,
            threshold: threshold.warningMin || threshold.warningMax,
            message: `${parameter} value ${value} ${threshold.unit} is in warning range`,
            triggeredAt: new Date(),
            acknowledged: false,
          });
        }
      }
    });
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string): void {
    const alert = this.currentAlerts?.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  scheduleMaintenance(type: string, dueDate: Date, responsible: string): void {
    if (!this.maintenanceSchedule) {
      this.maintenanceSchedule = [];
    }
    
    this.maintenanceSchedule.push({
      type: type as any,
      intervalDays: 0,
      nextDue: dueDate,
      responsible,
    });
  }

  performMaintenance(type: string, performedBy: string, description: string, cost?: number): void {
    const now = new Date();
    
    if (!this.maintenanceHistory) {
      this.maintenanceHistory = [];
    }
    
    this.maintenanceHistory.push({
      date: now,
      type,
      performedBy,
      description,
      cost,
    });
    
    this.lastMaintenanceDate = now;
  }
}
