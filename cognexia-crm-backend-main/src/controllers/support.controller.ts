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
  HttpCode,
  Request,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService, CreateTicketDto, UpdateTicketDto, TicketSearchCriteria } from '../services/support.service';
import { SupportTicket } from '../entities/support-ticket.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CustomerService } from '../services/customer.service';

@ApiTags('Support & Service')
@Controller('crm/support')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupportController {
  constructor(private readonly supportService: SupportService, private readonly customerService: CustomerService) { }

  @Post('tickets')
  @ApiOperation({ summary: 'Create a new support ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createTicket(@Body() createDto: CreateTicketDto, @Request() req: any): Promise<SupportTicket> {
    const defaultOrgId = req.user?.organizationId;
    const defaultUserId = req.user?.userId || req.user?.id;

    // Accept either customer email or customer UUID
    const customer = await this.customerService.findByEmailOrId(createDto.customer_id);
    if (!customer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }
    createDto.customer_id = customer.id;
    console.log(customer);
    console.log(createDto);
    return await this.supportService.createTicket({
      ...createDto,
      organizationId: createDto.organizationId || defaultOrgId,
      submittedBy: createDto.submittedBy || defaultUserId,

    });
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Search and list support tickets' })
  @ApiResponse({ status: 200, description: 'List of tickets' })
  async searchTickets(@Query() criteria: TicketSearchCriteria): Promise<any> {
    const data = await this.supportService.searchTickets(criteria);
    return { data, total: data.length };
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiResponse({ status: 200, description: 'Ticket details' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getTicket(@Param('id') id: string): Promise<SupportTicket> {
    return await this.supportService.getTicketById(id);
  }

  @Delete('tickets/:id')
  @ApiOperation({ summary: 'Delete ticket' })
  @ApiResponse({ status: 200, description: 'Ticket deleted successfully' })
  @HttpCode(HttpStatus.OK)
  async deleteTicket(@Param('id') id: string): Promise<{ message: string }> {
    return await this.supportService.deleteTicket(id);
  }

  @Put('tickets/:id')
  @ApiOperation({ summary: 'Update ticket' })
  @ApiResponse({ status: 200, description: 'Ticket updated successfully' })
  async updateTicket(
    @Param('id') id: string,
    @Body() updateDto: UpdateTicketDto,
  ): Promise<SupportTicket> {
    return await this.supportService.updateTicket(id, updateDto);
  }

  @Post('tickets/:id/assign')
  @ApiOperation({ summary: 'Assign ticket to an agent' })
  @ApiResponse({ status: 200, description: 'Ticket assigned successfully' })
  @HttpCode(HttpStatus.OK)
  async assignTicket(
    @Param('id') id: string,
    @Body('agent_id') agentId: string,
  ): Promise<SupportTicket> {
    return await this.supportService.assignTicket(id, agentId);
  }

  @Post('tickets/:id/auto-assign')
  @ApiOperation({ summary: 'Auto-assign ticket using AI' })
  @ApiResponse({ status: 200, description: 'Ticket auto-assigned successfully' })
  @HttpCode(HttpStatus.OK)
  async autoAssignTicket(@Param('id') id: string): Promise<SupportTicket> {
    return await this.supportService.autoAssignTicket(id);
  }

  @Post('tickets/:id/escalate')
  @ApiOperation({ summary: 'Escalate ticket' })
  @ApiResponse({ status: 200, description: 'Ticket escalated successfully' })
  @HttpCode(HttpStatus.OK)
  async escalateTicket(
    @Param('id') id: string,
    @Body() body: { escalate_to: string; reason: string },
  ): Promise<SupportTicket> {
    return await this.supportService.escalateTicket(id, body.escalate_to, body.reason);
  }

  @Post('tickets/:id/response')
  @ApiOperation({ summary: 'Add response to ticket' })
  @ApiResponse({ status: 200, description: 'Response added successfully' })
  @HttpCode(HttpStatus.OK)
  async addResponse(
    @Param('id') id: string,
    @Body() body: { response: string; user_id: string },
  ): Promise<SupportTicket> {
    return await this.supportService.addResponse(id, body.response, body.user_id);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get ticket statistics' })
  @ApiResponse({ status: 200, description: 'Ticket statistics' })
  async getStatistics(
    @Query('start') start?: string,
    @Query('end') end?: string,
  ): Promise<any> {
    const timeRange = start && end
      ? { start: new Date(start), end: new Date(end) }
      : undefined;

    return await this.supportService.getTicketStatistics(timeRange);
  }

  @Get('knowledge-base/search')
  @ApiOperation({ summary: 'Search knowledge base' })
  @ApiResponse({ status: 200, description: 'Knowledge base articles' })
  async searchKnowledgeBase(
    @Query('q') query: string,
    @Query('limit') limit: number = 10,
  ): Promise<any> {
    return await this.supportService.searchKnowledgeBase(query, limit);
  }

  @Post('sla/check-compliance')
  @ApiOperation({ summary: 'Manually trigger SLA compliance check' })
  @ApiResponse({ status: 200, description: 'SLA compliance check completed' })
  @HttpCode(HttpStatus.OK)
  async checkSLACompliance(): Promise<{ message: string }> {
    await this.supportService.checkSLACompliance();
    return { message: 'SLA compliance check completed' };
  }
}
