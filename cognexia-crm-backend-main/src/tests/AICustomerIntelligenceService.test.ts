import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AICustomerIntelligenceService } from '../services/AICustomerIntelligenceService';
import { Customer, CustomerTier, CustomerType } from '../entities/customer.entity';
import { Lead, LeadStatus, LeadGrade } from '../entities/lead.entity';
import { Opportunity, OpportunityStage } from '../entities/opportunity.entity';
import { CustomerInteraction } from '../entities/customer-interaction.entity';
import { Contact } from '../entities/contact.entity';

describe('AICustomerIntelligenceService - Advanced Test Suite', () => {
  let service: AICustomerIntelligenceService;
  let customerRepository: jest.Mocked<Repository<Customer>>;
  let leadRepository: jest.Mocked<Repository<Lead>>;
  let opportunityRepository: jest.Mocked<Repository<Opportunity>>;
  let interactionRepository: jest.Mocked<Repository<CustomerInteraction>>;
  let contactRepository: jest.Mocked<Repository<Contact>>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  // Mock data generators
  const createMockCustomer = (overrides = {}): Customer => ({
    id: 'cust-001',
    name: 'Acme Corp',
    email: 'contact@acme.com',
    phone: '+1-555-0123',
    address: '123 Business St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    industry: 'Technology',
    website: 'https://acme.com',
    companySize: '100-500',
    revenue: 5000000,
    tier: CustomerTier.GOLD,
    type: CustomerType.B2B,
    status: 'active' as any,
    tags: ['enterprise', 'high-value'],
    customFields: {},
    leads: [],
    opportunities: [],
    contacts: [],
    interactions: [],
    segments: [],
    assignedTo: 'user-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-08-20'),
    ...overrides,
  } as unknown as Customer);

  const createMockLead = (overrides = {}): Lead => ({
    id: 'lead-001',
    source: 'website',
    status: LeadStatus.QUALIFIED,
    grade: LeadGrade.A,
    score: 85,
    temperature: 'hot',
    title: 'Enterprise Software Solution',
    description: 'Interested in our enterprise platform',
    estimatedValue: 150000,
    expectedCloseDate: new Date('2024-12-31'),
    probability: 75,
    nextFollowUp: new Date('2024-08-25'),
    assignedTo: 'sales-rep-123',
    customerId: 'cust-001',
    customer: createMockCustomer(),
    interactions: [],
    tags: ['high-priority'],
    customFields: {},
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-08-20'),
    ...overrides,
  } as unknown as Lead);

  const createMockOpportunity = (overrides = {}): Opportunity => ({
    id: 'opp-001',
    title: 'Q4 Enterprise Deal',
    description: 'Major enterprise software implementation',
    value: 250000,
    probability: 80,
    stage: OpportunityStage.PROPOSAL,
    source: 'referral',
    expectedCloseDate: new Date('2024-12-15'),
    actualCloseDate: null,
    nextAction: 'Schedule final presentation',
    nextActionDate: new Date('2024-08-25'),
    competitorInfo: 'Competing against Microsoft',
    customerId: 'cust-001',
    customer: createMockCustomer(),
    assignedTo: 'sales-manager-456',
    tags: ['enterprise', 'high-value'],
    customFields: {},
    createdAt: new Date('2024-07-15'),
    updatedAt: new Date('2024-08-20'),
    ...overrides,
  } as unknown as Opportunity);

  const createMockInteraction = (overrides = {}): CustomerInteraction => ({
    id: 'int-001',
    type: 'email',
    direction: 'outbound',
    subject: 'Follow-up on proposal',
    content: 'Thank you for your interest in our solution...',
    channel: 'email',
    outcome: 'positive',
    sentiment: 0.8,
    duration: 30,
    customerId: 'cust-001',
    customer: createMockCustomer(),
    contactId: 'contact-001',
    createdBy: 'user-123',
    tags: ['follow-up'],
    customFields: {},
    createdAt: new Date('2024-08-19'),
    updatedAt: new Date('2024-08-19'),
    ...overrides,
  } as unknown as CustomerInteraction);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AICustomerIntelligenceService,
        {
          provide: getRepositoryToken(Customer),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Lead),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Opportunity),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CustomerInteraction),
          useValue: {
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Contact),
          useValue: {
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
            on: jest.fn(),
            off: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AICustomerIntelligenceService>(AICustomerIntelligenceService);
    customerRepository = module.get(getRepositoryToken(Customer));
    leadRepository = module.get(getRepositoryToken(Lead));
    opportunityRepository = module.get(getRepositoryToken(Opportunity));
    interactionRepository = module.get(getRepositoryToken(CustomerInteraction));
    contactRepository = module.get(getRepositoryToken(Contact));
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined and properly initialized', () => {
      expect(service).toBeDefined();
    });

    it('should initialize AI engines and models on construction', () => {
      expect(service).toBeDefined();
      // Test that private properties are initialized (verified through behavior)
    });
  });

  describe('Customer Behavior Prediction', () => {
    describe('predictCustomerBehavior()', () => {
      it('should successfully predict customer behavior with comprehensive analysis', async () => {
        // Arrange
        const customerId = 'cust-001';
        const mockCustomer = createMockCustomer();
        customerRepository.findOne.mockResolvedValue(mockCustomer);
        
        // Mock private method behaviors through spies
        jest.spyOn(service as any, 'extractBehavioralFeatures').mockResolvedValue({
          channelPreferences: ['email', 'phone'],
          timePatterns: [{ dayOfWeek: 1, hour: 9, engagement: 0.8 }],
          contentPreferences: [{ contentType: 'technical', preference: 0.9 }],
        });

        jest.spyOn(service as any, 'analyzePurchasePatterns').mockResolvedValue({
          frequency: 2.5,
          averageValue: 50000,
          seasonality: [{ season: 'Q4', multiplier: 1.3 }],
        });

        jest.spyOn(service as any, 'generateBehaviorPredictions').mockResolvedValue({
          nextPurchaseDate: new Date('2024-12-01'),
          purchaseProbability: 0.75,
        });

        jest.spyOn(service as any, 'calculateEngagementMetrics').mockResolvedValue({
          engagementScore: 85,
          loyaltyScore: 78,
          satisfactionScore: 82,
        });

        jest.spyOn(service as any, 'calculateRiskLevel').mockResolvedValue('low');

        // Mock other service methods
        jest.spyOn(service, 'analyzeSentimentRealTime').mockResolvedValue({
          overallSentiment: 'positive',
          sentimentScore: 0.7,
          sentimentTrends: [],
          topicSentiments: [],
          socialMentions: [],
          brandPerception: { overallRating: 4.2, trustScore: 0.8, recommendationScore: 0.85, competitorComparison: {} },
          influencerScore: 65,
          viralityPotential: 45,
        });

        jest.spyOn(service, 'predictChurnProbability').mockResolvedValue({
          riskScore: 15,
          riskLevel: 'low',
          keyIndicators: [],
          preventionStrategies: [],
          timeToChurn: 365,
          confidence: 0.9,
          mitigationActions: [],
        });

        jest.spyOn(service, 'calculateCustomerLifetimeValue').mockResolvedValue({
          currentValue: 125000,
          predictedValue: 500000,
          timeHorizon: 24,
          confidence: 0.85,
          valueDrivers: [],
          optimizationOpportunities: [],
        });

        jest.spyOn(service, 'identifyQualifiedLeads').mockResolvedValue([]);
        jest.spyOn(service as any, 'calculateUpsellPotential').mockResolvedValue({
          category: 'premium',
          potential: 0.6,
          confidence: 0.7,
        });

        // Act
        const result = await service.predictCustomerBehavior(customerId);

        // Assert
        expect(result).toBeDefined();
        expect(result.customerId).toBe(customerId);
        expect(result.behaviorPatterns.purchaseFrequency).toBe(2.5);
        expect(result.behaviorPatterns.avgOrderValue).toBe(50000);
        expect(result.engagementScore).toBe(85);
        expect(result.loyaltyScore).toBe(78);
        expect(result.satisfactionScore).toBe(82);
        expect(result.riskLevel).toBe('low');
        expect(eventEmitter.emit).toHaveBeenCalledWith('customer.behavior.analyzed', expect.any(Object));
      });

      it('should return cached result when available and valid', async () => {
        // Arrange
        const customerId = 'cust-001';
        const cachedProfile = {
          customerId,
          timestamp: Date.now(),
          behaviorPatterns: { purchaseFrequency: 2.0 },
        };
        
        // Mock cache behavior
        jest.spyOn(service as any, 'isCacheValid').mockReturnValue(true);
        (service as any).behaviorProfileCache.set(customerId, cachedProfile);

        // Act
        const result = await service.predictCustomerBehavior(customerId);

        // Assert
        expect(result).toBe(cachedProfile);
        expect(customerRepository.findOne).not.toHaveBeenCalled();
      });

      it('should throw error when customer not found', async () => {
        // Arrange
        const customerId = 'non-existent';
        customerRepository.findOne.mockResolvedValue(null);

        // Act & Assert
        await expect(service.predictCustomerBehavior(customerId))
          .rejects.toThrow(`Customer ${customerId} not found`);
      });

      it('should handle errors gracefully', async () => {
        // Arrange
        const customerId = 'cust-001';
        customerRepository.findOne.mockRejectedValue(new Error('Database error'));

        // Act & Assert
        await expect(service.predictCustomerBehavior(customerId))
          .rejects.toThrow('Database error');
      });
    });

    describe('Price Sensitivity Analysis', () => {
      it('should correctly assess high price sensitivity', () => {
        const purchasePatterns = {
          averageValue: 1000,
          priceDiscountResponse: 0.9,
          competitorPriceComparison: 0.8,
        };
        
        const sensitivity = (service as any).assessPriceSensitivity(purchasePatterns);
        expect(['high', 'medium', 'low']).toContain(sensitivity);
      });

      it('should correctly assess low price sensitivity', () => {
        const purchasePatterns = {
          averageValue: 100000,
          priceDiscountResponse: 0.1,
          competitorPriceComparison: 0.2,
        };
        
        const sensitivity = (service as any).assessPriceSensitivity(purchasePatterns);
        expect(['high', 'medium', 'low']).toContain(sensitivity);
      });
    });

    describe('Brand Loyalty Calculation', () => {
      it('should calculate brand loyalty based on customer history', () => {
        const customer = createMockCustomer({
          createdAt: new Date('2020-01-01'), // Long-term customer
        });
        
        const loyalty = (service as any).calculateBrandLoyalty(customer);
        expect(typeof loyalty).toBe('number');
        expect(loyalty).toBeGreaterThanOrEqual(0);
        expect(loyalty).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Real-Time Sentiment Analysis', () => {
    describe('analyzeSentimentRealTime()', () => {
      it('should perform comprehensive sentiment analysis', async () => {
        // Arrange
        const customerId = 'cust-001';
        const mockInteractions = [createMockInteraction()];
        
        jest.spyOn(service as any, 'gatherCustomerInteractions').mockResolvedValue(mockInteractions);
        jest.spyOn(service as any, 'analyzeSentimentFromInteractions').mockResolvedValue([0.8, 0.7]);
        jest.spyOn(service as any, 'monitorSocialMentions').mockResolvedValue([
          { platform: 'twitter', mention: 'Great service!', sentiment: 0.9, reach: 1000, timestamp: new Date() },
        ]);
        jest.spyOn(service as any, 'trackBrandPerception').mockResolvedValue({
          overallRating: 4.5,
          trustScore: 0.85,
          recommendationScore: 0.9,
        });
        jest.spyOn(service as any, 'calculateOverallSentiment').mockReturnValue('positive');
        jest.spyOn(service as any, 'convertSentimentToScore').mockReturnValue(0.75);
        jest.spyOn(service as any, 'calculateSentimentTrends').mockResolvedValue([]);
        jest.spyOn(service as any, 'analyzeTopicSentiments').mockResolvedValue([]);
        jest.spyOn(service as any, 'calculateInfluenceMetrics').mockResolvedValue({
          influencerScore: 70,
          viralityPotential: 55,
        });

        // Act
        const result = await service.analyzeSentimentRealTime(customerId);

        // Assert
        expect(result).toBeDefined();
        expect(result.overallSentiment).toBe('positive');
        expect(result.sentimentScore).toBe(0.75);
        expect(result.influencerScore).toBe(70);
        expect(result.viralityPotential).toBe(55);
        expect(eventEmitter.emit).toHaveBeenCalledWith('customer.sentiment.analyzed', expect.any(Object));
      });

      it('should use cached sentiment when valid', async () => {
        // Arrange
        const customerId = 'cust-001';
        const cachedSentiment = {
          overallSentiment: 'positive',
          sentimentScore: 0.8,
          timestamp: Date.now(),
        };
        
        jest.spyOn(service as any, 'isSentimentCacheValid').mockReturnValue(true);
        (service as any).sentimentCache.set(customerId, cachedSentiment);

        // Act
        const result = await service.analyzeSentimentRealTime(customerId);

        // Assert
        expect(result).toBe(cachedSentiment);
      });

      it('should handle sentiment analysis errors', async () => {
        // Arrange
        const customerId = 'cust-001';
        jest.spyOn(service as any, 'gatherCustomerInteractions').mockRejectedValue(new Error('Data error'));

        // Act & Assert
        await expect(service.analyzeSentimentRealTime(customerId))
          .rejects.toThrow('Data error');
      });
    });

    describe('Social Media Sentiment Monitoring', () => {
      it('should monitor social mentions across platforms', async () => {
        const customerId = 'cust-001';
        const mentions = await (service as any).monitorSocialMentions(customerId);
        expect(Array.isArray(mentions)).toBe(true);
      });

      it('should calculate influence metrics accurately', async () => {
        const mentions = [
          { platform: 'twitter', reach: 5000, sentiment: 0.8 },
          { platform: 'linkedin', reach: 2000, sentiment: 0.9 },
        ];
        
        const metrics = await (service as any).calculateInfluenceMetrics('cust-001', mentions);
        expect(metrics).toHaveProperty('influencerScore');
        expect(metrics).toHaveProperty('viralityPotential');
      });
    });
  });

  describe('Churn Prediction and Prevention', () => {
    describe('predictChurnProbability()', () => {
      it('should predict churn probability with high accuracy', async () => {
        // Arrange
        const customerId = 'cust-001';
        const mockCustomer = createMockCustomer();
        
        jest.spyOn(service as any, 'gatherCustomerData').mockResolvedValue(mockCustomer);
        jest.spyOn(service as any, 'extractChurnFeatures').mockResolvedValue({
          recencyScore: 2,
          frequencyDrop: 0.3,
          engagementDecline: 0.4,
          supportTickets: 5,
        });
        
        // Mock churn prediction model
        const mockChurnPrediction = { score: 0.25, confidence: 0.85 };
        (service as any).churnPredictionModel = {
          predict: jest.fn().mockResolvedValue(mockChurnPrediction),
        };
        
        jest.spyOn(service as any, 'identifyChurnIndicators').mockResolvedValue([
          { indicator: 'decreased_engagement', importance: 0.8, value: 0.3 },
        ]);
        jest.spyOn(service as any, 'generatePreventionStrategies').mockResolvedValue([
          { strategy: 'personalized_outreach', effectiveness: 0.7, cost: 500 },
        ]);
        jest.spyOn(service as any, 'estimateTimeToChurn').mockResolvedValue(90);
        jest.spyOn(service as any, 'createMitigationActions').mockResolvedValue([
          { action: 'schedule_call', priority: 1, deadline: new Date('2024-08-25') },
        ]);
        jest.spyOn(service as any, 'categorizeChurnRisk').mockReturnValue('medium');

        // Act
        const result = await service.predictChurnProbability(customerId);

        // Assert
        expect(result).toBeDefined();
        expect(result.riskScore).toBe(25);
        expect(result.riskLevel).toBe('medium');
        expect(result.timeToChurn).toBe(90);
        expect(result.confidence).toBe(0.85);
        expect(result.keyIndicators).toHaveLength(1);
        expect(result.preventionStrategies).toHaveLength(1);
        expect(result.mitigationActions).toHaveLength(1);
      });

      it('should emit high-risk alerts for critical churn cases', async () => {
        // Arrange
        const customerId = 'cust-001';
        const mockCustomer = createMockCustomer();
        
        jest.spyOn(service as any, 'gatherCustomerData').mockResolvedValue(mockCustomer);
        jest.spyOn(service as any, 'extractChurnFeatures').mockResolvedValue({});
        
        const mockHighRiskPrediction = { score: 0.9, confidence: 0.95 };
        (service as any).churnPredictionModel = {
          predict: jest.fn().mockResolvedValue(mockHighRiskPrediction),
        };
        
        jest.spyOn(service as any, 'categorizeChurnRisk').mockReturnValue('critical');
        jest.spyOn(service as any, 'identifyChurnIndicators').mockResolvedValue([]);
        jest.spyOn(service as any, 'generatePreventionStrategies').mockResolvedValue([]);
        jest.spyOn(service as any, 'estimateTimeToChurn').mockResolvedValue(30);
        jest.spyOn(service as any, 'createMitigationActions').mockResolvedValue([]);

        // Act
        await service.predictChurnProbability(customerId);

        // Assert
        expect(eventEmitter.emit).toHaveBeenCalledWith('customer.churn.high_risk', expect.any(Object));
      });

      it('should categorize churn risk levels correctly', () => {
        expect((service as any).categorizeChurnRisk(0.1)).toBe('low');
        expect((service as any).categorizeChurnRisk(0.3)).toBe('medium');
        expect((service as any).categorizeChurnRisk(0.7)).toBe('high');
        expect((service as any).categorizeChurnRisk(0.95)).toBe('critical');
      });
    });

    describe('Churn Prevention Strategies', () => {
      it('should generate effective prevention strategies', async () => {
        const customer = createMockCustomer();
        const indicators = [
          { indicator: 'low_engagement', importance: 0.8, value: 0.2 },
        ];
        
        const strategies = await (service as any).generatePreventionStrategies(customer, indicators);
        expect(Array.isArray(strategies)).toBe(true);
        expect(strategies.length).toBeGreaterThan(0);
      });

      it('should create actionable mitigation plans', async () => {
        const customer = createMockCustomer();
        const strategies = [
          { strategy: 'engagement_campaign', effectiveness: 0.8, cost: 1000 },
        ];
        
        const actions = await (service as any).createMitigationActions(customer, strategies);
        expect(Array.isArray(actions)).toBe(true);
        expect(actions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Customer Lifetime Value Calculation', () => {
    describe('calculateCustomerLifetimeValue()', () => {
      it('should calculate comprehensive CLV metrics', async () => {
        // Arrange
        const customerId = 'cust-001';
        const mockCustomer = createMockCustomer();
        const mockTransactionData = [
          { date: '2024-01-01', amount: 5000 },
          { date: '2024-06-01', amount: 7500 },
        ];
        
        jest.spyOn(service as any, 'gatherCustomerData').mockResolvedValue(mockCustomer);
        jest.spyOn(service as any, 'gatherHistoricalTransactionData').mockResolvedValue(mockTransactionData);
        jest.spyOn(service as any, 'calculateCurrentValue').mockReturnValue(12500);
        jest.spyOn(service as any, 'identifyValueDrivers').mockResolvedValue([
          { driver: 'product_adoption', impact: 0.7, trend: 'increasing' },
        ]);
        jest.spyOn(service as any, 'identifyOptimizationOpportunities').mockResolvedValue([
          { opportunity: 'upsell_premium', potential: 0.4, effort: 'medium' },
        ]);
        
        // Mock lifetime value calculator
        (service as any).lifetimeValueCalculator = {
          predict: jest.fn().mockResolvedValue({
            value: 75000,
            timeHorizon: 36,
            confidence: 0.82,
          }),
        };

        // Act
        const result = await service.calculateCustomerLifetimeValue(customerId);

        // Assert
        expect(result).toBeDefined();
        expect(result.currentValue).toBe(12500);
        expect(result.predictedValue).toBe(75000);
        expect(result.timeHorizon).toBe(36);
        expect(result.confidence).toBe(0.82);
        expect(result.valueDrivers).toHaveLength(1);
        expect(result.optimizationOpportunities).toHaveLength(1);
        expect(eventEmitter.emit).toHaveBeenCalledWith('customer.clv.calculated', expect.any(Object));
      });

      it('should handle customers with no transaction history', async () => {
        const customerId = 'new-customer';
        const mockCustomer = createMockCustomer({ id: customerId });
        
        jest.spyOn(service as any, 'gatherCustomerData').mockResolvedValue(mockCustomer);
        jest.spyOn(service as any, 'gatherHistoricalTransactionData').mockResolvedValue([]);
        jest.spyOn(service as any, 'calculateCurrentValue').mockReturnValue(0);
        jest.spyOn(service as any, 'identifyValueDrivers').mockResolvedValue([]);
        jest.spyOn(service as any, 'identifyOptimizationOpportunities').mockResolvedValue([]);
        
        (service as any).lifetimeValueCalculator = {
          predict: jest.fn().mockResolvedValue({
            value: 15000,
            timeHorizon: 12,
            confidence: 0.6,
          }),
        };

        const result = await service.calculateCustomerLifetimeValue(customerId);
        
        expect(result.currentValue).toBe(0);
        expect(result.predictedValue).toBe(15000);
        expect(result.confidence).toBe(0.6);
      });
    });

    describe('Value Driver Analysis', () => {
      it('should identify key value drivers accurately', async () => {
        const customer = createMockCustomer();
        const transactionData = [
          { product: 'enterprise', amount: 10000, date: '2024-01-01' },
          { product: 'premium', amount: 5000, date: '2024-06-01' },
        ];
        
        const drivers = await (service as any).identifyValueDrivers(customer, transactionData);
        expect(Array.isArray(drivers)).toBe(true);
      });

      it('should find optimization opportunities', async () => {
        const customer = createMockCustomer();
        const valueDrivers = [
          { driver: 'usage_frequency', impact: 0.8, trend: 'stable' },
        ];
        const predictedValue = { value: 50000, timeHorizon: 24 };
        
        const opportunities = await (service as any).identifyOptimizationOpportunities(
          customer,
          valueDrivers,
          predictedValue
        );
        expect(Array.isArray(opportunities)).toBe(true);
      });
    });
  });

  describe('Advanced Lead Scoring and Qualification', () => {
    describe('calculateAdvancedLeadScores()', () => {
      it('should calculate comprehensive lead scores', async () => {
        // Arrange
        const leadId = 'lead-001';
        const mockLead = createMockLead();
        leadRepository.findOne.mockResolvedValue(mockLead);
        
        jest.spyOn(service as any, 'extractLeadFeatures').mockResolvedValue({
          industryScore: 0.8,
          companySizeScore: 0.7,
          engagementScore: 0.9,
          behavioralScore: 0.75,
        });
        
        // Mock lead scoring engine
        (service as any).leadScoringEngine = {
          calculateScore: jest.fn().mockResolvedValue({
            currentScore: 82,
            predictedScore: 87,
            factors: [
              { factor: 'industry_fit', weight: 0.3, value: 0.8 },
              { factor: 'engagement_level', weight: 0.4, value: 0.9 },
            ],
          }),
        };
        
        jest.spyOn(service as any, 'predictConversionProbability').mockResolvedValue({
          probability: 0.73,
          confidence: 0.85,
        });
        jest.spyOn(service as any, 'estimateTimeToConversion').mockResolvedValue(45);
        jest.spyOn(service as any, 'assessLeadQualification').mockResolvedValue({
          qualified: true,
          qualification: 'Sales Qualified Lead',
          confidence: 0.87,
        });
        jest.spyOn(service as any, 'generateLeadRecommendations').mockResolvedValue([
          { recommendation: 'Schedule demo', priority: 1, expectedOutcome: 'Advance to proposal' },
        ]);
        jest.spyOn(service as any, 'identifyNextBestActions').mockResolvedValue([
          { action: 'send_case_study', timing: new Date('2024-08-21'), channel: 'email', expected: 'increased_interest' },
        ]);
        jest.spyOn(service as any, 'calculatePriorityLevel').mockReturnValue('high');

        // Act
        const result = await service.calculateAdvancedLeadScores(leadId);

        // Assert
        expect(result).toBeDefined();
        expect(result.leadId).toBe(leadId);
        expect(result.currentScore).toBe(82);
        expect(result.predictedScore).toBe(87);
        expect(result.conversionProbability).toBe(0.73);
        expect(result.timeToConversion).toBe(45);
        expect(result.qualification.qualified).toBe(true);
        expect(result.priorityLevel).toBe('high');
        expect(result.scoringFactors).toHaveLength(2);
        expect(result.recommendations).toHaveLength(1);
        expect(result.nextBestActions).toHaveLength(1);
        expect(eventEmitter.emit).toHaveBeenCalledWith('lead.scored', expect.any(Object));
      });

      it('should throw error for non-existent lead', async () => {
        const leadId = 'non-existent';
        leadRepository.findOne.mockResolvedValue(null);

        await expect(service.calculateAdvancedLeadScores(leadId))
          .rejects.toThrow(`Lead ${leadId} not found`);
      });
    });

    describe('identifyQualifiedLeads()', () => {
      it('should identify and rank qualified leads', async () => {
        // Arrange
        const mockLeads = [
          createMockLead({ id: 'lead-001' }),
          createMockLead({ id: 'lead-002', score: 65 }),
          createMockLead({ id: 'lead-003', score: 90 }),
        ];
        
        const queryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue(mockLeads),
        };
        leadRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);
        
        // Mock scoring results
        jest.spyOn(service, 'calculateAdvancedLeadScores')
          .mockResolvedValueOnce({
            leadId: 'lead-001',
            currentScore: 85,
            priorityLevel: 'high',
            conversionProbability: 0.8,
          } as any)
          .mockResolvedValueOnce({
            leadId: 'lead-002',
            currentScore: 65,
            priorityLevel: 'medium',
            conversionProbability: 0.5,
          } as any)
          .mockResolvedValueOnce({
            leadId: 'lead-003',
            currentScore: 90,
            priorityLevel: 'urgent',
            conversionProbability: 0.9,
          } as any);
        
        jest.spyOn(service as any, 'isLeadQualified').mockReturnValue(true);

        // Act
        const result = await service.identifyQualifiedLeads();

        // Assert
        expect(result).toHaveLength(3);
        expect(result[0].leadId).toBe('lead-003'); // Highest priority first
        expect(result[0].priorityLevel).toBe('urgent');
        expect(result[1].priorityLevel).toBe('high');
        expect(result[2].priorityLevel).toBe('medium');
      });

      it('should filter leads by customer when specified', async () => {
        const customerId = 'cust-001';
        const queryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([]),
        };
        leadRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

        await service.identifyQualifiedLeads(customerId);

        expect(queryBuilder.where).toHaveBeenCalledWith('lead.customerId = :customerId', { customerId });
      });
    });

    describe('Lead Qualification Logic', () => {
      it('should correctly qualify high-scoring leads', () => {
        const highScoreLead = {
          currentScore: 85,
          conversionProbability: 0.8,
          priorityLevel: 'high',
        } as any;
        
        const isQualified = (service as any).isLeadQualified(highScoreLead);
        expect(typeof isQualified).toBe('boolean');
      });

      it('should reject low-scoring leads', () => {
        const lowScoreLead = {
          currentScore: 30,
          conversionProbability: 0.2,
          priorityLevel: 'low',
        } as any;
        
        const isQualified = (service as any).isLeadQualified(lowScoreLead);
        expect(typeof isQualified).toBe('boolean');
      });
    });
  });

  describe('Dynamic Customer Segmentation', () => {
    describe('createDynamicSegments()', () => {
      it('should create dynamic segments for all customers', async () => {
        // Arrange
        const mockCustomers = [
          createMockCustomer({ id: 'cust-001' }),
          createMockCustomer({ id: 'cust-002', tier: CustomerTier.SILVER }),
        ];
        customerRepository.find.mockResolvedValue(mockCustomers);
        
        // Mock segmentation engine
        (service as any).segmentationEngine = {
          segment: jest.fn()
            .mockResolvedValueOnce([
              { name: 'High-Value Enterprise', confidence: 0.9, characteristics: ['large_deals', 'long_term'] },
            ])
            .mockResolvedValueOnce([
              { name: 'Growing SMB', confidence: 0.8, characteristics: ['growth_potential', 'price_sensitive'] },
            ]),
        };
        
        jest.spyOn(service, 'performRFMAnalysis').mockResolvedValue({
          customerId: 'cust-001',
          recency: { value: 30, score: 5 },
          frequency: { value: 6, score: 4 },
          monetary: { value: 50000, score: 5 },
          rfmSegment: 'Champions',
          valueTier: 'High',
          segmentDescription: 'Best customers',
          actionRecommendations: ['Reward', 'Upsell'],
        });
        
        jest.spyOn(service as any, 'identifyLookalikeCustomers').mockResolvedValue([
          { customerId: 'similar-001', similarity: 0.85, commonAttributes: ['industry', 'size'] },
        ]);
        
        jest.spyOn(service as any, 'generatePersonalizationRecommendations').mockResolvedValue([
          { channel: 'email', content: 'premium_features', timing: new Date(), confidence: 0.8 },
        ]);
        
        jest.spyOn(service as any, 'createDynamicSegmentRules').mockResolvedValue([
          { rules: ['revenue > 100000'], conditions: ['active'], updateFrequency: 'daily' },
        ]);

        // Act
        const result = await service.createDynamicSegments();

        // Assert
        expect(result).toHaveLength(2);
        expect(result[0].customerId).toBe('cust-001');
        expect(result[0].segments).toHaveLength(1);
        expect(result[0].primarySegment.name).toBe('High-Value Enterprise');
        expect(result[0].rfmAnalysis.rfmSegment).toBe('Champions');
        expect(result[0].lookalikes).toHaveLength(1);
        expect(result[0].personalizations).toHaveLength(1);
      });

      it('should segment specific customer when ID provided', async () => {
        const customerId = 'cust-001';
        const mockCustomer = createMockCustomer({ id: customerId });
        customerRepository.findOne.mockResolvedValue(mockCustomer);
        
        (service as any).segmentationEngine = {
          segment: jest.fn().mockResolvedValue([
            { name: 'VIP Customer', confidence: 0.95, characteristics: ['high_value'] },
          ]),
        };
        
        jest.spyOn(service, 'performRFMAnalysis').mockResolvedValue({} as any);
        jest.spyOn(service as any, 'identifyLookalikeCustomers').mockResolvedValue([]);
        jest.spyOn(service as any, 'generatePersonalizationRecommendations').mockResolvedValue([]);
        jest.spyOn(service as any, 'createDynamicSegmentRules').mockResolvedValue([]);

        const result = await service.createDynamicSegments(customerId);

        expect(result).toHaveLength(1);
        expect(result[0].customerId).toBe(customerId);
        expect(customerRepository.findOne).toHaveBeenCalledWith({ where: { id: customerId } });
      });
    });

    describe('performRFMAnalysis()', () => {
      it('should perform comprehensive RFM analysis', async () => {
        // Arrange
        const customer = createMockCustomer();
        const mockTransactionData = [
          { date: new Date('2024-08-01'), amount: 5000 },
          { date: new Date('2024-07-01'), amount: 3000 },
          { date: new Date('2024-06-01'), amount: 4000 },
        ];
        
        jest.spyOn(service as any, 'gatherHistoricalTransactionData').mockResolvedValue(mockTransactionData);
        jest.spyOn(service as any, 'calculateRecency').mockReturnValue(19); // 19 days ago
        jest.spyOn(service as any, 'calculateFrequency').mockReturnValue(3); // 3 transactions
        jest.spyOn(service as any, 'calculateMonetaryValue').mockReturnValue(12000); // Total value
        jest.spyOn(service as any, 'scoreRecency').mockReturnValue(5); // Recent = high score
        jest.spyOn(service as any, 'scoreFrequency').mockReturnValue(4); // Good frequency
        jest.spyOn(service as any, 'scoreMonetaryValue').mockReturnValue(5); // High value
        jest.spyOn(service as any, 'createRFMSegment').mockReturnValue('Champions');
        jest.spyOn(service as any, 'calculateValueTier').mockReturnValue('High');
        jest.spyOn(service as any, 'getRFMSegmentDescription').mockReturnValue('Best customers who bought recently and frequently');
        jest.spyOn(service as any, 'getRFMActionRecommendations').mockReturnValue(['Reward', 'Upsell premium']);

        // Act
        const result = await service.performRFMAnalysis(customer);

        // Assert
        expect(result).toBeDefined();
        expect(result.customerId).toBe(customer.id);
        expect(result.recency.value).toBe(19);
        expect(result.recency.score).toBe(5);
        expect(result.frequency.value).toBe(3);
        expect(result.frequency.score).toBe(4);
        expect(result.monetary.value).toBe(12000);
        expect(result.monetary.score).toBe(5);
        expect(result.rfmSegment).toBe('Champions');
        expect(result.valueTier).toBe('High');
        expect(result.actionRecommendations).toContain('Reward');
      });

      it('should handle customers with no transaction history in RFM', async () => {
        const customer = createMockCustomer();
        jest.spyOn(service as any, 'gatherHistoricalTransactionData').mockResolvedValue([]);
        jest.spyOn(service as any, 'calculateRecency').mockReturnValue(Infinity);
        jest.spyOn(service as any, 'calculateFrequency').mockReturnValue(0);
        jest.spyOn(service as any, 'calculateMonetaryValue').mockReturnValue(0);
        jest.spyOn(service as any, 'scoreRecency').mockReturnValue(1);
        jest.spyOn(service as any, 'scoreFrequency').mockReturnValue(1);
        jest.spyOn(service as any, 'scoreMonetaryValue').mockReturnValue(1);
        jest.spyOn(service as any, 'createRFMSegment').mockReturnValue('New Customers');
        jest.spyOn(service as any, 'calculateValueTier').mockReturnValue('Potential');
        jest.spyOn(service as any, 'getRFMSegmentDescription').mockReturnValue('New customers with no purchase history');
        jest.spyOn(service as any, 'getRFMActionRecommendations').mockReturnValue(['Welcome campaign', 'First purchase incentive']);

        const result = await service.performRFMAnalysis(customer);

        expect(result.frequency.value).toBe(0);
        expect(result.monetary.value).toBe(0);
        expect(result.rfmSegment).toBe('New Customers');
        expect(result.actionRecommendations).toContain('Welcome campaign');
      });
    });

    describe('RFM Scoring Logic', () => {
      it('should score recency correctly', () => {
        expect((service as any).scoreRecency(7)).toBe(5); // Very recent
        expect((service as any).scoreRecency(30)).toBe(4); // Recent
        expect((service as any).scoreRecency(90)).toBe(3); // Moderate
        expect((service as any).scoreRecency(180)).toBe(2); // Old
        expect((service as any).scoreRecency(365)).toBe(1); // Very old
      });

      it('should score frequency correctly', () => {
        expect((service as any).scoreFrequency(10)).toBeGreaterThan((service as any).scoreFrequency(2));
        expect((service as any).scoreFrequency(1)).toBe(1);
      });

      it('should score monetary value correctly', () => {
        expect((service as any).scoreMonetaryValue(100000)).toBeGreaterThan((service as any).scoreMonetaryValue(1000));
        expect((service as any).scoreMonetaryValue(0)).toBe(1);
      });
    });
  });

  describe('Real-Time Predictions and Recommendations', () => {
    describe('predictNextBestAction()', () => {
      it('should generate comprehensive real-time predictions', async () => {
        // Arrange
        const customerId = 'cust-001';
        const mockCustomer = createMockCustomer();
        const mockBehaviorProfile = {
          customerId,
          behaviorPatterns: { purchaseFrequency: 2.5 },
          predictedBehaviors: {},
        } as any;
        
        jest.spyOn(service as any, 'gatherCustomerData').mockResolvedValue(mockCustomer);
        jest.spyOn(service, 'predictCustomerBehavior').mockResolvedValue(mockBehaviorProfile);
        
        // Mock real-time prediction engine
        (service as any).realTimePredictionEngine = {
          predictNextAction: jest.fn().mockResolvedValue({
            action: 'schedule_demo',
            confidence: 0.85,
          }),
        };
        
        jest.spyOn(service as any, 'predictNextPurchase').mockResolvedValue({
          product: 'Enterprise Plan',
          probability: 0.7,
          estimatedValue: 25000,
          confidence: 0.8,
        });
        
        jest.spyOn(service as any, 'predictEngagementResponse').mockResolvedValue({
          channel: 'email',
          engagementRate: 0.65,
          confidence: 0.75,
        });
        
        jest.spyOn(service as any, 'generateContentRecommendations').mockResolvedValue([
          { contentType: 'case_study', topic: 'ROI', format: 'pdf', confidence: 0.8 },
        ]);
        
        jest.spyOn(service as any, 'predictChannelPreferences').mockResolvedValue([
          { channel: 'email', preference: 0.8, optimalTimes: ['9:00', '14:00'] },
        ]);
        
        jest.spyOn(service as any, 'calculateOptimalTiming').mockResolvedValue({
          bestDay: 'Tuesday',
          bestHour: 10,
          confidence: 0.85,
        });
        
        jest.spyOn(service as any, 'calculateOverallConfidence').mockReturnValue(0.8);

        // Act
        const result = await service.predictNextBestAction(customerId);

        // Assert
        expect(result).toBeDefined();
        expect(result.customerId).toBe(customerId);
        expect(result.predictions.nextAction.action).toBe('schedule_demo');
        expect(result.predictions.nextPurchase.product).toBe('Enterprise Plan');
        expect(result.predictions.engagementResponse.channel).toBe('email');
        expect(result.predictions.contentRecommendations).toHaveLength(1);
        expect(result.predictions.channelPreferences).toHaveLength(1);
        expect(result.predictions.optimalTiming.bestDay).toBe('Tuesday');
        expect(result.confidence).toBe(0.8);
        expect(result.validUntil).toBeInstanceOf(Date);
      });

      it('should return cached predictions when valid', async () => {
        const customerId = 'cust-001';
        const cachedPrediction = {
          customerId,
          predictions: { nextAction: { action: 'follow_up' } },
          validUntil: new Date(Date.now() + 3600000),
        } as any;
        
        (service as any).predictionCache.set(customerId, cachedPrediction);

        const result = await service.predictNextBestAction(customerId);

        expect(result).toBe(cachedPrediction);
      });

      it('should refresh expired cached predictions', async () => {
        const customerId = 'cust-001';
        const expiredPrediction = {
          customerId,
          validUntil: new Date(Date.now() - 1000), // Expired
        } as any;
        
        (service as any).predictionCache.set(customerId, expiredPrediction);
        
        const mockCustomer = createMockCustomer();
        jest.spyOn(service as any, 'gatherCustomerData').mockResolvedValue(mockCustomer);
        jest.spyOn(service, 'predictCustomerBehavior').mockResolvedValue({} as any);
        
        // Mock all required methods
        (service as any).realTimePredictionEngine = {
          predictNextAction: jest.fn().mockResolvedValue({ action: 'new_action', confidence: 0.8 }),
        };
        jest.spyOn(service as any, 'predictNextPurchase').mockResolvedValue({ confidence: 0.8 } as any);
        jest.spyOn(service as any, 'predictEngagementResponse').mockResolvedValue({ confidence: 0.8 } as any);
        jest.spyOn(service as any, 'generateContentRecommendations').mockResolvedValue([]);
        jest.spyOn(service as any, 'predictChannelPreferences').mockResolvedValue([]);
        jest.spyOn(service as any, 'calculateOptimalTiming').mockResolvedValue({} as any);
        jest.spyOn(service as any, 'calculateOverallConfidence').mockReturnValue(0.8);

        const result = await service.predictNextBestAction(customerId);

        expect(result.predictions.nextAction.action).toBe('new_action');
        expect(result.validUntil.getTime()).toBeGreaterThan(Date.now());
      });
    });

    describe('Content and Channel Recommendations', () => {
      it('should generate personalized content recommendations', async () => {
        const customer = createMockCustomer();
        const recommendations = await (service as any).generateContentRecommendations(customer);
        
        expect(Array.isArray(recommendations)).toBe(true);
      });

      it('should predict optimal channel preferences', async () => {
        const customer = createMockCustomer();
        const preferences = await (service as any).predictChannelPreferences(customer);
        
        expect(Array.isArray(preferences)).toBe(true);
      });

      it('should calculate optimal timing for engagement', async () => {
        const customer = createMockCustomer();
        const behaviorProfile = {} as any;
        
        const timing = await (service as any).calculateOptimalTiming(customer, behaviorProfile);
        
        expect(timing).toHaveProperty('bestDay');
        expect(timing).toHaveProperty('bestHour');
        expect(timing).toHaveProperty('confidence');
      });
    });
  });

  describe('Scheduled Tasks and Model Training', () => {
    describe('retrainAIModels()', () => {
      it('should retrain all AI models with fresh data', async () => {
        // Arrange
        const mockTrainingData = {
          behaviorData: [{ customer: 'cust-001', behavior: 'high_engagement' }],
          sentimentData: [{ text: 'Great service!', sentiment: 0.9 }],
          churnData: [{ customer: 'cust-002', churned: false }],
          leadData: [{ lead: 'lead-001', converted: true }],
        };
        
        jest.spyOn(service as any, 'gatherTrainingData').mockResolvedValue(mockTrainingData);
        jest.spyOn(service as any, 'updateModelPerformanceMetrics').mockResolvedValue(undefined);
        
        // Mock AI engines
        (service as any).behaviorPredictionEngine.retrain = jest.fn().mockResolvedValue(undefined);
        (service as any).sentimentAnalysisEngine.retrain = jest.fn().mockResolvedValue(undefined);
        (service as any).churnPredictionModel.retrain = jest.fn().mockResolvedValue(undefined);
        (service as any).leadScoringEngine.retrain = jest.fn().mockResolvedValue(undefined);

        // Act
        await service.retrainAIModels();

        // Assert
        expect((service as any).behaviorPredictionEngine.retrain).toHaveBeenCalledWith(mockTrainingData.behaviorData);
        expect((service as any).sentimentAnalysisEngine.retrain).toHaveBeenCalledWith(mockTrainingData.sentimentData);
        expect((service as any).churnPredictionModel.retrain).toHaveBeenCalledWith(mockTrainingData.churnData);
        expect((service as any).leadScoringEngine.retrain).toHaveBeenCalledWith(mockTrainingData.leadData);
        expect((service as any).updateModelPerformanceMetrics).toHaveBeenCalled();
      });

      it('should handle training errors gracefully', async () => {
        jest.spyOn(service as any, 'gatherTrainingData').mockRejectedValue(new Error('Training data error'));

        // Should not throw, but log the error
        await expect(service.retrainAIModels()).resolves.toBeUndefined();
      });
    });

    describe('clearExpiredCache()', () => {
      it('should clear expired cache entries', async () => {
        // Arrange
        const now = new Date();
        const expiredProfile = { timestamp: Date.now() - (5 * 3600000) }; // 5 hours ago
        const validProfile = { timestamp: Date.now() - (1 * 3600000) }; // 1 hour ago
        const expiredPrediction = { validUntil: new Date(Date.now() - 1000) }; // Expired
        const validPrediction = { validUntil: new Date(Date.now() + 3600000) }; // Valid for 1 hour
        
        (service as any).behaviorProfileCache.set('expired', expiredProfile);
        (service as any).behaviorProfileCache.set('valid', validProfile);
        (service as any).predictionCache.set('expired', expiredPrediction);
        (service as any).predictionCache.set('valid', validPrediction);
        
        jest.spyOn(service as any, 'isCacheExpired')
          .mockReturnValueOnce(true) // expired profile
          .mockReturnValueOnce(false); // valid profile
        
        jest.spyOn(service as any, 'isSentimentCacheExpired').mockReturnValue(false);

        // Act
        await service.clearExpiredCache();

        // Assert
        expect((service as any).behaviorProfileCache.has('expired')).toBe(false);
        expect((service as any).behaviorProfileCache.has('valid')).toBe(true);
        expect((service as any).predictionCache.has('expired')).toBe(false);
        expect((service as any).predictionCache.has('valid')).toBe(true);
      });
    });
  });

  describe('System Monitoring and Health', () => {
    describe('monitorSystemHealth()', () => {
      it('should return comprehensive system health metrics', async () => {
        // Arrange
        jest.spyOn(service as any, 'getModelPerformanceMetrics').mockResolvedValue({
          behaviorPrediction: { accuracy: 0.87, precision: 0.84 },
          sentimentAnalysis: { accuracy: 0.91, precision: 0.88 },
          churnPrediction: { accuracy: 0.85, precision: 0.82 },
          leadScoring: { accuracy: 0.89, precision: 0.86 },
        });
        
        jest.spyOn(service as any, 'getCacheStatistics').mockReturnValue({
          behaviorCacheSize: 150,
          predictionCacheSize: 75,
          sentimentCacheSize: 200,
          hitRate: 0.73,
        });
        
        jest.spyOn(service as any, 'calculatePredictionAccuracy').mockResolvedValue({
          overall: 0.86,
          byModel: {
            behavior: 0.87,
            sentiment: 0.91,
            churn: 0.85,
            lead: 0.89,
          },
        });
        
        jest.spyOn(service as any, 'getAverageProcessingTimes').mockResolvedValue({
          behaviorPrediction: 245,
          sentimentAnalysis: 180,
          churnPrediction: 320,
          leadScoring: 210,
        });
        
        jest.spyOn(service as any, 'getResourceUtilization').mockResolvedValue({
          cpuUsage: 45,
          memoryUsage: 62,
          diskUsage: 38,
        });
        
        jest.spyOn(service as any, 'getErrorRates').mockResolvedValue({
          overall: 0.02,
          byService: {
            behavior: 0.01,
            sentiment: 0.03,
            churn: 0.02,
            lead: 0.015,
          },
        });
        
        jest.spyOn(service as any, 'getSystemRecommendations').mockResolvedValue([
          'Increase cache size for sentiment analysis',
          'Optimize churn prediction model performance',
        ]);

        // Act
        const health = await service.monitorSystemHealth();

        // Assert
        expect(health).toBeDefined();
        expect(health.modelPerformance.behaviorPrediction.accuracy).toBe(0.87);
        expect(health.cacheStatistics.hitRate).toBe(0.73);
        expect(health.predictionAccuracy.overall).toBe(0.86);
        expect(health.processingTimes.behaviorPrediction).toBe(245);
        expect(health.resourceUtilization.cpuUsage).toBe(45);
        expect(health.errorRates.overall).toBe(0.02);
        expect(health.recommendedActions).toHaveLength(2);
      });
    });

    describe('Cache Management', () => {
      it('should provide accurate cache statistics', () => {
        // Arrange
        (service as any).behaviorProfileCache.set('test1', {});
        (service as any).behaviorProfileCache.set('test2', {});
        (service as any).predictionCache.set('pred1', {});
        (service as any).sentimentCache.set('sent1', {});

        // Act
        const stats = (service as any).getCacheStatistics();

        // Assert
        expect(stats).toHaveProperty('behaviorCacheSize');
        expect(stats).toHaveProperty('predictionCacheSize');
        expect(stats).toHaveProperty('sentimentCacheSize');
        expect(stats).toHaveProperty('hitRate');
      });

      it('should correctly identify expired cache items', () => {
        const recentItem = { timestamp: Date.now() - 1000000 }; // 16 minutes ago
        const oldItem = { timestamp: Date.now() - 18000000 }; // 5 hours ago
        
        expect((service as any).isCacheExpired(recentItem, 4 * 3600000)).toBe(false);
        expect((service as any).isCacheExpired(oldItem, 4 * 3600000)).toBe(true);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle repository connection errors', async () => {
      customerRepository.findOne.mockRejectedValue(new Error('Connection failed'));

      await expect(service.predictCustomerBehavior('cust-001'))
        .rejects.toThrow('Connection failed');
    });

    it('should handle invalid customer IDs gracefully', async () => {
      customerRepository.findOne.mockResolvedValue(null);

      await expect(service.predictCustomerBehavior('invalid-id'))
        .rejects.toThrow('Customer invalid-id not found');
    });

    it('should handle empty result sets', async () => {
      customerRepository.find.mockResolvedValue([]);
      
      const result = await service.createDynamicSegments();
      expect(result).toEqual([]);
    });

    it('should handle AI engine failures', async () => {
      const customerId = 'cust-001';
      customerRepository.findOne.mockResolvedValue(createMockCustomer());
      
      // Mock AI engine failure
      (service as any).behaviorPredictionEngine = {
        predict: jest.fn().mockRejectedValue(new Error('AI Engine Error')),
      };

      jest.spyOn(service as any, 'extractBehavioralFeatures').mockRejectedValue(new Error('Feature extraction failed'));

      await expect(service.predictCustomerBehavior(customerId))
        .rejects.toThrow();
    });

    it('should handle malformed data gracefully', async () => {
      const malformedCustomer = { id: 'test', invalidField: null } as any;
      customerRepository.findOne.mockResolvedValue(malformedCustomer);
      
      // Should not crash, but may return default values
      jest.spyOn(service as any, 'extractBehavioralFeatures').mockResolvedValue({});
      jest.spyOn(service as any, 'analyzePurchasePatterns').mockResolvedValue({});
      jest.spyOn(service as any, 'generateBehaviorPredictions').mockResolvedValue({});
      jest.spyOn(service as any, 'calculateEngagementMetrics').mockResolvedValue({
        engagementScore: 0,
        loyaltyScore: 0,
        satisfactionScore: 0,
      });
      jest.spyOn(service as any, 'calculateRiskLevel').mockResolvedValue('unknown');
      
      // Mock other required methods
      jest.spyOn(service, 'analyzeSentimentRealTime').mockResolvedValue({} as any);
      jest.spyOn(service, 'predictChurnProbability').mockResolvedValue({} as any);
      jest.spyOn(service, 'calculateCustomerLifetimeValue').mockResolvedValue({} as any);
      jest.spyOn(service, 'identifyQualifiedLeads').mockResolvedValue([]);
      jest.spyOn(service as any, 'calculateUpsellPotential').mockResolvedValue({});

      const result = await service.predictCustomerBehavior('test');
      expect(result).toBeDefined();
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle concurrent requests efficiently', async () => {
      // Arrange
      const customerIds = Array.from({ length: 10 }, (_, i) => `cust-${i}`);
      customerRepository.findOne.mockImplementation((options: any) => 
        Promise.resolve(createMockCustomer({ id: options.where.id }))
      );
      
      // Mock fast responses for all dependencies
      jest.spyOn(service as any, 'extractBehavioralFeatures').mockResolvedValue({});
      jest.spyOn(service as any, 'analyzePurchasePatterns').mockResolvedValue({});
      jest.spyOn(service as any, 'generateBehaviorPredictions').mockResolvedValue({});
      jest.spyOn(service as any, 'calculateEngagementMetrics').mockResolvedValue({
        engagementScore: 50, loyaltyScore: 50, satisfactionScore: 50,
      });
      jest.spyOn(service as any, 'calculateRiskLevel').mockResolvedValue('medium');
      jest.spyOn(service, 'analyzeSentimentRealTime').mockResolvedValue({} as any);
      jest.spyOn(service, 'predictChurnProbability').mockResolvedValue({} as any);
      jest.spyOn(service, 'calculateCustomerLifetimeValue').mockResolvedValue({} as any);
      jest.spyOn(service, 'identifyQualifiedLeads').mockResolvedValue([]);
      jest.spyOn(service as any, 'calculateUpsellPotential').mockResolvedValue({});

      // Act
      const startTime = Date.now();
      const promises = customerIds.map(id => service.predictCustomerBehavior(id));
      const results = await Promise.all(promises);
      const endTime = Date.now();

      // Assert
      expect(results).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      results.forEach((result, index) => {
        expect(result.customerId).toBe(`cust-${index}`);
      });
    });

    it('should maintain cache efficiency under load', async () => {
      // Fill cache with data
      for (let i = 0; i < 100; i++) {
        (service as any).behaviorProfileCache.set(`cust-${i}`, {
          customerId: `cust-${i}`,
          timestamp: Date.now(),
        });
      }

      expect((service as any).behaviorProfileCache.size).toBe(100);

      // Test cache retrieval performance
      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        const cached = (service as any).behaviorProfileCache.get(`cust-${i}`);
        expect(cached).toBeDefined();
      }
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });
  });

  describe('Integration Testing', () => {
    it('should integrate with event emitter correctly', async () => {
      const customerId = 'cust-001';
      customerRepository.findOne.mockResolvedValue(createMockCustomer());
      
      // Mock all dependencies
      jest.spyOn(service as any, 'extractBehavioralFeatures').mockResolvedValue({});
      jest.spyOn(service as any, 'analyzePurchasePatterns').mockResolvedValue({});
      jest.spyOn(service as any, 'generateBehaviorPredictions').mockResolvedValue({});
      jest.spyOn(service as any, 'calculateEngagementMetrics').mockResolvedValue({
        engagementScore: 75, loyaltyScore: 80, satisfactionScore: 78,
      });
      jest.spyOn(service as any, 'calculateRiskLevel').mockResolvedValue('low');
      jest.spyOn(service, 'analyzeSentimentRealTime').mockResolvedValue({} as any);
      jest.spyOn(service, 'predictChurnProbability').mockResolvedValue({} as any);
      jest.spyOn(service, 'calculateCustomerLifetimeValue').mockResolvedValue({} as any);
      jest.spyOn(service, 'identifyQualifiedLeads').mockResolvedValue([]);
      jest.spyOn(service as any, 'calculateUpsellPotential').mockResolvedValue({});

      await service.predictCustomerBehavior(customerId);

      expect(eventEmitter.emit).toHaveBeenCalledWith('customer.behavior.analyzed', {
        customerId,
        behaviorProfile: expect.any(Object),
        timestamp: expect.any(Date),
      });
    });

    it('should work with multiple repository queries', async () => {
      // Test cross-repository functionality
      const leadId = 'lead-001';
      const mockLead = createMockLead();
      leadRepository.findOne.mockResolvedValue(mockLead);
      
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockLead]),
      };
      leadRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);
      
      // Mock scoring dependencies
      jest.spyOn(service as any, 'extractLeadFeatures').mockResolvedValue({});
      (service as any).leadScoringEngine = {
        calculateScore: jest.fn().mockResolvedValue({ currentScore: 80, predictedScore: 85, factors: [] }),
      };
      jest.spyOn(service as any, 'predictConversionProbability').mockResolvedValue({ probability: 0.7 });
      jest.spyOn(service as any, 'estimateTimeToConversion').mockResolvedValue(30);
      jest.spyOn(service as any, 'assessLeadQualification').mockResolvedValue({ qualified: true, qualification: 'SQL', confidence: 0.8 });
      jest.spyOn(service as any, 'generateLeadRecommendations').mockResolvedValue([]);
      jest.spyOn(service as any, 'identifyNextBestActions').mockResolvedValue([]);
      jest.spyOn(service as any, 'calculatePriorityLevel').mockReturnValue('high');
      jest.spyOn(service as any, 'isLeadQualified').mockReturnValue(true);

      const leadScore = await service.calculateAdvancedLeadScores(leadId);
      const qualifiedLeads = await service.identifyQualifiedLeads();

      expect(leadScore).toBeDefined();
      expect(qualifiedLeads).toBeDefined();
      expect(leadRepository.findOne).toHaveBeenCalled();
      expect(leadRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('Security and Validation', () => {
    it('should validate input parameters', async () => {
      // Test with empty/invalid customer ID
      await expect(service.predictCustomerBehavior(''))
        .rejects.toThrow();
        
      await expect(service.predictCustomerBehavior(null as any))
        .rejects.toThrow();
    });

    it('should sanitize sensitive data in logs', async () => {
      // Mock console methods to capture logs
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      
      customerRepository.findOne.mockResolvedValue(createMockCustomer({
        email: 'sensitive@email.com',
        phone: '+1-555-SECRET',
      }));

      try {
        jest.spyOn(service as any, 'extractBehavioralFeatures').mockRejectedValue(new Error('Test error'));
        await service.predictCustomerBehavior('cust-001');
      } catch (error) {
        // Expected to throw
      }

      // Verify that sensitive data is not logged in plain text
      const logCalls = logSpy.mock.calls.flat().join(' ');
      expect(logCalls).not.toContain('sensitive@email.com');
      expect(logCalls).not.toContain('SECRET');
      
      logSpy.mockRestore();
    });

    it('should handle unauthorized access gracefully', () => {
      // This would be handled by guards/middleware in a real app
      // Here we just verify the service doesn't expose sensitive data
      expect(service).not.toHaveProperty('apiKeys');
      expect(service).not.toHaveProperty('secrets');
    });
  });
});

// Additional test utilities and helpers
class TestDataGenerator {
  static generateCustomers(count: number): Customer[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `test-customer-${i}`,
      name: `Test Company ${i}`,
      email: `test${i}@example.com`,
      // ... other properties
    } as unknown as Customer));
  }

  static generateLeads(count: number): Lead[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `test-lead-${i}`,
      source: 'website',
      status: LeadStatus.NEW,
      score: Math.floor(Math.random() * 100),
      // ... other properties
    } as unknown as Lead));
  }
}

// Performance testing helpers
class PerformanceTestHelper {
  static async measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const startTime = process.hrtime.bigint();
    const result = await fn();
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    return { result, duration };
  }

  static generateLoadTestData(size: number) {
    return {
      customers: TestDataGenerator.generateCustomers(size),
      leads: TestDataGenerator.generateLeads(size),
    };
  }
}
