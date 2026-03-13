import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { ReportBuilderService } from '../services/report-builder.service';
import { FunnelAnalysisService, FunnelStageData } from '../services/funnel-analysis.service';
import { CohortAnalysisService, CohortData } from '../services/cohort-analysis.service';
import { RevenueForecastingService, ForecastPeriod } from '../services/revenue-forecasting.service';
import { ReportSchedulerService } from '../services/report-scheduler.service';
import {
  CreateReportDto,
  UpdateReportDto,
  RunReportDto,
  FunnelAnalysisDto,
  CohortAnalysisDto,
  RevenueForecastDto,
  CreateReportScheduleDto,
  UpdateReportScheduleDto,
} from '../dto/report.dto';

@ApiTags('Reporting & Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('reporting')
export class ReportingController {
  constructor(
    private readonly reportBuilderService: ReportBuilderService,
    private readonly funnelAnalysisService: FunnelAnalysisService,
    private readonly cohortAnalysisService: CohortAnalysisService,
    private readonly revenueForecastingService: RevenueForecastingService,
    private readonly reportSchedulerService: ReportSchedulerService,
  ) {}

  // ============ Report Management ============

  @Post('reports')
  @ApiOperation({ summary: 'Create a custom report' })
  @ApiResponse({ status: 201, description: 'Report created successfully' })
  async createReport(@Request() req, @Body() dto: CreateReportDto) {
    return this.reportBuilderService.createReport(req.user.tenantId || req.user.organizationId, req.user.sub, dto);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get all reports' })
  @ApiResponse({ status: 200, description: 'List of reports' })
  async getReports(@Request() req) {
    return this.reportBuilderService.findAll(req.user.tenantId || req.user.organizationId, req.user.sub);
  }

  @Get('reports/templates')
  @ApiOperation({ summary: 'Get pre-built report templates' })
  @ApiResponse({ status: 200, description: 'List of report templates' })
  async getReportTemplates(@Request() req) {
    return this.reportBuilderService.getPrebuiltReports(req.user.tenantId || req.user.organizationId);
  }

  @Get('reports/:id')
  @ApiOperation({ summary: 'Get report by ID' })
  @ApiResponse({ status: 200, description: 'Report details' })
  async getReport(@Request() req, @Param('id') id: string) {
    return this.reportBuilderService.findOne(id, req.user.tenantId || req.user.organizationId);
  }

  @Put('reports/:id')
  @ApiOperation({ summary: 'Update report' })
  @ApiResponse({ status: 200, description: 'Report updated successfully' })
  async updateReport(@Request() req, @Param('id') id: string, @Body() dto: UpdateReportDto) {
    return this.reportBuilderService.updateReport(id, req.user.tenantId || req.user.organizationId, dto);
  }

  @Delete('reports/:id')
  @ApiOperation({ summary: 'Delete report' })
  @ApiResponse({ status: 200, description: 'Report deleted successfully' })
  async deleteReport(@Request() req, @Param('id') id: string) {
    await this.reportBuilderService.deleteReport(id, req.user.tenantId || req.user.organizationId);
    return { message: 'Report deleted successfully' };
  }

  @Post('reports/:id/run')
  @ApiOperation({ summary: 'Run a report and get results' })
  @ApiResponse({ status: 200, description: 'Report results' })
  async runReport(@Request() req, @Param('id') id: string, @Body() dto?: RunReportDto) {
    return this.reportBuilderService.runReport(id, req.user.tenantId || req.user.organizationId, dto);
  }

  // ============ Report Scheduling ============

  @Post('schedules')
  @ApiOperation({ summary: 'Create a report schedule' })
  @ApiResponse({ status: 201, description: 'Schedule created successfully' })
  async createSchedule(@Request() req, @Body() dto: CreateReportScheduleDto) {
    return this.reportSchedulerService.createSchedule(req.user.tenantId || req.user.organizationId, req.user.sub, dto);
  }

  @Get('schedules')
  @ApiOperation({ summary: 'Get all report schedules' })
  @ApiResponse({ status: 200, description: 'List of schedules' })
  async getSchedules(@Request() req) {
    return this.reportSchedulerService.findAll(req.user.tenantId || req.user.organizationId);
  }

  @Get('schedules/:id')
  @ApiOperation({ summary: 'Get schedule by ID' })
  @ApiResponse({ status: 200, description: 'Schedule details' })
  async getSchedule(@Request() req, @Param('id') id: string) {
    return this.reportSchedulerService.findOne(id, req.user.tenantId || req.user.organizationId);
  }

  @Put('schedules/:id')
  @ApiOperation({ summary: 'Update schedule' })
  @ApiResponse({ status: 200, description: 'Schedule updated successfully' })
  async updateSchedule(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateReportScheduleDto,
  ) {
    return this.reportSchedulerService.updateSchedule(id, req.user.tenantId || req.user.organizationId, dto);
  }

  @Delete('schedules/:id')
  @ApiOperation({ summary: 'Delete schedule' })
  @ApiResponse({ status: 200, description: 'Schedule deleted successfully' })
  async deleteSchedule(@Request() req, @Param('id') id: string) {
    try {
      await this.reportSchedulerService.deleteSchedule(id, req.user.tenantId || req.user.organizationId);
      return { success: true, message: 'Schedule deleted successfully' };
    } catch (error) {
      return { success: false, message: error?.message || 'Schedule not found', data: null };
    }
  }

  @Post('schedules/:id/run')
  @ApiOperation({ summary: 'Run a schedule immediately' })
  @ApiResponse({ status: 200, description: 'Schedule executed successfully' })
  async runScheduleNow(@Request() req, @Param('id') id: string) {
    try {
      await this.reportSchedulerService.runScheduleNow(id, req.user.tenantId || req.user.organizationId);
      return { success: true, message: 'Schedule executed successfully' };
    } catch (error) {
      return { success: false, message: error?.message || 'Failed to run schedule', data: null };
    }
  }

  // ============ Funnel Analysis ============

  @Post('analytics/funnel')
  @ApiOperation({ summary: 'Analyze sales funnel' })
  @ApiResponse({ status: 200, description: 'Funnel analysis results' })
  async analyzeFunnel(@Request() req, @Body() dto: FunnelAnalysisDto): Promise<FunnelStageData[]> {
    return this.funnelAnalysisService.analyzeFunnel(req.user.tenantId || req.user.organizationId, dto);
  }

  @Get('analytics/conversion-metrics')
  @ApiOperation({ summary: 'Get conversion metrics' })
  @ApiResponse({ status: 200, description: 'Conversion metrics' })
  async getConversionMetrics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.funnelAnalysisService.getConversionMetrics(req.user.tenantId || req.user.organizationId, startDate, endDate);
  }

  @Get('analytics/bottlenecks')
  @ApiOperation({ summary: 'Identify pipeline bottlenecks' })
  @ApiResponse({ status: 200, description: 'Pipeline bottlenecks' })
  async getBottlenecks(@Request() req) {
    return this.funnelAnalysisService.getBottlenecks(req.user.tenantId || req.user.organizationId);
  }

  // ============ Cohort Analysis ============

  @Post('analytics/cohort')
  @ApiOperation({ summary: 'Analyze customer cohorts' })
  @ApiResponse({ status: 200, description: 'Cohort analysis results' })
  async analyzeCohort(@Request() req, @Body() dto: CohortAnalysisDto): Promise<CohortData[]> {
    return this.cohortAnalysisService.analyzeCohort(req.user.tenantId || req.user.organizationId, dto);
  }

  // ============ Revenue Forecasting ============

  @Post('analytics/forecast')
  @ApiOperation({ summary: 'Forecast future revenue' })
  @ApiResponse({ status: 200, description: 'Revenue forecast' })
  async forecastRevenue(@Request() req, @Body() dto: RevenueForecastDto): Promise<ForecastPeriod[]> {
    return this.revenueForecastingService.forecastRevenue(req.user.tenantId || req.user.organizationId, dto);
  }

  @Get('analytics/pipeline-forecast')
  @ApiOperation({ summary: 'Get pipeline-based forecast' })
  @ApiResponse({ status: 200, description: 'Pipeline forecast' })
  async getPipelineForecast(@Request() req) {
    return this.revenueForecastingService.getPipelineForecast(req.user.tenantId || req.user.organizationId);
  }
}
