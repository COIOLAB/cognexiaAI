/**
 * Finance Accounting Guard
 * 
 * WebSocket guard for finance and accounting operations with role-based
 * access control, session validation, and audit logging.
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export interface User {
  id: string;
  userId: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  entityId?: string;
  sessionId: string;
  lastActivity: Date;
}

export interface FinancePermissions {
  canViewFinancials: boolean;
  canCreateTransactions: boolean;
  canApprovePayments: boolean;
  canAccessReports: boolean;
  canManageAccounts: boolean;
  canViewAuditTrail: boolean;
}

@Injectable()
export class FinanceAccountingGuard implements CanActivate {
  private readonly logger = new Logger(FinanceAccountingGuard.name);

  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient<Socket>();
      const data = context.switchToWs().getData();

      // Extract user from socket handshake or data
      const user = await this.extractUser(client, data);
      
      if (!user) {
        throw new WsException('Authentication required');
      }

      // Validate user session
      const isValidSession = await this.validateSession(user);
      if (!isValidSession) {
        throw new WsException('Invalid or expired session');
      }

      // Check finance-specific permissions
      const hasPermission = await this.checkFinancePermissions(user, data);
      if (!hasPermission) {
        throw new WsException('Insufficient permissions for finance operations');
      }

      // Attach user to context for use in controllers
      client.data = { ...client.data, user };

      // Log access attempt
      this.logger.log(`Finance access granted: ${user.username} (${user.role})`);

      return true;
    } catch (error) {
      this.logger.error(`Finance access denied: ${error.message}`);
      if (error instanceof WsException) {
        throw error;
      }
      throw new WsException('Access denied');
    }
  }

  /**
   * Extract user from WebSocket client
   */
  private async extractUser(client: Socket, data: any): Promise<User | null> {
    try {
      // Try to get user from socket handshake auth
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization;
      
      if (token) {
        return this.validateTokenAndGetUser(token);
      }

      // Try to get user from data payload
      if (data?.userId) {
        return this.getUserById(data.userId);
      }

      // Try to get user from client data
      if (client.data?.user) {
        return client.data.user;
      }

      return null;
    } catch (error) {
      this.logger.error(`User extraction failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Validate JWT token and extract user
   */
  private async validateTokenAndGetUser(token: string): Promise<User | null> {
    try {
      // Remove 'Bearer ' prefix if present
      const cleanToken = token.replace(/^Bearer\s+/, '');

      // Mock JWT validation - replace with actual JWT service
      if (cleanToken === 'valid_token') {
        return {
          id: 'user_001',
          userId: 'user_001',
          username: 'finance_user',
          email: 'finance@company.com',
          role: 'finance_manager',
          permissions: [
            'view_financials',
            'create_transactions',
            'approve_payments',
            'access_reports',
            'manage_accounts',
            'view_audit_trail',
          ],
          entityId: 'entity_001',
          sessionId: 'session_001',
          lastActivity: new Date(),
        };
      }

      return null;
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  private async getUserById(userId: string): Promise<User | null> {
    try {
      // Mock user lookup - replace with actual user service
      return {
        id: userId,
        userId,
        username: `user_${userId}`,
        email: `user${userId}@company.com`,
        role: 'finance_user',
        permissions: ['view_financials', 'create_transactions'],
        sessionId: `session_${userId}`,
        lastActivity: new Date(),
      };
    } catch (error) {
      this.logger.error(`User lookup failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Validate user session
   */
  private async validateSession(user: User): Promise<boolean> {
    try {
      // Check session expiration
      const sessionTimeout = 3600000; // 1 hour in milliseconds
      const timeSinceLastActivity = Date.now() - user.lastActivity.getTime();

      if (timeSinceLastActivity > sessionTimeout) {
        this.logger.warn(`Session expired for user: ${user.username}`);
        return false;
      }

      // Update last activity
      user.lastActivity = new Date();

      return true;
    } catch (error) {
      this.logger.error(`Session validation failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Check finance-specific permissions
   */
  private async checkFinancePermissions(user: User, data: any): Promise<boolean> {
    try {
      const permissions = this.getFinancePermissions(user);

      // Basic finance access check
      if (!permissions.canViewFinancials) {
        return false;
      }

      // Check operation-specific permissions
      const operation = data?.operation || 'view';

      switch (operation) {
        case 'create_transaction':
        case 'create_journal_entry':
        case 'create_invoice':
          return permissions.canCreateTransactions;

        case 'approve_payment':
        case 'process_payment':
          return permissions.canApprovePayments;

        case 'generate_report':
        case 'view_analytics':
          return permissions.canAccessReports;

        case 'manage_chart_of_accounts':
        case 'configure_accounting':
          return permissions.canManageAccounts;

        case 'view_audit':
        case 'compliance_check':
          return permissions.canViewAuditTrail;

        default:
          return permissions.canViewFinancials;
      }
    } catch (error) {
      this.logger.error(`Permission check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get finance permissions for user
   */
  private getFinancePermissions(user: User): FinancePermissions {
    const basePermissions: FinancePermissions = {
      canViewFinancials: false,
      canCreateTransactions: false,
      canApprovePayments: false,
      canAccessReports: false,
      canManageAccounts: false,
      canViewAuditTrail: false,
    };

    // Role-based permission mapping
    switch (user.role) {
      case 'finance_admin':
      case 'cfo':
        return {
          canViewFinancials: true,
          canCreateTransactions: true,
          canApprovePayments: true,
          canAccessReports: true,
          canManageAccounts: true,
          canViewAuditTrail: true,
        };

      case 'finance_manager':
        return {
          canViewFinancials: true,
          canCreateTransactions: true,
          canApprovePayments: true,
          canAccessReports: true,
          canManageAccounts: false,
          canViewAuditTrail: true,
        };

      case 'accountant':
      case 'finance_user':
        return {
          canViewFinancials: true,
          canCreateTransactions: true,
          canApprovePayments: false,
          canAccessReports: true,
          canManageAccounts: false,
          canViewAuditTrail: false,
        };

      case 'accounts_payable':
        return {
          canViewFinancials: true,
          canCreateTransactions: true,
          canApprovePayments: false,
          canAccessReports: false,
          canManageAccounts: false,
          canViewAuditTrail: false,
        };

      case 'accounts_receivable':
        return {
          canViewFinancials: true,
          canCreateTransactions: true,
          canApprovePayments: false,
          canAccessReports: false,
          canManageAccounts: false,
          canViewAuditTrail: false,
        };

      default:
        // Check individual permissions
        if (user.permissions) {
          return {
            canViewFinancials: user.permissions.includes('view_financials'),
            canCreateTransactions: user.permissions.includes('create_transactions'),
            canApprovePayments: user.permissions.includes('approve_payments'),
            canAccessReports: user.permissions.includes('access_reports'),
            canManageAccounts: user.permissions.includes('manage_accounts'),
            canViewAuditTrail: user.permissions.includes('view_audit_trail'),
          };
        }
        return basePermissions;
    }
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(user: User, permission: string): boolean {
    const permissions = this.getFinancePermissions(user);
    return permissions[permission as keyof FinancePermissions] || false;
  }

  /**
   * Get user from WebSocket client
   */
  static getUserFromClient(client: Socket): User | null {
    return client.data?.user || null;
  }
}
