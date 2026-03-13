/**
 * IoT Device Entity
 * 
 * Represents IoT devices deployed across the shop floor including sensors,
 * actuators, controllers, and other connected equipment for Industry 5.0
 * smart manufacturing operations.
 * 
 * @version 3.0.0
 * @industry 5.0
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';

export type DeviceType = 'SENSOR' | 'ACTUATOR' | 'CONTROLLER' | 'GATEWAY' | 'CAMERA' | 'BEACON' | 'WEARABLE' | 'EDGE_COMPUTE';
export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'ERROR' | 'SLEEP' | 'CONNECTING' | 'UNKNOWN';
export type SensorType = 'TEMPERATURE' | 'HUMIDITY' | 'PRESSURE' | 'VIBRATION' | 'SOUND' | 'LIGHT' | 'MOTION' | 'PROXIMITY' | 'FLOW' | 'LEVEL';
export type CommunicationProtocol = 'WIFI' | 'BLUETOOTH' | 'ZIGBEE' | 'LORA' | 'ETHERNET' | 'MODBUS' | 'PROFINET' | 'OPC_UA' | '5G' | 'MQTT';

@Entity('iot_devices')
@Index(['companyId', 'deviceType', 'status'])
@Index(['stationId'])
@Index(['networkAddress'])
@Index(['lastSeen'])
@Index(['createdAt'])
export class IoTDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  companyId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  stationId: string;

  @Column({ type: 'varchar', length: 255 })
  deviceName: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  deviceId: string;

  @Column({ type: 'enum', enum: ['SENSOR', 'ACTUATOR', 'CONTROLLER', 'GATEWAY', 'CAMERA', 'BEACON', 'WEARABLE', 'EDGE_COMPUTE'] })
  deviceType: DeviceType;

  @Column({ type: 'enum', enum: ['ONLINE', 'OFFLINE', 'MAINTENANCE', 'ERROR', 'SLEEP', 'CONNECTING', 'UNKNOWN'] })
  status: DeviceStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  manufacturer: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  model: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  firmwareVersion: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  hardwareVersion: string;

  // Network Configuration
  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 17, nullable: true })
  macAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  networkAddress: string;

  @Column({ type: 'enum', enum: ['WIFI', 'BLUETOOTH', 'ZIGBEE', 'LORA', 'ETHERNET', 'MODBUS', 'PROFINET', 'OPC_UA', '5G', 'MQTT'] })
  communicationProtocol: CommunicationProtocol;

  @Column({ type: 'integer', nullable: true })
  port: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  endpoint: string;

  // Physical Location
  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  altitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  coordinateX: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  coordinateY: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  coordinateZ: number;

  // Device Specifications
  @Column({ type: 'json', nullable: true })
  specifications: {
    power_consumption?: number;
    operating_voltage?: number;
    operating_temperature_min?: number;
    operating_temperature_max?: number;
    operating_humidity_min?: number;
    operating_humidity_max?: number;
    measurement_range?: {
      min: number;
      max: number;
      unit: string;
    };
    accuracy?: number;
    resolution?: number;
    response_time?: number;
    sampling_rate?: number;
  };

  // Sensor-Specific Configuration
  @Column({ type: 'enum', enum: ['TEMPERATURE', 'HUMIDITY', 'PRESSURE', 'VIBRATION', 'SOUND', 'LIGHT', 'MOTION', 'PROXIMITY', 'FLOW', 'LEVEL'], nullable: true })
  sensorType: SensorType;

  @Column({ type: 'json', nullable: true })
  sensorConfiguration: {
    measurement_unit: string;
    calibration_date?: Date;
    calibration_factor?: number;
    threshold_high?: number;
    threshold_low?: number;
    alert_enabled?: boolean;
    data_logging?: boolean;
    sampling_interval?: number;
  };

  // Connectivity and Health
  @Column({ type: 'timestamp', nullable: true })
  lastSeen: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastDataReceived: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  signalStrength: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  batteryLevel: number;

  @Column({ type: 'integer', default: 0 })
  uptime: number; // in seconds

  @Column({ type: 'integer', default: 0 })
  dataPacketsReceived: number;

  @Column({ type: 'integer', default: 0 })
  dataPacketsLost: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  dataReliability: number;

  // Current Readings and Data
  @Column({ type: 'json', nullable: true })
  currentReadings: {
    timestamp: Date;
    values: Array<{
      parameter: string;
      value: number;
      unit: string;
      status: string;
    }>;
    quality_score: number;
  };

  @Column({ type: 'json', nullable: true })
  historicalData: Array<{
    timestamp: Date;
    readings: Array<{
      parameter: string;
      value: number;
      unit: string;
    }>;
  }>;

  // Alerts and Notifications
  @Column({ type: 'json', nullable: true })
  alertConfiguration: {
    enabled: boolean;
    thresholds: Array<{
      parameter: string;
      condition: 'ABOVE' | 'BELOW' | 'EQUALS' | 'NOT_EQUALS';
      value: number;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      notification_channels: string[];
    }>;
    maintenance_alerts: boolean;
    offline_alerts: boolean;
    battery_low_threshold: number;
  };

  @Column({ type: 'json', nullable: true })
  activeAlerts: Array<{
    alert_id: string;
    alert_type: string;
    severity: string;
    message: string;
    triggered_at: Date;
    acknowledged: boolean;
    acknowledged_by?: string;
    acknowledged_at?: Date;
  }>;

  // Maintenance and Lifecycle
  @Column({ type: 'json', nullable: true })
  maintenanceSchedule: {
    last_maintenance: Date;
    next_maintenance: Date;
    maintenance_interval: number; // in days
    maintenance_type: string;
    maintenance_instructions: string;
  };

  @Column({ type: 'json', nullable: true })
  deviceHealth: {
    overall_score: number;
    connectivity_score: number;
    data_quality_score: number;
    performance_score: number;
    issues: Array<{
      issue_type: string;
      description: string;
      severity: string;
      detected_at: Date;
      resolved: boolean;
    }>;
  };

  // Security and Access Control
  @Column({ type: 'json', nullable: true })
  securityConfiguration: {
    encryption_enabled: boolean;
    authentication_method: string;
    access_token?: string;
    certificate_expiry?: Date;
    last_security_update: Date;
    security_vulnerabilities: Array<{
      vulnerability_id: string;
      severity: string;
      description: string;
      patched: boolean;
    }>;
  };

  // Edge Computing Capabilities
  @Column({ type: 'json', nullable: true })
  edgeCapabilities: {
    computing_power: string;
    storage_capacity: string;
    ai_models_deployed: string[];
    local_processing_enabled: boolean;
    data_preprocessing: boolean;
    edge_analytics: boolean;
    latency_requirements: number; // in ms
  };

  // Integration and APIs
  @Column({ type: 'json', nullable: true })
  integrationData: {
    api_endpoints: string[];
    data_format: string;
    update_frequency: number; // in seconds
    external_systems: Array<{
      system_name: string;
      connection_status: string;
      last_sync: Date;
    }>;
    webhook_urls: string[];
  };

  @Column({ type: 'varchar', length: 50 })
  installedBy: string;

  @Column({ type: 'timestamp' })
  installationDate: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  lastModifiedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // Computed Properties
  get isOnline(): boolean {
    return this.status === 'ONLINE';
  }

  get connectionQuality(): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' {
    if (!this.signalStrength) return 'POOR';
    
    if (this.signalStrength >= 80) return 'EXCELLENT';
    if (this.signalStrength >= 60) return 'GOOD';
    if (this.signalStrength >= 40) return 'FAIR';
    return 'POOR';
  }

  get dataReliabilityPercentage(): number {
    const total = this.dataPacketsReceived + this.dataPacketsLost;
    return total > 0 ? (this.dataPacketsReceived / total) * 100 : 0;
  }

  get batteryStatus(): 'FULL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL' | 'UNKNOWN' {
    if (!this.batteryLevel) return 'UNKNOWN';
    
    if (this.batteryLevel >= 80) return 'FULL';
    if (this.batteryLevel >= 60) return 'HIGH';
    if (this.batteryLevel >= 40) return 'MEDIUM';
    if (this.batteryLevel >= 20) return 'LOW';
    return 'CRITICAL';
  }

  get isMaintenanceDue(): boolean {
    if (!this.maintenanceSchedule?.next_maintenance) return false;
    return this.maintenanceSchedule.next_maintenance <= new Date();
  }

  get healthStatus(): 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN' {
    const score = this.deviceHealth?.overall_score;
    if (!score) return 'UNKNOWN';
    
    if (score >= 80) return 'HEALTHY';
    if (score >= 60) return 'WARNING';
    return 'CRITICAL';
  }

  get hasActiveAlerts(): boolean {
    return this.activeAlerts?.some(alert => !alert.acknowledged) || false;
  }

  get criticalAlerts(): number {
    return this.activeAlerts?.filter(alert => 
      alert.severity === 'CRITICAL' && !alert.acknowledged
    ).length || 0;
  }

  // Business Methods
  updateStatus(newStatus: DeviceStatus, userId: string): void {
    this.status = newStatus;
    this.lastModifiedBy = userId;
    this.lastSeen = new Date();
    
    // Update device health based on status
    this.updateDeviceHealth();
  }

  recordDataReading(readings: Array<{ parameter: string; value: number; unit: string }>): void {
    this.currentReadings = {
      timestamp: new Date(),
      values: readings.map(reading => ({
        ...reading,
        status: this.validateReading(reading.parameter, reading.value),
      })),
      quality_score: this.calculateDataQuality(readings),
    };

    this.lastDataReceived = new Date();
    this.dataPacketsReceived++;
    
    // Add to historical data (keep last 100 readings)
    if (!this.historicalData) this.historicalData = [];
    
    this.historicalData.push({
      timestamp: new Date(),
      readings: readings,
    });

    // Keep only last 100 readings
    if (this.historicalData.length > 100) {
      this.historicalData = this.historicalData.slice(-100);
    }

    // Check for alert conditions
    this.checkAlertConditions(readings);
  }

  addAlert(alertType: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', message: string): string {
    if (!this.activeAlerts) this.activeAlerts = [];

    const alertId = `ALERT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.activeAlerts.push({
      alert_id: alertId,
      alert_type: alertType,
      severity,
      message,
      triggered_at: new Date(),
      acknowledged: false,
    });

    return alertId;
  }

  acknowledgeAlert(alertId: string, userId: string): boolean {
    const alert = this.activeAlerts?.find(a => a.alert_id === alertId);
    
    if (alert && !alert.acknowledged) {
      alert.acknowledged = true;
      alert.acknowledged_by = userId;
      alert.acknowledged_at = new Date();
      return true;
    }
    
    return false;
  }

  updateBatteryLevel(level: number): void {
    this.batteryLevel = Math.max(0, Math.min(100, level));
    
    // Check for low battery alert
    const threshold = this.alertConfiguration?.battery_low_threshold || 20;
    if (level <= threshold && this.alertConfiguration?.enabled) {
      this.addAlert('BATTERY_LOW', 'HIGH', `Battery level is ${level}%, below threshold of ${threshold}%`);
    }
  }

  updateSignalStrength(strength: number): void {
    this.signalStrength = Math.max(0, Math.min(100, strength));
    this.updateDeviceHealth();
  }

  performMaintenance(userId: string, maintenanceType: string, notes?: string): void {
    if (!this.maintenanceSchedule) {
      this.maintenanceSchedule = {
        last_maintenance: new Date(),
        next_maintenance: new Date(),
        maintenance_interval: 30,
        maintenance_type: maintenanceType,
        maintenance_instructions: '',
      };
    }

    this.maintenanceSchedule.last_maintenance = new Date();
    this.maintenanceSchedule.maintenance_type = maintenanceType;
    
    // Calculate next maintenance date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + this.maintenanceSchedule.maintenance_interval);
    this.maintenanceSchedule.next_maintenance = nextDate;

    this.lastModifiedBy = userId;
    
    if (notes) {
      if (!this.notes) this.notes = '';
      this.notes += `\n[${new Date().toISOString()}] Maintenance performed: ${maintenanceType} - ${notes}`;
    }

    // Reset device health after maintenance
    this.updateDeviceHealth();
  }

  calibrateSensor(calibrationFactor: number, userId: string): void {
    if (!this.sensorConfiguration) {
      this.sensorConfiguration = {
        measurement_unit: '',
        calibration_date: new Date(),
        calibration_factor: calibrationFactor,
      };
    } else {
      this.sensorConfiguration.calibration_date = new Date();
      this.sensorConfiguration.calibration_factor = calibrationFactor;
    }

    this.lastModifiedBy = userId;
  }

  // Private helper methods
  private validateReading(parameter: string, value: number): string {
    if (!this.sensorConfiguration) return 'UNKNOWN';

    const { threshold_high, threshold_low } = this.sensorConfiguration;
    
    if (threshold_high && value > threshold_high) return 'HIGH';
    if (threshold_low && value < threshold_low) return 'LOW';
    return 'NORMAL';
  }

  private calculateDataQuality(readings: Array<{ parameter: string; value: number; unit: string }>): number {
    if (!readings.length) return 0;

    // Basic data quality score based on completeness and validity
    const validReadings = readings.filter(r => 
      r.value !== null && 
      r.value !== undefined && 
      !isNaN(r.value)
    );

    const completeness = (validReadings.length / readings.length) * 100;
    
    // Additional quality checks could be added here
    return Math.min(100, completeness);
  }

  private checkAlertConditions(readings: Array<{ parameter: string; value: number; unit: string }>): void {
    if (!this.alertConfiguration?.enabled || !this.alertConfiguration?.thresholds) return;

    for (const reading of readings) {
      const threshold = this.alertConfiguration.thresholds.find(t => t.parameter === reading.parameter);
      
      if (!threshold) continue;

      let alertTriggered = false;
      
      switch (threshold.condition) {
        case 'ABOVE':
          alertTriggered = reading.value > threshold.value;
          break;
        case 'BELOW':
          alertTriggered = reading.value < threshold.value;
          break;
        case 'EQUALS':
          alertTriggered = reading.value === threshold.value;
          break;
        case 'NOT_EQUALS':
          alertTriggered = reading.value !== threshold.value;
          break;
      }

      if (alertTriggered) {
        this.addAlert(
          `THRESHOLD_${threshold.condition}`,
          threshold.severity,
          `${reading.parameter} value ${reading.value} ${reading.unit} is ${threshold.condition.toLowerCase()} threshold ${threshold.value}`
        );
      }
    }
  }

  private updateDeviceHealth(): void {
    if (!this.deviceHealth) {
      this.deviceHealth = {
        overall_score: 100,
        connectivity_score: 100,
        data_quality_score: 100,
        performance_score: 100,
        issues: [],
      };
    }

    // Calculate connectivity score
    this.deviceHealth.connectivity_score = this.isOnline ? 
      Math.min(100, (this.signalStrength || 0) + (this.dataReliabilityPercentage * 0.5)) : 0;

    // Calculate data quality score
    this.deviceHealth.data_quality_score = this.currentReadings?.quality_score || 50;

    // Calculate performance score based on uptime and battery
    const batteryScore = this.batteryLevel || 100;
    const uptimeScore = Math.min(100, this.uptime / (24 * 60 * 60) * 10); // 10 points per day of uptime
    this.deviceHealth.performance_score = (batteryScore + uptimeScore) / 2;

    // Calculate overall score
    this.deviceHealth.overall_score = (
      this.deviceHealth.connectivity_score * 0.4 +
      this.deviceHealth.data_quality_score * 0.3 +
      this.deviceHealth.performance_score * 0.3
    );
  }
}
