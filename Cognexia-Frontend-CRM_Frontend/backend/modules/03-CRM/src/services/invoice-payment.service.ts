import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from '../dto/advanced-financial.dto';

@Injectable()
export class InvoicePaymentService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
  ) {}

  async createInvoice(dto: CreateInvoiceDto): Promise<Invoice> {
    const subtotal = dto.line_items.reduce((sum, item) => sum + item.amount, 0);
    const total = subtotal + (dto.tax_amount || 0);

    const invoice = this.invoiceRepository.create({
      ...dto,
      invoice_number: `INV-${Date.now()}`,
      subtotal,
      total_amount: total,
      status: 'pending',
    });

    return await this.invoiceRepository.save(invoice);
  }

  async getInvoices(organizationId?: string): Promise<Invoice[]> {
    const query = this.invoiceRepository
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.organization', 'org');
    
    if (organizationId) {
      query.where('inv.organization_id = :orgId', { orgId: organizationId });
    }
    
    return await query.orderBy('inv.invoice_date', 'DESC').getMany();
  }

  async updateStatus(id: string, dto: UpdateInvoiceStatusDto): Promise<Invoice> {
    const updates: any = { status: dto.status };
    
    if (dto.status === 'paid') {
      updates.payment_date = new Date();
      updates.payment_method = dto.payment_method;
    }

    await this.invoiceRepository.update(id, updates);
    return await this.invoiceRepository.findOne({ where: { id } });
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    return await this.invoiceRepository
      .createQueryBuilder('inv')
      .where('inv.status = :status', { status: 'pending' })
      .andWhere('inv.due_date < CURRENT_DATE')
      .orderBy('inv.due_date', 'ASC')
      .getMany();
  }

  async getStats(): Promise<any> {
    const all = await this.invoiceRepository.find();
    const paid = all.filter(i => i.status === 'paid');
    const pending = all.filter(i => i.status === 'pending');

    return {
      total: all.length,
      paid: paid.length,
      pending: pending.length,
      overdue: all.filter(i => i.status === 'overdue').length,
      total_revenue: paid.reduce((sum, i) => sum + Number(i.total_amount), 0),
      outstanding_amount: pending.reduce((sum, i) => sum + Number(i.total_amount), 0),
    };
  }
}
