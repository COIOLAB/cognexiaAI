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

async function verifyPlans() {
  try {
    await AppDataSource.initialize();
    
    const plans = await AppDataSource.query('SELECT id, name, "planType", price, "includedUsers" FROM subscription_plans ORDER BY "sortOrder"');
    
    console.log('\n📋 Subscription Plans:');
    console.log('─'.repeat(80));
    plans.forEach((plan: any) => {
      console.log(`✓ ${plan.name.padEnd(20)} | ${plan.planType.padEnd(12)} | $${plan.price.toString().padStart(3)} | ${plan.includedUsers} users`);
    });
    console.log('─'.repeat(80));
    console.log(`Total plans: ${plans.length}\n`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyPlans();
