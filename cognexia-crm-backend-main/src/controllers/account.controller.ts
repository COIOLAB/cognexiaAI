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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
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

  @Get()
  @ApiOperation({ summary: 'Get accounts' })
  @ApiResponse({ status: 200, description: 'Accounts retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer', 'org_admin')
  async listAccounts(
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

    const queryBuilder = this.accountRepository.createQueryBuilder('account');

    if (type) {
      queryBuilder.andWhere('account.type = :type', { type });
    }
    if (status) {
      queryBuilder.andWhere('account.status = :status', { status });
    }
    if (industry) {
      queryBuilder.andWhere('account.industry ILIKE :industry', {
        industry: `%${industry}%`,
      });
    }
    if (owner) {
      queryBuilder.andWhere('account.owner ILIKE :owner', { owner: `%${owner}%` });
    }
    if (parentAccount) {
      queryBuilder.andWhere('account.parentAccount ILIKE :parentAccount', {
        parentAccount: `%${parentAccount}%`,
      });
    }
    if (minRevenue !== undefined) {
      queryBuilder.andWhere('account.revenue >= :minRevenue', { minRevenue });
    }
    if (maxRevenue !== undefined) {
      queryBuilder.andWhere('account.revenue <= :maxRevenue', { maxRevenue });
    }
    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('account.name ILIKE :search', { search: `%${search}%` })
            .orWhere('account.accountNumber ILIKE :search', { search: `%${search}%` })
            .orWhere('account.industry ILIKE :search', { search: `%${search}%` })
            .orWhere('account.owner ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    const orderField = ['name', 'createdAt', 'revenue', 'priorityScore'].includes(sortBy || '')
      ? `account.${sortBy}`
      : 'account.createdAt';
    const orderDirection = (sortOrder || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder.orderBy(orderField, orderDirection as 'ASC' | 'DESC');
    queryBuilder.skip(skip).take(pageSize);

    const [accounts, total] = await queryBuilder.getManyAndCount();

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
  async getStats() {
    const accounts = await this.accountRepository.find();

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
  async createAccount(@Body() body: Partial<Account>, @Req() req: any) {
    const actor = req.user?.id || req.user?.userId || 'system';
    const accountNumber = body.accountNumber || `ACC-${Date.now()}`;
    const fallbackName = body.name || `Account ${Date.now()}`;
    const fallbackType = body.type || AccountType.PROSPECT;
    const fallbackIndustry = body.industry || 'General';
    const fallbackOwner = body.owner || req.user?.email || 'system';

    const account = this.accountRepository.create({
      ...body,
      accountNumber,
      name: body.name || fallbackName,
      type: body.type || fallbackType,
      industry: body.industry || fallbackIndustry,
      owner: body.owner || fallbackOwner,
      details: body.details || {},
      tags: body.tags || [],
      createdBy: actor,
      updatedBy: actor,
    });

    const saved = await this.accountRepository.save(account);
    return { success: true, data: saved };
  }

  @Get('export')
  @ApiOperation({ summary: 'Export accounts' })
  @ApiResponse({ status: 200, description: 'Accounts exported successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer', 'org_admin')
  async exportAccounts() {
    return {
      success: true,
      data: 'id,accountNumber,name\n',
    };
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
  async updateAccount(@Param('id') id: string, @Body() body: Partial<Account>, @Req() req: any) {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      return { success: false, data: null, message: 'Account not found' };
    }

    const actor = req.user?.id || req.user?.userId || 'system';
    Object.assign(account, body, { updatedBy: actor });

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
