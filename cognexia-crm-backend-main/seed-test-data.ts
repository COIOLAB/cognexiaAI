import { DataSource } from 'typeorm';
import { Customer } from './src/entities/customer.entity';
import { Product } from './src/entities/product.entity';
import { Organization } from './src/entities/organization.entity';

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

async function seedTestData() {
  console.log('========================================');
  console.log('Seeding Test Data');
  console.log('========================================\n');

  try {
    console.log('📡 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✓ Database connected!\n');

    const organizationId = '00000000-0000-0000-0000-000000000001';
    
    // Verify organization exists
    const orgRepo = AppDataSource.getRepository(Organization);
    const org = await orgRepo.findOne({ where: { id: organizationId } });
    
    if (!org) {
      console.error('❌ Test organization not found. Please run: npm run create-test-org');
      process.exit(1);
    }
    
    console.log('✓ Organization found:', org.name);
    console.log('');

    // Seed Customers
    await seedCustomers(organizationId);
    
    // Seed Products
    await seedProducts(organizationId);

    console.log('\n========================================');
    console.log('✓ Test data seeding completed!');
    console.log('========================================\n');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

async function seedCustomers(organizationId: string) {
  console.log('🌱 Seeding Test Customers...');
  
  const customerRepo = AppDataSource.getRepository(Customer);
  
  // Check if test customer already exists
  const existing = await customerRepo.findOne({
    where: { customerCode: 'TEST-CUST-456' }
  });
  
  if (existing) {
    console.log('  ✓ Test customer already exists');
    console.log('    ID:', existing.id);
    console.log('    Code:', existing.customerCode);
    return;
  }

  const customers = [
    {
      id: '00000000-0000-0000-0000-000000000456',
      customerCode: 'TEST-CUST-456',
      companyName: 'Test Company',
      customerType: 'b2b',
      status: 'active',
      industry: 'Technology',
      size: 'small_medium',
      primaryContact: {
        firstName: 'Test',
        lastName: 'Customer',
        title: 'CEO',
        email: 'test@customer.com',
        phone: '+1234567890',
      },
      address: {
        street: '123 Test St',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zipCode: '94105',
        region: 'West',
      },
      demographics: {
        foundedYear: 2020,
        employeeCount: 50,
        annualRevenue: 1000000,
        website: 'https://testcompany.com',
      },
      preferences: {
        language: 'en',
        currency: 'USD',
        timezone: 'America/Los_Angeles',
        communicationChannels: ['email'],
        marketingOptIn: true,
        newsletterOptIn: true,
        eventInvitations: true,
        privacySettings: {
          dataSharing: true,
          analytics: true,
          marketing: true,
        },
      },
      salesMetrics: {
        totalRevenue: 50000,
        averageOrderValue: 5000,
        paymentTerms: 'Net 30',
      },
      relationshipMetrics: {
        customerSince: new Date().toISOString(),
        loyaltyScore: 80,
        satisfactionScore: 85,
        npsScore: 8,
      },
      segmentation: {
        segment: 'Enterprise',
        tier: 'gold',
        riskLevel: 'low',
        growthPotential: 'high',
      },
      tags: ['test', 'demo'],
      createdBy: 'seed-script',
      updatedBy: 'seed-script',
    },
  ];

  for (const customerData of customers) {
    try {
      // Try to insert with specific ID for the test customer
      if (customerData.id) {
        await customerRepo.query(`
          INSERT INTO crm_customers (
            id, "customerCode", "companyName", "customerType", status, industry, size,
            "primaryContact", address, demographics, preferences, "salesMetrics", 
            "relationshipMetrics", segmentation, tags, created_by, updated_by
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (id) DO NOTHING
        `, [
          customerData.id,
          customerData.customerCode,
          customerData.companyName,
          customerData.customerType,
          customerData.status,
          customerData.industry,
          customerData.size,
          JSON.stringify(customerData.primaryContact),
          JSON.stringify(customerData.address),
          JSON.stringify(customerData.demographics),
          JSON.stringify(customerData.preferences),
          JSON.stringify(customerData.salesMetrics),
          JSON.stringify(customerData.relationshipMetrics),
          JSON.stringify(customerData.segmentation),
          customerData.tags,
          customerData.createdBy,
          customerData.updatedBy,
        ]);
        console.log(`  ✓ Created customer: ${customerData.companyName} (${customerData.customerCode})`);
      }
    } catch (error: any) {
      console.log(`  ⚠️  Skipped ${customerData.companyName} (${error.message.split('\n')[0]})`);
    }
  }
}

async function seedProducts(organizationId: string) {
  console.log('\n🌱 Seeding Test Products...');
  
  const productRepo = AppDataSource.getRepository(Product);
  
  // Check if test product already exists
  const existing = await productRepo.findOne({
    where: { sku: 'PROD-123' }
  });
  
  if (existing) {
    console.log('  ✓ Test product already exists');
    console.log('    ID:', existing.id);
    console.log('    SKU:', existing.sku);
    return;
  }

  const products = [
    {
      id: '00000000-0000-0000-0000-000000000123',
      tenantId: organizationId,
      name: 'Test Product',
      sku: 'PROD-123',
      description: 'Test product for API testing',
      shortDescription: 'Test product',
      type: 'physical',
      status: 'active',
      basePrice: 99.99,
      costPrice: 50.00,
      msrp: 119.99,
      currency: 'USD',
      trackInventory: true,
      quantityInStock: 100,
      quantityReserved: 0,
      lowStockThreshold: 10,
      allowBackorder: false,
      brand: 'Test Brand',
      manufacturer: 'Test Manufacturer',
      tags: ['test', 'demo'],
      isFeatured: false,
      isOnSale: false,
    },
    {
      tenantId: organizationId,
      name: 'Premium Widget',
      sku: 'WIDGET-001',
      description: 'Premium quality widget',
      shortDescription: 'Premium widget',
      type: 'physical',
      status: 'active',
      basePrice: 149.99,
      costPrice: 75.00,
      msrp: 179.99,
      currency: 'USD',
      trackInventory: true,
      quantityInStock: 50,
      quantityReserved: 0,
      lowStockThreshold: 5,
      allowBackorder: false,
      brand: 'Premium Brand',
      tags: ['premium', 'bestseller'],
      isFeatured: true,
      isOnSale: false,
    },
  ];

  for (const productData of products) {
    try {
      // Try to insert with specific ID for the test product
      if (productData.id) {
        await productRepo.query(`
          INSERT INTO products (
            id, "tenantId", name, sku, description, "shortDescription", type, status,
            "basePrice", "costPrice", msrp, currency, "trackInventory", "quantityInStock",
            "quantityReserved", "lowStockThreshold", "allowBackorder", brand, manufacturer, tags,
            "isFeatured", "isOnSale"
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
          ON CONFLICT (id) DO NOTHING
        `, [
          productData.id,
          productData.tenantId,
          productData.name,
          productData.sku,
          productData.description,
          productData.shortDescription,
          productData.type,
          productData.status,
          productData.basePrice,
          productData.costPrice,
          productData.msrp,
          productData.currency,
          productData.trackInventory,
          productData.quantityInStock,
          productData.quantityReserved,
          productData.lowStockThreshold,
          productData.allowBackorder,
          productData.brand,
          productData.manufacturer,
          productData.tags,
          productData.isFeatured,
          productData.isOnSale,
        ]);
        console.log(`  ✓ Created product: ${productData.name} (${productData.sku})`);
      }
    } catch (error: any) {
      console.log(`  ⚠️  Skipped ${productData.name} (${error.message.split('\n')[0]})`);
    }
  }
}

seedTestData();
