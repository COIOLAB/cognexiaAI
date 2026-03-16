import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkCenterType, WorkCenterStatus } from '../../entities/WorkCenter';

export class CreateWorkCenterDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(WorkCenterType)
  type: WorkCenterType;

  @IsNotEmpty()
  @IsEnum(WorkCenterStatus)
  status: WorkCenterStatus;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsObject()
  operatingHours?: {
    hoursPerDay: number;
    daysPerWeek: number;
    shiftPattern: string[];
  };

  @IsOptional()
  @IsBoolean()
  isAutomated?: boolean;

  @IsOptional()
  @IsNumber()
  setupTime?: number;

  @IsOptional()
  @IsNumber()
  teardownTime?: number;

  @IsOptional()
  @IsString()
  responsiblePerson?: string;

  @IsOptional()
  @IsObject()
  qualityStandards?: any;

  @IsOptional()
  @IsObject()
  safetyRequirements?: any;

  @IsOptional()
  @IsObject()
  maintenanceSchedule?: any;

  @IsOptional()
  @IsNumber()
  costPerHour?: number;

  @IsOptional()
  @IsObject()
  equipment?: any[];

  @IsOptional()
  @IsObject()
  tooling?: any[];

  @IsOptional()
  @IsObject()
  skills?: string[];

  @IsOptional()
  @IsObject()
  environmentalConditions?: any;

  @IsOptional()
  @IsNumber()
  energyConsumption?: number;

  @IsOptional()
  @IsObject()
  kpis?: any;

  @IsOptional()
  @IsObject()
  integrationSystems?: any;
}
