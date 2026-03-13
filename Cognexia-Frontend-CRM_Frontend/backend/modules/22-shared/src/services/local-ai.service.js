"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LocalAIService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalAIService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const tf = __importStar(require("@tensorflow/tfjs-node"));
const natural = __importStar(require("natural"));
const sentiment = __importStar(require("sentiment"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let LocalAIService = LocalAIService_1 = class LocalAIService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(LocalAIService_1.name);
        this.models = new Map();
        // Pre-trained classification categories
        this.textCategories = [
            'technical', 'business', 'finance', 'operations', 'support',
            'marketing', 'sales', 'hr', 'quality', 'maintenance',
            'inventory', 'procurement', 'production', 'planning'
        ];
        this.sentimentAnalyzer = new sentiment();
        this.stemmer = natural.PorterStemmer;
        this.tokenizer = new natural.WordTokenizer();
        this.modelsPath = this.configService.get('AI_LOCAL_MODELS_PATH', './ai-models');
        // Configure TensorFlow.js backend
        tf.enableProdMode();
    }
    async onModuleInit() {
        this.logger.log('Initializing Local AI Service...');
        await this.initializeModels();
        this.logger.log('Local AI Service initialized successfully');
    }
    /**
     * Initialize AI models
     */
    async initializeModels() {
        const modelsDir = path.resolve(process.cwd(), this.modelsPath);
        if (!fs.existsSync(modelsDir)) {
            fs.mkdirSync(modelsDir, { recursive: true });
        }
        // Create simple models for demonstration
        await this.createSimpleModels();
    }
    /**
     * Analyze text for sentiment, keywords, and classification
     */
    async analyzeText(text) {
        try {
            // Sentiment analysis
            const sentimentResult = this.sentimentAnalyzer.analyze(text);
            // Extract keywords using TF-IDF
            const keywords = this.extractKeywords(text);
            // Language detection (simplified)
            const language = this.detectLanguage(text);
            // Readability score
            const readability = this.calculateReadability(text);
            // Text classification
            const classification = await this.classifyText(text);
            return {
                sentiment: sentimentResult,
                keywords,
                language,
                readability,
                classification,
            };
        }
        catch (error) {
            this.logger.error('Error analyzing text:', error);
            throw new Error('Failed to analyze text');
        }
    }
    /**
     * Predict numerical values based on historical data
     */
    async predictValues(data, horizon = 5) {
        try {
            if (data.length < 3) {
                throw new Error('Insufficient data for prediction');
            }
            // Simple linear regression for demonstration
            const predictions = this.performLinearRegression(data, horizon);
            // Calculate confidence based on data variance
            const variance = this.calculateVariance(data);
            const confidence = Math.max(0.1, Math.min(0.9, 1 - (variance / Math.max(...data))));
            return {
                prediction: predictions,
                confidence,
                metadata: {
                    method: 'linear_regression',
                    dataPoints: data.length,
                    variance: variance,
                },
            };
        }
        catch (error) {
            this.logger.error('Error predicting values:', error);
            throw new Error('Failed to predict values');
        }
    }
    /**
     * Analyze data patterns and generate insights
     */
    async analyzeDataInsights(data, labels) {
        try {
            // Trend analysis
            const trend = this.analyzeTrend(data);
            // Forecast next values
            const forecastResult = await this.predictValues(data, 5);
            const forecast = Array.isArray(forecastResult.prediction)
                ? forecastResult.prediction
                : [forecastResult.prediction];
            // Anomaly detection
            const anomalies = this.detectAnomalies(data);
            // Pattern recognition
            const patterns = this.identifyPatterns(data);
            // Generate recommendations
            const recommendations = this.generateRecommendations(trend, anomalies, patterns);
            return {
                trend,
                forecast,
                anomalies,
                patterns,
                recommendations,
            };
        }
        catch (error) {
            this.logger.error('Error analyzing data insights:', error);
            throw new Error('Failed to analyze data insights');
        }
    }
    /**
     * Generate smart recommendations based on data
     */
    async generateRecommendations(context, data) {
        const recommendations = [];
        // Context-based recommendations
        switch (context.toLowerCase()) {
            case 'inventory':
                recommendations.push(...this.generateInventoryRecommendations(data));
                break;
            case 'production':
                recommendations.push(...this.generateProductionRecommendations(data));
                break;
            case 'quality':
                recommendations.push(...this.generateQualityRecommendations(data));
                break;
            case 'maintenance':
                recommendations.push(...this.generateMaintenanceRecommendations(data));
                break;
            default:
                recommendations.push(...this.generateGeneralRecommendations(data));
        }
        return recommendations;
    }
    /**
     * Perform semantic similarity analysis
     */
    async calculateSimilarity(text1, text2) {
        try {
            const tokens1 = this.tokenizer.tokenize(text1.toLowerCase());
            const tokens2 = this.tokenizer.tokenize(text2.toLowerCase());
            if (!tokens1 || !tokens2)
                return 0;
            // Calculate Jaccard similarity
            const set1 = new Set(tokens1);
            const set2 = new Set(tokens2);
            const intersection = new Set([...set1].filter(x => set2.has(x)));
            const union = new Set([...set1, ...set2]);
            return intersection.size / union.size;
        }
        catch (error) {
            this.logger.error('Error calculating similarity:', error);
            return 0;
        }
    }
    /**
     * Extract key phrases from text
     */
    extractKeyPhrases(text, maxPhrases = 5) {
        try {
            const sentences = text.split(/[.!?]+/);
            const phrases = [];
            for (const sentence of sentences) {
                const tokens = this.tokenizer.tokenize(sentence.toLowerCase());
                if (!tokens)
                    continue;
                // Extract n-grams (2-3 words)
                for (let n = 2; n <= 3; n++) {
                    for (let i = 0; i <= tokens.length - n; i++) {
                        const phrase = tokens.slice(i, i + n).join(' ');
                        const score = this.calculatePhraseScore(phrase, text);
                        phrases.push({ phrase, score });
                    }
                }
            }
            return phrases
                .sort((a, b) => b.score - a.score)
                .slice(0, maxPhrases)
                .map(p => p.phrase);
        }
        catch (error) {
            this.logger.error('Error extracting key phrases:', error);
            return [];
        }
    }
    /**
     * Classify customer feedback/tickets
     */
    async classifyFeedback(text) {
        try {
            const analysis = await this.analyzeText(text);
            // Determine category based on keywords
            let category = 'general';
            if (text.toLowerCase().includes('bug') || text.toLowerCase().includes('error')) {
                category = 'technical';
            }
            else if (text.toLowerCase().includes('feature') || text.toLowerCase().includes('improvement')) {
                category = 'enhancement';
            }
            else if (text.toLowerCase().includes('billing') || text.toLowerCase().includes('payment')) {
                category = 'billing';
            }
            // Determine priority based on sentiment and urgency keywords
            let priority = 'medium';
            const urgentWords = ['urgent', 'critical', 'immediately', 'asap', 'emergency'];
            const hasUrgentWords = urgentWords.some(word => text.toLowerCase().includes(word));
            if (analysis.sentiment.score < -2 || hasUrgentWords) {
                priority = 'high';
            }
            else if (analysis.sentiment.score > 2) {
                priority = 'low';
            }
            return {
                category,
                priority,
                confidence: Math.abs(analysis.sentiment.comparative) + 0.5,
            };
        }
        catch (error) {
            this.logger.error('Error classifying feedback:', error);
            return { category: 'general', priority: 'medium', confidence: 0.5 };
        }
    }
    // Private helper methods
    async createSimpleModels() {
        // Create a simple sequential model for demonstration
        const model = tf.sequential({
            layers: [
                tf.layers.dense({ inputShape: [1], units: 10, activation: 'relu' }),
                tf.layers.dense({ units: 5, activation: 'relu' }),
                tf.layers.dense({ units: 1, activation: 'linear' })
            ]
        });
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'meanSquaredError',
            metrics: ['mae']
        });
        this.models.set('regression', model);
        this.logger.log('Created simple regression model');
    }
    extractKeywords(text, maxKeywords = 10) {
        try {
            const tokens = this.tokenizer.tokenize(text.toLowerCase());
            if (!tokens)
                return [];
            // Remove stop words and short words
            const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but']);
            const filteredTokens = tokens
                .filter(token => !stopWords.has(token) && token.length > 2)
                .map(token => this.stemmer.stem(token));
            // Calculate word frequency
            const frequency = {};
            filteredTokens.forEach(token => {
                frequency[token] = (frequency[token] || 0) + 1;
            });
            // Return top keywords
            return Object.entries(frequency)
                .sort(([, a], [, b]) => b - a)
                .slice(0, maxKeywords)
                .map(([word]) => word);
        }
        catch (error) {
            this.logger.error('Error extracting keywords:', error);
            return [];
        }
    }
    detectLanguage(text) {
        // Simplified language detection (English by default)
        const commonEnglishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        const tokens = this.tokenizer.tokenize(text.toLowerCase());
        if (!tokens)
            return 'unknown';
        const englishWordCount = tokens.filter(token => commonEnglishWords.includes(token)).length;
        const ratio = englishWordCount / tokens.length;
        return ratio > 0.1 ? 'en' : 'unknown';
    }
    calculateReadability(text) {
        // Simplified Flesch Reading Ease calculation
        const sentences = text.split(/[.!?]+/).length;
        const words = this.tokenizer.tokenize(text)?.length || 0;
        const syllables = this.countSyllables(text);
        if (sentences === 0 || words === 0) {
            return { score: 0, level: 'Unknown' };
        }
        const score = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllables / words));
        let level = 'College';
        if (score >= 90)
            level = 'Very Easy';
        else if (score >= 80)
            level = 'Easy';
        else if (score >= 70)
            level = 'Fairly Easy';
        else if (score >= 60)
            level = 'Standard';
        else if (score >= 50)
            level = 'Fairly Difficult';
        else if (score >= 30)
            level = 'Difficult';
        else
            level = 'Very Difficult';
        return { score: Math.max(0, Math.min(100, score)), level };
    }
    countSyllables(text) {
        const words = this.tokenizer.tokenize(text.toLowerCase()) || [];
        return words.reduce((total, word) => {
            const syllableCount = word.match(/[aeiouy]+/g)?.length || 1;
            return total + syllableCount;
        }, 0);
    }
    async classifyText(text) {
        const tokens = this.tokenizer.tokenize(text.toLowerCase()) || [];
        // Simple keyword-based classification
        const categoryScores = {};
        for (const category of this.textCategories) {
            categoryScores[category] = 0;
            // Check for category-specific keywords
            const keywords = this.getCategoryKeywords(category);
            for (const keyword of keywords) {
                if (tokens.includes(keyword)) {
                    categoryScores[category] += 1;
                }
            }
        }
        const bestCategory = Object.entries(categoryScores)
            .sort(([, a], [, b]) => b - a)[0];
        return {
            category: bestCategory[0] || 'general',
            confidence: Math.min(0.9, bestCategory[1] / 10 + 0.1),
        };
    }
    getCategoryKeywords(category) {
        const keywords = {
            technical: ['system', 'software', 'code', 'bug', 'error', 'api', 'database'],
            business: ['revenue', 'profit', 'strategy', 'market', 'customer', 'business'],
            finance: ['budget', 'cost', 'expense', 'invoice', 'payment', 'financial'],
            operations: ['process', 'workflow', 'procedure', 'operation', 'efficiency'],
            support: ['help', 'issue', 'problem', 'question', 'support', 'assistance'],
            marketing: ['campaign', 'promotion', 'advertising', 'brand', 'marketing'],
            sales: ['deal', 'prospect', 'lead', 'quote', 'sales', 'revenue'],
            hr: ['employee', 'staff', 'training', 'recruitment', 'performance'],
            quality: ['quality', 'defect', 'inspection', 'standard', 'compliance'],
            maintenance: ['repair', 'maintenance', 'equipment', 'service', 'breakdown'],
            inventory: ['stock', 'inventory', 'warehouse', 'supply', 'shortage'],
            procurement: ['purchase', 'supplier', 'vendor', 'procurement', 'sourcing'],
            production: ['manufacturing', 'production', 'assembly', 'factory'],
            planning: ['schedule', 'plan', 'forecast', 'timeline', 'resource']
        };
        return keywords[category] || [];
    }
    performLinearRegression(data, horizon) {
        const n = data.length;
        const sumX = (n * (n + 1)) / 2;
        const sumY = data.reduce((a, b) => a + b, 0);
        const sumXY = data.reduce((sum, y, x) => sum + (x + 1) * y, 0);
        const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        const predictions = [];
        for (let i = 1; i <= horizon; i++) {
            predictions.push(slope * (n + i) + intercept);
        }
        return predictions;
    }
    calculateVariance(data) {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const squaredDiffs = data.map(x => Math.pow(x - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
    }
    analyzeTrend(data) {
        if (data.length < 2)
            return 'stable';
        const firstHalf = data.slice(0, Math.floor(data.length / 2));
        const secondHalf = data.slice(Math.floor(data.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        const change = (secondAvg - firstAvg) / firstAvg;
        if (Math.abs(change) < 0.05)
            return 'stable';
        return change > 0 ? 'increasing' : 'decreasing';
    }
    detectAnomalies(data) {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const std = Math.sqrt(this.calculateVariance(data));
        const anomalies = [];
        data.forEach((value, index) => {
            const zScore = Math.abs((value - mean) / std);
            if (zScore > 2) {
                anomalies.push({
                    index,
                    value,
                    severity: Math.min(1, zScore / 4)
                });
            }
        });
        return anomalies;
    }
    identifyPatterns(data) {
        const patterns = [];
        // Check for cyclical patterns
        if (this.hasCyclicalPattern(data)) {
            patterns.push('cyclical');
        }
        // Check for seasonal patterns
        if (this.hasSeasonalPattern(data)) {
            patterns.push('seasonal');
        }
        // Check for step changes
        if (this.hasStepChanges(data)) {
            patterns.push('step_change');
        }
        return patterns;
    }
    hasCyclicalPattern(data) {
        // Simplified cyclical detection
        return data.length > 6 && this.calculateVariance(data) > 0;
    }
    hasSeasonalPattern(data) {
        // Check for repeating patterns (simplified)
        return data.length >= 12;
    }
    hasStepChanges(data) {
        // Check for sudden changes in level
        for (let i = 1; i < data.length; i++) {
            const change = Math.abs(data[i] - data[i - 1]);
            const avgChange = data.slice(0, i).reduce((a, b, idx, arr) => idx > 0 ? a + Math.abs(arr[idx] - arr[idx - 1]) : a, 0) / Math.max(1, i - 1);
            if (change > avgChange * 3) {
                return true;
            }
        }
        return false;
    }
    generateRecommendations(trend, anomalies, patterns) {
        const recommendations = [];
        if (trend === 'increasing') {
            recommendations.push('Consider scaling resources to handle growing demand');
        }
        else if (trend === 'decreasing') {
            recommendations.push('Investigate causes of declining performance');
            recommendations.push('Consider process improvements or resource reallocation');
        }
        if (anomalies.length > 0) {
            recommendations.push('Monitor anomalous values and investigate root causes');
            if (anomalies.some(a => a.severity > 0.7)) {
                recommendations.push('High-severity anomalies detected - immediate attention required');
            }
        }
        if (patterns.includes('cyclical')) {
            recommendations.push('Plan for cyclical variations in demand/performance');
        }
        if (patterns.includes('seasonal')) {
            recommendations.push('Implement seasonal forecasting and resource planning');
        }
        return recommendations;
    }
    generateInventoryRecommendations(data) {
        const recommendations = [];
        if (data.stockLevel && data.stockLevel < data.reorderPoint) {
            recommendations.push('Stock level below reorder point - initiate procurement');
        }
        if (data.turnoverRate && data.turnoverRate < 4) {
            recommendations.push('Low inventory turnover detected - consider demand planning review');
        }
        return recommendations;
    }
    generateProductionRecommendations(data) {
        const recommendations = [];
        if (data.efficiency && data.efficiency < 0.8) {
            recommendations.push('Production efficiency below target - investigate bottlenecks');
        }
        if (data.defectRate && data.defectRate > 0.05) {
            recommendations.push('High defect rate detected - review quality control processes');
        }
        return recommendations;
    }
    generateQualityRecommendations(data) {
        const recommendations = [];
        if (data.qualityScore && data.qualityScore < 85) {
            recommendations.push('Quality score below standard - implement corrective actions');
        }
        return recommendations;
    }
    generateMaintenanceRecommendations(data) {
        const recommendations = [];
        if (data.mtbf && data.mtbf < data.targetMTBF) {
            recommendations.push('Mean time between failures below target - review maintenance schedule');
        }
        return recommendations;
    }
    generateGeneralRecommendations(data) {
        return [
            'Monitor key performance indicators regularly',
            'Consider implementing automated alerts for threshold breaches',
            'Review and optimize current processes based on data insights'
        ];
    }
    calculatePhraseScore(phrase, text) {
        const frequency = (text.match(new RegExp(phrase, 'gi')) || []).length;
        const uniqueness = 1 / (phrase.split(' ').length);
        return frequency * uniqueness;
    }
};
exports.LocalAIService = LocalAIService;
exports.LocalAIService = LocalAIService = LocalAIService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LocalAIService);
//# sourceMappingURL=local-ai.service.js.map