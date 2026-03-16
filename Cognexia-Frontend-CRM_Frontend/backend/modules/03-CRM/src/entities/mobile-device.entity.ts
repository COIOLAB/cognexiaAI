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

export enum DevicePlatform {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  WEB = 'WEB',
}

export enum DeviceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  DEREGISTERED = 'DEREGISTERED',
}

@Entity('mobile_devices')
@Index(['tenantId', 'userId'])
@Index(['tenantId', 'status'])
export class MobileDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  // User relationship
  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Device identification
  @Column({ unique: true })
  deviceId: string; // Unique device identifier

  @Column()
  deviceName: string; // User-friendly name (e.g., "John's iPhone")

  @Column({ type: 'simple-enum', enum: DevicePlatform })
  platform: DevicePlatform;

  @Column({ nullable: true })
  platformVersion: string; // iOS 17.2, Android 14, etc.

  @Column({ nullable: true })
  appVersion: string; // App version installed

  @Column({ nullable: true })
  buildNumber: string;

  // Device details
  @Column({ nullable: true })
  manufacturer: string; // Apple, Samsung, Google, etc.

  @Column({ nullable: true })
  model: string; // iPhone 15 Pro, Galaxy S23, etc.

  @Column({ nullable: true })
  screenResolution: string; // 1170x2532

  @Column({ type: 'boolean', default: false })
  isTablet: boolean;

  // Push notification
  @Column({ nullable: true })
  pushToken: string; // FCM/APNS token

  @Column({ type: 'boolean', default: true })
  pushEnabled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  pushTokenUpdatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  pushTokenExpiresAt: Date;

  @Column({ type: 'json', nullable: true })
  pushSettings: {
    enabledCategories: string[]; // calls, messages, tasks, etc.
    quietHoursStart?: string;
    quietHoursEnd?: string;
    sound?: boolean;
    vibration?: boolean;
  };

  // Network & connectivity
  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'boolean', default: false })
  isOnline: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastSeen: Date;

  @Column({ type: 'int', nullable: true })
  batteryLevel: number;

  @Column({ nullable: true })
  networkType: string;

  // Location (if permitted)
  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  @Column({ nullable: true })
  locationTimestamp: Date;

  // Status
  @Column({ type: 'simple-enum', enum: DeviceStatus, default: DeviceStatus.ACTIVE })
  status: DeviceStatus;

  @Column({ type: 'boolean', default: false })
  isJailbroken: boolean; // Security flag

  @Column({ type: 'boolean', default: false })
  isBiometricEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  isTrusted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  trustedAt: Date;

  @Column({ nullable: true })
  trustMethod: string;

  // Session tracking
  @Column({ type: 'int', default: 0 })
  sessionCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  registeredAt: Date;

  // Offline sync
  @Column({ type: 'json', nullable: true })
  offlineConfig: {
    enableOfflineMode: boolean;
    syncFrequency: number; // minutes
    maxOfflineStorage: number; // MB
    syncOnWifiOnly: boolean;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'int', default: 0 })
  pendingSyncItems: number;

  // App preferences
  @Column({ type: 'json', nullable: true })
  appPreferences: {
    theme: string; // light, dark, auto
    language: string;
    dateFormat: string;
    timeFormat: string; // 12h, 24h
    currency: string;
    notifications: Record<string, boolean>;
  };

  // Metadata
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get isActive(): boolean {
    return this.status === DeviceStatus.ACTIVE && this.isOnline;
  }

  get deviceInfo(): string {
    return `${this.manufacturer || ''} ${this.model || ''} (${this.platform})`.trim();
  }

  get needsUpdate(): boolean {
    // Simplified version check - would compare against latest version
    return false;
  }
}
