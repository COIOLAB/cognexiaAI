import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { UserRole } from './UserRole.entity';

@Entity('users')
@Index('idx_users_email', ['email'])
@Index('idx_users_supabase_id', ['supabaseId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  supabaseId: string; // Supabase Auth User ID

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ 
    type: 'enum',
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  })
  status: 'active' | 'inactive' | 'suspended' | 'pending';

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  employeeId: string;

  @Column({ nullable: true })
  managerId: string;

  @Column({ type: 'json', nullable: true })
  preferences: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  lastLoginIp: string;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  phoneVerifiedAt: Date;

  @Column({ default: false })
  isMfaEnabled: boolean;

  @Column({ type: 'simple-array', nullable: true })
  mfaMethods: string[];

  @Column({ nullable: true })
  timezone: string;

  @Column({ default: 'en' })
  locale: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // Relations
  @OneToMany(() => UserRole, userRole => userRole.user)
  userRoles: UserRole[];

  // Computed properties
  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  get isActive(): boolean {
    return this.status === 'active';
  }

  get isEmailVerified(): boolean {
    return !!this.emailVerifiedAt;
  }

  get isPhoneVerified(): boolean {
    return !!this.phoneVerifiedAt;
  }
}
