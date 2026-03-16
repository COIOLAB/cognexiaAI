// Industry 5.0 ERP Backend - Planning Analytics Controller
// Advanced planning analytics with real-time insights and predictive intelligence
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { PlanningAnalyticsService } from '../services/planning-analytics.service';
import { ProductionPlanningGuard } from '../guards/production-planning.guard';

// DTOs for analytics
export class AnalyticsQueryDto {
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  dateFrom?: string;
  dateTo?: string;
  facilityIds?: string[];
  productLines?: string[];
  metrics?: ('EFFICIENCY' | 'UTILIZATION' | 'COST' | 'QUALITY' | 'DELIVERY')[];
  granularity?: 'hourly' | 'daily' | 'weekly' | 'monthly';
}

export class CustomAnalyticsDto {
  name: string;
  description?: string;
  filters: {
    dateRange: { start: string; end: string };
    facilities?: string[];
    products?: string[];
    categories?: string[];
  };
  metrics: {
    type: string;
    aggregation: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
    groupBy?: string[];
  }[];
  visualizations?: {
    type: 'chart' | 'table' | 'gauge' | 'heatmap';
    config: any;
  }[];
}

@ApiTags('Planning Analytics')
@Controller('production-planning/analytics')
@UseGuards(ProductionPlanningGuard)
@ApiBearerAuth()
export class PlanningAnalyticsController {
  private readonly logger = new Logger(PlanningAnalyticsController.name);

  constructor(
    private readonly analyticsService: PlanningAnalyticsService,
  ) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get planning dashboard overview',
    description: 'Retrieve comprehensive planning dashboard with key metrics and insights',
  })
  @ApiQuery({ name: 'period', required: false, description: 'Time period for analysis' })
  @ApiQuery({ name: 'facilityIds', required: false, description: 'Comma-separated facility IDs' })
  @ApiResponse({ 
    status: 200, 
    description: 'Planning dashboard data retrieved',
    schema: {
      example: {
        summary: {
          totalPlans: 45,
          activePlans: 28,
          planningEfficiency: 0.89,
          resourceUtilization: 0.84,
          onTimeDelivery: 0.92
        },
        trends: {
          efficiency: { current: 0.89, trend: 'improving', change: '+5%' },
          utilization: { current: 0.84, trend: 'stable', change: '+1%' },
          costs: { current: 1250000, trend: 'decreasing', change: '-8%' }
        },
        alerts: [
          { type: 'warning', message: 'Capacity constraint in Facility A', severity: 'medium' },
          { type: 'info', message: 'Demand forecast updated for Q2', severity: 'low' }
        ],
        recommendations: [
          'Optimize Line 3 scheduling for better utilization',
          'Consider additional capacity for peak season'
        ]
      }
    }
  })
  async getPlanningDashboard(
    @Query('period') period?: string,
    @Query('facilityIds') facilityIds?: string,
  ) {
    try {
      this.logger.log('Retrieving planning dashboard data');
      
      const facilities = facilityIds ? facilityIds.split(',') : undefined;
      const dashboard = await this.analyticsService.getPlanningDashboard({
        period,
        facilityIds: facilities,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Planning dashboard data retrieved successfully',
        data: dashboard,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve dashboard: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve dashboard data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpis')
  @ApiOperation({
    summary: 'Get planning KPIs',
    description: 'Retrieve key performance indicators for production planning',
  })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'metrics', required: false, description: 'Comma-separated list of metrics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Planning KPIs retrieved',
    schema: {
      example: {
        efficiency: {
          overall: 0.89,
          byFacility: { 'FAC_001': 0.92, 'FAC_002': 0.85 },
          trend: 'improving'
        },
        utilization: {
          machines: 0.87,
          labor: 0.83,
          space: 0.76,
          trend: 'stable'
        },
        costs: {
          totalPlanningCost: 125000,
          costPerUnit: 8.50,
          variance: -5.2
        },
        delivery: {
          onTimeRate: 0.94,
          averageLeadTime: 12.5,
          customerSatisfaction: 0.91
        }
      }
    }
  })
  async getPlanningKPIs(
    @Query('period') period?: string,
    @Query('metrics') metrics?: string,
  ) {
    try {
      this.logger.log('Retrieving planning KPIs');
      
      const metricsList = metrics ? metrics.split(',') : undefined;
      const kpis = await this.analyticsService.getPlanningKPIs({
        period,
        metrics: metricsList,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Planning KPIs retrieved successfully',
        data: kpis,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve KPIs: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve KPIs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('trends')
  @ApiOperation({
    summary: 'Get planning trends analysis',
    description: 'Analyze planning performance trends and patterns over time',
  })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'granularity', required: false, description: 'Data granularity (daily, weekly, monthly)' })
  @ApiQuery({ name: 'metric', required: false, description: 'Specific metric to analyze' })
  @ApiResponse({ 
    status: 200, 
    description: 'Planning trends retrieved',
    schema: {
      example: {
        timeSeries: [
          { date: '2024-01', efficiency: 0.85, utilization: 0.82, costs: 130000 },
          { date: '2024-02', efficiency: 0.87, utilization: 0.84, costs: 128000 },
          { date: '2024-03', efficiency: 0.89, utilization: 0.84, costs: 125000 }
        ],
        patterns: {
          seasonality: 'High demand in Q4, low in Q1',
          cyclical: '7-day cycle with weekend variations',
          trends: 'Efficiency improving 2% monthly'
        },
        forecasts: {
          nextPeriod: { efficiency: 0.91, utilization: 0.86 },
          confidence: 0.87
        }
      }
    }
  })
  async getPlanningTrends(
    @Query('period') period?: string,
    @Query('granularity') granularity?: string,
    @Query('metric') metric?: string,
  ) {
    try {
      this.logger.log('Retrieving planning trends analysis');
      
      const trends = await this.analyticsService.getPlanningTrends({
        period,
        granularity,
        metric,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Planning trends retrieved successfully',
        data: trends,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve trends: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve trends',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('custom')
  @ApiOperation({
    summary: 'Generate custom analytics report',
    description: 'Create customized analytics report with specific filters and metrics',
  })
  @ApiBody({ type: CustomAnalyticsDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Custom analytics report generated',
    schema: {
      example: {
        reportId: 'custom_report_123',
        name: 'Q1 Efficiency Analysis',
        generatedAt: '2024-03-01T10:00:00Z',
        data: {
          summary: { totalRecords: 1500, facilities: 3, products: 25 },
          metrics: [
            { metric: 'efficiency', value: 0.89, target: 0.85, variance: '+4.7%' },
            { metric: 'utilization', value: 0.84, target: 0.80, variance: '+5.0%' }
          ],
          insights: ['Efficiency exceeded target by 4.7%', 'Line 2 shows consistent improvement']
        }
      }
    }
  })
  async generateCustomReport(@Body() customDto: CustomAnalyticsDto) {
    try {
      this.logger.log(`Generating custom analytics report: ${customDto.name}`);
      
      const report = await this.analyticsService.generateCustomReport(customDto);
      
      this.logger.log(`Custom report generated: ${report.reportId}`);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Custom analytics report generated successfully',
        data: report,
      };
    } catch (error) {
      this.logger.error(`Failed to generate custom report: ${error.message}`);
      throw new HttpException(
        'Failed to generate custom report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('comparisons')
  @ApiOperation({
    summary: 'Get comparative analytics',
    description: 'Compare planning performance across facilities, time periods, or scenarios',
  })
  @ApiQuery({ name: 'type', required: true, description: 'Comparison type: facility|period|scenario' })
  @ApiQuery({ name: 'entities', required: true, description: 'Comma-separated entities to compare' })
  @ApiQuery({ name: 'metrics', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Comparative analytics retrieved',
    schema: {
      example: {
        comparisonType: 'facility',
        entities: ['FAC_001', 'FAC_002', 'FAC_003'],
        metrics: {
          efficiency: {
            'FAC_001': 0.92,
            'FAC_002': 0.85,
            'FAC_003': 0.88,
            best: 'FAC_001',
            worst: 'FAC_002',
            variance: 0.07
          },
          utilization: {
            'FAC_001': 0.89,
            'FAC_002': 0.81,
            'FAC_003': 0.85,
            best: 'FAC_001',
            worst: 'FAC_002',
            variance: 0.08
          }
        },
        insights: [
          'FAC_001 consistently outperforms others',
          'FAC_002 needs efficiency improvements'
        ]
      }
    }
  })
  async getComparativeAnalytics(
    @Query('type') type: string,
    @Query('entities') entities: string,
    @Query('metrics') metrics?: string,
  ) {
    try {
      this.logger.log(`Generating comparative analytics: ${type}`);
      
      const entityList = entities.split(',');
      const metricsList = metrics ? metrics.split(',') : undefined;
      
      const comparison = await this.analyticsService.getComparativeAnalytics({
        type,
        entities: entityList,
        metrics: metricsList,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Comparative analytics retrieved successfully',
        data: comparison,
      };
    } catch (error) {
      this.logger.error(`Failed to generate comparative analytics: ${error.message}`);
      throw new HttpException(
        'Failed to generate comparative analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('alerts')
  @ApiOperation({
    summary: 'Get planning alerts and notifications',
    description: 'Retrieve active planning alerts, warnings, and recommendations',
  })
  @ApiQuery({ name: 'severity', required: false, description: 'Filter by severity: low|medium|high|critical' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by alert type' })
  @ApiResponse({ 
    status: 200, 
    description: 'Planning alerts retrieved',
    schema: {
      example: {
        activeAlerts: 8,
        criticalAlerts: 2,
        alerts: [
          {
            id: 'alert_123',
            type: 'capacity_constraint',
            severity: 'high',
            message: 'Machine capacity at 98% in Line A',
            facility: 'FAC_001',
            triggered: '2024-03-01T08:30:00Z',
            recommendations: ['Add overtime shift', 'Redistribute workload']
          },
          {
            id: 'alert_124',
            type: 'demand_spike',
            severity: 'medium',
            message: 'Demand forecast increased 15% for Product X',
            triggered: '2024-03-01T06:00:00Z',
            recommendations: ['Review capacity plan', 'Update production schedule']
          }
        ]
      }
    }
  })
  async getPlanningAlerts(
    @Query('severity') severity?: string,
    @Query('type') type?: string,
  ) {
    try {
      this.logger.log('Retrieving planning alerts');
      
      const alerts = await this.analyticsService.getPlanningAlerts({
        severity,
        type,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Planning alerts retrieved successfully',
        data: alerts,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve alerts: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve alerts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
