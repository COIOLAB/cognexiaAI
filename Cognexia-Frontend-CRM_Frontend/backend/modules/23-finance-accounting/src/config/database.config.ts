/**
 * Database Configuration for Finance & Accounting Module
 * 
 * Enterprise-grade database configuration with connection pooling,
 * SSL support, migration management, and performance optimization
 * for high-volume financial transaction processing.
 */

import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  name: process.env.DB_NAME || 'industry50_finance',
  synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
  logging: process.env.DB_LOGGING === 'true' || false,
  ssl: process.env.DB_SSL === 'true' || false,
  
  // Connection pooling for high performance
  extra: {
    max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
    min: parseInt(process.env.DB_POOL_MIN, 10) || 5,
    acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT, 10) || 60000,
    createTimeoutMillis: parseInt(process.env.DB_CREATE_TIMEOUT, 10) || 30000,
    destroyTimeoutMillis: parseInt(process.env.DB_DESTROY_TIMEOUT, 10) || 5000,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000,
    reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL, 10) || 1000,
    createRetryIntervalMillis: parseInt(process.env.DB_CREATE_RETRY_INTERVAL, 10) || 200,
    propagateCreateError: false,
  },

  // Migration settings
  migrations: {
    run: process.env.DB_RUN_MIGRATIONS === 'true' || false,
    tableName: 'finance_migrations',
    transactionPerMigration: true,
  },

  // Cache settings for query optimization
  cache: {
    type: 'redis',
    options: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      password: process.env.REDIS_PASSWORD,
      duration: parseInt(process.env.CACHE_DURATION, 10) || 30000, // 30 seconds
    },
  },

  // Replica configuration for read scaling
  replication: {
    master: {
      host: process.env.DB_MASTER_HOST || process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_MASTER_PORT, 10) || parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_MASTER_USERNAME || process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_MASTER_PASSWORD || process.env.DB_PASSWORD || 'password',
      database: process.env.DB_MASTER_NAME || process.env.DB_NAME || 'industry50_finance',
    },
    slaves: [
      {
        host: process.env.DB_SLAVE_HOST || process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_SLAVE_PORT, 10) || parseInt(process.env.DB_PORT, 10) || 5432,
        username: process.env.DB_SLAVE_USERNAME || process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_SLAVE_PASSWORD || process.env.DB_PASSWORD || 'password',
        database: process.env.DB_SLAVE_NAME || process.env.DB_NAME || 'industry50_finance',
      },
    ],
  },
}));
