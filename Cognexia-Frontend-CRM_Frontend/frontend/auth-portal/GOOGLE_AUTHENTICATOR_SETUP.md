# 🔐 Google Authenticator Setup Guide

## Overview
This guide explains how to set up Google Authenticator or any TOTP-based authenticator app for Super Admin access.

---

## 📱 Supported Authenticator Apps

- **Google Authenticator** (iOS/Android)
- **Microsoft Authenticator** (iOS/Android)
- **Authy** (iOS/Android/Desktop)
- **1Password** (with TOTP support)
- **LastPass Authenticator**
- Any TOTP-compliant app

---

## 🚀 Setup Instructions

### Method 1: Scan QR Code

1. **Open your authenticator app** (Google Authenticator, Authy, etc.)
2. **Tap** "+" or "Add Account"
3. **Select** "Scan QR Code"
4. **Scan** the QR code below:

```
█████████████████████████████████████
█████████████████████████████████████
████ ▄▄▄▄▄ █▀█ █▄▀▄▀ ▄█ █ ▄▄▄▄▄ ████
████ █   █ █▀▀▀█ ▀█▄█ ▀ █ █   █ ████
████ █▄▄▄█ █▀ █▀▀▀██ ▄███ █▄▄▄█ ████
████▄▄▄▄▄▄▄█▄▀ ▀▄█ ▀▄█ ▀▄█▄▄▄▄▄▄████
████ ▀█▄▀ ▄  ▄▀▀▄▀  █▀█▄▄█▄ █ ▀▄████
████▀▄ █▀▄▄▀█ ▀▄█▄ ▀█▀▀▄ ▄▀▀  ▀▀████
████ █▄ █▄▄ ▄▀██▀▀█ ▄█  ▀█▄▀ ▄ ▀████
████▄█▄▄▀▄▄█▀▄  █▀█▀▀█▀█▀▄▄▄█▄█▄████
████ ▄▄▄▄▄ █▄▀ ▄ █▀  ▄ ▀ ▄▄▄ ▀ ▀████
████ █   █ █   ██▄█▄█▀▀▀▀█▄█  ▄ ████
████ █▄▄▄█ █ █ ▄▀█ ▀█ ▄  ▄▄  ██▄████
████▄▄▄▄▄▄▄█▄▄██▄▄█▄▄███▄▄█▄▄██▄████
█████████████████████████████████████
█████████████████████████████████████
```

**Or visit this link to generate QR code:**
https://www.qr-code-generator.com/

**Data to encode:**
```
otpauth://totp/CognexiaAI:SuperAdmin?secret=JBSWY3DPEHPK3PXP&issuer=CognexiaAI
```

5. **Account is added!** You'll see "CognexiaAI (SuperAdmin)" in your app

---

### Method 2: Manual Entry

If you can't scan the QR code:

1. **Open your authenticator app**
2. **Tap** "+" or "Add Account"
3. **Select** "Enter a setup key" or "Manual entry"
4. **Enter the following details:**

   - **Account name**: CognexiaAI SuperAdmin
   - **Your email**: superadmin@cognexiaai.com
   - **Key/Secret**: `JBSWY3DPEHPK3PXP`
   - **Type**: Time-based (TOTP)
   - **Algorithm**: SHA1
   - **Digits**: 6
   - **Period**: 30 seconds

5. **Save** and the account will appear in your app

---

## 🔑 Super Admin Login Credentials

### Step 1: Email & Password
- **Email**: `superadmin@cognexiaai.com`
- **Password**: `Akshita@19822`

### Step 2: Two-Factor Authentication

Choose one option:

#### Option A: Authenticator App (Recommended)
1. Open your authenticator app
2. Find "CognexiaAI (SuperAdmin)"
3. Enter the 6-digit code shown
4. Code refreshes every 30 seconds

#### Option B: Email OTP (Fallback)
1. Click "Send OTP to Email"
2. Check your email for the 6-digit code
3. Enter the code within 5 minutes
4. For development: Code is shown in browser console

---

## 🧪 Testing Your Setup

### Test Authenticator:
1. Go to: `http://localhost:3010/admin-access`
2. Enter email: `superadmin@cognexiaai.com`
3. Enter password: `Akshita@19822`
4. Click "Continue to 2FA"
5. Select "Authenticator" tab
6. Enter the 6-digit code from your app
7. Click "Verify & Access"

### Test Email OTP:
1. Go to: `http://localhost:3010/admin-access`
2. Enter email: `superadmin@cognexiaai.com`
3. Enter password: `Akshita@19822`
4. Click "Continue to 2FA"
5. Select "Email OTP" tab
6. Click "Send OTP to Email"
7. Check console for OTP (in dev mode)
8. Enter the 6-digit OTP
9. Click "Verify & Access"

---

## 🔄 Backup & Recovery

### Backup Your Secret
Save this secret securely in case you lose your phone:

```
JBSWY3DPEHPK3PXP
```

You can use this to re-add the account to a new device.

### Recovery Options
1. **Use Email OTP** if authenticator is unavailable
2. **Re-add account** using the secret above
3. **Emergency**: Contact system administrator to generate new secret

---

## 🛠️ Troubleshooting

### Issue: "Invalid verification code"
**Solutions:**
- Ensure your phone's time is set to automatic
- Wait for the code to refresh and try again
- Check if you entered all 6 digits correctly
- Verify you're using the correct account (CognexiaAI)

### Issue: "OTP expired"
**Solutions:**
- Email OTPs are valid for 5 minutes only
- Click "Resend OTP" to get a new code
- Use authenticator app instead (doesn't expire)

### Issue: Code doesn't work
**Solutions:**
- Try syncing time in authenticator app settings
- Make sure system time is correct (TOTP is time-based)
- Re-add the account using the secret key

### Issue: Can't scan QR code
**Solutions:**
- Use manual entry method instead
- Ensure QR code is fully visible on screen
- Try increasing screen brightness
- Use a different device to scan

---

## 🔐 Security Best Practices

### DO:
✅ Keep your authenticator app backed up  
✅ Use biometric lock on your phone  
✅ Store secret key in password manager  
✅ Enable screen lock on devices  
✅ Use authenticator over email when possible  

### DON'T:
❌ Share your authenticator device  
❌ Screenshot authentication codes  
❌ Store secret key in plain text files  
❌ Disable time sync on your device  
❌ Use authenticator on rooted/jailbroken devices  

---

## 📋 Technical Details

### TOTP Configuration
```
Algorithm: SHA1
Digits: 6
Period: 30 seconds
Secret: JBSWY3DPEHPK3PXP (Base32 encoded)
```

### OTP URI Format
```
otpauth://totp/CognexiaAI:SuperAdmin?secret=JBSWY3DPEHPK3PXP&issuer=CognexiaAI
```

### Compatible with RFC 6238
The implementation follows the Time-Based One-Time Password (TOTP) standard defined in RFC 6238.

---

## 🚀 Production Deployment

### Before Going to Production:

1. **Generate New Secret**:
   ```javascript
   const speakeasy = require('speakeasy');
   const secret = speakeasy.generateSecret({
     name: 'CognexiaAI:SuperAdmin',
     issuer: 'CognexiaAI'
   });
   console.log('Secret:', secret.base32);
   console.log('QR Code URL:', secret.otpauth_url);
   ```

2. **Update Environment Variable**:
   ```bash
   NEXT_PUBLIC_TOTP_SECRET=<NEW_SECRET>
   ```

3. **Generate QR Code**:
   - Use the new otpauth URL
   - Share securely with authorized personnel only

4. **Test Thoroughly**:
   - Verify new secret works
   - Test on multiple devices
   - Confirm backup process

5. **Document**:
   - Update this guide with new secret (secured location only)
   - Provide setup instructions to team
   - Store backup codes securely

---

## 📞 Support

For issues or questions:
- **Email**: security@cognexiaai.com
- **Slack**: #security-team
- **Emergency**: Contact CTO directly

---

**Last Updated**: 2026-01-30  
**Version**: 1.0  
**Secret Version**: DEV-001 (Change in production!)
