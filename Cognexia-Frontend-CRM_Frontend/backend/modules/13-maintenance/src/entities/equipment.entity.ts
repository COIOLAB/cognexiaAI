import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

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
export class Equipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  equipmentCode: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: EquipmentType,
  })
  equipmentType: EquipmentType;

  @Column({
    type: 'enum',
    enum: EquipmentStatus,
    default: EquipmentStatus.OPERATIONAL,
  })
  status: EquipmentStatus;

  @Column()
  manufacturer: string;

  @Column()
  model: string;

  @Column()
  serialNumber: string;

  @Column()
  facilityId: string;

  @Column({ nullable: true })
  workCellId: string;

  @Column({ nullable: true })
  productionLineId: string;

  @Column({
    type: 'enum',
    enum: CriticalityLevel,
  })
  criticalityLevel: CriticalityLevel;

  @Column({ type: 'timestamp' })
  installationDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  warrantyExpiry: Date;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  acquisitionCost: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  replacementCost: number;

  @Column('json', { nullable: true })
  specifications: any;

  @Column('json', { nullable: true })
  operationalLimits: any;

  @Column('json', { nullable: true })
  maintenanceParameters: any;

  @Column('json', { nullable: true })
  iotConfiguration: any;

  @Column('json', { nullable: true })
  digitalTwinConfiguration: any;

  @Column('json', { nullable: true })
  location: any;

  @Column('json', { nullable: true })
  documentation: any;

  @Column('decimal', { precision: 5, scale: 2, default: 100 })
  healthScore: number;

  @Column('decimal', { precision: 5, scale: 2, default: 1.0 })
  currentEfficiency: number;

  @Column('decimal', { precision: 5, scale: 2, default: 1.0 })
  availability: number;

  @Column('int', { default: 0 })
  operatingHours: number;

  @Column('int', { default: 0 })
  totalCycles: number;

  @Column('json', { default: [] })
  riskFactors: any[];

  @Column({ type: 'timestamp', nullable: true })
  lastMaintenanceDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextMaintenanceDate: Date;

  @Column('int', { default: 0 })
  totalMaintenanceCount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalMaintenanceCost: number;

  @Column('int', { default: 0 })
  failureCount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  mtbf: number; // Mean Time Between Failures

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  mttr: number; // Mean Time To Repair

  @Column({ default: false })
  isUnderMaintenance: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
