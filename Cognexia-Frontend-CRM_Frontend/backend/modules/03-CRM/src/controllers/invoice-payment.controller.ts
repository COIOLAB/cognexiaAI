import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { InvoicePaymentService } from '../services/invoice-payment.service';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from '../dto/advanced-financial.dto';

@ApiTags('Invoice & Payment Management')
@Controller('invoices')
// @UseGuards(JwtAuthGuard, RBACGuard)
@ApiBearerAuth()
export class InvoicePaymentController {
  constructor(private readonly service: InvoicePaymentService) {}

  @Get()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get all invoices' })
  async getInvoices(@Query('organizationId') organizationId?: string) {
    return await this.service.getInvoices(organizationId);
  }

  @Post()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create invoice' })
  async createInvoice(@Body() dto: CreateInvoiceDto) {
    return await this.service.createInvoice(dto);
  }

  @Put(':id/status')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Update invoice status' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateInvoiceStatusDto) {
    return await this.service.updateStatus(id, dto);
  }

  @Get('overdue')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get overdue invoices' })
  async getOverdueInvoices() {
    return await this.service.getOverdueInvoices();
  }

  @Get('stats')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Get invoice statistics' })
  async getStats() {
    return await this.service.getStats();
  }
}
