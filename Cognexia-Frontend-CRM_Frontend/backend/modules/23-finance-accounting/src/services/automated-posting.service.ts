/**
 * Automated Journal Posting Service
 * 
 * Handles automated journal entry creation based on rules engine,
 * AI-powered validation, batch processing, and intelligent routing.
 * 
 * @version 3.0.0
 * @compliance SOC2, SOX, GAAP, IFRS
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JournalEntry } from '../entities/journal-entry.entity';
import { JournalLine } from '../entities/journal-line.entity';
import { PostingRule } from '../entities/posting-rule.entity';
import { ChartOfAccounts } from '../entities/chart-of-accounts.entity';
import { PaymentTransaction } from '../entities/payment-transaction.entity';

export interface SourceTransaction {
  id: string;
  sourceSystem: string;
  transactionType: string;
  amount: number;
  currency: string;
  date: Date;
  description: string;
  reference?: string;
  metadata: Record<string, any>;
  companyId: string;
  departmentId?: string;
  projectId?: string;
  customerId?: string;
  vendorId?: string;
}

export interface PostingInstruction {
  debitAccount: string;
  creditAccount: string;
  amount: number;
  description: string;
  reference?: string;
  dimensions?: Record<string, any>;
  taxHandling?: {
    taxCode?: string;
    taxRate?: number;
    taxAmount?: number;
  };
}

export interface AutoPostingResult {
  sourceTransactionId: string;
  journalEntryId?: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING_APPROVAL' | 'VALIDATION_FAILED';
  errors: string[];
  warnings: string[];
  aiValidationScore?: number;
  appliedRuleId?: string;
  processingTime: number;
}

export interface BatchPostingResult {
  batchId: string;
  totalTransactions: number;
  successfulPostings: number;
  failedPostings: number;
  pendingApproval: number;
  results: AutoPostingResult[];
  startTime: Date;
  endTime: Date;
  duration: number;
}

export interface AIValidationResult {
  isValid: boolean;
  confidence: number; // 0-1
  score: number; // 0-100
  anomalies: string[];
  suggestions: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface PostingRuleEvaluation {
  rule: PostingRule;
  matches: boolean;
  confidence: number;
  evaluationDetails: Record<string, any>;
}

@Injectable()
export class AutomatedPostingService {
  private readonly logger = new Logger(AutomatedPostingService.name);

  constructor(
    @InjectRepository(JournalEntry)
    private readonly journalEntryRepository: Repository<JournalEntry>,
    @InjectRepository(JournalLine)
    private readonly journalLineRepository: Repository<JournalLine>,
    @InjectRepository(PostingRule)
    private readonly postingRuleRepository: Repository<PostingRule>,
    @InjectRepository(ChartOfAccounts)
    private readonly chartOfAccountsRepository: Repository<ChartOfAccounts>,
    @InjectRepository(PaymentTransaction)
    private readonly paymentTransactionRepository: Repository<PaymentTransaction>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Process a single source transaction for automated posting
   */
  async processTransaction(
    sourceTransaction: SourceTransaction,
    userId: string,
    autoApprove: boolean = false,
  ): Promise<AutoPostingResult> {
    const startTime = Date.now();
    this.logger.log(`Processing transaction ${sourceTransaction.id} from ${sourceTransaction.sourceSystem}`);

    const result: AutoPostingResult = {
      sourceTransactionId: sourceTransaction.id,
      status: 'FAILED',
      errors: [],
      warnings: [],
      processingTime: 0,
    };

    try {
      // Step 1: Find applicable posting rules
      const applicableRules = await this.findApplicableRules(sourceTransaction);
      
      if (applicableRules.length === 0) {
        result.errors.push('No applicable posting rules found');
        result.status = 'FAILED';
        return result;
      }

      // Step 2: Evaluate rules and select the best match
      const ruleEvaluations = await this.evaluateRules(applicableRules, sourceTransaction);
      const bestRule = this.selectBestRule(ruleEvaluations);

      if (!bestRule) {
        result.errors.push('No suitable posting rule could be determined');
        result.status = 'FAILED';
        return result;
      }

      result.appliedRuleId = bestRule.rule.id;

      // Step 3: Generate posting instructions from rule
      const postingInstructions = await this.generatePostingInstructions(bestRule.rule, sourceTransaction);

      // Step 4: Validate posting instructions
      const validationResult = await this.validatePostingInstructions(postingInstructions, sourceTransaction);
      
      if (!validationResult.isValid) {
        result.errors.push(`Validation failed: ${validationResult.anomalies.join(', ')}`);
        result.status = 'VALIDATION_FAILED';
        return result;
      }

      result.aiValidationScore = validationResult.score;

      // Step 5: AI-powered validation
      const aiValidation = await this.performAIValidation(sourceTransaction, postingInstructions);
      
      if (aiValidation.riskLevel === 'HIGH' || aiValidation.confidence < 0.7) {
        result.warnings.push(`AI flagged for review: ${aiValidation.anomalies.join(', ')}`);
        if (!autoApprove) {
          result.status = 'PENDING_APPROVAL';
          await this.createPendingJournalEntry(sourceTransaction, postingInstructions, userId, aiValidation);
          return result;
        }
      }

      // Step 6: Create and post journal entry
      const journalEntry = await this.createJournalEntry(sourceTransaction, postingInstructions, userId, autoApprove);
      result.journalEntryId = journalEntry.id;

      // Step 7: Update rule usage statistics
      await this.updateRuleStatistics(bestRule.rule.id);

      result.status = 'SUCCESS';
      
      // Emit posting event
      this.eventEmitter.emit('journal.auto-posted', {
        sourceTransactionId: sourceTransaction.id,
        journalEntryId: journalEntry.id,
        ruleId: bestRule.rule.id,
        aiScore: aiValidation.score,
      });

    } catch (error) {
      this.logger.error(`Auto-posting failed for transaction ${sourceTransaction.id}: ${error.message}`, error.stack);
      result.errors.push(error.message);
      result.status = 'FAILED';
    } finally {
      result.processingTime = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Process multiple transactions in batch
   */
  async processBatch(
    sourceTransactions: SourceTransaction[],
    userId: string,
    batchOptions: {
      autoApprove?: boolean;
      parallelProcessing?: boolean;
      failFast?: boolean;
    } = {},
  ): Promise<BatchPostingResult> {
    const batchId = `BATCH-${Date.now()}`;
    const startTime = new Date();
    
    this.logger.log(`Starting batch processing: ${batchId} with ${sourceTransactions.length} transactions`);

    const result: BatchPostingResult = {
      batchId,
      totalTransactions: sourceTransactions.length,
      successfulPostings: 0,
      failedPostings: 0,
      pendingApproval: 0,
      results: [],
      startTime,
      endTime: new Date(),
      duration: 0,
    };

    try {
      if (batchOptions.parallelProcessing) {
        // Process transactions in parallel
        const promises = sourceTransactions.map(txn => 
          this.processTransaction(txn, userId, batchOptions.autoApprove)
        );
        result.results = await Promise.all(promises);
      } else {
        // Process transactions sequentially
        for (const transaction of sourceTransactions) {
          const txnResult = await this.processTransaction(transaction, userId, batchOptions.autoApprove);
          result.results.push(txnResult);

          // Check fail-fast option
          if (batchOptions.failFast && txnResult.status === 'FAILED') {
            this.logger.warn(`Batch processing stopped due to fail-fast option`);
            break;
          }
        }
      }

      // Calculate statistics
      result.results.forEach(res => {
        switch (res.status) {
          case 'SUCCESS':
            result.successfulPostings++;
            break;
          case 'PENDING_APPROVAL':
            result.pendingApproval++;
            break;
          default:
            result.failedPostings++;
        }
      });

    } catch (error) {
      this.logger.error(`Batch processing failed: ${error.message}`, error.stack);
    } finally {
      result.endTime = new Date();
      result.duration = result.endTime.getTime() - result.startTime.getTime();
    }

    this.logger.log(`Batch processing completed: ${result.successfulPostings} success, ${result.failedPostings} failed, ${result.pendingApproval} pending`);

    // Emit batch completion event
    this.eventEmitter.emit('journal.batch-processed', result);

    return result;
  }

  /**
   * Scheduled job to process pending transactions
   */
  @Cron(CronExpression.EVERY_15_MINUTES)
  async processPendingTransactions(): Promise<void> {
    this.logger.log('Processing pending automated transactions...');

    try {
      // Find unprocessed payment transactions
      const pendingPayments = await this.paymentTransactionRepository
        .createQueryBuilder('pt')
        .where('pt.status = :status', { status: 'COMPLETED' })
        .andWhere('pt.journalEntryId IS NULL')
        .andWhere('pt.processedAt IS NOT NULL')
        .limit(100) // Process in batches
        .getMany();

      if (pendingPayments.length === 0) {
        return;
      }

      // Convert to source transactions
      const sourceTransactions: SourceTransaction[] = pendingPayments.map(payment => ({
        id: payment.id,
        sourceSystem: 'PAYMENT_SYSTEM',
        transactionType: payment.type,
        amount: payment.amount,
        currency: payment.currencyCode,
        date: payment.paymentDate,
        description: payment.description,
        reference: payment.reference,
        metadata: {
          paymentMethod: payment.paymentMethod,
          payeeType: payment.payeeType,
          bankAccountId: payment.bankAccountId,
        },
        companyId: payment.companyId,
        departmentId: payment.departmentId,
        projectId: payment.projectId,
      }));

      // Process batch
      const batchResult = await this.processBatch(sourceTransactions, 'SYSTEM', {
        autoApprove: true,
        parallelProcessing: true,
        failFast: false,
      });

      // Update payment transactions with journal entry IDs
      for (const result of batchResult.results) {
        if (result.status === 'SUCCESS' && result.journalEntryId) {
          await this.paymentTransactionRepository.update(
            { id: result.sourceTransactionId },
            { journalEntryId: result.journalEntryId },
          );
        }
      }

    } catch (error) {
      this.logger.error(`Scheduled processing failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Get processing statistics
   */
  async getProcessingStatistics(
    companyId: string,
    periodId?: string,
  ): Promise<{
    totalProcessed: number;
    successRate: number;
    averageProcessingTime: number;
    ruleUsage: Array<{ ruleId: string; ruleName: string; usageCount: number }>;
    aiValidationStats: { averageScore: number; riskDistribution: Record<string, number> };
  }> {
    // This would query audit logs and statistics tables
    // Implementation would depend on specific requirements
    return {
      totalProcessed: 0,
      successRate: 0,
      averageProcessingTime: 0,
      ruleUsage: [],
      aiValidationStats: {
        averageScore: 0,
        riskDistribution: {},
      },
    };
  }

  // Private helper methods
  private async findApplicableRules(sourceTransaction: SourceTransaction): Promise<PostingRule[]> {
    return this.postingRuleRepository
      .createQueryBuilder('pr')
      .where('pr.sourceSystem = :sourceSystem', { sourceSystem: sourceTransaction.sourceSystem })
      .andWhere('pr.transactionType = :transactionType', { transactionType: sourceTransaction.transactionType })
      .andWhere('pr.isActive = true')
      .andWhere('pr.companyId = :companyId', { companyId: sourceTransaction.companyId })
      .andWhere('pr.validFrom <= :date', { date: sourceTransaction.date })
      .andWhere('(pr.validTo IS NULL OR pr.validTo >= :date)', { date: sourceTransaction.date })
      .orderBy('pr.priority', 'ASC')
      .getMany();
  }

  private async evaluateRules(
    rules: PostingRule[],
    sourceTransaction: SourceTransaction,
  ): Promise<PostingRuleEvaluation[]> {
    const evaluations: PostingRuleEvaluation[] = [];

    for (const rule of rules) {
      const evaluation: PostingRuleEvaluation = {
        rule,
        matches: false,
        confidence: 0,
        evaluationDetails: {},
      };

      // Evaluate rule conditions
      const conditions = rule.conditions as Record<string, any>;
      let matchedConditions = 0;
      let totalConditions = Object.keys(conditions).length;

      for (const [key, expectedValue] of Object.entries(conditions)) {
        const actualValue = this.getTransactionValue(sourceTransaction, key);
        
        if (this.compareValues(actualValue, expectedValue)) {
          matchedConditions++;
          evaluation.evaluationDetails[key] = { expected: expectedValue, actual: actualValue, match: true };
        } else {
          evaluation.evaluationDetails[key] = { expected: expectedValue, actual: actualValue, match: false };
        }
      }

      if (totalConditions === 0) {
        // No conditions means rule applies to all transactions of this type
        evaluation.matches = true;
        evaluation.confidence = 0.8;
      } else {
        evaluation.confidence = matchedConditions / totalConditions;
        evaluation.matches = evaluation.confidence >= 0.8; // 80% threshold
      }

      evaluations.push(evaluation);
    }

    return evaluations.filter(e => e.matches);
  }

  private selectBestRule(evaluations: PostingRuleEvaluation[]): PostingRuleEvaluation | null {
    if (evaluations.length === 0) return null;

    // Sort by confidence and priority
    evaluations.sort((a, b) => {
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence; // Higher confidence first
      }
      return a.rule.priority - b.rule.priority; // Lower priority number first
    });

    return evaluations[0];
  }

  private async generatePostingInstructions(
    rule: PostingRule,
    sourceTransaction: SourceTransaction,
  ): Promise<PostingInstruction[]> {
    const instructions: PostingInstruction[] = [];

    // Basic debit/credit instruction
    const debitAccount = this.interpolateAccountTemplate(rule.debitAccountTemplate, sourceTransaction);
    const creditAccount = this.interpolateAccountTemplate(rule.creditAccountTemplate, sourceTransaction);

    let amount = sourceTransaction.amount;
    
    // Apply amount formula if specified
    if (rule.amountFormula) {
      amount = this.evaluateAmountFormula(rule.amountFormula, sourceTransaction);
    }

    const baseInstruction: PostingInstruction = {
      debitAccount,
      creditAccount,
      amount: Math.abs(amount),
      description: this.interpolateDescriptionTemplate(rule.descriptionTemplate, sourceTransaction),
      reference: sourceTransaction.reference,
      dimensions: {
        departmentId: sourceTransaction.departmentId,
        projectId: sourceTransaction.projectId,
        customerId: sourceTransaction.customerId,
        vendorId: sourceTransaction.vendorId,
      },
    };

    // Handle tax if specified
    const taxHandling = rule.taxHandling as Record<string, any>;
    if (taxHandling && taxHandling.enabled) {
      baseInstruction.taxHandling = {
        taxCode: taxHandling.taxCode,
        taxRate: taxHandling.taxRate,
        taxAmount: amount * (taxHandling.taxRate || 0),
      };
    }

    instructions.push(baseInstruction);

    return instructions;
  }

  private async validatePostingInstructions(
    instructions: PostingInstruction[],
    sourceTransaction: SourceTransaction,
  ): Promise<AIValidationResult> {
    const validation: AIValidationResult = {
      isValid: true,
      confidence: 1.0,
      score: 100,
      anomalies: [],
      suggestions: [],
      riskLevel: 'LOW',
    };

    for (const instruction of instructions) {
      // Validate accounts exist and are active
      const debitAccount = await this.chartOfAccountsRepository.findOne({
        where: { accountCode: instruction.debitAccount, companyId: sourceTransaction.companyId, isActive: true },
      });

      const creditAccount = await this.chartOfAccountsRepository.findOne({
        where: { accountCode: instruction.creditAccount, companyId: sourceTransaction.companyId, isActive: true },
      });

      if (!debitAccount) {
        validation.isValid = false;
        validation.anomalies.push(`Debit account ${instruction.debitAccount} not found or inactive`);
      }

      if (!creditAccount) {
        validation.isValid = false;
        validation.anomalies.push(`Credit account ${instruction.creditAccount} not found or inactive`);
      }

      // Validate amount is reasonable
      if (instruction.amount <= 0) {
        validation.isValid = false;
        validation.anomalies.push('Amount must be greater than zero');
      }

      if (instruction.amount > 1000000) { // $1M threshold
        validation.riskLevel = 'HIGH';
        validation.anomalies.push('Large amount transaction requires review');
      }
    }

    return validation;
  }

  private async performAIValidation(
    sourceTransaction: SourceTransaction,
    instructions: PostingInstruction[],
  ): Promise<AIValidationResult> {
    // Simplified AI validation - in practice, this would use ML models
    const validation: AIValidationResult = {
      isValid: true,
      confidence: 0.9,
      score: 90,
      anomalies: [],
      suggestions: [],
      riskLevel: 'LOW',
    };

    // Check for unusual patterns
    const totalAmount = instructions.reduce((sum, inst) => sum + inst.amount, 0);
    
    // Amount analysis
    if (totalAmount > sourceTransaction.amount * 1.1) {
      validation.riskLevel = 'MEDIUM';
      validation.anomalies.push('Posted amount significantly exceeds source amount');
      validation.confidence -= 0.2;
    }

    // Time-based analysis
    const hour = sourceTransaction.date.getHours();
    if (hour < 6 || hour > 22) {
      validation.riskLevel = 'MEDIUM';
      validation.anomalies.push('Transaction processed outside normal business hours');
      validation.confidence -= 0.1;
    }

    // Weekend processing
    const dayOfWeek = sourceTransaction.date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      validation.suggestions.push('Weekend transaction - verify business justification');
      validation.confidence -= 0.05;
    }

    // Update score based on confidence
    validation.score = Math.round(validation.confidence * 100);

    return validation;
  }

  private async createJournalEntry(
    sourceTransaction: SourceTransaction,
    instructions: PostingInstruction[],
    userId: string,
    autoPost: boolean = false,
  ): Promise<JournalEntry> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create journal entry
      const journalEntry = new JournalEntry();
      journalEntry.journalNumber = await this.generateJournalNumber(sourceTransaction);
      journalEntry.date = sourceTransaction.date;
      journalEntry.description = `Auto-posted: ${sourceTransaction.description}`;
      journalEntry.reference = sourceTransaction.reference;
      journalEntry.status = autoPost ? 'POSTED' : 'PENDING';
      journalEntry.sourceLedger = sourceTransaction.sourceSystem;
      journalEntry.sourceDocument = sourceTransaction.sourceSystem;
      journalEntry.sourceDocumentId = sourceTransaction.id;
      journalEntry.companyId = sourceTransaction.companyId;
      journalEntry.departmentId = sourceTransaction.departmentId;
      journalEntry.projectId = sourceTransaction.projectId;
      journalEntry.currencyCode = sourceTransaction.currency;
      journalEntry.exchangeRate = 1.0; // Assume base currency for now
      journalEntry.createdBy = userId;
      journalEntry.updatedBy = userId;

      if (autoPost) {
        journalEntry.postedAt = new Date();
        journalEntry.postedBy = userId;
      }

      // Calculate totals
      let totalDebit = 0;
      let totalCredit = 0;
      instructions.forEach(inst => {
        totalDebit += inst.amount;
        totalCredit += inst.amount;
      });

      journalEntry.totalDebit = totalDebit;
      journalEntry.totalCredit = totalCredit;
      journalEntry.isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

      const savedEntry = await queryRunner.manager.save(journalEntry);

      // Create journal lines
      for (let i = 0; i < instructions.length; i++) {
        const instruction = instructions[i];

        // Debit line
        const debitLine = new JournalLine();
        debitLine.journalEntry = savedEntry;
        debitLine.account = await queryRunner.manager.findOne(ChartOfAccounts, {
          where: { accountCode: instruction.debitAccount, companyId: sourceTransaction.companyId },
        });
        debitLine.lineNumber = (i * 2) + 1;
        debitLine.description = instruction.description;
        debitLine.debitAmount = instruction.amount;
        debitLine.creditAmount = 0;
        debitLine.functionalDebitAmount = instruction.amount;
        debitLine.functionalCreditAmount = 0;
        debitLine.currencyCode = sourceTransaction.currency;
        debitLine.exchangeRate = 1.0;
        debitLine.departmentId = instruction.dimensions?.departmentId;
        debitLine.projectId = instruction.dimensions?.projectId;
        debitLine.customerId = instruction.dimensions?.customerId;
        debitLine.vendorId = instruction.dimensions?.vendorId;
        debitLine.createdBy = userId;
        debitLine.updatedBy = userId;

        await queryRunner.manager.save(debitLine);

        // Credit line
        const creditLine = new JournalLine();
        creditLine.journalEntry = savedEntry;
        creditLine.account = await queryRunner.manager.findOne(ChartOfAccounts, {
          where: { accountCode: instruction.creditAccount, companyId: sourceTransaction.companyId },
        });
        creditLine.lineNumber = (i * 2) + 2;
        creditLine.description = instruction.description;
        creditLine.debitAmount = 0;
        creditLine.creditAmount = instruction.amount;
        creditLine.functionalDebitAmount = 0;
        creditLine.functionalCreditAmount = instruction.amount;
        creditLine.currencyCode = sourceTransaction.currency;
        creditLine.exchangeRate = 1.0;
        creditLine.departmentId = instruction.dimensions?.departmentId;
        creditLine.projectId = instruction.dimensions?.projectId;
        creditLine.customerId = instruction.dimensions?.customerId;
        creditLine.vendorId = instruction.dimensions?.vendorId;
        creditLine.createdBy = userId;
        creditLine.updatedBy = userId;

        await queryRunner.manager.save(creditLine);
      }

      await queryRunner.commitTransaction();
      return savedEntry;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async createPendingJournalEntry(
    sourceTransaction: SourceTransaction,
    instructions: PostingInstruction[],
    userId: string,
    aiValidation: AIValidationResult,
  ): Promise<JournalEntry> {
    const journalEntry = await this.createJournalEntry(sourceTransaction, instructions, userId, false);
    
    // Add AI validation metadata
    journalEntry.aiValidationStatus = 'PENDING';
    journalEntry.aiValidationScore = aiValidation.score / 100;
    journalEntry.aiValidationNotes = aiValidation.anomalies.join('; ');
    
    await this.journalEntryRepository.save(journalEntry);
    return journalEntry;
  }

  // Utility methods
  private getTransactionValue(transaction: SourceTransaction, key: string): any {
    const keys = key.split('.');
    let value: any = transaction;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value;
  }

  private compareValues(actual: any, expected: any): boolean {
    if (typeof expected === 'string' && expected.startsWith('>=')) {
      return actual >= parseFloat(expected.substring(2));
    }
    if (typeof expected === 'string' && expected.startsWith('<=')) {
      return actual <= parseFloat(expected.substring(2));
    }
    if (typeof expected === 'string' && expected.startsWith('>')) {
      return actual > parseFloat(expected.substring(1));
    }
    if (typeof expected === 'string' && expected.startsWith('<')) {
      return actual < parseFloat(expected.substring(1));
    }
    
    return actual === expected;
  }

  private interpolateAccountTemplate(template: string, transaction: SourceTransaction): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      return this.getTransactionValue(transaction, key) || template;
    });
  }

  private interpolateDescriptionTemplate(template: string | undefined, transaction: SourceTransaction): string {
    if (!template) return transaction.description;
    
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      return this.getTransactionValue(transaction, key) || match;
    });
  }

  private evaluateAmountFormula(formula: string, transaction: SourceTransaction): number {
    // Simple formula evaluation - in practice, would use a proper expression parser
    if (formula === 'amount') return transaction.amount;
    if (formula === 'amount * 0.1') return transaction.amount * 0.1;
    if (formula === 'amount + 10') return transaction.amount + 10;
    
    return transaction.amount;
  }

  private async generateJournalNumber(transaction: SourceTransaction): Promise<string> {
    const prefix = transaction.sourceSystem.substring(0, 3).toUpperCase();
    const timestamp = Date.now();
    return `${prefix}-${timestamp}`;
  }

  private async updateRuleStatistics(ruleId: string): Promise<void> {
    await this.postingRuleRepository.update(ruleId, {
      lastUsed: new Date(),
      usageCount: () => '"usageCount" + 1',
    });
  }
}
