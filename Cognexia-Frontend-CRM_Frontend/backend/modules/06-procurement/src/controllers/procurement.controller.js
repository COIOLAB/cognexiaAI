"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ProcurementController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcurementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../../auth/decorators/roles.decorator");
let ProcurementController = ProcurementController_1 = class ProcurementController {
    constructor() {
        this.logger = new common_1.Logger(ProcurementController_1.name);
    }
    // =================== SUPPLIER MANAGEMENT ===================
    async getAllSuppliers(page, limit, status, category) {
        try {
            return {
                success: true,
                data: {
                    suppliers: [
                        {
                            id: 'SUP-001',
                            supplierCode: 'CHEM-001',
                            name: 'ChemTech Industries Ltd.',
                            category: 'raw_materials',
                            status: 'approved',
                            qualificationStatus: 'qualified',
                            riskLevel: 'low',
                            contactPerson: 'John Smith',
                            email: 'john.smith@chemtech.com',
                            phone: '+1-555-0123',
                            address: {
                                street: '123 Industrial Blvd',
                                city: 'Houston',
                                state: 'TX',
                                country: 'USA',
                                zipCode: '77001'
                            },
                            paymentTerms: 'NET30',
                            currency: 'USD',
                            leadTime: 14, // days
                            minimumOrderValue: 5000,
                            certifications: ['ISO 9001', 'ISO 14001', 'REACH'],
                            bankDetails: {
                                bankName: 'Industrial Bank',
                                accountNumber: '****1234',
                                routingNumber: '****5678'
                            },
                            performance: {
                                qualityScore: 94.2,
                                deliveryPerformance: 96.8,
                                priceCompetitiveness: 89.1,
                                overallRating: 4.7,
                                defectRate: 0.5,
                                onTimeDelivery: 96.8
                            },
                            products: [
                                { productCode: 'CHM-001', productName: 'Industrial Chemical A', unitPrice: 125.50 },
                                { productCode: 'CHM-002', productName: 'Catalyst B', unitPrice: 285.75 }
                            ],
                            contracts: [
                                {
                                    contractId: 'CNT-001',
                                    contractType: 'master_agreement',
                                    startDate: '2024-01-01',
                                    endDate: '2024-12-31',
                                    status: 'active'
                                }
                            ],
                            lastAuditDate: '2024-01-15',
                            nextAuditDate: '2024-07-15',
                            complianceScore: 98.5
                        },
                        {
                            id: 'SUP-002',
                            supplierCode: 'PACK-001',
                            name: 'Premium Packaging Solutions',
                            category: 'packaging',
                            status: 'approved',
                            qualificationStatus: 'qualified',
                            riskLevel: 'medium',
                            contactPerson: 'Sarah Johnson',
                            email: 'sarah.j@premiumpack.com',
                            phone: '+1-555-0456',
                            address: {
                                street: '456 Package Way',
                                city: 'Atlanta',
                                state: 'GA',
                                country: 'USA',
                                zipCode: '30301'
                            },
                            paymentTerms: 'NET45',
                            currency: 'USD',
                            leadTime: 21, // days
                            minimumOrderValue: 2500,
                            certifications: ['FSC', 'SQF', 'BRC'],
                            performance: {
                                qualityScore: 91.8,
                                deliveryPerformance: 88.5,
                                priceCompetitiveness: 92.3,
                                overallRating: 4.3,
                                defectRate: 1.2,
                                onTimeDelivery: 88.5
                            },
                            products: [
                                { productCode: 'PKG-001', productName: 'Pharmaceutical Vials', unitPrice: 0.85 },
                                { productCode: 'PKG-002', productName: 'Blister Packs', unitPrice: 1.25 }
                            ]
                        }
                    ],
                    pagination: {
                        currentPage: page || 1,
                        totalPages: 1,
                        totalItems: 2,
                        itemsPerPage: limit || 20
                    },
                    summary: {
                        totalSuppliers: 156,
                        approvedSuppliers: 142,
                        pendingApproval: 8,
                        suspendedSuppliers: 6,
                        avgQualityScore: 92.5,
                        avgDeliveryPerformance: 94.1
                    }
                },
                message: 'Suppliers retrieved successfully'
            };
        }
        catch (error) {
            this.logger.error('Error getting suppliers:', error);
            throw new common_1.HttpException('Failed to retrieve suppliers', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // =================== PURCHASE ORDERS ===================
    async getAllPurchaseOrders(page, status, supplierId) {
        try {
            return {
                success: true,
                data: {
                    purchaseOrders: [
                        {
                            id: 'PO-001',
                            poNumber: 'PO-2024-001',
                            supplierId: 'SUP-001',
                            supplierName: 'ChemTech Industries Ltd.',
                            status: 'approved',
                            priority: 'high',
                            orderDate: '2024-02-15',
                            expectedDeliveryDate: '2024-03-01',
                            actualDeliveryDate: null,
                            totalValue: 45750.00,
                            currency: 'USD',
                            paymentTerms: 'NET30',
                            deliveryTerms: 'FOB Destination',
                            approvalStatus: 'approved',
                            approvedBy: 'procurement_manager',
                            approvalDate: '2024-02-15T10:30:00Z',
                            createdBy: 'buyer_001',
                            items: [
                                {
                                    lineNumber: 1,
                                    productCode: 'CHM-001',
                                    productName: 'Industrial Chemical A',
                                    quantity: 200,
                                    unitPrice: 125.50,
                                    totalPrice: 25100.00,
                                    deliveryDate: '2024-03-01',
                                    specifications: 'Purity: 99.5%, Grade: Technical',
                                    receivedQuantity: 0,
                                    status: 'pending'
                                },
                                {
                                    lineNumber: 2,
                                    productCode: 'CHM-002',
                                    productName: 'Catalyst B',
                                    quantity: 72,
                                    unitPrice: 285.75,
                                    totalPrice: 20574.00,
                                    deliveryDate: '2024-03-01',
                                    specifications: 'Activity: >95%, Mesh: 20-40',
                                    receivedQuantity: 0,
                                    status: 'pending'
                                }
                            ],
                            taxes: 4575.00,
                            shippingCost: 250.00,
                            discounts: 0.00,
                            netAmount: 45750.00,
                            attachments: [
                                { fileName: 'PO-2024-001.pdf', fileUrl: '/docs/po/PO-2024-001.pdf' },
                                { fileName: 'specifications.pdf', fileUrl: '/docs/specs/CHM-001-specs.pdf' }
                            ],
                            deliveryAddress: {
                                name: 'Manufacturing Plant A',
                                street: '789 Factory Road',
                                city: 'Industrial City',
                                state: 'TX',
                                zipCode: '77002'
                            },
                            notes: 'Urgent order for production line restart'
                        },
                        {
                            id: 'PO-002',
                            poNumber: 'PO-2024-002',
                            supplierId: 'SUP-002',
                            supplierName: 'Premium Packaging Solutions',
                            status: 'pending_approval',
                            priority: 'medium',
                            orderDate: '2024-02-16',
                            expectedDeliveryDate: '2024-03-10',
                            totalValue: 12850.00,
                            currency: 'USD',
                            paymentTerms: 'NET45',
                            deliveryTerms: 'FOB Origin',
                            approvalStatus: 'pending',
                            createdBy: 'buyer_002',
                            items: [
                                {
                                    lineNumber: 1,
                                    productCode: 'PKG-001',
                                    productName: 'Pharmaceutical Vials',
                                    quantity: 10000,
                                    unitPrice: 0.85,
                                    totalPrice: 8500.00,
                                    deliveryDate: '2024-03-10',
                                    specifications: 'Type I Borosilicate Glass, 10ml',
                                    status: 'pending'
                                },
                                {
                                    lineNumber: 2,
                                    productCode: 'PKG-002',
                                    productName: 'Blister Packs',
                                    quantity: 3000,
                                    unitPrice: 1.25,
                                    totalPrice: 3750.00,
                                    deliveryDate: '2024-03-10',
                                    specifications: 'PVC/Alu, 10-cavity',
                                    status: 'pending'
                                }
                            ],
                            taxes: 600.00,
                            shippingCost: 150.00,
                            netAmount: 12850.00
                        }
                    ],
                    summary: {
                        totalPOs: 245,
                        pendingApproval: 12,
                        approved: 85,
                        inTransit: 45,
                        delivered: 98,
                        cancelled: 5,
                        totalValue: 2450000.00,
                        avgProcessingTime: 2.5 // days
                    }
                },
                message: 'Purchase orders retrieved successfully'
            };
        }
        catch (error) {
            this.logger.error('Error getting purchase orders:', error);
            throw new common_1.HttpException('Failed to retrieve purchase orders', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createPurchaseOrder(createPODto) {
        try {
            return {
                success: true,
                data: {
                    id: 'po-' + Date.now(),
                    poNumber: 'PO-2024-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
                    ...createPODto,
                    status: 'draft',
                    createdAt: new Date(),
                    approvalStatus: 'pending'
                },
                message: 'Purchase order created successfully'
            };
        }
        catch (error) {
            this.logger.error('Error creating purchase order:', error);
            throw new common_1.HttpException('Failed to create purchase order', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // =================== RFQ MANAGEMENT ===================
    async getAllRFQs() {
        try {
            return {
                success: true,
                data: {
                    rfqs: [
                        {
                            id: 'RFQ-001',
                            rfqNumber: 'RFQ-2024-001',
                            title: 'Raw Materials for Q2 Production',
                            description: 'Request for quotation for various raw materials needed for Q2 production',
                            status: 'responses_received',
                            issueDate: '2024-02-10',
                            responseDeadline: '2024-02-20',
                            evaluationDeadline: '2024-02-25',
                            createdBy: 'procurement_manager',
                            category: 'raw_materials',
                            estimatedValue: 125000.00,
                            currency: 'USD',
                            items: [
                                {
                                    itemNumber: 1,
                                    productCode: 'CHM-003',
                                    productName: 'Specialty Chemical C',
                                    quantity: 500,
                                    unit: 'kg',
                                    specifications: 'Purity: 99.8%, Temperature stability: -20°C to 80°C',
                                    deliveryDate: '2024-03-15'
                                },
                                {
                                    itemNumber: 2,
                                    productCode: 'CHM-004',
                                    productName: 'Solvent D',
                                    quantity: 1000,
                                    unit: 'L',
                                    specifications: 'HPLC grade, Water content: <0.01%',
                                    deliveryDate: '2024-03-15'
                                }
                            ],
                            invitedSuppliers: [
                                { supplierId: 'SUP-001', supplierName: 'ChemTech Industries Ltd.', status: 'responded' },
                                { supplierId: 'SUP-003', supplierName: 'Global Chemicals Corp', status: 'responded' },
                                { supplierId: 'SUP-004', supplierName: 'Premium Chem Solutions', status: 'pending' }
                            ],
                            responses: [
                                {
                                    responseId: 'RESP-001',
                                    supplierId: 'SUP-001',
                                    supplierName: 'ChemTech Industries Ltd.',
                                    submitDate: '2024-02-18',
                                    totalValue: 118750.00,
                                    currency: 'USD',
                                    deliveryTime: 21, // days
                                    paymentTerms: 'NET30',
                                    validityPeriod: 30, // days
                                    items: [
                                        { itemNumber: 1, unitPrice: 185.50, totalPrice: 92750.00, leadTime: 21 },
                                        { itemNumber: 2, unitPrice: 26.00, totalPrice: 26000.00, leadTime: 14 }
                                    ],
                                    technicalCompliance: 95.0,
                                    commercialScore: 88.5
                                },
                                {
                                    responseId: 'RESP-002',
                                    supplierId: 'SUP-003',
                                    supplierName: 'Global Chemicals Corp',
                                    submitDate: '2024-02-19',
                                    totalValue: 122500.00,
                                    currency: 'USD',
                                    deliveryTime: 28, // days
                                    paymentTerms: 'NET45',
                                    validityPeriod: 45, // days
                                    items: [
                                        { itemNumber: 1, unitPrice: 195.00, totalPrice: 97500.00, leadTime: 28 },
                                        { itemNumber: 2, unitPrice: 25.00, totalPrice: 25000.00, leadTime: 21 }
                                    ],
                                    technicalCompliance: 92.0,
                                    commercialScore: 85.2
                                }
                            ],
                            evaluation: {
                                status: 'in_progress',
                                evaluators: ['procurement_manager', 'technical_lead', 'quality_manager'],
                                criteria: [
                                    { criterion: 'Price', weight: 40, maxScore: 100 },
                                    { criterion: 'Quality', weight: 30, maxScore: 100 },
                                    { criterion: 'Delivery', weight: 20, maxScore: 100 },
                                    { criterion: 'Service', weight: 10, maxScore: 100 }
                                ],
                                recommendedSupplier: 'SUP-001',
                                recommendation: 'ChemTech Industries offers best value with superior quality and competitive pricing'
                            }
                        }
                    ]
                },
                message: 'RFQs retrieved successfully'
            };
        }
        catch (error) {
            this.logger.error('Error getting RFQs:', error);
            throw new common_1.HttpException('Failed to retrieve RFQs', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // =================== SUPPLY CHAIN ANALYTICS ===================
    async getProcurementAnalytics(timeRange) {
        try {
            return {
                success: true,
                data: {
                    overview: {
                        totalSpend: 2450000.00,
                        activePOs: 142,
                        activeSuppliers: 156,
                        avgProcessingTime: 2.5, // days
                        costSavings: 185000.00,
                        savingsPercentage: 7.8,
                        onTimeDelivery: 94.1,
                        qualityScore: 92.5
                    },
                    spendAnalysis: {
                        byCategory: [
                            { category: 'Raw Materials', spend: 1450000.00, percentage: 59.2 },
                            { category: 'Packaging', spend: 485000.00, percentage: 19.8 },
                            { category: 'Equipment', spend: 315000.00, percentage: 12.9 },
                            { category: 'Services', spend: 125000.00, percentage: 5.1 },
                            { category: 'Others', spend: 75000.00, percentage: 3.0 }
                        ],
                        bySupplier: [
                            { supplierId: 'SUP-001', name: 'ChemTech Industries', spend: 485000.00, percentage: 19.8 },
                            { supplierId: 'SUP-002', name: 'Premium Packaging', spend: 325000.00, percentage: 13.3 },
                            { supplierId: 'SUP-003', name: 'Global Chemicals', spend: 285000.00, percentage: 11.6 },
                            { supplierId: 'SUP-004', name: 'Industrial Equipment', spend: 225000.00, percentage: 9.2 }
                        ],
                        trends: {
                            labels: ['Jan', 'Feb', 'Mar', 'Apr'],
                            spend: [580000, 625000, 595000, 650000],
                            savings: [45000, 52000, 48000, 55000]
                        }
                    },
                    supplierPerformance: {
                        topPerformers: [
                            { supplierId: 'SUP-001', name: 'ChemTech Industries', score: 94.2, trend: 'improving' },
                            { supplierId: 'SUP-005', name: 'Quality Parts Co', score: 93.8, trend: 'stable' },
                            { supplierId: 'SUP-003', name: 'Global Chemicals', score: 91.5, trend: 'declining' }
                        ],
                        kpis: {
                            avgQualityScore: 92.5,
                            avgDeliveryPerformance: 94.1,
                            avgResponseTime: 1.8, // days
                            defectRate: 0.8,
                            supplierRetentionRate: 89.5
                        }
                    },
                    riskAnalysis: {
                        overallRisk: 'medium',
                        riskCategories: [
                            { category: 'Supplier Concentration', risk: 'high', impact: 8.5 },
                            { category: 'Geographic Risk', risk: 'medium', impact: 6.2 },
                            { category: 'Financial Risk', risk: 'low', impact: 3.1 },
                            { category: 'Quality Risk', risk: 'low', impact: 2.8 }
                        ],
                        mitigation: [
                            'Diversify supplier base for critical materials',
                            'Implement dual sourcing strategy',
                            'Increase safety stock for high-risk items'
                        ]
                    },
                    alerts: {
                        critical: 2,
                        warning: 8,
                        info: 15
                    }
                },
                message: 'Procurement analytics retrieved successfully'
            };
        }
        catch (error) {
            this.logger.error('Error getting procurement analytics:', error);
            throw new common_1.HttpException('Failed to retrieve procurement analytics', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // =================== CONTRACTS MANAGEMENT ===================
    async getAllContracts() {
        try {
            return {
                success: true,
                data: {
                    contracts: [
                        {
                            id: 'CNT-001',
                            contractNumber: 'CNT-2024-001',
                            supplierId: 'SUP-001',
                            supplierName: 'ChemTech Industries Ltd.',
                            contractType: 'master_service_agreement',
                            status: 'active',
                            startDate: '2024-01-01',
                            endDate: '2024-12-31',
                            autoRenewal: true,
                            renewalNotice: 90, // days
                            value: 500000.00,
                            currency: 'USD',
                            paymentTerms: 'NET30',
                            slaTerms: {
                                deliveryTime: 14, // days
                                qualityStandard: 99.5,
                                responseTime: 24 // hours
                            },
                            penalties: [
                                { type: 'late_delivery', penalty: '2% of order value per day' },
                                { type: 'quality_failure', penalty: '5% of order value' }
                            ],
                            milestones: [
                                { milestone: 'Q1 Review', date: '2024-03-31', status: 'pending' },
                                { milestone: 'Mid-year Assessment', date: '2024-06-30', status: 'scheduled' }
                            ],
                            documents: [
                                { type: 'signed_contract', fileName: 'CNT-2024-001_signed.pdf' },
                                { type: 'amendments', fileName: 'CNT-2024-001_amendment_1.pdf' }
                            ],
                            expiryWarning: false,
                            daysToExpiry: 318
                        }
                    ]
                },
                message: 'Contracts retrieved successfully'
            };
        }
        catch (error) {
            this.logger.error('Error getting contracts:', error);
            throw new common_1.HttpException('Failed to retrieve contracts', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ProcurementController = ProcurementController;
__decorate([
    (0, common_1.Get)('suppliers'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all suppliers',
        description: 'Retrieve all suppliers with performance metrics and qualification status'
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Suppliers retrieved successfully' }),
    (0, roles_decorator_1.Roles)('admin', 'manager', 'procurement_manager', 'buyer', 'viewer'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "getAllSuppliers", null);
__decorate([
    (0, common_1.Get)('purchase-orders'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all purchase orders',
        description: 'Retrieve all purchase orders with status tracking and approval workflow'
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'supplierId', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Purchase orders retrieved successfully' }),
    (0, roles_decorator_1.Roles)('admin', 'manager', 'procurement_manager', 'buyer', 'viewer'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('supplierId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "getAllPurchaseOrders", null);
__decorate([
    (0, common_1.Post)('purchase-orders'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create new purchase order',
        description: 'Create a new purchase order with automatic approval workflow'
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Purchase order created successfully' }),
    (0, roles_decorator_1.Roles)('admin', 'manager', 'procurement_manager', 'buyer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "createPurchaseOrder", null);
__decorate([
    (0, common_1.Get)('rfq'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all RFQs (Request for Quotation)',
        description: 'Retrieve all RFQs with supplier responses and comparison'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'RFQs retrieved successfully' }),
    (0, roles_decorator_1.Roles)('admin', 'manager', 'procurement_manager', 'buyer', 'viewer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "getAllRFQs", null);
__decorate([
    (0, common_1.Get)('analytics/overview'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get procurement and supply chain analytics',
        description: 'Comprehensive procurement KPIs and supply chain metrics'
    }),
    (0, swagger_1.ApiQuery)({ name: 'timeRange', required: false, enum: ['24h', '7d', '30d', '90d'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Procurement analytics retrieved successfully' }),
    (0, roles_decorator_1.Roles)('admin', 'manager', 'procurement_manager', 'viewer'),
    __param(0, (0, common_1.Query)('timeRange')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "getProcurementAnalytics", null);
__decorate([
    (0, common_1.Get)('contracts'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all supplier contracts',
        description: 'Retrieve all supplier contracts with renewal tracking'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contracts retrieved successfully' }),
    (0, roles_decorator_1.Roles)('admin', 'manager', 'procurement_manager', 'legal', 'viewer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProcurementController.prototype, "getAllContracts", null);
exports.ProcurementController = ProcurementController = ProcurementController_1 = __decorate([
    (0, swagger_1.ApiTags)('Procurement & Supply Chain'),
    (0, common_1.Controller)('procurement'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [])
], ProcurementController);
//# sourceMappingURL=procurement.controller.js.map