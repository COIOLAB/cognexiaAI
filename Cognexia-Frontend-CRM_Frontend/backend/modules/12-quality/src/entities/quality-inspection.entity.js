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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityInspection = exports.InspectionResult = exports.InspectionType = exports.InspectionStatus = void 0;
const typeorm_1 = require("typeorm");
const quality_plan_entity_1 = require("./quality-plan.entity");
const quality_defect_entity_1 = require("./quality-defect.entity");
var InspectionStatus;
(function (InspectionStatus) {
    InspectionStatus["SCHEDULED"] = "scheduled";
    InspectionStatus["IN_PROGRESS"] = "in_progress";
    InspectionStatus["COMPLETED"] = "completed";
    InspectionStatus["FAILED"] = "failed";
    InspectionStatus["CANCELLED"] = "cancelled";
})(InspectionStatus || (exports.InspectionStatus = InspectionStatus = {}));
var InspectionType;
(function (InspectionType) {
    InspectionType["INCOMING"] = "incoming";
    InspectionType["IN_PROCESS"] = "in_process";
    InspectionType["FINAL"] = "final";
    InspectionType["AUDIT"] = "audit";
    InspectionType["CALIBRATION"] = "calibration";
    InspectionType["COMPLIANCE"] = "compliance";
})(InspectionType || (exports.InspectionType = InspectionType = {}));
var InspectionResult;
(function (InspectionResult) {
    InspectionResult["PASS"] = "pass";
    InspectionResult["FAIL"] = "fail";
    InspectionResult["CONDITIONAL_PASS"] = "conditional_pass";
    InspectionResult["PENDING"] = "pending";
})(InspectionResult || (exports.InspectionResult = InspectionResult = {}));
let QualityInspection = class QualityInspection {
};
exports.QualityInspection = QualityInspection;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], QualityInspection.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], QualityInspection.prototype, "inspectionNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InspectionType,
    }),
    __metadata("design:type", String)
], QualityInspection.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InspectionStatus,
        default: InspectionStatus.SCHEDULED,
    }),
    __metadata("design:type", String)
], QualityInspection.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InspectionResult,
        nullable: true,
    }),
    __metadata("design:type", String)
], QualityInspection.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], QualityInspection.prototype, "workCenterId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], QualityInspection.prototype, "productionOrderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], QualityInspection.prototype, "batchNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], QualityInspection.prototype, "productCode", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], QualityInspection.prototype, "inspectorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], QualityInspection.prototype, "inspectorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], QualityInspection.prototype, "scheduledDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], QualityInspection.prototype, "actualStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], QualityInspection.prototype, "actualEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], QualityInspection.prototype, "inspectionParameters", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], QualityInspection.prototype, "testResults", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], QualityInspection.prototype, "measurements", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], QualityInspection.prototype, "qualityScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], QualityInspection.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], QualityInspection.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], QualityInspection.prototype, "corrective_actions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], QualityInspection.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], QualityInspection.prototype, "requiresReInspection", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], QualityInspection.prototype, "reInspectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], QualityInspection.prototype, "compliance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], QualityInspection.prototype, "industrySpecific", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => quality_plan_entity_1.QualityPlan, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'qualityPlanId' }),
    __metadata("design:type", typeof (_a = typeof quality_plan_entity_1.QualityPlan !== "undefined" && quality_plan_entity_1.QualityPlan) === "function" ? _a : Object)
], QualityInspection.prototype, "qualityPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], QualityInspection.prototype, "qualityPlanId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => quality_defect_entity_1.QualityDefect, defect => defect.inspection),
    __metadata("design:type", Array)
], QualityInspection.prototype, "defects", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], QualityInspection.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], QualityInspection.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], QualityInspection.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], QualityInspection.prototype, "updatedBy", void 0);
exports.QualityInspection = QualityInspection = __decorate([
    (0, typeorm_1.Entity)('quality_inspections')
], QualityInspection);
//# sourceMappingURL=quality-inspection.entity.js.map