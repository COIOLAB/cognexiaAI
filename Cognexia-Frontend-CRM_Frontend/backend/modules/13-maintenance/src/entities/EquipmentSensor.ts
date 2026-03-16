// Industry 5.0 ERP Backend - EquipmentSensor Entity
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Equipment } from './Equipment';

export enum SensorType {
  TEMPERATURE = 'TEMPERATURE',
  PRESSURE = 'PRESSURE',
  VIBRATION = 'VIBRATION',
  FLOW = 'FLOW',
  LEVEL = 'LEVEL',
  VOLTAGE = 'VOLTAGE',
  CURRENT = 'CURRENT',
}

@Entity('equipment_sensors')
export class EquipmentSensor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  equipmentId: string;

  @Column({ type: 'varchar', length: 100 })
  sensorCode: string;

  @Column({ type: 'enum', enum: SensorType })
  sensorType: SensorType;

  @Column({ type: 'varchar', length: 50 })
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  currentValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  minThreshold: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  maxThreshold: number;

  @Column({ type: 'timestamp', nullable: true })
  lastReading: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Equipment, equipment => equipment.sensors)
  @JoinColumn({ name: 'equipmentId' })
  equipment: Equipment;
}