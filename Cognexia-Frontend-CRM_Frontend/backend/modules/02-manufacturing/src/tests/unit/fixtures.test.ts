// Simple test to verify fixtures are working
import { ManufacturingFixtures } from '../fixtures/manufacturing.fixtures';

describe('ManufacturingFixtures', () => {
  it('should create work center DTO', () => {
    const dto = ManufacturingFixtures.createWorkCenterDto();
    
    expect(dto).toBeDefined();
    expect(dto.code).toBeDefined();
    expect(dto.name).toBeDefined();
    expect(dto.type).toBeDefined();
    expect(dto.capacity).toBeDefined();
    expect(typeof dto.capacity).toBe('number');
    expect(dto.capacity).toBeGreaterThan(0);
  });

  it('should create mock work center', () => {
    const workCenter = ManufacturingFixtures.createMockWorkCenter();
    
    expect(workCenter).toBeDefined();
    expect(workCenter.id).toBeDefined();
    expect(workCenter.code).toBeDefined();
    expect(workCenter.name).toBeDefined();
    expect(workCenter.type).toBeDefined();
    expect(workCenter.capacity).toBeDefined();
    expect(workCenter.efficiency).toBeDefined();
    expect(workCenter.status).toBeDefined();
  });

  it('should create production order DTO', () => {
    const dto = ManufacturingFixtures.createProductionOrderDto();
    
    expect(dto).toBeDefined();
    expect(dto.orderNumber).toBeDefined();
    expect(dto.billOfMaterialId).toBeDefined();
    expect(dto.quantity).toBeDefined();
    expect(dto.dueDate).toBeDefined();
    expect(dto.priority).toBeDefined();
    expect(typeof dto.quantity).toBe('number');
    expect(dto.quantity).toBeGreaterThan(0);
  });

  it('should create IoT device DTO', () => {
    const dto = ManufacturingFixtures.createIoTDeviceDto();
    
    expect(dto).toBeDefined();
    expect(dto.deviceId).toBeDefined();
    expect(dto.deviceType).toBeDefined();
    expect(dto.workCenterId).toBeDefined();
    expect(dto.location).toBeDefined();
    expect(dto.manufacturer).toBeDefined();
  });

  it('should create quality check DTO', () => {
    const dto = ManufacturingFixtures.createQualityCheckDto();
    
    expect(dto).toBeDefined();
    expect(dto.checkType).toBeDefined();
    expect(dto.workOrderId).toBeDefined();
    expect(dto.criteria).toBeDefined();
    expect(Array.isArray(dto.criteria)).toBe(true);
    expect(dto.criteria.length).toBeGreaterThan(0);
  });

  it('should create consistent mock data', () => {
    const workCenter1 = ManufacturingFixtures.createMockWorkCenter();
    const workCenter2 = ManufacturingFixtures.createMockWorkCenter();
    
    // Should have same structure but different content
    expect(workCenter1).toBeDefined();
    expect(workCenter2).toBeDefined();
    expect(workCenter1.code).toBeDefined();
    expect(workCenter2.code).toBeDefined();
    
    // Basic validation of data types
    expect(typeof workCenter1.capacity).toBe('number');
    expect(typeof workCenter2.capacity).toBe('number');
  });
});
