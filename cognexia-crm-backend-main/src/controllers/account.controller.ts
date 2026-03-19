import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Header as SetHeader,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';
import { Account, AccountType } from '../entities/account.entity';

@ApiTags('CRM - Accounts')
@Controller('crm/accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AccountController {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  private normalizeAccountPayload(
    body: Partial<Account> & {
      description?: string;
      phone?: string;
      parentAccountId?: string;
    },
  ): Partial<Account> {
    const {
      description,
      phone,
      parentAccountId,
      parentAccount,
      details,
      ...rest
    } = body;

    const normalizedDescription =
      typeof description === 'string' ? description.trim() : details?.description;
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : details?.phone;
    const normalizedParentAccount =
      typeof parentAccountId === 'string' && parentAccountId.trim()
        ? parentAccountId.trim()
        : typeof parentAccount === 'string' && parentAccount.trim()
        ? parentAccount.trim()
        : undefined;

    const hasDescriptionInput = description !== undefined || details?.description !== undefined;
    const hasPhoneInput = phone !== undefined || details?.phone !== undefined;
    const normalizedDetails = details ? { ...details } : {};

    if (hasDescriptionInput) {
      if (normalizedDescription) {
        normalizedDetails.description = normalizedDescription;
      } else {
        delete normalizedDetails.description;
      }
    }

    if (hasPhoneInput) {
      if (normalizedPhone) {
        normalizedDetails.phone = normalizedPhone;
      } else {
        delete normalizedDetails.phone;
      }
    }

    return {
      ...rest,
      ...(normalizedParentAccount ? { parentAccount: normalizedParentAccount } : {}),
      ...(details || hasDescriptionInput || hasPhoneInput
        ? { details: normalizedDetails }
        : {}),
    };
  }

  private formatCsv(rows: Array<Array<string | number | null | undefined>>): string {
    const escape = (value: string | number | null | undefined) => {
      if (value === null || value === undefined) return '';
      const text = String(value);
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    return rows.map((row) => row.map(escape).join(',')).join('\n');
  }

  private resolveOrganizationId(req: any): string | undefined {
    const tenantHeader = req.headers?.['x-tenant-id'];
    const headerOrganizationId = Array.isArray(tenantHeader) ? tenantHeader[0] : tenantHeader;

    return req.user?.organizationId || req.user?.tenantId || headerOrganizationId;
  }

  private getTenantWhere(organizationId?: string): FindOptionsWhere<Account> {
    if (!organizationId) {
      return {};
    }

    const columns = this.accountRepository.metadata.columns.map((column) => column.propertyName);
    if (columns.includes('organizationId')) {
      return { organizationId } as FindOptionsWhere<Account>;
    }

    return {};
  }

  private async getVisibleAccounts(req: any): Promise<Account[]> {
    const organizationId = this.resolveOrganizationId(req);
    const tenantWhere = this.getTenantWhere(organizationId);
    let accounts = await this.accountRepository.find({ where: tenantWhere });

    if (
      !accounts.length &&
      organizationId &&
      tenantWhere.organizationId &&
      process.env.DEMO_ENABLED === 'true'
    ) {
      accounts = await this.accountRepository.find({
        where: [
          { organizationId } as FindOptionsWhere<Account>,
          { organizationId: IsNull() } as FindOptionsWhere<Account>,
        ],
      });
    }

    return accounts;
  }

  private filterAccounts(
    accounts: Account[],
    filters: {
      type?: string;
      status?: string;
      industry?: string;
      owner?: string;
      parentAccount?: string;
      minRevenue?: number;
      maxRevenue?: number;
      search?: string;
    },
  ): Account[] {
    const searchValue = filters.search?.trim().toLowerCase();
    const industryValue = filters.industry?.trim().toLowerCase();
    const ownerValue = filters.owner?.trim().toLowerCase();
    const parentAccountValue = filters.parentAccount?.trim().toLowerCase();
    const minRevenueValue =
      filters.minRevenue !== undefined ? Number(filters.minRevenue) : undefined;
    const maxRevenueValue =
      filters.maxRevenue !== undefined ? Number(filters.maxRevenue) : undefined;

    return accounts.filter((account) => {
      const revenue = Number(account.revenue || 0);
      const accountFields = [
        account.name,
        account.accountNumber,
        account.industry,
        account.owner,
      ]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      if (filters.type && account.type !== filters.type) {
        return false;
      }
      if (filters.status && account.status !== filters.status) {
        return false;
      }
      if (industryValue && !account.industry?.toLowerCase().includes(industryValue)) {
        return false;
      }
      if (ownerValue && !account.owner?.toLowerCase().includes(ownerValue)) {
        return false;
      }
      if (
        parentAccountValue &&
        !account.parentAccount?.toLowerCase().includes(parentAccountValue)
      ) {
        return false;
      }
      if (minRevenueValue !== undefined && revenue < minRevenueValue) {
        return false;
      }
      if (maxRevenueValue !== undefined && revenue > maxRevenueValue) {
        return false;
      }
      if (searchValue && !accountFields.some((value) => value.includes(searchValue))) {
        return false;
      }

      return true;
    });
  }

  private sortAccounts(
    accounts: Account[],
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): Account[] {
    const direction = (sortOrder || 'desc').toLowerCase() === 'asc' ? 1 : -1;
    const sortField = ['name', 'createdAt', 'revenue', 'priorityScore'].includes(sortBy || '')
      ? sortBy
      : 'createdAt';

    return [...accounts].sort((left, right) => {
      if (sortField === 'name') {
        return left.name.localeCompare(right.name) * direction;
      }

      if (sortField === 'revenue') {
        return (Number(left.revenue || 0) - Number(right.revenue || 0)) * direction;
      }

      if (sortField === 'priorityScore') {
        return (
          (Number(left.priorityScore || 0) - Number(right.priorityScore || 0)) * direction
        );
      }

      const leftCreatedAt = left.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightCreatedAt = right.createdAt ? new Date(right.createdAt).getTime() : 0;
      return (leftCreatedAt - rightCreatedAt) * direction;
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get accounts' })
  @ApiResponse({ status: 200, description: 'Accounts retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer', 'org_admin')
  async listAccounts(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('industry') industry?: string,
    @Query('owner') owner?: string,
    @Query('parentAccount') parentAccount?: string,
    @Query('minRevenue') minRevenue?: number,
    @Query('maxRevenue') maxRevenue?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const pageNumber = Number(page) || 1;
    const pageSize = Math.min(Number(limit) || 20, 100);
    const skip = (pageNumber - 1) * pageSize;
    const visibleAccounts = await this.getVisibleAccounts(req);
    const filteredAccounts = this.filterAccounts(visibleAccounts, {
      type,
      status,
      industry,
      owner,
      parentAccount,
      minRevenue,
      maxRevenue,
      search,
    });
    const sortedAccounts = this.sortAccounts(filteredAccounts, sortBy, sortOrder);
    const accounts = sortedAccounts.slice(skip, skip + pageSize);
    const total = filteredAccounts.length;

    return {
      success: true,
      data: accounts,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
        totalItems: total,
        itemsPerPage: pageSize,
      },
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get account statistics' })
  @ApiResponse({ status: 200, description: 'Account statistics retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer', 'org_admin')
  async getStats(@Req() req: any) {
    const accounts = await this.getVisibleAccounts(req);

    const total = accounts.length;
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byIndustry: Record<string, number> = {};

    let totalRevenue = 0;
    let totalPriority = 0;

    accounts.forEach((account) => {
      byType[account.type] = (byType[account.type] || 0) + 1;
      byStatus[account.status] = (byStatus[account.status] || 0) + 1;
      byIndustry[account.industry] = (byIndustry[account.industry] || 0) + 1;
      totalRevenue += Number(account.revenue || 0);
      totalPriority += Number(account.priorityScore || 0);
    });

    return {
      success: true,
      data: {
        total,
        byType,
        byStatus,
        byIndustry,
        totalRevenue,
        averageRevenue: total ? totalRevenue / total : 0,
        averagePriorityScore: total ? totalPriority / total : 0,
      },
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async createAccount(
    @Body()
    body: Partial<Account> & {
      description?: string;
      phone?: string;
      parentAccountId?: string;
    },
    @Req() req: any,
  ) {
    const actor = req.user?.id || req.user?.userId || 'system';
    const organizationId = this.resolveOrganizationId(req);
    const normalizedBody = this.normalizeAccountPayload(body);
    const accountNumber = normalizedBody.accountNumber || `ACC-${Date.now()}`;
    const fallbackName = normalizedBody.name || `Account ${Date.now()}`;
    const fallbackType = normalizedBody.type || AccountType.PROSPECT;
    const fallbackIndustry = normalizedBody.industry || 'General';
    const fallbackOwner = normalizedBody.owner || req.user?.email || 'system';

    const account = this.accountRepository.create({
      ...normalizedBody,
      organizationId: normalizedBody.organizationId || organizationId,
      accountNumber,
      name: normalizedBody.name || fallbackName,
      type: normalizedBody.type || fallbackType,
      industry: normalizedBody.industry || fallbackIndustry,
      owner: normalizedBody.owner || fallbackOwner,
      team: normalizedBody.team || [],
      details: normalizedBody.details || {},
      tags: normalizedBody.tags || [],
      createdBy: actor,
      updatedBy: actor,
    });

    const saved = await this.accountRepository.save(account);
    return { success: true, data: saved };
  }

  @Get('export')
  @SetHeader('Content-Type', 'text/csv')
  @SetHeader('Content-Disposition', 'attachment; filename=\"accounts.csv\"')
  @ApiOperation({ summary: 'Export accounts' })
  @ApiResponse({ status: 200, description: 'Accounts exported successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer', 'org_admin')
  async exportAccounts(
    @Req() req: any,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('industry') industry?: string,
    @Query('owner') owner?: string,
    @Query('parentAccount') parentAccount?: string,
    @Query('minRevenue') minRevenue?: number,
    @Query('maxRevenue') maxRevenue?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    const accounts = await this.getVisibleAccounts(req);
    const filtered = this.filterAccounts(accounts, {
      type,
      status,
      industry,
      owner,
      parentAccount,
      minRevenue: minRevenue !== undefined ? Number(minRevenue) : undefined,
      maxRevenue: maxRevenue !== undefined ? Number(maxRevenue) : undefined,
      search,
    });
    const sorted = this.sortAccounts(filtered, sortBy, sortOrder);

    const headers = [
      'id',
      'accountNumber',
      'name',
      'type',
      'status',
      'industry',
      'owner',
      'revenue',
      'createdAt',
    ];
    const rows = sorted.map((account) => [
      account.id,
      account.accountNumber,
      account.name,
      account.type,
      account.status,
      account.industry,
      account.owner,
      account.revenue,
      account.createdAt instanceof Date ? account.createdAt.toISOString() : account.createdAt,
    ]);

    return this.formatCsv([headers, ...rows]);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiResponse({ status: 200, description: 'Account retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer', 'org_admin')
  async getAccount(@Param('id') id: string) {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      return { success: false, data: null, message: 'Account not found' };
    }

    return { success: true, data: account };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update account' })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async updateAccount(
    @Param('id') id: string,
    @Body()
    body: Partial<Account> & {
      description?: string;
      phone?: string;
      parentAccountId?: string;
    },
    @Req() req: any,
  ) {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      return { success: false, data: null, message: 'Account not found' };
    }

    const actor = req.user?.id || req.user?.userId || 'system';
    const normalizedBody = this.normalizeAccountPayload(body);
    Object.assign(account, normalizedBody, { updatedBy: actor });

    const saved = await this.accountRepository.save(account);
    return { success: true, data: saved };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async deleteAccount(@Param('id') id: string) {
    await this.accountRepository.delete({ id });
    return { success: true, message: 'Account deleted successfully' };
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Bulk delete accounts' })
  @ApiResponse({ status: 200, description: 'Accounts deleted successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async bulkDelete(@Body('ids') ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: false, data: { deleted: 0 }, message: 'No account ids provided' };
    }
    await this.accountRepository.delete(ids);
    return { success: true, data: { deleted: ids.length } };
  }

  @Get(':id/hierarchy')
  @ApiOperation({ summary: 'Get account hierarchy' })
  @ApiResponse({ status: 200, description: 'Account hierarchy retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer', 'org_admin')
  async getHierarchy() {
    return { success: true, data: { parent: null, children: [], siblings: [] } };
  }

  @Get(':id/customers')
  @ApiOperation({ summary: 'Get account customers' })
  @ApiResponse({ status: 200, description: 'Account customers retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer', 'org_admin')
  async getCustomers() {
    return { success: true, data: [] };
  }

  @Get(':id/opportunities')
  @ApiOperation({ summary: 'Get account opportunities' })
  @ApiResponse({ status: 200, description: 'Account opportunities retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer', 'org_admin')
  async getOpportunities() {
    return { success: true, data: [] };
  }
}
