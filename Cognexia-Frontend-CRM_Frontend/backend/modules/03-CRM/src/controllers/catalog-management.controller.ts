import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards, HttpException, HttpStatus, Req } from '@nestjs/common';
import { CatalogManagementService } from '../services/catalog-management.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('catalogs')
@UseGuards(JwtAuthGuard)
export class CatalogManagementController {
  constructor(private readonly service: CatalogManagementService) {}

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
  async getCatalogs(@Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getCatalogs(organizationId);
  }

  @Post()
  async createCatalog(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.createCatalog(data, organizationId);
  }

  @Get(':id')
  async getCatalog(@Param('id') id: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getCatalog(id, organizationId);
  }

  @Put(':id')
  async updateCatalog(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.updateCatalog(id, data, organizationId);
  }

  @Delete(':id')
  async deleteCatalog(@Param('id') id: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.deleteCatalog(id, organizationId);
  }

  @Post(':id/products')
  async addProduct(@Param('id') catalogId: string, @Body('productId') productId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.addProduct(catalogId, productId, organizationId);
  }

  @Delete(':id/products/:productId')
  async removeProduct(@Param('id') catalogId: string, @Param('productId') productId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.removeProduct(catalogId, productId, organizationId);
  }

  @Post(':id/publish')
  async publishCatalog(@Param('id') catalogId: string, @Body('channel') channel: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    const userId = this.getUserId(req);
    return this.service.publishCatalog(catalogId, channel, userId, organizationId);
  }

  @Get(':id/versions')
  async getVersions(@Param('id') catalogId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getVersions(catalogId, organizationId);
  }

  @Post(':id/duplicate')
  async duplicateCatalog(@Param('id') catalogId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    const userId = this.getUserId(req);
    return this.service.duplicateCatalog(catalogId, userId, organizationId);
  }

  @Get(':catalogId/items')
  async getCatalogItems(@Param('catalogId') catalogId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getCatalogItems(catalogId, organizationId);
  }

  @Post(':catalogId/items')
  async createCatalogItem(@Param('catalogId') catalogId: string, @Body() data: any, @Req() req: any) {
    try {
      const organizationId = this.getOrganizationId(req);
      const result = await this.service.createCatalogItem(catalogId, data, organizationId);
      if (!result) {
        throw new HttpException('Catalog not found', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(error.message || 'Failed to create catalog item', HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':catalogId/publish')
  async publishCatalogAlias(@Param('catalogId') catalogId: string, @Req() req: any) {
    try {
      const organizationId = this.getOrganizationId(req);
      const result = await this.service.publishCatalogSimple(catalogId, organizationId);
      if (!result) {
        throw new HttpException('Catalog not found', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(error.message || 'Failed to publish catalog', HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':catalogId/share')
  async shareCatalog(@Param('catalogId') catalogId: string, @Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.shareCatalog(catalogId, data.recipientOrgId, organizationId);
  }

  @Get(':catalogId/analytics')
  async getCatalogAnalytics(@Param('catalogId') catalogId: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getCatalogAnalytics(catalogId, organizationId);
  }
}
