import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ProcurementUser } from '../strategies/jwt.strategy';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(
    err: any,
    user: ProcurementUser,
    info: any,
    context: ExecutionContext,
  ) {
    const request = context.switchToHttp().getRequest<Request>();
    const endpoint = `${request.method} ${request.url}`;

    if (err || !user) {
      this.logger.warn(`Authentication failed for ${endpoint}: ${info?.message || err?.message}`);
      throw err || new UnauthorizedException('Authentication required');
    }

    // Check if user is active
    if (!user.isActive) {
      this.logger.warn(`Inactive user attempted access: ${user.email}`);
      throw new UnauthorizedException('Account is inactive');
    }

    // Check token expiration with buffer
    const now = Math.floor(Date.now() / 1000);
    const timeToExpiry = user.exp - now;
    
    if (timeToExpiry < 0) {
      this.logger.warn(`Expired token used by user: ${user.email}`);
      throw new UnauthorizedException('Token has expired');
    }

    // Warn if token expires soon (within 5 minutes)
    if (timeToExpiry < 300) {
      this.logger.warn(`Token expiring soon for user: ${user.email} (${timeToExpiry}s remaining)`);
      // Could set a header here to inform client to refresh token
      const response = context.switchToHttp().getResponse();
      response.setHeader('X-Token-Expires-Soon', timeToExpiry.toString());
    }

    // Log successful authentication
    this.logger.log(`User authenticated: ${user.email} (${user.roles.join(', ')}) for ${endpoint}`);

    // Add audit trail information to request
    request.user = user;
    request.audit = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
      department: user.department,
      organizationId: user.organizationId,
      sessionId: user.sessionId,
      timestamp: new Date(),
      endpoint,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    };

    return user;
  }
}

// Decorator for public endpoints
export const Public = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('isPublic', true, descriptor.value);
    return descriptor;
  };
};
