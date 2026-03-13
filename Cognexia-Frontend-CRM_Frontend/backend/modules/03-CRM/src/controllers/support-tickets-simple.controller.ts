import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('support-tickets')
@UseGuards(JwtAuthGuard)
export class SupportTicketsSimpleController {
  @Get()
  async getAllTickets(
    @Query('status') status?: string,
    @Query('organizationId') organizationId?: string,
  ) {
    const mockTickets = [
      {
        id: 'ticket-1',
        ticketNumber: 'TICKET-000001',
        subject: 'Cannot access advanced reporting',
        status: 'open',
        priority: 'high',
        category: 'technical',
        organizationName: 'CognexiaAI HQ',
        submittedBy: 'John Doe',
        assignedTo: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ticket-2',
        ticketNumber: 'TICKET-000002',
        subject: 'Billing inquiry - upgrade to Premium',
        status: 'in_progress',
        priority: 'medium',
        category: 'billing',
        organizationName: 'Acme Corp',
        submittedBy: 'Jane Smith',
        assignedTo: 'Support Manager',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ticket-3',
        ticketNumber: 'TICKET-000003',
        subject: 'Feature request: Custom workflows',
        status: 'resolved',
        priority: 'low',
        category: 'feature_request',
        organizationName: 'Tech Solutions Inc',
        submittedBy: 'Bob Johnson',
        assignedTo: 'Technical Specialist',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    let filtered = mockTickets;
    if (status) filtered = filtered.filter(t => t.status === status);
    if (organizationId) filtered = filtered.filter(t => t.organizationName === organizationId);

    return {
      success: true,
      data: filtered,
      pagination: {
        total: filtered.length,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    };
  }

  @Get('stats/overview')
  async getTicketStats(@Query('organizationId') organizationId?: string) {
    return {
      success: true,
      data: {
        total: 125,
        byStatus: {
          open: 23,
          inProgress: 15,
          waitingResponse: 8,
          resolved: 67,
          closed: 12,
        },
        responseRate: 92,
        avgResolutionTime: 245, // minutes
        satisfactionScore: 4.3,
      },
    };
  }

  @Get(':id')
  async getTicket(@Param('id') id: string) {
    return {
      success: true,
      data: {
        id,
        ticketNumber: 'TICKET-000001',
        organizationId: '57f17f0c-73d1-4b22-8065-cb6f534f15aa',
        organizationName: 'CognexiaAI HQ',
        subject: 'Cannot access advanced reporting',
        description: 'We upgraded to Premium but still cannot see the Advanced Reporting feature.',
        status: 'open',
        priority: 'high',
        category: 'technical',
        channel: 'portal',
        submittedBy: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@acme.com',
        },
        assignedTo: null,
        messages: [
          {
            id: '1',
            sender: 'user-123',
            senderName: 'John Doe',
            text: 'We upgraded to Premium but still cannot see the Advanced Reporting feature.',
            timestamp: new Date().toISOString(),
            isInternal: false,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }

  @Post()
  async createTicket(@Body() body: any, @Request() req: any) {
    const ticketNumber = `TICKET-${String(Date.now()).slice(-6)}`;

    return {
      success: true,
      message: 'Ticket created successfully',
      data: {
        id: Date.now().toString(),
        ticketNumber,
        subject: body.subject,
        status: 'open',
      },
    };
  }

  @Put(':id/assign')
  async assignTicket(@Param('id') id: string, @Body() body: { assignedTo: string }) {
    return {
      success: true,
      message: 'Ticket assigned successfully',
      data: {
        id,
        assignedTo: body.assignedTo,
        updatedAt: new Date().toISOString(),
      },
    };
  }

  @Put(':id/status')
  async updateTicketStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return {
      success: true,
      message: 'Ticket status updated',
      data: {
        id,
        status: body.status,
        updatedAt: new Date().toISOString(),
      },
    };
  }

  @Post(':id/message')
  async addMessage(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return {
      success: true,
      message: 'Message added successfully',
      data: {
        id: Date.now().toString(),
        text: body.text,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Post(':id/rate')
  async rateTicket(@Param('id') id: string, @Body() body: { rating: number }) {
    return {
      success: true,
      message: 'Rating submitted successfully',
    };
  }
}
