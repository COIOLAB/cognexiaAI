# 🔧 MFA Issues & Fixes

## 📋 Current Status

| Feature | Status | Issue |
|---------|--------|-------|
| **SMS OTP** | ⚠️ PARTIAL | SMS received but verification fails |
| **Email OTP** | ❌ BROKEN | EmailNotificationService only logs, doesn't send |
| **Google Auth** | ❌ NOT SETUP | User needs to setup first-time |

---

## 🐛 Issue #1: SMS Verification Failing

### Problem
- SMS is being sent via Twilio ✅
- User receives OTP on phone ✅
- But verification fails ❌

### Root Cause
Twilio Verify API generates its own OTP codes. When we send SMS, Twilio creates and sends a code. When we verify, we need to check against Twilio's code, not a locally generated one.

### Fix Required
The backend `mfa.controller.ts` is storing a locally generated OTP in `otpStore` but Twilio has its own OTP. We need to ONLY use Twilio's verification, not store our own OTP.

**Current Code** (WRONG):
```typescript
// Line 43: Generates local OTP
const otp = crypto.randomInt(100000, 999999).toString();
otpStore.set(key, { code: otp, expiry });

// Line 100-106: Sends via Twilio (Twilio generates its own OTP)
const verification = await client.verify.v2
  .services(verifySid)
  .verifications.create({
    to: phone,
    channel: 'sms',
  });
```

**Fix**:
When using Twilio Verify API, DON'T generate or store local OTP for SMS. Just call Twilio.

---

## 🐛 Issue #2: Email OTP Not Sending

### Problem
`EmailNotificationService.sendEmail()` only logs to console, doesn't actually send emails.

### Root Cause
Line 412-418 of `email-notification.service.ts`:
```typescript
async sendEmail(to: string, subject: string, html: string): Promise<void> {
  this.logger.log(`[EMAIL] Generic email to ${to}`);
  console.log(`\n=== EMAIL: GENERIC ===`);
  // JUST LOGS, DOESN'T SEND!
}
```

### Fix Required
Need to integrate real email service:
- **Option 1**: Use Nodemailer with Gmail/SMTP
- **Option 2**: Use SendGrid API
- **Option 3**: Use AWS SES
- **Option 4**: Use Resend API

**I recommend Nodemailer (easiest for dev)**

---

## 🐛 Issue #3: Google Authenticator Not Setup

### Problem
User hasn't linked Google Authenticator app yet.

### Fix Required
1. Generate QR code on first login
2. User scans QR code with Google Authenticator
3. User enters code to verify setup
4. Save secret to database for future logins

---

## ✅ Solutions

### Fix #1: SMS Verification

Remove local OTP storage for SMS. Only use Twilio Verify API.

**File**: `backend/modules/03-CRM/src/controllers/mfa.controller.ts`

**Change Line 43-52**:
```typescript
// REMOVE THIS for SMS method:
const otp = crypto.randomInt(100000, 999999).toString();
const expiry = Date.now() + 5 * 60 * 1000;
const key = email || phone;
otpStore.set(key, { code: otp, expiry });
```

**Only store OTP for EMAIL, not SMS**

---

### Fix #2: Real Email Sending

**File**: `backend/modules/03-CRM/src/services/email-notification.service.ts`

**Option A - Nodemailer (Gmail)**:

1. Install nodemailer:
```bash
npm install nodemailer
npm install -D @types/nodemailer
```

2. Add to `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

3. Update `sendEmail` method to actually send emails

**Option B - Use my code (will implement for you)**

---

### Fix #3: Google Authenticator Setup

Create a setup flow:
1. First-time login shows QR code
2. User scans with Google Authenticator
3. User verifies by entering code
4. Secret saved to user profile/database

**Will implement this for you**

---

## 🎯 What I'll Do Now

I will:
1. ✅ Fix SMS verification to work with Twilio properly
2. ✅ Add Nodemailer for real email sending
3. ✅ Create Google Authenticator setup flow
4. ✅ Add better error messages
5. ✅ Test all three methods

---

## 📱 Testing After Fixes

### SMS OTP:
1. Send OTP → SMS received
2. Enter code from SMS
3. ✅ Login successful!

### Email OTP:
1. Send OTP → Email received in inbox
2. Enter code from email
3. ✅ Login successful!

### Google Authenticator:
1. First time: Show QR code
2. Scan QR code
3. Enter 6-digit code to verify setup
4. Next time: Just enter code
5. ✅ Login successful!

---

**Ready to implement all fixes?** Let me know and I'll fix all three issues!
