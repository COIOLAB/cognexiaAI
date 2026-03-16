import { Request, Response } from 'express';
import { DataSynchronizationService } from '../services/data-synchronization.service';
export declare class DataSynchronizationController {
    private readonly dataSyncService;
    constructor(dataSyncService: DataSynchronizationService);
    createSyncOperation(syncDto: any, req: Request, res: Response): Promise<void>;
    getSyncOperations(status?: string, page: number | undefined, limit: number | undefined, res: Response): Promise<void>;
    startSyncOperation(id: string, req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=data-synchronization.controller.d.ts.map