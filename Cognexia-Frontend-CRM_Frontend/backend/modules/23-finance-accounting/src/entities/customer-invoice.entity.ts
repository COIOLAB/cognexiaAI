/**
 * Customer Invoice Entity - Customer Billing and Receivables
 * 
 * TypeORM entity for customer invoices supporting multi-currency billing,
 * AI-powered risk analysis, automated collections, and comprehensive
 * payment tracking with government-grade audit trails.
 * 
 * @version 3.0.0
 * @author Industry 5.0 ERP Team
 * @compliance SOC2, ISO27001, GDPR, PCI-DSS, SOX
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Check
} from 'typeorm';
import { ChartOfAccounts } from './chart-of-accounts.entity';

@Entity('customer_invoices')
@Index('idx_invoice_number', ['invoiceNumber'])
@Index('idx_invoice_customer', ['customerId'])
@Index('idx_invoice_status', ['status'])
@Index('idx_invoice_due_date', ['dueDate'])
@Index('idx_invoice_amount', ['totalAmount'])
@Index('idx_invoice_outstanding', ['outstandingAmount'])
@Index('idx_invoice_overdue', ['status', 'dueDate'])
@Check(`"status" IN ('draft', 'sent', 'viewed', 'partial_paid', 'paid', 'overdue', 'disputed', 'cancelled')`)
export class CustomerInvoice {
  @PrimaryGeneratedColumn('uuid')
  invoiceId: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    unique: true,
    comment: 'Human-readable invoice number'
  })
  @Index()
  invoiceNumber: string;

  @Column({ 
    type: 'uuid',
    comment: 'Reference to customer'
  })
  customerId: string;

  @Column({ 
    type: 'varchar', 
    length: 50,
    comment: 'Customer code for reference'
  })
  customerCode: string;

  @Column({ 
    type: 'varchar', 
    length: 255,
    comment: 'Customer name at time of invoice'
  })
  customerName: string;

  @Column({ 
    type: 'uuid',
    nullable: true,
    comment: 'Related sales order ID'
  })
  salesOrderId: string;

  @Column({
    type: 'timestamptz',
    comment: 'Invoice generation date'
  })
  invoiceDate: Date;

  @Column({
    type: 'timestamptz',
    comment: 'Payment due date'
  })
  dueDate: Date;

  @Column({ 
    type: 'varchar', 
    length: 100,
    comment: 'Payment terms description'
  })
  paymentTerms: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    comment: 'Subtotal before taxes and discounts'
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
    enum: ['draft', 'sent', 'viewed', 'partial_paid', 'paid', 'overdue', 'disputed', 'cancelled'],
    default: 'draft',
    comment: 'Current invoice status'
  })
  status: string;

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
    comment: 'Customer billing address'
  })
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Customer shipping address'
  })
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    attentionTo?: string;
    instructions?: string;
  };

  @Column({
    type: 'jsonb',
    comment: 'Invoice line items with detailed breakdown'
  })
  lineItems: Array<{
    lineId: string;
    productId?: string;
    productCode?: string;
    description: string;
    quantity: string;
    unitPrice: string;
    lineTotal: string;
    taxAmount: string;
    discountAmount: string;
    discountPercent: string;
    glAccount: string;
    revenueRecognition: {
      method: string;
      totalPeriods?: number;
      recognizedAmount: string;
      deferredAmount: string;
      recognitionSchedule: Array<{
        periodDate: string;
        recognitionAmount: string;
        status: string;
      }>;
    };
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
    comment: 'Collection activities and follow-ups'
  })
  collections: Array<{
    activityId: string;
    type: string;
    status: string;
    scheduledDate: string;
    completedDate?: string;
    performedBy: string;
    notes: string;
    outcome: string;
    nextAction: string;
    priority: string;
    cost: string;
  }>;

  @Column({
    type: 'jsonb',
    comment: 'Payment reminders sent'
  })
  reminders: Array<{
    reminderId: string;
    type: string;
    sentDate: string;
    deliveryMethod: string;
    template: string;
    personalized: boolean;
    opened: boolean;
    responded: boolean;
    escalationLevel: number;
  }>;

  @Column({
    type: 'jsonb',
    comment: 'Invoice delivery status and tracking'
  })
  deliveryStatus: {
    method: string;
    status: string;
    attempts: number;
    lastAttempt?: string;
    tracking?: string;
    confirmationId?: string;
  };

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'AI-powered risk analysis and insights'
  })
  aiAnalysis: {
    creditRisk: number;
    paymentRisk: number;
    collectionRisk: number;
    fraudRisk: number;
    riskFactors: string[];
    recommendations: string[];
    confidenceScore: number;
    lastUpdated: string;
  };

  @Column({
    type: 'timestamptz',
    nullable: true,
    comment: 'When invoice was sent to customer'
  })
  sentAt: Date;

  @Column({
    type: 'timestamptz',
    nullable: true,
    comment: 'When customer first viewed the invoice'
  })
  viewedAt: Date;

  @Column({
    type: 'timestamptz',
    nullable: true,
    comment: 'When invoice was fully paid'
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
    this.collections = [];
    this.reminders = [];
    this.deliveryStatus = {
      method: 'email',
      status: 'pending',
      attempts: 0
    };
    this.auditTrail = [];
    this.metadata = {};
    this.currencyCode = 'USD';
    this.exchangeRate = '1.0';
    this.discountAmount = '0';
    this.status = 'draft';
  }
}
