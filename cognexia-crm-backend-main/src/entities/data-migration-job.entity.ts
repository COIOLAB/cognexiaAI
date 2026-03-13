import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum MigrationType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  SELECTIVE = 'selective',
  IMPORT_CSV = 'import_csv',
  IMPORT_EXCEL = 'import_excel',
  SYNC_FROM_ERP = 'sync_from_erp',
}

export enum MigrationStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PARTIALLY_COMPLETED = 'partially_completed',
  ROLLING_BACK = 'rolling_back',
  ROLLED_BACK = 'rolled_back',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('data_migration_jobs')
export class DataMigrationJob {
  @ApiProperty({ description: 'Job UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Migration type', enum: MigrationType })
  @Column({ type: 'simple-enum', enum: MigrationType })
  migrationType: MigrationType;

  @ApiProperty({ description: 'Migration status', enum: MigrationStatus })
  @Column({ type: 'simple-enum', enum: MigrationStatus, default: MigrationStatus.PENDING })
  status: MigrationStatus;

  @ApiProperty({ description: 'Source system' })
  @Column()
  sourceSystem: string;

  @ApiProperty({ description: 'Target system' })
  @Column()
  targetSystem: string;

  @ApiProperty({ description: 'Records processed' })
  @Column({ default: 0 })
  recordsProcessed: number;

  @ApiProperty({ description: 'Total records' })
  @Column({ default: 0 })
  totalRecords: number;

  @ApiProperty({ description: 'Error message' })
  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @ApiProperty({ description: 'Organization ID' })
  @Column({ nullable: true })
  organizationId?: string;

  @ApiProperty({ description: 'Source path' })
  @Column({ type: 'text', nullable: true })
  sourcePath?: string;

  @ApiProperty({ description: 'Target entity' })
  @Column({ nullable: true })
  targetEntity?: string;

  @ApiProperty({ description: 'Field mapping' })
  @Column({ type: 'json', nullable: true })
  fieldMapping?: Record<string, string>;

  @ApiProperty({ description: 'Options' })
  @Column({ type: 'json', nullable: true })
  options?: Record<string, any>;

  @ApiProperty({ description: 'Processed records' })
  @Column({ default: 0 })
  processedRecords: number;

  @ApiProperty({ description: 'Created records' })
  @Column({ default: 0 })
  createdRecords: number;

  @ApiProperty({ description: 'Updated records' })
  @Column({ default: 0 })
  updatedRecords: number;

  @ApiProperty({ description: 'Failed records' })
  @Column({ default: 0 })
  failedRecords: number;

  @ApiProperty({ description: 'Skipped records' })
  @Column({ default: 0 })
  skippedRecords: number;

  @ApiProperty({ description: 'Validation errors' })
  @Column({ type: 'json', nullable: true })
  validationErrors?: any[];

  @ApiProperty({ description: 'Error stack' })
  @Column({ type: 'text', nullable: true })
  errorStack?: string;

  @ApiProperty({ description: 'Started at' })
  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @ApiProperty({ description: 'Completed at' })
  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'Can rollback' })
  @Column({ default: false })
  canRollback: boolean;

  @ApiProperty({ description: 'Rollback data' })
  @Column({ type: 'json', nullable: true })
  rollbackData?: any;

  @ApiProperty({ description: 'Job name' })
  @Column({ nullable: true })
  jobName?: string;

  @ApiProperty({ description: 'Created by user ID' })
  @Column({ nullable: true })
  createdBy?: string;

  updateProgress?: () => void;
  calculateDuration?: () => number;
}
