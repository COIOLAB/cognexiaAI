/**
 * General Ledger Service Unit Tests
 * Comprehensive test suite for core accounting functionality
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { GeneralLedgerService } from './general-ledger.service';
import Decimal from 'decimal.js';

describe('GeneralLedgerService', () => {
  let service: GeneralLedgerService;
  let dataSource: jest.Mocked<DataSource>;
  let queryRunner: jest.Mocked<QueryRunner>;
  let configService: jest.Mocked<ConfigService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    // Create mock QueryRunner
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
      },
    } as any;

    // Create mock DataSource
    dataSource = {
      createQueryRunner: jest.fn(() => queryRunner),
      manager: {
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
      },
    } as any;

    // Create mock ConfigService
    configService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          'finance.currency': 'USD',
          'finance.fiscalYearStart': '01-01',
          'finance.precision': 4,
        };
        return config[key] ?? defaultValue;
      }),
    } as any;

    // Create mock EventEmitter
    eventEmitter = {
      emit: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneralLedgerService,
        { provide: DataSource, useValue: dataSource },
        { provide: ConfigService, useValue: configService },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<GeneralLedgerService>(GeneralLedgerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // SERVICE INITIALIZATION TESTS
  // ============================================================================

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have required dependencies injected', () => {
      expect(service['dataSource']).toBeDefined();
      expect(service['configService']).toBeDefined();
      expect(service['eventEmitter']).toBeDefined();
    });
  });

  // ============================================================================
  // CREATE JOURNAL ENTRY TESTS
  // ============================================================================

  describe('createJournalEntry', () => {
    const validJournalData = {
      description: 'Test journal entry',
      transactionDate: '2026-01-28T00:00:00.000Z',
      postingDate: '2026-01-28T00:00:00.000Z',
      reference: 'REF-001',
      source: 'manual',
      entityId: 'entity-123',
      currencyCode: 'USD',
      entries: [
        {
          accountId: 'acc-001',
          accountCode: '1000',
          accountName: 'Cash',
          debitAmount: new Decimal(1000),
          creditAmount: new Decimal(0),
          description: 'Cash debit',
        },
        {
          accountId: 'acc-002',
          accountCode: '3000',
          accountName: 'Revenue',
          debitAmount: new Decimal(0),
          creditAmount: new Decimal(1000),
          description: 'Revenue credit',
        },
      ],
      metadata: {},
    };

    it('should create a balanced journal entry successfully', async () => {
      const userId = 'user-123';
      queryRunner.manager.save.mockResolvedValue(validJournalData);

      const result = await service.createJournalEntry(validJournalData, userId);

      expect(result).toBeDefined();
      expect(result.journalId).toBeDefined();
      expect(result.status).toBe('draft');
      expect(result.totalDebit.toNumber()).toBe(1000);
      expect(result.totalCredit.toNumber()).toBe(1000);
      expect(result.createdBy).toBe(userId);
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'journal.entry.created',
        expect.objectContaining({
          journalId: expect.any(String),
          userId,
          amount: 1000,
        })
      );
    });

    it('should reject an unbalanced journal entry', async () => {
      const unbalancedData = {
        ...validJournalData,
        entries: [
          {
            accountId: 'acc-001',
            accountCode: '1000',
            accountName: 'Cash',
            debitAmount: new Decimal(1000),
            creditAmount: new Decimal(0),
            description: 'Cash debit',
          },
          {
            accountId: 'acc-002',
            accountCode: '3000',
            accountName: 'Revenue',
            debitAmount: new Decimal(0),
            creditAmount: new Decimal(500), // Unbalanced!
            description: 'Revenue credit',
          },
        ],
      };

      await expect(
        service.createJournalEntry(unbalancedData, 'user-123')
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createJournalEntry(unbalancedData, 'user-123')
      ).rejects.toThrow('Journal entry must balance');

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should handle transaction errors and rollback', async () => {
      queryRunner.manager.save.mockRejectedValue(new Error('Database error'));

      await expect(
        service.createJournalEntry(validJournalData, 'user-123')
      ).rejects.toThrow(InternalServerErrorException);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should create journal entry with zero amounts', async () => {
      const zeroAmountData = {
        ...validJournalData,
        entries: [
          {
            accountId: 'acc-001',
            accountCode: '1000',
            accountName: 'Cash',
            debitAmount: new Decimal(0),
            creditAmount: new Decimal(0),
            description: 'Zero entry',
          },
        ],
      };

      queryRunner.manager.save.mockResolvedValue(zeroAmountData);

      const result = await service.createJournalEntry(zeroAmountData, 'user-123');

      expect(result.totalDebit.toNumber()).toBe(0);
      expect(result.totalCredit.toNumber()).toBe(0);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should create journal entry with multiple line items', async () => {
      const multiLineData = {
        ...validJournalData,
        entries: [
          {
            accountId: 'acc-001',
            accountCode: '1000',
            accountName: 'Cash',
            debitAmount: new Decimal(500),
            creditAmount: new Decimal(0),
            description: 'Cash 1',
          },
          {
            accountId: 'acc-002',
            accountCode: '1010',
            accountName: 'Bank',
            debitAmount: new Decimal(500),
            creditAmount: new Decimal(0),
            description: 'Cash 2',
          },
          {
            accountId: 'acc-003',
            accountCode: '3000',
            accountName: 'Revenue',
            debitAmount: new Decimal(0),
            creditAmount: new Decimal(1000),
            description: 'Revenue',
          },
        ],
      };

      queryRunner.manager.save.mockResolvedValue(multiLineData);

      const result = await service.createJournalEntry(multiLineData, 'user-123');

      expect(result.entries).toHaveLength(3);
      expect(result.totalDebit.toNumber()).toBe(1000);
      expect(result.totalCredit.toNumber()).toBe(1000);
    });

    it('should set default values when optional fields are missing', async () => {
      const minimalData = {
        entries: [
          {
            accountId: 'acc-001',
            accountCode: '1000',
            accountName: 'Cash',
            debitAmount: new Decimal(100),
            creditAmount: new Decimal(0),
            description: 'Debit',
          },
          {
            accountId: 'acc-002',
            accountCode: '3000',
            accountName: 'Revenue',
            debitAmount: new Decimal(0),
            creditAmount: new Decimal(100),
            description: 'Credit',
          },
        ],
      };

      queryRunner.manager.save.mockResolvedValue(minimalData);

      const result = await service.createJournalEntry(minimalData, 'user-123');

      expect(result.description).toBe('');
      expect(result.reference).toBe('');
      expect(result.source).toBe('manual');
      expect(result.entityId).toBe('default');
      expect(result.currencyCode).toBe('USD');
      expect(result.status).toBe('draft');
    });

    it('should create audit trail entry on creation', async () => {
      queryRunner.manager.save.mockResolvedValue(validJournalData);

      const result = await service.createJournalEntry(validJournalData, 'user-123');

      expect(result.auditTrail).toBeDefined();
      expect(result.auditTrail).toHaveLength(1);
      expect(result.auditTrail[0].action).toBe('created');
      expect(result.auditTrail[0].performedBy).toBe('user-123');
      expect(result.auditTrail[0].changes).toEqual({ status: 'draft' });
    });
  });

  // ============================================================================
  // POST JOURNAL ENTRY TESTS
  // ============================================================================

  describe('postJournalEntry', () => {
    const draftJournalEntry = {
      journalId: 'journal-123',
      journalNumber: 'JE-001',
      status: 'draft',
      totalDebit: new Decimal(1000),
      totalCredit: new Decimal(1000),
      entries: [
        {
          entryId: 'entry-001',
          accountId: 'acc-001',
          debitAmount: new Decimal(1000),
          creditAmount: new Decimal(0),
        },
        {
          entryId: 'entry-002',
          accountId: 'acc-002',
          debitAmount: new Decimal(0),
          creditAmount: new Decimal(1000),
        },
      ],
      auditTrail: [],
    };

    beforeEach(() => {
      jest.spyOn(service, 'getJournalEntry').mockResolvedValue(draftJournalEntry as any);
      jest.spyOn(service as any, 'updateAccountBalance').mockResolvedValue(undefined);
    });

    it('should post a draft journal entry successfully', async () => {
      const userId = 'user-123';
      queryRunner.manager.save.mockResolvedValue({ ...draftJournalEntry, status: 'posted' });

      const result = await service.postJournalEntry('journal-123', userId);

      expect(result.status).toBe('posted');
      expect(result.postedBy).toBe(userId);
      expect(result.postedAt).toBeDefined();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'journal.entry.posted',
        expect.objectContaining({
          journalId: 'journal-123',
          userId,
        })
      );
    });

    it('should update account balances when posting', async () => {
      const updateAccountBalanceSpy = jest.spyOn(service as any, 'updateAccountBalance');

      await service.postJournalEntry('journal-123', 'user-123');

      expect(updateAccountBalanceSpy).toHaveBeenCalledTimes(2);
      expect(updateAccountBalanceSpy).toHaveBeenCalledWith(
        draftJournalEntry.entries[0],
        queryRunner
      );
      expect(updateAccountBalanceSpy).toHaveBeenCalledWith(
        draftJournalEntry.entries[1],
        queryRunner
      );
    });

    it('should throw NotFoundException when journal entry does not exist', async () => {
      jest.spyOn(service, 'getJournalEntry').mockResolvedValue(null);

      await expect(
        service.postJournalEntry('invalid-id', 'user-123')
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.postJournalEntry('invalid-id', 'user-123')
      ).rejects.toThrow('Journal entry not found');
    });

    it('should reject posting of already posted entries', async () => {
      const postedEntry = { ...draftJournalEntry, status: 'posted' };
      jest.spyOn(service, 'getJournalEntry').mockResolvedValue(postedEntry as any);

      await expect(
        service.postJournalEntry('journal-123', 'user-123')
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.postJournalEntry('journal-123', 'user-123')
      ).rejects.toThrow('Only draft journal entries can be posted');
    });

    it('should rollback on posting failure', async () => {
      jest.spyOn(service as any, 'updateAccountBalance').mockRejectedValue(
        new Error('Balance update failed')
      );

      await expect(
        service.postJournalEntry('journal-123', 'user-123')
      ).rejects.toThrow(InternalServerErrorException);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('should add audit trail entry on posting', async () => {
      queryRunner.manager.save.mockResolvedValue({
        ...draftJournalEntry,
        status: 'posted',
        auditTrail: [
          {
            auditId: 'audit-001',
            action: 'posted',
            performedBy: 'user-123',
            timestamp: expect.any(String),
            changes: { status: 'posted' },
          },
        ],
      });

      const result = await service.postJournalEntry('journal-123', 'user-123');

      expect(result.auditTrail).toBeDefined();
      const postingAudit = result.auditTrail.find((a: any) => a.action === 'posted');
      expect(postingAudit).toBeDefined();
      expect(postingAudit.performedBy).toBe('user-123');
    });
  });

  // ============================================================================
  // CHART OF ACCOUNTS TESTS
  // ============================================================================

  describe('createAccount', () => {
    const validAccountData = {
      accountCode: '1000',
      accountName: 'Cash',
      accountType: 'asset' as const,
      subType: 'current-asset',
      category: 'liquid-assets',
      description: 'Cash on hand',
      openingBalance: 0,
      currencyCode: 'USD',
      metadata: {},
    };

    beforeEach(() => {
      jest.spyOn(service as any, 'generateAccountCode').mockResolvedValue('1000');
      jest.spyOn(service as any, 'calculateAccountLevel').mockResolvedValue(1);
      jest.spyOn(service as any, 'findAccountByCode').mockResolvedValue(null);
    });

    it('should create a new account successfully', async () => {
      const userId = 'user-123';
      dataSource.manager.save.mockResolvedValue(validAccountData);

      const result = await service.createAccount(validAccountData, userId);

      expect(result).toBeDefined();
      expect(result.accountId).toBeDefined();
      expect(result.accountCode).toBe('1000');
      expect(result.accountName).toBe('Cash');
      expect(result.accountType).toBe('asset');
      expect(result.isActive).toBe(true);
      expect(result.currentBalance.toNumber()).toBe(0);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'account.created',
        expect.objectContaining({
          accountId: expect.any(String),
          accountCode: '1000',
          accountType: 'asset',
          userId,
        })
      );
    });

    it('should reject duplicate account codes', async () => {
      jest.spyOn(service as any, 'findAccountByCode').mockResolvedValue({
        accountId: 'existing-001',
        accountCode: '1000',
      });

      await expect(
        service.createAccount(validAccountData, 'user-123')
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.createAccount(validAccountData, 'user-123')
      ).rejects.toThrow('Account code already exists');
    });

    it('should determine normal balance based on account type', async () => {
      dataSource.manager.save.mockResolvedValue(validAccountData);

      const assetAccount = await service.createAccount(
        { ...validAccountData, accountType: 'asset' },
        'user-123'
      );
      expect(assetAccount.normalBalance).toBe('debit');

      const liabilityAccount = await service.createAccount(
        { ...validAccountData, accountType: 'liability' },
        'user-123'
      );
      expect(liabilityAccount.normalBalance).toBe('credit');

      const revenueAccount = await service.createAccount(
        { ...validAccountData, accountType: 'revenue' },
        'user-123'
      );
      expect(revenueAccount.normalBalance).toBe('credit');

      const expenseAccount = await service.createAccount(
        { ...validAccountData, accountType: 'expense' },
        'user-123'
      );
      expect(expenseAccount.normalBalance).toBe('debit');
    });

    it('should set default values for optional fields', async () => {
      const minimalData = {
        accountName: 'Test Account',
      };

      dataSource.manager.save.mockResolvedValue(minimalData);

      const result = await service.createAccount(minimalData, 'user-123');

      expect(result.accountType).toBe('asset');
      expect(result.isActive).toBe(true);
      expect(result.isSystem).toBe(false);
      expect(result.allowPosting).toBe(true);
      expect(result.currencyCode).toBe('USD');
    });

    it('should handle opening balance correctly', async () => {
      const accountWithBalance = {
        ...validAccountData,
        openingBalance: 5000,
      };

      dataSource.manager.save.mockResolvedValue(accountWithBalance);

      const result = await service.createAccount(accountWithBalance, 'user-123');

      expect(result.openingBalance.toNumber()).toBe(5000);
      expect(result.currentBalance.toNumber()).toBe(5000);
    });
  });

  describe('getChartOfAccounts', () => {
    it('should retrieve all accounts when no entityId provided', async () => {
      const mockAccounts = [
        {
          accountId: 'acc-001',
          accountCode: '1000',
          accountName: 'Cash',
          accountType: 'asset',
        },
        {
          accountId: 'acc-002',
          accountCode: '2000',
          accountName: 'Accounts Payable',
          accountType: 'liability',
        },
      ];

      dataSource.manager.find.mockResolvedValue(mockAccounts);

      const result = await service.getChartOfAccounts();

      expect(result).toHaveLength(2);
      expect(result[0].accountCode).toBe('1000');
      expect(result[1].accountCode).toBe('2000');
    });

    it('should filter accounts by entityId when provided', async () => {
      const mockAccounts = [
        {
          accountId: 'acc-001',
          accountCode: '1000',
          accountName: 'Cash',
          entityId: 'entity-123',
        },
      ];

      dataSource.manager.find.mockResolvedValue(mockAccounts);

      const result = await service.getChartOfAccounts('entity-123');

      expect(result).toHaveLength(1);
      expect(result[0].entityId).toBe('entity-123');
      expect(dataSource.manager.find).toHaveBeenCalledWith(
        'chart_of_accounts',
        expect.objectContaining({
          where: { entityId: 'entity-123' },
        })
      );
    });

    it('should return empty array when no accounts found', async () => {
      dataSource.manager.find.mockResolvedValue([]);

      const result = await service.getChartOfAccounts();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle database errors gracefully', async () => {
      dataSource.manager.find.mockRejectedValue(new Error('Database error'));

      await expect(service.getChartOfAccounts()).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });

  // ============================================================================
  // TRIAL BALANCE TESTS
  // ============================================================================

  describe('generateTrialBalance', () => {
    const mockAccounts = [
      {
        accountId: 'acc-001',
        accountCode: '1000',
        accountName: 'Cash',
        accountType: 'asset',
        normalBalance: 'debit' as const,
        openingBalance: new Decimal(0),
      },
      {
        accountId: 'acc-002',
        accountCode: '2000',
        accountName: 'Accounts Payable',
        accountType: 'liability',
        normalBalance: 'credit' as const,
        openingBalance: new Decimal(0),
      },
    ];

    beforeEach(() => {
      jest.spyOn(service as any, 'getAccountBalances').mockResolvedValue(mockAccounts);
      jest.spyOn(service as any, 'calculateAccountBalance').mockResolvedValue(new Decimal(1000));
      jest.spyOn(service as any, 'getPeriodDebits').mockResolvedValue(new Decimal(1000));
      jest.spyOn(service as any, 'getPeriodCredits').mockResolvedValue(new Decimal(0));
      jest.spyOn(service as any, 'getFiscalPeriod').mockResolvedValue('2026-01');
      jest.spyOn(service as any, 'getFiscalYear').mockResolvedValue(2026);
      jest.spyOn(service as any, 'isDebitBalance').mockReturnValue(true);
    });

    it('should generate trial balance successfully', async () => {
      const result = await service.generateTrialBalance(
        '2026-01-31',
        'entity-123',
        'user-123'
      );

      expect(result).toBeDefined();
      expect(result.reportId).toBeDefined();
      expect(result.asOfDate).toBe('2026-01-31');
      expect(result.entityId).toBe('entity-123');
      expect(result.fiscalPeriod).toBe('2026-01');
      expect(result.fiscalYear).toBe(2026);
      expect(result.accounts).toHaveLength(2);
    });

    it('should calculate totals correctly', async () => {
      const result = await service.generateTrialBalance(
        '2026-01-31',
        'entity-123',
        'user-123'
      );

      expect(result.totals).toBeDefined();
      expect(result.totals.totalDebits).toBeInstanceOf(Decimal);
      expect(result.totals.totalCredits).toBeInstanceOf(Decimal);
      expect(result.totals.accountsCount).toBe(2);
    });

    it('should identify balanced trial balance', async () => {
      jest.spyOn(service as any, 'isDebitBalance').mockReturnValueOnce(true).mockReturnValueOnce(false);
      jest.spyOn(service as any, 'calculateAccountBalance')
        .mockResolvedValueOnce(new Decimal(1000))
        .mockResolvedValueOnce(new Decimal(1000));

      const result = await service.generateTrialBalance(
        '2026-01-31',
        'entity-123',
        'user-123'
      );

      expect(result.isBalanced).toBe(true);
      expect(result.variance.abs().toNumber()).toBeLessThan(0.01);
    });

    it('should identify unbalanced trial balance', async () => {
      jest.spyOn(service as any, 'isDebitBalance').mockReturnValueOnce(true).mockReturnValueOnce(false);
      jest.spyOn(service as any, 'calculateAccountBalance')
        .mockResolvedValueOnce(new Decimal(1000))
        .mockResolvedValueOnce(new Decimal(500)); // Unbalanced

      const result = await service.generateTrialBalance(
        '2026-01-31',
        'entity-123',
        'user-123'
      );

      expect(result.isBalanced).toBe(false);
      expect(result.variance.toNumber()).not.toBe(0);
    });

    it('should handle empty chart of accounts', async () => {
      jest.spyOn(service as any, 'getAccountBalances').mockResolvedValue([]);

      const result = await service.generateTrialBalance(
        '2026-01-31',
        'entity-123',
        'user-123'
      );

      expect(result.accounts).toHaveLength(0);
      expect(result.totals.totalDebits.toNumber()).toBe(0);
      expect(result.totals.totalCredits.toNumber()).toBe(0);
      expect(result.isBalanced).toBe(true);
    });
  });

  // ============================================================================
  // HELPER METHOD TESTS
  // ============================================================================

  describe('Helper Methods', () => {
    describe('determineNormalBalance', () => {
      it('should return debit for asset accounts', () => {
        const result = (service as any).determineNormalBalance('asset');
        expect(result).toBe('debit');
      });

      it('should return credit for liability accounts', () => {
        const result = (service as any).determineNormalBalance('liability');
        expect(result).toBe('credit');
      });

      it('should return credit for equity accounts', () => {
        const result = (service as any).determineNormalBalance('equity');
        expect(result).toBe('credit');
      });

      it('should return credit for revenue accounts', () => {
        const result = (service as any).determineNormalBalance('revenue');
        expect(result).toBe('credit');
      });

      it('should return debit for expense accounts', () => {
        const result = (service as any).determineNormalBalance('expense');
        expect(result).toBe('debit');
      });
    });
  });
});
