# User Tier Allocation System - Complete Guide

## Overview

The User Tier Allocation System allows **Super Admins** to manage user limits for organizations through a three-tier system:
- **Basic**: 1 user
- **Premium**: 10 users  
- **Advanced**: Unlimited users

This system is fully integrated between the **Super Admin Portal** and **Client Admin Portal**.

---

## Architecture

### **Backend Components**

#### 1. **Database Schema** (`organization.entity.ts`)
```typescript
userTierConfig?: {
  basic: { enabled: boolean; maxUsers: number };
  premium: { enabled: boolean; maxUsers: number };
  advanced: { enabled: boolean; maxUsers: number | null }; // null = unlimited
  activeTier: 'basic' | 'premium' | 'advanced';
};
```

#### 2. **DTOs** (`user-tier.dto.ts`)
- `UserTier` enum: BASIC, PREMIUM, ADVANCED
- `TierConfiguration`: Configuration for each tier
- `UpdateUserTierDto`: Update a specific tier
- `UserTierAllocationDto`: Current allocation status
- `UserAllocationResponse`: Response from update operations

#### 3. **Service** (`user-tier.service.ts`)
**Key Methods:**
- `getUserTierAllocation(organizationId)` - Get current allocation
- `updateUserTier(organizationId, dto, performedBy)` - Update tier (Super Admin only)
- `canAddUser(organizationId)` - Check if org can add users
- `validateUserAddition(organizationId)` - Throws error if limit reached
- `initializeDefaultTier(organizationId)` - Initialize Basic tier by default
- `getAllOrganizationTiers(performedBy)` - Get all orgs (Super Admin only)

**Business Logic:**
- Only ONE tier can be active at a time
- Priority: Advanced > Premium > Basic
- Automatically updates `organization.maxUsers` based on active tier
- Super Admins bypass all limits

#### 4. **Controller** (`user-tier.controller.ts`)
**Endpoints:**
```
GET    /user-tiers/organization/:id                 - Get allocation
PUT    /user-tiers/organization/:id                 - Update tier (Super Admin)
GET    /user-tiers/organization/:id/can-add-user    - Check if can add
POST   /user-tiers/organization/:id/validate        - Validate addition
POST   /user-tiers/organization/:id/initialize      - Initialize default
GET    /user-tiers/all                              - Get all (Super Admin)
```

#### 5. **Integration with User Management** (`user-management.service.ts`)
- `createUser()` - Validates tier limits before creation
- `inviteUser()` - Validates tier limits before sending invite
- Uses `UserTierService` for validation

---

### **Frontend Components**

#### **Super Admin Portal**

##### 1. **UserTierManager Component** (`user-tier-manager.tsx`)
**Features:**
- Visual status of current allocation
- Toggle switches for each tier (Basic, Premium, Advanced)
- Real-time user count display
- Automatic tier priority handling
- Success/error notifications

**Usage:**
```tsx
<UserTierManager
  organizationId="org-uuid"
  organizationName="Acme Corp"
  onUpdate={() => refreshData()}
/>
```

**UI Elements:**
- **Current Status Card**: Shows active tier, user count, and limit
- **Tier Management Card**: Enable/disable toggles for each tier
- **Visual Indicators**:
  - Basic: Gray user icon (1 user)
  - Premium: Purple crown icon (10 users)
  - Advanced: Blue infinity icon (unlimited)

##### 2. **Organization Detail Page Integration** (`organizations/[id]/page.tsx`)
- Added UserTierManager below seat usage section
- Automatic refresh on tier updates
- Integrated with existing organization data

---

#### **Client Admin Portal**

##### 1. **UserLimitStatus Component** (`user-limit-status.tsx`)
**Features:**
- Shows current tier and usage percentage
- Progress bar for visual representation
- Warnings when approaching limit (80%+)
- Error alerts when limit reached
- Upgrade suggestions with tier comparison

**States:**
- ✅ **Normal**: < 80% usage
- ⚠️ **Warning**: 80-99% usage (yellow alert)
- 🚫 **Limit Reached**: 100% usage (red alert)

**Upgrade Prompts:**
- Shows available upgrade options
- Contact information for sales
- Feature comparison

**Usage:**
```tsx
<UserLimitStatus organizationId={currentOrg.id} />
```

---

## User Flows

### **Super Admin: Creating Organization**

1. Navigate to **Organizations** > **Create Organization**
2. Fill in organization details
3. System automatically initializes **Basic tier** (1 user)
4. Admin can immediately adjust tiers on detail page

### **Super Admin: Managing User Tiers**

1. Navigate to **Organizations** > Select organization
2. Scroll to **User Tier Management** section
3. Toggle desired tier:
   - Enable **Basic** → Max 1 user
   - Enable **Premium** → Max 10 users
   - Enable **Advanced** → Unlimited users
4. System automatically:
   - Disables other tiers (priority: Advanced > Premium > Basic)
   - Updates `organization.maxUsers`
   - Creates audit log entry
5. Confirmation toast appears

### **Client Admin: Inviting Users**

1. Navigate to **Team** > **Invite User**
2. System checks current allocation:
   - ✅ If under limit → Invite proceeds
   - 🚫 If at limit → Shows error with upgrade prompt
3. If at limit:
   - Error message: "User limit reached for [TIER] tier"
   - Shows UserLimitStatus component with upgrade options
   - Contact info for admin/sales

### **Client Admin: Viewing Limits**

1. Dashboard shows **UserLimitStatus** widget
2. Real-time updates of:
   - Current users / Max users
   - Usage percentage
   - Available seats
3. Warnings appear automatically when approaching limit

---

## API Examples

### **Get Organization Tier Allocation**
```bash
GET /api/crm/user-tiers/organization/:organizationId
Authorization: Bearer {token}

Response:
{
  "organizationId": "uuid",
  "activeTier": "premium",
  "tierConfig": {
    "basic": { "enabled": false, "maxUsers": 1 },
    "premium": { "enabled": true, "maxUsers": 10 },
    "advanced": { "enabled": false, "maxUsers": null }
  },
  "currentUserCount": 7,
  "maxAllowedUsers": 10,
  "canAddUsers": true
}
```

### **Update Tier (Super Admin Only)**
```bash
PUT /api/crm/user-tiers/organization/:organizationId
Authorization: Bearer {super-admin-token}
Content-Type: application/json

{
  "tier": "advanced",
  "enabled": true
}

Response:
{
  "success": true,
  "message": "User tier advanced enabled successfully",
  "allocation": { ... }
}
```

### **Check if Can Add User**
```bash
GET /api/crm/user-tiers/organization/:organizationId/can-add-user
Authorization: Bearer {token}

Response:
{
  "canAdd": false,
  "reason": "User limit reached for PREMIUM tier (10/10). Please upgrade to add more users."
}
```

---

## Validation Flow

### **User Creation Validation**
```
1. User requests to create/invite user
2. System calls validateUserAddition(organizationId)
3. Service checks:
   - Get active tier
   - Get max users for tier
   - Count current active users
   - Compare: currentUsers < maxUsers
4. If limit reached:
   - Throw BadRequestException with upgrade message
   - Frontend shows error + upgrade prompt
5. If under limit:
   - Allow user creation
   - Increment currentUserCount
```

---

## Database Migration

### **Add User Tier Config Column**
```sql
ALTER TABLE organizations 
ADD COLUMN user_tier_config JSONB DEFAULT '{"basic":{"enabled":true,"maxUsers":1},"premium":{"enabled":false,"maxUsers":10},"advanced":{"enabled":false,"maxUsers":null}}';
```

### **Initialize Existing Organizations**
```typescript
// Run once for existing organizations
for (const org of existingOrganizations) {
  await userTierService.initializeDefaultTier(org.id);
}
```

---

## Security & Permissions

### **Super Admin Only**
- Update tier settings
- View all organization tiers
- Bypass user limits

### **Org Admin**
- View own organization limits
- See upgrade prompts
- Cannot modify tiers (must contact Super Admin)

### **Org User**
- View team page with limit status
- Cannot invite users (admin only)

---

## Error Handling

### **Common Errors**

1. **User Limit Reached**
```typescript
throw new BadRequestException(
  `User limit reached for ${tier} tier (${current}/${max}). Please upgrade to add more users.`
);
```

2. **Invalid Tier**
```typescript
throw new BadRequestException('Invalid tier specified');
```

3. **Permission Denied**
```typescript
throw new ForbiddenException('Only super admins can manage user tiers');
```

---

## Testing Scenarios

### **Test 1: Basic Tier Limit**
1. Enable Basic tier for org
2. Create 1 user → Success
3. Try to create 2nd user → Error: "User limit reached for BASIC tier (1/1)"

### **Test 2: Tier Upgrade**
1. Start with Basic tier (1/1 users)
2. Super admin enables Premium tier
3. System updates maxUsers to 10
4. Org can now add 9 more users

### **Test 3: Advanced Tier**
1. Enable Advanced tier
2. Try to add 100 users → All succeed
3. No limit enforced

### **Test 4: Tier Priority**
1. Enable all three tiers
2. System activates Advanced (highest priority)
3. Organization gets unlimited users

---

## Monitoring & Analytics

### **Audit Logs**
Every tier change is logged:
```typescript
{
  action: 'UPDATE',
  entityType: 'ORGANIZATION',
  entityId: orgId,
  description: 'Updated user tier: premium to enabled',
  metadata: {
    tier: 'premium',
    enabled: true,
    newMaxUsers: 10
  }
}
```

### **Metrics to Track**
- Organizations by active tier
- User allocation utilization rate
- Tier upgrade requests
- Limit-reached incidents

---

## Customization

### **Modify Tier Limits**
Edit default values in `UserTierService`:
```typescript
private getDefaultTierConfig(): TierConfiguration {
  return {
    basic: { enabled: false, maxUsers: 5 },    // Changed from 1
    premium: { enabled: false, maxUsers: 50 }, // Changed from 10
    advanced: { enabled: false, maxUsers: null },
  };
}
```

### **Add Custom Tier**
1. Add new tier to `UserTier` enum
2. Update `TierConfiguration` interface
3. Add logic in `getActiveTier()` and `getMaxUsersForTier()`
4. Update UI components with new tier option

---

## Deployment Checklist

- [ ] Run database migration to add `user_tier_config` column
- [ ] Initialize default tiers for existing organizations
- [ ] Deploy backend with new endpoints
- [ ] Deploy Super Admin Portal with UserTierManager
- [ ] Deploy Client Admin Portal with UserLimitStatus
- [ ] Test tier toggling end-to-end
- [ ] Test user creation with limits
- [ ] Verify audit logs are created
- [ ] Update API documentation
- [ ] Train support team on tier management

---

## Support & Troubleshooting

### **Issue: Tier not updating**
- Check if user is Super Admin
- Verify organization exists
- Check browser console for API errors
- Review audit logs for tier changes

### **Issue: User can't be added**
- Check current tier allocation
- Verify user count vs. max users
- Ensure user is Org Admin (for invites)
- Check if organization is active

### **Issue: Upgrade not showing**
- Verify UserLimitStatus component is mounted
- Check if allocation API is returning data
- Ensure proper auth token in localStorage

---

## Future Enhancements

1. **Self-Service Upgrades**: Allow orgs to upgrade tiers via payment
2. **Tier Analytics**: Dashboard showing tier distribution
3. **Usage Forecasting**: Predict when orgs will hit limits
4. **Automatic Upgrades**: Auto-upgrade when payment confirmed
5. **Custom Tiers**: Per-org custom user limits
6. **Granular Permissions**: Different limits for different user types

---

## Contact

For questions or issues:
- **Backend**: Contact DevOps team
- **Frontend**: Contact UI/UX team
- **Business Logic**: Contact Product team
- **Support**: support@cognexiaai.com

---

**Last Updated**: January 2026
**Version**: 1.0
**Status**: ✅ Production Ready
