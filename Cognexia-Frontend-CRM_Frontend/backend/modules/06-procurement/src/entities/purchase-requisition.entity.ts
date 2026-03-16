// Industry 5.0 ERP Backend - Procurement Module
// PurchaseRequisition Entity - Advanced purchase requisition management with AI workflow optimization
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { LineItem } from './line-item.entity';
import { ProcurementCategory } from './procurement-category.entity';

export enum RequisitionStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PARTIALLY_FULFILLED = 'partially_fulfilled',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export enum RequisitionType {
  STANDARD = 'standard',
  EMERGENCY = 'emergency',
  BLANKET = 'blanket',
  PLANNED = 'planned',
  CAPITAL = 'capital',
  SERVICES = 'services',
  MAINTENANCE = 'maintenance',
  IT_EQUIPMENT = 'it_equipment'
}

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

export enum ApprovalStatus {
  NOT_REQUIRED = 'not_required',
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUIRES_ADDITIONAL_APPROVAL = 'requires_additional_approval'
}

@Entity('purchase_requisitions')
@Index(['requisitionNumber'])
@Index(['status', 'type'])
@Index(['requestedBy', 'requestedDate'])
@Index(['department', 'costCenter'])
export class PurchaseRequisition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  requisitionNumber: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: RequisitionType,
    default: RequisitionType.STANDARD
  })
  type: RequisitionType;

  @Column({
    type: 'enum',
    enum: RequisitionStatus,
    default: RequisitionStatus.DRAFT
  })
  status: RequisitionStatus;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.NORMAL
  })
  priority: Priority;

  // Requestor Information
  @Column({ length: 100 })
  requestedBy: string;

  @Column({ length: 100 })
  requestorEmail: string;

  @Column({ length: 50, nullable: true })
  requestorPhone: string;

  @Column({ length: 100 })
  department: string;

  @Column({ length: 100, nullable: true })
  costCenter: string;

  @Column({ length: 100, nullable: true })
  project: string;

  @Column({ length: 100, nullable: true })
  budgetCode: string;

  // Dates and Timeline
  @Column({ type: 'timestamp' })
  requestedDate: Date;

  @Column({ type: 'timestamp' })
  requiredDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvalDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  submittedDate: Date;

  // Financial Information
  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  totalEstimatedCost: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  actualTotalCost: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  budgetLimit: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  exchangeRate: number;

  // Category and Classification
  @Column({ type: 'uuid', nullable: true })
  categoryId: string;

  @ManyToOne(() => ProcurementCategory, category => category.requisitions)
  @JoinColumn({ name: 'categoryId' })
  category: ProcurementCategory;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  // Business Justification
  @Column({ type: 'text' })
  businessJustification: string;

  @Column({ type: 'json', nullable: true })
  alternatives: {
    description: string;
    cost: number;
    pros: string[];
    cons: string[];
    feasibility: 'high' | 'medium' | 'low';
  }[];

  // Approval Workflow
  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.NOT_REQUIRED
  })
  approvalStatus: ApprovalStatus;

  @Column({ type: 'json', nullable: true })
  approvalWorkflow: {
    level: number;
    approverName: string;
    approverEmail: string;
    approverRole: string;
    requiredAmount?: number;
    status: ApprovalStatus;
    approvedDate?: Date;
    comments?: string;
    digitalSignature?: string;
  }[];

  @Column({ length: 100, nullable: true })
  currentApprover: string;

  // Vendor and Sourcing Information
  @Column({ type: 'json', nullable: true })
  preferredVendors: {
    vendorId: string;
    vendorName: string;
    contactPerson: string;
    contactEmail: string;
    reason: string;
    estimatedCost?: number;
  }[];

  @Column({ type: 'json', nullable: true })
  sourcingStrategy: {
    method: 'single_source' | 'competitive_bidding' | 'rfq' | 'spot_buy' | 'contract';
    reason: string;
    minimumVendors?: number;
    evaluationCriteria?: string[];
  };

  // Technical Specifications
  @Column({ type: 'json', nullable: true })
  specifications: {
    category: string;
    specification: string;
    value: string;
    unit?: string;
    mandatory: boolean;
    tolerance?: string;
  }[];

  @Column({ type: 'json', nullable: true })
  technicalDocuments: {
    documentType: string;
    fileName: string;
    filePath: string;
    uploadedBy: string;
    uploadedDate: Date;
    fileSize: number;
  }[];

  // Delivery and Installation
  @Column({ type: 'json' })
  deliveryAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    contactPerson?: string;
    contactPhone?: string;
    specialInstructions?: string;
  };

  @Column({ type: 'json', nullable: true })
  installationRequirements: {
    required: boolean;
    specialRequirements?: string[];
    timeframe?: string;
    resources?: string[];
    costs?: number;
  };

  // Quality and Compliance
  @Column({ type: 'json', nullable: true })
  qualityRequirements: {
    standards: string[];
    certifications: string[];
    inspectionRequired: boolean;
    testingRequired: boolean;
    warrantyPeriod?: string;
    qualityDocuments?: string[];
  };

  @Column({ type: 'json', nullable: true })
  complianceRequirements: {
    regulations: string[];
    licenses: string[];
    environmentalRequirements: string[];
    safetyRequirements: string[];
    securityClearance?: string;
  };

  // Risk Assessment
  @Column({ type: 'json', nullable: true })
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: {
      factor: string;
      probability: number;
      impact: number;
      mitigationStrategy: string;
    }[];
    overallRiskScore: number;
    mitigationPlan?: string;
  };

  // AI and Analytics
  @Column({ type: 'json', nullable: true })
  aiAnalytics: {
    costPrediction?: {
      predictedCost: number;
      confidence: number;
      factors: string[];
    };
    vendorRecommendations?: {
      vendorId: string;
      score: number;
      reasons: string[];
    }[];
    marketAnalysis?: {
      marketPrice: number;
      priceRange: { min: number; max: number };
      marketTrend: 'rising' | 'stable' | 'falling';
      seasonalFactors?: string[];
    };
    riskAnalysis?: {
      supplyRisk: number;
      qualityRisk: number;
      deliveryRisk: number;
      costRisk: number;
      recommendations: string[];
    };
    urgencyScore?: number;
    complexityScore?: number;
  };

  // Performance Metrics
  @Column({ type: 'json', nullable: true })
  performanceMetrics: {
    cycleTime?: {
      requestToApproval: number;
      approvalToOrder: number;
      orderToDelivery: number;
      totalCycleTime: number;
    };
    costEfficiency?: {
      budgetVariance: number;
      costSavings: number;
      priceComparison: number;
    };
    qualityMetrics?: {
      defectRate: number;
      returnRate: number;
      customerSatisfaction: number;
    };
  };

  // Integration and External References
  @Column({ length: 100, nullable: true })
  erpIntegrationId: string;

  @Column({ length: 100, nullable: true })
  budgetSystemId: string;

  @Column({ length: 100, nullable: true })
  workflowSystemId: string;

  @Column({ type: 'json', nullable: true })
  externalReferences: {
    system: string;
    referenceId: string;
    referenceType: string;
    syncStatus: 'synced' | 'pending' | 'failed';
    lastSync?: Date;
  }[];

  // Comments and Notes
  @Column({ type: 'text', nullable: true })
  internalNotes: string;

  @Column({ type: 'text', nullable: true })
  approverComments: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  // Relationships
  @OneToMany(() => LineItem, lineItem => lineItem.requisition)
  lineItems: LineItem[];

  @OneToMany(() => PurchaseOrder, purchaseOrder => purchaseOrder.requisition)
  purchaseOrders: PurchaseOrder[];

  // Audit fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100, nullable: true })
  createdBy: string;

  @Column({ length: 100, nullable: true })
  updatedBy: string;

  // Business Methods
  isApprovalRequired(): boolean {
    return this.totalEstimatedCost > 1000 || this.type === RequisitionType.CAPITAL;
  }

  isOverBudget(): boolean {
    if (!this.budgetLimit) return false;
    return this.totalEstimatedCost > this.budgetLimit;
  }

  isUrgent(): boolean {
    return this.priority === Priority.CRITICAL || 
           this.priority === Priority.EMERGENCY ||
           this.type === RequisitionType.EMERGENCY;
  }

  isOverdue(): boolean {
    const now = new Date();
    return now > this.requiredDate && this.status !== RequisitionStatus.FULFILLED;
  }

  getDaysOverdue(): number {
    if (!this.isOverdue()) return 0;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.requiredDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getCycleTime(): number {
    if (!this.submittedDate || !this.approvalDate) return 0;
    const diffTime = Math.abs(this.approvalDate.getTime() - this.submittedDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateCompletionPercentage(): number {
    const totalItems = this.lineItems?.length || 0;
    if (totalItems === 0) return 0;
    
    const fulfilledItems = this.lineItems?.filter(item => item.status === 'fulfilled').length || 0;
    return Math.round((fulfilledItems / totalItems) * 100);
  }

  getNextApprover(): string | null {
    if (!this.approvalWorkflow) return null;
    
    const pendingApprovals = this.approvalWorkflow.filter(
      approval => approval.status === ApprovalStatus.PENDING
    );
    
    return pendingApprovals.length > 0 ? pendingApprovals[0].approverEmail : null;
  }

  canBeModified(): boolean {
    return [
      RequisitionStatus.DRAFT,
      RequisitionStatus.REJECTED
    ].includes(this.status);
  }

  canBeApproved(): boolean {
    return this.status === RequisitionStatus.PENDING_APPROVAL;
  }

  canBeCancelled(): boolean {
    return ![
      RequisitionStatus.FULFILLED,
      RequisitionStatus.CANCELLED
    ].includes(this.status);
  }

  updateStatus(newStatus: RequisitionStatus, updatedBy: string, comments?: string): void {
    this.status = newStatus;
    this.updatedBy = updatedBy;
    
    if (newStatus === RequisitionStatus.APPROVED) {
      this.approvalDate = new Date();
      this.approverComments = comments;
    } else if (newStatus === RequisitionStatus.REJECTED) {
      this.rejectionReason = comments;
    } else if (newStatus === RequisitionStatus.SUBMITTED) {
      this.submittedDate = new Date();
    }
  }

  addApprovalStep(approver: PurchaseRequisition['approvalWorkflow'][0]): void {
    if (!this.approvalWorkflow) this.approvalWorkflow = [];
    this.approvalWorkflow.push(approver);
  }

  approveStep(approverEmail: string, comments?: string): void {
    if (!this.approvalWorkflow) return;
    
    const approval = this.approvalWorkflow.find(a => a.approverEmail === approverEmail);
    if (approval) {
      approval.status = ApprovalStatus.APPROVED;
      approval.approvedDate = new Date();
      approval.comments = comments;
    }
  }

  rejectStep(approverEmail: string, reason: string): void {
    if (!this.approvalWorkflow) return;
    
    const approval = this.approvalWorkflow.find(a => a.approverEmail === approverEmail);
    if (approval) {
      approval.status = ApprovalStatus.REJECTED;
      approval.comments = reason;
    }
  }

  isFullyApproved(): boolean {
    if (!this.approvalWorkflow) return true;
    return this.approvalWorkflow.every(approval => approval.status === ApprovalStatus.APPROVED);
  }

  hasAnyRejection(): boolean {
    if (!this.approvalWorkflow) return false;
    return this.approvalWorkflow.some(approval => approval.status === ApprovalStatus.REJECTED);
  }

  getEstimatedDeliveryCost(): number {
    return this.lineItems?.reduce((total, item) => total + item.totalCost, 0) || 0;
  }

  getRiskScore(): number {
    return this.riskAssessment?.overallRiskScore || 0;
  }

  getAIUrgencyScore(): number {
    return this.aiAnalytics?.urgencyScore || 0;
  }

  addPreferredVendor(vendor: PurchaseRequisition['preferredVendors'][0]): void {
    if (!this.preferredVendors) this.preferredVendors = [];
    this.preferredVendors.push(vendor);
  }

  removePreferredVendor(vendorId: string): void {
    if (!this.preferredVendors) return;
    this.preferredVendors = this.preferredVendors.filter(v => v.vendorId !== vendorId);
  }

  updateAIAnalytics(analytics: Partial<PurchaseRequisition['aiAnalytics']>): void {
    this.aiAnalytics = { ...this.aiAnalytics, ...analytics };
  }
}
