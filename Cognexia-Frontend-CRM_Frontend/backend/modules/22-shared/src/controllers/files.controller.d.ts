import { Response } from 'express';
import { LocalStorageService, FileMetadata } from '../services/local-storage.service';
export declare class FilesController {
    private readonly storageService;
    constructor(storageService: LocalStorageService);
    serveFile(filePath: string, res: Response): Promise<void>;
    uploadFile(file: Express.Multer.File, category?: FileMetadata['category']): Promise<FileMetadata>;
    getStorageStats(): Promise<Record<string, {
        count: number;
        totalSize: number;
    }>>;
    listFiles(category: FileMetadata['category']): Promise<string[]>;
    private getContentType;
}
//# sourceMappingURL=files.controller.d.ts.map