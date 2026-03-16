import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { RolePermission } from './RolePermission.entity';
import { RBACCondition } from '../rbac.service';

@Entity('permissions')
@Index('idx_permissions_resource_action', ['resource', 'action'])
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  resource: string;

  @Column({ nullable: false })
  action: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  conditions: RBACCondition[];

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSystemPermission: boolean;

  @Column({ 
    type: 'enum',
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  })
  riskLevel: 'low' | 'medium' | 'high' | 'critical';

  @Column({ type: 'simple-array', nullable: true })
  requiredClearances: string[];

  @Column({ type: 'json', nullable: true })
  constraints: {
    timeRestriction?: {
      validFrom?: Date;
      validTo?: Date;
      timezone?: string;
    };
    locationRestriction?: {
      allowedLocations?: string[];
      restrictedLocations?: string[];
    };
    contextualRequirements?: Record<string, any>;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // Relations
  @OneToMany(() => RolePermission, rolePermission => rolePermission.permission)
  rolePermissions: RolePermission[];
}
