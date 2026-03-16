import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { SubscriptionPlan, PlanType, BillingInterval } from './src/entities/subscription-plan.entity';

// Load .env file
config({ path: resolve(__dirname, '.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'cognexia_crm',
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  synchronize: true,
});

async function seedPlans() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const planRepository = AppDataSource.getRepository(SubscriptionPlan);

    // Check if plans already exist
    const existingPlans = await planRepository.count();
    if (existingPlans > 0) {
      console.log(`Plans already exist (${existingPlans} found). Skipping seed.`);
      await AppDataSource.destroy();
      return;
    }

    // Create subscription plans
    const plans = [
      {
        name: 'FREE Trial',
        planType: PlanType.FREE,
        price: 0,
        billingInterval: BillingInterval.MONTHLY,
        includedUsers: 5,
        trialDays: 14,
        features: [
          'Up to 5 users',
          '100 contacts',
          'Basic CRM features',
          'Email support',
          'Mobile app access',
          '14-day trial',
        ],
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Starter',
        planType: PlanType.STARTER,
        price: 29,
        billingInterval: BillingInterval.MONTHLY,
        includedUsers: 10,
        trialDays: 14,
        features: [
          'Up to 10 users',
          '1,000 contacts',
          'All CRM features',
          'Email & chat support',
          'Mobile app access',
          'Basic analytics',
          'API access',
        ],
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Business',
        planType: PlanType.BUSINESS,
        price: 79,
        billingInterval: BillingInterval.MONTHLY,
        includedUsers: 25,
        trialDays: 14,
        features: [
          'Up to 25 users',
          '10,000 contacts',
          'All CRM features',
          'Priority support',
          'Advanced analytics',
          'Custom reports',
          'API access',
          'Automation workflows',
          'Team collaboration',
        ],
        isActive: true,
        sortOrder: 3,
      },
      {
        name: 'Enterprise',
        planType: PlanType.ENTERPRISE,
        price: 199,
        billingInterval: BillingInterval.MONTHLY,
        includedUsers: 100,
        trialDays: 30,
        features: [
          'Up to 100 users',
          'Unlimited contacts',
          'All CRM features',
          '24/7 dedicated support',
          'Advanced analytics & AI',
          'Custom integrations',
          'White-label options',
          'Custom workflows',
          'Advanced security',
          'SLA guarantee',
          'Account manager',
        ],
        isActive: true,
        sortOrder: 4,
      },
    ];

    for (const planData of plans) {
      const plan = planRepository.create(planData);
      await planRepository.save(plan);
      console.log(`✓ Created plan: ${plan.name}`);
    }

    console.log('\n✅ Successfully seeded all subscription plans!');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    process.exit(1);
  }
}

seedPlans();
