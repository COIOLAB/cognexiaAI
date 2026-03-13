// Industry 5.0 ERP Backend - Revolutionary Financial Analytics & Intelligence Controller
// Real-time dashboards, AI-powered KPI monitoring, predictive analytics, and executive reporting
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
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Server, Socket } from 'socket.io';

import { FinancialAnalyticsService } from '../services/financial-analytics.service';
import { KPIMonitoringService } from '../services/kpi-monitoring.service';
import { PredictiveAnalyticsService } from '../services/predictive-analytics.service';
import { ExecutiveReportingService } from '../services/executive-reporting.service';
import { RealTimeDashboardService } from '../services/real-time-dashboard.service';
import { FinanceGuard } from '../guards/finance.guard';

// DTOs for Financial Analytics
export class DashboardConfigurationDto {
  dashboardId?: string;
  dashboardName: string;
  dashboardType: 'EXECUTIVE' | 'OPERATIONAL' | 'ANALYTICAL' | 'COMPLIANCE' | 'CUSTOM';
  userRole: string;
  layout: {
    columns: number;
    rows: number;
    widgets: {
      widgetId: string;
      widgetType: 'KPI' | 'CHART' | 'TABLE' | 'GAUGE' | 'MAP' | 'ALERT' | 'TEXT';
      position: { x: number; y: number; width: number; height: number };
      configuration: {
        title: string;
        dataSource: string;
        metrics: string[];
        filters?: any;
        refreshInterval: number;
        thresholds?: {
          warning: number;
          critical: number;
        };
        visualization: {
          chartType?: 'LINE' | 'BAR' | 'PIE' | 'AREA' | 'SCATTER' | 'HEATMAP';
          colors?: string[];
          animations?: boolean;
        };
      };
    }[];
  };
  filters: {
    globalFilters: {
      dateRange: { from: string; to: string };
      businessUnit?: string[];
      currency?: string;
      costCenter?: string[];
    };
    userDefinedFilters?: any[];
  };
  permissions: {
    viewPermissions: string[];
    editPermissions: string[];
    sharePermissions: string[];
  };
  aiConfiguration: {
    enablePredictiveInsights: boolean;
    enableAnomalyDetection: boolean;
    enableAutoRecommendations: boolean;
    enableNaturalLanguageQuery: boolean;
  };
}

export class KPIDefinitionDto {
  kpiId?: string;
  kpiName: string;
  kpiCategory: 'PROFITABILITY' | 'LIQUIDITY' | 'EFFICIENCY' | 'LEVERAGE' | 'GROWTH' | 'CUSTOM';
  description: string;
  formula: {
    numerator: string;
    denominator?: string;
    customFormula?: string;
    calculationType: 'RATIO' | 'PERCENTAGE' | 'ABSOLUTE' | 'VARIANCE' | 'TREND';
  };
  dataSources: {
    primarySource: string;
    secondarySources?: string[];
    aggregationMethod: 'SUM' | 'AVERAGE' | 'COUNT' | 'MIN' | 'MAX' | 'CUSTOM';
    timeGranularity: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  };
  thresholds: {
    excellent: { min?: number; max?: number; color: string };
    good: { min?: number; max?: number; color: string };
    warning: { min?: number; max?: number; color: string };
    critical: { min?: number; max?: number; color: string };
  };
  benchmarking: {
    industryBenchmark?: number;
    competitorBenchmark?: number;
    historicalBenchmark?: number;
    targetValue?: number;
  };
  aiConfiguration: {
    predictiveModeling: boolean;
    trendAnalysis: boolean;
    correlationAnalysis: boolean;
    anomalyDetection: boolean;
  };
  alerting: {
    enabled: boolean;
    recipients: string[];
    alertConditions: {
      thresholdBreach: boolean;
      significantChange: boolean;
      trendReversal: boolean;
      anomalyDetected: boolean;
    };
  };
}

export class PredictiveAnalysisDto {
  analysisType: 'REVENUE_FORECAST' | 'CASH_FLOW_PREDICTION' | 'PROFITABILITY_ANALYSIS' | 'RISK_ASSESSMENT' | 'SCENARIO_PLANNING' | 'BUDGET_VARIANCE';
  timeHorizon: {
    period: 'WEEKS' | 'MONTHS' | 'QUARTERS' | 'YEARS';
    duration: number;
  };
  inputParameters: {
    historicalPeriods: number;
    seasonalityFactors: boolean;
    externalFactors: {
      economicIndicators: boolean;
      marketTrends: boolean;
      industryFactors: boolean;
      competitiveAnalysis: boolean;
    };
    internalFactors: {
      businessGrowth: number;
      investmentPlans: any[];
      operationalChanges: any[];
      strategicInitiatives: any[];
    };
  };
  modelConfiguration: {
    algorithm: 'LINEAR_REGRESSION' | 'ARIMA' | 'LSTM' | 'RANDOM_FOREST' | 'ENSEMBLE' | 'QUANTUM_ML';
    confidenceLevel: number;
    sensitivityAnalysis: boolean;
    monteCarloSimulations: number;
    quantumOptimization: boolean;
  };
  outputRequirements: {
    granularity: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
    includeConfidenceIntervals: boolean;
    includeScenarioAnalysis: boolean;
    includeRiskMetrics: boolean;
    includeRecommendations: boolean;
  };
}

export class ExecutiveReportDto {
  reportType: 'MONTHLY_EXECUTIVE' | 'QUARTERLY_BOARD' | 'ANNUAL_STAKEHOLDER' | 'PERFORMANCE_REVIEW' | 'STRATEGIC_UPDATE';
  reportingPeriod: {
    startDate: string;
    endDate: string;
    comparisonPeriods?: string[];
  };
  audience: 'CEO' | 'CFO' | 'BOARD' | 'INVESTORS' | 'STAKEHOLDERS' | 'MANAGEMENT';
  contentConfiguration: {
    executiveSummary: boolean;
    keyMetrics: string[];
    financialHighlights: boolean;
    performanceAnalysis: boolean;
    marketAnalysis: boolean;
    strategicInitiatives: boolean;
    riskAssessment: boolean;
    futureOutlook: boolean;
    recommendations: boolean;
  };
  visualization: {
    includeCharts: boolean;
    includeTables: boolean;
    includeInfographics: boolean;
    colorScheme: string;
    branding: boolean;
  };
  distributionSettings: {
    format: 'PDF' | 'POWERPOINT' | 'HTML' | 'INTERACTIVE';
    deliveryMethod: 'EMAIL' | 'PORTAL' | 'PRINT' | 'API';
    recipients: string[];
    scheduledDelivery?: {
      frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
      dayOfWeek?: string;
      timeOfDay?: string;
    };
  };
  aiEnhancements: {
    naturalLanguageGeneration: boolean;
    insightGeneration: boolean;
    automaticNarrative: boolean;
    intelligentRecommendations: boolean;
  };
}

@ApiTags('Financial Analytics & Intelligence')
@Controller('finance-accounting/financial-analytics')
@WebSocketGateway({
  cors: true,
  path: '/analytics-socket',
  transports: ['websocket', 'polling']
})
@UseGuards(FinanceGuard)
@ApiBearerAuth()
export class FinancialAnalyticsController {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(FinancialAnalyticsController.name);
  private activeAnalyticsSessions = new Map<string, any>();

  constructor(
    private readonly financialAnalyticsService: FinancialAnalyticsService,
    private readonly kpiMonitoringService: KPIMonitoringService,
    private readonly predictiveAnalyticsService: PredictiveAnalyticsService,
    private readonly executiveReportingService: ExecutiveReportingService,
    private readonly realTimeDashboardService: RealTimeDashboardService,
  ) {}

  @Post('dashboards')
  @ApiOperation({
    summary: 'Create Dashboard',
    description: 'Create real-time financial dashboard with AI-powered insights and customizable widgets',
  })
  @ApiBody({ type: DashboardConfigurationDto })
  @ApiResponse({
    status: 201,
    description: 'Dashboard created successfully',
    schema: {
      example: {
        dashboardId: 'DASH_2024_001',
        dashboardName: 'Executive Financial Dashboard',
        dashboardType: 'EXECUTIVE',
        status: 'ACTIVE',
        realTimeConfiguration: {
          autoRefresh: true,
          refreshInterval: 30,
          dataLatency: '< 5 seconds',
          aiInsights: true
        },
        widgets: [
          {
            widgetId: 'WIDGET_001',
            title: 'Revenue Trend',
            type: 'CHART',
            currentValue: 25000000,
            trend: '+15.2%',
            status: 'EXCELLENT',
            aiInsights: [
              'Revenue growth accelerating vs last quarter',
              'Digital channels driving 60% of growth',
              'Predicted to exceed annual target by 8%'
            ]
          },
          {
            widgetId: 'WIDGET_002',
            title: 'Cash Flow Forecast',
            type: 'GAUGE',
            currentValue: 5000000,
            projectedValue: 6200000,
            confidence: 0.94,
            status: 'GOOD',
            predictiveAnalysis: {
              next30Days: 5800000,
              next60Days: 6200000,
              next90Days: 6800000,
              risks: ['Seasonal payment delays', 'Large client payment pending']
            }
          }
        ],
        aiCapabilities: {
          naturalLanguageQuery: true,
          automaticInsights: true,
          anomalyDetection: true,
          predictiveAlerts: true,
          recommendationEngine: true
        },
        performance: {
          loadTime: '1.2 seconds',
          dataAccuracy: '99.8%',
          userSatisfaction: 4.8
        }
      }
    }
  })
  async createDashboard(@Body() dashboardDto: DashboardConfigurationDto) {
    try {
      this.logger.log(`Creating dashboard: ${dashboardDto.dashboardName}`);
      
      const dashboard = await this.realTimeDashboardService.createAdvancedDashboard(dashboardDto);
      
      // Emit real-time update
      this.server.emit('dashboard-created', {
        dashboardId: dashboard.dashboardId,
        dashboardName: dashboard.dashboardName,
        userRole: dashboard.userRole,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Dashboard created successfully',
        data: dashboard,
      };
    } catch (error) {
      this.logger.error(`Dashboard creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create dashboard',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('kpis')
  @ApiOperation({
    summary: 'Define KPI',
    description: 'Define and configure KPI with AI-powered monitoring, thresholds, and predictive analytics',
  })
  @ApiBody({ type: KPIDefinitionDto })
  @ApiResponse({
    status: 201,
    description: 'KPI defined successfully'
  })
  async defineKPI(@Body() kpiDto: KPIDefinitionDto) {
    try {
      this.logger.log(`Defining KPI: ${kpiDto.kpiName}`);
      
      const kpi = await this.kpiMonitoringService.defineAdvancedKPI(kpiDto);
      
      // Emit real-time update
      this.server.emit('kpi-defined', {
        kpiId: kpi.kpiId,
        kpiName: kpi.kpiName,
        category: kpi.kpiCategory,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'KPI defined successfully',
        data: kpi,
      };
    } catch (error) {
      this.logger.error(`KPI definition failed: ${error.message}`);
      throw new HttpException(
        'Failed to define KPI',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('kpis/real-time')
  @ApiOperation({
    summary: 'Get Real-Time KPIs',
    description: 'Retrieve real-time KPI values with AI insights, trends, and predictions',
  })
  @ApiQuery({ name: 'category', required: false, description: 'KPI category filter' })
  @ApiQuery({ name: 'timeRange', required: false, description: 'Time range for analysis' })
  @ApiResponse({
    status: 200,
    description: 'Real-time KPIs retrieved successfully'
  })
  async getRealTimeKPIs(
    @Query('category') category?: string,
    @Query('timeRange') timeRange?: string,
  ) {
    try {
      this.logger.log('Retrieving real-time KPIs');
      
      const kpis = await this.kpiMonitoringService.getRealTimeKPIs({
        category,
        timeRange: timeRange || 'CURRENT_MONTH',
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Real-time KPIs retrieved successfully',
        data: kpis,
      };
    } catch (error) {
      this.logger.error(`Real-time KPIs retrieval failed: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve real-time KPIs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('predictive-analysis')
  @ApiOperation({
    summary: 'Perform Predictive Analysis',
    description: 'AI-powered predictive analysis with quantum-enhanced modeling and scenario planning',
  })
  @ApiBody({ type: PredictiveAnalysisDto })
  @ApiResponse({
    status: 200,
    description: 'Predictive analysis completed successfully'
  })
  async performPredictiveAnalysis(@Body() analysisDto: PredictiveAnalysisDto) {
    try {
      this.logger.log(`Performing predictive analysis: ${analysisDto.analysisType}`);
      
      const analysis = await this.predictiveAnalyticsService.performAdvancedPredictiveAnalysis(analysisDto);
      
      // Emit real-time update
      this.server.emit('predictive-analysis-completed', {
        analysisType: analysisDto.analysisType,
        timeHorizon: analysisDto.timeHorizon,
        confidence: analysis.confidence,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Predictive analysis completed successfully',
        data: analysis,
      };
    } catch (error) {
      this.logger.error(`Predictive analysis failed: ${error.message}`);
      throw new HttpException(
        'Predictive analysis failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('executive-reports')
  @ApiOperation({
    summary: 'Generate Executive Report',
    description: 'AI-powered executive report generation with natural language narratives and intelligent insights',
  })
  @ApiBody({ type: ExecutiveReportDto })
  @ApiResponse({
    status: 200,
    description: 'Executive report generated successfully'
  })
  async generateExecutiveReport(@Body() reportDto: ExecutiveReportDto) {
    try {
      this.logger.log(`Generating executive report: ${reportDto.reportType}`);
      
      const report = await this.executiveReportingService.generateAdvancedExecutiveReport(reportDto);
      
      // Emit real-time update
      this.server.emit('executive-report-generated', {
        reportType: reportDto.reportType,
        audience: reportDto.audience,
        reportId: report.reportId,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Executive report generated successfully',
        data: report,
      };
    } catch (error) {
      this.logger.error(`Executive report generation failed: ${error.message}`);
      throw new HttpException(
        'Executive report generation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('financial-insights')
  @ApiOperation({
    summary: 'Get AI Financial Insights',
    description: 'AI-generated financial insights with recommendations, risks, and opportunities',
  })
  @ApiQuery({ name: 'insightType', required: false, description: 'Type of insights to generate' })
  @ApiQuery({ name: 'timeRange', required: false, description: 'Time range for analysis' })
  @ApiResponse({
    status: 200,
    description: 'Financial insights generated successfully'
  })
  async getFinancialInsights(
    @Query('insightType') insightType?: string,
    @Query('timeRange') timeRange?: string,
  ) {
    try {
      this.logger.log('Generating AI financial insights');
      
      const insights = await this.financialAnalyticsService.generateAIInsights({
        insightType: insightType || 'COMPREHENSIVE',
        timeRange: timeRange || 'CURRENT_QUARTER',
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Financial insights generated successfully',
        data: insights,
      };
    } catch (error) {
      this.logger.error(`Financial insights generation failed: ${error.message}`);
      throw new HttpException(
        'Financial insights generation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('anomaly-detection')
  @ApiOperation({
    summary: 'Detect Financial Anomalies',
    description: 'AI-powered anomaly detection across financial data with risk assessment and recommendations',
  })
  @ApiResponse({
    status: 200,
    description: 'Anomaly detection completed successfully'
  })
  async detectFinancialAnomalies() {
    try {
      this.logger.log('Performing financial anomaly detection');
      
      const anomalies = await this.financialAnalyticsService.detectAnomalies();
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Anomaly detection completed successfully',
        data: anomalies,
      };
    } catch (error) {
      this.logger.error(`Anomaly detection failed: ${error.message}`);
      throw new HttpException(
        'Anomaly detection failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('natural-language-query')
  @ApiOperation({
    summary: 'Natural Language Query',
    description: 'Process natural language queries about financial data and provide AI-powered responses',
  })
  @ApiResponse({
    status: 200,
    description: 'Natural language query processed successfully'
  })
  async processNaturalLanguageQuery(@Body() queryData: { query: string; context?: any }) {
    try {
      this.logger.log(`Processing natural language query: ${queryData.query}`);
      
      const response = await this.financialAnalyticsService.processNaturalLanguageQuery(
        queryData.query,
        queryData.context,
      );
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Natural language query processed successfully',
        data: response,
      };
    } catch (error) {
      this.logger.error(`Natural language query processing failed: ${error.message}`);
      throw new HttpException(
        'Natural language query processing failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('benchmark-analysis')
  @ApiOperation({
    summary: 'Benchmark Analysis',
    description: 'Comprehensive benchmark analysis against industry, competitors, and historical performance',
  })
  @ApiQuery({ name: 'benchmarkType', required: false, description: 'Type of benchmark analysis' })
  @ApiResponse({
    status: 200,
    description: 'Benchmark analysis completed successfully'
  })
  async performBenchmarkAnalysis(@Query('benchmarkType') benchmarkType?: string) {
    try {
      this.logger.log('Performing benchmark analysis');
      
      const analysis = await this.financialAnalyticsService.performBenchmarkAnalysis({
        benchmarkType: benchmarkType || 'COMPREHENSIVE',
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Benchmark analysis completed successfully',
        data: analysis,
      };
    } catch (error) {
      this.logger.error(`Benchmark analysis failed: ${error.message}`);
      throw new HttpException(
        'Benchmark analysis failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('analytics-dashboard')
  @ApiOperation({
    summary: 'Financial Analytics Master Dashboard',
    description: 'Comprehensive analytics dashboard with all financial metrics, insights, and predictions',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics dashboard data retrieved successfully'
  })
  async getAnalyticsDashboard() {
    try {
      const dashboard = await this.financialAnalyticsService.generateAnalyticsDashboard();
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Analytics dashboard generated successfully',
        data: dashboard,
      };
    } catch (error) {
      this.logger.error(`Analytics dashboard generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate analytics dashboard',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // WebSocket handlers for real-time analytics
  @SubscribeMessage('subscribe-analytics-updates')
  handleAnalyticsSubscription(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const { dashboards, kpis, predictions } = data;
    dashboards.forEach(dashboard => client.join(`dashboard_${dashboard}`));
    kpis.forEach(kpi => client.join(`kpi_${kpi}`));
    predictions.forEach(prediction => client.join(`prediction_${prediction}`));
    
    this.activeAnalyticsSessions.set(client.id, { dashboards, kpis, predictions });
    
    client.emit('subscription-confirmed', {
      dashboards,
      kpis,
      predictions,
      realTimeUpdates: true,
      aiInsights: true,
      predictiveAnalytics: true,
      naturalLanguageQuery: true,
      timestamp: new Date().toISOString()
    });
    
    this.logger.log(`Analytics monitoring subscription: ${dashboards.length} dashboards, ${kpis.length} KPIs`);
  }

  @SubscribeMessage('realtime-kpi-request')
  async handleRealtimeKPIRequest(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const kpiData = await this.kpiMonitoringService.getRealtimeKPIData(data.kpiId);
      
      client.emit('kpi-data-update', {
        kpiId: data.kpiId,
        data: kpiData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time KPI request failed: ${error.message}`);
      client.emit('error', { message: 'KPI data request failed' });
    }
  }

  @SubscribeMessage('natural-language-query')
  async handleNaturalLanguageQuery(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const response = await this.financialAnalyticsService.processNaturalLanguageQuery(
        data.query,
        data.context,
      );
      
      client.emit('query-response', {
        queryId: data.queryId,
        response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time natural language query failed: ${error.message}`);
      client.emit('error', { message: 'Natural language query failed' });
    }
  }

  @SubscribeMessage('predictive-update-request')
  async handlePredictiveUpdateRequest(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const prediction = await this.predictiveAnalyticsService.getRealtimePrediction(data.predictionId);
      
      client.emit('predictive-update', {
        predictionId: data.predictionId,
        prediction,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time predictive update failed: ${error.message}`);
      client.emit('error', { message: 'Predictive update failed' });
    }
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const analyticsSession = this.activeAnalyticsSessions.get(client.id);
    if (analyticsSession) {
      this.activeAnalyticsSessions.delete(client.id);
      this.logger.log(`Analytics monitoring disconnection: ${analyticsSession.dashboards.length} dashboards`);
    }
  }
}
