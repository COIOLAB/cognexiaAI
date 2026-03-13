import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { MobileDevice } from './mobile-device.entity';
import { NotificationChannel } from '../types/messaging.types';

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CLICKED = 'CLICKED',
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum NotificationCategory {
  TASK = 'TASK',
  CALL = 'CALL',
  MESSAGE = 'MESSAGE',
  LEAD = 'LEAD',
  OPPORTUNITY = 'OPPORTUNITY',
  MEETING = 'MEETING',
  ALERT = 'ALERT',
  SYSTEM = 'SYSTEM',
}

@Entity('push_notifications')
@Index(['tenantId', 'userId'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'category'])
export class PushNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  // Recipient
  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  deviceId: string;

  @ManyToOne(() => MobileDevice, { nullable: true })
  @JoinColumn({ name: 'deviceId' })
  device: MobileDevice;

  // Notification content
  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  iconUrl: string;

  @Column({ type: 'simple-enum', enum: NotificationCategory })
  category: NotificationCategory;

  @Column({ type: 'simple-enum', enum: NotificationChannel, default: NotificationChannel.PUSH, nullable: true })
  channel?: NotificationChannel;

  @Column({ type: 'simple-enum', enum: NotificationPriority, default: NotificationPriority.NORMAL })
  priority: NotificationPriority;

  // Action & navigation
  @Column({ nullable: true })
  action: string; // OPEN_TASK, OPEN_CALL, OPEN_LEAD, etc.

  @Column({ type: 'json', nullable: true })
  data: Record<string, any>; // Additional data for navigation

  @Column({ nullable: true })
  deepLink: string; // crm://tasks/123

  // Behavior
  @Column({ type: 'boolean', default: true })
  sound: boolean;

  @Column({ type: 'boolean', default: true })
  vibration: boolean;

  @Column({ nullable: true })
  badgeCount: number;

  @Column({ type: 'int', nullable: true })
  ttl: number; // Time to live in seconds

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  // Status tracking
  @Column({ type: 'simple-enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  clickedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  dismissedAt: Date;

  // Provider tracking
  @Column({ nullable: true })
  providerId: string; // FCM/APNS message ID

  @Column({ nullable: true })
  providerResponse: string;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'int', default: 3 })
  maxRetries: number;

  // Grouping & threading
  @Column({ nullable: true })
  threadId: string; // Group related notifications

  @Column({ nullable: true })
  collapseKey: string; // Replace previous notification

  // Scheduling
  @Column({ type: 'timestamp', nullable: true })
  scheduledFor: Date;

  @Column({ type: 'boolean', default: false })
  isScheduled: boolean;

  // Analytics
  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'json', nullable: true })
  analytics: {
    deliveryTime?: number; // ms
    clickTime?: number; // ms from delivery
    devicePlatform?: string;
    appVersion?: string;
  };

  // Metadata
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get isDelivered(): boolean {
    return this.status === NotificationStatus.DELIVERED || this.status === NotificationStatus.CLICKED;
  }

  get wasClicked(): boolean {
    return this.status === NotificationStatus.CLICKED;
  }

  get hasFailed(): boolean {
    return this.status === NotificationStatus.FAILED;
  }

  get deliveryDuration(): number | null {
    if (this.sentAt && this.deliveredAt) {
      return this.deliveredAt.getTime() - this.sentAt.getTime();
    }
    return null;
  }
}
