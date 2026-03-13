// Industry 5.0 ERP Backend - MaintenanceSchedule Entity
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Equipment } from './Equipment';

export enum ScheduleType {
  TIME_BASED = 'TIME_BASED',
  USAGE_BASED = 'USAGE_BASED',
  CONDITION_BASED = 'CONDITION_BASED',
  PREDICTIVE = 'PREDICTIVE',
}

@Entity('maintenance_schedules')
export class MaintenanceSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  equipmentId: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ScheduleType })
  scheduleType: ScheduleType;

  @Column({ type: 'int', nullable: true })
  intervalHours: number;

  @Column({ type: 'int', nullable: true })
  intervalCycles: number;

  @Column({ type: 'timestamp', nullable: true })
  nextDueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastCompletedDate: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Equipment, equipment => equipment.maintenanceSchedules)
  @JoinColumn({ name: 'equipmentId' })
  equipment: Equipment;
}
