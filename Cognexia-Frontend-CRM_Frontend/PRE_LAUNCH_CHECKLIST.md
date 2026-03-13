# CognexiaAI ERP - Pre-Launch End-to-End Test Checklist

**Purpose:** Verify all services, APIs, databases, and buttons before deployment.

---

## 1. Prerequisites

### 1.1 Database
- [ ] **PostgreSQL** (local) OR **Supabase** running
- [ ] Database `cognexia_crm` created
- [ ] Migrations run: `cd backend/modules/03-CRM && npm run migration:run` (if applicable)
- [ ] Super admin seeded: `npm run seed-admin-user`

### 1.2 Environment Variables

**Backend** (`backend/modules/03-CRM/.env`):
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=cognexia_crm
JWT_SECRET=your-secure-secret
PORT=3003
```

**Auth Portal** (`frontend/auth-portal/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3003/api/v1
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=superadmin@cognexiaai.com
NEXT_PUBLIC_SUPER_ADMIN_PASSWORD=your_password
NEXT_PUBLIC_SUPER_ADMIN_MOBILE=+91XXXXXXXXXX
NEXT_PUBLIC_AUTH_PORTAL_URL=http://localhost:3010
NEXT_PUBLIC_SUPER_ADMIN_PORTAL_URL=http://localhost:3001
NEXT_PUBLIC_CLIENT_ADMIN_PORTAL_URL=http://localhost:3002
```

**Super Admin** (`frontend/super-admin-portal/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3003/api/v1
```

**Client Admin** (`frontend/client-admin-portal/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3003/api/v1
NEXT_PUBLIC_AUTH_PORTAL_URL=http://localhost:3010
```

---

## 2. Start All Services

| Service | Port | Command | Status |
|---------|------|---------|--------|
| Backend CRM | 3003 | `cd backend/modules/03-CRM && npm run start:dev` | ☐ |
| Auth Portal | 3010 | `cd frontend/auth-portal && npm run dev` | ☐ |
| Super Admin Portal | 3001 | `cd frontend/super-admin-portal && npm run dev` | ☐ |
| Client Admin Portal | 3002 | `cd frontend/client-admin-portal && npm run dev` | ☐ |

**Health Check:** `curl http://localhost:3003/api/v1` → expect 200 with `{"status":"ok",...}`

---

## 3. Auth Portal Tests

| Test | URL | Expected | Status |
|------|-----|----------|--------|
| Home page loads | http://localhost:3010 | Landing page | ☐ |
| Super Admin login (footer dot) | http://localhost:3010 → dot next to Soc type 2 | Credentials form | ☐ |
| Enter credentials | superadmin@cognexiaai.com / Akshita@19822 | 2FA page | ☐ |
| MFA - Mobile OTP | Send OTP → Enter code → Verify | Redirect to Super Admin (3001) | ☐ |
| MFA - Email OTP | Send OTP → Enter code | Redirect to Super Admin | ☐ |
| MFA - TOTP | Enter 6-digit TOTP | Redirect to Super Admin | ☐ |
| Client login | http://localhost:3010/login | Login form | ☐ |
| Demo login | Try Demo button | Redirect to Client Admin demo | ☐ |

---

## 4. Super Admin Portal Tests

| Test | URL | Expected | Status |
|------|-----|----------|--------|
| Login required | http://localhost:3001 | Redirect to login (or Auth Portal) | ☐ |
| Dashboard | / | Stats, charts from backend | ☐ |
| Organizations list | /organizations | Real orgs from DB | ☐ |
| Organization detail | /organizations/[id] | Org details, users, seat usage | ☐ |
| Export CSV | Organizations → Export CSV | Download CSV file | ☐ |
| Create Organization | /organizations/create | Form → API → New org | ☐ |
| Organization Onboarding | /onboarding | Bulk import CSV, link to orgs | ☐ |
| Users | /users | User list from backend | ☐ |
| Billing | /billing | Billing data | ☐ |
| Platform Analytics | /analytics | Charts from API | ☐ |
| Support Tickets | /tickets or /support/tickets | Ticket list | ☐ |
| Staff Management | /staff | Staff list | ☐ |
| All sidebar links | Each nav item | No 404, page loads | ☐ |

---

## 5. Client Admin Portal Tests

| Test | URL | Expected | Status |
|------|-----|----------|--------|
| Login | http://localhost:3002/login | Login form | ☐ |
| Demo login | Try Demo | Demo org, redirect to dashboard | ☐ |
| Dashboard | /dashboard | Org-specific data | ☐ |
| Support tickets | /dashboard/support | Ticket list | ☐ |
| CRM features | Sales, Marketing, etc. | Data from backend | ☐ |
| API calls | All pages | Use NEXT_PUBLIC_API_URL | ☐ |

---

## 6. Backend API Tests

| Endpoint | Method | Expected | Status |
|----------|--------|----------|--------|
| /health | GET | 200 OK | ☐ |
| /api/v1/auth/login | POST | JWT tokens | ☐ |
| /api/v1/organizations | GET | Org list (with JWT) | ☐ |
| /api/v1/organizations/export | GET | CSV download | ☐ |
| /api/v1/mfa/twilio-status | GET | Twilio config status | ☐ |
| /api/v1/onboarding/progress | GET | Onboarding stats | ☐ |
| /api/v1/dashboard/admin/stats | GET | Dashboard stats | ☐ |

---

## 7. Database Verification

### 7.1 Tables (PostgreSQL)
```sql
-- Run: psql -U postgres -d cognexia_crm -c "\dt"
-- Expected: organizations, users, audit_logs, etc.
```

- [ ] `organizations` table exists
- [ ] `users` table exists
- [ ] Super admin user: `SELECT * FROM users WHERE "userType"='super_admin' LIMIT 1;`
- [ ] At least 1 organization (from seed or create)

### 7.2 Supabase (if used)
- [ ] Project connected
- [ ] Tables synced with migrations
- [ ] Row Level Security (RLS) configured for production

---

## 8. Deployment Readiness

- [ ] No hardcoded `localhost` in production build (use env vars)
- [ ] Debug instrumentation removed or disabled in production
- [ ] CORS configured for production domains
- [ ] JWT_SECRET changed from default
- [ ] Database credentials secured
- [ ] Twilio/Email credentials in env (not code)

---

## 9. Quick Smoke Test Script

```bash
# 1. Start backend
cd backend/modules/03-CRM && npm run start:dev &
sleep 15

# 2. Health check
curl -s http://localhost:3003/health | head -1

# 3. Login (replace with real creds)
TOKEN=$(curl -s -X POST http://localhost:3003/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@cognexiaai.com","password":"Akshita@19822"}' \
  | jq -r '.accessToken')
echo "Token: ${TOKEN:0:20}..."

# 4. Orgs list
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3003/api/v1/organizations | jq '.organizations | length'
```

---

## 10. Known Gaps to Address Before Launch

1. **Hardcoded URLs** – Replace `localhost:3003` with `NEXT_PUBLIC_API_URL` in components
2. **Debug logs** – Remove or guard `127.0.0.1:7242` fetch calls for production
3. **Footer/Navbar** – Use env for auth portal URL (3010) in deployment
4. **.env.example** – Backend port is 3003 (main.ts), not 3000

---

*Last updated: Pre-launch audit*
