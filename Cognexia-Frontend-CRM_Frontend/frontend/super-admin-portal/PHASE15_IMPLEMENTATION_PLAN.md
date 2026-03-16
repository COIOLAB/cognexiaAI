# Phase 15: Super Admin Portal - Frontend (Next.js 14)

**Status**: 🚧 **IN PROGRESS (15% Complete)**  
**Started**: January 11, 2026  
**Technology**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui

---

## Overview

The Super Admin Portal is the platform-wide administrative interface for managing the entire CognexiaAI multi-tenant SaaS CRM. It provides:

- Platform-wide dashboard with key metrics
- Organization management (CRUD, suspend/activate)
- User management across all organizations
- Billing & subscription oversight
- Analytics & revenue reporting (MRR, ARR, ARPU)
- System health monitoring
- Audit log viewing

---

## Project Setup ✅

### Completed
- ✅ Next.js 14 with App Router initialized
- ✅ TypeScript configured
- ✅ Tailwind CSS installed and configured
- ✅ Dependencies installed:
  - axios
  - @tanstack/react-query
  - zustand
  - date-fns
  - recharts
  - lucide-react
  - react-hot-toast
  - @radix-ui/* components
  - class-variance-authority, clsx, tailwind-merge

### Project Structure Created
```
frontend/super-admin-portal/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   ├── lib/          # Utilities and API client
│   ├── hooks/        # Custom React hooks
│   ├── stores/       # Zustand stores
│   └── types/        # TypeScript types
├── public/           # Static assets
└── package.json
```

---

## Implementation Progress

### 1. Core Infrastructure (30% Complete)

#### ✅ Completed
- [x] Utilities (`lib/utils.ts`)
  - Class name merger
  - Currency formatter
  - Number formatter
  - Percentage formatter
  - Text truncation
  - Initials generator
  - Debounce function
  - Status color mapping

- [x] API Client (`lib/api-client.ts`)
  - Axios instance with base URL
  - Request interceptor (auth token)
  - Response interceptor (error handling)
  - Token refresh logic
  - Automatic logout on auth failure
  - Toast notifications for errors
  - TypeScript interfaces

#### 🚧 In Progress
- [ ] Type definitions (`types/`)
  - User types
  - Organization types
  - Subscription types
  - Dashboard metrics types
  - API response types

- [ ] Environment configuration
  - `.env.local` file
  - API URL configuration
  - Feature flags

### 2. Authentication System (0% Complete)

#### Remaining Tasks
- [ ] Auth store (Zustand)
  - Login/logout state
  - User data management
  - Token management
  - Persistent storage

- [ ] Auth context/provider
  - Global auth state
  - Protected route wrapper

- [ ] Login page (`app/login/page.tsx`)
  - Login form with validation
  - Email + password fields
  - Remember me option
  - Error handling
  - Loading states

- [ ] Protected route middleware
  - Route guards
  - Redirect logic
  - Role-based access

### 3. Layout & Navigation (0% Complete)

#### Remaining Tasks
- [ ] Main layout (`app/(dashboard)/layout.tsx`)
  - Sidebar navigation
  - Header with user menu
  - Breadcrumbs
  - Mobile responsive design

- [ ] Sidebar component
  - Navigation menu
  - Active state highlighting
  - Icons (lucide-react)
  - Collapsible on mobile

- [ ] Header component
  - User profile dropdown
  - Notifications icon
  - Search bar
  - Logout button

- [ ] Navigation items
  - Dashboard
  - Organizations
  - Users
  - Billing
  - Analytics
  - System Health
  - Settings

### 4. Platform Dashboard (0% Complete)

#### Remaining Tasks
- [ ] Dashboard page (`app/(dashboard)/page.tsx`)
  - Overview metrics cards
  - Revenue charts
  - Organization growth chart
  - Recent activity feed

- [ ] Metrics cards component
  - Total organizations
  - Active users
  - Monthly Revenue (MRR)
  - Annual Revenue (ARR)

- [ ] Charts components
  - Line chart (revenue over time)
  - Bar chart (organizations by plan)
  - Pie chart (subscription distribution)
  - Using recharts library

- [ ] Dashboard API hooks
  - `useplatformMetrics`
  - `useRevenueData`
  - `useOrganizationGrowth`

### 5. Organization Management (0% Complete)

#### Remaining Tasks
- [ ] Organizations list page (`app/(dashboard)/organizations/page.tsx`)
  - Data table with sorting
  - Search functionality
  - Filter by status
  - Pagination
  - Actions (view, suspend, activate, delete)

- [ ] Organization details page (`app/(dashboard)/organizations/[id]/page.tsx`)
  - Organization info
  - Subscription details
  - User list
  - Usage statistics
  - Activity log

- [ ] Create organization modal
  - Form with validation
  - Plan selection
  - Owner details

- [ ] Edit organization modal
  - Update organization details
  - Change branding

- [ ] Organization API hooks
  - `useOrganizations` (list with filters)
  - `useOrganization` (single)
  - `useCreateOrganization`
  - `useUpdateOrganization`
  - `useSuspendOrganization`
  - `useDeleteOrganization`

### 6. User Management (0% Complete)

#### Remaining Tasks
- [ ] Users list page (`app/(dashboard)/users/page.tsx`)
  - Data table
  - Search by name/email
  - Filter by role, organization
  - Bulk actions

- [ ] User details page (`app/(dashboard)/users/[id]/page.tsx`)
  - User profile
  - Organization membership
  - Activity history
  - Permissions

- [ ] Invite user modal
  - Email input
  - Role selection
  - Organization assignment

- [ ] User API hooks
  - `useUsers`
  - `useUser`
  - `useInviteUser`
  - `useUpdateUser`
  - `useDeleteUser`

### 7. Billing & Subscriptions (0% Complete)

#### Remaining Tasks
- [ ] Billing overview page (`app/(dashboard)/billing/page.tsx`)
  - Revenue metrics
  - Payment methods
  - Transaction history
  - Export functionality

- [ ] Subscription plans page (`app/(dashboard)/billing/plans/page.tsx`)
  - List of plans
  - Create/edit plan modal
  - Pricing configuration

- [ ] Transactions list
  - Data table
  - Filter by status, date
  - Export to CSV

- [ ] Billing API hooks
  - `useBillingMetrics`
  - `useTransactions`
  - `useSubscriptionPlans`
  - `useCreatePlan`
  - `useUpdatePlan`

### 8. Analytics & Reporting (0% Complete)

#### Remaining Tasks
- [ ] Analytics page (`app/(dashboard)/analytics/page.tsx`)
  - Revenue analytics
  - MRR/ARR/ARPU trends
  - Churn rate
  - Customer lifetime value

- [ ] Custom date range picker
  - Preset ranges
  - Custom range selection

- [ ] Export reports functionality
  - CSV export
  - PDF export (optional)

- [ ] Analytics API hooks
  - `useRevenueAnalytics`
  - `useChurnRate`
  - `useCustomerMetrics`

### 9. System Health Monitoring (0% Complete)

#### Remaining Tasks
- [ ] System health page (`app/(dashboard)/system-health/page.tsx`)
  - API status indicators
  - Database health
  - Redis connection
  - Error rate
  - Response time metrics

- [ ] Real-time metrics dashboard
  - Auto-refresh every 30s
  - Alert indicators

- [ ] Error log viewer
  - Recent errors
  - Filter by severity
  - Stack traces

- [ ] Health monitoring API hooks
  - `useSystemHealth`
  - `useApiMetrics`
  - `useErrorLogs`

### 10. UI Components Library (0% Complete)

#### Remaining Tasks
- [ ] Button component
  - Variants (primary, secondary, ghost, destructive)
  - Sizes (sm, md, lg)
  - Loading state

- [ ] Input component
  - Text, email, password types
  - With label and error message
  - Icons support

- [ ] Select component
  - Radix UI based
  - Search functionality

- [ ] Dialog/Modal component
  - Radix UI based
  - Different sizes

- [ ] Table component
  - Sortable columns
  - Pagination
  - Row selection

- [ ] Card component
  - With header, content, footer
  - Different variants

- [ ] Badge component
  - Status badges
  - Color variants

- [ ] Toast notifications
  - Success, error, info, warning
  - Auto-dismiss

- [ ] Loading skeleton
  - Various shapes
  - Shimmer animation

- [ ] Empty state component
  - No data illustration
  - Call-to-action

### 11. Data Tables & Filtering (0% Complete)

#### Remaining Tasks
- [ ] Reusable data table component
  - TanStack Table integration
  - Column configuration
  - Sorting
  - Filtering
  - Pagination

- [ ] Search component
  - Debounced input
  - Clear button

- [ ] Filter panel component
  - Multiple filter types
  - Apply/reset filters

- [ ] Pagination component
  - Page numbers
  - Items per page selector

---

## API Endpoints Integration

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### Organizations
- `GET /api/organizations` - List organizations
- `GET /api/organizations/:id` - Get organization
- `POST /api/organizations` - Create organization
- `PATCH /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization
- `POST /api/organizations/:id/suspend` - Suspend organization
- `POST /api/organizations/:id/activate` - Activate organization

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `POST /api/users/invite` - Invite user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Dashboard
- `GET /api/dashboard/admin/platform-metrics` - Platform metrics
- `GET /api/dashboard/admin/revenue-analytics` - Revenue data
- `GET /api/dashboard/admin/organization-growth` - Growth metrics

### Billing
- `GET /api/billing/transactions` - List transactions
- `GET /api/subscriptions/plans` - List plans
- `POST /api/subscriptions/plans` - Create plan
- `PATCH /api/subscriptions/plans/:id` - Update plan

---

## Technology Details

### Next.js 14 Configuration
- App Router (not Pages Router)
- Server components where possible
- Client components for interactivity
- Parallel routes for modals
- Route groups for organization

### State Management
- **Zustand** for global state (auth, ui)
- **TanStack Query** for server state
- **React Context** for theme

### Styling
- **Tailwind CSS** for utility classes
- **Radix UI** for accessible components
- **Lucide React** for icons
- **class-variance-authority** for variant management

### Data Fetching
- **TanStack Query** (React Query)
- Automatic caching
- Background refetching
- Optimistic updates

### Forms
- Native HTML5 validation
- Custom validation logic
- Error handling
- Loading states

---

## File Structure Plan

```
frontend/super-admin-portal/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx (Dashboard)
│   │   │   ├── organizations/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── users/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── billing/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── plans/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── transactions/
│   │   │   │       └── page.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   └── system-health/
│   │   │       └── page.tsx
│   │   ├── layout.tsx (Root)
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/              # Base components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   └── skeleton.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── breadcrumbs.tsx
│   │   ├── dashboard/       # Dashboard components
│   │   │   ├── metric-card.tsx
│   │   │   ├── revenue-chart.tsx
│   │   │   └── activity-feed.tsx
│   │   ├── organizations/   # Organization components
│   │   │   ├── organization-table.tsx
│   │   │   ├── organization-form.tsx
│   │   │   └── organization-details.tsx
│   │   ├── users/           # User components
│   │   │   ├── user-table.tsx
│   │   │   ├── user-form.tsx
│   │   │   └── invite-user-modal.tsx
│   │   └── billing/         # Billing components
│   │       ├── transaction-table.tsx
│   │       └── plan-form.tsx
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-organizations.ts
│   │   ├── use-users.ts
│   │   ├── use-dashboard.ts
│   │   ├── use-billing.ts
│   │   └── use-analytics.ts
│   ├── lib/
│   │   ├── api-client.ts     # ✅ Created
│   │   ├── utils.ts          # ✅ Created
│   │   └── query-client.ts
│   ├── stores/
│   │   ├── auth-store.ts
│   │   └── ui-store.ts
│   └── types/
│       ├── user.ts
│       ├── organization.ts
│       ├── subscription.ts
│       ├── billing.ts
│       └── dashboard.ts
└── public/
    ├── logo.svg
    └── favicon.ico
```

---

## Current Status

### Completed (15%)
1. ✅ Next.js 14 project setup
2. ✅ Dependencies installed
3. ✅ Utility functions created
4. ✅ API client configured

### In Progress (10%)
- Type definitions
- Environment configuration

### Not Started (75%)
- Authentication system
- All UI pages and components
- All API integrations

---

## Next Steps (Immediate)

1. **Create type definitions** for all entities
2. **Build authentication system** (login page, auth store, protected routes)
3. **Create base UI components** (button, input, card, etc.)
4. **Build main layout** (sidebar, header, navigation)
5. **Implement platform dashboard**

---

## Estimated Timeline

- **Authentication & Layout**: 2-3 days
- **Dashboard**: 1-2 days
- **Organization Management**: 2-3 days
- **User Management**: 1-2 days
- **Billing & Subscriptions**: 2-3 days
- **Analytics**: 1-2 days
- **System Health**: 1 day
- **Polish & Testing**: 2-3 days

**Total**: 12-18 days for MVP

---

## Dependencies on Backend

The frontend depends on the following backend API endpoints being available:

1. Authentication endpoints (Phase 2) ✅
2. Organization management (Phase 3) ✅
3. User management (Phase 4) ✅
4. Subscription management (Phase 5) ✅
5. Billing/payments (Phase 6) ✅
6. Dashboard metrics (Phase 10) ✅

All required backend endpoints are available.

---

## Notes

- Using **client-side rendering** for admin portal (not SEO critical)
- **Real-time updates** will be added in future phase (WebSockets)
- **Responsive design** - mobile-first approach
- **Accessibility** - using Radix UI for ARIA compliance
- **Performance** - code splitting, lazy loading, image optimization

---

**Phase 15 Status**: 🚧 **15% COMPLETE**  
**Last Updated**: January 11, 2026  
**Next Milestone**: Complete authentication and base components
