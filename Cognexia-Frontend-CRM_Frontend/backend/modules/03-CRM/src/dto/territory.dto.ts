import { IsString, IsEnum, IsNumber, IsBoolean, IsArray, IsOptional, ValidateNested, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AssignmentStrategy } from '../entities/territory.entity';

export class AssignmentRuleDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  field: string;

  @IsEnum(['equals', 'contains', 'in', 'greaterThan', 'lessThan', 'between'])
  operator: 'equals' | 'contains' | 'in' | 'greaterThan' | 'lessThan' | 'between';

  value: any;

  @IsNumber()
  @Min(0)
  priority: number;
}

export class TerritoryBoundaryDto {
  @IsEnum(['country', 'state', 'city', 'zipcode', 'custom'])
  type: 'country' | 'state' | 'city' | 'zipcode' | 'custom';

  @IsArray()
  @IsString({ each: true })
  values: string[];
}

export class WorkingHoursDto {
  @IsString()
  timezone: string;

  @IsOptional()
  monday?: { start: string; end: string };

  @IsOptional()
  tuesday?: { start: string; end: string };

  @IsOptional()
  wednesday?: { start: string; end: string };

  @IsOptional()
  thursday?: { start: string; end: string };

  @IsOptional()
  friday?: { start: string; end: string };

  @IsOptional()
  saturday?: { start: string; end: string };

  @IsOptional()
  sunday?: { start: string; end: string };
}

export class CreateTerritoryDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TerritoryBoundaryDto)
  @IsOptional()
  boundaries?: TerritoryBoundaryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentRuleDto)
  @IsOptional()
  assignmentRules?: AssignmentRuleDto[];

  @IsEnum(AssignmentStrategy)
  @IsOptional()
  assignmentStrategy?: AssignmentStrategy;

  @IsNumber()
  @IsOptional()
  @Min(1)
  priority?: number;

  @IsBoolean()
  @IsOptional()
  hasCapacityLimit?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxLeadsPerUser?: number;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  userIds?: string[];

  @ValidateNested()
  @Type(() => WorkingHoursDto)
  @IsOptional()
  workingHours?: WorkingHoursDto;

  @IsUUID()
  @IsOptional()
  overflowTerritoryId?: string;

  @IsBoolean()
  @IsOptional()
  sendNotificationOnAssignment?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  notificationEmails?: string[];
}

export class UpdateTerritoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TerritoryBoundaryDto)
  @IsOptional()
  boundaries?: TerritoryBoundaryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentRuleDto)
  @IsOptional()
  assignmentRules?: AssignmentRuleDto[];

  @IsEnum(AssignmentStrategy)
  @IsOptional()
  assignmentStrategy?: AssignmentStrategy;

  @IsNumber()
  @IsOptional()
  @Min(1)
  priority?: number;

  @IsBoolean()
  @IsOptional()
  hasCapacityLimit?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxLeadsPerUser?: number;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  userIds?: string[];

  @ValidateNested()
  @Type(() => WorkingHoursDto)
  @IsOptional()
  workingHours?: WorkingHoursDto;

  @IsUUID()
  @IsOptional()
  overflowTerritoryId?: string;

  @IsBoolean()
  @IsOptional()
  sendNotificationOnAssignment?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  notificationEmails?: string[];
}

export class AssignLeadToTerritoryDto {
  @IsUUID()
  leadId: string;

  @IsUUID()
  @IsOptional()
  territoryId?: string; // If not provided, auto-determine territory

  @IsBoolean()
  @IsOptional()
  forceReassignment?: boolean;
}

export class BulkAssignLeadsDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  leadIds: string[];

  @IsUUID()
  @IsOptional()
  territoryId?: string;

  @IsBoolean()
  @IsOptional()
  forceReassignment?: boolean;
}

export class RebalanceTerritoriesDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  territoryIds?: string[]; // If empty, rebalance all

  @IsEnum(['even', 'proportional', 'weighted'])
  @IsOptional()
  strategy?: 'even' | 'proportional' | 'weighted';
}

export class TerritoryStatsDto {
  territoryId: string;
  territoryName: string;
  active: boolean;
  
  totalUsers: number;
  totalLeadsAssigned: number;
  activeLeads: number;
  convertedLeads: number;
  
  conversionRate: number;
  averageLeadsPerUser: number;
  
  userStats: {
    userId: string;
    userName: string;
    activeLeads: number;
    convertedLeads: number;
    conversionRate: number;
  }[];
  
  assignmentActivity: {
    date: string;
    leadsAssigned: number;
    leadsConverted: number;
  }[];
}

export class TerritoryPerformanceDto {
  @IsUUID()
  @IsOptional()
  territoryId?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsEnum(['day', 'week', 'month'])
  @IsOptional()
  groupBy?: 'day' | 'week' | 'month';
}
