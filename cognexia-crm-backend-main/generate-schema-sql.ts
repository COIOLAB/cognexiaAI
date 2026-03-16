import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as fs from 'fs';

// Import all entities directly
import { Account } from './src/entities/account.entity';
import { Activity } from './src/entities/activity.entity';
import { AnalyticsSnapshot } from './src/entities/analytics-snapshot.entity';
import { BusinessRule } from './src/entities/business-rule.entity';
import { Call } from './src/entities/call.entity';
import { CallQueue } from './src/entities/call-queue.entity';
import { CallRecording } from './src/entities/call-recording.entity';
import { ComplianceRecord } from './src/entities/compliance-record.entity';
import { Contact } from './src/entities/contact.entity';
import { Contract } from './src/entities/contract.entity';
import { Customer } from './src/entities/customer.entity';
import { CustomerDigitalTwin } from './src/entities/customer-digital-twin.entity';
import { CustomerExperience } from './src/entities/customer-experience.entity';
import { CustomerInsight } from './src/entities/customer-insight.entity';
import { CustomerInteraction } from './src/entities/customer-interaction.entity';
import { CustomerSegment } from './src/entities/customer-segment.entity';
import { Dashboard } from './src/entities/dashboard.entity';
import { Discount } from './src/entities/discount.entity';
import { Document } from './src/entities/document.entity';
import { DocumentSignature } from './src/entities/document-signature.entity';
import { DocumentVersion } from './src/entities/document-version.entity';
import { EmailCampaign } from './src/entities/email-campaign.entity';
import { EmailLog } from './src/entities/email-log.entity';
import { EmailSequence } from './src/entities/email-sequence.entity';
import { EmailTemplate } from './src/entities/email-template.entity';
import { EmailTracking } from './src/entities/email-tracking.entity';
import { Event } from './src/entities/event.entity';
import { ExportJob } from './src/entities/export-job.entity';
import { Form } from './src/entities/form.entity';
import { FormField } from './src/entities/form-field.entity';
import { FormSubmission } from './src/entities/form-submission.entity';
import { HolographicSession } from './src/entities/holographic-session.entity';
import { ImportJob } from './src/entities/import-job.entity';
import { IVRMenu } from './src/entities/ivr-menu.entity';
import { KnowledgeBaseArticle } from './src/entities/knowledge-base.entity';
import { Lead } from './src/entities/lead.entity';
import { MarketingAnalytics } from './src/entities/marketing-analytics.entity';
import { MarketingCampaign } from './src/entities/marketing-campaign.entity';
import { MobileDevice } from './src/entities/mobile-device.entity';
import { Note } from './src/entities/note.entity';
import { OfflineSync } from './src/entities/offline-sync.entity';
import { Opportunity } from './src/entities/opportunity.entity';
import { Permission } from './src/entities/permission.entity';
import { PhoneNumber } from './src/entities/phone-number.entity';
import { PortalSession } from './src/entities/portal-session.entity';
import { PortalUser } from './src/entities/portal-user.entity';
import { PriceList } from './src/entities/price-list.entity';
import { Product } from './src/entities/product.entity';
import { ProductBundle } from './src/entities/product-bundle.entity';
import { ProductCategory } from './src/entities/product-category.entity';
import { PushNotification } from './src/entities/push-notification.entity';
import { Reminder } from './src/entities/reminder.entity';
import { Report } from './src/entities/report.entity';
import { ReportSchedule } from './src/entities/report-schedule.entity';
import { Role } from './src/entities/role.entity';
import { SalesPipeline } from './src/entities/sales-pipeline.entity';
import { SalesQuote } from './src/entities/sales-quote.entity';
import { SalesSequence } from './src/entities/sales-sequence.entity';
import { SecurityAuditLog } from './src/entities/security-audit-log.entity';
import { SecurityPolicy } from './src/entities/security-policy.entity';
import { SequenceEnrollment } from './src/entities/sequence-enrollment.entity';
import { SLA } from './src/entities/sla.entity';
import { SupportTicket } from './src/entities/support-ticket.entity';
import { Task } from './src/entities/task.entity';
import { Territory } from './src/entities/territory.entity';
import { User } from './src/entities/user.entity';
import { Workflow } from './src/entities/workflow.entity';
import { Tenant } from './src/entities/tenant.entity';
import { PipelineStage } from './src/entities/pipeline-stage.entity';
import { PortalTicket } from './src/entities/portal-ticket.entity';

async function generateSQL() {
  console.log('📝 Loading TypeORM metadata from entities...\n');

  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: ':memory:', // SQLite in-memory - no network needed
    entities: [
      Account, Activity, AnalyticsSnapshot, BusinessRule,
      Call, CallQueue, CallRecording, ComplianceRecord,
      Contact, Contract, Customer, CustomerDigitalTwin,
      CustomerExperience, CustomerInsight, CustomerInteraction, CustomerSegment,
      Dashboard, Discount, Document, DocumentSignature,
      DocumentVersion, EmailCampaign, EmailLog, EmailSequence,
      EmailTemplate, EmailTracking, Event, ExportJob,
      Form, FormField, FormSubmission, HolographicSession,
      ImportJob, IVRMenu, KnowledgeBaseArticle, Lead,
      MarketingAnalytics, MarketingCampaign, MobileDevice, Note,
      OfflineSync, Opportunity, Permission, PhoneNumber,
      PortalSession, PortalUser, PriceList, Product,
      ProductBundle, ProductCategory, PushNotification, Reminder,
      Report, ReportSchedule, Role, SalesPipeline,
      SalesQuote, SalesSequence, SecurityAuditLog, SecurityPolicy,
      SequenceEnrollment, SLA, SupportTicket, Task,
      Territory, User, Workflow, Tenant, PipelineStage, PortalTicket
    ],
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    
    const queryRunner = dataSource.createQueryRunner();
    const upQueries = await dataSource.driver.createSchemaBuilder().log();
    
    console.log(`✅ Found ${upQueries.upQueries.length} SQL statements\n`);
    
    let sql = '-- CRM Module Database Schema\n';
    sql += '-- Generated by TypeORM\n';
    sql += `-- Date: ${new Date().toISOString()}\n`;
    sql += '-- Total Entities: 76+\n\n';
    
    upQueries.upQueries.forEach((query: any) => {
      sql += query.query + ';\n\n';
    });
    
    fs.writeFileSync('CRM-SCHEMA.sql', sql);
    
    console.log('✅ SQL schema saved to: CRM-SCHEMA.sql\n');
    console.log('📋 Instructions:');
    console.log('   1. Open https://supabase.com/dashboard/project/moijigidcrvbnjoaqelr/editor');
    console.log('   2. Copy the contents of CRM-SCHEMA.sql');
    console.log('   3. Paste and execute in the SQL Editor\n');
    
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

generateSQL();
