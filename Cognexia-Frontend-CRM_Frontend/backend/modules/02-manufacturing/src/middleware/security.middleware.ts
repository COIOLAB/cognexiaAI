import {
  Injectable,
  NestMiddleware,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface SecurityConfig {
  enableSqlInjectionProtection: boolean;
  enableXssProtection: boolean;
  enableCsrfProtection: boolean;
  enableInputSanitization: boolean;
  enableAuditLogging: boolean;
  maxRequestSize: number;
  allowedFileTypes: string[];
  blockedPatterns: RegExp[];
  sensitiveDataPatterns: RegExp[];
}

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  enableSqlInjectionProtection: true,
  enableXssProtection: true,
  enableCsrfProtection: true,
  enableInputSanitization: true,
  enableAuditLogging: true,
  maxRequestSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['.pdf', '.xlsx', '.csv', '.txt', '.json'],
  blockedPatterns: [
    /(<script>|<\/script>)/i,
    /(union\s+select|drop\s+table|delete\s+from)/i,
    /(eval\s*\(|function\s*\()/i,
    /(javascript:|data:|vbscript:)/i,
  ],
  sensitiveDataPatterns: [
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card patterns
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN patterns
    /password|pwd|secret|token|key/i,
  ],
};

interface SecurityViolation {
  type: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  field?: string;
  value?: string;
  pattern?: string;
}

@Injectable()
export class ManufacturingSecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ManufacturingSecurityMiddleware.name);
  private readonly config: SecurityConfig;
  private readonly auditLog: SecurityViolation[] = [];
  private readonly maxAuditLogSize = 10000;

  constructor(private readonly configService: ConfigService) {
    this.config = this.loadSecurityConfiguration();
  }

  use(req: Request, res: Response, next: NextFunction): void {
    try {
      // Set security headers
      this.setSecurityHeaders(res);

      // Validate request size
      this.validateRequestSize(req);

      // Sanitize and validate input
      if (this.config.enableInputSanitization) {
        this.sanitizeRequest(req);
      }

      // Check for security violations
      const violations = this.detectSecurityViolations(req);
      
      if (violations.length > 0) {
        this.handleSecurityViolations(req, violations);
        return;
      }

      // Log security events for audit
      if (this.config.enableAuditLogging) {
        this.logSecurityEvent(req);
      }

      next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Security middleware error: ${errorMessage}`, errorStack);
      throw new BadRequestException('Request validation failed');
    }
  }

  private setSecurityHeaders(res: Response): void {
    // Prevent XSS attacks
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Content Security Policy for manufacturing applications
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss: https:; font-src 'self' https:; object-src 'none'; media-src 'self'; child-src 'none';"
    );

    // Strict Transport Security
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy (formerly Feature Policy)
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
    );

    // Manufacturing-specific headers
    res.setHeader('X-Manufacturing-API-Version', '1.0');
    res.setHeader('X-Security-Level', 'HIGH');
  }

  private validateRequestSize(req: Request): void {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > this.config.maxRequestSize) {
      throw new BadRequestException(
        `Request size ${contentLength} exceeds maximum allowed size ${this.config.maxRequestSize}`
      );
    }
  }

  private sanitizeRequest(req: Request): void {
    // Sanitize URL parameters
    if (req.params) {
      req.params = this.sanitizeObject(req.params);
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = this.sanitizeObject(req.query);
    }

    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = this.sanitizeObject(req.body);
    }
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return this.sanitizeString(String(obj));
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = this.sanitizeString(String(key));
      sanitized[sanitizedKey] = this.sanitizeObject(value);
    }

    return sanitized;
  }

  private sanitizeString(str: string): string {
    if (typeof str !== 'string') {
      return str;
    }

    let sanitized = str;

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Basic XSS protection
    if (this.config.enableXssProtection) {
      sanitized = sanitized
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }

    // Basic SQL injection protection
    if (this.config.enableSqlInjectionProtection) {
      // Remove common SQL injection patterns
      sanitized = sanitized.replace(/(union|select|insert|update|delete|drop|exec|execute)\s+/gi, '');
      sanitized = sanitized.replace(/['"`;\\]/g, '');
    }

    return sanitized.trim();
  }

  private detectSecurityViolations(req: Request): SecurityViolation[] {
    const violations: SecurityViolation[] = [];

    // Check for blocked patterns in the entire request
    const requestData = {
      url: req.url,
      method: req.method,
      headers: req.headers,
      params: req.params,
      query: req.query,
      body: req.body,
    };

    const requestString = JSON.stringify(requestData);

    // Check for malicious patterns
    for (const pattern of this.config.blockedPatterns) {
      const matches = requestString.match(pattern);
      if (matches) {
        violations.push({
          type: 'MALICIOUS_PATTERN',
          description: `Blocked pattern detected: ${pattern.source}`,
          severity: 'HIGH',
          pattern: pattern.source,
          value: matches[0],
        });
      }
    }

    // Check for sensitive data exposure
    for (const pattern of this.config.sensitiveDataPatterns) {
      const matches = requestString.match(pattern);
      if (matches) {
        violations.push({
          type: 'SENSITIVE_DATA_EXPOSURE',
          description: `Potential sensitive data detected`,
          severity: 'MEDIUM',
          pattern: pattern.source,
          value: '***REDACTED***',
        });
      }
    }

    // Manufacturing-specific security checks
    violations.push(...this.checkManufacturingSpecificSecurity(req));

    return violations;
  }

  private checkManufacturingSpecificSecurity(req: Request): SecurityViolation[] {
    const violations: SecurityViolation[] = [];

    // Check for suspicious manufacturing operations
    const path = req.path.toLowerCase();
    const body = req.body;

    // Emergency stop abuse detection
    if (path.includes('emergency-stop') && req.method === 'POST') {
      const userAgent = req.headers['user-agent'] || '';
      if (!userAgent.includes('ManufacturingClient') && !userAgent.includes('HMI')) {
        violations.push({
          type: 'SUSPICIOUS_EMERGENCY_STOP',
          description: 'Emergency stop request from non-manufacturing client',
          severity: 'CRITICAL',
        });
      }
    }

    // Production order manipulation detection
    if (path.includes('production-order') && body?.quantity) {
      const quantity = parseInt(body.quantity);
      if (quantity > 1000000 || quantity < 0) {
        violations.push({
          type: 'SUSPICIOUS_QUANTITY',
          description: 'Abnormal production quantity detected',
          severity: 'HIGH',
          field: 'quantity',
          value: String(quantity),
        });
      }
    }

    // IoT device security validation
    if (path.includes('iot-device') && body?.networkConfig) {
      const ipAddress = body.networkConfig?.ipAddress;
      if (ipAddress && this.isPrivateOrLocalhost(ipAddress)) {
        // Allow private/localhost IPs for manufacturing environments
      } else if (ipAddress && !this.isValidManufacturingIP(ipAddress)) {
        violations.push({
          type: 'SUSPICIOUS_IOT_CONFIG',
          description: 'Suspicious IoT device IP configuration',
          severity: 'MEDIUM',
          field: 'networkConfig.ipAddress',
          value: ipAddress,
        });
      }
    }

    // Digital twin security checks
    if (path.includes('digital-twin') && body?.simulationParameters) {
      const params = body.simulationParameters;
      if (params?.timeStep && (params.timeStep < 0.001 || params.timeStep > 3600)) {
        violations.push({
          type: 'INVALID_SIMULATION_PARAMS',
          description: 'Invalid simulation time step detected',
          severity: 'MEDIUM',
          field: 'simulationParameters.timeStep',
          value: String(params.timeStep),
        });
      }
    }

    return violations;
  }

  private handleSecurityViolations(req: Request, violations: SecurityViolation[]): void {
    const criticalViolations = violations.filter(v => v.severity === 'CRITICAL');
    const highSeverityViolations = violations.filter(v => v.severity === 'HIGH');

    // Log all violations
    this.logViolations(req, violations);

    // Add to audit log
    this.addToAuditLog(violations);

    // Block critical violations immediately
    if (criticalViolations.length > 0) {
      this.logger.error(`CRITICAL security violations detected from ${req.ip}: ${JSON.stringify(criticalViolations)}`);
      throw new ForbiddenException('Critical security violation detected');
    }

    // Block high severity violations
    if (highSeverityViolations.length > 0) {
      this.logger.warn(`HIGH severity security violations detected from ${req.ip}: ${JSON.stringify(highSeverityViolations)}`);
      throw new ForbiddenException('High severity security violation detected');
    }

    // Log medium and low violations but allow request to proceed with monitoring
    if (violations.length > 0) {
      this.logger.warn(`Security violations detected from ${req.ip}: ${JSON.stringify(violations)}`);
    }
  }

  private logViolations(req: Request, violations: SecurityViolation[]): void {
    for (const violation of violations) {
      this.logger.warn(`Security Violation: ${violation.type} - ${violation.description}`, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        url: req.url,
        method: req.method,
        violation,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private addToAuditLog(violations: SecurityViolation[]): void {
    this.auditLog.push(...violations);
    
    // Keep audit log size manageable
    if (this.auditLog.length > this.maxAuditLogSize) {
      this.auditLog.splice(0, this.auditLog.length - this.maxAuditLogSize);
    }
  }

  private logSecurityEvent(req: Request): void {
    // Log significant security events (not every request)
    const significantEvents = [
      'emergency-stop',
      'production-order/release',
      'quality/approve',
      'digital-twin/simulate',
      'iot-device/configure',
    ];

    const path = req.path.toLowerCase();
    const isSignificant = significantEvents.some(event => path.includes(event));

    if (isSignificant) {
      this.logger.log(`Security Event: ${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        user: req['user']?.sub || 'anonymous',
        timestamp: new Date().toISOString(),
      });
    }
  }

  private isPrivateOrLocalhost(ip: string): boolean {
    // Check for private IP ranges and localhost
    const privateRanges = [
      /^127\./,           // 127.0.0.0/8
      /^10\./,            // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[01])\./,  // 172.16.0.0/12
      /^192\.168\./,      // 192.168.0.0/16
      /^169\.254\./,      // 169.254.0.0/16 (link-local)
      /^::1$/,            // IPv6 localhost
      /^fe80:/,           // IPv6 link-local
    ];

    return privateRanges.some(range => range.test(ip));
  }

  private isValidManufacturingIP(ip: string): boolean {
    // Manufacturing environments typically use private IP ranges
    // This can be customized based on specific manufacturing network configurations
    return this.isPrivateOrLocalhost(ip);
  }

  private loadSecurityConfiguration(): SecurityConfig {
    return {
      enableSqlInjectionProtection: this.configService.get<boolean>(
        'manufacturing.security.enableSqlInjectionProtection',
        DEFAULT_SECURITY_CONFIG.enableSqlInjectionProtection
      ),
      enableXssProtection: this.configService.get<boolean>(
        'manufacturing.security.enableXssProtection',
        DEFAULT_SECURITY_CONFIG.enableXssProtection
      ),
      enableCsrfProtection: this.configService.get<boolean>(
        'manufacturing.security.enableCsrfProtection',
        DEFAULT_SECURITY_CONFIG.enableCsrfProtection
      ),
      enableInputSanitization: this.configService.get<boolean>(
        'manufacturing.security.enableInputSanitization',
        DEFAULT_SECURITY_CONFIG.enableInputSanitization
      ),
      enableAuditLogging: this.configService.get<boolean>(
        'manufacturing.security.enableAuditLogging',
        DEFAULT_SECURITY_CONFIG.enableAuditLogging
      ),
      maxRequestSize: this.configService.get<number>(
        'manufacturing.security.maxRequestSize',
        DEFAULT_SECURITY_CONFIG.maxRequestSize
      ),
      allowedFileTypes: this.configService.get<string[]>(
        'manufacturing.security.allowedFileTypes',
        DEFAULT_SECURITY_CONFIG.allowedFileTypes
      ),
      blockedPatterns: DEFAULT_SECURITY_CONFIG.blockedPatterns,
      sensitiveDataPatterns: DEFAULT_SECURITY_CONFIG.sensitiveDataPatterns,
    };
  }

  // Method to get audit log for security analysis
  getAuditLog(): SecurityViolation[] {
    return [...this.auditLog];
  }

  // Method to clear audit log (for maintenance)
  clearAuditLog(): void {
    this.auditLog.length = 0;
    this.logger.log('Security audit log cleared');
  }
}
