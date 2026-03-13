import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Organization } from './organization.entity';

@Entity('recommendations')
@Index(['organizationId', 'status'])
@Index(['recommendation_type', 'priority'])
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizationId', type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ name: 'recommendation_type', type: 'varchar', length: 50 })
  recommendation_type: 'onboarding' | 'feature_adoption' | 'pricing_tier' | 'integration' | 'upsell' | 'retention';

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 20 })
  priority: 'low' | 'medium' | 'high' | 'critical';

  @Column({ name: 'expected_impact', type: 'text', nullable: true })
  expected_impact?: string;

  @Column({ name: 'confidence_score', type: 'decimal', precision: 5, scale: 2 })
  confidence_score: number;

  @Column({ type: 'json', nullable: true })
  action_items: string[];

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: 'pending' | 'accepted' | 'dismissed' | 'completed';

  @Column({ name: 'dismissed_reason', type: 'text', nullable: true })
  dismissed_reason?: string;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completed_at?: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
