import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UsageTrackingService } from '../services/usage-tracking.service';

/**
 * Usage Tracking Interceptor
 * Automatically tracks API calls for monitoring and quota enforcement
 */
@Injectable()
export class UsageTrackingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(UsageTrackingInterceptor.name);

  constructor(private readonly usageTrackingService: UsageTrackingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const startTime = Date.now();
    const method = request.method;
    const endpoint = request.url;
    
    // Extract user and organization from request
    const user = request.user;
    const organizationId = user?.organizationId || request.headers['x-organization-id'];
    const userId = user?.id || user?.sub;

    return next.handle().pipe(
      tap({
        next: () => {
          // Track successful API call
          if (organizationId && userId) {
            const responseTime = Date.now() - startTime;
            const statusCode = response.statusCode;

            // Fire and forget - don't wait for tracking to complete
            this.usageTrackingService
              .trackApiCall(
                organizationId,
                userId,
                endpoint,
                method,
                responseTime,
                statusCode,
              )
              .catch(error => {
                this.logger.error('Failed to track API call', error);
              });
          }
        },
        error: (error) => {
          // Track failed API call
          if (organizationId && userId) {
            const responseTime = Date.now() - startTime;
            const statusCode = error.status || 500;

            this.usageTrackingService
              .trackApiCall(
                organizationId,
                userId,
                endpoint,
                method,
                responseTime,
                statusCode,
              )
              .catch(err => {
                this.logger.error('Failed to track failed API call', err);
              });
          }
        },
      }),
    );
  }
}
