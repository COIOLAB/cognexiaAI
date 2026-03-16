import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Organization } from './organization.entity';

@Entity('invoices')
@Index(['organization_id', 'invoice_date'])
@Index(['status', 'due_date'])
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_number', type: 'varchar', length: 50, unique: true })
  invoice_number: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organization_id: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'invoice_date', type: 'date' })
  invoice_date: Date;

  @Column({ name: 'due_date', type: 'date' })
  due_date: Date;

  @Column({ name: 'subtotal', type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax_amount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  total_amount: number;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';

  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true })
  payment_method?: string;

  @Column({ name: 'payment_date', type: 'timestamp', nullable: true })
  payment_date?: Date;

  @Column({ type: 'json' })
  line_items: {
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }[];

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'pdf_url', type: 'varchar', length: 500, nullable: true })
  pdf_url?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
