import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { NotificationChannel } from '../types/messaging.types';

@Entity('notification_templates')
@Index(['tenantId', 'name'])
@Index(['tenantId', 'locale'])
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column()
  name: string;

  @Column({ default: 'en-US' })
  locale: string;

  @Column({ type: 'simple-enum', enum: NotificationChannel, nullable: true })
  channel?: NotificationChannel;

  @Column({ type: 'text' })
  titleTemplate: string;

  @Column({ type: 'text' })
  bodyTemplate: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
