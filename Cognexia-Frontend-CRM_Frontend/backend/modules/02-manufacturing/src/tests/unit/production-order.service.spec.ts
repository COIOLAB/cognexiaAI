import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { ProductionOrderService } from '../../services/production-order.service';
import { ProductionOrder } from '../../entities/ProductionOrder';
import { BillOfMaterials } from '../../entities/BillOfMaterials';
import { ProductionLine } from '../../entities/ProductionLine';
import { WorkOrder } from '../../entities/WorkOrder';
import { ManufacturingFixtures } from '../fixtures/manufacturing.fixtures';
import { repositoryMockFactory } from '../mocks/manufacturing.mocks';
import { MockType } from '../types/mock.type';

describe('ProductionOrderService', () => {
  let service: ProductionOrderService;
  let repository: MockType<Repository<ProductionOrder>>;
  let bomRepository: MockType<Repository<BillOfMaterials>>;
  let productionLineRepository: MockType<Repository<ProductionLine>>;
  let workOrderRepository: MockType<Repository<WorkOrder>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionOrderService,
        {
          provide: getRepositoryToken(ProductionOrder),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(BillOfMaterials),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(ProductionLine),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(WorkOrder),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<ProductionOrderService>(ProductionOrderService);
    repository = module.get(getRepositoryToken(ProductionOrder));
    bomRepository = module.get(getRepositoryToken(BillOfMaterials));
    productionLineRepository = module.get(getRepositoryToken(ProductionLine));
    workOrderRepository = module.get(getRepositoryToken(WorkOrder));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = ManufacturingFixtures.createProductionOrderDto();
    const mockProductionOrder = ManufacturingFixtures.createMockProductionOrder();
    const mockBOM = ManufacturingFixtures.createMockBOM();
    const mockProductionLine = ManufacturingFixtures.createMockProductionLine();

    it('should create a production order successfully', async () => {
      bomRepository.findOne.mockResolvedValue(mockBOM);
      productionLineRepository.findOne.mockResolvedValue(mockProductionLine);
      repository.findOne.mockResolvedValue(null); // No duplicate order number
      repository.create.mockReturnValue(mockProductionOrder);
      repository.save.mockResolvedValue(mockProductionOrder);

      const result = await service.create(createDto);

      expect(bomRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.billOfMaterialId },
      });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockProductionOrder);
      expect(result).toEqual(mockProductionOrder);
    });

    it('should throw NotFoundException if BOM does not exist', async () => {
      bomRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(bomRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.billOfMaterialId },
      });
    });

    it('should throw NotFoundException if production line does not exist', async () => {
      bomRepository.findOne.mockResolvedValue(mockBOM);
      productionLineRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(productionLineRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.productionLineId },
      });
    });

    it('should throw ConflictException if order number already exists', async () => {
      bomRepository.findOne.mockResolvedValue(mockBOM);
      productionLineRepository.findOne.mockResolvedValue(mockProductionLine);
      repository.findOne.mockResolvedValue(mockProductionOrder); // Duplicate found

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { orderNumber: createDto.orderNumber },
      });
    });

    it('should validate quantity is positive', async () => {
      const invalidDto = { ...createDto, quantity: -10 };
      bomRepository.findOne.mockResolvedValue(mockBOM);
      productionLineRepository.findOne.mockResolvedValue(mockProductionLine);

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should validate due date is in the future', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const invalidDto = { ...createDto, dueDate: pastDate };
      bomRepository.findOne.mockResolvedValue(mockBOM);
      productionLineRepository.findOne.mockResolvedValue(mockProductionLine);

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    const mockProductionOrders = [
      ManufacturingFixtures.createMockProductionOrder(),
      { ...ManufacturingFixtures.createMockProductionOrder(), id: 'po-002', orderNumber: 'PO-002' },
    ];

    it('should return paginated production orders', async () => {
      const options = { page: 1, limit: 10 };
      repository.findAndCount.mockResolvedValue([mockProductionOrders, 2]);

      const result = await service.findAll(options);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        relations: ['billOfMaterial', 'productionLine', 'workOrders'],
        take: 10,
        skip: 0,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({
        data: mockProductionOrders,
        total: 2,
        page: 1,
        limit: 10,
      });
    });

    it('should filter by status', async () => {
      const options = { status: 'in_progress', page: 1, limit: 10 };
      repository.findAndCount.mockResolvedValue([mockProductionOrders, 2]);

      await service.findAll(options);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { status: 'in_progress' },
        relations: ['billOfMaterial', 'productionLine', 'workOrders'],
        take: 10,
        skip: 0,
        order: { createdAt: 'DESC' },
      });
    });

    it('should filter by priority', async () => {
      const options = { priority: 'high', page: 1, limit: 10 };
      repository.findAndCount.mockResolvedValue([mockProductionOrders, 2]);

      await service.findAll(options);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { priority: 'high' },
        relations: ['billOfMaterial', 'productionLine', 'workOrders'],
        take: 10,
        skip: 0,
        order: { createdAt: 'DESC' },
      });
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const options = { startDate, endDate, page: 1, limit: 10 };
      repository.findAndCount.mockResolvedValue([mockProductionOrders, 2]);

      await service.findAll(options);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {
          dueDate: expect.objectContaining({
            _type: 'between',
            _value: [startDate, endDate],
          }),
        },
        relations: ['billOfMaterial', 'productionLine', 'workOrders'],
        take: 10,
        skip: 0,
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    const mockProductionOrder = ManufacturingFixtures.createMockProductionOrder();

    it('should return production order by id', async () => {
      repository.findOne.mockResolvedValue(mockProductionOrder);

      const result = await service.findOne('po-001');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'po-001' },
        relations: ['billOfMaterial', 'productionLine', 'workOrders', 'workOrders.workCenter'],
      });
      expect(result).toEqual(mockProductionOrder);
    });

    it('should throw NotFoundException if production order not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const mockProductionOrder = ManufacturingFixtures.createMockProductionOrder();
    const updateDto = { priority: 'high' as const, notes: 'Updated priority' };

    it('should update production order successfully', async () => {
      const updatedOrder = { ...mockProductionOrder, ...updateDto };
      repository.findOne.mockResolvedValue(mockProductionOrder);
      repository.save.mockResolvedValue(updatedOrder);

      const result = await service.update('po-001', updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'po-001' },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockProductionOrder,
        ...updateDto,
      });
      expect(result).toEqual(updatedOrder);
    });

    it('should throw NotFoundException if production order not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should prevent updating completed orders', async () => {
      const completedOrder = { ...mockProductionOrder, status: 'completed' };
      repository.findOne.mockResolvedValue(completedOrder);

      await expect(service.update('po-001', updateDto)).rejects.toThrow(BadRequestException);
    });

    it('should validate updated quantity is positive', async () => {
      repository.findOne.mockResolvedValue(mockProductionOrder);

      await expect(service.update('po-001', { quantity: -10 })).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    const mockProductionOrder = ManufacturingFixtures.createMockProductionOrder();

    it('should remove production order successfully', async () => {
      repository.findOne.mockResolvedValue(mockProductionOrder);
      workOrderRepository.find.mockResolvedValue([]); // No work orders
      repository.remove.mockResolvedValue(mockProductionOrder);

      await service.remove('po-001');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'po-001' },
      });
      expect(workOrderRepository.find).toHaveBeenCalledWith({
        where: { productionOrderId: 'po-001' },
      });
      expect(repository.remove).toHaveBeenCalledWith(mockProductionOrder);
    });

    it('should throw NotFoundException if production order not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should prevent removing orders with active work orders', async () => {
      const mockWorkOrder = ManufacturingFixtures.createMockWorkOrder();
      repository.findOne.mockResolvedValue(mockProductionOrder);
      workOrderRepository.find.mockResolvedValue([mockWorkOrder]);

      await expect(service.remove('po-001')).rejects.toThrow(BadRequestException);
    });

    it('should prevent removing completed orders', async () => {
      const completedOrder = { ...mockProductionOrder, status: 'completed' };
      repository.findOne.mockResolvedValue(completedOrder);

      await expect(service.remove('po-001')).rejects.toThrow(BadRequestException);
    });
  });

  describe('start', () => {
    const mockProductionOrder = ManufacturingFixtures.createMockProductionOrder();

    it('should start production order successfully', async () => {
      const startedOrder = {
        ...mockProductionOrder,
        status: 'in_progress',
        startDate: new Date(),
      };
      repository.findOne.mockResolvedValue(mockProductionOrder);
      repository.save.mockResolvedValue(startedOrder);

      const result = await service.start('po-001');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'po-001' },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockProductionOrder,
        status: 'in_progress',
        startDate: expect.any(Date),
      });
      expect(result).toEqual(startedOrder);
    });

    it('should throw NotFoundException if production order not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.start('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should prevent starting already started orders', async () => {
      const startedOrder = { ...mockProductionOrder, status: 'in_progress' };
      repository.findOne.mockResolvedValue(startedOrder);

      await expect(service.start('po-001')).rejects.toThrow(BadRequestException);
    });
  });

  describe('complete', () => {
    const mockProductionOrder = {
      ...ManufacturingFixtures.createMockProductionOrder(),
      status: 'in_progress',
      startDate: new Date(),
    };

    it('should complete production order successfully', async () => {
      const completedOrder = {
        ...mockProductionOrder,
        status: 'completed',
        completedDate: new Date(),
        actualQuantity: 95,
      };
      repository.findOne.mockResolvedValue(mockProductionOrder);
      repository.save.mockResolvedValue(completedOrder);

      const result = await service.complete('po-001', { actualQuantity: 95 });

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'po-001' },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockProductionOrder,
        status: 'completed',
        completedDate: expect.any(Date),
        actualQuantity: 95,
      });
      expect(result).toEqual(completedOrder);
    });

    it('should throw NotFoundException if production order not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.complete('non-existent', { actualQuantity: 95 })).rejects.toThrow(NotFoundException);
    });

    it('should prevent completing non-started orders', async () => {
      const pendingOrder = { ...mockProductionOrder, status: 'pending' };
      repository.findOne.mockResolvedValue(pendingOrder);

      await expect(service.complete('po-001', { actualQuantity: 95 })).rejects.toThrow(BadRequestException);
    });

    it('should validate actual quantity is positive', async () => {
      repository.findOne.mockResolvedValue(mockProductionOrder);

      await expect(service.complete('po-001', { actualQuantity: -10 })).rejects.toThrow(BadRequestException);
    });
  });

  describe('pause', () => {
    const mockProductionOrder = {
      ...ManufacturingFixtures.createMockProductionOrder(),
      status: 'in_progress',
    };

    it('should pause production order successfully', async () => {
      const pausedOrder = { ...mockProductionOrder, status: 'paused' };
      repository.findOne.mockResolvedValue(mockProductionOrder);
      repository.save.mockResolvedValue(pausedOrder);

      const result = await service.pause('po-001', 'Equipment maintenance required');

      expect(repository.save).toHaveBeenCalledWith({
        ...mockProductionOrder,
        status: 'paused',
        notes: 'Equipment maintenance required',
      });
      expect(result).toEqual(pausedOrder);
    });

    it('should prevent pausing non-active orders', async () => {
      const pendingOrder = { ...mockProductionOrder, status: 'pending' };
      repository.findOne.mockResolvedValue(pendingOrder);

      await expect(service.pause('po-001', 'Test reason')).rejects.toThrow(BadRequestException);
    });
  });

  describe('resume', () => {
    const mockProductionOrder = {
      ...ManufacturingFixtures.createMockProductionOrder(),
      status: 'paused',
    };

    it('should resume production order successfully', async () => {
      const resumedOrder = { ...mockProductionOrder, status: 'in_progress' };
      repository.findOne.mockResolvedValue(mockProductionOrder);
      repository.save.mockResolvedValue(resumedOrder);

      const result = await service.resume('po-001');

      expect(repository.save).toHaveBeenCalledWith({
        ...mockProductionOrder,
        status: 'in_progress',
      });
      expect(result).toEqual(resumedOrder);
    });

    it('should prevent resuming non-paused orders', async () => {
      const activeOrder = { ...mockProductionOrder, status: 'in_progress' };
      repository.findOne.mockResolvedValue(activeOrder);

      await expect(service.resume('po-001')).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    const mockProductionOrder = ManufacturingFixtures.createMockProductionOrder();

    it('should cancel production order successfully', async () => {
      const cancelledOrder = { ...mockProductionOrder, status: 'cancelled' };
      repository.findOne.mockResolvedValue(mockProductionOrder);
      workOrderRepository.find.mockResolvedValue([]); // No active work orders
      repository.save.mockResolvedValue(cancelledOrder);

      const result = await service.cancel('po-001', 'Material shortage');

      expect(workOrderRepository.find).toHaveBeenCalledWith({
        where: { productionOrderId: 'po-001', status: 'in_progress' },
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockProductionOrder,
        status: 'cancelled',
        notes: 'Material shortage',
      });
      expect(result).toEqual(cancelledOrder);
    });

    it('should prevent cancelling orders with active work orders', async () => {
      const mockWorkOrder = ManufacturingFixtures.createMockWorkOrder();
      repository.findOne.mockResolvedValue(mockProductionOrder);
      workOrderRepository.find.mockResolvedValue([mockWorkOrder]);

      await expect(service.cancel('po-001', 'Test reason')).rejects.toThrow(BadRequestException);
    });

    it('should prevent cancelling completed orders', async () => {
      const completedOrder = { ...mockProductionOrder, status: 'completed' };
      repository.findOne.mockResolvedValue(completedOrder);

      await expect(service.cancel('po-001', 'Test reason')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProgress', () => {
    const mockProductionOrder = ManufacturingFixtures.createMockProductionOrder();
    const mockWorkOrders = [
      { ...ManufacturingFixtures.createMockWorkOrder(), status: 'completed', actualQuantity: 30 },
      { ...ManufacturingFixtures.createMockWorkOrder(), status: 'in_progress', actualQuantity: 20 },
      { ...ManufacturingFixtures.createMockWorkOrder(), status: 'pending', actualQuantity: 0 },
    ];

    it('should calculate production progress correctly', async () => {
      repository.findOne.mockResolvedValue({
        ...mockProductionOrder,
        workOrders: mockWorkOrders,
      });

      const result = await service.getProgress('po-001');

      expect(result).toEqual({
        totalQuantity: mockProductionOrder.quantity,
        completedQuantity: 50,
        inProgressQuantity: 20,
        remainingQuantity: 30,
        progressPercentage: 50,
        estimatedCompletion: expect.any(Date),
        isOnSchedule: expect.any(Boolean),
        workOrdersCompleted: 1,
        workOrdersInProgress: 1,
        workOrdersPending: 1,
        workOrdersTotal: 3,
      });
    });

    it('should handle production order with no work orders', async () => {
      repository.findOne.mockResolvedValue({
        ...mockProductionOrder,
        workOrders: [],
      });

      const result = await service.getProgress('po-001');

      expect(result.progressPercentage).toBe(0);
      expect(result.workOrdersTotal).toBe(0);
    });
  });

  describe('getMaterialRequirements', () => {
    const mockProductionOrder = ManufacturingFixtures.createMockProductionOrder();
    const mockBOM = {
      ...ManufacturingFixtures.createMockBOM(),
      components: [
        {
          id: 'comp-001',
          materialCode: 'MAT-001',
          materialName: 'Steel Plate',
          quantity: 2,
          unit: 'kg',
          cost: 50.0,
        },
        {
          id: 'comp-002',
          materialCode: 'MAT-002',
          materialName: 'Aluminum Rod',
          quantity: 1.5,
          unit: 'meter',
          cost: 25.0,
        },
      ],
    };

    it('should calculate material requirements correctly', async () => {
      repository.findOne.mockResolvedValue({
        ...mockProductionOrder,
        billOfMaterial: mockBOM,
      });

      const result = await service.getMaterialRequirements('po-001');

      expect(result).toEqual({
        materials: [
          {
            materialCode: 'MAT-001',
            materialName: 'Steel Plate',
            quantityRequired: 200, // 2 * 100 (production quantity)
            unit: 'kg',
            unitCost: 50.0,
            totalCost: 10000.0,
          },
          {
            materialCode: 'MAT-002',
            materialName: 'Aluminum Rod',
            quantityRequired: 150, // 1.5 * 100
            unit: 'meter',
            unitCost: 25.0,
            totalCost: 3750.0,
          },
        ],
        totalMaterialCost: 13750.0,
      });
    });

    it('should handle production order without BOM', async () => {
      repository.findOne.mockResolvedValue({
        ...mockProductionOrder,
        billOfMaterial: null,
      });

      const result = await service.getMaterialRequirements('po-001');

      expect(result).toEqual({
        materials: [],
        totalMaterialCost: 0,
      });
    });
  });

  describe('getSchedulingConflicts', () => {
    const mockProductionOrder = ManufacturingFixtures.createMockProductionOrder();

    it('should identify scheduling conflicts', async () => {
      const conflictingOrders = [
        {
          ...ManufacturingFixtures.createMockProductionOrder(),
          id: 'po-002',
          orderNumber: 'PO-002',
          dueDate: mockProductionOrder.dueDate,
          productionLineId: mockProductionOrder.productionLineId,
        },
      ];

      repository.findOne.mockResolvedValue(mockProductionOrder);
      repository.find.mockResolvedValue(conflictingOrders);

      const result = await service.getSchedulingConflicts('po-001');

      expect(result).toEqual({
        hasConflicts: true,
        conflictingOrders: conflictingOrders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          dueDate: order.dueDate,
          priority: order.priority,
          estimatedDuration: order.estimatedDuration,
        })),
        suggestedReschedule: expect.any(Date),
      });
    });

    it('should return no conflicts when none exist', async () => {
      repository.findOne.mockResolvedValue(mockProductionOrder);
      repository.find.mockResolvedValue([]);

      const result = await service.getSchedulingConflicts('po-001');

      expect(result.hasConflicts).toBe(false);
      expect(result.conflictingOrders).toEqual([]);
    });
  });

  describe('updatePriority', () => {
    const mockProductionOrder = ManufacturingFixtures.createMockProductionOrder();

    it('should update priority successfully', async () => {
      const updatedOrder = { ...mockProductionOrder, priority: 'high' };
      repository.findOne.mockResolvedValue(mockProductionOrder);
      repository.save.mockResolvedValue(updatedOrder);

      const result = await service.updatePriority('po-001', 'high');

      expect(repository.save).toHaveBeenCalledWith({
        ...mockProductionOrder,
        priority: 'high',
      });
      expect(result).toEqual(updatedOrder);
    });

    it('should prevent updating priority of completed orders', async () => {
      const completedOrder = { ...mockProductionOrder, status: 'completed' };
      repository.findOne.mockResolvedValue(completedOrder);

      await expect(service.updatePriority('po-001', 'high')).rejects.toThrow(BadRequestException);
    });
  });
});
