import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { AdvancedIoTIntegrationService } from '../services/AdvancedIoTIntegrationService';
import { AdvancedAIAnalyticsService } from '../services/AdvancedAIAnalyticsService';
import { AdvancedBlockchainIntegrationService } from '../services/AdvancedBlockchainIntegrationService';
import { IInventoryItem, InventoryItemModel } from '../models/InventoryItem.model';
import { IWarehouse, WarehouseModel } from '../models/Warehouse.model';
import { BaseController } from '../../../core/controllers/BaseController';

@injectable()
export class AdvancedSupplyChainController extends BaseController {
  constructor(
    @inject(AdvancedIoTIntegrationService) private iotService: AdvancedIoTIntegrationService,
    @inject(AdvancedAIAnalyticsService) private aiService: AdvancedAIAnalyticsService,
    @inject(AdvancedBlockchainIntegrationService) private blockchainService: AdvancedBlockchainIntegrationService
  ) {
    super();
  }

  // ===================
  // INVENTORY OPERATIONS
  // ===================

  /**
   * Get all inventory items with advanced features
   */
  public async getInventoryItems(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        warehouse, 
        category, 
        status, 
        search,
        includeIoT = false,
        includeAI = false,
        includeBlockchain = false 
      } = req.query;

      const query: any = { isActive: true };
      
      if (warehouse) query.warehouse = warehouse;
      if (category) query.category = category;
      if (status) query.status = status;
      if (search) {
        query.$text = { $search: search as string };
      }

      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        populate: [{ path: 'warehouse', select: 'name code type' }],
        sort: { createdAt: -1 }
      };

      const result = await InventoryItemModel.paginate(query, options);

      // Enrich with additional data if requested
      if (includeIoT === 'true' || includeAI === 'true' || includeBlockchain === 'true') {
        for (const item of result.docs) {
          if (includeIoT === 'true') {
            const iotData = this.iotService.getDeviceByAssetId(item.id);
            (item as any).iotData = iotData;
          }

          if (includeAI === 'true') {
            const aiData = {
              demandPrediction: await this.aiService.getPrediction('demand', item.id),
              qualityPrediction: await this.aiService.getPrediction('quality', item.id),
              riskAssessment: await this.aiService.detectAnomalies('inventory', item.toObject(), {})
            };
            (item as any).aiData = aiData;
          }

          if (includeBlockchain === 'true') {
            const blockchainData = await this.blockchainService.getSupplyChainHistory(item.id);
            (item as any).blockchainData = blockchainData;
          }
        }
      }

      this.sendSuccess(res, result, 'Inventory items retrieved successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Get single inventory item with full integration
   */
  public async getInventoryItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const item = await InventoryItemModel.findById(id)
        .populate('warehouse')
        .lean();

      if (!item) {
        return this.sendError(res, new Error('Item not found'), 404);
      }

      // Get IoT sensor data
      const iotSensors = item.iotSensors.map(sensor => ({
        ...sensor,
        realtimeData: this.iotService.getSensorData(sensor.sensorId)
      }));

      // Get AI predictions and analytics
      const aiData = {
        demandPrediction: await this.aiService.getPrediction('demand', id),
        qualityPrediction: await this.aiService.getPrediction('quality', id),
        optimization: await this.aiService.generateOptimizationRecommendations(id, 'inventory'),
        riskScore: item.aiMetadata?.riskScore || null
      };

      // Get blockchain traceability
      const blockchainData = await this.blockchainService.getSupplyChainHistory(id);

      const enrichedItem = {
        ...item,
        iot: { sensors: iotSensors },
        ai: aiData,
        blockchain: blockchainData
      };

      this.sendSuccess(res, enrichedItem, 'Inventory item retrieved successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Create new inventory item with advanced features
   */
  public async createInventoryItem(req: Request, res: Response): Promise<void> {
    try {
      const itemData = req.body;
      
      // Create the inventory item
      const newItem = await InventoryItemModel.create({
        ...itemData,
        createdBy: req.user?.id,
        updatedBy: req.user?.id
      });

      // Record creation on blockchain
      const blockchainTxId = await this.blockchainService.recordItemCreation(
        newItem.id,
        newItem.sku,
        newItem.toObject(),
        newItem.warehouse.toHexString(),
        req.user?.id
      );

      // Register IoT sensors if provided
      if (itemData.iotSensors && itemData.iotSensors.length > 0) {
        for (const sensorData of itemData.iotSensors) {
          await this.iotService.registerDevice({
            deviceId: sensorData.sensorId,
            type: sensorData.type,
            assetId: newItem.id,
            location: {
              warehouseId: newItem.warehouse.toHexString(),
              zoneId: newItem.location.zone,
              coordinates: newItem.location.coordinates
            },
            configuration: sensorData.thresholds || {}
          });
        }
      }

      // Trigger initial AI analysis
      await this.aiService.predictDemand(newItem.id, newItem.sku, []);

      const populatedItem = await InventoryItemModel.findById(newItem.id)
        .populate('warehouse');

      this.sendSuccess(res, {
        item: populatedItem,
        blockchainTransaction: blockchainTxId
      }, 'Inventory item created successfully', 201);

    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Update inventory quantity with full traceability
   */
  public async updateInventoryQuantity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { adjustment, reason, location } = req.body;

      const item = await InventoryItemModel.findById(id);
      if (!item) {
        return this.sendError(res, new Error('Item not found'), 404);
      }

      const previousQuantity = item.quantity.current;
      const newQuantity = previousQuantity + adjustment;

      if (newQuantity < 0) {
        return this.sendError(res, new Error('Insufficient inventory'), 400);
      }

      // Update quantity
      item.quantity.current = newQuantity;
      item.lifecycle.lastCounted = new Date();
      item.updatedBy = req.user?.id;

      // Add audit trail
      item.auditTrail.push({
        action: 'quantity_adjustment',
        user: req.user?.id,
        timestamp: new Date(),
        changes: { 
          previousQuantity, 
          newQuantity, 
          adjustment, 
          reason 
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      await item.save();

      // Record on blockchain
      await this.blockchainService.recordInventoryUpdate(
        id,
        {
          previousQuantity,
          newQuantity,
          adjustment,
          reason,
          location: location || item.location
        },
        item.warehouse.toHexString(),
        req.user?.id
      );

      // Trigger AI analysis for demand pattern updates
      await this.aiService.predictDemand(id, item.sku, [{
        date: new Date(),
        quantity: adjustment,
        type: adjustment > 0 ? 'restock' : 'consumption'
      }]);

      this.sendSuccess(res, item, 'Inventory quantity updated successfully');

    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Transfer inventory between locations
   */
  public async transferInventoryItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { fromWarehouse, toWarehouse, quantity, reason } = req.body;

      const item = await InventoryItemModel.findById(id);
      if (!item) {
        return this.sendError(res, new Error('Item not found'), 404);
      }

      if (item.quantity.current < quantity) {
        return this.sendError(res, new Error('Insufficient quantity for transfer'), 400);
      }

      // Update item location and quantity
      const previousLocation = { ...item.location };
      item.location = req.body.newLocation;
      item.quantity.current -= quantity;
      item.lifecycle.lastMoved = new Date();

      await item.save();

      // Record transfer on blockchain
      await this.blockchainService.recordItemTransfer(
        id,
        fromWarehouse,
        toWarehouse,
        quantity,
        req.user?.id
      );

      // Update IoT device locations if applicable
      for (const sensor of item.iotSensors) {
        await this.iotService.updateDeviceLocation(sensor.sensorId, {
          warehouseId: toWarehouse,
          zoneId: item.location.zone,
          coordinates: item.location.coordinates
        });
      }

      this.sendSuccess(res, item, 'Inventory transfer completed successfully');

    } catch (error) {
      this.sendError(res, error);
    }
  }

  // ==================
  // WAREHOUSE OPERATIONS
  // ==================

  /**
   * Get all warehouses with advanced analytics
   */
  public async getWarehouses(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 10, 
        type, 
        status,
        includeAnalytics = false 
      } = req.query;

      const query: any = { isActive: true };
      
      if (type) query.type = type;
      if (status) query.status = status;

      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sort: { createdAt: -1 }
      };

      const result = await WarehouseModel.paginate(query, options);

      // Add analytics if requested
      if (includeAnalytics === 'true') {
        for (const warehouse of result.docs) {
          const analytics = await this.aiService.analyzeWarehouseOperations(warehouse.id);
          (warehouse as any).analytics = analytics;
        }
      }

      this.sendSuccess(res, result, 'Warehouses retrieved successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Get warehouse with full integration
   */
  public async getWarehouse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const warehouse = await WarehouseModel.findById(id).lean();
      if (!warehouse) {
        return this.sendError(res, new Error('Warehouse not found'), 404);
      }

      // Get IoT device status
      const iotDevices = this.iotService.getWarehouseDevices(id);
      
      // Get AI analytics
      const aiAnalytics = await this.aiService.analyzeWarehouseOperations(id);

      // Get inventory count
      const inventoryCount = await InventoryItemModel.countDocuments({ 
        warehouse: id, 
        isActive: true 
      });

      const enrichedWarehouse = {
        ...warehouse,
        iot: {
          deviceCount: iotDevices.length,
          onlineDevices: iotDevices.filter(d => d.status === 'online').length,
          devices: iotDevices
        },
        ai: aiAnalytics,
        inventory: {
          totalItems: inventoryCount
        }
      };

      this.sendSuccess(res, enrichedWarehouse, 'Warehouse retrieved successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  // ===================
  // IOT OPERATIONS
  // ===================

  /**
   * Get IoT dashboard data
   */
  public async getIoTDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { warehouseId } = req.query;
      
      const dashboardData = await this.iotService.getDashboardData(warehouseId as string);
      
      this.sendSuccess(res, dashboardData, 'IoT dashboard data retrieved successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Register new IoT device
   */
  public async registerIoTDevice(req: Request, res: Response): Promise<void> {
    try {
      const deviceData = req.body;
      
      await this.iotService.registerDevice(deviceData);
      
      this.sendSuccess(res, { deviceId: deviceData.deviceId }, 'IoT device registered successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  // ===================
  // AI OPERATIONS
  // ===================

  /**
   * Get AI predictions for an item
   */
  public async getAIPredictions(req: Request, res: Response): Promise<void> {
    try {
      const { itemId, type } = req.params;
      
      const prediction = await this.aiService.getPrediction(type as any, itemId);
      
      this.sendSuccess(res, prediction, `${type} prediction retrieved successfully`);
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Generate optimization recommendations
   */
  public async generateOptimizations(req: Request, res: Response): Promise<void> {
    try {
      const { warehouseId, type } = req.params;
      
      const recommendations = await this.aiService.generateOptimizationRecommendations(
        warehouseId, 
        type as any
      );
      
      this.sendSuccess(res, recommendations, 'Optimization recommendations generated successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  // =======================
  // BLOCKCHAIN OPERATIONS
  // =======================

  /**
   * Get supply chain history for an item
   */
  public async getSupplyChainHistory(req: Request, res: Response): Promise<void> {
    try {
      const { itemId } = req.params;
      
      const history = await this.blockchainService.getSupplyChainHistory(itemId);
      
      this.sendSuccess(res, history, 'Supply chain history retrieved successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Verify supply chain integrity
   */
  public async verifySupplyChain(req: Request, res: Response): Promise<void> {
    try {
      const { itemId } = req.params;
      
      const verified = await this.blockchainService.verifySupplyChainIntegrity(itemId);
      
      this.sendSuccess(res, { verified }, 'Supply chain verification completed');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Generate compliance report
   */
  public async generateComplianceReport(req: Request, res: Response): Promise<void> {
    try {
      const { itemId } = req.params;
      
      const report = await this.blockchainService.generateComplianceReport(itemId);
      
      this.sendSuccess(res, report, 'Compliance report generated successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Get blockchain network status
   */
  public async getBlockchainStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await this.blockchainService.getNetworkStatus();
      
      this.sendSuccess(res, status, 'Blockchain status retrieved successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  // =======================
  // ANALYTICS & REPORTING
  // =======================

  /**
   * Get comprehensive analytics dashboard
   */
  public async getAnalyticsDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { warehouseId, timeframe = '7d' } = req.query;
      
      const [
        inventoryMetrics,
        iotMetrics,
        aiMetrics,
        blockchainMetrics
      ] = await Promise.all([
        this.getInventoryMetrics(warehouseId as string, timeframe as string),
        this.iotService.getAnalytics(warehouseId as string),
        this.aiService.getSystemAnalytics(),
        this.blockchainService.getSupplyChainAnalytics()
      ]);

      const dashboard = {
        inventory: inventoryMetrics,
        iot: iotMetrics,
        ai: aiMetrics,
        blockchain: blockchainMetrics,
        generatedAt: new Date()
      };

      this.sendSuccess(res, dashboard, 'Analytics dashboard retrieved successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Helper method to get inventory metrics
   */
  private async getInventoryMetrics(warehouseId?: string, timeframe?: string): Promise<any> {
    const query: any = { isActive: true };
    if (warehouseId) query.warehouse = warehouseId;

    const [
      totalItems,
      lowStockItems,
      recentMovements
    ] = await Promise.all([
      InventoryItemModel.countDocuments(query),
      InventoryItemModel.countDocuments({
        ...query,
        $expr: { $lt: ['$quantity.current', '$quantity.minimum'] }
      }),
      InventoryItemModel.find(query)
        .sort({ 'lifecycle.lastMoved': -1 })
        .limit(10)
        .select('name sku lifecycle.lastMoved')
    ]);

    return {
      totalItems,
      lowStockItems,
      recentMovements: recentMovements.length,
      stockValue: 0 // Calculate based on pricing data
    };
  }

  /**
   * Export data for external systems
   */
  public async exportData(req: Request, res: Response): Promise<void> {
    try {
      const { type, format = 'json', warehouseId } = req.query;
      
      let data;
      
      switch (type) {
        case 'inventory':
          const query = warehouseId ? { warehouse: warehouseId, isActive: true } : { isActive: true };
          data = await InventoryItemModel.find(query).populate('warehouse').lean();
          break;
          
        case 'warehouses':
          data = await WarehouseModel.find({ isActive: true }).lean();
          break;
          
        case 'iot':
          data = this.iotService.getWarehouseDevices(warehouseId as string);
          break;
          
        default:
          return this.sendError(res, new Error('Invalid export type'), 400);
      }

      // Set appropriate headers for download
      res.setHeader('Content-Disposition', `attachment; filename=${type}_export.${format}`);
      res.setHeader('Content-Type', `application/${format}`);
      
      this.sendSuccess(res, data, `${type} data exported successfully`);
      
    } catch (error) {
      this.sendError(res, error);
    }
  }
}

export default AdvancedSupplyChainController;
