import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export default new DataSource({
  type: 'postgres',
  host: 'localhost', // dummy - won't connect
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'test',
  entities: ['src/entities/**/*.entity.{ts,js}'],
  migrations: ['src/database/migrations/*.{ts,js}'],
  synchronize: false,
  logging: false,
});
