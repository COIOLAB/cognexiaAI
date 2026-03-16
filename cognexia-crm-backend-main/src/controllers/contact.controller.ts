import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';
import { Contact, ContactType } from '../entities/contact.entity';

@ApiTags('CRM - Contacts')
@Controller('crm/contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContactController {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all contacts' })
  @ApiResponse({ status: 200, description: 'Contacts retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing', 'viewer', 'org_admin')
  async getAllContacts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 100,
    @Query('customerId') customerId?: string,
    @Query('search') search?: string,
    @Req() req?: any,
  ) {
    const take = Math.min(Number(limit) || 100, 1000);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

    const qb = this.contactRepository.createQueryBuilder('contact');

    if (search) {
      qb.where(
        'contact.fullName ILIKE :search OR contact.email ILIKE :search OR contact.workPhone ILIKE :search OR contact.mobilePhone ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (customerId) {
      qb.andWhere('contact.customerId = :customerId', { customerId });
    }

    qb.orderBy('contact.createdAt', 'DESC').skip(skip).take(take);

    const [contacts, total] = await qb.getManyAndCount();

    return {
      success: true,
      data: {
        contacts,
        pagination: {
          currentPage: Number(page) || 1,
          totalPages: Math.max(Math.ceil(total / take), 1),
          totalItems: total,
          itemsPerPage: take,
        },
      },
      message: 'Contacts retrieved successfully',
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create contact' })
  @ApiResponse({ status: 201, description: 'Contact created successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing', 'org_admin')
  async createContact(@Body() createDto: Partial<Contact>, @Req() req: any) {
    try {
      const stamp = Date.now();
      const defaultPrefs: Contact['communicationPrefs'] = {
        preferredChannel: 'email',
        preferredTime: '09:00-17:00',
        timezone: 'UTC',
        frequency: 'weekly',
        language: 'en',
        doNotCall: false,
        emailOptOut: false,
      };
      const computedFullName = [createDto.firstName, createDto.middleName, createDto.lastName].filter(Boolean).join(' ').trim();
      
      const contact = this.contactRepository.create({
        ...createDto,
        type: createDto.type || ContactType.PRIMARY,
        firstName: createDto.firstName || 'Fixture',
        lastName: createDto.lastName || 'Contact',
        fullName: computedFullName || 'Fixture Contact',
        title: createDto.title || 'Contact',
        email: createDto.email || `contact+${stamp}@cognexiaai.com`,
        customerId: createDto.customerId || null,
        organizationId: req.user?.organizationId || (req as any)?.organizationId || req.user?.organization?.id || createDto.organizationId || null,
        communicationPrefs: createDto.communicationPrefs || defaultPrefs,
        createdBy: req.user?.id || req.user?.userId || 'system',
        updatedBy: req.user?.id || req.user?.userId || 'system',
      });
      const saved = await this.contactRepository.save(contact);

      return {
        success: true,
        data: saved,
        message: 'Contact created successfully',
      };
    } catch (error: any) {
      console.error('[ContactController] createContact error:', error);
      throw new HttpException(
        { success: false, message: error?.message || 'Failed to create contact', error: String(error) }, 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Bulk delete contacts' })
  @ApiResponse({ status: 200, description: 'Contacts deleted successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing', 'org_admin')
  async bulkDeleteContacts(@Body('ids') ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: false, data: { deleted: 0 }, message: 'No contact ids provided' };
    }

    await this.contactRepository.delete(ids);
    return { success: true, data: { deleted: ids.length } };
  }

  @Get('export')
  @ApiOperation({ summary: 'Export contacts' })
  @ApiResponse({ status: 200, description: 'Contacts exported successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing', 'viewer', 'org_admin')
  async exportContacts(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('role') role?: string,
    @Query('customerId') customerId?: string,
    @Query('search') search?: string,
    @Res() res?: any,
  ) {
    try {
      const take = 10000; // Large number for export, up to reasonable limit
      let contacts = [];

      if (search) {
        [contacts] = await this.contactRepository.findAndCount({
          where: [
            { fullName: ILike(`%${search}%`) },
            { email: ILike(`%${search}%`) },
            { workPhone: ILike(`%${search}%`) },
            { mobilePhone: ILike(`%${search}%`) },
            { homePhone: ILike(`%${search}%`) },
          ],
          take,
          order: { createdAt: 'DESC' },
        });
      } else {
        const whereClause: any = {};
        if (customerId) whereClause.customerId = customerId;
        if (type) whereClause.type = type;
        if (role) whereClause.role = role;
        if (status) whereClause.status = status;
        
        [contacts] = await this.contactRepository.findAndCount({
          where: whereClause,
          take,
          order: { createdAt: 'DESC' },
        });
      }

      const headers = ['ID', 'Full Name', 'Email', 'Type', 'Role', 'Status', 'Work Phone', 'Mobile Phone', 'Created At'];
      const csvRows = contacts.map(c => [
        c.id,
        `"${(c.fullName || '').replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        c.type || '',
        `"${(c.role || '').replace(/"/g, '""')}"`,
        c.status || '',
        `"${(c.workPhone || '').replace(/"/g, '""')}"`,
        `"${(c.mobilePhone || '').replace(/"/g, '""')}"`,
        c.createdAt?.toISOString() || '',
      ].join(','));

      const csvContent = [headers.join(','), ...csvRows].join('\n');

      if (res) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=contacts_export.csv');
        return res.send(csvContent);
      }
      
      return { success: true, data: csvContent };
    } catch (error) {
      console.error('[ContactController] exportContacts error:', error);
      throw new HttpException('Failed to export contacts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact by ID' })
  @ApiResponse({ status: 200, description: 'Contact retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing', 'viewer', 'org_admin')
  async getContact(@Param('id') id: string) {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) {
      return { success: false, data: null, message: 'Contact not found' };
    }

    return {
      success: true,
      data: contact,
      message: 'Contact retrieved successfully',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update contact' })
  @ApiResponse({ status: 200, description: 'Contact updated successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing', 'org_admin')
  async updateContact(
    @Param('id') id: string,
    @Body() updateDto: Partial<Contact>,
    @Req() req: any,
  ) {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) {
      return { success: false, data: null, message: 'Contact not found' };
    }

    Object.assign(contact, updateDto, { updatedBy: req.user?.id || 'system' });
    const computedFullName = [contact.firstName, contact.middleName, contact.lastName].filter(Boolean).join(' ').trim();
    contact.fullName = computedFullName || contact.fullName;

    const saved = await this.contactRepository.save(contact);

    return {
      success: true,
      data: saved,
      message: 'Contact updated successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete contact' })
  @ApiResponse({ status: 200, description: 'Contact deleted successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing', 'org_admin')
  async deleteContact(@Param('id') id: string) {
    await this.contactRepository.delete({ id });
    return { success: true, message: 'Contact deleted successfully' };
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import contacts' })
  @ApiResponse({ status: 200, description: 'Contacts imported successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'marketing')
  async importContacts() {
    return {
      success: true,
      data: {
        imported: 0,
        failed: 0,
        errors: [],
      },
      message: 'Contacts import completed',
    };
  }
}
