import { createConnection } from 'typeorm';
import { User } from './src/entities/user.entity';
import * as dotenv from 'dotenv';
dotenv.config();

async function checkUsers() {
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
        const connection = await createConnection({
            ...config,
            entities: [User],
        });
        const userRepository = connection.getRepository(User);
        const users = await userRepository.find({ take: 5 });
        console.log('Users:', JSON.stringify(users, null, 2));
        await connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUsers();
