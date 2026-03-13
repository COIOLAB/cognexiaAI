import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum DeliveryStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('webhook_deliveries')
export class WebhookDelivery {
  @ApiProperty({ description: 'Delivery UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Webhook ID' })
  @Column()
  webhookId: string;

  @ApiProperty({ description: 'Event type' })
  @Column()
  eventType: string;

  @ApiProperty({ description: 'Status', enum: DeliveryStatus })
  @Column({ type: 'simple-enum', enum: DeliveryStatus, default: DeliveryStatus.PENDING })
  status: DeliveryStatus;

  @ApiProperty({ description: 'Response code' })
  @Column({ nullable: true })
  responseCode?: number;

  @ApiProperty({ description: 'Response body' })
  @Column({ type: 'text', nullable: true })
  responseBody?: string;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;
}
