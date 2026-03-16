import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { WorkCenter, WorkCenterStatus } from '../entities/WorkCenter';
import { CreateWorkCenterDto } from '../dto/create-work-center.dto';
import { UpdateWorkCenterDto } from '../dto/update-work-center.dto';
import { WorkCenterResponseDto } from '../dto/work-center-response.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class WorkCenterService {
  private readonly logger = new Logger(WorkCenterService.name);

  constructor(
    @InjectRepository(WorkCenter)
    private readonly workCenterRepository: Repository<WorkCenter>,
  ) {}

  async create(createWorkCenterDto: CreateWorkCenterDto): Promise<WorkCenterResponseDto> {
    this.logger.log(`Creating work center: ${createWorkCenterDto.code}`);

    // Check if work center with this code already exists
    const existingWorkCenter = await this.workCenterRepository.findOne({
      where: { code: createWorkCenterDto.code },
    });

    if (existingWorkCenter) {
      throw new ConflictException('Work center code already exists');
    }

    const workCenter = this.workCenterRepository.create(createWorkCenterDto);
    const savedWorkCenter = await this.workCenterRepository.save(workCenter);

    this.logger.log(`Work center created successfully: ${savedWorkCenter.id}`);
    return this.mapToResponseDto(savedWorkCenter);
  }

  async findAll(
    paginationDto: PaginationDto,
    filters: { search?: string; status?: string; type?: string },
  ): Promise<{ data: WorkCenterResponseDto[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.workCenterRepository.createQueryBuilder('workCenter');

    // Apply filters
    if (filters.search) {
      queryBuilder.andWhere(
        '(workCenter.code ILIKE :search OR workCenter.name ILIKE :search OR workCenter.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.status) {
      queryBuilder.andWhere('workCenter.status = :status', { status: filters.status });
    }

    if (filters.type) {
      queryBuilder.andWhere('workCenter.type = :type', { type: filters.type });
    }

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    // Order by creation date
    queryBuilder.orderBy('workCenter.createdAt', 'DESC');

    const [workCenters, total] = await queryBuilder.getManyAndCount();

    const data = workCenters.map(workCenter => this.mapToResponseDto(workCenter));

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<WorkCenterResponseDto> {
    this.logger.log(`Retrieving work center: ${id}`);

    const workCenter = await this.workCenterRepository.findOne({
      where: { id },
      relations: ['productionLine', 'workOrders'],
    });

    if (!workCenter) {
      throw new NotFoundException('Work center not found');
    }

    return this.mapToResponseDto(workCenter);
  }

  async findByCode(code: string): Promise<WorkCenterResponseDto> {
    this.logger.log(`Retrieving work center by code: ${code}`);

    const workCenter = await this.workCenterRepository.findOne({
      where: { code: code },
      relations: ['productionLine', 'workOrders'],
    });

    if (!workCenter) {
      throw new NotFoundException('Work center not found');
    }

    return this.mapToResponseDto(workCenter);
  }

  async update(id: string, updateWorkCenterDto: UpdateWorkCenterDto): Promise<WorkCenterResponseDto> {
    this.logger.log(`Updating work center: ${id}`);

    const workCenter = await this.workCenterRepository.findOne({ where: { id } });

    if (!workCenter) {
      throw new NotFoundException('Work center not found');
    }

    // Check if new code conflicts with existing work center
    if (updateWorkCenterDto.code && updateWorkCenterDto.code !== workCenter.code) {
      const existingWorkCenter = await this.workCenterRepository.findOne({
        where: { code: updateWorkCenterDto.code },
      });

      if (existingWorkCenter) {
        throw new ConflictException('Work center code already exists');
      }
    }

    Object.assign(workCenter, updateWorkCenterDto);
    const updatedWorkCenter = await this.workCenterRepository.save(workCenter);

    this.logger.log(`Work center updated successfully: ${id}`);
    return this.mapToResponseDto(updatedWorkCenter);
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Deleting work center: ${id}`);

    const workCenter = await this.workCenterRepository.findOne({ where: { id } });

    if (!workCenter) {
      throw new NotFoundException('Work center not found');
    }

    // Soft delete - use INACTIVE since DECOMMISSIONED doesn't exist
    workCenter.status = WorkCenterStatus.INACTIVE;
    await this.workCenterRepository.save(workCenter);

    this.logger.log(`Work center deleted successfully: ${id}`);
  }

  async activate(id: string): Promise<WorkCenterResponseDto> {
    this.logger.log(`Activating work center: ${id}`);

    const workCenter = await this.workCenterRepository.findOne({ where: { id } });

    if (!workCenter) {
      throw new NotFoundException('Work center not found');
    }

    workCenter.status = WorkCenterStatus.ACTIVE;
    const updatedWorkCenter = await this.workCenterRepository.save(workCenter);

    this.logger.log(`Work center activated successfully: ${id}`);
    return this.mapToResponseDto(updatedWorkCenter);
  }

  async deactivate(id: string): Promise<WorkCenterResponseDto> {
    this.logger.log(`Deactivating work center: ${id}`);

    const workCenter = await this.workCenterRepository.findOne({ where: { id } });

    if (!workCenter) {
      throw new NotFoundException('Work center not found');
    }

    workCenter.status = WorkCenterStatus.INACTIVE;
    const updatedWorkCenter = await this.workCenterRepository.save(workCenter);

    this.logger.log(`Work center deactivated successfully: ${id}`);
    return this.mapToResponseDto(updatedWorkCenter);
  }

  async getCapacity(id: string, date?: string): Promise<any> {
    this.logger.log(`Retrieving capacity for work center: ${id}`);

    const workCenter = await this.workCenterRepository.findOne({ where: { id } });

    if (!workCenter) {
      throw new NotFoundException('Work center not found');
    }

    const targetDate = date ? new Date(date) : new Date();

    // Calculate capacity metrics (using available properties)
    const currentUtilization = workCenter.getCurrentUtilization();
    const availableHours = workCenter.hourlyCapacity * 24; // 24 hours as example
    const efficiency = workCenter.calculateEfficiencyScore();

    return {
      workCenterId: id,
      date: targetDate,
      hourlyCapacity: workCenter.hourlyCapacity,
      dailyCapacity: workCenter.dailyCapacity,
      currentUtilization,
      availableHours,
      efficiency,
    };
  }

  async getEfficiency(id: string, startDate?: string, endDate?: string): Promise<any> {
    this.logger.log(`Retrieving efficiency metrics for work center: ${id}`);

    const workCenter = await this.workCenterRepository.findOne({
      where: { id },
      relations: ['workOrders'],
    });

    if (!workCenter) {
      throw new NotFoundException('Work center not found');
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const efficiency = workCenter.calculateEfficiencyScore();
    // Mock performance data since calculatePerformance method doesn't exist
    const performance = {
      availability: workCenter.utilization / 100,
      quality: 0.95, // Mock quality score
      performance: workCenter.efficiency / 100
    };

    return {
      workCenterId: id,
      period: { startDate: start, endDate: end },
      efficiency,
      performance,
      oee: efficiency * performance.availability * performance.quality,
      trends: {
        efficiency: this.calculateEfficiencyTrend(workCenter, start, end),
        performance: this.calculatePerformanceTrend(workCenter, start, end),
      },
    };
  }

  async getSchedule(id: string, days: number = 7): Promise<any> {
    this.logger.log(`Retrieving schedule for work center: ${id}`);

    const workCenter = await this.workCenterRepository.findOne({
      where: { id },
      relations: ['workOrders'],
    });

    if (!workCenter) {
      throw new NotFoundException('Work center not found');
    }

    const startDate = new Date();
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    // Filter work orders within the date range
    const scheduledWorkOrders = workCenter.workOrders?.filter(workOrder => {
      const scheduledStart = new Date(workOrder.scheduledStartTime); // Use correct property name
      return scheduledStart >= startDate && scheduledStart <= endDate;
    }) || [];

    return {
      workCenterId: id,
      period: { startDate, endDate },
      scheduledWorkOrders: scheduledWorkOrders.map(workOrder => ({
        id: workOrder.id,
        orderNumber: workOrder.workOrderNumber || workOrder.id, // Use available property
        scheduledStartDate: workOrder.scheduledStartTime, // Use correct property names
        scheduledEndDate: workOrder.scheduledEndTime,
        status: workOrder.status,
        priority: workOrder.priority,
        estimatedDuration: workOrder.estimatedDuration || 8, // Default if not available
      })),
      totalScheduledHours: scheduledWorkOrders.reduce(
        (total, workOrder) => total + (workOrder.estimatedDuration || 0),
        0
      ),
      utilizationRate: this.calculateScheduledUtilization(workCenter, scheduledWorkOrders, days),
    };
  }

  async scheduleMaintenance(id: string, maintenanceData: any): Promise<any> {
    this.logger.log(`Scheduling maintenance for work center: ${id}`);

    const workCenter = await this.workCenterRepository.findOne({ where: { id } });

    if (!workCenter) {
      throw new NotFoundException('Work center not found');
    }

    const maintenance = {
      id: `MAINT-${Date.now()}`,
      workCenterId: id,
      type: maintenanceData.type || 'preventive',
      scheduledDate: maintenanceData.scheduledDate || new Date(),
      estimatedDuration: maintenanceData.estimatedDuration || 4,
      description: maintenanceData.description || 'Scheduled maintenance',
      technician: maintenanceData.technician,
      status: 'scheduled',
      createdAt: new Date(),
    };

    // Here you would typically save to a maintenance table
    // For now, we'll return the scheduled maintenance object

    return {
      maintenance,
      impact: {
        scheduledDowntime: maintenance.estimatedDuration,
        affectedOrders: [], // Calculate affected work orders
        alternativeWorkCenters: [], // Suggest alternative work centers
      },
    };
  }

  async getQualityMetrics(id: string, period: string = 'weekly'): Promise<any> {
    this.logger.log(`Retrieving quality metrics for work center: ${id}`);

    const workCenter = await this.workCenterRepository.findOne({
      where: { id },
      relations: ['workOrders'],
    });

    if (!workCenter) {
      throw new NotFoundException('Work center not found');
    }

    // Mock quality data since getQualityMetrics method doesn't exist on entity
    const qualityData = {
      defectRate: 0.02,
      reworkRate: 0.015,
      firstPassYield: 0.95,
      qualityScore: 92.5
    };

    return {
      workCenterId: id,
      period,
      qualityMetrics: qualityData,
      qualityScore: this.calculateQualityScore(qualityData),
      trends: this.calculateQualityTrends(workCenter, period),
      defectRates: {
        current: qualityData.defectRate,
        target: 0.01, // 1% target
        variance: qualityData.defectRate - 0.01,
      },
    };
  }

  async emergencyStop(id: string, stopData: any): Promise<any> {
    this.logger.log(`Emergency stop initiated for work center: ${id}`);

    const workCenter = await this.workCenterRepository.findOne({ where: { id } });

    if (!workCenter) {
      throw new NotFoundException('Work center not found');
    }

    // Set work center to maintenance status (emergency stop equivalent)
    workCenter.status = WorkCenterStatus.MAINTENANCE;
    await this.workCenterRepository.save(workCenter);

    const emergencyStop = {
      id: `ESTOP-${Date.now()}`,
      workCenterId: id,
      reason: stopData.reason || 'Emergency stop initiated',
      initiatedBy: stopData.initiatedBy || 'system',
      timestamp: new Date(),
      status: 'active',
      affectedOperations: [], // List affected operations
      safetyProtocols: { protocol: 'emergency_stop', status: 'activated' }, // Mock data
    };

    this.logger.log(`Emergency stop completed for work center: ${id}`);

    return emergencyStop;
  }

  async clone(id: string, cloneData: { newCode: string; newName: string }): Promise<WorkCenterResponseDto> {
    this.logger.log(`Cloning work center: ${id}`);

    const sourceWorkCenter = await this.workCenterRepository.findOne({ where: { id } });

    if (!sourceWorkCenter) {
      throw new NotFoundException('Source work center not found');
    }

    // Check if new code already exists
    const existingWorkCenter = await this.workCenterRepository.findOne({
      where: { code: cloneData.newCode },
    });

    if (existingWorkCenter) {
      throw new ConflictException('Work center code already exists');
    }

    // Create cloned data manually since clone method doesn't exist
    const { id: sourceId, createdAt, updatedAt, ...sourceData } = sourceWorkCenter;
    const clonedData = {
      ...sourceData,
      code: cloneData.newCode,
      name: cloneData.newName,
    };

    const clonedWorkCenter = this.workCenterRepository.create(clonedData);
    const savedClone = await this.workCenterRepository.save(clonedWorkCenter);

    this.logger.log(`Work center cloned successfully: ${savedClone.id}`);
    return this.mapToResponseDto(savedClone);
  }

  private mapToResponseDto(workCenter: WorkCenter): WorkCenterResponseDto {
    return {
      id: workCenter.id,
      code: workCenter.code,
      name: workCenter.name,
      description: workCenter.description,
      type: workCenter.type,
      status: workCenter.status,
      location: workCenter.location,
      capacity: workCenter.hourlyCapacity, // Use available property
      operatingHours: {
        hoursPerDay: 8, // Mock data
        daysPerWeek: 5,
        shiftPattern: ['day']
      },
      efficiency: workCenter.calculateEfficiencyScore(),
      qualityMetrics: {
        defectRate: 0.02,
        firstPassYield: 0.95,
        qualityScore: 92.5
      },
      safetyMetrics: workCenter.safetyRequirements,
      maintenanceSchedule: undefined,
      costCenter: undefined,
      responsiblePersonnel: undefined,
      equipment: workCenter.equipment,
      tooling: workCenter.tools,
      environmentalConditions: undefined,
      energyConsumption: undefined,
      kpis: undefined,
      integrationSystems: undefined,
      createdAt: workCenter.createdAt,
      updatedAt: workCenter.updatedAt,
    };
  }

  private calculateEfficiencyTrend(workCenter: WorkCenter, startDate: Date, endDate: Date): any[] {
    // This would typically query historical data
    // For now, return mock trend data
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const trends = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      trends.push({
        date,
        efficiency: 0.85 + Math.random() * 0.1, // Mock efficiency between 85-95%
      });
    }

    return trends;
  }

  private calculatePerformanceTrend(workCenter: WorkCenter, startDate: Date, endDate: Date): any[] {
    // This would typically query historical data
    // For now, return mock trend data
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const trends = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      trends.push({
        date,
        availability: 0.90 + Math.random() * 0.05, // Mock availability between 90-95%
        performance: 0.88 + Math.random() * 0.07, // Mock performance between 88-95%
        quality: 0.98 + Math.random() * 0.02, // Mock quality between 98-100%
      });
    }

    return trends;
  }

  private calculateScheduledUtilization(workCenter: WorkCenter, scheduledWorkOrders: any[], days: number): number {
    const totalScheduledHours = scheduledWorkOrders.reduce(
      (total, workOrder) => total + (workOrder.estimatedDuration || 0),
      0
    );

    const availableHours = days * 8; // Default 8 hours per day
    return availableHours > 0 ? (totalScheduledHours / availableHours) * 100 : 0;
  }

  private calculateQualityScore(qualityData: any): number {
    if (!qualityData) return 0;

    const weights = {
      defectRate: 0.4,
      reworkRate: 0.3,
      firstPassYield: 0.3,
    };

    let score = 0;
    score += (1 - (qualityData.defectRate || 0)) * 100 * weights.defectRate;
    score += (1 - (qualityData.reworkRate || 0)) * 100 * weights.reworkRate;
    score += (qualityData.firstPassYield || 0) * 100 * weights.firstPassYield;

    return Math.min(100, Math.max(0, score));
  }

  private calculateQualityTrends(workCenter: WorkCenter, period: string): any {
    // This would typically query historical quality data
    // For now, return mock trend data
    const trends = {
      defectRate: {
        current: 0.02,
        previous: 0.025,
        trend: 'improving',
      },
      firstPassYield: {
        current: 0.96,
        previous: 0.94,
        trend: 'improving',
      },
      customerSatisfaction: {
        current: 4.2,
        previous: 4.0,
        trend: 'improving',
      },
    };

    return trends;
  }
}
