# Phase 15: Super Admin Portal - Implementation Guide

## Current Status: 25% Complete

### ✅ Completed Components

#### 1. Project Foundation
- ✅ Next.js 14 with App Router
- ✅ TypeScript configuration
- ✅ Tailwind CSS setup
- ✅ All dependencies installed (426 packages)

#### 2. Type Definitions (100% Complete)
- ✅ `types/user.ts` - User, roles, auth types
- ✅ `types/organization.ts` - Organization types
- ✅ `types/subscription.ts` - Subscription, plans, billing
- ✅ `types/dashboard.ts` - Metrics, analytics, system health

#### 3. Core Infrastructure (100% Complete)
- ✅ `lib/utils.ts` - Utility functions
- ✅ `lib/api-client.ts` - Axios with interceptors  
- ✅ `lib/query-client.ts` - React Query setup
- ✅ `stores/auth-store.ts` - Zustand auth store
- ✅ `.env.local` - Environment configuration

### 🚧 Remaining Work (75%)

## Quick Start

```bash
# Install dependencies (if not done)
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Implementation Roadmap

### Phase 1: Authentication & Base UI (Priority: HIGH)

#### A. Base UI Components
Create these in `src/components/ui/`:

1. **button.tsx** - Primary component
```typescript
// Variants: default, destructive, outline, secondary, ghost, link
// Sizes: default, sm, lg, icon
```

2. **input.tsx** - Form input
3. **card.tsx** - Container component
4. **badge.tsx** - Status badges
5. **dialog.tsx** - Modal dialogs (using Radix UI)
6. **select.tsx** - Dropdown select (using Radix UI)
7. **table.tsx** - Data table
8. **skeleton.tsx** - Loading skeletons

**Pattern to Follow:**
- Use Radix UI primitives for accessibility
- Use `class-variance-authority` for variants
- TypeScript with proper prop types
- Forward refs where needed

#### B. Authentication Pages

1. **src/app/(auth)/login/page.tsx**
   - Email + password form
   - Call `POST /api/auth/login`
   - Save tokens to auth store
   - Redirect to dashboard

2. **src/app/(auth)/layout.tsx**
   - Centered layout for auth pages
   - No sidebar/header

#### C. Protected Routes
Create `src/components/auth/protected-route.tsx`:
- Check `useAuthStore` for authentication
- Redirect to /login if not authenticated
- Show loading state while checking

### Phase 2: Layout & Navigation (Priority: HIGH)

#### A. Main Layout Components

1. **src/components/layout/sidebar.tsx**
   - Logo at top
   - Navigation menu items
   - Active state highlighting
   - Icons from `lucide-react`
   - Collapsible on mobile

Navigation items:
```typescript
const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Organizations', href: '/organizations', icon: Building2 },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'System Health', href: '/system-health', icon: Activity },
];
```

2. **src/components/layout/header.tsx**
   - Breadcrumbs
   - Search bar (optional)
   - User menu dropdown
   - Notifications icon
   - Logout button

3. **src/app/(dashboard)/layout.tsx**
   - Main container with Sidebar + Header
   - Wrap children with React Query Provider
   - Toast Provider from react-hot-toast

### Phase 3: Dashboard Page (Priority: HIGH)

#### File: `src/app/(dashboard)/page.tsx`

Components needed:
1. **MetricCard** - Display KPIs
2. **RevenueChart** - Line chart with recharts
3. **OrganizationGrowthChart** - Area chart
4. **ActivityFeed** - Recent activities list

API Endpoints to integrate:
- `GET /api/dashboard/admin/platform-metrics`
- `GET /api/dashboard/admin/revenue-analytics?days=30`
- `GET /api/dashboard/admin/organization-growth?days=30`
- `GET /api/dashboard/admin/recent-activity?limit=10`

### Phase 4: Organizations Management (Priority: HIGH)

This is your **reference implementation** - replicate this pattern for Users, Billing, etc.

#### A. List Page: `src/app/(dashboard)/organizations/page.tsx`

Features:
- Data table with sorting
- Search by name
- Filter by status (Active, Trial, Suspended)
- Pagination
- Actions: View, Suspend, Activate, Delete

#### B. Details Page: `src/app/(dashboard)/organizations/[id]/page.tsx`

Sections:
- Organization info card
- Subscription details
- Users list
- Usage statistics
- Activity timeline

#### C. Create/Edit Modal

Component: `src/components/organizations/organization-form-dialog.tsx`

Fields:
- Name, slug, email
- Owner name & email
- Subscription plan selector
- Contact details (phone, website, address)

### Phase 5: API Hooks (Priority: HIGH)

Create React Query hooks in `src/hooks/`:

#### 1. `use-auth.ts`
```typescript
export const useLogin = () =>
  useMutation({
    mutationFn: (data: LoginRequest) =>
      apiClient.post('/auth/login', data),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data;
      useAuthStore.getState().login(user, accessToken, refreshToken);
    },
  });

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  return useMutation({
    mutationFn: () => apiClient.post('/auth/logout'),
    onSuccess: () => logout(),
  });
};
```

#### 2. `use-dashboard.ts`
```typescript
export const usePlatformMetrics = () =>
  useQuery({
    queryKey: ['platform-metrics'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/admin/platform-metrics');
      return data as PlatformMetrics;
    },
  });

export const useRevenueData = (days: number = 30) =>
  useQuery({
    queryKey: ['revenue-data', days],
    queryFn: async () => {
      const { data } = await apiClient.get(`/dashboard/admin/revenue-analytics?days=${days}`);
      return data as RevenueDataPoint[];
    },
  });
```

#### 3. `use-organizations.ts`
```typescript
export const useOrganizations = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) =>
  useQuery({
    queryKey: ['organizations', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/organizations', { params });
      return data as PaginatedResponse<Organization>;
    },
  });

export const useOrganization = (id: string) =>
  useQuery({
    queryKey: ['organization', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/organizations/${id}`);
      return data as Organization;
    },
    enabled: !!id,
  });

export const useCreateOrganization = () =>
  useMutation({
    mutationFn: (data: CreateOrganizationRequest) =>
      apiClient.post('/organizations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization created successfully');
    },
  });

export const useSuspendOrganization = () =>
  useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/organizations/${id}/suspend`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization suspended');
    },
  });
```

#### 4. `use-users.ts`
Similar pattern to organizations

#### 5. `use-billing.ts`
Similar pattern for transactions and plans

### Phase 6: Remaining Pages

#### Users Management (`/users`)
- Follow Organizations pattern
- Add invite modal
- Role management dropdown

#### Billing & Subscriptions (`/billing`)
- Overview page with metrics
- Plans list page
- Transactions table with export

#### Analytics (`/analytics`)
- Date range selector
- Revenue charts
- Churn analysis
- Customer metrics

#### System Health (`/system-health`)
- Status indicators (UP/DOWN)
- Real-time metrics
- Error logs table
- Auto-refresh every 30s

## File Structure Reference

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── organizations/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── billing/
│   │   │   ├── page.tsx
│   │   │   ├── plans/
│   │   │   │   └── page.tsx
│   │   │   └── transactions/
│   │   │       └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   └── system-health/
│   │       └── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/              # 8 base components
│   ├── layout/          # Sidebar, Header
│   ├── dashboard/       # Metric cards, charts
│   ├── organizations/   # Org-specific components
│   ├── users/           # User-specific components
│   └── billing/         # Billing-specific components
├── hooks/
│   ├── use-auth.ts
│   ├── use-dashboard.ts
│   ├── use-organizations.ts
│   ├── use-users.ts
│   ├── use-billing.ts
│   └── use-analytics.ts
├── lib/
│   ├── api-client.ts    # ✅
│   ├── utils.ts         # ✅
│   └── query-client.ts  # ✅
├── stores/
│   ├── auth-store.ts    # ✅
│   └── ui-store.ts
└── types/               # ✅ All types complete
    ├── user.ts
    ├── organization.ts
    ├── subscription.ts
    └── dashboard.ts
```

## Development Tips

### 1. Component Pattern
Every UI component should follow this structure:
```typescript
import { cn } from '@/lib/utils';

interface ComponentProps {
  // Props
}

export function Component({ ...props }: ComponentProps) {
  return (
    // JSX
  );
}
```

### 2. Page Pattern
Every page should:
- Use 'use client' directive if using hooks
- Show loading skeleton while fetching
- Handle error states
- Display empty state if no data

### 3. Form Pattern
- Use controlled inputs with useState
- Validate on submit
- Show loading state on button
- Display error messages
- Call mutation hook
- Handle success/error responses

### 4. Table Pattern
- Use TanStack Table for advanced features
- Or simple table with map for basic lists
- Include sorting, filtering, pagination
- Row actions in dropdown menu

## Testing Checklist

### Before Moving to Phase 16:

- [ ] Login flow works end-to-end
- [ ] Dashboard displays all metrics
- [ ] Can create new organization
- [ ] Can view organization details
- [ ] Can suspend/activate organization
- [ ] Can delete organization
- [ ] Search and filters work
- [ ] Pagination works
- [ ] User menu and logout work
- [ ] Mobile responsive layout
- [ ] Error handling works
- [ ] Loading states display correctly
- [ ] `npm run build` succeeds with 0 errors

## Commands

```bash
# Development
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build

# Production
npm start
```

## Next Steps

1. **Create UI components** (Button, Input, Card, etc.)
2. **Build authentication pages** (Login)
3. **Create layout** (Sidebar, Header)
4. **Build dashboard** with real API calls
5. **Complete Organizations module** as reference
6. **Replicate pattern** for Users, Billing, Analytics
7. **Test thoroughly**
8. **Build production bundle**

## Resources

- [Next.js 14 Docs](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [Lucide Icons](https://lucide.dev/)

---

**Current Phase 15 Status**: 25% Complete (Infrastructure ready)
**Estimated Time to Complete**: 10-12 hours of focused development
**Recommended Approach**: Build one complete feature module (Organizations) first, then replicate the pattern

The foundation is solid. The remaining work is primarily UI development following established patterns.
