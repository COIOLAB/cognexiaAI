// Industry 5.0 ERP Backend - Payroll Record Entity
// TypeORM entity for individual employee payroll records
// Author: AI Assistant
// Date: 2024

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { OrganizationEntity } from './organization.entity';
import { EmployeeEntity } from './employee.entity';
import { PayrollRunEntity } from './payroll-run.entity';

@Entity('payroll_records')
@Index(['organizationId', 'employeeId', 'payrollRunId'])
@Index(['organizationId', 'payPeriodStart', 'payPeriodEnd'])
@Index(['employeeId', 'payDate'])
export class PayrollRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ type: 'uuid' })
  @Index()
  employeeId: string;

  @Column({ type: 'uuid' })
  @Index()
  payrollRunId: string;

  // Pay Period Information
  @Column({ type: 'date' })
  @Index()
  payPeriodStart: Date;

  @Column({ type: 'date' })
  @Index()
  payPeriodEnd: Date;

  @Column({ type: 'date' })
  @Index()
  payDate: Date;

  @Column({ type: 'varchar', length: 50 })
  payFrequency: string; // weekly, bi_weekly, monthly, semi_monthly

  // Employee Information (snapshot at time of payroll)
  @Column({ type: 'varchar', length: 50 })
  employeeNumber: string;

  @Column({ type: 'varchar', length: 200 })
  employeeName: string;

  @Column({ type: 'varchar', length: 255 })
  jobTitle: string;

  @Column({ type: 'varchar', length: 255 })
  department: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  payGrade: string;

  @Column({ type: 'varchar', length: 50 })
  employmentType: string;

  @Column({ type: 'varchar', length: 50 })
  employmentStatus: string;

  // Hours and Time
  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  regularHours: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  overtimeHours: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  doubleTimeHours: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  holidayHours: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  sickHours: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  vacationHours: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  personalHours: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  totalHours: number;

  // Pay Rates
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  baseSalary: number; // annual base salary at time of payroll

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  hourlyRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  overtimeRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  doubleTimeRate: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  // Earnings Breakdown
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  regularPay: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  overtimePay: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  doubleTimePay: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  holidayPay: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  bonusAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  commissionAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  allowancesAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  reimbursementsAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  grossPay: number;

  // Detailed Earnings
  @Column({ type: 'jsonb', nullable: true })
  earningsDetails: Array<{
    type: string; // salary, hourly, bonus, commission, allowance, etc.
    description: string;
    hours?: number;
    rate?: number;
    amount: number;
    isTaxable: boolean;
    category: string; // regular, overtime, bonus, etc.
  }>;

  // Tax Deductions
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  federalIncomeTax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  stateIncomeTax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  localIncomeTax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  socialSecurityTax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  medicareeTax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  unemploymentTax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  disabilityTax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalTaxes: number;

  // Benefit Deductions
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  healthInsurancePremium: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  dentalInsurancePremium: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  visionInsurancePremium: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  lifeInsurancePremium: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  disabilityInsurancePremium: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  retirement401kEmployee: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  retirement401kEmployer: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalBenefitDeductions: number;

  // Other Deductions
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  unionDues: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  garnishments: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  loanRepayments: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  otherDeductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDeductions: number;

  // Detailed Deductions
  @Column({ type: 'jsonb', nullable: true })
  deductionsDetails: Array<{
    type: string; // tax, benefit, voluntary, involuntary
    description: string;
    amount: number;
    isPreTax: boolean;
    isEmployeeContribution: boolean;
    category: string;
  }>;

  // Final Amounts
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  netPay: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  takeHomePay: number; // net pay minus any post-tax deductions

  // Year-to-Date Totals
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  ytdGrossPay: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  ytdNetPay: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  ytdTaxes: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  ytdDeductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  ytdFederalTax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  ytdStateTax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  ytdSocialSecurityTax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  ytdMedicareTax: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  ytdHours: number;

  // Payment Information
  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod: string; // direct_deposit, check, cash

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentReference: string; // check number, transaction ID, etc.

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentStatus: string; // pending, paid, returned, cancelled

  @Column({ type: 'timestamp with time zone', nullable: true })
  paymentDate: Date;

  // Tax Withholding Information
  @Column({ type: 'jsonb', nullable: true })
  taxWithholdingInfo: {
    federalWithholding: {
      filingStatus: string;
      allowances: number;
      additionalAmount: number;
      exemptions: number;
    };
    stateWithholding: {
      filingStatus: string;
      allowances: number;
      additionalAmount: number;
    };
    localWithholding?: {
      rate: number;
      additionalAmount: number;
    };
  };

  // Compliance and Reporting
  @Column({ type: 'boolean', default: false })
  isAdjustment: boolean;

  @Column({ type: 'boolean', default: false })
  isFinalPay: boolean;

  @Column({ type: 'boolean', default: false })
  isVoided: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  adjustmentReason: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  voidedDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  voidReason: string;

  // Processing Information
  @Column({ type: 'varchar', length: 50, default: 'processed' })
  status: string; // processing, processed, approved, paid, voided

  @Column({ type: 'jsonb', nullable: true })
  processingErrors: Array<{
    errorCode: string;
    errorMessage: string;
    timestamp: string;
  }>;

  // Notes and Comments
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  payrollNotes: string;

  // Flexible JSON fields
  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

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
  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @ManyToOne(() => EmployeeEntity, employee => employee.payrollRecords)
  @JoinColumn({ name: 'employeeId' })
  employee: EmployeeEntity;

  @ManyToOne(() => PayrollRunEntity, payrollRun => payrollRun.payrollRecords)
  @JoinColumn({ name: 'payrollRunId' })
  payrollRun: PayrollRunEntity;
}
