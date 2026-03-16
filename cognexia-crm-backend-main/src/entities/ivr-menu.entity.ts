import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum IVRActionType {
  QUEUE = 'QUEUE',
  TRANSFER = 'TRANSFER',
  VOICEMAIL = 'VOICEMAIL',
  SUBMENU = 'SUBMENU',
  HANGUP = 'HANGUP',
  GATHER_INPUT = 'GATHER_INPUT',
  PLAY_MESSAGE = 'PLAY_MESSAGE',
}

@Entity('ivr_menus')
@Index(['tenantId', 'isActive'])
export class IVRMenu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  // Menu details
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Greeting
  @Column({ nullable: true })
  greetingMessageUrl: string;

  @Column({ type: 'text', nullable: true })
  greetingText: string; // Text-to-speech fallback

  // Menu options
  @Column({ type: 'json' })
  options: Array<{
    digit: string; // 0-9, *, #
    label: string;
    action: IVRActionType;
    actionValue: string; // Queue ID, phone number, submenu ID, etc.
    description?: string;
  }>;

  // Timeout & Invalid input
  @Column({ type: 'int', default: 5 })
  timeout: number; // Seconds to wait for input

  @Column({ type: 'int', default: 3 })
  maxRetries: number;

  @Column({ nullable: true })
  timeoutMessageUrl: string;

  @Column({ nullable: true })
  invalidInputMessageUrl: string;

  @Column({ type: 'simple-enum', enum: IVRActionType, nullable: true })
  timeoutAction: IVRActionType;

  @Column({ nullable: true })
  timeoutActionValue: string;

  // Speech recognition
  @Column({ type: 'boolean', default: false })
  enableSpeechRecognition: boolean;

  @Column({ type: 'json', nullable: true })
  speechKeywords: Array<{
    keyword: string;
    matchOption: string; // Digit to match
  }>;

  // Advanced features
  @Column({ type: 'boolean', default: false })
  enableDTMFCapture: boolean; // Capture additional digits

  @Column({ type: 'int', nullable: true })
  dtmfMaxDigits: number;

  @Column({ type: 'boolean', default: false })
  enableCallback: boolean;

  @Column({ type: 'boolean', default: false })
  skipForKnownCallers: boolean; // Skip IVR for recognized numbers

  // Business hours
  @Column({ type: 'json', nullable: true })
  businessHoursOverride: {
    enabled: boolean;
    afterHoursMenuId?: string;
    afterHoursMessage?: string;
  };

  // Analytics
  @Column({ type: 'int', default: 0 })
  totalInteractions: number;

  @Column({ type: 'json', nullable: true })
  optionStats: Record<string, {
    count: number;
    lastUsed: string;
  }>;

  @Column({ type: 'int', default: 0 })
  timeoutCount: number;

  @Column({ type: 'int', default: 0 })
  invalidInputCount: number;

  // Metadata
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get averageTimeoutRate(): number {
    if (this.totalInteractions === 0) return 0;
    return (this.timeoutCount / this.totalInteractions) * 100;
  }

  get mostUsedOption(): string | null {
    if (!this.optionStats) return null;
    const entries = Object.entries(this.optionStats);
    if (entries.length === 0) return null;
    return entries.reduce((max, curr) => 
      curr[1].count > max[1].count ? curr : max
    )[0];
  }
}
