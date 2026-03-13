// Industry 5.0 ERP Backend - PredictiveModel Entity
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('predictive_models')
export class PredictiveModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  modelName: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  equipmentType: string;

  @Column({ type: 'varchar', length: 50 })
  modelType: string;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  accuracy: number;

  @Column({ type: 'json', nullable: true })
  parameters: any;

  @Column({ type: 'timestamp', nullable: true })
  lastTrained: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}