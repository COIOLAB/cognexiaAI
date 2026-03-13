// Industry 5.0 ERP Backend - MaintenanceAnalytics Entity
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('maintenance_analytics')
export class MaintenanceAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  @Index()
  reportDate: Date;

  @Column({ type: 'uuid' })
  @Index()
  facilityId: string;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  overallEfficiency: number;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  availability: number;

  @Column({ type: 'int' })
  totalWorkOrders: number;

  @Column({ type: 'int' })
  completedWorkOrders: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalMaintenanceCost: number;

  @Column({ type: 'json', nullable: true })
  kpiMetrics: {
    mtbf: number;
    mttr: number;
    plannedVsUnplanned: number;
    firstTimeFixRate: number;
  };

  @CreateDateColumn()
  createdAt: Date;
}
