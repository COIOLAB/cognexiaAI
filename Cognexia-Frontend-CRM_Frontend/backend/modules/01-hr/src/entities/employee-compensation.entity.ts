// Industry 5.0 ERP Backend - Employee Compensation Entity
// TypeORM entity for individual employee compensation assignments
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
import { CompensationPlanEntity } from './compensation-plan.entity';

@Entity('employee_compensations')
@Index(['organizationId', 'employeeId', 'isActive'])
@Index(['compensationPlanId'])
@Index(['effectiveDate', 'endDate'])
export class EmployeeCompensationEntity {
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
  compensationPlanId: string;

  // Current Compensation Details
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  currentSalary: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  payFrequency: string; // hourly, weekly, bi_weekly, monthly, annual

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  hourlyRate: number; // for hourly employees

  // Bonus Information
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bonusTargetPercentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  bonusTargetAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  lastBonusPaid: number;

  @Column({ type: 'date', nullable: true })
  lastBonusDate: Date;

  // Overtime Configuration
  @Column({ type: 'boolean', default: false })
  isOvertimeEligible: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.5 })
  overtimeMultiplier: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxOvertimeHoursPerWeek: number;

  // Commission (for sales roles)
  @Column({ type: 'boolean', default: false })
  hasCommission: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  commissionRate: number; // percentage as decimal

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  commissionBase: number; // base amount for commission calculation

  @Column({ type: 'jsonb', nullable: true })
  commissionTiers: Array<{
    threshold: number;
    rate: number;
  }>;

  // Benefits Enrollment
  @Column({ type: 'jsonb', nullable: true })
  benefitsEnrollment: {
    healthInsurance?: {
      enrolled: boolean;
      plan: string;
      coverage: string; // individual, family, spouse
      monthlyPremium: number;
      employeeContribution: number;
    };
    dentalInsurance?: {
      enrolled: boolean;
      plan: string;
      monthlyPremium: number;
    };
    visionInsurance?: {
      enrolled: boolean;
      plan: string;
      monthlyPremium: number;
    };
    retirement401k?: {
      enrolled: boolean;
      employeeContributionPercentage: number;
      employerMatchPercentage: number;
      vestingSchedule: string;
    };
    lifeInsurance?: {
      enrolled: boolean;
      coverageAmount: number;
      monthlyPremium: number;
    };
    disabilityInsurance?: {
      enrolled: boolean;
      coverageType: 'short_term' | 'long_term' | 'both';
      monthlyPremium: number;
    };
  };

  // Time Off Balances
  @Column({ type: 'jsonb', nullable: true })
  timeOffBalances: {
    paidTimeOff?: {
      accrualRate: number; // hours per pay period
      currentBalance: number;
      maxBalance: number;
      carryoverLimit: number;
    };
    sickLeave?: {
      accrualRate: number;
      currentBalance: number;
      maxBalance: number;
    };
    personalDays?: {
      annualAllowance: number;
      currentBalance: number;
    };
    vacationDays?: {
      annualAllowance: number;
      currentBalance: number;
      carryoverLimit: number;
    };
  };

  // Allowances and Reimbursements
  @Column({ type: 'jsonb', nullable: true })
  allowances: Array<{
    type: string; // phone, internet, parking, meal, etc.
    amount: number;
    frequency: string; // monthly, annual, per_occurrence
    taxable: boolean;
    effectiveDate: string;
    endDate?: string;
  }>;

  // Equity/Stock Information
  @Column({ type: 'jsonb', nullable: true })
  equity: {
    hasEquity: boolean;
    equityType?: 'stock_options' | 'rsu' | 'espp';
    totalShares?: number;
    vestedShares?: number;
    unvestedShares?: number;
    strikePrice?: number;
    grantDate?: string;
    vestingSchedule?: string;
    expirationDate?: string;
  };

  // Performance-Based Compensation
  @Column({ type: 'jsonb', nullable: true })
  performanceIncentives: Array<{
    type: string;
    description: string;
    targetValue: number;
    currentProgress: number;
    incentiveAmount: number;
    payoutDate?: string;
    status: string; // active, achieved, expired, cancelled
  }>;

  // Status and Dates
  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'date' })
  @Index()
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  @Index()
  endDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  changeReason: string; // promotion, merit_increase, market_adjustment, etc.

  // Approval Information
  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @Column({ type: 'date', nullable: true })
  approvedDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Comparison with Previous Compensation
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  previousSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salaryIncrease: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  salaryIncreasePercentage: number;

  // Tax and Legal
  @Column({ type: 'varchar', length: 50, nullable: true })
  taxClassification: string; // employee, contractor, intern

  @Column({ type: 'varchar', length: 50, nullable: true })
  payrollClass: string; // regular, executive, sales, etc.

  @Column({ type: 'boolean', default: true })
  isSubjectToWithholding: boolean;

  @Column({ type: 'jsonb', nullable: true })
  taxElections: {
    federalWithholding?: number; // additional amount
    stateWithholding?: number;
    localWithholding?: number;
    exemptions?: number;
    filingStatus?: string;
  };

  // Cost Centers and Allocation
  @Column({ type: 'varchar', length: 50, nullable: true })
  costCenter: string;

  @Column({ type: 'jsonb', nullable: true })
  costAllocation: Array<{
    costCenter: string;
    percentage: number;
    department: string;
    project?: string;
  }>;

  // Flexible JSON fields
  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

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
  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @ManyToOne(() => EmployeeEntity, employee => employee.compensations)
  @JoinColumn({ name: 'employeeId' })
  employee: EmployeeEntity;

  @ManyToOne(() => CompensationPlanEntity, plan => plan.employeeCompensations)
  @JoinColumn({ name: 'compensationPlanId' })
  compensationPlan: CompensationPlanEntity;

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'approvedById' })
  approvedBy: EmployeeEntity;
}
