/**
 * General Ledger Entry Entity
 * 
 * Core database entity for general ledger entries
 * representing financial transactions in the system.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Decimal } from 'decimal.js';

@Entity('general_ledger_entries')
@Index(['accountId', 'postingDate'])
@Index(['transactionId'])
@Index(['fiscalPeriod', 'fiscalYear'])
export class GeneralLedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  entryId: string;

  @Column({ length: 50 })
  @Index()
  transactionId: string;

  @Column({ length: 50 })
  @Index()
  accountId: string;

  @Column({ length: 20 })
  accountCode: string;

  @Column({ length: 200 })
  accountName: string;

  @Column('decimal', { precision: 15, scale: 4, default: 0 })
  debitAmount: Decimal;

  @Column('decimal', { precision: 15, scale: 4, default: 0 })
  creditAmount: Decimal;

  @Column({ length: 500 })
  description: string;

  @Column({ length: 100 })
  reference: string;

  @Column('date')
  @Index()
  postingDate: Date;

  @Column('date')
  transactionDate: Date;

  @Column({ length: 20 })
  @Index()
  fiscalPeriod: string;

  @Column('int')
  @Index()
  fiscalYear: number;

  @Column({ length: 50 })
  @Index()
  entityId: string;

  @Column({ length: 3, default: 'USD' })
  currencyCode: string;

  @Column('decimal', { precision: 10, scale: 6, default: 1 })
  exchangeRate: Decimal;

  @Column('decimal', { precision: 15, scale: 4 })
  baseAmount: Decimal;

  @Column('enum', { 
    enum: ['draft', 'posted', 'reversed', 'adjusted'],
    default: 'draft'
  })
  @Index()
  status: string;

  @Column({ length: 50 })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ length: 50, nullable: true })
  postedBy: string;

  @Column('timestamp', { nullable: true })
  postedAt: Date;

  @Column({ length: 100 })
  source: string;

  @Column({ length: 50, nullable: true })
  batchId: string;

  @Column('simple-array', { default: '' })
  tags: string[];

  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations would be added here
  // @ManyToOne(() => ChartOfAccount)
  // account: ChartOfAccount;

  // @ManyToOne(() => JournalEntry)
  // journalEntry: JournalEntry;
}
