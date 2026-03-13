import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './User.entity';
import { Role } from './Role.entity';

@Entity('user_roles')
@Index('idx_user_roles_user_role', ['userId', 'roleId'])
@Index('idx_user_roles_active', ['isActive'])
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  roleId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: false })
  assignedBy: string;

  @CreateDateColumn()
  assignedAt: Date;

  @Column({ nullable: true })
  revokedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  constraints: {
    temporaryAssignment?: boolean;
    requiresRevalidation?: boolean;
    approvalRequired?: boolean;
    delegatedFrom?: string;
  };

  @Column({ nullable: true })
  reason: string;

  // Relations
  @ManyToOne(() => User, user => user.userRoles)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Role, role => role.userRoles)
  @JoinColumn({ name: 'roleId' })
  role: Role;
}
