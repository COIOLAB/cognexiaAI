import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * GetOrganization decorator for multi-tenancy
 * Extracts the organization ID from the request user context
 * 
 * @example
 * @Get('data')
 * getData(@GetOrganization() organizationId: string) {
 *   // organizationId is extracted from req.user.organizationId
 * }
 */
export const GetOrganization = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    // Return organization ID from authenticated user
    return user?.organizationId || user?.organization_id || user?.tenantId;
  },
);
