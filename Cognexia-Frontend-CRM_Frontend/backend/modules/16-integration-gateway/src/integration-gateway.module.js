"use strict";
// Industry 5.0 ERP Backend - Integration Gateway Module
// Comprehensive system integration with external services, APIs, and protocols
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationGatewayModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
// Controllers
const integration_gateway_controller_1 = require("./controllers/integration-gateway.controller");
const api_integration_controller_1 = require("./controllers/api-integration.controller");
const data_synchronization_controller_1 = require("./controllers/data-synchronization.controller");
const webhook_controller_1 = require("./controllers/webhook.controller");
const message_queue_controller_1 = require("./controllers/message-queue.controller");
const external_system_controller_1 = require("./controllers/external-system.controller");
// Services
const integration_gateway_service_1 = require("./services/integration-gateway.service");
const api_connection_service_1 = require("./services/api-connection.service");
const data_mapping_service_1 = require("./services/data-mapping.service");
const data_transformation_service_1 = require("./services/data-transformation.service");
const data_synchronization_service_1 = require("./services/data-synchronization.service");
const webhook_service_1 = require("./services/webhook.service");
const message_queue_service_1 = require("./services/message-queue.service");
const external_system_service_1 = require("./services/external-system.service");
const protocol_handler_service_1 = require("./services/protocol-handler.service");
const integration_monitoring_service_1 = require("./services/integration-monitoring.service");
const integration_security_service_1 = require("./services/integration-security.service");
const api_rate_limit_service_1 = require("./services/api-rate-limit.service");
const integration_analytics_service_1 = require("./services/integration-analytics.service");
const cloud_integration_service_1 = require("./services/cloud-integration.service");
const blockchain_integration_service_1 = require("./services/blockchain-integration.service");
// Entities
const IntegrationEndpoint_1 = require("./entities/IntegrationEndpoint");
const APIConnection_1 = require("./entities/APIConnection");
const DataMapping_1 = require("./entities/DataMapping");
const IntegrationLog_1 = require("./entities/IntegrationLog");
const WebhookSubscription_1 = require("./entities/WebhookSubscription");
const MessageQueue_1 = require("./entities/MessageQueue");
const ExternalSystem_1 = require("./entities/ExternalSystem");
const IntegrationConfig_1 = require("./entities/IntegrationConfig");
const DataTransformation_1 = require("./entities/DataTransformation");
const IntegrationAlert_1 = require("./entities/IntegrationAlert");
const APICredential_1 = require("./entities/APICredential");
const IntegrationMetric_1 = require("./entities/IntegrationMetric");
const SyncOperation_1 = require("./entities/SyncOperation");
const IntegrationAudit_1 = require("./entities/IntegrationAudit");
const ExternalDataSource_1 = require("./entities/ExternalDataSource");
const IntegrationAnalytics_1 = require("./entities/IntegrationAnalytics");
// Guards and Middleware
const integration_security_guard_1 = require("./guards/integration-security.guard");
const api_authentication_guard_1 = require("./guards/api-authentication.guard");
const rate_limit_guard_1 = require("./guards/rate-limit.guard");
const data_validation_guard_1 = require("./guards/data-validation.guard");
// Utilities and Providers
const integration_utilities_1 = require("./utilities/integration.utilities");
const data_transformation_utils_service_1 = require("./utilities/data-transformation-utils.service");
const protocol_utils_service_1 = require("./utilities/protocol-utils.service");
const integration_validation_service_1 = require("./utilities/integration-validation.service");
const api_client_factory_service_1 = require("./utilities/api-client-factory.service");
let IntegrationGatewayModule = class IntegrationGatewayModule {
};
exports.IntegrationGatewayModule = IntegrationGatewayModule;
exports.IntegrationGatewayModule = IntegrationGatewayModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule.register({
                timeout: 30000,
                maxRedirects: 3,
            }),
            typeorm_1.TypeOrmModule.forFeature([
                IntegrationEndpoint_1.IntegrationEndpoint,
                APIConnection_1.APIConnection,
                DataMapping_1.DataMapping,
                IntegrationLog_1.IntegrationLog,
                WebhookSubscription_1.WebhookSubscription,
                MessageQueue_1.MessageQueue,
                ExternalSystem_1.ExternalSystem,
                IntegrationConfig_1.IntegrationConfig,
                DataTransformation_1.DataTransformation,
                IntegrationAlert_1.IntegrationAlert,
                APICredential_1.APICredential,
                IntegrationMetric_1.IntegrationMetric,
                SyncOperation_1.SyncOperation,
                IntegrationAudit_1.IntegrationAudit,
                ExternalDataSource_1.ExternalDataSource,
                IntegrationAnalytics_1.IntegrationAnalytics,
            ]),
        ],
        controllers: [
            integration_gateway_controller_1.IntegrationGatewayController,
            api_integration_controller_1.APIIntegrationController,
            data_synchronization_controller_1.DataSynchronizationController,
            webhook_controller_1.WebhookController,
            message_queue_controller_1.MessageQueueController,
            external_system_controller_1.ExternalSystemController,
        ],
        providers: [
            // Core Services
            integration_gateway_service_1.IntegrationGatewayService,
            api_connection_service_1.APIConnectionService,
            data_mapping_service_1.DataMappingService,
            data_transformation_service_1.DataTransformationService,
            data_synchronization_service_1.DataSynchronizationService,
            webhook_service_1.WebhookService,
            message_queue_service_1.MessageQueueService,
            external_system_service_1.ExternalSystemService,
            // Protocol and Monitoring
            protocol_handler_service_1.ProtocolHandlerService,
            integration_monitoring_service_1.IntegrationMonitoringService,
            integration_security_service_1.IntegrationSecurityService,
            api_rate_limit_service_1.APIRateLimitService,
            // Analytics and Advanced Services
            integration_analytics_service_1.IntegrationAnalyticsService,
            cloud_integration_service_1.CloudIntegrationService,
            blockchain_integration_service_1.BlockchainIntegrationService,
            // Guards
            integration_security_guard_1.IntegrationSecurityGuard,
            api_authentication_guard_1.APIAuthenticationGuard,
            rate_limit_guard_1.RateLimitGuard,
            data_validation_guard_1.DataValidationGuard,
            // Utilities
            integration_utilities_1.IntegrationUtilities,
            data_transformation_utils_service_1.DataTransformationUtilsService,
            protocol_utils_service_1.ProtocolUtilsService,
            integration_validation_service_1.IntegrationValidationService,
            api_client_factory_service_1.APIClientFactoryService,
        ],
        exports: [
            integration_gateway_service_1.IntegrationGatewayService,
            api_connection_service_1.APIConnectionService,
            data_mapping_service_1.DataMappingService,
            data_transformation_service_1.DataTransformationService,
            data_synchronization_service_1.DataSynchronizationService,
            webhook_service_1.WebhookService,
            message_queue_service_1.MessageQueueService,
            external_system_service_1.ExternalSystemService,
            protocol_handler_service_1.ProtocolHandlerService,
            integration_monitoring_service_1.IntegrationMonitoringService,
            integration_security_service_1.IntegrationSecurityService,
            api_rate_limit_service_1.APIRateLimitService,
            integration_analytics_service_1.IntegrationAnalyticsService,
            cloud_integration_service_1.CloudIntegrationService,
            blockchain_integration_service_1.BlockchainIntegrationService,
            integration_utilities_1.IntegrationUtilities,
            data_transformation_utils_service_1.DataTransformationUtilsService,
            protocol_utils_service_1.ProtocolUtilsService,
            integration_validation_service_1.IntegrationValidationService,
            api_client_factory_service_1.APIClientFactoryService,
        ],
    })
], IntegrationGatewayModule);
//# sourceMappingURL=integration-gateway.module.js.map