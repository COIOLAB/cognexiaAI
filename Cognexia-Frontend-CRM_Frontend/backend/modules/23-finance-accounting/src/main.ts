/**
 * Finance & Accounting Module - Bootstrap Application
 * 
 * Standalone bootstrap for running the Finance & Accounting module
 * as an independent microservice with full NestJS capabilities.
 * 
 * @version 3.0.0
 * @author Industry 5.0 ERP Team
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { FinanceAccountingModule } from './finance-accounting.module';

async function bootstrap() {
  const logger = new Logger('FinanceAccountingBootstrap');
  
  try {
    // Create NestJS application
    const app = await NestFactory.create(FinanceAccountingModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Global prefix for all routes
    app.setGlobalPrefix('api/v1/finance');

    // Enable CORS for cross-origin requests
    app.enableCors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Swagger API documentation
    const config = new DocumentBuilder()
      .setTitle('Finance & Accounting API')
      .setDescription(
        'Industry 5.0 ERP Finance & Accounting Module - ' +
        'Comprehensive financial management with AI-powered analytics, ' +
        'real-time processing, and enterprise-grade compliance features.'
      )
      .setVersion('3.0.0')
      .addTag('finance', 'Financial operations and management')
      .addTag('accounting', 'Accounting and bookkeeping operations')
      .addTag('payments', 'Payment processing and management')
      .addTag('analytics', 'Financial analytics and reporting')
      .addTag('compliance', 'Compliance and audit features')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addServer('http://localhost:3000', 'Development Server')
      .addServer('https://api.industry50.com', 'Production Server')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    // Get port from environment or use default
    const port = process.env.PORT || 3000;
    
    // Start the server
    await app.listen(port);
    
    logger.log(`🚀 Finance & Accounting Module is running on: http://localhost:${port}`);
    logger.log(`📚 API Documentation is available at: http://localhost:${port}/api/docs`);
    logger.log(`🏭 Industry 5.0 ERP - Enterprise Financial Management System`);
    logger.log(`💼 Features: AI Analytics, Real-time Processing, Compliance Ready`);

  } catch (error) {
    logger.error('❌ Failed to start Finance & Accounting Module:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger('UnhandledRejection');
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  const logger = new Logger('UncaughtException');
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  const logger = new Logger('Shutdown');
  logger.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  const logger = new Logger('Shutdown');
  logger.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Bootstrap the application
bootstrap();
