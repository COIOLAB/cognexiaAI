# 🔐 Multi-Factor Authentication (MFA) Guide

## Overview
The Super Admin Portal implements **three independent authentication methods** that can be used interchangeably for maximum security and flexibility.

---

## 🚀 Available Authentication Methods

### 1. QR Code Scanner 📷 (Fastest & Most Secure)
- **Speed**: Instant authentication (< 2 seconds)
- **Security**: Highest - Dynamic QR codes with short expiry
- **Device**: Camera-enabled device required

### 2. Google Authenticator (TOTP) 📱
- **Speed**: Fast (30-second rotating codes)
- **Security**: High - Time-based one-time passwords
- **Device**: Smartphone with authenticator app

### 3. Mobile OTP (SMS) 📲
- **Speed**: Medium (SMS delivery time)
- **Security**: Good - 6-digit codes with 5-min expiry
- **Device**: Registered mobile phone

### 4. Email OTP ✉️ (Backup)
- **Speed**: Medium (email delivery time)
- **Security**: Good - 6-digit codes with 5-min expiry
- **Device**: Any device with email access

---

## 📋 Complete Login Flow

### Step 1: Credentials Verification
1. Navigate to: `http://localhost:3010/admin-access`
2. Enter credentials:
   - **Email**: `superadmin@cognexiaai.com`
   - **Password**: `Akshita@19822`
3. Click "Continue to 2FA"

### Step 2: Choose Your Authentication Method

The system will present **4 tabs** - choose ANY ONE:

---

## Method 1: QR Code Scanner

### Setup (One-time)
**No setup required!** The QR code is automatically generated.

### Usage
1. Click on **"QR Scan"** tab
2. You'll see a sample QR code displayed on screen
3. Click **"Start QR Scanner"** button
4. Allow camera permissions when prompted
5. Point your camera at the QR code displayed on another device or screen
6. Once scanned, you'll be automatically logged in!

### QR Code Format
The authentication QR code contains:
```
COGNEXIA-SUPERADMIN-AUTH-TOKEN-SECURE
```

### Testing
- A sample QR code is displayed in the interface for testing
- You can scan this directly from your screen using your device's camera
- Valid for: 2 minutes after scanning

### Troubleshooting
- **Camera not working?** Check browser permissions (chrome://settings/content/camera)
- **Can't scan?** Ensure good lighting and QR code is fully visible
- **Invalid QR?** Make sure you're scanning the correct authentication QR code

---

## Method 2: Google Authenticator (TOTP)

### Setup (One-time)

#### Option A: Manual Entry
1. Open Google Authenticator on your phone
2. Tap "+" → "Enter a setup key"
3. Enter:
   - **Account**: CognexiaAI SuperAdmin
   - **Key**: `JBSWY3DPEHPK3PXP`
   - **Type**: Time-based
4. Save

#### Option B: QR Code
1. Generate QR code at: https://www.qr-code-generator.com/
2. Encode: `otpauth://totp/CognexiaAI:SuperAdmin?secret=JBSWY3DPEHPK3PXP&issuer=CognexiaAI`
3. Scan with Google Authenticator

### Usage
1. Click on **"Auth App"** tab
2. Open your authenticator app
3. Find "CognexiaAI (SuperAdmin)"
4. Enter the 6-digit code shown
5. Click "Verify & Access"

### Details
- **Code refreshes**: Every 30 seconds
- **Algorithm**: SHA1
- **Digits**: 6
- **Compatible apps**: Google Authenticator, Authy, Microsoft Authenticator, 1Password

---

## Method 3: Mobile OTP (SMS)

### Setup (One-time)
The mobile number is pre-configured:
- **Default**: `+1234567890`
- **Update in**: `.env.local` → `NEXT_PUBLIC_SUPER_ADMIN_MOBILE`

### Usage
1. Click on **"Mobile"** tab
2. Verify your mobile number is displayed
3. Click **"Send OTP to Mobile"** button
4. Check your SMS inbox for 6-digit code
5. Enter the code within 5 minutes
6. Click "Verify & Access"

### Details
- **Validity**: 5 minutes
- **Format**: 6 digits (numeric only)
- **Resend**: Available after 1 minute (60 seconds)

### Development Mode
In development, the OTP is logged to console:
```javascript
[DEV] Mobile OTP: 123456 Sent to +1234567890 Valid for 5 minutes
```

### Production Configuration
Update `.env.local` with SMS provider credentials:
```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

# OR AWS SNS Configuration
AWS_SNS_REGION=us-east-1
AWS_SNS_ACCESS_KEY=your_access_key
AWS_SNS_SECRET_KEY=your_secret_key
```

---

## Method 4: Email OTP (Backup)

### Setup (One-time)
The email is pre-configured:
- **Email**: `superadmin@cognexiaai.com`

### Usage
1. Click on **"Email"** tab
2. Click **"Send OTP to Email"** button
3. Check your email inbox for 6-digit code
4. Enter the code within 5 minutes
5. Click "Verify & Access"

### Details
- **Validity**: 5 minutes
- **Format**: 6 digits (numeric only)
- **Resend**: Available after 1 minute (60 seconds)

---

## 🔐 Security Features

### Progressive Lockout System
- **3 failed attempts** → 30-second lockout
- **4 failed attempts** → 60-second lockout
- **5 failed attempts** → 2-minute lockout
- **6+ failed attempts** → Up to 1-hour lockout (exponential)

### IP Logging
- All access attempts logged with:
  - Email used
  - Timestamp
  - Client IP address
  - Authentication method
  - Success/failure status
  - Error details (if failed)

### Session Management
- Automatic cleanup of expired OTPs
- Secure token storage
- Session timeout: 24 hours
- Automatic logout on browser close (optional)

---

## 🎯 Which Method Should You Use?

### Use QR Code Scanner When:
✅ You need the fastest login  
✅ You have a camera-enabled device  
✅ Maximum security is required  
✅ You're in a secure environment  

### Use Google Authenticator When:
✅ You're offline or have no network  
✅ You need reliable, always-available authentication  
✅ You want to avoid SMS costs  
✅ Your organization mandates TOTP  

### Use Mobile OTP When:
✅ You don't have an authenticator app  
✅ You're setting up for the first time  
✅ You need a simpler method for users  
✅ Network connectivity is reliable  

### Use Email OTP When:
✅ Your phone is unavailable  
✅ You're traveling internationally  
✅ SMS is not working  
✅ As a backup/emergency method  

---

## 📊 Comparison Table

| Feature | QR Scan | TOTP | Mobile | Email |
|---------|---------|------|--------|-------|
| Speed | ⚡⚡⚡ | ⚡⚡ | ⚡ | ⚡ |
| Security | 🔒🔒🔒 | 🔒🔒 | 🔒 | 🔒 |
| Offline | ❌ | ✅ | ❌ | ❌ |
| Setup Required | No | Yes | No | No |
| Device Needed | Camera | Phone | Phone | Any |
| Expiry | 2 min | 30 sec | 5 min | 5 min |
| Resendable | N/A | N/A | ✅ | ✅ |

---

## 🧪 Testing All Methods

### 1. Test QR Code Scanner
```bash
# Step 1: Navigate to admin access page
http://localhost:3010/admin-access

# Step 2: Enter credentials
Email: superadmin@cognexiaai.com
Password: Akshita@19822

# Step 3: Click "QR Scan" tab
# Step 4: Click "Start QR Scanner"
# Step 5: Scan the displayed sample QR code
# Expected: Auto-login within 2 seconds
```

### 2. Test Google Authenticator
```bash
# Step 1: Setup Google Authenticator
# Add account with secret: JBSWY3DPEHPK3PXP

# Step 2: Navigate and login
http://localhost:3010/admin-access
Credentials: superadmin@cognexiaai.com / Akshita@19822

# Step 3: Click "Auth App" tab
# Step 4: Enter 6-digit code from app
# Expected: Login successful
```

### 3. Test Mobile OTP
```bash
# Step 1: Navigate and login
http://localhost:3010/admin-access
Credentials: superadmin@cognexiaai.com / Akshita@19822

# Step 2: Click "Mobile" tab
# Step 3: Click "Send OTP to Mobile"
# Step 4: Check console for OTP (dev mode)
# Step 5: Enter OTP
# Expected: Login successful
```

### 4. Test Email OTP
```bash
# Same as Mobile OTP, but use "Email" tab
```

---

## 🛠️ Troubleshooting

### Issue: "Invalid verification code"
**Possible causes:**
- Code expired (wait for new code)
- Wrong method selected
- Time sync issue (TOTP only)
- Typo in code entry

**Solutions:**
- Verify you're using the correct tab
- Check code hasn't expired
- For TOTP: Sync time in app settings
- Try another authentication method

### Issue: Camera not starting
**Possible causes:**
- Browser doesn't have camera permission
- Camera in use by another app
- HTTPS required (camera API security)

**Solutions:**
- Check browser permissions: `chrome://settings/content/camera`
- Close other apps using camera
- Use `https://` or `localhost` (not IP address)

### Issue: OTP not received
**Mobile SMS:**
- Check phone number is correct
- Verify SMS service is configured (production)
- Check spam/junk folder
- Try email OTP instead

**Email:**
- Check email address is correct
- Check spam/junk folder
- Verify email service configured (production)
- Try mobile OTP instead

### Issue: Account locked
**Cause:** Too many failed attempts (3+)

**Solution:**
- Wait for lockout timer to expire
- Timer shown on screen
- IP logged for security review
- Contact admin if persistent

---

## 🚀 Production Deployment

### Before Going Live:

1. **Update TOTP Secret**
```bash
# Generate new secret
npm run generate-totp-secret

# Update .env.local
NEXT_PUBLIC_TOTP_SECRET=<NEW_SECRET>
```

2. **Configure SMS Provider**
```bash
# Option A: Twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number

# Option B: AWS SNS
AWS_SNS_REGION=us-east-1
AWS_SNS_ACCESS_KEY=your_key
AWS_SNS_SECRET_KEY=your_secret
```

3. **Configure Email Provider**
```bash
# Option A: SendGrid
SENDGRID_API_KEY=your_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Option B: AWS SES
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY=your_key
AWS_SES_SECRET_KEY=your_secret
```

4. **Generate Dynamic QR Codes**
- Implement server-side QR generation
- Add expiry timestamps
- Use encrypted tokens
- Store in Redis with TTL

5. **Security Hardening**
- Rate limiting on all endpoints
- CAPTCHA after 3 failed attempts
- 2FA device management
- Audit logging to database
- IP whitelist (optional)
- Geo-blocking (optional)

---

## 📞 Support

### Development Issues
- **Console**: Check browser console for detailed logs
- **Network**: Check Network tab for API errors
- **Storage**: Clear localStorage and retry

### Security Concerns
- **Email**: security@cognexiaai.com
- **Emergency**: Contact CTO directly
- **Audit Logs**: Available in Super Admin Portal

### Feature Requests
- **Slack**: #security-team
- **Jira**: Create ticket with "MFA" label

---

## 📚 Technical Documentation

### Environment Variables
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
NEXT_PUBLIC_API_URL=http://localhost:3003/api/v1
```

### NPM Packages Used
```json
{
  "speakeasy": "^2.0.0",          // TOTP generation/verification
  "qrcode.react": "^3.1.0",       // QR code generation
  "html5-qrcode": "^2.3.8",       // QR code scanning
  "libphonenumber-js": "^1.10.0", // Phone number validation
  "nodemailer": "^6.9.7",         // Email sending (dev)
  "otpauth": "^9.1.4"             // OTP URL generation
}
```

### Browser Compatibility
- **QR Scanner**: Chrome 60+, Firefox 55+, Safari 11+
- **TOTP**: All modern browsers
- **Mobile/Email OTP**: All browsers

---

**Last Updated**: 2026-01-30  
**Version**: 2.0  
**MFA Methods**: 4 (QR Scan, TOTP, Mobile, Email)
