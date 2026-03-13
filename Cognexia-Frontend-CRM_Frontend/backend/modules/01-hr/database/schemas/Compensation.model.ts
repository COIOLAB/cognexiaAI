// Industry 5.0 ERP Backend - Compensation & Benefits Entities
// TypeORM entities for compensation plans, salary structures, and benefits management
// Author: AI Assistant
// Date: 2024

import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsNumber, Min, Max, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { Employee } from './Employee.model';
import { Organization } from '../core/Organization.model';
import { User } from '../core/User.model';

export enum CompensationType {
  SALARY = 'salary',
  HOURLY = 'hourly',
  COMMISSION = 'commission',
  CONTRACT = 'contract',
  EQUITY = 'equity',
  BONUS = 'bonus'
}

export enum ComponentType {
  BASE_SALARY = 'base_salary',
  BONUS = 'bonus',
  COMMISSION = 'commission',
  ALLOWANCE = 'allowance',
  OVERTIME = 'overtime',
  EQUITY = 'equity',
  BENEFITS = 'benefits',
  DEDUCTION = 'deduction'
}

export enum PaymentFrequency {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  ONE_TIME = 'one_time'
}

export enum BenefitType {
  HEALTH_INSURANCE = 'health_insurance',
  DENTAL_INSURANCE = 'dental_insurance',
  VISION_INSURANCE = 'vision_insurance',
  LIFE_INSURANCE = 'life_insurance',
  DISABILITY_INSURANCE = 'disability_insurance',
  RETIREMENT = 'retirement',
  PAID_TIME_OFF = 'paid_time_off',
  FLEXIBLE_SPENDING = 'flexible_spending',
  WELLNESS = 'wellness',
  TRANSPORTATION = 'transportation',
  EDUCATION = 'education',
  OTHER = 'other'
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  TERMINATED = 'terminated',
  SUSPENDED = 'suspended',
  DECLINED = 'declined'
}

@Entity('hr_compensation_plans')
@Index(['organizationId', 'isActive'])
@Index(['organizationId', 'type'])
@Index(['organizationId', 'effectiveDate', 'expiryDate'])
export class CompensationPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column({ type: 'varchar', length: 200 })
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: CompensationType
  })
  @IsEnum(CompensationType)
  @Index()
  type: CompensationType;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseSalary?: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'jsonb' })
  components: Array<{
    id: string;
    name: string;
    type: ComponentType;
    amount: number;
    percentage?: number;
    frequency: PaymentFrequency;
    isTaxable: boolean;
    isVariable: boolean;
    conditions?: string;
  }>;

  @Column({ type: 'date' })
  @IsDateString()
  @Index()
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  eligibilityCriteria?: {
    minTenure?: number; // months
    departments?: string[];
    positions?: string[];
    performanceRating?: number;
    salaryGrade?: string[];
    customRules?: Array<{
      field: string;
      operator: 'equals' | 'greater_than' | 'less_than' | 'in';
      value: any;
    }>;
  };

  @Column('uuid', { nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  approvalDate?: Date;

  @Column({ type: 'text', nullable: true })
  approvalComments?: string;

  // Analytics
  @Column({ type: 'int', default: 0 })
  totalEmployees: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  budgetAllocated: number;

  // Audit Fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('uuid', { nullable: true })
  createdBy?: string;

  @Column('uuid', { nullable: true })
  updatedBy?: string;

  // Relationships
  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedBy' })
  approver?: User;

  @OneToMany(() => EmployeeCompensation, compensation => compensation.plan)
  employeeCompensations: EmployeeCompensation[];

  // Business Logic Methods
  calculateTotalCompensation(includeVariable: boolean = true): number {
    let total = this.baseSalary || 0;
    
    this.components.forEach(component => {
      if (!includeVariable && component.isVariable) return;
      
      if (component.percentage && this.baseSalary) {
        total += (this.baseSalary * component.percentage) / 100;
      } else {
        total += component.amount;
      }
    });
    
    return total;
  }

  isEligible(employee: any): boolean {
    if (!this.eligibilityCriteria) return true;
    
    const criteria = this.eligibilityCriteria;
    
    // Check tenure
    if (criteria.minTenure && employee.tenureInMonths < criteria.minTenure) {
      return false;
    }
    
    // Check department
    if (criteria.departments && !criteria.departments.includes(employee.department)) {
      return false;
    }
    
    // Check position
    if (criteria.positions && !criteria.positions.includes(employee.jobTitle)) {
      return false;
    }
    
    // Check performance rating
    if (criteria.performanceRating && employee.currentPerformanceRating < criteria.performanceRating) {
      return false;
    }
    
    return true;
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }
}

@Entity('hr_salary_structures')
@Index(['organizationId', 'gradeLevel'], { unique: true })
@Index(['organizationId', 'gradeName'], { unique: true })
@Index(['organizationId', 'effectiveDate', 'expiryDate'])
export class SalaryStructure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column({ type: 'int' })
  @Index()
  gradeLevel: number;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  gradeName: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  minSalary: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  midSalary?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  maxSalary: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'date' })
  @IsDateString()
  @Index()
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stepIncrement?: number;

  @Column({ type: 'text', array: true, default: '{}' })
  benefits: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  jobTitles: string[];

  // Progression Rules
  @Column({ type: 'jsonb', nullable: true })
  progressionRules?: {
    minTenureForPromotion: number; // months
    requiredPerformanceRating: number;
    requiredTrainingHours?: number;
    customCriteria?: Array<{
      criterion: string;
      required: boolean;
    }>;
  };

  // Market Data
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  marketMin?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  marketMedian?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  marketMax?: number;

  @Column({ type: 'date', nullable: true })
  marketDataDate?: Date;

  // Audit Fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('uuid', { nullable: true })
  createdBy?: string;

  @Column('uuid', { nullable: true })
  updatedBy?: string;

  // Relationships
  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  // Business Logic Methods
  getSalaryRange(): { min: number; mid: number; max: number } {
    return {
      min: this.minSalary,
      mid: this.midSalary || (this.minSalary + this.maxSalary) / 2,
      max: this.maxSalary
    };
  }

  getCompaRatio(salary: number): number {
    const midpoint = this.midSalary || (this.minSalary + this.maxSalary) / 2;
    return (salary / midpoint) * 100;
  }

  isWithinRange(salary: number): boolean {
    return salary >= this.minSalary && salary <= this.maxSalary;
  }

  getRecommendedSalary(compaRatio: number = 100): number {
    const midpoint = this.midSalary || (this.minSalary + this.maxSalary) / 2;
    return (midpoint * compaRatio) / 100;
  }

  getMarketPositioning(): string {
    if (!this.marketMedian) return 'No market data';
    
    const midpoint = this.midSalary || (this.minSalary + this.maxSalary) / 2;
    const ratio = (midpoint / this.marketMedian) * 100;
    
    if (ratio < 90) return 'Below Market';
    if (ratio > 110) return 'Above Market';
    return 'At Market';
  }
}

@Entity('hr_benefits_plans')
@Index(['organizationId', 'isActive'])
@Index(['organizationId', 'type'])
@Index(['organizationId', 'effectiveDate', 'expiryDate'])
export class BenefitsPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column({ type: 'varchar', length: 200 })
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: BenefitType
  })
  @IsEnum(BenefitType)
  @Index()
  type: BenefitType;

  @Column({ type: 'varchar', length: 200, nullable: true })
  provider?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  cost: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  employerContribution: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  employeeContribution: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'date' })
  @IsDateString()
  @Index()
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  eligibilityCriteria?: {
    employmentType?: string[];
    minHoursPerWeek?: number;
    minTenure?: number;
    departments?: string[];
    dependentEligibility?: {
      spouse: boolean;
      children: boolean;
      maxAge: number;
    };
  };

  @Column({ type: 'jsonb' })
  benefitDetails: Array<{
    coverage: string;
    limit?: number;
    deductible?: number;
    copay?: number;
    coinsurance?: number;
    exclusions?: string[];
    waitingPeriod?: number; // days
  }>;

  @Column({ type: 'jsonb', nullable: true })
  enrollmentPeriod?: {
    startDate: Date;
    endDate: Date;
    isOpenEnrollment: boolean;
    allowMidYearChanges: boolean;
    qualifyingEvents?: string[];
  };

  // Plan Options
  @Column({ type: 'jsonb', nullable: true })
  planOptions?: Array<{
    optionName: string;
    description: string;
    employerCost: number;
    employeeCost: number;
    benefits: Record<string, any>;
  }>;

  // Vendor Information
  @Column({ type: 'jsonb', nullable: true })
  vendorInfo?: {
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    policyNumber: string;
    groupNumber: string;
    renewalDate: Date;
  };

  // Analytics
  @Column({ type: 'int', default: 0 })
  totalEnrollments: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalEmployerCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalEmployeeCost: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  utilizationRate: number;

  // Audit Fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('uuid', { nullable: true })
  createdBy?: string;

  @Column('uuid', { nullable: true })
  updatedBy?: string;

  // Relationships
  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @OneToMany(() => BenefitsEnrollment, enrollment => enrollment.plan)
  enrollments: BenefitsEnrollment[];

  // Business Logic Methods
  isEligible(employee: any): boolean {
    if (!this.eligibilityCriteria) return true;
    
    const criteria = this.eligibilityCriteria;
    
    // Check employment type
    if (criteria.employmentType && !criteria.employmentType.includes(employee.employmentType)) {
      return false;
    }
    
    // Check tenure
    if (criteria.minTenure && employee.tenureInMonths < criteria.minTenure) {
      return false;
    }
    
    // Check department
    if (criteria.departments && !criteria.departments.includes(employee.department)) {
      return false;
    }
    
    return true;
  }

  isEnrollmentOpen(): boolean {
    if (!this.enrollmentPeriod) return true;
    
    const now = new Date();
    const start = new Date(this.enrollmentPeriod.startDate);
    const end = new Date(this.enrollmentPeriod.endDate);
    
    return now >= start && now <= end;
  }

  calculateEmployeeCost(optionName?: string): number {
    if (!optionName) return this.employeeContribution;
    
    const option = this.planOptions?.find(opt => opt.optionName === optionName);
    return option ? option.employeeCost : this.employeeContribution;
  }

  calculateEmployerCost(optionName?: string): number {
    if (!optionName) return this.employerContribution;
    
    const option = this.planOptions?.find(opt => opt.optionName === optionName);
    return option ? option.employerCost : this.employerContribution;
  }
}

@Entity('hr_benefits_enrollments')
@Index(['organizationId', 'employeeId'])
@Index(['organizationId', 'planId'])
@Index(['organizationId', 'status'])
@Index(['organizationId', 'enrollmentDate'])
export class BenefitsEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column('uuid')
  @Index()
  employeeId: string;

  @Column('uuid')
  @Index()
  planId: string;

  @Column({ type: 'timestamp' })
  @Index()
  enrollmentDate: Date;

  @Column({ type: 'date' })
  @IsDateString()
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  terminationDate?: Date;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE
  })
  @IsEnum(EnrollmentStatus)
  @Index()
  status: EnrollmentStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  employeeContribution: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  employerContribution: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  selectedOption?: string;

  @Column({ type: 'jsonb', nullable: true })
  dependents?: Array<{
    id: string;
    name: string;
    relationship: string;
    dateOfBirth: Date;
    ssn?: string;
    isActive: boolean;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  elections?: Array<{
    coverageType: string;
    coverageLevel: string;
    amount?: number;
    beneficiaries?: Array<{
      name: string;
      relationship: string;
      percentage: number;
      isPrimary: boolean;
    }>;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  enrollmentAnswers?: Array<{
    questionId: string;
    question: string;
    answer: string;
  }>;

  // Change tracking
  @Column({ type: 'jsonb', nullable: true })
  changeHistory?: Array<{
    changeDate: Date;
    changeType: 'enrollment' | 'modification' | 'termination';
    previousStatus?: EnrollmentStatus;
    newStatus: EnrollmentStatus;
    reason: string;
    qualifyingEvent?: string;
    changedBy: string;
  }>;

  // Evidence of insurability
  @Column({ type: 'boolean', default: false })
  requiresEvidenceOfInsurability: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  evidenceStatus?: 'pending' | 'approved' | 'declined' | 'not_required';

  @Column({ type: 'date', nullable: true })
  evidenceSubmissionDate?: Date;

  @Column({ type: 'text', nullable: true })
  evidenceNotes?: string;

  // Audit Fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('uuid', { nullable: true })
  createdBy?: string;

  @Column('uuid', { nullable: true })
  updatedBy?: string;

  // Relationships
  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @ManyToOne(() => BenefitsPlan, plan => plan.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'planId' })
  plan: BenefitsPlan;

  // Business Logic Methods
  terminate(reason: string, terminationDate: Date = new Date(), changedBy: string): void {
    this.status = EnrollmentStatus.TERMINATED;
    this.terminationDate = terminationDate;
    
    this.addToChangeHistory('termination', this.status, EnrollmentStatus.TERMINATED, reason, changedBy);
  }

  suspend(reason: string, changedBy: string): void {
    const previousStatus = this.status;
    this.status = EnrollmentStatus.SUSPENDED;
    
    this.addToChangeHistory('modification', previousStatus, EnrollmentStatus.SUSPENDED, reason, changedBy);
  }

  reactivate(reason: string, changedBy: string): void {
    const previousStatus = this.status;
    this.status = EnrollmentStatus.ACTIVE;
    
    this.addToChangeHistory('modification', previousStatus, EnrollmentStatus.ACTIVE, reason, changedBy);
  }

  updateContribution(newEmployeeContribution: number, newEmployerContribution: number, reason: string, changedBy: string): void {
    this.employeeContribution = newEmployeeContribution;
    this.employerContribution = newEmployerContribution;
    
    this.addToChangeHistory('modification', this.status, this.status, reason, changedBy);
  }

  addDependent(dependent: any): void {
    if (!this.dependents) {
      this.dependents = [];
    }
    this.dependents.push({
      id: dependent.id || crypto.randomUUID(),
      name: dependent.name,
      relationship: dependent.relationship,
      dateOfBirth: dependent.dateOfBirth,
      ssn: dependent.ssn,
      isActive: true
    });
  }

  removeDependent(dependentId: string): void {
    if (this.dependents) {
      this.dependents = this.dependents.map(dep => 
        dep.id === dependentId ? { ...dep, isActive: false } : dep
      );
    }
  }

  private addToChangeHistory(
    changeType: 'enrollment' | 'modification' | 'termination',
    previousStatus: EnrollmentStatus,
    newStatus: EnrollmentStatus,
    reason: string,
    changedBy: string,
    qualifyingEvent?: string
  ): void {
    if (!this.changeHistory) {
      this.changeHistory = [];
    }
    
    this.changeHistory.push({
      changeDate: new Date(),
      changeType,
      previousStatus,
      newStatus,
      reason,
      qualifyingEvent,
      changedBy
    });
  }

  get isActive(): boolean {
    return this.status === EnrollmentStatus.ACTIVE;
  }

  get totalCost(): number {
    return this.employeeContribution + this.employerContribution;
  }

  get activeDependents(): number {
    return this.dependents?.filter(dep => dep.isActive).length || 0;
  }
}

@Entity('hr_employee_compensation')
@Index(['organizationId', 'employeeId'])
@Index(['organizationId', 'planId'])
@Index(['organizationId', 'effectiveDate'])
export class EmployeeCompensation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column('uuid')
  @Index()
  employeeId: string;

  @Column('uuid')
  @Index()
  planId: string;

  @Column({ type: 'date' })
  @IsDateString()
  @Index()
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  baseSalary: number;

  @Column({ type: 'jsonb', nullable: true })
  componentValues?: Array<{
    componentId: string;
    actualAmount: number;
    calculatedAmount?: number;
    performanceMultiplier?: number;
  }>;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalCompensation?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reason?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Audit Fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('uuid', { nullable: true })
  createdBy?: string;

  @Column('uuid', { nullable: true })
  updatedBy?: string;

  // Relationships
  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @ManyToOne(() => CompensationPlan, plan => plan.employeeCompensations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'planId' })
  plan: CompensationPlan;

  // Business Logic Methods
  calculateTotal(): number {
    let total = this.baseSalary;
    
    if (this.componentValues) {
      this.componentValues.forEach(component => {
        total += component.actualAmount;
      });
    }
    
    this.totalCompensation = total;
    return total;
  }

  endCompensation(endDate: Date = new Date()): void {
    this.endDate = endDate;
    this.isActive = false;
  }
}
