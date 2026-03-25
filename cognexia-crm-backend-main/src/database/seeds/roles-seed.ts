import AppDataSource from '../data-source';
import { Role } from '../../entities/role.entity';

export async function seedRoles() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log('Starting roles seed...');

    const roleRepo = AppDataSource.getRepository(Role);

    const roles = [
      { name: 'org_admin', description: 'Organization Administrator with full access' },
      { name: 'org_user', description: 'Standard Organization User' },
      { name: 'sales_rep', description: 'Sales Representative' },
      { name: 'sales_manager', description: 'Sales Manager' },
      { name: 'marketing_manager', description: 'Marketing Manager' },
      { name: 'support_agent', description: 'Support Agent' },
    ];

    for (const roleData of roles) {
      const canonicalName = roleData.name.toLowerCase();
      const existingRole = await roleRepo
        .createQueryBuilder('role')
        .where('LOWER(role.name) = LOWER(:name)', { name: canonicalName })
        .getOne();

      if (!existingRole) {
        const role = roleRepo.create({
          name: canonicalName,
          description: roleData.description,
        });
        await roleRepo.save(role);
        console.log(`Role created: ${canonicalName}`);
        continue;
      }

      let updated = false;
      if (existingRole.name !== canonicalName) {
        existingRole.name = canonicalName;
        updated = true;
      }

      if (existingRole.description !== roleData.description) {
        existingRole.description = roleData.description;
        updated = true;
      }

      if (updated) {
        await roleRepo.save(existingRole);
        console.log(`Role updated: ${canonicalName}`);
      } else {
        console.log(`Role already exists: ${canonicalName}`);
      }
    }

    console.log('Roles seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding roles:', error);
    throw error;
  }
}

if (require.main === module) {
  seedRoles()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
