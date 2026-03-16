import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserImpersonationService } from '../services/user-impersonation.service';
import {
  ImpersonateUserDto,
  ImpersonationResponseDto,
  ActiveImpersonationDto,
  UserSearchDto,
  BulkUserActionDto,
  ForceLogoutDto,
} from '../dto/user-impersonation.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { User } from '../entities/user.entity';
import { ImpersonationSession } from '../entities/impersonation-session.entity';

@ApiTags('User Impersonation')
@ApiBearerAuth()
@Controller('user-impersonation')
// @UseGuards(JwtAuthGuard, RBACGuard)
// @Roles('super_admin')
export class UserImpersonationController {
  constructor(private readonly impersonationService: UserImpersonationService) {}

  @Post('impersonate')
  @ApiOperation({ summary: 'Impersonate a user (Super Admin only)' })
  @ApiResponse({ status: 200, type: ImpersonationResponseDto })
  async impersonateUser(
    @Req() req: any,
    @Body() dto: ImpersonateUserDto
  ): Promise<ImpersonationResponseDto> {
    const adminUserId = req.user.sub;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    return this.impersonationService.impersonateUser(adminUserId, dto, ipAddress, userAgent);
  }

  @Post('end/:sessionId')
  @ApiOperation({ summary: 'End an impersonation session' })
  @ApiResponse({ status: 200 })
  async endImpersonation(@Req() req: any, @Param('sessionId') sessionId: string) {
    const adminUserId = req.user.sub;
    await this.impersonationService.endImpersonation(sessionId, adminUserId);
    return { success: true, message: 'Impersonation session ended' };
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active impersonation sessions' })
  @ApiResponse({ status: 200, type: [ActiveImpersonationDto] })
  async getActiveImpersonations(): Promise<ActiveImpersonationDto[]> {
    return this.impersonationService.getActiveImpersonations();
  }

  @Get('search-users')
  @ApiOperation({ summary: 'Search users across all organizations' })
  @ApiResponse({ status: 200, type: [User] })
  async searchUsers(@Query() query: UserSearchDto): Promise<User[]> {
    return this.impersonationService.searchUsers(query);
  }

  @Post('bulk-action')
  @ApiOperation({ summary: 'Perform bulk action on multiple users' })
  @ApiResponse({ status: 200 })
  async performBulkAction(@Req() req: any, @Body() dto: BulkUserActionDto) {
    const performedBy = req.user.sub;
    return this.impersonationService.performBulkAction(dto, performedBy);
  }

  @Post('force-logout')
  @ApiOperation({ summary: 'Force logout a user' })
  @ApiResponse({ status: 200 })
  async forceLogout(@Req() req: any, @Body() dto: ForceLogoutDto) {
    const performedBy = req.user.sub;
    return this.impersonationService.forceLogout(dto, performedBy);
  }

  @Get('history/:userId')
  @ApiOperation({ summary: 'Get impersonation history for a user' })
  @ApiResponse({ status: 200, type: [ImpersonationSession] })
  async getHistory(@Param('userId') userId: string): Promise<ImpersonationSession[]> {
    return this.impersonationService.getImpersonationHistory(userId);
  }
}
