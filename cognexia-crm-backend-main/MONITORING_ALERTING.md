# Monitoring and Alerting Configuration - CRM Module

## Overview
This document provides comprehensive monitoring and alerting setup for production-ready CRM module deployment.

## Monitoring Platforms

### Option 1: DataDog (Recommended)
### Option 2: New Relic
### Option 3: Self-hosted (Prometheus + Grafana)

---

## 1. DataDog Configuration

### Installation

#### Backend Application Monitoring
```bash
# Install DataDog APM for Node.js
npm install dd-trace --save

# Create DataDog initialization file
# File: src/datadog.ts
```

#### DataDog Initialization Code
```typescript
// src/datadog.ts
import tracer from 'dd-trace';

tracer.init({
  service: 'crm-module',
  env: process.env.NODE_ENV || 'production',
  version: process.env.APP_VERSION || '1.0.0',
  logInjection: true,
  runtimeMetrics: true,
  profiling: true,
  analytics: true,
});

export default tracer;
```

#### Import in Main Application
```typescript
// src/index.ts or src/main.ts (FIRST LINE)
import './datadog'; // Must be first import

// ... rest of your application imports
```

### Environment Variables
```bash
# .env.production
DD_AGENT_HOST=localhost
DD_TRACE_AGENT_PORT=8126
DD_ENV=production
DD_SERVICE=crm-module
DD_VERSION=1.0.0
DD_LOGS_INJECTION=true
DD_RUNTIME_METRICS_ENABLED=true
DD_PROFILING_ENABLED=true
```

### DataDog Agent Installation
```bash
# Windows
msiexec /i datadog-agent-7-latest.amd64.msi

# Linux
DD_AGENT_MAJOR_VERSION=7 DD_API_KEY=<YOUR_API_KEY> DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"

# Docker
docker run -d --name dd-agent \
  -e DD_API_KEY=<YOUR_API_KEY> \
  -e DD_LOGS_ENABLED=true \
  -e DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL=true \
  -e DD_APM_ENABLED=true \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /proc/:/host/proc/:ro \
  -v /sys/fs/cgroup/:/host/sys/fs/cgroup:ro \
  datadog/agent:latest
```

---

## 2. New Relic Configuration

### Installation
```bash
npm install newrelic --save
```

### Configuration File
```javascript
// newrelic.js (root directory)
'use strict'

exports.config = {
  app_name: ['CRM Module'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  
  logging: {
    level: 'info',
    filepath: 'stdout',
  },
  
  allow_all_headers: true,
  
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  },
  
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 'apdex_f',
    record_sql: 'obfuscated',
  },
  
  error_collector: {
    enabled: true,
    ignore_status_codes: [404],
  },
  
  distributed_tracing: {
    enabled: true,
  },
  
  application_logging: {
    enabled: true,
    forwarding: {
      enabled: true,
    },
    metrics: {
      enabled: true,
    },
    local_decorating: {
      enabled: true,
    },
  },
}
```

### Import in Application
```typescript
// src/index.ts (FIRST LINE)
import 'newrelic';

// ... rest of your application
```

---

## 3. Custom Application Metrics

### Metrics Service
```typescript
// src/services/metrics.service.ts
import { Injectable } from '@nestjs/common';
import tracer from 'dd-trace'; // or use New Relic

@Injectable()
export class MetricsService {
  private readonly metrics = new Map<string, number>();

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, tags?: Record<string, string>): void {
    tracer.dogstatsd.increment(name, 1, tags);
  }

  /**
   * Record a gauge metric
   */
  recordGauge(name: string, value: number, tags?: Record<string, string>): void {
    tracer.dogstatsd.gauge(name, value, tags);
  }

  /**
   * Record timing metric
   */
  recordTiming(name: string, duration: number, tags?: Record<string, string>): void {
    tracer.dogstatsd.histogram(name, duration, tags);
  }

  /**
   * Track database query performance
   */
  trackDatabaseQuery(query: string, duration: number): void {
    this.recordTiming('database.query.duration', duration, {
      query_type: this.getQueryType(query),
    });
  }

  /**
   * Track API endpoint performance
   */
  trackAPICall(endpoint: string, method: string, statusCode: number, duration: number): void {
    this.incrementCounter('api.requests.total', {
      endpoint,
      method,
      status: statusCode.toString(),
    });
    
    this.recordTiming('api.request.duration', duration, {
      endpoint,
      method,
    });
  }

  /**
   * Track business metrics
   */
  trackBusinessMetric(name: string, value: number, tags?: Record<string, string>): void {
    this.recordGauge(`business.${name}`, value, tags);
  }

  private getQueryType(query: string): string {
    const normalized = query.trim().toLowerCase();
    if (normalized.startsWith('select')) return 'select';
    if (normalized.startsWith('insert')) return 'insert';
    if (normalized.startsWith('update')) return 'update';
    if (normalized.startsWith('delete')) return 'delete';
    return 'other';
  }
}
```

### Metrics Interceptor
```typescript
// src/interceptors/metrics.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../services/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - startTime;

        this.metricsService.trackAPICall(
          request.route?.path || request.url,
          request.method,
          response.statusCode,
          duration,
        );
      }),
    );
  }
}
```

---

## 4. Alert Configuration

### Critical Alerts (P1 - Immediate Response)

#### 1. Application Down
```yaml
# DataDog Monitor
name: "[P1] CRM Module - Application Down"
type: service check
query: '"http.can_connect".over("service:crm-module").by("*").last(2).count_by_status()'
message: |
  {{#is_alert}}
  🚨 CRITICAL: CRM application is DOWN
  Service: {{service.name}}
  Environment: {{env}}
  
  Action Required: Immediate investigation
  {{/is_alert}}
thresholds:
  critical: 2
  warning: 1
notify:
  - "@slack-alerts-critical"
  - "@pagerduty-oncall"
  - "ops-team@company.com"
```

#### 2. High Error Rate
```yaml
name: "[P1] CRM Module - High Error Rate"
type: metric alert
query: 'sum(last_5m):sum:api.requests.total{status:5*,service:crm-module}.as_count() / sum:api.requests.total{service:crm-module}.as_count() > 0.05'
message: |
  🚨 CRITICAL: Error rate above 5%
  Current Rate: {{value}}%
  
  Check application logs immediately
thresholds:
  critical: 0.05  # 5%
  warning: 0.02   # 2%
```

#### 3. Database Connection Pool Exhausted
```yaml
name: "[P1] CRM Module - Database Pool Exhausted"
type: metric alert
query: 'avg(last_5m):avg:database.pool.active{service:crm-module} / avg:database.pool.max{service:crm-module} > 0.95'
message: |
  🚨 CRITICAL: Database connection pool exhausted
  Usage: {{value}}%
  
  Immediate action required to prevent service degradation
thresholds:
  critical: 0.95  # 95%
  warning: 0.80   # 80%
```

### High Priority Alerts (P2 - 15 min response)

#### 4. High Response Time
```yaml
name: "[P2] CRM Module - High Response Time"
type: metric alert
query: 'avg(last_15m):p95:api.request.duration{service:crm-module} > 1000'
message: |
  ⚠️ WARNING: API response time degraded
  P95 Latency: {{value}}ms
  
  Investigate performance issues
thresholds:
  critical: 2000  # 2 seconds
  warning: 1000   # 1 second
```

#### 5. Memory Usage High
```yaml
name: "[P2] CRM Module - High Memory Usage"
type: metric alert
query: 'avg(last_10m):avg:runtime.nodejs.mem.heap_used{service:crm-module} > 1500000000'
message: |
  ⚠️ WARNING: High memory usage detected
  Heap Used: {{value}} bytes
  
  Potential memory leak - investigate
thresholds:
  critical: 1800000000  # 1.8GB
  warning: 1500000000   # 1.5GB
```

### Medium Priority Alerts (P3 - 1 hour response)

#### 6. Unusual Traffic Pattern
```yaml
name: "[P3] CRM Module - Traffic Spike"
type: anomaly
query: 'avg(last_1h):anomalies(avg:api.requests.total{service:crm-module}.as_rate(), "basic", 3) > 1'
message: |
  ℹ️ INFO: Unusual traffic pattern detected
  
  Monitor for potential issues
```

#### 7. Failed Background Jobs
```yaml
name: "[P3] CRM Module - Background Job Failures"
type: metric alert
query: 'sum(last_30m):sum:background.job.failed{service:crm-module}.as_count() > 10'
message: |
  ℹ️ INFO: Multiple background job failures
  Failed Jobs: {{value}}
  
  Review job queue and error logs
thresholds:
  critical: 50
  warning: 10
```

---

## 5. Business Metrics Dashboards

### Key Business Metrics to Track

```typescript
// Example: Track in your services
export class CustomerService {
  async createCustomer(dto: CreateCustomerDto) {
    // ... create customer logic
    
    // Track business metric
    this.metricsService.trackBusinessMetric('customers.created', 1, {
      customer_type: dto.customerType,
      industry: dto.industry,
    });
    
    this.metricsService.trackBusinessMetric('customers.total', 
      await this.customerRepository.count()
    );
  }
}
```

### Dashboard Metrics
- **Customer Metrics**
  - Total customers
  - New customers (daily/weekly/monthly)
  - Customer churn rate
  - Customer lifetime value
  
- **Lead Metrics**
  - Total leads
  - Lead conversion rate
  - Lead response time
  - Lead quality score
  
- **Opportunity Metrics**
  - Pipeline value
  - Win rate
  - Average deal size
  - Sales cycle length
  
- **System Performance**
  - Request throughput (req/sec)
  - Average response time
  - Error rate
  - Database query performance

---

## 6. Log Aggregation

### Structured Logging
```typescript
// src/logger/logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class AppLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: {
        service: 'crm-module',
        environment: process.env.NODE_ENV,
      },
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ 
          filename: 'logs/error.log', 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: 'logs/combined.log' 
        }),
      ],
    });
  }

  log(message: string, context?: string, metadata?: any) {
    this.logger.info(message, { context, ...metadata });
  }

  error(message: string, trace?: string, context?: string, metadata?: any) {
    this.logger.error(message, { trace, context, ...metadata });
  }

  warn(message: string, context?: string, metadata?: any) {
    this.logger.warn(message, { context, ...metadata });
  }

  debug(message: string, context?: string, metadata?: any) {
    this.logger.debug(message, { context, ...metadata });
  }
}
```

---

## 7. Health Checks

### Health Check Endpoint
```typescript
// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health
      () => this.db.pingCheck('database'),
      
      // Memory health (heap should not exceed 1.5GB)
      () => this.memory.checkHeap('memory_heap', 1500 * 1024 * 1024),
      
      // Memory health (RSS should not exceed 2GB)
      () => this.memory.checkRSS('memory_rss', 2000 * 1024 * 1024),
      
      // Disk health (should have at least 10GB free)
      () => this.disk.checkStorage('storage', { 
        path: '/', 
        thresholdPercent: 0.90 
      }),
    ]);
  }
}
```

---

## 8. Deployment Checklist

### Pre-Deployment
- [ ] DataDog/New Relic agent installed
- [ ] API keys configured in environment
- [ ] All alerts created and tested
- [ ] Dashboard configured with key metrics
- [ ] Log aggregation working
- [ ] Health check endpoints exposed

### Post-Deployment
- [ ] Verify metrics are flowing
- [ ] Test alert notifications
- [ ] Monitor for 24 hours
- [ ] Create runbook for common issues
- [ ] Train team on monitoring tools

---

## 9. Runbook - Common Issues

### Issue: High CPU Usage
**Symptoms:** CPU usage > 80%
**Investigation:**
1. Check DataDog APM for slow transactions
2. Review database query performance
3. Check for infinite loops or recursive calls
4. Review recent code changes

**Resolution:**
- Optimize slow queries
- Add database indexes
- Scale horizontally (add more instances)
- Enable caching

### Issue: Memory Leak
**Symptoms:** Memory usage continuously increasing
**Investigation:**
1. Take heap snapshot
2. Compare snapshots over time
3. Identify growing objects
4. Review event listeners and timers

**Resolution:**
- Fix memory leak in code
- Restart application as temporary fix
- Add memory monitoring alerts

### Issue: Database Connection Timeout
**Symptoms:** `ETIMEDOUT` or `connection pool exhausted`
**Investigation:**
1. Check database server health
2. Review connection pool configuration
3. Check for long-running queries
4. Monitor active connections

**Resolution:**
- Increase connection pool size
- Optimize slow queries
- Add query timeouts
- Scale database resources

---

## 10. Contact & Escalation

### Escalation Path
1. **P1 (Critical):** Immediate PagerDuty alert to on-call engineer
2. **P2 (High):** Slack alert to #crm-alerts channel
3. **P3 (Medium):** Email to ops-team@company.com

### Support Channels
- **Slack:** #crm-support
- **Email:** crm-support@company.com
- **PagerDuty:** crm-oncall

---

## Summary

This monitoring setup provides:
✅ Real-time application performance monitoring
✅ Automated alerting for critical issues
✅ Business metrics tracking
✅ Comprehensive logging
✅ Health check endpoints
✅ Incident response runbooks

**Status:** Ready for production deployment
