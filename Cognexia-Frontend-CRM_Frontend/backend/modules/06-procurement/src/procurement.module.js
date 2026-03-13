"use strict";
// Industry 5.0 ERP Backend - Procurement Module
// Advanced AI-powered procurement with supplier intelligence and blockchain integration
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcurementModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
// Controllers
const procurement_controller_1 = require("./controllers/procurement.controller");
const supplier_controller_1 = require("./controllers/supplier.controller");
const purchase_order_controller_1 = require("./controllers/purchase-order.controller");
const rfq_controller_1 = require("./controllers/rfq.controller");
const contract_controller_1 = require("./controllers/contract.controller");
const vendor_evaluation_controller_1 = require("./controllers/vendor-evaluation.controller");
// Services
const procurement_service_1 = require("./services/procurement.service");
const supplier_service_1 = require("./services/supplier.service");
const purchase_order_service_1 = require("./services/purchase-order.service");
const rfq_service_1 = require("./services/rfq.service");
const contract_service_1 = require("./services/contract.service");
const vendor_evaluation_service_1 = require("./services/vendor-evaluation.service");
const procurement_analytics_service_1 = require("./services/procurement-analytics.service");
const supplier_risk_management_service_1 = require("./services/supplier-risk-management.service");
const procurement_optimization_service_1 = require("./services/procurement-optimization.service");
const smart_sourcing_service_1 = require("./services/smart-sourcing.service");
const ai_procurement_service_1 = require("./services/ai-procurement.service");
const blockchain_procurement_service_1 = require("./services/blockchain-procurement.service");
const sustainable_procurement_service_1 = require("./services/sustainable-procurement.service");
// Entities
const Supplier_1 = require("./entities/Supplier");
const PurchaseOrder_1 = require("./entities/PurchaseOrder");
const PurchaseOrderLine_1 = require("./entities/PurchaseOrderLine");
const RFQ_1 = require("./entities/RFQ");
const RFQResponse_1 = require("./entities/RFQResponse");
const Contract_1 = require("./entities/Contract");
const SupplierEvaluation_1 = require("./entities/SupplierEvaluation");
const ProcurementAnalytics_1 = require("./entities/ProcurementAnalytics");
const SupplierPerformance_1 = require("./entities/SupplierPerformance");
const ProcurementCategory_1 = require("./entities/ProcurementCategory");
const SupplierCertification_1 = require("./entities/SupplierCertification");
const ProcurementRisk_1 = require("./entities/ProcurementRisk");
const SupplierContract_1 = require("./entities/SupplierContract");
const ProcurementAlert_1 = require("./entities/ProcurementAlert");
const SpendAnalysis_1 = require("./entities/SpendAnalysis");
const SupplierOnboarding_1 = require("./entities/SupplierOnboarding");
// Guards and Middleware
const procurement_guard_1 = require("./guards/procurement.guard");
const supplier_access_guard_1 = require("./guards/supplier-access.guard");
const contract_approval_guard_1 = require("./guards/contract-approval.guard");
const purchase_order_approval_guard_1 = require("./guards/purchase-order-approval.guard");
// Utilities and Providers
const procurement_utilities_1 = require("./utilities/procurement.utilities");
const supplier_scoring_service_1 = require("./utilities/supplier-scoring.service");
const procurement_validation_service_1 = require("./utilities/procurement-validation.service");
const procurement_reporting_service_1 = require("./utilities/procurement-reporting.service");
const cost_analysis_service_1 = require("./utilities/cost-analysis.service");
let ProcurementModule = class ProcurementModule {
};
exports.ProcurementModule = ProcurementModule;
exports.ProcurementModule = ProcurementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                Supplier_1.Supplier,
                PurchaseOrder_1.PurchaseOrder,
                PurchaseOrderLine_1.PurchaseOrderLine,
                RFQ_1.RFQ,
                RFQResponse_1.RFQResponse,
                Contract_1.Contract,
                SupplierEvaluation_1.SupplierEvaluation,
                ProcurementAnalytics_1.ProcurementAnalytics,
                SupplierPerformance_1.SupplierPerformance,
                ProcurementCategory_1.ProcurementCategory,
                SupplierCertification_1.SupplierCertification,
                ProcurementRisk_1.ProcurementRisk,
                SupplierContract_1.SupplierContract,
                ProcurementAlert_1.ProcurementAlert,
                SpendAnalysis_1.SpendAnalysis,
                SupplierOnboarding_1.SupplierOnboarding,
            ]),
        ],
        controllers: [
            procurement_controller_1.ProcurementController,
            supplier_controller_1.SupplierController,
            purchase_order_controller_1.PurchaseOrderController,
            rfq_controller_1.RFQController,
            contract_controller_1.ContractController,
            vendor_evaluation_controller_1.VendorEvaluationController,
        ],
        providers: [
            // Core Services
            procurement_service_1.ProcurementService,
            supplier_service_1.SupplierService,
            purchase_order_service_1.PurchaseOrderService,
            rfq_service_1.RFQService,
            contract_service_1.ContractService,
            vendor_evaluation_service_1.VendorEvaluationService,
            // Analytics and Management
            procurement_analytics_service_1.ProcurementAnalyticsService,
            supplier_risk_management_service_1.SupplierRiskManagementService,
            procurement_optimization_service_1.ProcurementOptimizationService,
            smart_sourcing_service_1.SmartSourcingService,
            // Advanced Industry 5.0 Services
            ai_procurement_service_1.AIProcurementService,
            blockchain_procurement_service_1.BlockchainProcurementService,
            sustainable_procurement_service_1.SustainableProcurementService,
            // Guards
            procurement_guard_1.ProcurementGuard,
            supplier_access_guard_1.SupplierAccessGuard,
            contract_approval_guard_1.ContractApprovalGuard,
            purchase_order_approval_guard_1.PurchaseOrderApprovalGuard,
            // Utilities
            procurement_utilities_1.ProcurementUtilities,
            supplier_scoring_service_1.SupplierScoringService,
            procurement_validation_service_1.ProcurementValidationService,
            procurement_reporting_service_1.ProcurementReportingService,
            cost_analysis_service_1.CostAnalysisService,
        ],
        exports: [
            procurement_service_1.ProcurementService,
            supplier_service_1.SupplierService,
            purchase_order_service_1.PurchaseOrderService,
            rfq_service_1.RFQService,
            contract_service_1.ContractService,
            vendor_evaluation_service_1.VendorEvaluationService,
            procurement_analytics_service_1.ProcurementAnalyticsService,
            supplier_risk_management_service_1.SupplierRiskManagementService,
            procurement_optimization_service_1.ProcurementOptimizationService,
            smart_sourcing_service_1.SmartSourcingService,
            ai_procurement_service_1.AIProcurementService,
            blockchain_procurement_service_1.BlockchainProcurementService,
            sustainable_procurement_service_1.SustainableProcurementService,
            procurement_utilities_1.ProcurementUtilities,
            supplier_scoring_service_1.SupplierScoringService,
            procurement_validation_service_1.ProcurementValidationService,
            procurement_reporting_service_1.ProcurementReportingService,
            cost_analysis_service_1.CostAnalysisService,
        ],
    })
], ProcurementModule);
//# sourceMappingURL=procurement.module.js.map