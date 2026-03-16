import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

// Module under test
import { ProcurementModule } from '../procurement.module';
import { ProcurementController } from '../procurement.controller';

// Entities
import { Supplier } from '../entities/supplier.entity';
import { PurchaseOrder } from '../entities/purchase-order.entity';
import { Contract } from '../entities/contract.entity';
import { RFQ } from '../entities/rfq.entity';
import { AuditLog } from '../entities/audit-log.entity';

// Services
import { AIProcurementIntelligenceService } from '../services/ai-procurement-intelligence.service';
import { SupplierManagementService } from '../services/supplier-management.service';
import { SmartContractManagementService } from '../services/smart-contract-management.service';
import { RealTimeMarketIntelligenceService } from '../services/real-time-market-intelligence.service';
import { AutonomousPurchaseOrderService } from '../services/autonomous-purchase-order.service';
import { AnalyticsDashboardService } from '../services/analytics-dashboard.service';
import { BlockchainIntegrationService } from '../services/blockchain-integration.service';

// DTOs
import { 
  SupplierOnboardingDataDto, 
  AutoPORequestDto, 
  ContractCreationDataDto,
  ExportOptionsDto 
} from '../dto/requests';

// Test utilities and mocks
import { createMockSupplier, createMockPurchaseOrder, createMockContract } from './utils/mock-data';
import { createTestJwtToken, mockUser, mockAdminUser, mockBuyerUser } from './utils/mock-auth';
import { MockSupabaseService } from './mocks/supabase.service.mock';
import { MockBlockchainService } from './mocks/blockchain.service.mock';

describe('Procurement Integration Tests', () => {
  let app: INestApplication;
  let supplierRepository: Repository<Supplier>;
  let purchaseOrderRepository: Repository<PurchaseOrder>;
  let contractRepository: Repository<Contract>;
  let rfqRepository: Repository<RFQ>;
  let auditLogRepository: Repository<AuditLog>;

  // Service mocks
  let supplierService: SupplierManagementService;
  let poService: AutonomousPurchaseOrderService;
  let contractService: SmartContractManagementService;
  let analyticsService: AnalyticsDashboardService;

  // JWT tokens for different user types
  let adminToken: string;
  let buyerToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              JWT_SECRET: 'test_secret_key',
              DATABASE_HOST: ':memory:',
              NODE_ENV: 'test',
            }),
          ],
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Supplier, PurchaseOrder, Contract, RFQ, AuditLog],
          synchronize: true,
          dropSchema: true,
          logging: false,
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: 'test_secret_key',
          signOptions: { expiresIn: '1h' },
        }),
        ProcurementModule,
      ],
    })
      .overrideProvider('SupabaseService')
      .useClass(MockSupabaseService)
      .overrideProvider(BlockchainIntegrationService)
      .useClass(MockBlockchainService)
      .compile();

    app = moduleFixture.createNestApplication();
    
    // Apply validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    // Get repository instances
    supplierRepository = moduleFixture.get<Repository<Supplier>>(
      getRepositoryToken(Supplier),
    );
    purchaseOrderRepository = moduleFixture.get<Repository<PurchaseOrder>>(
      getRepositoryToken(PurchaseOrder),
    );
    contractRepository = moduleFixture.get<Repository<Contract>>(
      getRepositoryToken(Contract),
    );
    rfqRepository = moduleFixture.get<Repository<RFQ>>(
      getRepositoryToken(RFQ),
    );
    auditLogRepository = moduleFixture.get<Repository<AuditLog>>(
      getRepositoryToken(AuditLog),
    );

    // Get service instances
    supplierService = moduleFixture.get<SupplierManagementService>(SupplierManagementService);
    poService = moduleFixture.get<AutonomousPurchaseOrderService>(AutonomousPurchaseOrderService);
    contractService = moduleFixture.get<SmartContractManagementService>(SmartContractManagementService);
    analyticsService = moduleFixture.get<AnalyticsDashboardService>(AnalyticsDashboardService);

    await app.init();

    // Create JWT tokens for different user roles
    adminToken = createTestJwtToken(mockAdminUser);
    buyerToken = createTestJwtToken(mockBuyerUser);
    viewerToken = createTestJwtToken(mockUser);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clear all repositories before each test
    await supplierRepository.clear();
    await purchaseOrderRepository.clear();
    await contractRepository.clear();
    await rfqRepository.clear();
    await auditLogRepository.clear();
  });

  // ============================================================================
  // SYSTEM HEALTH AND STATUS TESTS
  // ============================================================================

  describe('System Health & Status', () => {
    it('should return system health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/health')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        services: {
          aiIntelligence: 'operational',
          supplierManagement: 'operational',
          contractManagement: 'operational',
          marketIntelligence: 'operational',
          autonomousPO: 'operational',
          analytics: 'operational',
          blockchain: 'operational',
        },
      });
    });

    it('should return system configuration', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/configuration')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        version: '2.0.0',
        features: {
          aiIntelligence: true,
          blockchainIntegration: true,
          marketIntelligence: true,
          autonomousProcessing: true,
          realTimeAnalytics: true,
          sustainabilityTracking: true,
        },
      });
    });

    it('should return metrics summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/metrics/summary')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('financial');
      expect(response.body).toHaveProperty('operational');
      expect(response.body).toHaveProperty('suppliers');
      expect(response.body).toHaveProperty('performance');
      expect(response.body).toHaveProperty('risk');
      expect(response.body).toHaveProperty('sustainability');
    });
  });

  // ============================================================================
  // SUPPLIER MANAGEMENT TESTS
  // ============================================================================

  describe('Supplier Management', () => {
    let testSupplier: Supplier;

    beforeEach(async () => {
      testSupplier = await supplierRepository.save(createMockSupplier());
    });

    it('should search suppliers with filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/suppliers')
        .query({
          status: 'ACTIVE',
          type: 'MANUFACTURER',
          limit: 10,
          offset: 0,
        })
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('suppliers');
      expect(Array.isArray(response.body.suppliers)).toBe(true);
    });

    it('should onboard a new supplier with validation', async () => {
      const supplierData: SupplierOnboardingDataDto = {
        name: 'Test Supplier Corp',
        type: 'MANUFACTURER',
        description: 'A reliable manufacturing partner',
        categories: ['Electronics', 'Components'],
        address: {
          street: '123 Industrial Ave',
          city: 'Manufacturing City',
          state: 'MC',
          postalCode: '12345',
          country: 'USA',
        },
        contactInfo: [
          {
            name: 'John Smith',
            position: 'Sales Manager',
            email: 'john.smith@testsupplier.com',
            phone: '+1-555-0123',
            department: 'Sales',
          },
        ],
        taxId: 'TAX123456789',
        businessLicense: 'BL987654321',
        website: 'https://testsupplier.com',
        certifications: ['ISO9001', 'ISO14001'],
        capabilities: ['Manufacturing', 'Design', 'Quality Testing'],
        regions: ['North America', 'Europe'],
      };

      const response = await request(app.getHttpServer())
        .post('/procurement/suppliers')
        .query({ onboardedBy: mockBuyerUser.id })
        .send(supplierData)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('supplier');
      expect(response.body.data.supplier.name).toBe(supplierData.name);
    });

    it('should generate supplier performance report', async () => {
      const response = await request(app.getHttpServer())
        .get(`/procurement/suppliers/${testSupplier.id}/performance`)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        })
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('supplierId', testSupplier.id);
      expect(response.body).toHaveProperty('metrics');
      expect(response.body).toHaveProperty('recommendations');
      expect(response.body).toHaveProperty('aiInsights');
    });

    it('should discover suppliers based on requirements', async () => {
      const requirements = {
        categories: ['Electronics', 'Components'],
        capabilities: ['Manufacturing', 'Quality Testing'],
        regions: ['North America'],
        qualityRequirements: { minQualityRating: 4.0 },
        deliveryRequirements: { maxDeliveryTime: 14 },
        budgetConstraints: { maxPrice: 10000, paymentTerms: 30 },
      };

      const response = await request(app.getHttpServer())
        .post('/procurement/suppliers/discover')
        .send(requirements)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('recommendedSuppliers');
      expect(response.body).toHaveProperty('aiRecommendations');
      expect(response.body).toHaveProperty('riskAnalysis');
      expect(response.body).toHaveProperty('costAnalysis');
    });

    it('should get supplier analytics dashboard', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/suppliers/analytics')
        .query({ timeframe: 'quarter' })
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('performanceMetrics');
      expect(response.body).toHaveProperty('riskAnalysis');
      expect(response.body).toHaveProperty('trends');
    });

    it('should deny access to unauthorized users', async () => {
      await request(app.getHttpServer())
        .post('/procurement/suppliers')
        .send(createMockSupplier())
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(403);
    });
  });

  // ============================================================================
  // CONTRACT MANAGEMENT TESTS
  // ============================================================================

  describe('Contract Management', () => {
    let testSupplier: Supplier;
    let testContract: Contract;

    beforeEach(async () => {
      testSupplier = await supplierRepository.save(createMockSupplier());
      testContract = await contractRepository.save(createMockContract(testSupplier.id));
    });

    it('should search contracts with advanced filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/contracts')
        .query({
          status: 'ACTIVE',
          contractType: 'SERVICE',
          supplierId: testSupplier.id,
        })
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('contracts');
      expect(Array.isArray(response.body.contracts)).toBe(true);
    });

    it('should create new contract with AI validation', async () => {
      const contractData: ContractCreationDataDto = {
        title: 'Software Development Services Contract',
        contractType: 'SERVICE',
        supplierId: testSupplier.id,
        totalValue: 50000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        terms: [
          {
            key: 'payment_terms',
            value: '30 days net',
            description: 'Payment due within 30 days of invoice',
          },
          {
            key: 'delivery_schedule',
            value: 'Monthly deliverables',
            description: 'Work completed in monthly milestones',
          },
        ],
        description: 'Comprehensive software development services',
        attachments: ['contract-template.pdf', 'sow-document.pdf'],
        customFields: {
          projectManager: 'Jane Doe',
          technicalLead: 'John Smith',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/procurement/contracts')
        .query({ createdBy: mockBuyerUser.id })
        .send(contractData)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('contract');
      expect(response.body.data.contract.title).toBe(contractData.title);
    });

    it('should analyze contract using AI', async () => {
      const response = await request(app.getHttpServer())
        .get(`/procurement/contracts/${testContract.id}/analyze`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('contractId', testContract.id);
      expect(response.body).toHaveProperty('riskAssessment');
      expect(response.body).toHaveProperty('performanceAnalysis');
      expect(response.body).toHaveProperty('complianceAnalysis');
      expect(response.body).toHaveProperty('aiInsights');
    });

    it('should renew contract with optimization', async () => {
      const renewalData = {
        newEndDate: new Date('2025-12-31'),
        totalValue: 55000,
        renewalReason: 'Excellent performance and cost efficiency',
        renewedBy: mockBuyerUser.id,
        effectiveDate: new Date('2024-12-31'),
      };

      const response = await request(app.getHttpServer())
        .post(`/procurement/contracts/${testContract.id}/renew`)
        .send(renewalData)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('renewedContract');
    });

    it('should get contract analytics', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/contracts/analytics')
        .query({ timeframe: 'quarter' })
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('statusDistribution');
      expect(response.body).toHaveProperty('riskAnalysis');
      expect(response.body).toHaveProperty('financialAnalysis');
    });

    it('should enable blockchain integration for contract', async () => {
      const blockchainConfig = {
        platform: 'ethereum' as const,
        immutableClauses: ['payment_terms', 'delivery_schedule'],
        autoExecutionRules: [
          { trigger: 'milestone_completed', action: 'release_payment' },
        ],
      };

      const response = await request(app.getHttpServer())
        .post(`/procurement/contracts/${testContract.id}/blockchain`)
        .send(blockchainConfig)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('blockchainIntegration');
    });
  });

  // ============================================================================
  // AUTONOMOUS PURCHASE ORDER TESTS
  // ============================================================================

  describe('Autonomous Purchase Order Processing', () => {
    let testSupplier: Supplier;

    beforeEach(async () => {
      testSupplier = await supplierRepository.save(createMockSupplier());
    });

    it('should process autonomous purchase order request', async () => {
      const autoPoRequest: AutoPORequestDto = {
        items: [
          {
            description: 'High-Performance Laptop',
            quantity: 5,
            unitPrice: 1200,
            unit: 'each',
            category: 'IT Equipment',
            specifications: {
              processor: 'Intel i7',
              memory: '16GB RAM',
              storage: '512GB SSD',
            },
          },
          {
            description: 'Wireless Mouse',
            quantity: 5,
            unitPrice: 45,
            unit: 'each',
            category: 'IT Accessories',
          },
        ],
        preferredSupplierId: testSupplier.id,
        priority: 'MEDIUM',
        department: 'IT',
        requestedBy: mockBuyerUser.id,
        budgetLimit: 7000,
        requiredBy: new Date('2024-06-01'),
        deliveryInstructions: {
          address: '123 Corporate Blvd, Tech City, TC 12345',
          contactPerson: 'Jane Doe',
          specialInstructions: 'Delivery during business hours only',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/procurement/purchase-orders/autonomous')
        .send(autoPoRequest)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('purchaseOrderId');
      expect(response.body).toHaveProperty('processingDetails');
      expect(response.body).toHaveProperty('selectedSupplier');
      expect(response.body).toHaveProperty('costAnalysis');
    });

    it('should batch process multiple PO requests', async () => {
      const batchRequests = [
        createMockAutoPoRequest(testSupplier.id),
        createMockAutoPoRequest(testSupplier.id),
      ];

      const response = await request(app.getHttpServer())
        .post('/procurement/purchase-orders/batch')
        .send(batchRequests)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('batchResults');
      expect(Array.isArray(response.body.batchResults)).toBe(true);
      expect(response.body.batchResults).toHaveLength(2);
    });

    it('should optimize existing purchase order', async () => {
      const testPO = await purchaseOrderRepository.save(
        createMockPurchaseOrder(testSupplier.id)
      );

      const response = await request(app.getHttpServer())
        .put(`/procurement/purchase-orders/${testPO.id}/optimize`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('optimizationResults');
      expect(response.body).toHaveProperty('recommendations');
      expect(response.body).toHaveProperty('potentialSavings');
    });

    it('should optimize pricing for purchase order', async () => {
      const testPO = await purchaseOrderRepository.save(
        createMockPurchaseOrder(testSupplier.id)
      );

      const response = await request(app.getHttpServer())
        .put(`/procurement/purchase-orders/${testPO.id}/pricing/optimize`)
        .query({ strategy: 'balanced' })
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('pricingOptimization');
      expect(response.body).toHaveProperty('recommendations');
    });

    it('should get consolidation opportunities', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/purchase-orders/consolidation')
        .query({ department: 'IT', timeWindow: 7 })
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('opportunities');
      expect(Array.isArray(response.body.opportunities)).toBe(true);
    });

    it('should get autonomous processing analytics', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/purchase-orders/analytics')
        .query({ timeframe: 'month' })
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('volume');
      expect(response.body).toHaveProperty('performance');
      expect(response.body).toHaveProperty('savings');
      expect(response.body).toHaveProperty('trends');
    });
  });

  // ============================================================================
  // ANALYTICS DASHBOARD TESTS
  // ============================================================================

  describe('Analytics Dashboard', () => {
    it('should get comprehensive dashboard metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/analytics/dashboard')
        .query({
          timeframe: 'month',
          refreshCache: true,
          departments: ['IT', 'Finance'],
          categories: ['Software', 'Hardware'],
        })
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('financial');
      expect(response.body).toHaveProperty('operational');
      expect(response.body).toHaveProperty('supplier');
      expect(response.body).toHaveProperty('contracts');
      expect(response.body).toHaveProperty('performance');
      expect(response.body).toHaveProperty('risk');
      expect(response.body).toHaveProperty('sustainability');
      expect(response.body).toHaveProperty('aiInsights');
    });

    it('should get dashboard alerts', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/analytics/alerts')
        .query({
          severity: 'high',
          unacknowledgedOnly: true,
        })
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('alerts');
      expect(Array.isArray(response.body.alerts)).toBe(true);
    });

    it('should create custom report configuration', async () => {
      const reportConfig = {
        name: 'Monthly Spend Analysis',
        description: 'Detailed analysis of monthly spending patterns',
        category: 'financial',
        metrics: ['totalSpend', 'avgOrderValue', 'costSavings'],
        filters: ['department', 'category'],
        schedule: 'monthly',
        recipients: ['manager@company.com', 'finance@company.com'],
      };

      const response = await request(app.getHttpServer())
        .post('/procurement/analytics/reports')
        .send(reportConfig)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('reportId');
      expect(response.body.data.name).toBe(reportConfig.name);
    });

    it('should generate custom report', async () => {
      // First create a report configuration
      const reportConfig = {
        name: 'Test Report',
        category: 'operational',
        metrics: ['totalOrders', 'automationRate'],
      };

      const createResponse = await request(app.getHttpServer())
        .post('/procurement/analytics/reports')
        .send(reportConfig)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(201);

      const reportId = createResponse.body.reportId;

      // Then generate the report
      const response = await request(app.getHttpServer())
        .get(`/procurement/analytics/reports/${reportId}/generate`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('report');
      expect(response.body).toHaveProperty('status', 'completed');
    });

    it('should get benchmark data', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/analytics/benchmarks/IT Equipment')
        .query({
          region: 'North America',
          industry: 'Technology',
        })
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('category', 'IT Equipment');
      expect(response.body).toHaveProperty('benchmarks');
      expect(response.body).toHaveProperty('insights');
      expect(response.body).toHaveProperty('recommendations');
    });

    it('should export dashboard data', async () => {
      const exportOptions: ExportOptionsDto = {
        format: 'excel',
        timeframe: 'month',
        sections: ['financial', 'operational', 'supplier'],
        includeCharts: true,
        template: 'executive-summary',
      };

      const response = await request(app.getHttpServer())
        .post('/procurement/analytics/export')
        .send(exportOptions)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('exportId');
      expect(response.body).toHaveProperty('downloadUrl');
      expect(response.body).toHaveProperty('expiresAt');
    });
  });

  // ============================================================================
  // AI PROCUREMENT INTELLIGENCE TESTS
  // ============================================================================

  describe('AI Procurement Intelligence', () => {
    it('should get AI market intelligence', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/ai/market-intelligence')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('insights');
      expect(response.body).toHaveProperty('recommendations');
      expect(response.body).toHaveProperty('marketTrends');
    });

    it('should get AI demand forecast', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/ai/demand-forecast')
        .query({
          category: 'IT Equipment',
          timeHorizon: 90,
        })
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('forecast');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body).toHaveProperty('factors');
    });

    it('should analyze supplier using AI', async () => {
      const testSupplier = await supplierRepository.save(createMockSupplier());

      const response = await request(app.getHttpServer())
        .get(`/procurement/ai/suppliers/${testSupplier.id}/analyze`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('supplierId', testSupplier.id);
      expect(response.body).toHaveProperty('analysis');
      expect(response.body).toHaveProperty('recommendations');
      expect(response.body).toHaveProperty('riskAssessment');
    });

    it('should get comprehensive AI insights', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/ai/insights')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('insights');
      expect(Array.isArray(response.body.insights)).toBe(true);
      expect(response.body).toHaveProperty('priorityActions');
      expect(response.body).toHaveProperty('riskAlerts');
    });
  });

  // ============================================================================
  // BLOCKCHAIN INTEGRATION TESTS
  // ============================================================================

  describe('Blockchain Integration', () => {
    let testSupplier: Supplier;
    let testPO: PurchaseOrder;
    let testContract: Contract;

    beforeEach(async () => {
      testSupplier = await supplierRepository.save(createMockSupplier());
      testPO = await purchaseOrderRepository.save(createMockPurchaseOrder(testSupplier.id));
      testContract = await contractRepository.save(createMockContract(testSupplier.id));
    });

    it('should record purchase order on blockchain', async () => {
      const response = await request(app.getHttpServer())
        .post(`/procurement/blockchain/purchase-orders/${testPO.id}/record`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('transactionHash');
      expect(response.body.data).toHaveProperty('blockchainNetwork');
    });

    it('should record contract on blockchain', async () => {
      const response = await request(app.getHttpServer())
        .post(`/procurement/blockchain/contracts/${testContract.id}/record`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('transactionHash');
    });

    it('should verify data integrity against blockchain', async () => {
      const response = await request(app.getHttpServer())
        .get(`/procurement/blockchain/verify/purchase-order/${testPO.id}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('isValid');
      expect(response.body).toHaveProperty('verificationDetails');
    });

    it('should get blockchain transaction history', async () => {
      const response = await request(app.getHttpServer())
        .get(`/procurement/blockchain/history/contract/${testContract.id}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('transactions');
      expect(Array.isArray(response.body.transactions)).toBe(true);
    });
  });

  // ============================================================================
  // MARKET INTELLIGENCE TESTS
  // ============================================================================

  describe('Market Intelligence', () => {
    it('should get real-time market intelligence', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/market/intelligence/IT Equipment')
        .query({
          region: 'North America',
          includeForecasting: true,
        })
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('category', 'IT Equipment');
      expect(response.body).toHaveProperty('marketConditions');
      expect(response.body).toHaveProperty('priceAnalysis');
      expect(response.body).toHaveProperty('supplierAnalysis');
      expect(response.body).toHaveProperty('riskAssessment');
    });

    it('should generate market forecast', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/market/forecast/Electronics')
        .query({
          region: 'Global',
          months: 12,
        })
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('category', 'Electronics');
      expect(response.body).toHaveProperty('forecast');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body).toHaveProperty('trends');
    });

    it('should get competitive intelligence', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/market/competitive/Software')
        .query({ region: 'Global' })
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('competitiveAnalysis');
      expect(response.body).toHaveProperty('marketLeaders');
      expect(response.body).toHaveProperty('pricingTrends');
    });

    it('should assess supply risk', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/market/risks/Semiconductors')
        .query({
          region: 'Asia',
          timeHorizon: 'medium',
        })
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('riskLevel');
      expect(response.body).toHaveProperty('riskFactors');
      expect(response.body).toHaveProperty('mitigationStrategies');
    });

    it('should get market dashboard', async () => {
      const response = await request(app.getHttpServer())
        .get('/procurement/market/dashboard')
        .query({
          categories: ['IT Equipment', 'Software'],
          regions: ['North America', 'Europe'],
        })
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('marketOverview');
      expect(response.body).toHaveProperty('categoryInsights');
      expect(response.body).toHaveProperty('riskAlerts');
    });
  });

  // ============================================================================
  // AUTHORIZATION AND SECURITY TESTS
  // ============================================================================

  describe('Authorization & Security', () => {
    it('should deny access without authentication', async () => {
      await request(app.getHttpServer())
        .get('/procurement/suppliers')
        .expect(401);
    });

    it('should deny access with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/procurement/suppliers')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });

    it('should enforce role-based access control', async () => {
      // Viewer should not be able to create suppliers
      await request(app.getHttpServer())
        .post('/procurement/suppliers')
        .send(createMockSupplier())
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(403);

      // Admin should be able to access all endpoints
      await request(app.getHttpServer())
        .get('/procurement/configuration')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should validate order value restrictions', async () => {
      const highValueRequest = createMockAutoPoRequest('supplier-id');
      // Set high value that exceeds buyer limit
      highValueRequest.items[0].unitPrice = 200000;

      await request(app.getHttpServer())
        .post('/procurement/purchase-orders/autonomous')
        .send(highValueRequest)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });

    it('should audit all actions', async () => {
      // Perform some actions
      await request(app.getHttpServer())
        .get('/procurement/suppliers')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      // Check if audit log was created
      const auditLogs = await auditLogRepository.find();
      expect(auditLogs.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // ERROR HANDLING AND VALIDATION TESTS
  // ============================================================================

  describe('Error Handling & Validation', () => {
    it('should validate request body structure', async () => {
      const invalidSupplierData = {
        name: '', // Empty name should fail validation
        type: 'INVALID_TYPE', // Invalid enum value
        // Missing required fields
      };

      const response = await request(app.getHttpServer())
        .post('/procurement/suppliers')
        .send(invalidSupplierData)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should handle non-existent resource requests', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .get(`/procurement/suppliers/${nonExistentId}/performance`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(404);
    });

    it('should handle service failures gracefully', async () => {
      // This test would mock service failures and verify error handling
      // Implementation depends on specific service mocking strategy
    });
  });

  // ============================================================================
  // PERFORMANCE AND LOAD TESTS
  // ============================================================================

  describe('Performance Tests', () => {
    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = Array(10).fill(0).map(() =>
        request(app.getHttpServer())
          .get('/procurement/suppliers')
          .set('Authorization', `Bearer ${buyerToken}`)
      );

      const responses = await Promise.all(concurrentRequests);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should implement proper caching', async () => {
      const startTime = Date.now();

      // First request
      await request(app.getHttpServer())
        .get('/procurement/analytics/dashboard')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      const firstRequestTime = Date.now() - startTime;

      // Second request (should be cached)
      const secondStartTime = Date.now();
      await request(app.getHttpServer())
        .get('/procurement/analytics/dashboard')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      const secondRequestTime = Date.now() - secondStartTime;

      // Second request should be significantly faster due to caching
      expect(secondRequestTime).toBeLessThan(firstRequestTime);
    });
  });
});

// ============================================================================
// UTILITY FUNCTIONS FOR TESTS
// ============================================================================

function createMockAutoPoRequest(supplierId: string): AutoPORequestDto {
  return {
    items: [
      {
        description: 'Office Supplies',
        quantity: 10,
        unitPrice: 25,
        unit: 'each',
        category: 'Office',
      },
    ],
    preferredSupplierId: supplierId,
    priority: 'MEDIUM',
    department: 'Operations',
    requestedBy: 'test-user-id',
    budgetLimit: 500,
  };
}
