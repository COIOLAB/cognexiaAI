# 🔒 Super Admin Security Documentation

## Overview
This document outlines the enhanced security measures implemented for Super Admin portal access.

---

## 🎯 Access Method

### For Regular Users (Organizations)
- **URL**: `http://localhost:3010` (or auth-portal URL)
- **Route**: `/login`
- **Authentication**: Email + Password
- **Redirect**: Client Admin Portal (`http://localhost:3002`)

### For Super Admins (CognexiaAI Team)
- **URL**: `http://localhost:3010` (or auth-portal URL)
- **Route**: `/admin-access` (accessed via subtle footer link)
- **Authentication**: Email + Password + 6-Digit Security Code
- **Email Domain**: Must be `@cognexiaai.com`
- **Redirect**: Super Admin Portal (`http://localhost:3001`)

---

## 🛡️ Security Features Implemented

### 1. **Obscurity Layer**
- Access link hidden as a small dot (•) in footer
- Not discoverable through normal navigation
- Tooltip shows "Authorized Personnel Only"

### 2. **Multi-Factor Authentication**
- **Factor 1**: Email (@cognexiaai.com domain required)
- **Factor 2**: Password (minimum 12 characters)
- **Factor 3**: 6-digit security code (configurable)

### 3. **Progressive Lockout System**
```
Attempt 1: Warning displayed
Attempt 2: Warning displayed  
Attempt 3: 30 second lockout
Attempt 4: 60 second lockout (2^1 * 30)
Attempt 5: 120 second lockout (2^2 * 30)
Attempt 6+: Continues exponentially up to 1 hour max
```

### 4. **IP Address Logging**
- Client IP detected and displayed
- All access attempts logged to console
- In production: Should be sent to backend for SIEM integration

### 5. **Visual Security Indicators**
- Red/orange color scheme (warning colors)
- Shield icon with pulse animation
- "Restricted Access" branding
- Failed attempt counter
- Lockout timer

### 6. **Frontend Validation**
- Email domain validation (@cognexiaai.com)
- Password length validation (12+ characters)
- Security code format validation (6 digits)
- User type verification (SUPER_ADMIN only)

---

## 🔑 Configuration

### Environment Variables (`.env.local`)
```bash
# Super Admin Security Code
NEXT_PUBLIC_ADMIN_SECURITY_CODE=123456
```

**⚠️ IMPORTANT**: Change this to a secure 6-digit code in production!

### Recommended Production Security Code
- Use a random 6-digit number
- Rotate monthly
- Store securely (e.g., AWS Secrets Manager)
- Never commit to version control

---

## 🚀 Usage Instructions

### For Super Admins:

1. **Access the Portal**:
   - Go to auth portal homepage
   - Scroll to bottom footer
   - Click the small dot (•) next to copyright text

2. **Enter Credentials**:
   - **Email**: `superadmin@cognexiaai.com` (or your @cognexiaai.com email)
   - **Password**: Your super admin password (12+ chars)
   - **Security Code**: `123456` (default - change in production)

3. **Access Granted**:
   - Upon success, automatically redirected to Super Admin Portal
   - Session stored in localStorage
   - Access logged with timestamp and IP

### Security Code Distribution:
- Share via secure channels only (encrypted email, password manager, etc.)
- Never share in plain text messages or public channels
- Rotate after any suspected compromise
- Use different codes for different environments (dev/staging/prod)

---

## 📊 Monitoring & Audit

### Logged Events:
1. **Successful Access**:
   ```javascript
   {
     email: "admin@cognexiaai.com",
     timestamp: "2026-01-30T02:00:00.000Z",
     ip: "192.168.1.100",
     event: "SUCCESS"
   }
   ```

2. **Failed Attempts**:
   ```javascript
   {
     email: "admin@cognexiaai.com",
     attempt: 2,
     timestamp: "2026-01-30T02:00:00.000Z",
     ip: "192.168.1.100",
     error: "Invalid security code",
     event: "FAILED"
   }
   ```

### Production Integration:
- Forward logs to backend API endpoint
- Backend stores in database with retention policy
- SIEM integration for real-time alerts
- Slack/email notifications on suspicious activity

---

## 🔐 Backend Security (Recommended Enhancements)

### 1. IP Whitelist (Optional)
Add to backend auth service:
```typescript
const ALLOWED_IPS = process.env.SUPER_ADMIN_ALLOWED_IPS?.split(',') || [];

if (userType === 'SUPER_ADMIN' && ALLOWED_IPS.length > 0) {
  if (!ALLOWED_IPS.includes(clientIP)) {
    throw new UnauthorizedException('IP not whitelisted');
  }
}
```

### 2. Hardware Token Support (Future)
- YubiKey integration
- TOTP (Google Authenticator)
- WebAuthn/FIDO2

### 3. Session Management
- Short-lived access tokens (15 minutes)
- Mandatory re-authentication for critical actions
- Automatic logout on inactivity

---

## ⚠️ Security Warnings

### DO:
✅ Use strong, unique security codes  
✅ Rotate codes regularly  
✅ Monitor access logs  
✅ Use HTTPS in production  
✅ Enable IP whitelisting if possible  
✅ Implement proper backend validation  
✅ Store codes in secure vault (AWS Secrets Manager, etc.)

### DON'T:
❌ Commit security codes to version control  
❌ Share codes via unsecured channels  
❌ Use simple/predictable codes (000000, 123456)  
❌ Disable lockout mechanism  
❌ Ignore failed access attempt logs  
❌ Skip backend validation (always validate server-side)

---

## 🧪 Testing

### Test Scenarios:

1. **Valid Super Admin Login**:
   - Email: `superadmin@cognexiaai.com`
   - Password: Your password
   - Code: `123456`
   - **Expected**: Success, redirect to Super Admin Portal

2. **Invalid Email Domain**:
   - Email: `admin@gmail.com`
   - **Expected**: "Super Admin access requires CognexiaAI domain"

3. **Wrong Security Code**:
   - Correct email/password, wrong code
   - **Expected**: "Invalid security code", attempt counter increments

4. **Lockout Test**:
   - 3 failed attempts
   - **Expected**: 30 second lockout, timer displayed

5. **Non-Super-Admin User**:
   - Org admin credentials with correct code
   - **Expected**: "Unauthorized: Insufficient permissions"

---

## 📱 Production Deployment Checklist

- [ ] Change `NEXT_PUBLIC_ADMIN_SECURITY_CODE` to secure random value
- [ ] Store security code in secure vault
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure backend IP whitelist (optional)
- [ ] Set up log forwarding to SIEM
- [ ] Configure alerting for failed attempts
- [ ] Test all security scenarios
- [ ] Document code distribution process
- [ ] Set up code rotation schedule
- [ ] Enable rate limiting at infrastructure level

---

## 🆘 Emergency Access

In case of lockout or forgotten code:

1. **Reset Lockout**:
   - Clear browser localStorage
   - OR wait for lockout timer to expire

2. **Reset Security Code**:
   - Update `.env.local` file
   - Restart frontend application
   - Distribute new code to authorized personnel

3. **Bypass (Emergency Only)**:
   - Set `NEXT_PUBLIC_ADMIN_SECURITY_CODE=000000`
   - This should ONLY be done in development/emergency
   - Immediately rotate after use

---

## 📞 Support

For security concerns or issues:
- **Email**: security@cognexiaai.com
- **Slack**: #security-team
- **Emergency**: Contact CTO directly

---

**Last Updated**: 2026-01-30  
**Version**: 1.0  
**Author**: CognexiaAI Security Team
