import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ManufacturingModule } from '../../manufacturing.module';
import { WorkCenter } from '../../entities/WorkCenter';
import { ProductionLine } from '../../entities/ProductionLine';
import { BillOfMaterial } from '../../entities/BillOfMaterial';
import { ProductionOrder } from '../../entities/ProductionOrder';
import { WorkOrder } from '../../entities/WorkOrder';
import { IoTDevice } from '../../entities/IoTDevice';
import { DigitalTwin } from '../../entities/DigitalTwin';
import { QualityCheck } from '../../entities/QualityCheck';
import { ManufacturingFixtures } from '../fixtures/manufacturing.fixtures';

describe('Manufacturing Module (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.TEST_DB_HOST || 'localhost',
          port: parseInt(process.env.TEST_DB_PORT) || 5433,
          username: process.env.TEST_DB_USERNAME || 'test_user',
          password: process.env.TEST_DB_PASSWORD || 'test_password',
          database: process.env.TEST_DB_NAME || 'manufacturing_test',
          entities: [
            WorkCenter,
            ProductionLine,
            BillOfMaterial,
            ProductionOrder,
            WorkOrder,
            IoTDevice,
            DigitalTwin,
            QualityCheck,
          ],
          synchronize: true,
          dropSchema: true,
          logging: false,
        }),
        ManufacturingModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>(DataSource);
    
    await app.init();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await dataSource.query('TRUNCATE TABLE "work_centers" CASCADE');
    await dataSource.query('TRUNCATE TABLE "production_lines" CASCADE');
    await dataSource.query('TRUNCATE TABLE "bills_of_materials" CASCADE');
    await dataSource.query('TRUNCATE TABLE "production_orders" CASCADE');
    await dataSource.query('TRUNCATE TABLE "work_orders" CASCADE');
    await dataSource.query('TRUNCATE TABLE "iot_devices" CASCADE');
    await dataSource.query('TRUNCATE TABLE "digital_twins" CASCADE');
    await dataSource.query('TRUNCATE TABLE "quality_checks" CASCADE');
  });

  describe('Manufacturing Workflow E2E', () => {
    it('should complete a full manufacturing workflow', async () => {
      // Step 1: Create Work Center
      const workCenterDto = ManufacturingFixtures.createWorkCenterDto();
      const workCenterResponse = await request(app.getHttpServer())
        .post('/work-centers')
        .send(workCenterDto)
        .expect(201);

      const workCenterId = workCenterResponse.body.data.id;
      expect(workCenterId).toBeDefined();

      // Step 2: Create Production Line
      const productionLineDto = {
        ...ManufacturingFixtures.createProductionLineDto(),
        workCenterId,
      };
      const productionLineResponse = await request(app.getHttpServer())
        .post('/production-lines')
        .send(productionLineDto)
        .expect(201);

      const productionLineId = productionLineResponse.body.data.id;

      // Step 3: Create Bill of Materials
      const bomDto = ManufacturingFixtures.createBOMDto();
      const bomResponse = await request(app.getHttpServer())
        .post('/bills-of-materials')
        .send(bomDto)
        .expect(201);

      const bomId = bomResponse.body.data.id;

      // Step 4: Create Production Order
      const productionOrderDto = {
        ...ManufacturingFixtures.createProductionOrderDto(),
        billOfMaterialId: bomId,
        productionLineId,
      };
      const productionOrderResponse = await request(app.getHttpServer())
        .post('/production-orders')
        .send(productionOrderDto)
        .expect(201);

      const productionOrderId = productionOrderResponse.body.data.id;

      // Step 5: Create Work Order
      const workOrderDto = {
        ...ManufacturingFixtures.createWorkOrderDto(),
        productionOrderId,
        workCenterId,
      };
      const workOrderResponse = await request(app.getHttpServer())
        .post('/work-orders')
        .send(workOrderDto)
        .expect(201);

      const workOrderId = workOrderResponse.body.data.id;

      // Step 6: Create IoT Device
      const iotDeviceDto = {
        ...ManufacturingFixtures.createIoTDeviceDto(),
        workCenterId,
      };
      const iotDeviceResponse = await request(app.getHttpServer())
        .post('/iot-devices')
        .send(iotDeviceDto)
        .expect(201);

      const iotDeviceId = iotDeviceResponse.body.data.id;

      // Step 7: Create Digital Twin
      const digitalTwinDto = {
        ...ManufacturingFixtures.createDigitalTwinDto(),
        workCenterId,
        iotDeviceIds: [iotDeviceId],
      };
      const digitalTwinResponse = await request(app.getHttpServer())
        .post('/digital-twins')
        .send(digitalTwinDto)
        .expect(201);

      const digitalTwinId = digitalTwinResponse.body.data.id;

      // Step 8: Start Work Order
      await request(app.getHttpServer())
        .patch(`/work-orders/${workOrderId}/start`)
        .expect(200);

      // Step 9: Simulate IoT data updates
      const sensorData = {
        temperature: 75.5,
        pressure: 101.3,
        humidity: 45.2,
        vibration: 0.05,
        energy_consumption: 150.5,
      };
      await request(app.getHttpServer())
        .post(`/iot-devices/${iotDeviceId}/data`)
        .send({ sensorData })
        .expect(201);

      // Step 10: Update Digital Twin with real-time data
      await request(app.getHttpServer())
        .patch(`/digital-twins/${digitalTwinId}/sync`)
        .expect(200);

      // Step 11: Create Quality Check
      const qualityCheckDto = {
        ...ManufacturingFixtures.createQualityCheckDto(),
        workOrderId,
      };
      const qualityCheckResponse = await request(app.getHttpServer())
        .post('/quality-checks')
        .send(qualityCheckDto)
        .expect(201);

      // Step 12: Complete Quality Check
      const qualityCheckId = qualityCheckResponse.body.data.id;
      await request(app.getHttpServer())
        .patch(`/quality-checks/${qualityCheckId}/complete`)
        .send({
          status: 'passed',
          results: {
            dimensions: { passed: true, deviation: 0.01 },
            surface_finish: { passed: true, roughness: 0.8 },
            material_composition: { passed: true, purity: 99.8 },
          },
        })
        .expect(200);

      // Step 13: Complete Work Order
      await request(app.getHttpServer())
        .patch(`/work-orders/${workOrderId}/complete`)
        .send({
          actualQuantity: 95,
          qualityChecksPassed: 1,
          notes: 'Production completed successfully with minor material waste',
        })
        .expect(200);

      // Step 14: Complete Production Order
      await request(app.getHttpServer())
        .patch(`/production-orders/${productionOrderId}/complete`)
        .expect(200);

      // Step 15: Verify final states and metrics
      const finalWorkCenterResponse = await request(app.getHttpServer())
        .get(`/work-centers/${workCenterId}/performance`)
        .expect(200);

      expect(finalWorkCenterResponse.body.data).toHaveProperty('oee');
      expect(finalWorkCenterResponse.body.data).toHaveProperty('efficiency');
      expect(finalWorkCenterResponse.body.data).toHaveProperty('availability');

      const finalProductionOrderResponse = await request(app.getHttpServer())
        .get(`/production-orders/${productionOrderId}`)
        .expect(200);

      expect(finalProductionOrderResponse.body.data.status).toBe('completed');

      const finalWorkOrderResponse = await request(app.getHttpServer())
        .get(`/work-orders/${workOrderId}`)
        .expect(200);

      expect(finalWorkOrderResponse.body.data.status).toBe('completed');
      expect(finalWorkOrderResponse.body.data.actualQuantity).toBe(95);
    });

    it('should handle manufacturing workflow with quality failure', async () => {
      // Create minimal setup
      const workCenterDto = ManufacturingFixtures.createWorkCenterDto();
      const workCenterResponse = await request(app.getHttpServer())
        .post('/work-centers')
        .send(workCenterDto)
        .expect(201);

      const workCenterId = workCenterResponse.body.data.id;

      const bomDto = ManufacturingFixtures.createBOMDto();
      const bomResponse = await request(app.getHttpServer())
        .post('/bills-of-materials')
        .send(bomDto)
        .expect(201);

      const bomId = bomResponse.body.data.id;

      const productionOrderDto = {
        ...ManufacturingFixtures.createProductionOrderDto(),
        billOfMaterialId: bomId,
      };
      const productionOrderResponse = await request(app.getHttpServer())
        .post('/production-orders')
        .send(productionOrderDto)
        .expect(201);

      const productionOrderId = productionOrderResponse.body.data.id;

      const workOrderDto = {
        ...ManufacturingFixtures.createWorkOrderDto(),
        productionOrderId,
        workCenterId,
      };
      const workOrderResponse = await request(app.getHttpServer())
        .post('/work-orders')
        .send(workOrderDto)
        .expect(201);

      const workOrderId = workOrderResponse.body.data.id;

      // Start work order
      await request(app.getHttpServer())
        .patch(`/work-orders/${workOrderId}/start`)
        .expect(200);

      // Create failing quality check
      const qualityCheckDto = {
        ...ManufacturingFixtures.createQualityCheckDto(),
        workOrderId,
      };
      const qualityCheckResponse = await request(app.getHttpServer())
        .post('/quality-checks')
        .send(qualityCheckDto)
        .expect(201);

      const qualityCheckId = qualityCheckResponse.body.data.id;

      // Fail quality check
      await request(app.getHttpServer())
        .patch(`/quality-checks/${qualityCheckId}/complete`)
        .send({
          status: 'failed',
          results: {
            dimensions: { passed: false, deviation: 0.5 },
            surface_finish: { passed: false, roughness: 2.5 },
            material_composition: { passed: true, purity: 99.8 },
          },
          issues: ['Dimension out of tolerance', 'Poor surface finish'],
        })
        .expect(200);

      // Work order should be able to handle quality failure
      const workOrderStatusResponse = await request(app.getHttpServer())
        .get(`/work-orders/${workOrderId}`)
        .expect(200);

      expect(workOrderStatusResponse.body.data.qualityIssues).toBeDefined();
    });

    it('should handle equipment maintenance workflow', async () => {
      // Create work center
      const workCenterDto = ManufacturingFixtures.createWorkCenterDto();
      const workCenterResponse = await request(app.getHttpServer())
        .post('/work-centers')
        .send(workCenterDto)
        .expect(201);

      const workCenterId = workCenterResponse.body.data.id;

      // Schedule maintenance
      const maintenanceDto = {
        type: 'preventive',
        scheduledDate: new Date('2024-01-20T10:00:00Z'),
        estimatedDuration: 240,
        description: 'Routine maintenance check',
      };

      const maintenanceResponse = await request(app.getHttpServer())
        .post(`/work-centers/${workCenterId}/maintenance`)
        .send(maintenanceDto)
        .expect(201);

      expect(maintenanceResponse.body.data.status).toBe('scheduled');

      // Check work center availability during maintenance
      const availabilityResponse = await request(app.getHttpServer())
        .get(`/work-centers/${workCenterId}/status`)
        .expect(200);

      expect(availabilityResponse.body.data).toHaveProperty('maintenanceRequired');
    });

    it('should handle IoT device monitoring and alerts', async () => {
      // Create work center and IoT device
      const workCenterDto = ManufacturingFixtures.createWorkCenterDto();
      const workCenterResponse = await request(app.getHttpServer())
        .post('/work-centers')
        .send(workCenterDto)
        .expect(201);

      const workCenterId = workCenterResponse.body.data.id;

      const iotDeviceDto = {
        ...ManufacturingFixtures.createIoTDeviceDto(),
        workCenterId,
      };
      const iotDeviceResponse = await request(app.getHttpServer())
        .post('/iot-devices')
        .send(iotDeviceDto)
        .expect(201);

      const iotDeviceId = iotDeviceResponse.body.data.id;

      // Send normal sensor data
      await request(app.getHttpServer())
        .post(`/iot-devices/${iotDeviceId}/data`)
        .send({
          sensorData: {
            temperature: 75.5,
            pressure: 101.3,
            humidity: 45.2,
            vibration: 0.05,
            energy_consumption: 150.5,
          },
        })
        .expect(201);

      // Send abnormal sensor data that should trigger alerts
      await request(app.getHttpServer())
        .post(`/iot-devices/${iotDeviceId}/data`)
        .send({
          sensorData: {
            temperature: 95.0, // High temperature
            pressure: 85.0, // Low pressure
            humidity: 45.2,
            vibration: 0.15, // High vibration
            energy_consumption: 250.0, // High energy consumption
          },
        })
        .expect(201);

      // Check for alerts
      const alertsResponse = await request(app.getHttpServer())
        .get(`/iot-devices/${iotDeviceId}/alerts`)
        .expect(200);

      expect(alertsResponse.body.data.alerts).toBeDefined();
      expect(alertsResponse.body.data.alerts.length).toBeGreaterThan(0);
    });

    it('should calculate accurate OEE metrics', async () => {
      // Create work center
      const workCenterDto = ManufacturingFixtures.createWorkCenterDto();
      const workCenterResponse = await request(app.getHttpServer())
        .post('/work-centers')
        .send(workCenterDto)
        .expect(201);

      const workCenterId = workCenterResponse.body.data.id;

      // Create production data that affects OEE
      const bomDto = ManufacturingFixtures.createBOMDto();
      const bomResponse = await request(app.getHttpServer())
        .post('/bills-of-materials')
        .send(bomDto)
        .expect(201);

      const bomId = bomResponse.body.data.id;

      // Create multiple work orders to generate OEE data
      for (let i = 0; i < 3; i++) {
        const productionOrderDto = {
          ...ManufacturingFixtures.createProductionOrderDto(),
          billOfMaterialId: bomId,
          orderNumber: `PO-00${i + 1}`,
        };
        const productionOrderResponse = await request(app.getHttpServer())
          .post('/production-orders')
          .send(productionOrderDto)
          .expect(201);

        const workOrderDto = {
          ...ManufacturingFixtures.createWorkOrderDto(),
          productionOrderId: productionOrderResponse.body.data.id,
          workCenterId,
          orderNumber: `WO-00${i + 1}`,
        };
        const workOrderResponse = await request(app.getHttpServer())
          .post('/work-orders')
          .send(workOrderDto)
          .expect(201);

        // Complete the work order
        await request(app.getHttpServer())
          .patch(`/work-orders/${workOrderResponse.body.data.id}/start`)
          .expect(200);

        await request(app.getHttpServer())
          .patch(`/work-orders/${workOrderResponse.body.data.id}/complete`)
          .send({
            actualQuantity: 90 + i * 5, // Varying quantities
            qualityChecksPassed: 1,
          })
          .expect(200);
      }

      // Calculate OEE
      const oeeResponse = await request(app.getHttpServer())
        .get(`/work-centers/${workCenterId}/oee`)
        .expect(200);

      expect(oeeResponse.body.data).toHaveProperty('oee');
      expect(oeeResponse.body.data).toHaveProperty('efficiency');
      expect(oeeResponse.body.data).toHaveProperty('availability');
      expect(oeeResponse.body.data).toHaveProperty('quality');
      expect(oeeResponse.body.data.oee).toBeGreaterThan(0);
      expect(oeeResponse.body.data.oee).toBeLessThanOrEqual(100);
    });

    it('should handle capacity planning and utilization', async () => {
      // Create work center with specific capacity
      const workCenterDto = {
        ...ManufacturingFixtures.createWorkCenterDto(),
        capacity: 1000,
      };
      const workCenterResponse = await request(app.getHttpServer())
        .post('/work-centers')
        .send(workCenterDto)
        .expect(201);

      const workCenterId = workCenterResponse.body.data.id;

      // Create multiple production orders to test capacity
      const bomDto = ManufacturingFixtures.createBOMDto();
      const bomResponse = await request(app.getHttpServer())
        .post('/bills-of-materials')
        .send(bomDto)
        .expect(201);

      const bomId = bomResponse.body.data.id;

      // Create orders that would utilize 75% capacity
      const productionOrderDto = {
        ...ManufacturingFixtures.createProductionOrderDto(),
        billOfMaterialId: bomId,
        quantity: 750,
      };
      await request(app.getHttpServer())
        .post('/production-orders')
        .send(productionOrderDto)
        .expect(201);

      // Check capacity utilization
      const capacityResponse = await request(app.getHttpServer())
        .get(`/work-centers/${workCenterId}/capacity`)
        .expect(200);

      expect(capacityResponse.body.data).toHaveProperty('totalCapacity');
      expect(capacityResponse.body.data).toHaveProperty('currentLoad');
      expect(capacityResponse.body.data).toHaveProperty('utilizationPercentage');
      expect(capacityResponse.body.data).toHaveProperty('isOverloaded');
      expect(capacityResponse.body.data.totalCapacity).toBe(1000);
    });

    it('should track energy consumption and sustainability metrics', async () => {
      // Create work center
      const workCenterDto = ManufacturingFixtures.createWorkCenterDto();
      const workCenterResponse = await request(app.getHttpServer())
        .post('/work-centers')
        .send(workCenterDto)
        .expect(201);

      const workCenterId = workCenterResponse.body.data.id;

      // Create IoT device for energy monitoring
      const iotDeviceDto = {
        ...ManufacturingFixtures.createIoTDeviceDto(),
        workCenterId,
        deviceType: 'energy_monitor',
      };
      const iotDeviceResponse = await request(app.getHttpServer())
        .post('/iot-devices')
        .send(iotDeviceDto)
        .expect(201);

      const iotDeviceId = iotDeviceResponse.body.data.id;

      // Send energy consumption data
      await request(app.getHttpServer())
        .post(`/iot-devices/${iotDeviceId}/data`)
        .send({
          sensorData: {
            energy_consumption: 150.5,
            power_factor: 0.95,
            voltage: 220,
            current: 10.5,
          },
        })
        .expect(201);

      // Get energy consumption metrics
      const energyResponse = await request(app.getHttpServer())
        .get(`/work-centers/${workCenterId}/energy`)
        .expect(200);

      expect(energyResponse.body.data).toHaveProperty('currentConsumption');
      expect(energyResponse.body.data).toHaveProperty('energyEfficiency');
      expect(energyResponse.body.data).toHaveProperty('carbonFootprint');
      expect(energyResponse.body.data).toHaveProperty('totalEnergyCost');
    });
  });

  describe('Data Validation and Error Handling', () => {
    it('should validate required fields in DTOs', async () => {
      const invalidWorkCenterDto = {
        // Missing required fields
        description: 'Invalid work center',
      };

      const response = await request(app.getHttpServer())
        .post('/work-centers')
        .send(invalidWorkCenterDto)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should handle foreign key constraints', async () => {
      const workOrderDto = {
        ...ManufacturingFixtures.createWorkOrderDto(),
        productionOrderId: 'non-existent-id',
        workCenterId: 'non-existent-id',
      };

      await request(app.getHttpServer())
        .post('/work-orders')
        .send(workOrderDto)
        .expect(400);
    });

    it('should handle duplicate unique constraints', async () => {
      const workCenterDto = ManufacturingFixtures.createWorkCenterDto();
      
      // Create first work center
      await request(app.getHttpServer())
        .post('/work-centers')
        .send(workCenterDto)
        .expect(201);

      // Try to create duplicate
      await request(app.getHttpServer())
        .post('/work-centers')
        .send(workCenterDto)
        .expect(409);
    });
  });

  describe('Concurrency and Performance', () => {
    it('should handle concurrent requests without data corruption', async () => {
      const workCenterDto = ManufacturingFixtures.createWorkCenterDto();

      // Create multiple concurrent requests
      const promises = Array(10).fill(null).map((_, index) => 
        request(app.getHttpServer())
          .post('/work-centers')
          .send({
            ...workCenterDto,
            code: `WC-${index.toString().padStart(3, '0')}`,
            name: `Work Center ${index}`,
          })
          .expect(201)
      );

      const responses = await Promise.all(promises);
      
      // Verify all work centers were created with unique IDs
      const ids = responses.map(r => r.body.data.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
    });

    it('should handle large dataset queries efficiently', async () => {
      // Create multiple work centers
      const workCenters = [];
      for (let i = 0; i < 25; i++) {
        const dto = {
          ...ManufacturingFixtures.createWorkCenterDto(),
          code: `WC-${i.toString().padStart(3, '0')}`,
          name: `Work Center ${i}`,
        };
        const response = await request(app.getHttpServer())
          .post('/work-centers')
          .send(dto)
          .expect(201);
        workCenters.push(response.body.data);
      }

      // Test pagination
      const pageResponse = await request(app.getHttpServer())
        .get('/work-centers')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(pageResponse.body.data.length).toBe(10);
      expect(pageResponse.body.metadata.pagination.total).toBe(25);
      expect(pageResponse.body.metadata.pagination.totalPages).toBe(3);
    });
  });
});
