import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { logger } from '../../../utils/logger';
import { 
  ProcurementService,
  SupplierManagementService,
  PurchaseOrderService,
  VendorEvaluationService,
  SmartProcurementService,
  ContractManagementService
} from '../services';

export class ProcurementController {
  private procurementService: ProcurementService;
  private supplierManagementService: SupplierManagementService;
  private purchaseOrderService: PurchaseOrderService;
  private vendorEvaluationService: VendorEvaluationService;
  private smartProcurementService: SmartProcurementService;
  private contractManagementService: ContractManagementService;

  constructor() {
    this.procurementService = new ProcurementService();
    this.supplierManagementService = new SupplierManagementService();
    this.purchaseOrderService = new PurchaseOrderService();
    this.vendorEvaluationService = new VendorEvaluationService();
    this.smartProcurementService = new SmartProcurementService();
    this.contractManagementService = new ContractManagementService();
  }

  // Supplier Management
  public createSupplier = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const supplierData = req.body;
      const result = await this.supplierManagementService.createSupplier(supplierData);
      
      logger.info('Supplier created successfully', { supplierId: result.supplierId });
      res.status(201).json({
        success: true,
        data: result,
        message: 'Supplier created successfully'
      });
    } catch (error) {
      logger.error('Error creating supplier', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to create supplier',
        error: error.message
      });
    }
  };

  public getSuppliers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, category, rating, location, certification, limit, offset } = req.query;
      const filters = {
        status: status as string,
        category: category as string,
        rating: rating ? parseFloat(rating as string) : undefined,
        location: location as string,
        certification: certification as string,
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0
      };

      const result = await this.supplierManagementService.getSuppliers(filters);
      
      res.status(200).json({
        success: true,
        data: result.suppliers,
        pagination: result.pagination,
        message: 'Suppliers retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching suppliers', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch suppliers',
        error: error.message
      });
    }
  };

  public getSupplierById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { supplierId } = req.params;
      const result = await this.supplierManagementService.getSupplierById(supplierId);
      
      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
        message: 'Supplier retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching supplier', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch supplier',
        error: error.message
      });
    }
  };

  public updateSupplier = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { supplierId } = req.params;
      const updateData = req.body;
      const result = await this.supplierManagementService.updateSupplier(supplierId, updateData);
      
      logger.info('Supplier updated successfully', { supplierId });
      res.status(200).json({
        success: true,
        data: result,
        message: 'Supplier updated successfully'
      });
    } catch (error) {
      logger.error('Error updating supplier', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to update supplier',
        error: error.message
      });
    }
  };

  public deleteSupplier = async (req: Request, res: Response): Promise<void> => {
    try {
      const { supplierId } = req.params;
      await this.supplierManagementService.deleteSupplier(supplierId);
      
      logger.info('Supplier deleted successfully', { supplierId });
      res.status(200).json({
        success: true,
        message: 'Supplier deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting supplier', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to delete supplier',
        error: error.message
      });
    }
  };

  // Purchase Order Management
  public createPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const purchaseOrderData = req.body;
      const result = await this.purchaseOrderService.createPurchaseOrder(purchaseOrderData);
      
      logger.info('Purchase order created successfully', { purchaseOrderId: result.purchaseOrderId });
      res.status(201).json({
        success: true,
        data: result,
        message: 'Purchase order created successfully'
      });
    } catch (error) {
      logger.error('Error creating purchase order', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to create purchase order',
        error: error.message
      });
    }
  };

  public getPurchaseOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, supplierId, priority, startDate, endDate, limit, offset } = req.query;
      const filters = {
        status: status as string,
        supplierId: supplierId as string,
        priority: priority as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0
      };

      const result = await this.purchaseOrderService.getPurchaseOrders(filters);
      
      res.status(200).json({
        success: true,
        data: result.purchaseOrders,
        pagination: result.pagination,
        message: 'Purchase orders retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching purchase orders', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch purchase orders',
        error: error.message
      });
    }
  };

  public getPurchaseOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { purchaseOrderId } = req.params;
      const result = await this.purchaseOrderService.getPurchaseOrderById(purchaseOrderId);
      
      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Purchase order not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
        message: 'Purchase order retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching purchase order', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch purchase order',
        error: error.message
      });
    }
  };

  public updatePurchaseOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { purchaseOrderId } = req.params;
      const updateData = req.body;
      const result = await this.purchaseOrderService.updatePurchaseOrder(purchaseOrderId, updateData);
      
      logger.info('Purchase order updated successfully', { purchaseOrderId });
      res.status(200).json({
        success: true,
        data: result,
        message: 'Purchase order updated successfully'
      });
    } catch (error) {
      logger.error('Error updating purchase order', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to update purchase order',
        error: error.message
      });
    }
  };

  public approvePurchaseOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { purchaseOrderId } = req.params;
      const { approvedBy, approvalNotes } = req.body;
      const result = await this.purchaseOrderService.approvePurchaseOrder(purchaseOrderId, approvedBy, approvalNotes);
      
      logger.info('Purchase order approved successfully', { purchaseOrderId, approvedBy });
      res.status(200).json({
        success: true,
        data: result,
        message: 'Purchase order approved successfully'
      });
    } catch (error) {
      logger.error('Error approving purchase order', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to approve purchase order',
        error: error.message
      });
    }
  };

  public cancelPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { purchaseOrderId } = req.params;
      const { cancelledBy, cancellationReason } = req.body;
      const result = await this.purchaseOrderService.cancelPurchaseOrder(purchaseOrderId, cancelledBy, cancellationReason);
      
      logger.info('Purchase order cancelled successfully', { purchaseOrderId, cancelledBy });
      res.status(200).json({
        success: true,
        data: result,
        message: 'Purchase order cancelled successfully'
      });
    } catch (error) {
      logger.error('Error cancelling purchase order', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to cancel purchase order',
        error: error.message
      });
    }
  };

  // Vendor Evaluation and Performance
  public evaluateVendor = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const evaluationData = req.body;
      const result = await this.vendorEvaluationService.evaluateVendor(evaluationData);
      
      logger.info('Vendor evaluation completed successfully', { supplierId: evaluationData.supplierId });
      res.status(201).json({
        success: true,
        data: result,
        message: 'Vendor evaluation completed successfully'
      });
    } catch (error) {
      logger.error('Error evaluating vendor', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to evaluate vendor',
        error: error.message
      });
    }
  };

  public getVendorPerformance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { supplierId } = req.params;
      const { startDate, endDate, metricType } = req.query;
      
      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        metricType: metricType as string
      };

      const result = await this.vendorEvaluationService.getVendorPerformance(supplierId, filters);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Vendor performance retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching vendor performance', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vendor performance',
        error: error.message
      });
    }
  };

  public getSupplierRankings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category, criteria, limit } = req.query;
      const filters = {
        category: category as string,
        criteria: criteria as string,
        limit: limit ? parseInt(limit as string) : 20
      };

      const result = await this.vendorEvaluationService.getSupplierRankings(filters);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Supplier rankings retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching supplier rankings', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch supplier rankings',
        error: error.message
      });
    }
  };

  // Smart Procurement (AI-Powered)
  public enableSmartProcurement = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { category, configData } = req.body;
      const result = await this.smartProcurementService.enableSmartProcurement(category, configData);
      
      logger.info('Smart procurement enabled successfully', { category });
      res.status(200).json({
        success: true,
        data: result,
        message: 'Smart procurement enabled successfully'
      });
    } catch (error) {
      logger.error('Error enabling smart procurement', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to enable smart procurement',
        error: error.message
      });
    }
  };

  public getProcurementRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category, priority, budget, timeframe, limit } = req.query;
      const filters = {
        category: category as string,
        priority: priority as string,
        budget: budget ? parseFloat(budget as string) : undefined,
        timeframe: timeframe as string,
        limit: limit ? parseInt(limit as string) : 10
      };

      const result = await this.smartProcurementService.getProcurementRecommendations(filters);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Procurement recommendations retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching procurement recommendations', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch procurement recommendations',
        error: error.message
      });
    }
  };

  public optimizeProcurement = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const optimizationData = req.body;
      const result = await this.smartProcurementService.optimizeProcurement(optimizationData);
      
      logger.info('Procurement optimization completed successfully');
      res.status(200).json({
        success: true,
        data: result,
        message: 'Procurement optimization completed successfully'
      });
    } catch (error) {
      logger.error('Error optimizing procurement', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to optimize procurement',
        error: error.message
      });
    }
  };

  public predictDemand = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const predictionData = req.body;
      const result = await this.smartProcurementService.predictDemand(predictionData);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Demand prediction completed successfully'
      });
    } catch (error) {
      logger.error('Error predicting demand', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to predict demand',
        error: error.message
      });
    }
  };

  // Contract Management
  public createContract = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const contractData = req.body;
      const result = await this.contractManagementService.createContract(contractData);
      
      logger.info('Contract created successfully', { contractId: result.contractId });
      res.status(201).json({
        success: true,
        data: result,
        message: 'Contract created successfully'
      });
    } catch (error) {
      logger.error('Error creating contract', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to create contract',
        error: error.message
      });
    }
  };

  public getContracts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, supplierId, contractType, expiryDate, limit, offset } = req.query;
      const filters = {
        status: status as string,
        supplierId: supplierId as string,
        contractType: contractType as string,
        expiryDate: expiryDate ? new Date(expiryDate as string) : undefined,
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0
      };

      const result = await this.contractManagementService.getContracts(filters);
      
      res.status(200).json({
        success: true,
        data: result.contracts,
        pagination: result.pagination,
        message: 'Contracts retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching contracts', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch contracts',
        error: error.message
      });
    }
  };

  public getContractById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { contractId } = req.params;
      const result = await this.contractManagementService.getContractById(contractId);
      
      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Contract not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
        message: 'Contract retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching contract', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch contract',
        error: error.message
      });
    }
  };

  public renewContract = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { contractId } = req.params;
      const renewalData = req.body;
      const result = await this.contractManagementService.renewContract(contractId, renewalData);
      
      logger.info('Contract renewed successfully', { contractId });
      res.status(200).json({
        success: true,
        data: result,
        message: 'Contract renewed successfully'
      });
    } catch (error) {
      logger.error('Error renewing contract', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to renew contract',
        error: error.message
      });
    }
  };

  public getExpiringContracts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { daysAhead, limit } = req.query;
      const filters = {
        daysAhead: daysAhead ? parseInt(daysAhead as string) : 30,
        limit: limit ? parseInt(limit as string) : 50
      };

      const result = await this.contractManagementService.getExpiringContracts(filters);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Expiring contracts retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching expiring contracts', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch expiring contracts',
        error: error.message
      });
    }
  };

  // Procurement Analytics and Reports
  public getProcurementDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const { timeframe } = req.query;
      const result = await this.procurementService.getProcurementDashboard(timeframe as string || '30d');
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Procurement dashboard data retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching procurement dashboard', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch procurement dashboard',
        error: error.message
      });
    }
  };

  public getProcurementMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, category, supplierId, metricType } = req.query;
      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        category: category as string,
        supplierId: supplierId as string,
        metricType: metricType as string
      };

      const result = await this.procurementService.getProcurementMetrics(filters);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Procurement metrics retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching procurement metrics', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch procurement metrics',
        error: error.message
      });
    }
  };

  public generateProcurementReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const reportData = req.body;
      const result = await this.procurementService.generateProcurementReport(reportData);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Procurement report generated successfully'
      });
    } catch (error) {
      logger.error('Error generating procurement report', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to generate procurement report',
        error: error.message
      });
    }
  };

  // RFQ (Request for Quotation) Management
  public createRFQ = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const rfqData = req.body;
      const result = await this.procurementService.createRFQ(rfqData);
      
      logger.info('RFQ created successfully', { rfqId: result.rfqId });
      res.status(201).json({
        success: true,
        data: result,
        message: 'RFQ created successfully'
      });
    } catch (error) {
      logger.error('Error creating RFQ', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to create RFQ',
        error: error.message
      });
    }
  };

  public getRFQs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, category, closingDate, limit, offset } = req.query;
      const filters = {
        status: status as string,
        category: category as string,
        closingDate: closingDate ? new Date(closingDate as string) : undefined,
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0
      };

      const result = await this.procurementService.getRFQs(filters);
      
      res.status(200).json({
        success: true,
        data: result.rfqs,
        pagination: result.pagination,
        message: 'RFQs retrieved successfully'
      });
    } catch (error) {
      logger.error('Error fetching RFQs', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch RFQs',
        error: error.message
      });
    }
  };

  public evaluateRFQResponses = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { rfqId } = req.params;
      const evaluationData = req.body;
      const result = await this.procurementService.evaluateRFQResponses(rfqId, evaluationData);
      
      logger.info('RFQ responses evaluated successfully', { rfqId });
      res.status(200).json({
        success: true,
        data: result,
        message: 'RFQ responses evaluated successfully'
      });
    } catch (error) {
      logger.error('Error evaluating RFQ responses', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to evaluate RFQ responses',
        error: error.message
      });
    }
  };
}

export default new ProcurementController();
