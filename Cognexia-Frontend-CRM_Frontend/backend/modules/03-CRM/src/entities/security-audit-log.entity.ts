import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { IsOptional } from 'class-validator';

@Entity('security_audit_logs')
@Index(['eventType', 'timestamp'])
@Index(['userId', 'timestamp'])
@Index(['severity', 'timestamp'])
export class SecurityAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventType: string;

  @Column({ nullable: true })
  @IsOptional()
  userId?: string;

  @Column({ nullable: true })
  @IsOptional()
  sessionId?: string;

  @Column({ nullable: true })
  @IsOptional()
  ipAddress?: string;

  @Column({ nullable: true })
  @IsOptional()
  userAgent?: string;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  details?: Record<string, any>;

  @Column({ default: 'INFO' })
  severity: string; // INFO, WARNING, ERROR, CRITICAL

  @Column({ nullable: true })
  @IsOptional()
  resource?: string;

  @Column({ nullable: true })
  @IsOptional()
  action?: string;

  @Column({ default: true })
  success: boolean;

  @Column({ nullable: true })
  @IsOptional()
  errorMessage?: string;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  riskAssessment?: Record<string, any>;

  @Column({ nullable: true })
  @IsOptional()
  complianceFlags?: string;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @CreateDateColumn()
  timestamp: Date;
}
