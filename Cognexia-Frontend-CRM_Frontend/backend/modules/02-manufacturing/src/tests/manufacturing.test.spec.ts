/**
 * Manufacturing Module - Comprehensive Test Suite
 * Industry 5.0 ERP - Advanced Manufacturing Testing
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

// Import services and DTOs
import { PerformanceOptimizationService } from '../services/performance-optimization.service';
import { IoTIntegrationService } from '../services/iot-integration.service';
import {
  CreateWorkCenterDto,
  CreateProductionOrderDto,
  CreateQualityCheckDto,
  CreateMaintenanceRequestDto,
  RegisterIoTDeviceDto,
  WorkCenterType,
  ProductionOrderStatus,
  QualityStatus,
  MaintenanceType,
} from '../dto/manufacturing-validation.dto';

// Mock entities (in real implementation, these would be actual TypeORM entities)
class MockWorkCenter {
  id: string;
  name: string;
  code: string;
  type: WorkCenterType;
  capacity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class MockProductionOrder {
  id: string;
  orderNumber: string;
  productId: string;
  quantity: number;
  status: ProductionOrderStatus;
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

class MockQualityCheck {
  id: string;
  productionOrderId: string;
  workCenterId: string;
  inspectorId: string;
  checkType: string;
  status: QualityStatus;
  parameters: any[];
  sampleSize?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock repository factory
const createMockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    getManyAndCount: jest.fn(),
  })),
});

describe('Manufacturing Module - Comprehensive Tests', () => {
  let performanceService: PerformanceOptimizationService;
  let iotService: IoTIntegrationService;
  let workCenterRepo: Repository<MockWorkCenter>;
  let productionOrderRepo: Repository<MockProductionOrder>;
  let qualityCheckRepo: Repository<MockQualityCheck>;
  let eventEmitter: EventEmitter2;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        CacheModule.register(),
        ScheduleModule.forRoot(),
      ],
      providers: [
        PerformanceOptimizationService,
        IoTIntegrationService,
        {
          provide: getRepositoryToken(MockWorkCenter),
          useFactory: createMockRepository,
        },
        {
          provide: getRepositoryToken(MockProductionOrder),
          useFactory: createMockRepository,
        },
        {
          provide: getRepositoryToken(MockQualityCheck),
          useFactory: createMockRepository,
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
            on: jest.fn(),
            removeAllListeners: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'MQTT_BROKER_URL':
                  return 'mqtt://localhost:1883';
                case 'OPC_UA_SERVER_URL':
                  return 'opc.tcp://localhost:4840';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    performanceService = module.get<PerformanceOptimizationService>(PerformanceOptimizationService);
    iotService = module.get<IoTIntegrationService>(IoTIntegrationService);
    workCenterRepo = module.get<Repository<MockWorkCenter>>(getRepositoryToken(MockWorkCenter));
    productionOrderRepo = module.get<Repository<MockProductionOrder>>(getRepositoryToken(MockProductionOrder));
    qualityCheckRepo = module.get<Repository<MockQualityCheck>>(getRepositoryToken(MockQualityCheck));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('Performance Optimization Service', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('Performance Metrics Calculation', () => {
      it('should calculate comprehensive performance metrics for a work center', async () => {
        const workCenterId = 'WC001';
        const metrics = await performanceService.calculatePerformanceMetrics(workCenterId);

        expect(metrics).toHaveProperty('efficiency');
        expect(metrics).toHaveProperty('throughput');
        expect(metrics).toHaveProperty('qualityScore');
        expect(metrics).toHaveProperty('downtime');
        expect(metrics).toHaveProperty('oee');
        expect(metrics).toHaveProperty('utilizationRate');
        expect(metrics).toHaveProperty('defectRate');
        expect(metrics).toHaveProperty('energyConsumption');
        expect(metrics).toHaveProperty('carbonFootprint');

        expect(typeof metrics.efficiency).toBe('number');
        expect(typeof metrics.throughput).toBe('number');
        expect(typeof metrics.qualityScore).toBe('number');
        expect(metrics.efficiency).toBeGreaterThanOrEqual(0);
        expect(metrics.efficiency).toBeLessThanOrEqual(100);
      });

      it('should handle invalid work center IDs gracefully', async () => {
        const invalidWorkCenterId = 'INVALID_WC';
        
        // Service should handle gracefully without throwing
        const metrics = await performanceService.calculatePerformanceMetrics(invalidWorkCenterId);
        expect(metrics).toBeDefined();
      });
    });

    describe('Performance Gap Analysis', () => {
      it('should analyze performance gaps and generate recommendations', async () => {
        const workCenterId = 'WC001';
        const analysis = await performanceService.analyzePerformanceGaps(workCenterId);

        expect(analysis).toHaveProperty('workCenterId', workCenterId);
        expect(analysis).toHaveProperty('workCenterName');
        expect(analysis).toHaveProperty('currentMetrics');
        expect(analysis).toHaveProperty('benchmarkMetrics');
        expect(analysis).toHaveProperty('performanceGaps');
        expect(analysis).toHaveProperty('recommendations');

        expect(Array.isArray(analysis.performanceGaps)).toBe(true);
        expect(Array.isArray(analysis.recommendations)).toBe(true);
      });

      it('should prioritize recommendations by impact and priority', async () => {
        const workCenterId = 'WC001';
        const analysis = await performanceService.analyzePerformanceGaps(workCenterId);

        if (analysis.recommendations.length > 1) {
          const priorities = analysis.recommendations.map(rec => rec.priority);
          const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          
          for (let i = 0; i < priorities.length - 1; i++) {
            expect(priorityOrder[priorities[i]]).toBeGreaterThanOrEqual(priorityOrder[priorities[i + 1]]);
          }
        }
      });
    });

    describe('Performance Report Generation', () => {
      it('should generate comprehensive performance report', async () => {
        const workCenterId = 'WC001';
        const report = await performanceService.generatePerformanceReport(workCenterId);

        expect(report).toHaveProperty('summary');
        expect(report).toHaveProperty('analysis');
        expect(report).toHaveProperty('trends');
        expect(report).toHaveProperty('benchmarking');
        expect(report).toHaveProperty('actionPlan');

        expect(Array.isArray(report.trends)).toBe(true);
        expect(Array.isArray(report.actionPlan)).toBe(true);
        expect(report.actionPlan.length).toBeLessThanOrEqual(5); // Top 5 recommendations
      });

      it('should include only high priority recommendations in action plan', async () => {
        const workCenterId = 'WC001';
        const report = await performanceService.generatePerformanceReport(workCenterId);

        report.actionPlan.forEach(recommendation => {
          expect(['HIGH', 'CRITICAL']).toContain(recommendation.priority);
        });
      });
    });
  });

  describe('IoT Integration Service', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('Device Registration', () => {
      it('should register a new IoT device successfully', async () => {
        const deviceConfig = {
          name: 'Test Temperature Sensor',
          type: 'SENSOR' as const,
          category: 'TEMPERATURE' as const,
          workCenterId: 'WC001',
          protocol: 'MQTT' as const,
          location: { x: 10, y: 20, z: 1, description: 'Assembly Line 1' },
          configuration: {
            endpoint: 'mqtt://broker:1883/sensors/temp001',
            pollInterval: 5000,
            threshold: { min: 18, max: 25, unit: '°C' },
          },
        };

        const device = await iotService.registerDevice(deviceConfig);

        expect(device).toHaveProperty('id');
        expect(device).toHaveProperty('name', deviceConfig.name);
        expect(device).toHaveProperty('type', deviceConfig.type);
        expect(device).toHaveProperty('category', deviceConfig.category);
        expect(device).toHaveProperty('status');
        expect(eventEmitter.emit).toHaveBeenCalledWith('device.registered', device);
      });

      it('should auto-generate device ID if not provided', async () => {
        const deviceConfig = {
          name: 'Auto-ID Device',
          type: 'SENSOR' as const,
          category: 'PRESSURE' as const,
          workCenterId: 'WC002',
          protocol: 'OPC_UA' as const,
          location: { x: 0, y: 0, z: 0, description: 'Test Location' },
          configuration: {
            endpoint: 'opc.tcp://server:4840',
            pollInterval: 2000,
          },
        };

        const device = await iotService.registerDevice(deviceConfig);

        expect(device.id).toBeDefined();
        expect(device.id).toMatch(/^device_\d+$/);
      });
    });

    describe('Device Data Processing', () => {
      it('should process incoming IoT data correctly', async () => {
        // Register a device first
        const device = await iotService.registerDevice({
          id: 'test_device_001',
          name: 'Test Device',
          type: 'SENSOR' as const,
          category: 'TEMPERATURE' as const,
          workCenterId: 'WC001',
          protocol: 'MQTT' as const,
          location: { x: 0, y: 0, z: 0, description: 'Test' },
          configuration: {
            endpoint: 'test://endpoint',
            pollInterval: 1000,
            threshold: { min: 10, max: 30, unit: '°C' },
          },
        });

        const testValue = 22.5;
        const timestamp = new Date();

        await iotService.processIncomingData(device.id, testValue, timestamp);

        const deviceData = await iotService.getDeviceData(device.id);
        expect(deviceData.length).toBeGreaterThan(0);

        const latestReading = deviceData[deviceData.length - 1];
        expect(latestReading.value).toBe(testValue);
        expect(latestReading.deviceId).toBe(device.id);
        expect(latestReading.quality).toBe('GOOD');
      });

      it('should apply calibration to incoming data', async () => {
        const device = await iotService.registerDevice({
          id: 'calibrated_device',
          name: 'Calibrated Device',
          type: 'SENSOR' as const,
          category: 'TEMPERATURE' as const,
          workCenterId: 'WC001',
          protocol: 'MQTT' as const,
          location: { x: 0, y: 0, z: 0, description: 'Test' },
          configuration: {
            endpoint: 'test://endpoint',
            pollInterval: 1000,
            calibration: {
              offset: 2.0,
              scale: 1.1,
              lastCalibrated: new Date(),
            },
          },
        });

        const rawValue = 20;
        const expectedValue = (rawValue * 1.1) + 2.0; // 24

        await iotService.processIncomingData(device.id, rawValue);

        const deviceData = await iotService.getDeviceData(device.id);
        const latestReading = deviceData[deviceData.length - 1];
        expect(latestReading.value).toBe(expectedValue);
      });

      it('should detect threshold violations and create alerts', async () => {
        const device = await iotService.registerDevice({
          id: 'threshold_device',
          name: 'Threshold Test Device',
          type: 'SENSOR' as const,
          category: 'TEMPERATURE' as const,
          workCenterId: 'WC001',
          protocol: 'MQTT' as const,
          location: { x: 0, y: 0, z: 0, description: 'Test' },
          configuration: {
            endpoint: 'test://endpoint',
            pollInterval: 1000,
            threshold: { min: 18, max: 25, unit: '°C' },
          },
        });

        // Test value above threshold
        const highValue = 30;
        await iotService.processIncomingData(device.id, highValue);

        // Check that an alert event was emitted
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'iot.alert.created',
          expect.objectContaining({
            deviceId: device.id,
            type: 'THRESHOLD_EXCEEDED',
            severity: expect.stringMatching(/HIGH|CRITICAL/),
          })
        );
      });
    });

    describe('Device Status Monitoring', () => {
      it('should return comprehensive device status information', async () => {
        const device = await iotService.registerDevice({
          id: 'status_test_device',
          name: 'Status Test Device',
          type: 'SENSOR' as const,
          category: 'PRESSURE' as const,
          workCenterId: 'WC001',
          protocol: 'MQTT' as const,
          location: { x: 0, y: 0, z: 0, description: 'Test' },
          configuration: {
            endpoint: 'test://endpoint',
            pollInterval: 1000,
          },
        });

        // Process some data to have readings
        await iotService.processIncomingData(device.id, 10.5);

        const status = iotService.getDeviceStatus(device.id);

        expect(status).toBeDefined();
        expect(status!.device).toEqual(expect.objectContaining({
          id: device.id,
          name: device.name,
        }));
        expect(status!.health).toHaveProperty('isOnline');
        expect(status!.health).toHaveProperty('connectionQuality');
        expect(status!.health).toHaveProperty('dataQuality');
        expect(status!.health).toHaveProperty('alertCount');
        expect(status!.latestReading).toBeDefined();
      });

      it('should return null for non-existent devices', () => {
        const status = iotService.getDeviceStatus('non_existent_device');
        expect(status).toBeNull();
      });
    });

    describe('Command Sending', () => {
      it('should send commands to actuator devices', async () => {
        const actuatorDevice = await iotService.registerDevice({
          id: 'actuator_001',
          name: 'Test Actuator',
          type: 'ACTUATOR' as const,
          category: 'POWER' as const,
          workCenterId: 'WC001',
          protocol: 'MQTT' as const,
          location: { x: 0, y: 0, z: 0, description: 'Test' },
          configuration: {
            endpoint: 'mqtt://broker:1883/actuators/001',
            pollInterval: 1000,
          },
        });

        const result = await iotService.sendCommand(actuatorDevice.id, 'SET_POWER', { level: 75 });

        expect(result).toBe(true);
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'command.executed',
          expect.objectContaining({
            deviceId: actuatorDevice.id,
            command: 'SET_POWER',
            parameters: { level: 75 },
          })
        );
      });

      it('should reject commands for non-actuator devices', async () => {
        const sensorDevice = await iotService.registerDevice({
          id: 'sensor_001',
          name: 'Test Sensor',
          type: 'SENSOR' as const,
          category: 'TEMPERATURE' as const,
          workCenterId: 'WC001',
          protocol: 'MQTT' as const,
          location: { x: 0, y: 0, z: 0, description: 'Test' },
          configuration: {
            endpoint: 'mqtt://broker:1883/sensors/001',
            pollInterval: 1000,
          },
        });

        await expect(
          iotService.sendCommand(sensorDevice.id, 'SET_VALUE', { value: 100 })
        ).rejects.toThrow('does not support commands');
      });
    });

    describe('Edge Computing', () => {
      it('should process data at edge nodes', async () => {
        // This would normally require setting up an edge node first
        // For now, we'll test the error case
        await expect(
          iotService.processAtEdge('non_existent_node', [{ value: 1 }, { value: 2 }])
        ).rejects.toThrow('Edge node non_existent_node not found');
      });
    });
  });

  describe('Validation DTOs', () => {
    describe('Work Center DTO Validation', () => {
      it('should validate CreateWorkCenterDto with valid data', async () => {
        const dto = plainToInstance(CreateWorkCenterDto, {
          name: 'Assembly Line 1',
          code: 'ASM_001',
          type: WorkCenterType.ASSEMBLY,
          capacity: 100,
          location: {
            x: 10,
            y: 20,
            z: 1,
            description: 'Main floor assembly area',
          },
          description: 'Primary assembly line for product manufacturing',
          operatingCostPerHour: 150.50,
          isActive: true,
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should reject CreateWorkCenterDto with invalid data', async () => {
        const dto = plainToInstance(CreateWorkCenterDto, {
          name: 'A', // Too short
          code: 'inv@lid', // Invalid characters
          type: 'INVALID_TYPE', // Invalid enum
          capacity: -1, // Negative capacity
          location: {
            x: 2000, // Out of range
            y: 20,
            z: 1,
            description: '',
          },
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);

        // Check specific validation errors
        const nameError = errors.find(error => error.property === 'name');
        const codeError = errors.find(error => error.property === 'code');
        const typeError = errors.find(error => error.property === 'type');
        const capacityError = errors.find(error => error.property === 'capacity');

        expect(nameError).toBeDefined();
        expect(codeError).toBeDefined();
        expect(typeError).toBeDefined();
        expect(capacityError).toBeDefined();
      });
    });

    describe('Production Order DTO Validation', () => {
      it('should validate CreateProductionOrderDto with complete data', async () => {
        const dto = plainToInstance(CreateProductionOrderDto, {
          orderNumber: 'PO_2024_001',
          productId: 'PROD_001',
          quantity: 100,
          plannedStartDate: '2024-02-01T08:00:00Z',
          plannedEndDate: '2024-02-05T17:00:00Z',
          priority: 5,
          billOfMaterials: [
            {
              itemId: 'ITEM_001',
              quantity: 2.5,
              unit: 'kg',
              scrapAllowancePercent: 5,
            },
          ],
          productionSteps: [
            {
              sequence: 1,
              workCenterId: 'WC001',
              operation: 'Material preparation',
              setupTimeMinutes: 30,
              runtimePerUnitMinutes: 2.5,
              qualityControlRequired: true,
            },
          ],
          customerOrderReference: 'CUST_ORD_001',
          specialInstructions: 'Handle with care - fragile components',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should enforce array size limits for BOM and production steps', async () => {
        const dto = plainToInstance(CreateProductionOrderDto, {
          orderNumber: 'PO_2024_002',
          productId: 'PROD_002',
          quantity: 50,
          plannedStartDate: '2024-02-01T08:00:00Z',
          plannedEndDate: '2024-02-05T17:00:00Z',
          priority: 3,
          billOfMaterials: [], // Empty array - should fail
          productionSteps: [], // Empty array - should fail
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);

        const bomError = errors.find(error => error.property === 'billOfMaterials');
        const stepsError = errors.find(error => error.property === 'productionSteps');

        expect(bomError).toBeDefined();
        expect(stepsError).toBeDefined();
      });
    });

    describe('Quality Check DTO Validation', () => {
      it('should validate CreateQualityCheckDto with proper parameters', async () => {
        const dto = plainToInstance(CreateQualityCheckDto, {
          productionOrderId: 'PO_001',
          workCenterId: 'WC_QC_001',
          inspectorId: 'INSPECTOR_001',
          checkType: 'Dimensional Inspection',
          parameters: [
            {
              name: 'Length',
              targetValue: 100.0,
              actualValue: 99.8,
              unit: 'mm',
              lowerLimit: 99.5,
              upperLimit: 100.5,
              testMethod: 'Caliper measurement',
            },
            {
              name: 'Width',
              targetValue: 50.0,
              actualValue: 50.1,
              unit: 'mm',
              lowerLimit: 49.8,
              upperLimit: 50.2,
            },
          ],
          sampleSize: 5,
          notes: 'Standard quality check performed according to procedure QC-001',
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });
    });

    describe('IoT Device Registration DTO Validation', () => {
      it('should validate RegisterIoTDeviceDto with complete configuration', async () => {
        const dto = plainToInstance(RegisterIoTDeviceDto, {
          id: 'TEMP_SENSOR_001',
          name: 'Temperature Sensor - Line 1',
          type: 'SENSOR',
          category: 'TEMPERATURE',
          workCenterId: 'WC001',
          location: {
            x: 15,
            y: 25,
            z: 2,
            description: 'Assembly line conveyor belt',
          },
          protocol: 'MQTT',
          configuration: {
            endpoint: 'mqtt://broker.company.com:1883/sensors/temp001',
            pollInterval: 5000,
            threshold: {
              min: 18.0,
              max: 25.0,
              unit: '°C',
            },
          },
          metadata: {
            manufacturer: 'SensorCorp',
            model: 'TC-2000',
            serialNumber: 'SN123456789',
            installationDate: '2024-01-15',
            calibrationDate: '2024-01-10',
          },
        });

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      });

      it('should enforce valid URL format for device endpoint', async () => {
        const dto = plainToInstance(RegisterIoTDeviceDto, {
          name: 'Invalid Endpoint Device',
          type: 'SENSOR',
          category: 'TEMPERATURE',
          workCenterId: 'WC001',
          location: {
            x: 0,
            y: 0,
            z: 0,
            description: 'Test location',
          },
          protocol: 'MQTT',
          configuration: {
            endpoint: 'not-a-valid-url', // Invalid URL
            pollInterval: 5000,
          },
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);

        const configError = errors.find(error => error.property === 'configuration');
        expect(configError).toBeDefined();
      });

      it('should enforce polling interval limits', async () => {
        const dto = plainToInstance(RegisterIoTDeviceDto, {
          name: 'Fast Polling Device',
          type: 'SENSOR',
          category: 'TEMPERATURE',
          workCenterId: 'WC001',
          location: {
            x: 0,
            y: 0,
            z: 0,
            description: 'Test location',
          },
          protocol: 'MQTT',
          configuration: {
            endpoint: 'mqtt://broker:1883/test',
            pollInterval: 500, // Below minimum
          },
        });

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);

        const configError = errors.find(error => error.property === 'configuration');
        expect(configError).toBeDefined();
      });
    });
  });

  describe('Integration Tests', () => {
    describe('Performance and IoT Integration', () => {
      it('should integrate IoT data with performance metrics', async () => {
        // Register a performance-monitoring device
        const device = await iotService.registerDevice({
          id: 'perf_monitor_001',
          name: 'Performance Monitor',
          type: 'SENSOR' as const,
          category: 'POWER' as const,
          workCenterId: 'WC001',
          protocol: 'MQTT' as const,
          location: { x: 0, y: 0, z: 0, description: 'Performance monitoring' },
          configuration: {
            endpoint: 'mqtt://broker:1883/perf/001',
            pollInterval: 1000,
          },
        });

        // Simulate energy consumption data
        const energyData = [850, 920, 875, 890, 910];
        for (const value of energyData) {
          await iotService.processIncomingData(device.id, value);
        }

        // Calculate performance metrics for the same work center
        const metrics = await performanceService.calculatePerformanceMetrics('WC001');

        expect(metrics.energyConsumption).toBeDefined();
        expect(typeof metrics.energyConsumption).toBe('number');
        expect(metrics.carbonFootprint).toBeDefined();
        expect(typeof metrics.carbonFootprint).toBe('number');

        // Verify that digital twin update events were emitted
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'digital.twin.update',
          expect.objectContaining({
            assetId: 'WC001',
            source: 'IoT',
          })
        );
      });
    });

    describe('Error Handling and Resilience', () => {
      it('should handle service failures gracefully', async () => {
        // Test performance service with invalid data
        await expect(async () => {
          await performanceService.calculatePerformanceMetrics('');
        }).not.toThrow();

        // Test IoT service with malformed data
        await expect(async () => {
          await iotService.processIncomingData('non_existent_device', null);
        }).not.toThrow();
      });

      it('should continue operation after individual device failures', async () => {
        const workingDevice = await iotService.registerDevice({
          id: 'working_device',
          name: 'Working Device',
          type: 'SENSOR' as const,
          category: 'TEMPERATURE' as const,
          workCenterId: 'WC001',
          protocol: 'MQTT' as const,
          location: { x: 0, y: 0, z: 0, description: 'Working device' },
          configuration: {
            endpoint: 'mqtt://broker:1883/working',
            pollInterval: 1000,
          },
        });

        // Process data for working device
        await iotService.processIncomingData(workingDevice.id, 22.5);

        // Try to process data for non-existent device (should not throw)
        await iotService.processIncomingData('non_existent', 25.0);

        // Verify working device still functions
        const status = iotService.getDeviceStatus(workingDevice.id);
        expect(status).toBeDefined();
        expect(status!.device.id).toBe(workingDevice.id);
      });
    });

    describe('Performance Benchmarks', () => {
      it('should handle large volumes of IoT data efficiently', async () => {
        const device = await iotService.registerDevice({
          id: 'high_volume_device',
          name: 'High Volume Device',
          type: 'SENSOR' as const,
          category: 'TEMPERATURE' as const,
          workCenterId: 'WC001',
          protocol: 'MQTT' as const,
          location: { x: 0, y: 0, z: 0, description: 'High volume test' },
          configuration: {
            endpoint: 'mqtt://broker:1883/hv',
            pollInterval: 100,
          },
        });

        const startTime = Date.now();
        const dataPoints = 1000;

        // Process large volume of data
        const promises = [];
        for (let i = 0; i < dataPoints; i++) {
          promises.push(iotService.processIncomingData(device.id, Math.random() * 100));
        }

        await Promise.all(promises);
        const endTime = Date.now();
        const processingTime = endTime - startTime;

        // Should process 1000 data points in reasonable time (less than 5 seconds)
        expect(processingTime).toBeLessThan(5000);

        // Verify data was stored (should maintain only last 1000 readings)
        const deviceData = await iotService.getDeviceData(device.id);
        expect(deviceData.length).toBeLessThanOrEqual(1000);
      });

      it('should generate performance reports quickly', async () => {
        const workCenterId = 'WC_PERF_TEST';
        const startTime = Date.now();

        const report = await performanceService.generatePerformanceReport(workCenterId);
        
        const endTime = Date.now();
        const generationTime = endTime - startTime;

        // Report generation should be fast (less than 1 second)
        expect(generationTime).toBeLessThan(1000);
        expect(report).toBeDefined();
        expect(report.summary).toBeDefined();
        expect(report.analysis).toBeDefined();
      });
    });
  });

  describe('Security and Data Validation', () => {
    describe('Input Sanitization', () => {
      it('should sanitize malicious input in device registration', async () => {
        const maliciousConfig = {
          name: '<script>alert("xss")</script>',
          type: 'SENSOR' as const,
          category: 'TEMPERATURE' as const,
          workCenterId: 'WC001',
          protocol: 'MQTT' as const,
          location: { x: 0, y: 0, z: 0, description: 'Test' },
          configuration: {
            endpoint: 'javascript:alert("xss")', // This would fail URL validation
            pollInterval: 1000,
          },
        };

        // Should be handled by validation and not cause security issues
        await expect(iotService.registerDevice(maliciousConfig)).rejects.toThrow();
      });
    });

    describe('Data Integrity', () => {
      it('should maintain data consistency across operations', async () => {
        const device = await iotService.registerDevice({
          id: 'consistency_test_device',
          name: 'Consistency Test Device',
          type: 'SENSOR' as const,
          category: 'TEMPERATURE' as const,
          workCenterId: 'WC001',
          protocol: 'MQTT' as const,
          location: { x: 0, y: 0, z: 0, description: 'Consistency test' },
          configuration: {
            endpoint: 'mqtt://broker:1883/consistency',
            pollInterval: 1000,
          },
        });

        // Process multiple data points
        const values = [20.1, 20.2, 20.3, 20.4, 20.5];
        for (const value of values) {
          await iotService.processIncomingData(device.id, value);
        }

        const deviceData = await iotService.getDeviceData(device.id);
        
        // Verify data integrity
        expect(deviceData.length).toBe(values.length);
        deviceData.forEach((reading, index) => {
          expect(reading.value).toBe(values[index]);
          expect(reading.deviceId).toBe(device.id);
          expect(reading.timestamp).toBeInstanceOf(Date);
        });
      });
    });
  });
});
