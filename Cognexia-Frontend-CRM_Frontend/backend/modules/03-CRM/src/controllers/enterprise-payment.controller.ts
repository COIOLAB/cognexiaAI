import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import {
  EnterpriseBillingService,
  CreatePaymentDto,
  ApprovePaymentDto,
} from '../services/enterprise-billing.service';
import { PaymentStatus, ApprovalStatus } from '../entities/enterprise-payment.entity';

@ApiTags('Enterprise Payments')
@ApiBearerAuth()
@Controller('enterprise-payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnterprisePaymentController {
  constructor(private readonly billingService: EnterpriseBillingService) {}

  @Post()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new enterprise payment record' })
  @ApiResponse({ status: 201, description: 'Payment record created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 403, description: 'Organization not approved for enterprise billing' })
  async createPayment(@Body() data: CreatePaymentDto, @Request() req: any) {
    const userId = req.user?.sub || req.user?.userId;
    const payment = await this.billingService.createPaymentRecord(data, userId);
    
    return {
      success: true,
      data: payment,
      message: 'Payment record created successfully',
    };
  }

  @Get()
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get all enterprise payments with filters' })
  @ApiQuery({ name: 'organizationId', required: false })
  @ApiQuery({ name: 'paymentStatus', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'approvalStatus', required: false, enum: ApprovalStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async getPayments(
    @Query('organizationId') organizationId?: string,
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('approvalStatus') approvalStatus?: ApprovalStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.billingService.getPayments({
      organizationId,
      paymentStatus,
      approvalStatus,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
    });
    
    return {
      success: true,
      data: result.data,
      total: result.total,
      page: page || 1,
      limit: limit || 50,
      totalPages: Math.ceil(result.total / (limit || 50)),
    };
  }

  @Get('pending-approvals')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get all payments pending approval' })
  @ApiResponse({ status: 200, description: 'Pending approvals retrieved successfully' })
  async getPendingApprovals() {
    const result = await this.billingService.getPayments({
      approvalStatus: ApprovalStatus.PENDING,
      limit: 100,
    });
    
    return {
      success: true,
      data: result.data,
      total: result.total,
    };
  }

  @Get('overdue')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get all overdue payments' })
  @ApiResponse({ status: 200, description: 'Overdue payments retrieved successfully' })
  async getOverduePayments() {
    const overduePayments = await this.billingService.checkOverduePayments();
    
    return {
      success: true,
      data: overduePayments,
      total: overduePayments.length,
    };
  }

  @Get(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get payment details by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentById(@Param('id') paymentId: string) {
    const payment = await this.billingService.getPaymentById(paymentId);
    
    return {
      success: true,
      data: payment,
    };
  }

  @Post(':id/approve')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Approve a payment' })
  @ApiResponse({ status: 200, description: 'Payment approved successfully' })
  @ApiResponse({ status: 400, description: 'Payment already approved' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async approvePayment(
    @Param('id') paymentId: string,
    @Body() data: ApprovePaymentDto,
    @Request() req: any,
  ) {
    const superAdminId = req.user?.sub || req.user?.userId;
    const payment = await this.billingService.approvePayment(paymentId, superAdminId, data);
    
    return {
      success: true,
      data: payment,
      message: 'Payment approved successfully',
    };
  }

  @Post(':id/reject')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Reject a payment' })
  @ApiResponse({ status: 200, description: 'Payment rejected successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async rejectPayment(
    @Param('id') paymentId: string,
    @Body() body: { reason: string },
    @Request() req: any,
  ) {
    const superAdminId = req.user?.sub || req.user?.userId;
    const payment = await this.billingService.rejectPayment(
      paymentId,
      superAdminId,
      body.reason,
    );
    
    return {
      success: true,
      data: payment,
      message: 'Payment rejected',
    };
  }

  @Post(':id/mark-paid')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Mark payment as paid (full or partial)' })
  @ApiResponse({ status: 200, description: 'Payment marked as paid successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async markPaymentPaid(
    @Param('id') paymentId: string,
    @Body()
    data: {
      amountPaid: number;
      paymentProofUrl?: string;
      paymentReference?: string;
      notes?: string;
    },
    @Request() req: any,
  ) {
    const userId = req.user?.sub || req.user?.userId;
    const payment = await this.billingService.markPaymentPaid(paymentId, userId, data);
    
    return {
      success: true,
      data: payment,
      message: 'Payment marked as paid successfully',
    };
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Update payment details' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async updatePayment(
    @Param('id') paymentId: string,
    @Body() data: Partial<CreatePaymentDto>,
    @Request() req: any,
  ) {
    // For now, we'll use mark-paid for updates
    // You can extend this with a dedicated update method if needed
    return {
      success: true,
      message: 'Use specific endpoints for payment updates',
    };
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a payment record' })
  @ApiResponse({ status: 200, description: 'Payment deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete paid payment' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async deletePayment(@Param('id') paymentId: string, @Request() req: any) {
    const userId = req.user?.sub || req.user?.userId;
    await this.billingService.deletePayment(paymentId, userId);
    
    return {
      success: true,
      message: 'Payment deleted successfully',
    };
  }

  @Get('stats/pending-count')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get count of pending approvals' })
  @ApiResponse({ status: 200, description: 'Pending count retrieved successfully' })
  async getPendingCount() {
    const count = await this.billingService.getPendingApprovalsCount();
    
    return {
      success: true,
      data: { count },
    };
  }
}
