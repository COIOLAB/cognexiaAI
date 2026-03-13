import { IsString, IsEnum, IsNumber, IsBoolean, IsArray, IsOptional, ValidateNested, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { SequenceStatus, StepType, ExitCondition } from '../entities/sales-sequence.entity';
import { EnrollmentStatus } from '../entities/sequence-enrollment.entity';

export class SequenceStepDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsNumber()
  @Min(0)
  order: number;

  @IsEnum(StepType)
  type: StepType;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  delay: number; // Minutes

  // Email step fields
  @IsString()
  @IsOptional()
  emailTemplateId?: string;

  @IsString()
  @IsOptional()
  emailSubject?: string;

  @IsString()
  @IsOptional()
  emailBody?: string;

  // Task step fields
  @IsString()
  @IsOptional()
  taskTitle?: string;

  @IsString()
  @IsOptional()
  taskDescription?: string;

  @IsString()
  @IsOptional()
  taskPriority?: string;

  @IsBoolean()
  @IsOptional()
  assignToSequenceOwner?: boolean;

  // Condition step fields
  @IsString()
  @IsOptional()
  conditionField?: string;

  @IsString()
  @IsOptional()
  conditionOperator?: string;

  @IsOptional()
  conditionValue?: any;

  @IsString()
  @IsOptional()
  onTrue?: string;

  @IsString()
  @IsOptional()
  onFalse?: string;

  // Exit conditions
  @IsArray()
  @IsEnum(ExitCondition, { each: true })
  @IsOptional()
  exitConditions?: ExitCondition[];
}

export class CreateSequenceDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SequenceStepDto)
  steps: SequenceStepDto[];

  @IsBoolean()
  @IsOptional()
  enrollOnLeadCreate?: boolean;

  @IsBoolean()
  @IsOptional()
  enrollOnStatusChange?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  enrollOnStatuses?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  enrollOnSources?: string[];

  @IsArray()
  @IsEnum(ExitCondition, { each: true })
  @IsOptional()
  exitConditions?: ExitCondition[];

  @IsBoolean()
  @IsOptional()
  limitEnrollments?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxEnrollments?: number;

  @IsBoolean()
  @IsOptional()
  preventReenrollment?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  reenrollmentDelayDays?: number;
}

export class UpdateSequenceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(SequenceStatus)
  @IsOptional()
  status?: SequenceStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SequenceStepDto)
  @IsOptional()
  steps?: SequenceStepDto[];

  @IsBoolean()
  @IsOptional()
  enrollOnLeadCreate?: boolean;

  @IsBoolean()
  @IsOptional()
  enrollOnStatusChange?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  enrollOnStatuses?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  enrollOnSources?: string[];

  @IsArray()
  @IsEnum(ExitCondition, { each: true })
  @IsOptional()
  exitConditions?: ExitCondition[];

  @IsBoolean()
  @IsOptional()
  limitEnrollments?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxEnrollments?: number;

  @IsBoolean()
  @IsOptional()
  preventReenrollment?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  reenrollmentDelayDays?: number;
}

export class EnrollLeadDto {
  @IsUUID()
  @IsOptional()
  leadId?: string;

  @IsUUID()
  @IsOptional()
  sequenceId?: string;

  @IsOptional()
  metadata?: any;
}

export class BulkEnrollLeadsDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  leadIds?: string[];

  @IsUUID()
  @IsOptional()
  sequenceId?: string;

  @IsOptional()
  metadata?: any;
}

export class UnenrollLeadDto {
  @IsUUID()
  @IsOptional()
  enrollmentId?: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class PauseEnrollmentDto {
  @IsUUID()
  enrollmentId: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  pauseDurationHours?: number;
}

export class ResumeEnrollmentDto {
  @IsUUID()
  enrollmentId: string;
}

export class SequenceAnalyticsDto {
  @IsUUID()
  sequenceId: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;
}

export class SequencePerformanceDto {
  sequenceId: string;
  sequenceName: string;
  status: SequenceStatus;
  
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  exitedEnrollments: number;
  
  conversionRate: number;
  replyRate: number;
  meetingBookedRate: number;
  
  averageStepsCompleted: number;
  averageTimeToComplete: number; // hours
  
  stepPerformance: {
    stepId: string;
    stepName: string;
    stepType: StepType;
    totalExecutions: number;
    successRate: number;
    averageDelay: number;
  }[];
  
  exitReasons: {
    reason: string;
    count: number;
    percentage: number;
  }[];
}

export class EnrollmentListDto {
  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;

  @IsUUID()
  @IsOptional()
  sequenceId?: string;

  @IsUUID()
  @IsOptional()
  leadId?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number;
}
