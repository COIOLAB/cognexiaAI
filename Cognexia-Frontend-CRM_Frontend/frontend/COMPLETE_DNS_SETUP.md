# Complete DNS Setup for CognexiaAI Custom Domains

## ✅ Current Status
- **www.cognexiaai.com** - ✅ Working (showing correct landing page)
- **cognexiaai.com** - ✅ Working (showing correct landing page)
- **admin.cognexiaai.com** - ⏳ Needs DNS configuration
- **app.cognexiaai.com** - ⏳ Needs DNS configuration

---

## 📋 Step-by-Step: Add Subdomains in Vercel

### Step 1: Add admin.cognexiaai.com

1. Open: https://vercel.com/cognexia-ai/super-admin-portal/settings/domains
2. Click **"Add Domain"**
3. Enter: `admin.cognexiaai.com`
4. Click **"Add"**
5. Vercel will show you a DNS record like:
   ```
   Type: CNAME
   Name: admin
   Value: cname.vercel-dns.com
   ```
6. **COPY THIS VALUE** (you'll need it for GoDaddy)

### Step 2: Add app.cognexiaai.com

1. Open: https://vercel.com/cognexia-ai/client-admin-portal/settings/domains
2. Click **"Add Domain"**
3. Enter: `app.cognexiaai.com`
4. Click **"Add"**
5. Vercel will show you a DNS record like:
   ```
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com
   ```
6. **COPY THIS VALUE** (you'll need it for GoDaddy)

---

## 📋 Step-by-Step: Configure DNS in GoDaddy

### Access GoDaddy DNS

1. Go to: https://dcc.godaddy.com/
2. Click **"My Products"**
3. Find **cognexiaai.com** in your domains
4. Click **"DNS"** button (or three dots → Manage DNS)

### Add CNAME Records

#### For Super Admin (admin subdomain):

1. Click **"Add"** button in DNS records section
2. Select **"CNAME"** from Type dropdown
3. Fill in:
   - **Type**: CNAME
   - **Name**: `admin`
   - **Value**: `cname.vercel-dns.com` (use the EXACT value Vercel showed you)
   - **TTL**: 1 Hour (or 3600 seconds)
4. Click **"Save"**

#### For Client Portal (app subdomain):

1. Click **"Add"** button again
2. Select **"CNAME"** from Type dropdown
3. Fill in:
   - **Type**: CNAME
   - **Name**: `app`
   - **Value**: `cname.vercel-dns.com` (use the EXACT value Vercel showed you)
   - **TTL**: 1 Hour (or 3600 seconds)
4. Click **"Save"**

---

## 🔍 Verify Configuration

### Check in Vercel (5-10 minutes after adding DNS):

1. Go back to each project's domain settings
2. You should see **"Valid Configuration"** with green checkmark
3. If not, click **"Refresh"** button to re-check DNS

### Check DNS Propagation:

You can verify DNS is working by running these commands:

```powershell
# Check main domain
nslookup www.cognexiaai.com

# Check admin subdomain
nslookup admin.cognexiaai.com

# Check app subdomain
nslookup app.cognexiaai.com
```

All should resolve to Vercel's servers (IP addresses or CNAME).

---

## 📝 Final DNS Records Summary

After completing all steps, your GoDaddy DNS should have these records:

```
┌────────┬────────┬──────────────────────────┐
│ Type   │ Name   │ Value                    │
├────────┼────────┼──────────────────────────┤
│ A      │ @      │ 76.76.21.21              │
│ CNAME  │ www    │ cname.vercel-dns.com     │
│ CNAME  │ admin  │ cname.vercel-dns.com     │
│ CNAME  │ app    │ cname.vercel-dns.com     │
└────────┴────────┴──────────────────────────┘
```

**Note**: The exact CNAME value might be slightly different - always use what Vercel shows you!

---

## 🎯 What Each Domain Does

- **www.cognexiaai.com** → Main landing page (Auth Portal)
- **cognexiaai.com** → Redirects to www (or same landing page)
- **admin.cognexiaai.com** → Super Admin Dashboard
- **app.cognexiaai.com** → Client Admin Portal (CRM)

---

## 🧪 Testing After Setup

### Wait Time
- DNS changes take 5-30 minutes to propagate
- SSL certificates take 5-10 minutes to provision

### Test Each Domain

1. **Test Main Site**:
   ```
   https://www.cognexiaai.com
   https://cognexiaai.com
   ```
   Should show: Landing page with "Cognition Meets Precision"

2. **Test Super Admin Portal**:
   ```
   https://admin.cognexiaai.com
   ```
   Should show: Super admin login page

3. **Test Client Portal**:
   ```
   https://app.cognexiaai.com
   ```
   Should show: Client login page

4. **Test Super Admin MFA Flow**:
   - Go to: https://www.cognexiaai.com
   - Click the subtle dot (•) next to "SOC 2 Type II" in footer
   - Login with super admin credentials
   - Complete SMS OTP
   - Should redirect to: https://admin.cognexiaai.com

---

## ⚠️ Important Notes

1. **Clear Browser Cache**: After DNS changes, clear cache or use incognito mode
2. **HTTPS Only**: All domains will automatically use HTTPS (Vercel provisions SSL)
3. **Wait for Propagation**: Be patient - DNS can take up to 48 hours (usually 15-30 min)
4. **Remove Old Records**: Make sure no conflicting A or CNAME records exist

---

## 🐛 Troubleshooting

### Domain Not Resolving
- Check DNS propagation: https://dnschecker.org/
- Wait 15-30 minutes and try again
- Verify DNS records in GoDaddy match Vercel requirements

### SSL Certificate Error
- Wait 10 minutes - Vercel auto-provisions SSL
- Check domain status in Vercel dashboard
- Try accessing via incognito mode

### "Invalid Configuration" in Vercel
- Double-check DNS records in GoDaddy
- Ensure exact values match what Vercel requires
- Click "Refresh" in Vercel domain settings

### Still Seeing "Launching Soon" Page
- Clear browser cache completely
- Try different browser or incognito mode
- Check DNS using nslookup command

---

## ✅ Completion Checklist

- [ ] Added admin.cognexiaai.com to super-admin-portal in Vercel
- [ ] Added app.cognexiaai.com to client-admin-portal in Vercel
- [ ] Added CNAME for 'admin' in GoDaddy DNS
- [ ] Added CNAME for 'app' in GoDaddy DNS
- [ ] Verified "Valid Configuration" in Vercel (all green checkmarks)
- [ ] Waited 15-30 minutes for DNS propagation
- [ ] Tested https://www.cognexiaai.com (working ✓)
- [ ] Tested https://admin.cognexiaai.com
- [ ] Tested https://app.cognexiaai.com
- [ ] Tested super admin MFA redirect flow
- [ ] Updated Railway backend CORS settings
- [ ] Cleared browser cache and verified all domains

---

## 🚀 Next Step: Backend CORS Configuration

After DNS is working, we need to update the Railway backend to allow requests from your custom domains.

This will be done in the Railway dashboard - I'll guide you through it once domains are verified.
