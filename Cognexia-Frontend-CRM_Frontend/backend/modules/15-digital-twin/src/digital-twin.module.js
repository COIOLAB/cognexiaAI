"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigitalTwinModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const digital_twin_entity_1 = require("./entities/digital-twin.entity");
const digital_twin_simulation_entity_1 = require("./entities/digital-twin-simulation.entity");
const digital_twin_service_1 = require("./services/digital-twin.service");
const digital_twin_controller_1 = require("./controllers/digital-twin.controller");
let DigitalTwinModule = class DigitalTwinModule {
};
exports.DigitalTwinModule = DigitalTwinModule;
exports.DigitalTwinModule = DigitalTwinModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                digital_twin_entity_1.DigitalTwin,
                digital_twin_simulation_entity_1.DigitalTwinSimulation,
            ]),
            schedule_1.ScheduleModule.forRoot(), // Enable scheduled tasks
        ],
        controllers: [digital_twin_controller_1.DigitalTwinController],
        providers: [digital_twin_service_1.DigitalTwinService],
        exports: [digital_twin_service_1.DigitalTwinService, typeorm_1.TypeOrmModule],
    })
], DigitalTwinModule);
//# sourceMappingURL=digital-twin.module.js.map