import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Role Management')
@Controller('roles')
@ApiBearerAuth()
export class RoleController {
  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  async findAll() {
    return { success: true, data: [], message: 'Roles endpoint ready' };
  }

  @Post()
  @ApiOperation({ summary: 'Create role' })
  async create(@Body() dto: any) {
    return { success: true, message: 'Role creation ready' };
  }
}
