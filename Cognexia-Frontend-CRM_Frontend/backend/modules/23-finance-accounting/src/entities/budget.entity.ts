/**
 * Budget Entity - Financial Planning and Control
 * 
 * TypeORM entity for budget management supporting multi-dimensional budgeting,
 * AI-powered forecasting, rolling forecasts, scenario planning, and comprehensive
 * variance analysis with government-grade audit trails.
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
  ManyToOne,
  JoinColumn,
  Check
} from 'typeorm';
import { ChartOfAccounts } from './chart-of-accounts.entity';

@Entity('budgets')
@Index('idx_budget_period', ['budgetPeriod', 'fiscalYear'])
@Index('idx_budget_account', ['accountId'])
@Index('idx_budget_entity', ['entityId'])
@Index('idx_budget_status', ['status'])
@Index('idx_budget_type', ['budgetType'])
@Index('idx_budget_version', ['budgetVersion', 'isActive'])
@Check(`"budgetType" IN ('OPERATING', 'CAPITAL', 'CASH_FLOW', 'PROJECT', 'DEPARTMENT', 'STRATEGIC')`)
@Check(`"status" IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ACTIVE', 'LOCKED', 'CLOSED')`)
@Check(`"periodType" IN ('ANNUAL', 'QUARTERLY', 'MONTHLY', 'WEEKLY', 'ROLLING')`)
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  budgetId: string;

  @Column({ 
    type: 'varchar', 
    length: 100,
    comment: 'Human-readable budget name'
  })
  budgetName: string;

  @Column({
    type: 'enum',
    enum: ['OPERATING', 'CAPITAL', 'CASH_FLOW', 'PROJECT', 'DEPARTMENT', 'STRATEGIC'],
    comment: 'Type of budget'
  })
  budgetType: string;

  @Column({ 
    type: 'varchar', 
    length: 50,
    comment: 'Budget period identifier (e.g., 2024-Q1, 2024-01)'
  })
  budgetPeriod: string;

  @Column({
    type: 'enum',
    enum: ['ANNUAL', 'QUARTERLY', 'MONTHLY', 'WEEKLY', 'ROLLING'],
    comment: 'Budget period type'
  })
  periodType: string;

  @Column({ 
    type: 'int',
    comment: 'Fiscal year for the budget'
  })
  fiscalYear: number;

  @Column({
    type: 'timestamptz',
    comment: 'Budget period start date'
  })
  periodStartDate: Date;

  @Column({
    type: 'timestamptz',
    comment: 'Budget period end date'
  })
  periodEndDate: Date;

  @Column({ 
    type: 'uuid',
    comment: 'Entity/company this budget belongs to'
  })
  entityId: string;

  @Column({ 
    type: 'uuid',
    comment: 'Account this budget line applies to'
  })
  accountId: string;

  @Column({ 
    type: 'varchar', 
    length: 50,
    comment: 'Account code for reference'
  })
  accountCode: string;

  @Column({ 
    type: 'varchar', 
    length: 255,
    comment: 'Account name for reference'
  })
  accountName: string;

  @Column({
    type: 'jsonb',
    comment: 'Multi-dimensional budget allocations'
  })
  dimensions: {
    costCenter?: string;
    profitCenter?: string;
    businessUnit?: string;
    product?: string;
    geography?: string;
    project?: string;
    department?: string;
    customDimensions?: Record<string, string>;
  };

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    comment: 'Original budgeted amount'
  })
  originalAmount: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    comment: 'Current revised budget amount'
  })
  revisedAmount: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: 0,
    comment: 'Actual spent/received amount'
  })
  actualAmount: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: 0,
    comment: 'Committed/encumbered amount'
  })
  commitmentAmount: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    comment: 'Available budget amount (revised - actual - commitment)'
  })
  availableAmount: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    comment: 'Variance from budget (actual - revised)'
  })
  variance: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    comment: 'Variance percentage ((actual - revised) / revised * 100)'
  })
  variancePercent: string;

  @Column({ 
    type: 'varchar', 
    length: 3,
    default: 'USD',
    comment: 'Budget currency code'
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
    comment: 'Budget amount in base currency'
  })
  baseAmount: string;

  @Column({
    type: 'enum',
    enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ACTIVE', 'LOCKED', 'CLOSED'],
    default: 'DRAFT',
    comment: 'Current budget status'
  })
  status: string;

  @Column({ 
    type: 'int',
    default: 1,
    comment: 'Budget version number'
  })
  budgetVersion: number;

  @Column({ 
    type: 'boolean',
    default: true,
    comment: 'Whether this is the active version'
  })
  isActive: boolean;

  @Column({ 
    type: 'uuid',
    nullable: true,
    comment: 'Previous version budget ID'
  })
  previousVersionId: string;

  @Column({
    type: 'jsonb',
    comment: 'Monthly/periodic breakdown of budget'
  })
  periodicBreakdown: Array<{
    period: string;
    startDate: string;
    endDate: string;
    budgetAmount: string;
    actualAmount: string;
    forecastAmount: string;
    variance: string;
    utilizationPercent: string;
  }>;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'AI-powered forecasting and predictions'
  })
  aiForecasting: {
    forecastAmount: string;
    forecastConfidence: number;
    seasonalFactors: Record<string, number>;
    trendAnalysis: {
      trend: 'INCREASING' | 'DECREASING' | 'STABLE';
      growthRate: string;
      seasonality: boolean;
    };
    riskFactors: string[];
    recommendations: string[];
    lastUpdated: string;
    modelVersion: string;
  };

  @Column({
    type: 'jsonb',
    comment: 'Budget approval workflow tracking'
  })
  approvalWorkflow: {
    currentStep: number;
    totalSteps: number;
    approvers: Array<{
      stepNumber: number;
      approverType: 'user' | 'role' | 'budget_threshold';
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
    comment: 'Budget revisions and adjustments history'
  })
  revisions: Array<{
    revisionId: string;
    revisionNumber: number;
    revisionDate: string;
    revisionReason: string;
    revisedBy: string;
    previousAmount: string;
    newAmount: string;
    adjustmentAmount: string;
    approvalRequired: boolean;
    approvedBy?: string;
    approvedAt?: string;
    notes?: string;
  }>;

  @Column({
    type: 'jsonb',
    comment: 'Budget allocation rules and methodology'
  })
  allocationRules: {
    methodology: 'HISTORICAL' | 'ZERO_BASED' | 'ACTIVITY_BASED' | 'DRIVER_BASED' | 'CUSTOM';
    drivers: Array<{
      driverType: string;
      driverValue: string;
      weight: number;
      source: string;
    }>;
    constraints: Array<{
      type: 'MIN_AMOUNT' | 'MAX_AMOUNT' | 'VARIANCE_THRESHOLD' | 'GROWTH_RATE';
      value: string;
      enforced: boolean;
    }>;
    rollupRules: {
      method: 'SUM' | 'AVERAGE' | 'WEIGHTED_AVERAGE';
      excludeAccounts?: string[];
    };
  };

  @Column({
    type: 'jsonb',
    comment: 'Performance metrics and KPIs'
  })
  performanceMetrics: {
    utilizationRate: string;
    burnRate: string;
    forecastAccuracy: string;
    varianceStability: string;
    alertThresholds: {
      overBudgetPercent: number;
      underUtilizedPercent: number;
      rapidBurnRate: number;
    };
    benchmarks: {
      industryAverage?: string;
      bestInClass?: string;
      historicalPerformance?: string;
    };
  };

  @Column({
    type: 'timestamptz',
    nullable: true,
    comment: 'When budget was approved'
  })
  approvedAt: Date;

  @Column({ 
    type: 'varchar', 
    length: 36,
    nullable: true,
    comment: 'User who approved the budget'
  })
  approvedBy: string;

  @Column({
    type: 'timestamptz',
    nullable: true,
    comment: 'When budget was locked'
  })
  lockedAt: Date;

  @Column({ 
    type: 'varchar', 
    length: 36,
    nullable: true,
    comment: 'User who locked the budget'
  })
  lockedBy: string;

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
    comment: 'User who created the budget'
  })
  createdBy: string;

  @CreateDateColumn({
    type: 'timestamptz',
    comment: 'Budget creation timestamp'
  })
  createdAt: Date;

  @Column({ 
    type: 'varchar', 
    length: 36,
    nullable: true,
    comment: 'User who last modified the budget'
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

  // Relationships
  @ManyToOne(() => ChartOfAccounts)
  @JoinColumn({ name: 'accountId' })
  account: ChartOfAccounts;

  constructor() {
    this.dimensions = {};
    this.periodicBreakdown = [];
    this.approvalWorkflow = {
      currentStep: 1,
      totalSteps: 1,
      approvers: [],
      escalations: []
    };
    this.revisions = [];
    this.allocationRules = {
      methodology: 'HISTORICAL',
      drivers: [],
      constraints: [],
      rollupRules: {
        method: 'SUM'
      }
    };
    this.performanceMetrics = {
      utilizationRate: '0',
      burnRate: '0',
      forecastAccuracy: '0',
      varianceStability: '0',
      alertThresholds: {
        overBudgetPercent: 10,
        underUtilizedPercent: 90,
        rapidBurnRate: 20
      },
      benchmarks: {}
    };
    this.auditTrail = [];
    this.metadata = {};
    this.currencyCode = 'USD';
    this.exchangeRate = '1.0';
    this.status = 'DRAFT';
    this.budgetVersion = 1;
    this.isActive = true;
    this.actualAmount = '0';
    this.commitmentAmount = '0';
    this.variance = '0';
    this.variancePercent = '0';
  }
}
