// Industry 5.0 ERP Backend - MaintenanceCost Entity
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export enum CostCategory {
  LABOR = 'LABOR',
  MATERIALS = 'MATERIALS',
  EQUIPMENT = 'EQUIPMENT',
  EXTERNAL = 'EXTERNAL',
  DOWNTIME = 'DOWNTIME',
}

@Entity('maintenance_costs')
export class MaintenanceCost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  workOrderId: string;

  @Column({ type: 'enum', enum: CostCategory })
  @Index()
  category: CostCategory;

  @Column({ type: 'varchar', length: 200 })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'date' })
  @Index()
  incurredDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}