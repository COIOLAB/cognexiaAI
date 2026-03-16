// Industry 5.0 ERP Backend - Cross-Module Integration Hub Controller
// Revolutionary seamless integration layer with event-driven architecture and automated decision making
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

import { CrossModuleIntegrationService } from '../services/cross-module-integration.service';
import { EventDrivenArchitectureService } from '../services/event-driven-architecture.service';
import { AutomatedDecisionMakingService } from '../services/automated-decision-making.service';
import { RealTimeDataFlowService } from '../services/real-time-data-flow.service';
import { IntelligentOrchestrationService } from '../services/intelligent-orchestration.service';
import { IntegrationHubGuard } from '../guards/integration-hub.guard';

// DTOs for Cross-Module Integration
export class IntegrationConfigurationDto {
  integrationName: string;
  sourceModules: string[];
  targetModules: string[];
  integrationType: 'REAL_TIME' | 'BATCH' | 'EVENT_DRIVEN' | 'API_FIRST' | 'HYBRID';
  dataFlowDirection: 'UNIDIRECTIONAL' | 'BIDIRECTIONAL' | 'MULTI_DIRECTIONAL';
  synchronizationLevel: 'LOOSE' | 'EVENTUAL' | 'STRONG' | 'IMMEDIATE';
  transformationRules: {
    dataMapping: Record<string, string>;
    businessLogic: string[];
    validationRules: string[];
    enrichmentRules: string[];
  };
  intelligentRouting: {
    enabled: boolean;
    routingLogic: 'ROUND_ROBIN' | 'LOAD_BASED' | 'PRIORITY' | 'AI_OPTIMIZED';
    failoverStrategy: 'RETRY' | 'CIRCUIT_BREAKER' | 'FALLBACK' | 'INTELLIGENT';
    adaptiveRouting: boolean;
  };
  qualityAssurance: {
    dataValidation: boolean;
    integrityChecks: boolean;
    performanceMonitoring: boolean;
    errorHandling: 'STRICT' | 'GRACEFUL' | 'ADAPTIVE';
  };
}

export class EventConfigurationDto {
  eventName: string;
  eventType: 'SYSTEM' | 'BUSINESS' | 'USER' | 'EXTERNAL' | 'COMPOSITE';
  triggerConditions: {
    sourceModule: string;
    conditions: Record<string, any>;
    aggregationRules?: string[];
    timeWindows?: string[];
  };
  eventProcessing: {
    processingType: 'IMMEDIATE' | 'BATCHED' | 'SCHEDULED' | 'CONDITIONAL';
    parallelProcessing: boolean;
    orderGuarantee: boolean;
    retryPolicy: Record<string, any>;
  };
  subscriberModules: {
    moduleId: string;
    subscriptionType: 'PUSH' | 'PULL' | 'HYBRID';
    filterRules?: string[];
    transformationRules?: string[];
    priority: number;
  }[];
  intelligentRouting: {
    contentBasedRouting: boolean;
    loadBalancing: boolean;
    adaptiveDistribution: boolean;
    failoverHandling: boolean;
  };
}

export class AutomatedDecisionDto {
  decisionName: string;
  decisionScope: 'MODULE' | 'CROSS_MODULE' | 'ENTERPRISE' | 'ECOSYSTEM';
  decisionLogic: {
    ruleEngine: 'SIMPLE' | 'COMPLEX' | 'ML_BASED' | 'AI_DRIVEN';
    decisionTrees: Record<string, any>[];
    mlModels?: string[];
    confidenceThreshold: number;
  };
  inputSources: {
    moduleId: string;
    dataPoints: string[];
    realTimeData: boolean;
    historicalData: boolean;
    externalData: boolean;
  }[];
  outputActions: {
    targetModule: string;
    actionType: 'CONFIGURATION' | 'COMMAND' | 'ALERT' | 'WORKFLOW' | 'NOTIFICATION';
    actionParameters: Record<string, any>;
    executionMode: 'IMMEDIATE' | 'SCHEDULED' | 'CONDITIONAL';
  }[];
  governance: {
    approvalRequired: boolean;
    auditTrail: boolean;
    rollbackCapability: boolean;
    impactAssessment: boolean;
  };
}

export class DataFlowOptimizationDto {
  flowName: string;
  optimizationObjective: 'LATENCY' | 'THROUGHPUT' | 'RELIABILITY' | 'COST' | 'BALANCED';
  currentPerformance: {
    latency: number;
    throughput: number;
    errorRate: number;
    resourceUtilization: number;
  };
  constraints: {
    maxLatency?: number;
    minThroughput?: number;
    maxErrorRate?: number;
    budgetLimits?: number;
  };
  optimizationStrategy: {
    cachingStrategy: 'AGGRESSIVE' | 'MODERATE' | 'CONSERVATIVE' | 'ADAPTIVE';
    compressionEnabled: boolean;
    batchingOptimization: boolean;
    pipeliningEnabled: boolean;
    loadBalancing: boolean;
  };
  aiOptimization: {
    enabled: boolean;
    learningFromPatterns: boolean;
    predictiveOptimization: boolean;
    autonomousAdjustment: boolean;
  };
}

export class OrchestrationWorkflowDto {
  workflowName: string;
  workflowType: 'SEQUENTIAL' | 'PARALLEL' | 'CONDITIONAL' | 'ADAPTIVE' | 'INTELLIGENT';
  triggerEvents: string[];
  workflowSteps: {
    stepId: string;
    moduleId: string;
    action: string;
    parameters: Record<string, any>;
    dependencies?: string[];
    timeouts?: number;
    retryPolicy?: Record<string, any>;
    rollbackAction?: string;
  }[];
  orchestrationLogic: {
    decisionPoints: Record<string, any>[];
    compensationActions: Record<string, any>[];
    errorHandling: Record<string, any>;
    performanceTargets: Record<string, number>;
  };
  intelligentFeatures: {
    adaptiveWorkflow: boolean;
    learningFromExecution: boolean;
    predictiveOptimization: boolean;
    autoHealing: boolean;
  };
}

@ApiTags('Cross-Module Integration Hub')
@Controller('integration-hub/cross-module')
@WebSocketGateway({
  cors: true,
  path: '/integration-socket',
  transports: ['websocket', 'polling']
})
@UseGuards(IntegrationHubGuard)
@ApiBearerAuth()
export class CrossModuleIntegrationController {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CrossModuleIntegrationController.name);
  private activeIntegrations = new Map<string, any>();

  constructor(
    private readonly integrationService: CrossModuleIntegrationService,
    private readonly eventService: EventDrivenArchitectureService,
    private readonly decisionService: AutomatedDecisionMakingService,
    private readonly dataFlowService: RealTimeDataFlowService,
    private readonly orchestrationService: IntelligentOrchestrationService,
  ) {}

  @Post('configure-integration')
  @ApiOperation({
    summary: 'Configure Cross-Module Integration',
    description: 'Set up seamless integration between manufacturing modules with intelligent data flow and transformation',
  })
  @ApiBody({ type: IntegrationConfigurationDto })
  @ApiResponse({
    status: 201,
    description: 'Integration configured successfully',
    schema: {
      example: {
        integrationId: 'INT_2024_001',
        configuration: {
          name: 'Production-Quality Integration',
          type: 'REAL_TIME',
          sourceModules: ['PRODUCTION_PLANNING', 'SHOP_FLOOR_CONTROL'],
          targetModules: ['QUALITY_CONTROL', 'MAINTENANCE'],
          status: 'ACTIVE',
          intelligentRouting: true
        },
        integrationCapabilities: {
          realTimeSync: true,
          dataTransformation: 'ADVANCED',
          errorHandling: 'ADAPTIVE',
          performanceOptimization: 'AI_DRIVEN',
          scalability: 'AUTO_SCALING',
          monitoring: 'COMPREHENSIVE'
        },
        dataFlowMetrics: {
          throughput: '10,000 events/second',
          averageLatency: '15ms',
          errorRate: 0.001,
          transformationAccuracy: 0.998,
          uptime: 0.9999
        },
        intelligentFeatures: {
          adaptiveRouting: {
            enabled: true,
            algorithm: 'ML_OPTIMIZED',
            learningRate: 0.95,
            adaptationSpeed: 'REAL_TIME'
          },
          predictiveScaling: {
            enabled: true,
            forecastAccuracy: 0.92,
            scalingEfficiency: 0.89,
            resourceOptimization: 'AUTONOMOUS'
          },
          selfHealing: {
            enabled: true,
            detectionTime: '2 seconds',
            recoveryTime: '5 seconds',
            preventionRate: 0.94
          }
        },
        businessImpact: {
          processEfficiency: '+15%',
          dataAccuracy: '+22%',
          responseTime: '-67%',
          operationalCost: '-18%',
          systemReliability: '+45%'
        }
      }
    }
  })
  async configureIntegration(@Body() configDto: IntegrationConfigurationDto) {
    try {
      this.logger.log(`Configuring cross-module integration: ${configDto.integrationName}`);
      
      // Set up intelligent integration
      const integration = await this.integrationService.createIntegration(configDto);
      
      // Configure real-time data flow
      const dataFlow = await this.dataFlowService.setupRealTimeFlow(integration);
      
      // Initialize event-driven architecture
      const eventSetup = await this.eventService.initializeEventDrivenIntegration(integration);
      
      // Setup monitoring and optimization
      await this.integrationService.setupMonitoring(integration);
      
      this.logger.log(`Integration configured successfully: ${integration.integrationId}`);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Cross-module integration configured successfully',
        data: {
          ...integration,
          dataFlow,
          eventSetup,
        },
      };
    } catch (error) {
      this.logger.error(`Integration configuration failed: ${error.message}`);
      throw new HttpException(
        'Integration configuration failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('configure-events')
  @ApiOperation({
    summary: 'Configure Event-Driven Architecture',
    description: 'Set up intelligent event-driven communication between modules with adaptive routing and processing',
  })
  @ApiBody({ type: EventConfigurationDto })
  @ApiResponse({
    status: 201,
    description: 'Event configuration created successfully',
    schema: {
      example: {
        eventConfigId: 'EVENT_2024_001',
        eventConfiguration: {
          name: 'Production Status Events',
          type: 'BUSINESS',
          processingType: 'IMMEDIATE',
          subscriberCount: 8,
          status: 'ACTIVE'
        },
        eventProcessingCapabilities: {
          throughput: '50,000 events/second',
          latency: 'sub-millisecond',
          reliability: 0.99999,
          ordering: 'GUARANTEED',
          filtering: 'INTELLIGENT',
          transformation: 'REAL_TIME'
        },
        intelligentRouting: {
          contentBasedRouting: {
            enabled: true,
            accuracy: 0.98,
            rules: 156,
            adaptiveRules: 23
          },
          loadBalancing: {
            strategy: 'AI_OPTIMIZED',
            efficiency: 0.94,
            autoScaling: true,
            predictiveLoadManagement: true
          },
          circuitBreaker: {
            enabled: true,
            thresholds: 'ADAPTIVE',
            recoveryTime: '30 seconds',
            fallbackStrategies: 3
          }
        },
        eventAnalytics: {
          realTimeMetrics: true,
          patternRecognition: true,
          anomalyDetection: true,
          performanceOptimization: 'CONTINUOUS',
          businessInsights: true
        }
      }
    }
  })
  async configureEvents(@Body() eventConfigDto: EventConfigurationDto) {
    try {
      this.logger.log(`Configuring event-driven architecture: ${eventConfigDto.eventName}`);
      
      const eventConfig = await this.eventService.configureEventProcessing(eventConfigDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Event-driven architecture configured successfully',
        data: eventConfig,
      };
    } catch (error) {
      this.logger.error(`Event configuration failed: ${error.message}`);
      throw new HttpException(
        'Event configuration failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('automated-decisions')
  @ApiOperation({
    summary: 'Configure Automated Decision Making',
    description: 'Set up intelligent automated decision making across modules with ML-driven logic and governance',
  })
  @ApiBody({ type: AutomatedDecisionDto })
  @ApiResponse({
    status: 201,
    description: 'Automated decision system configured successfully',
    schema: {
      example: {
        decisionSystemId: 'DECISION_2024_001',
        configuration: {
          name: 'Production Optimization Decisions',
          scope: 'CROSS_MODULE',
          ruleEngine: 'AI_DRIVEN',
          status: 'ACTIVE',
          confidenceThreshold: 0.9
        },
        decisionCapabilities: {
          realTimeDecisions: true,
          multiCriteriaOptimization: true,
          uncertaintyHandling: true,
          adaptiveLearning: true,
          explainableAI: true
        },
        performanceMetrics: {
          decisionAccuracy: 0.94,
          responseTime: '25ms',
          throughput: '1,000 decisions/second',
          businessValueCreated: '$125,000/month',
          errorRate: 0.006
        },
        intelligentFeatures: {
          contextualAwareness: {
            enabled: true,
            contextFactors: 45,
            adaptationRate: 0.89,
            predictiveContext: true
          },
          continuousLearning: {
            enabled: true,
            learningAlgorithm: 'REINFORCEMENT_LEARNING',
            modelUpdateFrequency: 'REAL_TIME',
            performanceImprovement: '+12% monthly'
          },
          explainability: {
            decisionReasoning: true,
            confidenceScoring: true,
            alternativeAnalysis: true,
            riskAssessment: true
          }
        },
        governance: {
          auditTrail: 'COMPREHENSIVE',
          approvalWorkflow: 'RISK_BASED',
          rollbackCapability: true,
          complianceChecking: 'AUTOMATED'
        }
      }
    }
  })
  async configureAutomatedDecisions(@Body() decisionDto: AutomatedDecisionDto) {
    try {
      this.logger.log(`Configuring automated decision making: ${decisionDto.decisionName}`);
      
      const decisionSystem = await this.decisionService.configureAutomatedDecisions(decisionDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Automated decision system configured successfully',
        data: decisionSystem,
      };
    } catch (error) {
      this.logger.error(`Decision system configuration failed: ${error.message}`);
      throw new HttpException(
        'Automated decision configuration failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('optimize-dataflow')
  @ApiOperation({
    summary: 'Optimize Data Flow Performance',
    description: 'AI-driven optimization of data flows between modules for maximum performance and efficiency',
  })
  @ApiBody({ type: DataFlowOptimizationDto })
  @ApiResponse({
    status: 200,
    description: 'Data flow optimization completed successfully',
    schema: {
      example: {
        optimizationId: 'OPT_2024_001',
        optimizationResults: {
          flowName: 'Production-Quality Data Flow',
          objective: 'BALANCED',
          optimizationTime: '45 seconds',
          improvementAchieved: true
        },
        performanceImprovements: {
          latencyReduction: '-34%',
          throughputIncrease: '+67%',
          errorRateReduction: '-89%',
          resourceUtilizationOptimization: '+23%',
          costSavings: '$45,000/month'
        },
        optimizationStrategies: {
          caching: {
            strategy: 'INTELLIGENT_PREDICTIVE',
            hitRate: 0.94,
            memoryOptimization: '+45%',
            responseTime: '-78%'
          },
          compression: {
            algorithm: 'ADAPTIVE_ML',
            compressionRatio: 0.73,
            cpuOverhead: '+2%',
            networkSavings: '-68%'
          },
          batching: {
            batchSizeOptimization: 'DYNAMIC',
            throughputImprovement: '+56%',
            latencyImpact: '+3%',
            resourceEfficiency: '+34%'
          },
          loadBalancing: {
            algorithm: 'AI_PREDICTIVE',
            distributionEfficiency: 0.97,
            hotspotElimination: true,
            autoScaling: 'INTELLIGENT'
          }
        },
        aiOptimizationInsights: {
          patternLearning: {
            trafficPatterns: 23,
            usagePatterns: 45,
            performancePatterns: 17,
            predictionAccuracy: 0.91
          },
          adaptiveOptimization: {
            realTimeAdjustments: 156,
            proactiveOptimizations: 67,
            preventedIssues: 23,
            autonomousImprovements: 89
          }
        }
      }
    }
  })
  async optimizeDataFlow(@Body() optimizationDto: DataFlowOptimizationDto) {
    try {
      this.logger.log(`Optimizing data flow: ${optimizationDto.flowName}`);
      
      const optimization = await this.dataFlowService.optimizeDataFlow(optimizationDto);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Data flow optimization completed successfully',
        data: optimization,
      };
    } catch (error) {
      this.logger.error(`Data flow optimization failed: ${error.message}`);
      throw new HttpException(
        'Data flow optimization failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('orchestration-workflow')
  @ApiOperation({
    summary: 'Create Intelligent Orchestration Workflow',
    description: 'Design and deploy intelligent workflow orchestration across multiple modules with adaptive execution',
  })
  @ApiBody({ type: OrchestrationWorkflowDto })
  @ApiResponse({
    status: 201,
    description: 'Orchestration workflow created successfully',
    schema: {
      example: {
        workflowId: 'WORKFLOW_2024_001',
        workflowConfiguration: {
          name: 'Quality Issue Resolution Workflow',
          type: 'ADAPTIVE',
          stepCount: 12,
          estimatedDuration: '15 minutes',
          status: 'ACTIVE'
        },
        orchestrationCapabilities: {
          intelligentExecution: true,
          adaptiveLogic: true,
          selfHealing: true,
          performanceOptimization: true,
          errorRecovery: 'AUTOMATIC',
          scalability: 'ELASTIC'
        },
        workflowMetrics: {
          executionSuccess: 0.97,
          averageExecutionTime: '12.3 minutes',
          errorRate: 0.03,
          compensationRate: 0.01,
          businessValueDelivered: '$67,000/month'
        },
        intelligentFeatures: {
          adaptiveWorkflow: {
            enabled: true,
            adaptationTriggers: 15,
            optimizationRate: 0.89,
            learningEffectiveness: 0.92
          },
          predictiveExecution: {
            enabled: true,
            bottleneckPrediction: 0.87,
            resourcePreparation: true,
            failurePrevention: 0.94
          },
          autonomousOptimization: {
            enabled: true,
            performanceImprovements: 45,
            resourceOptimizations: 23,
            pathOptimizations: 67
          }
        },
        businessImpact: {
          processEfficiency: '+28%',
          errorReduction: '-67%',
          timeToResolution: '-45%',
          resourceUtilization: '+34%',
          customerSatisfaction: '+23%'
        }
      }
    }
  })
  async createOrchestrationWorkflow(@Body() workflowDto: OrchestrationWorkflowDto) {
    try {
      this.logger.log(`Creating orchestration workflow: ${workflowDto.workflowName}`);
      
      const workflow = await this.orchestrationService.createIntelligentWorkflow(workflowDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Orchestration workflow created successfully',
        data: workflow,
      };
    } catch (error) {
      this.logger.error(`Workflow creation failed: ${error.message}`);
      throw new HttpException(
        'Orchestration workflow creation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('integration-dashboard')
  @ApiOperation({
    summary: 'Get Integration Hub Dashboard',
    description: 'Comprehensive dashboard showing all integration metrics, health, and performance analytics',
  })
  @ApiQuery({ name: 'timeRange', required: false, description: 'Time range for metrics' })
  @ApiQuery({ name: 'moduleFilter', required: false, description: 'Filter by specific modules' })
  @ApiResponse({
    status: 200,
    description: 'Integration dashboard data retrieved successfully',
    schema: {
      example: {
        dashboardData: {
          overallHealth: {
            systemHealth: 0.98,
            integrationHealth: 0.96,
            dataFlowHealth: 0.97,
            eventProcessingHealth: 0.99,
            decisionSystemHealth: 0.95
          },
          realTimeMetrics: {
            totalIntegrations: 45,
            activeDataFlows: 234,
            eventsPerSecond: 12500,
            decisionsPerMinute: 450,
            averageLatency: '18ms'
          },
          performanceInsights: {
            topPerformingIntegrations: [
              { name: 'Production-Quality', performance: 0.98, efficiency: '+23%' },
              { name: 'Maintenance-Planning', performance: 0.96, efficiency: '+18%' }
            ],
            optimizationOpportunities: [
              { area: 'Data transformation', potential: '+15% throughput' },
              { area: 'Event routing', potential: '-20% latency' }
            ]
          },
          intelligentFeatures: {
            adaptiveOptimizations: 156,
            predictiveActions: 67,
            autonomousAdjustments: 234,
            learningImprovements: 89
          },
          businessImpact: {
            operationalEfficiency: '+34%',
            dataAccuracy: '+45%',
            responseTime: '-67%',
            costSavings: '$234,000/month',
            systemReliability: '+56%'
          }
        }
      }
    }
  })
  async getIntegrationDashboard(
    @Query('timeRange') timeRange?: string,
    @Query('moduleFilter') moduleFilter?: string,
  ) {
    try {
      this.logger.log('Generating integration hub dashboard');
      
      const dashboard = await this.integrationService.generateIntegrationDashboard({
        timeRange,
        moduleFilter,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Integration dashboard generated successfully',
        data: dashboard,
      };
    } catch (error) {
      this.logger.error(`Dashboard generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate integration dashboard',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('system-status')
  @ApiOperation({
    summary: 'Integration Hub System Status',
    description: 'Comprehensive status of all integration hub components and capabilities',
  })
  @ApiResponse({
    status: 200,
    description: 'System status retrieved successfully'
  })
  async getSystemStatus() {
    try {
      const status = await this.integrationService.getSystemStatus();
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Integration hub system status retrieved',
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

  // WebSocket handlers for real-time integration monitoring
  @SubscribeMessage('subscribe-integration-events')
  handleIntegrationSubscription(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const { integrationIds, eventTypes } = data;
    
    integrationIds.forEach(id => client.join(`integration_${id}`));
    eventTypes.forEach(type => client.join(`events_${type}`));
    
    this.activeIntegrations.set(client.id, { integrationIds, eventTypes });
    
    client.emit('subscription-confirmed', {
      integrationIds,
      eventTypes,
      realTimeUpdates: true,
      timestamp: new Date().toISOString()
    });
    
    this.logger.log(`Integration monitoring subscription for: ${integrationIds.join(', ')}`);
  }

  @SubscribeMessage('integration-health-check')
  async handleHealthCheck(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const healthStatus = await this.integrationService.performHealthCheck(data.integrationId);
      
      client.emit('health-check-result', {
        integrationId: data.integrationId,
        health: healthStatus,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      client.emit('error', { message: 'Health check failed' });
    }
  }

  @SubscribeMessage('trigger-workflow')
  async handleWorkflowTrigger(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const execution = await this.orchestrationService.triggerWorkflow(data);
      
      client.emit('workflow-triggered', {
        workflowId: data.workflowId,
        executionId: execution.executionId,
        status: execution.status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Workflow trigger failed: ${error.message}`);
      client.emit('error', { message: 'Workflow trigger failed' });
    }
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const integrationInfo = this.activeIntegrations.get(client.id);
    if (integrationInfo) {
      this.activeIntegrations.delete(client.id);
      this.logger.log(`Integration monitoring disconnection`);
    }
  }
}
