/**
 * Comprehensive Inventory Integration Tests
 * Industry 5.0 ERP - Advanced Inventory Management Testing
 * 
 * Complete integration test suite covering all inventory services, controllers,
 * real-time tracking, IoT integration, AI intelligence, quantum optimization,
 * error handling, and end-to-end workflows.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

// Import modules and services
import { InventoryModule } from '../inventory.module';
import { InventoryIntelligenceController } from '../controllers/inventory-intelligence.controller';
import { InventoryIntelligenceService } from '../services/inventory-intelligence.service';
import { RealTimeTrackingService } from '../services/real-time-tracking.service';
import { QuantumOptimizationService } from '../services/quantum-optimization.service';
import { AutonomousManagementService } from '../services/autonomous-management.service';
import { InventoryErrorHandlerMiddleware } from '../middleware/inventory-error-handler.middleware';

// Import entities
import { InventoryItem } from '../entities/InventoryItem.entity';
import { InventoryLocation } from '../entities/InventoryLocation.entity';
import { StockMovement } from '../entities/StockMovement.entity';

// Import DTOs and error classes
import {
  CreateInventoryItemDto,
  CreateStockMovementDto,
  IoTSensorDataDto,
  RFIDScanDto,
  BarcodeScanDto,
  AnalyticsQueryDto,
  DemandForecastRequestDto,
  QuantumOptimizationRequestDto
} from '../dto/inventory-validation.dto';

import {
  InventoryErrorFactory,
  InventoryNotFoundError,
  InsufficientStockError,
  InventoryValidationError
} from '../middleware/inventory-error-handler.middleware';

describe('Inventory Integration Tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  
  // Services
  let intelligenceService: InventoryIntelligenceService;
  let trackingService: RealTimeTrackingService;
  let quantumService: QuantumOptimizationService;
  let autonomousService: AutonomousManagementService;
  
  // Repositories
  let inventoryRepository: Repository<InventoryItem>;
  let locationRepository: Repository<InventoryLocation>;
  let stockMovementRepository: Repository<StockMovement>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [InventoryItem, InventoryLocation, StockMovement],
          synchronize: true,
          dropSchema: true,
        }),
        EventEmitterModule.forRoot(),
        ScheduleModule.forRoot(),
        InventoryModule,
      ],
    }).compile();

    app = module.createNestApplication();
    
    // Get service instances
    intelligenceService = module.get<InventoryIntelligenceService>(InventoryIntelligenceService);
    trackingService = module.get<RealTimeTrackingService>(RealTimeTrackingService);
    quantumService = module.get<QuantumOptimizationService>(QuantumOptimizationService);
    autonomousService = module.get<AutonomousManagementService>(AutonomousManagementService);
    
    // Get repository instances
    inventoryRepository = module.get<Repository<InventoryItem>>(getRepositoryToken(InventoryItem));
    locationRepository = module.get<Repository<InventoryLocation>>(getRepositoryToken(InventoryLocation));
    stockMovementRepository = module.get<Repository<StockMovement>>(getRepositoryToken(StockMovement));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await stockMovementRepository.clear();
    await inventoryRepository.clear();
    await locationRepository.clear();
  });

  // =============== CONTROLLER INTEGRATION TESTS ===============

  describe('Inventory Intelligence Controller', () => {
    describe('POST /inventory/intelligence/demand-forecast/:itemId', () => {
      it('should generate demand forecast successfully', async () => {
        // Arrange
        const item = await createTestInventoryItem();
        
        // Act & Assert
        const response = await request(app.getHttpServer())
          .post(`/inventory/intelligence/demand-forecast/${item.id}`)
          .query({ forecastPeriod: 30 })
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('forecastedDemand');
        expect(response.body).toHaveProperty('message', 'Demand forecast generated successfully');
      });

      it('should return 404 for non-existent item', async () => {
        // Act & Assert
        const response = await request(app.getHttpServer())
          .post('/inventory/intelligence/demand-forecast/non-existent-id')
          .expect(404);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('POST /inventory/intelligence/stock-optimization/:itemId', () => {
      it('should optimize stock levels successfully', async () => {
        // Arrange
        const item = await createTestInventoryItem();
        
        // Act & Assert
        const response = await request(app.getHttpServer())
          .post(`/inventory/intelligence/stock-optimization/${item.id}`)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message', 'Stock levels optimized successfully');
      });
    });

    describe('POST /inventory/intelligence/abc-analysis', () => {
      it('should perform ABC analysis successfully', async () => {
        // Arrange
        await createMultipleTestItems(10);
        
        // Act & Assert
        const response = await request(app.getHttpServer())
          .post('/inventory/intelligence/abc-analysis')
          .query({ includeVelocity: true })
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message', 'ABC analysis completed successfully');
      });
    });

    describe('GET /inventory/intelligence/health-score/:itemId', () => {
      it('should calculate inventory health score', async () => {
        // Arrange
        const item = await createTestInventoryItem();
        
        // Act & Assert
        const response = await request(app.getHttpServer())
          .get(`/inventory/intelligence/health-score/${item.id}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('healthScore');
        expect(response.body).toHaveProperty('message', 'Inventory health score calculated successfully');
      });
    });
  });

  describe('Real-Time Tracking Endpoints', () => {
    describe('GET /inventory/intelligence/live-status/:itemId', () => {
      it('should get live inventory status', async () => {
        // Arrange
        const item = await createTestInventoryItem();
        
        // Act & Assert
        const response = await request(app.getHttpServer())
          .get(`/inventory/intelligence/live-status/${item.id}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message', 'Live inventory status retrieved successfully');
      });
    });

    describe('POST /inventory/intelligence/iot-sensor-data', () => {
      it('should process IoT sensor data successfully', async () => {
        // Arrange
        const sensorData: IoTSensorDataDto = {
          sensorId: 'SENSOR_001',
          deviceId: 'DEVICE_001',
          sensorType: 'TEMPERATURE',
          value: 22.5,
          unit: 'Celsius',
          timestamp: new Date().toISOString(),
          batteryLevel: 85,
          signalStrength: 95,
          isCalibrated: true
        };
        
        // Act & Assert
        const response = await request(app.getHttpServer())
          .post('/inventory/intelligence/iot-sensor-data')
          .send(sensorData)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'IoT sensor data processed successfully');
      });

      it('should validate sensor data format', async () => {
        // Arrange
        const invalidSensorData = {
          sensorId: '', // Invalid empty string
          deviceId: 'DEVICE_001',
          sensorType: 'INVALID_TYPE', // Invalid enum value
          value: 'not-a-number', // Invalid type
          unit: 'Celsius',
          timestamp: 'invalid-date' // Invalid date format
        };
        
        // Act & Assert
        const response = await request(app.getHttpServer())
          .post('/inventory/intelligence/iot-sensor-data')
          .send(invalidSensorData)
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
      });
    });

    describe('POST /inventory/intelligence/rfid-scan', () => {
      it('should process RFID scan successfully', async () => {
        // Arrange
        const rfidScan: RFIDScanDto = {
          rfidTag: 'A1B2C3D4E5F6',
          readerId: 'READER_001',
          locationId: 'location-uuid',
          scanTimestamp: new Date().toISOString(),
          signalStrength: -45,
          operation: 'CHECK_IN'
        };
        
        // Act & Assert
        const response = await request(app.getHttpServer())
          .post('/inventory/intelligence/rfid-scan')
          .send(rfidScan)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'RFID scan processed successfully');
      });
    });

    describe('POST /inventory/intelligence/barcode-scan', () => {
      it('should process barcode scan successfully', async () => {
        // Arrange
        const barcodeScan: BarcodeScanDto = {
          barcode: '1234567890123',
          scannerId: 'SCANNER_001',
          locationId: 'location-uuid',
          scanTimestamp: new Date().toISOString(),
          scanQuality: 95,
          quantity: 1,
          operation: 'PICK'
        };
        
        // Act & Assert
        const response = await request(app.getHttpServer())
          .post('/inventory/intelligence/barcode-scan')
          .send(barcodeScan)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Barcode scan processed successfully');
      });
    });
  });

  describe('Quantum Optimization Endpoints', () => {
    describe('POST /inventory/intelligence/quantum-optimization/inventory-placement', () => {
      it('should optimize inventory placement', async () => {
        // Arrange
        const optimizationParams = {
          warehouseId: 'warehouse-001',
          itemCategories: ['ELECTRONICS', 'FURNITURE'],
          objectives: ['MINIMIZE_TRAVEL_TIME', 'OPTIMIZE_SPACE']
        };
        
        // Act & Assert
        const response = await request(app.getHttpServer())
          .post('/inventory/intelligence/quantum-optimization/inventory-placement')
          .send(optimizationParams)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message', 'Quantum inventory placement optimization completed successfully');
      });
    });

    describe('POST /inventory/intelligence/quantum-optimization/warehouse-routing', () => {
      it('should optimize warehouse routing', async () => {
        // Arrange
        const routingParams = {
          warehouseId: 'warehouse-001',
          pickingOrders: ['ORDER_001', 'ORDER_002'],
          constraints: { maxDistance: 1000 }
        };
        
        // Act & Assert
        const response = await request(app.getHttpServer())
          .post('/inventory/intelligence/quantum-optimization/warehouse-routing')
          .send(routingParams)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message', 'Quantum warehouse routing optimization completed successfully');
      });
    });
  });

  describe('Autonomous Operations Endpoints', () => {
    describe('POST /inventory/intelligence/autonomous/auto-reorder', () => {
      it('should trigger autonomous reorder process', async () => {
        // Arrange
        await createTestInventoryItem({ currentStock: 5, reorderPoint: 10 }); // Below reorder point
        
        // Act & Assert
        const response = await request(app.getHttpServer())
          .post('/inventory/intelligence/autonomous/auto-reorder')
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message', 'Autonomous reorder process executed successfully');
      });
    });

    describe('POST /inventory/intelligence/autonomous/safety-stock-adjustment', () => {
      it('should execute safety stock adjustments', async () => {
        // Arrange
        await createMultipleTestItems(5);
        
        // Act & Assert
        const response = await request(app.getHttpServer())
          .post('/inventory/intelligence/autonomous/safety-stock-adjustment')
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message', 'Safety stock adjustments completed successfully');
      });
    });

    describe('GET /inventory/intelligence/autonomous/status', () => {
      it('should get autonomous operations status', async () => {
        // Act & Assert
        const response = await request(app.getHttpServer())
          .get('/inventory/intelligence/autonomous/status')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('status');
        expect(response.body.data).toHaveProperty('statistics');
        expect(response.body).toHaveProperty('message', 'Autonomous operations status retrieved successfully');
      });
    });
  });

  describe('Analytics Endpoints', () => {
    describe('GET /inventory/intelligence/analytics/performance-metrics', () => {
      it('should get performance metrics', async () => {
        // Act & Assert
        const response = await request(app.getHttpServer())
          .get('/inventory/intelligence/analytics/performance-metrics')
          .query({ period: 'month' })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message', 'Performance metrics retrieved successfully');
      });
    });

    describe('GET /inventory/intelligence/analytics/inventory-valuation', () => {
      it('should get inventory valuation', async () => {
        // Arrange
        await createMultipleTestItems(5);
        
        // Act & Assert
        const response = await request(app.getHttpServer())
          .get('/inventory/intelligence/analytics/inventory-valuation')
          .query({ method: 'FIFO' })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('message', 'Inventory valuation retrieved successfully');
      });
    });
  });

  describe('System Health Endpoints', () => {
    describe('GET /inventory/intelligence/system-health', () => {
      it('should get comprehensive system health status', async () => {
        // Act & Assert
        const response = await request(app.getHttpServer())
          .get('/inventory/intelligence/system-health')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('status');
        expect(response.body.data).toHaveProperty('services');
        expect(response.body.data).toHaveProperty('aiModelsStatus');
        expect(response.body.data).toHaveProperty('quantumSimulators');
        expect(response.body).toHaveProperty('message', 'System health status retrieved successfully');
      });
    });

    describe('GET /inventory/intelligence/performance-stats', () => {
      it('should get real-time performance statistics', async () => {
        // Act & Assert
        const response = await request(app.getHttpServer())
          .get('/inventory/intelligence/performance-stats')
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('requests');
        expect(response.body.data).toHaveProperty('inventory');
        expect(response.body.data).toHaveProperty('ai');
        expect(response.body.data).toHaveProperty('iot');
        expect(response.body).toHaveProperty('message', 'Performance statistics retrieved successfully');
      });
    });
  });

  // =============== SERVICE INTEGRATION TESTS ===============

  describe('Inventory Intelligence Service', () => {
    it('should generate demand forecast with AI', async () => {
      // Arrange
      const item = await createTestInventoryItem();
      
      // Act
      const forecast = await intelligenceService.generateDemandForecast(item.id, 30);
      
      // Assert
      expect(forecast).toBeDefined();
      expect(forecast).toHaveProperty('forecastedDemand');
      expect(forecast).toHaveProperty('confidence');
      expect(Array.isArray(forecast.forecastedDemand)).toBe(true);
    });

    it('should optimize stock levels using AI algorithms', async () => {
      // Arrange
      const item = await createTestInventoryItem();
      
      // Act
      const optimization = await intelligenceService.optimizeStockLevels(item.id);
      
      // Assert
      expect(optimization).toBeDefined();
      expect(optimization).toHaveProperty('optimalStockLevel');
      expect(optimization).toHaveProperty('recommendedActions');
    });

    it('should perform ABC analysis with velocity scoring', async () => {
      // Arrange
      await createMultipleTestItems(20);
      
      // Act
      const analysis = await intelligenceService.performABCAnalysis();
      
      // Assert
      expect(analysis).toBeDefined();
      expect(analysis).toHaveProperty('classifications');
      expect(analysis).toHaveProperty('recommendations');
    });

    it('should calculate comprehensive inventory health score', async () => {
      // Arrange
      const item = await createTestInventoryItem();
      
      // Act
      const healthScore = await intelligenceService.calculateInventoryHealthScore(item.id);
      
      // Assert
      expect(healthScore).toBeDefined();
      expect(healthScore).toHaveProperty('overallScore');
      expect(healthScore).toHaveProperty('factors');
      expect(healthScore.overallScore).toBeGreaterThanOrEqual(0);
      expect(healthScore.overallScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Real-Time Tracking Service', () => {
    it('should process IoT sensor readings', async () => {
      // Arrange
      const sensorReading = {
        sensorId: 'TEMP_001',
        deviceId: 'DEVICE_001',
        sensorType: 'TEMPERATURE',
        value: 23.5,
        unit: 'Celsius',
        timestamp: new Date(),
        locationId: 'warehouse-001'
      };
      
      // Act & Assert
      await expect(trackingService.processSensorReading(sensorReading)).resolves.not.toThrow();
    });

    it('should get live inventory status with real-time updates', async () => {
      // Arrange
      const item = await createTestInventoryItem();
      
      // Act
      const liveStatus = await trackingService.getLiveInventoryStatus(item.id);
      
      // Assert
      expect(liveStatus).toBeDefined();
      expect(liveStatus).toHaveProperty('currentStock');
      expect(liveStatus).toHaveProperty('lastUpdated');
      expect(liveStatus).toHaveProperty('realTimeUpdates');
    });

    it('should process RFID scans for item tracking', async () => {
      // Arrange
      const rfidScan = {
        rfidTag: 'A1B2C3D4E5F6',
        readerId: 'READER_001',
        locationId: 'warehouse-001',
        scanTimestamp: new Date(),
        operation: 'CHECK_IN'
      };
      
      // Act & Assert
      await expect(trackingService.processRFIDScan(rfidScan)).resolves.not.toThrow();
    });

    it('should get warehouse activity dashboard', async () => {
      // Arrange
      const warehouseId = 'warehouse-001';
      
      // Act
      const dashboard = await trackingService.getWarehouseActivityDashboard(warehouseId);
      
      // Assert
      expect(dashboard).toBeDefined();
      expect(dashboard).toHaveProperty('totalItems');
      expect(dashboard).toHaveProperty('activeAlerts');
      expect(dashboard).toHaveProperty('recentActivity');
    });
  });

  describe('Quantum Optimization Service', () => {
    it('should optimize inventory placement using quantum algorithms', async () => {
      // Arrange
      const parameters = {
        warehouseId: 'warehouse-001',
        itemCategories: ['ELECTRONICS'],
        objectives: ['MINIMIZE_TRAVEL_TIME']
      };
      
      // Act
      const optimization = await quantumService.optimizeInventoryPlacement(parameters);
      
      // Assert
      expect(optimization).toBeDefined();
      expect(optimization).toHaveProperty('optimizationId');
      expect(optimization).toHaveProperty('solution');
      expect(optimization).toHaveProperty('metrics');
    });

    it('should optimize warehouse routing with quantum TSP solver', async () => {
      // Arrange
      const parameters = {
        warehouseId: 'warehouse-001',
        pickingOrders: ['ORDER_001', 'ORDER_002']
      };
      
      // Act
      const routing = await quantumService.optimizeWarehouseRouting(parameters);
      
      // Assert
      expect(routing).toBeDefined();
      expect(routing).toHaveProperty('optimizationId');
      expect(routing).toHaveProperty('routes');
      expect(routing).toHaveProperty('metrics');
    });

    it('should optimize slotting with quantum algorithms', async () => {
      // Arrange
      const parameters = {
        warehouseId: 'warehouse-001',
        optimizationObjectives: ['MINIMIZE_TRAVEL_TIME', 'MAXIMIZE_SPACE_UTILIZATION']
      };
      
      // Act
      const slotting = await quantumService.optimizeSlotting(parameters);
      
      // Assert
      expect(slotting).toBeDefined();
      expect(slotting).toHaveProperty('optimizationId');
      expect(slotting).toHaveProperty('slotAssignments');
      expect(slotting).toHaveProperty('metrics');
    });
  });

  describe('Autonomous Management Service', () => {
    it('should execute autonomous reorder process', async () => {
      // Arrange
      await createTestInventoryItem({ currentStock: 5, reorderPoint: 10 });
      
      // Act
      const reorderResult = await autonomousService.executeAutonomousReorder();
      
      // Assert
      expect(reorderResult).toBeDefined();
      expect(reorderResult).toHaveProperty('reordersCreated');
      expect(reorderResult).toHaveProperty('totalItems');
    });

    it('should adjust safety stock levels autonomously', async () => {
      // Arrange
      await createMultipleTestItems(3);
      
      // Act
      const adjustmentResult = await autonomousService.adjustSafetyStockLevels();
      
      // Assert
      expect(adjustmentResult).toBeDefined();
      expect(adjustmentResult).toHaveProperty('adjustmentsCount');
      expect(adjustmentResult).toHaveProperty('totalItems');
    });

    it('should execute autonomous inventory transfers', async () => {
      // Arrange - Create multiple warehouses
      await Promise.all([
        createTestLocation('warehouse-001'),
        createTestLocation('warehouse-002')
      ]);
      
      // Act
      const transferResult = await autonomousService.executeInventoryTransfers();
      
      // Assert
      expect(transferResult).toBeDefined();
      expect(transferResult).toHaveProperty('transfersExecuted');
      expect(transferResult).toHaveProperty('totalOpportunities');
    });

    it('should provide autonomous operation status', async () => {
      // Act
      const status = await autonomousService.getOperationStatus();
      
      // Assert
      expect(status).toBeDefined();
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('statistics');
      expect(status).toHaveProperty('systemHealth');
      expect(status).toHaveProperty('recentActivity');
    });
  });

  // =============== ERROR HANDLING TESTS ===============

  describe('Error Handling Integration', () => {
    it('should handle inventory not found errors', async () => {
      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/inventory/intelligence/live-status/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('severity');
      expect(response.body.error).toHaveProperty('suggestions');
      expect(response.body).toHaveProperty('retryable');
      expect(response.body).toHaveProperty('documentation');
      expect(response.body).toHaveProperty('supportInfo');
    });

    it('should handle validation errors with detailed feedback', async () => {
      // Arrange - Invalid sensor data
      const invalidData = {
        sensorId: '', // Empty required field
        deviceId: 'DEVICE_001',
        sensorType: 'INVALID_TYPE', // Invalid enum
        value: 'not-a-number', // Invalid type
        unit: 'Celsius',
        timestamp: 'invalid-date' // Invalid date
      };
      
      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/inventory/intelligence/iot-sensor-data')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error).toHaveProperty('category', 'DATA_VALIDATION');
      expect(response.body.error).toHaveProperty('userActions');
      expect(response.body.error).toHaveProperty('adminActions');
    });

    it('should provide actionable error suggestions', () => {
      // Arrange
      const error = InventoryErrorFactory.createInsufficientStock('SKU-001', 100, 50, 'LOC-001');
      
      // Assert
      expect(error.suggestions).toContain('Reduce the requested quantity to 50 or less');
      expect(error.suggestions).toContain('Check if stock is available in other locations');
      expect(error.userActions).toContain('Reduce order quantity');
      expect(error.adminActions).toContain('Review safety stock levels');
      expect(error.relatedEntities).toHaveProperty('sku', 'SKU-001');
      expect(error.relatedEntities).toHaveProperty('shortage', 50);
    });
  });

  // =============== PERFORMANCE TESTS ===============

  describe('Performance Tests', () => {
    it('should handle concurrent AI operations efficiently', async () => {
      // Arrange
      const items = await createMultipleTestItems(10);
      const startTime = Date.now();
      
      // Act - Execute multiple AI operations concurrently
      const promises = items.map(item => 
        intelligenceService.generateDemandForecast(item.id, 30)
      );
      
      const results = await Promise.all(promises);
      const executionTime = Date.now() - startTime;
      
      // Assert
      expect(results).toHaveLength(10);
      expect(results.every(result => result && result.forecastedDemand)).toBe(true);
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should process high-volume IoT data efficiently', async () => {
      // Arrange
      const sensorDataBatch = Array.from({ length: 100 }, (_, i) => ({
        sensorId: `SENSOR_${i.toString().padStart(3, '0')}`,
        deviceId: `DEVICE_${Math.floor(i / 10)}`,
        sensorType: 'TEMPERATURE',
        value: Math.random() * 30 + 10,
        unit: 'Celsius',
        timestamp: new Date(),
        locationId: `warehouse-${Math.floor(i / 50)}`
      }));
      
      const startTime = Date.now();
      
      // Act
      const promises = sensorDataBatch.map(data => 
        trackingService.processSensorReading(data)
      );
      
      await Promise.all(promises);
      const executionTime = Date.now() - startTime;
      
      // Assert
      expect(executionTime).toBeLessThan(3000); // Should complete within 3 seconds
    });

    it('should scale quantum optimization for large problems', async () => {
      // Arrange
      const parameters = {
        warehouseId: 'warehouse-001',
        itemCategories: Array.from({ length: 20 }, (_, i) => `CATEGORY_${i}`),
        objectives: ['MINIMIZE_TRAVEL_TIME', 'OPTIMIZE_SPACE', 'MINIMIZE_COST']
      };
      
      const startTime = Date.now();
      
      // Act
      const optimization = await quantumService.optimizeInventoryPlacement(parameters);
      const executionTime = Date.now() - startTime;
      
      // Assert
      expect(optimization).toBeDefined();
      expect(optimization.metrics).toHaveProperty('improvementPercentage');
      expect(executionTime).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });

  // =============== END-TO-END WORKFLOW TESTS ===============

  describe('End-to-End Workflows', () => {
    it('should execute complete inventory lifecycle', async () => {
      // Arrange
      const itemData = {
        sku: 'TEST-E2E-001',
        name: 'E2E Test Item',
        category: 'TEST',
        unitOfMeasure: 'PIECE',
        unitCost: 10.50,
        unitPrice: 15.75,
        minStockLevel: 10,
        maxStockLevel: 100,
        reorderPoint: 25,
        status: 'ACTIVE'
      };
      
      // Act & Assert - Create item
      const createResponse = await request(app.getHttpServer())
        .post('/inventory/items')
        .send(itemData)
        .expect(201);
      
      const itemId = createResponse.body.data.id;
      
      // Act & Assert - Generate demand forecast
      const forecastResponse = await request(app.getHttpServer())
        .post(`/inventory/intelligence/demand-forecast/${itemId}`)
        .expect(201);
      
      expect(forecastResponse.body.success).toBe(true);
      
      // Act & Assert - Optimize stock levels
      const optimizeResponse = await request(app.getHttpServer())
        .post(`/inventory/intelligence/stock-optimization/${itemId}`)
        .expect(201);
      
      expect(optimizeResponse.body.success).toBe(true);
      
      // Act & Assert - Calculate health score
      const healthResponse = await request(app.getHttpServer())
        .get(`/inventory/intelligence/health-score/${itemId}`)
        .expect(200);
      
      expect(healthResponse.body.success).toBe(true);
      
      // Act & Assert - Trigger autonomous reorder (if needed)
      const reorderResponse = await request(app.getHttpServer())
        .post('/inventory/intelligence/autonomous/auto-reorder')
        .expect(201);
      
      expect(reorderResponse.body.success).toBe(true);
    });

    it('should handle IoT integration workflow', async () => {
      // Arrange - Create item and location
      const item = await createTestInventoryItem();
      const location = await createTestLocation();
      
      // Act & Assert - Process temperature sensor data
      const tempResponse = await request(app.getHttpServer())
        .post('/inventory/intelligence/iot-sensor-data')
        .send({
          sensorId: 'TEMP_001',
          deviceId: 'DEVICE_001',
          sensorType: 'TEMPERATURE',
          value: 22.5,
          unit: 'Celsius',
          timestamp: new Date().toISOString(),
          locationId: location.id,
          itemId: item.id
        })
        .expect(201);
      
      expect(tempResponse.body.success).toBe(true);
      
      // Act & Assert - Process RFID scan
      const rfidResponse = await request(app.getHttpServer())
        .post('/inventory/intelligence/rfid-scan')
        .send({
          rfidTag: 'A1B2C3D4E5F6',
          readerId: 'READER_001',
          locationId: location.id,
          scanTimestamp: new Date().toISOString(),
          operation: 'CHECK_IN'
        })
        .expect(201);
      
      expect(rfidResponse.body.success).toBe(true);
      
      // Act & Assert - Check live status
      const statusResponse = await request(app.getHttpServer())
        .get(`/inventory/intelligence/live-status/${item.id}`)
        .expect(200);
      
      expect(statusResponse.body.success).toBe(true);
    });

    it('should execute quantum optimization workflow', async () => {
      // Arrange
      await createMultipleTestItems(15);
      await createTestLocation('warehouse-001');
      
      // Act & Assert - Inventory placement optimization
      const placementResponse = await request(app.getHttpServer())
        .post('/inventory/intelligence/quantum-optimization/inventory-placement')
        .send({
          warehouseId: 'warehouse-001',
          itemCategories: ['TEST'],
          objectives: ['MINIMIZE_TRAVEL_TIME']
        })
        .expect(201);
      
      expect(placementResponse.body.success).toBe(true);
      
      // Act & Assert - Warehouse routing optimization
      const routingResponse = await request(app.getHttpServer())
        .post('/inventory/intelligence/quantum-optimization/warehouse-routing')
        .send({
          warehouseId: 'warehouse-001',
          pickingOrders: ['ORDER_001', 'ORDER_002']
        })
        .expect(201);
      
      expect(routingResponse.body.success).toBe(true);
      
      // Act & Assert - Slotting optimization
      const slottingResponse = await request(app.getHttpServer())
        .post('/inventory/intelligence/quantum-optimization/slotting')
        .send({
          warehouseId: 'warehouse-001',
          optimizationObjectives: ['MINIMIZE_TRAVEL_TIME', 'OPTIMIZE_SPACE']
        })
        .expect(201);
      
      expect(slottingResponse.body.success).toBe(true);
    });
  });

  // =============== HELPER FUNCTIONS ===============

  async function createTestInventoryItem(overrides: Partial<InventoryItem> = {}): Promise<InventoryItem> {
    const defaultItem = {
      sku: `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: 'Test Inventory Item',
      description: 'Test item for integration tests',
      category: 'TEST',
      unitOfMeasure: 'PIECE',
      unitCost: 10.00,
      unitPrice: 15.00,
      currentStock: 50,
      minStockLevel: 10,
      maxStockLevel: 100,
      reorderPoint: 25,
      safetyStock: 15,
      status: 'ACTIVE',
      ...overrides
    };

    return await inventoryRepository.save(defaultItem);
  }

  async function createMultipleTestItems(count: number): Promise<InventoryItem[]> {
    const items = Array.from({ length: count }, (_, i) => ({
      sku: `TEST-BULK-${Date.now()}-${i}`,
      name: `Test Item ${i + 1}`,
      category: 'TEST',
      unitOfMeasure: 'PIECE',
      unitCost: Math.random() * 50 + 5,
      unitPrice: Math.random() * 100 + 10,
      currentStock: Math.floor(Math.random() * 100) + 10,
      minStockLevel: Math.floor(Math.random() * 20) + 5,
      maxStockLevel: Math.floor(Math.random() * 200) + 100,
      reorderPoint: Math.floor(Math.random() * 50) + 20,
      safetyStock: Math.floor(Math.random() * 30) + 10,
      status: 'ACTIVE'
    }));

    return await inventoryRepository.save(items);
  }

  async function createTestLocation(warehouseId: string = 'warehouse-001'): Promise<InventoryLocation> {
    const location = {
      locationCode: `LOC-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
      name: 'Test Location',
      locationType: 'STORAGE',
      warehouseId: warehouseId,
      maxCapacity: 1000,
      currentUtilization: 25,
      isActive: true
    };

    return await locationRepository.save(location);
  }
});
