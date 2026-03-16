import { MigrationInterface, QueryRunner, TableColumn, Table } from 'typeorm';

export class AddEnterpriseBilling1738170000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add billing fields to organizations table
    await queryRunner.addColumn(
      'organizations',
      new TableColumn({
        name: 'billingType',
        type: 'varchar',
        default: "'payment_gateway'",
      }),
    );

    await queryRunner.addColumn(
      'organizations',
      new TableColumn({
        name: 'enterpriseAgreement',
        type: 'json',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'organizations',
      new TableColumn({
        name: 'requiresApproval',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'organizations',
      new TableColumn({
        name: 'approvalStatus',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'organizations',
      new TableColumn({
        name: 'approvedBy',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'organizations',
      new TableColumn({
        name: 'approvedAt',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'organizations',
      new TableColumn({
        name: 'manualBillingEnabled',
        type: 'boolean',
        default: false,
      }),
    );

    // Add enterprise billing fields to billing_transactions table
    await queryRunner.addColumn(
      'billing_transactions',
      new TableColumn({
        name: 'billingType',
        type: 'varchar',
        default: "'payment_gateway'",
      }),
    );

    await queryRunner.addColumn(
      'billing_transactions',
      new TableColumn({
        name: 'approvalStatus',
        type: 'varchar',
        default: "'not_required'",
      }),
    );

    await queryRunner.addColumn(
      'billing_transactions',
      new TableColumn({
        name: 'approvedBy',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'billing_transactions',
      new TableColumn({
        name: 'approvedAt',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'billing_transactions',
      new TableColumn({
        name: 'paymentProofUrl',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'billing_transactions',
      new TableColumn({
        name: 'invoiceUrl',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'billing_transactions',
      new TableColumn({
        name: 'dueDate',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'billing_transactions',
      new TableColumn({
        name: 'paidDate',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'billing_transactions',
      new TableColumn({
        name: 'paymentReference',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'billing_transactions',
      new TableColumn({
        name: 'bankTransactionId',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // Create enterprise_payments table
    await queryRunner.createTable(
      new Table({
        name: 'enterprise_payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'organizationId',
            type: 'uuid',
          },
          {
            name: 'contractNumber',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'invoiceNumber',
            type: 'varchar',
          },
          {
            name: 'invoiceDate',
            type: 'timestamp',
          },
          {
            name: 'dueDate',
            type: 'timestamp',
          },
          {
            name: 'amountDue',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'amountPaid',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'currency',
            type: 'varchar',
            default: "'USD'",
          },
          {
            name: 'paymentStatus',
            type: 'varchar',
            default: "'pending'",
          },
          {
            name: 'paymentMethod',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'paymentReference',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'paymentProofUrl',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'approvalStatus',
            type: 'varchar',
            default: "'pending'",
          },
          {
            name: 'approvedBy',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'approvedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'rejectionReason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
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
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_EP_ORG_STATUS',
            columnNames: ['organizationId', 'paymentStatus'],
          },
          {
            name: 'IDX_EP_APPROVAL',
            columnNames: ['approvalStatus', 'createdAt'],
          },
          {
            name: 'IDX_EP_DUE_DATE',
            columnNames: ['dueDate'],
          },
        ],
        foreignKeys: [
          {
            columnNames: ['organizationId'],
            referencedTableName: 'organizations',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop enterprise_payments table
    await queryRunner.dropTable('enterprise_payments');

    // Remove columns from billing_transactions
    await queryRunner.dropColumn('billing_transactions', 'bankTransactionId');
    await queryRunner.dropColumn('billing_transactions', 'paymentReference');
    await queryRunner.dropColumn('billing_transactions', 'paidDate');
    await queryRunner.dropColumn('billing_transactions', 'dueDate');
    await queryRunner.dropColumn('billing_transactions', 'invoiceUrl');
    await queryRunner.dropColumn('billing_transactions', 'paymentProofUrl');
    await queryRunner.dropColumn('billing_transactions', 'approvedAt');
    await queryRunner.dropColumn('billing_transactions', 'approvedBy');
    await queryRunner.dropColumn('billing_transactions', 'approvalStatus');
    await queryRunner.dropColumn('billing_transactions', 'billingType');

    // Remove columns from organizations
    await queryRunner.dropColumn('organizations', 'manualBillingEnabled');
    await queryRunner.dropColumn('organizations', 'approvedAt');
    await queryRunner.dropColumn('organizations', 'approvedBy');
    await queryRunner.dropColumn('organizations', 'approvalStatus');
    await queryRunner.dropColumn('organizations', 'requiresApproval');
    await queryRunner.dropColumn('organizations', 'enterpriseAgreement');
    await queryRunner.dropColumn('organizations', 'billingType');
  }
}
