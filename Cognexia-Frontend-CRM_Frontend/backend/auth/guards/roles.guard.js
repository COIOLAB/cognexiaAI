var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
export var Role;
(function (Role) {
    Role["USER"] = "user";
    Role["ADMIN"] = "admin";
    Role["SUPER_ADMIN"] = "super_admin";
    Role["MANAGER"] = "manager";
    Role["EMPLOYEE"] = "employee";
    Role["VIEWER"] = "viewer";
    Role["SUPERVISOR"] = "supervisor";
    Role["OPERATOR"] = "operator";
    // Manufacturing specific roles
    Role["MANUFACTURING_MANAGER"] = "manufacturing_manager";
    Role["PRODUCTION_PLANNER"] = "production_planner";
    Role["QUALITY_INSPECTOR"] = "quality_inspector";
    Role["MAINTENANCE_TECHNICIAN"] = "maintenance_technician";
    Role["SAFETY_SUPERVISOR"] = "safety_supervisor";
    Role["DIGITAL_TWIN_ENGINEER"] = "digital_twin_engineer";
    // Security roles
    Role["SECURITY_ANALYST"] = "security_analyst";
    Role["CYBERSECURITY_MANAGER"] = "cybersecurity_manager";
    Role["COMPLIANCE_OFFICER"] = "compliance_officer";
    Role["AUDITOR"] = "auditor";
    Role["RISK_MANAGER"] = "risk_manager";
    Role["HR_MANAGER"] = "hr_manager";
})(Role || (Role = {}));
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }
        const hasRole = requiredRoles.some((role) => {
            if (user.roles && Array.isArray(user.roles)) {
                return user.roles.includes(role);
            }
            return user.role === role;
        });
        if (!hasRole) {
            throw new ForbiddenException(`Access denied. Required roles: ${requiredRoles.join(', ')}. User roles: ${user.roles || user.role || 'none'}`);
        }
        return true;
    }
};
RolesGuard = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [Reflector])
], RolesGuard);
export { RolesGuard };
//# sourceMappingURL=roles.guard.js.map