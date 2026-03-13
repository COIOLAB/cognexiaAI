/**
 * Vendor Invoice Entity - Vendor Billing and Payables
 * 
 * TypeORM entity for vendor invoices supporting multi-currency processing,
 * AI-powered matching, automated approvals, and comprehensive payment
 * tracking with government-grade audit trails and compliance.
 * 
 * @version 3.0.0
 * @author Industry 5.0 ERP Team
 * @compliance SOC2, ISO27001, GDPR, SOX
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Check
} from 'typeorm';

@Entity('vendor_invoices')
@Index('idx_vendor_invoice_number', ['invoiceNumber'])
@Index('idx_vendor_invoice_vendor', ['vendorId'])
@Index('idx_vendor_invoice_status', ['status'])
@Index('idx_vendor_invoice_due_date', ['dueDate'])
@Index('idx_vendor_invoice_amount', ['totalAmount'])
@Index('idx_vendor_invoice_outstanding', ['outstandingAmount'])
@Index('idx_vendor_invoice_approval', ['approvalStatus'])
@Check(`"status" IN ('received', 'matched', 'approved', 'rejected', 'paid', 'partially_paid', 'disputed', 'cancelled')`)
@Check(`"approvalStatus" IN ('pending', 'in_review', 'approved', 'rejected', 'requires_additional_approval')`)
export class VendorInvoice {
  @PrimaryGeneratedColumn('uuid')
  invoiceId: string;

  @Column({ 
    type: 'varchar', 
    length: 50,
    comment: 'Vendor invoice number'
  })
  @Index()
  invoiceNumber: string;

  @Column({ 
    type: 'uuid',
    comment: 'Reference to vendor'
  })
  vendorId: string;

  @Column({ 
    type: 'varchar', 
    length: 50,
    comment: 'Vendor code for reference'
  })
  vendorCode: string;

  @Column({ 
    type: 'varchar', 
    length: 255,
    comment: 'Vendor name at time of invoice'
  })
  vendorName: string;

  @Column({ 
    type: 'uuid',
    nullable: true,
    comment: 'Related purchase order ID'
  })
  purchaseOrderId: string;

  @Column({ 
    type: 'varchar', 
    length: 50,
    nullable: true,
    comment: 'Purchase order number'
  })
  purchaseOrderNumber: string;

  @Column({
    type: 'timestamptz',
    comment: 'Invoice date from vendor'
  })
  invoiceDate: Date;

  @Column({
    type: 'timestamptz',
    comment: 'When invoice was received'
  })
  receivedDate: Date;

  @Column({
    type: 'timestamptz',
    comment: 'Payment due date'
  })
  dueDate: Date;

  @Column({ 
    type: 'varchar', 
    length: 100,
    comment: 'Payment terms from vendor'
  })
  paymentTerms: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    comment: 'Subtotal before taxes'
  })
  subtotal: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    comment: 'Total tax amount'
  })
  taxAmount: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: 0,
    comment: 'Total discount amount'
  })
  discountAmount: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    comment: 'Total invoice amount'
  })
  totalAmount: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    comment: 'Outstanding balance to be paid'
  })
  outstandingAmount: string;

  @Column({ 
    type: 'varchar', 
    length: 3,
    default: 'USD',
    comment: 'Invoice currency code'
  })
  currencyCode: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
    default: 1,
    comment: 'Exchange rate to base currency'
  })
  exchangeRate: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    comment: 'Total amount in base currency'
  })
  baseAmount: string;

  @Column({
    type: 'enum',
    enum: ['received', 'matched', 'approved', 'rejected', 'paid', 'partially_paid', 'disputed', 'cancelled'],
    default: 'received',
    comment: 'Current invoice processing status'
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'in_review', 'approved', 'rejected', 'requires_additional_approval'],
    default: 'pending',
    comment: 'Approval workflow status'
  })
  approvalStatus: string;

  @Column({ 
    type: 'text',
    nullable: true,
    comment: 'Invoice description or notes'
  })
  description: string;

  @Column({ 
    type: 'varchar', 
    length: 100,
    nullable: true,
    comment: 'External reference number'
  })
  reference: string;

  @Column({
    type: 'jsonb',
    comment: 'Vendor remit-to address'
  })
  remitToAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    contactName?: string;
    email?: string;
    phone?: string;
  };

  @Column({
    type: 'jsonb',
    comment: 'Invoice line items with detailed breakdown'
  })
  lineItems: Array<{
    lineId: string;
    lineNumber: number;
    productId?: string;
    productCode?: string;
    description: string;
    quantity: string;
    unitPrice: string;
    lineTotal: string;
    taxAmount: string;
    discountAmount: string;
    glAccount: string;
    costCenter?: string;
    project?: string;
    department?: string;
    poLineId?: string;
    receipted: boolean;
    receiptedQuantity?: string;
  }>;

  @Column({
    type: 'jsonb',
    comment: 'Applied payments and allocations'
  })
  payments: Array<{
    paymentId: string;
    paymentNumber: string;
    paymentMethod: string;
    paymentDate: string;
    amount: string;
    reference: string;
    appliedAmount: string;
    appliedDate: string;
  }>;

  @Column({
    type: 'jsonb',
    comment: 'Invoice adjustments and corrections'
  })
  adjustments: Array<{
    adjustmentId: string;
    type: string;
    amount: string;
    reason: string;
    description: string;
    approvedBy: string;
    processedAt: string;
    reversalId?: string;
    glAccount: string;
  }>;

  @Column({
    type: 'jsonb',
    comment: 'AI-powered matching results'
  })
  matchingResults: {
    poMatchStatus: 'not_matched' | 'partially_matched' | 'fully_matched' | 'over_matched';
    receiptMatchStatus: 'not_matched' | 'partially_matched' | 'fully_matched' | 'over_matched';
    priceVariances: Array<{
      lineId: string;
      invoicePrice: string;
      poPrice: string;
      variance: string;
      variancePercent: string;
      withinTolerance: boolean;
    }>;
    quantityVariances: Array<{
      lineId: string;
      invoicedQuantity: string;
      receivedQuantity: string;
      variance: string;
      withinTolerance: boolean;
    }>;
    exceptions: Array<{
      type: string;
      description: string;
      severity: string;
      requiresApproval: boolean;
    }>;
    aiConfidence: number;
    matchedAt?: string;
    matchedBy?: string;
  };

  @Column({
    type: 'jsonb',
    comment: 'Approval workflow tracking'
  })
  approvalWorkflow: {
    currentStep: number;
    totalSteps: number;
    approvers: Array<{
      stepNumber: number;
      approverType: 'user' | 'role' | 'amount_threshold';
      approverId: string;
      approverName: string;
      status: 'pending' | 'approved' | 'rejected' | 'delegated';
      approvedAt?: string;
      comments?: string;
      threshold?: {
        minAmount?: string;
        maxAmount?: string;
      };
    }>;
    escalations: Array<{
      escalatedAt: string;
      escalatedBy: string;
      reason: string;
      escalatedTo: string;
    }>;
  };

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'AI-powered fraud detection and analysis'
  })
  fraudAnalysis: {
    riskScore: number;
    riskFactors: string[];
    duplicateCheck: {
      isDuplicate: boolean;
      potentialDuplicates: string[];
    };
    vendorVerification: {
      isVerified: boolean;
      verificationScore: number;
    };
    anomalies: Array<{
      type: string;
      description: string;
      severity: string;
      confidence: number;
    }>;
    lastAnalyzed: string;
  };

  @Column({
    type: 'jsonb',
    comment: 'OCR and document processing results'
  })
  ocrResults: {
    documentId: string;
    extractedFields: Record<string, any>;
    confidence: number;
    validationResults: Array<{
      field: string;
      extracted: string;
      validated: string;
      confidence: number;
      needsReview: boolean;
    }>;
    processedAt: string;
  };

  @Column({
    type: 'timestamptz',
    nullable: true,
    comment: 'When invoice was approved'
  })
  approvedAt: Date;

  @Column({ 
    type: 'varchar', 
    length: 36,
    nullable: true,
    comment: 'User who approved the invoice'
  })
  approvedBy: string;

  @Column({
    type: 'timestamptz',
    nullable: true,
    comment: 'When invoice was paid'
  })
  paidAt: Date;

  @Column({
    type: 'jsonb',
    comment: 'Comprehensive audit trail'
  })
  auditTrail: Array<{
    auditId: string;
    action: string;
    performedBy: string;
    timestamp: string;
    changes: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    sessionId: string;
  }>;

  @Column({ 
    type: 'varchar', 
    length: 36,
    comment: 'User who created the invoice'
  })
  createdBy: string;

  @CreateDateColumn({
    type: 'timestamptz',
    comment: 'Invoice creation timestamp'
  })
  createdAt: Date;

  @Column({ 
    type: 'varchar', 
    length: 36,
    nullable: true,
    comment: 'User who last modified the invoice'
  })
  lastModifiedBy: string;

  @UpdateDateColumn({
    type: 'timestamptz',
    nullable: true,
    comment: 'Last modification timestamp'
  })
  lastModifiedAt: Date;

  @Column({
    type: 'jsonb',
    comment: 'Additional metadata and custom fields'
  })
  metadata: Record<string, any>;

  constructor() {
    this.lineItems = [];
    this.payments = [];
    this.adjustments = [];
    this.matchingResults = {
      poMatchStatus: 'not_matched',
      receiptMatchStatus: 'not_matched',
      priceVariances: [],
      quantityVariances: [],
      exceptions: [],
      aiConfidence: 0
    };
    this.approvalWorkflow = {
      currentStep: 1,
      totalSteps: 1,
      approvers: [],
      escalations: []
    };
    this.ocrResults = {
      documentId: '',
      extractedFields: {},
      confidence: 0,
      validationResults: [],
      processedAt: new Date().toISOString()
    };
    this.auditTrail = [];
    this.metadata = {};
    this.currencyCode = 'USD';
    this.exchangeRate = '1.0';
    this.discountAmount = '0';
    this.status = 'received';
    this.approvalStatus = 'pending';
  }
}
