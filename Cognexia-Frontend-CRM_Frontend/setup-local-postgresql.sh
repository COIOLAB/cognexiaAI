#!/bin/bash

# ================================
# Local PostgreSQL Setup Script
# CognexiaAI Super Admin Portal
# ================================

set -e  # Exit on any error

echo "🚀 Starting Local PostgreSQL Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ================================
# Step 1: Check PostgreSQL
# ================================

echo -e "${BLUE}Step 1: Checking PostgreSQL installation...${NC}"

if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed!${NC}"
    echo ""
    echo "Please install PostgreSQL first:"
    echo "  macOS:   brew install postgresql"
    echo "  Ubuntu:  sudo apt-get install postgresql"
    echo "  Windows: Download from https://www.postgresql.org/download/"
    exit 1
fi

if ! pg_isready &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not running!${NC}"
    echo ""
    echo "Please start PostgreSQL:"
    echo "  macOS:   brew services start postgresql"
    echo "  Ubuntu:  sudo systemctl start postgresql"
    echo "  Windows: Start from Services or pgAdmin"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is installed and running${NC}"
echo ""

# ================================
# Step 2: Create Database
# ================================

echo -e "${BLUE}Step 2: Creating database 'cognexia_crm'...${NC}"

# Check if database exists
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw cognexia_crm; then
    echo -e "${BLUE}Database 'cognexia_crm' already exists.${NC}"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping existing database..."
        psql -U postgres -c "DROP DATABASE cognexia_crm;"
        psql -U postgres -c "CREATE DATABASE cognexia_crm;"
        echo -e "${GREEN}✅ Database recreated${NC}"
    fi
else
    psql -U postgres -c "CREATE DATABASE cognexia_crm;"
    echo -e "${GREEN}✅ Database created${NC}"
fi

echo ""

# ================================
# Step 3: Run Migrations
# ================================

echo -e "${BLUE}Step 3: Running database migrations...${NC}"

cd backend/modules/03-CRM

# Migration 1: Features 1-18
echo "Running migration 1 (Features 1-18)..."
if psql -U postgres -d cognexia_crm -f database/migrations/super-admin-features-migration.sql > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Migration 1 complete${NC}"
else
    echo -e "${RED}❌ Migration 1 failed${NC}"
    exit 1
fi

# Migration 2: Features 19-33
echo "Running migration 2 (Features 19-33)..."
if psql -U postgres -d cognexia_crm -f database/migrations/advanced-features-19-33-migration.sql > /dev/null 2>&1; then
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

TABLE_COUNT=$(psql -U postgres -d cognexia_crm -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

echo "Total tables created: $TABLE_COUNT"

if [ "$TABLE_COUNT" -ge 31 ]; then
    echo -e "${GREEN}✅ All tables created successfully${NC}"
else
    echo -e "${RED}⚠️  Expected 31+ tables, found $TABLE_COUNT${NC}"
fi

echo ""

# ================================
# Step 5: Setup Backend
# ================================

echo -e "${BLUE}Step 5: Setting up backend...${NC}"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${BLUE}📝 Please update DATABASE_PASSWORD in .env if needed${NC}"
else
    echo ".env file already exists"
fi

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

echo -e "${BLUE}Step 6: Setting up frontend...${NC}"

cd ../../../frontend/super-admin-portal

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local file from template..."
    cp .env.local.example .env.local
    echo -e "${GREEN}✅ .env.local file created${NC}"
else
    echo ".env.local file already exists"
fi

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
# Step 7: Final Summary
# ================================

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║          🎉  SETUP COMPLETE - LOCAL POSTGRESQL! 🎉        ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo "  ✅ Database: cognexia_crm"
echo "  ✅ Tables: $TABLE_COUNT created"
echo "  ✅ Backend: Dependencies installed"
echo "  ✅ Frontend: Dependencies installed"
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
echo -e "${GREEN}✨ Enjoy your Super Admin Portal with all 33 features! ✨${NC}"
echo ""
