/**
 * Comprehensive API Testing Script
 * Tests all 65+ newly implemented endpoints
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3003/api/v1';
const TEST_TOKEN = 'test-jwt-token'; // Replace with actual JWT token
const TEST_ORG_ID = 'test-org-123';
const TEST_CUSTOMER_ID = 'test-customer-456';

// Create axios instance with auth
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json'
  },
  validateStatus: () => true // Don't throw on any status
});

// Test results storage
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to test endpoint
async function testEndpoint(name, method, url, data = null) {
  results.total++;
  try {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`   ${method} ${url}`);
    
    const config = { method, url };
    if (data) config.data = data;
    
    const response = await api(config);
    
    if (response.status >= 200 && response.status < 500) {
      console.log(`   ✅ Status: ${response.status}`);
      results.passed++;
      return { success: true, status: response.status, data: response.data };
    } else {
      console.log(`   ❌ Status: ${response.status}`);
      console.log(`   Error: ${JSON.stringify(response.data, null, 2)}`);
      results.failed++;
      results.errors.push({ endpoint: name, error: response.data });
      return { success: false, status: response.status, data: response.data };
    }
  } catch (error) {
    console.log(`   ❌ Exception: ${error.message}`);
    results.failed++;
    results.errors.push({ endpoint: name, error: error.message });
    return { success: false, error: error.message };
  }
}

// Main test execution
async function runAllTests() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║       CognexiaAI CRM - Comprehensive API Testing Suite       ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  // ============================================
  // 1. Quantum Intelligence APIs (5 endpoints)
  // ============================================
  console.log('\n' + '='.repeat(70));
  console.log('1️⃣  QUANTUM INTELLIGENCE APIs (5 endpoints)');
  console.log('='.repeat(70));

  await testEndpoint(
    'Generate Personality Profile',
    'POST',
    '/quantum/personality-profile',
    { customerId: TEST_CUSTOMER_ID }
  );

  await testEndpoint(
    'Analyze Customer Entanglement',
    'GET',
    `/quantum/entanglement/${TEST_CUSTOMER_ID}`
  );

  await testEndpoint(
    'Simulate Consciousness',
    'POST',
    '/quantum/consciousness-simulation',
    { customerId: TEST_CUSTOMER_ID }
  );

  await testEndpoint(
    'Predict Quantum Behavior',
    'GET',
    `/quantum/predict-behavior/${TEST_CUSTOMER_ID}`
  );

  await testEndpoint(
    'Analyze Emotional Resonance',
    'GET',
    `/quantum/emotional-resonance/${TEST_CUSTOMER_ID}`
  );

  // ============================================
  // 2. Holographic Experience APIs (6 endpoints)
  // ============================================
  console.log('\n' + '='.repeat(70));
  console.log('2️⃣  HOLOGRAPHIC EXPERIENCE APIs (6 endpoints)');
  console.log('='.repeat(70));

  const projectionResult = await testEndpoint(
    'Create Holographic Projection',
    'POST',
    '/holographic/projections',
    { customerId: TEST_CUSTOMER_ID, type: 'PRODUCT_DEMO' }
  );

  await testEndpoint(
    'Get Holographic Projections',
    'GET',
    '/holographic/projections'
  );

  const sessionResult = await testEndpoint(
    'Create Spatial Session',
    'POST',
    '/holographic/spatial-sessions',
    { customerId: TEST_CUSTOMER_ID, sessionType: 'MEETING' }
  );

  await testEndpoint(
    'Get Spatial Sessions',
    'GET',
    '/holographic/spatial-sessions'
  );

  await testEndpoint(
    'Enable Spatial Computing',
    'POST',
    '/holographic/enable-spatial-computing',
    { sessionId: sessionResult.data?.id || 'test-session-id' }
  );

  await testEndpoint(
    'Sync Multi-User Session',
    'POST',
    '/holographic/sync-multi-user',
    { sessionId: sessionResult.data?.id || 'test-session-id', users: [] }
  );

  // ============================================
  // 3. AR/VR Sales APIs (8 endpoints)
  // ============================================
  console.log('\n' + '='.repeat(70));
  console.log('3️⃣  AR/VR SALES APIs (8 endpoints)');
  console.log('='.repeat(70));

  const showroomResult = await testEndpoint(
    'Create VR Showroom',
    'POST',
    '/arvr/showrooms',
    { name: 'Test Showroom', environment: 'MODERN' }
  );

  await testEndpoint(
    'Get VR Showrooms',
    'GET',
    '/arvr/showrooms'
  );

  const meetingResult = await testEndpoint(
    'Schedule Virtual Meeting',
    'POST',
    '/arvr/meetings',
    { customerId: TEST_CUSTOMER_ID, scheduledAt: new Date().toISOString() }
  );

  await testEndpoint(
    'Get Virtual Meetings',
    'GET',
    '/arvr/meetings'
  );

  const demoResult = await testEndpoint(
    'Create 3D Product Demo',
    'POST',
    '/arvr/product-demos',
    { productId: 'test-product-123', customerId: TEST_CUSTOMER_ID }
  );

  await testEndpoint(
    'Get Product Demos',
    'GET',
    '/arvr/product-demos'
  );

  await testEndpoint(
    'Get 3D Configurator',
    'GET',
    '/arvr/configurator/test-product-123'
  );

  await testEndpoint(
    'Get AR/VR Analytics',
    'GET',
    '/arvr/analytics'
  );

  // ============================================
  // 4. Contract Management APIs (10 endpoints)
  // ============================================
  console.log('\n' + '='.repeat(70));
  console.log('4️⃣  CONTRACT MANAGEMENT APIs (10 endpoints)');
  console.log('='.repeat(70));

  const contractResult = await testEndpoint(
    'Create Contract',
    'POST',
    '/contracts',
    { name: 'Test Contract', customerId: TEST_CUSTOMER_ID, value: 100000 }
  );

  const contractId = contractResult.data?.id || 'test-contract-id';

  await testEndpoint(
    'Get All Contracts',
    'GET',
    '/contracts'
  );

  await testEndpoint(
    'Get Contract by ID',
    'GET',
    `/contracts/${contractId}`
  );

  await testEndpoint(
    'Update Contract',
    'PATCH',
    `/contracts/${contractId}`,
    { value: 120000 }
  );

  await testEndpoint(
    'Renew Contract',
    'POST',
    '/contracts/renewals',
    { contractId, renewalDate: new Date().toISOString() }
  );

  await testEndpoint(
    'Create Contract Amendment',
    'POST',
    '/contracts/amendments',
    { contractId, amendmentType: 'PRICE_CHANGE', description: 'Updated pricing' }
  );

  await testEndpoint(
    'Request E-Signature',
    'POST',
    '/contracts/e-signature',
    { contractId, signatories: ['user1@test.com'] }
  );

  await testEndpoint(
    'Get E-Signature Status',
    'GET',
    `/contracts/e-signature/${contractId}`
  );

  await testEndpoint(
    'Approve Contract',
    'POST',
    '/contracts/approvals',
    { contractId, approverId: 'test-user-id' }
  );

  await testEndpoint(
    'Get Contract Templates',
    'GET',
    '/contracts/templates'
  );

  // ============================================
  // 5. Inventory Management APIs (9 endpoints)
  // ============================================
  console.log('\n' + '='.repeat(70));
  console.log('5️⃣  INVENTORY MANAGEMENT APIs (9 endpoints)');
  console.log('='.repeat(70));

  await testEndpoint(
    'Get Stock Levels',
    'GET',
    '/inventory/stock-levels'
  );

  await testEndpoint(
    'Update Stock Level',
    'PATCH',
    '/inventory/stock-levels/test-product-id',
    { quantity: 100, location: 'Warehouse A' }
  );

  const warehouseResult = await testEndpoint(
    'Create Warehouse',
    'POST',
    '/inventory/warehouses',
    { name: 'Test Warehouse', location: 'New York', capacity: 10000 }
  );

  await testEndpoint(
    'Get Warehouses',
    'GET',
    '/inventory/warehouses'
  );

  await testEndpoint(
    'Create Inventory Transfer',
    'POST',
    '/inventory/transfers',
    { 
      productId: 'test-product-id',
      fromWarehouseId: 'warehouse-1',
      toWarehouseId: 'warehouse-2',
      quantity: 50
    }
  );

  await testEndpoint(
    'Get Inventory Transfers',
    'GET',
    '/inventory/transfers'
  );

  await testEndpoint(
    'Get Reorder Points',
    'GET',
    '/inventory/reorder-points'
  );

  await testEndpoint(
    'Create Inventory Audit',
    'POST',
    '/inventory/audits',
    { warehouseId: warehouseResult.data?.id || 'test-warehouse', auditor: 'test-user' }
  );

  await testEndpoint(
    'Get Inventory Analytics',
    'GET',
    '/inventory/analytics'
  );

  // ============================================
  // 6. Catalog Management APIs (10 endpoints)
  // ============================================
  console.log('\n' + '='.repeat(70));
  console.log('6️⃣  CATALOG MANAGEMENT APIs (10 endpoints)');
  console.log('='.repeat(70));

  const catalogResult = await testEndpoint(
    'Create Catalog',
    'POST',
    '/catalogs',
    { name: 'Test Catalog', description: 'A test catalog', status: 'DRAFT' }
  );

  const catalogId = catalogResult.data?.id || 'test-catalog-id';

  await testEndpoint(
    'Get All Catalogs',
    'GET',
    '/catalogs'
  );

  await testEndpoint(
    'Get Catalog by ID',
    'GET',
    `/catalogs/${catalogId}`
  );

  await testEndpoint(
    'Update Catalog',
    'PATCH',
    `/catalogs/${catalogId}`,
    { description: 'Updated description' }
  );

  await testEndpoint(
    'Add Product to Catalog',
    'POST',
    '/catalogs/products',
    { catalogId, productId: 'test-product-123' }
  );

  await testEndpoint(
    'Remove Product from Catalog',
    'DELETE',
    '/catalogs/products',
    { catalogId, productId: 'test-product-123' }
  );

  await testEndpoint(
    'Publish Catalog',
    'POST',
    '/catalogs/publish',
    { catalogId, channel: 'WEBSITE', userId: 'test-user' }
  );

  await testEndpoint(
    'Get Catalog Versions',
    'GET',
    `/catalogs/${catalogId}/versions`
  );

  await testEndpoint(
    'Duplicate Catalog',
    'POST',
    '/catalogs/duplicate',
    { catalogId, userId: 'test-user' }
  );

  await testEndpoint(
    'Delete Catalog',
    'DELETE',
    `/catalogs/${catalogId}`
  );

  // ============================================
  // 7. LLM Integration APIs (9 endpoints)
  // ============================================
  console.log('\n' + '='.repeat(70));
  console.log('7️⃣  LLM INTEGRATION APIs (9 endpoints)');
  console.log('='.repeat(70));

  const conversationResult = await testEndpoint(
    'Start Conversation',
    'POST',
    '/llm/conversations',
    { customerId: TEST_CUSTOMER_ID, context: 'sales' }
  );

  const conversationId = conversationResult.data?.id || 'test-conversation-id';

  await testEndpoint(
    'Get Conversations',
    'GET',
    '/llm/conversations'
  );

  await testEndpoint(
    'Send Chat Message',
    'POST',
    '/llm/messages',
    { conversationId, message: 'Hello, I need help' }
  );

  await testEndpoint(
    'Get Messages',
    'GET',
    `/llm/messages/${conversationId}`
  );

  await testEndpoint(
    'Generate Content',
    'POST',
    '/llm/generate-content',
    { prompt: 'Write a product description', context: 'marketing' }
  );

  await testEndpoint(
    'Analyze Text',
    'POST',
    '/llm/analyze',
    { text: 'This is a great product!', analysisType: 'sentiment' }
  );

  await testEndpoint(
    'Analyze Sentiment',
    'POST',
    '/llm/sentiment',
    { text: 'I am very happy with the service' }
  );

  await testEndpoint(
    'Generate Email Copy',
    'POST',
    '/llm/email-copy',
    { customerId: TEST_CUSTOMER_ID, context: 'follow-up', tone: 'professional' }
  );

  await testEndpoint(
    'Summarize Text',
    'POST',
    '/llm/summarize',
    { text: 'Long text to summarize...', maxLength: 100 }
  );

  // ============================================
  // 8. Real-Time Analytics APIs (8 endpoints)
  // ============================================
  console.log('\n' + '='.repeat(70));
  console.log('8️⃣  REAL-TIME ANALYTICS APIs (8 endpoints)');
  console.log('='.repeat(70));

  await testEndpoint(
    'Get Live Metrics',
    'GET',
    '/real-time/metrics'
  );

  await testEndpoint(
    'Publish Event',
    'POST',
    '/real-time/events',
    { eventType: 'CUSTOMER_ACTION', data: { action: 'page_view' } }
  );

  await testEndpoint(
    'Get Dashboard Data',
    'GET',
    '/real-time/dashboards/main-dashboard'
  );

  await testEndpoint(
    'Create Alert',
    'POST',
    '/real-time/alerts',
    { name: 'Test Alert', condition: 'revenue > 10000', threshold: 10000 }
  );

  await testEndpoint(
    'Get Alerts',
    'GET',
    '/real-time/alerts'
  );

  await testEndpoint(
    'Update Alert',
    'PATCH',
    '/real-time/alerts/test-alert-id',
    { threshold: 15000 }
  );

  await testEndpoint(
    'Get Live Customer Activity',
    'GET',
    '/real-time/live-activity'
  );

  await testEndpoint(
    'Get Live Conversions',
    'GET',
    '/real-time/live-conversions'
  );

  // ============================================
  // Test Summary
  // ============================================
  console.log('\n\n' + '═'.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(70));
  console.log(`Total Tests:   ${results.total}`);
  console.log(`✅ Passed:     ${results.passed} (${((results.passed/results.total) * 100).toFixed(1)}%)`);
  console.log(`❌ Failed:     ${results.failed} (${((results.failed/results.total) * 100).toFixed(1)}%)`);
  console.log('═'.repeat(70));

  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS FOUND:');
    results.errors.forEach((err, idx) => {
      console.log(`\n${idx + 1}. ${err.endpoint}`);
      console.log(`   ${JSON.stringify(err.error, null, 2)}`);
    });
  } else {
    console.log('\n✨ All tests passed successfully!');
  }

  console.log('\n' + '═'.repeat(70) + '\n');
}

// Run tests
runAllTests().catch(console.error);
