// Industry 5.0 ERP Backend - ConditionMonitoringData Entity
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('condition_monitoring_data')
export class ConditionMonitoringData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  equipmentId: string;

  @Column({ type: 'uuid' })
  @Index()
  sensorId: string;

  @Column({ type: 'decimal', precision: 12, scale: 6 })
  value: number;

  @Column({ type: 'varchar', length: 50 })
  unit: string;

  @Column({ type: 'timestamp' })
  @Index()
  timestamp: Date;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;
}