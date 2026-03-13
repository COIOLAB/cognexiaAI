// Industry 5.0 ERP Backend - Revolutionary Cash Management & Treasury Controller
// AI-powered cash flow forecasting, investment optimization, bank reconciliation, and liquidity management
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

import { CashManagementService } from '../services/cash-management.service';
import { TreasuryService } from '../services/treasury.service';
import { CashFlowForecastingService } from '../services/cash-flow-forecasting.service';
import { BankReconciliationService } from '../services/bank-reconciliation.service';
import { InvestmentManagementService } from '../services/investment-management.service';
import { LiquidityOptimizationService } from '../services/liquidity-optimization.service';
import { FinanceGuard } from '../guards/finance.guard';

// DTOs for Cash Management & Treasury
export class CashPositionDto {
  positionDate: string;
  currency: string;
  bankAccounts: {
    accountId: string;
    accountNumber: string;
    bankName: string;
    accountType: 'CHECKING' | 'SAVINGS' | 'MONEY_MARKET' | 'CERTIFICATE_DEPOSIT' | 'FOREIGN_CURRENCY';
    balance: {
      bookBalance: number;
      availableBalance: number;
      clearedBalance: number;
      unclearedDeposits: number;
      outstandingChecks: number;
      pendingTransfers: number;
    };
    interestRate?: number;
    minimumBalance?: number;
    maximumBalance?: number;
    overdraftLimit?: number;
    fees: {
      maintenanceFee: number;
      transactionFees: number;
      overdraftFees: number;
      otherFees: number;
    };
  }[];
  cashEquivalents: {
    instrumentType: 'MONEY_MARKET_FUND' | 'TREASURY_BILLS' | 'COMMERCIAL_PAPER' | 'CERTIFICATES_DEPOSIT' | 'REPO';
    instrumentId: string;
    amount: number;
    maturityDate?: string;
    interestRate: number;
    liquidity: 'IMMEDIATE' | 'SAME_DAY' | 'NEXT_DAY' | 'T_PLUS_2' | 'T_PLUS_3';
  }[];
  totalCashPosition: number;
  liquidityMetrics: {
    immediatelyAvailable: number;
    availableWithinDay: number;
    availableWithinWeek: number;
    totalLiquid: number;
    liquidityRatio: number;
  };
  riskMetrics: {
    concentrationRisk: number;
    counterpartyRisk: number;
    interestRateRisk: number;
    liquidityRisk: number;
    overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

export class CashForecastDto {
  forecastId?: string;
  forecastName: string;
  forecastType: 'OPERATIONAL' | 'STRATEGIC' | 'SCENARIO' | 'STRESS_TEST';
  forecastHorizon: {
    startDate: string;
    endDate: string;
    granularity: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  };
  forecastMethod: 'DIRECT' | 'INDIRECT' | 'HYBRID' | 'AI_ENHANCED';
  cashInflows: {
    operatingInflows: {
      salesCollections: {
        accountsReceivable: number;
        cashSales: number;
        creditCardReceipts: number;
        otherReceivables: number;
      };
      otherOperatingInflows: {
        rentIncome: number;
        royalties: number;
        interestReceived: number;
        dividendsReceived: number;
        otherIncome: number;
      };
    };
    investingInflows: {
      assetSales: number;
      investmentMaturity: number;
      capitalContributions: number;
      otherInvestingInflows: number;
    };
    financingInflows: {
      loanProceeds: number;
      equityIssuance: number;
      bondIssuance: number;
      creditLineDraw: number;
      otherFinancingInflows: number;
    };
  };
  cashOutflows: {
    operatingOutflows: {
      supplierPayments: {
        accountsPayable: number;
        cashPurchases: number;
        accrualPayments: number;
        otherPayables: number;
      };
      employeePayments: {
        salaries: number;
        benefits: number;
        bonuses: number;
        expenses: number;
      };
      taxPayments: {
        incomeTax: number;
        salesTax: number;
        payrollTax: number;
        otherTaxes: number;
      };
      otherOperatingOutflows: {
        utilities: number;
        rent: number;
        insurance: number;
        professionalFees: number;
        otherExpenses: number;
      };
    };
    investingOutflows: {
      capitalExpenditures: number;
      acquisitions: number;
      investments: number;
      otherInvestingOutflows: number;
    };
    financingOutflows: {
      loanRepayments: number;
      interestPayments: number;
      dividendPayments: number;
      shareRepurchases: number;
      otherFinancingOutflows: number;
    };
  };
  scenarioAnalysis?: {
    baseCase: any;
    optimisticCase: any;
    pessimisticCase: any;
    customScenarios?: any[];
  };
  aiConfiguration: {
    enableMachineLearning: boolean;
    enableSeasonalityDetection: boolean;
    enableTrendAnalysis: boolean;
    enableExternalFactors: boolean;
    confidenceLevel: number;
  };
}

export class InvestmentDto {
  investmentId?: string;
  investmentType: 'MONEY_MARKET' | 'TREASURY_SECURITIES' | 'CORPORATE_BONDS' | 'COMMERCIAL_PAPER' | 'BANK_DEPOSITS' | 'MUTUAL_FUNDS' | 'ALTERNATIVE';
  instrumentName: string;
  investmentAmount: number;
  currency: string;
  investmentDate: string;
  maturityDate?: string;
  interestRate: number;
  rateType: 'FIXED' | 'FLOATING' | 'VARIABLE';
  riskRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'CC' | 'C' | 'D' | 'NR';
  liquidityProfile: {
    liquidityType: 'IMMEDIATE' | 'SAME_DAY' | 'T_PLUS_1' | 'T_PLUS_2' | 'T_PLUS_3' | 'WEEKLY' | 'MONTHLY';
    earlyWithdrawalPenalty?: number;
    minimumHoldingPeriod?: number;
  };
  counterparty: {
    name: string;
    rating: string;
    sector: string;
    country: string;
    exposureLimit: number;
  };
  performanceMetrics: {
    currentValue: number;
    unrealizedGainLoss: number;
    yieldToMaturity?: number;
    duration?: number;
    convexity?: number;
  };
  riskMetrics: {
    creditRisk: number;
    interestRateRisk: number;
    liquidityRisk: number;
    marketRisk: number;
    concentrationRisk: number;
  };
  aiOptimization: {
    enablePortfolioOptimization: boolean;
    enableRiskManagement: boolean;
    enableYieldOptimization: boolean;
    enableLiquidityMatching: boolean;
  };
}

export class BankReconciliationDto {
  reconciliationId?: string;
  bankAccount: {
    accountId: string;
    accountNumber: string;
    bankName: string;
  };
  reconciliationPeriod: {
    startDate: string;
    endDate: string;
  };
  bankStatement: {
    statementBalance: number;
    deposits: {
      date: string;
      amount: number;
      description: string;
      reference?: string;
    }[];
    withdrawals: {
      date: string;
      amount: number;
      description: string;
      reference?: string;
      checkNumber?: string;
    }[];
    fees: {
      date: string;
      amount: number;
      description: string;
      feeType: string;
    }[];
    interest: {
      date: string;
      amount: number;
      rate: number;
    }[];
  };
  bookBalance: number;
  reconciliationItems: {
    outstandingChecks: {
      checkNumber: string;
      date: string;
      amount: number;
      payee: string;
      status: 'OUTSTANDING' | 'CLEARED' | 'VOIDED';
    }[];
    depositsInTransit: {
      date: string;
      amount: number;
      description: string;
      expectedClearingDate: string;
    }[];
    bankErrors: {
      type: 'DUPLICATE_CHARGE' | 'INCORRECT_AMOUNT' | 'UNAUTHORIZED_TRANSACTION' | 'OTHER';
      amount: number;
      description: string;
      correctionRequired: boolean;
    }[];
    bookErrors: {
      type: 'DUPLICATE_ENTRY' | 'INCORRECT_AMOUNT' | 'MISSING_ENTRY' | 'CLASSIFICATION_ERROR' | 'OTHER';
      amount: number;
      description: string;
      correctionEntry?: any;
    }[];
  };
  autoMatchingRules: {
    enableFuzzyMatching: boolean;
    matchingTolerance: number;
    autoMatchThreshold: number;
    learningEnabled: boolean;
  };
  aiEnhancements: {
    enableAnomalyDetection: boolean;
    enablePatternRecognition: boolean;
    enableFraudDetection: boolean;
    enablePredictiveClearingDates: boolean;
  };
}

export class LiquidityOptimizationDto {
  optimizationId?: string;
  optimizationScope: {
    entities: string[];
    currencies: string[];
    timeHorizon: number; // days
    optimizationGoals: ('MAXIMIZE_YIELD' | 'MINIMIZE_RISK' | 'OPTIMIZE_LIQUIDITY' | 'MINIMIZE_COSTS')[];
  };
  currentLiquidityPosition: {
    totalCash: number;
    availableLiquidity: number;
    committedFacilities: number;
    contingentLiquidity: number;
  };
  liquidityRequirements: {
    operationalNeeds: {
      dailyAverage: number;
      peakRequirement: number;
      minimumBuffer: number;
    };
    strategicNeeds: {
      capitalExpenditures: number;
      acquisitions: number;
      dividends: number;
      debtRepayments: number;
    };
    contingencyNeeds: {
      emergencyFund: number;
      stressTestRequirement: number;
      regulatoryBuffer: number;
    };
  };
  investmentConstraints: {
    maximumMaturity: number;
    minimumRating: string;
    maximumConcentration: number;
    allowedInstruments: string[];
    prohibitedCounterparties?: string[];
  };
  optimizationAlgorithm: 'LINEAR_PROGRAMMING' | 'GENETIC_ALGORITHM' | 'MONTE_CARLO' | 'QUANTUM_ANNEALING';
  riskParameters: {
    riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
    maximumVaR: number;
    stressTestScenarios: string[];
  };
}

@ApiTags('Cash Management & Treasury')
@Controller('finance-accounting/cash-management')
@WebSocketGateway({
  cors: true,
  path: '/cash-socket',
  transports: ['websocket', 'polling']
})
@UseGuards(FinanceGuard)
@ApiBearerAuth()
export class CashManagementController {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CashManagementController.name);
  private activeCashSessions = new Map<string, any>();

  constructor(
    private readonly cashManagementService: CashManagementService,
    private readonly treasuryService: TreasuryService,
    private readonly cashFlowForecastingService: CashFlowForecastingService,
    private readonly bankReconciliationService: BankReconciliationService,
    private readonly investmentManagementService: InvestmentManagementService,
    private readonly liquidityOptimizationService: LiquidityOptimizationService,
  ) {}

  @Get('cash-position')
  @ApiOperation({
    summary: 'Get Current Cash Position',
    description: 'Retrieve real-time cash position across all accounts with liquidity and risk metrics',
  })
  @ApiQuery({ name: 'currency', required: false, description: 'Currency filter' })
  @ApiQuery({ name: 'asOfDate', required: false, description: 'Position as of date' })
  @ApiResponse({
    status: 200,
    description: 'Cash position retrieved successfully',
    schema: {
      example: {
        positionDate: '2024-03-01',
        currency: 'USD',
        totalCashPosition: 15750000,
        bankAccounts: [
          {
            accountId: 'BA_001',
            accountNumber: '****1234',
            bankName: 'Chase Bank',
            accountType: 'CHECKING',
            balance: {
              bookBalance: 5250000,
              availableBalance: 5100000,
              clearedBalance: 5000000,
              unclearedDeposits: 250000,
              outstandingChecks: 150000,
              pendingTransfers: 0
            },
            interestRate: 0.5,
            fees: {
              maintenanceFee: 0,
              transactionFees: 250,
              overdraftFees: 0,
              otherFees: 100
            }
          }
        ],
        cashEquivalents: [
          {
            instrumentType: 'MONEY_MARKET_FUND',
            instrumentId: 'MMF_001',
            amount: 3000000,
            interestRate: 4.25,
            liquidity: 'SAME_DAY'
          },
          {
            instrumentType: 'TREASURY_BILLS',
            instrumentId: 'TB_001',
            amount: 2500000,
            maturityDate: '2024-06-15',
            interestRate: 4.75,
            liquidity: 'T_PLUS_2'
          }
        ],
        liquidityMetrics: {
          immediatelyAvailable: 8100000,
          availableWithinDay: 11100000,
          availableWithinWeek: 13600000,
          totalLiquid: 15750000,
          liquidityRatio: 1.85
        },
        riskMetrics: {
          concentrationRisk: 0.25,
          counterpartyRisk: 0.15,
          interestRateRisk: 0.30,
          liquidityRisk: 0.10,
          overallRisk: 'LOW'
        },
        aiInsights: {
          optimizationOpportunities: [
            'Move $1M from checking to higher-yield money market for +$35K annual return',
            'Ladder Treasury bills to optimize liquidity and yield',
            'Consider overnight repos for excess cash above operating needs'
          ],
          riskAlerts: [],
          forecastedPosition: {
            next7Days: 16200000,
            next30Days: 17500000,
            next90Days: 18800000
          }
        }
      }
    }
  })
  async getCurrentCashPosition(
    @Query('currency') currency?: string,
    @Query('asOfDate') asOfDate?: string,
  ) {
    try {
      this.logger.log('Retrieving current cash position');
      
      const cashPosition = await this.cashManagementService.getCurrentCashPosition({
        currency: currency || 'USD',
        asOfDate: asOfDate || new Date().toISOString().split('T')[0],
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Cash position retrieved successfully',
        data: cashPosition,
      };
    } catch (error) {
      this.logger.error(`Cash position retrieval failed: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve cash position',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('cash-forecast')
  @ApiOperation({
    summary: 'Create Cash Flow Forecast',
    description: 'AI-powered cash flow forecasting with scenario analysis and machine learning optimization',
  })
  @ApiBody({ type: CashForecastDto })
  @ApiResponse({
    status: 201,
    description: 'Cash forecast created successfully'
  })
  async createCashForecast(@Body() forecastDto: CashForecastDto) {
    try {
      this.logger.log(`Creating cash forecast: ${forecastDto.forecastName}`);
      
      const forecast = await this.cashFlowForecastingService.createAdvancedForecast(forecastDto);
      
      // Emit real-time update
      this.server.emit('forecast-created', {
        forecastId: forecast.forecastId,
        forecastName: forecast.forecastName,
        horizon: forecast.forecastHorizon,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Cash forecast created successfully',
        data: forecast,
      };
    } catch (error) {
      this.logger.error(`Cash forecast creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create cash forecast',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('investments')
  @ApiOperation({
    summary: 'Create Investment',
    description: 'Create new investment with AI-powered risk assessment and portfolio optimization',
  })
  @ApiBody({ type: InvestmentDto })
  @ApiResponse({
    status: 201,
    description: 'Investment created successfully'
  })
  async createInvestment(@Body() investmentDto: InvestmentDto) {
    try {
      this.logger.log(`Creating investment: ${investmentDto.instrumentName}`);
      
      const investment = await this.investmentManagementService.createAdvancedInvestment(investmentDto);
      
      // Emit real-time update
      this.server.emit('investment-created', {
        investmentId: investment.investmentId,
        instrumentName: investment.instrumentName,
        amount: investment.investmentAmount,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Investment created successfully',
        data: investment,
      };
    } catch (error) {
      this.logger.error(`Investment creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create investment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('bank-reconciliation')
  @ApiOperation({
    summary: 'Perform Bank Reconciliation',
    description: 'AI-enhanced bank reconciliation with automatic matching and anomaly detection',
  })
  @ApiBody({ type: BankReconciliationDto })
  @ApiResponse({
    status: 200,
    description: 'Bank reconciliation completed successfully'
  })
  async performBankReconciliation(@Body() reconciliationDto: BankReconciliationDto) {
    try {
      this.logger.log(`Performing bank reconciliation for account: ${reconciliationDto.bankAccount.accountNumber}`);
      
      const reconciliation = await this.bankReconciliationService.performAdvancedReconciliation(reconciliationDto);
      
      // Emit real-time update
      this.server.emit('reconciliation-completed', {
        reconciliationId: reconciliation.reconciliationId,
        accountNumber: reconciliationDto.bankAccount.accountNumber,
        matchedItems: reconciliation.matchedItems,
        unmatchedItems: reconciliation.unmatchedItems,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Bank reconciliation completed successfully',
        data: reconciliation,
      };
    } catch (error) {
      this.logger.error(`Bank reconciliation failed: ${error.message}`);
      throw new HttpException(
        'Bank reconciliation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('liquidity-optimization')
  @ApiOperation({
    summary: 'Optimize Liquidity',
    description: 'Quantum-enhanced liquidity optimization with multi-objective optimization and risk management',
  })
  @ApiBody({ type: LiquidityOptimizationDto })
  @ApiResponse({
    status: 200,
    description: 'Liquidity optimization completed successfully'
  })
  async optimizeLiquidity(@Body() optimizationDto: LiquidityOptimizationDto) {
    try {
      this.logger.log('Performing liquidity optimization');
      
      const optimization = await this.liquidityOptimizationService.performAdvancedOptimization(optimizationDto);
      
      // Emit real-time update
      this.server.emit('liquidity-optimization-completed', {
        optimizationId: optimization.optimizationId,
        currentYield: optimization.currentYield,
        optimizedYield: optimization.optimizedYield,
        improvement: optimization.improvement,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Liquidity optimization completed successfully',
        data: optimization,
      };
    } catch (error) {
      this.logger.error(`Liquidity optimization failed: ${error.message}`);
      throw new HttpException(
        'Liquidity optimization failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('investment-portfolio')
  @ApiOperation({
    summary: 'Get Investment Portfolio',
    description: 'Comprehensive investment portfolio analysis with performance metrics and risk assessment',
  })
  @ApiQuery({ name: 'asOfDate', required: false, description: 'Portfolio as of date' })
  @ApiQuery({ name: 'currency', required: false, description: 'Reporting currency' })
  @ApiResponse({
    status: 200,
    description: 'Investment portfolio retrieved successfully'
  })
  async getInvestmentPortfolio(
    @Query('asOfDate') asOfDate?: string,
    @Query('currency') currency?: string,
  ) {
    try {
      this.logger.log('Retrieving investment portfolio');
      
      const portfolio = await this.investmentManagementService.getAdvancedPortfolio({
        asOfDate: asOfDate || new Date().toISOString().split('T')[0],
        currency: currency || 'USD',
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Investment portfolio retrieved successfully',
        data: portfolio,
      };
    } catch (error) {
      this.logger.error(`Investment portfolio retrieval failed: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve investment portfolio',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('treasury-analytics')
  @ApiOperation({
    summary: 'Get Treasury Analytics',
    description: 'Advanced treasury analytics with yield optimization, risk metrics, and market insights',
  })
  @ApiQuery({ name: 'analysisType', required: false, description: 'Type of analysis' })
  @ApiQuery({ name: 'timeframe', required: false, description: 'Analysis timeframe' })
  @ApiResponse({
    status: 200,
    description: 'Treasury analytics retrieved successfully'
  })
  async getTreasuryAnalytics(
    @Query('analysisType') analysisType?: string,
    @Query('timeframe') timeframe?: string,
  ) {
    try {
      this.logger.log('Generating treasury analytics');
      
      const analytics = await this.treasuryService.generateAdvancedAnalytics({
        analysisType: analysisType || 'COMPREHENSIVE',
        timeframe: timeframe || '12_MONTHS',
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Treasury analytics retrieved successfully',
        data: analytics,
      };
    } catch (error) {
      this.logger.error(`Treasury analytics generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate treasury analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('cash-dashboard')
  @ApiOperation({
    summary: 'Cash Management Dashboard',
    description: 'Comprehensive cash management dashboard with real-time positions, forecasts, and optimization recommendations',
  })
  @ApiResponse({
    status: 200,
    description: 'Cash dashboard data retrieved successfully'
  })
  async getCashDashboard() {
    try {
      const dashboard = await this.cashManagementService.generateCashDashboard();
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Cash dashboard generated successfully',
        data: dashboard,
      };
    } catch (error) {
      this.logger.error(`Cash dashboard generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate cash dashboard',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('quantum-yield-optimization')
  @ApiOperation({
    summary: 'Quantum Yield Optimization',
    description: 'Quantum-enhanced yield optimization across entire cash and investment portfolio',
  })
  @ApiResponse({
    status: 200,
    description: 'Quantum yield optimization completed successfully'
  })
  async performQuantumYieldOptimization(@Body() optimizationParams: any) {
    try {
      this.logger.log('Performing quantum yield optimization');
      
      const optimization = await this.treasuryService.performQuantumYieldOptimization(optimizationParams);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Quantum yield optimization completed successfully',
        data: optimization,
      };
    } catch (error) {
      this.logger.error(`Quantum yield optimization failed: ${error.message}`);
      throw new HttpException(
        'Quantum yield optimization failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // WebSocket handlers for real-time cash monitoring
  @SubscribeMessage('subscribe-cash-updates')
  handleCashSubscription(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const { accounts, investments, currencies } = data;
    accounts.forEach(account => client.join(`account_${account}`));
    investments.forEach(investment => client.join(`investment_${investment}`));
    currencies.forEach(currency => client.join(`currency_${currency}`));
    
    this.activeCashSessions.set(client.id, { accounts, investments, currencies });
    
    client.emit('subscription-confirmed', {
      accounts,
      investments,
      currencies,
      realTimeUpdates: true,
      aiForecasting: true,
      yieldOptimization: true,
      riskMonitoring: true,
      timestamp: new Date().toISOString()
    });
    
    this.logger.log(`Cash monitoring subscription: ${accounts.length} accounts, ${investments.length} investments`);
  }

  @SubscribeMessage('cash-forecast-request')
  async handleCashForecastRequest(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const forecast = await this.cashFlowForecastingService.generateRealTimeForecast(data);
      
      client.emit('forecast-update', {
        requestId: data.requestId,
        forecast,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time cash forecast failed: ${error.message}`);
      client.emit('error', { message: 'Cash forecast failed' });
    }
  }

  @SubscribeMessage('liquidity-alert')
  async handleLiquidityAlert(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const analysis = await this.liquidityOptimizationService.analyzeLiquidityRealTime(data);
      
      client.emit('liquidity-analysis', {
        alertId: data.alertId,
        analysis,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time liquidity analysis failed: ${error.message}`);
      client.emit('error', { message: 'Liquidity analysis failed' });
    }
  }

  @SubscribeMessage('investment-optimization')
  async handleInvestmentOptimization(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const optimization = await this.investmentManagementService.optimizePortfolioRealTime(data);
      
      client.emit('optimization-result', {
        requestId: data.requestId,
        optimization,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time investment optimization failed: ${error.message}`);
      client.emit('error', { message: 'Investment optimization failed' });
    }
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const cashSession = this.activeCashSessions.get(client.id);
    if (cashSession) {
      this.activeCashSessions.delete(client.id);
      this.logger.log(`Cash monitoring disconnection: ${cashSession.accounts.length} accounts`);
    }
  }
}
