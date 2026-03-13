import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
}

export enum AuditEntityType {
  USER = 'user',
  ORGANIZATION = 'organization',
  CUSTOMER = 'customer',
  LEAD = 'lead',
  OPPORTUNITY = 'opportunity',
  CONTACT = 'contact',
  ACCOUNT = 'account',
  TASK = 'task',
  DOCUMENT = 'document',
  REPORT = 'report',
}

@Entity('audit_logs')
@Index(['user_id', 'created_at'])
@Index(['entity_type', 'entity_id'])
@Index(['action', 'created_at'])
@Index(['ip_address'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  user_id?: string;

  @Column({ name: 'user_email', type: 'varchar', length: 255, nullable: true })
  user_email?: string;

  @Column({ name: 'organizationId', type: 'uuid', nullable: true })
  organizationId?: string;

  @Column({ type: 'varchar', length: 50 })
  action: string; // e.g., 'user.login', 'organization.update', 'data.export'

  @Column({ name: 'entity_type', type: 'varchar', length: 50, nullable: true })
  entity_type?: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entity_id?: string;

  @Column({ name: 'changes', type: 'json', nullable: true })
  changes?: {
    field: string;
    old_value: any;
    new_value: any;
  }[];

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata?: any;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ip_address?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  user_agent?: string;

  @Column({ type: 'varchar', length: 20, default: 'success' })
  status: 'success' | 'failed' | 'partial';

  @Column({ name: 'error_message', type: 'text', nullable: true })
  error_message?: string;

  @Column({ name: 'request_id', type: 'uuid', nullable: true })
  request_id?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
