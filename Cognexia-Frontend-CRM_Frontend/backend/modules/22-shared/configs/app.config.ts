import { Logger } from '@nestjs/common';

const logger = new Logger('AppConfig');

/**
 * Application configuration interface
 */
export interface AppConfig {
  // Server configuration
  port: number;
  env: string;
  nodeEnv: string;
  
  // Security
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigins: string[];
  
  // Database
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
  
  // Redis configuration
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    enabled: boolean;
  };
  
  // Email configuration
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
    enabled: boolean;
  };
  
  // File storage
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
  
  // Rate limiting
  rateLimit: {
    windowMs: number;
    max: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
  };
  
  // Logging
  logging: {
    level: string;
    enableConsole: boolean;
    enableFile: boolean;
    logDirectory: string;
    maxFiles: number;
    maxSize: string;
  };
  
  // Monitoring & Health
  monitoring: {
    enabled: boolean;
    endpoint: string;
    interval: number;
  };
  
  // AI & ML Services
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
  
  // IoT & Industry 4.0
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
  
  // Blockchain integration
  blockchain: {
    enabled: boolean;
    network: string;
    rpcUrl?: string;
    contractAddresses?: Record<string, string>;
  };
  
  // Third-party integrations
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
export const loadAppConfig = (): AppConfig => {
  const config: AppConfig = {
    // Server configuration
    port: parseInt(process.env.PORT || '3000'),
    env: process.env.NODE_ENV || 'development',
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Security
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:3001'],
    
    // Database configuration
    database: {
      type: process.env.DB_TYPE || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'industry5_erp',
      ssl: process.env.DB_SSL === 'true',
      synchronize: process.env.DB_SYNCHRONIZE === 'true' || process.env.NODE_ENV !== 'production',
      logging: process.env.DB_LOGGING === 'true' || process.env.NODE_ENV !== 'production',
      migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
      poolMax: parseInt(process.env.DB_POOL_MAX || '10'),
      poolMin: parseInt(process.env.DB_POOL_MIN || '2'),
    },
    
    // Redis configuration
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      enabled: process.env.REDIS_ENABLED === 'true',
    },
    
    // Email configuration
    email: {
      host: process.env.EMAIL_HOST || 'localhost',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      user: process.env.EMAIL_USER || '',
      password: process.env.EMAIL_PASSWORD || '',
      from: process.env.EMAIL_FROM || 'noreply@industry5erp.com',
      enabled: process.env.EMAIL_ENABLED === 'true',
    },
    
    // Storage configuration
    storage: {
      provider: (process.env.STORAGE_PROVIDER || 'local') as 'local' | 'aws' | 'azure',
      local: {
        uploadPath: process.env.STORAGE_LOCAL_PATH || './uploads',
        maxFileSize: parseInt(process.env.STORAGE_MAX_FILE_SIZE || '10485760'), // 10MB
      },
      aws: process.env.AWS_ACCESS_KEY_ID ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        region: process.env.AWS_REGION || 'us-east-1',
        bucket: process.env.AWS_S3_BUCKET!,
      } : undefined,
    },
    
    // Rate limiting
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true',
      skipFailedRequests: process.env.RATE_LIMIT_SKIP_FAILED === 'false',
    },
    
    // Logging configuration
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      enableConsole: process.env.LOG_CONSOLE !== 'false',
      enableFile: process.env.LOG_FILE === 'true',
      logDirectory: process.env.LOG_DIRECTORY || './logs',
      maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
      maxSize: process.env.LOG_MAX_SIZE || '10m',
    },
    
    // Monitoring configuration
    monitoring: {
      enabled: process.env.MONITORING_ENABLED === 'true',
      endpoint: process.env.MONITORING_ENDPOINT || '/health',
      interval: parseInt(process.env.MONITORING_INTERVAL || '30000'), // 30 seconds
    },
    
    // AI & ML configuration
    ai: {
      enabled: process.env.AI_ENABLED === 'true',
      provider: (process.env.AI_PROVIDER || 'openai') as 'openai' | 'azure' | 'local',
      openai: process.env.OPENAI_API_KEY ? {
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORGANIZATION,
      } : undefined,
      azure: process.env.AZURE_AI_ENDPOINT ? {
        endpoint: process.env.AZURE_AI_ENDPOINT,
        apiKey: process.env.AZURE_AI_API_KEY!,
      } : undefined,
    },
    
    // IoT configuration
    iot: {
      enabled: process.env.IOT_ENABLED === 'true',
      mqtt: {
        broker: process.env.MQTT_BROKER || 'mqtt://localhost',
        port: parseInt(process.env.MQTT_PORT || '1883'),
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
      },
      protocols: process.env.IOT_PROTOCOLS ? process.env.IOT_PROTOCOLS.split(',') : ['mqtt', 'http', 'opcua'],
    },
    
    // Blockchain configuration
    blockchain: {
      enabled: process.env.BLOCKCHAIN_ENABLED === 'true',
      network: process.env.BLOCKCHAIN_NETWORK || 'ethereum',
      rpcUrl: process.env.BLOCKCHAIN_RPC_URL,
      contractAddresses: process.env.BLOCKCHAIN_CONTRACTS ? JSON.parse(process.env.BLOCKCHAIN_CONTRACTS) : undefined,
    },
    
    // Integration configuration
    integrations: {
      erp: {
        sap: process.env.INTEGRATION_SAP === 'true',
        oracle: process.env.INTEGRATION_ORACLE === 'true',
        microsoft: process.env.INTEGRATION_MICROSOFT === 'true',
      },
      accounting: {
        quickbooks: process.env.INTEGRATION_QUICKBOOKS === 'true',
        sage: process.env.INTEGRATION_SAGE === 'true',
        netsuite: process.env.INTEGRATION_NETSUITE === 'true',
      },
    },
  };
  
  // Validate required configurations
  validateConfiguration(config);
  
  // Log configuration (without sensitive information)
  logConfiguration(config);
  
  return config;
};

/**
 * Validate critical configuration values
 */
const validateConfiguration = (config: AppConfig): void => {
  const errors: string[] = [];
  
  // Validate JWT secret in production
  if (config.nodeEnv === 'production' && config.jwtSecret === 'your-super-secret-jwt-key-change-in-production') {
    errors.push('JWT_SECRET must be changed in production environment');
  }
  
  // Validate database configuration
  if (!config.database.host || !config.database.username || !config.database.database) {
    errors.push('Database configuration is incomplete');
  }
  
  // Validate email configuration if enabled
  if (config.email.enabled && (!config.email.host || !config.email.user)) {
    errors.push('Email configuration is incomplete when email is enabled');
  }
  
  // Validate AI configuration if enabled
  if (config.ai.enabled) {
    if (config.ai.provider === 'openai' && !config.ai.openai?.apiKey) {
      errors.push('OpenAI API key is required when AI is enabled with OpenAI provider');
    }
    if (config.ai.provider === 'azure' && (!config.ai.azure?.endpoint || !config.ai.azure?.apiKey)) {
      errors.push('Azure AI configuration is incomplete when AI is enabled with Azure provider');
    }
  }
  
  if (errors.length > 0) {
    logger.error('Configuration validation failed:', errors.join(', '));
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
  }
};

/**
 * Log configuration without sensitive information
 */
const logConfiguration = (config: AppConfig): void => {
  const safeConfig = {
    port: config.port,
    env: config.env,
    database: {
      type: config.database.type,
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      ssl: config.database.ssl,
    },
    redis: {
      host: config.redis.host,
      port: config.redis.port,
      enabled: config.redis.enabled,
    },
    storage: {
      provider: config.storage.provider,
    },
    ai: {
      enabled: config.ai.enabled,
      provider: config.ai.enabled ? config.ai.provider : undefined,
    },
    iot: {
      enabled: config.iot.enabled,
    },
    blockchain: {
      enabled: config.blockchain.enabled,
      network: config.blockchain.enabled ? config.blockchain.network : undefined,
    },
  };
  
  logger.log('Application configuration loaded successfully', safeConfig);
};

/**
 * Get configuration value by path
 */
export const getConfigValue = (path: string, defaultValue?: any): any => {
  const config = loadAppConfig();
  return path.split('.').reduce((obj, key) => obj?.[key], config) ?? defaultValue;
};

/**
 * Check if feature is enabled
 */
export const isFeatureEnabled = (feature: string): boolean => {
  const featureMap: Record<string, () => boolean> = {
    'redis': () => loadAppConfig().redis.enabled,
    'email': () => loadAppConfig().email.enabled,
    'ai': () => loadAppConfig().ai.enabled,
    'iot': () => loadAppConfig().iot.enabled,
    'blockchain': () => loadAppConfig().blockchain.enabled,
    'monitoring': () => loadAppConfig().monitoring.enabled,
  };
  
  return featureMap[feature]?.() || false;
};

/**
 * Get database connection string
 */
export const getDatabaseConnectionString = (): string => {
  const { database } = loadAppConfig();
  const ssl = database.ssl ? '?ssl=true' : '';
  return `${database.type}://${database.username}:${database.password}@${database.host}:${database.port}/${database.database}${ssl}`;
};

/**
 * Environment-specific configurations
 */
export const isProduction = (): boolean => process.env.NODE_ENV === 'production';
export const isDevelopment = (): boolean => process.env.NODE_ENV === 'development';
export const isTest = (): boolean => process.env.NODE_ENV === 'test';

// Export the loaded configuration
export const appConfig = loadAppConfig();

export default appConfig;
