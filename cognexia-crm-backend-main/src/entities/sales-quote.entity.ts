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
import { Customer } from './customer.entity';
import { Opportunity } from './opportunity.entity';

export enum QuoteStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  REVISED = 'revised',
}

@Entity('crm_sales_quotes')
@Index(['quoteNumber'], { unique: true })
@Index(['status'])
@Index(['customerId'])
@Index(['opportunityId'])
export class SalesQuote {
  @ApiProperty({ description: 'Quote UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Unique quote number' })
  @Column({ unique: true, length: 50 })
  quoteNumber: string;

  @ApiProperty({ description: 'Quote title' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Quote status', enum: QuoteStatus })
  @Column({ type: 'simple-enum', enum: QuoteStatus, default: QuoteStatus.DRAFT })
  status: QuoteStatus;

  @ApiProperty({ description: 'Quote valid until date' })
  @Column({ type: 'date' })
  validUntil: Date;

  @ApiProperty({ description: 'Quote line items', type: 'object' })
  @Column({ type: 'json' })
  lineItems: Array<{
    productId: string;
    productName: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
  }>;

  @ApiProperty({ description: 'Quote totals', type: 'object' })
  @Column({ type: 'json' })
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  };

  @ApiProperty({ description: 'Terms and conditions' })
  @Column({ type: 'text', nullable: true })
  terms?: string;

  @ApiProperty({ description: 'Quote notes' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

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
  @ManyToOne(() => Customer, (customer) => customer.quotes)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ApiProperty({ description: 'Associated customer ID' })
  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Opportunity, (opportunity) => opportunity.quotes, { nullable: true })
  @JoinColumn({ name: 'opportunity_id' })
  opportunity?: Opportunity;

  @ApiProperty({ description: 'Associated opportunity ID' })
  @Column({ name: 'opportunity_id', nullable: true })
  opportunityId?: string;
}
