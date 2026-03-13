import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Controllers
import { ProcurementController } from './procurement.controller';

// Services - Core (Our new comprehensive services)
import { AIProcurementIntelligenceService } from './services/ai-procurement-intelligence.service';
import { SupplierManagementService } from './services/supplier-management.service';
import { SmartContractManagementService } from './services/smart-contract-management.service';
import { RealTimeMarketIntelligenceService } from './services/real-time-market-intelligence.service';
import { AutonomousPurchaseOrderService } from './services/autonomous-purchase-order.service';
import { AnalyticsDashboardService } from './services/analytics-dashboard.service';
import { BlockchainIntegrationService } from './services/blockchain-integration.service';

// Supporting Services
import { SupabaseService } from './services/supabase.service';

// Entities (Our new comprehensive entities)
import { Supplier } from './entities/supplier.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { Contract } from './entities/contract.entity';
import { RFQ } from './entities/rfq.entity';
import { PurchaseRequisition } from './entities/purchase-requisition.entity';
import { Vendor } from './entities/vendor.entity';
import { LineItem } from './entities/line-item.entity';
import { ProcurementCategory } from './entities/procurement-category.entity';
import { SupplierPerformanceMetric } from './entities/supplier-performance-metric.entity';
import { ContractClause } from './entities/contract-clause.entity';
import { Bid } from './entities/bid.entity';
import { ProcurementAlert } from './entities/procurement-alert.entity';
import { DashboardMetric } from './entities/dashboard-metric.entity';
import { CustomReport } from './entities/custom-report.entity';
import { BlockchainTransaction } from './entities/blockchain-transaction.entity';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database - TypeORM with all procurement entities
    TypeOrmModule.forFeature([
      Supplier,
      PurchaseOrder,
      Contract,
      RFQ,
      PurchaseRequisition,
      Vendor,
      LineItem,
      ProcurementCategory,
      SupplierPerformanceMetric,
      ContractClause,
      Bid,
      ProcurementAlert,
      DashboardMetric,
      CustomReport,
      BlockchainTransaction,
      AuditLog,
    ]),

    // Authentication & Authorization
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'procurement_jwt_secret'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '24h'),
        },
      }),
      inject: [ConfigService],
    }),

    // Caching
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ttl: configService.get('CACHE_TTL', 300), // 5 minutes default
        max: configService.get('CACHE_MAX_ITEMS', 1000),
      }),
      inject: [ConfigService],
    }),

    // Background Job Processing
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB', 2), // Separate DB for procurement jobs
        },
        defaultJobOptions: {
          removeOnComplete: 50,
          removeOnFail: 100,
        },
      }),
      inject: [ConfigService],
    }),

    // Queue Registration
    BullModule.registerQueue(
      { name: 'analytics' },
      { name: 'market-intelligence' },
      { name: 'blockchain' },
      { name: 'notifications' },
    ),

    // Event System
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
  ],

  controllers: [ProcurementController],

  providers: [
    // Core Business Logic Services
    AIProcurementIntelligenceService,
    SupplierManagementService,
    SmartContractManagementService,
    RealTimeMarketIntelligenceService,
    AutonomousPurchaseOrderService,
    AnalyticsDashboardService,
    BlockchainIntegrationService,

    // Supporting Services
    SupabaseService,
  ],

  exports: [
    // Export core services for use by other modules
    AIProcurementIntelligenceService,
    SupplierManagementService,
    SmartContractManagementService,
    RealTimeMarketIntelligenceService,
    AutonomousPurchaseOrderService,
    AnalyticsDashboardService,
    BlockchainIntegrationService,
    
    // Export utility services
    SupabaseService,
    
    // Export TypeORM repositories for external access
    TypeOrmModule,
  ],
})
export class ProcurementModule {
  constructor(private configService: ConfigService) {
    // Log module initialization
    console.log('🚀 Procurement Module initialized with features:');
    console.log('  ✅ AI-Powered Intelligence');
    console.log('  ✅ Blockchain Integration');
    console.log('  ✅ Real-time Market Intelligence');
    console.log('  ✅ Autonomous Purchase Orders');
    console.log('  ✅ Advanced Analytics Dashboard');
    console.log('  ✅ Smart Contract Management');
    console.log('  ✅ Comprehensive Supplier Management');
    console.log('  ✅ Background Job Processing');
    console.log('  ✅ Real-time Event System');
    console.log('  ✅ Enterprise Security & Caching');

    // Environment validation
    this.validateEnvironment();
  }

  private validateEnvironment(): void {
    const requiredEnvVars = [
      'DATABASE_HOST',
      'DATABASE_PASSWORD',
      'JWT_SECRET',
    ];

    const optionalEnvVars = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'BLOCKCHAIN_PROVIDER_URL',
      'BLOCKCHAIN_PRIVATE_KEY',
      'REDIS_HOST',
      'OPENAI_API_KEY',
    ];

    // Check required variables
    const missingRequired = requiredEnvVars.filter(
      (varName) => !this.configService.get(varName),
    );

    if (missingRequired.length > 0) {
      console.error('❌ Missing required environment variables:', missingRequired);
      throw new Error(`Missing required environment variables: ${missingRequired.join(', ')}`);
    }

    // Check optional variables and warn
    const missingOptional = optionalEnvVars.filter(
      (varName) => !this.configService.get(varName),
    );

    if (missingOptional.length > 0) {
      console.warn('⚠️  Missing optional environment variables (some features may be limited):', missingOptional);
    }

    // Log configuration status
    console.log('📊 Configuration Status:');
    console.log(`  Database: ${this.configService.get('DATABASE_HOST')}:${this.configService.get('DATABASE_PORT')}`);
    console.log(`  Supabase: ${this.configService.get('SUPABASE_URL') ? 'Configured' : 'Not configured'}`);
    console.log(`  Blockchain: ${this.configService.get('BLOCKCHAIN_PROVIDER_URL') ? 'Configured' : 'Not configured'}`);
    console.log(`  Redis: ${this.configService.get('REDIS_HOST') ? 'Configured' : 'Not configured'}`);
    console.log(`  AI/OpenAI: ${this.configService.get('OPENAI_API_KEY') ? 'Configured' : 'Not configured'}`);
    console.log(`  Environment: ${this.configService.get('NODE_ENV', 'development')}`);
  }
}

// Export commonly used types for external modules
export * from './entities/supplier.entity';
export * from './entities/purchase-order.entity';
export * from './entities/contract.entity';
export * from './entities/rfq.entity';

export * from './services/ai-procurement-intelligence.service';
export * from './services/supplier-management.service';
export * from './services/smart-contract-management.service';
export * from './services/real-time-market-intelligence.service';
export * from './services/autonomous-purchase-order.service';
export * from './services/analytics-dashboard.service';
export * from './services/blockchain-integration.service';
