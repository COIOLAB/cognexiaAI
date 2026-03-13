"use strict";
// Industry 5.0 ERP Backend - API Integration Controller
// Managing external API connections, authentication, and data exchange
// Author: AI Assistant - Industry 5.0 Pioneer
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
exports.APIIntegrationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_connection_service_1 = require("../services/api-connection.service");
const integration_security_guard_1 = require("../guards/integration-security.guard");
const api_authentication_guard_1 = require("../guards/api-authentication.guard");
const rate_limit_guard_1 = require("../guards/rate-limit.guard");
let APIIntegrationController = class APIIntegrationController {
    constructor(apiConnectionService) {
        this.apiConnectionService = apiConnectionService;
    }
    async createAPIConnection(createConnectionDto, req, res) {
        try {
            const connection = await this.apiConnectionService.createConnection(createConnectionDto, req.user);
            res.status(common_1.HttpStatus.CREATED).json({
                success: true,
                message: 'API connection created successfully',
                data: connection,
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
    async getAPIConnections(status, protocol, page = 1, limit = 10, req, res) {
        try {
            const connections = await this.apiConnectionService.getConnections({
                status,
                protocol,
                page,
                limit,
                userId: req.user?.id,
            });
            res.status(common_1.HttpStatus.OK).json({
                success: true,
                data: connections,
                pagination: {
                    page,
                    limit,
                    total: connections.length,
                },
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
    async getAPIConnection(id, req, res) {
        try {
            const connection = await this.apiConnectionService.getConnectionById(id);
            if (!connection) {
                return res.status(common_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: 'API connection not found',
                    timestamp: new Date().toISOString(),
                });
            }
            res.status(common_1.HttpStatus.OK).json({
                success: true,
                data: connection,
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
    async updateAPIConnection(id, updateConnectionDto, req, res) {
        try {
            const connection = await this.apiConnectionService.updateConnection(id, updateConnectionDto, req.user);
            res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: 'API connection updated successfully',
                data: connection,
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
    async deleteAPIConnection(id, req, res) {
        try {
            await this.apiConnectionService.deleteConnection(id, req.user);
            res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: 'API connection deleted successfully',
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
    async testAPIConnection(id, req, res) {
        try {
            const result = await this.apiConnectionService.testConnection(id);
            res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: 'Connection test completed',
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
    async executeAPIRequest(id, requestDto, req, res) {
        try {
            const result = await this.apiConnectionService.executeRequest(id, requestDto);
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
    async getConnectionLogs(id, from, to, level, req, res) {
        try {
            const logs = await this.apiConnectionService.getConnectionLogs(id, {
                from: from ? new Date(from) : undefined,
                to: to ? new Date(to) : undefined,
                level,
            });
            res.status(common_1.HttpStatus.OK).json({
                success: true,
                data: logs,
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
exports.APIIntegrationController = APIIntegrationController;
__decorate([
    (0, common_1.Post)('connections'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new API connection' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'API connection created successfully' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], APIIntegrationController.prototype, "createAPIConnection", null);
__decorate([
    (0, common_1.Get)('connections'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all API connections' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'protocol', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('protocol')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Req)()),
    __param(5, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], APIIntegrationController.prototype, "getAPIConnections", null);
__decorate([
    (0, common_1.Get)('connections/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get API connection by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], APIIntegrationController.prototype, "getAPIConnection", null);
__decorate([
    (0, common_1.Put)('connections/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update API connection' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], APIIntegrationController.prototype, "updateAPIConnection", null);
__decorate([
    (0, common_1.Delete)('connections/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete API connection' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], APIIntegrationController.prototype, "deleteAPIConnection", null);
__decorate([
    (0, common_1.Post)('connections/:id/test'),
    (0, swagger_1.ApiOperation)({ summary: 'Test API connection' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], APIIntegrationController.prototype, "testAPIConnection", null);
__decorate([
    (0, common_1.Post)('connections/:id/execute'),
    (0, swagger_1.ApiOperation)({ summary: 'Execute API request through connection' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], APIIntegrationController.prototype, "executeAPIRequest", null);
__decorate([
    (0, common_1.Get)('connections/:id/logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get API connection logs' }),
    (0, swagger_1.ApiQuery)({ name: 'from', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'to', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'level', required: false }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __param(3, (0, common_1.Query)('level')),
    __param(4, (0, common_1.Req)()),
    __param(5, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], APIIntegrationController.prototype, "getConnectionLogs", null);
exports.APIIntegrationController = APIIntegrationController = __decorate([
    (0, swagger_1.ApiTags)('API Integration'),
    (0, common_1.Controller)('api/integration'),
    (0, common_1.UseGuards)(integration_security_guard_1.IntegrationSecurityGuard, api_authentication_guard_1.APIAuthenticationGuard, rate_limit_guard_1.RateLimitGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [api_connection_service_1.APIConnectionService])
], APIIntegrationController);
//# sourceMappingURL=api-integration.controller.js.map