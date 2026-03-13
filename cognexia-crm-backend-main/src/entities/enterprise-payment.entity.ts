import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

export enum EnterprisePaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  WIRE = 'wire',
  CASH = 'cash',
  OTHER = 'other',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('enterprise_payments')
@Index(['organizationId', 'paymentStatus'])
@Index(['approvalStatus', 'createdAt'])
@Index(['dueDate'])
export class EnterprisePayment {
  @ApiProperty({ description: 'Payment UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  @Column()
  organizationId: string;

  @ApiProperty({ description: 'Contract number' })
  @Column({ nullable: true })
  contractNumber?: string;

  @ApiProperty({ description: 'Invoice number' })
  @Column()
  invoiceNumber: string;

  @ApiProperty({ description: 'Invoice date' })
  @Column({ type: 'timestamp' })
  invoiceDate: Date;

  @ApiProperty({ description: 'Due date' })
  @Column({ type: 'timestamp' })
  dueDate: Date;

  @ApiProperty({ description: 'Amount due' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountDue: number;

  @ApiProperty({ description: 'Amount paid' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @ApiProperty({ description: 'Currency' })
  @Column({ default: 'USD' })
  currency: string;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  @Column({ type: 'simple-enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @ApiProperty({ description: 'Payment method', enum: EnterprisePaymentMethod })
  @Column({ type: 'simple-enum', enum: EnterprisePaymentMethod, nullable: true })
  paymentMethod?: EnterprisePaymentMethod;

  @ApiProperty({ description: 'Payment reference' })
  @Column({ nullable: true })
  paymentReference?: string;

  @ApiProperty({ description: 'Payment proof URL' })
  @Column({ nullable: true })
  paymentProofUrl?: string;

  @ApiProperty({ description: 'Approval status', enum: ApprovalStatus })
  @Column({ type: 'simple-enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING })
  approvalStatus: ApprovalStatus;

  @ApiProperty({ description: 'Approved by user ID' })
  @Column({ nullable: true })
  approvedBy?: string;

  @ApiProperty({ description: 'Approved at' })
  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @ApiProperty({ description: 'Rejection reason' })
  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @ApiProperty({ description: 'Notes' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Metadata' })
  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne('Organization', 'enterprisePayments')
  @JoinColumn({ name: 'organizationId' })
  organization?: any;

  @ManyToOne('User')
  @JoinColumn({ name: 'approvedBy' })
  approver?: any;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @UpdateDateColumn()
  updatedAt: Date;
}
