import { Module, Global, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';

// Import all services
import { LocalStorageService } from './services/local-storage.service';
import { LocalEmailService } from './services/local-email.service';
import { LocalAIService } from './services/local-ai.service';
import { EventBusService } from './services/event-bus.service';
import { QuantumService } from './services/quantum.service';
import { BlockchainService } from './services/blockchain.service';

// Import controllers
import { FilesController } from './controllers/files.controller';

const logger = new Logger('SharedModule');

@Global()
@Module({
  imports: [
    // Configuration
    ConfigModule,
    
    // Event system
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
    
    // File upload
    MulterModule.register({
      dest: './storage/uploads',
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
      },
    }),
    
    // Queue management (conditional based on Redis availability)
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT, 10) || 6379,
          password: process.env.REDIS_PASSWORD,
        },
      }),
    }),
    
    // Caching
    CacheModule.register({
      ttl: 300, // 5 minutes default TTL
      max: 1000, // Maximum number of items in cache
      isGlobal: true,
    }),
  ],
  controllers: [
    FilesController,
  ],
  providers: [
    // Core services
    LocalStorageService,
    LocalEmailService,
    LocalAIService,
    
    // Industry 5.0 advanced services
    EventBusService,
    QuantumService,
    BlockchainService,
  ],
  exports: [
    // Export all services for use in other modules
    LocalStorageService,
    LocalEmailService,
    LocalAIService,
    EventBusService,
    QuantumService,
    BlockchainService,
    
    // Export modules for re-use
    ConfigModule,
    EventEmitterModule,
    CacheModule,
  ],
})
export class SharedModule {
  constructor() {
    logger.log('🔧 Industry 5.0 Shared Module Initialized');
    logger.log('Services: Event Bus, Quantum Computing, Blockchain, AI, Storage');
    logger.log('Features: Real-time Events, Quantum Algorithms, Distributed Ledger');
  }
}
