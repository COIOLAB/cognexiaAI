import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  IsNumber,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FormStatus } from '../entities/form.entity';

export class FormFieldDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty({ enum: ['text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio', 'file'] })
  @IsEnum(['text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio', 'file'])
  type: string;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiProperty()
  @IsBoolean()
  required: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    message?: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mapping?: string;
}

export class FormRoutingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignToUserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  assignmentRules?: Array<{
    condition: string;
    operator: string;
    value: any;
    assignToUserId: string;
  }>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultAssignee?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notifyOnSubmission?: string[];
}

export class FormDesignDto {
  @ApiPropertyOptional({ enum: ['light', 'dark'] })
  @IsOptional()
  @IsEnum(['light', 'dark'])
  theme?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  buttonText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  successMessage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  redirectUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;
}

export class CreateFormDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [FormFieldDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields: FormFieldDto[];

  @ApiPropertyOptional({ type: FormRoutingDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FormRoutingDto)
  routing?: FormRoutingDto;

  @ApiPropertyOptional({ type: FormDesignDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FormDesignDto)
  design?: FormDesignDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enableRecaptcha?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enableHoneypot?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedDomains?: string[];
}

export class UpdateFormDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: FormStatus })
  @IsOptional()
  @IsEnum(FormStatus)
  status?: FormStatus;

  @ApiPropertyOptional({ type: [FormFieldDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields?: FormFieldDto[];

  @ApiPropertyOptional({ type: FormRoutingDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FormRoutingDto)
  routing?: FormRoutingDto;

  @ApiPropertyOptional({ type: FormDesignDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FormDesignDto)
  design?: FormDesignDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enableRecaptcha?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enableHoneypot?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedDomains?: string[];
}

export class SubmitFormDto {
  @ApiProperty()
  @IsObject()
  data: { [key: string]: any };

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referrer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  utmSource?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  utmMedium?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  utmContent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  utmTerm?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recaptchaToken?: string;
}
