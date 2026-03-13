/**
 * Posting Rule Entity
 * 
 * Automated posting rules for journal entry generation
 * with AI-powered validation and compliance enforcement.
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
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { JournalEntry } from './journal-entry.entity';
import * as crypto from 'crypto';

export enum RuleType {
  MANUAL = 'MANUAL',
  AUTOMATED = 'AUTOMATED',
  RECURRING = 'RECURRING',
  ALLOCATION = 'ALLOCATION',
  REVERSAL = 'REVERSAL',
  ACCRUAL = 'ACCRUAL',
  DEPRECIATION = 'DEPRECIATION',
  TAX_PROVISION = 'TAX_PROVISION',
  INTERCOMPANY = 'INTERCOMPANY',
}

export enum RuleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

export enum TriggerEvent {
  INVOICE_POSTED = 'INVOICE_POSTED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  EXPENSE_SUBMITTED = 'EXPENSE_SUBMITTED',
  PAYROLL_RUN = 'PAYROLL_RUN',
  BANK_TRANSACTION = 'BANK_TRANSACTION',
  MONTH_END = 'MONTH_END',
  QUARTER_END = 'QUARTER_END',
  YEAR_END = 'YEAR_END',
  MANUAL_TRIGGER = 'MANUAL_TRIGGER',
  SCHEDULE_BASED = 'SCHEDULE_BASED',
  THRESHOLD_REACHED = 'THRESHOLD_REACHED',
}

export enum ApprovalRequirement {
  NONE = 'NONE',
  SINGLE = 'SINGLE',
  DUAL = 'DUAL',
  COMMITTEE = 'COMMITTEE',
  BOARD = 'BOARD',
}

@Entity('posting_rules')
@Index(['ruleCode', 'status'])
@Index(['ruleType', 'triggerEvent'])
@Index(['businessUnit', 'costCenter'])
@Index(['effectiveDate', 'expirationDate'])
@Index(['priority', 'isActive'])
export class PostingRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  @Index()
  ruleCode: string;

  @Column({ length: 200 })
  ruleName: string;

  @Column({ length: 1000 })
  description: string;

  @Column({
    type: 'enum',
    enum: RuleType,
    default: RuleType.MANUAL,
  })
  ruleType: RuleType;

  @Column({
    type: 'enum',
    enum: RuleStatus,
    default: RuleStatus.ACTIVE,
  })
  status: RuleStatus;

  @Column({
    type: 'enum',
    enum: TriggerEvent,
  })
  triggerEvent: TriggerEvent;

  @Column({ type: 'int', default: 100 })
  priority: number; // Lower number = higher priority

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

  // Condition and criteria
  @Column({ type: 'jsonb' })
  conditions: {
    sourceModule?: string;
    transactionType?: string;
    amountRange?: {
      min?: number;
      max?: number;
      currency?: string;
    };
    accountCriteria?: {
      includeAccounts?: string[];
      excludeAccounts?: string[];
      accountTypes?: string[];
    };
    businessRules?: {
      businessUnit?: string[];
      costCenter?: string[];
      location?: string[];
      department?: string[];
    };
    dateCriteria?: {
      frequency?: string; // CRON expression
      monthDay?: number;
      weekDay?: number;
      quarterEnd?: boolean;
      yearEnd?: boolean;
    };
    customConditions?: {
      field: string;
      operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS' | 'REGEX';
      value: any;
    }[];
  };

  // Account mapping template
  @Column({ type: 'jsonb' })
  accountMappings: {
    templateName: string;
    mappings: {
      lineNumber: number;
      accountCode: string;
      accountExpression?: string; // For dynamic account selection
      debitExpression?: string; // Expression to calculate debit amount
      creditExpression?: string; // Expression to calculate credit amount
      description: string;
      descriptionTemplate?: string; // Template with variables
      dimensions?: {
        businessUnit?: string;
        costCenter?: string;
        project?: string;
        department?: string;
        location?: string;
      };
      conditions?: {
        field: string;
        operator: string;
        value: any;
      }[];
    }[];
    balanceValidation: boolean;
    allowUnbalanced: boolean;
    roundingAccount?: string;
  };

  // Approval and workflow
  @Column({
    type: 'enum',
    enum: ApprovalRequirement,
    default: ApprovalRequirement.NONE,
  })
  approvalRequirement: ApprovalRequirement;

  @Column({ type: 'jsonb', nullable: true })
  approvalWorkflow: {
    approvers: {
      level: number;
      userId: string;
      role: string;
      amountThreshold?: number;
    }[];
    escalationRules: {
      timeoutHours: number;
      escalateTo: string;
      notificationMethod: string;
    }[];
    requiredSignatures: number;
  };

  // AI and automation features
  @Column({ type: 'jsonb', nullable: true })
  aiConfiguration: {
    enableAIValidation: boolean;
    confidenceThreshold: number;
    enablePredictiveMapping: boolean;
    learningEnabled: boolean;
    anomalyDetection: {
      enabled: boolean;
      threshold: number;
      alertOnAnomaly: boolean;
    };
    patternRecognition: {
      enabled: boolean;
      historicalPeriods: number;
      adaptToChanges: boolean;
    };
    complianceChecks: {
      sox: boolean;
      gaap: boolean;
      ifrs: boolean;
      regulatory: string[];
    };
  };

  // Execution and performance tracking
  @Column({ type: 'int', default: 0 })
  executionCount: number;

  @Column({ type: 'int', default: 0 })
  successCount: number;

  @Column({ type: 'int', default: 0 })
  failureCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastExecuted: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSuccess: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastFailure: Date;

  @Column({ type: 'text', nullable: true })
  lastErrorMessage: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmountProcessed: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  averageExecutionTime: number; // in seconds

  // Risk and compliance
  @Column({ type: 'int', default: 0 })
  riskScore: number;

  @Column({ type: 'jsonb', nullable: true })
  complianceFlags: string[];

  @Column({ type: 'boolean', default: false })
  requiresReview: boolean;

  @Column({ type: 'boolean', default: false })
  isCritical: boolean;

  @Column({ type: 'jsonb', nullable: true })
  riskFactors: {
    highValueTransactions: boolean;
    sensitiveAccounts: boolean;
    multiCurrency: boolean;
    intercompanyTransactions: boolean;
    manualOverrides: number;
  };

  // Testing and validation
  @Column({ type: 'jsonb', nullable: true })
  testScenarios: {
    scenarioName: string;
    inputData: Record<string, any>;
    expectedOutput: {
      journalLines: {
        accountCode: string;
        debitAmount?: number;
        creditAmount?: number;
        description: string;
      }[];
      totalDebit: number;
      totalCredit: number;
    };
    lastTested?: string;
    testResult?: 'PASS' | 'FAIL';
    notes?: string;
  }[];

  @Column({ type: 'timestamp', nullable: true })
  lastTested: Date;

  @Column({ type: 'boolean', default: false })
  isValidated: boolean;

  // Dimensional restrictions
  @Column({ length: 50, nullable: true })
  businessUnit: string;

  @Column({ length: 50, nullable: true })
  costCenter: string;

  @Column({ length: 50, nullable: true })
  location: string;

  @Column({ length: 50, nullable: true })
  department: string;

  @Column({ type: 'jsonb', nullable: true })
  restrictions: {
    allowedCurrencies?: string[];
    allowedBusinessUnits?: string[];
    allowedLocations?: string[];
    excludedAccounts?: string[];
    maximumAmount?: number;
    minimumAmount?: number;
    timeRestrictions?: {
      allowedHours?: number[];
      allowedDays?: number[];
      blockedDates?: string[];
    };
  };

  // Custom fields and metadata
  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    tags?: string[];
    category?: string;
    owner?: string;
    reviewers?: string[];
    documentation?: string;
    changeLog?: {
      version: string;
      date: string;
      changes: string;
      author: string;
    }[];
  };

  // Relationships
  @OneToMany(() => JournalEntry, (entry) => entry.appliedRule)
  generatedEntries: JournalEntry[];

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
    approvals: {
      approver: string;
      action: 'APPROVED' | 'REJECTED';
      date: string;
      comments?: string;
    }[];
    testResults: {
      date: string;
      tester: string;
      result: 'PASS' | 'FAIL';
      details: string;
    }[];
  };

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'varchar', length: 64 })
  dataIntegrityHash: string;

  // Hooks for automatic calculations
  @BeforeInsert()
  @BeforeUpdate()
  generateDataIntegrityHash() {
    const data = {
      ruleCode: this.ruleCode,
      ruleName: this.ruleName,
      ruleType: this.ruleType,
      triggerEvent: this.triggerEvent,
      conditions: this.conditions,
      accountMappings: this.accountMappings,
      version: this.version,
    };
    
    this.dataIntegrityHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  @BeforeInsert()
  generateRuleCode() {
    if (!this.ruleCode) {
      const typePrefix = this.ruleType.substring(0, 3).toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      this.ruleCode = `${typePrefix}_${timestamp}`;
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  calculateRiskScore() {
    let score = 0;
    
    // High value transactions
    if (this.riskFactors?.highValueTransactions) score += 30;
    
    // Sensitive accounts
    if (this.riskFactors?.sensitiveAccounts) score += 25;
    
    // Multi-currency complexity
    if (this.riskFactors?.multiCurrency) score += 15;
    
    // Intercompany transactions
    if (this.riskFactors?.intercompanyTransactions) score += 20;
    
    // Manual overrides frequency
    const overrides = this.riskFactors?.manualOverrides || 0;
    if (overrides > 10) score += 20;
    else if (overrides > 5) score += 10;
    
    // Execution failure rate
    const failureRate = this.executionCount > 0 ? (this.failureCount / this.executionCount) * 100 : 0;
    if (failureRate > 10) score += 30;
    else if (failureRate > 5) score += 15;
    
    // Approval requirements
    if (this.approvalRequirement === ApprovalRequirement.BOARD) score += 40;
    else if (this.approvalRequirement === ApprovalRequirement.COMMITTEE) score += 30;
    else if (this.approvalRequirement === ApprovalRequirement.DUAL) score += 20;
    
    // Testing validation
    if (!this.isValidated) score += 25;
    
    this.riskScore = Math.min(score, 100); // Cap at 100
    this.isCritical = this.riskScore >= 70;
    this.requiresReview = this.riskScore >= 50 || !this.isValidated;
  }

  // Computed properties
  get isExpired(): boolean {
    return this.expirationDate ? new Date() > this.expirationDate : false;
  }

  get isEffective(): boolean {
    const now = new Date();
    return now >= this.effectiveDate && (!this.expirationDate || now <= this.expirationDate);
  }

  get canExecute(): boolean {
    return this.isActive && 
           this.status === RuleStatus.ACTIVE && 
           this.isEffective && 
           !this.isExpired;
  }

  get successRate(): number {
    return this.executionCount > 0 ? (this.successCount / this.executionCount) * 100 : 0;
  }

  get failureRate(): number {
    return this.executionCount > 0 ? (this.failureCount / this.executionCount) * 100 : 0;
  }

  get requiresApproval(): boolean {
    return this.approvalRequirement !== ApprovalRequirement.NONE;
  }

  get hasHighRisk(): boolean {
    return this.riskScore >= 70;
  }

  get needsValidation(): boolean {
    return !this.isValidated || this.lastTested === null || 
           (this.lastTested && new Date().getTime() - this.lastTested.getTime() > 30 * 24 * 60 * 60 * 1000); // 30 days
  }

  get performanceGrade(): 'A' | 'B' | 'C' | 'D' | 'F' {
    const rate = this.successRate;
    if (rate >= 95) return 'A';
    if (rate >= 90) return 'B';
    if (rate >= 80) return 'C';
    if (rate >= 70) return 'D';
    return 'F';
  }
}
