// Industry 5.0 ERP Backend - Advanced Accounts Payable & Receivable Controller
// Revolutionary AP/AR with automated matching, payment processing, and AI collection management
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

import { AccountsPayableService } from '../services/accounts-payable.service';
import { AccountsReceivableService } from '../services/accounts-receivable.service';
import { PaymentProcessingService } from '../services/payment-processing.service';
import { CollectionManagementService } from '../services/collection-management.service';
import { MatchingEngineService } from '../services/matching-engine.service';
import { FinanceGuard } from '../guards/finance.guard';

// DTOs for Accounts Payable & Receivable
export class InvoiceDto {
  invoiceId?: string;
  invoiceNumber: string;
  invoiceType: 'SUPPLIER' | 'CUSTOMER' | 'CREDIT_NOTE' | 'DEBIT_NOTE' | 'PROFORMA';
  partyId: string;
  partyName: string;
  partyType: 'SUPPLIER' | 'CUSTOMER';
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  currency: string;
  exchangeRate?: number;
  purchaseOrder?: {
    poNumber: string;
    poDate: string;
    poAmount: number;
  };
  invoiceLines: {
    lineNumber: number;
    itemCode?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    lineAmount: number;
    taxCode: string;
    taxRate: number;
    taxAmount: number;
    accountCode: string;
    dimensions?: {
      costCenter?: string;
      profitCenter?: string;
      project?: string;
      department?: string;
    };
  }[];
  subtotal: number;
  totalTax: number;
  totalAmount: number;
  discounts?: {
    earlyPaymentDiscount: number;
    volumeDiscount: number;
    otherDiscounts: number;
  };
  attachments?: {
    originalInvoice: string;
    deliveryNote: string;
    supportingDocuments: string[];
  };
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
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'DISPUTED';
  aiValidation?: {
    duplicateCheck: boolean;
    priceVarianceAnalysis: any;
    fraudDetection: any;
    complianceValidation: any;
    riskAssessment: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

export class PaymentDto {
  paymentId?: string;
  paymentType: 'OUTGOING' | 'INCOMING';
  paymentMethod: 'BANK_TRANSFER' | 'CHECK' | 'CASH' | 'CREDIT_CARD' | 'WIRE' | 'ACH' | 'DIGITAL_WALLET';
  partyId: string;
  partyName: string;
  paymentDate: string;
  currency: string;
  exchangeRate?: number;
  amount: number;
  localCurrencyAmount: number;
  bankAccount?: {
    accountNumber: string;
    bankName: string;
    routingNumber: string;
    swiftCode?: string;
  };
  reference: string;
  description: string;
  paymentLines: {
    invoiceId: string;
    invoiceNumber: string;
    invoiceAmount: number;
    paymentAmount: number;
    discountTaken?: number;
    writeOffAmount?: number;
  }[];
  approvalStatus: 'PENDING' | 'APPROVED' | 'PROCESSED' | 'REJECTED';
  processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  fees?: {
    bankFees: number;
    processingFees: number;
    foreignExchangeFees: number;
  };
  aiOptimization?: {
    paymentTiming: any;
    discountOptimization: any;
    cashFlowImpact: any;
    riskAssessment: any;
  };
}

export class AgingAnalysisDto {
  analysisDate: string;
  partyType: 'SUPPLIER' | 'CUSTOMER';
  currency: string;
  agingBuckets: {
    current: {
      amount: number;
      count: number;
      percentage: number;
    };
    days1to30: {
      amount: number;
      count: number;
      percentage: number;
    };
    days31to60: {
      amount: number;
      count: number;
      percentage: number;
    };
    days61to90: {
      amount: number;
      count: number;
      percentage: number;
    };
    over90Days: {
      amount: number;
      count: number;
      percentage: number;
    };
  };
  totalOutstanding: number;
  partyWiseAnalysis: {
    partyId: string;
    partyName: string;
    totalOutstanding: number;
    agingBreakdown: any;
    creditLimit: number;
    creditRating: string;
    paymentHistory: any;
    riskScore: number;
  }[];
  aiInsights: {
    collectionPriority: any[];
    riskAnalysis: any;
    paymentPredictions: any;
    recommendations: string[];
  };
}

export class CollectionStrategyDto {
  strategyId?: string;
  partyId: string;
  partyName: string;
  outstandingAmount: number;
  overdueAmount: number;
  daysPastDue: number;
  collectionActions: {
    actionType: 'EMAIL_REMINDER' | 'PHONE_CALL' | 'LETTER' | 'LEGAL_NOTICE' | 'COLLECTION_AGENCY';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    scheduledDate: string;
    assignedTo: string;
    template?: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
  }[];
  paymentPlan?: {
    installments: {
      installmentNumber: number;
      dueDate: string;
      amount: number;
      status: 'PENDING' | 'PAID' | 'OVERDUE';
    }[];
    interestRate?: number;
    penaltyCharges?: number;
  };
  aiRecommendations: {
    optimalStrategy: string;
    successProbability: number;
    estimatedCollectionTime: number;
    recommendedActions: string[];
    riskFactors: string[];
  };
}

@ApiTags('Accounts Payable & Receivable')
@Controller('finance-accounting/ap-ar')
@WebSocketGateway({
  cors: true,
  path: '/ap-ar-socket',
  transports: ['websocket', 'polling']
})
@UseGuards(FinanceGuard)
@ApiBearerAuth()
export class AccountsPayableReceivableController {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AccountsPayableReceivableController.name);
  private activeAPARSessions = new Map<string, any>();

  constructor(
    private readonly accountsPayableService: AccountsPayableService,
    private readonly accountsReceivableService: AccountsReceivableService,
    private readonly paymentProcessingService: PaymentProcessingService,
    private readonly collectionManagementService: CollectionManagementService,
    private readonly matchingEngineService: MatchingEngineService,
  ) {}

  @Post('invoices')
  @ApiOperation({
    summary: 'Create Invoice',
    description: 'Create AP/AR invoice with AI validation, duplicate detection, and automated routing',
  })
  @ApiBody({ type: InvoiceDto })
  @ApiQuery({ name: 'userId', required: true, description: 'User ID of the creator' })
  @ApiResponse({
    status: 201,
    description: 'Invoice created successfully',
    schema: {
      example: {
        invoiceId: 'INV_2024_000001',
        invoiceNumber: 'SINV-2024-000001',
        invoiceType: 'SUPPLIER',
        partyName: 'ABC Suppliers Ltd',
        invoiceDate: '2024-03-01',
        dueDate: '2024-03-31',
        totalAmount: 150000,
        currency: 'USD',
        paymentStatus: 'UNPAID',
        approvalStatus: 'PENDING',
        aiValidation: {
          duplicateCheck: false,
          priceVarianceAnalysis: {
            variance: 2.5,
            withinTolerance: true,
            previousPrice: 146341,
            currentPrice: 150000
          },
          fraudDetection: {
            riskScore: 0.12,
            flaggedItems: [],
            status: 'CLEAN'
          },
          complianceValidation: {
            taxCompliant: true,
            documentationComplete: true,
            approvalRequired: true
          },
          riskAssessment: 'LOW'
        },
        matchingOpportunities: [
          {
            poNumber: 'PO-2024-001',
            matchPercentage: 98.5,
            variances: ['Quantity: 105 vs 100']
          }
        ],
        nextActions: [
          'Route to Finance Manager for approval',
          'Schedule payment for optimal cash flow',
          'Update budget allocation for cost center CC001'
        ]
      }
    }
  })
  async createInvoice(@Body() invoiceDto: InvoiceDto, @Query('userId') userId: string) {
    try {
      this.logger.log(`Creating invoice: ${invoiceDto.invoiceNumber}`);
      
      const invoice = await this.accountsPayableService.createAdvancedInvoice(invoiceDto, userId);
      
      // Emit real-time update
      this.server.emit('invoice-created', {
        invoiceId: invoice.invoiceId,
        partyName: invoice.partyName,
        amount: invoice.totalAmount,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Invoice created successfully',
        data: invoice,
      };
    } catch (error) {
      this.logger.error(`Invoice creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create invoice',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('payments')
  @ApiOperation({
    summary: 'Process Payment',
    description: 'Process AP/AR payment with automated matching, validation, and cash flow optimization',
  })
  @ApiBody({ type: PaymentDto })
  @ApiResponse({
    status: 201,
    description: 'Payment processed successfully'
  })
  async processPayment(@Body() paymentDto: PaymentDto) {
    try {
      this.logger.log(`Processing payment: ${paymentDto.reference}`);
      
      const payment = await this.paymentProcessingService.processAdvancedPayment(paymentDto);
      
      // Emit real-time update
      this.server.emit('payment-processed', {
        paymentId: payment.paymentId,
        partyName: payment.partyName,
        amount: payment.amount,
        status: payment.processingStatus,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Payment processed successfully',
        data: payment,
      };
    } catch (error) {
      this.logger.error(`Payment processing failed: ${error.message}`);
      throw new HttpException(
        'Failed to process payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('automated-matching')
  @ApiOperation({
    summary: 'Automated Invoice Matching',
    description: 'AI-powered automated matching of invoices with POs, receipts, and payments',
  })
  @ApiResponse({
    status: 200,
    description: 'Automated matching completed successfully'
  })
  async performAutomatedMatching(@Body() matchingParams: any) {
    try {
      this.logger.log('Performing automated invoice matching');
      
      const matchingResults = await this.matchingEngineService.performAIMatching(matchingParams);
      
      // Emit real-time update
      this.server.emit('matching-completed', {
        matchedCount: matchingResults.matchedCount,
        unmatchedCount: matchingResults.unmatchedCount,
        exceptionsCount: matchingResults.exceptionsCount,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Automated matching completed successfully',
        data: matchingResults,
      };
    } catch (error) {
      this.logger.error(`Automated matching failed: ${error.message}`);
      throw new HttpException(
        'Automated matching failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('aging-analysis')
  @ApiOperation({
    summary: 'Generate Aging Analysis',
    description: 'Comprehensive aging analysis with AI insights and collection recommendations',
  })
  @ApiQuery({ name: 'partyType', required: true, description: 'Party type (SUPPLIER/CUSTOMER)' })
  @ApiQuery({ name: 'asOfDate', required: false, description: 'Analysis as of date' })
  @ApiQuery({ name: 'currency', required: false, description: 'Currency filter' })
  @ApiResponse({
    status: 200,
    description: 'Aging analysis generated successfully'
  })
  async generateAgingAnalysis(
    @Query('partyType') partyType: string,
    @Query('asOfDate') asOfDate?: string,
    @Query('currency') currency?: string,
  ) {
    try {
      this.logger.log(`Generating aging analysis for: ${partyType}`);
      
      const agingAnalysis = await this.accountsReceivableService.generateAdvancedAgingAnalysis({
        partyType: partyType as 'SUPPLIER' | 'CUSTOMER',
        asOfDate: asOfDate || new Date().toISOString().split('T')[0],
        currency: currency || 'USD',
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Aging analysis generated successfully',
        data: agingAnalysis,
      };
    } catch (error) {
      this.logger.error(`Aging analysis generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate aging analysis',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('collection-strategy')
  @ApiOperation({
    summary: 'Create Collection Strategy',
    description: 'AI-powered collection strategy with optimal action plans and success predictions',
  })
  @ApiBody({ type: CollectionStrategyDto })
  @ApiResponse({
    status: 201,
    description: 'Collection strategy created successfully'
  })
  async createCollectionStrategy(@Body() strategyDto: CollectionStrategyDto) {
    try {
      this.logger.log(`Creating collection strategy for: ${strategyDto.partyName}`);
      
      const strategy = await this.collectionManagementService.createAICollectionStrategy(strategyDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Collection strategy created successfully',
        data: strategy,
      };
    } catch (error) {
      this.logger.error(`Collection strategy creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create collection strategy',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('payment-predictions')
  @ApiOperation({
    summary: 'Payment Predictions',
    description: 'AI-powered payment predictions and cash flow forecasting',
  })
  @ApiQuery({ name: 'forecastPeriod', required: false, description: 'Forecast period in days' })
  @ApiResponse({
    status: 200,
    description: 'Payment predictions generated successfully'
  })
  async getPaymentPredictions(@Query('forecastPeriod') forecastPeriod?: string) {
    try {
      this.logger.log('Generating payment predictions');
      
      const predictions = await this.accountsReceivableService.generatePaymentPredictions({
        forecastPeriod: parseInt(forecastPeriod) || 90,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Payment predictions generated successfully',
        data: predictions,
      };
    } catch (error) {
      this.logger.error(`Payment predictions generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate payment predictions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('automated-collections')
  @ApiOperation({
    summary: 'Execute Automated Collections',
    description: 'Execute automated collection actions based on AI recommendations',
  })
  @ApiResponse({
    status: 200,
    description: 'Automated collections executed successfully'
  })
  async executeAutomatedCollections(@Body() collectionParams: any) {
    try {
      this.logger.log('Executing automated collections');
      
      const results = await this.collectionManagementService.executeAutomatedCollections(collectionParams);
      
      // Emit real-time update
      this.server.emit('collections-executed', {
        actionsExecuted: results.actionsExecuted,
        successfulActions: results.successfulActions,
        failedActions: results.failedActions,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Automated collections executed successfully',
        data: results,
      };
    } catch (error) {
      this.logger.error(`Automated collections execution failed: ${error.message}`);
      throw new HttpException(
        'Automated collections execution failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('ap-ar-dashboard')
  @ApiOperation({
    summary: 'AP/AR Dashboard',
    description: 'Comprehensive AP/AR dashboard with KPIs, trends, and actionable insights',
  })
  @ApiResponse({
    status: 200,
    description: 'AP/AR dashboard data retrieved successfully'
  })
  async getAPARDashboard() {
    try {
      const dashboard = await this.accountsPayableService.generateAPARDashboard();
      
      return {
        statusCode: HttpStatus.OK,
        message: 'AP/AR dashboard generated successfully',
        data: dashboard,
      };
    } catch (error) {
      this.logger.error(`AP/AR dashboard generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate AP/AR dashboard',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('cash-flow-optimization')
  @ApiOperation({
    summary: 'Cash Flow Optimization',
    description: 'AI-powered cash flow optimization for payments and collections',
  })
  @ApiResponse({
    status: 200,
    description: 'Cash flow optimization completed successfully'
  })
  async optimizeCashFlow(@Body() optimizationParams: any) {
    try {
      this.logger.log('Performing cash flow optimization');
      
      const optimization = await this.paymentProcessingService.optimizeCashFlow(optimizationParams);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Cash flow optimization completed successfully',
        data: optimization,
      };
    } catch (error) {
      this.logger.error(`Cash flow optimization failed: ${error.message}`);
      throw new HttpException(
        'Cash flow optimization failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // WebSocket handlers for real-time AP/AR monitoring
  @SubscribeMessage('subscribe-apar-updates')
  handleAPARSubscription(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const { modules, parties, currencies } = data;
    modules.forEach(module => client.join(`apar_${module}`));
    parties.forEach(party => client.join(`party_${party}`));
    currencies.forEach(currency => client.join(`currency_${currency}`));
    
    this.activeAPARSessions.set(client.id, { modules, parties, currencies });
    
    client.emit('subscription-confirmed', {
      modules,
      parties,
      currencies,
      realTimeUpdates: true,
      aiInsights: true,
      timestamp: new Date().toISOString()
    });
    
    this.logger.log(`AP/AR monitoring subscription: ${modules.join(', ')}`);
  }

  @SubscribeMessage('validate-invoice')
  async handleInvoiceValidation(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const validation = await this.accountsPayableService.validateInvoiceRealTime(data);
      
      client.emit('validation-result', {
        requestId: data.requestId,
        validation,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time invoice validation failed: ${error.message}`);
      client.emit('error', { message: 'Invoice validation failed' });
    }
  }

  @SubscribeMessage('payment-optimization')
  async handlePaymentOptimization(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const optimization = await this.paymentProcessingService.optimizePaymentRealTime(data);
      
      client.emit('optimization-result', {
        requestId: data.requestId,
        optimization,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time payment optimization failed: ${error.message}`);
      client.emit('error', { message: 'Payment optimization failed' });
    }
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const aparSession = this.activeAPARSessions.get(client.id);
    if (aparSession) {
      this.activeAPARSessions.delete(client.id);
      this.logger.log(`AP/AR monitoring disconnection: ${aparSession.modules.join(', ')}`);
    }
  }
}
