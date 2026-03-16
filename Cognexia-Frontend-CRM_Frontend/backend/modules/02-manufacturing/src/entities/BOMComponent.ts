// Industry 5.0 ERP Backend - Manufacturing Module
// BOMComponent Entity - Represents individual components in a bill of materials
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BillOfMaterials } from './BillOfMaterials';

export enum ComponentType {
  RAW_MATERIAL = 'raw_material',
  COMPONENT = 'component',
  SUB_ASSEMBLY = 'sub_assembly',
  CONSUMABLE = 'consumable',
  PACKAGING = 'packaging',
  TOOL = 'tool',
}

export enum ComponentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OBSOLETE = 'obsolete',
  SUBSTITUTE_AVAILABLE = 'substitute_available',
}

export enum ConsumptionType {
  FIXED = 'fixed',
  VARIABLE = 'variable',
  BATCH = 'batch',
  FORMULA_BASED = 'formula_based',
}

@Entity('bom_components')
@Index(['billOfMaterialsId'])
@Index(['componentId'])
@Index(['componentType'])
@Index(['status'])
export class BOMComponent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // BOM Reference
  @Column({ type: 'uuid' })
  @Index()
  billOfMaterialsId: string;

  @ManyToOne(() => BillOfMaterials, (bom) => bom.components)
  @JoinColumn({ name: 'billOfMaterialsId' })
  billOfMaterials: BillOfMaterials;

  // Component Information
  @Column({ type: 'uuid' })
  @Index()
  componentId: string;

  @Column({ type: 'varchar', length: 100 })
  componentSku: string;

  @Column({ type: 'varchar', length: 200 })
  componentName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ComponentType,
    default: ComponentType.COMPONENT,
  })
  @Index()
  componentType: ComponentType;

  @Column({
    type: 'enum',
    enum: ComponentStatus,
    default: ComponentStatus.ACTIVE,
  })
  @Index()
  status: ComponentStatus;

  // Quantity and Consumption
  @Column({ type: 'decimal', precision: 15, scale: 6 })
  quantity: number;

  @Column({ type: 'varchar', length: 20 })
  unit: string;

  @Column({
    type: 'enum',
    enum: ConsumptionType,
    default: ConsumptionType.FIXED,
  })
  consumptionType: ConsumptionType;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  scrapPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  allowancePercentage: number;

  // Cost Information
  @Column({ type: 'decimal', precision: 12, scale: 4 })
  unitCost: number;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  totalCost: number;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'timestamp', nullable: true })
  costLastUpdated: Date;

  // Timing and Scheduling
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  leadTime: number; // in days

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  offset: number; // offset from production start (in days)

  @Column({ type: 'boolean', default: false })
  isCriticalPath: boolean;

  @Column({ type: 'integer', default: 1 })
  sequenceNumber: number;

  // Supply Chain Information
  @Column({ type: 'uuid', nullable: true })
  primarySupplierId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  primarySupplierName: string;

  @Column({ type: 'jsonb', nullable: true })
  alternativeSuppliers: {
    supplierId: string;
    supplierName: string;
    unitCost: number;
    leadTime: number;
    qualityRating: number;
    priority: number;
  }[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumOrderQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  economicOrderQuantity: number;

  // Quality and Specifications
  @Column({ type: 'jsonb', nullable: true })
  specifications: {
    parameter: string;
    value: string;
    tolerance: string;
    unit: string;
    critical: boolean;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  qualityRequirements: {
    standard: string;
    grade: string;
    certification: string;
    testingRequired: boolean;
    inspectionLevel: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  materialProperties: {
    property: string;
    value: string;
    unit: string;
    testMethod: string;
  }[];

  // Manufacturing Instructions
  @Column({ type: 'jsonb', nullable: true })
  processingInstructions: {
    operation: string;
    instruction: string;
    parameters: Record<string, any>;
    safety: string[];
    quality: string[];
  }[];

  @Column({ type: 'jsonb', nullable: true })
  handlingInstructions: {
    storage: string;
    handling: string;
    safety: string[];
    environmentalRequirements: string[];
  };

  // Substitutes and Alternatives
  @Column({ type: 'jsonb', nullable: true })
  substitutes: {
    componentId: string;
    componentSku: string;
    componentName: string;
    substitutionRatio: number;
    costDifference: number;
    qualityImpact: string;
    approvalRequired: boolean;
  }[];

  @Column({ type: 'boolean', default: false })
  allowSubstitution: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  substitutionNotes: string;

  // Environmental and Sustainability
  @Column({ type: 'jsonb', nullable: true })
  environmentalData: {
    carbonFootprint: number; // kg CO2 equivalent
    recyclable: boolean;
    recycledContent: number; // percentage
    hazardousMaterial: boolean;
    rohs: boolean; // RoHS compliance
    reach: boolean; // REACH compliance
  };

  @Column({ type: 'jsonb', nullable: true })
  sustainabilityMetrics: {
    sustainabilityRating: string;
    localSourcing: boolean;
    ethicalSourcing: boolean;
    certifications: string[];
  };

  // Engineering and Design
  @Column({ type: 'varchar', length: 100, nullable: true })
  drawingNumber: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  revision: string;

  @Column({ type: 'jsonb', nullable: true })
  engineeringData: {
    cad: {
      fileName: string;
      version: string;
      lastModified: Date;
    };
    drawings: {
      type: string;
      number: string;
      revision: string;
      fileName: string;
    }[];
    specifications: {
      document: string;
      section: string;
      revision: string;
    }[];
  };

  // Industry 5.0 Features
  @Column({ type: 'jsonb', nullable: true })
  digitalTwinData: {
    id: string;
    properties: Record<string, any>;
    simulationResults: Record<string, any>;
    lastSync: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  aiInsights: {
    demandForecast: {
      nextPeriod: number;
      confidence: number;
      trend: string;
    };
    costOptimization: {
      recommendations: string[];
      potentialSavings: number;
    };
    qualityPrediction: {
      score: number;
      riskFactors: string[];
    };
    lastAnalysis: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  iotData: {
    sensors: {
      type: string;
      location: string;
      lastReading: Date;
      value: number;
      unit: string;
    }[];
    trackingEnabled: boolean;
    realTimeMonitoring: boolean;
  };

  // Batch and Lot Tracking
  @Column({ type: 'boolean', default: false })
  batchTracked: boolean;

  @Column({ type: 'boolean', default: false })
  lotTracked: boolean;

  @Column({ type: 'boolean', default: false })
  serialTracked: boolean;

  @Column({ type: 'integer', nullable: true })
  shelfLife: number; // in days

  @Column({ type: 'jsonb', nullable: true })
  traceabilityRequirements: {
    required: boolean;
    level: string; // batch, lot, serial
    regulations: string[];
    documentation: string[];
  };

  // Approval and Change Control
  @Column({ type: 'jsonb', nullable: true })
  changeHistory: {
    changeId: string;
    date: Date;
    reason: string;
    changedBy: string;
    approvedBy: string;
    oldValue: any;
    newValue: any;
  }[];

  @Column({ type: 'boolean', default: false })
  engineeringApprovalRequired: boolean;

  @Column({ type: 'boolean', default: false })
  qualityApprovalRequired: boolean;

  // Audit Fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  // Business Logic Methods
  isActive(): boolean {
    return this.status === ComponentStatus.ACTIVE;
  }

  calculateTotalCostWithWaste(): number {
    const baseQuantity = this.quantity;
    const scrapQuantity = (baseQuantity * this.scrapPercentage) / 100;
    const allowanceQuantity = (baseQuantity * this.allowancePercentage) / 100;
    const totalQuantity = baseQuantity + scrapQuantity + allowanceQuantity;
    return totalQuantity * this.unitCost;
  }

  getEffectiveQuantity(): number {
    const baseQuantity = this.quantity;
    const scrapQuantity = (baseQuantity * this.scrapPercentage) / 100;
    const allowanceQuantity = (baseQuantity * this.allowancePercentage) / 100;
    return baseQuantity + scrapQuantity + allowanceQuantity;
  }

  hasSubstitutes(): boolean {
    return this.substitutes && this.substitutes.length > 0;
  }

  getBestSubstitute(): any | null {
    if (!this.hasSubstitutes()) return null;
    return this.substitutes[0]; // Assuming first substitute is the best
  }

  getCostVariance(actualCost: number): number {
    return actualCost - this.unitCost;
  }

  isEcoFriendly(): boolean {
    const env = this.environmentalData;
    return env?.recyclable && env?.rohs && env?.reach && !env?.hazardousMaterial;
  }

  requiresSpecialHandling(): boolean {
    return this.environmentalData?.hazardousMaterial || false;
  }

  isCriticalComponent(): boolean {
    return this.isCriticalPath || this.componentType === ComponentType.SUB_ASSEMBLY;
  }

  getLeadTimeRisk(): string {
    const leadTime = this.leadTime || 0;
    if (leadTime > 30) return 'HIGH';
    if (leadTime > 14) return 'MEDIUM';
    return 'LOW';
  }

  calculateOrderQuantity(productionQuantity: number): number {
    const requiredQuantity = this.getEffectiveQuantity() * productionQuantity;
    const moq = this.minimumOrderQuantity || 0;
    return Math.max(requiredQuantity, moq);
  }

  needsQualityInspection(): boolean {
    return this.qualityRequirements?.testingRequired || false;
  }

  getSustainabilityScore(): number {
    const env = this.environmentalData;
    const sust = this.sustainabilityMetrics;
    
    let score = 0;
    if (env?.recyclable) score += 20;
    if (env?.rohs) score += 10;
    if (env?.reach) score += 10;
    if (sust?.localSourcing) score += 20;
    if (sust?.ethicalSourcing) score += 20;
    if (env?.recycledContent && env.recycledContent > 50) score += 20;
    
    return Math.min(score, 100);
  }

  validateComponent(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.quantity <= 0) {
      errors.push('Quantity must be greater than zero');
    }

    if (this.unitCost < 0) {
      errors.push('Unit cost cannot be negative');
    }

    if (!this.componentSku || this.componentSku.trim() === '') {
      errors.push('Component SKU is required');
    }

    if (!this.unit || this.unit.trim() === '') {
      errors.push('Unit of measure is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
