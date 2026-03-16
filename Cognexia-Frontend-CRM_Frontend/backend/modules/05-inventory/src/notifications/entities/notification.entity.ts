import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../rbac/entities/User.entity';
import { NotificationTemplate } from './notification-template.entity';
import { NotificationAudit } from './notification-audit.entity';

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WEBSOCKET = 'websocket',
  SLACK = 'slack',
  TEAMS = 'teams',
  WEBHOOK = 'webhook',
  IN_APP = 'in_app',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
  URGENT = 'urgent',
}

export enum NotificationStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  PROCESSING = 'processing',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum NotificationCategory {
  INVENTORY_ALERT = 'inventory_alert',
  STOCK_MOVEMENT = 'stock_movement',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  REORDER_POINT = 'reorder_point',
  CYCLE_COUNT = 'cycle_count',
  SECURITY_ALERT = 'security_alert',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  USER_ACTION = 'user_action',
  COMPLIANCE = 'compliance',
  AUDIT = 'audit',
  BLOCKCHAIN = 'blockchain',
  IOT_DEVICE = 'iot_device',
  AI_PREDICTION = 'ai_prediction',
  WORKFLOW = 'workflow',
  REPORT = 'report',
  MARKETING = 'marketing',
  ANNOUNCEMENT = 'announcement',
}

export interface NotificationMetadata {
  source: string;
  correlationId?: string;
  traceId?: string;
  tags: string[];
  customData: Record<string, any>;
  analytics: {
    trackOpens: boolean;
    trackClicks: boolean;
    trackConversions: boolean;
  };
  scheduling: {
    timeZone?: string;
    sendAt?: Date;
    expireAt?: Date;
    retryCount: number;
    maxRetries: number;
  };
  personalization: {
    language: string;
    locale: string;
    userSegment?: string;
  };
}

export interface NotificationDeliveryInfo {
  attempts: Array<{
    timestamp: Date;
    status: string;
    provider: string;
    response?: any;
    error?: string;
    duration: number;
  }>;
  finalStatus: NotificationStatus;
  deliveredAt?: Date;
  readAt?: Date;
  clickedAt?: Date;
  unsubscribedAt?: Date;
  providerMessageId?: string;
  providerResponse?: any;
}

export interface NotificationContent {
  subject?: string;
  title: string;
  body: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    url: string;
    contentType: string;
    size: number;
  }>;
  actions?: Array<{
    label: string;
    url: string;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
  media?: {
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
  };
}

@Entity('notifications')
@Index(['recipientId'])
@Index(['type'])
@Index(['status'])
@Index(['priority'])
@Index(['category'])
@Index(['createdAt'])
@Index(['scheduledAt'])
@Index(['correlationId'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationCategory,
  })
  category: NotificationCategory;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column()
  recipientId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @Column({ nullable: true })
  templateId?: string;

  @ManyToOne(() => NotificationTemplate, { eager: false })
  @JoinColumn({ name: 'templateId' })
  template?: NotificationTemplate;

  @Column({ type: 'json' })
  content: NotificationContent;

  @Column({ type: 'json' })
  metadata: NotificationMetadata;

  @Column({ type: 'json', nullable: true })
  deliveryInfo?: NotificationDeliveryInfo;

  @Column({ nullable: true })
  batchId?: string;

  @Column({ nullable: true })
  correlationId?: string;

  @Column({ nullable: true })
  parentNotificationId?: string;

  @ManyToOne(() => Notification, { nullable: true })
  @JoinColumn({ name: 'parentNotificationId' })
  parentNotification?: Notification;

  @OneToMany(() => Notification, notification => notification.parentNotification)
  childNotifications: Notification[];

  @Column({ nullable: true })
  recipientEmail?: string;

  @Column({ nullable: true })
  recipientPhone?: string;

  @Column({ nullable: true })
  recipientDeviceToken?: string;

  @Column({ nullable: true })
  recipientWebhookUrl?: string;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiredAt?: Date;

  @Column({ default: 0 })
  retryCount: number;

  @Column({ default: 3 })
  maxRetries: number;

  @Column({ nullable: true })
  failureReason?: string;

  @Column({ type: 'json', nullable: true })
  providerData?: Record<string, any>;

  @Column({ default: false })
  isTest: boolean;

  @Column({ default: false })
  isBulk: boolean;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => NotificationAudit, audit => audit.notification)
  auditTrail: NotificationAudit[];

  // Helper methods
  isExpired(): boolean {
    if (!this.metadata.scheduling.expireAt) return false;
    return new Date() > this.metadata.scheduling.expireAt;
  }

  canRetry(): boolean {
    return this.retryCount < this.maxRetries && 
           this.status === NotificationStatus.FAILED &&
           !this.isExpired();
  }

  shouldSendNow(): boolean {
    if (this.scheduledAt && this.scheduledAt > new Date()) {
      return false;
    }
    return this.status === NotificationStatus.PENDING ||
           this.status === NotificationStatus.QUEUED;
  }

  markAsSent(providerData?: any): void {
    this.status = NotificationStatus.SENT;
    this.sentAt = new Date();
    if (providerData) {
      this.providerData = { ...this.providerData, ...providerData };
    }
  }

  markAsDelivered(deliveryTimestamp?: Date): void {
    this.status = NotificationStatus.DELIVERED;
    this.deliveredAt = deliveryTimestamp || new Date();
  }

  markAsRead(readTimestamp?: Date): void {
    this.status = NotificationStatus.READ;
    this.readAt = readTimestamp || new Date();
  }

  markAsFailed(reason: string, shouldRetry = true): void {
    this.status = NotificationStatus.FAILED;
    this.failureReason = reason;
    
    if (shouldRetry && this.canRetry()) {
      this.retryCount++;
      // Reset to pending for retry
      this.status = NotificationStatus.PENDING;
    }
  }

  addAuditEntry(action: string, details: any, userId?: string): void {
    const audit = new NotificationAudit();
    audit.notificationId = this.id;
    audit.action = action;
    audit.details = details;
    audit.userId = userId;
    audit.timestamp = new Date();
    
    if (!this.auditTrail) {
      this.auditTrail = [];
    }
    this.auditTrail.push(audit);
  }

  getEstimatedDeliveryTime(): Date | null {
    const baseDelay = this.getBaseDelayByType();
    const priorityMultiplier = this.getPriorityMultiplier();
    const estimatedDelayMs = baseDelay * priorityMultiplier;
    
    const baseTime = this.scheduledAt || new Date();
    return new Date(baseTime.getTime() + estimatedDelayMs);
  }

  private getBaseDelayByType(): number {
    switch (this.type) {
      case NotificationType.WEBSOCKET:
      case NotificationType.IN_APP:
        return 1000; // 1 second
      case NotificationType.PUSH:
        return 5000; // 5 seconds
      case NotificationType.EMAIL:
        return 10000; // 10 seconds
      case NotificationType.SMS:
        return 15000; // 15 seconds
      case NotificationType.SLACK:
      case NotificationType.TEAMS:
        return 3000; // 3 seconds
      case NotificationType.WEBHOOK:
        return 5000; // 5 seconds
      default:
        return 10000; // 10 seconds
    }
  }

  private getPriorityMultiplier(): number {
    switch (this.priority) {
      case NotificationPriority.URGENT:
        return 0.1;
      case NotificationPriority.CRITICAL:
        return 0.3;
      case NotificationPriority.HIGH:
        return 0.5;
      case NotificationPriority.NORMAL:
        return 1.0;
      case NotificationPriority.LOW:
        return 2.0;
      default:
        return 1.0;
    }
  }

  getDeliveryChannel(): string {
    switch (this.type) {
      case NotificationType.EMAIL:
        return this.recipientEmail || 'unknown';
      case NotificationType.SMS:
        return this.recipientPhone || 'unknown';
      case NotificationType.PUSH:
        return this.recipientDeviceToken || 'unknown';
      case NotificationType.WEBHOOK:
        return this.recipientWebhookUrl || 'unknown';
      default:
        return this.recipientId;
    }
  }

  toResponseObject(): any {
    return {
      id: this.id,
      type: this.type,
      category: this.category,
      priority: this.priority,
      status: this.status,
      content: {
        title: this.content.title,
        body: this.content.body,
        subject: this.content.subject,
      },
      scheduledAt: this.scheduledAt,
      sentAt: this.sentAt,
      deliveredAt: this.deliveredAt,
      readAt: this.readAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isTest: this.isTest,
      tags: this.tags,
      estimatedDelivery: this.getEstimatedDeliveryTime(),
    };
  }
}
