/**
 * Journal Entry Entity
 * 
 * Complete journal entry structure for government compliance
 * with comprehensive audit trails, approval workflows,
 * and AI-powered validation capabilities.
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
  OneToMany,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { JournalLine } from './journal-line.entity';
import { PostingRule } from './posting-rule.entity';
import * as crypto from 'crypto';

export enum JournalEntryType {
  MANUAL = 'MANUAL',
  AUTOMATED = 'AUTOMATED',
  REVERSAL = 'REVERSAL',
  ADJUSTMENT = 'ADJUSTMENT',
  CLOSING = 'CLOSING',
  OPENING = 'OPENING',
  RECURRING = 'RECURRING',
  ACCRUAL = 'ACCRUAL',
  RECLASSIFICATION = 'RECLASSIFICATION',
}

export enum JournalEntryStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  POSTED = 'POSTED',
  REVERSED = 'REVERSED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum DocumentType {
  INVOICE = 'INVOICE',
  RECEIPT = 'RECEIPT',
  VOUCHER = 'VOUCHER',
  BANK_STATEMENT = 'BANK_STATEMENT',
  CONTRACT = 'CONTRACT',
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  SALES_ORDER = 'SALES_ORDER',
  JOURNAL_VOUCHER = 'JOURNAL_VOUCHER',
  OTHER = 'OTHER',
}

@Entity('journal_entries')
@Index(['entryType', 'status'])
@Index(['transactionDate', 'postingDate'])
@Index(['period', 'fiscalYear'])
@Index(['businessUnit', 'costCenter'])
@Index(['status', 'createdAt'])
@Index(['sourceModule', 'sourceTransactionId'])
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  @Index()
  entryNumber: string;

  @Column({
    type: 'enum',
    enum: JournalEntryType,
    default: JournalEntryType.MANUAL,
  })
  entryType: JournalEntryType;

  @Column({
    type: 'enum',
    enum: JournalEntryStatus,
    default: JournalEntryStatus.DRAFT,
  })
  status: JournalEntryStatus;

  @Column({ type: 'date' })
  @Index()
  transactionDate: Date;

  @Column({ type: 'date' })
  @Index()
  postingDate: Date;

  @Column({ length: 7 }) // YYYY-MM format
  @Index()
  period: string;

  @Column({ length: 4 })
  @Index()
  fiscalYear: string;

  @Column({ length: 100 })
  reference: string;

  @Column({ length: 500 })
  description: string;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 1.0 })
  exchangeRate: number;

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

  // Source document information
  @Column({
    type: 'enum',
    enum: DocumentType,
    nullable: true,
  })
  sourceDocumentType: DocumentType;

  @Column({ length: 100, nullable: true })
  sourceDocumentNumber: string;

  @Column({ type: 'date', nullable: true })
  sourceDocumentDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  attachments: string[];

  // Source system tracking
  @Column({ length: 50, nullable: true })
  sourceModule: string;

  @Column({ length: 100, nullable: true })
  sourceTransactionId: string;

  @Column({ length: 50, nullable: true })
  sourceSystem: string;

  // Totals and validation
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDebit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalCredit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balanceDifference: number;

  @Column({ type: 'boolean', default: false })
  isBalanced: boolean;

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ length: 50, nullable: true })
  recurringSchedule: string; // CRON expression

  // Approval workflow
  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  approvalStatus: ApprovalStatus;

  @Column({ type: 'jsonb', nullable: true })
  approvalWorkflow: {
    requiredApprovals: string[];
    currentApprover?: string;
    approvalLevel: number;
    maxApprovalLevel: number;
    approvalAmount: number;
    approvalCurrency: string;
    approvalHistory: {
      approver: string;
      action: 'APPROVED' | 'REJECTED' | 'RETURNED';
      date: string;
      comments?: string;
      ipAddress?: string;
    }[];
  };

  // AI validation and analysis
  @Column({ type: 'jsonb', nullable: true })
  aiValidation: {
    confidenceScore: number;
    anomalyFlags: string[];
    suggestions: string[];
    riskAssessment: 'LOW' | 'MEDIUM' | 'HIGH';
    patternMatching: {
      historicalSimilarity: number;
      expectedAccounts: string[];
      accountVarianceFlags: string[];
    };
    fraudDetection: {
      suspiciousPatterns: string[];
      duplicateRisk: number;
      timingAnomalies: string[];
    };
    complianceValidation: {
      regulatoryChecks: string[];
      gapAnalysis: string[];
      recommendedActions: string[];
    };
  };

  // Compliance and risk
  @Column({ type: 'jsonb', nullable: true })
  complianceFlags: string[];

  @Column({ type: 'int', default: 0 })
  riskScore: number;

  @Column({ type: 'boolean', default: false })
  requiresReview: boolean;

  @Column({ type: 'boolean', default: false })
  isSensitive: boolean;

  // Posting and reversal tracking
  @Column({ type: 'timestamp', nullable: true })
  postedAt: Date;

  @Column({ length: 50, nullable: true })
  postedBy: string;

  @Column({ length: 100, nullable: true })
  postingReference: string;

  @Column({ type: 'uuid', nullable: true })
  reversalEntryId: string;

  @Column({ type: 'uuid', nullable: true })
  originalEntryId: string;

  @Column({ type: 'text', nullable: true })
  reversalReason: string;

  @Column({ type: 'timestamp', nullable: true })
  reversedAt: Date;

  @Column({ length: 50, nullable: true })
  reversedBy: string;

  // Custom fields and metadata
  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    tags?: string[];
    category?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    externalReferences?: Record<string, string>;
  };

  // Relationships
  @OneToMany(() => JournalLine, (line) => line.journalEntry, {
    cascade: true,
    eager: true,
  })
  lines: JournalLine[];

  @ManyToOne(() => PostingRule, { nullable: true })
  @JoinColumn({ name: 'appliedRuleId' })
  appliedRule: PostingRule;

  @Column({ type: 'uuid', nullable: true })
  appliedRuleId: string;

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
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    approvalChain: string[];
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
  calculateTotalsAndBalance() {
    if (this.lines && this.lines.length > 0) {
      this.totalDebit = this.lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
      this.totalCredit = this.lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
      this.balanceDifference = Math.abs(this.totalDebit - this.totalCredit);
      this.isBalanced = this.balanceDifference < 0.01; // Allow for rounding
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  generateDataIntegrityHash() {
    const data = {
      entryNumber: this.entryNumber,
      entryType: this.entryType,
      transactionDate: this.transactionDate,
      description: this.description,
      totalDebit: this.totalDebit,
      totalCredit: this.totalCredit,
      lines: this.lines?.map(line => ({
        accountCode: line.accountCode,
        debitAmount: line.debitAmount,
        creditAmount: line.creditAmount,
        description: line.description,
      })),
    };
    
    this.dataIntegrityHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  @BeforeInsert()
  generateEntryNumber() {
    if (!this.entryNumber) {
      const date = new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const timestamp = Date.now().toString().slice(-6);
      this.entryNumber = `JE${year}${month}${timestamp}`;
    }
  }

  // Computed properties
  get isPosted(): boolean {
    return this.status === JournalEntryStatus.POSTED;
  }

  get isReversed(): boolean {
    return this.status === JournalEntryStatus.REVERSED;
  }

  get canBeEdited(): boolean {
    return [JournalEntryStatus.DRAFT, JournalEntryStatus.REJECTED].includes(this.status);
  }

  get canBePosted(): boolean {
    return this.status === JournalEntryStatus.APPROVED && this.isBalanced;
  }

  get canBeReversed(): boolean {
    return this.status === JournalEntryStatus.POSTED && !this.reversalEntryId;
  }

  get requiresApproval(): boolean {
    return this.approvalWorkflow?.requiredApprovals?.length > 0;
  }

  get isFullyApproved(): boolean {
    return this.approvalStatus === ApprovalStatus.APPROVED;
  }

  get lineCount(): number {
    return this.lines?.length || 0;
  }
}
