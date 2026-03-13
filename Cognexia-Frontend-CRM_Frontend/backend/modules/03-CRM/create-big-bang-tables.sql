-- Big Bang Week 1: Create Staff Roles and Support Tickets Tables
-- Run this manually in your PostgreSQL database

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- TABLE 1: staff_roles
-- ==============================================
CREATE TABLE IF NOT EXISTS staff_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    role VARCHAR(50) NOT NULL,
    permissions JSONB NOT NULL DEFAULT '{}',
    "assignedOrganizations" JSONB,
    "isActive" BOOLEAN DEFAULT true,
    "assignedBy" UUID,
    notes TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_staff_roles_user
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_staff_roles_assigned_by
        FOREIGN KEY ("assignedBy") REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for staff_roles
CREATE INDEX IF NOT EXISTS idx_staff_roles_user_id ON staff_roles("userId");
CREATE INDEX IF NOT EXISTS idx_staff_roles_role ON staff_roles(role);
CREATE INDEX IF NOT EXISTS idx_staff_roles_is_active ON staff_roles("isActive");

-- ==============================================
-- TABLE 2: support_tickets
-- ==============================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ticketNumber" VARCHAR(20) UNIQUE NOT NULL,
    "organizationId" UUID NOT NULL,
    "submittedBy" UUID NOT NULL,
    "assignedTo" UUID,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(50) NOT NULL,
    channel VARCHAR(20) DEFAULT 'portal',
    messages JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    "firstResponseAt" TIMESTAMP,
    "resolvedAt" TIMESTAMP,
    "closedAt" TIMESTAMP,
    "resolutionTime" INTEGER,
    "customerSatisfactionRating" INTEGER CHECK ("customerSatisfactionRating" >= 1 AND "customerSatisfactionRating" <= 5),
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_support_tickets_organization
        FOREIGN KEY ("organizationId") REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_support_tickets_submitted_by
        FOREIGN KEY ("submittedBy") REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_support_tickets_assigned_to
        FOREIGN KEY ("assignedTo") REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for support_tickets
CREATE UNIQUE INDEX IF NOT EXISTS idx_support_tickets_ticket_number ON support_tickets("ticketNumber");
CREATE INDEX IF NOT EXISTS idx_support_tickets_organization ON support_tickets("organizationId");
CREATE INDEX IF NOT EXISTS idx_support_tickets_submitted_by ON support_tickets("submittedBy");
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets("assignedTo");
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets("createdAt");

-- ==============================================
-- TABLE 3: ticket_activity_log (Bonus - for audit trail)
-- ==============================================
CREATE TABLE IF NOT EXISTS ticket_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ticketId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT,
    metadata JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_ticket_activity_log_ticket
        FOREIGN KEY ("ticketId") REFERENCES support_tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_ticket_activity_log_user
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ticket_activity_log_ticket ON ticket_activity_log("ticketId");
CREATE INDEX IF NOT EXISTS idx_ticket_activity_log_user ON ticket_activity_log("userId");
CREATE INDEX IF NOT EXISTS idx_ticket_activity_log_created ON ticket_activity_log("createdAt");

-- ==============================================
-- COMMENTS (Documentation)
-- ==============================================
COMMENT ON TABLE staff_roles IS 'Stores staff member roles and permissions for the Super Admin portal';
COMMENT ON TABLE support_tickets IS 'Stores customer support tickets from client portals';
COMMENT ON TABLE ticket_activity_log IS 'Audit trail for all support ticket changes';

COMMENT ON COLUMN staff_roles."userId" IS 'Reference to the user who is a staff member';
COMMENT ON COLUMN staff_roles.role IS 'Role type: super_admin, support_manager, support_agent, billing_admin, analyst';
COMMENT ON COLUMN staff_roles.permissions IS 'JSONB object with granular permissions';
COMMENT ON COLUMN staff_roles."assignedOrganizations" IS 'Array of organization IDs this staff member can access';

COMMENT ON COLUMN support_tickets."ticketNumber" IS 'Unique ticket identifier like TICK-2026-0001';
COMMENT ON COLUMN support_tickets.status IS 'open, in_progress, waiting_response, resolved, closed';
COMMENT ON COLUMN support_tickets.priority IS 'low, medium, high, urgent';
COMMENT ON COLUMN support_tickets.category IS 'technical, billing, feature_request, bug, other';
COMMENT ON COLUMN support_tickets.channel IS 'portal, email, phone, chat';

-- ==============================================
-- SUCCESS MESSAGE
-- ==============================================
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Big Bang Week 1 Tables Created Successfully!';
    RAISE NOTICE '✅ Created: staff_roles';
    RAISE NOTICE '✅ Created: support_tickets';
    RAISE NOTICE '✅ Created: ticket_activity_log';
    RAISE NOTICE '🚀 Ready for backend controllers implementation!';
END $$;
