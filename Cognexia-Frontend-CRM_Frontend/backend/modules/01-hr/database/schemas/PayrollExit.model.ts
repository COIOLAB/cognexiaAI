// Industry 5.0 ERP Backend - Payroll & Exit Management Entities
// TypeORM entities for payroll processing and exit management
// Author: AI Assistant
// Date: 2024

import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsNumber, Min, Max, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { Employee } from './Employee.model';
import { Organization } from '../core/Organization.model';
import { User } from '../core/User.model';

// =====================
// PAYROLL ENTITIES
// =====================

export enum PayrollStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  APPROVED = 'approved',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}

export enum DeductionType {
  TAX = 'tax',
  BENEFIT = 'benefit',
  LOAN = 'loan',
  ADVANCE = 'advance',
  GARNISHMENT = 'garnishment',
  OTHER = 'other'
}

@Entity('hr_payroll_runs')
@Index(['organizationId', 'status'])
@Index(['organizationId', 'payPeriodStart', 'payPeriodEnd'])
@Index(['organizationId', 'payDate'])
export class PayrollRun {
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

  @Column({ type: 'date' })
  @IsDateString()
  @Index()
  payPeriodStart: Date;

  @Column({ type: 'date' })
  @IsDateString()
  @Index()
  payPeriodEnd: Date;

  @Column({ type: 'date' })
  @IsDateString()
  @Index()
  payDate: Date;

  @Column({
    type: 'enum',
    enum: PayrollStatus,
    default: PayrollStatus.DRAFT
  })
  @IsEnum(PayrollStatus)
  @Index()
  status: PayrollStatus;

  // Statistics
  @Column({ type: 'int', nullable: true })
  totalEmployees?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalGrossPay?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalNetPay?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalDeductions?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalTaxes?: number;

  // Processing Information
  @Column({ type: 'timestamp', nullable: true })
  processedDate?: Date;

  @Column('uuid', { nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedDate?: Date;

  @Column({ type: 'text', nullable: true })
  approvalNotes?: string;

  // Processing Rules
  @Column({ type: 'jsonb', nullable: true })
  processingRules?: {
    includeEmployeeIds?: string[];
    excludeEmployeeIds?: string[];
    departments?: string[];
    payGrades?: string[];
    overtimeMultiplier?: number;
    customRules?: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
  };

  // Error Tracking
  @Column({ type: 'jsonb', nullable: true })
  processingErrors?: Array<{
    employeeId: string;
    errorType: string;
    errorMessage: string;
    timestamp: Date;
  }>;

  @Column({ type: 'int', default: 0 })
  errorCount: number;

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

  @OneToMany(() => PayrollRecord, record => record.payrollRun)
  payrollRecords: PayrollRecord[];

  // Business Logic Methods
  process(): void {
    if (this.status !== PayrollStatus.DRAFT) {
      throw new Error('Only draft payrolls can be processed');
    }
    this.status = PayrollStatus.PROCESSING;
    this.processedDate = new Date();
  }

  complete(): void {
    if (this.status !== PayrollStatus.PROCESSING) {
      throw new Error('Only processing payrolls can be completed');
    }
    this.status = PayrollStatus.PROCESSED;
  }

  approve(approverId: string, notes?: string): void {
    if (this.status !== PayrollStatus.PROCESSED) {
      throw new Error('Only processed payrolls can be approved');
    }
    this.status = PayrollStatus.APPROVED;
    this.approvedBy = approverId;
    this.approvedDate = new Date();
    if (notes) {
      this.approvalNotes = notes;
    }
  }

  markPaid(): void {
    if (this.status !== PayrollStatus.APPROVED) {
      throw new Error('Only approved payrolls can be marked as paid');
    }
    this.status = PayrollStatus.PAID;
  }

  cancel(reason?: string): void {
    this.status = PayrollStatus.CANCELLED;
    if (reason) {
      this.approvalNotes = reason;
    }
  }

  addError(employeeId: string, errorType: string, errorMessage: string): void {
    if (!this.processingErrors) {
      this.processingErrors = [];
    }
    this.processingErrors.push({
      employeeId,
      errorType,
      errorMessage,
      timestamp: new Date()
    });
    this.errorCount = this.processingErrors.length;
  }

  calculateTotals(): void {
    if (!this.payrollRecords?.length) return;

    this.totalEmployees = this.payrollRecords.length;
    this.totalGrossPay = this.payrollRecords.reduce((sum, record) => sum + record.grossPay, 0);
    this.totalNetPay = this.payrollRecords.reduce((sum, record) => sum + record.netPay, 0);
    this.totalDeductions = this.payrollRecords.reduce((sum, record) => sum + record.totalDeductions, 0);
    this.totalTaxes = this.payrollRecords.reduce((sum, record) => sum + record.totalTaxes, 0);
  }
}

@Entity('hr_payroll_records')
@Index(['organizationId', 'payrollRunId'])
@Index(['organizationId', 'employeeId'])
@Index(['organizationId', 'payPeriodStart', 'payPeriodEnd'])
export class PayrollRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column('uuid')
  @Index()
  payrollRunId: string;

  @Column('uuid')
  @Index()
  employeeId: string;

  // Pay Period
  @Column({ type: 'date' })
  @IsDateString()
  @Index()
  payPeriodStart: Date;

  @Column({ type: 'date' })
  @IsDateString()
  @Index()
  payPeriodEnd: Date;

  @Column({ type: 'date' })
  @IsDateString()
  payDate: Date;

  // Pay Amounts
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  grossPay: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  netPay: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  totalDeductions: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  totalTaxes: number;

  // Pay Components
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  baseSalary: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  overtimePay: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  bonusPay: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  commissionPay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  hoursWorked: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  overtimeHours: number;

  // Deductions
  @Column({ type: 'jsonb' })
  deductions: Array<{
    id: string;
    type: DeductionType;
    name: string;
    amount: number;
    isPreTax: boolean;
    description?: string;
  }>;

  // Tax Information
  @Column({ type: 'jsonb', nullable: true })
  taxDetails?: {
    federalIncomeTax: number;
    stateIncomeTax: number;
    socialSecurityTax: number;
    medicareTax: number;
    unemploymentTax: number;
    otherTaxes?: Array<{
      name: string;
      amount: number;
    }>;
  };

  // Time tracking
  @Column({ type: 'jsonb', nullable: true })
  timeEntries?: Array<{
    date: Date;
    hoursWorked: number;
    overtimeHours: number;
    description?: string;
  }>;

  // YTD Information
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  ytdGrossPay: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  ytdNetPay: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  ytdDeductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  ytdTaxes: number;

  // Payslip
  @Column({ type: 'varchar', length: 500, nullable: true })
  payslipUrl?: string;

  @Column({ type: 'boolean', default: false })
  payslipGenerated: boolean;

  @Column({ type: 'timestamp', nullable: true })
  payslipGeneratedAt?: Date;

  // Status
  @Column({ type: 'varchar', length: 50, default: 'processed' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

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

  @ManyToOne(() => PayrollRun, run => run.payrollRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payrollRunId' })
  payrollRun: PayrollRun;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  // Business Logic Methods
  calculateNetPay(): number {
    this.netPay = this.grossPay - this.totalDeductions - this.totalTaxes;
    return this.netPay;
  }

  addDeduction(deduction: any): void {
    if (!this.deductions) {
      this.deductions = [];
    }
    this.deductions.push(deduction);
    this.totalDeductions = this.deductions.reduce((sum, ded) => sum + ded.amount, 0);
  }

  generatePayslip(): void {
    // This would generate a payslip PDF and store the URL
    this.payslipGenerated = true;
    this.payslipGeneratedAt = new Date();
    // this.payslipUrl would be set to the generated PDF URL
  }

  updateYTD(): void {
    // This would calculate YTD values based on previous payroll records
    // Implementation would query database for YTD calculations
  }

  get effectiveHourlyRate(): number {
    if (this.hoursWorked === 0) return 0;
    return this.baseSalary / this.hoursWorked;
  }
}

@Entity('hr_tax_rules')
@Index(['organizationId', 'isActive'])
@Index(['organizationId', 'effectiveDate', 'expiryDate'])
export class TaxRule {
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

  @Column({ type: 'varchar', length: 50 })
  type: 'percentage' | 'fixed' | 'tiered';

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  rate?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedAmount?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  // Tiered Tax Structure
  @Column({ type: 'jsonb', nullable: true })
  tiers?: Array<{
    minIncome: number;
    maxIncome?: number;
    rate: number;
    fixedAmount?: number;
  }>;

  // Applicability
  @Column({ type: 'varchar', length: 100, default: 'all' })
  applicableTo: string; // 'all', 'federal', 'state', 'local', etc.

  @Column({ type: 'text', array: true, default: '{}' })
  applicableStates: string[];

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'date' })
  @IsDateString()
  @Index()
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

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
  calculateTax(grossIncome: number): number {
    if (!this.isActive || grossIncome <= 0) return 0;

    switch (this.type) {
      case 'percentage':
        const percentageAmount = grossIncome * (this.rate || 0);
        if (this.minAmount && percentageAmount < this.minAmount) return this.minAmount;
        if (this.maxAmount && percentageAmount > this.maxAmount) return this.maxAmount;
        return percentageAmount;

      case 'fixed':
        return this.fixedAmount || 0;

      case 'tiered':
        if (!this.tiers) return 0;
        let totalTax = 0;
        let remainingIncome = grossIncome;

        for (const tier of this.tiers) {
          if (remainingIncome <= 0) break;

          const tierMin = tier.minIncome;
          const tierMax = tier.maxIncome || Infinity;
          const taxableInThisTier = Math.min(remainingIncome, tierMax - tierMin);

          if (taxableInThisTier > 0) {
            totalTax += (tier.fixedAmount || 0) + (taxableInThisTier * tier.rate);
            remainingIncome -= taxableInThisTier;
          }
        }
        return totalTax;

      default:
        return 0;
    }
  }

  isEffective(date: Date = new Date()): boolean {
    const effective = new Date(this.effectiveDate) <= date;
    const notExpired = !this.expiryDate || new Date(this.expiryDate) >= date;
    return this.isActive && effective && notExpired;
  }
}

// =====================
// EXIT MANAGEMENT ENTITIES
// =====================

export enum ExitType {
  VOLUNTARY = 'voluntary',
  INVOLUNTARY = 'involuntary',
  RETIREMENT = 'retirement',
  CONTRACT_END = 'contract_end',
  LAYOFF = 'layoff'
}

export enum ExitStatus {
  INITIATED = 'initiated',
  IN_PROGRESS = 'in_progress',
  INTERVIEW_COMPLETED = 'interview_completed',
  OFFBOARDING_COMPLETED = 'offboarding_completed',
  COMPLETED = 'completed'
}

export enum TransferStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELAYED = 'delayed'
}

@Entity('hr_exit_records')
@Index(['organizationId', 'employeeId'])
@Index(['organizationId', 'exitType'])
@Index(['organizationId', 'status'])
@Index(['organizationId', 'lastWorkingDay'])
export class ExitRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column('uuid')
  @Index()
  employeeId: string;

  @Column({
    type: 'enum',
    enum: ExitType
  })
  @IsEnum(ExitType)
  @Index()
  exitType: ExitType;

  @Column({ type: 'text' })
  exitReason: string;

  @Column({ type: 'date' })
  @IsDateString()
  @Index()
  lastWorkingDay: Date;

  @Column({ type: 'date' })
  @IsDateString()
  noticeDate: Date;

  @Column({ type: 'boolean', default: false })
  exitInterviewScheduled: boolean;

  @Column({ type: 'boolean', default: false })
  exitInterviewCompleted: boolean;

  @Column({ type: 'boolean', default: false })
  offboardingCompleted: boolean;

  @Column({ type: 'boolean', default: false })
  knowledgeTransferCompleted: boolean;

  @Column({
    type: 'enum',
    enum: ExitStatus,
    default: ExitStatus.INITIATED
  })
  @IsEnum(ExitStatus)
  @Index()
  status: ExitStatus;

  // Additional Details
  @Column({ type: 'text', nullable: true })
  detailedReason?: string;

  @Column({ type: 'boolean', default: true })
  isEligibleForRehire: boolean;

  @Column({ type: 'text', nullable: true })
  rehireNotes?: string;

  @Column('uuid', { nullable: true })
  initiatedBy?: string;

  @Column('uuid', { nullable: true })
  managerId?: string;

  // Final Payments
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  finalPayAmount?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  ptoPayoutAmount?: number;

  @Column({ type: 'boolean', default: false })
  finalPayProcessed: boolean;

  @Column({ type: 'date', nullable: true })
  finalPayDate?: Date;

  // Equipment and Access
  @Column({ type: 'jsonb', nullable: true })
  equipmentReturned?: Array<{
    item: string;
    serialNumber?: string;
    returned: boolean;
    returnDate?: Date;
    condition?: string;
  }>;

  @Column({ type: 'boolean', default: false })
  systemAccessRevoked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  accessRevokedAt?: Date;

  // Documentation
  @Column({ type: 'text', array: true, default: '{}' })
  documentsReturned: string[];

  @Column({ type: 'text', nullable: true })
  notes?: string;

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

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'initiatedBy' })
  initiator?: Employee;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'managerId' })
  manager?: Employee;

  @OneToMany(() => ExitInterview, interview => interview.exitRecord)
  exitInterviews: ExitInterview[];

  @OneToMany(() => OffboardingChecklist, checklist => checklist.exitRecord)
  offboardingChecklists: OffboardingChecklist[];

  @OneToMany(() => KnowledgeTransferPlan, plan => plan.exitRecord)
  knowledgeTransferPlans: KnowledgeTransferPlan[];

  // Business Logic Methods
  scheduleExitInterview(): void {
    this.exitInterviewScheduled = true;
    if (this.status === ExitStatus.INITIATED) {
      this.status = ExitStatus.IN_PROGRESS;
    }
  }

  completeExitInterview(): void {
    this.exitInterviewCompleted = true;
    this.status = ExitStatus.INTERVIEW_COMPLETED;
  }

  completeOffboarding(): void {
    this.offboardingCompleted = true;
    if (this.exitInterviewCompleted && this.knowledgeTransferCompleted) {
      this.status = ExitStatus.COMPLETED;
    } else {
      this.status = ExitStatus.OFFBOARDING_COMPLETED;
    }
  }

  completeKnowledgeTransfer(): void {
    this.knowledgeTransferCompleted = true;
    if (this.exitInterviewCompleted && this.offboardingCompleted) {
      this.status = ExitStatus.COMPLETED;
    }
  }

  revokeSystemAccess(): void {
    this.systemAccessRevoked = true;
    this.accessRevokedAt = new Date();
  }

  processFinalPay(amount: number, ptoAmount: number = 0): void {
    this.finalPayAmount = amount;
    this.ptoPayoutAmount = ptoAmount;
    this.finalPayProcessed = true;
    this.finalPayDate = new Date();
  }

  get daysUntilLastWorkingDay(): number {
    const today = new Date();
    const lastDay = new Date(this.lastWorkingDay);
    return Math.ceil((lastDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  get noticePeriodDays(): number {
    const notice = new Date(this.noticeDate);
    const lastDay = new Date(this.lastWorkingDay);
    return Math.ceil((lastDay.getTime() - notice.getTime()) / (1000 * 60 * 60 * 24));
  }
}

@Entity('hr_exit_interviews')
@Index(['organizationId', 'exitRecordId'])
@Index(['organizationId', 'employeeId'])
@Index(['organizationId', 'interviewDate'])
export class ExitInterview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column('uuid')
  @Index()
  exitRecordId: string;

  @Column('uuid')
  @Index()
  employeeId: string;

  @Column({ type: 'timestamp' })
  @Index()
  interviewDate: Date;

  @Column('uuid')
  interviewer: string;

  @Column({ type: 'jsonb' })
  responses: Array<{
    id: string;
    questionId: string;
    question: string;
    answer: string;
    rating?: number;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  analysis?: {
    themes: string[];
    sentiment: 'Positive' | 'Negative' | 'Neutral';
    riskFactors: string[];
    recommendedActions: string[];
  };

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'text', nullable: true })
  additionalComments?: string;

  @Column({ type: 'text', nullable: true })
  interviewerNotes?: string;

  // AI Analysis Results
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  @Min(-100)
  @Max(100)
  sentimentScore?: number;

  @Column({ type: 'text', array: true, default: '{}' })
  keyThemes: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  improvementSuggestions: string[];

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

  @ManyToOne(() => ExitRecord, record => record.exitInterviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exitRecordId' })
  exitRecord: ExitRecord;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'interviewer' })
  interviewerEmployee: Employee;

  // Business Logic Methods
  complete(): void {
    this.completed = true;
    this.exitRecord?.completeExitInterview();
  }

  analyzeResponses(): void {
    // This would implement AI analysis of the responses
    const themes = this.extractThemes();
    const sentiment = this.analyzeSentiment();
    const riskFactors = this.identifyRiskFactors();
    const actions = this.generateRecommendedActions();

    this.analysis = {
      themes,
      sentiment,
      riskFactors,
      recommendedActions: actions
    };
  }

  private extractThemes(): string[] {
    // Simple theme extraction logic
    const themes = new Set<string>();
    this.responses.forEach(response => {
      const text = response.answer.toLowerCase();
      if (text.includes('management') || text.includes('supervisor')) themes.add('Management');
      if (text.includes('workload') || text.includes('stress')) themes.add('Workload');
      if (text.includes('career') || text.includes('growth')) themes.add('Career Development');
      if (text.includes('compensation') || text.includes('salary')) themes.add('Compensation');
    });
    return Array.from(themes);
  }

  private analyzeSentiment(): 'Positive' | 'Negative' | 'Neutral' {
    // Simple sentiment analysis
    let positiveCount = 0;
    let negativeCount = 0;

    this.responses.forEach(response => {
      const text = response.answer.toLowerCase();
      if (text.includes('good') || text.includes('great') || text.includes('excellent')) {
        positiveCount++;
      }
      if (text.includes('bad') || text.includes('poor') || text.includes('disappointed')) {
        negativeCount++;
      }
    });

    if (positiveCount > negativeCount) return 'Positive';
    if (negativeCount > positiveCount) return 'Negative';
    return 'Neutral';
  }

  private identifyRiskFactors(): string[] {
    const risks: string[] = [];
    this.responses.forEach(response => {
      const text = response.answer.toLowerCase();
      if (text.includes('harassment') || text.includes('discrimination')) {
        risks.push('Legal Risk');
      }
      if (text.includes('toxic') || text.includes('hostile')) {
        risks.push('Culture Risk');
      }
    });
    return risks;
  }

  private generateRecommendedActions(): string[] {
    const actions: string[] = [];
    if (this.keyThemes.includes('Management')) {
      actions.push('Review management training programs');
    }
    if (this.keyThemes.includes('Workload')) {
      actions.push('Assess team workload distribution');
    }
    return actions;
  }
}

@Entity('hr_offboarding_checklists')
@Index(['organizationId', 'exitRecordId'])
@Index(['organizationId', 'allCompleted'])
export class OffboardingChecklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column('uuid')
  @Index()
  exitRecordId: string;

  @Column({ type: 'jsonb' })
  items: Array<{
    id: string;
    task: string;
    responsible: string;
    dueDate: string;
    completed: boolean;
    completedDate?: Date;
    completedBy?: string;
    notes?: string;
    priority: 'High' | 'Medium' | 'Low';
  }>;

  @Column({ type: 'int', default: 0 })
  completedItems: number;

  @Column({ type: 'int', default: 0 })
  totalItems: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @Min(0)
  @Max(100)
  completionPercentage: number;

  @Column({ type: 'boolean', default: false })
  @Index()
  allCompleted: boolean;

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

  @ManyToOne(() => ExitRecord, record => record.offboardingChecklists, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exitRecordId' })
  exitRecord: ExitRecord;

  // Business Logic Methods
  updateItem(itemId: string, completed: boolean, completedBy?: string, notes?: string): void {
    this.items = this.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          completed,
          completedDate: completed ? new Date() : undefined,
          completedBy: completed ? completedBy : undefined,
          notes: notes || item.notes
        };
      }
      return item;
    });

    this.updateProgress();
  }

  updateProgress(): void {
    this.completedItems = this.items.filter(item => item.completed).length;
    this.totalItems = this.items.length;
    this.completionPercentage = this.totalItems > 0 ? (this.completedItems / this.totalItems) * 100 : 0;
    this.allCompleted = this.completedItems === this.totalItems;

    if (this.allCompleted) {
      this.exitRecord?.completeOffboarding();
    }
  }

  addItem(task: string, responsible: string, dueDate: string, priority: 'High' | 'Medium' | 'Low' = 'Medium'): void {
    this.items.push({
      id: crypto.randomUUID(),
      task,
      responsible,
      dueDate,
      completed: false,
      priority
    });
    this.updateProgress();
  }

  get overdueTasks(): number {
    const today = new Date();
    return this.items.filter(item => 
      !item.completed && new Date(item.dueDate) < today
    ).length;
  }

  get highPriorityTasks(): number {
    return this.items.filter(item => 
      !item.completed && item.priority === 'High'
    ).length;
  }
}

@Entity('hr_knowledge_transfer_plans')
@Index(['organizationId', 'exitRecordId'])
@Index(['organizationId', 'departingEmployeeId'])
@Index(['organizationId', 'successorId'])
@Index(['organizationId', 'status'])
export class KnowledgeTransferPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column('uuid')
  @Index()
  exitRecordId: string;

  @Column('uuid')
  @Index()
  departingEmployeeId: string;

  @Column('uuid')
  @Index()
  successorId: string;

  @Column({ type: 'jsonb' })
  responsibilities: Array<{
    id: string;
    name: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    transferred: boolean;
    transferDate?: Date;
    notes?: string;
  }>;

  @Column({ type: 'jsonb' })
  projects: Array<{
    id: string;
    name: string;
    description: string;
    status: string;
    handedOver: boolean;
    handoverDate?: Date;
    notes?: string;
  }>;

  @Column({ type: 'jsonb' })
  timeline: Array<{
    week: number;
    task: string;
    type: 'responsibility' | 'project' | 'training';
    completed: boolean;
    completedDate?: Date;
    notes?: string;
  }>;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.PLANNED
  })
  @IsEnum(TransferStatus)
  @Index()
  status: TransferStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  @Min(0)
  @Max(100)
  completionPercentage: number;

  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @Column({ type: 'date', nullable: true })
  targetCompletionDate?: Date;

  @Column({ type: 'date', nullable: true })
  actualCompletionDate?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

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

  @ManyToOne(() => ExitRecord, record => record.knowledgeTransferPlans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exitRecordId' })
  exitRecord: ExitRecord;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'departingEmployeeId' })
  departingEmployee: Employee;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'successorId' })
  successor: Employee;

  // Business Logic Methods
  start(): void {
    if (this.status !== TransferStatus.PLANNED) {
      throw new Error('Only planned transfers can be started');
    }
    this.status = TransferStatus.IN_PROGRESS;
    this.startDate = new Date();
  }

  completeResponsibility(responsibilityId: string, notes?: string): void {
    this.responsibilities = this.responsibilities.map(resp => {
      if (resp.id === responsibilityId) {
        return {
          ...resp,
          transferred: true,
          transferDate: new Date(),
          notes: notes || resp.notes
        };
      }
      return resp;
    });
    this.updateProgress();
  }

  completeProject(projectId: string, notes?: string): void {
    this.projects = this.projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          handedOver: true,
          handoverDate: new Date(),
          notes: notes || project.notes
        };
      }
      return project;
    });
    this.updateProgress();
  }

  updateProgress(): void {
    const totalItems = this.responsibilities.length + this.projects.length;
    const completedItems = 
      this.responsibilities.filter(r => r.transferred).length +
      this.projects.filter(p => p.handedOver).length;

    this.completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    if (this.completionPercentage === 100) {
      this.status = TransferStatus.COMPLETED;
      this.actualCompletionDate = new Date();
      this.exitRecord?.completeKnowledgeTransfer();
    }
  }

  get isOverdue(): boolean {
    return this.targetCompletionDate ? 
      new Date() > new Date(this.targetCompletionDate) && this.status !== TransferStatus.COMPLETED : 
      false;
  }

  get estimatedDaysToComplete(): number {
    if (this.status === TransferStatus.COMPLETED) return 0;
    
    const remainingPercentage = 100 - this.completionPercentage;
    const daysElapsed = this.startDate ? 
      Math.ceil((new Date().getTime() - new Date(this.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 
      0;
    
    if (this.completionPercentage === 0 || daysElapsed === 0) return 14; // Default estimate
    
    const dailyProgressRate = this.completionPercentage / daysElapsed;
    return Math.ceil(remainingPercentage / dailyProgressRate);
  }
}
