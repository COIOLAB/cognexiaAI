import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ABTestStatus { DRAFT = 'draft', RUNNING = 'running', COMPLETED = 'completed', PAUSED = 'paused' }

@Entity('ab_tests')
export class ABTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'json' })
  variants: Array<{ id: string; name: string; trafficPercent: number }>;

  @Column({ type: 'enum', enum: ABTestStatus, default: ABTestStatus.DRAFT })
  status: ABTestStatus;

  @Column({ type: 'json', nullable: true })
  metrics: Array<{ name: string; type: string; goal: string }>;

  @Column({ type: 'json', nullable: true })
  results: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
