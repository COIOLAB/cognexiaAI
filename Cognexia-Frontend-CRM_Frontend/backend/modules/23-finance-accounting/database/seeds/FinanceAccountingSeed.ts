/**
 * Finance & Accounting Module Seed Data
 * 
 * Provides comprehensive test data for development and testing,
 * including complete chart of accounts, sample transactions,
 * and realistic financial scenarios.
 * 
 * @version 1.0.0
 * @author Industry 5.0 ERP Team
 */

import { DataSource } from 'typeorm';
import { ChartOfAccounts } from '../../src/entities/chart-of-accounts.entity';
import { JournalEntry } from '../../src/entities/journal-entry.entity';
import { JournalLine } from '../../src/entities/journal-line.entity';
import { PostingRule } from '../../src/entities/posting-rule.entity';
import { AccountBalance } from '../../src/entities/account-balance.entity';
import { TrialBalance } from '../../src/entities/trial-balance.entity';
import { PaymentTransaction } from '../../src/entities/payment-transaction.entity';

export class FinanceAccountingSeed {
  private dataSource: DataSource;
  private testUserId = '123e4567-e89b-12d3-a456-426614174000'; // Test user ID
  private testCompanyId = '123e4567-e89b-12d3-a456-426614174001'; // Test company ID
  private testPeriodId = '123e4567-e89b-12d3-a456-426614174002'; // Test period ID

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  async run(): Promise<void> {
    console.log('🌱 Starting Finance & Accounting Seed Data...');

    try {
      // First, create financial periods
      await this.createFinancialPeriods();

      // Create Chart of Accounts
      const accounts = await this.createChartOfAccounts();

      // Create Posting Rules
      await this.createPostingRules();

      // Create Sample Journal Entries
      await this.createSampleJournalEntries(accounts);

      // Create Payment Transactions
      await this.createPaymentTransactions(accounts);

      // Generate Account Balances
      await this.generateAccountBalances(accounts);

      // Generate Trial Balance
      await this.generateTrialBalance(accounts);

      console.log('✅ Finance & Accounting Seed Data completed successfully!');
    } catch (error) {
      console.error('❌ Seed Data failed:', error);
      throw error;
    }
  }

  private async createFinancialPeriods(): Promise<void> {
    console.log('📅 Creating Financial Periods...');

    const periodsData = [
      {
        id: this.testPeriodId,
        periodCode: '2024-01',
        periodName: 'January 2024',
        periodType: 'MONTH',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        fiscalYear: 2024,
        isActive: true,
        isClosed: false,
        companyId: this.testCompanyId,
        createdBy: this.testUserId,
        updatedBy: this.testUserId,
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174003',
        periodCode: '2024-02',
        periodName: 'February 2024',
        periodType: 'MONTH',
        startDate: '2024-02-01',
        endDate: '2024-02-29',
        fiscalYear: 2024,
        isActive: true,
        isClosed: false,
        companyId: this.testCompanyId,
        createdBy: this.testUserId,
        updatedBy: this.testUserId,
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174004',
        periodCode: '2024-Q1',
        periodName: 'Q1 2024',
        periodType: 'QUARTER',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        fiscalYear: 2024,
        isActive: true,
        isClosed: false,
        companyId: this.testCompanyId,
        createdBy: this.testUserId,
        updatedBy: this.testUserId,
      },
    ];

    await this.dataSource.query(`
      INSERT INTO financial_periods (
        id, "periodCode", "periodName", "periodType", "startDate", "endDate",
        "fiscalYear", "isActive", "isClosed", "companyId", "createdBy", "updatedBy"
      ) VALUES 
      ${periodsData.map(p => `(
        '${p.id}', '${p.periodCode}', '${p.periodName}', '${p.periodType}',
        '${p.startDate}', '${p.endDate}', ${p.fiscalYear}, ${p.isActive}, 
        ${p.isClosed}, '${p.companyId}', '${p.createdBy}', '${p.updatedBy}'
      )`).join(', ')}
    `);
  }

  private async createChartOfAccounts(): Promise<ChartOfAccounts[]> {
    console.log('📊 Creating Chart of Accounts...');

    const accountsData = [
      // ASSETS
      { code: '1000', name: 'ASSETS', type: 'ASSET', subtype: 'CURRENT_ASSET', level: 1, normalBalance: 'DEBIT' },
      { code: '1100', name: 'Current Assets', type: 'ASSET', subtype: 'CURRENT_ASSET', parent: '1000', level: 2, normalBalance: 'DEBIT' },
      { code: '1110', name: 'Cash and Cash Equivalents', type: 'ASSET', subtype: 'CURRENT_ASSET', parent: '1100', level: 3, normalBalance: 'DEBIT', reconcilable: true },
      { code: '1111', name: 'Petty Cash', type: 'ASSET', subtype: 'CURRENT_ASSET', parent: '1110', level: 4, normalBalance: 'DEBIT' },
      { code: '1112', name: 'Checking Account - Main', type: 'ASSET', subtype: 'CURRENT_ASSET', parent: '1110', level: 4, normalBalance: 'DEBIT', reconcilable: true },
      { code: '1113', name: 'Savings Account', type: 'ASSET', subtype: 'CURRENT_ASSET', parent: '1110', level: 4, normalBalance: 'DEBIT', reconcilable: true },
      { code: '1120', name: 'Accounts Receivable', type: 'ASSET', subtype: 'CURRENT_ASSET', parent: '1100', level: 3, normalBalance: 'DEBIT' },
      { code: '1121', name: 'Trade Receivables', type: 'ASSET', subtype: 'CURRENT_ASSET', parent: '1120', level: 4, normalBalance: 'DEBIT' },
      { code: '1125', name: 'Allowance for Doubtful Accounts', type: 'ASSET', subtype: 'CURRENT_ASSET', parent: '1120', level: 4, normalBalance: 'CREDIT' },
      { code: '1130', name: 'Inventory', type: 'ASSET', subtype: 'CURRENT_ASSET', parent: '1100', level: 3, normalBalance: 'DEBIT' },
      { code: '1131', name: 'Raw Materials', type: 'ASSET', subtype: 'CURRENT_ASSET', parent: '1130', level: 4, normalBalance: 'DEBIT' },
      { code: '1132', name: 'Work in Process', type: 'ASSET', subtype: 'CURRENT_ASSET', parent: '1130', level: 4, normalBalance: 'DEBIT' },
      { code: '1133', name: 'Finished Goods', type: 'ASSET', subtype: 'CURRENT_ASSET', parent: '1130', level: 4, normalBalance: 'DEBIT' },
      { code: '1140', name: 'Prepaid Expenses', type: 'ASSET', subtype: 'CURRENT_ASSET', parent: '1100', level: 3, normalBalance: 'DEBIT' },
      
      // Fixed Assets
      { code: '1200', name: 'Fixed Assets', type: 'ASSET', subtype: 'FIXED_ASSET', parent: '1000', level: 2, normalBalance: 'DEBIT' },
      { code: '1210', name: 'Property, Plant & Equipment', type: 'ASSET', subtype: 'FIXED_ASSET', parent: '1200', level: 3, normalBalance: 'DEBIT' },
      { code: '1211', name: 'Land', type: 'ASSET', subtype: 'FIXED_ASSET', parent: '1210', level: 4, normalBalance: 'DEBIT' },
      { code: '1212', name: 'Buildings', type: 'ASSET', subtype: 'FIXED_ASSET', parent: '1210', level: 4, normalBalance: 'DEBIT' },
      { code: '1213', name: 'Equipment', type: 'ASSET', subtype: 'FIXED_ASSET', parent: '1210', level: 4, normalBalance: 'DEBIT' },
      { code: '1220', name: 'Accumulated Depreciation', type: 'ASSET', subtype: 'FIXED_ASSET', parent: '1200', level: 3, normalBalance: 'CREDIT' },
      
      // LIABILITIES
      { code: '2000', name: 'LIABILITIES', type: 'LIABILITY', subtype: 'CURRENT_LIABILITY', level: 1, normalBalance: 'CREDIT' },
      { code: '2100', name: 'Current Liabilities', type: 'LIABILITY', subtype: 'CURRENT_LIABILITY', parent: '2000', level: 2, normalBalance: 'CREDIT' },
      { code: '2110', name: 'Accounts Payable', type: 'LIABILITY', subtype: 'CURRENT_LIABILITY', parent: '2100', level: 3, normalBalance: 'CREDIT' },
      { code: '2111', name: 'Trade Payables', type: 'LIABILITY', subtype: 'CURRENT_LIABILITY', parent: '2110', level: 4, normalBalance: 'CREDIT' },
      { code: '2120', name: 'Accrued Liabilities', type: 'LIABILITY', subtype: 'CURRENT_LIABILITY', parent: '2100', level: 3, normalBalance: 'CREDIT' },
      { code: '2121', name: 'Accrued Wages', type: 'LIABILITY', subtype: 'CURRENT_LIABILITY', parent: '2120', level: 4, normalBalance: 'CREDIT' },
      { code: '2122', name: 'Accrued Taxes', type: 'LIABILITY', subtype: 'CURRENT_LIABILITY', parent: '2120', level: 4, normalBalance: 'CREDIT', taxRelevant: true },
      { code: '2130', name: 'Short-term Debt', type: 'LIABILITY', subtype: 'CURRENT_LIABILITY', parent: '2100', level: 3, normalBalance: 'CREDIT' },
      
      // Long-term Liabilities
      { code: '2200', name: 'Long-term Liabilities', type: 'LIABILITY', subtype: 'LONG_TERM_LIABILITY', parent: '2000', level: 2, normalBalance: 'CREDIT' },
      { code: '2210', name: 'Long-term Debt', type: 'LIABILITY', subtype: 'LONG_TERM_LIABILITY', parent: '2200', level: 3, normalBalance: 'CREDIT' },
      
      // EQUITY
      { code: '3000', name: 'EQUITY', type: 'EQUITY', subtype: 'OWNERS_EQUITY', level: 1, normalBalance: 'CREDIT' },
      { code: '3100', name: 'Owners Equity', type: 'EQUITY', subtype: 'OWNERS_EQUITY', parent: '3000', level: 2, normalBalance: 'CREDIT' },
      { code: '3110', name: 'Common Stock', type: 'EQUITY', subtype: 'OWNERS_EQUITY', parent: '3100', level: 3, normalBalance: 'CREDIT' },
      { code: '3120', name: 'Retained Earnings', type: 'EQUITY', subtype: 'RETAINED_EARNINGS', parent: '3100', level: 3, normalBalance: 'CREDIT', isSystemAccount: true },
      
      // REVENUE
      { code: '4000', name: 'REVENUE', type: 'REVENUE', subtype: 'OPERATING_REVENUE', level: 1, normalBalance: 'CREDIT' },
      { code: '4100', name: 'Operating Revenue', type: 'REVENUE', subtype: 'OPERATING_REVENUE', parent: '4000', level: 2, normalBalance: 'CREDIT' },
      { code: '4110', name: 'Sales Revenue', type: 'REVENUE', subtype: 'OPERATING_REVENUE', parent: '4100', level: 3, normalBalance: 'CREDIT' },
      { code: '4111', name: 'Product Sales', type: 'REVENUE', subtype: 'OPERATING_REVENUE', parent: '4110', level: 4, normalBalance: 'CREDIT' },
      { code: '4112', name: 'Service Revenue', type: 'REVENUE', subtype: 'OPERATING_REVENUE', parent: '4110', level: 4, normalBalance: 'CREDIT' },
      { code: '4200', name: 'Other Revenue', type: 'REVENUE', subtype: 'NON_OPERATING_REVENUE', parent: '4000', level: 2, normalBalance: 'CREDIT' },
      { code: '4210', name: 'Interest Income', type: 'REVENUE', subtype: 'NON_OPERATING_REVENUE', parent: '4200', level: 3, normalBalance: 'CREDIT' },
      
      // EXPENSES
      { code: '5000', name: 'EXPENSES', type: 'EXPENSE', subtype: 'OPERATING_EXPENSE', level: 1, normalBalance: 'DEBIT' },
      { code: '5100', name: 'Cost of Goods Sold', type: 'EXPENSE', subtype: 'COST_OF_GOODS_SOLD', parent: '5000', level: 2, normalBalance: 'DEBIT' },
      { code: '5110', name: 'Material Costs', type: 'EXPENSE', subtype: 'COST_OF_GOODS_SOLD', parent: '5100', level: 3, normalBalance: 'DEBIT' },
      { code: '5120', name: 'Labor Costs', type: 'EXPENSE', subtype: 'COST_OF_GOODS_SOLD', parent: '5100', level: 3, normalBalance: 'DEBIT' },
      { code: '5200', name: 'Operating Expenses', type: 'EXPENSE', subtype: 'OPERATING_EXPENSE', parent: '5000', level: 2, normalBalance: 'DEBIT' },
      { code: '5210', name: 'Salaries and Wages', type: 'EXPENSE', subtype: 'OPERATING_EXPENSE', parent: '5200', level: 3, normalBalance: 'DEBIT' },
      { code: '5220', name: 'Rent Expense', type: 'EXPENSE', subtype: 'OPERATING_EXPENSE', parent: '5200', level: 3, normalBalance: 'DEBIT' },
      { code: '5230', name: 'Utilities Expense', type: 'EXPENSE', subtype: 'OPERATING_EXPENSE', parent: '5200', level: 3, normalBalance: 'DEBIT' },
      { code: '5240', name: 'Depreciation Expense', type: 'EXPENSE', subtype: 'OPERATING_EXPENSE', parent: '5200', level: 3, normalBalance: 'DEBIT' },
      { code: '5250', name: 'Office Supplies', type: 'EXPENSE', subtype: 'OPERATING_EXPENSE', parent: '5200', level: 3, normalBalance: 'DEBIT' },
    ];

    const accounts: ChartOfAccounts[] = [];
    const accountMap = new Map<string, ChartOfAccounts>();

    // Create accounts in order to handle parent relationships
    for (const accountData of accountsData) {
      const account = new ChartOfAccounts();
      account.accountCode = accountData.code;
      account.accountName = accountData.name;
      account.accountType = accountData.type as any;
      account.accountSubtype = accountData.subtype as any;
      account.level = accountData.level;
      account.normalBalance = accountData.normalBalance as any;
      account.isActive = true;
      account.isSystemAccount = accountData.isSystemAccount || false;
      account.reconcilable = accountData.reconcilable || false;
      account.taxRelevant = accountData.taxRelevant || false;
      account.allowManualJournalEntries = true;
      account.currencyCode = 'USD';
      account.companyId = this.testCompanyId;
      account.createdBy = this.testUserId;
      account.updatedBy = this.testUserId;
      account.path = accountData.code;

      // Set parent if specified
      if (accountData.parent) {
        const parent = accountMap.get(accountData.parent);
        if (parent) {
          account.parentAccount = parent;
          account.path = `${parent.path} > ${account.accountCode}`;
        }
      }

      const savedAccount = await this.dataSource.getRepository(ChartOfAccounts).save(account);
      accounts.push(savedAccount);
      accountMap.set(accountData.code, savedAccount);
    }

    console.log(`✅ Created ${accounts.length} accounts`);
    return accounts;
  }

  private async createPostingRules(): Promise<void> {
    console.log('📋 Creating Posting Rules...');

    const rulesData = [
      {
        ruleCode: 'SALE_001',
        ruleName: 'Sales Transaction - Cash',
        description: 'Standard sales transaction paid in cash',
        sourceSystem: 'SALES',
        transactionType: 'CASH_SALE',
        debitAccountTemplate: '1112', // Cash
        creditAccountTemplate: '4111', // Product Sales
        conditions: { paymentMethod: 'CASH' },
        validFrom: '2024-01-01',
      },
      {
        ruleCode: 'SALE_002',
        ruleName: 'Sales Transaction - Credit',
        description: 'Sales transaction on credit',
        sourceSystem: 'SALES',
        transactionType: 'CREDIT_SALE',
        debitAccountTemplate: '1121', // Trade Receivables
        creditAccountTemplate: '4111', // Product Sales
        conditions: { paymentMethod: 'CREDIT' },
        validFrom: '2024-01-01',
      },
      {
        ruleCode: 'PURCH_001',
        ruleName: 'Purchase - Cash',
        description: 'Cash purchase transaction',
        sourceSystem: 'PURCHASING',
        transactionType: 'CASH_PURCHASE',
        debitAccountTemplate: '5110', // Material Costs
        creditAccountTemplate: '1112', // Cash
        conditions: { paymentMethod: 'CASH' },
        validFrom: '2024-01-01',
      },
      {
        ruleCode: 'PAY_001',
        ruleName: 'Payroll Processing',
        description: 'Employee payroll payment',
        sourceSystem: 'PAYROLL',
        transactionType: 'PAYROLL',
        debitAccountTemplate: '5210', // Salaries and Wages
        creditAccountTemplate: '1112', // Cash
        conditions: { type: 'PAYROLL' },
        validFrom: '2024-01-01',
      },
    ];

    for (const ruleData of rulesData) {
      const rule = new PostingRule();
      rule.ruleCode = ruleData.ruleCode;
      rule.ruleName = ruleData.ruleName;
      rule.description = ruleData.description;
      rule.sourceSystem = ruleData.sourceSystem;
      rule.transactionType = ruleData.transactionType;
      rule.debitAccountTemplate = ruleData.debitAccountTemplate;
      rule.creditAccountTemplate = ruleData.creditAccountTemplate;
      rule.conditions = ruleData.conditions;
      rule.validFrom = new Date(ruleData.validFrom);
      rule.isActive = true;
      rule.priority = 100;
      rule.companyId = this.testCompanyId;
      rule.createdBy = this.testUserId;
      rule.updatedBy = this.testUserId;

      await this.dataSource.getRepository(PostingRule).save(rule);
    }

    console.log(`✅ Created ${rulesData.length} posting rules`);
  }

  private async createSampleJournalEntries(accounts: ChartOfAccounts[]): Promise<void> {
    console.log('📝 Creating Sample Journal Entries...');

    const accountMap = new Map(accounts.map(acc => [acc.accountCode, acc]));

    const journalEntries = [
      {
        journalNumber: 'JE-2024-001',
        date: '2024-01-02',
        description: 'Initial cash investment by owner',
        lines: [
          { accountCode: '1112', debit: 50000, credit: 0, description: 'Cash investment' },
          { accountCode: '3110', debit: 0, credit: 50000, description: 'Common stock issued' },
        ],
      },
      {
        journalNumber: 'JE-2024-002',
        date: '2024-01-03',
        description: 'Purchase of equipment',
        lines: [
          { accountCode: '1213', debit: 15000, credit: 0, description: 'Office equipment' },
          { accountCode: '1112', debit: 0, credit: 15000, description: 'Cash payment' },
        ],
      },
      {
        journalNumber: 'JE-2024-003',
        date: '2024-01-05',
        description: 'Sales transaction - cash',
        lines: [
          { accountCode: '1112', debit: 2500, credit: 0, description: 'Cash received from sales' },
          { accountCode: '4111', debit: 0, credit: 2500, description: 'Product sales revenue' },
        ],
      },
      {
        journalNumber: 'JE-2024-004',
        date: '2024-01-07',
        description: 'Purchase of inventory on credit',
        lines: [
          { accountCode: '1131', debit: 8000, credit: 0, description: 'Raw materials purchased' },
          { accountCode: '2111', debit: 0, credit: 8000, description: 'Trade payables' },
        ],
      },
      {
        journalNumber: 'JE-2024-005',
        date: '2024-01-10',
        description: 'Payroll expenses',
        lines: [
          { accountCode: '5210', debit: 3000, credit: 0, description: 'Salaries expense' },
          { accountCode: '2121', debit: 0, credit: 500, description: 'Accrued payroll taxes' },
          { accountCode: '1112', debit: 0, credit: 2500, description: 'Cash paid to employees' },
        ],
      },
      {
        journalNumber: 'JE-2024-006',
        date: '2024-01-15',
        description: 'Office rent payment',
        lines: [
          { accountCode: '5220', debit: 1200, credit: 0, description: 'Monthly office rent' },
          { accountCode: '1112', debit: 0, credit: 1200, description: 'Cash payment' },
        ],
      },
      {
        journalNumber: 'JE-2024-007',
        date: '2024-01-20',
        description: 'Sales on credit',
        lines: [
          { accountCode: '1121', debit: 4500, credit: 0, description: 'Trade receivables' },
          { accountCode: '4111', debit: 0, credit: 4500, description: 'Product sales revenue' },
        ],
      },
    ];

    for (let i = 0; i < journalEntries.length; i++) {
      const entryData = journalEntries[i];
      
      const journalEntry = new JournalEntry();
      journalEntry.journalNumber = entryData.journalNumber;
      journalEntry.date = new Date(entryData.date);
      journalEntry.description = entryData.description;
      journalEntry.status = 'POSTED';
      journalEntry.sourceLedger = 'GENERAL';
      journalEntry.periodId = this.testPeriodId;
      journalEntry.companyId = this.testCompanyId;
      journalEntry.currencyCode = 'USD';
      journalEntry.exchangeRate = 1.0;
      journalEntry.isBalanced = true;
      journalEntry.complianceChecked = true;
      journalEntry.complianceStatus = 'APPROVED';
      journalEntry.aiValidationStatus = 'APPROVED';
      journalEntry.aiValidationScore = 0.95;
      journalEntry.createdBy = this.testUserId;
      journalEntry.updatedBy = this.testUserId;
      journalEntry.postedAt = new Date();
      journalEntry.postedBy = this.testUserId;

      // Calculate totals
      let totalDebit = 0;
      let totalCredit = 0;
      entryData.lines.forEach(line => {
        totalDebit += line.debit;
        totalCredit += line.credit;
      });
      
      journalEntry.totalDebit = totalDebit;
      journalEntry.totalCredit = totalCredit;

      const savedEntry = await this.dataSource.getRepository(JournalEntry).save(journalEntry);

      // Create journal lines
      for (let j = 0; j < entryData.lines.length; j++) {
        const lineData = entryData.lines[j];
        const account = accountMap.get(lineData.accountCode);
        
        if (account) {
          const journalLine = new JournalLine();
          journalLine.journalEntry = savedEntry;
          journalLine.account = account;
          journalLine.lineNumber = j + 1;
          journalLine.description = lineData.description;
          journalLine.debitAmount = lineData.debit;
          journalLine.creditAmount = lineData.credit;
          journalLine.functionalDebitAmount = lineData.debit;
          journalLine.functionalCreditAmount = lineData.credit;
          journalLine.currencyCode = 'USD';
          journalLine.exchangeRate = 1.0;
          journalLine.createdBy = this.testUserId;
          journalLine.updatedBy = this.testUserId;

          await this.dataSource.getRepository(JournalLine).save(journalLine);
        }
      }
    }

    console.log(`✅ Created ${journalEntries.length} journal entries with lines`);
  }

  private async createPaymentTransactions(accounts: ChartOfAccounts[]): Promise<void> {
    console.log('💳 Creating Payment Transactions...');

    const accountMap = new Map(accounts.map(acc => [acc.accountCode, acc]));
    const cashAccount = accountMap.get('1112'); // Checking Account

    const payments = [
      {
        transactionNumber: 'PAY-2024-001',
        type: 'PAYMENT',
        amount: 15000,
        description: 'Equipment purchase payment',
        paymentMethod: 'BANK_TRANSFER',
        paymentDate: '2024-01-03',
        payeeName: 'Office Equipment Co.',
        payeeType: 'VENDOR',
      },
      {
        transactionNumber: 'REC-2024-001',
        type: 'RECEIPT',
        amount: 2500,
        description: 'Cash sales receipt',
        paymentMethod: 'CASH',
        paymentDate: '2024-01-05',
        payeeName: 'Customer Payment',
        payeeType: 'CUSTOMER',
      },
      {
        transactionNumber: 'PAY-2024-002',
        type: 'PAYMENT',
        amount: 2500,
        description: 'Employee salary payment',
        paymentMethod: 'BANK_TRANSFER',
        paymentDate: '2024-01-10',
        payeeName: 'Employee Payroll',
        payeeType: 'EMPLOYEE',
      },
      {
        transactionNumber: 'PAY-2024-003',
        type: 'PAYMENT',
        amount: 1200,
        description: 'Office rent payment',
        paymentMethod: 'CHECK',
        paymentDate: '2024-01-15',
        payeeName: 'Property Management LLC',
        payeeType: 'VENDOR',
      },
    ];

    for (const paymentData of payments) {
      const payment = new PaymentTransaction();
      payment.transactionNumber = paymentData.transactionNumber;
      payment.type = paymentData.type as any;
      payment.status = 'COMPLETED';
      payment.paymentMethod = paymentData.paymentMethod as any;
      payment.amount = paymentData.amount;
      payment.functionalAmount = paymentData.amount;
      payment.netAmount = paymentData.amount;
      payment.description = paymentData.description;
      payment.paymentDate = new Date(paymentData.paymentDate);
      payment.valueDate = new Date(paymentData.paymentDate);
      payment.payerName = 'Test Company Inc.';
      payment.payeeName = paymentData.payeeName;
      payment.payeeType = paymentData.payeeType as any;
      payment.bankAccountId = cashAccount?.id || this.testUserId;
      payment.companyId = this.testCompanyId;
      payment.currencyCode = 'USD';
      payment.exchangeRate = 1.0;
      payment.reconciliationStatus = 'RECONCILED';
      payment.createdBy = this.testUserId;
      payment.updatedBy = this.testUserId;
      payment.processedAt = new Date();
      payment.processedBy = this.testUserId;

      await this.dataSource.getRepository(PaymentTransaction).save(payment);
    }

    console.log(`✅ Created ${payments.length} payment transactions`);
  }

  private async generateAccountBalances(accounts: ChartOfAccounts[]): Promise<void> {
    console.log('💰 Generating Account Balances...');

    // Calculate balances based on journal entries
    const balanceQuery = `
      SELECT 
        jl."accountId",
        SUM(jl."debitAmount") as total_debits,
        SUM(jl."creditAmount") as total_credits,
        COUNT(*) as transaction_count,
        MAX(je."date") as last_transaction_date
      FROM journal_lines jl
      JOIN journal_entries je ON jl."journalEntryId" = je.id
      WHERE je."status" = 'POSTED' 
      AND je."companyId" = $1
      AND je."periodId" = $2
      GROUP BY jl."accountId"
    `;

    const results = await this.dataSource.query(balanceQuery, [this.testCompanyId, this.testPeriodId]);

    for (const result of results) {
      const account = accounts.find(acc => acc.id === result.accountId);
      if (!account) continue;

      const balance = new AccountBalance();
      balance.account = account;
      balance.periodId = this.testPeriodId;
      balance.openingBalance = 0; // Assuming these are opening balances
      balance.debitMovements = parseFloat(result.total_debits) || 0;
      balance.creditMovements = parseFloat(result.total_credits) || 0;
      
      // Calculate closing balance based on normal balance
      if (account.normalBalance === 'DEBIT') {
        balance.closingBalance = balance.openingBalance + balance.debitMovements - balance.creditMovements;
      } else {
        balance.closingBalance = balance.openingBalance + balance.creditMovements - balance.debitMovements;
      }

      balance.functionalOpeningBalance = balance.openingBalance;
      balance.functionalDebitMovements = balance.debitMovements;
      balance.functionalCreditMovements = balance.creditMovements;
      balance.functionalClosingBalance = balance.closingBalance;
      balance.transactionCount = parseInt(result.transaction_count);
      balance.lastTransactionDate = new Date(result.last_transaction_date);
      balance.companyId = this.testCompanyId;
      balance.currencyCode = 'USD';
      balance.reconciliationStatus = 'RECONCILED';
      balance.createdBy = this.testUserId;
      balance.updatedBy = this.testUserId;

      await this.dataSource.getRepository(AccountBalance).save(balance);
    }

    console.log(`✅ Generated ${results.length} account balances`);
  }

  private async generateTrialBalance(accounts: ChartOfAccounts[]): Promise<void> {
    console.log('📋 Generating Trial Balance...');

    // Get account balances for trial balance
    const balances = await this.dataSource.getRepository(AccountBalance).find({
      where: { 
        periodId: this.testPeriodId,
        companyId: this.testCompanyId 
      },
      relations: ['account'],
    });

    for (const accountBalance of balances) {
      const trialBalance = new TrialBalance();
      trialBalance.periodId = this.testPeriodId;
      trialBalance.account = accountBalance.account;
      trialBalance.accountCode = accountBalance.account.accountCode;
      trialBalance.accountName = accountBalance.account.accountName;
      trialBalance.accountType = accountBalance.account.accountType;
      
      // Set debit or credit balance based on account type and closing balance
      if (accountBalance.closingBalance >= 0) {
        if (accountBalance.account.normalBalance === 'DEBIT') {
          trialBalance.debitBalance = accountBalance.closingBalance;
          trialBalance.creditBalance = 0;
        } else {
          trialBalance.debitBalance = 0;
          trialBalance.creditBalance = accountBalance.closingBalance;
        }
      } else {
        // Negative balance - reverse the normal side
        if (accountBalance.account.normalBalance === 'DEBIT') {
          trialBalance.debitBalance = 0;
          trialBalance.creditBalance = Math.abs(accountBalance.closingBalance);
        } else {
          trialBalance.debitBalance = Math.abs(accountBalance.closingBalance);
          trialBalance.creditBalance = 0;
        }
      }

      trialBalance.functionalDebitBalance = trialBalance.debitBalance;
      trialBalance.functionalCreditBalance = trialBalance.creditBalance;
      trialBalance.movementDebit = accountBalance.debitMovements;
      trialBalance.movementCredit = accountBalance.creditMovements;
      trialBalance.previousPeriodBalance = accountBalance.openingBalance;
      trialBalance.companyId = this.testCompanyId;
      trialBalance.currencyCode = 'USD';
      trialBalance.isAdjusted = false;
      trialBalance.isClosed = false;
      trialBalance.generatedBy = this.testUserId;

      await this.dataSource.getRepository(TrialBalance).save(trialBalance);
    }

    console.log(`✅ Generated trial balance for ${balances.length} accounts`);
  }
}

// Export function for easy usage
export async function runFinanceAccountingSeed(dataSource: DataSource): Promise<void> {
  const seed = new FinanceAccountingSeed(dataSource);
  await seed.run();
}
