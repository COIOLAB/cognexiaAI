/**
 * Shop Floor Station Entity
 * 
 * Represents individual manufacturing stations, work centers, and production units
 * on the shop floor with Industry 5.0 capabilities including IoT integration,
 * AI monitoring, and human-robot collaboration.
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

export type StationType = 'ASSEMBLY' | 'MACHINING' | 'INSPECTION' | 'PACKAGING' | 'TESTING' | 'WELDING' | 'PAINTING' | 'STORAGE';
export type StationStatus = 'ACTIVE' | 'IDLE' | 'MAINTENANCE' | 'ERROR' | 'OFFLINE' | 'SETUP' | 'EMERGENCY_STOP';
export type OperatingMode = 'MANUAL' | 'SEMI_AUTOMATIC' | 'AUTOMATIC' | 'AI_ASSISTED' | 'AUTONOMOUS';

@Entity('shop_floor_stations')
@Index(['companyId', 'status'])
@Index(['stationType', 'operatingMode'])
@Index(['location'])
@Index(['createdAt'])
export class ShopFloorStation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  stationName: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  stationCode: string;

  @Column({ type: 'enum', enum: ['ASSEMBLY', 'MACHINING', 'INSPECTION', 'PACKAGING', 'TESTING', 'WELDING', 'PAINTING', 'STORAGE'] })
  stationType: StationType;

  @Column({ type: 'enum', enum: ['ACTIVE', 'IDLE', 'MAINTENANCE', 'ERROR', 'OFFLINE', 'SETUP', 'EMERGENCY_STOP'] })
  status: StationStatus;

  @Column({ type: 'enum', enum: ['MANUAL', 'SEMI_AUTOMATIC', 'AUTOMATIC', 'AI_ASSISTED', 'AUTONOMOUS'] })
  operatingMode: OperatingMode;

  // Location and Layout
  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  floor: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  zone: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  coordinateX: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  coordinateY: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  coordinateZ: number;

  // Capacity and Performance
  @Column({ type: 'integer', default: 1 })
  operatorCapacity: number;

  @Column({ type: 'integer', default: 0 })
  currentOperators: number;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  maxThroughput: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  currentThroughput: number;

  @Column({ type: 'varchar', length: 50 })
  throughputUnit: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  targetEfficiency: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  currentEfficiency: number;

  // Equipment and Tooling
  @Column({ type: 'json', nullable: true })
  equipment: Array<{
    equipment_id: string;
    equipment_name: string;
    equipment_type: string;
    status: string;
    last_maintenance: Date;
    next_maintenance: Date;
    utilization: number;
  }>;

  @Column({ type: 'json', nullable: true })
  tooling: Array<{
    tool_id: string;
    tool_name: string;
    tool_type: string;
    condition: string;
    life_remaining: number;
    replacement_due: Date;
  }>;

  // IoT and Sensor Integration
  @Column({ type: 'json', nullable: true })
  iotDevices: Array<{
    device_id: string;
    device_type: string;
    device_name: string;
    connection_status: string;
    last_reading: Date;
    battery_level?: number;
    signal_strength?: number;
  }>;

  @Column({ type: 'json', nullable: true })
  sensorData: {
    temperature?: {
      current: number;
      min: number;
      max: number;
      unit: string;
      status: string;
    };
    humidity?: {
      current: number;
      min: number;
      max: number;
      unit: string;
      status: string;
    };
    pressure?: {
      current: number;
      min: number;
      max: number;
      unit: string;
      status: string;
    };
    vibration?: {
      current: number;
      threshold: number;
      unit: string;
      status: string;
    };
    noise_level?: {
      current: number;
      threshold: number;
      unit: string;
      status: string;
    };
  };

  // Safety and Compliance
  @Column({ type: 'json', nullable: true })
  safetyFeatures: {
    emergency_stops: Array<{
      stop_id: string;
      location: string;
      status: string;
      last_tested: Date;
    }>;
    safety_barriers: Array<{
      barrier_id: string;
      type: string;
      status: string;
      integrity_check: Date;
    }>;
    warning_systems: Array<{
      system_id: string;
      type: string;
      status: string;
      last_activation: Date;
    }>;
  };

  @Column({ type: 'json', nullable: true })
  complianceData: {
    certifications: string[];
    last_safety_audit: Date;
    next_safety_audit: Date;
    compliance_score: number;
    violations: Array<{
      violation_id: string;
      description: string;
      severity: string;
      resolution_status: string;
      due_date: Date;
    }>;
  };

  // Human-Robot Collaboration
  @Column({ type: 'json', nullable: true })
  roboticSystems: Array<{
    robot_id: string;
    robot_type: string;
    robot_name: string;
    status: string;
    current_task: string;
    collaboration_mode: string;
    safety_zone: {
      radius: number;
      height: number;
      status: string;
    };
  }>;

  @Column({ type: 'json', nullable: true })
  collaborationZones: Array<{
    zone_id: string;
    zone_type: string;
    boundaries: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      z_height: number;
    };
    safety_level: string;
    active_protocols: string[];
  }>;

  // AI and Analytics
  @Column({ type: 'json', nullable: true })
  aiCapabilities: {
    computer_vision: {
      enabled: boolean;
      cameras: Array<{
        camera_id: string;
        resolution: string;
        field_of_view: string;
        status: string;
      }>;
      ai_models: string[];
    };
    predictive_maintenance: {
      enabled: boolean;
      last_prediction: Date;
      risk_score: number;
      next_maintenance_window: Date;
    };
    quality_control: {
      enabled: boolean;
      inspection_rate: number;
      defect_detection_accuracy: number;
      last_model_update: Date;
    };
  };

  @Column({ type: 'json', nullable: true })
  performanceAnalytics: {
    oee: {
      availability: number;
      performance: number;
      quality: number;
      overall: number;
    };
    cycle_times: {
      target: number;
      actual_average: number;
      variance: number;
      unit: string;
    };
    quality_metrics: {
      first_pass_yield: number;
      defect_rate: number;
      rework_rate: number;
    };
    energy_consumption: {
      current_usage: number;
      daily_average: number;
      efficiency_score: number;
      unit: string;
    };
  };

  // Production Planning Integration
  @Column({ type: 'json', nullable: true })
  productionSchedule: {
    current_job: {
      job_id: string;
      product_id: string;
      quantity_planned: number;
      quantity_completed: number;
      start_time: Date;
      estimated_completion: Date;
    };
    upcoming_jobs: Array<{
      job_id: string;
      product_id: string;
      quantity: number;
      scheduled_start: Date;
      estimated_duration: number;
    }>;
    setup_requirements: {
      current_setup: string;
      next_setup: string;
      changeover_time: number;
      setup_complexity: string;
    };
  };

  // Maintenance and Lifecycle
  @Column({ type: 'json', nullable: true })
  maintenanceData: {
    last_maintenance: Date;
    next_scheduled_maintenance: Date;
    maintenance_type: string;
    maintenance_duration: number;
    maintenance_cost: number;
    preventive_score: number;
    issues_log: Array<{
      issue_id: string;
      description: string;
      severity: string;
      reported_date: Date;
      resolution_date?: Date;
      cost?: number;
    }>;
  };

  // Digital Twin Integration
  @Column({ type: 'json', nullable: true })
  digitalTwinData: {
    twin_id: string;
    synchronization_status: string;
    last_sync: Date;
    simulation_models: string[];
    real_time_data_feeds: string[];
    prediction_accuracy: number;
  };

  // Integration Metadata
  @Column({ type: 'json', nullable: true })
  integrationData: {
    erp_station_id: string;
    mes_station_id: string;
    scada_node_id: string;
    plc_address: string;
    last_sync: Date;
    sync_status: string;
  };

  @Column({ type: 'varchar', length: 50 })
  createdBy: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  lastUpdatedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // Computed Properties
  get isOperational(): boolean {
    return ['ACTIVE', 'IDLE', 'SETUP'].includes(this.status);
  }

  get utilizationRate(): number {
    return this.maxThroughput > 0 ? (this.currentThroughput / this.maxThroughput) * 100 : 0;
  }

  get operatorUtilization(): number {
    return this.operatorCapacity > 0 ? (this.currentOperators / this.operatorCapacity) * 100 : 0;
  }

  get oeeScore(): number {
    return this.performanceAnalytics?.oee?.overall || 0;
  }

  get safetyStatus(): 'SAFE' | 'WARNING' | 'CRITICAL' | 'EMERGENCY' {
    if (this.status === 'EMERGENCY_STOP') return 'EMERGENCY';
    if (this.status === 'ERROR') return 'CRITICAL';
    
    const complianceScore = this.complianceData?.compliance_score || 100;
    if (complianceScore < 70) return 'CRITICAL';
    if (complianceScore < 85) return 'WARNING';
    return 'SAFE';
  }

  get maintenanceUrgency(): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const predictiveScore = this.aiCapabilities?.predictive_maintenance?.risk_score || 0;
    
    if (predictiveScore >= 0.8) return 'CRITICAL';
    if (predictiveScore >= 0.6) return 'HIGH';
    if (predictiveScore >= 0.3) return 'MEDIUM';
    return 'LOW';
  }

  get isSmartStation(): boolean {
    return this.operatingMode === 'AI_ASSISTED' || this.operatingMode === 'AUTONOMOUS';
  }

  // Business Methods
  updateStatus(newStatus: StationStatus, userId: string, reason?: string): void {
    this.status = newStatus;
    this.lastUpdatedBy = userId;
    
    // Log status change
    if (!this.notes) this.notes = '';
    this.notes += `\n[${new Date().toISOString()}] Status changed to ${newStatus} by ${userId}${reason ? ': ' + reason : ''}`;
  }

  addOperator(userId: string): boolean {
    if (this.currentOperators < this.operatorCapacity) {
      this.currentOperators++;
      this.lastUpdatedBy = userId;
      return true;
    }
    return false;
  }

  removeOperator(userId: string): boolean {
    if (this.currentOperators > 0) {
      this.currentOperators--;
      this.lastUpdatedBy = userId;
      return true;
    }
    return false;
  }

  updateThroughput(throughput: number): void {
    this.currentThroughput = throughput;
    this.currentEfficiency = this.maxThroughput > 0 ? (throughput / this.maxThroughput) * 100 : 0;
  }

  addMaintenanceIssue(issue: any): void {
    if (!this.maintenanceData) {
      this.maintenanceData = {
        last_maintenance: new Date(),
        next_scheduled_maintenance: new Date(),
        maintenance_type: 'PREVENTIVE',
        maintenance_duration: 0,
        maintenance_cost: 0,
        preventive_score: 100,
        issues_log: [],
      };
    }

    this.maintenanceData.issues_log.push({
      issue_id: `ISSUE_${Date.now()}`,
      description: issue.description,
      severity: issue.severity || 'MEDIUM',
      reported_date: new Date(),
      ...issue,
    });
  }

  calculateOEE(): number {
    if (!this.performanceAnalytics?.oee) return 0;
    
    const { availability, performance, quality } = this.performanceAnalytics.oee;
    const oee = (availability / 100) * (performance / 100) * (quality / 100) * 100;
    
    this.performanceAnalytics.oee.overall = oee;
    return oee;
  }

  updateSensorReading(sensorType: string, value: number, unit: string): void {
    if (!this.sensorData) this.sensorData = {};
    
    if (!this.sensorData[sensorType]) {
      this.sensorData[sensorType] = {
        current: value,
        min: value,
        max: value,
        unit,
        status: 'NORMAL',
      };
    } else {
      this.sensorData[sensorType].current = value;
      this.sensorData[sensorType].min = Math.min(this.sensorData[sensorType].min, value);
      this.sensorData[sensorType].max = Math.max(this.sensorData[sensorType].max, value);
    }
  }

  isInSafetyZone(x: number, y: number): boolean {
    if (!this.collaborationZones) return true;
    
    return this.collaborationZones.every(zone => {
      const inZone = x >= zone.boundaries.x1 && x <= zone.boundaries.x2 &&
                    y >= zone.boundaries.y1 && y <= zone.boundaries.y2;
      
      return !inZone || zone.safety_level === 'SAFE';
    });
  }

  requiresAttention(): boolean {
    return this.status === 'ERROR' || 
           this.status === 'EMERGENCY_STOP' ||
           this.maintenanceUrgency === 'CRITICAL' ||
           this.safetyStatus === 'CRITICAL' ||
           this.safetyStatus === 'EMERGENCY';
  }

  getProductionRate(): number {
    if (!this.productionSchedule?.current_job) return 0;
    
    const job = this.productionSchedule.current_job;
    const elapsed = Date.now() - job.start_time.getTime();
    const hoursElapsed = elapsed / (1000 * 60 * 60);
    
    return hoursElapsed > 0 ? job.quantity_completed / hoursElapsed : 0;
  }
}
