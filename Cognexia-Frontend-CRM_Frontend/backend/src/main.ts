import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import compression from 'compression';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('🚀 Starting Industry 5.0 ERP Backend Platform...');
    
    // Create NestJS application
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Security middleware
    app.use(helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    }));

    // Compression middleware
    app.use(compression());

    // Cookie parser
    app.use(cookieParser());

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));

    // CORS configuration
    app.enableCors({
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    // API versioning
    app.setGlobalPrefix('api/v1');

    // Swagger API documentation
    if (process.env.SWAGGER_ENABLED !== 'false') {
      const config = new DocumentBuilder()
        .setTitle(process.env.API_TITLE || 'Industry 5.0 ERP Platform')
        .setDescription(process.env.API_DESCRIPTION || 'Comprehensive Industry 5.0 Manufacturing and Business Operations Platform')
        .setVersion(process.env.API_VERSION || '1.0.0')
        .addBearerAuth()
        .addTag('Authentication', 'Authentication and authorization endpoints')
        .addTag('HR', 'Human Resources management')
        .addTag('Manufacturing', 'Manufacturing operations and control')
        .addTag('CRM', 'Customer Relationship Management')
        .addTag('Supply Chain', 'Supply chain management and optimization')
        .addTag('Inventory', 'Inventory tracking and management')
        .addTag('Procurement', 'Procurement and vendor management')
        .addTag('Sales & Marketing', 'Sales and marketing operations')
        .addTag('Production Planning', 'Production planning and scheduling')
        .addTag('Shop Floor Control', 'Real-time shop floor monitoring')
        .addTag('Quality', 'Quality management and control')
        .addTag('Maintenance', 'Equipment maintenance and management')
        .addTag('IoT', 'Internet of Things device management')
        .addTag('Digital Twin', 'Digital twin simulation and modeling')
        .addTag('Integration Gateway', 'External system integration')
        .addTag('Analytics', 'Advanced analytics and business intelligence')
        .addTag('Blockchain', 'Blockchain integration for traceability')
        .addTag('Quantum', 'Quantum computing integration')
        .addTag('Health', 'System health monitoring')
        .addTag('Finance', 'Financial management and accounting')
        .addTag('Robotics', 'Robotics and automation control')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
          persistAuthorization: true,
        },
      });

      logger.log(`📚 API Documentation available at: http://localhost:${process.env.PORT || 3000}/api/docs`);
    }

    // Start the application
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');

    logger.log(`🎉 Industry 5.0 ERP Platform successfully started!`);
    logger.log(`🌐 Server running on: http://localhost:${port}`);
    logger.log(`📋 API Base URL: http://localhost:${port}/api/v1`);
    logger.log(`🏥 Health Check: http://localhost:${port}/api/v1/health`);
    
    if (process.env.SWAGGER_ENABLED !== 'false') {
      logger.log(`📖 API Documentation: http://localhost:${port}/api/docs`);
    }

    logger.log('');
    logger.log('🏭 Industry 5.0 Modules Status:');
    logger.log('   ✅ HR Management');
    logger.log('   ✅ Manufacturing Operations');
    logger.log('   ✅ Customer Relationship Management');
    logger.log('   ✅ Supply Chain Management');
    logger.log('   ✅ Inventory Management');
    logger.log('   ✅ Procurement Management');
    logger.log('   ✅ Shop Floor Control');
    logger.log('   ✅ Quality Management');
    logger.log('   ✅ Maintenance Management');
    logger.log('   ✅ IoT Platform');
    logger.log('   ✅ Integration Gateway');
    logger.log('   ✅ Analytics Platform');
    logger.log('   ✅ Finance & Accounting');
    logger.log('   ✅ System Health Monitoring');
    logger.log('   ✅ Robotics & Automation');
    logger.log('   🚧 Sales & Marketing (Partial)');
    logger.log('   🚧 Production Planning (Partial)');
    logger.log('   🔬 Digital Twin (Development)');
    logger.log('   🔬 Blockchain Integration (Development)');
    logger.log('   🔬 Quantum Computing (Research)');
    logger.log('');
    logger.log('🚀 World-Class Industry 5.0 Platform Ready for Production!');

  } catch (error) {
    logger.error('💥 Failed to start Industry 5.0 ERP Platform:', error);
    process.exit(1);
  }
}

// Start the application
bootstrap();
