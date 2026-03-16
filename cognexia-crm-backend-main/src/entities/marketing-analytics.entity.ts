import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { MarketingCampaign } from './marketing-campaign.entity';
import { CustomerSegment } from './customer-segment.entity';

export enum AnalyticsEventType {
  IMPRESSION = 'impression',
  CLICK = 'click',
  CONVERSION = 'conversion',
  EMAIL_SENT = 'email_sent',
  EMAIL_OPEN = 'email_open',
  EMAIL_CLICK = 'email_click',
  UNSUBSCRIBE = 'unsubscribe',
  BOUNCE = 'bounce',
  FORM_SUBMISSION = 'form_submission',
  PURCHASE = 'purchase',
}

@Entity('marketing_analytics')
@Index(['campaignId', 'eventType', 'eventDate'])
@Index(['segmentId', 'eventType', 'eventDate'])
@Index(['customerId', 'eventDate'])
export class MarketingAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  campaignId: string;

  @Column('uuid', { nullable: true })
  segmentId?: string;

  @Column('uuid', { nullable: true })
  customerId?: string;

  @Column({
    type: 'simple-enum',
    enum: AnalyticsEventType,
  })
  eventType: AnalyticsEventType;

  @Column({ type: 'timestamp' })
  eventDate: Date;

  @Column('json', { nullable: true })
  eventData: {
    platform?: string;
    device?: string;
    location?: string;
    referrer?: string;
    userAgent?: string;
    value?: number;
    currency?: string;
    properties?: any;
  };

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  revenue?: number;

  @Column({ length: 10, nullable: true })
  currency?: string;

  @Column('json', { nullable: true })
  attribution: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
    firstTouch?: boolean;
    lastTouch?: boolean;
    touchpoint?: number;
  };

  @Column('json', { nullable: true })
  metrics: {
    duration?: number;
    bounceRate?: number;
    pageViews?: number;
    sessionId?: string;
    conversionValue?: number;
  };

  @ManyToOne(() => MarketingCampaign, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaignId' })
  campaign: MarketingCampaign;

  @ManyToOne(() => CustomerSegment, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'segmentId' })
  segment?: CustomerSegment;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
