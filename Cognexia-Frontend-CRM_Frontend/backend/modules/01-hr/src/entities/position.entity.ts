// Industry 5.0 ERP Backend - Position Entity
// TypeORM entity for job positions and roles
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
import { EmployeeEntity } from './employee.entity';

@Entity('positions')
@Index(['organizationId', 'code'], { unique: true })
@Index(['organizationId', 'departmentId', 'isActive'])
export class PositionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ type: 'uuid' })
  @Index()
  departmentId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Job Details
  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'text', nullable: true })
  responsibilities: string;

  @Column({ type: 'text', nullable: true })
  requirements: string;

  @Column({ type: 'text', nullable: true })
  qualifications: string;

  // Position Classification
  @Column({ type: 'varchar', length: 100 })
  level: string; // entry, junior, mid, senior, principal, executive

  @Column({ type: 'varchar', length: 100 })
  category: string; // technical, managerial, administrative, etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  jobFamily: string; // engineering, sales, marketing, etc.

  @Column({ type: 'varchar', length: 50, nullable: true })
  payGrade: string;

  // Employment Details
  @Column({ type: 'varchar', length: 50 })
  employmentType: string; // full_time, part_time, contract, etc.

  @Column({ type: 'boolean', default: false })
  isRemoteEligible: boolean;

  @Column({ type: 'boolean', default: false })
  isManagerialRole: boolean;

  @Column({ type: 'boolean', default: false })
  requiresTravel: boolean;

  @Column({ type: 'int', nullable: true })
  travelPercentage: number;

  // Capacity and Status
  @Column({ type: 'int', default: 1 })
  maxOccupants: number; // how many people can hold this position

  @Column({ type: 'int', default: 0 })
  currentOccupants: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isApproved: boolean;

  @Column({ type: 'date', nullable: true })
  approvedDate: Date;

  // Reporting Structure
  @Column({ type: 'uuid', nullable: true })
  reportsToPositionId: string;

  @Column({ type: 'int', nullable: true })
  directReports: number; // expected number of direct reports

  // Compensation
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salaryMin: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salaryMax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salaryMidpoint: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  salaryCurrency: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bonusTargetPercentage: number;

  // Skills and Competencies
  @Column({ type: 'jsonb', nullable: true })
  requiredSkills: string[]; // array of required skill names

  @Column({ type: 'jsonb', nullable: true })
  preferredSkills: string[]; // array of preferred skill names

  @Column({ type: 'jsonb', nullable: true })
  competencies: Record<string, any>; // competency requirements

  // Education and Experience
  @Column({ type: 'varchar', length: 100, nullable: true })
  minimumEducation: string; // high_school, bachelor, master, phd

  @Column({ type: 'int', nullable: true })
  minimumExperienceYears: number;

  @Column({ type: 'int', nullable: true })
  preferredExperienceYears: number;

  @Column({ type: 'jsonb', nullable: true })
  certifications: string[]; // required or preferred certifications

  // Working Conditions
  @Column({ type: 'varchar', length: 255, nullable: true })
  workLocation: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  workSchedule: string; // standard, flexible, shift, etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  physicalRequirements: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  workEnvironment: string; // office, field, hybrid, remote

  // Approval and Workflow
  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @Column({ type: 'uuid', nullable: true })
  approvedById: string;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: string; // draft, pending_approval, approved, archived

  // Flexible fields
  @Column({ type: 'jsonb', nullable: true })
  benefits: Record<string, any>; // position-specific benefits

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

  @ManyToOne(() => DepartmentEntity, department => department.positions)
  @JoinColumn({ name: 'departmentId' })
  department: DepartmentEntity;

  @ManyToOne(() => PositionEntity)
  @JoinColumn({ name: 'reportsToPositionId' })
  reportsToPosition: PositionEntity;

  @OneToMany(() => PositionEntity, position => position.reportsToPosition)
  subordinatePositions: PositionEntity[];

  @OneToMany(() => EmployeeEntity, employee => employee.position)
  employees: EmployeeEntity[];

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'createdById' })
  createdBy: EmployeeEntity;

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'approvedById' })
  approvedBy: EmployeeEntity;
}
