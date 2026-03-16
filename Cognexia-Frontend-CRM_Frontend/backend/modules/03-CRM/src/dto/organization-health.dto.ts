import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { RiskLevel } from '../entities/organization-health.entity';

export class GetHealthScoresQueryDto {
  @ApiProperty({ enum: RiskLevel, required: false })
  @IsEnum(RiskLevel)
  @IsOptional()
  riskLevel?: RiskLevel;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  minHealthScore?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  maxHealthScore?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minDaysSinceLogin?: number;
}

export class OrganizationHealthDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  organizationName: string;

  @ApiProperty()
  healthScore: number;

  @ApiProperty({ enum: RiskLevel })
  riskLevel: RiskLevel;

  @ApiProperty()
  indicators: {
    lastLoginDays: number;
    ticketVolume: number;
    userEngagement: number;
    featureAdoption: number;
    failedPayments: number;
    activeUsers: number;
  };

  @ApiProperty()
  recommendations: string[];

  @ApiProperty()
  lastCalculatedAt: Date;
}

export class HealthSummaryDto {
  @ApiProperty()
  totalOrganizations: number;

  @ApiProperty()
  healthyOrganizations: number; // score >= 70

  @ApiProperty()
  atRiskOrganizations: number; // score < 50

  @ApiProperty()
  criticalOrganizations: number; // score < 30

  @ApiProperty()
  averageHealthScore: number;

  @ApiProperty()
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };

  @ApiProperty({ type: [Object] })
  topIssues: Array<{ issue: string; count: number }>;
}

export class InactiveOrganizationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  daysSinceLastLogin: number;

  @ApiProperty()
  lastLoginDate: Date;

  @ApiProperty()
  tier: string;

  @ApiProperty()
  monthlyRevenue: number;

  @ApiProperty()
  contactEmail: string;
}
