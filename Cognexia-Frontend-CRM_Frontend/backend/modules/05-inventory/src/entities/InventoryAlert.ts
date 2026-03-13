import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import { AlertType, AlertSeverity, AlertStatus } from '../enums';
import { InventoryItem } from './InventoryItem';

@Entity('inventory_alerts')
@Index(['itemId'])
@Index(['type'])
@Index(['severity'])
@Index(['status'])
@Index(['createdAt'])
@Index(['isActive'])
@Index(['resolvedAt'])
export class InventoryAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  itemId?: string;

  @Column({
    type: 'enum',
    enum: AlertType
  })
  type: AlertType;

  @Column({
    type: 'enum',
    enum: AlertSeverity
  })
  severity: AlertSeverity;

  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.ACTIVE
  })
  status: AlertStatus;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  recommendation?: string;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  threshold?: number;

  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true })
  currentValue?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  locationCode?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  warehouseCode?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Column({ type: 'json', nullable: true })
  alertData?: {
    originalQuantity?: number;
    currentQuantity?: number;
    reorderPoint?: number;
    maxStock?: number;
    leadTime?: number;
    demandRate?: number;
    costImpact?: number;
    affectedLocations?: string[];
    relatedItems?: string[];
    seasonalFactor?: number;
    forecastAccuracy?: number;
  };

  @Column({ type: 'json', nullable: true })
  alertConditions?: {
    triggerCondition?: string;
    thresholdOperator?: 'GT' | 'LT' | 'EQ' | 'GTE' | 'LTE';
    comparisonValue?: number;
    timeWindow?: number;
    frequency?: string;
    businessRules?: string[];
  };

  @Column({ type: 'varchar', length: 100, nullable: true })
  triggeredBy?: string; // User or system

  @Column({ type: 'varchar', length: 100, nullable: true })
  assignedTo?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  resolvedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @Column({ type: 'text', nullable: true })
  resolutionNotes?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  resolutionAction?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isSystemGenerated: boolean;

  @Column({ type: 'boolean', default: false })
  requiresImmedateAction: boolean;

  @Column({ type: 'boolean', default: false })
  isEscalated: boolean;

  @Column({ type: 'timestamp', nullable: true })
  escalatedAt?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  escalatedTo?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  escalationLevel?: string; // 'L1', 'L2', 'L3', etc.

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @Column({ type: 'int', default: 0 })
  reminderCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastReminderSent?: Date;

  @Column({ type: 'json', nullable: true })
  notificationChannels?: {
    email?: boolean;
    sms?: boolean;
    dashboard?: boolean;
    webhook?: boolean;
    slack?: boolean;
  };

  @Column({ type: 'json', nullable: true })
  notificationHistory?: Array<{
    timestamp: Date;
    channel: string;
    recipient: string;
    status: 'sent' | 'delivered' | 'failed';
    message?: string;
  }>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  businessImpact?: string; // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  estimatedCostImpact?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  costCenter?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  project?: string;

  @Column({ type: 'int', default: 0 })
  occurrenceCount: number;

  @Column({ type: 'timestamp', nullable: true })
  firstOccurrence?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastOccurrence?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => InventoryItem, item => item.alerts, {
    onDelete: 'CASCADE',
    nullable: true
  })
  @JoinColumn({ name: 'itemId' })
  item?: InventoryItem;

  // Business Logic Methods
  @BeforeInsert()
  @BeforeUpdate()
  calculateMetrics(): void {
    // Set first occurrence if not set
    if (!this.firstOccurrence) {
      this.firstOccurrence = new Date();
    }

    // Update last occurrence
    this.lastOccurrence = new Date();

    // Increment occurrence count
    this.occurrenceCount = (this.occurrenceCount || 0) + 1;

    // Determine business impact based on severity and cost
    this.businessImpact = this.calculateBusinessImpact();

    // Set due date if not set
    if (!this.dueDate) {
      this.dueDate = this.calculateDueDate();
    }

    // Determine if immediate action is required
    this.requiresImmedateAction = this.shouldRequireImmediateAction();
  }

  // Alert Management Methods
  acknowledge(userId: string): void {
    if (this.status === AlertStatus.ACTIVE) {
      this.status = AlertStatus.ACKNOWLEDGED;
      this.assignedTo = userId;
      this.updatedAt = new Date();
    }
  }

  resolve(userId: string, notes?: string, action?: string): void {
    this.status = AlertStatus.RESOLVED;
    this.resolvedBy = userId;
    this.resolvedAt = new Date();
    this.isActive = false;
    
    if (notes) this.resolutionNotes = notes;
    if (action) this.resolutionAction = action;
  }

  dismiss(userId: string, reason?: string): void {
    this.status = AlertStatus.DISMISSED;
    this.resolvedBy = userId;
    this.resolvedAt = new Date();
    this.isActive = false;
    
    if (reason) this.resolutionNotes = reason;
  }

  escalate(toUser: string, level?: string): void {
    this.isEscalated = true;
    this.escalatedAt = new Date();
    this.escalatedTo = toUser;
    this.assignedTo = toUser;
    
    if (level) this.escalationLevel = level;
    
    // Increase severity if escalating
    if (this.severity === AlertSeverity.LOW) {
      this.severity = AlertSeverity.MEDIUM;
    } else if (this.severity === AlertSeverity.MEDIUM) {
      this.severity = AlertSeverity.HIGH;
    }
  }

  snooze(hours: number): void {
    if (this.status === AlertStatus.ACTIVE) {
      this.status = AlertStatus.SNOOZED;
      this.dueDate = new Date(Date.now() + (hours * 60 * 60 * 1000));
    }
  }

  reactivate(): void {
    if (this.status === AlertStatus.SNOOZED || this.status === AlertStatus.DISMISSED) {
      this.status = AlertStatus.ACTIVE;
      this.isActive = true;
      this.dueDate = this.calculateDueDate();
    }
  }

  // Helper Methods
  isOverdue(): boolean {
    return this.dueDate ? new Date() > this.dueDate : false;
  }

  isResolved(): boolean {
    return this.status === AlertStatus.RESOLVED;
  }

  isDismissed(): boolean {
    return this.status === AlertStatus.DISMISSED;
  }

  isAcknowledged(): boolean {
    return this.status === AlertStatus.ACKNOWLEDGED;
  }

  isSnoozed(): boolean {
    return this.status === AlertStatus.SNOOZED;
  }

  canBeResolved(): boolean {
    return [AlertStatus.ACTIVE, AlertStatus.ACKNOWLEDGED, AlertStatus.SNOOZED].includes(this.status);
  }

  canBeEscalated(): boolean {
    return this.status === AlertStatus.ACTIVE && !this.isEscalated;
  }

  getAge(): number {
    return Date.now() - this.createdAt.getTime();
  }

  getAgeInHours(): number {
    return Math.floor(this.getAge() / (1000 * 60 * 60));
  }

  getAgeInDays(): number {
    return Math.floor(this.getAge() / (1000 * 60 * 60 * 24));
  }

  getTimeToResolve(): number | null {
    if (!this.resolvedAt) return null;
    return this.resolvedAt.getTime() - this.createdAt.getTime();
  }

  needsReminder(): boolean {
    if (!this.isActive || this.isResolved()) return false;
    
    const lastReminder = this.lastReminderSent || this.createdAt;
    const hoursSinceLastReminder = (Date.now() - lastReminder.getTime()) / (1000 * 60 * 60);
    
    // Send reminder based on severity
    const reminderInterval = this.getReminderInterval();
    return hoursSinceLastReminder >= reminderInterval;
  }

  private getReminderInterval(): number {
    switch (this.severity) {
      case AlertSeverity.CRITICAL: return 1; // Every hour
      case AlertSeverity.HIGH: return 4; // Every 4 hours
      case AlertSeverity.MEDIUM: return 12; // Every 12 hours
      case AlertSeverity.LOW: return 24; // Every day
      default: return 24;
    }
  }

  sendReminder(): void {
    this.reminderCount++;
    this.lastReminderSent = new Date();
  }

  private calculateBusinessImpact(): string {
    if (this.severity === AlertSeverity.CRITICAL) return 'CRITICAL';
    if (this.severity === AlertSeverity.HIGH) return 'HIGH';
    if (this.estimatedCostImpact && this.estimatedCostImpact > 10000) return 'HIGH';
    if (this.severity === AlertSeverity.MEDIUM) return 'MEDIUM';
    return 'LOW';
  }

  private calculateDueDate(): Date {
    const now = new Date();
    let hours = 24; // Default 24 hours

    switch (this.severity) {
      case AlertSeverity.CRITICAL:
        hours = 1;
        break;
      case AlertSeverity.HIGH:
        hours = 4;
        break;
      case AlertSeverity.MEDIUM:
        hours = 12;
        break;
      case AlertSeverity.LOW:
        hours = 24;
        break;
    }

    return new Date(now.getTime() + (hours * 60 * 60 * 1000));
  }

  private shouldRequireImmediateAction(): boolean {
    return this.severity === AlertSeverity.CRITICAL || 
           this.type === AlertType.STOCKOUT ||
           (this.estimatedCostImpact && this.estimatedCostImpact > 50000);
  }

  getAlertTypeDescription(): string {
    const typeMap = {
      [AlertType.LOW_STOCK]: 'Low Stock Level',
      [AlertType.STOCKOUT]: 'Stock Out',
      [AlertType.OVERSTOCK]: 'Overstock',
      [AlertType.REORDER_POINT]: 'Reorder Point Reached',
      [AlertType.EXPIRED]: 'Expired Inventory',
      [AlertType.NEAR_EXPIRY]: 'Near Expiry',
      [AlertType.QUALITY_ISSUE]: 'Quality Issue',
      [AlertType.PRICE_CHANGE]: 'Price Change',
      [AlertType.DEMAND_SPIKE]: 'Demand Spike',
      [AlertType.SLOW_MOVING]: 'Slow Moving',
      [AlertType.OBSOLETE]: 'Obsolete Inventory',
      [AlertType.COST_VARIANCE]: 'Cost Variance',
      [AlertType.SYSTEM_ERROR]: 'System Error'
    };
    
    return typeMap[this.type] || this.type;
  }

  getSeverityColor(): string {
    const colorMap = {
      [AlertSeverity.CRITICAL]: '#DC2626',
      [AlertSeverity.HIGH]: '#EA580C',
      [AlertSeverity.MEDIUM]: '#D97706',
      [AlertSeverity.LOW]: '#65A30D'
    };
    
    return colorMap[this.severity] || '#6B7280';
  }

  getPriorityScore(): number {
    let score = 0;
    
    // Base score from severity
    switch (this.severity) {
      case AlertSeverity.CRITICAL: score += 100; break;
      case AlertSeverity.HIGH: score += 75; break;
      case AlertSeverity.MEDIUM: score += 50; break;
      case AlertSeverity.LOW: score += 25; break;
    }
    
    // Add score for business impact
    if (this.estimatedCostImpact) {
      score += Math.min(this.estimatedCostImpact / 1000, 50);
    }
    
    // Add score for age (older alerts get higher priority)
    score += Math.min(this.getAgeInHours(), 20);
    
    // Add score for overdue alerts
    if (this.isOverdue()) {
      score += 30;
    }
    
    return score;
  }

  toJSON() {
    return {
      id: this.id,
      itemId: this.itemId,
      type: this.type,
      typeDescription: this.getAlertTypeDescription(),
      severity: this.severity,
      severityColor: this.getSeverityColor(),
      status: this.status,
      title: this.title,
      description: this.description,
      recommendation: this.recommendation,
      threshold: this.threshold,
      currentValue: this.currentValue,
      locationCode: this.locationCode,
      warehouseCode: this.warehouseCode,
      category: this.category,
      alertData: this.alertData,
      alertConditions: this.alertConditions,
      triggeredBy: this.triggeredBy,
      assignedTo: this.assignedTo,
      resolvedBy: this.resolvedBy,
      resolvedAt: this.resolvedAt,
      resolutionNotes: this.resolutionNotes,
      resolutionAction: this.resolutionAction,
      isActive: this.isActive,
      isSystemGenerated: this.isSystemGenerated,
      requiresImmedateAction: this.requiresImmedateAction,
      isEscalated: this.isEscalated,
      escalatedAt: this.escalatedAt,
      escalatedTo: this.escalatedTo,
      escalationLevel: this.escalationLevel,
      dueDate: this.dueDate,
      reminderCount: this.reminderCount,
      lastReminderSent: this.lastReminderSent,
      notificationChannels: this.notificationChannels,
      businessImpact: this.businessImpact,
      estimatedCostImpact: this.estimatedCostImpact,
      department: this.department,
      costCenter: this.costCenter,
      project: this.project,
      occurrenceCount: this.occurrenceCount,
      firstOccurrence: this.firstOccurrence,
      lastOccurrence: this.lastOccurrence,
      age: this.getAge(),
      ageInHours: this.getAgeInHours(),
      ageInDays: this.getAgeInDays(),
      isOverdue: this.isOverdue(),
      needsReminder: this.needsReminder(),
      canBeResolved: this.canBeResolved(),
      canBeEscalated: this.canBeEscalated(),
      priorityScore: this.getPriorityScore(),
      timeToResolve: this.getTimeToResolve(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
