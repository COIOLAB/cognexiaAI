import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert
} from 'typeorm';
import { TransactionType, TransactionReason } from '../enums';
import { InventoryItem } from './InventoryItem';

@Entity('stock_transactions')
@Index(['itemId'])
@Index(['type'])
@Index(['reason'])
@Index(['createdAt'])
@Index(['performedBy'])
export class StockTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  itemId: string;

  @Column({
    type: 'enum',
    enum: TransactionType
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  balanceAfter: number;

  @Column({
    type: 'enum',
    enum: TransactionReason
  })
  reason: TransactionReason;

  @Column({ type: 'varchar', length: 100, nullable: true })
  locationCode?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  batchNumber?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serialNumber?: string;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceId?: string;

  @Column({ type: 'varchar', length: 50 })
  performedBy: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  unitCost?: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  totalCost?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  documentNumber?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  supplierReference?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  customerReference?: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relationships
  @ManyToOne(() => InventoryItem, item => item.stockTransactions, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'itemId' })
  item: InventoryItem;

  // Business Logic Methods
  @BeforeInsert()
  calculateTotalCost(): void {
    if (this.unitCost) {
      this.totalCost = this.quantity * this.unitCost;
    }
  }

  // Helper Methods
  isInbound(): boolean {
    return this.type === TransactionType.INBOUND;
  }

  isOutbound(): boolean {
    return this.type === TransactionType.OUTBOUND;
  }

  getTransactionValue(): number {
    return this.totalCost || 0;
  }

  isAdjustment(): boolean {
    return this.reason === TransactionReason.ADJUSTMENT;
  }

  isCycleCount(): boolean {
    return this.reason === TransactionReason.CYCLE_COUNT;
  }

  isPurchaseRelated(): boolean {
    return this.reason === TransactionReason.PURCHASE;
  }

  isSaleRelated(): boolean {
    return this.reason === TransactionReason.SALE;
  }

  isProductionRelated(): boolean {
    return this.reason === TransactionReason.PRODUCTION;
  }

  getImpactDescription(): string {
    const direction = this.isInbound() ? 'increased' : 'decreased';
    const reason = this.reason.toLowerCase().replace('_', ' ');
    return `Stock ${direction} by ${this.quantity} due to ${reason}`;
  }

  toJSON() {
    return {
      id: this.id,
      itemId: this.itemId,
      type: this.type,
      quantity: this.quantity,
      balanceAfter: this.balanceAfter,
      reason: this.reason,
      locationCode: this.locationCode,
      batchNumber: this.batchNumber,
      serialNumber: this.serialNumber,
      expiryDate: this.expiryDate,
      notes: this.notes,
      referenceId: this.referenceId,
      performedBy: this.performedBy,
      unitCost: this.unitCost,
      totalCost: this.totalCost,
      documentNumber: this.documentNumber,
      supplierReference: this.supplierReference,
      customerReference: this.customerReference,
      createdAt: this.createdAt,
      isInbound: this.isInbound(),
      isOutbound: this.isOutbound(),
      transactionValue: this.getTransactionValue(),
      impactDescription: this.getImpactDescription()
    };
  }
}
