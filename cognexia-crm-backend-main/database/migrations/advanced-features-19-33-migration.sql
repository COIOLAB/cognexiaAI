-- ========================================
-- ADVANCED SUPER ADMIN FEATURES 19-33
-- Database Migration Script
-- Date: 2026-01-27
-- ========================================

-- Feature 19: AI-Powered Predictive Analytics
CREATE TABLE IF NOT EXISTS churn_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID REFERENCES organizations(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL,
  churn_probability DECIMAL(5,2) NOT NULL CHECK (churn_probability >= 0 AND churn_probability <= 100),
  churn_risk_level VARCHAR(20) NOT NULL CHECK (churn_risk_level IN ('low', 'medium', 'high', 'critical')),
  predicted_churn_date DATE,
  risk_factors JSON,
  retention_recommendations JSON,
  model_version VARCHAR(50) NOT NULL,
  confidence_score DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_churn_org_date ON churn_predictions(organizationId, prediction_date);
CREATE INDEX IF NOT EXISTS idx_churn_risk ON churn_predictions(churn_risk_level);

CREATE TABLE IF NOT EXISTS revenue_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_date DATE NOT NULL,
  forecast_type VARCHAR(20) NOT NULL CHECK (forecast_type IN ('mrr', 'arr', 'expansion', 'contraction')),
  forecasted_amount DECIMAL(12,2) NOT NULL,
  confidence_interval_lower DECIMAL(12,2) NOT NULL,
  confidence_interval_upper DECIMAL(12,2) NOT NULL,
  actual_amount DECIMAL(12,2),
  forecast_accuracy DECIMAL(5,2),
  contributing_factors JSON,
  model_version VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forecast_date_type ON revenue_forecasts(forecast_date, forecast_type);

-- Feature 20: Smart Recommendation Engine
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID REFERENCES organizations(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  expected_impact TEXT,
  confidence_score DECIMAL(5,2) NOT NULL,
  action_items JSON,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed', 'completed')),
  dismissed_reason TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rec_org_status ON recommendations(organizationId, status);
CREATE INDEX IF NOT EXISTS idx_rec_type_priority ON recommendations(recommendation_type, priority);

-- Feature 21: Natural Language Query
CREATE TABLE IF NOT EXISTS natural_language_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  query_text TEXT NOT NULL,
  generated_sql TEXT,
  query_interpretation TEXT,
  results JSON,
  result_count INT DEFAULT 0,
  execution_time_ms INT NOT NULL,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  query_type VARCHAR(20) DEFAULT 'query',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nlq_user_date ON natural_language_queries(user_id, created_at);

-- Feature 22: Anomaly Detection
CREATE TABLE IF NOT EXISTS anomaly_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID REFERENCES organizations(id) ON DELETE SET NULL,
  anomaly_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  expected_value DECIMAL(15,2) NOT NULL,
  actual_value DECIMAL(15,2) NOT NULL,
  deviation_percentage DECIMAL(5,2) NOT NULL,
  context_data JSON,
  auto_resolved BOOLEAN DEFAULT FALSE,
  resolution_action TEXT,
  status VARCHAR(20) DEFAULT 'detected' CHECK (status IN ('detected', 'investigating', 'resolved', 'false_positive')),
  resolved_at TIMESTAMP,
  resolved_by UUID,
  detected_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anomaly_org_date ON anomaly_detections(organizationId, detected_at);
CREATE INDEX IF NOT EXISTS idx_anomaly_type_severity ON anomaly_detections(anomaly_type, severity);
CREATE INDEX IF NOT EXISTS idx_anomaly_status ON anomaly_detections(status);

-- Feature 24: Database Management Console
CREATE TABLE IF NOT EXISTS database_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  executed_by UUID NOT NULL,
  query_type VARCHAR(20) NOT NULL,
  query_text TEXT NOT NULL,
  affected_tables JSON NOT NULL,
  rows_affected INT,
  execution_time_ms INT NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'cancelled')),
  error_message TEXT,
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_by UUID,
  approved_at TIMESTAMP,
  executed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dbq_user_date ON database_queries(executed_by, executed_at);
CREATE INDEX IF NOT EXISTS idx_dbq_type_status ON database_queries(query_type, status);

-- Feature 25: Advanced Audit & Compliance
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email VARCHAR(255),
  organizationId UUID,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  changes JSON,
  metadata JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'partial')),
  error_message TEXT,
  request_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user_date ON audit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_action_date ON audit_logs(action, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_ip ON audit_logs(ip_address);

-- Feature 26: Performance Monitoring
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100) NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  metric_value DECIMAL(15,2) NOT NULL,
  unit VARCHAR(20),
  organizationId UUID,
  endpoint VARCHAR(255),
  additional_tags JSON,
  recorded_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_perf_name_date ON performance_metrics(metric_name, recorded_at);
CREATE INDEX IF NOT EXISTS idx_perf_org_date ON performance_metrics(organizationId, recorded_at);

-- Feature 27: Disaster Recovery
CREATE TABLE IF NOT EXISTS backup_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type VARCHAR(50) NOT NULL CHECK (backup_type IN ('full', 'incremental', 'differential')),
  backup_location VARCHAR(255) NOT NULL,
  backup_size_mb DECIMAL(12,2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'verified')),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_seconds INT,
  error_message TEXT,
  verification_status VARCHAR(20) CHECK (verification_status IN ('passed', 'failed', 'pending')),
  retention_until DATE NOT NULL,
  is_encrypted BOOLEAN DEFAULT TRUE,
  initiated_by UUID,
  metadata JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_backup_status_date ON backup_jobs(status, started_at);
CREATE INDEX IF NOT EXISTS idx_backup_type_date ON backup_jobs(backup_type, created_at);

-- Feature 28: Advanced Financial Analytics
CREATE TABLE IF NOT EXISTS financial_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_month DATE NOT NULL,
  cohort_type VARCHAR(50) NOT NULL,
  cohort_name VARCHAR(100) NOT NULL,
  initial_customers INT NOT NULL,
  current_customers INT NOT NULL,
  initial_mrr DECIMAL(12,2) NOT NULL,
  current_mrr DECIMAL(12,2) NOT NULL,
  expansion_revenue DECIMAL(12,2) NOT NULL,
  contraction_revenue DECIMAL(12,2) NOT NULL,
  churned_revenue DECIMAL(12,2) NOT NULL,
  retention_rate DECIMAL(5,2) NOT NULL,
  ltv DECIMAL(12,2),
  cac DECIMAL(12,2),
  monthly_breakdown JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cohort_month_type ON financial_cohorts(cohort_month, cohort_type);

-- Feature 29: Invoice & Payment Management
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  organizationId UUID REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled', 'refunded')),
  payment_method VARCHAR(50),
  payment_date TIMESTAMP,
  line_items JSON NOT NULL,
  notes TEXT,
  pdf_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_org_date ON invoices(organizationId, invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoice_status_due ON invoices(status, due_date);

-- Feature 30: Customer Success Platform
CREATE TABLE IF NOT EXISTS customer_success_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID REFERENCES organizations(id) ON DELETE CASCADE,
  milestone_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'skipped')),
  completion_percentage INT DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  checklist_items JSON,
  assigned_csm UUID,
  completed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestone_org_status ON customer_success_milestones(organizationId, status);
CREATE INDEX IF NOT EXISTS idx_milestone_type_completed ON customer_success_milestones(milestone_type, completed_at);

-- Feature 31: Advanced Support Analytics
CREATE TABLE IF NOT EXISTS support_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID,
  date DATE NOT NULL,
  total_tickets INT DEFAULT 0,
  tickets_created INT DEFAULT 0,
  tickets_resolved INT DEFAULT 0,
  tickets_escalated INT DEFAULT 0,
  avg_first_response_time_minutes INT,
  avg_resolution_time_minutes INT,
  csat_score DECIMAL(3,2),
  csat_responses INT DEFAULT 0,
  sentiment_breakdown JSON,
  top_categories JSON,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_org_date ON support_analytics(organizationId, date);
CREATE INDEX IF NOT EXISTS idx_support_date ON support_analytics(date);

-- Feature 32: Developer Portal
CREATE TABLE IF NOT EXISTS sandbox_environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizationId UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) UNIQUE NOT NULL,
  sandbox_url VARCHAR(500) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  data_seed_status VARCHAR(20) DEFAULT 'none' CHECK (data_seed_status IN ('none', 'seeding', 'completed', 'failed')),
  storage_used_mb DECIMAL(12,2) DEFAULT 0,
  api_calls_count INT DEFAULT 0,
  last_accessed_at TIMESTAMP,
  expires_at TIMESTAMP,
  auto_reset BOOLEAN DEFAULT FALSE,
  configuration JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sandbox_org_status ON sandbox_environments(organizationId, status);

-- Feature 33: Release Management
CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_number VARCHAR(50) UNIQUE NOT NULL,
  environment VARCHAR(50) NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
  version_tag VARCHAR(100) NOT NULL,
  git_commit_sha VARCHAR(40) NOT NULL,
  deployment_strategy VARCHAR(50) NOT NULL CHECK (deployment_strategy IN ('rolling', 'blue_green', 'canary', 'recreate')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'rolled_back')),
  rollout_percentage INT DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  deployed_by UUID NOT NULL,
  approved_by UUID,
  deployed_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  duration_seconds INT,
  changes JSON,
  health_check_status VARCHAR(20) CHECK (health_check_status IN ('passed', 'failed', 'warning')),
  error_message TEXT,
  release_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deploy_env_date ON deployments(environment, deployed_at);
CREATE INDEX IF NOT EXISTS idx_deploy_status_date ON deployments(status, deployed_at);

-- Create or replace update trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_churn_predictions_modtime') THEN
        CREATE TRIGGER update_churn_predictions_modtime BEFORE UPDATE ON churn_predictions FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_revenue_forecasts_modtime') THEN
        CREATE TRIGGER update_revenue_forecasts_modtime BEFORE UPDATE ON revenue_forecasts FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_recommendations_modtime') THEN
        CREATE TRIGGER update_recommendations_modtime BEFORE UPDATE ON recommendations FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_anomaly_detections_modtime') THEN
        CREATE TRIGGER update_anomaly_detections_modtime BEFORE UPDATE ON anomaly_detections FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_backup_jobs_modtime') THEN
        CREATE TRIGGER update_backup_jobs_modtime BEFORE UPDATE ON backup_jobs FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_financial_cohorts_modtime') THEN
        CREATE TRIGGER update_financial_cohorts_modtime BEFORE UPDATE ON financial_cohorts FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_invoices_modtime') THEN
        CREATE TRIGGER update_invoices_modtime BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_customer_success_milestones_modtime') THEN
        CREATE TRIGGER update_customer_success_milestones_modtime BEFORE UPDATE ON customer_success_milestones FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sandbox_environments_modtime') THEN
        CREATE TRIGGER update_sandbox_environments_modtime BEFORE UPDATE ON sandbox_environments FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_deployments_modtime') THEN
        CREATE TRIGGER update_deployments_modtime BEFORE UPDATE ON deployments FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
END$$;

-- Insert initial system configurations (only if not exists)
INSERT INTO system_configurations (key, value, value_type, category, description)
SELECT 'anomaly_detection_enabled', 'true', 'boolean', 'monitoring', 'Enable automatic anomaly detection'
WHERE NOT EXISTS (SELECT 1 FROM system_configurations WHERE key = 'anomaly_detection_enabled');

INSERT INTO system_configurations (key, value, value_type, category, description)
SELECT 'churn_prediction_threshold', '70', 'number', 'ai', 'Churn probability threshold for alerts'
WHERE NOT EXISTS (SELECT 1 FROM system_configurations WHERE key = 'churn_prediction_threshold');

INSERT INTO system_configurations (key, value, value_type, category, description)
SELECT 'backup_retention_days', '90', 'number', 'disaster_recovery', 'Days to retain backups'
WHERE NOT EXISTS (SELECT 1 FROM system_configurations WHERE key = 'backup_retention_days');

INSERT INTO system_configurations (key, value, value_type, category, description)
SELECT 'sandbox_expiration_days', '30', 'number', 'developer', 'Default sandbox expiration'
WHERE NOT EXISTS (SELECT 1 FROM system_configurations WHERE key = 'sandbox_expiration_days');

-- Insert feature flags (only if not exists)
INSERT INTO feature_flags (name, description, enabled, rollout_percentage)
SELECT 'ai_churn_prediction', 'AI-powered churn prediction', TRUE, 100
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE name = 'ai_churn_prediction');

INSERT INTO feature_flags (name, description, enabled, rollout_percentage)
SELECT 'natural_language_query', 'Natural language query interface', TRUE, 50
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE name = 'natural_language_query');

INSERT INTO feature_flags (name, description, enabled, rollout_percentage)
SELECT 'anomaly_detection', 'Real-time anomaly detection', TRUE, 100
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE name = 'anomaly_detection');

INSERT INTO feature_flags (name, description, enabled, rollout_percentage)
SELECT 'advanced_financial_analytics', 'Cohort and LTV analysis', TRUE, 100
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE name = 'advanced_financial_analytics');

INSERT INTO feature_flags (name, description, enabled, rollout_percentage)
SELECT 'developer_sandboxes', 'Developer sandbox environments', TRUE, 100
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE name = 'developer_sandboxes');

-- Verification queries
SELECT 'Migration completed successfully!' AS status;
SELECT COUNT(*) AS total_new_tables FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN (
  'churn_predictions', 'revenue_forecasts', 'recommendations', 'natural_language_queries',
  'anomaly_detections', 'database_queries', 'audit_logs', 'performance_metrics',
  'backup_jobs', 'financial_cohorts', 'invoices', 'customer_success_milestones',
  'support_analytics', 'sandbox_environments', 'deployments'
);
