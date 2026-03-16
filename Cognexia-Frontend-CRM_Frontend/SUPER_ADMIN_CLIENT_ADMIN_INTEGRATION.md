# Super Admin ↔ Client Admin Portal Integration

## 🔗 Yes, It's Fully Integrated!

The User Tier Management settings you configure in the **Super Admin Portal** directly control what happens in the **Client Admin Portal**. Here's the complete flow:

---

## 📊 How It Works

### Flow Diagram:
```
┌─────────────────────────────────────────────────────────────┐
│                    SUPER ADMIN PORTAL                       │
│                    (localhost:3001)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Organizations → Select Org → User Tier Management          │
│                                                             │
│  ┌────────────────────────────────────────────────┐        │
│  │ Enable Advanced Tier → maxUsers = 100         │        │
│  └────────────────────────────────────────────────┘        │
│                       ↓                                     │
│              Saves to Database:                             │
│              - organization.maxUsers = 100                  │
│              - organization.userTierConfig = {...}          │
│                                                             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND API                             │
│                  (localhost:3003)                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  UserTierService.validateUserAddition(orgId)               │
│     ↓                                                       │
│  Checks: currentUsers < maxUsers                           │
│     ↓                                                       │
│  If FULL → Throws Error: "User limit reached"              │
│  If OK → Allows user creation                              │
│                                                             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                  CLIENT ADMIN PORTAL                        │
│                    (localhost:3002)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Shows Seat Usage: "X / 100 seats used"                 │
│  2. Displays warnings when approaching limit                │
│  3. Disables "Invite User" button when at limit            │
│  4. Shows upgrade prompts                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Integration Points

### 1. Seat Limit Display

**Super Admin Sets**: maxUsers = 100 (Advanced tier)

**Client Admin Shows**:
- **TopNav Badge**: `X / 100` with color-coded warning
- **Team Page Card**: Progress bar showing usage percentage
- **Seat Usage API**: Real-time data from `/organizations/{id}/seat-usage`

**Files Involved**:
```
Client Admin Portal:
├── components/SeatsIndicator.tsx          (TopNav badge)
├── components/team/user-limit-status.tsx  (Detailed seat status)
└── app/(dashboard)/team/page.tsx          (Team management page)
```

---

### 2. User Invitation Enforcement

**Super Admin Sets**: maxUsers = 100

**Client Admin Enforces**:
1. **Frontend Check**: Disables "Invite Team Member" button when `canAddUsers = false`
2. **Backend Validation**: API throws error if limit reached
3. **Real-time Updates**: Seat usage updates after each user addition/deletion

**Code Flow**:

#### Frontend (Client Admin Portal)
```typescript
// app/(dashboard)/team/page.tsx

const { data: seatUsage } = useQuery<SeatUsage>({
  queryKey: ['seat-usage'],
  queryFn: async () => {
    const orgId = localStorage.getItem('organizationId');
    const response = await apiClient.get(`/organizations/${orgId}/seat-usage`);
    return response.data;
  },
});

const isAtLimit = seatUsage && !seatUsage.canAddUsers;

// Disable invite button when at limit
<Button disabled={isAtLimit}>
  <UserPlus /> Invite Team Member
</Button>
```

#### Backend Validation
```typescript
// services/user-management.service.ts (Line 118-120)

// Check user tier limits
if (dto.userType !== UserType.SUPER_ADMIN && this.userTierService) {
  await this.userTierService.validateUserAddition(dto.organizationId);
}

// services/user-tier.service.ts (Line 210-217)

async validateUserAddition(organization_id: string): Promise<void> {
  const allocation = await this.getUserTierAllocation(organization_id);
  
  if (!allocation.canAddUsers) {
    throw new BadRequestException(
      `User limit reached (${allocation.currentUserCount}/${allocation.maxAllowedUsers}). 
       Please upgrade to add more users.`
    );
  }
}
```

---

### 3. Visual Warnings & Alerts

**Client Admin displays warnings based on Super Admin settings**:

#### At 80% Capacity (Near Limit)
```
┌─────────────────────────────────────────────┐
│ ⚠️  Approaching limit!                      │
│ You're using 82% of your user seats.       │
│ Consider upgrading to add more users.      │
└─────────────────────────────────────────────┘
```

#### At 100% Capacity (At Limit)
```
┌─────────────────────────────────────────────┐
│ 🚫 User limit reached!                      │
│ You've used all 100 available seats.       │
│ Contact administrator to upgrade plan.      │
└─────────────────────────────────────────────┘
```

**Files**:
- `components/team/user-limit-status.tsx` (Lines 137-153)
- `app/(dashboard)/team/page.tsx` (Lines 293-309)

---

### 4. Tier-Based Feature Access

**Super Admin Controls**:
- Basic: 1 user
- Premium: 10 users  
- Advanced: 100 users

**Client Admin Reflects**:
- Shows current tier badge (BASIC/PREMIUM/ADVANCED)
- Displays upgrade options based on current tier
- Shows tier-specific features

**Example UI**:
```
┌─────────────────────────────────────────────────────┐
│ User Allocation                                     │
│ ┌───────────┐                          5 / 100     │
│ │ ADVANCED  │                          users       │
│ └───────────┘                                       │
│                                                     │
│ ████████████████░░░░░░░░░░░░░░░░░░░░░░░░  5%       │
│                                                     │
│ ✓ 95 seats available                                │
└─────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Integration

### Test Scenario: Super Admin Sets Advanced Tier (100 Users)

#### Step 1: Super Admin Portal
1. Login: `http://localhost:3001`
2. Go to Organizations → Click organization
3. Enable Advanced tier → Sets maxUsers = 100
4. Verify console log: `customMaxUsers: 100`

#### Step 2: Database Verification
```sql
SELECT name, "maxUsers", "currentUserCount" 
FROM organizations 
WHERE id = '{orgId}';
```
**Expected**: `maxUsers` = 100

#### Step 3: Client Admin Portal (Same Organization)
1. Login: `http://localhost:3002`
2. Check **TopNav badge**: Should show `X / 100`
3. Go to **Team Management**
4. Check **Seat Usage Card**: Shows progress bar and `X / 100 seats used`

#### Step 4: Test User Invitation
1. Click "Invite Team Member" button (should be enabled if < 100 users)
2. Fill form and send invitation
3. Check seat count updates: `(X+1) / 100`
4. Repeat until 100 users
5. At 100: Button should be **disabled**, error alert shows

#### Step 5: Backend Enforcement
Try API call directly:
```bash
curl -X POST http://localhost:3003/api/v1/users/invite \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "userType": "org_user"
  }'
```

**Expected Response (at limit)**:
```json
{
  "statusCode": 400,
  "message": "User limit reached (100/100). Please upgrade to add more users.",
  "error": "Bad Request"
}
```

---

## 📡 Real-Time Synchronization

### How Changes Propagate:

1. **Super Admin changes tier** → Database updated immediately
2. **Client Admin polls seat-usage** → Every 60 seconds (auto-refresh)
3. **User adds/removes team member** → Invalidates React Query cache
4. **UI updates instantly** → Shows new counts and warnings

**React Query Refetch Intervals**:
```typescript
// Auto-refresh seat usage every minute
const { data: seatUsage } = useQuery({
  queryKey: ['seat-usage'],
  queryFn: fetchSeatUsage,
  refetchInterval: 60000, // 60 seconds
});
```

---

## 🔐 Backend Enforcement Points

### 1. User Creation
**File**: `services/user-management.service.ts`
**Line**: 118-120
```typescript
await this.userTierService.validateUserAddition(dto.organizationId);
```

### 2. User Invitation
**File**: `services/user-management.service.ts`
**Line**: 188-203
```typescript
if (this.userTierService) {
  await this.userTierService.validateUserAddition(organization_id);
}
```

### 3. Seat Usage Calculation
**File**: `services/organization.service.ts`
**Line**: 647-698
```typescript
const currentUserCount = await this.userRepository.count({
  where: { organizationId: id, isActive: true },
});

const canAddUsers = currentUserCount < organization.maxUsers;
```

---

## 🎨 UI Components Connection

### Super Admin Portal → Client Admin Portal

| Super Admin Component | Sets Value | Client Admin Component | Displays Value |
|----------------------|------------|------------------------|----------------|
| `user-tier-manager.tsx` | `maxUsers: 100` | `SeatsIndicator.tsx` | `X / 100` badge |
| User Tier toggles | `activeTier: "advanced"` | `user-limit-status.tsx` | `ADVANCED` badge |
| Advanced tier ON | `canAddUsers: true/false` | Team page button | Enabled/Disabled |
| Tier config | `userTierConfig` | Upgrade prompts | Show/Hide options |

---

## ✅ Integration Checklist

Verify the integration is working:

### Super Admin Portal:
- [ ] Enable Advanced tier for organization
- [ ] Verify console shows `customMaxUsers: 100`
- [ ] Check database: `maxUsers` = 100
- [ ] See Active Plan badge: ADVANCED

### Client Admin Portal (Same Org):
- [ ] TopNav badge shows `X / 100`
- [ ] Team page Seat Usage card shows `X / 100 seats used`
- [ ] Progress bar reflects correct percentage
- [ ] "Invite Team Member" button enabled (if < 100 users)
- [ ] Warnings appear at 80% capacity
- [ ] Button disabled at 100 users
- [ ] Error message shows when trying to add user at limit

### Backend API:
- [ ] GET `/organizations/{id}/seat-usage` returns correct data
- [ ] POST `/users/invite` validates seat limits
- [ ] Error thrown when limit reached
- [ ] User count updates after add/remove
- [ ] Audit logs record tier changes

---

## 🐛 Troubleshooting

### Issue: Client Admin not showing updated limits

**Possible Causes**:
1. React Query cache not invalidating
2. Browser caching old data
3. Wrong organization ID in localStorage

**Solutions**:
```typescript
// Force refetch seat usage
queryClient.invalidateQueries({ queryKey: ['seat-usage'] });

// Hard refresh browser
// Ctrl + Shift + R

// Check localStorage
console.log(localStorage.getItem('organizationId'));
```

### Issue: Button enabled even at limit

**Check**:
1. `seatUsage.canAddUsers` value
2. `isAtLimit` boolean calculation
3. Backend `/seat-usage` endpoint response

**Debug**:
```typescript
// Add logging in Team page
console.log('Seat Usage:', seatUsage);
console.log('Is At Limit:', isAtLimit);
console.log('Can Add Users:', seatUsage?.canAddUsers);
```

### Issue: Backend not enforcing limits

**Verify**:
1. UserTierService is injected properly
2. `validateUserAddition` is being called
3. Organization `maxUsers` field is set correctly

**Check Backend Logs**:
```bash
# Look for validation errors
tail -f backend-logs.txt | grep "User limit"
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE (PostgreSQL)                     │
├─────────────────────────────────────────────────────────────────┤
│  organizations table:                                           │
│    - id                                                         │
│    - name                                                       │
│    - maxUsers: 100          ← Super Admin sets this            │
│    - currentUserCount: 5    ← Backend updates this             │
│    - userTierConfig: {      ← Super Admin configures           │
│        advanced: {                                              │
│          enabled: true,                                         │
│          maxUsers: 100                                          │
│        }                                                        │
│      }                                                          │
└──────────────────┬──────────────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ↓                   ↓
┌─────────────────┐  ┌─────────────────┐
│  SUPER ADMIN    │  │  CLIENT ADMIN   │
│  Sets Rules     │  │  Sees Limits    │
└─────────────────┘  └─────────────────┘
         │                   │
         │                   ↓
         │          Fetches: /seat-usage
         │          Shows: X / 100
         │          Enforces: Button states
         │                   │
         └───────────────────┼────→ Backend validates
                             │      on every user add
                             ↓
                   ✓ or ✗ User creation
```

---

## 🎓 Summary

**Yes, it's fully integrated!**

✅ **Super Admin controls** → Database
✅ **Database** → Backend API validation
✅ **Backend API** → Client Admin displays
✅ **Client Admin** → Real-time UI updates
✅ **User actions** → Backend enforcement

**Key Points**:
1. Super Admin tier settings **directly control** Client Admin limits
2. Client Admin **cannot bypass** limits (backend enforces)
3. Changes are **immediate** and synchronized
4. Warnings and UI states are **automatic** based on limits
5. All operations are **audited** in audit logs

**Test it yourself**: Follow the testing steps above to see the integration in action! 🚀
