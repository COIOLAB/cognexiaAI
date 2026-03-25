import AppDataSource from './src/database/data-source';
import { User } from './src/entities/user.entity';

async function checkUser() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(User);
  const user = await repo.findOne({ where: { email: 'piyushshinde42161@gmail.com' } });
  console.log('USER FROM DB:', user ? { id: user.id, email: user.email, roles: user.roles, type: user.userType } : 'Not found');
  process.exit(0);
}

checkUser().catch(console.error);
