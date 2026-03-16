import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export declare class IntegrationSecurityGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
export declare class APIAuthenticationGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
export declare class RateLimitGuard implements CanActivate {
    private requestCounts;
    private readonly DEFAULT_LIMIT;
    private readonly WINDOW_MS;
    canActivate(context: ExecutionContext): boolean;
    private getClientId;
    private cleanup;
}
export declare class DataValidationGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
    private getRequiredParams;
}
//# sourceMappingURL=integration-guards-bundle.d.ts.map