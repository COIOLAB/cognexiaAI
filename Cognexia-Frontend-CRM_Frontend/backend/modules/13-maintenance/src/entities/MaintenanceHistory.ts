// Industry 5.0 ERP Backend - MaintenanceHistory Entity
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Equipment } from './Equipment';

@Entity('maintenance_history')
export class MaintenanceHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  equipmentId: string;

  @Column({ type: 'varchar', length: 200 })
  maintenanceType: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamp' })
  performedDate: Date;

  @Column({ type: 'varchar', length: 100 })
  performedBy: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Equipment, equipment => equipment.maintenanceHistory)
  @JoinColumn({ name: 'equipmentId' })
  equipment: Equipment;
}