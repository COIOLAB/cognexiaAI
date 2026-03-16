import { IsUUID, IsDateString, IsEnum, IsNumber, IsArray, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChurnPredictionDto {
  @ApiProperty()
  @IsUUID()
  organization_id: string;

  @ApiProperty()
  @IsDateString()
  prediction_date: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  churn_probability: number;

  @ApiProperty({ enum: ['low', 'medium', 'high', 'critical'] })
  @IsEnum(['low', 'medium', 'high', 'critical'])
  churn_risk_level: string;
}

export class ChurnPredictionQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  organization_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  risk_level?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  min_probability?: number;
}

export class CreateRevenueForecastDto {
  @ApiProperty()
  @IsDateString()
  forecast_date: string;

  @ApiProperty({ enum: ['mrr', 'arr', 'expansion', 'contraction'] })
  @IsEnum(['mrr', 'arr', 'expansion', 'contraction'])
  forecast_type: string;

  @ApiProperty()
  @IsNumber()
  forecasted_amount: number;

  @ApiProperty()
  @IsNumber()
  confidence_interval_lower: number;

  @ApiProperty()
  @IsNumber()
  confidence_interval_upper: number;
}

export class CreateRecommendationDto {
  @ApiProperty()
  @IsUUID()
  organization_id: string;

  @ApiProperty({ enum: ['onboarding', 'feature_adoption', 'pricing_tier', 'integration', 'upsell', 'retention'] })
  @IsEnum(['onboarding', 'feature_adoption', 'pricing_tier', 'integration', 'upsell', 'retention'])
  recommendation_type: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: ['low', 'medium', 'high', 'critical'] })
  @IsEnum(['low', 'medium', 'high', 'critical'])
  priority: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  confidence_score: number;
}

export class UpdateRecommendationStatusDto {
  @ApiProperty({ enum: ['pending', 'accepted', 'dismissed', 'completed'] })
  @IsEnum(['pending', 'accepted', 'dismissed', 'completed'])
  status: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dismissed_reason?: string;
}
