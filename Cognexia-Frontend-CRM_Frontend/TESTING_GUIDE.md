# Multi-Tenant CRM System - Testing Guide

## System Overview

### Architecture
- **Backend API**: NestJS (Port 3003)
- **Client Portal**: Next.js (Port 3002)  
- **Super Admin Portal**: Next.js (Port 3001)
- **Database**: PostgreSQL/Supabase (Hybrid Mode)

### URLs
- Backend: `http://localhost:3003`
- Client Portal: `http://localhost:3002`
- Super Admin Portal: `http://localhost:3001`
- API Docs: `http://localhost:3003/api/docs`

---

## Pre-Testing Setup

### 1. Start All Services

**Backend (Terminal 1):**
```powershell
cd C:\Users\nshrm\Desktop\CognexiaAI-ERP\backend\modules\03-CRM
npm run start:dev
```

**Client Portal (Terminal 2):**
```powershell
cd C:\Users\nshrm\Desktop\CognexiaAI-ERP\frontend\client-admin-portal
npm run dev
```

**Super Admin Portal (Terminal 3):**
```powershell
cd C:\Users\nshrm\Desktop\CognexiaAI-ERP\frontend\super-admin-portal
npm run dev
```

### 2. Verify Services Are Running
- Backend: `http://localhost:3003/health`
- Client Portal: `http://localhost:3002`
- Super Admin Portal: `http://localhost:3001`

---

## Test Suite

### Test 1: Signup Flow (Step 5.1)

#### Objective
Verify that user registration creates Organization + User + Subscription and logs in automatically.

#### Steps
1. Open Client Portal: `http://localhost:3002/register`
2. Fill out registration form:
   - **Step 1 - Personal Info:**
     - First Name: `John`
     - Last Name: `Doe`
     - Email: `john.doe@testcompany.com`
   - **Step 2 - Organization:**
     - Organization Name: `Test Company Inc`
     - Industry: `Technology`
     - Company Size: `11-50`
   - **Step 3 - Password:**
     - Password: `SecurePass123`
     - Confirm Password: `SecurePass123`
3. Click "Create Account"

#### Expected Results
✅ Form validates successfully  
✅ Backend creates:
  - Organization record
  - User record with OWNER + ADMIN roles
  - Subscription record (FREE trial)
✅ Returns JWT tokens (accessToken, refreshToken)
✅ Tokens stored in localStorage
✅ Auto-redirects to `/dashboard` (client portal)
✅ Organization context set

#### Verification
- Check browser localStorage for:
  - `accessToken`
  - `refreshToken`
  - `organizationId`
- Check backend database for new records
- Verify email: `john.doe@testcompany.com` appears in dashboard

---

### Test 2: Login with Role-Based Routing (Step 5.1 continued)

#### Objective
Verify login routes SUPER_ADMIN to admin portal, regular users to client portal.

#### Test 2A: Regular User Login
1. Open: `http://localhost:3002/login`
2. Login with:
   - Email: `john.doe@testcompany.com`
   - Password: `SecurePass123`

**Expected:**
✅ Login successful
✅ Stays in client portal
✅ Redirects to `http://localhost:3002/dashboard`

#### Test 2B: Super Admin Login
1. First, create super admin user (via backend):
   ```bash
   # Use database tool or API to create super admin
   POST http://localhost:3003/users/create-super-admin
   {
     "email": "admin@cognexiaai.com",
     "password": "AdminPass123",
     "firstName": "Super",
     "lastName": "Admin"
   }
   ```

2. Open: `http://localhost:3002/login` (or 3001)
3. Login with:
   - Email: `admin@cognexiaai.com`
   - Password: `AdminPass123`

**Expected:**
✅ Login successful
✅ Detects SUPER_ADMIN role
✅ Redirects to `http://localhost:3001/dashboard` (super admin portal)

---

### Test 3: Seat Limit Enforcement (Step 5.2)

#### Objective
Verify users cannot be added when maxUsers limit is reached.

#### Setup
1. Login as organization owner: `john.doe@testcompany.com`
2. Navigate to Team Management: `http://localhost:3002/team`

#### Test 3A: View Seat Usage
**Expected:**
✅ Seat usage card shows: `1 / 5 seats used` (FREE plan default)
✅ Progress bar displays correctly
✅ Green indicator (not near limit)

#### Test 3B: Add Users Until Limit
1. Click "Invite Team Member"
2. Add 4 more users:
   - `user2@testcompany.com` (ADMIN)
   - `user3@testcompany.com` (USER)
   - `user4@testcompany.com` (USER)
   - `user5@testcompany.com` (USER)

**Expected:**
✅ Each invitation succeeds
✅ Seat counter updates: `2/5`, `3/5`, `4/5`, `5/5`
✅ Progress bar fills up
✅ At 80% (4/5): Yellow warning appears
✅ At 100% (5/5): Red alert appears

#### Test 3C: Attempt to Exceed Limit
1. Try to invite 6th user: `user6@testcompany.com`

**Expected:**
✅ "Invite Team Member" button is DISABLED
✅ Error message: "Seat limit reached"
✅ Alert shows: "Upgrade to add more users"
✅ Upgrade button appears

#### Test 3D: Upgrade Flow
1. Click "Upgrade" button
2. Navigate to `/subscription`

**Expected:**
✅ Shows available plans
✅ Can select higher tier plan
✅ Upgrade dialog appears with payment confirmation

---

### Test 4: Data Isolation (Step 5.3)

#### Objective
Verify organizations cannot see each other's data.

#### Setup
1. Create second organization:
   - Email: `jane.smith@company2.com`
   - Organization: `Company Two LLC`
2. Login as `jane.smith@company2.com`
3. Add some test data (customers, leads, etc.)

#### Test 4A: Check Organization Context
**Expected:**
✅ User sees only their organization's data
✅ Dashboard shows: "Company Two LLC"
✅ Team page shows only Company Two's users

#### Test 4B: API-Level Isolation
1. Open browser DevTools → Network tab
2. Navigate to Customers page
3. Check API request to `/customers`

**Expected:**
✅ Request includes `Authorization: Bearer <token>`
✅ JWT contains correct `organizationId`
✅ Backend middleware injects `organizationId` into query
✅ Response only contains Company Two's customers

#### Test 4C: Cross-Organization Access Attempt
1. Login as `john.doe@testcompany.com`
2. Get organizationId from localStorage
3. Try to manually call API with Company Two's organizationId

**Expected:**
✅ Backend rejects request
✅ Returns 403 Forbidden or filters data
✅ Tenant middleware enforces isolation

---

### Test 5: Super Admin Access (Step 5.4)

#### Objective
Verify super admin can view/manage all organizations and adjust seat limits.

#### Setup
Login as super admin: `admin@cognexiaai.com`

#### Test 5A: Organizations List
1. Navigate to: `http://localhost:3001/organizations`

**Expected:**
✅ Shows ALL organizations:
  - Test Company Inc
  - Company Two LLC
✅ Table columns: Name, Owner, Status, Plan, Users, Created
✅ Search works across all orgs
✅ Filter by status works
✅ Pagination works

#### Test 5B: Organization Detail Page
1. Click on "Test Company Inc"
2. Navigate to: `http://localhost:3001/organizations/{id}`

**Expected:**
✅ Stats cards show:
  - Total Users: 5/5
  - Monthly Revenue
  - Subscription Plan
  - Created date
✅ Seat Usage card with progress bar
✅ Organization details (phone, website, address)
✅ Contact person info
✅ Subscription details
✅ **Full user list** (all 5 users visible)
✅ "Adjust Seat Limit" button visible

#### Test 5C: Adjust Seat Limit
1. Click "Adjust Seat Limit"
2. Enter new limit: `10`
3. Enter reason: `Client upgraded to Pro plan - payment confirmed`
4. Click "Update Seat Limit"

**Expected:**
✅ Dialog validates inputs
✅ Shows payment confirmation notice
✅ API call: `PATCH /organizations/{id}/seat-limit`
✅ Backend checks:
  - User is SUPER_ADMIN ✓
  - Payment confirmed ✓
  - New limit >= current users ✓
✅ Seat limit updates: `5 / 10 seats used`
✅ Audit log created
✅ Success toast notification

#### Test 5D: Create New Organization
1. Navigate to: `http://localhost:3001/organizations/create`
2. Fill form:
   - Organization: `Company Three`
   - Email: `info@company3.com`
   - Contact Person: `Bob Wilson`
   - Subscription Plan: `Business`
   - Trial Days: `30`
3. Click "Create Organization"

**Expected:**
✅ Organization created
✅ Redirects to organizations list
✅ New org appears in list
✅ Can view details immediately

#### Test 5E: Suspend/Activate Organization
1. From organizations list
2. Click suspend button for "Company Three"

**Expected:**
✅ Confirmation dialog appears
✅ Status changes to "SUSPENDED"
✅ Users cannot login
✅ Badge shows "Suspended"

3. Click activate button

**Expected:**
✅ Status changes to "ACTIVE"
✅ Users can login again

---

## API Endpoints to Test

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Token refresh
- `GET /auth/me` - Get current user

### Organizations (Super Admin)
- `GET /organizations` - List all orgs
- `GET /organizations/:id` - Get org details
- `POST /organizations` - Create org
- `PATCH /organizations/:id` - Update org
- `DELETE /organizations/:id` - Delete org
- `GET /organizations/:id/users` - Get org users
- `GET /organizations/:id/seat-usage` - Get seat usage
- `PATCH /organizations/:id/seat-limit` - Adjust seat limit
- `POST /organizations/:id/suspend` - Suspend org
- `POST /organizations/:id/activate` - Activate org

### Users (Within Organization)
- `GET /users/organization` - List team members
- `POST /users/invite` - Invite user
- `DELETE /users/:id` - Remove user

### Subscription
- `GET /subscription-plans` - List plans
- `POST /organizations/:id/upgrade` - Upgrade plan

---

## Common Issues & Solutions

### Issue 1: "Cannot GET /" in Super Admin Portal

**Cause:** Not logged in or wrong token key

**Solution:**
1. Check localStorage has `accessToken` (not `access_token`)
2. Login first at `/login`
3. Verify JWT contains `SUPER_ADMIN` role

### Issue 2: Data from wrong organization appears

**Cause:** TenantMiddleware not applied or JWT missing organizationId

**Solution:**
1. Verify JWT payload includes `organizationId`
2. Check backend logs for middleware execution
3. Verify all API requests include Authorization header

### Issue 3: Seat limit not enforced

**Cause:** Backend validation not triggered

**Solution:**
1. Check `OrganizationService.canAddUser()` is called
2. Verify `currentUserCount` is accurate
3. Check frontend disables invite button when at limit

### Issue 4: Super admin can't access organization

**Cause:** Role check failing

**Solution:**
1. Verify user has `userType: 'SUPER_ADMIN'`
2. Check JWT includes `SUPER_ADMIN` in roles array
3. Backend guards check both userType and roles

---

## Success Criteria

### ✅ Step 1: Backend Multi-Tenant Foundation
- [x] Signup creates org + user + subscription
- [x] JWT includes organizationId and roles
- [x] TenantMiddleware extracts organizationId
- [x] Role-based guards work
- [x] Seat limit enforcement active
- [x] Middleware applied globally

### ✅ Step 2: Super Admin Portal
- [x] Organizations list with filters
- [x] Organization detail page complete
- [x] Organization creation form
- [x] Seat limit adjustment
- [x] Full user visibility

### ✅ Step 3: Public Signup & Auth
- [x] Signup form (3-step wizard)
- [x] Login with role-based routing
- [x] JWT storage and validation
- [x] Token refresh
- [x] Auth helper utilities

### ✅ Step 4: Client Portal Features
- [x] Team management page
- [x] Seats indicator component
- [x] Subscription management page

### ⏳ Step 5: Testing
- [ ] Test signup flow
- [ ] Test seat limit enforcement
- [ ] Test data isolation
- [ ] Test super admin access

---

## Next Steps

1. **Run all tests** following this guide
2. **Document any bugs** found
3. **Fix issues** one by one
4. **Re-test** after fixes
5. **Mark tests as passed** ✅

---

## Contact & Support

If you encounter issues during testing:
1. Check backend logs
2. Check browser console for errors
3. Verify database records
4. Review API response in Network tab

**System is ready for production deployment after all tests pass!** 🚀
