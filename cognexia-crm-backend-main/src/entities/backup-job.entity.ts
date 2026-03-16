import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('backup_jobs')
@Index(['status', 'started_at'])
@Index(['backup_type', 'created_at'])
export class BackupJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'backup_type', type: 'varchar', length: 50 })
  backup_type: 'full' | 'incremental' | 'differential';

  @Column({ name: 'backup_location', type: 'varchar', length: 255 })
  backup_location: string;

  @Column({ name: 'backup_size_mb', type: 'decimal', precision: 12, scale: 2, nullable: true })
  backup_size_mb?: number;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'verified';

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  started_at?: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completed_at?: Date;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  duration_seconds?: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  error_message?: string;

  @Column({ name: 'verification_status', type: 'varchar', length: 20, nullable: true })
  verification_status?: 'passed' | 'failed' | 'pending';

  @Column({ name: 'retention_until', type: 'date' })
  retention_until: Date;

  @Column({ name: 'is_encrypted', type: 'boolean', default: true })
  is_encrypted: boolean;

  @Column({ name: 'initiated_by', type: 'uuid', nullable: true })
  initiated_by?: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
