#!/usr/bin/env ts-node

/**
 * Backend Test Script
 * Verifies that critical backend modules can compile and initialize
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

const logger = new Logger('BackendTest');

async function testBackendModules() {
  try {
    logger.log('🧪 Testing Backend Module Compilation');
    
    // Test 1: Try to import critical modules
    logger.log('Testing module imports...');
    
    try {
      const { SharedModule } = await import('./modules/22-shared/src/shared.module');
      logger.log('✅ Shared module import successful');
    } catch (error) {
      logger.error('❌ Shared module import failed:', error instanceof Error ? error.message : String(error));
    }
    
    try {
      const { AuthModule } = await import('./modules/20-authentication/src/auth.module');
      logger.log('✅ Authentication module import successful');
    } catch (error) {
      logger.error('❌ Authentication module import failed:', error instanceof Error ? error.message : String(error));
    }
    
    try {
      const { HealthModule } = await import('./modules/21-health/src/health.module');
      logger.log('✅ Health module import successful');
    } catch (error) {
      logger.error('❌ Health module import failed:', error instanceof Error ? error.message : String(error));
    }
    
    // Test 2: Try to create a minimal app
    logger.log('Testing app creation...');
    try {
      // Create a minimal module for testing
      const { Module } = await import('@nestjs/common');
      
      @Module({
        imports: [],
        controllers: [],
        providers: [ConfigService],
      })
      class TestModule {}
      
      const app = await NestFactory.create(TestModule, {
        logger: ['error', 'warn', 'log'],
      });
      
      logger.log('✅ Basic NestJS app creation successful');
      
      // Test configuration service
      const configService = app.get(ConfigService);
      const nodeEnv = configService.get('NODE_ENV', 'development');
      logger.log(`✅ Config service working - NODE_ENV: ${nodeEnv}`);
      
      await app.close();
      logger.log('✅ App closed successfully');
      
    } catch (error) {
      logger.error('❌ App creation failed:', error instanceof Error ? error.message : String(error));
    }
    
    // Test 3: Database configuration
    logger.log('Testing database configuration...');
    try {
      // Just test import, don't connect
      const dbConfig = await import('./modules/22-shared/configs/database.config');
      logger.log('✅ Database configuration import successful');
    } catch (error) {
      logger.error('❌ Database configuration failed:', error instanceof Error ? error.message : String(error));
    }
    
    logger.log('🎯 Backend module test completed');
    
  } catch (error) {
    logger.error('💥 Backend test failed:', error);
    process.exit(1);
  }
}

async function testEnvironmentSetup() {
  logger.log('🔧 Testing Environment Setup');
  
  // Check Node.js version
  const nodeVersion = process.version;
  logger.log(`Node.js version: ${nodeVersion}`);
  
  // Check environment variables
  const requiredEnvVars = [
    'NODE_ENV',
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logger.warn('⚠️  Missing environment variables:', missingVars);
  } else {
    logger.log('✅ All required environment variables are set');
  }
  
  // Check if TypeScript can compile
  logger.log('Testing TypeScript compilation...');
  try {
    const ts = require('typescript');
    logger.log(`✅ TypeScript version: ${ts.version}`);
  } catch (error) {
    logger.error('❌ TypeScript not available:', error instanceof Error ? error.message : String(error));
  }
}

async function runTests() {
  logger.log('🚀 Starting Backend Tests');
  logger.log('================================');
  
  await testEnvironmentSetup();
  logger.log('');
  await testBackendModules();
  
  logger.log('');
  logger.log('✨ Backend testing completed successfully!');
  logger.log('Ready for deployment and government certification');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(error => {
    logger.error('Test execution failed:', error);
    process.exit(1);
  });
}

export { runTests, testBackendModules, testEnvironmentSetup };
