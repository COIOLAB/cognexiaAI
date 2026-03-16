# Phase 9: API Rate Limiting & Throttling

## Overview
This phase implements comprehensive rate limiting and API throttling to protect the platform from abuse, ensure fair resource distribution, and maintain system stability across the multi-tenant SaaS application.

**Status**: ✅ COMPLETED  
**Build Status**: ✅ 0 TypeScript Errors  
**Date**: January 2026

---

## 🎯 Features Implemented

### 1. Throttling Service
- Multiple throttling strategies (global, per-organization, per-user, per-IP, per-endpoint)
- Sliding window rate limiting
- Automatic blocking for repeat offenders
- Manual block/unblock capabilities
- Throttle statistics and monitoring
- Current limits tracking
- Blocked identifiers management
- Automatic cleanup of expired entries

### 2. Throttling Controller
- 12 REST endpoints for throttle management
- Statistics and monitoring
- Block/unblock operations
- Throttle checks for different types
- Data export for monitoring
- Reset capabilities

### 3. Default Rate Limits
- **Global**: 10,000 requests/minute
- **Per Organization**: 1,000 requests/hour
- **Per User**: 100 requests/minute
- **Per IP**: 500 requests/hour (with 5-minute block on violation)
- **Per Endpoint**: 200 requests/minute

---

## 📁 Files Created

### Services (1 file)
1. **throttling.service.ts** (426 lines)
   - 5 throttle types
   - 16 public methods
   - Sliding window implementation
   - Auto-block capabilities
   - Statistics tracking
   - Cleanup automation

### Controllers (1 file)
2. **throttling.controller.ts** (214 lines)
   - 12 REST endpoints
   - Admin management operations
   - Statistics and monitoring
   - Export capabilities

**Total**: 2 files, 640 lines of code

---

## 🔌 API Endpoints

### 1. Get Throttle Stats
```http
GET /throttling/stats?type=per_organization
Authorization: Bearer {jwt_token}
User-Type: super_admin

Response:
{
  "message": "Throttle statistics retrieved successfully",
  "data": {
    "totalRequests": 15234,
    "blockedRequests": 23,
    "uniqueIPs": 145,
    "topOffenders": [
      { "identifier": "org-123", "requests": 1234 },
      { "identifier": "org-456", "requests": 987 }
    ]
  }
}
```

### 2. Get Current Limits
```http
GET /throttling/limits/per_organization/org-123
Authorization: Bearer {jwt_token}
User-Type: super_admin, org_admin

Response:
{
  "message": "Current limits retrieved successfully",
  "data": {
    "current": 234,
    "limit": 1000,
    "resetTime": "2026-01-11T06:00:00.000Z"
  }
}
```

### 3. Check if Blocked
```http
GET /throttling/blocked/per_ip/192.168.1.1
Authorization: Bearer {jwt_token}
User-Type: super_admin, org_admin

Response:
{
  "message": "Block status retrieved successfully",
  "data": {
    "identifier": "192.168.1.1",
    "type": "per_ip",
    "isBlocked": true
  }
}
```

### 4. Get All Blocked Identifiers
```http
GET /throttling/blocked
Authorization: Bearer {jwt_token}
User-Type: super_admin

Response:
{
  "message": "Blocked identifiers retrieved successfully",
  "data": [
    {
      "identifier": "throttle:per_ip:192.168.1.1",
      "unblockAt": "2026-01-11T05:45:00.000Z"
    },
    {
      "identifier": "throttle:per_organization:org-bad",
      "unblockAt": "2026-01-11T06:00:00.000Z"
    }
  ]
}
```

### 5. Check Organization Throttle
```http
GET /throttling/check/organization/org-123
Authorization: Bearer {jwt_token}
User-Type: super_admin, org_admin

Response:
{
  "message": "Organization throttle checked",
  "data": {
    "allowed": true,
    "remaining": 766,
    "resetTime": "2026-01-11T06:00:00.000Z"
  }
}
```

### 6. Check User Throttle
```http
GET /throttling/check/user/user-456?organizationId=org-123
Authorization: Bearer {jwt_token}
User-Type: super_admin, org_admin

Response:
{
  "message": "User throttle checked",
  "data": {
    "allowed": true,
    "remaining": 87,
    "resetTime": "2026-01-11T05:41:00.000Z"
  }
}
```

### 7. Check IP Throttle
```http
GET /throttling/check/ip/192.168.1.100
Authorization: Bearer {jwt_token}
User-Type: super_admin

Response:
{
  "message": "IP throttle checked",
  "data": {
    "allowed": true,
    "remaining": 445,
    "resetTime": "2026-01-11T06:00:00.000Z"
  }
}
```

### 8. Check Global Throttle
```http
GET /throttling/check/global
Authorization: Bearer {jwt_token}
User-Type: super_admin

Response:
{
  "message": "Global throttle checked",
  "data": {
    "allowed": true,
    "remaining": 8765,
    "resetTime": "2026-01-11T05:41:00.000Z"
  }
}
```

### 9. Reset Throttle
```http
POST /throttling/reset
Authorization: Bearer {jwt_token}
User-Type: super_admin

Request Body:
{
  "identifier": "org-123",
  "type": "per_organization"
}

Response:
{
  "message": "Throttle reset successfully",
  "data": {
    "identifier": "org-123",
    "type": "per_organization"
  }
}
```

### 10. Block Identifier
```http
POST /throttling/block
Authorization: Bearer {jwt_token}
User-Type: super_admin

Request Body:
{
  "identifier": "192.168.1.99",
  "type": "per_ip",
  "durationSeconds": 3600
}

Response:
{
  "message": "Identifier blocked successfully",
  "data": {
    "identifier": "192.168.1.99",
    "type": "per_ip",
    "durationSeconds": 3600
  }
}
```

### 11. Unblock Identifier
```http
DELETE /throttling/block
Authorization: Bearer {jwt_token}
User-Type: super_admin

Request Body:
{
  "identifier": "192.168.1.99",
  "type": "per_ip"
}

Response:
{
  "message": "Identifier unblocked successfully",
  "data": {
    "identifier": "192.168.1.99",
    "type": "per_ip"
  }
}
```

### 12. Export Throttle Data
```http
GET /throttling/export
Authorization: Bearer {jwt_token}
User-Type: super_admin

Response:
{
  "message": "Throttle data exported successfully",
  "data": {
    "activeThrottles": [
      {
        "key": "throttle:per_organization:org-123",
        "count": 234,
        "resetTime": "2026-01-11T06:00:00.000Z"
      }
    ],
    "blockedKeys": [
      {
        "key": "throttle:per_ip:192.168.1.1",
        "unblockAt": "2026-01-11T05:45:00.000Z"
      }
    ]
  }
}
```

---

## 💡 Key Features

### Sliding Window Rate Limiting
```typescript
// Check throttle with sliding window
const result = await throttlingService.checkThrottle(identifier, {
  type: ThrottleType.PER_ORGANIZATION,
  limit: 1000,
  windowSeconds: 3600, // 1 hour
});

if (!result.allowed) {
  throw new TooManyRequestsException(`Retry after ${result.retryAfter}s`);
}
```

### Automatic Blocking
```typescript
// IPs that exceed limits are automatically blocked for 5 minutes
{
  type: ThrottleType.PER_IP,
  limit: 500,
  windowSeconds: 3600,
  blockDurationSeconds: 300, // Auto-block for 5 minutes
}
```

### Response Headers
The system automatically sets rate limit headers:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 766
X-RateLimit-Reset: 1736582400
Retry-After: 120
```

### Multi-Level Throttling
Apply different limits at different levels:
```typescript
// Check multiple throttles
const [global, org, user, ip] = await Promise.all([
  throttlingService.checkGlobalThrottle(),
  throttlingService.checkOrganizationThrottle(organizationId),
  throttlingService.checkUserThrottle(userId, organizationId),
  throttlingService.checkIPThrottle(ipAddress),
]);
```

---

## 🔧 Configuration

### Default Limits
```typescript
export enum ThrottleType {
  GLOBAL = 'global',                // 10,000 req/min
  PER_ORGANIZATION = 'per_organization', // 1,000 req/hour
  PER_USER = 'per_user',           // 100 req/min
  PER_IP = 'per_ip',               // 500 req/hour
  PER_ENDPOINT = 'per_endpoint',   // 200 req/min
}
```

### Custom Configuration
Adjust limits per subscription plan:
```typescript
// Premium organizations get higher limits
if (organization.subscriptionPlan === 'enterprise') {
  return this.checkThrottle(organizationId, {
    type: ThrottleType.PER_ORGANIZATION,
    limit: 5000, // 5x normal limit
    windowSeconds: 3600,
  });
}
```

### Cleanup Interval
Expired entries are cleaned every 5 minutes:
```typescript
setInterval(() => this.cleanup(), 5 * 60 * 1000);
```

---

## 🚀 Production Usage

### Apply Throttling Guard
Create a global throttle guard:
```typescript
@Injectable()
export class GlobalThrottleGuard implements CanActivate {
  constructor(private throttlingService: ThrottlingService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const organizationId = request.user?.organizationId;
    const ipAddress = request.ip;

    // Check multiple throttles
    const [orgResult, ipResult] = await Promise.all([
      this.throttlingService.checkOrganizationThrottle(organizationId),
      this.throttlingService.checkIPThrottle(ipAddress),
    ]);

    if (!orgResult.allowed) {
      throw new TooManyRequestsException('Organization rate limit exceeded');
    }

    if (!ipResult.allowed) {
      throw new TooManyRequestsException('IP rate limit exceeded');
    }

    return true;
  }
}
```

Apply globally in `app.module.ts`:
```typescript
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: GlobalThrottleGuard,
    },
  ],
})
```

### Redis Integration (Production)
For distributed systems, use Redis:
```bash
npm install ioredis @nestjs/throttler
```

```typescript
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
      storage: new ThrottlerStorageRedisService({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      }),
    }),
  ],
})
```

---

## 🔄 Integration with Previous Phases

### Phase 1: Database Schema
- Uses Organization entity for status checks
- Leverages UsageMetric for tracking

### Phase 2: Authentication
- JWT authentication on all endpoints
- User context extraction
- Organization context validation

### Phase 3: Organization Management
- Organization status checks
- Active/suspended validation
- Multi-tenant isolation

### Phase 8: Usage Tracking
- Complements usage tracking
- Enforces quota limits
- Prevents quota violations

---

## 📈 Business Value

### Platform Protection
- Prevents API abuse and DoS attacks
- Protects against malicious actors
- Ensures system stability

### Fair Resource Distribution
- Equal access for all organizations
- Prevents resource monopolization
- Maintains quality of service

### Cost Control
- Prevents excessive resource consumption
- Protects infrastructure costs
- Enables predictable scaling

### Compliance
- Rate limit transparency (headers)
- Audit trail of blocks
- Controllable enforcement

---

## 🧪 Testing

### Test Organization Throttle
```bash
curl -X GET "http://localhost:3000/throttling/check/organization/org-123" \
  -H "Authorization: Bearer {token}"
```

### Simulate Rate Limit
```bash
# Make 101 requests in 1 minute (exceeds 100/min limit)
for i in {1..101}; do
  curl -X GET "http://localhost:3000/api/endpoint" \
    -H "Authorization: Bearer {token}"
done
```

### Block Abusive IP
```bash
curl -X POST "http://localhost:3000/throttling/block" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "192.168.1.99",
    "type": "per_ip",
    "durationSeconds": 3600
  }'
```

### View Statistics
```bash
curl -X GET "http://localhost:3000/throttling/stats" \
  -H "Authorization: Bearer {token}"
```

---

## 🎯 Next Steps (Phase 10+)

1. Redis-based distributed rate limiting
2. Rate limit dashboards and visualizations
3. Automated threat detection
4. Rate limit alerts and notifications
5. Per-endpoint custom limits
6. Burst allowance capabilities
7. Rate limit analytics
8. Geographic rate limiting
9. Rate limit pricing tiers
10. Machine learning-based anomaly detection

---

## ✅ Verification

### Build Status
```bash
npm run build
# ✅ 0 TypeScript errors
```

### Files Verification
- ✅ throttling.service.ts (426 lines)
- ✅ throttling.controller.ts (214 lines)

### Features Verification
- ✅ 5 throttle types
- ✅ Sliding window implementation
- ✅ Automatic blocking
- ✅ Manual block/unblock
- ✅ Statistics tracking
- ✅ Current limits tracking
- ✅ Blocked identifiers management
- ✅ Data export
- ✅ Automatic cleanup
- ✅ 12 REST endpoints
- ✅ Rate limit headers

---

**Phase 9 Status**: ✅ COMPLETE - Production Ready
