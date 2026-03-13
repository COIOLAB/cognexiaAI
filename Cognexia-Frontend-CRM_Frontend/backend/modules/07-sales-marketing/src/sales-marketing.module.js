"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesMarketingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
// Controllers
const ai_sales_marketing_controller_1 = require("./controllers/ai-sales-marketing.controller");
// Services
const ai_sales_marketing_service_1 = require("./services/ai-sales-marketing.service");
const content_generation_service_1 = require("./services/content-generation.service");
const video_avatar_service_1 = require("./services/video-avatar.service");
const quantum_advertising_service_1 = require("./services/quantum-advertising.service");
const marketing_automation_service_1 = require("./services/marketing-automation.service");
const demographic_analysis_service_1 = require("./services/demographic-analysis.service");
const globalization_service_1 = require("./services/globalization.service");
const campaign_analytics_service_1 = require("./services/campaign-analytics.service");
// Entities
const campaign_entity_1 = require("./entities/campaign.entity");
const marketing_content_entity_1 = require("./entities/marketing-content.entity");
const avatar_video_entity_1 = require("./entities/avatar-video.entity");
const advertising_document_entity_1 = require("./entities/advertising-document.entity");
const demographic_segment_entity_1 = require("./entities/demographic-segment.entity");
const campaign_performance_entity_1 = require("./entities/campaign-performance.entity");
const global_marketing_config_entity_1 = require("./entities/global-marketing-config.entity");
let SalesMarketingModule = class SalesMarketingModule {
};
exports.SalesMarketingModule = SalesMarketingModule;
exports.SalesMarketingModule = SalesMarketingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                campaign_entity_1.Campaign,
                marketing_content_entity_1.MarketingContent,
                avatar_video_entity_1.AvatarVideo,
                advertising_document_entity_1.AdvertisingDocument,
                demographic_segment_entity_1.DemographicSegment,
                campaign_performance_entity_1.CampaignPerformance,
                global_marketing_config_entity_1.GlobalMarketingConfig,
            ]),
        ],
        controllers: [
            ai_sales_marketing_controller_1.AISalesMarketingController,
        ],
        providers: [
            ai_sales_marketing_service_1.AISalesMarketingService,
            content_generation_service_1.ContentGenerationService,
            video_avatar_service_1.VideoAvatarService,
            quantum_advertising_service_1.QuantumAdvertisingService,
            marketing_automation_service_1.MarketingAutomationService,
            demographic_analysis_service_1.DemographicAnalysisService,
            globalization_service_1.GlobalizationService,
            campaign_analytics_service_1.CampaignAnalyticsService,
        ],
        exports: [
            ai_sales_marketing_service_1.AISalesMarketingService,
            content_generation_service_1.ContentGenerationService,
            video_avatar_service_1.VideoAvatarService,
            quantum_advertising_service_1.QuantumAdvertisingService,
            marketing_automation_service_1.MarketingAutomationService,
            demographic_analysis_service_1.DemographicAnalysisService,
            globalization_service_1.GlobalizationService,
            campaign_analytics_service_1.CampaignAnalyticsService,
        ],
    })
], SalesMarketingModule);
//# sourceMappingURL=sales-marketing.module.js.map