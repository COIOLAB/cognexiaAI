/**
 * Test Utilities and Helpers
 * Common test utilities for Finance & Accounting Module
 */

import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';

/**
 * Create a test database configuration
 */
export const getTestDatabaseConfig = () => ({
  type: 'postgres' as const,
  host: process.env.TEST_DB_HOST || 'localhost',
  port: parseInt(process.env.TEST_DB_PORT || '5432'),
  username: process.env.TEST_DB_USERNAME || 'postgres',
  password: process.env.TEST_DB_PASSWORD || 'postgres',
  database: process.env.TEST_DB_NAME || 'finance_test',
  entities: ['src/entities/**/*.entity.ts'],
  synchronize: true, // Auto-create schema for tests
  dropSchema: true, // Clean database before each test run
  logging: false,
});

/**
 * Create a test module with common dependencies
 */
export async function createTestModule(
  providers: any[] = [],
  imports: any[] = [],
): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
      }),
      EventEmitterModule.forRoot(),
      CacheModule.register({
        isGlobal: true,
        ttl: 60,
      }),
      ...imports,
    ],
    providers,
  }).compile();
}

/**
 * Mock repository factory
 */
export function createMockRepository() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
      getManyAndCount: jest.fn(),
      execute: jest.fn(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      having: jest.fn().mockReturnThis(),
    })),
  };
}

/**
 * Mock event emitter
 */
export function createMockEventEmitter() {
  return {
    emit: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  };
}

/**
 * Mock cache manager
 */
export function createMockCacheManager() {
  return {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    reset: jest.fn(),
  };
}

/**
 * Mock configuration service
 */
export function createMockConfigService(config: Record<string, any> = {}) {
  return {
    get: jest.fn((key: string, defaultValue?: any) => {
      return config[key] ?? defaultValue;
    }),
    getOrThrow: jest.fn((key: string) => {
      if (!(key in config)) {
        throw new Error(`Configuration key ${key} not found`);
      }
      return config[key];
    }),
  };
}

/**
 * Wait for promises to resolve
 */
export const waitForAsync = () => new Promise(resolve => setImmediate(resolve));

/**
 * Create a mock user context
 */
export function createMockUser(overrides: Partial<any> = {}) {
  return {
    userId: 'test-user-id',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['finance_user'],
    permissions: ['finance:read', 'finance:write'],
    ...overrides,
  };
}

/**
 * Create a mock execution context for guards
 */
export function createMockExecutionContext(request: any = {}) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user: createMockUser(),
        headers: {},
        params: {},
        query: {},
        body: {},
        ...request,
      }),
      getResponse: () => ({
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  };
}

/**
 * Generate random test data
 */
export function generateRandomString(length: number = 10): string {
  return Math.random().toString(36).substring(2, length + 2);
}

export function generateRandomNumber(min: number = 0, max: number = 1000): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRandomDate(daysOffset: number = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date;
}

/**
 * Decimal helper for testing
 */
export function toDecimal(value: number | string): string {
  return typeof value === 'number' ? value.toFixed(2) : value;
}

/**
 * Test data validators
 */
export function expectValidUUID(value: string): void {
  expect(value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
}

export function expectValidDate(value: any): void {
  expect(value).toBeInstanceOf(Date);
  expect(value.getTime()).not.toBeNaN();
}

export function expectValidDecimal(value: any): void {
  expect(typeof value).toBe('string');
  expect(parseFloat(value)).not.toBeNaN();
}

/**
 * Database test helpers
 */
export async function clearDatabase(repositories: any[]): Promise<void> {
  for (const repository of repositories) {
    await repository.query('TRUNCATE TABLE "chart_accounts" CASCADE');
    await repository.query('TRUNCATE TABLE "journal_entries" CASCADE');
    await repository.query('TRUNCATE TABLE "journal_lines" CASCADE');
  }
}

/**
 * Error assertion helpers
 */
export function expectToThrowBadRequest(fn: () => Promise<any>): Promise<void> {
  return expect(fn()).rejects.toThrow();
}

export function expectToThrowNotFound(fn: () => Promise<any>): Promise<void> {
  return expect(fn()).rejects.toThrow();
}

/**
 * Performance testing helper
 */
export async function measureExecutionTime(
  fn: () => Promise<any>,
): Promise<{ result: any; duration: number }> {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;
  return { result, duration };
}

/**
 * Retry helper for flaky tests
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 100,
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}
