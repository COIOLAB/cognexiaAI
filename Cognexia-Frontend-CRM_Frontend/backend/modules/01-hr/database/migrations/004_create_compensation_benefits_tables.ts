import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateCompensationBenefitsTables1707123456004 implements MigrationInterface {
    name = 'CreateCompensationBenefitsTables1707123456004';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable UUID extension if not exists
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Create hr_compensation_plans table
        await queryRunner.createTable(
            new Table({
                name: 'hr_compensation_plans',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()'
                    },
                    {
                        name: 'organizationId',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '200',
                        isNullable: false
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: ['salary', 'hourly', 'commission', 'contract', 'equity', 'bonus'],
                        isNullable: false
                    },
                    {
                        name: 'baseSalary',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'currency',
                        type: 'varchar',
                        length: '3',
                        default: "'USD'"
                    },
                    {
                        name: 'components',
                        type: 'jsonb',
                        isNullable: false,
                        default: "'[]'"
                    },
                    {
                        name: 'effectiveDate',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'expiryDate',
                        type: 'date',
                        isNullable: true
                    },
                    {
                        name: 'isActive',
                        type: 'boolean',
                        default: true
                    },
                    {
                        name: 'eligibilityCriteria',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'approvedBy',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'approvalDate',
                        type: 'timestamp',
                        isNullable: true
                    },
                    {
                        name: 'approvalComments',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'totalEmployees',
                        type: 'int',
                        default: 0
                    },
                    {
                        name: 'totalCost',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: 'budgetAllocated',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'createdBy',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'updatedBy',
                        type: 'uuid',
                        isNullable: true
                    }
                ]
            })
        );

        // Create hr_salary_structures table
        await queryRunner.createTable(
            new Table({
                name: 'hr_salary_structures',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()'
                    },
                    {
                        name: 'organizationId',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'gradeLevel',
                        type: 'int',
                        isNullable: false
                    },
                    {
                        name: 'gradeName',
                        type: 'varchar',
                        length: '100',
                        isNullable: false
                    },
                    {
                        name: 'minSalary',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: 'midSalary',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'maxSalary',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: 'currency',
                        type: 'varchar',
                        length: '3',
                        default: "'USD'"
                    },
                    {
                        name: 'effectiveDate',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'expiryDate',
                        type: 'date',
                        isNullable: true
                    },
                    {
                        name: 'stepIncrement',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'benefits',
                        type: 'text',
                        isArray: true,
                        default: "'{}'",
                        isNullable: false
                    },
                    {
                        name: 'jobTitles',
                        type: 'text',
                        isArray: true,
                        default: "'{}'",
                        isNullable: false
                    },
                    {
                        name: 'progressionRules',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'marketMin',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'marketMedian',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'marketMax',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'marketDataDate',
                        type: 'date',
                        isNullable: true
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'createdBy',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'updatedBy',
                        type: 'uuid',
                        isNullable: true
                    }
                ]
            })
        );

        // Create hr_benefits_plans table
        await queryRunner.createTable(
            new Table({
                name: 'hr_benefits_plans',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()'
                    },
                    {
                        name: 'organizationId',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '200',
                        isNullable: false
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: ['health_insurance', 'dental_insurance', 'vision_insurance', 'life_insurance', 'disability_insurance', 'retirement', 'paid_time_off', 'flexible_spending', 'wellness', 'transportation', 'education', 'other'],
                        isNullable: false
                    },
                    {
                        name: 'provider',
                        type: 'varchar',
                        length: '200',
                        isNullable: true
                    },
                    {
                        name: 'cost',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: 'employerContribution',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: 'employeeContribution',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: 'currency',
                        type: 'varchar',
                        length: '3',
                        default: "'USD'"
                    },
                    {
                        name: 'effectiveDate',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'expiryDate',
                        type: 'date',
                        isNullable: true
                    },
                    {
                        name: 'isActive',
                        type: 'boolean',
                        default: true
                    },
                    {
                        name: 'eligibilityCriteria',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'benefitDetails',
                        type: 'jsonb',
                        isNullable: false,
                        default: "'[]'"
                    },
                    {
                        name: 'enrollmentPeriod',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'planOptions',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'vendorInfo',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'totalEnrollments',
                        type: 'int',
                        default: 0
                    },
                    {
                        name: 'totalEmployerCost',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: 'totalEmployeeCost',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: 'utilizationRate',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'createdBy',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'updatedBy',
                        type: 'uuid',
                        isNullable: true
                    }
                ]
            })
        );

        // Create hr_benefits_enrollments table
        await queryRunner.createTable(
            new Table({
                name: 'hr_benefits_enrollments',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()'
                    },
                    {
                        name: 'organizationId',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'employeeId',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'planId',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'enrollmentDate',
                        type: 'timestamp',
                        isNullable: false
                    },
                    {
                        name: 'effectiveDate',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'terminationDate',
                        type: 'date',
                        isNullable: true
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['active', 'pending', 'terminated', 'suspended', 'declined'],
                        default: "'active'"
                    },
                    {
                        name: 'employeeContribution',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: 'employerContribution',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: 'selectedOption',
                        type: 'varchar',
                        length: '100',
                        isNullable: true
                    },
                    {
                        name: 'dependents',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'elections',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'enrollmentAnswers',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'changeHistory',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'requiresEvidenceOfInsurability',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'evidenceStatus',
                        type: 'varchar',
                        length: '50',
                        isNullable: true
                    },
                    {
                        name: 'evidenceSubmissionDate',
                        type: 'date',
                        isNullable: true
                    },
                    {
                        name: 'evidenceNotes',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'createdBy',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'updatedBy',
                        type: 'uuid',
                        isNullable: true
                    }
                ]
            })
        );

        // Create hr_employee_compensation table
        await queryRunner.createTable(
            new Table({
                name: 'hr_employee_compensation',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()'
                    },
                    {
                        name: 'organizationId',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'employeeId',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'planId',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'effectiveDate',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'endDate',
                        type: 'date',
                        isNullable: true
                    },
                    {
                        name: 'baseSalary',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: 'componentValues',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'totalCompensation',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'reason',
                        type: 'varchar',
                        length: '100',
                        isNullable: true
                    },
                    {
                        name: 'notes',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'isActive',
                        type: 'boolean',
                        default: true
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'createdBy',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'updatedBy',
                        type: 'uuid',
                        isNullable: true
                    }
                ]
            })
        );

        // Create Foreign Keys
        await queryRunner.createForeignKey(
            'hr_compensation_plans',
            new TableForeignKey({
                columnNames: ['organizationId'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_salary_structures',
            new TableForeignKey({
                columnNames: ['organizationId'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_benefits_plans',
            new TableForeignKey({
                columnNames: ['organizationId'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_benefits_enrollments',
            new TableForeignKey({
                columnNames: ['organizationId'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_benefits_enrollments',
            new TableForeignKey({
                columnNames: ['employeeId'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_benefits_enrollments',
            new TableForeignKey({
                columnNames: ['planId'],
                referencedTableName: 'hr_benefits_plans',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_employee_compensation',
            new TableForeignKey({
                columnNames: ['organizationId'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_employee_compensation',
            new TableForeignKey({
                columnNames: ['employeeId'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_employee_compensation',
            new TableForeignKey({
                columnNames: ['planId'],
                referencedTableName: 'hr_compensation_plans',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        // Create Indexes for hr_compensation_plans
        await queryRunner.createIndex(
            'hr_compensation_plans',
            new TableIndex({ name: 'IDX_hr_compensation_plans_organization_active', columnNames: ['organizationId', 'isActive'] })
        );

        await queryRunner.createIndex(
            'hr_compensation_plans',
            new TableIndex({ name: 'IDX_hr_compensation_plans_organization_type', columnNames: ['organizationId', 'type'] })
        );

        await queryRunner.createIndex(
            'hr_compensation_plans',
            new TableIndex({ name: 'IDX_hr_compensation_plans_organization_dates', columnNames: ['organizationId', 'effectiveDate', 'expiryDate'] })
        );

        await queryRunner.createIndex(
            'hr_compensation_plans',
            new TableIndex({ name: 'IDX_hr_compensation_plans_name', columnNames: ['name'] })
        );

        // Create Indexes for hr_salary_structures
        await queryRunner.createIndex(
            'hr_salary_structures',
            new TableIndex({ name: 'IDX_hr_salary_structures_organization_grade_level', columnNames: ['organizationId', 'gradeLevel'], isUnique: true })
        );

        await queryRunner.createIndex(
            'hr_salary_structures',
            new TableIndex({ name: 'IDX_hr_salary_structures_organization_grade_name', columnNames: ['organizationId', 'gradeName'], isUnique: true })
        );

        await queryRunner.createIndex(
            'hr_salary_structures',
            new TableIndex({ name: 'IDX_hr_salary_structures_organization_dates', columnNames: ['organizationId', 'effectiveDate', 'expiryDate'] })
        );

        // Create Indexes for hr_benefits_plans
        await queryRunner.createIndex(
            'hr_benefits_plans',
            new TableIndex({ name: 'IDX_hr_benefits_plans_organization_active', columnNames: ['organizationId', 'isActive'] })
        );

        await queryRunner.createIndex(
            'hr_benefits_plans',
            new TableIndex({ name: 'IDX_hr_benefits_plans_organization_type', columnNames: ['organizationId', 'type'] })
        );

        await queryRunner.createIndex(
            'hr_benefits_plans',
            new TableIndex({ name: 'IDX_hr_benefits_plans_organization_dates', columnNames: ['organizationId', 'effectiveDate', 'expiryDate'] })
        );

        await queryRunner.createIndex(
            'hr_benefits_plans',
            new TableIndex({ name: 'IDX_hr_benefits_plans_name', columnNames: ['name'] })
        );

        // Create Indexes for hr_benefits_enrollments
        await queryRunner.createIndex(
            'hr_benefits_enrollments',
            new TableIndex({ name: 'IDX_hr_benefits_enrollments_organization_employee', columnNames: ['organizationId', 'employeeId'] })
        );

        await queryRunner.createIndex(
            'hr_benefits_enrollments',
            new TableIndex({ name: 'IDX_hr_benefits_enrollments_organization_plan', columnNames: ['organizationId', 'planId'] })
        );

        await queryRunner.createIndex(
            'hr_benefits_enrollments',
            new TableIndex({ name: 'IDX_hr_benefits_enrollments_organization_status', columnNames: ['organizationId', 'status'] })
        );

        await queryRunner.createIndex(
            'hr_benefits_enrollments',
            new TableIndex({ name: 'IDX_hr_benefits_enrollments_enrollment_date', columnNames: ['enrollmentDate'] })
        );

        // Create Indexes for hr_employee_compensation
        await queryRunner.createIndex(
            'hr_employee_compensation',
            new TableIndex({ name: 'IDX_hr_employee_compensation_organization_employee', columnNames: ['organizationId', 'employeeId'] })
        );

        await queryRunner.createIndex(
            'hr_employee_compensation',
            new TableIndex({ name: 'IDX_hr_employee_compensation_organization_plan', columnNames: ['organizationId', 'planId'] })
        );

        await queryRunner.createIndex(
            'hr_employee_compensation',
            new TableIndex({ name: 'IDX_hr_employee_compensation_effective_date', columnNames: ['effectiveDate'] })
        );

        // Create updated_at trigger function if it doesn't exist
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updatedAt = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);

        // Create triggers for updated_at columns
        const tables = [
            'hr_compensation_plans',
            'hr_salary_structures',
            'hr_benefits_plans',
            'hr_benefits_enrollments',
            'hr_employee_compensation'
        ];

        for (const table of tables) {
            await queryRunner.query(`
                CREATE TRIGGER update_${table}_updated_at
                    BEFORE UPDATE ON ${table}
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
            `);
        }

        // Create GIN indexes for JSONB fields for better performance
        await queryRunner.query(`
            CREATE INDEX IDX_hr_compensation_plans_components_gin 
            ON hr_compensation_plans USING gin(components);
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_hr_compensation_plans_eligibility_gin 
            ON hr_compensation_plans USING gin(eligibilityCriteria);
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_hr_benefits_plans_benefit_details_gin 
            ON hr_benefits_plans USING gin(benefitDetails);
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_hr_benefits_enrollments_dependents_gin 
            ON hr_benefits_enrollments USING gin(dependents);
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_hr_employee_compensation_component_values_gin 
            ON hr_employee_compensation USING gin(componentValues);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order to handle foreign key constraints
        await queryRunner.dropTable('hr_employee_compensation');
        await queryRunner.dropTable('hr_benefits_enrollments');
        await queryRunner.dropTable('hr_benefits_plans');
        await queryRunner.dropTable('hr_salary_structures');
        await queryRunner.dropTable('hr_compensation_plans');

        // Drop the trigger function
        await queryRunner.query('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;');
    }
}
