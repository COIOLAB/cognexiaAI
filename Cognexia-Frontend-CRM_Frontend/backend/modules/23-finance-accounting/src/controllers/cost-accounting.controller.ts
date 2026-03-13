// Industry 5.0 ERP Backend - Revolutionary Cost Accounting & Profitability Analysis Controller
// AI-powered costing methods, quantum optimization, variance analysis, and performance metrics
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

import { CostAccountingService } from '../services/cost-accounting.service';
import { ProfitabilityAnalysisService } from '../services/profitability-analysis.service';
import { VarianceAnalysisService } from '../services/variance-analysis.service';
import { ActivityBasedCostingService } from '../services/activity-based-costing.service';
import { PerformanceMetricsService } from '../services/performance-metrics.service';
import { FinanceGuard } from '../guards/finance.guard';

// DTOs for Cost Accounting
export class CostCenterDto {
  costCenterId?: string;
  costCenterCode: string;
  costCenterName: string;
  costCenterType: 'PRODUCTION' | 'SERVICE' | 'ADMINISTRATIVE' | 'SALES' | 'DISTRIBUTION' | 'SUPPORT';
  parentCostCenter?: string;
  responsibleManager: string;
  department: string;
  location: string;
  budgetAllocation: {
    annualBudget: number;
    currency: string;
    budgetBreakdown: {
      materialCosts: number;
      laborCosts: number;
      overheadCosts: number;
      variableCosts: number;
      fixedCosts: number;
    };
  };
  costDrivers: {
    primaryDriver: string;
    secondaryDrivers?: string[];
    allocationBasis: 'DIRECT_LABOR_HOURS' | 'MACHINE_HOURS' | 'UNITS_PRODUCED' | 'REVENUE' | 'FLOOR_SPACE' | 'HEADCOUNT' | 'CUSTOM';
    customAllocationFormula?: string;
  };
  kpiTargets: {
    costPerUnit: number;
    efficiency: number;
    utilization: number;
    qualityScore: number;
    customKPIs?: { name: string; target: number; unit: string }[];
  };
  aiOptimization: {
    enablePredictiveCostModeling: boolean;
    enableAutomaticVarianceAnalysis: boolean;
    enableCostOptimizationSuggestions: boolean;
    enableBenchmarking: boolean;
  };
}

export class CostCalculationDto {
  calculationId?: string;
  calculationMethod: 'STANDARD_COSTING' | 'ACTUAL_COSTING' | 'ACTIVITY_BASED' | 'TARGET_COSTING' | 'LEAN_COSTING' | 'QUANTUM_OPTIMIZED';
  productId?: string;
  serviceId?: string;
  projectId?: string;
  calculationPeriod: {
    startDate: string;
    endDate: string;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  };
  costComponents: {
    directMaterials: {
      materials: {
        materialId: string;
        materialName: string;
        quantity: number;
        unitCost: number;
        totalCost: number;
        costVariance?: number;
      }[];
      totalDirectMaterials: number;
    };
    directLabor: {
      laborCategories: {
        skillLevel: string;
        hours: number;
        hourlyRate: number;
        totalCost: number;
        efficiency?: number;
      }[];
      totalDirectLabor: number;
    };
    manufacturingOverhead: {
      variableOverhead: {
        utilities: number;
        maintenance: number;
        supplies: number;
        other: number;
        total: number;
      };
      fixedOverhead: {
        depreciation: number;
        insurance: number;
        rent: number;
        supervision: number;
        other: number;
        total: number;
      };
      totalOverhead: number;
      overheadRate: number;
    };
  };
  allocationMethods: {
    overheadAllocation: 'DIRECT_LABOR_HOURS' | 'MACHINE_HOURS' | 'ACTIVITY_BASED' | 'QUANTUM_OPTIMIZED';
    serviceAllocation: 'STEP_DOWN' | 'DIRECT' | 'RECIPROCAL' | 'AI_OPTIMIZED';
    jointCostAllocation?: 'PHYSICAL_UNITS' | 'SALES_VALUE' | 'NET_REALIZABLE_VALUE' | 'CONSTANT_RATIO';
  };
  quantumOptimization?: {
    enabled: boolean;
    optimizationCriteria: ('MINIMIZE_COST' | 'MAXIMIZE_QUALITY' | 'OPTIMIZE_TIME' | 'BALANCE_ALL')[];
    scenarios: number;
    constraints: {
      capacityConstraints: any[];
      qualityConstraints: any[];
      resourceConstraints: any[];
    };
  };
  aiEnhancements: {
    predictiveCostModeling: boolean;
    realTimeOptimization: boolean;
    benchmarkComparison: boolean;
    varianceAnalysis: boolean;
  };
}

export class ProfitabilityAnalysisDto {
  analysisType: 'PRODUCT' | 'CUSTOMER' | 'SEGMENT' | 'CHANNEL' | 'REGION' | 'PROJECT' | 'CAMPAIGN';
  analysisScope: {
    entities: string[];
    timeFrame: {
      startDate: string;
      endDate: string;
      comparisonPeriods?: string[];
    };
    dimensions: {
      businessUnit?: string[];
      geography?: string[];
      channel?: string[];
      customerSegment?: string[];
    };
  };
  profitabilityMetrics: {
    grossProfit: boolean;
    contributionMargin: boolean;
    operatingProfit: boolean;
    netProfit: boolean;
    roi: boolean;
    eva: boolean; // Economic Value Added
    customMetrics?: {
      name: string;
      formula: string;
      target?: number;
    }[];
  };
  costAllocationMethod: 'ACTIVITY_BASED' | 'TRADITIONAL' | 'MARGINAL' | 'HYBRID' | 'AI_OPTIMIZED';
  analysisGranularity: 'SUMMARY' | 'DETAILED' | 'DRILL_DOWN';
  benchmarking: {
    includeBenchmarks: boolean;
    benchmarkSources: ('INDUSTRY' | 'COMPETITOR' | 'HISTORICAL' | 'TARGET')[];
    benchmarkMetrics: string[];
  };
  aiAnalysis: {
    enablePredictiveAnalysis: boolean;
    enableScenarioModeling: boolean;
    enableOptimizationRecommendations: boolean;
    enableTrendAnalysis: boolean;
  };
}

export class VarianceAnalysisDto {
  varianceType: 'MATERIAL' | 'LABOR' | 'OVERHEAD' | 'SALES' | 'COMPREHENSIVE';
  analysisLevel: 'TOTAL' | 'PRICE_QUANTITY' | 'DETAILED_BREAKDOWN';
  periodComparison: {
    actualPeriod: {
      startDate: string;
      endDate: string;
    };
    standardPeriod: {
      startDate: string;
      endDate: string;
    };
    budgetVersion?: string;
  };
  varianceCalculations: {
    materialVariances?: {
      priceVariance: boolean;
      quantityVariance: boolean;
      mixVariance: boolean;
      yieldVariance: boolean;
    };
    laborVariances?: {
      rateVariance: boolean;
      efficiencyVariance: boolean;
      idleTimeVariance: boolean;
      calendarVariance: boolean;
    };
    overheadVariances?: {
      spendingVariance: boolean;
      efficiencyVariance: boolean;
      capacityVariance: boolean;
      calendarVariance: boolean;
    };
    salesVariances?: {
      priceVariance: boolean;
      volumeVariance: boolean;
      mixVariance: boolean;
      marketShareVariance: boolean;
    };
  };
  thresholds: {
    significanceThreshold: number; // Percentage
    investigationThreshold: number; // Amount
    criticalVarianceThreshold: number; // Percentage
  };
  aiConfiguration: {
    enableRootCauseAnalysis: boolean;
    enablePredictiveVarianceDetection: boolean;
    enableAutomaticCorrectiveActions: boolean;
    enableLearningFromPatterns: boolean;
  };
}

export class ActivityBasedCostingDto {
  abcModelId?: string;
  modelName: string;
  modelType: 'TRADITIONAL_ABC' | 'TIME_DRIVEN_ABC' | 'LEAN_ABC' | 'AI_ENHANCED_ABC';
  scope: {
    costCenters: string[];
    products: string[];
    services: string[];
    customers?: string[];
    channels?: string[];
  };
  activities: {
    activityId: string;
    activityName: string;
    activityType: 'UNIT_LEVEL' | 'BATCH_LEVEL' | 'PRODUCT_LEVEL' | 'FACILITY_LEVEL';
    costDriver: {
      driverName: string;
      driverType: 'TRANSACTION' | 'DURATION' | 'INTENSITY';
      measurementUnit: string;
      driverRate?: number;
    };
    resourceConsumption: {
      personnel: number;
      equipment: number;
      facilities: number;
      technology: number;
      other: number;
    };
    performanceMetrics: {
      efficiency: number;
      quality: number;
      cycleTime: number;
      capacity: number;
    };
  }[];
  costAssignment: {
    directCosts: {
      assignmentMethod: 'DIRECT_TRACING' | 'DRIVER_BASED';
      accuracy: number;
    };
    indirectCosts: {
      assignmentMethod: 'ACTIVITY_BASED' | 'PROPORTIONAL' | 'AI_OPTIMIZED';
      allocationAccuracy: number;
    };
  };
  aiOptimization: {
    enableDynamicDriverSelection: boolean;
    enableCostDriverOptimization: boolean;
    enableActivityOptimization: boolean;
    enablePredictiveModeling: boolean;
  };
}

@ApiTags('Cost Accounting & Profitability Analysis')
@Controller('finance-accounting/cost-accounting')
@WebSocketGateway({
  cors: true,
  path: '/cost-socket',
  transports: ['websocket', 'polling']
})
@UseGuards(FinanceGuard)
@ApiBearerAuth()
export class CostAccountingController {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CostAccountingController.name);
  private activeCostSessions = new Map<string, any>();

  constructor(
    private readonly costAccountingService: CostAccountingService,
    private readonly profitabilityAnalysisService: ProfitabilityAnalysisService,
    private readonly varianceAnalysisService: VarianceAnalysisService,
    private readonly activityBasedCostingService: ActivityBasedCostingService,
    private readonly performanceMetricsService: PerformanceMetricsService,
  ) {}

  @Post('cost-centers')
  @ApiOperation({
    summary: 'Create Cost Center',
    description: 'Create cost center with AI-powered optimization and predictive analytics',
  })
  @ApiBody({ type: CostCenterDto })
  @ApiResponse({
    status: 201,
    description: 'Cost center created successfully',
    schema: {
      example: {
        costCenterId: 'CC_2024_001',
        costCenterCode: 'PROD-001',
        costCenterName: 'Manufacturing Line 1',
        costCenterType: 'PRODUCTION',
        annualBudget: 2000000,
        currentUtilization: 85.5,
        kpiPerformance: {
          costPerUnit: {
            actual: 45.50,
            target: 48.00,
            variance: -5.2,
            status: 'FAVORABLE'
          },
          efficiency: {
            actual: 92.3,
            target: 90.0,
            variance: 2.3,
            status: 'FAVORABLE'
          },
          qualityScore: {
            actual: 98.7,
            target: 95.0,
            variance: 3.7,
            status: 'EXCELLENT'
          }
        },
        aiInsights: {
          costOptimizationOpportunities: [
            'Material waste reduction can save $25,000 annually',
            'Energy efficiency improvements potential: $18,000',
            'Process automation ROI: 24% within 18 months'
          ],
          predictiveAnalysis: {
            forecastedCostTrend: 'DECREASING',
            expectedSavings: 125000,
            confidenceLevel: 0.91
          },
          benchmarkComparison: {
            industryPercentile: 78,
            bestPracticeGap: 8.5,
            improvementPotential: 'MODERATE'
          }
        },
        realTimeMetrics: {
          currentCostPerHour: 285.50,
          todayEfficiency: 94.2,
          weeklyTrend: '+2.1%',
          alerts: []
        }
      }
    }
  })
  async createCostCenter(@Body() costCenterDto: CostCenterDto) {
    try {
      this.logger.log(`Creating cost center: ${costCenterDto.costCenterName}`);
      
      const costCenter = await this.costAccountingService.createAdvancedCostCenter(costCenterDto);
      
      // Emit real-time update
      this.server.emit('cost-center-created', {
        costCenterId: costCenter.costCenterId,
        costCenterName: costCenter.costCenterName,
        budget: costCenter.annualBudget,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Cost center created successfully',
        data: costCenter,
      };
    } catch (error) {
      this.logger.error(`Cost center creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create cost center',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('cost-calculation')
  @ApiOperation({
    summary: 'Calculate Product/Service Costs',
    description: 'Quantum-optimized cost calculation with AI-powered variance analysis and optimization',
  })
  @ApiBody({ type: CostCalculationDto })
  @ApiResponse({
    status: 200,
    description: 'Cost calculation completed successfully'
  })
  async calculateCosts(@Body() costDto: CostCalculationDto) {
    try {
      this.logger.log(`Calculating costs using method: ${costDto.calculationMethod}`);
      
      const costCalculation = await this.costAccountingService.performAdvancedCostCalculation(costDto);
      
      // Emit real-time update
      this.server.emit('cost-calculation-completed', {
        calculationId: costCalculation.calculationId,
        method: costDto.calculationMethod,
        totalCost: costCalculation.totalCost,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Cost calculation completed successfully',
        data: costCalculation,
      };
    } catch (error) {
      this.logger.error(`Cost calculation failed: ${error.message}`);
      throw new HttpException(
        'Cost calculation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('profitability-analysis')
  @ApiOperation({
    summary: 'Perform Profitability Analysis',
    description: 'Comprehensive profitability analysis with AI insights and optimization recommendations',
  })
  @ApiBody({ type: ProfitabilityAnalysisDto })
  @ApiResponse({
    status: 200,
    description: 'Profitability analysis completed successfully'
  })
  async performProfitabilityAnalysis(@Body() analysisDto: ProfitabilityAnalysisDto) {
    try {
      this.logger.log(`Performing profitability analysis: ${analysisDto.analysisType}`);
      
      const analysis = await this.profitabilityAnalysisService.performAdvancedProfitabilityAnalysis(analysisDto);
      
      // Emit real-time update
      this.server.emit('profitability-analysis-completed', {
        analysisType: analysisDto.analysisType,
        entitiesAnalyzed: analysisDto.analysisScope.entities.length,
        avgProfitability: analysis.averageProfitability,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Profitability analysis completed successfully',
        data: analysis,
      };
    } catch (error) {
      this.logger.error(`Profitability analysis failed: ${error.message}`);
      throw new HttpException(
        'Profitability analysis failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('variance-analysis')
  @ApiOperation({
    summary: 'Perform Variance Analysis',
    description: 'AI-powered variance analysis with root cause identification and corrective action recommendations',
  })
  @ApiBody({ type: VarianceAnalysisDto })
  @ApiResponse({
    status: 200,
    description: 'Variance analysis completed successfully'
  })
  async performVarianceAnalysis(@Body() varianceDto: VarianceAnalysisDto) {
    try {
      this.logger.log(`Performing variance analysis: ${varianceDto.varianceType}`);
      
      const analysis = await this.varianceAnalysisService.performAdvancedVarianceAnalysis(varianceDto);
      
      // Emit real-time update
      this.server.emit('variance-analysis-completed', {
        varianceType: varianceDto.varianceType,
        totalVariances: analysis.totalVariances,
        significantVariances: analysis.significantVariances,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Variance analysis completed successfully',
        data: analysis,
      };
    } catch (error) {
      this.logger.error(`Variance analysis failed: ${error.message}`);
      throw new HttpException(
        'Variance analysis failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('activity-based-costing')
  @ApiOperation({
    summary: 'Setup Activity-Based Costing',
    description: 'AI-enhanced Activity-Based Costing with dynamic driver optimization and predictive modeling',
  })
  @ApiBody({ type: ActivityBasedCostingDto })
  @ApiResponse({
    status: 201,
    description: 'Activity-Based Costing model created successfully'
  })
  async setupActivityBasedCosting(@Body() abcDto: ActivityBasedCostingDto) {
    try {
      this.logger.log(`Setting up ABC model: ${abcDto.modelName}`);
      
      const abcModel = await this.activityBasedCostingService.createAdvancedABCModel(abcDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Activity-Based Costing model created successfully',
        data: abcModel,
      };
    } catch (error) {
      this.logger.error(`ABC model creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create ABC model',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('cost-optimization')
  @ApiOperation({
    summary: 'Get Cost Optimization Recommendations',
    description: 'AI-powered cost optimization recommendations with quantum scenario analysis',
  })
  @ApiQuery({ name: 'scope', required: false, description: 'Optimization scope' })
  @ApiQuery({ name: 'timeframe', required: false, description: 'Time frame for optimization' })
  @ApiResponse({
    status: 200,
    description: 'Cost optimization recommendations generated successfully'
  })
  async getCostOptimizationRecommendations(
    @Query('scope') scope?: string,
    @Query('timeframe') timeframe?: string,
  ) {
    try {
      this.logger.log('Generating cost optimization recommendations');
      
      const recommendations = await this.costAccountingService.generateOptimizationRecommendations({
        scope: scope || 'COMPREHENSIVE',
        timeframe: timeframe || '12_MONTHS',
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Cost optimization recommendations generated successfully',
        data: recommendations,
      };
    } catch (error) {
      this.logger.error(`Cost optimization recommendations failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate cost optimization recommendations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('performance-metrics')
  @ApiOperation({
    summary: 'Get Performance Metrics',
    description: 'Comprehensive performance metrics with benchmarking and trend analysis',
  })
  @ApiQuery({ name: 'metricType', required: false, description: 'Type of metrics to retrieve' })
  @ApiQuery({ name: 'period', required: false, description: 'Time period for metrics' })
  @ApiResponse({
    status: 200,
    description: 'Performance metrics retrieved successfully'
  })
  async getPerformanceMetrics(
    @Query('metricType') metricType?: string,
    @Query('period') period?: string,
  ) {
    try {
      this.logger.log('Retrieving performance metrics');
      
      const metrics = await this.performanceMetricsService.getAdvancedPerformanceMetrics({
        metricType: metricType || 'ALL',
        period: period || 'CURRENT_MONTH',
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Performance metrics retrieved successfully',
        data: metrics,
      };
    } catch (error) {
      this.logger.error(`Performance metrics retrieval failed: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve performance metrics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('cost-dashboard')
  @ApiOperation({
    summary: 'Cost Accounting Dashboard',
    description: 'Comprehensive cost accounting dashboard with real-time KPIs and AI insights',
  })
  @ApiResponse({
    status: 200,
    description: 'Cost dashboard data retrieved successfully'
  })
  async getCostDashboard() {
    try {
      const dashboard = await this.costAccountingService.generateCostDashboard();
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Cost dashboard generated successfully',
        data: dashboard,
      };
    } catch (error) {
      this.logger.error(`Cost dashboard generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate cost dashboard',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('quantum-cost-optimization')
  @ApiOperation({
    summary: 'Quantum Cost Optimization',
    description: 'Quantum-enhanced cost optimization across entire cost structure with multi-variable optimization',
  })
  @ApiResponse({
    status: 200,
    description: 'Quantum cost optimization completed successfully'
  })
  async performQuantumCostOptimization(@Body() optimizationParams: any) {
    try {
      this.logger.log('Performing quantum cost optimization');
      
      const optimization = await this.costAccountingService.performQuantumOptimization(optimizationParams);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Quantum cost optimization completed successfully',
        data: optimization,
      };
    } catch (error) {
      this.logger.error(`Quantum cost optimization failed: ${error.message}`);
      throw new HttpException(
        'Quantum cost optimization failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // WebSocket handlers for real-time cost monitoring
  @SubscribeMessage('subscribe-cost-updates')
  handleCostSubscription(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const { costCenters, products, metrics } = data;
    costCenters.forEach(center => client.join(`cost_center_${center}`));
    products.forEach(product => client.join(`product_${product}`));
    metrics.forEach(metric => client.join(`metric_${metric}`));
    
    this.activeCostSessions.set(client.id, { costCenters, products, metrics });
    
    client.emit('subscription-confirmed', {
      costCenters,
      products,
      metrics,
      realTimeUpdates: true,
      aiInsights: true,
      quantumOptimization: true,
      timestamp: new Date().toISOString()
    });
    
    this.logger.log(`Cost monitoring subscription: ${costCenters.length} cost centers`);
  }

  @SubscribeMessage('cost-calculation-request')
  async handleCostCalculationRequest(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const calculation = await this.costAccountingService.performRealTimeCostCalculation(data);
      
      client.emit('cost-calculation-result', {
        requestId: data.requestId,
        calculation,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time cost calculation failed: ${error.message}`);
      client.emit('error', { message: 'Cost calculation failed' });
    }
  }

  @SubscribeMessage('variance-alert')
  async handleVarianceAlert(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const analysis = await this.varianceAnalysisService.analyzeVarianceRealTime(data);
      
      client.emit('variance-analysis', {
        alertId: data.alertId,
        analysis,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time variance analysis failed: ${error.message}`);
      client.emit('error', { message: 'Variance analysis failed' });
    }
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const costSession = this.activeCostSessions.get(client.id);
    if (costSession) {
      this.activeCostSessions.delete(client.id);
      this.logger.log(`Cost monitoring disconnection: ${costSession.costCenters.length} cost centers`);
    }
  }
}
