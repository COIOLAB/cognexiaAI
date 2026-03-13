// Industry 5.0 ERP Backend - Real-Time Adaptive Analytics Dashboard Controller
// Revolutionary intelligent dashboards with predictive insights and self-configuring analytics
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
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
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
import { Server, Socket } from 'socket.io';

import { AdaptiveAnalyticsService } from '../services/adaptive-analytics.service';
import { PredictiveInsightsService } from '../services/predictive-insights.service';
import { CrossModuleCorrelationService } from '../services/cross-module-correlation.service';
import { SelfConfiguringKPIService } from '../services/self-configuring-kpi.service';
import { RealTimeAlertService } from '../services/real-time-alert.service';
import { AdaptiveAnalyticsGuard } from '../guards/adaptive-analytics.guard';

// DTOs for Adaptive Analytics Dashboard
export class DashboardConfigurationDto {
  dashboardName: string;
  targetAudience: 'OPERATOR' | 'SUPERVISOR' | 'MANAGER' | 'EXECUTIVE' | 'ANALYST';
  adaptiveLevel: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'AI_DRIVEN';
  analyticsScope: {
    modules: string[];
    timeRange: 'REAL_TIME' | 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
    metrics: string[];
    dimensions: string[];
  };
  selfConfiguration: {
    autoKPIGeneration: boolean;
    adaptiveThresholds: boolean;
    contextualFiltering: boolean;
    predictiveInsights: boolean;
    anomalyDetection: boolean;
  };
  visualization: {
    preferredCharts: string[];
    interactiveElements: boolean;
    realTimeUpdates: boolean;
    drillDownCapabilities: boolean;
    customization: 'USER_DRIVEN' | 'AI_OPTIMIZED' | 'HYBRID';
  };
  alertConfiguration: {
    criticalThresholds: Record<string, number>;
    warningThresholds: Record<string, number>;
    notificationChannels: string[];
    escalationRules: Record<string, any>;
  };
}

export class PredictiveAnalysisRequestDto {
  analysisType: 'TREND_PREDICTION' | 'ANOMALY_FORECAST' | 'PERFORMANCE_PROJECTION' | 'RISK_ASSESSMENT';
  timeHorizon: 'NEXT_HOUR' | 'NEXT_DAY' | 'NEXT_WEEK' | 'NEXT_MONTH' | 'NEXT_QUARTER';
  confidenceLevel: number; // 0-1
  dataPoints: {
    modules: string[];
    metrics: string[];
    historicalPeriod: string;
    samplingRate: 'REAL_TIME' | 'MINUTE' | 'HOUR' | 'DAY';
  };
  contextualFactors: {
    seasonality: boolean;
    externalEvents: string[];
    businessCycles: boolean;
    marketConditions?: Record<string, any>;
  };
  advancedOptions: {
    mlModelSelection: 'AUTO' | 'ENSEMBLE' | 'DEEP_LEARNING' | 'QUANTUM_ML';
    featureEngineering: boolean;
    crossCorrelationAnalysis: boolean;
    realTimeAdaptation: boolean;
  };
}

export class CrossModuleCorrelationDto {
  primaryModule: string;
  correlationModules: string[];
  correlationTypes: ('CAUSAL' | 'STATISTICAL' | 'TEMPORAL' | 'BEHAVIORAL')[];
  analysisDepth: 'SURFACE' | 'DETAILED' | 'COMPREHENSIVE' | 'EXHAUSTIVE';
  significanceThreshold: number;
  timelagsToAnalyze: number[];
  outputFormat: {
    visualCorrelationMatrix: boolean;
    detailedReport: boolean;
    actionableInsights: boolean;
    predictiveModels: boolean;
  };
}

export class SmartAlertConfigDto {
  alertName: string;
  triggerConditions: {
    metricThresholds: Record<string, any>;
    patternDetection: string[];
    anomalyTypes: string[];
    crossModuleEvents: string[];
  };
  intelligentFiltering: {
    duplicateSupression: boolean;
    contextualRelevance: boolean;
    businessImpactWeighting: boolean;
    adaptiveThresholds: boolean;
  };
  escalationPolicy: {
    levels: {
      level: number;
      timeThreshold: string;
      recipients: string[];
      actions: string[];
    }[];
    autoResolution: boolean;
    learningFromFeedback: boolean;
  };
  responseAutomation: {
    automaticActions: string[];
    workflowTriggering: boolean;
    correctiveActionSuggestions: boolean;
    preventiveMeasures: boolean;
  };
}

export class AnalyticsPersonalizationDto {
  userId: string;
  roleProfile: {
    primaryRole: string;
    responsibilities: string[];
    decisionScope: string;
    analyticsExperience: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  };
  preferences: {
    visualizationStyle: string;
    updateFrequency: string;
    informationDensity: 'MINIMAL' | 'MODERATE' | 'DETAILED' | 'COMPREHENSIVE';
    interactionMode: 'PASSIVE' | 'INTERACTIVE' | 'CONVERSATIONAL';
  };
  contextualAdaptation: {
    workingHours: string;
    criticalPeriods: string[];
    focusAreas: string[];
    alertSensitivity: number;
  };
}

@ApiTags('Adaptive Analytics Dashboard')
@Controller('adaptive-analytics/dashboard')
@WebSocketGateway({
  cors: true,
  path: '/analytics-socket',
  transports: ['websocket', 'polling']
})
@UseGuards(AdaptiveAnalyticsGuard)
@ApiBearerAuth()
export class AdaptiveAnalyticsDashboardController {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AdaptiveAnalyticsDashboardController.name);
  private activeDashboards = new Map<string, any>();

  constructor(
    private readonly analyticsService: AdaptiveAnalyticsService,
    private readonly predictiveService: PredictiveInsightsService,
    private readonly correlationService: CrossModuleCorrelationService,
    private readonly kpiService: SelfConfiguringKPIService,
    private readonly alertService: RealTimeAlertService,
  ) {}

  @Post('configure')
  @ApiOperation({
    summary: 'Configure Adaptive Analytics Dashboard',
    description: 'Create and configure intelligent dashboard with self-adapting analytics and predictive insights',
  })
  @ApiBody({ type: DashboardConfigurationDto })
  @ApiResponse({
    status: 201,
    description: 'Dashboard configured successfully',
    schema: {
      example: {
        dashboardId: 'DASH_2024_001',
        configuration: {
          name: 'Executive Manufacturing Overview',
          adaptiveLevel: 'AI_DRIVEN',
          targetAudience: 'EXECUTIVE',
          autoConfigured: true,
          realTimeCapabilities: true
        },
        generatedComponents: {
          kpis: [
            {
              id: 'OEE_TRENDING',
              name: 'Overall Equipment Effectiveness',
              type: 'TRENDING_METRIC',
              currentValue: 0.847,
              trend: 'IMPROVING',
              prediction: { next7Days: 0.862, confidence: 0.91 },
              alertThresholds: { critical: 0.7, warning: 0.8 },
              selfAdapting: true
            },
            {
              id: 'QUALITY_SCORE',
              name: 'Manufacturing Quality Score',
              type: 'COMPOSITE_METRIC',
              currentValue: 0.943,
              components: ['defectRate', 'customerSatisfaction', 'reworkCost'],
              benchmark: 0.95,
              improvementOpportunities: ['reduce surface defects', 'optimize inspection frequency']
            }
          ],
          visualizations: [
            {
              id: 'PRODUCTION_FLOW',
              type: 'SANKEY_DIAGRAM',
              title: 'Real-Time Production Flow',
              dataSource: 'CROSS_MODULE_INTEGRATION',
              interactivity: 'DRILL_DOWN',
              updateFrequency: 'REAL_TIME'
            },
            {
              id: 'PREDICTIVE_MAINTENANCE',
              type: 'HEATMAP_TIMELINE',
              title: 'Predictive Maintenance Timeline',
              prediction: 'NEXT_30_DAYS',
              riskLevels: true,
              actionableInsights: true
            }
          ],
          intelligentAlerts: {
            active: 12,
            suppressed: 3,
            learningEffectiveness: 0.89,
            falsePositiveReduction: 0.76
          }
        },
        aiCapabilities: {
          predictiveInsights: true,
          anomalyDetection: true,
          patternRecognition: true,
          selfOptimization: true,
          naturalLanguageQueries: true,
          contextualRecommendations: true
        },
        adaptiveBehavior: {
          userInteractionLearning: true,
          performanceOptimization: true,
          contentPersonalization: true,
          proactiveInsights: true,
          continuousImprovement: true
        }
      }
    }
  })
  async configureDashboard(@Body() configDto: DashboardConfigurationDto) {
    try {
      this.logger.log(`Configuring adaptive dashboard: ${configDto.dashboardName}`);
      
      // AI-driven dashboard configuration
      const configuration = await this.analyticsService.createAdaptiveDashboard(configDto);
      
      // Generate self-configuring KPIs
      const kpis = await this.kpiService.generateSelfConfiguringKPIs(configuration);
      
      // Setup predictive analytics
      const predictiveSetup = await this.predictiveService.setupPredictiveAnalytics(configuration);
      
      // Configure intelligent alerts
      const alertSetup = await this.alertService.configureIntelligentAlerts(configuration);
      
      // Initialize real-time data streams
      await this.analyticsService.initializeRealTimeStreams(configuration);
      
      this.logger.log(`Dashboard configured successfully: ${configuration.dashboardId}`);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Adaptive dashboard configured successfully',
        data: {
          ...configuration,
          generatedKPIs: kpis,
          predictiveSetup,
          alertSetup,
        },
      };
    } catch (error) {
      this.logger.error(`Dashboard configuration failed: ${error.message}`);
      throw new HttpException(
        'Dashboard configuration failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('predictive-analysis')
  @ApiOperation({
    summary: 'Generate Predictive Analytics',
    description: 'Advanced predictive analysis with trend forecasting, anomaly prediction, and risk assessment',
  })
  @ApiBody({ type: PredictiveAnalysisRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Predictive analysis completed successfully',
    schema: {
      example: {
        analysisId: 'PRED_ANALYTICS_2024_001',
        analysisResults: {
          analysisType: 'PERFORMANCE_PROJECTION',
          timeHorizon: 'NEXT_WEEK',
          confidenceLevel: 0.93,
          generationTime: '3.2 seconds',
          dataQuality: 0.96
        },
        predictions: {
          overallEfficiency: {
            current: 0.847,
            predicted: 0.862,
            trend: 'IMPROVING',
            confidence: 0.91,
            keyDrivers: ['Equipment optimization', 'Process standardization'],
            riskFactors: ['Planned maintenance on Line 3', 'Material delivery delay risk']
          },
          qualityMetrics: {
            defectRate: {
              current: 0.023,
              predicted: 0.019,
              improvement: 0.004,
              confidence: 0.87,
              contributingFactors: ['Enhanced vision inspection', 'Operator training']
            },
            customerSatisfaction: {
              current: 4.7,
              predicted: 4.8,
              confidence: 0.82,
              impactFactors: ['Reduced delivery times', 'Quality improvements']
            }
          },
          operationalRisks: [
            {
              risk: 'Equipment failure - Machine A',
              probability: 0.15,
              impact: 'HIGH',
              timeframe: '72 hours',
              preventiveActions: ['Schedule immediate inspection', 'Prepare backup equipment'],
              costImplication: 45000
            },
            {
              risk: 'Supply chain disruption',
              probability: 0.08,
              impact: 'MEDIUM',
              timeframe: '5 days',
              mitigationStrategy: 'Increase safety stock for critical components'
            }
          ]
        },
        trendAnalysis: {
          identifiedPatterns: [
            {
              pattern: 'CYCLIC_PERFORMANCE_VARIATION',
              frequency: '7 days',
              amplitude: 0.05,
              phase: 'Monday morning dips',
              confidence: 0.94
            },
            {
              pattern: 'SEASONAL_QUALITY_TREND',
              seasonality: 'QUARTERLY',
              correlation: 'Temperature and humidity',
              predictability: 0.87
            }
          ],
          anomalyForecasts: [
            {
              type: 'PROCESS_DEVIATION',
              expectedTime: '2024-03-05T14:30:00Z',
              probability: 0.23,
              severity: 'MEDIUM',
              recommendation: 'Monitor process parameters closely'
            }
          ]
        },
        actionableInsights: {
          immediateActions: [
            'Adjust process parameters on Line 2 to optimize efficiency',
            'Schedule preventive maintenance for high-risk equipment'
          ],
          strategicRecommendations: [
            'Invest in advanced process control for consistent quality',
            'Implement predictive maintenance across all critical equipment'
          ],
          optimizationOpportunities: [
            'Cross-train operators to reduce single points of failure',
            'Optimize production scheduling based on demand patterns'
          ]
        }
      }
    }
  })
  async generatePredictiveAnalysis(@Body() analysisDto: PredictiveAnalysisRequestDto) {
    try {
      this.logger.log(`Generating predictive analysis: ${analysisDto.analysisType}`);
      
      const analysis = await this.predictiveService.generatePredictiveAnalysis(analysisDto);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Predictive analysis completed successfully',
        data: analysis,
      };
    } catch (error) {
      this.logger.error(`Predictive analysis failed: ${error.message}`);
      throw new HttpException(
        'Predictive analysis generation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('cross-module-correlation')
  @ApiOperation({
    summary: 'Analyze Cross-Module Correlations',
    description: 'Advanced correlation analysis across manufacturing modules with causal relationship discovery',
  })
  @ApiBody({ type: CrossModuleCorrelationDto })
  @ApiResponse({
    status: 200,
    description: 'Cross-module correlation analysis completed successfully',
    schema: {
      example: {
        correlationId: 'CORR_2024_001',
        analysisResults: {
          primaryModule: 'PRODUCTION_PLANNING',
          correlationsFound: 23,
          significantCorrelations: 8,
          causalRelationships: 3,
          analysisDepth: 'COMPREHENSIVE',
          computationTime: '4.7 seconds'
        },
        correlationMatrix: {
          strongCorrelations: [
            {
              modules: ['PRODUCTION_PLANNING', 'MAINTENANCE'],
              metrics: ['schedule_adherence', 'equipment_availability'],
              correlationCoefficient: 0.84,
              significance: 0.001,
              relationshipType: 'BIDIRECTIONAL',
              lagTime: '2 hours',
              businessImpact: 'HIGH'
            },
            {
              modules: ['QUALITY_CONTROL', 'SHOP_FLOOR_CONTROL'],
              metrics: ['defect_rate', 'process_stability'],
              correlationCoefficient: -0.79,
              significance: 0.002,
              relationshipType: 'INVERSE',
              lagTime: '15 minutes',
              businessImpact: 'CRITICAL'
            }
          ],
          moderateCorrelations: [
            {
              modules: ['MAINTENANCE', 'QUALITY_CONTROL'],
              metrics: ['maintenance_frequency', 'quality_score'],
              correlationCoefficient: 0.67,
              significance: 0.01,
              seasonality: 'MONTHLY',
              businessImpact: 'MEDIUM'
            }
          ]
        },
        causalAnalysis: {
          identifiedCausalChains: [
            {
              chain: 'MAINTENANCE_DELAY → EQUIPMENT_DEGRADATION → QUALITY_DECLINE → CUSTOMER_IMPACT',
              strength: 0.78,
              timeDelay: '24-48 hours',
              interventionPoints: ['Preventive scheduling', 'Quality monitoring', 'Customer communication'],
              businessCost: 125000
            }
          ],
          rootCauseFactors: [
            {
              factor: 'Equipment calibration drift',
              impact: 'MULTI_MODULE',
              affectedModules: ['PRODUCTION', 'QUALITY', 'MAINTENANCE'],
              detectionMethods: ['Statistical process control', 'Vibration analysis'],
              preventionStrategies: ['Automated calibration', 'Predictive maintenance']
            }
          ]
        },
        actionableInsights: {
          optimizationOpportunities: [
            'Synchronize maintenance schedules with production planning to minimize disruption',
            'Implement real-time quality feedback to shop floor control systems'
          ],
          riskMitigation: [
            'Early warning system for quality degradation based on maintenance indicators',
            'Automated process adjustments based on equipment health scores'
          ],
          processImprovements: [
            'Cross-functional KPI dashboard highlighting correlated metrics',
            'Integrated decision support system for coordinated actions'
          ]
        }
      }
    }
  })
  async analyzeCrossModuleCorrelations(@Body() correlationDto: CrossModuleCorrelationDto) {
    try {
      this.logger.log(`Analyzing cross-module correlations: ${correlationDto.primaryModule}`);
      
      const correlationAnalysis = await this.correlationService.performCorrelationAnalysis(correlationDto);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Cross-module correlation analysis completed',
        data: correlationAnalysis,
      };
    } catch (error) {
      this.logger.error(`Correlation analysis failed: ${error.message}`);
      throw new HttpException(
        'Cross-module correlation analysis failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('smart-alerts')
  @ApiOperation({
    summary: 'Configure Smart Alert System',
    description: 'Intelligent alert system with adaptive thresholds, context awareness, and automated response',
  })
  @ApiBody({ type: SmartAlertConfigDto })
  @ApiResponse({
    status: 201,
    description: 'Smart alert system configured successfully',
    schema: {
      example: {
        alertConfigId: 'ALERT_CONFIG_2024_001',
        configuration: {
          alertName: 'Production Efficiency Alert',
          active: true,
          intelligenceLevel: 'ADVANCED',
          adaptiveThresholds: true,
          learningEnabled: true
        },
        alertCapabilities: {
          contextualFiltering: {
            enabled: true,
            falsePositiveReduction: 0.78,
            businessContextAware: true,
            seasonalityAdjustment: true
          },
          predictiveAlerting: {
            enabled: true,
            forecastHorizon: '2 hours',
            accuracy: 0.91,
            earlyWarningTime: '45 minutes'
          },
          smartEscalation: {
            levels: 3,
            timeBasedEscalation: true,
            contextBasedRouting: true,
            autoResolution: true
          },
          responseAutomation: {
            immediateActions: ['Process adjustment', 'Operator notification'],
            workflowTriggers: ['Maintenance request', 'Quality inspection'],
            learningFromOutcomes: true
          }
        },
        mlModels: {
          anomalyDetection: {
            model: 'ENSEMBLE_ISOLATION_FOREST',
            accuracy: 0.94,
            falsePositiveRate: 0.02,
            adaptationRate: 'CONTINUOUS'
          },
          thresholdOptimization: {
            model: 'ADAPTIVE_THRESHOLD_ML',
            responsiveness: 0.87,
            stability: 0.92,
            businessImpactWeighting: true
          }
        },
        integrationPoints: [
          'PRODUCTION_PLANNING',
          'SHOP_FLOOR_CONTROL',
          'MAINTENANCE',
          'QUALITY_CONTROL',
          'PROBLEM_RESOLUTION'
        ]
      }
    }
  })
  async configureSmartAlerts(@Body() alertConfigDto: SmartAlertConfigDto) {
    try {
      this.logger.log(`Configuring smart alert system: ${alertConfigDto.alertName}`);
      
      const alertConfig = await this.alertService.configureSmartAlerts(alertConfigDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Smart alert system configured successfully',
        data: alertConfig,
      };
    } catch (error) {
      this.logger.error(`Smart alert configuration failed: ${error.message}`);
      throw new HttpException(
        'Smart alert configuration failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('dashboard/:dashboardId')
  @ApiOperation({
    summary: 'Get Real-Time Dashboard Data',
    description: 'Retrieve real-time adaptive dashboard with personalized insights and predictive analytics',
  })
  @ApiParam({ name: 'dashboardId', description: 'Dashboard ID' })
  @ApiQuery({ name: 'personalize', required: false, description: 'Apply personalization settings' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully'
  })
  async getDashboardData(
    @Param('dashboardId') dashboardId: string,
    @Query('personalize') personalize?: boolean,
  ) {
    try {
      this.logger.log(`Retrieving dashboard data: ${dashboardId}`);
      
      const dashboardData = await this.analyticsService.getRealTimeDashboardData(
        dashboardId,
        { personalize }
      );
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Dashboard data retrieved successfully',
        data: dashboardData,
      };
    } catch (error) {
      this.logger.error(`Dashboard data retrieval failed: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve dashboard data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('system-status')
  @ApiOperation({
    summary: 'Analytics System Status',
    description: 'Comprehensive status of adaptive analytics and dashboard systems',
  })
  @ApiResponse({
    status: 200,
    description: 'System status retrieved successfully'
  })
  async getSystemStatus() {
    try {
      const status = await this.analyticsService.getSystemStatus();
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Analytics system status retrieved',
        data: status,
      };
    } catch (error) {
      this.logger.error(`System status retrieval failed: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve system status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // WebSocket handlers for real-time dashboard updates
  @SubscribeMessage('subscribe-dashboard')
  handleDashboardSubscription(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const { dashboardId, userId } = data;
    client.join(`dashboard_${dashboardId}`);
    this.activeDashboards.set(client.id, { dashboardId, userId });
    
    client.emit('subscription-confirmed', {
      dashboardId,
      realTimeUpdates: true,
      updateFrequency: '1 second',
      timestamp: new Date().toISOString()
    });
    
    this.logger.log(`Dashboard subscription: ${dashboardId} for user: ${userId}`);
  }

  @SubscribeMessage('dashboard-interaction')
  async handleDashboardInteraction(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const dashboardInfo = this.activeDashboards.get(client.id);
      if (!dashboardInfo) return;

      // Learn from user interaction
      await this.analyticsService.processUserInteraction({
        ...data,
        dashboardId: dashboardInfo.dashboardId,
        userId: dashboardInfo.userId,
        timestamp: new Date().toISOString()
      });

      // Send personalized insights based on interaction
      const insights = await this.analyticsService.generateContextualInsights(data);
      
      client.emit('contextual-insights', {
        insights,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Dashboard interaction processing failed: ${error.message}`);
    }
  }

  @SubscribeMessage('request-prediction')
  async handlePredictionRequest(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const prediction = await this.predictiveService.generateRealTimePrediction(data);
      
      client.emit('prediction-result', {
        prediction,
        requestId: data.requestId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time prediction failed: ${error.message}`);
      client.emit('error', { message: 'Prediction generation failed' });
    }
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const dashboardInfo = this.activeDashboards.get(client.id);
    if (dashboardInfo) {
      this.activeDashboards.delete(client.id);
      this.logger.log(`Dashboard disconnection: ${dashboardInfo.dashboardId}`);
    }
  }
}
