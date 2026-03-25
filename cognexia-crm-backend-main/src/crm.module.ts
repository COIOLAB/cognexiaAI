import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './guards/jwt.strategy';

// Controllers
import { AuthController } from './controllers/auth.controller';
import { CRMController } from './controllers/crm.controller';
import { SalesController } from './controllers/sales.controller';
import { SalesOrderController } from './controllers/sales-order.controller';
import { CustomerController } from './controllers/customer.controller';
import { AccountController } from './controllers/account.controller';
import { ContactController } from './controllers/contact.controller';
import { CRMAIIntegrationController } from './controllers/crm-ai-integration.controller';
import { MarketingController } from './controllers/marketing.controller';
import { SupportController } from './controllers/support.controller';
import { OrganizationController } from './controllers/organization.controller';
import { SubscriptionPlansController } from './controllers/subscription-plans.controller';
import { AuditLogController } from './controllers/audit-log.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { NotificationController } from './controllers/notification.controller';
import { StripePaymentController } from './controllers/stripe-payment.controller';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';
import { BillingTransactionController } from './controllers/billing-transaction.controller';
import { UsageTrackingController } from './controllers/usage-tracking.controller';
import { OrganizationBillingController } from './controllers/organization-billing.controller';
import { EnterprisePaymentController } from './controllers/enterprise-payment.controller';
import { MonitoringController } from './controllers/monitoring.controller';
import { PerformanceController } from './controllers/performance.controller';
import { ThrottlingController } from './controllers/throttling.controller';
import { OnboardingController } from './controllers/onboarding.controller';
import { MigrationController } from './controllers/migration.controller';
import { RootController } from './controllers/root.controller';
import { HealthController } from './controllers/health.controller';
import { IntegrationHubController } from './controllers/integration-hub.controller';
import { WorkflowController } from './controllers/workflow.controller';
import { UserManagementController } from './controllers/user-management.controller';
import { UserTierController } from './controllers/user-tier.controller';
import { OrganizationFeaturesController } from './controllers/organization-features.controller';
import { AnalyticsTelemetryController } from './controllers/analytics-telemetry.controller';
import { StaffManagementSimpleController } from './controllers/staff-management-simple.controller';
import { SupportTicketsSimpleController } from './controllers/support-tickets-simple.controller';

// ===== Gateways =====
import { AnalyticsGateway } from './gateways/analytics.gateway';

// ===== NEW: 18 Super Admin Feature Controllers =====
import { PlatformAnalyticsController } from './controllers/platform-analytics.controller';
import { RevenueBillingController } from './controllers/revenue-billing.controller';
import { OrganizationHealthController } from './controllers/organization-health.controller';
import { UserImpersonationController } from './controllers/user-impersonation.controller';
import { SecurityComplianceController } from './controllers/security-compliance.controller';
import { FeatureUsageAnalyticsController } from './controllers/feature-usage-analytics.controller';
import { AdminSupportTicketController } from './controllers/admin-support-ticket.controller';
import { SystemConfigurationController } from './controllers/system-configuration.controller';
import { CommunicationCenterController } from './controllers/communication-center.controller';
import { AutomationWorkflowsController } from './controllers/automation-workflows.controller';
import { CustomReportingController } from './controllers/custom-reporting.controller';
import { MultiRegionController } from './controllers/multi-region.controller';
import { OnboardingController as AdminOnboardingController } from './controllers/onboarding.controller';
import { KPITrackingController } from './controllers/kpi-tracking.controller';
import { ABTestingController } from './controllers/ab-testing.controller';
import { APIManagementController } from './controllers/api-management.controller';
import { MobileAdminController } from './controllers/mobile-admin.controller';
import { WhiteLabelController } from './controllers/white-label.controller';

// ===== NEW: 15 Advanced Feature Controllers (19-33) =====
import { PredictiveAnalyticsController } from './controllers/predictive-analytics.controller';
import { RecommendationEngineController } from './controllers/recommendation-engine.controller';
import { NaturalLanguageQueryController } from './controllers/natural-language-query.controller';
import { AnomalyDetectionController } from './controllers/anomaly-detection.controller';
import { HealthScoringV2Controller } from './controllers/health-scoring-v2.controller';
import { DatabaseManagementController } from './controllers/database-management.controller';
import { AdvancedAuditController } from './controllers/advanced-audit.controller';
import { PerformanceMonitoringController } from './controllers/performance-monitoring.controller';
import { DisasterRecoveryController } from './controllers/disaster-recovery.controller';
import { AdvancedFinancialController } from './controllers/advanced-financial.controller';
import { InvoicePaymentController } from './controllers/invoice-payment.controller';
import { CustomerSuccessController } from './controllers/customer-success.controller';
import { SupportAnalyticsController } from './controllers/support-analytics.controller';
import { DeveloperPortalController } from './controllers/developer-portal.controller';
import { ReleaseManagementController } from './controllers/release-management.controller';
import { MFAController } from './controllers/mfa.controller';

// Services
import { AuthService } from './services/auth.service';
import { DemoDataService } from './services/demo-data.service';
import { OrganizationService } from './services/organization.service';
import { SubscriptionService } from './services/subscription.service';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { UserDashboardService } from './services/user-dashboard.service';
import { BillingTransactionService } from './services/billing-transaction.service';
import { UsageTrackingService } from './services/usage-tracking.service';
import { EnterpriseBillingService } from './services/enterprise-billing.service';
import { ThrottlingService } from './services/throttling.service';
import { MetricsService } from './services/metrics.service';
import { AnalyticsService } from './services/analytics.service';
import { DatabaseOptimizationService } from './services/database-optimization.service';
import { PerformanceInterceptor } from './interceptors/performance.interceptor';
import { UniversalCRMMigrationService } from './services/universal-crm-migration.service';
import { SalesforceMigrationService } from './services/salesforce-migration.service';
import { DataMigrationService } from './services/data-migration.service';
import { CRMService } from './services/crm.service';
import { SalesService } from './services/sales.service';
import { SalesOrderService } from './services/sales-order.service';
import { CustomerService } from './services/customer.service';
import { LeadService } from './services/lead.service';
import { CRMAIIntegrationService } from './services/crm-ai-integration.service';
import { MarketingService } from './services/marketing.service';
import { SupportService } from './services/support.service';
import { UserManagementService } from './services/user-management.service';
import { UserTierService } from './services/user-tier.service';

// ===== NEW: 18 Super Admin Feature Services =====
import { PlatformAnalyticsService } from './services/platform-analytics.service';
import { RevenueBillingService } from './services/revenue-billing.service';
import { OrganizationHealthService } from './services/organization-health.service';
import { UserImpersonationService } from './services/user-impersonation.service';
import { SecurityComplianceService } from './services/security-compliance.service';
import { FeatureUsageAnalyticsService } from './services/feature-usage-analytics.service';
import { AdminSupportTicketService } from './services/admin-support-ticket.service';
import { SystemConfigurationService } from './services/system-configuration.service';
import { CommunicationCenterService } from './services/communication-center.service';
import { AutomationWorkflowsService } from './services/automation-workflows.service';
import { CustomReportingService } from './services/custom-reporting.service';
import { MultiRegionService } from './services/multi-region.service';
import { OnboardingService as AdminOnboardingService } from './services/onboarding.service';
import { KPITrackingService } from './services/kpi-tracking.service';
import { ABTestingService } from './services/ab-testing.service';
import { APIManagementService } from './services/api-management.service';
import { MobileAdminService } from './services/mobile-admin.service';
import { WhiteLabelService } from './services/white-label.service';

// ===== NEW: 15 Advanced Feature Services (19-33) =====
import { PredictiveAnalyticsService } from './services/predictive-analytics.service';
import { RecommendationEngineService } from './services/recommendation-engine.service';
import { NaturalLanguageQueryService } from './services/natural-language-query.service';
import { AnomalyDetectionService } from './services/anomaly-detection.service';
import { HealthScoringV2Service } from './services/health-scoring-v2.service';
import { DatabaseManagementService } from './services/database-management.service';
import { AdvancedAuditService } from './services/advanced-audit.service';
import { PerformanceMonitoringService } from './services/performance-monitoring.service';
import { DisasterRecoveryService } from './services/disaster-recovery.service';
import { AdvancedFinancialService } from './services/advanced-financial.service';
import { InvoicePaymentService } from './services/invoice-payment.service';
import { CustomerSuccessService } from './services/customer-success.service';
import { SupportAnalyticsService } from './services/support-analytics.service';
import { DeveloperPortalService } from './services/developer-portal.service';
import { ReleaseManagementService } from './services/release-management.service';

// Advanced Industry 5.0 Services
import { AICustomerIntelligenceService } from './services/AICustomerIntelligenceService';
import { QuantumPersonalizationEngine } from './services/QuantumPersonalizationEngine';
import { ARVRSalesExperienceService } from './services/ARVRSalesExperienceService';
import { AutonomousJourneyOrchestratorService } from './services/AutonomousJourneyOrchestratorService';
import { AdvancedPredictiveAnalyticsService } from './services/AdvancedPredictiveAnalyticsService';
import { EnterpriseSecurityComplianceService } from './services/EnterpriseSecurityComplianceService';
import { QuantumCustomerIntelligenceFusionService } from './services/QuantumCustomerIntelligenceFusionService';
import { HolographicCustomerExperienceService } from './services/HolographicCustomerExperienceService';

// New Advanced Services for 100% Completion
import { ConversationalAIService } from './services/ConversationalAIService';
import { RealTimeCustomerAnalyticsService } from './services/RealTimeCustomerAnalyticsService';
import { LLMService } from './services/llm.service';
import { WorkflowBuilderService } from './services/workflow-builder.service';
import { MFAService } from './services/mfa.service';
import { IntegrationHubService, ERPIntegrationService, EmailIntegrationService, CalendarSyncService, MessagingPlatformIntegrationService, DataWarehouseConnectorService } from './services/integration-hub.service';

// Error Handling Middleware
import { CRMErrorHandlerMiddleware, CRMGlobalErrorHandler } from './middleware/crm-error-handler.middleware';

// Security Guards
import {
  TenantGuard,
  JwtAuthGuard,
  RBACGuard,
  RolesGuard,
  ApiKeyGuard,
  RateLimitGuard,
  ResourceOwnerGuard
} from './guards';

// Sales & Marketing Module (from module 07)
// TODO: Re-enable when sales-marketing module entities are fixed
// import { SalesMarketingModule } from '../../07-sales-marketing/src/sales-marketing.module';

// Phase 1: Import/Export Services
import { ImportService } from './services/import.service';
import { ExportService } from './services/export.service';
import { ImportExportController } from './controllers/import-export.controller';

// Phase 1: Email System
import { EmailSenderService } from './services/email-sender.service';
import { EmailCampaignService } from './services/email-campaign.service';
import { EmailNotificationService } from './services/email-notification.service';
import { NotificationSchedulerService } from './services/notification-scheduler.service';
import { EmailController } from './controllers/email.controller';

// Phase 1: Activity & Task Management
import { TaskService } from './services/task.service';
import { ActivityLoggerService } from './services/activity-logger.service';
import { ActivityController } from './controllers/activity.controller';
import { CalendarController } from './controllers/calendar.controller';
import { CalendarService } from './services/calendar.service';

// Phase 12: Audit Logging
import { AuditLogService } from './services/audit-log.service';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';

// Phase 2: Reporting & Analytics
import { ReportBuilderService } from './services/report-builder.service';
import { FunnelAnalysisService } from './services/funnel-analysis.service';
import { CohortAnalysisService } from './services/cohort-analysis.service';
import { RevenueForecastingService } from './services/revenue-forecasting.service';
import { ReportSchedulerService } from './services/report-scheduler.service';
import { ReportingController } from './controllers/reporting.controller';

// Phase 2: Document Management
import { DocumentService } from './services/document.service';
import { SignatureService } from './services/signature.service';
import { ContractService } from './services/contract.service';
import { DocumentController } from './controllers/document.controller';

// Phase 2: Customer Portal
import { PortalAuthService } from './services/portal-auth.service';
import { PortalTicketService } from './services/portal-ticket.service';
import { PortalService } from './services/portal.service';
import { PortalController } from './controllers/portal.controller';

// Phase 2: Lead Capture Forms
import { FormService } from './services/form.service';
import { FormController } from './controllers/form.controller';

// Phase 3: Sales Automation
import { SequenceEngineService } from './services/sequence-engine.service';
import { TerritoryManagerService } from './services/territory-manager.service';
import { SequenceAnalyticsService } from './services/sequence-analytics.service';
import { SequenceController } from './controllers/sequence.controller';
import { TerritoryController } from './controllers/territory.controller';

// Phase 3: Product Catalog
import { CatalogService } from './services/catalog.service';
import { PricingEngineService } from './services/pricing-engine.service';
// RecommendationEngineService already imported above (line 134)
import { InventoryService } from './services/inventory.service';
import { ProductController, CategoryController, BundleController } from './controllers/product.controller';
import { PriceListController, DiscountController, PricingController } from './controllers/pricing.controller';

// Phase 3: Telephony Integration
import { CallService } from './services/call.service';
import { CallQueueService } from './services/call-queue.service';
import { CallAnalyticsService } from './services/call-analytics.service';
import { TwilioService } from './services/twilio.service';
import { CallController, CallQueueController, CallAnalyticsController } from './controllers/telephony.controller';
import { TelephonyWebSocketGateway } from './gateways/telephony-websocket.gateway';
import { IVRMenuController } from './controllers/ivr-menu.controller';
import { IVRMenuService } from './services/ivr-menu.service';

// Phase 3: Mobile Optimizations
import { MobileDeviceService, PushNotificationService, OfflineSyncService } from './services/mobile.service';
import {
  MobileDeviceController,
  PushNotificationController,
  OfflineSyncController,
  MobileSettingsController,
  MobileWebhookController,
} from './controllers/mobile.controller';

// Industry 5.0 Complete API Controllers
import { QuantumIntelligenceController } from './controllers/quantum-intelligence.controller';
import { HolographicExperienceController } from './controllers/holographic-experience.controller';
import { ARVRSalesController } from './controllers/arvr-sales.controller';
import { ContractManagementController } from './controllers/contract-management.controller';
import { InventoryManagementController } from './controllers/inventory-management.controller';
import { CatalogManagementController } from './controllers/catalog-management.controller';
import { LLMIntegrationController } from './controllers/llm-integration.controller';
import { RealTimeAnalyticsController } from './controllers/real-time-analytics.controller';

// Industry 5.0 Services
import { QuantumIntelligenceService } from './services/quantum-intelligence.service';
import { HolographicExperienceService } from './services/holographic-experience.service';
import { ARVRSalesService } from './services/arvr-sales.service';
import { ContractManagementService } from './services/contract-management.service';
import { InventoryManagementService } from './services/inventory-management.service';
import { CatalogManagementService } from './services/catalog-management.service';
import { LLMIntegrationService } from './services/llm-integration.service';
import { RealTimeAnalyticsService } from './services/real-time-analytics.service';
import { AnalyticsWebSocketGateway } from './gateways/analytics-websocket.gateway';
import { StripePaymentService } from './services/stripe-payment.service';
import { OnboardingService } from './services/onboarding.service';

// Entities
import { Customer } from './entities/customer.entity';
import { Lead } from './entities/lead.entity';
import { Opportunity } from './entities/opportunity.entity';
import { Contact } from './entities/contact.entity';
import { Account } from './entities/account.entity';
import { SalesPipeline } from './entities/sales-pipeline.entity';
import { PipelineStage } from './entities/pipeline-stage.entity';
import { CustomerInteraction } from './entities/customer-interaction.entity';
import { SalesQuote } from './entities/sales-quote.entity';
import { CustomerSegment } from './entities/customer-segment.entity';
import { MarketingCampaign } from './entities/marketing-campaign.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { MarketingAnalytics } from './entities/marketing-analytics.entity';

// Advanced Industry 5.0 Entities
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Tenant } from './entities/tenant.entity';
import { Organization } from './entities/organization.entity';
import { MasterOrganization } from './entities/master-organization.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { AuditLog } from './entities/audit-log.entity';
import { SecurityAuditLog } from './entities/security-audit-log.entity';
import { SecurityPolicy } from './entities/security-policy.entity';
import { ComplianceRecord } from './entities/compliance-record.entity';
import { CustomerExperience } from './entities/customer-experience.entity';
import { HolographicSession } from './entities/holographic-session.entity';
import { CustomerInsight } from './entities/customer-insight.entity';
import { SupportTicket } from './entities/support-ticket.entity';
import { StaffRole } from './entities/staff-role.entity';
import { SLA } from './entities/sla.entity';
import { KnowledgeBaseArticle } from './entities/knowledge-base.entity';
import { Workflow } from './entities/workflow.entity';
import { BusinessRule } from './entities/business-rule.entity';
import { Dashboard } from './entities/dashboard.entity';
import { CustomerDigitalTwin } from './entities/customer-digital-twin.entity';

// Phase 1: Import/Export Entities
import { ImportJob } from './entities/import-job.entity';
import { ExportJob } from './entities/export-job.entity';

// Phase 1: Email System Entities
import { EmailCampaign } from './entities/email-campaign.entity';
import { EmailSequence } from './entities/email-sequence.entity';
import { EmailTracking } from './entities/email-tracking.entity';
import { EmailLog } from './entities/email-log.entity';

// Phase 1: Activity & Task Entities
import { Task } from './entities/task.entity';
import { Activity } from './entities/activity.entity';
import { Note } from './entities/note.entity';
import { Event } from './entities/event.entity';
import { Reminder } from './entities/reminder.entity';

// Phase 2: Reporting & Analytics Entities
import { Report } from './entities/report.entity';
import { ReportSchedule } from './entities/report-schedule.entity';
import { AnalyticsSnapshot } from './entities/analytics-snapshot.entity';

// Phase 2: Document Management Entities
import { Document } from './entities/document.entity';
import { DocumentVersion } from './entities/document-version.entity';
import { DocumentSignature } from './entities/document-signature.entity';
import { Contract } from './entities/contract.entity';

// Phase 2: Customer Portal Entities
import { PortalUser } from './entities/portal-user.entity';
import { PortalTicket } from './entities/portal-ticket.entity';
import { PortalSession } from './entities/portal-session.entity';

// Phase 2: Lead Capture Forms Entities
import { Form } from './entities/form.entity';
import { FormSubmission } from './entities/form-submission.entity';
import { FormField } from './entities/form-field.entity';

// Phase 3: Sales Automation Entities
import { SalesSequence } from './entities/sales-sequence.entity';
import { SequenceEnrollment } from './entities/sequence-enrollment.entity';
import { Territory } from './entities/territory.entity';

// Phase 3: Product Catalog Entities
import { Product } from './entities/product.entity';
import { ProductCategory } from './entities/product-category.entity';
import { PriceList } from './entities/price-list.entity';
import { Discount } from './entities/discount.entity';
import { ProductBundle } from './entities/product-bundle.entity';

// Phase 3: Telephony Entities
import { Call } from './entities/call.entity';
import { CallRecording } from './entities/call-recording.entity';
import { CallQueue } from './entities/call-queue.entity';
import { PhoneNumber } from './entities/phone-number.entity';
import { IVRMenu } from './entities/ivr-menu.entity';
import { NotificationProviderHealth } from './entities/notification-provider-health.entity';
import { NotificationTemplate } from './entities/notification-template.entity';
import { PhoneVerification } from './entities/phone-verification.entity';

// Phase 3: Mobile Entities
import { MobileDevice } from './entities/mobile-device.entity';
import { PushNotification } from './entities/push-notification.entity';
import { OfflineSync } from './entities/offline-sync.entity';

// Payment & Billing Entities
import { BillingTransaction } from './entities/billing-transaction.entity';
import { OnboardingSession } from './entities/onboarding-session.entity';
import { UsageMetric } from './entities/usage-metric.entity';
import { EnterprisePayment } from './entities/enterprise-payment.entity';

// Migration Entities
import { DataMigrationJob } from './entities/data-migration-job.entity';
import { ERPFieldMapping } from './entities/erp-field-mapping.entity';
import { ERPConnection } from './entities/erp-connection.entity';

// Industry 5.0 Complete API Entities
import { QuantumProfile } from './entities/quantum-profile.entity';
import { EntanglementAnalysis } from './entities/entanglement-analysis.entity';
import { QuantumState } from './entities/quantum-state.entity';
import { HolographicProjection } from './entities/holographic-projection.entity';
import { SpatialSession } from './entities/spatial-session.entity';
import { InteractiveHologram } from './entities/interactive-hologram.entity';
import { VRShowroom } from './entities/vr-showroom.entity';
import { VirtualMeeting } from './entities/virtual-meeting.entity';
import { ProductDemo3D } from './entities/product-demo-3d.entity';
import { VRConfiguration } from './entities/vr-configuration.entity';
import { ContractRenewal } from './entities/contract-renewal.entity';
import { ContractAmendment } from './entities/contract-amendment.entity';
import { ContractTemplate } from './entities/contract-template.entity';
import { ContractApproval } from './entities/contract-approval.entity';
import { Warehouse } from './entities/warehouse.entity';
import { StockLevel } from './entities/stock-level.entity';
import { InventoryTransfer } from './entities/inventory-transfer.entity';
import { ReorderPoint } from './entities/reorder-point.entity';
import { InventoryAudit } from './entities/inventory-audit.entity';
import { Catalog } from './entities/catalog.entity';
import { CatalogProduct } from './entities/catalog-product.entity';
import { CatalogPublication } from './entities/catalog-publication.entity';
import { CatalogVersion } from './entities/catalog-version.entity';
import { LLMConversation } from './entities/llm-conversation.entity';
import { LLMMessage } from './entities/llm-message.entity';
import { LLMAnalysis } from './entities/llm-analysis.entity';
import { GeneratedContent } from './entities/generated-content.entity';
import { LLMModel } from './entities/llm-model.entity';
import { RealTimeEvent } from './entities/real-time-event.entity';
import { LiveMetric } from './entities/live-metric.entity';
import { DashboardSubscription } from './entities/dashboard-subscription.entity';
import { AlertRule } from './entities/alert-rule.entity';

// ===== NEW: 18 Super Admin Feature Entities =====
import { PlatformAnalyticsSnapshot } from './entities/platform-analytics.entity';
import { RevenueTransaction } from './entities/revenue-transaction.entity';
import { OrganizationHealthScore } from './entities/organization-health.entity';
import { ImpersonationSession } from './entities/impersonation-session.entity';
import { SecurityEvent } from './entities/security-event.entity';
import { ComplianceCheck } from './entities/compliance-check.entity';
import { AdminSupportTicket } from './entities/admin-support-ticket.entity';
import { SystemConfiguration } from './entities/system-configuration.entity';
import { FeatureFlag } from './entities/feature-flag.entity';
import { PlatformAnnouncement } from './entities/platform-announcement.entity';
import { AutomationWorkflow } from './entities/automation-workflow.entity';
import { CustomReport } from './entities/custom-report.entity';
import { OnboardingChecklist } from './entities/onboarding-checklist.entity';
import { KPIGoal } from './entities/kpi-goal.entity';
import { ABTest } from './entities/ab-test.entity';
import { APIKey } from './entities/api-key.entity';
import { PushNotificationTemplate } from './entities/push-notification-template.entity';
import { WhiteLabelConfig } from './entities/white-label-config.entity';

// ===== NEW: 15 Advanced Feature Entities (19-33) =====
import { ChurnPrediction } from './entities/churn-prediction.entity';
import { RevenueForecast } from './entities/revenue-forecast.entity';
import { Recommendation } from './entities/recommendation.entity';
import { NaturalLanguageQuery } from './entities/natural-language-query.entity';
import { AnomalyDetection } from './entities/anomaly-detection.entity';
import { DatabaseQuery } from './entities/database-query.entity';
import { AuditLog as AuditLogEntity } from './entities/audit-log.entity';
import { PerformanceMetric } from './entities/performance-metric.entity';
import { BackupJob } from './entities/backup-job.entity';
import { FinancialCohort } from './entities/financial-cohort.entity';
import { Invoice } from './entities/invoice.entity';
import { CustomerSuccessMilestone } from './entities/customer-success-milestone.entity';
import { SupportAnalytics } from './entities/support-analytics.entity';
import { SandboxEnvironment } from './entities/sandbox-environment.entity';
import { Deployment } from './entities/deployment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(
      (() => {
        const isRemoteDb = !!process.env.DATABASE_URL || (process.env.DATABASE_HOST && process.env.DATABASE_HOST !== 'localhost');
        const sslConfig = isRemoteDb ? { rejectUnauthorized: false } : false;
        const extra: Record<string, any> = { connectionTimeoutMillis: 30000 };
        if (sslConfig) extra.ssl = sslConfig;
        // Supabase from Railway: ensure sslmode=require in URL
        const rawUrl = process.env.DATABASE_URL;
        const dbUrl = rawUrl && rawUrl.includes('supabase.co') && !/[?&]sslmode=/.test(rawUrl)
          ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}sslmode=require`
          : rawUrl;
        // One-time schema sync for fresh Railway/cloud DB: set DATABASE_SYNC_SCHEMA=true, deploy once, then set false
        const synchronize = process.env.DATABASE_SYNC_SCHEMA === 'true';
        return dbUrl
          ? {
            type: 'postgres',
            url: dbUrl,
            entities: [__dirname + '/entities/**/*.entity{.ts,.js}'],
            synchronize,
            logging: process.env.NODE_ENV === 'development',
            ssl: sslConfig,
            extra,
          }
          : {
            type: 'postgres',
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT || '5432', 10),
            username: process.env.DATABASE_USER || 'postgres',
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME || 'postgres',
            entities: [__dirname + '/entities/**/*.entity{.ts,.js}'],
            synchronize,
            logging: process.env.NODE_ENV === 'development',
            ssl: sslConfig,
            extra,
          };
      })(),
    ),
    TypeOrmModule.forFeature([
      // Core CRM Entities
      Customer,
      Lead,
      Opportunity,
      Contact,
      Account,
      SalesPipeline,
      PipelineStage,
      CustomerInteraction,
      SalesQuote,
      CustomerSegment,
      MarketingCampaign,
      EmailTemplate,
      MarketingAnalytics,

      // Advanced Industry 5.0 Entities
      User,
      Role,
      Permission,
      Tenant,
      Organization,
      MasterOrganization,
      SubscriptionPlan,
      AuditLog,
      SecurityAuditLog,
      SecurityPolicy,
      ComplianceRecord,
      CustomerExperience,
      HolographicSession,
      CustomerInsight,

      // Support & Service Entities
      SupportTicket,
      StaffRole,
      SLA,
      KnowledgeBaseArticle,
      Workflow,
      BusinessRule,
      Dashboard,
      CustomerDigitalTwin,

      // Phase 1: Import/Export
      ImportJob,
      ExportJob,

      // Phase 1: Email System
      EmailCampaign,
      EmailSequence,
      EmailTracking,
      EmailLog,

      // Phase 1: Activity & Tasks
      Task,
      Activity,
      Note,
      Event,
      Reminder,

      // Phase 2: Reporting & Analytics
      Report,
      ReportSchedule,
      AnalyticsSnapshot,

      // Phase 2: Document Management
      Document,
      DocumentVersion,
      DocumentSignature,
      Contract,

      // Phase 2: Customer Portal
      PortalUser,
      PortalTicket,
      PortalSession,

      // Phase 2: Lead Capture Forms
      Form,
      FormSubmission,
      FormField,

      // Phase 3: Sales Automation
      SalesSequence,
      SequenceEnrollment,
      Territory,

      // Phase 3: Product Catalog
      Product,
      ProductCategory,
      PriceList,
      Discount,
      ProductBundle,

      // Phase 3: Telephony
      Call,
      CallRecording,
      CallQueue,
      PhoneNumber,
      PhoneVerification,
      IVRMenu,

      // Phase 3: Mobile
      MobileDevice,
      NotificationProviderHealth,
      NotificationTemplate,
      PushNotification,
      OfflineSync,

      // Payment & Billing
      BillingTransaction,
      OnboardingSession,
      UsageMetric,
      EnterprisePayment,

      // Migration
      DataMigrationJob,
      ERPFieldMapping,
      ERPConnection,

      // Industry 5.0 Complete API - Quantum Intelligence
      QuantumProfile,
      EntanglementAnalysis,
      QuantumState,

      // Industry 5.0 - Holographic Experience
      HolographicProjection,
      SpatialSession,
      InteractiveHologram,

      // Industry 5.0 - AR/VR Sales
      VRShowroom,
      VirtualMeeting,
      ProductDemo3D,
      VRConfiguration,

      // Industry 5.0 - Contract Management
      ContractRenewal,
      ContractAmendment,
      ContractTemplate,
      ContractApproval,

      // Industry 5.0 - Advanced Inventory
      Warehouse,
      StockLevel,
      InventoryTransfer,
      ReorderPoint,
      InventoryAudit,

      // Industry 5.0 - Catalog Management
      Catalog,
      CatalogProduct,
      CatalogPublication,
      CatalogVersion,

      // Industry 5.0 - LLM Integration
      LLMConversation,
      LLMMessage,
      LLMAnalysis,
      GeneratedContent,
      LLMModel,

      // Industry 5.0 - Real-Time Analytics
      RealTimeEvent,
      LiveMetric,
      DashboardSubscription,
      AlertRule,

      // ===== NEW: 18 Super Admin Feature Entities =====
      PlatformAnalyticsSnapshot,
      RevenueTransaction,
      OrganizationHealthScore,
      ImpersonationSession,
      SecurityEvent,
      ComplianceCheck,
      AdminSupportTicket,
      SystemConfiguration,
      FeatureFlag,
      PlatformAnnouncement,
      AutomationWorkflow,
      CustomReport,
      OnboardingChecklist,
      KPIGoal,
      ABTest,
      APIKey,
      PushNotificationTemplate,
      WhiteLabelConfig,

      // ===== NEW: 15 Advanced Feature Entities (19-33) =====
      ChurnPrediction,
      RevenueForecast,
      Recommendation,
      NaturalLanguageQuery,
      AnomalyDetection,
      DatabaseQuery,
      AuditLogEntity,
      PerformanceMetric,
      BackupJob,
      FinancialCohort,
      Invoice,
      CustomerSuccessMilestone,
      SupportAnalytics,
      SandboxEnvironment,
      Deployment,
    ]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'industry5.0-crm-secret',
      signOptions: { expiresIn: '24h' },
    }),
    // TODO: Re-enable when sales-marketing module is fixed
    // SalesMarketingModule, // Import Sales & Marketing Module for AI services
  ],
  controllers: [
    HealthController,  // Health endpoints at / and /health (excluded from /api/v1 prefix)
    RootController,
    AuthController,
    CRMController,
    SalesController,
    SalesOrderController,
    CustomerController,
    AccountController,
    ContactController,
    CRMAIIntegrationController,
    MarketingController,
    SupportController,

    // Core Management Controllers
    OrganizationController,
    UserManagementController,
    UserTierController,
    OrganizationFeaturesController,
    AnalyticsTelemetryController,
    SubscriptionPlansController,

    // Big Bang Week 1: Staff & Support (Simple/Mock versions for rapid development)
    StaffManagementSimpleController,
    SupportTicketsSimpleController,

    // ===== NEW: 18 Super Admin Feature Controllers =====
    PlatformAnalyticsController,
    RevenueBillingController,
    OrganizationHealthController,
    UserImpersonationController,
    SecurityComplianceController,
    FeatureUsageAnalyticsController,
    AdminSupportTicketController,
    SystemConfigurationController,
    CommunicationCenterController,
    AutomationWorkflowsController,
    CustomReportingController,
    MultiRegionController,
    AdminOnboardingController,
    KPITrackingController,
    ABTestingController,
    APIManagementController,
    MobileAdminController,
    WhiteLabelController,

    // ===== NEW: 15 Advanced Feature Controllers (19-33) =====
    PredictiveAnalyticsController,
    RecommendationEngineController,
    NaturalLanguageQueryController,
    AnomalyDetectionController,
    HealthScoringV2Controller,
    DatabaseManagementController,
    AdvancedAuditController,
    PerformanceMonitoringController,
    DisasterRecoveryController,
    AdvancedFinancialController,
    InvoicePaymentController,
    CustomerSuccessController,
    SupportAnalyticsController,
    DeveloperPortalController,
    ReleaseManagementController,

    // MFA Controller
    MFAController,

    // Phase 1 Controllers
    ImportExportController,
    EmailController,
    ActivityController,
    CalendarController,
    AuditLogController,

    // Phase 2 Controllers
    ReportingController,
    DocumentController,
    PortalController,
    FormController,
    DashboardController,
    NotificationController,

    // Phase 3 Controllers
    SequenceController,
    TerritoryController,

    // Phase 3: Product Catalog Controllers
    ProductController,
    CategoryController,
    BundleController,
    PriceListController,
    DiscountController,
    PricingController,

    // Phase 3: Telephony Controllers
    CallController,
    CallQueueController,
    CallAnalyticsController,
    IVRMenuController,

    // Phase 3: Mobile Controllers
    MobileDeviceController,
    PushNotificationController,
    OfflineSyncController,
    MobileSettingsController,
    MobileWebhookController,

    // Billing & Payment Controllers
    StripePaymentController,
    StripeWebhookController,
    BillingTransactionController,
    UsageTrackingController,
    OrganizationBillingController,
    EnterprisePaymentController,

    // System Management Controllers
    MonitoringController,
    PerformanceController,
    ThrottlingController,
    OnboardingController,
    MigrationController,
    IntegrationHubController,
    WorkflowController,

    // Industry 5.0 Complete API Controllers
    QuantumIntelligenceController,
    HolographicExperienceController,
    ARVRSalesController,
    ContractManagementController,
    InventoryManagementController,
    CatalogManagementController,
    LLMIntegrationController,
    RealTimeAnalyticsController,
  ],
  providers: [
    // Gateways
    AnalyticsGateway,

    // Core CRM Services
    AuthService,
    DemoDataService,
    CRMService,
    SalesService,
    SalesOrderService,
    CustomerService,
    LeadService,
    CRMAIIntegrationService,
    MarketingService,
    SupportService,

    // ===== NEW: 18 Super Admin Feature Services =====
    PlatformAnalyticsService,
    RevenueBillingService,
    OrganizationHealthService,
    UserImpersonationService,
    SecurityComplianceService,
    FeatureUsageAnalyticsService,
    AdminSupportTicketService,
    SystemConfigurationService,
    CommunicationCenterService,
    AutomationWorkflowsService,
    CustomReportingService,
    MultiRegionService,
    AdminOnboardingService,
    KPITrackingService,
    ABTestingService,
    APIManagementService,
    MobileAdminService,
    WhiteLabelService,

    // ===== NEW: 15 Advanced Feature Services (19-33) =====
    PredictiveAnalyticsService,
    RecommendationEngineService,
    NaturalLanguageQueryService,
    AnomalyDetectionService,
    HealthScoringV2Service,
    DatabaseManagementService,
    AdvancedAuditService,
    PerformanceMonitoringService,
    DisasterRecoveryService,
    AdvancedFinancialService,
    InvoicePaymentService,
    CustomerSuccessService,
    SupportAnalyticsService,
    DeveloperPortalService,
    ReleaseManagementService,

    // Advanced Industry 5.0 Services
    AICustomerIntelligenceService,
    QuantumPersonalizationEngine,
    ARVRSalesExperienceService,
    AutonomousJourneyOrchestratorService,
    AdvancedPredictiveAnalyticsService,
    EnterpriseSecurityComplianceService,
    QuantumCustomerIntelligenceFusionService,
    HolographicCustomerExperienceService,

    // New Advanced Services for 100% Completion
    ConversationalAIService,
    RealTimeCustomerAnalyticsService,
    LLMService,
    WorkflowBuilderService,
    MFAService,

    // Integration Hub Services
    IntegrationHubService,
    ERPIntegrationService,
    EmailIntegrationService,
    CalendarSyncService,
    MessagingPlatformIntegrationService,
    DataWarehouseConnectorService,

    // Error Handling
    CRMErrorHandlerMiddleware,
    CRMGlobalErrorHandler,

    // Security Guards (Legacy)
    RBACGuard,
    RolesGuard,

    // JWT Strategy
    JwtStrategy,

    // New Security Guards
    TenantGuard,
    JwtAuthGuard,
    RBACGuard,
    RolesGuard,
    ApiKeyGuard,
    RateLimitGuard,
    ResourceOwnerGuard,

    // External Services (provided by imported modules)
    // AISalesMarketingService - provided by SalesMarketingModule

    // Phase 1: Import/Export Services
    ImportService,
    ExportService,

    // Phase 1: Email System Services
    EmailSenderService,
    EmailCampaignService,
    EmailNotificationService,
    NotificationSchedulerService,

    // Phase 1: Activity & Task Services
    TaskService,
    ActivityLoggerService,
    CalendarService,

    // Phase 12: Audit Logging
    AuditLogService,
    AuditLogInterceptor,

    // Phase 2: Reporting & Analytics Services
    ReportBuilderService,
    FunnelAnalysisService,
    CohortAnalysisService,
    RevenueForecastingService,
    ReportSchedulerService,

    // Phase 2: Document Management Services
    DocumentService,
    SignatureService,
    ContractService,

    // Phase 2: Customer Portal Services
    PortalAuthService,
    PortalTicketService,
    PortalService,

    // Phase 2: Lead Capture Forms Services
    FormService,

    // Organization & Subscription Services
    OrganizationService,
    UserManagementService,
    UserTierService,
    SubscriptionService,

    // Dashboard Services
    AdminDashboardService,
    UserDashboardService,

    // Billing & Usage Services
    StripePaymentService,
    BillingTransactionService,
    UsageTrackingService,
    EnterpriseBillingService,

    // System Services
    MetricsService,
    AnalyticsService,
    DatabaseOptimizationService,
    PerformanceInterceptor,
    ThrottlingService,
    OnboardingService,

    // Migration Services
    UniversalCRMMigrationService,
    SalesforceMigrationService,
    DataMigrationService,

    // Phase 3: Sales Automation Services
    SequenceEngineService,
    TerritoryManagerService,
    SequenceAnalyticsService,

    // Phase 3: Product Catalog Services
    CatalogService,
    PricingEngineService,
    RecommendationEngineService,
    InventoryService,

    // Phase 3: Telephony Services
    TwilioService,
    CallService,
    CallQueueService,
    CallAnalyticsService,
    IVRMenuService,
    TelephonyWebSocketGateway,

    // Phase 3: Mobile Services
    MobileDeviceService,
    PushNotificationService,
    OfflineSyncService,

    // Industry 5.0 Complete API Services
    QuantumIntelligenceService,
    HolographicExperienceService,
    ARVRSalesService,
    ContractManagementService,
    InventoryManagementService,
    CatalogManagementService,
    LLMIntegrationService,
    RealTimeAnalyticsService,
    AnalyticsWebSocketGateway,
  ],
  exports: [
    // Core Services
    CRMService,
    SalesService,
    CustomerService,
    CRMAIIntegrationService,
    LLMService,
    MarketingService,

    // Advanced Services
    AICustomerIntelligenceService,
    QuantumPersonalizationEngine,
    ARVRSalesExperienceService,
    AutonomousJourneyOrchestratorService,
    AdvancedPredictiveAnalyticsService,
    EnterpriseSecurityComplianceService,
    QuantumCustomerIntelligenceFusionService,
    HolographicCustomerExperienceService,

    // New Advanced Services for 100% Completion
    ConversationalAIService,
    RealTimeCustomerAnalyticsService,

    // Error Handling
    CRMGlobalErrorHandler,

    // Guards (Legacy)
    RBACGuard,

    // New Security Guards
    TenantGuard,
    JwtAuthGuard,
    RBACGuard,
    ApiKeyGuard,
    RateLimitGuard,
    ResourceOwnerGuard,
  ],
})
export class CRMModule {
  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly userTierService: UserTierService,
  ) {
    // Initialize user tier service in user management service
    this.userManagementService.setUserTierService(this.userTierService);
  }
}
