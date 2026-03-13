import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../../../middleware/auth';
import { authorize } from '../../../middleware/authorize';
import { rateLimiter } from '../../../middleware/rateLimiter';
import procurementController from '../controllers/ProcurementController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Apply rate limiting
router.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
}));

// Supplier Management Routes
router.post(
  '/suppliers',
  authorize(['procurement_manager', 'buyer', 'vendor_manager']),
  [
    body('supplierName').notEmpty().withMessage('Supplier name is required'),
    body('contactInformation').isObject().withMessage('Contact information is required'),
    body('contactInformation.primaryContact').notEmpty().withMessage('Primary contact is required'),
    body('contactInformation.email').isEmail().withMessage('Valid email is required'),
    body('contactInformation.phone').notEmpty().withMessage('Phone number is required'),
    body('address').isObject().withMessage('Address is required'),
    body('address.street').notEmpty().withMessage('Street address is required'),
    body('address.city').notEmpty().withMessage('City is required'),
    body('address.country').notEmpty().withMessage('Country is required'),
    body('categories').isArray().withMessage('Categories must be an array'),
    body('taxId').optional().isString(),
    body('paymentTerms').optional().isString(),
    body('creditLimit').optional().isFloat({ min: 0 }),
    body('status').optional().isIn(['active', 'inactive', 'pending', 'suspended']),
    body('certifications').optional().isArray(),
    body('qualityRating').optional().isFloat({ min: 0, max: 5 })
  ],
  procurementController.createSupplier
);

router.get(
  '/suppliers',
  authorize(['procurement_manager', 'buyer', 'vendor_manager', 'quality_manager']),
  [
    query('status').optional().isIn(['active', 'inactive', 'pending', 'suspended']),
    query('category').optional().isString(),
    query('rating').optional().isFloat({ min: 0, max: 5 }),
    query('location').optional().isString(),
    query('certification').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  procurementController.getSuppliers
);

router.get(
  '/suppliers/:supplierId',
  authorize(['procurement_manager', 'buyer', 'vendor_manager', 'quality_manager']),
  [
    param('supplierId').isUUID().withMessage('Invalid supplier ID format')
  ],
  procurementController.getSupplierById
);

router.put(
  '/suppliers/:supplierId',
  authorize(['procurement_manager', 'vendor_manager']),
  [
    param('supplierId').isUUID().withMessage('Invalid supplier ID format'),
    body('supplierName').optional().notEmpty().withMessage('Supplier name cannot be empty'),
    body('contactInformation').optional().isObject(),
    body('contactInformation.email').optional().isEmail(),
    body('address').optional().isObject(),
    body('categories').optional().isArray(),
    body('paymentTerms').optional().isString(),
    body('creditLimit').optional().isFloat({ min: 0 }),
    body('status').optional().isIn(['active', 'inactive', 'pending', 'suspended']),
    body('certifications').optional().isArray(),
    body('qualityRating').optional().isFloat({ min: 0, max: 5 })
  ],
  procurementController.updateSupplier
);

router.delete(
  '/suppliers/:supplierId',
  authorize(['procurement_manager']),
  [
    param('supplierId').isUUID().withMessage('Invalid supplier ID format')
  ],
  procurementController.deleteSupplier
);

// Purchase Order Management Routes
router.post(
  '/purchase-orders',
  authorize(['procurement_manager', 'buyer']),
  [
    body('supplierId').isUUID().withMessage('Invalid supplier ID format'),
    body('requestedBy').isUUID().withMessage('Invalid user ID format'),
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.itemId').notEmpty().withMessage('Item ID is required'),
    body('items.*.description').notEmpty().withMessage('Item description is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be positive'),
    body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be non-negative'),
    body('items.*.totalPrice').isFloat({ min: 0 }).withMessage('Total price must be non-negative'),
    body('deliveryAddress').isObject().withMessage('Delivery address is required'),
    body('requestedDeliveryDate').isISO8601().withMessage('Valid delivery date is required'),
    body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('paymentTerms').optional().isString(),
    body('specialInstructions').optional().isString(),
    body('budgetCode').optional().isString()
  ],
  procurementController.createPurchaseOrder
);

router.get(
  '/purchase-orders',
  authorize(['procurement_manager', 'buyer', 'finance_manager', 'approver']),
  [
    query('status').optional().isIn(['draft', 'pending_approval', 'approved', 'sent', 'acknowledged', 'delivered', 'cancelled']),
    query('supplierId').optional().isUUID(),
    query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  procurementController.getPurchaseOrders
);

router.get(
  '/purchase-orders/:purchaseOrderId',
  authorize(['procurement_manager', 'buyer', 'finance_manager', 'approver']),
  [
    param('purchaseOrderId').isUUID().withMessage('Invalid purchase order ID format')
  ],
  procurementController.getPurchaseOrderById
);

router.put(
  '/purchase-orders/:purchaseOrderId',
  authorize(['procurement_manager', 'buyer']),
  [
    param('purchaseOrderId').isUUID().withMessage('Invalid purchase order ID format'),
    body('items').optional().isArray(),
    body('items.*.itemId').optional().notEmpty(),
    body('items.*.description').optional().notEmpty(),
    body('items.*.quantity').optional().isInt({ min: 1 }),
    body('items.*.unitPrice').optional().isFloat({ min: 0 }),
    body('items.*.totalPrice').optional().isFloat({ min: 0 }),
    body('deliveryAddress').optional().isObject(),
    body('requestedDeliveryDate').optional().isISO8601(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('specialInstructions').optional().isString(),
    body('status').optional().isIn(['draft', 'pending_approval', 'approved', 'sent', 'acknowledged', 'delivered', 'cancelled'])
  ],
  procurementController.updatePurchaseOrder
);

router.put(
  '/purchase-orders/:purchaseOrderId/approve',
  authorize(['procurement_manager', 'finance_manager', 'approver']),
  [
    param('purchaseOrderId').isUUID().withMessage('Invalid purchase order ID format'),
    body('approvedBy').isUUID().withMessage('Invalid user ID format'),
    body('approvalNotes').optional().isLength({ max: 1000 })
  ],
  procurementController.approvePurchaseOrder
);

router.put(
  '/purchase-orders/:purchaseOrderId/cancel',
  authorize(['procurement_manager', 'buyer']),
  [
    param('purchaseOrderId').isUUID().withMessage('Invalid purchase order ID format'),
    body('cancelledBy').isUUID().withMessage('Invalid user ID format'),
    body('cancellationReason').notEmpty().withMessage('Cancellation reason is required')
  ],
  procurementController.cancelPurchaseOrder
);

// Vendor Evaluation and Performance Routes
router.post(
  '/vendors/evaluate',
  authorize(['procurement_manager', 'vendor_manager', 'quality_manager']),
  [
    body('supplierId').isUUID().withMessage('Invalid supplier ID format'),
    body('evaluationPeriod').isObject().withMessage('Evaluation period is required'),
    body('evaluationPeriod.startDate').isISO8601().withMessage('Valid start date is required'),
    body('evaluationPeriod.endDate').isISO8601().withMessage('Valid end date is required'),
    body('criteria').isArray().withMessage('Evaluation criteria must be an array'),
    body('criteria.*.criterionName').notEmpty().withMessage('Criterion name is required'),
    body('criteria.*.weight').isFloat({ min: 0, max: 1 }).withMessage('Weight must be between 0 and 1'),
    body('criteria.*.score').isFloat({ min: 0, max: 10 }).withMessage('Score must be between 0 and 10'),
    body('evaluatedBy').isUUID().withMessage('Invalid evaluator ID format'),
    body('comments').optional().isString(),
    body('recommendations').optional().isString()
  ],
  procurementController.evaluateVendor
);

router.get(
  '/vendors/:supplierId/performance',
  authorize(['procurement_manager', 'vendor_manager', 'quality_manager']),
  [
    param('supplierId').isUUID().withMessage('Invalid supplier ID format'),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('metricType').optional().isIn(['quality', 'delivery', 'cost', 'service', 'overall'])
  ],
  procurementController.getVendorPerformance
);

router.get(
  '/vendors/rankings',
  authorize(['procurement_manager', 'vendor_manager', 'quality_manager']),
  [
    query('category').optional().isString(),
    query('criteria').optional().isIn(['quality', 'delivery', 'cost', 'service', 'overall']),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  procurementController.getSupplierRankings
);

// Smart Procurement (AI-Powered) Routes
router.post(
  '/smart/enable',
  authorize(['procurement_manager', 'ai_specialist']),
  [
    body('category').notEmpty().withMessage('Category is required'),
    body('configData').isObject().withMessage('Configuration data is required'),
    body('configData.aiModels').isArray().withMessage('AI models configuration is required'),
    body('configData.optimizationObjectives').isArray().withMessage('Optimization objectives are required'),
    body('configData.riskFactors').optional().isArray(),
    body('configData.budgetConstraints').optional().isObject(),
    body('configData.qualityRequirements').optional().isObject(),
    body('configData.enablePredictiveAnalytics').optional().isBoolean()
  ],
  procurementController.enableSmartProcurement
);

router.get(
  '/smart/recommendations',
  authorize(['procurement_manager', 'buyer', 'ai_specialist']),
  [
    query('category').optional().isString(),
    query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    query('budget').optional().isFloat({ min: 0 }),
    query('timeframe').optional().isIn(['immediate', 'short_term', 'medium_term', 'long_term']),
    query('limit').optional().isInt({ min: 1, max: 20 })
  ],
  procurementController.getProcurementRecommendations
);

router.post(
  '/smart/optimize',
  authorize(['procurement_manager', 'ai_specialist']),
  [
    body('optimizationType').isIn(['cost', 'quality', 'delivery', 'risk', 'sustainability']).withMessage('Invalid optimization type'),
    body('scope').isObject().withMessage('Optimization scope is required'),
    body('constraints').isArray().withMessage('Constraints are required'),
    body('objectives').isArray().withMessage('Objectives are required'),
    body('timeHorizon').isInt({ min: 1, max: 365 }).withMessage('Time horizon must be between 1 and 365 days'),
    body('includeRiskAnalysis').optional().isBoolean(),
    body('sustainabilityFactors').optional().isArray()
  ],
  procurementController.optimizeProcurement
);

router.post(
  '/smart/predict-demand',
  authorize(['procurement_manager', 'demand_planner', 'ai_specialist']),
  [
    body('items').isArray().withMessage('Items list is required'),
    body('items.*.itemId').notEmpty().withMessage('Item ID is required'),
    body('items.*.category').notEmpty().withMessage('Category is required'),
    body('predictionHorizon').isInt({ min: 7, max: 365 }).withMessage('Prediction horizon must be between 7 and 365 days'),
    body('includeSeasonality').optional().isBoolean(),
    body('includeExternalFactors').optional().isBoolean(),
    body('confidenceLevel').optional().isFloat({ min: 0.5, max: 0.99 })
  ],
  procurementController.predictDemand
);

// Contract Management Routes
router.post(
  '/contracts',
  authorize(['procurement_manager', 'contract_manager', 'legal_manager']),
  [
    body('contractName').notEmpty().withMessage('Contract name is required'),
    body('supplierId').isUUID().withMessage('Invalid supplier ID format'),
    body('contractType').isIn(['framework', 'blanket', 'fixed_term', 'renewable']).withMessage('Invalid contract type'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('value').isFloat({ min: 0 }).withMessage('Contract value must be non-negative'),
    body('currency').notEmpty().withMessage('Currency is required'),
    body('terms').isObject().withMessage('Contract terms are required'),
    body('terms.paymentTerms').notEmpty().withMessage('Payment terms are required'),
    body('terms.deliveryTerms').notEmpty().withMessage('Delivery terms are required'),
    body('terms.qualityStandards').optional().isArray(),
    body('renewalOptions').optional().isObject(),
    body('penalties').optional().isArray(),
    body('performanceMetrics').optional().isArray()
  ],
  procurementController.createContract
);

router.get(
  '/contracts',
  authorize(['procurement_manager', 'contract_manager', 'legal_manager', 'finance_manager']),
  [
    query('status').optional().isIn(['draft', 'active', 'expired', 'terminated', 'renewed']),
    query('supplierId').optional().isUUID(),
    query('contractType').optional().isIn(['framework', 'blanket', 'fixed_term', 'renewable']),
    query('expiryDate').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  procurementController.getContracts
);

router.get(
  '/contracts/:contractId',
  authorize(['procurement_manager', 'contract_manager', 'legal_manager', 'finance_manager']),
  [
    param('contractId').isUUID().withMessage('Invalid contract ID format')
  ],
  procurementController.getContractById
);

router.put(
  '/contracts/:contractId/renew',
  authorize(['procurement_manager', 'contract_manager']),
  [
    param('contractId').isUUID().withMessage('Invalid contract ID format'),
    body('newEndDate').isISO8601().withMessage('Valid new end date is required'),
    body('renewedBy').isUUID().withMessage('Invalid user ID format'),
    body('renewalTerms').optional().isObject(),
    body('priceAdjustment').optional().isFloat(),
    body('modifiedTerms').optional().isArray(),
    body('renewalNotes').optional().isString()
  ],
  procurementController.renewContract
);

router.get(
  '/contracts/expiring',
  authorize(['procurement_manager', 'contract_manager']),
  [
    query('daysAhead').optional().isInt({ min: 1, max: 365 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  procurementController.getExpiringContracts
);

// Procurement Analytics and Reports Routes
router.get(
  '/dashboard',
  authorize(['procurement_manager', 'finance_manager', 'ceo']),
  [
    query('timeframe').optional().isIn(['7d', '30d', '90d', '180d', '365d'])
  ],
  procurementController.getProcurementDashboard
);

router.get(
  '/metrics',
  authorize(['procurement_manager', 'finance_manager', 'analytics_manager']),
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('category').optional().isString(),
    query('supplierId').optional().isUUID(),
    query('metricType').optional().isIn(['spend', 'savings', 'cycle_time', 'supplier_performance', 'compliance'])
  ],
  procurementController.getProcurementMetrics
);

router.post(
  '/reports/generate',
  authorize(['procurement_manager', 'finance_manager', 'analytics_manager']),
  [
    body('reportType').isIn(['spend_analysis', 'supplier_performance', 'contract_summary', 'savings_report', 'compliance_report', 'custom']).withMessage('Invalid report type'),
    body('dateRange').isObject().withMessage('Date range is required'),
    body('dateRange.startDate').isISO8601().withMessage('Valid start date is required'),
    body('dateRange.endDate').isISO8601().withMessage('Valid end date is required'),
    body('filters').optional().isObject(),
    body('format').optional().isIn(['pdf', 'excel', 'csv', 'json']),
    body('includeCharts').optional().isBoolean(),
    body('recipients').optional().isArray(),
    body('scheduledDelivery').optional().isObject()
  ],
  procurementController.generateProcurementReport
);

// RFQ (Request for Quotation) Management Routes
router.post(
  '/rfqs',
  authorize(['procurement_manager', 'buyer']),
  [
    body('rfqTitle').notEmpty().withMessage('RFQ title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.itemDescription').notEmpty().withMessage('Item description is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be positive'),
    body('items.*.specifications').optional().isString(),
    body('items.*.deliveryRequirements').optional().isString(),
    body('invitedSuppliers').isArray().withMessage('Invited suppliers must be an array'),
    body('responseDeadline').isISO8601().withMessage('Valid response deadline is required'),
    body('evaluationCriteria').isArray().withMessage('Evaluation criteria are required'),
    body('terms').optional().isObject(),
    body('attachments').optional().isArray()
  ],
  procurementController.createRFQ
);

router.get(
  '/rfqs',
  authorize(['procurement_manager', 'buyer', 'vendor_manager']),
  [
    query('status').optional().isIn(['draft', 'published', 'closed', 'evaluated', 'awarded']),
    query('category').optional().isString(),
    query('closingDate').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  procurementController.getRFQs
);

router.post(
  '/rfqs/:rfqId/evaluate',
  authorize(['procurement_manager', 'buyer', 'evaluation_committee']),
  [
    param('rfqId').isUUID().withMessage('Invalid RFQ ID format'),
    body('evaluationMethod').isIn(['weighted_scoring', 'cost_benefit', 'technical_commercial']).withMessage('Invalid evaluation method'),
    body('evaluators').isArray().withMessage('Evaluators list is required'),
    body('evaluators.*.evaluatorId').isUUID().withMessage('Invalid evaluator ID format'),
    body('evaluators.*.role').notEmpty().withMessage('Evaluator role is required'),
    body('scoringMatrix').isArray().withMessage('Scoring matrix is required'),
    body('qualificationCriteria').optional().isArray(),
    body('evaluationNotes').optional().isString()
  ],
  procurementController.evaluateRFQResponses
);

/**
 * Health check endpoint for Procurement module
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Procurement module is healthy',
    timestamp: new Date(),
    requestId: req.requestId,
    features: {
      supplierManagement: 'active',
      purchaseOrderManagement: 'active',
      vendorEvaluation: 'active',
      rfqManagement: 'active',
      contractManagement: 'active',
      smartProcurement: 'active',
      procurementAnalytics: 'active'
    },
    endpoints: {
      suppliers: 5,
      purchaseOrders: 6,
      vendorEvaluation: 3,
      rfqManagement: 4,
      contracts: 4,
      smartProcurement: 3,
      analytics: 3,
      total: 28
    }
  });
});

export default router;
