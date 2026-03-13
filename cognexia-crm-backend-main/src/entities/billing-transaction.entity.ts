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

export enum TransactionType {
  SUBSCRIPTION = 'subscription',
  ONE_TIME = 'one_time',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment',
  ADDON = 'addon',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

@Entity('billing_transactions')
@Index(['organizationId', 'createdAt'])
@Index(['transactionType', 'status'])
export class BillingTransaction {
  @ApiProperty({ description: 'Transaction UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  @Column()
  organizationId: string;

  @ApiProperty({ description: 'Transaction type', enum: TransactionType })
  @Column({ type: 'simple-enum', enum: TransactionType })
  transactionType: TransactionType;

  @ApiProperty({ description: 'Transaction status', enum: TransactionStatus })
  @Column({ type: 'simple-enum', enum: TransactionStatus })
  status: TransactionStatus;

  @ApiProperty({ description: 'Amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Currency' })
  @Column({ default: 'USD' })
  currency: string;

  @ApiProperty({ description: 'Description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Metadata' })
  @Column({ type: 'json', nullable: true })
  metadata?: any;

  @ApiProperty({ description: 'Invoice number' })
  @Column({ nullable: true })
  invoiceNumber?: string;

  @ApiProperty({ description: 'Payment method' })
  @Column({ nullable: true })
  paymentMethod?: string;

  @ApiProperty({ description: 'Total amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalAmount?: number;

  @ApiProperty({ description: 'Stripe payment intent ID' })
  @Column({ nullable: true })
  stripePaymentIntentId?: string;

  @ApiProperty({ description: 'Refund transaction ID' })
  @Column({ nullable: true })
  refundTransactionId?: string;

  @ApiProperty({ description: 'Refund reason' })
  @Column({ type: 'text', nullable: true })
  refundReason?: string;

  @ApiProperty({ description: 'Billing type', enum: ['payment_gateway', 'enterprise_manual'] })
  @Column({ type: 'varchar', default: 'payment_gateway' })
  billingType: 'payment_gateway' | 'enterprise_manual';

  @ApiProperty({ description: 'Approval status', enum: ['pending', 'approved', 'rejected', 'not_required'] })
  @Column({ type: 'varchar', default: 'not_required' })
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'not_required';

  @ApiProperty({ description: 'Approved by user ID' })
  @Column({ nullable: true })
  approvedBy?: string;

  @ApiProperty({ description: 'Approved at' })
  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @ApiProperty({ description: 'Payment proof URL' })
  @Column({ nullable: true })
  paymentProofUrl?: string;

  @ApiProperty({ description: 'Invoice URL' })
  @Column({ nullable: true })
  invoiceUrl?: string;

  @ApiProperty({ description: 'Due date' })
  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @ApiProperty({ description: 'Paid date' })
  @Column({ type: 'timestamp', nullable: true })
  paidDate?: Date;

  @ApiProperty({ description: 'Payment reference' })
  @Column({ nullable: true })
  paymentReference?: string;

  @ApiProperty({ description: 'Bank transaction ID' })
  @Column({ nullable: true })
  bankTransactionId?: string;

  @ManyToOne('Organization', 'billingTransactions')
  @JoinColumn({ name: 'organizationId' })
  organization?: any;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @UpdateDateColumn()
  updatedAt: Date;
}
