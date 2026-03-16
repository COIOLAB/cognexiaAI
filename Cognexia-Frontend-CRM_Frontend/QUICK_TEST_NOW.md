# 🚀 Quick Test - User Tier Management Fixes

## ⚡ Test in 5 Minutes

### Step 1: Open Browser
```
http://localhost:3001/login
```

### Step 2: Login
- Email: `demo@cognexiaai.com`
- Password: `Demo@12345`

### Step 3: Navigate
1. Click **"Organizations"** in left sidebar
2. Click on **any active organization name**
3. Scroll down to **"Manage User Tiers"** section

### Step 4: Verify Switches Are Visible ✅
You should see **3 tier cards** with toggle switches:

```
┌─────────────────────────────────────────┐
│ 👤 Basic                    [Toggle]    │
│ 1 User                                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 👑 Premium                  [Toggle]    │
│ Up to 10 Users                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ∞ Advanced                  [Toggle]    │
│ Up to 100 Users   ← SHOULD SAY THIS!   │
└─────────────────────────────────────────┘
```

**If you DON'T see switches**: Check console for errors

---

### Step 5: Test Advanced Tier (Most Important!)

1. **Open DevTools**: Press `F12`
2. **Go to Console tab**
3. **Click Advanced tier toggle switch** to enable it

**Expected Console Output**:
```
Updating tier: {tier: "advanced", enabled: true, customMaxUsers: 100}
Update result: {success: true, ...}
```

**Expected UI**:
- ✅ Green toast notification: "User tier advanced enabled successfully"
- ✅ Active Plan badge changes to **ADVANCED**
- ✅ Users shows: `X / 100` (NOT ∞ or unlimited)

**Expected API Call** (Check Network tab):
```
PUT http://localhost:3003/api/v1/user-tiers/organization/{id}
Request Body: {
  "tier": "advanced",
  "enabled": true,
  "customMaxUsers": 100  ← THIS IS KEY!
}
```

---

### Step 6: Verify in Database (Optional)

If using PostgreSQL locally:
```sql
SELECT name, "maxUsers", "userTierConfig"::text
FROM organizations
WHERE status = 'active'
LIMIT 1;
```

**Expected Result**:
- `maxUsers`: **100** (not 999999, not null)
- `userTierConfig.advanced.enabled`: true
- `userTierConfig.advanced.maxUsers`: 100

---

## ✅ Success = All of These Pass:

1. ✅ **Switches are visible** (3 toggle switches on page)
2. ✅ **Advanced tier says** "Up to 100 Users" (NOT "Unlimited")
3. ✅ **Console log shows** `customMaxUsers: 100` when enabling
4. ✅ **Active Plan badge updates** to ADVANCED
5. ✅ **User count shows** X / 100 (not ∞)
6. ✅ **Database has** maxUsers = 100

---

## ❌ If Something Failed:

### Switches Not Visible?
```bash
# Check console for errors
# Look for: "Failed to load tier allocation"

# Solution: Restart frontend
cd C:\Users\nshrm\Desktop\CognexiaAI-ERP\frontend\super-admin-portal
npm run dev
```

### Advanced Still Shows "Unlimited"?
```bash
# Hard refresh browser
Press: Ctrl + Shift + R

# Or clear cache and reload
```

### API Call Missing customMaxUsers?
```bash
# Check you saved the latest code
# Verify line 86-88 in user-tier-manager.tsx:
if (tier === UserTier.ADVANCED && enabled) {
  payload.customMaxUsers = 100;
}
```

### Database Shows maxUsers = 999999?
```bash
# Backend needs to handle customMaxUsers
# Check backend logs for errors
# Verify UserTierService.updateUserTier() handles dto.customMaxUsers
```

---

## 🎯 What to Screenshot

Take these 3 screenshots to verify everything works:

1. **Screenshot 1**: User Tier Management section with all 3 switches visible
2. **Screenshot 2**: Console logs showing `customMaxUsers: 100`
3. **Screenshot 3**: Active Plan badge showing "ADVANCED" and Users showing "X / 100"

---

## 📞 Quick Debug Checklist

Open DevTools Console and check:

- [ ] "Loaded tier allocation:" appears on page load
- [ ] "Updating tier:" appears when clicking switch
- [ ] No red error messages in console
- [ ] Network tab shows 200 OK for PUT request
- [ ] Response body includes `allocation.maxAllowedUsers: 100`

---

## 🔄 Restart Everything (If Needed)

If nothing works, restart all services:

### 1. Find Running Processes
```powershell
netstat -ano | findstr ":3001 :3003"
```

### 2. Kill Processes (if needed)
```powershell
# Replace <PID> with actual process ID from above
taskkill /PID <PID> /F
```

### 3. Restart Backend
```powershell
cd C:\Users\nshrm\Desktop\CognexiaAI-ERP\backend\modules\03-CRM
npm run start:dev
```

### 4. Restart Frontend
```powershell
cd C:\Users\nshrm\Desktop\CognexiaAI-ERP\frontend\super-admin-portal
npm run dev
```

### 5. Wait for Servers to Start
- Backend: `http://localhost:3003`
- Frontend: `http://localhost:3001`

### 6. Try Again
Go back to Step 1 above

---

## 📚 Full Documentation

For detailed testing and troubleshooting:
- See: `TESTING_USER_TIER_FIXES.md` (10 comprehensive test cases)
- See: `FIXES_SUMMARY.md` (all changes explained)

---

**Expected Total Time**: ⏱️ 5 minutes

**Status**: Ready to test now! 🚀
