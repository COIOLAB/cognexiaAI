import { Test, TestingModule } from '@nestjs/testing';
import { MarketingService } from '../services/marketing.service';
import { LLMService } from '../services/llm.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MarketingCampaign } from '../entities/marketing-campaign.entity';
import { EmailTemplate } from '../entities/email-template.entity';
import { MarketingAnalytics } from '../entities/marketing-analytics.entity';
import { CustomerSegment } from '../entities/customer-segment.entity';
import { Customer } from '../entities/customer.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AICustomerIntelligenceService } from '../services/AICustomerIntelligenceService';
import { QuantumPersonalizationEngine } from '../services/QuantumPersonalizationEngine';
import { AdvancedPredictiveAnalyticsService } from '../services/AdvancedPredictiveAnalyticsService';
import { Logger } from '@nestjs/common';

describe('MarketingService', () => {
  let service: MarketingService;
  let llmService: LLMService;
  let campaignRepo: any;
  let templateRepo: any;
  let analyticsRepo: any;
  let segmentRepo: any;
  let customerRepo: any;

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    findBy: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  const mockLLMService = {
    generateCompletion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketingService,
        { provide: getRepositoryToken(MarketingCampaign), useValue: mockRepo },
        { provide: getRepositoryToken(EmailTemplate), useValue: mockRepo },
        { provide: getRepositoryToken(MarketingAnalytics), useValue: mockRepo },
        { provide: getRepositoryToken(CustomerSegment), useValue: mockRepo },
        { provide: getRepositoryToken(Customer), useValue: mockRepo },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: AICustomerIntelligenceService, useValue: { generateCustomerInsights: jest.fn() } },
        { provide: QuantumPersonalizationEngine, useValue: { generatePersonalizedRecommendations: jest.fn() } },
        { provide: AdvancedPredictiveAnalyticsService, useValue: { predictCampaignPerformance: jest.fn() } },
        { provide: LLMService, useValue: mockLLMService },
      ],
    }).compile();

    service = module.get<MarketingService>(MarketingService);
    llmService = module.get<LLMService>(LLMService);
    campaignRepo = module.get(getRepositoryToken(MarketingCampaign));
    templateRepo = module.get(getRepositoryToken(EmailTemplate));
    analyticsRepo = module.get(getRepositoryToken(MarketingAnalytics));
    segmentRepo = module.get(getRepositoryToken(CustomerSegment));
    customerRepo = module.get(getRepositoryToken(Customer));
    
    // Clear mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmailCampaign', () => {
    it('should generate personalized content using LLM', async () => {
      // Arrange
      const campaign = { id: 'camp1', name: 'Test Campaign', type: 'email', objectives: 'conversion' };
      const template = { id: 'temp1', subject: 'Hello', bodyText: 'World', bodyHtml: '<p>World</p>' };
      const segment = { 
        id: 'seg1', 
        criteria: { 
            rules: [{ field: 'industry', operator: 'equals', value: 'Tech' }],
            conditions: 'AND' 
        } 
      };
      const customer = { 
        id: 'cust1', 
        companyName: 'Test Corp',
        industry: 'Tech',
        primaryContact: {
            email: 'test@example.com', 
            firstName: 'John',
            lastName: 'Doe'
        },
        interactions: []
      };

      (service as any).campaignRepository = { findOne: jest.fn().mockResolvedValue(campaign), update: jest.fn().mockResolvedValue(undefined) };
      (service as any).templateRepository = { findOne: jest.fn().mockResolvedValue(template) };
      (service as any).segmentRepository = { findBy: jest.fn().mockResolvedValue([segment]) };
      
      // Mock getCustomersInSegment internal query
      jest.spyOn(service as any, 'getCustomersInSegment').mockResolvedValueOnce([customer] as any);

      mockLLMService.generateCompletion.mockResolvedValue(JSON.stringify({
        subject: 'Personalized Subject',
        body: 'Personalized Body',
        personalizationScore: 0.95
      }));

      // Act
      const result = await service.sendEmailCampaign({
        campaignId: 'camp1',
        templateId: 'temp1',
        segmentIds: ['seg1'],
      });

      // Assert
      expect(mockLLMService.generateCompletion).toHaveBeenCalled();
      expect(result.sent).toBe(1);
    });
  });
});
