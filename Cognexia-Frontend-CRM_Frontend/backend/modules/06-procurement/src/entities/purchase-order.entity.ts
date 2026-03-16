import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { IsOptional, IsEnum, IsJSON, IsArray, IsNumber, Min, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';
import { Supplier } from './supplier.entity';

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT_TO_SUPPLIER = 'sent_to_supplier',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  PARTIALLY_RECEIVED = 'partially_received',
  FULLY_RECEIVED = 'fully_received',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
  DISPUTED = 'disputed',
}

export enum PurchaseOrderType {
  STANDARD = 'standard',
  BLANKET = 'blanket',
  CONTRACT = 'contract',
  FRAMEWORK = 'framework',
  EMERGENCY = 'emergency',
  STANDING = 'standing',
  SERVICE = 'service',
  CAPITAL = 'capital',
  CONSIGNMENT = 'consignment',
}

export enum PurchaseOrderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUIRES_ADDITIONAL_APPROVAL = 'requires_additional_approval',
}

export interface AIOptimizationData {
  priceOptimization: {
    suggestedPrice: number;
    marketPrice: number;
    potentialSavings: number;
    confidenceScore: number;
  };
  supplierRecommendations: {
    alternativeSuppliers: string[];
    riskAssessment: number;
    performancePrediction: number;
  };
  demandForecasting: {
    predictedDemand: number;
    seasonalityFactor: number;
    trendAnalysis: string;
  };
  deliveryOptimization: {
    optimalDeliveryDate: Date;
    expediteRecommendation: boolean;
    logisticsOptimization: string;
  };
  contractTermsOptimization: {
    suggestedPaymentTerms: number;
    warrantyRecommendations: string[];
    serviceLevel: string;
  };
}

export interface ComplianceChecks {
  budgetCompliance: {
    approved: boolean;
    budgetCode: string;
    availableAmount: number;
    utilizationPercentage: number;
  };
  policyCompliance: {
    approved: boolean;
    violations: string[];
    exemptions: string[];
  };
  regulatoryCompliance: {
    approved: boolean;
    requirements: string[];
    certifications: string[];
  };
  contractCompliance: {
    approved: boolean;
    contractTerms: string[];
    deviations: string[];
  };
  sustainabilityCompliance: {
    approved: boolean;
    esgScore: number;
    certifications: string[];
  };
}

export interface ApprovalWorkflow {
  currentLevel: number;
  totalLevels: number;
  approvals: Array<{
    level: number;
    approverName: string;
    approverEmail: string;
    status: ApprovalStatus;
    approvedAt: Date | null;
    comments: string;
    delegatedTo: string | null;
  }>;
  escalations: Array<{
    level: number;
    reason: string;
    escalatedTo: string;
    escalatedAt: Date;
    resolved: boolean;
  }>;
  autoApprovalRules: {
    enabled: boolean;
    thresholds: Record<string, number>;
    conditions: string[];
  };
}

export interface DeliverySchedule {
  requestedDate: Date;
  promisedDate: Date;
  actualDate: Date | null;
  milestones: Array<{
    name: string;
    plannedDate: Date;
    actualDate: Date | null;
    status: string;
    description: string;
  }>;
  shippingDetails: {
    method: string;
    carrier: string;
    trackingNumber: string | null;
    estimatedTransitTime: number;
    shippingCost: number;
  };
  deliveryLocation: {
    name: string;
    address: string;
    contactPerson: string;
    contactPhone: string;
    specialInstructions: string;
  };
}

export interface QualityRequirements {
  inspectionRequired: boolean;
  qualityStandards: string[];
  testingRequirements: string[];
  certificationRequirements: string[];
  acceptanceCriteria: {
    defectRate: number;
    performanceMetrics: Record<string, number>;
    visualInspection: boolean;
    functionalTesting: boolean;
  };
  qualityPlan: {
    inspectionPoints: string[];
    documentation: string[];
    sampling: {
      method: string;
      sampleSize: number;
      frequency: string;
    };
  };
}

export interface ContractualTerms {
  paymentTerms: {
    terms: number;
    method: string;
    currency: string;
    discountTerms: string | null;
    penalties: string | null;
  };
  warranty: {
    period: number;
    coverage: string;
    terms: string;
    serviceLevel: string;
  };
  liability: {
    limitation: number;
    insurance: string;
    indemnification: string;
  };
  intellectual_property: {
    ownership: string;
    usage_rights: string;
    confidentiality: string;
  };
  dispute_resolution: {
    method: string;
    jurisdiction: string;
    governing_law: string;
  };
}

export interface BlockchainData {
  transactionHash: string | null;
  smartContractAddress: string | null;
  blockNumber: number | null;
  verificationStatus: 'pending' | 'verified' | 'failed';
  immutableRecord: boolean;
  digitalSignatures: Array<{
    signer: string;
    signature: string;
    timestamp: Date;
    verified: boolean;
  }>;
  auditTrail: Array<{
    action: string;
    actor: string;
    timestamp: Date;
    blockHash: string;
    verified: boolean;
  }>;
}

@Entity('purchase_orders')
@Index(['status', 'priority'])
@Index(['supplierId', 'orderDate'])
@Index(['totalValue'], { where: 'total_value IS NOT NULL' })
@Index(['requestedDeliveryDate'])
@Index(['createdBy', 'orderDate'])
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  poNumber: string;

  @Column({
    type: 'enum',
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.DRAFT,
  })
  status: PurchaseOrderStatus;

  @Column({
    type: 'enum',
    enum: PurchaseOrderType,
    default: PurchaseOrderType.STANDARD,
  })
  orderType: PurchaseOrderType;

  @Column({
    type: 'enum',
    enum: PurchaseOrderPriority,
    default: PurchaseOrderPriority.NORMAL,
  })
  priority: PurchaseOrderPriority;

  // Supplier Information
  @Column('uuid')
  supplierId: string;

  @ManyToOne(() => Supplier, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ length: 255, nullable: true })
  supplierOrderNumber: string;

  @Column({ length: 255, nullable: true })
  supplierContact: string;

  // Order Details
  @Column({ type: 'date' })
  @Index()
  orderDate: Date;

  @Column({ type: 'date' })
  requestedDeliveryDate: Date;

  @Column({ type: 'date', nullable: true })
  promisedDeliveryDate: Date;

  @Column({ type: 'date', nullable: true })
  actualDeliveryDate: Date;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { nullable: true })
  internalNotes: string;

  @Column('text', { nullable: true })
  supplierNotes: string;

  // Financial Information
  @Column('decimal', { precision: 15, scale: 2 })
  @IsPositive()
  subtotal: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  @Min(0)
  taxAmount: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  @Min(0)
  shippingAmount: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  @Min(0)
  discountAmount: number;

  @Column('decimal', { precision: 15, scale: 2 })
  @IsPositive()
  totalValue: number;

  @Column({ length: 10, default: 'USD' })
  currency: string;

  @Column('decimal', { precision: 10, scale: 6, default: 1.0 })
  @IsPositive()
  exchangeRate: number;

  // Budget and Cost Center
  @Column({ length: 50, nullable: true })
  budgetCode: string;

  @Column({ length: 50, nullable: true })
  costCenter: string;

  @Column({ length: 50, nullable: true })
  glAccount: string;

  @Column({ length: 100, nullable: true })
  project: string;

  @Column({ length: 100, nullable: true })
  department: string;

  // Approval Information
  @Column({ type: 'jsonb' })
  @IsJSON()
  approvalWorkflow: ApprovalWorkflow;

  @Column({ length: 255, nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt: Date;

  @Column('text', { nullable: true })
  approvalComments: string;

  // Delivery Information
  @Column({ type: 'jsonb', nullable: true })
  @IsJSON()
  deliverySchedule: DeliverySchedule;

  @Column({ length: 500, nullable: true })
  deliveryAddress: string;

  @Column({ length: 255, nullable: true })
  deliveryContact: string;

  @Column({ length: 20, nullable: true })
  deliveryPhone: string;

  @Column('text', { nullable: true })
  specialInstructions: string;

  // Quality and Compliance
  @Column({ type: 'jsonb', nullable: true })
  @IsJSON()
  qualityRequirements: QualityRequirements;

  @Column({ type: 'jsonb', nullable: true })
  @IsJSON()
  complianceChecks: ComplianceChecks;

  @Column('simple-array', { nullable: true })
  attachments: string[];

  @Column('simple-array', { nullable: true })
  requiredDocuments: string[];

  // Terms and Conditions
  @Column({ type: 'jsonb', nullable: true })
  @IsJSON()
  contractualTerms: ContractualTerms;

  @Column({ type: 'int', default: 30 })
  paymentTerms: number;

  @Column('text', { nullable: true })
  termsAndConditions: string;

  // AI and Machine Learning
  @Column({ type: 'jsonb', nullable: true })
  @IsJSON()
  aiOptimization: AIOptimizationData;

  @Column({ type: 'boolean', default: false })
  aiGenerated: boolean;

  @Column({ type: 'boolean', default: false })
  autoApproved: boolean;

  @Column('simple-array', { nullable: true })
  aiRecommendations: string[];

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  @Min(0)
  @Max(100)
  aiConfidenceScore: number;

  // Performance Metrics
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  @Min(0)
  cycleTime: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  @Min(0)
  approvalTime: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  @Min(0)
  processingTime: number;

  @Column({ type: 'int', nullable: true })
  @Min(0)
  revisionCount: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  @Min(0)
  @Max(100)
  supplierPerformanceScore: number;

  // Risk Management
  @Column('simple-array', { nullable: true })
  riskFactors: string[];

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  @Min(0)
  @Max(100)
  riskScore: number;

  @Column('simple-array', { nullable: true })
  mitigationActions: string[];

  // Blockchain Integration
  @Column({ type: 'jsonb', nullable: true })
  @IsJSON()
  blockchainData: BlockchainData;

  @Column({ type: 'boolean', default: false })
  blockchainEnabled: boolean;

  // Change Management
  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'jsonb', nullable: true })
  @IsJSON()
  changeHistory: Array<{
    version: number;
    changedBy: string;
    changedAt: Date;
    changes: string[];
    reason: string;
  }>;

  @Column({ type: 'boolean', default: false })
  locked: boolean;

  @Column({ length: 255, nullable: true })
  lockedBy: string;

  @Column({ type: 'timestamptz', nullable: true })
  lockedAt: Date;

  // Communication
  @Column({ type: 'boolean', default: false })
  communicationSent: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  sentToSupplierAt: Date;

  @Column({ type: 'boolean', default: false })
  supplierAcknowledged: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  acknowledgedAt: Date;

  @Column('simple-array', { nullable: true })
  communicationHistory: string[];

  // Performance Tracking
  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  @Min(0)
  @Max(100)
  onTimeDeliveryScore: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  @Min(0)
  @Max(100)
  qualityScore: number;

  @Column({ type: 'boolean', default: false })
  exceptionsOccurred: boolean;

  @Column('simple-array', { nullable: true })
  exceptions: string[];

  // Integration Data
  @Column({ length: 255, nullable: true })
  externalSystemId: string;

  @Column({ length: 100, nullable: true })
  sourceSystem: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsJSON()
  integrationData: Record<string, any>;

  // System Fields
  @Column({ length: 255 })
  createdBy: string;

  @Column({ length: 255, nullable: true })
  updatedBy: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  @IsJSON()
  customFields: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  // Relationships
  // @OneToMany(() => PurchaseOrderLine, line => line.purchaseOrder, { cascade: true })
  // lines: PurchaseOrderLine[];

  @BeforeInsert()
  generatePONumber() {
    if (!this.poNumber) {
      const year = new Date().getFullYear().toString().slice(-2);
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 4).toUpperCase();
      this.poNumber = `PO${year}${timestamp}${random}`;
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  calculateTotalValue() {
    this.totalValue = this.subtotal + this.taxAmount + this.shippingAmount - this.discountAmount;
  }

  @BeforeInsert()
  @BeforeUpdate()
  updateTimestamps() {
    if (this.status === PurchaseOrderStatus.SENT_TO_SUPPLIER && !this.sentToSupplierAt) {
      this.sentToSupplierAt = new Date();
      this.communicationSent = true;
    }

    if (this.status === PurchaseOrderStatus.ACKNOWLEDGED && !this.acknowledgedAt) {
      this.acknowledgedAt = new Date();
      this.supplierAcknowledged = true;
    }

    if (this.status === PurchaseOrderStatus.FULLY_RECEIVED && !this.actualDeliveryDate) {
      this.actualDeliveryDate = new Date();
    }
  }

  // Helper Methods
  getPOSummary() {
    return {
      id: this.id,
      poNumber: this.poNumber,
      status: this.status,
      orderType: this.orderType,
      priority: this.priority,
      supplierId: this.supplierId,
      orderDate: this.orderDate,
      requestedDeliveryDate: this.requestedDeliveryDate,
      totalValue: this.totalValue,
      currency: this.currency,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
    };
  }

  isOverdue(): boolean {
    const now = new Date();
    return this.requestedDeliveryDate < now && this.status !== PurchaseOrderStatus.COMPLETED;
  }

  getApprovalStatus(): ApprovalStatus {
    if (!this.approvalWorkflow || !this.approvalWorkflow.approvals) {
      return ApprovalStatus.PENDING;
    }

    const currentApproval = this.approvalWorkflow.approvals.find(
      approval => approval.level === this.approvalWorkflow.currentLevel
    );

    return currentApproval ? currentApproval.status : ApprovalStatus.PENDING;
  }

  canBeModified(): boolean {
    return !this.locked && [
      PurchaseOrderStatus.DRAFT,
      PurchaseOrderStatus.PENDING_APPROVAL,
    ].includes(this.status);
  }

  addChangeHistory(changedBy: string, changes: string[], reason: string) {
    if (!this.changeHistory) {
      this.changeHistory = [];
    }

    this.version += 1;
    this.changeHistory.push({
      version: this.version,
      changedBy,
      changedAt: new Date(),
      changes,
      reason,
    });
  }

  updateAIOptimization(optimization: Partial<AIOptimizationData>) {
    this.aiOptimization = {
      ...this.aiOptimization,
      ...optimization,
    };
  }

  addRiskFactor(riskFactor: string, mitigationAction?: string) {
    if (!this.riskFactors) {
      this.riskFactors = [];
    }
    if (!this.mitigationActions) {
      this.mitigationActions = [];
    }

    if (!this.riskFactors.includes(riskFactor)) {
      this.riskFactors.push(riskFactor);
    }

    if (mitigationAction && !this.mitigationActions.includes(mitigationAction)) {
      this.mitigationActions.push(mitigationAction);
    }
  }

  calculatePerformanceMetrics() {
    // Calculate on-time delivery score
    if (this.actualDeliveryDate && this.requestedDeliveryDate) {
      const timeDiff = this.actualDeliveryDate.getTime() - this.requestedDeliveryDate.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);
      
      if (daysDiff <= 0) {
        this.onTimeDeliveryScore = 100;
      } else if (daysDiff <= 7) {
        this.onTimeDeliveryScore = 90 - (daysDiff * 10);
      } else {
        this.onTimeDeliveryScore = Math.max(0, 20 - daysDiff);
      }
    }

    // Calculate cycle time
    if (this.createdAt && this.actualDeliveryDate) {
      const cycleTime = (this.actualDeliveryDate.getTime() - this.createdAt.getTime()) / (1000 * 3600 * 24);
      this.cycleTime = cycleTime;
    }

    // Calculate processing time
    if (this.createdAt && this.sentToSupplierAt) {
      const processingTime = (this.sentToSupplierAt.getTime() - this.createdAt.getTime()) / (1000 * 3600);
      this.processingTime = processingTime;
    }
  }

  isHighValue(): boolean {
    return this.totalValue >= 100000; // $100k threshold
  }

  requiresSpecialApproval(): boolean {
    return this.isHighValue() || 
           this.priority === PurchaseOrderPriority.CRITICAL || 
           this.orderType === PurchaseOrderType.EMERGENCY ||
           (this.riskScore && this.riskScore > 70);
  }
}
