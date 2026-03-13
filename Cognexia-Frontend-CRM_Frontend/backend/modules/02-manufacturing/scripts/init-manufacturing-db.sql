-- Industry 5.0 Manufacturing Database Initialization Script
-- This script sets up the basic database structure and extensions

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Create database users if they don't exist
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'manufacturing_app_user') THEN
      CREATE ROLE manufacturing_app_user LOGIN PASSWORD 'app_user_password';
   END IF;
   
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'manufacturing_read_user') THEN
      CREATE ROLE manufacturing_read_user LOGIN PASSWORD 'read_user_password';
   END IF;
END
$do$;

-- Grant necessary permissions
GRANT CONNECT ON DATABASE industry5_manufacturing TO manufacturing_app_user;
GRANT CONNECT ON DATABASE industry5_manufacturing TO manufacturing_read_user;

-- Create schemas for different manufacturing domains
CREATE SCHEMA IF NOT EXISTS manufacturing;
CREATE SCHEMA IF NOT EXISTS iot_data;
CREATE SCHEMA IF NOT EXISTS quality_control;
CREATE SCHEMA IF NOT EXISTS maintenance;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Grant schema permissions
GRANT USAGE ON SCHEMA manufacturing TO manufacturing_app_user, manufacturing_read_user;
GRANT USAGE ON SCHEMA iot_data TO manufacturing_app_user, manufacturing_read_user;
GRANT USAGE ON SCHEMA quality_control TO manufacturing_app_user, manufacturing_read_user;
GRANT USAGE ON SCHEMA maintenance TO manufacturing_app_user, manufacturing_read_user;
GRANT USAGE ON SCHEMA analytics TO manufacturing_app_user, manufacturing_read_user;

GRANT CREATE ON SCHEMA manufacturing TO manufacturing_app_user;
GRANT CREATE ON SCHEMA iot_data TO manufacturing_app_user;
GRANT CREATE ON SCHEMA quality_control TO manufacturing_app_user;
GRANT CREATE ON SCHEMA maintenance TO manufacturing_app_user;
GRANT CREATE ON SCHEMA analytics TO manufacturing_app_user;

-- Create custom data types for manufacturing
CREATE TYPE IF NOT EXISTS work_center_status AS ENUM (
    'active', 'inactive', 'maintenance', 'breakdown', 'setup', 
    'cleaning', 'calibration', 'validation', 'sterilization', 'sanitization'
);

CREATE TYPE IF NOT EXISTS production_order_status AS ENUM (
    'planned', 'released', 'in_progress', 'paused', 'completed', 
    'partially_completed', 'cancelled', 'on_hold'
);

CREATE TYPE IF NOT EXISTS work_order_status AS ENUM (
    'pending', 'ready', 'in_progress', 'paused', 'completed', 
    'cancelled', 'failed', 'quality_hold'
);

CREATE TYPE IF NOT EXISTS iot_device_status AS ENUM (
    'active', 'inactive', 'maintenance', 'error', 'offline', 'calibrating'
);

CREATE TYPE IF NOT EXISTS quality_check_result AS ENUM (
    'pending', 'passed', 'failed', 'conditional_pass', 'retest_required'
);

-- Create custom functions for manufacturing calculations
CREATE OR REPLACE FUNCTION calculate_oee(
    availability_percent NUMERIC,
    performance_percent NUMERIC,
    quality_percent NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
    RETURN (availability_percent * performance_percent * quality_percent) / 10000;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION calculate_cycle_efficiency(
    actual_cycle_time NUMERIC,
    standard_cycle_time NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
    IF actual_cycle_time <= 0 THEN
        RETURN 0;
    END IF;
    RETURN (standard_cycle_time / actual_cycle_time) * 100;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create audit trigger function
CREATE OR REPLACE FUNCTION manufacturing_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_at = COALESCE(NEW.created_at, NOW());
        NEW.updated_at = NOW();
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.updated_at = NOW();
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create notification function for real-time updates
CREATE OR REPLACE FUNCTION manufacturing_notify_change()
RETURNS TRIGGER AS $$
DECLARE
    payload JSON;
BEGIN
    payload = json_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'data', row_to_json(CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END)
    );
    
    PERFORM pg_notify('manufacturing_changes', payload::text);
    
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for common queries (will be created by TypeORM, but good to have as backup)
-- These will be created after the tables are set up by TypeORM

-- Create partitioning function for time-series data
CREATE OR REPLACE FUNCTION create_monthly_partition(
    table_name TEXT,
    start_date DATE
) RETURNS VOID AS $$
DECLARE
    partition_name TEXT;
    end_date DATE;
BEGIN
    partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
    end_date := start_date + INTERVAL '1 month';
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF %I
                    FOR VALUES FROM (%L) TO (%L)',
                   partition_name, table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;

-- Create performance monitoring views (will be populated after tables exist)
-- These are placeholders that will be updated by the application

-- Insert initial configuration data
INSERT INTO information_schema.sql_features (feature_id, feature_name, sub_feature_id, sub_feature_name, is_supported, comments)
VALUES ('MANUF001', 'Manufacturing Module', '001', 'Work Centers', 'YES', 'Industry 5.0 Work Center Management')
ON CONFLICT DO NOTHING;

-- Log database initialization
INSERT INTO pg_stat_statements_info (dealloc) 
SELECT 0 WHERE NOT EXISTS (SELECT 1 FROM pg_stat_statements_info);

-- Create initial admin settings
CREATE TABLE IF NOT EXISTS manufacturing_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO manufacturing_settings (setting_key, setting_value, setting_type, description) VALUES
('manufacturing.default_timezone', 'UTC', 'string', 'Default timezone for manufacturing operations'),
('manufacturing.default_shift_hours', '8', 'integer', 'Default shift duration in hours'),
('manufacturing.oee_target', '85', 'decimal', 'Target OEE percentage'),
('manufacturing.quality_threshold', '99', 'decimal', 'Minimum quality threshold percentage'),
('manufacturing.maintenance_interval', '30', 'integer', 'Default maintenance interval in days'),
('iot.data_retention_days', '365', 'integer', 'IoT data retention period in days'),
('analytics.batch_size', '1000', 'integer', 'Analytics processing batch size'),
('alerts.enabled', 'true', 'boolean', 'Enable manufacturing alerts'),
('digital_twin.sync_interval', '60', 'integer', 'Digital twin synchronization interval in seconds')
ON CONFLICT (setting_key) DO NOTHING;

-- Grant final permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO manufacturing_app_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO manufacturing_read_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO manufacturing_app_user;

-- Complete
SELECT 'Manufacturing database initialization completed successfully' AS status;
