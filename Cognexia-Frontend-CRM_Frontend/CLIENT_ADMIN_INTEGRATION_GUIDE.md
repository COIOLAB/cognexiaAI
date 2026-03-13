# Client Admin Portal ↔ Super Admin Portal Integration Guide

## 📋 Overview

This guide explains how to integrate the Client Admin Portal with the Super Admin Portal for:
1. **Feature Access Control** - Enforce tier-based feature restrictions
2. **User Limit Enforcement** - Prevent exceeding user limits
3. **Data Synchronization** - Send usage data to Super Admin Portal
4. **Real-time Analytics** - Track user activity and system usage

## 🏗️ Architecture

```
┌─────────────────────────┐         ┌──────────────────────────┐
│  Client Admin Portal    │────────▶│   Backend CRM API        │
│  (Organization View)    │         │   (Port 3003)            │
│                         │         │                          │
│  - Feature Guards       │         │  - Feature Check API     │
│  - User Limits          │         │  - Analytics API         │
│  - Analytics Tracking   │         │  - User Tier API         │
└─────────────────────────┘         └──────────────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────────────┐
                                    │  Super Admin Portal      │
                                    │  (Dashboard View)        │
                                    │                          │
                                    │  - View all orgs data    │
                                    │  - Manage tiers          │
                                    │  - Enable/disable        │
                                    │    features              │
                                    └──────────────────────────┘
```

## 📦 Files Created

### Client Admin Portal

1. **`src/lib/feature-check.ts`**
   - Feature access checking
   - User limit validation
   - API integration functions

2. **`src/components/guards/FeatureGuard.tsx`**
   - Component wrapper for feature gating
   - Upgrade prompts for locked features

3. **`src/lib/analytics-telemetry.ts`**
   - Activity tracking
   - Usage statistics
   - Data synchronization

### Backend API

4. **`src/controllers/organization-features.controller.ts`**
   - GET/PUT organization features
   - Check feature access

5. **`src/controllers/analytics-telemetry.controller.ts`**
   - Receive activity tracking
   - Process usage statistics

## 🚀 Implementation Steps

### Step 1: Initialize Telemetry in Client Portal

Add to your `app/layout.tsx` or main entry point:

```tsx
// app/layout.tsx
'use client';

import { useEffect } from 'react';
import { initTelemetry } from '@/lib/analytics-telemetry';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize telemetry system
    initTelemetry();
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Step 2: Protect Features with FeatureGuard

Wrap feature-specific components:

```tsx
// app/reports/page.tsx
import { FeatureGuard, UpgradePrompt } from '@/components/guards/FeatureGuard';
import { FEATURES } from '@/lib/feature-check';

export default function ReportsPage() {
  return (
    <div>
      <h1>Reports</h1>
      
      {/* Always visible - basic reports */}
      <BasicReportsSection />
      
      {/* Premium feature - advanced reporting */}
      <FeatureGuard 
        feature={FEATURES.ADVANCED_REPORTING}
        fallback={<UpgradePrompt feature="Advanced Reporting" tier="premium" />}
      >
        <AdvancedReportsSection />
      </FeatureGuard>
    </div>
  );
}
```

### Step 3: Enforce User Limits

Before adding users:

```tsx
// app/settings/users/add-user.tsx
import { checkCanAddUser } from '@/lib/feature-check';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'react-hot-toast';

export function AddUserForm() {
  const { user } = useAuth();

  async function handleSubmit(userData: any) {
    // Check if organization can add more users
    const { canAdd, reason, currentUsers, maxUsers } = await checkCanAddUser(
      user.organizationId
    );

    if (!canAdd) {
      toast.error(
        reason || `User limit reached (${currentUsers}/${maxUsers}). Please upgrade your plan.`
      );
      return;
    }

    // Proceed with user creation
    try {
      await createUser(userData);
      toast.success('User created successfully');
    } catch (error) {
      toast.error('Failed to create user');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Step 4: Track Feature Usage

Track when users interact with features:

```tsx
// app/workflows/page.tsx
import { trackFeatureUsage } from '@/lib/analytics-telemetry';
import { FEATURES } from '@/lib/feature-check';

export default function WorkflowsPage() {
  useEffect(() => {
    // Track that user accessed workflows feature
    trackFeatureUsage(FEATURES.CUSTOM_WORKFLOWS, 'accessed');
  }, []);

  const handleWorkflowExecute = (workflowId: string) => {
    // Track workflow execution
    trackFeatureUsage(FEATURES.CUSTOM_WORKFLOWS, 'executed');
    
    // Execute workflow
    executeWorkflow(workflowId);
  };

  return (
    <div>
      <h1>Custom Workflows</h1>
      {/* Workflow UI */}
    </div>
  );
}
```

### Step 5: Track Other Activities

```tsx
// Throughout your app

// Track page views
import { trackPageView } from '@/lib/analytics-telemetry';

useEffect(() => {
  trackPageView('Dashboard', { section: 'overview' });
}, []);

// Track document uploads
import { trackDocumentUpload } from '@/lib/analytics-telemetry';

async function handleFileUpload(file: File) {
  await uploadFile(file);
  trackDocumentUpload(file.size, file.type);
}

// Track API calls (if using API Access feature)
import { trackAPICall } from '@/lib/analytics-telemetry';

async function makeAPICall(endpoint: string, method: string) {
  const response = await fetch(endpoint, { method });
  trackAPICall(endpoint, method, response.status);
  return response;
}
```

## 📊 Data Flow: Client → Super Admin

### What Data is Sent?

1. **Activity Tracking**:
   - Page views
   - Feature usage
   - User actions (create, update, delete)
   - Document uploads
   - API calls

2. **Usage Statistics** (every 5 minutes):
   - Session duration
   - Pages visited
   - Features used
   - Active users count
   - Storage usage
   - API calls count

### How Data Flows

```
Client Action → Track Function → Backend API → Database → Super Admin Dashboard
```

Example flow:
1. User uploads document in Client Portal
2. `trackDocumentUpload()` called
3. POST to `/api/v1/analytics/track`
4. Backend stores in database
5. Super Admin sees updated stats in real-time

## 🎯 Feature Examples

### Example 1: Email Campaigns (Premium Feature)

```tsx
// app/marketing/campaigns/page.tsx
import { FeatureGuard, UpgradePrompt } from '@/components/guards/FeatureGuard';
import { FEATURES } from '@/lib/feature-check';

export default function CampaignsPage() {
  return (
    <FeatureGuard
      feature={FEATURES.EMAIL_CAMPAIGNS}
      fallback={
        <UpgradePrompt 
          feature="Email Campaigns & Marketing Automation" 
          tier="premium" 
        />
      }
    >
      <div>
        <h1>Email Campaigns</h1>
        <CreateCampaignButton />
        <CampaignsList />
      </div>
    </FeatureGuard>
  );
}
```

### Example 2: API Access (Premium Feature)

```tsx
// app/settings/api-keys/page.tsx
import { FeatureGuard } from '@/components/guards/FeatureGuard';
import { FEATURES } from '@/lib/feature-check';

export default function APIKeysPage() {
  return (
    <FeatureGuard
      feature={FEATURES.API_ACCESS}
      fallback={
        <div className="text-center p-8">
          <h2>API Access</h2>
          <p>API access is available on Premium and Advanced plans.</p>
          <button onClick={() => window.location.href = '/settings/subscription'}>
            Upgrade Now
          </button>
        </div>
      }
    >
      <div>
        <h1>API Keys</h1>
        <APIKeysList />
        <GenerateAPIKeyButton />
      </div>
    </FeatureGuard>
  );
}
```

### Example 3: Custom Workflows (Advanced Feature)

```tsx
// app/workflows/builder/page.tsx
import { FeatureGuard } from '@/components/guards/FeatureGuard';
import { FEATURES } from '@/lib/feature-check';
import { trackWorkflowExecution } from '@/lib/analytics-telemetry';

export default function WorkflowBuilderPage() {
  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      await executeWorkflow(workflowId);
      trackWorkflowExecution(workflowId, true);
      toast.success('Workflow executed successfully');
    } catch (error) {
      trackWorkflowExecution(workflowId, false);
      toast.error('Workflow execution failed');
    }
  };

  return (
    <FeatureGuard
      feature={FEATURES.CUSTOM_WORKFLOWS}
      fallback={<UpgradePrompt feature="Custom Workflows" tier="advanced" />}
    >
      <div>
        <h1>Workflow Builder</h1>
        <WorkflowCanvas />
        <ExecuteButton onClick={handleExecuteWorkflow} />
      </div>
    </FeatureGuard>
  );
}
```

## 🔒 Security Considerations

### 1. Token Management

```typescript
// Always use secure token storage
localStorage.setItem('accessToken', token); // Basic
// Or use httpOnly cookies (more secure)
```

### 2. Feature Check Caching

```typescript
// Cache feature checks to reduce API calls
const featureCache = new Map<string, { hasAccess: boolean; expiry: number }>();

export async function checkFeatureAccess(
  organizationId: string,
  featureKey: string
): Promise<boolean> {
  const cacheKey = `${organizationId}:${featureKey}`;
  const cached = featureCache.get(cacheKey);
  
  if (cached && cached.expiry > Date.now()) {
    return cached.hasAccess;
  }
  
  const hasAccess = await fetchFeatureAccess(organizationId, featureKey);
  
  // Cache for 5 minutes
  featureCache.set(cacheKey, {
    hasAccess,
    expiry: Date.now() + 5 * 60 * 1000,
  });
  
  return hasAccess;
}
```

### 3. Rate Limiting

Implement rate limiting on analytics endpoints to prevent abuse:

```typescript
// backend - rate limiting example
import rateLimit from 'express-rate-limit';

const analyticsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/analytics', analyticsLimiter);
```

## 📈 Viewing Data in Super Admin Portal

### Real-time Dashboard

Super Admin can view:

1. **Organization Activity** (`/organizations/[id]`)
   - Recent activity log
   - Feature usage breakdown
   - Active users timeline

2. **Platform Analytics** (`/analytics`)
   - Total active organizations
   - Feature adoption rates
   - System-wide usage trends

3. **Organization Health** (`/health`)
   - Usage vs limits
   - Feature engagement scores
   - At-risk organizations

### Sample Dashboard Component

```tsx
// super-admin-portal/src/app/(dashboard)/organizations/[id]/activity.tsx

export function OrganizationActivityFeed({ organizationId }: { organizationId: string }) {
  const { data: activities } = useQuery({
    queryKey: ['org-activity', organizationId],
    queryFn: () => fetchOrganizationActivity(organizationId),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activities?.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-2 border-b">
              <ActivityIcon type={activity.category} />
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.label}</p>
              </div>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(activity.timestamp))} ago
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

## 🧪 Testing the Integration

### Test 1: Feature Access Control

1. Super Admin: Set organization to **Basic** tier
2. Client Portal: Try to access "Advanced Reporting"
3. Expected: See upgrade prompt
4. Super Admin: Upgrade to **Premium**
5. Client Portal: Refresh - should now see Advanced Reporting

### Test 2: User Limit Enforcement

1. Super Admin: Set organization to **Basic** (1 user)
2. Client Portal: Try to add 2nd user
3. Expected: Error "User limit reached"
4. Super Admin: Upgrade to **Premium** (10 users)
5. Client Portal: Should now be able to add users (up to 10)

### Test 3: Activity Tracking

1. Client Portal: Navigate to different pages
2. Client Portal: Upload a document
3. Super Admin: Go to organization detail page
4. Expected: See recent activity showing page views and document upload

### Test 4: Usage Statistics

1. Client Portal: Use the system for 5+ minutes
2. Super Admin: Check organization usage stats
3. Expected: See updated session duration, storage usage, etc.

## 🔧 Environment Variables

### Client Admin Portal `.env`

```bash
NEXT_PUBLIC_API_URL=http://localhost:3003/api/v1
NEXT_PUBLIC_TELEMETRY_ENABLED=true
NEXT_PUBLIC_TELEMETRY_INTERVAL=300000  # 5 minutes
```

### Backend `.env`

```bash
# Enable analytics
ANALYTICS_ENABLED=true

# Database for analytics (optional - use main DB if not set)
ANALYTICS_DB_HOST=localhost
ANALYTICS_DB_PORT=5432
ANALYTICS_DB_NAME=crm_analytics
```

## 🚨 Troubleshooting

### Issue: Features not updating in real-time
**Solution**: Clear browser cache, check feature cache expiry (default 5 minutes)

### Issue: Analytics not showing in Super Admin
**Solution**: 
1. Check browser console for errors
2. Verify API_BASE_URL is correct
3. Check backend logs for incoming requests

### Issue: User limit not enforced
**Solution**: Ensure `checkCanAddUser()` is called before user creation API

### Issue: High API call volume
**Solution**: 
1. Implement request batching
2. Increase cache duration for feature checks
3. Use websockets for real-time updates instead of polling

## 📚 Best Practices

### 1. Graceful Degradation

```tsx
// If feature check fails, show a generic error instead of crashing
<FeatureGuard
  feature={FEATURES.ADVANCED_REPORTING}
  fallback={<ErrorBoundary />}
  loadingFallback={<LoadingSpinner />}
>
  <AdvancedReports />
</FeatureGuard>
```

### 2. Batch Analytics

```typescript
// Queue analytics events and send in batches
const analyticsQueue: ActivityEvent[] = [];

export function trackActivity(event: ActivityEvent) {
  analyticsQueue.push(event);
  
  if (analyticsQueue.length >= 10) {
    flushAnalyticsQueue();
  }
}

function flushAnalyticsQueue() {
  if (analyticsQueue.length === 0) return;
  
  fetch('/api/analytics/track-batch', {
    method: 'POST',
    body: JSON.stringify({ events: analyticsQueue }),
  });
  
  analyticsQueue.length = 0;
}
```

### 3. Offline Support

```typescript
// Store analytics offline and sync when online
if (!navigator.onLine) {
  // Store in IndexedDB or localStorage
  saveAnalyticsOffline(event);
} else {
  sendAnalytics(event);
}

window.addEventListener('online', () => {
  syncOfflineAnalytics();
});
```

## ✅ Checklist

- [ ] Install required packages
- [ ] Copy feature-check.ts to client portal
- [ ] Copy FeatureGuard.tsx to client portal
- [ ] Copy analytics-telemetry.ts to client portal
- [ ] Initialize telemetry in app layout
- [ ] Wrap premium features with FeatureGuard
- [ ] Add user limit check before user creation
- [ ] Test feature access control
- [ ] Test user limit enforcement
- [ ] Verify analytics data in Super Admin
- [ ] Configure environment variables
- [ ] Set up monitoring/alerting

---

**Last Updated**: January 27, 2026
**Version**: 1.0.0
