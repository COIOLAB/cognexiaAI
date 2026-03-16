// Industry 5.0 ERP Backend - HR Auth Middleware
// Authentication and authorization middleware for HR module
// Author: AI Assistant
// Date: 2024

import { Request, Response, NextFunction } from 'express';
import { UUID } from 'crypto';
import { HRError, HRErrorCodes, formatErrorResponse } from '../utils/error.util';
import { logger } from '../../../utils/logger';

// Extend Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: UUID;
        organizationId: UUID;
        role: string;
        permissions: string[];
        isActive: boolean;
      };
    }
  }
}

/**
 * Middleware to authenticate HR requests
 * Assumes JWT token is already validated by core auth middleware
 */
export function authenticateHRRequest(req: Request, res: Response, next: NextFunction): void {
  try {
    // Check if user information is available from core auth middleware
    if (!req.user) {
      const error = new HRError(HRErrorCodes.UNAUTHORIZED_ACCESS, 'Authentication required', 401);
      res.status(error.statusCode).json(formatErrorResponse(error));
      return;
    }

    // Check if user is active
    if (!req.user.isActive) {
      const error = new HRError(HRErrorCodes.UNAUTHORIZED_ACCESS, 'User account is inactive', 401);
      res.status(error.statusCode).json(formatErrorResponse(error));
      return;
    }

    // Check if user has access to HR module
    if (!hasHRAccess(req.user.permissions)) {
      const error = new HRError(HRErrorCodes.INSUFFICIENT_PERMISSIONS, 'Insufficient permissions for HR module', 403);
      res.status(error.statusCode).json(formatErrorResponse(error));
      return;
    }

    next();
  } catch (error) {
    logger.error('Error in HR authentication middleware:', error);
    const hrError = new HRError(HRErrorCodes.UNAUTHORIZED_ACCESS, 'Authentication failed', 401);
    res.status(hrError.statusCode).json(formatErrorResponse(hrError));
  }
}

/**
 * Middleware to check specific HR permissions
 */
export function requireHRPermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        const error = new HRError(HRErrorCodes.UNAUTHORIZED_ACCESS, 'Authentication required', 401);
        res.status(error.statusCode).json(formatErrorResponse(error));
        return;
      }

      if (!req.user.permissions.includes(permission)) {
        logger.warn(`User ${req.user.id} attempted to access ${permission} without permission`, {
          userId: req.user.id,
          requiredPermission: permission,
          userPermissions: req.user.permissions
        });

        const error = new HRError(
          HRErrorCodes.INSUFFICIENT_PERMISSIONS, 
          `Permission required: ${permission}`, 
          403,
          { requiredPermission: permission }
        );
        res.status(error.statusCode).json(formatErrorResponse(error));
        return;
      }

      next();
    } catch (error) {
      logger.error('Error checking HR permission:', error);
      const hrError = new HRError(HRErrorCodes.INSUFFICIENT_PERMISSIONS, 'Permission check failed', 403);
      res.status(hrError.statusCode).json(formatErrorResponse(hrError));
    }
  };
}

/**
 * Middleware to check if user is an HR manager
 */
export function requireHRManager(req: Request, res: Response, next: NextFunction): void {
  try {
    if (!req.user) {
      const error = new HRError(HRErrorCodes.UNAUTHORIZED_ACCESS, 'Authentication required', 401);
      res.status(error.statusCode).json(formatErrorResponse(error));
      return;
    }

    const hrManagerPermissions = ['hr.manage', 'hr.admin', 'admin'];
    const hasManagerAccess = hrManagerPermissions.some(permission => 
      req.user!.permissions.includes(permission)
    );

    if (!hasManagerAccess) {
      const error = new HRError(HRErrorCodes.INSUFFICIENT_PERMISSIONS, 'HR manager permissions required', 403);
      res.status(error.statusCode).json(formatErrorResponse(error));
      return;
    }

    next();
  } catch (error) {
    logger.error('Error checking HR manager permission:', error);
    const hrError = new HRError(HRErrorCodes.INSUFFICIENT_PERMISSIONS, 'Permission check failed', 403);
    res.status(hrError.statusCode).json(formatErrorResponse(hrError));
  }
}

/**
 * Middleware to check if user can access employee data
 */
export function requireEmployeeAccess(req: Request, res: Response, next: NextFunction): void {
  try {
    if (!req.user) {
      const error = new HRError(HRErrorCodes.UNAUTHORIZED_ACCESS, 'Authentication required', 401);
      res.status(error.statusCode).json(formatErrorResponse(error));
      return;
    }

    // Check if user has employee read permissions
    const employeePermissions = ['hr.employee.read', 'hr.employee.write', 'hr.manage', 'hr.admin'];
    const hasEmployeeAccess = employeePermissions.some(permission => 
      req.user!.permissions.includes(permission)
    );

    if (!hasEmployeeAccess) {
      const error = new HRError(HRErrorCodes.INSUFFICIENT_PERMISSIONS, 'Employee access permissions required', 403);
      res.status(error.statusCode).json(formatErrorResponse(error));
      return;
    }

    next();
  } catch (error) {
    logger.error('Error checking employee access permission:', error);
    const hrError = new HRError(HRErrorCodes.INSUFFICIENT_PERMISSIONS, 'Permission check failed', 403);
    res.status(hrError.statusCode).json(formatErrorResponse(hrError));
  }
}

/**
 * Middleware to check if user can modify employee data
 */
export function requireEmployeeWrite(req: Request, res: Response, next: NextFunction): void {
  try {
    if (!req.user) {
      const error = new HRError(HRErrorCodes.UNAUTHORIZED_ACCESS, 'Authentication required', 401);
      res.status(error.statusCode).json(formatErrorResponse(error));
      return;
    }

    const writePermissions = ['hr.employee.write', 'hr.manage', 'hr.admin'];
    const hasWriteAccess = writePermissions.some(permission => 
      req.user!.permissions.includes(permission)
    );

    if (!hasWriteAccess) {
      const error = new HRError(HRErrorCodes.INSUFFICIENT_PERMISSIONS, 'Employee write permissions required', 403);
      res.status(error.statusCode).json(formatErrorResponse(error));
      return;
    }

    next();
  } catch (error) {
    logger.error('Error checking employee write permission:', error);
    const hrError = new HRError(HRErrorCodes.INSUFFICIENT_PERMISSIONS, 'Permission check failed', 403);
    res.status(hrError.statusCode).json(formatErrorResponse(hrError));
  }
}

/**
 * Middleware for self-service access (employees accessing their own data)
 */
export function allowSelfServiceAccess(req: Request, res: Response, next: NextFunction): void {
  try {
    if (!req.user) {
      const error = new HRError(HRErrorCodes.UNAUTHORIZED_ACCESS, 'Authentication required', 401);
      res.status(error.statusCode).json(formatErrorResponse(error));
      return;
    }

    const employeeId = req.params.id as UUID;
    const isOwnProfile = req.user.id === employeeId;
    
    // Allow if it's the user's own profile or they have HR permissions
    const hrPermissions = ['hr.employee.read', 'hr.employee.write', 'hr.manage', 'hr.admin'];
    const hasHRPermission = hrPermissions.some(permission => 
      req.user!.permissions.includes(permission)
    );

    if (!isOwnProfile && !hasHRPermission) {
      const error = new HRError(
        HRErrorCodes.INSUFFICIENT_PERMISSIONS, 
        'Can only access own profile or need HR permissions', 
        403
      );
      res.status(error.statusCode).json(formatErrorResponse(error));
      return;
    }

    // Add flag to indicate if this is self-service access
    (req as any).isSelfService = isOwnProfile;

    next();
  } catch (error) {
    logger.error('Error checking self-service access:', error);
    const hrError = new HRError(HRErrorCodes.INSUFFICIENT_PERMISSIONS, 'Permission check failed', 403);
    res.status(hrError.statusCode).json(formatErrorResponse(hrError));
  }
}

/**
 * Middleware to validate organization context
 */
export function validateOrganizationContext(req: Request, res: Response, next: NextFunction): void {
  try {
    if (!req.user?.organizationId) {
      const error = new HRError(HRErrorCodes.UNAUTHORIZED_ACCESS, 'Organization context required', 401);
      res.status(error.statusCode).json(formatErrorResponse(error));
      return;
    }

    // Add organization context to request for use in controllers
    (req as any).organizationContext = {
      id: req.user.organizationId,
      userId: req.user.id,
      userRole: req.user.role
    };

    next();
  } catch (error) {
    logger.error('Error validating organization context:', error);
    const hrError = new HRError(HRErrorCodes.UNAUTHORIZED_ACCESS, 'Organization validation failed', 401);
    res.status(hrError.statusCode).json(formatErrorResponse(hrError));
  }
}

/**
 * Rate limiting middleware for HR endpoints
 */
export function hrRateLimit(maxRequests: number = 100, windowMinutes: number = 15) {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        next();
        return;
      }

      const key = `${req.user.organizationId}:${req.user.id}`;
      const now = Date.now();
      const windowMs = windowMinutes * 60 * 1000;

      let userRequests = requestCounts.get(key);

      if (!userRequests || now > userRequests.resetTime) {
        userRequests = { count: 0, resetTime: now + windowMs };
        requestCounts.set(key, userRequests);
      }

      userRequests.count++;

      if (userRequests.count > maxRequests) {
        logger.warn(`Rate limit exceeded for user ${req.user.id}`, {
          userId: req.user.id,
          organizationId: req.user.organizationId,
          requestCount: userRequests.count,
          maxRequests,
          windowMinutes
        });

        const error = new HRError(
          HRErrorCodes.RATE_LIMIT_EXCEEDED, 
          'Rate limit exceeded. Please try again later.', 
          429,
          { 
            maxRequests, 
            windowMinutes,
            retryAfter: Math.ceil((userRequests.resetTime - now) / 1000)
          }
        );
        res.status(error.statusCode).json(formatErrorResponse(error));
        return;
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': (maxRequests - userRequests.count).toString(),
        'X-RateLimit-Reset': userRequests.resetTime.toString()
      });

      next();
    } catch (error) {
      logger.error('Error in rate limiting middleware:', error);
      next(); // Continue on error, don't block requests
    }
  };
}

/**
 * Helper function to check if user has HR access
 */
function hasHRAccess(permissions: string[]): boolean {
  const hrPermissions = [
    'hr.read', 'hr.write', 'hr.manage', 'hr.admin',
    'hr.employee.read', 'hr.employee.write',
    'hr.recruitment.read', 'hr.recruitment.write',
    'hr.performance.read', 'hr.performance.write',
    'hr.payroll.read', 'hr.payroll.write',
    'admin', 'super_admin'
  ];

  return hrPermissions.some(permission => permissions.includes(permission));
}

/**
 * Helper function to get user's HR role level
 */
export function getUserHRRoleLevel(permissions: string[]): 'none' | 'employee' | 'hr_user' | 'hr_manager' | 'hr_admin' {
  if (permissions.includes('hr.admin') || permissions.includes('admin') || permissions.includes('super_admin')) {
    return 'hr_admin';
  }
  if (permissions.includes('hr.manage')) {
    return 'hr_manager';
  }
  if (permissions.some(p => p.startsWith('hr.'))) {
    return 'hr_user';
  }
  if (permissions.includes('employee')) {
    return 'employee';
  }
  return 'none';
}
