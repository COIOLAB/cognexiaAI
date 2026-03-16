// Industry 5.0 ERP Backend - Predictive Maintenance Controller
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
}