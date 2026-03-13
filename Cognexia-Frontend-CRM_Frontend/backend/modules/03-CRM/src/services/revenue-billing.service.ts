import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { RevenueTransaction, TransactionType, TransactionStatus } from '../entities/revenue-transaction.entity';
import { Organization } from '../entities/organization.entity';
import {
  CreateTransactionDto,
  RevenueOverviewDto,
  ChurnAnalysisDto,
  GetTransactionsQueryDto,
  FailedPaymentDto,
} from '../dto/revenue-billing.dto';

@Injectable()
export class RevenueBillingService {
  private readonly logger = new Logger(RevenueBillingService.name);

  constructor(
    @InjectRepository(RevenueTransaction)
    private transactionRepository: Repository<RevenueTransaction>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async getRevenueOverview(): Promise<RevenueOverviewDto> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const completedTransactions = await this.transactionRepository.find({
      where: {
        status: TransactionStatus.COMPLETED,
        type: In([TransactionType.SUBSCRIPTION, TransactionType.UPGRADE]),
        paidAt: Between(firstDayOfMonth, lastDayOfMonth),
      },
      relations: ['organization'],
    });

    const totalRevenue = completedTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const failedPayments = await this.transactionRepository.count({
      where: {
        status: TransactionStatus.FAILED,
        type: TransactionType.PAYMENT_FAILED,
      },
    });

    const refundedTransactions = await this.transactionRepository.find({
      where: {
        status: TransactionStatus.REFUNDED,
        type: TransactionType.REFUND,
      },
    });

    const refundedAmount = refundedTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    // Calculate revenue by tier
    const revenueByTier = completedTransactions.reduce(
      (acc, transaction) => {
        const tier = transaction.organization?.userTierConfig?.activeTier || 'basic';
        acc[tier] = (acc[tier] || 0) + Number(transaction.amount);
        return acc;
      },
      { basic: 0, premium: 0, advanced: 0 }
    );

    // Calculate MRR from active organizations
    const tierPricing = { basic: 29, premium: 99, advanced: 299 };
    const activeOrgs = await this.organizationRepository.find({
      where: { status: 'active' as any },
    });

    const mrr = activeOrgs.reduce((sum, org) => {
      const tier = org.userTierConfig?.activeTier || 'basic';
      return sum + tierPricing[tier];
    }, 0);

    return {
      totalRevenue,
      mrr,
      arr: mrr * 12,
      churnRate: 2.5, // Mock - calculate from actual churn data
      failedPayments,
      refundedAmount,
      revenueByTier,
    };
  }

  async getChurnAnalysis(): Promise<ChurnAnalysisDto> {
    // Mock churn data - in production, calculate from actual organization data
    return {
      churnRate: 2.5,
      churnedOrganizations: 15,
      churnRevenueLoss: 1485,
      churnReasons: [
        { reason: 'Price too high', count: 6 },
        { reason: 'Missing features', count: 4 },
        { reason: 'Found alternative', count: 3 },
        { reason: 'No longer needed', count: 2 },
      ],
      churnTrend: [
        { month: '2025-09', churnRate: 2.1 },
        { month: '2025-10', churnRate: 2.3 },
        { month: '2025-11', churnRate: 2.8 },
        { month: '2025-12', churnRate: 2.5 },
        { month: '2026-01', churnRate: 2.5 },
      ],
    };
  }

  async getTransactions(query: GetTransactionsQueryDto): Promise<RevenueTransaction[]> {
    const where: any = {};

    if (query.organizationId) {
      where.organizationId = query.organizationId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.startDate && query.endDate) {
      where.createdAt = Between(new Date(query.startDate), new Date(query.endDate));
    }

    return this.transactionRepository.find({
      where,
      relations: ['organization'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async createTransaction(dto: CreateTransactionDto): Promise<RevenueTransaction> {
    const transaction = this.transactionRepository.create(dto as any);
    return this.transactionRepository.save(transaction) as any;
  }

  async getFailedPayments(): Promise<FailedPaymentDto[]> {
    const failedTransactions = await this.transactionRepository.find({
      where: {
        status: TransactionStatus.FAILED,
      },
      relations: ['organization'],
      order: { createdAt: 'DESC' },
      take: 50,
    });

    return failedTransactions.map(t => ({
      id: t.id,
      organizationId: t.organizationId,
      organizationName: t.organization?.name || 'Unknown',
      amount: Number(t.amount),
      failureReason: t.failureReason || 'Unknown',
      attemptCount: 1, // Mock - track actual retry attempts
      nextRetryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      createdAt: t.createdAt,
    }));
  }

  async retryFailedPayment(transactionId: string): Promise<{ success: boolean; message: string }> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      return { success: false, message: 'Transaction not found' };
    }

    // Mock retry logic - in production, integrate with Stripe/PayPal
    const success = Math.random() > 0.3; // 70% success rate

    if (success) {
      transaction.status = TransactionStatus.COMPLETED;
      transaction.paidAt = new Date();
      await this.transactionRepository.save(transaction);
      return { success: true, message: 'Payment retry successful' };
    } else {
      return { success: false, message: 'Payment retry failed. Will retry again later.' };
    }
  }

  async processRefund(transactionId: string, reason: string): Promise<RevenueTransaction> {
    const originalTransaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!originalTransaction) {
      throw new Error('Transaction not found');
    }

    // Create refund transaction
    const refund = this.transactionRepository.create({
      organizationId: originalTransaction.organizationId,
      type: TransactionType.REFUND,
      status: TransactionStatus.COMPLETED,
      amount: originalTransaction.amount,
      currency: originalTransaction.currency,
      description: `Refund for ${originalTransaction.id}: ${reason}`,
      metadata: { originalTransactionId: originalTransaction.id, reason },
      refundedAt: new Date(),
    });

    // Update original transaction
    originalTransaction.status = TransactionStatus.REFUNDED;
    originalTransaction.refundedAt = new Date();

    await this.transactionRepository.save(originalTransaction);
    return this.transactionRepository.save(refund);
  }

  async generateInvoice(organizationId: string, month: string): Promise<any> {
    const transactions = await this.transactionRepository.find({
      where: {
        organizationId,
        status: TransactionStatus.COMPLETED,
      },
      relations: ['organization'],
    });

    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      invoiceNumber: `INV-${Date.now()}`,
      organizationId,
      month,
      items: transactions.map(t => ({
        description: t.description,
        amount: Number(t.amount),
        date: t.paidAt,
      })),
      subtotal: total,
      tax: total * 0.1, // 10% tax
      total: total * 1.1,
      generatedAt: new Date(),
    };
  }
}
