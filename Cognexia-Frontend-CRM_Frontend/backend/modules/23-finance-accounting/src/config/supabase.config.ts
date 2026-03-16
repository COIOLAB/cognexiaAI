/**
 * Supabase Configuration for Finance & Accounting Module
 * 
 * Production-ready Supabase configuration with TypeORM integration,
 * connection pooling, SSL, real-time features, and storage configuration
 * optimized for enterprise financial applications.
 * 
 * @version 3.0.0
 * @compliance SOC2, ISO27001, GDPR, SOX
 */

import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { 
  ChartOfAccounts,
  JournalEntry,
  JournalLine,
  PostingRule,
  TrialBalance,
  AccountBalance,
  PaymentTransaction
} from '../entities';

export default registerAs('supabase', () => ({
  // Supabase Project Configuration
  url: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // Database Configuration for TypeORM
  database: {
    type: 'postgres' as const,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'postgres',
    
    // SSL Configuration (required for Supabase)
    ssl: {
      rejectUnauthorized: false,
    },
    
    // Entity configuration
    entities: [
      ChartOfAccounts,
      JournalEntry,
      JournalLine,
      PostingRule,
      TrialBalance,
      AccountBalance,
      PaymentTransaction,
    ],
    
    // Schema and migration settings
    schema: 'public',
    synchronize: process.env.NODE_ENV === 'development' && process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true' ? ['query', 'error', 'warn'] : false,
    logger: 'advanced-console',
    
    // Connection pooling optimized for Supabase
    poolSize: parseInt(process.env.DB_POOL_MAX, 10) || 10,
    connectTimeoutMS: parseInt(process.env.DB_ACQUIRE_TIMEOUT, 10) || 60000,
    acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT, 10) || 60000,
    
    // Performance optimizations
    extra: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
      acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT, 10) || 60000,
      createTimeoutMillis: parseInt(process.env.DB_CREATE_TIMEOUT, 10) || 30000,
      destroyTimeoutMillis: parseInt(process.env.DB_DESTROY_TIMEOUT, 10) || 5000,
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000,
      reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL, 10) || 1000,
      createRetryIntervalMillis: parseInt(process.env.DB_CREATE_RETRY_INTERVAL, 10) || 200,
      propagateCreateError: false,
      // Supabase-specific connection settings
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      statement_timeout: 60000,
      query_timeout: 60000,
      connectionTimeoutMillis: 30000,
    },
    
    // Migration configuration
    migrations: ['dist/database/migrations/*{.ts,.js}'],
    migrationsTableName: 'finance_migrations',
    migrationsRun: process.env.DB_RUN_MIGRATIONS === 'true',
    
    // Performance and caching
    cache: {
      type: 'redis',
      options: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: 0,
        duration: parseInt(process.env.CACHE_DURATION, 10) || 30000,
      },
    },
    
    // Retry configuration for reliability
    retryAttempts: 3,
    retryDelay: 3000,
    autoLoadEntities: false, // Explicitly defined above
    
    // Query optimization
    maxQueryExecutionTime: 30000,
    verboseRetryLog: process.env.NODE_ENV === 'development',
  } as TypeOrmModuleOptions,
  
  // Supabase Realtime Configuration
  realtime: {
    enabled: process.env.SUPABASE_REALTIME_ENABLED === 'true',
    channels: process.env.SUPABASE_REALTIME_CHANNELS?.split(',') || [
      'finance-transactions',
      'payment-updates',
      'journal-entries',
      'account-balances',
      'compliance-events',
    ],
    heartbeatIntervalMs: 30000,
    reconnectIntervalMs: 5000,
    maxReconnectAttempts: 10,
  },
  
  // Supabase Storage Configuration
  storage: {
    bucket: process.env.SUPABASE_STORAGE_BUCKET || 'finance-documents',
    publicUrl: process.env.SUPABASE_STORAGE_PUBLIC_URL,
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/json',
    ],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    folders: {
      invoices: 'invoices',
      receipts: 'receipts',
      statements: 'statements',
      reports: 'reports',
      compliance: 'compliance',
      backups: 'backups',
    },
  },
  
  // Row Level Security Configuration
  rls: {
    enabled: true,
    policies: {
      financeRead: 'finance_read_policy',
      financeWrite: 'finance_write_policy',
      adminAccess: 'admin_access_policy',
    },
  },
  
  // API Configuration
  api: {
    baseUrl: process.env.SUPABASE_URL,
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  },
  
  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '3600',
    enableRLS: true,
    enableAuditLog: true,
    enableEncryption: process.env.DATA_ENCRYPTION === 'true',
    encryptionAlgorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
  },
  
  // Monitoring and Metrics
  monitoring: {
    enableMetrics: true,
    enableHealthChecks: true,
    connectionChecks: {
      interval: 30000, // 30 seconds
      timeout: 5000,   // 5 seconds
    },
    performanceThresholds: {
      queryTimeWarning: 5000,    // 5 seconds
      queryTimeError: 30000,     // 30 seconds
      connectionPoolWarning: 8,  // 80% of max pool
    },
  },
  
  // Backup and Recovery
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true',
    schedule: process.env.BACKUP_FREQUENCY || 'daily',
    retention: parseInt(process.env.BACKUP_RETENTION_DAYS, 10) || 30,
    encryption: process.env.BACKUP_ENCRYPTION === 'true',
  },
  
  // Development and Testing
  development: {
    enableQueryLogging: process.env.NODE_ENV === 'development',
    enableSlowQueryLog: true,
    slowQueryThreshold: 1000, // 1 second
    enableExplainAnalyze: process.env.NODE_ENV === 'development',
  },
}));

/**
 * Factory function to create TypeORM configuration for Supabase
 */
export const createSupabaseTypeOrmConfig = (): TypeOrmModuleOptions => {
  const config = {
    type: 'postgres' as const,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'postgres',
    
    // SSL is required for Supabase
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false,
    } : false,
    
    // Entity registration
    entities: [
      ChartOfAccounts,
      JournalEntry,
      JournalLine,
      PostingRule,
      TrialBalance,
      AccountBalance,
      PaymentTransaction,
    ],
    
    // Schema configuration
    schema: 'public',
    synchronize: false, // Always false in production
    logging: process.env.DB_LOGGING === 'true' ? ['query', 'error', 'warn'] : false,
    
    // Connection pool settings optimized for Supabase
    extra: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
      acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT, 10) || 60000,
      createTimeoutMillis: parseInt(process.env.DB_CREATE_TIMEOUT, 10) || 30000,
      destroyTimeoutMillis: parseInt(process.env.DB_DESTROY_TIMEOUT, 10) || 5000,
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000,
      reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL, 10) || 1000,
      createRetryIntervalMillis: parseInt(process.env.DB_CREATE_RETRY_INTERVAL, 10) || 200,
      keepAlive: true,
    },
    
    // Migration settings
    migrations: ['dist/database/migrations/*{.ts,.js}'],
    migrationsTableName: 'finance_migrations',
    migrationsRun: false, // Run manually in production
    
    // Performance settings
    retryAttempts: 3,
    retryDelay: 3000,
    maxQueryExecutionTime: 30000,
    autoLoadEntities: false,
  };

  return config;
};

/**
 * Supabase client configuration for direct API access
 */
export const supabaseClientConfig = {
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_ANON_KEY,
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'x-application-name': 'industry50-finance-accounting',
      },
    },
  },
};
