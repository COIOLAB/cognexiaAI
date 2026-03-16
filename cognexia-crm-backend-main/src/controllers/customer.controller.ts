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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';
import { CustomerService } from '../services/customer.service';

@ApiTags('CRM - Customer Management')
@Controller('crm/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomerController {
  private readonly logger = new Logger(CustomerController.name);

  constructor(private readonly customerService: CustomerService) { }

  @Get('stats')
  @ApiOperation({
    summary: 'Get customer statistics',
    description: 'Retrieve customer overview metrics for dashboards',
  })
  @ApiResponse({ status: 200, description: 'Customer statistics retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing', 'viewer')
  async getCustomerStats() {
    try {
      const stats = await this.customerService.getStats();
      return { success: true, data: stats, message: 'Customer statistics retrieved successfully' };
    } catch (error) {
      this.logger.error('Error getting customer stats:', error);
      throw new HttpException('Failed to retrieve customer statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get customers',
    description: 'Retrieve customers with pagination and search'
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Customers retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer')
  async getCustomers(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    try {
      const organizationId = req?.user?.organizationId || req?.user?.tenantId;
      const result = await this.customerService.findAll({
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        search,
        organizationId,
      });

      return { success: true, data: result, message: 'Customers retrieved successfully' };
    } catch (error) {
      this.logger.error('Error getting customers:', error);
      throw new HttpException('Failed to retrieve customers', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get customer by ID',
    description: 'Retrieve a single customer'
  })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({ status: 200, description: 'Customer retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer')
  async getCustomer(@Param('id') customerId: string) {
    try {
      const customer = await this.customerService.findById(customerId);
      if (!customer) {
        throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
      }
      return { success: true, data: customer, message: 'Customer retrieved successfully' };
    } catch (error) {
      this.logger.error(`Error getting customer ${customerId}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve customer', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create customer',
    description: 'Create a new customer'
  })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep')
  async createCustomer(@Body() createCustomerDto: any, @Request() req) {
    try {
      const createdBy = req?.user?.email || req?.user?.id || 'system_user';
      const organizationId = req?.user?.organizationId || req?.user?.tenantId;
      const payload = {
        ...createCustomerDto,
        organizationId: createCustomerDto.organizationId || organizationId,
      };
      payload.customerCode =
        payload.customerCode ||
        `C-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, '0')}`;
      const customer = await this.customerService.createCustomer(payload, createdBy);
      return { success: true, data: customer, message: 'Customer created successfully' };
    } catch (error) {
      this.logger.error('Error creating customer:', error);
      throw new HttpException('Failed to create customer', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update customer',
    description: 'Update an existing customer'
  })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep')
  async updateCustomer(
    @Param('id') customerId: string,
    @Body() updateCustomerDto: any,
    @Request() req
  ) {
    try {
      const updatedBy = req?.user?.email || req?.user?.id || 'system_user';
      const organizationId = req?.user?.organizationId || req?.user?.tenantId;
      const payload = {
        ...updateCustomerDto,
        organizationId: updateCustomerDto.organizationId || organizationId,
      };
      const customer = await this.customerService.updateCustomer(customerId, payload, updatedBy);
      return { success: true, data: customer, message: 'Customer updated successfully' };
    } catch (error) {
      this.logger.error(`Error updating customer ${customerId}:`, error);
      throw new HttpException('Failed to update customer', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete customer',
    description: 'Soft-delete a customer'
  })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep')
  async deleteCustomer(@Param('id') customerId: string, @Request() req) {
    try {
      const deletedBy = req?.user?.email || req?.user?.id || 'system_user';
      const result = await this.customerService.deleteCustomer(customerId, deletedBy);
      return { success: true, data: result, message: 'Customer deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting customer ${customerId}:`, error);
      throw new HttpException('Failed to delete customer', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/contacts')
  @ApiOperation({
    summary: 'Get customer contacts',
    description: 'Retrieve all contacts associated with a customer'
  })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({ status: 200, description: 'Customer contacts retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer')
  async getCustomerContacts(@Param('id') customerId: string) {
    try {
      const contacts = await this.customerService.findAllContacts(customerId);

      return {
        success: true,
        data: contacts,
        message: 'Customer contacts retrieved successfully',
      };
    } catch (error) {
      this.logger.error(`Error getting customer contacts ${customerId}:`, error);
      throw new HttpException('Failed to retrieve customer contacts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/contacts')
  @ApiOperation({
    summary: 'Create customer contact',
    description: 'Create a new contact for a customer'
  })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({ status: 201, description: 'Contact created successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep')
  async createCustomerContact(
    @Param('id') customerId: string,
    @Body() createContactDto: any
  ) {
    try {
      const contactData = {
        ...createContactDto,
        customerId,
      };

      const contact = await this.customerService.createContact(
        contactData,
        'system_user'
      );

      return {
        success: true,
        data: contact,
        message: 'Contact created successfully',
      };
    } catch (error) {
      this.logger.error('Error creating customer contact:', error);
      throw new HttpException('Failed to create customer contact', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('contacts/:contactId')
  @ApiOperation({
    summary: 'Update customer contact',
    description: 'Update an existing customer contact'
  })
  @ApiParam({ name: 'contactId', description: 'Contact UUID' })
  @ApiResponse({ status: 200, description: 'Contact updated successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep')
  async updateCustomerContact(
    @Param('contactId') contactId: string,
    @Body() updateContactDto: any
  ) {
    try {
      const contact = await this.customerService.updateContact(
        contactId,
        updateContactDto,
        'system_user'
      );

      return {
        success: true,
        data: contact,
        message: 'Contact updated successfully',
      };
    } catch (error) {
      this.logger.error(`Error updating contact ${contactId}:`, error);
      throw new HttpException('Failed to update contact', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/interactions')
  @ApiOperation({
    summary: 'Create customer interaction',
    description: 'Log a new interaction with a customer'
  })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({ status: 201, description: 'Interaction created successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep')
  async createCustomerInteraction(
    @Param('id') customerId: string,
    @Body() createInteractionDto: any
  ) {
    try {
      const interactionData = {
        ...createInteractionDto,
        customerId,
      };

      const interaction = await this.customerService.createInteraction(
        interactionData,
        'system_user'
      );

      return {
        success: true,
        data: interaction,
        message: 'Interaction created successfully',
      };
    } catch (error) {
      this.logger.error('Error creating customer interaction:', error);
      throw new HttpException('Failed to create customer interaction', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/health')
  @ApiOperation({
    summary: 'Get customer health score',
    description: 'Get comprehensive customer health metrics and risk assessment'
  })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({ status: 200, description: 'Customer health retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer')
  async getCustomerHealth(@Param('id') customerId: string) {
    try {
      const health = await this.customerService.getCustomerHealth(customerId);

      return {
        success: true,
        data: health,
        message: 'Customer health retrieved successfully',
      };
    } catch (error) {
      this.logger.error(`Error getting customer health ${customerId}:`, error);
      throw new HttpException('Failed to retrieve customer health', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('segment')
  @ApiOperation({
    summary: 'Segment customers',
    description: 'Create customer segments based on specified criteria'
  })
  @ApiResponse({ status: 200, description: 'Customer segmentation completed successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'marketing')
  async segmentCustomers(@Body() segmentCriteria: any) {
    try {
      const segmentation = await this.customerService.segmentCustomers(segmentCriteria);

      return {
        success: true,
        data: segmentation,
        message: 'Customer segmentation completed successfully',
      };
    } catch (error) {
      this.logger.error('Error segmenting customers:', error);
      throw new HttpException('Failed to segment customers', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/timeline')
  @ApiOperation({
    summary: 'Get customer timeline',
    description: 'Get chronological timeline of all customer interactions'
  })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false })
  @ApiResponse({ status: 200, description: 'Customer timeline retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer')
  async getCustomerTimeline(
    @Param('id') customerId: string,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
  ) {
    try {
      const timeline = await this.customerService.getCustomerTimeline(customerId);

      return {
        success: true,
        data: timeline,
        message: 'Customer timeline retrieved successfully',
      };
    } catch (error) {
      this.logger.error(`Error getting customer timeline ${customerId}:`, error);
      throw new HttpException('Failed to retrieve customer timeline', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('analytics/churn-risk')
  @ApiOperation({
    summary: 'Get churn risk analysis',
    description: 'Get customers at risk of churning with AI predictions'
  })
  @ApiQuery({ name: 'riskLevel', required: false, enum: ['high', 'medium', 'low'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Churn risk analysis retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'customer_success')
  async getChurnRiskAnalysis(
    @Query('riskLevel') riskLevel?: string,
    @Query('limit') limit = 50,
  ) {
    try {
      // Mock implementation - replace with actual AI-powered churn analysis
      const churnRiskAnalysis = {
        summary: {
          totalCustomers: 1547,
          highRisk: 45,
          mediumRisk: 89,
          lowRisk: 1413,
          churnRateLastMonth: 2.1,
          predictedChurnNext30Days: 12,
        },
        riskFactors: [
          'Decreased engagement',
          'Payment delays',
          'Support ticket frequency',
          'Feature usage decline',
          'Contract renewal approaching',
        ],
        recommendations: [
          'Proactive outreach to high-risk customers',
          'Personalized retention campaigns',
          'Product training and support',
          'Competitive pricing analysis',
          'Success manager assignment',
        ],
        customers: [
          {
            id: 'CUST-001',
            name: 'TechCorp Industries',
            riskLevel: 'high',
            churnProbability: 85.2,
            riskFactors: ['Payment delay', 'Low engagement'],
            lastInteraction: '2024-01-15',
            lifetimeValue: 250000,
            recommendations: ['Immediate account manager contact', 'Payment plan discussion'],
          },
          {
            id: 'CUST-002',
            name: 'Global Manufacturing Ltd',
            riskLevel: 'medium',
            churnProbability: 62.8,
            riskFactors: ['Contract renewal in 30 days'],
            lastInteraction: '2024-02-10',
            lifetimeValue: 180000,
            recommendations: ['Renewal discussion', 'Value demonstration'],
          },
        ],
      };

      return {
        success: true,
        data: churnRiskAnalysis,
        message: 'Churn risk analysis retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting churn risk analysis:', error);
      throw new HttpException('Failed to retrieve churn risk analysis', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('analytics/lifetime-value')
  @ApiOperation({
    summary: 'Get customer lifetime value analysis',
    description: 'Get customer lifetime value metrics and predictions'
  })
  @ApiQuery({ name: 'segment', required: false })
  @ApiQuery({ name: 'industry', required: false })
  @ApiResponse({ status: 200, description: 'Customer lifetime value analysis retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'marketing', 'viewer')
  async getLifetimeValueAnalysis(
    @Query('segment') segment?: string,
    @Query('industry') industry?: string,
  ) {
    try {
      // Mock implementation - replace with actual CLV analysis
      const clvAnalysis = {
        summary: {
          avgLifetimeValue: 125000,
          medianLifetimeValue: 85000,
          topTierCustomers: 156,
          totalCustomerValue: 193275000,
          predictedGrowth: 12.5,
        },
        segments: [
          {
            segment: 'Enterprise',
            avgClv: 450000,
            customerCount: 156,
            totalValue: 70200000,
            retentionRate: 95.2,
          },
          {
            segment: 'SMB',
            avgClv: 85000,
            customerCount: 892,
            totalValue: 75820000,
            retentionRate: 87.3,
          },
          {
            segment: 'Startup',
            avgClv: 25000,
            customerCount: 499,
            totalValue: 12475000,
            retentionRate: 72.1,
          },
        ],
        topCustomers: [
          {
            id: 'CUST-001',
            name: 'TechCorp Industries',
            clv: 850000,
            actualRevenue: 650000,
            predictedRevenue: 200000,
            retentionProbability: 92.5,
          },
        ],
        clvDrivers: [
          'Contract value',
          'Retention rate',
          'Upsell potential',
          'Referral value',
          'Support costs',
        ],
      };

      return {
        success: true,
        data: clvAnalysis,
        message: 'Customer lifetime value analysis retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting lifetime value analysis:', error);
      throw new HttpException('Failed to retrieve lifetime value analysis', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
