import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

/**
 * JwtAuthGuard - JWT Token Validation
 * 
 * Validates JWT tokens and attaches the decoded user payload to the request.
 * This guard integrates with Passport.js JWT strategy.
 * 
 * Features:
 * - Token validation and expiration check
 * - User payload extraction
 * - Support for public routes via @Public() decorator
 * - Token refresh detection
 * 
 * Usage:
 * @UseGuards(JwtAuthGuard)
 * 
 * Or globally in main.ts:
 * app.useGlobalGuards(new JwtAuthGuard(reflector));
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Call parent AuthGuard to validate JWT
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // Log authentication attempts
    if (err || !user) {
      const ip = request.ip || request.connection.remoteAddress;
      const path = request.url;
      
      this.logger.warn(
        `Authentication failed: ${info?.message || 'Unknown error'} - IP: ${ip}, Path: ${path}`,
      );

      // Provide specific error messages
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired. Please login again.');
      }

      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token. Please login again.');
      }

      if (info?.name === 'NotBeforeError') {
        throw new UnauthorizedException('Token not active yet.');
      }

      throw err || new UnauthorizedException('Authentication required');
    }

    // Log successful authentication (debug level)
    this.logger.debug(`User authenticated: ${user.id} (${user.email})`);

    return user;
  }
}

/**
 * Decorator to mark routes as public (no authentication required)
 * 
 * @example
 * @Public()
 * @Get('health')
 * getHealth() { ... }
 */
export const Public = () => {
  const { SetMetadata } = require('@nestjs/common');
  return SetMetadata('isPublic', true);
};
