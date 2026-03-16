import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum QueueStrategy {
  ROUND_ROBIN = 'ROUND_ROBIN',
  LONGEST_IDLE = 'LONGEST_IDLE',
  MOST_IDLE = 'MOST_IDLE',
  RING_ALL = 'RING_ALL',
  SKILL_BASED = 'SKILL_BASED',
  PRIORITY = 'PRIORITY',
}

@Entity('call_queues')
@Index(['tenantId', 'isActive'])
export class CallQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  // Queue details
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Routing strategy
  @Column({ type: 'simple-enum', enum: QueueStrategy, default: QueueStrategy.ROUND_ROBIN })
  routingStrategy: QueueStrategy;

  @Column({ type: 'int', default: 1 })
  priority: number; // Higher priority queues get agents first

  // Capacity settings
  @Column({ type: 'int', default: 100 })
  maxQueueSize: number;

  @Column({ type: 'int', default: 300 })
  maxWaitTime: number; // Maximum wait time in seconds

  @Column({ type: 'int', default: 30 })
  ringTimeout: number; // Ring timeout per agent in seconds

  // Agents
  @ManyToMany(() => User)
  @JoinTable({
    name: 'queue_agents',
    joinColumn: { name: 'queueId' },
    inverseJoinColumn: { name: 'agentId' },
  })
  agents: User[];

  @Column({ type: 'simple-array', nullable: true })
  requiredSkills: string[]; // For skill-based routing

  // Business hours
  @Column({ type: 'json', nullable: true })
  businessHours: {
    monday?: { start: string; end: string; closed?: boolean };
    tuesday?: { start: string; end: string; closed?: boolean };
    wednesday?: { start: string; end: string; closed?: boolean };
    thursday?: { start: string; end: string; closed?: boolean };
    friday?: { start: string; end: string; closed?: boolean };
    saturday?: { start: string; end: string; closed?: boolean };
    sunday?: { start: string; end: string; closed?: boolean };
    timezone?: string;
  };

  @Column({ type: 'simple-array', nullable: true })
  holidays: string[]; // ISO date strings

  // Music & Messages
  @Column({ nullable: true })
  holdMusicUrl: string;

  @Column({ nullable: true })
  greetingMessageUrl: string;

  @Column({ nullable: true })
  queueFullMessageUrl: string;

  @Column({ nullable: true })
  afterHoursMessageUrl: string;

  @Column({ type: 'simple-array', nullable: true })
  periodicAnnouncements: string[]; // URLs of announcements

  @Column({ type: 'int', nullable: true })
  announcementInterval: number; // Interval in seconds

  // Overflow & Fallback
  @Column({ nullable: true })
  overflowQueueId: string; // Overflow to another queue

  @Column({ nullable: true })
  fallbackNumber: string; // Forward to number if no agents

  @Column({ type: 'boolean', default: false })
  enableVoicemail: boolean;

  @Column({ nullable: true })
  voicemailGreeting: string;

  // Callback
  @Column({ type: 'boolean', default: false })
  enableCallback: boolean;

  @Column({ type: 'int', nullable: true })
  callbackEstimatedWait: number; // Estimated callback time in minutes

  // Statistics (cached)
  @Column({ type: 'int', default: 0 })
  currentQueueSize: number;

  @Column({ type: 'int', default: 0 })
  totalCallsToday: number;

  @Column({ type: 'int', default: 0 })
  totalCallsHandled: number;

  @Column({ type: 'int', default: 0 })
  totalCallsAbandoned: number;

  @Column({ type: 'float', default: 0 })
  averageWaitTime: number;

  @Column({ type: 'float', default: 0 })
  averageHandleTime: number;

  @Column({ type: 'float', default: 0 })
  serviceLevelPercentage: number; // % answered within threshold

  @Column({ type: 'int', default: 20 })
  serviceLevelThreshold: number; // Threshold in seconds

  // Metadata
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get abandonmentRate(): number {
    if (this.totalCallsHandled === 0) return 0;
    return (this.totalCallsAbandoned / (this.totalCallsHandled + this.totalCallsAbandoned)) * 100;
  }

  get isWithinBusinessHours(): boolean {
    // Simplified - would need timezone logic
    return true;
  }

  get isFull(): boolean {
    return this.currentQueueSize >= this.maxQueueSize;
  }
}
