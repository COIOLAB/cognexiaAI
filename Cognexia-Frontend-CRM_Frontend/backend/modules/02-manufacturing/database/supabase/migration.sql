-- Manufacturing Module Migration for Supabase
-- Run this script in your Supabase SQL Editor to set up all manufacturing tables
-- Industry 5.0 Backend - Manufacturing Module

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "ltree";

-- Create custom types and enums
CREATE TYPE production_status AS ENUM ('PLANNING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED');
CREATE TYPE quality_status AS ENUM ('PENDING', 'PASSED', 'FAILED', 'IN_REVIEW');
CREATE TYPE equipment_status AS ENUM ('OPERATIONAL', 'MAINTENANCE', 'BREAKDOWN', 'OFFLINE');
CREATE TYPE priority_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE operation_type AS ENUM ('SETUP', 'PRODUCTION', 'QUALITY_CHECK', 'MAINTENANCE', 'BREAKDOWN');

-- Work Centers table
CREATE TABLE work_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    department VARCHAR(255),
    location TEXT,
    capacity_per_hour INTEGER DEFAULT 0,
    current_efficiency DECIMAL(5,2) DEFAULT 100.00,
    status equipment_status DEFAULT 'OPERATIONAL',
    cost_per_hour DECIMAL(10,2) DEFAULT 0.00,
    setup_time_minutes INTEGER DEFAULT 0,
    teardown_time_minutes INTEGER DEFAULT 0,
    
    -- Industry 5.0 Features
    ai_optimization_enabled BOOLEAN DEFAULT false,
    human_machine_interface JSONB DEFAULT '{}',
    sustainability_metrics JSONB DEFAULT '{}',
    energy_efficiency_rating DECIMAL(3,2) DEFAULT 0.00,
    carbon_footprint DECIMAL(10,4) DEFAULT 0.0000,
    worker_safety_rating DECIMAL(3,2) DEFAULT 0.00,
    
    -- Technical specifications
    equipment_type VARCHAR(255),
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    serial_number VARCHAR(255),
    installation_date DATE,
    last_maintenance_date TIMESTAMP,
    next_maintenance_date TIMESTAMP,
    
    -- Digital Twin Integration
    digital_twin_id UUID,
    digital_twin_config JSONB DEFAULT '{}',
    iot_sensors JSONB DEFAULT '[]',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'
);

-- Production Lines table
CREATE TABLE production_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    layout_config JSONB DEFAULT '{}',
    
    -- Capacity and Performance
    design_capacity INTEGER DEFAULT 0,
    current_capacity INTEGER DEFAULT 0,
    efficiency_target DECIMAL(5,2) DEFAULT 85.00,
    current_efficiency DECIMAL(5,2) DEFAULT 0.00,
    
    -- Status and Control
    status equipment_status DEFAULT 'OPERATIONAL',
    is_automated BOOLEAN DEFAULT false,
    automation_level DECIMAL(3,2) DEFAULT 0.00,
    
    -- Industry 5.0 Features
    human_robot_collaboration JSONB DEFAULT '{}',
    adaptive_manufacturing BOOLEAN DEFAULT false,
    real_time_optimization BOOLEAN DEFAULT false,
    sustainability_goals JSONB DEFAULT '{}',
    
    -- Quality Control
    quality_checkpoints JSONB DEFAULT '[]',
    defect_rate DECIMAL(5,4) DEFAULT 0.0000,
    scrap_rate DECIMAL(5,4) DEFAULT 0.0000,
    
    -- Energy and Environment
    energy_consumption_kwh DECIMAL(10,2) DEFAULT 0.00,
    water_consumption_liters DECIMAL(10,2) DEFAULT 0.00,
    waste_generation_kg DECIMAL(10,2) DEFAULT 0.00,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'
);

-- Bill of Materials table
CREATE TABLE bill_of_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_code VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    version VARCHAR(50) DEFAULT '1.0',
    bom_type VARCHAR(100) DEFAULT 'MANUFACTURING',
    
    -- Structure and Costing
    items JSONB DEFAULT '[]', -- Array of BOM items with quantities and costs
    total_material_cost DECIMAL(12,2) DEFAULT 0.00,
    total_labor_cost DECIMAL(12,2) DEFAULT 0.00,
    total_overhead_cost DECIMAL(12,2) DEFAULT 0.00,
    
    -- Status and Control
    status production_status DEFAULT 'PLANNING',
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID,
    approved_at TIMESTAMP,
    
    -- Sustainability
    material_sustainability JSONB DEFAULT '{}',
    recyclability_percentage DECIMAL(5,2) DEFAULT 0.00,
    eco_design_principles JSONB DEFAULT '[]',
    
    -- Manufacturing Considerations
    lead_time_days INTEGER DEFAULT 0,
    safety_stock_percentage DECIMAL(5,2) DEFAULT 10.00,
    make_vs_buy_analysis JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_active BOOLEAN DEFAULT true,
    version_history JSONB DEFAULT '[]',
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'
);

-- Production Orders table
CREATE TABLE production_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(255) UNIQUE NOT NULL,
    product_code VARCHAR(255) NOT NULL,
    quantity_planned INTEGER NOT NULL,
    quantity_completed INTEGER DEFAULT 0,
    quantity_scrapped INTEGER DEFAULT 0,
    
    -- Scheduling
    planned_start_date TIMESTAMP,
    planned_end_date TIMESTAMP,
    actual_start_date TIMESTAMP,
    actual_end_date TIMESTAMP,
    priority priority_level DEFAULT 'MEDIUM',
    
    -- Status and Progress
    status production_status DEFAULT 'PLANNING',
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    current_operation VARCHAR(255),
    
    -- References
    bill_of_materials_id UUID REFERENCES bill_of_materials(id),
    customer_order_reference VARCHAR(255),
    
    -- Resource Allocation
    assigned_production_line_id UUID REFERENCES production_lines(id),
    allocated_resources JSONB DEFAULT '[]',
    
    -- Cost Tracking
    estimated_cost DECIMAL(12,2) DEFAULT 0.00,
    actual_cost DECIMAL(12,2) DEFAULT 0.00,
    cost_variance DECIMAL(12,2) DEFAULT 0.00,
    
    -- Quality Metrics
    quality_requirements JSONB DEFAULT '{}',
    quality_results JSONB DEFAULT '{}',
    defect_rate DECIMAL(5,4) DEFAULT 0.0000,
    
    -- Industry 5.0 Features
    ai_optimization_applied JSONB DEFAULT '{}',
    human_worker_assignments JSONB DEFAULT '[]',
    sustainability_impact JSONB DEFAULT '{}',
    circular_economy_metrics JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'
);

-- Work Orders table
CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_number VARCHAR(255) UNIQUE NOT NULL,
    production_order_id UUID REFERENCES production_orders(id),
    work_center_id UUID REFERENCES work_centers(id),
    
    -- Operation Details
    operation_sequence INTEGER NOT NULL,
    operation_name VARCHAR(255) NOT NULL,
    operation_description TEXT,
    operation_type operation_type DEFAULT 'PRODUCTION',
    
    -- Timing and Scheduling
    planned_start_time TIMESTAMP,
    planned_end_time TIMESTAMP,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    setup_time_minutes INTEGER DEFAULT 0,
    run_time_minutes INTEGER DEFAULT 0,
    queue_time_minutes INTEGER DEFAULT 0,
    
    -- Quantities
    quantity_planned INTEGER NOT NULL,
    quantity_completed INTEGER DEFAULT 0,
    quantity_scrapped INTEGER DEFAULT 0,
    
    -- Status and Progress
    status production_status DEFAULT 'PLANNING',
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    priority priority_level DEFAULT 'MEDIUM',
    
    -- Resource Requirements
    required_skills JSONB DEFAULT '[]',
    assigned_workers JSONB DEFAULT '[]',
    required_tools JSONB DEFAULT '[]',
    material_requirements JSONB DEFAULT '[]',
    
    -- Instructions and Documentation
    work_instructions TEXT,
    quality_specifications JSONB DEFAULT '{}',
    safety_requirements JSONB DEFAULT '[]',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'
);

-- Operation Logs table
CREATE TABLE operation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id UUID REFERENCES work_orders(id),
    work_center_id UUID REFERENCES work_centers(id),
    operator_id UUID,
    
    -- Operation Details
    operation_type operation_type NOT NULL,
    operation_description TEXT,
    start_time TIMESTAMP DEFAULT NOW(),
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    
    -- Quantities and Results
    quantity_processed INTEGER DEFAULT 0,
    quantity_good INTEGER DEFAULT 0,
    quantity_scrapped INTEGER DEFAULT 0,
    quality_metrics JSONB DEFAULT '{}',
    
    -- Performance Data
    efficiency_percentage DECIMAL(5,2) DEFAULT 0.00,
    utilization_percentage DECIMAL(5,2) DEFAULT 0.00,
    downtime_minutes INTEGER DEFAULT 0,
    downtime_reason VARCHAR(255),
    
    -- Quality and Issues
    quality_issues JSONB DEFAULT '[]',
    corrective_actions JSONB DEFAULT '[]',
    preventive_measures JSONB DEFAULT '[]',
    
    -- Environmental Data
    energy_consumed_kwh DECIMAL(8,2) DEFAULT 0.00,
    water_used_liters DECIMAL(8,2) DEFAULT 0.00,
    waste_generated_kg DECIMAL(8,2) DEFAULT 0.00,
    emissions_kg_co2 DECIMAL(8,4) DEFAULT 0.0000,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'
);

-- Routings table
CREATE TABLE routings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    product_code VARCHAR(255) NOT NULL,
    version VARCHAR(50) DEFAULT '1.0',
    
    -- Route Configuration
    operations JSONB DEFAULT '[]', -- Sequence of operations with work centers
    total_lead_time_minutes INTEGER DEFAULT 0,
    total_setup_time_minutes INTEGER DEFAULT 0,
    
    -- Status and Control
    status production_status DEFAULT 'PLANNING',
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID,
    approved_at TIMESTAMP,
    
    -- Cost and Performance
    total_labor_cost DECIMAL(10,2) DEFAULT 0.00,
    total_machine_cost DECIMAL(10,2) DEFAULT 0.00,
    efficiency_target DECIMAL(5,2) DEFAULT 85.00,
    
    -- Alternative Routes
    alternative_routes JSONB DEFAULT '[]',
    routing_flexibility JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_active BOOLEAN DEFAULT true,
    version_history JSONB DEFAULT '[]',
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'
);

-- Quality Checks table
CREATE TABLE quality_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_number VARCHAR(255) UNIQUE NOT NULL,
    work_order_id UUID REFERENCES work_orders(id),
    production_order_id UUID REFERENCES production_orders(id),
    
    -- Check Details
    check_type VARCHAR(255) NOT NULL,
    check_description TEXT,
    check_parameters JSONB DEFAULT '{}',
    acceptance_criteria JSONB DEFAULT '{}',
    
    -- Timing
    scheduled_time TIMESTAMP,
    performed_time TIMESTAMP DEFAULT NOW(),
    inspector_id UUID,
    
    -- Results
    status quality_status DEFAULT 'PENDING',
    results JSONB DEFAULT '{}',
    measurements JSONB DEFAULT '[]',
    defects_found JSONB DEFAULT '[]',
    
    -- Actions and Follow-up
    corrective_actions JSONB DEFAULT '[]',
    preventive_actions JSONB DEFAULT '[]',
    approved_by UUID,
    approved_at TIMESTAMP,
    
    -- Statistical Data
    statistical_data JSONB DEFAULT '{}',
    control_charts JSONB DEFAULT '{}',
    process_capability JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'
);

-- Equipment Maintenance table
CREATE TABLE equipment_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    maintenance_number VARCHAR(255) UNIQUE NOT NULL,
    work_center_id UUID REFERENCES work_centers(id),
    
    -- Maintenance Details
    maintenance_type VARCHAR(255) NOT NULL, -- PREVENTIVE, CORRECTIVE, PREDICTIVE
    maintenance_description TEXT,
    priority priority_level DEFAULT 'MEDIUM',
    
    -- Scheduling
    scheduled_date TIMESTAMP,
    started_date TIMESTAMP,
    completed_date TIMESTAMP,
    estimated_duration_hours DECIMAL(6,2) DEFAULT 0.00,
    actual_duration_hours DECIMAL(6,2) DEFAULT 0.00,
    
    -- Status and Progress
    status production_status DEFAULT 'PLANNING',
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Resources
    assigned_technicians JSONB DEFAULT '[]',
    required_parts JSONB DEFAULT '[]',
    required_tools JSONB DEFAULT '[]',
    estimated_cost DECIMAL(10,2) DEFAULT 0.00,
    actual_cost DECIMAL(10,2) DEFAULT 0.00,
    
    -- Results and Follow-up
    work_performed JSONB DEFAULT '[]',
    parts_replaced JSONB DEFAULT '[]',
    findings JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    
    -- Predictive Maintenance
    condition_monitoring_data JSONB DEFAULT '{}',
    ai_predictions JSONB DEFAULT '{}',
    failure_risk_assessment JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'
);

-- Production Schedules table
CREATE TABLE production_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_name VARCHAR(255) NOT NULL,
    schedule_period VARCHAR(100) NOT NULL, -- DAILY, WEEKLY, MONTHLY
    schedule_date DATE NOT NULL,
    
    -- Schedule Configuration
    production_line_id UUID REFERENCES production_lines(id),
    scheduled_orders JSONB DEFAULT '[]',
    capacity_allocation JSONB DEFAULT '{}',
    
    -- Optimization
    optimization_criteria JSONB DEFAULT '{}',
    ai_optimization_enabled BOOLEAN DEFAULT false,
    optimization_results JSONB DEFAULT '{}',
    
    -- Performance Tracking
    planned_efficiency DECIMAL(5,2) DEFAULT 85.00,
    actual_efficiency DECIMAL(5,2) DEFAULT 0.00,
    utilization_target DECIMAL(5,2) DEFAULT 80.00,
    actual_utilization DECIMAL(5,2) DEFAULT 0.00,
    
    -- Status
    status production_status DEFAULT 'PLANNING',
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    published_by UUID,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'
);

-- IoT Devices table
CREATE TABLE iot_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(255) UNIQUE NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(255) NOT NULL,
    
    -- Location and Assignment
    work_center_id UUID REFERENCES work_centers(id),
    production_line_id UUID REFERENCES production_lines(id),
    physical_location TEXT,
    installation_date DATE,
    
    -- Configuration
    configuration JSONB DEFAULT '{}',
    firmware_version VARCHAR(100),
    software_version VARCHAR(100),
    communication_protocol VARCHAR(100),
    
    -- Status and Health
    status equipment_status DEFAULT 'OPERATIONAL',
    health_score DECIMAL(5,2) DEFAULT 100.00,
    last_communication TIMESTAMP,
    battery_level DECIMAL(5,2) DEFAULT 100.00,
    signal_strength DECIMAL(5,2) DEFAULT 100.00,
    
    -- Data and Monitoring
    sensor_types JSONB DEFAULT '[]',
    data_collection_frequency VARCHAR(100),
    alert_thresholds JSONB DEFAULT '{}',
    current_readings JSONB DEFAULT '{}',
    
    -- Security
    security_credentials JSONB DEFAULT '{}',
    encryption_enabled BOOLEAN DEFAULT true,
    last_security_update TIMESTAMP,
    
    -- Maintenance
    maintenance_schedule JSONB DEFAULT '{}',
    calibration_due_date DATE,
    warranty_expiry_date DATE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'
);

-- Digital Twins table
CREATE TABLE digital_twins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twin_name VARCHAR(255) NOT NULL,
    twin_type VARCHAR(255) NOT NULL, -- EQUIPMENT, PROCESS, PRODUCT, FACILITY
    
    -- Physical Asset Mapping
    physical_asset_id UUID,
    asset_type VARCHAR(255),
    work_center_id UUID REFERENCES work_centers(id),
    production_line_id UUID REFERENCES production_lines(id),
    
    -- Model Configuration
    model_definition JSONB DEFAULT '{}',
    simulation_parameters JSONB DEFAULT '{}',
    physics_models JSONB DEFAULT '[]',
    behavioral_models JSONB DEFAULT '[]',
    
    -- Data Integration
    data_sources JSONB DEFAULT '[]',
    real_time_sync_enabled BOOLEAN DEFAULT true,
    sync_frequency VARCHAR(100) DEFAULT 'REAL_TIME',
    last_sync_time TIMESTAMP,
    
    -- Simulation and Analysis
    simulation_results JSONB DEFAULT '{}',
    predictive_analytics JSONB DEFAULT '{}',
    optimization_recommendations JSONB DEFAULT '[]',
    
    -- Visualization
    visualization_config JSONB DEFAULT '{}',
    dashboard_config JSONB DEFAULT '{}',
    ar_vr_enabled BOOLEAN DEFAULT false,
    
    -- Status and Performance
    status equipment_status DEFAULT 'OPERATIONAL',
    accuracy_score DECIMAL(5,2) DEFAULT 0.00,
    model_confidence DECIMAL(5,2) DEFAULT 0.00,
    last_validation_date DATE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    version_history JSONB DEFAULT '[]',
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'
);

-- Robotics Systems table
CREATE TABLE robotics_systems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    robot_id VARCHAR(255) UNIQUE NOT NULL,
    robot_name VARCHAR(255) NOT NULL,
    robot_type VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    
    -- Location and Assignment
    work_center_id UUID REFERENCES work_centers(id),
    production_line_id UUID REFERENCES production_lines(id),
    installation_position JSONB DEFAULT '{}',
    
    -- Capabilities
    capabilities JSONB DEFAULT '[]',
    payload_capacity_kg DECIMAL(8,2) DEFAULT 0.00,
    reach_radius_mm INTEGER DEFAULT 0,
    accuracy_mm DECIMAL(6,2) DEFAULT 0.00,
    repeatability_mm DECIMAL(6,2) DEFAULT 0.00,
    
    -- Programming and Control
    programming_language VARCHAR(100),
    control_system VARCHAR(255),
    current_program VARCHAR(255),
    program_library JSONB DEFAULT '[]',
    
    -- Human-Robot Collaboration
    collaborative_features JSONB DEFAULT '{}',
    safety_systems JSONB DEFAULT '[]',
    human_interaction_modes JSONB DEFAULT '[]',
    
    -- Status and Performance
    status equipment_status DEFAULT 'OPERATIONAL',
    operational_hours DECIMAL(12,2) DEFAULT 0.00,
    cycle_count INTEGER DEFAULT 0,
    efficiency_rating DECIMAL(5,2) DEFAULT 0.00,
    
    -- Maintenance and Health
    health_monitoring JSONB DEFAULT '{}',
    predictive_maintenance JSONB DEFAULT '{}',
    maintenance_history JSONB DEFAULT '[]',
    
    -- AI Integration
    ai_capabilities JSONB DEFAULT '{}',
    machine_learning_models JSONB DEFAULT '[]',
    adaptive_behavior BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'
);

-- Cybersecurity Events table
CREATE TABLE cybersecurity_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    severity priority_level NOT NULL,
    
    -- Event Details
    event_timestamp TIMESTAMP DEFAULT NOW(),
    source_system VARCHAR(255),
    source_ip VARCHAR(45),
    target_system VARCHAR(255),
    target_ip VARCHAR(45),
    
    -- Classification
    threat_category VARCHAR(255),
    attack_vector VARCHAR(255),
    affected_assets JSONB DEFAULT '[]',
    
    -- Detection and Response
    detection_method VARCHAR(255),
    detection_timestamp TIMESTAMP,
    response_actions JSONB DEFAULT '[]',
    mitigation_steps JSONB DEFAULT '[]',
    
    -- Impact Assessment
    impact_level VARCHAR(100),
    business_impact JSONB DEFAULT '{}',
    financial_impact DECIMAL(12,2) DEFAULT 0.00,
    operational_impact JSONB DEFAULT '{}',
    
    -- Investigation
    investigation_status VARCHAR(100) DEFAULT 'OPEN',
    assigned_analyst UUID,
    forensic_evidence JSONB DEFAULT '{}',
    root_cause_analysis JSONB DEFAULT '{}',
    
    -- Resolution
    resolution_status VARCHAR(100) DEFAULT 'PENDING',
    resolution_timestamp TIMESTAMP,
    lessons_learned TEXT,
    preventive_measures JSONB DEFAULT '[]',
    
    -- Compliance and Reporting
    regulatory_notifications JSONB DEFAULT '[]',
    compliance_impact JSONB DEFAULT '{}',
    external_reporting_required BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'
);

-- Create indexes for better performance
-- Work Centers indexes
CREATE INDEX idx_work_centers_code ON work_centers(code);
CREATE INDEX idx_work_centers_status ON work_centers(status);
CREATE INDEX idx_work_centers_department ON work_centers(department);
CREATE INDEX idx_work_centers_active ON work_centers(is_active);

-- Production Orders indexes
CREATE INDEX idx_production_orders_number ON production_orders(order_number);
CREATE INDEX idx_production_orders_status ON production_orders(status);
CREATE INDEX idx_production_orders_dates ON production_orders(planned_start_date, planned_end_date);
CREATE INDEX idx_production_orders_bom ON production_orders(bill_of_materials_id);
CREATE INDEX idx_production_orders_line ON production_orders(assigned_production_line_id);

-- Work Orders indexes
CREATE INDEX idx_work_orders_number ON work_orders(work_order_number);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_production ON work_orders(production_order_id);
CREATE INDEX idx_work_orders_center ON work_orders(work_center_id);

-- Operation Logs indexes
CREATE INDEX idx_operation_logs_work_order ON operation_logs(work_order_id);
CREATE INDEX idx_operation_logs_center ON operation_logs(work_center_id);
CREATE INDEX idx_operation_logs_time ON operation_logs(start_time, end_time);
CREATE INDEX idx_operation_logs_type ON operation_logs(operation_type);

-- Quality Checks indexes
CREATE INDEX idx_quality_checks_number ON quality_checks(check_number);
CREATE INDEX idx_quality_checks_status ON quality_checks(status);
CREATE INDEX idx_quality_checks_work_order ON quality_checks(work_order_id);
CREATE INDEX idx_quality_checks_time ON quality_checks(performed_time);

-- IoT Devices indexes
CREATE INDEX idx_iot_devices_id ON iot_devices(device_id);
CREATE INDEX idx_iot_devices_type ON iot_devices(device_type);
CREATE INDEX idx_iot_devices_center ON iot_devices(work_center_id);
CREATE INDEX idx_iot_devices_status ON iot_devices(status);

-- Digital Twins indexes
CREATE INDEX idx_digital_twins_type ON digital_twins(twin_type);
CREATE INDEX idx_digital_twins_asset ON digital_twins(physical_asset_id);
CREATE INDEX idx_digital_twins_center ON digital_twins(work_center_id);

-- Create functions for automated timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_work_centers_updated_at BEFORE UPDATE ON work_centers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_lines_updated_at BEFORE UPDATE ON production_lines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bill_of_materials_updated_at BEFORE UPDATE ON bill_of_materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_orders_updated_at BEFORE UPDATE ON production_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_operation_logs_updated_at BEFORE UPDATE ON operation_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routings_updated_at BEFORE UPDATE ON routings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quality_checks_updated_at BEFORE UPDATE ON quality_checks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_maintenance_updated_at BEFORE UPDATE ON equipment_maintenance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_schedules_updated_at BEFORE UPDATE ON production_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_iot_devices_updated_at BEFORE UPDATE ON iot_devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_digital_twins_updated_at BEFORE UPDATE ON digital_twins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_robotics_systems_updated_at BEFORE UPDATE ON robotics_systems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cybersecurity_events_updated_at BEFORE UPDATE ON cybersecurity_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE work_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_of_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE routings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twins ENABLE ROW LEVEL SECURITY;
ALTER TABLE robotics_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE cybersecurity_events ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (customize based on your authentication needs)
-- Example policies for authenticated users
CREATE POLICY "Allow authenticated users to view all manufacturing data" ON work_centers
    FOR SELECT TO authenticated USING (true);
    
CREATE POLICY "Allow authenticated users to insert manufacturing data" ON work_centers
    FOR INSERT TO authenticated WITH CHECK (true);
    
CREATE POLICY "Allow authenticated users to update manufacturing data" ON work_centers
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Copy similar policies for other tables (customize as needed)
-- Note: In production, implement more granular policies based on user roles

-- Create a view for manufacturing dashboard
CREATE VIEW manufacturing_dashboard AS
SELECT 
    'production_orders' as metric_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress_count,
    COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_count,
    AVG(progress_percentage) as avg_progress
FROM production_orders
WHERE is_active = true
UNION ALL
SELECT 
    'work_centers' as metric_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE status = 'OPERATIONAL') as operational_count,
    COUNT(*) FILTER (WHERE status = 'MAINTENANCE') as maintenance_count,
    AVG(current_efficiency) as avg_efficiency
FROM work_centers
WHERE is_active = true;

-- Insert sample data for testing (optional)
INSERT INTO work_centers (name, code, description, department) VALUES
('CNC Machine Center 1', 'CNC001', 'High precision CNC machining center', 'Machining'),
('Assembly Line 1', 'ASM001', 'Main product assembly line', 'Assembly'),
('Quality Control Station', 'QC001', 'Final quality inspection station', 'Quality');

INSERT INTO production_lines (name, code, description) VALUES
('Main Production Line', 'MAIN001', 'Primary manufacturing production line'),
('Secondary Line', 'SEC001', 'Secondary production line for specialized products');

-- Manufacturing module setup complete!
-- Next steps:
-- 1. Update your Supabase environment variables
-- 2. Run this migration in your Supabase SQL Editor
-- 3. Configure Row Level Security policies based on your requirements
-- 4. Test the connection from your NestJS application
