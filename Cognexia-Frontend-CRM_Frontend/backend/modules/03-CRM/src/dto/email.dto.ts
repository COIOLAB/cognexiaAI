import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsNotEmpty,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CampaignStatus } from '../entities/email-campaign.entity';
import { SequenceTrigger, EmailSequenceStep } from '../entities/email-sequence.entity';

export class CreateEmailCampaignDto {
  @ApiProperty({ description: 'Campaign name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Email subject line' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Email template HTML' })
  @IsString()
  @IsNotEmpty()
  template: string;

  @ApiPropertyOptional({ description: 'Preview text' })
  @IsOptional()
  @IsString()
  previewText?: string;

  @ApiProperty({ description: 'Recipient emails or segment IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  recipients: string[];

  @ApiPropertyOptional({ description: 'Recipient filters' })
  @IsOptional()
  filters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Schedule send time' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class UpdateEmailCampaignDto extends PartialType(CreateEmailCampaignDto) {
  @ApiPropertyOptional({ description: 'Campaign status', enum: CampaignStatus })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}

export class EmailSequenceStepDto implements EmailSequenceStep {
  @ApiProperty({ description: 'Step number', minimum: 1 })
  @IsNumber()
  @Min(1)
  stepNumber: number;

  @ApiProperty({ description: 'Email subject' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Email template' })
  @IsString()
  @IsNotEmpty()
  template: string;

  @ApiProperty({ description: 'Delay in days after previous step', minimum: 0 })
  @IsNumber()
  @Min(0)
  delayDays: number;

  @ApiPropertyOptional({ description: 'Additional delay in hours', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  delayHours?: number;
}

export class CreateEmailSequenceDto {
  @ApiProperty({ description: 'Sequence name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Sequence description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Sequence steps', type: [EmailSequenceStepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmailSequenceStepDto)
  steps: EmailSequenceStepDto[];

  @ApiPropertyOptional({ description: 'Is sequence active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Trigger type', enum: SequenceTrigger })
  @IsEnum(SequenceTrigger)
  trigger: SequenceTrigger;

  @ApiPropertyOptional({ description: 'Trigger conditions' })
  @IsOptional()
  triggerConditions?: Record<string, any>;
}

export class UpdateEmailSequenceDto extends PartialType(CreateEmailSequenceDto) {}

export class SendEmailDto {
  @ApiProperty({ description: 'Recipient email' })
  @IsString()
  @IsNotEmpty()
  toEmail: string;

  @ApiPropertyOptional({ description: 'Recipient name' })
  @IsOptional()
  @IsString()
  toName?: string;

  @ApiProperty({ description: 'Email subject' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Email body HTML' })
  @IsString()
  @IsNotEmpty()
  bodyHtml: string;

  @ApiPropertyOptional({ description: 'Email body plain text' })
  @IsOptional()
  @IsString()
  bodyText?: string;

  @ApiPropertyOptional({ description: 'Template variables' })
  @IsOptional()
  variables?: Record<string, any>;
}

export class EmailCampaignStatsDto {
  campaignId: string;
  name: string;
  status: CampaignStatus;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}
