/**
 * Jest Test Setup
 * Global mocks, utilities, and configuration for all tests
 */

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/crm_test';

// Global test utilities
global.mockDate = (date: Date | string) => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(date));
};

global.restoreDate = () => {
  jest.useRealTimers();
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global afterEach cleanup
afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});
