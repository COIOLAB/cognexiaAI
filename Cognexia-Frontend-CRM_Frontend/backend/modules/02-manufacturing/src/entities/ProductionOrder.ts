// Industry 5.0 ERP Backend - Manufacturing Module
// ProductionOrder Entity - Represents manufacturing production orders with real-time tracking
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProductionLine } from './ProductionLine';
import { BillOfMaterials } from './BillOfMaterials';
import { WorkOrder } from './WorkOrder';
import { ProductionSchedule } from './ProductionSchedule';

export enum ProductionOrderStatus {
  PLANNED = 'planned',
  RELEASED = 'released',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PARTIALLY_COMPLETED = 'partially_completed',
}

export enum ProductionOrderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export enum ProductionOrderType {
  MAKE_TO_STOCK = 'make_to_stock',
  MAKE_TO_ORDER = 'make_to_order',
  ENGINEER_TO_ORDER = 'engineer_to_order',
  ASSEMBLE_TO_ORDER = 'assemble_to_order',
  REWORK = 'rework',
  PROTOTYPE = 'prototype',
}

@Entity('production_orders')
@Index(['orderNumber'], { unique: true })
@Index(['status'])
@Index(['priority'])
@Index(['productId'])
@Index(['scheduledStartDate'])
@Index(['scheduledEndDate'])
export class ProductionOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  orderNumber: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Order Configuration
  @Column({
    type: 'enum',
    enum: ProductionOrderType,
    default: ProductionOrderType.MAKE_TO_STOCK,
  })
  orderType: ProductionOrderType;

  @Column({
    type: 'enum',
    enum: ProductionOrderStatus,
    default: ProductionOrderStatus.PLANNED,
  })
  @Index()
  status: ProductionOrderStatus;

  @Column({
    type: 'enum',
    enum: ProductionOrderPriority,
    default: ProductionOrderPriority.NORMAL,
  })
  @Index()
  priority: ProductionOrderPriority;

  // Product Information
  @Column({ type: 'uuid' })
  @Index()
  productId: string;

  @Column({ type: 'varchar', length: 100 })
  productSku: string;

  @Column({ type: 'varchar', length: 200 })
  productName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  productVersion: string;

  // Quantity Information
  @Column({ type: 'decimal', precision: 15, scale: 4 })
  plannedQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  producedQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  goodQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  scrapQuantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  reworkQuantity: number;

  @Column({ type: 'varchar', length: 20 })
  unit: string;

  // Scheduling Information
  @Column({ type: 'timestamp' })
  @Index()
  scheduledStartDate: Date;

  @Column({ type: 'timestamp' })
  @Index()
  scheduledEndDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedDuration: number; // in hours

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualDuration: number; // in hours

  // Production Resources
  @Column({ type: 'uuid', nullable: true })
  productionLineId: string;

  @ManyToOne(() => ProductionLine, (line) => line.productionOrders)
  @JoinColumn({ name: 'productionLineId' })
  productionLine: ProductionLine;

  @Column({ type: 'uuid', nullable: true })
  billOfMaterialsId: string;

  @ManyToOne(() => BillOfMaterials, (bom) => bom.productionOrders)
  @JoinColumn({ name: 'billOfMaterialsId' })
  billOfMaterials: BillOfMaterials;

  // Cost Information
  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  estimatedCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  actualCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  materialCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  laborCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  overheadCost: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  // Customer and Sales Information
  @Column({ type: 'uuid', nullable: true })
  customerId: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  customerName: string;

  @Column({ type: 'uuid', nullable: true })
  salesOrderId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  customerOrderNumber: string;

  @Column({ type: 'timestamp', nullable: true })
  requestedDeliveryDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  promisedDeliveryDate: Date;

  // Quality Information
  @Column({ type: 'jsonb', nullable: true })
  qualityRequirements: {
    standard: string;
    inspectionRequired: boolean;
    testingRequired: boolean;
    certificationRequired: boolean;
    qualityPlan: string;
    acceptanceCriteria: string[];
  };

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  qualityScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  firstPassYield: number;

  @Column({ type: 'jsonb', nullable: true })
  qualityIssues: {
    issueId: string;
    type: string;
    description: string;
    severity: string;
    status: string;
    createdDate: Date;
    resolvedDate: Date;
  }[];

  // Production Planning and Scheduling
  @Column({ type: 'jsonb', nullable: true })
  productionPlan: {
    phases: {
      phase: string;
      workCenter: string;
      scheduledStart: Date;
      scheduledEnd: Date;
      actualStart: Date;
      actualEnd: Date;
      status: string;
    }[];
    dependencies: {
      dependsOn: string;
      type: string;
      delay: number;
    }[];
    criticalPath: string[];
  };

  // Material Requirements
  @Column({ type: 'jsonb', nullable: true })
  materialRequirements: {
    componentId: string;
    componentSku: string;
    componentName: string;
    requiredQuantity: number;
    allocatedQuantity: number;
    consumedQuantity: number;
    unit: string;
    status: string;
    reservationId: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  materialAvailability: {
    available: boolean;
    shortages: {
      componentId: string;
      shortQuantity: number;
      expectedDate: Date;
    }[];
    lastChecked: Date;
  };

  // Industry 5.0 Features
  @Column({ type: 'jsonb', nullable: true })
  realTimeTracking: {
    enabled: boolean;
    iotDevices: {
      deviceId: string;
      type: string;
      location: string;
      status: string;
      lastReading: Date;
    }[];
    currentMetrics: {
      efficiency: number;
      throughput: number;
      temperature: number;
      vibration: number;
      energy: number;
      timestamp: Date;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  aiOptimization: {
    recommendations: {
      type: string;
      description: string;
      impact: string;
      confidence: number;
      implemented: boolean;
    }[];
    predictions: {
      completionTime: Date;
      quality: number;
      efficiency: number;
      cost: number;
      confidence: number;
    };
    anomalies: {
      detected: boolean;
      type: string;
      severity: string;
      timestamp: Date;
      action: string;
    }[];
    lastAnalysis: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  digitalTwin: {
    id: string;
    enabled: boolean;
    simulationResults: {
      scenario: string;
      efficiency: number;
      quality: number;
      cost: number;
      duration: number;
      risks: string[];
    }[];
    realTimeSync: boolean;
    lastSync: Date;
  };

  // Human-AI Collaboration
  @Column({ type: 'jsonb', nullable: true })
  humanAiCollaboration: {
    aiAssistance: {
      enabled: boolean;
      level: string; // advisory, collaborative, autonomous
      recommendations: string[];
      decisions: {
        decision: string;
        reason: string;
        humanApproved: boolean;
        timestamp: Date;
      }[];
    };
    operatorFeedback: {
      rating: number;
      comments: string;
      suggestions: string[];
      timestamp: Date;
    }[];
  };

  // Sustainability and Environment
  @Column({ type: 'jsonb', nullable: true })
  sustainabilityMetrics: {
    energyConsumption: number; // kWh
    carbonFootprint: number; // kg CO2
    wasteGeneration: number; // kg
    waterUsage: number; // liters
    materialRecycling: number; // percentage
    sustainabilityScore: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  environmentalCompliance: {
    regulations: {
      regulation: string;
      status: string;
      compliance: boolean;
      lastAudit: Date;
    }[];
    certificates: {
      type: string;
      number: string;
      validUntil: Date;
    }[];
  };

  // Risk Management
  @Column({ type: 'jsonb', nullable: true })
  riskAssessment: {
    risks: {
      type: string;
      description: string;
      probability: number;
      impact: string;
      mitigation: string;
      status: string;
    }[];
    overallRiskScore: number;
    lastAssessment: Date;
  };

  // Performance Metrics
  @Column({ type: 'jsonb', nullable: true })
  performanceMetrics: {
    oee: number; // Overall Equipment Effectiveness
    availability: number;
    performance: number;
    quality: number;
    throughput: number;
    cycleTime: number;
    setupTime: number;
    downtime: number;
  };

  // Approvals and Workflow
  @Column({ type: 'jsonb', nullable: true })
  approvalWorkflow: {
    currentStage: string;
    approvals: {
      stage: string;
      approver: string;
      status: string;
      date: Date;
      comments: string;
    }[];
    requiredApprovals: string[];
  };

  // Change Management
  @Column({ type: 'jsonb', nullable: true })
  changeHistory: {
    changeId: string;
    date: Date;
    type: string;
    description: string;
    changedBy: string;
    approvedBy: string;
    impact: string;
    reason: string;
  }[];

  // Relationships
  @OneToMany(() => WorkOrder, (workOrder) => workOrder.productionOrder)
  workOrders: WorkOrder[];

  @ManyToOne(() => ProductionSchedule, (schedule) => schedule.productionOrders)
  @JoinColumn({ name: 'productionScheduleId' })
  productionSchedule: ProductionSchedule;

  @Column({ type: 'uuid', nullable: true })
  productionScheduleId: string;

  // Audit Fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  // Business Logic Methods
  isActive(): boolean {
    return [
      ProductionOrderStatus.RELEASED,
      ProductionOrderStatus.IN_PROGRESS,
    ].includes(this.status);
  }

  isCompleted(): boolean {
    return [
      ProductionOrderStatus.COMPLETED,
      ProductionOrderStatus.PARTIALLY_COMPLETED,
    ].includes(this.status);
  }

  getCompletionPercentage(): number {
    if (this.plannedQuantity === 0) return 0;
    return (this.producedQuantity / this.plannedQuantity) * 100;
  }

  getRemainingQuantity(): number {
    return Math.max(0, this.plannedQuantity - this.producedQuantity);
  }

  getYieldPercentage(): number {
    if (this.producedQuantity === 0) return 0;
    return (this.goodQuantity / this.producedQuantity) * 100;
  }

  getScrapPercentage(): number {
    if (this.producedQuantity === 0) return 0;
    return (this.scrapQuantity / this.producedQuantity) * 100;
  }

  isOnSchedule(): boolean {
    const now = new Date();
    if (this.status === ProductionOrderStatus.COMPLETED) {
      return this.actualEndDate <= this.scheduledEndDate;
    }
    const completionPercentage = this.getCompletionPercentage();
    const schedulePercentage = this.calculateSchedulePercentage();
    return completionPercentage >= schedulePercentage * 0.9; // 10% tolerance
  }

  private calculateSchedulePercentage(): number {
    const now = new Date();
    const totalDuration = this.scheduledEndDate.getTime() - this.scheduledStartDate.getTime();
    const elapsedDuration = now.getTime() - this.scheduledStartDate.getTime();
    return Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
  }

  getCostVariance(): number {
    return this.actualCost - this.estimatedCost;
  }

  getCostVariancePercentage(): number {
    if (this.estimatedCost === 0) return 0;
    return (this.getCostVariance() / this.estimatedCost) * 100;
  }

  getScheduleVariance(): number {
    if (!this.actualEndDate || !this.scheduledEndDate) return 0;
    return this.actualEndDate.getTime() - this.scheduledEndDate.getTime();
  }

  getScheduleVarianceDays(): number {
    return this.getScheduleVariance() / (1000 * 60 * 60 * 24);
  }

  canStart(): boolean {
    return (
      this.status === ProductionOrderStatus.PLANNED &&
      this.materialAvailability?.available === true &&
      !!this.productionLineId &&
      !!this.billOfMaterialsId
    );
  }

  needsAttention(): boolean {
    return (
      !this.isOnSchedule() ||
      this.getCostVariancePercentage() > 10 ||
      this.getYieldPercentage() < 90 ||
      (this.aiOptimization?.anomalies && Array.isArray(this.aiOptimization.anomalies) && this.aiOptimization.anomalies.length > 0)
    );
  }

  getPrioritizedRisks(): any[] {
    if (!this.riskAssessment?.risks) return [];
    return this.riskAssessment.risks
      .sort((a, b) => b.probability * this.getImpactWeight(b.impact) - 
                     a.probability * this.getImpactWeight(a.impact));
  }

  private getImpactWeight(impact: string): number {
    const weights: { [key: string]: number } = { low: 1, medium: 3, high: 5, critical: 7 };
    return weights[impact.toLowerCase()] || 1;
  }

  getEstimatedCompletionDate(): Date {
    if (this.status === ProductionOrderStatus.COMPLETED) {
      return this.actualEndDate;
    }
    
    const completionPercentage = this.getCompletionPercentage();
    if (completionPercentage === 0) {
      return this.scheduledEndDate;
    }
    
    const elapsedTime = Date.now() - this.actualStartDate?.getTime();
    const estimatedTotalTime = elapsedTime / (completionPercentage / 100);
    return new Date(this.actualStartDate.getTime() + estimatedTotalTime);
  }

  getQualityRating(): string {
    const score = this.qualityScore;
    if (score >= 95) return 'Excellent';
    if (score >= 90) return 'Good';
    if (score >= 80) return 'Satisfactory';
    if (score >= 70) return 'Needs Improvement';
    return 'Poor';
  }

  getSustainabilityRating(): string {
    const score = this.sustainabilityMetrics?.sustainabilityScore || 0;
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'E';
  }

  validateOrder(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.plannedQuantity <= 0) {
      errors.push('Planned quantity must be greater than zero');
    }

    if (!this.scheduledStartDate || !this.scheduledEndDate) {
      errors.push('Scheduled start and end dates are required');
    }

    if (this.scheduledStartDate >= this.scheduledEndDate) {
      errors.push('Scheduled start date must be before end date');
    }

    if (!this.productId) {
      errors.push('Product ID is required');
    }

    if (!this.productionLineId) {
      errors.push('Production line must be assigned');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
