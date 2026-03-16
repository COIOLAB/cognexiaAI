/**
 * Frontend Integration Guide - Procurement Module
 * Industry 5.0 ERP System
 * 
 * Complete API reference and integration guide for frontend developers
 * to integrate with the procurement management system.
 */

# Procurement Module - Frontend Integration Guide

## 🚀 Overview

The Procurement Module provides comprehensive APIs for managing the entire procurement lifecycle with Industry 5.0 capabilities including AI intelligence, blockchain integration, real-time analytics, and autonomous operations.

## 📋 Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [API Base URL & Versioning](#api-base-url--versioning)
3. [Error Handling](#error-handling)
4. [Standard Response Format](#standard-response-format)
5. [RFQ Management](#rfq-management)
6. [Contract Management](#contract-management)
7. [Vendor Management](#vendor-management)
8. [Requisition Management](#requisition-management)
9. [Analytics & Reporting](#analytics--reporting)
10. [Real-Time Features](#real-time-features)
11. [File Upload & Download](#file-upload--download)
12. [Frontend SDK](#frontend-sdk)

## 🔐 Authentication & Authorization

### JWT Bearer Authentication
All endpoints require JWT Bearer token authentication:

```javascript
// Headers for all API calls
const headers = {
  'Authorization': `Bearer ${jwtToken}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};
```

### Required Roles
- `PROCUREMENT_USER`: Basic procurement operations
- `PROCUREMENT_MANAGER`: Advanced operations and approvals
- `PROCUREMENT_ADMIN`: Full system access
- `SYSTEM_ADMIN`: Complete administrative access

## 🌐 API Base URL & Versioning

```
Base URL: https://api.yourdomain.com/api/v1
Procurement Routes: /procurement/*
```

## 🚨 Error Handling

### Standard Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
    suggestions?: string[];
    recoveryActions?: string[];
  };
}
```

### Common Error Codes

- `PROCUREMENT_VALIDATION_ERROR`: Input validation failed
- `RFQ_NOT_FOUND`: RFQ not found
- `CONTRACT_NOT_FOUND`: Contract not found
- `VENDOR_NOT_FOUND`: Vendor not found
- `INSUFFICIENT_BUDGET`: Budget validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `RATE_LIMIT_EXCEEDED`: Too many requests

## ✅ Standard Response Format

### Success Response

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  message: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
```

## 📝 RFQ Management

### Create RFQ

```javascript
POST /procurement/rfq

// Request Body
const createRFQRequest = {
  title: "Software Development Services",
  description: "Full-stack development for enterprise application",
  type: "SERVICES", // GOODS, SERVICES, CONSTRUCTION
  priority: "HIGH", // LOW, MEDIUM, HIGH, CRITICAL
  items: [
    {
      name: "Frontend Development",
      description: "React/TypeScript frontend development",
      quantity: 1,
      unit: "project",
      estimatedUnitPrice: 50000.00,
      specifications: {
        framework: "React",
        language: "TypeScript",
        duration: "6 months"
      },
      category: "Software Development"
    }
  ],
  totalBudget: 100000.00,
  currency: "USD",
  submissionDeadline: "2024-12-31T23:59:59Z",
  evaluationCriteria: [
    {
      name: "Technical Expertise",
      description: "Team's technical capabilities",
      weight: 40
    },
    {
      name: "Cost",
      description: "Total project cost",
      weight: 30
    },
    {
      name: "Timeline",
      description: "Project completion timeline",
      weight: 30
    }
  ],
  departmentId: "dept-001",
  createdBy: "user-001"
};

// Response includes AI optimizations
const response = {
  success: true,
  data: {
    id: "rfq-123",
    rfqNumber: "RFQ-2024-001234",
    status: "DRAFT",
    aiOptimizations: {
      suggestedCategories: ["Software Development", "IT Services"],
      budgetAnalysis: {
        feasibilityScore: 0.85,
        marketRange: { min: 80000, max: 120000 }
      },
      timelineOptimization: {
        suggestedDeadline: "2024-12-15T23:59:59Z",
        reasoningExplanation: "Market analysis suggests shorter deadlines increase response rates"
      }
    },
    marketIntelligence: {
      averageMarketPrice: 95000,
      supplierCount: 23,
      competitiveIndex: 0.78
    },
    supplierRecommendations: [
      {
        supplierId: "vendor-456",
        matchScore: 0.92,
        capabilities: ["React", "TypeScript", "Enterprise"],
        pastPerformance: 4.8
      }
    ],
    blockchainHash: "0x1234567890abcdef"
  },
  message: "RFQ created successfully with AI optimization"
};
```

### Get All RFQs with Filters

```javascript
GET /procurement/rfq?status=ACTIVE&type=SERVICES&page=1&limit=10

// Query Parameters
const queryParams = {
  status: 'ACTIVE', // DRAFT, PUBLISHED, ACTIVE, CLOSED, CANCELLED, AWARDED
  type: 'SERVICES', // GOODS, SERVICES, CONSTRUCTION
  priority: 'HIGH', // LOW, MEDIUM, HIGH, CRITICAL
  departmentId: 'dept-001',
  createdBy: 'user-001',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  search: 'software development',
  page: 1,
  limit: 10
};

// Response with AI insights
const response = {
  success: true,
  data: {
    data: [
      {
        id: "rfq-123",
        rfqNumber: "RFQ-2024-001234",
        title: "Software Development Services",
        status: "ACTIVE",
        aiInsights: {
          performanceScore: 8.5,
          competitiveAnalysis: {
            marketPosition: "strong",
            expectedResponseRate: 0.75
          },
          optimizationSuggestions: [
            "Consider volume discounts for multi-phase projects"
          ]
        },
        daysToDeadline: 45,
        responseRate: 0.68,
        bidsReceived: 8
      }
    ],
    meta: {
      page: 1,
      limit: 10,
      total: 156,
      totalPages: 16
    }
  },
  message: "RFQs retrieved successfully"
};
```

### RFQ Lifecycle Operations

```javascript
// Publish RFQ
POST /procurement/rfq/{id}/publish
{
  publishedBy: "user-001",
  notifications: true,
  customMessage: "Please submit your proposals by the deadline"
}

// Evaluate RFQ
POST /procurement/rfq/{id}/evaluate
{
  evaluatedBy: "user-001",
  autoRanking: true,
  evaluationNotes: "All bids reviewed according to criteria"
}

// Award RFQ
POST /procurement/rfq/{id}/award
{
  supplierId: "vendor-456",
  awardedBy: "user-001",
  awardValue: 95000.00,
  currency: "USD",
  awardDate: "2024-06-15T10:00:00Z",
  conditions: ["Net 30 payment terms", "Milestone-based deliveries"],
  justification: "Best technical proposal with competitive pricing"
}
```

## 📄 Contract Management

### Create Contract

```javascript
POST /procurement/contracts

const createContractRequest = {
  title: "Software Development Service Agreement",
  description: "Master service agreement for software development",
  type: "SERVICE", // SERVICE, GOODS, MIXED
  contractValue: 95000.00,
  currency: "USD",
  duration: "12 months",
  vendorId: "vendor-456",
  createdBy: "user-001",
  terms: {
    paymentTerms: "Net 30",
    deliveryTerms: "Milestone-based delivery",
    warrantyPeriod: "12 months",
    penaltyClause: "5% penalty for delays beyond 30 days"
  },
  paymentTerms: "NET_30", // NET_30, NET_60, ADVANCE, MILESTONE
  startDate: "2024-07-01T00:00:00Z",
  endDate: "2025-06-30T23:59:59Z",
  approvers: ["manager-001", "director-001"],
  reviewers: ["legal-001", "procurement-001"],
  sourceRFQId: "rfq-123"
};

// Response with AI analysis
const response = {
  success: true,
  data: {
    id: "contract-789",
    contractNumber: "CTR-2024-001234",
    status: "DRAFT",
    aiAnalysis: {
      riskScore: 0.25, // Low risk
      complianceScore: 0.95, // High compliance
      suggestionSummary: "Contract terms are well-balanced",
      potentialIssues: [],
      recommendedClauses: ["Force majeure", "Intellectual property rights"]
    },
    riskAssessment: {
      overallRiskLevel: "LOW",
      riskFactors: [
        { category: "Financial", level: "LOW", score: 0.2 },
        { category: "Operational", level: "MEDIUM", score: 0.4 },
        { category: "Legal", level: "LOW", score: 0.15 }
      ]
    },
    complianceValidation: {
      status: "COMPLIANT",
      checkedRegulations: ["GDPR", "SOX", "Industry Standards"],
      complianceScore: 0.95
    },
    workflow: {
      workflowId: "wf-001",
      currentStage: "LEGAL_REVIEW",
      nextApprover: "legal-001",
      estimatedCompletionDate: "2024-06-30T00:00:00Z"
    },
    blockchainHash: "0xabcdef1234567890"
  },
  message: "Contract created successfully with AI optimization"
};
```

### Contract Operations

```javascript
// Execute Contract
POST /procurement/contracts/{id}/execute
{
  executedBy: "user-001",
  executionDate: "2024-07-01T09:00:00Z",
  notes: "All approvals completed, contract ready for execution"
}

// Renew Contract
POST /procurement/contracts/{id}/renew
{
  renewalPeriod: "12 months",
  newTerms: {
    contractValue: 105000.00,
    paymentTerms: "Net 30"
  },
  renewedBy: "user-001"
}

// Amend Contract
POST /procurement/contracts/{id}/amend
{
  amendmentType: "VALUE_CHANGE",
  changes: {
    contractValue: 110000.00,
    justification: "Additional scope requirements"
  },
  amendedBy: "user-001"
}
```

## 🏢 Vendor Management

### Create Vendor

```javascript
POST /procurement/vendors

const createVendorRequest = {
  companyName: "TechSolutions Inc.",
  registrationNumber: "REG123456789",
  taxId: "TAX987654321",
  industry: "Information Technology",
  categories: ["Software Development", "IT Consulting", "Cloud Services"],
  contactInfo: {
    primaryContact: "John Smith",
    email: "john.smith@techsolutions.com",
    phone: "+1-555-0123",
    website: "https://www.techsolutions.com",
    address: {
      street: "123 Technology Drive",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "USA"
    }
  },
  businessInfo: {
    yearEstablished: 2015,
    numberOfEmployees: 150,
    annualRevenue: 15000000,
    certifications: ["ISO 9001", "SOC 2", "CMMI Level 3"]
  },
  capabilities: {
    technologies: ["React", "Node.js", "Python", "AWS", "Azure"],
    industries: ["Healthcare", "Finance", "Manufacturing"],
    serviceTypes: ["Custom Development", "System Integration", "Consulting"]
  },
  createdBy: "user-001"
};

// Response with AI validation
const response = {
  success: true,
  data: {
    id: "vendor-789",
    vendorNumber: "VEN-2024-001234",
    status: "PENDING_APPROVAL",
    aiValidation: {
      credibilityScore: 0.88,
      riskAssessment: "LOW",
      verificationStatus: "VERIFIED",
      recommendedActions: ["Complete onboarding process", "Request additional certifications"]
    },
    riskAssessment: {
      financialStability: 0.92,
      operationalRisk: 0.15,
      reputationScore: 0.85,
      complianceRisk: 0.10
    },
    marketIntelligence: {
      marketPosition: "Strong competitor",
      averageRating: 4.3,
      projectSuccessRate: 0.91
    },
    onboardingProcess: {
      processId: "onboard-001",
      currentStep: "DOCUMENTATION_REVIEW",
      expectedCompletion: "2024-06-20T00:00:00Z",
      requiredDocuments: ["Insurance Certificate", "Financial Statements"]
    }
  },
  message: "Vendor created successfully with AI validation"
};
```

### Vendor Performance Evaluation

```javascript
POST /procurement/vendors/{id}/evaluate

const evaluationRequest = {
  criteria: [
    { name: "Quality", weight: 30, score: 85 },
    { name: "Delivery", weight: 25, score: 90 },
    { name: "Cost", weight: 25, score: 80 },
    { name: "Service", weight: 20, score: 88 }
  ],
  performanceData: {
    onTimeDelivery: 92,
    qualityRating: 4.2,
    responsiveness: 4.5,
    issueResolution: 4.0
  },
  evaluatedBy: "user-001",
  evaluationPeriod: {
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2024-06-30T23:59:59Z"
  },
  comments: "Excellent performance across all metrics"
};

// AI-powered evaluation response
const response = {
  success: true,
  data: {
    overallScore: 86.5,
    grade: "A",
    aiInsights: {
      strengths: ["Consistent quality delivery", "Excellent communication"],
      improvementAreas: ["Cost optimization opportunities"],
      trendAnalysis: "Performance improving over time",
      futureRecommendations: [
        "Consider for preferred vendor status",
        "Increase contract volume"
      ]
    },
    recommendations: {
      preferredVendorEligible: true,
      contractRenewalRecommendation: "STRONGLY_RECOMMENDED",
      suggestedActions: ["Schedule quarterly reviews", "Negotiate volume discounts"]
    }
  },
  message: "Vendor evaluation completed successfully"
};
```

## 📋 Requisition Management

### Create Requisition

```javascript
POST /procurement/requisitions

const createRequisitionRequest = {
  title: "Office Equipment Requisition",
  description: "Monthly office equipment for development team",
  items: [
    {
      itemId: "item-001",
      name: "Ergonomic Office Chairs",
      description: "High-quality ergonomic chairs for developers",
      quantity: 10,
      estimatedUnitPrice: 350.00,
      specifications: {
        brand: "Herman Miller",
        model: "Aeron",
        warranty: "12 years"
      },
      category: "Office Furniture"
    }
  ],
  totalEstimatedAmount: 3500.00,
  currency: "USD",
  urgency: "MEDIUM", // LOW, MEDIUM, HIGH, CRITICAL
  expectedDeliveryDate: "2024-07-15T00:00:00Z",
  departmentId: "dept-001",
  budgetCategory: "Office Equipment",
  fiscalPeriod: "2024-Q3",
  requestedBy: "user-001",
  justification: "Improving workspace ergonomics for team productivity"
};

// Response with budget validation
const response = {
  success: true,
  data: {
    id: "req-456",
    requisitionNumber: "REQ-2024-001234",
    status: "PENDING_APPROVAL",
    aiOptimization: {
      alternativeItems: [
        {
          name: "Alternative Office Chair",
          estimatedSavings: 500.00,
          qualityScore: 0.85
        }
      ],
      bulkDiscountOpportunities: [
        {
          quantity: 15,
          unitPrice: 320.00,
          totalSavings: 450.00
        }
      ]
    },
    budgetValidation: {
      status: "APPROVED",
      budgetAvailable: 10000.00,
      requestedAmount: 3500.00,
      remainingBudget: 6500.00,
      budgetUtilization: 0.35
    },
    inventoryCheck: {
      availableInStock: 2,
      recommendedQuantity: 8,
      stockLocation: "Warehouse A"
    },
    vendorRecommendations: [
      {
        vendorId: "vendor-123",
        estimatedPrice: 3200.00,
        deliveryTime: 5,
        qualityScore: 0.92
      }
    ],
    approvalWorkflow: {
      workflowId: "approval-001",
      currentApprover: "manager-001",
      requiredApprovals: ["MANAGER", "FINANCE"],
      estimatedApprovalDate: "2024-06-25T00:00:00Z"
    }
  },
  message: "Requisition created successfully with AI optimization"
};
```

### Requisition Approval

```javascript
POST /procurement/requisitions/{id}/approve

const approvalRequest = {
  approvedBy: "manager-001",
  approvalLevel: "MANAGER", // SUPERVISOR, MANAGER, DIRECTOR, VP, CFO
  comments: "Approved for legitimate business need",
  conditions: [
    "Delivery within 2 weeks required",
    "Quality guarantee must be provided"
  ],
  budgetAdjustments: {
    approvedAmount: 3500.00,
    budgetSource: "Q3 Office Equipment Budget"
  }
};

// Response with automatic PO creation
const response = {
  success: true,
  data: {
    approvalStatus: "APPROVED",
    approvalValidation: {
      allRequiredApprovals: true,
      finalApprovalDate: "2024-06-25T14:30:00Z",
      approvalChain: ["supervisor-001", "manager-001"]
    },
    fullyApproved: true,
    purchaseOrderCreated: {
      poId: "po-789",
      poNumber: "PO-2024-001234",
      autoCreated: true,
      expectedDelivery: "2024-07-15T00:00:00Z"
    }
  },
  message: "Requisition approved successfully"
};
```

## 📊 Analytics & Reporting

### Executive Dashboard

```javascript
GET /procurement/analytics/dashboard/executive?period=90d

// Response with comprehensive analytics
const response = {
  success: true,
  data: {
    period: "90d",
    kpiMetrics: {
      totalSpend: 2450000.00,
      costSavings: 145000.00,
      savingsPercentage: 5.9,
      activeContracts: 156,
      activeRFQs: 23,
      supplierCount: 89,
      avgProcessingTime: 12.5, // days
      complianceScore: 0.94
    },
    spendOverview: {
      byCategory: [
        { category: "IT Services", amount: 890000.00, percentage: 36.3 },
        { category: "Office Supplies", amount: 340000.00, percentage: 13.9 },
        { category: "Professional Services", amount: 520000.00, percentage: 21.2 }
      ],
      byDepartment: [
        { department: "Engineering", amount: 1100000.00, percentage: 44.9 },
        { department: "Marketing", amount: 450000.00, percentage: 18.4 }
      ],
      trend: "INCREASING", // INCREASING, DECREASING, STABLE
      monthOverMonth: 0.08 // 8% increase
    },
    supplierMetrics: {
      topSuppliers: [
        { supplierId: "vendor-123", name: "TechSolutions Inc.", spend: 450000.00, rating: 4.8 },
        { supplierId: "vendor-456", name: "GlobalServices Ltd.", spend: 380000.00, rating: 4.5 }
      ],
      performanceDistribution: {
        excellent: 67, // percentage
        good: 25,
        fair: 8,
        poor: 0
      },
      diversityScore: 0.72
    },
    riskMetrics: {
      overallRiskScore: 0.23, // Low risk
      riskDistribution: {
        low: 78,
        medium: 18,
        high: 4,
        critical: 0
      },
      topRisks: [
        { risk: "Single source dependency", impact: "MEDIUM", suppliers: 3 },
        { risk: "Contract expiration", impact: "LOW", contracts: 12 }
      ]
    },
    complianceMetrics: {
      overallCompliance: 0.94,
      auditFindings: 2,
      policyViolations: 1,
      certificationStatus: "CURRENT"
    },
    marketInsights: {
      marketTrends: [
        { trend: "Digital transformation services in high demand", impact: "POSITIVE" },
        { trend: "Supply chain material costs increasing", impact: "NEGATIVE" }
      ],
      pricingTrends: "STABLE",
      supplierMarketHealth: 0.87
    },
    predictiveInsights: {
      spendForecast: {
        nextQuarter: 2650000.00,
        confidence: 0.89
      },
      riskPredictions: [
        { prediction: "Potential contract renewal delays", probability: 0.34 },
        { prediction: "Supply shortage in Q4", probability: 0.23 }
      ]
    },
    aiRecommendations: [
      "Consider consolidating vendors in IT services category",
      "Negotiate volume discounts for office supplies",
      "Review high-risk contracts for renewal terms"
    ],
    summary: {
      performanceGrade: "A-",
      keyAchievements: [
        "5.9% cost savings achieved",
        "94% compliance maintained",
        "12.5 day average processing time"
      ],
      priorityActions: [
        "Review vendor consolidation opportunities",
        "Address contract expiration risks",
        "Optimize procurement processes"
      ]
    }
  },
  message: "Executive dashboard retrieved successfully"
};
```

### Spend Analysis

```javascript
GET /procurement/analytics/spend-analysis?period=90d&categories=IT,Office&departments=Engineering

const response = {
  success: true,
  data: {
    spendByCategory: [
      {
        category: "IT Services",
        currentPeriod: 890000.00,
        previousPeriod: 820000.00,
        change: 8.5,
        trend: "INCREASING"
      }
    ],
    spendBySupplier: [
      {
        supplierId: "vendor-123",
        supplierName: "TechSolutions Inc.",
        totalSpend: 450000.00,
        contractCount: 8,
        averageOrderValue: 56250.00
      }
    ],
    spendTrends: {
      monthly: [
        { month: "2024-04", spend: 780000.00 },
        { month: "2024-05", spend: 820000.00 },
        { month: "2024-06", spend: 890000.00 }
      ],
      seasonality: "Q2_PEAK",
      growthRate: 0.125
    },
    spendOptimization: {
      potentialSavings: 89000.00,
      optimizationOpportunities: [
        {
          opportunity: "Volume discounts",
          category: "Office Supplies",
          potentialSaving: 23000.00
        },
        {
          opportunity: "Vendor consolidation",
          category: "IT Services",
          potentialSaving: 45000.00
        }
      ]
    },
    benchmarkComparison: {
      industryBenchmark: 0.85,
      yourPerformance: 0.92,
      ranking: "TOP_QUARTILE"
    },
    aiInsights: {
      spendingPatterns: [
        "IT spending increases 15% during product launch quarters",
        "Office supply costs correlate with team size growth"
      ],
      anomalies: [
        {
          description: "Unusual spike in consulting spend",
          amount: 45000.00,
          investigation: "Required for compliance project"
        }
      ],
      recommendations: [
        "Negotiate enterprise agreements for software licenses",
        "Implement approval workflows for consulting expenses"
      ]
    },
    summary: {
      totalAnalyzedSpend: 2450000.00,
      topSpendingCategory: "IT Services",
      optimalSpendingScore: 0.89,
      recommendedActions: [
        "Focus on IT services vendor consolidation",
        "Implement category-specific budgeting"
      ]
    }
  },
  message: "Spend analysis completed successfully"
};
```

## 🔔 Real-Time Features

### WebSocket Events

```javascript
// Connect to procurement events
const socket = io('/procurement');

// Subscribe to RFQ events
socket.on('rfq:created', (data) => {
  console.log('New RFQ created:', data.rfq);
  // Update UI with new RFQ
});

socket.on('rfq:status_changed', (data) => {
  console.log('RFQ status changed:', data);
  // Update RFQ status in UI
});

socket.on('contract:approval_needed', (data) => {
  console.log('Contract needs approval:', data.contract);
  // Show approval notification
});

socket.on('budget:threshold_exceeded', (data) => {
  console.log('Budget threshold exceeded:', data);
  // Show budget alert
});

// Market intelligence updates
socket.on('market:price_alert', (data) => {
  console.log('Price alert:', data);
  // Show price change notification
});
```

### Server-Sent Events (Alternative)

```javascript
// For browsers that prefer SSE
const eventSource = new EventSource('/api/v1/procurement/events');

eventSource.onmessage = function(event) {
  const data = JSON.parse(event.data);
  handleProcurementEvent(data);
};
```

## 📎 File Upload & Download

### Document Upload

```javascript
POST /procurement/rfq/{id}/documents

const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);
formData.append('documentType', 'SPECIFICATION');
formData.append('description', 'Technical specifications');

fetch('/api/v1/procurement/rfq/123/documents', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
    // Don't set Content-Type for FormData
  },
  body: formData
});
```

### Document Download

```javascript
GET /procurement/rfq/{id}/documents/{documentId}/download

// Response will be a file stream
const response = await fetch('/api/v1/procurement/rfq/123/documents/doc-456/download', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'specification.pdf';
document.body.appendChild(a);
a.click();
```

## 🛠️ Frontend SDK

### React Hooks

```javascript
import { useProcurementAPI } from '@industry5.0/procurement-sdk';

// Hook for RFQ management
const useRFQs = () => {
  const { data: rfqs, loading, error, refetch } = useProcurementAPI('/procurement/rfq');
  
  const createRFQ = async (rfqData) => {
    // Implementation
  };
  
  const updateRFQ = async (id, updates) => {
    // Implementation
  };
  
  return { rfqs, loading, error, createRFQ, updateRFQ, refetch };
};

// Usage in component
const RFQList = () => {
  const { rfqs, loading, error, createRFQ } = useRFQs();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {rfqs.map(rfq => (
        <RFQCard key={rfq.id} rfq={rfq} />
      ))}
    </div>
  );
};
```

### Utility Functions

```javascript
// Format currency
import { formatCurrency } from '@industry5.0/procurement-sdk/utils';
const formattedAmount = formatCurrency(1500.50, 'USD'); // "$1,500.50"

// Status helpers
import { getRFQStatusColor, getContractStatusIcon } from '@industry5.0/procurement-sdk/utils';
const statusColor = getRFQStatusColor('ACTIVE'); // 'green'
const statusIcon = getContractStatusIcon('DRAFT'); // 'edit-icon'

// Validation
import { validateRFQData } from '@industry5.0/procurement-sdk/validators';
const { isValid, errors } = validateRFQData(rfqFormData);
```

### Error Boundaries

```javascript
import { ProcurementErrorBoundary } from '@industry5.0/procurement-sdk';

const App = () => {
  return (
    <ProcurementErrorBoundary>
      <ProcurementDashboard />
    </ProcurementErrorBoundary>
  );
};
```

## 🔧 Development Setup

### Environment Variables

```env
# API Configuration
REACT_APP_API_BASE_URL=https://api.yourdomain.com/api/v1
REACT_APP_WS_URL=wss://api.yourdomain.com

# Authentication
REACT_APP_JWT_STORAGE_KEY=procurement_jwt_token
REACT_APP_REFRESH_TOKEN_KEY=procurement_refresh_token

# Features
REACT_APP_ENABLE_REAL_TIME=true
REACT_APP_ENABLE_AI_FEATURES=true
REACT_APP_ENABLE_BLOCKCHAIN=true

# Analytics
REACT_APP_ANALYTICS_ENDPOINT=/procurement/analytics
```

### Package Installation

```bash
npm install @industry5.0/procurement-sdk
```

### TypeScript Definitions

```typescript
// Available in the SDK
import {
  RFQ,
  Contract,
  Vendor,
  Requisition,
  RFQStatus,
  ContractStatus,
  VendorStatus,
  CreateRFQRequest,
  CreateContractRequest,
  ProcurementAPIResponse
} from '@industry5.0/procurement-sdk/types';
```

## 📈 Performance Optimization

### Caching Strategy

```javascript
// Use React Query for caching
import { useQuery, useMutation, useQueryClient } from 'react-query';

const useRFQs = (filters) => {
  return useQuery(
    ['rfqs', filters],
    () => fetchRFQs(filters),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};
```

### Pagination & Virtual Scrolling

```javascript
// Use virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

const VirtualizedRFQList = ({ rfqs }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <RFQCard rfq={rfqs[index]} />
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={rfqs.length}
      itemSize={120}
    >
      {Row}
    </List>
  );
};
```

## 🔒 Security Best Practices

### Token Management

```javascript
// Secure token storage
import { SecureStorage } from '@industry5.0/procurement-sdk/security';

// Store tokens securely
SecureStorage.setToken(jwtToken);
SecureStorage.setRefreshToken(refreshToken);

// Auto-refresh tokens
const useAuthToken = () => {
  // Implementation with automatic refresh
};
```

### Input Validation

```javascript
// Client-side validation
import { validateInput } from '@industry5.0/procurement-sdk/validation';

const RFQForm = () => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const validationResult = validateInput(formData, 'rfq');
    setErrors(validationResult.errors);
    return validationResult.isValid;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Submit form
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

## 📱 Mobile Responsiveness

### Responsive Design

```css
/* Responsive breakpoints for procurement interfaces */
@media (max-width: 768px) {
  .rfq-card {
    flex-direction: column;
    padding: 12px;
  }
  
  .procurement-table {
    display: block;
    overflow-x: auto;
  }
}

@media (max-width: 480px) {
  .procurement-dashboard {
    grid-template-columns: 1fr;
  }
}
```

### Touch-Friendly Components

```javascript
// Touch-optimized components
import { TouchableCard, SwipeableRow } from '@industry5.0/procurement-sdk/mobile';

const MobileRFQList = ({ rfqs }) => {
  return (
    <div className="mobile-rfq-list">
      {rfqs.map(rfq => (
        <SwipeableRow
          key={rfq.id}
          leftActions={[{ label: 'Edit', action: () => editRFQ(rfq.id) }]}
          rightActions={[{ label: 'Delete', action: () => deleteRFQ(rfq.id) }]}
        >
          <TouchableCard rfq={rfq} />
        </SwipeableRow>
      ))}
    </div>
  );
};
```

## 🎨 UI Components Library

### Pre-built Components

```javascript
import {
  RFQCard,
  ContractTable,
  VendorProfile,
  ProcurementDashboard,
  SpendAnalyticsChart,
  ApprovalWorkflow,
  BudgetTracker
} from '@industry5.0/procurement-sdk/components';

const ProcurementApp = () => {
  return (
    <div className="procurement-app">
      <ProcurementDashboard />
      <SpendAnalyticsChart period="90d" />
      <ApprovalWorkflow workflowId="wf-001" />
    </div>
  );
};
```

## 🔍 Testing Integration

### Unit Tests

```javascript
import { render, screen } from '@testing-library/react';
import { RFQCard } from '@industry5.0/procurement-sdk/components';
import { mockRFQ } from '@industry5.0/procurement-sdk/test-utils';

test('renders RFQ card with correct information', () => {
  render(<RFQCard rfq={mockRFQ} />);
  
  expect(screen.getByText(mockRFQ.title)).toBeInTheDocument();
  expect(screen.getByText(mockRFQ.rfqNumber)).toBeInTheDocument();
  expect(screen.getByText(mockRFQ.status)).toBeInTheDocument();
});
```

### Integration Tests

```javascript
import { mockAPIServer } from '@industry5.0/procurement-sdk/test-utils';

beforeAll(() => {
  mockAPIServer.listen();
});

afterEach(() => {
  mockAPIServer.resetHandlers();
});

afterAll(() => {
  mockAPIServer.close();
});
```

## 🌐 Internationalization (i18n)

### Multi-language Support

```javascript
import { useTranslation } from 'react-i18next';
import { ProcurementTranslations } from '@industry5.0/procurement-sdk/i18n';

const RFQForm = () => {
  const { t } = useTranslation('procurement');
  
  return (
    <form>
      <label>{t('rfq.title')}</label>
      <input placeholder={t('rfq.titlePlaceholder')} />
      
      <label>{t('rfq.description')}</label>
      <textarea placeholder={t('rfq.descriptionPlaceholder')} />
    </form>
  );
};
```

## 📚 Additional Resources

- **API Documentation**: https://docs.yourdomain.com/procurement-api
- **SDK Documentation**: https://sdk.yourdomain.com/procurement
- **Component Storybook**: https://storybook.yourdomain.com/procurement
- **Example Applications**: https://examples.yourdomain.com/procurement
- **Support**: support@yourdomain.com

---

**This integration guide provides everything needed to successfully integrate the Procurement Module with your frontend application. The module is production-ready with Industry 5.0 capabilities including AI intelligence, real-time analytics, and autonomous operations.**
