/**
 * Shared Module Index
 * Provides clean exports for shared services, utilities, middleware, and types
 */

// Export all shared services - using named exports to avoid conflicts
export { AIService } from './services/ai.service';
export { AuditService } from './services/audit.service';
export { CacheService } from './services/cache.service';
export { MLService } from './services/ml.service';
export { NLPService } from './services/nlp.service';
export { LocalAIService } from './services/local-ai.service';
export { LocalEmailService } from './services/local-email.service';
export { LocalStorageService } from './services/local-storage.service';

// Export Industry 5.0 advanced services - using named exports
export { EventBusService, Industry5EventType } from './services/event-bus.service';
export { QuantumService } from './services/quantum.service';
export { BlockchainService } from './services/blockchain.service';

// Export shared middleware
export * from './middleware/core-auth.middleware';
export * from './middleware/validation.middleware';

// Export shared controllers
export * from './controllers/BaseController';
export * from './controllers/files.controller';

// Export shared utilities
export * from './utils/error-handler.util';
export * from './utils/validation.util';
export * from './utils/api-response.util';

// Export all shared types
export * from './types';

// Export shared module
export { SharedModule } from './shared.module';
