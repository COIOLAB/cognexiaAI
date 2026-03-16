import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, In } from 'typeorm';
import { WorkCenter } from '../entities/WorkCenter';
import { ProductionLine } from '../entities/ProductionLine';
import { ProductionOrder } from '../entities/ProductionOrder';
import { WorkOrder } from '../entities/WorkOrder';
import { CreateWorkCenterDto, UpdateWorkCenterDto } from '../dto';

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AnalyticsOverview {
  totalWorkCenters: number;
  activeWorkCenters: number;
  totalProductionLines: number;
  activeProductionLines: number;
  overallOEE: number;
  throughput: number;
  qualityRate: number;
  industryBreakdown: Record<string, any>;
  trends: Record<string, any>;
  alerts: {
    critical: number;
    warning: number;
    info: number;
  };
}

export interface OEEMetrics {
  overall: {
    oee: number;
    availability: number;
    efficiency: number;
    quality: number;
  };
  breakdown: Array<{
    workCenterId: string;
    name: string;
    oee: number;
    availability: number;
    efficiency: number;
    quality: number;
    industry: string;
  }>;
  trends: {
    labels: string[];
    oee: number[];
    availability: number[];
    efficiency: number[];
    quality: number[];
  };
}

export interface RealTimeStatus {
  timestamp: Date;
  overall: {
    totalWorkCenters: number;
    operational: number;
    maintenance: number;
    breakdown: number;
    currentThroughput: number;
    targetThroughput: number;
  };
  workCenters: Array<{
    id: string;
    name: string;
    status: string;
    currentLoad?: number;
    temperature?: number;
    pressure?: number;
    efficiency: number;
    quality?: number;
    speed?: number;
  }>;
  alerts: Array<{
    id: string;
    workCenterId: string;
    severity: string;
    message: string;
    timestamp: Date;
  }>;
}

@Injectable()
export class ManufacturingService {
  private readonly logger = new Logger(ManufacturingService.name);

  constructor(
    @InjectRepository(WorkCenter)
    private workCenterRepository: Repository<WorkCenter>,
    @InjectRepository(ProductionLine)
    private productionLineRepository: Repository<ProductionLine>,
    @InjectRepository(ProductionOrder)
    private productionOrderRepository: Repository<ProductionOrder>,
    @InjectRepository(WorkOrder)
    private workOrderRepository: Repository<WorkOrder>,
  ) {}

  // =================== WORK CENTERS ===================

  async createWorkCenter(createWorkCenterDto: CreateWorkCenterDto): Promise<WorkCenter> {
    try {
      // Check if work center with same code already exists
      const existingWorkCenter = await this.workCenterRepository.findOne({
        where: { code: createWorkCenterDto.code }
      });

      if (existingWorkCenter) {
        throw new BadRequestException(`Work center with code ${createWorkCenterDto.code} already exists`);
      }

      const workCenter = this.workCenterRepository.create({
        ...createWorkCenterDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedWorkCenter = await this.workCenterRepository.save(workCenter);
      this.logger.log(`Work center created: ${savedWorkCenter.code}`);
      
      return savedWorkCenter;
    } catch (error) {
      this.logger.error(`Error creating work center: ${error.message}`);
      throw error;
    }
  }

  async findAllWorkCenters(
    page: number = 1,
    limit: number = 20,
    filters: {
      industryType?: string;
      status?: string;
      type?: string;
      search?: string;
    } = {}
  ): Promise<PaginationResult<WorkCenter>> {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};

      if (filters.industryType) {
        where.industryType = filters.industryType;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.search) {
        where.name = Like(`%${filters.search}%`);
      }

      const [items, total] = await this.workCenterRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: {
          createdAt: 'DESC'
        }
      });

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      this.logger.error(`Error finding work centers: ${error.message}`);
      throw error;
    }
  }

  async findWorkCenterById(id: string): Promise<WorkCenter> {
    try {
      const workCenter = await this.workCenterRepository.findOne({
        where: { id },
        relations: ['productionLines', 'workOrders']
      });

      if (!workCenter) {
        throw new NotFoundException(`Work center with ID ${id} not found`);
      }

      return workCenter;
    } catch (error) {
      this.logger.error(`Error finding work center ${id}: ${error.message}`);
      throw error;
    }
  }

  async updateWorkCenter(id: string, updateWorkCenterDto: UpdateWorkCenterDto): Promise<WorkCenter> {
    try {
      const workCenter = await this.findWorkCenterById(id);

      // Check if code is being updated and if it conflicts with existing
      if (updateWorkCenterDto.code && updateWorkCenterDto.code !== workCenter.code) {
        const existingWorkCenter = await this.workCenterRepository.findOne({
          where: { code: updateWorkCenterDto.code }
        });

        if (existingWorkCenter) {
          throw new BadRequestException(`Work center with code ${updateWorkCenterDto.code} already exists`);
        }
      }

      Object.assign(workCenter, {
        ...updateWorkCenterDto,
        updatedAt: new Date(),
      });

      const updatedWorkCenter = await this.workCenterRepository.save(workCenter);
      this.logger.log(`Work center updated: ${updatedWorkCenter.code}`);

      return updatedWorkCenter;
    } catch (error) {
      this.logger.error(`Error updating work center ${id}: ${error.message}`);
      throw error;
    }
  }

  async deleteWorkCenter(id: string): Promise<void> {
    try {
      const workCenter = await this.findWorkCenterById(id);
      
      // Check if work center has active work orders
      const activeWorkOrders = await this.workOrderRepository.count({
        where: { 
          workCenterId: id,
          status: In(['in_progress', 'queued', 'setup'])
        }
      });

      if (activeWorkOrders > 0) {
        throw new BadRequestException('Cannot delete work center with active work orders');
      }

      await this.workCenterRepository.remove(workCenter);
      this.logger.log(`Work center deleted: ${workCenter.code}`);
    } catch (error) {
      this.logger.error(`Error deleting work center ${id}: ${error.message}`);
      throw error;
    }
  }

  // =================== ANALYTICS ===================

  async getAnalyticsOverview(
    industryType?: string,
    timeRange: string = '24h'
  ): Promise<AnalyticsOverview> {
    try {
      const workCenterQuery = this.workCenterRepository.createQueryBuilder('wc');
      const productionLineQuery = this.productionLineRepository.createQueryBuilder('pl');

      if (industryType) {
        workCenterQuery.where('wc.industryType = :industryType', { industryType });
        productionLineQuery.where('pl.industryType = :industryType', { industryType });
      }

      const [totalWorkCenters, activeWorkCenters, totalProductionLines, activeProductionLines] = await Promise.all([
        workCenterQuery.getCount(),
        workCenterQuery.andWhere('wc.status = :status', { status: 'active' }).getCount(),
        productionLineQuery.getCount(),
        productionLineQuery.andWhere('pl.status = :status', { status: 'active' }).getCount(),
      ]);

      // Calculate overall metrics (mock data for now, replace with real calculations)
      const overallOEE = 92.3;
      const throughput = 45000;
      const qualityRate = 98.7;

      // Industry breakdown
      const industryBreakdown = {
        pharmaceutical: { workCenters: 8, oee: 94.1, compliance: 99.5 },
        chemical: { workCenters: 6, oee: 91.2, safety: 98.9 },
        automotive: { workCenters: 5, oee: 89.8, quality: 99.2 },
        fmcg: { workCenters: 4, oee: 93.5, efficiency: 96.3 },
        defense: { workCenters: 2, oee: 95.2, security: 100.0 },
      };

      // Trends (mock data)
      const trends = {
        efficiency: [88.2, 89.1, 91.5, 92.3, 93.1],
        quality: [97.8, 98.1, 98.5, 98.7, 98.9],
        uptime: [94.2, 95.1, 95.8, 96.2, 96.5],
      };

      const alerts = {
        critical: 2,
        warning: 5,
        info: 12,
      };

      return {
        totalWorkCenters,
        activeWorkCenters,
        totalProductionLines,
        activeProductionLines,
        overallOEE,
        throughput,
        qualityRate,
        industryBreakdown,
        trends,
        alerts,
      };
    } catch (error) {
      this.logger.error(`Error getting analytics overview: ${error.message}`);
      throw error;
    }
  }

  async getOEEMetrics(workCenterId?: string, timeRange: string = '7d'): Promise<OEEMetrics> {
    try {
      let workCenters: WorkCenter[] = [];

      if (workCenterId) {
        const workCenter = await this.findWorkCenterById(workCenterId);
        workCenters = [workCenter];
      } else {
        workCenters = await this.workCenterRepository.find({
          where: { status: 'active' }
        });
      }

      // Calculate OEE metrics (using mock data for now, replace with real calculations)
      const breakdown = workCenters.map(wc => ({
        workCenterId: wc.id,
        name: wc.name,
        oee: wc.oeeScore || 92.0,
        availability: wc.availability || 96.0,
        efficiency: wc.efficiency || 94.0,
        quality: wc.quality || 99.0,
        industry: wc.industryType,
      }));

      const overall = {
        oee: breakdown.reduce((sum, item) => sum + item.oee, 0) / breakdown.length,
        availability: breakdown.reduce((sum, item) => sum + item.availability, 0) / breakdown.length,
        efficiency: breakdown.reduce((sum, item) => sum + item.efficiency, 0) / breakdown.length,
        quality: breakdown.reduce((sum, item) => sum + item.quality, 0) / breakdown.length,
      };

      const trends = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        oee: [89.2, 91.1, 92.5, 93.2, 92.8, 91.9, 92.3],
        availability: [94.1, 95.2, 96.1, 96.8, 96.2, 95.8, 96.2],
        efficiency: [92.8, 93.5, 94.1, 94.8, 95.2, 94.6, 94.8],
        quality: [98.1, 98.5, 98.7, 99.1, 98.9, 98.6, 98.9],
      };

      return {
        overall,
        breakdown,
        trends,
      };
    } catch (error) {
      this.logger.error(`Error getting OEE metrics: ${error.message}`);
      throw error;
    }
  }

  async getRealTimeStatus(): Promise<RealTimeStatus> {
    try {
      const workCenters = await this.workCenterRepository.find();
      
      const operational = workCenters.filter(wc => wc.status === 'active').length;
      const maintenance = workCenters.filter(wc => wc.status === 'maintenance').length;
      const breakdown = workCenters.filter(wc => wc.status === 'breakdown').length;

      const workCenterStatuses = workCenters.slice(0, 10).map(wc => ({
        id: wc.id,
        name: wc.name,
        status: wc.isOperational ? 'operational' : wc.status,
        currentLoad: Math.random() * 100,
        temperature: wc.industryType === 'chemical' ? 140 + Math.random() * 20 : undefined,
        pressure: wc.industryType === 'chemical' ? 20 + Math.random() * 15 : undefined,
        efficiency: wc.efficiency || 90 + Math.random() * 10,
        quality: wc.quality || 95 + Math.random() * 5,
        speed: wc.type.includes('assembly') ? 40000 + Math.random() * 10000 : undefined,
      }));

      const alerts = [
        {
          id: 'ALT-001',
          workCenterId: workCenters[0]?.id || 'WC-001',
          severity: 'warning',
          message: 'Temperature approaching upper limit',
          timestamp: new Date(),
        },
      ];

      return {
        timestamp: new Date(),
        overall: {
          totalWorkCenters: workCenters.length,
          operational,
          maintenance,
          breakdown,
          currentThroughput: 2350,
          targetThroughput: 2500,
        },
        workCenters: workCenterStatuses,
        alerts,
      };
    } catch (error) {
      this.logger.error(`Error getting real-time status: ${error.message}`);
      throw error;
    }
  }

  // =================== INDUSTRY-SPECIFIC METHODS ===================

  async getPharmaceuticalCompliance(workCenterId?: string): Promise<any> {
    try {
      let workCenters: WorkCenter[] = [];

      if (workCenterId) {
        const workCenter = await this.findWorkCenterById(workCenterId);
        if (workCenter.industryType !== 'pharmaceutical') {
          throw new BadRequestException('Work center is not in pharmaceutical industry');
        }
        workCenters = [workCenter];
      } else {
        workCenters = await this.workCenterRepository.find({
          where: { industryType: 'pharmaceutical' }
        });
      }

      const complianceData = {
        overall: {
          gmpCompliant: true,
          fdaApproved: true,
          validationStatus: 'current',
          lastAudit: '2024-01-15',
          nextAudit: '2024-07-15',
        },
        workCenters: workCenters.map(wc => ({
          id: wc.id,
          name: wc.name,
          cleanRoomClass: wc.type === 'sterilization' ? 'Grade A' : 'Grade C',
          gmpCompliant: wc.gmpCompliant || true,
          validationStatus: 'validated',
          sterileEnvironment: wc.type === 'sterilization',
          lastValidation: '2024-01-10',
        })),
        certifications: [
          { name: 'GMP', status: 'current', expires: '2025-06-30' },
          { name: 'FDA 21 CFR Part 211', status: 'current', expires: '2025-12-31' },
          { name: 'ISO 13485', status: 'current', expires: '2025-03-15' },
        ],
        deviations: [],
        capa: {
          open: 2,
          closed: 15,
          overdue: 0,
        },
      };

      return complianceData;
    } catch (error) {
      this.logger.error(`Error getting pharmaceutical compliance: ${error.message}`);
      throw error;
    }
  }

  async getChemicalSafety(workCenterId?: string): Promise<any> {
    try {
      let workCenters: WorkCenter[] = [];

      if (workCenterId) {
        const workCenter = await this.findWorkCenterById(workCenterId);
        if (!['chemical', 'refinery', 'pesticide'].includes(workCenter.industryType)) {
          throw new BadRequestException('Work center is not in chemical/refinery industry');
        }
        workCenters = [workCenter];
      } else {
        workCenters = await this.workCenterRepository.find({
          where: { industryType: In(['chemical', 'refinery', 'pesticide']) }
        });
      }

      const safetyData = {
        overall: {
          safetyScore: 98.5,
          incidentFreeDays: 145,
          hazmatCompliant: true,
          explosionProofCompliant: true,
          lastSafetyAudit: '2024-02-01',
        },
        workCenters: workCenters.map(wc => ({
          id: wc.id,
          name: wc.name,
          hazardClassification: ['flammable', 'corrosive'],
          explosionProof: wc.safetyRequirements?.explosionProof || true,
          pressureRating: wc.safetyRequirements?.pressureRating || 150,
          temperatureRange: wc.safetyRequirements?.temperatureRange || { min: -20, max: 300 },
          lastSafetyInspection: '2024-02-15',
          safetyScore: 99.2,
        })),
        emergencyEquipment: {
          fireSuppressionSystems: { status: 'operational', lastTested: '2024-02-10' },
          gasDetectors: { status: 'operational', lastCalibrated: '2024-02-08' },
          emergencyShutoffs: { status: 'operational', lastTested: '2024-02-12' },
          spillContainment: { status: 'operational', lastInspected: '2024-02-05' },
        },
        training: {
          hazmatTraining: { completed: 95, required: 100 },
          emergencyResponse: { completed: 98, required: 100 },
          safetyProcedures: { completed: 100, required: 100 },
        },
      };

      return safetyData;
    } catch (error) {
      this.logger.error(`Error getting chemical safety: ${error.message}`);
      throw error;
    }
  }

  // =================== IoT & SENSOR DATA ===================

  async getIoTSensorData(workCenterId?: string, sensorType?: string): Promise<any> {
    try {
      let workCenters: WorkCenter[] = [];

      if (workCenterId) {
        const workCenter = await this.findWorkCenterById(workCenterId);
        workCenters = [workCenter];
      } else {
        workCenters = await this.workCenterRepository.find({
          where: { status: 'active' },
          take: 5 // Limit for demo
        });
      }

      const sensors = workCenters.flatMap(wc => [
        {
          id: `TEMP-${wc.id.slice(-3)}`,
          workCenterId: wc.id,
          type: 'temperature',
          value: 140 + Math.random() * 20,
          unit: '°C',
          status: 'normal',
          threshold: { min: 140, max: 150 },
          lastReading: new Date(),
        },
        {
          id: `PRES-${wc.id.slice(-3)}`,
          workCenterId: wc.id,
          type: 'pressure',
          value: 20 + Math.random() * 10,
          unit: 'PSI',
          status: 'normal',
          threshold: { min: 20, max: 30 },
          lastReading: new Date(),
        },
      ]).filter(sensor => !sensorType || sensor.type === sensorType);

      return {
        timestamp: new Date(),
        sensors,
        summary: {
          totalSensors: 156,
          activeSensors: 154,
          alarmsActive: 2,
          sensorsOffline: 2,
        },
      };
    } catch (error) {
      this.logger.error(`Error getting IoT sensor data: ${error.message}`);
      throw error;
    }
  }
}
