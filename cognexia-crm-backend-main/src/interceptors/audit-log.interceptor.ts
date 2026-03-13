import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from '../services/audit-log.service';
import { AuditAction } from '../entities/audit-log.entity';

/**
 * Interceptor to automatically log actions
 * Usage: @UseInterceptors(AuditLogInterceptor)
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;

    // Extract action from HTTP method
    const actionMap = {
      POST: AuditAction.CREATE,
      GET: AuditAction.READ,
      PUT: AuditAction.UPDATE,
      PATCH: AuditAction.UPDATE,
      DELETE: AuditAction.DELETE,
    };

    const action = actionMap[method] || AuditAction.READ;

    // Extract entity info from URL
    const urlParts = url.split('/').filter(Boolean);
    const entityType = urlParts[0] || 'unknown';

    return next.handle().pipe(
      tap(async (data) => {
        // Only log if user is authenticated
        if (user && user.id && user.organizationId) {
          try {
            // Extract entity ID from response or request
            const entityId = data?.id || request.params?.id || request.query?.id || 'N/A';

            await this.auditLogService.log(
              user.organizationId,
              user.id,
              action,
              entityType,
              entityId,
              `${method} ${url}`,
              {
                method,
                url,
                statusCode: 200,
              },
              ip,
              headers['user-agent'],
            );
          } catch (error) {
            // Log errors but don't fail the request
            console.error('Audit log error:', error);
          }
        }
      }),
    );
  }
}

/**
 * Decorator to mark methods for audit logging
 */
export function AuditLog(entity_type: string, action: AuditAction) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // Store metadata for the interceptor
    Reflect.defineMetadata('audit:entityType', entity_type, target, propertyKey);
    Reflect.defineMetadata('audit:action', action, target, propertyKey);
    return descriptor;
  };
}
