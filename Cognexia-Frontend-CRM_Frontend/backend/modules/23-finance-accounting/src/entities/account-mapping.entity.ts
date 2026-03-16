/**
 * Account Mapping Entity - Intelligent Data Integration Mappings
 * 
 * TypeORM entity for storing account mappings between different systems,
 * chart of accounts, and consolidation requirements with AI-powered
 * optimization and comprehensive audit trails.
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

@Entity('account_mappings')
@Index('idx_mapping_source', ['sourceAccountId'])
@Index('idx_mapping_target', ['targetAccountId'])
@Index('idx_mapping_type', ['mappingType'])
@Index('idx_mapping_status', ['status'])
@Index('idx_mapping_active', ['status', 'effectiveDate', 'expiryDate'])
@Check(`"mappingType" IN ('ELIMINATION', 'RECLASSIFICATION', 'TRANSLATION', 'CONSOLIDATION', 'CUSTOM')`)
@Check(`"status" IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED')`)
export class AccountMapping {
  @PrimaryGeneratedColumn('uuid')
  mappingId: string;

  @Column({ 
    type: 'uuid',
    comment: 'Source account identifier'
  })
  sourceAccountId: string;

  @Column({ 
    type: 'uuid',
    comment: 'Target account identifier'
  })
  targetAccountId: string;

  @Column({
    type: 'enum',
    enum: ['ELIMINATION', 'RECLASSIFICATION', 'TRANSLATION', 'CONSOLIDATION', 'CUSTOM'],
    comment: 'Type of mapping transformation'
  })
  mappingType: string;

  @Column({
    type: 'jsonb',
    comment: 'Mapping rules and conditions'
  })
  mappingRules: Array<{
    ruleId: string;
    priority: number;
    percentage?: string;
    conditions: Array<{
      conditionId: string;
      sourceField: string;
      operator: string;
      value: any;
    }>;
    effectiveDate: string;
    expiryDate?: string;
    isActive: boolean;
    description: string;
  }>;

  @Column({
    type: 'jsonb',
    comment: 'Multi-dimensional mapping configurations'
  })
  dimensions: Array<{
    dimensionMapId: string;
    sourceDimension: string;
    targetDimension: string;
    mappingType: string;
    valueMappings: Array<{
      sourceValue: string;
      targetValue: string;
    }>;
    defaultValue?: string;
  }>;

  @Column({
    type: 'jsonb',
    comment: 'AI optimization settings and suggestions'
  })
  aiOptimization: {
    autoApply: boolean;
    confidenceThreshold: string;
    learningEnabled: boolean;
    modelVersion: string;
    lastOptimizationRun?: string;
    optimizationSuggestions?: Array<{
      suggestionId: string;
      sourceAccountId: string;
      suggestedTargetAccountId: string;
      confidenceScore: string;
      reasoning: string[];
      status: string;
    }>;
  };

  @Column({
    type: 'enum',
    enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'],
    default: 'DRAFT',
    comment: 'Current status of the mapping'
  })
  status: string;

  @Column({
    type: 'timestamptz',
    comment: 'When mapping becomes effective'
  })
  effectiveDate: Date;

  @Column({
    type: 'timestamptz',
    nullable: true,
    comment: 'When mapping expires (null = no expiry)'
  })
  expiryDate: Date;

  @Column({
    type: 'int',
    default: 1,
    comment: 'Version number for change tracking'
  })
  version: number;

  @Column({
    type: 'jsonb',
    comment: 'Validation results and reconciliation data'
  })
  validationResults: {
    lastValidation?: {
      validationId: string;
      validatedAt: string;
      isValid: boolean;
      errors: Array<{
        field: string;
        message: string;
      }>;
      warnings: string[];
      reconciliationSummary: {
        sourceTotal: string;
        targetTotal: string;
        variance: string;
        status: string;
      };
    };
    metrics?: {
      transactionsProcessed: number;
      totalAmountMapped: string;
      errorRate: string;
      averageProcessingTime: number;
      manualInterventionRate: string;
      automationSuccessRate: string;
    };
  };

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
    comment: 'User who created the mapping'
  })
  createdBy: string;

  @CreateDateColumn({
    type: 'timestamptz',
    comment: 'Mapping creation timestamp'
  })
  createdAt: Date;

  @Column({ 
    type: 'varchar', 
    length: 36,
    nullable: true,
    comment: 'User who last modified the mapping'
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
  @ManyToOne(() => ChartOfAccounts, { nullable: true })
  @JoinColumn({ name: 'sourceAccountId' })
  sourceAccount: ChartOfAccounts;

  @ManyToOne(() => ChartOfAccounts, { nullable: true })
  @JoinColumn({ name: 'targetAccountId' })
  targetAccount: ChartOfAccounts;

  constructor() {
    this.mappingRules = [];
    this.dimensions = [];
    this.aiOptimization = {
      autoApply: false,
      confidenceThreshold: '0.9',
      learningEnabled: true,
      modelVersion: '1.0'
    };
    this.validationResults = {};
    this.auditTrail = [];
    this.metadata = {};
    this.version = 1;
    this.status = 'DRAFT';
  }
}
