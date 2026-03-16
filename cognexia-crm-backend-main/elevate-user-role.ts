import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'Akshita@19822',
  database: process.env.DATABASE_NAME || 'cognexia_crm',
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: false,
});

async function main() {
  const email = process.argv[2];
  const role = (process.argv[3] || 'super_admin').toLowerCase();
  if (!email) {
    console.error('Usage: ts-node elevate-user-role.ts <email> [super_admin|org_admin|org_user]');
    process.exit(2);
  }
  try {
    await AppDataSource.initialize();
    const res = await AppDataSource.query(
      'UPDATE users SET "userType" = $1 WHERE email = $2 RETURNING id, email, "userType"',
      [role, email]
    );
    if (res.length === 0) {
      console.error('No user found for', email);
      process.exit(1);
    }
    console.log('User elevated:', res[0]);
    await AppDataSource.destroy();
  } catch (e:any) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

main();