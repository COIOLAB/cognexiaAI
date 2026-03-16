# Manufacturing Module - Industry 5.0 ERP

## 🏭 Overview

The Manufacturing Module is a comprehensive Industry 5.0 compliant manufacturing management system built with NestJS, TypeORM, and Supabase. It provides complete manufacturing lifecycle management from planning to execution, with real-time monitoring, IoT integration, and AI-powered optimization.

## 🌟 Key Features

### Core Manufacturing Management
- **Work Centers** - Equipment and resource management
- **Production Lines** - Manufacturing line configuration and monitoring
- **Bill of Materials (BOM)** - Product structure and component management
- **Production Orders** - Manufacturing order lifecycle management
- **Work Orders** - Operation-level task management
- **Routings** - Manufacturing process definitions
- **Quality Control** - Comprehensive quality management system
- **Equipment Maintenance** - Preventive and predictive maintenance

### Industry 5.0 Features
- **Human-Centric Manufacturing** - Worker collaboration and safety
- **Sustainability Tracking** - Carbon footprint and eco-design metrics
- **Resilient Operations** - Adaptive and flexible manufacturing
- **AI Integration** - Machine learning for optimization
- **Digital Twins** - Virtual representations of physical assets
- **IoT Connectivity** - Real-time sensor data and monitoring
- **Robotics Integration** - Human-robot collaboration
- **Cybersecurity** - Industrial security monitoring

### Technology Stack
- **Backend**: NestJS with TypeScript
- **Database**: Supabase (PostgreSQL with real-time capabilities)
- **ORM**: TypeORM with custom Supabase integration
- **Real-time**: WebSocket subscriptions via Supabase
- **Authentication**: JWT with Supabase Auth
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with integration tests

## 📋 Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Quick Start](#quick-start)
4. [API Documentation](#api-documentation)
5. [Architecture](#architecture)
6. [Database Schema](#database-schema)
7. [Real-time Features](#real-time-features)
8. [IoT Integration](#iot-integration)
9. [AI & Machine Learning](#ai--machine-learning)
10. [Security](#security)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Contributing](#contributing)

## 🚀 Installation

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase account
- PostgreSQL knowledge (optional but helpful)

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js
npm install @nestjs/typeorm typeorm pg
```

### 2. Environment Setup
Create a `.env` file with your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_DB_PASSWORD=your-supabase-db-password

# Manufacturing Module Settings
MANUFACTURING_MODULE_ENABLED=true
MANUFACTURING_IOT_ENABLED=true
MANUFACTURING_AI_ENABLED=true
MANUFACTURING_DIGITAL_TWIN_ENABLED=true

# Industry 5.0 Features
INDUSTRY_5_0_HUMAN_CENTRIC=true
INDUSTRY_5_0_SUSTAINABILITY=true
INDUSTRY_5_0_RESILIENCE=true
```

### 3. Database Setup
```bash
# Run the Supabase setup script
npm run supabase:setup

# Verify the setup
npm run supabase:health
```

## ⚙️ Configuration

### Supabase Configuration
The module uses a dedicated Supabase configuration service:

```typescript
// Example: Custom configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
  realtime: {
    eventsPerSecond: 10,
  },
  database: {
    host: 'db.your-project-id.supabase.co',
    port: 5432,
    ssl: true
  }
};
```

### Module Configuration
```typescript
// app.module.ts
import { ManufacturingModule } from './manufacturing/manufacturing.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ManufacturingModule,
  ],
})
export class AppModule {}
```

## 🏃‍♂️ Quick Start

### 1. Create a Work Center
```typescript
const workCenter = await manufacturingService.createWorkCenter({
  name: 'CNC Machine Center 1',
  code: 'CNC001',
  description: 'High precision CNC machining center',
  department: 'Machining',
  capacity_per_hour: 50,
  current_efficiency: 85.5
});
```

### 2. Create a Production Order
```typescript
const productionOrder = await manufacturingService.createProductionOrder({
  product_code: 'WIDGET-001',
  quantity_planned: 1000,
  planned_start_date: new Date(),
  planned_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  priority: 'HIGH'
});
```

### 3. Monitor Real-time Updates
```typescript
// Subscribe to production order changes
manufacturingService.subscribeToTable('production_orders', (payload) => {
  console.log('Production order updated:', payload);
});
```

## 📚 API Documentation

### Work Centers API

#### GET /manufacturing/work-centers
Get all work centers with optional filtering.

**Query Parameters:**
- `department` (string): Filter by department
- `status` (string): Filter by operational status
- `page` (number): Page number for pagination
- `limit` (number): Number of items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "CNC Machine Center 1",
      "code": "CNC001",
      "description": "High precision CNC machining center",
      "department": "Machining",
      "status": "OPERATIONAL",
      "capacity_per_hour": 50,
      "current_efficiency": 85.5,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

#### POST /manufacturing/work-centers
Create a new work center.

**Request Body:**
```json
{
  "name": "Assembly Line 2",
  "code": "ASM002",
  "description": "Secondary assembly line",
  "department": "Assembly",
  "capacity_per_hour": 100
}
```

#### PUT /manufacturing/work-centers/:id
Update an existing work center.

#### DELETE /manufacturing/work-centers/:id
Soft delete a work center.

### Production Orders API

#### GET /manufacturing/production-orders
Get production orders with filtering and sorting.

**Query Parameters:**
- `status` (string): Filter by order status
- `start_date` (date): Filter orders starting after this date
- `end_date` (date): Filter orders ending before this date
- `priority` (string): Filter by priority level

#### POST /manufacturing/production-orders
Create a new production order.

**Request Body:**
```json
{
  "product_code": "WIDGET-001",
  "quantity_planned": 1000,
  "planned_start_date": "2024-01-15T08:00:00Z",
  "planned_end_date": "2024-01-22T17:00:00Z",
  "priority": "HIGH",
  "bill_of_materials_id": "uuid",
  "assigned_production_line_id": "uuid"
}
```

### Quality Checks API

#### GET /manufacturing/quality-checks
Get quality check records.

#### POST /manufacturing/quality-checks
Create a new quality check.

**Request Body:**
```json
{
  "work_order_id": "uuid",
  "check_type": "DIMENSIONAL",
  "check_description": "Measure critical dimensions",
  "acceptance_criteria": {
    "length": {"min": 99.8, "max": 100.2},
    "width": {"min": 49.9, "max": 50.1}
  }
}
```

### Real-time Dashboard API

#### GET /manufacturing/dashboard
Get real-time manufacturing dashboard data.

**Response:**
```json
{
  "success": true,
  "data": {
    "production_orders": {
      "total": 45,
      "in_progress": 12,
      "completed": 28,
      "avg_progress": 67.5
    },
    "work_centers": {
      "total": 8,
      "operational": 7,
      "maintenance": 1,
      "avg_efficiency": 87.2
    },
    "quality_metrics": {
      "defect_rate": 0.012,
      "first_pass_yield": 0.986
    }
  }
}
```

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   NestJS API    │    │   Supabase      │
│   (Dashboard)   │◄──►│   Server        │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                       ┌─────────────────┐              │
                       │   IoT Devices   │              │
                       │   (Sensors)     │──────────────┘
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   AI/ML         │
                       │   Services      │
                       └─────────────────┘
```

### Module Structure
```
src/manufacturing/
├── config/                 # Configuration services
│   └── supabase.config.ts
├── controllers/            # REST API controllers
│   ├── work-center.controller.ts
│   ├── production-order.controller.ts
│   └── ...
├── services/              # Business logic services
│   ├── supabase.service.ts
│   ├── manufacturing.service.ts
│   └── ...
├── entities/              # TypeORM entities
│   ├── work-center.entity.ts
│   ├── production-order.entity.ts
│   └── ...
├── dto/                   # Data Transfer Objects
│   ├── create-work-center.dto.ts
│   └── ...
├── guards/                # Authentication & authorization
├── middleware/            # Custom middleware
├── utils/                 # Utility functions
├── scripts/               # Database setup scripts
├── supabase/             # Supabase migrations
├── tests/                # Test files
└── docs/                 # Additional documentation
```

### Data Flow
1. **API Request** → Controller → Service → Supabase
2. **Real-time Updates** → Supabase → WebSocket → Client
3. **IoT Data** → Device → Service → Supabase → Real-time Updates
4. **AI Processing** → Service → ML Model → Results → Database

## 🗄️ Database Schema

### Core Tables
- **work_centers** - Manufacturing equipment and resources
- **production_lines** - Production line configurations
- **bill_of_materials** - Product structures and components
- **production_orders** - Manufacturing orders
- **work_orders** - Individual operation tasks
- **operation_logs** - Operation execution records
- **routings** - Manufacturing process definitions
- **quality_checks** - Quality control records
- **equipment_maintenance** - Maintenance schedules and records

### Industry 5.0 Tables
- **iot_devices** - IoT sensor and device management
- **digital_twins** - Virtual asset representations
- **robotics_systems** - Robotic system configurations
- **cybersecurity_events** - Security incident tracking

### Key Relationships
```sql
production_orders → bill_of_materials (many-to-one)
production_orders → production_lines (many-to-one)
work_orders → production_orders (many-to-one)
work_orders → work_centers (many-to-one)
quality_checks → work_orders (many-to-one)
iot_devices → work_centers (many-to-one)
```

## ⚡ Real-time Features

### WebSocket Subscriptions
The module provides real-time updates for critical manufacturing events:

```typescript
// Subscribe to production order changes
const subscription = supabase
  .channel('production_orders_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'production_orders'
  }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();
```

### Real-time Monitoring
- Production order progress updates
- Equipment status changes
- Quality check results
- IoT sensor data streams
- Alert notifications

## 🤖 IoT Integration

### Device Management
```typescript
// Register a new IoT device
const device = await iotService.registerDevice({
  device_id: 'TEMP_SENSOR_001',
  device_name: 'Temperature Sensor',
  device_type: 'TEMPERATURE',
  work_center_id: 'uuid',
  configuration: {
    sample_rate: 1000,
    units: 'celsius',
    range: { min: -40, max: 200 }
  }
});

// Update device readings
await iotService.updateDeviceReadings('TEMP_SENSOR_001', {
  temperature: 45.2,
  humidity: 65.8,
  timestamp: new Date()
});
```

### Supported Device Types
- Temperature sensors
- Pressure sensors
- Vibration monitors
- Energy meters
- Quality measurement devices
- Safety monitoring systems

## 🧠 AI & Machine Learning

### Predictive Maintenance
```typescript
// AI-powered maintenance prediction
const prediction = await aiService.predictMaintenance('CNC001', {
  operational_hours: 2450,
  vibration_data: [0.2, 0.3, 0.25, 0.4],
  temperature_data: [45, 47, 46, 48]
});

console.log('Maintenance needed in:', prediction.days_until_maintenance);
```

### Production Optimization
- Schedule optimization using genetic algorithms
- Quality prediction based on process parameters
- Energy consumption optimization
- Defect rate prediction and prevention

### Digital Twin Analytics
```typescript
// Update digital twin with real-time data
await digitalTwinService.updateTwinData(twinId, {
  real_time_data: sensorReadings,
  simulation_parameters: updatedParams,
  performance_metrics: calculatedMetrics
});
```

## 🔒 Security

### Row Level Security (RLS)
Supabase RLS policies ensure data security:

```sql
-- Example RLS policy
CREATE POLICY "Users can only access their organization's data" 
ON work_centers 
FOR ALL 
USING (organization_id = auth.jwt() ->> 'organization_id');
```

### API Security
- JWT authentication for all endpoints
- Rate limiting on API requests
- Input validation and sanitization
- HTTPS enforcement
- CORS configuration

### Industrial Security
- Cybersecurity event monitoring
- Device authentication for IoT
- Encrypted data transmission
- Audit logging for all operations

## 🧪 Testing

### Running Tests
```bash
# Run all manufacturing tests
npm run manufacturing:test

# Run tests with coverage
npm run manufacturing:test:coverage

# Run tests in watch mode
npm run manufacturing:test:watch

# Run Supabase integration tests
npm run supabase:test
```

### Test Categories
- **Unit Tests** - Individual service and component testing
- **Integration Tests** - Database and API integration testing
- **Performance Tests** - Load and stress testing
- **Security Tests** - Authentication and authorization testing
- **Real-time Tests** - WebSocket and subscription testing

### Test Coverage
Current test coverage includes:
- ✅ Supabase connection and configuration
- ✅ CRUD operations for all entities
- ✅ Real-time subscription functionality
- ✅ IoT device management
- ✅ Quality control workflows
- ✅ Production order lifecycle
- ✅ Error handling and edge cases

## 🚀 Deployment

### Environment Setup
1. **Development** - Local development with Supabase
2. **Staging** - Supabase staging environment
3. **Production** - Supabase production with replication

### Deployment Commands
```bash
# Build the application
npm run build

# Start production server
npm run start:prod

# Run health checks
npm run supabase:health
```

### Environment Variables
Ensure all required environment variables are set for each environment:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV`
- `JWT_SECRET`

## 📈 Performance Optimization

### Database Optimization
- Optimized indexes on frequently queried columns
- Connection pooling with configurable limits
- Query optimization with selective field loading
- Pagination for large datasets

### Caching Strategy
- Redis caching for frequently accessed data
- In-memory caching for configuration data
- Real-time cache invalidation on data changes

### Real-time Performance
- Configurable event throttling
- Selective subscription management
- Optimized WebSocket connections

## 🔧 Troubleshooting

### Common Issues

1. **Connection Issues**
   ```bash
   # Check Supabase connectivity
   npm run supabase:health
   ```

2. **Migration Issues**
   ```bash
   # Re-run setup script
   npm run supabase:setup
   ```

3. **Real-time Issues**
   - Check WebSocket connections
   - Verify RLS policies
   - Check subscription limits

### Debug Mode
Enable debug logging:
```env
MANUFACTURING_LOG_LEVEL=debug
NODE_ENV=development
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Install dependencies: `npm install`
4. Set up environment variables
5. Run tests: `npm run manufacturing:test`
6. Create a pull request

### Coding Standards
- TypeScript with strict mode
- ESLint and Prettier formatting
- Comprehensive test coverage
- Clear documentation for all public APIs

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting guide
- Review the API documentation
- Contact the development team

## 🔄 Changelog

### Version 1.0.0
- Initial release with core manufacturing features
- Supabase integration
- Real-time monitoring
- IoT device management
- Quality control system
- Industry 5.0 compliance features

---

**Built with ❤️ for Industry 5.0 Manufacturing**
