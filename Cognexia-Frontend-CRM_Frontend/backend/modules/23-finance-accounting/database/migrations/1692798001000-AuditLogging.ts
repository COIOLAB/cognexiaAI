/**
 * Audit Logging Migration for Finance & Accounting
 * 
 * Creates audit tables and triggers for comprehensive tracking
 * of all financial data changes for compliance and security.
 * 
 * @version 1.0.0
 * @compliance SOC2, ISO27001, GDPR, SOX
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuditLogging1692798001000 implements MigrationInterface {
  name = 'AuditLogging1692798001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create audit log table
    await queryRunner.query(`
      CREATE TABLE "audit_log" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "table_name" varchar(100) NOT NULL,
        "record_id" uuid NOT NULL,
        "operation" varchar(20) NOT NULL CHECK ("operation" IN ('INSERT', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'APPROVAL', 'POSTING')),
        "old_values" jsonb,
        "new_values" jsonb,
        "changed_by" uuid NOT NULL,
        "changed_at" timestamp with time zone NOT NULL DEFAULT now(),
        "ip_address" inet,
        "user_agent" text,
        "session_id" varchar(255),
        "transaction_id" varchar(255),
        "reason" text,
        "metadata" jsonb DEFAULT '{}',
        
        CONSTRAINT "PK_audit_log" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for audit log
    await queryRunner.query(`CREATE INDEX "IDX_audit_table_name" ON "audit_log" ("table_name")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_record_id" ON "audit_log" ("record_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_operation" ON "audit_log" ("operation")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_changed_by" ON "audit_log" ("changed_by")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_changed_at" ON "audit_log" ("changed_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_table_record" ON "audit_log" ("table_name", "record_id")`);

    // Create financial periods table for period management
    await queryRunner.query(`
      CREATE TABLE "financial_periods" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "periodCode" varchar(20) NOT NULL,
        "periodName" varchar(100) NOT NULL,
        "periodType" varchar(20) NOT NULL CHECK ("periodType" IN ('MONTH', 'QUARTER', 'YEAR', 'CUSTOM')),
        "startDate" date NOT NULL,
        "endDate" date NOT NULL,
        "fiscalYear" integer NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "isClosed" boolean NOT NULL DEFAULT false,
        "closedAt" timestamp with time zone,
        "closedBy" uuid,
        "companyId" uuid NOT NULL,
        "parentPeriodId" uuid,
        "metadata" jsonb DEFAULT '{}',
        "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
        "createdBy" uuid NOT NULL,
        "updatedBy" uuid NOT NULL,
        
        CONSTRAINT "PK_financial_periods" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_period_code_company" UNIQUE ("periodCode", "companyId"),
        CONSTRAINT "CHK_period_dates" CHECK ("startDate" < "endDate"),
        CONSTRAINT "FK_financial_periods_parent" FOREIGN KEY ("parentPeriodId") 
          REFERENCES "financial_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    // Create indexes for financial periods
    await queryRunner.query(`CREATE INDEX "IDX_fp_period_code" ON "financial_periods" ("periodCode")`);
    await queryRunner.query(`CREATE INDEX "IDX_fp_company" ON "financial_periods" ("companyId")`);
    await queryRunner.query(`CREATE INDEX "IDX_fp_dates" ON "financial_periods" ("startDate", "endDate")`);
    await queryRunner.query(`CREATE INDEX "IDX_fp_fiscal_year" ON "financial_periods" ("fiscalYear")`);
    await queryRunner.query(`CREATE INDEX "IDX_fp_active" ON "financial_periods" ("isActive")`);
    await queryRunner.query(`CREATE INDEX "IDX_fp_closed" ON "financial_periods" ("isClosed")`);

    // Create comprehensive audit triggers for all main tables
    await this.createAuditTriggers(queryRunner);

    // Create compliance tracking functions
    await this.createComplianceFunctions(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop audit triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS tr_audit_chart_of_accounts ON "chart_of_accounts"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS tr_audit_journal_entries ON "journal_entries"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS tr_audit_journal_lines ON "journal_lines"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS tr_audit_account_balances ON "account_balances"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS tr_audit_payment_transactions ON "payment_transactions"`);

    // Drop functions
    await queryRunner.query(`DROP FUNCTION IF EXISTS audit_trigger_function()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS check_period_closure()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS validate_posting_date()`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "financial_periods"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_log"`);
  }

  private async createAuditTriggers(queryRunner: QueryRunner): Promise<void> {
    // Create universal audit trigger function
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION audit_trigger_function()
      RETURNS TRIGGER AS $$
      DECLARE
        old_data jsonb;
        new_data jsonb;
        operation_type varchar(20);
      BEGIN
        -- Determine operation type
        IF TG_OP = 'DELETE' THEN
          old_data = to_jsonb(OLD);
          new_data = NULL;
          operation_type = 'DELETE';
        ELSIF TG_OP = 'UPDATE' THEN
          old_data = to_jsonb(OLD);
          new_data = to_jsonb(NEW);
          operation_type = 'UPDATE';
        ELSIF TG_OP = 'INSERT' THEN
          old_data = NULL;
          new_data = to_jsonb(NEW);
          operation_type = 'INSERT';
        END IF;

        -- Insert audit record
        INSERT INTO audit_log (
          table_name,
          record_id,
          operation,
          old_values,
          new_values,
          changed_by,
          changed_at
        ) VALUES (
          TG_TABLE_NAME,
          COALESCE(NEW.id, OLD.id),
          operation_type,
          old_data,
          new_data,
          COALESCE(NEW."updatedBy", NEW."createdBy", OLD."updatedBy"),
          now()
        );

        RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create audit triggers for all main tables
    const tables = [
      'chart_of_accounts',
      'journal_entries', 
      'journal_lines',
      'posting_rules',
      'account_balances',
      'trial_balances',
      'payment_transactions',
      'financial_periods'
    ];

    for (const table of tables) {
      await queryRunner.query(`
        CREATE TRIGGER tr_audit_${table}
        AFTER INSERT OR UPDATE OR DELETE ON "${table}"
        FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
      `);
    }
  }

  private async createComplianceFunctions(queryRunner: QueryRunner): Promise<void> {
    // Function to check if period is closed
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION check_period_closure()
      RETURNS TRIGGER AS $$
      DECLARE
        period_closed boolean;
      BEGIN
        -- Check if the period is closed for journal entries
        IF TG_TABLE_NAME = 'journal_entries' AND NEW."periodId" IS NOT NULL THEN
          SELECT "isClosed" INTO period_closed
          FROM financial_periods
          WHERE id = NEW."periodId";
          
          IF period_closed = true AND NEW."status" != 'DRAFT' THEN
            RAISE EXCEPTION 'Cannot post to a closed period: %', NEW."periodId";
          END IF;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    -- Create trigger for period closure validation
    await queryRunner.query(`
      CREATE TRIGGER tr_check_period_closure
      BEFORE INSERT OR UPDATE ON journal_entries
      FOR EACH ROW EXECUTE FUNCTION check_period_closure();
    `);

    -- Function to validate posting dates
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION validate_posting_date()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Validate that posting date is not in the future
        IF NEW."date" > CURRENT_DATE THEN
          RAISE EXCEPTION 'Posting date cannot be in the future: %', NEW."date";
        END IF;
        
        -- Validate that posting date is within the period
        IF NEW."periodId" IS NOT NULL THEN
          IF NOT EXISTS (
            SELECT 1 FROM financial_periods 
            WHERE id = NEW."periodId" 
            AND NEW."date" BETWEEN "startDate" AND "endDate"
          ) THEN
            RAISE EXCEPTION 'Posting date % is not within the specified period', NEW."date";
          END IF;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER tr_validate_posting_date
      BEFORE INSERT OR UPDATE ON journal_entries
      FOR EACH ROW EXECUTE FUNCTION validate_posting_date();
    `);
  }
}
