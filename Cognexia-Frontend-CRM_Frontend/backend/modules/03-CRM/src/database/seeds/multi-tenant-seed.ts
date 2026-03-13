import AppDataSource from '../data-source';
import { MasterOrganization } from '../../entities/master-organization.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { PlanType, BillingInterval } from '../../entities/subscription-plan.entity';

export async function seedMultiTenantData() {
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log('🌱 Starting multi-tenant seed...');

    // 1. Create Master Organization (CognexiaAI)
    const masterOrgRepo = AppDataSource.getRepository(MasterOrganization);
    let masterOrg = await masterOrgRepo.findOne({ where: { name: 'CognexiaAI' } });
    
    if (!masterOrg) {
      masterOrg = masterOrgRepo.create({
        name: 'CognexiaAI',
        email: 'admin@cognexiaai.com',
        phone: '+1-555-0100',
        address: '123 Innovation Drive, Tech City, TC 12345',
        website: 'https://cognexiaai.com',
        logoUrl: 'https://cognexiaai.com/logo.png',
        branding: {
          primaryColor: '#2563eb',
          secondaryColor: '#1e40af',
          fontFamily: 'Inter, sans-serif'
        },
        settings: {
          defaultTrialDays: 14,
          defaultCurrency: 'USD',
          supportEmail: 'support@cognexiaai.com',
          supportPhone: '+1-555-0199',
          features: ['AI-powered CRM', 'Multi-tenant Architecture', 'Enterprise Security']
        },
        isActive: true
      });
      await masterOrgRepo.save(masterOrg);
      console.log('✅ Master Organization created: CognexiaAI');
    } else {
      console.log('ℹ️  Master Organization already exists: CognexiaAI');
    }

    // 2. Create Subscription Plans
    const planRepo = AppDataSource.getRepository(SubscriptionPlan);

    const plans = [
      {
        name: 'Starter',
        planType: PlanType.STARTER,
        description: 'Perfect for small teams getting started with CRM',
        price: 199.00,
        currency: 'USD',
        billingInterval: BillingInterval.MONTHLY,
        includedUsers: 5,
        pricePerAdditionalUser: 20.00,
        maxUsers: 10,
        storageLimit: 10, // GB
        apiCallsPerMonth: 10000,
        features: [
          'Up to 5 users',
          '10 GB storage',
          'Basic CRM features',
          'Email support',
          'Mobile app access',
          '10,000 API calls/month'
        ],
        featureFlags: {
          aiFeatures: false,
          advancedAnalytics: false,
          customReporting: false,
          apiAccess: true,
          ssoIntegration: false,
          whiteLabeling: false,
          prioritySupport: false,
          dedicatedAccountManager: false,
          customIntegrations: false,
          advancedSecurity: false
        },
        trialDays: 14,
        isActive: true,
        isPopular: false,
        sortOrder: 1
      },
      {
        name: 'Professional',
        planType: PlanType.PROFESSIONAL,
        description: 'For growing businesses with advanced needs',
        price: 399.00,
        currency: 'USD',
        billingInterval: BillingInterval.MONTHLY,
        includedUsers: 15,
        pricePerAdditionalUser: 18.00,
        maxUsers: 50,
        storageLimit: 50, // GB
        apiCallsPerMonth: 50000,
        features: [
          'Up to 15 users',
          '50 GB storage',
          'Advanced CRM features',
          'AI-powered insights',
          'Priority email support',
          'Custom reporting',
          '50,000 API calls/month',
          'SSO integration'
        ],
        featureFlags: {
          aiFeatures: true,
          advancedAnalytics: true,
          customReporting: true,
          apiAccess: true,
          ssoIntegration: true,
          whiteLabeling: false,
          prioritySupport: true,
          dedicatedAccountManager: false,
          customIntegrations: false,
          advancedSecurity: true
        },
        trialDays: 14,
        isActive: true,
        isPopular: true,
        sortOrder: 2
      },
      {
        name: 'Business',
        planType: PlanType.BUSINESS,
        description: 'Comprehensive solution for large teams',
        price: 799.00,
        currency: 'USD',
        billingInterval: BillingInterval.MONTHLY,
        includedUsers: 50,
        pricePerAdditionalUser: 15.00,
        maxUsers: 200,
        storageLimit: 200, // GB
        apiCallsPerMonth: 200000,
        features: [
          'Up to 50 users',
          '200 GB storage',
          'Full CRM suite',
          'Advanced AI features',
          'Priority phone & email support',
          'Custom integrations',
          'White labeling',
          '200,000 API calls/month',
          'Advanced security features',
          'Dedicated account manager'
        ],
        featureFlags: {
          aiFeatures: true,
          advancedAnalytics: true,
          customReporting: true,
          apiAccess: true,
          ssoIntegration: true,
          whiteLabeling: true,
          prioritySupport: true,
          dedicatedAccountManager: true,
          customIntegrations: true,
          advancedSecurity: true
        },
        trialDays: 14,
        isActive: true,
        isPopular: false,
        sortOrder: 3
      },
      {
        name: 'Enterprise',
        planType: PlanType.ENTERPRISE,
        description: 'Tailored solution for large enterprises',
        price: 1999.00,
        currency: 'USD',
        billingInterval: BillingInterval.MONTHLY,
        includedUsers: 200,
        pricePerAdditionalUser: 10.00,
        maxUsers: null, // Unlimited
        storageLimit: null, // Unlimited
        apiCallsPerMonth: null, // Unlimited
        features: [
          'Unlimited users',
          'Unlimited storage',
          'Enterprise CRM suite',
          'Full AI capabilities',
          '24/7 premium support',
          'Custom development',
          'On-premise deployment option',
          'Unlimited API calls',
          'Advanced security & compliance',
          'Dedicated success team',
          'Custom SLA',
          'Training & onboarding'
        ],
        featureFlags: {
          aiFeatures: true,
          advancedAnalytics: true,
          customReporting: true,
          apiAccess: true,
          ssoIntegration: true,
          whiteLabeling: true,
          prioritySupport: true,
          dedicatedAccountManager: true,
          customIntegrations: true,
          advancedSecurity: true
        },
        trialDays: 30,
        isActive: true,
        isPopular: false,
        sortOrder: 4
      }
    ];

    for (const planData of plans) {
      const existingPlan = await planRepo.findOne({ where: { planType: planData.planType } });
      
      if (!existingPlan) {
        const plan = planRepo.create(planData);
        await planRepo.save(plan);
        console.log(`✅ Subscription plan created: ${planData.name} ($${planData.price}/month)`);
      } else {
        console.log(`ℹ️  Subscription plan already exists: ${planData.name}`);
      }
    }

    console.log('✅ Multi-tenant seed completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - Master Organization: CognexiaAI`);
    console.log(`   - Subscription Plans: ${plans.length}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding multi-tenant data:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedMultiTenantData()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
