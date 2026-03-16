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

export enum SyncStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CONFLICT = 'CONFLICT',
}

export enum SyncOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum SyncEntityType {
  CUSTOMER = 'CUSTOMER',
  LEAD = 'LEAD',
  OPPORTUNITY = 'OPPORTUNITY',
  TASK = 'TASK',
  ACTIVITY = 'ACTIVITY',
  NOTE = 'NOTE',
  CALL = 'CALL',
  CONTACT = 'CONTACT',
}

@Entity('offline_syncs')
@Index(['tenantId', 'userId'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'entityType'])
export class OfflineSync {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  // User & Device
  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  deviceId: string;

  @ManyToOne(() => MobileDevice)
  @JoinColumn({ name: 'deviceId' })
  device: MobileDevice;

  // Entity information
  @Column({ type: 'simple-enum', enum: SyncEntityType })
  entityType: SyncEntityType;

  @Column()
  entityId: string;

  @Column({ type: 'simple-enum', enum: SyncOperation })
  operation: SyncOperation;

  // Data
  @Column({ type: 'json' })
  data: Record<string, any>; // The actual data to sync

  @Column({ type: 'json', nullable: true })
  previousData: Record<string, any>; // For conflict resolution

  // Status
  @Column({ type: 'simple-enum', enum: SyncStatus, default: SyncStatus.PENDING })
  status: SyncStatus;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'int', default: 3 })
  maxRetries: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  // Timestamps
  @Column({ type: 'timestamp' })
  clientTimestamp: Date; // When the change was made on the device

  @Column({ type: 'timestamp', nullable: true })
  syncStartedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  syncCompletedAt: Date;

  // Conflict resolution
  @Column({ type: 'boolean', default: false })
  hasConflict: boolean;

  @Column({ type: 'json', nullable: true })
  conflictData: {
    serverVersion: Record<string, any>;
    clientVersion: Record<string, any>;
    conflictFields: string[];
  };

  @Column({ nullable: true })
  resolvedBy: string; // 'server', 'client', 'manual', 'merged'

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  // Versioning
  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ nullable: true })
  serverVersion: number;

  // Priority
  @Column({ type: 'int', default: 5 })
  priority: number; // 1 = highest, 10 = lowest

  // Dependencies
  @Column({ type: 'simple-array', nullable: true })
  dependsOn: string[]; // IDs of other sync items this depends on

  @Column({ type: 'boolean', default: false })
  isDependencyResolved: boolean;

  // Batch tracking
  @Column({ nullable: true })
  batchId: string; // Group related syncs

  @Column({ type: 'int', nullable: true })
  batchSequence: number;

  // Metadata
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get isCompleted(): boolean {
    return this.status === SyncStatus.COMPLETED;
  }

  get isPending(): boolean {
    return this.status === SyncStatus.PENDING && !this.hasConflict;
  }

  get needsRetry(): boolean {
    return this.status === SyncStatus.FAILED && this.retryCount < this.maxRetries;
  }

  get syncDuration(): number | null {
    if (this.syncStartedAt && this.syncCompletedAt) {
      return this.syncCompletedAt.getTime() - this.syncStartedAt.getTime();
    }
    return null;
  }
}
