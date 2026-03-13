import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { IVRMenuService } from '../services/ivr-menu.service';
import { CreateIVRMenuDto, UpdateIVRMenuDto } from '../dto/telephony.dto';

@ApiTags('IVR Menus')
@Controller('ivr-menus')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class IVRMenuController {
  constructor(private readonly ivrMenuService: IVRMenuService) {}

  @Get()
  @ApiOperation({ summary: 'List IVR menus' })
  @ApiResponse({ status: 200, description: 'IVR menus retrieved' })
  async listMenus(@Request() req) {
    return this.ivrMenuService.listMenus(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get IVR menu by ID' })
  @ApiResponse({ status: 200, description: 'IVR menu retrieved' })
  async getMenu(@Request() req, @Param('id') id: string) {
    return this.ivrMenuService.getMenu(req.user.tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create IVR menu' })
  @ApiResponse({ status: 201, description: 'IVR menu created' })
  async createMenu(@Request() req, @Body() dto: CreateIVRMenuDto) {
    return this.ivrMenuService.createMenu(req.user.tenantId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update IVR menu' })
  @ApiResponse({ status: 200, description: 'IVR menu updated' })
  async updateMenu(@Request() req, @Param('id') id: string, @Body() dto: UpdateIVRMenuDto) {
    return this.ivrMenuService.updateMenu(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete IVR menu' })
  @ApiResponse({ status: 200, description: 'IVR menu deleted' })
  async deleteMenu(@Request() req, @Param('id') id: string) {
    return this.ivrMenuService.deleteMenu(req.user.tenantId, id);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test IVR menu' })
  @ApiResponse({ status: 200, description: 'IVR menu test initiated' })
  async testMenu(@Param('id') id: string) {
    return { message: 'IVR menu test initiated', id };
  }
}
