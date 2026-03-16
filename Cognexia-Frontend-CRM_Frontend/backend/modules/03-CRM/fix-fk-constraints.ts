import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'Akshita@19822',
  database: process.env.DATABASE_NAME || 'cognexia_crm',
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: false,
});

async function fixConstraints() {
  console.log('========================================');
  console.log('Fixing FK Constraints');
  console.log('========================================\n');

  try {
    await AppDataSource.initialize();
    console.log('✓ Database connected!\n');

    const organizationId = '00000000-0000-0000-0000-000000000001';

    // Check if tenants table exists
    const tables = await AppDataSource.query(`
      SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename='tenants'
    `);
    
    if (tables.length === 0) {
      console.log('⚠️  Tenants table does not exist. Creating it...');
      await AppDataSource.query(`
        CREATE TABLE IF NOT EXISTS tenants (
          id UUID PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('✓ Tenants table created');
    } else {
      console.log('✓ Tenants table exists');
    }

    // Check if tenant exists
    const existingTenant = await AppDataSource.query(
      'SELECT id, name FROM tenants WHERE id = $1',
      [organizationId]
    );

    if (existingTenant && existingTenant.length > 0) {
      console.log('✓ Tenant already exists');
      console.log('  ID:', existingTenant[0].id);
      console.log('  Name:', existingTenant[0].name);
    } else {
      console.log('\nCreating tenant...');
      await AppDataSource.query(`
        INSERT INTO tenants (id, name)
        VALUES ($1, $2)
        ON CONFLICT (id) DO NOTHING
      `, [organizationId, 'Test Tenant']);
      console.log('✓ Tenant created successfully!');
    }

    // Check organizations table for holographic
    const orgCheck = await AppDataSource.query(
      'SELECT id, name FROM organizations WHERE id = $1',
      [organizationId]
    );

    if (!orgCheck || orgCheck.length === 0) {
      console.log('\n⚠️  Organization not found in organizations table');
      console.log('Creating organization...');
      await AppDataSource.query(`
        INSERT INTO organizations (id, name, email, "isActive", "maxUsers", "currentUserCount", "monthlyRevenue", created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [organizationId, 'Test Organization', 'test@organization.com', true, 10, 0, 0]);
      console.log('✓ Organization created');
    } else {
      console.log('\n✓ Organization exists in organizations table');
    }

    console.log('\n========================================');
    console.log('✓ All constraints fixed!');
    console.log('========================================\n');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

fixConstraints();
