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
  BeforeInsert
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, IsObject, IsArray } from 'class-validator';
import { Organization } from '../core/Organization.model';
import { User } from '../core/User.model';

// Enums
export enum AssetStatus {
  OPERATIONAL = 'operational',
  MAINTENANCE = 'maintenance',
  OFFLINE = 'offline',
  RETIRED = 'retired'
}

export enum AssetCriticality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AssetType {
  EQUIPMENT = 'equipment',
  MACHINERY = 'machinery',
  FACILITY = 'facility',
  VEHICLE = 'vehicle',
  TOOL = 'tool',
  INFRASTRUCTURE = 'infrastructure'
}

export enum MaintenanceWorkOrderStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum MaintenanceWorkOrderType {
  PREVENTIVE = 'preventive',
  PREDICTIVE = 'predictive',
  CORRECTIVE = 'corrective',
  EMERGENCY = 'emergency',
  INSPECTION = 'inspection'
}

export enum MaintenanceScheduleType {
  CALENDAR_BASED = 'calendar_based',
  USAGE_BASED = 'usage_based',
  CONDITION_BASED = 'condition_based'
}

export enum MaintenanceScheduleStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum SparePartStatus {
  AVAILABLE = 'available',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  ON_ORDER = 'on_order'
}

/**
 * Asset Entity
 * Represents physical assets that require maintenance
 */
@Entity('assets')
@Index(['organizationId', 'status'])
@Index(['assetType', 'criticality'])
@Index(['assetNumber'], { unique: true })
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @IsNotEmpty()
  assetNumber: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: AssetType,
    default: AssetType.EQUIPMENT
  })
  @IsEnum(AssetType)
  assetType: AssetType;

  @Column({ 
    type: 'enum', 
    enum: AssetStatus,
    default: AssetStatus.OFFLINE
  })
  @IsEnum(AssetStatus)
  status: AssetStatus;

  @Column({ 
    type: 'enum', 
    enum: AssetCriticality,
    default: AssetCriticality.MEDIUM
  })
  @IsEnum(AssetCriticality)
  criticality: AssetCriticality;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  location: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  manufacturer: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  model: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  serialNumber: string;

  @Column({ type: 'date', nullable: true })
  purchaseDate: Date;

  @Column({ type: 'date', nullable: true })
  warrantyExpiry: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  purchaseCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  currentValue: number;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  specifications: any;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  maintenanceSchedule: any;

  @Column({ type: 'int', default: 0 })
  operatingHours: number;

  @Column({ type: 'int', default: 0 })
  cycleCount: number;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  iotSensors: any[];

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  smartMaintenanceEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  smartMaintenanceConfig: any;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid', nullable: true })
  parentAssetId: string;

  @ManyToOne(() => Asset, asset => asset.childAssets, { nullable: true })
  @JoinColumn({ name: 'parentAssetId' })
  parentAsset: Asset;

  @OneToMany(() => Asset, asset => asset.parentAsset)
  childAssets: Asset[];

  @OneToMany(() => MaintenanceWorkOrder, workOrder => workOrder.asset)
  workOrders: MaintenanceWorkOrder[];

  @OneToMany(() => MaintenanceSchedule, schedule => schedule.asset)
  maintenanceSchedules: MaintenanceSchedule[];

  @OneToMany(() => PredictiveAnalysis, analysis => analysis.asset)
  predictiveAnalyses: PredictiveAnalysis[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Lifecycle hooks
  @BeforeInsert()
  generateAssetNumber() {
    if (!this.assetNumber) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      this.assetNumber = `AST-${timestamp}-${random}`;
    }
  }

  // Business Logic Methods
  updateOperatingHours(hours: number): void {
    this.operatingHours += hours;
    this.updatedAt = new Date();
  }

  updateCycleCount(cycles: number): void {
    this.cycleCount += cycles;
    this.updatedAt = new Date();
  }

  calculateDepreciation(): number {
    if (!this.purchaseDate || !this.purchaseCost) return 0;
    
    const yearsOld = (Date.now() - this.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const depreciationRate = 0.1; // 10% per year (configurable)
    const depreciated = this.purchaseCost * (1 - Math.pow(1 - depreciationRate, yearsOld));
    
    return Math.max(this.purchaseCost - depreciated, this.purchaseCost * 0.1); // Minimum 10% of original value
  }

  isMaintenanceDue(): boolean {
    if (!this.maintenanceSchedule) return false;
    
    // This would check against various maintenance triggers
    return false; // Simplified implementation
  }
}

/**
 * Maintenance Work Order Entity
 * Represents maintenance work orders and tasks
 */
@Entity('maintenance_work_orders')
@Index(['organizationId', 'status'])
@Index(['orderType', 'priority'])
@Index(['scheduledDate'])
@Index(['assetId'])
export class MaintenanceWorkOrder {
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
    enum: MaintenanceWorkOrderType,
    default: MaintenanceWorkOrderType.CORRECTIVE
  })
  @IsEnum(MaintenanceWorkOrderType)
  orderType: MaintenanceWorkOrderType;

  @Column({ 
    type: 'enum', 
    enum: MaintenanceWorkOrderStatus,
    default: MaintenanceWorkOrderStatus.OPEN
  })
  @IsEnum(MaintenanceWorkOrderStatus)
  status: MaintenanceWorkOrderStatus;

  @Column({ 
    type: 'enum', 
    enum: Priority,
    default: Priority.NORMAL
  })
  @IsEnum(Priority)
  priority: Priority;

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
  requiredSkills: string[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  requiredParts: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  safetyPrecautions: string[];

  @Column({ type: 'text', nullable: true })
  workInstructions: string;

  @Column({ type: 'text', nullable: true })
  completionNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  partsUsed: any[];

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  qualityRating: number;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  followUpRequired: boolean;

  @Column({ type: 'date', nullable: true })
  nextMaintenanceDate: Date;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid' })
  assetId: string;

  @ManyToOne(() => Asset, asset => asset.workOrders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assetId' })
  asset: Asset;

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

  @Column({ type: 'uuid', nullable: true })
  maintenanceScheduleId: string;

  @ManyToOne(() => MaintenanceSchedule, { nullable: true })
  @JoinColumn({ name: 'maintenanceScheduleId' })
  maintenanceSchedule: MaintenanceSchedule;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Lifecycle hooks
  @BeforeInsert()
  generateOrderNumber() {
    if (!this.orderNumber) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      this.orderNumber = `MWO-${timestamp}-${random}`;
    }
  }

  // Business Logic Methods
  startWork(): void {
    if (this.status === MaintenanceWorkOrderStatus.ASSIGNED) {
      this.status = MaintenanceWorkOrderStatus.IN_PROGRESS;
      this.startDate = new Date();
    }
  }

  completeWork(completionData: any): void {
    if (this.status === MaintenanceWorkOrderStatus.IN_PROGRESS) {
      this.status = MaintenanceWorkOrderStatus.COMPLETED;
      this.completedDate = new Date();
      this.completionNotes = completionData.notes;
      this.actualHours = completionData.actualHours || this.actualHours;
      this.actualCost = completionData.actualCost || this.actualCost;
      this.partsUsed = completionData.partsUsed || this.partsUsed;
      this.qualityRating = completionData.qualityRating;
      this.followUpRequired = completionData.followUpRequired || false;
      this.nextMaintenanceDate = completionData.nextMaintenanceDate;
    }
  }

  calculateEfficiency(): number {
    if (this.estimatedHours === 0) return 0;
    return (this.estimatedHours / Math.max(this.actualHours, 1)) * 100;
  }

  calculateCostVariance(): number {
    if (this.estimatedCost === 0) return 0;
    return ((this.actualCost - this.estimatedCost) / this.estimatedCost) * 100;
  }
}

/**
 * Maintenance Schedule Entity
 * Represents scheduled maintenance activities
 */
@Entity('maintenance_schedules')
@Index(['organizationId', 'status'])
@Index(['scheduleType'])
@Index(['assetId'])
@Index(['nextDueDate'])
export class MaintenanceSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  scheduleName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: MaintenanceScheduleType,
    default: MaintenanceScheduleType.CALENDAR_BASED
  })
  @IsEnum(MaintenanceScheduleType)
  scheduleType: MaintenanceScheduleType;

  @Column({ 
    type: 'enum', 
    enum: MaintenanceScheduleStatus,
    default: MaintenanceScheduleStatus.ACTIVE
  })
  @IsEnum(MaintenanceScheduleStatus)
  status: MaintenanceScheduleStatus;

  @Column({ type: 'jsonb' })
  @IsNotEmpty()
  @IsObject()
  frequency: any; // {interval: 30, unit: 'days'} or {hours: 1000} etc.

  @Column({ type: 'date', nullable: true })
  lastMaintenanceDate: Date;

  @Column({ type: 'date', nullable: true })
  nextDueDate: Date;

  @Column({ type: 'jsonb' })
  @IsNotEmpty()
  @IsArray()
  taskList: any[];

  @Column({ type: 'int', default: 0 })
  estimatedDuration: number; // minutes

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  requiredSkills: string[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  requiredParts: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  safetyRequirements: string[];

  @Column({ type: 'int', default: 0 })
  completedCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageCompletionTime: number; // hours

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  averageCost: number;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  autoCreateWorkOrders: boolean;

  @Column({ type: 'int', default: 7 })
  advanceNotificationDays: number;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid' })
  assetId: string;

  @ManyToOne(() => Asset, asset => asset.maintenanceSchedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assetId' })
  asset: Asset;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Logic Methods
  calculateNextDueDate(): Date {
    if (!this.lastMaintenanceDate) {
      this.lastMaintenanceDate = new Date();
    }

    const nextDate = new Date(this.lastMaintenanceDate);
    
    switch (this.scheduleType) {
      case MaintenanceScheduleType.CALENDAR_BASED:
        if (this.frequency.unit === 'days') {
          nextDate.setDate(nextDate.getDate() + this.frequency.interval);
        } else if (this.frequency.unit === 'weeks') {
          nextDate.setDate(nextDate.getDate() + (this.frequency.interval * 7));
        } else if (this.frequency.unit === 'months') {
          nextDate.setMonth(nextDate.getMonth() + this.frequency.interval);
        }
        break;
      
      case MaintenanceScheduleType.USAGE_BASED:
        // This would need asset usage data to calculate
        nextDate.setDate(nextDate.getDate() + 30); // Default fallback
        break;
        
      case MaintenanceScheduleType.CONDITION_BASED:
        // This would be based on IoT sensor data
        nextDate.setDate(nextDate.getDate() + 30); // Default fallback
        break;
    }

    this.nextDueDate = nextDate;
    return nextDate;
  }

  isOverdue(): boolean {
    if (!this.nextDueDate) return false;
    return this.nextDueDate < new Date();
  }

  isDueSoon(): boolean {
    if (!this.nextDueDate) return false;
    const dueDate = new Date(this.nextDueDate);
    const notificationDate = new Date();
    notificationDate.setDate(notificationDate.getDate() + this.advanceNotificationDays);
    return dueDate <= notificationDate;
  }

  updateAverages(completionTime: number, cost: number): void {
    this.completedCount++;
    this.averageCompletionTime = 
      ((this.averageCompletionTime * (this.completedCount - 1)) + completionTime) / this.completedCount;
    this.averageCost = 
      ((this.averageCost * (this.completedCount - 1)) + cost) / this.completedCount;
  }
}

/**
 * Predictive Analysis Entity
 * Stores AI-powered predictive maintenance analysis results
 */
@Entity('predictive_analyses')
@Index(['organizationId', 'assetId'])
@Index(['analysisType'])
@Index(['analysisDate'])
@Index(['riskScore'])
export class PredictiveAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  analysisType: string; // 'failure_prediction', 'condition_monitoring', 'performance_trend'

  @Column({ type: 'date' })
  analysisDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  riskScore: number; // 0-100

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidenceLevel: number; // 0-100

  @Column({ type: 'jsonb' })
  @IsNotEmpty()
  @IsObject()
  analysisResults: any;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  recommendations: any[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  predictedFailures: any[];

  @Column({ type: 'date', nullable: true })
  estimatedFailureDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  potentialCostSavings: number;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  sensorData: any;

  @Column({ type: 'varchar', length: 100, nullable: true })
  aiModelVersion: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  actionTaken: boolean;

  @Column({ type: 'text', nullable: true })
  actionNotes: string;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid' })
  assetId: string;

  @ManyToOne(() => Asset, asset => asset.predictiveAnalyses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assetId' })
  asset: Asset;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Logic Methods
  isHighRisk(): boolean {
    return this.riskScore >= 80;
  }

  isMediumRisk(): boolean {
    return this.riskScore >= 50 && this.riskScore < 80;
  }

  isLowRisk(): boolean {
    return this.riskScore < 50;
  }

  getTimeToFailure(): number | null {
    if (!this.estimatedFailureDate) return null;
    
    const now = new Date();
    const failureDate = new Date(this.estimatedFailureDate);
    const diffTime = failureDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  markActionTaken(notes: string): void {
    this.actionTaken = true;
    this.actionNotes = notes;
    this.updatedAt = new Date();
  }
}

/**
 * Spare Part Entity
 * Represents spare parts inventory for maintenance
 */
@Entity('spare_parts')
@Index(['organizationId', 'status'])
@Index(['partNumber'], { unique: true })
@Index(['category'])
export class SparePart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @IsNotEmpty()
  partNumber: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  category: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  manufacturer: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supplierPartNumber: string;

  @Column({ 
    type: 'enum', 
    enum: SparePartStatus,
    default: SparePartStatus.AVAILABLE
  })
  @IsEnum(SparePartStatus)
  status: SparePartStatus;

  @Column({ type: 'int', default: 0 })
  currentStock: number;

  @Column({ type: 'int', default: 0 })
  minStockLevel: number;

  @Column({ type: 'int', default: 0 })
  maxStockLevel: number;

  @Column({ type: 'int', default: 0 })
  reorderPoint: number;

  @Column({ type: 'int', default: 0 })
  reorderQuantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string; // 'pieces', 'kg', 'liters', etc.

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalValue: number;

  @Column({ type: 'int', default: 0 })
  leadTimeDays: number;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  compatibleAssets: string[]; // Array of asset IDs

  @Column({ type: 'date', nullable: true })
  lastStockUpdate: Date;

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
  updateStock(quantity: number, reason: string): void {
    this.currentStock = Math.max(0, this.currentStock + quantity);
    this.totalValue = this.currentStock * this.unitCost;
    this.lastStockUpdate = new Date();
    
    // Update status based on stock levels
    if (this.currentStock <= 0) {
      this.status = SparePartStatus.OUT_OF_STOCK;
    } else if (this.currentStock <= this.reorderPoint) {
      this.status = SparePartStatus.LOW_STOCK;
    } else {
      this.status = SparePartStatus.AVAILABLE;
    }
  }

  isReorderNeeded(): boolean {
    return this.currentStock <= this.reorderPoint && this.status !== SparePartStatus.ON_ORDER;
  }

  calculateTurnaroundDays(): number {
    // This would be calculated based on historical usage data
    return 30; // Placeholder
  }
}

/**
 * Maintenance Metrics Entity
 * Stores aggregated maintenance metrics and KPIs
 */
@Entity('maintenance_metrics')
@Index(['organizationId', 'metricDate'])
@Index(['assetId'])
@Index(['metricType'])
export class MaintenanceMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  metricDate: Date;

  @Column({ type: 'varchar', length: 50 })
  metricType: string; // 'mtbf', 'mttr', 'availability', 'cost'

  @Column({ type: 'uuid', nullable: true })
  assetId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  metricValue: number;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  additionalData: any;

  @Column({ type: 'int', default: 0 })
  totalWorkOrders: number;

  @Column({ type: 'int', default: 0 })
  completedWorkOrders: number;

  @Column({ type: 'int', default: 0 })
  overdueWorkOrders: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalMaintenanceCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  averageRepairTime: number; // hours

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  equipmentAvailability: number; // percentage

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => Asset, { nullable: true })
  @JoinColumn({ name: 'assetId' })
  asset: Asset;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Logic Methods
  calculateMTBF(): number {
    // Mean Time Between Failures
    if (this.totalWorkOrders === 0) return 0;
    
    // This would be calculated based on historical failure data
    const totalOperatingTime = 24 * 365; // hours per year (placeholder)
    return totalOperatingTime / this.totalWorkOrders;
  }

  calculateMTTR(): number {
    // Mean Time To Repair
    return this.averageRepairTime;
  }

  calculateOEE(): number {
    // Overall Equipment Effectiveness
    const availability = this.equipmentAvailability / 100;
    const performance = 0.95; // Placeholder - should come from production data
    const quality = 0.95; // Placeholder - should come from quality data
    
    return availability * performance * quality * 100;
  }
}

/**
 * Technician Entity
 * Represents maintenance technicians and their skills
 */
@Entity('technicians')
@Index(['organizationId', 'employeeId'])
@Index(['skillSet'])
export class Technician {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  employeeId: string; // Links to HR Employee entity

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  employeeNumber: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  skillLevel: string; // 'junior', 'senior', 'expert'

  @Column({ type: 'jsonb' })
  @IsNotEmpty()
  @IsArray()
  skillSet: string[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  certifications: any[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 50, default: 'available' })
  availability: string; // 'available', 'busy', 'off_duty'

  @Column({ type: 'int', default: 0 })
  currentWorkload: number; // Number of active work orders

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  performanceRating: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  hourlyRate: number;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  workingHours: any; // Schedule information

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @OneToMany(() => MaintenanceWorkOrder, workOrder => workOrder.assignedTo)
  assignedWorkOrders: MaintenanceWorkOrder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Logic Methods
  isAvailableForWork(): boolean {
    return this.availability === 'available' && this.currentWorkload < 5; // Max 5 concurrent work orders
  }

  hasSkill(skill: string): boolean {
    return this.skillSet.includes(skill);
  }

  updatePerformanceRating(rating: number): void {
    // This would typically be an average of multiple ratings
    this.performanceRating = Math.max(0, Math.min(5, rating));
    this.updatedAt = new Date();
  }

  assignWorkOrder(): void {
    this.currentWorkload++;
    if (this.currentWorkload >= 5) {
      this.availability = 'busy';
    }
  }

  completeWorkOrder(): void {
    this.currentWorkload = Math.max(0, this.currentWorkload - 1);
    if (this.currentWorkload < 5 && this.availability === 'busy') {
      this.availability = 'available';
    }
  }
}
