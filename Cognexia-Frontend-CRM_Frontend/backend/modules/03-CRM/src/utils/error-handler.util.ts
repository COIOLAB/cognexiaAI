import {
  HttpException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { logError } from './logger.util';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path?: string;
  details?: any;
}

/**
 * Create error response object
 */
export function createErrorResponse(
  statusCode: number,
  message: string,
  error: string,
  path?: string,
  details?: any,
): ErrorResponse {
  return {
    statusCode,
    message,
    error,
    timestamp: new Date().toISOString(),
    path,
    details,
  };
}

/**
 * Handle and throw appropriate HTTP exception
 */
export function handleError(error: any, context?: string): never {
  logError(error.message || 'Unknown error', error.stack, context);

  if (error instanceof HttpException) {
    throw error;
  }

  // Database errors
  if (error.code === '23505') {
    throw new ConflictException('Resource already exists');
  }

  if (error.code === '23503') {
    throw new BadRequestException('Referenced resource not found');
  }

  // Default to internal server error
  throw new InternalServerErrorException('Internal server error');
}

/**
 * Throw bad request exception
 */
export function throwBadRequest(message: string = 'Bad request'): never {
  throw new BadRequestException(message);
}

/**
 * Throw unauthorized exception
 */
export function throwUnauthorized(message: string = 'Unauthorized'): never {
  throw new UnauthorizedException(message);
}

/**
 * Throw forbidden exception
 */
export function throwForbidden(message: string = 'Forbidden'): never {
  throw new ForbiddenException(message);
}

/**
 * Throw not found exception
 */
export function throwNotFound(resource: string = 'Resource'): never {
  throw new NotFoundException(`${resource} not found`);
}

/**
 * Throw conflict exception
 */
export function throwConflict(message: string = 'Resource already exists'): never {
  throw new ConflictException(message);
}

/**
 * Throw internal server error
 */
export function throwInternalError(message: string = 'Internal server error'): never {
  throw new InternalServerErrorException(message);
}

/**
 * Validate resource existence
 */
export function assertExists<T>(resource: T | null | undefined, resourceName: string = 'Resource'): asserts resource is T {
  if (!resource) {
    throwNotFound(resourceName);
  }
}

/**
 * Validate authorization
 */
export function assertAuthorized(condition: boolean, message: string = 'Forbidden'): void {
  if (!condition) {
    throwForbidden(message);
  }
}

/**
 * Validate input
 */
export function assertValid(condition: boolean, message: string = 'Invalid input'): void {
  if (!condition) {
    throwBadRequest(message);
  }
}

/**
 * Format validation errors
 */
export function formatValidationError(errors: any[]): string {
  return errors.map((err) => Object.values(err.constraints || {}).join(', ')).join('; ');
}

/**
 * Safely execute async operation with error handling
 */
export async function safeExecute<T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Operation failed',
  context?: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logError(`${errorMessage}: ${error.message}`, error.stack, context);
    handleError(error, context);
  }
}
