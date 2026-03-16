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

import { AnalyticsService } from '../services/analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
@ApiBearerAuth()
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get('dashboard/kpis')
  @ApiOperation({
    summary: 'Get dashboard KPIs',
    description: 'Retrieve all KPIs for analytics dashboard',
  })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'timeRange', required: false })
  async getDashboardKPIs(
    @Query('category') category?: string,
    @Query('timeRange') timeRange?: string,
  ) {
    try {
      const kpis = await this.analyticsService.getDashboardKPIs({
        category,
        timeRange,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Dashboard KPIs retrieved successfully',
        data: kpis,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve dashboard KPIs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to retrieve dashboard KPIs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('reports')
  @ApiOperation({
    summary: 'Get analytics reports',
    description: 'Retrieve analytics reports with optional filtering',
  })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getReports(
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    try {
      const reports = await this.analyticsService.getReports({
        type,
        status,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Reports retrieved successfully',
        data: reports,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve reports: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to retrieve reports',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('reports/generate')
  @ApiOperation({
    summary: 'Generate report',
    description: 'Generate a new analytics report',
  })
  @ApiBody({ type: Object })
  async generateReport(@Body() reportConfig: any) {
    try {
      const report = await this.analyticsService.generateReport(reportConfig);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Report generated successfully',
        data: report,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to generate report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('visualizations')
  @ApiOperation({
    summary: 'Get data visualizations',
    description: 'Retrieve data visualizations with optional filtering',
  })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'category', required: false })
  async getVisualizations(
    @Query('type') type?: string,
    @Query('category') category?: string,
  ) {
    try {
      const visualizations = await this.analyticsService.getVisualizations({
        type,
        category,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Visualizations retrieved successfully',
        data: visualizations,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve visualizations: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to retrieve visualizations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('visualizations')
  @ApiOperation({
    summary: 'Create visualization',
    description: 'Create a new data visualization',
  })
  @ApiBody({ type: Object })
  async createVisualization(@Body() visualizationConfig: any) {
    try {
      const visualization = await this.analyticsService.createVisualization(visualizationConfig);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Visualization created successfully',
        data: visualization,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create visualization: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to create visualization',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('trends/analysis')
  @ApiOperation({
    summary: 'Get trend analysis',
    description: 'Analyze trends in data over time',
  })
  @ApiQuery({ name: 'metric', required: true })
  @ApiQuery({ name: 'timeRange', required: false })
  async getTrendAnalysis(
    @Query('metric') metric: string,
    @Query('timeRange') timeRange?: string,
  ) {
    try {
      const analysis = await this.analyticsService.analyzeTrends({
        metric,
        timeRange,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Trend analysis completed successfully',
        data: analysis,
      };
    } catch (error) {
      this.logger.error(
        `Failed to analyze trends: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to analyze trends',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('predictions')
  @ApiOperation({
    summary: 'Get predictions',
    description: 'Get predictive analytics for various metrics',
  })
  @ApiQuery({ name: 'metric', required: true })
  @ApiQuery({ name: 'horizon', required: false })
  async getPredictions(
    @Query('metric') metric: string,
    @Query('horizon') horizon?: string,
  ) {
    try {
      const predictions = await this.analyticsService.getPredictions({
        metric,
        horizon,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Predictions generated successfully',
        data: predictions,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate predictions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to generate predictions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('anomalies')
  @ApiOperation({
    summary: 'Detect anomalies',
    description: 'Detect anomalies in data streams',
  })
  @ApiQuery({ name: 'dataStream', required: true })
  @ApiQuery({ name: 'sensitivity', required: false })
  async detectAnomalies(
    @Query('dataStream') dataStream: string,
    @Query('sensitivity') sensitivity?: number,
  ) {
    try {
      const anomalies = await this.analyticsService.detectAnomalies({
        dataStream,
        sensitivity,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Anomaly detection completed successfully',
        data: anomalies,
      };
    } catch (error) {
      this.logger.error(
        `Failed to detect anomalies: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new HttpException(
        'Failed to detect anomalies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
