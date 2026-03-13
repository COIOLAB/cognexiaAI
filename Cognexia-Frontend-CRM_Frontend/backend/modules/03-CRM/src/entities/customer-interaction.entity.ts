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
import { ApiProperty } from '@nestjs/swagger';
import { Customer } from './customer.entity';
import { User } from './user.entity';
import { Contact } from './contact.entity';

export enum InteractionType {
  EMAIL = 'email',
  PHONE_CALL = 'phone_call',
  VIDEO_CALL = 'video_call',
  MEETING = 'meeting',
  TEXT_MESSAGE = 'text_message',
  SOCIAL_MEDIA = 'social_media',
  WEBINAR = 'webinar',
  DEMO = 'demo',
  PROPOSAL = 'proposal',
  CONTRACT = 'contract',
  SUPPORT_TICKET = 'support_ticket',
  OTHER = 'other',
}

export enum InteractionDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  MUTUAL = 'mutual',
}

export enum InteractionOutcome {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
  NO_RESPONSE = 'no_response',
}

@Entity('crm_customer_interactions')
@Index(['customerId'])
@Index(['contactId'])
@Index(['type'])
@Index(['date'])
export class CustomerInteraction {
  @ApiProperty({ description: 'Interaction UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Interaction type', enum: InteractionType })
  @Column({ type: 'simple-enum', enum: InteractionType })
  type: InteractionType;

  @ApiProperty({ description: 'Interaction direction', enum: InteractionDirection })
  @Column({ type: 'simple-enum', enum: InteractionDirection })
  direction: InteractionDirection;

  @ApiProperty({ description: 'Interaction subject' })
  @Column({ length: 255 })
  subject: string;

  @ApiProperty({ description: 'Interaction description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Interaction date' })
  @Column({ type: 'timestamp' })
  date: Date;

  @ApiProperty({ description: 'Duration in minutes' })
  @Column({ type: 'int', nullable: true })
  duration?: number;

  @ApiProperty({ description: 'Interaction outcome', enum: InteractionOutcome })
  @Column({ type: 'simple-enum', enum: InteractionOutcome })
  outcome: InteractionOutcome;

  @ApiProperty({ description: 'Next action required' })
  @Column({ length: 500, nullable: true })
  nextAction?: string;

  @ApiProperty({ description: 'Location of interaction' })
  @Column({ length: 255, nullable: true })
  location?: string;

  @ApiProperty({ description: 'Participants in interaction', type: 'array' })
  @Column({ type: 'json', nullable: true })
  participants?: Array<{
    name: string;
    role: string;
    type: 'internal' | 'customer';
  }>;

  @ApiProperty({ description: 'Attachments/files', type: 'array' })
  @Column({ type: 'text', array: true, default: [] })
  attachments: string[];

  @ApiProperty({ description: 'Interaction tags' })
  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @ApiProperty({ description: 'Detailed notes' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ description: 'Record creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({ description: 'Created by user' })
  @Column({ name: 'created_by', length: 255 })
  createdBy: string;

  @ApiProperty({ description: 'Last updated by user' })
  @Column({ name: 'updated_by', length: 255 })
  updatedBy: string;

  // Relationships
  @ManyToOne(() => Customer, (customer) => customer.interactions)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ApiProperty({ description: 'Associated customer ID' })
  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Contact, (contact) => contact.interactions, { nullable: true })
  @JoinColumn({ name: 'contact_id' })
  contact?: Contact;

  @ApiProperty({ description: 'Associated contact ID' })
  @Column({ name: 'contact_id', nullable: true })
  contactId?: string;

  @ManyToOne(() => User, (user) => user.interactions, { nullable: true })
  @JoinColumn({ name: 'assigned_user_id' })
  assignedUser?: User;

  @ApiProperty({ description: 'Assigned user ID' })
  @Column({ name: 'assigned_user_id', nullable: true })
  assignedUserId?: string;
}
