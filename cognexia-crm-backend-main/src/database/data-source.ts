import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config();

// Import all entities
// Multi-tenant SaaS entities
import { MasterOrganization } from '../entities/master-organization.entity';
import { Organization } from '../entities/organization.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { BillingTransaction } from '../entities/billing-transaction.entity';
import { UsageMetric } from '../entities/usage-metric.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { OnboardingSession } from '../entities/onboarding-session.entity';
import { EnterprisePayment } from '../entities/enterprise-payment.entity';
import { Tenant } from '../entities/tenant.entity';

// CRM entities
import { Account } from '../entities/account.entity';
import { Activity } from '../entities/activity.entity';
import { AnalyticsSnapshot } from '../entities/analytics-snapshot.entity';
import { BusinessRule } from '../entities/business-rule.entity';
import { Call } from '../entities/call.entity';
import { CallQueue } from '../entities/call-queue.entity';
import { CallRecording } from '../entities/call-recording.entity';
import { ComplianceRecord } from '../entities/compliance-record.entity';
import { Contact } from '../entities/contact.entity';
import { Contract } from '../entities/contract.entity';
import { Customer } from '../entities/customer.entity';
import { CustomerDigitalTwin } from '../entities/customer-digital-twin.entity';
import { CustomerExperience } from '../entities/customer-experience.entity';
import { CustomerInsight } from '../entities/customer-insight.entity';
import { CustomerInteraction } from '../entities/customer-interaction.entity';
import { CustomerSegment } from '../entities/customer-segment.entity';
import { Dashboard } from '../entities/dashboard.entity';
import { Discount } from '../entities/discount.entity';
import { Document } from '../entities/document.entity';
import { DocumentSignature } from '../entities/document-signature.entity';
import { DocumentVersion } from '../entities/document-version.entity';
import { EmailCampaign } from '../entities/email-campaign.entity';
import { EmailLog } from '../entities/email-log.entity';
import { EmailSequence } from '../entities/email-sequence.entity';
import { EmailTemplate } from '../entities/email-template.entity';
import { EmailTracking } from '../entities/email-tracking.entity';
import { Event } from '../entities/event.entity';
import { ExportJob } from '../entities/export-job.entity';
import { Form } from '../entities/form.entity';
import { FormField } from '../entities/form-field.entity';
import { FormSubmission } from '../entities/form-submission.entity';
import { HolographicSession } from '../entities/holographic-session.entity';
import { ImportJob } from '../entities/import-job.entity';
import { IVRMenu } from '../entities/ivr-menu.entity';
import { KnowledgeBaseArticle } from '../entities/knowledge-base.entity';
import { Lead } from '../entities/lead.entity';
import { MarketingAnalytics } from '../entities/marketing-analytics.entity';
import { MarketingCampaign } from '../entities/marketing-campaign.entity';
import { MobileDevice } from '../entities/mobile-device.entity';
import { NotificationProviderHealth } from '../entities/notification-provider-health.entity';
import { NotificationTemplate } from '../entities/notification-template.entity';
import { Note } from '../entities/note.entity';
import { OfflineSync } from '../entities/offline-sync.entity';
import { Opportunity } from '../entities/opportunity.entity';
import { Permission } from '../entities/permission.entity';
import { PhoneNumber } from '../entities/phone-number.entity';
import { PhoneVerification } from '../entities/phone-verification.entity';
import { PortalSession } from '../entities/portal-session.entity';
import { PortalUser } from '../entities/portal-user.entity';
import { PortalTicket } from '../entities/portal-ticket.entity';
import { PriceList } from '../entities/price-list.entity';
import { Product } from '../entities/product.entity';
import { ProductBundle } from '../entities/product-bundle.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { PushNotification } from '../entities/push-notification.entity';
import { Reminder } from '../entities/reminder.entity';
import { Report } from '../entities/report.entity';
import { ReportSchedule } from '../entities/report-schedule.entity';
import { Role } from '../entities/role.entity';
import { SalesPipeline } from '../entities/sales-pipeline.entity';
import { PipelineStage } from '../entities/pipeline-stage.entity';
import { SalesQuote } from '../entities/sales-quote.entity';
import { SalesSequence } from '../entities/sales-sequence.entity';
import { SecurityAuditLog } from '../entities/security-audit-log.entity';
import { SecurityPolicy } from '../entities/security-policy.entity';
import { SequenceEnrollment } from '../entities/sequence-enrollment.entity';
import { SLA } from '../entities/sla.entity';
import { SupportTicket } from '../entities/support-ticket.entity';
import { StaffRole } from '../entities/staff-role.entity';
import { Task } from '../entities/task.entity';
import { Territory } from '../entities/territory.entity';
import { User } from '../entities/user.entity';
import { Workflow } from '../entities/workflow.entity';

const isRemoteDb =
  !!process.env.DATABASE_URL ||
  (process.env.DATABASE_HOST && process.env.DATABASE_HOST !== 'localhost');
const sslConfig = isRemoteDb ? { rejectUnauthorized: false } : false;

// Ensure Supabase URLs have sslmode=require (required when connecting from Railway)
function normalizeDatabaseUrl(url: string | undefined): string | undefined {
  if (!url || !url.includes('supabase.co')) return url;
  if (/[?&]sslmode=/.test(url)) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}sslmode=require`;
}
const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
const extra: Record<string, unknown> = {
  max: parseInt(process.env.DATABASE_POOL_MAX || '100', 10),
  min: parseInt(process.env.DATABASE_POOL_MIN || '10', 10),
  idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '60000', 10),
};
if (sslConfig) (extra as Record<string, unknown>).ssl = sslConfig;

const dataSourceOptions: DataSourceOptions = databaseUrl
  ? {
      type: 'postgres',
      url: databaseUrl,
      entities: [
    // Multi-tenant entities
    MasterOrganization,
    Organization,
    SubscriptionPlan,
    BillingTransaction,
    UsageMetric,
    AuditLog,
    OnboardingSession,
    EnterprisePayment,
    Tenant,
    // CRM entities
    Account,
    Activity,
    AnalyticsSnapshot,
    BusinessRule,
    Call,
    CallQueue,
    CallRecording,
    ComplianceRecord,
    Contact,
    Contract,
    Customer,
    CustomerDigitalTwin,
    CustomerExperience,
    CustomerInsight,
    CustomerInteraction,
    CustomerSegment,
    Dashboard,
    Discount,
    Document,
    DocumentSignature,
    DocumentVersion,
    EmailCampaign,
    EmailLog,
    EmailSequence,
    EmailTemplate,
    EmailTracking,
    Event,
    ExportJob,
    Form,
    FormField,
    FormSubmission,
    HolographicSession,
    ImportJob,
    IVRMenu,
    KnowledgeBaseArticle,
    Lead,
    MarketingAnalytics,
    MarketingCampaign,
    MobileDevice,
    NotificationProviderHealth,
    NotificationTemplate,
    Note,
    OfflineSync,
    Opportunity,
    Permission,
    PhoneNumber,
    PhoneVerification,
    PortalSession,
    PortalUser,
    PortalTicket,
    PriceList,
    Product,
    ProductBundle,
    ProductCategory,
    PushNotification,
    Reminder,
    Report,
    ReportSchedule,
    Role,
    SalesPipeline,
    PipelineStage,
    SalesQuote,
    SalesSequence,
    SecurityAuditLog,
    SecurityPolicy,
    SequenceEnrollment,
    SLA,
    SupportTicket,
    StaffRole,
    Task,
    Territory,
    User,
    Workflow,
  ],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
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
      entities: [
        MasterOrganization,
        Organization,
        SubscriptionPlan,
        BillingTransaction,
        UsageMetric,
        AuditLog,
        OnboardingSession,
        EnterprisePayment,
        Tenant,
        Account,
        Activity,
        AnalyticsSnapshot,
        BusinessRule,
        Call,
        CallQueue,
        CallRecording,
        ComplianceRecord,
        Contact,
        Contract,
        Customer,
        CustomerDigitalTwin,
        CustomerExperience,
        CustomerInsight,
        CustomerInteraction,
        CustomerSegment,
        Dashboard,
        Discount,
        Document,
        DocumentSignature,
        DocumentVersion,
        EmailCampaign,
        EmailLog,
        EmailSequence,
        EmailTemplate,
        EmailTracking,
        Event,
        ExportJob,
        Form,
        FormField,
        FormSubmission,
        HolographicSession,
        ImportJob,
        IVRMenu,
        KnowledgeBaseArticle,
        Lead,
        MarketingAnalytics,
        MarketingCampaign,
        MobileDevice,
        NotificationProviderHealth,
        NotificationTemplate,
        Note,
        OfflineSync,
        Opportunity,
        Permission,
        PhoneNumber,
        PhoneVerification,
        PortalSession,
        PortalUser,
        PortalTicket,
        PriceList,
        Product,
        ProductBundle,
        ProductCategory,
        PushNotification,
        Reminder,
        Report,
        ReportSchedule,
        Role,
        SalesPipeline,
        PipelineStage,
        SalesQuote,
        SalesSequence,
        SecurityAuditLog,
        SecurityPolicy,
        SequenceEnrollment,
        SLA,
        SupportTicket,
        StaffRole,
        Task,
        Territory,
        User,
        Workflow,
      ],
      migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      ssl: sslConfig,
      extra,
    };

const AppDataSource = new DataSource(dataSourceOptions);

// Initialize connection
export const initializeDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection initialized successfully');
      
      // Run migrations in production
      if (process.env.NODE_ENV === 'production') {
        await AppDataSource.runMigrations();
        console.log('✅ Migrations executed successfully');
      }
    }
    return AppDataSource;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

// Close connection
export const closeDatabase = async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
  }
};

export default AppDataSource;
