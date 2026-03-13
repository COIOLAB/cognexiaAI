/**
 * Finance Guard - Authentication & Authorization
 * 
 * Security guard for finance module endpoints providing
 * JWT authentication, role-based access control, and
 * financial data protection.
 */

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class FinanceGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token required');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;

      // Check finance permissions
      const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
      if (requiredPermissions && !this.hasPermissions(payload, requiredPermissions)) {
        throw new ForbiddenException('Insufficient permissions for finance operations');
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private hasPermissions(user: any, requiredPermissions: string[]): boolean {
    const userPermissions = user.permissions || [];
    return requiredPermissions.every(permission => userPermissions.includes(permission));
  }
}
