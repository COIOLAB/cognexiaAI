import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RevenueBillingService } from '../services/revenue-billing.service';
import {
  CreateTransactionDto,
  RevenueOverviewDto,
  ChurnAnalysisDto,
  GetTransactionsQueryDto,
  FailedPaymentDto,
} from '../dto/revenue-billing.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { RevenueTransaction } from '../entities/revenue-transaction.entity';

@ApiTags('Revenue & Billing')
@ApiBearerAuth()
@Controller('revenue-billing')
// @UseGuards(JwtAuthGuard, RBACGuard)
// @Roles('super_admin')
export class RevenueBillingController {
  constructor(private readonly billingService: RevenueBillingService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get revenue overview' })
  @ApiResponse({ status: 200, type: RevenueOverviewDto })
  async getOverview(): Promise<RevenueOverviewDto> {
    return this.billingService.getRevenueOverview();
  }

  @Get('churn-analysis')
  @ApiOperation({ summary: 'Get churn analysis' })
  @ApiResponse({ status: 200, type: ChurnAnalysisDto })
  async getChurnAnalysis(): Promise<ChurnAnalysisDto> {
    return this.billingService.getChurnAnalysis();
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transactions with filters' })
  @ApiResponse({ status: 200, type: [RevenueTransaction] })
  async getTransactions(@Query() query: GetTransactionsQueryDto): Promise<RevenueTransaction[]> {
    return this.billingService.getTransactions(query);
  }

  @Get('failed-payments')
  @ApiOperation({ summary: 'Get failed payments' })
  @ApiResponse({ status: 200, type: [FailedPaymentDto] })
  async getFailedPayments(): Promise<FailedPaymentDto[]> {
    return this.billingService.getFailedPayments();
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Create new transaction' })
  @ApiResponse({ status: 201, type: RevenueTransaction })
  async createTransaction(@Body() dto: CreateTransactionDto): Promise<RevenueTransaction> {
    return this.billingService.createTransaction(dto);
  }

  @Post('retry-payment/:id')
  @ApiOperation({ summary: 'Retry failed payment' })
  @ApiResponse({ status: 200 })
  async retryPayment(@Param('id') id: string) {
    return this.billingService.retryFailedPayment(id);
  }

  @Post('refund/:id')
  @ApiOperation({ summary: 'Process refund' })
  @ApiResponse({ status: 200, type: RevenueTransaction })
  async processRefund(@Param('id') id: string, @Body('reason') reason: string) {
    return this.billingService.processRefund(id, reason);
  }

  @Get('invoice/:organizationId/:month')
  @ApiOperation({ summary: 'Generate invoice for organization' })
  @ApiResponse({ status: 200 })
  async generateInvoice(
    @Param('organizationId') organizationId: string,
    @Param('month') month: string
  ) {
    return this.billingService.generateInvoice(organizationId, month);
  }
}
