"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const quality_controller_1 = require("./controllers/quality.controller");
const quality_service_1 = require("./services/quality.service");
const quality_plan_entity_1 = require("./entities/quality-plan.entity");
const quality_inspection_entity_1 = require("./entities/quality-inspection.entity");
const quality_defect_entity_1 = require("./entities/quality-defect.entity");
const quality_alert_entity_1 = require("./entities/quality-alert.entity");
const quality_metrics_entity_1 = require("./entities/quality-metrics.entity");
const calibration_entity_1 = require("./entities/calibration.entity");
const compliance_record_entity_1 = require("./entities/compliance-record.entity");
let QualityModule = class QualityModule {
};
exports.QualityModule = QualityModule;
exports.QualityModule = QualityModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                quality_plan_entity_1.QualityPlan,
                quality_inspection_entity_1.QualityInspection,
                quality_defect_entity_1.QualityDefect,
                quality_alert_entity_1.QualityAlert,
                quality_metrics_entity_1.QualityMetrics,
                calibration_entity_1.Calibration,
                compliance_record_entity_1.ComplianceRecord,
            ]),
        ],
        controllers: [quality_controller_1.QualityController],
        providers: [quality_service_1.QualityService],
        exports: [quality_service_1.QualityService],
    })
], QualityModule);
//# sourceMappingURL=quality.module.js.map