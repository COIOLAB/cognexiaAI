/**
 * Journal Line Entity
 * 
 * Individual journal entry line items for double-entry bookkeeping
 * with comprehensive tracking, allocations, and compliance features.
 * 
 * @version 3.0.0
 * @compliance SOX, GAAP, IFRS, SOC2, ISO27001
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  Check,
} from 'typeorm';
import { JournalEntry } from './journal-entry.entity';
import { ChartOfAccounts } from './chart-of-accounts.entity';
import * as crypto from 'crypto';

export enum LineType {
  NORMAL = 'NORMAL',
  TAX = 'TAX',
  DISCOUNT = 'DISCOUNT',
  ALLOCATION = 'ALLOCATION',
  ROUNDING = 'ROUNDING',
  WITHHOLDING = 'WITHHOLDING',
  COMMISSION = 'COMMISSION',
  FEE = 'FEE',
}

export enum AnalysisCode {
  REVENUE = 'REVENUE',
  COST_OF_GOODS = 'COST_OF_GOODS',
  OPERATING_EXPENSE = 'OPERATING_EXPENSE',
  DEPRECIATION = 'DEPRECIATION',
  INTEREST = 'INTEREST',
  TAX_EXPENSE = 'TAX_EXPENSE',
  CAPITAL = 'CAPITAL',
  DIVIDEND = 'DIVIDEND',
  OTHER = 'OTHER',
}

@Entity('journal_lines')
@Index(['journalEntryId', 'lineNumber'])
@Index(['accountCode', 'transactionDate'])
@Index(['businessUnit', 'costCenter'])
@Index(['debitAmount', 'creditAmount'])
@Index(['currency', 'exchangeRate'])
@Check('debit_credit_mutual_exclusive', 
  '(debit_amount IS NULL AND credit_amount IS NOT NULL) OR (debit_amount IS NOT NULL AND credit_amount IS NULL)')
@Check('amount_positive', 'COALESCE(debit_amount, 0) >= 0 AND COALESCE(credit_amount, 0) >= 0')
export class JournalLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  journalEntryId: string;

  @Column({ type: 'int' })
  lineNumber: number;

  @Column({ length: 20 })
  @Index()
  accountCode: string;

  @Column({ length: 500 })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  debitAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  creditAmount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 1.0 })
  exchangeRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  baseCurrencyAmount: number;

  @Column({
    type: 'enum',
    enum: LineType,
    default: LineType.NORMAL,
  })
  lineType: LineType;

  @Column({
    type: 'enum',
    enum: AnalysisCode,
    nullable: true,
  })
  analysisCode: AnalysisCode;

  // Dimensional analysis
  @Column({ length: 50, nullable: true })
  businessUnit: string;

  @Column({ length: 50, nullable: true })
  costCenter: string;

  @Column({ length: 50, nullable: true })
  profitCenter: string;

  @Column({ length: 50, nullable: true })
  project: string;

  @Column({ length: 50, nullable: true })
  department: string;

  @Column({ length: 50, nullable: true })
  location: string;

  @Column({ length: 50, nullable: true })
  product: string;

  @Column({ length: 50, nullable: true })
  customer: string;

  @Column({ length: 50, nullable: true })
  vendor: string;

  @Column({ length: 50, nullable: true })
  employee: string;

  @Column({ length: 50, nullable: true })
  asset: string;

  // Tax and regulatory
  @Column({ length: 20, nullable: true })
  taxCode: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  taxRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  taxAmount: number;

  @Column({ type: 'boolean', default: false })
  isTaxDeductible: boolean;

  @Column({ type: 'boolean', default: false })
  isIntercompany: boolean;

  @Column({ length: 50, nullable: true })
  intercompanyEntity: string;

  // Reference and tracking
  @Column({ length: 100, nullable: true })
  reference: string;

  @Column({ length: 100, nullable: true })
  externalReference: string;

  @Column({ length: 100, nullable: true })
  documentNumber: string;

  @Column({ type: 'date', nullable: true })
  transactionDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  // Allocation and distribution
  @Column({ type: 'jsonb', nullable: true })
  allocationRules: {
    method: 'PERCENTAGE' | 'AMOUNT' | 'UNITS' | 'WEIGHT';
    allocations: {
      targetAccount: string;
      businessUnit?: string;
      costCenter?: string;
      percentage?: number;
      amount?: number;
      units?: number;
      weight?: number;
    }[];
    totalAllocated: number;
    remainingAmount: number;
  };

  @Column({ type: 'boolean', default: false })
  isAllocated: boolean;

  @Column({ type: 'uuid', nullable: true })
  parentLineId: string; // For allocation child lines

  // Statistical and analysis data
  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  quantity: number;

  @Column({ length: 10, nullable: true })
  unit: string;

  @Column({ type: 'decimal', precision: 15, scale: 6, nullable: true })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  statisticalAmount: number;

  // Budget and variance analysis
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  varianceAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  variancePercentage: number;

  @Column({ length: 50, nullable: true })
  budgetCode: string;

  // Workflow and approval
  @Column({ type: 'boolean', default: false })
  requiresApproval: boolean;

  @Column({ type: 'boolean', default: false })
  isApproved: boolean;

  @Column({ length: 50, nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  // Cash flow and payment tracking
  @Column({ type: 'boolean', default: false })
  affectsCashFlow: boolean;

  @Column({ type: 'date', nullable: true })
  expectedPaymentDate: Date;

  @Column({ type: 'date', nullable: true })
  actualPaymentDate: Date;

  @Column({ length: 50, nullable: true })
  paymentMethod: string;

  @Column({ length: 100, nullable: true })
  paymentReference: string;

  // AI and analytics insights
  @Column({ type: 'jsonb', nullable: true })
  aiInsights: {
    confidenceScore: number;
    accountSuggestions: string[];
    anomalyFlags: string[];
    historicalPattern: {
      frequency: number;
      averageAmount: number;
      seasonality: string;
      trendDirection: 'UP' | 'DOWN' | 'STABLE';
    };
    riskIndicators: string[];
    complianceChecks: string[];
  };

  // Custom fields and metadata
  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    tags?: string[];
    category?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    notes?: string;
    attachments?: string[];
  };

  // Relationships
  @ManyToOne(() => JournalEntry, (entry) => entry.lines, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'journalEntryId' })
  journalEntry: JournalEntry;

  @ManyToOne(() => ChartOfAccounts, { eager: true })
  @JoinColumn({ name: 'accountCode', referencedColumnName: 'accountCode' })
  account: ChartOfAccounts;

  // Audit trail
  @Column({ length: 50 })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ length: 50, nullable: true })
  updatedBy: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  auditTrail: {
    modifications: {
      timestamp: string;
      user: string;
      action: string;
      changes: Record<string, { old: any; new: any }>;
    }[];
  };

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'varchar', length: 64 })
  dataIntegrityHash: string;

  // Hooks for automatic calculations
  @BeforeInsert()
  @BeforeUpdate()
  calculateBaseCurrencyAmount() {
    if (this.debitAmount && this.exchangeRate) {
      this.baseCurrencyAmount = this.debitAmount * this.exchangeRate;
    } else if (this.creditAmount && this.exchangeRate) {
      this.baseCurrencyAmount = this.creditAmount * this.exchangeRate;
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  calculateVariance() {
    if (this.budgetAmount && (this.debitAmount || this.creditAmount)) {
      const actualAmount = this.debitAmount || this.creditAmount;
      this.varianceAmount = actualAmount - this.budgetAmount;
      this.variancePercentage = this.budgetAmount !== 0 
        ? (this.varianceAmount / this.budgetAmount) * 100 
        : 0;
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  generateDataIntegrityHash() {
    const data = {
      journalEntryId: this.journalEntryId,
      lineNumber: this.lineNumber,
      accountCode: this.accountCode,
      debitAmount: this.debitAmount,
      creditAmount: this.creditAmount,
      description: this.description,
      currency: this.currency,
      exchangeRate: this.exchangeRate,
    };
    
    this.dataIntegrityHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  // Computed properties
  get amount(): number {
    return this.debitAmount || this.creditAmount || 0;
  }

  get isDebit(): boolean {
    return this.debitAmount !== null && this.debitAmount > 0;
  }

  get isCredit(): boolean {
    return this.creditAmount !== null && this.creditAmount > 0;
  }

  get isBalanced(): boolean {
    return (this.debitAmount || 0) + (this.creditAmount || 0) > 0;
  }

  get hasVariance(): boolean {
    return this.budgetAmount !== null && this.varianceAmount !== null && Math.abs(this.varianceAmount) > 0.01;
  }

  get isOverBudget(): boolean {
    return this.varianceAmount > 0;
  }

  get isUnderBudget(): boolean {
    return this.varianceAmount < 0;
  }

  get isPaymentOverdue(): boolean {
    if (!this.expectedPaymentDate || this.actualPaymentDate) return false;
    return new Date() > this.expectedPaymentDate;
  }

  get daysPastDue(): number {
    if (!this.isPaymentOverdue) return 0;
    const today = new Date();
    const overdueDays = Math.floor((today.getTime() - this.expectedPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
    return overdueDays;
  }

  get hasHighRisk(): boolean {
    return this.aiInsights?.riskIndicators?.length > 0 || false;
  }

  get requiresReview(): boolean {
    return this.hasVariance || this.hasHighRisk || this.isPaymentOverdue;
  }
}
