import axios, { AxiosError } from 'axios';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:3003/api/v1';

interface TestResult {
  method: string;
  path: string;
  status: number;
  success: boolean;
  error?: string;
  duration: number;
}

// Parse the ALL_API_ENDPOINTS_COMPLETE.md file
function parseEndpointsFromMarkdown(filePath: string): { method: string; path: string }[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const endpoints: { method: string; path: string }[] = [];
  
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Match lines like: - POST /api/v1/auth/register
    const match = line.match(/^-\s+(GET|POST|PUT|DELETE|PATCH)\s+(\/api\/v1\/[^\s]+)/);
    if (match) {
      endpoints.push({
        method: match[1],
        path: match[2]
      });
    }
  }
  
  return endpoints;
}

// Register user, elevate to admin, and login
async function getAuthToken(): Promise<string> {
  try {
    // Step 1: Register
    const registerPayload = {
      email: `test_${Date.now()}@example.com`,
      password: 'Test123!@#',
      firstName: 'Test',
      lastName: 'User',
      organizationName: `Test Org ${Date.now()}`,
      industry: 'technology'
    };
    
    console.log('Registering user...');
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, registerPayload);
    const userId = registerRes.data.data.user.id;
    const orgId = registerRes.data.data.organization.id;
    
    // Step 2: Elevate to admin (direct DB update)
    console.log('Elevating user to admin...');
    await axios.post(`${BASE_URL}/auth/elevate-to-admin`, { userId });
    
    // Step 3: Login
    console.log('Logging in...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: registerPayload.email,
      password: registerPayload.password
    });
    
    const token = loginRes.data.data.accessToken;
    console.log('✓ Authentication successful\n');
    return token;
  } catch (error: any) {
    console.error('Authentication failed:', error.response?.data || error.message);
    throw new Error('Failed to authenticate');
  }
}

// Replace path params with test IDs
function replacePathParams(path: string): string {
  return path
    .replace(/:id/g, '00000000-0000-0000-0000-000000000001')
    .replace(/:userId/g, '00000000-0000-0000-0000-000000000002')
    .replace(/:customerId/g, '00000000-0000-0000-0000-000000000003')
    .replace(/:organizationId/g, '00000000-0000-0000-0000-000000000001')
    .replace(/:contractId/g, '00000000-0000-0000-0000-000000000004')
    .replace(/:sessionId/g, '00000000-0000-0000-0000-000000000005')
    .replace(/:catalogId/g, '00000000-0000-0000-0000-000000000006')
    .replace(/:itemId/g, '00000000-0000-0000-0000-000000000007')
    .replace(/:showroomId/g, '00000000-0000-0000-0000-000000000008')
    .replace(/:entityType/g, 'customer')
    .replace(/:entityId/g, '00000000-0000-0000-0000-000000000009')
    .replace(/:campaignId/g, '00000000-0000-0000-0000-00000000000a')
    .replace(/:opportunityId/g, '00000000-0000-0000-0000-00000000000b')
    .replace(/:token/g, 'test-token-123');
}

// Get sample body for POST/PUT/PATCH requests
function getSampleBody(method: string, path: string): any {
  if (method === 'GET' || method === 'DELETE') {
    return undefined;
  }
  
  // Common payloads
  const commonPayloads: { [key: string]: any } = {
    '/api/v1/auth/register': {
      email: `user_${Date.now()}@example.com`,
      password: 'Test123!@#',
      firstName: 'Test',
      lastName: 'User',
      organizationName: `Test Org ${Date.now()}`,
      industry: 'technology'
    },
    '/api/v1/auth/login': {
      email: 'test@example.com',
      password: 'Test123!@#'
    },
    '/api/v1/auth/forgot-password': {
      email: 'test@example.com'
    },
    '/api/v1/auth/reset-password': {
      token: 'test-token',
      password: 'NewPassword123!@#'
    },
    '/api/v1/crm/customers': {
      name: 'Test Customer',
      email: 'customer@example.com',
      phone: '+1234567890'
    }
  };
  
  // Return specific payload if exists
  if (commonPayloads[path]) {
    return commonPayloads[path];
  }
  
  // Default minimal payloads
  if (path.includes('/customers')) {
    return { name: 'Test Customer', email: `customer_${Date.now()}@example.com` };
  }
  if (path.includes('/contracts')) {
    return { name: 'Test Contract', startDate: new Date(), endDate: new Date() };
  }
  if (path.includes('/campaigns')) {
    return { name: 'Test Campaign', type: 'email' };
  }
  if (path.includes('/opportunities')) {
    return { name: 'Test Opportunity', value: 10000, stage: 'prospecting' };
  }
  if (path.includes('/sessions')) {
    return { name: 'Test Session', type: 'demo' };
  }
  
  // Generic payload
  return { name: 'Test Item', description: 'Test description' };
}

// Test a single endpoint
async function testEndpoint(
  method: string, 
  path: string, 
  token: string
): Promise<TestResult> {
  const startTime = Date.now();
  const url = BASE_URL + replacePathParams(path.replace('/api/v1', ''));
  const body = getSampleBody(method, path);
  
  try {
    const config = {
      method: method.toLowerCase(),
      url,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: body,
      timeout: 5000,
      validateStatus: () => true // Don't throw on any status
    };
    
    const response = await axios(config);
    const duration = Date.now() - startTime;
    
    return {
      method,
      path,
      status: response.status,
      success: response.status >= 200 && response.status < 300,
      duration
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    return {
      method,
      path,
      status: error.response?.status || 0,
      success: false,
      error: error.message,
      duration
    };
  }
}

// Main test runner
async function runTests() {
  console.log('='.repeat(80));
  console.log('API ENDPOINT COMPREHENSIVE TEST');
  console.log('='.repeat(80));
  console.log();
  
  // Parse endpoints from markdown
  const markdownPath = './ALL_API_ENDPOINTS_COMPLETE.md';
  if (!fs.existsSync(markdownPath)) {
    console.error(`Error: ${markdownPath} not found!`);
    process.exit(1);
  }
  
  const endpoints = parseEndpointsFromMarkdown(markdownPath);
  console.log(`Found ${endpoints.length} endpoints to test\n`);
  
  // Get auth token
  console.log('Step 1: Authenticating...');
  console.log('-'.repeat(80));
  let token: string;
  try {
    token = await getAuthToken();
  } catch (error) {
    console.error('Failed to authenticate. Exiting.');
    process.exit(1);
  }
  
  // Test all endpoints
  console.log('Step 2: Testing endpoints...');
  console.log('-'.repeat(80));
  console.log();
  
  const results: TestResult[] = [];
  let passCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    const result = await testEndpoint(endpoint.method, endpoint.path, token);
    results.push(result);
    
    if (result.success) {
      passCount++;
      console.log(`✓ [${i + 1}/${endpoints.length}] ${endpoint.method} ${endpoint.path} - ${result.status} (${result.duration}ms)`);
    } else {
      failCount++;
      console.log(`✗ [${i + 1}/${endpoints.length}] ${endpoint.method} ${endpoint.path} - ${result.status} (${result.duration}ms)`);
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  // Print summary
  console.log();
  console.log('='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Endpoints: ${endpoints.length}`);
  console.log(`✓ Passed: ${passCount} (${((passCount / endpoints.length) * 100).toFixed(1)}%)`);
  console.log(`✗ Failed: ${failCount} (${((failCount / endpoints.length) * 100).toFixed(1)}%)`);
  console.log();
  
  // Show failed endpoints
  if (failCount > 0) {
    console.log('FAILED ENDPOINTS:');
    console.log('-'.repeat(80));
    const failed = results.filter(r => !r.success);
    failed.forEach(r => {
      console.log(`${r.method} ${r.path} - Status: ${r.status}${r.error ? ` (${r.error})` : ''}`);
    });
    console.log();
  }
  
  // Status code breakdown
  const statusCodes = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as { [key: number]: number });
  
  console.log('STATUS CODE BREAKDOWN:');
  console.log('-'.repeat(80));
  Object.entries(statusCodes)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .forEach(([code, count]) => {
      console.log(`${code}: ${count} endpoints`);
    });
  
  console.log();
  console.log('='.repeat(80));
  
  // Write results to JSON
  const resultsPath = './test-results.json';
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nDetailed results saved to: ${resultsPath}`);
  
  // Exit with appropriate code
  process.exit(failCount > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
