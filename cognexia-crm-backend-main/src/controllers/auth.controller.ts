import { Controller, Post, Body, UseGuards, Req, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService, LoginDto, RegisterDto, PasswordResetRequestDto, PasswordResetDto, EmailVerificationDto } from '../services/auth.service';
import { JwtAuthGuard, Public } from '../guards/jwt-auth.guard';
import { CurrentUser, OrganizationId } from '../guards/organization.guard';
import { AuthenticatedUser } from '../guards/jwt.strategy';

/**
 * Authentication Controller
 * Handles user authentication, password management, and email verification
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * User Registration
   * POST /auth/register
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
    @Req() request: any,
  ) {
    const ipAddress = request.ip || request.connection?.remoteAddress;
    const userAgent = request.headers['user-agent'];
    
    return this.authService.register(registerDto, ipAddress, userAgent);
  }

  /**
   * User Login
   * POST /auth/login
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: any,
  ) {
    const ipAddress = request.ip || request.connection?.remoteAddress;
    const userAgent = request.headers['user-agent'];
    
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  /**
   * Demo Login
   * POST /auth/demo-login
   */
  @Public()
  @Post('demo-login')
  @HttpCode(HttpStatus.OK)
  async demoLogin(@Req() request: any) {
    const ipAddress = request.ip || request.connection?.remoteAddress;
    const userAgent = request.headers['user-agent'];

    return this.authService.demoLogin(ipAddress, userAgent);
  }

  /**
   * Demo Reset (Public in non-prod)
   * POST /auth/demo-reset
   */
  @Public()
  @Post('demo-reset')
  @HttpCode(HttpStatus.OK)
  async demoReset() {
    return this.authService.demoReset();
  }

  /**
   * User Logout
   * POST /auth/logout
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: any,
  ) {
    const ipAddress = request.ip || request.connection?.remoteAddress;
    const userAgent = request.headers['user-agent'];
    
    await this.authService.logout(user.id, ipAddress, userAgent);
    return { message: 'Logged out successfully' };
  }

  /**
   * Refresh Access Token
   * POST /auth/refresh
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  /**
   * Request Password Reset
   * POST /auth/password-reset/request
   */
  @Public()
  @Post('password-reset/request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
    return this.authService.requestPasswordReset(dto);
  }

  /**
   * Reset Password
   * POST /auth/password-reset/confirm
   */
  @Public()
  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: PasswordResetDto) {
    return this.authService.resetPassword(dto);
  }

  /**
   * Send Email Verification
   * POST /auth/verify-email/send
   */
  @UseGuards(JwtAuthGuard)
  @Post('verify-email/send')
  @HttpCode(HttpStatus.OK)
  async sendEmailVerification(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.sendEmailVerification(user.id);
  }

  /**
   * Verify Email
   * POST /auth/verify-email/confirm
   */
  @Public()
  @Post('verify-email/confirm')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: EmailVerificationDto) {
    return this.authService.verifyEmail(dto);
  }

  /**
   * Verify Email (Alias for documentation)
   * POST /auth/verify-email
   */
  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmailAlias(@Body() dto: EmailVerificationDto) {
    return this.authService.verifyEmail(dto);
  }

  /**
   * Forgot Password (Alias for documentation)
   * POST /auth/forgot-password
   */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: PasswordResetRequestDto) {
    return this.authService.requestPasswordReset(dto);
  }

  /**
   * Reset Password (Alias for documentation)
   * POST /auth/reset-password
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPasswordAlias(@Body() dto: PasswordResetDto) {
    return this.authService.resetPassword(dto);
  }

  /**
   * Get Current User
   * GET /auth/me
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return {
      id: user.id,
      email: user.email,
      userType: user.userType,
      organizationId: user.organizationId,
      roles: user.roles,
      permissions: user.permissions,
      organization: user.organization ? {
        id: user.organization.id,
        name: user.organization.name,
        status: user.organization.status,
        subscriptionStatus: user.organization.subscriptionStatus,
      } : null,
    };
  }

  /**
   * Seed Super Admin User (One-time setup endpoint)
   * POST /auth/seed-super-admin
   */
  @Public()
  @Post('seed-super-admin')
  @HttpCode(HttpStatus.OK)
  async seedSuperAdmin(@Body('secret') secret: string) {
    return this.authService.seedSuperAdmin(secret);
  }
}
