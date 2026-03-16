// Industry 5.0 ERP Backend - Equipment Entity
// Advanced equipment tracking with IoT integration and predictive analytics
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { MaintenanceWorkOrder } from './MaintenanceWorkOrder';
import { MaintenanceHistory } from './MaintenanceHistory';
import { EquipmentSensor } from './EquipmentSensor';
import { MaintenanceSchedule } from './MaintenanceSchedule';
import { EquipmentDowntime } from './EquipmentDowntime';

export enum EquipmentStatus {
  OPERATIONAL = 'OPERATIONAL',
  MAINTENANCE = 'MAINTENANCE',
  DOWN = 'DOWN',
  STANDBY = 'STANDBY',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export enum EquipmentType {
  PRODUCTION_MACHINE = 'PRODUCTION_MACHINE',
  ROBOT = 'ROBOT',
  CONVEYOR = 'CONVEYOR',
  HVAC = 'HVAC',
  POWER_SYSTEM = 'POWER_SYSTEM',
  SAFETY_SYSTEM = 'SAFETY_SYSTEM',
  MEASURING_DEVICE = 'MEASURING_DEVICE',
  TOOL = 'TOOL',
}

export enum CriticalityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('equipment')
@Index(['facilityId', 'status'])
@Index(['equipmentType', 'criticalityLevel'])
@Index(['serialNumber'], { unique: true })
export class Equipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  equipmentCode: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: EquipmentType })
  equipmentType: EquipmentType;

  @Column({ type: 'varchar', length: 100 })
  manufacturer: string;

  @Column({ type: 'varchar', length: 100 })
  model: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  serialNumber: string;

  @Column({ type: 'uuid' })
  @Index()
  facilityId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  workCellId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  productionLineId: string;

  @Column({ type: 'enum', enum: EquipmentStatus, default: EquipmentStatus.OPERATIONAL })
  @Index()
  status: EquipmentStatus;

  @Column({ type: 'enum', enum: CriticalityLevel, default: CriticalityLevel.MEDIUM })
  @Index()
  criticalityLevel: CriticalityLevel;

  @Column({ type: 'date' })
  installationDate: Date;

  @Column({ type: 'date', nullable: true })
  warrantyExpiry: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  acquisitionCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  replacementCost: number;

  @Column({ type: 'int', default: 0 })
  operatingHours: number;

  @Column({ type: 'int', default: 0 })
  totalCycles: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  currentEfficiency: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  baselineEfficiency: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  availability: number;

  @Column({ type: 'json', nullable: true })
  specifications: {
    power?: number; // kW
    voltage?: number; // V
    frequency?: number; // Hz
    weight?: number; // kg
    dimensions?: { length: number; width: number; height: number };
    capacity?: number;
    maxSpeed?: number;
    operatingTemperature?: { min: number; max: number };
    customSpecs?: Record<string, any>;
  };

  @Column({ type: 'json', nullable: true })
  operationalLimits: {
    maxTemperature?: number;
    maxPressure?: number;
    maxVibration?: number;
    maxLoad?: number;
    minEfficiency?: number;
    maxRunTime?: number; // hours
    customLimits?: Record<string, any>;
  };

  @Column({ type: 'json', nullable: true })
  maintenanceParameters: {
    plannedMaintenanceInterval?: number; // hours
    criticalMaintenanceThreshold?: number; // %
    sparePartsCriticality?: string[];
    maintenanceComplexity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXPERT';
    estimatedMaintenanceTime?: number; // hours
    requiredCertifications?: string[];
  };

  @Column({ type: 'json', nullable: true })
  iotConfiguration: {
    enabled: boolean;
    gatewayId?: string;
    sensors?: string[];
    dataCollectionInterval?: number; // seconds
    alertThresholds?: Record<string, { min?: number; max?: number; critical?: boolean }>;
  };

  @Column({ type: 'json', nullable: true })
  digitalTwinConfiguration: {
    enabled: boolean;
    twinId?: string;
    simulationEnabled?: boolean;
    predictionHorizon?: number; // hours
    modelAccuracy?: number;
  };

  @Column({ type: 'date', nullable: true })
  lastMaintenanceDate: Date;

  @Column({ type: 'date', nullable: true })
  nextScheduledMaintenance: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastHealthCheck: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  healthScore: number; // 0-100

  @Column({ type: 'json', nullable: true })
  riskFactors: {
    factor: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    probability: number; // 0-1
    impact: string;
    mitigationStrategy?: string;
  }[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  parentEquipmentId: string;

  @Column({ type: 'json', nullable: true })
  location: {
    building?: string;
    floor?: number;
    room?: string;
    coordinates?: { x: number; y: number; z: number };
    accessInstructions?: string;
  };

  @Column({ type: 'json', nullable: true })
  documentation: {
    manualUrl?: string;
    schematicsUrl?: string;
    videoTutorialUrls?: string[];
    maintenanceGuideUrl?: string;
    troubleshootingGuideUrl?: string;
    trainingMaterialUrls?: string[];
  };

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  createdBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => MaintenanceWorkOrder, workOrder => workOrder.equipment)
  workOrders: MaintenanceWorkOrder[];

  @OneToMany(() => MaintenanceHistory, history => history.equipment)
  maintenanceHistory: MaintenanceHistory[];

  @OneToMany(() => EquipmentSensor, sensor => sensor.equipment)
  sensors: EquipmentSensor[];

  @OneToMany(() => MaintenanceSchedule, schedule => schedule.equipment)
  maintenanceSchedules: MaintenanceSchedule[];

  @OneToMany(() => EquipmentDowntime, downtime => downtime.equipment)
  downtimeRecords: EquipmentDowntime[];

  // Self-referential relationship for equipment hierarchy
  @ManyToOne(() => Equipment, { nullable: true })
  @JoinColumn({ name: 'parentEquipmentId' })
  parentEquipment: Equipment;

  @OneToMany(() => Equipment, equipment => equipment.parentEquipment)
  childEquipment: Equipment[];

  // Computed properties (would be implemented as getters in practice)
  get mtbf(): number {
    // Mean Time Between Failures calculation would go here
    return 0;
  }

  get mttr(): number {
    // Mean Time To Repair calculation would go here
    return 0;
  }

  get availabilityPercentage(): number {
    // Availability percentage calculation
    return this.availability ? this.availability * 100 : 0;
  }

  get isOverdue(): boolean {
    if (!this.nextScheduledMaintenance) return false;
    return new Date() > this.nextScheduledMaintenance;
  }

  get riskLevel(): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (!this.riskFactors || this.riskFactors.length === 0) return 'LOW';
    
    const maxSeverity = this.riskFactors.reduce((max, factor) => {
      const severityLevels = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
      return Math.max(max, severityLevels[factor.severity]);
    }, 0);

    const levels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    return levels[maxSeverity - 1] as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }
}
