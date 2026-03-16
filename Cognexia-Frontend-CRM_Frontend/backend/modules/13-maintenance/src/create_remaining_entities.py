#!/usr/bin/env python3
"""
Create remaining maintenance entities
"""

entities = {
    "ConditionMonitoringData.ts": '''// Industry 5.0 ERP Backend - ConditionMonitoringData Entity
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
}''',

    "MaintenanceCost.ts": '''// Industry 5.0 ERP Backend - MaintenanceCost Entity
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
}''',

    "EquipmentDowntime.ts": '''// Industry 5.0 ERP Backend - EquipmentDowntime Entity
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
}''',

    "MaintenanceKPI.ts": '''// Industry 5.0 ERP Backend - MaintenanceKPI Entity
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

print(f"Created {len(entities)} remaining entities successfully!")
