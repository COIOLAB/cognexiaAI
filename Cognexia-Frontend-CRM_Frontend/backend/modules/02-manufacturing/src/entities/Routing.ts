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
import { BillOfMaterials } from './BillOfMaterials';
import { RoutingOperation } from './RoutingOperation';

export enum RoutingStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OBSOLETE = 'obsolete',
}

export enum RoutingType {
  STANDARD = 'standard',
  ALTERNATE = 'alternate',
  BACKUP = 'backup',
  CUSTOM = 'custom',
}

@Entity('routings')
@Index(['code'], { unique: true })
@Index(['status'])
@Index(['type'])
@Index(['billOfMaterialsId'])
export class Routing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: RoutingType,
    default: RoutingType.STANDARD,
  })
  type: RoutingType;

  @Column({
    type: 'enum',
    enum: RoutingStatus,
    default: RoutingStatus.DRAFT,
  })
  status: RoutingStatus;

  @Column({ length: 10, default: '1.0' })
  version: string;

  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  // Performance Metrics
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalLeadTime: number; // Minutes

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalProcessTime: number; // Minutes

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSetupTime: number; // Minutes

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalCost: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  efficiency: number; // Percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 99 })
  qualityYield: number; // Percentage

  // Planning Information
  @Column({ type: 'int', default: 1 })
  lotSize: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minimumLotSize: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  maximumLotSize: number;

  @Column({ type: 'boolean', default: false })
  isParallel: boolean; // Can operations run in parallel

  @Column({ type: 'boolean', default: false })
  isFlexible: boolean; // Can skip non-critical operations

  // Industry 5.0 Features
  @Column({ type: 'boolean', default: false })
  isAiOptimized: boolean;

  @Column({ type: 'boolean', default: false })
  hasDigitalTwin: boolean;

  @Column({ type: 'boolean', default: false })
  isDynamicRouting: boolean; // Can be modified real-time

  @Column({ type: 'boolean', default: false })
  hasPredictiveScheduling: boolean;

  // AI Configuration
  @Column({ type: 'jsonb', nullable: true })
  aiConfiguration: {
    optimizationModel: string;
    parameters: object;
    lastOptimization: Date;
    improvementPercentage: number;
  };

  // Quality Configuration
  @Column({ type: 'jsonb', nullable: true })
  qualityConfiguration: {
    inspectionPoints: string[];
    tolerances: object;
    qualityStandards: string[];
    controlPlan: string;
  };

  // Environmental Impact
  @Column({ type: 'jsonb', nullable: true })
  environmentalImpact: {
    energyConsumption: number; // kWh
    co2Emission: number; // kg
    wasteGeneration: number; // kg
    waterUsage: number; // liters
    recyclability: number; // percentage
  };

  // Safety Requirements
  @Column({ type: 'jsonb', nullable: true })
  safetyRequirements: {
    hazards: string[];
    protectiveEquipment: string[];
    safetyProcedures: string[];
    riskLevel: string;
  };

  // Documentation
  @Column({ type: 'jsonb', nullable: true })
  documentation: {
    workInstructions: string[];
    drawingNumbers: string[];
    specifications: string[];
    videos: string[];
    images: string[];
  };

  // Approval Workflow
  @Column({ type: 'jsonb', nullable: true })
  approvalWorkflow: {
    approvers: string[];
    approvalDate: Date;
    approvedBy: string;
    comments: string;
    revisionHistory: object[];
  };

  // Relationships
  @Column({ nullable: true })
  billOfMaterialsId: string;

  @ManyToOne(() => BillOfMaterials, (bom) => bom.routings)
  @JoinColumn({ name: 'billOfMaterialsId' })
  billOfMaterials: BillOfMaterials;

  @OneToMany(() => RoutingOperation, (operation) => operation.routing, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  operations: RoutingOperation[];

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100, nullable: true })
  createdBy: string;

  @Column({ length: 100, nullable: true })
  updatedBy: string;

  // Methods
  calculateTotalTime(): number {
    return this.operations?.reduce(
      (total, operation) => total + (operation.processTime || 0) + (operation.setupTime || 0),
      0
    ) || 0;
  }

  calculateCriticalPath(): RoutingOperation[] {
    // Simple critical path calculation - can be enhanced with proper algorithm
    return this.operations?.sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0)) || [];
  }

  getBottleneckOperation(): RoutingOperation | null {
    if (!this.operations || this.operations.length === 0) {
      return null;
    }

    return this.operations.reduce((bottleneck: RoutingOperation | null, operation: RoutingOperation) => {
      if (!bottleneck) return operation;
      const currentCycleTime = (operation.processTime || 0) / (operation.workCenter?.hourlyCapacity || 1);
      const bottleneckCycleTime = (bottleneck.processTime || 0) / (bottleneck.workCenter?.hourlyCapacity || 1);
      return currentCycleTime > bottleneckCycleTime ? operation : bottleneck;
    }, null);
  }

  estimateCompletionTime(quantity: number): number {
    const totalProcessTime = this.calculateTotalTime();
    const efficiency = this.efficiency / 100;
    return (totalProcessTime * quantity) / efficiency;
  }

  validateRouting(): string[] {
    const errors: string[] = [];

    if (!this.operations || this.operations.length === 0) {
      errors.push('Routing must have at least one operation');
    }

    // Check for duplicate sequence numbers
    const sequences = this.operations?.map(op => op.sequenceNumber) || [];
    const uniqueSequences = new Set(sequences);
    if (sequences.length !== uniqueSequences.size) {
      errors.push('Duplicate sequence numbers found');
    }

    // Check for missing work centers
    const missingWorkCenters = this.operations?.filter(op => !op.workCenter) || [];
    if (missingWorkCenters.length > 0) {
      errors.push('Some operations are missing work center assignments');
    }

    return errors;
  }

  clone(newCode: string, newName: string): Partial<Routing> {
    return {
      code: newCode,
      name: newName,
      description: this.description,
      type: this.type,
      status: RoutingStatus.DRAFT,
      version: '1.0',
      lotSize: this.lotSize,
      isParallel: this.isParallel,
      isFlexible: this.isFlexible,
      qualityConfiguration: this.qualityConfiguration,
      environmentalImpact: this.environmentalImpact,
      safetyRequirements: this.safetyRequirements,
      documentation: this.documentation,
    };
  }
}
