import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, IsObject, IsArray } from 'class-validator';
import { Organization } from '../core/Organization.model';
import { User } from '../core/User.model';

// Enums
export enum ProductionProcessType {
  ASSEMBLY = 'assembly',
  MACHINING = 'machining',
  QUALITY_CONTROL = 'quality_control',
  PACKAGING = 'packaging',
  CUSTOM = 'custom'
}

export enum ProductionProcessStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ProductionLineStatus {
  OPERATIONAL = 'operational',
  MAINTENANCE = 'maintenance',
  OFFLINE = 'offline',
  SETUP = 'setup'
}

export enum EquipmentStatus {
  OPERATIONAL = 'operational',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  OFFLINE = 'offline'
}

export enum DigitalTwinType {
  PROCESS = 'process',
  LINE = 'line',
  EQUIPMENT = 'equipment',
  PRODUCT = 'product',
  FACILITY = 'facility'
}

export enum WorkOrderType {
  PRODUCTION = 'production',
  MAINTENANCE = 'maintenance',
  QUALITY = 'quality',
  SETUP = 'setup'
}

export enum WorkOrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Production Process Entity
 * Represents manufacturing processes and workflows
 */
@Entity('production_processes')
@Index(['organizationId', 'status'])
@Index(['processType', 'status'])
@Index(['createdAt'])
export class ProductionProcess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: ProductionProcessType,
    default: ProductionProcessType.ASSEMBLY
  })
  @IsEnum(ProductionProcessType)
  processType: ProductionProcessType;

  @Column({ 
    type: 'enum', 
    enum: ProductionProcessStatus,
    default: ProductionProcessStatus.DRAFT
  })
  @IsEnum(ProductionProcessStatus)
  status: ProductionProcessStatus;

  @Column({ 
    type: 'enum', 
    enum: Priority,
    default: Priority.NORMAL
  })
  @IsEnum(Priority)
  priority: Priority;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  estimatedDuration: number; // in minutes

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  actualDuration: number; // in minutes

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  processSteps: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  qualityRequirements: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  resourceRequirements: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  safetyRequirements: any[];

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  efficiency: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costPerUnit: number;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  aiOptimizationSettings: any;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isTemplate: boolean;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @OneToMany(() => ProductionLine, productionLine => productionLine.primaryProcess)
  productionLines: ProductionLine[];

  @OneToMany(() => WorkOrder, workOrder => workOrder.productionProcess)
  workOrders: WorkOrder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Logic Methods
  updateEfficiency(newEfficiency: number): void {
    this.efficiency = Math.max(0, Math.min(100, newEfficiency));
    this.updatedAt = new Date();
  }

  addProcessStep(step: any): void {
    if (!this.processSteps) {
      this.processSteps = [];
    }
    this.processSteps.push({
      ...step,
      addedAt: new Date(),
      stepOrder: this.processSteps.length + 1
    });
  }

  calculateTotalEstimatedCost(quantity: number): number {
    return this.costPerUnit * quantity;
  }
}

/**
 * Production Line Entity
 * Represents manufacturing production lines
 */
@Entity('production_lines')
@Index(['organizationId', 'status'])
@Index(['facility'])
@Index(['efficiency'])
export class ProductionLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  facility: string;

  @Column({ 
    type: 'enum', 
    enum: ProductionLineStatus,
    default: ProductionLineStatus.OFFLINE
  })
  @IsEnum(ProductionLineStatus)
  status: ProductionLineStatus;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  capacity: number; // units per hour

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  currentThroughput: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  efficiency: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  oee: number; // Overall Equipment Effectiveness

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  workstations: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  operatingHours: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  maintenanceSchedule: any;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  safetyProtocols: any[];

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  aiOptimizationEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  iotSensors: any;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid', nullable: true })
  primaryProcessId: string;

  @ManyToOne(() => ProductionProcess, { nullable: true })
  @JoinColumn({ name: 'primaryProcessId' })
  primaryProcess: ProductionProcess;

  @OneToMany(() => Equipment, equipment => equipment.productionLine)
  equipment: Equipment[];

  @OneToMany(() => WorkOrder, workOrder => workOrder.productionLine)
  workOrders: WorkOrder[];

  @OneToMany(() => DigitalTwin, digitalTwin => digitalTwin.productionLine)
  digitalTwins: DigitalTwin[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Logic Methods
  calculateOEE(): number {
    // OEE = Availability × Performance × Quality
    // This is a simplified calculation
    const availability = this.status === ProductionLineStatus.OPERATIONAL ? 1 : 0;
    const performance = this.capacity > 0 ? this.currentThroughput / this.capacity : 0;
    const quality = 0.95; // Assume 95% quality rate, this should come from quality data
    
    this.oee = availability * performance * quality * 100;
    return this.oee;
  }

  updateThroughput(newThroughput: number): void {
    this.currentThroughput = Math.max(0, newThroughput);
    this.efficiency = this.capacity > 0 ? (this.currentThroughput / this.capacity) * 100 : 0;
    this.calculateOEE();
  }

  addWorkstation(workstation: any): void {
    if (!this.workstations) {
      this.workstations = [];
    }
    this.workstations.push({
      ...workstation,
      addedAt: new Date(),
      position: this.workstations.length + 1
    });
  }
}

/**
 * Equipment Entity
 * Represents manufacturing equipment and machinery
 */
@Entity('equipment')
@Index(['organizationId', 'status'])
@Index(['equipmentType'])
@Index(['serialNumber'], { unique: true })
export class Equipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @IsNotEmpty()
  serialNumber: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  equipmentType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  manufacturer: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  model: string;

  @Column({ 
    type: 'enum', 
    enum: EquipmentStatus,
    default: EquipmentStatus.OFFLINE
  })
  @IsEnum(EquipmentStatus)
  status: EquipmentStatus;

  @Column({ type: 'date', nullable: true })
  installationDate: Date;

  @Column({ type: 'date', nullable: true })
  lastMaintenanceDate: Date;

  @Column({ type: 'date', nullable: true })
  nextMaintenanceDate: Date;

  @Column({ type: 'int', default: 0 })
  operatingHours: number;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  specifications: any;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  currentMetrics: any;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  maintenanceHistory: any[];

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  iotEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  iotConfiguration: any;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid', nullable: true })
  productionLineId: string;

  @ManyToOne(() => ProductionLine, { nullable: true })
  @JoinColumn({ name: 'productionLineId' })
  productionLine: ProductionLine;

  @OneToMany(() => DigitalTwin, digitalTwin => digitalTwin.equipment)
  digitalTwins: DigitalTwin[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Logic Methods
  updateOperatingHours(hours: number): void {
    this.operatingHours += hours;
    this.updatedAt = new Date();
  }

  addMaintenanceRecord(record: any): void {
    if (!this.maintenanceHistory) {
      this.maintenanceHistory = [];
    }
    this.maintenanceHistory.push({
      ...record,
      recordedAt: new Date()
    });
    this.lastMaintenanceDate = new Date();
  }

  calculateEfficiency(): number {
    const metrics = this.currentMetrics;
    if (!metrics || !metrics.plannedOutput || !metrics.actualOutput) {
      return 0;
    }
    return (metrics.actualOutput / metrics.plannedOutput) * 100;
  }
}

/**
 * Digital Twin Entity
 * Represents digital twins of physical manufacturing entities
 */
@Entity('digital_twins')
@Index(['organizationId', 'entityType'])
@Index(['physicalEntityId'])
export class DigitalTwin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: DigitalTwinType,
    default: DigitalTwinType.EQUIPMENT
  })
  @IsEnum(DigitalTwinType)
  entityType: DigitalTwinType;

  @Column({ type: 'uuid' })
  @IsNotEmpty()
  physicalEntityId: string;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  modelConfiguration: any;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  currentState: any;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  sensors: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  simulationResults: any[];

  @Column({ type: 'int', default: 60 })
  updateFrequency: number; // seconds

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  predictiveModels: any;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid', nullable: true })
  productionLineId: string;

  @ManyToOne(() => ProductionLine, { nullable: true })
  @JoinColumn({ name: 'productionLineId' })
  productionLine: ProductionLine;

  @Column({ type: 'uuid', nullable: true })
  equipmentId: string;

  @ManyToOne(() => Equipment, { nullable: true })
  @JoinColumn({ name: 'equipmentId' })
  equipment: Equipment;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Logic Methods
  updateState(newState: any): void {
    this.currentState = {
      ...this.currentState,
      ...newState,
      lastUpdated: new Date()
    };
    this.lastSyncAt = new Date();
  }

  addSimulationResult(result: any): void {
    if (!this.simulationResults) {
      this.simulationResults = [];
    }
    this.simulationResults.push({
      ...result,
      simulatedAt: new Date()
    });
    
    // Keep only last 100 results
    if (this.simulationResults.length > 100) {
      this.simulationResults = this.simulationResults.slice(-100);
    }
  }

  runPredictiveAnalysis(): any {
    // This would integrate with AI/ML services
    return {
      predictedFailures: [],
      optimizationSuggestions: [],
      performanceForecast: {},
      generatedAt: new Date()
    };
  }
}

/**
 * Work Order Entity
 * Represents manufacturing work orders and tasks
 */
@Entity('work_orders')
@Index(['organizationId', 'status'])
@Index(['orderType', 'priority'])
@Index(['scheduledDate'])
export class WorkOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  orderNumber: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: WorkOrderType,
    default: WorkOrderType.PRODUCTION
  })
  @IsEnum(WorkOrderType)
  orderType: WorkOrderType;

  @Column({ 
    type: 'enum', 
    enum: WorkOrderStatus,
    default: WorkOrderStatus.PENDING
  })
  @IsEnum(WorkOrderStatus)
  status: WorkOrderStatus;

  @Column({ 
    type: 'enum', 
    enum: Priority,
    default: Priority.NORMAL
  })
  @IsEnum(Priority)
  priority: Priority;

  @Column({ type: 'int', nullable: true })
  quantity: number;

  @Column({ type: 'timestamp', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedDate: Date;

  @Column({ type: 'int', default: 0 })
  estimatedHours: number;

  @Column({ type: 'int', default: 0 })
  actualHours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  estimatedCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  actualCost: number;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  requiredMaterials: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  instructions: any[];

  @Column({ type: 'text', nullable: true })
  completionNotes: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  qualityScore: number;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid', nullable: true })
  productionProcessId: string;

  @ManyToOne(() => ProductionProcess, { nullable: true })
  @JoinColumn({ name: 'productionProcessId' })
  productionProcess: ProductionProcess;

  @Column({ type: 'uuid', nullable: true })
  productionLineId: string;

  @ManyToOne(() => ProductionLine, { nullable: true })
  @JoinColumn({ name: 'productionLineId' })
  productionLine: ProductionLine;

  @Column({ type: 'uuid', nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo: User;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Lifecycle hooks
  @BeforeInsert()
  generateOrderNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.orderNumber = `WO-${timestamp}-${random}`;
  }

  // Business Logic Methods
  startWork(): void {
    if (this.status === WorkOrderStatus.PENDING) {
      this.status = WorkOrderStatus.IN_PROGRESS;
      this.startDate = new Date();
    }
  }

  completeWork(completionData: any): void {
    if (this.status === WorkOrderStatus.IN_PROGRESS) {
      this.status = WorkOrderStatus.COMPLETED;
      this.completedDate = new Date();
      this.completionNotes = completionData.notes;
      this.actualHours = completionData.hours || this.actualHours;
      this.actualCost = completionData.cost || this.actualCost;
      this.qualityScore = completionData.qualityScore || this.qualityScore;
    }
  }

  calculateEfficiency(): number {
    if (this.estimatedHours === 0) return 0;
    return (this.estimatedHours / Math.max(this.actualHours, 1)) * 100;
  }
}

/**
 * Production Metrics Entity
 * Stores aggregated production metrics and KPIs
 */
@Entity('production_metrics')
@Index(['organizationId', 'metricDate'])
@Index(['entityType', 'entityId'])
export class ProductionMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  metricDate: Date;

  @Column({ type: 'varchar', length: 50 })
  entityType: string; // 'line', 'process', 'equipment'

  @Column({ type: 'uuid' })
  entityId: string;

  @Column({ type: 'int', default: 0 })
  plannedProduction: number;

  @Column({ type: 'int', default: 0 })
  actualProduction: number;

  @Column({ type: 'int', default: 0 })
  defectiveUnits: number;

  @Column({ type: 'int', default: 0 })
  downTimeMinutes: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  efficiency: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  oee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  energyConsumption: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  productionCost: number;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  additionalMetrics: any;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Logic Methods
  calculateQualityRate(): number {
    if (this.actualProduction === 0) return 0;
    return ((this.actualProduction - this.defectiveUnits) / this.actualProduction) * 100;
  }

  calculateAvailability(): number {
    const totalMinutes = 24 * 60; // Assuming 24-hour operation
    return ((totalMinutes - this.downTimeMinutes) / totalMinutes) * 100;
  }

  calculatePerformance(): number {
    if (this.plannedProduction === 0) return 0;
    return (this.actualProduction / this.plannedProduction) * 100;
  }
}
