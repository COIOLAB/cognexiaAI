import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SecurityComplianceService } from '../services/security-compliance.service';
import {
  GetSecurityEventsDto,
  SecurityDashboardDto,
  ResolveSecurityEventDto,
  IPBlocklistDto,
  ComplianceReportDto,
  RunComplianceCheckDto,
  TwoFactorStatusDto,
} from '../dto/security-compliance.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RBACGuard } from '../guards/rbac.guard';
import { Roles } from '../decorators/roles.decorator';
import { SecurityEvent } from '../entities/security-event.entity';
import { ComplianceCheck } from '../entities/compliance-check.entity';

@ApiTags('Security & Compliance')
@ApiBearerAuth()
@Controller('security-compliance')
// @UseGuards(JwtAuthGuard, RBACGuard)
// @Roles('super_admin')
export class SecurityComplianceController {
  constructor(private readonly securityService: SecurityComplianceService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get security dashboard overview' })
  @ApiResponse({ status: 200, type: SecurityDashboardDto })
  async getDashboard(): Promise<SecurityDashboardDto> {
    return this.securityService.getSecurityDashboard();
  }

  @Get('events')
  @ApiOperation({ summary: 'Get security events with filters' })
  @ApiResponse({ status: 200, type: [SecurityEvent] })
  async getEvents(@Query() query: GetSecurityEventsDto): Promise<SecurityEvent[]> {
    return this.securityService.getSecurityEvents(query);
  }

  @Post('events/resolve')
  @ApiOperation({ summary: 'Resolve a security event' })
  @ApiResponse({ status: 200, type: SecurityEvent })
  async resolveEvent(@Body() dto: ResolveSecurityEventDto, @Body('resolvedBy') resolvedBy: string): Promise<SecurityEvent> {
    return this.securityService.resolveSecurityEvent(dto, resolvedBy);
  }

  @Post('ip-blocklist/add')
  @ApiOperation({ summary: 'Block an IP address' })
  @ApiResponse({ status: 200 })
  async blockIP(@Body() dto: IPBlocklistDto) {
    this.securityService.blockIP(dto);
    return { success: true, message: `IP ${dto.ipAddress} blocked` };
  }

  @Post('ip-blocklist/remove/:ip')
  @ApiOperation({ summary: 'Unblock an IP address' })
  @ApiResponse({ status: 200 })
  async unblockIP(@Param('ip') ip: string) {
    this.securityService.unblockIP(ip);
    return { success: true, message: `IP ${ip} unblocked` };
  }

  @Get('ip-blocklist')
  @ApiOperation({ summary: 'Get all blocked IPs' })
  @ApiResponse({ status: 200 })
  async getBlockedIPs() {
    return this.securityService.getBlockedIPs();
  }

  @Get('compliance-report')
  @ApiOperation({ summary: 'Get compliance report for organizations' })
  @ApiResponse({ status: 200, type: [ComplianceReportDto] })
  async getComplianceReport(@Query('organizationId') organizationId?: string): Promise<ComplianceReportDto[]> {
    return this.securityService.getComplianceReport(organizationId);
  }

  @Post('compliance/run-check')
  @ApiOperation({ summary: 'Run compliance check' })
  @ApiResponse({ status: 200, type: ComplianceCheck })
  async runComplianceCheck(@Body() dto: RunComplianceCheckDto): Promise<ComplianceCheck> {
    return this.securityService.runComplianceCheck(dto);
  }

  @Get('mfa-status')
  @ApiOperation({ summary: 'Get two-factor authentication status' })
  @ApiResponse({ status: 200, type: TwoFactorStatusDto })
  async getMFAStatus(): Promise<TwoFactorStatusDto> {
    return this.securityService.getTwoFactorStatus();
  }
}
