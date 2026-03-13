import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, UserTypes } from '../guards/roles.guard';
import { UserType } from '../entities/user.entity';
import {
  BillingTransactionService,
  TransactionFilters,
} from '../services/billing-transaction.service';
import { TransactionType, TransactionStatus } from '../entities/billing-transaction.entity';

/**
 * Billing Transaction Controller
 * Handles billing transaction queries and reports
 */
@Controller('billing-transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingTransactionController {
  constructor(
    private readonly billingTransactionService: BillingTransactionService,
  ) {}

  /**
   * Get Transactions with Filters
   * GET /billing-transactions
   */
  @Get()
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async getTransactions(
    @Query('organizationId') organizationId?: string,
    @Query('transactionType') transactionType?: TransactionType,
    @Query('status') status?: TransactionStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
  ) {
    const filters: TransactionFilters = {
      organizationId,
      transactionType,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const result = await this.billingTransactionService.getTransactions(
      filters,
      page,
      limit,
    );

    return {
      message: 'Transactions retrieved successfully',
      data: result,
    };
  }

  /**
   * Get Transaction by ID
   * GET /billing-transactions/:id
   */
  @Get(':id')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async getTransactionById(@Param('id') id: string) {
    const transaction = await this.billingTransactionService.getTransactionById(id);
    return {
      message: 'Transaction retrieved successfully',
      data: transaction,
    };
  }

  /**
   * Get Organization Transactions
   * GET /billing-transactions/organization/:organizationId
   */
  @Get('organization/:organizationId')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async getOrganizationTransactions(
    @Param('organizationId') organizationId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
  ) {
    const result = await this.billingTransactionService.getOrganizationTransactions(
      organizationId,
      page,
      limit,
    );

    return {
      message: 'Organization transactions retrieved successfully',
      data: result,
    };
  }

  /**
   * Get Transaction Statistics
   * GET /billing-transactions/stats
   */
  @Get('reports/stats')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async getTransactionStats(
    @Query('organizationId') organizationId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const stats = await this.billingTransactionService.getTransactionStats(
      organizationId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    return {
      message: 'Transaction statistics retrieved successfully',
      data: stats,
    };
  }

  /**
   * Get Monthly Revenue Report
   * GET /billing-transactions/reports/monthly-revenue
   */
  @Get('reports/monthly-revenue')
  @UserTypes(UserType.SUPER_ADMIN)
  async getMonthlyRevenueReport(
    @Query('year', new DefaultValuePipe(new Date().getFullYear()), ParseIntPipe) year?: number,
    @Query('organizationId') organizationId?: string,
  ) {
    const report = await this.billingTransactionService.getMonthlyRevenueReport(
      year!,
      organizationId,
    );

    return {
      message: 'Monthly revenue report retrieved successfully',
      data: report,
    };
  }

  /**
   * Get Failed Transactions Report
   * GET /billing-transactions/reports/failed
   */
  @Get('reports/failed')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async getFailedTransactions(
    @Query('organizationId') organizationId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const transactions = await this.billingTransactionService.getFailedTransactions(
      organizationId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    return {
      message: 'Failed transactions retrieved successfully',
      data: transactions,
    };
  }

  /**
   * Get Refund Transactions
   * GET /billing-transactions/reports/refunds
   */
  @Get('reports/refunds')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async getRefundTransactions(
    @Query('organizationId') organizationId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const transactions = await this.billingTransactionService.getRefundTransactions(
      organizationId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    return {
      message: 'Refund transactions retrieved successfully',
      data: transactions,
    };
  }

  /**
   * Get Upcoming Billing
   * GET /billing-transactions/reports/upcoming-billing
   */
  @Get('reports/upcoming-billing')
  @UserTypes(UserType.SUPER_ADMIN)
  async getUpcomingBilling(
    @Query('daysAhead', new DefaultValuePipe(7), ParseIntPipe) daysAhead?: number,
  ) {
    const upcomingBilling = await this.billingTransactionService.getUpcomingBilling(
      daysAhead,
    );

    return {
      message: 'Upcoming billing retrieved successfully',
      data: upcomingBilling,
    };
  }

  /**
   * Export Transactions to CSV
   * GET /billing-transactions/reports/export-csv
   */
  @Get('reports/export-csv')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async exportTransactionsToCsv(
    @Query('organizationId') organizationId?: string,
    @Query('transactionType') transactionType?: TransactionType,
    @Query('status') status?: TransactionStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: TransactionFilters = {
      organizationId,
      transactionType,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const csv = await this.billingTransactionService.exportTransactionsToCsv(filters);

    return {
      message: 'CSV export generated successfully',
      data: { csv },
    };
  }
}
