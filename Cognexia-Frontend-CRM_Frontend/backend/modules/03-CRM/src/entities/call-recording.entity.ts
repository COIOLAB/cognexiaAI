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
import { Call } from './call.entity';

export enum RecordingStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DELETED = 'DELETED',
}

export enum RecordingType {
  FULL = 'FULL',
  AGENT_ONLY = 'AGENT_ONLY',
  CUSTOMER_ONLY = 'CUSTOMER_ONLY',
  HOLD_MUSIC = 'HOLD_MUSIC',
  VOICEMAIL = 'VOICEMAIL',
}

@Entity('call_recordings')
@Index(['tenantId', 'callId'])
@Index(['tenantId', 'status'])
export class CallRecording {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  // Call relationship
  @Column()
  callId: string;

  @ManyToOne(() => Call, (call) => call.recordings)
  @JoinColumn({ name: 'callId' })
  call: Call;

  // Recording details
  @Column({ unique: true })
  recordingSid: string; // VoIP provider recording ID

  @Column({ type: 'simple-enum', enum: RecordingType, default: RecordingType.FULL })
  type: RecordingType;

  @Column({ type: 'simple-enum', enum: RecordingStatus, default: RecordingStatus.PROCESSING })
  status: RecordingStatus;

  // Storage
  @Column({ nullable: true })
  url: string; // Public URL (if applicable)

  @Column({ nullable: true })
  storageUrl: string; // S3/Cloud storage URL

  @Column({ nullable: true })
  localPath: string; // Local file path

  @Column({ nullable: true })
  format: string; // mp3, wav, etc.

  @Column({ type: 'int', nullable: true })
  duration: number; // Duration in seconds

  @Column({ type: 'bigint', nullable: true })
  fileSize: number; // File size in bytes

  // Audio properties
  @Column({ nullable: true })
  bitrate: string;

  @Column({ nullable: true })
  sampleRate: string;

  @Column({ nullable: true })
  channels: string; // mono, stereo

  // Transcription
  @Column({ type: 'text', nullable: true })
  transcript: string;

  @Column({ type: 'json', nullable: true })
  transcriptData: {
    words: Array<{
      word: string;
      start: number;
      end: number;
      confidence: number;
      speaker?: string;
    }>;
    speakers?: Array<{
      id: string;
      name: string;
      duration: number;
    }>;
  };

  @Column({ type: 'float', nullable: true })
  transcriptConfidence: number; // 0-1

  @Column({ type: 'boolean', default: false })
  isTranscribed: boolean;

  // Analytics
  @Column({ type: 'json', nullable: true })
  sentimentAnalysis: {
    overall: number;
    bySegment: Array<{
      start: number;
      end: number;
      sentiment: number;
    }>;
  };

  @Column({ type: 'simple-array', nullable: true })
  keywords: string[];

  @Column({ type: 'json', nullable: true })
  speakerStats: {
    agentTalkTime: number;
    customerTalkTime: number;
    silenceTime: number;
    interruptionsCount: number;
  };

  // Compliance & Security
  @Column({ type: 'boolean', default: false })
  isEncrypted: boolean;

  @Column({ type: 'boolean', default: false })
  isPCIRedacted: boolean; // Payment card info redacted

  @Column({ type: 'boolean', default: false })
  isPIIRedacted: boolean; // Personal info redacted

  @Column({ type: 'timestamp', nullable: true })
  retentionExpiresAt: Date;

  @Column({ type: 'boolean', default: false })
  isConsentRecorded: boolean;

  // Metadata
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get durationFormatted(): string {
    if (!this.duration) return '00:00';
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  get fileSizeFormatted(): string {
    if (!this.fileSize) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
    return `${(this.fileSize / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }
}
