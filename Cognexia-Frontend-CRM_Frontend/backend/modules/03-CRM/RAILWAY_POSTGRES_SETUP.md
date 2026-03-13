# Option A: Use Railway Postgres

Use **Railway’s built-in PostgreSQL** as the CRM database. No Supabase DB, no SSL/pooler issues.

---

## 1. Add PostgreSQL in Railway

1. Open [Railway](https://railway.app) → your project (e.g. CognexiaAI-ERP).
2. Click **+ New** → **Database** → **Add PostgreSQL**.
3. Wait until the Postgres service is running (green).

---

## 2. Link DATABASE_URL to the CRM Backend

1. Open your **CRM Backend** service (the one that runs this repo).
2. Go to **Variables**.
3. Click **+ New Variable** → **Add Reference**.
4. Select the **Postgres** service.
5. Choose **`DATABASE_URL`** (or **`DATABASE_PRIVATE_URL`** if you prefer private network).
6. Save.

That’s it for the database. The backend will use this URL; no `DATABASE_HOST` / `DATABASE_PORT` / etc. needed.

---

## 3. Remove old Supabase DB variables (if any)

If you previously used Supabase for the database, remove or leave empty in the CRM Backend service:

- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_NAME`

The referenced **`DATABASE_URL`** from Postgres overrides these. Keep **Supabase API** variables (`SUPABASE_URL`, `SUPABASE_KEY`, etc.) only if the app uses Supabase for **storage/auth** (e.g. document uploads).

---

## 4. Create tables on first deploy

Railway Postgres starts **empty**. To create all CRM tables:

1. In **CRM Backend** → **Variables**, add:
   - `DATABASE_SYNC_SCHEMA` = `true`
2. Deploy (or let auto-redeploy run). On startup, TypeORM will create/update tables from your entities.
3. After the first successful deploy, **remove** `DATABASE_SYNC_SCHEMA` or set it to `false`.
4. Redeploy.

**Important:** Use `DATABASE_SYNC_SCHEMA=true` only on a **new/empty** database. Do not leave it `true` in production.

---

## 5. Other required variables

In **CRM Backend** → **Variables**, ensure you have at least:

| Variable | Value |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` | `3003` |
| `JWT_SECRET` | *(e.g. `openssl rand -base64 48`)* |
| `JWT_EXPIRATION` | `24h` |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` |

See [RAILWAY_ENV_SETUP.md](./RAILWAY_ENV_SETUP.md) for the full list (JWT, Twilio, SMTP, etc.).

---

## 6. Redeploy

Railway redeploys when variables change. If not, go to **Deployments** → **Redeploy**.

---

## Troubleshooting

### "relation X does not exist" in logs (Scheduler errors)

Railway Postgres starts **empty**. If you see errors like:

- `relation "push_notifications" does not exist`
- `relation "sequence_enrollments" does not exist`
- `relation "organizations" does not exist`

**Fix:** Create tables by running schema sync once:

1. **CRM Backend** → **Variables** → add `DATABASE_SYNC_SCHEMA` = `true`
2. Save and wait for redeploy (or trigger **Redeploy**)
3. After deploy succeeds, **remove** `DATABASE_SYNC_SCHEMA` or set it to `false`
4. Redeploy again

After that, the Scheduler errors should stop.

### NODE_TLS_REJECT_UNAUTHORIZED warning

If you see: *"Setting the NODE_TLS_REJECT_UNAUTHORIZED environment variable to '0' makes TLS connections insecure"*:

- Remove **`NODE_TLS_REJECT_UNAUTHORIZED`** from CRM Backend Variables if you added it manually (not needed with Railway Postgres).
- If you still use Supabase for DB, keep it only then; with Railway Postgres you don’t need it.

### SMTP "Connection timeout"

Emails will be logged to console only until SMTP is configured. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in Variables if you want real email.

---

## Summary

- **Database:** Railway Postgres only (reference `DATABASE_URL` in CRM Backend).
- **First deploy:** Set `DATABASE_SYNC_SCHEMA=true` once, then set it to `false`.
- **Supabase:** Only for API (storage/auth) if you use it; DB is Railway Postgres.
