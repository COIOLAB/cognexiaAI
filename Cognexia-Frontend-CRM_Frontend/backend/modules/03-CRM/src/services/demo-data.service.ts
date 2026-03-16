import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  DEMO_EMAIL,
  DEMO_ORG_ID,
  DEMO_ORG_NAME,
  DEMO_PASSWORD,
  DEMO_SEED_USER,
} from '../config/demo.constants';
import { Organization, OrganizationStatus, SubscriptionStatus } from '../entities/organization.entity';
import { User, UserType } from '../entities/user.entity';
import { Account, AccountStatus, AccountType } from '../entities/account.entity';
import { Customer, CustomerSize, CustomerStatus, CustomerTier, CustomerType, GrowthPotential, RiskLevel } from '../entities/customer.entity';
import { Lead, LeadGrade, LeadSource, LeadStatus, QualificationStatus, SalesStage } from '../entities/lead.entity';
import { Opportunity, CompetitivePosition, OpportunityPriority, OpportunityStage, OpportunityType } from '../entities/opportunity.entity';
import { MarketingCampaign, CampaignStatus, CampaignType } from '../entities/marketing-campaign.entity';
import { MarketingAnalytics, AnalyticsEventType } from '../entities/marketing-analytics.entity';
import { CustomerSegment, SegmentType } from '../entities/customer-segment.entity';
import { SupportTicket, TicketCategory, TicketChannel, TicketPriority, TicketStatus } from '../entities/support-ticket.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { Product, ProductStatus, ProductType } from '../entities/product.entity';
import { PriceList, PriceListType } from '../entities/price-list.entity';
import { Discount, DiscountApplicability, DiscountType } from '../entities/discount.entity';
import { Report, ReportType, ChartType } from '../entities/report.entity';
import { Document, DocumentStatus, DocumentType } from '../entities/document.entity';
import { Contract, ContractStatus, ContractType, RenewalType } from '../entities/contract.entity';
import { Task, TaskPriority, TaskStatus } from '../entities/task.entity';
import { Contact } from '../entities/contact.entity';
import { Activity } from '../entities/activity.entity';
import { Note } from '../entities/note.entity';

@Injectable()
export class DemoDataService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(Opportunity)
    private opportunityRepository: Repository<Opportunity>,
    @InjectRepository(MarketingCampaign)
    private campaignRepository: Repository<MarketingCampaign>,
    @InjectRepository(MarketingAnalytics)
    private analyticsRepository: Repository<MarketingAnalytics>,
    @InjectRepository(CustomerSegment)
    private segmentRepository: Repository<CustomerSegment>,
    @InjectRepository(SupportTicket)
    private ticketRepository: Repository<SupportTicket>,
    @InjectRepository(ProductCategory)
    private categoryRepository: Repository<ProductCategory>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(PriceList)
    private priceListRepository: Repository<PriceList>,
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
  ) {}

  async resetDemoData() {
    const demoUser = await this.ensureDemoUser();

    await this.clearStoryData(demoUser.id);
    await this.ensureDemoOrganization();
    await this.seedStoryData(demoUser);
  }

  async ensureDemoSeeded() {
    const [accountCount, customerCount, campaignCount] = await Promise.all([
      this.accountRepository.count({ where: { createdBy: DEMO_SEED_USER } }),
      this.customerRepository.count({ where: { createdBy: DEMO_SEED_USER } }),
      this.campaignRepository.count({ where: { createdBy: DEMO_SEED_USER } }),
    ]);

    if (accountCount === 0 || customerCount === 0 || campaignCount === 0) {
      await this.resetDemoData();
    }
  }

  private async ensureDemoOrganization() {
    let organization = await this.organizationRepository.findOne({
      where: { id: DEMO_ORG_ID },
    });

    if (!organization) {
      organization = this.organizationRepository.create({
        id: DEMO_ORG_ID,
        name: DEMO_ORG_NAME,
        email: DEMO_EMAIL,
        isActive: true,
        status: OrganizationStatus.ACTIVE,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        maxUsers: 999,
        currentUserCount: 0,
      });
    } else {
      organization.name = DEMO_ORG_NAME;
      organization.email = DEMO_EMAIL;
      organization.status = OrganizationStatus.ACTIVE;
      organization.subscriptionStatus = SubscriptionStatus.ACTIVE;
      organization.isActive = true;
    }

    await this.organizationRepository.save(organization);
  }

  private async ensureDemoUser(): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email: DEMO_EMAIL } });
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    if (existing) {
      existing.passwordHash = passwordHash;
      existing.userType = UserType.ORG_ADMIN;
      existing.organizationId = DEMO_ORG_ID;
      existing.roles = ['org_admin'];
      existing.permissions = ['*'];
      existing.isActive = true;
      existing.isEmailVerified = true;
      existing.isInvited = false;
      return this.userRepository.save(existing);
    }

    return this.userRepository.save(
      this.userRepository.create({
        email: DEMO_EMAIL,
        firstName: 'CognexiaAI',
        lastName: 'Demo',
        passwordHash,
        userType: UserType.ORG_ADMIN,
        organizationId: DEMO_ORG_ID,
        roles: ['org_admin'],
        permissions: ['*'],
        isActive: true,
        isEmailVerified: true,
        isInvited: false,
      }),
    );
  }

  private async clearStoryData(demoUserId: string) {
    const campaigns = await this.campaignRepository.find({
      where: { createdBy: DEMO_SEED_USER },
    });
    const campaignIds = campaigns.map((campaign) => campaign.id);

    if (campaignIds.length) {
      await this.analyticsRepository.delete({ campaignId: In(campaignIds) });
    }

    await Promise.all([
      this.campaignRepository.delete({ createdBy: DEMO_SEED_USER }),
      this.segmentRepository.delete({ createdBy: DEMO_SEED_USER }),
      this.ticketRepository.delete({ created_by: DEMO_SEED_USER } as any),
      this.opportunityRepository.delete({ createdBy: DEMO_SEED_USER }),
      this.leadRepository.delete({ createdBy: DEMO_SEED_USER }),
      this.customerRepository.delete({ createdBy: DEMO_SEED_USER }),
      this.accountRepository.delete({ createdBy: DEMO_SEED_USER }),
      this.categoryRepository.delete({ tenantId: DEMO_ORG_ID }),
      this.productRepository.delete({ tenantId: DEMO_ORG_ID }),
      this.priceListRepository.delete({ tenantId: DEMO_ORG_ID }),
      this.discountRepository.delete({ tenantId: DEMO_ORG_ID }),
      this.reportRepository.delete({ tenantId: DEMO_ORG_ID }),
      this.documentRepository.delete({ tenantId: DEMO_ORG_ID }),
      this.contractRepository.delete({ tenantId: DEMO_ORG_ID }),
      this.taskRepository.delete({ organization_id: DEMO_ORG_ID } as any),
      this.contactRepository.createQueryBuilder()
        .delete()
        .where('email LIKE :pattern', { pattern: '%@%-demo.com' })
        .execute(),
      this.activityRepository.delete({ organization_id: DEMO_ORG_ID } as any),
      this.noteRepository.delete({ organization_id: DEMO_ORG_ID } as any),
    ]);
  }

  private async seedStoryData(demoUser: User) {
    const now = new Date();
    const demoAccounts = [
      this.accountRepository.create({
        accountNumber: 'DEMO-ACC-1001',
        name: 'Atlas Manufacturing Co.',
        type: AccountType.CUSTOMER,
        status: AccountStatus.ACTIVE,
        industry: 'Manufacturing',
        owner: 'Avery Morgan',
        team: ['Avery Morgan', 'Leah Chen'],
        revenue: 3200000,
        priorityScore: 92,
        details: {
          employees: 1200,
          annualRevenue: 32000000,
          description: 'Global producer of industrial components',
          territory: 'North America',
          segment: 'Enterprise',
          tier: 'Platinum',
        },
        tags: ['enterprise', 'strategic'],
        createdBy: DEMO_SEED_USER,
        updatedBy: DEMO_SEED_USER,
      }),
      this.accountRepository.create({
        accountNumber: 'DEMO-ACC-1002',
        name: 'Nova Retail Group',
        type: AccountType.CUSTOMER,
        status: AccountStatus.ACTIVE,
        industry: 'Retail',
        owner: 'Rahul Patel',
        team: ['Rahul Patel'],
        revenue: 1450000,
        priorityScore: 78,
        details: {
          employees: 650,
          annualRevenue: 14500000,
          description: 'Omnichannel retail brand focused on lifestyle products',
          territory: 'APAC',
          segment: 'Mid-market',
          tier: 'Gold',
        },
        tags: ['omnichannel', 'growth'],
        createdBy: DEMO_SEED_USER,
        updatedBy: DEMO_SEED_USER,
      }),
      this.accountRepository.create({
        accountNumber: 'DEMO-ACC-1003',
        name: 'Lumen Health Systems',
        type: AccountType.PROSPECT,
        status: AccountStatus.POTENTIAL,
        industry: 'Healthcare',
        owner: 'Jasmine Carter',
        team: ['Jasmine Carter', 'Omar Reyes'],
        revenue: 820000,
        priorityScore: 64,
        details: {
          employees: 420,
          annualRevenue: 8200000,
          description: 'Regional healthcare network upgrading patient experience',
          territory: 'EMEA',
          segment: 'SMB',
          tier: 'Silver',
        },
        tags: ['healthcare', 'pilot'],
        createdBy: DEMO_SEED_USER,
        updatedBy: DEMO_SEED_USER,
      }),
    ];

    const savedAccounts = await this.accountRepository.save(demoAccounts);

    const customers = savedAccounts.map((account, index) =>
      this.buildCustomer({
        customerCode: `DEMO-CUST-${index + 1}`,
        companyName: account.name,
        industry: account.industry,
        size: index === 0 ? CustomerSize.ENTERPRISE : index === 1 ? CustomerSize.SMB : CustomerSize.STARTUP,
        createdBy: DEMO_SEED_USER,
      }),
    );

    const savedCustomers = await this.customerRepository.save(customers);

    const leads = [
      this.buildLead({
        leadNumber: 'DEMO-LEAD-2001',
        status: LeadStatus.QUALIFIED,
        source: LeadSource.LINKEDIN_CAMPAIGN,
        score: 82,
        salesStage: SalesStage.QUALIFICATION,
        probability: 65,
        contact: {
          firstName: 'Maya',
          lastName: 'Thompson',
          title: 'VP Operations',
          email: 'maya.thompson@atlas-demo.com',
          company: 'Atlas Manufacturing Co.',
        },
        createdBy: DEMO_SEED_USER,
      }),
      this.buildLead({
        leadNumber: 'DEMO-LEAD-2002',
        status: LeadStatus.NURTURING,
        source: LeadSource.WEBINAR,
        score: 71,
        salesStage: SalesStage.DISCOVERY,
        probability: 48,
        contact: {
          firstName: 'Lucas',
          lastName: 'Reed',
          title: 'Head of Growth',
          email: 'lucas.reed@nova-demo.com',
          company: 'Nova Retail Group',
        },
        createdBy: DEMO_SEED_USER,
      }),
      this.buildLead({
        leadNumber: 'DEMO-LEAD-2003',
        status: LeadStatus.CONTACTED,
        source: LeadSource.REFERRAL,
        score: 58,
        salesStage: SalesStage.PROSPECTING,
        probability: 35,
        contact: {
          firstName: 'Alicia',
          lastName: 'Perez',
          title: 'Chief Digital Officer',
          email: 'alicia.perez@lumen-demo.com',
          company: 'Lumen Health Systems',
        },
        createdBy: DEMO_SEED_USER,
      }),
    ];

    const savedLeads = await this.leadRepository.save(leads);

    const opportunities = [
      this.buildOpportunity({
        opportunityNumber: 'DEMO-OPP-3001',
        name: 'Atlas Manufacturing - Predictive Maintenance Suite',
        customerId: savedCustomers[0].id,
        leadId: savedLeads[0].id,
        stage: OpportunityStage.NEGOTIATION,
        value: 520000,
        probability: 72,
        salesRep: 'Avery Morgan',
        campaign: 'Atlas Efficiency Sprint',
        createdBy: DEMO_SEED_USER,
      }),
      this.buildOpportunity({
        opportunityNumber: 'DEMO-OPP-3002',
        name: 'Nova Retail - Omnichannel CX Rollout',
        customerId: savedCustomers[1].id,
        leadId: savedLeads[1].id,
        stage: OpportunityStage.PROPOSAL,
        value: 240000,
        probability: 54,
        salesRep: 'Rahul Patel',
        campaign: 'Retail Momentum 2026',
        createdBy: DEMO_SEED_USER,
      }),
      this.buildOpportunity({
        opportunityNumber: 'DEMO-OPP-3003',
        name: 'Lumen Health - Patient Journey Hub',
        customerId: savedCustomers[2].id,
        leadId: savedLeads[2].id,
        stage: OpportunityStage.DISCOVERY,
        value: 180000,
        probability: 35,
        salesRep: 'Jasmine Carter',
        campaign: 'Health Experience Pilot',
        createdBy: DEMO_SEED_USER,
      }),
    ];

    await this.opportunityRepository.save(opportunities);

    const segments = await this.segmentRepository.save([
      this.segmentRepository.create({
        name: 'Enterprise Innovators',
        description: 'High-growth enterprise accounts ready for automation.',
        type: SegmentType.BEHAVIORAL,
        criteria: {
          rules: [
            { field: 'tier', operator: 'equals', value: 'platinum' },
            { field: 'engagementScore', operator: 'greater_than', value: 80, logic: 'and' },
          ],
          conditions: 'and',
        },
        isActive: true,
        createdBy: DEMO_SEED_USER,
        updatedBy: DEMO_SEED_USER,
      }),
      this.segmentRepository.create({
        name: 'Growth Retailers',
        description: 'Retail brands scaling omnichannel operations.',
        type: SegmentType.FIRMOGRAPHIC,
        criteria: {
          rules: [
            { field: 'industry', operator: 'equals', value: 'Retail' },
            { field: 'annualRevenue', operator: 'greater_than', value: 10000000, logic: 'and' },
          ],
          conditions: 'and',
        },
        isActive: true,
        createdBy: DEMO_SEED_USER,
        updatedBy: DEMO_SEED_USER,
      }),
    ]);

    const campaigns = await this.campaignRepository.save([
      this.campaignRepository.create({
        name: 'Atlas Efficiency Sprint',
        description: 'Targeted campaign for manufacturing transformation.',
        type: CampaignType.EMAIL,
        status: CampaignStatus.ACTIVE,
        startDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10),
        endDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 20),
        budget: 12000,
        spentAmount: 7600,
        objectives: { reach: 12000, engagement: 2800, conversions: 180, roi: 240 },
        content: {
          subject: 'Drive factory uptime in 30 days',
          body: 'Discover AI-led predictive maintenance.',
          ctaText: 'Book a demo',
          ctaLink: 'https://cognexiaai.demo/atlas',
        },
        targeting: { interests: ['IoT', 'Industrial AI'], behaviors: ['demo_request'] },
        metrics: { impressions: 32000, clicks: 2100, conversions: 160, roi: 240 },
        tags: ['manufacturing', 'ai'],
        isActive: true,
        createdBy: DEMO_SEED_USER,
        updatedBy: DEMO_SEED_USER,
        targetSegments: [segments[0]],
      }),
      this.campaignRepository.create({
        name: 'Retail Momentum 2026',
        description: 'Omnichannel personalization for fast-growing retailers.',
        type: CampaignType.SOCIAL_MEDIA,
        status: CampaignStatus.ACTIVE,
        startDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5),
        endDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 25),
        budget: 9000,
        spentAmount: 4300,
        objectives: { reach: 18000, engagement: 3200, conversions: 140, roi: 185 },
        content: {
          subject: 'Unify your storefronts',
          body: 'Deliver personalized retail experiences.',
          ctaText: 'Explore playbook',
          ctaLink: 'https://cognexiaai.demo/retail',
        },
        targeting: { interests: ['Retail', 'CX'], behaviors: ['content_download'] },
        metrics: { impressions: 26000, clicks: 1600, conversions: 120, roi: 185 },
        tags: ['retail', 'cx'],
        isActive: true,
        createdBy: DEMO_SEED_USER,
        updatedBy: DEMO_SEED_USER,
        targetSegments: [segments[1]],
      }),
      this.campaignRepository.create({
        name: 'Health Experience Pilot',
        description: 'Transform patient journeys with AI automation.',
        type: CampaignType.WEBINAR,
        status: CampaignStatus.SCHEDULED,
        startDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3),
        endDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 18),
        budget: 6000,
        spentAmount: 1200,
        objectives: { reach: 8000, engagement: 1500, conversions: 90, roi: 130 },
        content: {
          subject: 'AI for patient engagement',
          body: 'Join our healthcare experience session.',
          ctaText: 'Reserve seat',
          ctaLink: 'https://cognexiaai.demo/health',
        },
        targeting: { interests: ['Healthcare', 'Automation'], behaviors: ['webinar_signup'] },
        metrics: { impressions: 12000, clicks: 900, conversions: 40, roi: 130 },
        tags: ['healthcare', 'webinar'],
        isActive: true,
        createdBy: DEMO_SEED_USER,
        updatedBy: DEMO_SEED_USER,
      }),
    ]);

    const analytics = campaigns.flatMap((campaign) => [
      this.analyticsRepository.create({
        campaignId: campaign.id,
        eventType: AnalyticsEventType.IMPRESSION,
        eventDate: now,
        eventData: { platform: 'linkedin', value: 1 },
      }),
      this.analyticsRepository.create({
        campaignId: campaign.id,
        eventType: AnalyticsEventType.CLICK,
        eventDate: now,
        eventData: { platform: 'linkedin', value: 1 },
      }),
      this.analyticsRepository.create({
        campaignId: campaign.id,
        eventType: AnalyticsEventType.CONVERSION,
        eventDate: now,
        eventData: { platform: 'linkedin', value: 1 },
        revenue: 3500,
      }),
    ]);

    await this.analyticsRepository.save(analytics);

    const tickets = [
      this.ticketRepository.create({
        ticket_number: 'DEMO-TCK-4001',
        subject: 'Delayed order confirmation',
        description: 'Order confirmations are taking longer than expected.',
        priority: TicketPriority.HIGH,
        category: TicketCategory.TECHNICAL_ISSUE,
        channel: TicketChannel.EMAIL,
        status: TicketStatus.OPEN,
        created_by: DEMO_SEED_USER,
        tags: ['priority', 'automation'],
      } as any),
      this.ticketRepository.create({
        ticket_number: 'DEMO-TCK-4002',
        subject: 'Need onboarding playbook',
        description: 'Customer success team needs onboarding guidance.',
        priority: TicketPriority.MEDIUM,
        category: TicketCategory.OTHER,
        channel: TicketChannel.WEB,
        status: TicketStatus.OPEN,
        created_by: DEMO_SEED_USER,
        tags: ['onboarding'],
      } as any),
    ];
    await this.ticketRepository.save(tickets[0]);
    await this.ticketRepository.save(tickets[1]);

    const categories = await this.categoryRepository.save([
      this.categoryRepository.create({
        tenantId: DEMO_ORG_ID,
        name: 'AI Automation Suite',
        description: 'Core AI-driven automation products.',
        slug: 'ai-automation',
        displayOrder: 1,
        active: true,
      }),
      this.categoryRepository.create({
        tenantId: DEMO_ORG_ID,
        name: 'Customer Experience',
        description: 'CX tools and personalization engines.',
        slug: 'customer-experience',
        displayOrder: 2,
        active: true,
      }),
    ]);

    const products = await this.productRepository.save([
      this.productRepository.create({
        tenantId: DEMO_ORG_ID,
        sku: 'DEMO-AI-001',
        name: 'Predictive Ops Engine',
        description: 'AI engine for predictive maintenance and efficiency.',
        type: ProductType.SERVICE,
        status: ProductStatus.ACTIVE,
        basePrice: 12000,
        currency: 'USD',
        categoryId: categories[0].id,
      }),
      this.productRepository.create({
        tenantId: DEMO_ORG_ID,
        sku: 'DEMO-CX-002',
        name: 'Omni CX Orchestrator',
        description: 'Unified journey orchestration for omnichannel teams.',
        type: ProductType.SERVICE,
        status: ProductStatus.ACTIVE,
        basePrice: 9500,
        currency: 'USD',
        categoryId: categories[1].id,
      }),
      this.productRepository.create({
        tenantId: DEMO_ORG_ID,
        sku: 'DEMO-AI-003',
        name: 'Revenue Intelligence Hub',
        description: 'Forecasting and pipeline scoring suite.',
        type: ProductType.SUBSCRIPTION,
        status: ProductStatus.ACTIVE,
        basePrice: 6400,
        currency: 'USD',
        categoryId: categories[0].id,
      }),
    ]);

    await this.priceListRepository.save(
      this.priceListRepository.create({
        tenantId: DEMO_ORG_ID,
        name: 'CognexiaAI Demo Pricing',
        description: 'Standard demo price list',
        type: PriceListType.STANDARD,
        currency: 'USD',
        active: true,
        prices: products.map((product) => ({
          productId: product.id,
          price: Number(product.basePrice) * 1.05,
        })),
      }),
    );

    await this.discountRepository.save(
      this.discountRepository.create({
        tenantId: DEMO_ORG_ID,
        name: 'Demo Launch Incentive',
        description: 'Introductory pricing for demo accounts',
        code: 'DEMO10',
        type: DiscountType.PERCENTAGE,
        value: 10,
        applicability: DiscountApplicability.ALL_PRODUCTS,
        active: true,
        maxUses: 200,
      }),
    );

    await this.reportRepository.save([
      this.reportRepository.create({
        tenantId: DEMO_ORG_ID,
        name: 'Pipeline Momentum',
        description: 'Stage-wise pipeline velocity and win rate.',
        reportType: ReportType.PIPELINE,
        chartType: ChartType.BAR,
        config: {
          entity: 'opportunity',
          columns: ['name', 'stage', 'value'],
          filters: [],
          groupBy: 'stage',
          aggregations: [{ field: 'value', function: 'sum' }],
        },
        createdById: demoUser.id,
        isPublic: true,
      }),
      this.reportRepository.create({
        tenantId: DEMO_ORG_ID,
        name: 'Support Health',
        description: 'Ticket load and SLA performance summary.',
        reportType: ReportType.SUPPORT,
        chartType: ChartType.PIE,
        config: {
          entity: 'support_ticket',
          columns: ['status'],
          filters: [],
          groupBy: 'status',
          aggregations: [{ field: 'status', function: 'count' }],
        },
        createdById: demoUser.id,
        isPublic: true,
      }),
    ]);

    await this.taskRepository.save([
      this.taskRepository.create({
        organization_id: DEMO_ORG_ID,
        title: 'Finalize Atlas proposal',
        description: 'Align final pricing with procurement.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        created_by: demoUser.id,
      }),
      this.taskRepository.create({
        organization_id: DEMO_ORG_ID,
        title: 'Schedule Nova discovery workshop',
        description: 'Workshop with retail ops team.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        created_by: demoUser.id,
      }),
    ]);

    const document = await this.documentRepository.save(
      this.documentRepository.create({
        tenantId: DEMO_ORG_ID,
        name: 'Atlas Statement of Work',
        description: 'Draft SOW for Atlas Manufacturing',
        documentType: DocumentType.CONTRACT,
        status: DocumentStatus.IN_REVIEW,
        storageProvider: 'supabase',
        storagePath: '/demo/atlas-sow.pdf',
        storageBucket: 'demo-documents',
        fileName: 'atlas-sow.pdf',
        fileSize: 120430,
        mimeType: 'application/pdf',
        fileExtension: 'pdf',
        entityType: 'customer',
        entityId: savedCustomers[0].id,
        uploadedById: demoUser.id,
        metadata: { tags: ['demo', 'sow'] },
      }),
    );

    await this.contractRepository.save(
      this.contractRepository.create({
        tenantId: DEMO_ORG_ID,
        name: 'Atlas Annual Agreement',
        contractNumber: 'DEMO-CON-5001',
        contractType: ContractType.SUBSCRIPTION,
        status: ContractStatus.PENDING_APPROVAL,
        customerId: savedCustomers[0].id,
        documentId: document.id,
        value: 520000,
        currency: 'USD',
        billingFrequency: 'annual',
        recurringAmount: 520000,
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear() + 1, now.getMonth(), 1),
        renewalType: RenewalType.MANUAL,
        ownerId: demoUser.id,
      }),
    );

    // === CONTACTS ===
    const contact1 = await this.contactRepository.save(
      this.contactRepository.create({
        type: 'primary',
        status: 'active',
        firstName: 'Maya',
        lastName: 'Thompson',
        email: 'maya.thompson@atlas-demo.com',
        phone: '+1 (415) 555-0101',
        jobTitle: 'VP Operations',
        customerId: savedCustomers[0].id,
      } as any),
    );
    const contact2 = await this.contactRepository.save(
      this.contactRepository.create({
        type: 'primary',
        status: 'active',
        firstName: 'Lucas',
        lastName: 'Reed',
        email: 'lucas.reed@nova-demo.com',
        phone: '+1 (415) 555-0102',
        jobTitle: 'Head of Growth',
        customerId: savedCustomers[1].id,
      } as any),
    );
    const contact3 = await this.contactRepository.save(
      this.contactRepository.create({
        type: 'primary',
        status: 'active',
        firstName: 'Alicia',
        lastName: 'Perez',
        email: 'alicia.perez@lumen-demo.com',
        phone: '+1 (415) 555-0103',
        jobTitle: 'Chief Digital Officer',
        customerId: savedCustomers[2].id,
      } as any),
    );
    const contacts = [contact1, contact2, contact3];

    // === ACTIVITIES ===
    await this.activityRepository.save([
      this.activityRepository.create({
        organization_id: DEMO_ORG_ID,
        activity_type: 'call' as any,
        title: 'Discovery call with Maya Thompson',
        description: 'Discussed predictive maintenance needs and ROI expectations.',
        performed_by: demoUser.id,
        performed_by_name: `${demoUser.firstName} ${demoUser.lastName}`,
        related_to_id: opportunities[0].id,
        related_to_type: 'opportunity',
        metadata: { duration: 45, outcome: 'positive' },
        is_system_generated: false,
      }),
      this.activityRepository.create({
        organization_id: DEMO_ORG_ID,
        activity_type: 'email' as any,
        title: 'Proposal follow-up',
        description: 'Sent proposal document and pricing breakdown.',
        performed_by: demoUser.id,
        performed_by_name: `${demoUser.firstName} ${demoUser.lastName}`,
        related_to_id: opportunities[1].id,
        related_to_type: 'opportunity',
        metadata: {},
        is_system_generated: false,
      }),
      this.activityRepository.create({
        organization_id: DEMO_ORG_ID,
        activity_type: 'meeting' as any,
        title: 'Executive demo scheduled',
        description: 'Demo with ops leadership team next week.',
        performed_by: demoUser.id,
        performed_by_name: `${demoUser.firstName} ${demoUser.lastName}`,
        related_to_id: opportunities[0].id,
        related_to_type: 'opportunity',
        metadata: { duration: 60 },
        is_system_generated: false,
      }),
    ]);

    // === NOTES ===
    await this.noteRepository.save([
      this.noteRepository.create({
        organization_id: DEMO_ORG_ID,
        content: 'Atlas stakeholder insights: Maya mentioned budget approval likely in Q2. CFO is key decision maker. Competitor evaluation ongoing but we have strong positioning.',
        created_by: demoUser.id,
        created_by_name: `${demoUser.firstName} ${demoUser.lastName}`,
        related_to_id: opportunities[0].id,
        related_to_type: 'opportunity',
        is_pinned: true,
        mentions: [],
        attachments: [],
      }),
      this.noteRepository.create({
        organization_id: DEMO_ORG_ID,
        content: 'Nova integration requirements: Must integrate with existing Shopify + Magento stack. Looking for omnichannel unification.',
        created_by: demoUser.id,
        created_by_name: `${demoUser.firstName} ${demoUser.lastName}`,
        related_to_id: savedCustomers[1].id,
        related_to_type: 'customer',
        is_pinned: false,
        mentions: [],
        attachments: [],
      }),
    ]);

    // Additional entities will be seeded as entity structures are verified
    // The following entities have been successfully added:
    // - Contacts, Activities, Notes
    // More comprehensive seed data for additional entities can be added in future iterations
  }

  private buildCustomer(payload: Partial<Customer> & { customerCode: string; companyName: string; industry: string; size: CustomerSize; createdBy: string }) {
    const now = new Date();
    return this.customerRepository.create({
      customerCode: payload.customerCode,
      companyName: payload.companyName,
      customerType: CustomerType.B2B,
      status: CustomerStatus.ACTIVE,
      industry: payload.industry,
      size: payload.size,
      primaryContact: {
        firstName: 'Alex',
        lastName: 'Johnson',
        title: 'Operations Lead',
        email: `contact@${payload.companyName.toLowerCase().replace(/\s+/g, '')}.demo`,
        phone: '+1 (555) 010-1234',
      },
      address: {
        street: '100 Demo Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zipCode: '94105',
        region: 'West',
      },
      demographics: {
        foundedYear: 2012,
        employeeCount: payload.size === CustomerSize.ENTERPRISE ? 1200 : 300,
        annualRevenue: payload.size === CustomerSize.ENTERPRISE ? 32000000 : 12000000,
        website: `https://www.${payload.companyName.toLowerCase().replace(/\s+/g, '')}.demo`,
      },
      preferences: {
        language: 'en',
        currency: 'USD',
        timezone: 'America/Los_Angeles',
        communicationChannels: ['email', 'phone'],
        marketingOptIn: true,
        newsletterOptIn: true,
        eventInvitations: true,
        privacySettings: { dataSharing: true, analytics: true, marketing: true },
      },
      salesMetrics: {
        totalRevenue: 480000,
        averageOrderValue: 42000,
        paymentTerms: 'Net 30',
      },
      relationshipMetrics: {
        customerSince: now.toISOString(),
        loyaltyScore: 82,
        satisfactionScore: 88,
        npsScore: 46,
      },
      segmentation: {
        segment: 'Growth',
        tier: CustomerTier.GOLD,
        riskLevel: RiskLevel.LOW,
        growthPotential: GrowthPotential.HIGH,
      },
      aiInsights: {
        behaviorProfile: 'growth-focused',
        purchasePattern: 'quarterly expansion',
        churnRisk: 0.12,
        nextBestAction: 'Executive roadmap review',
        recommendedProducts: ['Revenue Intelligence Hub'],
        sentimentScore: 0.78,
        engagementScore: 82,
      },
      createdBy: payload.createdBy,
      updatedBy: payload.createdBy,
    });
  }

  private buildLead(payload: Partial<Lead> & { leadNumber: string; createdBy: string; contact: { firstName: string; lastName: string; title: string; email: string; company?: string } }) {
    const now = new Date();
    return this.leadRepository.create({
      leadNumber: payload.leadNumber,
      status: payload.status || LeadStatus.NEW,
      source: payload.source || LeadSource.WEBSITE_FORM,
      score: payload.score || 60,
      grade: payload.score && payload.score > 80 ? LeadGrade.A : LeadGrade.B,
      contact: {
        firstName: payload.contact.firstName,
        lastName: payload.contact.lastName,
        title: payload.contact.title,
        email: payload.contact.email,
        phone: '+1 (555) 011-2200',
        company: payload.contact.company,
      },
      demographics: {
        industry: 'Technology',
        companySize: '200-500',
        annualRevenue: 12000000,
        location: 'San Francisco, CA',
      },
      behaviorData: {
        websiteVisits: 14,
        pageViews: 38,
        emailOpens: 6,
        emailClicks: 2,
        formSubmissions: 1,
        contentDownloads: 2,
        demoRequests: 1,
      },
      leadScoring: {
        demographicScore: 32,
        behaviorScore: 28,
        engagementScore: 22,
        totalScore: payload.score || 60,
        lastUpdated: now.toISOString(),
      },
      qualification: {
        budget: QualificationStatus.INVESTIGATING,
        authority: QualificationStatus.UNKNOWN,
        need: QualificationStatus.QUALIFIED,
        timeline: QualificationStatus.INVESTIGATING,
        bantScore: 55,
      },
      salesStage: payload.salesStage || SalesStage.PROSPECTING,
      probability: payload.probability || 40,
      followUpCount: 2,
      tags: ['demo', 'priority'],
      createdBy: payload.createdBy,
      updatedBy: payload.createdBy,
    });
  }

  private buildOpportunity(payload: {
    opportunityNumber: string;
    name: string;
    customerId: string;
    leadId: string;
    stage: OpportunityStage;
    value: number;
    probability: number;
    salesRep: string;
    campaign: string;
    createdBy: string;
  }) {
    const now = new Date();
    const expectedClose = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 45);
    return this.opportunityRepository.create({
      opportunityNumber: payload.opportunityNumber,
      name: payload.name,
      description: 'Strategic transformation program with phased rollout.',
      stage: payload.stage,
      type: OpportunityType.NEW_BUSINESS,
      priority: OpportunityPriority.HIGH,
      value: payload.value,
      probability: payload.probability,
      weightedValue: (payload.value * payload.probability) / 100,
      expectedCloseDate: expectedClose,
      salesRep: payload.salesRep,
      salesTeam: [payload.salesRep, 'Solutions Architect'],
      products: {
        items: [
          {
            productId: 'demo-product-1',
            productName: 'Predictive Ops Engine',
            category: 'AI Automation Suite',
            quantity: 1,
            unitPrice: payload.value,
            totalPrice: payload.value,
          },
        ],
        subtotal: payload.value,
        totalDiscount: 0,
        tax: payload.value * 0.08,
        total: payload.value * 1.08,
      },
      requirements: {
        functionalRequirements: ['Unified workflow automation', 'Predictive insights'],
        technicalRequirements: ['SOC2 compliance', 'API integrations'],
        businessRequirements: ['30% efficiency gain', 'Faster onboarding'],
      },
      decisionProcess: {
        decisionMakers: [
          {
            name: 'Dana Scott',
            title: 'COO',
            role: 'Economic buyer',
            influence: 'high',
            sentiment: 'positive',
          },
        ],
        evaluationCriteria: ['ROI within 6 months', 'Integration ease'],
        budgetApprovalProcess: 'VP + CFO sign-off',
        timeframe: 'Q2 close',
        alternativesConsidered: ['Legacy CRM', 'Manual workflow'],
      },
      competitive: {
        mainCompetitors: ['Legacy CRM Suite'],
        ourPosition: CompetitivePosition.LEADER,
        competitiveAdvantages: ['AI insights', 'Faster deployment'],
        competitiveThreats: ['Budget timing'],
        winFactors: ['Executive sponsorship', 'Strong ROI'],
        loseFactors: ['Delayed procurement'],
        competitorAnalysis: [
          {
            competitor: 'Legacy CRM Suite',
            strengths: ['Brand recognition'],
            weaknesses: ['Slow implementation'],
            pricing: 'Higher',
            probability: 25,
          },
        ],
      },
      activities: {
        totalActivities: 12,
        lastActivityDate: now.toISOString(),
        nextActivity: {
          type: 'Executive demo',
          date: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7).toISOString(),
          description: 'Executive demo with ops leadership',
          owner: payload.salesRep,
        },
        milestones: [
          {
            name: 'Discovery',
            date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10).toISOString(),
            status: 'completed',
            description: 'Requirements gathered',
          },
          {
            name: 'Proposal',
            date: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 10).toISOString(),
            status: 'pending',
            description: 'Proposal review',
          },
        ],
      },
      financials: {
        budget: payload.value,
        paymentTerms: 'Net 30',
        profitMargin: 0.38,
        costOfSale: payload.value * 0.2,
        roi: 2.4,
      },
      risks: {
        overallRisk: 'medium',
        riskFactors: [
          {
            factor: 'Procurement timing',
            impact: 'medium',
            probability: 0.4,
            mitigation: 'Pre-approval package',
          },
        ],
        budgetRisk: 0.3,
        timelineRisk: 0.4,
        competitiveRisk: 0.2,
        technicalRisk: 0.1,
      },
      communications: {
        totalTouches: 9,
        lastContact: now.toISOString(),
        preferredChannels: ['email', 'video'],
        responseRate: 0.78,
        engagementScore: 82,
        keyConversations: [
          {
            date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4).toISOString(),
            type: 'call',
            summary: 'Reviewed success criteria',
            outcome: 'Proceed to proposal',
            nextSteps: 'Send proposal draft',
          },
        ],
      },
      campaign: payload.campaign,
      tags: ['demo', 'strategic'],
      createdBy: payload.createdBy,
      updatedBy: payload.createdBy,
      customerId: payload.customerId,
      leadId: payload.leadId,
    });
  }
}
