import { DataSource } from 'typeorm';
import { Organization, OrganizationStatus, SubscriptionStatus } from './src/entities/organization.entity';
import { Tenant } from './src/entities/tenant.entity';
import { User, UserType } from './src/entities/user.entity';
import { Customer } from './src/entities/customer.entity';
import { Contact } from './src/entities/contact.entity';
import { Product, ProductType, ProductStatus } from './src/entities/product.entity';
import { ProductCategory } from './src/entities/product-category.entity';
import { Catalog, CatalogStatus } from './src/entities/catalog.entity';
import { CatalogProduct } from './src/entities/catalog-product.entity';
import { Task, TaskPriority } from './src/entities/task.entity';
import { Note } from './src/entities/note.entity';
import { CallQueue, QueueStrategy } from './src/entities/call-queue.entity';
import { Call, CallDirection, CallStatus } from './src/entities/call.entity';
import { MobileDevice, DevicePlatform, DeviceStatus } from './src/entities/mobile-device.entity';
import { EmailCampaign } from './src/entities/email-campaign.entity';
import { Form, FormStatus } from './src/entities/form.entity';
import { Report, ReportType, ChartType } from './src/entities/report.entity';
import { ReportSchedule, ScheduleFrequency, DeliveryFormat } from './src/entities/report-schedule.entity';
import { ImportJob, ImportStatus, ImportType } from './src/entities/import-job.entity';
import { ExportJob, ExportStatus, ExportFormat } from './src/entities/export-job.entity';
import { SalesSequence, SequenceStatus, StepType } from './src/entities/sales-sequence.entity';
import { SequenceEnrollment, EnrollmentStatus } from './src/entities/sequence-enrollment.entity';
import { Lead, LeadStatus, LeadSource, QualificationStatus, SalesStage } from './src/entities/lead.entity';
import { Territory, AssignmentStrategy } from './src/entities/territory.entity';
import { MarketingCampaign, CampaignStatus, CampaignType } from './src/entities/marketing-campaign.entity';
import { CustomerSegment, SegmentType } from './src/entities/customer-segment.entity';
import { EmailTemplate } from './src/entities/email-template.entity';
import { SupportTicket, TicketStatus, TicketPriority, TicketCategory, TicketChannel } from './src/entities/support-ticket.entity';
import { KnowledgeBaseArticle, ArticleStatus, ArticleVisibility, ArticleType } from './src/entities/knowledge-base.entity';
import { Document, DocumentType, DocumentStatus } from './src/entities/document.entity';
import { DocumentVersion } from './src/entities/document-version.entity';
import { DocumentSignature, SignatureStatus } from './src/entities/document-signature.entity';
import { Contract, ContractStatus, ContractType, RenewalType } from './src/entities/contract.entity';
import { ProductBundle, BundleType } from './src/entities/product-bundle.entity';
import { PriceList, PriceListType } from './src/entities/price-list.entity';
import { Discount, DiscountType, DiscountApplicability } from './src/entities/discount.entity';
import { BillingTransaction, TransactionStatus, TransactionType } from './src/entities/billing-transaction.entity';
import { Dashboard, DashboardVisibility } from './src/entities/dashboard.entity';
import { PortalUser, PortalUserStatus } from './src/entities/portal-user.entity';
import { PortalTicket, TicketStatus as PortalTicketStatus, TicketPriority as PortalTicketPriority } from './src/entities/portal-ticket.entity';
import { OnboardingSession, OnboardingStatus, OnboardingType } from './src/entities/onboarding-session.entity';
import { DataMigrationJob, MigrationType, MigrationStatus } from './src/entities/data-migration-job.entity';
import { ERPConnection } from './src/entities/erp-connection.entity';
import { LLMConversation, ConversationStatus } from './src/entities/llm-conversation.entity';
import { OfflineSync, SyncEntityType, SyncOperation, SyncStatus } from './src/entities/offline-sync.entity';
import { Warehouse } from './src/entities/warehouse.entity';
import { StockLevel } from './src/entities/stock-level.entity';
import { InventoryTransfer, TransferStatus } from './src/entities/inventory-transfer.entity';
import { ReorderPoint } from './src/entities/reorder-point.entity';
import { InventoryAudit, AuditStatus } from './src/entities/inventory-audit.entity';
import { HolographicProjection } from './src/entities/holographic-projection.entity';
import { SpatialSession } from './src/entities/spatial-session.entity';
import {
  Opportunity,
  OpportunityStage,
  OpportunityType,
  OpportunityPriority,
  CompetitivePosition,
} from './src/entities/opportunity.entity';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const IDS = {
  organizationId: '00000000-0000-0000-0000-000000000001',
  organizationDeleteId: '55555555-5555-4555-8555-555555555555',
  tenantId: '00000000-0000-0000-0000-000000000001',
  fixtureUserId: '00000000-0000-0000-0000-000000000010',
  customerId: '00000000-0000-0000-0000-000000000456',
  customerV4Id: '11111111-1111-4111-8111-111111111111',
  contactId: 'f1f1f1f1-f1f1-4f1f-8f1f-f1f1f1f1f1f1',
  productId: '00000000-0000-0000-0000-000000000123',
  productV4Id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  productDeleteId: '66666666-6666-4666-8666-666666666666',
  categoryId: '00000000-0000-0000-0000-000000000201',
  catalogId: '00000000-0000-0000-0000-000000000202',
  catalogDeleteId: '77777777-7777-4777-8777-777777777777',
  catalogProductId: '00000000-0000-0000-0000-000000000203',
  taskId: '00000000-0000-0000-0000-000000000204',
  noteId: '00000000-0000-0000-0000-000000000205',
  callQueueId: '00000000-0000-0000-0000-000000000206',
  callQueueDeleteId: '99999999-9999-4999-8999-999999999999',
  callId: '00000000-0000-0000-0000-000000000207',
  mobileDeviceId: '00000000-0000-0000-0000-000000000301',
  emailCampaignId: '00000000-0000-0000-0000-000000000208',
  formId: '00000000-0000-0000-0000-000000000209',
  reportId: '00000000-0000-0000-0000-000000000210',
  reportScheduleId: '00000000-0000-0000-0000-000000000211',
  importJobId: '00000000-0000-0000-0000-000000000302',
  exportJobId: '00000000-0000-0000-0000-000000000303',
  sequenceId: 'abababab-abab-4aba-8aba-abababababab',
  sequenceDeleteId: '88888888-8888-4888-8888-888888888888',
  enrollmentId: '00000000-0000-0000-0000-000000000213',
  enrollmentV4Id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  leadId: '00000000-0000-0000-0000-000000000214',
  leadV4Id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  opportunityId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  territoryId: 'cdcdcdcd-cdcd-4cdc-8cdc-cdcdcdcdcdcd',
  marketingCampaignId: '00000000-0000-0000-0000-000000000216',
  marketingCampaignV4Id: '22222222-2222-4222-8222-222222222222',
  marketingSegmentId: '99999999-9999-4999-8999-999999999999',
  marketingTemplateId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  supportTicketId: '00000000-0000-0000-0000-000000000217',
  knowledgeBaseId: '00000000-0000-0000-0000-000000000218',
  documentId: '00000000-0000-0000-0000-000000000219',
  documentSignatureId: '00000000-0000-0000-0000-000000000220',
  contractId: '00000000-0000-0000-0000-000000000221',
  documentVersionId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  bundleId: '00000000-0000-0000-0000-000000000222',
  priceListId: '00000000-0000-0000-0000-000000000223',
  discountId: '00000000-0000-0000-0000-000000000224',
  billingTransactionId: '00000000-0000-0000-0000-000000000225',
  dashboardId: '00000000-0000-0000-0000-000000000226',
  portalUserId: '00000000-0000-0000-0000-000000000227',
  portalInviteUserId: '00000000-0000-0000-0000-000000000304',
  portalTicketId: '00000000-0000-0000-0000-000000000228',
  onboardingId: '00000000-0000-0000-0000-000000000229',
  migrationJobId: '00000000-0000-0000-0000-000000000230',
  erpConnectionId: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
  offlineSyncId: '12121212-1212-4121-8121-121212121212',
  warehouseId: '13131313-1313-4131-8131-131313131313',
  warehouseId2: '14141414-1414-4141-8141-141414141414',
  holographicProjectionId: 'efefefef-efef-4efe-8efe-efefefefefef',
  spatialSessionId: 'ababbbbb-cccc-4ddd-8eee-ffffffffffff',
  llmConversationId: '00000000-0000-0000-0000-000000000231',
};

async function upsert<T extends { id: string }>(repo: any, data: T) {
  const existing = await repo.findOne({ where: { id: data.id } });
  if (existing) {
    await repo.save({ ...existing, ...data });
    return existing;
  }
  return repo.save(data);
}

const SeedDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'Akshita@19822',
  database: process.env.DATABASE_NAME || 'cognexia_crm',
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: true,
});

async function seedFixtures() {
  const orgRepo = SeedDataSource.getRepository(Organization);
  const tenantRepo = SeedDataSource.getRepository(Tenant);
  const userRepo = SeedDataSource.getRepository(User);
  const customerRepo = SeedDataSource.getRepository(Customer);
  const contactRepo = SeedDataSource.getRepository(Contact);
  const productRepo = SeedDataSource.getRepository(Product);
  const categoryRepo = SeedDataSource.getRepository(ProductCategory);
  const catalogRepo = SeedDataSource.getRepository(Catalog);
  const catalogProductRepo = SeedDataSource.getRepository(CatalogProduct);
  const taskRepo = SeedDataSource.getRepository(Task);
  const noteRepo = SeedDataSource.getRepository(Note);
  const callQueueRepo = SeedDataSource.getRepository(CallQueue);
  const callRepo = SeedDataSource.getRepository(Call);
  const mobileDeviceRepo = SeedDataSource.getRepository(MobileDevice);
  const emailCampaignRepo = SeedDataSource.getRepository(EmailCampaign);
  const formRepo = SeedDataSource.getRepository(Form);
  const reportRepo = SeedDataSource.getRepository(Report);
  const reportScheduleRepo = SeedDataSource.getRepository(ReportSchedule);
  const importJobRepo = SeedDataSource.getRepository(ImportJob);
  const exportJobRepo = SeedDataSource.getRepository(ExportJob);
  const sequenceRepo = SeedDataSource.getRepository(SalesSequence);
  const enrollmentRepo = SeedDataSource.getRepository(SequenceEnrollment);
  const leadRepo = SeedDataSource.getRepository(Lead);
  const opportunityRepo = SeedDataSource.getRepository(Opportunity);
  const territoryRepo = SeedDataSource.getRepository(Territory);
  const marketingCampaignRepo = SeedDataSource.getRepository(MarketingCampaign);
  const marketingSegmentRepo = SeedDataSource.getRepository(CustomerSegment);
  const emailTemplateRepo = SeedDataSource.getRepository(EmailTemplate);
  const supportTicketRepo = SeedDataSource.getRepository(SupportTicket);
  const knowledgeRepo = SeedDataSource.getRepository(KnowledgeBaseArticle);
  const documentRepo = SeedDataSource.getRepository(Document);
  const documentVersionRepo = SeedDataSource.getRepository(DocumentVersion);
  const documentSignatureRepo = SeedDataSource.getRepository(DocumentSignature);
  const contractRepo = SeedDataSource.getRepository(Contract);
  const bundleRepo = SeedDataSource.getRepository(ProductBundle);
  const priceListRepo = SeedDataSource.getRepository(PriceList);
  const discountRepo = SeedDataSource.getRepository(Discount);
  const billingRepo = SeedDataSource.getRepository(BillingTransaction);
  const dashboardRepo = SeedDataSource.getRepository(Dashboard);
  const portalUserRepo = SeedDataSource.getRepository(PortalUser);
  const portalTicketRepo = SeedDataSource.getRepository(PortalTicket);
  const onboardingRepo = SeedDataSource.getRepository(OnboardingSession);
  const migrationRepo = SeedDataSource.getRepository(DataMigrationJob);
  const erpConnectionRepo = SeedDataSource.getRepository(ERPConnection);
  const llmRepo = SeedDataSource.getRepository(LLMConversation);
  const offlineSyncRepo = SeedDataSource.getRepository(OfflineSync);
  const warehouseRepo = SeedDataSource.getRepository(Warehouse);
  const stockLevelRepo = SeedDataSource.getRepository(StockLevel);
  const transferRepo = SeedDataSource.getRepository(InventoryTransfer);
  const reorderRepo = SeedDataSource.getRepository(ReorderPoint);
  const auditRepo = SeedDataSource.getRepository(InventoryAudit);
  const holographicProjectionRepo = SeedDataSource.getRepository(HolographicProjection);
  const spatialSessionRepo = SeedDataSource.getRepository(SpatialSession);

  await upsert(orgRepo, {
    id: IDS.organizationId,
    name: 'CognexiaAI Fixture Org',
    email: 'fixtures@cognexiaai.com',
    isActive: true,
    status: OrganizationStatus.ACTIVE,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    maxUsers: 999,
    currentUserCount: 1,
    metadata: { seeded: true },
  });

  await upsert(orgRepo, {
    id: IDS.organizationDeleteId,
    name: 'CognexiaAI Delete Org',
    email: 'delete-org@cognexiaai.com',
    isActive: true,
    status: OrganizationStatus.ACTIVE,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    maxUsers: 1,
    currentUserCount: 0,
    metadata: { seeded: true, deleteSafe: true },
  });

  await upsert(tenantRepo, {
    id: IDS.tenantId,
    name: 'CognexiaAI Fixture Tenant',
    isActive: true,
    settings: { seeded: true },
  });

  const passwordHash = await bcrypt.hash('TestUser123!', 10);
  await upsert(userRepo, {
    id: IDS.fixtureUserId,
    email: 'fixture.user@cognexiaai.com',
    firstName: 'Fixture',
    lastName: 'User',
    passwordHash,
    userType: UserType.ORG_ADMIN,
    organizationId: IDS.organizationId,
    roles: ['org_admin'],
    permissions: ['*'],
    isActive: true,
    isEmailVerified: true,
  });

  const adminUser = await userRepo.findOne({
    where: { email: 'superadmin@cognexiaai.com' },
  });
  const adminUserId = adminUser?.id || IDS.fixtureUserId;

  await upsert(customerRepo, {
    id: IDS.customerId,
    customerCode: 'FIXTURE-CUST-001',
    companyName: 'Fixture Customer',
    customerType: 'b2b',
    status: 'active',
    industry: 'Technology',
    size: 'small_medium',
    primaryContact: {
      firstName: 'Fixture',
      lastName: 'Customer',
      title: 'CTO',
      email: 'customer@cognexiaai.com',
      phone: '+15550001112',
    },
    address: {
      street: '100 Test Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zipCode: '94105',
      region: 'West',
    },
    preferences: {
      language: 'en',
      currency: 'USD',
      timezone: 'America/Los_Angeles',
    },
    createdBy: 'seed-fixtures',
    updatedBy: 'seed-fixtures',
  });

  await upsert(customerRepo, {
    id: IDS.customerV4Id,
    customerCode: 'FIXTURE-CUST-002',
    companyName: 'Fixture Customer V4',
    customerType: 'b2b',
    status: 'active',
    industry: 'Technology',
    size: 'small_medium',
    primaryContact: {
      firstName: 'Fixture',
      lastName: 'CustomerV4',
      title: 'VP',
      email: 'customer.v4@cognexiaai.com',
      phone: '+15550002222',
    },
    address: {
      street: '200 Test Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zipCode: '94105',
      region: 'West',
    },
    demographics: {
      foundedYear: 2021,
      employeeCount: 25,
      annualRevenue: 500000,
      website: 'https://fixture-v4.example.com',
    },
    preferences: {
      language: 'en',
      currency: 'USD',
      timezone: 'America/Los_Angeles',
    },
    salesMetrics: {
      totalRevenue: 10000,
      averageOrderValue: 1000,
      paymentTerms: 'Net 30',
    },
    relationshipMetrics: {
      customerSince: new Date().toISOString(),
      loyaltyScore: 70,
      satisfactionScore: 80,
      npsScore: 7,
    },
    segmentation: {
      segment: 'SMB',
      tier: 'silver',
      riskLevel: 'low',
      growthPotential: 'medium',
    },
    createdBy: 'seed-fixtures',
    updatedBy: 'seed-fixtures',
  });

  await upsert(contactRepo, {
    id: IDS.contactId,
    customerId: IDS.customerV4Id,
    type: 'primary',
    status: 'active',
    firstName: 'Fixture',
    lastName: 'Contact',
    fullName: 'Fixture Contact',
    title: 'Manager',
    email: 'fixture.contact@cognexiaai.com',
    communicationPrefs: {
      preferredChannel: 'email',
      preferredTime: '09:00-17:00',
      timezone: 'UTC',
      frequency: 'weekly',
      language: 'en',
      doNotCall: false,
      emailOptOut: false,
    },
    createdBy: 'seed-fixtures',
    updatedBy: 'seed-fixtures',
  });

  await upsert(productRepo, {
    id: IDS.productId,
    tenantId: IDS.tenantId,
    name: 'Fixture Product',
    sku: 'FIX-PROD-001',
    description: 'Fixture product for API tests',
    shortDescription: 'Fixture product',
    type: 'physical',
    status: 'active',
    basePrice: 99.99,
    costPrice: 50.0,
    msrp: 129.99,
    currency: 'USD',
    trackInventory: true,
    quantityInStock: 100,
    quantityReserved: 0,
    lowStockThreshold: 10,
    allowBackorder: false,
    brand: 'CognexiaAI',
    tags: ['fixture'],
    isFeatured: false,
    isOnSale: false,
  });

  await upsert(productRepo, {
    id: IDS.productV4Id,
    tenantId: IDS.tenantId,
    name: 'Fixture Product V4',
    sku: 'FIX-PROD-002',
    description: 'Fixture product with v4 id',
    shortDescription: 'Fixture product v4',
    type: ProductType.PHYSICAL,
    status: ProductStatus.ACTIVE,
    basePrice: 129.99,
    costPrice: 60.0,
    msrp: 149.99,
    currency: 'USD',
    trackInventory: true,
    quantityInStock: 50,
    quantityReserved: 0,
    lowStockThreshold: 5,
    allowBackorder: false,
    brand: 'CognexiaAI',
    tags: ['fixture', 'v4'],
    isFeatured: false,
    isOnSale: false,
  });

  await upsert(productRepo, {
    id: IDS.productDeleteId,
    tenantId: IDS.tenantId,
    name: 'Delete Safe Product',
    sku: 'DEL-PROD-001',
    description: 'Delete-safe product',
    shortDescription: 'Delete-safe product',
    type: 'physical',
    status: 'active',
    basePrice: 10.0,
    costPrice: 5.0,
    msrp: 12.0,
    currency: 'USD',
    trackInventory: false,
    quantityInStock: 0,
    quantityReserved: 0,
    lowStockThreshold: 0,
    allowBackorder: false,
    brand: 'CognexiaAI',
    tags: ['delete-safe'],
    isFeatured: false,
    isOnSale: false,
  });

  await upsert(categoryRepo, {
    id: IDS.categoryId,
    tenantId: IDS.tenantId,
    name: 'Fixture Category',
    slug: 'fixture-category',
    active: true,
  });

  await upsert(catalogRepo, {
    id: IDS.catalogId,
    organizationId: IDS.organizationId,
    name: 'Fixture Catalog',
    status: CatalogStatus.PUBLISHED,
  });

  await upsert(catalogRepo, {
    id: IDS.catalogDeleteId,
    organizationId: IDS.organizationId,
    name: 'Delete Safe Catalog',
    status: CatalogStatus.DRAFT,
  });

  await upsert(catalogProductRepo, {
    id: IDS.catalogProductId,
    organizationId: IDS.organizationId,
    catalogId: IDS.catalogId,
    productId: IDS.productId,
    displayOrder: 0,
  });

  await upsert(taskRepo, {
    id: IDS.taskId,
    organizationId: IDS.organizationId,
    title: 'Fixture Task',
    priority: TaskPriority.MEDIUM,
    created_by: IDS.fixtureUserId,
  });

  await upsert(noteRepo, {
    id: IDS.noteId,
    organizationId: IDS.organizationId,
    content: 'Fixture note content',
    created_by: IDS.fixtureUserId,
    created_by_name: 'Fixture User',
  });

  await upsert(callQueueRepo, {
    id: IDS.callQueueId,
    tenantId: IDS.tenantId,
    name: 'Fixture Call Queue',
    phoneNumber: '+15550001113',
    routingStrategy: QueueStrategy.ROUND_ROBIN,
    isActive: true,
  });

  await upsert(callQueueRepo, {
    id: IDS.callQueueDeleteId,
    tenantId: IDS.tenantId,
    name: 'Delete Queue',
    phoneNumber: '+15550001119',
    routingStrategy: QueueStrategy.ROUND_ROBIN,
    isActive: true,
  });

  const queueWithAgents = await callQueueRepo.findOne({
    where: { id: IDS.callQueueId },
    relations: ['agents'],
  });
  if (queueWithAgents) {
    queueWithAgents.agents = [{ id: IDS.fixtureUserId } as User];
    await callQueueRepo.save(queueWithAgents);
  }

  await upsert(callRepo, {
    id: IDS.callId,
    tenantId: IDS.tenantId,
    callSid: 'CALLSID-0001',
    direction: CallDirection.INBOUND,
    status: CallStatus.COMPLETED,
    fromNumber: '+15550001114',
    toNumber: '+15550001115',
    queueId: IDS.callQueueId,
    duration: 120,
  });

  await upsert(mobileDeviceRepo, {
    id: IDS.mobileDeviceId,
    tenantId: IDS.tenantId,
    userId: IDS.fixtureUserId,
    deviceId: 'device-1',
    deviceName: 'Fixture Device',
    platform: DevicePlatform.ANDROID,
    status: DeviceStatus.ACTIVE,
    isOnline: true,
    appVersion: '1.0.0',
  });

  await upsert(emailCampaignRepo, {
    id: IDS.emailCampaignId,
    organizationId: IDS.organizationId,
    created_by: IDS.fixtureUserId,
    name: 'Fixture Email Campaign',
    subject: 'Fixture Campaign Subject',
    template: '<p>Hello Fixture</p>',
    recipients: ['recipient@cognexiaai.com'],
  });

  await upsert(formRepo, {
    id: IDS.formId,
    tenantId: IDS.tenantId,
    name: 'Fixture Form',
    status: FormStatus.ACTIVE,
    fields: [
      {
        id: 'field-1',
        type: 'text',
        label: 'Name',
        required: true,
      },
    ],
    createdById: IDS.fixtureUserId,
  });

  await upsert(reportRepo, {
    id: IDS.reportId,
    tenantId: IDS.tenantId,
    name: 'Fixture Report',
    reportType: ReportType.CUSTOM,
    chartType: ChartType.TABLE,
    config: {
      entity: 'customer',
      columns: ['id', 'companyName'],
      filters: [],
    },
    createdById: IDS.fixtureUserId,
  });

  await upsert(reportScheduleRepo, {
    id: IDS.reportScheduleId,
    tenantId: IDS.tenantId,
    reportId: IDS.reportId,
    name: 'Fixture Schedule',
    frequency: ScheduleFrequency.DAILY,
    format: DeliveryFormat.PDF,
    recipients: ['reports@cognexiaai.com'],
    createdById: IDS.fixtureUserId,
  });

  await upsert(importJobRepo, {
    id: IDS.importJobId,
    organizationId: IDS.organizationId,
    user_id: IDS.fixtureUserId,
    import_type: ImportType.CUSTOMER,
    status: ImportStatus.COMPLETED,
    file_name: 'mock-import.csv',
    file_path: 'uploads/mock-import.csv',
    total_rows: 0,
    processed_rows: 0,
    successful_rows: 0,
    failed_rows: 0,
  });

  await upsert(exportJobRepo, {
    id: IDS.exportJobId,
    organizationId: IDS.organizationId,
    user_id: IDS.fixtureUserId,
    export_type: 'customers',
    format: ExportFormat.CSV,
    status: ExportStatus.COMPLETED,
    file_name: 'mock-export.csv',
    file_path: 'exports/mock-export.csv',
    total_records: 0,
  });

  const exportsDir = path.join(process.cwd(), 'exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }
  const exportFilePath = path.join(exportsDir, 'mock-export.csv');
  if (!fs.existsSync(exportFilePath)) {
    fs.writeFileSync(exportFilePath, 'id,companyName\n');
  }

  await upsert(leadRepo, {
    id: IDS.leadId,
    leadNumber: 'LEAD-0001',
    status: LeadStatus.NEW,
    source: LeadSource.WEBSITE_FORM,
    contact: {
      firstName: 'Fixture',
      lastName: 'Lead',
      email: 'lead@cognexiaai.com',
    },
    demographics: {
      industry: 'Technology',
      companySize: 'small',
    },
    behaviorData: {
      websiteVisits: 1,
      pageViews: 3,
      emailOpens: 0,
      emailClicks: 0,
      formSubmissions: 1,
      contentDownloads: 0,
      demoRequests: 0,
    },
    leadScoring: {
      demographicScore: 10,
      behaviorScore: 5,
      engagementScore: 5,
      totalScore: 20,
      lastUpdated: new Date().toISOString(),
    },
    qualification: {
      budget: QualificationStatus.UNKNOWN,
      authority: QualificationStatus.UNKNOWN,
      need: QualificationStatus.UNKNOWN,
      timeline: QualificationStatus.UNKNOWN,
      bantScore: 0,
    },
    salesStage: SalesStage.PROSPECTING,
    probability: 0,
    createdBy: 'seed-fixtures',
    updatedBy: 'seed-fixtures',
  });

  await upsert(leadRepo, {
    id: IDS.leadV4Id,
    leadNumber: 'LEAD-0002',
    status: LeadStatus.NEW,
    source: LeadSource.WEBSITE_FORM,
    contact: {
      firstName: 'Fixture',
      lastName: 'LeadV4',
      email: 'lead.v4@cognexiaai.com',
    },
    demographics: {
      industry: 'Technology',
      companySize: 'small',
    },
    behaviorData: {
      websiteVisits: 2,
      pageViews: 5,
      emailOpens: 1,
      emailClicks: 0,
      formSubmissions: 1,
      contentDownloads: 0,
      demoRequests: 0,
    },
    leadScoring: {
      demographicScore: 12,
      behaviorScore: 8,
      engagementScore: 6,
      totalScore: 26,
      lastUpdated: new Date().toISOString(),
    },
    qualification: {
      budget: QualificationStatus.UNKNOWN,
      authority: QualificationStatus.UNKNOWN,
      need: QualificationStatus.UNKNOWN,
      timeline: QualificationStatus.UNKNOWN,
      bantScore: 0,
    },
    salesStage: SalesStage.PROSPECTING,
    probability: 0,
    createdBy: 'seed-fixtures',
    updatedBy: 'seed-fixtures',
  });

  await upsert(opportunityRepo, {
    id: IDS.opportunityId,
    opportunityNumber: 'OPP-0001',
    name: 'Fixture Opportunity',
    stage: OpportunityStage.PROSPECTING,
    type: OpportunityType.NEW_BUSINESS,
    priority: OpportunityPriority.MEDIUM,
    value: 10000,
    probability: 10,
    weightedValue: 1000,
    expectedCloseDate: new Date(),
    salesRep: 'Fixture Rep',
    salesTeam: [],
    products: {
      items: [
        {
          productId: IDS.productV4Id,
          productName: 'Fixture Product V4',
          category: 'Software',
          quantity: 1,
          unitPrice: 129.99,
          totalPrice: 129.99,
        },
      ],
      subtotal: 129.99,
      totalDiscount: 0,
      tax: 0,
      total: 129.99,
    },
    requirements: {
      functionalRequirements: ['Reporting'],
      technicalRequirements: ['API access'],
      businessRequirements: ['ROI visibility'],
    },
    decisionProcess: {
      decisionMakers: [
        {
          name: 'Decision Maker',
          title: 'VP Sales',
          role: 'Approver',
          influence: 'high',
          sentiment: 'positive',
        },
      ],
      evaluationCriteria: ['Price', 'Features'],
      budgetApprovalProcess: 'Standard',
      timeframe: '30 days',
      alternativesConsidered: [],
    },
    competitive: {
      mainCompetitors: [],
      ourPosition: CompetitivePosition.LEADER,
      competitiveAdvantages: ['Feature set'],
      competitiveThreats: [],
      winFactors: ['Speed'],
      loseFactors: [],
      competitorAnalysis: [],
    },
    activities: {
      totalActivities: 0,
      lastActivityDate: new Date().toISOString(),
      nextActivity: {
        type: 'call',
        date: new Date().toISOString(),
        description: 'Intro call',
        owner: 'Fixture Rep',
      },
      milestones: [],
    },
    financials: {
      budget: 10000,
      paymentTerms: 'Net 30',
      profitMargin: 0.2,
      costOfSale: 5000,
      roi: 1.5,
    },
    risks: {
      overallRisk: 'low',
      riskFactors: [],
      budgetRisk: 0,
      timelineRisk: 0,
      competitiveRisk: 0,
      technicalRisk: 0,
    },
    communications: {
      totalTouches: 0,
      lastContact: new Date().toISOString(),
      preferredChannels: ['email'],
      responseRate: 0,
      engagementScore: 0,
      keyConversations: [],
    },
    createdBy: 'seed-fixtures',
    updatedBy: 'seed-fixtures',
    customerId: IDS.customerV4Id,
  });

  await upsert(sequenceRepo, {
    id: IDS.sequenceId,
    tenantId: IDS.tenantId,
    name: 'Fixture Sequence',
    status: SequenceStatus.ACTIVE,
    steps: [
      {
        id: 'step-1',
        order: 1,
        type: StepType.EMAIL,
        name: 'Intro Email',
        delay: 0,
        emailSubject: 'Hello',
        emailBody: 'Welcome!',
      },
    ],
    createdById: IDS.fixtureUserId,
  });

  await upsert(sequenceRepo, {
    id: IDS.sequenceDeleteId,
    tenantId: IDS.tenantId,
    name: 'Delete Safe Sequence',
    status: SequenceStatus.DRAFT,
    steps: [
      {
        id: 'step-del-1',
        order: 1,
        type: StepType.TASK,
        name: 'Delete Safe Step',
        delay: 0,
        taskTitle: 'Follow up',
      },
    ],
    createdById: IDS.fixtureUserId,
  });

  await upsert(enrollmentRepo, {
    id: IDS.enrollmentId,
    tenantId: IDS.tenantId,
    sequenceId: IDS.sequenceId,
    leadId: IDS.leadId,
    status: EnrollmentStatus.ACTIVE,
    currentStepIndex: 0,
    currentStepId: 'step-1',
    enrolledById: IDS.fixtureUserId,
  });

  await upsert(enrollmentRepo, {
    id: IDS.enrollmentV4Id,
    tenantId: IDS.tenantId,
    sequenceId: IDS.sequenceId,
    leadId: IDS.leadV4Id,
    status: EnrollmentStatus.ACTIVE,
    currentStepIndex: 0,
    currentStepId: 'step-1',
    enrolledById: IDS.fixtureUserId,
  });

  await upsert(territoryRepo, {
    id: IDS.territoryId,
    tenantId: IDS.tenantId,
    name: 'Fixture Territory',
    assignmentStrategy: AssignmentStrategy.ROUND_ROBIN,
    assignmentRules: [],
  });

  await upsert(marketingCampaignRepo, {
    id: IDS.marketingCampaignId,
    name: 'Fixture Marketing Campaign',
    description: 'Fixture campaign',
    type: CampaignType.EMAIL,
    status: CampaignStatus.ACTIVE,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    budget: 1000,
  });

  await upsert(marketingCampaignRepo, {
    id: IDS.marketingCampaignV4Id,
    name: 'Fixture Marketing Campaign V4',
    description: 'Fixture campaign with v4 id',
    type: CampaignType.EMAIL,
    status: CampaignStatus.ACTIVE,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    budget: 1500,
  });

  await upsert(marketingSegmentRepo, {
    id: IDS.marketingSegmentId,
    name: 'Fixture Segment',
    description: 'Fixture customer segment',
    type: SegmentType.DEMOGRAPHIC,
    criteria: {
      rules: [
        {
          field: 'industry',
          operator: 'equals',
          value: 'Technology',
          logic: 'and',
        },
      ],
      conditions: 'and',
    },
    createdBy: 'seed-fixtures',
    updatedBy: 'seed-fixtures',
  });

  await upsert(emailTemplateRepo, {
    id: IDS.marketingTemplateId,
    name: 'Fixture Template',
    subject: 'Fixture Subject',
    bodyHtml: '<p>Hello</p>',
    bodyText: 'Hello',
    category: 'marketing',
    tags: ['fixture'],
    createdBy: 'seed-fixtures',
    updatedBy: 'seed-fixtures',
  });

  await upsert(supportTicketRepo, {
    id: IDS.supportTicketId,
    ticket_number: 'TICKET-0001',
    subject: 'Fixture Ticket',
    description: 'Fixture support ticket',
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
    category: TicketCategory.GENERAL_INQUIRY,
    channel: TicketChannel.WEB,
    customer_id: IDS.customerId,
    created_by: IDS.fixtureUserId,
  });

  await upsert(knowledgeRepo, {
    id: IDS.knowledgeBaseId,
    article_number: 'KB-0001',
    title: 'Fixture Knowledge Base',
    content: 'Fixture content',
    status: ArticleStatus.PUBLISHED,
    visibility: ArticleVisibility.PUBLIC,
    type: ArticleType.HOW_TO,
    author_id: IDS.fixtureUserId,
  });

  await upsert(documentRepo, {
    id: IDS.documentId,
    tenantId: IDS.tenantId,
    name: 'Fixture Document',
    documentType: DocumentType.CONTRACT,
    status: DocumentStatus.DRAFT,
    fileName: 'fixture.pdf',
    fileSize: 1024,
    mimeType: 'application/pdf',
    fileExtension: 'pdf',
    storageProvider: 'mock',
    storageBucket: 'local',
    storagePath: 'mock://documents/fixture.pdf',
    uploadedById: IDS.fixtureUserId,
  });

  await upsert(documentSignatureRepo, {
    id: IDS.documentSignatureId,
    tenantId: IDS.tenantId,
    documentId: IDS.documentId,
    signerName: 'Fixture Signer',
    signerEmail: 'signer@cognexiaai.com',
    status: SignatureStatus.SENT,
  });

  await upsert(documentVersionRepo, {
    id: IDS.documentVersionId,
    documentId: IDS.documentId,
    versionNumber: 1,
    storagePath: 'mock://documents/fixture-v1.pdf',
    fileSize: 1024,
    changeNote: 'Initial version',
    changes: { action: 'created' },
    createdById: IDS.fixtureUserId,
  });

  await upsert(contractRepo, {
    id: IDS.contractId,
    tenantId: IDS.tenantId,
    name: 'Fixture Contract',
    contractNumber: 'CONTRACT-0001',
    contractType: ContractType.SERVICE_AGREEMENT,
    status: ContractStatus.ACTIVE,
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    renewalType: RenewalType.MANUAL,
    ownerId: IDS.fixtureUserId,
    customerId: IDS.customerId,
    documentId: IDS.documentId,
  });

  await upsert(bundleRepo, {
    id: IDS.bundleId,
    tenantId: IDS.tenantId,
    name: 'Fixture Bundle',
    sku: 'BUNDLE-0001',
    type: BundleType.FIXED,
    items: [{ productId: IDS.productId, quantity: 1 }],
    bundlePrice: 89.99,
    currency: 'USD',
  });

  await upsert(priceListRepo, {
    id: IDS.priceListId,
    tenantId: IDS.tenantId,
    name: 'Fixture Price List',
    type: PriceListType.STANDARD,
    currency: 'USD',
    prices: [{ productId: IDS.productId, price: 95.0 }],
  });

  await upsert(discountRepo, {
    id: IDS.discountId,
    tenantId: IDS.tenantId,
    name: 'Fixture Discount',
    code: 'FIXED10',
    type: DiscountType.PERCENTAGE,
    value: 10,
    applicability: DiscountApplicability.ALL_PRODUCTS,
    active: true,
  });

  await upsert(billingRepo, {
    id: IDS.billingTransactionId,
    organizationId: IDS.organizationId,
    transactionType: TransactionType.SUBSCRIPTION,
    status: TransactionStatus.COMPLETED,
    amount: 199.99,
    currency: 'USD',
    description: 'Fixture transaction',
  });

  await upsert(dashboardRepo, {
    id: IDS.dashboardId,
    name: 'Fixture Dashboard',
    owner_id: adminUserId,
    visibility: DashboardVisibility.ORGANIZATION,
    widgets: [
      {
        id: 'widget-1',
        type: 'metric',
        title: 'Total Customers',
        position: { x: 0, y: 0, w: 4, h: 2 },
        config: { dataSource: 'customers' },
      },
    ],
    layout: { cols: 12, rows: 6 },
  });

  const portalPasswordHash = await bcrypt.hash('PortalUser123!', 10);
  await upsert(portalUserRepo, {
    id: IDS.portalUserId,
    tenantId: IDS.tenantId,
    customerId: IDS.customerId,
    email: 'portal.user@cognexiaai.com',
    firstName: 'Portal',
    lastName: 'User',
    password: portalPasswordHash,
    passwordHash: portalPasswordHash,
    status: PortalUserStatus.ACTIVE,
    isActive: true,
    isEmailVerified: true,
    canCreateTickets: true,
    canViewDocuments: true,
    canViewKnowledgeBase: true,
  });

  await upsert(portalUserRepo, {
    id: IDS.portalInviteUserId,
    tenantId: IDS.tenantId,
    customerId: IDS.customerId,
    email: 'portal.invite@cognexiaai.com',
    firstName: 'Invite',
    lastName: 'User',
    password: '',
    status: PortalUserStatus.PENDING,
    isActive: true,
    invitationToken: 'debug-token',
    invitationSentAt: new Date(),
  });

  await upsert(portalTicketRepo, {
    id: IDS.portalTicketId,
    subject: 'Portal Ticket',
    description: 'Fixture portal ticket',
    status: PortalTicketStatus.OPEN,
    priority: PortalTicketPriority.MEDIUM,
    portalUserId: IDS.portalUserId,
  });

  await upsert(onboardingRepo, {
    id: IDS.onboardingId,
    organizationId: IDS.organizationId,
    userId: IDS.fixtureUserId,
    type: OnboardingType.ORGANIZATION,
    status: OnboardingStatus.COMPLETED,
    completedAt: new Date(),
    steps: [
      {
        type: 'welcome',
        name: 'Welcome',
        required: true,
        completed: true,
      },
      {
        type: 'dashboard_tour',
        name: 'Dashboard Tour',
        required: false,
        completed: false,
      },
    ],
    checklist: [
      {
        id: 'checklist-1',
        title: 'Complete profile',
        required: true,
        completed: true,
      },
    ],
    completedSteps: 1,
    totalSteps: 2,
    progressPercentage: 100,
  });

  await upsert(migrationRepo, {
    id: IDS.migrationJobId,
    organizationId: IDS.organizationId,
    migrationType: MigrationType.IMPORT_CSV,
    status: MigrationStatus.PENDING,
    sourceSystem: 'csv',
    targetSystem: 'crm',
    startedAt: new Date(),
    canRollback: true,
  });

  await upsert(erpConnectionRepo, {
    id: IDS.erpConnectionId,
    organizationId: IDS.organizationId,
    systemName: 'Fixture ERP',
    erpSystem: 'erp',
    connectionString: 'https://erp.example.com/api',
    isActive: true,
  });

  await upsert(offlineSyncRepo, {
    id: IDS.offlineSyncId,
    tenantId: IDS.tenantId,
    userId: IDS.fixtureUserId,
    deviceId: IDS.mobileDeviceId,
    entityType: SyncEntityType.TASK,
    entityId: IDS.taskId,
    operation: SyncOperation.UPDATE,
    status: SyncStatus.CONFLICT,
    hasConflict: true,
    data: { title: 'Sync Task' },
    clientTimestamp: new Date(),
  });

  await upsert(warehouseRepo, {
    id: IDS.warehouseId,
    organizationId: IDS.organizationId,
    name: 'Fixture Warehouse',
    location: 'San Francisco',
    capacity: 1000,
    manager: 'Fixture Manager',
    isActive: true,
  });

  await upsert(warehouseRepo, {
    id: IDS.warehouseId2,
    organizationId: IDS.organizationId,
    name: 'Fixture Warehouse 2',
    location: 'Oakland',
    capacity: 500,
    manager: 'Fixture Manager 2',
    isActive: true,
  });

  await upsert(stockLevelRepo, {
    id: '15151515-1515-4151-8151-151515151515',
    organizationId: IDS.organizationId,
    productId: IDS.productV4Id,
    warehouseId: IDS.warehouseId,
    quantity: 50,
    reservedQuantity: 0,
    availableQuantity: 50,
    lastUpdated: new Date(),
  });

  await upsert(reorderRepo, {
    id: '16161616-1616-4161-8161-161616161616',
    organizationId: IDS.organizationId,
    productId: IDS.productV4Id,
    warehouseId: IDS.warehouseId,
    minimumLevel: 10,
    reorderQuantity: 20,
    autoReorder: false,
  });

  await upsert(transferRepo, {
    id: '17171717-1717-4171-8171-171717171717',
    organizationId: IDS.organizationId,
    fromWarehouseId: IDS.warehouseId,
    toWarehouseId: IDS.warehouseId2,
    productId: IDS.productV4Id,
    quantity: 5,
    status: TransferStatus.PENDING,
    initiatedBy: IDS.fixtureUserId,
  });

  await upsert(auditRepo, {
    id: '18181818-1818-4181-8181-181818181818',
    organizationId: IDS.organizationId,
    warehouseId: IDS.warehouseId,
    auditDate: new Date(),
    auditedBy: IDS.fixtureUserId,
    status: AuditStatus.SCHEDULED,
  });

  await upsert(holographicProjectionRepo, {
    id: IDS.holographicProjectionId,
    organizationId: IDS.organizationId,
    customerId: IDS.customerV4Id,
    name: 'Fixture Projection',
    projectionType: 'VOLUMETRIC',
    viewerCount: 0,
  });

  await upsert(spatialSessionRepo, {
    id: IDS.spatialSessionId,
    organizationId: IDS.organizationId,
    sessionName: 'Fixture Spatial Session',
    participantIds: [IDS.fixtureUserId],
    status: 'ACTIVE',
    startTime: new Date(),
  });

  await upsert(llmRepo, {
    id: IDS.llmConversationId,
    organizationId: IDS.organizationId,
    model: 'gpt-4',
    messageCount: 0,
    status: ConversationStatus.ACTIVE,
    startedAt: new Date(),
  });
}

async function main() {
  console.log('========================================');
  console.log('Seeding API Fixtures');
  console.log('========================================\n');

  try {
    if (!SeedDataSource.isInitialized) {
      await SeedDataSource.initialize();
    }

    await seedFixtures();

    console.log('✓ API fixtures seeded');
    await SeedDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding fixtures:', error);
    if (SeedDataSource.isInitialized) {
      await SeedDataSource.destroy();
    }
    process.exit(1);
  }
}

main();
