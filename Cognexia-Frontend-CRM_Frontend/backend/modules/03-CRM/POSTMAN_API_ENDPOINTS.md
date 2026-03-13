# CognexiaAI CRM - Complete Postman API Testing Guide

**Base URL:** `http://localhost:3003/api/v1`  
**Authentication:** Bearer Token (JWT)  
**Header:** `Authorization: Bearer YOUR_JWT_TOKEN`

---

## 🔐 Authentication Setup

Add this header to all requests:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

---

## 1️⃣ QUANTUM INTELLIGENCE APIs (5 endpoints)

### 1.1 Generate Personality Profile
```
POST http://localhost:3003/api/v1/quantum/personality-profile
```
**Body (JSON):**
```json
{
  "customerId": "test-customer-456"
}
```

### 1.2 Analyze Customer Entanglement
```
GET http://localhost:3003/api/v1/quantum/entanglement/test-customer-456
```

### 1.3 Simulate Consciousness
```
POST http://localhost:3003/api/v1/quantum/consciousness-simulation
```
**Body (JSON):**
```json
{
  "customerId": "test-customer-456"
}
```

### 1.4 Predict Quantum Behavior
```
GET http://localhost:3003/api/v1/quantum/predict-behavior/test-customer-456
```

### 1.5 Analyze Emotional Resonance
```
GET http://localhost:3003/api/v1/quantum/emotional-resonance/test-customer-456
```

---

## 2️⃣ HOLOGRAPHIC EXPERIENCE APIs (6 endpoints)

### 2.1 Create Holographic Projection
```
POST http://localhost:3003/api/v1/holographic/projections
```
**Body (JSON):**
```json
{
  "customerId": "test-customer-456",
  "type": "PRODUCT_DEMO",
  "content": "3D Product Model"
}
```

### 2.2 Get Holographic Projections
```
GET http://localhost:3003/api/v1/holographic/projections
```

### 2.3 Create Spatial Session
```
POST http://localhost:3003/api/v1/holographic/spatial-sessions
```
**Body (JSON):**
```json
{
  "customerId": "test-customer-456",
  "sessionType": "MEETING",
  "duration": 60
}
```

### 2.4 Get Spatial Sessions
```
GET http://localhost:3003/api/v1/holographic/spatial-sessions
```

### 2.5 Enable Spatial Computing
```
POST http://localhost:3003/api/v1/holographic/enable-spatial-computing
```
**Body (JSON):**
```json
{
  "sessionId": "test-session-id",
  "features": ["hand_tracking", "room_mapping"]
}
```

### 2.6 Sync Multi-User Session
```
POST http://localhost:3003/api/v1/holographic/sync-multi-user
```
**Body (JSON):**
```json
{
  "sessionId": "test-session-id",
  "users": ["user1", "user2"]
}
```

---

## 3️⃣ AR/VR SALES APIs (8 endpoints)

### 3.1 Create VR Showroom
```
POST http://localhost:3003/api/v1/arvr/showrooms
```
**Body (JSON):**
```json
{
  "name": "Luxury Car Showroom",
  "environment": "MODERN",
  "capacity": 50
}
```

### 3.2 Get VR Showrooms
```
GET http://localhost:3003/api/v1/arvr/showrooms
```

### 3.3 Schedule Virtual Meeting
```
POST http://localhost:3003/api/v1/arvr/meetings
```
**Body (JSON):**
```json
{
  "customerId": "test-customer-456",
  "scheduledAt": "2026-01-20T10:00:00Z",
  "duration": 30,
  "topic": "Product Demo"
}
```

### 3.4 Get Virtual Meetings
```
GET http://localhost:3003/api/v1/arvr/meetings
```

### 3.5 Create 3D Product Demo
```
POST http://localhost:3003/api/v1/arvr/product-demos
```
**Body (JSON):**
```json
{
  "productId": "test-product-123",
  "customerId": "test-customer-456",
  "demoType": "INTERACTIVE"
}
```

### 3.6 Get Product Demos
```
GET http://localhost:3003/api/v1/arvr/product-demos
```

### 3.7 Get 3D Configurator
```
GET http://localhost:3003/api/v1/arvr/configurator/test-product-123
```

### 3.8 Get AR/VR Analytics
```
GET http://localhost:3003/api/v1/arvr/analytics
```

---

## 4️⃣ CONTRACT MANAGEMENT APIs (10 endpoints)

### 4.1 Create Contract
```
POST http://localhost:3003/api/v1/contracts
```
**Body (JSON):**
```json
{
  "name": "Enterprise Service Agreement",
  "customerId": "test-customer-456",
  "value": 100000,
  "currency": "USD",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31"
}
```

### 4.2 Get All Contracts
```
GET http://localhost:3003/api/v1/contracts
```

### 4.3 Get Contract by ID
```
GET http://localhost:3003/api/v1/contracts/{contractId}
```
**Example:**
```
GET http://localhost:3003/api/v1/contracts/550e8400-e29b-41d4-a716-446655440000
```

### 4.4 Update Contract
```
PATCH http://localhost:3003/api/v1/contracts/{contractId}
```
**Body (JSON):**
```json
{
  "value": 120000,
  "notes": "Updated contract value"
}
```

### 4.5 Renew Contract
```
POST http://localhost:3003/api/v1/contracts/renewals
```
**Body (JSON):**
```json
{
  "contractId": "550e8400-e29b-41d4-a716-446655440000",
  "renewalDate": "2026-12-31",
  "newTermMonths": 12
}
```

### 4.6 Create Contract Amendment
```
POST http://localhost:3003/api/v1/contracts/amendments
```
**Body (JSON):**
```json
{
  "contractId": "550e8400-e29b-41d4-a716-446655440000",
  "amendmentType": "PRICE_CHANGE",
  "description": "Updated pricing structure",
  "effectiveDate": "2026-02-01"
}
```

### 4.7 Request E-Signature
```
POST http://localhost:3003/api/v1/contracts/e-signature
```
**Body (JSON):**
```json
{
  "contractId": "550e8400-e29b-41d4-a716-446655440000",
  "signatories": ["john@example.com", "jane@example.com"]
}
```

### 4.8 Get E-Signature Status
```
GET http://localhost:3003/api/v1/contracts/e-signature/{contractId}
```
**Example:**
```
GET http://localhost:3003/api/v1/contracts/e-signature/550e8400-e29b-41d4-a716-446655440000
```

### 4.9 Approve Contract
```
POST http://localhost:3003/api/v1/contracts/approvals
```
**Body (JSON):**
```json
{
  "contractId": "550e8400-e29b-41d4-a716-446655440000",
  "approverId": "approver-user-id",
  "comments": "Approved for execution"
}
```

### 4.10 Get Contract Templates
```
GET http://localhost:3003/api/v1/contracts/templates
```

---

## 5️⃣ INVENTORY MANAGEMENT APIs (9 endpoints)

### 5.1 Get Stock Levels
```
GET http://localhost:3003/api/v1/inventory/stock-levels
```

### 5.2 Update Stock Level
```
PATCH http://localhost:3003/api/v1/inventory/stock-levels/{productId}
```
**Example:**
```
PATCH http://localhost:3003/api/v1/inventory/stock-levels/test-product-123
```
**Body (JSON):**
```json
{
  "quantity": 100,
  "location": "Warehouse A",
  "reason": "Stock adjustment"
}
```

### 5.3 Create Warehouse
```
POST http://localhost:3003/api/v1/inventory/warehouses
```
**Body (JSON):**
```json
{
  "name": "Main Distribution Center",
  "location": "New York",
  "capacity": 10000,
  "address": "123 Industrial Blvd"
}
```

### 5.4 Get Warehouses
```
GET http://localhost:3003/api/v1/inventory/warehouses
```

### 5.5 Create Inventory Transfer
```
POST http://localhost:3003/api/v1/inventory/transfers
```
**Body (JSON):**
```json
{
  "productId": "test-product-123",
  "fromWarehouseId": "warehouse-1",
  "toWarehouseId": "warehouse-2",
  "quantity": 50,
  "reason": "Stock rebalancing"
}
```

### 5.6 Get Inventory Transfers
```
GET http://localhost:3003/api/v1/inventory/transfers
```

### 5.7 Get Reorder Points
```
GET http://localhost:3003/api/v1/inventory/reorder-points
```

### 5.8 Create Inventory Audit
```
POST http://localhost:3003/api/v1/inventory/audits
```
**Body (JSON):**
```json
{
  "warehouseId": "warehouse-1",
  "auditor": "audit-user-id",
  "scheduledDate": "2026-01-25"
}
```

### 5.9 Get Inventory Analytics
```
GET http://localhost:3003/api/v1/inventory/analytics
```

---

## 6️⃣ CATALOG MANAGEMENT APIs (10 endpoints)

### 6.1 Create Catalog
```
POST http://localhost:3003/api/v1/catalogs
```
**Body (JSON):**
```json
{
  "name": "Summer 2026 Collection",
  "description": "New product catalog for summer season",
  "status": "DRAFT"
}
```

### 6.2 Get All Catalogs
```
GET http://localhost:3003/api/v1/catalogs
```

### 6.3 Get Catalog by ID
```
GET http://localhost:3003/api/v1/catalogs/{catalogId}
```
**Example:**
```
GET http://localhost:3003/api/v1/catalogs/catalog-123
```

### 6.4 Update Catalog
```
PATCH http://localhost:3003/api/v1/catalogs/{catalogId}
```
**Body (JSON):**
```json
{
  "description": "Updated catalog description",
  "status": "PUBLISHED"
}
```

### 6.5 Add Product to Catalog
```
POST http://localhost:3003/api/v1/catalogs/products
```
**Body (JSON):**
```json
{
  "catalogId": "catalog-123",
  "productId": "product-456",
  "displayOrder": 1
}
```

### 6.6 Remove Product from Catalog
```
DELETE http://localhost:3003/api/v1/catalogs/products
```
**Body (JSON):**
```json
{
  "catalogId": "catalog-123",
  "productId": "product-456"
}
```

### 6.7 Publish Catalog
```
POST http://localhost:3003/api/v1/catalogs/publish
```
**Body (JSON):**
```json
{
  "catalogId": "catalog-123",
  "channel": "WEBSITE",
  "userId": "publisher-user-id"
}
```

### 6.8 Get Catalog Versions
```
GET http://localhost:3003/api/v1/catalogs/{catalogId}/versions
```
**Example:**
```
GET http://localhost:3003/api/v1/catalogs/catalog-123/versions
```

### 6.9 Duplicate Catalog
```
POST http://localhost:3003/api/v1/catalogs/duplicate
```
**Body (JSON):**
```json
{
  "catalogId": "catalog-123",
  "userId": "user-id",
  "newName": "Copy of Summer 2026 Collection"
}
```

### 6.10 Delete Catalog
```
DELETE http://localhost:3003/api/v1/catalogs/{catalogId}
```
**Example:**
```
DELETE http://localhost:3003/api/v1/catalogs/catalog-123
```

---

## 7️⃣ LLM INTEGRATION APIs (9 endpoints)

### 7.1 Start Conversation
```
POST http://localhost:3003/api/v1/llm/conversations
```
**Body (JSON):**
```json
{
  "customerId": "test-customer-456",
  "context": "sales",
  "initialMessage": "I need help choosing a product"
}
```

### 7.2 Get Conversations
```
GET http://localhost:3003/api/v1/llm/conversations
```

### 7.3 Send Chat Message
```
POST http://localhost:3003/api/v1/llm/messages
```
**Body (JSON):**
```json
{
  "conversationId": "conversation-123",
  "message": "Tell me about your premium features",
  "role": "user"
}
```

### 7.4 Get Messages
```
GET http://localhost:3003/api/v1/llm/messages/{conversationId}
```
**Example:**
```
GET http://localhost:3003/api/v1/llm/messages/conversation-123
```

### 7.5 Generate Content
```
POST http://localhost:3003/api/v1/llm/generate-content
```
**Body (JSON):**
```json
{
  "prompt": "Write a compelling product description for a smart home device",
  "context": "marketing",
  "maxTokens": 500
}
```

### 7.6 Analyze Text
```
POST http://localhost:3003/api/v1/llm/analyze
```
**Body (JSON):**
```json
{
  "text": "This is an amazing product! I love it so much!",
  "analysisType": "sentiment"
}
```

### 7.7 Analyze Sentiment
```
POST http://localhost:3003/api/v1/llm/sentiment
```
**Body (JSON):**
```json
{
  "text": "I am very happy with the service and support team"
}
```

### 7.8 Generate Email Copy
```
POST http://localhost:3003/api/v1/llm/email-copy
```
**Body (JSON):**
```json
{
  "customerId": "test-customer-456",
  "context": "follow-up",
  "tone": "professional",
  "subject": "Thank you for your interest"
}
```

### 7.9 Summarize Text
```
POST http://localhost:3003/api/v1/llm/summarize
```
**Body (JSON):**
```json
{
  "text": "Long text content here that needs to be summarized...",
  "maxLength": 100
}
```

---

## 8️⃣ REAL-TIME ANALYTICS APIs (8 endpoints)

### 8.1 Get Live Metrics
```
GET http://localhost:3003/api/v1/real-time/metrics
```

### 8.2 Publish Event
```
POST http://localhost:3003/api/v1/real-time/events
```
**Body (JSON):**
```json
{
  "eventType": "CUSTOMER_ACTION",
  "data": {
    "action": "page_view",
    "page": "/products",
    "customerId": "test-customer-456"
  }
}
```

### 8.3 Get Dashboard Data
```
GET http://localhost:3003/api/v1/real-time/dashboards/{dashboardId}
```
**Example:**
```
GET http://localhost:3003/api/v1/real-time/dashboards/main-dashboard
```

### 8.4 Create Alert
```
POST http://localhost:3003/api/v1/real-time/alerts
```
**Body (JSON):**
```json
{
  "name": "High Revenue Alert",
  "condition": "revenue > 10000",
  "threshold": 10000,
  "notifyUsers": ["user-1", "user-2"]
}
```

### 8.5 Get Alerts
```
GET http://localhost:3003/api/v1/real-time/alerts
```

### 8.6 Update Alert
```
PATCH http://localhost:3003/api/v1/real-time/alerts/{alertId}
```
**Example:**
```
PATCH http://localhost:3003/api/v1/real-time/alerts/alert-123
```
**Body (JSON):**
```json
{
  "threshold": 15000,
  "enabled": true
}
```

### 8.7 Get Live Customer Activity
```
GET http://localhost:3003/api/v1/real-time/live-activity
```

### 8.8 Get Live Conversions
```
GET http://localhost:3003/api/v1/real-time/live-conversions
```

---

## 🌐 WebSocket Connection (Real-Time Analytics)

### WebSocket Endpoint
```
ws://localhost:3003/analytics
```

**Connect using Socket.IO:**
```javascript
// JavaScript Example
const io = require('socket.io-client');
const socket = io('http://localhost:3003/analytics', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

socket.on('connect', () => {
  console.log('Connected to analytics WebSocket');
});

socket.on('live-metrics', (data) => {
  console.log('Received live metrics:', data);
});

socket.on('dashboard-update', (data) => {
  console.log('Dashboard updated:', data);
});
```

---

## 📥 Import to Postman

### Quick Import Steps:
1. Open Postman
2. Click **Import** button
3. Paste the JSON collection below
4. Or save this file and import it directly

---

## 🔑 Environment Variables for Postman

Create these environment variables in Postman:

| Variable | Value | Description |
|----------|-------|-------------|
| `base_url` | `http://localhost:3003/api/v1` | Base API URL |
| `jwt_token` | `YOUR_JWT_TOKEN` | Authentication token |
| `customer_id` | `test-customer-456` | Test customer ID |
| `product_id` | `test-product-123` | Test product ID |
| `contract_id` | `550e8400-e29b-41d4-a716-446655440000` | Test contract ID |
| `catalog_id` | `catalog-123` | Test catalog ID |
| `conversation_id` | `conversation-123` | Test conversation ID |

**Usage in Postman:**
```
{{base_url}}/quantum/personality-profile
Authorization: Bearer {{jwt_token}}
```

---

## 📋 Testing Checklist

### Before Testing:
- [ ] Backend server is running (`npm run start:dev`)
- [ ] Server is accessible at `http://localhost:3003`
- [ ] JWT token is valid and set in Postman environment
- [ ] Database is connected and migrations are run

### Test Each Module:
- [ ] Quantum Intelligence (5 endpoints)
- [ ] Holographic Experience (6 endpoints)
- [ ] AR/VR Sales (8 endpoints)
- [ ] Contract Management (10 endpoints)
- [ ] Inventory Management (9 endpoints)
- [ ] Catalog Management (10 endpoints)
- [ ] LLM Integration (9 endpoints)
- [ ] Real-Time Analytics (8 endpoints)

### Expected Status Codes:
- `200 OK` - Successful GET requests
- `201 Created` - Successful POST requests
- `204 No Content` - Successful DELETE requests
- `401 Unauthorized` - Missing or invalid JWT token
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation errors

---

## 🚀 Quick Start Commands

### 1. Start Backend
```bash
cd C:\Users\nshrm\Desktop\CognexiaAI-ERP\backend\modules\03-CRM
npm run start:dev
```

### 2. Test Server Health
```
GET http://localhost:3003/health
```

### 3. Access Swagger Documentation
```
http://localhost:3003/api/docs
```

---

## 📊 API Statistics

| Category | Count |
|----------|-------|
| Total Endpoints | 65+ |
| GET Endpoints | 23 |
| POST Endpoints | 34 |
| PATCH Endpoints | 5 |
| DELETE Endpoints | 3 |
| WebSocket Connections | 1 |

---

**Last Updated:** January 16, 2026  
**Version:** 1.0.0  
**Base Port:** 3003
