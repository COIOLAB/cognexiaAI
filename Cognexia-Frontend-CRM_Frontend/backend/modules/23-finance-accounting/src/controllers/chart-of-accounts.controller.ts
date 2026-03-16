// Industry 5.0 ERP Backend - Advanced Chart of Accounts Management Controller
// Revolutionary multi-dimensional accounting with AI-powered account suggestions
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

import { ChartOfAccountsService } from '../services/chart-of-accounts.service';
import { AccountMappingService } from '../services/account-mapping.service';
import { AccountValidationService } from '../services/account-validation.service';
import { FinanceGuard } from '../guards/finance.guard';

// DTOs for Chart of Accounts
export class CreateAccountDto {
  accountCode: string;
  accountName: string;
  parentAccountId?: string;
  accountType: 'ASSETS' | 'LIABILITIES' | 'EQUITY' | 'REVENUE' | 'EXPENSES' | 'CONTRA';
  accountCategory: 'CURRENT_ASSETS' | 'NON_CURRENT_ASSETS' | 'CURRENT_LIABILITIES' | 'NON_CURRENT_LIABILITIES' | 'OPERATING_REVENUE' | 'NON_OPERATING_REVENUE' | 'OPERATING_EXPENSES' | 'NON_OPERATING_EXPENSES' | 'EQUITY_CAPITAL';
  accountSubcategory: string;
  normalBalance: 'DEBIT' | 'CREDIT';
  isActive: boolean;
  allowManualEntries: boolean;
  requiresCostCenter: boolean;
  requiresProject: boolean;
  requiresDepartment: boolean;
  requiresLocation: boolean;
  taxRelevant: boolean;
  reconciliationAccount: boolean;
  consolidationMapping?: {
    consolidationAccount: string;
    eliminationRules: string[];
    intercompanyTreatment: string;
  };
  reportingLines: {
    balanceSheet?: {
      section: string;
      lineItem: string;
      sequence: number;
    };
    profitLoss?: {
      section: string;
      lineItem: string;
      sequence: number;
    };
    cashFlow?: {
      section: string;
      lineItem: string;
      sequence: number;
    };
  };
  dimensions: {
    costCenter?: string[];
    profitCenter?: string[];
    businessUnit?: string[];
    product?: string[];
    geography?: string[];
    customer?: string[];
    supplier?: string[];
    project?: string[];
    campaign?: string[];
    customDimensions?: Record<string, string[]>;
  };
  validationRules: {
    minimumBalance?: number;
    maximumBalance?: number;
    allowedCurrencies?: string[];
    mandatoryDimensions?: string[];
    approvalWorkflow?: string;
    automationRules?: string[];
  };
  aiConfiguration: {
    autoSuggestPostings: boolean;
    anomalyDetection: boolean;
    patternRecognition: boolean;
    riskAssessment: boolean;
  };
}

export class UpdateAccountDto extends CreateAccountDto {
  id: string;
  lastModifiedBy: string;
  lastModifiedDate: string;
  versionNumber: number;
}

export class AccountMappingDto {
  sourceAccountId: string;
  targetAccountId: string;
  mappingType: 'ELIMINATION' | 'RECLASSIFICATION' | 'TRANSLATION' | 'CONSOLIDATION';
  mappingRules: {
    percentage?: number;
    conditions?: string[];
    effectiveDate: string;
    expiryDate?: string;
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  };
  dimensions: {
    applicableDimensions: string[];
    dimensionMappings: Record<string, string>;
  };
  aiOptimization: {
    autoApply: boolean;
    confidenceThreshold: number;
    learningEnabled: boolean;
  };
}

export class AccountHierarchyDto {
  accountId: string;
  level: number;
  children: AccountHierarchyDto[];
  rollupRules: {
    summationMethod: 'SUM' | 'AVERAGE' | 'WEIGHTED_AVERAGE' | 'CUSTOM';
    excludeAccounts?: string[];
    customFormula?: string;
  };
  reportingRequirements: {
    balanceSheetRequired: boolean;
    profitLossRequired: boolean;
    cashFlowRequired: boolean;
    customReports?: string[];
  };
}

@ApiTags('Chart of Accounts Management')
@Controller('finance-accounting/chart-of-accounts')
@WebSocketGateway({
  cors: true,
  path: '/accounts-socket',
  transports: ['websocket', 'polling']
})
@UseGuards(FinanceGuard)
@ApiBearerAuth()
export class ChartOfAccountsController {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChartOfAccountsController.name);
  private activeAccountSessions = new Map<string, any>();

  constructor(
    private readonly chartOfAccountsService: ChartOfAccountsService,
    private readonly accountMappingService: AccountMappingService,
    private readonly accountValidationService: AccountValidationService,
  ) {}

  @Post('accounts')
  @ApiOperation({
    summary: 'Create New Account',
    description: 'Create a new account in the chart of accounts with multi-dimensional setup and AI validation',
  })
  @ApiBody({ type: CreateAccountDto })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
    schema: {
      example: {
        accountId: 'ACC_2024_001',
        accountCode: '1000.100.010',
        accountName: 'Cash and Cash Equivalents - USD',
        accountType: 'ASSETS',
        accountCategory: 'CURRENT_ASSETS',
        normalBalance: 'DEBIT',
        hierarchyLevel: 3,
        fullPath: 'Assets/Current Assets/Cash and Cash Equivalents',
        reportingConfiguration: {
          balanceSheet: {
            section: 'CURRENT_ASSETS',
            lineItem: 'Cash and cash equivalents',
            sequence: 1
          }
        },
        dimensionsSetup: {
          costCenter: ['CC001', 'CC002'],
          businessUnit: ['BU001'],
          geography: ['US', 'CA']
        },
        aiValidation: {
          validationScore: 0.98,
          suggestions: [
            'Consider adding currency dimension for multi-currency operations',
            'Setup automated bank reconciliation rules'
          ],
          riskAssessment: 'LOW'
        },
        status: 'ACTIVE',
        createdDate: '2024-03-01T10:00:00Z'
      }
    }
  })
  async createAccount(@Body() createAccountDto: CreateAccountDto) {
    try {
      this.logger.log(`Creating new account: ${createAccountDto.accountName}`);
      
      const account = await this.chartOfAccountsService.createAdvancedAccount(createAccountDto);
      
      // Emit real-time update
      this.server.emit('account-created', {
        accountId: account.accountId,
        accountName: account.accountName,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Account created successfully',
        data: account,
      };
    } catch (error) {
      this.logger.error(`Account creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create account',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('accounts')
  @ApiOperation({
    summary: 'Get Chart of Accounts',
    description: 'Retrieve complete chart of accounts with hierarchy and filters',
  })
  @ApiQuery({ name: 'accountType', required: false, description: 'Filter by account type' })
  @ApiQuery({ name: 'active', required: false, description: 'Filter active/inactive accounts' })
  @ApiQuery({ name: 'hierarchy', required: false, description: 'Include hierarchy structure' })
  @ApiResponse({
    status: 200,
    description: 'Chart of accounts retrieved successfully'
  })
  async getChartOfAccounts(
    @Query('accountType') accountType?: string,
    @Query('active') active?: boolean,
    @Query('hierarchy') hierarchy?: boolean,
  ) {
    try {
      this.logger.log('Retrieving chart of accounts');
      
      const chartOfAccounts = await this.chartOfAccountsService.getAdvancedChartOfAccounts({
        accountType,
        active,
        includeHierarchy: hierarchy,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Chart of accounts retrieved successfully',
        data: chartOfAccounts,
      };
    } catch (error) {
      this.logger.error(`Chart of accounts retrieval failed: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve chart of accounts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('accounts/hierarchy')
  @ApiOperation({
    summary: 'Get Account Hierarchy',
    description: 'Retrieve account hierarchy with rollup rules and reporting requirements',
  })
  @ApiResponse({
    status: 200,
    description: 'Account hierarchy retrieved successfully'
  })
  async getAccountHierarchy() {
    try {
      const hierarchy = await this.chartOfAccountsService.getAccountHierarchy();
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Account hierarchy retrieved successfully',
        data: hierarchy,
      };
    } catch (error) {
      this.logger.error(`Account hierarchy retrieval failed: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve account hierarchy',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('accounts/mapping')
  @ApiOperation({
    summary: 'Create Account Mapping',
    description: 'Create account mappings for consolidation, elimination, and reclassification',
  })
  @ApiBody({ type: AccountMappingDto })
  @ApiResponse({
    status: 201,
    description: 'Account mapping created successfully'
  })
  async createAccountMapping(@Body() mappingDto: AccountMappingDto) {
    try {
      this.logger.log(`Creating account mapping: ${mappingDto.mappingType}`);
      
      const mapping = await this.accountMappingService.createAdvancedMapping(mappingDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Account mapping created successfully',
        data: mapping,
      };
    } catch (error) {
      this.logger.error(`Account mapping creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create account mapping',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('accounts/validate')
  @ApiOperation({
    summary: 'Validate Account Structure',
    description: 'AI-powered validation of account structure and setup',
  })
  @ApiResponse({
    status: 200,
    description: 'Account validation completed successfully'
  })
  async validateAccountStructure() {
    try {
      this.logger.log('Performing account structure validation');
      
      const validation = await this.accountValidationService.performAIValidation();
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Account validation completed successfully',
        data: validation,
      };
    } catch (error) {
      this.logger.error(`Account validation failed: ${error.message}`);
      throw new HttpException(
        'Account validation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('accounts/:id/dimensions')
  @ApiOperation({
    summary: 'Configure Account Dimensions',
    description: 'Setup multi-dimensional accounting for specific account',
  })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: 200,
    description: 'Account dimensions configured successfully'
  })
  async configureAccountDimensions(
    @Param('id') accountId: string,
    @Body() dimensionsConfig: any,
  ) {
    try {
      this.logger.log(`Configuring dimensions for account: ${accountId}`);
      
      const configuration = await this.chartOfAccountsService.configureDimensions(
        accountId,
        dimensionsConfig,
      );
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Account dimensions configured successfully',
        data: configuration,
      };
    } catch (error) {
      this.logger.error(`Account dimensions configuration failed: ${error.message}`);
      throw new HttpException(
        'Failed to configure account dimensions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('accounts/ai-suggestions')
  @ApiOperation({
    summary: 'Get AI Account Suggestions',
    description: 'AI-powered account suggestions based on business context and industry best practices',
  })
  @ApiQuery({ name: 'industry', required: false, description: 'Industry type' })
  @ApiQuery({ name: 'businessType', required: false, description: 'Business type' })
  @ApiResponse({
    status: 200,
    description: 'AI account suggestions retrieved successfully'
  })
  async getAIAccountSuggestions(
    @Query('industry') industry?: string,
    @Query('businessType') businessType?: string,
  ) {
    try {
      this.logger.log('Generating AI account suggestions');
      
      const suggestions = await this.chartOfAccountsService.generateAISuggestions({
        industry,
        businessType,
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'AI account suggestions generated successfully',
        data: suggestions,
      };
    } catch (error) {
      this.logger.error(`AI suggestions generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate AI suggestions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('accounts/bulk-import')
  @ApiOperation({
    summary: 'Bulk Import Accounts',
    description: 'Import multiple accounts with validation and AI optimization',
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk import completed successfully'
  })
  async bulkImportAccounts(@Body() importData: any) {
    try {
      this.logger.log('Starting bulk account import');
      
      const importResult = await this.chartOfAccountsService.bulkImportAccounts(importData);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Bulk import completed successfully',
        data: importResult,
      };
    } catch (error) {
      this.logger.error(`Bulk import failed: ${error.message}`);
      throw new HttpException(
        'Bulk import failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // WebSocket handlers for real-time account management
  @SubscribeMessage('subscribe-account-updates')
  handleAccountSubscription(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const { accountTypes, dimensions } = data;
    accountTypes.forEach(type => client.join(`accounts_${type}`));
    dimensions.forEach(dim => client.join(`dimension_${dim}`));
    
    this.activeAccountSessions.set(client.id, { accountTypes, dimensions });
    
    client.emit('subscription-confirmed', {
      accountTypes,
      dimensions,
      realTimeUpdates: true,
      timestamp: new Date().toISOString()
    });
    
    this.logger.log(`Account monitoring subscription: ${accountTypes.join(', ')}`);
  }

  @SubscribeMessage('validate-account-setup')
  async handleAccountValidation(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const validation = await this.accountValidationService.validateRealTime(data);
      
      client.emit('validation-result', {
        requestId: data.requestId,
        validation,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time validation failed: ${error.message}`);
      client.emit('error', { message: 'Validation failed' });
    }
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const accountSession = this.activeAccountSessions.get(client.id);
    if (accountSession) {
      this.activeAccountSessions.delete(client.id);
      this.logger.log(`Account monitoring disconnection: ${accountSession.accountTypes.join(', ')}`);
    }
  }
}
