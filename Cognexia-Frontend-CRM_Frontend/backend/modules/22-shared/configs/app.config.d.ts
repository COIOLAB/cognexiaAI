/**
 * Application configuration interface
 */
export interface AppConfig {
    port: number;
    env: string;
    nodeEnv: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    corsOrigins: string[];
    database: {
        type: string;
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        ssl: boolean;
        synchronize: boolean;
        logging: boolean;
        migrationsRun: boolean;
        poolMax: number;
        poolMin: number;
    };
    redis: {
        host: string;
        port: number;
        password?: string;
        db: number;
        enabled: boolean;
    };
    email: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        password: string;
        from: string;
        enabled: boolean;
    };
    storage: {
        provider: 'local' | 'aws' | 'azure';
        local: {
            uploadPath: string;
            maxFileSize: number;
        };
        aws?: {
            accessKeyId: string;
            secretAccessKey: string;
            region: string;
            bucket: string;
        };
    };
    rateLimit: {
        windowMs: number;
        max: number;
        skipSuccessfulRequests: boolean;
        skipFailedRequests: boolean;
    };
    logging: {
        level: string;
        enableConsole: boolean;
        enableFile: boolean;
        logDirectory: string;
        maxFiles: number;
        maxSize: string;
    };
    monitoring: {
        enabled: boolean;
        endpoint: string;
        interval: number;
    };
    ai: {
        enabled: boolean;
        provider: 'openai' | 'azure' | 'local';
        openai?: {
            apiKey: string;
            organization?: string;
        };
        azure?: {
            endpoint: string;
            apiKey: string;
        };
    };
    iot: {
        enabled: boolean;
        mqtt: {
            broker: string;
            port: number;
            username?: string;
            password?: string;
        };
        protocols: string[];
    };
    blockchain: {
        enabled: boolean;
        network: string;
        rpcUrl?: string;
        contractAddresses?: Record<string, string>;
    };
    integrations: {
        erp: {
            sap: boolean;
            oracle: boolean;
            microsoft: boolean;
        };
        accounting: {
            quickbooks: boolean;
            sage: boolean;
            netsuite: boolean;
        };
    };
}
/**
 * Load and validate application configuration
 */
export declare const loadAppConfig: () => AppConfig;
/**
 * Get configuration value by path
 */
export declare const getConfigValue: (path: string, defaultValue?: any) => any;
/**
 * Check if feature is enabled
 */
export declare const isFeatureEnabled: (feature: string) => boolean;
/**
 * Get database connection string
 */
export declare const getDatabaseConnectionString: () => string;
/**
 * Environment-specific configurations
 */
export declare const isProduction: () => boolean;
export declare const isDevelopment: () => boolean;
export declare const isTest: () => boolean;
export declare const appConfig: AppConfig;
export default appConfig;
//# sourceMappingURL=app.config.d.ts.map