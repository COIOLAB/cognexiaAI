// Industry 5.0 ERP Backend - Revolutionary Asset Management Controller
// Quantum-optimized depreciation, AI-powered lifecycle management, and automated impairment testing
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

import { AssetManagementService } from '../services/asset-management.service';
import { DepreciationService } from '../services/depreciation.service';
import { AssetLifecycleService } from '../services/asset-lifecycle.service';
import { ImpairmentTestingService } from '../services/impairment-testing.service';
import { AssetValuationService } from '../services/asset-valuation.service';
import { FinanceGuard } from '../guards/finance.guard';

// DTOs for Asset Management
export class AssetDto {
  assetId?: string;
  assetNumber: string;
  assetName: string;
  assetType: 'TANGIBLE' | 'INTANGIBLE' | 'INVESTMENT' | 'BIOLOGICAL' | 'INFRASTRUCTURE';
  assetCategory: 'LAND' | 'BUILDINGS' | 'MACHINERY' | 'VEHICLES' | 'FURNITURE' | 'IT_EQUIPMENT' | 'SOFTWARE' | 'PATENTS' | 'TRADEMARKS' | 'GOODWILL' | 'OTHER';
  assetSubcategory: string;
  description: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  barcode?: string;
  rfidTag?: string;
  acquisitionDetails: {
    acquisitionDate: string;
    acquisitionMethod: 'PURCHASE' | 'LEASE' | 'GIFT' | 'CONSTRUCTION' | 'TRANSFER';
    supplier?: string;
    purchaseOrder?: string;
    invoice?: string;
    originalCost: number;
    currency: string;
    exchangeRate?: number;
    localCurrencyCost: number;
    additionalCosts?: {
      installation: number;
      transportation: number;
      legalFees: number;
      other: number;
    };
  };
  locationDetails: {
    site: string;
    building?: string;
    floor?: string;
    room?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    responsiblePerson: string;
    department: string;
    costCenter: string;
  };
  depreciationDetails: {
    depreciationMethod: 'STRAIGHT_LINE' | 'DECLINING_BALANCE' | 'UNITS_OF_PRODUCTION' | 'SUM_OF_YEARS_DIGITS' | 'CUSTOM';
    usefulLife: number;
    usefulLifeUnit: 'YEARS' | 'MONTHS' | 'UNITS' | 'HOURS';
    residualValue: number;
    residualValuePercentage: number;
    depreciationStartDate: string;
    depreciationRate?: number;
    customDepreciationSchedule?: {
      year: number;
      depreciationAmount: number;
      accumulatedDepreciation: number;
      netBookValue: number;
    }[];
  };
  maintenanceDetails?: {
    maintenanceSchedule: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' | 'CONDITIONAL';
    lastMaintenanceDate?: string;
    nextMaintenanceDate?: string;
    maintenanceCost: number;
    warrantyDetails?: {
      warrantyProvider: string;
      warrantyStartDate: string;
      warrantyEndDate: string;
      warrantyType: 'MANUFACTURER' | 'EXTENDED' | 'SERVICE_CONTRACT';
    };
  };
  insuranceDetails?: {
    insuranceProvider: string;
    policyNumber: string;
    coverageAmount: number;
    premiumAmount: number;
    startDate: string;
    endDate: string;
    deductible: number;
  };
  complianceRequirements?: {
    regulatoryCompliance: string[];
    certifications: string[];
    inspectionSchedule?: string;
    lastInspectionDate?: string;
    nextInspectionDate?: string;
  };
  financialDetails: {
    accountingStandard: 'GAAP' | 'IFRS' | 'IND_AS' | 'LOCAL_GAAP';
    assetAccount: string;
    depreciationAccount: string;
    accumulatedDepreciationAccount: string;
    impairmentAccount?: string;
    fairValue?: number;
    marketValue?: number;
    replacementCost?: number;
    netRealizable?: number;
  };
  assetStatus: 'ACTIVE' | 'INACTIVE' | 'UNDER_CONSTRUCTION' | 'DISPOSED' | 'IMPAIRED' | 'RETIRED';
  aiOptimization?: {
    predictiveMaintenance: boolean;
    utilizationOptimization: boolean;
    lifecycleOptimization: boolean;
    impairmentPrediction: boolean;
  };
}

export class DepreciationCalculationDto {
  assetId: string;
  calculationDate: string;
  period: string;
  method: 'STRAIGHT_LINE' | 'DECLINING_BALANCE' | 'UNITS_OF_PRODUCTION' | 'SUM_OF_YEARS_DIGITS' | 'QUANTUM_OPTIMIZED';
  quantumOptimization?: {
    enabled: boolean;
    optimizationCriteria: ('TAX_EFFICIENCY' | 'CASH_FLOW' | 'PROFITABILITY' | 'COMPLIANCE')[];
    scenarios: number;
    riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  };
  usageMetrics?: {
    actualUsage: number;
    plannedUsage: number;
    utilizationRate: number;
    performanceMetrics: any;
  };
  marketConditions?: {
    inflationRate: number;
    interestRate: number;
    marketVolatility: number;
    industryTrends: any;
  };
  aiPredictions?: {
    residualValuePrediction: number;
    usefulLifeAdjustment: number;
    impairmentRisk: number;
    maintenanceCostForecast: number;
  };
}

export class ImpairmentTestDto {
  assetId: string;
  testDate: string;
  testType: 'ROUTINE' | 'TRIGGERED' | 'YEAR_END' | 'ACQUISITION' | 'DISPOSAL';
  triggers?: {
    marketDecline: boolean;
    technologicalObsolescence: boolean;
    physicalDamage: boolean;
    regulatoryChanges: boolean;
    economicFactors: boolean;
    performanceDecline: boolean;
  };
  valuationApproaches: {
    fairValue?: {
      marketApproach: number;
      costApproach: number;
      incomeApproach: number;
      weightedAverage: number;
    };
    valueInUse?: {
      discountRate: number;
      cashFlowProjections: {
        year: number;
        cashFlow: number;
        terminalValue?: number;
      }[];
      presentValue: number;
    };
    netRealizable?: {
      estimatedSellingPrice: number;
      sellingCosts: number;
      netAmount: number;
    };
  };
  recoverableAmount: number;
  carryingAmount: number;
  impairmentLoss?: number;
  aiAnalysis?: {
    automaticValuation: boolean;
    marketDataAnalysis: any;
    industryBenchmarking: any;
    predictiveModeling: any;
    confidenceLevel: number;
  };
}

export class AssetTransferDto {
  assetId: string;
  transferType: 'LOCATION' | 'DEPARTMENT' | 'COST_CENTER' | 'LEGAL_ENTITY' | 'DISPOSAL' | 'SALE';
  transferDate: string;
  fromLocation: {
    site: string;
    department: string;
    costCenter: string;
    responsiblePerson: string;
  };
  toLocation: {
    site: string;
    department: string;
    costCenter: string;
    responsiblePerson: string;
  };
  transferReason: string;
  approvalRequired: boolean;
  approver?: string;
  transferCost?: number;
  accountingImpact: {
    journalEntries: {
      account: string;
      debit: number;
      credit: number;
      description: string;
    }[];
    taxImplications?: any;
    complianceRequirements?: string[];
  };
  documentation?: {
    transferOrder: string;
    approvalDocument?: string;
    photos?: string[];
    condition?: string;
  };
}

@ApiTags('Asset Management')
@Controller('finance-accounting/asset-management')
@WebSocketGateway({
  cors: true,
  path: '/asset-socket',
  transports: ['websocket', 'polling']
})
@UseGuards(FinanceGuard)
@ApiBearerAuth()
export class AssetManagementController {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AssetManagementController.name);
  private activeAssetSessions = new Map<string, any>();

  constructor(
    private readonly assetManagementService: AssetManagementService,
    private readonly depreciationService: DepreciationService,
    private readonly assetLifecycleService: AssetLifecycleService,
    private readonly impairmentTestingService: ImpairmentTestingService,
    private readonly assetValuationService: AssetValuationService,
  ) {}

  @Post('assets')
  @ApiOperation({
    summary: 'Create Asset',
    description: 'Create new asset with comprehensive details, AI optimization, and automated depreciation setup',
  })
  @ApiBody({ type: AssetDto })
  @ApiResponse({
    status: 201,
    description: 'Asset created successfully',
    schema: {
      example: {
        assetId: 'AST_2024_000001',
        assetNumber: 'EQ-2024-001',
        assetName: 'CNC Machining Center',
        assetType: 'TANGIBLE',
        assetCategory: 'MACHINERY',
        originalCost: 500000,
        currentBookValue: 500000,
        depreciationSchedule: {
          method: 'STRAIGHT_LINE',
          usefulLife: 10,
          annualDepreciation: 45000,
          monthlyDepreciation: 3750,
          residualValue: 50000
        },
        aiOptimizations: {
          predictiveMaintenance: {
            enabled: true,
            nextMaintenanceDate: '2024-06-01',
            estimatedCost: 5000,
            urgencyLevel: 'MEDIUM'
          },
          utilizationOptimization: {
            currentUtilization: 75,
            optimalUtilization: 85,
            recommendations: [
              'Schedule additional shifts during peak demand',
              'Consider productivity training for operators'
            ]
          },
          lifecycleOptimization: {
            remainingLife: 9.5,
            optimizedReplacement: '2033-Q2',
            costBenefit: 'FAVORABLE'
          }
        },
        impairmentAssessment: {
          lastTestDate: '2024-03-01',
          nextTestDate: '2025-03-01',
          riskLevel: 'LOW',
          carryingAmount: 500000,
          recoverableAmount: 520000,
          impairmentRequired: false
        },
        compliance: {
          certifications: ['ISO 9001', 'CE Marking'],
          nextInspection: '2024-09-01',
          complianceScore: 95
        }
      }
    }
  })
  async createAsset(@Body() assetDto: AssetDto) {
    try {
      this.logger.log(`Creating asset: ${assetDto.assetName}`);
      
      const asset = await this.assetManagementService.createAdvancedAsset(assetDto);
      
      // Emit real-time update
      this.server.emit('asset-created', {
        assetId: asset.assetId,
        assetName: asset.assetName,
        cost: asset.originalCost,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Asset created successfully',
        data: asset,
      };
    } catch (error) {
      this.logger.error(`Asset creation failed: ${error.message}`);
      throw new HttpException(
        'Failed to create asset',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('depreciation/calculate')
  @ApiOperation({
    summary: 'Calculate Depreciation',
    description: 'Quantum-optimized depreciation calculation with AI predictions and market adjustments',
  })
  @ApiBody({ type: DepreciationCalculationDto })
  @ApiResponse({
    status: 200,
    description: 'Depreciation calculated successfully'
  })
  async calculateDepreciation(@Body() depreciationDto: DepreciationCalculationDto) {
    try {
      this.logger.log(`Calculating depreciation for asset: ${depreciationDto.assetId}`);
      
      const depreciation = await this.depreciationService.calculateQuantumDepreciation(depreciationDto);
      
      // Emit real-time update
      this.server.emit('depreciation-calculated', {
        assetId: depreciationDto.assetId,
        depreciationAmount: depreciation.periodDepreciation,
        method: depreciation.method,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Depreciation calculated successfully',
        data: depreciation,
      };
    } catch (error) {
      this.logger.error(`Depreciation calculation failed: ${error.message}`);
      throw new HttpException(
        'Failed to calculate depreciation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('impairment-test')
  @ApiOperation({
    summary: 'Perform Impairment Test',
    description: 'AI-powered impairment testing with automated valuation and market analysis',
  })
  @ApiBody({ type: ImpairmentTestDto })
  @ApiResponse({
    status: 200,
    description: 'Impairment test completed successfully'
  })
  async performImpairmentTest(@Body() impairmentDto: ImpairmentTestDto) {
    try {
      this.logger.log(`Performing impairment test for asset: ${impairmentDto.assetId}`);
      
      const impairmentResult = await this.impairmentTestingService.performAIImpairmentTest(impairmentDto);
      
      // Emit real-time update
      this.server.emit('impairment-test-completed', {
        assetId: impairmentDto.assetId,
        impairmentLoss: impairmentResult.impairmentLoss,
        recoverableAmount: impairmentResult.recoverableAmount,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Impairment test completed successfully',
        data: impairmentResult,
      };
    } catch (error) {
      this.logger.error(`Impairment test failed: ${error.message}`);
      throw new HttpException(
        'Impairment test failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('assets/:id/transfer')
  @ApiOperation({
    summary: 'Transfer Asset',
    description: 'Transfer asset between locations, departments, or legal entities with automated accounting',
  })
  @ApiParam({ name: 'id', description: 'Asset ID' })
  @ApiBody({ type: AssetTransferDto })
  @ApiResponse({
    status: 200,
    description: 'Asset transferred successfully'
  })
  async transferAsset(
    @Param('id') assetId: string,
    @Body() transferDto: AssetTransferDto,
  ) {
    try {
      this.logger.log(`Transferring asset: ${assetId}`);
      
      const transfer = await this.assetLifecycleService.transferAsset(assetId, transferDto);
      
      // Emit real-time update
      this.server.emit('asset-transferred', {
        assetId,
        fromLocation: transferDto.fromLocation,
        toLocation: transferDto.toLocation,
        timestamp: new Date().toISOString()
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Asset transferred successfully',
        data: transfer,
      };
    } catch (error) {
      this.logger.error(`Asset transfer failed: ${error.message}`);
      throw new HttpException(
        'Failed to transfer asset',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('assets/valuation-report')
  @ApiOperation({
    summary: 'Generate Asset Valuation Report',
    description: 'Comprehensive asset valuation report with market analysis and AI insights',
  })
  @ApiQuery({ name: 'asOfDate', required: false, description: 'Valuation as of date' })
  @ApiQuery({ name: 'valuationMethod', required: false, description: 'Valuation method' })
  @ApiResponse({
    status: 200,
    description: 'Asset valuation report generated successfully'
  })
  async generateValuationReport(
    @Query('asOfDate') asOfDate?: string,
    @Query('valuationMethod') valuationMethod?: string,
  ) {
    try {
      this.logger.log('Generating asset valuation report');
      
      const valuationReport = await this.assetValuationService.generateAdvancedValuationReport({
        asOfDate: asOfDate || new Date().toISOString().split('T')[0],
        valuationMethod: valuationMethod || 'FAIR_VALUE',
      });
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Asset valuation report generated successfully',
        data: valuationReport,
      };
    } catch (error) {
      this.logger.error(`Valuation report generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate valuation report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('maintenance/predictive-analysis')
  @ApiOperation({
    summary: 'Predictive Maintenance Analysis',
    description: 'AI-powered predictive maintenance analysis with cost optimization',
  })
  @ApiResponse({
    status: 200,
    description: 'Predictive maintenance analysis completed successfully'
  })
  async performPredictiveMaintenanceAnalysis(@Body() analysisParams: any) {
    try {
      this.logger.log('Performing predictive maintenance analysis');
      
      const analysis = await this.assetLifecycleService.performPredictiveMaintenanceAnalysis(analysisParams);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Predictive maintenance analysis completed successfully',
        data: analysis,
      };
    } catch (error) {
      this.logger.error(`Predictive maintenance analysis failed: ${error.message}`);
      throw new HttpException(
        'Predictive maintenance analysis failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('asset-optimization')
  @ApiOperation({
    summary: 'Asset Optimization Recommendations',
    description: 'AI-powered asset optimization recommendations for lifecycle, utilization, and cost management',
  })
  @ApiResponse({
    status: 200,
    description: 'Asset optimization recommendations generated successfully'
  })
  async getAssetOptimizationRecommendations() {
    try {
      this.logger.log('Generating asset optimization recommendations');
      
      const recommendations = await this.assetManagementService.generateOptimizationRecommendations();
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Asset optimization recommendations generated successfully',
        data: recommendations,
      };
    } catch (error) {
      this.logger.error(`Asset optimization recommendations failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate optimization recommendations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('asset-dashboard')
  @ApiOperation({
    summary: 'Asset Management Dashboard',
    description: 'Comprehensive asset dashboard with KPIs, trends, and predictive insights',
  })
  @ApiResponse({
    status: 200,
    description: 'Asset dashboard data retrieved successfully'
  })
  async getAssetDashboard() {
    try {
      const dashboard = await this.assetManagementService.generateAssetDashboard();
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Asset dashboard generated successfully',
        data: dashboard,
      };
    } catch (error) {
      this.logger.error(`Asset dashboard generation failed: ${error.message}`);
      throw new HttpException(
        'Failed to generate asset dashboard',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('quantum-depreciation-optimization')
  @ApiOperation({
    summary: 'Quantum Depreciation Optimization',
    description: 'Quantum-enhanced depreciation optimization across asset portfolio for maximum tax and cash flow benefits',
  })
  @ApiResponse({
    status: 200,
    description: 'Quantum depreciation optimization completed successfully'
  })
  async performQuantumDepreciationOptimization(@Body() optimizationParams: any) {
    try {
      this.logger.log('Performing quantum depreciation optimization');
      
      const optimization = await this.depreciationService.performQuantumOptimization(optimizationParams);
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Quantum depreciation optimization completed successfully',
        data: optimization,
      };
    } catch (error) {
      this.logger.error(`Quantum depreciation optimization failed: ${error.message}`);
      throw new HttpException(
        'Quantum depreciation optimization failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // WebSocket handlers for real-time asset monitoring
  @SubscribeMessage('subscribe-asset-updates')
  handleAssetSubscription(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const { assetTypes, locations, categories } = data;
    assetTypes.forEach(type => client.join(`assets_${type}`));
    locations.forEach(location => client.join(`location_${location}`));
    categories.forEach(category => client.join(`category_${category}`));
    
    this.activeAssetSessions.set(client.id, { assetTypes, locations, categories });
    
    client.emit('subscription-confirmed', {
      assetTypes,
      locations,
      categories,
      realTimeUpdates: true,
      aiInsights: true,
      predictiveAnalytics: true,
      timestamp: new Date().toISOString()
    });
    
    this.logger.log(`Asset monitoring subscription: ${assetTypes.join(', ')}`);
  }

  @SubscribeMessage('asset-valuation-request')
  async handleAssetValuation(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const valuation = await this.assetValuationService.performRealTimeValuation(data);
      
      client.emit('valuation-result', {
        requestId: data.requestId,
        valuation,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time asset valuation failed: ${error.message}`);
      client.emit('error', { message: 'Asset valuation failed' });
    }
  }

  @SubscribeMessage('maintenance-prediction')
  async handleMaintenancePrediction(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    try {
      const prediction = await this.assetLifecycleService.predictMaintenanceRealTime(data);
      
      client.emit('maintenance-prediction', {
        assetId: data.assetId,
        prediction,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error(`Real-time maintenance prediction failed: ${error.message}`);
      client.emit('error', { message: 'Maintenance prediction failed' });
    }
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const assetSession = this.activeAssetSessions.get(client.id);
    if (assetSession) {
      this.activeAssetSessions.delete(client.id);
      this.logger.log(`Asset monitoring disconnection: ${assetSession.assetTypes.join(', ')}`);
    }
  }
}
