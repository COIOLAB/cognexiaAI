# Deploy Frontend on Vercel

**If this repo is the Cognexia Frontend repo** (frontend-only), use Root Directory **`auth-portal`** / **`client-admin-portal`** / **`super-admin-portal`** (no `frontend/` prefix).  
**If this folder lives inside a monorepo**, use **`frontend/auth-portal`** etc.

Use **one** production env reference: [`.env.production.example`](./.env.production.example).  
Set the same variable names in each Vercel project; only the portal-specific URLs differ per project.

---

## Why three Vercel projects? (Still one Cognexia AI)

The repo has **three separate Next.js apps** (each with its own `package.json`, `next build`, and routes):

- **auth-portal** – marketing + login (port 3010 locally)
- **client-admin-portal** – client/org dashboard (port 3002)
- **super-admin-portal** – super-admin dashboard (port 3001)

Vercel deploys **one app per project**, so we use **three projects** to deploy all three. That does **not** mean three products: it’s still **one Cognexia AI**:

- One **Vercel team/account** (e.g. Cognexia AI)
- One **backend** (Railway CRM)
- One **brand** – use **one custom domain** and subdomains so everything lives under one product:

| Portal        | Subdomain example        | Role              |
|---------------|--------------------------|-------------------|
| Auth / Login  | `auth.cognexiaai.com`     | Marketing + login |
| Client Admin  | `app.cognexiaai.com`     | Client dashboard  |
| Super Admin   | `admin.cognexiaai.com`   | Super-admin       |

So: **three Vercel projects**, but **one domain** (e.g. `cognexiaai.com`) with three subdomains. Users see one product; you manage one env reference and one backend.

---

## 1. Backend URL (already deployed on Railway)

Use this for **all** frontend projects:

```
NEXT_PUBLIC_API_URL=https://crm-backend-production-03da.up.railway.app/api/v1
```

---

## 2. Deploy each portal as a separate Vercel project

| Portal              | Folder                    | Vercel project name (example) |
|---------------------|---------------------------|------------------------------|
| Auth (marketing + login) | `frontend/auth-portal`       | `cognexia-auth`              |
| Client Admin        | `frontend/client-admin-portal` | `cognexia-client-admin`   |
| Super Admin         | `frontend/super-admin-portal`  | `cognexia-super-admin`   |

---

## 3. Vercel: create projects and set root

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Import your repo (e.g. CognexiaAI-ERP).
3. For **Root Directory**, set:
   - Auth portal: `frontend/auth-portal`
   - Client admin: `frontend/client-admin-portal`
   - Super admin: `frontend/super-admin-portal`
4. **Framework Preset**: Next.js (auto-detected).
5. Before deploying, add **Environment Variables** (see below).

---

## 4. Environment variables per project

Use **Production** (and optionally Preview) for all.  
Reference: [`.env.production.example`](./.env.production.example).

### Auth portal (`frontend/auth-portal`)

| Variable | Value (replace with your URLs) |
|----------|--------------------------------|
| `NEXT_PUBLIC_API_URL` | `https://crm-backend-production-03da.up.railway.app/api/v1` |
| `NEXT_PUBLIC_SUPER_ADMIN_PORTAL_URL` | `https://cognexia-super-admin.vercel.app` (or your super-admin URL) |
| `NEXT_PUBLIC_CLIENT_ADMIN_PORTAL_URL` | `https://cognexia-client-admin.vercel.app` (or your client-admin URL) |
| `NEXT_PUBLIC_CLIENT_PORTAL_URL` | Same as `NEXT_PUBLIC_CLIENT_ADMIN_PORTAL_URL` |

Optional: `NEXT_PUBLIC_SUPER_ADMIN_EMAIL`, `NEXT_PUBLIC_SUPER_ADMIN_PASSWORD`, `NEXT_PUBLIC_SUPER_ADMIN_MOBILE`, Supabase vars (see `.env.production.example`).

### Client admin portal (`frontend/client-admin-portal`)

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://crm-backend-production-03da.up.railway.app/api/v1` |
| `NEXT_PUBLIC_APP_NAME` | `CognexiaAI ERP` |
| `NEXT_PUBLIC_APP_URL` | `https://cognexia-client-admin.vercel.app` (this portal’s URL) |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | `true` |
| `NEXT_PUBLIC_ENABLE_WEBHOOKS` | `false` |
| `NEXT_PUBLIC_ENABLE_BILLING` | `false` |

Optional: `NEXT_PUBLIC_WS_URL` (e.g. `wss://crm-backend-production-03da.up.railway.app`) for real-time.

### Super admin portal (`frontend/super-admin-portal`)

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://crm-backend-production-03da.up.railway.app/api/v1` |
| `NEXT_PUBLIC_APP_NAME` | `CognexiaAI Super Admin` |
| `NEXT_PUBLIC_APP_URL` | `https://cognexia-super-admin.vercel.app` (this portal’s URL) |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | `true` |
| `NEXT_PUBLIC_ENABLE_SYSTEM_HEALTH` | `true` |

---

## 5. Backend CORS (Railway)

So the frontend can call the API, set in **Railway** → **cognexia-crm-backend** → **Variables**:

```
CORS_ORIGIN=https://cognexia-auth.vercel.app,https://cognexia-client-admin.vercel.app,https://cognexia-super-admin.vercel.app
```

Use your real Vercel URLs, comma-separated, no trailing slash.

---

## 6. One domain, three subdomains (optional)

To present everything as **one Cognexia AI** under one domain:

1. Add your domain in **Vercel** → **Team/Account** → **Domains** (e.g. `cognexiaai.com`).
2. For each project, add a **subdomain**:
   - **Auth portal** → Domain: `auth.cognexiaai.com`
   - **Client admin** → Domain: `app.cognexiaai.com`
   - **Super admin** → Domain: `admin.cognexiaai.com`
3. Update **`.env.production.example`** (and Vercel env vars) so portal URLs use these subdomains.
4. Update **Railway** `CORS_ORIGIN` to include `https://auth.cognexiaai.com`, `https://app.cognexiaai.com`, `https://admin.cognexiaai.com`.

Then users see one product: login at `auth.cognexiaai.com`, clients at `app.cognexiaai.com`, admins at `admin.cognexiaai.com`.

---

## 7. After first deploy

1. Copy each project’s **Vercel URL** (e.g. `https://cognexia-auth.vercel.app`).
2. Update **Auth portal** vars: `NEXT_PUBLIC_SUPER_ADMIN_PORTAL_URL` and `NEXT_PUBLIC_CLIENT_ADMIN_PORTAL_URL` (and `NEXT_PUBLIC_CLIENT_PORTAL_URL`) to those URLs.
3. Update **Client admin** and **Super admin** `NEXT_PUBLIC_APP_URL` to their own URLs.
4. Redeploy each project after changing env vars (or let Vercel redeploy).
5. Add/update `CORS_ORIGIN` on Railway with the final frontend URLs.

---

## Quick copy: one .env for production

All variable names in one place: **[.env.production.example](./.env.production.example)**.  
Use it as the single reference; in Vercel you set **only** the variables each project needs (see tables above).
