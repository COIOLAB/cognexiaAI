// Industry 5.0 ERP Backend - Revolutionary Financial Reporting Engine Controller
// Automated Balance Sheet, P&L, Cash Flow generation with AI insights and regulatory compliance
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

import { FinancialReportingService } from '../services/financial-reporting.service';
import { FinanceGuard } from '../guards/finance.guard';

// DTOs for Financial Reporting
export class FinancialReportParametersDto {
  reportType: 'BALANCE_SHEET' | 'PROFIT_LOSS' | 'CASH_FLOW' | 'TRIAL_BALANCE' | 'STATEMENT_OF_EQUITY' | 'COMPREHENSIVE_INCOME' | 'NOTES_TO_ACCOUNTS';
  reportingDate: string;
  reportingPeriod: string;
  fiscalYear: string;
  currency: string;
  consolidationLevel: 'LEGAL_ENTITY' | 'BUSINESS_UNIT' | 'CONSOLIDATED' | 'COMBINED';
  reportingStandard: 'GAAP' | 'IFRS' | 'IND_AS' | 'LOCAL_GAAP' | 'REGULATORY';
  comparativePeriods?: {
    includePriorYear: boolean;
    includePriorQuarter: boolean;
    includeCustomPeriods?: string[];
  };
  dimensions?: {
    businessUnit?: string[];
    costCenter?: string[];
    profitCenter?: string[];
    geography?: string[];
    segment?: string[];
  };
  reportFormat: {
    template: 'STANDARD' | 'DETAILED' | 'SUMMARY' | 'REGULATORY' | 'CUSTOM';
    language: 'EN' | 'ES' | 'FR' | 'DE' | 'HI' | 'AR' | 'ZH' | 'JA';
    outputFormat: 'PDF' | 'EXCEL' | 'HTML' | 'JSON' | 'XML';
    includeGraphics: boolean;
    includeNotes: boolean;
    includeAnalysis: boolean;
  };
  aiEnhancements: {
    includeInsights: boolean;
    includePredictions: boolean;
    includeRiskAnalysis: boolean;
    includeBenchmarking: boolean;
    includeRecommendations: boolean;
    confidenceThreshold: number;
  };
  auditRequirements?: {
    auditTrail: boolean;
    supportingDocuments: boolean;
    reconciliations: boolean;
    approvals: boolean;
  };
}

export class BalanceSheetDto {
  reportingDate: string;
  reportingCurrency: string;
  assets: {
    currentAssets: {
      cashAndCashEquivalents: {
        amount: number;
        breakdown: {
          cash: number;
          bankBalances: number;
          shortTermInvestments: number;
        };
        agingAnalysis?: any;
      };
      accountsReceivable: {
        amount: number;
        breakdown: {
          tradeReceivables: number;
          otherReceivables: number;
          allowanceForDoubtfulDebts: number;
        };
        agingAnalysis: any;
      };
      inventory: {
        amount: number;
        breakdown: {
          rawMaterials: number;
          workInProgress: number;
          finishedGoods: number;
          spares: number;
        };
        valuationMethod: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE';
      };
      prepaidExpenses: number;
      otherCurrentAssets: number;
      totalCurrentAssets: number;
    };
    nonCurrentAssets: {
      propertyPlantEquipment: {
        amount: number;
        breakdown: {
          land: number;
          buildings: number;
          machinery: number;
          furniture: number;
          vehicles: number;
          accumulatedDepreciation: number;
        };
        depreciationPolicy: any;
      };
      intangibleAssets: {
        amount: number;
        breakdown: {
          goodwill: number;
          patents: number;
          trademarks: number;
          software: number;
          accumulatedAmortization: number;
        };
      };
      investments: {
        amount: number;
        breakdown: {
          subsidiaries: number;
          associates: number;
          availableForSale: number;
          heldToMaturity: number;
        };
      };
      deferredTaxAssets: number;
      otherNonCurrentAssets: number;
      totalNonCurrentAssets: number;
    };
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: {
      accountsPayable: {
        amount: number;
        breakdown: {
          tradePayables: number;
          otherPayables: number;
          accruedExpenses: number;
        };
        agingAnalysis: any;
      };
      shortTermBorrowings: {
        amount: number;
        breakdown: {
          bankOverdrafts: number;
          shortTermLoans: number;
          currentPortionLongTermDebt: number;
        };
      };
      provisions: {
        amount: number;
        breakdown: {
          warranty: number;
          legal: number;
          restructuring: number;
          other: number;
        };
      };
      taxLiabilities: number;
      otherCurrentLiabilities: number;
      totalCurrentLiabilities: number;
    };
    nonCurrentLiabilities: {
      longTermBorrowings: {
        amount: number;
        breakdown: {
          termLoans: number;
          bonds: number;
          debentures: number;
          leaseLiabilities: number;
        };
      };
      deferredTaxLiabilities: number;
      employeeBenefits: number;
      otherNonCurrentLiabilities: number;
      totalNonCurrentLiabilities: number;
    };
    totalLiabilities: number;
  };
  equity: {
    shareCapital: {
      amount: number;
      breakdown: {
        authorizedCapital: number;
        issuedCapital: number;
        paidUpCapital: number;
      };
    };
    reserves: {
      amount: number;
      breakdown: {
        capitalReserve: number;
        revenueReserve: number;
        revaluationReserve: number;
        foreignCurrencyTranslation: number;
      };
    };
    retainedEarnings: number;
    totalEquity: number;
  };
  totalLiabilitiesAndEquity: number;
  aiAnalysis: {
    liquidityRatios: {
      currentRatio: number;
      quickRatio: number;
      cashRatio: number;
    };
    leverageRatios: {
      debtToEquity: number;
      debtToAssets: number;
      equityRatio: number;
    };
    insights: string[];
    risks: string[];
    recommendations: string[];
  };
}

export class ProfitLossDto {
  reportingPeriod: string;
  reportingCurrency: string;
  revenue: {
    operatingRevenue: {
      amount: number;
      breakdown: {
        salesRevenue: number;
        serviceRevenue: number;
        otherOperatingRevenue: number;
      };
    };
    nonOperatingRevenue: {
      amount: number;
      breakdown: {
        investmentIncome: number;
        gainOnAssetSale: number;
        foreignExchangeGain: number;
        other: number;
      };
    };
    totalRevenue: number;
  };
  expenses: {
    costOfGoodsSold: {
      amount: number;
      breakdown: {
        materialCosts: number;
        laborCosts: number;
        manufacturingOverheads: number;
      };
    };
    operatingExpenses: {
      amount: number;
      breakdown: {
        sellingExpenses: number;
        adminExpenses: number;
        researchDevelopment: number;
        depreciation: number;
        amortization: number;
      };
    };
    financialExpenses: {
      amount: number;
      breakdown: {
        interestExpense: number;
        bankCharges: number;
        foreignExchangeLoss: number;
      };
    };
    otherExpenses: number;
    totalExpenses: number;
  };
  profitMetrics: {
    grossProfit: number;
    operatingProfit: number;
    profitBeforeTax: number;
    taxExpense: {
      currentTax: number;
      deferredTax: number;
      totalTax: number;
    };
    profitAfterTax: number;
    otherComprehensiveIncome: number;
    totalComprehensiveIncome: number;
  };
  earningsPerShare: {
    basic: number;
    diluted: number;
  };
  aiAnalysis: {
    profitabilityRatios: {
      grossProfitMargin: number;
      operatingProfitMargin: number;
      netProfitMargin: number;
    };
    trends: {
      revenueGrowth: number;
      profitGrowth: number;
      marginTrends: any;
    };
    insights: string[];
    forecasts: string[];
    recommendations: string[];
  };
}

export class CashFlowDto {
  reportingPeriod: string;
  reportingCurrency: string;
  operatingActivities: {
    profitBeforeTax: number;
    adjustments: {
      depreciation: number;
      amortization: number;
      provisionForDoubtfulDebts: number;
      gainLossOnAssetSale: number;
      interestExpense: number;
      dividendIncome: number;
      otherNonCashItems: number;
    };
    workingCapitalChanges: {
      tradeReceivables: number;
      inventory: number;
      tradePayables: number;
      otherWorkingCapital: number;
    };
    cashGeneratedFromOperations: number;
    directTaxesPaid: number;
    netCashFromOperatingActivities: number;
  };
  investingActivities: {
    assetPurchases: number;
    assetSales: number;
    investments: number;
    dividendReceived: number;
    interestReceived: number;
    netCashFromInvestingActivities: number;
  };
  financingActivities: {
    proceedsFromBorrowings: number;
    repaymentOfBorrowings: number;
    interestPaid: number;
    dividendsPaid: number;
    shareCapitalChanges: number;
    netCashFromFinancingActivities: number;
  };
  netCashFlow: number;
  openingCashBalance: number;
  closingCashBalance: number;
  aiAnalysis: {
    cashFlowRatios: {
      operatingCashFlowRatio: number;
      freeCashFlow: number;
      cashConversionCycle: number;
    };
    trends: any;
    insights: string[];
    forecasts: any;
    recommendations: string[];
  };
}

@ApiTags('Financial Reporting Engine')
@Controller('finance-accounting/financial-reporting')
@WebSocketGateway({
  cors: true,
  path: '/reporting-socket',
  transports: ['websocket', 'polling']
})
@UseGuards(FinanceGuard)
@ApiBearerAuth()
export class FinancialReportingController {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(FinancialReportingController.name);
  private activeReportingSessions = new Map<string, any>();

  constructor(
    private readonly financialReportingService: FinancialReportingService,
  ) {}

  @Post('generate-balance-sheet')
  @ApiOperation({
    summary: 'Generate Balance Sheet',
    description: 'Automatically generate Balance Sheet with AI analysis, compliance validation, and multi-format output',
  })
  @ApiBody({ type: FinancialReportParametersDto })
  @ApiResponse({
    status: 200,
    description: 'Balance Sheet generated successfully',
    schema: {
      example: {
        reportId: 'BS_2024_Q1_001',
        reportType: 'BALANCE_SHEET',
        reportingDate: '2024-03-31',
        reportingCurrency: 'USD',
        generatedAt: '2024-04-01T10:00:00Z',
        balanceSheet: {
          assets: {
            currentAssets: {
              totalCurrentAssets: 15000000,
              cashAndCashEquivalents: {
                amount: 5000000,
                breakdown: {
                  cash: 1000000,
                  bankBalances: 3000000,
                  shortTermInvestments: 1000000
                }
              },
              accountsReceivable: {
                amount: 7000000,
                breakdown: {
                  tradeReceivables: 7500000,
                  allowanceForDoubtfulDebts: -500000
                }
              },
              inventory: {
                amount: 3000000,
                valuationMethod: 'WEIGHTED_AVERAGE'
              }
            },
            nonCurrentAssets: {
              totalNonCurrentAssets: 25000000,
              propertyPlantEquipment: {
                amount: 20000000,
                breakdown: {
                  land: 5000000,
                  buildings: 10000000,
                  machinery: 8000000,
                  accumulatedDepreciation: -3000000
                }
              }
            },
            totalAssets: 40000000
          },
          liabilities: {
            currentLiabilities: {
              totalCurrentLiabilities: 8000000,
              accountsPayable: {
                amount: 5000000
              },
              shortTermBorrowings: {
                amount: 3000000
              }
            },
            nonCurrentLiabilities: {
              totalNonCurrentLiabilities: 12000000,
              longTermBorrowings: {
                amount: 10000000
              }
            },
            totalLiabilities: 20000000
          },
          equity: {
            totalEquity: 20000000,
            shareCapital: {
              amount: 10000000
            },
            retainedEarnings: 10000000
          },
          totalLiabilitiesAndEquity: 40000000
        },
        aiAnalysis: {
          liquidityRatios: {
            currentRatio: 1.875,
            quickRatio: 1.5,
            cashRatio: 0.625
          },
          leverageRatios: {
            debtToEquity: 1.0,
            debtToAssets: 0.5,
            equityRatio: 0.5
          },
          insights: [
            'Strong liquidity position with current ratio above industry average',
            'Balanced capital structure with moderate leverage',
            'Healthy cash reserves supporting operational flexibility'
          ],
          risks: [
            'Monitor accounts receivable aging for collection efficiency',
            'Consider debt refinancing opportunities with current low rates'
          ],
          recommendations: [
            'Optimize cash deployment for higher returns',
            'Evaluate inventory turnover for working capital efficiency'
          ]
        },
        compliance: {
          gaapCompliant: true,
          ifrsCompliant: true,
          auditReady: true,
          regulatoryCompliant: true
        },
        exportFormats: {
          pdf: 'base64_pdf_data',
          excel: 'base64_excel_data',
          html: 'formatted_html_content'
        }
      }
    }
  })
  async generateBalanceSheet(@Body() reportParams: FinancialReportParametersDto) {
    try {
      this.logger.log(`Generating Balance Sheet for date: ${reportParams.reportingDate}`);
      
      const balanceSheet = await this.balanceSheetService.generateAdvancedBalanceSheet(reportParams);
      
      // Emit real-time update
      this.server.emit('balance-sheet-generated', {
        reportId: balanceSheet.reportId,
        reportingDate: reportParams.reportingDate,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Balance Sheet generated successfully',
        data: balanceSheet,
      };
    } catch (error) {
      this.logger.error(`Balance Sheet generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate Balance Sheet',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('generate-profit-loss')
  @ApiOperation({
    summary: 'Generate Profit & Loss Statement',
    description: 'Automatically generate P&L with detailed breakdowns, AI insights, and trend analysis',
  })
  @ApiBody({ type: FinancialReportParametersDto })
  @ApiResponse({
    status: 200,
    description: 'Profit & Loss Statement generated successfully'
  })
  async generateProfitLoss(@Body() reportParams: FinancialReportParametersDto) {
    try {
      this.logger.log(`Generating P&L for period: ${reportParams.reportingPeriod}`);
      
      const profitLoss = await this.profitLossService.generateAdvancedProfitLoss(reportParams);
      
      // Emit real-time update
      this.server.emit('profit-loss-generated', {
        reportId: profitLoss.reportId,
        reportingPeriod: reportParams.reportingPeriod,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Profit & Loss Statement generated successfully',
        data: profitLoss,
      };
    } catch (error) {
      this.logger.error(`P&L generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate P&L Statement',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('generate-cash-flow')
  @ApiOperation({
    summary: 'Generate Cash Flow Statement',
    description: 'Automatically generate Cash Flow Statement with operating, investing, and financing activities',
  })
  @ApiBody({ type: FinancialReportParametersDto })
  @ApiResponse({
    status: 200,
    description: 'Cash Flow Statement generated successfully'
  })
  async generateCashFlow(@Body() reportParams: FinancialReportParametersDto) {
    try {
      this.logger.log(`Generating Cash Flow for period: ${reportParams.reportingPeriod}`);
      
      const cashFlow = await this.cashFlowService.generateAdvancedCashFlow(reportParams);
      
      // Emit real-time update
      this.server.emit('cash-flow-generated', {
        reportId: cashFlow.reportId,
        reportingPeriod: reportParams.reportingPeriod,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Cash Flow Statement generated successfully',
        data: cashFlow,
      };
    } catch (error) {
      this.logger.error(`Cash Flow generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate Cash Flow Statement',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('generate-complete-financial-statements')
  @ApiOperation({
    summary: 'Generate Complete Financial Statements',
    description: 'Generate all financial statements (Balance Sheet, P&L, Cash Flow) with consolidated analysis',
  })
  @ApiBody({ type: FinancialReportParametersDto })
  @ApiResponse({
    status: 200,
    description: 'Complete financial statements generated successfully'
  })
  async generateCompleteFinancialStatements(@Body() reportParams: FinancialReportParametersDto) {
    try {
      this.logger.log(`Generating complete financial statements for: ${reportParams.reportingPeriod}`);
      
      const financialStatements = await this.financialReportingService.generateCompleteFinancialStatements(reportParams);
      
      // Emit real-time update
      this.server.emit('financial-statements-generated', {
        reportId: financialStatements.reportId,
        reportingPeriod: reportParams.reportingPeriod,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Complete financial statements generated successfully',
        data: financialStatements,
      };
    } catch (error) {
      this.logger.error(`Financial statements generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate financial statements',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('finalize-balance-sheet')
  @ApiOperation({
    summary: 'Finalize Balance Sheet',
    description: 'AI-powered balance sheet finalization with automated adjustments and compliance validation',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance sheet finalized successfully'
  })
  async finalizeBalanceSheet(@Body() finalizationData: any) {
    try {
      this.logger.log(`Finalizing balance sheet for: ${finalizationData.reportingDate}`);
      
      const finalizedBalanceSheet = await this.balanceSheetService.finalizeBalanceSheetWithAI(finalizationData);
      
      // Emit real-time update
      this.server.emit('balance-sheet-finalized', {
        reportId: finalizedBalanceSheet.reportId,
        status: 'FINALIZED',
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Balance sheet finalized successfully',
        data: finalizedBalanceSheet,
      };
    } catch (error) {
      this.logger.error(`Balance sheet finalization failed: ${error.message}`);
      throw new HttpException(
        'Failed to finalize balance sheet',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('regulatory-reports')
  @ApiOperation({
    summary: 'Generate Regulatory Reports',
    description: 'Generate regulatory-compliant reports for various jurisdictions and authorities',
  })
  @ApiQuery({ name: 'jurisdiction', required: true, description: 'Reporting jurisdiction' })
  @ApiQuery({ name: 'reportType', required: true, description: 'Regulatory report type' })
  @ApiQuery({ name: 'period', required: true, description: 'Reporting period' })
  @ApiResponse({
    status: 200,
    description: 'Regulatory reports generated successfully'
  })
  async generateRegulatoryReports(
    @Query('jurisdiction') jurisdiction: string,
    @Query('reportType') reportType: string,
    @Query('period') period: string,
  ) {
    try {
      this.logger.log(`Generating regulatory report: ${reportType} for ${jurisdiction}`);
      
      const regulatoryReports = await this.regulatoryReportingService.generateRegulatoryReports({
        jurisdiction,
        reportType,
        period,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Regulatory reports generated successfully',
        data: regulatoryReports,
      };
    } catch (error) {
      this.logger.error(`Regulatory report generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate regulatory reports',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('financial-analysis')
  @ApiOperation({
    summary: 'Comprehensive Financial Analysis',
    description: 'AI-powered comprehensive financial analysis with insights, predictions, and recommendations',
  })
  @ApiQuery({ name: 'analysisType', required: false, description: 'Type of analysis' })
  @ApiQuery({ name: 'period', required: false, description: 'Analysis period' })
  @ApiResponse({
    status: 200,
    description: 'Financial analysis completed successfully'
  })
  async performFinancialAnalysis(
    @Query('analysisType') analysisType?: string,
    @Query('period') period?: string,
  ) {
    try {
      this.logger.log('Performing comprehensive financial analysis');
      
      const analysis = await this.financialReportingService.performAIFinancialAnalysis({
        analysisType: analysisType || 'COMPREHENSIVE',
        period: period || 'CURRENT',
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Financial analysis completed successfully',
        data: analysis,
      };
    } catch (error) {
      this.logger.error(`Financial analysis failed: ${error.message}`);
      throw new HttpException(
        'Financial analysis failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('reporting-dashboard')
  @ApiOperation({
    summary: 'Financial Reporting Dashboard',
    description: 'Real-time financial reporting dashboard with KPIs, trends, and executive summary',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporting dashboard data retrieved successfully'
  })
  async getReportingDashboard() {
    try {
      const dashboard = await this.financialReportingService.generateReportingDashboard();
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Reporting dashboard generated successfully',
        data: dashboard,
      };
    } catch (error) {
      this.logger.error(`Reporting dashboard generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate reporting dashboard',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // WebSocket handlers for real-time reporting
  @SubscribeMessage('subscribe-reporting-updates')
  handleReportingSubscription(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const { reportTypes, periods } = data;
    reportTypes.forEach(type => client.join(`reports_${type}`));
    periods.forEach(period => client.join(`period_${period}`));
    
    this.activeReportingSessions.set(client.id, { reportTypes, periods });
    
    client.emit('subscription-confirmed', {
      reportTypes,
      periods,
      realTimeUpdates: true,
      aiInsights: true,
      timestamp: new Date().toISOString()
    });
    
    this.logger.log(`Reporting monitoring subscription: ${reportTypes.join(', ')}`);
  }

  @SubscribeMessage('generate-report-realtime')
  async handleRealtimeReportGeneration(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      let report;
      
      switch (data.reportType) {
        case 'BALANCE_SHEET':
          report = await this.balanceSheetService.generateAdvancedBalanceSheet(data.parameters);
          break;
        case 'PROFIT_LOSS':
          report = await this.profitLossService.generateAdvancedProfitLoss(data.parameters);
          break;
        case 'CASH_FLOW':
          report = await this.cashFlowService.generateAdvancedCashFlow(data.parameters);
          break;
        default:
          throw new Error('Unsupported report type');
      }
      
      client.emit('report-generated', {
        requestId: data.requestId,
        report,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time report generation failed: ${error.message}`);
      client.emit('error', { message: 'Report generation failed' });
    }
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const reportingSession = this.activeReportingSessions.get(client.id);
    if (reportingSession) {
      this.activeReportingSessions.delete(client.id);
      this.logger.log(`Reporting monitoring disconnection: ${reportingSession.reportTypes.join(', ')}`);
    }
  }
}
