import { DataSource } from 'typeorm';
import { SubscriptionPlan, PlanType, BillingInterval } from './src/entities/subscription-plan.entity';

/**
 * Database Seeding Script
 * Populates initial required data for the CRM system
 */

const AppDataSource = new DataSource({
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

async function seedSubscriptionPlans(dataSource: DataSource) {
  console.log('🌱 Seeding Subscription Plans...');
  
  const planRepository = dataSource.getRepository(SubscriptionPlan);
  
  // Check if plans already exist
  const existingPlans = await planRepository.count();
  if (existingPlans > 0) {
    console.log('✓ Subscription plans already exist, skipping...');
    return;
  }

  const plans = [
    {
      name: 'Free Trial',
      planType: PlanType.FREE,
      price: 0,
      billingInterval: BillingInterval.MONTHLY,
      includedUsers: 3,
      trialDays: 14,
      features: [
        'Basic CRM features',
        'Up to 3 users',
        '1,000 contacts',
        'Email support',
        'Basic analytics',
      ],
      description: 'Perfect for getting started with CRM',
      maxUsers: 3,
      storageLimit: 1, // 1GB
      apiCallsPerMonth: 1000,
      isActive: true,
      sortOrder: 1,
      isPopular: false,
      featureFlags: {
        quantumIntelligence: false,
        holographicExperience: false,
        arvrSales: false,
        advancedAnalytics: false,
        llmIntegration: false,
      },
    },
    {
      name: 'Starter',
      planType: PlanType.STARTER,
      price: 29.99,
      billingInterval: BillingInterval.MONTHLY,
      includedUsers: 5,
      trialDays: 14,
      features: [
        'All Free features',
        'Up to 5 users',
        '10,000 contacts',
        'Email & chat support',
        'Advanced analytics',
        'Custom fields',
        'Basic automation',
      ],
      description: 'Great for small teams',
      maxUsers: 5,
      storageLimit: 10, // 10GB
      apiCallsPerMonth: 10000,
      pricePerAdditionalUser: 5.99,
      isActive: true,
      sortOrder: 2,
      isPopular: false,
      featureFlags: {
        quantumIntelligence: false,
        holographicExperience: false,
        arvrSales: false,
        advancedAnalytics: true,
        llmIntegration: false,
      },
    },
    {
      name: 'Business',
      planType: PlanType.BUSINESS,
      price: 99.99,
      billingInterval: BillingInterval.MONTHLY,
      includedUsers: 15,
      trialDays: 14,
      features: [
        'All Starter features',
        'Up to 15 users',
        'Unlimited contacts',
        'Priority support',
        'Advanced automation',
        'Custom integrations',
        'LLM AI Integration',
        'Real-time analytics',
        'Custom dashboards',
      ],
      description: 'Perfect for growing businesses',
      maxUsers: 15,
      storageLimit: 50, // 50GB
      apiCallsPerMonth: 50000,
      pricePerAdditionalUser: 8.99,
      isActive: true,
      sortOrder: 3,
      isPopular: true,
      featureFlags: {
        quantumIntelligence: false,
        holographicExperience: false,
        arvrSales: true,
        advancedAnalytics: true,
        llmIntegration: true,
      },
    },
    {
      name: 'Professional',
      planType: PlanType.PROFESSIONAL,
      price: 199.99,
      billingInterval: BillingInterval.MONTHLY,
      includedUsers: 50,
      trialDays: 14,
      features: [
        'All Business features',
        'Up to 50 users',
        'Unlimited contacts',
        'Dedicated support',
        'AR/VR Sales Experience',
        'Quantum Intelligence',
        'Holographic Experience',
        'Advanced AI features',
        'Custom workflows',
        'API access',
      ],
      description: 'For professional teams',
      maxUsers: 50,
      storageLimit: 200, // 200GB
      apiCallsPerMonth: 200000,
      pricePerAdditionalUser: 6.99,
      isActive: true,
      sortOrder: 4,
      isPopular: false,
      featureFlags: {
        quantumIntelligence: true,
        holographicExperience: true,
        arvrSales: true,
        advancedAnalytics: true,
        llmIntegration: true,
      },
    },
    {
      name: 'Enterprise',
      planType: PlanType.ENTERPRISE,
      price: 499.99,
      billingInterval: BillingInterval.MONTHLY,
      includedUsers: 999,
      trialDays: 30,
      features: [
        'All Professional features',
        'Unlimited users',
        'Unlimited contacts',
        'White-label options',
        'Dedicated account manager',
        'Custom SLA',
        'Advanced security',
        'Compliance features',
        'Custom development',
        'On-premise deployment',
      ],
      description: 'Complete Industry 5.0 solution for enterprises',
      maxUsers: null, // Unlimited
      storageLimit: null, // Unlimited
      apiCallsPerMonth: null, // Unlimited
      pricePerAdditionalUser: 0,
      isActive: true,
      sortOrder: 5,
      isPopular: false,
      featureFlags: {
        quantumIntelligence: true,
        holographicExperience: true,
        arvrSales: true,
        advancedAnalytics: true,
        llmIntegration: true,
      },
    },
  ];

  for (const planData of plans) {
    const plan = planRepository.create(planData);
    await planRepository.save(plan);
    console.log(`  ✓ Created plan: ${planData.name}`);
  }

  console.log('✓ Subscription plans seeded successfully!\n');
}

async function main() {
  console.log('========================================');
  console.log('CognexiaAI CRM - Database Seeding');
  console.log('========================================\n');

  try {
    console.log('📡 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✓ Database connected!\n');

    // Seed subscription plans
    await seedSubscriptionPlans(AppDataSource);

    console.log('========================================');
    console.log('✓ Database seeding completed successfully!');
    console.log('========================================\n');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

main();
