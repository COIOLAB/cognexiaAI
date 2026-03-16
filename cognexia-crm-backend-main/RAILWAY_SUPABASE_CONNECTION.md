# Railway + Supabase Connection – Issues & Fixes

**Recommended:** Use **Railway Postgres** instead of Supabase for the database. See [RAILWAY_POSTGRES_SETUP.md](./RAILWAY_POSTGRES_SETUP.md).

This doc summarizes **known issues** when connecting the CRM backend on **Railway** to **Supabase PostgreSQL**, and how to fix or avoid them.

---

## Known issues (Supabase ↔ Railway)

| Issue | Cause | Fix |
|-------|--------|-----|
| **Self-signed certificate** | Supabase uses TLS; Node may reject the cert | App sets `NODE_TLS_REJECT_UNAUTHORIZED=0` when `DATABASE_URL` or remote host is used. On Railway, also set `NODE_TLS_REJECT_UNAUTHORIZED=0` in Variables if you still see TLS errors. |
| **Connection refused / timeout** | Wrong URL, missing SSL, or network | Use **direct** connection (port **5432**) and `?sslmode=require` in `DATABASE_URL`. See format below. |
| **Healthcheck failure** | App not ready before Railway’s healthcheck | Set `RAILWAY_HEALTHCHECK_TIMEOUT_SEC=300` (or higher). See [RAILWAY_HEALTHCHECK_FIX.md](./RAILWAY_HEALTHCHECK_FIX.md). |
| **Password auth failed** | Wrong password or special chars not encoded | In `DATABASE_URL`, URL-encode the password (e.g. `@` → `%40`). |
| **Pooler vs direct** | Supabase has port 5432 (direct) and 6543 (pooler) | Use **5432** for TypeORM unless you use pooler-specific settings. App is tuned for direct. |

---

## Recommended: Use Railway Postgres (no Supabase DB)

To **avoid** Supabase connection issues on Railway:

1. In Railway → your project → **Add PostgreSQL** (same project as CRM Backend).
2. In **CRM Backend** → **Variables** → **Add Reference** → select Postgres → choose **`DATABASE_URL`**.
3. Remove or leave empty: `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`.
4. Redeploy.

Details: [RAILWAY_ENV_SETUP.md – Switch from Supabase to Railway Postgres](./RAILWAY_ENV_SETUP.md).

---

## If you keep Supabase as the database on Railway

### 1. Use a single `DATABASE_URL` (recommended)

In **Railway → CRM Backend → Variables**, set:

```bash
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require
```

- Replace `YOUR_PASSWORD` with your Supabase DB password (URL-encode special characters, e.g. `@` → `%40`).
- Replace `PROJECT_REF` with your Supabase project ref (e.g. `moijigidcrvbnjoaqelr`).
- Use port **5432** (direct), not 6543.
- **`?sslmode=require`** is required for Supabase from Railway.

Do **not** set `DATABASE_HOST` / `DATABASE_PORT` / etc. when using `DATABASE_URL`; the URL overrides them.

### 2. Optional: TLS / healthcheck

If you still see TLS or healthcheck errors, add:

| Variable | Value |
|----------|--------|
| `NODE_TLS_REJECT_UNAUTHORIZED` | `0` |
| `RAILWAY_HEALTHCHECK_TIMEOUT_SEC` | `300` |

### 3. First deploy – create tables

For a **new** Supabase database:

1. Set `DATABASE_SYNC_SCHEMA=true` in Railway Variables.
2. Deploy once (TypeORM will create/update tables).
3. Set `DATABASE_SYNC_SCHEMA=false` or remove it and redeploy.

---

## Quick checklist (Supabase on Railway)

- [ ] `DATABASE_URL` is set with **port 5432** and **`?sslmode=require`**.
- [ ] Password in URL is URL-encoded (e.g. `@` → `%40`).
- [ ] No conflicting `DATABASE_HOST` / `DATABASE_PORT` / etc. (or leave them unset).
- [ ] `NODE_TLS_REJECT_UNAUTHORIZED=0` if you see self-signed cert errors.
- [ ] `RAILWAY_HEALTHCHECK_TIMEOUT_SEC=300` if healthcheck fails.
- [ ] Deploy logs (Railway → Deployments → failed deployment → Deploy Logs) checked for `connect ECONNREFUSED`, `password authentication failed`, or `self-signed certificate`.

---

## Where the app handles Supabase/Railway

- **`src/main.ts`** – Sets `NODE_TLS_REJECT_UNAUTHORIZED=0` when `DATABASE_URL` or remote `DATABASE_HOST` is set.
- **`src/database/data-source.ts`** – Uses `DATABASE_URL` or host/port/user/password; SSL enabled for remote DB; normalizes Supabase URL to include `sslmode=require` if missing.
- **`src/crm.module.ts`** – TypeORM config: same URL/host logic and SSL for remote DB; supports `DATABASE_SYNC_SCHEMA` for first-time table creation.

If problems persist, use **Railway Postgres** (same project) and reference its `DATABASE_URL`; that avoids Supabase networking and SSL entirely.
