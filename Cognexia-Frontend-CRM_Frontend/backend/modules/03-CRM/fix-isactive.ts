import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

async function fixIsActive() {
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

    console.log('Updating isActive column for all organizations...');
    await dataSource.query(`
      UPDATE organizations 
      SET "isActive" = true
    `);
    console.log('✅ All organizations set to isActive = true\n');

    // Verify the demo org
    const result = await dataSource.query(`
      SELECT name, status, "subscriptionStatus", "isActive" 
      FROM organizations 
      WHERE id = $1
    `, ['00000000-0000-0000-0000-000000000001']);

    console.log('Verified CognexiaAI Fixture Org:');
    console.log(result[0]);
    console.log('\n🎉 All organizations activated!');

    await dataSource.destroy();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixIsActive();
