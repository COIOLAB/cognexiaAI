import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreatePayrollExitTables1707123456005 implements MigrationInterface {
    name = 'CreatePayrollExitTables1707123456005';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable UUID extension if not exists
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // =====================
        // PAYROLL TABLES
        // =====================

        // Create hr_payroll_runs table
        await queryRunner.createTable(
            new Table({
                name: 'hr_payroll_runs',
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
                        name: 'payPeriodStart',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'payPeriodEnd',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'payDate',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['draft', 'processing', 'processed', 'approved', 'paid', 'cancelled'],
                        default: "'draft'"
                    },
                    {
                        name: 'totalEmployees',
                        type: 'int',
                        isNullable: true
                    },
                    {
                        name: 'totalGrossPay',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'totalNetPay',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'totalDeductions',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'totalTaxes',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'processedDate',
                        type: 'timestamp',
                        isNullable: true
                    },
                    {
                        name: 'approvedBy',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'approvedDate',
                        type: 'timestamp',
                        isNullable: true
                    },
                    {
                        name: 'approvalNotes',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'processingRules',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'processingErrors',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'errorCount',
                        type: 'int',
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

        // Create hr_payroll_records table
        await queryRunner.createTable(
            new Table({
                name: 'hr_payroll_records',
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
                        name: 'payrollRunId',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'employeeId',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'payPeriodStart',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'payPeriodEnd',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'payDate',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'grossPay',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: 'netPay',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: 'totalDeductions',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: 'totalTaxes',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: 'baseSalary',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: 'overtimePay',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: 'bonusPay',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: 'commissionPay',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: 'hoursWorked',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: 'overtimeHours',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: 'deductions',
                        type: 'jsonb',
                        isNullable: false,
                        default: "'[]'"
                    },
                    {
                        name: 'taxDetails',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'timeEntries',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'ytdGrossPay',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: 'ytdNetPay',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: 'ytdDeductions',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: 'ytdTaxes',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: 'payslipUrl',
                        type: 'varchar',
                        length: '500',
                        isNullable: true
                    },
                    {
                        name: 'payslipGenerated',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'payslipGeneratedAt',
                        type: 'timestamp',
                        isNullable: true
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        length: '50',
                        default: "'processed'"
                    },
                    {
                        name: 'notes',
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

        // Create hr_tax_rules table
        await queryRunner.createTable(
            new Table({
                name: 'hr_tax_rules',
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
                        type: 'varchar',
                        length: '50',
                        isNullable: false
                    },
                    {
                        name: 'rate',
                        type: 'decimal',
                        precision: 5,
                        scale: 4,
                        isNullable: true
                    },
                    {
                        name: 'fixedAmount',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'minAmount',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'maxAmount',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'tiers',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'applicableTo',
                        type: 'varchar',
                        length: '100',
                        default: "'all'"
                    },
                    {
                        name: 'applicableStates',
                        type: 'text',
                        isArray: true,
                        default: "'{}'"
                    },
                    {
                        name: 'isActive',
                        type: 'boolean',
                        default: true
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

        // =====================
        // EXIT MANAGEMENT TABLES
        // =====================

        // Create hr_exit_records table
        await queryRunner.createTable(
            new Table({
                name: 'hr_exit_records',
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
                        name: 'exitType',
                        type: 'enum',
                        enum: ['voluntary', 'involuntary', 'retirement', 'contract_end', 'layoff'],
                        isNullable: false
                    },
                    {
                        name: 'exitReason',
                        type: 'text',
                        isNullable: false
                    },
                    {
                        name: 'lastWorkingDay',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'noticeDate',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'exitInterviewScheduled',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'exitInterviewCompleted',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'offboardingCompleted',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'knowledgeTransferCompleted',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['initiated', 'in_progress', 'interview_completed', 'offboarding_completed', 'completed'],
                        default: "'initiated'"
                    },
                    {
                        name: 'detailedReason',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'isEligibleForRehire',
                        type: 'boolean',
                        default: true
                    },
                    {
                        name: 'rehireNotes',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'initiatedBy',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'managerId',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'finalPayAmount',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'ptoPayoutAmount',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'finalPayProcessed',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'finalPayDate',
                        type: 'date',
                        isNullable: true
                    },
                    {
                        name: 'equipmentReturned',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'systemAccessRevoked',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'accessRevokedAt',
                        type: 'timestamp',
                        isNullable: true
                    },
                    {
                        name: 'documentsReturned',
                        type: 'text',
                        isArray: true,
                        default: "'{}'"
                    },
                    {
                        name: 'notes',
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

        // Create hr_exit_interviews table
        await queryRunner.createTable(
            new Table({
                name: 'hr_exit_interviews',
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
                        name: 'exitRecordId',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'employeeId',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'interviewDate',
                        type: 'timestamp',
                        isNullable: false
                    },
                    {
                        name: 'interviewer',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'responses',
                        type: 'jsonb',
                        isNullable: false,
                        default: "'[]'"
                    },
                    {
                        name: 'analysis',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'completed',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'additionalComments',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'interviewerNotes',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'sentimentScore',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'keyThemes',
                        type: 'text',
                        isArray: true,
                        default: "'{}'"
                    },
                    {
                        name: 'improvementSuggestions',
                        type: 'text',
                        isArray: true,
                        default: "'{}'"
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

        // Create hr_offboarding_checklists table
        await queryRunner.createTable(
            new Table({
                name: 'hr_offboarding_checklists',
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
                        name: 'exitRecordId',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'items',
                        type: 'jsonb',
                        isNullable: false,
                        default: "'[]'"
                    },
                    {
                        name: 'completedItems',
                        type: 'int',
                        default: 0
                    },
                    {
                        name: 'totalItems',
                        type: 'int',
                        default: 0
                    },
                    {
                        name: 'completionPercentage',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: 'allCompleted',
                        type: 'boolean',
                        default: false
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

        // Create hr_knowledge_transfer_plans table
        await queryRunner.createTable(
            new Table({
                name: 'hr_knowledge_transfer_plans',
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
                        name: 'exitRecordId',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'departingEmployeeId',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'successorId',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'responsibilities',
                        type: 'jsonb',
                        isNullable: false,
                        default: "'[]'"
                    },
                    {
                        name: 'projects',
                        type: 'jsonb',
                        isNullable: false,
                        default: "'[]'"
                    },
                    {
                        name: 'timeline',
                        type: 'jsonb',
                        isNullable: false,
                        default: "'[]'"
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['planned', 'in_progress', 'completed', 'delayed'],
                        default: "'planned'"
                    },
                    {
                        name: 'completionPercentage',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: 'startDate',
                        type: 'date',
                        isNullable: true
                    },
                    {
                        name: 'targetCompletionDate',
                        type: 'date',
                        isNullable: true
                    },
                    {
                        name: 'actualCompletionDate',
                        type: 'date',
                        isNullable: true
                    },
                    {
                        name: 'notes',
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

        // =====================
        // CREATE FOREIGN KEYS
        // =====================

        // Payroll Foreign Keys
        await queryRunner.createForeignKey(
            'hr_payroll_runs',
            new TableForeignKey({
                columnNames: ['organizationId'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_payroll_records',
            new TableForeignKey({
                columnNames: ['organizationId'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_payroll_records',
            new TableForeignKey({
                columnNames: ['payrollRunId'],
                referencedTableName: 'hr_payroll_runs',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_payroll_records',
            new TableForeignKey({
                columnNames: ['employeeId'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_tax_rules',
            new TableForeignKey({
                columnNames: ['organizationId'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        // Exit Management Foreign Keys
        await queryRunner.createForeignKey(
            'hr_exit_records',
            new TableForeignKey({
                columnNames: ['organizationId'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_exit_records',
            new TableForeignKey({
                columnNames: ['employeeId'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_exit_records',
            new TableForeignKey({
                columnNames: ['initiatedBy'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL'
            })
        );

        await queryRunner.createForeignKey(
            'hr_exit_records',
            new TableForeignKey({
                columnNames: ['managerId'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL'
            })
        );

        await queryRunner.createForeignKey(
            'hr_exit_interviews',
            new TableForeignKey({
                columnNames: ['organizationId'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_exit_interviews',
            new TableForeignKey({
                columnNames: ['exitRecordId'],
                referencedTableName: 'hr_exit_records',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_exit_interviews',
            new TableForeignKey({
                columnNames: ['employeeId'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_exit_interviews',
            new TableForeignKey({
                columnNames: ['interviewer'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_offboarding_checklists',
            new TableForeignKey({
                columnNames: ['organizationId'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_offboarding_checklists',
            new TableForeignKey({
                columnNames: ['exitRecordId'],
                referencedTableName: 'hr_exit_records',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_knowledge_transfer_plans',
            new TableForeignKey({
                columnNames: ['organizationId'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_knowledge_transfer_plans',
            new TableForeignKey({
                columnNames: ['exitRecordId'],
                referencedTableName: 'hr_exit_records',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_knowledge_transfer_plans',
            new TableForeignKey({
                columnNames: ['departingEmployeeId'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'hr_knowledge_transfer_plans',
            new TableForeignKey({
                columnNames: ['successorId'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        // =====================
        // CREATE INDEXES
        // =====================

        // Payroll Indexes
        await queryRunner.createIndex(
            'hr_payroll_runs',
            new TableIndex({ name: 'IDX_hr_payroll_runs_organization_status', columnNames: ['organizationId', 'status'] })
        );

        await queryRunner.createIndex(
            'hr_payroll_runs',
            new TableIndex({ name: 'IDX_hr_payroll_runs_pay_period', columnNames: ['organizationId', 'payPeriodStart', 'payPeriodEnd'] })
        );

        await queryRunner.createIndex(
            'hr_payroll_runs',
            new TableIndex({ name: 'IDX_hr_payroll_runs_pay_date', columnNames: ['organizationId', 'payDate'] })
        );

        await queryRunner.createIndex(
            'hr_payroll_runs',
            new TableIndex({ name: 'IDX_hr_payroll_runs_name', columnNames: ['name'] })
        );

        await queryRunner.createIndex(
            'hr_payroll_records',
            new TableIndex({ name: 'IDX_hr_payroll_records_payroll_run', columnNames: ['organizationId', 'payrollRunId'] })
        );

        await queryRunner.createIndex(
            'hr_payroll_records',
            new TableIndex({ name: 'IDX_hr_payroll_records_employee', columnNames: ['organizationId', 'employeeId'] })
        );

        await queryRunner.createIndex(
            'hr_payroll_records',
            new TableIndex({ name: 'IDX_hr_payroll_records_pay_period', columnNames: ['organizationId', 'payPeriodStart', 'payPeriodEnd'] })
        );

        await queryRunner.createIndex(
            'hr_tax_rules',
            new TableIndex({ name: 'IDX_hr_tax_rules_organization_active', columnNames: ['organizationId', 'isActive'] })
        );

        await queryRunner.createIndex(
            'hr_tax_rules',
            new TableIndex({ name: 'IDX_hr_tax_rules_effective_dates', columnNames: ['organizationId', 'effectiveDate', 'expiryDate'] })
        );

        await queryRunner.createIndex(
            'hr_tax_rules',
            new TableIndex({ name: 'IDX_hr_tax_rules_name', columnNames: ['name'] })
        );

        // Exit Management Indexes
        await queryRunner.createIndex(
            'hr_exit_records',
            new TableIndex({ name: 'IDX_hr_exit_records_organization_employee', columnNames: ['organizationId', 'employeeId'] })
        );

        await queryRunner.createIndex(
            'hr_exit_records',
            new TableIndex({ name: 'IDX_hr_exit_records_organization_type', columnNames: ['organizationId', 'exitType'] })
        );

        await queryRunner.createIndex(
            'hr_exit_records',
            new TableIndex({ name: 'IDX_hr_exit_records_organization_status', columnNames: ['organizationId', 'status'] })
        );

        await queryRunner.createIndex(
            'hr_exit_records',
            new TableIndex({ name: 'IDX_hr_exit_records_last_working_day', columnNames: ['organizationId', 'lastWorkingDay'] })
        );

        await queryRunner.createIndex(
            'hr_exit_interviews',
            new TableIndex({ name: 'IDX_hr_exit_interviews_exit_record', columnNames: ['organizationId', 'exitRecordId'] })
        );

        await queryRunner.createIndex(
            'hr_exit_interviews',
            new TableIndex({ name: 'IDX_hr_exit_interviews_employee', columnNames: ['organizationId', 'employeeId'] })
        );

        await queryRunner.createIndex(
            'hr_exit_interviews',
            new TableIndex({ name: 'IDX_hr_exit_interviews_interview_date', columnNames: ['organizationId', 'interviewDate'] })
        );

        await queryRunner.createIndex(
            'hr_offboarding_checklists',
            new TableIndex({ name: 'IDX_hr_offboarding_checklists_exit_record', columnNames: ['organizationId', 'exitRecordId'] })
        );

        await queryRunner.createIndex(
            'hr_offboarding_checklists',
            new TableIndex({ name: 'IDX_hr_offboarding_checklists_completed', columnNames: ['organizationId', 'allCompleted'] })
        );

        await queryRunner.createIndex(
            'hr_knowledge_transfer_plans',
            new TableIndex({ name: 'IDX_hr_knowledge_transfer_plans_exit_record', columnNames: ['organizationId', 'exitRecordId'] })
        );

        await queryRunner.createIndex(
            'hr_knowledge_transfer_plans',
            new TableIndex({ name: 'IDX_hr_knowledge_transfer_plans_departing', columnNames: ['organizationId', 'departingEmployeeId'] })
        );

        await queryRunner.createIndex(
            'hr_knowledge_transfer_plans',
            new TableIndex({ name: 'IDX_hr_knowledge_transfer_plans_successor', columnNames: ['organizationId', 'successorId'] })
        );

        await queryRunner.createIndex(
            'hr_knowledge_transfer_plans',
            new TableIndex({ name: 'IDX_hr_knowledge_transfer_plans_status', columnNames: ['organizationId', 'status'] })
        );

        // =====================
        // CREATE TRIGGERS
        // =====================

        // Create or replace the updated_at trigger function
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
            'hr_payroll_runs',
            'hr_payroll_records',
            'hr_tax_rules',
            'hr_exit_records',
            'hr_exit_interviews',
            'hr_offboarding_checklists',
            'hr_knowledge_transfer_plans'
        ];

        for (const table of tables) {
            await queryRunner.query(`
                CREATE TRIGGER update_${table}_updated_at
                    BEFORE UPDATE ON ${table}
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
            `);
        }

        // =====================
        // CREATE JSONB INDEXES
        // =====================

        // JSONB indexes for better performance on complex JSON queries
        await queryRunner.query(`
            CREATE INDEX IDX_hr_payroll_runs_processing_rules_gin 
            ON hr_payroll_runs USING gin(processingRules);
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_hr_payroll_runs_processing_errors_gin 
            ON hr_payroll_runs USING gin(processingErrors);
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_hr_payroll_records_deductions_gin 
            ON hr_payroll_records USING gin(deductions);
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_hr_payroll_records_tax_details_gin 
            ON hr_payroll_records USING gin(taxDetails);
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_hr_tax_rules_tiers_gin 
            ON hr_tax_rules USING gin(tiers);
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_hr_exit_records_equipment_returned_gin 
            ON hr_exit_records USING gin(equipmentReturned);
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_hr_exit_interviews_responses_gin 
            ON hr_exit_interviews USING gin(responses);
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_hr_exit_interviews_analysis_gin 
            ON hr_exit_interviews USING gin(analysis);
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_hr_offboarding_checklists_items_gin 
            ON hr_offboarding_checklists USING gin(items);
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_hr_knowledge_transfer_plans_responsibilities_gin 
            ON hr_knowledge_transfer_plans USING gin(responsibilities);
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_hr_knowledge_transfer_plans_projects_gin 
            ON hr_knowledge_transfer_plans USING gin(projects);
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_hr_knowledge_transfer_plans_timeline_gin 
            ON hr_knowledge_transfer_plans USING gin(timeline);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order to handle foreign key constraints
        await queryRunner.dropTable('hr_knowledge_transfer_plans');
        await queryRunner.dropTable('hr_offboarding_checklists');
        await queryRunner.dropTable('hr_exit_interviews');
        await queryRunner.dropTable('hr_exit_records');
        await queryRunner.dropTable('hr_tax_rules');
        await queryRunner.dropTable('hr_payroll_records');
        await queryRunner.dropTable('hr_payroll_runs');
    }
}
