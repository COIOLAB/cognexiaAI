import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { OrganizationService, CreateOrganizationDto, UpdateOrganizationDto, OrganizationListFilter } from '../services/organization.service';
import { UserManagementService } from '../services/user-management.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, UserTypes } from '../guards/roles.guard';
import { UserType } from '../entities/user.entity';
import { OrganizationGuard, CurrentUser } from '../guards/organization.guard';
import { AuthenticatedUser } from '../guards/jwt.strategy';
import { OrganizationStatus, SubscriptionStatus } from '../entities/organization.entity';

/**
 * Organization Controller
 * Manages client organizations with CRUD operations and admin controls
 */
@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly userManagementService: UserManagementService,
  ) {}

  /**
   * Create New Organization
   * POST /organizations
   * Super admin only
   */
  @Post()
  @UseGuards(RolesGuard)
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    // Convert user to full User entity (in real app, fetch from DB)
    const createdBy: any = {
      id: user.id,
      email: user.email,
      userType: user.userType,
      firstName: 'System',
      lastName: 'Admin',
    };

    return this.organizationService.create(dto, createdBy);
  }

  /**
   * List All Organizations
   * GET /organizations
   * Super admin only - with filtering and pagination
   */
  @Get()
  @UseGuards(RolesGuard)
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: OrganizationStatus,
    @Query('subscriptionStatus') subscriptionStatus?: SubscriptionStatus,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const filter: OrganizationListFilter = {
      status,
      subscriptionStatus,
      search,
      page: page ? +page : 1,
      limit: limit ? +limit : 50,
    };

    const requestingUser: any = {
      id: user.id,
      userType: user.userType,
    };

    return this.organizationService.list(filter, requestingUser);
  }

  /**
   * Export Organizations to CSV
   * GET /organizations/export
   * Super admin only
   */
  @Get('export')
  @UseGuards(RolesGuard)
  @UserTypes(UserType.SUPER_ADMIN)
  async exportOrganizations(
    @Res() res: Response,
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: OrganizationStatus,
    @Query('search') search?: string,
    @Query('organizationId') organizationId?: string,
  ) {
    const csv = await this.organizationService.exportToCsv(
      { status, search, organizationId },
      { id: user.id, userType: user.userType } as any,
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=organizations-${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csv);
  }

  /**
   * Get Organization by ID
   * GET /organizations/:id
   * Super admin can view any, org admins can view their own
   */
  @Get(':id')
  @UseGuards(RolesGuard)
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    // Verify permission if not super admin
    if (user.userType !== UserType.SUPER_ADMIN && user.organizationId !== id) {
      throw new Error('Forbidden');
    }

    return this.organizationService.findById(id, user.id);
  }

  /**
   * Get Current User's Organization
   * GET /organizations/me
   * Org users can view their own organization
   */
  @Get('me/organization')
  async getMyOrganization(@CurrentUser() user: AuthenticatedUser) {
    if (!user.organizationId) {
      return null;
    }

    return this.organizationService.findById(user.organizationId, user.id);
  }

  /**
   * Update Organization
   * PUT /organizations/:id
   * Super admin can update any, org admins can update their own
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const updatedBy: any = {
      id: user.id,
      email: user.email,
      userType: user.userType,
      organizationId: user.organizationId,
      firstName: 'User',
      lastName: 'Name',
    };

    return this.organizationService.update(id, dto, updatedBy);
  }

  /**
   * Suspend Organization
   * POST /organizations/:id/suspend
   * Super admin only
   */
  @Post(':id/suspend')
  @UseGuards(RolesGuard)
  @UserTypes(UserType.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async suspend(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const suspendedBy: any = {
      id: user.id,
      email: user.email,
      userType: user.userType,
      firstName: 'System',
      lastName: 'Admin',
    };

    return this.organizationService.suspend(id, reason, suspendedBy);
  }

  /**
   * Activate Organization
   * POST /organizations/:id/activate
   * Super admin only
   */
  @Post(':id/activate')
  @UseGuards(RolesGuard)
  @UserTypes(UserType.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async activate(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const activatedBy: any = {
      id: user.id,
      email: user.email,
      userType: user.userType,
      firstName: 'System',
      lastName: 'Admin',
    };

    return this.organizationService.activate(id, activatedBy);
  }

  /**
   * Delete Organization
   * DELETE /organizations/:id
   * Super admin only - soft delete
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @UserTypes(UserType.SUPER_ADMIN)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const deletedBy: any = {
      id: user.id,
      email: user.email,
      userType: user.userType,
      firstName: 'System',
      lastName: 'Admin',
    };

    return this.organizationService.delete(id, deletedBy);
  }

  /**
   * Get Organization Statistics
   * GET /organizations/:id/statistics
   * Super admin and org admins
   */
  @Get(':id/statistics')
  @UseGuards(RolesGuard)
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async getStatistics(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    // Verify permission if not super admin
    if (user.userType !== UserType.SUPER_ADMIN && user.organizationId !== id) {
      throw new Error('Forbidden');
    }

    return this.organizationService.getStatistics(id);
  }

  /**
   * List organization users
   * GET /organizations/:id/users
   */
  @Get(':id/users')
  @UseGuards(RolesGuard)
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async listOrganizationUsers(
    @Param('id') id: string,
    @Query('search') search?: string,
    @Query('userType') userType?: UserType,
    @Query('isActive') isActive?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.userManagementService.listUsers(
      id,
      {
        search,
        userType,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        page: page ? +page : 1,
        limit: limit ? +limit : 50,
      },
      user as any,
    );
  }

  /**
   * Get seat usage for organization
   * GET /organizations/:id/seat-usage
   */
  @Get(':id/seat-usage')
  @UseGuards(RolesGuard)
  @UserTypes(UserType.SUPER_ADMIN, UserType.ORG_ADMIN)
  async getSeatUsage(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    if (user.userType !== UserType.SUPER_ADMIN && user.organizationId !== id) {
      throw new Error('Forbidden');
    }
    return this.organizationService.getSeatUsage(id);
  }

  /**
   * Update seat limit (super admin only)
   * PATCH /organizations/:id/seat-limit
   */
  @Patch(':id/seat-limit')
  @UseGuards(RolesGuard)
  @UserTypes(UserType.SUPER_ADMIN)
  async updateSeatLimit(
    @Param('id') id: string,
    @Body('newMaxUsers') newMaxUsers: number,
    @Body('reason') reason: string,
    @Body('paymentConfirmed') paymentConfirmed: boolean,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.organizationService.updateSeatLimit(
      id,
      newMaxUsers,
      user as any,
      reason,
      paymentConfirmed,
    );
  }

  /**
   * Create or reset organization admin user
   * POST /organizations/:id/admin-user
   */
  @Post(':id/admin-user')
  @UseGuards(RolesGuard)
  @UserTypes(UserType.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async upsertAdminUser(
    @Param('id') id: string,
    @Body() body: {
      adminEmail?: string;
      adminFirstName?: string;
      adminLastName?: string;
      adminPassword?: string;
      contactPersonName?: string;
      contactPersonEmail?: string;
    },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.organizationService.upsertOrgAdminUser(id, body, user as any);
  }
}
