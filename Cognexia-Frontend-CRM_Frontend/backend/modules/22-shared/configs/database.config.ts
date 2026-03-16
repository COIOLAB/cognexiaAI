import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

// Import all entities
// NOTE: HR and Inventory modules temporarily disabled as they're not part of Phase 15 CRM focus
// import {
//   // HR Module Entities
//   Employee,
//   Department,
//   Organization,
//   Position,
//   CompensationPlan,
//   EmployeeCompensation,
//   PayrollRecord,
//   PayrollRun,
//   PerformanceReview
// } from '../modules/hr/entities';

// import {
//   // Inventory Module Entities
//   InventoryItem,
//   StockTransaction,
//   StockLocation,
//   CycleCount,
//   InventoryAdjustment,
//   InventoryAlert,
//   ReorderPoint
// } from '../modules/inventory/entities';

// Additional entities from other modules would be imported here
// import { MaintenanceEntity } from '../modules/maintenance/entities';
// import { ManufacturingEntity } from '../modules/manufacturing/entities';

const logger = new Logger('DatabaseConfig');

/**
 * Database configuration for TypeORM
 */
export const getDatabaseConfig = () => {
  const config = {
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'industry5_erp',
    
    // SSL configuration
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    } : false,
    
    // Connection pool settings
    extra: {
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '30000'),
      createTimeoutMillis: parseInt(process.env.DB_CREATE_TIMEOUT || '30000'),
      destroyTimeoutMillis: parseInt(process.env.DB_DESTROY_TIMEOUT || '5000'),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
      reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL || '1000'),
      createRetryIntervalMillis: parseInt(process.env.DB_CREATE_RETRY_INTERVAL || '200'),
    },
    
    // TypeORM settings
    synchronize: process.env.DB_SYNCHRONIZE === 'true' || process.env.NODE_ENV !== 'production',
    logging: process.env.DB_LOGGING === 'true' || process.env.NODE_ENV !== 'production',
    migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
    
    // Entities
    entities: [
      // CRM entities will be loaded from modules/03-CRM/src/entities
      // Auth entities from modules/20-authentication/src/entities
      // Entity auto-discovery will handle loading
    ],
    
    // Migrations
    migrations: [
      'src/database/migrations/**/*.ts'
    ],
    migrationsTableName: 'erp_migrations',
    
    // Subscribers
    subscribers: [
      'src/database/subscribers/**/*.ts'
    ],
    
    // CLI configuration
    cli: {
      entitiesDir: 'src/modules/*/entities',
      migrationsDir: 'src/database/migrations',
      subscribersDir: 'src/database/subscribers',
    },

    // Caching
    cache: process.env.DB_CACHE === 'true' ? {
      type: 'redis',
      options: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
      },
      duration: parseInt(process.env.DB_CACHE_DURATION || '30000') // 30 seconds
    } : false,
  };

  logger.log('Database configuration loaded', {
    type: config.type,
    host: config.host,
    port: config.port,
    database: config.database,
    ssl: !!config.ssl,
    synchronize: config.synchronize,
    logging: config.logging,
    entitiesCount: config.entities.length
  });

  return config;
};

/**
 * Create and initialize the data source
 */
export const AppDataSource = new DataSource({
  ...getDatabaseConfig(),
  type: (process.env.DB_TYPE || 'postgres') as any,
});

/**
 * Initialize database connection
 */
export const initializeDatabase = async (): Promise<DataSource> => {
  try {
    logger.log('Initializing database connection...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.log('Database connection established successfully');
      
      // Run pending migrations if enabled
      if (process.env.DB_MIGRATIONS_RUN === 'true') {
        logger.log('Running pending migrations...');
        await AppDataSource.runMigrations();
        logger.log('Migrations completed successfully');
      }
    }
    
    return AppDataSource;
  } catch (error) {
    logger.error('Failed to initialize database connection:', error.message);
    throw error;
  }
};

/**
 * Close database connection
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.log('Database connection closed successfully');
    }
  } catch (error) {
    logger.error('Failed to close database connection:', error.message);
    throw error;
  }
};

/**
 * Health check for database connection
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    if (!AppDataSource.isInitialized) {
      return false;
    }
    
    // Simple query to check connection
    await AppDataSource.query('SELECT 1');
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error.message);
    return false;
  }
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async (): Promise<any> => {
  try {
    if (!AppDataSource.isInitialized) {
      return null;
    }
    
    const stats = {
      isConnected: AppDataSource.isInitialized,
      driver: AppDataSource.driver.database,
      entities: AppDataSource.entityMetadatas.length,
      migrations: AppDataSource.migrations.length,
    };
    
    // Additional database-specific stats
    if (process.env.DB_TYPE === 'postgres') {
      const result = await AppDataSource.query(`
        SELECT 
          count(*) as total_tables,
          pg_size_pretty(pg_database_size(current_database())) as database_size
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      stats['totalTables'] = result[0]?.total_tables;
      stats['databaseSize'] = result[0]?.database_size;
    }
    
    return stats;
  } catch (error) {
    logger.error('Failed to get database stats:', error.message);
    return null;
  }
};

/**
 * Transaction wrapper utility
 */
export const withTransaction = async <T>(
  operation: (manager: any) => Promise<T>
): Promise<T> => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  
  try {
    const result = await operation(queryRunner.manager);
    await queryRunner.commitTransaction();
    return result;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

// All exports are already declared inline above
export default AppDataSource;
