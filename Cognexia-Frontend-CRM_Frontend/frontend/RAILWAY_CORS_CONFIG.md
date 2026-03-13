# Railway Backend CORS Configuration

## 🎯 Purpose
Update the Railway backend to accept API requests from your custom domains.

---

## 📋 Required Environment Variables

You need to add or update these environment variables in your Railway backend service:

### Variables to Add/Update:

```bash
# CORS Origins (comma-separated list of allowed domains)
CORS_ORIGINS=https://cognexiaai.com,https://www.cognexiaai.com,https://admin.cognexiaai.com,https://app.cognexiaai.com,http://localhost:3000,http://localhost:3001,http://localhost:3002

# Alternative variable name (check which one your backend uses)
ALLOWED_ORIGINS=https://cognexiaai.com,https://www.cognexiaai.com,https://admin.cognexiaai.com,https://app.cognexiaai.com,http://localhost:3000,http://localhost:3001,http://localhost:3002

# Frontend URLs
CLIENT_URL=https://app.cognexiaai.com
SUPER_ADMIN_URL=https://admin.cognexiaai.com
AUTH_PORTAL_URL=https://www.cognexiaai.com
```

---

## 📋 Step-by-Step: Update Railway

### Step 1: Access Railway Project

1. Go to: https://railway.app
2. Login to your account
3. Find your project: **cognexia-crm-backend-production** (or similar)
4. Click on the backend service

### Step 2: Add Environment Variables

1. Click on the **"Variables"** tab
2. Look for existing CORS-related variables:
   - `CORS_ORIGINS`
   - `ALLOWED_ORIGINS`
   - `CORS_ALLOWED_ORIGINS`
   - `CLIENT_URL`
   - etc.

3. **Update or Add** the variables with the new domains:

#### If Variable Exists:
- Click **"Edit"** (pencil icon)
- Update the value to include all custom domains
- Click **"Save"**

#### If Variable Doesn't Exist:
- Click **"+ New Variable"**
- Enter variable name (e.g., `CORS_ORIGINS`)
- Enter value with all domains (comma-separated, no spaces)
- Click **"Add"**

### Step 3: Variable Values

**For CORS_ORIGINS:**
```
https://cognexiaai.com,https://www.cognexiaai.com,https://admin.cognexiaai.com,https://app.cognexiaai.com,http://localhost:3000,http://localhost:3001,http://localhost:3002
```

**For CLIENT_URL:**
```
https://app.cognexiaai.com
```

**For SUPER_ADMIN_URL:**
```
https://admin.cognexiaai.com
```

**For AUTH_PORTAL_URL:**
```
https://www.cognexiaai.com
```

### Step 4: Redeploy Backend

1. After adding/updating variables, Railway will prompt to redeploy
2. Click **"Deploy"** or the service will auto-redeploy
3. Wait for deployment to complete (usually 2-5 minutes)
4. Check deployment logs for any errors

---

## 🔍 Verify CORS Configuration

### Method 1: Check Backend Logs

1. In Railway, click on the backend service
2. Go to **"Deployments"** tab
3. Click on the latest deployment
4. Check logs for CORS-related messages:
   ```
   ✓ CORS enabled for: https://cognexiaai.com, https://www.cognexiaai.com, ...
   ```

### Method 2: Test API Request

After backend redeploys, test an API call from your browser:

1. Open browser console (F12) on https://www.cognexiaai.com
2. Run this test:
   ```javascript
   fetch('https://cognexia-crm-backend-production.up.railway.app/api/v1/health', {
     method: 'GET',
     headers: { 'Content-Type': 'application/json' }
   })
   .then(r => r.json())
   .then(data => console.log('✓ CORS working:', data))
   .catch(err => console.error('✗ CORS error:', err));
   ```

3. If CORS is working: You'll see the response
4. If CORS is blocked: You'll see a CORS error in console

---

## 🐛 Troubleshooting

### Error: "CORS policy blocked"

**Symptoms:**
```
Access to fetch at 'https://cognexia-crm-backend-production.up.railway.app/...' 
from origin 'https://www.cognexiaai.com' has been blocked by CORS policy
```

**Solutions:**
1. Verify CORS_ORIGINS includes the exact origin (with https://)
2. Check for typos in domain names
3. Ensure no trailing slashes in domain values
4. Redeploy backend after variable changes
5. Clear browser cache

### Backend Not Reading Environment Variables

**Check:**
1. Variable names are correct (case-sensitive)
2. Values have no spaces after commas
3. Backend service restarted after changes
4. Check backend code for which variable names it uses

### Still Getting CORS Errors

1. **Check backend code**: Look for CORS configuration in:
   - `main.py` or `app.py` (Python)
   - `index.js` or `server.js` (Node.js)
   - Check which environment variable name it uses

2. **Update backend code** if needed:
   ```python
   # Python/FastAPI example
   from fastapi.middleware.cors import CORSMiddleware
   
   origins = os.getenv("CORS_ORIGINS", "").split(",")
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=origins,
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

---

## ✅ Verification Checklist

- [ ] Accessed Railway backend service
- [ ] Added/Updated CORS_ORIGINS variable
- [ ] Added/Updated other frontend URL variables
- [ ] Saved all changes
- [ ] Backend service redeployed
- [ ] Waited for deployment to complete (2-5 minutes)
- [ ] Checked deployment logs for errors
- [ ] Tested API request from browser console
- [ ] No CORS errors in browser console
- [ ] All domains working correctly

---

## 🎉 Success Indicators

When properly configured, you should see:
- ✅ No CORS errors in browser console
- ✅ API requests succeeding from all domains
- ✅ Login/authentication working on all portals
- ✅ MFA redirect working correctly

---

## 📞 Need Help?

If you encounter issues:
1. Check Railway deployment logs for errors
2. Verify exact variable names your backend uses
3. Test with browser dev tools console
4. Share specific error messages for troubleshooting
