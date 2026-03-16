import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { CatalogService } from '../services/catalog.service';
import { RecommendationEngineService } from '../services/recommendation-engine.service';
import { InventoryService } from '../services/inventory.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductSearchDto,
  CreateCategoryDto,
  CreateBundleDto,
} from '../dto/product.dto';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class ProductController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly recommendationEngine: RecommendationEngineService,
    private readonly inventoryService: InventoryService,
  ) { }

  // ============ Product CRUD ============

  @Post()
  @ApiOperation({ summary: 'Create product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async createProduct(@Request() req, @Body() dto: CreateProductDto) {
    return this.catalogService.createProduct(req.user.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of products' })
  async getProducts(@Request() req) {
    return this.catalogService.findAllProducts(req.user.tenantId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchProducts(@Request() req, @Query() dto: ProductSearchDto) {
    return this.catalogService.searchProducts(req.user.tenantId, dto);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  @ApiResponse({ status: 200, description: 'Featured products' })
  async getFeaturedProducts(@Request() req, @Query('limit') limit?: number) {
    return this.catalogService.getFeaturedProducts(req.user.tenantId, limit || 10);
  }

  @Get('on-sale')
  @ApiOperation({ summary: 'Get products on sale' })
  @ApiResponse({ status: 200, description: 'Products on sale' })
  async getOnSaleProducts(@Request() req, @Query('limit') limit?: number) {
    return this.catalogService.getOnSaleProducts(req.user.tenantId, limit || 20);
  }

  @Get('best-sellers')
  @ApiOperation({ summary: 'Get best selling products' })
  @ApiResponse({ status: 200, description: 'Best sellers' })
  async getBestSellers(@Request() req, @Query('limit') limit?: number) {
    return this.catalogService.getBestSellingProducts(req.user.tenantId, limit || 10);
  }

  // ============ Inventory ============

  @Get('inventory/low-stock')
  @ApiOperation({ summary: 'Get low stock products' })
  @ApiResponse({ status: 200, description: 'Low stock products' })
  async getLowStock(@Request() req) {
    return this.inventoryService.getLowStockProducts(req.user.tenantId);
  }

  @Get('inventory/report')
  @ApiOperation({ summary: 'Get inventory report' })
  @ApiResponse({ status: 200, description: 'Inventory report' })
  async getInventoryReport(@Request() req) {
    return this.inventoryService.getInventoryReport(req.user.tenantId);
  }

  // ============ Product CRUD with ID ============

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product details' })
  async getProduct(@Request() req, @Param('id') id: string) {
    return this.catalogService.findProductById(id, req.user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  async updateProduct(@Request() req, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.catalogService.updateProduct(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  async deleteProduct(@Request() req, @Param('id') id: string) {
    await this.catalogService.deleteProduct(id, req.user.tenantId);
    return { message: 'Product deleted successfully' };
  }

  // ============ Product Recommendations ============

  @Get(':id/recommendations')
  @ApiOperation({ summary: 'Get product recommendations' })
  @ApiResponse({ status: 200, description: 'Recommended products' })
  async getRecommendations(@Request() req, @Param('id') id: string, @Query('limit') limit?: number) {
    return this.recommendationEngine.getRecommendations(req.user.tenantId);
  }

  @Get(':id/frequently-bought-together')
  @ApiOperation({ summary: 'Get frequently bought together' })
  @ApiResponse({ status: 200, description: 'Frequently bought together products' })
  async getFrequentlyBoughtTogether(@Request() req, @Param('id') id: string) {
    return this.recommendationEngine.getFrequentlyBoughtTogether(id, req.user.tenantId);
  }

  @Get(':id/upsell')
  @ApiOperation({ summary: 'Get upsell products' })
  @ApiResponse({ status: 200, description: 'Upsell products' })
  async getUpsell(@Request() req, @Param('id') id: string) {
    return this.recommendationEngine.getUpsellProducts(id, req.user.tenantId);
  }
}

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class CategoryController {
  constructor(private readonly catalogService: CatalogService) { }

  @Post()
  @ApiOperation({ summary: 'Create category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async createCategory(@Request() req, @Body() dto: CreateCategoryDto) {
    try {
      return await this.catalogService.createCategory(req.user.tenantId, dto);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to create category', HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async getCategories(@Request() req) {
    return this.catalogService.findAllCategories(req.user.tenantId);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get category tree' })
  @ApiResponse({ status: 200, description: 'Category hierarchy' })
  async getCategoryTree(@Request() req) {
    return this.catalogService.getCategoryTree(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category details' })
  async getCategory(@Request() req, @Param('id') id: string) {
    return this.catalogService.findCategoryById(id, req.user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  async deleteCategory(@Request() req, @Param('id') id: string) {
    await this.catalogService.deleteCategory(id, req.user.tenantId);
    return { message: 'Category deleted successfully' };
  }
}

@ApiTags('Bundles')
@Controller('bundles')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class BundleController {
  constructor(private readonly catalogService: CatalogService) { }

  @Post()
  @ApiOperation({ summary: 'Create bundle' })
  @ApiResponse({ status: 201, description: 'Bundle created successfully' })
  async createBundle(@Request() req, @Body() dto: CreateBundleDto) {
    return this.catalogService.createBundle(req.user.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bundles' })
  @ApiResponse({ status: 200, description: 'List of bundles' })
  async getBundles(@Request() req) {
    return this.catalogService.findAllBundles(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bundle by ID' })
  @ApiResponse({ status: 200, description: 'Bundle details' })
  async getBundle(@Request() req, @Param('id') id: string) {
    return this.catalogService.findBundleById(id, req.user.tenantId);
  }
}
