/**
 * Chart of Accounts Entity
 * 
 * Complete chart of accounts structure for government compliance
 * with hierarchical organization, multi-dimensional analysis,
 * and comprehensive audit capabilities.
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
  Tree,
  TreeParent,
  TreeChildren,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { JournalLine } from './journal-line.entity';
import { AccountBalance } from './account-balance.entity';

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
  GAIN = 'GAIN',
  LOSS = 'LOSS',
}

export enum AccountSubType {
  // Assets
  CURRENT_ASSET = 'CURRENT_ASSET',
  NON_CURRENT_ASSET = 'NON_CURRENT_ASSET',
  FIXED_ASSET = 'FIXED_ASSET',
  INTANGIBLE_ASSET = 'INTANGIBLE_ASSET',
  
  // Liabilities
  CURRENT_LIABILITY = 'CURRENT_LIABILITY',
  NON_CURRENT_LIABILITY = 'NON_CURRENT_LIABILITY',
  LONG_TERM_DEBT = 'LONG_TERM_DEBT',
  
  // Equity
  PAID_IN_CAPITAL = 'PAID_IN_CAPITAL',
  RETAINED_EARNINGS = 'RETAINED_EARNINGS',
  OTHER_EQUITY = 'OTHER_EQUITY',
  
  // Revenue
  OPERATING_REVENUE = 'OPERATING_REVENUE',
  NON_OPERATING_REVENUE = 'NON_OPERATING_REVENUE',
  
  // Expenses
  OPERATING_EXPENSE = 'OPERATING_EXPENSE',
  ADMINISTRATIVE_EXPENSE = 'ADMINISTRATIVE_EXPENSE',
  FINANCIAL_EXPENSE = 'FINANCIAL_EXPENSE',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CLOSED = 'CLOSED',
  SUSPENDED = 'SUSPENDED',
}

export enum BalanceType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

@Entity('chart_of_accounts')
@Tree('closure-table')
@Index(['accountCode'], { unique: true })
@Index(['accountType', 'accountSubType'])
@Index(['isActive', 'accountType'])
@Index(['businessUnit', 'costCenter'])
export class ChartOfAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20, unique: true })
  @Index()
  accountCode: string;

  @Column({ length: 255 })
  accountName: string;

  @Column({ length: 1000, nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: AccountType,
  })
  accountType: AccountType;

  @Column({
    type: 'enum',
    enum: AccountSubType,
  })
  accountSubType: AccountSubType;

  @Column({
    type: 'enum',
    enum: BalanceType,
  })
  normalBalance: BalanceType;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  status: AccountStatus;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ length: 50, nullable: true })
  businessUnit: string;

  @Column({ length: 50, nullable: true })
  costCenter: string;

  @Column({ length: 50, nullable: true })
  profitCenter: string;

  @Column({ length: 50, nullable: true })
  department: string;

  @Column({ length: 50, nullable: true })
  location: string;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'boolean', default: false })
  requiresApproval: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  creditLimit: number;

  @Column({ type: 'boolean', default: true })
  allowManualEntries: boolean;

  @Column({ type: 'boolean', default: false })
  isControlAccount: boolean;

  @Column({ type: 'boolean', default: false })
  isStatisticalAccount: boolean;

  @Column({ type: 'boolean', default: false })
  requiresProjectCode: boolean;

  @Column({ type: 'boolean', default: false })
  requiresCostCenter: boolean;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  validationRules: {
    minAmount?: number;
    maxAmount?: number;
    requiredDimensions?: string[];
    allowedTransactionTypes?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  complianceSettings: {
    taxReportingCategory?: string;
    regulatoryClassification?: string;
    auditTrailRequired?: boolean;
    retentionPeriod?: number;
  };

  // Tree relationships
  @TreeParent()
  parent: ChartOfAccount;

  @TreeChildren()
  children: ChartOfAccount[];

  // Related entities
  @OneToMany(() => JournalLine, (journalLine) => journalLine.account)
  journalLines: JournalLine[];

  @OneToMany(() => AccountBalance, (balance) => balance.account)
  balances: AccountBalance[];

  // Audit fields
  @Column({ length: 50 })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ length: 50, nullable: true })
  updatedBy: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ length: 50, nullable: true })
  closedBy: string;

  @Column({ type: 'text', nullable: true })
  closureReason: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  dataIntegrityHash: string;

  // Computed properties
  get fullAccountCode(): string {
    return this.parent 
      ? `${this.parent.fullAccountCode}.${this.accountCode}`
      : this.accountCode;
  }

  get isAsset(): boolean {
    return this.accountType === AccountType.ASSET;
  }

  get isLiability(): boolean {
    return this.accountType === AccountType.LIABILITY;
  }

  get isEquity(): boolean {
    return this.accountType === AccountType.EQUITY;
  }

  get isRevenue(): boolean {
    return this.accountType === AccountType.REVENUE;
  }

  get isExpense(): boolean {
    return this.accountType === AccountType.EXPENSE;
  }

  get hasNormalDebitBalance(): boolean {
    return this.normalBalance === BalanceType.DEBIT;
  }

  get hasNormalCreditBalance(): boolean {
    return this.normalBalance === BalanceType.CREDIT;
  }
}
