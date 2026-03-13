// Industry 5.0 ERP Backend - Procurement Module
// LineItem Entity - Comprehensive line item management for requisitions and purchase orders
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { PurchaseRequisition } from './purchase-requisition.entity';
import { PurchaseOrder } from './purchase-order.entity';
import { ProcurementCategory } from './procurement-category.entity';

export enum LineItemStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  ORDERED = 'ordered',
  RECEIVED = 'received',
  PARTIALLY_RECEIVED = 'partially_received',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
  FULFILLED = 'fulfilled'
}

export enum LineItemType {
  GOODS = 'goods',
  SERVICES = 'services',
  SOFTWARE = 'software',
  SUBSCRIPTION = 'subscription',
  MAINTENANCE = 'maintenance',
  CONSULTING = 'consulting',
  TRAINING = 'training',
  SHIPPING = 'shipping'
}

export enum UnitOfMeasure {
  EACH = 'each',
  PIECE = 'piece',
  SET = 'set',
  KG = 'kg',
  LB = 'lb',
  METER = 'meter',
  FOOT = 'foot',
  HOUR = 'hour',
  DAY = 'day',
  MONTH = 'month',
  YEAR = 'year',
  LICENSE = 'license',
  USER = 'user'
}

@Entity('line_items')
@Index(['lineNumber'])
@Index(['status', 'type'])
@Index(['itemCode', 'description'])
export class LineItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  lineNumber: number;

  // Item Identification
  @Column({ length: 100, nullable: true })
  itemCode: string;

  @Column({ length: 255 })
  description: string;

  @Column({ type: 'text', nullable: true })
  detailedDescription: string;

  @Column({ length: 100, nullable: true })
  partNumber: string;

  @Column({ length: 100, nullable: true })
  manufacturerPartNumber: string;

  @Column({ length: 100, nullable: true })
  supplierPartNumber: string;

  @Column({
    type: 'enum',
    enum: LineItemType,
    default: LineItemType.GOODS
  })
  type: LineItemType;

  @Column({
    type: 'enum',
    enum: LineItemStatus,
    default: LineItemStatus.PENDING
  })
  status: LineItemStatus;

  // Quantity and Measurements
  @Column({ type: 'decimal', precision: 12, scale: 3 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  receivedQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 })
  remainingQuantity: number;

  @Column({
    type: 'enum',
    enum: UnitOfMeasure,
    default: UnitOfMeasure.EACH
  })
  unitOfMeasure: UnitOfMeasure;

  // Pricing Information
  @Column({ type: 'decimal', precision: 15, scale: 4 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  totalCost: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercentage: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  // Delivery Information
  @Column({ type: 'timestamp', nullable: true })
  requestedDeliveryDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  promisedDeliveryDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualDeliveryDate: Date;

  @Column({ type: 'int', default: 1 })
  leadTimeDays: number;

  // Specifications and Requirements
  @Column({ type: 'json', nullable: true })
  specifications: {
    attribute: string;
    value: string;
    unit?: string;
    tolerance?: string;
    critical: boolean;
  }[];

  @Column({ type: 'json', nullable: true })
  technicalRequirements: {
    requirement: string;
    specification: string;
    testMethod?: string;
    acceptanceCriteria: string;
  }[];

  // Quality and Compliance
  @Column({ type: 'json', nullable: true })
  qualityRequirements: {
    standard: string;
    certification?: string;
    inspectionRequired: boolean;
    testingRequired: boolean;
    documentation?: string[];
  }[];

  @Column({ type: 'json', nullable: true })
  complianceRequirements: {
    regulation: string;
    certificateRequired: boolean;
    documentationRequired: string[];
    expiryTracking: boolean;
  }[];

  // Vendor Information
  @Column({ type: 'uuid', nullable: true })
  preferredVendorId: string;

  @Column({ length: 255, nullable: true })
  preferredVendorName: string;

  @Column({ length: 100, nullable: true })
  vendorQuoteNumber: string;

  @Column({ type: 'timestamp', nullable: true })
  quoteValidUntil: Date;

  @Column({ type: 'json', nullable: true })
  alternativeVendors: {
    vendorId: string;
    vendorName: string;
    unitPrice: number;
    leadTime: number;
    qualityRating: number;
    notes?: string;
  }[];

  // Category and Classification
  @Column({ type: 'uuid', nullable: true })
  categoryId: string;

  @ManyToOne(() => ProcurementCategory, category => category.lineItems)
  @JoinColumn({ name: 'categoryId' })
  category: ProcurementCategory;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  // Asset and Inventory Information
  @Column({ length: 100, nullable: true })
  assetNumber: string;

  @Column({ length: 100, nullable: true })
  inventoryAccount: string;

  @Column({ length: 100, nullable: true })
  expenseAccount: string;

  @Column({ length: 100, nullable: true })
  costCenter: string;

  @Column({ length: 100, nullable: true })
  project: string;

  // Risk and Impact Assessment
  @Column({ type: 'json', nullable: true })
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: string[];
    businessImpact: string;
    mitigationStrategy?: string;
  };

  @Column({ type: 'json', nullable: true })
  businessImpact: {
    criticality: 'low' | 'medium' | 'high' | 'critical';
    impactOnOperations: string;
    alternativeSources: boolean;
    businessContinuityRisk: string;
  };

  // Documents and Attachments
  @Column({ type: 'json', nullable: true })
  attachments: {
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    uploadedBy: string;
    uploadedDate: Date;
    description?: string;
  }[];

  // Performance Tracking
  @Column({ type: 'json', nullable: true })
  performanceMetrics: {
    onTimeDelivery: boolean;
    qualityScore?: number;
    costVariance: number;
    defectRate?: number;
    returnRate?: number;
    supplierRating?: number;
  };

  // AI Analytics and Optimization
  @Column({ type: 'json', nullable: true })
  aiAnalytics: {
    priceOptimization?: {
      marketPrice: number;
      savingsOpportunity: number;
      priceHistory: { date: Date; price: number }[];
      recommendation: string;
    };
    demandForecast?: {
      nextMonthDemand: number;
      seasonalityFactor: number;
      trendDirection: 'up' | 'down' | 'stable';
    };
    supplierAnalysis?: {
      recommendedSupplier: string;
      alternativeOptions: number;
      riskScore: number;
      costBenefit: string;
    };
    deliveryOptimization?: {
      optimalDeliveryDate: Date;
      expediteRecommendation: boolean;
      consolidationOpportunity: boolean;
    };
  };

  // Relationships
  @Column({ type: 'uuid', nullable: true })
  requisitionId: string;

  @ManyToOne(() => PurchaseRequisition, requisition => requisition.lineItems)
  @JoinColumn({ name: 'requisitionId' })
  requisition: PurchaseRequisition;

  @Column({ type: 'uuid', nullable: true })
  purchaseOrderId: string;

  @ManyToOne(() => PurchaseOrder, purchaseOrder => purchaseOrder.lineItems)
  @JoinColumn({ name: 'purchaseOrderId' })
  purchaseOrder: PurchaseOrder;

  // Comments and Notes
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  internalNotes: string;

  @Column({ type: 'text', nullable: true })
  receivingNotes: string;

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
  calculateTotalCost(): number {
    const subtotal = this.quantity * this.unitPrice;
    const afterDiscount = subtotal - this.discountAmount;
    return afterDiscount + this.taxAmount;
  }

  calculateDiscountAmount(): number {
    if (this.discountPercentage > 0) {
      return (this.quantity * this.unitPrice) * (this.discountPercentage / 100);
    }
    return this.discountAmount;
  }

  calculateTaxAmount(): number {
    const subtotal = this.quantity * this.unitPrice - this.calculateDiscountAmount();
    return subtotal * (this.taxRate / 100);
  }

  updateTotalCost(): void {
    this.discountAmount = this.calculateDiscountAmount();
    this.taxAmount = this.calculateTaxAmount();
    this.totalCost = this.calculateTotalCost();
  }

  isFullyReceived(): boolean {
    return this.receivedQuantity >= this.quantity;
  }

  isPartiallyReceived(): boolean {
    return this.receivedQuantity > 0 && this.receivedQuantity < this.quantity;
  }

  getReceiptPercentage(): number {
    if (this.quantity === 0) return 0;
    return Math.round((this.receivedQuantity / this.quantity) * 100);
  }

  getRemainingQuantity(): number {
    return Math.max(0, this.quantity - this.receivedQuantity);
  }

  isOverdue(): boolean {
    if (!this.promisedDeliveryDate) return false;
    const now = new Date();
    return now > this.promisedDeliveryDate && !this.isFullyReceived();
  }

  getDaysOverdue(): number {
    if (!this.isOverdue()) return 0;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.promisedDeliveryDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isUrgent(): boolean {
    if (!this.requestedDeliveryDate) return false;
    const now = new Date();
    const daysUntilRequired = Math.ceil(
      (this.requestedDeliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilRequired <= 5; // Urgent if needed within 5 days
  }

  hasQualityRequirements(): boolean {
    return this.qualityRequirements && this.qualityRequirements.length > 0;
  }

  hasComplianceRequirements(): boolean {
    return this.complianceRequirements && this.complianceRequirements.length > 0;
  }

  requiresInspection(): boolean {
    return this.qualityRequirements?.some(req => req.inspectionRequired) || false;
  }

  requiresTesting(): boolean {
    return this.qualityRequirements?.some(req => req.testingRequired) || false;
  }

  canBeReceived(): boolean {
    return [LineItemStatus.ORDERED, LineItemStatus.PARTIALLY_RECEIVED].includes(this.status);
  }

  canBeCancelled(): boolean {
    return ![
      LineItemStatus.RECEIVED,
      LineItemStatus.FULFILLED,
      LineItemStatus.CANCELLED,
      LineItemStatus.RETURNED
    ].includes(this.status);
  }

  updateStatus(newStatus: LineItemStatus, updatedBy: string): void {
    this.status = newStatus;
    this.updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  receiveQuantity(quantity: number, receivedBy: string, notes?: string): void {
    this.receivedQuantity += quantity;
    this.remainingQuantity = this.getRemainingQuantity();
    this.updatedBy = receivedBy;
    
    if (notes) {
      this.receivingNotes = (this.receivingNotes || '') + '\n' + notes;
    }

    // Update status based on received quantity
    if (this.isFullyReceived()) {
      this.status = LineItemStatus.RECEIVED;
      this.actualDeliveryDate = new Date();
    } else if (this.receivedQuantity > 0) {
      this.status = LineItemStatus.PARTIALLY_RECEIVED;
    }
  }

  addSpecification(specification: LineItem['specifications'][0]): void {
    if (!this.specifications) this.specifications = [];
    this.specifications.push(specification);
  }

  removeSpecification(attribute: string): void {
    if (!this.specifications) return;
    this.specifications = this.specifications.filter(spec => spec.attribute !== attribute);
  }

  addQualityRequirement(requirement: LineItem['qualityRequirements'][0]): void {
    if (!this.qualityRequirements) this.qualityRequirements = [];
    this.qualityRequirements.push(requirement);
  }

  addComplianceRequirement(requirement: LineItem['complianceRequirements'][0]): void {
    if (!this.complianceRequirements) this.complianceRequirements = [];
    this.complianceRequirements.push(requirement);
  }

  addAlternativeVendor(vendor: LineItem['alternativeVendors'][0]): void {
    if (!this.alternativeVendors) this.alternativeVendors = [];
    this.alternativeVendors.push(vendor);
  }

  removeAlternativeVendor(vendorId: string): void {
    if (!this.alternativeVendors) return;
    this.alternativeVendors = this.alternativeVendors.filter(v => v.vendorId !== vendorId);
  }

  addAttachment(attachment: LineItem['attachments'][0]): void {
    if (!this.attachments) this.attachments = [];
    this.attachments.push(attachment);
  }

  removeAttachment(fileName: string): void {
    if (!this.attachments) return;
    this.attachments = this.attachments.filter(att => att.fileName !== fileName);
  }

  updatePerformanceMetrics(metrics: Partial<LineItem['performanceMetrics']>): void {
    this.performanceMetrics = { ...this.performanceMetrics, ...metrics };
  }

  updateAIAnalytics(analytics: Partial<LineItem['aiAnalytics']>): void {
    this.aiAnalytics = { ...this.aiAnalytics, ...analytics };
  }

  getCostVariance(): number {
    if (!this.performanceMetrics?.costVariance) return 0;
    return this.performanceMetrics.costVariance;
  }

  getQualityScore(): number {
    return this.performanceMetrics?.qualityScore || 0;
  }

  getRiskLevel(): 'low' | 'medium' | 'high' | 'critical' {
    return this.riskAssessment?.riskLevel || 'low';
  }

  getCriticalityLevel(): 'low' | 'medium' | 'high' | 'critical' {
    return this.businessImpact?.criticality || 'low';
  }

  getAIRecommendation(): string {
    const recommendations = [];
    
    if (this.aiAnalytics?.priceOptimization?.recommendation) {
      recommendations.push(this.aiAnalytics.priceOptimization.recommendation);
    }
    
    if (this.aiAnalytics?.supplierAnalysis?.costBenefit) {
      recommendations.push(this.aiAnalytics.supplierAnalysis.costBenefit);
    }
    
    if (this.aiAnalytics?.deliveryOptimization?.expediteRecommendation) {
      recommendations.push('Consider expediting delivery');
    }
    
    return recommendations.join('; ') || 'No specific recommendations';
  }
}
