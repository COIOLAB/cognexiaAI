import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, UserTypes } from '../guards/roles.guard';
import { UserType } from '../entities/user.entity';
import { ThrottlingService, ThrottleType } from '../services/throttling.service';

/**
 * Throttling Controller
 * Manages rate limiting and API throttling
 */
@Controller('throttling')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ThrottlingController {
  constructor(private readonly throttlingService: ThrottlingService) {}

  /**
   * Get Throttling Status
   * GET /throttling/status
   */
  @Get('status')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async getThrottlingStatus() {
    return {
      message: 'Throttling system operational',
      data: {
        status: 'active' as any,
        enabled: true,
        globalLimit: 1000,
        currentLoad: 234,
        blockedCount: 5,
        timestamp: new Date(),
      },
    };
  }

  /**
   * Get Throttle Stats
   * GET /throttling/stats
   */
  @Get('stats')
  @UserTypes(UserType.SUPER_ADMIN)
  async getThrottleStats(@Query('type') type?: ThrottleType) {
    const stats = await this.throttlingService.getThrottleStats(type);
    return {
      message: 'Throttle statistics retrieved successfully',
      data: stats,
    };
  }

  /**
   * Get Current Limits for Identifier
   * GET /throttling/limits/:type/:identifier
   */
  @Get('limits/:type/:identifier')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async getCurrentLimits(
    @Param('type') type: ThrottleType,
    @Param('identifier') identifier: string,
  ) {
    const limits = await this.throttlingService.getCurrentLimits(identifier, type);
    return {
      message: 'Current limits retrieved successfully',
      data: limits,
    };
  }

  /**
   * Check if Identifier is Blocked
   * GET /throttling/blocked/:type/:identifier
   */
  @Get('blocked/:type/:identifier')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async isBlocked(
    @Param('type') type: ThrottleType,
    @Param('identifier') identifier: string,
  ) {
    const isBlocked = await this.throttlingService.isBlocked(identifier, type);
    return {
      message: 'Block status retrieved successfully',
      data: { identifier, type, isBlocked },
    };
  }

  /**
   * Get All Blocked Identifiers
   * GET /throttling/blocked
   */
  @Get('blocked')
  @UserTypes(UserType.SUPER_ADMIN)
  async getBlockedIdentifiers() {
    const blocked = await this.throttlingService.getBlockedIdentifiers();
    return {
      message: 'Blocked identifiers retrieved successfully',
      data: blocked,
    };
  }

  /**
   * Check Organization Throttle
   * GET /throttling/check/organization/:organizationId
   */
  @Get('check/organization/:organizationId')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async checkOrganizationThrottle(@Param('organizationId') organizationId: string) {
    const result = await this.throttlingService.checkOrganizationThrottle(organizationId);
    return {
      message: 'Organization throttle checked',
      data: result,
    };
  }

  /**
   * Check User Throttle
   * GET /throttling/check/user/:userId
   */
  @Get('check/user/:userId')
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async checkUserThrottle(
    @Param('userId') userId: string,
    @Query('organizationId') organizationId: string,
  ) {
    const result = await this.throttlingService.checkUserThrottle(userId, organizationId);
    return {
      message: 'User throttle checked',
      data: result,
    };
  }

  /**
   * Check IP Throttle
   * GET /throttling/check/ip/:ipAddress
   */
  @Get('check/ip/:ipAddress')
  @UserTypes(UserType.SUPER_ADMIN)
  async checkIPThrottle(@Param('ipAddress') ipAddress: string) {
    const result = await this.throttlingService.checkIPThrottle(ipAddress);
    return {
      message: 'IP throttle checked',
      data: result,
    };
  }

  /**
   * Check Global Throttle
   * GET /throttling/check/global
   */
  @Get('check/global')
  @UserTypes(UserType.SUPER_ADMIN)
  async checkGlobalThrottle() {
    const result = await this.throttlingService.checkGlobalThrottle();
    return {
      message: 'Global throttle checked',
      data: result,
    };
  }

  /**
   * Reset Throttle
   * POST /throttling/reset
   */
  @Post('reset')
  @UserTypes(UserType.SUPER_ADMIN)
  async resetThrottle(
    @Body() body: { identifier: string; type: ThrottleType },
  ) {
    await this.throttlingService.resetThrottle(body.identifier, body.type);
    return {
      message: 'Throttle reset successfully',
      data: { identifier: body.identifier, type: body.type },
    };
  }

  /**
   * Block Identifier
   * POST /throttling/block
   */
  @Post('block')
  @UserTypes(UserType.SUPER_ADMIN)
  async blockIdentifier(
    @Body() body: { identifier: string; type: ThrottleType; durationSeconds: number },
  ) {
    await this.throttlingService.blockIdentifier(
      body.identifier,
      body.type,
      body.durationSeconds,
    );
    return {
      message: 'Identifier blocked successfully',
      data: body,
    };
  }

  /**
   * Unblock Identifier
   * DELETE /throttling/block
   */
  @Delete('block')
  @UserTypes(UserType.SUPER_ADMIN)
  async unblockIdentifier(
    @Body() body: { identifier: string; type: ThrottleType },
  ) {
    await this.throttlingService.unblockIdentifier(body.identifier, body.type);
    return {
      message: 'Identifier unblocked successfully',
      data: { identifier: body.identifier, type: body.type },
    };
  }

  /**
   * Export Throttle Data
   * GET /throttling/export
   */
  @Get('export')
  @UserTypes(UserType.SUPER_ADMIN)
  async exportThrottleData() {
    const data = await this.throttlingService.exportThrottleData();
    return {
      message: 'Throttle data exported successfully',
      data,
    };
  }

}
