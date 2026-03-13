import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';

export interface BehavioralModel {
  purchase_frequency: number;
  average_order_value: number;
  preferred_channels: string[];
  engagement_score: number;
  churn_risk_score: number;
  lifetime_value_prediction: number;
  next_purchase_probability: number;
  product_affinity: Record<string, number>;
}

export interface EngagementPropensity {
  email: number;
  sms: number;
  phone: number;
  chat: number;
  social_media: number;
  best_time_to_contact: string;
  best_day_of_week: string;
  response_likelihood: number;
}

export interface RiskIndices {
  churn_risk: number;
  payment_risk: number;
  satisfaction_risk: number;
  competitive_risk: number;
  risk_factors: string[];
  mitigation_strategies: string[];
}

export interface LoyaltyMetrics {
  loyalty_score: number;
  advocacy_score: number;
  retention_probability: number;
  referral_likelihood: number;
  brand_affinity: number;
}

export interface PredictiveInsights {
  next_best_action: string;
  recommended_products: string[];
  optimal_offer: string;
  predicted_ltv_change: number;
  win_back_strategy: string;
  expansion_opportunities: string[];
}

@Entity('customer_digital_twins')
export class CustomerDigitalTwin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column()
  customer_id: string;

  @Column('json')
  behavioral_model: BehavioralModel;

  @Column('json')
  engagement_propensity: EngagementPropensity;

  @Column('json')
  risk_indices: RiskIndices;

  @Column('json')
  loyalty_metrics: LoyaltyMetrics;

  @Column('json')
  predictive_insights: PredictiveInsights;

  @Column('json', { nullable: true })
  historical_simulations: Array<{
    scenario: string;
    date: Date;
    inputs: Record<string, any>;
    predicted_outcome: string;
    actual_outcome?: string;
    accuracy_score?: number;
  }>;

  @Column('json', { nullable: true })
  customer_journey_map: {
    current_stage: string;
    stages_completed: string[];
    predicted_next_stage: string;
    stage_progression_probability: number;
    bottlenecks: string[];
  };

  @Column({ type: 'float', default: 0 })
  model_accuracy: number;

  @Column({ type: 'float', default: 0 })
  prediction_confidence: number;

  @Column({ type: 'timestamp' })
  last_trained_at: Date;

  @Column({ type: 'timestamp' })
  last_prediction_at: Date;

  @Column({ default: 0 })
  prediction_count: number;

  @Column({ default: 0 })
  successful_predictions: number;

  @Column('simple-array', { nullable: true })
  data_sources: string[];

  @Column({ default: 1 })
  model_version: number;

  @Column({ nullable: true })
  training_dataset_size: number;

  @Column('json', { nullable: true })
  feature_importance: Record<string, number>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
