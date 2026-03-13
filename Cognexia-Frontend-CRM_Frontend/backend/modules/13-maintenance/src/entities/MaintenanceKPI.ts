// Industry 5.0 ERP Backend - MaintenanceKPI Entity
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('maintenance_kpis')
export class MaintenanceKPI {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  kpiName: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  value: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  target: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string;

  @Column({ type: 'date' })
  @Index()
  reportDate: Date;

  @Column({ type: 'uuid' })
  @Index()
  facilityId: string;

  @CreateDateColumn()
  createdAt: Date;
}