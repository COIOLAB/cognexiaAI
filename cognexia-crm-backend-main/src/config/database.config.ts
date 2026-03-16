import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const useSupabase = process.env.USE_SUPABASE === 'true';
  const environment = process.env.NODE_ENV || 'development';

  // Common configuration
  const commonConfig: Partial<TypeOrmModuleOptions> = {
    type: 'postgres',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: environment === 'development', // Auto-create tables in development
    logging: environment === 'development' ? ['query', 'error', 'warn', 'schema'] : false, // Enable all logs
    ssl: useSupabase ? { rejectUnauthorized: false } : false,
  };

  if (useSupabase) {
    // Supabase Configuration
    return {
      ...commonConfig,
      url: process.env.SUPABASE_DATABASE_URL,
      // Supabase uses pooling
      extra: {
        max: 10, // Connection pool size
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      },
    } as TypeOrmModuleOptions;
  } else {
    // Local PostgreSQL Configuration
    return {
      ...commonConfig,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'cognexia_crm',
    } as TypeOrmModuleOptions;
  }
};

// Dual-write configuration for hybrid approach
export class HybridDatabaseConfig {
  static getReplicationConfig() {
    return {
      replication: {
        master: {
          // Primary database (local)
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'root',
          database: process.env.DB_NAME || 'cognexia_crm',
        },
        slaves: [
          {
            // Replica database (Supabase)
            host: process.env.SUPABASE_DB_HOST,
            port: 5432,
            username: 'postgres',
            password: process.env.SUPABASE_DB_PASSWORD,
            database: 'postgres',
          },
        ],
      },
    };
  }
}
