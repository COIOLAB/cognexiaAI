import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';

config({ path: resolve(__dirname, '.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'cognexia_crm',
  synchronize: false,
});

async function verifyRegistration() {
  try {
    await AppDataSource.initialize();
    
    // Check organizations
    const orgs = await AppDataSource.query(`
      SELECT id, name, email, "maxUsers", "currentUserCount", "subscriptionStatus", "subscriptionPlanId"
      FROM organizations
      ORDER BY "createdAt" DESC
      LIMIT 5
    `);
    
    console.log('\n📊 Recent Organizations:');
    console.log('─'.repeat(100));
    orgs.forEach((org: any) => {
      console.log(`✓ ${org.name.padEnd(25)} | ${org.email.padEnd(25)} | ${org.subscriptionStatus.padEnd(10)} | Users: ${org.currentUserCount}/${org.maxUsers}`);
    });
    
    // Check users
    const users = await AppDataSource.query(`
      SELECT u.id, u.email, u."firstName", u."lastName", u."userType", u.roles, o.name as "orgName"
      FROM users u
      LEFT JOIN organizations o ON u."organizationId" = o.id
      ORDER BY u."createdAt" DESC
      LIMIT 5
    `);
    
    console.log('\n👥 Recent Users:');
    console.log('─'.repeat(100));
    users.forEach((user: any) => {
      const roles = Array.isArray(user.roles) ? user.roles.join(', ') : user.roles;
      console.log(`✓ ${user.email.padEnd(30)} | ${(user.firstName + ' ' + user.lastName).padEnd(20)} | ${user.userType.padEnd(15)} | ${roles}`);
      console.log(`  Org: ${user.orgName || 'N/A'}`);
    });
    
    console.log('\n');
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyRegistration();
