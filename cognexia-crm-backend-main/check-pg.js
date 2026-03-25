const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function checkDb() {
    const config = process.env.DATABASE_URL 
        ? { connectionString: process.env.DATABASE_URL }
        : {
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT || '5432', 10),
            user: process.env.DATABASE_USER || 'postgres',
            password: process.env.DATABASE_PASSWORD || 'root',
            database: process.env.DATABASE_NAME || 'cognexia_crm',
        };

    console.log('Connecting with config:', { ...config, password: '****' });
    const client = new Client(config);
    
    try {
        await client.connect();
        
        // Check current database
        const dbRes = await client.query('SELECT current_database()');
        console.log('Connected to Database:', dbRes.rows[0].current_database);

        // Check tables
        const tablesRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables found:', tablesRes.rows.map(r => r.table_name).join(', '));

        // Check users
        if (tablesRes.rows.some(r => r.table_name === 'users')) {
            const usersRes = await client.query('SELECT id, email, "firstName", "lastName", "isActive", "isInvited", "organizationId" FROM users');
            console.log(`Found ${usersRes.rows.length} users:`);
            usersRes.rows.forEach(r => {
                console.log(`- ID: ${r.id} | Email: ${r.email} | Name: ${r.firstName} ${r.lastName} | Active: ${r.isActive} | Invited: ${r.isInvited} | OrgId: ${r.organizationId}`);
            });
        } else {
            console.log('CRITICAL: table "users" not found!');
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

checkDb();
