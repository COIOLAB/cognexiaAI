import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';

// CRM Essential Modules Only (Phase 15 - Super Admin Portal)
import { CRMModule as CrmModule } from '../modules/03-CRM/src/crm.module';
import { AuthModule } from '../modules/20-authentication/src/auth.module';
import { HealthModule } from '../modules/21-health/src/health.module';
import { SharedModule } from '../modules/22-shared/src/shared.module';

@Module({
  imports: [
    // Configuration module (must be first)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
    }),

    // Health check module
    TerminusModule,

    // Shared services (must be imported early)
    SharedModule,

    // Authentication and security
    AuthModule,

    // System health monitoring
    HealthModule,

    // Core CRM Module
    CrmModule,
  ],
  controllers: [],
  providers: [
    {
      provide: 'APP_LOGGER',
      useFactory: () => {
        const logger = new Logger('AppModule');
        logger.log('🏭 CognexiaAI CRM - Super Admin Portal Backend');
        logger.log('📊 CRM Module: Loaded');
        logger.log('🔐 Authentication: Loaded');
        logger.log('🏥 Health Monitoring: Loaded');
        logger.log('🔧 Shared Services: Loaded');
        logger.log('✅ Total Modules: 4 successfully integrated');
        logger.log('🚀 Ready for Phase 15 Super Admin Portal integration');
        return logger;
      },
    },
  ],
})
export class AppModule {
  constructor() {
    const logger = new Logger('AppModule');
    logger.log('🎯 CognexiaAI CRM Backend initialized (Phase 15 - Super Admin Portal)');
  }
}
