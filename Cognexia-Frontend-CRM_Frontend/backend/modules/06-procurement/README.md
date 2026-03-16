# Procurement Module (06-procurement)

## Overview

The **Procurement Module** is a comprehensive procurement management system designed for Industry 5.0 manufacturing environments. It provides end-to-end procurement capabilities including vendor management, purchase order processing, contract management, and intelligent procurement analytics.

## Features

### Core Procurement Management
- **Vendor Management**: Complete vendor lifecycle management
- **Purchase Order Processing**: Automated PO creation, approval, and tracking
- **Contract Management**: Digital contract creation and management
- **Sourcing Management**: Strategic sourcing and supplier evaluation
- **Invoice Processing**: Automated invoice matching and processing

### Advanced Features
- **AI-Powered Supplier Recommendations**: Machine learning-based supplier scoring
- **Smart Contract Integration**: Blockchain-based smart contracts for procurement
- **Real-time Price Monitoring**: Market price tracking and alerts
- **Compliance Management**: Regulatory compliance and audit trails
- **Integration Capabilities**: Seamless integration with ERP and supply chain systems

## Architecture

### Technology Stack
- **Backend Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Caching**: Redis for high-performance data access
- **Message Queue**: Bull for background job processing
- **API Documentation**: OpenAPI/Swagger
- **Authentication**: JWT-based authentication

### Module Structure
```
06-procurement/
├── src/
│   ├── controllers/          # REST API controllers
│   ├── services/            # Business logic services
│   ├── entities/            # Database entities
│   ├── dto/                 # Data transfer objects
│   ├── guards/              # Authentication guards
│   ├── interceptors/        # Request/response interceptors
│   └── utils/               # Utility functions
├── test/                    # Test files
└── docs/                    # API documentation
```

## API Endpoints

### Vendor Management
- `GET /api/procurement/vendors` - List all vendors
- `POST /api/procurement/vendors` - Create new vendor
- `PUT /api/procurement/vendors/:id` - Update vendor
- `DELETE /api/procurement/vendors/:id` - Delete vendor

### Purchase Orders
- `GET /api/procurement/purchase-orders` - List purchase orders
- `POST /api/procurement/purchase-orders` - Create purchase order
- `PUT /api/procurement/purchase-orders/:id` - Update purchase order
- `POST /api/procurement/purchase-orders/:id/approve` - Approve purchase order

### Contracts
- `GET /api/procurement/contracts` - List contracts
- `POST /api/procurement/contracts` - Create contract
- `PUT /api/procurement/contracts/:id` - Update contract
- `POST /api/procurement/contracts/:id/sign` - Sign contract

## Configuration

### Environment Variables
```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=procurement_db
DATABASE_USER=procurement_user
DATABASE_PASSWORD=your_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h

# External APIs
SUPPLIER_API_URL=https://api.suppliers.com
PRICING_API_URL=https://api.pricing.com
```

### Module Configuration
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vendor,
      PurchaseOrder,
      Contract,
      ProcurementItem,
    ]),
    BullModule.registerQueue({
      name: 'procurement-queue',
    }),
  ],
  controllers: [
    VendorController,
    PurchaseOrderController,
    ContractController,
  ],
  providers: [
    VendorService,
    PurchaseOrderService,
    ContractService,
    ProcurementAnalyticsService,
  ],
  exports: [
    VendorService,
    PurchaseOrderService,
    ContractService,
  ],
})
export class ProcurementModule {}
```

## Database Schema

### Key Entities
- **Vendor**: Supplier information and ratings
- **PurchaseOrder**: Purchase order details and status
- **Contract**: Contract terms and conditions
- **ProcurementItem**: Individual items in procurement
- **Invoice**: Invoice details and matching

### Relationships
- Vendor → PurchaseOrder (One-to-Many)
- PurchaseOrder → ProcurementItem (One-to-Many)
- Vendor → Contract (One-to-Many)
- PurchaseOrder → Invoice (One-to-One)

## Business Logic

### Procurement Workflow
1. **Requisition Creation**: Create purchase requisition
2. **Vendor Selection**: AI-powered vendor recommendation
3. **Quote Comparison**: Compare vendor quotes
4. **Purchase Order**: Generate and send PO
5. **Order Tracking**: Track order status
6. **Receipt & Invoice**: Goods receipt and invoice processing
7. **Payment**: Process vendor payment

### Approval Process
- Multi-level approval workflow
- Budget-based approval limits
- Emergency procurement procedures
- Audit trail for all approvals

## Integration

### Internal Integrations
- **Inventory Module**: Stock level monitoring
- **Finance Module**: Budget validation and payments
- **Supply Chain Module**: Supplier performance tracking
- **Analytics Module**: Procurement analytics and reporting

### External Integrations
- **Supplier Portals**: Direct supplier integration
- **Payment Gateways**: Automated payment processing
- **Market Data**: Real-time pricing information
- **Compliance Systems**: Regulatory compliance checks

## Testing

### Running Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Test Coverage
- Controllers: 95%+
- Services: 90%+
- Entities: 85%+
- Overall: 90%+

## Deployment

### Development Environment
```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Run migrations
npm run migration:run
```

### Production Deployment
```bash
# Build application
npm run build

# Start production server
npm run start:prod

# Health check
curl http://localhost:3000/api/procurement/health
```

## Monitoring & Analytics

### Key Metrics
- **Procurement Cycle Time**: Average time from requisition to delivery
- **Vendor Performance**: Delivery time, quality ratings, pricing
- **Cost Savings**: Achieved savings through strategic sourcing
- **Compliance Score**: Regulatory compliance percentage

### Alerts & Notifications
- Budget threshold alerts
- Vendor performance issues
- Contract expiration warnings
- Compliance violations

## Security

### Security Features
- JWT-based authentication
- Role-based access control (RBAC)
- Data encryption at rest and in transit
- Audit logging for all operations
- Input validation and sanitization

### Compliance
- SOX compliance for financial controls
- GDPR compliance for vendor data
- Industry-specific regulations
- Data retention policies

## Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Write comprehensive tests
3. Update API documentation
4. Follow Git flow branching strategy
5. Conduct code reviews

### Code Style
- ESLint configuration for code quality
- Prettier for code formatting
- Husky for pre-commit hooks
- Conventional commits for commit messages

## License

This module is part of the Industry 5.0 ERP system and is licensed under the MIT License.

## Support

For technical support and questions:
- Email: procurement@ezai-mfgninja.com
- Documentation: https://docs.ezai-mfgninja.com/procurement
- Issue Tracker: https://github.com/ezai-mfg-ninja/industry5.0-procurement/issues
