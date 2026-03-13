# Industry 5.0 ERP System - Backend

A comprehensive Enterprise Resource Planning (ERP) system built with modern technologies for Industry 5.0 manufacturing and business operations.

## 🏗️ Modular Architecture

The backend is organized using a clean modular architecture with 22 specialized modules:

### Core Business Modules (01-07)
- **01-hr** - Human Resources Management
- **02-manufacturing** - Manufacturing & Production
- **03-crm** - Customer Relationship Management
- **04-supply-chain** - Supply Chain Management
- **05-inventory** - Inventory Management
- **06-procurement** - Procurement & Sourcing
- **07-sales-marketing** - Sales & Marketing

### Production & Operations (08-13)
- **08-production-planning** - Production Planning
- **09-shop-floor-control** - Shop Floor Control
- **10-shopfloor** - Shopfloor Operations
- **11-quality-management** - Quality Management
- **12-quality** - Quality Control
- **13-maintenance** - Maintenance Management

### Technology & Integration (14-19)
- **14-iot** - Internet of Things
- **15-digital-twin** - Digital Twin & Simulation
- **16-integration-gateway** - Integration Gateway
- **17-analytics** - Analytics & Reporting
- **18-blockchain** - Blockchain Security
- **19-quantum** - Quantum Computing

### System & Infrastructure (20-22)
- **20-authentication** - Authentication & Authorization
- **21-health** - Health Monitoring
- **22-shared** - Shared Services & Utilities

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Run tests
npm test
```

## 📁 Project Structure

```
backend/
├── src/                    # Core application files
│   ├── app.module.ts      # Main application module
│   ├── main.ts            # Application bootstrap
│   └── ...
├── modules/               # Modular business logic
│   ├── 01-hr/
│   │   ├── src/
│   │   ├── configs/
│   │   ├── database/
│   │   ├── docs/
│   │   └── tests/
│   ├── 02-manufacturing/
│   └── ... (all 22 modules)
├── dist/                  # Build output
├── logs/                  # Application logs
└── node_modules/          # Dependencies
```

## 🛠️ Technology Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT-based authentication
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier

## 📊 API Documentation

Once the server is running, access the interactive API documentation at:
- **Development**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/v1/health

## 🔧 Configuration

Configuration files are organized within each module:
- Global configs: `modules/22-shared/configs/`
- Module-specific configs: `modules/XX-module-name/configs/`

## 🧪 Testing

Each module contains its own test suite:
```bash
# Run all tests
npm test

# Run specific module tests
npm test -- modules/01-hr

# Run with coverage
npm run test:cov
```

## 🏭 Industry 5.0 Features

- **AI-Powered Analytics**: Advanced machine learning capabilities
- **IoT Integration**: Real-time sensor data processing
- **Digital Twin Technology**: Virtual factory simulation
- **Quantum Computing**: Advanced optimization algorithms
- **Blockchain Security**: Immutable audit trails
- **Human-Centric Design**: Enhanced worker collaboration

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

---

**Built with ❤️ for Industry 5.0**
