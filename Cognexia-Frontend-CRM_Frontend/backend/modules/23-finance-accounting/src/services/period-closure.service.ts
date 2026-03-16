/**
 * Period Closure Service
 * 
 * Handles financial period closure procedures including validation,
 * journal entry lockdown, balance calculations, and compliance checks.
 * 
 * @version 3.0.0
 * @compliance SOC2, SOX, GAAP, IFRS
 */

import { Injectable, Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JournalEntry } from '../entities/journal-entry.entity';
import { AccountBalance } from '../entities/account-balance.entity';
import { TrialBalance } from '../entities/trial-balance.entity';
import { ChartOfAccounts } from '../entities/chart-of-accounts.entity';

export interface FinancialPeriod {
  id: string;
  periodCode: string;
  periodName: string;
  periodType: string;
  startDate: Date;
  endDate: Date;
  fiscalYear: number;
  isActive: boolean;
  isClosed: boolean;
  closedAt?: Date;
  closedBy?: string;
  companyId: string;
}

export interface PeriodClosureValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  checks: {
    balancedEntries: boolean;
    postedEntries: boolean;
    reconciliations: boolean;
    adjustments: boolean;
    approvals: boolean;
    trialBalance: boolean;
  };
}

export interface PeriodClosureResult {
  periodId: string;
  closureDate: Date;
  totalEntries: number;
  totalAmount: number;
  balancesGenerated: number;
  trialBalanceGenerated: boolean;
  adjustingEntries: string[];
  validationErrors: string[];
  duration: number; // in milliseconds
}

@Injectable()
export class PeriodClosureService {
  private readonly logger = new Logger(PeriodClosureService.name);

  constructor(
    @InjectRepository(JournalEntry)
    private readonly journalEntryRepository: Repository<JournalEntry>,
    @InjectRepository(AccountBalance)
    private readonly accountBalanceRepository: Repository<AccountBalance>,
    @InjectRepository(TrialBalance)
    private readonly trialBalanceRepository: Repository<TrialBalance>,
    @InjectRepository(ChartOfAccounts)
    private readonly chartOfAccountsRepository: Repository<ChartOfAccounts>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Validate period closure requirements
   */
  async validatePeriodClosure(periodId: string, companyId: string): Promise<PeriodClosureValidation> {
    this.logger.log(`Validating period closure for period ${periodId}`);

    const validation: PeriodClosureValidation = {
      isValid: true,
      errors: [],
      warnings: [],
      checks: {
        balancedEntries: false,
        postedEntries: false,
        reconciliations: false,
        adjustments: false,
        approvals: false,
        trialBalance: false,
      },
    };

    try {
      // Check 1: All journal entries are balanced
      const unbalancedEntries = await this.journalEntryRepository
        .createQueryBuilder('je')
        .where('je.periodId = :periodId', { periodId })
        .andWhere('je.companyId = :companyId', { companyId })
        .andWhere('je.isBalanced = false')
        .getCount();

      if (unbalancedEntries > 0) {
        validation.errors.push(`${unbalancedEntries} unbalanced journal entries found`);
        validation.isValid = false;
      } else {
        validation.checks.balancedEntries = true;
      }

      // Check 2: All journal entries are posted
      const unpostedEntries = await this.journalEntryRepository
        .createQueryBuilder('je')
        .where('je.periodId = :periodId', { periodId })
        .andWhere('je.companyId = :companyId', { companyId })
        .andWhere('je.status != :status', { status: 'POSTED' })
        .getCount();

      if (unpostedEntries > 0) {
        validation.errors.push(`${unpostedEntries} unposted journal entries found`);
        validation.isValid = false;
      } else {
        validation.checks.postedEntries = true;
      }

      // Check 3: All reconcilable accounts are reconciled
      const unreconciledAccounts = await this.accountBalanceRepository
        .createQueryBuilder('ab')
        .innerJoin('ab.account', 'coa')
        .where('ab.periodId = :periodId', { periodId })
        .andWhere('ab.companyId = :companyId', { companyId })
        .andWhere('coa.reconcilable = true')
        .andWhere('ab.reconciliationStatus != :status', { status: 'RECONCILED' })
        .getCount();

      if (unreconciledAccounts > 0) {
        validation.warnings.push(`${unreconciledAccounts} reconcilable accounts not reconciled`);
      } else {
        validation.checks.reconciliations = true;
      }

      // Check 4: Required adjusting entries completed
      const pendingAdjustments = await this.journalEntryRepository
        .createQueryBuilder('je')
        .where('je.periodId = :periodId', { periodId })
        .andWhere('je.companyId = :companyId', { companyId })
        .andWhere('je.sourceLedger = :source', { source: 'ADJUSTING' })
        .andWhere('je.status = :status', { status: 'PENDING' })
        .getCount();

      if (pendingAdjustments > 0) {
        validation.warnings.push(`${pendingAdjustments} pending adjusting entries`);
      } else {
        validation.checks.adjustments = true;
      }

      // Check 5: All entries approved
      const unapprovedEntries = await this.journalEntryRepository
        .createQueryBuilder('je')
        .where('je.periodId = :periodId', { periodId })
        .andWhere('je.companyId = :companyId', { companyId })
        .andWhere('je.approvedAt IS NULL')
        .getCount();

      if (unapprovedEntries > 0) {
        validation.errors.push(`${unapprovedEntries} unapproved journal entries found`);
        validation.isValid = false;
      } else {
        validation.checks.approvals = true;
      }

      // Check 6: Trial balance exists and is balanced
      const trialBalanceCount = await this.trialBalanceRepository
        .createQueryBuilder('tb')
        .where('tb.periodId = :periodId', { periodId })
        .andWhere('tb.companyId = :companyId', { companyId })
        .getCount();

      if (trialBalanceCount === 0) {
        validation.warnings.push('Trial balance not generated for period');
      } else {
        // Check if trial balance is balanced
        const trialBalanceTotals = await this.trialBalanceRepository
          .createQueryBuilder('tb')
          .select('SUM(tb.debitBalance)', 'totalDebits')
          .addSelect('SUM(tb.creditBalance)', 'totalCredits')
          .where('tb.periodId = :periodId', { periodId })
          .andWhere('tb.companyId = :companyId', { companyId })
          .getRawOne();

        const debitTotal = parseFloat(trialBalanceTotals.totalDebits) || 0;
        const creditTotal = parseFloat(trialBalanceTotals.totalCredits) || 0;

        if (Math.abs(debitTotal - creditTotal) > 0.01) {
          validation.errors.push(`Trial balance is not balanced: Debits ${debitTotal}, Credits ${creditTotal}`);
          validation.isValid = false;
        } else {
          validation.checks.trialBalance = true;
        }
      }

      this.logger.log(`Period validation completed: ${validation.isValid ? 'PASSED' : 'FAILED'}`);
      return validation;

    } catch (error) {
      this.logger.error(`Error validating period closure: ${error.message}`, error.stack);
      validation.errors.push(`Validation error: ${error.message}`);
      validation.isValid = false;
      return validation;
    }
  }

  /**
   * Execute period closure process
   */
  async closePeriod(
    periodId: string,
    companyId: string,
    userId: string,
    forceClose: boolean = false,
  ): Promise<PeriodClosureResult> {
    const startTime = Date.now();
    this.logger.log(`Starting period closure for period ${periodId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate period is not already closed
      const period = await queryRunner.query(
        'SELECT * FROM financial_periods WHERE id = $1 AND "companyId" = $2',
        [periodId, companyId],
      );

      if (!period || period.length === 0) {
        throw new BadRequestException('Financial period not found');
      }

      if (period[0].isClosed) {
        throw new ConflictException('Period is already closed');
      }

      // Validate closure requirements (unless forced)
      if (!forceClose) {
        const validation = await this.validatePeriodClosure(periodId, companyId);
        if (!validation.isValid) {
          throw new BadRequestException(`Period closure validation failed: ${validation.errors.join(', ')}`);
        }
      }

      const result: PeriodClosureResult = {
        periodId,
        closureDate: new Date(),
        totalEntries: 0,
        totalAmount: 0,
        balancesGenerated: 0,
        trialBalanceGenerated: false,
        adjustingEntries: [],
        validationErrors: [],
        duration: 0,
      };

      // Step 1: Finalize all account balances
      this.logger.log('Step 1: Finalizing account balances');
      const balancesGenerated = await this.finalizeAccountBalances(periodId, companyId, userId, queryRunner);
      result.balancesGenerated = balancesGenerated;

      // Step 2: Generate final trial balance
      this.logger.log('Step 2: Generating final trial balance');
      await this.generateFinalTrialBalance(periodId, companyId, userId, queryRunner);
      result.trialBalanceGenerated = true;

      // Step 3: Generate closing entries (for revenue and expense accounts)
      this.logger.log('Step 3: Generating closing entries');
      const closingEntries = await this.generateClosingEntries(periodId, companyId, userId, queryRunner);
      result.adjustingEntries = closingEntries;

      // Step 4: Lock all journal entries for the period
      this.logger.log('Step 4: Locking journal entries');
      const entryStats = await this.lockJournalEntries(periodId, companyId, queryRunner);
      result.totalEntries = entryStats.count;
      result.totalAmount = entryStats.totalAmount;

      // Step 5: Mark period as closed
      this.logger.log('Step 5: Marking period as closed');
      await queryRunner.query(
        `UPDATE financial_periods 
         SET "isClosed" = true, "closedAt" = now(), "closedBy" = $1
         WHERE id = $2 AND "companyId" = $3`,
        [userId, periodId, companyId],
      );

      // Step 6: Create audit log entry
      await queryRunner.query(
        `INSERT INTO audit_log (table_name, record_id, operation, new_values, changed_by)
         VALUES ('financial_periods', $1, 'PERIOD_CLOSURE', $2, $3)`,
        [
          periodId,
          JSON.stringify({
            action: 'PERIOD_CLOSED',
            totalEntries: result.totalEntries,
            totalAmount: result.totalAmount,
            balancesGenerated: result.balancesGenerated,
            closureDate: result.closureDate,
          }),
          userId,
        ],
      );

      await queryRunner.commitTransaction();

      result.duration = Date.now() - startTime;
      this.logger.log(`Period closure completed successfully in ${result.duration}ms`);

      // Emit period closure event
      this.eventEmitter.emit('period.closed', {
        periodId,
        companyId,
        userId,
        result,
      });

      return result;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Period closure failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Reopen a closed period (if allowed)
   */
  async reopenPeriod(periodId: string, companyId: string, userId: string, reason: string): Promise<void> {
    this.logger.log(`Reopening period ${periodId} - Reason: ${reason}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify period is closed
      const period = await queryRunner.query(
        'SELECT * FROM financial_periods WHERE id = $1 AND "companyId" = $2 AND "isClosed" = true',
        [periodId, companyId],
      );

      if (!period || period.length === 0) {
        throw new BadRequestException('Closed period not found');
      }

      // Check if subsequent periods are closed (prevent out-of-order reopening)
      const subsequentClosedPeriods = await queryRunner.query(
        `SELECT COUNT(*) as count FROM financial_periods 
         WHERE "companyId" = $1 AND "startDate" > $2 AND "isClosed" = true`,
        [companyId, period[0].endDate],
      );

      if (subsequentClosedPeriods[0].count > 0) {
        throw new ConflictException('Cannot reopen period: subsequent periods are already closed');
      }

      // Reopen the period
      await queryRunner.query(
        `UPDATE financial_periods 
         SET "isClosed" = false, "closedAt" = null, "closedBy" = null
         WHERE id = $1`,
        [periodId],
      );

      // Unlock journal entries
      await queryRunner.query(
        `UPDATE journal_entries 
         SET metadata = metadata || '{"reopened": true, "reopenedAt": "' || now()::text || '", "reopenedBy": "' || $2 || '"}'
         WHERE "periodId" = $1`,
        [periodId, userId],
      );

      // Create audit log entry
      await queryRunner.query(
        `INSERT INTO audit_log (table_name, record_id, operation, new_values, changed_by, reason)
         VALUES ('financial_periods', $1, 'PERIOD_REOPENED', $2, $3, $4)`,
        [
          periodId,
          JSON.stringify({
            action: 'PERIOD_REOPENED',
            reopenedAt: new Date(),
            reason: reason,
          }),
          userId,
          reason,
        ],
      );

      await queryRunner.commitTransaction();

      this.logger.log(`Period ${periodId} reopened successfully`);

      // Emit period reopened event
      this.eventEmitter.emit('period.reopened', {
        periodId,
        companyId,
        userId,
        reason,
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Period reopening failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get period closure status
   */
  async getPeriodStatus(periodId: string, companyId: string): Promise<any> {
    const period = await this.dataSource.query(
      'SELECT * FROM financial_periods WHERE id = $1 AND "companyId" = $2',
      [periodId, companyId],
    );

    if (!period || period.length === 0) {
      throw new BadRequestException('Period not found');
    }

    const validation = await this.validatePeriodClosure(periodId, companyId);

    return {
      period: period[0],
      validation,
      canClose: validation.isValid,
      canReopen: period[0].isClosed,
    };
  }

  // Private helper methods
  private async finalizeAccountBalances(
    periodId: string,
    companyId: string,
    userId: string,
    queryRunner: any,
  ): Promise<number> {
    // Recalculate and lock all account balances for the period
    const balanceQuery = `
      INSERT INTO account_balances (
        "accountId", "periodId", "openingBalance", "debitMovements", 
        "creditMovements", "closingBalance", "functionalOpeningBalance",
        "functionalDebitMovements", "functionalCreditMovements", 
        "functionalClosingBalance", "transactionCount", "lastTransactionDate",
        "companyId", "currencyCode", "isLocked", "lockedAt", "lockedBy",
        "createdBy", "updatedBy"
      )
      SELECT 
        jl."accountId",
        $1 as "periodId",
        0 as "openingBalance",
        SUM(jl."debitAmount") as "debitMovements",
        SUM(jl."creditAmount") as "creditMovements",
        CASE 
          WHEN coa."normalBalance" = 'DEBIT' THEN SUM(jl."debitAmount") - SUM(jl."creditAmount")
          ELSE SUM(jl."creditAmount") - SUM(jl."debitAmount")
        END as "closingBalance",
        0 as "functionalOpeningBalance",
        SUM(jl."functionalDebitAmount") as "functionalDebitMovements",
        SUM(jl."functionalCreditAmount") as "functionalCreditMovements",
        CASE 
          WHEN coa."normalBalance" = 'DEBIT' THEN SUM(jl."functionalDebitAmount") - SUM(jl."functionalCreditAmount")
          ELSE SUM(jl."functionalCreditAmount") - SUM(jl."functionalDebitAmount")
        END as "functionalClosingBalance",
        COUNT(*) as "transactionCount",
        MAX(je."date") as "lastTransactionDate",
        $2 as "companyId",
        'USD' as "currencyCode",
        true as "isLocked",
        now() as "lockedAt",
        $3 as "lockedBy",
        $3 as "createdBy",
        $3 as "updatedBy"
      FROM journal_lines jl
      JOIN journal_entries je ON jl."journalEntryId" = je.id
      JOIN chart_of_accounts coa ON jl."accountId" = coa.id
      WHERE je."periodId" = $1 AND je."companyId" = $2 AND je."status" = 'POSTED'
      GROUP BY jl."accountId", coa."normalBalance"
      ON CONFLICT ("accountId", "periodId") 
      DO UPDATE SET
        "debitMovements" = EXCLUDED."debitMovements",
        "creditMovements" = EXCLUDED."creditMovements",
        "closingBalance" = EXCLUDED."closingBalance",
        "functionalDebitMovements" = EXCLUDED."functionalDebitMovements",
        "functionalCreditMovements" = EXCLUDED."functionalCreditMovements",
        "functionalClosingBalance" = EXCLUDED."functionalClosingBalance",
        "transactionCount" = EXCLUDED."transactionCount",
        "lastTransactionDate" = EXCLUDED."lastTransactionDate",
        "isLocked" = true,
        "lockedAt" = now(),
        "lockedBy" = $3,
        "updatedAt" = now()
    `;

    const result = await queryRunner.query(balanceQuery, [periodId, companyId, userId]);
    return result.length || 0;
  }

  private async generateFinalTrialBalance(
    periodId: string,
    companyId: string,
    userId: string,
    queryRunner: any,
  ): Promise<void> {
    const trialBalanceQuery = `
      INSERT INTO trial_balances (
        "periodId", "accountId", "accountCode", "accountName", "accountType",
        "debitBalance", "creditBalance", "functionalDebitBalance", "functionalCreditBalance",
        "movementDebit", "movementCredit", "companyId", "currencyCode",
        "isAdjusted", "isClosed", "generatedBy"
      )
      SELECT 
        ab."periodId",
        ab."accountId",
        coa."accountCode",
        coa."accountName",
        coa."accountType",
        CASE WHEN ab."closingBalance" >= 0 AND coa."normalBalance" = 'DEBIT' THEN ab."closingBalance" ELSE 0 END as "debitBalance",
        CASE WHEN ab."closingBalance" >= 0 AND coa."normalBalance" = 'CREDIT' THEN ab."closingBalance" 
             WHEN ab."closingBalance" < 0 AND coa."normalBalance" = 'DEBIT' THEN ABS(ab."closingBalance")
             ELSE 0 END as "creditBalance",
        CASE WHEN ab."functionalClosingBalance" >= 0 AND coa."normalBalance" = 'DEBIT' THEN ab."functionalClosingBalance" ELSE 0 END as "functionalDebitBalance",
        CASE WHEN ab."functionalClosingBalance" >= 0 AND coa."normalBalance" = 'CREDIT' THEN ab."functionalClosingBalance"
             WHEN ab."functionalClosingBalance" < 0 AND coa."normalBalance" = 'DEBIT' THEN ABS(ab."functionalClosingBalance")
             ELSE 0 END as "functionalCreditBalance",
        ab."debitMovements",
        ab."creditMovements",
        ab."companyId",
        ab."currencyCode",
        true as "isAdjusted",
        true as "isClosed",
        $3 as "generatedBy"
      FROM account_balances ab
      JOIN chart_of_accounts coa ON ab."accountId" = coa.id
      WHERE ab."periodId" = $1 AND ab."companyId" = $2
      ON CONFLICT ("accountId", "periodId") 
      DO UPDATE SET
        "debitBalance" = EXCLUDED."debitBalance",
        "creditBalance" = EXCLUDED."creditBalance",
        "functionalDebitBalance" = EXCLUDED."functionalDebitBalance",
        "functionalCreditBalance" = EXCLUDED."functionalCreditBalance",
        "movementDebit" = EXCLUDED."movementDebit",
        "movementCredit" = EXCLUDED."movementCredit",
        "isAdjusted" = true,
        "isClosed" = true,
        "lastRecalculated" = now()
    `;

    await queryRunner.query(trialBalanceQuery, [periodId, companyId, userId]);
  }

  private async generateClosingEntries(
    periodId: string,
    companyId: string,
    userId: string,
    queryRunner: any,
  ): Promise<string[]> {
    // This would generate closing entries to transfer revenue/expense balances to retained earnings
    // Implementation would depend on specific accounting requirements
    return [];
  }

  private async lockJournalEntries(
    periodId: string,
    companyId: string,
    queryRunner: any,
  ): Promise<{ count: number; totalAmount: number }> {
    const result = await queryRunner.query(
      `SELECT COUNT(*) as count, COALESCE(SUM("totalDebit"), 0) as total_amount
       FROM journal_entries 
       WHERE "periodId" = $1 AND "companyId" = $2`,
      [periodId, companyId],
    );

    // Add metadata to indicate period is locked
    await queryRunner.query(
      `UPDATE journal_entries 
       SET metadata = metadata || '{"periodLocked": true, "lockedAt": "' || now()::text || '"}'
       WHERE "periodId" = $1 AND "companyId" = $2`,
      [periodId, companyId],
    );

    return {
      count: parseInt(result[0].count) || 0,
      totalAmount: parseFloat(result[0].total_amount) || 0,
    };
  }
}
