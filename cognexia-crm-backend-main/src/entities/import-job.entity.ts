import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';

export enum ImportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PARTIALLY_COMPLETED = 'partially_completed',
}

export enum ImportType {
  CUSTOMER = 'customer',
  LEAD = 'lead',
  CONTACT = 'contact',
  OPPORTUNITY = 'opportunity',
  PRODUCT = 'product',
}

@Entity('import_jobs')
export class ImportJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'simple-enum', enum: ImportType })
  import_type: ImportType;

  @Column({ type: 'simple-enum', enum: ImportStatus, default: ImportStatus.PENDING })
  status: ImportStatus;

  @Column()
  file_name: string;

  @Column()
  file_path: string;

  @Column({ type: 'int', default: 0 })
  total_rows: number;

  @Column({ type: 'int', default: 0 })
  processed_rows: number;

  @Column({ type: 'int', default: 0 })
  successful_rows: number;

  @Column({ type: 'int', default: 0 })
  failed_rows: number;

  @Column({ type: 'json', nullable: true })
  errors: Array<{ row: number; error: string; data?: any }>;

  @Column({ type: 'json', nullable: true })
  mapping: Record<string, string>; // CSV column to entity field mapping

  @Column({ type: 'json', nullable: true })
  options: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
    validateOnly?: boolean;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;
}
