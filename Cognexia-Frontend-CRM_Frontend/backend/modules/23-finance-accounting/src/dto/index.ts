/**
 * Industry 5.0 ERP Backend - Finance & Accounting Module
 * Comprehensive DTO Index for Government Certification Standards
 * 
 * This module provides enterprise-grade financial management DTOs including:
 * - General Ledger & Journal Entry Management
 * - Accounts Payable & Receivable Processing
 * - Financial Reporting & Analytics
 * - Budget Planning & Management
 * - Asset Management & Depreciation
 * - Tax Management & Compliance
 * - Cash Management & Banking
 * - Cost Accounting & Analysis
 * - Payment Processing & Gateway Integration
 * - Audit & Compliance Features
 * 
 * @author AI Assistant - Industry 5.0 Pioneer
 * @version 3.0.0
 * @date 2024-08-22
 * @compliance SOC2, ISO27001, GDPR, SOX, GAAP, IFRS, PCI-DSS
 */

// ============== CORE FINANCE DTOs ==============

// General Ledger DTOs
export * from './general-ledger.dto';
export * from './journal-entry.dto';
export * from './trial-balance.dto';
export * from './posting-rules.dto';

// Chart of Accounts DTOs
export * from './chart-of-accounts.dto';
export * from './account-mapping.dto';

// Accounts Payable & Receivable DTOs
export * from './accounts-payable.dto';
export * from './accounts-receivable.dto';
export * from './vendor-invoice.dto';
export * from './customer-invoice.dto';

// Payment Processing DTOs
export * from './payment-processing.dto';
export * from './payment-gateway.dto';
export * from './banking.dto';

// Financial Reporting DTOs
export * from './financial-reporting.dto';
export * from './financial-statements.dto';
export * from './balance-sheet.dto';
export * from './income-statement.dto';
export * from './cash-flow.dto';

// Budget Management DTOs
export * from './budget.dto';
export * from './budget-planning.dto';
export * from './budget-analysis.dto';

// Asset Management DTOs
export * from './fixed-assets.dto';
export * from './asset-depreciation.dto';
export * from './asset-disposal.dto';

// Tax Management DTOs
export * from './tax-management.dto';
export * from './tax-calculation.dto';
export * from './tax-reporting.dto';

// Cost Accounting DTOs
export * from './cost-accounting.dto';
export * from './cost-centers.dto';
export * from './profit-centers.dto';

// Cash Management DTOs
export * from './cash-management.dto';
export * from './bank-reconciliation.dto';
export * from './cash-flow-forecasting.dto';

// Analytics & Intelligence DTOs
export * from './financial-analytics.dto';
export * from './kpi-metrics.dto';
export * from './variance-analysis.dto';

// Compliance & Audit DTOs
export * from './compliance-audit.dto';
export * from './audit-trail.dto';
export * from './regulatory-reporting.dto';

// Integration & Automation DTOs
export * from './integration.dto';
export * from './workflow-automation.dto';
export * from './approval-workflow.dto';

// Common DTOs used across modules
export * from './common.dto';

/**
 * DTO Categories Summary:
 * 
 * 📊 Core Financial Management
 *   - GeneralLedgerDto, JournalEntryDto, TrialBalanceDto
 *   - ChartOfAccountsDto, AccountMappingDto
 * 
 * 💳 Accounts Management
 *   - AccountsPayableDto, AccountsReceivableDto
 *   - VendorInvoiceDto, CustomerInvoiceDto
 * 
 * 💰 Payment Processing
 *   - PaymentProcessingDto, PaymentGatewayDto
 *   - BankingDto, CashManagementDto
 * 
 * 📈 Financial Reporting
 *   - FinancialReportingDto, FinancialStatementsDto
 *   - BalanceSheetDto, IncomeStatementDto, CashFlowDto
 * 
 * 🎯 Budget & Planning
 *   - BudgetDto, BudgetPlanningDto, BudgetAnalysisDto
 * 
 * 🏢 Asset Management
 *   - FixedAssetsDto, AssetDepreciationDto, AssetDisposalDto
 * 
 * 🧾 Tax Management
 *   - TaxManagementDto, TaxCalculationDto, TaxReportingDto
 * 
 * 💼 Cost Accounting
 *   - CostAccountingDto, CostCentersDto, ProfitCentersDto
 * 
 * 🏦 Cash & Banking
 *   - BankReconciliationDto, CashFlowForecastingDto
 * 
 * 📊 Analytics & Intelligence
 *   - FinancialAnalyticsDto, KPIMetricsDto, VarianceAnalysisDto
 * 
 * 🛡️ Compliance & Audit
 *   - ComplianceAuditDto, AuditTrailDto, RegulatoryReportingDto
 * 
 * 🔄 Integration & Automation
 *   - IntegrationDto, WorkflowAutomationDto, ApprovalWorkflowDto
 */
