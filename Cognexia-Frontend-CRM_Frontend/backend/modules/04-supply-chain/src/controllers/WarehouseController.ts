import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { BaseController } from '../../../core/controllers/BaseController';
import { WarehouseAutomationService } from '../services/WarehouseAutomationService';
import { IntelligentWarehouseOperationsService } from '../services/IntelligentWarehouseOperationsService';
import { SmartWarehouseLayoutOptimizationService } from '../services/SmartWarehouseLayoutOptimizationService';
import { SmartCrossDockingFlowThroughService } from '../services/SmartCrossDockingFlowThroughService';
import { SmartStorageLocationOptimizationService } from '../services/SmartStorageLocationOptimizationService';
import { WarehouseModel } from '../models/Warehouse.model';
import { InventoryItemModel } from '../models/InventoryItem.model';
import { AdvancedIoTIntegrationService } from '../services/AdvancedIoTIntegrationService';
import { AdvancedAIAnalyticsService } from '../services/AdvancedAIAnalyticsService';

@injectable()
export class WarehouseController extends BaseController {
  constructor(
    @inject(WarehouseAutomationService) private automationService: WarehouseAutomationService,
    @inject(IntelligentWarehouseOperationsService) private operationsService: IntelligentWarehouseOperationsService,
    @inject(SmartWarehouseLayoutOptimizationService) private layoutService: SmartWarehouseLayoutOptimizationService,
    @inject(SmartCrossDockingFlowThroughService) private crossDockingService: SmartCrossDockingFlowThroughService,
    @inject(SmartStorageLocationOptimizationService) private storageOptimizationService: SmartStorageLocationOptimizationService,
    @inject(AdvancedIoTIntegrationService) private iotService: AdvancedIoTIntegrationService,
    @inject(AdvancedAIAnalyticsService) private aiService: AdvancedAIAnalyticsService
  ) {
    super();
  }

  /**
   * Create new warehouse with advanced setup
   */
  public async createWarehouse(req: Request, res: Response): Promise<void> {
    try {
      const warehouseData = req.body;

      // Validate location coordinates
      if (warehouseData.location?.coordinates) {
        const { latitude, longitude } = warehouseData.location.coordinates;
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
          return this.sendError(res, new Error('Invalid coordinates'), 400);
        }
      }

      // Create warehouse
      const warehouse = await WarehouseModel.create({
        ...warehouseData,
        createdBy: req.user?.id,
        updatedBy: req.user?.id
      });

      // Initialize automation systems
      if (warehouseData.automationSystems?.wms?.enabled) {
        await this.automationService.initializeWMS(warehouse.id, warehouseData.automationSystems.wms);
      }

      if (warehouseData.automationSystems?.robotics?.enabled) {
        await this.automationService.initializeRobotics(warehouse.id, warehouseData.automationSystems.robotics);
      }

      // Setup IoT sensors if provided
      if (warehouseData.iotSensors && warehouseData.iotSensors.length > 0) {
        for (const sensor of warehouseData.iotSensors) {
          await this.iotService.registerDevice({
            deviceId: sensor.sensorId,
            type: sensor.type,
            location: {
              warehouseId: warehouse.id,
              zone: sensor.zone,
              coordinates: { x: 0, y: 0, z: 0 } // Default coordinates
            },
            configuration: sensor.thresholds || {}
          });
        }
      }

      // Generate initial layout optimization
      const layoutOptimization = await this.layoutService.optimizeWarehouseLayout(
        warehouse.id,
        {
          zones: warehouse.capacity.zones,
          totalArea: warehouse.capacity.totalArea,
          throughputGoals: { daily: 1000, weekly: 7000, monthly: 30000 }
        }
      );

      const populatedWarehouse = await WarehouseModel.findById(warehouse.id);

      this.sendSuccess(res, {
        warehouse: populatedWarehouse,
        layoutOptimization,
        automationStatus: {
          wms: warehouseData.automationSystems?.wms?.enabled || false,
          robotics: warehouseData.automationSystems?.robotics?.enabled || false,
          aiOptimization: warehouseData.automationSystems?.aiOptimization?.enabled || false
        }
      }, 'Warehouse created successfully with advanced features', 201);

    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Update warehouse configuration
   */
  public async updateWarehouse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const warehouse = await WarehouseModel.findById(id);
      if (!warehouse) {
        return this.sendError(res, new Error('Warehouse not found'), 404);
      }

      // Update warehouse
      Object.assign(warehouse, updates);
      warehouse.updatedBy = req.user?.id;
      await warehouse.save();

      // If layout changed, re-optimize
      if (updates.capacity?.zones) {
        const layoutOptimization = await this.layoutService.optimizeWarehouseLayout(
          id,
          {
            zones: updates.capacity.zones,
            totalArea: updates.capacity?.totalArea || warehouse.capacity.totalArea,
            throughputGoals: { daily: 1000, weekly: 7000, monthly: 30000 }
          }
        );
        (warehouse as any).layoutOptimization = layoutOptimization;
      }

      this.sendSuccess(res, warehouse, 'Warehouse updated successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Delete warehouse (soft delete)
   */
  public async deleteWarehouse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if warehouse has inventory items
      const inventoryCount = await InventoryItemModel.countDocuments({ 
        warehouse: id, 
        isActive: true 
      });

      if (inventoryCount > 0) {
        return this.sendError(res, new Error('Cannot delete warehouse with active inventory items'), 400);
      }

      const warehouse = await WarehouseModel.findById(id);
      if (!warehouse) {
        return this.sendError(res, new Error('Warehouse not found'), 404);
      }

      warehouse.isActive = false;
      warehouse.status = 'inactive';
      warehouse.updatedBy = req.user?.id;
      await warehouse.save();

      this.sendSuccess(res, { warehouseId: id }, 'Warehouse deleted successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Optimize warehouse layout using AI
   */
  public async optimizeLayout(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { objectives = ['efficiency', 'cost', 'throughput'] } = req.body;

      const warehouse = await WarehouseModel.findById(id);
      if (!warehouse) {
        return this.sendError(res, new Error('Warehouse not found'), 404);
      }

      const optimization = await this.layoutService.optimizeWarehouseLayout(
        id,
        {
          zones: warehouse.capacity.zones,
          totalArea: warehouse.capacity.totalArea,
          throughputGoals: { daily: 1000, weekly: 7000, monthly: 30000 },
          objectives
        }
      );

      this.sendSuccess(res, optimization, 'Layout optimization completed successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Setup cross-docking operations
   */
  public async setupCrossDocking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { configuration } = req.body;

      const setup = await this.crossDockingService.setupCrossDockingOperations(id, configuration);

      this.sendSuccess(res, setup, 'Cross-docking setup completed successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Optimize storage locations
   */
  public async optimizeStorageLocations(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const optimization = await this.storageOptimizationService.optimizeStorageLocations(id);

      this.sendSuccess(res, optimization, 'Storage location optimization completed successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Get warehouse performance analytics
   */
  public async getWarehouseAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { timeframe = '7d', metrics = ['all'] } = req.query;

      const warehouse = await WarehouseModel.findById(id);
      if (!warehouse) {
        return this.sendError(res, new Error('Warehouse not found'), 404);
      }

      // Get AI-powered analytics
      const aiAnalytics = await this.aiService.analyzeWarehouseOperations(id);
      
      // Get IoT sensor data analytics
      const iotAnalytics = await this.iotService.getAnalytics(id);

      // Get operational metrics
      const operationalMetrics = await this.operationsService.analyzeOperationalEfficiency(
        id,
        {},
        timeframe as string
      );

      // Get layout efficiency analysis
      const layoutAnalysis = await this.layoutService.analyzeLayoutEfficiency(id);

      const analytics = {
        summary: {
          warehouseId: id,
          timeframe,
          generatedAt: new Date(),
          overallScore: aiAnalytics.overallScore || 85
        },
        ai: aiAnalytics,
        iot: iotAnalytics,
        operational: operationalMetrics,
        layout: layoutAnalysis,
        recommendations: [
          ...aiAnalytics.recommendations || [],
          ...operationalMetrics.recommendations || [],
          ...layoutAnalysis.recommendations || []
        ]
      };

      this.sendSuccess(res, analytics, 'Warehouse analytics retrieved successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Get real-time warehouse dashboard
   */
  public async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const warehouse = await WarehouseModel.findById(id);
      if (!warehouse) {
        return this.sendError(res, new Error('Warehouse not found'), 404);
      }

      // Get real-time metrics
      const [
        inventoryCount,
        activeEquipment,
        activeSensors,
        todayOperations,
        alerts
      ] = await Promise.all([
        InventoryItemModel.countDocuments({ warehouse: id, isActive: true }),
        warehouse.equipment.filter(eq => eq.status === 'operational').length,
        warehouse.iotSensors.filter(sensor => sensor.status === 'active').length,
        this.operationsService.getTodayOperations(id),
        warehouse.alerts.filter(alert => !alert.acknowledged).length
      ]);

      // Get live IoT data
      const liveIoTData = this.iotService.getWarehouseDevices(id);

      const dashboard = {
        warehouse: {
          id: warehouse.id,
          name: warehouse.name,
          status: warehouse.status,
          utilization: warehouse.capacity.currentUtilization
        },
        metrics: {
          inventory: {
            totalItems: inventoryCount,
            utilization: `${Math.round((warehouse.capacity.currentUtilization / warehouse.capacity.storageCapacity) * 100)}%`,
            available: warehouse.capacity.storageCapacity - warehouse.capacity.currentUtilization
          },
          equipment: {
            total: warehouse.equipment.length,
            operational: activeEquipment,
            maintenance: warehouse.equipment.filter(eq => eq.status === 'maintenance').length
          },
          sensors: {
            total: warehouse.iotSensors.length,
            active: activeSensors,
            offline: warehouse.iotSensors.filter(sensor => sensor.status === 'inactive').length
          },
          operations: todayOperations,
          alerts: {
            total: alerts,
            critical: warehouse.alerts.filter(alert => !alert.acknowledged && alert.level === 'critical').length
          }
        },
        liveData: {
          iot: liveIoTData,
          timestamp: new Date()
        }
      };

      this.sendSuccess(res, dashboard, 'Warehouse dashboard data retrieved successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Manage warehouse equipment
   */
  public async manageEquipment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { action, equipmentId, data } = req.body;

      const warehouse = await WarehouseModel.findById(id);
      if (!warehouse) {
        return this.sendError(res, new Error('Warehouse not found'), 404);
      }

      let result;
      switch (action) {
        case 'add':
          warehouse.equipment.push(data);
          result = 'Equipment added successfully';
          break;
        case 'update':
          const equipmentIndex = warehouse.equipment.findIndex(eq => eq.id === equipmentId);
          if (equipmentIndex !== -1) {
            Object.assign(warehouse.equipment[equipmentIndex], data);
            result = 'Equipment updated successfully';
          } else {
            return this.sendError(res, new Error('Equipment not found'), 404);
          }
          break;
        case 'remove':
          warehouse.equipment = warehouse.equipment.filter(eq => eq.id !== equipmentId);
          result = 'Equipment removed successfully';
          break;
        default:
          return this.sendError(res, new Error('Invalid action'), 400);
      }

      await warehouse.save();

      this.sendSuccess(res, { equipment: warehouse.equipment }, result);
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Schedule equipment maintenance
   */
  public async scheduleMaintenance(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { equipmentId, maintenanceDate, type, notes } = req.body;

      const warehouse = await WarehouseModel.findById(id);
      if (!warehouse) {
        return this.sendError(res, new Error('Warehouse not found'), 404);
      }

      const equipment = warehouse.equipment.find(eq => eq.id === equipmentId);
      if (!equipment) {
        return this.sendError(res, new Error('Equipment not found'), 404);
      }

      equipment.nextMaintenance = new Date(maintenanceDate);
      equipment.status = 'maintenance';

      await warehouse.save();

      // Schedule with automation service
      await this.automationService.scheduleEquipmentMaintenance(id, equipmentId, {
        date: maintenanceDate,
        type,
        notes
      });

      this.sendSuccess(res, { 
        equipmentId, 
        maintenanceDate, 
        status: 'scheduled' 
      }, 'Maintenance scheduled successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Generate warehouse reports
   */
  public async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { 
        type = 'operational', 
        period = 'monthly', 
        format = 'json',
        includeRecommendations = true 
      } = req.query;

      const report = await this.operationsService.generateDetailedReport(
        id,
        type as string,
        {
          period: period as string,
          format: format as string,
          includeRecommendations: includeRecommendations === 'true',
          includeAnalytics: true,
          includePredictions: true
        }
      );

      // Set appropriate headers for download if needed
      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=warehouse_report_${id}_${period}.pdf`);
      } else if (format === 'excel') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=warehouse_report_${id}_${period}.xlsx`);
      }

      this.sendSuccess(res, report, 'Warehouse report generated successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }
}

export default WarehouseController;
