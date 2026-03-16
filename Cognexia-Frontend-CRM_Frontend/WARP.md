# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

CognexiaAI-ERP is an Industry 5.0 Enterprise Resource Planning system with 20+ integrated modules featuring AI-powered automation, quantum computing integration, blockchain security, and digital twin technology. The system uses a microservices architecture with NestJS backend and multiple frontend portals.

## Common Commands

### Backend Development

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Development server (starts main app with all integrated modules)
npm run start:dev

# Production build
npm run build

# Start production server
npm run start:prod

# Linting
npm run lint
npm run lint:fix

# Testing
npm test                          # Run all tests
npm run test:watch               # Watch mode
npm run test:coverage            # With coverage
npm run test:hr                  # HR module tests
npm run test:manufacturing       # Manufacturing module tests
npm run test:integration         # Integration tests
npm run test:e2e                 # End-to-end tests

# Database operations
npm run db:migrate               # Run TypeORM migrations
npm run db:migrate:revert        # Revert last migration
npm run db:seed                  # Seed database

# HR module specific
npm run migrate:hr:run           # Run HR migrations
npm run migrate:hr:rollback      # Rollback HR migrations
npm run seed:hr:run              # Seed HR data

# Manufacturing module specific
npm run manufacturing:setup      # Setup manufacturing database
npm run manufacturing:db:up      # Start manufacturing Docker services
npm run manufacturing:db:down    # Stop manufacturing Docker services
npm run manufacturing:db:reset   # Reset manufacturing database
npm run supabase:setup          # Setup Supabase for manufacturing
npm run supabase:health         # Check Supabase connection
```

### CRM Module (03-CRM)

```powershell
# Navigate to CRM module
cd backend/modules/03-CRM

# Setup environment
cp .env.example .env
# Edit .env with Supabase credentials

# Install dependencies
npm install

# Start CRM module (creates 76+ database tables automatically)
npm run start:dev

# Testing
npm test
npm run test:watch
npm run test:cov

# Database migrations
npm run migration:run
npm run migration:revert
npm run seed

# Build and deployment
npm run build
npm run docker:build
npm run docker:run
```

### Docker Operations

```powershell
# Manufacturing module Docker services
cd backend
docker-compose -f docker-compose.manufacturing.yml up -d
docker-compose -f docker-compose.manufacturing.yml down
docker-compose -f docker-compose.manufacturing.yml down -v  # With volumes

# Government-grade deployment
cd deployment
./deploy-government.sh  # Linux/macOS
.\deploy-government-grade.ps1  # Windows PowerShell
```

### Frontend Development

```powershell
# Frontend has multiple portals in separate directories:
# - client: Main client application
# - client-admin-portal: Admin portal
# - super-admin-portal: Super admin portal
# - shared-ui: Shared UI components

# Navigate to specific portal and check its package.json for commands
cd frontend/client-admin-portal
# or
cd frontend/super-admin-portal
```

## Architecture Overview

### Module Structure

The backend uses a modular monorepo architecture with 30+ modules organized in `backend/modules/`:

**Core Business Modules (01-07)**
- `01-hr`: Human Resources with AI recruitment, payroll processing, learning & development
- `02-manufacturing`: Manufacturing operations with IoT integration, Supabase backend
- `03-CRM`: Customer Relationship Management (76+ tables), multi-tenancy, AI features
- `04-supply-chain`: Supply chain management and optimization
- `05-inventory`: Smart inventory management with blockchain audit
- `06-procurement`: Automated procurement workflows
- `07-sales-marketing`: AI-powered marketing automation with neural intelligence

**Production & Operations (08-13)**
- `08-production-planning`: Production planning and scheduling
- `09-shop-floor-control`: Real-time shop floor monitoring
- `12-quality`: Quality management and control
- `13-maintenance`: Predictive maintenance

**Technology & Integration (14-19)**
- `14-iot`: IoT device management
- `15-digital-twin`: Digital twin simulation
- `16-integration-gateway`: Multi-system integration
- `17-analytics`: Advanced business intelligence
- `18-blockchain`: Blockchain security
- `19-quantum`: Quantum computing integration

**System & Infrastructure (20-22)**
- `20-authentication`: JWT-based authentication & authorization
- `21-health`: System health monitoring
- `22-shared`: Shared services and utilities

**Additional Modules (23-30)**
- `23-finance-accounting`: Financial reporting and SOX compliance
- `24-intelligent-automation`: AI automation
- `25-computer-vision`: Computer vision capabilities
- `26-quantum-security`: Quantum encryption
- `27-adaptive-analytics`: Adaptive analytics
- `28-integration-hub`: Integration hub
- `29-autonomous-orchestration`: Autonomous orchestration
- `30-e-robotics`: Robotics and automation control

### Database Architecture

**Primary Database**: Supabase (PostgreSQL) with real-time capabilities
**Secondary Database**: MongoDB for specific modules
**Caching**: Redis with IORedis client
**ORM**: TypeORM with custom Supabase integration

**Key Database Patterns:**
- Each module manages its own database tables/entities
- TypeORM entities defined in `modules/XX-module/src/entities/`
- Database synchronization happens automatically on application start
- CRM module creates 76+ tables automatically when started
- Manufacturing module uses Supabase with custom setup scripts

### Application Entry Points

**Main Backend Application**: `backend/src/main.ts`
- Bootstraps NestJS application
- Configures security middleware (Helmet, CORS, compression)
- Sets up Swagger documentation at `/api/docs`
- Uses API versioning with `/api/v1` prefix
- Runs on port 3000 (configurable via `PORT` env var)

**CRM Module**: `backend/modules/03-CRM/src/main.ts`
- Standalone NestJS application for CRM
- Multi-tenant SaaS architecture
- Auto port-selection (tries ports 3003-3012)
- Swagger docs at `/api/docs`

**Module Integration**: `backend/src/app.module.ts`
- Currently integrates: CRM, Authentication, Health, Shared modules
- Other modules can be imported as needed
- ConfigModule provides global configuration

### Frontend Architecture

Multiple portal applications in `frontend/`:
- **client**: Main client-facing application
- **client-admin-portal**: Administrator portal
- **super-admin-portal**: Super administrator portal (Phase 15)
- **shared-ui**: Shared UI components library

### Path Aliases (TypeScript)

Backend uses path aliases defined in `backend/tsconfig.json`:
- `@/*` → `./src/*`
- `@core/*` → `./src/core/*`
- `@modules/*` → `./modules/*`
- `@utils/*` → `./modules/22-shared/utils/*`
- `@shared/*` → `./modules/22-shared/*`
- `@industry5/shared` → `./modules/22-shared/index.ts`

### Module Communication

- **Intra-module**: Direct service injection via NestJS dependency injection
- **Inter-module**: Event-driven architecture with NestJS EventEmitter
- **Real-time**: WebSocket connections via Socket.IO and Supabase subscriptions
- **Background Jobs**: Bull/BullMQ for job queues
- **Caching**: Redis for distributed caching

### Security Architecture

- **Authentication**: JWT with passport-jwt strategy
- **Authorization**: Role-based access control (RBAC)
- **Multi-factor**: MFA support with speakeasy (CRM module)
- **Encryption**: AES-256 encryption for sensitive data
- **Security Headers**: Helmet middleware with CSP
- **Rate Limiting**: Express rate limiting and NestJS Throttler
- **Validation**: class-validator with whitelist and forbidNonWhitelisted

## Development Guidelines

### Working with Modules

**Each module is semi-autonomous with its own:**
- Controllers in `src/controllers/`
- Services in `src/services/`
- Entities in `src/entities/`
- DTOs in `src/dto/`
- Tests in `tests/` or `src/tests/`
- Documentation in `docs/` or module README.md

**To add a new module to the main app:**
1. Import the module in `backend/src/app.module.ts`
2. Ensure the module exports its controllers and services
3. Update tsconfig.json include paths if necessary
4. Add module-specific environment variables to `.env`

### Testing Strategy

**Test Coverage Targets:**
- Overall: 85%+
- Service Layer: 90%+
- Controller Layer: 80%+
- Critical Business Logic: 95%+
- Security Functions: 98%+

**Test Structure:**
- Unit tests: 70% of test suite
- Integration tests: 20%
- E2E tests: 8%
- Specialized (performance, security): 2%

**Running Module-Specific Tests:**
```powershell
npm run test:hr                    # HR module
npm run test:manufacturing         # Manufacturing module
npm run test -- --testPathPattern=crm  # CRM tests
```

### Database Migrations

**TypeORM Migrations (Main App):**
```powershell
npm run db:generate -- -n MigrationName
npm run db:migrate
npm run db:migrate:revert
```

**Module-Specific Migrations:**
- HR: `npm run migrate:hr:run`
- CRM: Uses TypeORM within module, runs `npm run migration:run` from module directory
- Manufacturing: Uses Supabase setup scripts

### Environment Configuration

**Required Environment Variables:**
- `NODE_ENV`: development | production | test
- `PORT`: Application port (default: 3000)
- `DATABASE_URL`: PostgreSQL connection string (if not using Supabase)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `JWT_SECRET`: JWT signing secret
- `REDIS_HOST`: Redis host for caching
- `REDIS_PORT`: Redis port

**CRM Module Specific:**
- `GROQ_API_KEY`: For AI features
- `OPENROUTER_API_KEY`: For AI routing
- See `backend/modules/03-CRM/.env.example` for complete list

### Code Style and Formatting

- **Linter**: ESLint with TypeScript rules
- **Formatter**: Prettier (run `npm run format`)
- **TypeScript**: Strict mode disabled for flexibility, but type safety encouraged
- Run `npm run lint:fix` before committing

### Real-time Features

**WebSocket Implementation:**
- Socket.IO for real-time communication
- Supabase real-time subscriptions for database changes
- Event-driven updates using NestJS EventEmitter

**Subscribe to Changes:**
```typescript
// Manufacturing module example
manufacturingService.subscribeToTable('production_orders', (payload) => {
  console.log('Production order updated:', payload);
});
```

### AI/ML Integration

**AI Features:**
- OpenAI API integration for text generation and analysis
- Groq SDK for fast LLM inference
- TensorFlow.js for in-application ML models
- Natural language processing with `natural` and `compromise` libraries

**Quantum Computing:**
- Quantum optimization algorithms for scheduling and planning
- Quantum-enhanced payroll and benefits calculations

### Government/Compliance Mode

For government-grade deployments, use the compliance-ready configurations:
- `deployment/docker-compose-government.yml`
- `deployment/deploy-government.sh` (Linux/macOS)
- `deployment/deploy-government-grade.ps1` (Windows)

**Compliance Features:**
- ISO 27001, SOC 2 Type II, NIST, FedRAMP ready
- Complete audit trails with 7-year retention
- Zero-trust network architecture
- End-to-end encryption (AES-256)

## Important Notes

### Module Status

**Production Ready:**
- ✅ CRM Module (76+ tables, multi-tenancy, AI features)
- ✅ HR Module (Complete lifecycle management)
- ✅ Manufacturing Module (Complete with Supabase)
- ✅ Finance & Accounting Module
- ✅ Inventory Module

**Partial/In Development:**
- 🚧 Sales & Marketing (Partial)
- 🚧 Production Planning (Partial)
- 🔬 Digital Twin (Development)
- 🔬 Blockchain (Development)
- 🔬 Quantum Computing (Research)

### Common Issues and Solutions

**Port Conflicts:**
- Main app tries port 3000
- CRM module tries 3003-3012 (auto-selects available port)
- Use `PORT` environment variable to override

**Database Connection Issues:**
- Verify Supabase credentials in `.env`
- Check `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`
- Run `npm run supabase:health` to verify connection
- Ensure database password matches in environment variables

**Module Import Errors:**
- Check that module is listed in `backend/tsconfig.json` include paths
- Verify module exports its components properly
- Ensure all dependencies are installed with `npm install`

**TypeScript Path Resolution:**
- Use configured path aliases (@modules/*, @shared/*, etc.)
- If paths don't resolve, check `tsconfig.json` paths configuration
- May need to restart TypeScript server in IDE

### Documentation Locations

- **Backend API**: `backend/API_DOCUMENTATION.md`
- **Module READMEs**: `backend/modules/XX-module-name/README.md`
- **Testing Strategy**: `backend/TESTING_STRATEGY.md`
- **Deployment**: `deployment/README-GOVERNMENT.md`
- **Codespaces Setup**: `CODESPACES-SETUP.md`
- **Database Setup**: `backend/modules/03-CRM/DATABASE-SETUP-SOLUTION.md`

## Quick Reference

### Project Commands Cheat Sheet

```powershell
# Backend development
cd backend && npm run start:dev

# CRM module development
cd backend/modules/03-CRM && npm run start:dev

# Run all tests
cd backend && npm test

# Lint and fix
cd backend && npm run lint:fix

# Database migrations
cd backend && npm run db:migrate

# Manufacturing Docker services
cd backend && docker-compose -f docker-compose.manufacturing.yml up -d
```

### Key File Locations

- Main app: `backend/src/main.ts`
- App module: `backend/src/app.module.ts`
- CRM entry: `backend/modules/03-CRM/src/main.ts`
- Shared utilities: `backend/modules/22-shared/`
- TypeScript config: `backend/tsconfig.json`
- Environment template: `backend/.env.example` or module-specific `.env.example`
