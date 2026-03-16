// Industry 5.0 ERP Backend - Shop Floor Control Module
// Production Line Entity - Comprehensive production line management
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

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
import { WorkCell } from './work-cell.entity';

export enum ProductionLineType {
  ASSEMBLY = 'assembly',
  MANUFACTURING = 'manufacturing',
  PACKAGING = 'packaging',
  TESTING = 'testing',
  HYBRID = 'hybrid',
  FLEXIBLE = 'flexible',
  SMART_LINE = 'smart_line',
  AUTONOMOUS_LINE = 'autonomous_line'
}

export enum ProductionLineStatus {
  OPERATIONAL = 'operational',
  IDLE = 'idle',
  SETUP = 'setup',
  CHANGEOVER = 'changeover',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  EMERGENCY_STOP = 'emergency_stop',
  CALIBRATION = 'calibration'
}

export enum QualityStandard {
  ISO_9001 = 'iso_9001',
  ISO_14001 = 'iso_14001',
  IATF_16949 = 'iatf_16949',
  AS9100 = 'as9100',
  ISO_45001 = 'iso_45001',
  SIX_SIGMA = 'six_sigma',
  LEAN_MANUFACTURING = 'lean_manufacturing'
}

export interface LineCapabilities {
  maxThroughput: number; // parts per hour
  minBatchSize: number;
  maxBatchSize: number;
  productTypes: string[];
  qualityLevels: string[];
  automationLevel: number; // 0-100%
  flexibilityScore: number; // 0-100%
  
  // Advanced capabilities
  hasAIOptimization: boolean;
  hasAdaptiveScheduling: boolean;
  hasQualityPrediction: boolean;
  hasPredictiveMaintenance: boolean;
  hasDigitalTwin: boolean;
  hasRealTimeOptimization: boolean;
  hasQuantumOptimization: boolean;
  supportsSustainableProduction: boolean;
}

export interface ProductionSchedule {
  scheduledProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    priority: number;
    scheduledStart: Date;
    estimatedDuration: number; // minutes
    requiredWorkCells: string[];
    qualityRequirements: any;
  }>;
  currentlyProducing?: {
    productId: string;
    productName: string;
    batchId: string;
    startTime: Date;
    estimatedCompletion: Date;
    progress: number; // percentage
  };
  upcomingChangeovers: Array<{
    fromProduct: string;
    toProduct: string;
    scheduledTime: Date;
    estimatedDuration: number;
  }>;
}

export interface QualityMetrics {
  // Quality rates
  overallQualityRate: number; // percentage
  firstPassYield: number; // percentage
  defectRate: number; // percentage
  reworkRate: number; // percentage
  scrapRate: number; // percentage
  
  // Defect tracking
  totalDefects: number;
  criticalDefects: number;
  majorDefects: number;
  minorDefects: number;
  
  // Quality trends
  qualityTrend: 'improving' | 'stable' | 'declining';
  defectTrend: 'decreasing' | 'stable' | 'increasing';
  
  // Process capability
  cpk: number; // Process capability index
  cp: number; // Process capability
  sigma: number; // Sigma level
  
  // Standards compliance
  complianceStandards: QualityStandard[];
  complianceScore: number; // 0-100%
  
  lastUpdated: Date;
}

export interface ProductionMetrics {
  // Throughput metrics
  actualThroughput: number; // parts per hour
  targetThroughput: number; // parts per hour
  throughputEfficiency: number; // percentage
  cycleTime: number; // minutes
  taktTime: number; // minutes
  leadTime: number; // minutes
  
  // Operational metrics
  availability: number; // percentage
  performance: number; // percentage
  oee: number; // Overall Equipment Effectiveness
  teep: number; // Total Effective Equipment Productivity
  
  // Utilization metrics
  lineUtilization: number; // percentage
  equipmentUtilization: number; // percentage
  laborUtilization: number; // percentage
  
  // Financial metrics
  costPerUnit: number;
  totalProductionCost: number;
  efficiencySavings: number;
  
  // Environmental metrics
  energyConsumption: number; // kWh
  carbonFootprint: number; // kg CO2
  waterUsage: number; // liters
  wasteGenerated: number; // kg
  materialUtilization: number; // percentage
  
  // Predictive metrics
  predictedDowntime: number; // hours
  maintenanceScore: number; // 0-100
  performanceTrend: 'improving' | 'stable' | 'declining';
  
  lastUpdated: Date;
}

export interface ThroughputOptimization {
  currentOptimizationLevel: number; // 0-100%
  potentialImprovement: number; // percentage
  bottlenecks: Array<{
    workCellId: string;
    workCellName: string;
    bottleneckSeverity: number; // 0-100%
    suggestedActions: string[];
  }>;
  optimizationRecommendations: Array<{
    action: string;
    expectedImprovement: number; // percentage
    implementationCost: number;
    paybackPeriod: number; // months
  }>;
  aiOptimizationResults: {
    algorithmUsed: string;
    confidenceLevel: number; // 0-100%
    lastOptimization: Date;
    improvementAchieved: number; // percentage
  };
}

@Entity('production_lines')
@Index(['type', 'status'])
@Index(['facility', 'status'])
@Index(['isActive', 'status'])
export class ProductionLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  @Index()
  name: string;

  @Column({ length: 100, nullable: true })
  displayName?: string;

  @Column({
    type: 'enum',
    enum: ProductionLineType
  })
  @Index()
  type: ProductionLineType;

  @Column({
    type: 'enum',
    enum: ProductionLineStatus,
    default: ProductionLineStatus.IDLE
  })
  @Index()
  status: ProductionLineStatus;

  @Column({ length: 1000, nullable: true })
  description?: string;

  // Location Information
  @Column({ length: 100 })
  @Index()
  facility: string;

  @Column({ length: 100 })
  @Index()
  department: string;

  @Column({ length: 100, nullable: true })
  floor?: string;

  @Column({ length: 100, nullable: true })
  building?: string;

  @Column({ length: 255, nullable: true })
  physicalLocation?: string;

  // Line Configuration
  @Column({ type: 'jsonb' })
  capabilities: LineCapabilities;

  @Column({ type: 'jsonb', nullable: true })
  productionSchedule?: ProductionSchedule;

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

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  currentThroughput: number; // parts per hour

  // Performance Metrics
  @Column({ type: 'jsonb', nullable: true })
  productionMetrics?: ProductionMetrics;

  @Column({ type: 'jsonb', nullable: true })
  qualityMetrics?: QualityMetrics;

  @Column({ type: 'jsonb', nullable: true })
  throughputOptimization?: ThroughputOptimization;

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

  // Quality Counters
  @Column({ type: 'int', default: 0 })
  totalDefectsToday: number;

  @Column({ type: 'int', default: 0 })
  totalReworkToday: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  averageQualityScore: number;

  // Resource Management
  @Column({ type: 'int', default: 0 })
  assignedWorkCells: number;

  @Column({ type: 'int', default: 0 })
  activeWorkCells: number;

  @Column({ type: 'int', default: 0 })
  totalOperators: number;

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
  lastChangeoverStart?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastChangeoverEnd?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastMaintenanceDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextMaintenanceDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastQualityCheck?: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextQualityCheck?: Date;

  // Alert and Issue Management
  @Column({ type: 'text', array: true, nullable: true })
  currentAlerts?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  qualityAlerts?: string[];

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
  isAutonomous: boolean;

  @Column({ default: false })
  needsMaintenance: boolean;

  @Column({ default: false })
  hasQualityIssues: boolean;

  @Column({ default: false })
  isOptimized: boolean;

  @Column({ default: false })
  isEmergencyStopped: boolean;

  @Column({ default: false })
  supportsLeanManufacturing: boolean;

  @Column({ default: false })
  supportsSustainableProduction: boolean;

  // Relationships
  @OneToMany(() => WorkCell, workCell => workCell.productionLine)
  workCells: WorkCell[];

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
    this.activeWorkCells = this.workCells?.filter(wc => wc.isActive).length || 0;
    this.assignedWorkCells = this.workCells?.length || 0;
  }

  // Helper Methods
  isOperational(): boolean {
    return this.status === ProductionLineStatus.OPERATIONAL && this.isActive;
  }

  isAvailable(): boolean {
    return this.status === ProductionLineStatus.IDLE && 
           this.isActive && 
           !this.needsMaintenance && 
           !this.isEmergencyStopped &&
           !this.hasQualityIssues;
  }

  canStartProduction(): boolean {
    return this.isAvailable() && this.hasAvailableWorkCells();
  }

  hasAvailableWorkCells(): boolean {
    return this.workCells && this.workCells.some(wc => wc.isAvailable());
  }

  getAvailableWorkCells(): WorkCell[] {
    return this.workCells ? this.workCells.filter(wc => wc.isAvailable()) : [];
  }

  getThroughputEfficiency(): number {
    if (!this.productionMetrics) return 0;
    return this.productionMetrics.throughputEfficiency || 0;
  }

  getOEE(): number {
    if (!this.productionMetrics) return 0;
    return this.productionMetrics.oee || 0;
  }

  getTEEP(): number {
    if (!this.productionMetrics) return 0;
    return this.productionMetrics.teep || 0;
  }

  getQualityRate(): number {
    if (!this.qualityMetrics) return 100;
    return this.qualityMetrics.overallQualityRate || 100;
  }

  getFirstPassYield(): number {
    if (!this.qualityMetrics) return 100;
    return this.qualityMetrics.firstPassYield || 100;
  }

  getLineUtilization(): number {
    if (!this.productionMetrics) return 0;
    return this.productionMetrics.lineUtilization || 0;
  }

  getCurrentEfficiency(): number {
    const oee = this.getOEE();
    const quality = this.getQualityRate();
    const throughput = this.getThroughputEfficiency();
    
    return (oee + quality + throughput) / 3;
  }

  getBatchProgress(): number {
    if (!this.currentBatchSize || this.currentBatchSize === 0) return 0;
    return (this.currentBatchProgress / this.currentBatchSize) * 100;
  }

  addAlert(alert: string): void {
    if (!this.currentAlerts) this.currentAlerts = [];
    this.currentAlerts.push(alert);
    
    // Keep only last 50 alerts
    if (this.currentAlerts.length > 50) {
      this.currentAlerts = this.currentAlerts.slice(-50);
    }
  }

  addQualityAlert(alert: string): void {
    if (!this.qualityAlerts) this.qualityAlerts = [];
    this.qualityAlerts.push(alert);
    
    // Keep only last 30 quality alerts
    if (this.qualityAlerts.length > 30) {
      this.qualityAlerts = this.qualityAlerts.slice(-30);
    }
  }

  clearAlerts(): void {
    this.currentAlerts = [];
  }

  clearQualityAlerts(): void {
    this.qualityAlerts = [];
  }

  addIssue(issue: string): void {
    if (!this.recentIssues) this.recentIssues = [];
    this.recentIssues.push(issue);
    
    // Keep only last 30 issues
    if (this.recentIssues.length > 30) {
      this.recentIssues = this.recentIssues.slice(-30);
    }
    
    this.issueCount++;
  }

  clearIssues(): void {
    this.recentIssues = [];
  }

  startProduction(productId: string, productName: string, batchId: string, batchSize: number): void {
    this.status = ProductionLineStatus.OPERATIONAL;
    this.currentProductId = productId;
    this.currentProductName = productName;
    this.currentBatchId = batchId;
    this.currentBatchSize = batchSize;
    this.currentBatchProgress = 0;
    this.lastProductionStart = new Date();
    
    // Update production schedule
    if (this.productionSchedule) {
      this.productionSchedule.currentlyProducing = {
        productId,
        productName,
        batchId,
        startTime: new Date(),
        estimatedCompletion: new Date(Date.now() + (this.capabilities.maxThroughput > 0 ? (batchSize / this.capabilities.maxThroughput) * 60 * 60 * 1000 : 0)),
        progress: 0
      };
    }
  }

  completeProduction(): void {
    this.status = ProductionLineStatus.IDLE;
    this.totalBatchesCompleted++;
    this.totalPartsProduced += this.currentBatchSize || 0;
    this.lastProductionEnd = new Date();
    
    // Reset current production info
    this.currentProductId = null;
    this.currentProductName = null;
    this.currentBatchId = null;
    this.currentBatchSize = null;
    this.currentBatchProgress = 0;
    
    // Clear current production from schedule
    if (this.productionSchedule) {
      this.productionSchedule.currentlyProducing = undefined;
    }
  }

  pauseProduction(): void {
    if (this.status === ProductionLineStatus.OPERATIONAL) {
      this.status = ProductionLineStatus.IDLE;
    }
  }

  resumeProduction(): void {
    if (this.status === ProductionLineStatus.IDLE && this.currentBatchId) {
      this.status = ProductionLineStatus.OPERATIONAL;
    }
  }

  emergencyStop(reason: string): void {
    this.status = ProductionLineStatus.EMERGENCY_STOP;
    this.isEmergencyStopped = true;
    this.addAlert(`Emergency stop: ${reason}`);
    
    // Emergency stop all work cells
    if (this.workCells) {
      this.workCells.forEach(workCell => {
        workCell.emergencyStop(reason);
      });
    }
  }

  reset(): void {
    this.status = ProductionLineStatus.IDLE;
    this.isEmergencyStopped = false;
    this.clearAlerts();
    
    // Reset all work cells
    if (this.workCells) {
      this.workCells.forEach(workCell => {
        workCell.reset();
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

  updateQualityMetrics(metrics: Partial<QualityMetrics>): void {
    this.qualityMetrics = {
      ...this.qualityMetrics,
      ...metrics,
      lastUpdated: new Date()
    } as QualityMetrics;
  }

  updateThroughputOptimization(optimization: Partial<ThroughputOptimization>): void {
    this.throughputOptimization = {
      ...this.throughputOptimization,
      ...optimization
    } as ThroughputOptimization;
  }

  incrementBatchProgress(amount: number = 1): void {
    this.currentBatchProgress += amount;
    
    // Update production schedule progress
    if (this.productionSchedule?.currentlyProducing) {
      this.productionSchedule.currentlyProducing.progress = this.getBatchProgress();
    }
    
    // Complete batch if finished
    if (this.currentBatchSize && this.currentBatchProgress >= this.currentBatchSize) {
      this.completeProduction();
    }
  }

  getHealthScore(): number {
    let score = 100;
    
    if (this.currentAlerts && this.currentAlerts.length > 0) score -= 10;
    if (this.qualityAlerts && this.qualityAlerts.length > 0) score -= 15;
    if (this.recentIssues && this.recentIssues.length > 10) score -= 15;
    if (this.needsMaintenance) score -= 20;
    if (this.hasQualityIssues) score -= 25;
    if (this.issueCount > 20) score -= 15;
    if (this.productionMetrics?.oee && this.productionMetrics.oee < 60) score -= 20;
    if (this.qualityMetrics?.overallQualityRate && this.qualityMetrics.overallQualityRate < 95) score -= 15;
    if (!this.isActive) score -= 50;
    if (this.isEmergencyStopped) score -= 40;
    
    return Math.max(0, score);
  }

  getEfficiencyScore(): number {
    if (!this.productionMetrics) return 0;
    
    const availability = this.productionMetrics.availability || 0;
    const performance = this.productionMetrics.performance || 0;
    const quality = this.qualityMetrics?.overallQualityRate || 0;
    const throughput = this.productionMetrics.throughputEfficiency || 0;
    
    return (availability + performance + quality + throughput) / 4;
  }

  getProductionLineSummary(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      facility: this.facility,
      department: this.department,
      healthScore: this.getHealthScore(),
      efficiency: this.getCurrentEfficiency(),
      oee: this.getOEE(),
      teep: this.getTEEP(),
      qualityRate: this.getQualityRate(),
      throughputEfficiency: this.getThroughputEfficiency(),
      lineUtilization: this.getLineUtilization(),
      assignedWorkCells: this.assignedWorkCells,
      activeWorkCells: this.activeWorkCells,
      isAvailable: this.isAvailable(),
      currentProduct: this.currentProductName,
      batchProgress: this.getBatchProgress(),
      totalPartsProduced: this.totalPartsProduced,
      totalBatchesCompleted: this.totalBatchesCompleted,
      capabilities: {
        maxThroughput: this.capabilities.maxThroughput,
        automationLevel: this.capabilities.automationLevel,
        flexibilityScore: this.capabilities.flexibilityScore,
        hasAI: this.hasAI,
        hasDigitalTwin: this.hasDigitalTwin,
        isAutonomous: this.isAutonomous,
        supportsLeanManufacturing: this.supportsLeanManufacturing,
        supportsSustainableProduction: this.supportsSustainableProduction
      }
    };
  }
}
