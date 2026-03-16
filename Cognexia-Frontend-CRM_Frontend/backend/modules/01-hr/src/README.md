# HR Module - Industry 5.0 ERP Backend

## Overview

The HR (Human Resources) module provides comprehensive employee management, payroll processing, compensation planning, performance management, and other HR-related functionality for the Industry 5.0 ERP system.

## Features

### Core HR Management
- **Employee Management**: Complete employee lifecycle from onboarding to termination
- **Organization Structure**: Departments, positions, and reporting hierarchies
- **Compensation Planning**: Salary structures, bonus calculations, and benefits management
- **Payroll Processing**: Automated payroll runs with tax calculations and deductions
- **Performance Management**: Performance reviews, goal tracking, and development plans
- **Time & Attendance**: Working hours, leave management, and attendance tracking
- **Talent Acquisition**: Job postings, candidate management, and hiring workflows
- **Learning & Development**: Training programs and skill development
- **Employee Engagement**: Surveys, feedback, and engagement tracking
- **Exit Management**: Termination processes and exit interviews

### Key Components

1. **Services**: Business logic layer with comprehensive HR operations
2. **Entities**: Database models using TypeORM
3. **Types**: TypeScript interfaces and enums
4. **Utils**: Helper functions and utilities
5. **Tests**: Comprehensive test suite including unit, integration, and E2E tests

## Seed Data

The HR module includes comprehensive seed data to populate the database with realistic sample data for development and testing.

### Seed Files

1. **`001_seed_core_hr_data.ts`**: Core HR data including organizations, departments, positions, and employees
2. **`002_seed_hr_advanced_data.ts`**: Advanced HR data including compensation plans, payroll runs, and performance reviews
3. **`hr-seed-runner.ts`**: Master script to orchestrate all HR seed operations

### Running Seed Data

```bash
# Run all HR seed data
npm run seed:hr

# Or use specific commands
npm run seed:hr:run      # Seed all HR data
npm run seed:hr:clear    # Clear all HR data
npm run seed:hr:refresh  # Clear and re-seed all HR data
```

### Seed Data Contents

The seed data includes:

#### Organizations (3)
- **TechCorp Industries**: Large technology company
- **Manufacturing Plus**: Medium-sized manufacturing company  
- **StartupCo**: Small startup company

#### Departments (per organization)
- Engineering, Product, Marketing, Sales, HR, Finance, Operations

#### Positions (per department)
- Various roles from entry-level to executive positions
- Detailed job descriptions and requirements

#### Employees (15 per organization, 45 total)
- Diverse employee profiles with realistic data
- Manager-employee reporting relationships
- Skills, certifications, and personal information

#### Advanced HR Data
- **Compensation Plans**: 21 different plans across job levels and departments
- **Employee Compensations**: Active compensation assignments for all employees
- **Benefits Plans**: Health, dental, retirement, and other benefits
- **Tax Rules**: Federal, state, and local tax configurations
- **Payroll Runs**: Sample monthly payroll runs with calculations
- **Performance Reviews**: Annual performance evaluations

## Testing

The HR module includes a comprehensive test suite with multiple levels of testing.

### Test Structure

```
src/modules/hr/tests/
├── employee.test.ts                    # Unit tests (existing)
├── employee.service.integration.test.ts # Employee service integration tests
├── payroll.service.integration.test.ts  # Payroll service integration tests  
├── compensation.service.integration.test.ts # Compensation service integration tests
└── hr.e2e.integration.test.ts          # End-to-end workflow tests
```

### Running Tests

```bash
# Run all tests
npm test

# Run HR-specific tests
npm run test:hr

# Run with coverage
npm run test:hr:coverage

# Watch mode for development
npm run test:hr:watch

# Integration tests only
npm run test:integration

# End-to-end tests only
npm run test:e2e
```

### Test Types

1. **Unit Tests**: Individual function and method testing
2. **Integration Tests**: Service-level testing with database interactions
3. **End-to-End Tests**: Complete workflow testing across multiple services

### Test Configuration

- **Jest Configuration**: `jest.config.js`
- **Test Environment**: `.env.test`
- **Global Setup**: `src/test/globalSetup.ts`
- **Test Helpers**: `src/test/helpers/hr.helpers.ts`

### Test Database

Tests use a separate test database configuration:
- PostgreSQL test database (configurable)
- SQLite in-memory option available
- Automatic schema creation and cleanup
- Isolated test data per test run

## Overview

The HR Module is a comprehensive human resource management system designed for Industry 5.0 environments. It provides complete employee lifecycle management with AI-powered features, advanced analytics, and seamless integration capabilities.

## Features

### ✅ Currently Implemented
- **Employee Management**: Complete CRUD operations for employee records
- **Organizational Hierarchy**: Manager-employee relationships and reporting structures  
- **Authentication & Authorization**: Role-based access control with self-service capabilities
- **Data Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Structured error responses with user-friendly messages
- **Search & Filtering**: Full-text search with pagination and advanced filtering
- **Audit Logging**: Comprehensive activity tracking and audit trails

### 🚧 In Development  
- **Talent Acquisition (ATS)**: AI-powered recruitment and candidate management
- **Performance Management**: Goal tracking, reviews, and performance analytics
- **Compensation & Benefits**: Salary structures, benefits administration
- **Payroll Management**: Automated payroll processing and compliance
- **Time & Attendance**: Time tracking, leave management, and scheduling
- **Learning & Development**: Training programs and skill development tracking
- **Employee Engagement**: Surveys, feedback systems, and engagement analytics
- **Exit Management**: Comprehensive offboarding and alumni network management

## Architecture

```
src/modules/hr/
├── controllers/          # HTTP request handlers
├── services/            # Business logic layer
├── models/              # Database interaction layer
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and helpers
├── middleware/          # Authentication and validation middleware
├── routes/              # API route definitions
├── tests/               # Unit and integration tests
└── README.md           # Documentation
```

### Technology Stack
- **Runtime**: Node.js with TypeScript
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT-based with role-based access control
- **Validation**: Custom validation with sanitization
- **Logging**: Structured logging with Winston
- **Testing**: Jest for unit and integration tests

## API Endpoints

### Employee Management
Base URL: `/api/v1/hr/employees`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create new employee | HR Write |
| GET | `/` | List employees (paginated) | HR Read |
| GET | `/search` | Search employees | HR Read |
| GET | `/:id` | Get employee by ID | HR Read / Self |
| PUT | `/:id` | Update employee | HR Write |
| DELETE | `/:id` | Delete employee (soft) | HR Write |
| GET | `/:id/direct-reports` | Get direct reports | HR Read / Self |
| GET | `/:id/manager-hierarchy` | Get manager hierarchy | HR Read / Self |
| GET | `/by-email/:email` | Get employee by email | HR Read |

### Module Information
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/hr/health` | Module health check |
| GET | `/api/v1/hr/info` | Module information |

## Usage Examples

### Creating an Employee

```typescript
// POST /api/v1/hr/employees
const newEmployee = {
  firstName: "John",
  lastName: "Doe", 
  workEmail: "john.doe@company.com",
  jobTitle: "Software Engineer",
  department: "Engineering",
  location: "New York",
  employmentType: "full_time",
  baseSalary: 85000,
  hireDate: "2024-01-15",
  managerId: "manager-uuid-here",
  personalInfo: {
    personalEmail: "john.doe@gmail.com",
    phoneNumber: "+1-555-0123",
    dateOfBirth: "1990-05-15"
  }
};

const response = await fetch('/api/v1/hr/employees', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify(newEmployee)
});
```

### Listing Employees with Filters

```typescript
// GET /api/v1/hr/employees?department=Engineering&page=1&limit=20
const params = new URLSearchParams({
  department: 'Engineering',
  location: 'New York', 
  page: '1',
  limit: '20',
  sortBy: 'hire_date',
  sortOrder: 'desc'
});

const response = await fetch(`/api/v1/hr/employees?${params}`, {
  headers: {
    'Authorization': 'Bearer your-jwt-token'
  }
});
```

### Searching Employees

```typescript
// GET /api/v1/hr/employees/search?q=john&fuzzy=true
const response = await fetch('/api/v1/hr/employees/search?q=john&fuzzy=true', {
  headers: {
    'Authorization': 'Bearer your-jwt-token'
  }
});
```

### Updating an Employee

```typescript
// PUT /api/v1/hr/employees/:id
const updates = {
  jobTitle: "Senior Software Engineer",
  baseSalary: 95000,
  managerId: "new-manager-uuid"
};

const response = await fetch('/api/v1/hr/employees/employee-uuid', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify(updates)
});
```

## Authentication & Authorization

### Permission Levels
- **hr.employee.read**: View employee information
- **hr.employee.write**: Create and modify employees
- **hr.manage**: Full HR management capabilities
- **hr.admin**: Complete HR administrative access

### Self-Service Access
Employees can access their own:
- Personal profile information
- Direct reports (if manager)
- Manager hierarchy
- Performance data (when implemented)

### Rate Limiting
- 150 requests per 15 minutes per user
- Configurable limits based on user role
- Automatic rate limit headers in responses

## Data Validation

### Required Fields
- firstName, lastName
- workEmail (must be unique)
- jobTitle, department, location
- employmentType, baseSalary, hireDate

### Validation Rules
- Email format validation
- Phone number format validation
- Age restriction (minimum 16 years)
- Salary must be positive
- Manager assignment validation (no circular references)

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "EMPLOYEE_NOT_FOUND",
    "message": "The requested employee could not be found.",
    "details": {
      "employeeId": "123e4567-e89b-12d3-a456-426614174000"
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Common Error Codes
- `EMPLOYEE_NOT_FOUND` (404)
- `DUPLICATE_EMPLOYEE_EMAIL` (409)
- `INVALID_EMPLOYEE_DATA` (400)
- `UNAUTHORIZED_ACCESS` (401)
- `INSUFFICIENT_PERMISSIONS` (403)
- `RATE_LIMIT_EXCEEDED` (429)

## Database Schema

### Key Tables
- **employees**: Core employee information
- **employee_profiles**: Extended profile data
- **employee_emergency_contacts**: Emergency contact information
- **employee_documents**: Document attachments
- **employee_skills**: Skills and certifications
- **employee_audit_trail**: Change history

### Relationships
- Employees → Manager (self-referential)
- Employees → Organization (multi-tenant)
- Employees → Profile (1:1)
- Employees → Emergency Contacts (1:many)

## Performance Considerations

### Database Optimization
- Indexed fields: email, employee_number, organization_id
- Full-text search indexes on searchable fields
- Connection pooling for database connections
- Query optimization with prepared statements

### Caching Strategy
- Redis caching for frequently accessed employee data
- Cache invalidation on employee updates
- Session-based caching for user permissions

### Pagination
- Default limit: 50 records per page
- Maximum limit: 100 records per page
- Cursor-based pagination for large datasets

## Security Features

### Data Protection
- Sensitive data masking in logs
- Input sanitization and validation  
- SQL injection prevention
- XSS protection

### Privacy Compliance
- GDPR-compliant data handling
- Data retention policies
- Right to be forgotten implementation
- Consent management

## Logging & Monitoring

### Structured Logging
```typescript
// Employee creation log
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Employee created successfully",
  "employeeId": "123e4567-e89b-12d3-a456-426614174000",
  "createdBy": "user-uuid",
  "organizationId": "org-uuid",
  "module": "hr"
}
```

### Metrics Tracked
- Employee creation/update/deletion rates
- API response times
- Error rates by endpoint
- Database query performance
- Authentication failures

## Testing

### Running Tests
```bash
# Unit tests
npm run test:unit:hr

# Integration tests  
npm run test:integration:hr

# All HR tests
npm run test:hr

# Test coverage
npm run test:coverage:hr
```

### Test Categories
- **Unit Tests**: Service and utility functions
- **Integration Tests**: End-to-end API testing
- **Performance Tests**: Load and stress testing
- **Security Tests**: Authentication and authorization

## Development Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+ (for caching)
- Docker (optional)

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=industry50_erp
DB_USER=postgres
DB_PASSWORD=password
DB_POOL_SIZE=20

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Installation
```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Seed test data (optional)
npm run db:seed

# Start development server
npm run dev
```

## Future Roadmap

### Phase 1 (Q1 2024)
- Complete Talent Acquisition module
- Performance Management basics
- Employee self-service portal

### Phase 2 (Q2 2024)  
- Compensation & Benefits administration
- Time & Attendance tracking
- Payroll integration

### Phase 3 (Q3 2024)
- Learning & Development platform
- Employee Engagement tools
- Advanced analytics dashboard

### Phase 4 (Q4 2024)
- AI-powered insights and recommendations
- Mobile application
- Third-party integrations

## Contributing

### Code Style
- TypeScript strict mode
- ESLint + Prettier configuration
- Conventional commit messages
- Comprehensive JSDoc comments

### Pull Request Process
1. Create feature branch from `develop`
2. Implement changes with tests
3. Update documentation
4. Submit PR with detailed description
5. Code review and approval
6. Merge to `develop`

## Support

### Documentation
- API Documentation: `/api/v1/hr/docs`
- Developer Guide: `docs/developers/hr-module.md`
- User Manual: `docs/users/hr-guide.md`

### Contact
- Technical Support: `tech-support@industry50.com`
- HR Module Team: `hr-team@industry50.com`
- Documentation Issues: `docs@industry50.com`

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**License**: Proprietary - Industry 5.0 ERP System
