import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateTalentAcquisitionTables1707123456003 implements MigrationInterface {
    name = 'CreateTalentAcquisitionTables1707123456003';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Job Requisitions
        await queryRunner.createTable(
            new Table({
                name: 'job_requisitions',
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
                        name: 'position_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'hiring_manager_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'requisition_number',
                        type: 'varchar',
                        length: '20',
                        isNullable: false,
                        isUnique: true
                    },
                    {
                        name: 'job_title',
                        type: 'varchar',
                        length: '255',
                        isNullable: false
                    },
                    {
                        name: 'job_description',
                        type: 'text',
                        isNullable: false
                    },
                    {
                        name: 'requirements',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'preferred_qualifications',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'employment_type',
                        type: 'enum',
                        enum: ['full_time', 'part_time', 'contract', 'intern', 'consultant', 'temporary'],
                        default: "'full_time'"
                    },
                    {
                        name: 'priority',
                        type: 'enum',
                        enum: ['low', 'medium', 'high', 'urgent'],
                        default: "'medium'"
                    },
                    {
                        name: 'number_of_positions',
                        type: 'int',
                        default: 1
                    },
                    {
                        name: 'salary_range_min',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'salary_range_max',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'budget_approved',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'expected_start_date',
                        type: 'date',
                        isNullable: true
                    },
                    {
                        name: 'application_deadline',
                        type: 'date',
                        isNullable: true
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['draft', 'pending_approval', 'approved', 'active', 'on_hold', 'cancelled', 'filled'],
                        default: "'draft'"
                    },
                    {
                        name: 'approval_workflow',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'posting_channels',
                        type: 'jsonb',
                        default: "'[]'"
                    },
                    {
                        name: 'diversity_goals',
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
                    },
                    {
                        name: 'created_by',
                        type: 'uuid',
                        isNullable: true
                    }
                ]
            })
        );

        // Candidates
        await queryRunner.createTable(
            new Table({
                name: 'candidates',
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
                        name: 'email',
                        type: 'varchar',
                        length: '255',
                        isNullable: false
                    },
                    {
                        name: 'phone',
                        type: 'varchar',
                        length: '20',
                        isNullable: true
                    },
                    {
                        name: 'linkedin_profile',
                        type: 'varchar',
                        length: '500',
                        isNullable: true
                    },
                    {
                        name: 'portfolio_url',
                        type: 'varchar',
                        length: '500',
                        isNullable: true
                    },
                    {
                        name: 'current_location',
                        type: 'jsonb',
                        isNullable: true
                    },
                    {
                        name: 'willing_to_relocate',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'preferred_locations',
                        type: 'jsonb',
                        default: "'[]'"
                    },
                    {
                        name: 'current_company',
                        type: 'varchar',
                        length: '255',
                        isNullable: true
                    },
                    {
                        name: 'current_position',
                        type: 'varchar',
                        length: '255',
                        isNullable: true
                    },
                    {
                        name: 'total_experience_years',
                        type: 'decimal',
                        precision: 4,
                        scale: 1,
                        isNullable: true
                    },
                    {
                        name: 'relevant_experience_years',
                        type: 'decimal',
                        precision: 4,
                        scale: 1,
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
                        name: 'expected_salary',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'notice_period_days',
                        type: 'int',
                        isNullable: true
                    },
                    {
                        name: 'skills',
                        type: 'jsonb',
                        default: "'[]'"
                    },
                    {
                        name: 'education',
                        type: 'jsonb',
                        default: "'[]'"
                    },
                    {
                        name: 'work_experience',
                        type: 'jsonb',
                        default: "'[]'"
                    },
                    {
                        name: 'certifications',
                        type: 'jsonb',
                        default: "'[]'"
                    },
                    {
                        name: 'resume_file_path',
                        type: 'varchar',
                        length: '500',
                        isNullable: true
                    },
                    {
                        name: 'resume_parsed_data',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'source',
                        type: 'enum',
                        enum: ['job_board', 'company_website', 'referral', 'linkedin', 'agency', 'campus', 'walk_in', 'other'],
                        default: "'job_board'"
                    },
                    {
                        name: 'source_details',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'ai_match_score',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'ai_insights',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'tags',
                        type: 'jsonb',
                        default: "'[]'"
                    },
                    {
                        name: 'privacy_consent',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'marketing_consent',
                        type: 'boolean',
                        default: false
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

        // Job Applications
        await queryRunner.createTable(
            new Table({
                name: 'job_applications',
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
                        name: 'candidate_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'job_requisition_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'application_number',
                        type: 'varchar',
                        length: '20',
                        isNullable: false,
                        isUnique: true
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['applied', 'screening', 'interview', 'assessment', 'reference_check', 'offer', 'hired', 'rejected', 'withdrawn'],
                        default: "'applied'"
                    },
                    {
                        name: 'stage',
                        type: 'varchar',
                        length: '100',
                        isNullable: true
                    },
                    {
                        name: 'applied_date',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'last_activity_date',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
                    },
                    {
                        name: 'cover_letter',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'questionnaire_responses',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'screening_score',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'overall_rating',
                        type: 'decimal',
                        precision: 3,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'interviewer_feedback',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'rejection_reason',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'rejection_feedback',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'ai_screening_results',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'assessment_results',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'reference_check_status',
                        type: 'enum',
                        enum: ['not_started', 'in_progress', 'completed', 'positive', 'negative'],
                        isNullable: true
                    },
                    {
                        name: 'reference_check_results',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'assigned_recruiter_id',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'priority',
                        type: 'enum',
                        enum: ['low', 'medium', 'high'],
                        default: "'medium'"
                    },
                    {
                        name: 'notes',
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

        // Interview Schedules
        await queryRunner.createTable(
            new Table({
                name: 'interview_schedules',
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
                        name: 'application_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'interview_round',
                        type: 'int',
                        default: 1
                    },
                    {
                        name: 'interview_type',
                        type: 'enum',
                        enum: ['phone', 'video', 'in_person', 'technical', 'hr', 'panel', 'behavioral', 'case_study'],
                        default: "'video'"
                    },
                    {
                        name: 'scheduled_date',
                        type: 'timestamp',
                        isNullable: false
                    },
                    {
                        name: 'duration_minutes',
                        type: 'int',
                        default: 60
                    },
                    {
                        name: 'location',
                        type: 'varchar',
                        length: '255',
                        isNullable: true
                    },
                    {
                        name: 'meeting_link',
                        type: 'varchar',
                        length: '500',
                        isNullable: true
                    },
                    {
                        name: 'meeting_details',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'interviewers',
                        type: 'jsonb',
                        default: "'[]'"
                    },
                    {
                        name: 'interview_panel_lead',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_show'],
                        default: "'scheduled'"
                    },
                    {
                        name: 'candidate_confirmed',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'reminder_sent',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'interview_questions',
                        type: 'jsonb',
                        default: "'[]'"
                    },
                    {
                        name: 'feedback_template',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'actual_start_time',
                        type: 'timestamp',
                        isNullable: true
                    },
                    {
                        name: 'actual_end_time',
                        type: 'timestamp',
                        isNullable: true
                    },
                    {
                        name: 'notes',
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
                    },
                    {
                        name: 'created_by',
                        type: 'uuid',
                        isNullable: true
                    }
                ]
            })
        );

        // Interview Feedback
        await queryRunner.createTable(
            new Table({
                name: 'interview_feedback',
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
                        name: 'interview_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'interviewer_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'overall_rating',
                        type: 'decimal',
                        precision: 3,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: 'technical_skills_rating',
                        type: 'decimal',
                        precision: 3,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'communication_rating',
                        type: 'decimal',
                        precision: 3,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'cultural_fit_rating',
                        type: 'decimal',
                        precision: 3,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'problem_solving_rating',
                        type: 'decimal',
                        precision: 3,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'detailed_ratings',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'strengths',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'weaknesses',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'detailed_feedback',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'questions_asked',
                        type: 'jsonb',
                        default: "'[]'"
                    },
                    {
                        name: 'candidate_questions',
                        type: 'jsonb',
                        default: "'[]'"
                    },
                    {
                        name: 'recommendation',
                        type: 'enum',
                        enum: ['strong_hire', 'hire', 'no_hire', 'strong_no_hire'],
                        isNullable: false
                    },
                    {
                        name: 'next_round_recommendation',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'concerns',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'additional_notes',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'ai_sentiment_analysis',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'submitted_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
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

        // Job Offers
        await queryRunner.createTable(
            new Table({
                name: 'job_offers',
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
                        name: 'application_id',
                        type: 'uuid',
                        isNullable: false
                    },
                    {
                        name: 'offer_number',
                        type: 'varchar',
                        length: '20',
                        isNullable: false,
                        isUnique: true
                    },
                    {
                        name: 'job_title',
                        type: 'varchar',
                        length: '255',
                        isNullable: false
                    },
                    {
                        name: 'department',
                        type: 'varchar',
                        length: '100',
                        isNullable: false
                    },
                    {
                        name: 'reporting_manager_id',
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
                        name: 'salary_amount',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        isNullable: false
                    },
                    {
                        name: 'salary_currency',
                        type: 'varchar',
                        length: '3',
                        default: "'INR'"
                    },
                    {
                        name: 'salary_frequency',
                        type: 'enum',
                        enum: ['annually', 'monthly', 'hourly'],
                        default: "'annually'"
                    },
                    {
                        name: 'bonus_details',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'benefits_package',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'start_date',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'probation_period_months',
                        type: 'int',
                        isNullable: true
                    },
                    {
                        name: 'work_location',
                        type: 'enum',
                        enum: ['office', 'remote', 'hybrid'],
                        default: "'office'"
                    },
                    {
                        name: 'relocation_assistance',
                        type: 'boolean',
                        default: false
                    },
                    {
                        name: 'relocation_budget',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: true
                    },
                    {
                        name: 'offer_valid_until',
                        type: 'date',
                        isNullable: false
                    },
                    {
                        name: 'terms_and_conditions',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'additional_notes',
                        type: 'text',
                        isNullable: true
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['draft', 'pending_approval', 'sent', 'negotiation', 'accepted', 'rejected', 'expired', 'withdrawn'],
                        default: "'draft'"
                    },
                    {
                        name: 'sent_date',
                        type: 'timestamp',
                        isNullable: true
                    },
                    {
                        name: 'response_date',
                        type: 'timestamp',
                        isNullable: true
                    },
                    {
                        name: 'negotiation_history',
                        type: 'jsonb',
                        default: "'[]'"
                    },
                    {
                        name: 'approval_workflow',
                        type: 'jsonb',
                        default: "'{}'"
                    },
                    {
                        name: 'offer_letter_path',
                        type: 'varchar',
                        length: '500',
                        isNullable: true
                    },
                    {
                        name: 'e_signature_status',
                        type: 'enum',
                        enum: ['not_required', 'pending', 'signed', 'expired'],
                        default: "'not_required'"
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
                    }
                ]
            })
        );

        // Create Foreign Keys
        await queryRunner.createForeignKey(
            'job_requisitions',
            new TableForeignKey({
                columnNames: ['organization_id'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'job_requisitions',
            new TableForeignKey({
                columnNames: ['department_id'],
                referencedTableName: 'departments',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT'
            })
        );

        await queryRunner.createForeignKey(
            'job_requisitions',
            new TableForeignKey({
                columnNames: ['position_id'],
                referencedTableName: 'positions',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT'
            })
        );

        await queryRunner.createForeignKey(
            'job_requisitions',
            new TableForeignKey({
                columnNames: ['hiring_manager_id'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT'
            })
        );

        await queryRunner.createForeignKey(
            'job_requisitions',
            new TableForeignKey({
                columnNames: ['created_by'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL'
            })
        );

        await queryRunner.createForeignKey(
            'candidates',
            new TableForeignKey({
                columnNames: ['organization_id'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'job_applications',
            new TableForeignKey({
                columnNames: ['organization_id'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'job_applications',
            new TableForeignKey({
                columnNames: ['candidate_id'],
                referencedTableName: 'candidates',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'job_applications',
            new TableForeignKey({
                columnNames: ['job_requisition_id'],
                referencedTableName: 'job_requisitions',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'job_applications',
            new TableForeignKey({
                columnNames: ['assigned_recruiter_id'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL'
            })
        );

        await queryRunner.createForeignKey(
            'interview_schedules',
            new TableForeignKey({
                columnNames: ['organization_id'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'interview_schedules',
            new TableForeignKey({
                columnNames: ['application_id'],
                referencedTableName: 'job_applications',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'interview_schedules',
            new TableForeignKey({
                columnNames: ['interview_panel_lead'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL'
            })
        );

        await queryRunner.createForeignKey(
            'interview_schedules',
            new TableForeignKey({
                columnNames: ['created_by'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL'
            })
        );

        await queryRunner.createForeignKey(
            'interview_feedback',
            new TableForeignKey({
                columnNames: ['organization_id'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'interview_feedback',
            new TableForeignKey({
                columnNames: ['interview_id'],
                referencedTableName: 'interview_schedules',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'interview_feedback',
            new TableForeignKey({
                columnNames: ['interviewer_id'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT'
            })
        );

        await queryRunner.createForeignKey(
            'job_offers',
            new TableForeignKey({
                columnNames: ['organization_id'],
                referencedTableName: 'organizations',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'job_offers',
            new TableForeignKey({
                columnNames: ['application_id'],
                referencedTableName: 'job_applications',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE'
            })
        );

        await queryRunner.createForeignKey(
            'job_offers',
            new TableForeignKey({
                columnNames: ['reporting_manager_id'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL'
            })
        );

        await queryRunner.createForeignKey(
            'job_offers',
            new TableForeignKey({
                columnNames: ['created_by'],
                referencedTableName: 'employees',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL'
            })
        );

        // Create Indexes
        await queryRunner.createIndex(
            'job_requisitions',
            new TableIndex({ name: 'IDX_job_requisitions_organization_id', columnNames: ['organization_id'] })
        );

        await queryRunner.createIndex(
            'job_requisitions',
            new TableIndex({ name: 'IDX_job_requisitions_status', columnNames: ['status'] })
        );

        await queryRunner.createIndex(
            'job_requisitions',
            new TableIndex({ name: 'IDX_job_requisitions_hiring_manager_id', columnNames: ['hiring_manager_id'] })
        );

        await queryRunner.createIndex(
            'candidates',
            new TableIndex({ name: 'IDX_candidates_organization_id', columnNames: ['organization_id'] })
        );

        await queryRunner.createIndex(
            'candidates',
            new TableIndex({ name: 'IDX_candidates_email', columnNames: ['email'] })
        );

        await queryRunner.createIndex(
            'candidates',
            new TableIndex({ name: 'IDX_candidates_phone', columnNames: ['phone'] })
        );

        await queryRunner.createIndex(
            'job_applications',
            new TableIndex({ name: 'IDX_job_applications_candidate_id', columnNames: ['candidate_id'] })
        );

        await queryRunner.createIndex(
            'job_applications',
            new TableIndex({ name: 'IDX_job_applications_job_requisition_id', columnNames: ['job_requisition_id'] })
        );

        await queryRunner.createIndex(
            'job_applications',
            new TableIndex({ name: 'IDX_job_applications_status', columnNames: ['status'] })
        );

        await queryRunner.createIndex(
            'job_applications',
            new TableIndex({ name: 'IDX_job_applications_assigned_recruiter_id', columnNames: ['assigned_recruiter_id'] })
        );

        await queryRunner.createIndex(
            'interview_schedules',
            new TableIndex({ name: 'IDX_interview_schedules_application_id', columnNames: ['application_id'] })
        );

        await queryRunner.createIndex(
            'interview_schedules',
            new TableIndex({ name: 'IDX_interview_schedules_scheduled_date', columnNames: ['scheduled_date'] })
        );

        await queryRunner.createIndex(
            'interview_schedules',
            new TableIndex({ name: 'IDX_interview_schedules_status', columnNames: ['status'] })
        );

        await queryRunner.createIndex(
            'interview_feedback',
            new TableIndex({ name: 'IDX_interview_feedback_interview_id', columnNames: ['interview_id'] })
        );

        await queryRunner.createIndex(
            'interview_feedback',
            new TableIndex({ name: 'IDX_interview_feedback_interviewer_id', columnNames: ['interviewer_id'] })
        );

        await queryRunner.createIndex(
            'job_offers',
            new TableIndex({ name: 'IDX_job_offers_application_id', columnNames: ['application_id'] })
        );

        await queryRunner.createIndex(
            'job_offers',
            new TableIndex({ name: 'IDX_job_offers_status', columnNames: ['status'] })
        );

        // Full text search indexes
        await queryRunner.query(`
            CREATE INDEX IDX_candidates_full_text_search 
            ON candidates USING gin(
                to_tsvector('english', 
                    coalesce(first_name, '') || ' ' || 
                    coalesce(last_name, '') || ' ' || 
                    coalesce(email, '') || ' ' || 
                    coalesce(current_company, '') || ' ' || 
                    coalesce(current_position, '')
                )
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_job_requisitions_full_text_search 
            ON job_requisitions USING gin(
                to_tsvector('english', 
                    coalesce(job_title, '') || ' ' || 
                    coalesce(job_description, '') || ' ' || 
                    coalesce(requisition_number, '')
                )
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('job_offers');
        await queryRunner.dropTable('interview_feedback');
        await queryRunner.dropTable('interview_schedules');
        await queryRunner.dropTable('job_applications');
        await queryRunner.dropTable('candidates');
        await queryRunner.dropTable('job_requisitions');
    }
}
