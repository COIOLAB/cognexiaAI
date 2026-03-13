# Industry 5.0 Procurement Security Implementation Guide

This guide demonstrates how to use the comprehensive security system implemented for the Industry 5.0 procurement module.

## Overview of Security Components

The procurement module includes several layers of security:

1. **JWT Authentication Guard** - Basic authentication and token validation
2. **Roles Guard** - Role-based access control with permissions
3. **Procurement Permission Guard** - Advanced business-rule-based access control  
4. **AI Security Guard** - Specialized security for AI and blockchain operations
5. **Audit Interceptor** - Comprehensive automatic audit logging

## 1. Using Guards in Controllers

### Basic Authentication
```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { RequireRoles, RequirePermissions } from '../guards/roles.guard';

@Controller('vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorController {
  
  @Get()
  @RequirePermissions('VENDOR_VIEW')
  async getVendors() {
    // Only users with VENDOR_VIEW permission can access
  }
  
  @Post()
  @RequireRoles('PROCUREMENT_MANAGER')
  async createVendor() {
    // Only procurement managers can create vendors
  }
}
```

### Advanced Procurement Permissions
```typescript
import { ProcurementPermissionGuard, RequireOrderLimit, RequireCategory } from '../guards/procurement-permission.guard';

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, RolesGuard, ProcurementPermissionGuard)
export class PurchaseOrderController {
  
  @Post()
  @RequireOrderLimit(50000) // Max $50K without special approval
  @RequireCategory(['OFFICE_SUPPLIES', 'EQUIPMENT'])
  async createPurchaseOrder() {
    // Order value and category checks applied
  }
  
  @Post('approve')
  @RequireRoles('PROCUREMENT_APPROVER')
  @RequireBudgetCheck()
  async approvePurchaseOrder() {
    // Budget validation required
  }
}
```

### AI and Blockchain Security
```typescript
import { AISecurityGuard, RequireHighSecurityAI, RequireSecureBlockchain } from '../guards/ai-security.guard';

@Controller('ai-analytics')
@UseGuards(JwtAuthGuard, RolesGuard, AISecurityGuard)
export class AIAnalyticsController {
  
  @Post('analyze-spending')
  @RequireHighSecurityAI()
  async analyzeSpending() {
    // High-security AI operation with enhanced validation
  }
  
  @Post('blockchain-contract')
  @RequireSecureBlockchain()
  async createBlockchainContract() {
    // Secure blockchain operation with transaction limits
  }
}
```

## 2. Audit Logging Configuration

### Basic Audit Logging
```typescript
import { BasicAudit, DetailedAudit, ComprehensiveAudit } from '../guards/audit.interceptor';

@Controller('vendors')
@UseInterceptors(AuditInterceptor)
export class VendorController {
  
  @Get()
  @BasicAudit()
  async getVendors() {
    // Basic audit logging - no request/response body
  }
  
  @Post()
  @DetailedAudit()
  async createVendor() {
    // Detailed audit - includes request body, masks sensitive data
  }
  
  @Delete(':id')
  @ComprehensiveAudit()
  async deleteVendor() {
    // Full audit logging - request/response body, headers, etc.
  }
}
```

### Custom Audit Configuration
```typescript
import { ConfigureAudit } from '../guards/audit.interceptor';

@Controller('contracts')
export class ContractController {
  
  @Post()
  @ConfigureAudit({
    level: 'COMPREHENSIVE',
    logRequestBody: true,
    logResponseBody: true,
    maskSensitiveData: true,
    sensitiveFields: ['signature', 'bankAccount', 'taxId'],
    customTags: ['contract', 'legal', 'high-value'],
    requiresApproval: true
  })
  async createContract() {
    // Custom audit configuration for contract operations
  }
}
```

### High-Security Operations
```typescript
import { HighSecurityAudit } from '../guards/audit.interceptor';

@Controller('blockchain')
@UseGuards(JwtAuthGuard, RolesGuard, AISecurityGuard)
export class BlockchainController {
  
  @Post('smart-contract')
  @RequireSecureBlockchain()
  @HighSecurityAudit()
  async createSmartContract() {
    // Maximum security for blockchain operations
    // Logs blockchain-specific sensitive fields
    // Enhanced monitoring and alerting
  }
}
```

## 3. Complete Security Stack Example

Here's how to combine all security components for a high-security operation:

```typescript
import { 
  Controller, 
  Post, 
  UseGuards, 
  UseInterceptors,
  Body 
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, RequireRoles } from '../guards/roles.guard';
import { ProcurementPermissionGuard, RequireOrderLimit } from '../guards/procurement-permission.guard';
import { AISecurityGuard, RequireCriticalAI } from '../guards/ai-security.guard';
import { AuditInterceptor, HighSecurityAudit } from '../guards/audit.interceptor';

@Controller('critical-operations')
@UseGuards(
  JwtAuthGuard,           // 1. Authentication
  RolesGuard,             // 2. Role validation  
  ProcurementPermissionGuard, // 3. Business rules
  AISecurityGuard         // 4. AI/Blockchain security
)
@UseInterceptors(AuditInterceptor) // 5. Comprehensive audit logging
export class CriticalOperationsController {
  
  @Post('high-value-ai-analysis')
  @RequireRoles('SENIOR_PROCUREMENT_MANAGER')    // Must be senior manager
  @RequireOrderLimit(500000)                     // $500K limit check
  @RequireCriticalAI()                          // Critical AI operation
  @HighSecurityAudit()                          // Maximum audit logging
  async performHighValueAIAnalysis(@Body() data: any) {
    // This endpoint has maximum security:
    // ✓ User must be authenticated with valid JWT
    // ✓ User must have SENIOR_PROCUREMENT_MANAGER role
    // ✓ Order value cannot exceed $500K without approval
    // ✓ Critical AI security validations applied
    // ✓ All operations logged with maximum detail
    // ✓ Sensitive data automatically masked
    // ✓ Real-time security monitoring active
    
    return await this.aiService.performCriticalAnalysis(data);
  }
}
```

## 4. Error Handling and Security Events

The security system automatically handles various scenarios:

### Authentication Failures
```typescript
// JWT Guard automatically handles:
// - Expired tokens -> 401 Unauthorized  
// - Invalid tokens -> 401 Unauthorized
// - Missing tokens -> 401 Unauthorized (unless @Public())
// - Inactive users -> 403 Forbidden
```

### Authorization Failures  
```typescript
// Role/Permission Guards handle:
// - Insufficient roles -> 403 Forbidden
// - Missing permissions -> 403 Forbidden  
// - Business rule violations -> 400 Bad Request
```

### Security Violations
```typescript
// AI Security Guard handles:
// - Exceeded AI operation limits -> 429 Too Many Requests
// - Invalid blockchain parameters -> 400 Bad Request
// - Data privacy violations -> 403 Forbidden
// - High-sensitivity operations -> Requires approval
```

### Audit Events
```typescript
// Audit Interceptor automatically logs:
// - All successful operations with timing
// - All failed operations with error details
// - High-impact operations with alerts
// - Performance issues (slow operations)
// - Security anomalies and suspicious patterns
```

## 5. Configuration Examples

### Environment Configuration
```env
# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h

# Audit Configuration  
AUDIT_RETENTION_DAYS=365
CRITICAL_AUDIT_RETENTION_DAYS=1095

# Security Limits
MAX_AI_OPERATIONS_PER_HOUR=100
MAX_BLOCKCHAIN_TRANSACTION_VALUE=1000000
HIGH_VALUE_THRESHOLD=100000
```

### Module Configuration
```typescript
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    TypeOrmModule.forFeature([
      AuditLog,
      ProcurementAlert,
      // ... other entities
    ]),
  ],
  providers: [
    JwtAuthGuard,
    RolesGuard, 
    ProcurementPermissionGuard,
    AISecurityGuard,
    AuditInterceptor,
    AuditLoggingService,
    // ... other services
  ],
  controllers: [
    VendorController,
    PurchaseOrderController,
    // ... other controllers
  ],
})
export class ProcurementModule {}
```

## 6. Monitoring and Alerting

The security system provides comprehensive monitoring:

### Real-time Security Alerts
- Failed authentication attempts
- Excessive API usage by user  
- High-value transactions
- After-hours activity
- Suspicious access patterns

### Audit Analytics
- User activity patterns
- Operation success rates
- Performance metrics
- Compliance violations
- Data integrity checks

### Security Reports
- Daily security summary
- Compliance audit reports
- User activity reports
- Security incident reports

## 7. Best Practices

### Controller Security
1. Always use `JwtAuthGuard` as the first guard
2. Add `RolesGuard` for role-based access
3. Use `ProcurementPermissionGuard` for business rules
4. Apply `AISecurityGuard` for AI/blockchain operations
5. Configure audit logging appropriately for operation sensitivity

### Data Protection
1. Use `@ConfigureAudit()` with `maskSensitiveData: true`
2. Define custom sensitive fields for domain-specific data
3. Use appropriate audit levels (BASIC/DETAILED/COMPREHENSIVE)
4. Apply high-security configurations for critical operations

### Performance Considerations
1. Guards execute in order - place most restrictive first
2. Use BASIC audit level for high-frequency operations
3. Cache role/permission checks when possible
4. Monitor audit log storage and implement cleanup policies

### Error Handling
1. Never expose sensitive information in error messages
2. Log security events for monitoring and analysis
3. Provide clear error messages for legitimate failures
4. Implement rate limiting for brute force protection

This comprehensive security implementation provides enterprise-grade protection for the Industry 5.0 procurement module while maintaining usability and performance.
