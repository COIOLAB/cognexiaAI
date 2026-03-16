"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const quantum_controller_1 = require("./controllers/quantum.controller");
const quantum_service_1 = require("./services/quantum.service");
const quantum_processor_entity_1 = require("./entities/quantum-processor.entity");
const quantum_sensor_entity_1 = require("./entities/quantum-sensor.entity");
const quantum_optimization_entity_1 = require("./entities/quantum-optimization.entity");
const quantum_security_entity_1 = require("./entities/quantum-security.entity");
const quantum_analytics_entity_1 = require("./entities/quantum-analytics.entity");
let QuantumModule = class QuantumModule {
};
exports.QuantumModule = QuantumModule;
exports.QuantumModule = QuantumModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                quantum_processor_entity_1.QuantumProcessor,
                quantum_sensor_entity_1.QuantumSensor,
                quantum_optimization_entity_1.QuantumOptimization,
                quantum_security_entity_1.QuantumSecurity,
                quantum_analytics_entity_1.QuantumAnalytics,
            ]),
        ],
        controllers: [quantum_controller_1.QuantumController],
        providers: [quantum_service_1.QuantumService],
        exports: [quantum_service_1.QuantumService],
    })
], QuantumModule);
//# sourceMappingURL=quantum.module.js.map