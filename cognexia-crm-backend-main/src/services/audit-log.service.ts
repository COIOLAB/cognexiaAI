import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { CreateAuditLogDto, AuditLogFilterDto } from '../dto/audit-log.dto';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) { }

  /**
   * Create a new audit log entry
   */
  async create(createDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(createDto as any);
    const saved = await this.auditLogRepository.save(auditLog);
    return saved as unknown as AuditLog;
  }

  /**
   * Log an action (convenience method)
   */
  async log(
    organizationId: string,
    user_id: string,
    action: string,
    entity_type: string,
    entity_id: string,
    description: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    return this.create({
      organizationId,
      user_id,
      action: action as any,
      entity_type,
      entity_id,
      description,
      metadata: { description, ...metadata },
      ipAddress: ipAddress,
      userAgent: userAgent,
    });
  }

  /**
   * Find all audit logs with filters and pagination
   */
  async findAll(filters: AuditLogFilterDto) {
    const {
      organizationId,
      userId,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filters;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const safePage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20;

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit_log');

    // Apply filters
    if (organizationId) {
      queryBuilder.andWhere('audit_log.organizationId = :organizationId', { organizationId });
    }

    if (userId) {
      queryBuilder.andWhere('audit_log.user_id = :userId', { userId });
    }

    if (action) {
      queryBuilder.andWhere('audit_log.action = :action', { action });
    }

    if (entityType) {
      queryBuilder.andWhere('audit_log.entity_type = :entityType', { entityType });
    }

    if (entityId) {
      queryBuilder.andWhere('audit_log.entity_id = :entityId', { entityId });
    }

    // Date range filter
    const parsedStart = startDate ? new Date(startDate) : null;
    const parsedEnd = endDate ? new Date(endDate) : null;
    const validStart = parsedStart && !Number.isNaN(parsedStart.getTime()) ? parsedStart : null;
    const validEnd = parsedEnd && !Number.isNaN(parsedEnd.getTime()) ? parsedEnd : null;

    if (validStart && validEnd) {
      queryBuilder.andWhere('audit_log.created_at BETWEEN :startDate AND :endDate', {
        startDate: validStart,
        endDate: validEnd,
      });
    } else if (validStart) {
      queryBuilder.andWhere('audit_log.created_at >= :startDate', {
        startDate: validStart,
      });
    } else if (validEnd) {
      queryBuilder.andWhere('audit_log.created_at <= :endDate', {
        endDate: validEnd,
      });
    }

    // Pagination
    const skip = (safePage - 1) * safeLimit;
    queryBuilder.skip(skip).take(safeLimit);

    // Order by created date descending
    queryBuilder.orderBy('audit_log.created_at', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrevious: page > 1,
    };
  }

  /**
   * Find audit log by ID
   */
  async findOne(id: string): Promise<AuditLog> {
    return await this.auditLogRepository.findOne({
      where: { id },
    });
  }

  /**
   * Find audit logs by organization
   */
  async findByOrganization(organizationId: string, filters: AuditLogFilterDto) {
    return this.findAll({ ...filters, organizationId: organizationId });
  }

  /**
   * Find audit logs by user
   */
  async findByUser(user_id: string, filters: AuditLogFilterDto) {
    return this.findAll({ ...filters, userId: user_id });
  }

  /**
   * Find audit logs by entity
   */
  async findByEntity(entity_type: string, entity_id: string, filters: AuditLogFilterDto) {
    return this.findAll({ ...filters, entityType: entity_type, entityId: entity_id });
  }

  /**
   * Export audit logs to CSV
   */
  async exportToCsv(filters: AuditLogFilterDto): Promise<string> {
    const { data } = await this.findAll({ ...filters, limit: 10000 });

    let csv = 'ID,Organization,User,Action,Entity Type,Entity ID,Description,IP Address,Created At\n';

    data.forEach((log) => {
      csv += `"${log.id}","${log.organizationId || ''}","${log.user_email || ''}","${log.action}","${log.entity_type || ''}","${log.entity_id || ''}","${log.metadata?.description || ''}","${log.ip_address || ''}","${log.created_at}"\n`;
    });

    return csv;
  }

  /**
   * Export audit logs to JSON
   */
  async exportToJson(filters: AuditLogFilterDto): Promise<AuditLog[]> {
    const { data } = await this.findAll({ ...filters, limit: 10000 });
    return data;
  }

  /**
   * Get audit statistics for compliance reporting
   */
  async getStatistics(organizationId?: string) {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit_log');

    if (organizationId) {
      queryBuilder.where('audit_log.organizationId = :organizationId', { organizationId });
    }

    const totalLogs = await queryBuilder.getCount();

    const actionCounts = await queryBuilder
      .select('audit_log.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit_log.action')
      .getRawMany();

    const entityTypeCounts = await queryBuilder
      .select('audit_log.entity_type', 'entityType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit_log.entity_type')
      .getRawMany();

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const recentLogs = await queryBuilder
      .where('audit_log.created_at >= :date', { date: last7Days })
      .getCount();

    return {
      totalLogs,
      recentLogs,
      actionCounts,
      entityTypeCounts,
    };
  }

  /**
   * Clean up old audit logs (for compliance - keep only X days)
   */
  async cleanup(retentionDays: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('created_at < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}
