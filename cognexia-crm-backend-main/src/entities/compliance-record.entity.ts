import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { IsOptional } from 'class-validator';

@Entity('compliance_records')
@Index(['complianceFramework', 'createdAt'])
@Index(['status', 'createdAt'])
@Index(['customerId', 'complianceFramework'])
export class ComplianceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  complianceFramework: string; // GDPR, SOX, HIPAA, PCI-DSS, etc.

  @Column()
  recordType: string; // DATA_SUBJECT_ACCESS, RIGHT_TO_ERASURE, etc.

  @Column({ nullable: true })
  @IsOptional()
  customerId?: string;

  @Column({ nullable: true })
  @IsOptional()
  requestId?: string;

  @Column({ type: 'json' })
  requestData: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  responseData?: Record<string, any>;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, IN_PROGRESS, COMPLETED, FAILED, REJECTED

  @Column({ nullable: true })
  @IsOptional()
  processedBy?: string;

  @Column({ nullable: true })
  @IsOptional()
  processedAt?: Date;

  @Column({ nullable: true })
  @IsOptional()
  dueDate?: Date;

  @Column({ nullable: true })
  @IsOptional()
  completedAt?: Date;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  auditTrail?: Record<string, any>[];

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  evidence?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  validationResults?: Record<string, any>;

  @Column({ nullable: true })
  @IsOptional()
  riskScore?: number;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  notifications?: Record<string, any>[];

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
