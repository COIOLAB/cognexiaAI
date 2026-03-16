import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Organization } from './organization.entity';

export enum SecurityEventType {
  FAILED_LOGIN = 'failed_login',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DATA_BREACH_ATTEMPT = 'data_breach_attempt',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  PASSWORD_RESET = 'password_reset',
  IP_BLOCKED = 'ip_blocked',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  MFA_BYPASS_ATTEMPT = 'mfa_bypass_attempt',
}

export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('security_events')
@Index(['organizationId', 'createdAt'])
@Index(['severity', 'createdAt'])
@Index(['eventType', 'createdAt'])
export class SecurityEvent {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: SecurityEventType })
  @Column({ type: 'enum', enum: SecurityEventType })
  eventType: SecurityEventType;

  @ApiProperty({ enum: SecuritySeverity })
  @Column({ type: 'enum', enum: SecuritySeverity })
  severity: SecuritySeverity;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty()
  @Column()
  ipAddress: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @ApiProperty()
  @Column({ type: 'text' })
  description: string;

  @ApiProperty()
  @Column({ type: 'json', nullable: true })
  details: Record<string, any>;

  @ApiProperty()
  @Column({ default: false })
  resolved: boolean;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @ApiProperty()
  @Column('uuid', { nullable: true })
  resolvedBy: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  resolutionNotes: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
