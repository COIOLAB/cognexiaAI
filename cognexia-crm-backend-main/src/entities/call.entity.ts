import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Lead } from './lead.entity';
import { User } from './user.entity';
import { CallRecording } from './call-recording.entity';

export enum CallDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export enum CallStatus {
  INITIATED = 'INITIATED',
  RINGING = 'RINGING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  MISSED = 'MISSED',
  BUSY = 'BUSY',
  FAILED = 'FAILED',
  NO_ANSWER = 'NO_ANSWER',
  VOICEMAIL = 'VOICEMAIL',
}

export enum CallDisposition {
  ANSWERED = 'ANSWERED',
  NOT_ANSWERED = 'NOT_ANSWERED',
  BUSY = 'BUSY',
  FAILED = 'FAILED',
  VOICEMAIL = 'VOICEMAIL',
  CALLBACK_REQUESTED = 'CALLBACK_REQUESTED',
  INTERESTED = 'INTERESTED',
  NOT_INTERESTED = 'NOT_INTERESTED',
  DO_NOT_CALL = 'DO_NOT_CALL',
}

@Entity('calls')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'direction'])
@Index(['tenantId', 'fromNumber'])
@Index(['tenantId', 'toNumber'])
@Index(['tenantId', 'createdAt'])
export class Call {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  // Call identification
  @Column({ unique: true })
  callSid: string; // VoIP provider call ID

  @Column({ type: 'simple-enum', enum: CallDirection })
  direction: CallDirection;

  @Column({ type: 'simple-enum', enum: CallStatus })
  status: CallStatus;

  @Column({ type: 'simple-enum', enum: CallDisposition, nullable: true })
  disposition: CallDisposition;

  // Phone numbers
  @Column()
  fromNumber: string;

  @Column()
  toNumber: string;

  @Column({ nullable: true })
  forwardedFrom: string;

  // Participants
  @Column({ nullable: true })
  customerId: string;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ nullable: true })
  leadId: string;

  @ManyToOne(() => Lead, { nullable: true })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @Column({ nullable: true })
  agentId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'agentId' })
  agent: User;

  // Call details
  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  answerTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'int', default: 0 })
  duration: number; // Total call duration in seconds

  @Column({ type: 'int', default: 0 })
  talkDuration: number; // Actual talk time in seconds

  @Column({ type: 'int', default: 0 })
  holdDuration: number; // Time on hold in seconds

  @Column({ type: 'int', default: 0 })
  ringDuration: number; // Ring time in seconds

  // Quality metrics
  @Column({ type: 'float', nullable: true })
  audioQuality: number; // 0-5 scale

  @Column({ nullable: true })
  callQuality: string; // EXCELLENT, GOOD, FAIR, POOR

  @Column({ type: 'int', nullable: true })
  jitter: number; // Network jitter in ms

  @Column({ type: 'int', nullable: true })
  latency: number; // Network latency in ms

  @Column({ type: 'float', nullable: true })
  packetLoss: number; // Packet loss percentage

  // Call content
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  transcript: string;

  // IVR & Queue
  @Column({ nullable: true })
  queueId: string;

  @Column({ type: 'int', nullable: true })
  queueWaitTime: number; // Time in queue in seconds

  @Column({ type: 'simple-array', nullable: true })
  ivrPath: string[]; // Path through IVR menu

  // Transfer & Conference
  @Column({ type: 'boolean', default: false })
  isTransferred: boolean;

  @Column({ nullable: true })
  transferredTo: string;

  @Column({ nullable: true })
  transferredFrom: string;

  @Column({ type: 'boolean', default: false })
  isConference: boolean;

  @Column({ type: 'simple-array', nullable: true })
  conferenceParticipants: string[];

  // Cost & Billing
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  cost: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  pricePerMinute: string;

  // Recordings
  @OneToMany(() => CallRecording, (recording) => recording.call)
  recordings: CallRecording[];

  // Metadata
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  voipProviderData: Record<string, any>; // Raw data from provider

  // Analytics flags
  @Column({ type: 'boolean', default: false })
  isAnalyzed: boolean;

  @Column({ type: 'json', nullable: true })
  sentimentAnalysis: {
    score: number; // -1 to 1
    magnitude: number;
    emotions: string[];
  };

  @Column({ type: 'json', nullable: true })
  keyPhrases: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get isAnswered(): boolean {
    return this.status === CallStatus.COMPLETED && this.answerTime !== null;
  }

  get isMissed(): boolean {
    return this.status === CallStatus.MISSED || this.status === CallStatus.NO_ANSWER;
  }

  get waitTime(): number {
    if (!this.startTime || !this.answerTime) return 0;
    return Math.floor((this.answerTime.getTime() - this.startTime.getTime()) / 1000);
  }

  get averageHoldTime(): number {
    if (!this.talkDuration || this.holdDuration === 0) return 0;
    return Math.floor(this.holdDuration / this.talkDuration * 100);
  }
}
