/**
 * Financial Reconciliation Service
 * 
 * Handles bank reconciliation, account matching, variance analysis,
 * and automated reconciliation processes for financial accuracy.
 * 
 * @version 3.0.0
 * @compliance SOC2, SOX, GAAP, IFRS
 */

import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AccountBalance } from '../entities/account-balance.entity';
import { PaymentTransaction } from '../entities/payment-transaction.entity';
import { JournalEntry } from '../entities/journal-entry.entity';
import { JournalLine } from '../entities/journal-line.entity';
import { ChartOfAccounts } from '../entities/chart-of-accounts.entity';

export interface BankStatement {
  id: string;
  accountNumber: string;
  statementDate: Date;
  openingBalance: number;
  closingBalance: number;
  transactions: BankTransaction[];
}

export interface BankTransaction {
  id: string;
  date: Date;
  description: string;
  reference: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  balance: number;
  matched: boolean;
  matchedTransactionId?: string;
}

export interface ReconciliationItem {
  id: string;
  type: 'BANK_TRANSACTION' | 'BOOK_TRANSACTION' | 'ADJUSTMENT';
  date: Date;
  description: string;
  reference: string;
  amount: number;
  status: 'MATCHED' | 'UNMATCHED' | 'DISPUTED' | 'ADJUSTMENT';
  matchedItemId?: string;
  variance?: number;
}

export interface ReconciliationResult {
  accountId: string;
  periodId: string;
  reconciliationDate: Date;
  bookBalance: number;
  bankBalance: number;
  reconciledBalance: number;
  totalVariance: number;
  matchedItems: number;
  unmatchedItems: number;
  adjustments: ReconciliationAdjustment[];
  status: 'RECONCILED' | 'PARTIAL' | 'DISPUTED';
  confidence: number; // 0-1 score
}

export interface ReconciliationAdjustment {
  type: 'BANK_ERROR' | 'TIMING_DIFFERENCE' | 'OUTSTANDING_CHECK' | 'DEPOSIT_IN_TRANSIT' | 'BANK_FEES' | 'OTHER';
  description: string;
  amount: number;
  journalEntryId?: string;
}

export interface AutoMatchingRules {
  exactAmountMatch: boolean;
  dateToleranceDays: number;
  descriptionSimilarityThreshold: number; // 0-1
  referenceMatch: boolean;
  amountTolerancePercentage: number;
  fuzzyMatching: boolean;
}

@Injectable()
export class FinancialReconciliationService {
  private readonly logger = new Logger(FinancialReconciliationService.name);

  constructor(
    @InjectRepository(AccountBalance)
    private readonly accountBalanceRepository: Repository<AccountBalance>,
    @InjectRepository(PaymentTransaction)
    private readonly paymentTransactionRepository: Repository<PaymentTransaction>,
    @InjectRepository(JournalEntry)
    private readonly journalEntryRepository: Repository<JournalEntry>,
    @InjectRepository(JournalLine)
    private readonly journalLineRepository: Repository<JournalLine>,
    @InjectRepository(ChartOfAccounts)
    private readonly chartOfAccountsRepository: Repository<ChartOfAccounts>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Perform bank reconciliation for a specific account and period
   */
  async reconcileAccount(
    accountId: string,
    periodId: string,
    bankStatement: BankStatement,
    companyId: string,
    userId: string,
    autoMatchingRules?: AutoMatchingRules,
  ): Promise<ReconciliationResult> {
    this.logger.log(`Starting reconciliation for account ${accountId}, period ${periodId}`);

    const defaultRules: AutoMatchingRules = {
      exactAmountMatch: true,
      dateToleranceDays: 3,
      descriptionSimilarityThreshold: 0.8,
      referenceMatch: true,
      amountTolerancePercentage: 0.01, // 1%
      fuzzyMatching: true,
      ...autoMatchingRules,
    };

    try {
      // Get account information
      const account = await this.chartOfAccountsRepository.findOne({
        where: { id: accountId, companyId, isActive: true },
      });

      if (!account) {
        throw new NotFoundException('Account not found or inactive');
      }

      if (!account.reconcilable) {
        throw new BadRequestException('Account is not marked as reconcilable');
      }

      // Get book balance for the period
      const bookBalance = await this.getBookBalance(accountId, periodId, companyId);

      // Get book transactions for reconciliation period
      const bookTransactions = await this.getBookTransactions(
        accountId,
        periodId,
        bankStatement.statementDate,
        companyId,
      );

      // Perform automatic matching
      const matchingResult = await this.performAutoMatching(
        bookTransactions,
        bankStatement.transactions,
        defaultRules,
      );

      // Identify unmatched items
      const unmatchedBankItems = bankStatement.transactions.filter(t => !t.matched);
      const unmatchedBookItems = bookTransactions.filter(t => t.status === 'UNMATCHED');

      // Calculate variances and adjustments
      const adjustments = await this.calculateAdjustments(
        unmatchedBankItems,
        unmatchedBookItems,
        bookBalance.closingBalance,
        bankStatement.closingBalance,
      );

      // Calculate reconciled balance
      const reconciledBalance = this.calculateReconciledBalance(
        bookBalance.closingBalance,
        adjustments,
      );

      // Determine reconciliation status
      const totalVariance = Math.abs(reconciledBalance - bankStatement.closingBalance);
      const status = this.determineReconciliationStatus(totalVariance, unmatchedBankItems.length + unmatchedBookItems.length);
      const confidence = this.calculateConfidence(matchingResult.matchedCount, bookTransactions.length + bankStatement.transactions.length);

      const result: ReconciliationResult = {
        accountId,
        periodId,
        reconciliationDate: new Date(),
        bookBalance: bookBalance.closingBalance,
        bankBalance: bankStatement.closingBalance,
        reconciledBalance,
        totalVariance,
        matchedItems: matchingResult.matchedCount,
        unmatchedItems: unmatchedBankItems.length + unmatchedBookItems.length,
        adjustments,
        status,
        confidence,
      };

      // Save reconciliation result
      await this.saveReconciliationResult(result, userId, companyId);

      // Create adjusting journal entries if needed
      if (adjustments.length > 0) {
        await this.createAdjustingEntries(adjustments, accountId, periodId, companyId, userId);
      }

      this.logger.log(`Reconciliation completed: ${status}, Variance: ${totalVariance}, Confidence: ${confidence}`);

      // Emit reconciliation event
      this.eventEmitter.emit('reconciliation.completed', {
        accountId,
        periodId,
        result,
        userId,
      });

      return result;

    } catch (error) {
      this.logger.error(`Reconciliation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get reconciliation status for multiple accounts
   */
  async getReconciliationStatus(
    companyId: string,
    periodId?: string,
  ): Promise<{ accountId: string; accountName: string; status: string; lastReconciled: Date; variance: number }[]> {
    const query = this.accountBalanceRepository
      .createQueryBuilder('ab')
      .innerJoin('ab.account', 'coa')
      .select([
        'ab.accountId as "accountId"',
        'coa.accountName as "accountName"',
        'ab.reconciliationStatus as "status"',
        'ab.reconciledDate as "lastReconciled"',
        'ab.variance as "variance"',
      ])
      .where('ab.companyId = :companyId', { companyId })
      .andWhere('coa.reconcilable = true');

    if (periodId) {
      query.andWhere('ab.periodId = :periodId', { periodId });
    }

    return query.getRawMany();
  }

  /**
   * Perform variance analysis between periods
   */
  async performVarianceAnalysis(
    accountId: string,
    currentPeriodId: string,
    previousPeriodId: string,
    companyId: string,
  ): Promise<{
    account: ChartOfAccounts;
    currentPeriod: { balance: number; movements: { debits: number; credits: number } };
    previousPeriod: { balance: number; movements: { debits: number; credits: number } };
    variance: { absolute: number; percentage: number };
    significantTransactions: any[];
  }> {
    const account = await this.chartOfAccountsRepository.findOne({
      where: { id: accountId, companyId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Get current period data
    const currentPeriodBalance = await this.accountBalanceRepository.findOne({
      where: { accountId, periodId: currentPeriodId, companyId },
    });

    // Get previous period data
    const previousPeriodBalance = await this.accountBalanceRepository.findOne({
      where: { accountId, periodId: previousPeriodId, companyId },
    });

    if (!currentPeriodBalance || !previousPeriodBalance) {
      throw new NotFoundException('Balance data not found for comparison periods');
    }

    // Calculate variance
    const absoluteVariance = currentPeriodBalance.closingBalance - previousPeriodBalance.closingBalance;
    const percentageVariance = previousPeriodBalance.closingBalance !== 0 
      ? (absoluteVariance / Math.abs(previousPeriodBalance.closingBalance)) * 100 
      : 0;

    // Get significant transactions contributing to variance
    const significantTransactions = await this.journalLineRepository
      .createQueryBuilder('jl')
      .innerJoin('jl.journalEntry', 'je')
      .where('jl.accountId = :accountId', { accountId })
      .andWhere('je.periodId = :periodId', { periodId: currentPeriodId })
      .andWhere('je.companyId = :companyId', { companyId })
      .andWhere('(jl.debitAmount > :threshold OR jl.creditAmount > :threshold)', { 
        threshold: Math.abs(absoluteVariance) * 0.1, // 10% of variance
      })
      .orderBy('GREATEST(jl.debitAmount, jl.creditAmount)', 'DESC')
      .limit(10)
      .getMany();

    return {
      account,
      currentPeriod: {
        balance: currentPeriodBalance.closingBalance,
        movements: {
          debits: currentPeriodBalance.debitMovements,
          credits: currentPeriodBalance.creditMovements,
        },
      },
      previousPeriod: {
        balance: previousPeriodBalance.closingBalance,
        movements: {
          debits: previousPeriodBalance.debitMovements,
          credits: previousPeriodBalance.creditMovements,
        },
      },
      variance: {
        absolute: absoluteVariance,
        percentage: percentageVariance,
      },
      significantTransactions,
    };
  }

  /**
   * Auto-match transactions using ML-like algorithms
   */
  private async performAutoMatching(
    bookTransactions: ReconciliationItem[],
    bankTransactions: BankTransaction[],
    rules: AutoMatchingRules,
  ): Promise<{ matchedCount: number; matches: Array<{ bookId: string; bankId: string; confidence: number }> }> {
    const matches: Array<{ bookId: string; bankId: string; confidence: number }> = [];
    let matchedCount = 0;

    for (const bookTxn of bookTransactions) {
      let bestMatch: { transaction: BankTransaction; confidence: number } | null = null;

      for (const bankTxn of bankTransactions) {
        if (bankTxn.matched) continue;

        let confidence = 0;
        let matchCriteria = 0;

        // Exact amount match
        if (rules.exactAmountMatch && Math.abs(Math.abs(bookTxn.amount) - Math.abs(bankTxn.amount)) < 0.01) {
          confidence += 40;
          matchCriteria++;
        }

        // Amount tolerance match
        if (rules.amountTolerancePercentage > 0) {
          const tolerance = Math.abs(bookTxn.amount) * rules.amountTolerancePercentage;
          if (Math.abs(Math.abs(bookTxn.amount) - Math.abs(bankTxn.amount)) <= tolerance) {
            confidence += 30;
            matchCriteria++;
          }
        }

        // Date tolerance match
        const daysDiff = Math.abs((bookTxn.date.getTime() - bankTxn.date.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= rules.dateToleranceDays) {
          confidence += Math.max(20 - (daysDiff * 5), 0);
          matchCriteria++;
        }

        // Reference match
        if (rules.referenceMatch && bookTxn.reference && bankTxn.reference) {
          if (bookTxn.reference.toLowerCase().includes(bankTxn.reference.toLowerCase()) ||
              bankTxn.reference.toLowerCase().includes(bookTxn.reference.toLowerCase())) {
            confidence += 30;
            matchCriteria++;
          }
        }

        // Description similarity
        if (rules.fuzzyMatching) {
          const similarity = this.calculateStringSimilarity(bookTxn.description, bankTxn.description);
          if (similarity >= rules.descriptionSimilarityThreshold) {
            confidence += similarity * 20;
            matchCriteria++;
          }
        }

        // Must meet minimum criteria to be considered a match
        if (matchCriteria >= 2 && confidence > (bestMatch?.confidence || 0)) {
          bestMatch = { transaction: bankTxn, confidence };
        }
      }

      // Accept match if confidence is high enough
      if (bestMatch && bestMatch.confidence >= 70) {
        matches.push({
          bookId: bookTxn.id,
          bankId: bestMatch.transaction.id,
          confidence: bestMatch.confidence / 100,
        });

        bookTxn.status = 'MATCHED';
        bookTxn.matchedItemId = bestMatch.transaction.id;
        bestMatch.transaction.matched = true;
        bestMatch.transaction.matchedTransactionId = bookTxn.id;
        matchedCount++;
      }
    }

    return { matchedCount, matches };
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1.0;

    const matrix: number[][] = [];
    
    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= s1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const maxLength = Math.max(s1.length, s2.length);
    return maxLength === 0 ? 1 : 1 - (matrix[s2.length][s1.length] / maxLength);
  }

  // Helper methods
  private async getBookBalance(accountId: string, periodId: string, companyId: string): Promise<AccountBalance> {
    const balance = await this.accountBalanceRepository.findOne({
      where: { accountId, periodId, companyId },
    });

    if (!balance) {
      throw new NotFoundException('Account balance not found for the specified period');
    }

    return balance;
  }

  private async getBookTransactions(
    accountId: string,
    periodId: string,
    statementDate: Date,
    companyId: string,
  ): Promise<ReconciliationItem[]> {
    const transactions = await this.journalLineRepository
      .createQueryBuilder('jl')
      .innerJoin('jl.journalEntry', 'je')
      .where('jl.accountId = :accountId', { accountId })
      .andWhere('je.periodId = :periodId', { periodId })
      .andWhere('je.companyId = :companyId', { companyId })
      .andWhere('je.status = :status', { status: 'POSTED' })
      .andWhere('je.date <= :statementDate', { statementDate })
      .getMany();

    return transactions.map(t => ({
      id: t.id,
      type: 'BOOK_TRANSACTION' as const,
      date: t.journalEntry.date,
      description: t.description || t.journalEntry.description,
      reference: t.journalEntry.reference || '',
      amount: t.debitAmount - t.creditAmount,
      status: 'UNMATCHED' as const,
    }));
  }

  private async calculateAdjustments(
    unmatchedBankItems: BankTransaction[],
    unmatchedBookItems: ReconciliationItem[],
    bookBalance: number,
    bankBalance: number,
  ): Promise<ReconciliationAdjustment[]> {
    const adjustments: ReconciliationAdjustment[] = [];

    // Outstanding checks (book has it, bank doesn't)
    const outstandingChecks = unmatchedBookItems.filter(item => item.amount < 0);
    if (outstandingChecks.length > 0) {
      adjustments.push({
        type: 'OUTSTANDING_CHECK',
        description: `${outstandingChecks.length} outstanding checks`,
        amount: outstandingChecks.reduce((sum, item) => sum + item.amount, 0),
      });
    }

    // Deposits in transit (book has it, bank doesn't)
    const depositsInTransit = unmatchedBookItems.filter(item => item.amount > 0);
    if (depositsInTransit.length > 0) {
      adjustments.push({
        type: 'DEPOSIT_IN_TRANSIT',
        description: `${depositsInTransit.length} deposits in transit`,
        amount: depositsInTransit.reduce((sum, item) => sum + item.amount, 0),
      });
    }

    // Bank fees and charges (bank has it, book doesn't)
    const bankFees = unmatchedBankItems.filter(item => 
      item.amount < 0 && item.description.toLowerCase().includes('fee')
    );
    if (bankFees.length > 0) {
      adjustments.push({
        type: 'BANK_FEES',
        description: 'Bank fees and charges',
        amount: bankFees.reduce((sum, item) => sum + item.amount, 0),
      });
    }

    return adjustments;
  }

  private calculateReconciledBalance(bookBalance: number, adjustments: ReconciliationAdjustment[]): number {
    return bookBalance + adjustments.reduce((sum, adj) => sum + adj.amount, 0);
  }

  private determineReconciliationStatus(variance: number, unmatchedCount: number): 'RECONCILED' | 'PARTIAL' | 'DISPUTED' {
    if (variance <= 0.01 && unmatchedCount === 0) return 'RECONCILED';
    if (variance <= 10.00 || unmatchedCount <= 3) return 'PARTIAL';
    return 'DISPUTED';
  }

  private calculateConfidence(matchedCount: number, totalTransactions: number): number {
    if (totalTransactions === 0) return 1.0;
    return Math.min(matchedCount / totalTransactions, 1.0);
  }

  private async saveReconciliationResult(result: ReconciliationResult, userId: string, companyId: string): Promise<void> {
    // Update account balance with reconciliation info
    await this.accountBalanceRepository.update(
      { accountId: result.accountId, periodId: result.periodId, companyId },
      {
        reconciliationStatus: result.status,
        reconciledBalance: result.reconciledBalance,
        reconciledDate: result.reconciliationDate,
        reconciledBy: userId,
        variance: result.totalVariance,
      },
    );

    // Store detailed reconciliation results in metadata
    const reconciliationData = {
      result,
      timestamp: new Date(),
      userId,
    };

    await this.dataSource.query(
      `INSERT INTO audit_log (table_name, record_id, operation, new_values, changed_by)
       VALUES ('account_balances', $1, 'RECONCILIATION', $2, $3)`,
      [result.accountId, JSON.stringify(reconciliationData), userId],
    );
  }

  private async createAdjustingEntries(
    adjustments: ReconciliationAdjustment[],
    accountId: string,
    periodId: string,
    companyId: string,
    userId: string,
  ): Promise<void> {
    for (const adjustment of adjustments) {
      if (adjustment.type === 'BANK_FEES' || adjustment.type === 'BANK_ERROR') {
        // Create journal entry for bank fees or corrections
        const journalEntry = new JournalEntry();
        journalEntry.journalNumber = `ADJ-${Date.now()}`;
        journalEntry.date = new Date();
        journalEntry.description = `Reconciliation adjustment: ${adjustment.description}`;
        journalEntry.status = 'POSTED';
        journalEntry.sourceLedger = 'ADJUSTING';
        journalEntry.periodId = periodId;
        journalEntry.companyId = companyId;
        journalEntry.totalDebit = Math.abs(adjustment.amount);
        journalEntry.totalCredit = Math.abs(adjustment.amount);
        journalEntry.isBalanced = true;
        journalEntry.createdBy = userId;
        journalEntry.updatedBy = userId;
        journalEntry.postedAt = new Date();
        journalEntry.postedBy = userId;

        const savedEntry = await this.journalEntryRepository.save(journalEntry);
        adjustment.journalEntryId = savedEntry.id;

        // Create corresponding journal lines (implementation would depend on account types)
      }
    }
  }
}
