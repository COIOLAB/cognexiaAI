# 🚀 Quick Start - Multi-Factor Authentication

## 🎯 Overview
You now have **4 independent authentication methods** for Super Admin access:
1. **QR Code Scanner** 📷 - Scan & login instantly
2. **Google Authenticator** 📱 - TOTP codes (30-second rotation)
3. **Mobile OTP** 📲 - SMS verification codes
4. **Email OTP** ✉️ - Email verification codes

---

## ⚡ Quick Test (5 Minutes)

### Step 1: Start the Auth Portal
```bash
cd C:\Users\nshrm\Desktop\CognexiaAI-ERP\frontend\auth-portal
npm run dev
```
✅ Portal runs on: `http://localhost:3010`

### Step 2: Access Super Admin Login
1. Open browser: `http://localhost:3010`
2. Scroll to footer, click the small dot (**•**)
3. Or go directly: `http://localhost:3010/admin-access`

### Step 3: Enter Credentials
- **Email**: `superadmin@cognexiaai.com`
- **Password**: `Akshita@19822`
- Click **"Continue to 2FA"**

### Step 4: Choose Your Method

You'll see **4 tabs**. Choose ANY one:

#### Option 1: QR Scan (Fastest) ⚡
1. Click **"QR Scan"** tab
2. Click **"Start QR Scanner"**
3. Allow camera permissions
4. Scan the displayed sample QR code with your phone
5. ✅ Auto-login!

#### Option 2: Auth App 📱
1. Click **"Auth App"** tab
2. If not setup, add to Google Authenticator:
   - Secret: `JBSWY3DPEHPK3PXP`
3. Enter 6-digit code from app
4. Click **"Verify & Access"**

#### Option 3: Mobile OTP 📲
1. Click **"Mobile"** tab
2. Click **"Send OTP to Mobile"**
3. Check console for OTP: `[DEV] Mobile OTP: 123456`
4. Enter the 6-digit code
5. Click **"Verify & Access"**

#### Option 4: Email OTP ✉️
1. Click **"Email"** tab
2. Click **"Send OTP to Email"**
3. Check console for OTP: `[DEV] Email OTP: 123456`
4. Enter the 6-digit code
5. Click **"Verify & Access"**

---

## 📱 Setup Google Authenticator (One-Time)

### Method 1: Manual Entry (Easiest)
1. Open **Google Authenticator** app
2. Tap **"+"** → **"Enter a setup key"**
3. Enter:
   - Account: `CognexiaAI SuperAdmin`
   - Key: `JBSWY3DPEHPK3PXP`
   - Type: `Time-based`
4. Save ✅

### Method 2: QR Code
1. Generate QR at: https://www.qr-code-generator.com/
2. Paste this text:
   ```
   otpauth://totp/CognexiaAI:SuperAdmin?secret=JBSWY3DPEHPK3PXP&issuer=CognexiaAI
   ```
3. Scan with Google Authenticator ✅

---

## 🔐 Features Implemented

### ✅ All Three Methods Working
- [x] QR Code Scanner with live camera feed
- [x] Google Authenticator (TOTP) support
- [x] Mobile OTP (SMS) with 5-minute expiry
- [x] Email OTP (backup) with 5-minute expiry

### ✅ Security Features
- [x] Two-step authentication (credentials → 2FA)
- [x] Progressive lockout (3 fails → 30s lockout)
- [x] IP address logging for all attempts
- [x] Session management & cleanup
- [x] Failed attempt counter
- [x] Lockout timer with countdown

### ✅ User Experience
- [x] 4 tabs for easy method switching
- [x] Visual QR code display for testing
- [x] Real-time camera preview
- [x] OTP timer countdown
- [x] Resend OTP functionality
- [x] "Back to Login" button
- [x] Loading states & error messages

---

## 📊 Method Comparison

| Method | Speed | Security | Setup | Device |
|--------|-------|----------|-------|--------|
| QR Scan | ⚡⚡⚡ | 🔒🔒🔒 | None | Camera |
| Auth App | ⚡⚡ | 🔒🔒 | Once | Phone |
| Mobile | ⚡ | 🔒 | None | Phone |
| Email | ⚡ | 🔒 | None | Any |

---

## 🧪 Testing Checklist

### ✅ QR Code Scanner
- [ ] Camera starts successfully
- [ ] QR code displayed on screen
- [ ] Can scan QR code
- [ ] Auto-login after scan
- [ ] Can close scanner

### ✅ Google Authenticator
- [ ] Can setup authenticator app
- [ ] 6-digit codes rotate every 30 seconds
- [ ] Codes verify successfully
- [ ] Login successful

### ✅ Mobile OTP
- [ ] Can send OTP
- [ ] OTP logged to console (dev mode)
- [ ] OTP verifies correctly
- [ ] Timer counts down
- [ ] Can resend OTP
- [ ] Login successful

### ✅ Email OTP
- [ ] Can send OTP
- [ ] OTP logged to console (dev mode)
- [ ] OTP verifies correctly
- [ ] Timer counts down
- [ ] Can resend OTP
- [ ] Login successful

### ✅ Security
- [ ] Failed attempts tracked
- [ ] Lockout after 3 fails
- [ ] Timer displays correctly
- [ ] IP address logged
- [ ] Can't bypass lockout

---

## 🔧 Configuration Files

### Environment Variables
📁 `frontend/auth-portal/.env.local`
```bash
# Super Admin Credentials
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=superadmin@cognexiaai.com
NEXT_PUBLIC_SUPER_ADMIN_PASSWORD=Akshita@19822
NEXT_PUBLIC_SUPER_ADMIN_MOBILE=+1234567890

# MFA Configuration
NEXT_PUBLIC_ENABLE_TOTP=true
NEXT_PUBLIC_ENABLE_EMAIL_OTP=true
NEXT_PUBLIC_ENABLE_MOBILE_OTP=true
NEXT_PUBLIC_ENABLE_QR_SCAN=true
NEXT_PUBLIC_TOTP_SECRET=JBSWY3DPEHPK3PXP

# Portal URLs
NEXT_PUBLIC_SUPER_ADMIN_PORTAL_URL=http://localhost:3001
```

### Main Files
- 📄 `app/admin-access/page.tsx` - Main MFA page (600+ lines)
- 📄 `.env.local` - Configuration
- 📄 `MULTI_FACTOR_AUTHENTICATION.md` - Full documentation
- 📄 `GOOGLE_AUTHENTICATOR_SETUP.md` - Authenticator guide
- 📄 `SUPER_ADMIN_SECURITY.md` - Security details

---

## 🐛 Troubleshooting

### Issue: Camera won't start
**Fix:** Check browser permissions at `chrome://settings/content/camera`

### Issue: "Invalid verification code"
**Fix:** 
- Ensure phone time is set to automatic (for TOTP)
- Verify code hasn't expired
- Try another method

### Issue: OTP not received (production)
**Fix:**
- Configure SMS provider (Twilio/AWS SNS)
- Configure email provider (SendGrid/AWS SES)
- Check spam folder

### Issue: Account locked
**Fix:** Wait for lockout timer to expire (shown on screen)

---

## 📚 Documentation

### Full Guides
1. **MULTI_FACTOR_AUTHENTICATION.md** (455 lines)
   - Complete guide for all 4 methods
   - Security features explained
   - Production deployment steps
   - Troubleshooting section

2. **GOOGLE_AUTHENTICATOR_SETUP.md** (261 lines)
   - Setup instructions
   - QR code generation
   - Recovery options
   - Security best practices

3. **SUPER_ADMIN_SECURITY.md** (266 lines)
   - Security architecture
   - Authentication flow
   - Lockout mechanism
   - Production checklist

4. **QUICK_START_MFA.md** (This file)
   - Quick testing guide
   - 5-minute setup
   - Essential commands

---

## 🎉 Success Criteria

You're ready when:
- ✅ All 4 authentication methods work
- ✅ Can login using any method
- ✅ Redirects to Super Admin Portal (port 3001)
- ✅ Security features active (lockout, logging)
- ✅ Mobile number configured
- ✅ Google Authenticator setup

---

## 🚀 Next Steps

### For Testing
1. Test all 4 authentication methods
2. Verify lockout mechanism
3. Test on mobile device
4. Check console logs

### For Production
1. Update TOTP secret (generate new one)
2. Configure SMS provider (Twilio/AWS SNS)
3. Configure email provider (SendGrid/AWS SES)
4. Implement dynamic QR code generation
5. Setup rate limiting
6. Enable audit logging to database

---

## 📞 Support

### Development
- Check browser console for logs
- Look for `[DEV]` tags in console
- All OTPs logged in development mode

### Issues
- See `MULTI_FACTOR_AUTHENTICATION.md` for detailed troubleshooting
- Check Network tab for API errors
- Clear localStorage if needed

---

**Version**: 2.0  
**Last Updated**: 2026-01-30  
**Status**: ✅ Ready for Testing  
**Methods Available**: 4 (QR Scan, TOTP, Mobile, Email)
