import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
  IsNumber,
  IsNotEmpty,
  IsUrl,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { WebhookEventType, WebhookStatus } from '../entities/webhook.entity';

/**
 * Create Webhook DTO
 */
export class CreateWebhookDto {
  @ApiProperty({ description: 'Webhook URL', example: 'https://example.com/webhooks' })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ description: 'Description of webhook' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Events to subscribe to', enum: WebhookEventType, isArray: true })
  @IsArray()
  @IsEnum(WebhookEventType, { each: true })
  events: WebhookEventType[];

  @ApiPropertyOptional({ description: 'Custom headers to include', type: 'object' })
  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Maximum retry attempts', minimum: 0, maximum: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  maxRetries?: number;

  @ApiPropertyOptional({ description: 'Retry delay in seconds', minimum: 10, maximum: 3600 })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(3600)
  retryDelaySeconds?: number;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * Update Webhook DTO
 */
export class UpdateWebhookDto extends PartialType(CreateWebhookDto) {
  @ApiPropertyOptional({ description: 'Webhook status', enum: WebhookStatus })
  @IsOptional()
  @IsEnum(WebhookStatus)
  status?: WebhookStatus;
}

/**
 * Test Webhook DTO
 */
export class TestWebhookDto {
  @ApiProperty({ description: 'Event type to test', enum: WebhookEventType })
  @IsEnum(WebhookEventType)
  eventType: WebhookEventType;

  @ApiPropertyOptional({ description: 'Custom payload for testing' })
  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;
}

/**
 * Webhook Query DTO
 */
export class WebhookQueryDto {
  @ApiPropertyOptional({ description: 'Filter by status', enum: WebhookStatus })
  @IsOptional()
  @IsEnum(WebhookStatus)
  status?: WebhookStatus;

  @ApiPropertyOptional({ description: 'Filter by event type', enum: WebhookEventType })
  @IsOptional()
  @IsEnum(WebhookEventType)
  eventType?: WebhookEventType;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

/**
 * Webhook Delivery Query DTO
 */
export class WebhookDeliveryQueryDto {
  @ApiPropertyOptional({ description: 'Filter by webhook ID' })
  @IsOptional()
  @IsString()
  webhookId?: string;

  @ApiPropertyOptional({ description: 'Filter by event type', enum: WebhookEventType })
  @IsOptional()
  @IsEnum(WebhookEventType)
  eventType?: WebhookEventType;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Start date', example: '2024-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date', example: '2024-12-31' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

/**
 * Retry Delivery DTO
 */
export class RetryDeliveryDto {
  @ApiPropertyOptional({ description: 'Force retry even if max retries exceeded' })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}

/**
 * Webhook Statistics Query DTO
 */
export class WebhookStatisticsQueryDto {
  @ApiPropertyOptional({ description: 'Start date', example: '2024-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date', example: '2024-12-31' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Group by field', example: 'eventType' })
  @IsOptional()
  @IsString()
  groupBy?: string;
}

/**
 * Webhook Response DTO
 */
export class WebhookResponseDto {
  @ApiProperty({ description: 'Webhook ID' })
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  organizationId: string;

  @ApiProperty({ description: 'Webhook URL' })
  url: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiProperty({ description: 'Status', enum: WebhookStatus })
  status: WebhookStatus;

  @ApiProperty({ description: 'Subscribed events', type: [String] })
  events: WebhookEventType[];

  @ApiProperty({ description: 'Secret key (masked)' })
  secret: string;

  @ApiPropertyOptional({ description: 'Custom headers' })
  headers?: Record<string, string>;

  @ApiProperty({ description: 'Maximum retry attempts' })
  maxRetries: number;

  @ApiProperty({ description: 'Retry delay in seconds' })
  retryDelaySeconds: number;

  @ApiProperty({ description: 'Success count' })
  successCount: number;

  @ApiProperty({ description: 'Failure count' })
  failureCount: number;

  @ApiPropertyOptional({ description: 'Last success timestamp' })
  lastSuccessAt?: Date;

  @ApiPropertyOptional({ description: 'Last failure timestamp' })
  lastFailureAt?: Date;

  @ApiPropertyOptional({ description: 'Last triggered timestamp' })
  lastTriggeredAt?: Date;

  @ApiProperty({ description: 'Consecutive failures' })
  consecutiveFailures: number;

  @ApiPropertyOptional({ description: 'Last error message' })
  lastError?: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}

/**
 * Webhook Delivery Response DTO
 */
export class WebhookDeliveryResponseDto {
  @ApiProperty({ description: 'Delivery ID' })
  id: string;

  @ApiProperty({ description: 'Webhook ID' })
  webhookId: string;

  @ApiProperty({ description: 'Event type', enum: WebhookEventType })
  eventType: WebhookEventType;

  @ApiPropertyOptional({ description: 'Event ID' })
  eventId?: string;

  @ApiProperty({ description: 'Delivery status' })
  status: string;

  @ApiProperty({ description: 'Attempt count' })
  attemptCount: number;

  @ApiPropertyOptional({ description: 'Response status code' })
  responseStatusCode?: number;

  @ApiPropertyOptional({ description: 'Response time in milliseconds' })
  responseTimeMs?: number;

  @ApiPropertyOptional({ description: 'Error message' })
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'Delivered at' })
  deliveredAt?: Date;

  @ApiPropertyOptional({ description: 'Next retry at' })
  nextRetryAt?: Date;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;
}

/**
 * Webhook Event Payload Interface
 */
export interface WebhookEventPayload {
  id: string;
  type: WebhookEventType;
  createdAt: Date;
  data: Record<string, any>;
  organization: {
    id: string;
    name: string;
  };
}
