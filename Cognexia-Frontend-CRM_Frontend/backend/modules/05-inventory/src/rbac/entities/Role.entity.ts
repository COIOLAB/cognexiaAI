import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { UserRole } from './UserRole.entity';
import { RolePermission } from './RolePermission.entity';

@Entity('roles')
@Index('idx_roles_name', ['name'])
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ 
    type: 'enum',
    enum: ['SYSTEM', 'MANAGER', 'ANALYST', 'OPERATOR', 'SPECIALIST', 'AUDITOR', 'VIEWER'],
    default: 'OPERATOR'
  })
  level: 'SYSTEM' | 'MANAGER' | 'ANALYST' | 'OPERATOR' | 'SPECIALIST' | 'AUDITOR' | 'VIEWER';

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSystemRole: boolean;

  @Column({ nullable: true })
  parentRoleId: string;

  @Column({ type: 'simple-array', nullable: true })
  childRoleIds: string[];

  @Column({ type: 'json', nullable: true })
  constraints: {
    maxUsers?: number;
    requiresApproval?: boolean;
    temporaryRole?: boolean;
    maxDuration?: number; // in hours
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // Relations
  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles: UserRole[];

  @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
  rolePermissions: RolePermission[];
}
