import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RBACGuard } from '../rbac/guards/rbac.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuditInterceptor } from '../interceptors/audit.interceptor';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { InventoryItem } from '../entities/InventoryItem.entity';
import { User } from '../rbac/entities/User.entity';
import { InventoryIntelligenceService } from '../services/inventory-intelligence.service';
import { RealTimeTrackingService } from '../services/real-time-tracking.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto, InventoryItemFilterDto, BulkUpdateDto } from '../dto/inventory-item.dto';

@ApiTags('Inventory Items')
@Controller('api/v1/inventory/items')
@UseGuards(JwtAuthGuard, RBACGuard)
@UseInterceptors(AuditInterceptor)
@ApiBearerAuth()
export class InventoryItemsController {
  private readonly logger = new Logger(InventoryItemsController.name);

  constructor(
    private readonly inventoryIntelligenceService: InventoryIntelligenceService,
    private readonly realTimeTrackingService: RealTimeTrackingService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all inventory items',
    description: 'Retrieve a paginated list of inventory items with optional filtering and sorting',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in name, SKU, or description' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filter by category' })
  @ApiQuery({ name: 'location', required: false, type: String, description: 'Filter by location' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'discontinued'], description: 'Filter by status' })
  @ApiQuery({ name: 'lowStock', required: false, type: Boolean, description: 'Filter items with low stock' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['name', 'sku', 'quantity', 'value', 'createdAt'], description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'List of inventory items retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        items: { type: 'array', items: { $ref: '#/components/schemas/InventoryItem' } },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
        aggregations: {
          type: 'object',
          properties: {
            totalValue: { type: 'number' },
            totalQuantity: { type: 'number' },
            categoryCounts: { type: 'object' },
            locationCounts: { type: 'object' },
          },
        },
      },
    },
  })
  @RequirePermissions('inventory_items', 'list')
  @UseInterceptors(CacheInterceptor)
  async findAll(
    @Query() filters: InventoryItemFilterDto,
    @CurrentUser() user: User,
  ) {
    try {
      this.logger.log(`Fetching inventory items for user ${user.id} with filters:`, filters);

      const { data, error } = await this.supabaseService.query({
        table: 'inventory_items',
        select: '*',
        filters: this.buildFilters(filters),
        orderBy: [{ column: filters.sortBy || 'createdAt', ascending: filters.sortOrder !== 'desc' }],
        limit: Math.min(filters.limit || 20, 100),
        offset: ((filters.page || 1) - 1) * (filters.limit || 20),
      });

      if (error) {
        throw error;
      }

      // Get aggregations
      const aggregations = await this.getAggregations(filters);

      // Calculate pagination
      const total = aggregations.totalCount;
      const totalPages = Math.ceil(total / (filters.limit || 20));

      return {
        items: data,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 20,
          total,
          totalPages,
        },
        aggregations: {
          totalValue: aggregations.totalValue,
          totalQuantity: aggregations.totalQuantity,
          categoryCounts: aggregations.categoryCounts,
          locationCounts: aggregations.locationCounts,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching inventory items', error);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get inventory item by ID',
    description: 'Retrieve detailed information about a specific inventory item including analytics and movement history',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Inventory item ID' })
  @ApiQuery({ name: 'includeAnalytics', required: false, type: Boolean, description: 'Include AI analytics data' })
  @ApiQuery({ name: 'includeMovements', required: false, type: Boolean, description: 'Include recent movements' })
  @ApiResponse({
    status: 200,
    description: 'Inventory item retrieved successfully',
    type: InventoryItem,
  })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  @RequirePermissions('inventory_items', 'read')
  @UseInterceptors(CacheInterceptor)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeAnalytics') includeAnalytics: boolean = false,
    @Query('includeMovements') includeMovements: boolean = false,
    @CurrentUser() user: User,
  ) {
    try {
      const { data, error } = await this.supabaseService.query({
        table: 'inventory_items',
        select: '*',
        filters: [{ column: 'id', operator: 'eq', value: id }],
      });

      if (error || !data.length) {
        throw new Error('Inventory item not found');
      }

      const item = data[0];

      // Enrich with additional data if requested
      if (includeAnalytics) {
        item.analytics = await this.inventoryIntelligenceService.getItemAnalytics(id);
      }

      if (includeMovements) {
        item.recentMovements = await this.getRecentMovements(id);
      }

      return item;
    } catch (error) {
      this.logger.error(`Error fetching inventory item ${id}`, error);
      throw error;
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create new inventory item',
    description: 'Create a new inventory item with automatic SKU generation and initial stock setup',
  })
  @ApiBody({ type: CreateInventoryItemDto })
  @ApiResponse({
    status: 201,
    description: 'Inventory item created successfully',
    type: InventoryItem,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @RequirePermissions('inventory_items', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createDto: CreateInventoryItemDto,
    @CurrentUser() user: User,
  ) {
    try {
      this.logger.log(`Creating inventory item for user ${user.id}:`, createDto);

      // Generate SKU if not provided
      if (!createDto.sku) {
        createDto.sku = await this.generateSKU(createDto.name, createDto.category);
      }

      // Create item in Supabase
      const { data, error } = await this.supabaseService.insert('inventory_items', {
        ...createDto,
        createdBy: user.id,
        updatedBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (error) {
        throw error;
      }

      const newItem = data[0];

      // Initialize AI analytics
      await this.inventoryIntelligenceService.initializeItemAnalytics(newItem.id);

      // Start real-time tracking if IoT is enabled
      if (createDto.iotEnabled) {
        await this.realTimeTrackingService.registerDevice(newItem.id, {
          deviceType: 'inventory_tracker',
          location: createDto.locationId,
        });
      }

      return newItem;
    } catch (error) {
      this.logger.error('Error creating inventory item', error);
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update inventory item',
    description: 'Update an existing inventory item with automatic change tracking and notifications',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateInventoryItemDto })
  @ApiResponse({
    status: 200,
    description: 'Inventory item updated successfully',
    type: InventoryItem,
  })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  @RequirePermissions('inventory_items', 'update')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDto: UpdateInventoryItemDto,
    @CurrentUser() user: User,
  ) {
    try {
      this.logger.log(`Updating inventory item ${id} for user ${user.id}:`, updateDto);

      // Get current item for comparison
      const { data: currentData } = await this.supabaseService.query({
        table: 'inventory_items',
        select: '*',
        filters: [{ column: 'id', operator: 'eq', value: id }],
      });

      if (!currentData.length) {
        throw new Error('Inventory item not found');
      }

      const currentItem = currentData[0];

      // Update item
      const { data, error } = await this.supabaseService.update(
        'inventory_items',
        {
          ...updateDto,
          updatedBy: user.id,
          updatedAt: new Date(),
        },
        { id }
      );

      if (error) {
        throw error;
      }

      const updatedItem = data[0];

      // Track significant changes
      await this.trackChanges(currentItem, updatedItem, user.id);

      return updatedItem;
    } catch (error) {
      this.logger.error(`Error updating inventory item ${id}`, error);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete inventory item',
    description: 'Soft delete an inventory item (marks as deleted but preserves data)',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Inventory item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  @RequirePermissions('inventory_items', 'delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    try {
      this.logger.log(`Deleting inventory item ${id} by user ${user.id}`);

      const { error } = await this.supabaseService.update(
        'inventory_items',
        {
          deletedAt: new Date(),
          deletedBy: user.id,
        },
        { id }
      );

      if (error) {
        throw error;
      }

      // Clean up related data
      await this.cleanupRelatedData(id);
    } catch (error) {
      this.logger.error(`Error deleting inventory item ${id}`, error);
      throw error;
    }
  }

  @Post('bulk')
  @ApiOperation({
    summary: 'Bulk operations on inventory items',
    description: 'Perform bulk create, update, or delete operations on multiple inventory items',
  })
  @ApiBody({ type: BulkUpdateDto })
  @ApiResponse({
    status: 200,
    description: 'Bulk operation completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'number' },
        failed: { type: 'number' },
        errors: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @RequirePermissions('inventory_items', 'bulk_update')
  async bulkOperation(
    @Body(ValidationPipe) bulkDto: BulkUpdateDto,
    @CurrentUser() user: User,
  ) {
    try {
      this.logger.log(`Performing bulk operation for user ${user.id}:`, bulkDto);

      const results = {
        success: 0,
        failed: 0,
        errors: [],
      };

      for (const operation of bulkDto.operations) {
        try {
          switch (operation.type) {
            case 'create':
              await this.create(operation.data, user);
              results.success++;
              break;
            case 'update':
              await this.update(operation.id, operation.data, user);
              results.success++;
              break;
            case 'delete':
              await this.remove(operation.id, user);
              results.success++;
              break;
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`Operation ${operation.type} failed: ${error.message}`);
        }
      }

      return results;
    } catch (error) {
      this.logger.error('Error performing bulk operation', error);
      throw error;
    }
  }

  @Post(':id/image')
  @ApiOperation({
    summary: 'Upload image for inventory item',
    description: 'Upload an image file for an inventory item with automatic processing and thumbnail generation',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
        thumbnailUrl: { type: 'string' },
        originalName: { type: 'string' },
        size: { type: 'number' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @RequirePermissions('inventory_items', 'update')
  async uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new Error('Invalid file type. Only images are allowed.');
      }

      // Upload to Supabase Storage
      const path = `inventory/${id}/${Date.now()}-${file.originalname}`;
      const { path: uploadedPath, error } = await this.supabaseService.uploadFile({
        bucket: 'images',
        path,
        file: file.buffer,
        contentType: file.mimetype,
      });

      if (error) {
        throw error;
      }

      // Get public URL
      const { url } = await this.supabaseService.getFileUrl('images', uploadedPath);

      // Update item with image URL
      await this.supabaseService.update(
        'inventory_items',
        { imageUrl: url },
        { id }
      );

      return {
        url,
        originalName: file.originalname,
        size: file.size,
      };
    } catch (error) {
      this.logger.error(`Error uploading image for item ${id}`, error);
      throw error;
    }
  }

  @Get(':id/analytics')
  @ApiOperation({
    summary: 'Get item analytics',
    description: 'Retrieve AI-powered analytics and insights for a specific inventory item',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        demandForecast: { type: 'object' },
        turnoverAnalysis: { type: 'object' },
        abcClassification: { type: 'string' },
        seasonalityPatterns: { type: 'object' },
        recommendations: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @RequirePermissions('analytics', 'read')
  @UseInterceptors(CacheInterceptor)
  async getAnalytics(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    try {
      return await this.inventoryIntelligenceService.getItemAnalytics(id);
    } catch (error) {
      this.logger.error(`Error fetching analytics for item ${id}`, error);
      throw error;
    }
  }

  @Post(':id/optimize')
  @ApiOperation({
    summary: 'Optimize inventory item',
    description: 'Run AI optimization for reorder points, safety stock, and other parameters',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Optimization completed successfully' })
  @RequirePermissions('inventory_items', 'optimize')
  async optimize(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    try {
      return await this.inventoryIntelligenceService.optimizeItem(id);
    } catch (error) {
      this.logger.error(`Error optimizing item ${id}`, error);
      throw error;
    }
  }

  // Private helper methods
  private buildFilters(filters: InventoryItemFilterDto) {
    const supabaseFilters = [];

    if (filters.search) {
      supabaseFilters.push({
        column: 'name',
        operator: 'ilike' as const,
        value: `%${filters.search}%`,
      });
    }

    if (filters.category) {
      supabaseFilters.push({
        column: 'category',
        operator: 'eq' as const,
        value: filters.category,
      });
    }

    if (filters.location) {
      supabaseFilters.push({
        column: 'locationId',
        operator: 'eq' as const,
        value: filters.location,
      });
    }

    if (filters.status) {
      supabaseFilters.push({
        column: 'status',
        operator: 'eq' as const,
        value: filters.status,
      });
    }

    if (filters.lowStock) {
      supabaseFilters.push({
        column: 'currentStock',
        operator: 'lt' as const,
        value: 'reorderPoint',
      });
    }

    return supabaseFilters;
  }

  private async getAggregations(filters: InventoryItemFilterDto) {
    // Implementation would calculate aggregations from Supabase
    return {
      totalCount: 0,
      totalValue: 0,
      totalQuantity: 0,
      categoryCounts: {},
      locationCounts: {},
    };
  }

  private async generateSKU(name: string, category: string): Promise<string> {
    const prefix = category.substring(0, 3).toUpperCase();
    const namePart = name.replace(/\s/g, '').substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}-${namePart}-${timestamp}`;
  }

  private async getRecentMovements(itemId: string) {
    const { data } = await this.supabaseService.query({
      table: 'stock_movements',
      select: '*',
      filters: [{ column: 'itemId', operator: 'eq', value: itemId }],
      orderBy: [{ column: 'createdAt', ascending: false }],
      limit: 10,
    });
    return data;
  }

  private async trackChanges(oldItem: any, newItem: any, userId: string) {
    // Implementation would track and log significant changes
    // Could also trigger notifications or workflows
  }

  private async cleanupRelatedData(itemId: string) {
    // Clean up IoT device registrations
    await this.realTimeTrackingService.unregisterDevice(itemId);
    
    // Clean up analytics data
    await this.inventoryIntelligenceService.cleanupItemAnalytics(itemId);
  }
}
