/**
 * TypeORM Configuration for Finance & Accounting Module
 * 
 * Configuration file for running migrations, seeds, and database operations
 * specifically for the Finance & Accounting module with Supabase integration.
 * 
 * @version 1.0.0
 */

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { ChartOfAccounts } from '../src/entities/chart-of-accounts.entity';
import { JournalEntry } from '../src/entities/journal-entry.entity';
import { JournalLine } from '../src/entities/journal-line.entity';
import { PostingRule } from '../src/entities/posting-rule.entity';
import { TrialBalance } from '../src/entities/trial-balance.entity';
import { AccountBalance } from '../src/entities/account-balance.entity';
import { PaymentTransaction } from '../src/entities/payment-transaction.entity';

// Load environment variables
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'finance_accounting_db',
  
  // SSL configuration for Supabase
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
  } : false,
  
  // Entities
  entities: [
    ChartOfAccounts,
    JournalEntry,
    JournalLine,
    PostingRule,
    TrialBalance,
    AccountBalance,
    PaymentTransaction,
  ],
  
  // Migration settings
  migrations: ['database/migrations/*{.ts,.js}'],
  migrationsTableName: 'finance_migrations',
  
  // Development settings
  synchronize: false, // Always false, use migrations
  logging: process.env.DB_LOGGING === 'true' ? ['query', 'error', 'warn'] : false,
  logger: 'advanced-console',
  
  // Connection pool settings
  extra: {
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    min: parseInt(process.env.DB_POOL_MIN || '2', 10),
    acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000', 10),
    createTimeoutMillis: parseInt(process.env.DB_CREATE_TIMEOUT || '30000', 10),
    destroyTimeoutMillis: parseInt(process.env.DB_DESTROY_TIMEOUT || '5000', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL || '1000', 10),
    keepAlive: true,
  },
});

export default AppDataSource;

// Initialize connection for CLI usage
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => {
      console.log('✅ Data Source has been initialized!');
    })
    .catch((err) => {
      console.error('❌ Error during Data Source initialization:', err);
      process.exit(1);
    });
}
