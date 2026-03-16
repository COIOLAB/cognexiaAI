import { Controller, Get, Put, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserTierService } from '../services/user-tier.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../guards/organization.guard';
import { AuthenticatedUser } from '../guards/jwt.strategy';
import { UpdateUserTierDto, UserTierAllocationDto, UserAllocationResponse } from '../dto/user-tier.dto';

@ApiTags('User Tiers')
@Controller('user-tiers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserTierController {
  constructor(private readonly userTierService: UserTierService) {}

  @Get('organization/:organizationId')
  @ApiOperation({ summary: 'Get user tier allocation for organization' })
  @ApiResponse({ status: 200, description: 'User tier allocation retrieved', type: UserTierAllocationDto })
  async getUserTierAllocation(
    @Param('organizationId') organizationId: string,
  ): Promise<UserTierAllocationDto> {
    return this.userTierService.getUserTierAllocation(organizationId);
  }

  @Put('organization/:organizationId')
  @ApiOperation({ summary: 'Update user tier for organization (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'User tier updated', type: UserAllocationResponse })
  async updateUserTier(
    @Param('organizationId') organizationId: string,
    @Body() dto: UpdateUserTierDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserAllocationResponse> {
    return this.userTierService.updateUserTier(organizationId, dto, user as any);
  }

  @Get('organization/:organizationId/can-add-user')
  @ApiOperation({ summary: 'Check if organization can add more users' })
  @ApiResponse({ status: 200, description: 'User addition check result' })
  async canAddUser(
    @Param('organizationId') organizationId: string,
  ): Promise<{ canAdd: boolean; reason?: string }> {
    return this.userTierService.canAddUser(organizationId);
  }

  @Post('organization/:organizationId/validate')
  @ApiOperation({ summary: 'Validate user addition (throws error if limit reached)' })
  @ApiResponse({ status: 200, description: 'Validation passed' })
  @ApiResponse({ status: 400, description: 'User limit reached' })
  async validateUserAddition(
    @Param('organizationId') organizationId: string,
  ): Promise<{ message: string }> {
    await this.userTierService.validateUserAddition(organizationId);
    return { message: 'User can be added' };
  }

  @Post('organization/:organizationId/initialize')
  @ApiOperation({ summary: 'Initialize default tier for organization' })
  @ApiResponse({ status: 200, description: 'Default tier initialized' })
  async initializeDefaultTier(
    @Param('organizationId') organizationId: string,
  ): Promise<{ message: string }> {
    await this.userTierService.initializeDefaultTier(organizationId);
    return { message: 'Default tier initialized' };
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all organization tiers (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'All organization tiers retrieved' })
  async getAllOrganizationTiers(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserTierAllocationDto[]> {
    return this.userTierService.getAllOrganizationTiers(user as any);
  }
}
