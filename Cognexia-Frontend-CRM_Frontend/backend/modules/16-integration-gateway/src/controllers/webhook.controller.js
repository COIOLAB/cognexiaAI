"use strict";
// Industry 5.0 ERP Backend - Webhook Controller
// Managing webhook subscriptions, events, and callbacks
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const webhook_service_1 = require("../services/webhook.service");
const integration_security_guard_1 = require("../guards/integration-security.guard");
let WebhookController = class WebhookController {
    constructor(webhookService) {
        this.webhookService = webhookService;
    }
    async createWebhookSubscription(subscriptionDto, req, res) {
        try {
            const subscription = await this.webhookService.createSubscription(subscriptionDto, req.user);
            res.status(common_1.HttpStatus.CREATED).json({
                success: true,
                data: subscription,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: error.message,
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getWebhookSubscriptions(active, event, res) {
        try {
            const subscriptions = await this.webhookService.getSubscriptions({ active, event });
            res.status(common_1.HttpStatus.OK).json({
                success: true,
                data: subscriptions,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message,
                timestamp: new Date().toISOString(),
            });
        }
    }
    async triggerWebhookEvent(event, eventData, res) {
        try {
            const result = await this.webhookService.triggerEvent(event, eventData);
            res.status(common_1.HttpStatus.OK).json({
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: error.message,
                timestamp: new Date().toISOString(),
            });
        }
    }
    async deleteWebhookSubscription(id, res) {
        try {
            await this.webhookService.deleteSubscription(id);
            res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: 'Webhook subscription deleted successfully',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: error.message,
                timestamp: new Date().toISOString(),
            });
        }
    }
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Post)('subscriptions'),
    (0, swagger_1.ApiOperation)({ summary: 'Create webhook subscription' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "createWebhookSubscription", null);
__decorate([
    (0, common_1.Get)('subscriptions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all webhook subscriptions' }),
    __param(0, (0, common_1.Query)('active')),
    __param(1, (0, common_1.Query)('event')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean, String, Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "getWebhookSubscriptions", null);
__decorate([
    (0, common_1.Post)('events/:event'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger webhook event' }),
    __param(0, (0, common_1.Param)('event')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "triggerWebhookEvent", null);
__decorate([
    (0, common_1.Delete)('subscriptions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete webhook subscription' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "deleteWebhookSubscription", null);
exports.WebhookController = WebhookController = __decorate([
    (0, swagger_1.ApiTags)('Webhooks'),
    (0, common_1.Controller)('api/webhooks'),
    (0, common_1.UseGuards)(integration_security_guard_1.IntegrationSecurityGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [webhook_service_1.WebhookService])
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map