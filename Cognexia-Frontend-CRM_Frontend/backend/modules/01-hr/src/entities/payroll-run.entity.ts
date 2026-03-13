// Industry 5.0 ERP Backend - Payroll Run Entity
// TypeORM entity for payroll run batches
// Author: AI Assistant
// Date: 2024

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index
} from 'typeorm';
import { OrganizationEntity } from './organization.entity';
import { EmployeeEntity } from './employee.entity';
import { PayrollRecordEntity } from './payroll-record.entity';

@Entity('payroll_runs')
@Index(['organizationId', 'payPeriodStart', 'payPeriodEnd'])
@Index(['organizationId', 'status'])
@Index(['payDate'])
export class PayrollRunEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Payroll Period
  @Column({ type: 'date' })
  @Index()
  payPeriodStart: Date;

  @Column({ type: 'date' })
  @Index()
  payPeriodEnd: Date;

  @Column({ type: 'date' })
  @Index()
  payDate: Date;

  // Payroll Configuration
  @Column({ type: 'varchar', length: 50 })
  payrollFrequency: string; // weekly, bi_weekly, monthly, semi_monthly

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  @Index()
  status: string; // draft, processing, processed, approved, paid, cancelled

  // Processing Flags
  @Column({ type: 'boolean', default: true })
  includeSalary: boolean;

  @Column({ type: 'boolean', default: false })
  includeBonus: boolean;

  @Column({ type: 'boolean', default: false })
  includeCommission: boolean;

  @Column({ type: 'boolean', default: true })
  includeBenefits: boolean;

  @Column({ type: 'boolean', default: true })
  includeDeductions: boolean;

  @Column({ type: 'boolean', default: true })
  includeTaxes: boolean;

  @Column({ type: 'boolean', default: false })
  includeOvertime: boolean;

  @Column({ type: 'boolean', default: false })
  includeHolidayPay: boolean;

  // Employee Filters
  @Column({ type: 'jsonb', nullable: true })
  employeeFilters: {
    departments?: string[];
    locations?: string[];
    employmentTypes?: string[];
    payGrades?: string[];
    managerIds?: string[];
    includeInactive?: boolean;
    customFilters?: Record<string, any>;
  };

  // Financial Totals
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalGrossPay: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalNetPay: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDeductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalTaxes: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalBenefits: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalBonus: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalCommission: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalOvertime: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  // Employee Statistics
  @Column({ type: 'int', default: 0 })
  totalEmployees: number;

  @Column({ type: 'int', default: 0 })
  processedEmployees: number;

  @Column({ type: 'int', default: 0 })
  failedEmployees: number;

  @Column({ type: 'int', default: 0 })
  skippedEmployees: number;

  // Processing Information
  @Column({ type: 'timestamp with time zone', nullable: true })
  processingStartedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  processingCompletedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  processedDate: Date;

  @Column({ type: 'int', nullable: true })
  processingDurationSeconds: number;

  // Approval Workflow
  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  approvedDate: Date;

  @Column({ type: 'text', nullable: true })
  approvalNotes: string;

  // Payment Information
  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod: string; // direct_deposit, check, cash, wire

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentBatchId: string; // external payment system batch ID

  @Column({ type: 'timestamp with time zone', nullable: true })
  paymentDate: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentStatus: string; // pending, sent, processed, failed

  // Error Handling
  @Column({ type: 'jsonb', nullable: true })
  processingErrors: Array<{
    employeeId: string;
    employeeNumber: string;
    employeeName: string;
    errorCode: string;
    errorMessage: string;
    timestamp: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  processingWarnings: Array<{
    type: string;
    message: string;
    employeeId?: string;
    timestamp: string;
  }>;

  // Tax Period Information
  @Column({ type: 'int', nullable: true })
  taxYear: number;

  @Column({ type: 'int', nullable: true })
  taxQuarter: number;

  @Column({ type: 'int', nullable: true })
  taxMonth: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  taxPeriodType: string; // monthly, quarterly, annual

  // Compliance and Reporting
  @Column({ type: 'boolean', default: false })
  isYearEndRun: boolean;

  @Column({ type: 'boolean', default: false })
  isAdjustmentRun: boolean;

  @Column({ type: 'boolean', default: false })
  isFinalRun: boolean; // for terminated employees

  @Column({ type: 'boolean', default: false })
  isTestRun: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  adjustmentReason: string;

  // Integration and Export
  @Column({ type: 'jsonb', nullable: true })
  exportHistory: Array<{
    exportType: string; // ach, tax_file, payslip, etc.
    exportDate: string;
    fileName: string;
    recordCount: number;
    status: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  integrationData: Record<string, any>; // third-party system data

  // Custom Fields and Configuration
  @Column({ type: 'jsonb', nullable: true })
  customDeductions: Array<{
    name: string;
    type: string;
    amount: number;
    isPercentage: boolean;
    applyToEmployees: string[]; // employee IDs
  }>;

  @Column({ type: 'jsonb', nullable: true })
  customEarnings: Array<{
    name: string;
    type: string;
    amount: number;
    isPercentage: boolean;
    applyToEmployees: string[];
  }>;

  // Notes and Documentation
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  processingNotes: string;

  // Flexible JSON fields
  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  // Timestamps
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => OrganizationEntity, organization => organization.payrollRuns)
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'createdById' })
  createdBy: EmployeeEntity;

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'approvedById' })
  approvedBy: EmployeeEntity;

  @OneToMany(() => PayrollRecordEntity, payrollRecord => payrollRecord.payrollRun)
  payrollRecords: PayrollRecordEntity[];
}
