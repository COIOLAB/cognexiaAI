import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Organization } from './organization.entity';

export enum TransactionType {
  SUBSCRIPTION = 'subscription',
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade',
  REFUND = 'refund',
  PAYMENT_FAILED = 'payment_failed',
  INVOICE = 'invoice',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('revenue_transactions')
export class RevenueTransaction {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ApiProperty({ enum: TransactionType })
  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @ApiProperty({ enum: TransactionStatus })
  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @ApiProperty()
  @Column({ length: 3, default: 'USD' })
  currency: string;

  @ApiProperty()
  @Column({ nullable: true })
  stripePaymentId: string;

  @ApiProperty()
  @Column({ nullable: true })
  stripeInvoiceId: string;

  @ApiProperty()
  @Column({ nullable: true })
  paypalTransactionId: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @ApiProperty()
  @Column({ nullable: true })
  failureReason: string;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  refundedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
