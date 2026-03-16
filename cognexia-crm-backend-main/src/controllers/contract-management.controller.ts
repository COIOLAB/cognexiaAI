import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards, HttpException, HttpStatus, Req } from '@nestjs/common';
import { ContractManagementService } from '../services/contract-management.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('contracts')
@UseGuards(JwtAuthGuard)
export class ContractManagementController {
  constructor(private readonly service: ContractManagementService) {}

  private getOrganizationId(req: any) {
    const organizationId =
      req.user?.organizationId ||
      req.user?.tenantId ||
      req.body?.organizationId ||
      req.query?.organizationId;
    if (!organizationId) {
      throw new HttpException('Organization context missing', HttpStatus.BAD_REQUEST);
    }
    return organizationId;
  }

  private getUserId(req: any) {
    return req.user?.id || req.user?.userId || 'system';
  }

  @Get()
  async getContracts(@Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getContracts(organizationId);
  }

  @Get('templates')
  async getTemplates(@Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getTemplates(organizationId);
  }

  @Post()
  async createContract(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.createContract(data, organizationId);
  }

  @Get(':id')
  async getContract(@Param('id') id: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getContract(id, organizationId);
  }

  @Put(':id')
  async updateContract(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    try {
      const organizationId = this.getOrganizationId(req);
      const result = await this.service.updateContract(id, data, organizationId);
      return result || { success: false, message: 'Contract not found' };
    } catch (error) {
      return { success: false, message: 'Failed to update contract', error: error.message };
    }
  }

  @Delete(':id')
  async deleteContract(@Param('id') id: string, @Req() req: any) {
    try {
      const organizationId = this.getOrganizationId(req);
      await this.service.deleteContract(id, organizationId);
      return { success: true, message: 'Contract deleted successfully' };
    } catch (error) {
      return { success: false, message: error?.message || 'Contract not found', data: null };
    }
  }

  @Post(':id/renewals')
  async renewContract(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.renewContract(id, data, organizationId);
  }

  @Post(':id/amendments')
  async createAmendment(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.createAmendment(id, data, organizationId);
  }

  @Get(':id/e-signature')
  async getESignature(@Param('id') id: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getESignatureStatus(id, organizationId);
  }

  @Post(':id/approve')
  async approveContract(@Param('id') id: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    const userId = this.getUserId(req);
    return this.service.approveContract(id, userId, organizationId);
  }

  @Post(':contractId/approve')
  async approveContractAlias(@Param('contractId') contractId: string, @Req() req: any) {
    try {
      const organizationId = this.getOrganizationId(req);
      const userId = this.getUserId(req);
      const result = await this.service.approveContract(contractId, userId, organizationId);
      if (!result) {
        throw new HttpException('Contract not found', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(error.message || 'Failed to approve contract', HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':contractId/clauses')
  async addClause(@Param('contractId') contractId: string, @Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.addClause(contractId, data, organizationId);
  }

  @Post(':contractId/renew')
  async renewContractAlias(@Param('contractId') contractId: string, @Body() data: any, @Req() req: any) {
    try {
      const organizationId = this.getOrganizationId(req);
      const result = await this.service.renewContract(contractId, data || {}, organizationId);
      return result || { success: false, message: 'Contract not found' };
    } catch (error) {
      return { success: false, message: 'Failed to renew contract', error: error.message };
    }
  }

  @Post(':contractId/sign')
  async signContract(@Param('contractId') contractId: string, @Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.signContract(contractId, data, organizationId);
  }

  @Get(':contractId/version-history')
  async getVersionHistory(@Param('contractId') contractId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getVersionHistory(contractId, organizationId);
  }
}
