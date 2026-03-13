import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminSupportTicket, TicketStatus, TicketPriority } from '../entities/admin-support-ticket.entity';

@Injectable()
export class AdminSupportTicketService {
  constructor(
    @InjectRepository(AdminSupportTicket)
    private ticketRepository: Repository<AdminSupportTicket>,
  ) {}

  async getAllTickets(status?: TicketStatus) {
    const where = status ? { status } : {};
    return this.ticketRepository.find({ where, order: { createdAt: 'DESC' }, take: 100 });
  }

  async getTicketStats() {
    const all = await this.ticketRepository.find();
    return {
      total: all.length,
      open: all.filter(t => t.status === TicketStatus.OPEN).length,
      inProgress: all.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
      resolved: all.filter(t => t.status === TicketStatus.RESOLVED).length,
      avgResolutionTime: 24, // hours
      urgentTickets: all.filter(t => t.priority === TicketPriority.URGENT).length,
    };
  }

  async updateTicketStatus(id: string, status: TicketStatus) {
    await this.ticketRepository.update({ id }, { status });
    return this.ticketRepository.findOne({ where: { id } });
  }

  async assignTicket(id: string, assignedTo: string) {
    await this.ticketRepository.update({ id }, { assignedTo, status: TicketStatus.IN_PROGRESS });
    return this.ticketRepository.findOne({ where: { id } });
  }
}
