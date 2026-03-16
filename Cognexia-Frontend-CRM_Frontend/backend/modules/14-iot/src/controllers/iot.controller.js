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
exports.IoTController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const iot_service_1 = require("../services/iot.service");
let IoTController = class IoTController {
    constructor(iotService) {
        this.iotService = iotService;
    }
    async getDevices() {
        return await this.iotService.getDevices();
    }
    async getDeviceById(id) {
        return await this.iotService.getDeviceById(id);
    }
    async createDevice(deviceData) {
        return await this.iotService.createDevice(deviceData);
    }
    async updateDevice(id, deviceData) {
        return await this.iotService.updateDevice(id, deviceData);
    }
    async deleteDevice(id) {
        return await this.iotService.deleteDevice(id);
    }
    async getSensorReadings(filters) {
        return await this.iotService.getSensorReadings(filters);
    }
    async recordReading(readingData) {
        return await this.iotService.recordReading(readingData);
    }
    async getGateways() {
        return await this.iotService.getGateways();
    }
    async getAlerts(filters) {
        return await this.iotService.getAlerts(filters);
    }
    async getConfigurations() {
        return await this.iotService.getConfigurations();
    }
};
exports.IoTController = IoTController;
__decorate([
    (0, common_1.Get)('devices'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all IoT devices' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'IoT devices retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IoTController.prototype, "getDevices", null);
__decorate([
    (0, common_1.Get)('devices/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get IoT device by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IoTController.prototype, "getDeviceById", null);
__decorate([
    (0, common_1.Post)('devices'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new IoT device' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IoTController.prototype, "createDevice", null);
__decorate([
    (0, common_1.Put)('devices/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update IoT device' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IoTController.prototype, "updateDevice", null);
__decorate([
    (0, common_1.Delete)('devices/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete IoT device' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IoTController.prototype, "deleteDevice", null);
__decorate([
    (0, common_1.Get)('sensors'),
    (0, swagger_1.ApiOperation)({ summary: 'Get sensor readings' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IoTController.prototype, "getSensorReadings", null);
__decorate([
    (0, common_1.Post)('sensors/readings'),
    (0, swagger_1.ApiOperation)({ summary: 'Record sensor reading' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IoTController.prototype, "recordReading", null);
__decorate([
    (0, common_1.Get)('gateways'),
    (0, swagger_1.ApiOperation)({ summary: 'Get IoT gateways' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IoTController.prototype, "getGateways", null);
__decorate([
    (0, common_1.Get)('alerts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get device alerts' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IoTController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Get)('configurations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get IoT configurations' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IoTController.prototype, "getConfigurations", null);
exports.IoTController = IoTController = __decorate([
    (0, swagger_1.ApiTags)('IoT'),
    (0, common_1.Controller)('iot'),
    __metadata("design:paramtypes", [iot_service_1.IoTService])
], IoTController);
//# sourceMappingURL=iot.controller.js.map