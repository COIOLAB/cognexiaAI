import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum GoalPeriod { MONTHLY = 'monthly', QUARTERLY = 'quarterly', YEARLY = 'yearly' }

@Entity('kpi_goals')
export class KPIGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  targetValue: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  currentValue: number;

  @Column({ type: 'enum', enum: GoalPeriod })
  period: GoalPeriod;

  @Column()
  unit: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
