# Organizations Management - End-to-End Testing Guide

## 🎯 Overview
This guide will help you test the Organizations Management feature in the Super Admin Portal, which serves as the **foundational template** for all 32 remaining Super Admin features.

## 📋 Prerequisites

### 1. Running Services
Verify all services are running:
```powershell
# Check running services
netstat -ano | findstr ":3001 :3002 :3003"
```

Expected output:
- ✅ **Port 3001**: Super Admin Portal (PID visible)
- ✅ **Port 3002**: Client Admin Portal (PID visible)
- ✅ **Port 3003**: Backend API (PID visible)

### 2. Demo Credentials
**Super Admin Login:**
- Email: `demo@cognexiaai.com`
- Password: `Demo@12345`

### 3. API Endpoint Configuration
- Base URL: `http://localhost:3003/api/v1`
- Organizations endpoint: `/organizations`
- Auth token stored in: `localStorage.access_token`

---

## 🧪 Test Suite

### Test 1: Login & Navigation
**Objective**: Verify Super Admin can log in and access Organizations page

**Steps**:
1. Open browser: `http://localhost:3001/login`
2. Enter demo credentials:
   - Email: `demo@cognexiaai.com`
   - Password: `Demo@12345`
3. Click "Sign In"
4. Click "Organizations" in the sidebar

**Expected Results**:
- ✅ Successful login redirect to dashboard
- ✅ Sidebar shows "Organizations" menu item
- ✅ Clicking navigates to `/organizations` page
- ✅ Page displays organizations table with data

**Debug Tips**:
- If login fails, check browser console for errors
- Verify backend is running on port 3003
- Check Network tab for API call to `/auth/login`

---

### Test 2: Organizations List View
**Objective**: Verify data table displays correctly with all columns and actions

**Steps**:
1. Navigate to `/organizations` page
2. Observe table structure and data
3. Check column headers: Name, Owner, Status, Plan, Users, Created, Actions
4. Verify row data is populated
5. Test pagination controls if > 50 organizations

**Expected Results**:
- ✅ Table renders with proper styling
- ✅ All columns display correct data
- ✅ Status badges show with correct colors (green=active, yellow=trial, red=suspended)
- ✅ Action buttons visible: View (Eye icon), Suspend/Activate, Delete
- ✅ Pagination shows if data exceeds limit

**Potential Issues**:
- **Empty table**: No organizations in database → Create one using Test 3
- **404 error**: API route misconfigured → Check backend logs
- **401 error**: Token expired → Re-login

---

### Test 3: Search & Filters
**Objective**: Verify search and status filtering work correctly

**Steps**:
1. In search box, type organization name (e.g., "CognexiaAI Demo")
2. Clear search
3. Open status dropdown
4. Select "Active"
5. Select "Trial"
6. Select "Suspended"
7. Reset to "All Status"

**Expected Results**:
- ✅ Search filters organizations in real-time
- ✅ Status filter shows only matching organizations
- ✅ "All Status" shows all organizations
- ✅ Table re-renders without page reload

**Debug**:
- Check React Query cache in DevTools
- Verify API call parameters in Network tab: `?search=...&status=...`

---

### Test 4: Create Organization
**Objective**: Test organization creation form with all fields

**Steps**:
1. Click "Create Organization" button
2. Fill in **Organization Details**:
   - Name: `Test Organization 001`
   - Email: `test001@example.com`
   - Phone: `+1 (555) 123-4567`
   - Website: `https://test001.com`
   - Address: `123 Test St, Test City, TC 12345`

3. Fill in **Contact Person**:
   - Name: `John Doe`
   - Email: `john@test001.com`
   - Phone: `+1 (555) 987-6543`

4. Fill in **Admin User**:
   - Admin Email: `admin@test001.com`
   - Admin First Name: `Admin`
   - Admin Last Name: `User`
   - Admin Password: `SecurePass123!`
   - Confirm Password: `SecurePass123!`

5. Fill in **Account Details**:
   - Account ID: `TEST-001A9F`
   - Country: `US`
   - Industry: `Technology`
   - Account Type: `Enterprise`
   - Account Owner: `Jane Smith`
   - Account Status: `Active`
   - Created Date: `29.01.2026`

6. Select **Subscription Plan**: Choose any available plan

7. Set **Trial Days**: `14`

8. Click "Create Organization"

**Expected Results**:
- ✅ Form validates all required fields
- ✅ Password mismatch shows error
- ✅ Success toast appears: "Organization created successfully!"
- ✅ Redirects to `/organizations` page
- ✅ New organization appears in table
- ✅ React Query cache invalidated

**Validation Tests**:
- ❌ Submit with empty name → Error: "Organization Name is required"
- ❌ Submit with invalid email → Error: "Invalid email format"
- ❌ Submit password < 8 chars → Error: "Admin password must be at least 8 characters"
- ❌ Submit mismatched passwords → Error: "Admin password confirmation does not match"

---

### Test 5: View Organization Details
**Objective**: Verify organization detail page displays all information

**Steps**:
1. From organizations list, click on any organization name or Eye icon
2. Review all sections:
   - **Header**: Name, email, status badges, delete button
   - **Stats Grid**: Total Users, Monthly Revenue, Subscription, Created date
   - **Seat Usage**: Progress bar, usage percentage, available seats
   - **User Tier Management**: Tier selection and management
   - **Feature Management**: Feature toggles by tier
   - **Usage Analytics**: Charts and metrics
   - **Real-time Activity Feed**: Recent activities
   - **Organization Details**: Phone, website, address, contact person
   - **Subscription Details**: Plan, price, billing info
   - **Organization Admin Access**: Password reset form
   - **Organization Users**: User table with roles and status

**Expected Results**:
- ✅ All sections render without errors
- ✅ Data is accurate and matches organization
- ✅ Stats cards show correct numbers
- ✅ Seat usage progress bar reflects current usage
- ✅ User table displays all organization users
- ✅ All buttons and controls are functional

**Debug**:
- If sections fail to load, check individual API calls in Network tab
- `/organizations/:id` - Organization data
- `/organizations/:id/users` - Users data
- `/organizations/:id/seat-usage` - Seat usage data
- `/organizations/:id/statistics` - Analytics data

---

### Test 6: Update Organization (Seat Limit)
**Objective**: Test seat limit adjustment functionality

**Steps**:
1. On organization detail page, click "Adjust Seat Limit" button
2. In dialog:
   - **Current**: Shows current user count / max seats
   - **New Seat Limit**: Enter `100`
   - **Reason for Change**: Enter `Client upgraded plan, Payment confirmed`
3. Click "Update Seat Limit"

**Expected Results**:
- ✅ Dialog opens with current seat info
- ✅ Validation: New limit must be >= current user count
- ✅ Validation: Reason is required
- ✅ Success toast: "Seat limit updated successfully"
- ✅ Organization data refreshes
- ✅ Seat usage section shows new limit
- ✅ Progress bar recalculates percentage

**Validation Tests**:
- ❌ Enter limit < current users → Error
- ❌ Leave reason empty → Error: "Please provide a reason for the change"

---

### Test 7: Suspend Organization
**Objective**: Test organization suspension

**Steps**:
1. From organizations list, find an active organization
2. Click the Ban icon (suspend button)
3. Confirm suspension in browser alert
4. Observe changes

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ Success toast: "Organization suspended"
- ✅ Status badge changes to "Suspended"
- ✅ Ban icon changes to CheckCircle icon (activate)
- ✅ API call: `POST /organizations/:id/suspend`
- ✅ React Query cache invalidates

---

### Test 8: Activate Organization
**Objective**: Test organization activation

**Steps**:
1. From organizations list, find a suspended organization
2. Click the CheckCircle icon (activate button)
3. Observe changes

**Expected Results**:
- ✅ Success toast: "Organization activated"
- ✅ Status badge changes to "Active"
- ✅ CheckCircle icon changes to Ban icon (suspend)
- ✅ API call: `POST /organizations/:id/activate`
- ✅ React Query cache invalidates

---

### Test 9: Delete Organization
**Objective**: Test organization deletion with confirmation

**Steps**:
1. From organizations list, click Trash icon on any organization
2. Confirm deletion: "Are you sure you want to delete this organization? This action cannot be undone."
3. Click OK

**Expected Results**:
- ✅ Confirmation dialog appears with warning
- ✅ Success toast: "Organization deleted"
- ✅ Organization removed from table
- ✅ API call: `DELETE /organizations/:id`
- ✅ React Query cache invalidates
- ✅ Table re-renders without deleted org

**Safety**:
- ⚠️ This is a destructive action
- ⚠️ Test with non-critical test data only

---

### Test 10: Admin Password Reset
**Objective**: Test admin user password reset from Super Admin

**Steps**:
1. On organization detail page, scroll to "Organization Admin Access" section
2. Fields should be auto-populated with org admin email
3. Fill in:
   - Admin Email: `admin@test001.com`
   - Admin First Name: `Updated`
   - Admin Last Name: `Admin`
   - New Password: `NewSecure123!`
   - Confirm Password: `NewSecure123!`
4. Click "Save Admin Password"

**Expected Results**:
- ✅ Admin email auto-populates from org data
- ✅ Password validation: min 8 characters
- ✅ Password match validation
- ✅ Success toast: "Admin password updated"
- ✅ API call: `POST /organizations/:id/admin-user`
- ✅ Form resets (passwords cleared)

---

### Test 11: Pagination
**Objective**: Test pagination controls (if > 50 organizations exist)

**Steps**:
1. If less than 50 organizations, skip this test
2. Observe pagination controls at bottom of table
3. Click "Next" button
4. Click "Previous" button
5. Verify page info: "Showing X of Y organizations"

**Expected Results**:
- ✅ Pagination controls only show if totalPages > 1
- ✅ "Next" button works, loads page 2
- ✅ "Previous" button returns to page 1
- ✅ "Previous" disabled on page 1
- ✅ "Next" disabled on last page
- ✅ API calls include `?page=X` parameter

---

### Test 12: Error Handling
**Objective**: Test error scenarios and user feedback

**Test Scenarios**:

#### 12.1: Network Error
1. Stop backend server: `netstat -ano | findstr :3003` → Find PID → `taskkill /PID <PID> /F`
2. Try to load organizations list
3. Try to create organization
4. Restart backend

**Expected**:
- ✅ Error toast appears with message
- ✅ Loading spinner shows during request
- ✅ Graceful error state (not blank page crash)

#### 12.2: Invalid Token
1. Open DevTools → Application → localStorage
2. Modify `access_token` to invalid value
3. Try to access organizations list

**Expected**:
- ✅ 401 Unauthorized error
- ✅ Auto-redirect to login page
- ✅ Token cleared from localStorage

#### 12.3: Missing Required Fields
1. Open create organization form
2. Leave required fields empty
3. Click "Create Organization"

**Expected**:
- ✅ Form validation errors show
- ✅ Required fields highlighted in red
- ✅ Error messages displayed

---

### Test 13: React Query Cache & Optimistic Updates
**Objective**: Verify React Query caching works correctly

**Steps**:
1. Load organizations list (cache populated)
2. Open DevTools → React Query DevTools (bottom of page)
3. Observe queries: `['organizations', ...]`
4. Click on any organization (cache should have data)
5. Navigate back to list (no loading spinner = cached)
6. Create new organization
7. Verify cache invalidation (list refreshes)

**Expected Results**:
- ✅ Initial load shows loading state
- ✅ Subsequent navigation uses cached data (instant)
- ✅ Mutations invalidate relevant queries
- ✅ React Query DevTools shows query states: fetching, success, stale

---

### Test 14: Loading States
**Objective**: Verify loading spinners and skeletons display correctly

**Steps**:
1. Clear browser cache
2. Navigate to organizations list
3. Observe loading state
4. Navigate to organization detail page
5. Observe loading state

**Expected Results**:
- ✅ List page: Skeleton components show while loading
- ✅ Detail page: Skeleton components show while loading
- ✅ Create form: Button shows "Loading..." during submit
- ✅ Action buttons: Disabled during mutations

---

### Test 15: Responsive Design
**Objective**: Test UI on different screen sizes

**Steps**:
1. Open DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. Test screen sizes:
   - Desktop: 1920x1080
   - Tablet: 768x1024
   - Mobile: 375x667
3. Test all pages:
   - Organizations list
   - Create form
   - Detail view

**Expected Results**:
- ✅ Table scrolls horizontally on mobile
- ✅ Form fields stack vertically on mobile
- ✅ Buttons remain accessible
- ✅ No layout breaking or overlapping elements

---

## 🔍 Database Verification

### PostgreSQL (Local)
If using local PostgreSQL:

```sql
-- Connect to your database
psql -U postgres -d cognexiaai_erp

-- View organizations
SELECT id, name, email, status, "subscriptionStatus", "currentUserCount", "maxUsers", "createdAt"
FROM organization
ORDER BY "createdAt" DESC
LIMIT 10;

-- View organization users
SELECT u.id, u.email, u."firstName", u."lastName", u."userType", o.name as organization
FROM "user" u
LEFT JOIN organization o ON u."organizationId" = o.id
WHERE u."userType" IN ('org_admin', 'user')
ORDER BY u."createdAt" DESC;

-- Check seat usage
SELECT 
  id,
  name,
  "currentUserCount",
  "maxUsers",
  ROUND(("currentUserCount"::numeric / "maxUsers"::numeric) * 100, 1) as usage_percentage
FROM organization
WHERE "deletedAt" IS NULL
ORDER BY usage_percentage DESC;
```

### Supabase (Cloud)
If using Supabase:

1. Open Supabase dashboard
2. Navigate to Table Editor
3. Select `organization` table
4. Verify created organizations appear
5. Check `user` table for admin users
6. Use SQL Editor for complex queries

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot GET /api/v1/organizations" (404 Error)
**Cause**: Backend route not registered or API prefix mismatch

**Solutions**:
1. Verify backend is running on port 3003
2. Check main.ts: `app.setGlobalPrefix('api/v1');`
3. Check organization.controller.ts: `@Controller('organizations')`
4. Full URL should be: `http://localhost:3003/api/v1/organizations`

### Issue 2: "Unauthorized" (401 Error)
**Cause**: Missing or invalid JWT token

**Solutions**:
1. Check localStorage for `access_token`
2. Re-login to get fresh token
3. Verify token format: `Bearer <token>`
4. Check backend JwtAuthGuard is configured correctly

### Issue 3: Empty Organizations List
**Cause**: No organizations in database

**Solutions**:
1. Create organization using Test 4
2. Check database directly (SQL queries above)
3. Verify API returns empty array vs error
4. Check API response in Network tab: `{ data: [], total: 0 }`

### Issue 4: Form Submission Fails
**Cause**: Validation error or missing required fields

**Solutions**:
1. Check browser console for validation errors
2. Verify all required fields are filled
3. Check Network tab for API error response
4. Look for toast error message

### Issue 5: Seat Limit Update Fails
**Cause**: New limit < current users or missing reason

**Solutions**:
1. Ensure new limit >= current user count
2. Provide reason text (required field)
3. Check API error response for specific error
4. Verify user has SUPER_ADMIN role

### Issue 6: Pagination Not Showing
**Cause**: Less than 50 organizations (default limit)

**Solutions**:
1. This is expected behavior
2. Create more test organizations to see pagination
3. Alternatively, reduce limit in code: `limit: 10` in `useOrganizations` hook

### Issue 7: React Query Cache Not Invalidating
**Cause**: Query keys don't match or invalidation not called

**Solutions**:
1. Open React Query DevTools
2. Check query key structure: `['organizations', filters]`
3. Verify mutations call `queryClient.invalidateQueries({ queryKey: ['organizations'] })`
4. Force refresh: Clear cache in DevTools

---

## ✅ Test Completion Checklist

Print this checklist and mark each test as you complete it:

- [ ] Test 1: Login & Navigation
- [ ] Test 2: Organizations List View
- [ ] Test 3: Search & Filters
- [ ] Test 4: Create Organization
- [ ] Test 5: View Organization Details
- [ ] Test 6: Update Organization (Seat Limit)
- [ ] Test 7: Suspend Organization
- [ ] Test 8: Activate Organization
- [ ] Test 9: Delete Organization
- [ ] Test 10: Admin Password Reset
- [ ] Test 11: Pagination
- [ ] Test 12: Error Handling
- [ ] Test 13: React Query Cache
- [ ] Test 14: Loading States
- [ ] Test 15: Responsive Design
- [ ] Database Verification (PostgreSQL/Supabase)

---

## 📊 Success Criteria

The Organizations Management feature is **ready for launch** when:

✅ **All 15 tests pass** without critical errors
✅ **CRUD operations work** seamlessly (Create, Read, Update, Delete)
✅ **Search and filters** function correctly
✅ **Pagination** works for large datasets
✅ **Form validation** catches all input errors
✅ **Error handling** provides user-friendly messages
✅ **Loading states** display during async operations
✅ **React Query cache** optimizes performance
✅ **API integration** connects to backend correctly
✅ **Database** reflects all changes accurately
✅ **Responsive design** works on all screen sizes

---

## 🎓 Feature Template Documentation

Once testing is complete, this Organizations Management feature serves as the **template** for implementing the remaining 32 Super Admin features. Document these patterns:

### Reusable Patterns
1. **API Client**: `src/lib/api-client.ts` - Auth interceptors, error handling
2. **React Query Hooks**: `src/hooks/use-organizations.ts` - Query/mutation patterns
3. **List Page**: `src/app/(dashboard)/organizations/page.tsx` - Table, search, filters
4. **Create Form**: `src/components/organizations/create-organization-form.tsx` - Form validation
5. **Detail Page**: `src/app/(dashboard)/organizations/[id]/page.tsx` - Stats, metrics, sub-sections
6. **Types**: `src/types/organization.ts` - TypeScript interfaces

### Next Steps
After Organizations is confirmed working:
1. Replicate pattern for **Users Management**
2. Then **Subscription Plans Management**
3. Continue through all 33 features using this template

---

## 📞 Support

If you encounter issues not covered in this guide:
1. Check browser console for errors
2. Check backend logs for API errors
3. Review Network tab for failed requests
4. Check React Query DevTools for cache issues
5. Verify database state with SQL queries

---

**Happy Testing! 🚀**
