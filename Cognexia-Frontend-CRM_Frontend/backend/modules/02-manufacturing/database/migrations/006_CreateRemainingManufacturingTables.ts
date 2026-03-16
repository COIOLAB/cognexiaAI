import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateRemainingManufacturingTables1703000006 implements MigrationInterface {
  name = 'CreateRemainingManufacturingTables1703000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create routings table
    await queryRunner.createTable(
      new Table({
        name: 'routings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'routing_code',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'routing_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'active', 'inactive', 'obsolete'],
            default: "'draft'",
          },
          {
            name: 'version',
            type: 'varchar',
            length: '20',
            default: "'1.0'",
          },
          {
            name: 'revision',
            type: 'varchar',
            length: '10',
            default: "'A'",
          },
          {
            name: 'product_code',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'bom_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'routing_type',
            type: 'enum',
            enum: ['standard', 'alternate', 'preferred', 'emergency'],
            default: "'standard'",
          },
          {
            name: 'total_time',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'total_cost',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'effective_from',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'effective_to',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create routing_operations table
    await queryRunner.createTable(
      new Table({
        name: 'routing_operations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'routing_id',
            type: 'uuid',
          },
          {
            name: 'operation_sequence',
            type: 'integer',
          },
          {
            name: 'operation_code',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'operation_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'operation_type',
            type: 'enum',
            enum: ['setup', 'processing', 'inspection', 'transport', 'storage', 'wait', 'rework'],
            default: "'processing'",
          },
          {
            name: 'work_center_id',
            type: 'uuid',
          },
          {
            name: 'setup_time',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'run_time',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'wait_time',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'move_time',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'standard_time',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'labor_hours',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'machine_hours',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'cost_per_hour',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'total_cost',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'is_critical',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_outsourced',
            type: 'boolean',
            default: false,
          },
          {
            name: 'outsourcing_details',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'quality_checks',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'tools_required',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'skills_required',
            type: 'text',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'safety_requirements',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'environmental_conditions',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create quality_checks table
    await queryRunner.createTable(
      new Table({
        name: 'quality_checks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'check_number',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'check_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'check_type',
            type: 'enum',
            enum: ['incoming', 'in_process', 'final', 'outgoing', 'audit', 'calibration'],
            default: "'in_process'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'in_progress', 'passed', 'failed', 'on_hold', 'cancelled'],
            default: "'pending'",
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['low', 'medium', 'high', 'critical'],
            default: "'medium'",
          },
          {
            name: 'production_order_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'work_order_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'work_center_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'product_code',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'batch_number',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'lot_number',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'sample_size',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'quantity_checked',
            type: 'decimal',
            precision: 12,
            scale: 4,
            isNullable: true,
          },
          {
            name: 'quantity_passed',
            type: 'decimal',
            precision: 12,
            scale: 4,
            default: 0,
          },
          {
            name: 'quantity_failed',
            type: 'decimal',
            precision: 12,
            scale: 4,
            default: 0,
          },
          {
            name: 'pass_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'test_parameters',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'test_results',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'defects_found',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'corrective_actions',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'inspector_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'inspection_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completion_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'test_equipment',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'environmental_conditions',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'certifications',
            type: 'text',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'compliance_standards',
            type: 'text',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'cost_of_quality',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create equipment_maintenance table
    await queryRunner.createTable(
      new Table({
        name: 'equipment_maintenance',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'maintenance_order_number',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'maintenance_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'maintenance_type',
            type: 'enum',
            enum: ['preventive', 'corrective', 'predictive', 'emergency', 'routine', 'overhaul'],
            default: "'preventive'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'deferred'],
            default: "'scheduled'",
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['low', 'medium', 'high', 'critical', 'emergency'],
            default: "'medium'",
          },
          {
            name: 'equipment_id',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'equipment_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'work_center_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'production_line_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'scheduled_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'planned_start_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'planned_end_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'actual_start_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'actual_end_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'estimated_duration',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'actual_duration',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'assigned_technicians',
            type: 'text',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'required_skills',
            type: 'text',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'maintenance_tasks',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'parts_required',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'parts_consumed',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'tools_required',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'safety_procedures',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'work_instructions',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'findings',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'actions_taken',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'recommendations',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'cost_tracking',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'downtime_impact',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'performance_impact',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'next_maintenance_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'maintenance_frequency',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'is_emergency',
            type: 'boolean',
            default: false,
          },
          {
            name: 'requires_shutdown',
            type: 'boolean',
            default: false,
          },
          {
            name: 'approval_required',
            type: 'boolean',
            default: false,
          },
          {
            name: 'approved_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'approval_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completion_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'attachments',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create operation_logs table
    await queryRunner.createTable(
      new Table({
        name: 'operation_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'log_number',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'event_type',
            type: 'enum',
            enum: ['start', 'stop', 'pause', 'resume', 'complete', 'error', 'maintenance', 'quality_check', 'material_change', 'operator_change'],
            default: "'start'",
          },
          {
            name: 'event_category',
            type: 'enum',
            enum: ['production', 'quality', 'maintenance', 'material', 'operator', 'system', 'safety', 'alarm'],
            default: "'production'",
          },
          {
            name: 'severity',
            type: 'enum',
            enum: ['info', 'warning', 'error', 'critical'],
            default: "'info'",
          },
          {
            name: 'production_order_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'work_order_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'work_center_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'production_line_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'equipment_id',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'iot_device_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'operator_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'shift_id',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'timestamp',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'message',
            type: 'text',
          },
          {
            name: 'details',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'metrics',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'parameters',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'before_state',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'after_state',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'duration',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'quantity_processed',
            type: 'decimal',
            precision: 12,
            scale: 4,
            isNullable: true,
          },
          {
            name: 'quality_score',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'efficiency_score',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'downtime_reason',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'resolved',
            type: 'boolean',
            default: false,
          },
          {
            name: 'resolved_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'resolved_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'resolution_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'tags',
            type: 'text',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'correlation_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'parent_log_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'trace_id',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'source_system',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes for all tables
    
    // Routings indexes
    await queryRunner.createIndex('routings', new Index('IDX_routings_code', ['routing_code']));
    await queryRunner.createIndex('routings', new Index('IDX_routings_product', ['product_code']));
    await queryRunner.createIndex('routings', new Index('IDX_routings_status', ['status']));
    await queryRunner.createIndex('routings', new Index('IDX_routings_type', ['routing_type']));
    await queryRunner.createIndex('routings', new Index('IDX_routings_active', ['is_active']));

    // Routing operations indexes
    await queryRunner.createIndex('routing_operations', new Index('IDX_routing_operations_routing', ['routing_id']));
    await queryRunner.createIndex('routing_operations', new Index('IDX_routing_operations_sequence', ['routing_id', 'operation_sequence']));
    await queryRunner.createIndex('routing_operations', new Index('IDX_routing_operations_work_center', ['work_center_id']));
    await queryRunner.createIndex('routing_operations', new Index('IDX_routing_operations_code', ['operation_code']));
    await queryRunner.createIndex('routing_operations', new Index('IDX_routing_operations_type', ['operation_type']));
    await queryRunner.createIndex('routing_operations', new Index('IDX_routing_operations_critical', ['is_critical']));

    // Quality checks indexes
    await queryRunner.createIndex('quality_checks', new Index('IDX_quality_checks_number', ['check_number']));
    await queryRunner.createIndex('quality_checks', new Index('IDX_quality_checks_status', ['status']));
    await queryRunner.createIndex('quality_checks', new Index('IDX_quality_checks_type', ['check_type']));
    await queryRunner.createIndex('quality_checks', new Index('IDX_quality_checks_priority', ['priority']));
    await queryRunner.createIndex('quality_checks', new Index('IDX_quality_checks_product', ['product_code']));
    await queryRunner.createIndex('quality_checks', new Index('IDX_quality_checks_production_order', ['production_order_id']));
    await queryRunner.createIndex('quality_checks', new Index('IDX_quality_checks_work_order', ['work_order_id']));
    await queryRunner.createIndex('quality_checks', new Index('IDX_quality_checks_batch', ['batch_number']));
    await queryRunner.createIndex('quality_checks', new Index('IDX_quality_checks_inspection_date', ['inspection_date']));

    // Equipment maintenance indexes
    await queryRunner.createIndex('equipment_maintenance', new Index('IDX_maintenance_order_number', ['maintenance_order_number']));
    await queryRunner.createIndex('equipment_maintenance', new Index('IDX_maintenance_status', ['status']));
    await queryRunner.createIndex('equipment_maintenance', new Index('IDX_maintenance_type', ['maintenance_type']));
    await queryRunner.createIndex('equipment_maintenance', new Index('IDX_maintenance_priority', ['priority']));
    await queryRunner.createIndex('equipment_maintenance', new Index('IDX_maintenance_equipment', ['equipment_id']));
    await queryRunner.createIndex('equipment_maintenance', new Index('IDX_maintenance_work_center', ['work_center_id']));
    await queryRunner.createIndex('equipment_maintenance', new Index('IDX_maintenance_scheduled_date', ['scheduled_date']));
    await queryRunner.createIndex('equipment_maintenance', new Index('IDX_maintenance_emergency', ['is_emergency']));
    await queryRunner.createIndex('equipment_maintenance', new Index('IDX_maintenance_next_date', ['next_maintenance_date']));

    // Operation logs indexes
    await queryRunner.createIndex('operation_logs', new Index('IDX_operation_logs_timestamp', ['timestamp']));
    await queryRunner.createIndex('operation_logs', new Index('IDX_operation_logs_event_type', ['event_type']));
    await queryRunner.createIndex('operation_logs', new Index('IDX_operation_logs_category', ['event_category']));
    await queryRunner.createIndex('operation_logs', new Index('IDX_operation_logs_severity', ['severity']));
    await queryRunner.createIndex('operation_logs', new Index('IDX_operation_logs_production_order', ['production_order_id']));
    await queryRunner.createIndex('operation_logs', new Index('IDX_operation_logs_work_order', ['work_order_id']));
    await queryRunner.createIndex('operation_logs', new Index('IDX_operation_logs_work_center', ['work_center_id']));
    await queryRunner.createIndex('operation_logs', new Index('IDX_operation_logs_equipment', ['equipment_id']));
    await queryRunner.createIndex('operation_logs', new Index('IDX_operation_logs_operator', ['operator_id']));
    await queryRunner.createIndex('operation_logs', new Index('IDX_operation_logs_resolved', ['resolved']));
    await queryRunner.createIndex('operation_logs', new Index('IDX_operation_logs_correlation', ['correlation_id']));
    await queryRunner.createIndex('operation_logs', new Index('IDX_operation_logs_trace', ['trace_id']));
    await queryRunner.createIndex('operation_logs', new Index('IDX_operation_logs_tags', ['tags'], { where: 'tags IS NOT NULL' }));

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE routing_operations
      ADD CONSTRAINT FK_routing_operations_routing_id
      FOREIGN KEY (routing_id) REFERENCES routings(id)
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE routing_operations
      ADD CONSTRAINT FK_routing_operations_work_center_id
      FOREIGN KEY (work_center_id) REFERENCES work_centers(id)
      ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE quality_checks
      ADD CONSTRAINT FK_quality_checks_production_order_id
      FOREIGN KEY (production_order_id) REFERENCES production_orders(id)
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE quality_checks
      ADD CONSTRAINT FK_quality_checks_work_order_id
      FOREIGN KEY (work_order_id) REFERENCES work_orders(id)
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE quality_checks
      ADD CONSTRAINT FK_quality_checks_work_center_id
      FOREIGN KEY (work_center_id) REFERENCES work_centers(id)
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE equipment_maintenance
      ADD CONSTRAINT FK_maintenance_work_center_id
      FOREIGN KEY (work_center_id) REFERENCES work_centers(id)
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE equipment_maintenance
      ADD CONSTRAINT FK_maintenance_production_line_id
      FOREIGN KEY (production_line_id) REFERENCES production_lines(id)
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE operation_logs
      ADD CONSTRAINT FK_operation_logs_production_order_id
      FOREIGN KEY (production_order_id) REFERENCES production_orders(id)
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE operation_logs
      ADD CONSTRAINT FK_operation_logs_work_order_id
      FOREIGN KEY (work_order_id) REFERENCES work_orders(id)
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE operation_logs
      ADD CONSTRAINT FK_operation_logs_work_center_id
      FOREIGN KEY (work_center_id) REFERENCES work_centers(id)
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE operation_logs
      ADD CONSTRAINT FK_operation_logs_production_line_id
      FOREIGN KEY (production_line_id) REFERENCES production_lines(id)
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE operation_logs
      ADD CONSTRAINT FK_operation_logs_iot_device_id
      FOREIGN KEY (iot_device_id) REFERENCES iot_devices(id)
      ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE operation_logs
      ADD CONSTRAINT FK_operation_logs_parent_log_id
      FOREIGN KEY (parent_log_id) REFERENCES operation_logs(id)
      ON DELETE SET NULL
    `);

    // Add constraints to link routing with bom
    await queryRunner.query(`
      ALTER TABLE routings
      ADD CONSTRAINT FK_routings_bom_id
      FOREIGN KEY (bom_id) REFERENCES bill_of_materials(id)
      ON DELETE SET NULL
    `);

    // Update work_orders to reference routing_operations
    await queryRunner.query(`
      ALTER TABLE work_orders
      ADD CONSTRAINT FK_work_orders_routing_operation_id
      FOREIGN KEY (routing_operation_id) REFERENCES routing_operations(id)
      ON DELETE SET NULL
    `);

    // Update production_orders to reference routings
    await queryRunner.query(`
      ALTER TABLE production_orders
      ADD CONSTRAINT FK_production_orders_routing_id
      FOREIGN KEY (routing_id) REFERENCES routings(id)
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('operation_logs');
    await queryRunner.dropTable('equipment_maintenance');
    await queryRunner.dropTable('quality_checks');
    await queryRunner.dropTable('routing_operations');
    await queryRunner.dropTable('routings');
  }
}
