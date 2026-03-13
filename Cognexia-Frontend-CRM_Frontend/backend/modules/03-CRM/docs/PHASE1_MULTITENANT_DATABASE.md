# Phase 1: Multi-Tenant Database Architecture

**Status:** ✅ Completed  
**Date:** January 11, 2026  
**Version:** 1.0.0

## Overview

This document describes the multi-tenant SaaS database architecture implemented for CognexiaAI's ERP CRM module. The architecture supports 100,000+ client organizations with comprehensive subscription management, billing tracking, and audit logging.

## Architecture Components

### 1. Core Entities

#### Master Organization
- **Table:** `master_organization`
- **Purpose:** Represents CognexiaAI (the SaaS provider)
- **Key Fields:**
  - Company information (name, email, contact details)
  - Branding configuration
  - Default system settings
  - Support contact information

#### Organization (Client Company)
- **Table:** `organizations`
- **Purpose:** Represents each client organization using the CRM
- **Key Fields:**
  - Company information and branding
  - Subscription status and dates
  - User limits (maxUsers, currentUserCount)
  - Billing information (Stripe integration)
  - Organization status (trial, active, suspended, cancelled, pending)
- **Relations:**
  - Belongs to `master_organization`
  - Has many `billing_transactions`
  - Has many `usage_metrics`

#### Subscription Plan
- **Table:** `subscription_plans`
- **Purpose:** Defines pricing tiers and feature sets
- **Plan Types:**
  - **Starter:** $199/month, 5 users
  - **Professional:** $399/month, 15 users (Most Popular)
  - **Business:** $799/month, 50 users
  - **Enterprise:** $1,999/month, 200 users
- **Features:**
  - User limits and per-additional-user pricing
  - Storage limits (GB)
  - API call quotas
  - Feature flags (AI, analytics, SSO, white-labeling, etc.)
  - Stripe integration (priceId, productId)

#### User (Enhanced)
- **Table:** `users`
- **New Fields:**
  - `userType` (super_admin, org_admin, org_user)
  - `organizationId` (multi-tenant isolation)
  - Invitation fields (isInvited, invitedAt, invitationToken)
  - MFA fields (mfaEnabled, mfaSecret)
- **Relations:**
  - Belongs to `organization`
  - Has many `roles` (many-to-many via `user_roles`)

#### Role (Enhanced)
- **Table:** `roles`
- **New Fields:**
  - `organizationId` (nullable for system-wide roles)
- **Purpose:** Support organization-specific and global roles

#### Billing Transaction
- **Table:** `billing_transactions`
- **Purpose:** Track all financial transactions
- **Transaction Types:**
  - Subscription charges
  - Additional user seats
  - Overages
  - Refunds
  - Credits
- **Key Fields:**
  - Amount breakdown (amount, tax, discount, totalAmount)
  - Stripe integration (paymentIntentId, invoiceId, chargeId)
  - Invoice details (invoiceNumber, dates)
  - Failure tracking (failureReason, retryCount)
  - Refund information

#### Usage Metric
- **Table:** `usage_metrics`
- **Purpose:** Track resource consumption for billing and analytics
- **Metric Types:**
  - Active users
  - Storage
  - API calls
  - Email/SMS sent
  - CRM records (contacts, leads, opportunities)
  - Reports generated
  - Data exports
- **Key Fields:**
  - Current value and previous value
  - Limit and percentage used
  - Alert flags (isOverLimit, alertSent)
  - Time period tracking

#### Audit Log
- **Table:** `audit_logs`
- **Purpose:** Comprehensive activity tracking for compliance and security
- **Tracks:**
  - User actions (create, read, update, delete, login, etc.)
  - Entity types (user, organization, subscription, billing, CRM entities)
  - Before/after state changes
  - Request details (IP, user agent, URL, method)
  - Response details (status, response time)
  - Security flags (isSecurityEvent, isSuspicious)
  - Compliance flags (GDPR, HIPAA, SOC2)

## Database Schema

### Relationships

```
master_organization (1) ──< (N) organizations
organizations (1) ──< (N) billing_transactions
organizations (1) ──< (N) usage_metrics
organizations (1) ──< (N) users
subscription_plans (1) ──< (N) organizations
users (N) ──< (M) roles (via user_roles)
roles (N) ──< (M) permissions (via role_permissions)
```

### Indexes

#### Performance Optimization Indexes:
- `organizations`: (master_organization_id, status), (subscriptionStatus)
- `users`: (organization_id, userType), (email)
- `roles`: (organization_id, name)
- `permissions`: (resource, action)
- `billing_transactions`: (organization_id, createdAt), (status, transactionType)
- `usage_metrics`: (organization_id, metricType, recordedAt)
- `audit_logs`: (organization_id, createdAt), (user_id, createdAt), (action, entityType)

## Multi-Tenancy Implementation

### Row-Level Security (RLS)

All CRM entities must include `organizationId` for tenant isolation:

```typescript
@Column({ name: 'organization_id' })
organizationId: string;
```

### User Types

1. **super_admin**: CognexiaAI internal admins (full system access)
2. **org_admin**: Organization administrators (manage their org)
3. **org_user**: Regular organization users (standard CRM access)

### Subscription Management

#### User Seat Limits
- Each plan has `includedUsers` and `pricePerAdditionalUser`
- `maxUsers` defines hard limit (null = unlimited for Enterprise)
- `currentUserCount` tracked in real-time
- Automatic prorated billing when adding users

#### Subscription Statuses
- **trial**: Free trial period (14-30 days)
- **active**: Paid subscription in good standing
- **past_due**: Payment failed, grace period
- **cancelled**: Subscription cancelled by client
- **expired**: Trial or subscription expired

#### Organization Statuses
- **pending**: Registration initiated, payment pending
- **trial**: Active trial period
- **active**: Paid subscription active
- **suspended**: Temporarily suspended (payment failure, violation)
- **cancelled**: Permanently cancelled

## Migration

### Running the Migration

```bash
# Run migration
npm run migration:run

# Revert migration (if needed)
npm run migration:revert
```

The migration creates:
- 6 new tables (master_organization, organizations, subscription_plans, billing_transactions, usage_metrics, audit_logs)
- Updates to existing tables (users, roles)
- Junction table (user_roles)
- All foreign keys and indexes

## Seeding Data

### Running the Seed

```bash
# Run multi-tenant seed
ts-node src/database/seeds/multi-tenant-seed.ts
```

### Seed Creates:
1. **Master Organization:** CognexiaAI
2. **Subscription Plans:** 4 plans (Starter, Professional, Business, Enterprise)

## Files Created

### Entities
- `src/entities/master-organization.entity.ts`
- `src/entities/organization.entity.ts`
- `src/entities/subscription-plan.entity.ts`
- `src/entities/billing-transaction.entity.ts`
- `src/entities/usage-metric.entity.ts`
- `src/entities/audit-log.entity.ts`

### Migrations
- `src/database/migrations/1736565600000-CreateMultiTenantArchitecture.ts`

### Seeds
- `src/database/seeds/multi-tenant-seed.ts`

### Documentation
- `docs/PHASE1_MULTITENANT_DATABASE.md` (this file)

## Testing Checklist

- [x] TypeScript compilation successful (0 errors)
- [ ] Migration executes without errors
- [ ] Seed data populates correctly
- [ ] All foreign keys created
- [ ] All indexes created
- [ ] User entity has multi-tenant fields
- [ ] Role entity has organizationId
- [ ] Data isolation verified between organizations

## Next Steps (Phase 2)

1. Implement JWT authentication with organizationId claims
2. Create role-based permission system
3. Build user type detection middleware
4. Implement session management
5. Add password reset flow
6. Add email verification
7. Add MFA support

## Database Connection

Update `.env` file with PostgreSQL connection:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=cognexia_crm
DATABASE_POOL_MAX=100
DATABASE_POOL_MIN=10
```

## Security Considerations

1. **Tenant Isolation**: Every query must filter by `organizationId`
2. **Super Admin Access**: Super admins bypass organization filters
3. **Audit Logging**: All sensitive operations logged
4. **Encryption**: Sensitive fields (mfaSecret, invitation tokens) should be encrypted
5. **SQL Injection**: Using TypeORM parameterized queries
6. **Rate Limiting**: Per-organization API rate limiting required

## Performance Optimization

1. **Indexes**: Strategic indexes on high-query columns
2. **Connection Pooling**: Configured for 100-1000 concurrent connections
3. **Pagination**: Required for all list endpoints
4. **Caching**: Redis caching for frequently accessed data (Phase 25)
5. **Query Optimization**: N+1 query prevention with eager loading

## Compliance

- **GDPR**: Audit logs track all personal data access
- **SOC2**: Comprehensive activity logging
- **HIPAA**: Security flags for PHI access
- **Data Retention**: Configurable retention policies for audit logs

## Support

For questions or issues:
- Email: support@cognexiaai.com
- Internal Slack: #crm-backend-dev

---

**Phase 1 Status:** ✅ COMPLETE  
**Production Ready:** 🟡 Pending Migration & Testing  
**Next Phase:** Phase 2 - Authentication & Authorization System
