import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum WebhookEventType {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  ORGANIZATION_CREATED = 'organization.created',
}

export enum WebhookStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  FAILED = 'failed',
  PENDING = 'pending',
}

@Entity('webhooks')
export class Webhook {
  @ApiProperty({ description: 'Webhook UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  @Column()
  organizationId: string;

  @ApiProperty({ description: 'URL' })
  @Column()
  url: string;

  @ApiProperty({ description: 'Event types' })
  @Column({ type: 'json' })
  eventTypes: WebhookEventType[];

  @ApiProperty({ description: 'Is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Secret' })
  @Column()
  secret: string;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @UpdateDateColumn()
  updatedAt: Date;
}
