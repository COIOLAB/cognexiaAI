export declare class AISalesMarketingController {
    private readonly logger;
    constructor();
    generateAIContent(contentRequest: any): Promise<{
        success: boolean;
        data: {
            id: string;
            contentType: any;
            targetAudience: any;
            language: any;
            tone: any;
            generatedContent: {
                title: any;
                body: any;
                metadata: {
                    wordCount: any;
                    readabilityScore: any;
                    seoScore: any;
                    keywords: any;
                };
            };
            variations: any;
            suggestions: {
                improvements: any;
                abTestRecommendations: any;
                personalizationOptions: any;
            };
            quantumEnhancement: {
                audienceOptimization: string;
                sentimentAnalysis: string;
                predictivePerformance: {
                    engagementScore: number;
                    conversionProbability: number;
                    viralPotential: number;
                };
            };
            multiLanguageVersions: any;
            createdAt: Date;
            aiModel: string;
            processingTime: number;
        };
        message: string;
    }>;
    createAvatarVideo(videoRequest: any): Promise<{
        success: boolean;
        data: {
            id: string;
            videoUrl: any;
            thumbnailUrl: any;
            duration: any;
            specifications: {
                resolution: string;
                fps: number;
                format: string;
                codec: string;
                fileSize: any;
            };
            avatarDetails: {
                type: any;
                voice: {
                    type: any;
                    language: any;
                    accent: string;
                    gender: string;
                };
                appearance: {
                    style: string;
                    background: any;
                    branding: any;
                };
            };
            personalization: {
                customerName: any;
                companyName: any;
                specificContent: any;
                demographics: any;
            };
            analytics: {
                estimatedEngagement: number;
                targetAudienceMatch: number;
                emotionalImpact: string;
                callToActionStrength: number;
            };
            quantumEnhancement: {
                behaviorPrediction: string;
                optimalTiming: string;
                audienceResonance: {
                    score: number;
                    demographicMatch: number;
                    psychographicAlignment: number;
                };
            };
            multiLanguageVersions: any;
            createdAt: Date;
            renderingTime: number;
            status: string;
        };
        message: string;
    }>;
    createQuantumAdvertisingDocuments(adRequest: any): Promise<{
        success: boolean;
        data: {
            campaignId: string;
            documents: {
                creativeStrategy: {
                    id: string;
                    title: string;
                    content: any;
                    quantumInsights: {
                        audienceResonanceMatrix: any;
                        emotionalTriggerMap: any;
                        behaviorPredictionModel: any;
                    };
                };
                mediaPlanning: {
                    id: string;
                    title: string;
                    content: any;
                    channelOptimization: any;
                    budgetAllocation: any;
                    timingStrategy: any;
                };
                targetingSpecifications: {
                    id: string;
                    title: string;
                    demographicTargeting: any;
                    behavioralTargeting: any;
                    psychographicProfile: any;
                    quantumPersonas: any;
                };
                creativeAssets: {
                    id: string;
                    title: string;
                    adCopyVariations: any;
                    visualConcepts: any;
                    videoScripts: any;
                    interactiveElements: any;
                };
            };
            quantumAnalytics: {
                marketPenetrationProbability: number;
                competitiveAdvantageIndex: number;
                viralityCoefficient: number;
                brandLiftPrediction: number;
                roiProjection: {
                    conservative: number;
                    realistic: number;
                    optimistic: number;
                };
            };
            socialMarketingIntegration: {
                platforms: string[];
                demographicMapping: any;
                contentCalendar: any;
                influencerRecommendations: any;
            };
            globalReadiness: {
                multiLanguageVersions: any;
                multiCurrencyPricing: any;
                culturalAdaptations: any;
                regionalCompliance: any;
            };
            createdAt: Date;
            processingTime: number;
            quantumProcessor: string;
        };
        message: string;
    }>;
    getMarketingCampaigns(status?: string, type?: string): Promise<{
        success: boolean;
        data: {
            campaigns: ({
                id: string;
                name: string;
                type: string;
                status: string;
                objective: string;
                targetAudience: {
                    segments: string[];
                    totalReach: number;
                    demographics: {
                        industries: string[];
                        companySize: string[];
                        roles: string[];
                    };
                };
                performance: {
                    totalSent: number;
                    opened: number;
                    clicked: number;
                    converted: number;
                    openRate: number;
                    clickRate: number;
                    conversionRate: number;
                    roi: number;
                    revenue: number;
                    totalReach?: undefined;
                    impressions?: undefined;
                    engagement?: undefined;
                    clicks?: undefined;
                    conversions?: undefined;
                    engagementRate?: undefined;
                    ctr?: undefined;
                    socialROI?: undefined;
                };
                automation: {
                    triggers: ({
                        type: string;
                        weight: number;
                        threshold?: undefined;
                    } | {
                        type: string;
                        threshold: number;
                        weight?: undefined;
                    })[];
                    sequence: {
                        step: number;
                        type: string;
                        delay: string;
                    }[];
                    aiOptimization: {
                        sendTimeOptimization: boolean;
                        subjectLineVariation: boolean;
                        contentPersonalization: boolean;
                        audienceSegmentation: boolean;
                    };
                };
                quantumEnhancement: {
                    behaviorPrediction: string;
                    contentOptimization: string;
                    timingOptimization: string;
                    audienceEvolution: string;
                };
                globalSupport: {
                    languages: string[];
                    currencies: string[];
                    timezonOptimization: boolean;
                    culturalAdaptation: boolean;
                };
                platforms?: undefined;
                aiAutomation?: undefined;
            } | {
                id: string;
                name: string;
                type: string;
                status: string;
                platforms: string[];
                performance: {
                    totalReach: number;
                    impressions: number;
                    engagement: number;
                    clicks: number;
                    conversions: number;
                    engagementRate: number;
                    ctr: number;
                    conversionRate: number;
                    socialROI: number;
                    totalSent?: undefined;
                    opened?: undefined;
                    clicked?: undefined;
                    converted?: undefined;
                    openRate?: undefined;
                    clickRate?: undefined;
                    roi?: undefined;
                    revenue?: undefined;
                };
                aiAutomation: {
                    contentGeneration: boolean;
                    postScheduling: boolean;
                    responseManagement: boolean;
                    influencerOutreach: boolean;
                    communityManagement: boolean;
                };
                objective?: undefined;
                targetAudience?: undefined;
                automation?: undefined;
                quantumEnhancement?: undefined;
                globalSupport?: undefined;
            })[];
            summary: {
                totalCampaigns: number;
                activeCampaigns: number;
                totalReach: number;
                totalConversions: number;
                averageROI: number;
                totalRevenue: number;
            };
        };
        message: string;
    }>;
    analyzeDemographicsAndBehavior(analysisRequest: any): Promise<{
        success: boolean;
        data: {
            analysisId: string;
            demographic: {
                ageDistribution: {
                    '18-24': {
                        percentage: number;
                        engagement: number;
                        conversion: number;
                    };
                    '25-34': {
                        percentage: number;
                        engagement: number;
                        conversion: number;
                    };
                    '35-44': {
                        percentage: number;
                        engagement: number;
                        conversion: number;
                    };
                    '45-54': {
                        percentage: number;
                        engagement: number;
                        conversion: number;
                    };
                    '55-64': {
                        percentage: number;
                        engagement: number;
                        conversion: number;
                    };
                    '65+': {
                        percentage: number;
                        engagement: number;
                        conversion: number;
                    };
                };
                genderDistribution: {
                    male: {
                        percentage: number;
                        engagement: number;
                        conversion: number;
                    };
                    female: {
                        percentage: number;
                        engagement: number;
                        conversion: number;
                    };
                    other: {
                        percentage: number;
                        engagement: number;
                        conversion: number;
                    };
                };
                locationDistribution: {
                    'North America': {
                        percentage: number;
                        revenue: number;
                    };
                    Europe: {
                        percentage: number;
                        revenue: number;
                    };
                    'Asia Pacific': {
                        percentage: number;
                        revenue: number;
                    };
                    'Latin America': {
                        percentage: number;
                        revenue: number;
                    };
                    Other: {
                        percentage: number;
                        revenue: number;
                    };
                };
                incomeSegments: {
                    'Under $50K': {
                        percentage: number;
                        products: string[];
                    };
                    '$50K-$100K': {
                        percentage: number;
                        products: string[];
                    };
                    '$100K-$200K': {
                        percentage: number;
                        products: string[];
                    };
                    'Over $200K': {
                        percentage: number;
                        products: string[];
                    };
                };
            };
            behavioral: {
                purchasingBehavior: {
                    decisionMakingSpeed: {
                        impulse: {
                            percentage: number;
                            avgTime: string;
                        };
                        quick: {
                            percentage: number;
                            avgTime: string;
                        };
                        considered: {
                            percentage: number;
                            avgTime: string;
                        };
                        extended: {
                            percentage: number;
                            avgTime: string;
                        };
                    };
                    channelPreference: {
                        online: {
                            percentage: number;
                            satisfaction: number;
                        };
                        inStore: {
                            percentage: number;
                            satisfaction: number;
                        };
                        phone: {
                            percentage: number;
                            satisfaction: number;
                        };
                        other: {
                            percentage: number;
                            satisfaction: number;
                        };
                    };
                    loyaltyPatterns: {
                        brandLoyal: {
                            percentage: number;
                            avgLifetime: number;
                        };
                        switchProne: {
                            percentage: number;
                            avgLifetime: number;
                        };
                        priceConscious: {
                            percentage: number;
                            avgLifetime: number;
                        };
                    };
                };
                digitalBehavior: {
                    deviceUsage: {
                        mobile: {
                            percentage: number;
                            engagement: number;
                        };
                        desktop: {
                            percentage: number;
                            engagement: number;
                        };
                        tablet: {
                            percentage: number;
                            engagement: number;
                        };
                    };
                    socialMediaActivity: {
                        linkedin: {
                            usage: number;
                            engagement: number;
                            influence: number;
                        };
                        facebook: {
                            usage: number;
                            engagement: number;
                            influence: number;
                        };
                        twitter: {
                            usage: number;
                            engagement: number;
                            influence: number;
                        };
                        instagram: {
                            usage: number;
                            engagement: number;
                            influence: number;
                        };
                        tiktok: {
                            usage: number;
                            engagement: number;
                            influence: number;
                        };
                    };
                    contentConsumption: {
                        video: {
                            preference: number;
                            engagement: number;
                        };
                        articles: {
                            preference: number;
                            engagement: number;
                        };
                        infographics: {
                            preference: number;
                            engagement: number;
                        };
                        podcasts: {
                            preference: number;
                            engagement: number;
                        };
                        webinars: {
                            preference: number;
                            engagement: number;
                        };
                    };
                };
            };
            quantumInsights: {
                behaviorPrediction: {
                    nextPurchaseProbability: number;
                    churnRisk: number;
                    upsellOpportunity: number;
                    referralPotential: number;
                };
                emergingTrends: string[];
                optimizationRecommendations: string[];
            };
            targeting: {
                primaryPersonas: {
                    name: string;
                    demographics: {
                        age: string;
                        income: string;
                        role: string;
                    };
                    behavior: {
                        channel: string;
                        decision: string;
                        loyalty: string;
                    };
                    reach: number;
                    value: string;
                }[];
                customSegments: any;
            };
            createdAt: Date;
            analysisTime: number;
            dataPoints: number;
        };
        message: string;
    }>;
    getSupportedLanguages(): Promise<{
        success: boolean;
        data: {
            languages: {
                code: string;
                name: string;
                regions: string[];
                marketShare: number;
                aiSupport: string;
                avatarSupport: boolean;
                voiceSupport: boolean;
            }[];
            totalMarketCoverage: number;
            aiTranslationAccuracy: number;
            culturalAdaptationLevel: string;
        };
        message: string;
    }>;
    getSupportedPaymentMethods(): Promise<{
        success: boolean;
        data: {
            currencies: {
                code: string;
                name: string;
                regions: string[];
                adoption: number;
            }[];
            paymentMethods: {
                creditCards: {
                    visa: {
                        regions: string;
                        adoption: number;
                    };
                    mastercard: {
                        regions: string;
                        adoption: number;
                    };
                    americanExpress: {
                        regions: string;
                        adoption: number;
                    };
                    discover: {
                        regions: string[];
                        adoption: number;
                    };
                };
                digitalWallets: {
                    paypal: {
                        regions: string;
                        adoption: number;
                    };
                    stripe: {
                        regions: string;
                        adoption: number;
                    };
                    applePay: {
                        regions: string;
                        adoption: number;
                    };
                    googlePay: {
                        regions: string;
                        adoption: number;
                    };
                    wechatPay: {
                        regions: string[];
                        adoption: number;
                    };
                    alipay: {
                        regions: string[];
                        adoption: number;
                    };
                };
                bankTransfer: {
                    sepa: {
                        regions: string[];
                        adoption: number;
                    };
                    ach: {
                        regions: string[];
                        adoption: number;
                    };
                    wireTransfer: {
                        regions: string;
                        adoption: number;
                    };
                };
                buyNowPayLater: {
                    klarna: {
                        regions: string[];
                        adoption: number;
                    };
                    afterpay: {
                        regions: string[];
                        adoption: number;
                    };
                    affirm: {
                        regions: string[];
                        adoption: number;
                    };
                };
            };
            fraudProtection: {
                enabled: boolean;
                accuracy: number;
                methods: string[];
            };
            compliance: {
                pci_dss: boolean;
                gdpr: boolean;
                psd2: boolean;
                ccpa: boolean;
            };
        };
        message: string;
    }>;
    getCampaignAnalytics(timeframe?: string, campaignId?: string): Promise<{
        success: boolean;
        data: {
            overview: {
                totalCampaigns: number;
                totalSpend: number;
                totalRevenue: number;
                totalROI: number;
                totalConversions: number;
                totalReach: number;
                avgCTR: number;
                avgConversionRate: number;
            };
            channelPerformance: {
                channel: string;
                spend: number;
                revenue: number;
                roi: number;
                conversions: number;
                reach: number;
                ctr: number;
                conversionRate: number;
            }[];
            quantumAnalytics: {
                predictiveInsights: {
                    nextQuarterROI: number;
                    optimalBudgetAllocation: {
                        email: number;
                        social: number;
                        paid_search: number;
                        content: number;
                    };
                    marketOpportunities: {
                        market: string;
                        potential: string;
                        roi_projection: number;
                    }[];
                };
                audienceEvolution: {
                    emergingSegments: string[];
                    decliningSegments: string[];
                };
            };
            globalPerformance: {
                byRegion: {
                    region: string;
                    roi: number;
                    revenue: number;
                }[];
                byLanguage: {
                    language: string;
                    roi: number;
                    conversions: number;
                }[];
            };
        };
        message: string;
    }>;
    private processAIContentGeneration;
    private processAvatarVideoGeneration;
    private processQuantumAdvertising;
    private processQuantumDemographicAnalysis;
    private generateMultiLanguageContent;
    private generateMultiLanguageVideos;
    private generateGlobalAdVersions;
    private calculateGlobalPricing;
}
//# sourceMappingURL=ai-sales-marketing.controller.d.ts.map