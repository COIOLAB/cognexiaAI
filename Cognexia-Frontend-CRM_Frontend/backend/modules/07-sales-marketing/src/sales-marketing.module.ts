import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { AISalesMarketingController } from './controllers/ai-sales-marketing.controller';
import { SalesController } from './controllers/sales.controller';
import { MarketingController } from './controllers/marketing.controller';

// Services
import { AISalesMarketingService } from './services/ai-sales-marketing.service';
import { ContentGenerationService } from './services/content-generation.service';
import { VideoAvatarService } from './services/video-avatar.service';
import { QuantumAdvertisingService } from './services/quantum-advertising.service';
import { MarketingAutomationService } from './services/marketing-automation.service';
import { DemographicAnalysisService } from './services/demographic-analysis.service';
import { GlobalizationService } from './services/globalization.service';
import { CampaignAnalyticsService } from './services/campaign-analytics.service';

// Additional Sales & Marketing Services
import { SalesPipelineService } from './services/sales-pipeline.service';
import { LeadScoringService } from './services/lead-scoring.service';
import { CustomerSegmentationService } from './services/customer-segmentation.service';
import { PredictiveAnalyticsService } from './services/predictive-analytics.service';
import { AIContentGenerationService } from './services/ai-content-generation.service';
import { MarketingAttributionService } from './services/marketing-attribution.service';
import { SocialMediaIntelligenceService } from './services/social-media-intelligence.service';
import { EmailMarketingIntelligenceService } from './services/email-marketing-intelligence.service';
import { CompetitorIntelligenceService } from './services/competitor-intelligence.service';
import { CustomerJourneyIntelligenceService } from './services/customer-journey-intelligence.service';

// Entities
import { Campaign } from './entities/campaign.entity';
import { MarketingContent } from './entities/marketing-content.entity';
import { AvatarVideo } from './entities/avatar-video.entity';
import { AdvertisingDocument } from './entities/advertising-document.entity';
import { DemographicSegment } from './entities/demographic-segment.entity';
import { CampaignPerformance } from './entities/campaign-performance.entity';
import { GlobalMarketingConfig } from './entities/global-marketing-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Campaign,
      MarketingContent,
      AvatarVideo,
      AdvertisingDocument,
      DemographicSegment,
      CampaignPerformance,
      GlobalMarketingConfig,
    ]),
  ],
  controllers: [
    AISalesMarketingController,
    SalesController,
    MarketingController,
  ],
  providers: [
    AISalesMarketingService,
    ContentGenerationService,
    VideoAvatarService,
    QuantumAdvertisingService,
    MarketingAutomationService,
    DemographicAnalysisService,
    GlobalizationService,
    CampaignAnalyticsService,
    // Additional Sales & Marketing Services
    SalesPipelineService,
    LeadScoringService,
    CustomerSegmentationService,
    PredictiveAnalyticsService,
    AIContentGenerationService,
    MarketingAttributionService,
    SocialMediaIntelligenceService,
    EmailMarketingIntelligenceService,
    CompetitorIntelligenceService,
    CustomerJourneyIntelligenceService,
  ],
  exports: [
    AISalesMarketingService,
    ContentGenerationService,
    VideoAvatarService,
    QuantumAdvertisingService,
    MarketingAutomationService,
    DemographicAnalysisService,
    GlobalizationService,
    CampaignAnalyticsService,
    // Additional Sales & Marketing Services
    SalesPipelineService,
    LeadScoringService,
    CustomerSegmentationService,
    PredictiveAnalyticsService,
    AIContentGenerationService,
    MarketingAttributionService,
    SocialMediaIntelligenceService,
    EmailMarketingIntelligenceService,
    CompetitorIntelligenceService,
    CustomerJourneyIntelligenceService,
  ],
})
export class SalesMarketingModule {}
