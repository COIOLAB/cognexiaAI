import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { APIConnection } from '../entities/APIConnection';
import { IntegrationLog } from '../entities/IntegrationLog';
import { APICredential } from '../entities/APICredential';
export interface APIConnectionQuery {
    status?: string;
    protocol?: string;
    page?: number;
    limit?: number;
    userId?: string;
}
export interface APIRequestDto {
    method: string;
    endpoint: string;
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
}
export interface ConnectionTestResult {
    success: boolean;
    latency: number;
    status: string;
    message: string;
    timestamp: Date;
}
export declare class APIConnectionService {
    private readonly connectionRepository;
    private readonly logRepository;
    private readonly credentialRepository;
    private readonly httpService;
    private readonly logger;
    constructor(connectionRepository: Repository<APIConnection>, logRepository: Repository<IntegrationLog>, credentialRepository: Repository<APICredential>, httpService: HttpService);
    createConnection(createDto: any, user: any): Promise<APIConnection>;
    getConnections(query: APIConnectionQuery): Promise<APIConnection[]>;
    getConnectionById(id: string): Promise<APIConnection | null>;
    updateConnection(id: string, updateDto: any, user: any): Promise<APIConnection>;
    deleteConnection(id: string, user: any): Promise<void>;
    testConnection(id: string): Promise<ConnectionTestResult>;
    executeRequest(id: string, requestDto: APIRequestDto): Promise<any>;
    getConnectionLogs(id: string, filters?: {
        from?: Date;
        to?: Date;
        level?: string;
    }): Promise<IntegrationLog[]>;
    private createCredentials;
    private updateCredentials;
    private buildHeaders;
    private logActivity;
}
//# sourceMappingURL=api-connection.service.d.ts.map