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
  ) {}

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
        type: 'SUBSCRIPTION' as const,
        status: 'ACTIVE' as const,
        basePrice: 99900,
        currency: 'USD',
        category: 'Software',
        features: ['AI Analytics', 'Multi-tenant', 'Real-time Reporting'],
        createdBy: DEMO_SEED_USER,
      },
      {
        tenantId: DEMO_ORG_ID,
        sku: 'CRM-PRO-002',
        name: 'CRM Professional',
        description: 'Advanced CRM with sales automation and AI insights',
        type: 'SUBSCRIPTION' as const,
        status: 'ACTIVE' as const,
        basePrice: 49900,
        currency: 'USD',
        category: 'Software',
        features: ['Lead Scoring', 'Email Automation', 'Predictive Analytics'],
        createdBy: DEMO_SEED_USER,
      },
      {
        tenantId: DEMO_ORG_ID,
        sku: 'ANALYTICS-PLUS-003',
        name: 'Analytics Plus',
        description: 'Business intelligence and advanced analytics platform',
        type: 'SUBSCRIPTION' as const,
        status: 'ACTIVE' as const,
        basePrice: 29900,
        currency: 'USD',
        category: 'Software',
        features: ['Custom Dashboards', 'AI Predictions', 'Real-time Data'],
        createdBy: DEMO_SEED_USER,
      },
      {
        tenantId: DEMO_ORG_ID,
        sku: 'SUPPORT-DESK-004',
        name: 'Support Desk Solution',
        description: 'Comprehensive customer support and ticketing system',
        type: 'SUBSCRIPTION' as const,
        status: 'ACTIVE' as const,
        basePrice: 19900,
        currency: 'USD',
        category: 'Software',
        features: ['Ticket Management', 'Knowledge Base', 'Live Chat'],
        createdBy: DEMO_SEED_USER,
      },
      {
        tenantId: DEMO_ORG_ID,
        sku: 'MARKETING-AUTO-005',
        name: 'Marketing Automation',
        description: 'Multi-channel marketing automation platform',
        type: 'SUBSCRIPTION' as const,
        status: 'ACTIVE' as const,
        basePrice: 39900,
        currency: 'USD',
        category: 'Software',
        features: ['Email Campaigns', 'Social Media', 'Lead Nurturing'],
        createdBy: DEMO_SEED_USER,
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
        status: 'ACTIVE' as const,
        type: 'B2B' as const,
        revenue: 5000000,
        employees: 150,
        website: 'https://techcorp.example.com',
        address: '123 Tech Street, San Francisco, CA 94105',
        city: 'San Francisco',
        state: 'California',
        country: 'United States',
        zipCode: '94105',
        createdBy: DEMO_SEED_USER,
      },
      {
        organizationId: DEMO_ORG_ID,
        companyName: 'Global Manufacturing Co',
        email: 'info@globalman.com',
        phone: '+1-555-0102',
        industry: 'Manufacturing',
        status: 'ACTIVE' as const,
        type: 'B2B' as const,
        revenue: 25000000,
        employees: 500,
        website: 'https://globalman.example.com',
        address: '456 Industrial Pkwy, Detroit, MI 48201',
        city: 'Detroit',
        state: 'Michigan',
        country: 'United States',
        zipCode: '48201',
        createdBy: DEMO_SEED_USER,
      },
      {
        organizationId: DEMO_ORG_ID,
        companyName: 'FinanceFirst Solutions',
        email: 'hello@financefirst.com',
        phone: '+1-555-0103',
        industry: 'Finance',
        status: 'ACTIVE' as const,
        type: 'B2B' as const,
        revenue: 15000000,
        employees: 250,
        website: 'https://financefirst.example.com',
        address: '789 Wall Street, New York, NY 10005',
        city: 'New York',
        state: 'New York',
        country: 'United States',
        zipCode: '10005',
        createdBy: DEMO_SEED_USER,
      },
      {
        organizationId: DEMO_ORG_ID,
        companyName: 'HealthTech Innovators',
        email: 'contact@healthtech.com',
        phone: '+1-555-0104',
        industry: 'Healthcare',
        status: 'ACTIVE' as const,
        type: 'B2B' as const,
        revenue: 8000000,
        employees: 180,
        website: 'https://healthtech.example.com',
        address: '321 Medical Plaza, Boston, MA 02108',
        city: 'Boston',
        state: 'Massachusetts',
        country: 'United States',
        zipCode: '02108',
        createdBy: DEMO_SEED_USER,
      },
      {
        organizationId: DEMO_ORG_ID,
        companyName: 'Retail Excellence Inc',
        email: 'sales@retailexcel.com',
        phone: '+1-555-0105',
        industry: 'Retail',
        status: 'ACTIVE' as const,
        type: 'B2B' as const,
        revenue: 12000000,
        employees: 300,
        website: 'https://retailexcel.example.com',
        address: '654 Commerce Ave, Chicago, IL 60601',
        city: 'Chicago',
        state: 'Illinois',
        country: 'United States',
        zipCode: '60601',
        createdBy: DEMO_SEED_USER,
      },
    ];

    const savedCustomers = await this.customerRepo.save(customers);
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
          status: 'ACTIVE' as const,
          createdBy: DEMO_SEED_USER,
        });
      }
    });

    const savedContacts = await this.contactRepo.save(contacts);
    return savedContacts.length;
  }

  private async seedLeads(): Promise<number> {
    const leads = [
      {
        organizationId: DEMO_ORG_ID,
        firstName: 'Alex',
        lastName: 'Thompson',
        email: 'alex.thompson@newprospect.com',
        phone: '+1-555-0201',
        company: 'NewProspect LLC',
        title: 'VP Operations',
        source: 'WEBSITE' as const,
        status: 'NEW' as const,
        score: 85,
        estimatedValue: 75000,
        notes: 'Interested in Enterprise ERP Suite, requested demo',
        createdBy: DEMO_SEED_USER,
      },
      {
        organizationId: DEMO_ORG_ID,
        firstName: 'Maria',
        lastName: 'Rodriguez',
        email: 'maria.r@futuretech.com',
        phone: '+1-555-0202',
        company: 'FutureTech Systems',
        title: 'Director of IT',
        source: 'REFERRAL' as const,
        status: 'CONTACTED' as const,
        score: 92,
        estimatedValue: 120000,
        notes: 'Hot lead - looking to replace legacy system',
        createdBy: DEMO_SEED_USER,
      },
      {
        organizationId: DEMO_ORG_ID,
        firstName: 'James',
        lastName: 'Wilson',
        email: 'jwilson@innovate.com',
        phone: '+1-555-0203',
        company: 'Innovate Solutions',
        title: 'CEO',
        source: 'SOCIAL_MEDIA' as const,
        status: 'QUALIFIED' as const,
        score: 78,
        estimatedValue: 95000,
        notes: 'Follow up next week with pricing details',
        createdBy: DEMO_SEED_USER,
      },
    ];

    const savedLeads = await this.leadRepo.save(leads);
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
      type: 'CUSTOMER' as const,
      status: 'ACTIVE' as const,
      industry: customer.industry,
      revenue: customer.revenue,
      website: customer.website,
      phone: customer.phone,
      billingAddress: customer.address,
      billingCity: customer.city,
      billingState: customer.state,
      billingCountry: customer.country,
      billingZipCode: customer.zipCode,
      description: `Key account for ${customer.companyName}`,
      priority: idx % 3 === 0 ? 'HIGH' : 'MEDIUM',
      createdBy: DEMO_SEED_USER,
    }));

    const savedAccounts = await this.accountRepo.save(accounts);
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

    const stages = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION'];
    const opportunities = [];

    customers.forEach((customer, idx) => {
      opportunities.push({
        organizationId: DEMO_ORG_ID,
        customerId: customer.id,
        name: `${customer.companyName} - ${products[idx % products.length].name}`,
        amount: products[idx % products.length].basePrice,
        stage: stages[idx % stages.length],
        probability: 60 + (idx % 4) * 10,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 * (idx + 1)),
        description: `Opportunity to sell ${products[idx % products.length].name} to ${customer.companyName}`,
        status: 'OPEN' as const,
        createdBy: DEMO_SEED_USER,
      });
    });

    const savedOpportunities = await this.opportunityRepo.save(opportunities);
    return savedOpportunities.length;
  }

  private async seedTasks(): Promise<number> {
    const tasks = [
      {
        organizationId: DEMO_ORG_ID,
        title: 'Follow up with TechCorp on proposal',
        description: 'Send revised proposal with updated pricing',
        status: 'TODO' as const,
        priority: 'HIGH' as const,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        createdBy: DEMO_SEED_USER,
        assignedTo: DEMO_SEED_USER,
      },
      {
        organizationId: DEMO_ORG_ID,
        title: 'Prepare demo for FinanceFirst Solutions',
        description: 'Set up demo environment with financial industry use cases',
        status: 'IN_PROGRESS' as const,
        priority: 'HIGH' as const,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        createdBy: DEMO_SEED_USER,
        assignedTo: DEMO_SEED_USER,
      },
      {
        organizationId: DEMO_ORG_ID,
        title: 'Qualify new lead from website',
        description: 'Call Alex Thompson to understand requirements',
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdBy: DEMO_SEED_USER,
        assignedTo: DEMO_SEED_USER,
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
    const activityTypes = ['CALL', 'EMAIL', 'MEETING', 'NOTE'];

    customers.forEach((customer) => {
      activityTypes.forEach((type) => {
        activities.push({
          organizationId: DEMO_ORG_ID,
          activityType: type,
          title: `${type} with ${customer.companyName}`,
          description: `Discussed project requirements and next steps`,
          performedBy: DEMO_SEED_USER,
          relatedToType: 'customer',
          relatedToId: customer.id,
          isSystemGenerated: false,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
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
      createdBy: DEMO_SEED_USER,
      relatedToType: 'customer',
      relatedToId: customer.id,
      isPinned: false,
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
        eventType: 'DEMO' as const,
        startTime: new Date(Date.now() + (idx + 1) * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + (idx + 1) * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        location: 'Virtual Meeting',
        createdBy: DEMO_SEED_USER,
        relatedToType: 'customer',
        relatedToId: customer.id,
        isAllDay: false,
        reminderMinutes: 30,
      });
    });

    const savedEvents = await this.eventRepo.save(events);
    return savedEvents.length;
  }
}
