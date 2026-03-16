/**
 * API Response Utilities for Industry 5.0 ERP
 * Provides standardized API response structures
 */

export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  path?: string;
  statusCode: number;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
    version?: string;
  };
}

export class ApiResponse {
  /**
   * Create a successful response
   */
  static success<T>(
    data: T,
    message: string = 'Operation completed successfully',
    statusCode: number = 200,
    metadata?: IApiResponse['metadata']
  ): IApiResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      statusCode,
      metadata
    };
  }

  /**
   * Create an error response
   */
  static error(
    message: string,
    error?: string,
    statusCode: number = 500,
    path?: string
  ): IApiResponse {
    return {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
      statusCode,
      path
    };
  }

  /**
   * Create a validation error response
   */
  static validationError(
    errors: string[] | string,
    path?: string
  ): IApiResponse {
    const errorMessage = Array.isArray(errors) ? errors.join(', ') : errors;
    return this.error(
      'Validation failed',
      errorMessage,
      400,
      path
    );
  }

  /**
   * Create a not found response
   */
  static notFound(
    resource: string = 'Resource',
    path?: string
  ): IApiResponse {
    return this.error(
      `${resource} not found`,
      undefined,
      404,
      path
    );
  }

  /**
   * Create an unauthorized response
   */
  static unauthorized(
    message: string = 'Unauthorized access',
    path?: string
  ): IApiResponse {
    return this.error(
      message,
      'Authentication required',
      401,
      path
    );
  }

  /**
   * Create a forbidden response
   */
  static forbidden(
    message: string = 'Access forbidden',
    path?: string
  ): IApiResponse {
    return this.error(
      message,
      'Insufficient permissions',
      403,
      path
    );
  }

  /**
   * Create a paginated response
   */
  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Data retrieved successfully'
  ): IApiResponse<T[]> {
    const hasMore = (page * limit) < total;
    
    return this.success(
      data,
      message,
      200,
      {
        total,
        page,
        limit,
        hasMore,
        version: '1.0'
      }
    );
  }

  /**
   * Create a created response
   */
  static created<T>(
    data: T,
    message: string = 'Resource created successfully'
  ): IApiResponse<T> {
    return this.success(data, message, 201);
  }

  /**
   * Create a no content response
   */
  static noContent(
    message: string = 'Operation completed successfully'
  ): IApiResponse {
    return {
      success: true,
      message,
      timestamp: new Date().toISOString(),
      statusCode: 204
    };
  }

  /**
   * Create a bad request response
   */
  static badRequest(
    message: string = 'Bad request',
    error?: string,
    path?: string
  ): IApiResponse {
    return this.error(message, error, 400, path);
  }

  /**
   * Create a conflict response
   */
  static conflict(
    message: string = 'Resource conflict',
    error?: string,
    path?: string
  ): IApiResponse {
    return this.error(message, error, 409, path);
  }

  /**
   * Create a too many requests response
   */
  static tooManyRequests(
    message: string = 'Too many requests',
    path?: string
  ): IApiResponse {
    return this.error(message, 'Rate limit exceeded', 429, path);
  }

  /**
   * Create an internal server error response
   */
  static internalServerError(
    message: string = 'Internal server error',
    error?: string,
    path?: string
  ): IApiResponse {
    return this.error(message, error, 500, path);
  }
}
