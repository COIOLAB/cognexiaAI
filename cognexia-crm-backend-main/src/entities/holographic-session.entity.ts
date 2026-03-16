import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { IsOptional } from 'class-validator';
import { Customer } from './customer.entity';

@Entity('holographic_sessions')
@Index(['customerId', 'startedAt'])
@Index(['sessionType', 'status'])
@Index(['experienceQuality', 'startedAt'])
export class HolographicSession {
  @PrimaryGeneratedColumn('uuid')
  sessionId: string;

  @Column()
  customerId: string;

  @Column()
  sessionType: string; // HOLOGRAPHIC_PROJECTION, VOLUMETRIC_DISPLAY, SPATIAL_COMPUTING

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  spatialEnvironment?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  holographicContent?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  adaptiveExperience?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  customerPreferences?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  displayConfiguration?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  interactionHistory?: Record<string, any>[];

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  emotionalResponses?: Record<string, any>[];

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  spatialTracking?: Record<string, any>;

  @Column({ nullable: true })
  @IsOptional()
  immersionScore?: number;

  @Column({ nullable: true })
  @IsOptional()
  experienceQuality?: number;

  @Column({ nullable: true })
  @IsOptional()
  spatialAccuracy?: number;

  @Column({ nullable: true })
  @IsOptional()
  responseLatencyMs?: number;

  @Column({ default: 'ACTIVE' })
  status: string; // ACTIVE, PAUSED, COMPLETED, TERMINATED, ERROR

  @Column({ nullable: true })
  @IsOptional()
  endedAt?: Date;

  @Column({ nullable: true })
  @IsOptional()
  durationMinutes?: number;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  outcomes?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  performanceMetrics?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  qualityAssurance?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  technicalDetails?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @ManyToOne(() => Customer, customer => customer.holographicSessions)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @CreateDateColumn()
  startedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
