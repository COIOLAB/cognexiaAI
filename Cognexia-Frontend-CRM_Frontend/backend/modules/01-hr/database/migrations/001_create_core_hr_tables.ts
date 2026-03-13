import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateCoreHRTables1707123456001 implements MigrationInterface {
    name = 'CreateCoreHRTables1707123456001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Organizations table
        await queryRunner.createTable(
            new Table({
                name: 'organizations',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()'
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false
                    },
                    {
                        name: 'code',
                        type: 'varchar',
                        length: '10',
                        isNullable: false,
                        isUnique: true
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: ['corporation', 'partnership', 'sole_proprietorship', 'llp', 'private_limited', 'public_limited'],
                        default: "'private_limited'"
                    },
                    {
                        name: 'industry',
                        type: 'varchar',
                        length: '100',
                        isNullable: true
                    },
                    {
                        name: 'size',
                        type: 'enum',
                        enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
                        default: "'medium'"
                    },
                    {
                        name: 'address',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'contact_info',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'legal_info',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'settings',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        default: true
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    }
                ]
            })
        );

        // Create Departments table
        await queryRunner.createTable(
            new Table({
                name: 'departments',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()'
                    },
                    {
                        name: 'organization_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'parent_id',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false
                    },
                    {
                        name: 'code',
                        type: 'varchar',
                        length: '20',
                        isNullable: false
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'level',
                        type: 'int',
                        default: 1
                    },
                    {
                        name: 'cost_center_code',
                        type: 'varchar',
                        length: '20',
                        isNullable: true
                    },
                    {
                        name: 'budget',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'head_employee_id',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        default: true
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    }
                ]
            })
        );

        // Create Positions table
        await queryRunner.createTable(
            new Table({
                name: 'positions',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()'
                    },
                    {
                        name: 'organization_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'department_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        length: '255',
                        isNullable: false
                    },
                    {
                        name: 'code',
                        type: 'varchar',
                        length: '20',
                        isNullable: false
                    },
                    {
                        name: 'level',
                        type: 'enum',
                        enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'vp', 'c_level']
                    },
                    {
                        name: 'category',
                        type: 'enum',
                        enum: ['management', 'technical', 'sales', 'marketing', 'hr', 'finance', 'operations', 'support']
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'requirements',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'responsibilities',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'skills_required',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'salary_range',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        default: true
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    }
                ]
            })
        );

        // Create Employees table
        await queryRunner.createTable(
            new Table({
                name: 'employees',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()'
                    },
                    {
                        name: 'organization_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'employee_number',
                        type: 'varchar',
                        length: '20',
                        isNullable: false,
                        isUnique: true
                    },
                    {
                        name: 'first_name',
                        type: 'varchar',
                        length: '100',
                        isNullable: false
                    },
                    {
                        name: 'last_name',
                        type: 'varchar',
                        length: '100',
                        isNullable: false
                    },
                    {
                        name: 'middle_name',
                        type: 'varchar',
                        length: '100',
                        isNullable: true
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                        isUnique: true
                    },
                    {
                        name: 'phone',
                        type: 'varchar',
                        length: '20',
                        isNullable: true
                    },
                    {
                        name: 'date_of_birth',
                        type: 'date',
                        isNullable: true
                    },
                    {
                        name: 'gender',
                        type: 'enum',
                        enum: ['male', 'female', 'other', 'prefer_not_to_say'],
                        isNullable: true
                    },
                    {
                        name: 'address',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'emergency_contact',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'personal_documents',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'department_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'position_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'manager_id',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'employment_type',
                        type: 'enum',
                        enum: ['full_time', 'part_time', 'contract', 'intern', 'consultant', 'temporary'],
                        default: "'full_time'"
                    },
                    {
                        name: 'employment_status',
                        type: 'enum',
                        enum: ['active', 'inactive', 'terminated', 'resigned', 'retired', 'on_leave'],
                        default: "'active'"
                    },
                    {
                        name: 'hire_date',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'probation_end_date',
                        type: 'date',
                        isNullable: true
                    },
                    {
                        name: 'termination_date',
                        type: 'date',
                        isNullable: true
                    },
                    {
                        name: 'work_location',
                        type: 'enum',
                        enum: ['office', 'remote', 'hybrid'],
                        default: "'office'"
                    },
                    {
                        name: 'salary_grade',
                        type: 'varchar',
                        length: '10',
                        isNullable: true
                    },
                    {
                        name: 'current_salary',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'skills',
                        type: 'jsonb',
                        default: "'[]'"
                    },
                    {
                        name: 'certifications',
                        type: 'jsonb',
                        default: "'[]'"
                    },
                    {
                        name: 'performance_rating',
                        type: 'decimal',
                        precision: 3,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        default: true
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'created_by',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'updated_by',
                        type: 'uuid',
                        isNullable: true
                    }
                ]
            })
        );

        // Create Foreign Keys
        await queryRunner.createForeignKey(
            'departments',
            new TableForeignKey({
                columnNames: ['organization_id'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'departments',
            new TableForeignKey({
                columnNames: ['parent_id'],
                referencedTableName: 'departments',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL'
            })
        );

        await queryRunner.createForeignKey(
            'positions',
            new TableForeignKey({
                columnNames: ['organization_id'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'positions',
            new TableForeignKey({
                columnNames: ['department_id'],
                referencedTableName: 'departments',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'employees',
            new TableForeignKey({
                columnNames: ['organization_id'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'employees',
            new TableForeignKey({
                columnNames: ['department_id'],
                referencedTableName: 'departments',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT'
            })
        );

        await queryRunner.createForeignKey(
            'employees',
            new TableForeignKey({
                columnNames: ['position_id'],
                referencedTableName: 'positions',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT'
            })
        );

        await queryRunner.createForeignKey(
            'employees',
            new TableForeignKey({
                columnNames: ['manager_id'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL'
            })
        );

        await queryRunner.createForeignKey(
            'departments',
            new TableForeignKey({
                columnNames: ['head_employee_id'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL'
            })
        );

        // Create Indexes
        await queryRunner.createIndex(
            'organizations',
            new TableIndex({ name: 'IDX_organizations_code', columnNames: ['code'] })
        );

        await queryRunner.createIndex(
            'departments',
            new TableIndex({ name: 'IDX_departments_organization_id', columnNames: ['organization_id'] })
        );

        await queryRunner.createIndex(
            'departments',
            new TableIndex({ name: 'IDX_departments_parent_id', columnNames: ['parent_id'] })
        );

        await queryRunner.createIndex(
            'positions',
            new TableIndex({ name: 'IDX_positions_organization_id', columnNames: ['organization_id'] })
        );

        await queryRunner.createIndex(
            'positions',
            new TableIndex({ name: 'IDX_positions_department_id', columnNames: ['department_id'] })
        );

        await queryRunner.createIndex(
            'employees',
            new TableIndex({ name: 'IDX_employees_organization_id', columnNames: ['organization_id'] })
        );

        await queryRunner.createIndex(
            'employees',
            new TableIndex({ name: 'IDX_employees_department_id', columnNames: ['department_id'] })
        );

        await queryRunner.createIndex(
            'employees',
            new TableIndex({ name: 'IDX_employees_manager_id', columnNames: ['manager_id'] })
        );

        await queryRunner.createIndex(
            'employees',
            new TableIndex({ name: 'IDX_employees_employment_status', columnNames: ['employment_status'] })
        );

        await queryRunner.createIndex(
            'employees',
            new TableIndex({ name: 'IDX_employees_hire_date', columnNames: ['hire_date'] })
        );

        await queryRunner.createIndex(
            'employees',
            new TableIndex({ name: 'IDX_employees_email', columnNames: ['email'] })
        );

        await queryRunner.createIndex(
            'employees',
            new TableIndex({ name: 'IDX_employees_employee_number', columnNames: ['employee_number'] })
        );

        // Full text search indexes
        await queryRunner.query(`
            CREATE INDEX IDX_employees_full_text_search 
            ON employees USING gin(
                to_tsvector('english', 
                    coalesce(first_name, '') || ' ' || 
                    coalesce(last_name, '') || ' ' || 
                    coalesce(middle_name, '') || ' ' || 
                    coalesce(email, '') || ' ' || 
                    coalesce(employee_number, '')
                )
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('employees');
        await queryRunner.dropTable('positions');
        await queryRunner.dropTable('departments');
        await queryRunner.dropTable('organizations');
    }
}
