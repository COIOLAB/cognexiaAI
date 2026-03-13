import { DataSource } from 'typeorm';
/**
 * Database configuration for TypeORM
 */
export declare const getDatabaseConfig: () => {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl: boolean | {
        rejectUnauthorized: boolean;
    };
    extra: {
        max: number;
        min: number;
        acquireTimeoutMillis: number;
        createTimeoutMillis: number;
        destroyTimeoutMillis: number;
        idleTimeoutMillis: number;
        reapIntervalMillis: number;
        createRetryIntervalMillis: number;
    };
    synchronize: boolean;
    logging: boolean;
    migrationsRun: boolean;
    entities: any[];
    migrations: string[];
    migrationsTableName: string;
    subscribers: string[];
    cli: {
        entitiesDir: string;
        migrationsDir: string;
        subscribersDir: string;
    };
    cache: boolean | {
        type: string;
        options: {
            host: string;
            port: number;
            password: string | undefined;
            db: number;
        };
        duration: number;
    };
};
/**
 * Create and initialize the data source
 */
export declare const AppDataSource: DataSource;
/**
 * Initialize database connection
 */
export declare const initializeDatabase: () => Promise<DataSource>;
/**
 * Close database connection
 */
export declare const closeDatabase: () => Promise<void>;
/**
 * Health check for database connection
 */
export declare const checkDatabaseHealth: () => Promise<boolean>;
/**
 * Get database statistics
 */
export declare const getDatabaseStats: () => Promise<any>;
/**
 * Transaction wrapper utility
 */
export declare const withTransaction: <T>(operation: (manager: any) => Promise<T>) => Promise<T>;
export { AppDataSource as default, AppDataSource, initializeDatabase, closeDatabase, checkDatabaseHealth, getDatabaseStats, withTransaction };
//# sourceMappingURL=database.config.d.ts.map