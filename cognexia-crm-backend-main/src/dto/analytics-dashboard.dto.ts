import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum AnalyticsPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export class GetAnalyticsDto {
  @ApiProperty({ enum: AnalyticsPeriod, default: AnalyticsPeriod.DAILY })
  @IsEnum(AnalyticsPeriod)
  @IsOptional()
  period?: AnalyticsPeriod = AnalyticsPeriod.DAILY;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class PlatformOverviewDto {
  @ApiProperty()
  totalActiveUsers: number;

  @ApiProperty()
  totalOrganizations: number;

  @ApiProperty()
  mrr: number;

  @ApiProperty()
  arr: number;

  @ApiProperty()
  churnRate: number;

  @ApiProperty()
  userGrowthPercentage: number;

  @ApiProperty()
  organizationGrowthPercentage: number;

  @ApiProperty()
  organizationsByTier: {
    basic: number;
    premium: number;
    advanced: number;
  };

  @ApiProperty()
  activeSessions: number;

  @ApiProperty()
  apiCallsCount: number;

  @ApiProperty()
  avgApiResponseTime: number;

  @ApiProperty()
  totalStorageUsageGB: number;
}

export class GrowthTrendDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  users: number;

  @ApiProperty()
  organizations: number;

  @ApiProperty()
  revenue: number;
}

export class UsageMetricsDto {
  @ApiProperty()
  peakUsageHour: number;

  @ApiProperty()
  avgDailyActiveUsers: number;

  @ApiProperty()
  avgSessionDuration: number;

  @ApiProperty({ type: [Object] })
  hourlyDistribution: Array<{ hour: number; count: number }>;
}
