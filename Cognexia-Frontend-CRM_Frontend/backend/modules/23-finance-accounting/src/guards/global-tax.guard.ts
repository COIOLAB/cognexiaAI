/**
 * Global Tax Guard
 * 
 * WebSocket guard specifically for global tax operations with jurisdiction-based
 * access control, tax compliance validation, and regulatory audit requirements.
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export interface TaxUser {
  id: string;
  userId: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  taxJurisdictions: string[];
  certifications: string[];
  entityId?: string;
  sessionId: string;
  lastActivity: Date;
}

export interface TaxPermissions {
  canCalculateTax: boolean;
  canViewTaxReports: boolean;
  canManageTaxSettings: boolean;
  canProcessReturns: boolean;
  canAuditTax: boolean;
  jurisdictionAccess: string[];
}

@Injectable()
export class GlobalTaxGuard implements CanActivate {
  private readonly logger = new Logger(GlobalTaxGuard.name);

  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient<Socket>();
      const data = context.switchToWs().getData();

      // Extract user from socket handshake or data
      const user = await this.extractUser(client, data);
      
      if (!user) {
        throw new WsException('Authentication required for tax operations');
      }

      // Validate user session
      const isValidSession = await this.validateSession(user);
      if (!isValidSession) {
        throw new WsException('Invalid or expired session');
      }

      // Check tax-specific permissions
      const hasPermission = await this.checkTaxPermissions(user, data);
      if (!hasPermission) {
        throw new WsException('Insufficient permissions for tax operations');
      }

      // Check jurisdiction access
      const hasJurisdictionAccess = await this.checkJurisdictionAccess(user, data);
      if (!hasJurisdictionAccess) {
        throw new WsException('Access denied for requested tax jurisdiction');
      }

      // Attach user to context for use in controllers
      client.data = { ...client.data, user };

      // Log tax access attempt
      this.logger.log(`Tax access granted: ${user.username} (${user.role}) - Jurisdictions: ${user.taxJurisdictions.join(', ')}`);

      return true;
    } catch (error) {
      this.logger.error(`Tax access denied: ${error.message}`);
      if (error instanceof WsException) {
        throw error;
      }
      throw new WsException('Tax access denied');
    }
  }

  /**
   * Extract user from WebSocket client
   */
  private async extractUser(client: Socket, data: any): Promise<TaxUser | null> {
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
        return this.enhanceUserWithTaxData(client.data.user);
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
  private async validateTokenAndGetUser(token: string): Promise<TaxUser | null> {
    try {
      // Remove 'Bearer ' prefix if present
      const cleanToken = token.replace(/^Bearer\s+/, '');

      // Mock JWT validation - replace with actual JWT service
      if (cleanToken === 'valid_token') {
        return {
          id: 'user_001',
          userId: 'user_001',
          username: 'tax_specialist',
          email: 'tax@company.com',
          role: 'tax_manager',
          permissions: [
            'calculate_tax',
            'view_tax_reports',
            'manage_tax_settings',
            'process_returns',
            'audit_tax',
          ],
          taxJurisdictions: ['US', 'EU', 'IN', 'APAC'],
          certifications: ['CPA', 'TAX_SPECIALIST', 'INTERNATIONAL_TAX'],
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
   * Get user by ID and enhance with tax data
   */
  private async getUserById(userId: string): Promise<TaxUser | null> {
    try {
      // Mock user lookup - replace with actual user service
      return {
        id: userId,
        userId,
        username: `tax_user_${userId}`,
        email: `tax${userId}@company.com`,
        role: 'tax_user',
        permissions: ['calculate_tax', 'view_tax_reports'],
        taxJurisdictions: ['US'],
        certifications: [],
        sessionId: `session_${userId}`,
        lastActivity: new Date(),
      };
    } catch (error) {
      this.logger.error(`User lookup failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Enhance regular user with tax-specific data
   */
  private async enhanceUserWithTaxData(user: any): Promise<TaxUser> {
    return {
      ...user,
      taxJurisdictions: user.taxJurisdictions || ['US'],
      certifications: user.certifications || [],
    };
  }

  /**
   * Validate user session
   */
  private async validateSession(user: TaxUser): Promise<boolean> {
    try {
      // Check session expiration
      const sessionTimeout = 3600000; // 1 hour in milliseconds
      const timeSinceLastActivity = Date.now() - user.lastActivity.getTime();

      if (timeSinceLastActivity > sessionTimeout) {
        this.logger.warn(`Session expired for tax user: ${user.username}`);
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
   * Check tax-specific permissions
   */
  private async checkTaxPermissions(user: TaxUser, data: any): Promise<boolean> {
    try {
      const permissions = this.getTaxPermissions(user);

      // Basic tax access check
      if (!permissions.canCalculateTax) {
        return false;
      }

      // Check operation-specific permissions
      const operation = data?.operation || 'calculate';

      switch (operation) {
        case 'calculate_tax':
        case 'estimate_tax':
          return permissions.canCalculateTax;

        case 'generate_tax_report':
        case 'view_tax_analytics':
          return permissions.canViewTaxReports;

        case 'configure_tax_rules':
        case 'manage_tax_rates':
          return permissions.canManageTaxSettings;

        case 'file_tax_return':
        case 'submit_tax_payment':
          return permissions.canProcessReturns;

        case 'audit_tax_calculation':
        case 'compliance_check':
          return permissions.canAuditTax;

        default:
          return permissions.canCalculateTax;
      }
    } catch (error) {
      this.logger.error(`Tax permission check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Check jurisdiction access
   */
  private async checkJurisdictionAccess(user: TaxUser, data: any): Promise<boolean> {
    try {
      const requestedJurisdiction = data?.jurisdiction;
      
      // If no specific jurisdiction requested, allow access
      if (!requestedJurisdiction) {
        return true;
      }

      // Check if user has access to requested jurisdiction
      return user.taxJurisdictions.includes(requestedJurisdiction) ||
             user.taxJurisdictions.includes('GLOBAL') ||
             user.role === 'tax_admin';
    } catch (error) {
      this.logger.error(`Jurisdiction access check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get tax permissions for user
   */
  private getTaxPermissions(user: TaxUser): TaxPermissions {
    const basePermissions: TaxPermissions = {
      canCalculateTax: false,
      canViewTaxReports: false,
      canManageTaxSettings: false,
      canProcessReturns: false,
      canAuditTax: false,
      jurisdictionAccess: [],
    };

    // Role-based permission mapping
    switch (user.role) {
      case 'tax_admin':
      case 'cfo':
        return {
          canCalculateTax: true,
          canViewTaxReports: true,
          canManageTaxSettings: true,
          canProcessReturns: true,
          canAuditTax: true,
          jurisdictionAccess: ['ALL'],
        };

      case 'tax_manager':
        return {
          canCalculateTax: true,
          canViewTaxReports: true,
          canManageTaxSettings: true,
          canProcessReturns: true,
          canAuditTax: true,
          jurisdictionAccess: user.taxJurisdictions,
        };

      case 'tax_specialist':
        return {
          canCalculateTax: true,
          canViewTaxReports: true,
          canManageTaxSettings: false,
          canProcessReturns: true,
          canAuditTax: false,
          jurisdictionAccess: user.taxJurisdictions,
        };

      case 'tax_analyst':
        return {
          canCalculateTax: true,
          canViewTaxReports: true,
          canManageTaxSettings: false,
          canProcessReturns: false,
          canAuditTax: false,
          jurisdictionAccess: user.taxJurisdictions,
        };

      default:
        // Check individual permissions
        if (user.permissions) {
          return {
            canCalculateTax: user.permissions.includes('calculate_tax'),
            canViewTaxReports: user.permissions.includes('view_tax_reports'),
            canManageTaxSettings: user.permissions.includes('manage_tax_settings'),
            canProcessReturns: user.permissions.includes('process_returns'),
            canAuditTax: user.permissions.includes('audit_tax'),
            jurisdictionAccess: user.taxJurisdictions,
          };
        }
        return basePermissions;
    }
  }

  /**
   * Check if user has certification for jurisdiction
   */
  private hasCertificationForJurisdiction(user: TaxUser, jurisdiction: string): boolean {
    const requiredCertifications = {
      'US': ['CPA', 'EA', 'TAX_SPECIALIST'],
      'EU': ['EU_TAX_CERT', 'VAT_SPECIALIST'],
      'IN': ['CA', 'GST_PRACTITIONER'],
      'ME': ['MIDDLE_EAST_TAX'],
      'APAC': ['APAC_TAX_SPECIALIST'],
    };

    const required = requiredCertifications[jurisdiction] || [];
    return required.some(cert => user.certifications.includes(cert)) ||
           user.certifications.includes('GLOBAL_TAX_EXPERT');
  }

  /**
   * Get user from WebSocket client
   */
  static getUserFromClient(client: Socket): TaxUser | null {
    return client.data?.user || null;
  }

  /**
   * Validate tax operation request
   */
  async validateTaxOperation(user: TaxUser, operation: string, jurisdiction: string): Promise<boolean> {
    try {
      // Check general tax permissions
      const permissions = this.getTaxPermissions(user);
      
      // Check jurisdiction access
      if (!permissions.jurisdictionAccess.includes(jurisdiction) && 
          !permissions.jurisdictionAccess.includes('ALL')) {
        return false;
      }

      // Check certification requirements for high-risk operations
      const highRiskOperations = ['file_tax_return', 'audit_tax_calculation'];
      if (highRiskOperations.includes(operation)) {
        return this.hasCertificationForJurisdiction(user, jurisdiction);
      }

      return true;
    } catch (error) {
      this.logger.error(`Tax operation validation failed: ${error.message}`);
      return false;
    }
  }
}
