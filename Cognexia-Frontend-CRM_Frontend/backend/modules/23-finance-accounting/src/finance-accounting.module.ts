/**
 * Finance & Accounting Module - Main Module Configuration
 * 
 * Comprehensive finance and accounting module providing enterprise-grade
 * financial management capabilities with AI-powered analytics, real-time
 * processing, and advanced automation for Industry 5.0 ERP systems.
 * 
 * @version 3.0.0
 * @author Industry 5.0 ERP Team
 * @compliance SOC2, ISO27001, GDPR, SOX, GAAP, IFRS
 */

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';

// Controllers
import { GeneralLedgerController } from './controllers/general-ledger.controller';
import { AccountsPayableReceivableController } from './controllers/accounts-payable-receivable.controller';
import { FinancialReportingController } from './controllers/financial-reporting.controller';
import { CashManagementController } from './controllers/cash-management.controller';
import { BudgetPlanningController } from './controllers/budget-planning.controller';
import { AssetManagementController } from './controllers/asset-management.controller';
import { CostAccountingController } from './controllers/cost-accounting.controller';
import { FinancialAnalyticsController } from './controllers/financial-analytics.controller';
import { ChartOfAccountsController } from './controllers/chart-of-accounts.controller';
import { ComplianceAuditController } from './controllers/compliance-audit.controller';
import { GlobalFinanceAccountingController } from './controllers/global-finance-accounting.controller';
import { GlobalTaxEngineController } from './controllers/global-tax-engine.controller';
import { PaymentProcessingController } from './controllers/payment-processing.controller';

// Services
import { GeneralLedgerService } from './services/general-ledger.service';
import { AccountsPayableService } from './services/accounts-payable.service';
import { AccountsReceivableService } from './services/accounts-receivable.service';
import { FinancialReportingService } from './services/financial-reporting.service';
import { CashManagementService } from './services/cash-management.service';
import { BudgetManagementService } from './services/budget-management.service';
import { FixedAssetsService } from './services/fixed-assets.service';
import { CostAccountingService } from './services/cost-accounting.service';
import { FinancialAnalyticsService } from './services/financial-analytics.service';
import { TaxManagementService } from './services/tax-management.service';
import { PaymentProcessingService } from './services/payment-processing.service';
import { JournalEntryService } from './services/journal-entry.service';
import { PostingEngineService } from './services/posting-engine.service';
import { BalancingService } from './services/balancing.service';
import { PeriodClosureService } from './services/period-closure.service';
import { FinancialReconciliationService } from './services/financial-reconciliation.service';
import { AutomatedPostingService } from './services/automated-posting.service';
import { ComplianceReportingService } from './services/compliance-reporting.service';
import { BudgetPlanningService } from './services/budget-planning.service';
import { GlobalFinanceService } from './services/global-finance.service';
import { AssetLifecycleService } from './services/asset-lifecycle.service';
import { AssetManagementService } from './services/asset-management.service';
import { DepreciationService } from './services/depreciation.service';
import { ImpairmentTestingService } from './services/impairment-testing.service';
import { AssetValuationService } from './services/asset-valuation.service';
import { TreasuryService } from './services/treasury.service';
import { RiskManagementService } from './services/risk-management.service';
import { InvestmentManagementService } from './services/investment-management.service';
import { ChartOfAccountsService } from './services/chart-of-accounts.service';
import { ComplianceMonitoringService } from './services/compliance-monitoring.service';
import { CollectionManagementService } from './services/collection-management.service';
import { AccountValidationService } from './services/account-validation.service';
import { AccountMappingService } from './services/account-mapping.service';
import { MatchingEngineService } from './services/matching-engine.service';

// Entities
import { ChartOfAccounts } from './entities/chart-of-accounts.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalLine } from './entities/journal-line.entity';
import { PostingRule } from './entities/posting-rule.entity';
import { TrialBalance } from './entities/trial-balance.entity';
import { AccountBalance } from './entities/account-balance.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';

// Middleware
import { AuditMiddleware } from './middleware/audit.middleware';
import { ValidationMiddleware } from './middleware/validation.middleware';
import { LoggingMiddleware } from './middleware/logging.middleware';

// Guards
import { FinanceGuard } from './guards/finance.guard';
import { RoleBasedGuard } from './guards/role-based.guard';

// Configuration
import DatabaseConfig from './config/database.config';
import FinanceConfig from './config/finance.config';
import SupabaseConfig, { createSupabaseTypeOrmConfig } from './config/supabase.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [DatabaseConfig, FinanceConfig, SupabaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database - Supabase PostgreSQL with TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Use Supabase configuration if available, otherwise fallback to regular database config
        const supabaseConfig = configService.get('supabase.database');
        if (supabaseConfig) {
          return {
            ...supabaseConfig,
            entities: [
              ChartOfAccounts,
              JournalEntry,
              JournalLine,
              PostingRule,
              TrialBalance,
              AccountBalance,
              PaymentTransaction,
            ],
          };
        }
        
        // Fallback to regular configuration
        return {
          type: 'postgres',
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.name'),
          entities: [
            ChartOfAccounts,
            JournalEntry,
            JournalLine,
            PostingRule,
            TrialBalance,
            AccountBalance,
            PaymentTransaction,
          ],
          migrations: ['src/database/migrations/*{.ts,.js}'],
          synchronize: configService.get('database.synchronize', false),
          logging: configService.get('database.logging', false),
          ssl: configService.get('database.ssl', false),
          autoLoadEntities: false,
          retryAttempts: 3,
          retryDelay: 3000,
        };
      },
      inject: [ConfigService],
    }),

    // Entity repositories for dependency injection
    TypeOrmModule.forFeature([
      ChartOfAccounts,
      JournalEntry,
      JournalLine,
      PostingRule,
      TrialBalance,
      AccountBalance,
      PaymentTransaction,
    ]),

    // Event handling
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),

    // Queue management
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
        },
      }),
      inject: [ConfigService],
    }),

    // Queue registration
    BullModule.registerQueue(
      { name: 'financial-processing' },
      { name: 'invoice-processing' },
      { name: 'payment-processing' },
      { name: 'reconciliation' },
      { name: 'reporting' },
      { name: 'analytics' },
      { name: 'notifications' },
    ),

    // Caching
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: 'redis',
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
        password: configService.get('redis.password'),
        ttl: configService.get('cache.ttl', 3600),
        max: configService.get('cache.max', 1000),
      }),
      inject: [ConfigService],
    }),

    // Scheduling
    ScheduleModule.forRoot(),
  ],

  controllers: [
    GeneralLedgerController,
    AccountsPayableReceivableController,
    FinancialReportingController,
    CashManagementController,
    BudgetPlanningController,
    AssetManagementController,
    CostAccountingController,
    FinancialAnalyticsController,
    ChartOfAccountsController,
    ComplianceAuditController,
    GlobalFinanceAccountingController,
    GlobalTaxEngineController,
    PaymentProcessingController,
  ],

  providers: [
    // Core Services
    GeneralLedgerService,
    AccountsPayableService,
    AccountsReceivableService,
    FinancialReportingService,
    CashManagementService,
    BudgetManagementService,
    FixedAssetsService,
    CostAccountingService,
    FinancialAnalyticsService,
    TaxManagementService,
    PaymentProcessingService,
    JournalEntryService,
    PostingEngineService,
    BalancingService,
    PeriodClosureService,
    FinancialReconciliationService,
    AutomatedPostingService,
    ComplianceReportingService,
    BudgetPlanningService,
    GlobalFinanceService,
    AssetLifecycleService,
    AssetManagementService,
    DepreciationService,
    ImpairmentTestingService,
    AssetValuationService,
    TreasuryService,
    RiskManagementService,
    InvestmentManagementService,
    ChartOfAccountsService,
    ComplianceMonitoringService,
    CollectionManagementService,
    AccountValidationService,
    AccountMappingService,
    MatchingEngineService,

    // Guards
    FinanceGuard,
    RoleBasedGuard,

    // Additional providers would be added here
    // AuditService,
    // NotificationService,
    // ReportingEngine,
    // AnalyticsEngine,
  ],

  exports: [
    // Export services for use in other modules
    GeneralLedgerService,
    AccountsPayableService,
    AccountsReceivableService,
    FinancialReportingService,
    CashManagementService,
    BudgetManagementService,
    FixedAssetsService,
    CostAccountingService,
    FinancialAnalyticsService,
    TaxManagementService,
    PaymentProcessingService,
    JournalEntryService,
    PostingEngineService,
    BalancingService,
    PeriodClosureService,
    FinancialReconciliationService,
    AutomatedPostingService,
    ComplianceReportingService,
    BudgetPlanningService,
    GlobalFinanceService,
    AssetLifecycleService,
    AssetManagementService,
    DepreciationService,
    ImpairmentTestingService,
    AssetValuationService,
    TreasuryService,
    RiskManagementService,
    InvestmentManagementService,
    ChartOfAccountsService,
    ComplianceMonitoringService,
    CollectionManagementService,
    AccountValidationService,
    AccountMappingService,
    MatchingEngineService,
  ],
})
export class FinanceAccountingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('*');
    
    consumer
      .apply(AuditMiddleware)
      .forRoutes('finance-accounting/*');
    
    consumer
      .apply(ValidationMiddleware)
      .forRoutes('finance-accounting/*');
  }
}
