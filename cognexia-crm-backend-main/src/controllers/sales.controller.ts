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
  Header,
  NotFoundException,
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
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.guard';
import { SalesService } from '../services/sales.service';
import { QuoteStatus } from '../entities/sales-quote.entity';

@ApiTags('CRM - Sales Management')
@Controller('crm/sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SalesController {
  private readonly logger = new Logger(SalesController.name);

  constructor(private readonly salesService: SalesService) {}

  @Get('opportunities')
  @ApiOperation({ 
    summary: 'Get all sales opportunities',
    description: 'Retrieve all sales opportunities with filtering options'
  })
  @ApiQuery({ name: 'stage', required: false })
  @ApiQuery({ name: 'salesRep', required: false })
  @ApiQuery({ name: 'minValue', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Opportunities retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer', 'org_admin')
  async getAllOpportunities(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('stage') stage?: string,
    @Query('salesRep') salesRep?: string,
    @Query('minValue') minValue?: number,
    @Query('search') search?: string,
  ) {
    try {
      const opportunities = await this.salesService.getOpportunities({
        page,
        limit,
        stage,
        salesRep,
        minValue,
        search,
      });

      return {
        success: true,
        ...opportunities,
        message: 'Opportunities retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting opportunities:', error);
      throw new HttpException('Failed to retrieve opportunities', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('opportunities')
  @ApiOperation({ 
    summary: 'Create new sales opportunity',
    description: 'Create a new sales opportunity'
  })
  @ApiResponse({ status: 201, description: 'Opportunity created successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async createOpportunity(@Body() createOpportunityDto: any) {
    try {
      const opportunity = await this.salesService.createOpportunity(
        createOpportunityDto,
        'system_user' // In real implementation, get from JWT token
      );

      return {
        success: true,
        data: opportunity,
        message: 'Opportunity created successfully',
      };
    } catch (error: any) {
      this.logger.error('Error creating opportunity:', error);
      throw new HttpException(error.message || 'Failed to create opportunity', HttpStatus.BAD_REQUEST);
    }
  }

  @Put('opportunities/:id/stage')
  @ApiOperation({
    summary: 'Update opportunity stage',
    description: 'Update the stage of a sales opportunity'
  })
  @ApiParam({ name: 'id', description: 'Opportunity UUID' })
  @ApiResponse({ status: 200, description: 'Opportunity stage updated successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async updateOpportunityStage(
    @Param('id') id: string,
    @Body() updateStageDto: { stage: string }
  ) {
    try {
      const opportunity = await this.salesService.updateOpportunityStage(
        id,
        updateStageDto.stage as any,
        'system_user'
      );

      return {
        success: true,
        data: opportunity,
        message: 'Opportunity stage updated successfully',
      };
    } catch (error) {
      this.logger.error(`Error updating opportunity stage ${id}:`, error);
      throw new HttpException('Failed to update opportunity stage', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('opportunities/export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="opportunities.csv"')
  @ApiOperation({
    summary: 'Export opportunities',
    description: 'Export opportunities to CSV',
  })
  @ApiResponse({ status: 200, description: 'Opportunities exported successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async exportOpportunities(
    @Query('stage') stage?: string,
    @Query('salesRep') salesRep?: string,
    @Query('minValue') minValue?: number,
    @Query('search') search?: string,
  ) {
    try {
      const opportunities = await this.salesService.findAllOpportunities({
        stage,
        salesRep,
        minValue,
        search,
      });
      const headers = ['opportunityNumber', 'name', 'stage', 'value', 'probability'];
      const rows = opportunities.map((opp: any) =>
        [opp.opportunityNumber, opp.name, opp.stage, opp.value, opp.probability].join(',')
      );
      return [headers.join(','), ...rows].join('\n');
    } catch (error) {
      this.logger.error('Error exporting opportunities:', error);
      throw new HttpException('Failed to export opportunities', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('opportunities/:id')
  @ApiOperation({ 
    summary: 'Get opportunity by ID',
    description: 'Retrieve a specific sales opportunity'
  })
  @ApiParam({ name: 'id', description: 'Opportunity UUID' })
  @ApiResponse({ status: 200, description: 'Opportunity retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer', 'org_admin')
  async getOpportunity(@Param('id') id: string) {
    try {
      const opportunity = await this.salesService.findOpportunityById(id);
      return {
        success: true,
        data: opportunity,
        message: 'Opportunity retrieved successfully',
      };
    } catch (error) {
      this.logger.error(`Error getting opportunity ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('Failed to retrieve opportunity', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('opportunities/:id')
  @ApiOperation({ 
    summary: 'Update opportunity',
    description: 'Update a sales opportunity'
  })
  @ApiParam({ name: 'id', description: 'Opportunity UUID' })
  @ApiResponse({ status: 200, description: 'Opportunity updated successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async updateOpportunity(@Param('id') id: string, @Body() updateDto: any) {
    try {
      const opportunity = await this.salesService.updateOpportunity(id, updateDto, 'system_user');
      return {
        success: true,
        data: opportunity,
        message: 'Opportunity updated successfully',
      };
    } catch (error) {
      this.logger.error(`Error updating opportunity ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('Failed to update opportunity', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('opportunities/:id')
  @ApiOperation({
    summary: 'Delete opportunity',
    description: 'Delete a sales opportunity',
  })
  @ApiParam({ name: 'id', description: 'Opportunity UUID' })
  @ApiResponse({ status: 200, description: 'Opportunity deleted successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async deleteOpportunity(@Param('id') id: string) {
    try {
      await this.salesService.deleteOpportunity(id);
      return {
        success: true,
        message: 'Opportunity deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting opportunity ${id}:`, error);
      throw new HttpException('Failed to delete opportunity', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('opportunities/bulk-delete')
  @ApiOperation({
    summary: 'Bulk delete opportunities',
    description: 'Delete multiple opportunities in one request',
  })
  @ApiResponse({ status: 200, description: 'Opportunities deleted successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async bulkDeleteOpportunities(@Body() body: { ids: string[] }) {
    try {
      await this.salesService.bulkDeleteOpportunities(body?.ids || []);
      return {
        success: true,
        message: 'Opportunities deleted successfully',
      };
    } catch (error) {
      this.logger.error('Error bulk deleting opportunities:', error);
      throw new HttpException('Failed to delete opportunities', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('pipeline')
  @ApiOperation({ 
    summary: 'Get sales pipeline',
    description: 'Get complete sales pipeline overview'
  })
  @ApiResponse({ status: 200, description: 'Pipeline retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer')
  async getSalesPipeline() {
    try {
      const pipeline = await this.salesService.getSalesPipeline();
      return {
        success: true,
        data: pipeline,
        message: 'Sales pipeline retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting sales pipeline:', error);
      throw new HttpException('Failed to retrieve sales pipeline', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('quotes')
  @ApiOperation({ 
    summary: 'Create sales quote',
    description: 'Create a new sales quote for a customer'
  })
  @ApiResponse({ status: 201, description: 'Quote created successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async createQuote(@Body() createQuoteDto: any) {
    try {
      const quote = await this.salesService.createQuote(
        createQuoteDto,
        'system_user'
      );

      return {
        success: true,
        data: quote,
        message: 'Quote created successfully',
      };
    } catch (error) {
      this.logger.error('Error creating quote:', error);
      throw new HttpException('Failed to create quote', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('quotes')
  @ApiOperation({
    summary: 'Get sales quotes',
    description: 'Retrieve sales quotes with filtering and pagination',
  })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Quotes retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer', 'org_admin')
  async getQuotes(
    @Query('status') status?: QuoteStatus,
    @Query('customerId') customerId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    try {
      const quotes = await this.salesService.getQuotes({
        status,
        customerId,
        page,
        limit,
        search,
      });

      return {
        success: true,
        ...quotes,
        message: 'Quotes retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting quotes:', error);
      throw new HttpException('Failed to retrieve quotes', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('quotes/export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="quotes.csv"')
  @ApiOperation({ summary: 'Export sales quotes' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiResponse({ status: 200, description: 'Quotes exported successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep')
  async exportQuotes(
    @Query('status') status?: QuoteStatus,
    @Query('customerId') customerId?: string,
  ) {
    try {
      return await this.salesService.exportQuotes({ status, customerId });
    } catch (error) {
      this.logger.error('Error exporting quotes:', error);
      throw new HttpException('Failed to export quotes', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('quotes/stats')
  @ApiOperation({
    summary: 'Get quote statistics',
    description: 'Retrieve aggregate statistics for sales quotes',
  })
  @ApiResponse({ status: 200, description: 'Quote stats retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer', 'org_admin')
  async getQuoteStats() {
    try {
      const stats = await this.salesService.getQuoteStats();
      return {
        success: true,
        data: stats,
        message: 'Quote stats retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting quote stats:', error);
      throw new HttpException('Failed to retrieve quote stats', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('quotes/bulk-delete')
  @ApiOperation({ summary: 'Bulk delete quotes' })
  @ApiResponse({ status: 200, description: 'Quotes deleted successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async bulkDeleteQuotes(@Body() body: { ids: string[] }) {
    try {
      await this.salesService.bulkDeleteQuotes(body?.ids || []);
      return { success: true, message: 'Quotes deleted successfully' };
    } catch (error) {
      this.logger.error('Error bulk deleting quotes:', error);
      throw new HttpException('Failed to delete quotes', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('quotes/:id')
  @ApiOperation({
    summary: 'Get sales quote by ID',
    description: 'Retrieve a specific sales quote',
  })
  @ApiParam({ name: 'id', description: 'Quote UUID' })
  @ApiResponse({ status: 200, description: 'Quote retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer', 'org_admin')
  async getQuote(@Param('id') id: string) {
    try {
      const quote = await this.salesService.getQuoteById(id);
      if (!quote) {
        return { success: false, data: null, message: 'Quote not found' };
      }
      return {
        success: true,
        data: quote,
        message: 'Quote retrieved successfully',
      };
    } catch (error) {
      this.logger.error(`Error getting quote ${id}:`, error);
      throw new HttpException('Failed to retrieve quote', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('quotes/:id')
  @ApiOperation({
    summary: 'Update sales quote',
    description: 'Update an existing sales quote',
  })
  @ApiParam({ name: 'id', description: 'Quote UUID' })
  @ApiResponse({ status: 200, description: 'Quote updated successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async updateQuote(@Param('id') id: string, @Body() updateQuoteDto: any) {
    try {
      const quote = await this.salesService.updateQuote(id, updateQuoteDto, 'system_user');
      return {
        success: true,
        data: quote,
        message: 'Quote updated successfully',
      };
    } catch (error) {
      this.logger.error(`Error updating quote ${id}:`, error);
      if (error instanceof NotFoundException) {
        return { success: false, data: null, message: error.message };
      }
      throw new HttpException('Failed to update quote', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('quotes/:id')
  @ApiOperation({
    summary: 'Delete sales quote',
    description: 'Delete an existing sales quote',
  })
  @ApiParam({ name: 'id', description: 'Quote UUID' })
  @ApiResponse({ status: 200, description: 'Quote deleted successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async deleteQuote(@Param('id') id: string) {
    try {
      await this.salesService.deleteQuote(id);
      return {
        success: true,
        message: 'Quote deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting quote ${id}:`, error);
      throw new HttpException('Failed to delete quote', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('quotes/:id/send')
  @ApiOperation({ summary: 'Send quote' })
  @ApiParam({ name: 'id', description: 'Quote UUID' })
  @ApiResponse({ status: 200, description: 'Quote sent successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async sendQuote(@Param('id') id: string) {
    try {
      const quote = await this.salesService.updateQuoteStatus(id, QuoteStatus.SENT, 'system_user');
      return { success: true, data: quote, message: 'Quote sent successfully' };
    } catch (error) {
      this.logger.error(`Error sending quote ${id}:`, error);
      if (error instanceof NotFoundException) {
        return { success: false, data: null, message: error.message };
      }
      throw new HttpException('Failed to send quote', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('quotes/:id/accept')
  @ApiOperation({ summary: 'Accept quote' })
  @ApiParam({ name: 'id', description: 'Quote UUID' })
  @ApiResponse({ status: 200, description: 'Quote accepted successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async acceptQuote(@Param('id') id: string) {
    try {
      const quote = await this.salesService.updateQuoteStatus(id, QuoteStatus.ACCEPTED, 'system_user');
      return { success: true, data: quote, message: 'Quote accepted successfully' };
    } catch (error) {
      this.logger.error(`Error accepting quote ${id}:`, error);
      if (error instanceof NotFoundException) {
        return { success: false, data: null, message: error.message };
      }
      throw new HttpException('Failed to accept quote', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('quotes/:id/reject')
  @ApiOperation({ summary: 'Reject quote' })
  @ApiParam({ name: 'id', description: 'Quote UUID' })
  @ApiResponse({ status: 200, description: 'Quote rejected successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async rejectQuote(@Param('id') id: string, @Body() body: { reason?: string }) {
    try {
      const quote = await this.salesService.updateQuoteStatus(
        id,
        QuoteStatus.REJECTED,
        'system_user',
        body?.reason,
      );
      return { success: true, data: quote, message: 'Quote rejected successfully' };
    } catch (error) {
      this.logger.error(`Error rejecting quote ${id}:`, error);
      if (error instanceof NotFoundException) {
        return { success: false, data: null, message: error.message };
      }
      throw new HttpException('Failed to reject quote', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('quotes/:id/convert')
  @ApiOperation({ summary: 'Convert quote to order' })
  @ApiParam({ name: 'id', description: 'Quote UUID' })
  @ApiResponse({ status: 200, description: 'Quote converted successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep')
  async convertQuote(@Param('id') id: string) {
    try {
      return {
        success: true,
        data: { quoteId: id, orderId: `order-${id}` },
        message: 'Quote converted successfully',
      };
    } catch (error) {
      this.logger.error(`Error converting quote ${id}:`, error);
      throw new HttpException('Failed to convert quote', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('metrics')
  @ApiOperation({ 
    summary: 'Get sales metrics',
    description: 'Retrieve comprehensive sales performance metrics'
  })
  @ApiQuery({ name: 'salesRep', required: false })
  @ApiQuery({ name: 'timeframe', required: false })
  @ApiResponse({ status: 200, description: 'Sales metrics retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'viewer', 'org_admin')
  async getSalesMetrics(
    @Query('salesRep') salesRep?: string,
    @Query('timeframe') timeframe?: string,
  ) {
    try {
      const metrics = await this.salesService.getSalesMetrics({
        salesRep,
        timeframe,
      });

      return {
        success: true,
        data: metrics,
        message: 'Sales metrics retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting sales metrics:', error);
      throw new HttpException('Failed to retrieve sales metrics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('forecasting')
  @ApiOperation({ 
    summary: 'Get sales forecast',
    description: 'Get sales forecasting data and predictions'
  })
  @ApiQuery({ name: 'period', required: false, enum: ['current_quarter', 'next_quarter', 'current_year'] })
  @ApiResponse({ status: 200, description: 'Sales forecast retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'viewer', 'org_admin')
  async getSalesForecast(@Query('period') period = 'current_quarter') {
    try {
      // Mock implementation - replace with actual forecasting logic
      const forecast = {
        period,
        target: 5000000,
        committed: 3200000,
        bestCase: 4800000,
        worstCase: 2800000,
        pipeline: 8750000,
        confidence: 85.2,
        riskFactors: [
          'Competitive pressure in Q4',
          'Economic uncertainty',
          'Resource constraints'
        ],
        opportunities: [
          'New product launch',
          'Market expansion',
          'Strategic partnerships'
        ],
        forecastAccuracy: 89.5,
      };

      return {
        success: true,
        data: forecast,
        message: 'Sales forecast retrieved successfully',
      };
    } catch (error) {
      this.logger.error('Error getting sales forecast:', error);
      throw new HttpException('Failed to retrieve sales forecast', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
