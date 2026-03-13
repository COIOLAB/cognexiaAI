import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
  Index,
  BeforeInsert,
} from 'typeorm';
import { IsString, IsBoolean, IsOptional, IsEnum, IsDate, IsUUID, IsNumber } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { User } from './user.entity';
import { Permission } from './permission.entity';

export enum RoleType {
  SYSTEM = 'system',
  BUSINESS = 'business',
  FUNCTIONAL = 'functional',
  SECURITY = 'security',
  CUSTOM = 'custom',
}

export enum RoleLevel {
  GLOBAL = 'global',
  ORGANIZATIONAL = 'organizational',
  DEPARTMENTAL = 'departmental',
  TEAM = 'team',
  INDIVIDUAL = 'individual',
}

@Entity('roles')
@Index(['name'], { unique: true })
@Index(['code'], { unique: true })
@Index(['roleType'])
@Index(['roleLevel'])
@Index(['isActive'])
export class Role {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @IsString()
  @Index()
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @IsString()
  @Index()
  code: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Column({ type: 'enum', enum: RoleType, default: RoleType.BUSINESS })
  @IsEnum(RoleType)
  roleType: RoleType;

  @Column({ type: 'enum', enum: RoleLevel, default: RoleLevel.DEPARTMENTAL })
  @IsEnum(RoleLevel)
  roleLevel: RoleLevel;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isSystemRole: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isDefault: boolean;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  isAssignable: boolean;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  priority: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  department?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  organization?: string;

  // Industry 5.0 Features
  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  requiresQuantumAccess: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  requiresBlockchainAccess: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  requiresBiometricAuth: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  requiresAdvancedSecurity: boolean;

  @Column({ type: 'jsonb', nullable: true })
  securityRequirements?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  accessPolicies?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  businessRules?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  aiPermissions?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  iotDeviceAccess?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  manufacturingAccess?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  dataAccess?: Record<string, any>;

  // Compliance and Audit
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  complianceLevel?: string;

  @Column({ type: 'jsonb', nullable: true })
  auditRequirements?: Record<string, any>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  regulatoryFramework?: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  requiresApproval: boolean;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  approverRoleId?: string;

  // Timebound and Conditional Access
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  validFrom?: Date;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  validUntil?: Date;

  @Column({ type: 'jsonb', nullable: true })
  timeConstraints?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  locationConstraints?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  deviceConstraints?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  contextualAccess?: Record<string, any>;

  // Metadata and Configuration
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  configuration?: Record<string, any>;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  color?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  userCount: number;

  // Timestamps
  @CreateDateColumn()
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  @DeleteDateColumn()
  @IsOptional()
  @IsDate()
  deletedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  updatedBy?: string;

  // Relationships
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles, { eager: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  // Self-referencing for role hierarchy
  @ManyToMany(() => Role, (role) => role.childRoles)
  @JoinTable({
    name: 'role_hierarchy',
    joinColumn: { name: 'parentRoleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'childRoleId', referencedColumnName: 'id' },
  })
  parentRoles: Role[];

  @ManyToMany(() => Role, (role) => role.parentRoles)
  childRoles: Role[];

  // Computed Properties
  get isValid(): boolean {
    const now = new Date();
    if (this.validFrom && this.validFrom > now) return false;
    if (this.validUntil && this.validUntil < now) return false;
    return this.isActive;
  }

  get requiresAdvancedAuth(): boolean {
    return this.requiresBiometricAuth || this.requiresBlockchainAccess || this.requiresQuantumAccess;
  }

  get securityScore(): number {
    let score = 0;
    if (this.requiresBiometricAuth) score += 20;
    if (this.requiresBlockchainAccess) score += 30;
    if (this.requiresQuantumAccess) score += 50;
    if (this.requiresAdvancedSecurity) score += 25;
    return Math.min(score, 100);
  }

  // Methods
  @BeforeInsert()
  async beforeInsert() {
    if (!this.id) {
      this.id = uuidv4();
    }
    if (!this.code) {
      this.code = this.name.toUpperCase().replace(/\s+/g, '_');
    }
  }

  hasPermission(permissionName: string): boolean {
    return this.permissions.some(permission => permission.name === permissionName);
  }

  getPermissionNames(): string[] {
    return this.permissions.map(permission => permission.name);
  }

  getPermissionCodes(): string[] {
    return this.permissions.map(permission => permission.code);
  }

  addPermission(permission: Permission): void {
    if (!this.hasPermission(permission.name)) {
      this.permissions.push(permission);
    }
  }

  removePermission(permissionName: string): void {
    this.permissions = this.permissions.filter(permission => permission.name !== permissionName);
  }

  inheritPermissionsFrom(parentRole: Role): void {
    parentRole.permissions.forEach(permission => {
      this.addPermission(permission);
    });
  }

  isAccessAllowedAt(time: Date): boolean {
    if (!this.timeConstraints) return true;
    
    const timeOfDay = time.getHours() * 60 + time.getMinutes();
    const dayOfWeek = time.getDay();
    
    if (this.timeConstraints.allowedHours) {
      const { start, end } = this.timeConstraints.allowedHours;
      if (timeOfDay < start || timeOfDay > end) return false;
    }
    
    if (this.timeConstraints.allowedDays && !this.timeConstraints.allowedDays.includes(dayOfWeek)) {
      return false;
    }
    
    return true;
  }

  isAccessAllowedFrom(location: string): boolean {
    if (!this.locationConstraints) return true;
    
    if (this.locationConstraints.allowedLocations) {
      return this.locationConstraints.allowedLocations.includes(location);
    }
    
    if (this.locationConstraints.blockedLocations) {
      return !this.locationConstraints.blockedLocations.includes(location);
    }
    
    return true;
  }

  isAccessAllowedFromDevice(device: Record<string, any>): boolean {
    if (!this.deviceConstraints) return true;
    
    if (this.deviceConstraints.allowedDeviceTypes) {
      return this.deviceConstraints.allowedDeviceTypes.includes(device.type);
    }
    
    if (this.deviceConstraints.requiresRegisteredDevice) {
      return device.isRegistered === true;
    }
    
    if (this.deviceConstraints.requiresSecureDevice) {
      return device.isSecure === true;
    }
    
    return true;
  }

  evaluateContextualAccess(context: Record<string, any>): boolean {
    if (!this.contextualAccess) return true;
    
    // Evaluate various contextual rules
    for (const [key, rule] of Object.entries(this.contextualAccess)) {
      if (!this.evaluateRule(context, rule)) {
        return false;
      }
    }
    
    return true;
  }

  private evaluateRule(context: Record<string, any>, rule: any): boolean {
    // Simple rule evaluation - can be extended for complex business rules
    if (rule.required && !context[rule.field]) return false;
    if (rule.allowedValues && !rule.allowedValues.includes(context[rule.field])) return false;
    if (rule.blockedValues && rule.blockedValues.includes(context[rule.field])) return false;
    return true;
  }

  canBeAssignedTo(user: User): boolean {
    if (!this.isAssignable || !this.isActive) return false;
    
    // Check if user meets security requirements
    if (this.requiresBiometricAuth && !user.isBiometricEnabled) return false;
    if (this.requiresBlockchainAccess && !user.isBlockchainEnabled) return false;
    if (this.requiresQuantumAccess && !user.isQuantumEnabled) return false;
    
    // Check approval requirements
    if (this.requiresApproval) {
      // This would typically involve checking approval workflow
      return false; // Simplified for now
    }
    
    return true;
  }

  updateUserCount(): void {
    this.userCount = this.users?.length || 0;
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  setValidityPeriod(from: Date, until: Date): void {
    this.validFrom = from;
    this.validUntil = until;
  }

  extendValidity(additionalDays: number): void {
    if (this.validUntil) {
      this.validUntil = new Date(this.validUntil.getTime() + additionalDays * 24 * 60 * 60 * 1000);
    }
  }

  clone(newName: string, newCode?: string): Partial<Role> {
    return {
      name: newName,
      code: newCode || newName.toUpperCase().replace(/\s+/g, '_'),
      description: this.description,
      roleType: this.roleType,
      roleLevel: this.roleLevel,
      category: this.category,
      department: this.department,
      organization: this.organization,
      requiresQuantumAccess: this.requiresQuantumAccess,
      requiresBlockchainAccess: this.requiresBlockchainAccess,
      requiresBiometricAuth: this.requiresBiometricAuth,
      requiresAdvancedSecurity: this.requiresAdvancedSecurity,
      securityRequirements: { ...this.securityRequirements },
      accessPolicies: { ...this.accessPolicies },
      businessRules: { ...this.businessRules },
      complianceLevel: this.complianceLevel,
      regulatoryFramework: this.regulatoryFramework,
      timeConstraints: { ...this.timeConstraints },
      locationConstraints: { ...this.locationConstraints },
      deviceConstraints: { ...this.deviceConstraints },
      contextualAccess: { ...this.contextualAccess },
    };
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      description: this.description,
      roleType: this.roleType,
      roleLevel: this.roleLevel,
      isActive: this.isActive,
      isSystemRole: this.isSystemRole,
      isDefault: this.isDefault,
      isAssignable: this.isAssignable,
      priority: this.priority,
      category: this.category,
      department: this.department,
      organization: this.organization,
      requiresQuantumAccess: this.requiresQuantumAccess,
      requiresBlockchainAccess: this.requiresBlockchainAccess,
      requiresBiometricAuth: this.requiresBiometricAuth,
      requiresAdvancedSecurity: this.requiresAdvancedSecurity,
      securityScore: this.securityScore,
      userCount: this.userCount,
      permissionCount: this.permissions?.length || 0,
      isValid: this.isValid,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
