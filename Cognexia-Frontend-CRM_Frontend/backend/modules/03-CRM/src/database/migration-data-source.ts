import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config();

const useUrl = !!process.env.DATABASE_URL;
const isRemoteDb = useUrl || (process.env.DATABASE_HOST && process.env.DATABASE_HOST !== 'localhost');
const ssl = isRemoteDb ? { rejectUnauthorized: false } : false;

// Supabase from Railway: ensure sslmode=require in URL
const rawUrl = process.env.DATABASE_URL;
const databaseUrl = rawUrl && rawUrl.includes('supabase.co') && !/[?&]sslmode=/.test(rawUrl)
  ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}sslmode=require`
  : rawUrl;

// Supports DATABASE_URL (Railway, Supabase) or DATABASE_HOST/PORT/USER/PASSWORD/NAME
export default new DataSource(
  useUrl
    ? {
        type: 'postgres',
        url: databaseUrl,
        entities: [join(__dirname, '..', 'entities', '**', '*.entity.{ts,js}')],
        migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
        synchronize: false,
        logging: true,
        ssl,
        extra: ssl ? { ssl } : {},
      }
    : {
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        username: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'Akshita@19822',
        database: process.env.DATABASE_NAME || 'cognexia_crm',
        entities: [join(__dirname, '..', 'entities', '**', '*.entity.{ts,js}')],
        migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
        synchronize: false,
        logging: true,
        ssl,
        extra: ssl ? { ssl } : {},
      }
);
