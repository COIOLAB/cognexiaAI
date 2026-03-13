"use strict";
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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const InventoryService_1 = require("../services/InventoryService");
const swagger_1 = require("@nestjs/swagger");
let InventoryController = class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    // Item Management
    async createItem(createItemDto, req) {
        return await this.inventoryService.createItem(createItemDto, req.user?.id || 'system');
    }
    async getItems(query, req) {
        const { page = 1, limit = 20, category, status, search, lowStock, location } = query;
        return await this.inventoryService.findAllItems(Number(page), Number(limit), {
            category,
            status,
            search,
            lowStock: lowStock === 'true',
            location
        });
    }
    async getItem(id) {
        return await this.inventoryService.findItemById(id);
    }
    async updateItem(id, updateItemDto, req) {
        return await this.inventoryService.updateItem(id, updateItemDto, req.user?.id || 'system');
    }
    async deleteItem(id) {
        await this.inventoryService.deleteItem(id);
        return { message: 'Item deleted successfully' };
    }
    // Stock Management
    async getStock(query) {
        return await this.inventoryService.getStockTransactions(query.itemId, Number(query.page) || 1, Number(query.limit) || 10, {
            type: query.type,
            reason: query.reason,
            dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
            dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
            location: query.location
        });
    }
    async adjustStock(adjustmentDto, req) {
        return await this.inventoryService.createInventoryAdjustment(adjustmentDto, req.user?.id || 'system');
    }
    async transferStock(transferDto, req) {
        return await this.inventoryService.createStockTransaction(transferDto, req.user?.id || 'system');
    }
    async receiveStock(receiveDto, req) {
        return await this.inventoryService.createStockTransaction(receiveDto, req.user?.id || 'system');
    }
    async issueStock(issueDto, req) {
        return await this.inventoryService.createStockTransaction(issueDto, req.user?.id || 'system');
    }
    // Cycle Count Management
    async createCycleCount(cycleCountDto, req) {
        return await this.inventoryService.createCycleCount(cycleCountDto, req.user?.id || 'system');
    }
    async getCycleCounts(query) {
        const { page = 1, limit = 20, status, location } = query;
        // Will implement this method in the service
        return { message: 'Method to be implemented' };
    }
    async completeCycleCount(id, completeDto, req) {
        return await this.inventoryService.completeCycleCount(id, completeDto.actualQuantity, completeDto.notes, req.user?.id || 'system');
    }
    // Analytics & Reports
    async getAnalytics(query) {
        return await this.inventoryService.getInventoryAnalytics(query.period || 'month');
    }
    async getAlerts() {
        return await this.inventoryService.getActiveAlerts();
    }
    async resolveAlert(id, req) {
        return await this.inventoryService.resolveAlert(id, req.user?.id || 'system');
    }
    async generateReport(reportDto) {
        return await this.inventoryService.generateInventoryReport(reportDto);
    }
    // Stock Locations
    async createStockLocation(locationDto) {
        return await this.inventoryService.createStockLocation(locationDto);
    }
    // Reorder Points
    async createReorderPoint(reorderPointDto) {
        return await this.inventoryService.createReorderPoint(reorderPointDto);
    }
    // Health Check
    async getHealth() {
        return await this.inventoryService.getHealthStatus();
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Post)('items'),
    (0, swagger_1.ApiOperation)({ summary: 'Create inventory item' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Item created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createItem", null);
__decorate([
    (0, common_1.Get)('items'),
    (0, swagger_1.ApiOperation)({ summary: 'Get inventory items' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getItems", null);
__decorate([
    (0, common_1.Get)('items/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get inventory item by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getItem", null);
__decorate([
    (0, common_1.Put)('items/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update inventory item' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)('items/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete inventory item' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "deleteItem", null);
__decorate([
    (0, common_1.Get)('stock'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stock information' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getStock", null);
__decorate([
    (0, common_1.Post)('stock/adjust'),
    (0, swagger_1.ApiOperation)({ summary: 'Adjust stock quantity' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "adjustStock", null);
__decorate([
    (0, common_1.Post)('stock/transfer'),
    (0, swagger_1.ApiOperation)({ summary: 'Transfer stock between locations' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "transferStock", null);
__decorate([
    (0, common_1.Post)('stock/receive'),
    (0, swagger_1.ApiOperation)({ summary: 'Receive stock' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "receiveStock", null);
__decorate([
    (0, common_1.Post)('stock/issue'),
    (0, swagger_1.ApiOperation)({ summary: 'Issue stock' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "issueStock", null);
__decorate([
    (0, common_1.Post)('cycle-counts'),
    (0, swagger_1.ApiOperation)({ summary: 'Create cycle count' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createCycleCount", null);
__decorate([
    (0, common_1.Get)('cycle-counts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get cycle counts' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getCycleCounts", null);
__decorate([
    (0, common_1.Put)('cycle-counts/:id/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete cycle count' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "completeCycleCount", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get inventory analytics' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('alerts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active alerts' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Put)('alerts/:id/resolve'),
    (0, swagger_1.ApiOperation)({ summary: 'Resolve alert' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "resolveAlert", null);
__decorate([
    (0, common_1.Post)('reports'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate inventory report' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "generateReport", null);
__decorate([
    (0, common_1.Post)('locations'),
    (0, swagger_1.ApiOperation)({ summary: 'Create stock location' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createStockLocation", null);
__decorate([
    (0, common_1.Post)('reorder-points'),
    (0, swagger_1.ApiOperation)({ summary: 'Create reorder point' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createReorderPoint", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getHealth", null);
exports.InventoryController = InventoryController = __decorate([
    (0, swagger_1.ApiTags)('Inventory'),
    (0, common_1.Controller)('inventory'),
    __metadata("design:paramtypes", [InventoryService_1.InventoryService])
], InventoryController);
//# sourceMappingURL=InventoryController.js.map