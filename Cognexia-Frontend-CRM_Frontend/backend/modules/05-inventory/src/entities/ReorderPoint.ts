import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';
import { InventoryItem } from './InventoryItem';

@Entity('reorder_points')
@Index(['itemId', 'organizationId'])
export class ReorderPoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  itemId: string;

  @Column('uuid')
  organizationId: string;

  @Column('int', { name: 'reorder_level' })
  reorderLevel: number;

  @Column('int', { name: 'reorder_quantity' })
  reorderQuantity: number;

  @Column('int', { name: 'safety_stock', default: 0 })
  safetyStock: number;

  @Column('int', { name: 'lead_time_days', default: 7 })
  leadTimeDays: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'max_cost', nullable: true })
  maxCost?: number;

  @Column('varchar', { length: 50, default: 'active' })
  status: 'active' | 'inactive' | 'suspended';

  @Column('text', { nullable: true })
  notes?: string;

  @Column('varchar', { length: 100, name: 'supplier_id', nullable: true })
  supplierId?: string;

  @Column('boolean', { name: 'auto_order', default: false })
  autoOrder: boolean;

  @Column('timestamp', { name: 'last_ordered_at', nullable: true })
  lastOrderedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => InventoryItem, item => item.reorderPoints, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'item_id' })
  item: InventoryItem;

  // Methods
  shouldReorder(currentStock: number): boolean {
    return currentStock <= this.reorderLevel;
  }

  calculateOptimalOrderQuantity(): number {
    return this.reorderQuantity;
  }

  getEstimatedDeliveryDate(): Date {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + this.leadTimeDays);
    return deliveryDate;
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  getStockoutRisk(currentStock: number): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = currentStock / this.reorderLevel;
    
    if (ratio > 1.5) return 'low';
    if (ratio > 1.0) return 'medium';
    if (ratio > 0.5) return 'high';
    return 'critical';
  }

  getCostEstimate(unitCost: number): number {
    return this.reorderQuantity * unitCost;
  }
}
