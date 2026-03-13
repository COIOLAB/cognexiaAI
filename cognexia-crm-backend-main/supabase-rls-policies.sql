-- =====================================================
-- CRM MODULE - ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- This script enables RLS and creates tenant isolation policies
-- for all CRM tables in Supabase PostgreSQL database
-- =====================================================

-- Enable RLS on all CRM tables
ALTER TABLE crm_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_email_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_slas ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_knowledge_base_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_sales_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_sales_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_price_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_business_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_customer_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_customer_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_customer_digital_twins ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_holographic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_sequence_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_erp_field_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_erp_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_data_migration_jobs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTION: Get current user's tenant/organization ID
-- =====================================================
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  -- Get tenant ID from JWT claim or session variable
  RETURN COALESCE(
    current_setting('app.current_tenant_id', true)::UUID,
    (current_setting('request.jwt.claims', true)::json->>'tenant_id')::UUID,
    (current_setting('request.jwt.claims', true)::json->>'organizationId')::UUID
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TENANT ISOLATION POLICIES
-- =====================================================

-- Customers
DROP POLICY IF EXISTS tenant_isolation_customers ON crm_customers;
CREATE POLICY tenant_isolation_customers ON crm_customers
  USING (organizationId = get_current_tenant_id());

DROP POLICY IF EXISTS tenant_insert_customers ON crm_customers;
CREATE POLICY tenant_insert_customers ON crm_customers
  FOR INSERT WITH CHECK (organizationId = get_current_tenant_id());

-- Leads
DROP POLICY IF EXISTS tenant_isolation_leads ON crm_leads;
CREATE POLICY tenant_isolation_leads ON crm_leads
  USING (organizationId = get_current_tenant_id());

DROP POLICY IF EXISTS tenant_insert_leads ON crm_leads;
CREATE POLICY tenant_insert_leads ON crm_leads
  FOR INSERT WITH CHECK (organizationId = get_current_tenant_id());

-- Opportunities
DROP POLICY IF EXISTS tenant_isolation_opportunities ON crm_opportunities;
CREATE POLICY tenant_isolation_opportunities ON crm_opportunities
  USING (organizationId = get_current_tenant_id());

DROP POLICY IF EXISTS tenant_insert_opportunities ON crm_opportunities;
CREATE POLICY tenant_insert_opportunities ON crm_opportunities
  FOR INSERT WITH CHECK (organizationId = get_current_tenant_id());

-- Contacts
DROP POLICY IF EXISTS tenant_isolation_contacts ON crm_contacts;
CREATE POLICY tenant_isolation_contacts ON crm_contacts
  USING (organizationId = get_current_tenant_id());

DROP POLICY IF EXISTS tenant_insert_contacts ON crm_contacts;
CREATE POLICY tenant_insert_contacts ON crm_contacts
  FOR INSERT WITH CHECK (organizationId = get_current_tenant_id());

-- Tasks
DROP POLICY IF EXISTS tenant_isolation_tasks ON crm_tasks;
CREATE POLICY tenant_isolation_tasks ON crm_tasks
  USING (organizationId = get_current_tenant_id());

-- Activities
DROP POLICY IF EXISTS tenant_isolation_activities ON crm_activities;
CREATE POLICY tenant_isolation_activities ON crm_activities
  USING (organizationId = get_current_tenant_id());

-- Email Campaigns
DROP POLICY IF EXISTS tenant_isolation_email_campaigns ON crm_email_campaigns;
CREATE POLICY tenant_isolation_email_campaigns ON crm_email_campaigns
  USING (organizationId = get_current_tenant_id());

-- Support Tickets
DROP POLICY IF EXISTS tenant_isolation_support_tickets ON crm_support_tickets;
CREATE POLICY tenant_isolation_support_tickets ON crm_support_tickets
  USING (organizationId = get_current_tenant_id());

-- Documents
DROP POLICY IF EXISTS tenant_isolation_documents ON crm_documents;
CREATE POLICY tenant_isolation_documents ON crm_documents
  USING (organizationId = get_current_tenant_id());

-- Forms
DROP POLICY IF EXISTS tenant_isolation_forms ON crm_forms;
CREATE POLICY tenant_isolation_forms ON crm_forms
  USING (organizationId = get_current_tenant_id());

-- Territories
DROP POLICY IF EXISTS tenant_isolation_territories ON crm_territories;
CREATE POLICY tenant_isolation_territories ON crm_territories
  USING (organizationId = get_current_tenant_id());

-- Products
DROP POLICY IF EXISTS tenant_isolation_products ON crm_products;
CREATE POLICY tenant_isolation_products ON crm_products
  USING (organizationId = get_current_tenant_id());

-- Reports
DROP POLICY IF EXISTS tenant_isolation_reports ON crm_reports;
CREATE POLICY tenant_isolation_reports ON crm_reports
  USING (organizationId = get_current_tenant_id());

-- Workflows
DROP POLICY IF EXISTS tenant_isolation_workflows ON crm_workflows;
CREATE POLICY tenant_isolation_workflows ON crm_workflows
  USING (organizationId = get_current_tenant_id());

-- Security Audit Logs
DROP POLICY IF EXISTS tenant_isolation_security_audit_logs ON crm_security_audit_logs;
CREATE POLICY tenant_isolation_security_audit_logs ON crm_security_audit_logs
  USING (organizationId = get_current_tenant_id());

-- ERP Field Mappings
DROP POLICY IF EXISTS tenant_isolation_erp_mappings ON crm_erp_field_mappings;
CREATE POLICY tenant_isolation_erp_mappings ON crm_erp_field_mappings
  USING (organizationId = get_current_tenant_id());

-- ERP Connections
DROP POLICY IF EXISTS tenant_isolation_erp_connections ON crm_erp_connections;
CREATE POLICY tenant_isolation_erp_connections ON crm_erp_connections
  USING (organizationId = get_current_tenant_id());

-- Data Migration Jobs
DROP POLICY IF EXISTS tenant_isolation_migration_jobs ON crm_data_migration_jobs;
CREATE POLICY tenant_isolation_migration_jobs ON crm_data_migration_jobs
  USING (organizationId = get_current_tenant_id());

-- =====================================================
-- ADMIN BYPASS POLICIES (for super admins)
-- =====================================================
-- Allow super admins to bypass tenant isolation

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'is_super_admin')::BOOLEAN,
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example admin bypass for customers
DROP POLICY IF EXISTS admin_all_access_customers ON crm_customers;
CREATE POLICY admin_all_access_customers ON crm_customers
  USING (is_super_admin());

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
-- Create indexes on organizationId for all tables

CREATE INDEX IF NOT EXISTS idx_customers_org_id ON crm_customers(organizationId);
CREATE INDEX IF NOT EXISTS idx_leads_org_id ON crm_leads(organizationId);
CREATE INDEX IF NOT EXISTS idx_opportunities_org_id ON crm_opportunities(organizationId);
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON crm_contacts(organizationId);
CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON crm_tasks(organizationId);
CREATE INDEX IF NOT EXISTS idx_activities_org_id ON crm_activities(organizationId);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_org_id ON crm_email_campaigns(organizationId);
CREATE INDEX IF NOT EXISTS idx_support_tickets_org_id ON crm_support_tickets(organizationId);
CREATE INDEX IF NOT EXISTS idx_documents_org_id ON crm_documents(organizationId);
CREATE INDEX IF NOT EXISTS idx_forms_org_id ON crm_forms(organizationId);
CREATE INDEX IF NOT EXISTS idx_territories_org_id ON crm_territories(organizationId);
CREATE INDEX IF NOT EXISTS idx_products_org_id ON crm_products(organizationId);
CREATE INDEX IF NOT EXISTS idx_reports_org_id ON crm_reports(organizationId);
CREATE INDEX IF NOT EXISTS idx_workflows_org_id ON crm_workflows(organizationId);
CREATE INDEX IF NOT EXISTS idx_erp_mappings_org_id ON crm_erp_field_mappings(organizationId);
CREATE INDEX IF NOT EXISTS idx_erp_connections_org_id ON crm_erp_connections(organizationId);
CREATE INDEX IF NOT EXISTS idx_migration_jobs_org_id ON crm_data_migration_jobs(organizationId);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify RLS is working:

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'crm_%';

-- Check policies
-- SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename LIKE 'crm_%';

-- Test tenant isolation (as user)
-- SET app.current_tenant_id = 'YOUR_TENANT_UUID';
-- SELECT * FROM crm_customers; -- Should only see this tenant's data
