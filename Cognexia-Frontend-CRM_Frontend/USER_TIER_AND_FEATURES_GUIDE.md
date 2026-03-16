# User Tier & Feature Management System - Complete Guide

## 📋 Overview

This system allows Super Admin to control:
1. **User Limits** per organization (Basic: 1 user, Premium: 10 users, Advanced: Unlimited)
2. **Feature Access** per organization (enable/disable specific features)
3. **Subscription Tiers** (Basic, Premium, Advanced)

## 🎯 Where to Find It

### 1. **Main Organizations Page** (`/organizations`)
- View all organizations with their current tier and user count
- Quick access buttons to manage tiers

### 2. **Organization Detail Page** (`/organizations/[id]`)
- Full user tier management section
- Feature management panel
- Current status and usage metrics

### 3. **System Config Page** (`/config`)
- Global feature flags
- System-wide settings

## 🔧 Components Created

### Frontend Components

#### 1. `UserTierManager` 
**Location**: `frontend/super-admin-portal/src/components/organizations/user-tier-manager.tsx`

**Purpose**: Manage user tiers (Basic/Premium/Advanced) for an organization

**Features**:
- Visual display of current tier and user count
- Toggle switches for each tier
- Real-time status updates
- User limit enforcement

**Usage**:
```tsx
import { UserTierManager } from '@/components/organizations/user-tier-manager';

<UserTierManager
  organizationId={org.id}
  organizationName={org.name}
  onUpdate={() => refetchData()}
/>
```

#### 2. `OrganizationFeaturesManager`
**Location**: `frontend/super-admin-portal/src/components/organizations/organization-features-manager.tsx`

**Purpose**: Enable/disable specific features per organization

**Features**:
- Categorized feature list (CRM, Analytics, Marketing, etc.)
- Feature descriptions and tier requirements
- Toggle individual features
- Visual indicators for tier-specific features

**Usage**:
```tsx
import { OrganizationFeaturesManager } from '@/components/organizations/organization-features-manager';

<OrganizationFeaturesManager
  organizationId={org.id}
  organizationName={org.name}
  currentTier="premium"
  onUpdate={() => refetchData()}
/>
```

#### 3. `QuickTierManagerDialog`
**Location**: `frontend/super-admin-portal/src/components/organizations/quick-tier-manager-dialog.tsx`

**Purpose**: Quick tier management from organizations list

**Features**:
- Compact dialog view
- Side-by-side tier comparison
- Feature list per tier
- One-click tier upgrade/downgrade

**Usage**:
```tsx
import { QuickTierManagerDialog } from '@/components/organizations/quick-tier-manager-dialog';

const [dialogOpen, setDialogOpen] = useState(false);

<Button onClick={() => setDialogOpen(true)}>
  Manage Tier
</Button>

<QuickTierManagerDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  organizationId={org.id}
  organizationName={org.name}
  currentTier={org.tier}
  onUpdate={() => refetchData()}
/>
```

### Backend Controllers

#### 1. `UserTierController`
**Location**: `backend/modules/03-CRM/src/controllers/user-tier.controller.ts`

**Endpoints**:
- `GET /user-tiers/organization/:id` - Get tier allocation
- `PUT /user-tiers/organization/:id` - Update tier
- `GET /user-tiers/organization/:id/can-add-user` - Check if can add user
- `POST /user-tiers/organization/:id/validate` - Validate user addition
- `GET /user-tiers/all` - Get all organization tiers

#### 2. `OrganizationFeaturesController`
**Location**: `backend/modules/03-CRM/src/controllers/organization-features.controller.ts`

**Endpoints**:
- `GET /organizations/:id/features` - Get organization features
- `PUT /organizations/:id/features` - Update feature status
- `GET /organizations/:id/features/check/:featureKey` - Check feature access

## 🔌 Integration with Client Admin Portal

### Step 1: Add Feature Check Middleware

Create a middleware in the client admin portal to check feature access:

**File**: `frontend/client-admin-portal/src/middleware/feature-check.ts`

```typescript
export async function checkFeatureAccess(
  organizationId: string,
  featureKey: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/crm/organizations/${organizationId}/features/check/${featureKey}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    
    const data = await response.json();
    return data.hasAccess;
  } catch (error) {
    console.error('Feature check failed:', error);
    return false; // Fail closed
  }
}
```

### Step 2: Create Feature Guard Component

**File**: `frontend/client-admin-portal/src/components/guards/FeatureGuard.tsx`

```tsx
import { useEffect, useState } from 'react';
import { checkFeatureAccess } from '@/middleware/feature-check';
import { useAuth } from '@/contexts/auth-context';

interface FeatureGuardProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGuard({ feature, children, fallback }: FeatureGuardProps) {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.organizationId) {
      checkFeatureAccess(user.organizationId, feature).then(access => {
        setHasAccess(access);
        setLoading(false);
      });
    }
  }, [user, feature]);

  if (loading) return <div>Loading...</div>;
  if (!hasAccess) return fallback || null;
  
  return <>{children}</>;
}
```

### Step 3: Use Feature Guards in Client Portal

**Example**: Protect Advanced Reporting feature

```tsx
import { FeatureGuard } from '@/components/guards/FeatureGuard';

function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Always visible */}
      <BasicReports />
      
      {/* Only for Premium+ */}
      <FeatureGuard 
        feature="advanced_reporting"
        fallback={<UpgradePrompt feature="Advanced Reporting" />}
      >
        <AdvancedReports />
      </FeatureGuard>
      
      {/* Only for Advanced */}
      <FeatureGuard 
        feature="custom_workflows"
        fallback={<UpgradePrompt feature="Custom Workflows" />}
      >
        <WorkflowBuilder />
      </FeatureGuard>
    </div>
  );
}
```

### Step 4: Enforce User Limits

**File**: `frontend/client-admin-portal/src/pages/users/add-user.tsx`

```tsx
import { checkCanAddUser } from '@/lib/api-client';

async function handleAddUser() {
  try {
    // Check if organization can add more users
    const { canAdd, reason } = await checkCanAddUser(organizationId);
    
    if (!canAdd) {
      toast.error(reason || 'User limit reached. Please upgrade your plan.');
      return;
    }
    
    // Proceed with user creation
    await createUser(userData);
    toast.success('User added successfully');
  } catch (error) {
    toast.error('Failed to add user');
  }
}
```

## 📊 Available Features by Tier

### Basic Tier (1 User)
- ✅ Basic CRM (Contacts, Leads, Opportunities)
- ✅ Document Storage (1GB)
- ✅ Mobile App Access
- ✅ Email Support

### Premium Tier (10 Users)
- ✅ Everything in Basic
- ✅ Advanced Reporting & Dashboards
- ✅ Email Campaigns & Marketing Automation
- ✅ Calendar Integration (Google, Outlook)
- ✅ API Access
- ✅ Phone Support

### Advanced Tier (Unlimited Users)
- ✅ Everything in Premium
- ✅ Custom Workflows & Automation
- ✅ Advanced Security (SSO, 2FA, Audit Logs)
- ✅ White Label / Custom Branding
- ✅ Priority Support (24/7)
- ✅ Dedicated Account Manager

## 🚀 How to Use (Super Admin)

### 1. **Set Organization Tier**

1. Go to `/organizations`
2. Find the organization
3. Click "View Details" or the organization name
4. Scroll to "User Tier Manager" section
5. Toggle the desired tier (Basic/Premium/Advanced)
6. Confirm the change

### 2. **Manage Features**

1. On the organization detail page
2. Scroll to "Feature Management" section
3. Toggle individual features on/off
4. Features are organized by category
5. Changes take effect immediately

### 3. **Quick Tier Management**

1. On `/organizations` list page
2. Click "Manage Tier" button next to organization
3. Select desired tier from dialog
4. Click "Update Tier"

## 🔍 Testing the Integration

### Test 1: User Limit Enforcement

1. Set organization to Basic tier (1 user)
2. Login to client admin portal
3. Try to add a 2nd user
4. Should see error: "User limit reached"

### Test 2: Feature Access

1. Set organization to Basic tier
2. Disable "Advanced Reporting" feature
3. Login to client admin portal
4. Advanced reporting section should be hidden/disabled

### Test 3: Tier Upgrade

1. Set organization to Premium tier
2. Features should automatically enable based on tier
3. User limit should increase to 10
4. Client portal should show new features

## 📝 Database Schema

### Organization Table
```sql
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS "userTierConfig" JSON;

-- Example structure:
{
  "basic": { "enabled": false, "maxUsers": 1 },
  "premium": { "enabled": true, "maxUsers": 10 },
  "advanced": { "enabled": false, "maxUsers": null }
}
```

### Organization Features Table (Optional)
```sql
CREATE TABLE IF NOT EXISTS organization_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  feature_key VARCHAR(100) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, feature_key)
);
```

## 🎨 UI Locations

### Super Admin Portal

1. **Dashboard** - Shows overview stats
2. **Organizations List** (`/organizations`)
   - Tier badge next to each organization
   - User count display (e.g., "3/10")
   - "Manage Tier" quick action button
   
3. **Organization Details** (`/organizations/[id]`)
   - User Tier Manager card (top section)
   - Feature Management card (middle section)
   - Current stats and usage
   
4. **System Config** (`/config`)
   - Global feature flags
   - System-wide tier defaults

### Client Admin Portal

1. **Settings → Subscription** - View current plan
2. **Settings → Users** - See user limits and usage
3. **Feature availability** - Throughout the app based on tier

## ⚙️ Configuration Options

### 1. Modify Tier Limits

Edit `user-tier-manager.tsx`:

```tsx
const tierLimits = {
  basic: 1,
  premium: 10,
  advanced: null, // null = unlimited
};
```

### 2. Add New Features

Edit `organization-features-manager.tsx`:

```tsx
const AVAILABLE_FEATURES = [
  // Add new feature
  {
    key: 'new_feature',
    name: 'New Feature Name',
    description: 'Feature description',
    icon: IconComponent,
    category: 'Category',
    tier: 'premium', // basic | premium | advanced
  },
  // ... existing features
];
```

### 3. Customize Tier Names

You can rename tiers in the components:

- **Basic** → Starter, Free, etc.
- **Premium** → Professional, Business, etc.
- **Advanced** → Enterprise, Ultimate, etc.

## 🐛 Troubleshooting

### Issue: "Feature not updating in client portal"
**Solution**: Clear cache or refresh the page. Feature checks are cached for 5 minutes.

### Issue: "User limit not enforced"
**Solution**: Ensure the validation endpoint is called before user creation in the client portal.

### Issue: "Tier toggle not working"
**Solution**: Check browser console for API errors. Verify backend controller is registered in `crm.module.ts`.

## 📞 Support

For questions or issues with the user tier and feature management system, check:

1. Backend logs: `backend/modules/03-CRM/logs/`
2. Browser console for frontend errors
3. API response status codes

## ✅ Next Steps

1. ✅ Add user tier manager to organization detail page
2. ✅ Add feature manager to organization detail page
3. ⏳ Add tier column to organizations list table
4. ⏳ Add "Manage Tier" quick action button to list
5. ⏳ Implement feature guards in client admin portal
6. ⏳ Add user limit validation in client portal
7. ⏳ Add upgrade prompts for premium features
8. ⏳ Create billing integration (optional)

---

**Last Updated**: January 27, 2026
**Version**: 1.0.0
