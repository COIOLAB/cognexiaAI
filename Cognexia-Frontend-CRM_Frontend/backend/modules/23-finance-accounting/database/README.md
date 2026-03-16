# Finance & Accounting Database

This directory contains database migrations, seeds, and configuration for the Finance & Accounting module with Supabase integration.

## 🗂️ Directory Structure

```
database/
├── migrations/           # TypeORM migration files
├── seeds/               # Database seed data
├── ormconfig.ts         # TypeORM configuration
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites

1. **Environment Variables**: Ensure your `.env` file contains the required database configuration:
   ```env
   DB_HOST=your-supabase-host
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your-password
   DB_NAME=postgres
   NODE_ENV=development
   DB_LOGGING=true
   ```

2. **Install Dependencies**: Make sure TypeORM and related packages are installed:
   ```bash
   npm install typeorm pg dotenv
   ```

### Running Migrations

1. **Generate Migration** (if needed):
   ```bash
   npx typeorm migration:generate -d database/ormconfig.ts database/migrations/NewMigration
   ```

2. **Run Migrations**:
   ```bash
   npx typeorm migration:run -d database/ormconfig.ts
   ```

3. **Revert Migration**:
   ```bash
   npx typeorm migration:revert -d database/ormconfig.ts
   ```

4. **Show Migration Status**:
   ```bash
   npx typeorm migration:show -d database/ormconfig.ts
   ```

### Running Seed Data

To populate the database with sample data for development and testing:

```typescript
import AppDataSource from './ormconfig';
import { runFinanceAccountingSeed } from './seeds/FinanceAccountingSeed';

// Initialize connection and run seeds
AppDataSource.initialize()
  .then(async () => {
    await runFinanceAccountingSeed(AppDataSource);
    await AppDataSource.destroy();
  })
  .catch(console.error);
```

## 📋 Available Migrations

### 1. `InitialFinanceScheme1692798000000`

**Purpose**: Creates the core financial database schema

**Tables Created**:
- `chart_of_accounts` - Chart of accounts with hierarchical structure
- `journal_entries` - Journal entries with full audit trail
- `journal_lines` - Individual journal entry lines
- `posting_rules` - Automated posting rule engine
- `account_balances` - Account balance tracking by period
- `trial_balances` - Trial balance snapshots
- `payment_transactions` - Payment and receipt transactions

**Features**:
- ✅ PostgreSQL enums for data integrity
- ✅ Comprehensive indexes for performance
- ✅ Database triggers for automation
- ✅ Views for common queries
- ✅ Full-text search capabilities
- ✅ Multi-currency support
- ✅ Hierarchical account structures

### 2. `AuditLogging1692798001000`

**Purpose**: Adds comprehensive audit logging and compliance features

**Tables Created**:
- `audit_log` - Complete audit trail of all changes
- `financial_periods` - Financial period management

**Features**:
- ✅ Automatic audit triggers on all tables
- ✅ Period closure validation
- ✅ Posting date validation
- ✅ Compliance tracking
- ✅ User activity logging

## 🌱 Seed Data

The `FinanceAccountingSeed` provides comprehensive test data:

### Chart of Accounts (50+ accounts)
- **Assets**: Cash, receivables, inventory, equipment
- **Liabilities**: Payables, accruals, debt
- **Equity**: Common stock, retained earnings
- **Revenue**: Product sales, service revenue, interest income
- **Expenses**: COGS, operating expenses, payroll

### Sample Transactions
- Initial capital investment
- Equipment purchases
- Sales transactions (cash and credit)
- Inventory purchases
- Payroll processing
- Operating expenses

### Financial Data
- Account balances by period
- Trial balance generation
- Payment transaction history
- Posting rules for automation

## 🔧 Configuration

### Supabase Integration

The configuration automatically detects Supabase settings:

```typescript
// Supabase SSL configuration
ssl: process.env.NODE_ENV === 'production' ? {
  rejectUnauthorized: false,
} : false,

// Connection pooling for Supabase
extra: {
  max: 10,
  min: 2,
  keepAlive: true,
  // ... other settings
}
```

### Environment-Specific Settings

- **Development**: Full logging, no SSL
- **Production**: SSL required, optimized pooling
- **Testing**: In-memory or separate test database

## 🏗️ Database Schema Overview

### Core Relationships

```
chart_of_accounts (1) ←→ (N) journal_lines ←→ (1) journal_entries
         ↓                                              ↓
account_balances                              payment_transactions
         ↓
   trial_balances
```

### Key Features

1. **Referential Integrity**: Foreign keys ensure data consistency
2. **Data Validation**: Check constraints prevent invalid data
3. **Audit Trail**: Every change is logged automatically
4. **Performance**: Strategic indexes for fast queries
5. **Scalability**: Optimized for large transaction volumes

## 📊 Performance Considerations

### Indexes Created

- **Primary keys**: UUID with btree indexes
- **Foreign keys**: All relationships indexed
- **Search fields**: Account codes, transaction numbers
- **Date ranges**: Transaction dates, periods
- **Full-text**: Descriptions and names
- **Composite**: Multi-column indexes for common queries

### Query Optimization

- **Views**: Pre-computed joins for common reports
- **Triggers**: Automatic calculations (totals, balances)
- **Partitioning**: Ready for date-based partitioning
- **Caching**: Redis integration for frequent queries

## 🛡️ Security & Compliance

### Audit Features

- Complete change tracking
- User identification
- Timestamp precision
- IP address logging
- Session tracking
- Reason codes

### Data Integrity

- Double-entry bookkeeping enforced
- Period closure controls
- Posting date validation
- Balance verification
- Currency consistency

### Compliance Ready

- SOX-compliant audit trails
- GDPR data tracking
- Financial reporting standards
- Multi-tenant isolation

## 🚨 Troubleshooting

### Common Issues

1. **Connection Errors**:
   ```bash
   # Check environment variables
   echo $DB_HOST $DB_PORT $DB_USERNAME
   
   # Test connection
   npx typeorm query -d database/ormconfig.ts "SELECT version();"
   ```

2. **Migration Failures**:
   ```bash
   # Check migration status
   npx typeorm migration:show -d database/ormconfig.ts
   
   # Revert last migration
   npx typeorm migration:revert -d database/ormconfig.ts
   ```

3. **Seed Data Issues**:
   - Ensure migrations are run first
   - Check for foreign key constraints
   - Verify test data UUIDs are valid

### Performance Issues

1. **Slow Queries**: Check if indexes are being used
2. **Lock Contention**: Review concurrent operations
3. **Memory Usage**: Monitor connection pool settings

## 📚 Additional Resources

- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Financial Database Design Best Practices](https://example.com)

## 🤝 Contributing

When adding new migrations or seeds:

1. Follow the naming convention: `timestamp-DescriptiveName.ts`
2. Include both `up()` and `down()` methods
3. Add comprehensive indexes
4. Include audit triggers for new tables
5. Update this README with changes
6. Test with sample data

---

**Need Help?** Contact the Finance & Accounting development team or refer to the main project documentation.
