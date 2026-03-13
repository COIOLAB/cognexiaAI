/**
 * Industry 5.0 ERP Backend - Finance & Accounting Module
 * Audit Trail Data Transfer Objects
 * 
 * Complete DTOs for audit trail and compliance tracking
 * 
 * @author AI Assistant - Industry 5.0 Pioneer
 * @version 3.0.0
 * @date 2024-08-22
 * @compliance SOX, GAAP, IFRS
 */

import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  ValidateNested,
  Min,
  Max,
  Length,
  IsNotEmpty,
  IsInt,
  ArrayMinSize,
  ArrayMaxSize,
  IsDateString,
  Matches,
  IsUUID,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum AuditEventType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  APPROVE = 'approve',
  REJECT = 'reject',
  POST = 'post',
  UNPOST = 'unpost',
  REVERSE = 'reverse',
  EXPORT = 'export',
  IMPORT = 'import',
  LOGIN = 'login',
  LOGOUT = 'logout',
  ACCESS_DENIED = 'access_denied'
}

export enum AuditEntityType {
  JOURNAL_ENTRY = 'journal_entry',
  ACCOUNT = 'account',
  PAYMENT = 'payment',
  INVOICE = 'invoice',
  BUDGET = 'budget',
  ASSET = 'asset',
  TAX_RECORD = 'tax_record',
  REPORT = 'report',
  USER_SESSION = 'user_session',
  SYSTEM_CONFIG = 'system_config'
}

export enum AuditRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export class AuditDataChangeDto {
  @ApiProperty({ description: 'Field name that changed' })
  @IsString()
  @IsNotEmpty()
  fieldName: string;

  @ApiPropertyOptional({ description: 'Previous value' })
  @IsOptional()
  oldValue?: any;

  @ApiPropertyOptional({ description: 'New value' })
  @IsOptional()
  newValue?: any;

  @ApiPropertyOptional({ description: 'Field display name' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ description: 'Data type of the field' })
  @IsOptional()
  @IsString()
  dataType?: string;
}

export class AuditContextDto {
  @ApiPropertyOptional({ description: 'IP address of the user' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User agent/browser information' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Session ID' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({ description: 'Request ID for tracing' })
  @IsOptional()
  @IsString()
  requestId?: string;

  @ApiPropertyOptional({ description: 'API endpoint accessed' })
  @IsOptional()
  @IsString()
  endpoint?: string;

  @ApiPropertyOptional({ description: 'HTTP method used' })
  @IsOptional()
  @IsString()
  @Matches(/^(GET|POST|PUT|DELETE|PATCH)$/)
  httpMethod?: string;

  @ApiPropertyOptional({ description: 'Application module' })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({ description: 'Business process context' })
  @IsOptional()
  @IsString()
  businessProcess?: string;
}

export class CreateAuditTrailDto {
  @ApiProperty({ description: 'Event type', enum: AuditEventType })
  @IsEnum(AuditEventType)
  eventType: AuditEventType;

  @ApiProperty({ description: 'Entity type', enum: AuditEntityType })
  @IsEnum(AuditEntityType)
  entityType: AuditEntityType;

  @ApiProperty({ description: 'Entity ID' })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({ description: 'User ID who performed the action' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ description: 'Event description' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Risk level', enum: AuditRiskLevel })
  @IsOptional()
  @IsEnum(AuditRiskLevel)
  riskLevel?: AuditRiskLevel = AuditRiskLevel.LOW;

  @ApiPropertyOptional({ description: 'Data changes', type: [AuditDataChangeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuditDataChangeDto)
  dataChanges?: AuditDataChangeDto[];

  @ApiPropertyOptional({ description: 'Audit context', type: AuditContextDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AuditContextDto)
  context?: AuditContextDto;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Event timestamp override' })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiPropertyOptional({ description: 'Compliance tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  complianceTags?: string[];
}

export class AuditTrailResponseDto extends CreateAuditTrailDto {
  @ApiProperty({ description: 'Audit trail ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Event timestamp' })
  @IsDateString()
  timestamp: string;

  @ApiProperty({ description: 'Creation date' })
  @IsDateString()
  createdAt: string;

  @ApiPropertyOptional({ description: 'User details' })
  @IsOptional()
  @IsObject()
  userDetails?: {
    name: string;
    email: string;
    role: string;
  };

  @ApiPropertyOptional({ description: 'Entity details' })
  @IsOptional()
  @IsObject()
  entityDetails?: {
    name?: string;
    type?: string;
    reference?: string;
  };

  @ApiPropertyOptional({ description: 'Verification hash' })
  @IsOptional()
  @IsString()
  verificationHash?: string;
}

export class AuditTrailQueryDto {
  @ApiPropertyOptional({ description: 'Start date for audit trail query' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for audit trail query' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by entity type', enum: AuditEntityType })
  @IsOptional()
  @IsEnum(AuditEntityType)
  entityType?: AuditEntityType;

  @ApiPropertyOptional({ description: 'Filter by entity ID' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Filter by event types', type: [String] })
  @IsOptional()
  @IsArray()
  @IsEnum(AuditEventType, { each: true })
  eventTypes?: AuditEventType[];

  @ApiPropertyOptional({ description: 'Filter by risk level', enum: AuditRiskLevel })
  @IsOptional()
  @IsEnum(AuditRiskLevel)
  riskLevel?: AuditRiskLevel;

  @ApiPropertyOptional({ description: 'Search in descriptions' })
  @IsOptional()
  @IsString()
  searchText?: string;

  @ApiPropertyOptional({ description: 'Include data changes in results' })
  @IsOptional()
  @IsBoolean()
  includeDataChanges?: boolean = false;

  @ApiPropertyOptional({ description: 'Include context in results' })
  @IsOptional()
  @IsBoolean()
  includeContext?: boolean = false;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 50;

  @ApiPropertyOptional({ description: 'Sort by field' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'timestamp';

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsOptional()
  @IsString()
  @Matches(/^(asc|desc)$/)
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class AuditReportDto {
  @ApiProperty({ description: 'Report period start' })
  @IsDateString()
  periodStart: string;

  @ApiProperty({ description: 'Report period end' })
  @IsDateString()
  periodEnd: string;

  @ApiPropertyOptional({ description: 'Report type' })
  @IsOptional()
  @IsString()
  @IsIn(['summary', 'detailed', 'compliance', 'security'])
  reportType?: string = 'summary';

  @ApiPropertyOptional({ description: 'Include only high-risk events' })
  @IsOptional()
  @IsBoolean()
  highRiskOnly?: boolean = false;

  @ApiPropertyOptional({ description: 'Group by entity type' })
  @IsOptional()
  @IsBoolean()
  groupByEntity?: boolean = false;

  @ApiPropertyOptional({ description: 'Group by user' })
  @IsOptional()
  @IsBoolean()
  groupByUser?: boolean = false;

  @ApiPropertyOptional({ description: 'Include statistical analysis' })
  @IsOptional()
  @IsBoolean()
  includeStatistics?: boolean = true;

  @ApiPropertyOptional({ description: 'Export format' })
  @IsOptional()
  @IsString()
  @IsIn(['json', 'csv', 'pdf', 'excel'])
  format?: string = 'json';
}

export class AuditComplianceDto {
  @ApiProperty({ description: 'Compliance framework (SOX, GDPR, etc.)' })
  @IsString()
  @IsNotEmpty()
  framework: string;

  @ApiProperty({ description: 'Compliance check period start' })
  @IsDateString()
  periodStart: string;

  @ApiProperty({ description: 'Compliance check period end' })
  @IsDateString()
  periodEnd: string;

  @ApiPropertyOptional({ description: 'Specific entities to check', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entityIds?: string[];

  @ApiPropertyOptional({ description: 'Include remediation suggestions' })
  @IsOptional()
  @IsBoolean()
  includeRemediation?: boolean = true;

  @ApiPropertyOptional({ description: 'Severity threshold' })
  @IsOptional()
  @IsEnum(AuditRiskLevel)
  severityThreshold?: AuditRiskLevel = AuditRiskLevel.MEDIUM;
}

export class AuditIntegrityCheckDto {
  @ApiPropertyOptional({ description: 'Start date for integrity check' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for integrity check' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Entity types to check', type: [String] })
  @IsOptional()
  @IsArray()
  @IsEnum(AuditEntityType, { each: true })
  entityTypes?: AuditEntityType[];

  @ApiPropertyOptional({ description: 'Check data integrity' })
  @IsOptional()
  @IsBoolean()
  checkDataIntegrity?: boolean = true;

  @ApiPropertyOptional({ description: 'Check hash consistency' })
  @IsOptional()
  @IsBoolean()
  checkHashes?: boolean = true;

  @ApiPropertyOptional({ description: 'Check sequence continuity' })
  @IsOptional()
  @IsBoolean()
  checkSequence?: boolean = true;
}
