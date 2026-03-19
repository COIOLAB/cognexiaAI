import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Customer } from './customer.entity';
import { Opportunity } from './opportunity.entity';

export enum AccountType {
  PROSPECT = 'prospect',
  CUSTOMER = 'customer',
  PARTNER = 'partner',
  COMPETITOR = 'competitor',
  VENDOR = 'vendor',
  RESELLER = 'reseller',
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  POTENTIAL = 'potential',
  LOST = 'lost',
  CHURNED = 'churned',
}

@Entity('crm_accounts')
@Index(['accountNumber'], { unique: true })
@Index(['type'])
@Index(['status'])
@Index(['industry'])
export class Account {
  @ApiProperty({ description: 'Account UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId: string;

  @ApiProperty({ description: 'Unique account number' })
  @Column({ unique: true, length: 50 })
  accountNumber: string;

  @ApiProperty({ description: 'Account name' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Account type', enum: AccountType })
  @Column({ type: 'simple-enum', enum: AccountType })
  type: AccountType;

  @ApiProperty({ description: 'Account status', enum: AccountStatus })
  @Column({ type: 'simple-enum', enum: AccountStatus, default: AccountStatus.POTENTIAL })
  status: AccountStatus;

  @ApiProperty({ description: 'Industry sector' })
  @Column({ length: 100 })
  industry: string;

  @ApiProperty({ description: 'Account website' })
  @Column({ length: 255, nullable: true })
  website?: string;

  @ApiProperty({ description: 'Parent account' })
  @Column({ length: 255, nullable: true })
  parentAccount?: string;

  @ApiProperty({ description: 'Account owner/manager' })
  @Column({ length: 255 })
  owner: string;

  @ApiProperty({ description: 'Account team members' })
  @Column({ type: 'text', array: true, default: [] })
  team: string[];

  @ApiProperty({ description: 'Account revenue' })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  revenue: number;

  @ApiProperty({ description: 'Account priority score' })
  @Column({ type: 'int', default: 50 })
  priorityScore: number;

  @ApiProperty({ description: 'Account details', type: 'object' })
  @Column({ type: 'json' })
  details: {
    employees?: number;
    annualRevenue?: number;
    description?: string;
    phone?: string;
    territory?: string;
    segment?: string;
    tier?: string;
  };

  @ApiProperty({ description: 'Account tags' })
  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @ApiProperty({ description: 'Record creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({ description: 'Created by user' })
  @Column({ name: 'created_by', length: 255 })
  createdBy: string;

  @ApiProperty({ description: 'Last updated by user' })
  @Column({ name: 'updated_by', length: 255 })
  updatedBy: string;

  // Relationships
  @OneToMany(() => Customer, (customer) => customer.id)
  customers: Customer[];

  @OneToMany(() => Opportunity, (opportunity) => opportunity.id)
  opportunities: Opportunity[];
}
