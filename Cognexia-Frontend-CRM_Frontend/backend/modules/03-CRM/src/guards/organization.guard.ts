import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserType } from '../entities/user.entity';
import { AuthenticatedUser } from './jwt.strategy';

/**
 * Organization Guard
 * Ensures users can only access data from their own organization
 * Super admins can access all organizations
 */
@Injectable()
export class OrganizationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Super admins can access all organizations
    if (user.userType === UserType.SUPER_ADMIN) {
      return true;
    }

    // Org users must have an organization
    if (!user.organizationId) {
      throw new ForbiddenException('User does not belong to any organization');
    }

    // Check if route parameter contains organizationId
    const params = request.params;
    const query = request.query;
    const body = request.body;

    const requestedOrgId = 
      params.organizationId || 
      query.organizationId || 
      body.organizationId;

    // If organizationId is in the request, verify it matches user's org
    if (requestedOrgId && requestedOrgId !== user.organizationId) {
      throw new ForbiddenException('Access denied to this organization');
    }

    // Attach organizationId to request for use in services
    request.organizationId = user.organizationId;

    return true;
  }
}

/**
 * Decorator to get current user from request
 * 
 * @example
 * @Get('me')
 * getMe(@CurrentUser() user: AuthenticatedUser) {
 *   return user;
 * }
 */
export const CurrentUser = () => {
  const { createParamDecorator, ExecutionContext } = require('@nestjs/common');
  return createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      return request.user;
    },
  )();
};

/**
 * Decorator to get organization ID from request
 * 
 * @example
 * @Get('data')
 * getData(@OrganizationId() orgId: string) {
 *   return this.service.getByOrganization(orgId);
 * }
 */
export const OrganizationId = () => {
  const { createParamDecorator, ExecutionContext } = require('@nestjs/common');
  return createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      return request.user?.organizationId || request.organizationId;
    },
  )();
};
