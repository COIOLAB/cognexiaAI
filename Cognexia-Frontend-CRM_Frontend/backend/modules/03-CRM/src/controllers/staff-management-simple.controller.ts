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
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export enum StaffRoleType {
  SUPER_ADMIN = 'super_admin',
  SUPPORT_MANAGER = 'support_manager',
  SUPPORT_AGENT = 'support_agent',
  BILLING_ADMIN = 'billing_admin',
  ANALYTICS_VIEWER = 'analytics_viewer',
  TECHNICAL_SPECIALIST = 'technical_specialist',
}

@Controller('staff')
@UseGuards(JwtAuthGuard)
export class StaffManagementSimpleController {
  @Get()
  async getAllStaff(@Query('role') role?: string, @Query('isActive') isActive?: string) {
    // Return mock data for now
    const mockStaff = [
      {
        id: '1',
        userId: 'user-1',
        email: 'superadmin@cognexiaai.com',
        firstName: 'Super',
        lastName: 'Admin',
        role: StaffRoleType.SUPER_ADMIN,
        permissions: { canViewAllOrganizations: true, canManageStaff: true },
        assignedOrganizations: null,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        userId: 'user-2',
        email: 'support@cognexiaai.com',
        firstName: 'Support',
        lastName: 'Manager',
        role: StaffRoleType.SUPPORT_MANAGER,
        permissions: { canViewAllTickets: true, canAssignTickets: true },
        assignedOrganizations: null,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];

    let filtered = mockStaff;
    if (role) filtered = filtered.filter(s => s.role === role);
    if (isActive !== undefined) filtered = filtered.filter(s => s.isActive === (isActive === 'true'));

    return { success: true, data: filtered };
  }

  @Get('roles/available')
  async getAvailableRoles() {
    return {
      success: true,
      data: Object.values(StaffRoleType).map(role => ({
        role,
        displayName: role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      })),
    };
  }

  @Get('roles')
  async getRoles() {
    // Alias for getAvailableRoles
    return this.getAvailableRoles();
  }

  @Post('invite')
  async inviteStaffMember(@Body() body: any, @Request() req: any) {
    return {
      success: true,
      message: 'Staff member invited successfully (demo mode)',
      data: {
        id: Date.now().toString(),
        userId: Date.now().toString(),
        email: body.email,
        role: body.role,
      },
    };
  }

  @Get(':id')
  async getStaffMember(@Param('id') id: string) {
    return {
      success: true,
      data: {
        id,
        userId: 'user-1',
        email: 'superadmin@cognexiaai.com',
        firstName: 'Super',
        lastName: 'Admin',
        role: StaffRoleType.SUPER_ADMIN,
        permissions: { canViewAllOrganizations: true },
        assignedOrganizations: null,
        isActive: true,
      },
    };
  }

  @Put(':id')
  async updateStaffMember(@Param('id') id: string, @Body() body: any) {
    return {
      success: true,
      message: 'Staff member updated (demo mode)',
    };
  }

  @Delete(':id')
  async deleteStaffMember(@Param('id') id: string) {
    return {
      success: true,
      message: 'Staff member removed (demo mode)',
    };
  }
}
