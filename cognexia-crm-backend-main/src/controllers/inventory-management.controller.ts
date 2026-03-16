import { Controller, Post, Get, Put, Param, Body, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { InventoryManagementService } from '../services/inventory-management.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryManagementController {
  constructor(private readonly service: InventoryManagementService) {}

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

  @Get('stock-levels')
  async getStockLevels(@Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getStockLevels(organizationId);
  }

  @Put('stock-levels/:productId')
  async updateStock(@Param('productId') productId: string, @Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.updateStockLevel(productId, data, organizationId);
  }

  @Get('warehouses')
  async getWarehouses(@Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getWarehouses(organizationId);
  }

  @Post('warehouses')
  async createWarehouse(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.createWarehouse(data, organizationId);
  }

  @Post('transfers')
  async transferStock(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.transferStock(data, organizationId);
  }

  @Get('reorder-points')
  async getReorderPoints(@Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getReorderPoints(organizationId);
  }

  @Post('reorder-points')
  async setReorderPoint(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.setReorderPoint(data, organizationId);
  }

  @Post('audits')
  async performAudit(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    const payload = { ...data, auditedBy: data.auditedBy || this.getUserId(req) };
    return this.service.performAudit(payload.warehouseId, payload, organizationId);
  }

  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getAnalytics(organizationId);
  }

  @Post('items')
  async createItem(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.createItem(data, organizationId);
  }

  @Get('items')
  async getItems(@Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getItems(organizationId);
  }

  @Get('items/:id')
  async getItem(@Param('id') id: string, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getItem(id, organizationId);
  }

  @Put('items/:id')
  async updateItem(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.updateItem(id, data, organizationId);
  }

  @Post('items/:itemId/locations')
  async addItemLocation(@Param('itemId') itemId: string, @Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.addItemLocation(itemId, data, organizationId);
  }

  @Post('items/:itemId/movements')
  async recordMovement(@Param('itemId') itemId: string, @Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    const payload = { ...data, initiatedBy: data.initiatedBy || this.getUserId(req) };
    return this.service.recordMovement(itemId, payload, organizationId);
  }

  @Post('replenishment-orders')
  async createReplenishmentOrder(@Body() data: any, @Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    const payload = { ...data, initiatedBy: data.initiatedBy || this.getUserId(req) };
    return this.service.createReplenishmentOrder(payload, organizationId);
  }

  @Get('audit-logs')
  async getAuditLogs(@Req() req: any) {
    const organizationId = this.getOrganizationId(req);
    return this.service.getAuditLogs(organizationId);
  }
}
