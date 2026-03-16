/**
 * Trial Balance Entity
 * 
 * Periodic trial balance for account balances verification
 * and financial reporting with audit trails and compliance.
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
} from 'typeorm';
import { ChartOfAccounts } from './chart-of-accounts.entity';
import * as crypto from 'crypto';

export enum BalanceType {
  OPENING = 'OPENING',
  CLOSING = 'CLOSING',
  ADJUSTED = 'ADJUSTED',
  UNADJUSTED = 'UNADJUSTED',
  PRE_CLOSING = 'PRE_CLOSING',
  POST_CLOSING = 'POST_CLOSING',
}

export enum TrialBalanceStatus {
  DRAFT = 'DRAFT',
  PRELIMINARY = 'PRELIMINARY',
  FINAL = 'FINAL',
  ADJUSTED = 'ADJUSTED',
  LOCKED = 'LOCKED',
  ARCHIVED = 'ARCHIVED',
}

export enum ReportingCurrency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  CAD = 'CAD',
  AUD = 'AUD',
  CHF = 'CHF',
  CNY = 'CNY',
}

@Entity('trial_balances')
@Index(['period', 'fiscalYear'])
@Index(['accountCode', 'balanceDate'])
@Index(['businessUnit', 'costCenter'])
@Index(['balanceType', 'status'])
@Index(['reportingCurrency', 'balanceDate'])
export class TrialBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 7 }) // YYYY-MM format
  @Index()
  period: string;

  @Column({ length: 4 })
  @Index()
  fiscalYear: string;

  @Column({ type: 'date' })
  @Index()
  balanceDate: Date;

  @Column({ length: 20 })
  @Index()
  accountCode: string;

  @Column({
    type: 'enum',
    enum: BalanceType,
    default: BalanceType.CLOSING,
  })
  balanceType: BalanceType;

  @Column({
    type: 'enum',
    enum: TrialBalanceStatus,
    default: TrialBalanceStatus.DRAFT,
  })
  status: TrialBalanceStatus;

  // Balance amounts
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  debitBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  netBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  openingBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  periodDebitMovement: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  periodCreditMovement: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  periodNetMovement: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  closingBalance: number;

  // Currency and conversion
  @Column({
    type: 'enum',
    enum: ReportingCurrency,
    default: ReportingCurrency.USD,
  })
  reportingCurrency: ReportingCurrency;

  @Column({ length: 3, nullable: true })
  functionalCurrency: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 1.0 })
  exchangeRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  functionalCurrencyBalance: number;

  // Dimensional breakdown
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

  // Transaction counts and statistics
  @Column({ type: 'int', default: 0 })
  transactionCount: number;

  @Column({ type: 'int', default: 0 })
  debitTransactionCount: number;

  @Column({ type: 'int', default: 0 })
  creditTransactionCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  averageTransactionAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  largestTransactionAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  smallestTransactionAmount: number;

  // Budget and variance analysis
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  varianceAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  variancePercentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  priorPeriodBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  priorYearBalance: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  periodOverPeriodChange: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  yearOverYearChange: number;

  // Adjustments and reconciliation
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  adjustmentAmount: number;

  @Column({ type: 'text', nullable: true })
  adjustmentReason: string;

  @Column({ length: 50, nullable: true })
  adjustedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  adjustedAt: Date;

  @Column({ type: 'boolean', default: false })
  isReconciled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  reconciledAt: Date;

  @Column({ length: 50, nullable: true })
  reconciledBy: string;

  @Column({ type: 'text', nullable: true })
  reconciliationNotes: string;

  // Risk and compliance indicators
  @Column({ type: 'jsonb', nullable: true })
  riskIndicators: {
    unusualMovements: boolean;
    significantVariance: boolean;
    missingTransactions: boolean;
    duplicateTransactions: boolean;
    timingDifferences: boolean;
    currencyFluctuations: boolean;
    accountReconciliationIssues: boolean;
  };

  @Column({ type: 'int', default: 0 })
  riskScore: number;

  @Column({ type: 'jsonb', nullable: true })
  complianceChecks: {
    soxCompliance: boolean;
    gaapCompliance: boolean;
    ifrsCompliance: boolean;
    regulatoryCompliance: string[];
    auditRequirements: boolean;
    documentationComplete: boolean;
  };

  // AI analysis and insights
  @Column({ type: 'jsonb', nullable: true })
  aiAnalysis: {
    confidenceScore: number;
    anomalyDetection: {
      isAnomaly: boolean;
      anomalyType: string[];
      anomalyScore: number;
      explanation: string;
    };
    trendAnalysis: {
      trend: 'INCREASING' | 'DECREASING' | 'STABLE' | 'VOLATILE';
      trendStrength: number;
      seasonalityDetected: boolean;
      forecastedNextPeriod: number;
    };
    patternRecognition: {
      recognizedPatterns: string[];
      historicalSimilarity: number;
      expectedBehavior: string;
    };
    recommendedActions: string[];
  };

  // Aging and activity analysis
  @Column({ type: 'jsonb', nullable: true })
  agingAnalysis: {
    current: number;
    thirtyDays: number;
    sixtyDays: number;
    ninetyDays: number;
    overNinetyDays: number;
    totalAged: number;
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  hasInactiveTransactions: boolean;

  @Column({ type: 'date', nullable: true })
  lastActivityDate: Date;

  @Column({ type: 'int', nullable: true })
  daysSinceLastActivity: number;

  // Consolidation and elimination
  @Column({ type: 'boolean', default: false })
  isConsolidated: boolean;

  @Column({ type: 'boolean', default: false })
  requiresElimination: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  eliminationAmount: number;

  @Column({ type: 'text', nullable: true })
  eliminationReason: string;

  @Column({ type: 'uuid', nullable: true })
  parentConsolidationId: string;

  // Additional metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    tags?: string[];
    notes?: string;
    reviewComments?: string[];
    attachments?: string[];
    externalReferences?: Record<string, string>;
    customAttributes?: Record<string, any>;
  };

  // Calculation audit trail
  @Column({ type: 'jsonb', nullable: true })
  calculationAudit: {
    openingBalanceSource: string;
    movementCalculationMethod: string;
    exchangeRateSource: string;
    adjustmentHistory: {
      timestamp: string;
      adjustmentType: string;
      amount: number;
      reason: string;
      authorizedBy: string;
    }[];
    validationChecks: {
      checkName: string;
      result: 'PASS' | 'FAIL' | 'WARNING';
      details: string;
    }[];
  };

  // Relationships
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

  @Column({ type: 'timestamp', nullable: true })
  lockedAt: Date;

  @Column({ length: 50, nullable: true })
  lockedBy: string;

  @Column({ type: 'jsonb', nullable: true })
  auditTrail: {
    modifications: {
      timestamp: string;
      user: string;
      action: string;
      changes: Record<string, { old: any; new: any }>;
    }[];
    approvals: {
      approver: string;
      action: 'APPROVED' | 'REJECTED';
      date: string;
      comments?: string;
    }[];
    reconciliationHistory: {
      date: string;
      reconciler: string;
      method: string;
      result: string;
      discrepancies?: string[];
    }[];
  };

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'varchar', length: 64 })
  dataIntegrityHash: string;

  // Hooks for automatic calculations
  @BeforeInsert()
  @BeforeUpdate()
  calculateBalances() {
    this.netBalance = this.debitBalance - this.creditBalance;
    this.periodNetMovement = this.periodDebitMovement - this.periodCreditMovement;
    this.closingBalance = this.openingBalance + this.periodNetMovement;

    // Calculate variance if budget is available
    if (this.budgetAmount !== null && this.budgetAmount !== undefined) {
      this.varianceAmount = this.closingBalance - this.budgetAmount;
      this.variancePercentage = this.budgetAmount !== 0 
        ? (this.varianceAmount / this.budgetAmount) * 100 
        : 0;
    }

    // Calculate period-over-period change
    if (this.priorPeriodBalance !== null && this.priorPeriodBalance !== undefined) {
      const change = this.closingBalance - this.priorPeriodBalance;
      this.periodOverPeriodChange = this.priorPeriodBalance !== 0 
        ? (change / this.priorPeriodBalance) * 100 
        : 0;
    }

    // Calculate year-over-year change
    if (this.priorYearBalance !== null && this.priorYearBalance !== undefined) {
      const change = this.closingBalance - this.priorYearBalance;
      this.yearOverYearChange = this.priorYearBalance !== 0 
        ? (change / this.priorYearBalance) * 100 
        : 0;
    }

    // Calculate functional currency balance
    if (this.functionalCurrency && this.exchangeRate !== 1.0) {
      this.functionalCurrencyBalance = this.closingBalance / this.exchangeRate;
    }

    // Calculate average transaction amount
    if (this.transactionCount > 0) {
      this.averageTransactionAmount = (this.periodDebitMovement + this.periodCreditMovement) / this.transactionCount;
    }

    // Calculate days since last activity
    if (this.lastActivityDate) {
      const today = new Date();
      const timeDiff = today.getTime() - this.lastActivityDate.getTime();
      this.daysSinceLastActivity = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  calculateRiskScore() {
    let score = 0;

    // Significant variance from budget
    if (this.variancePercentage && Math.abs(this.variancePercentage) > 25) score += 30;
    else if (this.variancePercentage && Math.abs(this.variancePercentage) > 10) score += 15;

    // Large period-over-period changes
    if (this.periodOverPeriodChange && Math.abs(this.periodOverPeriodChange) > 50) score += 25;
    else if (this.periodOverPeriodChange && Math.abs(this.periodOverPeriodChange) > 25) score += 15;

    // Risk indicators
    if (this.riskIndicators) {
      Object.values(this.riskIndicators).forEach(indicator => {
        if (indicator) score += 10;
      });
    }

    // Not reconciled
    if (!this.isReconciled) score += 20;

    // Inactive account with balance
    if (!this.isActive && Math.abs(this.closingBalance) > 0.01) score += 25;

    // Large balances
    if (Math.abs(this.closingBalance) > 1000000) score += 10;

    // Long time since last activity
    if (this.daysSinceLastActivity && this.daysSinceLastActivity > 90) score += 15;

    this.riskScore = Math.min(score, 100); // Cap at 100
  }

  @BeforeInsert()
  @BeforeUpdate()
  generateDataIntegrityHash() {
    const data = {
      period: this.period,
      fiscalYear: this.fiscalYear,
      accountCode: this.accountCode,
      balanceDate: this.balanceDate,
      debitBalance: this.debitBalance,
      creditBalance: this.creditBalance,
      openingBalance: this.openingBalance,
      periodDebitMovement: this.periodDebitMovement,
      periodCreditMovement: this.periodCreditMovement,
      closingBalance: this.closingBalance,
      version: this.version,
    };
    
    this.dataIntegrityHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  // Computed properties
  get isBalanced(): boolean {
    return Math.abs(this.debitBalance - this.creditBalance) < 0.01;
  }

  get hasMovement(): boolean {
    return Math.abs(this.periodNetMovement) > 0.01;
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

  get isHighRisk(): boolean {
    return this.riskScore >= 70;
  }

  get isMediumRisk(): boolean {
    return this.riskScore >= 40 && this.riskScore < 70;
  }

  get isLowRisk(): boolean {
    return this.riskScore < 40;
  }

  get requiresReview(): boolean {
    return this.isHighRisk || !this.isReconciled || (this.hasVariance && Math.abs(this.variancePercentage) > 15);
  }

  get isInactive(): boolean {
    return !this.isActive || (this.daysSinceLastActivity && this.daysSinceLastActivity > 365);
  }

  get balanceDirection(): 'DEBIT' | 'CREDIT' | 'ZERO' {
    if (Math.abs(this.netBalance) < 0.01) return 'ZERO';
    return this.netBalance > 0 ? 'DEBIT' : 'CREDIT';
  }

  get isLocked(): boolean {
    return this.status === TrialBalanceStatus.LOCKED;
  }

  get canBeModified(): boolean {
    return !this.isLocked && this.status !== TrialBalanceStatus.ARCHIVED;
  }

  get isAnomaly(): boolean {
    return this.aiAnalysis?.anomalyDetection?.isAnomaly || false;
  }

  get trendDirection(): string {
    return this.aiAnalysis?.trendAnalysis?.trend || 'UNKNOWN';
  }

  get confidenceLevel(): 'HIGH' | 'MEDIUM' | 'LOW' {
    const score = this.aiAnalysis?.confidenceScore || 0;
    if (score >= 90) return 'HIGH';
    if (score >= 70) return 'MEDIUM';
    return 'LOW';
  }
}
