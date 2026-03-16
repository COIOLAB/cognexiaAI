import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { StaffRole, StaffRoleType, StaffPermissions } from '../entities/staff-role.entity';
import { User, UserType } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

const DEFAULT_PERMISSIONS: Record<StaffRoleType, StaffPermissions> = {
  [StaffRoleType.SUPER_ADMIN]: {
    viewOrganizations: true,
    createOrganizations: true,
    editOrganizations: true,
    deleteOrganizations: true,
    suspendOrganizations: true,
    viewUsers: true,
    createUsers: true,
    editUsers: true,
    deleteUsers: true,
    manageUserTiers: true,
    viewFeatures: true,
    enableFeatures: true,
    disableFeatures: true,
    viewTickets: true,
    createTickets: true,
    assignTickets: true,
    resolveTickets: true,
    escalateTickets: true,
    viewAnalytics: true,
    viewUsageStats: true,
    viewRevenueReports: true,
    exportReports: true,
    viewBilling: true,
    manageBilling: true,
    processRefunds: true,
    viewSystemLogs: true,
    manageSystemSettings: true,
    viewAPILogs: true,
    viewStaff: true,
    inviteStaff: true,
    editStaffRoles: true,
    removeStaff: true,
  },
  [StaffRoleType.ADMIN]: {
    viewOrganizations: true,
    createOrganizations: true,
    editOrganizations: true,
    deleteOrganizations: true,
    suspendOrganizations: true,
    viewUsers: true,
    createUsers: true,
    editUsers: true,
    deleteUsers: true,
    manageUserTiers: true,
    viewFeatures: true,
    enableFeatures: true,
    disableFeatures: true,
    viewTickets: true,
    createTickets: true,
    assignTickets: true,
    resolveTickets: true,
    escalateTickets: true,
    viewAnalytics: true,
    viewUsageStats: true,
    viewRevenueReports: true,
    exportReports: true,
    viewBilling: true,
    manageBilling: false,
    processRefunds: false,
    viewSystemLogs: true,
    manageSystemSettings: false,
    viewAPILogs: true,
    viewStaff: true,
    inviteStaff: true,
    editStaffRoles: true,
    removeStaff: false,
  },
  [StaffRoleType.SUPPORT_MANAGER]: {
    viewOrganizations: true,
    viewTickets: true,
    createTickets: true,
    assignTickets: true,
    resolveTickets: true,
    escalateTickets: true,
    viewAnalytics: true,
    viewStaff: true,
  },
  [StaffRoleType.SUPPORT_AGENT]: {
    viewTickets: true,
    createTickets: true,
    resolveTickets: true,
  },
  [StaffRoleType.SALES_MANAGER]: {
    viewOrganizations: true,
    viewUsers: true,
    viewAnalytics: true,
    viewRevenueReports: true,
    manageBilling: true,
  },
  [StaffRoleType.ANALYST]: {
    viewOrganizations: true,
    viewAnalytics: true,
    viewUsageStats: true,
    viewRevenueReports: true,
    exportReports: true,
  },
  [StaffRoleType.BILLING_MANAGER]: {
    viewOrganizations: true,
    viewBilling: true,
    manageBilling: true,
    processRefunds: true,
    viewRevenueReports: true,
  },
  [StaffRoleType.DEVELOPER]: {
    viewOrganizations: true,
    viewSystemLogs: true,
    viewAPILogs: true,
    viewTickets: true,
  },
};

@Controller('staff')
@UseGuards(JwtAuthGuard)
export class StaffManagementController {
  constructor(
    @InjectRepository(StaffRole)
    private staffRoleRepository: Repository<StaffRole>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Get()
  async getAllStaff(@Query('role') role?: string, @Query('isActive') isActive?: string) {
    try {
      const where: any = {};
      if (role) where.role = role;
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const staffRoles = await this.staffRoleRepository.find({
        where,
        order: { createdAt: 'DESC' },
      });

      // Manually fetch users for each staff role
      const enrichedStaff = await Promise.all(
        staffRoles.map(async (staff) => {
          const user = await this.userRepository.findOne({
            where: { id: staff.userId },
          });

          return {
            id: staff.id,
            userId: staff.userId,
            email: user?.email || 'N/A',
            firstName: user?.firstName || 'Unknown',
            lastName: user?.lastName || 'User',
            role: staff.role,
            permissions: staff.permissions,
            assignedOrganizations: staff.assignedOrganizations,
            isActive: staff.isActive,
            createdAt: staff.createdAt,
          };
        })
      );

      return {
        success: true,
        data: enrichedStaff,
      };
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw new HttpException('Failed to fetch staff members', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getStaffMember(@Param('id') id: string) {
    const staffRole = await this.staffRoleRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!staffRole) {
      throw new HttpException('Staff member not found', HttpStatus.NOT_FOUND);
    }

    return {
      success: true,
      data: {
        ...staffRole,
        user: {
          id: staffRole.user?.id,
          email: staffRole.user?.email,
          firstName: staffRole.user?.firstName,
          lastName: staffRole.user?.lastName,
        },
      },
    };
  }

  @Post('invite')
  async inviteStaffMember(
    @Body()
    body: {
      email: string;
      firstName: string;
      lastName: string;
      role: StaffRoleType;
      assignedOrganizations?: string[];
      customPermissions?: Partial<StaffPermissions>;
    },
    @Request() req: any,
  ) {
    // Check if user already exists
    let user = await this.userRepository.findOne({
      where: { email: body.email },
    });

    if (!user) {
      // Create new user
      const tempPassword = Math.random().toString(36).slice(-12);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      user = this.userRepository.create({
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        passwordHash: hashedPassword,
        userType: UserType.SUPER_ADMIN, // All staff are super_admin type
        isActive: true,
      });

      await this.userRepository.save(user);

      // TODO: Send invitation email with temp password
      console.log(`📧 Invitation email should be sent to ${body.email} with password: ${tempPassword}`);
    }

    // Create or update staff role
    const permissions = {
      ...DEFAULT_PERMISSIONS[body.role],
      ...(body.customPermissions || {}),
    };

    const staffRole = this.staffRoleRepository.create({
      userId: user.id,
      role: body.role,
      permissions,
      assignedOrganizations: body.assignedOrganizations || null,
      isActive: true,
      createdBy: req.user.userId,
    });

    await this.staffRoleRepository.save(staffRole);

    return {
      success: true,
      message: 'Staff member invited successfully',
      data: {
        id: staffRole.id,
        userId: user.id,
        email: user.email,
        role: staffRole.role,
      },
    };
  }

  @Put(':id')
  async updateStaffMember(
    @Param('id') id: string,
    @Body()
    body: {
      role?: StaffRoleType;
      permissions?: Partial<StaffPermissions>;
      assignedOrganizations?: string[];
      isActive?: boolean;
      notes?: string;
    },
  ) {
    const staffRole = await this.staffRoleRepository.findOne({ where: { id } });

    if (!staffRole) {
      throw new HttpException('Staff member not found', HttpStatus.NOT_FOUND);
    }

    if (body.role) {
      staffRole.role = body.role;
      staffRole.permissions = {
        ...DEFAULT_PERMISSIONS[body.role],
        ...(body.permissions || {}),
      };
    } else if (body.permissions) {
      staffRole.permissions = {
        ...staffRole.permissions,
        ...body.permissions,
      };
    }

    if (body.assignedOrganizations !== undefined) {
      staffRole.assignedOrganizations = body.assignedOrganizations;
    }

    if (body.isActive !== undefined) {
      staffRole.isActive = body.isActive;
    }

    if (body.notes !== undefined) {
      staffRole.notes = body.notes;
    }

    staffRole.updatedAt = new Date();

    await this.staffRoleRepository.save(staffRole);

    return {
      success: true,
      message: 'Staff member updated successfully',
      data: staffRole,
    };
  }

  @Delete(':id')
  async deleteStaffMember(@Param('id') id: string) {
    const result = await this.staffRoleRepository.delete(id);

    if (result.affected === 0) {
      throw new HttpException('Staff member not found', HttpStatus.NOT_FOUND);
    }

    return {
      success: true,
      message: 'Staff member removed successfully',
    };
  }

  @Get('roles/available')
  async getAvailableRoles() {
    return {
      success: true,
      data: Object.values(StaffRoleType).map(role => ({
        role,
        permissions: DEFAULT_PERMISSIONS[role as StaffRoleType],
      })),
    };
  }

  @Get('user/:userId/permissions')
  async getUserPermissions(@Param('userId') userId: string) {
    const staffRole = await this.staffRoleRepository.findOne({
      where: { userId, isActive: true },
    });

    if (!staffRole) {
      throw new HttpException('Staff role not found', HttpStatus.NOT_FOUND);
    }

    return {
      success: true,
      data: {
        role: staffRole.role,
        permissions: staffRole.permissions,
        assignedOrganizations: staffRole.assignedOrganizations,
      },
    };
  }
}
