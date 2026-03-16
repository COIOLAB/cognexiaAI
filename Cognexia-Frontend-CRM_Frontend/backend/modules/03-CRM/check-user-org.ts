import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

async function checkUserOrg() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME || 'postgres',
  });

  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Connected!\n');

    // Check user and their organization
    console.log('Checking user admin@cognexiaai.com...');
    const result = await dataSource.query(`
      SELECT 
        u.id as user_id,
        u.email,
        u."firstName",
        u."lastName",
        u."userType",
        u."organizationId",
        o.name as org_name,
        o.status as org_status,
        o."subscriptionStatus" as subscription_status
      FROM users u
      LEFT JOIN organizations o ON u."organizationId" = o.id
      WHERE u.email = $1
    `, ['admin@cognexiaai.com']);

    if (result.length > 0) {
      const user = result[0];
      console.log('\n=== User Info ===');
      console.log(`Name: ${user.firstName} ${user.lastName}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.userType}`);
      console.log(`Organization ID: ${user.organizationId}`);
      console.log(`\n=== Organization Info ===`);
      console.log(`Name: ${user.org_name || 'NULL'}`);
      console.log(`Status: ${user.org_status || 'NULL'}`);
      console.log(`Subscription: ${user.subscription_status || 'NULL'}\n`);

      if (user.organizationId) {
        console.log('Activating this organization...');
        await dataSource.query(`
          UPDATE organizations 
          SET 
            status = 'active',
            "subscriptionStatus" = 'active'
          WHERE id = $1
        `, [user.organizationId]);
        console.log('✅ Organization activated!\n');

        // Verify the update
        const updated = await dataSource.query(`
          SELECT status, "subscriptionStatus" 
          FROM organizations 
          WHERE id = $1
        `, [user.organizationId]);
        console.log('Verified status:', updated[0]);
      }
    } else {
      console.log('❌ User not found');
    }

    await dataSource.destroy();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkUserOrg();
