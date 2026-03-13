import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { ItemCategory, ItemStatus, UnitOfMeasure } from '../enums';
import { StockTransaction } from './StockTransaction';
import { StockLocation } from './StockLocation';
import { CycleCount } from './CycleCount';
import { InventoryAdjustment } from './InventoryAdjustment';
import { InventoryAlert } from './InventoryAlert';
import { ReorderPoint } from './ReorderPoint';

@Entity('inventory_items')
@Index(['sku'], { unique: true })
@Index(['category'])
@Index(['status'])
@Index(['currentStock'])
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  sku: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ItemCategory,
    default: ItemCategory.RAW_MATERIAL
  })
  category: ItemCategory;

  @Column({
    type: 'enum',
    enum: ItemStatus,
    default: ItemStatus.ACTIVE
  })
  status: ItemStatus;

  @Column({
    type: 'enum',
    enum: UnitOfMeasure,
    default: UnitOfMeasure.PIECES
  })
  unitOfMeasure: UnitOfMeasure;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  currentStock: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  reservedStock: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  availableStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  unitCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  averageCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 })
  totalValue: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0, nullable: true })
  reorderLevel?: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  maxLevel?: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  minLevel?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  barcode?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  supplier?: string;

  @Column({ type: 'int', default: 0 })
  leadTime: number;

  @Column({ type: 'timestamp', nullable: true })
  lastTransactionDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastCycleCountDate?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  createdBy?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  updatedBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToMany(() => StockTransaction, transaction => transaction.item, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  stockTransactions: StockTransaction[];

  @OneToMany(() => StockLocation, location => location.item, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  stockLocations: StockLocation[];

  @OneToMany(() => CycleCount, cycleCount => cycleCount.item, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  cycleCountRecords: CycleCount[];

  @OneToMany(() => InventoryAdjustment, adjustment => adjustment.item, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  adjustments: InventoryAdjustment[];

  @OneToMany(() => InventoryAlert, alert => alert.item, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  alerts: InventoryAlert[];

  @OneToMany(() => ReorderPoint, reorderPoint => reorderPoint.item, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  reorderPoints: ReorderPoint[];

  // Business Logic Methods
  @BeforeInsert()
  @BeforeUpdate()
  generateIdentifier(): void {
    if (!this.sku) {
      // Generate SKU if not provided
      const timestamp = Date.now().toString().slice(-6);
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      this.sku = `${this.category.substring(0, 3).toUpperCase()}${timestamp}${randomNum}`;
    }
    
    // Calculate available stock
    this.availableStock = this.currentStock - this.reservedStock;
    
    // Calculate total value
    this.totalValue = this.currentStock * this.averageCost;
  }

  // Helper Methods
  isLowStock(): boolean {
    if (!this.reorderLevel) return false;
    return this.currentStock <= this.reorderLevel;
  }

  isOutOfStock(): boolean {
    return this.currentStock <= 0;
  }

  isOverStock(): boolean {
    if (!this.maxLevel) return false;
    return this.currentStock >= this.maxLevel;
  }

  canFulfillQuantity(quantity: number): boolean {
    return this.availableStock >= quantity;
  }

  getTurnoverRatio(annualUsage: number): number {
    if (this.averageCost <= 0) return 0;
    return annualUsage / this.averageCost;
  }

  getDaysOfSupply(dailyUsage: number): number {
    if (dailyUsage <= 0) return Infinity;
    return this.availableStock / dailyUsage;
  }

  getStockStatus(): 'HEALTHY' | 'LOW' | 'OUT_OF_STOCK' | 'OVERSTOCK' {
    if (this.isOutOfStock()) return 'OUT_OF_STOCK';
    if (this.isOverStock()) return 'OVERSTOCK';
    if (this.isLowStock()) return 'LOW';
    return 'HEALTHY';
  }

  calculateEOQ(annualDemand: number, orderCost: number, holdingCost: number): number {
    if (holdingCost <= 0) return 0;
    return Math.sqrt((2 * annualDemand * orderCost) / holdingCost);
  }

  updateAverageCost(newCost: number, quantity: number): void {
    if (this.currentStock <= 0) {
      this.averageCost = newCost;
    } else {
      const totalCost = (this.currentStock * this.averageCost) + (quantity * newCost);
      const totalQuantity = this.currentStock + quantity;
      this.averageCost = totalCost / totalQuantity;
    }
  }

  reserve(quantity: number): boolean {
    if (quantity > this.availableStock) {
      return false;
    }
    this.reservedStock += quantity;
    this.availableStock = this.currentStock - this.reservedStock;
    return true;
  }

  unreserve(quantity: number): boolean {
    if (quantity > this.reservedStock) {
      return false;
    }
    this.reservedStock -= quantity;
    this.availableStock = this.currentStock - this.reservedStock;
    return true;
  }

  toJSON() {
    return {
      id: this.id,
      sku: this.sku,
      name: this.name,
      description: this.description,
      category: this.category,
      status: this.status,
      unitOfMeasure: this.unitOfMeasure,
      currentStock: this.currentStock,
      availableStock: this.availableStock,
      reservedStock: this.reservedStock,
      unitCost: this.unitCost,
      averageCost: this.averageCost,
      totalValue: this.totalValue,
      reorderLevel: this.reorderLevel,
      maxLevel: this.maxLevel,
      minLevel: this.minLevel,
      location: this.location,
      supplier: this.supplier,
      leadTime: this.leadTime,
      stockStatus: this.getStockStatus(),
      isLowStock: this.isLowStock(),
      isOutOfStock: this.isOutOfStock(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
