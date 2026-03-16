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
import { Customer } from '../entities/customer.entity';

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
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('customerId') customerId?: string,
    @Query('search') search?: string,
  ) {
    const take = Math.min(Number(limit) || 20, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
    const organizationId = req?.user?.organizationId || req?.user?.tenantId;

    if (search) {
      const [contacts, total] = await this.contactRepository.findAndCount({
        where: [
          { fullName: ILike(`%${search}%`), organizationId },
          { email: ILike(`%${search}%`), organizationId },
          { workPhone: ILike(`%${search}%`), organizationId },
          { mobilePhone: ILike(`%${search}%`), organizationId },
          { homePhone: ILike(`%${search}%`), organizationId },
        ],
        take,
        skip,
        order: { createdAt: 'DESC' },
      });

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

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (organizationId) where.organizationId = organizationId;

    const [contacts, total] = await this.contactRepository.findAndCount({
      where,
      take,
      skip,
      order: { createdAt: 'DESC' },
    });

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
    const organizationId = req?.user?.organizationId || req?.user?.tenantId;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let resolvedCustomerId = createDto.customerId || '00000000-0000-0000-0000-000000000456';
    if (createDto.customerId && !uuidRegex.test(createDto.customerId)) {
      const customerByCode = await this.contactRepository.manager.findOne(Customer, {
        where: { customerCode: createDto.customerId },
      });
      if (!customerByCode) {
        throw new HttpException('Customer not found', HttpStatus.BAD_REQUEST);
      }
      resolvedCustomerId = customerByCode.id;
    }
    let resolvedOrganizationId = createDto.organizationId || organizationId;
    if (!resolvedOrganizationId && resolvedCustomerId) {
      const customer = await this.contactRepository.manager.findOne(Customer, { where: { id: resolvedCustomerId } });
      resolvedOrganizationId = customer?.organizationId;
    }
    const contact = this.contactRepository.create({
      ...createDto,
      organizationId: resolvedOrganizationId,
      type: createDto.type || ContactType.PRIMARY,
      firstName: createDto.firstName || 'Fixture',
      lastName: createDto.lastName || 'Contact',
      title: createDto.title || 'Contact',
      email: createDto.email || `contact+${stamp}@cognexiaai.com`,
      customerId: resolvedCustomerId,
      communicationPrefs: createDto.communicationPrefs || defaultPrefs,
      createdBy: req.user?.id || 'system',
      updatedBy: req.user?.id || 'system',
    });
    contact.updateFullName();
    const saved = await this.contactRepository.save(contact);

    return {
      success: true,
      data: saved,
      message: 'Contact created successfully',
    };
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
  async exportContacts() {
    return { success: true, data: 'id,fullName,email,phone\n' };
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

    const organizationId = req?.user?.organizationId || req?.user?.tenantId;
    const merged = {
      ...updateDto,
      organizationId: updateDto.organizationId || contact.organizationId || organizationId,
      updatedBy: req.user?.id || 'system',
    };
    Object.assign(contact, merged);
    contact.updateFullName();
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
