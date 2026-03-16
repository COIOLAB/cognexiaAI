# MFA OTP Verification Debugging Guide

## 🐛 Issue: "Invalid credentials" after entering OTP

The error occurs when trying to verify the SMS OTP code.

---

## 📋 Quick Diagnosis Steps

### Step 1: Check Browser Console

1. Open https://www.cognexiaai.com/admin-access in your browser
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Clear the console
5. Try the SMS OTP flow:
   - Enter super admin credentials
   - Click "SMS/Text Message"
   - Click "Send Code"
   - Enter the OTP you receive
   - Click "Verify & Access"

6. **Look for errors** in the console. You should see messages like:
   ```
   [MFA] Sending OTP to mobile: +918850815294
   [MFA] Verifying mobile OTP...
   [MFA] Mobile: +918850815294
   [MFA] Code entered: 123456
   [MFA] Mobile OTP response: {...}
   ```

7. **Copy any error messages** you see, especially:
   - CORS errors (Access-Control-Allow-Origin)
   - 404 errors (endpoint not found)
   - 400/401/500 errors (bad request/unauthorized/server error)

---

## 🔍 Common Issues & Solutions

### Issue 1: CORS Error

**Error in console:**
```
Access to fetch at 'https://cognexia-crm-backend-production.up.railway.app/api/v1/mfa/verify-otp' 
from origin 'https://www.cognexiaai.com' has been blocked by CORS policy
```

**Solution:**
- CORS_ORIGIN in Railway is not configured correctly
- Run the test script again:
  ```powershell
  cd C:\Users\nshrm\Desktop\CognexiaAI-ERP\frontend
  .\test-cors.ps1
  ```

### Issue 2: MFA Endpoint Not Found (404)

**Error in console:**
```
POST https://cognexia-crm-backend-production.up.railway.app/api/v1/mfa/verify-otp 404 (Not Found)
```

**Solution:**
- The MFA endpoint doesn't exist in the backend
- Check if the backend has MFA routes implemented
- The endpoint should be at: `/api/v1/mfa/verify-otp`

### Issue 3: Invalid OTP Code

**Error in console:**
```
[MFA API] Mobile verification error: Invalid OTP
```

**Solutions:**
1. **Check OTP expiry:** OTPs are valid for 5 minutes
2. **Check OTP format:** Must be exactly 6 digits
3. **Check phone number:** Must match the number OTP was sent to
4. **Twilio configuration:** Check if Twilio credentials are correct in Railway

### Issue 4: OTP Not Being Sent

**Symptom:** Toast shows "OTP sent" but no SMS received

**Solutions:**
1. **Check Twilio credentials** in Railway backend:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

2. **Check Twilio account:**
   - Account has credits
   - Phone number is verified
   - SMS service is enabled

3. **Check devOTP in console:**
   - In development, OTP is shown in console
   - Look for: `[MFA] OTP Code: 123456`

---

## 🧪 Manual API Test

If the browser flow isn't working, test the backend API directly:

### Test 1: Send OTP

```powershell
$body = @{
    phone = "+918850815294"
    method = "sms"
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri "https://cognexia-crm-backend-production.up.railway.app/api/v1/mfa/send-otp" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Origin"="https://www.cognexiaai.com"} `
    -Body $body `
    -UseBasicParsing
```

**Expected Response:** JSON with `success: true` and OTP code

### Test 2: Verify OTP

```powershell
$body = @{
    phone = "+918850815294"
    code = "123456"  # Replace with actual OTP received
    method = "sms"
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri "https://cognexia-crm-backend-production.up.railway.app/api/v1/mfa/verify-otp" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Origin"="https://www.cognexiaai.com"} `
    -Body $body `
    -UseBasicParsing
```

**Expected Response:** JSON with `success: true`

---

## 🔧 Temporary Workaround

If MFA backend is not working, you can temporarily disable OTP verification:

**NOT RECOMMENDED FOR PRODUCTION** - Only for testing!

1. Edit the admin-access page locally
2. Comment out the API verification
3. Always return `isValid = true` for testing

But this defeats the purpose of 2FA security!

---

## ✅ Checklist

- [ ] Opened browser console (F12)
- [ ] Cleared console logs
- [ ] Attempted SMS OTP flow
- [ ] Copied error messages from console
- [ ] Checked Network tab for failed requests
- [ ] Ran CORS test script
- [ ] Tested backend API endpoints directly
- [ ] Verified Twilio credentials in Railway
- [ ] Checked Railway deployment logs

---

## 📞 Next Steps

Once you've checked the browser console and copied the error messages, we can:

1. **If CORS error:** Fix CORS_ORIGIN in Railway (already done, verify it's working)
2. **If 404 error:** Check if MFA endpoints exist in backend
3. **If Twilio error:** Verify Twilio credentials
4. **If validation error:** Check OTP format and expiry

**Please share the exact error message from the browser console!**
