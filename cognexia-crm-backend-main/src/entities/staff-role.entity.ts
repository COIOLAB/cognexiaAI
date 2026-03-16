import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum StaffRoleType {
  SUPER_ADMIN = 'super_admin',           // Full system access
  ADMIN = 'admin',                       // Manage organizations, users, features
  SUPPORT_MANAGER = 'support_manager',   // Manage support tickets, escalations
  SUPPORT_AGENT = 'support_agent',       // Handle support tickets
  SALES_MANAGER = 'sales_manager',       // View all orgs, manage subscriptions
  ANALYST = 'analyst',                   // View-only access to analytics
  BILLING_MANAGER = 'billing_manager',   // Manage billing, invoices, payments
  DEVELOPER = 'developer',               // Technical access, API logs, debugging
}

export interface StaffPermissions {
  // Organization Management
  viewOrganizations?: boolean;
  createOrganizations?: boolean;
  editOrganizations?: boolean;
  deleteOrganizations?: boolean;
  suspendOrganizations?: boolean;
  
  // User & Tier Management
  viewUsers?: boolean;
  createUsers?: boolean;
  editUsers?: boolean;
  deleteUsers?: boolean;
  manageUserTiers?: boolean;
  
  // Feature Management
  viewFeatures?: boolean;
  enableFeatures?: boolean;
  disableFeatures?: boolean;
  
  // Support & Tickets
  viewTickets?: boolean;
  createTickets?: boolean;
  assignTickets?: boolean;
  resolveTickets?: boolean;
  escalateTickets?: boolean;
  
  // Analytics & Reporting
  viewAnalytics?: boolean;
  viewUsageStats?: boolean;
  viewRevenueReports?: boolean;
  exportReports?: boolean;
  
  // Billing
  viewBilling?: boolean;
  manageBilling?: boolean;
  processRefunds?: boolean;
  
  // System Settings
  viewSystemLogs?: boolean;
  manageSystemSettings?: boolean;
  viewAPILogs?: boolean;
  
  // Staff Management
  viewStaff?: boolean;
  inviteStaff?: boolean;
  editStaffRoles?: boolean;
  removeStaff?: boolean;
}

@Entity('staff_roles')
export class StaffRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'simple-enum',
    enum: StaffRoleType,
    default: StaffRoleType.SUPPORT_AGENT,
  })
  role: StaffRoleType;

  @Column({ type: 'jsonb', default: {} })
  permissions: StaffPermissions;

  @Column({ type: 'text', array: true, default: [] })
  assignedOrganizations: string[]; // Empty = all orgs, otherwise specific orgs

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastAccessedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string; // Staff member who created this role

  @Column({ type: 'text', nullable: true })
  notes: string;
}
