import { config } from 'dotenv';

config();

// Alternative: Use Supabase REST API or psql command
// Since Node.js can't connect, let's generate SQL and execute via psql

async function generateCreateTableSQL() {
  const { DataSource } = require('typeorm');
  
  console.log('📝 Loading all entity definitions...\n');
  
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost', // dummy host - won't actually connect
    port: 5432,
    username: 'postgres',
    password: 'password',
    database: 'test',
    entities: [__dirname + '/src/entities/**/*.entity.{ts,js}'],
    synchronize: false,
    logging: false,
  });

  try {
    await AppDataSource.initialize();
    
    // Get the SQL queries that would be executed
    const sqlInMemory = await AppDataSource.driver.createSchemaBuilder().log();
    
    console.log('✅ Generated SQL for table creation:\n');
    console.log('================================================\n');
    
    if (sqlInMemory.upQueries && sqlInMemory.upQueries.length > 0) {
      sqlInMemory.upQueries.forEach((query: any) => {
        console.log(query.query + ';\n');
      });
      
      console.log('================================================\n');
      console.log(`Total queries: ${sqlInMemory.upQueries.length}`);
      console.log('\n💡 Copy these SQL statements and execute them in Supabase SQL Editor:');
      console.log('   https://supabase.com/dashboard/project/moijigidcrvbnjoaqelr/editor\n');
    } else {
      console.log('⚠️  No schema changes detected. Tables may already exist.\n');
    }
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

generateCreateTableSQL();
