// Industry 5.0 ERP Backend - Employee Entity
// TypeORM entity for employee information
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
import { DepartmentEntity } from './department.entity';
import { PositionEntity } from './position.entity';
import { EmployeeCompensationEntity } from './employee-compensation.entity';
import { PayrollRecordEntity } from './payroll-record.entity';
import { PerformanceReviewEntity } from './performance-review.entity';

@Entity('employees')
@Index(['organizationId', 'employeeNumber'], { unique: true })
@Index(['organizationId', 'workEmail'], { unique: true })
@Index(['organizationId', 'isActive'])
@Index(['departmentId'])
@Index(['managerId'])
export class EmployeeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  employeeNumber: string;

  // Personal Information
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  middleName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 200 })
  fullName: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  displayName: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  preferredName: string;

  // Contact Information
  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  workEmail: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  personalEmail: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  mobileNumber: string;

  // Employment Information
  @Column({ type: 'uuid', nullable: true })
  @Index()
  departmentId: string;

  @Column({ type: 'uuid', nullable: true })
  positionId: string;

  @Column({ type: 'varchar', length: 255 })
  jobTitle: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  jobCode: string;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  building: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  floor: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  workstation: string;

  // Employment Status and Type
  @Column({ type: 'varchar', length: 50, default: 'active' })
  @Index()
  employmentStatus: string; // active, inactive, terminated, on_leave, suspended

  @Column({ type: 'varchar', length: 50 })
  employmentType: string; // full_time, part_time, contract, internship, consultant, temporary

  @Column({ type: 'date' })
  hireDate: Date;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  terminationDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  terminationReason: string;

  @Column({ type: 'date', nullable: true })
  probationEndDate: Date;

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isProbation: boolean;

  // Reporting Structure
  @Column({ type: 'uuid', nullable: true })
  @Index()
  managerId: string;

  @Column({ type: 'int', default: 0 })
  directReportsCount: number;

  // Personal Details
  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nationality: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  maritalStatus: string;

  // Address Information
  @Column({ type: 'text', nullable: true })
  homeAddress: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  country: string;

  // Compensation
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  baseSalary: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  payGrade: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  payFrequency: string; // hourly, weekly, bi_weekly, monthly, annual

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bonusTargetPercentage: number;

  // Work Schedule
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 40.0 })
  standardHoursPerWeek: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  workSchedule: string; // standard, flexible, shift, remote

  @Column({ type: 'varchar', length: 50, nullable: true })
  timezone: string;

  // Emergency Contact
  @Column({ type: 'jsonb', nullable: true })
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
    address?: string;
  };

  // Skills and Qualifications
  @Column({ type: 'simple-array', nullable: true })
  skills: string[];

  @Column({ type: 'simple-array', nullable: true })
  languages: string[];

  @Column({ type: 'simple-array', nullable: true })
  certifications: string[];

  @Column({ type: 'jsonb', nullable: true })
  education: Array<{
    degree: string;
    institution: string;
    fieldOfStudy: string;
    graduationYear: number;
    gpa?: number;
  }>;

  // System and Access
  @Column({ type: 'varchar', length: 255, nullable: true })
  profilePictureUrl: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  badgeNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  workstationId: string;

  // Legal and Compliance
  @Column({ type: 'varchar', length: 50, nullable: true })
  socialSecurityNumber: string; // encrypted

  @Column({ type: 'varchar', length: 50, nullable: true })
  nationalId: string; // national identification number

  @Column({ type: 'varchar', length: 50, nullable: true })
  passportNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  visaStatus: string;

  @Column({ type: 'date', nullable: true })
  visaExpiryDate: Date;

  @Column({ type: 'boolean', default: false })
  backgroundCheckCompleted: boolean;

  @Column({ type: 'date', nullable: true })
  backgroundCheckDate: Date;

  // Performance and Development
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  lastPerformanceRating: number;

  @Column({ type: 'date', nullable: true })
  lastPerformanceReviewDate: Date;

  @Column({ type: 'date', nullable: true })
  nextPerformanceReviewDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  goals: Array<{
    title: string;
    description: string;
    targetDate: string;
    status: string;
  }>;

  // Flexible JSON fields
  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>; // organization-specific fields

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any>; // user preferences and settings

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
  @ManyToOne(() => OrganizationEntity, organization => organization.employees)
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @ManyToOne(() => DepartmentEntity, department => department.employees)
  @JoinColumn({ name: 'departmentId' })
  department: DepartmentEntity;

  @ManyToOne(() => PositionEntity, position => position.employees)
  @JoinColumn({ name: 'positionId' })
  position: PositionEntity;

  @ManyToOne(() => EmployeeEntity, employee => employee.directReports)
  @JoinColumn({ name: 'managerId' })
  manager: EmployeeEntity;

  @OneToMany(() => EmployeeEntity, employee => employee.manager)
  directReports: EmployeeEntity[];

  @OneToMany(() => EmployeeCompensationEntity, compensation => compensation.employee)
  compensations: EmployeeCompensationEntity[];

  @OneToMany(() => PayrollRecordEntity, payrollRecord => payrollRecord.employee)
  payrollRecords: PayrollRecordEntity[];

  @OneToMany(() => PerformanceReviewEntity, review => review.employee)
  performanceReviews: PerformanceReviewEntity[];

  @OneToMany(() => PerformanceReviewEntity, review => review.reviewer)
  performanceReviewsAsReviewer: PerformanceReviewEntity[];
}
