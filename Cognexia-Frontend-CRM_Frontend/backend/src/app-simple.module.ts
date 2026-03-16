import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import only the modules that are confirmed working
// We'll start with a subset and gradually add more

@Module({
  imports: [
    // Configuration module (must be first)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
    }),

    // Database connection (PostgreSQL)
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT) || 5432,
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'password',
        database: process.env.POSTGRES_DB || 'industry5_erp',
        ssl: process.env.POSTGRES_SSL === 'true',
        synchronize: process.env.NODE_ENV !== 'production', // Only in development
        logging: process.env.NODE_ENV === 'development',
        entities: [],
        autoLoadEntities: true,
      }),
    }),

    // Health check module
    TerminusModule,
  ],
  controllers: [],
  providers: [
    {
      provide: 'APP_LOGGER',
      useFactory: () => {
        const logger = new Logger('SimpleAppModule');
        logger.log('🏭 Industry 5.0 ERP Platform - Simplified Version');
        logger.log('✅ Configuration loaded');
        logger.log('✅ Database connection configured');
        logger.log('✅ Health check enabled');
        logger.log('🚀 Ready for modular expansion');
        return logger;
      },
    },
  ],
})
export class SimpleAppModule {
  constructor() {
    const logger = new Logger('SimpleAppModule');
    logger.log('🎯 Industry 5.0 ERP Platform - Simplified version initialized');
    logger.log('📈 This is a minimal working version - modules can be added progressively');
  }
}
