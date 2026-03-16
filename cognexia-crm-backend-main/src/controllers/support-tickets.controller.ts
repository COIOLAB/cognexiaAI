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
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { 
  SupportTicket, 
  TicketStatus, 
  TicketPriority, 
  TicketCategory, 
  TicketChannel 
} from '../entities/support-ticket.entity';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';

@Controller('support-tickets')
@UseGuards(JwtAuthGuard)
export class SupportTicketsController {
  constructor(
    @InjectRepository(SupportTicket)
    private ticketRepository: Repository<SupportTicket>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  @Get()
  async getAllTickets(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
    @Query('organizationId') organizationId?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
  ) {
    try {
      const page = parseInt(pageParam || '1', 10);
      const limit = parseInt(limitParam || '20', 10);

      const where: any = {};
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (category) where.category = category;
      if (organizationId) where.organizationId = organizationId;
      if (assignedTo) where.assignedTo = assignedTo;

      const [tickets, total] = await this.ticketRepository.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      // Manually fetch related data
      const enrichedTickets = await Promise.all(
        tickets.map(async (ticket) => {
          const [organization, submittedByUser, assignedToUser] = await Promise.all([
            this.organizationRepository.findOne({ where: { id: ticket.organizationId } }),
            this.userRepository.findOne({ where: { id: ticket.submittedBy } }),
            ticket.assignedTo ? this.userRepository.findOne({ where: { id: ticket.assignedTo } }) : null,
          ]);

          return {
            id: ticket.id,
            ticketNumber: ticket.ticketNumber,
            subject: ticket.subject,
            status: ticket.status,
            priority: ticket.priority,
            category: ticket.category,
            organizationName: organization?.name || 'Unknown',
            submittedBy: submittedByUser
              ? `${submittedByUser.firstName} ${submittedByUser.lastName}`
              : 'Unknown',
            assignedTo: assignedToUser
              ? `${assignedToUser.firstName} ${assignedToUser.lastName}`
              : null,
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt,
          };
        })
      );

      return {
        success: true,
        data: enrichedTickets,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw new HttpException('Failed to fetch support tickets', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getTicket(@Param('id') id: string) {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['organization', 'submittedByUser', 'assignedToUser'],
    });

    if (!ticket) {
      throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
    }

    return {
      success: true,
      data: ticket,
    };
  }

  @Post()
  async createTicket(
    @Body()
    body: {
      organizationId: string;
      subject: string;
      description: string;
      category: TicketCategory;
      priority?: TicketPriority;
      channel?: string;
    },
    @Request() req: any,
  ) {
    // Generate ticket number
    const count = await this.ticketRepository.count();
    const ticketNumber =`TICKET-${String(count + 1).padStart(6, '0')}`;
    const resolvedChannel =
      body.channel && Object.values(TicketChannel).includes(body.channel as TicketChannel)
        ? (body.channel as TicketChannel)
        : TicketChannel.WEB;

        

    const ticket = this.ticketRepository.create({
      ticketNumber,
      organizationId: body.organizationId || req.user.organizationId,
      submittedBy: req.user.userId,
      subject: body.subject,
      description: body.description,
      category: body.category,
      priority: body.priority || TicketPriority.MEDIUM,
      channel: resolvedChannel,
      status: TicketStatus.OPEN,
      messages: [
        {
          id: Date.now().toString(),
          from: req.user.userId, fromName: `${req.user.firstName} ${req.user.lastName}`, message: body.description,
          timestamp: new Date().toISOString(),
          isInternal: false,
        },
      ],
    } as Partial<SupportTicket>);

    await this.ticketRepository.save(ticket);

    return {
      success: true,
      message: 'Ticket created successfully',
      data: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
      },
    };
  }

  @Put(':id/assign')
  async assignTicket(
    @Param('id') id: string,
    @Body() body: { assignedTo: string },
  ) {
    const ticket = await this.ticketRepository.findOne({ where: { id } });

    if (!ticket) {
      throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
    }

    ticket.assignedTo = body.assignedTo;
    ticket.status = TicketStatus.IN_PROGRESS;
    ticket.updatedAt = new Date();

    await this.ticketRepository.save(ticket);

    return {
      success: true,
      message: 'Ticket assigned successfully',
      data: ticket,
    };
  }

  @Put(':id/status')
  async updateTicketStatus(
    @Param('id') id: string,
    @Body() body: { status: TicketStatus },
  ) {
    const ticket = await this.ticketRepository.findOne({ where: { id } });

    if (!ticket) {
      throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
    }

    ticket.status = body.status;

    if (body.status === TicketStatus.RESOLVED) {
      ticket.resolvedAt = new Date();
      if (ticket.createdAt) {
        const diff = new Date().getTime() - new Date(ticket.createdAt).getTime();
        ticket.resolutionTime = Math.floor(diff / 60000); // minutes
      }
    } else if (body.status === TicketStatus.CLOSED) {
      ticket.closedAt = new Date();
    }

    ticket.updatedAt = new Date();

    await this.ticketRepository.save(ticket);

    return {
      success: true,
      message: 'Ticket status updated',
      data: ticket,
    };
  }

  @Post(':id/message')
  async addMessage(
    @Param('id') id: string,
    @Body() body: { text: string; isInternal?: boolean },
    @Request() req: any,
  ) {
    const ticket = await this.ticketRepository.findOne({ where: { id } });

    if (!ticket) {
      throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
    }

    const message = {
      id: Date.now().toString(),
      from: req.user.userId, fromName: `${req.user.firstName} ${req.user.lastName}`, message: body.text,
      timestamp: new Date().toISOString(),
      isInternal: body.isInternal || false,
    };

    const messages = Array.isArray(ticket.messages) ? ticket.messages : [];
    ticket.messages = [...messages, message];

    if (!ticket.firstRespondedAt && req.user.userType === 'super_admin') {
      ticket.firstRespondedAt = new Date();
    }

    ticket.updatedAt = new Date();

    await this.ticketRepository.save(ticket);

    return {
      success: true,
      message: 'Message added successfully',
      data: message,
    };
  }

  @Get('stats/overview')
  async getTicketStats(@Query('organizationId') organizationId?: string) {
    const where = organizationId ? { organizationId } : {};

    const [total, open, inProgress, resolved, closed] = await Promise.all([
      this.ticketRepository.count({ where }),
      this.ticketRepository.count({ where: { ...where, status: TicketStatus.OPEN } }),
      this.ticketRepository.count({ where: { ...where, status: TicketStatus.IN_PROGRESS } }),
      this.ticketRepository.count({ where: { ...where, status: TicketStatus.RESOLVED } }),
      this.ticketRepository.count({ where: { ...where, status: TicketStatus.CLOSED } }),
    ]);

    return {
      success: true,
      data: {
        total,
        byStatus: {
          open,
          inProgress,
          waitingResponse: 0,
          resolved,
          closed,
        },
        responseRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      },
    };
  }

  @Post(':id/rate')
  async rateTicket(
    @Param('id') id: string,
    @Body() body: { rating: number },
  ) {
    const ticket = await this.ticketRepository.findOne({ where: { id } });

    if (!ticket) {
      throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
    }

    if (body.rating < 1 || body.rating > 5) {
      throw new HttpException('Rating must be between 1 and 5', HttpStatus.BAD_REQUEST);
    }

    ticket.customerSatisfactionRating = body.rating;
    ticket.updatedAt = new Date();

    await this.ticketRepository.save(ticket);

    return {
      success: true,
      message: 'Rating submitted successfully',
    };
  }
}
