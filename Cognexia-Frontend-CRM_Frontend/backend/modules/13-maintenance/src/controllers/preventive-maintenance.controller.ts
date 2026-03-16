// Industry 5.0 ERP Backend - Preventive Maintenance Controller
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
}