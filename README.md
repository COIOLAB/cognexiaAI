# CognexiaAI CRM Backend

Industry 5.0 CRM Module - NestJS API with TypeORM, PostgreSQL, JWT authentication, and multi-tenant support.

## Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Copy env file and configure
cp .env.example .env
# Edit .env with your database credentials

# Run in development mode
npm run start:dev
```

Server runs at: `http://localhost:3003/api/v1`

## Deploy to Railway (Option A: Railway Postgres)

Use **Railway Postgres** as the database (recommended; no Supabase DB connection issues).

**Full steps:** see **[RAILWAY_POSTGRES_SETUP.md](./RAILWAY_POSTGRES_SETUP.md)**.

### Summary

1. **Add PostgreSQL** in your Railway project: + New → Database → Add PostgreSQL.
2. **Link DATABASE_URL:** CRM Backend → Variables → + New Variable → **Add Reference** → select Postgres → choose `DATABASE_URL`.
3. **First deploy:** Add `DATABASE_SYNC_SCHEMA=true`, deploy once (creates tables), then remove it or set to `false` and redeploy.
4. **Other variables** in CRM Backend → Variables: `NODE_ENV=production`, `PORT=3003`, `JWT_SECRET`, `JWT_EXPIRATION`, `CORS_ORIGIN`. See [RAILWAY_ENV_SETUP.md](./RAILWAY_ENV_SETUP.md) for the full list.

Do **not** set `DATABASE_HOST` / `DATABASE_PORT` / etc. when using the referenced `DATABASE_URL`. Railway auto-deploys on push, or trigger a deploy in the dashboard.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Development with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run seed-admin-user` | Create super admin user |

## API Endpoints

Base URL: `/api/v1`

- `GET /` - Health check
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/demo-login` - Demo login (if enabled)
- `GET /organizations` - List organizations
- ... see full API docs at `/api/v1/api/docs` (if `ENABLE_SWAGGER=true`)

## Tech Stack

- **Framework**: NestJS 10
- **Database**: PostgreSQL + TypeORM
- **Auth**: JWT + Passport
- **Validation**: class-validator
- **API Docs**: Swagger (optional)
