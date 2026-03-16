import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { Organization } from './organization.entity';

export enum AuditStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Entity('inventory_audits')
@Index(['warehouseId', 'organizationId'])
export class InventoryAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'warehouse_id' })
  warehouseId: string;

  @ManyToOne(() => Warehouse, { nullable: false })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ type: 'timestamp' })
  auditDate: Date;

  @Column({ type: 'varchar', length: 100 })
  auditedBy: string;

  @Column({ type: 'simple-json', nullable: true })
  discrepancies: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  adjustments: Record<string, any>;

  @Column({ type: 'simple-enum', enum: AuditStatus, default: AuditStatus.SCHEDULED })
  status: AuditStatus;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
