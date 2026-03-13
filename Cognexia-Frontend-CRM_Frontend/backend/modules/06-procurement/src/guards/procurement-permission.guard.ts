import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ProcurementUser } from '../strategies/jwt.strategy';

export interface OrderValueCheck {
  maxValue?: number;
  requireApproval?: boolean;
  approvalLevel?: number;
}

export interface CategoryCheck {
  restrictedCategories?: string[];
  allowedCategories?: string[];
}

export interface SupplierCheck {
  restrictedSuppliers?: string[];
  allowedSuppliers?: string[];
}

@Injectable()
export class ProcurementPermissionGuard implements CanActivate {
  private readonly logger = new Logger(ProcurementPermissionGuard.name);

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as ProcurementUser;

    if (!user) {
      this.logger.warn('No user found in request for procurement permission check');
      throw new ForbiddenException('Authentication required');
    }

    // Get procurement-specific checks from metadata
    const orderValueCheck = this.reflector.get<OrderValueCheck>(
      'orderValueCheck',
      context.getHandler(),
    );
    const categoryCheck = this.reflector.get<CategoryCheck>(
      'categoryCheck',
      context.getHandler(),
    );
    const supplierCheck = this.reflector.get<SupplierCheck>(
      'supplierCheck',
      context.getHandler(),
    );

    const endpoint = `${request.method} ${request.url}`;

    try {
      // Check order value restrictions
      if (orderValueCheck) {
        await this.validateOrderValue(request, user, orderValueCheck);
      }

      // Check category restrictions
      if (categoryCheck) {
        await this.validateCategories(request, user, categoryCheck);
      }

      // Check supplier restrictions
      if (supplierCheck) {
        await this.validateSuppliers(request, user, supplierCheck);
      }

      // Additional procurement-specific validations
      await this.validateDepartmentRestrictions(request, user);
      await this.validateTimeRestrictions(request, user);
      await this.validateBudgetLimits(request, user);

      this.logger.log(
        `Procurement permissions validated for user ${user.email} on ${endpoint}`
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Procurement permission denied for user ${user.email} on ${endpoint}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  private async validateOrderValue(
    request: Request,
    user: ProcurementUser,
    check: OrderValueCheck
  ): Promise<void> {
    const body = request.body;
    let orderValue = 0;

    // Extract order value from various request formats
    if (body.totalValue) {
      orderValue = body.totalValue;
    } else if (body.grandTotal) {
      orderValue = body.grandTotal;
    } else if (body.items && Array.isArray(body.items)) {
      orderValue = body.items.reduce((total: number, item: any) => {
        const itemTotal = (item.quantity || 1) * (item.unitPrice || 0);
        return total + itemTotal;
      }, 0);
    } else if (body.amount) {
      orderValue = body.amount;
    }

    // Check against user's maximum order value
    if (orderValue > user.procurementAccess.maxOrderValue) {
      throw new ForbiddenException(
        `Order value $${orderValue.toLocaleString()} exceeds your limit of $${user.procurementAccess.maxOrderValue.toLocaleString()}`
      );
    }

    // Check specific value limits from metadata
    if (check.maxValue && orderValue > check.maxValue) {
      throw new ForbiddenException(
        `Order value $${orderValue.toLocaleString()} exceeds endpoint limit of $${check.maxValue.toLocaleString()}`
      );
    }

    // Check if approval is required and user has sufficient approval level
    if (check.requireApproval && check.approvalLevel) {
      if (user.procurementAccess.approvalLevel < check.approvalLevel) {
        throw new ForbiddenException(
          `This order requires approval level ${check.approvalLevel}, but you have level ${user.procurementAccess.approvalLevel}`
        );
      }
    }

    // Log high-value transactions
    if (orderValue > 50000) {
      this.logger.warn(
        `High-value transaction: $${orderValue.toLocaleString()} by user ${user.email}`
      );
    }
  }

  private async validateCategories(
    request: Request,
    user: ProcurementUser,
    check: CategoryCheck
  ): Promise<void> {
    const body = request.body;
    const categories: string[] = [];

    // Extract categories from various request formats
    if (body.categories && Array.isArray(body.categories)) {
      categories.push(...body.categories);
    } else if (body.category) {
      categories.push(body.category);
    } else if (body.items && Array.isArray(body.items)) {
      body.items.forEach((item: any) => {
        if (item.category) {
          categories.push(item.category);
        }
      });
    }

    // Check user's restricted categories
    const restrictedByUser = categories.some(category =>
      user.procurementAccess.restrictedCategories.includes(category)
    );

    if (restrictedByUser) {
      const restricted = categories.filter(category =>
        user.procurementAccess.restrictedCategories.includes(category)
      );
      throw new ForbiddenException(
        `You do not have access to categories: ${restricted.join(', ')}`
      );
    }

    // Check endpoint-specific category restrictions
    if (check.restrictedCategories) {
      const restrictedByEndpoint = categories.some(category =>
        check.restrictedCategories!.includes(category)
      );

      if (restrictedByEndpoint) {
        const restricted = categories.filter(category =>
          check.restrictedCategories!.includes(category)
        );
        throw new ForbiddenException(
          `This endpoint does not allow categories: ${restricted.join(', ')}`
        );
      }
    }

    // Check allowed categories (if specified, only these are allowed)
    if (check.allowedCategories && check.allowedCategories.length > 0) {
      const notAllowed = categories.filter(category =>
        !check.allowedCategories!.includes(category)
      );

      if (notAllowed.length > 0) {
        throw new ForbiddenException(
          `This endpoint only allows categories: ${check.allowedCategories.join(', ')}`
        );
      }
    }
  }

  private async validateSuppliers(
    request: Request,
    user: ProcurementUser,
    check: SupplierCheck
  ): Promise<void> {
    const body = request.body;
    const suppliers: string[] = [];

    // Extract supplier IDs from various request formats
    if (body.supplierId) {
      suppliers.push(body.supplierId);
    } else if (body.supplierIds && Array.isArray(body.supplierIds)) {
      suppliers.push(...body.supplierIds);
    } else if (body.preferredSupplierId) {
      suppliers.push(body.preferredSupplierId);
    }

    // Check user's allowed suppliers (if any restrictions exist)
    if (user.procurementAccess.allowedSuppliers.length > 0) {
      const notAllowedByUser = suppliers.filter(supplierId =>
        !user.procurementAccess.allowedSuppliers.includes(supplierId)
      );

      if (notAllowedByUser.length > 0) {
        throw new ForbiddenException(
          `You do not have access to suppliers: ${notAllowedByUser.join(', ')}`
        );
      }
    }

    // Check endpoint-specific supplier restrictions
    if (check.restrictedSuppliers) {
      const restrictedByEndpoint = suppliers.some(supplierId =>
        check.restrictedSuppliers!.includes(supplierId)
      );

      if (restrictedByEndpoint) {
        const restricted = suppliers.filter(supplierId =>
          check.restrictedSuppliers!.includes(supplierId)
        );
        throw new ForbiddenException(
          `This endpoint does not allow suppliers: ${restricted.join(', ')}`
        );
      }
    }

    // Check allowed suppliers (if specified, only these are allowed)
    if (check.allowedSuppliers && check.allowedSuppliers.length > 0) {
      const notAllowed = suppliers.filter(supplierId =>
        !check.allowedSuppliers!.includes(supplierId)
      );

      if (notAllowed.length > 0) {
        throw new ForbiddenException(
          `This endpoint only allows specific suppliers`
        );
      }
    }
  }

  private async validateDepartmentRestrictions(
    request: Request,
    user: ProcurementUser
  ): Promise<void> {
    const body = request.body;
    
    // If a department is specified in the request, validate access
    if (body.department && body.department !== user.department) {
      // Allow admins to work across departments
      if (!user.roles.includes('admin') && !user.roles.includes('procurement_admin')) {
        throw new ForbiddenException(
          `You can only create orders for your department: ${user.department}`
        );
      }
    }
  }

  private async validateTimeRestrictions(
    request: Request,
    user: ProcurementUser
  ): Promise<void> {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Example: Restrict high-value orders outside business hours for non-admins
    const body = request.body;
    const isHighValue = this.isHighValueTransaction(body);
    const isBusinessHours = hour >= 8 && hour <= 18; // 8 AM to 6 PM
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday

    if (isHighValue && (!isBusinessHours || !isWeekday)) {
      if (!user.roles.includes('admin') && !user.roles.includes('procurement_admin')) {
        throw new ForbiddenException(
          'High-value transactions are only allowed during business hours (8 AM - 6 PM, Monday - Friday)'
        );
      }
    }
  }

  private async validateBudgetLimits(
    request: Request,
    user: ProcurementUser
  ): Promise<void> {
    const body = request.body;
    
    // Check if user has budget limit specified in request
    if (body.budgetLimit) {
      const orderValue = this.extractOrderValue(body);
      
      if (orderValue > body.budgetLimit) {
        throw new BadRequestException(
          `Order value $${orderValue.toLocaleString()} exceeds specified budget limit of $${body.budgetLimit.toLocaleString()}`
        );
      }
    }
  }

  private isHighValueTransaction(body: any): boolean {
    const orderValue = this.extractOrderValue(body);
    return orderValue > 25000; // $25k threshold for high-value
  }

  private extractOrderValue(body: any): number {
    if (body.totalValue) return body.totalValue;
    if (body.grandTotal) return body.grandTotal;
    if (body.amount) return body.amount;
    
    if (body.items && Array.isArray(body.items)) {
      return body.items.reduce((total: number, item: any) => {
        const itemTotal = (item.quantity || 1) * (item.unitPrice || 0);
        return total + itemTotal;
      }, 0);
    }
    
    return 0;
  }
}

// Decorators for procurement-specific checks
export const CheckOrderValue = (options: OrderValueCheck) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('orderValueCheck', options, descriptor.value);
    return descriptor;
  };
};

export const CheckCategories = (options: CategoryCheck) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('categoryCheck', options, descriptor.value);
    return descriptor;
  };
};

export const CheckSuppliers = (options: SupplierCheck) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('supplierCheck', options, descriptor.value);
    return descriptor;
  };
};

// Common restriction combinations
export const RestrictHighValue = (maxValue: number = 100000) => 
  CheckOrderValue({ maxValue, requireApproval: true, approvalLevel: 4 });

export const RestrictITCategories = () =>
  CheckCategories({ restrictedCategories: ['IT', 'Software', 'Hardware'] });

export const RequireManagerApproval = () =>
  CheckOrderValue({ requireApproval: true, approvalLevel: 3 });
