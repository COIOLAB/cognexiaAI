# Custom Domain Setup Guide for cognexiaai.com

## 📋 Domain Mapping
- **cognexiaai.com** → Auth Portal (Main landing page)
- **admin.cognexiaai.com** → Super Admin Portal
- **app.cognexiaai.com** → Client Admin Portal

---

## STEP 1: Configure Domains in Vercel

### 1.1 Auth Portal (cognexiaai.com)

1. Go to: https://vercel.com/cognexia-ai/cognexia-auth-portal/settings/domains
2. Click "Add Domain"
3. Enter: `cognexiaai.com`
4. Click "Add"
5. Vercel will show DNS records needed - **COPY THESE** (you'll need them for GoDaddy)

**Expected DNS Records:**
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

### 1.2 Super Admin Portal (admin.cognexiaai.com)

1. Go to: https://vercel.com/cognexia-ai/super-admin-portal/settings/domains
2. Click "Add Domain"
3. Enter: `admin.cognexiaai.com`
4. Click "Add"
5. **COPY THE DNS RECORDS** shown

**Expected DNS Record:**
```
Type: CNAME
Name: admin
Value: cname.vercel-dns.com
```

### 1.3 Client Admin Portal (app.cognexiaai.com)

1. Go to: https://vercel.com/cognexia-ai/client-admin-portal/settings/domains
2. Click "Add Domain"
3. Enter: `app.cognexiaai.com`
4. Click "Add"
5. **COPY THE DNS RECORDS** shown

**Expected DNS Record:**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

---

## STEP 2: Configure DNS in GoDaddy

### 2.1 Access GoDaddy DNS Management

1. Login to GoDaddy: https://dcc.godaddy.com/
2. Go to "My Products"
3. Find "cognexiaai.com" and click "DNS"
4. You'll see the DNS Management page

### 2.2 Add DNS Records

**For Main Domain (cognexiaai.com):**

1. Find existing A record with name "@" (if any) and click "Edit" or "Delete"
2. Click "Add" button
3. Select "A" record type
4. Enter:
   - Type: A
   - Name: @
   - Value: 76.76.21.21 (use the IP from Vercel)
   - TTL: 600 seconds (or default)
5. Click "Save"

6. Add CNAME for www:
   - Type: CNAME
   - Name: www
   - Value: cname.vercel-dns.com (use the value from Vercel)
   - TTL: 1 Hour
7. Click "Save"

**For Admin Subdomain:**

1. Click "Add" button
2. Select "CNAME" record type
3. Enter:
   - Type: CNAME
   - Name: admin
   - Value: cname.vercel-dns.com (use the exact value from Vercel)
   - TTL: 1 Hour
4. Click "Save"

**For App Subdomain:**

1. Click "Add" button
2. Select "CNAME" record type
3. Enter:
   - Type: CNAME
   - Name: app
   - Value: cname.vercel-dns.com (use the exact value from Vercel)
   - TTL: 1 Hour
4. Click "Save"

### 2.3 Important Notes

- DNS changes can take 5 minutes to 48 hours to propagate (usually 15-30 minutes)
- Remove any conflicting A or CNAME records for the same names
- If GoDaddy shows a domain parking page, remove that A record

---

## STEP 3: Verify Domain Configuration in Vercel

After adding DNS records in GoDaddy:

1. Go back to each Vercel project's domain settings
2. Vercel will automatically verify the DNS records
3. You should see "Valid Configuration" with a green checkmark
4. If not, click "Refresh" to re-check

---

## STEP 4: Update Backend CORS Settings

### Railway Backend Configuration

1. Go to your Railway project: https://railway.app
2. Find your backend service: `cognexia-crm-backend-production`
3. Go to "Variables" tab
4. Update or add these environment variables:

```bash
CORS_ORIGINS=https://cognexiaai.com,https://www.cognexiaai.com,https://admin.cognexiaai.com,https://app.cognexiaai.com
ALLOWED_ORIGINS=https://cognexiaai.com,https://www.cognexiaai.com,https://admin.cognexiaai.com,https://app.cognexiaai.com
```

5. Redeploy the backend service after updating

---

## STEP 5: Redeploy Frontend Portals

After DNS is configured, I'll redeploy all three portals with the updated environment variables:

```bash
# Auth Portal
cd C:\Users\nshrm\Desktop\CognexiaAI-ERP\frontend\auth-portal
vercel --prod --yes

# Super Admin Portal
cd C:\Users\nshrm\Desktop\CognexiaAI-ERP\frontend\super-admin-portal
vercel --prod --yes

# Client Admin Portal
cd C:\Users\nshrm\Desktop\CognexiaAI-ERP\frontend\client-admin-portal
vercel --prod --yes
```

---

## STEP 6: Test Everything

### Test Main Site
1. Visit: https://cognexiaai.com
2. Should see the landing page
3. Click the subtle dot next to "SOC 2 Type II Certified" in footer
4. Should go to super admin login

### Test Super Admin Login
1. Go to: https://cognexiaai.com/admin-access
2. Enter super admin credentials
3. Complete MFA via SMS
4. Should redirect to: https://admin.cognexiaai.com

### Test Client Portal
1. Visit: https://app.cognexiaai.com
2. Should see client login page

---

## Troubleshooting

### Domain not resolving
- Check DNS propagation: https://dnschecker.org/
- Enter your domain and check if records are visible globally
- Wait 15-30 minutes for propagation

### SSL Certificate Issues
- Vercel automatically provisions SSL certificates
- This can take 5-10 minutes after DNS is verified
- Check in Vercel domain settings for certificate status

### CORS Errors
- Verify backend CORS settings include all custom domains
- Clear browser cache
- Check browser console for specific error messages

### Redirect Issues
- Verify environment variables are updated in all portals
- Ensure all portals are redeployed after environment changes
- Check that auth-portal is using correct super admin portal URL

---

## 📞 Need Help?

If you encounter any issues:
1. Share the specific error message
2. Let me know which step you're on
3. I can help troubleshoot specific issues

---

## ✅ Checklist

- [ ] Added cognexiaai.com to auth-portal in Vercel
- [ ] Added admin.cognexiaai.com to super-admin-portal in Vercel
- [ ] Added app.cognexiaai.com to client-admin-portal in Vercel
- [ ] Added A record for @ in GoDaddy
- [ ] Added CNAME for www in GoDaddy
- [ ] Added CNAME for admin in GoDaddy
- [ ] Added CNAME for app in GoDaddy
- [ ] Verified domains in Vercel (green checkmarks)
- [ ] Updated CORS settings in Railway backend
- [ ] Redeployed all three frontend portals
- [ ] Tested landing page at cognexiaai.com
- [ ] Tested super admin login and MFA flow
- [ ] Tested client portal at app.cognexiaai.com
