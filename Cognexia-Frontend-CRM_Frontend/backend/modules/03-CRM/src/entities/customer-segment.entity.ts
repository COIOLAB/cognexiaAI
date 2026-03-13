import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MarketingCampaign } from './marketing-campaign.entity';

export enum SegmentType {
  DEMOGRAPHIC = 'demographic',
  BEHAVIORAL = 'behavioral',
  GEOGRAPHIC = 'geographic',
  PSYCHOGRAPHIC = 'psychographic',
  FIRMOGRAPHIC = 'firmographic',
  TECHNOGRAPHIC = 'technographic',
  VALUE_BASED = 'value_based',
  LIFECYCLE = 'lifecycle',
}

@Entity('crm_customer_segments')
@Index(['name'], { unique: true })
@Index(['type'])
@Index(['isActive'])
export class CustomerSegment {
  @ApiProperty({ description: 'Segment UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Segment name' })
  @Column({ unique: true, length: 255 })
  name: string;

  @ApiProperty({ description: 'Segment description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Segment type', enum: SegmentType })
  @Column({ type: 'simple-enum', enum: SegmentType })
  type: SegmentType;

  @ApiProperty({ description: 'Segmentation criteria', type: 'object' })
  @Column({ type: 'json' })
  criteria: {
    rules: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in';
      value: any;
      logic?: 'and' | 'or';
    }>;
    conditions: string;
  };

  @ApiProperty({ description: 'Customer count in segment' })
  @Column({ type: 'int', default: 0 })
  customerCount: number;

  @ApiProperty({ description: 'Segment value/revenue' })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  segmentValue: number;

  @ApiProperty({ description: 'Auto-update flag' })
  @Column({ default: true })
  autoUpdate: boolean;

  @ApiProperty({ description: 'Segment active status' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Last calculation date' })
  @Column({ type: 'timestamp', nullable: true })
  lastCalculated?: Date;

  @ApiProperty({ description: 'Segment tags' })
  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

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

  @ManyToMany(() => MarketingCampaign, (campaign) => campaign.targetSegments)
  campaigns: MarketingCampaign[];
}
