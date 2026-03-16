"use strict";
// Core Industry 5.0 ERP Types and Interfaces
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceStandard = exports.SecurityClearanceLevel = exports.UserRole = exports.IndustryType = void 0;
var IndustryType;
(function (IndustryType) {
    IndustryType["MANUFACTURING"] = "MANUFACTURING";
    IndustryType["BANKING"] = "BANKING";
    IndustryType["DEFENCE"] = "DEFENCE";
})(IndustryType || (exports.IndustryType = IndustryType = {}));
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["INDUSTRY_ADMIN"] = "INDUSTRY_ADMIN";
    UserRole["DEPARTMENT_MANAGER"] = "DEPARTMENT_MANAGER";
    UserRole["SUPERVISOR"] = "SUPERVISOR";
    UserRole["OPERATOR"] = "OPERATOR";
    UserRole["AUDITOR"] = "AUDITOR";
    UserRole["READONLY"] = "READONLY";
})(UserRole || (exports.UserRole = UserRole = {}));
var SecurityClearanceLevel;
(function (SecurityClearanceLevel) {
    SecurityClearanceLevel[SecurityClearanceLevel["UNCLASSIFIED"] = 0] = "UNCLASSIFIED";
    SecurityClearanceLevel[SecurityClearanceLevel["CONFIDENTIAL"] = 1] = "CONFIDENTIAL";
    SecurityClearanceLevel[SecurityClearanceLevel["SECRET"] = 2] = "SECRET";
    SecurityClearanceLevel[SecurityClearanceLevel["TOP_SECRET"] = 3] = "TOP_SECRET";
})(SecurityClearanceLevel || (exports.SecurityClearanceLevel = SecurityClearanceLevel = {}));
var ComplianceStandard;
(function (ComplianceStandard) {
    // Manufacturing
    ComplianceStandard["ISO_9001"] = "ISO_9001";
    ComplianceStandard["ISO_14001"] = "ISO_14001";
    ComplianceStandard["OHSAS_18001"] = "OHSAS_18001";
    // Banking
    ComplianceStandard["PCI_DSS"] = "PCI_DSS";
    ComplianceStandard["SOX"] = "SOX";
    ComplianceStandard["BASEL_III"] = "BASEL_III";
    ComplianceStandard["GDPR"] = "GDPR";
    // Defence
    ComplianceStandard["NIST_800_53"] = "NIST_800_53";
    ComplianceStandard["ITAR"] = "ITAR";
    ComplianceStandard["CMMC"] = "CMMC";
    ComplianceStandard["FedRAMP"] = "FedRAMP";
})(ComplianceStandard || (exports.ComplianceStandard = ComplianceStandard = {}));
//# sourceMappingURL=core.js.map