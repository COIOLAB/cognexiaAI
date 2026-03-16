import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { BaseController } from '../../../core/controllers/BaseController';
import { LogisticsCoordinationService } from '../services/LogisticsCoordinationService';
import { HyperAdvancedLogisticsService } from '../services/HyperAdvancedLogisticsService';
import { MaterialTrackingService } from '../services/MaterialTrackingService';
import { SmartMaterialFlowManagementService } from '../services/SmartMaterialFlowManagementService';
import { AdvancedAIAnalyticsService } from '../services/AdvancedAIAnalyticsService';
import { AdvancedIoTIntegrationService } from '../services/AdvancedIoTIntegrationService';

@injectable()
export class LogisticsController extends BaseController {
  constructor(
    @inject(LogisticsCoordinationService) private coordinationService: LogisticsCoordinationService,
    @inject(HyperAdvancedLogisticsService) private hyperLogisticsService: HyperAdvancedLogisticsService,
    @inject(MaterialTrackingService) private trackingService: MaterialTrackingService,
    @inject(SmartMaterialFlowManagementService) private materialFlowService: SmartMaterialFlowManagementService,
    @inject(AdvancedAIAnalyticsService) private aiService: AdvancedAIAnalyticsService,
    @inject(AdvancedIoTIntegrationService) private iotService: AdvancedIoTIntegrationService
  ) {
    super();
  }

  /**
   * Create logistics order with AI optimization
   */
  public async createLogisticsOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderData = req.body;

      // Validate shipment data
      if (!orderData.shipments || orderData.shipments.length === 0) {
        return this.sendError(res, new Error('At least one shipment is required'), 400);
      }

      // Create logistics order with AI-optimized routing
      const optimizedOrder = await this.coordinationService.createOptimizedLogisticsOrder({
        ...orderData,
        createdBy: req.user?.id,
        createdAt: new Date()
      });

      // Enable real-time tracking
      for (const shipment of optimizedOrder.shipments) {
        await this.trackingService.enableRealTimeTracking(shipment.id, {
          gps: true,
          sensors: ['temperature', 'humidity', 'shock'],
          updateInterval: 60000, // 1 minute
          geofencing: true
        });
      }

      // Optimize material flow
      const flowOptimization = await this.materialFlowService.optimizeMaterialFlow(
        optimizedOrder.id,
        {
          priority: orderData.priority || 'medium',
          deliveryWindow: orderData.deliveryWindow,
          constraints: orderData.constraints || {}
        }
      );

      this.sendSuccess(res, {
        order: optimizedOrder,
        flowOptimization,
        tracking: {
          enabled: true,
          trackingUrl: `/api/supply-chain/logistics/track/${optimizedOrder.id}`
        }
      }, 'Logistics order created successfully', 201);

    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Get logistics order with real-time tracking
   */
  public async getLogisticsOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { includeTracking = true, includeAnalytics = false } = req.query;

      const order = await this.coordinationService.getLogisticsOrderById(id);
      if (!order) {
        return this.sendError(res, new Error('Logistics order not found'), 404);
      }

      let enrichedOrder: any = { ...order };

      // Add real-time tracking data
      if (includeTracking === 'true') {
        const trackingData = await this.trackingService.getShipmentTracking(id);
        enrichedOrder.tracking = trackingData;
      }

      // Add analytics
      if (includeAnalytics === 'true') {
        const analytics = await this.aiService.analyzeLogisticsPerformance(id);
        enrichedOrder.analytics = analytics;
      }

      this.sendSuccess(res, enrichedOrder, 'Logistics order retrieved successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Update logistics order status
   */
  public async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, location, notes, updateTracking = true } = req.body;

      const updatedOrder = await this.coordinationService.updateOrderStatus(
        id,
        status,
        {
          location,
          notes,
          updatedBy: req.user?.id,
          timestamp: new Date()
        }
      );

      // Update tracking data
      if (updateTracking) {
        await this.trackingService.updateShipmentLocation(id, location);
      }

      this.sendSuccess(res, updatedOrder, 'Order status updated successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Optimize delivery routes using AI
   */
  public async optimizeRoutes(req: Request, res: Response): Promise<void> {
    try {
      const { orders, constraints = {}, objectives = ['time', 'cost', 'fuel'] } = req.body;

      if (!orders || orders.length === 0) {
        return this.sendError(res, new Error('At least one order is required'), 400);
      }

      // Use hyper-advanced logistics for route optimization
      const optimization = await this.hyperLogisticsService.optimizeGlobalDeliveryRoutes({
        orders,
        constraints: {
          maxVehicleCapacity: constraints.maxVehicleCapacity || 1000,
          maxDeliveryTime: constraints.maxDeliveryTime || 8, // hours
          fuelType: constraints.fuelType || 'electric',
          trafficOptimization: true,
          weatherConsideration: true,
          ...constraints
        },
        objectives
      });

      this.sendSuccess(res, optimization, 'Routes optimized successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Track shipment in real-time
   */
  public async trackShipment(req: Request, res: Response): Promise<void> {
    try {
      const { shipmentId } = req.params;
      const { includePredictions = true } = req.query;

      const tracking = await this.trackingService.getShipmentTracking(shipmentId);
      if (!tracking) {
        return this.sendError(res, new Error('Shipment not found'), 404);
      }

      let enrichedTracking: any = { ...tracking };

      // Add AI predictions
      if (includePredictions === 'true') {
        const predictions = await this.aiService.predictDeliveryTime(shipmentId);
        enrichedTracking.predictions = predictions;
      }

      this.sendSuccess(res, enrichedTracking, 'Shipment tracking retrieved successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Get logistics analytics dashboard
   */
  public async getLogisticsDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe = '7d', metrics = ['all'] } = req.query;

      const [
        activeOrders,
        deliveryMetrics,
        routeEfficiency,
        costAnalysis,
        performanceKPIs
      ] = await Promise.all([
        this.coordinationService.getActiveOrdersCount(),
        this.aiService.analyzeDeliveryMetrics(timeframe as string),
        this.hyperLogisticsService.analyzeRouteEfficiency(timeframe as string),
        this.aiService.analyzeLogisticsCosts(timeframe as string),
        this.coordinationService.getPerformanceKPIs(timeframe as string)
      ]);

      const dashboard = {
        summary: {
          timeframe,
          generatedAt: new Date(),
          activeOrders: activeOrders.count,
          onTimeDeliveryRate: deliveryMetrics.onTimeRate || 95,
          averageDeliveryTime: deliveryMetrics.averageTime || '2.5 hours',
          costEfficiency: costAnalysis.efficiencyScore || 88
        },
        metrics: {
          delivery: deliveryMetrics,
          routes: routeEfficiency,
          costs: costAnalysis,
          performance: performanceKPIs
        },
        realTimeData: {
          vehiclesInTransit: activeOrders.inTransit || 0,
          delayedShipments: activeOrders.delayed || 0,
          fuelConsumption: routeEfficiency.totalFuelUsed || 0,
          carbonFootprint: routeEfficiency.carbonEmissions || 0
        }
      };

      this.sendSuccess(res, dashboard, 'Logistics dashboard retrieved successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Manage fleet vehicles
   */
  public async manageFleet(req: Request, res: Response): Promise<void> {
    try {
      const { action, vehicleData } = req.body;

      let result;
      switch (action) {
        case 'add':
          result = await this.coordinationService.addVehicleToFleet(vehicleData);
          break;
        case 'update':
          result = await this.coordinationService.updateVehicle(vehicleData.id, vehicleData);
          break;
        case 'remove':
          result = await this.coordinationService.removeVehicleFromFleet(vehicleData.id);
          break;
        case 'schedule_maintenance':
          result = await this.coordinationService.scheduleVehicleMaintenance(
            vehicleData.id,
            vehicleData.maintenanceData
          );
          break;
        default:
          return this.sendError(res, new Error('Invalid action'), 400);
      }

      this.sendSuccess(res, result, `Fleet ${action} completed successfully`);
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Optimize material flow
   */
  public async optimizeMaterialFlow(req: Request, res: Response): Promise<void> {
    try {
      const { warehouseId, materials, constraints = {} } = req.body;

      const optimization = await this.materialFlowService.optimizeMaterialFlow(
        warehouseId,
        {
          materials,
          constraints: {
            throughputGoals: constraints.throughputGoals || { hourly: 100, daily: 2000 },
            resourceLimits: constraints.resourceLimits || {},
            qualityRequirements: constraints.qualityRequirements || {},
            ...constraints
          }
        }
      );

      this.sendSuccess(res, optimization, 'Material flow optimized successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Generate logistics reports
   */
  public async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const {
        type = 'performance',
        period = 'monthly',
        format = 'json',
        includeAnalytics = true
      } = req.query;

      const report = await this.coordinationService.generateLogisticsReport(
        type as string,
        {
          period: period as string,
          format: format as string,
          includeAnalytics: includeAnalytics === 'true',
          includeRecommendations: true,
          includePredictions: true
        }
      );

      // Set appropriate headers for download
      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=logistics_report_${period}.pdf`);
      } else if (format === 'excel') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=logistics_report_${period}.xlsx`);
      }

      this.sendSuccess(res, report, 'Logistics report generated successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Advanced route planning with quantum optimization
   */
  public async quantumRouteOptimization(req: Request, res: Response): Promise<void> {
    try {
      const { 
        deliveryPoints, 
        constraints = {}, 
        quantumParameters = {} 
      } = req.body;

      if (!deliveryPoints || deliveryPoints.length < 2) {
        return this.sendError(res, new Error('At least two delivery points are required'), 400);
      }

      // Use quantum-enhanced route optimization
      const quantumOptimization = await this.hyperLogisticsService.applyQuantumDeliveryOptimization(
        deliveryPoints,
        {
          ...constraints,
          quantumAnnealing: quantumParameters.annealing || true,
          parallelDimensions: quantumParameters.dimensions || 5,
          entanglementLevel: quantumParameters.entanglement || 0.8
        }
      );

      this.sendSuccess(res, quantumOptimization, 'Quantum route optimization completed successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Predictive maintenance for logistics equipment
   */
  public async predictiveMaintenanceAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { equipmentType, equipmentId } = req.params;
      const { includeRecommendations = true } = req.query;

      // Get IoT sensor data for equipment
      const sensorData = this.iotService.getSensorData(equipmentId);
      
      // Analyze with AI for predictive maintenance
      const analysis = await this.aiService.predictEquipmentMaintenance(
        equipmentType,
        equipmentId,
        sensorData
      );

      let result: any = { analysis };

      if (includeRecommendations === 'true') {
        const recommendations = await this.aiService.generateMaintenanceRecommendations(
          equipmentType,
          analysis
        );
        result.recommendations = recommendations;
      }

      this.sendSuccess(res, result, 'Predictive maintenance analysis completed successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Real-time logistics alerts and notifications
   */
  public async getLogisticsAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { 
        severity = 'all', 
        acknowledged = false,
        limit = 50 
      } = req.query;

      const alerts = await this.coordinationService.getLogisticsAlerts({
        severity: severity !== 'all' ? severity as string : undefined,
        acknowledged: acknowledged === 'true',
        limit: parseInt(limit as string)
      });

      this.sendSuccess(res, alerts, 'Logistics alerts retrieved successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  /**
   * Acknowledge logistics alert
   */
  public async acknowledgeAlert(req: Request, res: Response): Promise<void> {
    try {
      const { alertId } = req.params;
      const { notes } = req.body;

      const result = await this.coordinationService.acknowledgeAlert(alertId, {
        acknowledgedBy: req.user?.id,
        acknowledgedAt: new Date(),
        notes
      });

      this.sendSuccess(res, result, 'Alert acknowledged successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }
}

export default LogisticsController;
