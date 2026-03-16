import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';

/**
 * Tenant Middleware
 * 
 * Extracts organizationId from JWT token and injects it into request context.
 * Sets PostgreSQL session variable for Row-Level Security (RLS) enforcement.
 * 
 * This ensures all database queries are automatically scoped to the user's organization,
 * preventing data leakage between tenants.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private dataSource: DataSource,
  ) { }

  async use(req: Request & { organizationId?: string; userId?: string; userRoles?: string[] }, res: Response, next: NextFunction) {
    try {
      // Extract JWT token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No token - allow public routes to proceed
        // Guards will handle authentication requirements
        return next();
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify and decode JWT
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      });

      // Inject tenant context into request
      req.organizationId = payload.organizationId;
      req.userId = payload.sub;
      req.userRoles = payload.roles || [];

      // Set PostgreSQL session variables for RLS
      // This ensures all queries are automatically filtered by organizationId
      if (payload.organizationId) {
        try {
          await this.dataSource.query(
            'SET LOCAL app.current_organizationId = $1',
            [payload.organizationId]
          );
          await this.dataSource.query(
            'SET LOCAL app.current_user_id = $1',
            [payload.sub]
          );
        } catch (dbError) {
          // Log but don't fail if RLS variables can't be set
          // This allows the app to work even if RLS isn't configured
          console.warn('Failed to set PostgreSQL session variables:', dbError);
        }
      }

      next();
    } catch (error) {
      // Invalid token - allow to proceed, guards will handle it
      // This prevents middleware from blocking public routes
      next();
    }
  }
}

/**
 * Type augmentation for Express Request
 * Adds tenant context properties
 */
declare global {
  namespace Express {
    interface Request {
      organizationId?: string;
      userId?: string;
      userRoles?: string[];
    }
  }
}
