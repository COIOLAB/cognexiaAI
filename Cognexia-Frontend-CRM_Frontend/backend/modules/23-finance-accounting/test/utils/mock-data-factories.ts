/**
 * Mock Data Factories
 * Factories for generating realistic test data for Finance & Accounting Module
 */

import { JournalEntryType, JournalEntryStatus, ApprovalStatus } from '../../src/entities/journal-entry.entity';
import { LineType, AnalysisCode } from '../../src/entities/journal-line.entity';
import { generateRandomString, generateRandomNumber, generateRandomDate, toDecimal } from './test-helpers';

/**
 * Chart of Accounts Factory
 */
export class ChartOfAccountsFactory {
  static create(overrides: Partial<any> = {}) {
    return {
      accountId: `acc-${generateRandomString(10)}`,
      accountCode: overrides.accountCode || `1000-${generateRandomNumber(100, 999)}`,
      accountName: overrides.accountName || `Test Account ${generateRandomString(5)}`,
      accountType: overrides.accountType || 'ASSETS',
      accountCategory: overrides.accountCategory || 'Current Assets',
      accountSubcategory: overrides.accountSubcategory || 'Cash',
      normalBalance: overrides.normalBalance || 'DEBIT',
      hierarchyLevel: overrides.hierarchyLevel || 1,
      fullPath: overrides.fullPath || '/1000',
      isActive: overrides.isActive !== undefined ? overrides.isActive : true,
      allowManualEntries: overrides.allowManualEntries !== undefined ? overrides.allowManualEntries : true,
      requiresCostCenter: overrides.requiresCostCenter || false,
      requiresProject: overrides.requiresProject || false,
      requiresDepartment: overrides.requiresDepartment || false,
      requiresLocation: overrides.requiresLocation || false,
      taxRelevant: overrides.taxRelevant || false,
      reconciliationAccount: overrides.reconciliationAccount || false,
      reportingLines: overrides.reportingLines || {},
      dimensions: overrides.dimensions || {},
      validationRules: overrides.validationRules || {},
      aiConfiguration: overrides.aiConfiguration || {
        autoSuggestPostings: false,
        anomalyDetection: true,
        patternRecognition: true,
        riskAssessment: false,
        learningEnabled: true,
        confidenceThreshold: '0.8',
        modelVersion: '1.0.0',
      },
      currentBalance: toDecimal(overrides.currentBalance || 0),
      budgetAmount: overrides.budgetAmount ? toDecimal(overrides.budgetAmount) : null,
      auditTrail: overrides.auditTrail || [],
      createdBy: overrides.createdBy || 'test-user',
      createdAt: overrides.createdAt || new Date(),
      lastModifiedBy: overrides.lastModifiedBy || null,
      lastModifiedAt: overrides.lastModifiedAt || null,
      versionNumber: overrides.versionNumber || 1,
      metadata: overrides.metadata || {},
      parentAccountId: overrides.parentAccountId || null,
      ...overrides,
    };
  }

  static createMultiple(count: number, overrides: Partial<any> = {}) {
    return Array.from({ length: count }, (_, index) =>
      this.create({ ...overrides, accountCode: `${1000 + index}` }),
    );
  }
}

/**
 * Journal Entry Factory
 */
export class JournalEntryFactory {
  static create(overrides: Partial<any> = {}) {
    const entryNumber = overrides.entryNumber || `JE${Date.now()}`;
    const transactionDate = overrides.transactionDate || new Date();
    
    return {
      id: `je-${generateRandomString(10)}`,
      entryNumber,
      entryType: overrides.entryType || JournalEntryType.MANUAL,
      status: overrides.status || JournalEntryStatus.DRAFT,
      transactionDate,
      postingDate: overrides.postingDate || transactionDate,
      period: overrides.period || '2024-01',
      fiscalYear: overrides.fiscalYear || '2024',
      reference: overrides.reference || `REF-${generateRandomString(8)}`,
      description: overrides.description || 'Test journal entry',
      currency: overrides.currency || 'USD',
      exchangeRate: overrides.exchangeRate || 1.0,
      businessUnit: overrides.businessUnit || null,
      costCenter: overrides.costCenter || null,
      profitCenter: overrides.profitCenter || null,
      project: overrides.project || null,
      department: overrides.department || null,
      location: overrides.location || null,
      sourceDocumentType: overrides.sourceDocumentType || null,
      sourceDocumentNumber: overrides.sourceDocumentNumber || null,
      sourceDocumentDate: overrides.sourceDocumentDate || null,
      attachments: overrides.attachments || [],
      sourceModule: overrides.sourceModule || null,
      sourceTransactionId: overrides.sourceTransactionId || null,
      sourceSystem: overrides.sourceSystem || null,
      totalDebit: overrides.totalDebit || 0,
      totalCredit: overrides.totalCredit || 0,
      balanceDifference: overrides.balanceDifference || 0,
      isBalanced: overrides.isBalanced !== undefined ? overrides.isBalanced : true,
      isRecurring: overrides.isRecurring || false,
      recurringSchedule: overrides.recurringSchedule || null,
      approvalStatus: overrides.approvalStatus || ApprovalStatus.PENDING,
      approvalWorkflow: overrides.approvalWorkflow || null,
      aiValidation: overrides.aiValidation || null,
      complianceFlags: overrides.complianceFlags || [],
      riskScore: overrides.riskScore || 0,
      requiresReview: overrides.requiresReview || false,
      isSensitive: overrides.isSensitive || false,
      postedAt: overrides.postedAt || null,
      postedBy: overrides.postedBy || null,
      postingReference: overrides.postingReference || null,
      reversalEntryId: overrides.reversalEntryId || null,
      originalEntryId: overrides.originalEntryId || null,
      reversalReason: overrides.reversalReason || null,
      reversedAt: overrides.reversedAt || null,
      reversedBy: overrides.reversedBy || null,
      customFields: overrides.customFields || {},
      metadata: overrides.metadata || {},
      lines: overrides.lines || [],
      appliedRuleId: overrides.appliedRuleId || null,
      createdBy: overrides.createdBy || 'test-user',
      createdAt: overrides.createdAt || new Date(),
      updatedBy: overrides.updatedBy || null,
      updatedAt: overrides.updatedAt || new Date(),
      auditTrail: overrides.auditTrail || {},
      version: overrides.version || 1,
      dataIntegrityHash: overrides.dataIntegrityHash || generateRandomString(64),
      ...overrides,
    };
  }

  static createBalanced(overrides: Partial<any> = {}) {
    const debitAmount = overrides.debitAmount || 1000;
    const creditAmount = overrides.creditAmount || 1000;
    
    const lines = [
      JournalLineFactory.create({
        lineNumber: 1,
        debitAmount,
        creditAmount: null,
        accountCode: '1000',
        description: 'Debit entry',
      }),
      JournalLineFactory.create({
        lineNumber: 2,
        debitAmount: null,
        creditAmount,
        accountCode: '2000',
        description: 'Credit entry',
      }),
    ];

    return this.create({
      totalDebit: debitAmount,
      totalCredit: creditAmount,
      balanceDifference: 0,
      isBalanced: true,
      lines,
      ...overrides,
    });
  }
}

/**
 * Journal Line Factory
 */
export class JournalLineFactory {
  static create(overrides: Partial<any> = {}) {
    return {
      id: `jl-${generateRandomString(10)}`,
      journalEntryId: overrides.journalEntryId || `je-${generateRandomString(10)}`,
      lineNumber: overrides.lineNumber || 1,
      accountCode: overrides.accountCode || '1000',
      description: overrides.description || 'Test journal line',
      debitAmount: overrides.debitAmount !== undefined ? overrides.debitAmount : null,
      creditAmount: overrides.creditAmount !== undefined ? overrides.creditAmount : null,
      currency: overrides.currency || 'USD',
      exchangeRate: overrides.exchangeRate || 1.0,
      baseCurrencyAmount: overrides.baseCurrencyAmount || null,
      lineType: overrides.lineType || LineType.NORMAL,
      analysisCode: overrides.analysisCode || null,
      businessUnit: overrides.businessUnit || null,
      costCenter: overrides.costCenter || null,
      profitCenter: overrides.profitCenter || null,
      project: overrides.project || null,
      department: overrides.department || null,
      location: overrides.location || null,
      product: overrides.product || null,
      customer: overrides.customer || null,
      vendor: overrides.vendor || null,
      employee: overrides.employee || null,
      asset: overrides.asset || null,
      taxCode: overrides.taxCode || null,
      taxRate: overrides.taxRate || null,
      taxAmount: overrides.taxAmount || null,
      isTaxDeductible: overrides.isTaxDeductible || false,
      isIntercompany: overrides.isIntercompany || false,
      intercompanyEntity: overrides.intercompanyEntity || null,
      reference: overrides.reference || null,
      externalReference: overrides.externalReference || null,
      documentNumber: overrides.documentNumber || null,
      transactionDate: overrides.transactionDate || new Date(),
      dueDate: overrides.dueDate || null,
      allocationRules: overrides.allocationRules || null,
      isAllocated: overrides.isAllocated || false,
      parentLineId: overrides.parentLineId || null,
      quantity: overrides.quantity || null,
      unit: overrides.unit || null,
      unitPrice: overrides.unitPrice || null,
      statisticalAmount: overrides.statisticalAmount || null,
      budgetAmount: overrides.budgetAmount || null,
      varianceAmount: overrides.varianceAmount || null,
      variancePercentage: overrides.variancePercentage || null,
      budgetCode: overrides.budgetCode || null,
      requiresApproval: overrides.requiresApproval || false,
      isApproved: overrides.isApproved || false,
      approvedBy: overrides.approvedBy || null,
      approvedAt: overrides.approvedAt || null,
      affectsCashFlow: overrides.affectsCashFlow || false,
      expectedPaymentDate: overrides.expectedPaymentDate || null,
      actualPaymentDate: overrides.actualPaymentDate || null,
      paymentMethod: overrides.paymentMethod || null,
      paymentReference: overrides.paymentReference || null,
      aiInsights: overrides.aiInsights || null,
      customFields: overrides.customFields || {},
      metadata: overrides.metadata || {},
      createdBy: overrides.createdBy || 'test-user',
      createdAt: overrides.createdAt || new Date(),
      updatedBy: overrides.updatedBy || null,
      updatedAt: overrides.updatedAt || new Date(),
      auditTrail: overrides.auditTrail || {},
      version: overrides.version || 1,
      dataIntegrityHash: overrides.dataIntegrityHash || generateRandomString(64),
      ...overrides,
    };
  }

  static createMultiple(count: number, overrides: Partial<any> = {}) {
    return Array.from({ length: count }, (_, index) =>
      this.create({ ...overrides, lineNumber: index + 1 }),
    );
  }
}

/**
 * Customer Invoice Factory
 */
export class CustomerInvoiceFactory {
  static create(overrides: Partial<any> = {}) {
    const invoiceNumber = overrides.invoiceNumber || `INV-${Date.now()}`;
    const invoiceDate = overrides.invoiceDate || new Date();
    const dueDate = overrides.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return {
      id: `ci-${generateRandomString(10)}`,
      invoiceNumber,
      invoiceDate,
      dueDate,
      customerId: overrides.customerId || `cust-${generateRandomString(8)}`,
      customerName: overrides.customerName || 'Test Customer',
      amount: toDecimal(overrides.amount || 1000),
      taxAmount: toDecimal(overrides.taxAmount || 80),
      totalAmount: toDecimal(overrides.totalAmount || 1080),
      currency: overrides.currency || 'USD',
      status: overrides.status || 'PENDING',
      paymentTerms: overrides.paymentTerms || 'NET30',
      description: overrides.description || 'Test invoice',
      lineItems: overrides.lineItems || [],
      createdBy: overrides.createdBy || 'test-user',
      createdAt: overrides.createdAt || new Date(),
      ...overrides,
    };
  }
}

/**
 * Vendor Invoice Factory
 */
export class VendorInvoiceFactory {
  static create(overrides: Partial<any> = {}) {
    const invoiceNumber = overrides.invoiceNumber || `VINV-${Date.now()}`;
    const invoiceDate = overrides.invoiceDate || new Date();
    const dueDate = overrides.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return {
      id: `vi-${generateRandomString(10)}`,
      invoiceNumber,
      invoiceDate,
      dueDate,
      vendorId: overrides.vendorId || `vend-${generateRandomString(8)}`,
      vendorName: overrides.vendorName || 'Test Vendor',
      amount: toDecimal(overrides.amount || 1000),
      taxAmount: toDecimal(overrides.taxAmount || 80),
      totalAmount: toDecimal(overrides.totalAmount || 1080),
      currency: overrides.currency || 'USD',
      status: overrides.status || 'PENDING',
      paymentTerms: overrides.paymentTerms || 'NET30',
      description: overrides.description || 'Test vendor invoice',
      lineItems: overrides.lineItems || [],
      createdBy: overrides.createdBy || 'test-user',
      createdAt: overrides.createdAt || new Date(),
      ...overrides,
    };
  }
}

/**
 * Payment Transaction Factory
 */
export class PaymentTransactionFactory {
  static create(overrides: Partial<any> = {}) {
    return {
      id: `pay-${generateRandomString(10)}`,
      transactionId: overrides.transactionId || `TXN-${Date.now()}`,
      paymentDate: overrides.paymentDate || new Date(),
      amount: toDecimal(overrides.amount || 1000),
      currency: overrides.currency || 'USD',
      paymentMethod: overrides.paymentMethod || 'WIRE',
      status: overrides.status || 'COMPLETED',
      reference: overrides.reference || `REF-${generateRandomString(8)}`,
      description: overrides.description || 'Test payment',
      createdBy: overrides.createdBy || 'test-user',
      createdAt: overrides.createdAt || new Date(),
      ...overrides,
    };
  }
}

/**
 * Budget Factory
 */
export class BudgetFactory {
  static create(overrides: Partial<any> = {}) {
    return {
      id: `bud-${generateRandomString(10)}`,
      budgetCode: overrides.budgetCode || `BUD-${Date.now()}`,
      budgetName: overrides.budgetName || 'Test Budget',
      fiscalYear: overrides.fiscalYear || '2024',
      amount: toDecimal(overrides.amount || 10000),
      currency: overrides.currency || 'USD',
      status: overrides.status || 'ACTIVE',
      departmentId: overrides.departmentId || null,
      costCenterId: overrides.costCenterId || null,
      createdBy: overrides.createdBy || 'test-user',
      createdAt: overrides.createdAt || new Date(),
      ...overrides,
    };
  }
}

/**
 * Trial Balance Entry Factory
 */
export class TrialBalanceFactory {
  static create(overrides: Partial<any> = {}) {
    return {
      id: `tb-${generateRandomString(10)}`,
      accountCode: overrides.accountCode || '1000',
      accountName: overrides.accountName || 'Test Account',
      openingBalance: toDecimal(overrides.openingBalance || 0),
      debitAmount: toDecimal(overrides.debitAmount || 1000),
      creditAmount: toDecimal(overrides.creditAmount || 500),
      closingBalance: toDecimal(overrides.closingBalance || 500),
      period: overrides.period || '2024-01',
      fiscalYear: overrides.fiscalYear || '2024',
      ...overrides,
    };
  }

  static createBalanced() {
    const assets = this.create({
      accountCode: '1000',
      accountName: 'Assets',
      debitAmount: 10000,
      creditAmount: 0,
      closingBalance: 10000,
    });

    const liabilities = this.create({
      accountCode: '2000',
      accountName: 'Liabilities',
      debitAmount: 0,
      creditAmount: 10000,
      closingBalance: -10000,
    });

    return [assets, liabilities];
  }
}

/**
 * Export all factories
 */
export const MockFactories = {
  ChartOfAccounts: ChartOfAccountsFactory,
  JournalEntry: JournalEntryFactory,
  JournalLine: JournalLineFactory,
  CustomerInvoice: CustomerInvoiceFactory,
  VendorInvoice: VendorInvoiceFactory,
  PaymentTransaction: PaymentTransactionFactory,
  Budget: BudgetFactory,
  TrialBalance: TrialBalanceFactory,
};
