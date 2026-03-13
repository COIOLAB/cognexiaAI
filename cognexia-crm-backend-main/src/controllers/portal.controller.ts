import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Ip,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { PortalService } from '../services/portal.service';
import {
  CreatePortalUserDto,
  UpdatePortalUserDto,
  AcceptInvitationDto,
  PortalLoginDto,
  ChangePasswordDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  UpdatePortalPreferencesDto,
  CreatePortalTicketDto,
} from '../dto/portal.dto';

@ApiTags('Customer Portal')
@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  // ============ Admin: Portal User Management ============

  @Post('users')
  @ApiOperation({ summary: 'Create portal user (Admin)' })
  @ApiResponse({ status: 201, description: 'Portal user created and invitation sent' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TenantGuard)
  async createPortalUser(@Request() req, @Body() dto: CreatePortalUserDto) {
    return this.portalService.createPortalUser(req.user.tenantId, dto);
  }

  // ============ Public: Authentication ============

  @Post('accept-invitation')
  @ApiOperation({ summary: 'Accept invitation and set password' })
  @ApiResponse({ status: 200, description: 'Invitation accepted successfully' })
  async acceptInvitation(@Body() dto: AcceptInvitationDto) {
    return this.portalService.acceptInvitation(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Portal user login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(
    @Body() dto: PortalLoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.portalService.login(dto, ip, userAgent || '');
  }

  @Post('password/request-reset')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    await this.portalService.requestPasswordReset(dto);
    return { message: 'If the email exists, a reset link has been sent' };
  }

  @Post('password/reset')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.portalService.resetPassword(dto);
    return { message: 'Password reset successfully' };
  }

  // ============ Authenticated: Profile Management ============

  @Get('profile')
  @ApiOperation({ summary: 'Get my profile' })
  @ApiResponse({ status: 200, description: 'Portal user profile' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.portalService.getProfile(req.user.sub);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update my profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() dto: UpdatePortalUserDto) {
    return this.portalService.updateProfile(req.user.sub, dto);
  }

  @Post('password/change')
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    await this.portalService.changePassword(req.user.sub, dto);
    return { message: 'Password changed successfully' };
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updatePreferences(@Request() req, @Body() dto: UpdatePortalPreferencesDto) {
    return this.portalService.updatePreferences(req.user.sub, dto);
  }

  // ============ Self-Service Features ============

  @Get('tickets')
  @ApiOperation({ summary: 'Get my support tickets' })
  @ApiResponse({ status: 200, description: 'List of my tickets' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getMyTickets(@Request() req) {
    return this.portalService.getMyTickets(req.user.sub);
  }

  @Post('tickets')
  @ApiOperation({ summary: 'Create support ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createTicket(@Request() req, @Body() dto: CreatePortalTicketDto) {
    return this.portalService.createTicket(req.user.sub, dto);
  }

  @Get('documents')
  @ApiOperation({ summary: 'Get my documents' })
  @ApiResponse({ status: 200, description: 'List of my documents' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getMyDocuments(@Request() req) {
    return this.portalService.getMyDocuments(req.user.sub);
  }

  @Get('knowledge-base/search')
  @ApiOperation({ summary: 'Search knowledge base' })
  @ApiResponse({ status: 200, description: 'Knowledge base articles' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async searchKnowledgeBase(@Request() req, @Query('q') query: string) {
    return this.portalService.searchKnowledgeBase(req.user.sub, query);
  }
}
