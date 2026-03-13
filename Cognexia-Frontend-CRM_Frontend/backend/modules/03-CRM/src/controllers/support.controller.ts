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
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService, CreateTicketDto, UpdateTicketDto, TicketSearchCriteria } from '../services/support.service';
import { SupportTicket } from '../entities/support-ticket.entity';

@ApiTags('Support & Service')
@Controller('api/crm/support')
@ApiBearerAuth()
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  @ApiOperation({ summary: 'Create a new support ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createTicket(@Body() createDto: CreateTicketDto): Promise<SupportTicket> {
    return await this.supportService.createTicket(createDto);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Search and list support tickets' })
  @ApiResponse({ status: 200, description: 'List of tickets' })
  async searchTickets(@Query() criteria: TicketSearchCriteria): Promise<SupportTicket[]> {
    return await this.supportService.searchTickets(criteria);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiResponse({ status: 200, description: 'Ticket details' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getTicket(@Param('id') id: string): Promise<SupportTicket> {
    return await this.supportService.getTicketById(id);
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
