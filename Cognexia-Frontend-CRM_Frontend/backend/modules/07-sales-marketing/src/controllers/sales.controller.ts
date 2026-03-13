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
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';

// Import existing services
import { AISalesMarketingService } from '../services/ai-sales-marketing.service';
import { PredictiveAnalyticsService } from '../services/predictive-analytics.service';
import { LeadScoringService } from '../services/lead-scoring.service';
import { RevenueOperationsService } from '../services/revenue-operations.service';

// DTOs
import {
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  SalesOpportunityDto,
  SalesPipelineDto,
  SalesAnalyticsDto,
  SalesForecastDto,
} from '../dto/sales.dto';

@ApiTags('Sales Management')
@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SalesController {
  private readonly logger = new Logger(SalesController.name);

  constructor(
    private readonly aiSalesService: AISalesMarketingService,
    private readonly predictiveService: PredictiveAnalyticsService,
    private readonly leadScoringService: LeadScoringService,
    private readonly revenueOpsService: RevenueOperationsService,
  ) {}

  // =================== SALES ORDERS ===================

  @Get('orders')
  @ApiOperation({
    summary: 'Get all sales orders',
    description: 'Retrieve all sales orders with filtering and pagination',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'confirmed', 'shipped', 'delivered', 'cancelled'] })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date })
  @ApiQuery({ name: 'dateTo', required: false, type: Date })
  @ApiResponse({ status: 200, description: 'Sales orders retrieved successfully' })
  @Roles('admin', 'sales_manager', 'sales_rep', 'viewer')
  async getAllSalesOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    try {
      this.logger.log('Fetching sales orders with filters');
      
      return {
        success: true,
        data: {
          orders: [
            {
              id: 'SO-001',
              orderNumber: 'SO-2024-001',
              customerId: 'CUST-001',
              customerName: 'TechCorp Industries',
              status: 'confirmed',
              orderDate: new Date('2024-01-15'),
              totalAmount: 125000.50,
              currency: 'USD',
              salesRep: {
                id: 'REP-001',
                name: 'John Smith',
                email: 'john.smith@company.com',
              },
              items: [
                {
                  productId: 'PROD-001',
                  productName: 'Advanced Manufacturing Component',
                  quantity: 100,
                  unitPrice: 1250.50,
                  totalPrice: 125050.00,
                  discount: 0.05,
                },
              ],
              shipping: {
                address: '123 Industrial Ave, Tech City, TC 12345',
                method: 'express',
                trackingNumber: 'TRK-12345',
              },
              payment: {
                terms: 'NET30',
                method: 'bank_transfer',
                status: 'pending',
              },
            },
          ],
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(45 / limit),
            totalItems: 45,
            itemsPerPage: limit,
          },
          summary: {
            totalOrders: 45,
            totalValue: 2850000.75,
            avgOrderValue: 63333.35,
            statusBreakdown: {
              draft: 5,
              confirmed: 25,
              shipped: 10,
              delivered: 4,
              cancelled: 1,
            },
          },
        },
        message: 'Sales orders retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error fetching sales orders:', error);
      throw new HttpException('Failed to fetch sales orders', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('orders')
  @ApiOperation({
    summary: 'Create new sales order',
    description: 'Create a new sales order with line items and customer details',
  })
  @ApiResponse({ status: 201, description: 'Sales order created successfully' })
  @Roles('admin', 'sales_manager', 'sales_rep')
  async createSalesOrder(@Body() orderDto: CreateSalesOrderDto) {
    try {
      this.logger.log('Creating new sales order');
      
      // Use AI service for order optimization
      const optimizedOrder = await this.aiSalesService.optimizeSalesOrder(orderDto);
      
      return {
        success: true,
        data: {
          orderId: 'SO-' + Date.now(),
          orderNumber: 'SO-2024-' + String(Date.now()).slice(-4),
          status: 'draft',
          optimizations: optimizedOrder.suggestions,
          estimatedValue: optimizedOrder.estimatedValue,
          createdAt: new Date(),
        },
        message: 'Sales order created successfully',
      };
    } catch (error) {
      this.logger.error('Error creating sales order:', error);
      throw new HttpException('Failed to create sales order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get sales order by ID' })
  @ApiParam({ name: 'id', description: 'Sales order ID' })
  @ApiResponse({ status: 200, description: 'Sales order retrieved successfully' })
  @Roles('admin', 'sales_manager', 'sales_rep', 'viewer')
  async getSalesOrder(@Param('id') id: string) {
    try {
      this.logger.log(`Fetching sales order: ${id}`);
      // Implementation would fetch from database
      return {
        success: true,
        data: {
          // Sales order details
        },
        message: 'Sales order retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error fetching sales order:', error);
      throw new HttpException('Sales order not found', HttpStatus.NOT_FOUND);
    }
  }

  @Put('orders/:id')
  @ApiOperation({ summary: 'Update sales order' })
  @ApiParam({ name: 'id', description: 'Sales order ID' })
  @ApiResponse({ status: 200, description: 'Sales order updated successfully' })
  @Roles('admin', 'sales_manager', 'sales_rep')
  async updateSalesOrder(@Param('id') id: string, @Body() updateDto: UpdateSalesOrderDto) {
    try {
      this.logger.log(`Updating sales order: ${id}`);
      // Implementation would update in database
      return {
        success: true,
        data: { orderId: id, updatedAt: new Date() },
        message: 'Sales order updated successfully',
      };
    } catch (error) {
      this.logger.error('Error updating sales order:', error);
      throw new HttpException('Failed to update sales order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== SALES OPPORTUNITIES ===================

  @Get('opportunities')
  @ApiOperation({ summary: 'Get sales opportunities' })
  @ApiQuery({ name: 'stage', required: false })
  @ApiQuery({ name: 'probability', required: false })
  @ApiResponse({ status: 200, description: 'Opportunities retrieved successfully' })
  @Roles('admin', 'sales_manager', 'sales_rep', 'viewer')
  async getSalesOpportunities(
    @Query('stage') stage?: string,
    @Query('probability') probability?: number,
  ) {
    try {
      this.logger.log('Fetching sales opportunities');
      
      return {
        success: true,
        data: {
          opportunities: [
            {
              id: 'OPP-001',
              name: 'Industrial Automation Project',
              customerId: 'CUST-002',
              customerName: 'Manufacturing Solutions Inc.',
              stage: 'proposal',
              probability: 75,
              value: 500000,
              expectedCloseDate: new Date('2024-03-15'),
              salesRep: {
                id: 'REP-001',
                name: 'John Smith',
              },
              products: ['Robotic Systems', 'Control Software'],
              lastActivity: new Date('2024-01-20'),
              notes: 'Customer very interested, waiting for final budget approval',
            },
          ],
          summary: {
            totalOpportunities: 25,
            totalValue: 5500000,
            avgProbability: 68,
            stageBreakdown: {
              prospecting: 5,
              qualification: 8,
              proposal: 7,
              negotiation: 3,
              closed_won: 2,
            },
          },
        },
        message: 'Sales opportunities retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error fetching opportunities:', error);
      throw new HttpException('Failed to fetch opportunities', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('opportunities')
  @ApiOperation({ summary: 'Create sales opportunity' })
  @ApiResponse({ status: 201, description: 'Opportunity created successfully' })
  @Roles('admin', 'sales_manager', 'sales_rep')
  async createOpportunity(@Body() opportunityDto: SalesOpportunityDto) {
    try {
      this.logger.log('Creating sales opportunity');
      
      // Use lead scoring service to assess opportunity
      const leadScore = await this.leadScoringService.scoreOpportunity(opportunityDto);
      
      return {
        success: true,
        data: {
          opportunityId: 'OPP-' + Date.now(),
          leadScore: leadScore.score,
          recommendations: leadScore.recommendations,
          createdAt: new Date(),
        },
        message: 'Sales opportunity created successfully',
      };
    } catch (error) {
      this.logger.error('Error creating opportunity:', error);
      throw new HttpException('Failed to create opportunity', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== SALES ANALYTICS ===================

  @Get('analytics')
  @ApiOperation({ summary: 'Get sales analytics and insights' })
  @ApiQuery({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] })
  @ApiQuery({ name: 'salesRep', required: false })
  @ApiResponse({ status: 200, description: 'Sales analytics retrieved successfully' })
  @Roles('admin', 'sales_manager', 'sales_rep', 'viewer')
  async getSalesAnalytics(
    @Query('period') period: string = 'monthly',
    @Query('salesRep') salesRep?: string,
  ) {
    try {
      this.logger.log(`Fetching sales analytics for period: ${period}`);
      
      // Use predictive analytics service
      const analytics = await this.predictiveService.generateSalesAnalytics({
        period,
        salesRep,
      });
      
      return {
        success: true,
        data: {
          period,
          kpis: {
            totalRevenue: 2850000.75,
            totalOrders: 45,
            avgOrderValue: 63333.35,
            conversionRate: 12.5,
            salesCycleLength: 32, // days
            customerRetentionRate: 85.2,
          },
          trends: {
            revenueGrowth: 15.8,
            orderGrowth: 12.3,
            customerGrowth: 8.7,
          },
          topProducts: [
            { name: 'Advanced Manufacturing Component', revenue: 850000, orders: 15 },
            { name: 'Industrial Control System', revenue: 650000, orders: 8 },
          ],
          topCustomers: [
            { name: 'TechCorp Industries', revenue: 425000, orders: 5 },
            { name: 'Manufacturing Solutions Inc.', revenue: 380000, orders: 3 },
          ],
          salesRepPerformance: analytics.salesRepMetrics,
          forecast: analytics.forecast,
        },
        message: 'Sales analytics retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error fetching sales analytics:', error);
      throw new HttpException('Failed to fetch analytics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('pipeline')
  @ApiOperation({ summary: 'Get sales pipeline overview' })
  @ApiResponse({ status: 200, description: 'Sales pipeline retrieved successfully' })
  @Roles('admin', 'sales_manager', 'sales_rep', 'viewer')
  async getSalesPipeline() {
    try {
      this.logger.log('Fetching sales pipeline');
      
      return {
        success: true,
        data: {
          stages: [
            {
              name: 'Prospecting',
              count: 15,
              value: 1250000,
              avgProbability: 25,
              opportunities: 15,
            },
            {
              name: 'Qualification',
              count: 12,
              value: 2100000,
              avgProbability: 45,
              opportunities: 12,
            },
            {
              name: 'Proposal',
              count: 8,
              value: 1800000,
              avgProbability: 65,
              opportunities: 8,
            },
            {
              name: 'Negotiation',
              count: 5,
              value: 1200000,
              avgProbability: 80,
              opportunities: 5,
            },
          ],
          totalPipelineValue: 6350000,
          weightedPipelineValue: 3425000,
          avgSalesCycle: 45, // days
          conversionRates: {
            prospectingToQualification: 75,
            qualificationToProposal: 68,
            proposalToNegotiation: 60,
            negotiationToClosed: 85,
          },
        },
        message: 'Sales pipeline retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error fetching pipeline:', error);
      throw new HttpException('Failed to fetch pipeline', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('forecast')
  @ApiOperation({ summary: 'Get sales forecast' })
  @ApiQuery({ name: 'period', required: false, enum: ['monthly', 'quarterly', 'yearly'] })
  @ApiResponse({ status: 200, description: 'Sales forecast retrieved successfully' })
  @Roles('admin', 'sales_manager', 'sales_rep', 'viewer')
  async getSalesForecast(@Query('period') period: string = 'quarterly') {
    try {
      this.logger.log(`Generating sales forecast for period: ${period}`);
      
      // Use predictive analytics for forecasting
      const forecast = await this.predictiveService.generateSalesForecast({
        period,
        includeConfidenceInterval: true,
      });
      
      return {
        success: true,
        data: {
          period,
          forecast: forecast.predictions,
          confidence: forecast.confidence,
          factors: forecast.influencingFactors,
          scenarios: {
            conservative: forecast.scenarios.conservative,
            realistic: forecast.scenarios.realistic,
            optimistic: forecast.scenarios.optimistic,
          },
        },
        message: 'Sales forecast generated successfully',
      };
    } catch (error) {
      this.logger.error('Error generating forecast:', error);
      throw new HttpException('Failed to generate forecast', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== SALES TEAM MANAGEMENT ===================

  @Get('team/performance')
  @ApiOperation({ summary: 'Get sales team performance metrics' })
  @ApiResponse({ status: 200, description: 'Team performance retrieved successfully' })
  @Roles('admin', 'sales_manager')
  async getTeamPerformance() {
    try {
      this.logger.log('Fetching sales team performance');
      
      const performance = await this.revenueOpsService.getTeamPerformance();
      
      return {
        success: true,
        data: performance,
        message: 'Sales team performance retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error fetching team performance:', error);
      throw new HttpException('Failed to fetch team performance', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('quotas')
  @ApiOperation({ summary: 'Get sales quotas and targets' })
  @ApiResponse({ status: 200, description: 'Sales quotas retrieved successfully' })
  @Roles('admin', 'sales_manager', 'sales_rep', 'viewer')
  async getSalesQuotas() {
    try {
      this.logger.log('Fetching sales quotas');
      
      return {
        success: true,
        data: {
          teamQuota: 15000000,
          currentAchievement: 12750000,
          achievementRate: 85,
          individualQuotas: [
            {
              salesRepId: 'REP-001',
              name: 'John Smith',
              quota: 2500000,
              achievement: 2125000,
              rate: 85,
            },
            {
              salesRepId: 'REP-002',
              name: 'Sarah Johnson',
              quota: 2200000,
              achievement: 1980000,
              rate: 90,
            },
          ],
        },
        message: 'Sales quotas retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error fetching quotas:', error);
      throw new HttpException('Failed to fetch quotas', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
