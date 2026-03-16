// Industry 5.0 ERP Backend - Revolutionary General Ledger Controller
// AI-powered automated posting, real-time balancing, and intelligent error detection
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

import { GeneralLedgerService } from '../services/general-ledger.service';
import { JournalEntryService } from '../services/journal-entry.service';
import { PostingEngineService } from '../services/posting-engine.service';
import { BalancingService } from '../services/balancing.service';
import { FinanceGuard } from '../guards/finance.guard';

// DTOs for General Ledger
export class JournalEntryDto {
  entryId?: string;
  entryType: 'MANUAL' | 'AUTOMATED' | 'REVERSAL' | 'ADJUSTMENT' | 'CLOSING' | 'OPENING';
  transactionDate: string;
  postingDate: string;
  period: string;
  fiscalYear: string;
  reference: string;
  description: string;
  sourceDocument?: {
    documentType: 'INVOICE' | 'RECEIPT' | 'VOUCHER' | 'BANK_STATEMENT' | 'CONTRACT' | 'OTHER';
    documentNumber: string;
    documentDate: string;
    attachments?: string[];
  };
  currency: string;
  exchangeRate?: number;
  businessUnit?: string;
  costCenter?: string;
  profitCenter?: string;
  project?: string;
  department?: string;
  location?: string;
  journalLines: {
    lineNumber: number;
    accountId: string;
    accountCode: string;
    accountName: string;
    debitAmount: number;
    creditAmount: number;
    localCurrencyDebit: number;
    localCurrencyCredit: number;
    description: string;
    dimensions?: {
      costCenter?: string;
      profitCenter?: string;
      product?: string;
      customer?: string;
      supplier?: string;
      project?: string;
      campaign?: string;
      customDimensions?: Record<string, string>;
    };
    taxInformation?: {
      taxCode: string;
      taxRate: number;
      taxAmount: number;
      taxableAmount: number;
    };
    quantity?: number;
    unitOfMeasure?: string;
    unitPrice?: number;
    dueDate?: string;
    paymentTerms?: string;
  }[];
  approvalWorkflow?: {
    requiredApprovals: string[];
    currentApprover?: string;
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    approvalHistory: {
      approver: string;
      action: 'APPROVED' | 'REJECTED' | 'RETURNED';
      date: string;
      comments?: string;
    }[];
  };
  aiValidation?: {
    confidenceScore: number;
    anomalyFlags: string[];
    suggestions: string[];
    riskAssessment: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  auditTrail: {
    createdBy: string;
    createdDate: string;
    lastModifiedBy?: string;
    lastModifiedDate?: string;
    postingStatus: 'DRAFT' | 'POSTED' | 'REVERSED' | 'CANCELLED';
    postingReference?: string;
    reversalReference?: string;
  };
}

export class PostingRulesDto {
  ruleId?: string;
  ruleName: string;
  sourceModule: 'AP' | 'AR' | 'INVENTORY' | 'PAYROLL' | 'ASSETS' | 'BANKING' | 'SALES' | 'PURCHASE';
  sourceTransactionType: string;
  conditions: {
    accountFilters?: string[];
    amountRange?: { min: number; max: number };
    dateRange?: { from: string; to: string };
    dimensionFilters?: Record<string, string[]>;
    businessRules?: string[];
  };
  postingTemplate: {
    templateName: string;
    journalEntryType: string;
    description: string;
    accountMappings: {
      sourceField: string;
      targetAccount: string;
      debitCredit: 'DEBIT' | 'CREDIT';
      formula?: string;
      conditions?: string[];
    }[];
    dimensionMappings: {
      sourceDimension: string;
      targetDimension: string;
      defaultValue?: string;
      validationRules?: string[];
    }[];
  };
  automationSettings: {
    autoPost: boolean;
    requiresApproval: boolean;
    approvalThreshold?: number;
    approvers?: string[];
    scheduledPosting?: {
      enabled: boolean;
      frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
      executionTime: string;
    };
  };
  aiOptimization: {
    learningEnabled: boolean;
    adaptiveRules: boolean;
    anomalyDetection: boolean;
    patternRecognition: boolean;
  };
}

export class TrialBalanceDto {
  asOfDate: string;
  period: string;
  fiscalYear: string;
  includeZeroBalances: boolean;
  accountHierarchy: boolean;
  currency: string;
  consolidationLevel: 'LEGAL_ENTITY' | 'BUSINESS_UNIT' | 'COST_CENTER' | 'CONSOLIDATED';
  dimensions?: {
    costCenter?: string[];
    profitCenter?: string[];
    businessUnit?: string[];
    project?: string[];
  };
  reportingFormat: 'STANDARD' | 'COMPARATIVE' | 'DETAILED' | 'SUMMARY';
  aiAnalysis: {
    includeVarianceAnalysis: boolean;
    includeTrendAnalysis: boolean;
    includeAnomalyDetection: boolean;
    includeRiskAssessment: boolean;
  };
}

@ApiTags('General Ledger Management')
@Controller('finance-accounting/general-ledger')
@WebSocketGateway({
  cors: true,
  path: '/gl-socket',
  transports: ['websocket', 'polling']
})
@UseGuards(FinanceGuard)
@ApiBearerAuth()
export class GeneralLedgerController {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GeneralLedgerController.name);
  private activeGLSessions = new Map<string, any>();

  constructor(
    private readonly generalLedgerService: GeneralLedgerService,
    private readonly journalEntryService: JournalEntryService,
    private readonly postingEngineService: PostingEngineService,
    private readonly balancingService: BalancingService,
  ) {}

  @Post('journal-entries')
  @ApiOperation({
    summary: 'Create Journal Entry',
    description: 'Create a new journal entry with AI validation and automated posting rules',
  })
  @ApiBody({ type: JournalEntryDto })
  @ApiResponse({
    status: 201,
    description: 'Journal entry created successfully',
    schema: {
      example: {
        entryId: 'JE_2024_000001',
        entryNumber: 'JE-2024-000001',
        entryType: 'MANUAL',
        transactionDate: '2024-03-01',
        postingDate: '2024-03-01',
        period: '202403',
        fiscalYear: '2024',
        currency: 'USD',
        totalDebit: 100000,
        totalCredit: 100000,
        balanced: true,
        journalLines: [
          {
            lineNumber: 1,
            accountCode: '1000.100',
            accountName: 'Cash - USD',
            debitAmount: 100000,
            creditAmount: 0,
            localCurrencyDebit: 100000,
            description: 'Cash receipt from customer',
            dimensions: {
              costCenter: 'CC001',
              customer: 'CUST_001'
            }
          },
          {
            lineNumber: 2,
            accountCode: '1200.100',
            accountName: 'Accounts Receivable - Trade',
            debitAmount: 0,
            creditAmount: 100000,
            localCurrencyCredit: 100000,
            description: 'Payment received from customer',
            dimensions: {
              costCenter: 'CC001',
              customer: 'CUST_001'
            }
          }
        ],
        aiValidation: {
          confidenceScore: 0.96,
          anomalyFlags: [],
          suggestions: [
            'Consider setting up automated posting rule for similar transactions',
            'Verify customer payment terms for early payment discounts'
          ],
          riskAssessment: 'LOW'
        },
        postingStatus: 'POSTED',
        postingReference: 'POST_2024_000001',
        auditTrail: {
          createdBy: 'USER_001',
          createdDate: '2024-03-01T10:30:00Z',
          postedBy: 'SYSTEM',
          postedDate: '2024-03-01T10:30:15Z'
        }
      }
    }
  })
  async createJournalEntry(@Body() journalEntryDto: JournalEntryDto) {
    try {
      this.logger.log(`Creating journal entry: ${journalEntryDto.reference}`);
      
      const journalEntry = await this.journalEntryService.createAdvancedJournalEntry(journalEntryDto);
      
      // Emit real-time update
      this.server.emit('journal-entry-created', {
        entryId: journalEntry.entryId,
        reference: journalEntry.reference,
        amount: journalEntry.totalDebit,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Journal entry created successfully',
        data: journalEntry,
      };
    } catch (error) {
      this.logger.error(`Journal entry creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create journal entry',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('journal-entries/:id/post')
  @ApiOperation({
    summary: 'Post Journal Entry',
    description: 'Post journal entry to general ledger with AI validation and automatic balancing',
  })
  @ApiParam({ name: 'id', description: 'Journal Entry ID' })
  @ApiResponse({
    status: 200,
    description: 'Journal entry posted successfully'
  })
  async postJournalEntry(@Param('id') entryId: string) {
    try {
      this.logger.log(`Posting journal entry: ${entryId}`);
      
      const postingResult = await this.postingEngineService.postJournalEntry(entryId);
      
      // Emit real-time update
      this.server.emit('journal-entry-posted', {
        entryId,
        postingReference: postingResult.postingReference,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Journal entry posted successfully',
        data: postingResult,
      };
    } catch (error) {
      this.logger.error(`Journal entry posting failed: ${error.message}`);
      throw new HttpException(
        'Failed to post journal entry',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('posting-rules')
  @ApiOperation({
    summary: 'Create Posting Rules',
    description: 'Create automated posting rules with AI optimization and learning capabilities',
  })
  @ApiBody({ type: PostingRulesDto })
  @ApiResponse({
    status: 201,
    description: 'Posting rules created successfully'
  })
  async createPostingRules(@Body() postingRulesDto: PostingRulesDto) {
    try {
      this.logger.log(`Creating posting rules: ${postingRulesDto.ruleName}`);
      
      const postingRules = await this.postingEngineService.createAdvancedPostingRules(postingRulesDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Posting rules created successfully',
        data: postingRules,
      };
    } catch (error) {
      this.logger.error(`Posting rules creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create posting rules',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('trial-balance')
  @ApiOperation({
    summary: 'Generate Trial Balance',
    description: 'Generate trial balance with AI analysis and variance detection',
  })
  @ApiQuery({ name: 'asOfDate', required: true, description: 'As of date for trial balance' })
  @ApiQuery({ name: 'period', required: false, description: 'Accounting period' })
  @ApiQuery({ name: 'currency', required: false, description: 'Reporting currency' })
  @ApiResponse({
    status: 200,
    description: 'Trial balance generated successfully'
  })
  async generateTrialBalance(
    @Query('asOfDate') asOfDate: string,
    @Query('period') period?: string,
    @Query('currency') currency?: string,
  ) {
    try {
      this.logger.log(`Generating trial balance as of: ${asOfDate}`);
      
      const trialBalance = await this.generalLedgerService.generateAdvancedTrialBalance({
        asOfDate,
        period,
        currency: currency || 'USD',
        includeZeroBalances: false,
        accountHierarchy: true,
        consolidationLevel: 'LEGAL_ENTITY',
        reportingFormat: 'STANDARD',
        aiAnalysis: {
          includeVarianceAnalysis: true,
          includeTrendAnalysis: true,
          includeAnomalyDetection: true,
          includeRiskAssessment: true,
        },
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Trial balance generated successfully',
        data: trialBalance,
      };
    } catch (error) {
      this.logger.error(`Trial balance generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate trial balance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('account-balances/:accountId')
  @ApiOperation({
    summary: 'Get Account Balance',
    description: 'Get real-time account balance with drill-down capabilities and AI insights',
  })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiQuery({ name: 'asOfDate', required: false, description: 'Balance as of date' })
  @ApiQuery({ name: 'includeDimensions', required: false, description: 'Include dimensional breakdown' })
  @ApiResponse({
    status: 200,
    description: 'Account balance retrieved successfully'
  })
  async getAccountBalance(
    @Param('accountId') accountId: string,
    @Query('asOfDate') asOfDate?: string,
    @Query('includeDimensions') includeDimensions?: boolean,
  ) {
    try {
      this.logger.log(`Getting account balance for: ${accountId}`);
      
      const accountBalance = await this.generalLedgerService.getAdvancedAccountBalance({
        accountId,
        asOfDate: asOfDate || new Date().toISOString().split('T')[0],
        includeDimensions: includeDimensions || false,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Account balance retrieved successfully',
        data: accountBalance,
      };
    } catch (error) {
      this.logger.error(`Account balance retrieval failed: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve account balance',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('period-close')
  @ApiOperation({
    summary: 'Perform Period Close',
    description: 'Automated period close with AI validation and balance verification',
  })
  @ApiResponse({
    status: 200,
    description: 'Period close completed successfully'
  })
  async performPeriodClose(@Body() periodCloseData: any) {
    try {
      this.logger.log(`Performing period close for: ${periodCloseData.period}`);
      
      const periodCloseResult = await this.generalLedgerService.performAIPeriodClose(periodCloseData);
      
      // Emit real-time update
      this.server.emit('period-close-completed', {
        period: periodCloseData.period,
        status: periodCloseResult.status,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Period close completed successfully',
        data: periodCloseResult,
      };
    } catch (error) {
      this.logger.error(`Period close failed: ${error.message}`);
      throw new HttpException(
        'Period close failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('balance-validation')
  @ApiOperation({
    summary: 'Validate GL Balances',
    description: 'AI-powered balance validation with anomaly detection and error correction',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance validation completed successfully'
  })
  async validateGLBalances(@Body() validationParams: any) {
    try {
      this.logger.log('Performing GL balance validation');
      
      const validation = await this.balancingService.performAIBalanceValidation(validationParams);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Balance validation completed successfully',
        data: validation,
      };
    } catch (error) {
      this.logger.error(`Balance validation failed: ${error.message}`);
      throw new HttpException(
        'Balance validation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('ledger-analysis')
  @ApiOperation({
    summary: 'AI Ledger Analysis',
    description: 'Comprehensive AI analysis of general ledger with insights and recommendations',
  })
  @ApiQuery({ name: 'analysisType', required: false, description: 'Type of analysis' })
  @ApiQuery({ name: 'period', required: false, description: 'Analysis period' })
  @ApiResponse({
    status: 200,
    description: 'Ledger analysis completed successfully'
  })
  async performLedgerAnalysis(
    @Query('analysisType') analysisType?: string,
    @Query('period') period?: string,
  ) {
    try {
      this.logger.log('Performing AI ledger analysis');
      
      const analysis = await this.generalLedgerService.performAILedgerAnalysis({
        analysisType: analysisType || 'COMPREHENSIVE',
        period: period || 'CURRENT',
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Ledger analysis completed successfully',
        data: analysis,
      };
    } catch (error) {
      this.logger.error(`Ledger analysis failed: ${error.message}`);
      throw new HttpException(
        'Ledger analysis failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('gl-dashboard')
  @ApiOperation({
    summary: 'General Ledger Dashboard',
    description: 'Real-time GL dashboard with KPIs, trends, and AI insights',
  })
  @ApiResponse({
    status: 200,
    description: 'GL dashboard data retrieved successfully'
  })
  async getGLDashboard() {
    try {
      const dashboard = await this.generalLedgerService.generateGLDashboard();
      
      return {
        statusCode: HttpStatus.OK,
        message: 'GL dashboard generated successfully',
        data: dashboard,
      };
    } catch (error) {
      this.logger.error(`GL dashboard generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate GL dashboard',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // WebSocket handlers for real-time GL monitoring
  @SubscribeMessage('subscribe-gl-updates')
  handleGLSubscription(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const { accounts, periods, currencies } = data;
    accounts.forEach(account => client.join(`gl_${account}`));
    periods.forEach(period => client.join(`period_${period}`));
    currencies.forEach(currency => client.join(`currency_${currency}`));
    
    this.activeGLSessions.set(client.id, { accounts, periods, currencies });
    
    client.emit('subscription-confirmed', {
      accounts,
      periods,
      currencies,
      realTimeUpdates: true,
      aiMonitoring: true,
      timestamp: new Date().toISOString()
    });
    
    this.logger.log(`GL monitoring subscription: ${accounts.length} accounts`);
  }

  @SubscribeMessage('validate-journal-entry')
  async handleJournalValidation(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const validation = await this.journalEntryService.validateRealTime(data);
      
      client.emit('validation-result', {
        requestId: data.requestId,
        validation,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time journal validation failed: ${error.message}`);
      client.emit('error', { message: 'Journal validation failed' });
    }
  }

  @SubscribeMessage('balance-check')
  async handleBalanceCheck(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const balanceCheck = await this.balancingService.performRealTimeBalanceCheck(data);
      
      client.emit('balance-status', {
        checkId: data.checkId,
        balanceCheck,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Balance check failed: ${error.message}`);
      client.emit('error', { message: 'Balance check failed' });
    }
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const glSession = this.activeGLSessions.get(client.id);
    if (glSession) {
      this.activeGLSessions.delete(client.id);
      this.logger.log(`GL monitoring disconnection: ${glSession.accounts.length} accounts`);
    }
  }
}
