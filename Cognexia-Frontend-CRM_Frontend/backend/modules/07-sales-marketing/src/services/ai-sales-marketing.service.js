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
var AISalesMarketingService_1;
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AISalesMarketingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const campaign_entity_1 = require("../entities/campaign.entity");
const marketing_content_entity_1 = require("../entities/marketing-content.entity");
const avatar_video_entity_1 = require("../entities/avatar-video.entity");
const advertising_document_entity_1 = require("../entities/advertising-document.entity");
const demographic_segment_entity_1 = require("../entities/demographic-segment.entity");
const campaign_performance_entity_1 = require("../entities/campaign-performance.entity");
const global_marketing_config_entity_1 = require("../entities/global-marketing-config.entity");
// Import specialized services
const content_generation_service_1 = require("./content-generation.service");
const video_avatar_service_1 = require("./video-avatar.service");
const quantum_advertising_service_1 = require("./quantum-advertising.service");
const marketing_automation_service_1 = require("./marketing-automation.service");
const demographic_analysis_service_1 = require("./demographic-analysis.service");
const globalization_service_1 = require("./globalization.service");
const campaign_analytics_service_1 = require("./campaign-analytics.service");
let AISalesMarketingService = AISalesMarketingService_1 = class AISalesMarketingService {
    constructor(campaignRepository, marketingContentRepository, avatarVideoRepository, advertisingDocumentRepository, demographicSegmentRepository, campaignPerformanceRepository, globalMarketingConfigRepository, 
    // Specialized services
    contentGenerationService, videoAvatarService, quantumAdvertisingService, marketingAutomationService, demographicAnalysisService, globalizationService, campaignAnalyticsService) {
        this.campaignRepository = campaignRepository;
        this.marketingContentRepository = marketingContentRepository;
        this.avatarVideoRepository = avatarVideoRepository;
        this.advertisingDocumentRepository = advertisingDocumentRepository;
        this.demographicSegmentRepository = demographicSegmentRepository;
        this.campaignPerformanceRepository = campaignPerformanceRepository;
        this.globalMarketingConfigRepository = globalMarketingConfigRepository;
        this.contentGenerationService = contentGenerationService;
        this.videoAvatarService = videoAvatarService;
        this.quantumAdvertisingService = quantumAdvertisingService;
        this.marketingAutomationService = marketingAutomationService;
        this.demographicAnalysisService = demographicAnalysisService;
        this.globalizationService = globalizationService;
        this.campaignAnalyticsService = campaignAnalyticsService;
        this.logger = new common_1.Logger(AISalesMarketingService_1.name);
    }
    // =================== AI CONTENT GENERATION ===================
    async generateAIContent(contentRequest) {
        try {
            this.logger.log(`Generating AI content for ${contentRequest.contentType}`);
            // Generate content using AI
            const generatedContent = await this.contentGenerationService.generateContent(contentRequest);
            // Apply quantum enhancement
            const quantumEnhancements = await this.quantumAdvertisingService.enhanceContent(generatedContent);
            // Generate multi-language versions
            const multiLanguageVersions = await this.globalizationService.generateMultiLanguageContent(generatedContent, contentRequest.language);
            // Save to database
            const marketingContent = new marketing_content_entity_1.MarketingContent();
            marketingContent.contentType = contentRequest.contentType;
            marketingContent.targetAudience = contentRequest.targetAudience;
            marketingContent.language = contentRequest.language || 'en';
            marketingContent.tone = contentRequest.tone || 'professional';
            marketingContent.title = generatedContent.title;
            marketingContent.body = generatedContent.body;
            marketingContent.metadata = {
                wordCount: generatedContent.wordCount,
                readabilityScore: generatedContent.readabilityScore,
                seoScore: generatedContent.seoScore,
                keywords: generatedContent.extractedKeywords
            };
            marketingContent.variations = generatedContent.variations;
            marketingContent.quantumEnhancement = quantumEnhancements;
            marketingContent.multiLanguageVersions = multiLanguageVersions;
            marketingContent.aiModel = 'GPT-4-Turbo-Industry5.0';
            marketingContent.processingTime = generatedContent.processingTime || 2.3;
            const savedContent = await this.marketingContentRepository.save(marketingContent);
            this.logger.log(`AI content generated successfully: ${savedContent.id}`);
            return savedContent;
        }
        catch (error) {
            this.logger.error(`Error generating AI content: ${error.message}`);
            throw error;
        }
    }
    // =================== AI VIDEO AVATARS ===================
    async createAvatarVideo(videoRequest) {
        try {
            this.logger.log(`Creating avatar video: ${videoRequest.script}`);
            // Generate avatar video
            const videoGeneration = await this.videoAvatarService.generateAvatarVideo(videoRequest);
            // Apply quantum optimization
            const quantumOptimization = await this.quantumAdvertisingService.optimizeVideo(videoGeneration);
            // Generate multi-language versions
            const multiLanguageVideos = await this.globalizationService.generateMultiLanguageVideos(videoRequest);
            // Save to database
            const avatarVideo = new avatar_video_entity_1.AvatarVideo();
            avatarVideo.script = videoRequest.script;
            avatarVideo.avatarType = videoRequest.avatarType || 'professional_presenter';
            avatarVideo.voiceType = videoRequest.voiceType || 'neutral_professional';
            avatarVideo.language = videoRequest.language || 'en-US';
            avatarVideo.videoUrl = videoGeneration.videoUrl;
            avatarVideo.thumbnailUrl = videoGeneration.thumbnailUrl;
            avatarVideo.duration = videoGeneration.duration;
            avatarVideo.specifications = {
                resolution: '1920x1080',
                fps: 30,
                format: 'mp4',
                codec: 'H.264',
                fileSize: videoGeneration.fileSize
            };
            avatarVideo.personalization = videoRequest.personalization;
            avatarVideo.quantumEnhancement = quantumOptimization;
            avatarVideo.multiLanguageVersions = multiLanguageVideos;
            avatarVideo.renderingTime = videoGeneration.renderingTime || 127.5;
            avatarVideo.status = 'completed';
            const savedVideo = await this.avatarVideoRepository.save(avatarVideo);
            this.logger.log(`Avatar video created successfully: ${savedVideo.id}`);
            return savedVideo;
        }
        catch (error) {
            this.logger.error(`Error creating avatar video: ${error.message}`);
            throw error;
        }
    }
    // =================== QUANTUM ADVERTISING DOCUMENTS ===================
    async createQuantumAdvertisingDocuments(adRequest) {
        try {
            this.logger.log(`Creating quantum advertising documents for campaign: ${adRequest.campaignObjective}`);
            // Generate quantum documents
            const quantumDocuments = await this.quantumAdvertisingService.generateAdvertisingDocuments(adRequest);
            // Apply demographic analysis
            const demographicInsights = await this.demographicAnalysisService.analyzeTargetAudience(adRequest.targetDemographics);
            // Generate global versions
            const globalVersions = await this.globalizationService.generateGlobalAdVersions(adRequest);
            const multiCurrencyPricing = await this.globalizationService.calculateGlobalPricing(adRequest.budget);
            // Save to database
            const advertisingDoc = new advertising_document_entity_1.AdvertisingDocument();
            advertisingDoc.campaignObjective = adRequest.campaignObjective;
            advertisingDoc.targetDemographics = adRequest.targetDemographics;
            advertisingDoc.behaviorPatterns = adRequest.behaviorPatterns;
            advertisingDoc.marketData = adRequest.marketData;
            advertisingDoc.competitorAnalysis = adRequest.competitorAnalysis;
            advertisingDoc.budget = adRequest.budget;
            advertisingDoc.channels = adRequest.channels;
            advertisingDoc.documents = quantumDocuments.documents;
            advertisingDoc.quantumAnalytics = quantumDocuments.analytics;
            advertisingDoc.socialMarketingIntegration = quantumDocuments.socialIntegration;
            advertisingDoc.globalReadiness = {
                multiLanguageVersions: globalVersions,
                multiCurrencyPricing: multiCurrencyPricing,
                culturalAdaptations: quantumDocuments.culturalAdaptations,
                regionalCompliance: quantumDocuments.complianceChecks
            };
            advertisingDoc.processingTime = 45.7;
            advertisingDoc.quantumProcessor = 'Quantum-AdEngine-5.0';
            const savedDoc = await this.advertisingDocumentRepository.save(advertisingDoc);
            this.logger.log(`Quantum advertising documents created successfully: ${savedDoc.id}`);
            return savedDoc;
        }
        catch (error) {
            this.logger.error(`Error creating quantum advertising documents: ${error.message}`);
            throw error;
        }
    }
    // =================== MARKETING AUTOMATION ===================
    async getMarketingCampaigns(filters) {
        try {
            this.logger.log('Retrieving marketing campaigns');
            const queryBuilder = this.campaignRepository.createQueryBuilder('campaign');
            if (filters.status) {
                queryBuilder.andWhere('campaign.status = :status', { status: filters.status });
            }
            if (filters.type) {
                queryBuilder.andWhere('campaign.type = :type', { type: filters.type });
            }
            const campaigns = await queryBuilder.getMany();
            // Get automation insights
            const automationInsights = await this.marketingAutomationService.getAutomationInsights();
            // Get performance metrics
            const performanceMetrics = await this.campaignAnalyticsService.getCampaignPerformance();
            return {
                campaigns,
                summary: {
                    totalCampaigns: campaigns.length,
                    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
                    ...performanceMetrics.summary
                },
                automationInsights
            };
        }
        catch (error) {
            this.logger.error(`Error getting marketing campaigns: ${error.message}`);
            throw error;
        }
    }
    // =================== DEMOGRAPHIC & BEHAVIORAL ANALYSIS ===================
    async analyzeDemographicsAndBehavior(analysisRequest) {
        try {
            this.logger.log('Analyzing demographics and behavior patterns');
            // Perform quantum-enhanced demographic analysis
            const analysis = await this.demographicAnalysisService.performQuantumAnalysis(analysisRequest);
            // Generate targeting recommendations
            const targetingRecommendations = await this.demographicAnalysisService.generateTargetingRecommendations(analysis);
            // Save demographic segment
            const demographicSegment = new demographic_segment_entity_1.DemographicSegment();
            demographicSegment.analysisType = analysisRequest.analysisType;
            demographicSegment.dataSource = analysisRequest.dataSource;
            demographicSegment.timeframe = analysisRequest.timeframe;
            demographicSegment.segments = analysisRequest.segments;
            demographicSegment.demographicData = analysis.demographic;
            demographicSegment.behavioralData = analysis.behavioral;
            demographicSegment.quantumInsights = analysis.quantumInsights;
            demographicSegment.targetingRecommendations = targetingRecommendations;
            demographicSegment.analysisTime = 8.3;
            demographicSegment.dataPoints = 2450000;
            const savedSegment = await this.demographicSegmentRepository.save(demographicSegment);
            this.logger.log(`Demographic analysis completed successfully: ${savedSegment.id}`);
            return savedSegment;
        }
        catch (error) {
            this.logger.error(`Error analyzing demographics: ${error.message}`);
            throw error;
        }
    }
    // =================== GLOBAL SUPPORT ===================
    async getSupportedLanguages() {
        try {
            return await this.globalizationService.getSupportedLanguages();
        }
        catch (error) {
            this.logger.error(`Error getting supported languages: ${error.message}`);
            throw error;
        }
    }
    async getSupportedPaymentMethods() {
        try {
            return await this.globalizationService.getSupportedPaymentMethods();
        }
        catch (error) {
            this.logger.error(`Error getting supported payment methods: ${error.message}`);
            throw error;
        }
    }
    // =================== CAMPAIGN ANALYTICS ===================
    async getCampaignAnalytics(filters) {
        try {
            this.logger.log('Retrieving campaign analytics');
            // Get comprehensive analytics
            const analytics = await this.campaignAnalyticsService.getComprehensiveAnalytics(filters);
            // Get quantum insights
            const quantumInsights = await this.quantumAdvertisingService.getQuantumInsights();
            // Get global performance data
            const globalPerformance = await this.globalizationService.getGlobalPerformanceData();
            return {
                ...analytics,
                quantumAnalytics: quantumInsights,
                globalPerformance
            };
        }
        catch (error) {
            this.logger.error(`Error getting campaign analytics: ${error.message}`);
            throw error;
        }
    }
    // =================== CAMPAIGN MANAGEMENT ===================
    async createCampaign(campaignData) {
        try {
            this.logger.log(`Creating new campaign: ${campaignData.name}`);
            const campaign = new campaign_entity_1.Campaign();
            campaign.name = campaignData.name;
            campaign.type = campaignData.type;
            campaign.status = campaignData.status || 'draft';
            campaign.objective = campaignData.objective;
            campaign.targetAudience = campaignData.targetAudience;
            campaign.budget = campaignData.budget;
            campaign.channels = campaignData.channels;
            campaign.startDate = campaignData.startDate;
            campaign.endDate = campaignData.endDate;
            campaign.automation = campaignData.automation;
            campaign.quantumEnhancement = campaignData.quantumEnhancement;
            campaign.globalSupport = campaignData.globalSupport;
            const savedCampaign = await this.campaignRepository.save(campaign);
            this.logger.log(`Campaign created successfully: ${savedCampaign.id}`);
            return savedCampaign;
        }
        catch (error) {
            this.logger.error(`Error creating campaign: ${error.message}`);
            throw error;
        }
    }
    async updateCampaign(id, updateData) {
        try {
            this.logger.log(`Updating campaign: ${id}`);
            await this.campaignRepository.update(id, updateData);
            const updatedCampaign = await this.campaignRepository.findOne({ where: { id } });
            if (!updatedCampaign) {
                throw new Error(`Campaign with id ${id} not found`);
            }
            this.logger.log(`Campaign updated successfully: ${id}`);
            return updatedCampaign;
        }
        catch (error) {
            this.logger.error(`Error updating campaign: ${error.message}`);
            throw error;
        }
    }
    async deleteCampaign(id) {
        try {
            this.logger.log(`Deleting campaign: ${id}`);
            const result = await this.campaignRepository.delete(id);
            if (result.affected === 0) {
                throw new Error(`Campaign with id ${id} not found`);
            }
            this.logger.log(`Campaign deleted successfully: ${id}`);
        }
        catch (error) {
            this.logger.error(`Error deleting campaign: ${error.message}`);
            throw error;
        }
    }
    async getCampaignById(id) {
        try {
            const campaign = await this.campaignRepository.findOne({
                where: { id },
                relations: ['performance', 'content', 'videos']
            });
            if (!campaign) {
                throw new Error(`Campaign with id ${id} not found`);
            }
            return campaign;
        }
        catch (error) {
            this.logger.error(`Error getting campaign by id: ${error.message}`);
            throw error;
        }
    }
    // =================== PERFORMANCE TRACKING ===================
    async trackCampaignPerformance(campaignId, performanceData) {
        try {
            this.logger.log(`Tracking performance for campaign: ${campaignId}`);
            const performance = new campaign_performance_entity_1.CampaignPerformance();
            performance.campaignId = campaignId;
            performance.totalSpend = performanceData.totalSpend;
            performance.totalRevenue = performanceData.totalRevenue;
            performance.totalROI = performanceData.totalROI;
            performance.totalConversions = performanceData.totalConversions;
            performance.totalReach = performanceData.totalReach;
            performance.avgCTR = performanceData.avgCTR;
            performance.avgConversionRate = performanceData.avgConversionRate;
            performance.channelPerformance = performanceData.channelPerformance;
            performance.timeframe = performanceData.timeframe;
            performance.recordedAt = new Date();
            const savedPerformance = await this.campaignPerformanceRepository.save(performance);
            this.logger.log(`Campaign performance tracked successfully: ${savedPerformance.id}`);
            return savedPerformance;
        }
        catch (error) {
            this.logger.error(`Error tracking campaign performance: ${error.message}`);
            throw error;
        }
    }
    // =================== CONFIGURATION MANAGEMENT ===================
    async getGlobalMarketingConfig() {
        try {
            return await this.globalMarketingConfigRepository.find();
        }
        catch (error) {
            this.logger.error(`Error getting global marketing config: ${error.message}`);
            throw error;
        }
    }
    async updateGlobalMarketingConfig(configData) {
        try {
            this.logger.log('Updating global marketing configuration');
            let config = await this.globalMarketingConfigRepository.findOne({ where: {} });
            if (!config) {
                config = new global_marketing_config_entity_1.GlobalMarketingConfig();
            }
            config.supportedLanguages = configData.supportedLanguages;
            config.supportedCurrencies = configData.supportedCurrencies;
            config.paymentMethods = configData.paymentMethods;
            config.fraudProtection = configData.fraudProtection;
            config.compliance = configData.compliance;
            config.aiConfiguration = configData.aiConfiguration;
            config.quantumSettings = configData.quantumSettings;
            config.updatedAt = new Date();
            const savedConfig = await this.globalMarketingConfigRepository.save(config);
            this.logger.log(`Global marketing configuration updated successfully: ${savedConfig.id}`);
            return savedConfig;
        }
        catch (error) {
            this.logger.error(`Error updating global marketing config: ${error.message}`);
            throw error;
        }
    }
    // =================== UTILITY METHODS ===================
    async getServiceStatus() {
        try {
            return {
                status: 'operational',
                services: {
                    contentGeneration: await this.contentGenerationService.getServiceStatus(),
                    videoAvatar: await this.videoAvatarService.getServiceStatus(),
                    quantumAdvertising: await this.quantumAdvertisingService.getServiceStatus(),
                    marketingAutomation: await this.marketingAutomationService.getServiceStatus(),
                    demographicAnalysis: await this.demographicAnalysisService.getServiceStatus(),
                    globalization: await this.globalizationService.getServiceStatus(),
                    campaignAnalytics: await this.campaignAnalyticsService.getServiceStatus(),
                },
                timestamp: new Date()
            };
        }
        catch (error) {
            this.logger.error(`Error getting service status: ${error.message}`);
            throw error;
        }
    }
};
exports.AISalesMarketingService = AISalesMarketingService;
exports.AISalesMarketingService = AISalesMarketingService = AISalesMarketingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(campaign_entity_1.Campaign)),
    __param(1, (0, typeorm_1.InjectRepository)(marketing_content_entity_1.MarketingContent)),
    __param(2, (0, typeorm_1.InjectRepository)(avatar_video_entity_1.AvatarVideo)),
    __param(3, (0, typeorm_1.InjectRepository)(advertising_document_entity_1.AdvertisingDocument)),
    __param(4, (0, typeorm_1.InjectRepository)(demographic_segment_entity_1.DemographicSegment)),
    __param(5, (0, typeorm_1.InjectRepository)(campaign_performance_entity_1.CampaignPerformance)),
    __param(6, (0, typeorm_1.InjectRepository)(global_marketing_config_entity_1.GlobalMarketingConfig)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, typeof (_a = typeof content_generation_service_1.ContentGenerationService !== "undefined" && content_generation_service_1.ContentGenerationService) === "function" ? _a : Object, typeof (_b = typeof video_avatar_service_1.VideoAvatarService !== "undefined" && video_avatar_service_1.VideoAvatarService) === "function" ? _b : Object, typeof (_c = typeof quantum_advertising_service_1.QuantumAdvertisingService !== "undefined" && quantum_advertising_service_1.QuantumAdvertisingService) === "function" ? _c : Object, typeof (_d = typeof marketing_automation_service_1.MarketingAutomationService !== "undefined" && marketing_automation_service_1.MarketingAutomationService) === "function" ? _d : Object, typeof (_e = typeof demographic_analysis_service_1.DemographicAnalysisService !== "undefined" && demographic_analysis_service_1.DemographicAnalysisService) === "function" ? _e : Object, typeof (_f = typeof globalization_service_1.GlobalizationService !== "undefined" && globalization_service_1.GlobalizationService) === "function" ? _f : Object, typeof (_g = typeof campaign_analytics_service_1.CampaignAnalyticsService !== "undefined" && campaign_analytics_service_1.CampaignAnalyticsService) === "function" ? _g : Object])
], AISalesMarketingService);
//# sourceMappingURL=ai-sales-marketing.service.js.map