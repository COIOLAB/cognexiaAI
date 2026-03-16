import { Request, Response } from 'express';
import { ExternalSystemService } from '../services/external-system.service';
export declare class ExternalSystemController {
    private readonly externalSystemService;
    constructor(externalSystemService: ExternalSystemService);
    registerExternalSystem(systemDto: any, req: Request, res: Response): Promise<void>;
    getExternalSystems(status?: string, type?: string, res: Response): Promise<void>;
    getExternalSystem(id: string, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateExternalSystem(id: string, updateDto: any, req: Request, res: Response): Promise<void>;
    deleteExternalSystem(id: string, req: Request, res: Response): Promise<void>;
    testSystemConnection(id: string, res: Response): Promise<void>;
}
//# sourceMappingURL=external-system.controller.d.ts.map