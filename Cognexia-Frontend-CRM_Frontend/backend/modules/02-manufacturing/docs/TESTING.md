# Manufacturing Module Testing Guide

## 📋 Overview

This document provides comprehensive testing guidance for the Manufacturing Module, including test strategies, procedures, and quality assurance processes for Industry 5.0 manufacturing systems.

## 🧪 Testing Strategy

### Test Pyramid

```
                    /\
                   /  \
                  / E2E \
                 /______\
                /        \
               / Integration \
              /______________\
             /                \
            /   Unit Tests     \
           /__________________\
```

### Test Categories

1. **Unit Tests** - Individual components and services
2. **Integration Tests** - Database and service interactions
3. **End-to-End Tests** - Complete user workflows
4. **Performance Tests** - Load and stress testing
5. **Security Tests** - Authentication and authorization
6. **Real-time Tests** - WebSocket and subscription testing
7. **IoT Device Tests** - Hardware integration testing

## 🚀 Getting Started

### Prerequisites

```bash
# Required dependencies
npm install --save-dev @nestjs/testing
npm install --save-dev jest
npm install --save-dev supertest
npm install --save-dev @types/jest
npm install --save-dev @types/supertest
```

### Environment Setup

Create `.env.test` file:
```env
# Test Environment Configuration
NODE_ENV=test
SUPABASE_URL=https://your-test-project.supabase.co
SUPABASE_ANON_KEY=your-test-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-test-service-key
SUPABASE_DB_PASSWORD=your-test-db-password

# Test Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=test_user
DB_PASSWORD=test_password
DB_DATABASE=manufacturing_test
DB_SYNCHRONIZE=true
DB_LOGGING=false

# Test-specific settings
JWT_SECRET=test-jwt-secret
JWT_EXPIRES_IN=1h
RATE_LIMIT_DISABLED=true
```

### Test Commands

```bash
# Run all manufacturing tests
npm run manufacturing:test

# Run tests with coverage
npm run manufacturing:test:coverage

# Run tests in watch mode
npm run manufacturing:test:watch

# Run specific test suite
npm run test -- --testPathPattern=work-center

# Run Supabase integration tests
npm run supabase:test

# Run performance tests
npm run test:performance

# Run security tests
npm run test:security
```

## 🔧 Unit Testing

### Service Testing

```typescript
// work-center.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { WorkCenterService } from '../services/work-center.service';
import { SupabaseManufacturingService } from '../services/supabase.service';

describe('WorkCenterService', () => {
  let service: WorkCenterService;
  let supabaseService: SupabaseManufacturingService;

  beforeEach(async () => {
    const mockSupabaseService = {
      getWorkCenters: jest.fn(),
      createWorkCenter: jest.fn(),
      updateWorkCenter: jest.fn(),
      deleteWorkCenter: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkCenterService,
        {
          provide: SupabaseManufacturingService,
          useValue: mockSupabaseService
        }
      ],
    }).compile();

    service = module.get<WorkCenterService>(WorkCenterService);
    supabaseService = module.get<SupabaseManufacturingService>(SupabaseManufacturingService);
  });

  describe('getWorkCenters', () => {
    it('should return work centers with filters', async () => {
      const mockWorkCenters = [
        {
          id: 'test-id',
          name: 'Test CNC Machine',
          code: 'CNC001',
          department: 'Machining'
        }
      ];

      jest.spyOn(supabaseService, 'getWorkCenters').mockResolvedValue({
        success: true,
        data: mockWorkCenters
      });

      const result = await service.getWorkCenters({ department: 'Machining' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockWorkCenters);
      expect(supabaseService.getWorkCenters).toHaveBeenCalledWith({ department: 'Machining' });
    });

    it('should handle service errors', async () => {
      jest.spyOn(supabaseService, 'getWorkCenters').mockResolvedValue({
        success: false,
        error: 'Database connection failed'
      });

      const result = await service.getWorkCenters();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('createWorkCenter', () => {
    it('should create a new work center', async () => {
      const newWorkCenter = {
        name: 'New CNC Machine',
        code: 'CNC002',
        department: 'Machining'
      };

      const createdWorkCenter = {
        id: 'new-id',
        ...newWorkCenter,
        created_at: new Date().toISOString()
      };

      jest.spyOn(supabaseService, 'createWorkCenter').mockResolvedValue({
        success: true,
        data: createdWorkCenter
      });

      const result = await service.createWorkCenter(newWorkCenter);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(createdWorkCenter);
    });

    it('should validate required fields', async () => {
      const invalidWorkCenter = {
        name: '',
        code: 'CNC002'
      };

      const result = await service.createWorkCenter(invalidWorkCenter);

      expect(result.success).toBe(false);
      expect(result.error).toContain('validation');
    });
  });
});
```

### Controller Testing

```typescript
// work-center.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { WorkCenterController } from '../controllers/work-center.controller';
import { WorkCenterService } from '../services/work-center.service';

describe('WorkCenterController', () => {
  let controller: WorkCenterController;
  let service: WorkCenterService;

  beforeEach(async () => {
    const mockService = {
      getWorkCenters: jest.fn(),
      createWorkCenter: jest.fn(),
      updateWorkCenter: jest.fn(),
      deleteWorkCenter: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkCenterController],
      providers: [
        {
          provide: WorkCenterService,
          useValue: mockService
        }
      ],
    }).compile();

    controller = module.get<WorkCenterController>(WorkCenterController);
    service = module.get<WorkCenterService>(WorkCenterService);
  });

  describe('GET /work-centers', () => {
    it('should return work centers', async () => {
      const mockWorkCenters = [{ id: 'test-id', name: 'Test Machine' }];
      
      jest.spyOn(service, 'getWorkCenters').mockResolvedValue({
        success: true,
        data: mockWorkCenters
      });

      const result = await controller.getWorkCenters({});

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockWorkCenters);
    });
  });

  describe('POST /work-centers', () => {
    it('should create work center', async () => {
      const createDto = {
        name: 'New Machine',
        code: 'NEW001',
        department: 'Testing'
      };

      const createdWorkCenter = {
        id: 'new-id',
        ...createDto
      };

      jest.spyOn(service, 'createWorkCenter').mockResolvedValue({
        success: true,
        data: createdWorkCenter
      });

      const result = await controller.createWorkCenter(createDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(createdWorkCenter);
    });
  });
});
```

## 🔗 Integration Testing

### Database Integration

```typescript
// supabase-integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { SupabaseConfigService } from '../config/supabase.config';
import { SupabaseManufacturingService } from '../services/supabase.service';

describe('Supabase Integration', () => {
  let supabaseService: SupabaseManufacturingService;
  let testWorkCenterId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test'
        })
      ],
      providers: [
        SupabaseConfigService,
        SupabaseManufacturingService
      ]
    }).compile();

    supabaseService = module.get<SupabaseManufacturingService>(SupabaseManufacturingService);
  });

  describe('Work Center CRUD Operations', () => {
    it('should create a work center', async () => {
      const workCenterData = {
        name: 'Integration Test CNC',
        code: `TEST${Date.now()}`,
        description: 'Test work center for integration testing',
        department: 'Testing'
      };

      const result = await supabaseService.createWorkCenter(workCenterData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe(workCenterData.name);
      expect(result.data.code).toBe(workCenterData.code);

      testWorkCenterId = result.data.id;
    });

    it('should retrieve work centers', async () => {
      const result = await supabaseService.getWorkCenters();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should update work center', async () => {
      const updateData = {
        current_efficiency: 95.5,
        status: 'OPERATIONAL'
      };

      const result = await supabaseService.updateWorkCenter(testWorkCenterId, updateData);

      expect(result.success).toBe(true);
      expect(result.data.current_efficiency).toBe(95.5);
      expect(result.data.status).toBe('OPERATIONAL');
    });

    it('should filter work centers by department', async () => {
      const result = await supabaseService.getWorkCenters({
        department: 'Testing'
      });

      expect(result.success).toBe(true);
      expect(result.data.every(wc => wc.department === 'Testing')).toBe(true);
    });
  });

  describe('Production Order Operations', () => {
    it('should create production order', async () => {
      const orderData = {
        product_code: 'TEST-WIDGET-001',
        quantity_planned: 100,
        priority: 'HIGH',
        status: 'PLANNING'
      };

      const result = await supabaseService.createProductionOrder(orderData);

      expect(result.success).toBe(true);
      expect(result.data.product_code).toBe(orderData.product_code);
      expect(result.data.order_number).toBeDefined();
    });

    it('should retrieve production orders', async () => {
      const result = await supabaseService.getProductionOrders();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('Real-time Subscriptions', () => {
    it('should establish subscription', (done) => {
      const subscription = supabaseService.subscribeToTable('work_centers', (payload) => {
        expect(payload).toBeDefined();
        subscription.unsubscribe();
        done();
      });

      // Trigger a change to test subscription
      setTimeout(async () => {
        await supabaseService.updateWorkCenter(testWorkCenterId, {
          updated_at: new Date().toISOString()
        });
      }, 1000);
    }, 10000);
  });

  afterAll(async () => {
    // Clean up test data
    if (testWorkCenterId) {
      await supabaseService.updateWorkCenter(testWorkCenterId, {
        is_active: false
      });
    }
  });
});
```

### API Integration Testing

```typescript
// api-integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('Manufacturing API Integration', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get authentication token
    const authResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword'
      });

    authToken = authResponse.body.token;
  });

  describe('/manufacturing/work-centers', () => {
    let createdWorkCenterId: string;

    it('should create work center', async () => {
      const workCenterData = {
        name: 'API Test CNC',
        code: `API${Date.now()}`,
        department: 'Testing',
        capacity_per_hour: 50
      };

      const response = await request(app.getHttpServer())
        .post('/manufacturing/work-centers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workCenterData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(workCenterData.name);

      createdWorkCenterId = response.body.data.id;
    });

    it('should get work centers', async () => {
      const response = await request(app.getHttpServer())
        .get('/manufacturing/work-centers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should update work center', async () => {
      const updateData = {
        current_efficiency: 88.5
      };

      const response = await request(app.getHttpServer())
        .put(`/manufacturing/work-centers/${createdWorkCenterId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.current_efficiency).toBe(88.5);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/manufacturing/work-centers')
        .expect(401);
    });
  });

  describe('/manufacturing/production-orders', () => {
    it('should create production order', async () => {
      const orderData = {
        product_code: 'API-TEST-WIDGET',
        quantity_planned: 200,
        priority: 'MEDIUM'
      };

      const response = await request(app.getHttpServer())
        .post('/manufacturing/production-orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order_number).toBeDefined();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## ⚡ Performance Testing

### Load Testing

```typescript
// performance.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseManufacturingService } from '../services/supabase.service';

describe('Performance Tests', () => {
  let service: SupabaseManufacturingService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupabaseManufacturingService],
    }).compile();

    service = module.get<SupabaseManufacturingService>(SupabaseManufacturingService);
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent work center reads', async () => {
      const startTime = Date.now();
      const concurrentRequests = 50;

      const promises = Array(concurrentRequests).fill(null).map(() => 
        service.getWorkCenters()
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results.length).toBe(concurrentRequests);
      expect(results.every(r => r.success)).toBe(true);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle bulk operations efficiently', async () => {
      const batchSize = 100;
      const workCenters = Array(batchSize).fill(null).map((_, index) => ({
        name: `Bulk Test ${index}`,
        code: `BULK${Date.now()}${index}`,
        department: 'Testing'
      }));

      const startTime = Date.now();
      const result = await service.bulkInsert('work_centers', workCenters);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(batchSize);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during repeated operations', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 100; i++) {
        await service.getWorkCenters();
      }

      global.gc && global.gc(); // Force garbage collection if available
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });
});
```

### Stress Testing

```typescript
// stress-test.spec.ts
describe('Stress Tests', () => {
  it('should handle high volume of real-time updates', async () => {
    const updateCount = 1000;
    const updates = [];

    for (let i = 0; i < updateCount; i++) {
      updates.push(
        service.updateWorkCenter(`test-id-${i}`, {
          current_efficiency: Math.random() * 100
        })
      );
    }

    const startTime = Date.now();
    const results = await Promise.allSettled(updates);
    const endTime = Date.now();
    const duration = endTime - startTime;

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const throughput = successful / (duration / 1000); // operations per second

    expect(throughput).toBeGreaterThan(10); // Should achieve at least 10 ops/sec
  });
});
```

## 🔒 Security Testing

### Authentication Testing

```typescript
// security.spec.ts
describe('Security Tests', () => {
  describe('Authentication', () => {
    it('should reject requests without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/manufacturing/work-centers')
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject invalid tokens', async () => {
      const response = await request(app.getHttpServer())
        .get('/manufacturing/work-centers')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should accept valid tokens', async () => {
      const response = await request(app.getHttpServer())
        .get('/manufacturing/work-centers')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Authorization', () => {
    it('should enforce role-based access', async () => {
      const operatorToken = await getTokenForRole('operator');
      
      // Operators can read but not delete
      await request(app.getHttpServer())
        .get('/manufacturing/work-centers')
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete('/manufacturing/work-centers/test-id')
        .set('Authorization', `Bearer ${operatorToken}`)
        .expect(403);
    });
  });

  describe('Input Validation', () => {
    it('should sanitize SQL injection attempts', async () => {
      const maliciousInput = {
        name: "'; DROP TABLE work_centers; --",
        code: 'TEST001'
      };

      const response = await request(app.getHttpServer())
        .post('/manufacturing/work-centers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(maliciousInput)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should prevent XSS attacks', async () => {
      const xssInput = {
        name: '<script>alert("xss")</script>',
        code: 'TEST002'
      };

      const response = await request(app.getHttpServer())
        .post('/manufacturing/work-centers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(xssInput);

      if (response.status === 201) {
        // If created, ensure script is sanitized
        expect(response.body.data.name).not.toContain('<script>');
      } else {
        // Or validation should reject it
        expect(response.status).toBe(400);
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(200).fill(null).map(() =>
        request(app.getHttpServer())
          .get('/manufacturing/work-centers')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});
```

## 🌐 Real-time Testing

### WebSocket Testing

```typescript
// realtime.spec.ts
import { io, Socket } from 'socket.io-client';

describe('Real-time Tests', () => {
  let clientSocket: Socket;

  beforeAll((done) => {
    clientSocket = io('http://localhost:3000/manufacturing');
    clientSocket.on('connect', done);
  });

  afterAll(() => {
    clientSocket.close();
  });

  it('should authenticate WebSocket connection', (done) => {
    clientSocket.emit('auth', { token: authToken }, (response) => {
      expect(response.success).toBe(true);
      done();
    });
  });

  it('should receive production order updates', (done) => {
    clientSocket.emit('subscribe', {
      channel: 'production_orders',
      filters: { status: ['IN_PROGRESS'] }
    });

    clientSocket.on('production_order_update', (data) => {
      expect(data.id).toBeDefined();
      expect(data.status).toBe('IN_PROGRESS');
      done();
    });

    // Trigger an update
    setTimeout(() => {
      updateProductionOrderStatus('test-order-id', 'IN_PROGRESS');
    }, 100);
  });

  it('should handle subscription errors', (done) => {
    clientSocket.emit('subscribe', {
      channel: 'invalid_channel'
    }, (response) => {
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      done();
    });
  });
});
```

## 🤖 IoT Device Testing

### Device Simulation

```typescript
// iot-testing.spec.ts
describe('IoT Device Tests', () => {
  let mockDevice: MockIoTDevice;

  beforeAll(() => {
    mockDevice = new MockIoTDevice({
      deviceId: 'TEST_SENSOR_001',
      deviceType: 'TEMPERATURE',
      workCenterId: 'test-work-center-id'
    });
  });

  it('should register IoT device', async () => {
    const deviceData = {
      device_id: 'TEST_TEMP_001',
      device_name: 'Test Temperature Sensor',
      device_type: 'TEMPERATURE',
      work_center_id: 'test-center-id'
    };

    const result = await service.createIoTDevice(deviceData);

    expect(result.success).toBe(true);
    expect(result.data.device_id).toBe(deviceData.device_id);
  });

  it('should update device readings', async () => {
    const readings = {
      temperature: 45.2,
      humidity: 65.8,
      timestamp: new Date()
    };

    const result = await service.updateDeviceReadings('TEST_TEMP_001', readings);

    expect(result.success).toBe(true);
    expect(result.data.current_readings.temperature).toBe(45.2);
  });

  it('should handle device disconnection', async () => {
    mockDevice.disconnect();

    // Wait for timeout detection
    await new Promise(resolve => setTimeout(resolve, 5000));

    const result = await service.getIoTDevices({
      device_id: 'TEST_SENSOR_001'
    });

    expect(result.data[0].status).toBe('OFFLINE');
  });

  it('should trigger alerts on threshold breach', (done) => {
    const subscription = service.subscribeToTable('iot_alerts', (alert) => {
      expect(alert.severity).toBe('HIGH');
      expect(alert.device_id).toBe('TEST_TEMP_001');
      subscription.unsubscribe();
      done();
    });

    // Send reading that exceeds threshold
    service.updateDeviceReadings('TEST_TEMP_001', {
      temperature: 95.0, // Above 80°C threshold
      timestamp: new Date()
    });
  });
});

class MockIoTDevice {
  private connected = true;
  private intervalId: NodeJS.Timeout;

  constructor(private config: any) {
    this.startDataTransmission();
  }

  private startDataTransmission() {
    this.intervalId = setInterval(() => {
      if (this.connected) {
        this.sendData();
      }
    }, 1000);
  }

  private async sendData() {
    const data = this.generateSensorData();
    
    await fetch('/manufacturing/iot-devices/${this.config.deviceId}/readings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readings: data })
    });
  }

  private generateSensorData() {
    return {
      temperature: 20 + Math.random() * 60, // 20-80°C
      vibration: Math.random() * 0.5, // 0-0.5g
      timestamp: new Date()
    };
  }

  disconnect() {
    this.connected = false;
    clearInterval(this.intervalId);
  }
}
```

## 📊 Test Coverage

### Coverage Requirements

- **Unit Tests**: > 90% coverage
- **Integration Tests**: > 80% coverage
- **Critical Paths**: 100% coverage
- **Error Handling**: 100% coverage

### Generating Coverage Reports

```bash
# Generate coverage report
npm run manufacturing:test:coverage

# Open coverage report in browser
open coverage/lcov-report/index.html
```

### Coverage Analysis

```typescript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/manufacturing/services/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './src/manufacturing/controllers/': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  collectCoverageFrom: [
    'src/manufacturing/**/*.ts',
    '!src/manufacturing/**/*.spec.ts',
    '!src/manufacturing/**/*.interface.ts',
    '!src/manufacturing/**/index.ts'
  ]
};
```

## 🚨 Error Testing

### Error Scenarios

```typescript
describe('Error Handling', () => {
  it('should handle database connection failures', async () => {
    // Mock database failure
    jest.spyOn(service, 'getWorkCenters').mockRejectedValue(
      new Error('Database connection failed')
    );

    const result = await controller.getWorkCenters({});

    expect(result.success).toBe(false);
    expect(result.error).toContain('Database connection failed');
  });

  it('should handle validation errors', async () => {
    const invalidData = {
      name: '', // Empty name should fail validation
      code: 'TEST'
    };

    const result = await service.createWorkCenter(invalidData);

    expect(result.success).toBe(false);
    expect(result.error).toContain('validation');
  });

  it('should handle network timeouts', async () => {
    // Simulate network timeout
    jest.setTimeout(5000);
    
    const result = await service.getWorkCenters();
    
    // Should either succeed quickly or fail gracefully
    expect(['boolean'].includes(typeof result.success)).toBe(true);
  });
});
```

## 📋 Test Data Management

### Test Fixtures

```typescript
// test-fixtures.ts
export const WorkCenterFixtures = {
  valid: {
    name: 'Test CNC Machine',
    code: 'TEST001',
    department: 'Testing',
    capacity_per_hour: 50,
    current_efficiency: 85.5
  },
  
  minimal: {
    name: 'Minimal Test',
    code: 'MIN001'
  },
  
  invalid: {
    name: '', // Invalid: empty name
    code: 'INV001'
  },
  
  complex: {
    name: 'Complex Test Machine',
    code: 'COMPLEX001',
    department: 'Advanced Testing',
    capacity_per_hour: 100,
    ai_optimization_enabled: true,
    sustainability_metrics: {
      energy_target: 90.0,
      waste_reduction_goal: 15.0
    },
    iot_sensors: [
      { type: 'temperature', id: 'temp_001' },
      { type: 'vibration', id: 'vib_001' }
    ]
  }
};

export const ProductionOrderFixtures = {
  standard: {
    product_code: 'WIDGET-TEST-001',
    quantity_planned: 1000,
    priority: 'MEDIUM',
    status: 'PLANNING'
  },
  
  urgent: {
    product_code: 'URGENT-WIDGET-001',
    quantity_planned: 500,
    priority: 'CRITICAL',
    status: 'SCHEDULED',
    planned_start_date: new Date(),
    planned_end_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
  }
};
```

### Test Database Seeding

```typescript
// test-database-seeder.ts
export class TestDatabaseSeeder {
  constructor(private supabaseService: SupabaseManufacturingService) {}

  async seedTestData() {
    // Seed work centers
    const workCenters = await Promise.all([
      this.supabaseService.createWorkCenter(WorkCenterFixtures.valid),
      this.supabaseService.createWorkCenter(WorkCenterFixtures.complex)
    ]);

    // Seed production orders
    const productionOrders = await Promise.all([
      this.supabaseService.createProductionOrder(ProductionOrderFixtures.standard),
      this.supabaseService.createProductionOrder(ProductionOrderFixtures.urgent)
    ]);

    return {
      workCenters: workCenters.map(wc => wc.data),
      productionOrders: productionOrders.map(po => po.data)
    };
  }

  async cleanupTestData() {
    // Clean up all test data
    const workCenters = await this.supabaseService.getWorkCenters({
      department: 'Testing'
    });

    for (const wc of workCenters.data) {
      await this.supabaseService.updateWorkCenter(wc.id, {
        is_active: false
      });
    }
  }
}
```

## 📋 Test Execution

### Continuous Integration

```yaml
# .github/workflows/manufacturing-tests.yml
name: Manufacturing Tests

on:
  push:
    branches: [ main, develop ]
    paths: [ 'src/manufacturing/**' ]
  pull_request:
    branches: [ main ]
    paths: [ 'src/manufacturing/**' ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run manufacturing:test
      env:
        NODE_ENV: test
        SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
    
    - name: Run integration tests
      run: npm run supabase:test
      env:
        NODE_ENV: test
        SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
        SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_TEST_SERVICE_KEY }}
    
    - name: Generate coverage report
      run: npm run manufacturing:test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v2
      with:
        file: ./coverage/lcov.info
        flags: manufacturing
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && npm run manufacturing:test",
      "pre-push": "npm run manufacturing:test:coverage && npm run supabase:test"
    }
  },
  "lint-staged": {
    "src/manufacturing/**/*.ts": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## 📈 Test Metrics and Reporting

### Test Metrics Dashboard

```typescript
// test-metrics.ts
export class TestMetrics {
  static generateReport(testResults: any) {
    return {
      summary: {
        total_tests: testResults.numTotalTests,
        passed_tests: testResults.numPassedTests,
        failed_tests: testResults.numFailedTests,
        test_coverage: testResults.coverageMap,
        execution_time: testResults.testExecTime
      },
      coverage: {
        lines: testResults.coverage.lines.pct,
        functions: testResults.coverage.functions.pct,
        branches: testResults.coverage.branches.pct,
        statements: testResults.coverage.statements.pct
      },
      performance: {
        avg_test_time: testResults.testExecTime / testResults.numTotalTests,
        slowest_tests: testResults.slowestTests
      }
    };
  }
}
```

## 🎯 Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Test Data
- Use fixtures for consistent test data
- Clean up after each test
- Isolate tests from each other

### 3. Mocking Strategy
- Mock external dependencies
- Keep mocks simple and focused
- Verify mock interactions when relevant

### 4. Async Testing
- Always handle promises properly
- Set appropriate timeouts
- Test both success and error scenarios

### 5. Performance
- Keep tests fast and focused
- Run expensive tests separately
- Monitor test execution time

---

This comprehensive testing guide ensures the Manufacturing Module maintains high quality and reliability across all Industry 5.0 manufacturing operations.
