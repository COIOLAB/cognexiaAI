import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum WorkflowStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

export enum WorkflowTriggerType {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
  EVENT = 'event',
  WEBHOOK = 'webhook',
}

export enum WorkflowActionType {
  SEND_EMAIL = 'send_email',
  CREATE_TASK = 'create_task',
  UPDATE_RECORD = 'update_record',
  WEBHOOK = 'webhook',
  WAIT = 'wait',
  CONDITION = 'condition',
}

export class WorkflowTriggerDto {
  @ApiProperty({ description: 'Trigger type', enum: WorkflowTriggerType })
  @IsEnum(WorkflowTriggerType)
  type: WorkflowTriggerType;

  @ApiProperty({ description: 'Trigger configuration' })
  @IsObject()
  config: Record<string, any>;
}

export class WorkflowActionDto {
  @ApiProperty({ description: 'Action ID (unique within workflow)' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Action type', enum: WorkflowActionType })
  @IsEnum(WorkflowActionType)
  type: WorkflowActionType;

  @ApiProperty({ description: 'Action configuration' })
  @IsObject()
  config: Record<string, any>;

  @ApiPropertyOptional({ description: 'Next action ID (null for end)' })
  @IsOptional()
  @IsString()
  nextActionId?: string | null;

  @ApiPropertyOptional({ description: 'Condition for execution' })
  @IsOptional()
  @IsObject()
  condition?: Record<string, any>;
}

export class CreateWorkflowDto {
  @ApiProperty({ description: 'Workflow name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Workflow description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Workflow trigger', type: WorkflowTriggerDto })
  @ValidateNested()
  @Type(() => WorkflowTriggerDto)
  trigger: WorkflowTriggerDto;

  @ApiProperty({ description: 'Workflow actions', type: [WorkflowActionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowActionDto)
  actions: WorkflowActionDto[];

  @ApiPropertyOptional({ description: 'Is workflow active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateWorkflowDto extends PartialType(CreateWorkflowDto) {
  @ApiPropertyOptional({ description: 'Workflow status', enum: WorkflowStatus })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;
}

export class WorkflowQueryDto {
  @ApiPropertyOptional({ description: 'Filter by status', enum: WorkflowStatus })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;

  @ApiPropertyOptional({ description: 'Filter by trigger type', enum: WorkflowTriggerType })
  @IsOptional()
  @IsEnum(WorkflowTriggerType)
  triggerType?: WorkflowTriggerType;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ExecuteWorkflowDto {
  @ApiProperty({ description: 'Workflow ID' })
  @IsString()
  @IsNotEmpty()
  workflowId: string;

  @ApiPropertyOptional({ description: 'Execution context data' })
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}
