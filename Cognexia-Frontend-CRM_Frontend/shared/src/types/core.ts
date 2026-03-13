// Core Industry 5.0 ERP Types and Interfaces

export enum IndustryType {
  MANUFACTURING = 'MANUFACTURING',
  BANKING = 'BANKING',
  DEFENCE = 'DEFENCE'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  INDUSTRY_ADMIN = 'INDUSTRY_ADMIN',
  DEPARTMENT_MANAGER = 'DEPARTMENT_MANAGER',
  SUPERVISOR = 'SUPERVISOR',
  OPERATOR = 'OPERATOR',
  AUDITOR = 'AUDITOR',
  READONLY = 'READONLY'
}

export enum SecurityClearanceLevel {
  UNCLASSIFIED = 0,
  CONFIDENTIAL = 1,
  SECRET = 2,
  TOP_SECRET = 3
}

export enum ComplianceStandard {
  // Manufacturing
  ISO_9001 = 'ISO_9001',
  ISO_14001 = 'ISO_14001',
  OHSAS_18001 = 'OHSAS_18001',
  
  // Banking
  PCI_DSS = 'PCI_DSS',
  SOX = 'SOX',
  BASEL_III = 'BASEL_III',
  GDPR = 'GDPR',
  
  // Defence
  NIST_800_53 = 'NIST_800_53',
  ITAR = 'ITAR',
  CMMC = 'CMMC',
  FedRAMP = 'FedRAMP'
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
  version: number;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface User extends BaseEntity {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  industryType: IndustryType;
  securityClearance: SecurityClearanceLevel;
  department: string;
  employeeId: string;
  lastLogin?: Date;
  isLocked: boolean;
  passwordExpiresAt?: Date;
  mfaEnabled: boolean;
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

export interface Organization extends BaseEntity {
  name: string;
  code: string;
  industryType: IndustryType;
  address: Address;
  contactInfo: ContactInfo;
  complianceStandards: ComplianceStandard[];
  settings: OrganizationSettings;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website?: string;
}

export interface OrganizationSettings {
  timezone: string;
  currency: string;
  language: string;
  fiscalYearStart: string;
  features: FeatureFlags;
}

export interface FeatureFlags {
  iot: boolean;
  ai: boolean;
  blockchain: boolean;
  advancedAnalytics: boolean;
  predictiveMaintenance: boolean;
  realTimeMonitoring: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
  requestId: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditLog extends BaseEntity {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  services: ServiceHealth[];
  metrics: SystemMetrics;
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  uptime: number;
  lastCheck: Date;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    in: number;
    out: number;
  };
  database: {
    connections: number;
    queries: number;
    responseTime: number;
  };
}
