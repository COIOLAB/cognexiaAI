import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BillingTransaction, TransactionType, TransactionStatus } from '../entities/billing-transaction.entity';
import { Organization, SubscriptionStatus } from '../entities/organization.entity';

export interface TransactionFilters {
  organizationId?: string;
  transactionType?: TransactionType;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface TransactionStats {
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageTransactionValue: number;
  currency: string;
}

/**
 * Billing Transaction Service
 * Handles querying and managing billing transaction history
 */
@Injectable()
export class BillingTransactionService {
  constructor(
    @InjectRepository(BillingTransaction)
    private transactionRepository: Repository<BillingTransaction>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  /**
   * Get Transactions with Filtering and Pagination
   */
  async getTransactions(
    filters: TransactionFilters,
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    transactions: BillingTransaction[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.organization', 'organization');

    // Apply filters
    if (filters.organizationId) {
      queryBuilder.andWhere('transaction.organizationId = :organizationId', {
        organizationId: filters.organizationId,
      });
    }

    if (filters.transactionType) {
      queryBuilder.andWhere('transaction.transactionType = :transactionType', {
        transactionType: filters.transactionType,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('transaction.status = :status', {
        status: filters.status,
      });
    }

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    } else if (filters.startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    } else if (filters.endDate) {
      queryBuilder.andWhere('transaction.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    // Count total
    const total = await queryBuilder.getCount();

    // Apply pagination and ordering
    const transactions = await queryBuilder
      .orderBy('transaction.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get Transaction by ID
   */
  async getTransactionById(id: string): Promise<BillingTransaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['organization'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  /**
   * Get Organization Transaction History
   */
  async getOrganizationTransactions(
    organizationId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    transactions: BillingTransaction[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.getTransactions({ organizationId }, page, limit);
  }

  /**
   * Get Transaction Statistics
   */
  async getTransactionStats(
    organizationId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TransactionStats> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.status = :status', { status: TransactionStatus.COMPLETED });

    if (organizationId) {
      queryBuilder.andWhere('transaction.organizationId = :organizationId', {
        organizationId,
      });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const transactions = await queryBuilder.getMany();

    // Calculate statistics
    let totalRevenue = 0;
    let totalRefunds = 0;
    let successfulCount = 0;
    const currency = transactions[0]?.currency || 'USD';

    for (const transaction of transactions) {
      if (transaction.transactionType === TransactionType.REFUND) {
        totalRefunds += Math.abs(transaction.amount);
      } else {
        totalRevenue += transaction.amount;
        successfulCount++;
      }
    }

    // Get failed transactions count
    const failedQuery = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.status = :status', { status: TransactionStatus.FAILED });

    if (organizationId) {
      failedQuery.andWhere('transaction.organizationId = :organizationId', {
        organizationId,
      });
    }

    if (startDate && endDate) {
      failedQuery.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const failedCount = await failedQuery.getCount();

    const netRevenue = totalRevenue - totalRefunds;
    const averageTransactionValue = successfulCount > 0 ? totalRevenue / successfulCount : 0;

    return {
      totalRevenue,
      totalRefunds,
      netRevenue,
      successfulTransactions: successfulCount,
      failedTransactions: failedCount,
      averageTransactionValue,
      currency,
    };
  }

  /**
   * Get Monthly Revenue Report
   */
  async getMonthlyRevenueReport(
    year: number,
    organizationId?: string,
  ): Promise<{
    month: number;
    revenue: number;
    transactionCount: number;
  }[]> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('transaction.transactionType != :refundType', {
        refundType: TransactionType.REFUND,
      })
      .andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (organizationId) {
      queryBuilder.andWhere('transaction.organizationId = :organizationId', {
        organizationId,
      });
    }

    const transactions = await queryBuilder.getMany();

    // Group by month
    const monthlyData: { [key: number]: { revenue: number; count: number } } = {};

    for (let i = 0; i < 12; i++) {
      monthlyData[i] = { revenue: 0, count: 0 };
    }

    for (const transaction of transactions) {
      const month = transaction.createdAt.getMonth();
      monthlyData[month].revenue += transaction.amount;
      monthlyData[month].count++;
    }

    return Object.keys(monthlyData).map((key) => ({
      month: parseInt(key) + 1,
      revenue: monthlyData[parseInt(key)].revenue,
      transactionCount: monthlyData[parseInt(key)].count,
    }));
  }

  /**
   * Get Failed Transactions Report
   */
  async getFailedTransactions(
    organizationId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<BillingTransaction[]> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.organization', 'organization')
      .where('transaction.status = :status', { status: TransactionStatus.FAILED });

    if (organizationId) {
      queryBuilder.andWhere('transaction.organizationId = :organizationId', {
        organizationId,
      });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return queryBuilder
      .orderBy('transaction.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Get Refund Transactions
   */
  async getRefundTransactions(
    organizationId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<BillingTransaction[]> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.organization', 'organization')
      .where('transaction.transactionType = :type', { type: TransactionType.REFUND });

    if (organizationId) {
      queryBuilder.andWhere('transaction.organizationId = :organizationId', {
        organizationId,
      });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return queryBuilder
      .orderBy('transaction.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Get Upcoming Billing
   */
  async getUpcomingBilling(
    daysAhead: number = 7,
  ): Promise<{
    organizationId: string;
    organizationName: string;
    nextBillingDate: Date;
    expectedAmount: number;
  }[]> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);

    const organizations = await this.organizationRepository
      .createQueryBuilder('org')
      .leftJoinAndSelect('org.subscriptionPlan', 'plan')
      .where('org.nextBillingDate IS NOT NULL')
      .andWhere('org.nextBillingDate <= :endDate', { endDate })
      .andWhere('org.subscriptionStatus = :status', { status: SubscriptionStatus.ACTIVE })
      .getMany();

    return organizations.map((org) => ({
      organizationId: org.id,
      organizationName: org.name,
      nextBillingDate: org.nextBillingDate!,
      expectedAmount: org.monthlyRevenue,
    }));
  }

  /**
   * Export Transactions to CSV Format
   */
  async exportTransactionsToCsv(
    filters: TransactionFilters,
  ): Promise<string> {
    const { transactions } = await this.getTransactions(filters, 1, 10000);

    // CSV header
    const header = [
      'Transaction ID',
      'Organization',
      'Amount',
      'Currency',
      'Type',
      'Status',
      'Description',
      'Invoice Number',
      'Payment Method',
      'Date',
    ].join(',');

    // CSV rows
    const rows = transactions.map((t) =>
      [
        t.id,
        t.organization?.name || 'N/A',
        t.amount,
        t.currency,
        t.transactionType,
        t.status,
        `"${t.description}"`,
        t.invoiceNumber,
        t.paymentMethod,
        t.createdAt.toISOString(),
      ].join(',')
    );

    return [header, ...rows].join('\n');
  }
}
