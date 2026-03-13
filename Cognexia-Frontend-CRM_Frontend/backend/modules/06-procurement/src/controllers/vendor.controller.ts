// Industry 5.0 ERP Backend - Procurement Module
// VendorController - Comprehensive vendor management with AI-powered analytics
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

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
  HttpStatus,
  HttpException,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities
import { Vendor, VendorStatus, VendorType, VendorSize } from '../entities/vendor.entity';
import { SupplierPerformanceMetric } from '../entities/supplier-performance-metric.entity';

// Services
import { SupplierManagementService } from '../services/supplier-management.service';
import { AIProcurementIntelligenceService } from '../services/ai-procurement-intelligence.service';

// Guards
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ProcurementPermissionGuard } from '../guards/procurement-permission.guard';

// DTOs (we'll create basic types for now)
interface CreateVendorDto {
  vendorCode: string;
  companyName: string;
  legalName?: string;
  type: VendorType;
  size: VendorSize;
  taxId?: string;
  addresses: any[];
  contacts: any[];
  capabilities: any;
}

interface UpdateVendorDto extends Partial<CreateVendorDto> {}

interface VendorQueryDto {
  status?: VendorStatus;
  type?: VendorType;
  country?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

@ApiTags('Vendor Management')
@Controller('vendors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ProcurementPermissionGuard)
export class VendorController {
  private readonly logger = new Logger(VendorController.name);

  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(SupplierPerformanceMetric)
    private readonly performanceRepository: Repository<SupplierPerformanceMetric>,
    private readonly supplierService: SupplierManagementService,
    private readonly aiService: AIProcurementIntelligenceService,
  ) {}

  // ==================== VENDOR CRUD OPERATIONS ====================

  @Get()
  @ApiOperation({ summary: 'Get all vendors with filtering and pagination' })
  @ApiQuery({ name: 'status', enum: VendorStatus, required: false })
  @ApiQuery({ name: 'type', enum: VendorType, required: false })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of vendors retrieved successfully' })
  async findAll(@Query() query: VendorQueryDto) {
    try {
      this.logger.log('Fetching vendors with filters:', query);

      const queryBuilder = this.vendorRepository.createQueryBuilder('vendor')
        .leftJoinAndSelect('vendor.performanceHistory', 'performance')
        .leftJoinAndSelect('vendor.contracts', 'contracts')
        .leftJoinAndSelect('vendor.purchaseOrders', 'orders');

      // Apply filters
      if (query.status) {
        queryBuilder.andWhere('vendor.status = :status', { status: query.status });
      }

      if (query.type) {
        queryBuilder.andWhere('vendor.type = :type', { type: query.type });
      }

      if (query.country) {
        queryBuilder.andWhere('vendor.country = :country', { country: query.country });
      }

      if (query.search) {
        queryBuilder.andWhere(
          '(vendor.companyName ILIKE :search OR vendor.vendorCode ILIKE :search)',
          { search: `%${query.search}%` }
        );
      }

      // Apply sorting
      const sortBy = query.sortBy || 'companyName';
      const sortOrder = query.sortOrder || 'ASC';
      queryBuilder.orderBy(`vendor.${sortBy}`, sortOrder);

      // Apply pagination
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(100, Math.max(1, query.limit || 20));
      const offset = (page - 1) * limit;

      queryBuilder.skip(offset).take(limit);

      const [vendors, total] = await queryBuilder.getManyAndCount();

      return {
        data: vendors,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Error fetching vendors', error.stack);
      throw new HttpException('Failed to fetch vendors', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor by ID' })
  @ApiParam({ name: 'id', description: 'Vendor UUID' })
  @ApiResponse({ status: 200, description: 'Vendor details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Fetching vendor with ID: ${id}`);

      const vendor = await this.vendorRepository.findOne({
        where: { id },
        relations: [
          'performanceHistory',
          'contracts',
          'purchaseOrders',
        ],
      });

      if (!vendor) {
        throw new HttpException('Vendor not found', HttpStatus.NOT_FOUND);
      }

      return vendor;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error fetching vendor ${id}`, error.stack);
      throw new HttpException('Failed to fetch vendor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid vendor data' })
  async create(@Body() createVendorDto: CreateVendorDto) {
    try {
      this.logger.log('Creating new vendor:', createVendorDto.companyName);

      // Check if vendor code already exists
      const existingVendor = await this.vendorRepository.findOne({
        where: { vendorCode: createVendorDto.vendorCode },
      });

      if (existingVendor) {
        throw new HttpException('Vendor code already exists', HttpStatus.CONFLICT);
      }

      const vendor = this.vendorRepository.create({
        ...createVendorDto,
        status: VendorStatus.PENDING_APPROVAL,
        createdAt: new Date(),
      });

      const savedVendor = await this.vendorRepository.save(vendor);

      // Trigger AI analysis for new vendor
      try {
        await this.aiService.analyzeNewVendor(savedVendor.id);
      } catch (aiError) {
        this.logger.warn('AI analysis failed for new vendor', aiError);
      }

      this.logger.log(`Vendor created successfully with ID: ${savedVendor.id}`);
      return savedVendor;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error creating vendor', error.stack);
      throw new HttpException('Failed to create vendor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update vendor information' })
  @ApiParam({ name: 'id', description: 'Vendor UUID' })
  @ApiResponse({ status: 200, description: 'Vendor updated successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ) {
    try {
      this.logger.log(`Updating vendor ${id}`);

      const vendor = await this.vendorRepository.findOne({ where: { id } });
      if (!vendor) {
        throw new HttpException('Vendor not found', HttpStatus.NOT_FOUND);
      }

      Object.assign(vendor, updateVendorDto);
      vendor.updatedAt = new Date();

      const updatedVendor = await this.vendorRepository.save(vendor);

      this.logger.log(`Vendor ${id} updated successfully`);
      return updatedVendor;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error updating vendor ${id}`, error.stack);
      throw new HttpException('Failed to update vendor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete vendor (soft delete)' })
  @ApiParam({ name: 'id', description: 'Vendor UUID' })
  @ApiResponse({ status: 200, description: 'Vendor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Deleting vendor ${id}`);

      const vendor = await this.vendorRepository.findOne({ where: { id } });
      if (!vendor) {
        throw new HttpException('Vendor not found', HttpStatus.NOT_FOUND);
      }

      // Soft delete by setting status to inactive
      vendor.status = VendorStatus.INACTIVE;
      vendor.updatedAt = new Date();

      await this.vendorRepository.save(vendor);

      this.logger.log(`Vendor ${id} deleted successfully`);
      return { message: 'Vendor deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error deleting vendor ${id}`, error.stack);
      throw new HttpException('Failed to delete vendor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== VENDOR STATUS MANAGEMENT ====================

  @Put(':id/status')
  @ApiOperation({ summary: 'Update vendor status' })
  @ApiParam({ name: 'id', description: 'Vendor UUID' })
  @ApiResponse({ status: 200, description: 'Vendor status updated successfully' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusData: { status: VendorStatus; reason?: string },
  ) {
    try {
      this.logger.log(`Updating status for vendor ${id} to ${statusData.status}`);

      const vendor = await this.vendorRepository.findOne({ where: { id } });
      if (!vendor) {
        throw new HttpException('Vendor not found', HttpStatus.NOT_FOUND);
      }

      vendor.status = statusData.status;
      vendor.updatedAt = new Date();

      await this.vendorRepository.save(vendor);

      // Log status change
      this.logger.log(`Vendor ${id} status changed to ${statusData.status}`);

      return { message: 'Vendor status updated successfully', vendor };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error updating vendor status ${id}`, error.stack);
      throw new HttpException('Failed to update vendor status', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve vendor' })
  @ApiParam({ name: 'id', description: 'Vendor UUID' })
  @ApiResponse({ status: 200, description: 'Vendor approved successfully' })
  async approve(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Approving vendor ${id}`);

      const vendor = await this.vendorRepository.findOne({ where: { id } });
      if (!vendor) {
        throw new HttpException('Vendor not found', HttpStatus.NOT_FOUND);
      }

      vendor.approveVendor('system'); // This method is from the entity
      await this.vendorRepository.save(vendor);

      return { message: 'Vendor approved successfully', vendor };
    } catch (error) {
      this.logger.error(`Error approving vendor ${id}`, error.stack);
      throw new HttpException('Failed to approve vendor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend vendor' })
  @ApiParam({ name: 'id', description: 'Vendor UUID' })
  @ApiResponse({ status: 200, description: 'Vendor suspended successfully' })
  async suspend(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() suspensionData: { reason: string },
  ) {
    try {
      this.logger.log(`Suspending vendor ${id}`);

      const vendor = await this.vendorRepository.findOne({ where: { id } });
      if (!vendor) {
        throw new HttpException('Vendor not found', HttpStatus.NOT_FOUND);
      }

      vendor.suspendVendor(suspensionData.reason, 'system');
      await this.vendorRepository.save(vendor);

      return { message: 'Vendor suspended successfully', vendor };
    } catch (error) {
      this.logger.error(`Error suspending vendor ${id}`, error.stack);
      throw new HttpException('Failed to suspend vendor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== VENDOR PERFORMANCE ====================

  @Get(':id/performance')
  @ApiOperation({ summary: 'Get vendor performance metrics' })
  @ApiParam({ name: 'id', description: 'Vendor UUID' })
  @ApiQuery({ name: 'period', required: false })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved successfully' })
  async getPerformance(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('period') period?: string,
  ) {
    try {
      this.logger.log(`Fetching performance metrics for vendor ${id}`);

      const queryBuilder = this.performanceRepository.createQueryBuilder('metric')
        .where('metric.vendorId = :vendorId', { vendorId: id })
        .orderBy('metric.measurementDate', 'DESC');

      if (period) {
        queryBuilder.andWhere('metric.metricPeriod = :period', { period });
      }

      const metrics = await queryBuilder.getMany();

      return {
        vendorId: id,
        metrics,
        summary: this.calculatePerformanceSummary(metrics),
      };
    } catch (error) {
      this.logger.error(`Error fetching vendor performance ${id}`, error.stack);
      throw new HttpException('Failed to fetch performance metrics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/performance/summary')
  @ApiOperation({ summary: 'Get vendor performance summary' })
  @ApiParam({ name: 'id', description: 'Vendor UUID' })
  @ApiResponse({ status: 200, description: 'Performance summary retrieved successfully' })
  async getPerformanceSummary(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Fetching performance summary for vendor ${id}`);

      const vendor = await this.vendorRepository.findOne({
        where: { id },
        relations: ['performanceHistory'],
      });

      if (!vendor) {
        throw new HttpException('Vendor not found', HttpStatus.NOT_FOUND);
      }

      const summary = {
        overallScore: vendor.getOverallPerformanceScore(),
        rating: vendor.getPerformanceRating(),
        onTimeDeliveryRate: vendor.getOnTimeDeliveryRate(),
        qualityScore: vendor.getQualityScore(),
        riskLevel: vendor.isHighRisk() ? 'high' : 'normal',
        isStrategic: vendor.isPreferred(),
        relationshipDuration: vendor.getRelationshipDuration(),
        annualSpend: vendor.getAnnualSpend(),
        sustainabilityRating: vendor.getSustainabilityRating(),
        digitalMaturity: vendor.getDigitalMaturityLevel(),
      };

      return summary;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Error fetching vendor summary ${id}`, error.stack);
      throw new HttpException('Failed to fetch performance summary', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== AI ANALYTICS ====================

  @Get(':id/ai-insights')
  @ApiOperation({ summary: 'Get AI-powered vendor insights' })
  @ApiParam({ name: 'id', description: 'Vendor UUID' })
  @ApiResponse({ status: 200, description: 'AI insights retrieved successfully' })
  async getAIInsights(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Fetching AI insights for vendor ${id}`);

      const insights = await this.aiService.getVendorInsights(id);

      return insights;
    } catch (error) {
      this.logger.error(`Error fetching AI insights for vendor ${id}`, error.stack);
      throw new HttpException('Failed to fetch AI insights', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/analyze')
  @ApiOperation({ summary: 'Trigger AI analysis for vendor' })
  @ApiParam({ name: 'id', description: 'Vendor UUID' })
  @ApiResponse({ status: 200, description: 'AI analysis triggered successfully' })
  async triggerAnalysis(@Param('id', ParseUUIDPipe) id: string) {
    try {
      this.logger.log(`Triggering AI analysis for vendor ${id}`);

      await this.aiService.analyzeVendorPerformance(id);

      return { message: 'AI analysis triggered successfully' };
    } catch (error) {
      this.logger.error(`Error triggering AI analysis for vendor ${id}`, error.stack);
      throw new HttpException('Failed to trigger AI analysis', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== VENDOR COMPARISON ====================

  @Post('compare')
  @ApiOperation({ summary: 'Compare multiple vendors' })
  @ApiResponse({ status: 200, description: 'Vendor comparison completed successfully' })
  async compareVendors(@Body() vendorIds: { vendorIds: string[] }) {
    try {
      this.logger.log(`Comparing vendors: ${vendorIds.vendorIds.join(', ')}`);

      const vendors = await this.vendorRepository.findByIds(vendorIds.vendorIds, {
        relations: ['performanceHistory'],
      });

      const comparison = await this.aiService.compareVendors(vendorIds.vendorIds);

      return {
        vendors,
        comparison,
        recommendation: comparison.recommendedVendor,
      };
    } catch (error) {
      this.logger.error('Error comparing vendors', error.stack);
      throw new HttpException('Failed to compare vendors', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ==================== HELPER METHODS ====================

  private calculatePerformanceSummary(metrics: SupplierPerformanceMetric[]) {
    if (!metrics.length) {
      return null;
    }

    const latest = metrics[0];
    const avg = metrics.reduce((sum, metric) => sum + metric.overallScore, 0) / metrics.length;

    return {
      latestScore: latest.overallScore,
      averageScore: Math.round(avg * 100) / 100,
      trend: latest.trendDirection,
      measurementCount: metrics.length,
      period: {
        from: metrics[metrics.length - 1].measurementDate,
        to: latest.measurementDate,
      },
    };
  }
}
