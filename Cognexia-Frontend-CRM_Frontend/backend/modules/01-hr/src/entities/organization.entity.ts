// Industry 5.0 ERP Backend - Organization Entity
// TypeORM entity for organizational structure
// Author: AI Assistant
// Date: 2024

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index
} from 'typeorm';
import { EmployeeEntity } from './employee.entity';
import { DepartmentEntity } from './department.entity';
import { CompensationPlanEntity } from './compensation-plan.entity';
import { PayrollRunEntity } from './payroll-run.entity';

@Entity('organizations')
@Index(['code'], { unique: true })
@Index(['isActive'])
export class OrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  type: string; // company, subsidiary, division, etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  industry: string;

  @Column({ type: 'varchar', length: 10 })
  country: string;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  taxId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  website: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logoUrl: string;

  // Address Information
  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode: string;

  // Contact Information
  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  // Settings
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  timezone: string;

  @Column({ type: 'varchar', length: 10, default: 'en-US' })
  locale: string;

  // Business Settings
  @Column({ type: 'varchar', length: 20, default: 'monday' })
  weekStartDay: string;

  @Column({ type: 'int', default: 40 })
  standardWorkWeekHours: number;

  @Column({ type: 'int', default: 25 })
  standardPtodays: number;

  // JSON Fields for flexible data
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
  @OneToMany(() => EmployeeEntity, employee => employee.organization)
  employees: EmployeeEntity[];

  @OneToMany(() => DepartmentEntity, department => department.organization)
  departments: DepartmentEntity[];

  @OneToMany(() => CompensationPlanEntity, plan => plan.organization)
  compensationPlans: CompensationPlanEntity[];

  @OneToMany(() => PayrollRunEntity, payrollRun => payrollRun.organization)
  payrollRuns: PayrollRunEntity[];
}
