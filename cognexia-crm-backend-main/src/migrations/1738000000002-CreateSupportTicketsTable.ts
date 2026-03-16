import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateSupportTicketsTable1738000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'support_tickets',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'ticketNumber',
            type: 'varchar',
            length: '20',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'organizationId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'submittedBy',
            type: 'uuid',
            isNullable: false,
            comment: 'User ID of the person who submitted the ticket',
          },
          {
            name: 'assignedTo',
            type: 'uuid',
            isNullable: true,
            comment: 'Staff member assigned to this ticket',
          },
          {
            name: 'subject',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'open'",
            comment: 'open, in_progress, waiting_response, resolved, closed',
          },
          {
            name: 'priority',
            type: 'varchar',
            length: '20',
            default: "'medium'",
            comment: 'low, medium, high, urgent',
          },
          {
            name: 'category',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'technical, billing, feature_request, bug, other',
          },
          {
            name: 'channel',
            type: 'varchar',
            length: '20',
            default: "'portal'",
            comment: 'portal, email, phone, chat',
          },
          {
            name: 'messages',
            type: 'jsonb',
            default: "'[]'",
            comment: 'Array of message objects with sender, text, timestamp',
          },
          {
            name: 'attachments',
            type: 'jsonb',
            default: "'[]'",
            comment: 'Array of attachment URLs',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
            comment: 'Additional ticket metadata',
          },
          {
            name: 'tags',
            type: 'jsonb',
            default: "'[]'",
            comment: 'Array of tags for categorization',
          },
          {
            name: 'firstResponseAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'resolvedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'closedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'resolutionTime',
            type: 'integer',
            isNullable: true,
            comment: 'Time to resolve in minutes',
          },
          {
            name: 'customerSatisfactionRating',
            type: 'integer',
            isNullable: true,
            comment: 'Rating from 1-5',
          },
          {
            name: 'internalNotes',
            type: 'text',
            isNullable: true,
            comment: 'Notes visible only to staff',
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
      'support_tickets',
      new TableIndex({
        name: 'IDX_SUPPORT_TICKETS_TICKET_NUMBER',
        columnNames: ['ticketNumber'],
        isUnique: true,
      })
    );

    await queryRunner.createIndex(
      'support_tickets',
      new TableIndex({
        name: 'IDX_SUPPORT_TICKETS_ORGANIZATION',
        columnNames: ['organizationId'],
      })
    );

    await queryRunner.createIndex(
      'support_tickets',
      new TableIndex({
        name: 'IDX_SUPPORT_TICKETS_SUBMITTED_BY',
        columnNames: ['submittedBy'],
      })
    );

    await queryRunner.createIndex(
      'support_tickets',
      new TableIndex({
        name: 'IDX_SUPPORT_TICKETS_ASSIGNED_TO',
        columnNames: ['assignedTo'],
      })
    );

    await queryRunner.createIndex(
      'support_tickets',
      new TableIndex({
        name: 'IDX_SUPPORT_TICKETS_STATUS',
        columnNames: ['status'],
      })
    );

    await queryRunner.createIndex(
      'support_tickets',
      new TableIndex({
        name: 'IDX_SUPPORT_TICKETS_PRIORITY',
        columnNames: ['priority'],
      })
    );

    await queryRunner.createIndex(
      'support_tickets',
      new TableIndex({
        name: 'IDX_SUPPORT_TICKETS_CATEGORY',
        columnNames: ['category'],
      })
    );

    await queryRunner.createIndex(
      'support_tickets',
      new TableIndex({
        name: 'IDX_SUPPORT_TICKETS_CREATED_AT',
        columnNames: ['createdAt'],
      })
    );

    // Add foreign keys
    await queryRunner.query(`
      ALTER TABLE support_tickets
      ADD CONSTRAINT fk_support_tickets_organization
      FOREIGN KEY ("organizationId") REFERENCES organizations(id) ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE support_tickets
      ADD CONSTRAINT fk_support_tickets_submitted_by
      FOREIGN KEY ("submittedBy") REFERENCES users(id) ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE support_tickets
      ADD CONSTRAINT fk_support_tickets_assigned_to
      FOREIGN KEY ("assignedTo") REFERENCES users(id) ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('support_tickets');
  }
}
