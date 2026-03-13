export declare class DataMappingService {
    private readonly logger;
    createMapping(mappingDto: any): Promise<any>;
    getMappings(filters?: any): Promise<any[]>;
    applyMapping(mappingId: string, data: any): Promise<any>;
}
export declare class DataTransformationService {
    private readonly logger;
    transformData(transformationId: string, data: any): Promise<any>;
    createTransformation(transformationDto: any): Promise<any>;
    getTransformations(filters?: any): Promise<any[]>;
}
export declare class DataSynchronizationService {
    private readonly logger;
    createSyncOperation(syncDto: any, user: any): Promise<any>;
    getSyncOperations(filters: any): Promise<any[]>;
    startSync(syncId: string): Promise<any>;
}
export declare class WebhookService {
    private readonly logger;
    createSubscription(subscriptionDto: any, user: any): Promise<any>;
    getSubscriptions(filters: any): Promise<any[]>;
    triggerEvent(event: string, eventData: any): Promise<any>;
    deleteSubscription(subscriptionId: string): Promise<void>;
}
export declare class MessageQueueService {
    private readonly logger;
    publishMessage(messageDto: any): Promise<any>;
    getQueues(filters: any): Promise<any[]>;
    getMessages(queueName: string, limit: number): Promise<any[]>;
}
export declare class ExternalSystemService {
    private readonly logger;
    registerSystem(systemDto: any, user: any): Promise<any>;
    getSystems(filters: any): Promise<any[]>;
    getSystemById(systemId: string): Promise<any>;
    updateSystem(systemId: string, updateDto: any, user: any): Promise<any>;
    deleteSystem(systemId: string, user: any): Promise<void>;
    testConnection(systemId: string): Promise<any>;
}
export declare class ProtocolHandlerService {
    private readonly logger;
    handleProtocol(protocol: string, data: any): Promise<any>;
    getSupportedProtocols(): Promise<string[]>;
}
export declare class IntegrationMonitoringService {
    private readonly logger;
    getSystemHealth(): Promise<any>;
    getMetrics(timeRange: string): Promise<any>;
}
export declare class IntegrationSecurityService {
    private readonly logger;
    validateRequest(request: any): Promise<boolean>;
    encryptData(data: any): Promise<string>;
    decryptData(encryptedData: string): Promise<any>;
}
export declare class APIRateLimitService {
    private readonly logger;
    checkRateLimit(apiKey: string): Promise<boolean>;
    incrementCounter(apiKey: string): Promise<void>;
    getRateLimitStatus(apiKey: string): Promise<any>;
}
export declare class IntegrationAnalyticsService {
    private readonly logger;
    getAnalytics(filters: any): Promise<any>;
    generateReport(reportType: string): Promise<any>;
}
export declare class CloudIntegrationService {
    private readonly logger;
    connectToCloud(provider: string, credentials: any): Promise<any>;
    syncWithCloud(cloudService: string, data: any): Promise<any>;
}
export declare class BlockchainIntegrationService {
    private readonly logger;
    recordTransaction(transactionData: any): Promise<any>;
    verifyTransaction(transactionHash: string): Promise<any>;
}
//# sourceMappingURL=integration-services-bundle.d.ts.map