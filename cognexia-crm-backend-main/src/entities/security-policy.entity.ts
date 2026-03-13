import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsOptional } from 'class-validator';

@Entity('security_policies')
export class SecurityPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  @IsOptional()
  description?: string;

  @Column()
  policyType: string; // RBAC, ABAC, GDPR, SOX, etc.

  @Column({ type: 'json' })
  policyData: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  conditions?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  enforcement?: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  priority: number;

  @Column({ nullable: true })
  @IsOptional()
  version?: string;

  @Column({ nullable: true })
  @IsOptional()
  approvedBy?: string;

  @Column({ nullable: true })
  @IsOptional()
  approvedAt?: Date;

  @Column({ nullable: true })
  @IsOptional()
  effectiveFrom?: Date;

  @Column({ nullable: true })
  @IsOptional()
  expiresAt?: Date;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  complianceFrameworks?: string[];

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  auditRequirements?: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
