import { Expose } from 'class-transformer';
import { WorkCenterType, WorkCenterStatus } from '../entities/WorkCenter';

export class WorkCenterResponseDto {
  @Expose()
  id: string;

  @Expose()
  code: string;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  type: WorkCenterType;

  @Expose()
  status: WorkCenterStatus;

  @Expose()
  location?: string;

  @Expose()
  capacity?: number;

  @Expose()
  operatingHours?: {
    hoursPerDay: number;
    daysPerWeek: number;
    shiftPattern: string[];
  };

  @Expose()
  efficiency?: number;

  @Expose()
  qualityMetrics?: any;

  @Expose()
  safetyMetrics?: any;

  @Expose()
  maintenanceSchedule?: any;

  @Expose()
  costCenter?: string;

  @Expose()
  responsiblePersonnel?: string;

  @Expose()
  equipment?: any[];

  @Expose()
  tooling?: any[];

  @Expose()
  environmentalConditions?: any;

  @Expose()
  energyConsumption?: number;

  @Expose()
  kpis?: any;

  @Expose()
  integrationSystems?: any;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
