# Railway Healthcheck Failure - Troubleshooting

## 1. Check Deploy Logs

**Railway Dashboard** → **CRM Backend** → **Deployments** → failed deployment → **Deploy Logs**

Look for:
- `[CRM] Starting bootstrap...` – process started
- `[CRM] Initializing application (connecting to database)...` – DB connect in progress
- `CRM Application is running` – app started successfully
- `Failed to start application` – app crashed (see error below)

## 2. Healthcheck Path and Timeout (main fix)

The CRM app exposes health at **`/`** and **`/health`** (not under `/api/v1`). Railway must use one of these and allow enough time for startup.

**In this repo:** `railway.toml` is already set to:

- **healthcheckPath** = `/health`
- **healthcheckTimeout** = `300` (5 minutes)

If you overrode these in the Railway UI, set them in the dashboard to match:

- **Settings** → **Networking** (or **Healthcheck**) → **Healthcheck Path**: `/health`
- **Healthcheck Timeout**: `300` seconds (or more)

The app can take 1–3 minutes to start (TypeORM + many modules). A short timeout (e.g. 60–100s) will cause "Healthcheck failure" even when the app eventually starts.

## 3. Optional: Env var timeout

In **Railway** → **CRM Backend** → **Variables**, you can also set:

| Variable | Value |
|----------|-------|
| `RAILWAY_HEALTHCHECK_TIMEOUT_SEC` | `300` |

(Config in `railway.toml` takes precedence if the service uses this repo’s config.)

## 4. Verify Database

- **Railway Postgres:** Ensure **`DATABASE_URL`** is set via **Add Reference** from the Postgres service.
- **Supabase:** Use `DATABASE_URL` with `?sslmode=require` or set host/port/user/password.

## 5. Redeploy

After changing `railway.toml` or Variables → **Deployments** → **Redeploy**.
