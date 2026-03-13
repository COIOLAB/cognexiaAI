export declare class IntegrationUtilities {
    private readonly logger;
    generateId(prefix?: string): string;
    formatTimestamp(date?: Date): string;
    validateUrl(url: string): boolean;
    parseHeaders(headerString: string): Record<string, string>;
    sanitizeData(data: any): any;
    delay(ms: number): Promise<void>;
    calculateRetryDelay(attempt: number, baseDelay?: number): number;
}
export declare class DataTransformationUtilsService {
    private readonly logger;
    jsonToXml(data: any): Promise<string>;
    xmlToJson(xml: string): Promise<any>;
    jsonToCsv(data: any[]): Promise<string>;
    csvToJson(csv: string): Promise<any[]>;
    flattenObject(obj: any, prefix?: string): any;
}
export declare class ProtocolUtilsService {
    private readonly logger;
    getSupportedProtocols(): string[];
    validateProtocolUrl(protocol: string, url: string): boolean;
    buildConnectionString(protocol: string, host: string, port: number, options?: any): string;
    extractConnectionInfo(connectionString: string): any;
    private getDefaultPort;
}
export declare class IntegrationValidationService {
    private readonly logger;
    validateConnectionConfig(config: any): {
        valid: boolean;
        errors: string[];
    };
    validateMappingConfig(config: any): {
        valid: boolean;
        errors: string[];
    };
    validateWebhookConfig(config: any): {
        valid: boolean;
        errors: string[];
    };
    private isValidUrl;
    validateDataFormat(data: any, expectedFormat: string): boolean;
}
export declare class APIClientFactoryService {
    private readonly logger;
    createHttpClient(config: any): any;
    createWebSocketClient(config: any): any;
    createMqttClient(config: any): any;
    createFtpClient(config: any): any;
    getClientForProtocol(protocol: string, config: any): any;
}
//# sourceMappingURL=integration-utilities-bundle.d.ts.map