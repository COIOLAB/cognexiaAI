# User Tier Management - Testing Checklist

## 🎯 What Was Fixed

### Issues Identified:
1. ❌ **Enable/Disable switches not showing** in "Manage User Tiers" section
2. ❌ **Advanced tier showing "Unlimited Users"** instead of "Up to 100 Users"
3. ❌ **Switches not initializing** with current tier status

### Fixes Applied:
1. ✅ Added proper `useEffect` hook for data loading on mount
2. ✅ Fixed switch state initialization with safe navigation (`?.`)
3. ✅ Added `customMaxUsers: 100` when enabling Advanced tier
4. ✅ Updated UI text: "Unlimited Users" → "Up to 100 Users"
5. ✅ Enhanced error handling with detailed console logging
6. ✅ Improved loading state with spinner animation
7. ✅ Fixed switch state updates after API response

---

## 🧪 Testing Instructions

### Prerequisites
1. **Backend running** on port 3003
2. **Super Admin Portal running** on port 3001
3. **Super Admin logged in** with demo credentials

### Test 1: View User Tier Management Section
**Objective**: Verify the User Tier Management section loads and displays correctly

**Steps**:
1. Login to Super Admin Portal: `http://localhost:3001/login`
   - Email: `demo@cognexiaai.com`
   - Password: `Demo@12345`
2. Navigate to **Organizations** in sidebar
3. Click on any **active organization** name
4. Scroll down to **"Manage User Tiers"** section

**Expected Results**:
- ✅ Section displays with card title "User Allocation Status"
- ✅ Shows Active Plan badge (BASIC/PREMIUM/ADVANCED)
- ✅ Shows current user count vs max users
- ✅ "Can add users" or "Limit reached" indicator visible
- ✅ **Three tier cards visible** with switches:
  - Basic: 1 User - Toggle switch visible
  - Premium: Up to 10 Users - Toggle switch visible
  - Advanced: Up to 100 Users (NOT "Unlimited") - Toggle switch visible
- ✅ Loading spinner shows briefly while fetching data

**Debug**:
- Open browser DevTools → Console
- Check for log: `"Loaded tier allocation:"` with data object
- If error, check: `"Failed to load tier allocation, status:"`

---

### Test 2: Enable Basic Tier
**Objective**: Test enabling Basic tier (1 user limit)

**Steps**:
1. In "Manage User Tiers" section
2. Click the **Basic tier switch** to enable it
3. Observe changes

**Expected Results**:
- ✅ Switch shows loading state (disabled briefly)
- ✅ Success toast: "User tier basic enabled successfully"
- ✅ Switch stays in **ON** position
- ✅ User Allocation Status updates:
  - Active Plan badge shows: **BASIC**
  - Users shows: X / 1
- ✅ Organization maxUsers updated to 1 in database

**API Call (DevTools Network)**:
```
PUT http://localhost:3003/api/v1/user-tiers/organization/{orgId}
Body: { "tier": "basic", "enabled": true }
Response: { "success": true, "message": "...", "allocation": {...} }
```

**Console Logs**:
```
Updating tier: {tier: "basic", enabled: true}
Update result: {success: true, message: "...", allocation: {...}}
```

---

### Test 3: Enable Premium Tier
**Objective**: Test enabling Premium tier (10 users limit)

**Steps**:
1. Click the **Premium tier switch** to enable it
2. Observe changes

**Expected Results**:
- ✅ Switch shows loading state
- ✅ Success toast: "User tier premium enabled successfully"
- ✅ Switch stays in **ON** position
- ✅ User Allocation Status updates:
  - Active Plan badge shows: **PREMIUM** (overrides Basic)
  - Users shows: X / 10
- ✅ Organization maxUsers updated to 10

**API Call**:
```
PUT http://localhost:3003/api/v1/user-tiers/organization/{orgId}
Body: { "tier": "premium", "enabled": true }
```

**Note**: Premium takes priority over Basic if both are enabled

---

### Test 4: Enable Advanced Tier (100 Users)
**Objective**: Test enabling Advanced tier with 100 users limit

**Steps**:
1. Click the **Advanced tier switch** to enable it
2. Observe changes carefully

**Expected Results**:
- ✅ Switch shows loading state
- ✅ Success toast: "User tier advanced enabled successfully"
- ✅ Switch stays in **ON** position
- ✅ User Allocation Status updates:
  - Active Plan badge shows: **ADVANCED** (overrides all)
  - Users shows: X / 100 (NOT unlimited symbol ∞)
- ✅ Organization maxUsers updated to **100** in database

**API Call** (Most Important):
```
PUT http://localhost:3003/api/v1/user-tiers/organization/{orgId}
Body: { "tier": "advanced", "enabled": true, "customMaxUsers": 100 }
Response: { "allocation": { "maxAllowedUsers": 100 } }
```

**Console Logs**:
```
Updating tier: {tier: "advanced", enabled: true, customMaxUsers: 100}
Update result: {success: true, allocation: {maxAllowedUsers: 100}}
```

**Verify in Database**:
```sql
SELECT id, name, "maxUsers", "userTierConfig"
FROM organizations
WHERE id = '{orgId}';
```

Should show:
- `maxUsers`: 100
- `userTierConfig.advanced.enabled`: true
- `userTierConfig.advanced.maxUsers`: 100

---

### Test 5: Disable Tiers
**Objective**: Test disabling tiers

**Steps**:
1. Click Advanced switch to **disable** it
2. Observe badge changes to PREMIUM (if enabled) or BASIC
3. Click Premium switch to **disable** it
4. Click Basic switch to **disable** it

**Expected Results**:
- ✅ Each disable action shows success toast
- ✅ Active Plan badge updates based on priority
- ✅ When all disabled, defaults to BASIC
- ✅ Switch states accurately reflect enabled/disabled

---

### Test 6: Multiple Organizations
**Objective**: Verify tier settings are per-organization

**Steps**:
1. Enable Advanced tier for Organization A
2. Navigate back to Organizations list
3. Open Organization B
4. Check User Tier Management section

**Expected Results**:
- ✅ Organization B has **independent** tier configuration
- ✅ Organization A's settings don't affect Organization B
- ✅ Each org loads its own `userTierConfig` from database

---

### Test 7: Error Handling
**Objective**: Test error scenarios

**Scenario 7.1: Network Error**
1. Stop backend: Find PID with `netstat -ano | findstr :3003`
2. Try to toggle any tier switch
3. Restart backend

**Expected**:
- ✅ Error toast: "Failed to update tier"
- ✅ Switch reverts to previous state
- ✅ Console log: "Error updating tier:"

**Scenario 7.2: Invalid Token**
1. Open DevTools → Application → localStorage
2. Delete `access_token`
3. Try to toggle tier switch

**Expected**:
- ✅ 401 Unauthorized error
- ✅ Redirect to login page

---

### Test 8: Refresh & Persistence
**Objective**: Verify tier settings persist across page reloads

**Steps**:
1. Enable Advanced tier for an organization
2. Refresh the page (F5)
3. Scroll to "Manage User Tiers" section

**Expected Results**:
- ✅ Advanced switch is still **ON** after reload
- ✅ Active Plan badge shows **ADVANCED**
- ✅ Users shows: X / 100
- ✅ Data loaded from database correctly

---

### Test 9: Switch Visual States
**Objective**: Verify switch UI/UX works properly

**Checklist**:
- ✅ Switches are visible (not hidden)
- ✅ Switches have correct color:
  - OFF: Gray
  - ON: Blue/Primary color
- ✅ Switches show loading state (disabled + dimmed) during API call
- ✅ Switches respond to clicks
- ✅ Switch position matches actual tier enabled state

---

### Test 10: Console Debugging
**Objective**: Verify all debug logs work

**Open DevTools Console**, then:
1. Refresh organization detail page
2. Toggle each tier switch

**Expected Console Logs**:

```javascript
// On page load
"Loaded tier allocation:" {organizationId: "...", activeTier: "basic", tierConfig: {...}}

// On tier toggle
"Updating tier:" {tier: "advanced", enabled: true, customMaxUsers: 100}
"Update result:" {success: true, message: "...", allocation: {...}}
```

**If errors**:
```javascript
"Failed to load tier allocation, status:" 404
"Error updating tier:" Error object
```

---

## 🔍 Database Verification

### Check Organization Record
```sql
-- PostgreSQL
SELECT 
  id,
  name,
  "maxUsers",
  "currentUserCount",
  "userTierConfig"::text
FROM organizations
WHERE name = 'YOUR_ORG_NAME'
LIMIT 1;
```

### Expected `userTierConfig` JSON Structure:
```json
{
  "basic": {
    "enabled": false,
    "maxUsers": 1
  },
  "premium": {
    "enabled": false,
    "maxUsers": 10
  },
  "advanced": {
    "enabled": true,
    "maxUsers": 100
  },
  "activeTier": "advanced"
}
```

### Verify maxUsers Column:
- Basic enabled: `maxUsers` = 1
- Premium enabled: `maxUsers` = 10
- **Advanced enabled**: `maxUsers` = **100** (NOT 999999 or NULL)

---

## 🐛 Common Issues & Solutions

### Issue 1: Switches Not Visible
**Symptoms**: "Manage User Tiers" section shows but no switches

**Causes**:
- Component not rendering due to missing data
- CSS issue hiding switches

**Solutions**:
1. Check console for errors: `"Failed to load tier allocation"`
2. Verify API endpoint returns data: `GET /api/v1/user-tiers/organization/{orgId}`
3. Check backend is running on port 3003
4. Verify organization exists in database

---

### Issue 2: Switches Not Updating
**Symptoms**: Click switch but it doesn't change position

**Causes**:
- API call failing
- Switch state not updating after response

**Solutions**:
1. Check Network tab for failed PUT request
2. Check console for error: `"Error updating tier:"`
3. Verify user has SUPER_ADMIN role
4. Check backend logs for validation errors

---

### Issue 3: Advanced Shows Unlimited Instead of 100
**Symptoms**: UI shows "Unlimited Users" or ∞ symbol

**Causes**:
- Old component code before fix
- Backend returning `maxUsers: null`

**Solutions**:
1. Verify you have latest component code with "Up to 100 Users" text
2. Check API response includes `"customMaxUsers": 100`
3. Restart frontend dev server
4. Hard refresh browser: Ctrl+Shift+R

---

### Issue 4: maxUsers Shows 999999 Instead of 100
**Symptoms**: Database has `maxUsers: 999999` when Advanced enabled

**Causes**:
- Backend fallback for unlimited (old code)
- `customMaxUsers` not being passed to API

**Solutions**:
1. Check API request body includes: `"customMaxUsers": 100`
2. Verify backend UserTierService handles `customMaxUsers`
3. Check console log: Should show `{tier: "advanced", enabled: true, customMaxUsers: 100}`

---

### Issue 5: Switches Show Wrong State After Reload
**Symptoms**: Enabled tier shows as disabled after page refresh

**Causes**:
- Database not saving correctly
- Component not initializing state from API response

**Solutions**:
1. Check database `userTierConfig` column has correct values
2. Verify API GET endpoint returns correct data
3. Check console log on load shows correct `tierConfig`
4. Clear browser cache and reload

---

## ✅ Test Completion Checklist

Mark each test as you complete it:

- [ ] Test 1: View User Tier Management Section ✓
- [ ] Test 2: Enable Basic Tier ✓
- [ ] Test 3: Enable Premium Tier ✓
- [ ] Test 4: Enable Advanced Tier (100 Users) ✓
- [ ] Test 5: Disable Tiers ✓
- [ ] Test 6: Multiple Organizations ✓
- [ ] Test 7: Error Handling ✓
- [ ] Test 8: Refresh & Persistence ✓
- [ ] Test 9: Switch Visual States ✓
- [ ] Test 10: Console Debugging ✓
- [ ] Database verification shows maxUsers = 100 ✓
- [ ] All three switches visible and functional ✓

---

## 📊 Success Criteria

The User Tier Management feature is **working correctly** when:

✅ **All three tier switches are visible** (Basic, Premium, Advanced)
✅ **Switches initialize correctly** based on current tier configuration
✅ **Advanced tier text shows** "Up to 100 Users" (not "Unlimited")
✅ **Enabling Advanced tier sets maxUsers to 100** in database
✅ **API calls include customMaxUsers: 100** when enabling Advanced
✅ **Switch states update correctly** after API responses
✅ **Active Plan badge updates** when tiers are toggled
✅ **User count shows correct limit** (X / 100 for Advanced)
✅ **Settings persist** across page reloads
✅ **Error handling works** with proper user feedback
✅ **Console logs show** debugging information for troubleshooting

---

## 🎓 Next Steps

After confirming User Tier Management works:

1. **Test with real organizations** in your database
2. **Verify billing logic** connects to tier limits
3. **Test user creation** respects tier limits
4. **Document tier upgrade flow** for end users
5. **Move to next Super Admin feature**: Subscription Plans Management

---

## 📸 Screenshots to Capture

For documentation:
1. ✅ User Tier Management section with all 3 switches visible
2. ✅ Basic tier enabled (maxUsers: 1)
3. ✅ Premium tier enabled (maxUsers: 10)
4. ✅ Advanced tier enabled (maxUsers: 100) - **NOT unlimited**
5. ✅ Console logs showing API calls with customMaxUsers
6. ✅ Database record showing userTierConfig JSON

---

**Happy Testing! 🚀**

If you encounter any issues, check the "Common Issues & Solutions" section above.
