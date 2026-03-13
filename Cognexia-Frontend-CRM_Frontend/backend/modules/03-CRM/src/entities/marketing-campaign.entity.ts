import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { Customer } from './customer.entity';
import { CustomerSegment } from './customer-segment.entity';

export enum CampaignType {
  EMAIL = 'email',
  SMS = 'sms',
  SOCIAL_MEDIA = 'social_media',
  DISPLAY_ADS = 'display_ads',
  CONTENT_MARKETING = 'content_marketing',
  WEBINAR = 'webinar',
  MIXED = 'mixed',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('marketing_campaigns')
@Index(['status', 'type'])
@Index(['startDate', 'endDate'])
export class MarketingCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  @Index()
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'simple-enum',
    enum: CampaignType,
    default: CampaignType.EMAIL,
  })
  type: CampaignType;

  @Column({
    type: 'simple-enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  budget: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  spentAmount: number;

  @Column('json', { nullable: true })
  objectives: {
    reach?: number;
    engagement?: number;
    conversions?: number;
    roi?: number;
  };

  @Column('json', { nullable: true })
  content: {
    subject?: string;
    body?: string;
    images?: string[];
    ctaText?: string;
    ctaLink?: string;
  };

  @Column('json', { nullable: true })
  targeting: {
    demographics?: any;
    interests?: string[];
    behaviors?: string[];
    customAudiences?: string[];
  };

  @Column('json', { nullable: true })
  metrics: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    emailOpens?: number;
    emailClicks?: number;
    unsubscribes?: number;
    bounces?: number;
    roi?: number;
  };

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ length: 255, nullable: true })
  createdBy: string;

  @Column({ length: 255, nullable: true })
  updatedBy: string;

  @ManyToMany(() => CustomerSegment, (segment) => segment.campaigns)
  @JoinTable({
    name: 'campaign_segments',
    joinColumn: { name: 'campaignId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'segmentId', referencedColumnName: 'id' },
  })
  targetSegments: CustomerSegment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
