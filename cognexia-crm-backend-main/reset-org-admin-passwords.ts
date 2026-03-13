import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserType } from './src/entities/user.entity';
import { Organization } from './src/entities/organization.entity';

const TARGET_PASSWORD = 'OrgAdmin123!';

const ORG_ADMINS: Array<{ email: string; organizationId: string }> = [
  { email: 'office@windowanddoors.co.nz', organizationId: 'fce3e273-e09b-4b79-9724-bc32bb7952de' },
  { email: 'sales@briojoinery.com.au', organizationId: '4ac19b53-7665-4428-ac6b-5641b26e06e0' },
  { email: 'bandvk@xtra.co.nz', organizationId: '93d7f428-586e-4671-8bb6-f7d52ed07821' },
  { email: 'paul@paulspilotingservices.com', organizationId: '7b4425b4-8e75-4bf5-b987-cb9d09816a23' },
  { email: 'mybooking@onmywaynztour.co.nz', organizationId: 'eb537b92-8427-40e2-af4b-499f91ca09c1' },
  { email: 'sales@kiandesign.com.au', organizationId: 'fef8657d-d66b-43b8-8be9-0812997e49f2' },
  { email: 'info@constructdrafting.co.nz', organizationId: '18351cdd-6dd4-49b3-ab48-3d0162e98d9d' },
  { email: 'stay@accentontaupo.com', organizationId: 'bcbaff71-f323-413f-be8b-fc01397c82b4' },
  { email: 'info@ecmercedez.co.nz', organizationId: '8097562f-354e-4749-ab6c-1ff1662bb265' },
  { email: 'info@jhomoeopathiccare.co.nz', organizationId: '0fa52c5f-e079-40a4-8eb9-f09e1a367b3a' },
];

const ResetDataSource = new DataSource({
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

async function main() {
  console.log('========================================');
  console.log('Resetting Org Admin Passwords');
  console.log('========================================\n');

  if (!ResetDataSource.isInitialized) {
    await ResetDataSource.initialize();
  }

  const userRepo = ResetDataSource.getRepository(User);
  const orgRepo = ResetDataSource.getRepository(Organization);
  const passwordHash = await bcrypt.hash(TARGET_PASSWORD, 10);

  for (const entry of ORG_ADMINS) {
    const email = entry.email.toLowerCase();
    const user = await userRepo.findOne({ where: { email } });
    const org = await orgRepo.findOne({ where: { id: entry.organizationId } });

    if (!user || !org) {
      console.log(`- Skipped ${email} (user/org missing)`);
      continue;
    }

    user.passwordHash = passwordHash;
    user.userType = UserType.ORG_ADMIN;
    user.organizationId = entry.organizationId;
    user.roles = ['org_admin'];
    user.permissions = ['*'];
    user.isActive = true;
    user.isEmailVerified = true;

    await userRepo.save(user);

    org.currentUserCount = await userRepo.count({
      where: { organizationId: org.id, isActive: true },
    });
    await orgRepo.save(org);

    console.log(`✓ Updated ${email}`);
  }

  await ResetDataSource.destroy();
}

main().catch(async (error) => {
  console.error('❌ Error resetting org admin passwords:', error);
  if (ResetDataSource.isInitialized) {
    await ResetDataSource.destroy();
  }
  process.exit(1);
});
