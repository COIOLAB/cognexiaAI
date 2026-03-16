import { Request, Response } from 'express';
import { MessageQueueService } from '../services/message-queue.service';
export declare class MessageQueueController {
    private readonly messageQueueService;
    constructor(messageQueueService: MessageQueueService);
    publishMessage(messageDto: any, req: Request, res: Response): Promise<void>;
    getMessageQueues(status?: string, res: Response): Promise<void>;
    getQueueMessages(queueName: string, limit: number | undefined, res: Response): Promise<void>;
}
//# sourceMappingURL=message-queue.controller.d.ts.map