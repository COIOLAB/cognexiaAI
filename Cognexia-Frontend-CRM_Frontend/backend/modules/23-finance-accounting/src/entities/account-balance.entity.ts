/**
 * Account Balance Entity
 * 
 * Real-time account balance tracking for all accounts
 * with dimensional breakdowns and performance monitoring.
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

export enum BalancePeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  REAL_TIME = 'REAL_TIME',
}

export enum BalanceStatus {
  CURRENT = 'CURRENT',
  STALE = 'STALE',
  RECONCILING = 'RECONCILING',
  LOCKED = 'LOCKED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('account_balances')
@Index(['accountCode', 'balanceDate'])
@Index(['businessUnit', 'costCenter'])
@Index(['balancePeriod', 'status'])
@Index(['lastUpdated', 'isStale'])
@Index(['currency', 'functionalCurrency'])
export class AccountBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20 })
  @Index()
  accountCode: string;

  @Column({ type: 'date' })
  @Index()
  balanceDate: Date;

  @Column({
    type: 'enum',
    enum: BalancePeriod,
    default: BalancePeriod.REAL_TIME,
  })
  balancePeriod: BalancePeriod;

  @Column({
    type: 'enum',
    enum: BalanceStatus,
    default: BalanceStatus.CURRENT,
  })
  status: BalanceStatus;

  // Core balance amounts
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  openingBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  debitMovements: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditMovements: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  netMovements: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  currentBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  availableBalance: number; // For credit limit accounts

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  reservedBalance: number; // Encumbered or reserved amounts

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  pendingBalance: number; // Pending transactions

  // Currency handling
  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ length: 3, nullable: true })
  functionalCurrency: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 1.0 })
  exchangeRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  functionalCurrencyBalance: number;

  @Column({ type: 'timestamp', nullable: true })
  exchangeRateDate: Date;

  @Column({ length: 50, nullable: true })
  exchangeRateSource: string;

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

  @Column({ length: 50, nullable: true })
  product: string;

  @Column({ length: 50, nullable: true })
  customer: string;

  @Column({ length: 50, nullable: true })
  vendor: string;

  // Transaction statistics
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

  @Column({ type: 'timestamp', nullable: true })
  lastTransactionDate: Date;

  @Column({ type: 'uuid', nullable: true })
  lastTransactionId: string;

  // Budget and limits
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetVariance: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  budgetVariancePercentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  creditLimit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  creditUtilization: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  creditUtilizationPercentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  warningThreshold: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  alertThreshold: number;

  // Historical comparisons
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  priorDayBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  priorWeekBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  priorMonthBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  priorQuarterBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  priorYearBalance: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  dayOverDayChange: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weekOverWeekChange: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  monthOverMonthChange: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  quarterOverQuarterChange: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  yearOverYearChange: number;

  // Cash flow and liquidity
  @Column({ type: 'boolean', default: false })
  isCashAccount: boolean;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  cashInflowToday: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  cashOutflowToday: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  netCashFlowToday: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  projectedBalance7Days: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  projectedBalance30Days: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  projectedBalance90Days: number;

  // Risk and monitoring
  @Column({ type: 'int', default: 0 })
  riskScore: number;

  @Column({ type: 'jsonb', nullable: true })
  riskFactors: {
    volatility: number;
    concentrationRisk: boolean;
    liquidityRisk: boolean;
    creditRisk: boolean;
    operationalRisk: boolean;
    complianceRisk: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  alertTriggers: {
    balanceThresholdExceeded: boolean;
    budgetVarianceExceeded: boolean;
    creditLimitApproached: boolean;
    unusualActivity: boolean;
    reconciliationOverdue: boolean;
    complianceViolation: boolean;
  };

  @Column({ type: 'boolean', default: false })
  requiresAttention: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastReconciledDate: Date;

  @Column({ type: 'int', nullable: true })
  daysSinceReconciliation: number;

  // Performance tracking
  @Column({ type: 'timestamp' })
  lastCalculated: Date;

  @Column({ type: 'timestamp' })
  lastUpdated: Date;

  @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true })
  calculationTimeMs: number;

  @Column({ type: 'boolean', default: false })
  isStale: boolean;

  @Column({ type: 'int', default: 0 })
  stalenessMinutes: number;

  @Column({ type: 'int', default: 0 })
  refreshCount: number;

  @Column({ type: 'timestamp', nullable: true })
  nextScheduledRefresh: Date;

  // AI insights and predictions
  @Column({ type: 'jsonb', nullable: true })
  aiInsights: {
    volatilityIndex: number;
    predictedTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
    seasonalityPattern: string;
    anomalyScore: number;
    confidenceLevel: number;
    recommendedActions: string[];
    forecastAccuracy: number;
    lastAnalysisDate: string;
  };

  // Quality and validation
  @Column({ type: 'jsonb', nullable: true })
  qualityMetrics: {
    dataCompleteness: number;
    dataAccuracy: number;
    timeliness: number;
    consistency: number;
    validationErrors: string[];
    lastQualityCheck: string;
  };

  @Column({ type: 'boolean', default: true })
  isValid: boolean;

  @Column({ type: 'jsonb', nullable: true })
  validationErrors: string[];

  @Column({ type: 'timestamp', nullable: true })
  lastValidated: Date;

  // Custom fields and metadata
  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    tags?: string[];
    notes?: string;
    category?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    source?: string;
    sourceTransactionId?: string;
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

  @Column({ type: 'jsonb', nullable: true })
  auditTrail: {
    balanceChanges: {
      timestamp: string;
      oldBalance: number;
      newBalance: number;
      changeAmount: number;
      changeType: 'DEBIT' | 'CREDIT' | 'ADJUSTMENT';
      transactionId?: string;
      userId: string;
    }[];
    reconciliations: {
      date: string;
      reconciler: string;
      method: string;
      result: 'MATCHED' | 'DISCREPANCY' | 'ADJUSTED';
      discrepancyAmount?: number;
      notes?: string;
    }[];
    adjustments: {
      timestamp: string;
      adjustmentType: string;
      amount: number;
      reason: string;
      authorizedBy: string;
      approvalReference?: string;
    }[];
  };

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'varchar', length: 64 })
  dataIntegrityHash: string;

  // Hooks for automatic calculations
  @BeforeInsert()
  @BeforeUpdate()
  calculateDerivedFields() {
    // Calculate net movements
    this.netMovements = this.debitMovements - this.creditMovements;
    
    // Calculate current balance
    this.currentBalance = this.openingBalance + this.netMovements;
    
    // Calculate available balance (current - reserved - pending)
    this.availableBalance = this.currentBalance - (this.reservedBalance || 0) - (this.pendingBalance || 0);
    
    // Calculate functional currency balance
    if (this.functionalCurrency && this.exchangeRate !== 1.0) {
      this.functionalCurrencyBalance = this.currentBalance / this.exchangeRate;
    }
    
    // Calculate budget variance
    if (this.budgetAmount !== null && this.budgetAmount !== undefined) {
      this.budgetVariance = this.currentBalance - this.budgetAmount;
      this.budgetVariancePercentage = this.budgetAmount !== 0 
        ? (this.budgetVariance / this.budgetAmount) * 100 
        : 0;
    }
    
    // Calculate credit utilization
    if (this.creditLimit !== null && this.creditLimit !== undefined && this.creditLimit > 0) {
      this.creditUtilization = Math.max(0, this.currentBalance);
      this.creditUtilizationPercentage = (this.creditUtilization / this.creditLimit) * 100;
    }
    
    // Calculate period-over-period changes
    if (this.priorDayBalance !== null) {
      const change = this.currentBalance - this.priorDayBalance;
      this.dayOverDayChange = this.priorDayBalance !== 0 ? (change / this.priorDayBalance) * 100 : 0;
    }
    
    if (this.priorWeekBalance !== null) {
      const change = this.currentBalance - this.priorWeekBalance;
      this.weekOverWeekChange = this.priorWeekBalance !== 0 ? (change / this.priorWeekBalance) * 100 : 0;
    }
    
    if (this.priorMonthBalance !== null) {
      const change = this.currentBalance - this.priorMonthBalance;
      this.monthOverMonthChange = this.priorMonthBalance !== 0 ? (change / this.priorMonthBalance) * 100 : 0;
    }
    
    if (this.priorQuarterBalance !== null) {
      const change = this.currentBalance - this.priorQuarterBalance;
      this.quarterOverQuarterChange = this.priorQuarterBalance !== 0 ? (change / this.priorQuarterBalance) * 100 : 0;
    }
    
    if (this.priorYearBalance !== null) {
      const change = this.currentBalance - this.priorYearBalance;
      this.yearOverYearChange = this.priorYearBalance !== 0 ? (change / this.priorYearBalance) * 100 : 0;
    }
    
    // Calculate average transaction amount
    if (this.transactionCount > 0) {
      this.averageTransactionAmount = (this.debitMovements + this.creditMovements) / this.transactionCount;
    }
    
    // Calculate cash flow for cash accounts
    if (this.isCashAccount) {
      this.netCashFlowToday = (this.cashInflowToday || 0) - (this.cashOutflowToday || 0);
    }
    
    // Calculate staleness
    if (this.lastUpdated) {
      const now = new Date();
      const timeDiff = now.getTime() - this.lastUpdated.getTime();
      this.stalenessMinutes = Math.floor(timeDiff / (1000 * 60));
      this.isStale = this.stalenessMinutes > 30; // Consider stale after 30 minutes
    }
    
    // Calculate days since reconciliation
    if (this.lastReconciledDate) {
      const today = new Date();
      const timeDiff = today.getTime() - this.lastReconciledDate.getTime();
      this.daysSinceReconciliation = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    }
    
    // Update timestamps
    this.lastCalculated = new Date();
    if (!this.lastUpdated) {
      this.lastUpdated = new Date();
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  calculateRiskScore() {
    let score = 0;
    
    // Budget variance risk
    if (this.budgetVariancePercentage && Math.abs(this.budgetVariancePercentage) > 25) score += 25;
    else if (this.budgetVariancePercentage && Math.abs(this.budgetVariancePercentage) > 10) score += 15;
    
    // Credit utilization risk
    if (this.creditUtilizationPercentage && this.creditUtilizationPercentage > 90) score += 30;
    else if (this.creditUtilizationPercentage && this.creditUtilizationPercentage > 75) score += 20;
    
    // Volatility risk
    const changes = [this.dayOverDayChange, this.weekOverWeekChange, this.monthOverMonthChange].filter(c => c !== null);
    if (changes.length > 0) {
      const avgVolatility = changes.reduce((sum, change) => sum + Math.abs(change), 0) / changes.length;
      if (avgVolatility > 50) score += 20;
      else if (avgVolatility > 25) score += 10;
    }
    
    // Reconciliation overdue
    if (this.daysSinceReconciliation && this.daysSinceReconciliation > 30) score += 20;
    else if (this.daysSinceReconciliation && this.daysSinceReconciliation > 14) score += 10;
    
    // Data staleness
    if (this.isStale) score += 15;
    
    // Large balances (higher risk)
    if (Math.abs(this.currentBalance) > 1000000) score += 10;
    
    // Alert triggers
    if (this.alertTriggers) {
      Object.values(this.alertTriggers).forEach(trigger => {
        if (trigger) score += 10;
      });
    }
    
    this.riskScore = Math.min(score, 100); // Cap at 100
    this.requiresAttention = this.riskScore >= 50;
  }

  @BeforeInsert()
  @BeforeUpdate()
  generateDataIntegrityHash() {
    const data = {
      accountCode: this.accountCode,
      balanceDate: this.balanceDate,
      openingBalance: this.openingBalance,
      debitMovements: this.debitMovements,
      creditMovements: this.creditMovements,
      currentBalance: this.currentBalance,
      currency: this.currency,
      exchangeRate: this.exchangeRate,
      version: this.version,
    };
    
    this.dataIntegrityHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  // Computed properties
  get isDebitBalance(): boolean {
    return this.currentBalance > 0;
  }

  get isCreditBalance(): boolean {
    return this.currentBalance < 0;
  }

  get isZeroBalance(): boolean {
    return Math.abs(this.currentBalance) < 0.01;
  }

  get hasMovement(): boolean {
    return Math.abs(this.netMovements) > 0.01;
  }

  get isOverBudget(): boolean {
    return this.budgetVariance > 0;
  }

  get isUnderBudget(): boolean {
    return this.budgetVariance < 0;
  }

  get isNearCreditLimit(): boolean {
    return this.creditUtilizationPercentage > 80;
  }

  get isOverCreditLimit(): boolean {
    return this.creditUtilizationPercentage > 100;
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

  get isReconciliationOverdue(): boolean {
    return this.daysSinceReconciliation > 30;
  }

  get balanceDirection(): 'INCREASING' | 'DECREASING' | 'STABLE' {
    if (this.dayOverDayChange > 1) return 'INCREASING';
    if (this.dayOverDayChange < -1) return 'DECREASING';
    return 'STABLE';
  }

  get dataQualityGrade(): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (!this.qualityMetrics) return 'F';
    
    const avgQuality = (
      this.qualityMetrics.dataCompleteness +
      this.qualityMetrics.dataAccuracy +
      this.qualityMetrics.timeliness +
      this.qualityMetrics.consistency
    ) / 4;
    
    if (avgQuality >= 95) return 'A';
    if (avgQuality >= 90) return 'B';
    if (avgQuality >= 80) return 'C';
    if (avgQuality >= 70) return 'D';
    return 'F';
  }

  get aiConfidenceLevel(): 'HIGH' | 'MEDIUM' | 'LOW' {
    const confidence = this.aiInsights?.confidenceLevel || 0;
    if (confidence >= 90) return 'HIGH';
    if (confidence >= 70) return 'MEDIUM';
    return 'LOW';
  }
}
