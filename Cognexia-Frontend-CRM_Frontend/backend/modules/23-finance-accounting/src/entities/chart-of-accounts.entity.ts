/**
 * Chart of Accounts Entity - Multi-dimensional Account Structure
 * 
 * TypeORM entity defining the chart of accounts structure with support for
 * hierarchical accounts, multi-dimensional accounting, AI configurations,
 * and comprehensive audit trails for government-grade compliance.
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
  Tree,
  TreeChildren,
  TreeParent,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Check
} from 'typeorm';
import { Decimal } from 'decimal.js';

@Entity('chart_accounts')
@Tree('closure-table')
@Index('idx_account_code', ['accountCode'])
@Index('idx_account_type', ['accountType'])
@Index('idx_account_active', ['isActive'])
@Index('idx_account_parent', ['parent'])
@Index('idx_account_hierarchy', ['hierarchyLevel'])
@Check(`"accountType" IN ('ASSETS', 'LIABILITIES', 'EQUITY', 'REVENUE', 'EXPENSES', 'CONTRA')`)
@Check(`"normalBalance" IN ('DEBIT', 'CREDIT')`)
export class ChartOfAccounts {
  @PrimaryGeneratedColumn('uuid')
  accountId: string;

  @Column({ 
    type: 'varchar', 
    length: 50, 
    unique: true,
    comment: 'Unique account code identifier'
  })
  @Index()
  accountCode: string;

  @Column({ 
    type: 'varchar', 
    length: 255,
    comment: 'Human-readable account name'
  })
  accountName: string;

  @Column({
    type: 'enum',
    enum: ['ASSETS', 'LIABILITIES', 'EQUITY', 'REVENUE', 'EXPENSES', 'CONTRA'],
    comment: 'Primary account classification'
  })
  accountType: string;

  @Column({ 
    type: 'varchar', 
    length: 100,
    comment: 'Account category within type'
  })
  accountCategory: string;

  @Column({ 
    type: 'varchar', 
    length: 100,
    nullable: true,
    comment: 'Account subcategory for detailed classification'
  })
  accountSubcategory: string;

  @Column({
    type: 'enum',
    enum: ['DEBIT', 'CREDIT'],
    comment: 'Normal balance type for the account'
  })
  normalBalance: string;

  @Column({ 
    type: 'int',
    default: 1,
    comment: 'Hierarchy level in account tree'
  })
  hierarchyLevel: number;

  @Column({ 
    type: 'varchar', 
    length: 1000,
    comment: 'Full path from root to current account'
  })
  fullPath: string;

  @Column({ 
    type: 'boolean', 
    default: true,
    comment: 'Whether account is active for transactions'
  })
  isActive: boolean;

  @Column({ 
    type: 'boolean', 
    default: true,
    comment: 'Whether manual journal entries are allowed'
  })
  allowManualEntries: boolean;

  @Column({ 
    type: 'boolean', 
    default: false,
    comment: 'Whether cost center is required for transactions'
  })
  requiresCostCenter: boolean;

  @Column({ 
    type: 'boolean', 
    default: false,
    comment: 'Whether project dimension is required'
  })
  requiresProject: boolean;

  @Column({ 
    type: 'boolean', 
    default: false,
    comment: 'Whether department dimension is required'
  })
  requiresDepartment: boolean;

  @Column({ 
    type: 'boolean', 
    default: false,
    comment: 'Whether location dimension is required'
  })
  requiresLocation: boolean;

  @Column({ 
    type: 'boolean', 
    default: false,
    comment: 'Whether account is relevant for tax calculations'
  })
  taxRelevant: boolean;

  @Column({ 
    type: 'boolean', 
    default: false,
    comment: 'Whether account requires reconciliation'
  })
  reconciliationAccount: boolean;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Consolidation mapping rules for group reporting'
  })
  consolidationMapping: {
    consolidationAccount: string;
    eliminationRules: string[];
    intercompanyTreatment: string;
    mappingPercentage?: string;
    effectiveDate: string;
    expiryDate?: string;
  };

  @Column({
    type: 'jsonb',
    comment: 'Reporting line assignments for financial statements'
  })
  reportingLines: {
    balanceSheet?: {
      section: string;
      lineItem: string;
      sequence: number;
      aggregationMethod: string;
    };
    profitLoss?: {
      section: string;
      lineItem: string;
      sequence: number;
      aggregationMethod: string;
    };
    cashFlow?: {
      section: string;
      lineItem: string;
      sequence: number;
      aggregationMethod: string;
    };
    customReports?: Array<{
      reportName: string;
      section: string;
      lineItem: string;
      sequence: number;
      aggregationMethod: string;
    }>;
  };

  @Column({
    type: 'jsonb',
    comment: 'Multi-dimensional accounting dimensions'
  })
  dimensions: {
    costCenter?: string[];
    profitCenter?: string[];
    businessUnit?: string[];
    product?: string[];
    geography?: string[];
    customer?: string[];
    supplier?: string[];
    project?: string[];
    campaign?: string[];
    customDimensions?: Record<string, string[]>;
  };

  @Column({
    type: 'jsonb',
    comment: 'Account validation and business rules'
  })
  validationRules: {
    minimumBalance?: string;
    maximumBalance?: string;
    allowedCurrencies?: string[];
    mandatoryDimensions?: string[];
    approvalWorkflow?: string;
    automationRules?: string[];
    businessRules?: Array<{
      ruleId: string;
      ruleName: string;
      ruleType: string;
      condition: string;
      action: string;
      priority: number;
      isActive: boolean;
    }>;
  };

  @Column({
    type: 'jsonb',
    comment: 'AI-powered features configuration'
  })
  aiConfiguration: {
    autoSuggestPostings: boolean;
    anomalyDetection: boolean;
    patternRecognition: boolean;
    riskAssessment: boolean;
    learningEnabled: boolean;
    confidenceThreshold: string;
    modelVersion: string;
  };

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    default: 0,
    comment: 'Current account balance'
  })
  currentBalance: string;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 4,
    nullable: true,
    comment: 'Budget amount for the account'
  })
  budgetAmount: string;

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
    comment: 'User who created the account'
  })
  createdBy: string;

  @CreateDateColumn({
    type: 'timestamptz',
    comment: 'Account creation timestamp'
  })
  createdAt: Date;

  @Column({ 
    type: 'varchar', 
    length: 36,
    nullable: true,
    comment: 'User who last modified the account'
  })
  lastModifiedBy: string;

  @UpdateDateColumn({
    type: 'timestamptz',
    nullable: true,
    comment: 'Last modification timestamp'
  })
  lastModifiedAt: Date;

  @Column({ 
    type: 'int',
    default: 1,
    comment: 'Version number for optimistic locking'
  })
  versionNumber: number;

  @Column({
    type: 'jsonb',
    comment: 'Additional metadata and custom fields'
  })
  metadata: Record<string, any>;

  // Tree relationships
  @TreeChildren()
  children: ChartOfAccounts[];

  @TreeParent()
  parent: ChartOfAccounts;

  @Column({ 
    type: 'uuid',
    nullable: true,
    comment: 'Parent account ID for hierarchy'
  })
  parentAccountId: string;

  // Performance indexes for common queries
  @Index('idx_account_search', { synchronize: false })
  searchVector: string; // For full-text search on account names and codes

  constructor() {
    this.dimensions = {};
    this.validationRules = {};
    this.aiConfiguration = {
      autoSuggestPostings: false,
      anomalyDetection: true,
      patternRecognition: true,
      riskAssessment: false,
      learningEnabled: true,
      confidenceThreshold: '0.8',
      modelVersion: '1.0.0'
    };
    this.auditTrail = [];
    this.metadata = {};
    this.reportingLines = {};
    this.currentBalance = '0';
    this.versionNumber = 1;
  }
}
