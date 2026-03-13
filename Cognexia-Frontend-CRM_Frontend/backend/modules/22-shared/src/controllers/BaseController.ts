import { Response } from 'express';

export class BaseController {
  protected sendSuccess<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200
  ): void {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  protected sendError(
    res: Response,
    error: Error,
    statusCode: number = 500
  ): void {
    res.status(statusCode).json({
      success: false,
      message: error.message || 'An unexpected error occurred',
      error: {
        name: error.name,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
      },
    });
  }
}

