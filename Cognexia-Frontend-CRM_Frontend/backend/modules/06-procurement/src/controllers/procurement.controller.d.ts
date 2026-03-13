export declare class ProcurementController {
    private readonly logger;
    constructor();
    getAllSuppliers(page?: number, limit?: number, status?: string, category?: string): Promise<{
        success: boolean;
        data: {
            suppliers: ({
                id: string;
                supplierCode: string;
                name: string;
                category: string;
                status: string;
                qualificationStatus: string;
                riskLevel: string;
                contactPerson: string;
                email: string;
                phone: string;
                address: {
                    street: string;
                    city: string;
                    state: string;
                    country: string;
                    zipCode: string;
                };
                paymentTerms: string;
                currency: string;
                leadTime: number;
                minimumOrderValue: number;
                certifications: string[];
                bankDetails: {
                    bankName: string;
                    accountNumber: string;
                    routingNumber: string;
                };
                performance: {
                    qualityScore: number;
                    deliveryPerformance: number;
                    priceCompetitiveness: number;
                    overallRating: number;
                    defectRate: number;
                    onTimeDelivery: number;
                };
                products: {
                    productCode: string;
                    productName: string;
                    unitPrice: number;
                }[];
                contracts: {
                    contractId: string;
                    contractType: string;
                    startDate: string;
                    endDate: string;
                    status: string;
                }[];
                lastAuditDate: string;
                nextAuditDate: string;
                complianceScore: number;
            } | {
                id: string;
                supplierCode: string;
                name: string;
                category: string;
                status: string;
                qualificationStatus: string;
                riskLevel: string;
                contactPerson: string;
                email: string;
                phone: string;
                address: {
                    street: string;
                    city: string;
                    state: string;
                    country: string;
                    zipCode: string;
                };
                paymentTerms: string;
                currency: string;
                leadTime: number;
                minimumOrderValue: number;
                certifications: string[];
                performance: {
                    qualityScore: number;
                    deliveryPerformance: number;
                    priceCompetitiveness: number;
                    overallRating: number;
                    defectRate: number;
                    onTimeDelivery: number;
                };
                products: {
                    productCode: string;
                    productName: string;
                    unitPrice: number;
                }[];
                bankDetails?: undefined;
                contracts?: undefined;
                lastAuditDate?: undefined;
                nextAuditDate?: undefined;
                complianceScore?: undefined;
            })[];
            pagination: {
                currentPage: number;
                totalPages: number;
                totalItems: number;
                itemsPerPage: number;
            };
            summary: {
                totalSuppliers: number;
                approvedSuppliers: number;
                pendingApproval: number;
                suspendedSuppliers: number;
                avgQualityScore: number;
                avgDeliveryPerformance: number;
            };
        };
        message: string;
    }>;
    getAllPurchaseOrders(page?: number, status?: string, supplierId?: string): Promise<{
        success: boolean;
        data: {
            purchaseOrders: ({
                id: string;
                poNumber: string;
                supplierId: string;
                supplierName: string;
                status: string;
                priority: string;
                orderDate: string;
                expectedDeliveryDate: string;
                actualDeliveryDate: null;
                totalValue: number;
                currency: string;
                paymentTerms: string;
                deliveryTerms: string;
                approvalStatus: string;
                approvedBy: string;
                approvalDate: string;
                createdBy: string;
                items: {
                    lineNumber: number;
                    productCode: string;
                    productName: string;
                    quantity: number;
                    unitPrice: number;
                    totalPrice: number;
                    deliveryDate: string;
                    specifications: string;
                    receivedQuantity: number;
                    status: string;
                }[];
                taxes: number;
                shippingCost: number;
                discounts: number;
                netAmount: number;
                attachments: {
                    fileName: string;
                    fileUrl: string;
                }[];
                deliveryAddress: {
                    name: string;
                    street: string;
                    city: string;
                    state: string;
                    zipCode: string;
                };
                notes: string;
            } | {
                id: string;
                poNumber: string;
                supplierId: string;
                supplierName: string;
                status: string;
                priority: string;
                orderDate: string;
                expectedDeliveryDate: string;
                totalValue: number;
                currency: string;
                paymentTerms: string;
                deliveryTerms: string;
                approvalStatus: string;
                createdBy: string;
                items: {
                    lineNumber: number;
                    productCode: string;
                    productName: string;
                    quantity: number;
                    unitPrice: number;
                    totalPrice: number;
                    deliveryDate: string;
                    specifications: string;
                    status: string;
                }[];
                taxes: number;
                shippingCost: number;
                netAmount: number;
                actualDeliveryDate?: undefined;
                approvedBy?: undefined;
                approvalDate?: undefined;
                discounts?: undefined;
                attachments?: undefined;
                deliveryAddress?: undefined;
                notes?: undefined;
            })[];
            summary: {
                totalPOs: number;
                pendingApproval: number;
                approved: number;
                inTransit: number;
                delivered: number;
                cancelled: number;
                totalValue: number;
                avgProcessingTime: number;
            };
        };
        message: string;
    }>;
    createPurchaseOrder(createPODto: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getAllRFQs(): Promise<{
        success: boolean;
        data: {
            rfqs: {
                id: string;
                rfqNumber: string;
                title: string;
                description: string;
                status: string;
                issueDate: string;
                responseDeadline: string;
                evaluationDeadline: string;
                createdBy: string;
                category: string;
                estimatedValue: number;
                currency: string;
                items: {
                    itemNumber: number;
                    productCode: string;
                    productName: string;
                    quantity: number;
                    unit: string;
                    specifications: string;
                    deliveryDate: string;
                }[];
                invitedSuppliers: {
                    supplierId: string;
                    supplierName: string;
                    status: string;
                }[];
                responses: {
                    responseId: string;
                    supplierId: string;
                    supplierName: string;
                    submitDate: string;
                    totalValue: number;
                    currency: string;
                    deliveryTime: number;
                    paymentTerms: string;
                    validityPeriod: number;
                    items: {
                        itemNumber: number;
                        unitPrice: number;
                        totalPrice: number;
                        leadTime: number;
                    }[];
                    technicalCompliance: number;
                    commercialScore: number;
                }[];
                evaluation: {
                    status: string;
                    evaluators: string[];
                    criteria: {
                        criterion: string;
                        weight: number;
                        maxScore: number;
                    }[];
                    recommendedSupplier: string;
                    recommendation: string;
                };
            }[];
        };
        message: string;
    }>;
    getProcurementAnalytics(timeRange?: string): Promise<{
        success: boolean;
        data: {
            overview: {
                totalSpend: number;
                activePOs: number;
                activeSuppliers: number;
                avgProcessingTime: number;
                costSavings: number;
                savingsPercentage: number;
                onTimeDelivery: number;
                qualityScore: number;
            };
            spendAnalysis: {
                byCategory: {
                    category: string;
                    spend: number;
                    percentage: number;
                }[];
                bySupplier: {
                    supplierId: string;
                    name: string;
                    spend: number;
                    percentage: number;
                }[];
                trends: {
                    labels: string[];
                    spend: number[];
                    savings: number[];
                };
            };
            supplierPerformance: {
                topPerformers: {
                    supplierId: string;
                    name: string;
                    score: number;
                    trend: string;
                }[];
                kpis: {
                    avgQualityScore: number;
                    avgDeliveryPerformance: number;
                    avgResponseTime: number;
                    defectRate: number;
                    supplierRetentionRate: number;
                };
            };
            riskAnalysis: {
                overallRisk: string;
                riskCategories: {
                    category: string;
                    risk: string;
                    impact: number;
                }[];
                mitigation: string[];
            };
            alerts: {
                critical: number;
                warning: number;
                info: number;
            };
        };
        message: string;
    }>;
    getAllContracts(): Promise<{
        success: boolean;
        data: {
            contracts: {
                id: string;
                contractNumber: string;
                supplierId: string;
                supplierName: string;
                contractType: string;
                status: string;
                startDate: string;
                endDate: string;
                autoRenewal: boolean;
                renewalNotice: number;
                value: number;
                currency: string;
                paymentTerms: string;
                slaTerms: {
                    deliveryTime: number;
                    qualityStandard: number;
                    responseTime: number;
                };
                penalties: {
                    type: string;
                    penalty: string;
                }[];
                milestones: {
                    milestone: string;
                    date: string;
                    status: string;
                }[];
                documents: {
                    type: string;
                    fileName: string;
                }[];
                expiryWarning: boolean;
                daysToExpiry: number;
            }[];
        };
        message: string;
    }>;
}
//# sourceMappingURL=procurement.controller.d.ts.map