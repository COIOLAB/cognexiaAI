import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRolesColumnToUser1742460000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('users');
    if (hasTable) {
      const table = await queryRunner.getTable('users');
      const hasColumn = table.findColumnByName('roles');
      
      if (!hasColumn) {
        await queryRunner.addColumn(
          'users',
          new TableColumn({
            name: 'roles',
            type: 'json',
            isNullable: true,
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('users');
    if (hasTable) {
      const table = await queryRunner.getTable('users');
      const hasColumn = table.findColumnByName('roles');
      
      if (hasColumn) {
        await queryRunner.dropColumn('users', 'roles');
      }
    }
  }
}
