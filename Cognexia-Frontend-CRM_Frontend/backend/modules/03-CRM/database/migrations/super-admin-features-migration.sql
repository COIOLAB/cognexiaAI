-- ===================================================================
-- SUPER ADMIN PORTAL - 18 FEATURES DATABASE MIGRATION
-- Created: January 2026
-- Description: Complete migration for all 18 super admin features
-- ===================================================================

-- Feature 1: Platform Analytics
CREATE TABLE IF NOT EXISTS platform_analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_date TIMESTAMP NOT NULL,
    total_active_users INTEGER DEFAULT 0,
    total_organizations INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    new_organizations INTEGER DEFAULT 0,
    mrr DECIMAL(12,2) DEFAULT 0,
    arr DECIMAL(12,2) DEFAULT 0,
    churn_rate DECIMAL(5,2) DEFAULT 0,
    organizations_by_tier JSONB,
    api_calls_count BIGINT DEFAULT 0,
    avg_api_response_time INTEGER DEFAULT 0,
    database_metrics JSONB,
    total_storage_usage_gb DECIMAL(12,2) DEFAULT 0,
    active_sessions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_platform_analytics_date ON platform_analytics_snapshots(snapshot_date DESC);

-- Feature 2: Revenue & Billing Management
CREATE TABLE IF NOT EXISTS revenue_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('subscription', 'upgrade', 'downgrade', 'refund', 'payment_failed', 'invoice')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    stripe_payment_id VARCHAR(255),
    stripe_invoice_id VARCHAR(255),
    paypal_transaction_id VARCHAR(255),
    description TEXT,
    metadata JSONB,
    failure_reason TEXT,
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_revenue_transactions_org ON revenue_transactions(organization_id);
CREATE INDEX idx_revenue_transactions_type ON revenue_transactions(type);
CREATE INDEX idx_revenue_transactions_status ON revenue_transactions(status);
CREATE INDEX idx_revenue_transactions_created ON revenue_transactions(created_at DESC);

-- Feature 3: Organization Health Monitoring
CREATE TABLE IF NOT EXISTS organization_health_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL UNIQUE,
    health_score INTEGER DEFAULT 50 CHECK (health_score >= 0 AND health_score <= 100),
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    days_since_last_login INTEGER DEFAULT 0,
    ticket_volume INTEGER DEFAULT 0,
    user_engagement INTEGER DEFAULT 50,
    feature_adoption DECIMAL(5,2) DEFAULT 0,
    failed_payments INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    api_error_rate DECIMAL(5,2) DEFAULT 0,
    indicators JSONB,
    recommendations JSONB,
    last_calculated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_org_health_score ON organization_health_scores(health_score);
CREATE INDEX idx_org_health_risk ON organization_health_scores(risk_level);
CREATE INDEX idx_org_health_org ON organization_health_scores(organization_id);

-- Feature 4: User Impersonation
CREATE TABLE IF NOT EXISTS impersonation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL,
    target_user_id UUID NOT NULL,
    reason TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    ended_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_impersonation_admin ON impersonation_sessions(admin_user_id);
CREATE INDEX idx_impersonation_target ON impersonation_sessions(target_user_id);
CREATE INDEX idx_impersonation_active ON impersonation_sessions(is_active) WHERE is_active = TRUE;

-- Feature 5: Security & Compliance
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('failed_login', 'suspicious_activity', 'data_breach_attempt', 'unauthorized_access', 'password_reset', 'ip_blocked', 'rate_limit_exceeded', 'mfa_bypass_attempt')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    organization_id UUID,
    user_id UUID,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    description TEXT NOT NULL,
    details JSONB,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolved_by UUID,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_org ON security_events(organization_id);
CREATE INDEX idx_security_events_created ON security_events(created_at DESC);
CREATE INDEX idx_security_events_unresolved ON security_events(resolved) WHERE resolved = FALSE;

CREATE TABLE IF NOT EXISTS compliance_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID,
    standard VARCHAR(50) NOT NULL CHECK (standard IN ('GDPR', 'SOC2', 'HIPAA', 'PCI_DSS', 'ISO_27001')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('compliant', 'non_compliant', 'pending', 'unknown')),
    check_date TIMESTAMP NOT NULL,
    results JSONB,
    notes TEXT,
    next_check_date TIMESTAMP,
    auto_check BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_compliance_checks_org ON compliance_checks(organization_id);
CREATE INDEX idx_compliance_checks_standard ON compliance_checks(standard);
CREATE INDEX idx_compliance_checks_status ON compliance_checks(status);

-- Feature 6: Support Ticket Management (Admin-level)
CREATE TABLE IF NOT EXISTS admin_support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    user_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID,
    tags JSONB,
    resolution_time_hours INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_admin_tickets_org ON admin_support_tickets(organization_id);
CREATE INDEX idx_admin_tickets_status ON admin_support_tickets(status);
CREATE INDEX idx_admin_tickets_priority ON admin_support_tickets(priority);
CREATE INDEX idx_admin_tickets_assigned ON admin_support_tickets(assigned_to);

-- Feature 7: System Configuration
CREATE TABLE IF NOT EXISTS system_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_config_key ON system_configurations(key);
CREATE INDEX idx_system_config_category ON system_configurations(category);

CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT FALSE,
    rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    description TEXT,
    target_organizations JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feature_flags_name ON feature_flags(name);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(enabled) WHERE enabled = TRUE;

-- Feature 8: Communication Center
CREATE TABLE IF NOT EXISTS platform_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'urgent')),
    target_type VARCHAR(20) DEFAULT 'all' CHECK (target_type IN ('all', 'tier', 'specific')),
    target_organizations JSONB,
    target_tier VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_announcements_active ON platform_announcements(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_announcements_type ON platform_announcements(type);

-- Feature 9: Automation Workflows
CREATE TABLE IF NOT EXISTS automation_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger JSONB NOT NULL,
    actions JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disabled')),
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflows_status ON automation_workflows(status);
CREATE INDEX idx_workflows_name ON automation_workflows(name);

-- Feature 10: Custom Reporting
CREATE TABLE IF NOT EXISTS custom_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    query JSONB NOT NULL,
    created_by UUID NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    schedule JSONB,
    run_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_custom_reports_created_by ON custom_reports(created_by);
CREATE INDEX idx_custom_reports_public ON custom_reports(is_public) WHERE is_public = TRUE;

-- Feature 11: Onboarding & Migration
CREATE TABLE IF NOT EXISTS onboarding_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    tasks JSONB NOT NULL,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_onboarding_org ON onboarding_checklists(organization_id);
CREATE INDEX idx_onboarding_completion ON onboarding_checklists(completion_percentage);

-- Feature 12: KPI & Goal Tracking
CREATE TABLE IF NOT EXISTS kpi_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_value DECIMAL(12,2) NOT NULL,
    current_value DECIMAL(12,2) DEFAULT 0,
    period VARCHAR(20) NOT NULL CHECK (period IN ('monthly', 'quarterly', 'yearly')),
    unit VARCHAR(50) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kpi_goals_active ON kpi_goals(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_kpi_goals_period ON kpi_goals(period);
CREATE INDEX idx_kpi_goals_dates ON kpi_goals(start_date, end_date);

-- Feature 13: A/B Testing
CREATE TABLE IF NOT EXISTS ab_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    variants JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'paused')),
    metrics JSONB,
    results JSONB,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ab_tests_status ON ab_tests(status);
CREATE INDEX idx_ab_tests_name ON ab_tests(name);

-- Feature 14: API Management
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    key VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    permissions JSONB,
    rate_limit INTEGER DEFAULT 1000,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX idx_api_keys_key ON api_keys(key);
CREATE INDEX idx_api_keys_active ON api_keys(is_active) WHERE is_active = TRUE;

-- Feature 15: Mobile Admin Support
CREATE TABLE IF NOT EXISTS push_notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_push_templates_active ON push_notification_templates(is_active) WHERE is_active = TRUE;

-- Feature 16: White-Label Management
CREATE TABLE IF NOT EXISTS white_label_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL UNIQUE,
    custom_domain VARCHAR(255),
    logo_url VARCHAR(500),
    favicon_url VARCHAR(500),
    color_scheme JSONB,
    company_name VARCHAR(255),
    email_templates JSONB,
    sso_enabled BOOLEAN DEFAULT FALSE,
    sso_config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE INDEX idx_white_label_org ON white_label_configs(organization_id);
CREATE INDEX idx_white_label_domain ON white_label_configs(custom_domain);

-- Create trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_platform_analytics_updated_at BEFORE UPDATE ON platform_analytics_snapshots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_revenue_transactions_updated_at BEFORE UPDATE ON revenue_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organization_health_updated_at BEFORE UPDATE ON organization_health_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_checks_updated_at BEFORE UPDATE ON compliance_checks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_tickets_updated_at BEFORE UPDATE ON admin_support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON platform_announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON automation_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_reports_updated_at BEFORE UPDATE ON custom_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_onboarding_updated_at BEFORE UPDATE ON onboarding_checklists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kpi_goals_updated_at BEFORE UPDATE ON kpi_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ab_tests_updated_at BEFORE UPDATE ON ab_tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_push_templates_updated_at BEFORE UPDATE ON push_notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_white_label_updated_at BEFORE UPDATE ON white_label_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial system configurations
INSERT INTO system_configurations (key, value, category, description) VALUES
('maintenance_mode', 'false', 'system', 'Enable/disable maintenance mode'),
('api_rate_limit_default', '1000', 'api', 'Default API rate limit per hour'),
('max_upload_size_mb', '100', 'storage', 'Maximum file upload size in MB'),
('session_timeout_minutes', '60', 'security', 'Session timeout in minutes'),
('password_min_length', '8', 'security', 'Minimum password length');

-- Insert initial feature flags
INSERT INTO feature_flags (name, enabled, rollout_percentage, description) VALUES
('ai_insights', true, 100, 'AI-powered insights and recommendations'),
('advanced_reporting', true, 100, 'Advanced custom reporting engine'),
('automation_workflows', true, 100, 'Automation workflows builder'),
('white_label', false, 0, 'White-label customization'),
('mobile_app', true, 100, 'Mobile app access');

-- ===================================================================
-- END OF MIGRATION
-- ===================================================================
