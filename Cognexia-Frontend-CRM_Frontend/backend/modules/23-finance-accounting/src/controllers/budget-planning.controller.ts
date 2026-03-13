// Industry 5.0 ERP Backend - Revolutionary Budget & Planning Controller
// AI-powered budgeting, forecasting, scenario planning, and quantum-enhanced variance analysis
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

import { BudgetPlanningService } from '../services/budget-planning.service';
import { ForecastingService } from '../services/forecasting.service';
import { ScenarioPlanningService } from '../services/scenario-planning.service';
import { BudgetVarianceService } from '../services/budget-variance.service';
import { PlanningOptimizationService } from '../services/planning-optimization.service';
import { FinanceGuard } from '../guards/finance.guard';

// DTOs for Budget & Planning
export class BudgetDto {
  budgetId?: string;
  budgetName: string;
  budgetType: 'OPERATIONAL' | 'CAPITAL' | 'CASH_FLOW' | 'MASTER' | 'FLEXIBLE' | 'ZERO_BASE' | 'ACTIVITY_BASED';
  budgetPeriod: {
    fiscalYear: string;
    startDate: string;
    endDate: string;
    frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
    rollingPeriods?: number;
  };
  budgetStructure: {
    organizationalStructure: {
      businessUnits: string[];
      costCenters: string[];
      profitCenters: string[];
      departments: string[];
    };
    accountingStructure: {
      revenueAccounts: string[];
      expenseAccounts: string[];
      assetAccounts: string[];
      liabilityAccounts: string[];
    };
    dimensionalStructure: {
      products?: string[];
      channels?: string[];
      geographies?: string[];
      customers?: string[];
      projects?: string[];
    };
  };
  budgetItems: {
    itemId: string;
    itemName: string;
    accountCode: string;
    accountName: string;
    itemType: 'REVENUE' | 'EXPENSE' | 'CAPEX' | 'WORKING_CAPITAL';
    budgetMethod: 'INCREMENTAL' | 'ZERO_BASE' | 'ACTIVITY_BASED' | 'STATISTICAL' | 'AI_PREDICTED';
    periodicBudgets: {
      period: string;
      budgetAmount: number;
      currency: string;
      localCurrencyAmount?: number;
      assumptions: string[];
      drivers: {
        driverName: string;
        driverValue: number;
        driverUnit: string;
        correlation: number;
      }[];
    }[];
    variance: {
      allowedVariancePercentage: number;
      allowedVarianceAmount: number;
      approvalRequired: boolean;
      escalationRules: string[];
    };
  }[];
  approvalWorkflow: {
    approvalLevels: {
      level: number;
      approvers: string[];
      approvalCriteria: any;
      timeoutDays: number;
    }[];
    currentStatus: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED';
    approvalHistory: {
      approver: string;
      action: 'APPROVED' | 'REJECTED' | 'REQUESTED_REVISION';
      date: string;
      comments?: string;
    }[];
  };
  aiConfiguration: {
    enablePredictiveModeling: boolean;
    enableSeasonalityDetection: boolean;
    enableTrendAnalysis: boolean;
    enableScenarioModeling: boolean;
    confidenceLevel: number;
    learningEnabled: boolean;
  };
  scenarioPlanning: {
    baseScenario: any;
    optimisticScenario?: any;
    pessimisticScenario?: any;
    customScenarios?: any[];
    monteCarloSimulations?: {
      enabled: boolean;
      iterations: number;
      riskFactors: string[];
    };
  };
}

export class ForecastDto {
  forecastId?: string;
  forecastName: string;
  forecastType: 'ROLLING' | 'ANNUAL' | 'STRATEGIC' | 'OPERATIONAL' | 'PROJECT_BASED';
  forecastHorizon: {
    startDate: string;
    endDate: string;
    granularity: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
    rollingPeriods?: number;
  };
  forecastMethod: 'TIME_SERIES' | 'CAUSAL' | 'JUDGMENTAL' | 'HYBRID' | 'AI_ENHANCED' | 'QUANTUM_OPTIMIZED';
  forecastScope: {
    entities: string[];
    accounts: string[];
    dimensions: {
      businessUnit?: string[];
      costCenter?: string[];
      product?: string[];
      geography?: string[];
    };
  };
  forecastDrivers: {
    economicDrivers: {
      gdpGrowth?: number;
      inflationRate?: number;
      interestRates?: number;
      exchangeRates?: Record<string, number>;
      unemploymentRate?: number;
    };
    industryDrivers: {
      marketGrowth?: number;
      competitiveIndex?: number;
      seasonalityFactors?: Record<string, number>;
      regulatoryChanges?: string[];
    };
    companyDrivers: {
      salesGrowth?: number;
      priceChanges?: number;
      volumeChanges?: number;
      costInflation?: number;
      productivityGains?: number;
      investmentPlans?: any[];
    };
  };
  forecastAssumptions: {
    assumption: string;
    value: any;
    confidence: number;
    riskImpact: 'LOW' | 'MEDIUM' | 'HIGH';
    source: string;
  }[];
  modelConfiguration: {
    algorithm: 'ARIMA' | 'LSTM' | 'PROPHET' | 'ENSEMBLE' | 'QUANTUM_ML';
    parameters: any;
    validationMethod: 'HOLDOUT' | 'CROSS_VALIDATION' | 'WALK_FORWARD';
    accuracyMetrics: {
      mape?: number;
      rmse?: number;
      mae?: number;
      r_squared?: number;
    };
  };
  aiEnhancements: {
    enableExternalDataIntegration: boolean;
    enableMarketSentimentAnalysis: boolean;
    enableCompetitorAnalysis: boolean;
    enableRealTimeAdjustments: boolean;
  };
}

export class ScenarioDto {
  scenarioId?: string;
  scenarioName: string;
  scenarioType: 'BASE_CASE' | 'OPTIMISTIC' | 'PESSIMISTIC' | 'STRESS_TEST' | 'CUSTOM';
  scenarioDescription: string;
  probabilityOfOccurrence: number;
  scenarioDrivers: {
    macroEconomic: {
      economicGrowth: number;
      inflation: number;
      interestRates: number;
      currencyFluctuations: Record<string, number>;
    };
    market: {
      marketGrowth: number;
      marketShare: number;
      priceElasticity: number;
      competitiveIntensity: number;
    };
    operational: {
      volumeChanges: number;
      costChanges: number;
      efficiencyGains: number;
      qualityImprovements: number;
    };
    strategic: {
      newProductLaunches: any[];
      marketExpansion: any[];
      acquisitions: any[];
      divestments: any[];
    };
  };
  riskFactors: {
    riskName: string;
    probability: number;
    impact: number;
    mitigationStrategies: string[];
  }[];
  keyPerformanceIndicators: {
    revenue: number;
    operatingMargin: number;
    netMargin: number;
    roa: number;
    roe: number;
    cashFlow: number;
    customKPIs?: { name: string; value: number }[];
  };
  sensitivityAnalysis: {
    variableName: string;
    baseValue: number;
    sensitivityRange: { min: number; max: number };
    impactOnRevenue: number;
    impactOnProfit: number;
  }[];
  monteCarloSettings?: {
    iterations: number;
    confidenceInterval: number;
    riskDistribution: 'NORMAL' | 'LOGNORMAL' | 'TRIANGULAR' | 'UNIFORM';
  };
}

export class BudgetVarianceDto {
  varianceAnalysisId?: string;
  analysisName: string;
  analysisType: 'PERIODIC' | 'YTD' | 'ROLLING' | 'FORECAST_VS_ACTUAL' | 'BUDGET_VS_FORECAST';
  analysisPeriod: {
    startDate: string;
    endDate: string;
    comparisonBaseline: 'BUDGET' | 'FORECAST' | 'PRIOR_YEAR' | 'CUSTOM';
  };
  varianceScope: {
    organizationalUnits: string[];
    accounts: string[];
    dimensions?: Record<string, string[]>;
  };
  varianceCalculations: {
    revenueVariances: {
      totalVariance: number;
      volumeVariance: number;
      priceVariance: number;
      mixVariance: number;
      currencyVariance?: number;
    };
    expenseVariances: {
      totalVariance: number;
      volumeVariance: number;
      rateVariance: number;
      efficiencyVariance: number;
      mixVariance: number;
    };
    marginVariances: {
      grossMarginVariance: number;
      operatingMarginVariance: number;
      netMarginVariance: number;
    };
  };
  thresholds: {
    materialityThreshold: number;
    investigationThreshold: number;
    actionThreshold: number;
  };
  rootCauseAnalysis: {
    enableAutomaticAnalysis: boolean;
    aiDrivenInsights: boolean;
    externalFactorAnalysis: boolean;
    correlationAnalysis: boolean;
  };
  actionPlan: {
    corrective: {
      immediateActions: string[];
      shortTermActions: string[];
      longTermActions: string[];
    };
    preventive: {
      processImprovements: string[];
      controlEnhancements: string[];
      trainingNeeds: string[];
    };
  };
}

@ApiTags('Budget & Planning')
@Controller('finance-accounting/budget-planning')
@WebSocketGateway({
  cors: true,
  path: '/budget-socket',
  transports: ['websocket', 'polling']
})
@UseGuards(FinanceGuard)
@ApiBearerAuth()
export class BudgetPlanningController {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(BudgetPlanningController.name);
  private activeBudgetSessions = new Map<string, any>();

  constructor(
    private readonly budgetPlanningService: BudgetPlanningService,
    private readonly forecastingService: ForecastingService,
    private readonly scenarioPlanningService: ScenarioPlanningService,
    private readonly budgetVarianceService: BudgetVarianceService,
    private readonly planningOptimizationService: PlanningOptimizationService,
  ) {}

  @Post('budgets')
  @ApiOperation({
    summary: 'Create Budget',
    description: 'Create comprehensive budget with AI-powered predictions and scenario modeling',
  })
  @ApiBody({ type: BudgetDto })
  @ApiResponse({
    status: 201,
    description: 'Budget created successfully',
    schema: {
      example: {
        budgetId: 'BUDGET_2024_001',
        budgetName: 'FY2024 Operating Budget',
        budgetType: 'OPERATIONAL',
        totalBudgetAmount: 50000000,
        currency: 'USD',
        status: 'DRAFT',
        budgetSummary: {
          revenue: {
            totalRevenue: 75000000,
            growthRate: 15.2,
            breakdown: {
              productSales: 60000000,
              serviceRevenue: 12000000,
              otherRevenue: 3000000
            }
          },
          expenses: {
            totalExpenses: 50000000,
            breakdown: {
              operatingExpenses: 35000000,
              salesMarketing: 8000000,
              administration: 5000000,
              research: 2000000
            }
          },
          profitability: {
            grossProfit: 25000000,
            operatingProfit: 15000000,
            netProfit: 12000000,
            margins: {
              gross: 33.3,
              operating: 20.0,
              net: 16.0
            }
          }
        },
        aiInsights: {
          predictionAccuracy: 0.92,
          seasonalityFactors: [
            'Q4 revenue typically 25% higher due to holiday sales',
            'Q1 expenses elevated due to annual maintenance'
          ],
          riskFactors: [
            'Market volatility could impact revenue by ±8%',
            'Currency fluctuations pose moderate risk to costs'
          ],
          optimizationOpportunities: [
            'Shift marketing spend to Q3 for 12% better ROI',
            'Stagger hiring to optimize quarterly cash flow'
          ]
        },
        scenarioAnalysis: {
          baseCase: { revenue: 75000000, profit: 12000000 },
          optimistic: { revenue: 82500000, profit: 16500000 },
          pessimistic: { revenue: 67500000, profit: 8500000 },
          probabilityWeighted: { revenue: 75750000, profit: 12750000 }
        },
        approvalStatus: {
          currentLevel: 1,
          pendingApprovers: ['CFO', 'CEO'],
          submittedDate: '2024-03-01',
          targetApprovalDate: '2024-03-15'
        }
      }
    }
  })
  async createBudget(@Body() budgetDto: BudgetDto) {
    try {
      this.logger.log(`Creating budget: ${budgetDto.budgetName}`);
      
      const budget = await this.budgetPlanningService.createAdvancedBudget(budgetDto);
      
      // Emit real-time update
      this.server.emit('budget-created', {
        budgetId: budget.budgetId,
        budgetName: budget.budgetName,
        budgetType: budget.budgetType,
        totalAmount: budget.totalBudgetAmount,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Budget created successfully',
        data: budget,
      };
    } catch (error) {
      this.logger.error(`Budget creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create budget',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('forecasts')
  @ApiOperation({
    summary: 'Create Forecast',
    description: 'Generate AI-enhanced forecast with quantum optimization and external data integration',
  })
  @ApiBody({ type: ForecastDto })
  @ApiResponse({
    status: 201,
    description: 'Forecast created successfully'
  })
  async createForecast(@Body() forecastDto: ForecastDto) {
    try {
      this.logger.log(`Creating forecast: ${forecastDto.forecastName}`);
      
      const forecast = await this.forecastingService.createAdvancedForecast(forecastDto);
      
      // Emit real-time update
      this.server.emit('forecast-created', {
        forecastId: forecast.forecastId,
        forecastName: forecast.forecastName,
        forecastType: forecast.forecastType,
        accuracy: forecast.accuracyScore,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Forecast created successfully',
        data: forecast,
      };
    } catch (error) {
      this.logger.error(`Forecast creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create forecast',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('scenarios')
  @ApiOperation({
    summary: 'Create Scenario',
    description: 'Create comprehensive scenario with Monte Carlo simulations and sensitivity analysis',
  })
  @ApiBody({ type: ScenarioDto })
  @ApiResponse({
    status: 201,
    description: 'Scenario created successfully'
  })
  async createScenario(@Body() scenarioDto: ScenarioDto) {
    try {
      this.logger.log(`Creating scenario: ${scenarioDto.scenarioName}`);
      
      const scenario = await this.scenarioPlanningService.createAdvancedScenario(scenarioDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Scenario created successfully',
        data: scenario,
      };
    } catch (error) {
      this.logger.error(`Scenario creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create scenario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('variance-analysis')
  @ApiOperation({
    summary: 'Perform Variance Analysis',
    description: 'AI-powered variance analysis with root cause identification and action planning',
  })
  @ApiBody({ type: BudgetVarianceDto })
  @ApiResponse({
    status: 200,
    description: 'Variance analysis completed successfully'
  })
  async performVarianceAnalysis(@Body() varianceDto: BudgetVarianceDto) {
    try {
      this.logger.log(`Performing variance analysis: ${varianceDto.analysisName}`);
      
      const analysis = await this.budgetVarianceService.performAdvancedVarianceAnalysis(varianceDto);
      
      // Emit real-time update
      this.server.emit('variance-analysis-completed', {
        analysisId: analysis.varianceAnalysisId,
        analysisType: varianceDto.analysisType,
        totalVariance: analysis.totalVariance,
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

  @Get('budget-dashboard')
  @ApiOperation({
    summary: 'Budget Dashboard',
    description: 'Comprehensive budget dashboard with KPIs, variances, and forecasts',
  })
  @ApiQuery({ name: 'budgetId', required: false, description: 'Specific budget ID' })
  @ApiQuery({ name: 'period', required: false, description: 'Dashboard period' })
  @ApiResponse({
    status: 200,
    description: 'Budget dashboard data retrieved successfully'
  })
  async getBudgetDashboard(
    @Query('budgetId') budgetId?: string,
    @Query('period') period?: string,
  ) {
    try {
      this.logger.log('Generating budget dashboard');
      
      const dashboard = await this.budgetPlanningService.generateBudgetDashboard({
        budgetId,
        period: period || 'CURRENT_QUARTER',
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Budget dashboard generated successfully',
        data: dashboard,
      };
    } catch (error) {
      this.logger.error(`Budget dashboard generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate budget dashboard',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('quantum-planning-optimization')
  @ApiOperation({
    summary: 'Quantum Planning Optimization',
    description: 'Quantum-enhanced optimization of budget allocation and resource planning',
  })
  @ApiResponse({
    status: 200,
    description: 'Quantum planning optimization completed successfully'
  })
  async performQuantumPlanningOptimization(@Body() optimizationParams: any) {
    try {
      this.logger.log('Performing quantum planning optimization');
      
      const optimization = await this.planningOptimizationService.performQuantumOptimization(optimizationParams);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Quantum planning optimization completed successfully',
        data: optimization,
      };
    } catch (error) {
      this.logger.error(`Quantum planning optimization failed: ${error.message}`);
      throw new HttpException(
        'Quantum planning optimization failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('ai-insights')
  @ApiOperation({
    summary: 'Get AI Planning Insights',
    description: 'AI-generated insights for budget planning, forecasting, and optimization',
  })
  @ApiQuery({ name: 'insightType', required: false, description: 'Type of insights' })
  @ApiQuery({ name: 'scope', required: false, description: 'Analysis scope' })
  @ApiResponse({
    status: 200,
    description: 'AI insights generated successfully'
  })
  async getAIPlanningInsights(
    @Query('insightType') insightType?: string,
    @Query('scope') scope?: string,
  ) {
    try {
      this.logger.log('Generating AI planning insights');
      
      const insights = await this.budgetPlanningService.generateAIInsights({
        insightType: insightType || 'COMPREHENSIVE',
        scope: scope || 'FULL_ORGANIZATION',
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'AI insights generated successfully',
        data: insights,
      };
    } catch (error) {
      this.logger.error(`AI insights generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate AI insights',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('rolling-forecast')
  @ApiOperation({
    summary: 'Create Rolling Forecast',
    description: 'Generate rolling forecast with continuous updates and machine learning enhancement',
  })
  @ApiResponse({
    status: 200,
    description: 'Rolling forecast created successfully'
  })
  async createRollingForecast(@Body() rollingForecastParams: any) {
    try {
      this.logger.log('Creating rolling forecast');
      
      const rollingForecast = await this.forecastingService.createRollingForecast(rollingForecastParams);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Rolling forecast created successfully',
        data: rollingForecast,
      };
    } catch (error) {
      this.logger.error(`Rolling forecast creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create rolling forecast',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // WebSocket handlers for real-time budget monitoring
  @SubscribeMessage('subscribe-budget-updates')
  handleBudgetSubscription(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const { budgets, forecasts, scenarios } = data;
    budgets.forEach(budget => client.join(`budget_${budget}`));
    forecasts.forEach(forecast => client.join(`forecast_${forecast}`));
    scenarios.forEach(scenario => client.join(`scenario_${scenario}`));
    
    this.activeBudgetSessions.set(client.id, { budgets, forecasts, scenarios });
    
    client.emit('subscription-confirmed', {
      budgets,
      forecasts,
      scenarios,
      realTimeUpdates: true,
      aiPredictions: true,
      varianceAnalysis: true,
      quantumOptimization: true,
      timestamp: new Date().toISOString()
    });
    
    this.logger.log(`Budget monitoring subscription: ${budgets.length} budgets, ${forecasts.length} forecasts`);
  }

  @SubscribeMessage('budget-simulation')
  async handleBudgetSimulation(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const simulation = await this.scenarioPlanningService.runRealTimeSimulation(data);
      
      client.emit('simulation-result', {
        requestId: data.requestId,
        simulation,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time budget simulation failed: ${error.message}`);
      client.emit('error', { message: 'Budget simulation failed' });
    }
  }

  @SubscribeMessage('forecast-update')
  async handleForecastUpdate(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const forecast = await this.forecastingService.updateForecastRealTime(data);
      
      client.emit('forecast-updated', {
        forecastId: data.forecastId,
        forecast,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time forecast update failed: ${error.message}`);
      client.emit('error', { message: 'Forecast update failed' });
    }
  }

  @SubscribeMessage('variance-alert')
  async handleVarianceAlert(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const analysis = await this.budgetVarianceService.analyzeVarianceRealTime(data);
      
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
    const budgetSession = this.activeBudgetSessions.get(client.id);
    if (budgetSession) {
      this.activeBudgetSessions.delete(client.id);
      this.logger.log(`Budget monitoring disconnection: ${budgetSession.budgets.length} budgets`);
    }
  }
}
