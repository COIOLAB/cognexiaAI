import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { Robot } from './robot.entity';
import { RobotTask } from './robot-task.entity';

export enum WorkCellType {
  ASSEMBLY = 'assembly',
  MACHINING = 'machining',
  WELDING = 'welding',
  PAINTING = 'painting',
  PACKAGING = 'packaging',
  INSPECTION = 'inspection',
  MATERIAL_HANDLING = 'material_handling',
  COLLABORATIVE = 'collaborative',
  FLEXIBLE_MANUFACTURING = 'flexible_manufacturing',
  SMART_ASSEMBLY = 'smart_assembly'
}

export enum WorkCellStatus {
  OPERATIONAL = 'operational',
  IDLE = 'idle',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  SETUP = 'setup',
  CHANGEOVER = 'changeover',
  EMERGENCY_STOP = 'emergency_stop'
}

export interface WorkCellCapabilities {
  maxRobots: number;
  supportedOperations: string[];
  qualityLevels: string[];
  throughputCapacity: number; // parts per hour
  energyEfficiency: number; // kWh per part
  automationLevel: number; // 0-100%
  flexibilityScore: number; // 0-100%
  
  // Advanced capabilities
  hasAIOptimization: boolean;
  hasAdaptiveControl: boolean;
  hasDigitalTwin: boolean;
  hasPredictiveMaintenance: boolean;
  hasCollaborativeFeatures: boolean;
  hasQuantumOptimization: boolean;
}

export interface LayoutConfiguration {
  dimensions: {
    length: number; // mm
    width: number;  // mm
    height: number; // mm
  };
  robotPositions: Array<{
    robotId?: string;
    x: number;
    y: number;
    z: number;
    rotation: number;
  }>;
  safetyZones: Array<{
    id: string;
    type: 'restricted' | 'collaborative' | 'human_only';
    coordinates: number[][];
  }>;
  workstations: Array<{
    id: string;
    type: string;
    position: { x: number; y: number; z: number };
    capabilities: string[];
  }>;
}

export interface ProductionMetrics {
  // Throughput metrics
  partsProducedToday: number;
  targetPartsPerDay: number;
  actualCycleTime: number; // seconds
  plannedCycleTime: number; // seconds
  throughputEfficiency: number; // percentage
  
  // Quality metrics
  qualityRate: number; // percentage
  defectCount: number;
  reworkCount: number;
  firstPassYield: number; // percentage
  
  // Operational metrics
  availability: number; // percentage
  performance: number; // percentage
  oee: number; // Overall Equipment Effectiveness
  uptime: number; // hours
  downtime: number; // hours
  
  // Resource utilization
  robotUtilization: number; // percentage
  humanUtilization: number; // percentage
  energyConsumption: number; // kWh
  materialWaste: number; // percentage
  
  // Financial metrics
  operatingCost: number; // currency per hour
  maintenanceCost: number; // currency per hour
  laborCost: number; // currency per hour
  
  // Environmental metrics
  carbonFootprint: number; // kg CO2
  waterUsage: number; // liters
  wasteGenerated: number; // kg
  
  // Update timestamp
  lastUpdated: Date;
}

@Entity('work_cells')
@Index(['type', 'status'])
@Index(['facility', 'status'])
@Index(['productionLine'])
export class WorkCell {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  @Index()
  name: string;

  @Column({ length: 100, nullable: true })
  displayName?: string;

  @Column({
    type: 'enum',
    enum: WorkCellType
  })
  @Index()
  type: WorkCellType;

  @Column({
    type: 'enum',
    enum: WorkCellStatus,
    default: WorkCellStatus.IDLE
  })
  @Index()
  status: WorkCellStatus;

  @Column({ length: 1000, nullable: true })
  description?: string;

  // Location Information
  @Column({ length: 100 })
  @Index()
  facility: string;

  @Column({ length: 100 })
  @Index()
  department: string;

  @Column({ length: 100 })
  @Index()
  productionLine: string;

  @Column({ length: 100, nullable: true })
  floor?: string;

  @Column({ length: 100, nullable: true })
  zone?: string;

  @Column({ length: 255, nullable: true })
  physicalLocation?: string;

  // Capabilities and Configuration
  @Column({ type: 'jsonb' })
  capabilities: WorkCellCapabilities;

  @Column({ type: 'jsonb' })
  layoutConfiguration: LayoutConfiguration;

  // Current Production Information
  @Column({ nullable: true })
  currentProductId?: string;

  @Column({ length: 255, nullable: true })
  currentProductName?: string;

  @Column({ nullable: true })
  currentBatchId?: string;

  @Column({ type: 'int', nullable: true })
  currentBatchSize?: number;

  @Column({ type: 'int', default: 0 })
  currentBatchProgress: number;

  // Performance Metrics
  @Column({ type: 'jsonb', nullable: true })
  productionMetrics?: ProductionMetrics;

  // Operational Counters
  @Column({ type: 'int', default: 0 })
  totalPartsProduced: number;

  @Column({ type: 'int', default: 0 })
  totalBatchesCompleted: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalOperatingHours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalEnergyConsumed: number; // kWh

  @Column({ type: 'int', default: 0 })
  totalDowntimeEvents: number;

  // Quality Metrics
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageQualityScore: number;

  @Column({ type: 'int', default: 0 })
  totalDefectsToday: number;

  @Column({ type: 'int', default: 0 })
  totalReworkToday: number;

  // Resource Management
  @Column({ type: 'int', default: 0 })
  assignedRobots: number;

  @Column({ type: 'int', default: 0 })
  assignedOperators: number;

  @Column({ type: 'text', array: true, nullable: true })
  requiredSkills?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  certificationRequirements?: string[];

  // Status Tracking
  @Column({ type: 'timestamp', nullable: true })
  lastProductionStart?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastProductionEnd?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastMaintenanceDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextMaintenanceDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSetupDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextCalibrationDate?: Date;

  // Alert and Issue Management
  @Column({ type: 'text', array: true, nullable: true })
  currentAlerts?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  recentIssues?: string[];

  @Column({ type: 'int', default: 0 })
  issueCount: number;

  // Configuration and Metadata
  @Column({ type: 'jsonb', nullable: true })
  configuration?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  // Flags
  @Column({ default: true })
  @Index()
  isActive: boolean;

  @Column({ default: false })
  isFlexible: boolean;

  @Column({ default: false })
  hasAI: boolean;

  @Column({ default: false })
  hasDigitalTwin: boolean;

  @Column({ default: false })
  isCollaborative: boolean;

  @Column({ default: false })
  isAutonomous: boolean;

  @Column({ default: false })
  needsMaintenance: boolean;

  @Column({ default: false })
  isEmergencyStopped: boolean;

  // Relationships
  @OneToMany(() => Robot, robot => robot.workCell)
  robots: Robot[];

  @OneToMany(() => RobotTask, task => task.workCell)
  tasks: RobotTask[];

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  updatedBy?: string;

  // Hooks
  @BeforeInsert()
  @BeforeUpdate()
  updateCounters() {
    this.assignedRobots = this.robots?.length || 0;
  }

  // Helper Methods
  isOperational(): boolean {
    return this.status === WorkCellStatus.OPERATIONAL && this.isActive;
  }

  isAvailable(): boolean {
    return this.status === WorkCellStatus.IDLE && 
           this.isActive && 
           !this.needsMaintenance && 
           !this.isEmergencyStopped;
  }

  canAcceptNewTask(): boolean {
    return this.isAvailable() && this.hasAvailableRobots();
  }

  hasAvailableRobots(): boolean {
    return this.robots && this.robots.some(robot => robot.isAvailable());
  }

  getAvailableRobots(): Robot[] {
    return this.robots ? this.robots.filter(robot => robot.isAvailable()) : [];
  }

  getUtilization(): number {
    if (!this.productionMetrics) return 0;
    return this.productionMetrics.robotUtilization || 0;
  }

  getOEE(): number {
    if (!this.productionMetrics) return 0;
    return this.productionMetrics.oee || 0;
  }

  getQualityRate(): number {
    if (!this.productionMetrics) return 0;
    return this.productionMetrics.qualityRate || 0;
  }

  getThroughputEfficiency(): number {
    if (!this.productionMetrics) return 0;
    return this.productionMetrics.throughputEfficiency || 0;
  }

  getBatchProgress(): number {
    if (!this.currentBatchSize || this.currentBatchSize === 0) return 0;
    return (this.currentBatchProgress / this.currentBatchSize) * 100;
  }

  addAlert(alert: string): void {
    if (!this.currentAlerts) this.currentAlerts = [];
    this.currentAlerts.push(alert);
  }

  clearAlerts(): void {
    this.currentAlerts = [];
  }

  addIssue(issue: string): void {
    if (!this.recentIssues) this.recentIssues = [];
    this.recentIssues.push(issue);
    
    // Keep only last 20 issues
    if (this.recentIssues.length > 20) {
      this.recentIssues = this.recentIssues.slice(-20);
    }
    
    this.issueCount++;
  }

  clearIssues(): void {
    this.recentIssues = [];
  }

  startProduction(productId: string, productName: string, batchId: string, batchSize: number): void {
    this.status = WorkCellStatus.OPERATIONAL;
    this.currentProductId = productId;
    this.currentProductName = productName;
    this.currentBatchId = batchId;
    this.currentBatchSize = batchSize;
    this.currentBatchProgress = 0;
    this.lastProductionStart = new Date();
  }

  completeProduction(): void {
    this.status = WorkCellStatus.IDLE;
    this.totalBatchesCompleted++;
    this.totalPartsProduced += this.currentBatchSize || 0;
    this.lastProductionEnd = new Date();
    
    // Reset current production info
    this.currentProductId = null;
    this.currentProductName = null;
    this.currentBatchId = null;
    this.currentBatchSize = null;
    this.currentBatchProgress = 0;
  }

  pauseProduction(): void {
    if (this.status === WorkCellStatus.OPERATIONAL) {
      this.status = WorkCellStatus.IDLE;
    }
  }

  resumeProduction(): void {
    if (this.status === WorkCellStatus.IDLE && this.currentBatchId) {
      this.status = WorkCellStatus.OPERATIONAL;
    }
  }

  emergencyStop(reason: string): void {
    this.status = WorkCellStatus.EMERGENCY_STOP;
    this.isEmergencyStopped = true;
    this.addAlert(`Emergency stop: ${reason}`);
    
    // Emergency stop all robots in the cell
    if (this.robots) {
      this.robots.forEach(robot => {
        robot.emergencyStop(reason);
      });
    }
  }

  reset(): void {
    this.status = WorkCellStatus.IDLE;
    this.isEmergencyStopped = false;
    this.clearAlerts();
    
    // Reset all robots in the cell
    if (this.robots) {
      this.robots.forEach(robot => {
        robot.reset();
      });
    }
  }

  updateProductionMetrics(metrics: Partial<ProductionMetrics>): void {
    this.productionMetrics = {
      ...this.productionMetrics,
      ...metrics,
      lastUpdated: new Date()
    } as ProductionMetrics;
  }

  incrementBatchProgress(amount: number = 1): void {
    this.currentBatchProgress += amount;
    
    // Complete batch if finished
    if (this.currentBatchSize && this.currentBatchProgress >= this.currentBatchSize) {
      this.completeProduction();
    }
  }

  getHealthScore(): number {
    let score = 100;
    
    if (this.currentAlerts && this.currentAlerts.length > 0) score -= 10;
    if (this.recentIssues && this.recentIssues.length > 5) score -= 15;
    if (this.needsMaintenance) score -= 20;
    if (this.issueCount > 10) score -= 15;
    if (this.productionMetrics?.oee && this.productionMetrics.oee < 60) score -= 20;
    if (this.productionMetrics?.qualityRate && this.productionMetrics.qualityRate < 95) score -= 10;
    if (!this.isActive) score -= 50;
    if (this.isEmergencyStopped) score -= 30;
    
    return Math.max(0, score);
  }

  getEfficiencyScore(): number {
    if (!this.productionMetrics) return 0;
    
    const availability = this.productionMetrics.availability || 0;
    const performance = this.productionMetrics.performance || 0;
    const quality = this.productionMetrics.qualityRate || 0;
    
    return (availability + performance + quality) / 3;
  }

  getWorkCellSummary(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      facility: this.facility,
      productionLine: this.productionLine,
      healthScore: this.getHealthScore(),
      utilization: this.getUtilization(),
      oee: this.getOEE(),
      qualityRate: this.getQualityRate(),
      throughputEfficiency: this.getThroughputEfficiency(),
      assignedRobots: this.assignedRobots,
      isAvailable: this.isAvailable(),
      currentProduct: this.currentProductName,
      batchProgress: this.getBatchProgress(),
      totalPartsProduced: this.totalPartsProduced,
      capabilities: {
        maxRobots: this.capabilities.maxRobots,
        throughputCapacity: this.capabilities.throughputCapacity,
        automationLevel: this.capabilities.automationLevel,
        hasAI: this.hasAI,
        isCollaborative: this.isCollaborative,
        isFlexible: this.isFlexible
      }
    };
  }
}
