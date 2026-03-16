import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Tenant } from './tenant.entity';
import { Organization } from './organization.entity';

export enum PortalUserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

@Entity('crm_portal_users')
export class PortalUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ select: false })
  password: string;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash?: string;

  @Column({ type: 'simple-enum', enum: PortalUserStatus, default: PortalUserStatus.PENDING })
  status: PortalUserStatus;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'organizationId', nullable: true })
  organizationId?: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @Column({ name: 'name', nullable: true })
  name?: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber?: string;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @Column({ name: 'email_verification_expiry', type: 'timestamp', nullable: true })
  emailVerificationExpiry?: Date;

  @Column({ name: 'password_reset_expiry', type: 'timestamp', nullable: true })
  passwordResetExpiry?: Date;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  // Access permissions
  @Column({ name: 'can_view_documents', default: true })
  canViewDocuments: boolean;

  @Column({ name: 'can_view_invoices', default: true })
  canViewInvoices: boolean;

  @Column({ name: 'can_create_tickets', default: true })
  canCreateTickets: boolean;

  @Column({ name: 'can_view_knowledge_base', default: true })
  canViewKnowledgeBase: boolean;

  @Column({ name: 'can_manage_profile', default: true })
  canManageProfile: boolean;

  // Invitation & verification
  @Column({ name: 'invitation_token', nullable: true })
  invitationToken: string;

  @Column({ name: 'invitation_sent_at', type: 'timestamp', nullable: true })
  invitationSentAt: Date;

  @Column({ name: 'invitation_accepted_at', type: 'timestamp', nullable: true })
  invitationAcceptedAt: Date;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'email_verification_token', nullable: true })
  emailVerificationToken: string;

  // Password reset
  @Column({ name: 'password_reset_token', nullable: true })
  passwordResetToken: string;

  @Column({ name: 'password_reset_expires', type: 'timestamp', nullable: true })
  passwordResetExpires: Date;

  // Activity tracking
  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'last_login_ip', nullable: true })
  lastLoginIp: string;

  @Column({ name: 'login_count', default: 0 })
  loginCount: number;

  // Preferences
  @Column({ type: 'json', nullable: true })
  preferences: {
    language?: string;
    timezone?: string;
    notifications?: {
      email?: boolean;
      sms?: boolean;
    };
    [key: string]: any;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
