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
  logging: true,
});

async function createSystemUser() {
  console.log('========================================');
  console.log('Creating System User');
  console.log('========================================\n');

  try {
    await AppDataSource.initialize();
    console.log('✓ Database connected!\n');

    const organizationId = '00000000-0000-0000-0000-000000000001';
    const systemUserId = '00000000-0000-0000-0000-000000000002';

    // Check if system user exists
    const existing = await AppDataSource.query(
      'SELECT id, email FROM users WHERE id = $1',
      [systemUserId]
    );

    if (existing && existing.length > 0) {
      console.log('✓ System user already exists');
      console.log('  ID:', existing[0].id);
      console.log('  Email:', existing[0].email);
      await AppDataSource.destroy();
      process.exit(0);
    }

    // Create system user
    console.log('Creating system user...');
    await AppDataSource.query(`
      INSERT INTO users (id, email, "firstName", "lastName", "passwordHash", "organizationId", "userType", "isActive")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING
    `, [
      systemUserId,
      'system@cognexiaai.com',
      'System',
      'User',
      '$2b$10$abcdefghijklmnopqrstuv', // dummy hash
      organizationId,
      'org_admin',
      true
    ]);

    console.log('✓ System user created successfully!');
    console.log('  ID:', systemUserId);
    console.log('  Email: system@cognexiaai.com');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

createSystemUser();
