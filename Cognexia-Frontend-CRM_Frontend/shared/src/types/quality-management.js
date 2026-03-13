"use strict";
// Quality Management System Types for Industry 5.0
// Supporting quality planning and control, inspection workflows, and non-conformance management
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollaborativeDecisionType = exports.QualityMetricType = exports.QualityControlPoint = exports.CorrectiveActionType = exports.NonConformanceStatus = exports.NonConformanceType = exports.SamplingPlan = exports.InspectionStatus = exports.InspectionMethod = exports.InspectionType = exports.QualityObjectiveType = exports.QualityPlanType = void 0;
// ===========================================
// Enums and Constants
// ===========================================
var QualityPlanType;
(function (QualityPlanType) {
    QualityPlanType["MASTER_PLAN"] = "MASTER_PLAN";
    QualityPlanType["PROJECT_PLAN"] = "PROJECT_PLAN";
    QualityPlanType["PRODUCT_PLAN"] = "PRODUCT_PLAN";
    QualityPlanType["PROCESS_PLAN"] = "PROCESS_PLAN";
    QualityPlanType["SUPPLIER_PLAN"] = "SUPPLIER_PLAN";
    QualityPlanType["PREVENTIVE_PLAN"] = "PREVENTIVE_PLAN";
    QualityPlanType["CORRECTIVE_PLAN"] = "CORRECTIVE_PLAN";
    QualityPlanType["VALIDATION_PLAN"] = "VALIDATION_PLAN";
})(QualityPlanType || (exports.QualityPlanType = QualityPlanType = {}));
var QualityObjectiveType;
(function (QualityObjectiveType) {
    QualityObjectiveType["DEFECT_REDUCTION"] = "DEFECT_REDUCTION";
    QualityObjectiveType["PROCESS_IMPROVEMENT"] = "PROCESS_IMPROVEMENT";
    QualityObjectiveType["CUSTOMER_SATISFACTION"] = "CUSTOMER_SATISFACTION";
    QualityObjectiveType["COMPLIANCE_ACHIEVEMENT"] = "COMPLIANCE_ACHIEVEMENT";
    QualityObjectiveType["COST_REDUCTION"] = "COST_REDUCTION";
    QualityObjectiveType["CYCLE_TIME_REDUCTION"] = "CYCLE_TIME_REDUCTION";
    QualityObjectiveType["FIRST_PASS_YIELD"] = "FIRST_PASS_YIELD";
    QualityObjectiveType["RIGHT_FIRST_TIME"] = "RIGHT_FIRST_TIME";
})(QualityObjectiveType || (exports.QualityObjectiveType = QualityObjectiveType = {}));
var InspectionType;
(function (InspectionType) {
    InspectionType["INCOMING"] = "INCOMING";
    InspectionType["IN_PROCESS"] = "IN_PROCESS";
    InspectionType["FINAL"] = "FINAL";
    InspectionType["PATROL"] = "PATROL";
    InspectionType["AUDIT"] = "AUDIT";
    InspectionType["VERIFICATION"] = "VERIFICATION";
    InspectionType["VALIDATION"] = "VALIDATION";
    InspectionType["CALIBRATION"] = "CALIBRATION";
    InspectionType["PREVENTIVE"] = "PREVENTIVE";
})(InspectionType || (exports.InspectionType = InspectionType = {}));
var InspectionMethod;
(function (InspectionMethod) {
    InspectionMethod["VISUAL"] = "VISUAL";
    InspectionMethod["DIMENSIONAL"] = "DIMENSIONAL";
    InspectionMethod["FUNCTIONAL"] = "FUNCTIONAL";
    InspectionMethod["DESTRUCTIVE"] = "DESTRUCTIVE";
    InspectionMethod["NON_DESTRUCTIVE"] = "NON_DESTRUCTIVE";
    InspectionMethod["STATISTICAL"] = "STATISTICAL";
    InspectionMethod["AI_VISION"] = "AI_VISION";
    InspectionMethod["SENSOR_BASED"] = "SENSOR_BASED";
    InspectionMethod["HYBRID"] = "HYBRID";
})(InspectionMethod || (exports.InspectionMethod = InspectionMethod = {}));
var InspectionStatus;
(function (InspectionStatus) {
    InspectionStatus["PLANNED"] = "PLANNED";
    InspectionStatus["SCHEDULED"] = "SCHEDULED";
    InspectionStatus["IN_PROGRESS"] = "IN_PROGRESS";
    InspectionStatus["COMPLETED"] = "COMPLETED";
    InspectionStatus["PASSED"] = "PASSED";
    InspectionStatus["FAILED"] = "FAILED";
    InspectionStatus["ON_HOLD"] = "ON_HOLD";
    InspectionStatus["CANCELLED"] = "CANCELLED";
    InspectionStatus["REWORK_REQUIRED"] = "REWORK_REQUIRED";
})(InspectionStatus || (exports.InspectionStatus = InspectionStatus = {}));
var SamplingPlan;
(function (SamplingPlan) {
    SamplingPlan["ZERO_ACCEPTANCE"] = "ZERO_ACCEPTANCE";
    SamplingPlan["SINGLE_SAMPLING"] = "SINGLE_SAMPLING";
    SamplingPlan["DOUBLE_SAMPLING"] = "DOUBLE_SAMPLING";
    SamplingPlan["MULTIPLE_SAMPLING"] = "MULTIPLE_SAMPLING";
    SamplingPlan["SEQUENTIAL_SAMPLING"] = "SEQUENTIAL_SAMPLING";
    SamplingPlan["SKIP_LOT_SAMPLING"] = "SKIP_LOT_SAMPLING";
    SamplingPlan["CONTINUOUS_SAMPLING"] = "CONTINUOUS_SAMPLING";
    SamplingPlan["ONE_HUNDRED_PERCENT"] = "ONE_HUNDRED_PERCENT";
})(SamplingPlan || (exports.SamplingPlan = SamplingPlan = {}));
var NonConformanceType;
(function (NonConformanceType) {
    NonConformanceType["MINOR"] = "MINOR";
    NonConformanceType["MAJOR"] = "MAJOR";
    NonConformanceType["CRITICAL"] = "CRITICAL";
    NonConformanceType["OBSERVATION"] = "OBSERVATION";
    NonConformanceType["POTENTIAL"] = "POTENTIAL";
    NonConformanceType["CUSTOMER_COMPLAINT"] = "CUSTOMER_COMPLAINT";
    NonConformanceType["SUPPLIER_ISSUE"] = "SUPPLIER_ISSUE";
    NonConformanceType["PROCESS_DEVIATION"] = "PROCESS_DEVIATION";
})(NonConformanceType || (exports.NonConformanceType = NonConformanceType = {}));
var NonConformanceStatus;
(function (NonConformanceStatus) {
    NonConformanceStatus["OPEN"] = "OPEN";
    NonConformanceStatus["INVESTIGATING"] = "INVESTIGATING";
    NonConformanceStatus["ROOT_CAUSE_IDENTIFIED"] = "ROOT_CAUSE_IDENTIFIED";
    NonConformanceStatus["CORRECTIVE_ACTION_PLANNED"] = "CORRECTIVE_ACTION_PLANNED";
    NonConformanceStatus["CORRECTIVE_ACTION_IMPLEMENTED"] = "CORRECTIVE_ACTION_IMPLEMENTED";
    NonConformanceStatus["VERIFICATION_PENDING"] = "VERIFICATION_PENDING";
    NonConformanceStatus["CLOSED"] = "CLOSED";
    NonConformanceStatus["REJECTED"] = "REJECTED";
})(NonConformanceStatus || (exports.NonConformanceStatus = NonConformanceStatus = {}));
var CorrectiveActionType;
(function (CorrectiveActionType) {
    CorrectiveActionType["IMMEDIATE"] = "IMMEDIATE";
    CorrectiveActionType["CORRECTIVE"] = "CORRECTIVE";
    CorrectiveActionType["PREVENTIVE"] = "PREVENTIVE";
    CorrectiveActionType["CONTAINMENT"] = "CONTAINMENT";
    CorrectiveActionType["SYSTEMATIC"] = "SYSTEMATIC";
    CorrectiveActionType["PROCESS_IMPROVEMENT"] = "PROCESS_IMPROVEMENT";
    CorrectiveActionType["TRAINING"] = "TRAINING";
    CorrectiveActionType["PROCEDURAL"] = "PROCEDURAL";
})(CorrectiveActionType || (exports.CorrectiveActionType = CorrectiveActionType = {}));
var QualityControlPoint;
(function (QualityControlPoint) {
    QualityControlPoint["RAW_MATERIAL"] = "RAW_MATERIAL";
    QualityControlPoint["SETUP_APPROVAL"] = "SETUP_APPROVAL";
    QualityControlPoint["FIRST_PIECE"] = "FIRST_PIECE";
    QualityControlPoint["IN_PROCESS"] = "IN_PROCESS";
    QualityControlPoint["FINAL_INSPECTION"] = "FINAL_INSPECTION";
    QualityControlPoint["PACKAGING"] = "PACKAGING";
    QualityControlPoint["SHIPPING"] = "SHIPPING";
    QualityControlPoint["CUSTOMER_RECEIPT"] = "CUSTOMER_RECEIPT";
})(QualityControlPoint || (exports.QualityControlPoint = QualityControlPoint = {}));
var QualityMetricType;
(function (QualityMetricType) {
    QualityMetricType["DEFECT_RATE"] = "DEFECT_RATE";
    QualityMetricType["FIRST_PASS_YIELD"] = "FIRST_PASS_YIELD";
    QualityMetricType["CUSTOMER_SATISFACTION"] = "CUSTOMER_SATISFACTION";
    QualityMetricType["PROCESS_CAPABILITY"] = "PROCESS_CAPABILITY";
    QualityMetricType["COST_OF_QUALITY"] = "COST_OF_QUALITY";
    QualityMetricType["INSPECTION_EFFICIENCY"] = "INSPECTION_EFFICIENCY";
    QualityMetricType["SUPPLIER_QUALITY"] = "SUPPLIER_QUALITY";
    QualityMetricType["COMPLIANCE_RATE"] = "COMPLIANCE_RATE";
})(QualityMetricType || (exports.QualityMetricType = QualityMetricType = {}));
var CollaborativeDecisionType;
(function (CollaborativeDecisionType) {
    CollaborativeDecisionType["ACCEPT"] = "ACCEPT";
    CollaborativeDecisionType["REJECT"] = "REJECT";
    CollaborativeDecisionType["REWORK"] = "REWORK";
    CollaborativeDecisionType["USE_AS_IS"] = "USE_AS_IS";
    CollaborativeDecisionType["CONCESSION"] = "CONCESSION";
    CollaborativeDecisionType["RETURN_TO_SUPPLIER"] = "RETURN_TO_SUPPLIER";
    CollaborativeDecisionType["ESCALATE"] = "ESCALATE";
    CollaborativeDecisionType["INVESTIGATE"] = "INVESTIGATE";
})(CollaborativeDecisionType || (exports.CollaborativeDecisionType = CollaborativeDecisionType = {}));
//# sourceMappingURL=quality-management.js.map