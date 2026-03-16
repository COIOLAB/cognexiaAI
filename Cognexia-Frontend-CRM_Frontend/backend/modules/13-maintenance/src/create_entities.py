#!/usr/bin/env python3
"""
Script to create multiple maintenance entities quickly
"""

entities = {
    "MaintenanceTask.ts": '''// Industry 5.0 ERP Backend - MaintenanceTask Entity
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MaintenanceWorkOrder } from './MaintenanceWorkOrder';

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
}

@Entity('maintenance_tasks')
export class MaintenanceTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  workOrderId: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ type: 'int', nullable: true })
  estimatedDuration: number;

  @Column({ type: 'int', nullable: true })
  actualDuration: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => MaintenanceWorkOrder, workOrder => workOrder.tasks)
  @JoinColumn({ name: 'workOrderId' })
  workOrder: MaintenanceWorkOrder;
}''',

    "SparePart.ts": '''// Industry 5.0 ERP Backend - SparePart Entity
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('spare_parts')
export class SparePart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  partNumber: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  manufacturer: string;

  @Column({ type: 'int', default: 0 })
  currentStock: number;

  @Column({ type: 'int', default: 0 })
  minimumStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitCost: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  location: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}''',

    "MaintenanceHistory.ts": '''// Industry 5.0 ERP Backend - MaintenanceHistory Entity
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
}''',

    "EquipmentSensor.ts": '''// Industry 5.0 ERP Backend - EquipmentSensor Entity
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
}''',

    "PredictiveModel.ts": '''// Industry 5.0 ERP Backend - PredictiveModel Entity
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
}''',

    "MaintenanceAlert.ts": '''// Industry 5.0 ERP Backend - MaintenanceAlert Entity
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('maintenance_alerts')
export class MaintenanceAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  equipmentId: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: AlertSeverity })
  @Index()
  severity: AlertSeverity;

  @Column({ type: 'boolean', default: false })
  isResolved: boolean;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}''',

    "MaintenanceTechnician.ts": '''// Industry 5.0 ERP Backend - MaintenanceTechnician Entity
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('maintenance_technicians')
export class MaintenanceTechnician {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  employeeId: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'json', nullable: true })
  skills: string[];

  @Column({ type: 'json', nullable: true })
  certifications: string[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}''',
}

# Create the entities
import os

base_path = r"C:\Users\nshrm\Desktop\Industry5.0\backend\modules\13-maintenance\src\entities"

for filename, content in entities.items():
    file_path = os.path.join(base_path, filename)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Created: {filename}")

print(f"Created {len(entities)} entities successfully!")
