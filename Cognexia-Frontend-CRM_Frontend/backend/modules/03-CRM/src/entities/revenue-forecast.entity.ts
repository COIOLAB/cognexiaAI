import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('revenue_forecasts')
@Index(['forecast_date', 'forecast_type'])
export class RevenueForecast {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'forecast_date', type: 'date' })
  forecast_date: Date;

  @Column({ name: 'forecast_type', type: 'varchar', length: 20 })
  forecast_type: 'mrr' | 'arr' | 'expansion' | 'contraction';

  @Column({ name: 'forecasted_amount', type: 'decimal', precision: 12, scale: 2 })
  forecasted_amount: number;

  @Column({ name: 'confidence_interval_lower', type: 'decimal', precision: 12, scale: 2 })
  confidence_interval_lower: number;

  @Column({ name: 'confidence_interval_upper', type: 'decimal', precision: 12, scale: 2 })
  confidence_interval_upper: number;

  @Column({ name: 'actual_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  actual_amount?: number;

  @Column({ name: 'forecast_accuracy', type: 'decimal', precision: 5, scale: 2, nullable: true })
  forecast_accuracy?: number;

  @Column({ type: 'json', nullable: true })
  contributing_factors: {
    factor: string;
    impact: number;
  }[];

  @Column({ name: 'model_version', type: 'varchar', length: 50 })
  model_version: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
