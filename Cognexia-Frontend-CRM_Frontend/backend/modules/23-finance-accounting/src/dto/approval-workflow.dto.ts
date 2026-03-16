/**
 * Industry 5.0 ERP Backend - Finance & Accounting Module
 * Approval Workflow Data Transfer Objects
 * 
 * Complete DTOs for multi-level approval workflows and automation
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
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum WorkflowStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum ApprovalAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  DELEGATE = 'delegate',
  REQUEST_INFO = 'request_info',
  ESCALATE = 'escalate'
}

export enum WorkflowType {
  JOURNAL_ENTRY = 'journal_entry',
  PAYMENT = 'payment',
  INVOICE = 'invoice',
  BUDGET = 'budget',
  ASSET_DISPOSAL = 'asset_disposal',
  TAX_ADJUSTMENT = 'tax_adjustment',
  PERIOD_CLOSE = 'period_close',
  CUSTOM = 'custom'
}

export enum EscalationTrigger {
  TIMEOUT = 'timeout',
  AMOUNT_THRESHOLD = 'amount_threshold',
  MANUAL = 'manual',
  RISK_SCORE = 'risk_score',
  COMPLIANCE_ISSUE = 'compliance_issue'
}

export class ApprovalLevelDto {
  @ApiProperty({ description: 'Approval level number' })
  @IsInt()
  @Min(1)
  @Max(10)
  level: number;

  @ApiProperty({ description: 'Level name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: 'Required approver user IDs', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  approvers: string[];

  @ApiPropertyOptional({ description: 'Minimum approvals required' })
  @IsOptional()
  @IsInt()
  @Min(1)
  minApprovals?: number = 1;

  @ApiPropertyOptional({ description: 'Approval timeout in hours' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(720) // 30 days
  timeoutHours?: number = 72;

  @ApiPropertyOptional({ description: 'Auto-escalation enabled' })
  @IsOptional()
  @IsBoolean()
  autoEscalate?: boolean = true;

  @ApiPropertyOptional({ description: 'Escalation approvers', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  escalationApprovers?: string[];

  @ApiPropertyOptional({ description: 'Allow delegation' })
  @IsOptional()
  @IsBoolean()
  allowDelegation?: boolean = true;
}

export class WorkflowConditionDto {
  @ApiProperty({ description: 'Condition name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: 'Condition field path' })
  @IsString()
  @IsNotEmpty()
  fieldPath: string;

  @ApiProperty({ description: 'Operator (eq, gt, lt, gte, lte, in, contains)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(eq|gt|lt|gte|lte|in|contains|between)$/)
  operator: string;

  @ApiProperty({ description: 'Comparison value' })
  value: any;

  @ApiPropertyOptional({ description: 'Logical operator for multiple conditions' })
  @IsOptional()
  @IsString()
  @Matches(/^(and|or)$/)
  logicalOperator?: string = 'and';
}

export class NotificationSettingsDto {
  @ApiPropertyOptional({ description: 'Send email notifications' })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean = true;

  @ApiPropertyOptional({ description: 'Send SMS notifications' })
  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean = false;

  @ApiPropertyOptional({ description: 'Send in-app notifications' })
  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean = true;

  @ApiPropertyOptional({ description: 'Reminder frequency in hours' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(168) // 7 days
  reminderFrequency?: number = 24;

  @ApiPropertyOptional({ description: 'Maximum reminders' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxReminders?: number = 3;

  @ApiPropertyOptional({ description: 'Custom email template' })
  @IsOptional()
  @IsString()
  emailTemplate?: string;
}

export class CreateWorkflowTemplateDto {
  @ApiProperty({ description: 'Workflow template name' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  name: string;

  @ApiProperty({ description: 'Workflow type', enum: WorkflowType })
  @IsEnum(WorkflowType)
  workflowType: WorkflowType;

  @ApiPropertyOptional({ description: 'Template description' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiProperty({ description: 'Approval levels', type: [ApprovalLevelDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ApprovalLevelDto)
  approvalLevels: ApprovalLevelDto[];

  @ApiPropertyOptional({ description: 'Workflow conditions', type: [WorkflowConditionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowConditionDto)
  conditions?: WorkflowConditionDto[];

  @ApiPropertyOptional({ description: 'Notification settings', type: NotificationSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notifications?: NotificationSettingsDto;

  @ApiPropertyOptional({ description: 'Template is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ description: 'Auto-start workflow' })
  @IsOptional()
  @IsBoolean()
  autoStart?: boolean = false;

  @ApiPropertyOptional({ description: 'Parallel approval allowed' })
  @IsOptional()
  @IsBoolean()
  allowParallel?: boolean = false;

  @ApiPropertyOptional({ description: 'Required fields for approval', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredFields?: string[];
}

export class UpdateWorkflowTemplateDto extends PartialType(CreateWorkflowTemplateDto) {}

export class WorkflowTemplateResponseDto extends CreateWorkflowTemplateDto {
  @ApiProperty({ description: 'Template ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Creation date' })
  @IsDateString()
  createdAt: string;

  @ApiProperty({ description: 'Last update date' })
  @IsDateString()
  updatedAt: string;

  @ApiProperty({ description: 'Created by user ID' })
  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @ApiPropertyOptional({ description: 'Last modified by user ID' })
  @IsOptional()
  @IsString()
  lastModifiedBy?: string;

  @ApiPropertyOptional({ description: 'Usage count' })
  @IsOptional()
  @IsInt()
  @Min(0)
  usageCount?: number = 0;
}

export class ApprovalStepDto {
  @ApiProperty({ description: 'Step ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Approval level' })
  @IsInt()
  @Min(1)
  level: number;

  @ApiProperty({ description: 'Approver user ID' })
  @IsString()
  @IsNotEmpty()
  approverId: string;

  @ApiProperty({ description: 'Step status', enum: WorkflowStatus })
  @IsEnum(WorkflowStatus)
  status: WorkflowStatus;

  @ApiPropertyOptional({ description: 'Assigned date' })
  @IsOptional()
  @IsDateString()
  assignedAt?: string;

  @ApiPropertyOptional({ description: 'Action taken date' })
  @IsOptional()
  @IsDateString()
  actionTakenAt?: string;

  @ApiPropertyOptional({ description: 'Action taken', enum: ApprovalAction })
  @IsOptional()
  @IsEnum(ApprovalAction)
  action?: ApprovalAction;

  @ApiPropertyOptional({ description: 'Approval comments' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  comments?: string;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Delegated to user ID' })
  @IsOptional()
  @IsString()
  delegatedTo?: string;
}

export class CreateWorkflowInstanceDto {
  @ApiProperty({ description: 'Workflow template ID' })
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({ description: 'Entity ID (transaction, document, etc.)' })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({ description: 'Entity type' })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiPropertyOptional({ description: 'Entity data for condition evaluation' })
  @IsOptional()
  @IsObject()
  entityData?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Workflow title' })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  title?: string;

  @ApiPropertyOptional({ description: 'Workflow description' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Priority level (1-10)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  priority?: number = 5;

  @ApiPropertyOptional({ description: 'Due date override' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Skip certain levels', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  skipLevels?: number[];
}

export class WorkflowInstanceResponseDto {
  @ApiProperty({ description: 'Workflow instance ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Workflow template ID' })
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({ description: 'Entity ID' })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({ description: 'Entity type' })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({ description: 'Workflow status', enum: WorkflowStatus })
  @IsEnum(WorkflowStatus)
  status: WorkflowStatus;

  @ApiProperty({ description: 'Current approval level' })
  @IsInt()
  @Min(0)
  currentLevel: number;

  @ApiProperty({ description: 'Approval steps', type: [ApprovalStepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalStepDto)
  approvalSteps: ApprovalStepDto[];

  @ApiProperty({ description: 'Creation date' })
  @IsDateString()
  createdAt: string;

  @ApiPropertyOptional({ description: 'Started date' })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiPropertyOptional({ description: 'Completed date' })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiProperty({ description: 'Created by user ID' })
  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @ApiPropertyOptional({ description: 'Workflow title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Priority level' })
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class ApprovalActionDto {
  @ApiProperty({ description: 'Workflow instance ID' })
  @IsString()
  @IsNotEmpty()
  workflowId: string;

  @ApiProperty({ description: 'Approval step ID' })
  @IsString()
  @IsNotEmpty()
  stepId: string;

  @ApiProperty({ description: 'Action to take', enum: ApprovalAction })
  @IsEnum(ApprovalAction)
  action: ApprovalAction;

  @ApiPropertyOptional({ description: 'Action comments' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  comments?: string;

  @ApiPropertyOptional({ description: 'Delegate to user ID (for delegate action)' })
  @IsOptional()
  @IsString()
  delegateToUserId?: string;

  @ApiPropertyOptional({ description: 'Escalate to user ID (for escalate action)' })
  @IsOptional()
  @IsString()
  escalateToUserId?: string;

  @ApiPropertyOptional({ description: 'Additional data for decision' })
  @IsOptional()
  @IsObject()
  additionalData?: Record<string, any>;
}

export class BulkApprovalDto {
  @ApiProperty({ description: 'Workflow instance IDs to approve', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsString({ each: true })
  workflowIds: string[];

  @ApiProperty({ description: 'Bulk action', enum: ApprovalAction })
  @IsEnum(ApprovalAction)
  action: ApprovalAction;

  @ApiPropertyOptional({ description: 'Bulk comments' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  comments?: string;
}

export class WorkflowAnalyticsDto {
  @ApiPropertyOptional({ description: 'Date range start' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Date range end' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Workflow types to analyze', type: [String] })
  @IsOptional()
  @IsArray()
  @IsEnum(WorkflowType, { each: true })
  workflowTypes?: WorkflowType[];

  @ApiPropertyOptional({ description: 'Specific approvers to analyze', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  approvers?: string[];

  @ApiPropertyOptional({ description: 'Include performance metrics' })
  @IsOptional()
  @IsBoolean()
  includePerformance?: boolean = true;

  @ApiPropertyOptional({ description: 'Include bottleneck analysis' })
  @IsOptional()
  @IsBoolean()
  includeBottlenecks?: boolean = true;
}

export class WorkflowEscalationDto {
  @ApiProperty({ description: 'Workflow instance ID' })
  @IsString()
  @IsNotEmpty()
  workflowId: string;

  @ApiProperty({ description: 'Current step ID' })
  @IsString()
  @IsNotEmpty()
  stepId: string;

  @ApiProperty({ description: 'Escalation trigger', enum: EscalationTrigger })
  @IsEnum(EscalationTrigger)
  trigger: EscalationTrigger;

  @ApiProperty({ description: 'Escalate to user ID' })
  @IsString()
  @IsNotEmpty()
  escalateToUserId: string;

  @ApiPropertyOptional({ description: 'Escalation reason' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  reason?: string;

  @ApiPropertyOptional({ description: 'New due date' })
  @IsOptional()
  @IsDateString()
  newDueDate?: string;
}
