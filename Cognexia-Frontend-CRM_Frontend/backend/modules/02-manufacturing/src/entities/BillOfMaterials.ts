// Industry 5.0 ERP Backend - Manufacturing Module
// BillOfMaterials Entity - Represents product bill of materials with AI optimization
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
import { BOMComponent } from './BOMComponent';
import { ProductionOrder } from './ProductionOrder';
import { Routing } from './Routing';

export enum BOMStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OBSOLETE = 'obsolete',
  UNDER_REVIEW = 'under_review',
}

export enum BOMType {
  MANUFACTURING = 'manufacturing',
  ENGINEERING = 'engineering',
  SALES = 'sales',
  COSTING = 'costing',
  PLANNING = 'planning',
}

export enum RevisionStatus {
  CURRENT = 'current',
  PREVIOUS = 'previous',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

@Entity('bill_of_materials')
@Index(['productId'])
@Index(['status'])
@Index(['type'])
@Index(['version'])
@Index(['effectiveDate'])
export class BillOfMaterials {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  bomNumber: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Product Information
  @Column({ type: 'uuid' })
  @Index()
  productId: string;

  @Column({ type: 'varchar', length: 100 })
  productSku: string;

  @Column({ type: 'varchar', length: 200 })
  productName: string;

  // BOM Configuration
  @Column({
    type: 'enum',
    enum: BOMType,
    default: BOMType.MANUFACTURING,
  })
  type: BOMType;

  @Column({
    type: 'enum',
    enum: BOMStatus,
    default: BOMStatus.DRAFT,
  })
  @Index()
  status: BOMStatus;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  version: string;

  @Column({
    type: 'enum',
    enum: RevisionStatus,
    default: RevisionStatus.CURRENT,
  })
  revisionStatus: RevisionStatus;

  // Dates and Validity
  @Column({ type: 'timestamp' })
  @Index()
  effectiveDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  obsoleteDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastReviewDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextReviewDate: Date;

  // Quantity and Units
  @Column({ type: 'decimal', precision: 10, scale: 4, default: 1 })
  baseQuantity: number;

  @Column({ type: 'varchar', length: 20 })
  baseUnit: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  totalCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  materialCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  laborCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  overheadCost: number;

  // Manufacturing Information
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  manufacturingLeadTime: number; // in days

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  setupTime: number; // in minutes

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cycleTime: number; // in minutes per unit

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  scrapFactor: number; // percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  yieldFactor: number; // percentage

  // Production Requirements
  @Column({ type: 'jsonb', nullable: true })
  productionRequirements: {
    facility: string;
    productionLine: string;
    workCenter: string;
    skillRequirements: string[];
    equipmentRequired: string[];
    toolsRequired: string[];
    certificationRequired: boolean;
  };

  // Quality and Compliance
  @Column({ type: 'jsonb', nullable: true })
  qualityRequirements: {
    standard: string;
    inspectionPoints: string[];
    testingRequired: boolean;
    certificationNeeded: boolean;
    documentationRequired: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  complianceRequirements: {
    regulation: string;
    requirement: string;
    documentation: string;
    auditRequired: boolean;
  }[];

  // Alternative BOMs and Configurations
  @Column({ type: 'jsonb', nullable: true })
  alternativeBOMs: {
    id: string;
    name: string;
    reason: string;
    costDifference: number;
    leadTimeDifference: number;
    qualityImpact: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  configurationOptions: {
    option: string;
    value: string;
    impact: string;
    additionalCost: number;
  }[];

  // Industry 5.0 Features
  @Column({ type: 'jsonb', nullable: true })
  aiOptimization: {
    costOptimization: {
      currentCost: number;
      optimizedCost: number;
      potentialSavings: number;
      recommendations: string[];
      lastAnalysis: Date;
    };
    sustainabilityScore: {
      score: number;
      carbonFootprint: number;
      recyclabilityRating: number;
      recommendations: string[];
    };
    riskAnalysis: {
      supplyRisk: number;
      qualityRisk: number;
      costVolatility: number;
      mitigation: string[];
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  digitalTwinData: {
    id: string;
    simulationResults: {
      efficiency: number;
      quality: number;
      cost: number;
      leadTime: number;
    };
    lastSimulation: Date;
    predictiveInsights: string[];
  };

  // Sustainability Metrics
  @Column({ type: 'jsonb', nullable: true })
  sustainabilityMetrics: {
    carbonFootprint: number; // kg CO2 equivalent
    energyConsumption: number; // kWh
    waterUsage: number; // liters
    wasteGeneration: number; // kg
    recyclabilityScore: number; // percentage
    sustainabilityRating: string; // A, B, C, D, E
  };

  // Supply Chain Information
  @Column({ type: 'jsonb', nullable: true })
  supplyChainData: {
    criticalComponents: string[];
    supplierDependency: {
      componentId: string;
      supplierId: string;
      riskLevel: string;
      alternativeSuppliers: number;
    }[];
    leadTimeAnalysis: {
      shortest: number;
      longest: number;
      average: number;
      variability: number;
    };
  };

  // Change Management
  @Column({ type: 'jsonb', nullable: true })
  changeHistory: {
    changeId: string;
    date: Date;
    reason: string;
    changedBy: string;
    impact: string;
    approvedBy: string;
    details: string;
  }[];

  // Approval Workflow
  @Column({ type: 'jsonb', nullable: true })
  approvalWorkflow: {
    currentStage: string;
    approvers: {
      role: string;
      userId: string;
      status: string;
      date: Date;
      comments: string;
    }[];
    requiredApprovals: string[];
  };

  // Relationships
  @OneToMany(() => BOMComponent, (component) => component.billOfMaterials)
  components: BOMComponent[];

  @OneToMany(() => ProductionOrder, (order) => order.billOfMaterials)
  productionOrders: ProductionOrder[];

  @OneToMany(() => Routing, (routing) => routing.billOfMaterials)
  routings: Routing[];

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
    return (
      this.status === BOMStatus.ACTIVE &&
      this.effectiveDate <= new Date() &&
      (!this.obsoleteDate || this.obsoleteDate > new Date())
    );
  }

  isCurrent(): boolean {
    return this.revisionStatus === RevisionStatus.CURRENT;
  }

  getTotalComponentCost(): number {
    return this.materialCost + this.laborCost + this.overheadCost;
  }

  calculateTotalLeadTime(): number {
    // This would typically calculate based on component lead times
    return this.manufacturingLeadTime || 0;
  }

  getCriticalPath(): string[] {
    // Implement critical path analysis for components
    return this.supplyChainData?.criticalComponents || [];
  }

  getSupplyRisk(): string {
    const riskScore = this.aiOptimization?.riskAnalysis?.supplyRisk || 0;
    if (riskScore < 0.3) return 'LOW';
    if (riskScore < 0.7) return 'MEDIUM';
    return 'HIGH';
  }

  getSustainabilityRating(): string {
    return this.sustainabilityMetrics?.sustainabilityRating || 'C';
  }

  requiresReview(): boolean {
    return (
      this.nextReviewDate !== null &&
      this.nextReviewDate <= new Date()
    );
  }

  canBeProduced(): boolean {
    return (
      this.isActive() &&
      this.status === BOMStatus.ACTIVE &&
      this.components?.length > 0
    );
  }

  calculateMaterialVariance(actualCost: number): number {
    return actualCost - this.materialCost;
  }

  getOptimizationRecommendations(): string[] {
    return this.aiOptimization?.costOptimization?.recommendations || [];
  }

  estimateProductionQuantity(availableComponents: Record<string, number>): number {
    // Calculate maximum production quantity based on available components
    let maxQuantity = Infinity;
    
    if (this.components) {
      for (const component of this.components) {
        const available = availableComponents[component.componentId] || 0;
        const required = component.quantity;
        const possibleQuantity = Math.floor(available / required);
        maxQuantity = Math.min(maxQuantity, possibleQuantity);
      }
    }
    
    return maxQuantity === Infinity ? 0 : maxQuantity;
  }

  validateBOM(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.components || this.components.length === 0) {
      errors.push('BOM must have at least one component');
    }

    if (this.totalCost <= 0) {
      errors.push('Total cost must be greater than zero');
    }

    if (this.baseQuantity <= 0) {
      errors.push('Base quantity must be greater than zero');
    }

    if (!this.effectiveDate || this.effectiveDate > new Date()) {
      errors.push('Effective date cannot be in the future');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
