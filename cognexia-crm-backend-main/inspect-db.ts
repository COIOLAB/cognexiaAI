import { createConnection, Connection } from 'typeorm';
import { User } from './src/entities/user.entity';
import * as dotenv from 'dotenv';
dotenv.config();

async function inspectDatabase() {
    let connection: Connection | null = null;
    try {
        const config: any = process.env.DATABASE_URL 
            ? { type: 'postgres', url: process.env.DATABASE_URL }
            : {
                type: 'postgres',
                host: process.env.DATABASE_HOST || 'localhost',
                port: parseInt(process.env.DATABASE_PORT || '5432', 10),
                username: process.env.DATABASE_USER || 'postgres',
                password: process.env.DATABASE_PASSWORD || 'root',
                database: process.env.DATABASE_NAME || 'cognexia_crm',
            };
        
        console.log('Connecting to database:', config.database, 'on', config.host);
        
        connection = await createConnection({
            ...config,
            entities: [User],
            synchronize: false,
        });
        
        const userRepository = connection.getRepository(User);
        const users = await userRepository.find({ withDeleted: true });
        
        console.log(`Found ${users.length} users in table 'users':`);
        users.forEach(u => {
            console.log(`- ${u.email} (${u.firstName} ${u.lastName}) | Active: ${u.isActive} | Invited: ${u.isInvited} | Deleted: ${!!u.deletedAt}`);
        });

        const rawTables = await connection.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Available tables in public schema:', rawTables.map(t => t.table_name).join(', '));

    } catch (error) {
        console.error('Error during inspection:', error);
    } finally {
        if (connection) await connection.close();
    }
}

inspectDatabase();
