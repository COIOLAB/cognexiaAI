import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { IsOptional } from 'class-validator';
import { Customer } from './customer.entity';

@Entity('customer_experiences')
@Index(['customerId', 'experienceType'])
@Index(['sessionId', 'createdAt'])
@Index(['satisfactionScore', 'createdAt'])
export class CustomerExperience {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column()
  sessionId: string;

  @Column()
  experienceType: string; // HOLOGRAPHIC, AR_VR, DIGITAL, PHYSICAL

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  experienceConfig?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  spatialData?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  interactionData?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  emotionalData?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  adaptationHistory?: Record<string, any>[];

  @Column({ nullable: true })
  @IsOptional()
  satisfactionScore?: number;

  @Column({ nullable: true })
  @IsOptional()
  engagementScore?: number;

  @Column({ nullable: true })
  @IsOptional()
  immersionLevel?: number;

  @Column({ nullable: true })
  @IsOptional()
  durationMinutes?: number;

  @Column({ default: 'ACTIVE' })
  status: string; // ACTIVE, COMPLETED, TERMINATED, ERROR

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  outcomes?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  feedback?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  analytics?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  qualityMetrics?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @ManyToOne(() => Customer, customer => customer.experiences)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
