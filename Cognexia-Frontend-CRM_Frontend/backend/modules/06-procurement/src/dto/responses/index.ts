import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  SupplierStatus, 
  SupplierType, 
  RiskLevel as SupplierRiskLevel 
} from '../../entities/supplier.entity';
import { 
  OrderStatus, 
  OrderType, 
  Priority as OrderPriority 
} from '../../entities/purchase-order.entity';
import { 
  ContractStatus, 
  ContractType, 
  RiskLevel as ContractRiskLevel 
} from '../../entities/contract.entity';
import { 
  RFQStatus, 
  RFQType 
} from '../../entities/rfq.entity';

// ============================================================================
// COMMON RESPONSE TYPES
// ============================================================================

export class ApiResponseDto<T = any> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiPropertyOptional()
  data?: T;

  @ApiPropertyOptional()
  errors?: string[];

  @ApiProperty()
  timestamp: Date;

  @ApiPropertyOptional()
  requestId?: string;

  constructor(success: boolean, message: string, data?: T, errors?: string[]) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.errors = errors;
    this.timestamp = new Date();
  }
}

export class PaginatedResponseDto<T = any> {
  @ApiProperty()
  items: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPreviousPage: boolean;

  constructor(items: T[], total: number, page: number, limit: number) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNextPage = page < this.totalPages;
    this.hasPreviousPage = page > 1;
  }
}

export class PerformanceMetricsDto {
  @ApiProperty()
  executionTime: number;

  @ApiProperty()
  cacheHit: boolean;

  @ApiProperty()
  dataSource: string;

  @ApiProperty()
  recordsProcessed: number;

  @ApiPropertyOptional()
  additionalMetrics?: Record<string, any>;
}

// ============================================================================
// SUPPLIER MANAGEMENT RESPONSE DTOs
// ============================================================================

export class ContactInfoResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  position?: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  department?: string;

  @ApiProperty()
  isPrimary: boolean;

  @ApiProperty()
  isActive: boolean;
}

export class AddressResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  street: string;

  @ApiProperty()
  city: string;

  @ApiPropertyOptional()
  state?: string;

  @ApiProperty()
  postalCode: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  isHeadquarters: boolean;

  @ApiPropertyOptional()
  timezone?: string;
}

export class SupplierResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: SupplierType })
  type: SupplierType;

  @ApiProperty({ enum: SupplierStatus })
  status: SupplierStatus;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [String] })
  categories: string[];

  @ApiProperty({ type: AddressResponseDto })
  address: AddressResponseDto;

  @ApiProperty({ type: [ContactInfoResponseDto] })
  contactInfo: ContactInfoResponseDto[];

  @ApiPropertyOptional()
  taxId?: string;

  @ApiPropertyOptional()
  businessLicense?: string;

  @ApiPropertyOptional()
  website?: string;

  @ApiProperty({ type: [String] })
  certifications: string[];

  @ApiProperty({ type: [String] })
  capabilities: string[];

  @ApiProperty({ type: [String] })
  regions: string[];

  @ApiProperty({ enum: SupplierRiskLevel })
  riskLevel: SupplierRiskLevel;

  @ApiProperty()
  riskScore: number;

  @ApiProperty()
  performanceScore: number;

  @ApiProperty()
  qualityRating: number;

  @ApiProperty()
  deliveryRating: number;

  @ApiProperty()
  sustainabilityScore: number;

  @ApiProperty()
  totalSpend: number;

  @ApiProperty()
  contractsCount: number;

  @ApiProperty()
  lastOrderDate?: Date;

  @ApiProperty()
  onboardedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  onboardedBy?: string;

  @ApiPropertyOptional()
  qualityStandards?: Record<string, any>;

  @ApiPropertyOptional()
  sustainabilityMetrics?: Record<string, any>;

  @ApiPropertyOptional()
  financialInfo?: Record<string, any>;
}

export class SupplierPerformanceReportDto {
  @ApiProperty()
  supplierId: string;

  @ApiProperty()
  supplierName: string;

  @ApiProperty()
  reportPeriod: {
    startDate: Date;
    endDate: Date;
  };

  @ApiProperty()
  overallScore: number;

  @ApiProperty()
  metrics: {
    deliveryPerformance: {
      onTimeDeliveryRate: number;
      averageDeliveryTime: number;
      deliveryReliabilityScore: number;
    };
    qualityMetrics: {
      qualityScore: number;
      defectRate: number;
      returnRate: number;
      complianceScore: number;
    };
    financialMetrics: {
      totalSpend: number;
      paymentTermsCompliance: number;
      costEfficiency: number;
      priceCompetitiveness: number;
    };
    riskAssessment: {
      riskScore: number;
      riskLevel: SupplierRiskLevel;
      riskFactors: string[];
      mitigationActions: string[];
    };
    sustainabilityMetrics: {
      sustainabilityScore: number;
      environmentalImpact: number;
      socialResponsibility: number;
      governanceScore: number;
    };
  };

  @ApiProperty()
  trends: {
    performanceTrend: 'improving' | 'declining' | 'stable';
    riskTrend: 'increasing' | 'decreasing' | 'stable';
    costTrend: 'increasing' | 'decreasing' | 'stable';
  };

  @ApiProperty()
  recommendations: string[];

  @ApiProperty()
  aiInsights: string[];

  @ApiProperty()
  benchmarkComparison: {
    industryAverage: number;
    peerRanking: number;
    totalPeers: number;
  };

  @ApiProperty()
  generatedAt: Date;

  @ApiPropertyOptional()
  generatedBy?: string;
}

export class SupplierDiscoveryResultDto {
  @ApiProperty({ type: [SupplierResponseDto] })
  recommendedSuppliers: SupplierResponseDto[];

  @ApiProperty()
  matchingCriteria: {
    categoryMatch: number;
    capabilityMatch: number;
    regionMatch: number;
    qualityMatch: number;
    deliveryMatch: number;
    sustainabilityMatch: number;
    overallMatch: number;
  };

  @ApiProperty()
  aiRecommendations: {
    primaryChoice: {
      supplierId: string;
      matchScore: number;
      reasons: string[];
    };
    alternatives: Array<{
      supplierId: string;
      matchScore: number;
      reasons: string[];
    }>;
  };

  @ApiProperty()
  riskAnalysis: {
    overallRisk: SupplierRiskLevel;
    riskFactors: string[];
    mitigationSuggestions: string[];
  };

  @ApiProperty()
  costAnalysis: {
    estimatedCost: number;
    costRange: { min: number; max: number };
    potentialSavings: number;
  };

  @ApiProperty()
  discoveryMetadata: {
    searchId: string;
    processedAt: Date;
    totalCandidates: number;
    matchedSuppliers: number;
    algorithmVersion: string;
  };
}

export class SupplierAnalyticsDashboardDto {
  @ApiProperty()
  timeframe: 'month' | 'quarter' | 'year';

  @ApiProperty()
  summary: {
    totalSuppliers: number;
    activeSuppliers: number;
    newSuppliers: number;
    inactiveSuppliers: number;
    avgPerformanceScore: number;
    avgRiskScore: number;
    totalSpend: number;
  };

  @ApiProperty()
  performanceMetrics: {
    topPerformers: Array<{
      supplierId: string;
      name: string;
      performanceScore: number;
    }>;
    underPerformers: Array<{
      supplierId: string;
      name: string;
      performanceScore: number;
      issues: string[];
    }>;
    performanceDistribution: {
      excellent: number;
      good: number;
      average: number;
      poor: number;
    };
  };

  @ApiProperty()
  riskAnalysis: {
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    topRisks: string[];
    newRisks: string[];
    mitigatedRisks: string[];
  };

  @ApiProperty()
  categoryAnalysis: Array<{
    category: string;
    supplierCount: number;
    totalSpend: number;
    avgPerformance: number;
    avgRisk: number;
  }>;

  @ApiProperty()
  geographicAnalysis: Array<{
    region: string;
    supplierCount: number;
    totalSpend: number;
    avgPerformance: number;
  }>;

  @ApiProperty()
  trends: {
    supplierGrowth: Array<{ period: string; count: number }>;
    performanceTrend: Array<{ period: string; score: number }>;
    spendTrend: Array<{ period: string; amount: number }>;
    riskTrend: Array<{ period: string; score: number }>;
  };

  @ApiProperty()
  insights: string[];

  @ApiProperty()
  generatedAt: Date;
}

// ============================================================================
// CONTRACT MANAGEMENT RESPONSE DTOs
// ============================================================================

export class ContractTermResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  value: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  isNegotiable: boolean;

  @ApiProperty()
  isStandard: boolean;

  @ApiPropertyOptional()
  lastModifiedAt?: Date;

  @ApiPropertyOptional()
  modifiedBy?: string;
}

export class ContractResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ enum: ContractType })
  contractType: ContractType;

  @ApiProperty({ enum: ContractStatus })
  status: ContractStatus;

  @ApiProperty()
  supplierId: string;

  @ApiProperty()
  supplierName: string;

  @ApiProperty()
  totalValue: number;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty({ type: [ContractTermResponseDto] })
  terms: ContractTermResponseDto[];

  @ApiProperty({ enum: ContractRiskLevel })
  riskLevel: ContractRiskLevel;

  @ApiProperty()
  riskScore: number;

  @ApiProperty()
  performanceScore: number;

  @ApiProperty()
  complianceScore: number;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ type: [String] })
  attachments: string[];

  @ApiProperty()
  renewalOptions: {
    autoRenewal: boolean;
    renewalTerm: number;
    renewalNotice: number;
  };

  @ApiProperty()
  financialTerms: {
    paymentTerms: number;
    penaltyClause: boolean;
    discountTerms: number;
  };

  @ApiProperty()
  deliveryTerms: {
    deliveryTime: number;
    deliveryLocation: string;
    shippingTerms: string;
  };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  createdBy?: string;

  @ApiPropertyOptional()
  lastModifiedBy?: string;

  @ApiPropertyOptional()
  customFields?: Record<string, any>;

  @ApiPropertyOptional()
  blockchainHash?: string;

  @ApiPropertyOptional()
  blockchainTxId?: string;

  @ApiProperty()
  isBlockchainEnabled: boolean;
}

export class ContractAnalysisDto {
  @ApiProperty()
  contractId: string;

  @ApiProperty()
  analysisType: 'risk' | 'performance' | 'compliance' | 'financial';

  @ApiProperty()
  overallScore: number;

  @ApiProperty()
  riskAssessment: {
    riskLevel: ContractRiskLevel;
    riskScore: number;
    riskFactors: Array<{
      factor: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendation: string;
    }>;
    mitigationStrategies: string[];
  };

  @ApiProperty()
  performanceAnalysis: {
    performanceScore: number;
    kpiMetrics: Array<{
      metric: string;
      value: number;
      target: number;
      status: 'above' | 'on-track' | 'below';
    }>;
    trends: Array<{
      period: string;
      score: number;
    }>;
  };

  @ApiProperty()
  complianceAnalysis: {
    complianceScore: number;
    complianceIssues: string[];
    regulatoryRequirements: string[];
    recommendations: string[];
  };

  @ApiProperty()
  financialAnalysis: {
    costEfficiency: number;
    budgetVariance: number;
    roi: number;
    costSavingsOpportunities: Array<{
      opportunity: string;
      potentialSavings: number;
      implementation: string;
    }>;
  };

  @ApiProperty()
  aiInsights: string[];

  @ApiProperty()
  benchmarkComparison: {
    industryBenchmark: number;
    peerComparison: number;
    marketPosition: 'leading' | 'competitive' | 'lagging';
  };

  @ApiProperty()
  analyzedAt: Date;

  @ApiPropertyOptional()
  analyzedBy?: string;
}

export class ContractAnalyticsDto {
  @ApiProperty()
  timeframe: 'month' | 'quarter' | 'year';

  @ApiProperty()
  summary: {
    totalContracts: number;
    activeContracts: number;
    expiringContracts: number;
    totalValue: number;
    avgContractValue: number;
    avgRiskScore: number;
    avgPerformanceScore: number;
  };

  @ApiProperty()
  statusDistribution: {
    active: number;
    pending: number;
    expired: number;
    terminated: number;
    draft: number;
  };

  @ApiProperty()
  typeDistribution: Array<{
    type: ContractType;
    count: number;
    totalValue: number;
  }>;

  @ApiProperty()
  riskAnalysis: {
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    topRisks: string[];
    riskTrends: Array<{
      period: string;
      avgRiskScore: number;
    }>;
  };

  @ApiProperty()
  performanceMetrics: {
    topPerformers: Array<{
      contractId: string;
      supplierName: string;
      performanceScore: number;
    }>;
    underPerformers: Array<{
      contractId: string;
      supplierName: string;
      performanceScore: number;
      issues: string[];
    }>;
    performanceTrends: Array<{
      period: string;
      avgPerformanceScore: number;
    }>;
  };

  @ApiProperty()
  expirationAnalysis: {
    expiring30Days: number;
    expiring90Days: number;
    expiring180Days: number;
    expiringThisYear: number;
    renewalPipeline: Array<{
      contractId: string;
      supplierName: string;
      expirationDate: Date;
      value: number;
    }>;
  };

  @ApiProperty()
  financialAnalysis: {
    totalSpend: number;
    avgSpend: number;
    spendByCategory: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    costTrends: Array<{
      period: string;
      amount: number;
    }>;
  };

  @ApiProperty()
  insights: string[];

  @ApiProperty()
  generatedAt: Date;
}

// ============================================================================
// PURCHASE ORDER RESPONSE DTOs
// ============================================================================

export class LineItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  totalPrice: number;

  @ApiPropertyOptional()
  unit?: string;

  @ApiPropertyOptional()
  category?: string;

  @ApiPropertyOptional()
  requiredDate?: Date;

  @ApiPropertyOptional()
  deliveredQuantity?: number;

  @ApiProperty()
  status: 'pending' | 'ordered' | 'received' | 'cancelled';

  @ApiPropertyOptional()
  specifications?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PurchaseOrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ enum: OrderType })
  type: OrderType;

  @ApiProperty({ enum: OrderPriority })
  priority: OrderPriority;

  @ApiProperty()
  supplierId: string;

  @ApiProperty()
  supplierName: string;

  @ApiProperty({ type: [LineItemResponseDto] })
  items: LineItemResponseDto[];

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  taxAmount: number;

  @ApiProperty()
  grandTotal: number;

  @ApiPropertyOptional()
  department?: string;

  @ApiPropertyOptional()
  requestedBy?: string;

  @ApiPropertyOptional()
  approvedBy?: string;

  @ApiPropertyOptional()
  requiredBy?: Date;

  @ApiPropertyOptional()
  deliveredAt?: Date;

  @ApiProperty()
  isAutonomous: boolean;

  @ApiProperty()
  aiOptimized: boolean;

  @ApiProperty()
  optimizationScore: number;

  @ApiProperty()
  riskScore: number;

  @ApiProperty()
  complianceScore: number;

  @ApiPropertyOptional()
  deliveryInstructions?: Record<string, any>;

  @ApiPropertyOptional()
  approvalMatrix?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  blockchainHash?: string;

  @ApiPropertyOptional()
  blockchainTxId?: string;

  @ApiProperty()
  isBlockchainEnabled: boolean;
}

export class AutoPOResultDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  purchaseOrderId?: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  processingDetails: {
    requestId: string;
    processedAt: Date;
    processingTime: number;
    aiDecisionScore: number;
    supplierSelectionReason: string[];
    optimizationApplied: boolean;
    riskAssessmentPassed: boolean;
  };

  @ApiProperty()
  selectedSupplier: {
    supplierId: string;
    supplierName: string;
    selectionScore: number;
    selectionReasons: string[];
  };

  @ApiProperty()
  costAnalysis: {
    originalEstimate: number;
    optimizedCost: number;
    potentialSavings: number;
    savingsPercentage: number;
  };

  @ApiProperty()
  riskAnalysis: {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: string[];
    mitigationActions: string[];
  };

  @ApiProperty()
  alternatives: Array<{
    supplierId: string;
    supplierName: string;
    estimatedCost: number;
    deliveryTime: number;
    score: number;
  }>;

  @ApiProperty()
  nextSteps: string[];

  @ApiPropertyOptional()
  errors?: string[];

  @ApiPropertyOptional()
  warnings?: string[];
}

export class ConsolidationOpportunityDto {
  @ApiProperty()
  consolidationId: string;

  @ApiProperty()
  potentialSavings: number;

  @ApiProperty()
  savingsPercentage: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  candidateOrders: Array<{
    orderId: string;
    department: string;
    amount: number;
    requiredBy: Date;
    supplier: string;
  }>;

  @ApiProperty()
  recommendedActions: string[];

  @ApiProperty()
  riskFactors: string[];

  @ApiProperty()
  implementationSteps: string[];

  @ApiProperty()
  estimatedImplementationTime: number;

  @ApiProperty()
  priority: 'high' | 'medium' | 'low';

  @ApiProperty()
  analyzedAt: Date;
}

export class AutonomousProcessingAnalyticsDto {
  @ApiProperty()
  timeframe: 'day' | 'week' | 'month' | 'quarter';

  @ApiProperty()
  volume: {
    totalRequests: number;
    processedAutonomously: number;
    manualInterventions: number;
    automationRate: number;
  };

  @ApiProperty()
  performance: {
    avgProcessingTime: number;
    avgDecisionAccuracy: number;
    successRate: number;
    errorRate: number;
  };

  @ApiProperty()
  savings: {
    totalSavings: number;
    avgSavingsPerOrder: number;
    timeReduction: number;
    costReduction: number;
  };

  @ApiProperty()
  supplierSelection: {
    aiRecommendationAcceptance: number;
    supplierDiversityScore: number;
    topSelectedSuppliers: Array<{
      supplierId: string;
      name: string;
      selectionCount: number;
      avgScore: number;
    }>;
  };

  @ApiProperty()
  riskManagement: {
    avgRiskScore: number;
    riskPreventions: number;
    issuesDetected: number;
    issuesResolved: number;
  };

  @ApiProperty()
  trends: {
    volumeTrend: Array<{ period: string; count: number }>;
    performanceTrend: Array<{ period: string; score: number }>;
    savingsTrend: Array<{ period: string; amount: number }>;
  };

  @ApiProperty()
  insights: string[];

  @ApiProperty()
  generatedAt: Date;
}

// ============================================================================
// ANALYTICS DASHBOARD RESPONSE DTOs
// ============================================================================

export class DashboardMetricsDto {
  @ApiProperty()
  timeframe: 'day' | 'week' | 'month' | 'quarter' | 'year';

  @ApiProperty()
  financial: {
    totalSpend: number;
    budgetUtilization: number;
    costSavings: number;
    avgOrderValue: number;
    spendByCategory: Array<{ category: string; amount: number; percentage: number }>;
    spendTrend: Array<{ period: string; amount: number }>;
  };

  @ApiProperty()
  operational: {
    totalOrders: number;
    avgProcessingTime: number;
    automationRate: number;
    onTimeDeliveryRate: number;
    ordersByStatus: Array<{ status: OrderStatus; count: number }>;
    processingTrend: Array<{ period: string; time: number }>;
  };

  @ApiProperty()
  supplier: {
    totalSuppliers: number;
    activeSuppliers: number;
    strategicSuppliers: number;
    avgSupplierRating: number;
    suppliersByRisk: Array<{ risk: SupplierRiskLevel; count: number }>;
    topSuppliers: Array<{ id: string; name: string; score: number; spend: number }>;
  };

  @ApiProperty()
  contracts: {
    totalContracts: number;
    activeContracts: number;
    expiringContracts: number;
    avgContractValue: number;
    contractsByStatus: Array<{ status: ContractStatus; count: number }>;
    renewalPipeline: Array<{ month: string; count: number; value: number }>;
  };

  @ApiProperty()
  performance: {
    overallScore: number;
    deliveryPerformance: number;
    qualityRating: number;
    complianceRate: number;
    performanceTrend: Array<{ period: string; score: number }>;
  };

  @ApiProperty()
  risk: {
    overallRiskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    risksByCategory: Array<{ category: string; score: number }>;
    riskTrend: Array<{ period: string; score: number }>;
    topRisks: string[];
  };

  @ApiProperty()
  sustainability: {
    overallScore: number;
    sustainableSpendPercentage: number;
    environmentalImpact: number;
    socialResponsibility: number;
    sustainabilityTrend: Array<{ period: string; score: number }>;
  };

  @ApiProperty()
  marketIntelligence: {
    marketConditions: 'favorable' | 'neutral' | 'challenging';
    priceVolatility: number;
    supplyRisk: number;
    demandForecast: Array<{ category: string; forecast: 'increasing' | 'stable' | 'decreasing' }>;
  };

  @ApiProperty()
  aiInsights: string[];

  @ApiProperty()
  alerts: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    message: string;
    timestamp: Date;
  }>;

  @ApiProperty()
  generatedAt: Date;
}

export class DashboardAlertDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  severity: 'low' | 'medium' | 'high' | 'critical';

  @ApiProperty()
  category: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  details: Record<string, any>;

  @ApiProperty()
  threshold: {
    metric: string;
    threshold: number;
    currentValue: number;
  };

  @ApiProperty()
  recommendedActions: string[];

  @ApiProperty()
  isAcknowledged: boolean;

  @ApiProperty()
  acknowledgedBy?: string;

  @ApiProperty()
  acknowledgedAt?: Date;

  @ApiProperty()
  isResolved: boolean;

  @ApiProperty()
  resolvedBy?: string;

  @ApiProperty()
  resolvedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CustomReportDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  format: 'excel' | 'pdf' | 'csv' | 'json';

  @ApiProperty()
  status: 'pending' | 'generating' | 'completed' | 'failed';

  @ApiProperty()
  data: any;

  @ApiProperty()
  metadata: {
    recordCount: number;
    generationTime: number;
    dataSource: string;
    filters: Record<string, any>;
    columns: string[];
  };

  @ApiPropertyOptional()
  downloadUrl?: string;

  @ApiProperty()
  expiresAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  generatedAt?: Date;

  @ApiPropertyOptional()
  generatedBy?: string;
}

export class BenchmarkDataDto {
  @ApiProperty()
  category: string;

  @ApiPropertyOptional()
  region?: string;

  @ApiPropertyOptional()
  industry?: string;

  @ApiProperty()
  benchmarks: {
    pricing: {
      marketAverage: number;
      industryAverage: number;
      yourPosition: number;
      percentile: number;
    };
    delivery: {
      marketAverage: number;
      industryAverage: number;
      yourPosition: number;
      percentile: number;
    };
    quality: {
      marketAverage: number;
      industryAverage: number;
      yourPosition: number;
      percentile: number;
    };
    sustainability: {
      marketAverage: number;
      industryAverage: number;
      yourPosition: number;
      percentile: number;
    };
  };

  @ApiProperty()
  insights: {
    strengths: string[];
    improvements: string[];
    opportunities: string[];
    threats: string[];
  };

  @ApiProperty()
  recommendations: string[];

  @ApiProperty()
  dataQuality: {
    coverage: number;
    recency: Date;
    reliability: number;
  };

  @ApiProperty()
  generatedAt: Date;
}

// ============================================================================
// AI AND MARKET INTELLIGENCE RESPONSE DTOs
// ============================================================================

export class MarketIntelligenceDto {
  @ApiProperty()
  category: string;

  @ApiProperty()
  region: string;

  @ApiProperty()
  marketConditions: {
    overall: 'favorable' | 'neutral' | 'challenging';
    priceIndex: number;
    volatility: number;
    supplyAvailability: 'abundant' | 'adequate' | 'limited' | 'scarce';
    demandLevel: 'low' | 'moderate' | 'high' | 'very-high';
  };

  @ApiProperty()
  priceAnalysis: {
    currentPrice: number;
    priceChange: number;
    priceChangePercentage: number;
    priceRange: { min: number; max: number };
    priceForecast: Array<{ period: string; price: number }>;
  };

  @ApiProperty()
  supplierAnalysis: {
    totalSuppliers: number;
    activeSuppliers: number;
    newSuppliers: number;
    supplierConcentration: number;
    topSuppliers: Array<{
      name: string;
      marketShare: number;
      reliability: number;
    }>;
  };

  @ApiProperty()
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: Array<{
      factor: string;
      impact: 'low' | 'medium' | 'high';
      probability: 'low' | 'medium' | 'high';
      mitigation: string;
    }>;
    geopoliticalRisk: number;
    weatherRisk: number;
    economicRisk: number;
  };

  @ApiProperty()
  recommendations: string[];

  @ApiProperty()
  forecast: Array<{
    period: string;
    price: number;
    demand: number;
    supply: number;
    risk: number;
  }>;

  @ApiProperty()
  lastUpdated: Date;

  @ApiProperty()
  dataQuality: number;

  @ApiProperty()
  sources: string[];
}

export class AIInsightsDto {
  @ApiProperty()
  insightType: 'market' | 'supplier' | 'contract' | 'purchasing' | 'risk' | 'performance';

  @ApiProperty()
  priority: 'high' | 'medium' | 'low';

  @ApiProperty()
  confidence: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  impact: {
    financial: number;
    operational: number;
    risk: number;
  };

  @ApiProperty()
  recommendations: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    timeline: string;
    expectedBenefit: string;
  }>;

  @ApiProperty()
  supportingData: Record<string, any>;

  @ApiProperty()
  generatedAt: Date;

  @ApiProperty()
  validUntil?: Date;

  @ApiProperty()
  modelVersion: string;
}

// ============================================================================
// BLOCKCHAIN RESPONSE DTOs
// ============================================================================

export class BlockchainTransactionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  entityId: string;

  @ApiProperty()
  entityType: 'purchase-order' | 'contract' | 'supplier' | 'payment';

  @ApiProperty()
  transactionHash: string;

  @ApiProperty()
  blockNumber: number;

  @ApiProperty()
  blockHash: string;

  @ApiProperty()
  network: string;

  @ApiProperty()
  status: 'pending' | 'confirmed' | 'failed';

  @ApiProperty()
  gasUsed: number;

  @ApiProperty()
  gasCost: number;

  @ApiProperty()
  dataHash: string;

  @ApiProperty()
  smartContractAddress?: string;

  @ApiProperty()
  verificationStatus: 'verified' | 'pending' | 'failed' | 'not-verified';

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  confirmedAt?: Date;
}

export class DataVerificationResultDto {
  @ApiProperty()
  entityId: string;

  @ApiProperty()
  entityType: string;

  @ApiProperty()
  isValid: boolean;

  @ApiProperty()
  verificationDetails: {
    localDataHash: string;
    blockchainDataHash: string;
    hashMatch: boolean;
    timestampMatch: boolean;
    signatureValid: boolean;
  };

  @ApiProperty()
  discrepancies: string[];

  @ApiProperty()
  lastVerified: Date;

  @ApiProperty()
  verificationScore: number;

  @ApiProperty()
  recommendations: string[];
}

// ============================================================================
// SYSTEM RESPONSE DTOs
// ============================================================================

export class SystemHealthDto {
  @ApiProperty()
  status: 'healthy' | 'degraded' | 'unhealthy';

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  services: Record<string, 'operational' | 'degraded' | 'down'>;

  @ApiProperty()
  metrics: {
    uptime: string;
    responseTime: string;
    throughput: string;
    errorRate: string;
  };

  @ApiProperty()
  integrations: Record<string, 'connected' | 'disconnected' | 'error'>;

  @ApiProperty()
  alerts: Array<{
    service: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: Date;
  }>;
}

export class SystemConfigurationDto {
  @ApiProperty()
  version: string;

  @ApiProperty()
  features: Record<string, boolean>;

  @ApiProperty()
  limits: {
    maxBatchSize: number;
    maxReportRows: number;
    maxFileSize: string;
    rateLimit: string;
  };

  @ApiProperty()
  integrations: Record<string, 'configured' | 'not_configured' | 'error'>;

  @ApiProperty()
  environment: string;

  @ApiProperty()
  lastUpdated: Date;
}

export class MetricsSummaryDto {
  @ApiProperty()
  financial: {
    totalSpend: number;
    costSavings: number;
    budgetUtilization: number;
  };

  @ApiProperty()
  operational: {
    totalOrders: number;
    automationRate: number;
    averageProcessingTime: number;
  };

  @ApiProperty()
  suppliers: {
    totalSuppliers: number;
    activeSuppliers: number;
    strategicSuppliers: number;
  };

  @ApiProperty()
  performance: {
    overallScore: number;
    deliveryPerformance: number;
    qualityRating: number;
  };

  @ApiProperty()
  risk: {
    overallRiskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };

  @ApiProperty()
  sustainability: {
    overallScore: number;
    sustainableSpendPercentage: number;
  };

  @ApiProperty()
  generatedAt: Date;
}

// Export all response DTOs for easy importing
export * from './supplier.response.dto';
export * from './contract.response.dto';
export * from './purchase-order.response.dto';
export * from './analytics.response.dto';
