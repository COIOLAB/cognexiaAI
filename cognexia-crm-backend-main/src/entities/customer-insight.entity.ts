import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { IsOptional } from 'class-validator';
import { Customer } from './customer.entity';

@Entity('customer_insights')
@Index(['customerId', 'insightType'])
@Index(['confidenceScore', 'createdAt'])
@Index(['aiModelVersion', 'createdAt'])
export class CustomerInsight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column()
  insightType: string; // NEURAL_PROCESSING, EMOTIONAL_INTELLIGENCE, QUANTUM_PERSONALITY, PREDICTIVE_BEHAVIOR

  @Column({ type: 'json' })
  insightData: Record<string, any>;

  @Column()
  confidenceScore: number; // 0-100

  @Column()
  aiModelVersion: string;

  @Column({ nullable: true })
  @IsOptional()
  processingDurationMs?: number;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  neuralAnalysis?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  emotionalProfile?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  personalityQuantumState?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  behaviorPredictions?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  cognitiveFeatures?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  empathyModeling?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  dimensionalAnalysis?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  validationResults?: Record<string, any>;

  @Column({ default: 'ACTIVE' })
  status: string; // ACTIVE, DEPRECATED, ARCHIVED

  @Column({ nullable: true })
  @IsOptional()
  appliedToJourney?: boolean;

  @Column({ nullable: true })
  @IsOptional()
  businessImpact?: number;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  actionableRecommendations?: Record<string, any>[];

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  correlationAnalysis?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @ManyToOne(() => Customer, customer => customer.insights)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
