import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, HttpStatus } from '@nestjs/common';
import { InventoryService } from '../services/InventoryService';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Item Management
  @Post('items')
  @ApiOperation({ summary: 'Create inventory item' })
  @ApiResponse({ status: 201, description: 'Item created successfully' })
  async createItem(@Body() createItemDto: any, @Req() req: any) {
    return await this.inventoryService.createItem(createItemDto, req.user?.id || 'system');
  }

  @Get('items')
  @ApiOperation({ summary: 'Get inventory items' })
  async getItems(@Query() query: any, @Req() req: any) {
    const { page = 1, limit = 20, category, status, search, lowStock, location } = query;
    return await this.inventoryService.findAllItems(Number(page), Number(limit), {
      category,
      status,
      search,
      lowStock: lowStock === 'true',
      location
    });
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Get inventory item by ID' })
  async getItem(@Param('id') id: string) {
    return await this.inventoryService.findItemById(id);
  }

  @Put('items/:id')
  @ApiOperation({ summary: 'Update inventory item' })
  async updateItem(@Param('id') id: string, @Body() updateItemDto: any, @Req() req: any) {
    return await this.inventoryService.updateItem(id, updateItemDto, req.user?.id || 'system');
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Delete inventory item' })
  async deleteItem(@Param('id') id: string) {
    await this.inventoryService.deleteItem(id);
    return { message: 'Item deleted successfully' };
  }

  // Stock Management
  @Get('stock')
  @ApiOperation({ summary: 'Get stock information' })
  async getStock(@Query() query: any) {
    return await this.inventoryService.getStockTransactions(
      query.itemId,
      Number(query.page) || 1,
      Number(query.limit) || 10,
      {
        type: query.type,
        reason: query.reason,
        dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
        dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
        location: query.location
      }
    );
  }

  @Post('stock/adjust')
  @ApiOperation({ summary: 'Adjust stock quantity' })
  async adjustStock(@Body() adjustmentDto: any, @Req() req: any) {
    return await this.inventoryService.createInventoryAdjustment(adjustmentDto, req.user?.id || 'system');
  }

  @Post('stock/transfer')
  @ApiOperation({ summary: 'Transfer stock between locations' })
  async transferStock(@Body() transferDto: any, @Req() req: any) {
    return await this.inventoryService.createStockTransaction(transferDto, req.user?.id || 'system');
  }

  @Post('stock/receive')
  @ApiOperation({ summary: 'Receive stock' })
  async receiveStock(@Body() receiveDto: any, @Req() req: any) {
    return await this.inventoryService.createStockTransaction(receiveDto, req.user?.id || 'system');
  }

  @Post('stock/issue')
  @ApiOperation({ summary: 'Issue stock' })
  async issueStock(@Body() issueDto: any, @Req() req: any) {
    return await this.inventoryService.createStockTransaction(issueDto, req.user?.id || 'system');
  }

  // Cycle Count Management
  @Post('cycle-counts')
  @ApiOperation({ summary: 'Create cycle count' })
  async createCycleCount(@Body() cycleCountDto: any, @Req() req: any) {
    return await this.inventoryService.createCycleCount(cycleCountDto, req.user?.id || 'system');
  }

  @Get('cycle-counts')
  @ApiOperation({ summary: 'Get cycle counts' })
  async getCycleCounts(@Query() query: any) {
    const { page = 1, limit = 20, status, location } = query;
    // Will implement this method in the service
    return { message: 'Method to be implemented' };
  }

  @Put('cycle-counts/:id/complete')
  @ApiOperation({ summary: 'Complete cycle count' })
  async completeCycleCount(@Param('id') id: string, @Body() completeDto: any, @Req() req: any) {
    return await this.inventoryService.completeCycleCount(
      id,
      completeDto.actualQuantity,
      completeDto.notes,
      req.user?.id || 'system'
    );
  }

  // Analytics & Reports
  @Get('analytics')
  @ApiOperation({ summary: 'Get inventory analytics' })
  async getAnalytics(@Query() query: any) {
    return await this.inventoryService.getInventoryAnalytics(query.period || 'month');
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get active alerts' })
  async getAlerts() {
    return await this.inventoryService.getActiveAlerts();
  }

  @Put('alerts/:id/resolve')
  @ApiOperation({ summary: 'Resolve alert' })
  async resolveAlert(@Param('id') id: string, @Req() req: any) {
    return await this.inventoryService.resolveAlert(id, req.user?.id || 'system');
  }

  @Post('reports')
  @ApiOperation({ summary: 'Generate inventory report' })
  async generateReport(@Body() reportDto: any) {
    return await this.inventoryService.generateInventoryReport(reportDto);
  }

  // Stock Locations
  @Post('locations')
  @ApiOperation({ summary: 'Create stock location' })
  async createStockLocation(@Body() locationDto: any) {
    return await this.inventoryService.createStockLocation(locationDto);
  }

  // Reorder Points
  @Post('reorder-points')
  @ApiOperation({ summary: 'Create reorder point' })
  async createReorderPoint(@Body() reorderPointDto: any) {
    return await this.inventoryService.createReorderPoint(reorderPointDto);
  }

  // Health Check
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  async getHealth() {
    return await this.inventoryService.getHealthStatus();
  }
}
