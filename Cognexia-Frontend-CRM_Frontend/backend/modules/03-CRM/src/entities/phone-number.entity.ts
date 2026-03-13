import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PhoneNumberType {
  LOCAL = 'LOCAL',
  TOLL_FREE = 'TOLL_FREE',
  MOBILE = 'MOBILE',
  SHORT_CODE = 'SHORT_CODE',
}

export enum PhoneNumberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PORTING = 'PORTING',
}

export enum PhoneNumberCapability {
  VOICE = 'VOICE',
  SMS = 'SMS',
  MMS = 'MMS',
  FAX = 'FAX',
}

@Entity('phone_numbers')
@Index(['tenantId', 'status'])
export class PhoneNumber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  // Number details
  @Column({ unique: true })
  phoneNumber: string; // E.164 format: +1234567890

  @Column({ nullable: true })
  friendlyName: string;

  @Column({ type: 'simple-enum', enum: PhoneNumberType })
  type: PhoneNumberType;

  @Column({ type: 'simple-enum', enum: PhoneNumberStatus, default: PhoneNumberStatus.ACTIVE })
  status: PhoneNumberStatus;

  // Capabilities
  @Column({ type: 'simple-array' })
  capabilities: PhoneNumberCapability[];

  @Column({ type: 'boolean', default: false })
  supportsConferencing: boolean;

  @Column({ type: 'boolean', default: false })
  supportsRecording: boolean;

  // Provider details
  @Column()
  providerId: string; // VoIP provider ID

  @Column()
  providerName: string; // Twilio, Vonage, etc.

  @Column({ nullable: true })
  providerSid: string;

  // Routing
  @Column({ nullable: true })
  forwardToNumber: string;

  @Column({ nullable: true })
  queueId: string; // Linked call queue

  @Column({ nullable: true })
  assignedUserId: string; // Direct assignment to user

  @Column({ nullable: true })
  ivrMenuId: string; // IVR menu for this number

  // Geographic info
  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  // Usage & Billing
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  monthlyFee: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ type: 'timestamp', nullable: true })
  purchasedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'boolean', default: true })
  autoRenew: boolean;

  // Statistics
  @Column({ type: 'int', default: 0 })
  totalInboundCalls: number;

  @Column({ type: 'int', default: 0 })
  totalOutboundCalls: number;

  @Column({ type: 'int', default: 0 })
  totalSMSSent: number;

  @Column({ type: 'int', default: 0 })
  totalSMSReceived: number;

  // Compliance
  @Column({ type: 'boolean', default: false })
  isE911Enabled: boolean;

  @Column({ type: 'json', nullable: true })
  e911Address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Column({ type: 'boolean', default: false })
  isCALEACompliant: boolean; // Communications Assistance for Law Enforcement Act

  @Column({ type: 'simple-array', nullable: true })
  regulatoryBundles: string[];

  // Metadata
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get formattedNumber(): string {
    if (!this.phoneNumber) return '';
    // Simple US formatting: +1 (555) 123-4567
    const match = this.phoneNumber.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
    }
    return this.phoneNumber;
  }

  get totalCalls(): number {
    return this.totalInboundCalls + this.totalOutboundCalls;
  }

  get canMakeCalls(): boolean {
    return this.capabilities.includes(PhoneNumberCapability.VOICE) && 
           this.status === PhoneNumberStatus.ACTIVE;
  }

  get canSendSMS(): boolean {
    return (this.capabilities.includes(PhoneNumberCapability.SMS) || 
            this.capabilities.includes(PhoneNumberCapability.MMS)) && 
           this.status === PhoneNumberStatus.ACTIVE;
  }
}
