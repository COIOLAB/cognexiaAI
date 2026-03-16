import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminSupportTicketService } from '../services/admin-support-ticket.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { TicketStatus } from '../entities/admin-support-ticket.entity';

@ApiTags('Admin Support Tickets')
@ApiBearerAuth()
@Controller('admin-support-tickets')
// @UseGuards(JwtAuthGuard, RBACGuard)
// @Roles('super_admin')
export class AdminSupportTicketController {
  constructor(private readonly service: AdminSupportTicketService) {}

  @Get()
  async getAllTickets(@Query('status') status?: TicketStatus) {
    return this.service.getAllTickets(status);
  }

  @Get('stats')
  async getStats() {
    return this.service.getTicketStats();
  }

  @Post(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: TicketStatus) {
    return this.service.updateTicketStatus(id, status);
  }

  @Post(':id/assign')
  async assignTicket(@Param('id') id: string, @Body('assignedTo') assignedTo: string) {
    return this.service.assignTicket(id, assignedTo);
  }
}
