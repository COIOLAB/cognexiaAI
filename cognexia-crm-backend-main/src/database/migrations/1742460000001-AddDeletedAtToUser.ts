import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddDeletedAtToUser1742460000001 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "deletedAt",
                type: "timestamp",
                isNullable: true,
                default: null
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "deletedAt");
    }

}
