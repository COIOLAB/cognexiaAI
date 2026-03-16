# Railway Environment Variables - Complete Setup

Copy these to **Railway Dashboard → CRM Backend → Variables**.

---

## Switch to Railway Postgres (Option A – Recommended)

**Step-by-step guide:** [RAILWAY_POSTGRES_SETUP.md](./RAILWAY_POSTGRES_SETUP.md)

To avoid Supabase connection issues, use **Railway's built-in PostgreSQL**:

1. **Add PostgreSQL to your project**
   - Railway Dashboard → Your Project (e.g. friendly-beauty)
   - Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
   - Wait until the Postgres service is running (green)

2. **Link DATABASE_URL to the CRM Backend**
   - Open your **CRM Backend** service
   - Go to **Variables** tab
   - Click **"+ New Variable"** → **"Add Reference"**
   - Select the **Postgres** service
   - Choose **`DATABASE_URL`** (or `DATABASE_PRIVATE_URL`)
   - Save

3. **Remove Supabase database variables**
   - Delete or leave empty: `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` if you had them set for Supabase
   - The referenced `DATABASE_URL` from Postgres overrides everything

4. **Redeploy**
   - Railway will redeploy automatically when variables change

**Note:** Railway Postgres is in the same project/network, so no SSL or pooler issues. Your app uses `DATABASE_URL` as-is.

---

## Creating all tables and columns on Railway

Railway Postgres starts **empty**. The backend is configured with **`synchronize: false`** by default, so tables are not created automatically. To create the full schema (all tables and columns) that match your entities:

### One-time schema sync (recommended for fresh Railway DB)

1. **First deploy – create tables**
   - In Railway → CRM Backend → **Variables**, add:
     - `DATABASE_SYNC_SCHEMA` = `true`
   - Deploy (or let auto-redeploy run).
   - On startup, TypeORM will create/update all tables and columns from your entity files.

2. **Second deploy – turn sync off**
   - Remove `DATABASE_SYNC_SCHEMA` or set it to `false`.
   - Redeploy.
   - From now on the app runs with `synchronize: false` (safe for production).

**Important:** Use `DATABASE_SYNC_SCHEMA=true` only on a **new/empty** database. Do not leave it `true` in production; it can alter or drop data.

### Tables and columns match local

The backend loads **all** entity files from `src/entities/` (150+ entities). When `DATABASE_SYNC_SCHEMA=true` runs:

- **Every table** defined by an `*.entity.ts` file is created or updated.
- **Every column** on those entities is created or altered to match the entity definition.

So the Railway database ends up with the **same schema as your local database** (same tables and columns), as long as your local DB was created from the same entity files (e.g. with `synchronize: true` in development or the same migrations). No extra tables or columns are needed beyond what the entities define.

### Optional: run migrations from your machine

If you use TypeORM migrations and want to run them against Railway Postgres:

1. Copy Railway’s **`DATABASE_URL`** (from Postgres service → Variables or from CRM Backend’s referenced variable).
2. In your **local** project, create or update `.env` with:
   - `DATABASE_URL=<paste Railway Postgres URL>`
3. From the `03-CRM` folder run:
   - `npm run migration:run`
4. The migration runner supports `DATABASE_URL`, so it will connect to Railway and apply pending migrations.

---

## REQUIRED - Core

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3003` |

---

## REQUIRED - Database (Choose ONE option)

### Option A: Railway Postgres (recommended – no Supabase)
- Add Postgres service in the same project → Variables → Add Reference → `DATABASE_URL` from Postgres service.
- No `DATABASE_HOST` / `DATABASE_PORT` / etc. needed when using `DATABASE_URL`.

### Option B: Supabase PostgreSQL (optional)
| Variable | Value |
|----------|-------|
| `DATABASE_HOST` | `db.moijigidcrvbnjoaqelr.supabase.co` |
| `DATABASE_PORT` | `5432` |
| `DATABASE_USER` | `postgres` |
| `DATABASE_PASSWORD` | `YOUR_SUPABASE_DB_PASSWORD` |
| `DATABASE_NAME` | `postgres` |

---

## REQUIRED - JWT Auth

| Variable | Value |
|----------|-------|
| `JWT_SECRET` | `industry5.0-crm-jwt-secret-change-in-production` |
| `JWT_REFRESH_SECRET` | `industry5.0-crm-jwt-refresh-secret-change-in-production` |
| `JWT_EXPIRATION` | `24h` |

---

## Frontend–backend after launch (smooth integration)

For the frontend (e.g. Vercel) to work with the Railway backend:

### 1. Backend (Railway) – CORS

Set `CORS_ORIGIN` to the **exact frontend origin(s)** that will call the API (no trailing slash):

| Variable | Value (example) |
|----------|------------------|
| `CORS_ORIGIN` | `https://your-app.vercel.app,https://auth.vercel.app,https://client.vercel.app` |

- For **local dev**: keep `http://localhost:3001,http://localhost:3002,http://localhost:3010` (or your dev ports).
- For **production**: add your Vercel (or other) frontend URLs, comma-separated.

### 2. Frontend (Vercel / env) – API base URL

Set the backend API base URL (including `/api/v1`) so all API calls go to Railway:

| Variable | Value (example) |
|----------|------------------|
| `NEXT_PUBLIC_API_URL` | `https://your-crm-backend.up.railway.app/api/v1` |

- Get the URL from **Railway → CRM Backend → Settings → Networking → Public URL** (then add `/api/v1`).
- Use this in **Vercel → Project → Settings → Environment Variables** (and in any local `.env` for production builds).

### 3. Optional – app URL on backend

If the backend sends emails or links back to the frontend, set:

| Variable | Value (example) |
|----------|------------------|
| `APP_URL` | `https://your-app.vercel.app` |

After these are set, the frontend and backend work together: same tables/columns on Railway as local, and API + CORS configured for production.

---

## REQUIRED - CORS

| Variable | Value |
|----------|-------|
| `CORS_ORIGIN` | `http://localhost:3001,http://localhost:3002,http://localhost:3010` (dev) or your production frontend URLs |

---

## SUPABASE API (optional – only if app uses Supabase for auth/storage)

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | `https://moijigidcrvbnjoaqelr.supabase.co` |
| `SUPABASE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaWppZ2lkY3J2Ym5qb2FxZWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MzE1ODYsImV4cCI6MjA4MzUwNzU4Nn0.qMhUyNcux2dJs35w2eEtbmKylFJAwBm-cwCE774LSBs` |
| `SUPABASE_ANON_KEY` | *(same as above)* |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaWppZ2lkY3J2Ym5qb2FxZWxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkzMTU4NiwiZXhwIjoyMDgzNTA3NTg2fQ.6CbXFPgHOnFx6WU45n6vSs6uB-dH8-pjCKb5al0yBaA` |
| `SUPABASE_BUCKET` | `crm-documents` |

---

## TWILIO MFA (SMS OTP)

| Variable | Value |
|----------|-------|
| `TWILIO_ACCOUNT_SID` | `AC921a86d3fad214975b6da5b2a27caa37` |
| `TWILIO_AUTH_TOKEN` | `7a9bc5d89914e71cbf5d36f6616e61f5` |
| `TWILIO_VERIFY_SERVICE_SID` | `VA525eb465e4457fe79fcd96542687d2ce` |
| `TWILIO_PHONE_NUMBER` | `+16065032630` |

---

## SMTP EMAIL

| Variable | Value |
|----------|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | `bs3423221@gmail.com` |
| `SMTP_PASS` | `ymszhqufaczbuuto` |
| `SMTP_PASSWORD` | `ymszhqufaczbuuto` |
| `SMTP_FROM_NAME` | `CognexiaAI` |
| `SMTP_FROM_EMAIL` | `bs3423221@gmail.com` |

---

## AI / LLM

| Variable | Value |
|----------|-------|
| `AI_SERVICES_ENABLED` | `true` |
| `GROQ_API_KEY` | `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` |
| `GEMINI_API_KEY` | `AIzaSyBea33BQwc4E1goo1Ac8espmjpPoHnt3Js` |
| `OPENROUTER_API_KEY` | `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` |

---

## FEATURE FLAGS

| Variable | Value |
|----------|-------|
| `DEMO_ENABLED` | `true` |
| `ENABLE_SWAGGER` | `false` |
| `RBAC_ENABLED` | `true` |
| `MFA_ENABLED` | `true` |

---

## APP URLs

| Variable | Value |
|----------|-------|
| `APP_URL` | `https://your-frontend.vercel.app` |
| `SUPER_ADMIN_EMAIL` | `superadmin@cognexiaai.com` |

---

## Quick Copy List (when using Railway Postgres for DB)

**Database:** Add Postgres service and reference `DATABASE_URL` (see "Switch from Supabase to Railway Postgres" above). Then use:

```
NODE_ENV=production
PORT=3003
JWT_SECRET=industry5.0-crm-jwt-secret-change-in-production
JWT_EXPIRATION=24h
CORS_ORIGIN=http://localhost:3001,http://localhost:3002,http://localhost:3010
TWILIO_ACCOUNT_SID=AC921a86d3fad214975b6da5b2a27caa37
TWILIO_AUTH_TOKEN=7a9bc5d89914e71cbf5d36f6616e61f5
TWILIO_VERIFY_SERVICE_SID=VA525eb465e4457fe79fcd96542687d2ce
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=bs3423221@gmail.com
SMTP_PASS=ymszhqufaczbuuto
GROQ_API_KEY=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
DEMO_ENABLED=true
```
