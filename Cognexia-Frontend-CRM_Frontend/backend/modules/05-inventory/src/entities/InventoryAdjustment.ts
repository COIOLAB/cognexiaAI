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
import { AdjustmentReason } from '../enums';
import { InventoryItem } from './InventoryItem';

@Entity('inventory_adjustments')
@Index(['itemId'])
@Index(['reason'])
@Index(['performedBy'])
@Index(['createdAt'])
@Index(['adjustmentQuantity'])
export class InventoryAdjustment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  itemId: string;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  adjustmentQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  quantityBefore: number;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  quantityAfter: number;

  @Column({
    type: 'enum',
    enum: AdjustmentReason
  })
  reason: AdjustmentReason;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  documentNumber?: string;

  @Column({ type: 'varchar', length: 50 })
  performedBy: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  locationCode?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  batchNumber?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serialNumber?: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  unitCost?: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  adjustmentValue?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  adjustmentMethod?: string; // 'MANUAL', 'SYSTEM', 'AUTOMATED'

  @Column({ type: 'varchar', length: 100, nullable: true })
  sourceTransaction?: string; // Related transaction that caused this adjustment

  @Column({ type: 'json', nullable: true })
  adjustmentDetails?: {
    beforePhoto?: string;
    afterPhoto?: string;
    witnesses?: string[];
    conditions?: string;
    equipment?: string;
    environment?: {
      temperature?: number;
      humidity?: number;
    };
  };

  @Column({ type: 'boolean', default: false })
  requiresApproval: boolean;

  @Column({ type: 'boolean', default: false })
  isApproved: boolean;

  @Column({ type: 'boolean', default: false })
  isSystemGenerated: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  costCenter?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  project?: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  variancePercentage?: number;

  @CreateDateColumn()
  createdAt: Date;

  // Relationships
  @ManyToOne(() => InventoryItem, item => item.adjustments, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'itemId' })
  item: InventoryItem;

  // Business Logic Methods
  @BeforeInsert()
  calculateValues(): void {
    // Calculate adjustment value
    if (this.unitCost) {
      this.adjustmentValue = this.adjustmentQuantity * this.unitCost;
    }

    // Calculate variance percentage
    if (this.quantityBefore !== 0) {
      this.variancePercentage = (this.adjustmentQuantity / this.quantityBefore) * 100;
    } else {
      this.variancePercentage = this.adjustmentQuantity > 0 ? 100 : 0;
    }

    // Determine if approval is required based on adjustment size or reason
    this.requiresApproval = this.shouldRequireApproval();
  }

  // Helper Methods
  isPositiveAdjustment(): boolean {
    return this.adjustmentQuantity > 0;
  }

  isNegativeAdjustment(): boolean {
    return this.adjustmentQuantity < 0;
  }

  isZeroAdjustment(): boolean {
    return this.adjustmentQuantity === 0;
  }

  getAdjustmentType(): 'INCREASE' | 'DECREASE' | 'NO_CHANGE' {
    if (this.adjustmentQuantity > 0) return 'INCREASE';
    if (this.adjustmentQuantity < 0) return 'DECREASE';
    return 'NO_CHANGE';
  }

  getAbsoluteAdjustment(): number {
    return Math.abs(this.adjustmentQuantity);
  }

  getAdjustmentValue(): number {
    return this.adjustmentValue || 0;
  }

  getAbsoluteAdjustmentValue(): number {
    return Math.abs(this.getAdjustmentValue());
  }

  isSignificantAdjustment(threshold: number = 10): boolean {
    return Math.abs(this.variancePercentage || 0) > threshold;
  }

  isLargeValueAdjustment(threshold: number = 1000): boolean {
    return this.getAbsoluteAdjustmentValue() > threshold;
  }

  shouldRequireApproval(): boolean {
    // Require approval for large adjustments
    if (this.isLargeValueAdjustment(5000)) return true;
    
    // Require approval for significant percentage adjustments
    if (this.isSignificantAdjustment(25)) return true;
    
    // Require approval for certain reasons
    const approvalRequiredReasons = [
      AdjustmentReason.THEFT,
      AdjustmentReason.DAMAGE,
      AdjustmentReason.WRITE_OFF
    ];
    
    if (approvalRequiredReasons.includes(this.reason)) return true;
    
    return false;
  }

  canBeApproved(): boolean {
    return this.requiresApproval && !this.isApproved && !this.approvedBy;
  }

  isPendingApproval(): boolean {
    return this.requiresApproval && !this.isApproved;
  }

  approve(approvedBy: string): void {
    if (!this.canBeApproved()) {
      throw new Error('Adjustment cannot be approved');
    }
    
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
    this.isApproved = true;
  }

  getReasonDescription(): string {
    const reasonMap = {
      [AdjustmentReason.CYCLE_COUNT]: 'Cycle Count Adjustment',
      [AdjustmentReason.PHYSICAL_COUNT]: 'Physical Count Adjustment',
      [AdjustmentReason.DAMAGE]: 'Damaged Inventory',
      [AdjustmentReason.THEFT]: 'Theft/Loss',
      [AdjustmentReason.EXPIRY]: 'Expired Inventory',
      [AdjustmentReason.SYSTEM_ERROR]: 'System Error Correction',
      [AdjustmentReason.RETURN]: 'Return Adjustment',
      [AdjustmentReason.WRITE_OFF]: 'Inventory Write-off',
      [AdjustmentReason.OTHER]: 'Other'
    };
    
    return reasonMap[this.reason] || this.reason;
  }

  getAdjustmentSummary(): string {
    const type = this.getAdjustmentType();
    const amount = this.getAbsoluteAdjustment();
    const reason = this.getReasonDescription();
    
    return `${type} of ${amount} units due to ${reason}`;
  }

  getPriority(): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (this.reason === AdjustmentReason.THEFT) return 'CRITICAL';
    if (this.isLargeValueAdjustment(10000)) return 'HIGH';
    if (this.isSignificantAdjustment(20)) return 'MEDIUM';
    return 'LOW';
  }

  requiresInvestigation(): boolean {
    return this.reason === AdjustmentReason.THEFT || 
           this.reason === AdjustmentReason.SYSTEM_ERROR ||
           this.isSignificantAdjustment(30);
  }

  getFinancialImpact(): 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' {
    const value = this.getAdjustmentValue();
    if (value > 0) return 'POSITIVE';
    if (value < 0) return 'NEGATIVE';
    return 'NEUTRAL';
  }

  toJSON() {
    return {
      id: this.id,
      itemId: this.itemId,
      adjustmentQuantity: this.adjustmentQuantity,
      quantityBefore: this.quantityBefore,
      quantityAfter: this.quantityAfter,
      reason: this.reason,
      reasonDescription: this.getReasonDescription(),
      notes: this.notes,
      referenceId: this.referenceId,
      documentNumber: this.documentNumber,
      performedBy: this.performedBy,
      approvedBy: this.approvedBy,
      approvedAt: this.approvedAt,
      locationCode: this.locationCode,
      batchNumber: this.batchNumber,
      serialNumber: this.serialNumber,
      unitCost: this.unitCost,
      adjustmentValue: this.adjustmentValue,
      adjustmentMethod: this.adjustmentMethod,
      sourceTransaction: this.sourceTransaction,
      adjustmentDetails: this.adjustmentDetails,
      requiresApproval: this.requiresApproval,
      isApproved: this.isApproved,
      isSystemGenerated: this.isSystemGenerated,
      costCenter: this.costCenter,
      department: this.department,
      project: this.project,
      variancePercentage: this.variancePercentage,
      adjustmentType: this.getAdjustmentType(),
      absoluteAdjustment: this.getAbsoluteAdjustment(),
      absoluteAdjustmentValue: this.getAbsoluteAdjustmentValue(),
      isSignificant: this.isSignificantAdjustment(),
      isLargeValue: this.isLargeValueAdjustment(),
      priority: this.getPriority(),
      requiresInvestigation: this.requiresInvestigation(),
      financialImpact: this.getFinancialImpact(),
      adjustmentSummary: this.getAdjustmentSummary(),
      canBeApproved: this.canBeApproved(),
      isPendingApproval: this.isPendingApproval(),
      createdAt: this.createdAt
    };
  }
}
