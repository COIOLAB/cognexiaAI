/**
 * Finance & Accounting Module Configuration
 * 
 * Comprehensive configuration for finance module including
 * business rules, compliance settings, integration endpoints,
 * and operational parameters for enterprise financial management.
 */

import { registerAs } from '@nestjs/config';

export default registerAs('finance', () => ({
  // General Settings
  module: {
    name: 'Finance & Accounting',
    version: '3.0.0',
    environment: process.env.NODE_ENV || 'development',
    debug: process.env.FINANCE_DEBUG === 'true' || false,
  },

  // Business Rules
  businessRules: {
    // Currency settings
    baseCurrency: process.env.BASE_CURRENCY || 'USD',
    supportedCurrencies: (process.env.SUPPORTED_CURRENCIES || 'USD,EUR,GBP,JPY,CNY').split(','),
    exchangeRateProvider: process.env.FX_PROVIDER || 'xe.com',
    
    // Financial periods
    fiscalYearStart: process.env.FISCAL_YEAR_START || '01-01',
    reportingFrequency: process.env.REPORTING_FREQUENCY || 'monthly',
    
    // Approval workflows
    invoiceApprovalThreshold: parseFloat(process.env.INVOICE_APPROVAL_THRESHOLD || '10000'),
    paymentApprovalThreshold: parseFloat(process.env.PAYMENT_APPROVAL_THRESHOLD || '5000'),
    budgetApprovalThreshold: parseFloat(process.env.BUDGET_APPROVAL_THRESHOLD || '50000'),
    
    // Validation rules
    maxInvoiceAmount: parseFloat(process.env.MAX_INVOICE_AMOUNT || '1000000'),
    maxPaymentAmount: parseFloat(process.env.MAX_PAYMENT_AMOUNT || '500000'),
    duplicateCheckWindow: parseInt(process.env.DUPLICATE_CHECK_WINDOW, 10) || 30, // days
  },

  // Accounting Standards
  accountingStandards: {
    primary: process.env.ACCOUNTING_STANDARD || 'GAAP',
    secondary: process.env.SECONDARY_STANDARD || 'IFRS',
    jurisdiction: process.env.JURISDICTION || 'US',
    taxRegion: process.env.TAX_REGION || 'US',
  },

  // Compliance Settings
  compliance: {
    sox: process.env.SOX_COMPLIANCE === 'true' || false,
    gdpr: process.env.GDPR_COMPLIANCE === 'true' || true,
    pciDss: process.env.PCI_DSS_COMPLIANCE === 'true' || false,
    auditRetention: parseInt(process.env.AUDIT_RETENTION_DAYS, 10) || 2555, // 7 years
    dataEncryption: process.env.DATA_ENCRYPTION === 'true' || true,
  },

  // AI & Analytics
  ai: {
    enabled: process.env.AI_ENABLED === 'true' || true,
    provider: process.env.AI_PROVIDER || 'openai',
    confidenceThreshold: parseFloat(process.env.AI_CONFIDENCE_THRESHOLD || '0.8'),
    fraudDetection: process.env.FRAUD_DETECTION === 'true' || true,
    anomalyDetection: process.env.ANOMALY_DETECTION === 'true' || true,
    predictiveAnalytics: process.env.PREDICTIVE_ANALYTICS === 'true' || true,
  },

  // Integration Settings
  integrations: {
    // Banking APIs
    banking: {
      enabled: process.env.BANKING_INTEGRATION === 'true' || false,
      providers: (process.env.BANKING_PROVIDERS || 'yodlee,plaid').split(','),
      refreshInterval: parseInt(process.env.BANKING_REFRESH_INTERVAL, 10) || 3600, // seconds
    },
    
    // Payment gateways
    payments: {
      providers: (process.env.PAYMENT_PROVIDERS || 'stripe,paypal,square').split(','),
      webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET,
      retryAttempts: parseInt(process.env.PAYMENT_RETRY_ATTEMPTS, 10) || 3,
    },
    
    // Tax services
    tax: {
      provider: process.env.TAX_PROVIDER || 'avalara',
      autoCalculate: process.env.AUTO_TAX_CALC === 'true' || true,
      nexusStates: (process.env.NEXUS_STATES || 'CA,NY,TX').split(','),
    },
    
    // External systems
    erp: {
      crmIntegration: process.env.CRM_INTEGRATION === 'true' || true,
      scmIntegration: process.env.SCM_INTEGRATION === 'true' || true,
      hrIntegration: process.env.HR_INTEGRATION === 'true' || true,
      manufacturingIntegration: process.env.MFG_INTEGRATION === 'true' || true,
    },
  },

  // Security Settings
  security: {
    encryption: {
      algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
      keyRotationDays: parseInt(process.env.KEY_ROTATION_DAYS, 10) || 90,
    },
    
    accessControl: {
      maxFailedAttempts: parseInt(process.env.MAX_FAILED_ATTEMPTS, 10) || 5,
      lockoutDuration: parseInt(process.env.LOCKOUT_DURATION, 10) || 900, // 15 minutes
      sessionTimeout: parseInt(process.env.SESSION_TIMEOUT, 10) || 3600, // 1 hour
    },
    
    audit: {
      logAllTransactions: process.env.LOG_ALL_TRANSACTIONS === 'true' || true,
      retentionPeriod: parseInt(process.env.AUDIT_RETENTION, 10) || 2555, // 7 years
      realTimeAuditing: process.env.REALTIME_AUDIT === 'true' || true,
    },
  },

  // Performance Settings
  performance: {
    caching: {
      enabled: process.env.CACHE_ENABLED === 'true' || true,
      ttl: parseInt(process.env.CACHE_TTL, 10) || 3600, // 1 hour
      maxSize: parseInt(process.env.CACHE_MAX_SIZE, 10) || 1000,
    },
    
    batchProcessing: {
      batchSize: parseInt(process.env.BATCH_SIZE, 10) || 1000,
      parallelProcessing: process.env.PARALLEL_PROCESSING === 'true' || true,
      maxConcurrency: parseInt(process.env.MAX_CONCURRENCY, 10) || 10,
    },
    
    reporting: {
      asyncReports: process.env.ASYNC_REPORTS === 'true' || true,
      reportCache: process.env.REPORT_CACHE === 'true' || true,
      backgroundGeneration: process.env.BG_GENERATION === 'true' || true,
    },
  },

  // Notification Settings
  notifications: {
    email: {
      enabled: process.env.EMAIL_NOTIFICATIONS === 'true' || true,
      provider: process.env.EMAIL_PROVIDER || 'sendgrid',
      fromAddress: process.env.FROM_EMAIL || 'finance@company.com',
    },
    
    sms: {
      enabled: process.env.SMS_NOTIFICATIONS === 'true' || false,
      provider: process.env.SMS_PROVIDER || 'twilio',
    },
    
    webhook: {
      enabled: process.env.WEBHOOK_NOTIFICATIONS === 'true' || false,
      endpoints: (process.env.WEBHOOK_ENDPOINTS || '').split(',').filter(Boolean),
    },
  },

  // Backup & Recovery
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true' || true,
    frequency: process.env.BACKUP_FREQUENCY || 'daily',
    retention: parseInt(process.env.BACKUP_RETENTION_DAYS, 10) || 30,
    encryption: process.env.BACKUP_ENCRYPTION === 'true' || true,
    offsite: process.env.OFFSITE_BACKUP === 'true' || false,
  },
}));
