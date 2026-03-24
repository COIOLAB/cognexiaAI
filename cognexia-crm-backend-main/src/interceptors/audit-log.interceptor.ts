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
    const { method, url, user, ip, headers, body } = request;
    const handler = context.getHandler();

    // Extract metadata from decorator if present
    const decoratorEntityType = Reflect.getMetadata('audit:entityType', handler) || 
                                Reflect.getMetadata('audit:entityType', context.getClass());
    const decoratorAction = Reflect.getMetadata('audit:action', handler);

    // Default action map
    const actionMap = {
      POST: AuditAction.CREATE,
      GET: AuditAction.READ,
      PUT: AuditAction.UPDATE,
      PATCH: AuditAction.UPDATE,
      DELETE: AuditAction.DELETE,
    };

    const action = decoratorAction || actionMap[method] || AuditAction.READ;

    // Extract entity info from URL or decorator
    const urlParts = url.split('/').filter(Boolean);
    const entityType = decoratorEntityType || urlParts[0] || 'unknown';

    return next.handle().pipe(
      tap(async (data) => {
        // Only log if user is authenticated and not a READ action (unless explicitly requested)
        const isRead = action === AuditAction.READ;
        if (user && user.id && user.organizationId && (!isRead || decoratorAction)) {
          try {
            // Extract entity ID from response or request
            const entityId = data?.id || request.params?.id || request.query?.id || 'N/A';

            // Sanitize body (remove sensitive fields)
            const sanitizedBody = { ...body };
            ['password', 'token', 'secret', 'currentPassword', 'newPassword'].forEach(key => delete sanitizedBody[key]);

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
                body: Object.keys(sanitizedBody).length ? sanitizedBody : undefined,
              },
              ip,
              headers['user-agent'],
            );
          } catch (error) {
            console.error('Audit log error:', error);
          }
        }
      }),
    );
  }

}

/**
 * Decorator to mark methods or classes for audit logging
 */
export function AuditLog(entity_type: string, action?: AuditAction) {
  return function (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) {
    if (propertyKey) {
      // Method decorator
      Reflect.defineMetadata('audit:entityType', entity_type, target, propertyKey);
      if (action) Reflect.defineMetadata('audit:action', action, target, propertyKey);
      return descriptor;
    } else {
      // Class decorator
      Reflect.defineMetadata('audit:entityType', entity_type, target);
      if (action) Reflect.defineMetadata('audit:action', action, target);
      return target;
    }
  };
}

