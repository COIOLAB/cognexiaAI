import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { EnterpriseBillingService, BillingConfigDto } from '../services/enterprise-billing.service';

@ApiTags('Organization Billing')
@ApiBearerAuth()
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationBillingController {
  constructor(private readonly billingService: EnterpriseBillingService) {}

  @Patch(':id/billing-config')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Configure billing type and enterprise agreement for organization' })
  @ApiResponse({ status: 200, description: 'Billing configuration updated successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async configureBilling(
    @Param('id') organizationId: string,
    @Body() config: BillingConfigDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || req.user?.userId;
    const organization = await this.billingService.configureBilling(
      organizationId,
      config,
      userId,
    );
    
    return {
      success: true,
      data: organization,
      message: 'Billing configuration updated successfully',
    };
  }

  @Get(':id/billing-config')
  @Roles('SUPER_ADMIN', 'ORG_ADMIN')
  @ApiOperation({ summary: 'Get billing configuration for organization' })
  @ApiResponse({ status: 200, description: 'Billing configuration retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getBillingConfig(@Param('id') organizationId: string) {
    const organization = await this.billingService.getBillingConfig(organizationId);
    
    return {
      success: true,
      data: {
        billingType: organization.billingType,
        enterpriseAgreement: organization.enterpriseAgreement,
        requiresApproval: organization.requiresApproval,
        approvalStatus: organization.approvalStatus,
        approvedBy: organization.approvedBy,
        approvedAt: organization.approvedAt,
        manualBillingEnabled: organization.manualBillingEnabled,
      },
    };
  }

  @Post(':id/approve-billing')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Approve enterprise billing for organization' })
  @ApiResponse({ status: 200, description: 'Organization billing approved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request or organization already approved' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async approveBilling(@Param('id') organizationId: string, @Request() req: any) {
    const superAdminId = req.user?.sub || req.user?.userId;
    const organization = await this.billingService.approveOrganization(
      organizationId,
      superAdminId,
    );
    
    return {
      success: true,
      data: organization,
      message: 'Enterprise billing approved successfully',
    };
  }

  @Post(':id/reject-billing')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Reject enterprise billing for organization' })
  @ApiResponse({ status: 200, description: 'Organization billing rejected successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async rejectBilling(
    @Param('id') organizationId: string,
    @Body() body: { reason: string },
    @Request() req: any,
  ) {
    const superAdminId = req.user?.sub || req.user?.userId;
    const organization = await this.billingService.rejectOrganization(
      organizationId,
      superAdminId,
      body.reason,
    );
    
    return {
      success: true,
      data: organization,
      message: 'Enterprise billing rejected',
    };
  }
}
