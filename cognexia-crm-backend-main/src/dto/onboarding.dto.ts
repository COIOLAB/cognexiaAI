import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
  IsNumber,
  IsNotEmpty,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { OnboardingType, OnboardingStepType } from '../entities/onboarding-session.entity';

/**
 * Start Onboarding DTO
 */
export class StartOnboardingDto {
  @ApiProperty({ description: 'Onboarding type', enum: OnboardingType })
  @IsEnum(OnboardingType)
  type: OnboardingType;

  @ApiPropertyOptional({ description: 'Industry', example: 'Technology' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: 'Company size', example: '11-50' })
  @IsOptional()
  @IsString()
  companySize?: string;

  @ApiPropertyOptional({ description: 'Primary use case', example: 'Sales CRM' })
  @IsOptional()
  @IsString()
  primaryUseCase?: string;

  @ApiPropertyOptional({ description: 'Interested features', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interestedFeatures?: string[];

  @ApiPropertyOptional({ description: 'User responses to onboarding survey' })
  @IsOptional()
  @IsObject()
  userResponses?: Record<string, any>;
}

/**
 * Complete Step DTO
 */
export class CompleteStepDto {
  @ApiProperty({ description: 'Step type to complete', enum: OnboardingStepType })
  @IsEnum(OnboardingStepType)
  stepType: OnboardingStepType;

  @ApiPropertyOptional({ description: 'Step metadata/data collected' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Time spent on step (minutes)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpentMinutes?: number;
}

/**
 * Skip Step DTO
 */
export class SkipStepDto {
  @ApiProperty({ description: 'Step type to skip', enum: OnboardingStepType })
  @IsEnum(OnboardingStepType)
  stepType: OnboardingStepType;

  @ApiPropertyOptional({ description: 'Reason for skipping' })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * Update Progress DTO
 */
export class UpdateProgressDto {
  @ApiPropertyOptional({ description: 'Current step index' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentStepIndex?: number;

  @ApiPropertyOptional({ description: 'Time spent (minutes)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpentMinutes?: number;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * Update Onboarding Settings DTO
 */
export class UpdateOnboardingSettingsDto {
  @ApiPropertyOptional({ description: 'Show tips during onboarding' })
  @IsOptional()
  @IsBoolean()
  showTips?: boolean;

  @ApiPropertyOptional({ description: 'Send reminder emails' })
  @IsOptional()
  @IsBoolean()
  sendReminders?: boolean;

  @ApiPropertyOptional({ description: 'Auto-advance to next step' })
  @IsOptional()
  @IsBoolean()
  autoAdvance?: boolean;
}

/**
 * Complete Checklist Item DTO
 */
export class CompleteChecklistItemDto {
  @ApiProperty({ description: 'Checklist item ID' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiPropertyOptional({ description: 'Completion notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * Request Help DTO
 */
export class RequestHelpDto {
  @ApiPropertyOptional({ description: 'Current step type', enum: OnboardingStepType })
  @IsOptional()
  @IsEnum(OnboardingStepType)
  stepType?: OnboardingStepType;

  @ApiPropertyOptional({ description: 'Help request message' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Contact preference', example: 'email' })
  @IsOptional()
  @IsString()
  contactPreference?: string;
}

/**
 * Abandon Onboarding DTO
 */
export class AbandonOnboardingDto {
  @ApiPropertyOptional({ description: 'Reason for abandoning' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Feedback notes' })
  @IsOptional()
  @IsString()
  feedbackNotes?: string;
}

/**
 * Submit Feedback DTO
 */
export class SubmitFeedbackDto {
  @ApiProperty({ description: 'Feedback rating (1-5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Feedback comments' })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({ description: 'What did you like?' })
  @IsOptional()
  @IsString()
  liked?: string;

  @ApiPropertyOptional({ description: 'What could be improved?' })
  @IsOptional()
  @IsString()
  improvement?: string;
}

/**
 * Claim Reward DTO
 */
export class ClaimRewardDto {
  @ApiProperty({ description: 'Reward type', example: 'free_credits' })
  @IsOptional()
  @IsString()
  rewardType?: string;

  @ApiPropertyOptional({ description: 'Reward metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * Get Onboarding Query DTO
 */
export class GetOnboardingQueryDto {
  @ApiPropertyOptional({ description: 'Filter by type', enum: OnboardingType })
  @IsOptional()
  @IsEnum(OnboardingType)
  type?: OnboardingType;

  @ApiPropertyOptional({ description: 'Include completed sessions' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeCompleted?: boolean;
}

/**
 * Onboarding Analytics Query DTO
 */
export class OnboardingAnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Start date', example: '2024-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date', example: '2024-12-31' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Group by field', example: 'industry' })
  @IsOptional()
  @IsString()
  groupBy?: string;
}

/**
 * Onboarding Response DTO
 */
export class OnboardingResponseDto {
  @ApiProperty({ description: 'Session ID' })
  id: string;

  @ApiProperty({ description: 'Onboarding type', enum: OnboardingType })
  type: OnboardingType;

  @ApiProperty({ description: 'Onboarding status' })
  status: string;

  @ApiProperty({ description: 'Organization ID' })
  organizationId: string;

  @ApiPropertyOptional({ description: 'User ID' })
  userId?: string;

  @ApiProperty({ description: 'Onboarding steps' })
  steps: any[];

  @ApiProperty({ description: 'Current step index' })
  currentStepIndex: number;

  @ApiProperty({ description: 'Completed steps count' })
  completedSteps: number;

  @ApiProperty({ description: 'Total steps' })
  totalSteps: number;

  @ApiProperty({ description: 'Progress percentage' })
  progressPercentage: number;

  @ApiProperty({ description: 'Checklist items' })
  checklist: any[];

  @ApiPropertyOptional({ description: 'Industry' })
  industry?: string;

  @ApiPropertyOptional({ description: 'Company size' })
  companySize?: string;

  @ApiPropertyOptional({ description: 'Primary use case' })
  primaryUseCase?: string;

  @ApiPropertyOptional({ description: 'Started at' })
  startedAt?: Date;

  @ApiPropertyOptional({ description: 'Completed at' })
  completedAt?: Date;

  @ApiProperty({ description: 'Last activity at' })
  lastActivityAt?: Date;

  @ApiProperty({ description: 'Time spent (minutes)' })
  timeSpentMinutes: number;

  @ApiProperty({ description: 'Session count' })
  sessionCount: number;

  @ApiProperty({ description: 'Show tips' })
  showTips: boolean;

  @ApiProperty({ description: 'Send reminders' })
  sendReminders: boolean;

  @ApiProperty({ description: 'Auto advance' })
  autoAdvance: boolean;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}
