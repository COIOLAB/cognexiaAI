import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
  Header,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';
import { SalesOrderService } from '../services/sales-order.service';

@ApiTags('Sales Orders')
@Controller('sales/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SalesOrderController {
  constructor(private readonly salesOrderService: SalesOrderService) {}

  @Get()
  @ApiOperation({ summary: 'Get sales orders' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'customerId', required: false })
  @ApiQuery({ name: 'salesRepId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer', 'org_admin')
  async getOrders(@Query() query: any) {
    try {
      const result = this.salesOrderService.list(query);
      return { success: true, ...result };
    } catch (error) {
      throw new HttpException('Failed to retrieve orders', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get sales order stats' })
  @ApiResponse({ status: 200, description: 'Order stats retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer', 'org_admin')
  async getOrderStats() {
    try {
      const stats = this.salesOrderService.stats();
      return { success: true, data: stats };
    } catch (error) {
      throw new HttpException('Failed to retrieve order stats', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="orders.csv"')
  @ApiOperation({ summary: 'Export sales orders' })
  @ApiResponse({ status: 200, description: 'Orders exported successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async exportOrders(@Query() query: any) {
    try {
      return this.salesOrderService.export(query);
    } catch (error) {
      throw new HttpException('Failed to export orders', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sales order by ID' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'viewer', 'org_admin')
  async getOrder(@Param('id') id: string) {
    const order = this.salesOrderService.getById(id);
    if (!order) {
      return { success: false, data: null, message: 'Order not found' };
    }
    return { success: true, data: order };
  }

  @Post()
  @ApiOperation({ summary: 'Create sales order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async createOrder(@Body() body: any) {
    try {
      const order = this.salesOrderService.create(body);
      return { success: true, data: order };
    } catch (error) {
      throw new HttpException('Failed to create order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update sales order' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async updateOrder(@Param('id') id: string, @Body() body: any) {
    try {
      const order = this.salesOrderService.update(id, body);
      return { success: true, data: order };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { success: false, data: null, message: error.message };
      }
      throw new HttpException('Failed to update order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel sales order' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async cancelOrder(@Param('id') id: string, @Body() body: { reason?: string }) {
    try {
      const order = this.salesOrderService.cancel(id, body?.reason);
      return { success: true, data: order };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { success: false, data: null, message: error.message };
      }
      throw new HttpException('Failed to cancel order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm sales order' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order confirmed successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async confirmOrder(@Param('id') id: string) {
    try {
      const order = this.salesOrderService.confirm(id);
      return { success: true, data: order };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { success: false, data: null, message: error.message };
      }
      throw new HttpException('Failed to confirm order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/ship')
  @ApiOperation({ summary: 'Ship sales order' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order shipped successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async shipOrder(@Param('id') id: string, @Body() body: { trackingNumber: string }) {
    try {
      const order = this.salesOrderService.ship(id, body?.trackingNumber);
      return { success: true, data: order };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { success: false, data: null, message: error.message };
      }
      throw new HttpException('Failed to ship order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/deliver')
  @ApiOperation({ summary: 'Deliver sales order' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order delivered successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep', 'org_admin')
  async deliverOrder(@Param('id') id: string) {
    try {
      const order = this.salesOrderService.deliver(id);
      return { success: true, data: order };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { success: false, data: null, message: error.message };
      }
      throw new HttpException('Failed to deliver order', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('bulk-cancel')
  @ApiOperation({ summary: 'Bulk cancel sales orders' })
  @ApiResponse({ status: 200, description: 'Orders cancelled successfully' })
  @Roles('admin', 'manager', 'sales_manager', 'sales_rep')
  async bulkCancel(@Body() body: { ids: string[] }) {
    try {
      const result = this.salesOrderService.bulkCancel(body?.ids || []);
      return { success: true, data: result };
    } catch (error) {
      throw new HttpException('Failed to cancel orders', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
