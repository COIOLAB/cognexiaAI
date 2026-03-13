import 'reflect-metadata';
import { testEnvironmentVariables } from './test.config';

// Set test environment variables
Object.entries(testEnvironmentVariables).forEach(([key, value]) => {
  process.env[key] = value;
});

// Global test setup
beforeAll(async () => {
  // Set timezone to UTC for consistent test results
  process.env.TZ = 'UTC';
  
  // Increase timeout for database operations
  jest.setTimeout(30000);
  
  // Mock console methods in tests to reduce noise
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Global test cleanup
afterAll(async () => {
  // Restore console methods
  jest.restoreAllMocks();
});

// Mock Date.now() for consistent testing
const mockDate = new Date('2024-01-15T10:00:00Z');
jest.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());

// Mock crypto.randomUUID for consistent IDs in tests
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomUUID: jest.fn().mockReturnValue('mock-uuid-1234-5678-9012'),
}));

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export {};
