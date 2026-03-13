"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IoTModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const iot_controller_1 = require("./controllers/iot.controller");
const iot_service_1 = require("./services/iot.service");
const iot_device_entity_1 = require("./entities/iot-device.entity");
const sensor_reading_entity_1 = require("./entities/sensor-reading.entity");
const iot_gateway_entity_1 = require("./entities/iot-gateway.entity");
const device_alert_entity_1 = require("./entities/device-alert.entity");
const iot_configuration_entity_1 = require("./entities/iot-configuration.entity");
let IoTModule = class IoTModule {
};
exports.IoTModule = IoTModule;
exports.IoTModule = IoTModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                iot_device_entity_1.IoTDevice,
                sensor_reading_entity_1.SensorReading,
                iot_gateway_entity_1.IoTGateway,
                device_alert_entity_1.DeviceAlert,
                iot_configuration_entity_1.IoTConfiguration,
            ]),
        ],
        controllers: [iot_controller_1.IoTController],
        providers: [iot_service_1.IoTService],
        exports: [iot_service_1.IoTService],
    })
], IoTModule);
//# sourceMappingURL=iot.module.js.map