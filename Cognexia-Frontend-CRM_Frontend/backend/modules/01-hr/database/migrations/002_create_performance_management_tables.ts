import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreatePerformanceManagementTables1707123456002 implements MigrationInterface {
    name = 'CreatePerformanceManagementTables1707123456002';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Performance Cycles
        await queryRunner.createTable(
            new Table({
                name: 'performance_cycles',
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
                        name: 'name',
                        type: 'varchar',
                        length: '255',
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
                        enum: ['annual', 'semi_annual', 'quarterly', 'monthly', 'project_based'],
                        default: "'annual'"
                    },
                    {
                        name: 'start_date',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'end_date',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['draft', 'active', 'completed', 'archived'],
                        default: "'draft'"
                    },
                    {
                        name: 'settings',
                        type: 'jsonb',
                        default: "'{}'"
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

        // Performance Goals
        await queryRunner.createTable(
            new Table({
                name: 'performance_goals',
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
                        name: 'employee_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'cycle_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'parent_goal_id',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        length: '255',
                        isNullable: false
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'category',
                        type: 'enum',
                        enum: ['business', 'personal', 'skill_development', 'behavioral', 'project', 'kpi'],
                        default: "'business'"
                    },
                    {
                        name: 'priority',
                        type: 'enum',
                        enum: ['low', 'medium', 'high', 'critical'],
                        default: "'medium'"
                    },
                    {
                        name: 'weight_percentage',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: 'target_value',
                        type: 'decimal',
                        precision: 15,
                        scale: 4,
                        isNullable: true
                    },
                    {
                        name: 'current_value',
                        type: 'decimal',
                        precision: 15,
                        scale: 4,
                        default: 0
                    },
                    {
                        name: 'unit_of_measure',
                        type: 'varchar',
                        length: '50',
                        isNullable: true
                    },
                    {
                        name: 'due_date',
                        type: 'date',
                        isNullable: true
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['draft', 'active', 'completed', 'cancelled', 'overdue'],
                        default: "'draft'"
                    },
                    {
                        name: 'progress_percentage',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: 'manager_approval_status',
                        type: 'enum',
                        enum: ['pending', 'approved', 'rejected', 'revision_required'],
                        default: "'pending'"
                    },
                    {
                        name: 'manager_comments',
                        type: 'text',
                        isNullable: true
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

        // Performance Reviews
        await queryRunner.createTable(
            new Table({
                name: 'performance_reviews',
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
                        name: 'employee_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'reviewer_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'cycle_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: ['self', 'manager', 'peer', '360_degree', 'upward'],
                        default: "'manager'"
                    },
                    {
                        name: 'review_period_start',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'review_period_end',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'overall_rating',
                        type: 'decimal',
                        precision: 3,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'competency_ratings',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'goal_achievements',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'strengths',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'areas_for_improvement',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'development_recommendations',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'employee_comments',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'manager_comments',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['draft', 'submitted', 'manager_review', 'finalized', 'acknowledged'],
                        default: "'draft'"
                    },
                    {
                        name: 'submitted_at',
                        type: 'timestamp',
                        isNullable: true
                    },
                    {
                        name: 'finalized_at',
                        type: 'timestamp',
                        isNullable: true
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

        // Performance Feedback
        await queryRunner.createTable(
            new Table({
                name: 'performance_feedback',
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
                        name: 'employee_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'feedback_giver_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'cycle_id',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: ['continuous', 'project_based', 'milestone', 'incident', 'recognition'],
                        default: "'continuous'"
                    },
                    {
                        name: 'category',
                        type: 'enum',
                        enum: ['positive', 'constructive', 'development', 'recognition', 'concern'],
                        default: "'constructive'"
                    },
                    {
                        name: 'subject',
                        type: 'varchar',
                        length: '255',
                        isNullable: false
                    },
                    {
                        name: 'content',
                        type: 'text',
                        isNullable: false
                    },
                    {
                        name: 'competencies_mentioned',
                        type: 'jsonb',
                        default: "'[]'"
                    },
                    {
                        name: 'sentiment_score',
                        type: 'decimal',
                        precision: 3,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'is_anonymous',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'visibility',
                        type: 'enum',
                        enum: ['private', 'manager_only', 'employee_visible', 'team_visible'],
                        default: "'employee_visible'"
                    },
                    {
                        name: 'acknowledgment_required',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'acknowledged_at',
                        type: 'timestamp',
                        isNullable: true
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

        // Performance KPIs
        await queryRunner.createTable(
            new Table({
                name: 'performance_kpis',
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
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'category',
                        type: 'varchar',
                        length: '100',
                        isNullable: false
                    },
                    {
                        name: 'unit_of_measure',
                        type: 'varchar',
                        length: '50',
                        isNullable: false
                    },
                    {
                        name: 'calculation_method',
                        type: 'enum',
                        enum: ['manual', 'automatic', 'formula_based', 'system_generated'],
                        default: "'manual'"
                    },
                    {
                        name: 'calculation_formula',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'frequency',
                        type: 'enum',
                        enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annual'],
                        default: "'monthly'"
                    },
                    {
                        name: 'target_type',
                        type: 'enum',
                        enum: ['minimum', 'maximum', 'range', 'exact'],
                        default: "'minimum'"
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        default: true
                    },
                    {
                        name: 'applicable_positions',
                        type: 'jsonb',
                        default: "'[]'"
                    },
                    {
                        name: 'applicable_departments',
                        type: 'jsonb',
                        default: "'[]'"
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

        // Performance KPI Values
        await queryRunner.createTable(
            new Table({
                name: 'performance_kpi_values',
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
                        name: 'kpi_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'employee_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'period_start',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'period_end',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'target_value',
                        type: 'decimal',
                        precision: 15,
                        scale: 4,
                        isNullable: true
                    },
                    {
                        name: 'actual_value',
                        type: 'decimal',
                        precision: 15,
                        scale: 4,
                        isNullable: true
                    },
                    {
                        name: 'achievement_percentage',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'trend',
                        type: 'enum',
                        enum: ['improving', 'stable', 'declining', 'volatile'],
                        isNullable: true
                    },
                    {
                        name: 'notes',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'data_source',
                        type: 'varchar',
                        length: '100',
                        isNullable: true
                    },
                    {
                        name: 'verified_by',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'verified_at',
                        type: 'timestamp',
                        isNullable: true
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

        // Create Foreign Keys
        await queryRunner.createForeignKey(
            'performance_cycles',
            new TableForeignKey({
                columnNames: ['organization_id'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'performance_goals',
            new TableForeignKey({
                columnNames: ['organization_id'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'performance_goals',
            new TableForeignKey({
                columnNames: ['employee_id'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'performance_goals',
            new TableForeignKey({
                columnNames: ['cycle_id'],
                referencedTableName: 'performance_cycles',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'performance_goals',
            new TableForeignKey({
                columnNames: ['parent_goal_id'],
                referencedTableName: 'performance_goals',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL'
            })
        );

        await queryRunner.createForeignKey(
            'performance_reviews',
            new TableForeignKey({
                columnNames: ['organization_id'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'performance_reviews',
            new TableForeignKey({
                columnNames: ['employee_id'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'performance_reviews',
            new TableForeignKey({
                columnNames: ['reviewer_id'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT'
            })
        );

        await queryRunner.createForeignKey(
            'performance_reviews',
            new TableForeignKey({
                columnNames: ['cycle_id'],
                referencedTableName: 'performance_cycles',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'performance_feedback',
            new TableForeignKey({
                columnNames: ['organization_id'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'performance_feedback',
            new TableForeignKey({
                columnNames: ['employee_id'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'performance_feedback',
            new TableForeignKey({
                columnNames: ['feedback_giver_id'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT'
            })
        );

        await queryRunner.createForeignKey(
            'performance_feedback',
            new TableForeignKey({
                columnNames: ['cycle_id'],
                referencedTableName: 'performance_cycles',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL'
            })
        );

        await queryRunner.createForeignKey(
            'performance_kpis',
            new TableForeignKey({
                columnNames: ['organization_id'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'performance_kpi_values',
            new TableForeignKey({
                columnNames: ['organization_id'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'performance_kpi_values',
            new TableForeignKey({
                columnNames: ['kpi_id'],
                referencedTableName: 'performance_kpis',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'performance_kpi_values',
            new TableForeignKey({
                columnNames: ['employee_id'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'performance_kpi_values',
            new TableForeignKey({
                columnNames: ['verified_by'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL'
            })
        );

        // Create Indexes
        await queryRunner.createIndex(
            'performance_cycles',
            new TableIndex({ name: 'IDX_performance_cycles_organization_id', columnNames: ['organization_id'] })
        );

        await queryRunner.createIndex(
            'performance_cycles',
            new TableIndex({ name: 'IDX_performance_cycles_status', columnNames: ['status'] })
        );

        await queryRunner.createIndex(
            'performance_goals',
            new TableIndex({ name: 'IDX_performance_goals_employee_id', columnNames: ['employee_id'] })
        );

        await queryRunner.createIndex(
            'performance_goals',
            new TableIndex({ name: 'IDX_performance_goals_cycle_id', columnNames: ['cycle_id'] })
        );

        await queryRunner.createIndex(
            'performance_goals',
            new TableIndex({ name: 'IDX_performance_goals_status', columnNames: ['status'] })
        );

        await queryRunner.createIndex(
            'performance_reviews',
            new TableIndex({ name: 'IDX_performance_reviews_employee_id', columnNames: ['employee_id'] })
        );

        await queryRunner.createIndex(
            'performance_reviews',
            new TableIndex({ name: 'IDX_performance_reviews_cycle_id', columnNames: ['cycle_id'] })
        );

        await queryRunner.createIndex(
            'performance_reviews',
            new TableIndex({ name: 'IDX_performance_reviews_status', columnNames: ['status'] })
        );

        await queryRunner.createIndex(
            'performance_feedback',
            new TableIndex({ name: 'IDX_performance_feedback_employee_id', columnNames: ['employee_id'] })
        );

        await queryRunner.createIndex(
            'performance_feedback',
            new TableIndex({ name: 'IDX_performance_feedback_feedback_giver_id', columnNames: ['feedback_giver_id'] })
        );

        await queryRunner.createIndex(
            'performance_kpi_values',
            new TableIndex({ name: 'IDX_performance_kpi_values_employee_id', columnNames: ['employee_id'] })
        );

        await queryRunner.createIndex(
            'performance_kpi_values',
            new TableIndex({ name: 'IDX_performance_kpi_values_kpi_id', columnNames: ['kpi_id'] })
        );

        await queryRunner.createIndex(
            'performance_kpi_values',
            new TableIndex({ name: 'IDX_performance_kpi_values_period', columnNames: ['period_start', 'period_end'] })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('performance_kpi_values');
        await queryRunner.dropTable('performance_kpis');
        await queryRunner.dropTable('performance_feedback');
        await queryRunner.dropTable('performance_reviews');
        await queryRunner.dropTable('performance_goals');
        await queryRunner.dropTable('performance_cycles');
    }
}
