# 🏢 Multi-Tenancy Architecture for 100,000+ Clients

## 📊 Architecture Decision

For **100,000+ clients**, we recommend: **Shared Database with Row-Level Security (RLS)**

### Why This Approach?

✅ **Cost-Effective:** Single database infrastructure  
✅ **Scalable:** Proven to handle millions of users  
✅ **Maintainable:** Single schema, easier migrations  
✅ **Secure:** Supabase RLS provides robust isolation  
✅ **Performance:** With proper indexing, excellent performance  

---

## 🏗️ Architecture Options Comparison

### Option 1: Shared Database with RLS ⭐ **RECOMMENDED**

**How it works:**
- All clients share the same database and tables
- Each row has a `tenant_id` or `organization_id` column
- Supabase RLS policies enforce data isolation
- Users can only access data for their organization

**Pros:**
- ✅ Cost-effective (1 database for all clients)
- ✅ Easy to maintain and upgrade
- ✅ Scales to millions of users
- ✅ Centralized analytics and reporting
- ✅ Simple backup and disaster recovery

**Cons:**
- ⚠️ Requires careful RLS policy design
- ⚠️ All tenants affected by database issues
- ⚠️ Performance tuning critical at scale

**Best for:** 100,000+ clients with similar usage patterns

---

### Option 2: Schema-per-Tenant (Hybrid)

**How it works:**
- Each client gets their own PostgreSQL schema
- Shared database, isolated schemas
- Connection pooling per tenant

**Pros:**
- ✅ Logical separation
- ✅ Easier per-tenant backups
- ✅ Some performance isolation

**Cons:**
- ⚠️ Complex migrations (100k schemas!)
- ⚠️ Connection pool management
- ⚠️ Limited by PostgreSQL schema limits
- ⚠️ Expensive at scale

**Best for:** 100-1,000 clients (not recommended for 100k+)

---

### Option 3: Database-per-Tenant (Not Recommended)

**How it works:**
- Each client gets their own Supabase project/database

**Pros:**
- ✅ Complete isolation
- ✅ Per-tenant backups

**Cons:**
- ❌ Extremely expensive (100k databases!)
- ❌ Impossible to manage at scale
- ❌ No centralized reporting
- ❌ Migration nightmare

**Best for:** <50 enterprise clients with strict isolation requirements

---

## 🎯 Recommended Implementation: RLS with Tenant Isolation

### Database Schema Design

```sql
-- 1. Organization/Tenant Table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tier TEXT DEFAULT 'free', -- free, basic, premium, enterprise
  max_users INT DEFAULT 5,
  max_storage_mb INT DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users with Organization Link
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user', -- admin, manager, user
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add tenant_id to ALL CRM tables
ALTER TABLE customers ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE leads ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE opportunities ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE support_tickets ADD COLUMN organization_id UUID REFERENCES organizations(id);
-- ... repeat for all tables
```

### Row-Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their organization's data
CREATE POLICY "Users can view own organization data" ON customers
  FOR SELECT
  USING (organization_id = auth.jwt() ->> 'organization_id');

CREATE POLICY "Users can insert own organization data" ON customers
  FOR INSERT
  WITH CHECK (organization_id = auth.jwt() ->> 'organization_id');

CREATE POLICY "Users can update own organization data" ON customers
  FOR UPDATE
  USING (organization_id = auth.jwt() ->> 'organization_id');

CREATE POLICY "Users can delete own organization data" ON customers
  FOR DELETE
  USING (organization_id = auth.jwt() ->> 'organization_id');

-- Repeat for all tables...
```

### Performance Optimization

```sql
-- CRITICAL: Add indexes on organization_id for ALL tables
CREATE INDEX idx_customers_org_id ON customers(organization_id);
CREATE INDEX idx_leads_org_id ON leads(organization_id);
CREATE INDEX idx_opportunities_org_id ON opportunities(organization_id);
CREATE INDEX idx_support_tickets_org_id ON support_tickets(organization_id);
CREATE INDEX idx_workflows_org_id ON workflows(organization_id);
CREATE INDEX idx_dashboards_org_id ON dashboards(organization_id);

-- Composite indexes for common queries
CREATE INDEX idx_customers_org_created ON customers(organization_id, created_at DESC);
CREATE INDEX idx_tickets_org_status ON support_tickets(organization_id, status);
CREATE INDEX idx_leads_org_score ON leads(organization_id, score DESC);
```

---

## 🔐 Authentication & Authorization Flow

### 1. User Login Flow

```typescript
// User logs in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@company.com',
  password: 'password'
});

// Server enriches JWT with organization_id
const token = jwt.sign({
  sub: user.id,
  email: user.email,
  organization_id: user.organization_id,
  role: user.role,
}, JWT_SECRET);
```

### 2. Middleware to Inject Tenant Context

```typescript
// src/middleware/tenant.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const user = req.user; // From JWT
    
    // Inject organization_id into request
    req['organizationId'] = user.organization_id;
    req['userRole'] = user.role;
    
    next();
  }
}
```

### 3. Service Layer with Tenant Filtering

```typescript
// All queries automatically filter by organization_id
async findCustomers(organizationId: string) {
  return await this.customerRepository.find({
    where: { organization_id: organizationId }
  });
}

async createCustomer(organizationId: string, data: CreateCustomerDto) {
  return await this.customerRepository.save({
    ...data,
    organization_id: organizationId // Always inject tenant ID
  });
}
```

---

## 📈 Scaling Strategy for 100,000+ Clients

### Phase 1: Single Database (0-100k users)
- Shared database with RLS
- Vertical scaling (increase compute)
- Read replicas for analytics

### Phase 2: Sharding by Organization (100k-1M users)
- Shard large tenants to dedicated databases
- Keep small tenants in shared database
- Use connection pooler (PgBouncer)

### Phase 3: Regional Distribution (1M+ users)
- Geographic sharding
- Multi-region Supabase projects
- Global load balancer

---

## 🎯 Supabase-Specific Configuration

### supabase/config.toml

```toml
[db]
pooler_enabled = true
pooler_connection_limit = 100

[storage]
max_file_size = "50MB"
# Per-organization quotas enforced in application layer
```

### Connection Pooling

```typescript
// Use Supabase connection pooler for high concurrency
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: false, // For server-side
    },
    global: {
      headers: {
        'x-connection-pooling': 'true'
      }
    }
  }
);
```

---

## 🛡️ Security Best Practices

### 1. Prevent Cross-Tenant Data Leaks

```typescript
// ALWAYS validate organization_id
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const resourceOrgId = request.params.organizationId;
    const userOrgId = request.user.organization_id;
    
    if (resourceOrgId && resourceOrgId !== userOrgId) {
      throw new ForbiddenException('Access denied');
    }
    
    return true;
  }
}
```

### 2. Rate Limiting per Tenant

```typescript
// Apply rate limits per organization
@Injectable()
export class TenantRateLimitGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const orgId = request.user.organization_id;
    
    // Check rate limit for this organization
    const limit = await this.redis.get(`rate_limit:${orgId}`);
    if (limit > 1000) {
      throw new ThrottlerException();
    }
    
    await this.redis.incr(`rate_limit:${orgId}`);
    return true;
  }
}
```

### 3. Quota Management

```typescript
// Enforce storage/user limits per organization
async checkQuota(organizationId: string, type: 'users' | 'storage') {
  const org = await this.organizationRepository.findOne(organizationId);
  
  if (type === 'users') {
    const userCount = await this.userRepository.count({ organization_id: organizationId });
    if (userCount >= org.max_users) {
      throw new BadRequestException('User limit reached');
    }
  }
  
  if (type === 'storage') {
    const storageUsed = await this.getStorageUsage(organizationId);
    if (storageUsed >= org.max_storage_mb * 1024 * 1024) {
      throw new BadRequestException('Storage limit reached');
    }
  }
}
```

---

## 📊 Monitoring & Analytics

### Per-Tenant Metrics

```typescript
// Track usage per organization
await this.metricsService.track({
  organization_id: orgId,
  metric: 'api_calls',
  value: 1,
  timestamp: new Date()
});

// Aggregate for billing
SELECT 
  organization_id,
  COUNT(*) as total_api_calls,
  SUM(storage_used) as total_storage
FROM usage_metrics
WHERE date >= '2026-01-01'
GROUP BY organization_id;
```

---

## 🚀 Migration Strategy

### Migrating Existing Data

```typescript
// Add organization_id to existing records
UPDATE customers SET organization_id = 'default-org-id' WHERE organization_id IS NULL;
UPDATE leads SET organization_id = 'default-org-id' WHERE organization_id IS NULL;

// Make organization_id NOT NULL after migration
ALTER TABLE customers ALTER COLUMN organization_id SET NOT NULL;
```

---

## 💰 Cost Optimization

### Supabase Pricing Considerations

**For 100,000 clients:**
- **Shared Database:** ~$25-100/month (Pro plan with compute add-ons)
- **Plus Compute:** ~$100-500/month for high traffic
- **Storage:** $0.021 per GB
- **Bandwidth:** $0.09 per GB

**Total Estimated:** $200-1,000/month (vs $2.5M/month for separate databases!)

### Cost Optimization Tips

1. **Use Read Replicas** for analytics queries
2. **Archive old data** to cheaper storage
3. **Implement caching** (Redis) for hot data
4. **Use CDN** for static assets
5. **Compress data** before storage

---

## ✅ Implementation Checklist

- [ ] Add `organization_id` to all tables
- [ ] Create indexes on `organization_id`
- [ ] Enable RLS on all tables
- [ ] Create RLS policies for each table
- [ ] Implement tenant middleware
- [ ] Add tenant guard to all endpoints
- [ ] Set up connection pooling
- [ ] Implement quota management
- [ ] Add per-tenant rate limiting
- [ ] Set up monitoring and alerts
- [ ] Test cross-tenant isolation
- [ ] Load test with 100k organizations
- [ ] Document onboarding process

---

## 🎯 Conclusion

For **100,000+ clients**, the **Shared Database with RLS** approach is:
- ✅ Most cost-effective
- ✅ Easiest to maintain
- ✅ Proven at scale
- ✅ Fully supported by Supabase

**Estimated Setup Time:** 1-2 weeks  
**Monthly Cost:** $200-1,000 (vs millions for separate DBs)  
**Performance:** Excellent with proper indexing  
**Security:** Enterprise-grade with RLS

---

**Next Step:** Implement the entity updates and RLS policies!
