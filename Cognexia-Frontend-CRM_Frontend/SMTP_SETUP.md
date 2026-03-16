# 📧 SMTP Email Setup - Quick Guide

## ✅ Backend Status
- **Server**: Running on port 3003 ✓
- **PID**: 3068
- **SMTP**: Currently in mock mode (logs to console)

---

## 🚀 Option 1: Mailtrap (Recommended for Testing)

**Why Mailtrap?**
- ✅ Free for development
- ✅ No real emails sent (safe)
- ✅ Web interface to view emails
- ✅ No spam issues

### Setup Steps:

1. **Sign up** (free): https://mailtrap.io

2. **Get credentials**:
   - Go to: Email Testing → Inboxes → My Inbox
   - Click "Show Credentials"
   - Copy Username and Password

3. **Update `.env` file**:
   ```env
   SMTP_HOST=sandbox.smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_SECURE=false
   SMTP_USER=<your-mailtrap-username>
   SMTP_PASS=<your-mailtrap-password>
   SMTP_FROM_NAME=CognexiaAI
   SMTP_FROM_EMAIL=superadmin@cognexiaai.com
   ```

4. **Restart backend**:
   ```powershell
   Stop-Process -Id 3068 -Force
   $env:PORT=3003; npm run start:dev
   ```

5. **Test**: Send email OTP and check Mailtrap inbox!

---

## 📨 Option 2: Gmail (Real Emails)

**Steps:**

1. **Create App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Google Account → Security → 2-Step Verification (must be ON)
   - Search for "App passwords"
   - Create new app password for "CognexiaAI"
   - Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

2. **Update `.env` file**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=superadmin@cognexiaai.com
   SMTP_PASS=<your-16-char-app-password>
   SMTP_FROM_NAME=CognexiaAI
   SMTP_FROM_EMAIL=superadmin@cognexiaai.com
   ```

3. **Restart backend**:
   ```powershell
   Stop-Process -Id 3068 -Force
   $env:PORT=3003; npm run start:dev
   ```

4. **Test**: Real emails will be sent to superadmin@cognexiaai.com

---

## 🔧 Current Configuration

Location: `C:\Users\nshrm\Desktop\CognexiaAI-ERP\backend\modules\03-CRM\.env`

Lines 133-151:
```env
# SMTP Email Configuration (MFA Email OTP)
# Option 1: Mailtrap (Free testing - no real emails sent, safe for dev)
# Sign up at https://mailtrap.io and get credentials from Inbox Settings
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your-mailtrap-username  # ← UPDATE THIS
SMTP_PASS=your-mailtrap-password  # ← UPDATE THIS
SMTP_FROM_NAME=CognexiaAI
SMTP_FROM_EMAIL=superadmin@cognexiaai.com

# Option 2: Gmail (Real emails - requires app password)
# Uncomment and configure below if you want real emails:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=superadmin@cognexiaai.com
# SMTP_PASS=your-gmail-app-password-here
# Get app password: https://myaccount.google.com/apppasswords
```

---

## ⚡ Quick Restart Commands

**Kill backend:**
```powershell
Stop-Process -Id 3068 -Force
```

**Check port:**
```powershell
netstat -ano | findstr :3003
```

**Start backend:**
```powershell
cd C:\Users\nshrm\Desktop\CognexiaAI-ERP\backend\modules\03-CRM
$env:PORT=3003; npm run start:dev
```

---

## ✅ Verification

After configuring SMTP and restarting, you should see:
```
[EMAIL] SMTP transporter initialized successfully (sandbox.smtp.mailtrap.io:2525)
```

Instead of:
```
[EMAIL] SMTP not configured. Emails will be logged to console only.
```

---

## 🎯 What Works Right Now

**Without SMTP configured:**
- ✅ SMS OTP (Twilio) - Fully working
- ✅ Google Authenticator - Fully working
- ⚠️ Email OTP - Logs to backend console only

**With SMTP configured:**
- ✅ SMS OTP (Twilio) - Fully working
- ✅ Google Authenticator - Fully working
- ✅ Email OTP - Real emails sent! 🎉

---

## 📞 Need Help?

**Mailtrap not working?**
- Make sure you're using the sandbox credentials (not API tokens)
- Port should be 2525 (not 587)

**Gmail not working?**
- Make sure 2-Step Verification is enabled
- Use App Password (not regular password)
- Remove spaces from app password: `xxxx xxxx xxxx xxxx` → `xxxxxxxxxxxxxxxx`

**Backend not restarting?**
- Check if process is killed: `Get-Process -Name node -ErrorAction SilentlyContinue`
- Force kill: `Stop-Process -Name node -Force`
- Check port: `netstat -ano | findstr :3003`

---

## 🎉 Summary

1. Choose **Mailtrap** (testing) or **Gmail** (production)
2. Update `.env` with credentials
3. Restart backend: `Stop-Process -Id 3068 -Force; $env:PORT=3003; npm run start:dev`
4. Test email OTP at http://localhost:3010/admin-access
5. Enjoy working MFA! 🚀
