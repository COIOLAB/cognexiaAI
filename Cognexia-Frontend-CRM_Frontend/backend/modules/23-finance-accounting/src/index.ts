/**
 * Finance & Accounting Module - Main Export Index
 * 
 * Central export point for the Finance & Accounting module
 * providing access to all services, controllers, entities,
 * and configurations for integration with the main ERP system.
 * 
 * @version 3.0.0
 * @author Industry 5.0 ERP Team
 */

// Main Module
export { FinanceAccountingModule } from './finance-accounting.module';

// Services
export { GeneralLedgerService } from './services/general-ledger.service';
export { AccountsPayableService } from './services/accounts-payable.service';
export { AccountsReceivableService } from './services/accounts-receivable.service';
export { FinancialReportingService } from './services/financial-reporting.service';
export { CashManagementService } from './services/cash-management.service';
export { BudgetManagementService } from './services/budget-management.service';
export { FixedAssetsService } from './services/fixed-assets.service';
export { CostAccountingService } from './services/cost-accounting.service';
export { FinancialAnalyticsService } from './services/financial-analytics.service';
export { TaxManagementService } from './services/tax-management.service';

// Controllers
export { GeneralLedgerController } from './controllers/general-ledger.controller';
export { AccountsPayableReceivableController } from './controllers/accounts-payable-receivable.controller';
export { FinancialReportingController } from './controllers/financial-reporting.controller';
export { CashManagementController } from './controllers/cash-management.controller';
export { BudgetPlanningController } from './controllers/budget-planning.controller';
export { AssetManagementController } from './controllers/asset-management.controller';
export { CostAccountingController } from './controllers/cost-accounting.controller';
export { FinancialAnalyticsController } from './controllers/financial-analytics.controller';
export { ChartOfAccountsController } from './controllers/chart-of-accounts.controller';
export { ComplianceAuditController } from './controllers/compliance-audit.controller';
export { GlobalFinanceAccountingController } from './controllers/global-finance-accounting.controller';
export { GlobalTaxEngineController } from './controllers/global-tax-engine.controller';

// Configuration
export { default as DatabaseConfig } from './config/database.config';
export { default as FinanceConfig } from './config/finance.config';

// Entities (when created)
// export { GeneralLedgerEntry } from './entities/general-ledger-entry.entity';
// export { JournalEntry } from './entities/journal-entry.entity';
// export { ChartOfAccount } from './entities/chart-of-account.entity';
// export { VendorInvoice } from './entities/vendor-invoice.entity';
// export { CustomerInvoice } from './entities/customer-invoice.entity';
// export { CashAccount } from './entities/cash-account.entity';
// export { Budget } from './entities/budget.entity';
// export { FixedAsset } from './entities/fixed-asset.entity';

// DTOs (when created)
// export * from './dto/journal-entry.dto';
// export * from './dto/invoice.dto';
// export * from './dto/payment.dto';
// export * from './dto/budget.dto';
// export * from './dto/report.dto';

// Guards
// export { FinanceGuard } from './guards/finance.guard';
// export { RoleBasedGuard } from './guards/role-based.guard';

// Middleware
// export { AuditMiddleware } from './middleware/audit.middleware';
// export { ValidationMiddleware } from './middleware/validation.middleware';
// export { LoggingMiddleware } from './middleware/logging.middleware';

// Types and Interfaces
export type {
  // Add interface exports when needed
} from './types/finance.types';
