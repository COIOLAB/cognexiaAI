// Industry 5.0 ERP Backend - Integration Gateway Guards Bundle
// Security, authentication, rate limiting, and validation guards

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

// ========== Integration Security Guard ==========
@Injectable()
export class IntegrationSecurityGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Basic security validation
    const userAgent = request.headers['user-agent'];
    if (!userAgent || userAgent.includes('curl')) {
      // Allow for development but log
      console.log('Warning: Basic user agent detected');
    }

    // Check for required security headers
    const authorization = request.headers.authorization;
    if (!authorization && process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException('Missing authorization header');
    }

    // Add basic user context if not exists
    if (!request.user) {
      (request as any).user = {
        id: 'system-user',
        role: 'integration',
        permissions: ['integration:read', 'integration:write']
      };
    }

    return true;
  }
}

// ========== API Authentication Guard ==========
@Injectable()
export class APIAuthenticationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Check for API key or bearer token
    const apiKey = request.headers['x-api-key'] as string;
    const authorization = request.headers.authorization;

    if (!apiKey && !authorization) {
      // In development, allow without strict auth
      if (process.env.NODE_ENV === 'development') {
        console.log('Warning: No authentication provided, allowing in development mode');
        return true;
      }
      throw new UnauthorizedException('API key or authorization token required');
    }

    // Validate API key format (basic validation)
    if (apiKey && apiKey.length < 10) {
      throw new UnauthorizedException('Invalid API key format');
    }

    // Validate bearer token format
    if (authorization && !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    return true;
  }
}

// ========== Rate Limit Guard ==========
@Injectable()
export class RateLimitGuard implements CanActivate {
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly DEFAULT_LIMIT = 1000;
  private readonly WINDOW_MS = 3600000; // 1 hour

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Get client identifier (IP + API key)
    const clientId = this.getClientId(request);
    const now = Date.now();
    
    // Clean up expired entries
    this.cleanup(now);
    
    // Get or initialize client data
    const clientData = this.requestCounts.get(clientId) || {
      count: 0,
      resetTime: now + this.WINDOW_MS
    };

    // Check if rate limit exceeded
    if (clientData.count >= this.DEFAULT_LIMIT) {
      throw new BadRequestException('Rate limit exceeded. Try again later.');
    }

    // Increment counter
    clientData.count++;
    this.requestCounts.set(clientId, clientData);

    // Add rate limit headers to response
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', this.DEFAULT_LIMIT);
    response.setHeader('X-RateLimit-Remaining', this.DEFAULT_LIMIT - clientData.count);
    response.setHeader('X-RateLimit-Reset', new Date(clientData.resetTime).toISOString());

    return true;
  }

  private getClientId(request: Request): string {
    const ip = request.ip || request.socket.remoteAddress || 'unknown';
    const apiKey = request.headers['x-api-key'] as string;
    return `${ip}:${apiKey || 'anonymous'}`;
  }

  private cleanup(now: number): void {
    for (const [clientId, data] of this.requestCounts.entries()) {
      if (now > data.resetTime) {
        this.requestCounts.delete(clientId);
      }
    }
  }
}

// ========== Data Validation Guard ==========
@Injectable()
export class DataValidationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Validate request has proper content-type for POST/PUT requests
    const method = request.method;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const contentType = request.headers['content-type'];
      
      if (!contentType) {
        throw new BadRequestException('Content-Type header is required');
      }
      
      if (!contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
        throw new BadRequestException('Unsupported Content-Type. Use application/json or multipart/form-data');
      }
      
      // Basic body validation
      if (contentType.includes('application/json') && !request.body) {
        throw new BadRequestException('Request body is required for JSON requests');
      }
    }

    // Validate required query parameters for GET requests
    if (method === 'GET') {
      const requiredParams = this.getRequiredParams(request.path);
      for (const param of requiredParams) {
        if (!request.query[param]) {
          throw new BadRequestException(`Required query parameter missing: ${param}`);
        }
      }
    }

    return true;
  }

  private getRequiredParams(path: string): string[] {
    // Define required parameters based on path patterns
    if (path.includes('/sync')) {
      return []; // No required params for sync endpoints in this example
    }
    if (path.includes('/analytics')) {
      return []; // Could require 'timeRange' or other params
    }
    return [];
  }
}
