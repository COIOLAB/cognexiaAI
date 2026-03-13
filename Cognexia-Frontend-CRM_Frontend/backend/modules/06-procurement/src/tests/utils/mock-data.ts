import { 
  Supplier, 
  SupplierStatus, 
  SupplierType, 
  RiskLevel as SupplierRiskLevel 
} from '../../entities/supplier.entity';
import { 
  PurchaseOrder, 
  OrderStatus, 
  OrderType, 
  Priority as OrderPriority 
} from '../../entities/purchase-order.entity';
import { 
  Contract, 
  ContractStatus, 
  ContractType, 
  RiskLevel as ContractRiskLevel 
} from '../../entities/contract.entity';
import { 
  RFQ, 
  RFQStatus, 
  RFQType 
} from '../../entities/rfq.entity';

// ============================================================================
// SUPPLIER MOCK DATA
// ============================================================================

export function createMockSupplier(overrides: Partial<Supplier> = {}): Supplier {
  const supplier = new Supplier();
  
  supplier.id = overrides.id || generateUUID();
  supplier.name = overrides.name || 'Acme Manufacturing Corp';
  supplier.type = overrides.type || SupplierType.MANUFACTURER;
  supplier.status = overrides.status || SupplierStatus.ACTIVE;
  supplier.description = overrides.description || 'Leading manufacturer of industrial components and equipment';
  
  // Categories
  supplier.categories = overrides.categories || ['Electronics', 'Manufacturing', 'Industrial Equipment'];
  
  // Address
  supplier.address = overrides.address || {
    street: '123 Industrial Boulevard',
    city: 'Manufacturing City',
    state: 'IN',
    postalCode: '46201',
    country: 'United States',
    isHeadquarters: true,
  };
  
  // Contact Information
  supplier.contactInfo = overrides.contactInfo || [
    {
      name: 'John Smith',
      position: 'Sales Manager',
      email: 'john.smith@acme-manufacturing.com',
      phone: '+1-555-0123',
      department: 'Sales',
      isPrimary: true,
      isActive: true,
    },
    {
      name: 'Sarah Johnson',
      position: 'Account Executive',
      email: 'sarah.johnson@acme-manufacturing.com',
      phone: '+1-555-0124',
      department: 'Sales',
      isPrimary: false,
      isActive: true,
    },
  ];
  
  // Business Information
  supplier.taxId = overrides.taxId || 'TAX123456789';
  supplier.businessLicense = overrides.businessLicense || 'BL987654321';
  supplier.website = overrides.website || 'https://acme-manufacturing.com';
  
  // Certifications and Capabilities
  supplier.certifications = overrides.certifications || [
    'ISO 9001:2015',
    'ISO 14001:2015',
    'OHSAS 18001',
    'AS9100D',
  ];
  supplier.capabilities = overrides.capabilities || [
    'CNC Machining',
    'Sheet Metal Fabrication',
    'Assembly',
    'Quality Control',
    'Engineering Support',
  ];
  supplier.regions = overrides.regions || [
    'North America',
    'Europe',
    'Asia Pacific',
  ];
  
  // Performance Metrics
  supplier.riskLevel = overrides.riskLevel || SupplierRiskLevel.LOW;
  supplier.riskScore = overrides.riskScore || 85;
  supplier.performanceScore = overrides.performanceScore || 92;
  supplier.qualityRating = overrides.qualityRating || 4.7;
  supplier.deliveryRating = overrides.deliveryRating || 4.5;
  supplier.sustainabilityScore = overrides.sustainabilityScore || 78;
  
  // Financial Information
  supplier.totalSpend = overrides.totalSpend || 2500000;
  supplier.contractsCount = overrides.contractsCount || 15;
  supplier.lastOrderDate = overrides.lastOrderDate || new Date('2024-03-15');
  
  // Metadata
  supplier.onboardedAt = overrides.onboardedAt || new Date('2023-01-15');
  supplier.onboardedBy = overrides.onboardedBy || 'procurement-manager-001';
  supplier.createdAt = overrides.createdAt || new Date('2023-01-15');
  supplier.updatedAt = overrides.updatedAt || new Date();
  
  // Custom Fields
  supplier.qualityStandards = overrides.qualityStandards || {
    defectRate: 0.02,
    returnRate: 0.01,
    certificationLevel: 'Gold',
    auditScore: 95,
  };
  
  supplier.sustainabilityMetrics = overrides.sustainabilityMetrics || {
    carbonFootprint: 'Low',
    wasteReduction: 85,
    renewableEnergy: 60,
    socialResponsibility: 'High',
  };
  
  supplier.financialInfo = overrides.financialInfo || {
    creditRating: 'A+',
    paymentTerms: 30,
    discountRate: 2,
    insurance: 'Comprehensive',
  };
  
  return supplier;
}

export function createMockSupplierList(count: number = 5): Supplier[] {
  const suppliers: Supplier[] = [];
  const companies = [
    { name: 'TechCorp Solutions', type: SupplierType.SERVICE_PROVIDER, categories: ['IT Services', 'Software Development'] },
    { name: 'Global Manufacturing Ltd', type: SupplierType.MANUFACTURER, categories: ['Manufacturing', 'Assembly'] },
    { name: 'Premium Distributors Inc', type: SupplierType.DISTRIBUTOR, categories: ['Electronics', 'Components'] },
    { name: 'Consulting Partners LLC', type: SupplierType.CONSULTANT, categories: ['Business Consulting', 'Strategy'] },
    { name: 'Wholesale Supply Co', type: SupplierType.WHOLESALER, categories: ['Office Supplies', 'Materials'] },
  ];
  
  for (let i = 0; i < Math.min(count, companies.length); i++) {
    const company = companies[i];
    suppliers.push(createMockSupplier({
      name: company.name,
      type: company.type,
      categories: company.categories,
    }));
  }
  
  return suppliers;
}

// ============================================================================
// PURCHASE ORDER MOCK DATA
// ============================================================================

export function createMockPurchaseOrder(supplierId: string, overrides: Partial<PurchaseOrder> = {}): PurchaseOrder {
  const po = new PurchaseOrder();
  
  po.id = overrides.id || generateUUID();
  po.orderNumber = overrides.orderNumber || `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  po.status = overrides.status || OrderStatus.DRAFT;
  po.type = overrides.type || OrderType.GOODS;
  po.priority = overrides.priority || OrderPriority.MEDIUM;
  
  // Supplier Information
  po.supplierId = supplierId;
  po.supplierName = overrides.supplierName || 'Acme Manufacturing Corp';
  
  // Line Items
  po.items = overrides.items || [
    {
      id: generateUUID(),
      description: 'Industrial Bearings - Premium Grade',
      quantity: 100,
      unitPrice: 45.50,
      totalPrice: 4550,
      unit: 'pieces',
      category: 'Mechanical Components',
      requiredDate: new Date('2024-06-01'),
      status: 'pending',
      specifications: {
        material: 'Stainless Steel',
        grade: 'Premium',
        tolerance: '+/- 0.001',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateUUID(),
      description: 'Hydraulic Seals Kit',
      quantity: 25,
      unitPrice: 89.99,
      totalPrice: 2249.75,
      unit: 'kits',
      category: 'Hydraulic Components',
      requiredDate: new Date('2024-06-01'),
      status: 'pending',
      specifications: {
        pressureRating: '5000 PSI',
        temperature: '-40°C to +120°C',
        material: 'Nitrile Rubber',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  
  // Financial Information
  po.totalAmount = overrides.totalAmount || 6799.75;
  po.taxAmount = overrides.taxAmount || 543.98;
  po.grandTotal = overrides.grandTotal || 7343.73;
  
  // Order Details
  po.department = overrides.department || 'Manufacturing';
  po.requestedBy = overrides.requestedBy || 'production-manager-001';
  po.approvedBy = overrides.approvedBy || 'procurement-manager-001';
  po.requiredBy = overrides.requiredBy || new Date('2024-06-01');
  po.deliveredAt = overrides.deliveredAt || null;
  
  // AI and Optimization
  po.isAutonomous = overrides.isAutonomous ?? true;
  po.aiOptimized = overrides.aiOptimized ?? true;
  po.optimizationScore = overrides.optimizationScore || 87;
  po.riskScore = overrides.riskScore || 15;
  po.complianceScore = overrides.complianceScore || 95;
  
  // Additional Information
  po.deliveryInstructions = overrides.deliveryInstructions || {
    address: '456 Production Drive, Manufacturing City, IN 46201',
    contactPerson: 'Mike Wilson',
    contactPhone: '+1-555-0200',
    specialInstructions: 'Deliver to Receiving Dock B during business hours (7 AM - 5 PM)',
    requiredDocuments: ['Packing List', 'Certificate of Compliance'],
  };
  
  po.approvalMatrix = overrides.approvalMatrix || {
    requiredApprovals: ['department_manager', 'procurement_manager'],
    currentLevel: 2,
    maxLevel: 2,
    approvalHistory: [
      {
        level: 1,
        approver: 'department-manager-001',
        approvedAt: new Date('2024-03-10'),
        comments: 'Approved for production requirements',
      },
      {
        level: 2,
        approver: 'procurement-manager-001',
        approvedAt: new Date('2024-03-11'),
        comments: 'Supplier and pricing verified',
      },
    ],
  };
  
  // Blockchain
  po.isBlockchainEnabled = overrides.isBlockchainEnabled ?? false;
  po.blockchainHash = overrides.blockchainHash || null;
  po.blockchainTxId = overrides.blockchainTxId || null;
  
  // Metadata
  po.createdAt = overrides.createdAt || new Date('2024-03-10');
  po.updatedAt = overrides.updatedAt || new Date();
  
  return po;
}

// ============================================================================
// CONTRACT MOCK DATA
// ============================================================================

export function createMockContract(supplierId: string, overrides: Partial<Contract> = {}): Contract {
  const contract = new Contract();
  
  contract.id = overrides.id || generateUUID();
  contract.title = overrides.title || 'Manufacturing Services Agreement - Industrial Components';
  contract.contractType = overrides.contractType || ContractType.SERVICE;
  contract.status = overrides.status || ContractStatus.ACTIVE;
  
  // Supplier Information
  contract.supplierId = supplierId;
  contract.supplierName = overrides.supplierName || 'Acme Manufacturing Corp';
  
  // Financial Terms
  contract.totalValue = overrides.totalValue || 500000;
  contract.startDate = overrides.startDate || new Date('2024-01-01');
  contract.endDate = overrides.endDate || new Date('2024-12-31');
  
  // Contract Terms
  contract.terms = overrides.terms || [
    {
      id: generateUUID(),
      key: 'payment_terms',
      value: 'Net 30 days from invoice date',
      description: 'Payment due within 30 days of invoice receipt',
      isNegotiable: false,
      isStandard: true,
      lastModifiedAt: new Date('2024-01-01'),
      modifiedBy: 'contract-manager-001',
    },
    {
      id: generateUUID(),
      key: 'delivery_schedule',
      value: 'Monthly deliveries on the 15th of each month',
      description: 'Regular monthly delivery schedule for consistent supply',
      isNegotiable: true,
      isStandard: false,
      lastModifiedAt: new Date('2024-01-01'),
      modifiedBy: 'procurement-manager-001',
    },
    {
      id: generateUUID(),
      key: 'quality_standards',
      value: 'ISO 9001:2015 compliance required',
      description: 'All delivered goods must meet ISO 9001:2015 quality standards',
      isNegotiable: false,
      isStandard: true,
      lastModifiedAt: new Date('2024-01-01'),
      modifiedBy: 'quality-manager-001',
    },
    {
      id: generateUUID(),
      key: 'service_level_agreement',
      value: '99.5% uptime with 4-hour response time',
      description: 'Minimum service level requirements for support services',
      isNegotiable: true,
      isStandard: false,
      lastModifiedAt: new Date('2024-01-01'),
      modifiedBy: 'service-manager-001',
    },
  ];
  
  // Risk and Performance
  contract.riskLevel = overrides.riskLevel || ContractRiskLevel.LOW;
  contract.riskScore = overrides.riskScore || 20;
  contract.performanceScore = overrides.performanceScore || 88;
  contract.complianceScore = overrides.complianceScore || 94;
  
  // Additional Information
  contract.description = overrides.description || 'Comprehensive manufacturing services agreement covering component production, quality assurance, and delivery services for industrial equipment manufacturing.';
  contract.attachments = overrides.attachments || [
    'MSA-2024-001-Main-Agreement.pdf',
    'MSA-2024-001-SOW-ComponentSpecs.pdf',
    'MSA-2024-001-QualityStandards.pdf',
    'MSA-2024-001-DeliverySchedule.xlsx',
  ];
  
  // Renewal Options
  contract.renewalOptions = overrides.renewalOptions || {
    autoRenewal: true,
    renewalTerm: 12,
    renewalNotice: 60,
  };
  
  // Financial Terms Details
  contract.financialTerms = overrides.financialTerms || {
    paymentTerms: 30,
    penaltyClause: true,
    discountTerms: 2,
  };
  
  // Delivery Terms
  contract.deliveryTerms = overrides.deliveryTerms || {
    deliveryTime: 14,
    deliveryLocation: 'Buyer premises',
    shippingTerms: 'FOB Destination',
  };
  
  // Blockchain Integration
  contract.isBlockchainEnabled = overrides.isBlockchainEnabled ?? false;
  contract.blockchainHash = overrides.blockchainHash || null;
  contract.blockchainTxId = overrides.blockchainTxId || null;
  
  // Metadata
  contract.createdAt = overrides.createdAt || new Date('2024-01-01');
  contract.updatedAt = overrides.updatedAt || new Date();
  contract.createdBy = overrides.createdBy || 'contract-manager-001';
  contract.lastModifiedBy = overrides.lastModifiedBy || 'contract-manager-001';
  
  // Custom Fields
  contract.customFields = overrides.customFields || {
    projectCode: 'PRJ-2024-MFG-001',
    businessUnit: 'Manufacturing Division',
    costCenter: 'CC-4500',
    budgetCategory: 'CAPEX',
    strategicImportance: 'High',
    competitiveAdvantage: 'Cost Reduction',
  };
  
  return contract;
}

// ============================================================================
// RFQ MOCK DATA
// ============================================================================

export function createMockRFQ(overrides: Partial<RFQ> = {}): RFQ {
  const rfq = new RFQ();
  
  rfq.id = overrides.id || generateUUID();
  rfq.rfqNumber = overrides.rfqNumber || `RFQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  rfq.title = overrides.title || 'RFQ for Industrial Equipment Maintenance Services';
  rfq.description = overrides.description || 'Request for quotes for comprehensive maintenance services for industrial equipment including preventive maintenance, repairs, and emergency support.';
  
  rfq.status = overrides.status || RFQStatus.PUBLISHED;
  rfq.type = overrides.type || RFQType.SERVICE;
  
  // Requirements
  rfq.requirements = overrides.requirements || [
    {
      id: generateUUID(),
      category: 'Maintenance Services',
      description: 'Preventive maintenance for CNC machines',
      specifications: {
        frequency: 'Monthly',
        duration: '8 hours per session',
        technicians: '2 certified technicians',
        parts: 'OEM parts preferred',
      },
      quantity: 12,
      unit: 'sessions',
      estimatedValue: 25000,
    },
    {
      id: generateUUID(),
      category: 'Emergency Support',
      description: '24/7 emergency repair services',
      specifications: {
        responseTime: 'Within 4 hours',
        availability: '24/7/365',
        expertise: 'Multi-brand capability',
      },
      quantity: 1,
      unit: 'annual contract',
      estimatedValue: 15000,
    },
  ];
  
  // Dates
  rfq.publishedDate = overrides.publishedDate || new Date('2024-03-01');
  rfq.submissionDeadline = overrides.submissionDeadline || new Date('2024-03-31');
  rfq.evaluationDeadline = overrides.evaluationDeadline || new Date('2024-04-15');
  
  // Evaluation Criteria
  rfq.evaluationCriteria = overrides.evaluationCriteria || [
    { criterion: 'Price', weight: 40, description: 'Total cost of service' },
    { criterion: 'Experience', weight: 25, description: 'Years of relevant experience' },
    { criterion: 'Response Time', weight: 20, description: 'Emergency response capability' },
    { criterion: 'Certifications', weight: 15, description: 'Relevant certifications and qualifications' },
  ];
  
  // Contact and Metadata
  rfq.contactPerson = overrides.contactPerson || 'procurement-specialist-001';
  rfq.department = overrides.department || 'Maintenance';
  rfq.budgetRange = overrides.budgetRange || { min: 30000, max: 50000 };
  
  rfq.createdAt = overrides.createdAt || new Date('2024-02-28');
  rfq.updatedAt = overrides.updatedAt || new Date();
  rfq.createdBy = overrides.createdBy || 'procurement-manager-001';
  
  return rfq;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function createMockDate(daysFromNow: number = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
}

export function createMockFinancialData() {
  return {
    totalSpend: Math.floor(Math.random() * 10000000) + 1000000, // $1M - $11M
    budgetUtilization: Math.floor(Math.random() * 40) + 60, // 60% - 100%
    costSavings: Math.floor(Math.random() * 500000) + 50000, // $50K - $550K
    avgOrderValue: Math.floor(Math.random() * 10000) + 1000, // $1K - $11K
  };
}

export function createMockPerformanceMetrics() {
  return {
    deliveryPerformance: Math.floor(Math.random() * 20) + 80, // 80% - 100%
    qualityRating: Math.floor(Math.random() * 20) + 80, // 80 - 100
    complianceRate: Math.floor(Math.random() * 15) + 85, // 85% - 100%
    sustainabilityScore: Math.floor(Math.random() * 30) + 70, // 70 - 100
  };
}

export function createMockRiskData() {
  const riskLevels: SupplierRiskLevel[] = [
    SupplierRiskLevel.LOW,
    SupplierRiskLevel.MEDIUM,
    SupplierRiskLevel.HIGH,
    SupplierRiskLevel.CRITICAL,
  ];
  
  return {
    riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
    riskScore: Math.floor(Math.random() * 100),
    riskFactors: [
      'Financial instability',
      'Geographic concentration',
      'Single source dependency',
      'Regulatory compliance',
      'Cybersecurity vulnerabilities',
    ].slice(0, Math.floor(Math.random() * 3) + 1),
  };
}

// ============================================================================
// BULK DATA GENERATORS
// ============================================================================

export function generateMockDashboardData() {
  return {
    financial: createMockFinancialData(),
    operational: {
      totalOrders: Math.floor(Math.random() * 1000) + 500,
      automationRate: Math.floor(Math.random() * 30) + 70, // 70% - 100%
      avgProcessingTime: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
      onTimeDeliveryRate: Math.floor(Math.random() * 20) + 80, // 80% - 100%
    },
    performance: createMockPerformanceMetrics(),
    risk: createMockRiskData(),
    suppliers: {
      totalSuppliers: Math.floor(Math.random() * 200) + 100,
      activeSuppliers: Math.floor(Math.random() * 150) + 80,
      strategicSuppliers: Math.floor(Math.random() * 20) + 10,
    },
    sustainability: {
      overallScore: Math.floor(Math.random() * 30) + 70,
      sustainableSpendPercentage: Math.floor(Math.random() * 40) + 60,
      environmentalImpact: Math.floor(Math.random() * 25) + 75,
      socialResponsibility: Math.floor(Math.random() * 20) + 80,
    },
    generatedAt: new Date(),
  };
}

export function createMockAnalyticsReport(type: string = 'financial') {
  return {
    id: generateUUID(),
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Analysis Report`,
    type,
    data: generateMockDashboardData(),
    generatedAt: new Date(),
    status: 'completed',
    downloadUrl: `/reports/${generateUUID()}.pdf`,
    expiresAt: createMockDate(30), // 30 days from now
  };
}
