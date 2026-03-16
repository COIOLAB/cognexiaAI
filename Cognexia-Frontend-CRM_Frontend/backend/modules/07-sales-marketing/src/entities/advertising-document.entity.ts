import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('advertising_documents')
export class AdvertisingDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  campaignObjective: string;

  @Column({ type: 'jsonb' })
  targetDemographics: any;

  @Column({ type: 'jsonb', nullable: true })
  behaviorPatterns: any;

  @Column({ type: 'jsonb', nullable: true })
  marketData: any;

  @Column({ type: 'jsonb', nullable: true })
  competitorAnalysis: any;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  budget: number;

  @Column({ type: 'jsonb' })
  channels: any;

  @Column({ type: 'jsonb' })
  documents: any;

  @Column({ type: 'jsonb', nullable: true })
  quantumAnalytics: any;

  @Column({ type: 'jsonb', nullable: true })
  socialMarketingIntegration: any;

  @Column({ type: 'jsonb', nullable: true })
  globalReadiness: any;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  processingTime: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  quantumProcessor: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
