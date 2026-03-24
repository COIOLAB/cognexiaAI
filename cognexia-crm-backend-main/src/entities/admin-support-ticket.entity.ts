import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TicketPriority { LOW = 'low', MEDIUM = 'medium', HIGH = 'high', URGENT = 'urgent' }
export enum TicketStatus { OPEN = 'open', IN_PROGRESS = 'in_progress', RESOLVED = 'resolved', CLOSED = 'closed' }

@Entity('admin_support_tickets')
export class AdminSupportTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  organizationId: string;

  @Column('uuid', { nullable: true })
  userId: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Column('uuid', { nullable: true })
  assignedTo: string;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  resolutionTimeHours: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
