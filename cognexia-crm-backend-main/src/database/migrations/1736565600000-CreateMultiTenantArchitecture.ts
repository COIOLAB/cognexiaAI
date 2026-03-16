import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateMultiTenantArchitecture1736565600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create master_organization table (CognexiaAI)
    await queryRunner.createTable(
      new Table({
        name: 'master_organization',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '100', isUnique: true },
          { name: 'email', type: 'varchar', length: '100', isUnique: true },
          { name: 'phone', type: 'varchar', length: '50', isNullable: true },
          { name: 'address', type: 'text', isNullable: true },
          { name: 'website', type: 'varchar', length: '100', isNullable: true },
          { name: 'logoUrl', type: 'text', isNullable: true },
          { name: 'branding', type: 'json', isNullable: true },
          { name: 'settings', type: 'json', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' }
        ]
      }),
      true
    );

    // 2. Create subscription_plans table
    await queryRunner.createTable(
      new Table({
        name: 'subscription_plans',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'planType', type: 'enum', enum: ['starter', 'professional', 'business', 'enterprise', 'custom'], isUnique: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'price', type: 'decimal', precision: 10, scale: 2 },
          { name: 'currency', type: 'varchar', length: '10', default: "'USD'" },
          { name: 'billingInterval', type: 'enum', enum: ['monthly', 'quarterly', 'yearly'], default: "'monthly'" },
          { name: 'includedUsers', type: 'int' },
          { name: 'pricePerAdditionalUser', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'maxUsers', type: 'int', isNullable: true },
          { name: 'storageLimit', type: 'int', isNullable: true },
          { name: 'apiCallsPerMonth', type: 'int', isNullable: true },
          { name: 'features', type: 'json' },
          { name: 'featureFlags', type: 'json', isNullable: true },
          { name: 'stripePriceId', type: 'varchar', length: '100', isNullable: true },
          { name: 'stripeProductId', type: 'varchar', length: '100', isNullable: true },
          { name: 'trialDays', type: 'int', default: 14 },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'isPopular', type: 'boolean', default: false },
          { name: 'sortOrder', type: 'int', default: 0 },
          { name: 'metadata', type: 'json', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' }
        ]
      }),
      true
    );

    await queryRunner.createIndex(
      'subscription_plans',
      new TableIndex({
        name: 'IDX_subscription_plans_planType_isActive',
        columnNames: ['planType', 'isActive']
      })
    );

    // 3. Create organizations table (Client Companies)
    await queryRunner.createTable(
      new Table({
        name: 'organizations',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'email', type: 'varchar', length: '100', isUnique: true },
          { name: 'phone', type: 'varchar', length: '50', isNullable: true },
          { name: 'address', type: 'text', isNullable: true },
          { name: 'website', type: 'varchar', length: '100', isNullable: true },
          { name: 'logoUrl', type: 'text', isNullable: true },
          { name: 'master_organizationId', type: 'uuid' },
          { name: 'subscription_plan_id', type: 'uuid', isNullable: true },
          { name: 'subscriptionStatus', type: 'enum', enum: ['trial', 'active', 'past_due', 'cancelled', 'expired'], default: "'trial'" },
          { name: 'subscriptionStartDate', type: 'timestamp', isNullable: true },
          { name: 'subscriptionEndDate', type: 'timestamp', isNullable: true },
          { name: 'trialEndsAt', type: 'timestamp', isNullable: true },
          { name: 'maxUsers', type: 'int', default: 5 },
          { name: 'currentUserCount', type: 'int', default: 0 },
          { name: 'stripeCustomerId', type: 'varchar', length: '100', isNullable: true },
          { name: 'stripeSubscriptionId', type: 'varchar', length: '100', isNullable: true },
          { name: 'monthlyRevenue', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'currency', type: 'varchar', length: '10', default: "'USD'" },
          { name: 'lastBillingDate', type: 'timestamp', isNullable: true },
          { name: 'nextBillingDate', type: 'timestamp', isNullable: true },
          { name: 'status', type: 'enum', enum: ['trial', 'active', 'suspended', 'cancelled', 'pending'], default: "'trial'" },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'branding', type: 'json', isNullable: true },
          { name: 'settings', type: 'json', isNullable: true },
          { name: 'contactPersonName', type: 'varchar', length: '100', isNullable: true },
          { name: 'contactPersonEmail', type: 'varchar', length: '100', isNullable: true },
          { name: 'contactPersonPhone', type: 'varchar', length: '50', isNullable: true },
          { name: 'metadata', type: 'json', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true }
        ]
      }),
      true
    );

    await queryRunner.createForeignKey(
      'organizations',
      new TableForeignKey({
        columnNames: ['master_organizationId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'master_organization',
        onDelete: 'RESTRICT'
      })
    );

    await queryRunner.createForeignKey(
      'organizations',
      new TableForeignKey({
        columnNames: ['subscription_plan_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'subscription_plans',
        onDelete: 'SET NULL'
      })
    );

    await queryRunner.createIndex(
      'organizations',
      new TableIndex({
        name: 'IDX_organizations_master_org_status',
        columnNames: ['master_organizationId', 'status']
      })
    );

    await queryRunner.createIndex(
      'organizations',
      new TableIndex({
        name: 'IDX_organizations_subscriptionStatus',
        columnNames: ['subscriptionStatus']
      })
    );

    // 4. Create billing_transactions table
    await queryRunner.createTable(
      new Table({
        name: 'billing_transactions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'organizationId', type: 'uuid' },
          { name: 'transactionType', type: 'enum', enum: ['subscription', 'addon', 'additional_users', 'overage', 'refund', 'credit', 'one_time'] },
          { name: 'status', type: 'enum', enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'], default: "'pending'" },
          { name: 'amount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'currency', type: 'varchar', length: '10', default: "'USD'" },
          { name: 'tax', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'discount', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'totalAmount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'paymentMethod', type: 'enum', enum: ['card', 'bank_transfer', 'paypal', 'stripe', 'manual', 'other'] },
          { name: 'stripePaymentIntentId', type: 'varchar', length: '100', isNullable: true },
          { name: 'stripeInvoiceId', type: 'varchar', length: '100', isNullable: true },
          { name: 'stripeChargeId', type: 'varchar', length: '100', isNullable: true },
          { name: 'invoiceNumber', type: 'varchar', length: '50', isUnique: true },
          { name: 'invoiceDate', type: 'timestamp', isNullable: true },
          { name: 'dueDate', type: 'timestamp', isNullable: true },
          { name: 'paidAt', type: 'timestamp', isNullable: true },
          { name: 'description', type: 'text' },
          { name: 'lineItems', type: 'json', isNullable: true },
          { name: 'periodStart', type: 'timestamp', isNullable: true },
          { name: 'periodEnd', type: 'timestamp', isNullable: true },
          { name: 'failureReason', type: 'text', isNullable: true },
          { name: 'retryCount', type: 'int', default: 0 },
          { name: 'nextRetryAt', type: 'timestamp', isNullable: true },
          { name: 'refund_transaction_id', type: 'uuid', isNullable: true },
          { name: 'refundReason', type: 'text', isNullable: true },
          { name: 'metadata', type: 'json', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' }
        ]
      }),
      true
    );

    await queryRunner.createForeignKey(
      'billing_transactions',
      new TableForeignKey({
        columnNames: ['organizationId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'organizations',
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createIndex(
      'billing_transactions',
      new TableIndex({
        name: 'IDX_billing_transactions_org_created',
        columnNames: ['organizationId', 'createdAt']
      })
    );

    await queryRunner.createIndex(
      'billing_transactions',
      new TableIndex({
        name: 'IDX_billing_transactions_status_type',
        columnNames: ['status', 'transactionType']
      })
    );

    // 5. Create usage_metrics table
    await queryRunner.createTable(
      new Table({
        name: 'usage_metrics',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'organizationId', type: 'uuid' },
          { name: 'metricType', type: 'enum', enum: ['active_users', 'storage', 'api_calls', 'email_sent', 'sms_sent', 'contacts', 'leads', 'opportunities', 'campaigns', 'reports_generated', 'data_exports', 'custom'] },
          { name: 'interval', type: 'enum', enum: ['hourly', 'daily', 'weekly', 'monthly'], default: "'daily'" },
          { name: 'value', type: 'bigint', default: 0 },
          { name: 'previousValue', type: 'bigint', isNullable: true },
          { name: 'limit', type: 'bigint', isNullable: true },
          { name: 'percentageUsed', type: 'decimal', precision: 5, scale: 2, isNullable: true },
          { name: 'recordedAt', type: 'timestamp' },
          { name: 'periodStart', type: 'timestamp', isNullable: true },
          { name: 'periodEnd', type: 'timestamp', isNullable: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'breakdown', type: 'json', isNullable: true },
          { name: 'isOverLimit', type: 'boolean', default: false },
          { name: 'alertSent', type: 'boolean', default: false },
          { name: 'metadata', type: 'json', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' }
        ]
      }),
      true
    );

    await queryRunner.createForeignKey(
      'usage_metrics',
      new TableForeignKey({
        columnNames: ['organizationId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'organizations',
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createIndex(
      'usage_metrics',
      new TableIndex({
        name: 'IDX_usage_metrics_org_type_recorded',
        columnNames: ['organizationId', 'metricType', 'recordedAt']
      })
    );

    // 6. Create audit_logs table
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'organizationId', type: 'uuid' },
          { name: 'user_id', type: 'uuid' },
          { name: 'userEmail', type: 'varchar', length: '100' },
          { name: 'userName', type: 'varchar', length: '100' },
          { name: 'action', type: 'enum', enum: ['create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import', 'share', 'approve', 'reject'] },
          { name: 'entityType', type: 'enum', enum: ['user', 'organization', 'subscription', 'billing', 'lead', 'contact', 'opportunity', 'account', 'campaign', 'ticket', 'product', 'report', 'setting'] },
          { name: 'entity_id', type: 'uuid', isNullable: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'changes', type: 'json', isNullable: true },
          { name: 'ipAddress', type: 'varchar', length: '45', isNullable: true },
          { name: 'userAgent', type: 'text', isNullable: true },
          { name: 'requestUrl', type: 'varchar', length: '255', isNullable: true },
          { name: 'requestMethod', type: 'varchar', length: '10', isNullable: true },
          { name: 'responseStatus', type: 'int', isNullable: true },
          { name: 'responseTime', type: 'int', isNullable: true },
          { name: 'isSecurityEvent', type: 'boolean', default: false },
          { name: 'isSuspicious', type: 'boolean', default: false },
          { name: 'complianceFlags', type: 'text', isNullable: true },
          { name: 'metadata', type: 'json', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' }
        ]
      }),
      true
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_logs_org_created',
        columnNames: ['organizationId', 'createdAt']
      })
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_logs_user_created',
        columnNames: ['user_id', 'createdAt']
      })
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_audit_logs_action_entity',
        columnNames: ['action', 'entityType']
      })
    );

    // 7. Update users table to add multi-tenant fields
    await queryRunner.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS "userType" VARCHAR(20) DEFAULT 'org_user',
      ADD COLUMN IF NOT EXISTS "isInvited" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "invitedAt" TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS "invitationToken" VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS "invitationAcceptedAt" TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS "mfaEnabled" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "mfaSecret" VARCHAR(255) NULL
    `);

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_org_userType',
        columnNames: ['organizationId', 'userType']
      })
    );

    // 8. Update roles table for multi-tenancy
    await queryRunner.query(`
      ALTER TABLE roles 
      ADD COLUMN IF NOT EXISTS "organizationId" UUID NULL
    `);

    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'IDX_roles_org_name',
        columnNames: ['organizationId', 'name']
      })
    );

    // 9. Create user_roles junction table
    await queryRunner.createTable(
      new Table({
        name: 'user_roles',
        columns: [
          { name: 'user_id', type: 'uuid' },
          { name: 'role_id', type: 'uuid' }
        ]
      }),
      true
    );

    await queryRunner.createForeignKey(
      'user_roles',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createForeignKey(
      'user_roles',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({
        name: 'IDX_user_roles_user',
        columnNames: ['user_id']
      })
    );

    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({
        name: 'IDX_user_roles_role',
        columnNames: ['role_id']
      })
    );

    // 10. Create index on permissions table
    await queryRunner.createIndex(
      'permissions',
      new TableIndex({
        name: 'IDX_permissions_resource_action',
        columnNames: ['resource', 'action']
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse order
    await queryRunner.dropIndex('permissions', 'IDX_permissions_resource_action');
    await queryRunner.dropTable('user_roles');
    await queryRunner.dropIndex('roles', 'IDX_roles_org_name');
    await queryRunner.query(`ALTER TABLE roles DROP COLUMN IF EXISTS "organizationId"`);
    await queryRunner.dropIndex('users', 'IDX_users_org_userType');
    await queryRunner.query(`
      ALTER TABLE users 
      DROP COLUMN IF EXISTS "mfaSecret",
      DROP COLUMN IF EXISTS "mfaEnabled",
      DROP COLUMN IF EXISTS "invitationAcceptedAt",
      DROP COLUMN IF EXISTS "invitationToken",
      DROP COLUMN IF EXISTS "invitedAt",
      DROP COLUMN IF EXISTS "isInvited",
      DROP COLUMN IF EXISTS "userType"
    `);
    await queryRunner.dropTable('audit_logs');
    await queryRunner.dropTable('usage_metrics');
    await queryRunner.dropTable('billing_transactions');
    await queryRunner.dropTable('organizations');
    await queryRunner.dropTable('subscription_plans');
    await queryRunner.dropTable('master_organization');
  }
}
