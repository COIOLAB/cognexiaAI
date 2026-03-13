# Script to generate all missing entities for CRM module
$ErrorActionPreference = "Stop"

Write-Host "`n=== Generating Missing Entities ===`n" -ForegroundColor Magenta

# Define entity templates
$entities = @{
    "sla.entity.ts" = @"
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum SLAPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum SLAStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

@Entity('slas')
export class SLA {
  @ApiProperty({ description: 'SLA UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'SLA name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Priority', enum: SLAPriority })
  @Column({ type: 'simple-enum', enum: SLAPriority })
  priority: SLAPriority;

  @ApiProperty({ description: 'Status', enum: SLAStatus })
  @Column({ type: 'simple-enum', enum: SLAStatus, default: SLAStatus.ACTIVE })
  status: SLAStatus;

  @ApiProperty({ description: 'Response time in minutes' })
  @Column({ default: 60 })
  responseTimeMinutes: number;

  @ApiProperty({ description: 'Resolution time in hours' })
  @Column({ default: 24 })
  resolutionTimeHours: number;

  @ApiProperty({ description: 'Description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @UpdateDateColumn()
  updatedAt: Date;
}
"@

    "master-organization.entity.ts" = @"
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('master_organizations')
export class MasterOrganization {
  @ApiProperty({ description: 'Master Organization UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Master organization name' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Contact email' })
  @Column({ nullable: true })
  contactEmail?: string;

  @ApiProperty({ description: 'Is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @UpdateDateColumn()
  updatedAt: Date;
}
"@

    "subscription-plan.entity.ts" = @"
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum PlanType {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

export enum BillingInterval {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

@Entity('subscription_plans')
export class SubscriptionPlan {
  @ApiProperty({ description: 'Plan UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Plan name' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Plan type', enum: PlanType })
  @Column({ type: 'simple-enum', enum: PlanType })
  planType: PlanType;

  @ApiProperty({ description: 'Price' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: 'Billing interval', enum: BillingInterval })
  @Column({ type: 'simple-enum', enum: BillingInterval, default: BillingInterval.MONTHLY })
  billingInterval: BillingInterval;

  @ApiProperty({ description: 'Included users' })
  @Column({ default: 5 })
  includedUsers: number;

  @ApiProperty({ description: 'Trial days' })
  @Column({ default: 14 })
  trialDays: number;

  @ApiProperty({ description: 'Features' })
  @Column({ type: 'json' })
  features: string[];

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @UpdateDateColumn()
  updatedAt: Date;
}
"@

    "usage-metric.entity.ts" = @"
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum MetricType {
  USER_COUNT = 'user_count',
  API_CALLS = 'api_calls',
  STORAGE_USED = 'storage_used',
}

@Entity('usage_metrics')
@Index(['organizationId', 'metricType', 'recordedAt'])
export class UsageMetric {
  @ApiProperty({ description: 'Metric UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  @Column()
  organizationId: string;

  @ApiProperty({ description: 'Metric type', enum: MetricType })
  @Column({ type: 'simple-enum', enum: MetricType })
  metricType: MetricType;

  @ApiProperty({ description: 'Metric value' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  value: number;

  @ApiProperty({ description: 'Recorded at' })
  @CreateDateColumn()
  recordedAt: Date;
}
"@

    "audit-log.entity.ts" = @"
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

export enum AuditEntityType {
  USER = 'user',
  ORGANIZATION = 'organization',
  CUSTOMER = 'customer',
  LEAD = 'lead',
}

@Entity('audit_logs')
@Index(['organizationId', 'createdAt'])
export class AuditLog {
  @ApiProperty({ description: 'Audit log UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  @Column()
  organizationId: string;

  @ApiProperty({ description: 'User ID' })
  @Column()
  userId: string;

  @ApiProperty({ description: 'Action', enum: AuditAction })
  @Column({ type: 'simple-enum', enum: AuditAction })
  action: AuditAction;

  @ApiProperty({ description: 'Entity type', enum: AuditEntityType })
  @Column({ type: 'simple-enum', enum: AuditEntityType })
  entityType: AuditEntityType;

  @ApiProperty({ description: 'Entity ID' })
  @Column()
  entityId: string;

  @ApiProperty({ description: 'Description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;
}
"@

    "onboarding-session.entity.ts" = @"
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum OnboardingStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('onboarding_sessions')
export class OnboardingSession {
  @ApiProperty({ description: 'Session UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  @Column()
  organizationId: string;

  @ApiProperty({ description: 'User ID' })
  @Column()
  userId: string;

  @ApiProperty({ description: 'Status', enum: OnboardingStatus })
  @Column({ type: 'simple-enum', enum: OnboardingStatus, default: OnboardingStatus.NOT_STARTED })
  status: OnboardingStatus;

  @ApiProperty({ description: 'Current step' })
  @Column({ default: 0 })
  currentStep: number;

  @ApiProperty({ description: 'Total steps' })
  @Column({ default: 5 })
  totalSteps: number;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @UpdateDateColumn()
  updatedAt: Date;
}
"@

    "webhook.entity.ts" = @"
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum WebhookEventType {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  ORGANIZATION_CREATED = 'organization.created',
}

@Entity('webhooks')
export class Webhook {
  @ApiProperty({ description: 'Webhook UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  @Column()
  organizationId: string;

  @ApiProperty({ description: 'URL' })
  @Column()
  url: string;

  @ApiProperty({ description: 'Event types' })
  @Column({ type: 'json' })
  eventTypes: WebhookEventType[];

  @ApiProperty({ description: 'Is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Secret' })
  @Column()
  secret: string;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @UpdateDateColumn()
  updatedAt: Date;
}
"@

    "webhook-delivery.entity.ts" = @"
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum DeliveryStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('webhook_deliveries')
export class WebhookDelivery {
  @ApiProperty({ description: 'Delivery UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Webhook ID' })
  @Column()
  webhookId: string;

  @ApiProperty({ description: 'Event type' })
  @Column()
  eventType: string;

  @ApiProperty({ description: 'Status', enum: DeliveryStatus })
  @Column({ type: 'simple-enum', enum: DeliveryStatus, default: DeliveryStatus.PENDING })
  status: DeliveryStatus;

  @ApiProperty({ description: 'Response code' })
  @Column({ nullable: true })
  responseCode?: number;

  @ApiProperty({ description: 'Response body' })
  @Column({ type: 'text', nullable: true })
  responseBody?: string;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;
}
"@

    "erp-connection.entity.ts" = @"
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('erp_connections')
export class ERPConnection {
  @ApiProperty({ description: 'Connection UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Organization ID' })
  @Column()
  organizationId: string;

  @ApiProperty({ description: 'ERP system name' })
  @Column()
  systemName: string;

  @ApiProperty({ description: 'Connection string' })
  @Column({ type: 'text' })
  connectionString: string;

  @ApiProperty({ description: 'Is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  @UpdateDateColumn()
  updatedAt: Date;
}
"@

    "erp-field-mapping.entity.ts" = @"
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ERPSystem {
  ODOO = 'odoo',
  SAP = 'sap',
  ORACLE = 'oracle',
  CUSTOM = 'custom',
}

@Entity('erp_field_mappings')
export class ERPFieldMapping {
  @ApiProperty({ description: 'Mapping UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Connection ID' })
  @Column()
  connectionId: string;

  @ApiProperty({ description: 'Source field' })
  @Column()
  sourceField: string;

  @ApiProperty({ description: 'Target field' })
  @Column()
  targetField: string;

  @ApiProperty({ description: 'Created at' })
  @CreateDateColumn()
  createdAt: Date;
}
"@
}

# Create entities
$createdCount = 0
foreach ($entityFile in $entities.Keys) {
    $filePath = "src/entities/$entityFile"
    
    if (Test-Path $filePath) {
        Write-Host "Skipping (already exists): $entityFile" -ForegroundColor Yellow
    } else {
        Set-Content -Path $filePath -Value $entities[$entityFile]
        Write-Host "Created: $entityFile" -ForegroundColor Green
        $createdCount++
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Magenta
Write-Host "Created $createdCount new entity files" -ForegroundColor Green
Write-Host "Skipped $($entities.Count - $createdCount) existing files" -ForegroundColor Yellow
Write-Host "`nAll entities generated successfully!`n" -ForegroundColor Green
