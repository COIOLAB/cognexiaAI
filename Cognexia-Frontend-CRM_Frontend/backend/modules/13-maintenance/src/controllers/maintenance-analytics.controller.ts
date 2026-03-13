// Industry 5.0 ERP Backend - Maintenance Analytics Controller
import { Controller, Get, Post, Query, Body, UseGuards, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MaintenanceAnalyticsService } from '../services/maintenance-analytics.service';
import { MaintenanceGuard } from '../guards/maintenance.guard';

@ApiTags('Maintenance Analytics')
@Controller('maintenance/analytics')
@UseGuards(MaintenanceGuard)
@ApiBearerAuth()
export class MaintenanceAnalyticsController {
  private readonly logger = new Logger(MaintenanceAnalyticsController.name);

  constructor(private readonly analyticsService: MaintenanceAnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get maintenance dashboard', description: 'Comprehensive maintenance dashboard with KPIs' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getDashboard(@Query() query: any) {
    try {
      const dashboard = await this.analyticsService.getDashboard(query);
      return { statusCode: HttpStatus.OK, message: 'Dashboard retrieved', data: dashboard };
    } catch (error) {
      throw new HttpException('Failed to retrieve dashboard', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('kpis')
  @ApiOperation({ summary: 'Get maintenance KPIs', description: 'Key performance indicators for maintenance operations' })
  @ApiResponse({ status: 200, description: 'KPIs retrieved successfully' })
  async getKPIs(@Query() query: any) {
    try {
      const kpis = await this.analyticsService.getKPIs(query);
      return { statusCode: HttpStatus.OK, message: 'KPIs retrieved', data: kpis };
    } catch (error) {
      throw new HttpException('Failed to retrieve KPIs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get maintenance trends', description: 'Historical trends and patterns in maintenance data' })
  @ApiResponse({ status: 200, description: 'Trends retrieved successfully' })
  async getTrends(@Query() query: any) {
    try {
      const trends = await this.analyticsService.getTrends(query);
      return { statusCode: HttpStatus.OK, message: 'Trends retrieved', data: trends };
    } catch (error) {
      throw new HttpException('Failed to retrieve trends', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get maintenance reports', description: 'Generate comprehensive maintenance reports' })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  async getReports(@Query() query: any) {
    try {
      const reports = await this.analyticsService.getReports(query);
      return { statusCode: HttpStatus.OK, message: 'Reports retrieved', data: reports };
    } catch (error) {
      throw new HttpException('Failed to retrieve reports', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('custom-report')
  @ApiOperation({ summary: 'Generate custom report', description: 'Create custom maintenance report with specific parameters' })
  @ApiResponse({ status: 201, description: 'Custom report generated successfully' })
  async generateCustomReport(@Body() reportDto: any) {
    try {
      const report = await this.analyticsService.generateCustomReport(reportDto);
      return { statusCode: HttpStatus.CREATED, message: 'Report generated', data: report };
    } catch (error) {
      throw new HttpException('Failed to generate report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}