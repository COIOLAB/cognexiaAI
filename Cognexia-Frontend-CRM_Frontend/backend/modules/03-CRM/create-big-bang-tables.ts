import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'Akshita@19822',
  database: 'cognexia_crm',
  synchronize: false,
  logging: true,
});

async function createBigBangTables() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Create staff_roles table
    console.log('\n📋 Creating staff_roles table...');
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS staff_roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL,
        permissions JSONB NOT NULL DEFAULT '{}',
        "assignedOrganizations" JSONB,
        "isActive" BOOLEAN DEFAULT true,
        "assignedBy" UUID REFERENCES users(id) ON DELETE SET NULL,
        notes TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ staff_roles table created');

    // Create indexes for staff_roles
    await AppDataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_staff_roles_user_id ON staff_roles("userId");
      CREATE INDEX IF NOT EXISTS idx_staff_roles_role ON staff_roles(role);
      CREATE INDEX IF NOT EXISTS idx_staff_roles_is_active ON staff_roles("isActive");
    `);
    console.log('✅ staff_roles indexes created');

    // Drop existing support_tickets table if it exists
    console.log('\n🎫 Dropping existing support_tickets table...');
    await AppDataSource.query(`DROP TABLE IF EXISTS support_tickets CASCADE;`);
    console.log('✅ Existing table dropped');

    // Create support_tickets table
    console.log('\n🎫 Creating support_tickets table...');
    await AppDataSource.query(`
      CREATE TABLE support_tickets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "ticketNumber" VARCHAR(20) UNIQUE NOT NULL,
        "organizationId" UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        "submittedBy" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "assignedTo" UUID REFERENCES users(id) ON DELETE SET NULL,
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
        "customerSatisfactionRating" INTEGER,
        "internalNotes" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ support_tickets table created');

    // Create indexes for support_tickets (one at a time)
    await AppDataSource.query(`CREATE INDEX IF NOT EXISTS idx_support_tickets_organization ON support_tickets("organizationId");`);
    await AppDataSource.query(`CREATE INDEX IF NOT EXISTS idx_support_tickets_submitted_by ON support_tickets("submittedBy");`);
    await AppDataSource.query(`CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets("assignedTo");`);
    await AppDataSource.query(`CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);`);
    await AppDataSource.query(`CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);`);
    await AppDataSource.query(`CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);`);
    await AppDataSource.query(`CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets("createdAt");`);
    console.log('✅ support_tickets indexes created');

    console.log('\n✅ All Big Bang tables created successfully!');
    console.log('\n📊 Summary:');
    console.log('  ✅ staff_roles table');
    console.log('  ✅ support_tickets table');
    console.log('  ✅ All indexes and foreign keys');

    await AppDataSource.destroy();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

createBigBangTables();
