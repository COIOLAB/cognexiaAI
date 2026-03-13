import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface TextAnalysisResult {
    sentiment: {
        score: number;
        comparative: number;
        tokens: string[];
        words: string[];
        positive: string[];
        negative: string[];
    };
    keywords: string[];
    language: string;
    readability: {
        score: number;
        level: string;
    };
    classification?: {
        category: string;
        confidence: number;
    };
}
export interface PredictionResult {
    prediction: number | number[];
    confidence: number;
    metadata?: Record<string, any>;
}
export interface DataInsight {
    trend: 'increasing' | 'decreasing' | 'stable';
    forecast: number[];
    anomalies: Array<{
        index: number;
        value: number;
        severity: number;
    }>;
    patterns: string[];
    recommendations: string[];
}
export declare class LocalAIService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private readonly sentimentAnalyzer;
    private readonly stemmer;
    private readonly tokenizer;
    private models;
    private readonly modelsPath;
    private readonly textCategories;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    /**
     * Initialize AI models
     */
    private initializeModels;
    /**
     * Analyze text for sentiment, keywords, and classification
     */
    analyzeText(text: string): Promise<TextAnalysisResult>;
    /**
     * Predict numerical values based on historical data
     */
    predictValues(data: number[], horizon?: number): Promise<PredictionResult>;
    /**
     * Analyze data patterns and generate insights
     */
    analyzeDataInsights(data: number[], labels?: string[]): Promise<DataInsight>;
    /**
     * Perform semantic similarity analysis
     */
    calculateSimilarity(text1: string, text2: string): Promise<number>;
    /**
     * Extract key phrases from text
     */
    extractKeyPhrases(text: string, maxPhrases?: number): string[];
    /**
     * Classify customer feedback/tickets
     */
    classifyFeedback(text: string): Promise<{
        category: string;
        priority: string;
        confidence: number;
    }>;
    private createSimpleModels;
    private extractKeywords;
    private detectLanguage;
    private calculateReadability;
    private countSyllables;
    private classifyText;
    private getCategoryKeywords;
    private performLinearRegression;
    private calculateVariance;
    private analyzeTrend;
    private detectAnomalies;
    private identifyPatterns;
    private hasCyclicalPattern;
    private hasSeasonalPattern;
    private hasStepChanges;
    private generateInventoryRecommendations;
    private generateProductionRecommendations;
    private generateQualityRecommendations;
    private generateMaintenanceRecommendations;
    private generateGeneralRecommendations;
    private calculatePhraseScore;
}
//# sourceMappingURL=local-ai.service.d.ts.map