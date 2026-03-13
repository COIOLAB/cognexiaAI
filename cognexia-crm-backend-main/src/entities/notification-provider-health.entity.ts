import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { NotificationChannel, MessagingProvider } from '../types/messaging.types';

export enum ProviderHealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  DOWN = 'DOWN',
}

@Entity('notification_provider_health')
@Index(['tenantId', 'provider', 'channel'])
export class NotificationProviderHealth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column({ type: 'simple-enum', enum: MessagingProvider })
  provider: MessagingProvider;

  @Column({ type: 'simple-enum', enum: NotificationChannel })
  channel: NotificationChannel;

  @Column({ type: 'simple-enum', enum: ProviderHealthStatus, default: ProviderHealthStatus.HEALTHY })
  status: ProviderHealthStatus;

  @Column({ type: 'int', default: 0 })
  failureCount: number;

  @Column({ type: 'int', nullable: true })
  latencyMs?: number;

  @Column({ type: 'text', nullable: true })
  lastError?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastCheckedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
