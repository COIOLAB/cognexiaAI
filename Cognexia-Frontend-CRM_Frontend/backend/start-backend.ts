#!/usr/bin/env ts-node

/**
 * Industry 5.0 ERP Backend Startup Script
 * Comprehensive initialization and startup process
 */

import { Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);
const logger = new Logger('BackendStartup');

interface StartupCheck {
  name: string;
  check: () => Promise<boolean>;
  required: boolean;
}

class BackendStartup {
  private checks: StartupCheck[] = [
    {
      name: 'Node.js Version',
      check: async () => {
        const nodeVersion = process.version;
        const major = parseInt(nodeVersion.slice(1).split('.')[0]);
        const isValid = major >= 18;
        
        if (isValid) {
          logger.log(`✅ Node.js ${nodeVersion} (compatible)`);
        } else {
          logger.error(`❌ Node.js ${nodeVersion} (requires >= 18.0.0)`);
        }
        
        return isValid;
      },
      required: true,
    },
    {
      name: 'Environment Variables',
      check: async () => {
        const requiredEnvVars = ['NODE_ENV', 'PORT'];
        const optionalEnvVars = ['DB_HOST', 'DB_PORT', 'JWT_SECRET'];
        
        let allPresent = true;
        let warnings = 0;
        
        requiredEnvVars.forEach(envVar => {
          if (!process.env[envVar]) {
            logger.error(`❌ Missing required environment variable: ${envVar}`);
            allPresent = false;
          } else {
            logger.log(`✅ ${envVar}: ${envVar === 'JWT_SECRET' ? '[HIDDEN]' : process.env[envVar]}`);
          }
        });
        
        optionalEnvVars.forEach(envVar => {
          if (!process.env[envVar]) {
            logger.warn(`⚠️  Optional environment variable not set: ${envVar}`);
            warnings++;
          } else {
            logger.log(`✅ ${envVar}: ${envVar.includes('SECRET') ? '[HIDDEN]' : process.env[envVar]}`);
          }
        });
        
        if (warnings > 0) {
          logger.warn(`Found ${warnings} optional environment variables not set (using defaults)`);
        }
        
        return allPresent;
      },
      required: true,
    },
    {
      name: 'TypeScript Compilation',
      check: async () => {
        try {
          logger.log('🔄 Checking TypeScript compilation...');
          const { stdout, stderr } = await execAsync('npx tsc --noEmit');
          
          if (stderr && stderr.includes('error TS')) {
            logger.error('❌ TypeScript compilation errors found');
            logger.error(stderr);
            return false;
          }
          
          logger.log('✅ TypeScript compilation successful');
          return true;
        } catch (error) {
          logger.error('❌ TypeScript compilation failed:', error);
          return false;
        }
      },
      required: false, // Non-blocking for development
    },
    {
      name: 'Dependencies',
      check: async () => {
        try {
          const packagePath = path.join(process.cwd(), 'package.json');
          const packageContent = await fs.readFile(packagePath, 'utf-8');
          const packageJson = JSON.parse(packageContent);
          
          const criticalDeps = [
            '@nestjs/core',
            '@nestjs/common',
            '@nestjs/config',
            '@nestjs/typeorm',
            '@nestjs/swagger',
            'typeorm',
            'reflect-metadata',
          ];
          
          let allPresent = true;
          criticalDeps.forEach(dep => {
            if (!packageJson.dependencies?.[dep]) {
              logger.error(`❌ Missing critical dependency: ${dep}`);
              allPresent = false;
            }
          });
          
          if (allPresent) {
            logger.log(`✅ All critical dependencies present (${criticalDeps.length} checked)`);
          }
          
          return allPresent;
        } catch (error) {
          logger.error('❌ Error checking dependencies:', error);
          return false;
        }
      },
      required: true,
    },
    {
      name: 'Module Structure',
      check: async () => {
        const requiredModules = [
          'src/app.module.ts',
          'src/main.ts',
          'modules/20-authentication/src/auth.module.ts',
          'modules/21-health/src/health.module.ts',
          'modules/22-shared/src/shared.module.ts',
        ];
        
        let allPresent = true;
        
        for (const modulePath of requiredModules) {
          try {
            await fs.access(path.join(process.cwd(), modulePath));
            logger.log(`✅ ${modulePath}`);
          } catch {
            logger.error(`❌ Missing module: ${modulePath}`);
            allPresent = false;
          }
        }
        
        return allPresent;
      },
      required: true,
    },
    {
      name: 'Port Availability',
      check: async () => {
        const port = parseInt(process.env.PORT || '3000');
        
        try {
          // Try to create a server on the port to check if it's available
          const net = require('net');
          const server = net.createServer();
          
          return new Promise<boolean>((resolve) => {
            server.listen(port, () => {
              server.close(() => {
                logger.log(`✅ Port ${port} is available`);
                resolve(true);
              });
            });
            
            server.on('error', () => {
              logger.error(`❌ Port ${port} is already in use`);
              resolve(false);
            });
          });
        } catch (error) {
          logger.error(`❌ Error checking port ${port}:`, error);
          return false;
        }
      },
      required: true,
    },
    {
      name: 'Database Connection',
      check: async () => {
        // For now, just check if database environment variables are set
        const dbHost = process.env.DB_HOST;
        const dbPort = process.env.DB_PORT;
        const dbName = process.env.DB_NAME;
        
        if (!dbHost || !dbPort || !dbName) {
          logger.warn('⚠️  Database configuration not complete (using defaults)');
          return true; // Non-blocking for development
        }
        
        logger.log(`✅ Database config: ${dbHost}:${dbPort}/${dbName}`);
        return true;
      },
      required: false,
    },
  ];

  async runPreflightChecks(): Promise<boolean> {
    logger.log('🚀 Starting Industry 5.0 ERP Backend Preflight Checks');
    logger.log('================================================');
    
    let allRequired = true;
    let totalChecks = 0;
    let passedChecks = 0;
    
    for (const check of this.checks) {
      totalChecks++;
      logger.log(`\n🔍 Checking: ${check.name}`);
      
      try {
        const result = await check.check();
        
        if (result) {
          passedChecks++;
        } else if (check.required) {
          allRequired = false;
        }
      } catch (error) {
        logger.error(`💥 Error in check '${check.name}':`, error);
        if (check.required) {
          allRequired = false;
        }
      }
    }
    
    logger.log('\n================================================');
    logger.log(`📊 Preflight Summary: ${passedChecks}/${totalChecks} checks passed`);
    
    if (allRequired) {
      logger.log('✅ All required checks passed - Backend ready to start!');
    } else {
      logger.error('❌ Some required checks failed - Please fix issues before starting');
    }
    
    return allRequired;
  }

  async startBackend(): Promise<void> {
    try {
      logger.log('\n🚀 Starting NestJS Application...');
      logger.log('Press Ctrl+C to stop the server');
      logger.log('================================\n');
      
      // Import and start the application
      const { bootstrap } = await import('./src/main');
      await bootstrap();
    } catch (error) {
      logger.error('💥 Failed to start backend:', error);
      process.exit(1);
    }
  }

  async run(): Promise<void> {
    try {
      const preflightPassed = await this.runPreflightChecks();
      
      if (!preflightPassed) {
        logger.error('\n❌ Preflight checks failed. Please resolve issues before starting.');
        process.exit(1);
      }
      
      await this.startBackend();
    } catch (error) {
      logger.error('💥 Startup failed:', error);
      process.exit(1);
    }
  }
}

// Execute startup if called directly
if (require.main === module) {
  const startup = new BackendStartup();
  startup.run().catch((error) => {
    console.error('Startup script failed:', error);
    process.exit(1);
  });
}

export { BackendStartup };
