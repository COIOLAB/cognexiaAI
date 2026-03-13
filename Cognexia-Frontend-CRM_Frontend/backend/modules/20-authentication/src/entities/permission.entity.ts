import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  Index,
  BeforeInsert,
} from 'typeorm';
import { IsString, IsBoolean, IsOptional, IsEnum, IsDate, IsUUID, IsNumber } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { Role } from './role.entity';

export enum PermissionType {
  SYSTEM = 'system',
  MODULE = 'module',
  FEATURE = 'feature',
  ACTION = 'action',
  RESOURCE = 'resource',
  DATA = 'data',
}

export enum PermissionScope {
  GLOBAL = 'global',
  ORGANIZATIONAL = 'organizational',
  DEPARTMENTAL = 'departmental',
  TEAM = 'team',
  PERSONAL = 'personal',
}

export enum ActionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
  APPROVE = 'approve',
  REJECT = 'reject',
  EXPORT = 'export',
  IMPORT = 'import',
  ADMIN = 'admin',
}

export enum ResourceType {
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  CONFIGURATION = 'configuration',
  REPORT = 'report',
  DOCUMENT = 'document',
  WORKFLOW = 'workflow',
  DASHBOARD = 'dashboard',
  API = 'api',
  DATABASE = 'database',
  // Industry 5.0 specific resources
  MANUFACTURING_LINE = 'manufacturing_line',
  IOT_DEVICE = 'iot_device',
  AI_MODEL = 'ai_model',
  QUANTUM_SYSTEM = 'quantum_system',
  BLOCKCHAIN_NETWORK = 'blockchain_network',
  DIGITAL_TWIN = 'digital_twin',
  BIOMETRIC_SYSTEM = 'biometric_system',
}

@Entity('permissions')
@Index(['name'], { unique: true })
@Index(['code'], { unique: true })
@Index(['module'])
@Index(['resource'])
@Index(['action'])
@Index(['permissionType'])
@Index(['isActive'])
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @IsString()
  @Index()
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @IsString()
  @Index()
  code: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Column({ type: 'varchar', length: 50 })
  @IsString()
  @Index()
  module: string;

  @Column({ type: 'enum', enum: ResourceType })
  @IsEnum(ResourceType)
  @Index()
  resource: ResourceType;

  @Column({ type: 'enum', enum: ActionType })
  @IsEnum(ActionType)
  @Index()
  action: ActionType;

  @Column({ type: 'enum', enum: PermissionType, default: PermissionType.FEATURE })
  @IsEnum(PermissionType)
  @Index()
  permissionType: PermissionType;

  @Column({ type: 'enum', enum: PermissionScope, default: PermissionScope.DEPARTMENTAL })
  @IsEnum(PermissionScope)
  scope: PermissionScope;

  @Column({ type: 'boolean', default: true })
  @IsBoolean()
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isSystemPermission: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  isDangerous: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  requiresApproval: boolean;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  riskLevel: number; // 0-100

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  subcategory?: string;

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
  requiresAIValidation: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  affectsManufacturing: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  affectsIoTDevices: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  affectsDigitalTwin: boolean;

  @Column({ type: 'jsonb', nullable: true })
  securityRequirements?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  accessConditions?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  dataFilters?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  iotDeviceTypes?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  manufacturingResources?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  aiModelAccess?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  quantumOperations?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  blockchainNetworks?: Record<string, any>;

  // Compliance and Regulatory
  @Column({ type: 'varchar', length: 255, nullable: true })
  @IsOptional()
  @IsString()
  complianceFramework?: string;

  @Column({ type: 'jsonb', nullable: true })
  regulatoryRequirements?: Record<string, any>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  dataClassification?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @IsOptional()
  @IsString()
  privacyImpact?: string;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  requiresAuditLog: boolean;

  @Column({ type: 'boolean', default: false })
  @IsBoolean()
  requiresNotification: boolean;

  // Conditional Access
  @Column({ type: 'jsonb', nullable: true })
  timeConstraints?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  locationConstraints?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  deviceConstraints?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  contextualRules?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  businessRules?: Record<string, any>;

  // Dependencies and Relationships
  @Column({ type: 'jsonb', nullable: true })
  dependsOn?: string[]; // Array of permission IDs

  @Column({ type: 'jsonb', nullable: true })
  excludes?: string[]; // Array of permission IDs that conflict

  @Column({ type: 'jsonb', nullable: true })
  implies?: string[]; // Array of permission IDs that are automatically granted

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  icon?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString()
  color?: string;

  @Column({ type: 'int', default: 0 })
  @IsNumber()
  usageCount: number;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  lastUsedAt?: Date;

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
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  // Computed Properties
  get isHighRisk(): boolean {
    return this.riskLevel >= 80 || this.isDangerous;
  }

  get requiresAdvancedAuth(): boolean {
    return this.requiresBiometricAuth || this.requiresBlockchainAccess || this.requiresQuantumAccess;
  }

  get securityScore(): number {
    let score = this.riskLevel;
    if (this.requiresBiometricAuth) score += 10;
    if (this.requiresBlockchainAccess) score += 15;
    if (this.requiresQuantumAccess) score += 20;
    if (this.requiresAIValidation) score += 10;
    if (this.requiresApproval) score += 5;
    return Math.min(score, 100);
  }

  get isIndustry50(): boolean {
    return this.affectsManufacturing || 
           this.affectsIoTDevices || 
           this.affectsDigitalTwin || 
           this.requiresQuantumAccess || 
           this.requiresBlockchainAccess ||
           this.requiresAIValidation;
  }

  get fullCode(): string {
    return `${this.module}:${this.resource}:${this.action}`;
  }

  // Methods
  @BeforeInsert()
  async beforeInsert() {
    if (!this.id) {
      this.id = uuidv4();
    }
    if (!this.code) {
      this.code = this.generateCode();
    }
  }

  private generateCode(): string {
    return `${this.module.toUpperCase()}_${this.resource.toUpperCase()}_${this.action.toUpperCase()}`;
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

  evaluateBusinessRules(context: Record<string, any>): boolean {
    if (!this.businessRules) return true;
    
    for (const [key, rule] of Object.entries(this.businessRules)) {
      if (!this.evaluateRule(context, rule)) {
        return false;
      }
    }
    
    return true;
  }

  private evaluateRule(context: Record<string, any>, rule: any): boolean {
    if (rule.required && !context[rule.field]) return false;
    if (rule.allowedValues && !rule.allowedValues.includes(context[rule.field])) return false;
    if (rule.blockedValues && rule.blockedValues.includes(context[rule.field])) return false;
    if (rule.minValue && context[rule.field] < rule.minValue) return false;
    if (rule.maxValue && context[rule.field] > rule.maxValue) return false;
    return true;
  }

  isDependencyMet(userPermissions: string[]): boolean {
    if (!this.dependsOn || this.dependsOn.length === 0) return true;
    return this.dependsOn.every(depId => userPermissions.includes(depId));
  }

  hasConflicts(userPermissions: string[]): boolean {
    if (!this.excludes || this.excludes.length === 0) return false;
    return this.excludes.some(excludeId => userPermissions.includes(excludeId));
  }

  getImpliedPermissions(): string[] {
    return this.implies || [];
  }

  checkDataFilter(data: Record<string, any>): boolean {
    if (!this.dataFilters) return true;
    
    for (const [field, filter] of Object.entries(this.dataFilters)) {
      if (!this.checkFieldFilter(data[field], filter)) {
        return false;
      }
    }
    
    return true;
  }

  private checkFieldFilter(value: any, filter: any): boolean {
    if (filter.allowedValues && !filter.allowedValues.includes(value)) return false;
    if (filter.blockedValues && filter.blockedValues.includes(value)) return false;
    if (filter.pattern && !new RegExp(filter.pattern).test(value)) return false;
    return true;
  }

  canAccessIoTDevice(deviceType: string, deviceId: string): boolean {
    if (!this.affectsIoTDevices) return false;
    if (!this.iotDeviceTypes) return true;
    
    if (this.iotDeviceTypes.allowedTypes) {
      if (!this.iotDeviceTypes.allowedTypes.includes(deviceType)) return false;
    }
    
    if (this.iotDeviceTypes.allowedDevices) {
      if (!this.iotDeviceTypes.allowedDevices.includes(deviceId)) return false;
    }
    
    return true;
  }

  canAccessManufacturingResource(resourceType: string, resourceId: string): boolean {
    if (!this.affectsManufacturing) return false;
    if (!this.manufacturingResources) return true;
    
    if (this.manufacturingResources.allowedTypes) {
      if (!this.manufacturingResources.allowedTypes.includes(resourceType)) return false;
    }
    
    if (this.manufacturingResources.allowedResources) {
      if (!this.manufacturingResources.allowedResources.includes(resourceId)) return false;
    }
    
    return true;
  }

  canAccessAIModel(modelType: string, modelId: string): boolean {
    if (!this.requiresAIValidation) return false;
    if (!this.aiModelAccess) return true;
    
    if (this.aiModelAccess.allowedModels) {
      if (!this.aiModelAccess.allowedModels.includes(modelId)) return false;
    }
    
    if (this.aiModelAccess.allowedTypes) {
      if (!this.aiModelAccess.allowedTypes.includes(modelType)) return false;
    }
    
    return true;
  }

  canPerformQuantumOperation(operation: string): boolean {
    if (!this.requiresQuantumAccess) return false;
    if (!this.quantumOperations) return true;
    
    if (this.quantumOperations.allowedOperations) {
      return this.quantumOperations.allowedOperations.includes(operation);
    }
    
    return true;
  }

  canAccessBlockchainNetwork(networkId: string): boolean {
    if (!this.requiresBlockchainAccess) return false;
    if (!this.blockchainNetworks) return true;
    
    if (this.blockchainNetworks.allowedNetworks) {
      return this.blockchainNetworks.allowedNetworks.includes(networkId);
    }
    
    return true;
  }

  incrementUsage(): void {
    this.usageCount += 1;
    this.lastUsedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  setRiskLevel(level: number): void {
    this.riskLevel = Math.max(0, Math.min(100, level));
    this.isDangerous = level >= 80;
  }

  clone(newName: string, newCode?: string): Partial<Permission> {
    return {
      name: newName,
      code: newCode || this.generateCodeFromName(newName),
      description: this.description,
      module: this.module,
      resource: this.resource,
      action: this.action,
      permissionType: this.permissionType,
      scope: this.scope,
      category: this.category,
      subcategory: this.subcategory,
      riskLevel: this.riskLevel,
      requiresQuantumAccess: this.requiresQuantumAccess,
      requiresBlockchainAccess: this.requiresBlockchainAccess,
      requiresBiometricAuth: this.requiresBiometricAuth,
      requiresAIValidation: this.requiresAIValidation,
      affectsManufacturing: this.affectsManufacturing,
      affectsIoTDevices: this.affectsIoTDevices,
      affectsDigitalTwin: this.affectsDigitalTwin,
      securityRequirements: { ...this.securityRequirements },
      accessConditions: { ...this.accessConditions },
      dataFilters: { ...this.dataFilters },
      complianceFramework: this.complianceFramework,
      dataClassification: this.dataClassification,
      timeConstraints: { ...this.timeConstraints },
      locationConstraints: { ...this.locationConstraints },
      deviceConstraints: { ...this.deviceConstraints },
      businessRules: { ...this.businessRules },
    };
  }

  private generateCodeFromName(name: string): string {
    return name.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      fullCode: this.fullCode,
      description: this.description,
      module: this.module,
      resource: this.resource,
      action: this.action,
      permissionType: this.permissionType,
      scope: this.scope,
      isActive: this.isActive,
      isSystemPermission: this.isSystemPermission,
      isDangerous: this.isDangerous,
      requiresApproval: this.requiresApproval,
      riskLevel: this.riskLevel,
      category: this.category,
      subcategory: this.subcategory,
      requiresQuantumAccess: this.requiresQuantumAccess,
      requiresBlockchainAccess: this.requiresBlockchainAccess,
      requiresBiometricAuth: this.requiresBiometricAuth,
      requiresAIValidation: this.requiresAIValidation,
      affectsManufacturing: this.affectsManufacturing,
      affectsIoTDevices: this.affectsIoTDevices,
      affectsDigitalTwin: this.affectsDigitalTwin,
      isHighRisk: this.isHighRisk,
      requiresAdvancedAuth: this.requiresAdvancedAuth,
      securityScore: this.securityScore,
      isIndustry50: this.isIndustry50,
      usageCount: this.usageCount,
      lastUsedAt: this.lastUsedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
