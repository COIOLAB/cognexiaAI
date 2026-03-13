// Industry 5.0 ERP Backend - Integration Gateway Module
// Comprehensive system integration with external services, APIs, and protocols
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

// Controllers
import { IntegrationGatewayController } from './controllers/integration-gateway.controller';
import { APIIntegrationController } from './controllers/api-integration.controller';
import { DataSynchronizationController } from './controllers/data-synchronization.controller';
import { WebhookController } from './controllers/webhook.controller';
import { MessageQueueController } from './controllers/message-queue.controller';
import { ExternalSystemController } from './controllers/external-system.controller';

// Services
import { IntegrationGatewayService } from './services/integration-gateway.service';
import { APIConnectionService } from './services/api-connection.service';
import { DataMappingService } from './services/data-mapping.service';
import { DataTransformationService } from './services/data-transformation.service';
import { DataSynchronizationService } from './services/data-synchronization.service';
import { WebhookService } from './services/webhook.service';
import { MessageQueueService } from './services/message-queue.service';
import { ExternalSystemService } from './services/external-system.service';
import { ProtocolHandlerService } from './services/protocol-handler.service';
import { IntegrationMonitoringService } from './services/integration-monitoring.service';
import { IntegrationSecurityService } from './services/integration-security.service';
import { APIRateLimitService } from './services/api-rate-limit.service';
import { IntegrationAnalyticsService } from './services/integration-analytics.service';
import { CloudIntegrationService } from './services/cloud-integration.service';
import { BlockchainIntegrationService } from './services/blockchain-integration.service';

// Entities
import { IntegrationEndpoint } from './entities/IntegrationEndpoint';
import { APIConnection } from './entities/APIConnection';
import { DataMapping } from './entities/DataMapping';
import { IntegrationLog } from './entities/IntegrationLog';
import { WebhookSubscription } from './entities/WebhookSubscription';
import { MessageQueue } from './entities/MessageQueue';
import { ExternalSystem } from './entities/ExternalSystem';
import { IntegrationConfig } from './entities/IntegrationConfig';
import { DataTransformation } from './entities/DataTransformation';
import { IntegrationAlert } from './entities/IntegrationAlert';
import { APICredential } from './entities/APICredential';
import { IntegrationMetric } from './entities/IntegrationMetric';
import { SyncOperation } from './entities/SyncOperation';
import { IntegrationAudit } from './entities/IntegrationAudit';
import { ExternalDataSource } from './entities/ExternalDataSource';
import { IntegrationAnalytics } from './entities/IntegrationAnalytics';

// Guards and Middleware
import { IntegrationSecurityGuard } from './guards/integration-security.guard';
import { APIAuthenticationGuard } from './guards/api-authentication.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { DataValidationGuard } from './guards/data-validation.guard';

// Utilities and Providers
import { IntegrationUtilities } from './utilities/integration.utilities';
import { DataTransformationUtilsService } from './utilities/data-transformation-utils.service';
import { ProtocolUtilsService } from './utilities/protocol-utils.service';
import { IntegrationValidationService } from './utilities/integration-validation.service';
import { APIClientFactoryService } from './utilities/api-client-factory.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 3,
    }),
    TypeOrmModule.forFeature([
      IntegrationEndpoint,
      APIConnection,
      DataMapping,
      IntegrationLog,
      WebhookSubscription,
      MessageQueue,
      ExternalSystem,
      IntegrationConfig,
      DataTransformation,
      IntegrationAlert,
      APICredential,
      IntegrationMetric,
      SyncOperation,
      IntegrationAudit,
      ExternalDataSource,
      IntegrationAnalytics,
    ]),
  ],
  controllers: [
    IntegrationGatewayController,
    APIIntegrationController,
    DataSynchronizationController,
    WebhookController,
    MessageQueueController,
    ExternalSystemController,
  ],
  providers: [
    // Core Services
    IntegrationGatewayService,
    APIConnectionService,
    DataMappingService,
    DataTransformationService,
    DataSynchronizationService,
    WebhookService,
    MessageQueueService,
    ExternalSystemService,
    
    // Protocol and Monitoring
    ProtocolHandlerService,
    IntegrationMonitoringService,
    IntegrationSecurityService,
    APIRateLimitService,
    
    // Analytics and Advanced Services
    IntegrationAnalyticsService,
    CloudIntegrationService,
    BlockchainIntegrationService,
    
    // Guards
    IntegrationSecurityGuard,
    APIAuthenticationGuard,
    RateLimitGuard,
    DataValidationGuard,
    
    // Utilities
    IntegrationUtilities,
    DataTransformationUtilsService,
    ProtocolUtilsService,
    IntegrationValidationService,
    APIClientFactoryService,
  ],
  exports: [
    IntegrationGatewayService,
    APIConnectionService,
    DataMappingService,
    DataTransformationService,
    DataSynchronizationService,
    WebhookService,
    MessageQueueService,
    ExternalSystemService,
    ProtocolHandlerService,
    IntegrationMonitoringService,
    IntegrationSecurityService,
    APIRateLimitService,
    IntegrationAnalyticsService,
    CloudIntegrationService,
    BlockchainIntegrationService,
    IntegrationUtilities,
    DataTransformationUtilsService,
    ProtocolUtilsService,
    IntegrationValidationService,
    APIClientFactoryService,
  ],
})
export class IntegrationGatewayModule {}
