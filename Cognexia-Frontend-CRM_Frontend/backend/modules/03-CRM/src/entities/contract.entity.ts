import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Document } from './document.entity';
import { User } from './user.entity';
import { Tenant } from './tenant.entity';

export enum ContractStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT_FOR_SIGNATURE = 'sent_for_signature',
  SIGNED = 'signed',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  RENEWED = 'renewed',
}

export enum ContractType {
  SERVICE_AGREEMENT = 'service_agreement',
  MASTER_SERVICE_AGREEMENT = 'master_service_agreement',
  SUBSCRIPTION = 'subscription',
  LICENSE = 'license',
  NDA = 'nda',
  SLA = 'sla',
  PARTNERSHIP = 'partnership',
  VENDOR = 'vendor',
  EMPLOYMENT = 'employment',
  OTHER = 'other',
}

export enum RenewalType {
  MANUAL = 'manual',
  AUTO_RENEW = 'auto_renew',
  NO_RENEWAL = 'no_renewal',
}

@Entity('crm_contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'contract_number', unique: true })
  contractNumber: string;

  @Column({ type: 'simple-enum', enum: ContractType })
  contractType: ContractType;

  @Column({ type: 'simple-enum', enum: ContractStatus, default: ContractStatus.DRAFT })
  status: ContractStatus;

  // Related entities
  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'customer_id', nullable: true })
  customerId: string;

  @OneToOne(() => Document, { nullable: true })
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @Column({ name: 'document_id', nullable: true })
  documentId: string;

  // Financial terms
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  value: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'billing_frequency', nullable: true })
  billingFrequency: string; // 'monthly', 'quarterly', 'annually', 'one-time'

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  recurringAmount: number;

  // Contract dates
  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'date', nullable: true })
  signedDate: Date;

  @Column({ type: 'date', nullable: true })
  activationDate: Date;

  @Column({ type: 'date', nullable: true })
  terminationDate: Date;

  // Renewal settings
  @Column({ type: 'simple-enum', enum: RenewalType, default: RenewalType.MANUAL })
  renewalType: RenewalType;

  @Column({ name: 'renewal_notice_days', default: 30 })
  renewalNoticeDays: number;

  @Column({ name: 'renewal_term_months', nullable: true })
  renewalTermMonths: number;

  @Column({ default: false })
  renewalReminderSent: boolean;

  // Terms and conditions
  @Column({ type: 'text', nullable: true })
  terms: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Owner and approval
  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedBy: User;

  @Column({ name: 'approved_by', nullable: true })
  approvedById: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  // Metadata
  @Column({ type: 'json', nullable: true })
  metadata: {
    customFields?: { [key: string]: any };
    attachments?: string[];
    relatedContracts?: string[];
    [key: string]: any;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
