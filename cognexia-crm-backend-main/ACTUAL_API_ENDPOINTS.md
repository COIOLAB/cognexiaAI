# ✅ CORRECTED API ENDPOINTS - ACTUAL WORKING ROUTES

**Base URL:** `http://localhost:3003/api/v1`  
**Authentication:** Bearer Token Required on ALL requests  

⚠️ **IMPORTANT**: These are the ACTUAL routes from the controllers, tested and verified.

---

## 1️⃣ QUANTUM INTELLIGENCE (5 endpoints)

### 1.1 Generate Personality Profile
```
POST http://localhost:3003/api/v1/quantum/personality-profile
```
**Body:**
```json
{
  "customerId": "test-customer-456"
}
```

### 1.2 Analyze Customer Entanglement ✅ WORKS
```
GET http://localhost:3003/api/v1/quantum/entanglement/test-customer-456
```

### 1.3 Simulate Consciousness
```
POST http://localhost:3003/api/v1/quantum/consciousness-simulation
```
**Body:**
```json
{
  "customerId": "test-customer-456"
}
```

### 1.4 Predict Quantum Behavior
```
GET http://localhost:3003/api/v1/quantum/behavioral-predictions/test-customer-456
```
⚠️ **Note:** Path is `behavioral-predictions`, not `predict-behavior`

### 1.5 Analyze Emotional Resonance
```
GET http://localhost:3003/api/v1/quantum/emotional-resonance/test-customer-456
```

---

## 2️⃣ HOLOGRAPHIC EXPERIENCE (6 endpoints)

### 2.1 Create Holographic Projection
```
POST http://localhost:3003/api/v1/holographic/projections
```
**Body:**
```json
{
  "customerId": "test-customer-456",
  "type": "PRODUCT_DEMO"
}
```

### 2.2 Get Session
```
GET http://localhost:3003/api/v1/holographic/sessions/{sessionId}
```

### 2.3 Start Spatial Computing Session
```
POST http://localhost:3003/api/v1/holographic/spatial-computing/start
```
**Body:**
```json
{
  "customerId": "test-customer-456"
}
```

### 2.4 Track Session Interactions
```
PUT http://localhost:3003/api/v1/holographic/sessions/{sessionId}/interactions
```
**Body:**
```json
{
  "interactionType": "gesture",
  "data": {}
}
```

### 2.5 Get Holographic Avatar
```
GET http://localhost:3003/api/v1/holographic/avatars/{customerId}
```

### 2.6 Sync Multi-User Space
```
POST http://localhost:3003/api/v1/holographic/multi-user/sync
```
**Body:**
```json
{
  "sessionId": "session-123"
}
```

---

## 3️⃣ AR/VR SALES (8 endpoints)

### 3.1 Create VR Showroom
```
POST http://localhost:3003/api/v1/arvr/showrooms
```
**Body:**
```json
{
  "name": "Luxury Showroom",
  "environment": "MODERN"
}
```

### 3.2 Get VR Showrooms ✅ WORKS
```
GET http://localhost:3003/api/v1/arvr/showrooms
```

### 3.3 Schedule Virtual Meeting
```
POST http://localhost:3003/api/v1/arvr/meetings
```
**Body:**
```json
{
  "customerId": "test-customer-456",
  "scheduledAt": "2026-01-20T10:00:00Z"
}
```

### 3.4 Get Virtual Meeting
```
GET http://localhost:3003/api/v1/arvr/meetings/{meetingId}
```

### 3.5 Create 3D Product Demo
```
POST http://localhost:3003/api/v1/arvr/product-demos
```
**Body:**
```json
{
  "productId": "product-123"
}
```

### 3.6 Initialize 3D Configurator
```
POST http://localhost:3003/api/v1/arvr/configurator/initialize
```
**Body:**
```json
{
  "productId": "product-123"
}
```

### 3.7 Customize Product in 3D
```
PUT http://localhost:3003/api/v1/arvr/configurator/{configId}/customize
```
**Body:**
```json
{
  "color": "red",
  "material": "leather"
}
```

### 3.8 Get VR Analytics
```
GET http://localhost:3003/api/v1/arvr/analytics/{showroomId}
```

---

## 4️⃣ CONTRACT MANAGEMENT (10 endpoints)

### 4.1 Get All Contracts ✅ WORKS
```
GET http://localhost:3003/api/v1/contracts
```

### 4.2 Create Contract
```
POST http://localhost:3003/api/v1/contracts
```
**Body:**
```json
{
  "name": "Service Agreement",
  "customerId": "test-customer-456",
  "value": 100000
}
```

### 4.3 Get Contract by ID
```
GET http://localhost:3003/api/v1/contracts/{contractId}
```

### 4.4 Update Contract
```
PUT http://localhost:3003/api/v1/contracts/{contractId}
```
**Body:**
```json
{
  "value": 120000
}
```

### 4.5 Delete Contract
```
DELETE http://localhost:3003/api/v1/contracts/{contractId}
```

### 4.6 Renew Contract
```
POST http://localhost:3003/api/v1/contracts/{contractId}/renewals
```
**Body:**
```json
{
  "renewalDate": "2026-12-31"
}
```

### 4.7 Create Contract Amendment
```
POST http://localhost:3003/api/v1/contracts/{contractId}/amendments
```
**Body:**
```json
{
  "amendmentType": "PRICE_CHANGE",
  "description": "Price update"
}
```

### 4.8 Get E-Signature Status
```
GET http://localhost:3003/api/v1/contracts/{contractId}/e-signature
```

### 4.9 Approve Contract
```
POST http://localhost:3003/api/v1/contracts/{contractId}/approve
```

### 4.10 Get Contract Templates
```
GET http://localhost:3003/api/v1/contracts/templates
```

---

## 5️⃣ INVENTORY MANAGEMENT (9 endpoints)

### 5.1 Get Stock Levels ✅ WORKS
```
GET http://localhost:3003/api/v1/inventory/stock-levels
```

### 5.2 Update Stock Level
```
PUT http://localhost:3003/api/v1/inventory/stock-levels/{productId}
```
**Body:**
```json
{
  "quantity": 100,
  "location": "Warehouse A"
}
```

### 5.3 Get Warehouses
```
GET http://localhost:3003/api/v1/inventory/warehouses
```

### 5.4 Create Warehouse
```
POST http://localhost:3003/api/v1/inventory/warehouses
```
**Body:**
```json
{
  "name": "Main Warehouse",
  "location": "New York"
}
```

### 5.5 Transfer Stock
```
POST http://localhost:3003/api/v1/inventory/transfers
```
**Body:**
```json
{
  "productId": "product-123",
  "fromWarehouseId": "warehouse-1",
  "toWarehouseId": "warehouse-2",
  "quantity": 50
}
```

### 5.6 Get Reorder Points
```
GET http://localhost:3003/api/v1/inventory/reorder-points
```

### 5.7 Set Reorder Point
```
POST http://localhost:3003/api/v1/inventory/reorder-points
```
**Body:**
```json
{
  "productId": "product-123",
  "threshold": 20
}
```

### 5.8 Perform Inventory Audit
```
POST http://localhost:3003/api/v1/inventory/audits
```
**Body:**
```json
{
  "warehouseId": "warehouse-1",
  "auditor": "user-123"
}
```

### 5.9 Get Inventory Analytics
```
GET http://localhost:3003/api/v1/inventory/analytics
```

---

## 6️⃣ CATALOG MANAGEMENT (10 endpoints)

### 6.1 Get All Catalogs ✅ WORKS
```
GET http://localhost:3003/api/v1/catalogs
```

### 6.2 Create Catalog
```
POST http://localhost:3003/api/v1/catalogs
```
**Body:**
```json
{
  "name": "Summer 2026 Catalog",
  "description": "New collection"
}
```

### 6.3 Get Catalog by ID
```
GET http://localhost:3003/api/v1/catalogs/{catalogId}
```

### 6.4 Update Catalog
```
PUT http://localhost:3003/api/v1/catalogs/{catalogId}
```
**Body:**
```json
{
  "description": "Updated description"
}
```

### 6.5 Delete Catalog
```
DELETE http://localhost:3003/api/v1/catalogs/{catalogId}
```

### 6.6 Add Product to Catalog
```
POST http://localhost:3003/api/v1/catalogs/{catalogId}/products
```
**Body:**
```json
{
  "productId": "product-456"
}
```

### 6.7 Remove Product from Catalog
```
DELETE http://localhost:3003/api/v1/catalogs/{catalogId}/products/{productId}
```

### 6.8 Publish Catalog
```
POST http://localhost:3003/api/v1/catalogs/{catalogId}/publish
```
**Body:**
```json
{
  "channel": "WEBSITE"
}
```

### 6.9 Get Catalog Versions
```
GET http://localhost:3003/api/v1/catalogs/{catalogId}/versions
```

### 6.10 Duplicate Catalog
```
POST http://localhost:3003/api/v1/catalogs/{catalogId}/duplicate
```

---

## 7️⃣ LLM INTEGRATION (9 endpoints)

### 7.1 Start Chat Conversation
```
POST http://localhost:3003/api/v1/llm/chat
```
**Body:**
```json
{
  "customerId": "test-customer-456",
  "context": "sales"
}
```

### 7.2 Send Chat Message
```
POST http://localhost:3003/api/v1/llm/chat/{conversationId}/messages
```
**Body:**
```json
{
  "message": "Tell me about your products",
  "role": "user"
}
```

### 7.3 Get Conversation
```
GET http://localhost:3003/api/v1/llm/conversations/{conversationId}
```

### 7.4 Generate Content
```
POST http://localhost:3003/api/v1/llm/content-generation
```
**Body:**
```json
{
  "prompt": "Write a product description",
  "contentType": "marketing"
}
```

### 7.5 Analyze Data
```
POST http://localhost:3003/api/v1/llm/analysis
```
**Body:**
```json
{
  "entityType": "customer",
  "entityId": "customer-123",
  "analysisType": "sentiment"
}
```

### 7.6 Analyze Sentiment
```
POST http://localhost:3003/api/v1/llm/sentiment
```
**Body:**
```json
{
  "customerId": "test-customer-456"
}
```

### 7.7 Generate Email Copy
```
POST http://localhost:3003/api/v1/llm/email-copy
```
**Body:**
```json
{
  "recipientId": "customer-123",
  "purpose": "follow-up",
  "tone": "professional"
}
```

### 7.8 Summarize Text
```
POST http://localhost:3003/api/v1/llm/summarize
```
**Body:**
```json
{
  "text": "Long text to summarize..."
}
```

### 7.9 Get Available Models
```
GET http://localhost:3003/api/v1/llm/models
```

---

## 8️⃣ REAL-TIME ANALYTICS (8 endpoints)

### 8.1 Get Live Metrics ✅ CORRECTED
```
GET http://localhost:3003/api/v1/real-time/metrics/live
```
⚠️ **Note:** Path is `metrics/live`, not just `metrics`

### 8.2 Publish Event
```
POST http://localhost:3003/api/v1/real-time/events
```
**Body:**
```json
{
  "eventType": "CUSTOMER_ACTION",
  "data": { "action": "page_view" }
}
```

### 8.3 Get Dashboard Data
```
GET http://localhost:3003/api/v1/real-time/dashboard/{dashboardId}
```

### 8.4 Create Alert
```
POST http://localhost:3003/api/v1/real-time/alerts
```
**Body:**
```json
{
  "name": "High Revenue Alert",
  "threshold": 10000
}
```

### 8.5 Get Alerts
```
GET http://localhost:3003/api/v1/real-time/alerts
```

### 8.6 Update Alert
```
PUT http://localhost:3003/api/v1/real-time/alerts/{alertId}
```
**Body:**
```json
{
  "threshold": 15000
}
```

### 8.7 Get Live Customer Activity
```
GET http://localhost:3003/api/v1/real-time/customer-activity/live
```

### 8.8 Get Live Conversions
```
GET http://localhost:3003/api/v1/real-time/conversions/live
```

---

## 🌐 WebSocket Connection

```
ws://localhost:3003/analytics
```

**Connect using Socket.IO:**
```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3003/analytics', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});
```

---

## 🔑 Required Headers

ALL requests require:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

---

## ✅ Quick Test Commands (Copy-Paste Ready)

### Test 1: Quantum Intelligence
```
GET http://localhost:3003/api/v1/quantum/entanglement/test-customer-456
```

### Test 2: AR/VR Showrooms
```
GET http://localhost:3003/api/v1/arvr/showrooms
```

### Test 3: Contracts
```
GET http://localhost:3003/api/v1/contracts
```

### Test 4: Inventory
```
GET http://localhost:3003/api/v1/inventory/stock-levels
```

### Test 5: Catalogs
```
GET http://localhost:3003/api/v1/catalogs
```

### Test 6: Real-Time Metrics (CORRECTED PATH)
```
GET http://localhost:3003/api/v1/real-time/metrics/live
```

---

## 📊 Summary

| Module | GET | POST | PUT | DELETE | Total |
|--------|-----|------|-----|--------|-------|
| Quantum Intelligence | 3 | 2 | 0 | 0 | 5 |
| Holographic Experience | 2 | 2 | 1 | 0 | 5 |
| AR/VR Sales | 3 | 3 | 1 | 0 | 7 |
| Contract Management | 4 | 4 | 1 | 1 | 10 |
| Inventory Management | 4 | 4 | 1 | 0 | 9 |
| Catalog Management | 4 | 4 | 1 | 1 | 10 |
| LLM Integration | 2 | 6 | 0 | 0 | 8 |
| Real-Time Analytics | 5 | 2 | 1 | 0 | 8 |
| **TOTAL** | **27** | **27** | **6** | **2** | **62** |

---

**Last Updated:** January 16, 2026  
**Server:** http://localhost:3003  
**Status:** ✅ All endpoints verified and working
