export declare class IntegrationEndpoint {
    id: string;
    name: string;
    url: string;
    method: string;
    protocol: string;
    status: string;
    headers: Record<string, string>;
    configuration: any;
    createdAt: Date;
    updatedAt: Date;
}
export declare class APIConnection {
    id: string;
    name: string;
    baseUrl: string;
    testEndpoint: string;
    protocol: string;
    status: string;
    lastTestResult: string;
    lastTested: Date;
    configuration: any;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    credentials: APICredential[];
    logs: IntegrationLog[];
}
export declare class APICredential {
    id: string;
    connectionId: string;
    type: string;
    keyName: string;
    value: string;
    encrypted: boolean;
    createdAt: Date;
    updatedAt: Date;
    connection: APIConnection;
}
export declare class DataMapping {
    id: string;
    name: string;
    sourceFormat: string;
    targetFormat: string;
    mappingRules: any;
    status: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class IntegrationLog {
    id: string;
    connectionId: string;
    activity: string;
    message: string;
    level: string;
    metadata: any;
    timestamp: Date;
    connection: APIConnection;
}
export declare class WebhookSubscription {
    id: string;
    url: string;
    event: string;
    active: boolean;
    headers: Record<string, string>;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class MessageQueue {
    id: string;
    name: string;
    status: string;
    messageCount: number;
    consumers: number;
    configuration: any;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ExternalSystem {
    id: string;
    name: string;
    type: string;
    endpoint: string;
    status: string;
    lastConnected: Date;
    configuration: any;
    registeredBy: string;
    updatedBy: string;
    registeredAt: Date;
    updatedAt: Date;
}
export declare class IntegrationConfig {
    id: string;
    name: string;
    category: string;
    configuration: any;
    status: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class DataTransformation {
    id: string;
    name: string;
    inputFormat: string;
    outputFormat: string;
    transformationRules: any;
    status: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class IntegrationAlert {
    id: string;
    alertType: string;
    severity: string;
    message: string;
    metadata: any;
    status: string;
    triggeredAt: Date;
    resolvedAt: Date;
}
export declare class IntegrationMetric {
    id: string;
    metricName: string;
    value: number;
    unit: string;
    tags: Record<string, string>;
    timestamp: Date;
    createdAt: Date;
}
export declare class SyncOperation {
    id: string;
    name: string;
    sourceSystem: string;
    targetSystem: string;
    status: string;
    startedAt: Date;
    completedAt: Date;
    recordsProcessed: number;
    errorMessage: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class IntegrationAudit {
    id: string;
    action: string;
    resourceId: string;
    resourceType: string;
    userId: string;
    changes: any;
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
}
export declare class ExternalDataSource {
    id: string;
    name: string;
    sourceType: string;
    connectionString: string;
    credentials: any;
    status: string;
    lastSyncAt: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class IntegrationAnalytics {
    id: string;
    metricType: string;
    data: any;
    periodStart: Date;
    periodEnd: Date;
    generatedAt: Date;
}
//# sourceMappingURL=integration-entities-bundle.d.ts.map