# CognexiaAI CRM - Complete API Documentation
## Backend Module: 03-CRM

**Base URL**: `http://localhost:3000/api`  
**Total Controllers**: 34  
**Estimated Total Endpoints**: 200+

---

## 📋 Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [CRM Core APIs](#crm-core-apis)
3. [Customer Management APIs](#customer-management-apis)
4. [Dashboard APIs](#dashboard-apis)
5. [Sales & Marketing APIs](#sales--marketing-apis)
6. [Support & Ticketing APIs](#support--ticketing-apis)
7. [Analytics & Reporting APIs](#analytics--reporting-apis)
8. [Integration APIs](#integration-apis)
9. [Admin & System APIs](#admin--system-apis)
10. [Specialized APIs](#specialized-apis)

---

## 1. Authentication APIs
**Controller**: `auth.controller.ts`  
**Base Route**: `/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | User registration with organization creation | No (Public) |
| POST | `/auth/login` | User login | No (Public) |
| POST | `/auth/logout` | User logout | Yes |
| POST | `/auth/refresh` | Refresh access token | No (Public) |
| POST | `/auth/password-reset/request` | Request password reset | No (Public) |
| POST | `/auth/password-reset/confirm` | Confirm password reset | No (Public) |
| POST | `/auth/verify-email/send` | Send email verification | Yes |
| POST | `/auth/verify-email/confirm` | Confirm email verification | No (Public) |
| GET | `/auth/me` | Get current user info | Yes |

**Total**: 9 endpoints

---

## 2. CRM Core APIs
**Controller**: `crm.controller.ts`  
**Base Route**: `/crm`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/crm/customers` | Get all customers with filtering | Yes |
| GET | `/crm/leads` | Get all leads with scoring | Yes |
| POST | `/crm/leads` | Create new lead with auto-scoring | Yes |
| GET | `/crm/pipeline` | Get sales pipeline & forecasting | Yes |
| GET | `/crm/analytics/overview` | Get CRM analytics overview | Yes |
| GET | `/crm/customers/:id/interactions` | Get customer interaction history | Yes |

**Query Parameters**:
- Customers: `page`, `limit`, `segment`, `region`, `industry`, `status`
- Leads: `status`, `source`, `score`
- Pipeline: `timeframe`, `salesRep`
- Analytics: `timeRange` (7d, 30d, 90d, 1y)

**Total**: 6 endpoints

---

## 3. Customer Management APIs
**Controller**: `customer.controller.ts`  
**Base Route**: `/crm/customers`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/crm/customers/:id/contacts` | Get customer contacts | Yes |
| POST | `/crm/customers/:id/contacts` | Create customer contact | Yes |
| PUT | `/crm/customers/contacts/:contactId` | Update customer contact | Yes |
| POST | `/crm/customers/:id/interactions` | Create customer interaction | Yes |
| GET | `/crm/customers/:id/health` | Get customer health score | Yes |
| POST | `/crm/customers/segment` | Segment customers by criteria | Yes |
| GET | `/crm/customers/:id/timeline` | Get customer timeline | Yes |
| GET | `/crm/customers/analytics/churn-risk` | Get churn risk analysis | Yes |
| GET | `/crm/customers/analytics/lifetime-value` | Get CLV analysis | Yes |

**Total**: 9 endpoints

---

## 4. Dashboard APIs
**Controller**: `dashboard.controller.ts`  
**Base Route**: `/dashboards`

### Super Admin Dashboard APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboards/admin/platform-metrics` | Platform-wide metrics | SUPER_ADMIN |
| GET | `/dashboards/admin/revenue-metrics` | Revenue metrics | SUPER_ADMIN |
| GET | `/dashboards/admin/usage-metrics` | Usage metrics | SUPER_ADMIN |
| GET | `/dashboards/admin/top-organizations` | Top organizations by revenue | SUPER_ADMIN |
| GET | `/dashboards/admin/organization-health/:orgId` | Organization health | SUPER_ADMIN |
| GET | `/dashboards/admin/organizations-at-risk` | Organizations at risk | SUPER_ADMIN |
| GET | `/dashboards/admin/growth-statistics` | Growth statistics | SUPER_ADMIN |
| GET | `/dashboards/admin/system-health` | System health status | SUPER_ADMIN |
| GET | `/dashboards/admin/plan-distribution` | Subscription plan distribution | SUPER_ADMIN |

### User Dashboard APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboards/user/metrics` | User dashboard metrics | ORG_USER |
| GET | `/dashboards/user/sales-funnel` | Sales funnel data | ORG_USER |
| GET | `/dashboards/user/recent-activities` | Recent activities | ORG_USER |
| GET | `/dashboards/user/performance-metrics` | Performance metrics | ORG_USER |

### Custom Dashboard APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboards/custom` | Get user's custom dashboards | ORG_USER |
| POST | `/dashboards/custom` | Create custom dashboard | ORG_USER |
| GET | `/dashboards/custom/:id` | Get dashboard by ID | ORG_USER |
| PUT | `/dashboards/custom/:id` | Update dashboard | ORG_USER |
| DELETE | `/dashboards/custom/:id` | Delete dashboard | ORG_USER |

**Total**: 18 endpoints

---

## 5. Sales & Marketing APIs

### Sales APIs
**Controller**: `sales.controller.ts`  
**Base Route**: `/sales`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/sales/opportunities` | Get all opportunities | Yes |
| POST | `/sales/opportunities` | Create opportunity | Yes |
| GET | `/sales/opportunities/:id` | Get opportunity by ID | Yes |
| PUT | `/sales/opportunities/:id` | Update opportunity | Yes |
| GET | `/sales/forecasts` | Get sales forecasts | Yes |
| GET | `/sales/performance` | Get sales performance | Yes |

**Total**: 6 endpoints

### Marketing APIs
**Controller**: `marketing.controller.ts`  
**Base Route**: `/marketing`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/marketing/campaigns` | Get all campaigns | Yes |
| POST | `/marketing/campaigns` | Create campaign | Yes |
| GET | `/marketing/campaigns/:id` | Get campaign by ID | Yes |
| PUT | `/marketing/campaigns/:id` | Update campaign | Yes |
| DELETE | `/marketing/campaigns/:id` | Delete campaign | Yes |
| POST | `/marketing/campaigns/:id/launch` | Launch campaign | Yes |
| GET | `/marketing/campaigns/:id/performance` | Get campaign performance | Yes |
| GET | `/marketing/email-templates` | Get email templates | Yes |
| POST | `/marketing/email-templates` | Create email template | Yes |
| GET | `/marketing/segments` | Get customer segments | Yes |
| POST | `/marketing/segments` | Create segment | Yes |
| GET | `/marketing/automation` | Get automation workflows | Yes |
| POST | `/marketing/automation` | Create automation | Yes |
| GET | `/marketing/analytics` | Get marketing analytics | Yes |
| GET | `/marketing/attribution` | Get attribution data | Yes |
| GET | `/marketing/roi` | Get marketing ROI | Yes |
| POST | `/marketing/ab-tests` | Create A/B test | Yes |
| GET | `/marketing/ab-tests/:id` | Get A/B test results | Yes |
| GET | `/marketing/lead-sources` | Get lead sources | Yes |

**Total**: 19 endpoints

### Sequence APIs
**Controller**: `sequence.controller.ts`  
**Base Route**: `/sequences`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/sequences` | Get all sequences | Yes |
| POST | `/sequences` | Create sequence | Yes |
| GET | `/sequences/:id` | Get sequence by ID | Yes |
| PUT | `/sequences/:id` | Update sequence | Yes |
| DELETE | `/sequences/:id` | Delete sequence | Yes |
| POST | `/sequences/:id/activate` | Activate sequence | Yes |
| POST | `/sequences/:id/deactivate` | Deactivate sequence | Yes |
| GET | `/sequences/:id/steps` | Get sequence steps | Yes |
| POST | `/sequences/:id/steps` | Add sequence step | Yes |
| GET | `/sequences/:id/analytics` | Get sequence analytics | Yes |
| POST | `/sequences/:id/enroll` | Enroll contacts | Yes |
| DELETE | `/sequences/:id/unenroll/:contactId` | Unenroll contact | Yes |
| GET | `/sequences/:id/enrollments` | Get enrollments | Yes |
| GET | `/sequences/templates` | Get sequence templates | Yes |
| POST | `/sequences/:id/clone` | Clone sequence | Yes |
| GET | `/sequences/:id/performance` | Get performance metrics | Yes |

**Total**: 16 endpoints

---

## 6. Support & Ticketing APIs
**Controller**: `support.controller.ts`  
**Base Route**: `/support`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/support/tickets` | Get all tickets | Yes |
| POST | `/support/tickets` | Create ticket | Yes |
| GET | `/support/tickets/:id` | Get ticket by ID | Yes |
| PUT | `/support/tickets/:id` | Update ticket | Yes |
| POST | `/support/tickets/:id/comments` | Add comment | Yes |
| POST | `/support/tickets/:id/assign` | Assign ticket | Yes |
| PUT | `/support/tickets/:id/status` | Update status | Yes |
| GET | `/support/tickets/:id/history` | Get ticket history | Yes |
| GET | `/support/tickets/:id/sla` | Get SLA status | Yes |
| GET | `/support/knowledge-base` | Get KB articles | Yes |
| POST | `/support/knowledge-base` | Create KB article | Yes |

**Total**: 11 endpoints

---

## 7. Analytics & Reporting APIs

### Reporting APIs
**Controller**: `reporting.controller.ts`  
**Base Route**: `/reporting`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/reporting/reports` | Get all reports | Yes |
| POST | `/reporting/reports` | Create report | Yes |
| GET | `/reporting/reports/:id` | Get report by ID | Yes |
| PUT | `/reporting/reports/:id` | Update report | Yes |
| DELETE | `/reporting/reports/:id` | Delete report | Yes |
| POST | `/reporting/reports/:id/run` | Run report | Yes |
| GET | `/reporting/reports/:id/results` | Get report results | Yes |
| POST | `/reporting/reports/:id/schedule` | Schedule report | Yes |
| GET | `/reporting/reports/:id/exports` | Get exports | Yes |
| POST | `/reporting/reports/:id/export` | Export report | Yes |
| GET | `/reporting/dashboards` | Get report dashboards | Yes |
| POST | `/reporting/custom-query` | Run custom query | Yes |
| GET | `/reporting/templates` | Get report templates | Yes |
| POST | `/reporting/templates` | Create template | Yes |
| GET | `/reporting/metrics` | Get key metrics | Yes |
| GET | `/reporting/analytics` | Get analytics data | Yes |
| POST | `/reporting/data-sources` | Configure data source | Yes |
| GET | `/reporting/scheduled` | Get scheduled reports | Yes |
| GET | `/reporting/history` | Get report history | Yes |

**Total**: 19 endpoints

### Performance APIs
**Controller**: `performance.controller.ts`  
**Base Route**: `/performance`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/performance/metrics` | Get performance metrics | Yes |
| GET | `/performance/sales-metrics` | Get sales performance | Yes |
| GET | `/performance/team-metrics` | Get team performance | Yes |
| GET | `/performance/individual/:userId` | Get individual performance | Yes |
| GET | `/performance/goals` | Get performance goals | Yes |
| POST | `/performance/goals` | Create goal | Yes |
| PUT | `/performance/goals/:id` | Update goal | Yes |
| GET | `/performance/leaderboard` | Get leaderboard | Yes |
| GET | `/performance/benchmarks` | Get benchmarks | Yes |
| GET | `/performance/trends` | Get performance trends | Yes |
| GET | `/performance/comparisons` | Get comparisons | Yes |
| GET | `/performance/scorecards` | Get scorecards | Yes |
| GET | `/performance/reviews` | Get performance reviews | Yes |

**Total**: 13 endpoints

---

## 8. Integration APIs

### CRM AI Integration APIs
**Controller**: `crm-ai-integration.controller.ts`  
**Base Route**: `/ai`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/ai/predict-lead-score` | AI lead scoring | Yes |
| POST | `/ai/predict-churn` | AI churn prediction | Yes |
| POST | `/ai/recommend-next-action` | AI action recommendations | Yes |
| POST | `/ai/sentiment-analysis` | Sentiment analysis | Yes |
| POST | `/ai/customer-insights` | AI customer insights | Yes |
| POST | `/ai/forecast` | AI sales forecasting | Yes |
| GET | `/ai/models` | Get AI models | Yes |

**Total**: 7 endpoints

### Import/Export APIs
**Controller**: `import-export.controller.ts`  
**Base Route**: `/import-export`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/import-export/import` | Import data | Yes |
| GET | `/import-export/import/:id` | Get import status | Yes |
| POST | `/import-export/export` | Export data | Yes |
| GET | `/import-export/export/:id` | Get export status | Yes |
| GET | `/import-export/templates` | Get import templates | Yes |
| POST | `/import-export/validate` | Validate import data | Yes |
| GET | `/import-export/history` | Get import/export history | Yes |
| GET | `/import-export/mappings` | Get field mappings | Yes |

**Total**: 8 endpoints

### Migration APIs
**Controller**: `migration.controller.ts`  
**Base Route**: `/migration`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/migration/salesforce/start` | Start Salesforce migration | Yes |
| GET | `/migration/salesforce/status/:id` | Get migration status | Yes |
| POST | `/migration/hubspot/start` | Start HubSpot migration | Yes |
| GET | `/migration/hubspot/status/:id` | Get migration status | Yes |
| POST | `/migration/zoho/start` | Start Zoho migration | Yes |
| POST | `/migration/sap/start` | Start SAP migration | Yes |
| POST | `/migration/oracle/start` | Start Oracle migration | Yes |
| POST | `/migration/custom/start` | Start custom migration | Yes |
| GET | `/migration/jobs` | Get migration jobs | Yes |
| GET | `/migration/jobs/:id` | Get job details | Yes |
| PUT | `/migration/jobs/:id/cancel` | Cancel migration | Yes |
| GET | `/migration/history` | Get migration history | Yes |
| POST | `/migration/rollback/:id` | Rollback migration | Yes |
| GET | `/migration/mappings` | Get field mappings | Yes |
| POST | `/migration/validate` | Validate migration data | Yes |

**Total**: 15 endpoints

### Telephony APIs
**Controller**: `telephony.controller.ts`  
**Base Route**: `/telephony`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/telephony/calls` | Get all calls | Yes |
| POST | `/telephony/calls` | Initiate call | Yes |
| GET | `/telephony/calls/:id` | Get call details | Yes |
| PUT | `/telephony/calls/:id` | Update call | Yes |
| POST | `/telephony/calls/:id/end` | End call | Yes |
| POST | `/telephony/calls/:id/record` | Record call | Yes |
| GET | `/telephony/calls/:id/recording` | Get recording | Yes |
| POST | `/telephony/calls/:id/transfer` | Transfer call | Yes |
| POST | `/telephony/calls/:id/hold` | Put call on hold | Yes |
| POST | `/telephony/calls/:id/mute` | Mute call | Yes |
| GET | `/telephony/call-logs` | Get call logs | Yes |
| GET | `/telephony/analytics` | Get call analytics | Yes |
| GET | `/telephony/queues` | Get call queues | Yes |
| POST | `/telephony/queues` | Create queue | Yes |
| PUT | `/telephony/queues/:id` | Update queue | Yes |
| GET | `/telephony/queues/:id/calls` | Get queue calls | Yes |
| POST | `/telephony/voicemail` | Leave voicemail | Yes |
| GET | `/telephony/voicemail/:id` | Get voicemail | Yes |
| GET | `/telephony/settings` | Get telephony settings | Yes |
| PUT | `/telephony/settings` | Update settings | Yes |
| GET | `/telephony/numbers` | Get phone numbers | Yes |
| POST | `/telephony/numbers` | Add phone number | Yes |
| DELETE | `/telephony/numbers/:id` | Remove phone number | Yes |
| GET | `/telephony/call-routes` | Get call routes | Yes |
| POST | `/telephony/call-routes` | Create call route | Yes |
| GET | `/telephony/transcripts/:id` | Get call transcript | Yes |
| GET | `/telephony/performance` | Get performance metrics | Yes |
| GET | `/telephony/recordings/analytics` | Get recording analytics | Yes |

**Total**: 28 endpoints

---

## 9. Admin & System APIs

### Organization APIs
**Controller**: `organization.controller.ts`  
**Base Route**: `/organizations`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/organizations` | Get all organizations | SUPER_ADMIN |
| POST | `/organizations` | Create organization | SUPER_ADMIN |
| GET | `/organizations/:id` | Get organization by ID | Yes |
| PUT | `/organizations/:id` | Update organization | ORG_ADMIN |
| DELETE | `/organizations/:id` | Delete organization | SUPER_ADMIN |
| GET | `/organizations/:id/users` | Get organization users | ORG_ADMIN |
| POST | `/organizations/:id/users` | Add user to organization | ORG_ADMIN |
| GET | `/organizations/:id/settings` | Get settings | ORG_ADMIN |
| PUT | `/organizations/:id/settings` | Update settings | ORG_ADMIN |

**Total**: 9 endpoints

### Audit Log APIs
**Controller**: `audit-log.controller.ts`  
**Base Route**: `/audit-logs`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/audit-logs` | Get all audit logs | ADMIN |
| GET | `/audit-logs/:id` | Get log by ID | ADMIN |
| GET | `/audit-logs/user/:userId` | Get user logs | ADMIN |
| GET | `/audit-logs/entity/:entityType/:entityId` | Get entity logs | ADMIN |
| GET | `/audit-logs/search` | Search audit logs | ADMIN |
| POST | `/audit-logs/export` | Export audit logs | ADMIN |
| GET | `/audit-logs/compliance` | Get compliance logs | ADMIN |

**Total**: 7 endpoints

### Monitoring APIs
**Controller**: `monitoring.controller.ts`  
**Base Route**: `/monitoring`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/monitoring/health` | System health check | ADMIN |
| GET | `/monitoring/metrics` | Get system metrics | ADMIN |
| GET | `/monitoring/performance` | Get performance metrics | ADMIN |
| GET | `/monitoring/errors` | Get error logs | ADMIN |
| GET | `/monitoring/logs` | Get system logs | ADMIN |
| GET | `/monitoring/api-usage` | Get API usage | ADMIN |
| GET | `/monitoring/database` | Get DB metrics | ADMIN |
| GET | `/monitoring/cache` | Get cache metrics | ADMIN |
| GET | `/monitoring/queue` | Get queue metrics | ADMIN |
| GET | `/monitoring/alerts` | Get system alerts | ADMIN |
| POST | `/monitoring/alerts` | Create alert | ADMIN |

**Total**: 11 endpoints

### Throttling APIs
**Controller**: `throttling.controller.ts`  
**Base Route**: `/throttling`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/throttling/limits` | Get rate limits | ADMIN |
| PUT | `/throttling/limits/:userId` | Update user limits | ADMIN |
| GET | `/throttling/usage/:userId` | Get usage stats | ADMIN |
| GET | `/throttling/violations` | Get violations | ADMIN |
| POST | `/throttling/whitelist` | Add to whitelist | ADMIN |
| DELETE | `/throttling/whitelist/:id` | Remove from whitelist | ADMIN |
| GET | `/throttling/blacklist` | Get blacklist | ADMIN |
| POST | `/throttling/blacklist` | Add to blacklist | ADMIN |
| DELETE | `/throttling/blacklist/:id` | Remove from blacklist | ADMIN |
| GET | `/throttling/rules` | Get throttling rules | ADMIN |
| POST | `/throttling/rules` | Create rule | ADMIN |
| PUT | `/throttling/rules/:id` | Update rule | ADMIN |

**Total**: 12 endpoints

### Usage Tracking APIs
**Controller**: `usage-tracking.controller.ts`  
**Base Route**: `/usage`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/usage/overview` | Get usage overview | ADMIN |
| GET | `/usage/features` | Get feature usage | ADMIN |
| GET | `/usage/users` | Get user activity | ADMIN |
| GET | `/usage/api-calls` | Get API usage | ADMIN |
| GET | `/usage/storage` | Get storage usage | ADMIN |
| GET | `/usage/bandwidth` | Get bandwidth usage | ADMIN |
| GET | `/usage/limits` | Get usage limits | Yes |
| GET | `/usage/forecast` | Get usage forecast | ADMIN |
| POST | `/usage/export` | Export usage data | ADMIN |
| GET | `/usage/trends` | Get usage trends | ADMIN |

**Total**: 10 endpoints

---

## 10. Specialized APIs

### Activity APIs
**Controller**: `activity.controller.ts`  
**Base Route**: `/activities`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/activities` | Get all activities | Yes |
| POST | `/activities` | Create activity | Yes |
| GET | `/activities/:id` | Get activity by ID | Yes |
| PUT | `/activities/:id` | Update activity | Yes |
| DELETE | `/activities/:id` | Delete activity | Yes |
| GET | `/activities/types` | Get activity types | Yes |
| GET | `/activities/user/:userId` | Get user activities | Yes |
| GET | `/activities/customer/:customerId` | Get customer activities | Yes |
| GET | `/activities/opportunity/:oppId` | Get opportunity activities | Yes |
| GET | `/activities/upcoming` | Get upcoming activities | Yes |
| GET | `/activities/overdue` | Get overdue activities | Yes |
| POST | `/activities/:id/complete` | Complete activity | Yes |
| GET | `/activities/timeline` | Get activity timeline | Yes |
| GET | `/activities/calendar` | Get calendar view | Yes |
| POST | `/activities/bulk-create` | Create multiple activities | Yes |

**Total**: 15 endpoints

### Document APIs
**Controller**: `document.controller.ts`  
**Base Route**: `/documents`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/documents` | Get all documents | Yes |
| POST | `/documents` | Upload document | Yes |
| GET | `/documents/:id` | Get document by ID | Yes |
| PUT | `/documents/:id` | Update document | Yes |
| DELETE | `/documents/:id` | Delete document | Yes |
| GET | `/documents/:id/download` | Download document | Yes |
| POST | `/documents/:id/share` | Share document | Yes |
| GET | `/documents/:id/versions` | Get document versions | Yes |
| POST | `/documents/:id/versions` | Create new version | Yes |
| GET | `/documents/folders` | Get folders | Yes |
| POST | `/documents/folders` | Create folder | Yes |
| PUT | `/documents/folders/:id` | Update folder | Yes |
| DELETE | `/documents/folders/:id` | Delete folder | Yes |
| GET | `/documents/search` | Search documents | Yes |
| POST | `/documents/bulk-upload` | Bulk upload | Yes |
| GET | `/documents/:id/metadata` | Get metadata | Yes |
| PUT | `/documents/:id/metadata` | Update metadata | Yes |
| GET | `/documents/:id/preview` | Preview document | Yes |
| POST | `/documents/:id/convert` | Convert document | Yes |
| GET | `/documents/templates` | Get document templates | Yes |
| POST | `/documents/templates` | Create template | Yes |
| GET | `/documents/:id/audit` | Get document audit log | Yes |
| POST | `/documents/:id/sign` | E-signature request | Yes |
| GET | `/documents/:id/signatures` | Get signature status | Yes |
| GET | `/documents/storage/usage` | Get storage usage | Yes |
| POST | `/documents/:id/archive` | Archive document | Yes |
| POST | `/documents/:id/restore` | Restore document | Yes |
| GET | `/documents/tags` | Get document tags | Yes |
| POST | `/documents/:id/tags` | Add tags | Yes |
| DELETE | `/documents/:id/tags/:tagId` | Remove tag | Yes |

**Total**: 30 endpoints

### Email APIs
**Controller**: `email.controller.ts`  
**Base Route**: `/email`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/email/send` | Send email | Yes |
| GET | `/email/templates` | Get email templates | Yes |
| POST | `/email/templates` | Create template | Yes |
| PUT | `/email/templates/:id` | Update template | Yes |
| DELETE | `/email/templates/:id` | Delete template | Yes |
| GET | `/email/sent` | Get sent emails | Yes |
| GET | `/email/:id` | Get email by ID | Yes |
| POST | `/email/track` | Track email opens/clicks | Yes |
| GET | `/email/analytics` | Get email analytics | Yes |

**Total**: 9 endpoints

### Form APIs
**Controller**: `form.controller.ts`  
**Base Route**: `/forms`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/forms` | Get all forms | Yes |
| POST | `/forms` | Create form | Yes |
| GET | `/forms/:id` | Get form by ID | Yes |
| PUT | `/forms/:id` | Update form | Yes |
| DELETE | `/forms/:id` | Delete form | Yes |
| POST | `/forms/:id/publish` | Publish form | Yes |
| POST | `/forms/:id/submissions` | Submit form | No (Public) |
| GET | `/forms/:id/submissions` | Get submissions | Yes |
| GET | `/forms/:id/analytics` | Get form analytics | Yes |
| GET | `/forms/templates` | Get form templates | Yes |
| POST | `/forms/:id/clone` | Clone form | Yes |
| GET | `/forms/:id/embed-code` | Get embed code | Yes |
| POST | `/forms/:id/webhooks` | Configure webhook | Yes |
| GET | `/forms/:id/fields` | Get form fields | Yes |

**Total**: 14 endpoints

### Mobile APIs
**Controller**: `mobile.controller.ts`  
**Base Route**: `/mobile`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/mobile/sync` | Sync mobile data | Yes |
| POST | `/mobile/push-tokens` | Register push token | Yes |
| POST | `/mobile/notifications/send` | Send push notification | Yes |
| GET | `/mobile/app-config` | Get app configuration | Yes |
| GET | `/mobile/offline-data` | Get offline data | Yes |
| POST | `/mobile/offline-sync` | Sync offline changes | Yes |
| GET | `/mobile/dashboard` | Get mobile dashboard | Yes |
| GET | `/mobile/quick-actions` | Get quick actions | Yes |
| POST | `/mobile/location` | Update location | Yes |
| GET | `/mobile/nearby` | Get nearby customers | Yes |
| GET | `/mobile/checkins` | Get check-ins | Yes |
| POST | `/mobile/checkins` | Create check-in | Yes |
| GET | `/mobile/activity-feed` | Get activity feed | Yes |
| POST | `/mobile/voice-notes` | Upload voice note | Yes |
| GET | `/mobile/analytics` | Get mobile analytics | Yes |
| POST | `/mobile/feedback` | Submit feedback | Yes |
| GET | `/mobile/updates` | Check for updates | Yes |

**Total**: 17 endpoints

### Notification APIs
**Controller**: `notification.controller.ts`  
**Base Route**: `/notifications`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notifications` | Get all notifications | Yes |
| POST | `/notifications` | Create notification | Yes |
| GET | `/notifications/:id` | Get notification by ID | Yes |
| PUT | `/notifications/:id/read` | Mark as read | Yes |
| PUT | `/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/notifications/:id` | Delete notification | Yes |
| GET | `/notifications/preferences` | Get preferences | Yes |
| PUT | `/notifications/preferences` | Update preferences | Yes |
| GET | `/notifications/unread-count` | Get unread count | Yes |
| POST | `/notifications/subscribe` | Subscribe to topic | Yes |

**Total**: 10 endpoints

### Onboarding APIs
**Controller**: `onboarding.controller.ts`  
**Base Route**: `/onboarding`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/onboarding/status` | Get onboarding status | Yes |
| POST | `/onboarding/start` | Start onboarding | Yes |
| POST | `/onboarding/steps/:stepId/complete` | Complete step | Yes |
| GET | `/onboarding/checklist` | Get checklist | Yes |
| POST | `/onboarding/skip/:stepId` | Skip step | Yes |
| GET | `/onboarding/tutorials` | Get tutorials | Yes |
| POST | `/onboarding/tutorials/:id/complete` | Complete tutorial | Yes |
| GET | `/onboarding/resources` | Get resources | Yes |
| POST | `/onboarding/feedback` | Submit feedback | Yes |
| GET | `/onboarding/progress` | Get progress | Yes |
| POST | `/onboarding/restart` | Restart onboarding | Yes |
| GET | `/onboarding/recommendations` | Get recommendations | Yes |

**Total**: 12 endpoints

### Portal APIs
**Controller**: `portal.controller.ts`  
**Base Route**: `/portal`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/portal/tickets` | Get portal tickets | Portal Auth |
| POST | `/portal/tickets` | Create ticket | Portal Auth |
| GET | `/portal/tickets/:id` | Get ticket details | Portal Auth |
| POST | `/portal/tickets/:id/comments` | Add comment | Portal Auth |
| GET | `/portal/knowledge-base` | Get KB articles | Portal Auth |
| GET | `/portal/knowledge-base/:id` | Get article | Portal Auth |
| POST | `/portal/knowledge-base/:id/helpful` | Mark helpful | Portal Auth |
| GET | `/portal/account` | Get account info | Portal Auth |
| PUT | `/portal/account` | Update account | Portal Auth |
| GET | `/portal/orders` | Get orders | Portal Auth |
| GET | `/portal/orders/:id` | Get order details | Portal Auth |
| GET | `/portal/invoices` | Get invoices | Portal Auth |
| GET | `/portal/documents` | Get documents | Portal Auth |

**Total**: 13 endpoints

### Pricing APIs
**Controller**: `pricing.controller.ts`  
**Base Route**: `/pricing`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/pricing/plans` | Get pricing plans | Yes |
| GET | `/pricing/plans/:id` | Get plan by ID | Yes |
| POST | `/pricing/calculate` | Calculate pricing | Yes |
| POST | `/pricing/quote` | Generate quote | Yes |
| GET | `/pricing/discounts` | Get discounts | Yes |
| POST | `/pricing/discounts` | Create discount | ADMIN |
| PUT | `/pricing/discounts/:id` | Update discount | ADMIN |
| DELETE | `/pricing/discounts/:id` | Delete discount | ADMIN |
| GET | `/pricing/rules` | Get pricing rules | Yes |
| POST | `/pricing/rules` | Create pricing rule | ADMIN |
| PUT | `/pricing/rules/:id` | Update rule | ADMIN |
| GET | `/pricing/tiers` | Get pricing tiers | Yes |
| POST | `/pricing/custom-quote` | Request custom quote | Yes |
| GET | `/pricing/currency-rates` | Get currency rates | Yes |
| POST | `/pricing/compare` | Compare plans | Yes |
| GET | `/pricing/addons` | Get add-ons | Yes |

**Total**: 16 endpoints

### Product APIs
**Controller**: `product.controller.ts`  
**Base Route**: `/products`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products` | Get all products | Yes |
| POST | `/products` | Create product | Yes |
| GET | `/products/:id` | Get product by ID | Yes |
| PUT | `/products/:id` | Update product | Yes |
| DELETE | `/products/:id` | Delete product | Yes |
| GET | `/products/:id/variants` | Get product variants | Yes |
| POST | `/products/:id/variants` | Create variant | Yes |
| PUT | `/products/variants/:id` | Update variant | Yes |
| DELETE | `/products/variants/:id` | Delete variant | Yes |
| GET | `/products/categories` | Get categories | Yes |
| POST | `/products/categories` | Create category | Yes |
| PUT | `/products/categories/:id` | Update category | Yes |
| DELETE | `/products/categories/:id` | Delete category | Yes |
| GET | `/products/:id/pricing` | Get product pricing | Yes |
| POST | `/products/:id/images` | Upload image | Yes |
| DELETE | `/products/images/:id` | Delete image | Yes |
| GET | `/products/inventory` | Get inventory | Yes |
| PUT | `/products/:id/inventory` | Update inventory | Yes |
| GET | `/products/catalog` | Get product catalog | Yes |
| POST | `/products/:id/clone` | Clone product | Yes |
| GET | `/products/:id/analytics` | Get product analytics | Yes |
| GET | `/products/recommendations` | Get recommendations | Yes |

**Total**: 22 endpoints

### Billing Transaction APIs
**Controller**: `billing-transaction.controller.ts`  
**Base Route**: `/billing`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/billing/transactions` | Get all transactions | Yes |
| POST | `/billing/transactions` | Create transaction | Yes |
| GET | `/billing/transactions/:id` | Get transaction | Yes |
| PUT | `/billing/transactions/:id` | Update transaction | Yes |
| GET | `/billing/invoices` | Get invoices | Yes |
| POST | `/billing/invoices` | Create invoice | Yes |
| GET | `/billing/invoices/:id` | Get invoice | Yes |
| POST | `/billing/invoices/:id/send` | Send invoice | Yes |
| GET | `/billing/payments` | Get payments | Yes |

**Total**: 9 endpoints

### Stripe Payment APIs
**Controller**: `stripe-payment.controller.ts`  
**Base Route**: `/stripe`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/stripe/create-payment-intent` | Create payment intent | Yes |
| POST | `/stripe/create-subscription` | Create subscription | Yes |
| POST | `/stripe/update-subscription` | Update subscription | Yes |
| POST | `/stripe/cancel-subscription` | Cancel subscription | Yes |
| GET | `/stripe/payment-methods` | Get payment methods | Yes |
| POST | `/stripe/add-payment-method` | Add payment method | Yes |
| DELETE | `/stripe/payment-methods/:id` | Delete payment method | Yes |
| GET | `/stripe/invoices` | Get Stripe invoices | Yes |

**Total**: 8 endpoints

### Stripe Webhook APIs
**Controller**: `stripe-webhook.controller.ts`  
**Base Route**: `/webhooks`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/webhooks/stripe` | Stripe webhook handler | No (Stripe) |

**Total**: 1 endpoint

### Subscription Plans APIs
**Controller**: `subscription-plans.controller.ts`  
**Base Route**: `/subscription-plans`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/subscription-plans` | Get all subscription plans | Yes |

**Total**: 1 endpoint

### Territory APIs
**Controller**: `territory.controller.ts`  
**Base Route**: `/territories`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/territories` | Get all territories | Yes |
| POST | `/territories` | Create territory | ADMIN |
| GET | `/territories/:id` | Get territory by ID | Yes |
| PUT | `/territories/:id` | Update territory | ADMIN |
| DELETE | `/territories/:id` | Delete territory | ADMIN |
| POST | `/territories/:id/assign` | Assign user | ADMIN |
| POST | `/territories/:id/unassign` | Unassign user | ADMIN |
| GET | `/territories/:id/accounts` | Get territory accounts | Yes |
| GET | `/territories/:id/performance` | Get performance | Yes |
| GET | `/territories/map` | Get territory map | Yes |
| POST | `/territories/auto-assign` | Auto-assign territories | ADMIN |
| GET | `/territories/rules` | Get assignment rules | ADMIN |

**Total**: 12 endpoints

---

## 📊 API Summary

| Category | Controllers | Endpoints | 
|----------|-------------|-----------|
| **Authentication** | 1 | 9 |
| **Core CRM** | 3 | 21 |
| **Sales & Marketing** | 3 | 41 |
| **Support** | 1 | 11 |
| **Analytics** | 2 | 32 |
| **Integration** | 4 | 58 |
| **Admin & System** | 5 | 49 |
| **Specialized** | 15 | ~180 |
| **TOTAL** | **34** | **~400+** |

---

## 🔑 Authentication

### JWT Bearer Token
Most endpoints require JWT authentication:
```
Authorization: Bearer <access_token>
```

### User Types
- `SUPER_ADMIN` - Platform administrator
- `ORG_ADMIN` - Organization administrator
- `ORG_USER` - Organization user
- `PORTAL_USER` - Customer portal user

---

## 🚀 Base URLs by Environment

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3000/api` |
| Staging | `https://staging-api.cognexiaai.com` |
| Production | `https://api.cognexiaai.com` |

---

## 📝 Missing/Incomplete APIs (Recommendations)

Based on the feature list analysis, these APIs may need enhancement or are missing:

### 1. **Quantum Intelligence APIs** (Missing)
- `/ai/quantum/personality-profile`
- `/ai/quantum/entanglement-analysis`
- `/ai/quantum/consciousness-simulation`

### 2. **Holographic Experience APIs** (Missing)
- `/holographic/projections`
- `/holographic/spatial-computing`
- `/holographic/interactive-sessions`

### 3. **AR/VR Sales APIs** (Missing)
- `/arvr/showrooms`
- `/arvr/product-demos`
- `/arvr/virtual-meetings`
- `/arvr/3d-configurators`

### 4. **Advanced Workflow APIs** (Incomplete)
- Current: Basic sequence engine
- Missing: Autonomous journey orchestrator endpoints
- Missing: Self-optimizing workflow APIs

### 5. **Contract Management APIs** (Missing)
- `/contracts` - Full CRUD
- `/contracts/:id/renewals`
- `/contracts/:id/amendments`
- `/contracts/e-signature`

### 6. **Inventory Management APIs** (Missing)
- `/inventory/stock-levels`
- `/inventory/warehouses`
- `/inventory/reorder-points`
- `/inventory/transfers`

### 7. **Catalog Management APIs** (Missing)
- `/catalogs`
- `/catalogs/:id/products`
- `/catalogs/publish`

### 8. **Recommendation Engine APIs** (Incomplete)
- Current: Basic product recommendations
- Missing: Next best action APIs
- Missing: Cross-sell/upsell specific endpoints

### 9. **LLM Integration APIs** (Missing)
- `/llm/chat`
- `/llm/content-generation`
- `/llm/analysis`

### 10. **Real-Time Analytics APIs** (Incomplete)
- Current: Standard analytics
- Missing: WebSocket real-time feeds
- Missing: Live dashboard APIs

---

## 🎯 Recommendations

### Priority 1: Complete Industry 5.0 Features
Implement missing quantum, holographic, and AR/VR APIs to match marketing claims.

### Priority 2: Enhance AI Integration
Add more comprehensive AI endpoints for all promised features.

### Priority 3: Add Missing Modules
- Contract management
- Advanced inventory
- Catalog management
- Real-time analytics WebSocket

### Priority 4: API Documentation
- Generate Swagger/OpenAPI documentation
- Add request/response examples
- Create Postman collection

---

## 📞 Support

For API support: support@cognexiaai.com  
For sales inquiries: sales@cognexiaai.com

---

**Last Updated**: January 16, 2026  
**API Version**: 1.0.0  
**Backend**: NestJS + TypeORM + PostgreSQL
