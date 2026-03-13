import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Role } from './Role.entity';
import { Permission } from './Permission.entity';

@Entity('role_permissions')
@Index('idx_role_permissions_role_permission', ['roleId', 'permissionId'])
@Index('idx_role_permissions_active', ['isActive'])
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  roleId: string;

  @Column()
  permissionId: string;

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

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  constraints: {
    inherited?: boolean;
    conditional?: boolean;
    requiresApproval?: boolean;
    conditions?: any[];
  };

  // Relations
  @ManyToOne(() => Role, role => role.rolePermissions)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ManyToOne(() => Permission, permission => permission.rolePermissions)
  @JoinColumn({ name: 'permissionId' })
  permission: Permission;
}
