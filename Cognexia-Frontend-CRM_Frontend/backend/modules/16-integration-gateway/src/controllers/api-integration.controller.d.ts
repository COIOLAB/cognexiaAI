import { Request, Response } from 'express';
import { APIConnectionService } from '../services/api-connection.service';
export declare class APIIntegrationController {
    private readonly apiConnectionService;
    constructor(apiConnectionService: APIConnectionService);
    createAPIConnection(createConnectionDto: any, req: Request, res: Response): Promise<void>;
    getAPIConnections(status?: string, protocol?: string, page: number | undefined, limit: number | undefined, req: Request, res: Response): Promise<void>;
    getAPIConnection(id: string, req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateAPIConnection(id: string, updateConnectionDto: any, req: Request, res: Response): Promise<void>;
    deleteAPIConnection(id: string, req: Request, res: Response): Promise<void>;
    testAPIConnection(id: string, req: Request, res: Response): Promise<void>;
    executeAPIRequest(id: string, requestDto: any, req: Request, res: Response): Promise<void>;
    getConnectionLogs(id: string, from?: string, to?: string, level?: string, req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=api-integration.controller.d.ts.map