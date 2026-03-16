import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AuditLogService } from '../services/audit-log.service';
import { AuditLogFilterDto, ExportAuditLogsDto } from '../dto/audit-log.dto';

@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  /**
   * Get all audit logs with filters
   * GET /audit-logs
   */
  @Get()
  async findAll(@Query() filters: AuditLogFilterDto) {
    return await this.auditLogService.findAll(filters);
  }

  /**
   * Get audit logs for organization
   * GET /audit-logs/organizations/:organizationId
   */
  @Get('organizations/:organizationId')
  async findByOrganization(
    @Param('organizationId') organization_id: string,
    @Query() filters: AuditLogFilterDto,
  ) {
    return await this.auditLogService.findByOrganization(organization_id, filters);
  }

  /**
   * Get audit logs for user
   * GET /audit-logs/users/:userId
   */
  @Get('users/:userId')
  async findByUser(
    @Param('userId') user_id: string,
    @Query() filters: AuditLogFilterDto,
  ) {
    return await this.auditLogService.findByUser(user_id, filters);
  }

  /**
   * Get audit logs for specific entity
   * GET /audit-logs/entities/:entityType/:entityId
   */
  @Get('entities/:entityType/:entityId')
  async findByEntity(
    @Param('entityType') entity_type: string,
    @Param('entityId') entity_id: string,
    @Query() filters: AuditLogFilterDto,
  ) {
    return await this.auditLogService.findByEntity(entity_type, entity_id, filters);
  }

  /**
   * Export audit logs
   * GET /audit-logs/export
   */
  @Get('export')
  async export(@Query() exportDto: ExportAuditLogsDto, @Res() res: Response) {
    const { format = 'csv', ...filters } = exportDto;

    if (format === 'csv') {
      const csv = await this.auditLogService.exportToCsv(filters);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
      return res.send(csv);
    } else {
      const json = await this.auditLogService.exportToJson(filters);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.json');
      return res.json(json);
    }
  }

  /**
   * Get audit statistics
   * GET /audit-logs/stats
   */
  @Get('stats')
  async getStatistics(@Query('organizationId') organizationId?: string) {
    return await this.auditLogService.getStatistics(organizationId);
  }

  /**
   * Get audit log by ID
   * GET /audit-logs/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.auditLogService.findOne(id);
  }
}
