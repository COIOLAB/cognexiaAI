/**
 * Initial Finance & Accounting Database Schema Migration
 * 
 * Creates all core financial tables with proper relationships, indexes,
 * constraints, and triggers for enterprise-grade financial data management.
 * 
 * @version 3.0.0
 * @compliance SOC2, ISO27001, GDPR, SOX, GAAP, IFRS
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialFinanceScheme1692798000000 implements MigrationInterface {
  name = 'InitialFinanceScheme1692798000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable necessary PostgreSQL extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "btree_gin"`);

    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "account_type_enum" AS ENUM (
        'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "account_subtype_enum" AS ENUM (
        'CURRENT_ASSET', 'FIXED_ASSET', 'INTANGIBLE_ASSET', 'CURRENT_LIABILITY',
        'LONG_TERM_LIABILITY', 'OWNERS_EQUITY', 'RETAINED_EARNINGS', 'OPERATING_REVENUE',
        'NON_OPERATING_REVENUE', 'COST_OF_GOODS_SOLD', 'OPERATING_EXPENSE',
        'NON_OPERATING_EXPENSE'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "journal_status_enum" AS ENUM (
        'DRAFT', 'PENDING', 'APPROVED', 'POSTED', 'CANCELLED', 'REVERSED'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "payment_status_enum" AS ENUM (
        'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "payment_method_enum" AS ENUM (
        'CASH', 'CHECK', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER',
        'WIRE_TRANSFER', 'ACH', 'CRYPTOCURRENCY', 'DIGITAL_WALLET', 'OTHER'
      )
    `);

    // 1. Chart of Accounts Table
    await queryRunner.query(`
      CREATE TABLE "chart_of_accounts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "accountCode" varchar(20) NOT NULL,
        "accountName" varchar(255) NOT NULL,
        "accountType" "account_type_enum" NOT NULL,
        "accountSubtype" "account_subtype_enum" NOT NULL,
        "parentAccountId" uuid,
        "description" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "isSystemAccount" boolean NOT NULL DEFAULT false,
        "normalBalance" varchar(10) NOT NULL CHECK ("normalBalance" IN ('DEBIT', 'CREDIT')),
        "level" integer NOT NULL DEFAULT 1,
        "path" varchar(255),
        "taxRelevant" boolean NOT NULL DEFAULT false,
        "reconcilable" boolean NOT NULL DEFAULT false,
        "allowManualJournalEntries" boolean NOT NULL DEFAULT true,
        "currencyCode" varchar(3) NOT NULL DEFAULT 'USD',
        "companyId" uuid NOT NULL,
        "departmentId" uuid,
        "costCenterId" uuid,
        "metadata" jsonb DEFAULT '{}',
        "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
        "createdBy" uuid NOT NULL,
        "updatedBy" uuid NOT NULL,
        "version" integer NOT NULL DEFAULT 1,
        
        CONSTRAINT "PK_chart_of_accounts" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_account_code_company" UNIQUE ("accountCode", "companyId"),
        CONSTRAINT "FK_chart_of_accounts_parent" FOREIGN KEY ("parentAccountId") 
          REFERENCES "chart_of_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    // 2. Journal Entries Table
    await queryRunner.query(`
      CREATE TABLE "journal_entries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "journalNumber" varchar(50) NOT NULL,
        "date" date NOT NULL,
        "description" text NOT NULL,
        "reference" varchar(100),
        "status" "journal_status_enum" NOT NULL DEFAULT 'DRAFT',
        "totalDebit" decimal(19,4) NOT NULL DEFAULT 0,
        "totalCredit" decimal(19,4) NOT NULL DEFAULT 0,
        "isBalanced" boolean NOT NULL DEFAULT false,
        "isReversing" boolean NOT NULL DEFAULT false,
        "reversingDate" date,
        "originalEntryId" uuid,
        "reversedEntryId" uuid,
        "sourceLedger" varchar(50) NOT NULL,
        "sourceDocument" varchar(100),
        "sourceDocumentId" uuid,
        "postingDate" timestamp with time zone,
        "periodId" uuid,
        "companyId" uuid NOT NULL,
        "departmentId" uuid,
        "projectId" uuid,
        "currencyCode" varchar(3) NOT NULL DEFAULT 'USD',
        "exchangeRate" decimal(10,6) DEFAULT 1.000000,
        "functionalCurrencyAmount" decimal(19,4),
        "aiValidationStatus" varchar(20) DEFAULT 'PENDING',
        "aiValidationScore" decimal(3,2),
        "aiValidationNotes" text,
        "complianceChecked" boolean NOT NULL DEFAULT false,
        "complianceStatus" varchar(20) DEFAULT 'PENDING',
        "complianceNotes" text,
        "approvedAt" timestamp with time zone,
        "approvedBy" uuid,
        "postedAt" timestamp with time zone,
        "postedBy" uuid,
        "tags" text[],
        "metadata" jsonb DEFAULT '{}',
        "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
        "createdBy" uuid NOT NULL,
        "updatedBy" uuid NOT NULL,
        "version" integer NOT NULL DEFAULT 1,
        
        CONSTRAINT "PK_journal_entries" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_journal_number_company" UNIQUE ("journalNumber", "companyId"),
        CONSTRAINT "CHK_balanced_entry" CHECK (
          ("status" != 'POSTED') OR ("isBalanced" = true AND "totalDebit" = "totalCredit")
        ),
        CONSTRAINT "FK_journal_entries_original" FOREIGN KEY ("originalEntryId") 
          REFERENCES "journal_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "FK_journal_entries_reversed" FOREIGN KEY ("reversedEntryId") 
          REFERENCES "journal_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    // 3. Journal Lines Table
    await queryRunner.query(`
      CREATE TABLE "journal_lines" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "journalEntryId" uuid NOT NULL,
        "accountId" uuid NOT NULL,
        "lineNumber" integer NOT NULL,
        "description" text,
        "debitAmount" decimal(19,4) NOT NULL DEFAULT 0,
        "creditAmount" decimal(19,4) NOT NULL DEFAULT 0,
        "functionalDebitAmount" decimal(19,4) NOT NULL DEFAULT 0,
        "functionalCreditAmount" decimal(19,4) NOT NULL DEFAULT 0,
        "quantity" decimal(12,4),
        "unitPrice" decimal(12,4),
        "taxAmount" decimal(19,4) DEFAULT 0,
        "taxRate" decimal(5,4) DEFAULT 0,
        "taxCode" varchar(20),
        "departmentId" uuid,
        "projectId" uuid,
        "costCenterId" uuid,
        "customerId" uuid,
        "vendorId" uuid,
        "employeeId" uuid,
        "currencyCode" varchar(3) NOT NULL DEFAULT 'USD',
        "exchangeRate" decimal(10,6) DEFAULT 1.000000,
        "baseAmount" decimal(19,4),
        "dimensions" jsonb DEFAULT '{}',
        "analytics" jsonb DEFAULT '{}',
        "metadata" jsonb DEFAULT '{}',
        "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
        "createdBy" uuid NOT NULL,
        "updatedBy" uuid NOT NULL,
        
        CONSTRAINT "PK_journal_lines" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_journal_line_number" UNIQUE ("journalEntryId", "lineNumber"),
        CONSTRAINT "CHK_debit_credit_exclusive" CHECK (
          NOT ("debitAmount" > 0 AND "creditAmount" > 0)
        ),
        CONSTRAINT "CHK_amount_positive" CHECK (
          "debitAmount" >= 0 AND "creditAmount" >= 0
        ),
        CONSTRAINT "FK_journal_lines_entry" FOREIGN KEY ("journalEntryId") 
          REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_journal_lines_account" FOREIGN KEY ("accountId") 
          REFERENCES "chart_of_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);

    // 4. Posting Rules Table
    await queryRunner.query(`
      CREATE TABLE "posting_rules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ruleCode" varchar(50) NOT NULL,
        "ruleName" varchar(255) NOT NULL,
        "description" text,
        "sourceSystem" varchar(50) NOT NULL,
        "transactionType" varchar(100) NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "priority" integer NOT NULL DEFAULT 100,
        "conditions" jsonb NOT NULL DEFAULT '{}',
        "debitAccountTemplate" varchar(20) NOT NULL,
        "creditAccountTemplate" varchar(20) NOT NULL,
        "amountFormula" text,
        "descriptionTemplate" text,
        "departmentMapping" jsonb DEFAULT '{}',
        "projectMapping" jsonb DEFAULT '{}',
        "costCenterMapping" jsonb DEFAULT '{}',
        "taxHandling" jsonb DEFAULT '{}',
        "currencyHandling" jsonb DEFAULT '{}',
        "validFrom" date NOT NULL,
        "validTo" date,
        "companyId" uuid NOT NULL,
        "approvedAt" timestamp with time zone,
        "approvedBy" uuid,
        "lastUsed" timestamp with time zone,
        "usageCount" integer NOT NULL DEFAULT 0,
        "metadata" jsonb DEFAULT '{}',
        "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
        "createdBy" uuid NOT NULL,
        "updatedBy" uuid NOT NULL,
        "version" integer NOT NULL DEFAULT 1,
        
        CONSTRAINT "PK_posting_rules" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_rule_code_company" UNIQUE ("ruleCode", "companyId")
      )
    `);

    // 5. Account Balances Table
    await queryRunner.query(`
      CREATE TABLE "account_balances" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "accountId" uuid NOT NULL,
        "periodId" uuid NOT NULL,
        "openingBalance" decimal(19,4) NOT NULL DEFAULT 0,
        "debitMovements" decimal(19,4) NOT NULL DEFAULT 0,
        "creditMovements" decimal(19,4) NOT NULL DEFAULT 0,
        "closingBalance" decimal(19,4) NOT NULL DEFAULT 0,
        "functionalOpeningBalance" decimal(19,4) NOT NULL DEFAULT 0,
        "functionalDebitMovements" decimal(19,4) NOT NULL DEFAULT 0,
        "functionalCreditMovements" decimal(19,4) NOT NULL DEFAULT 0,
        "functionalClosingBalance" decimal(19,4) NOT NULL DEFAULT 0,
        "transactionCount" integer NOT NULL DEFAULT 0,
        "lastTransactionDate" date,
        "reconciliationStatus" varchar(20) DEFAULT 'PENDING',
        "reconciledBalance" decimal(19,4),
        "reconciledDate" timestamp with time zone,
        "reconciledBy" uuid,
        "variance" decimal(19,4) DEFAULT 0,
        "companyId" uuid NOT NULL,
        "currencyCode" varchar(3) NOT NULL DEFAULT 'USD',
        "isLocked" boolean NOT NULL DEFAULT false,
        "lockedAt" timestamp with time zone,
        "lockedBy" uuid,
        "metadata" jsonb DEFAULT '{}',
        "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
        "createdBy" uuid NOT NULL,
        "updatedBy" uuid NOT NULL,
        
        CONSTRAINT "PK_account_balances" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_account_period" UNIQUE ("accountId", "periodId"),
        CONSTRAINT "FK_account_balances_account" FOREIGN KEY ("accountId") 
          REFERENCES "chart_of_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // 6. Trial Balance Table
    await queryRunner.query(`
      CREATE TABLE "trial_balances" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "periodId" uuid NOT NULL,
        "accountId" uuid NOT NULL,
        "accountCode" varchar(20) NOT NULL,
        "accountName" varchar(255) NOT NULL,
        "accountType" "account_type_enum" NOT NULL,
        "debitBalance" decimal(19,4) NOT NULL DEFAULT 0,
        "creditBalance" decimal(19,4) NOT NULL DEFAULT 0,
        "functionalDebitBalance" decimal(19,4) NOT NULL DEFAULT 0,
        "functionalCreditBalance" decimal(19,4) NOT NULL DEFAULT 0,
        "previousPeriodBalance" decimal(19,4) DEFAULT 0,
        "movementDebit" decimal(19,4) NOT NULL DEFAULT 0,
        "movementCredit" decimal(19,4) NOT NULL DEFAULT 0,
        "adjustmentDebit" decimal(19,4) DEFAULT 0,
        "adjustmentCredit" decimal(19,4) DEFAULT 0,
        "companyId" uuid NOT NULL,
        "departmentId" uuid,
        "costCenterId" uuid,
        "currencyCode" varchar(3) NOT NULL DEFAULT 'USD',
        "isAdjusted" boolean NOT NULL DEFAULT false,
        "isClosed" boolean NOT NULL DEFAULT false,
        "closingDate" timestamp with time zone,
        "notes" text,
        "metadata" jsonb DEFAULT '{}',
        "generatedAt" timestamp with time zone NOT NULL DEFAULT now(),
        "generatedBy" uuid NOT NULL,
        "lastRecalculated" timestamp with time zone,
        
        CONSTRAINT "PK_trial_balances" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_trial_balance_account_period" UNIQUE ("accountId", "periodId"),
        CONSTRAINT "FK_trial_balances_account" FOREIGN KEY ("accountId") 
          REFERENCES "chart_of_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // 7. Payment Transactions Table
    await queryRunner.query(`
      CREATE TABLE "payment_transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "transactionNumber" varchar(50) NOT NULL,
        "type" varchar(20) NOT NULL CHECK ("type" IN ('PAYMENT', 'RECEIPT', 'TRANSFER', 'REFUND')),
        "status" "payment_status_enum" NOT NULL DEFAULT 'PENDING',
        "paymentMethod" "payment_method_enum" NOT NULL,
        "amount" decimal(19,4) NOT NULL,
        "currencyCode" varchar(3) NOT NULL DEFAULT 'USD',
        "exchangeRate" decimal(10,6) DEFAULT 1.000000,
        "functionalAmount" decimal(19,4) NOT NULL,
        "description" text NOT NULL,
        "reference" varchar(100),
        "paymentDate" date NOT NULL,
        "valueDate" date,
        "dueDate" date,
        "payerName" varchar(255) NOT NULL,
        "payerAccountNumber" varchar(50),
        "payerBankCode" varchar(20),
        "payeeId" uuid,
        "payeeType" varchar(20) CHECK ("payeeType" IN ('CUSTOMER', 'VENDOR', 'EMPLOYEE', 'BANK', 'OTHER')),
        "payeeName" varchar(255) NOT NULL,
        "payeeAccountNumber" varchar(50),
        "payeeBankCode" varchar(20),
        "bankAccountId" uuid NOT NULL,
        "bankTransactionId" varchar(100),
        "journalEntryId" uuid,
        "invoiceId" uuid,
        "companyId" uuid NOT NULL,
        "departmentId" uuid,
        "projectId" uuid,
        "fees" decimal(19,4) DEFAULT 0,
        "taxes" decimal(19,4) DEFAULT 0,
        "discountAmount" decimal(19,4) DEFAULT 0,
        "netAmount" decimal(19,4) NOT NULL,
        "reconciliationStatus" varchar(20) DEFAULT 'UNRECONCILED',
        "reconciledDate" timestamp with time zone,
        "reconciledBy" uuid,
        "batchId" varchar(50),
        "externalTransactionId" varchar(100),
        "processingNotes" text,
        "metadata" jsonb DEFAULT '{}',
        "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
        "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
        "createdBy" uuid NOT NULL,
        "updatedBy" uuid NOT NULL,
        "processedAt" timestamp with time zone,
        "processedBy" uuid,
        
        CONSTRAINT "PK_payment_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_transaction_number_company" UNIQUE ("transactionNumber", "companyId"),
        CONSTRAINT "CHK_amount_positive" CHECK ("amount" > 0),
        CONSTRAINT "FK_payment_transactions_journal" FOREIGN KEY ("journalEntryId") 
          REFERENCES "journal_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    // Create indexes for optimal performance
    await this.createIndexes(queryRunner);

    // Create triggers for audit and automation
    await this.createTriggers(queryRunner);

    // Create views for common queries
    await this.createViews(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop views
    await queryRunner.query(`DROP VIEW IF EXISTS "v_account_hierarchy"`);
    await queryRunner.query(`DROP VIEW IF EXISTS "v_journal_summary"`);
    await queryRunner.query(`DROP VIEW IF EXISTS "v_account_balances_summary"`);
    await queryRunner.query(`DROP VIEW IF EXISTS "v_payment_summary"`);

    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS tr_update_journal_totals ON "journal_lines"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS tr_update_account_balance ON "journal_lines"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS tr_audit_journal_entries ON "journal_entries"`);

    // Drop functions
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_journal_totals()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_account_balance()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS audit_journal_changes()`);

    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_transactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "trial_balances"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "account_balances"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "posting_rules"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "journal_lines"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "journal_entries"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "chart_of_accounts"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_method_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "journal_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "account_subtype_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "account_type_enum"`);
  }

  private async createIndexes(queryRunner: QueryRunner): Promise<void> {
    // Chart of Accounts indexes
    await queryRunner.query(`CREATE INDEX "IDX_coa_account_code" ON "chart_of_accounts" ("accountCode")`);
    await queryRunner.query(`CREATE INDEX "IDX_coa_company" ON "chart_of_accounts" ("companyId")`);
    await queryRunner.query(`CREATE INDEX "IDX_coa_parent" ON "chart_of_accounts" ("parentAccountId")`);
    await queryRunner.query(`CREATE INDEX "IDX_coa_type" ON "chart_of_accounts" ("accountType")`);
    await queryRunner.query(`CREATE INDEX "IDX_coa_active" ON "chart_of_accounts" ("isActive")`);
    await queryRunner.query(`CREATE INDEX "IDX_coa_path" ON "chart_of_accounts" USING gin ("path" gin_trgm_ops)`);

    // Journal Entries indexes
    await queryRunner.query(`CREATE INDEX "IDX_je_number" ON "journal_entries" ("journalNumber")`);
    await queryRunner.query(`CREATE INDEX "IDX_je_date" ON "journal_entries" ("date")`);
    await queryRunner.query(`CREATE INDEX "IDX_je_status" ON "journal_entries" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_je_company" ON "journal_entries" ("companyId")`);
    await queryRunner.query(`CREATE INDEX "IDX_je_period" ON "journal_entries" ("periodId")`);
    await queryRunner.query(`CREATE INDEX "IDX_je_source" ON "journal_entries" ("sourceLedger")`);
    await queryRunner.query(`CREATE INDEX "IDX_je_posted" ON "journal_entries" ("postedAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_je_reference" ON "journal_entries" ("reference")`);

    // Journal Lines indexes
    await queryRunner.query(`CREATE INDEX "IDX_jl_entry" ON "journal_lines" ("journalEntryId")`);
    await queryRunner.query(`CREATE INDEX "IDX_jl_account" ON "journal_lines" ("accountId")`);
    await queryRunner.query(`CREATE INDEX "IDX_jl_debit_amount" ON "journal_lines" ("debitAmount")`);
    await queryRunner.query(`CREATE INDEX "IDX_jl_credit_amount" ON "journal_lines" ("creditAmount")`);
    await queryRunner.query(`CREATE INDEX "IDX_jl_department" ON "journal_lines" ("departmentId")`);
    await queryRunner.query(`CREATE INDEX "IDX_jl_project" ON "journal_lines" ("projectId")`);

    // Account Balances indexes
    await queryRunner.query(`CREATE INDEX "IDX_ab_account" ON "account_balances" ("accountId")`);
    await queryRunner.query(`CREATE INDEX "IDX_ab_period" ON "account_balances" ("periodId")`);
    await queryRunner.query(`CREATE INDEX "IDX_ab_company" ON "account_balances" ("companyId")`);
    await queryRunner.query(`CREATE INDEX "IDX_ab_reconciliation" ON "account_balances" ("reconciliationStatus")`);

    // Trial Balance indexes
    await queryRunner.query(`CREATE INDEX "IDX_tb_period" ON "trial_balances" ("periodId")`);
    await queryRunner.query(`CREATE INDEX "IDX_tb_account" ON "trial_balances" ("accountId")`);
    await queryRunner.query(`CREATE INDEX "IDX_tb_company" ON "trial_balances" ("companyId")`);
    await queryRunner.query(`CREATE INDEX "IDX_tb_account_type" ON "trial_balances" ("accountType")`);

    // Payment Transactions indexes
    await queryRunner.query(`CREATE INDEX "IDX_pt_number" ON "payment_transactions" ("transactionNumber")`);
    await queryRunner.query(`CREATE INDEX "IDX_pt_date" ON "payment_transactions" ("paymentDate")`);
    await queryRunner.query(`CREATE INDEX "IDX_pt_status" ON "payment_transactions" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_pt_type" ON "payment_transactions" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_pt_method" ON "payment_transactions" ("paymentMethod")`);
    await queryRunner.query(`CREATE INDEX "IDX_pt_company" ON "payment_transactions" ("companyId")`);
    await queryRunner.query(`CREATE INDEX "IDX_pt_payee" ON "payment_transactions" ("payeeId", "payeeType")`);
    await queryRunner.query(`CREATE INDEX "IDX_pt_amount" ON "payment_transactions" ("amount")`);
    await queryRunner.query(`CREATE INDEX "IDX_pt_reconciliation" ON "payment_transactions" ("reconciliationStatus")`);

    // Posting Rules indexes
    await queryRunner.query(`CREATE INDEX "IDX_pr_code" ON "posting_rules" ("ruleCode")`);
    await queryRunner.query(`CREATE INDEX "IDX_pr_source" ON "posting_rules" ("sourceSystem")`);
    await queryRunner.query(`CREATE INDEX "IDX_pr_transaction_type" ON "posting_rules" ("transactionType")`);
    await queryRunner.query(`CREATE INDEX "IDX_pr_active" ON "posting_rules" ("isActive")`);
    await queryRunner.query(`CREATE INDEX "IDX_pr_company" ON "posting_rules" ("companyId")`);
    await queryRunner.query(`CREATE INDEX "IDX_pr_valid_dates" ON "posting_rules" ("validFrom", "validTo")`);

    // Full-text search indexes
    await queryRunner.query(`CREATE INDEX "IDX_je_description_fts" ON "journal_entries" USING gin (to_tsvector('english', "description"))`);
    await queryRunner.query(`CREATE INDEX "IDX_coa_name_fts" ON "chart_of_accounts" USING gin (to_tsvector('english', "accountName"))`);
    await queryRunner.query(`CREATE INDEX "IDX_pt_description_fts" ON "payment_transactions" USING gin (to_tsvector('english', "description"))`);

    // Composite indexes for common query patterns
    await queryRunner.query(`CREATE INDEX "IDX_je_company_date_status" ON "journal_entries" ("companyId", "date", "status")`);
    await queryRunner.query(`CREATE INDEX "IDX_jl_account_date" ON "journal_lines" ("accountId", (SELECT "date" FROM "journal_entries" WHERE "id" = "journalEntryId"))`);
    await queryRunner.query(`CREATE INDEX "IDX_ab_account_period_company" ON "account_balances" ("accountId", "periodId", "companyId")`);
  }

  private async createTriggers(queryRunner: QueryRunner): Promise<void> {
    // Function to update journal entry totals
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_journal_totals()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE journal_entries SET
          "totalDebit" = (
            SELECT COALESCE(SUM("debitAmount"), 0)
            FROM journal_lines
            WHERE "journalEntryId" = COALESCE(NEW."journalEntryId", OLD."journalEntryId")
          ),
          "totalCredit" = (
            SELECT COALESCE(SUM("creditAmount"), 0)
            FROM journal_lines
            WHERE "journalEntryId" = COALESCE(NEW."journalEntryId", OLD."journalEntryId")
          ),
          "isBalanced" = (
            SELECT COALESCE(SUM("debitAmount"), 0) = COALESCE(SUM("creditAmount"), 0)
            FROM journal_lines
            WHERE "journalEntryId" = COALESCE(NEW."journalEntryId", OLD."journalEntryId")
          ),
          "updatedAt" = now()
        WHERE id = COALESCE(NEW."journalEntryId", OLD."journalEntryId");
        
        RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
      CREATE TRIGGER tr_update_journal_totals
      AFTER INSERT OR UPDATE OR DELETE ON journal_lines
      FOR EACH ROW EXECUTE FUNCTION update_journal_totals();
    `);

    // Function for audit logging
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION audit_journal_changes()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'UPDATE' AND OLD."status" != NEW."status" THEN
          INSERT INTO audit_log (
            table_name, record_id, operation, old_values, new_values,
            changed_by, changed_at
          ) VALUES (
            TG_TABLE_NAME, NEW.id, 'STATUS_CHANGE',
            jsonb_build_object('status', OLD."status"),
            jsonb_build_object('status', NEW."status"),
            NEW."updatedBy", now()
          );
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  private async createViews(queryRunner: QueryRunner): Promise<void> {
    // Account hierarchy view
    await queryRunner.query(`
      CREATE VIEW v_account_hierarchy AS
      WITH RECURSIVE account_tree AS (
        SELECT 
          id, "accountCode", "accountName", "accountType", "parentAccountId",
          "level", "path", 1 as depth, 
          "accountCode" as full_path
        FROM chart_of_accounts
        WHERE "parentAccountId" IS NULL AND "isActive" = true
        
        UNION ALL
        
        SELECT 
          c.id, c."accountCode", c."accountName", c."accountType", c."parentAccountId",
          c."level", c."path", at.depth + 1,
          at.full_path || ' > ' || c."accountCode"
        FROM chart_of_accounts c
        JOIN account_tree at ON c."parentAccountId" = at.id
        WHERE c."isActive" = true
      )
      SELECT * FROM account_tree;
    `);

    // Journal summary view
    await queryRunner.query(`
      CREATE VIEW v_journal_summary AS
      SELECT 
        je."id",
        je."journalNumber",
        je."date",
        je."description",
        je."status",
        je."totalDebit",
        je."totalCredit",
        je."companyId",
        COUNT(jl.id) as line_count,
        STRING_AGG(DISTINCT coa."accountName", ', ' ORDER BY coa."accountName") as accounts_affected
      FROM journal_entries je
      LEFT JOIN journal_lines jl ON je.id = jl."journalEntryId"
      LEFT JOIN chart_of_accounts coa ON jl."accountId" = coa.id
      GROUP BY je."id", je."journalNumber", je."date", je."description", 
               je."status", je."totalDebit", je."totalCredit", je."companyId";
    `);

    // Account balance summary view
    await queryRunner.query(`
      CREATE VIEW v_account_balances_summary AS
      SELECT 
        coa."id" as account_id,
        coa."accountCode",
        coa."accountName",
        coa."accountType",
        ab."periodId",
        ab."openingBalance",
        ab."debitMovements",
        ab."creditMovements",
        ab."closingBalance",
        ab."reconciliationStatus",
        ab."companyId"
      FROM chart_of_accounts coa
      LEFT JOIN account_balances ab ON coa.id = ab."accountId"
      WHERE coa."isActive" = true;
    `);
  }
}
