// Industry 5.0 ERP Backend - Compensation Plan Entity
// TypeORM entity for compensation plans and salary structures
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
import { EmployeeCompensationEntity } from './employee-compensation.entity';

@Entity('compensation_plans')
@Index(['organizationId', 'name'], { unique: true })
@Index(['organizationId', 'isActive'])
@Index(['jobTitle', 'department'])
export class CompensationPlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Job Classification
  @Column({ type: 'varchar', length: 255 })
  @Index()
  jobTitle: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  department: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  level: string; // entry, junior, mid, senior, principal, executive

  @Column({ type: 'varchar', length: 100, nullable: true })
  jobFamily: string; // engineering, sales, marketing, etc.

  @Column({ type: 'varchar', length: 50, nullable: true })
  payGrade: string;

  // Base Salary Structure
  @Column({ type: 'jsonb' })
  baseSalary: {
    min: number;
    max: number;
    midpoint?: number;
    currency: string;
  };

  // Bonus Structure
  @Column({ type: 'jsonb', nullable: true })
  bonusStructure: {
    type: 'percentage' | 'fixed' | 'performance_based' | 'commission';
    percentage?: number;
    fixedAmount?: number;
    maxAmount?: number;
    minAmount?: number;
    targetAmount?: number;
    performanceMultipliers?: Array<{
      rating: string;
      multiplier: number;
    }>;
    commissionRate?: number;
    commissionTiers?: Array<{
      threshold: number;
      rate: number;
    }>;
  };

  // Benefits Package
  @Column({ type: 'jsonb', nullable: true })
  benefits: {
    healthInsurance?: boolean;
    dentalInsurance?: boolean;
    visionInsurance?: boolean;
    lifeInsurance?: boolean;
    disabilityInsurance?: boolean;
    retirement401k?: boolean;
    retirementMatching?: number; // percentage
    paidTimeOff?: number; // days per year
    sickLeave?: number; // days per year
    maternityLeave?: number; // weeks
    paternityLeave?: number; // weeks
    flexibleSpending?: boolean;
    healthSavingsAccount?: boolean;
    tuitionReimbursement?: boolean;
    gymMembership?: boolean;
    parkingAllowance?: boolean;
    mealAllowance?: number;
    transportationAllowance?: number;
    phoneAllowance?: number;
    internetAllowance?: number;
    homeOfficeAllowance?: number;
  };

  // Allowances and Perks
  @Column({ type: 'jsonb', nullable: true })
  allowances: Array<{
    type: string; // housing, transportation, meal, etc.
    amount: number;
    currency: string;
    frequency: string; // monthly, annual, one-time
    taxable: boolean;
  }>;

  // Stock Options/Equity
  @Column({ type: 'jsonb', nullable: true })
  equity: {
    hasEquity: boolean;
    equityType?: 'stock_options' | 'rsu' | 'espp';
    sharesOrOptions?: number;
    strikePrice?: number;
    vestingSchedule?: string;
    vestingPeriodMonths?: number;
    cliffMonths?: number;
  };

  // Performance Incentives
  @Column({ type: 'jsonb', nullable: true })
  performanceIncentives: Array<{
    type: string; // milestone, quota, kpi, etc.
    description: string;
    targetValue: number;
    incentiveAmount: number;
    frequency: string; // monthly, quarterly, annual
  }>;

  // Work Arrangements
  @Column({ type: 'jsonb', nullable: true })
  workArrangements: {
    remoteWorkAllowed: boolean;
    flexibleHours: boolean;
    compressedWorkWeek: boolean;
    jobSharing: boolean;
    sabbaticalEligible: boolean;
  };

  // Geographic Adjustments
  @Column({ type: 'jsonb', nullable: true })
  locationAdjustments: Array<{
    location: string;
    adjustmentType: 'percentage' | 'fixed';
    adjustmentValue: number;
    effectiveDate: string;
  }>;

  // Plan Status and Dates
  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isTemplate: boolean; // can be used as template for other plans

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'date', nullable: true })
  lastReviewDate: Date;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date;

  // Approval Workflow
  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: string; // draft, pending_approval, approved, archived

  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @Column({ type: 'date', nullable: true })
  approvedDate: Date;

  @Column({ type: 'text', nullable: true })
  approvalNotes: string;

  // Market Data and Benchmarking
  @Column({ type: 'jsonb', nullable: true })
  marketData: {
    benchmarkSource: string;
    benchmarkDate: string;
    percentile: number;
    marketMin: number;
    marketMax: number;
    marketMedian: number;
    currency: string;
  };

  // Cost Analysis
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalCompensationMin: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalCompensationMax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalCompensationMidpoint: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  annualCostPerEmployee: number; // estimated total cost including benefits

  // Usage Statistics
  @Column({ type: 'int', default: 0 })
  currentEmployeeCount: number;

  @Column({ type: 'int', nullable: true })
  maxEmployees: number;

  // Flexible JSON fields
  @Column({ type: 'jsonb', nullable: true })
  customBenefits: Record<string, any>; // organization-specific benefits

  @Column({ type: 'jsonb', nullable: true })
  complianceRules: Record<string, any>; // regulatory compliance settings

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
  @ManyToOne(() => OrganizationEntity, organization => organization.compensationPlans)
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @OneToMany(() => EmployeeCompensationEntity, employeeCompensation => employeeCompensation.compensationPlan)
  employeeCompensations: EmployeeCompensationEntity[];
}
