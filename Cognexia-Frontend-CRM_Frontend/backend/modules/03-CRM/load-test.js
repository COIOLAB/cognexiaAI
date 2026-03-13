import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const apiDuration = new Trend('api_duration');

// Test configuration
export const options = {
  stages: [
    // Ramp-up: 0 to 1,000 users over 2 minutes
    { duration: '2m', target: 1000 },
    // Stay at 1,000 users for 3 minutes
    { duration: '3m', target: 1000 },
    // Ramp-up: 1,000 to 5,000 users over 3 minutes
    { duration: '3m', target: 5000 },
    // Stay at 5,000 users for 5 minutes
    { duration: '5m', target: 5000 },
    // Ramp-up: 5,000 to 10,000 users over 5 minutes
    { duration: '5m', target: 10000 },
    // Stay at 10,000 users for 10 minutes (peak load)
    { duration: '10m', target: 10000 },
    // Ramp-down: 10,000 to 0 users over 2 minutes
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    // 95% of requests should complete within 500ms
    http_req_duration: ['p(95)<500'],
    // 99% of requests should complete within 1000ms
    'http_req_duration{type:api}': ['p(99)<1000'],
    // Error rate should be less than 1%
    errors: ['rate<0.01'],
    // 95% of checks should pass
    checks: ['rate>0.95'],
  },
};

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_VERSION = '/api/v1';

// Test data
const testUsers = [
  { email: 'load-test-1@example.com', password: 'Test123!@#' },
  { email: 'load-test-2@example.com', password: 'Test123!@#' },
  { email: 'load-test-3@example.com', password: 'Test123!@#' },
];

/**
 * Setup function - runs once before the load test
 */
export function setup() {
  console.log('Starting load test...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Target: 10,000 concurrent users`);
  
  // Health check
  const healthRes = http.get(`${BASE_URL}/health`);
  if (healthRes.status !== 200) {
    throw new Error('API is not healthy');
  }
  
  return { startTime: Date.now() };
}

/**
 * Main test function - runs for each virtual user
 */
export default function (data) {
  // Select random user
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  let authToken = '';

  // Group 1: Authentication
  group('Authentication', () => {
    const loginStart = Date.now();
    
    const loginRes = http.post(
      `${BASE_URL}${API_VERSION}/auth/login`,
      JSON.stringify({
        email: user.email,
        password: user.password,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { type: 'auth' },
      }
    );

    loginDuration.add(Date.now() - loginStart);

    const loginSuccess = check(loginRes, {
      'login status is 200 or 201': (r) => r.status === 200 || r.status === 201,
      'login returns token': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.accessToken || body.access_token || body.token;
        } catch {
          return false;
        }
      },
    });

    if (!loginSuccess) {
      errorRate.add(1);
      return; // Skip rest if login fails
    }

    try {
      const body = JSON.parse(loginRes.body);
      authToken = body.accessToken || body.access_token || body.token;
    } catch (e) {
      errorRate.add(1);
      return;
    }
  });

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
  };

  sleep(1);

  // Group 2: Customer Operations
  group('Customer CRUD', () => {
    // List customers
    const listStart = Date.now();
    const listRes = http.get(`${BASE_URL}${API_VERSION}/customers`, {
      headers,
      tags: { type: 'api', operation: 'list' },
    });
    apiDuration.add(Date.now() - listStart);

    check(listRes, {
      'list customers status is 200': (r) => r.status === 200,
      'list customers response time < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);

    sleep(0.5);

    // Create customer
    const createStart = Date.now();
    const createRes = http.post(
      `${BASE_URL}${API_VERSION}/customers`,
      JSON.stringify({
        companyName: `Load Test Company ${Date.now()}`,
        customerType: 'b2b',
        industry: 'Technology',
        size: 'enterprise',
        status: 'prospect',
        primaryContact: {
          firstName: 'John',
          lastName: 'Doe',
          email: `john-${Date.now()}@loadtest.com`,
          phone: '+1234567890',
        },
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'CA',
          country: 'USA',
          zipCode: '12345',
          region: 'North America',
        },
      }),
      {
        headers,
        tags: { type: 'api', operation: 'create' },
      }
    );
    apiDuration.add(Date.now() - createStart);

    const createSuccess = check(createRes, {
      'create customer status is 201': (r) => r.status === 201,
      'create customer returns ID': (r) => {
        try {
          const body = JSON.parse(r.body);
          return !!body.id;
        } catch {
          return false;
        }
      },
    });

    if (!createSuccess) {
      errorRate.add(1);
    }
  });

  sleep(1);

  // Group 3: Lead Operations
  group('Lead Operations', () => {
    const listLeadsRes = http.get(`${BASE_URL}${API_VERSION}/leads`, {
      headers,
      tags: { type: 'api', operation: 'list' },
    });

    check(listLeadsRes, {
      'list leads status is 200': (r) => r.status === 200,
      'list leads response time < 300ms': (r) => r.timings.duration < 300,
    }) || errorRate.add(1);
  });

  sleep(1);

  // Group 4: Data Migration
  group('Migration Status', () => {
    const migrationRes = http.get(`${BASE_URL}${API_VERSION}/migration/jobs`, {
      headers,
      tags: { type: 'api', operation: 'migration' },
    });

    check(migrationRes, {
      'migration jobs status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);
  });

  sleep(1);

  // Group 5: Health & Monitoring
  group('Health Check', () => {
    const healthRes = http.get(`${BASE_URL}/health`, {
      tags: { type: 'health' },
    });

    check(healthRes, {
      'health check status is 200': (r) => r.status === 200,
      'health check response time < 100ms': (r) => r.timings.duration < 100,
    }) || errorRate.add(1);
  });

  // Random sleep between 1-3 seconds
  sleep(Math.random() * 2 + 1);
}

/**
 * Teardown function - runs once after the load test
 */
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Load test completed in ${duration} seconds`);
}

/**
 * Handle summary - custom report generation
 */
export function handleSummary(data) {
  return {
    'load-test-results.json': JSON.stringify(data, null, 2),
    stdout: `
╔══════════════════════════════════════════════════════════════╗
║           CRM MODULE - LOAD TEST RESULTS                     ║
╠══════════════════════════════════════════════════════════════╣
║ Total Requests:     ${data.metrics.http_reqs.count}
║ Failed Requests:    ${data.metrics.http_req_failed.count}
║ Request Duration:   
║   - p(95):          ${data.metrics.http_req_duration['p(95)']}ms
║   - p(99):          ${data.metrics.http_req_duration['p(99)']}ms
║ Checks Passed:      ${((data.metrics.checks.passes / data.metrics.checks.count) * 100).toFixed(2)}%
║ Error Rate:         ${(data.metrics.errors.rate * 100).toFixed(2)}%
║ VUs (max):          ${data.metrics.vus_max.max}
╚══════════════════════════════════════════════════════════════╝
`,
  };
}
