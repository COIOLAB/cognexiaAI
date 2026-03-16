import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface SwaggerConfig {
  enabled: boolean;
  title: string;
  description: string;
  version: string;
  path: string;
  contactEmail: string;
  licenseUrl: string;
  externalDocUrl: string;
  servers: Array<{
    url: string;
    description: string;
  }>;
  security: {
    bearerAuth: boolean;
    apiKey: boolean;
    oauth2: boolean;
  };
}

export class SwaggerConfigService {
  private readonly config: SwaggerConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      enabled: this.configService.get<boolean>('SWAGGER_ENABLED', true),
      title: 'Industry 5.0 Inventory Management API',
      description: this.getApiDescription(),
      version: this.configService.get<string>('API_VERSION', '1.0.0'),
      path: this.configService.get<string>('SWAGGER_PATH', 'api/docs'),
      contactEmail: 'api-support@industry5.0.com',
      licenseUrl: 'https://industry5.0.com/licenses/proprietary',
      externalDocUrl: 'https://docs.industry5.0.com/inventory',
      servers: this.getServers(),
      security: {
        bearerAuth: true,
        apiKey: true,
        oauth2: true,
      },
    };
  }

  setup(app: INestApplication): void {
    if (!this.config.enabled) {
      return;
    }

    // Create multiple API documentation versions
    this.setupMainApiDocs(app);
    this.setupAuthApiDocs(app);
    this.setupInventoryApiDocs(app);
    this.setupComplianceApiDocs(app);
    this.setupInternalApiDocs(app);
    
    // Generate static documentation files
    this.generateStaticDocs(app);
  }

  private setupMainApiDocs(app: INestApplication): void {
    const config = new DocumentBuilder()
      .setTitle(this.config.title)
      .setDescription(this.config.description)
      .setVersion(this.config.version)
      .setContact(
        'Industry 5.0 API Support',
        'https://industry5.0.com/support',
        this.config.contactEmail
      )
      .setLicense(
        'Proprietary License',
        this.config.licenseUrl
      )
      .setExternalDoc(
        'Additional Documentation',
        this.config.externalDocUrl
      )
      .setTermsOfService('https://industry5.0.com/terms')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth'
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
          description: 'API Key for service-to-service authentication',
        },
        'API-Key'
      )
      .addOAuth2(
        {
          type: 'oauth2',
          description: 'OAuth2 authentication',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://auth.industry5.0.com/oauth/authorize',
              tokenUrl: 'https://auth.industry5.0.com/oauth/token',
              refreshUrl: 'https://auth.industry5.0.com/oauth/refresh',
              scopes: {
                'inventory:read': 'Read inventory data',
                'inventory:write': 'Write inventory data',
                'inventory:delete': 'Delete inventory data',
                'inventory:admin': 'Administrative access',
                'compliance:audit': 'Compliance and audit access',
                'reports:generate': 'Generate reports',
              },
            },
          },
        },
        'OAuth2'
      )
      .addGlobalParameters({
        name: 'X-Request-ID',
        in: 'header',
        description: 'Unique request identifier for tracking',
        required: false,
        schema: {
          type: 'string',
          format: 'uuid',
        },
      })
      .addGlobalParameters({
        name: 'X-Client-Version',
        in: 'header',
        description: 'Client application version',
        required: false,
        schema: {
          type: 'string',
          pattern: '^\\d+\\.\\d+\\.\\d+$',
        },
      })
      .addTag('Authentication', 'User authentication and authorization')
      .addTag('Inventory Items', 'Inventory item management')
      .addTag('Stock Management', 'Stock tracking and transactions')
      .addTag('Cycle Counts', 'Inventory cycle counting')
      .addTag('Analytics', 'Inventory analytics and reporting')
      .addTag('Locations', 'Storage location management')
      .addTag('Alerts', 'Inventory alerts and notifications')
      .addTag('Compliance', 'Compliance and audit features')
      .addTag('Security', 'Security and access control')
      .addTag('Blockchain', 'Blockchain integration for supply chain')
      .addTag('AI/ML', 'AI and machine learning features')
      .addTag('IoT', 'IoT device integration')
      .addTag('Admin', 'Administrative functions')
      .build();

    // Add servers based on environment
    this.config.servers.forEach(server => {
      config.servers?.push(server);
    });

    const document = SwaggerModule.createDocument(app, config, {
      operationIdFactory: (controllerKey: string, methodKey: string) => 
        `${controllerKey.replace('Controller', '')}_${methodKey}`,
      extraModels: [], // Add DTOs that aren't automatically discovered
    });

    // Custom styling and configuration
    const swaggerOptions = {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        docExpansion: 'list',
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch', 'head'],
        tryItOutEnabled: true,
        requestInterceptor: `
          (request) => {
            request.headers['X-Request-ID'] = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
            return request;
          }
        `,
      },
      customCss: this.getCustomCss(),
      customSiteTitle: 'Industry 5.0 Inventory API Documentation',
      customfavIcon: '/assets/favicon.ico',
      customJs: '/assets/swagger-customization.js',
    };

    SwaggerModule.setup(this.config.path, app, document, swaggerOptions);
  }

  private setupAuthApiDocs(app: INestApplication): void {
    const config = new DocumentBuilder()
      .setTitle('Industry 5.0 Authentication API')
      .setDescription('Advanced authentication and authorization services')
      .setVersion(this.config.version)
      .addBearerAuth()
      .addTag('Authentication', 'User authentication')
      .addTag('MFA', 'Multi-factor authentication')
      .addTag('OAuth2', 'OAuth2 and OpenID Connect')
      .addTag('Sessions', 'Session management')
      .addTag('Device Trust', 'Device trust and verification')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      include: [], // Include only auth-related modules
      deepScanRoutes: true,
    });

    SwaggerModule.setup('api/docs/auth', app, document, {
      swaggerOptions: {
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  private setupInventoryApiDocs(app: INestApplication): void {
    const config = new DocumentBuilder()
      .setTitle('Industry 5.0 Inventory API')
      .setDescription('Core inventory management operations')
      .setVersion(this.config.version)
      .addBearerAuth()
      .addTag('Items', 'Inventory item operations')
      .addTag('Stock', 'Stock management')
      .addTag('Locations', 'Storage locations')
      .addTag('Transactions', 'Stock transactions')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      include: [], // Include only inventory-related modules
    });

    SwaggerModule.setup('api/docs/inventory', app, document);
  }

  private setupComplianceApiDocs(app: INestApplication): void {
    const config = new DocumentBuilder()
      .setTitle('Industry 5.0 Compliance API')
      .setDescription('Compliance, audit, and regulatory features')
      .setVersion(this.config.version)
      .addBearerAuth()
      .addTag('Audit Logs', 'Audit trail management')
      .addTag('Compliance Reports', 'Compliance reporting')
      .addTag('Data Protection', 'Data loss prevention')
      .addTag('Security Events', 'Security monitoring')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      include: [], // Include only compliance-related modules
    });

    SwaggerModule.setup('api/docs/compliance', app, document);
  }

  private setupInternalApiDocs(app: INestApplication): void {
    if (this.configService.get('NODE_ENV') === 'production') {
      return; // Don't expose internal APIs in production
    }

    const config = new DocumentBuilder()
      .setTitle('Industry 5.0 Internal API')
      .setDescription('Internal and administrative operations')
      .setVersion(this.config.version)
      .addBearerAuth()
      .addTag('Health Checks', 'System health monitoring')
      .addTag('Metrics', 'Application metrics')
      .addTag('Admin', 'Administrative functions')
      .addTag('Diagnostics', 'System diagnostics')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      include: [], // Include only internal modules
    });

    SwaggerModule.setup('api/docs/internal', app, document, {
      swaggerOptions: {
        tagsSorter: 'alpha',
      },
    });
  }

  private generateStaticDocs(app: INestApplication): void {
    try {
      const config = new DocumentBuilder()
        .setTitle(this.config.title)
        .setDescription(this.config.description)
        .setVersion(this.config.version)
        .build();

      const document = SwaggerModule.createDocument(app, config);
      
      // Ensure docs directory exists
      const docsDir = path.join(process.cwd(), 'docs', 'api');
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }

      // Generate OpenAPI JSON
      fs.writeFileSync(
        path.join(docsDir, 'openapi.json'),
        JSON.stringify(document, null, 2)
      );

      // Generate OpenAPI YAML
      const yaml = require('yaml');
      fs.writeFileSync(
        path.join(docsDir, 'openapi.yaml'),
        yaml.stringify(document)
      );

      // Generate API changelog
      this.generateApiChangelog(docsDir);

      // Generate Postman collection
      this.generatePostmanCollection(document, docsDir);

    } catch (error) {
      console.warn('Failed to generate static documentation:', error.message);
    }
  }

  private generateApiChangelog(docsDir: string): void {
    const changelog = {
      version: this.config.version,
      releaseDate: new Date().toISOString(),
      changes: [
        {
          type: 'added',
          description: 'Advanced authentication with MFA support',
          endpoints: ['/auth/login', '/auth/mfa/setup', '/auth/mfa/verify'],
        },
        {
          type: 'enhanced',
          description: 'Improved inventory analytics with real-time data',
          endpoints: ['/inventory/analytics', '/inventory/reports'],
        },
        {
          type: 'security',
          description: 'Implemented FIPS 140-2 compliant encryption',
          endpoints: ['*'],
        },
      ],
      breaking: [],
      deprecated: [],
    };

    fs.writeFileSync(
      path.join(docsDir, 'changelog.json'),
      JSON.stringify(changelog, null, 2)
    );
  }

  private generatePostmanCollection(document: OpenAPIObject, docsDir: string): void {
    try {
      const postmanCollection = {
        info: {
          name: document.info.title,
          description: document.info.description,
          version: document.info.version,
          schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        },
        auth: {
          type: 'bearer',
          bearer: [
            {
              key: 'token',
              value: '{{bearerToken}}',
              type: 'string',
            },
          ],
        },
        variable: [
          {
            key: 'baseUrl',
            value: 'https://api.industry5.0.com/inventory',
            type: 'string',
          },
          {
            key: 'bearerToken',
            value: '',
            type: 'string',
          },
        ],
        item: [], // Would populate with actual endpoints
      };

      fs.writeFileSync(
        path.join(docsDir, 'postman-collection.json'),
        JSON.stringify(postmanCollection, null, 2)
      );
    } catch (error) {
      console.warn('Failed to generate Postman collection:', error.message);
    }
  }

  private getApiDescription(): string {
    return `
# Industry 5.0 Inventory Management System API

## Overview
Advanced inventory management system with AI-powered analytics, IoT integration, blockchain supply chain tracking, and government-grade security.

## Features
- **Real-time Inventory Tracking**: Monitor inventory levels in real-time with IoT sensors
- **AI-Powered Analytics**: Predictive analytics for demand forecasting and optimization
- **Blockchain Integration**: Immutable supply chain tracking and transparency
- **Government-Grade Security**: FIPS 140-2 compliant with zero-trust architecture
- **Multi-Factor Authentication**: Comprehensive MFA with biometric support
- **Compliance Ready**: SOX, HIPAA, GDPR, and industry-specific compliance
- **Advanced Reporting**: Real-time dashboards and comprehensive reporting

## Authentication
This API uses JWT-based authentication with refresh tokens. All requests must include a valid Bearer token in the Authorization header.

## Rate Limiting
API requests are limited to 1000 requests per hour per authenticated user and 100 requests per hour per IP address for unauthenticated requests.

## Versioning
This API uses semantic versioning. The current version is v${this.config.version}. Breaking changes will increment the major version number.

## Support
For API support, please contact: ${this.config.contactEmail}
    `.trim();
  }

  private getServers(): Array<{ url: string; description: string }> {
    const env = this.configService.get('NODE_ENV', 'development');
    const servers = [
      {
        url: 'https://api.industry5.0.com/inventory',
        description: 'Production Server',
      },
      {
        url: 'https://staging-api.industry5.0.com/inventory',
        description: 'Staging Server',
      },
      {
        url: 'https://dev-api.industry5.0.com/inventory',
        description: 'Development Server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
    ];

    // Filter servers based on environment
    switch (env) {
      case 'production':
        return servers.filter(s => s.description.includes('Production'));
      case 'staging':
        return servers.filter(s => s.description.includes('Staging') || s.description.includes('Production'));
      case 'development':
        return servers.filter(s => !s.description.includes('Production'));
      default:
        return servers;
    }
  }

  private getCustomCss(): string {
    return `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { color: #1f4e79; }
      .swagger-ui .scheme-container { background: #f7f7f7; padding: 15px; margin: 20px 0; }
      .swagger-ui .auth-wrapper { margin: 20px 0; }
      .swagger-ui table thead tr td, .swagger-ui table thead tr th { 
        background-color: #1f4e79; 
        color: white; 
      }
      .swagger-ui .model-box { background-color: #f9f9f9; }
      .swagger-ui .operation-tag-content { margin-bottom: 20px; }
      
      /* Custom branding */
      .swagger-ui .info .title:before {
        content: "🏭 ";
        font-size: 1.2em;
      }
      
      /* Security scheme styling */
      .swagger-ui .auth-btn-wrapper { margin-top: 10px; }
      .swagger-ui .authorization__btn { background-color: #28a745; }
      .swagger-ui .authorization__btn:hover { background-color: #218838; }
      
      /* Response styling */
      .swagger-ui .highlight-code { background-color: #f8f9fa; }
      .swagger-ui .response-col_status { font-weight: bold; }
      .swagger-ui .response.success .response-col_status { color: #28a745; }
      .swagger-ui .response.error .response-col_status { color: #dc3545; }
    `;
  }

  getConfig(): SwaggerConfig {
    return this.config;
  }
}
