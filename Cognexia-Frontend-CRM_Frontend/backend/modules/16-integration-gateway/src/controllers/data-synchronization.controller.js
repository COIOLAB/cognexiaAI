"use strict";
// Industry 5.0 ERP Backend - Data Synchronization Controller
// Managing data synchronization between internal and external systems
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
exports.DataSynchronizationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const data_synchronization_service_1 = require("../services/data-synchronization.service");
const integration_security_guard_1 = require("../guards/integration-security.guard");
let DataSynchronizationController = class DataSynchronizationController {
    constructor(dataSyncService) {
        this.dataSyncService = dataSyncService;
    }
    async createSyncOperation(syncDto, req, res) {
        try {
            const operation = await this.dataSyncService.createSyncOperation(syncDto, req.user);
            res.status(common_1.HttpStatus.CREATED).json({
                success: true,
                data: operation,
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
    async getSyncOperations(status, page = 1, limit = 10, res) {
        try {
            const operations = await this.dataSyncService.getSyncOperations({ status, page, limit });
            res.status(common_1.HttpStatus.OK).json({
                success: true,
                data: operations,
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
    async startSyncOperation(id, req, res) {
        try {
            const result = await this.dataSyncService.startSync(id);
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
exports.DataSynchronizationController = DataSynchronizationController;
__decorate([
    (0, common_1.Post)('operations'),
    (0, swagger_1.ApiOperation)({ summary: 'Create sync operation' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], DataSynchronizationController.prototype, "createSyncOperation", null);
__decorate([
    (0, common_1.Get)('operations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all sync operations' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], DataSynchronizationController.prototype, "getSyncOperations", null);
__decorate([
    (0, common_1.Post)('operations/:id/start'),
    (0, swagger_1.ApiOperation)({ summary: 'Start sync operation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], DataSynchronizationController.prototype, "startSyncOperation", null);
exports.DataSynchronizationController = DataSynchronizationController = __decorate([
    (0, swagger_1.ApiTags)('Data Synchronization'),
    (0, common_1.Controller)('api/sync'),
    (0, common_1.UseGuards)(integration_security_guard_1.IntegrationSecurityGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [data_synchronization_service_1.DataSynchronizationService])
], DataSynchronizationController);
//# sourceMappingURL=data-synchronization.controller.js.map