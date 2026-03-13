/**
 * Industry 5.0 ERP Shared Module
 * Main entry point for the shared library
 */

// Re-export everything from the src/index.ts
export * from './src/index';

// Additional exports for backward compatibility
export { SharedModule } from './src/shared.module';
export { EventBusService } from './src/services/event-bus.service';
export { LocalStorageService } from './src/services/local-storage.service';
export { LocalEmailService } from './src/services/local-email.service';
export { LocalAIService } from './src/services/local-ai.service';
export { QuantumService } from './src/services/quantum.service';
export { BlockchainService } from './src/services/blockchain.service';

// Export types commonly used
export * from './src/types/index';
