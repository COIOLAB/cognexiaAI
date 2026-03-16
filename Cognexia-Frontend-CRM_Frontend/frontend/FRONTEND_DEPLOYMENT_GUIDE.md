# Frontend Deployment Guide – GitHub + Vercel (+ optional Docker)

This guide covers: **GitHub repository setup**, **Vercel deployment** (recommended), and **optional Docker** for self-hosted or other platforms.

---

## 1. GitHub repository

### Option A: One repository (recommended)

Use **one** GitHub repo (e.g. `CognexiaAI-ERP`) that contains the whole project, including:

- `frontend/auth-portal`
- `frontend/client-admin-portal`
- `frontend/super-admin-portal`
- `frontend/shared-ui`
- `backend/...`

**Steps:**

1. Create a repo on [GitHub](https://github.com/new) (e.g. `CognexiaAI-ERP` or `cognexiaai-erp`).
2. From your project root:
   ```powershell
   cd c:\Users\nshrm\Desktop\CognexiaAI-ERP
   git remote add origin https://github.com/YOUR_USERNAME/CognexiaAI-ERP.git
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git push -u origin main
   ```
3. Vercel will connect to this **one repo** and deploy **three projects**, each with a different **Root Directory** (see below).

### Option B: Separate repos per frontend

If you prefer one repo per app:

- Create three repos, e.g. `cognexia-auth-portal`, `cognexia-client-admin`, `cognexia-super-admin`.
- Copy or subtree only the app folder + `shared-ui` (client-admin and super-admin depend on `shared-ui`). You’ll need to adjust `shared-ui` path (e.g. publish as package or copy into each repo).

**Recommendation:** Option A (one repo) is simpler and matches the existing structure.

---

## 2. Vercel deployment (no Docker needed)

Vercel **builds Next.js from source**; you do **not** need a Dockerfile for Vercel.

### 2.1 Create three Vercel projects

| # | Portal           | Root Directory              | Project name (example)     |
|---|------------------|-----------------------------|----------------------------|
| 1 | Auth             | `frontend/auth-portal`      | `cognexia-auth`            |
| 2 | Client Admin     | `frontend/client-admin-portal` | `cognexia-client-admin` |
| 3 | Super Admin      | `frontend/super-admin-portal`  | `cognexia-super-admin`  |

### 2.2 Steps in Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. **Import Git Repository** → select your GitHub repo (e.g. CognexiaAI-ERP).
3. **Configure Project:**
   - **Root Directory:** click **Edit** → set to the folder in the table above (e.g. `frontend/auth-portal`).
   - **Framework Preset:** Next.js (auto-detected).
   - **Build Command:** leave default (`next build`) unless you use a custom script.
   - **Output Directory:** leave default.
4. **Environment Variables:** add the variables from [`.env.production.example`](./.env.production.example) (see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for per-project list).
5. Click **Deploy**.

Repeat for the other two portals (new project each time, same repo, different Root Directory).

### 2.3 Monorepo / shared-ui

- **auth-portal:** no dependency on `shared-ui`; builds as-is.
- **client-admin-portal** and **super-admin-portal:** depend on `@cognexia/shared-ui` with `"file:../shared-ui"`.  
  When Root Directory is `frontend/client-admin-portal`, the repo root is still the repo root, so `../shared-ui` resolves to `frontend/shared-ui`. Vercel runs `npm install` (and your `postinstall` if any) in that root; ensure `postinstall` builds shared-ui (e.g. `cd ../shared-ui && npm install && npm run build`). Your current `package.json` already has this.

### 2.4 Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** (Production, and optionally Preview):

- **All:** `NEXT_PUBLIC_API_URL=https://crm-backend-production-03da.up.railway.app/api/v1`
- **Auth:** `NEXT_PUBLIC_SUPER_ADMIN_PORTAL_URL`, `NEXT_PUBLIC_CLIENT_ADMIN_PORTAL_URL`, `NEXT_PUBLIC_CLIENT_PORTAL_URL` (your Vercel URLs).
- **Client Admin:** `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPER_ADMIN_PORTAL_URL` (optional).
- **Super Admin:** `NEXT_PUBLIC_APP_URL`.

Full list: [`.env.production.example`](./.env.production.example) and [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md).

### 2.5 Backend CORS

In **Railway** → CRM Backend → **Variables**, set:

`CORS_ORIGIN=https://your-auth.vercel.app,https://your-client-admin.vercel.app,https://your-super-admin.vercel.app`

(Use your real Vercel URLs, comma-separated.)

---

## 3. Optional: Docker for frontend

Use Docker if you want to run the frontend on **Railway (Docker)**, **ECS**, **Kubernetes**, or **self-hosted** instead of Vercel.

- **Auth portal:** standalone; Dockerfile only needs the app.
- **Client-admin and Super-admin:** depend on `shared-ui`; Dockerfile builds `shared-ui` first, then the app.

**Build context:** run `docker build` from the **repository root** so both `frontend/shared-ui` and `frontend/<app>` are available.

Example (Auth):

```powershell
cd c:\Users\nshrm\Desktop\CognexiaAI-ERP
docker build -f frontend/auth-portal/Dockerfile -t cognexia-auth .
```

Example (Client Admin – needs shared-ui):

```powershell
docker build -f frontend/client-admin-portal/Dockerfile -t cognexia-client-admin .
```

See the Dockerfile in each app folder for exact instructions.

---

## 4. Summary

| Step              | Action |
|-------------------|--------|
| **GitHub**        | One repo (e.g. CognexiaAI-ERP) with `frontend/auth-portal`, `frontend/client-admin-portal`, `frontend/super-admin-portal`, `frontend/shared-ui`. |
| **Vercel**        | Three projects, same repo; Root Directory = `frontend/auth-portal`, `frontend/client-admin-portal`, `frontend/super-admin-portal`. No Docker. |
| **Env vars**      | Set per project from `.env.production.example`; backend URL + portal URLs. |
| **CORS**          | Add all three Vercel frontend URLs to Railway `CORS_ORIGIN`. |
| **Docker**        | Optional; use the Dockerfiles in each app folder if you deploy to Docker-based platforms. |

For **Vercel-only** deployment you do **not** need a Dockerfile; only use Dockerfiles if you deploy the frontend with Docker.
