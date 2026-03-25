import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';

export enum OrderStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('sales_orders')
export class SalesOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @Column()
  customerId: string;

  @Column()
  customerName: string;

  @Column({ type: 'simple-enum', enum: OrderStatus, default: OrderStatus.DRAFT })
  status: OrderStatus;

  @Column({ type: 'timestamp' })
  orderDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column('jsonb')
  salesRep: {
    id: string;
    name: string;
    email: string;
  };

  @Column('jsonb')
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    totalPrice: number;
  }[];

  @Column('jsonb', { nullable: true })
  shipping: {
    address: string;
    method: string;
    trackingNumber?: string;
  };

  @Column('jsonb', { nullable: true })
  payment: {
    terms: string;
    method: string;
    status: string;
  };

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
