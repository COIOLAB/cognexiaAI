"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.withTransaction = exports.getDatabaseStats = exports.checkDatabaseHealth = exports.closeDatabase = exports.initializeDatabase = exports.AppDataSource = exports.getDatabaseConfig = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
// Import all entities
const entities_1 = require("../modules/hr/entities");
const entities_2 = require("../modules/inventory/entities");
// Additional entities from other modules would be imported here
// import { MaintenanceEntity } from '../modules/maintenance/entities';
// import { ManufacturingEntity } from '../modules/manufacturing/entities';
const logger = new common_1.Logger('DatabaseConfig');
/**
 * Database configuration for TypeORM
 */
const getDatabaseConfig = () => {
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
            // HR Module
            entities_1.Employee,
            entities_1.Department,
            entities_1.Organization,
            entities_1.Position,
            entities_1.CompensationPlan,
            entities_1.EmployeeCompensation,
            entities_1.PayrollRecord,
            entities_1.PayrollRun,
            entities_1.PerformanceReview,
            // Inventory Module
            entities_2.InventoryItem,
            entities_2.StockTransaction,
            entities_2.StockLocation,
            entities_2.CycleCount,
            entities_2.InventoryAdjustment,
            entities_2.InventoryAlert,
            entities_2.ReorderPoint,
            // Add other module entities as they are created
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
exports.getDatabaseConfig = getDatabaseConfig;
/**
 * Create and initialize the data source
 */
exports.AppDataSource = new typeorm_1.DataSource({
    ...(0, exports.getDatabaseConfig)(),
    type: (process.env.DB_TYPE || 'postgres'),
});
exports.default = exports.AppDataSource;
/**
 * Initialize database connection
 */
const initializeDatabase = async () => {
    try {
        logger.log('Initializing database connection...');
        if (!exports.AppDataSource.isInitialized) {
            await exports.AppDataSource.initialize();
            logger.log('Database connection established successfully');
            // Run pending migrations if enabled
            if (process.env.DB_MIGRATIONS_RUN === 'true') {
                logger.log('Running pending migrations...');
                await exports.AppDataSource.runMigrations();
                logger.log('Migrations completed successfully');
            }
        }
        return exports.AppDataSource;
    }
    catch (error) {
        logger.error('Failed to initialize database connection:', error.message);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
/**
 * Close database connection
 */
const closeDatabase = async () => {
    try {
        if (exports.AppDataSource.isInitialized) {
            await exports.AppDataSource.destroy();
            logger.log('Database connection closed successfully');
        }
    }
    catch (error) {
        logger.error('Failed to close database connection:', error.message);
        throw error;
    }
};
exports.closeDatabase = closeDatabase;
/**
 * Health check for database connection
 */
const checkDatabaseHealth = async () => {
    try {
        if (!exports.AppDataSource.isInitialized) {
            return false;
        }
        // Simple query to check connection
        await exports.AppDataSource.query('SELECT 1');
        return true;
    }
    catch (error) {
        logger.error('Database health check failed:', error.message);
        return false;
    }
};
exports.checkDatabaseHealth = checkDatabaseHealth;
/**
 * Get database statistics
 */
const getDatabaseStats = async () => {
    try {
        if (!exports.AppDataSource.isInitialized) {
            return null;
        }
        const stats = {
            isConnected: exports.AppDataSource.isInitialized,
            driver: exports.AppDataSource.driver.database,
            entities: exports.AppDataSource.entityMetadatas.length,
            migrations: exports.AppDataSource.migrations.length,
        };
        // Additional database-specific stats
        if (process.env.DB_TYPE === 'postgres') {
            const result = await exports.AppDataSource.query(`
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
    }
    catch (error) {
        logger.error('Failed to get database stats:', error.message);
        return null;
    }
};
exports.getDatabaseStats = getDatabaseStats;
/**
 * Transaction wrapper utility
 */
const withTransaction = async (operation) => {
    const queryRunner = exports.AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const result = await operation(queryRunner.manager);
        await queryRunner.commitTransaction();
        return result;
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
    }
    finally {
        await queryRunner.release();
    }
};
exports.withTransaction = withTransaction;
//# sourceMappingURL=database.config.js.map