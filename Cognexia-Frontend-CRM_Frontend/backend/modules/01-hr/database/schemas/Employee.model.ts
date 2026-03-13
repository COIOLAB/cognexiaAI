// Industry 5.0 ERP Backend - Employee Entity Model
// TypeORM entity for employee management with comprehensive HR features
// Author: AI Assistant
// Date: 2024

import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { IsEmail, IsOptional, IsEnum, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Organization } from '../core/Organization.model';
import { User } from '../core/User.model';

export enum EmploymentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated',
  ON_LEAVE = 'on_leave',
  SUSPENDED = 'suspended'
}

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
  CONSULTANT = 'consultant',
  TEMPORARY = 'temporary'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
  SEPARATED = 'separated'
}

@Entity('hr_employees')
@Index(['organizationId', 'employeeNumber'], { unique: true })
@Index(['organizationId', 'workEmail'], { unique: true })
@Index(['organizationId', 'isActive'])
@Index(['organizationId', 'department'])
@Index(['organizationId', 'employmentStatus'])
@Index(['organizationId', 'managerId'])
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column({ type: 'varchar', length: 50, unique: false })
  @Index()
  employeeNumber: string;

  // Personal Information
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  middleName?: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 200 })
  @Index()
  fullName: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  displayName?: string;

  // Contact Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsEmail()
  personalEmail?: string;

  @Column({ type: 'varchar', length: 255, unique: false })
  @IsEmail()
  @Index()
  workEmail: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'jsonb', nullable: true })
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
    address?: string;
  };

  // Employment Details
  @Column({ type: 'varchar', length: 200 })
  @Index()
  jobTitle: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  department: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  division?: string;

  @Column({ type: 'varchar', length: 150 })
  @Index()
  location: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  managerId?: string;

  // Employment Status
  @Column({
    type: 'enum',
    enum: EmploymentStatus,
    default: EmploymentStatus.ACTIVE
  })
  @IsEnum(EmploymentStatus)
  @Index()
  employmentStatus: EmploymentStatus;

  @Column({
    type: 'enum',
    enum: EmploymentType
  })
  @IsEnum(EmploymentType)
  @Index()
  employmentType: EmploymentType;

  @Column({ type: 'date' })
  @IsDateString()
  @Index()
  hireDate: Date;

  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  terminationDate?: Date;

  // Personal Information
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nationality?: string;

  @Column({
    type: 'enum',
    enum: MaritalStatus,
    nullable: true
  })
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  // Compensation
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  baseSalary: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  payGrade?: string;

  // System Access
  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  // Additional Data
  @Column({ type: 'text', array: true, default: '{}' })
  skills: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  languages: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  certifications: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  profilePictureUrl?: string;

  // Metadata and System Fields
  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Performance Metrics (calculated fields)
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  @Min(0)
  @Max(5)
  currentPerformanceRating?: number;

  @Column({ type: 'int', nullable: true })
  totalPerformanceReviews?: number;

  @Column({ type: 'date', nullable: true })
  lastPerformanceReviewDate?: Date;

  @Column({ type: 'date', nullable: true })
  nextPerformanceReviewDate?: Date;

  // HR Analytics Fields
  @Column({ type: 'int', default: 0 })
  yearsOfService: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  engagementScore?: number;

  @Column({ type: 'int', default: 0 })
  trainingHoursCompleted: number;

  @Column({ type: 'int', default: 0 })
  totalAbsenceDays: number;

  // Audit Fields
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy?: string;

  // Relationships
  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToOne(() => Employee, employee => employee.directReports, { nullable: true })
  @JoinColumn({ name: 'managerId' })
  manager?: Employee;

  @OneToMany(() => Employee, employee => employee.manager)
  directReports: Employee[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedBy' })
  updater?: User;

  // Virtual Properties
  get age(): number | null {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  get tenureInMonths(): number {
    const today = new Date();
    const hireDate = new Date(this.hireDate);
    return (today.getFullYear() - hireDate.getFullYear()) * 12 + (today.getMonth() - hireDate.getMonth());
  }

  get isEligibleForPromotion(): boolean {
    return this.tenureInMonths >= 12 && this.employmentStatus === EmploymentStatus.ACTIVE && (this.currentPerformanceRating || 0) >= 3.5;
  }

  // Lifecycle Hooks
  @BeforeInsert()
  @BeforeUpdate()
  updateCalculatedFields() {
    // Update full name
    this.fullName = `${this.firstName} ${this.lastName}`;
    
    // Update display name if not set
    if (!this.displayName) {
      this.displayName = this.fullName;
    }

    // Calculate years of service
    if (this.hireDate) {
      this.yearsOfService = Math.floor(this.tenureInMonths / 12);
    }
  }

  // Business Logic Methods
  promote(newJobTitle: string, newBaseSalary: number, newPayGrade?: string): void {
    this.jobTitle = newJobTitle;
    this.baseSalary = newBaseSalary;
    if (newPayGrade) {
      this.payGrade = newPayGrade;
    }
  }

  transfer(newDepartment: string, newLocation: string, newManagerId?: string): void {
    this.department = newDepartment;
    this.location = newLocation;
    if (newManagerId !== undefined) {
      this.managerId = newManagerId;
    }
  }

  terminate(terminationDate: Date = new Date()): void {
    this.employmentStatus = EmploymentStatus.TERMINATED;
    this.terminationDate = terminationDate;
    this.isActive = false;
  }

  reactivate(): void {
    if (this.employmentStatus === EmploymentStatus.TERMINATED) {
      throw new Error('Cannot reactivate terminated employee');
    }
    this.employmentStatus = EmploymentStatus.ACTIVE;
    this.isActive = true;
  }

  updatePerformanceMetrics(rating: number, reviewDate: Date): void {
    this.currentPerformanceRating = rating;
    this.lastPerformanceReviewDate = reviewDate;
    this.totalPerformanceReviews = (this.totalPerformanceReviews || 0) + 1;
    
    // Calculate next review date (typically 12 months later)
    const nextReview = new Date(reviewDate);
    nextReview.setFullYear(nextReview.getFullYear() + 1);
    this.nextPerformanceReviewDate = nextReview;
  }

  addTrainingHours(hours: number): void {
    this.trainingHoursCompleted += hours;
  }

  updateEngagementScore(score: number): void {
    if (score < 0 || score > 100) {
      throw new Error('Engagement score must be between 0 and 100');
    }
    this.engagementScore = score;
  }
}
