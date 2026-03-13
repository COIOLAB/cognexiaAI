import { Request, Response } from 'express';
import { WebhookService } from '../services/webhook.service';
export declare class WebhookController {
    private readonly webhookService;
    constructor(webhookService: WebhookService);
    createWebhookSubscription(subscriptionDto: any, req: Request, res: Response): Promise<void>;
    getWebhookSubscriptions(active?: boolean, event?: string, res: Response): Promise<void>;
    triggerWebhookEvent(event: string, eventData: any, res: Response): Promise<void>;
    deleteWebhookSubscription(id: string, res: Response): Promise<void>;
}
//# sourceMappingURL=webhook.controller.d.ts.map