// Industry 5.0 ERP Backend - Department Entity
// TypeORM entity for organizational departments
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
import { PositionEntity } from './position.entity';

@Entity('departments')
@Index(['organizationId', 'code'], { unique: true })
@Index(['organizationId', 'isActive'])
export class DepartmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  organizationId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  type: string; // operational, support, management, etc.

  // Hierarchy
  @Column({ type: 'uuid', nullable: true })
  parentDepartmentId: string;

  @Column({ type: 'int', default: 0 })
  level: number; // hierarchy level (0 = top level)

  @Column({ type: 'varchar', length: 500, nullable: true })
  hierarchyPath: string; // slash-separated path of department IDs

  // Management
  @Column({ type: 'uuid', nullable: true })
  headOfDepartmentId: string;

  @Column({ type: 'uuid', nullable: true })
  managerId: string;

  // Budget and Resources
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  annualBudget: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  budgetCurrency: string;

  @Column({ type: 'int', nullable: true })
  maxEmployees: number;

  @Column({ type: 'int', default: 0 })
  currentEmployeeCount: number;

  // Location and Setup
  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  building: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  floor: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneExtension: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  // Status and Settings
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isVirtual: boolean; // for remote/distributed teams

  @Column({ type: 'date', nullable: true })
  establishedDate: Date;

  // Cost Center
  @Column({ type: 'varchar', length: 50, nullable: true })
  costCenterCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  costCenterName: string;

  // Flexible JSON fields
  @Column({ type: 'jsonb', nullable: true })
  goals: Record<string, any>; // department objectives and KPIs

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>; // department-specific settings

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
  @ManyToOne(() => OrganizationEntity, organization => organization.departments)
  @JoinColumn({ name: 'organizationId' })
  organization: OrganizationEntity;

  @ManyToOne(() => DepartmentEntity)
  @JoinColumn({ name: 'parentDepartmentId' })
  parentDepartment: DepartmentEntity;

  @OneToMany(() => DepartmentEntity, department => department.parentDepartment)
  childDepartments: DepartmentEntity[];

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'headOfDepartmentId' })
  headOfDepartment: EmployeeEntity;

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'managerId' })
  manager: EmployeeEntity;

  @OneToMany(() => EmployeeEntity, employee => employee.department)
  employees: EmployeeEntity[];

  @OneToMany(() => PositionEntity, position => position.department)
  positions: PositionEntity[];
}
