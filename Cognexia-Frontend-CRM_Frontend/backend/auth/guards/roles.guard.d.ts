import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export declare enum Role {
    USER = "user",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin",
    MANAGER = "manager",
    EMPLOYEE = "employee",
    VIEWER = "viewer",
    SUPERVISOR = "supervisor",
    OPERATOR = "operator",
    MANUFACTURING_MANAGER = "manufacturing_manager",
    PRODUCTION_PLANNER = "production_planner",
    QUALITY_INSPECTOR = "quality_inspector",
    MAINTENANCE_TECHNICIAN = "maintenance_technician",
    SAFETY_SUPERVISOR = "safety_supervisor",
    DIGITAL_TWIN_ENGINEER = "digital_twin_engineer",
    SECURITY_ANALYST = "security_analyst",
    CYBERSECURITY_MANAGER = "cybersecurity_manager",
    COMPLIANCE_OFFICER = "compliance_officer",
    AUDITOR = "auditor",
    RISK_MANAGER = "risk_manager",
    HR_MANAGER = "hr_manager"
}
export declare class RolesGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
//# sourceMappingURL=roles.guard.d.ts.map