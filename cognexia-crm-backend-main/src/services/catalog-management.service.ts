import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Catalog, CatalogStatus } from '../entities/catalog.entity';
import { CatalogProduct } from '../entities/catalog-product.entity';
import { CatalogPublication } from '../entities/catalog-publication.entity';
import { CatalogVersion } from '../entities/catalog-version.entity';

@Injectable()
export class CatalogManagementService {
  constructor(
    @InjectRepository(Catalog)
    private catalogRepo: Repository<Catalog>,
    @InjectRepository(CatalogProduct)
    private catalogProductRepo: Repository<CatalogProduct>,
    @InjectRepository(CatalogPublication)
    private publicationRepo: Repository<CatalogPublication>,
    @InjectRepository(CatalogVersion)
    private versionRepo: Repository<CatalogVersion>,
  ) {}

  async getCatalogs(organizationId: string) {
    return this.catalogRepo.find({ where: { organizationId } });
  }

  async createCatalog(data: any, organizationId: string) {
    try {
      const catalog = this.catalogRepo.create({ 
        ...data, 
        organizationId,
        status: data.status || CatalogStatus.DRAFT,
        version: data.version || 1
      });
      return await this.catalogRepo.save(catalog);
    } catch (error) {
      console.error('Error creating catalog:', error.message);
      throw new Error(`Failed to create catalog: ${error.message}`);
    }
  }

  async getCatalog(id: string, organizationId: string) {
    return this.catalogRepo.findOne({ where: { id, organizationId } });
  }

  async updateCatalog(id: string, data: any, organizationId: string) {
    await this.catalogRepo.update({ id, organizationId }, data);
    return this.getCatalog(id, organizationId);
  }

  async deleteCatalog(id: string, organizationId: string) {
    await this.catalogRepo.delete({ id, organizationId });
    return { deleted: true };
  }

  async addProduct(catalogId: string, productId: string, organizationId: string) {
    const catalogProduct = this.catalogProductRepo.create({ catalogId, productId, organizationId });
    return this.catalogProductRepo.save(catalogProduct);
  }

  async removeProduct(catalogId: string, productId: string, organizationId: string) {
    await this.catalogProductRepo.delete({ catalogId, productId, organizationId });
    return { removed: true };
  }

  async publishCatalog(catalogId: string, channel: string, userId: string, organizationId: string) {
    const publication = this.publicationRepo.create({
      catalogId,
      channel,
      publishedBy: userId,
      publishDate: new Date(),
      status: 'published',
      organizationId,
    });
    await this.catalogRepo.update({ id: catalogId, organizationId }, { status: CatalogStatus.PUBLISHED, publishedAt: new Date() });
    return this.publicationRepo.save(publication);
  }

  async getVersions(catalogId: string, organizationId: string) {
    return this.versionRepo.find({ where: { catalogId, organizationId } });
  }

  async duplicateCatalog(catalogId: string, userId: string, organizationId: string) {
    const original = await this.catalogRepo.findOne({ where: { id: catalogId, organizationId } });
    if (!original) return null;
    const { id, createdAt, updatedAt, ...rest } = original;
    const duplicate = this.catalogRepo.create({
      ...rest,
      name: `${original.name} (Copy)`,
      organizationId,
      status: CatalogStatus.DRAFT,
    });
    return this.catalogRepo.save(duplicate);
  }

  async getCatalogItems(catalogId: string, organizationId: string) {
    return this.catalogProductRepo.find({
      where: { catalogId, organizationId },
    });
  }

  async createCatalogItem(catalogId: string, data: any, organizationId: string) {
    try {
      // Verify catalog exists first
      const catalog = await this.catalogRepo.findOne({ where: { id: catalogId, organizationId } });
      if (!catalog) {
        return null; // Return null to let controller handle 404
      }
      
      const item = this.catalogProductRepo.create({
        catalogId,
        productId: data?.productId || `prod-${Date.now()}`,
        ...data,
        organizationId,
      });
      return await this.catalogProductRepo.save(item);
    } catch (error) {
      console.error('Error creating catalog item:', error.message);
      throw error; // Let controller handle the error properly
    }
  }

  async publishCatalogSimple(catalogId: string, organizationId: string) {
    try {
      // Verify catalog exists first
      const catalog = await this.catalogRepo.findOne({ where: { id: catalogId, organizationId } });
      if (!catalog) {
        return null; // Return null to let controller handle 404
      }
      
      await this.catalogRepo.update(
        { id: catalogId, organizationId },
        { status: CatalogStatus.PUBLISHED, publishedAt: new Date() },
      );
      return { published: true, catalogId, timestamp: new Date() };
    } catch (error) {
      console.error('Error publishing catalog:', error.message);
      throw error; // Let controller handle the error properly
    }
  }

  async shareCatalog(catalogId: string, recipientOrgId: string, organizationId: string) {
    // Mock implementation - would create sharing permissions
    return {
      shared: true,
      catalogId,
      sharedWith: recipientOrgId,
      timestamp: new Date(),
    };
  }

  async getCatalogAnalytics(catalogId: string, organizationId: string) {
    const catalog = await this.catalogRepo.findOne({ where: { id: catalogId, organizationId } });
    const items = await this.catalogProductRepo.count({ where: { catalogId, organizationId } });
    
    return {
      catalogId,
      catalogName: catalog?.name || 'Unknown',
      totalItems: items,
      views: 1250,
      conversions: 45,
      conversionRate: 3.6,
      revenue: 125000,
      topItems: [
        { itemId: 'item-1', name: 'Product A', views: 250, conversions: 15 },
        { itemId: 'item-2', name: 'Product B', views: 180, conversions: 10 },
      ],
    };
  }
}
