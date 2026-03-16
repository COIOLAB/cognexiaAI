/**
 * Financial Accounting Entities
 * 
 * Complete set of TypeORM entities for government-compliant
 * financial accounting system with comprehensive audit trails,
 * AI-powered insights, and regulatory compliance features.
 * 
 * @version 3.0.0
 * @compliance SOX, GAAP, IFRS, SOC2, ISO27001, PCI-DSS
 */

// Core Chart of Accounts
import { ChartOfAccounts } from './chart-of-accounts.entity';
export { ChartOfAccounts };

// Journal Entry System
import { JournalEntry } from './journal-entry.entity';
import { JournalLine } from './journal-line.entity';
export { JournalEntry, JournalLine };

// Posting and Automation Rules
import { PostingRule } from './posting-rule.entity';
export { PostingRule };

// Trial Balance and Reporting
import { TrialBalance } from './trial-balance.entity';
export { TrialBalance };

// Real-time Account Balances
import { AccountBalance } from './account-balance.entity';
export { AccountBalance };

// Payment Transaction Processing
import { PaymentTransaction } from './payment-transaction.entity';
export { PaymentTransaction };

// Entity Collections for TypeORM
export const FINANCIAL_ENTITIES = [
  ChartOfAccounts,
  JournalEntry,
  JournalLine,
  PostingRule,
  TrialBalance,
  AccountBalance,
  PaymentTransaction,
];

// Entity Groups by Domain
export const CORE_ACCOUNTING_ENTITIES = [
  ChartOfAccounts,
  JournalEntry,
  JournalLine,
];

export const AUTOMATION_ENTITIES = [
  PostingRule,
];

export const REPORTING_ENTITIES = [
  TrialBalance,
  AccountBalance,
];

export const PAYMENT_ENTITIES = [
  PaymentTransaction,
];

// Compliance and Audit Entities
export const COMPLIANCE_ENTITIES = [
  ...CORE_ACCOUNTING_ENTITIES,
  ...AUTOMATION_ENTITIES,
  ...REPORTING_ENTITIES,
  ...PAYMENT_ENTITIES,
];

// Entity metadata for dynamic operations
export const ENTITY_METADATA = {
  ChartOfAccounts: {
    tableName: 'chart_of_accounts',
    primaryKey: 'accountCode',
    displayName: 'Chart of Accounts',
    description: 'Hierarchical chart of accounts with dimensional analysis',
    auditRequired: true,
    complianceLevel: 'HIGH',
  },
  JournalEntry: {
    tableName: 'journal_entries',
    primaryKey: 'id',
    displayName: 'Journal Entry',
    description: 'Double-entry bookkeeping journal entries with AI validation',
    auditRequired: true,
    complianceLevel: 'CRITICAL',
  },
  JournalLine: {
    tableName: 'journal_lines',
    primaryKey: 'id',
    displayName: 'Journal Line',
    description: 'Individual journal entry line items with allocations',
    auditRequired: true,
    complianceLevel: 'CRITICAL',
  },
  PostingRule: {
    tableName: 'posting_rules',
    primaryKey: 'id',
    displayName: 'Posting Rule',
    description: 'Automated posting rules with AI-powered validation',
    auditRequired: true,
    complianceLevel: 'HIGH',
  },
  TrialBalance: {
    tableName: 'trial_balances',
    primaryKey: 'id',
    displayName: 'Trial Balance',
    description: 'Periodic trial balance with variance analysis',
    auditRequired: true,
    complianceLevel: 'HIGH',
  },
  AccountBalance: {
    tableName: 'account_balances',
    primaryKey: 'id',
    displayName: 'Account Balance',
    description: 'Real-time account balances with risk monitoring',
    auditRequired: true,
    complianceLevel: 'MEDIUM',
  },
  PaymentTransaction: {
    tableName: 'payment_transactions',
    primaryKey: 'id',
    displayName: 'Payment Transaction',
    description: 'Comprehensive payment processing with fraud detection',
    auditRequired: true,
    complianceLevel: 'CRITICAL',
  },
};

// Compliance mapping
export const COMPLIANCE_REQUIREMENTS = {
  SOX: [
    'ChartOfAccounts',
    'JournalEntry',
    'JournalLine',
    'PostingRule',
    'TrialBalance',
    'AccountBalance',
  ],
  GAAP: [
    'ChartOfAccounts',
    'JournalEntry',
    'JournalLine',
    'TrialBalance',
    'AccountBalance',
  ],
  IFRS: [
    'ChartOfAccounts',
    'JournalEntry',
    'JournalLine',
    'TrialBalance',
    'AccountBalance',
  ],
  'SOC2': [
    'ChartOfAccounts',
    'JournalEntry',
    'JournalLine',
    'PostingRule',
    'TrialBalance',
    'AccountBalance',
    'PaymentTransaction',
  ],
  'ISO27001': [
    'ChartOfAccounts',
    'JournalEntry',
    'JournalLine',
    'PostingRule',
    'TrialBalance',
    'AccountBalance',
    'PaymentTransaction',
  ],
  'PCI-DSS': [
    'PaymentTransaction',
  ],
};

// Entity relationship mapping
export const ENTITY_RELATIONSHIPS = {
  ChartOfAccounts: {
    children: ['JournalLine', 'TrialBalance', 'AccountBalance'],
    parents: [],
  },
  JournalEntry: {
    children: ['JournalLine'],
    parents: ['PostingRule', 'PaymentTransaction'],
  },
  JournalLine: {
    children: [],
    parents: ['JournalEntry', 'ChartOfAccounts'],
  },
  PostingRule: {
    children: ['JournalEntry'],
    parents: [],
  },
  TrialBalance: {
    children: [],
    parents: ['ChartOfAccounts'],
  },
  AccountBalance: {
    children: [],
    parents: ['ChartOfAccounts'],
  },
  PaymentTransaction: {
    children: [],
    parents: ['JournalEntry'],
  },
};

// Data integrity requirements
export const DATA_INTEGRITY_REQUIREMENTS = {
  hashValidation: true,
  auditTrail: true,
  versionControl: true,
  encryptionAtRest: ['PaymentTransaction'],
  encryptionInTransit: true,
  accessControl: true,
  retentionPolicy: {
    ChartOfAccounts: 'PERMANENT',
    JournalEntry: '7_YEARS',
    JournalLine: '7_YEARS',
    PostingRule: '7_YEARS',
    TrialBalance: '7_YEARS',
    AccountBalance: '3_YEARS',
    PaymentTransaction: '7_YEARS',
  },
  backupRequirements: {
    frequency: 'DAILY',
    retention: '7_YEARS',
    offSiteStorage: true,
    encryption: true,
  },
};

export default FINANCIAL_ENTITIES;
