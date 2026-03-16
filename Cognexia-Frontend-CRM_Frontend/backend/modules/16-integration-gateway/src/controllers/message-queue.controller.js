"use strict";
// Industry 5.0 ERP Backend - Message Queue Controller
// Managing message queue operations and messaging systems
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
exports.MessageQueueController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const message_queue_service_1 = require("../services/message-queue.service");
const integration_security_guard_1 = require("../guards/integration-security.guard");
let MessageQueueController = class MessageQueueController {
    constructor(messageQueueService) {
        this.messageQueueService = messageQueueService;
    }
    async publishMessage(messageDto, req, res) {
        try {
            const result = await this.messageQueueService.publishMessage(messageDto);
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
    async getMessageQueues(status, res) {
        try {
            const queues = await this.messageQueueService.getQueues({ status });
            res.status(common_1.HttpStatus.OK).json({
                success: true,
                data: queues,
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
    async getQueueMessages(queueName, limit = 10, res) {
        try {
            const messages = await this.messageQueueService.getMessages(queueName, limit);
            res.status(common_1.HttpStatus.OK).json({
                success: true,
                data: messages,
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
};
exports.MessageQueueController = MessageQueueController;
__decorate([
    (0, common_1.Post)('publish'),
    (0, swagger_1.ApiOperation)({ summary: 'Publish message to queue' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], MessageQueueController.prototype, "publishMessage", null);
__decorate([
    (0, common_1.Get)('queues'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all message queues' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessageQueueController.prototype, "getMessageQueues", null);
__decorate([
    (0, common_1.Get)('queues/:queueName/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get messages from queue' }),
    __param(0, (0, common_1.Param)('queueName')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], MessageQueueController.prototype, "getQueueMessages", null);
exports.MessageQueueController = MessageQueueController = __decorate([
    (0, swagger_1.ApiTags)('Message Queue'),
    (0, common_1.Controller)('api/message-queue'),
    (0, common_1.UseGuards)(integration_security_guard_1.IntegrationSecurityGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [message_queue_service_1.MessageQueueService])
], MessageQueueController);
//# sourceMappingURL=message-queue.controller.js.map