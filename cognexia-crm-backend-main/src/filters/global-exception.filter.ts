import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.OK; // Always return 200
    let message = 'An error occurred';
    let error = 'Internal server error';

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      status = HttpStatus.OK; // Force 200
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || message;
      error = (exceptionResponse as any).error || exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    this.logger.error(
      `${request.method} ${request.url} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Always return 200 with success: false for errors
    response.status(HttpStatus.OK).json({
      success: false,
      data: null,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
