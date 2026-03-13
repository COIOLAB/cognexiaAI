import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Report } from '../entities/report.entity';
import { Lead } from '../entities/lead.entity';
import { Customer } from '../entities/customer.entity';
import { Deal } from '../entities/deal.entity';
import { Task } from '../entities/task.entity';
import { Activity } from '../entities/activity.entity';
import { CreateReportDto, UpdateReportDto, RunReportDto, ReportFilterDto } from '../dto/report.dto';

@Injectable()
export class ReportBuilderService {
  private readonly entityMap = {
    lead: Lead,
    customer: Customer,
    deal: Deal,
    task: Task,
    activity: Activity,
  };

  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Deal)
    private dealRepository: Repository<Deal>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  async createReport(tenantId: string, userId: string, dto: CreateReportDto): Promise<Report> {
    // Validate entity exists
    if (!this.entityMap[dto.config.entity]) {
      throw new BadRequestException(`Invalid entity: ${dto.config.entity}`);
    }

    const report = this.reportRepository.create({
      ...dto,
      tenantId,
      createdById: userId,
    });

    return this.reportRepository.save(report);
  }

  async findAll(tenantId: string, userId: string): Promise<Report[]> {
    try {
      const reports = await this.reportRepository.find({
        where: [
          { tenantId, createdById: userId },
          { tenantId, isPublic: true },
        ],
        order: { createdAt: 'DESC' },
      });
      return reports || [];
    } catch (error) {
      return [];
    }
  }

  async findOne(id: string, tenantId: string): Promise<Report> {
    try {
      const report = await this.reportRepository.findOne({
        where: { id, tenantId },
      });

      if (!report) {
        return null;
      }

      // Increment view count
      await this.reportRepository.update(id, {
        viewCount: report.viewCount + 1,
      });

      return report;
    } catch (error) {
      return null;
    }
  }

  async updateReport(id: string, tenantId: string, dto: UpdateReportDto): Promise<Report> {
    const report = await this.findOne(id, tenantId);
    Object.assign(report, dto);
    return this.reportRepository.save(report);
  }

  async deleteReport(id: string, tenantId: string): Promise<void> {
    const report = await this.findOne(id, tenantId);
    await this.reportRepository.remove(report);
  }

  async runReport(
    reportId: string,
    tenantId: string,
    dto?: RunReportDto,
  ): Promise<{ data: any[]; metadata: any }> {
    try {
      const report = await this.findOne(reportId, tenantId);

      if (!report) {
        return {
          data: [],
          metadata: {
            totalCount: 0,
            reportName: '',
            reportType: null,
            chartType: null,
            generatedAt: new Date(),
          },
        };
      }

      // Get repository for entity
      const repository = this.getRepositoryForEntity(report.config.entity);

      // Build query
      const queryBuilder = repository.createQueryBuilder('entity');
      queryBuilder.where('entity.tenantId = :tenantId', { tenantId });

      // Apply date filters if provided
      if (dto?.startDate) {
        queryBuilder.andWhere('entity.createdAt >= :startDate', { startDate: dto.startDate });
      }
      if (dto?.endDate) {
        queryBuilder.andWhere('entity.createdAt <= :endDate', { endDate: dto.endDate });
      }

      // Apply report filters
      this.applyFilters(queryBuilder, report.config.filters || []);

      // Apply additional filters from DTO
      if (dto?.additionalFilters?.length) {
        this.applyFilters(queryBuilder, dto.additionalFilters);
      }

      // Apply grouping
      if (report.config.groupBy) {
        queryBuilder.groupBy(`entity.${report.config.groupBy}`);
      }

      // Apply ordering
      if (report.config.orderBy) {
        queryBuilder.orderBy(
          `entity.${report.config.orderBy.field}`,
          report.config.orderBy.direction,
        );
      }

      // Apply limit
      if (report.config.limit) {
        queryBuilder.take(report.config.limit);
      }

      // Select columns
      if (report.config.columns?.length) {
        const selectFields = report.config.columns.map((col) => `entity.${col}`);
        queryBuilder.select(selectFields);
      }

      // Apply aggregations
      if (report.config.aggregations?.length) {
        report.config.aggregations.forEach((agg, index) => {
          const alias = `${agg.function}_${agg.field}`;
          queryBuilder.addSelect(`${agg.function.toUpperCase()}(entity.${agg.field})`, alias);
        });
      }

      // Execute query
      const data = await queryBuilder.getRawMany();

      // Calculate metadata
      const totalCount = await queryBuilder.getCount();

      return {
        data: data || [],
        metadata: {
          totalCount: totalCount || 0,
          reportName: report.name,
          reportType: report.reportType,
          chartType: report.chartType,
          generatedAt: new Date(),
        },
      };
    } catch (error) {
      return {
        data: [],
        metadata: {
          totalCount: 0,
          reportName: '',
          reportType: null,
          chartType: null,
          generatedAt: new Date(),
        },
      };
    }
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<any>, filters: ReportFilterDto[]): void {
    filters.forEach((filter, index) => {
      const paramName = `filter_${index}`;

      switch (filter.operator) {
        case 'equals':
          queryBuilder.andWhere(`entity.${filter.field} = :${paramName}`, {
            [paramName]: filter.value,
          });
          break;

        case 'notEquals':
          queryBuilder.andWhere(`entity.${filter.field} != :${paramName}`, {
            [paramName]: filter.value,
          });
          break;

        case 'contains':
          queryBuilder.andWhere(`entity.${filter.field} ILIKE :${paramName}`, {
            [paramName]: `%${filter.value}%`,
          });
          break;

        case 'greaterThan':
          queryBuilder.andWhere(`entity.${filter.field} > :${paramName}`, {
            [paramName]: filter.value,
          });
          break;

        case 'lessThan':
          queryBuilder.andWhere(`entity.${filter.field} < :${paramName}`, {
            [paramName]: filter.value,
          });
          break;

        case 'greaterThanOrEqual':
          queryBuilder.andWhere(`entity.${filter.field} >= :${paramName}`, {
            [paramName]: filter.value,
          });
          break;

        case 'lessThanOrEqual':
          queryBuilder.andWhere(`entity.${filter.field} <= :${paramName}`, {
            [paramName]: filter.value,
          });
          break;

        case 'between':
          if (Array.isArray(filter.value) && filter.value.length === 2) {
            queryBuilder.andWhere(
              `entity.${filter.field} BETWEEN :${paramName}_start AND :${paramName}_end`,
              {
                [`${paramName}_start`]: filter.value[0],
                [`${paramName}_end`]: filter.value[1],
              },
            );
          }
          break;

        case 'in':
          if (Array.isArray(filter.value)) {
            queryBuilder.andWhere(`entity.${filter.field} IN (:...${paramName})`, {
              [paramName]: filter.value,
            });
          }
          break;

        case 'isNull':
          queryBuilder.andWhere(`entity.${filter.field} IS NULL`);
          break;

        case 'isNotNull':
          queryBuilder.andWhere(`entity.${filter.field} IS NOT NULL`);
          break;

        default:
          throw new BadRequestException(`Unsupported operator: ${filter.operator}`);
      }
    });
  }

  private getRepositoryForEntity(entity: string): Repository<any> {
    switch (entity) {
      case 'lead':
        return this.leadRepository;
      case 'customer':
        return this.customerRepository;
      case 'deal':
        return this.dealRepository;
      case 'task':
        return this.taskRepository;
      case 'activity':
        return this.activityRepository;
      default:
        throw new BadRequestException(`Unsupported entity: ${entity}`);
    }
  }

  // Pre-built report templates
  async getPrebuiltReports(tenantId: string): Promise<any[]> {
    return [
      {
        name: 'Sales Performance',
        reportType: 'sales',
        description: 'Track deals won, revenue, and conversion rates',
        config: {
          entity: 'deal',
          columns: ['name', 'value', 'stage', 'closedAt'],
          filters: [{ field: 'stage', operator: 'equals', value: 'won' }],
          aggregations: [
            { field: 'value', function: 'sum' },
            { field: 'id', function: 'count' },
          ],
        },
      },
      {
        name: 'Lead Sources',
        reportType: 'marketing',
        description: 'Analyze lead sources and conversion rates',
        config: {
          entity: 'lead',
          columns: ['source', 'status'],
          groupBy: 'source',
          aggregations: [{ field: 'id', function: 'count' }],
        },
      },
      {
        name: 'Pipeline Overview',
        reportType: 'pipeline',
        description: 'View deals across all pipeline stages',
        config: {
          entity: 'deal',
          columns: ['stage', 'value'],
          groupBy: 'stage',
          aggregations: [
            { field: 'value', function: 'sum' },
            { field: 'id', function: 'count' },
          ],
        },
      },
      {
        name: 'Task Completion',
        reportType: 'support',
        description: 'Track task completion and overdue tasks',
        config: {
          entity: 'task',
          columns: ['title', 'status', 'priority', 'dueDate'],
          filters: [{ field: 'status', operator: 'equals', value: 'completed' }],
          aggregations: [{ field: 'id', function: 'count' }],
        },
      },
    ];
  }
}
