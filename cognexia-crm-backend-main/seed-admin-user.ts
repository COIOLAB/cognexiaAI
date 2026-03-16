import { DataSource } from 'typeorm';
import { Organization, OrganizationStatus, SubscriptionStatus } from './src/entities/organization.entity';
import { User, UserType } from './src/entities/user.entity';
import * as bcrypt from 'bcrypt';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';
// Always use lowercase so auth.service lookup (email.toLowerCase()) finds the user
const ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'superadmin@cognexiaai.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD || 'Akshita@19822';

const SeedDataSource = new DataSource({
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

async function ensureOrganization() {
  const orgRepo = SeedDataSource.getRepository(Organization);
  let org = await orgRepo.findOne({ where: { id: DEFAULT_ORG_ID } });

  if (!org) {
    org = orgRepo.create({
      id: DEFAULT_ORG_ID,
      name: 'CognexiaAI Super Admin Org',
      email: 'superadmin@cognexiaai.com',
      isActive: true,
      status: OrganizationStatus.ACTIVE,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      maxUsers: 999,
      currentUserCount: 1,
      metadata: { seeded: true },
    });
    await orgRepo.save(org);
  }

  return org;
}

async function ensureSuperAdmin() {
  const userRepo = SeedDataSource.getRepository(User);
  const existing = await userRepo.findOne({ where: { email: ADMIN_EMAIL.toLowerCase() } });

  if (existing) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    existing.passwordHash = passwordHash;
    existing.userType = UserType.SUPER_ADMIN;
    existing.organizationId = DEFAULT_ORG_ID;
    existing.roles = ['super_admin'];
    existing.permissions = ['*'];
    existing.isActive = true;
    existing.isEmailVerified = true;
    return userRepo.save(existing);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const adminUser = userRepo.create({
    email: ADMIN_EMAIL.toLowerCase(),
    firstName: 'Super',
    lastName: 'Admin',
    passwordHash,
    userType: UserType.SUPER_ADMIN,
    organizationId: DEFAULT_ORG_ID,
    roles: ['super_admin'],
    permissions: ['*'],
    isActive: true,
    isEmailVerified: true,
    metadata: { seeded: true },
  });

  return userRepo.save(adminUser);
}

async function main() {
  console.log('========================================');
  console.log('Seeding Super Admin User');
  console.log('========================================\n');

  try {
    if (!SeedDataSource.isInitialized) {
      await SeedDataSource.initialize();
    }

    await ensureOrganization();
    const admin = await ensureSuperAdmin();

    console.log('✓ Super admin ready');
    console.log(`  Email: ${admin.email}`);
    console.log(`  OrganizationId: ${admin.organizationId}`);

    await SeedDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding super admin:', error);
    if (SeedDataSource.isInitialized) {
      await SeedDataSource.destroy();
    }
    process.exit(1);
  }
}

main();
