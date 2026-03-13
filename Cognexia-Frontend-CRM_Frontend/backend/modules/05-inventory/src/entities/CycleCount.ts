import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert
} from 'typeorm';
import { CycleCountStatus } from '../enums';
import { InventoryItem } from './InventoryItem';

@Entity('cycle_counts')
@Index(['itemId'])
@Index(['status'])
@Index(['scheduledDate'])
@Index(['createdBy'])
@Index(['completedAt'])
export class CycleCount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  itemId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  locationCode?: string;

  @Column({
    type: 'enum',
    enum: CycleCountStatus,
    default: CycleCountStatus.PENDING
  })
  status: CycleCountStatus;

  @Column({ type: 'decimal', precision: 12, scale: 4 })
  expectedQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  actualQuantity?: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, default: 0 })
  variance: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 })
  variancePercentage: number;

  @Column({ type: 'timestamp', nullable: true })
  scheduledDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'varchar', length: 50 })
  createdBy: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  countedBy?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  completedBy?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  approvedBy?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  countType?: string; // 'FULL', 'SPOT', 'ABC', 'PERPETUAL'

  @Column({ type: 'int', default: 1 })
  countSequence: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  countReason?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  batchNumber?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serialNumber?: string;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  unitCost?: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  varianceValue?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  countMethod?: string; // 'MANUAL', 'BARCODE', 'RFID'

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceUsed?: string;

  @Column({ type: 'json', nullable: true })
  countDetails?: {
    temperature?: number;
    humidity?: number;
    conditions?: string;
    photos?: string[];
    witnesses?: string[];
  };

  @Column({ type: 'boolean', default: false })
  requiresRecount: boolean;

  @Column({ type: 'boolean', default: false })
  isRecounted: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  recountReason?: string;

  @Column({ type: 'int', default: 1 })
  countAttempt: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => InventoryItem, item => item.cycleCountRecords, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'itemId' })
  item: InventoryItem;

  // Business Logic Methods
  @BeforeInsert()
  calculateVariance(): void {
    if (this.actualQuantity !== undefined && this.actualQuantity !== null) {
      this.variance = this.actualQuantity - this.expectedQuantity;
      
      if (this.expectedQuantity !== 0) {
        this.variancePercentage = (this.variance / this.expectedQuantity) * 100;
      } else {
        this.variancePercentage = this.actualQuantity > 0 ? 100 : 0;
      }

      if (this.unitCost) {
        this.varianceValue = this.variance * this.unitCost;
      }
    }
  }

  // Helper Methods
  isPending(): boolean {
    return this.status === CycleCountStatus.PENDING;
  }

  isInProgress(): boolean {
    return this.status === CycleCountStatus.IN_PROGRESS;
  }

  isCompleted(): boolean {
    return this.status === CycleCountStatus.COMPLETED;
  }

  isCancelled(): boolean {
    return this.status === CycleCountStatus.CANCELLED;
  }

  hasVariance(): boolean {
    return this.variance !== 0;
  }

  hasPositiveVariance(): boolean {
    return this.variance > 0;
  }

  hasNegativeVariance(): boolean {
    return this.variance < 0;
  }

  isSignificantVariance(threshold: number = 5): boolean {
    return Math.abs(this.variancePercentage) > threshold;
  }

  getDaysOverdue(): number {
    if (!this.scheduledDate || this.isCompleted()) return 0;
    
    const today = new Date();
    const scheduled = new Date(this.scheduledDate);
    const diffTime = today.getTime() - scheduled.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  isOverdue(): boolean {
    return this.getDaysOverdue() > 0;
  }

  getCountDuration(): number | null {
    if (!this.startedAt || !this.completedAt) return null;
    
    const duration = this.completedAt.getTime() - this.startedAt.getTime();
    return Math.round(duration / (1000 * 60)); // Return duration in minutes
  }

  getVarianceSeverity(): 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const absVariancePercent = Math.abs(this.variancePercentage);
    
    if (absVariancePercent === 0) return 'NONE';
    if (absVariancePercent < 2) return 'LOW';
    if (absVariancePercent < 5) return 'MEDIUM';
    if (absVariancePercent < 10) return 'HIGH';
    return 'CRITICAL';
  }

  getPriority(): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
    if (this.isOverdue()) {
      const daysOverdue = this.getDaysOverdue();
      if (daysOverdue > 30) return 'URGENT';
      if (daysOverdue > 7) return 'HIGH';
      return 'MEDIUM';
    }
    
    return 'LOW';
  }

  canBeCompleted(): boolean {
    return this.isPending() || this.isInProgress();
  }

  canBeCancelled(): boolean {
    return this.isPending() || this.isInProgress();
  }

  needsApproval(): boolean {
    return this.isCompleted() && this.hasVariance() && !this.approvedBy;
  }

  complete(actualQuantity: number, countedBy: string, notes?: string): void {
    this.actualQuantity = actualQuantity;
    this.countedBy = countedBy;
    this.completedBy = countedBy;
    this.completedAt = new Date();
    this.status = CycleCountStatus.COMPLETED;
    
    if (notes) {
      this.notes = notes;
    }
    
    this.calculateVariance();
  }

  start(countedBy: string): void {
    this.status = CycleCountStatus.IN_PROGRESS;
    this.countedBy = countedBy;
    this.startedAt = new Date();
  }

  cancel(reason?: string): void {
    this.status = CycleCountStatus.CANCELLED;
    if (reason) {
      this.notes = this.notes ? `${this.notes}\nCancelled: ${reason}` : `Cancelled: ${reason}`;
    }
  }

  approve(approvedBy: string): void {
    this.approvedBy = approvedBy;
  }

  scheduleRecount(reason: string): void {
    this.requiresRecount = true;
    this.recountReason = reason;
    this.countAttempt += 1;
  }

  toJSON() {
    return {
      id: this.id,
      itemId: this.itemId,
      locationCode: this.locationCode,
      status: this.status,
      expectedQuantity: this.expectedQuantity,
      actualQuantity: this.actualQuantity,
      variance: this.variance,
      variancePercentage: this.variancePercentage,
      varianceValue: this.varianceValue,
      scheduledDate: this.scheduledDate,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      createdBy: this.createdBy,
      countedBy: this.countedBy,
      completedBy: this.completedBy,
      approvedBy: this.approvedBy,
      notes: this.notes,
      countType: this.countType,
      countSequence: this.countSequence,
      countReason: this.countReason,
      batchNumber: this.batchNumber,
      serialNumber: this.serialNumber,
      expiryDate: this.expiryDate,
      countMethod: this.countMethod,
      deviceUsed: this.deviceUsed,
      countDetails: this.countDetails,
      requiresRecount: this.requiresRecount,
      isRecounted: this.isRecounted,
      recountReason: this.recountReason,
      countAttempt: this.countAttempt,
      hasVariance: this.hasVariance(),
      hasPositiveVariance: this.hasPositiveVariance(),
      hasNegativeVariance: this.hasNegativeVariance(),
      varianceSeverity: this.getVarianceSeverity(),
      priority: this.getPriority(),
      isOverdue: this.isOverdue(),
      daysOverdue: this.getDaysOverdue(),
      countDuration: this.getCountDuration(),
      needsApproval: this.needsApproval(),
      canBeCompleted: this.canBeCompleted(),
      canBeCancelled: this.canBeCancelled(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
