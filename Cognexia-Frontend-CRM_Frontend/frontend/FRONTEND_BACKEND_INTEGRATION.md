# Frontend + Backend Integration – Seamless Linking

This doc explains how the **three frontends** (auth-portal, client-admin-portal, super-admin-portal) and the **CRM backend** (Railway) are linked so everything works seamlessly.

---

## 1. Architecture (one Cognexia AI)

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                    COGNEXIA AI                            │
                    └─────────────────────────────────────────────────────────┘
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         │                                    │                                    │
         ▼                                    ▼                                    ▼
┌─────────────────┐                 ┌─────────────────┐                 ┌─────────────────┐
│   AUTH PORTAL   │                 │ CLIENT ADMIN    │                 │ SUPER ADMIN     │
│ (Marketing +    │  redirect       │ (Org dashboard) │                 │ (Platform       │
│  Login/Register)│ ───────────────►│                 │                 │  admin)         │
│                 │  with #auth=    │                 │                 │                 │
│ • /login        │                 │ • /dashboard    │                 │ • / (dashboard) │
│ • /register     │                 │ • /login       │                 │ • /login        │
│ • /admin-access │ ───────────────►│ (also receives  │                 │ (receives       │
│   (Super Admin  │  #auth= tokens  │  #auth= from    │                 │  #auth= from    │
│    MFA)         │                 │  auth-portal)   │                 │  auth-portal)   │
└────────┬────────┘                 └────────┬────────┘                 └────────┬────────┘
         │                                   │                                    │
         │         NEXT_PUBLIC_API_URL       │         NEXT_PUBLIC_API_URL        │
         └───────────────────────────────────┼────────────────────────────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────┐
                              │   CRM BACKEND (Railway)       │
                              │   /api/v1/auth/login          │
                              │   /api/v1/auth/register       │
                              │   /api/v1/auth/refresh        │
                              │   /api/v1/...                 │
                              └──────────────────────────────┘
```

- **Single login entry:** Auth portal (`/login`, `/register`). After login/register, user is redirected to **client-admin** or **super-admin** based on role.
- **Tokens across origins:** Redirect URL includes `#auth=<encoded_tokens>` so the target portal (different origin) can read and store tokens; otherwise the user would land logged out.
- **Backend:** One CRM API; all three frontends use the same `NEXT_PUBLIC_API_URL`.

---

## 2. Auth flow (seamless)

### Option A: Login from auth-portal (recommended – one entry)

1. User opens **auth-portal** (e.g. `auth.cognexiaai.com`).
2. Clicks **Sign In** or **Try Demo** → **auth-portal** `/login`.
3. Submits credentials (or Demo) → backend `POST /api/v1/auth/login` (or demo-login).
4. Backend returns `{ user, accessToken, refreshToken }`.
5. Auth-portal redirects by role:
   - **Super Admin** → `NEXT_PUBLIC_SUPER_ADMIN_PORTAL_URL/#auth=<tokens>` (e.g. admin.cognexiaai.com).
   - **Client / Org user** → `NEXT_PUBLIC_CLIENT_PORTAL_URL/dashboard#auth=<tokens>` (e.g. app.cognexiaai.com).
6. **Super-admin** and **client-admin** both read `#auth=` on load, store tokens and user in their store + `localStorage`, then clear the hash. User is logged in on that portal.

### Option B: Super Admin MFA (admin-access)

1. User opens **auth-portal** `/admin-access` (super-admin secure login).
2. After email/OTP verification → backend login → redirect to **super-admin** with `#auth=<tokens>` (same as above).

### Option C: Direct login on client-admin or super-admin

- **Client-admin** has its own `/login`; it calls the same backend and redirects super-admins to `NEXT_PUBLIC_SUPER_ADMIN_PORTAL_URL` (env-driven).
- **Super-admin** has its own `/login` and also accepts `#auth=` from auth-portal (MFA or normal redirect).

---

## 3. Environment variables (one source of truth)

Use **one** production reference: [`.env.production.example`](./.env.production.example).

### All portals (required)

| Variable | Value | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_API_URL` | `https://crm-backend-production-03da.up.railway.app/api/v1` | Backend CRM API (Railway) |

### Auth portal

| Variable | Value | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPER_ADMIN_PORTAL_URL` | e.g. `https://admin.cognexiaai.com` | Redirect after super-admin login |
| `NEXT_PUBLIC_CLIENT_PORTAL_URL` | e.g. `https://app.cognexiaai.com` | Redirect after client login |
| `NEXT_PUBLIC_CLIENT_ADMIN_PORTAL_URL` | Same as `NEXT_PUBLIC_CLIENT_PORTAL_URL` | Navbar/links (optional) |

### Client admin portal

| Variable | Value | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_APP_URL` | This portal’s URL (e.g. `https://app.cognexiaai.com`) | App base URL |
| `NEXT_PUBLIC_SUPER_ADMIN_PORTAL_URL` | e.g. `https://admin.cognexiaai.com` | Redirect super-admins when they log in here |

### Super admin portal

| Variable | Value | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_APP_URL` | This portal’s URL (e.g. `https://admin.cognexiaai.com`) | App base URL |

---

## 4. Backend CORS (Railway)

The CRM backend must allow all three frontend origins. In **Railway** → **cognexia-crm-backend** → **Variables**:

```
CORS_ORIGIN=https://auth.cognexiaai.com,https://app.cognexiaai.com,https://admin.cognexiaai.com
```

Use your real Vercel or custom URLs, comma-separated, **no trailing slash**.  
If you use Vercel default URLs first:

```
CORS_ORIGIN=https://cognexia-auth.vercel.app,https://cognexia-client-admin.vercel.app,https://cognexia-super-admin.vercel.app
```

---

## 5. Token storage (consistent)

- **Auth portal:** Stores `accessToken`, `refreshToken`, `user` in `localStorage` before redirect (and in memory). Does not use them after redirect (user lands on another origin).
- **Client-admin:** Reads `#auth=` → stores in Zustand + `localStorage` (`accessToken`, `refreshToken`, `user`, `organizationId`). API client uses `useAuthStore` and `localStorage`.
- **Super-admin:** Reads `#auth=` → stores in Zustand + `localStorage` (`access_token`, `refresh_token`, `accessToken`, `refreshToken`, `user`). API client uses `localStorage.getItem('access_token')` and refresh on 401.

All portals call the same backend `/auth/refresh` with `refreshToken` when the access token expires.

---

## 6. What was fixed for seamless linking

1. **Auth portal – redirect with tokens**  
   After login/register, redirect no longer goes to client-admin or super-admin without tokens. It now goes to `{portal}/...#auth=<encoded_json>` so the target portal can restore the session.

2. **Client-admin – read `#auth=`**  
   `AuthHashHandler` in the root layout reads `#auth=` on load, parses tokens and user, calls `setAuth` and sets `localStorage`, then removes the hash. Same idea as super-admin’s layout.

3. **Client-admin – super-admin URL from env**  
   When a super-admin logs in on client-admin, redirect uses `NEXT_PUBLIC_SUPER_ADMIN_PORTAL_URL` instead of a hardcoded localhost URL.

4. **Auth portal – single login entry**  
   Navbar “Sign In” and “Try Demo” now point to auth-portal’s `/login` so one place handles login, then redirects by role with `#auth=`.

5. **Register redirect**  
   After registration, redirect to client-admin dashboard now includes `#auth=` so the user lands logged in.

---

## 7. Checklist (deploy + env)

- [ ] Backend (Railway) deployed and `NEXT_PUBLIC_API_URL` points to it (e.g. `https://crm-backend-production-03da.up.railway.app/api/v1`).
- [ ] Railway `CORS_ORIGIN` includes all three frontend URLs (auth, client-admin, super-admin).
- [ ] Auth portal: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPER_ADMIN_PORTAL_URL`, `NEXT_PUBLIC_CLIENT_PORTAL_URL` set (and optional `NEXT_PUBLIC_CLIENT_ADMIN_PORTAL_URL`).
- [ ] Client-admin: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, and (if you redirect super-admins) `NEXT_PUBLIC_SUPER_ADMIN_PORTAL_URL`.
- [ ] Super-admin: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`.
- [ ] All portal URLs match what you set in CORS (no trailing slash).

After that, login/register on auth-portal and direct login on client-admin or super-admin should work seamlessly with the same backend.
