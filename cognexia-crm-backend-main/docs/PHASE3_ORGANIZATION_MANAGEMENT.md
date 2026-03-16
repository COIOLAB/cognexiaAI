# Phase 3: Organization Management APIs

**Status:** ✅ Completed  
**Date:** January 11, 2026  
**Version:** 1.0.0

## Overview

Implemented comprehensive REST APIs for managing client organizations with full CRUD operations, status management, branding/customization, and super admin controls for CognexiaAI's multi-tenant CRM system.

## Components Created

### 1. Organization Service (`services/organization.service.ts`)

**Purpose:** Business logic for organization management

**Key Methods:**
- `create()` - Create new client organization (super admin only)
- `findById()` - Get organization details
- `list()` - List all organizations with filtering (super admin only)
- `update()` - Update organization information
- `suspend()` - Suspend organization (super admin only)
- `activate()` - Reactivate organization (super admin only)
- `delete()` - Soft delete organization (super admin only)
- `getStatistics()` - Get organization metrics

**Lines of Code:** 529

### 2. Organization Controller (`controllers/organization.controller.ts`)

**Purpose:** REST API endpoints for organization management

**Lines of Code:** 238

## API Endpoints

### Organization CRUD

#### Create Organization
```
POST /organizations
Authorization: Bearer {token}
User Type: super_admin only

Body:
{
  "name": "Acme Corporation",
  "email": "admin@acme.com",
  "phone": "+1-555-0123",
  "address": "123 Business St, City, State 12345",
  "website": "https://acme.com",
  "subscriptionPlanId": "uuid",
  "contactPersonName": "John Doe",
  "contactPersonEmail": "john@acme.com",
  "contactPersonPhone": "+1-555-0124",
  "trialDays": 14
}

Response: 201 Created
{
  "id": "uuid",
  "name": "Acme Corporation",
  "email": "admin@acme.com",
  "status": "trial",
  "subscriptionStatus": "trial",
  "trialEndsAt": "2026-01-25T00:00:00.000Z",
  "maxUsers": 5,
  "currentUserCount": 0,
  ...
}
```

#### List Organizations
```
GET /organizations?status=active&page=1&limit=50&search=acme
Authorization: Bearer {token}
User Type: super_admin only

Query Parameters:
- status: trial | active | suspended | cancelled | pending
- subscriptionStatus: trial | active | past_due | cancelled | expired
- search: Search by name, email, or contact person
- page: Page number (default: 1)
- limit: Results per page (default: 50)

Response: 200 OK
{
  "organizations": [...],
  "total": 150,
  "page": 1,
  "limit": 50
}
```

#### Get Organization
```
GET /organizations/:id
Authorization: Bearer {token}
User Type: super_admin (any org) | org_admin (own org only)

Response: 200 OK
{
  "id": "uuid",
  "name": "Acme Corporation",
  "email": "admin@acme.com",
  "status": "active",
  "subscriptionStatus": "active",
  "maxUsers": 15,
  "currentUserCount": 8,
  "billingTransactions": [...],
  "usageMetrics": [...],
  ...
}
```

#### Get My Organization
```
GET /organizations/me/organization
Authorization: Bearer {token}
User Type: All authenticated users

Response: 200 OK
{
  "id": "uuid",
  "name": "My Company",
  ...
}
```

#### Update Organization
```
PUT /organizations/:id
Authorization: Bearer {token}
User Type: super_admin (any org) | org_admin (own org only)

Body:
{
  "name": "Acme Corp Updated",
  "phone": "+1-555-9999",
  "settings": {
    "timezone": "America/New_York",
    "dateFormat": "MM/DD/YYYY",
    "language": "en"
  },
  "branding": {
    "primaryColor": "#0066cc",
    "secondaryColor": "#003366",
    "logoUrl": "https://cdn.acme.com/logo.png"
  }
}

Response: 200 OK
{
  "id": "uuid",
  "name": "Acme Corp Updated",
  ...
}
```

### Organization Status Management

#### Suspend Organization
```
POST /organizations/:id/suspend
Authorization: Bearer {token}
User Type: super_admin only

Body:
{
  "reason": "Payment failure - multiple attempts"
}

Response: 200 OK
{
  "id": "uuid",
  "name": "Acme Corporation",
  "status": "suspended",
  "isActive": false,
  "metadata": {
    "suspensionReason": "Payment failure - multiple attempts",
    "suspendedAt": "2026-01-11T05:00:00.000Z",
    "suspendedBy": "admin-user-id"
  }
}
```

#### Activate Organization
```
POST /organizations/:id/activate
Authorization: Bearer {token}
User Type: super_admin only

Response: 200 OK
{
  "id": "uuid",
  "name": "Acme Corporation",
  "status": "active",
  "isActive": true
}
```

#### Delete Organization
```
DELETE /organizations/:id
Authorization: Bearer {token}
User Type: super_admin only

Response: 200 OK
{
  "message": "Organization deleted successfully"
}

Note: Soft delete - sets status to 'cancelled' and deletedAt timestamp
```

### Organization Statistics

#### Get Statistics
```
GET /organizations/:id/statistics
Authorization: Bearer {token}
User Type: super_admin (any org) | org_admin (own org only)

Response: 200 OK
{
  "id": "uuid",
  "name": "Acme Corporation",
  "status": "active",
  "subscriptionStatus": "active",
  "userCount": 8,
  "maxUsers": 15,
  "userPercentage": 53.33,
  "trialEndsAt": null,
  "monthlyRevenue": 399.00,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

## Features Implemented

### CRUD Operations
✅ Create organization (super admin)  
✅ Read organization (super admin, org admin)  
✅ Update organization (super admin, org admin for own)  
✅ Delete organization - soft delete (super admin)  
✅ List organizations with pagination (super admin)  

### Filtering & Search
✅ Filter by status (trial, active, suspended, etc.)  
✅ Filter by subscription status  
✅ Search by name, email, contact person  
✅ Pagination support (page, limit)  

### Status Management
✅ Suspend organization with reason  
✅ Activate/reactivate organization  
✅ Track suspension metadata  

### Branding & Customization
✅ Custom colors (primary, secondary)  
✅ Custom logo and favicon URLs  
✅ Organization settings (timezone, date format, language)  
✅ Feature flags  

### Security & Auditing
✅ Permission checks (super admin vs org admin)  
✅ Audit logging for all operations  
✅ Change tracking (before/after states)  
✅ Security event flags  

### Business Logic
✅ Email uniqueness validation  
✅ Trial period calculation  
✅ User count tracking  
✅ Subscription plan integration  
✅ Master organization (CognexiaAI) reference  

## Permission Model

### Super Admin (super_admin)
- Create organizations
- List all organizations
- View any organization
- Update any organization
- Suspend/activate any organization
- Delete any organization
- View statistics for any organization

### Organization Admin (org_admin)
- View own organization
- Update own organization (limited fields)
- View own organization statistics
- Cannot create, suspend, activate, or delete organizations

### Organization User (org_user)
- View own organization (via `/me/organization`)
- Cannot modify organization

## Audit Logging

All operations are logged:
- ✅ Organization created
- ✅ Organization updated (with change tracking)
- ✅ Organization suspended (security event)
- ✅ Organization activated (security event)
- ✅ Organization deleted (security event)

**Logged Data:**
- User who performed action
- Organization ID
- Action type
- Description
- Before/after changes (for updates)
- Timestamp
- Security event flag

## Data Model

### Organization Fields
```typescript
{
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  logoUrl?: string;
  
  // Relationships
  masterOrganizationId: string;
  subscriptionPlanId?: string;
  
  // Subscription
  subscriptionStatus: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  trialEndsAt?: Date;
  
  // User Limits
  maxUsers: number;
  currentUserCount: number;
  
  // Billing (Stripe)
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  monthlyRevenue: number;
  currency: string;
  lastBillingDate?: Date;
  nextBillingDate?: Date;
  
  // Status
  status: 'pending' | 'trial' | 'active' | 'suspended' | 'cancelled';
  isActive: boolean;
  
  // Branding
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
  };
  
  // Settings
  settings?: {
    timezone?: string;
    dateFormat?: string;
    timeFormat?: string;
    language?: string;
    features?: string[];
  };
  
  // Contact Person
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  
  // Metadata
  metadata?: any;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

## Usage Examples

### Create Organization (Super Admin)
```typescript
const response = await fetch('/organizations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'New Client Corp',
    email: 'admin@newclient.com',
    subscriptionPlanId: 'starter-plan-id',
    contactPersonName: 'Jane Smith',
    contactPersonEmail: 'jane@newclient.com'
  })
});
```

### Update Organization Settings (Org Admin)
```typescript
const response = await fetch(`/organizations/${orgId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    settings: {
      timezone: 'America/Los_Angeles',
      dateFormat: 'DD/MM/YYYY',
      language: 'en'
    },
    branding: {
      primaryColor: '#FF6600',
      secondaryColor: '#CC5200'
    }
  })
});
```

### Suspend Organization (Super Admin)
```typescript
const response = await fetch(`/organizations/${orgId}/suspend`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    reason: 'Terms of service violation'
  })
});
```

### List Organizations with Filters (Super Admin)
```typescript
const params = new URLSearchParams({
  status: 'active',
  subscriptionStatus: 'active',
  search: 'tech',
  page: '1',
  limit: '25'
});

const response = await fetch(`/organizations?${params}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

## Integration with Other Modules

### Dependencies
- User entity (for audit logging)
- MasterOrganization entity
- SubscriptionPlan entity
- AuditLog entity

### Used By
- User Management (Phase 4) - user.organizationId
- Subscription Management (Phase 5) - subscription changes
- Billing (Phase 6) - payment processing
- All CRM features - row-level security

## Files Created

### Services
- `src/services/organization.service.ts` - Business logic (529 lines)

### Controllers
- `src/controllers/organization.controller.ts` - REST endpoints (238 lines)

### Documentation
- `docs/PHASE3_ORGANIZATION_MANAGEMENT.md` (this file)

## Testing Checklist

- [x] TypeScript compilation successful
- [ ] Create organization (super admin)
- [ ] Create organization fails for non-super-admin
- [ ] List organizations with pagination
- [ ] List organizations with filters
- [ ] Search organizations
- [ ] Get organization by ID
- [ ] Get own organization
- [ ] Update organization (super admin)
- [ ] Update own organization (org admin)
- [ ] Update fails for wrong organization
- [ ] Suspend organization
- [ ] Activate organization
- [ ] Delete organization (soft delete)
- [ ] Get organization statistics
- [ ] Audit logs created for all operations
- [ ] Email uniqueness validation
- [ ] Trial period calculation

## Error Handling

All endpoints include proper error handling:
- `400 Bad Request` - Invalid data, duplicate email
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Organization not found

## Next Steps (Phase 4)

1. User Management & Invitation System
2. Invite users with seat limit validation
3. Accept invitation flow
4. List organization users
5. Update user roles
6. Deactivate/reactivate users
7. Bulk user operations
8. User activity tracking

---

**Phase 3 Status:** ✅ COMPLETE  
**Production Ready:** 🟡 Pending Testing  
**Next Phase:** Phase 4 - User Management & Invitation System
