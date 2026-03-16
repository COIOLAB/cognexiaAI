# CRM Backend – Railway Production API Reference

Both production URLs serve the same API. Use **one** as your base URL.

---

## Production base URLs

| Base URL | Response (root) |
|----------|------------------|
| **https://cognexia-crm-backend-production.up.railway.app** | `{"status":"ok","service":"crm-backend"}` |
| **https://crm-backend-production-03da.up.railway.app** | `{"status":"ok","service":"crm-backend"}` |

**API base (all routes below):**  
`https://crm-backend-production-03da.up.railway.app/api/v1`  
(or replace with the other URL)

---

## Public endpoints (no auth)

| Method | Path | Full URL | Typical response |
|--------|------|----------|-------------------|
| GET | `/` | `https://...railway.app/` | `{"status":"ok","service":"crm-backend"}` |
| GET | `/health` | `https://...railway.app/health` | `{"status":"ok","timestamp":"2026-02-01T..."}` |

**Auth (no Bearer token):**

| Method | Path | Full URL | Purpose |
|--------|------|----------|---------|
| POST | `/api/v1/auth/login` | `.../api/v1/auth/login` | Login → `{ user, accessToken, refreshToken }` |
| POST | `/api/v1/auth/register` | `.../api/v1/auth/register` | Register → same shape |
| POST | `/api/v1/auth/demo-login` | `.../api/v1/auth/demo-login` | Demo login |
| POST | `/api/v1/auth/demo-reset` | `.../api/v1/auth/demo-reset` | Reset demo data |
| POST | `/api/v1/auth/refresh` | `.../api/v1/auth/refresh` | Body: `{ "refreshToken": "..." }` → `{ accessToken }` |
| POST | `/api/v1/auth/password-reset/request` | `.../api/v1/auth/password-reset/request` | Request reset |
| POST | `/api/v1/auth/password-reset/confirm` | `.../api/v1/auth/password-reset/confirm` | Confirm reset |

All other routes require: **`Authorization: Bearer <accessToken>`**.

---

## All API route groups (under `/api/v1`)

Use: **`https://crm-backend-production-03da.up.railway.app/api/v1`** + path below.

| Controller path | Main routes (method + path) |
|-----------------|-----------------------------|
| **auth** | POST login, register, demo-login, demo-reset, refresh, logout; POST password-reset/request, password-reset/confirm |
| **organizations** | GET/POST /, GET/PUT/DELETE :id, GET me/organization, GET :id/statistics, GET :id/users, GET :id/seat-usage, PATCH :id/seat-limit, POST :id/admin-user, POST :id/suspend, :id/activate, GET export |
| **onboarding** | GET progress, POST bulk-import, POST migrate |
| **mfa** | POST send-otp, verify-otp, setup-totp; GET generate-test-totp, twilio-status, cleanup-expired |
| **enterprise-payments** | GET/POST /, GET pending-approvals, overdue, :id, stats/pending-count; POST :id/approve, :id/reject, :id/mark-paid; PATCH/DELETE :id |
| **organization-billing** | PATCH/GET :id/billing-config, POST :id/approve-billing, :id/reject-billing |
| **products** | GET/POST /, GET search, featured, on-sale, best-sellers, inventory/low-stock, inventory/report, GET/PUT/DELETE :id, GET :id/recommendations, frequently-bought-together, upsell |
| **categories** | POST/GET /, GET tree, GET/DELETE :id |
| **bundles** | POST/GET /, GET :id |
| **workflows** | GET/POST /, GET/PUT/DELETE :id, POST :id/execute |
| **support-tickets** | GET /, GET :id, POST /, PUT :id/assign, :id/status, POST :id/message, GET stats/overview, POST :id/rate |
| **staff** | GET /, GET :id, POST invite, PUT/DELETE :id, GET roles/available, GET user/:userId/permissions |
| **notifications** | POST test, welcome-batch/:organizationId, bulk, notify-admins/:organizationId; POST triggers/*; GET templates, GET /, POST send, PUT :id/read |
| **analytics** | POST track, usage-stats; GET activities, usage/:organizationId |
| **import-export** | POST import, import/template, export; GET import/:jobId, import, export/:jobId, export/:jobId/download, export |
| **audit-logs** | GET /, organizations/:organizationId, users/:userId, entities/:entityType/:entityId, export, stats, :id |
| **throttling** | GET status, stats, limits/:type/:identifier, blocked/*, check/*; POST reset, block; DELETE block; GET export |
| **crm** | GET customers, leads, pipeline, analytics/overview, customers/:id/interactions; POST leads |
| **white-label** | GET/PUT/DELETE configs, configs/:organizationId; GET stats |
| **user-tiers** | GET/PUT organization/:organizationId, organization/:organizationId/can-add-user; POST organization/:organizationId/validate, initialize; GET all |
| **users** | GET/POST /, POST invite, GET/PUT :id, POST :id/password |
| **user-impersonation** | POST impersonate, end/:sessionId, bulk-action, force-logout; GET active, search-users, history/:userId |
| **usage** | GET /, stats/:organizationId, daily/:organizationId, quota/:organizationId, quota/:organizationId/check, top-endpoints, active-users, trends, summary; POST cleanup, track/:organizationId, track |
| **territories** | GET/POST /, GET/PUT/DELETE :id, POST assign, assign/bulk, rebalance; GET :id/stats, analytics/* |
| **calls** | GET/POST /, GET recent, missed, statistics, customer/:customerId, agent/:agentId, :id; PUT/DELETE :id; POST :id/answer, hangup, hold, resume, transfer, missed |
| **call-queues** | GET/POST /, GET available, :id; PUT/DELETE :id; POST :id/agents; DELETE :id/agents/:agentId; GET :id/statistics |
| **call-analytics** | GET /, agent/:agentId/performance, trends |
| **system-config** | GET/PUT configs, configs/:key; GET/PUT feature-flags |
| **api/crm/support** | POST/GET tickets, GET tickets/:id, PUT tickets/:id, POST tickets/:id/assign, auto-assign, escalate, response; GET statistics, knowledge-base/search; POST sla/check-compliance |
| **support-analytics** | GET daily-summary, overview, sentiment-trends, team-performance |
| **subscription-plans** | GET/POST / |
| **webhooks/stripe** | POST / |
| **stripe** | POST customer, payment-method, subscription, subscription/:organizationId/update, subscription/:organizationId/cancel, payment, refund/:transactionId, webhook, create-payment-intent, create-subscription |
| **sequences** | GET/POST /, GET/PUT/DELETE :id; POST :id/activate, :id/pause, enroll, enroll/bulk, unenroll, enrollment/:id/pause, enrollment/:id/resume; GET :id/analytics, :id/timeline, analytics/overall; POST analytics/compare |
| **security-compliance** | GET dashboard, events, ip-blocklist, compliance-report, mfa-status; POST events/resolve, ip-blocklist/add, ip-blocklist/remove/:ip, compliance/run-check |
| **crm/sales** | GET/POST opportunities, PUT opportunities/:id/stage, GET opportunities/export, opportunities/:id; PUT/DELETE opportunities/:id; POST opportunities/bulk-delete; GET pipeline; GET/POST quotes, GET quotes/export, quotes/stats, quotes/:id; PUT/DELETE quotes/:id; POST quotes/:id/send, accept, reject, convert; GET metrics, forecasting |
| **sales/orders** | GET /, stats, export, :id; POST /; PUT :id; POST :id/cancel, confirm, ship, deliver; POST bulk-cancel |
| **revenue-billing** | GET overview, churn-analysis, transactions, failed-payments; POST transactions, retry-payment/:id, refund/:id; GET invoice/:organizationId/:month |
| **reporting** | POST/GET reports, GET reports/templates, GET/PUT/DELETE reports/:id, POST reports/:id/run; POST/GET/PUT/DELETE schedules, POST schedules/:id/run; POST/GET analytics/* |
| **releases** | GET/POST /, PUT :id, POST :id/rollback; GET stats |
| **recommendations** | GET /, POST generate/:organizationId, PUT :id/status; GET stats |
| **real-time** | GET metrics/live, dashboard/:dashboardId, alerts, customer-activity/live, conversions/live; POST events, alerts; PUT alerts/:id |
| **quantum** | POST personality-profile, consciousness-simulation; GET entanglement/:customerId, behavioral-predictions/:customerId, emotional-resonance/:customerId |
| **price-lists** | GET/POST /, GET active, :id; PUT/DELETE :id |
| **discounts** | GET/POST /, GET active, :id; PUT/DELETE :id |
| **pricing** | POST validate-code, calculate, calculate-bulk, apply-discount |
| **predictive-analytics** | GET churn-predictions, revenue-forecast, churn-summary; POST predict-churn/:organizationId |
| **portal** | POST users, accept-invitation, login, password/request-reset, password/reset; GET profile; PUT profile, preferences; POST password/change; GET tickets, documents, knowledge-base/search; POST tickets |
| **platform-analytics** | GET overview, growth-trends, usage-metrics, revenue-breakdown |
| **performance** | GET metrics, slow-queries, index-recommendations/:entity, connection-pool, table-sizes, requests, requests/slow; POST create-indexes/:entity, analyze/:table, vacuum-analyze, slow-query-threshold; DELETE slow-queries, requests |
| **performance** (monitoring) | GET dashboard, endpoints, system-health; POST record |
| **organization-health** | GET scores, summary, inactive; POST calculate/:organizationId, recalculate-all |
| **organizations/:id/features** | GET /, PUT /, GET check/:featureKey |
| **nl-query** | POST execute; GET history |
| **multi-region** | (see controller) |
| **monitoring** | (see controller) |
| **mobile/devices** | (see controller) |
| **mobile/notifications** | (see controller) |
| **mobile** | (see controller) |
| **mobile-admin** | (see controller) |
| **migration** | (see controller) |
| **crm/marketing** | (see controller) |
| **llm** | (see controller) |
| **kpi-goals** | (see controller) |
| **ivr-menus** | (see controller) |
| **invoices** | (see controller) |
| **inventory** | (see controller) |
| **integrations** | (see controller) |
| **holographic** | (see controller) |
| **health-v2** | (see controller) |
| **forms** | (see controller) |
| **feature-usage** | (see controller) |
| **email** | (see controller) |
| **documents** | (see controller) |
| **disaster-recovery** | (see controller) |
| **developer-portal** | (see controller) |
| **db-console** | (see controller) |
| **dashboards** | (see controller) |
| **crm/customers** | (see controller) |
| **customer-success** | (see controller) |
| **custom-reports** | (see controller) |
| **crm/ai** | (see controller) |
| **contracts** | (see controller) |
| **crm/contacts** | (see controller) |
| **communication** | (see controller) |
| **catalogs** | (see controller) |
| **billing-transactions** | (see controller) |
| **automation-workflows** | (see controller) |
| **arvr** | (see controller) |
| **api-management** | (see controller) |
| **anomalies** | (see controller) |
| **financial-analytics** | (see controller) |
| **audit** | (see controller) |
| **admin-support-tickets** | (see controller) |
| **activity** | (see controller) |
| **crm/accounts** | (see controller) |
| **ab-tests** | (see controller) |

---

## Example responses (production)

### GET / (root)

**Request:**  
`GET https://crm-backend-production-03da.up.railway.app/`

**Response:**  
`{"status":"ok","service":"crm-backend"}`

(Similarly for [cognexia-crm-backend-production.up.railway.app](https://cognexia-crm-backend-production.up.railway.app/).)

### GET /health

**Request:**  
`GET https://crm-backend-production-03da.up.railway.app/health`

**Response:**  
`{"status":"ok","timestamp":"2026-02-01T..."}`

### POST /api/v1/auth/login

**Request:**  
`POST https://crm-backend-production-03da.up.railway.app/api/v1/auth/login`  
`Content-Type: application/json`  
Body: `{"email":"user@example.com","password":"..."}`

**Response (200):**  
```json
{
  "user": { "id", "email", "firstName", "lastName", "userType", "organizationId", "roles", ... },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

Use **accessToken** in the header for protected routes:  
`Authorization: Bearer <accessToken>`.

---

## Enabling Swagger and testing all APIs (200 check)

### 1. Enable Swagger on Railway

In **Railway** → **cognexia-crm-backend** → **Variables**, add:

`ENABLE_SWAGGER=true`

Redeploy. Then open in a browser:

- **https://crm-backend-production-03da.up.railway.app/api/v1/api/docs**
- Or: **https://cognexia-crm-backend-production.up.railway.app/api/v1/api/docs**

You can try each endpoint in Swagger UI and confirm the response (200 or other).

### 2. Script to test APIs and check for 200

From your machine (where network can reach Railway), run:

```powershell
cd backend\modules\03-CRM
.\test-railway-apis.ps1
```

Optional: use the other production URL:

```powershell
$env:RAILWAY_API_BASE = "https://cognexia-crm-backend-production.up.railway.app"
.\test-railway-apis.ps1
```

The script:

1. Calls **GET /** and **GET /health** (public).
2. Calls **POST /api/v1/auth/demo-login** to get a token.
3. Calls a set of protected **GET** endpoints with `Authorization: Bearer <token>`.
4. Prints each endpoint and status (200 = OK, else FAIL).
5. Writes **railway-api-test-results.csv** with Method, Path, Status, Is200.

So you can see which APIs return 200 and which do not. Run it from a machine that can reach Railway (e.g. your PC, not an isolated sandbox).

---

## Quick test (curl)

```bash
# Health
curl https://crm-backend-production-03da.up.railway.app/health

# Login (replace email/password)
curl -X POST https://crm-backend-production-03da.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'
```

Use one base URL consistently in your frontend (`NEXT_PUBLIC_API_URL`).
