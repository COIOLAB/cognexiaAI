import { NestFactory } from '@nestjs/core';
import { CRMModule } from './crm.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Allow self-signed certs only when using Supabase (URL contains supabase.co). Railway Postgres never needs this.
const dbUrl = process.env.DATABASE_URL || '';
if (dbUrl.includes('supabase.co')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

async function bootstrap() {
  console.log('[CRM] Starting bootstrap...');
  // Log DB config presence (not values) to debug Railway connection issues
  const hasDbUrl = !!process.env.DATABASE_URL;
  const hasDbHost = !!process.env.DATABASE_HOST;
  console.log(`[CRM] Database: ${hasDbUrl ? 'DATABASE_URL set' : 'using host/port'}; host set: ${hasDbHost}`);
  if (process.env.NODE_ENV === 'production' && !hasDbUrl && !hasDbHost) {
    console.error('[CRM] In production you must set DATABASE_URL (e.g. add Reference from Postgres in Railway) or DATABASE_HOST.');
  }
  const isProd = process.env.NODE_ENV === 'production';
  console.log('[CRM] Initializing application (connecting to database)...');
  const app = await NestFactory.create(CRMModule, {
    // In production, only log errors and warnings to avoid Railway rate limits
    logger: isProd ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Global API prefix (exclude health check for Railway)
  app.setGlobalPrefix('api/v1', {
    exclude: ['/', '/health'],
  });

  // Swagger documentation (explicit opt-in)
  if (process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('CRM API')
      .setDescription('Industry 5.0 CRM Module API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, { useGlobalPrefix: true });
  }

  // Enable CORS - include known frontend deployments
  const defaultOrigins = [
    'https://cognexiaai.com',
    'https://www.cognexiaai.com',
    'https://client-admin-portal-five.vercel.app',
    'https://super-admin-portal-ten.vercel.app',
    'http://localhost:3002',
    'http://localhost:3010',
    'http://localhost:3001',
    'http://localhost:3003',
  ];
  const envOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const corsOrigins = [...new Set([...defaultOrigins, ...envOrigins])];
  console.log("[CRM] cors origin", corsOrigins);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-tenant-id'],
  });

  const port = process.env.PORT || 3003;
  await app.listen(port, '0.0.0.0');

  console.log(`\n🚀 CRM Application is running on: http://localhost:${port}/api/v1`);
  console.log('[CRM] Deployment ready. Health: GET / and GET /health');
  if (process.env.ENABLE_SWAGGER === 'true') {
    console.log(`📚 API Documentation: http://localhost:${port}/api/v1/api/docs\n`);
  }
}

bootstrap().catch((err) => {
  console.error('[CRM] Failed to start application:', err?.message || err);
  if (err?.stack) console.error(err.stack);
  process.exit(1);
});
