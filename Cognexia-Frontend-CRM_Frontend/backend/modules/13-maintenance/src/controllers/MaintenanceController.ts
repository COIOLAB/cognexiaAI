import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { logger } from '../../../utils/logger';
import { 
  MaintenanceService,
  PredictiveMaintenanceService,
  AssetManagementService,
  WorkOrderService,
  SmartMaintenanceService
} from '../services';

export class MaintenanceController {
  private maintenanceService: MaintenanceService;
  private predictiveMaintenanceService: PredictiveMaintenanceService;
  private assetManagementService: AssetManagementService;
  private workOrderService: WorkOrderService;
  private smartMaintenanceService: SmartMaintenanceService;

  constructor() {
    this.maintenanceService = new MaintenanceService();
    this.predictiveMaintenanceService = new PredictiveMaintenanceService();
    this.assetManagementService = new AssetManagementService();
    this.workOrderService = new WorkOrderService();
    this.smartMaintenanceService = new SmartMaintenanceService();
  }

  // Asset Management
  public createAsset = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const assetData = req.body;
      const result = await this.assetManagementService.createAsset(assetData);
      
      logger.info('Asset created successfully', { assetId: result.assetId });
      res.status(201).json({
        success: true,
        data: result,
        message: 'Asset created successfully'
      });
    } catch (error) {
      logger.error('Error creating asset', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to create asset',
        error: error.message
      });
    }
  };

  public getAssets = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, type, location, criticality, limit, offset } = req.query;
      const filters = {
        status: status as string,
        type: type as string,
        location: location as string,
        criticality: criticality as string,
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0
      };

      const result = await this.assetManagementService.getAssets(filters);
      
      res.status(200).json({
        success: true,
        data: result.assets,
        pagination: result.pagination,
        message: 'Assets retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching assets', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch assets',
        error: error.message
      });
    }
  };

  public getAssetById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { assetId } = req.params;
      const result = await this.assetManagementService.getAssetById(assetId);
      
      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Asset not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
        message: 'Asset retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching asset', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch asset',
        error: error.message
      });
    }
  };

  public updateAsset = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { assetId } = req.params;
      const updateData = req.body;
      const result = await this.assetManagementService.updateAsset(assetId, updateData);
      
      logger.info('Asset updated successfully', { assetId });
      res.status(200).json({
        success: true,
        data: result,
        message: 'Asset updated successfully'
      });
    } catch (error) {
      logger.error('Error updating asset', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to update asset',
        error: error.message
      });
    }
  };

  public deleteAsset = async (req: Request, res: Response): Promise<void> => {
    try {
      const { assetId } = req.params;
      await this.assetManagementService.deleteAsset(assetId);
      
      logger.info('Asset deleted successfully', { assetId });
      res.status(200).json({
        success: true,
        message: 'Asset deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting asset', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to delete asset',
        error: error.message
      });
    }
  };

  // Work Order Management
  public createWorkOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const workOrderData = req.body;
      const result = await this.workOrderService.createWorkOrder(workOrderData);
      
      logger.info('Work order created successfully', { workOrderId: result.workOrderId });
      res.status(201).json({
        success: true,
        data: result,
        message: 'Work order created successfully'
      });
    } catch (error) {
      logger.error('Error creating work order', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to create work order',
        error: error.message
      });
    }
  };

  public getWorkOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, priority, type, assignedTo, assetId, limit, offset } = req.query;
      const filters = {
        status: status as string,
        priority: priority as string,
        type: type as string,
        assignedTo: assignedTo as string,
        assetId: assetId as string,
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0
      };

      const result = await this.workOrderService.getWorkOrders(filters);
      
      res.status(200).json({
        success: true,
        data: result.workOrders,
        pagination: result.pagination,
        message: 'Work orders retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching work orders', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch work orders',
        error: error.message
      });
    }
  };

  public getWorkOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workOrderId } = req.params;
      const result = await this.workOrderService.getWorkOrderById(workOrderId);
      
      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Work order not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
        message: 'Work order retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching work order', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch work order',
        error: error.message
      });
    }
  };

  public updateWorkOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { workOrderId } = req.params;
      const updateData = req.body;
      const result = await this.workOrderService.updateWorkOrder(workOrderId, updateData);
      
      logger.info('Work order updated successfully', { workOrderId });
      res.status(200).json({
        success: true,
        data: result,
        message: 'Work order updated successfully'
      });
    } catch (error) {
      logger.error('Error updating work order', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to update work order',
        error: error.message
      });
    }
  };

  public assignWorkOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { workOrderId } = req.params;
      const { technicianId, assignedBy, notes } = req.body;
      const result = await this.workOrderService.assignWorkOrder(workOrderId, technicianId, assignedBy, notes);
      
      logger.info('Work order assigned successfully', { workOrderId, technicianId });
      res.status(200).json({
        success: true,
        data: result,
        message: 'Work order assigned successfully'
      });
    } catch (error) {
      logger.error('Error assigning work order', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to assign work order',
        error: error.message
      });
    }
  };

  public completeWorkOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { workOrderId } = req.params;
      const { completionData } = req.body;
      const result = await this.workOrderService.completeWorkOrder(workOrderId, completionData);
      
      logger.info('Work order completed successfully', { workOrderId });
      res.status(200).json({
        success: true,
        data: result,
        message: 'Work order completed successfully'
      });
    } catch (error) {
      logger.error('Error completing work order', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to complete work order',
        error: error.message
      });
    }
  };

  // Predictive Maintenance
  public generatePredictiveAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { assetId, analysisType, timeHorizon } = req.body;
      const result = await this.predictiveMaintenanceService.generatePredictiveAnalysis(assetId, analysisType, timeHorizon);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Predictive analysis generated successfully'
      });
    } catch (error) {
      logger.error('Error generating predictive analysis', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to generate predictive analysis',
        error: error.message
      });
    }
  };

  public getPredictiveRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { assetId, priority, limit } = req.query;
      const filters = {
        assetId: assetId as string,
        priority: priority as string,
        limit: limit ? parseInt(limit as string) : 20
      };

      const result = await this.predictiveMaintenanceService.getPredictiveRecommendations(filters);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Predictive recommendations retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching predictive recommendations', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch predictive recommendations',
        error: error.message
      });
    }
  };

  public getFailurePredictions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { assetIds, riskThreshold, timeframe } = req.query;
      const filters = {
        assetIds: assetIds ? (assetIds as string).split(',') : undefined,
        riskThreshold: riskThreshold ? parseFloat(riskThreshold as string) : 0.7,
        timeframe: timeframe as string || '30d'
      };

      const result = await this.predictiveMaintenanceService.getFailurePredictions(filters);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Failure predictions retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching failure predictions', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch failure predictions',
        error: error.message
      });
    }
  };

  // Smart Maintenance (AI/IoT Integration)
  public enableSmartMaintenance = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { assetId, configData } = req.body;
      const result = await this.smartMaintenanceService.enableSmartMaintenance(assetId, configData);
      
      logger.info('Smart maintenance enabled successfully', { assetId });
      res.status(200).json({
        success: true,
        data: result,
        message: 'Smart maintenance enabled successfully'
      });
    } catch (error) {
      logger.error('Error enabling smart maintenance', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to enable smart maintenance',
        error: error.message
      });
    }
  };

  public getSmartMaintenanceStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { assetId } = req.params;
      const result = await this.smartMaintenanceService.getSmartMaintenanceStatus(assetId);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Smart maintenance status retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching smart maintenance status', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch smart maintenance status',
        error: error.message
      });
    }
  };

  public getIoTSensorData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { assetId, sensorType, startDate, endDate, aggregation } = req.query;
      const filters = {
        assetId: assetId as string,
        sensorType: sensorType as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        aggregation: aggregation as string || 'hour'
      };

      const result = await this.smartMaintenanceService.getIoTSensorData(filters);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'IoT sensor data retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching IoT sensor data', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch IoT sensor data',
        error: error.message
      });
    }
  };

  // Maintenance Scheduling
  public createMaintenanceSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const scheduleData = req.body;
      const result = await this.maintenanceService.createMaintenanceSchedule(scheduleData);
      
      logger.info('Maintenance schedule created successfully', { scheduleId: result.scheduleId });
      res.status(201).json({
        success: true,
        data: result,
        message: 'Maintenance schedule created successfully'
      });
    } catch (error) {
      logger.error('Error creating maintenance schedule', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to create maintenance schedule',
        error: error.message
      });
    }
  };

  public getMaintenanceSchedules = async (req: Request, res: Response): Promise<void> => {
    try {
      const { assetId, scheduleType, status, startDate, endDate, limit, offset } = req.query;
      const filters = {
        assetId: assetId as string,
        scheduleType: scheduleType as string,
        status: status as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0
      };

      const result = await this.maintenanceService.getMaintenanceSchedules(filters);
      
      res.status(200).json({
        success: true,
        data: result.schedules,
        pagination: result.pagination,
        message: 'Maintenance schedules retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching maintenance schedules', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch maintenance schedules',
        error: error.message
      });
    }
  };

  public optimizeMaintenanceSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const optimizationData = req.body;
      const result = await this.maintenanceService.optimizeMaintenanceSchedule(optimizationData);
      
      logger.info('Maintenance schedule optimized successfully');
      res.status(200).json({
        success: true,
        data: result,
        message: 'Maintenance schedule optimized successfully'
      });
    } catch (error) {
      logger.error('Error optimizing maintenance schedule', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to optimize maintenance schedule',
        error: error.message
      });
    }
  };

  // Maintenance Analytics and Reports
  public getMaintenanceDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const { timeframe } = req.query;
      const result = await this.maintenanceService.getMaintenanceDashboard(timeframe as string || '30d');
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Maintenance dashboard data retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching maintenance dashboard', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch maintenance dashboard',
        error: error.message
      });
    }
  };

  public getMaintenanceMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, assetId, metricType } = req.query;
      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        assetId: assetId as string,
        metricType: metricType as string
      };

      const result = await this.maintenanceService.getMaintenanceMetrics(filters);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Maintenance metrics retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching maintenance metrics', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch maintenance metrics',
        error: error.message
      });
    }
  };

  public generateMaintenanceReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const reportData = req.body;
      const result = await this.maintenanceService.generateMaintenanceReport(reportData);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Maintenance report generated successfully'
      });
    } catch (error) {
      logger.error('Error generating maintenance report', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to generate maintenance report',
        error: error.message
      });
    }
  };

  // Spare Parts and Inventory
  public getSparePartsInventory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { partNumber, category, location, status, limit, offset } = req.query;
      const filters = {
        partNumber: partNumber as string,
        category: category as string,
        location: location as string,
        status: status as string,
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0
      };

      const result = await this.maintenanceService.getSparePartsInventory(filters);
      
      res.status(200).json({
        success: true,
        data: result.parts,
        pagination: result.pagination,
        message: 'Spare parts inventory retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching spare parts inventory', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch spare parts inventory',
        error: error.message
      });
    }
  };

  public requestSpareParts = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const requestData = req.body;
      const result = await this.maintenanceService.requestSpareParts(requestData);
      
      logger.info('Spare parts requested successfully', { requestId: result.requestId });
      res.status(201).json({
        success: true,
        data: result,
        message: 'Spare parts requested successfully'
      });
    } catch (error) {
      logger.error('Error requesting spare parts', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to request spare parts',
        error: error.message
      });
    }
  };

  // Technician Management
  public getTechnicians = async (req: Request, res: Response): Promise<void> => {
    try {
      const { skillSet, availability, location, limit, offset } = req.query;
      const filters = {
        skillSet: skillSet as string,
        availability: availability as string,
        location: location as string,
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0
      };

      const result = await this.maintenanceService.getTechnicians(filters);
      
      res.status(200).json({
        success: true,
        data: result.technicians,
        pagination: result.pagination,
        message: 'Technicians retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching technicians', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch technicians',
        error: error.message
      });
    }
  };

  public getTechnicianWorkload = async (req: Request, res: Response): Promise<void> => {
    try {
      const { technicianId } = req.params;
      const { timeframe } = req.query;
      
      const result = await this.maintenanceService.getTechnicianWorkload(technicianId, timeframe as string || '7d');
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Technician workload retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching technician workload', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch technician workload',
        error: error.message
      });
    }
  };
}

export default new MaintenanceController();
