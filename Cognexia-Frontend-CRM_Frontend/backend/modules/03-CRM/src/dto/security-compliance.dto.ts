import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';
import { SecurityEventType, SecuritySeverity } from '../entities/security-event.entity';
import { ComplianceStandard, ComplianceStatus } from '../entities/compliance-check.entity';

export class GetSecurityEventsDto {
  @ApiProperty({ enum: SecurityEventType, required: false })
  @IsEnum(SecurityEventType)
  @IsOptional()
  eventType?: SecurityEventType;

  @ApiProperty({ enum: SecuritySeverity, required: false })
  @IsEnum(SecuritySeverity)
  @IsOptional()
  severity?: SecuritySeverity;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  organizationId?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  resolved?: boolean;
}

export class SecurityDashboardDto {
  @ApiProperty()
  totalEvents: number;

  @ApiProperty()
  criticalEvents: number;

  @ApiProperty()
  unresolvedEvents: number;

  @ApiProperty()
  failedLoginAttempts: number;

  @ApiProperty()
  blockedIPs: number;

  @ApiProperty()
  eventsBySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };

  @ApiProperty({ type: [Object] })
  recentEvents: Array<{
    id: string;
    eventType: string;
    severity: string;
    description: string;
    createdAt: Date;
  }>;

  @ApiProperty({ type: [Object] })
  topThreats: Array<{
    type: string;
    count: number;
  }>;
}

export class ResolveSecurityEventDto {
  @ApiProperty()
  @IsString()
  eventId: string;

  @ApiProperty()
  @IsString()
  resolutionNotes: string;
}

export class IPBlocklistDto {
  @ApiProperty()
  @IsString()
  ipAddress: string;

  @ApiProperty()
  @IsString()
  reason: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}

export class ComplianceReportDto {
  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  organizationName: string;

  @ApiProperty({ type: [Object] })
  standards: Array<{
    standard: ComplianceStandard;
    status: ComplianceStatus;
    lastCheckDate: Date;
    score: number;
    passedChecks: number;
    totalChecks: number;
  }>;

  @ApiProperty()
  overallCompliance: number;

  @ApiProperty()
  criticalIssues: number;
}

export class RunComplianceCheckDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  organizationId?: string;

  @ApiProperty({ enum: ComplianceStandard })
  @IsEnum(ComplianceStandard)
  standard: ComplianceStandard;
}

export class TwoFactorStatusDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  usersWithMFA: number;

  @ApiProperty()
  mfaAdoptionRate: number;

  @ApiProperty()
  organizationsMandatingMFA: number;
}
