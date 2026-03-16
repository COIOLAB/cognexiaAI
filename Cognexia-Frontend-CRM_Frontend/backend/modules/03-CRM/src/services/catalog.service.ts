import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, Like, Between, In } from 'typeorm';
import { Product, ProductStatus } from '../entities/product.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { ProductBundle } from '../entities/product-bundle.entity';
import { CreateProductDto, UpdateProductDto, ProductSearchDto, CreateCategoryDto, CreateBundleDto } from '../dto/product.dto';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private categoryRepository: TreeRepository<ProductCategory>,
    @InjectRepository(ProductBundle)
    private bundleRepository: Repository<ProductBundle>,
  ) {}

  // ============ Product CRUD ============

  async createProduct(tenantId: string, dto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create({
      ...dto,
      tenantId,
      slug: this.generateSlug(dto.name),
    });

    this.applyStockStatus(product, undefined);
    return this.productRepository.save(product);
  }

  async findAllProducts(tenantId: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { tenantId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findProductById(id: string, tenantId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, tenantId },
      relations: ['category', 'relatedProducts'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Increment view count
    await this.productRepository.increment({ id }, 'viewCount', 1);

    return product;
  }

  async findProductBySku(sku: string, tenantId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { sku, tenantId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async updateProduct(id: string, tenantId: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findProductById(id, tenantId);
    Object.assign(product, dto);
    this.applyStockStatus(product, dto.status);
    return this.productRepository.save(product);
  }

  async deleteProduct(id: string, tenantId: string): Promise<void> {
    const product = await this.findProductById(id, tenantId);
    await this.productRepository.remove(product);
  }

  private applyStockStatus(product: Product, explicitStatus?: ProductStatus): void {
    if (!product.trackInventory) return;

    const available = (product.quantityInStock || 0) - (product.quantityReserved || 0);

    if (available <= 0) {
      product.status = ProductStatus.OUT_OF_STOCK;
      return;
    }

    if (!explicitStatus && product.status === ProductStatus.OUT_OF_STOCK) {
      product.status = ProductStatus.ACTIVE;
    }
  }

  // ============ Product Search & Filters ============

  async searchProducts(tenantId: string, dto: ProductSearchDto): Promise<{ products: Product[]; total: number }> {
    const query = this.productRepository.createQueryBuilder('product')
      .where('product.tenantId = :tenantId', { tenantId });

    // Text search
    if (dto.query) {
      query.andWhere(
        '(product.name ILIKE :query OR product.description ILIKE :query OR product.sku ILIKE :query OR :query = ANY(product.tags))',
        { query: `%${dto.query}%` }
      );
    }

    // Category filter
    if (dto.categoryId) {
      query.andWhere('product.categoryId = :categoryId', { categoryId: dto.categoryId });
    }

    // Status filter
    if (dto.status) {
      query.andWhere('product.status = :status', { status: dto.status });
    }

    // Price range
    if (dto.minPrice !== undefined) {
      query.andWhere('product.basePrice >= :minPrice', { minPrice: dto.minPrice });
    }
    if (dto.maxPrice !== undefined) {
      query.andWhere('product.basePrice <= :maxPrice', { maxPrice: dto.maxPrice });
    }

    // Tags filter
    if (dto.tags && dto.tags.length) {
      query.andWhere('product.tags && ARRAY[:...tags]', { tags: dto.tags });
    }

    // Pagination
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    query
      .leftJoinAndSelect('product.category', 'category')
      .skip(skip)
      .take(limit)
      .orderBy('product.createdAt', 'DESC');

    const [products, total] = await query.getManyAndCount();

    return { products, total };
  }

  async getFeaturedProducts(tenantId: string, limit: number = 10): Promise<Product[]> {
    return this.productRepository.find({
      where: { tenantId, isFeatured: true, status: ProductStatus.ACTIVE },
      take: limit,
      order: { totalSold: 'DESC' },
    });
  }

  async getOnSaleProducts(tenantId: string, limit: number = 20): Promise<Product[]> {
    return this.productRepository.find({
      where: { tenantId, isOnSale: true, status: ProductStatus.ACTIVE },
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async getBestSellingProducts(tenantId: string, limit: number = 10): Promise<Product[]> {
    return this.productRepository.find({
      where: { tenantId, status: ProductStatus.ACTIVE },
      take: limit,
      order: { totalSold: 'DESC' },
    });
  }

  // ============ Category Management ============

  async createCategory(tenantId: string, dto: CreateCategoryDto): Promise<ProductCategory> {
    try {
      const category = this.categoryRepository.create({
        ...dto,
        name: dto?.name || 'New Category',
        tenantId,
        slug: this.generateSlug(dto?.name || 'new-category'),
        displayOrder: dto?.displayOrder || 0,
        active: (dto as any)?.active !== undefined ? (dto as any).active : true,
      });

      return await this.categoryRepository.save(category);
    } catch (error) {
      console.error('Error creating category:', error.message);
      throw error; // Let controller handle the error properly
    }
  }

  async findAllCategories(tenantId: string): Promise<ProductCategory[]> {
    return this.categoryRepository.find({
      where: { tenantId },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async findCategoryById(id: string, tenantId: string): Promise<ProductCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id, tenantId },
      relations: ['products', 'children', 'parent'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async getCategoryTree(tenantId: string): Promise<ProductCategory[]> {
    return this.categoryRepository.findTrees();
  }

  async deleteCategory(id: string, tenantId: string): Promise<void> {
    const category = await this.findCategoryById(id, tenantId);
    
    // Move products to parent category or remove category reference
    if (category.products && category.products.length) {
      await this.productRepository.update(
        { categoryId: id },
        { categoryId: category.parent?.id || null }
      );
    }

    await this.categoryRepository.remove(category);
  }

  // ============ Bundle Management ============

  async createBundle(tenantId: string, dto: CreateBundleDto): Promise<ProductBundle> {
    // Fetch products to calculate original price
    const productIds = dto.items.map(item => item.productId);
    const products = await this.productRepository.findBy({ id: In(productIds) });

    const originalPrice = dto.items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product ? Number(product.basePrice) * item.quantity : 0);
    }, 0);

    const bundle = this.bundleRepository.create({
      ...dto,
      tenantId,
      originalPrice,
      slug: this.generateSlug(dto.name),
    });

    bundle.products = products;

    return this.bundleRepository.save(bundle);
  }

  async findAllBundles(tenantId: string): Promise<ProductBundle[]> {
    return this.bundleRepository.find({
      where: { tenantId },
      relations: ['products'],
      order: { createdAt: 'DESC' },
    });
  }

  async findBundleById(id: string, tenantId: string): Promise<ProductBundle> {
    const bundle = await this.bundleRepository.findOne({
      where: { id, tenantId },
      relations: ['products'],
    });

    if (!bundle) {
      throw new NotFoundException('Bundle not found');
    }

    return bundle;
  }

  // ============ Bulk Operations ============

  async bulkUpdateStatus(productIds: string[], status: ProductStatus, tenantId: string): Promise<void> {
    await this.productRepository.update(
      { id: In(productIds), tenantId },
      { status }
    );
  }

  async bulkUpdateCategory(productIds: string[], categoryId: string, tenantId: string): Promise<void> {
    await this.productRepository.update(
      { id: In(productIds), tenantId },
      { categoryId }
    );
  }

  async bulkUpdatePrices(updates: Array<{ productId: string; basePrice: number }>, tenantId: string): Promise<void> {
    for (const update of updates) {
      await this.productRepository.update(
        { id: update.productId, tenantId },
        { basePrice: update.basePrice }
      );
    }
  }

  // ============ Helper Methods ============

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now();
  }

  async updateProductStats(productId: string, sold: number, revenue: number): Promise<void> {
    await this.productRepository.increment({ id: productId }, 'totalSold', sold);
    await this.productRepository.increment({ id: productId }, 'totalRevenue', revenue);
  }
}
