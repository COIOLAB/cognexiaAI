# Load Testing Guide - CRM Module

## Overview
This document provides instructions for running load tests on the CRM module to verify it can handle 10,000+ concurrent users.

## Prerequisites

### 1. Install k6
```bash
# Windows (using Chocolatey)
choco install k6

# Or download from: https://k6.io/docs/get-started/installation/
```

### 2. Prepare Test Environment
- Ensure the CRM API is running locally or on a test server
- Database should be configured with production-like settings
- Create test users in the system

## Test Configuration

### Test Users
The load test uses 3 test users by default. Create them before running the test:

```sql
-- Create test users
INSERT INTO users (email, password, first_name, last_name, organizationId)
VALUES 
  ('load-test-1@example.com', 'hashed_password', 'Load', 'Test1', 'org-id'),
  ('load-test-2@example.com', 'hashed_password', 'Load', 'Test2', 'org-id'),
  ('load-test-3@example.com', 'hashed_password', 'Load', 'Test3', 'org-id');
```

### Load Test Stages
The test simulates realistic user behavior with the following stages:

1. **Ramp-up to 1,000 users** (2 minutes)
2. **Sustain 1,000 users** (3 minutes)
3. **Ramp-up to 5,000 users** (3 minutes)
4. **Sustain 5,000 users** (5 minutes)
5. **Ramp-up to 10,000 users** (5 minutes)
6. **Sustain 10,000 users** (10 minutes) ← **Peak load**
7. **Ramp-down to 0 users** (2 minutes)

**Total duration:** ~30 minutes

## Running the Load Test

### Basic Test (Local)
```bash
# Run against local environment
k6 run load-test.js

# With custom base URL
k6 run --env BASE_URL=http://localhost:3000 load-test.js
```

### Production-Like Environment
```bash
# Run against staging/test environment
k6 run --env BASE_URL=https://crm-test.example.com load-test.js
```

### Cloud Test (k6 Cloud)
```bash
# Run on k6 Cloud for distributed load testing
k6 cloud load-test.js
```

### Custom Configuration
```bash
# Reduce test duration for quick test (peak at 1,000 users)
k6 run --stage 1m:500,2m:1000,1m:1000,1m:0 load-test.js

# Extended soak test (longer duration at peak)
k6 run --stage 5m:10000,30m:10000,5m:0 load-test.js
```

## Performance Thresholds

The test includes the following thresholds that must pass:

| Metric | Threshold | Description |
|--------|-----------|-------------|
| `http_req_duration` | p(95) < 500ms | 95% of requests complete within 500ms |
| `http_req_duration` (API) | p(99) < 1000ms | 99% of API requests complete within 1s |
| `errors` | rate < 1% | Error rate below 1% |
| `checks` | rate > 95% | 95% of validation checks pass |

## Test Scenarios

Each virtual user executes the following workflow:

1. **Authentication** - Login with credentials
2. **Customer Operations**
   - List customers
   - Create new customer
3. **Lead Operations** - List leads
4. **Migration Status** - Check migration job status
5. **Health Check** - Verify system health

## Output and Results

### Console Output
Real-time metrics displayed during test execution:
```
execution: local
    script: load-test.js
    output: -

  scenarios: (100.00%) 1 scenario, 10000 max VUs, 32m0s max duration
           * default: Up to 10000 looping VUs for 30m0s over 7 stages

  ✓ login status is 200 or 201
  ✓ login returns token
  ✓ list customers status is 200
  ✓ create customer status is 201
  ✓ health check status is 200

  checks.........................: 95.23% ✓ 285690    ✗ 14310
  http_req_duration..............: avg=245ms min=45ms med=198ms max=1.2s p(95)=487ms p(99)=895ms
  http_reqs......................: 300000 (166.67/s)
  vus............................: 10000
```

### Results Files
- **Console:** Formatted summary with pass/fail status
- **load-test-results.json:** Detailed metrics in JSON format

### Success Criteria
✅ **Test passes if:**
- All thresholds are met (< 500ms p95, < 1000ms p99, < 1% errors)
- System remains stable throughout 10,000 user peak
- No critical errors or crashes

❌ **Test fails if:**
- Any threshold is exceeded
- Error rate > 1%
- System becomes unresponsive

## Monitoring During Load Test

### Key Metrics to Monitor
1. **Database**
   - Connection pool usage
   - Query execution time
   - Lock contention
   - CPU and memory usage

2. **Application Server**
   - CPU and memory usage
   - Event loop lag (Node.js)
   - Garbage collection
   - Request queue depth

3. **Network**
   - Bandwidth usage
   - Connection count
   - Latency

### Recommended Tools
- **Database:** PostgreSQL logs, pg_stat_statements
- **Application:** PM2 monitoring, DataDog, New Relic
- **System:** htop, iostat, netstat

## Optimization Tips

If the test fails, consider:

1. **Database Optimization**
   - Add missing indexes
   - Optimize slow queries
   - Increase connection pool size
   - Enable query caching

2. **Application Optimization**
   - Enable response caching
   - Implement connection pooling
   - Add rate limiting
   - Scale horizontally (multiple instances)

3. **Infrastructure**
   - Increase server resources (CPU, RAM)
   - Use load balancer
   - Enable CDN for static assets
   - Implement caching layer (Redis)

## Production Readiness Checklist

After passing the load test:

- [ ] All thresholds met consistently
- [ ] No memory leaks detected
- [ ] Database performance stable
- [ ] Error logs reviewed and addressed
- [ ] Monitoring alerts configured
- [ ] Auto-scaling configured (if cloud)
- [ ] Backup and recovery tested
- [ ] Disaster recovery plan documented

## Troubleshooting

### High Error Rate
- Check authentication service
- Verify database connections
- Review application logs

### Slow Response Times
- Identify slow queries with EXPLAIN
- Check for missing indexes
- Monitor database connection pool
- Profile application code

### Memory Issues
- Check for memory leaks
- Monitor garbage collection
- Review connection pooling
- Analyze heap dumps

## Next Steps

1. Run load test in staging environment
2. Analyze results and optimize bottlenecks
3. Re-test until all thresholds pass
4. Document baseline performance metrics
5. Set up continuous load testing (CI/CD)

## Contact

For questions or issues with load testing, contact the DevOps team.
