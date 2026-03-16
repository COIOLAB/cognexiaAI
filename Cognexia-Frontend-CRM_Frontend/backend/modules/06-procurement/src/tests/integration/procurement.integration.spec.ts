/**
 * Procurement Integration Tests
 * Industry 5.0 ERP - Comprehensive Integration Testing
 * 
 * Complete integration test suite covering all procurement functionalities,
 * AI services, workflows, and end-to-end business processes.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';

// Import the main module and components
import { ProcurementModule } from '../procurement.module';
import { RFQ, RFQStatus, RFQType, Priority } from '../entities/rfq.entity';
import { Contract, ContractStatus } from '../entities/contract.entity';
import { Vendor, VendorStatus } from '../entities/vendor.entity';
import { Requisition, RequisitionStatus } from '../entities/requisition.entity';

// Import DTOs
import { CreateRFQDto, UpdateRFQDto, RFQFilterDto } from '../dto/rfq.dto';
import { CreateContractDto } from '../dto/contract.dto';
import { CreateVendorDto } from '../dto/vendor.dto';
import { CreateRequisitionDto } from '../dto/requisition.dto';

// Import Services
import { AIProcurementIntelligenceService } from '../services/ai-procurement-intelligence.service';
import { BudgetValidationService } from '../services/budget-validation.service';
import { ApprovalWorkflowService } from '../services/approval-workflow.service';
import { AnalyticsDashboardService } from '../services/analytics-dashboard.service';

// Import Error Classes
import { 
  ProcurementException, 
  RFQNotFoundException, 
  BudgetInsufficientException,
  ProcurementErrorFactory 
} from '../middleware/procurement-error-handler.middleware';

describe('Procurement Integration Tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  
  // Repositories
  let rfqRepository: Repository<RFQ>;
  let contractRepository: Repository<Contract>;
  let vendorRepository: Repository<Vendor>;
  let requisitionRepository: Repository<Requisition>;
  
  // Services
  let aiIntelligenceService: AIProcurementIntelligenceService;
  let budgetValidationService: BudgetValidationService;
  let approvalWorkflowService: ApprovalWorkflowService;
  let analyticsService: AnalyticsDashboardService;

  // Test data
  let testRFQ: RFQ;
  let testContract: Contract;
  let testVendor: Vendor;
  let testRequisition: Requisition;
  let authToken: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test'
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'sqlite',
            database: ':memory:',
            entities: [RFQ, Contract, Vendor, Requisition],
            synchronize: true,
            dropSchema: true,
            logging: false
          }),
          inject: [ConfigService]
        }),
        EventEmitterModule.forRoot(),
        HttpModule,
        CacheModule.register({ isGlobal: true }),
        ProcurementModule
      ]
    }).compile();

    app = module.createNestApplication();
    
    // Get repositories
    rfqRepository = module.get<Repository<RFQ>>(getRepositoryToken(RFQ));
    contractRepository = module.get<Repository<Contract>>(getRepositoryToken(Contract));
    vendorRepository = module.get<Repository<Vendor>>(getRepositoryToken(Vendor));
    requisitionRepository = module.get<Repository<Requisition>>(getRepositoryToken(Requisition));
    
    // Get services
    aiIntelligenceService = module.get<AIProcurementIntelligenceService>(AIProcurementIntelligenceService);
    budgetValidationService = module.get<BudgetValidationService>(BudgetValidationService);
    approvalWorkflowService = module.get<ApprovalWorkflowService>(ApprovalWorkflowService);
    analyticsService = module.get<AnalyticsDashboardService>(AnalyticsDashboardService);

    await app.init();
    
    // Setup test data
    await setupTestData();
    
    // Mock authentication token
    authToken = 'Bearer test-jwt-token';
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
    await module.close();
  });

  beforeEach(async () => {
    // Reset test data state before each test
    await resetTestData();
  });

  describe('RFQ Management Integration Tests', () => {
    describe('POST /procurement/rfq', () => {
      it('should create a new RFQ with AI optimization', async () => {
        const createRFQDto: CreateRFQDto = {
          title: 'Test RFQ Integration',
          description: 'Integration test RFQ for comprehensive testing',
          type: RFQType.GOODS,
          priority: Priority.MEDIUM,
          items: [
            {
              name: 'Test Item 1',
              description: 'Test item for integration testing',
              quantity: 10,
              unit: 'pieces',
              estimatedUnitPrice: 100.00,
              specifications: { color: 'blue', material: 'plastic' },
              category: 'Electronics'
            }
          ],
          totalBudget: 1000.00,
          currency: 'USD' as any,
          submissionDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          evaluationCriteria: [
            {
              name: 'Price',
              description: 'Total cost including delivery',
              weight: 40
            },
            {
              name: 'Quality',
              description: 'Product quality and specifications',
              weight: 30
            },
            {
              name: 'Delivery Time',
              description: 'Time to delivery',
              weight: 30
            }
          ],
          departmentId: 'dept-001',
          createdBy: 'user-001'
        };

        const response = await request(app.getHttpServer())
          .post('/procurement/rfq')
          .set('Authorization', authToken)
          .send(createRFQDto)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.rfqNumber).toMatch(/^RFQ-\d{4}-\d{6}$/);
        expect(response.body.data.status).toBe(RFQStatus.DRAFT);
        expect(response.body.data.aiOptimizations).toBeDefined();
        expect(response.body.data.marketIntelligence).toBeDefined();
        expect(response.body.data.supplierRecommendations).toBeDefined();
        expect(response.body.message).toBe('RFQ created successfully with AI optimization');

        // Verify RFQ was saved to database
        const savedRFQ = await rfqRepository.findOne({
          where: { id: response.body.data.id }
        });
        expect(savedRFQ).toBeDefined();
        expect(savedRFQ.title).toBe(createRFQDto.title);
      });

      it('should handle validation errors correctly', async () => {
        const invalidRFQDto = {
          title: '', // Invalid: empty title
          description: 'Test description',
          type: 'INVALID_TYPE', // Invalid type
          // Missing required fields
        };

        const response = await request(app.getHttpServer())
          .post('/procurement/rfq')
          .set('Authorization', authToken)
          .send(invalidRFQDto)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('PROCUREMENT_VALIDATION_ERROR');
        expect(response.body.error.suggestions).toBeDefined();
        expect(Array.isArray(response.body.error.suggestions)).toBe(true);
      });
    });

    describe('GET /procurement/rfq', () => {
      beforeEach(async () => {
        // Create test RFQs with different statuses and priorities
        await createTestRFQs();
      });

      it('should retrieve all RFQs with AI insights', async () => {
        const response = await request(app.getHttpServer())
          .get('/procurement/rfq')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data.data)).toBe(true);
        expect(response.body.data.data.length).toBeGreaterThan(0);
        
        // Check AI insights are included
        const firstRFQ = response.body.data.data[0];
        expect(firstRFQ.aiInsights).toBeDefined();
        expect(firstRFQ.competitiveAnalysis).toBeDefined();
        expect(firstRFQ.marketPosition).toBeDefined();
      });

      it('should filter RFQs by status', async () => {
        const response = await request(app.getHttpServer())
          .get('/procurement/rfq')
          .query({ status: RFQStatus.DRAFT })
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        response.body.data.data.forEach(rfq => {
          expect(rfq.status).toBe(RFQStatus.DRAFT);
        });
      });

      it('should paginate results correctly', async () => {
        const response = await request(app.getHttpServer())
          .get('/procurement/rfq')
          .query({ page: 1, limit: 5 })
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.data.length).toBeLessThanOrEqual(5);
        expect(response.body.data.page).toBe(1);
        expect(response.body.data.limit).toBe(5);
      });
    });

    describe('GET /procurement/rfq/:id', () => {
      it('should retrieve specific RFQ with comprehensive analytics', async () => {
        const response = await request(app.getHttpServer())
          .get(`/procurement/rfq/${testRFQ.id}`)
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testRFQ.id);
        expect(response.body.data.analytics).toBeDefined();
        expect(response.body.data.aiInsights).toBeDefined();
        expect(response.body.data.marketAnalysis).toBeDefined();
        expect(response.body.data.competitiveAnalysis).toBeDefined();
        expect(response.body.data.daysToDeadline).toBeDefined();
        expect(response.body.data.responseRate).toBeDefined();
      });

      it('should handle non-existent RFQ correctly', async () => {
        const response = await request(app.getHttpServer())
          .get('/procurement/rfq/non-existent-id')
          .set('Authorization', authToken)
          .expect(404);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('RFQ_NOT_FOUND');
        expect(response.body.error.suggestions).toBeDefined();
      });
    });

    describe('PUT /procurement/rfq/:id', () => {
      it('should update RFQ with AI validation', async () => {
        const updateDto: UpdateRFQDto = {
          title: 'Updated RFQ Title',
          description: 'Updated description with new requirements',
          lastModifiedBy: 'user-001',
          updateReason: 'Integration test update'
        };

        const response = await request(app.getHttpServer())
          .put(`/procurement/rfq/${testRFQ.id}`)
          .set('Authorization', authToken)
          .send(updateDto)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe(updateDto.title);
        expect(response.body.data.changeAnalysis).toBeDefined();
        expect(response.body.data.blockchainHash).toBeDefined();
      });
    });

    describe('POST /procurement/rfq/:id/publish', () => {
      it('should publish RFQ with AI-optimized supplier selection', async () => {
        const publishDto = {
          publishedBy: 'user-001',
          notifications: true
        };

        const response = await request(app.getHttpServer())
          .post(`/procurement/rfq/${testRFQ.id}/publish`)
          .set('Authorization', authToken)
          .send(publishDto)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.supplierOptimization).toBeDefined();
        expect(response.body.message).toBe('RFQ published successfully with AI-optimized supplier selection');
      });
    });

    describe('POST /procurement/rfq/:id/evaluate', () => {
      beforeEach(async () => {
        // Setup RFQ for evaluation (closed status with bids)
        await setupRFQForEvaluation();
      });

      it('should evaluate RFQ with AI analysis', async () => {
        const evaluationDto = {
          evaluatedBy: 'user-001',
          autoRanking: true
        };

        const response = await request(app.getHttpServer())
          .post(`/procurement/rfq/${testRFQ.id}/evaluate`)
          .set('Authorization', authToken)
          .send(evaluationDto)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.aiInsights).toBeDefined();
        expect(response.body.data.competitiveAnalysis).toBeDefined();
        expect(response.body.data.recommendations).toBeDefined();
        expect(response.body.message).toBe('RFQ evaluation completed successfully');
      });
    });

    describe('POST /procurement/rfq/:id/award', () => {
      it('should award RFQ to winning supplier', async () => {
        const awardDto = {
          supplierId: 'supplier-001',
          awardedBy: 'user-001',
          awardValue: 950.00,
          currency: 'USD' as any,
          awardDate: new Date(),
          conditions: ['Net 30 payment terms', 'Quality guarantee required'],
          justification: 'Best value proposition with excellent quality record'
        };

        const response = await request(app.getHttpServer())
          .post(`/procurement/rfq/${testRFQ.id}/award`)
          .set('Authorization', authToken)
          .send(awardDto)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.contractRecommendations).toBeDefined();
        expect(response.body.data.blockchainHash).toBeDefined();
        expect(response.body.message).toBe('RFQ awarded successfully');
      });
    });
  });

  describe('Contract Management Integration Tests', () => {
    describe('POST /procurement/contracts', () => {
      it('should create contract with AI optimization', async () => {
        const createContractDto: CreateContractDto = {
          title: 'Test Service Contract',
          description: 'Integration test contract for comprehensive testing',
          type: 'SERVICE' as any,
          contractValue: 50000.00,
          currency: 'USD' as any,
          duration: '12 months',
          vendorId: testVendor.id,
          createdBy: 'user-001',
          terms: {
            paymentTerms: 'Net 30',
            deliveryTerms: 'Standard delivery',
            warrantyPeriod: '12 months'
          },
          paymentTerms: 'NET_30' as any,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          approvers: ['manager-001', 'director-001'],
          reviewers: ['legal-001', 'procurement-001']
        };

        const response = await request(app.getHttpServer())
          .post('/procurement/contracts')
          .set('Authorization', authToken)
          .send(createContractDto)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.contractNumber).toMatch(/^CTR-\d{4}-\d{6}$/);
        expect(response.body.data.aiAnalysis).toBeDefined();
        expect(response.body.data.riskAssessment).toBeDefined();
        expect(response.body.data.complianceValidation).toBeDefined();
        expect(response.body.data.legalRecommendations).toBeDefined();
        expect(response.body.data.workflow).toBeDefined();
        expect(response.body.data.blockchainHash).toBeDefined();
      });
    });

    describe('GET /procurement/contracts', () => {
      it('should retrieve contracts with AI insights', async () => {
        const response = await request(app.getHttpServer())
          .get('/procurement/contracts')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data.data)).toBe(true);
        
        if (response.body.data.data.length > 0) {
          const firstContract = response.body.data.data[0];
          expect(firstContract.aiInsights).toBeDefined();
          expect(firstContract.performanceMetrics).toBeDefined();
          expect(firstContract.riskProfile).toBeDefined();
        }
      });
    });

    describe('POST /procurement/contracts/:id/execute', () => {
      it('should execute contract successfully', async () => {
        const executionDto = {
          executedBy: 'user-001',
          executionDate: new Date(),
          notes: 'Contract executed after all approvals completed'
        };

        const response = await request(app.getHttpServer())
          .post(`/procurement/contracts/${testContract.id}/execute`)
          .set('Authorization', authToken)
          .send(executionDto)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.blockchainHash).toBeDefined();
        expect(response.body.message).toBe('Contract executed successfully');
      });
    });
  });

  describe('Vendor Management Integration Tests', () => {
    describe('POST /procurement/vendors', () => {
      it('should create vendor with AI validation', async () => {
        const createVendorDto: CreateVendorDto = {
          companyName: 'Test Vendor Corp',
          registrationNumber: 'REG123456789',
          taxId: 'TAX987654321',
          industry: 'Technology',
          categories: ['Software', 'Hardware'],
          contactInfo: {
            primaryContact: 'John Doe',
            email: 'john@testvendor.com',
            phone: '+1-555-0123',
            address: {
              street: '123 Test St',
              city: 'Test City',
              state: 'TS',
              zipCode: '12345',
              country: 'USA'
            }
          },
          businessInfo: {
            yearEstablished: 2010,
            numberOfEmployees: 150,
            annualRevenue: 10000000
          },
          createdBy: 'user-001'
        };

        const response = await request(app.getHttpServer())
          .post('/procurement/vendors')
          .set('Authorization', authToken)
          .send(createVendorDto)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.vendorNumber).toMatch(/^VEN-\d{4}-\d{6}$/);
        expect(response.body.data.aiValidation).toBeDefined();
        expect(response.body.data.riskAssessment).toBeDefined();
        expect(response.body.data.marketIntelligence).toBeDefined();
        expect(response.body.data.onboardingProcess).toBeDefined();
      });
    });

    describe('GET /procurement/vendors', () => {
      it('should retrieve vendors with AI insights', async () => {
        const response = await request(app.getHttpServer())
          .get('/procurement/vendors')
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        
        if (response.body.data.data.length > 0) {
          const firstVendor = response.body.data.data[0];
          expect(firstVendor.aiInsights).toBeDefined();
          expect(firstVendor.performanceMetrics).toBeDefined();
          expect(firstVendor.riskProfile).toBeDefined();
          expect(firstVendor.complianceStatus).toBeDefined();
        }
      });
    });

    describe('POST /procurement/vendors/:id/evaluate', () => {
      it('should evaluate vendor performance', async () => {
        const evaluationDto = {
          criteria: [
            { name: 'Quality', weight: 30, score: 85 },
            { name: 'Delivery', weight: 25, score: 90 },
            { name: 'Cost', weight: 25, score: 80 },
            { name: 'Service', weight: 20, score: 88 }
          ],
          performanceData: {
            onTimeDelivery: 92,
            qualityRating: 4.2,
            responsiveness: 4.5
          },
          evaluatedBy: 'user-001'
        };

        const response = await request(app.getHttpServer())
          .post(`/procurement/vendors/${testVendor.id}/evaluate`)
          .set('Authorization', authToken)
          .send(evaluationDto)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.aiInsights).toBeDefined();
        expect(response.body.data.recommendations).toBeDefined();
      });
    });
  });

  describe('Requisition Management Integration Tests', () => {
    describe('POST /procurement/requisitions', () => {
      it('should create requisition with budget validation', async () => {
        const createRequisitionDto: CreateRequisitionDto = {
          title: 'Test Office Supplies Requisition',
          description: 'Monthly office supplies for development team',
          items: [
            {
              itemId: 'item-001',
              name: 'Office Chairs',
              description: 'Ergonomic office chairs for developers',
              quantity: 5,
              estimatedUnitPrice: 300.00,
              specifications: { height: 'adjustable', material: 'mesh' }
            }
          ],
          totalEstimatedAmount: 1500.00,
          currency: 'USD' as any,
          urgency: 'MEDIUM' as any,
          expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          departmentId: 'dept-001',
          budgetCategory: 'Office Equipment',
          fiscalPeriod: '2024-Q1',
          requestedBy: 'user-001',
          justification: 'Improving workspace ergonomics for better productivity'
        };

        const response = await request(app.getHttpServer())
          .post('/procurement/requisitions')
          .set('Authorization', authToken)
          .send(createRequisitionDto)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.requisitionNumber).toMatch(/^REQ-\d{4}-\d{6}$/);
        expect(response.body.data.aiOptimization).toBeDefined();
        expect(response.body.data.budgetValidation).toBeDefined();
        expect(response.body.data.inventoryCheck).toBeDefined();
        expect(response.body.data.vendorRecommendations).toBeDefined();
        expect(response.body.data.approvalWorkflow).toBeDefined();
      });

      it('should reject requisition with insufficient budget', async () => {
        const createRequisitionDto: CreateRequisitionDto = {
          title: 'Expensive Equipment Requisition',
          description: 'High-cost equipment exceeding budget',
          items: [
            {
              itemId: 'item-002',
              name: 'Enterprise Server',
              description: 'High-performance enterprise server',
              quantity: 1,
              estimatedUnitPrice: 50000.00
            }
          ],
          totalEstimatedAmount: 50000.00, // Exceeds available budget
          currency: 'USD' as any,
          urgency: 'MEDIUM' as any,
          departmentId: 'dept-001',
          budgetCategory: 'IT Equipment',
          fiscalPeriod: '2024-Q1',
          requestedBy: 'user-001'
        };

        const response = await request(app.getHttpServer())
          .post('/procurement/requisitions')
          .set('Authorization', authToken)
          .send(createRequisitionDto)
          .expect(402); // Payment Required for insufficient budget

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INSUFFICIENT_BUDGET');
        expect(response.body.error.suggestions).toBeDefined();
        expect(response.body.error.details.shortfall).toBeGreaterThan(0);
      });
    });

    describe('POST /procurement/requisitions/:id/approve', () => {
      it('should approve requisition successfully', async () => {
        const approvalDto = {
          approvedBy: 'manager-001',
          approvalLevel: 'MANAGER' as any,
          comments: 'Approved for legitimate business need',
          conditions: ['Delivery within 2 weeks', 'Quality guarantee required']
        };

        const response = await request(app.getHttpServer())
          .post(`/procurement/requisitions/${testRequisition.id}/approve`)
          .set('Authorization', authToken)
          .send(approvalDto)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.approvalValidation).toBeDefined();
        
        // Check if PO was auto-created for fully approved requisition
        if (response.body.data.fullyApproved) {
          expect(response.body.data.purchaseOrderCreated).toBeDefined();
        }
      });
    });
  });

  describe('Analytics Integration Tests', () => {
    describe('GET /procurement/analytics/dashboard/executive', () => {
      it('should retrieve executive dashboard with AI insights', async () => {
        const response = await request(app.getHttpServer())
          .get('/procurement/analytics/dashboard/executive')
          .query({ period: '90d' })
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.period).toBe('90d');
        expect(response.body.data.kpiMetrics).toBeDefined();
        expect(response.body.data.spendOverview).toBeDefined();
        expect(response.body.data.supplierMetrics).toBeDefined();
        expect(response.body.data.riskMetrics).toBeDefined();
        expect(response.body.data.complianceMetrics).toBeDefined();
        expect(response.body.data.marketInsights).toBeDefined();
        expect(response.body.data.predictiveInsights).toBeDefined();
        expect(response.body.data.aiRecommendations).toBeDefined();
        expect(response.body.data.summary).toBeDefined();
      });
    });

    describe('GET /procurement/analytics/spend-analysis', () => {
      it('should retrieve spend analysis with AI insights', async () => {
        const response = await request(app.getHttpServer())
          .get('/procurement/analytics/spend-analysis')
          .query({
            period: '90d',
            categories: 'Electronics,Office Supplies',
            departments: 'dept-001,dept-002'
          })
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.spendByCategory).toBeDefined();
        expect(response.body.data.spendBySupplier).toBeDefined();
        expect(response.body.data.spendTrends).toBeDefined();
        expect(response.body.data.spendOptimization).toBeDefined();
        expect(response.body.data.benchmarkComparison).toBeDefined();
        expect(response.body.data.aiInsights).toBeDefined();
        expect(response.body.data.summary).toBeDefined();
      });
    });

    describe('GET /procurement/analytics/suppliers/performance', () => {
      it('should retrieve supplier performance analytics', async () => {
        const response = await request(app.getHttpServer())
          .get('/procurement/analytics/suppliers/performance')
          .query({ period: '90d' })
          .set('Authorization', authToken)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.performanceMetrics).toBeDefined();
        expect(response.body.data.performanceTrends).toBeDefined();
        expect(response.body.data.supplierRankings).toBeDefined();
        expect(response.body.data.riskAssessment).toBeDefined();
        expect(response.body.data.complianceMetrics).toBeDefined();
        expect(response.body.data.aiScoring).toBeDefined();
        expect(response.body.data.insights).toBeDefined();
      });
    });
  });

  describe('Error Handling Integration Tests', () => {
    it('should handle authentication errors', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/rfq')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should handle validation errors with helpful suggestions', async () => {
      const invalidData = {
        title: '',
        items: []
      };

      const response = await request(app.getHttpServer())
        .post('/procurement/rfq')
        .set('Authorization', authToken)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PROCUREMENT_VALIDATION_ERROR');
      expect(response.body.error.suggestions).toBeDefined();
      expect(Array.isArray(response.body.error.suggestions)).toBe(true);
    });

    it('should handle service unavailability gracefully', async () => {
      // Mock AI service unavailable
      jest.spyOn(aiIntelligenceService, 'optimizeRFQCreation')
        .mockRejectedValue(new Error('Service unavailable'));

      const createRFQDto = {
        title: 'Test RFQ',
        description: 'Test description',
        type: RFQType.GOODS,
        priority: Priority.MEDIUM,
        items: [{
          name: 'Test Item',
          description: 'Test item description',
          quantity: 1,
          unit: 'pieces'
        }],
        totalBudget: 1000,
        currency: 'USD' as any,
        submissionDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        evaluationCriteria: [{
          name: 'Price',
          description: 'Total cost',
          weight: 100
        }],
        departmentId: 'dept-001',
        createdBy: 'user-001'
      };

      const response = await request(app.getHttpServer())
        .post('/procurement/rfq')
        .set('Authorization', authToken)
        .send(createRFQDto)
        .expect(201); // Should still work with fallback

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('End-to-End Workflow Tests', () => {
    it('should complete full RFQ-to-Contract workflow', async () => {
      // 1. Create Requisition
      const requisitionResponse = await request(app.getHttpServer())
        .post('/procurement/requisitions')
        .set('Authorization', authToken)
        .send({
          title: 'E2E Test Requisition',
          description: 'End-to-end workflow test',
          items: [{
            itemId: 'item-e2e',
            name: 'E2E Test Item',
            description: 'Item for end-to-end testing',
            quantity: 1,
            estimatedUnitPrice: 1000.00
          }],
          totalEstimatedAmount: 1000.00,
          currency: 'USD',
          urgency: 'MEDIUM',
          departmentId: 'dept-001',
          budgetCategory: 'Test Equipment',
          fiscalPeriod: '2024-Q1',
          requestedBy: 'user-001'
        })
        .expect(201);

      const requisitionId = requisitionResponse.body.data.id;

      // 2. Approve Requisition
      await request(app.getHttpServer())
        .post(`/procurement/requisitions/${requisitionId}/approve`)
        .set('Authorization', authToken)
        .send({
          approvedBy: 'manager-001',
          approvalLevel: 'MANAGER',
          comments: 'Approved for E2E test'
        })
        .expect(200);

      // 3. Create RFQ from Requisition
      const rfqResponse = await request(app.getHttpServer())
        .post('/procurement/rfq')
        .set('Authorization', authToken)
        .send({
          title: 'E2E Test RFQ',
          description: 'RFQ created from approved requisition',
          type: RFQType.GOODS,
          priority: Priority.MEDIUM,
          items: [{
            name: 'E2E Test Item',
            description: 'Item for RFQ testing',
            quantity: 1,
            unit: 'pieces',
            estimatedUnitPrice: 1000.00
          }],
          totalBudget: 1000.00,
          currency: 'USD',
          submissionDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          evaluationCriteria: [{
            name: 'Price',
            description: 'Total cost',
            weight: 100
          }],
          departmentId: 'dept-001',
          createdBy: 'user-001',
          sourceRequisitionId: requisitionId
        })
        .expect(201);

      const rfqId = rfqResponse.body.data.id;

      // 4. Publish RFQ
      await request(app.getHttpServer())
        .post(`/procurement/rfq/${rfqId}/publish`)
        .set('Authorization', authToken)
        .send({
          publishedBy: 'user-001',
          notifications: true
        })
        .expect(200);

      // 5. Award RFQ
      await request(app.getHttpServer())
        .post(`/procurement/rfq/${rfqId}/award`)
        .set('Authorization', authToken)
        .send({
          supplierId: testVendor.id,
          awardedBy: 'user-001',
          awardValue: 950.00,
          currency: 'USD',
          awardDate: new Date(),
          justification: 'Best value in E2E test'
        })
        .expect(200);

      // 6. Create Contract from RFQ Award
      const contractResponse = await request(app.getHttpServer())
        .post('/procurement/contracts')
        .set('Authorization', authToken)
        .send({
          title: 'E2E Test Contract',
          description: 'Contract created from RFQ award',
          type: 'GOODS',
          contractValue: 950.00,
          currency: 'USD',
          duration: '6 months',
          vendorId: testVendor.id,
          createdBy: 'user-001',
          sourceRFQId: rfqId,
          terms: {
            paymentTerms: 'Net 30',
            deliveryTerms: 'FOB Destination'
          },
          startDate: new Date(),
          endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
        })
        .expect(201);

      const contractId = contractResponse.body.data.id;

      // 7. Execute Contract
      await request(app.getHttpServer())
        .post(`/procurement/contracts/${contractId}/execute`)
        .set('Authorization', authToken)
        .send({
          executedBy: 'user-001',
          executionDate: new Date(),
          notes: 'E2E workflow completed successfully'
        })
        .expect(200);

      // Verify workflow completion
      expect(requisitionId).toBeDefined();
      expect(rfqId).toBeDefined();
      expect(contractId).toBeDefined();
    });
  });

  // Helper Functions
  async function setupTestData(): Promise<void> {
    // Create test vendor
    testVendor = vendorRepository.create({
      vendorNumber: 'TEST-VEN-001',
      companyName: 'Test Vendor Inc.',
      registrationNumber: 'REG123',
      taxId: 'TAX123',
      status: VendorStatus.ACTIVE,
      contactInfo: {
        email: 'test@vendor.com',
        phone: '+1-555-0001'
      },
      createdBy: 'test-user'
    });
    testVendor = await vendorRepository.save(testVendor);

    // Create test RFQ
    testRFQ = rfqRepository.create({
      rfqNumber: 'TEST-RFQ-001',
      title: 'Test RFQ for Integration',
      description: 'Test RFQ description',
      type: RFQType.GOODS,
      priority: Priority.MEDIUM,
      status: RFQStatus.DRAFT,
      items: [{
        name: 'Test Item',
        description: 'Test item description',
        quantity: 1,
        unit: 'pieces',
        estimatedUnitPrice: 100
      }],
      totalBudget: 1000,
      currency: 'USD' as any,
      submissionDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      evaluationCriteria: [{
        name: 'Price',
        description: 'Total cost',
        weight: 100
      }],
      departmentId: 'dept-001',
      createdBy: 'test-user'
    });
    testRFQ = await rfqRepository.save(testRFQ);

    // Create test contract
    testContract = contractRepository.create({
      contractNumber: 'TEST-CTR-001',
      title: 'Test Contract',
      description: 'Test contract description',
      type: 'SERVICE' as any,
      status: ContractStatus.DRAFT,
      contractValue: 5000,
      currency: 'USD' as any,
      vendorId: testVendor.id,
      createdBy: 'test-user',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });
    testContract = await contractRepository.save(testContract);

    // Create test requisition
    testRequisition = requisitionRepository.create({
      requisitionNumber: 'TEST-REQ-001',
      title: 'Test Requisition',
      description: 'Test requisition description',
      status: RequisitionStatus.DRAFT,
      totalEstimatedAmount: 500,
      currency: 'USD' as any,
      urgency: 'MEDIUM' as any,
      departmentId: 'dept-001',
      requestedBy: 'test-user',
      items: [{
        itemId: 'test-item-001',
        name: 'Test Item',
        description: 'Test item for requisition',
        quantity: 1,
        estimatedUnitPrice: 500
      }]
    });
    testRequisition = await requisitionRepository.save(testRequisition);
  }

  async function cleanupTestData(): Promise<void> {
    await requisitionRepository.clear();
    await contractRepository.clear();
    await rfqRepository.clear();
    await vendorRepository.clear();
  }

  async function resetTestData(): Promise<void> {
    // Reset test entities to initial state if needed
  }

  async function createTestRFQs(): Promise<void> {
    const rfqs = [
      {
        rfqNumber: 'TEST-RFQ-002',
        title: 'Test RFQ 2',
        description: 'Second test RFQ',
        type: RFQType.SERVICES,
        priority: Priority.HIGH,
        status: RFQStatus.PUBLISHED
      },
      {
        rfqNumber: 'TEST-RFQ-003',
        title: 'Test RFQ 3',
        description: 'Third test RFQ',
        type: RFQType.CONSTRUCTION,
        priority: Priority.LOW,
        status: RFQStatus.ACTIVE
      }
    ];

    for (const rfqData of rfqs) {
      const rfq = rfqRepository.create({
        ...rfqData,
        items: [{
          name: 'Test Item',
          description: 'Test item description',
          quantity: 1,
          unit: 'pieces',
          estimatedUnitPrice: 100
        }],
        totalBudget: 1000,
        currency: 'USD' as any,
        submissionDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        evaluationCriteria: [{
          name: 'Price',
          description: 'Total cost',
          weight: 100
        }],
        departmentId: 'dept-001',
        createdBy: 'test-user'
      });
      await rfqRepository.save(rfq);
    }
  }

  async function setupRFQForEvaluation(): Promise<void> {
    testRFQ.status = RFQStatus.CLOSED;
    testRFQ.bidsReceived = 3;
    await rfqRepository.save(testRFQ);
  }
});

// Additional test utilities and mocks
export const mockAIService = {
  optimizeRFQCreation: jest.fn().mockResolvedValue({
    suggestedCategories: ['Electronics'],
    budgetAnalysis: { feasibilityScore: 0.85 },
    timelineOptimization: { suggestedDeadline: new Date() }
  }),
  
  generateRFQInsights: jest.fn().mockResolvedValue({
    performanceScore: 8.5,
    competitiveAnalysis: { marketPosition: 'strong' },
    optimizationSuggestions: ['Consider volume discounts']
  })
};

export const mockBlockchainService = {
  recordRFQCreation: jest.fn().mockResolvedValue('0x123abc'),
  recordRFQUpdate: jest.fn().mockResolvedValue('0x456def'),
  recordRFQAward: jest.fn().mockResolvedValue('0x789ghi')
};

export const mockBudgetService = {
  validateRequisitionBudget: jest.fn().mockResolvedValue({
    isValid: true,
    validationStatus: 'approved',
    budgetAvailable: 10000,
    requestedAmount: 1000,
    remainingBudget: 9000
  })
};
