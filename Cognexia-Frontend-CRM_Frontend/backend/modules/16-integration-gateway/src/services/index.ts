// Integration Gateway Services Export
// Central export point for all integration gateway services

// Import API Connection Service
export { APIConnectionService } from './api-connection.service';

// Export all services from bundles
export * from './integration-services-bundle';

// Placeholder exports for compatibility (conditional exports)
export const IntegrationGatewayService = class {
  async initialize() { return Promise.resolve(); }
  async connect() { return Promise.resolve(); }
  async disconnect() { return Promise.resolve(); }
};

export const IntegrationGatewayManager = class {
  async initialize() { return Promise.resolve(); }
  async start() { return Promise.resolve(); }
  async stop() { return Promise.resolve(); }
  async getStatus() { return { status: 'active' }; }
};
