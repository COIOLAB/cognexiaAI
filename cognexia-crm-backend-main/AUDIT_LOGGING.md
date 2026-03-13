# Audit Logging System

## Overview
The audit logging system provides comprehensive tracking of all actions in the CRM system for compliance and security purposes.

## Features
- ✅ Automatic logging via interceptor
- ✅ Manual logging for specific actions
- ✅ Advanced filtering and pagination
- ✅ Export to CSV/JSON
- ✅ Compliance statistics
- ✅ IP address and User-Agent tracking
- ✅ Metadata support for custom data
- ✅ Retention policy support

## Usage

### 1. Automatic Logging with Interceptor

Add the interceptor to any controller to automatically log all actions:

```typescript
import { UseInterceptors } from '@nestjs/common';
import { AuditLogInterceptor } from '../interceptors/audit-log.interceptor';

@Controller('organizations')
@UseInterceptors(AuditLogInterceptor)
export class OrganizationController {
  // All methods in this controller will be automatically logged
}
```

### 2. Manual Logging

For more control, inject the service and log manually:

```typescript
import { AuditLogService } from '../services/audit-log.service';
import { AuditAction } from '../entities/audit-log.entity';

export class OrganizationService {
  constructor(private auditLogService: AuditLogService) {}

  async createOrganization(createDto: CreateOrganizationDto, userId: string) {
    const organization = await this.organizationRepository.save(createDto);

    // Log the action
    await this.auditLogService.log(
      organization.id, // organizationId
      userId,
      AuditAction.CREATE,
      'organization',
      organization.id,
      `Created organization: ${organization.name}`,
      { planType: organization.subscriptionPlan }, // optional metadata
      '192.168.1.1', // optional IP
      'Mozilla/5.0...' // optional User-Agent
    );

    return organization;
  }
}
```

### 3. Query Audit Logs

**Get all logs with filters:**
```
GET /audit-logs?organizationId=uuid&action=CREATE&page=1&limit=20
```

**Get logs for specific organization:**
```
GET /audit-logs/organizations/:organizationId
```

**Get logs for specific user:**
```
GET /audit-logs/users/:userId
```

**Get logs for specific entity:**
```
GET /audit-logs/entities/organization/:entityId
```

**Date range filter:**
```
GET /audit-logs?startDate=2024-01-01&endDate=2024-12-31
```

### 4. Export Audit Logs

**Export to CSV:**
```
GET /audit-logs/export?format=csv&organizationId=uuid
```

**Export to JSON:**
```
GET /audit-logs/export?format=json&startDate=2024-01-01
```

### 5. Get Statistics

```
GET /audit-logs/stats?organizationId=uuid
```

Returns:
```json
{
  "totalLogs": 1500,
  "recentLogs": 150,
  "actionCounts": [
    { "action": "CREATE", "count": 500 },
    { "action": "UPDATE", "count": 400 },
    { "action": "READ", "count": 300 }
  ],
  "entityTypeCounts": [
    { "entityType": "organization", "count": 200 },
    { "entityType": "user", "count": 300 }
  ]
}
```

## Available Actions

```typescript
enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import',
  SUSPEND = 'suspend',
  ACTIVATE = 'activate',
}
```

## Entity Types

Common entity types to use:
- `user`
- `organization`
- `customer`
- `lead`
- `billing`
- `subscription`
- `webhook`

## Database Schema

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  organizationId UUID NOT NULL,
  user_id UUID NOT NULL,
  action VARCHAR NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_org_created ON audit_logs(organizationId, created_at);
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

## Retention Policy

Clean up old audit logs (run via cron job):

```typescript
// Keep logs for 365 days
await auditLogService.cleanup(365);
```

## Best Practices

1. **Always log sensitive operations:**
   - User creation/deletion
   - Organization changes
   - Billing transactions
   - Permission changes
   - Data exports

2. **Include meaningful descriptions:**
   ```typescript
   // ❌ Bad
   description: 'Updated entity'
   
   // ✅ Good
   description: 'Updated organization "Acme Corp" - changed subscription from Basic to Premium'
   ```

3. **Use metadata for additional context:**
   ```typescript
   metadata: {
     oldValue: 'Basic',
     newValue: 'Premium',
     changedFields: ['subscriptionPlan', 'maxUsers']
   }
   ```

4. **Log both success and failure:**
   ```typescript
   try {
     await this.deleteOrganization(id);
     await this.auditLogService.log(..., 'Organization deleted successfully');
   } catch (error) {
     await this.auditLogService.log(..., `Failed to delete organization: ${error.message}`);
     throw error;
   }
   ```

## Compliance Features

### SOC 2 Compliance
- All actions tracked with timestamp
- User identity preserved
- IP address logging
- Immutable logs (no update/delete endpoints)

### GDPR Compliance
- User activity can be exported
- Logs linked to users for data deletion
- Retention policy support

### HIPAA Compliance
- Comprehensive audit trail
- Access logging (READ actions)
- Export capabilities for auditors

## Security Considerations

1. **No Update/Delete:** Audit logs are immutable
2. **Cascade Delete:** Logs are deleted when organization is deleted
3. **User NULL on Delete:** User reference set to NULL if user is deleted
4. **Access Control:** Only admins should access audit logs
5. **Sensitive Data:** Never log passwords or API keys in metadata

## Integration with Existing Controllers

To add audit logging to existing endpoints:

```typescript
// Example: Organization Controller
import { AuditLogService } from '../services/audit-log.service';

@Controller('organizations')
export class OrganizationController {
  constructor(private auditLogService: AuditLogService) {}

  @Post('suspend/:id')
  async suspend(@Param('id') id: string, @Req() req) {
    const org = await this.organizationService.suspend(id);
    
    await this.auditLogService.log(
      id,
      req.user.id,
      AuditAction.SUSPEND,
      'organization',
      id,
      `Suspended organization: ${org.name}`,
      null,
      req.ip,
      req.headers['user-agent']
    );
    
    return org;
  }
}
```
