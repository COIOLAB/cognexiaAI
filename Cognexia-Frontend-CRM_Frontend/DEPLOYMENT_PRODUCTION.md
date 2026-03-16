# CognexiaAI ERP - Production Deployment Guide

**Deploy Backend on Railway | Deploy Frontend on Vercel**

---

## CLI Deployment (Quick Start)

```powershell
# 1. Install CLIs (one-time)
npm i -g @railway/cli vercel

# 2. Login (one-time, opens browser)
railway login
vercel login

# 3. First-time Railway setup (from backend/modules/03-CRM)
cd backend\modules\03-CRM
railway login   # Opens browser to log in
railway link    # Select/create project (choose PostgreSQL if offered)

# 4. Deploy backend
cd ..\..\..
.\scripts\deploy-railway.ps1

# 5. Deploy frontends (set NEXT_PUBLIC_API_URL first)
$env:NEXT_PUBLIC_API_URL = "https://your-railway-app.railway.app/api/v1"
.\scripts\deploy-vercel.ps1 -Target all

# Or deploy one portal: -Target auth | client | super
```

See [Part 1](#part-1-deploy-backend-on-railway) and [Part 2](#part-2-deploy-frontend-on-vercel) for full setup.

---

## Quick Overview

| Component | Platform | Root Directory |
|-----------|----------|----------------|
| **CRM Backend API** | Railway | `backend/modules/03-CRM` |
| **Auth Portal** (marketing + login) | Vercel | `frontend/auth-portal` |
| **Client Admin Portal** | Vercel | `frontend/client-admin-portal` |
| **Super Admin Portal** | Vercel | `frontend/super-admin-portal` |

---

## Part 1: Deploy Backend on Railway

### 1.1 Prerequisites

- [Railway](https://railway.app) account
- [Supabase](https://supabase.com) account (for PostgreSQL) **OR** use Railway's PostgreSQL plugin
- Domain (optional, Railway provides `*.railway.app` by default)

### 1.2 Create Railway Project

1. Go to [railway.app](https://railway.app) → New Project
2. **Add PostgreSQL** (Deploy → New → Database → PostgreSQL)
3. **Add Service** → Deploy from GitHub repo
4. Connect your GitHub repository
5. Set **Root Directory**: `backend/modules/03-CRM`

### 1.3 Configure Environment Variables (Railway Dashboard)

In your CRM service → Variables → Add:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `3003` | Railway sets this automatically; override if needed |
| `DATABASE_URL` | *(auto from PostgreSQL)* | Railway injects this when you add PostgreSQL |
| `JWT_SECRET` | *64+ char random string* | Generate: `openssl rand -base64 48` |
| `JWT_EXPIRATION` | `24h` | |
| `CORS_ORIGIN` | `https://auth.your-app.vercel.app,https://client.your-app.vercel.app,https://admin.your-app.vercel.app` | Comma-separated frontend URLs |
| `DEMO_ENABLED` | `false` | Set `true` to allow Try Demo in production |
| `ENABLE_SWAGGER` | `false` | Set `true` to expose API docs |

**If using Supabase instead of Railway PostgreSQL:**

| Variable | Value |
|----------|-------|
| `DATABASE_HOST` | `db.xxxx.supabase.co` |
| `DATABASE_PORT` | `5432` |
| `DATABASE_USER` | `postgres` |
| `DATABASE_PASSWORD` | *from Supabase* |
| `DATABASE_NAME` | `postgres` |

**Optional – Twilio MFA:**
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_VERIFY_SERVICE_SID`

### 1.4 Deploy

Railway will:

1. Run `npm install`
2. Run `npm run build` (from `railway.toml` or `Procfile`)
3. Run `npm start`

### 1.5 Get Backend URL

- Service → Settings → Generate Domain  
- Example: `https://cognexia-crm-production.up.railway.app`

Your API base URL: `https://your-railway-domain.up.railway.app/api/v1`

### 1.6 Database Migrations & Seeding

Run locally with `DATABASE_URL` pointing to your production DB (use Railway’s connection string):

```bash
cd backend/modules/03-CRM
DATABASE_URL="postgresql://..." npm run migration:run
DATABASE_URL="postgresql://..." npm run seed-admin-user
```

---

## Part 2: Deploy Frontend on Vercel

### 2.1 Prerequisites

- [Vercel](https://vercel.com) account
- Backend API URL (from Railway)
- GitHub repo connected

### 2.2 Deploy Auth Portal

1. Vercel → New Project → Import Git Repository
2. **Root Directory**: `frontend/auth-portal`
3. **Framework Preset**: Next.js (auto-detected)
4. **Environment Variables**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-railway-domain.up.railway.app/api/v1` |
| `NEXT_PUBLIC_SUPER_ADMIN_PORTAL_URL` | `https://super-admin.your-app.vercel.app` |
| `NEXT_PUBLIC_CLIENT_ADMIN_PORTAL_URL` | `https://client-admin.your-app.vercel.app` |
| `NEXT_PUBLIC_CLIENT_PORTAL_URL` | `https://client-admin.your-app.vercel.app` (same as above) |

5. Deploy

### 2.3 Deploy Client Admin Portal

1. New Project → Same repo
2. **Root Directory**: `frontend/client-admin-portal`
3. **Environment Variables**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-railway-domain.up.railway.app/api/v1` |
| `NEXT_PUBLIC_APP_URL` | `https://client-admin.your-app.vercel.app` |

4. Deploy

### 2.4 Deploy Super Admin Portal

1. New Project → Same repo
2. **Root Directory**: `frontend/super-admin-portal`
3. **Environment Variables**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-railway-domain.up.railway.app/api/v1` |
| `NEXT_PUBLIC_APP_URL` | `https://super-admin.your-app.vercel.app` |

4. Deploy

### 2.5 Shared UI Dependency

Client Admin and Super Admin use `@cognexia/shared-ui`. The `postinstall` script builds it before each frontend build. Ensure `frontend/shared-ui` is in the repo.

---

## Part 3: Final CORS Update

After all frontends are deployed, update the backend `CORS_ORIGIN` in Railway:

```
CORS_ORIGIN=https://auth-portal.vercel.app,https://client-admin.vercel.app,https://super-admin.vercel.app
```

Use the exact Vercel URLs (including `https://` and no trailing slash).

---

## Part 4: Production Checklist

### Backend (Railway)

- [ ] PostgreSQL (Railway or Supabase) connected
- [ ] `JWT_SECRET` set to a secure random value
- [ ] `CORS_ORIGIN` includes all frontend URLs
- [ ] `NODE_ENV=production`
- [ ] Migrations run
- [ ] Super admin user seeded
- [ ] Domain generated and noted
- [ ] Health check: `curl https://your-api.railway.app/api/v1` → `{"status":"ok"}`

### Frontend (Vercel)

- [ ] Auth Portal: `NEXT_PUBLIC_API_URL`, portal URLs set
- [ ] Client Admin: `NEXT_PUBLIC_API_URL` set
- [ ] Super Admin: `NEXT_PUBLIC_API_URL` set
- [ ] All three deployed and reachable
- [ ] Sign In → Client Admin login works
- [ ] Try Demo → demo login works (if `DEMO_ENABLED=true`)

### Security

- [ ] No `.env` files committed
- [ ] `JWT_SECRET` not shared or logged
- [ ] CORS restricted to your domains
- [ ] `ENABLE_SWAGGER=false` in production (unless needed)

---

## Troubleshooting

### Backend fails to start (Railway)

- **Database**: Verify `DATABASE_URL` or `DATABASE_HOST` + credentials.
- **Port**: Railway sets `PORT`; app uses `process.env.PORT || 3003`.
- **Build**: Fix TypeScript/build errors locally first.

### Frontend API calls fail

- **CORS**: Add the exact frontend URL (with `https://`) to `CORS_ORIGIN`.
- **API URL**: Use full base URL including `/api/v1`, e.g. `https://api.example.com/api/v1`.

### Shared UI build fails (Vercel)

- Ensure `frontend/shared-ui` exists and has a valid `package.json`.
- `postinstall` in client-admin and super-admin runs `cd ../shared-ui && npm install && npm run build`.

---

## File Reference

| File | Purpose |
|------|---------|
| `backend/modules/03-CRM/.env.example` | Dev env template |
| `backend/modules/03-CRM/.env.production.example` | Production env template |
| `backend/modules/03-CRM/railway.toml` | Railway config |
| `frontend/*/.env.example` | Frontend env templates |
| `frontend/*/vercel.json` | Vercel framework config |

---

**Last updated**: January 2026
