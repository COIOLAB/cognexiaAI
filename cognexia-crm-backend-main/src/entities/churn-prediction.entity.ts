import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Organization } from './organization.entity';

@Entity('churn_predictions')
@Index(['organizationId', 'prediction_date'])
@Index(['churn_risk_level'])
export class ChurnPrediction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizationId', type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ name: 'prediction_date', type: 'date' })
  prediction_date: Date;

  @Column({ name: 'churn_probability', type: 'decimal', precision: 5, scale: 2 })
  churn_probability: number; // 0-100

  @Column({ name: 'churn_risk_level', type: 'varchar', length: 20 })
  churn_risk_level: 'low' | 'medium' | 'high' | 'critical';

  @Column({ name: 'predicted_churn_date', type: 'date', nullable: true })
  predicted_churn_date?: Date;

  @Column({ type: 'json', nullable: true })
  risk_factors: {
    factor: string;
    impact: number;
    description: string;
  }[];

  @Column({ type: 'json', nullable: true })
  retention_recommendations: string[];

  @Column({ name: 'model_version', type: 'varchar', length: 50 })
  model_version: string;

  @Column({ name: 'confidence_score', type: 'decimal', precision: 5, scale: 2 })
  confidence_score: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
