#!/usr/bin/env python3
"""
Create remaining maintenance controllers
"""

controllers = {
    "preventive-maintenance.controller.ts": '''// Industry 5.0 ERP Backend - Preventive Maintenance Controller
import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PreventiveMaintenanceService } from '../services/preventive-maintenance.service';
import { MaintenanceGuard } from '../guards/maintenance.guard';

@ApiTags('Preventive Maintenance')
@Controller('maintenance/preventive')
@UseGuards(MaintenanceGuard)
@ApiBearerAuth()
export class PreventiveMaintenanceController {
  private readonly logger = new Logger(PreventiveMaintenanceController.name);

  constructor(private readonly preventiveService: PreventiveMaintenanceService) {}

  @Get('schedules')
  @ApiOperation({ summary: 'Get preventive maintenance schedules' })
  @ApiResponse({ status: 200, description: 'Schedules retrieved successfully' })
  async getSchedules(@Query() query: any) {
    try {
      const schedules = await this.preventiveService.getSchedules(query);
      return { statusCode: HttpStatus.OK, message: 'Schedules retrieved', data: schedules };
    } catch (error) {
      throw new HttpException('Failed to retrieve schedules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('schedules')
  @ApiOperation({ summary: 'Create preventive maintenance schedule' })
  @ApiResponse({ status: 201, description: 'Schedule created successfully' })
  async createSchedule(@Body() createDto: any) {
    try {
      const schedule = await this.preventiveService.createSchedule(createDto);
      return { statusCode: HttpStatus.CREATED, message: 'Schedule created', data: schedule };
    } catch (error) {
      throw new HttpException('Failed to create schedule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get preventive maintenance analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getAnalytics(@Query() query: any) {
    try {
      const analytics = await this.preventiveService.getAnalytics(query);
      return { statusCode: HttpStatus.OK, message: 'Analytics retrieved', data: analytics };
    } catch (error) {
      throw new HttpException('Failed to retrieve analytics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}''',

    "predictive-maintenance.controller.ts": '''// Industry 5.0 ERP Backend - Predictive Maintenance Controller
import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, HttpStatus, HttpException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PredictiveMaintenanceService } from '../services/predictive-maintenance.service';
import { MaintenanceGuard } from '../guards/maintenance.guard';

@ApiTags('Predictive Maintenance')
@Controller('maintenance/predictive')
@UseGuards(MaintenanceGuard)
@ApiBearerAuth()
export class PredictiveMaintenanceController {
  private readonly logger = new Logger(PredictiveMaintenanceController.name);

  constructor(private readonly predictiveService: PredictiveMaintenanceService) {}

  @Get('predictions')
  @ApiOperation({ summary: 'Get failure predictions', description: 'AI-powered failure predictions for equipment' })
  @ApiResponse({ status: 200, description: 'Predictions retrieved successfully' })
  async getPredictions(@Query() query: any) {
    try {
      const predictions = await this.predictiveService.getPredictions(query);
      return { statusCode: HttpStatus.OK, message: 'Predictions retrieved', data: predictions };
    } catch (error) {
      throw new HttpException('Failed to retrieve predictions', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('models/train')
  @ApiOperation({ summary: 'Train predictive model', description: 'Train AI model for failure prediction' })
  @ApiResponse({ status: 200, description: 'Model training started' })
  async trainModel(@Body() trainDto: any) {
    try {
      const result = await this.predictiveService.trainModel(trainDto);
      return { statusCode: HttpStatus.OK, message: 'Model training started', data: result };
    } catch (error) {
      throw new HttpException('Failed to start training', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get AI maintenance recommendations' })
  @ApiResponse({ status: 200, description: 'Recommendations retrieved successfully' })
  async getRecommendations(@Query() query: any) {
    try {
      const recommendations = await this.predictiveService.getRecommendations(query);
      return { statusCode: HttpStatus.OK, message: 'Recommendations retrieved', data: recommendations };
    } catch (error) {
      throw new HttpException('Failed to retrieve recommendations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}''',

    "maintenance-analytics.controller.ts": '''// Industry 5.0 ERP Backend - Maintenance Analytics Controller
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
}''',
}

# Create the controllers
import os

base_path = r"C:\Users\nshrm\Desktop\Industry5.0\backend\modules\13-maintenance\src\controllers"

for filename, content in controllers.items():
    file_path = os.path.join(base_path, filename)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Created: {filename}")

print(f"Created {len(controllers)} controllers successfully!")
