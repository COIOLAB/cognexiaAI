"use strict";
// Industry 5.0 ERP Backend - External System Controller
// Managing external system integrations and connections
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
exports.ExternalSystemController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const external_system_service_1 = require("../services/external-system.service");
const integration_security_guard_1 = require("../guards/integration-security.guard");
let ExternalSystemController = class ExternalSystemController {
    constructor(externalSystemService) {
        this.externalSystemService = externalSystemService;
    }
    async registerExternalSystem(systemDto, req, res) {
        try {
            const system = await this.externalSystemService.registerSystem(systemDto, req.user);
            res.status(common_1.HttpStatus.CREATED).json({
                success: true,
                data: system,
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
    async getExternalSystems(status, type, res) {
        try {
            const systems = await this.externalSystemService.getSystems({ status, type });
            res.status(common_1.HttpStatus.OK).json({
                success: true,
                data: systems,
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
    async getExternalSystem(id, res) {
        try {
            const system = await this.externalSystemService.getSystemById(id);
            if (!system) {
                return res.status(common_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: 'External system not found',
                    timestamp: new Date().toISOString(),
                });
            }
            res.status(common_1.HttpStatus.OK).json({
                success: true,
                data: system,
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
    async updateExternalSystem(id, updateDto, req, res) {
        try {
            const system = await this.externalSystemService.updateSystem(id, updateDto, req.user);
            res.status(common_1.HttpStatus.OK).json({
                success: true,
                data: system,
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
    async deleteExternalSystem(id, req, res) {
        try {
            await this.externalSystemService.deleteSystem(id, req.user);
            res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: 'External system deleted successfully',
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
    async testSystemConnection(id, res) {
        try {
            const result = await this.externalSystemService.testConnection(id);
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
};
exports.ExternalSystemController = ExternalSystemController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register external system' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ExternalSystemController.prototype, "registerExternalSystem", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all external systems' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ExternalSystemController.prototype, "getExternalSystems", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get external system by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExternalSystemController.prototype, "getExternalSystem", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update external system' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ExternalSystemController.prototype, "updateExternalSystem", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete external system' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ExternalSystemController.prototype, "deleteExternalSystem", null);
__decorate([
    (0, common_1.Post)(':id/test-connection'),
    (0, swagger_1.ApiOperation)({ summary: 'Test external system connection' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExternalSystemController.prototype, "testSystemConnection", null);
exports.ExternalSystemController = ExternalSystemController = __decorate([
    (0, swagger_1.ApiTags)('External Systems'),
    (0, common_1.Controller)('api/external-systems'),
    (0, common_1.UseGuards)(integration_security_guard_1.IntegrationSecurityGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [external_system_service_1.ExternalSystemService])
], ExternalSystemController);
//# sourceMappingURL=external-system.controller.js.map