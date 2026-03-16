/**
 * Common DTOs - Shared Data Transfer Objects
 * 
 * Common DTOs and response structures used across multiple modules,
 * providing consistent validation, error handling, and response formatting.
 * 
 * @version 3.0.0
 * @author Industry 5.0 ERP Team
 * @compliance SOC2, ISO27001, GDPR, SOX
 */

import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsUUID, 
  IsNumber, 
  IsDateString,
  IsBoolean,
  IsArray,
  Min,
  Max
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Decimal } from 'decimal.js';

// Standard API Response DTOs
export class ApiResponseDto<T = any> {
  @ApiProperty({ description: 'Response status' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Response data' })
  data?: T;

  @ApiProperty({ description: 'Response timestamp' })
  timestamp: string;

  @ApiProperty({ description: 'Request ID for tracking' })
  requestId?: string;

  constructor(success: boolean, message: string, data?: T, requestId?: string) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
  }
}

export class ErrorResponseDto {
  @ApiProperty({ description: 'Error status', default: false })
  success: boolean = false;

  @ApiProperty({ description: 'Error message' })
  message: string;

  @ApiProperty({ description: 'Error code' })
  errorCode?: string;

  @ApiProperty({ description: 'Validation errors', required: false })
  errors?: ValidationErrorDetail[];

  @ApiProperty({ description: 'Error timestamp' })
  timestamp: string;

  @ApiProperty({ description: 'Request ID for tracking' })
  requestId?: string;

  constructor(message: string, errorCode?: string, errors?: ValidationErrorDetail[], requestId?: string) {
    this.message = message;
    this.errorCode = errorCode;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
  }
}

export class ValidationErrorDetail {
  @ApiProperty({ description: 'Field name that failed validation' })
  field: string;

  @ApiProperty({ description: 'Validation error message' })
  message: string;

  @ApiProperty({ description: 'Rejected value' })
  value?: any;
}

// Pagination DTOs
export class PaginationRequestDto {
  @ApiProperty({ description: 'Page number (1-based)', default: 1, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @ApiProperty({ description: 'Number of items per page', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value) || 20)
  limit?: number = 20;

  @ApiProperty({ description: 'Sort field', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ description: 'Sort direction', enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';

  @ApiProperty({ description: 'Search query', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}

export class PaginationMetaDto {
  @ApiProperty({ description: 'Current page number' })
  @IsNumber()
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  @IsNumber()
  limit: number;

  @ApiProperty({ description: 'Total number of items' })
  @IsNumber()
  totalItems: number;

  @ApiProperty({ description: 'Total number of pages' })
  @IsNumber()
  totalPages: number;

  @ApiProperty({ description: 'Has previous page' })
  @IsBoolean()
  hasPreviousPage: boolean;

  @ApiProperty({ description: 'Has next page' })
  @IsBoolean()
  hasNextPage: boolean;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Response data items' })
  data: T[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto })
  meta: PaginationMetaDto;

  constructor(data: T[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}

// Audit Trail DTOs
export class AuditTrailEntryDto {
  @ApiProperty({ description: 'Audit entry ID' })
  @IsUUID()
  auditId: string;

  @ApiProperty({ description: 'Action performed' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ description: 'User who performed the action' })
  @IsString()
  @IsNotEmpty()
  performedBy: string;

  @ApiProperty({ description: 'Timestamp of the action' })
  @IsDateString()
  timestamp: string;

  @ApiProperty({ description: 'Changes made' })
  changes: Record<string, any>;

  @ApiProperty({ description: 'IP address' })
  @IsString()
  ipAddress: string;

  @ApiProperty({ description: 'User agent' })
  @IsString()
  userAgent: string;

  @ApiProperty({ description: 'Session ID' })
  @IsString()
  sessionId: string;
}

// Financial Amount DTOs
export class MonetaryAmountDto {
  @ApiProperty({ description: 'Amount value', type: 'number' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => new Decimal(value).toNumber())
  amount: number;

  @ApiProperty({ description: 'Currency code', default: 'USD' })
  @IsString()
  currencyCode: string;

  @ApiProperty({ description: 'Exchange rate to base currency', type: 'number', default: 1 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @Transform(({ value }) => value ? new Decimal(value).toNumber() : 1)
  exchangeRate?: number;

  @ApiProperty({ description: 'Amount in base currency', type: 'number' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Transform(({ value }) => value ? new Decimal(value).toNumber() : undefined)
  baseAmount?: number;
}

// Date Range DTOs
export class DateRangeDto {
  @ApiProperty({ description: 'Start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date' })
  @IsDateString()
  endDate: string;
}

// Filter DTOs
export class BaseFilterDto extends PaginationRequestDto {
  @ApiProperty({ description: 'Date range filter', required: false })
  @IsOptional()
  dateRange?: DateRangeDto;

  @ApiProperty({ description: 'Entity ID filter', required: false })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({ description: 'Status filter', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Currency filter', required: false })
  @IsOptional()
  @IsString()
  currency?: string;
}

// Notification DTOs
export class NotificationDto {
  @ApiProperty({ description: 'Notification ID' })
  @IsUUID()
  notificationId: string;

  @ApiProperty({ description: 'Notification type' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: 'Notification priority', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @IsString()
  priority: string;

  @ApiProperty({ description: 'Is notification read' })
  @IsBoolean()
  isRead: boolean;

  @ApiProperty({ description: 'Notification timestamp' })
  @IsDateString()
  timestamp: string;

  @ApiProperty({ description: 'Related entity ID', required: false })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({ description: 'Action URL', required: false })
  @IsOptional()
  @IsString()
  actionUrl?: string;
}

// System Health DTOs
export class SystemHealthDto {
  @ApiProperty({ description: 'Service name' })
  @IsString()
  service: string;

  @ApiProperty({ description: 'Health status', enum: ['UP', 'DOWN', 'DEGRADED'] })
  @IsString()
  status: 'UP' | 'DOWN' | 'DEGRADED';

  @ApiProperty({ description: 'Response time in milliseconds' })
  @IsNumber()
  responseTime: number;

  @ApiProperty({ description: 'Last check timestamp' })
  @IsDateString()
  lastCheck: string;

  @ApiProperty({ description: 'Additional details' })
  details?: Record<string, any>;
}

// Export all DTOs for easy importing
export * from './chart-of-accounts.dto';
export * from './account-mapping.dto';
export * from './customer-invoice.dto';
export * from './vendor-invoice.dto';
export * from './budget.dto';
