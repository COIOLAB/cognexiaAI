// Industry 5.0 ERP Backend - Demand Forecasting Controller
// Advanced demand forecasting with AI/ML predictions and market analysis
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

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
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { DemandForecastingService } from '../services/demand-forecasting.service';
import { ProductionPlanningGuard } from '../guards/production-planning.guard';

// DTOs for demand forecasting
export class CreateDemandForecastDto {
  productId: string;
  timeHorizon: number; // days
  forecastMethod: 'ARIMA' | 'EXPONENTIAL_SMOOTHING' | 'ML_REGRESSION' | 'NEURAL_NETWORK';
  marketSegments?: string[];
  seasonalFactors?: boolean;
  externalFactors?: {
    economicIndicators?: boolean;
    competitorAnalysis?: boolean;
    marketTrends?: boolean;
  };
}

export class UpdateDemandForecastDto {
  actualDemand?: number;
  adjustmentFactor?: number;
  notes?: string;
  forecastAccuracy?: number;
}

export class DemandForecastQueryDto {
  productId?: string;
  dateFrom?: string;
  dateTo?: string;
  forecastMethod?: string;
  accuracy?: string; // 'high', 'medium', 'low'
  limit?: number;
  offset?: number;
}

@ApiTags('Demand Forecasting')
@Controller('production-planning/demand-forecasting')
@UseGuards(ProductionPlanningGuard)
@ApiBearerAuth()
export class DemandForecastingController {
  private readonly logger = new Logger(DemandForecastingController.name);

  constructor(
    private readonly demandForecastingService: DemandForecastingService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create new demand forecast',
    description: 'Generate AI-powered demand forecast for specific product and time horizon',
  })
  @ApiBody({ type: CreateDemandForecastDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Demand forecast created successfully',
    schema: {
      example: {
        id: 'forecast_123',
        productId: 'PROD_001',
        forecastPeriod: '2024-Q1',
        predictedDemand: 15500,
        confidenceLevel: 0.92,
        forecastMethod: 'NEURAL_NETWORK',
        accuracy: 'high'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid forecast parameters' })
  @ApiResponse({ status: 500, description: 'Forecast generation failed' })
  async createDemandForecast(@Body() createDto: CreateDemandForecastDto) {
    try {
      this.logger.log(`Creating demand forecast for product: ${createDto.productId}`);
      
      const forecast = await this.demandForecastingService.generateForecast(createDto);
      
      this.logger.log(`Demand forecast created successfully: ${forecast.id}`);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Demand forecast created successfully',
        data: forecast,
      };
    } catch (error) {
      this.logger.error(`Failed to create demand forecast: ${error.message}`);
      throw new HttpException(
        'Failed to create demand forecast',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get demand forecasts',
    description: 'Retrieve demand forecasts with filtering and pagination',
  })
  @ApiQuery({ name: 'productId', required: false, description: 'Filter by product ID' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'forecastMethod', required: false, description: 'Forecast method filter' })
  @ApiQuery({ name: 'accuracy', required: false, description: 'Accuracy level filter' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results per page' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of results to skip' })
  @ApiResponse({ 
    status: 200, 
    description: 'Demand forecasts retrieved successfully',
    schema: {
      example: {
        forecasts: [
          {
            id: 'forecast_123',
            productId: 'PROD_001',
            forecastPeriod: '2024-Q1',
            predictedDemand: 15500,
            confidenceLevel: 0.92,
            forecastMethod: 'NEURAL_NETWORK'
          }
        ],
        total: 45,
        page: 1,
        totalPages: 5
      }
    }
  })
  async getDemandForecasts(@Query() query: DemandForecastQueryDto) {
    try {
      this.logger.log('Retrieving demand forecasts with filters');
      
      const result = await this.demandForecastingService.getForecasts(query);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Demand forecasts retrieved successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve demand forecasts: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve demand forecasts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get demand forecast by ID',
    description: 'Retrieve detailed information about a specific demand forecast',
  })
  @ApiParam({ name: 'id', description: 'Demand forecast ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Demand forecast details retrieved',
    schema: {
      example: {
        id: 'forecast_123',
        productId: 'PROD_001',
        forecastPeriod: '2024-Q1',
        predictedDemand: 15500,
        confidenceLevel: 0.92,
        forecastMethod: 'NEURAL_NETWORK',
        accuracy: 'high',
        modelParameters: {
          historicalPeriods: 24,
          seasonalFactors: true,
          trendAnalysis: true
        },
        createdAt: '2024-01-01T00:00:00Z'
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Demand forecast not found' })
  async getDemandForecastById(@Param('id') id: string) {
    try {
      this.logger.log(`Retrieving demand forecast: ${id}`);
      
      const forecast = await this.demandForecastingService.getForecastById(id);
      
      if (!forecast) {
        throw new HttpException('Demand forecast not found', HttpStatus.NOT_FOUND);
      }
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Demand forecast retrieved successfully',
        data: forecast,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve demand forecast: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to retrieve demand forecast',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update demand forecast',
    description: 'Update demand forecast with actual demand data or adjustments',
  })
  @ApiParam({ name: 'id', description: 'Demand forecast ID' })
  @ApiBody({ type: UpdateDemandForecastDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Demand forecast updated successfully' 
  })
  @ApiResponse({ status: 404, description: 'Demand forecast not found' })
  async updateDemandForecast(
    @Param('id') id: string,
    @Body() updateDto: UpdateDemandForecastDto,
  ) {
    try {
      this.logger.log(`Updating demand forecast: ${id}`);
      
      const updatedForecast = await this.demandForecastingService.updateForecast(id, updateDto);
      
      this.logger.log(`Demand forecast updated successfully: ${id}`);
      return {
        statusCode: HttpStatus.OK,
        message: 'Demand forecast updated successfully',
        data: updatedForecast,
      };
    } catch (error) {
      this.logger.error(`Failed to update demand forecast: ${error.message}`);
      throw new HttpException(
        'Failed to update demand forecast',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete demand forecast',
    description: 'Remove a demand forecast from the system',
  })
  @ApiParam({ name: 'id', description: 'Demand forecast ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Demand forecast deleted successfully' 
  })
  @ApiResponse({ status: 404, description: 'Demand forecast not found' })
  async deleteDemandForecast(@Param('id') id: string) {
    try {
      this.logger.log(`Deleting demand forecast: ${id}`);
      
      await this.demandForecastingService.deleteForecast(id);
      
      this.logger.log(`Demand forecast deleted successfully: ${id}`);
      return {
        statusCode: HttpStatus.OK,
        message: 'Demand forecast deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to delete demand forecast: ${error.message}`);
      throw new HttpException(
        'Failed to delete demand forecast',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/validate')
  @ApiOperation({
    summary: 'Validate demand forecast accuracy',
    description: 'Compare forecast predictions with actual demand to calculate accuracy',
  })
  @ApiParam({ name: 'id', description: 'Demand forecast ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Forecast validation completed',
    schema: {
      example: {
        forecastId: 'forecast_123',
        accuracy: 0.87,
        meanAbsoluteError: 150,
        meanSquaredError: 35000,
        validationPeriod: '2024-Q1',
        recommendations: ['Adjust seasonal factors', 'Include competitor data']
      }
    }
  })
  async validateForecastAccuracy(@Param('id') id: string) {
    try {
      this.logger.log(`Validating forecast accuracy: ${id}`);
      
      const validation = await this.demandForecastingService.validateForecastAccuracy(id);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Forecast validation completed',
        data: validation,
      };
    } catch (error) {
      this.logger.error(`Failed to validate forecast: ${error.message}`);
      throw new HttpException(
        'Failed to validate forecast',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics/performance')
  @ApiOperation({
    summary: 'Get forecasting performance analytics',
    description: 'Retrieve comprehensive analytics on forecasting accuracy and trends',
  })
  @ApiQuery({ name: 'period', required: false, description: 'Analysis period (30d, 90d, 1y)' })
  @ApiQuery({ name: 'method', required: false, description: 'Filter by forecasting method' })
  @ApiResponse({ 
    status: 200, 
    description: 'Forecasting analytics retrieved',
    schema: {
      example: {
        overallAccuracy: 0.89,
        methodPerformance: {
          'NEURAL_NETWORK': { accuracy: 0.92, count: 150 },
          'ARIMA': { accuracy: 0.85, count: 100 },
          'EXPONENTIAL_SMOOTHING': { accuracy: 0.83, count: 75 }
        },
        trends: {
          accuracyTrend: 'improving',
          averageError: 'decreasing'
        }
      }
    }
  })
  async getForecastingAnalytics(
    @Query('period') period?: string,
    @Query('method') method?: string,
  ) {
    try {
      this.logger.log('Retrieving forecasting performance analytics');
      
      const analytics = await this.demandForecastingService.getForecastingAnalytics({
        period,
        method,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Forecasting analytics retrieved successfully',
        data: analytics,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve analytics: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
