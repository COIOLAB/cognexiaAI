import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { WorkCenterService } from '../../services/work-center.service';
import { WorkCenter } from '../../entities/WorkCenter';
import { ManufacturingFixtures } from '../fixtures/manufacturing.fixtures';
import { repositoryMockFactory } from '../mocks/manufacturing.mocks';
import { MockType } from '../types/mock.type';

describe('WorkCenterService', () => {
  let service: WorkCenterService;
  let repository: MockType<Repository<WorkCenter>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkCenterService,
        {
          provide: getRepositoryToken(WorkCenter),
          useFactory: repositoryMockFactory,
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WorkCenterService>(WorkCenterService);
    repository = module.get(getRepositoryToken(WorkCenter));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new work center', async () => {
      // Arrange
      const createDto = ManufacturingFixtures.createWorkCenterDto();
      const mockWorkCenter = ManufacturingFixtures.createMockWorkCenter();
      
      repository.create?.mockReturnValue(mockWorkCenter);
      repository.save?.mockResolvedValue(mockWorkCenter);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockWorkCenter);
      expect(result).toEqual(mockWorkCenter);
    });

    it('should throw error when repository fails', async () => {
      // Arrange
      const createDto = ManufacturingFixtures.createWorkCenterDto();
      const error = new Error('Database error');
      
      repository.create?.mockReturnValue(createDto);
      repository.save?.mockRejectedValue(error);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all work centers', async () => {
      // Arrange
      const mockWorkCenters = [ManufacturingFixtures.createMockWorkCenter()];
      repository.find?.mockResolvedValue(mockWorkCenters);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(mockWorkCenters);
    });

    it('should return empty array when no work centers found', async () => {
      // Arrange
      repository.find?.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return work center by id', async () => {
      // Arrange
      const id = 'wc-001';
      const mockWorkCenter = ManufacturingFixtures.createMockWorkCenter();
      repository.findOne?.mockResolvedValue(mockWorkCenter);

      // Act
      const result = await service.findOne(id);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: expect.any(Array),
      });
      expect(result).toEqual(mockWorkCenter);
    });

    it('should return null when work center not found', async () => {
      // Arrange
      const id = 'non-existent';
      repository.findOne?.mockResolvedValue(null);

      // Act
      const result = await service.findOne(id);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update work center', async () => {
      // Arrange
      const id = 'wc-001';
      const updateDto = { name: 'Updated Work Center' };
      const existingWorkCenter = ManufacturingFixtures.createMockWorkCenter();
      const updatedWorkCenter = { ...existingWorkCenter, ...updateDto };

      repository.findOne?.mockResolvedValue(existingWorkCenter);
      repository.save?.mockResolvedValue(updatedWorkCenter);

      // Act
      const result = await service.update(id, updateDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateDto)
      );
      expect(result).toEqual(updatedWorkCenter);
    });

    it('should throw error when work center not found', async () => {
      // Arrange
      const id = 'non-existent';
      const updateDto = { name: 'Updated Work Center' };
      repository.findOne?.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(id, updateDto)).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should remove work center', async () => {
      // Arrange
      const id = 'wc-001';
      const mockWorkCenter = ManufacturingFixtures.createMockWorkCenter();
      
      repository.findOne?.mockResolvedValue(mockWorkCenter);
      repository.remove?.mockResolvedValue(mockWorkCenter);

      // Act
      await service.remove(id);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(repository.remove).toHaveBeenCalledWith(mockWorkCenter);
    });

    it('should throw error when work center not found', async () => {
      // Arrange
      const id = 'non-existent';
      repository.findOne?.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(id)).rejects.toThrow();
    });
  });

  describe('calculateOEE', () => {
    it('should calculate OEE correctly', async () => {
      // Arrange
      const id = 'wc-001';
      const mockWorkCenter = {
        ...ManufacturingFixtures.createMockWorkCenter(),
        efficiency: 85.0,
        availability: 92.0,
        quality: 98.5,
      };
      
      repository.findOne?.mockResolvedValue(mockWorkCenter);

      // Act
      const result = await service.calculateOEE(id);

      // Assert
      expect(result).toBeCloseTo(77.1, 1); // 85 * 92 * 98.5 / 10000
    });

    it('should return 0 when work center has no performance data', async () => {
      // Arrange
      const id = 'wc-001';
      const mockWorkCenter = {
        ...ManufacturingFixtures.createMockWorkCenter(),
        efficiency: null,
        availability: null,
        quality: null,
      };
      
      repository.findOne?.mockResolvedValue(mockWorkCenter);

      // Act
      const result = await service.calculateOEE(id);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('getCapacityUtilization', () => {
    it('should calculate capacity utilization correctly', async () => {
      // Arrange
      const id = 'wc-001';
      const mockWorkCenter = {
        ...ManufacturingFixtures.createMockWorkCenter(),
        capacity: 1000,
        currentLoad: 750,
      };
      
      repository.findOne?.mockResolvedValue(mockWorkCenter);

      // Act
      const result = await service.getCapacityUtilization(id);

      // Assert
      expect(result).toEqual({
        totalCapacity: 1000,
        currentLoad: 750,
        availableCapacity: 250,
        utilizationPercentage: 75.0,
        isOverloaded: false,
      });
    });

    it('should identify overloaded work center', async () => {
      // Arrange
      const id = 'wc-001';
      const mockWorkCenter = {
        ...ManufacturingFixtures.createMockWorkCenter(),
        capacity: 1000,
        currentLoad: 1200,
      };
      
      repository.findOne?.mockResolvedValue(mockWorkCenter);

      // Act
      const result = await service.getCapacityUtilization(id);

      // Assert
      expect(result).toEqual({
        totalCapacity: 1000,
        currentLoad: 1200,
        availableCapacity: 0,
        utilizationPercentage: 120.0,
        isOverloaded: true,
      });
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should return comprehensive performance metrics', async () => {
      // Arrange
      const id = 'wc-001';
      const mockWorkCenter = ManufacturingFixtures.createMockWorkCenter();
      
      repository.findOne?.mockResolvedValue(mockWorkCenter);

      // Act
      const result = await service.getPerformanceMetrics(id);

      // Assert
      expect(result).toEqual({
        efficiency: mockWorkCenter.efficiency,
        availability: mockWorkCenter.availability,
        quality: mockWorkCenter.quality,
        oee: expect.any(Number),
        capacityUtilization: expect.any(Object),
        downtime: {
          total: mockWorkCenter.totalDowntime,
          planned: mockWorkCenter.plannedDowntime,
          unplanned: mockWorkCenter.unplannedDowntime,
        },
        energyConsumption: mockWorkCenter.energyConsumption,
        costPerHour: mockWorkCenter.costPerHour,
      });
    });
  });

  describe('checkOperationalStatus', () => {
    it('should return operational status true for active work center', async () => {
      // Arrange
      const id = 'wc-001';
      const mockWorkCenter = {
        ...ManufacturingFixtures.createMockWorkCenter(),
        isOperational: true,
        status: 'active',
      };
      
      repository.findOne?.mockResolvedValue(mockWorkCenter);

      // Act
      const result = await service.checkOperationalStatus(id);

      // Assert
      expect(result).toEqual({
        isOperational: true,
        status: 'active',
        canAcceptOrders: true,
        maintenanceRequired: false,
        safetyCompliant: true,
      });
    });

    it('should return operational status false for maintenance work center', async () => {
      // Arrange
      const id = 'wc-001';
      const mockWorkCenter = {
        ...ManufacturingFixtures.createMockWorkCenter(),
        isOperational: false,
        status: 'maintenance',
        nextMaintenanceDate: new Date(Date.now() - 86400000), // Yesterday
      };
      
      repository.findOne?.mockResolvedValue(mockWorkCenter);

      // Act
      const result = await service.checkOperationalStatus(id);

      // Assert
      expect(result).toEqual({
        isOperational: false,
        status: 'maintenance',
        canAcceptOrders: false,
        maintenanceRequired: true,
        safetyCompliant: true,
      });
    });
  });

  describe('updateEfficiency', () => {
    it('should update work center efficiency', async () => {
      // Arrange
      const id = 'wc-001';
      const newEfficiency = 90.5;
      const mockWorkCenter = ManufacturingFixtures.createMockWorkCenter();
      const updatedWorkCenter = { ...mockWorkCenter, efficiency: newEfficiency };

      repository.findOne?.mockResolvedValue(mockWorkCenter);
      repository.save?.mockResolvedValue(updatedWorkCenter);

      // Act
      const result = await service.updateEfficiency(id, newEfficiency);

      // Assert
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ efficiency: newEfficiency })
      );
      expect(result.efficiency).toBe(newEfficiency);
    });

    it('should validate efficiency range', async () => {
      // Arrange
      const id = 'wc-001';
      const invalidEfficiency = 150; // > 100%

      // Act & Assert
      await expect(service.updateEfficiency(id, invalidEfficiency)).rejects.toThrow();
    });
  });

  describe('getDowntimeAnalysis', () => {
    it('should return downtime analysis', async () => {
      // Arrange
      const id = 'wc-001';
      const mockWorkCenter = ManufacturingFixtures.createMockWorkCenter();
      
      repository.findOne?.mockResolvedValue(mockWorkCenter);

      // Act
      const result = await service.getDowntimeAnalysis(id);

      // Assert
      expect(result).toEqual({
        totalDowntime: mockWorkCenter.totalDowntime,
        plannedDowntime: mockWorkCenter.plannedDowntime,
        unplannedDowntime: mockWorkCenter.unplannedDowntime,
        downtimePercentage: expect.any(Number),
        availabilityPercentage: mockWorkCenter.availability,
        lastMaintenanceDate: mockWorkCenter.lastMaintenanceDate,
        nextMaintenanceDate: mockWorkCenter.nextMaintenanceDate,
        isMaintenanceOverdue: expect.any(Boolean),
      });
    });
  });

  describe('getSafetyCompliance', () => {
    it('should return safety compliance status', async () => {
      // Arrange
      const id = 'wc-001';
      const mockWorkCenter = ManufacturingFixtures.createMockWorkCenter();
      
      repository.findOne?.mockResolvedValue(mockWorkCenter);

      // Act
      const result = await service.getSafetyCompliance(id);

      // Assert
      expect(result).toEqual({
        safetyCompliance: mockWorkCenter.safetyCompliance,
        gmpCompliant: mockWorkCenter.gmpCompliant,
        hazmatCompliant: mockWorkCenter.hazmatCompliant,
        safetyCertifications: mockWorkCenter.safetyCertifications,
        overallComplianceScore: expect.any(Number),
        complianceIssues: expect.any(Array),
      });
    });
  });

  describe('getCostAnalysis', () => {
    it('should return cost analysis', async () => {
      // Arrange
      const id = 'wc-001';
      const mockWorkCenter = ManufacturingFixtures.createMockWorkCenter();
      
      repository.findOne?.mockResolvedValue(mockWorkCenter);

      // Act
      const result = await service.getCostAnalysis(id);

      // Assert
      expect(result).toEqual({
        costPerHour: mockWorkCenter.costPerHour,
        energyConsumption: mockWorkCenter.energyConsumption,
        energyCost: expect.any(Number),
        totalOperatingCost: expect.any(Number),
        costEfficiency: expect.any(Number),
        maintenanceCost: expect.any(Number),
        totalCostPerUnit: expect.any(Number),
      });
    });
  });

  describe('getEnergyConsumption', () => {
    it('should return energy consumption data', async () => {
      // Arrange
      const id = 'wc-001';
      const mockWorkCenter = ManufacturingFixtures.createMockWorkCenter();
      
      repository.findOne?.mockResolvedValue(mockWorkCenter);

      // Act
      const result = await service.getEnergyConsumption(id);

      // Assert
      expect(result).toEqual({
        currentConsumption: mockWorkCenter.energyConsumption,
        averageConsumption: expect.any(Number),
        peakConsumption: expect.any(Number),
        energyEfficiency: expect.any(Number),
        carbonFootprint: expect.any(Number),
        costPerKwh: expect.any(Number),
        totalEnergyCost: expect.any(Number),
      });
    });
  });
});
