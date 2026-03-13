-- CognexiaAI Database Schema for Contact Inquiries and Job Applications
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CONTACT INQUIRIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Contact Information
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    
    -- Inquiry Details
    inquiry_type VARCHAR(50) NOT NULL DEFAULT 'general',
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    
    -- Metadata
    status VARCHAR(50) DEFAULT 'pending',
    assigned_to VARCHAR(255),
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_email ON contact_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON contact_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_inquiry_type ON contact_inquiries(inquiry_type);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow insert from anyone (for form submissions)
CREATE POLICY "Allow public insert" ON contact_inquiries
    FOR INSERT
    WITH CHECK (true);

-- Create policy to allow select for authenticated users only
CREATE POLICY "Allow authenticated read" ON contact_inquiries
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Create policy to allow update for authenticated users only
CREATE POLICY "Allow authenticated update" ON contact_inquiries
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- =====================================================
-- JOB APPLICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Personal Information
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    linkedin VARCHAR(500),
    portfolio VARCHAR(500),
    
    -- Address
    address TEXT,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    zip_code VARCHAR(20),
    country VARCHAR(255) NOT NULL DEFAULT 'India',
    
    -- Position Details
    position VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    experience_years VARCHAR(50) NOT NULL,
    current_company VARCHAR(255),
    current_position VARCHAR(255),
    current_salary VARCHAR(100),
    expected_salary VARCHAR(100) NOT NULL,
    notice_period VARCHAR(50) NOT NULL,
    
    -- Education
    education VARCHAR(100) NOT NULL,
    university VARCHAR(255) NOT NULL,
    graduation_year INTEGER NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    
    -- Skills & Experience
    skills TEXT NOT NULL,
    certifications TEXT,
    languages VARCHAR(500) NOT NULL,
    
    -- Cover Letter & Documents
    cover_letter TEXT NOT NULL,
    why_join TEXT NOT NULL,
    resume_url TEXT,
    portfolio_url TEXT,
    
    -- Additional Information
    availability DATE NOT NULL,
    relocate VARCHAR(50) NOT NULL,
    referral VARCHAR(100),
    
    -- Application Status
    status VARCHAR(50) DEFAULT 'pending',
    stage VARCHAR(50) DEFAULT 'application_received',
    assigned_to VARCHAR(255),
    notes TEXT,
    interview_date TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_job_applications_email ON job_applications(email);
CREATE INDEX IF NOT EXISTS idx_job_applications_position ON job_applications(position);
CREATE INDEX IF NOT EXISTS idx_job_applications_department ON job_applications(department);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_stage ON job_applications(stage);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON job_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_name ON job_applications(first_name, last_name);

-- Enable Row Level Security (RLS)
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow insert from anyone (for form submissions)
CREATE POLICY "Allow public insert" ON job_applications
    FOR INSERT
    WITH CHECK (true);

-- Create policy to allow select for authenticated users only
CREATE POLICY "Allow authenticated read" ON job_applications
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Create policy to allow update for authenticated users only
CREATE POLICY "Allow authenticated update" ON job_applications
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for contact_inquiries
CREATE TRIGGER update_contact_inquiries_updated_at 
    BEFORE UPDATE ON contact_inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for job_applications
CREATE TRIGGER update_job_applications_updated_at 
    BEFORE UPDATE ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR ANALYTICS (OPTIONAL)
-- =====================================================

-- View for contact inquiry statistics
CREATE OR REPLACE VIEW contact_inquiry_stats AS
SELECT 
    inquiry_type,
    status,
    COUNT(*) as count,
    DATE_TRUNC('day', created_at) as date
FROM contact_inquiries
GROUP BY inquiry_type, status, DATE_TRUNC('day', created_at);

-- View for job application statistics
CREATE OR REPLACE VIEW job_application_stats AS
SELECT 
    position,
    department,
    status,
    stage,
    COUNT(*) as count,
    DATE_TRUNC('day', created_at) as date
FROM job_applications
GROUP BY position, department, status, stage, DATE_TRUNC('day', created_at);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE contact_inquiries IS 'Stores all contact form submissions from the website';
COMMENT ON TABLE job_applications IS 'Stores all job application submissions from the careers page';

COMMENT ON COLUMN contact_inquiries.inquiry_type IS 'Type of inquiry: general, sales, support, partnership, demo';
COMMENT ON COLUMN contact_inquiries.status IS 'Current status: pending, in_progress, resolved, closed';

COMMENT ON COLUMN job_applications.status IS 'Application status: pending, reviewing, shortlisted, rejected, hired';
COMMENT ON COLUMN job_applications.stage IS 'Hiring stage: application_received, screening, interview, offer, hired, rejected';
