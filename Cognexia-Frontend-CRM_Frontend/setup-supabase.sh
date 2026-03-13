#!/bin/bash

# ================================
# Supabase Setup Script
# CognexiaAI Super Admin Portal
# ================================

set -e  # Exit on any error

echo "🚀 Starting Supabase Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ================================
# Step 1: Collect Supabase Credentials
# ================================

echo -e "${BLUE}Step 1: Supabase Project Configuration${NC}"
echo ""
echo "Please provide your Supabase project details:"
echo "(You can find these in your Supabase Dashboard > Settings > API)"
echo ""

read -p "Supabase Project URL (e.g., https://xxxxx.supabase.co): " SUPABASE_URL
read -p "Supabase Database Host (e.g., db.xxxxx.supabase.co): " SUPABASE_HOST
read -sp "Supabase Database Password: " SUPABASE_PASSWORD
echo ""
read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
read -p "Supabase Service Role Key: " SUPABASE_SERVICE_ROLE_KEY

echo ""
echo -e "${GREEN}✅ Credentials collected${NC}"
echo ""

# ================================
# Step 2: Test Connection
# ================================

echo -e "${BLUE}Step 2: Testing Supabase connection...${NC}"

# Extract project ref from URL
PROJECT_REF=$(echo $SUPABASE_URL | sed -E 's|https://(.+)\.supabase\.co|\1|')

if psql "postgresql://postgres:$SUPABASE_PASSWORD@$SUPABASE_HOST:5432/postgres" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Successfully connected to Supabase${NC}"
else
    echo -e "${RED}❌ Failed to connect to Supabase${NC}"
    echo ""
    echo "Please check:"
    echo "  1. Database password is correct"
    echo "  2. Your IP is whitelisted in Supabase (Settings > Database > Connection Pooling)"
    echo "  3. Database host is correct"
    exit 1
fi

echo ""

# ================================
# Step 3: Run Migrations
# ================================

echo -e "${BLUE}Step 3: Running database migrations on Supabase...${NC}"

cd backend/modules/03-CRM

# Migration 1: Features 1-18
echo "Running migration 1 (Features 1-18)..."
if psql "postgresql://postgres:$SUPABASE_PASSWORD@$SUPABASE_HOST:5432/postgres" -f database/migrations/super-admin-features-migration.sql > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Migration 1 complete${NC}"
else
    echo -e "${RED}❌ Migration 1 failed${NC}"
    exit 1
fi

# Migration 2: Features 19-33
echo "Running migration 2 (Features 19-33)..."
if psql "postgresql://postgres:$SUPABASE_PASSWORD@$SUPABASE_HOST:5432/postgres" -f database/migrations/advanced-features-19-33-migration.sql > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Migration 2 complete${NC}"
else
    echo -e "${RED}❌ Migration 2 failed${NC}"
    exit 1
fi

echo ""

# ================================
# Step 4: Verify Tables
# ================================

echo -e "${BLUE}Step 4: Verifying database tables...${NC}"

TABLE_COUNT=$(psql "postgresql://postgres:$SUPABASE_PASSWORD@$SUPABASE_HOST:5432/postgres" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")

echo "Total tables created: $TABLE_COUNT"

if [ "$TABLE_COUNT" -ge 31 ]; then
    echo -e "${GREEN}✅ All tables created successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Expected 31+ tables, found $TABLE_COUNT${NC}"
    echo "Note: Supabase creates some additional tables by default"
fi

echo ""

# ================================
# Step 5: Setup Backend
# ================================

echo -e "${BLUE}Step 5: Configuring backend for Supabase...${NC}"

# Create .env file with Supabase configuration
cat > .env << EOF
# ================================
# SUPABASE DATABASE CONFIGURATION
# ================================

DATABASE_HOST=$SUPABASE_HOST
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=$SUPABASE_PASSWORD
DATABASE_NAME=postgres

# Supabase specific
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# ================================
# APPLICATION CONFIGURATION
# ================================

JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRATION=24h

API_PORT=3000
NODE_ENV=development

ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
EOF

echo -e "${GREEN}✅ Backend .env file created with Supabase configuration${NC}"

# Install dependencies
echo "Installing backend dependencies..."
if npm install > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

echo ""

# ================================
# Step 6: Setup Frontend
# ================================

echo -e "${BLUE}Step 6: Configuring frontend for Supabase...${NC}"

cd ../../../frontend/super-admin-portal

# Create .env.local file with Supabase configuration
cat > .env.local << EOF
# ================================
# API CONFIGURATION
# ================================

NEXT_PUBLIC_API_URL=http://localhost:3000/api/crm

# ================================
# SUPABASE CONFIGURATION
# ================================

NEXT_PUBLIC_DB_TYPE=supabase
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF

echo -e "${GREEN}✅ Frontend .env.local file created with Supabase configuration${NC}"

# Install dependencies
echo "Installing frontend dependencies..."
if npm install > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

echo ""

# ================================
# Step 7: Supabase Additional Setup
# ================================

echo -e "${BLUE}Step 7: Supabase-specific recommendations...${NC}"
echo ""
echo -e "${YELLOW}📝 Important Supabase Configuration:${NC}"
echo ""
echo "1. Enable Row Level Security (RLS):"
echo "   - Go to Supabase Dashboard > Authentication > Policies"
echo "   - Review and configure RLS policies for your tables"
echo ""
echo "2. Configure API Settings:"
echo "   - Go to Settings > API"
echo "   - Verify JWT settings match your backend"
echo ""
echo "3. Database Connection Pooling:"
echo "   - Go to Settings > Database"
echo "   - Enable Connection Pooling for better performance"
echo ""
echo "4. Whitelist Your IP:"
echo "   - If you see connection issues"
echo "   - Go to Settings > Database > Connection Pooling"
echo "   - Add your IP to the whitelist"
echo ""

# ================================
# Step 8: Final Summary
# ================================

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║            🎉  SETUP COMPLETE - SUPABASE! 🎉              ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo "  ✅ Database: Supabase ($PROJECT_REF)"
echo "  ✅ Tables: $TABLE_COUNT created"
echo "  ✅ Backend: Configured for Supabase"
echo "  ✅ Frontend: Configured for Supabase"
echo ""
echo -e "${BLUE}🔐 Credentials (Keep these safe!):${NC}"
echo "  Project URL: $SUPABASE_URL"
echo "  Database Host: $SUPABASE_HOST"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo ""
echo "1. Start the backend:"
echo "   cd backend/modules/03-CRM"
echo "   npm run start:dev"
echo ""
echo "2. Start the frontend (in new terminal):"
echo "   cd frontend/super-admin-portal"
echo "   npm run dev"
echo ""
echo "3. Open your browser:"
echo "   http://localhost:3001"
echo ""
echo -e "${GREEN}✨ Enjoy your Super Admin Portal with Supabase! ✨${NC}"
echo ""
echo -e "${YELLOW}💡 Pro Tip: Monitor your Supabase Dashboard for:${NC}"
echo "   - Database usage and performance"
echo "   - API requests and errors"
echo "   - Storage and bandwidth"
echo ""
