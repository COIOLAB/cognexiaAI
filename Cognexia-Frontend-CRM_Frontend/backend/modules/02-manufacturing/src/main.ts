// Standalone Manufacturing Module Test Application
// This file is used to test the manufacturing module independently
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ManufacturingModule } from './manufacturing.module';

async function bootstrap() {
  try {
    console.log('🏭 Starting Manufacturing Module Test Application...');
    
    const app = await NestFactory.create(ManufacturingModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
    }));

    // CORS configuration
    app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    // API prefix
    app.setGlobalPrefix('api/v1');

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Manufacturing Module API')
      .setDescription('Industry 5.0 Manufacturing Execution System API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('manufacturing', 'Manufacturing operations')
      .addTag('production', 'Production management')
      .addTag('quality', 'Quality control')
      .addTag('iot', 'IoT device management')
      .addTag('digital-twin', 'Digital twin operations')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.MANUFACTURING_PORT || 3002;
    await app.listen(port);

    console.log(`🚀 Manufacturing Module is running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    console.log('✅ Manufacturing Module started successfully!');

  } catch (error) {
    console.error('❌ Failed to start Manufacturing Module:', error);
    process.exit(1);
  }
}

// Export bootstrap function for testing
export { bootstrap };

// Run if this file is executed directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
  bootstrap();
}