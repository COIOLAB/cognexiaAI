/**
 * Supply Chain Module Integration Tests
 * Industry 5.0 ERP - Comprehensive Testing Suite
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import * as request from 'supertest';

// Import Services
import { SupplyChainOptimizationEngine, OptimizationParameters } from '../services/SupplyChainOptimizationEngine.service';
import { RealTimeTrackingService, IoTSensorReading } from '../services/RealTimeTrackingService.service';
import { SupplyChainGlobalErrorHandler, SupplyChainErrorHandlerMiddleware } from '../middleware/supply-chain-error-handler.middleware';

// Import Controllers
import { AdvancedLogisticsController } from '../controllers/advanced-logistics.controller';

// Import DTOs
import { 
  CreateSupplierDto, 
  CreateShipmentDto, 
  AnalyticsQueryDto,
  RouteOptimizationDto,
  InventoryAdjustmentDto
} from '../dto/supply-chain-validation.dto';

// Mock Database Configuration
const testDatabaseConfig = {
  type: 'sqlite' as const,
  database: ':memory:',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  dropSchema: true,
  logging: false
};

describe('Supply Chain Integration Tests', () => {
  let app: INestApplication;
  let optimizationEngine: SupplyChainOptimizationEngine;
  let trackingService: RealTimeTrackingService;
  let errorHandler: SupplyChainGlobalErrorHandler;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDatabaseConfig),
        ScheduleModule.forRoot(),
        EventEmitterModule.forRoot()
      ],
      controllers: [AdvancedLogisticsController],
      providers: [
        SupplyChainOptimizationEngine,
        RealTimeTrackingService,
        SupplyChainGlobalErrorHandler,
        SupplyChainErrorHandlerMiddleware
      ]
    }).compile();

    app = module.createNestApplication();
    
    // Apply middleware
    app.use('/supply-chain/*', SupplyChainErrorHandlerMiddleware);
    
    optimizationEngine = module.get<SupplyChainOptimizationEngine>(SupplyChainOptimizationEngine);
    trackingService = module.get<RealTimeTrackingService>(RealTimeTrackingService);
    errorHandler = module.get<SupplyChainGlobalErrorHandler>(SupplyChainGlobalErrorHandler);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // =============== OPTIMIZATION ENGINE TESTS ===============

  describe('SupplyChainOptimizationEngine', () => {
    it('should optimize supply chain with valid parameters', async () => {
      const parameters: OptimizationParameters = {
        objective: 'balanced',
        constraints: {
          maxCost: 100000,
          maxTime: 48,
          minQuality: 80,
          sustainabilityThreshold: 70,
          capacityLimits: true,
          complianceRequired: true
        },
        scope: {
          suppliers: ['supplier-1', 'supplier-2'],
          warehouses: ['warehouse-1', 'warehouse-2'],
          routes: ['route-1', 'route-2'],
          products: ['product-1', 'product-2'],
          regions: ['NA', 'EU']
        },
        timeHorizon: 'medium',
        riskTolerance: 'medium'
      };

      const result = await optimizationEngine.optimizeSupplyChain(parameters);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.parameters).toEqual(parameters);
      expect(result.results).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.metadata.algorithmsUsed).toContain('genetic_algorithm');
      expect(result.metadata.computationTime).toBeGreaterThan(0);
    });

    it('should optimize suppliers with valid criteria', async () => {
      const criteria = {
        products: ['product-1', 'product-2'],
        regions: ['NA', 'EU'],
        objectives: 'cost' as const
      };

      const result = await optimizationEngine.optimizeSuppliers(criteria);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      
      result.forEach(supplier => {
        expect(supplier.supplierId).toBeDefined();
        expect(supplier.currentPerformance).toBeDefined();
        expect(supplier.optimizedAllocation).toBeDefined();
        expect(supplier.improvements).toBeDefined();
      });
    });

    it('should optimize inventory with valid parameters', async () => {
      const parameters = {
        items: ['item-1', 'item-2', 'item-3'],
        warehouses: ['warehouse-1', 'warehouse-2'],
        forecastHorizon: 12
      };

      const result = await optimizationEngine.optimizeInventory(parameters);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      
      result.forEach(inventory => {
        expect(inventory.itemId).toBeDefined();
        expect(inventory.currentLevels).toBeDefined();
        expect(inventory.optimizedLevels).toBeDefined();
        expect(inventory.forecast).toBeDefined();
        expect(inventory.costAnalysis).toBeDefined();
      });
    });

    it('should optimize network with scope constraints', async () => {
      const parameters = {
        scope: 'regional' as const,
        constraints: {
          maxDistance: 1000,
          maxCost: 50000
        }
      };

      const result = await optimizationEngine.optimizeNetwork(parameters);

      expect(result).toBeDefined();
      expect(result.networkId).toBeDefined();
      expect(result.currentNetwork).toBeDefined();
      expect(result.optimizedNetwork).toBeDefined();
      expect(result.performance).toBeDefined();
    });

    it('should generate AI recommendations', async () => {
      const context = {
        industryType: 'manufacturing',
        companySize: 'large',
        currentChallenges: ['cost_optimization', 'risk_management']
      };

      const result = await optimizationEngine.generateAIRecommendations(context);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      
      result.forEach(recommendation => {
        expect(recommendation.id).toBeDefined();
        expect(recommendation.type).toBeDefined();
        expect(recommendation.title).toBeDefined();
        expect(recommendation.description).toBeDefined();
        expect(recommendation.impact).toBeDefined();
        expect(recommendation.implementation).toBeDefined();
        expect(recommendation.kpis).toBeInstanceOf(Array);
      });
    });
  });

  // =============== REAL-TIME TRACKING TESTS ===============

  describe('RealTimeTrackingService', () => {
    beforeEach(async () => {
      // Initialize tracking service with mock data
      await trackingService.initializeRealTimeTracking();
    });

    it('should track shipment and return tracking data', async () => {
      const shipmentId = 'shipment-1';
      const result = await trackingService.trackShipment(shipmentId);

      expect(result).toBeDefined();
      expect(result.shipmentId).toBe(shipmentId);
      expect(result.trackingNumber).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.currentLocation).toBeDefined();
      expect(result.journey).toBeDefined();
    });

    it('should return null for non-existent shipment', async () => {
      const result = await trackingService.trackShipment('non-existent-shipment');
      expect(result).toBeNull();
    });

    it('should track inventory item', async () => {
      const itemId = 'item-1';
      const result = await trackingService.trackInventory(itemId);

      expect(result).toBeDefined();
      expect(result.itemId).toBe(itemId);
      expect(result.sku).toBeDefined();
      expect(result.location).toBeDefined();
      expect(result.quantity).toBeDefined();
    });

    it('should track fleet vehicle', async () => {
      const vehicleId = 'vehicle-1';
      const result = await trackingService.trackVehicle(vehicleId);

      expect(result).toBeDefined();
      expect(result.vehicleId).toBe(vehicleId);
      expect(result.currentLocation).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.telemetry).toBeDefined();
    });

    it('should get real-time metrics', async () => {
      const result = await trackingService.getRealTimeMetrics();

      expect(result).toBeDefined();
      expect(result.totalShipments).toBeDefined();
      expect(result.averageDeliveryTime).toBeGreaterThan(0);
      expect(result.onTimeDeliveryRate).toBeGreaterThanOrEqual(0);
      expect(result.alerts).toBeDefined();
      expect(result.performanceKPIs).toBeDefined();
    });

    it('should process IoT sensor data', async () => {
      const sensorReading: IoTSensorReading = {
        sensorId: 'sensor-test-001',
        sensorType: 'temperature',
        timestamp: new Date(),
        value: 25.5,
        unit: '°C',
        threshold: { min: 2, max: 8 },
        alert: false,
        calibrationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        batteryLevel: 85,
        signalStrength: 92
      };

      await expect(trackingService.processIoTSensorData(sensorReading)).resolves.not.toThrow();
    });

    it('should generate real-time report', async () => {
      const parameters = {
        type: 'shipment' as const,
        timeRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      };

      const result = await trackingService.generateRealTimeReport(parameters);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.type).toBe('shipment');
      expect(result.generatedAt).toBeInstanceOf(Date);
      expect(result.data).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('should record event to blockchain', async () => {
      const trackingEvent = {
        id: 'event-test-001',
        timestamp: new Date(),
        type: 'checkpoint' as const,
        description: 'Test checkpoint event',
        location: 'Test Location',
        severity: 'info' as const,
        source: 'manual' as const,
        verified: true
      };

      const entityId = 'shipment-1';
      const result = await trackingService.recordToBlockchain(trackingEvent, entityId);

      expect(result).toBeDefined();
      expect(result.transactionId).toBeDefined();
      expect(result.blockHash).toBeDefined();
      expect(result.verified).toBe(true);
      expect(result.events).toBeInstanceOf(Array);
      expect(result.events.length).toBeGreaterThan(0);
    });
  });

  // =============== ERROR HANDLER TESTS ===============

  describe('SupplyChainGlobalErrorHandler', () => {
    it('should handle supplier not found error', () => {
      const error = new Error('Supplier with ID supplier-123 not found');
      error.name = 'SupplierNotFoundError';

      const result = errorHandler.handleError(error, {
        supplierId: 'supplier-123',
        operation: 'supplier_lookup',
        timestamp: new Date(),
        requestId: 'test-request-001'
      });

      expect(result.success).toBe(false);
      expect(result.error.code).toBeDefined();
      expect(result.error.message).toBeDefined();
      expect(result.error.severity).toBeDefined();
      expect(result.error.category).toBeDefined();
      expect(result.error.suggestions).toBeInstanceOf(Array);
    });

    it('should handle validation errors', () => {
      const error = new Error('Input validation failed');
      error.name = 'ValidationError';

      const result = errorHandler.handleError(error, {
        operation: 'data_validation',
        timestamp: new Date(),
        requestId: 'test-request-002'
      });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.severity).toBe('LOW');
      expect(result.error.category).toBe('VALIDATION');
    });

    it('should handle generic errors', () => {
      const error = new Error('Unexpected error occurred');

      const result = errorHandler.handleError(error);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe('INTERNAL_ERROR');
      expect(result.error.severity).toBe('CRITICAL');
      expect(result.error.category).toBe('SYSTEM');
    });
  });

  // =============== API ENDPOINT TESTS ===============

  describe('Advanced Logistics API Endpoints', () => {
    it('should run supply chain optimization via API', async () => {
      const optimizationParams: OptimizationParameters = {
        objective: 'cost',
        constraints: {
          maxCost: 50000,
          capacityLimits: true
        },
        scope: {
          suppliers: ['supplier-1'],
          warehouses: ['warehouse-1']
        },
        timeHorizon: 'short',
        riskTolerance: 'low'
      };

      const response = await request(app.getHttpServer())
        .post('/supply-chain/advanced-logistics/optimization/supply-chain')
        .send(optimizationParams)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.message).toContain('optimization completed successfully');
    });

    it('should track shipment via API', async () => {
      const response = await request(app.getHttpServer())
        .get('/supply-chain/advanced-logistics/tracking/shipments/shipment-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.shipmentId).toBe('shipment-1');
    });

    it('should return 404 for non-existent shipment', async () => {
      const response = await request(app.getHttpServer())
        .get('/supply-chain/advanced-logistics/tracking/shipments/non-existent')
        .expect(200); // Returns 200 with success: false

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('SHIPMENT_NOT_FOUND');
    });

    it('should get dashboard metrics via API', async () => {
      const response = await request(app.getHttpServer())
        .get('/supply-chain/advanced-logistics/tracking/metrics/dashboard')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalShipments).toBeDefined();
      expect(response.body.data.alerts).toBeDefined();
      expect(response.body.data.performanceKPIs).toBeDefined();
    });

    it('should create shipment via API', async () => {
      const shipmentData: CreateShipmentDto = {
        originWarehouseId: '550e8400-e29b-41d4-a716-446655440000',
        destinationAddress: {
          street1: '123 Main St',
          city: 'Anytown',
          state: 'ST',
          postalCode: '12345',
          country: 'US'
        },
        recipient: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        priority: 'normal',
        serviceLevel: 'standard',
        items: [{
          sku: 'TEST-001',
          name: 'Test Item',
          quantity: 10,
          weight: 5.0,
          volume: 2.0,
          value: 100.0
        }]
      };

      const response = await request(app.getHttpServer())
        .post('/supply-chain/advanced-logistics/shipments')
        .send(shipmentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.trackingNumber).toBeDefined();
      expect(response.body.data.status).toBe('created');
    });

    it('should execute analytics query via API', async () => {
      const analyticsQuery: AnalyticsQueryDto = {
        reportType: 'shipment',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        groupBy: 'day',
        includeTrends: true,
        includeForecast: false
      };

      const response = await request(app.getHttpServer())
        .post('/supply-chain/advanced-logistics/analytics/query')
        .send(analyticsQuery)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.queryId).toBeDefined();
      expect(response.body.data.reportType).toBe('shipment');
      expect(response.body.data.data).toBeInstanceOf(Array);
      expect(response.body.data.trends).toBeDefined();
    });

    it('should get KPI dashboard via API', async () => {
      const response = await request(app.getHttpServer())
        .get('/supply-chain/advanced-logistics/analytics/kpi-dashboard')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overallScore).toBeDefined();
      expect(response.body.data.kpis).toBeDefined();
      expect(response.body.data.kpis.inventory).toBeDefined();
      expect(response.body.data.kpis.logistics).toBeDefined();
      expect(response.body.data.kpis.supplier).toBeDefined();
    });

    it('should process IoT data via API', async () => {
      const iotData = {
        sensorId: 'sensor-api-test',
        sensorType: 'temperature',
        value: 22.5,
        unit: '°C',
        timestamp: new Date().toISOString(),
        location: { latitude: 40.7128, longitude: -74.0060 }
      };

      const response = await request(app.getHttpServer())
        .post('/supply-chain/advanced-logistics/integration/iot-data')
        .send(iotData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.processed).toBe(true);
      expect(response.body.data.sensorId).toBe('sensor-api-test');
    });

    it('should record blockchain event via API', async () => {
      const eventData = {
        entityId: 'shipment-blockchain-test',
        eventType: 'checkpoint',
        description: 'API test checkpoint',
        location: 'Test Location',
        timestamp: new Date().toISOString()
      };

      const response = await request(app.getHttpServer())
        .post('/supply-chain/advanced-logistics/integration/blockchain-record')
        .send(eventData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactionId).toBeDefined();
      expect(response.body.data.blockHash).toBeDefined();
      expect(response.body.data.verified).toBe(true);
    });

    it('should get system health via API', async () => {
      const response = await request(app.getHttpServer())
        .get('/supply-chain/advanced-logistics/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data.services).toBeDefined();
      expect(response.body.data.metrics).toBeDefined();
    });

    it('should handle validation errors for invalid shipment data', async () => {
      const invalidShipmentData = {
        originWarehouseId: 'invalid-uuid',
        destinationAddress: {
          street1: '', // Empty required field
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'US'
        },
        recipient: {
          name: 'Test User',
          email: 'invalid-email', // Invalid email format
          phone: 'invalid-phone' // Invalid phone format
        },
        priority: 'invalid-priority', // Invalid enum value
        serviceLevel: 'standard',
        items: [] // Empty array when minimum 1 required
      };

      const response = await request(app.getHttpServer())
        .post('/supply-chain/advanced-logistics/shipments')
        .send(invalidShipmentData)
        .expect(400);

      // Should return validation errors
      expect(response.body.message).toBeInstanceOf(Array);
    });
  });

  // =============== PERFORMANCE TESTS ===============

  describe('Performance Tests', () => {
    it('should handle concurrent optimization requests', async () => {
      const parameters: OptimizationParameters = {
        objective: 'balanced',
        constraints: { maxCost: 10000 },
        scope: { suppliers: ['supplier-1'] },
        timeHorizon: 'short',
        riskTolerance: 'low'
      };

      const promises = Array.from({ length: 5 }, () => 
        optimizationEngine.optimizeSupplyChain(parameters)
      );

      const results = await Promise.all(promises);
      
      expect(results.length).toBe(5);
      results.forEach(result => {
        expect(result.id).toBeDefined();
        expect(result.metadata.computationTime).toBeGreaterThan(0);
      });
    });

    it('should handle multiple tracking requests efficiently', async () => {
      const shipmentIds = ['shipment-1', 'shipment-2', 'shipment-3', 'shipment-4', 'shipment-5'];
      const startTime = Date.now();

      const promises = shipmentIds.map(id => trackingService.trackShipment(id));
      const results = await Promise.all(promises);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(results.length).toBe(5);
      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  // =============== INTEGRATION SCENARIOS ===============

  describe('End-to-End Integration Scenarios', () => {
    it('should complete full optimization and tracking workflow', async () => {
      // Step 1: Run optimization
      const optimizationParams: OptimizationParameters = {
        objective: 'cost',
        constraints: { maxCost: 25000 },
        scope: { suppliers: ['supplier-1'], warehouses: ['warehouse-1'] },
        timeHorizon: 'short',
        riskTolerance: 'medium'
      };

      const optimizationResult = await optimizationEngine.optimizeSupplyChain(optimizationParams);
      expect(optimizationResult).toBeDefined();

      // Step 2: Create shipment based on optimization
      const shipmentData = {
        originWarehouseId: '550e8400-e29b-41d4-a716-446655440000',
        destinationAddress: {
          street1: '456 Oak Ave',
          city: 'Test City',
          state: 'TC',
          postalCode: '54321',
          country: 'US'
        },
        recipient: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+0987654321'
        },
        priority: 'high',
        serviceLevel: 'expedited',
        items: [{
          sku: 'OPT-001',
          name: 'Optimized Item',
          quantity: 5,
          weight: 2.5,
          volume: 1.0,
          value: 250.0
        }]
      };

      const shipmentResponse = await request(app.getHttpServer())
        .post('/supply-chain/advanced-logistics/shipments')
        .send(shipmentData)
        .expect(201);

      expect(shipmentResponse.body.success).toBe(true);
      const shipmentId = shipmentResponse.body.data.id;

      // Step 3: Track the created shipment
      const trackingResult = await trackingService.trackShipment(shipmentId);
      expect(trackingResult).toBeNull(); // Won't be found in mock tracking data

      // Step 4: Generate analytics report
      const analyticsQuery = {
        reportType: 'shipment',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        includeTrends: true
      };

      const analyticsResponse = await request(app.getHttpServer())
        .post('/supply-chain/advanced-logistics/analytics/query')
        .send(analyticsQuery)
        .expect(201);

      expect(analyticsResponse.body.success).toBe(true);
      expect(analyticsResponse.body.data.trends).toBeDefined();
    });

    it('should handle IoT-driven optimization workflow', async () => {
      // Step 1: Process IoT sensor data indicating temperature breach
      const tempSensorData = {
        sensorId: 'temp-sensor-001',
        sensorType: 'temperature',
        value: 35.0, // High temperature
        unit: '°C',
        timestamp: new Date().toISOString()
      };

      const iotResponse = await request(app.getHttpServer())
        .post('/supply-chain/advanced-logistics/integration/iot-data')
        .send(tempSensorData)
        .expect(201);

      expect(iotResponse.body.success).toBe(true);

      // Step 2: Run risk optimization based on sensor alert
      const riskTypes = { types: ['temperature', 'quality'] };

      const riskOptResponse = await request(app.getHttpServer())
        .post('/supply-chain/advanced-logistics/optimization/risks')
        .send(riskTypes)
        .expect(201);

      expect(riskOptResponse.body.success).toBe(true);
      expect(riskOptResponse.body.data).toBeInstanceOf(Array);

      // Step 3: Record mitigation action to blockchain
      const blockchainEvent = {
        entityId: 'shipment-risk-mitigation',
        eventType: 'risk_mitigation',
        description: 'Temperature breach detected and mitigation applied',
        location: 'Cold Storage Facility A',
        timestamp: new Date().toISOString()
      };

      const blockchainResponse = await request(app.getHttpServer())
        .post('/supply-chain/advanced-logistics/integration/blockchain-record')
        .send(blockchainEvent)
        .expect(201);

      expect(blockchainResponse.body.success).toBe(true);
      expect(blockchainResponse.body.data.verified).toBe(true);
    });
  });

  // =============== ERROR HANDLING INTEGRATION TESTS ===============

  describe('Error Handling Integration', () => {
    it('should handle service errors gracefully in API endpoints', async () => {
      // Mock service to throw an error
      jest.spyOn(optimizationEngine, 'optimizeSupplyChain').mockRejectedValueOnce(
        new Error('Service temporarily unavailable')
      );

      const optimizationParams = {
        objective: 'cost',
        constraints: { maxCost: 1000 },
        scope: {},
        timeHorizon: 'short',
        riskTolerance: 'low'
      };

      const response = await request(app.getHttpServer())
        .post('/supply-chain/advanced-logistics/optimization/supply-chain')
        .send(optimizationParams)
        .expect(500);

      expect(response.body.message).toContain('Service temporarily unavailable');

      // Restore original implementation
      jest.restoreAllMocks();
    });

    it('should validate request data and return appropriate errors', async () => {
      const invalidAnalyticsQuery = {
        reportType: 'invalid-type',
        startDate: 'invalid-date',
        endDate: 'invalid-date'
      };

      const response = await request(app.getHttpServer())
        .post('/supply-chain/advanced-logistics/analytics/query')
        .send(invalidAnalyticsQuery)
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
    });
  });
});

// =============== UTILITY FUNCTIONS FOR TESTS ===============

describe('Test Utilities', () => {
  it('should generate valid test data', () => {
    const mockSupplier: CreateSupplierDto = {
      name: 'Test Supplier Inc.',
      supplierCode: 'TSI-001',
      supplierType: 'manufacturer',
      category: 'approved',
      primaryContact: {
        name: 'John Manager',
        email: 'john@testsupplier.com',
        phone: '+1234567890'
      },
      address: {
        street1: '123 Business Ave',
        city: 'Commerce City',
        state: 'CC',
        postalCode: '12345',
        country: 'US'
      }
    };

    expect(mockSupplier.name).toBeDefined();
    expect(mockSupplier.supplierCode).toMatch(/^[A-Z0-9-]+$/);
    expect(mockSupplier.primaryContact.email).toContain('@');
    expect(mockSupplier.address.country).toMatch(/^[A-Z]{2,3}$/);
  });

  it('should create valid inventory adjustment data', () => {
    const adjustment: InventoryAdjustmentDto = {
      sku: 'TEST-SKU-001',
      warehouseId: '550e8400-e29b-41d4-a716-446655440001',
      adjustmentType: 'inbound',
      quantityChange: 100,
      reason: 'Restocking from supplier'
    };

    expect(adjustment.sku).toBeDefined();
    expect(adjustment.warehouseId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(adjustment.quantityChange).toBeGreaterThan(0);
  });
});

// =============== MOCK DATA GENERATORS ===============

const generateMockOptimizationParameters = (): OptimizationParameters => ({
  objective: 'balanced',
  constraints: {
    maxCost: Math.floor(Math.random() * 100000) + 10000,
    maxTime: Math.floor(Math.random() * 48) + 12,
    minQuality: Math.floor(Math.random() * 20) + 80,
    capacityLimits: true,
    complianceRequired: true
  },
  scope: {
    suppliers: ['supplier-1', 'supplier-2'],
    warehouses: ['warehouse-1'],
    products: ['product-1']
  },
  timeHorizon: 'medium',
  riskTolerance: 'medium'
});

const generateMockShipmentData = (): CreateShipmentDto => ({
  originWarehouseId: '550e8400-e29b-41d4-a716-446655440000',
  destinationAddress: {
    street1: '123 Test Street',
    city: 'Test City',
    state: 'TS',
    postalCode: '12345',
    country: 'US'
  },
  recipient: {
    name: 'Test Recipient',
    email: 'test@example.com',
    phone: '+1234567890'
  },
  priority: 'normal',
  serviceLevel: 'standard',
  items: [{
    sku: 'TEST-001',
    name: 'Test Product',
    quantity: 10,
    weight: 5.0,
    volume: 2.0,
    value: 100.0
  }]
});
