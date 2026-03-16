# Phase 2: Authentication & Authorization System

**Status:** ✅ Completed  
**Date:** January 11, 2026  
**Version:** 1.0.0

## Overview

Implemented comprehensive JWT-based authentication and role-based authorization system for multi-tenant SaaS architecture. Includes password management, email verification, and organization-level access control.

## Components Created

### 1. JWT Strategy (`guards/jwt.strategy.ts`)

**Purpose:** Validates JWT tokens and loads user context with organization details

**Features:**
- Validates access tokens from Authorization header
- Loads user with roles and permissions
- Verifies organization status and subscription
- Blocks access for inactive/suspended accounts
- Extracts and formats permissions (resource:action)

**Payload Structure:**
```typescript
{
  sub: string;           // User ID
  email: string;
  userType: UserType;    // super_admin | org_admin | org_user
  organizationId?: string;
  roles: string[];
  permissions: string[]; // Format: "resource:action"
  iat: number;          // Issued at
  exp: number;          // Expiration
}
```

### 2. Authentication Service (`services/auth.service.ts`)

**Endpoints Implemented:**
- ✅ User login with credentials
- ✅ User logout with audit logging
- ✅ Refresh access token
- ✅ Request password reset
- ✅ Confirm password reset
- ✅ Send email verification
- ✅ Confirm email verification

**Security Features:**
- Password hashing with bcrypt (10 rounds)
- Token-based password reset (1 hour validity)
- Email verification tokens (24 hours validity)
- Failed login attempt logging
- Last login timestamp tracking
- Audit logging for all auth events

**Token Strategy:**
- **Access Token:** 15 minutes (short-lived)
- **Refresh Token:** 7 days (long-lived)
- Separate secrets for access and refresh tokens

### 3. Authorization Guards

#### JwtAuthGuard (`guards/jwt-auth.guard.ts`)
- Enhanced existing guard with multi-tenant support
- Validates JWT tokens via Passport
- Supports `@Public()` decorator for public routes
- Detailed error messages for token issues

#### RolesGuard (`guards/roles.guard.ts`)
**Decorators:**
- `@Roles('admin', 'manager')` - Role-based access
- `@UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)` - User type restriction
- `@Permissions('users:create', 'users:update')` - Permission-based access

**Logic:**
- Super admins bypass all restrictions
- Checks user types, roles, and permissions
- Throws descriptive ForbiddenException on failure

#### OrganizationGuard (`guards/organization.guard.ts`)
**Purpose:** Enforces multi-tenant data isolation

**Features:**
- Super admins can access all organizations
- Org users restricted to their organization
- Validates organizationId in params/query/body
- Attaches organizationId to request for services

**Decorators:**
- `@CurrentUser()` - Get authenticated user
- `@OrganizationId()` - Get user's organization ID

### 4. Authentication Controller (`controllers/auth.controller.ts`)

**Endpoints:**
```
POST   /auth/login                    - User login
POST   /auth/logout                   - User logout (protected)
POST   /auth/refresh                  - Refresh access token
POST   /auth/password-reset/request   - Request password reset
POST   /auth/password-reset/confirm   - Confirm password reset
POST   /auth/verify-email/send        - Send verification email (protected)
POST   /auth/verify-email/confirm     - Confirm email verification
GET    /auth/me                       - Get current user info (protected)
```

## Multi-Tenant Security

### Organization Isolation
```typescript
// Every protected route automatically filters by organizationId
@UseGuards(JwtAuthGuard, OrganizationGuard)
@Get('leads')
getLeads(@OrganizationId() orgId: string) {
  // orgId is automatically set to user's organization
  // Super admins can access any organization
}
```

### User Type Hierarchy

1. **super_admin** (CognexiaAI Internal)
   - Full system access
   - Can access all organizations
   - Bypasses all restrictions
   - Cannot be suspended

2. **org_admin** (Client Administrator)
   - Manage organization settings
   - Invite/remove users
   - View billing and usage
   - Restricted to their organization

3. **org_user** (Regular User)
   - Standard CRM access
   - Based on assigned roles/permissions
   - Restricted to their organization

### Permission System

**Format:** `resource:action`

**Examples:**
- `users:create`
- `users:read`
- `users:update`
- `users:delete`
- `leads:create`
- `reports:export`

**Usage:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Permissions('users:create', 'users:update')
@Post('users')
createUser() { ... }
```

## Authentication Flow

### Login Flow
```
1. User submits email/password
2. Service validates credentials
3. Check user active status
4. Check email verified
5. Check organization status (if not super admin)
6. Check subscription status
7. Update lastLoginAt timestamp
8. Generate access + refresh tokens
9. Log successful login (audit)
10. Return tokens + user info
```

### Token Refresh Flow
```
1. Client sends expired access token + valid refresh token
2. Service verifies refresh token
3. Load user with latest roles/permissions
4. Generate new access token
5. Return new access token
```

### Password Reset Flow
```
1. User requests reset with email
2. Generate secure token (32 bytes hex)
3. Hash and store token with 1-hour expiry
4. Send reset email (TODO: email service)
5. User clicks link with token
6. Validate token and expiry
7. Hash new password
8. Clear reset token
9. Log security event (audit)
```

### Email Verification Flow
```
1. User registers (or requests re-send)
2. Generate verification token (32 bytes hex)
3. Hash and store token with 24-hour expiry
4. Send verification email (TODO: email service)
5. User clicks link with token
6. Validate token and expiry
7. Set isEmailVerified = true
8. Clear verification token
9. Log verification (audit)
```

## Audit Logging

All authentication events are logged:
- ✅ Login attempts (success/failure)
- ✅ Logout events
- ✅ Password reset requests
- ✅ Password changes
- ✅ Email verification

**Logged Data:**
- User ID and email
- Action type
- IP address
- User agent
- Timestamp
- Security event flag

## Environment Variables

Add to `.env`:
```env
# JWT Secrets (CHANGE IN PRODUCTION)
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production

# Token Expiration
JWT_ACCESS_TOKEN_EXPIRATION=15m
JWT_REFRESH_TOKEN_EXPIRATION=7d

# Password Reset
PASSWORD_RESET_TOKEN_EXPIRATION=3600000  # 1 hour in ms
EMAIL_VERIFICATION_TOKEN_EXPIRATION=86400000  # 24 hours in ms
```

## Usage Examples

### Protected Route with Role Check
```typescript
@Controller('admin')
export class AdminController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  @Get('dashboard')
  getDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.adminService.getDashboard(user.organizationId);
  }
}
```

### Protected Route with Organization Isolation
```typescript
@Controller('leads')
export class LeadsController {
  @UseGuards(JwtAuthGuard, OrganizationGuard)
  @Get()
  async getLeads(@OrganizationId() orgId: string) {
    // orgId is automatically the user's organization
    // Super admins can access any organization
    return this.leadsService.findByOrganization(orgId);
  }
}
```

### Permission-Based Access
```typescript
@Controller('users')
export class UsersController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('users:create')
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Permissions('users:delete')
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
```

### Public Route
```typescript
@Controller('public')
export class PublicController {
  @Public()
  @Get('pricing')
  getPricing() {
    return this.pricingService.getPlans();
  }
}
```

## Files Created

### Guards
- `src/guards/jwt.strategy.ts` - JWT validation strategy
- `src/guards/roles.guard.ts` - Role/permission authorization
- `src/guards/organization.guard.ts` - Multi-tenant isolation

### Services
- `src/services/auth.service.ts` - Authentication logic

### Controllers
- `src/controllers/auth.controller.ts` - Auth endpoints

### Documentation
- `docs/PHASE2_AUTHENTICATION_AUTHORIZATION.md` (this file)

## Testing Checklist

- [x] TypeScript compilation successful
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Login with inactive account (should fail)
- [ ] Login with unverified email (should fail)
- [ ] Login with suspended organization (should fail)
- [ ] Token refresh works
- [ ] Password reset flow
- [ ] Email verification flow
- [ ] Protected routes require authentication
- [ ] Role-based access control works
- [ ] Organization isolation enforced
- [ ] Super admin can access all orgs
- [ ] Audit logs created for auth events

## Integration Requirements

**Module/App.module.ts needs:**
```typescript
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './guards/jwt.strategy';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    TypeOrmModule.forFeature([User, Organization, AuditLog]),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
```

## Security Best Practices Implemented

✅ Passwords hashed with bcrypt (10 rounds)  
✅ JWT tokens with short expiration  
✅ Separate secrets for access/refresh tokens  
✅ Token-based password reset (time-limited)  
✅ Email verification required  
✅ Failed login attempt logging  
✅ IP address and user agent tracking  
✅ Organization subscription validation  
✅ Multi-tenant data isolation  
✅ Super admin privilege separation  
✅ Audit logging for security events  

## Known Limitations / TODOs

- [ ] Email service integration (password reset, verification)
- [ ] MFA (Multi-Factor Authentication) implementation
- [ ] Rate limiting on login attempts
- [ ] Account lockout after failed attempts
- [ ] Session management (token blacklist)
- [ ] OAuth2/SSO integration (Google, Azure AD)
- [ ] Token rotation strategy
- [ ] Refresh token revocation

## Next Steps (Phase 3)

1. Organization Management APIs
2. Organization CRUD operations
3. Organization branding/customization
4. Organization suspension/activation
5. Super admin organization listing

---

**Phase 2 Status:** ✅ COMPLETE  
**Production Ready:** 🟡 Pending Email Service & Testing  
**Next Phase:** Phase 3 - Organization Management APIs
