// Industry 5.0 ERP Backend - EquipmentDowntime Entity
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Equipment } from './Equipment';

export enum DowntimeReason {
  PLANNED_MAINTENANCE = 'PLANNED_MAINTENANCE',
  UNPLANNED_MAINTENANCE = 'UNPLANNED_MAINTENANCE',
  BREAKDOWN = 'BREAKDOWN',
  SETUP = 'SETUP',
  NO_DEMAND = 'NO_DEMAND',
  MATERIAL_SHORTAGE = 'MATERIAL_SHORTAGE',
  QUALITY_ISSUE = 'QUALITY_ISSUE',
}

@Entity('equipment_downtime')
export class EquipmentDowntime {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  equipmentId: string;

  @Column({ type: 'timestamp' })
  @Index()
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'int', nullable: true })
  durationMinutes: number;

  @Column({ type: 'enum', enum: DowntimeReason })
  @Index()
  reason: DowntimeReason;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costImpact: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Equipment, equipment => equipment.downtimeRecords)
  @JoinColumn({ name: 'equipmentId' })
  equipment: Equipment;
}