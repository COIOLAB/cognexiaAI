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
import { IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, IsObject, IsArray, IsEmail, IsUrl } from 'class-validator';
import { Organization } from '../core/Organization.model';
import { User } from '../core/User.model';

// Enums
export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING_APPROVAL = 'pending_approval',
  BLACKLISTED = 'blacklisted',
  UNDER_REVIEW = 'under_review'
}

export enum SupplierType {
  MANUFACTURER = 'manufacturer',
  DISTRIBUTOR = 'distributor',
  SERVICE_PROVIDER = 'service_provider',
  RAW_MATERIAL = 'raw_material',
  EQUIPMENT = 'equipment',
  CONSULTING = 'consulting'
}

export enum SupplierRating {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  AVERAGE = 'average',
  POOR = 'poor',
  NOT_RATED = 'not_rated'
}

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT = 'sent',
  ACKNOWLEDGED = 'acknowledged',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  INVOICED = 'invoiced',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  CLOSED = 'closed'
}

export enum PurchaseOrderType {
  STANDARD = 'standard',
  BLANKET = 'blanket',
  CONTRACT = 'contract',
  PLANNED = 'planned',
  EMERGENCY = 'emergency'
}

export enum RFQStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  RESPONDED = 'responded',
  EVALUATED = 'evaluated',
  AWARDED = 'awarded',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum ContractStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  RENEWED = 'renewed'
}

export enum ContractType {
  PURCHASE_AGREEMENT = 'purchase_agreement',
  SERVICE_AGREEMENT = 'service_agreement',
  FRAMEWORK_AGREEMENT = 'framework_agreement',
  BLANKET_ORDER = 'blanket_order',
  MAINTENANCE_CONTRACT = 'maintenance_contract'
}

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  CNY = 'CNY',
  INR = 'INR'
}

export enum PaymentTerms {
  NET_30 = 'net_30',
  NET_60 = 'net_60',
  NET_90 = 'net_90',
  COD = 'cod',
  PREPAID = 'prepaid',
  CUSTOM = 'custom'
}

/**
 * Supplier Entity
 * Represents suppliers and vendors in the procurement system
 */
@Entity('suppliers')
@Index(['organizationId', 'status'])
@Index(['supplierType'])
@Index(['supplierCode'], { unique: true })
@Index(['rating'])
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @IsNotEmpty()
  supplierCode: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  legalName: string;

  @Column({ 
    type: 'enum', 
    enum: SupplierType,
    default: SupplierType.MANUFACTURER
  })
  @IsEnum(SupplierType)
  supplierType: SupplierType;

  @Column({ 
    type: 'enum', 
    enum: SupplierStatus,
    default: SupplierStatus.PENDING_APPROVAL
  })
  @IsEnum(SupplierStatus)
  status: SupplierStatus;

  @Column({ 
    type: 'enum', 
    enum: SupplierRating,
    default: SupplierRating.NOT_RATED
  })
  @IsEnum(SupplierRating)
  rating: SupplierRating;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  overallScore: number; // 0-100

  // Contact Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsEmail()
  primaryEmail: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  primaryPhone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsUrl()
  website: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactPerson: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactTitle: string;

  // Address Information
  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  // Business Information
  @Column({ type: 'varchar', length: 100, nullable: true })
  taxId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  registrationNumber: string;

  @Column({ type: 'date', nullable: true })
  establishedDate: Date;

  @Column({ type: 'int', nullable: true })
  employeeCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  annualRevenue: number;

  @Column({ 
    type: 'enum', 
    enum: Currency,
    default: Currency.USD
  })
  @IsEnum(Currency)
  preferredCurrency: Currency;

  @Column({ 
    type: 'enum', 
    enum: PaymentTerms,
    default: PaymentTerms.NET_30
  })
  @IsEnum(PaymentTerms)
  defaultPaymentTerms: PaymentTerms;

  // Categories and Capabilities
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  categories: string[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  capabilities: string[];

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  certifications: any[];

  // Performance Metrics
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  qualityScore: number; // 0-100

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  deliveryScore: number; // 0-100

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  serviceScore: number; // 0-100

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  costCompetitiveness: number; // 0-100

  @Column({ type: 'int', default: 0 })
  totalOrders: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalOrderValue: number;

  @Column({ type: 'int', default: 0 })
  onTimeDeliveries: number;

  @Column({ type: 'int', default: 0 })
  qualityIssues: number;

  // Risk Assessment
  @Column({ type: 'varchar', length: 50, default: 'low' })
  riskLevel: string; // 'low', 'medium', 'high', 'critical'

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  riskFactors: string[];

  @Column({ type: 'date', nullable: true })
  lastAuditDate: Date;

  @Column({ type: 'date', nullable: true })
  nextAuditDue: Date;

  // Smart Procurement
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  aiRecommendationsEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  aiInsights: any;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  preferredSupplier: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @OneToMany(() => PurchaseOrder, po => po.supplier)
  purchaseOrders: PurchaseOrder[];

  @OneToMany(() => RFQ, rfq => rfq.supplier)
  rfqs: RFQ[];

  @OneToMany(() => Contract, contract => contract.supplier)
  contracts: Contract[];

  @OneToMany(() => SupplierEvaluation, evaluation => evaluation.supplier)
  evaluations: SupplierEvaluation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Lifecycle hooks
  @BeforeInsert()
  generateSupplierCode() {
    if (!this.supplierCode) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      this.supplierCode = `SUP-${timestamp}-${random}`;
    }
  }

  // Business Logic Methods
  calculateOverallScore(): number {
    const weights = {
      quality: 0.3,
      delivery: 0.25,
      service: 0.2,
      cost: 0.25
    };

    this.overallScore = 
      (this.qualityScore * weights.quality) +
      (this.deliveryScore * weights.delivery) +
      (this.serviceScore * weights.service) +
      (this.costCompetitiveness * weights.cost);

    return this.overallScore;
  }

  updatePerformanceMetrics(orderData: any): void {
    this.totalOrders++;
    this.totalOrderValue += orderData.totalValue || 0;

    if (orderData.deliveredOnTime) {
      this.onTimeDeliveries++;
    }

    if (orderData.qualityIssues) {
      this.qualityIssues += orderData.qualityIssues;
    }

    // Recalculate scores
    this.deliveryScore = (this.onTimeDeliveries / this.totalOrders) * 100;
    this.qualityScore = Math.max(0, 100 - ((this.qualityIssues / this.totalOrders) * 20));
    
    this.calculateOverallScore();
    this.updatedAt = new Date();
  }

  isPrequalified(): boolean {
    return this.status === SupplierStatus.ACTIVE && 
           this.overallScore >= 70 && 
           this.riskLevel !== 'critical';
  }

  needsAudit(): boolean {
    if (!this.nextAuditDue) return true;
    return new Date() >= this.nextAuditDue;
  }
}

/**
 * Purchase Order Entity
 * Represents purchase orders in the procurement system
 */
@Entity('purchase_orders')
@Index(['organizationId', 'status'])
@Index(['orderType', 'priority'])
@Index(['orderNumber'], { unique: true })
@Index(['supplierId'])
@Index(['requestedDeliveryDate'])
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  orderNumber: string;

  @Column({ 
    type: 'enum', 
    enum: PurchaseOrderType,
    default: PurchaseOrderType.STANDARD
  })
  @IsEnum(PurchaseOrderType)
  orderType: PurchaseOrderType;

  @Column({ 
    type: 'enum', 
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.DRAFT
  })
  @IsEnum(PurchaseOrderStatus)
  status: PurchaseOrderStatus;

  @Column({ 
    type: 'enum', 
    enum: Priority,
    default: Priority.NORMAL
  })
  @IsEnum(Priority)
  priority: Priority;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Dates
  @Column({ type: 'date' })
  orderDate: Date;

  @Column({ type: 'date', nullable: true })
  requestedDeliveryDate: Date;

  @Column({ type: 'date', nullable: true })
  promisedDeliveryDate: Date;

  @Column({ type: 'date', nullable: true })
  actualDeliveryDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvalDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedDate: Date;

  // Financial Information
  @Column({ 
    type: 'enum', 
    enum: Currency,
    default: Currency.USD
  })
  @IsEnum(Currency)
  currency: Currency;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ 
    type: 'enum', 
    enum: PaymentTerms,
    default: PaymentTerms.NET_30
  })
  @IsEnum(PaymentTerms)
  paymentTerms: PaymentTerms;

  // Delivery Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  deliveryLocation: string;

  @Column({ type: 'text', nullable: true })
  deliveryAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deliveryContact: string;

  @Column({ type: 'text', nullable: true })
  specialInstructions: string;

  // Progress Tracking
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercentage: number;

  @Column({ type: 'int', default: 0 })
  totalLineItems: number;

  @Column({ type: 'int', default: 0 })
  receivedLineItems: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  receivedValue: number;

  // Contract and Legal
  @Column({ type: 'varchar', length: 255, nullable: true })
  contractReference: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  termsAndConditions: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Smart Procurement
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  autoGeneratedFromRequisition: boolean;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  aiRecommendations: any;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  riskAssessmentCompleted: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  riskLevel: string;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid' })
  supplierId: string;

  @ManyToOne(() => Supplier, supplier => supplier.purchaseOrders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ type: 'uuid', nullable: true })
  requestedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'requestedById' })
  requestedBy: User;

  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy: User;

  @Column({ type: 'uuid', nullable: true })
  contractId: string;

  @ManyToOne(() => Contract, { nullable: true })
  @JoinColumn({ name: 'contractId' })
  contract: Contract;

  @OneToMany(() => PurchaseOrderItem, item => item.purchaseOrder, { cascade: true })
  items: PurchaseOrderItem[];

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
      this.orderNumber = `PO-${timestamp}-${random}`;
    }
  }

  // Business Logic Methods
  calculateTotals(): void {
    this.subtotal = this.items?.reduce((sum, item) => sum + item.totalPrice, 0) || 0;
    this.totalAmount = this.subtotal + this.taxAmount + this.shippingCost - this.discountAmount;
  }

  updateProgress(): void {
    if (this.totalLineItems > 0) {
      this.completionPercentage = (this.receivedLineItems / this.totalLineItems) * 100;
    }

    if (this.completionPercentage === 100) {
      this.status = PurchaseOrderStatus.RECEIVED;
    } else if (this.completionPercentage > 0) {
      this.status = PurchaseOrderStatus.PARTIALLY_RECEIVED;
    }
  }

  canBeApproved(): boolean {
    return this.status === PurchaseOrderStatus.PENDING_APPROVAL && 
           this.items && this.items.length > 0 &&
           this.supplierId !== null;
  }

  approve(approver: User): void {
    if (this.canBeApproved()) {
      this.status = PurchaseOrderStatus.APPROVED;
      this.approvedById = approver.id;
      this.approvalDate = new Date();
    }
  }

  send(): void {
    if (this.status === PurchaseOrderStatus.APPROVED) {
      this.status = PurchaseOrderStatus.SENT;
      this.sentDate = new Date();
    }
  }

  acknowledge(): void {
    if (this.status === PurchaseOrderStatus.SENT) {
      this.status = PurchaseOrderStatus.ACKNOWLEDGED;
      this.acknowledgedDate = new Date();
    }
  }

  isOverdue(): boolean {
    if (!this.requestedDeliveryDate || this.status === PurchaseOrderStatus.RECEIVED) {
      return false;
    }
    return new Date() > this.requestedDeliveryDate;
  }

  getDaysOverdue(): number {
    if (!this.isOverdue()) return 0;
    
    const today = new Date();
    const deliveryDate = new Date(this.requestedDeliveryDate);
    const diffTime = today.getTime() - deliveryDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

/**
 * Purchase Order Item Entity
 * Represents individual line items in a purchase order
 */
@Entity('purchase_order_items')
@Index(['purchaseOrderId'])
@Index(['productCode'])
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  lineNumber: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  productCode: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supplierPartNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  manufacturerPartNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  @IsNotEmpty()
  @IsNumber()
  unitPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  receivedQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  rejectedQuantity: number;

  @Column({ type: 'date', nullable: true })
  requestedDeliveryDate: Date;

  @Column({ type: 'date', nullable: true })
  promisedDeliveryDate: Date;

  @Column({ type: 'date', nullable: true })
  actualDeliveryDate: Date;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  deliveryStatus: string; // 'pending', 'partial', 'delivered', 'overdue'

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  specifications: any;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relationships
  @Column({ type: 'uuid' })
  purchaseOrderId: string;

  @ManyToOne(() => PurchaseOrder, po => po.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchaseOrderId' })
  purchaseOrder: PurchaseOrder;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Logic Methods
  calculateTotalPrice(): void {
    this.totalPrice = this.quantity * this.unitPrice;
  }

  updateReceived(receivedQty: number, rejectedQty: number = 0): void {
    this.receivedQuantity = Math.min(receivedQty, this.quantity);
    this.rejectedQuantity = rejectedQty;
    
    if (this.receivedQuantity === this.quantity) {
      this.deliveryStatus = 'delivered';
      this.actualDeliveryDate = new Date();
    } else if (this.receivedQuantity > 0) {
      this.deliveryStatus = 'partial';
    }
  }

  isFullyReceived(): boolean {
    return this.receivedQuantity === this.quantity;
  }

  isOverdue(): boolean {
    if (!this.requestedDeliveryDate || this.deliveryStatus === 'delivered') {
      return false;
    }
    return new Date() > this.requestedDeliveryDate;
  }
}

/**
 * RFQ (Request for Quotation) Entity
 * Represents RFQs sent to suppliers
 */
@Entity('rfqs')
@Index(['organizationId', 'status'])
@Index(['rfqNumber'], { unique: true })
@Index(['supplierId'])
@Index(['responseDeadline'])
export class RFQ {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  rfqNumber: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: RFQStatus,
    default: RFQStatus.DRAFT
  })
  @IsEnum(RFQStatus)
  status: RFQStatus;

  @Column({ 
    type: 'enum', 
    enum: Priority,
    default: Priority.NORMAL
  })
  @IsEnum(Priority)
  priority: Priority;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date' })
  responseDeadline: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  responseDate: Date;

  @Column({ 
    type: 'enum', 
    enum: Currency,
    default: Currency.USD
  })
  @IsEnum(Currency)
  currency: Currency;

  @Column({ type: 'jsonb' })
  @IsNotEmpty()
  @IsArray()
  items: any[]; // RFQ line items

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  termsAndConditions: string[];

  @Column({ type: 'text', nullable: true })
  deliveryRequirements: string;

  @Column({ type: 'text', nullable: true })
  qualityRequirements: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  evaluationCriteria: any;

  // Response Information
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  quotedAmount: number;

  @Column({ type: 'date', nullable: true })
  quotedDeliveryDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  supplierResponse: any;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  evaluationScore: number;

  @Column({ type: 'text', nullable: true })
  evaluationNotes: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  awarded: boolean;

  @Column({ type: 'timestamp', nullable: true })
  awardDate: Date;

  // Smart Procurement
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  aiGeneratedSpecs: boolean;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  aiRecommendations: any;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid' })
  supplierId: string;

  @ManyToOne(() => Supplier, supplier => supplier.rfqs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'uuid', nullable: true })
  evaluatedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'evaluatedById' })
  evaluatedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Lifecycle hooks
  @BeforeInsert()
  generateRFQNumber() {
    if (!this.rfqNumber) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      this.rfqNumber = `RFQ-${timestamp}-${random}`;
    }
  }

  // Business Logic Methods
  send(): void {
    if (this.status === RFQStatus.DRAFT) {
      this.status = RFQStatus.SENT;
      this.sentDate = new Date();
    }
  }

  submitResponse(responseData: any): void {
    if (this.status === RFQStatus.SENT) {
      this.status = RFQStatus.RESPONDED;
      this.responseDate = new Date();
      this.supplierResponse = responseData;
      this.quotedAmount = responseData.totalAmount;
      this.quotedDeliveryDate = responseData.deliveryDate;
    }
  }

  evaluate(evaluator: User, score: number, notes: string): void {
    if (this.status === RFQStatus.RESPONDED) {
      this.status = RFQStatus.EVALUATED;
      this.evaluatedById = evaluator.id;
      this.evaluationScore = score;
      this.evaluationNotes = notes;
    }
  }

  award(): void {
    if (this.status === RFQStatus.EVALUATED) {
      this.status = RFQStatus.AWARDED;
      this.awarded = true;
      this.awardDate = new Date();
    }
  }

  isExpired(): boolean {
    return this.status === RFQStatus.SENT && new Date() > this.responseDeadline;
  }

  getDaysToDeadline(): number {
    if (this.status !== RFQStatus.SENT) return 0;
    
    const today = new Date();
    const deadline = new Date(this.responseDeadline);
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

/**
 * Contract Entity
 * Represents procurement contracts and agreements
 */
@Entity('contracts')
@Index(['organizationId', 'status'])
@Index(['contractType'])
@Index(['contractNumber'], { unique: true })
@Index(['supplierId'])
@Index(['expiryDate'])
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  contractNumber: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: ContractType,
    default: ContractType.PURCHASE_AGREEMENT
  })
  @IsEnum(ContractType)
  contractType: ContractType;

  @Column({ 
    type: 'enum', 
    enum: ContractStatus,
    default: ContractStatus.DRAFT
  })
  @IsEnum(ContractStatus)
  status: ContractStatus;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  expiryDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  signedDate: Date;

  @Column({ type: 'int', nullable: true })
  renewalPeriodMonths: number;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  autoRenewal: boolean;

  // Financial Terms
  @Column({ 
    type: 'enum', 
    enum: Currency,
    default: Currency.USD
  })
  @IsEnum(Currency)
  currency: Currency;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  minimumValue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  maximumValue: number;

  @Column({ 
    type: 'enum', 
    enum: PaymentTerms,
    default: PaymentTerms.NET_30
  })
  @IsEnum(PaymentTerms)
  paymentTerms: PaymentTerms;

  // Contract Terms
  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  termsAndConditions: string[];

  @Column({ type: 'text', nullable: true })
  deliveryTerms: string;

  @Column({ type: 'text', nullable: true })
  qualityRequirements: string;

  @Column({ type: 'text', nullable: true })
  performanceMetrics: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  slaRequirements: any[];

  // Performance Tracking
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  spentAmount: number;

  @Column({ type: 'int', default: 0 })
  totalOrders: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  performanceScore: number;

  // Legal and Compliance
  @Column({ type: 'varchar', length: 255, nullable: true })
  legalReviewBy: string;

  @Column({ type: 'timestamp', nullable: true })
  legalReviewDate: Date;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  complianceVerified: boolean;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  attachments: any[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid' })
  supplierId: string;

  @ManyToOne(() => Supplier, supplier => supplier.contracts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedById' })
  approvedBy: User;

  @OneToMany(() => PurchaseOrder, po => po.contract)
  purchaseOrders: PurchaseOrder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Lifecycle hooks
  @BeforeInsert()
  generateContractNumber() {
    if (!this.contractNumber) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      this.contractNumber = `CNT-${timestamp}-${random}`;
    }
  }

  // Business Logic Methods
  activate(): void {
    if (this.status === ContractStatus.PENDING_APPROVAL) {
      this.status = ContractStatus.ACTIVE;
      this.signedDate = new Date();
    }
  }

  isExpiring(daysAhead: number = 30): boolean {
    if (this.status !== ContractStatus.ACTIVE) return false;
    
    const expiryDate = new Date(this.expiryDate);
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() + daysAhead);
    
    return expiryDate <= checkDate;
  }

  isExpired(): boolean {
    return new Date() > this.expiryDate;
  }

  canRenew(): boolean {
    return this.status === ContractStatus.ACTIVE && 
           this.renewalPeriodMonths !== null &&
           (this.isExpiring(60) || this.autoRenewal);
  }

  renew(): void {
    if (this.canRenew()) {
      const newExpiryDate = new Date(this.expiryDate);
      newExpiryDate.setMonth(newExpiryDate.getMonth() + this.renewalPeriodMonths);
      this.expiryDate = newExpiryDate;
      this.status = ContractStatus.RENEWED;
    }
  }

  calculateUtilization(): number {
    if (!this.totalValue) return 0;
    return (this.spentAmount / this.totalValue) * 100;
  }

  updatePerformance(orderData: any): void {
    this.totalOrders++;
    this.spentAmount += orderData.totalValue || 0;
    
    // Performance score calculation would be based on various metrics
    // This is a simplified version
    this.performanceScore = Math.min(100, (this.totalOrders * 10) + 
                                          (orderData.onTimeDelivery ? 5 : 0) + 
                                          (orderData.qualityMet ? 5 : 0));
  }
}

/**
 * Supplier Evaluation Entity
 * Stores supplier evaluation results and ratings
 */
@Entity('supplier_evaluations')
@Index(['organizationId', 'supplierId'])
@Index(['evaluationDate'])
@Index(['overallScore'])
export class SupplierEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  evaluationDate: Date;

  @Column({ type: 'varchar', length: 50 })
  evaluationType: string; // 'annual', 'project', 'incident', 'audit'

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  overallScore: number; // 0-100

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  qualityScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  deliveryScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  serviceScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  costScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  innovationScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  sustainabilityScore: number;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsObject()
  detailedScores: any;

  @Column({ type: 'text', nullable: true })
  strengths: string;

  @Column({ type: 'text', nullable: true })
  weaknesses: string;

  @Column({ type: 'text', nullable: true })
  improvementAreas: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsArray()
  actionItems: any[];

  @Column({ type: 'date', nullable: true })
  nextEvaluationDate: Date;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  recommendForFutureBusiness: boolean;

  // Relationships
  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid' })
  supplierId: string;

  @ManyToOne(() => Supplier, supplier => supplier.evaluations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ type: 'uuid', nullable: true })
  evaluatedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'evaluatedById' })
  evaluatedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Logic Methods
  calculateOverallScore(): number {
    const weights = {
      quality: 0.25,
      delivery: 0.25,
      service: 0.20,
      cost: 0.15,
      innovation: 0.10,
      sustainability: 0.05
    };

    this.overallScore = 
      (this.qualityScore * weights.quality) +
      (this.deliveryScore * weights.delivery) +
      (this.serviceScore * weights.service) +
      (this.costScore * weights.cost) +
      (this.innovationScore * weights.innovation) +
      (this.sustainabilityScore * weights.sustainability);

    return this.overallScore;
  }

  getPerformanceCategory(): string {
    if (this.overallScore >= 90) return 'Excellent';
    if (this.overallScore >= 80) return 'Good';
    if (this.overallScore >= 70) return 'Average';
    if (this.overallScore >= 60) return 'Below Average';
    return 'Poor';
  }

  isHighPerformer(): boolean {
    return this.overallScore >= 80 && this.recommendForFutureBusiness;
  }
}

/**
 * Procurement Analytics Entity
 * Stores aggregated procurement metrics and analytics
 */
@Entity('procurement_analytics')
@Index(['organizationId', 'metricDate'])
@Index(['metricType'])
@Index(['supplierId'])
export class ProcurementAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  metricDate: Date;

  @Column({ type: 'varchar', length: 50 })
  metricType: string; // 'spend', 'savings', 'cycle_time', 'supplier_performance'

  @Column({ type: 'varchar', length: 50, default: 'monthly' })
  period: string; // 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'

  @Column({ type: 'uuid', nullable: true })
  supplierId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalSpend: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  costSavings: number;

  @Column({ type: 'int', default: 0 })
  totalOrders: number;

  @Column({ type: 'int', default: 0 })
  onTimeDeliveries: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageCycleTime: number; // days

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  supplierPerformanceScore: number;

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

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Business Logic Methods
  calculateOnTimeDeliveryRate(): number {
    if (this.totalOrders === 0) return 0;
    return (this.onTimeDeliveries / this.totalOrders) * 100;
  }

  calculateCostSavingsPercentage(baselineCost: number): number {
    if (baselineCost === 0) return 0;
    return (this.costSavings / baselineCost) * 100;
  }

  calculateAverageOrderValue(): number {
    if (this.totalOrders === 0) return 0;
    return this.totalSpend / this.totalOrders;
  }
}
