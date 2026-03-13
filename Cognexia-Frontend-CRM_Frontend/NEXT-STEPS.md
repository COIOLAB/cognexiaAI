# 🚀 Next Steps - Quick Command Reference

## ✅ What We Just Did

1. ✅ Created database seeding script
2. ✅ Seeded 5 subscription plans
3. ✅ Fixed registration DTO format
4. ✅ Created fixed test scripts
5. ✅ **Bypassed email verification for development**

## 🔄 Restart the Server

The email verification bypass requires a server restart.

### Step 1: Stop Current Server
In the terminal running `npm run start:dev`, press `Ctrl+C`

### Step 2: Restart Server
```powershell
cd backend\modules\03-CRM
npm run start:dev
```

Wait for the message: `Application is running on: http://localhost:3003`

## 🧪 Re-Run Tests

Once the server is restarted, run the fixed test script:

```powershell
.\test-all-endpoints-fixed.ps1
```

**Expected Result:** Success rate should jump from 50% to 70%+ ! 🎉

## 📊 What to Expect

### Before (Current State):
- Success Rate: 50% (18/36)
- Blocker: Email verification

### After Server Restart:
- Expected Success Rate: **70-80%**
- Authentication will work ✅
- More authenticated endpoints will pass ✅

### Remaining Issues:
- Some 500 errors (will need individual investigation)
- These are likely:
  - Missing required fields in DTOs
  - Database relationship issues
  - Service dependencies

## 🔍 If Tests Still Fail

### 1. Check Server Logs
Look at the terminal where `npm run start:dev` is running. You'll see detailed error messages.

### 2. Test Authentication Manually
```powershell
# Test Registration
$body = '{"email":"newuser@test.com","password":"Test123!","firstName":"Test","lastName":"User","companyName":"Test Co"}';
Invoke-RestMethod -Uri "http://localhost:3003/api/v1/auth/register" -Method Post -Body $body -ContentType "application/json"

# Test Login (should work now!)
$loginBody = '{"email":"newuser@test.com","password":"Test123!"}';
$response = Invoke-RestMethod -Uri "http://localhost:3003/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $response.accessToken
Write-Host "Token: $token"

# Test authenticated endpoint
$headers = @{Authorization="Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:3003/api/v1/auth/me" -Method Get -Headers $headers
```

## 🐛 Debugging Individual 500 Errors

For each failing endpoint, check:

### 1. Server Console
You'll see the exact error stack trace

### 2. Required Fields
Some endpoints may need additional fields. Check the service/controller for required DTOs.

### 3. Database State
Some POST endpoints might need existing records (e.g., creating a contract needs a customer)

## 📋 Investigation Checklist

For each 500 error:
- [ ] Check server logs for stack trace
- [ ] Verify all required fields are provided
- [ ] Check if foreign key relationships exist
- [ ] Verify DTO validation rules
- [ ] Test with simpler data first

## 🎯 Priority Order for Fixing Remaining Errors

1. **Authentication** - Fix first (should be done now!)
2. **Contracts** - Common module, fix DTO validation
3. **Catalogs** - Similar to contracts
4. **LLM** - May need API keys configured
5. **Quantum/Holographic** - Advanced features, fix DTOs
6. **Real-Time** - WebSocket-related, may need setup

## 💡 Common Fixes

### 1. Missing organizationId
Many endpoints auto-inject organizationId from JWT token. Make sure:
- User is authenticated
- Token contains organizationId
- Services use `@OrganizationId()` decorator

### 2. DTO Validation Errors
Check the actual DTO files in `src/dto/*.dto.ts` for required fields.

### 3. Missing Relations
Some entities have required relations (e.g., contracts need customers). Create parent entities first.

## 📞 Quick Reference Commands

```powershell
# Navigate to CRM module
cd C:\Users\nshrm\Desktop\CognexiaAI-ERP\backend\modules\03-CRM

# Restart server
npm run start:dev

# Run tests (from root)
cd C:\Users\nshrm\Desktop\CognexiaAI-ERP
.\test-all-endpoints-fixed.ps1

# View test results
Import-Csv .\api-test-results-fixed.csv | Format-Table

# Filter only failures
Import-Csv .\api-test-results-fixed.csv | Where-Object {$_.Status -eq "FAILED"} | Format-Table
```

## 🎉 Success Indicators

After restart, you should see:
- ✅ Registration: SUCCESS
- ✅ Login: SUCCESS (no more email verification error!)
- ✅ Get Current User: SUCCESS
- ✅ Many more authenticated endpoints: SUCCESS

---

**Ready to go! Restart the server and run the tests! 🚀**
