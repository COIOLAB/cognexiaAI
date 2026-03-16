import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum FleetStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export enum FleetType {
  PRODUCTION = 'PRODUCTION',
  LOGISTICS = 'LOGISTICS',
  MAINTENANCE = 'MAINTENANCE',
  SECURITY = 'SECURITY',
  MIXED = 'MIXED',
}

@Entity('robot_fleets')
export class RobotFleet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: FleetType,
    default: FleetType.MIXED,
  })
  fleetType: FleetType;

  @Column({
    type: 'enum',
    enum: FleetStatus,
    default: FleetStatus.ACTIVE,
  })
  status: FleetStatus;

  @Column()
  facilityId: string;

  @Column({ nullable: true })
  workCellId: string;

  @Column({ nullable: true })
  productionLineId: string;

  @Column('json')
  configuration: {
    maxRobots: number;
    safetyZones: any[];
    operationalBoundaries: any;
    taskPriorities: string[];
    collisionAvoidanceParameters: any;
    communicationSettings: any;
  };

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  utilization: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  energyEfficiency: number;

  @Column('int', { default: 0 })
  collisionIncidents: number;

  @Column('decimal', { precision: 5, scale: 2, default: 100 })
  safetyScore: number;

  @Column('json', { nullable: true })
  metrics: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageTaskTime: number;
    uptime: number;
    downtime: number;
    mtbf: number;
    mttr: number;
  };

  @Column('json', { default: [] })
  robots: any[];

  @Column('json', { default: [] })
  tasks: any[];

  @Column('json', { default: [] })
  maintenanceHistory: any[];

  @Column('json', { default: [] })
  utilizationHistory: any[];

  @Column('json', { default: [] })
  efficiencyHistory: any[];

  @Column('json', { nullable: true })
  coordinationRules: {
    taskAllocation: string;
    loadBalancing: string;
    conflictResolution: string;
    emergencyProtocols: string[];
  };

  @Column('json', { nullable: true })
  integrations: {
    mes: boolean;
    erp: boolean;
    wms: boolean;
    scada: boolean;
    configurations: any;
  };

  @Column('json', { nullable: true })
  location: {
    area: string;
    coordinates: number[];
    boundaries: any[];
    dockingStations: any[];
    chargingStations: any[];
  };

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ nullable: true })
  deletedBy: string;
}
