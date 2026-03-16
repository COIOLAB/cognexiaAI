# Complete API Endpoint List - CognexiaAI CRM

**Base URL:** `http://localhost:3003/api/v1`

## 🧪 TESTING STATUS
- ✅ = Working
- ❌ = 404 Error
- ⚠️ = 500 Error / Needs Fixing
- ⏳ = Not Tested Yet

---

## 1️⃣ INDUSTRY 5.0 APIs (NEW - 8 Modules, 65 Endpoints)

### A. Quantum Intelligence (`/quantum`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/quantum/personality-profile` | `{"customerId": "cust-123"}` | ⏳ |
| GET | `/quantum/entanglement/:customerId` | Param: `cust-123` | ⏳ |
| POST | `/quantum/consciousness-simulation` | `{"customerId": "cust-123"}` | ⏳ |
| GET | `/quantum/behavioral-predictions/:customerId` | Param: `cust-123` | ⏳ |
| GET | `/quantum/emotional-resonance/:customerId` | Param: `cust-123` | ⏳ |

### B. Holographic Experience (`/holographic`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/holographic/sessions` | `{"customerId": "cust-123", "experienceType": "PRODUCT_DEMO"}` | ⏳ |
| GET | `/holographic/sessions/:id` | Param: session ID | ⏳ |
| PUT | `/holographic/sessions/:id` | `{"status": "ACTIVE"}` | ⏳ |
| POST | `/holographic/sessions/:sessionId/gestures` | `{"gestureType": "SWIPE"}` | ⏳ |
| GET | `/holographic/sessions/:sessionId/analytics` | Param: session ID | ⏳ |
| POST | `/holographic/templates` | Template data | ⏳ |

### C. AR/VR Sales (`/arvr`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| GET | `/arvr/test` | None | ✅ |
| POST | `/arvr/showrooms` | `{"name": "VR Showroom 1"}` | ⏳ |
| GET | `/arvr/showrooms` | None | ✅ |
| GET | `/arvr/showrooms/:id` | Param: showroom ID | ⏳ |
| POST | `/arvr/sessions` | `{"showroomId": "...", "customerId": "..."}` | ⏳ |
| GET | `/arvr/sessions/:id` | Param: session ID | ⏳ |
| POST | `/arvr/sessions/:sessionId/interactions` | Interaction data | ⏳ |
| GET | `/arvr/analytics` | None | ⏳ |

### D. Contract Management (`/contracts`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/contracts` | Contract data | ⏳ |
| GET | `/contracts` | None | ⏳ |
| GET | `/contracts/:id` | Param: contract ID | ⏳ |
| PUT | `/contracts/:id` | Updated contract data | ⏳ |
| DELETE | `/contracts/:id` | Param: contract ID | ⏳ |
| POST | `/contracts/:contractId/clauses` | Clause data | ⏳ |
| POST | `/contracts/:contractId/sign` | `{"signerId": "...", "signature": "..."}` | ⏳ |
| GET | `/contracts/:contractId/version-history` | None | ⏳ |
| POST | `/contracts/:contractId/approve` | None | ⏳ |
| POST | `/contracts/:contractId/renew` | Renewal data | ⏳ |

### E. Inventory Management (`/inventory`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/inventory/items` | Item data | ⏳ |
| GET | `/inventory/items` | None | ⏳ |
| GET | `/inventory/items/:id` | Param: item ID | ⏳ |
| PUT | `/inventory/items/:id` | Updated item data | ⏳ |
| POST | `/inventory/items/:itemId/locations` | Location data | ⏳ |
| POST | `/inventory/items/:itemId/movements` | Movement data | ⏳ |
| GET | `/inventory/stock-levels` | None | ⏳ |
| POST | `/inventory/replenishment-orders` | Order data | ⏳ |
| GET | `/inventory/audit-logs` | None | ⏳ |

### F. Catalog Management (`/catalogs`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/catalogs` | Catalog data | ⏳ |
| GET | `/catalogs` | None | ⏳ |
| GET | `/catalogs/:id` | Param: catalog ID | ⏳ |
| PUT | `/catalogs/:id` | Updated catalog data | ⏳ |
| DELETE | `/catalogs/:id` | Param: catalog ID | ⏳ |
| POST | `/catalogs/:catalogId/items` | Item data | ⏳ |
| GET | `/catalogs/:catalogId/items` | None | ⏳ |
| POST | `/catalogs/:catalogId/publish` | None | ⏳ |
| POST | `/catalogs/:catalogId/share` | `{"recipientOrgId": "..."}` | ⏳ |
| GET | `/catalogs/:catalogId/analytics` | None | ⏳ |

### G. LLM Integration (`/llm`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/llm/chat` | Conversation data | ⏳ |
| POST | `/llm/chat/:conversationId/messages` | `{"message": "...", "role": "user"}` | ⏳ |
| GET | `/llm/conversations/:id` | Param: conversation ID | ⏳ |
| POST | `/llm/content-generation` | `{"prompt": "...", "contentType": "..."}` | ⏳ |
| POST | `/llm/analysis` | `{"entityType": "...", "entityId": "..."}` | ⏳ |
| POST | `/llm/sentiment` | `{"customerId": "..."}` | ⏳ |
| POST | `/llm/email-copy` | Email data | ⏳ |
| POST | `/llm/summarize` | `{"text": "..."}` | ⏳ |
| GET | `/llm/models` | None | ⏳ |

### H. Real-Time Analytics (`/real-time`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| GET | `/real-time/metrics/live` | None | ⏳ |
| POST | `/real-time/events` | Event data | ⏳ |
| GET | `/real-time/dashboard/:dashboardId` | Param: dashboard ID | ⏳ |
| POST | `/real-time/alerts` | Alert data | ⏳ |
| GET | `/real-time/alerts` | None | ⏳ |
| PUT | `/real-time/alerts/:id` | Updated alert data | ⏳ |
| GET | `/real-time/customer-activity/live` | None | ⏳ |
| GET | `/real-time/conversions/live` | None | ⏳ |

---

## 2️⃣ CORE CRM APIs (EXISTING)

### Authentication (`/auth`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/auth/register` | User registration data | ⏳ |
| POST | `/auth/login` | `{"email": "...", "password": "..."}` | ⏳ |
| POST | `/auth/verify-email` | Verification token | ⏳ |
| POST | `/auth/forgot-password` | `{"email": "..."}` | ⏳ |
| POST | `/auth/reset-password` | Reset token + new password | ⏳ |

### Organizations (`/organizations`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/organizations` | Organization data | ⏳ |
| GET | `/organizations` | None | ⏳ |
| GET | `/organizations/:id` | Param: org ID | ⏳ |
| PUT | `/organizations/:id` | Updated org data | ⏳ |
| DELETE | `/organizations/:id` | Param: org ID | ⏳ |

### Customers (`/crm/customers`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/crm/customers` | Customer data | ⏳ |
| GET | `/crm/customers` | Query params | ⏳ |
| GET | `/crm/customers/:id` | Param: customer ID | ⏳ |
| PUT | `/crm/customers/:id` | Updated customer data | ⏳ |
| DELETE | `/crm/customers/:id` | Param: customer ID | ⏳ |
| POST | `/crm/customers/bulk` | Array of customers | ⏳ |
| POST | `/crm/customers/search` | Search criteria | ⏳ |
| GET | `/crm/customers/:id/activities` | Param: customer ID | ⏳ |

### Sales (`/crm/sales`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/crm/sales/opportunities` | Opportunity data | ⏳ |
| GET | `/crm/sales/opportunities` | None | ⏳ |
| GET | `/crm/sales/opportunities/:id` | Param: opportunity ID | ⏳ |
| PUT | `/crm/sales/opportunities/:id` | Updated data | ⏳ |
| POST | `/crm/sales/quotes` | Quote data | ⏳ |
| GET | `/crm/sales/pipeline` | None | ⏳ |

### Marketing (`/crm/marketing`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/crm/marketing/campaigns` | Campaign data | ⏳ |
| GET | `/crm/marketing/campaigns` | None | ⏳ |
| GET | `/crm/marketing/campaigns/:id` | Param: campaign ID | ⏳ |
| POST | `/crm/marketing/campaigns/:id/send` | None | ⏳ |
| GET | `/crm/marketing/campaigns/:id/analytics` | None | ⏳ |

### Products (`/products`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/products` | Product data | ⏳ |
| GET | `/products` | None | ⏳ |
| GET | `/products/:id` | Param: product ID | ⏳ |
| PUT | `/products/:id` | Updated product data | ⏳ |
| DELETE | `/products/:id` | Param: product ID | ⏳ |

### Categories (`/categories`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/categories` | Category data | ⏳ |
| GET | `/categories` | None | ⏳ |
| GET | `/categories/:id` | Param: category ID | ⏳ |

### Bundles (`/bundles`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/bundles` | Bundle data | ⏳ |
| GET | `/bundles` | None | ⏳ |
| GET | `/bundles/:id` | Param: bundle ID | ⏳ |

### Price Lists (`/price-lists`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/price-lists` | Price list data | ⏳ |
| GET | `/price-lists` | None | ⏳ |
| GET | `/price-lists/:id` | Param: price list ID | ⏳ |

### Discounts (`/discounts`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/discounts` | Discount data | ⏳ |
| GET | `/discounts` | None | ⏳ |
| GET | `/discounts/:id` | Param: discount ID | ⏳ |

### Activities (`/activity`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/activity` | Activity data | ⏳ |
| GET | `/activity` | Query params | ⏳ |
| GET | `/activity/:id` | Param: activity ID | ⏳ |

### Documents (`/documents`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/documents` | Document data (multipart) | ⏳ |
| GET | `/documents` | None | ⏳ |
| GET | `/documents/:id` | Param: document ID | ⏳ |
| DELETE | `/documents/:id` | Param: document ID | ⏳ |

### Email (`/email`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/email/send` | Email data | ⏳ |
| GET | `/email/templates` | None | ⏳ |
| POST | `/email/templates` | Template data | ⏳ |

### Forms (`/forms`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/forms` | Form data | ⏳ |
| GET | `/forms` | None | ⏳ |
| GET | `/forms/:id` | Param: form ID | ⏳ |
| POST | `/forms/:id/submissions` | Submission data | ⏳ |

### Dashboards (`/dashboards`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| GET | `/dashboards` | None | ⏳ |
| GET | `/dashboards/:id` | Param: dashboard ID | ⏳ |
| POST | `/dashboards` | Dashboard data | ⏳ |

### Reporting (`/reporting`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/reporting/generate` | Report params | ⏳ |
| GET | `/reporting/reports` | None | ⏳ |
| GET | `/reporting/reports/:id` | Param: report ID | ⏳ |
| POST | `/reporting/schedule` | Schedule data | ⏳ |

### Notifications (`/notifications`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| GET | `/notifications` | None | ⏳ |
| PUT | `/notifications/:id/read` | Param: notification ID | ⏳ |
| POST | `/notifications/send` | Notification data | ⏳ |

### Sequences (`/sequences`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/sequences` | Sequence data | ⏳ |
| GET | `/sequences` | None | ⏳ |
| GET | `/sequences/:id` | Param: sequence ID | ⏳ |
| POST | `/sequences/:id/enroll` | `{"contactIds": [...]}` | ⏳ |

### Territories (`/territories`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/territories` | Territory data | ⏳ |
| GET | `/territories` | None | ⏳ |
| GET | `/territories/:id` | Param: territory ID | ⏳ |

### Support (`/api/crm/support`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/api/crm/support/tickets` | Ticket data | ⏳ |
| GET | `/api/crm/support/tickets` | None | ⏳ |
| GET | `/api/crm/support/tickets/:id` | Param: ticket ID | ⏳ |

### Telephony (`/calls`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/calls` | Call data | ⏳ |
| GET | `/calls` | None | ⏳ |
| GET | `/calls/:id` | Param: call ID | ⏳ |

### Call Queues (`/call-queues`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/call-queues` | Queue data | ⏳ |
| GET | `/call-queues` | None | ⏳ |

### Call Analytics (`/call-analytics`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| GET | `/call-analytics` | None | ⏳ |

---

## 3️⃣ PLATFORM APIs

### Subscription Plans (`/subscription-plans`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| GET | `/subscription-plans` | None | ⏳ |
| POST | `/subscription-plans` | Plan data | ⏳ |

### Billing Transactions (`/billing-transactions`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| GET | `/billing-transactions` | None | ⏳ |
| GET | `/billing-transactions/:id` | Param: transaction ID | ⏳ |

### Stripe Payments (`/stripe`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/stripe/create-payment-intent` | Payment data | ⏳ |
| POST | `/stripe/create-subscription` | Subscription data | ⏳ |

### Stripe Webhooks (`/webhooks/stripe`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/webhooks/stripe` | Stripe event data | ⏳ |

### Usage Tracking (`/usage`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/usage/track` | Usage data | ⏳ |
| GET | `/usage` | None | ⏳ |

### Audit Logs (`/audit-logs`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| GET | `/audit-logs` | None | ⏳ |
| GET | `/audit-logs/:id` | Param: log ID | ⏳ |

### Monitoring (`/monitoring`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| GET | `/monitoring/health` | None | ⏳ |
| GET | `/monitoring/metrics` | None | ⏳ |

### Performance (`/performance`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| GET | `/performance/metrics` | None | ⏳ |

### Throttling (`/throttling`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| GET | `/throttling/status` | None | ⏳ |

### Migration (`/migration`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/migration/import` | Import data | ⏳ |
| GET | `/migration/status` | None | ⏳ |

### Import/Export (`/import-export`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/import-export/import` | Import data | ⏳ |
| POST | `/import-export/export` | Export params | ⏳ |

### Onboarding (`/onboarding`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/onboarding/start` | Onboarding data | ⏳ |
| GET | `/onboarding/status` | None | ⏳ |

### Portal (`/portal`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| GET | `/portal/config` | None | ⏳ |
| PUT | `/portal/config` | Config data | ⏳ |

### Mobile Devices (`/mobile/devices`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/mobile/devices/register` | Device data | ⏳ |
| GET | `/mobile/devices` | None | ⏳ |

### Mobile Notifications (`/mobile/notifications`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/mobile/notifications/send` | Notification data | ⏳ |

### Mobile Sync (`/mobile/sync`)
| Method | Endpoint | Body/Params | Status |
|--------|----------|-------------|---------|
| POST | `/mobile/sync` | Sync data | ⏳ |

---

## 📊 SUMMARY
- **Total Controllers:** 41+
- **Total Endpoints:** 200+
- **Industry 5.0 New Endpoints:** 65
- **Base URL:** `http://localhost:3003/api/v1`

## 🔍 COMMON 404 ERRORS - ROOT CAUSES

1. **Missing `/api/v1` prefix** - All routes need the base URL
2. **Wrong controller path** - Check @Controller() decorator
3. **Controller not registered** in `crm.module.ts`
4. **Server not running** on port 3003
5. **Route typo** - Check exact spelling

## ✅ TESTING CHECKLIST

1. Start server: `npm run start:dev`
2. Verify server is running on port 3003
3. Check terminal for compilation errors
4. Test with correct base URL: `http://localhost:3003/api/v1`
5. For POST/PUT requests, set `Content-Type: application/json` header
6. Use valid UUID format for `organizationId`: `00000000-0000-0000-0000-000000000001`

---

**Last Updated:** January 17, 2026
**Server Port:** 3003
**Database:** PostgreSQL (localhost:5432)
