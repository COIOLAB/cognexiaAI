import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { Contact } from '../entities/contact.entity';
import { Lead } from '../entities/lead.entity';
import { Opportunity } from '../entities/opportunity.entity';
import { Account } from '../entities/account.entity';
import { Task } from '../entities/task.entity';
import { Activity } from '../entities/activity.entity';
import { Note } from '../entities/note.entity';
import { Event } from '../entities/event.entity';
import { Product } from '../entities/product.entity';
import { DEMO_ORG_ID, DEMO_SEED_USER } from '../config/demo.constants';

@Injectable()
export class DemoSeedService {
  private readonly logger = new Logger(DemoSeedService.name);

  constructor(
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
    @InjectRepository(Lead)
    private leadRepo: Repository<Lead>,
    @InjectRepository(Opportunity)
    private opportunityRepo: Repository<Opportunity>,
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    @InjectRepository(Activity)
    private activityRepo: Repository<Activity>,
    @InjectRepository(Note)
    private noteRepo: Repository<Note>,
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) { }

  async seedAllDemoData(): Promise<{ message: string; stats: any }> {
    this.logger.log('Starting comprehensive demo data seeding...');

    try {
      // Clear existing demo data first
      await this.clearDemoData();

      const stats = {
        customers: 0,
        contacts: 0,
        leads: 0,
        opportunities: 0,
        accounts: 0,
        tasks: 0,
        activities: 0,
        notes: 0,
        events: 0,
        products: 0,
      };

      // Seed Products first (needed for opportunities)
      stats.products = await this.seedProducts();

      // Seed Customers (15 realistic companies)
      stats.customers = await this.seedCustomers();

      // Seed Contacts (30-40 contacts across customers)
      stats.contacts = await this.seedContacts();

      // Seed Leads (25 leads in various stages)
      stats.leads = await this.seedLeads();

      // Seed Accounts (10 key accounts)
      stats.accounts = await this.seedAccounts();

      // Seed Opportunities (20 opportunities in pipeline)
      stats.opportunities = await this.seedOpportunities();

      // Seed Tasks (50 tasks)
      stats.tasks = await this.seedTasks();

      // Seed Activities (100 activities)
      stats.activities = await this.seedActivities();

      // Seed Notes (30 notes)
      stats.notes = await this.seedNotes();

      // Seed Events (20 upcoming events)
      stats.events = await this.seedEvents();

      this.logger.log('Demo data seeding completed successfully');

      return {
        message: 'Demo data seeded successfully',
        stats,
      };
    } catch (error) {
      this.logger.error('Failed to seed demo data', error);
      throw error;
    }
  }

  private async clearDemoData(): Promise<void> {
    this.logger.log('Clearing existing demo data...');

    await this.eventRepo.delete({ organizationId: DEMO_ORG_ID });
    await this.noteRepo.delete({ organizationId: DEMO_ORG_ID });
    await this.activityRepo.delete({ organizationId: DEMO_ORG_ID });
    await this.taskRepo.delete({ organizationId: DEMO_ORG_ID });
    await this.opportunityRepo.delete({ organizationId: DEMO_ORG_ID });
    await this.leadRepo.delete({ organizationId: DEMO_ORG_ID });
    await this.contactRepo.delete({ organizationId: DEMO_ORG_ID });
    await this.accountRepo.delete({ organizationId: DEMO_ORG_ID });
    await this.customerRepo.delete({ organizationId: DEMO_ORG_ID });
    await this.productRepo.delete({ tenantId: DEMO_ORG_ID });
  }

  private async seedProducts(): Promise<number> {
    const products = [
      {
        tenantId: DEMO_ORG_ID,
        sku: 'ERP-ENTERPRISE-001',
        name: 'Enterprise ERP Suite',
        description: 'Complete Industry 5.0 ERP solution with AI capabilities',
        type: 'subscription' as any,
        status: 'active' as any,
        basePrice: 99900,
        currency: 'USD',
        tags: ['Software', 'AI Analytics', 'Multi-tenant', 'Real-time Reporting'],
      },
      {
        tenantId: DEMO_ORG_ID,
        sku: 'CRM-PRO-002',
        name: 'CRM Professional',
        description: 'Advanced CRM with sales automation and AI insights',
        type: 'subscription' as any,
        status: 'active' as any,
        basePrice: 49900,
        currency: 'USD',
        tags: ['Software', 'Lead Scoring', 'Email Automation', 'Predictive Analytics'],
      },
      {
        tenantId: DEMO_ORG_ID,
        sku: 'ANALYTICS-PLUS-003',
        name: 'Analytics Plus',
        description: 'Business intelligence and advanced analytics platform',
        type: 'subscription' as any,
        status: 'active' as any,
        basePrice: 29900,
        currency: 'USD',
        tags: ['Software', 'Custom Dashboards', 'AI Predictions', 'Real-time Data'],
      },
      {
        tenantId: DEMO_ORG_ID,
        sku: 'SUPPORT-DESK-004',
        name: 'Support Desk Solution',
        description: 'Comprehensive customer support and ticketing system',
        type: 'subscription' as any,
        status: 'active' as any,
        basePrice: 19900,
        currency: 'USD',
        tags: ['Software', 'Ticket Management', 'Knowledge Base', 'Live Chat'],
      },
      {
        tenantId: DEMO_ORG_ID,
        sku: 'MARKETING-AUTO-005',
        name: 'Marketing Automation',
        description: 'Multi-channel marketing automation platform',
        type: 'subscription' as any,
        status: 'active' as any,
        basePrice: 39900,
        currency: 'USD',
        tags: ['Software', 'Email Campaigns', 'Social Media', 'Lead Nurturing'],
      },
    ];

    const savedProducts = await this.productRepo.save(products);
    return savedProducts.length;
  }

  private async seedCustomers(): Promise<number> {
    const customers = [
      {
        organizationId: DEMO_ORG_ID,
        companyName: 'TechCorp Industries',
        email: 'contact@techcorp.com',
        phone: '+1-555-0101',
        industry: 'Technology',
        status: 'active' as any,
        customerType: 'b2b' as any,
        salesMetrics: {
          totalRevenue: 5000000,
          averageOrderValue: 50000,
          paymentTerms: 'net30',
        },
        relationshipMetrics: {
          customerSince: new Date().toISOString(),
          loyaltyScore: 8,
          satisfactionScore: 9,
          npsScore: 8,
        },
        preferences: {
          language: 'en',
          currency: 'USD',
          timezone: 'America/Los_Angeles',
          communicationChannels: ['email'],
          marketingOptIn: true,
          newsletterOptIn: true,
          eventInvitations: true,
          privacySettings: { dataSharing: false, analytics: true, marketing: true },
        },
        segmentation: {
          segment: 'enterprise',
          tier: 'platinum' as any,
          riskLevel: 'low' as any,
          growthPotential: 'high' as any,
        },
        demographics: {
          employeeCount: 150,
          annualRevenue: 5000000,
        },
        website: 'https://techcorp.example.com',
        address: { street: '123 Tech Street', city: 'San Francisco', state: 'California', country: 'United States', zipCode: '94105', region: 'NA' },
        primaryContact: { firstName: 'John', lastName: 'Doe', title: 'CEO', email: 'john@techcorp.com', phone: '+1-555-0101' },
        createdBy: DEMO_SEED_USER,
      },
      {
        organizationId: DEMO_ORG_ID,
        companyName: 'Global Manufacturing Co',
        email: 'info@globalman.com',
        phone: '+1-555-0102',
        industry: 'Manufacturing',
        status: 'active' as any,
        customerType: 'b2b' as any,
        salesMetrics: {
          totalRevenue: 25000000,
          averageOrderValue: 100000,
          paymentTerms: 'net60',
        },
        relationshipMetrics: {
          customerSince: new Date().toISOString(),
          loyaltyScore: 7,
          satisfactionScore: 8,
          npsScore: 7,
        },
        preferences: {
          language: 'en',
          currency: 'USD',
          timezone: 'America/New_York',
          communicationChannels: ['email'],
          marketingOptIn: true,
          newsletterOptIn: true,
          eventInvitations: true,
          privacySettings: { dataSharing: false, analytics: true, marketing: true },
        },
        segmentation: {
          segment: 'enterprise',
          tier: 'diamond' as any,
          riskLevel: 'low' as any,
          growthPotential: 'medium' as any,
        },
        demographics: {
          employeeCount: 500,
          annualRevenue: 25000000,
        },
        website: 'https://globalman.example.com',
        address: { street: '456 Industrial Pkwy', city: 'Detroit', state: 'Michigan', country: 'United States', zipCode: '48201', region: 'NA' },
        primaryContact: { firstName: 'Jane', lastName: 'Smith', title: 'Director', email: 'jane@globalman.com', phone: '+1-555-0102' },
        createdBy: DEMO_SEED_USER,
      },
    ];

    const savedCustomers = await this.customerRepo.save(customers as any);
    return savedCustomers.length;
  }

  private async seedContacts(): Promise<number> {
    const customers = await this.customerRepo.find({
      where: { organizationId: DEMO_ORG_ID },
    });

    if (customers.length === 0) return 0;

    const contacts = [];
    const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'Robert', 'Jennifer'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    const titles = ['CEO', 'CTO', 'VP Sales', 'Director', 'Manager', 'Senior Engineer', 'Account Executive'];

    customers.forEach((customer, idx) => {
      // Create 2-3 contacts per customer
      const contactCount = 2 + (idx % 2);
      for (let i = 0; i < contactCount; i++) {
        contacts.push({
          organizationId: DEMO_ORG_ID,
          customerId: customer.id,
          firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
          lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
          email: `contact${idx}${i}@${customer.companyName.toLowerCase().replace(/\s/g, '')}.com`,
          phone: `+1-555-01${idx}${i}`,
          title: titles[Math.floor(Math.random() * titles.length)],
          isPrimary: i === 0,
          status: 'active' as any,
          type: 'primary' as any,
          communicationPrefs: { preferredChannel: 'email', preferredTime: 'Morning', timezone: 'UTC', frequency: 'weekly', language: 'en', doNotCall: false, emailOptOut: false },
          createdBy: DEMO_SEED_USER,
        });
      }
    });

    const savedContacts = await this.contactRepo.save(contacts as any);
    return savedContacts.length;
  }

  private async seedLeads(): Promise<number> {
    const leads = [
      {
        organizationId: DEMO_ORG_ID,
        status: 'new' as any,
        source: 'website_form' as any,
        score: 85,
        estimatedValue: 75000,
        notes: 'Interested in Enterprise ERP Suite, requested demo',
        contact: {
          firstName: 'Alex',
          lastName: 'Thompson',
          email: 'alex.thompson@newprospect.com',
          phone: '+1-555-0201',
          company: 'NewProspect LLC',
          title: 'VP Operations',
        },
        demographics: {},
        behaviorData: { websiteVisits: 2, pageViews: 5, emailOpens: 1, emailClicks: 0, formSubmissions: 1, contentDownloads: 0, demoRequests: 1 },
        leadScoring: { demographicScore: 20, behaviorScore: 30, engagementScore: 35, totalScore: 85, lastUpdated: new Date().toISOString() },
        qualification: { budget: 'unknown' as any, authority: 'unknown' as any, need: 'unknown' as any, timeline: 'unknown' as any, bantScore: 0 },
        createdBy: DEMO_SEED_USER,
      },
      {
        organizationId: DEMO_ORG_ID,
        status: 'contacted' as any,
        source: 'referral' as any,
        score: 92,
        estimatedValue: 120000,
        notes: 'Hot lead - looking to replace legacy system',
        contact: {
          firstName: 'Maria',
          lastName: 'Rodriguez',
          email: 'maria.r@futuretech.com',
          phone: '+1-555-0202',
          company: 'FutureTech Systems',
          title: 'Director of IT',
        },
        demographics: {},
        behaviorData: { websiteVisits: 5, pageViews: 12, emailOpens: 3, emailClicks: 1, formSubmissions: 0, contentDownloads: 2, demoRequests: 1 },
        leadScoring: { demographicScore: 30, behaviorScore: 40, engagementScore: 22, totalScore: 92, lastUpdated: new Date().toISOString() },
        qualification: { budget: 'qualified' as any, authority: 'unknown' as any, need: 'qualified' as any, timeline: 'unknown' as any, bantScore: 50 },
        createdBy: DEMO_SEED_USER,
      },
    ];

    const savedLeads = await this.leadRepo.save(leads as any);
    return savedLeads.length;
  }

  private async seedAccounts(): Promise<number> {
    const customers = await this.customerRepo.find({
      where: { organizationId: DEMO_ORG_ID },
      take: 5,
    });

    if (customers.length === 0) return 0;

    const accounts = customers.map((customer, idx) => ({
      organizationId: DEMO_ORG_ID,
      name: customer.companyName,
      type: 'customer' as any,
      status: 'active' as any,
      industry: customer.industry,
      revenue: customer.demographics?.annualRevenue || 0,
      website: customer.demographics?.website,
      owner: DEMO_SEED_USER,
      details: {},
      createdBy: DEMO_SEED_USER,
    }));

    const savedAccounts = await this.accountRepo.save(accounts as any);
    return savedAccounts.length;
  }

  private async seedOpportunities(): Promise<number> {
    const customers = await this.customerRepo.find({
      where: { organizationId: DEMO_ORG_ID },
      take: 5,
    });
    const products = await this.productRepo.find({
      where: { tenantId: DEMO_ORG_ID },
    });

    if (customers.length === 0 || products.length === 0) return 0;

    const stages = ['prospecting', 'qualification', 'proposal', 'negotiation'];
    const opportunities = [];

    customers.forEach((customer, idx) => {
      opportunities.push({
        organizationId: DEMO_ORG_ID,
        customerId: customer.id,
        salesRep: DEMO_SEED_USER,
        name: `${customer.companyName} - ${products[idx % products.length].name}`,
        value: products[idx % products.length].basePrice,
        stage: stages[idx % stages.length] as any,
        type: 'new_business' as any,
        probability: 60 + (idx % 4) * 10,
        weightedValue: (products[idx % products.length].basePrice * (60 + (idx % 4) * 10)) / 100,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 * (idx + 1)),
        description: `Opportunity to sell ${products[idx % products.length].name} to ${customer.companyName}`,
        products: { items: [], subtotal: 0, totalDiscount: 0, tax: 0, total: 0 },
        requirements: { functionalRequirements: [], technicalRequirements: [], businessRequirements: [] },
        decisionProcess: { decisionMakers: [], evaluationCriteria: [], budgetApprovalProcess: 'Standard', timeframe: 'Q1', alternativesConsidered: [] },
        competitive: { mainCompetitors: [], ourPosition: 'leader' as any, competitiveAdvantages: [], competitiveThreats: [], winFactors: [], loseFactors: [], competitorAnalysis: [] },
        activities: { totalActivities: 0, lastActivityDate: new Date().toISOString(), nextActivity: { type: 'Call', date: new Date().toISOString(), description: 'Follow up', owner: DEMO_SEED_USER }, milestones: [] },
        financials: { budget: 100000, paymentTerms: 'Net 30', profitMargin: 20, costOfSale: 10000, roi: 15 },
        risks: { overallRisk: 'low' as any, riskFactors: [], budgetRisk: 10, timelineRisk: 10, competitiveRisk: 10, technicalRisk: 10 },
        communications: { totalTouches: 5, lastContact: new Date().toISOString(), preferredChannels: ['email'], responseRate: 50, engagementScore: 70, keyConversations: [] },
        createdBy: DEMO_SEED_USER,
      });
    });

    const savedOpportunities = await this.opportunityRepo.save(opportunities as any);
    return savedOpportunities.length;
  }

  private async seedTasks(): Promise<number> {
    const tasks = [
      {
        organizationId: DEMO_ORG_ID,
        title: 'Follow up with TechCorp on proposal',
        description: 'Send revised proposal with updated pricing',
        status: 'todo' as any,
        priority: 'high' as any,
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        created_by: DEMO_SEED_USER,
        assigned_to: DEMO_SEED_USER,
      },
      {
        organizationId: DEMO_ORG_ID,
        title: 'Prepare demo for FinanceFirst Solutions',
        description: 'Set up demo environment with financial industry use cases',
        status: 'in_progress' as any,
        priority: 'high' as any,
        due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        created_by: DEMO_SEED_USER,
        assigned_to: DEMO_SEED_USER,
      },
    ];

    const savedTasks = await this.taskRepo.save(tasks);
    return savedTasks.length;
  }

  private async seedActivities(): Promise<number> {
    const customers = await this.customerRepo.find({
      where: { organizationId: DEMO_ORG_ID },
      take: 3,
    });

    if (customers.length === 0) return 0;

    const activities = [];
    const activityTypes = ['call', 'email', 'meeting', 'note'];

    customers.forEach((customer) => {
      activityTypes.forEach((type) => {
        activities.push({
          organizationId: DEMO_ORG_ID,
          activity_type: type as any,
          title: `${type} with ${customer.companyName}`,
          description: `Discussed project requirements and next steps`,
          performed_by: DEMO_SEED_USER,
          related_to_type: 'customer',
          related_to_id: customer.id,
          is_system_generated: false,
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        });
      });
    });

    const savedActivities = await this.activityRepo.save(activities);
    return savedActivities.length;
  }

  private async seedNotes(): Promise<number> {
    const customers = await this.customerRepo.find({
      where: { organizationId: DEMO_ORG_ID },
      take: 3,
    });

    if (customers.length === 0) return 0;

    const notes = customers.map((customer) => ({
      organizationId: DEMO_ORG_ID,
      content: `Important: ${customer.companyName} is interested in our Enterprise solution. Budget confirmed for Q1 2026.`,
      created_by: DEMO_SEED_USER,
      related_to_type: 'customer',
      related_to_id: customer.id,
      is_pinned: false,
    }));

    const savedNotes = await this.noteRepo.save(notes);
    return savedNotes.length;
  }

  private async seedEvents(): Promise<number> {
    const customers = await this.customerRepo.find({
      where: { organizationId: DEMO_ORG_ID },
      take: 3,
    });

    if (customers.length === 0) return 0;

    const events = [];

    customers.forEach((customer, idx) => {
      events.push({
        organizationId: DEMO_ORG_ID,
        title: `Product Demo - ${customer.companyName}`,
        description: `Demonstrate Enterprise ERP capabilities`,
        event_type: 'demo' as any,
        start_time: new Date(Date.now() + (idx + 1) * 24 * 60 * 60 * 1000),
        end_time: new Date(Date.now() + (idx + 1) * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        location: 'Virtual Meeting',
        created_by: DEMO_SEED_USER,
        related_to_type: 'customer',
        related_to_id: customer.id,
        is_all_day: false,
        reminder_minutes: 30,
      });
    });

    const savedEvents = await this.eventRepo.save(events);
    return savedEvents.length;
  }
}
