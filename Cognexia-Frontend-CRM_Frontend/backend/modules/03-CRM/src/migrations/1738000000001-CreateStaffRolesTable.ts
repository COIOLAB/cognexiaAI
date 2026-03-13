import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateStaffRolesTable1738000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'staff_roles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'permissions',
            type: 'jsonb',
            isNullable: false,
            default: "'{}'",
          },
          {
            name: 'assignedOrganizations',
            type: 'jsonb',
            isNullable: true,
            comment: 'Array of organization IDs this staff member can access',
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'assignedBy',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Add indexes
    await queryRunner.createIndex(
      'staff_roles',
      new TableIndex({
        name: 'IDX_STAFF_ROLES_USER_ID',
        columnNames: ['userId'],
      })
    );

    await queryRunner.createIndex(
      'staff_roles',
      new TableIndex({
        name: 'IDX_STAFF_ROLES_ROLE',
        columnNames: ['role'],
      })
    );

    await queryRunner.createIndex(
      'staff_roles',
      new TableIndex({
        name: 'IDX_STAFF_ROLES_IS_ACTIVE',
        columnNames: ['isActive'],
      })
    );

    // Add foreign key to users table
    await queryRunner.query(`
      ALTER TABLE staff_roles
      ADD CONSTRAINT fk_staff_roles_user
      FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE staff_roles
      ADD CONSTRAINT fk_staff_roles_assigned_by
      FOREIGN KEY ("assignedBy") REFERENCES users(id) ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('staff_roles');
  }
}
