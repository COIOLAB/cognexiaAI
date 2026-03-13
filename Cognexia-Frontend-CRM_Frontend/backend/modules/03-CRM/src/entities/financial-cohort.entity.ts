import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('financial_cohorts')
@Index(['cohort_month', 'cohort_type'])
export class FinancialCohort {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cohort_month', type: 'date' })
  cohort_month: Date;

  @Column({ name: 'cohort_type', type: 'varchar', length: 50 })
  cohort_type: 'signup_month' | 'tier' | 'industry' | 'region';

  @Column({ name: 'cohort_name', type: 'varchar', length: 100 })
  cohort_name: string;

  @Column({ name: 'initial_customers', type: 'int' })
  initial_customers: number;

  @Column({ name: 'current_customers', type: 'int' })
  current_customers: number;

  @Column({ name: 'initial_mrr', type: 'decimal', precision: 12, scale: 2 })
  initial_mrr: number;

  @Column({ name: 'current_mrr', type: 'decimal', precision: 12, scale: 2 })
  current_mrr: number;

  @Column({ name: 'expansion_revenue', type: 'decimal', precision: 12, scale: 2 })
  expansion_revenue: number;

  @Column({ name: 'contraction_revenue', type: 'decimal', precision: 12, scale: 2 })
  contraction_revenue: number;

  @Column({ name: 'churned_revenue', type: 'decimal', precision: 12, scale: 2 })
  churned_revenue: number;

  @Column({ name: 'retention_rate', type: 'decimal', precision: 5, scale: 2 })
  retention_rate: number;

  @Column({ name: 'ltv', type: 'decimal', precision: 12, scale: 2, nullable: true })
  ltv?: number;

  @Column({ name: 'cac', type: 'decimal', precision: 12, scale: 2, nullable: true })
  cac?: number;

  @Column({ type: 'json', nullable: true })
  monthly_breakdown: any[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
