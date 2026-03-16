import { DataSource } from 'typeorm';
import { Organization, OrganizationStatus, SubscriptionStatus } from './src/entities/organization.entity';

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

async function createTestOrganization() {
  console.log('Creating test organization...');
  
  const orgRepo = AppDataSource.getRepository(Organization);
  
  // Check if org already exists
  const existing = await orgRepo.findOne({
    where: { id: '00000000-0000-0000-0000-000000000001' }
  });
  
  if (existing) {
    console.log('✓ Test organization already exists');
    console.log('  ID:', existing.id);
    console.log('  Name:', existing.name);
    return existing;
  }
  
  // Create test organization (without ID - let DB generate it or update if exists)
  let org: Organization;
  try {
    // Try to insert with specific ID using query builder
    await orgRepo.query(`
      INSERT INTO organizations (id, name, email, "isActive", status, "subscriptionStatus", "maxUsers", "currentUserCount", metadata)
      VALUES ('00000000-0000-0000-0000-000000000001', 'Test Organization', 'test@example.com', true, 'active', 'active', 100, 1, '{"testData": true}')
      ON CONFLICT (id) DO NOTHING
    `);
    
    org = await orgRepo.findOne({ where: { id: '00000000-0000-0000-0000-000000000001' } }) as Organization;
  } catch (error) {
    // If that fails, create without ID and let DB generate
    org = orgRepo.create({
      name: 'Test Organization ' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      isActive: true,
      status: OrganizationStatus.ACTIVE,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      maxUsers: 100,
      currentUserCount: 1,
      metadata: {
        testData: true,
        createdBy: 'seed-script',
      },
    });
    org = await orgRepo.save(org);
  }
  
  
  console.log('✓ Test organization created successfully!');
  console.log('  ID:', org.id);
  console.log('  Name:', org.name);
  
  return org;
}

async function main() {
  console.log('========================================');
  console.log('Create Test Organization');
  console.log('========================================\n');

  try {
    console.log('📡 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✓ Database connected!\n');

    await createTestOrganization();

    console.log('\n========================================');
    console.log('✓ Setup completed successfully!');
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

main();
