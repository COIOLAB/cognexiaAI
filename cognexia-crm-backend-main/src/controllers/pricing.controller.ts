import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TenantGuard } from '../guards/tenant.guard';
import { PricingEngineService } from '../services/pricing-engine.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PriceList } from '../entities/price-list.entity';
import { Discount } from '../entities/discount.entity';
import {
  CreatePriceListDto,
  CreateDiscountDto,
  CalculatePriceDto,
  BulkPriceCalculationDto,
  ApplyDiscountDto,
} from '../dto/pricing.dto';

@ApiTags('Price Lists')
@Controller('price-lists')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class PriceListController {
  constructor(
    @InjectRepository(PriceList)
    private readonly priceListRepo: Repository<PriceList>,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create price list' })
  @ApiResponse({ status: 201, description: 'Price list created successfully' })
  async createPriceList(@Request() req, @Body() dto: CreatePriceListDto) {
    const priceList = this.priceListRepo.create({
      ...dto,
      tenantId: req.user.tenantId,
    });
    return this.priceListRepo.save(priceList);
  }

  @Get()
  @ApiOperation({ summary: 'Get all price lists' })
  @ApiResponse({ status: 200, description: 'List of price lists' })
  async getPriceLists(@Request() req) {
    return this.priceListRepo.find({
      where: { tenantId: req.user.tenantId },
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active price lists' })
  @ApiResponse({ status: 200, description: 'Active price lists' })
  async getActivePriceLists(@Request() req) {
    const now = new Date();
    return this.priceListRepo
      .createQueryBuilder('priceList')
      .where('priceList.tenantId = :tenantId', { tenantId: req.user.tenantId })
      .andWhere('priceList.active = :isActive', { isActive: true })
      .andWhere('(priceList.validFrom IS NULL OR priceList.validFrom <= :now)', { now })
      .andWhere('(priceList.validTo IS NULL OR priceList.validTo >= :now)', { now })
      .orderBy('priceList.priority', 'DESC')
      .getMany();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get price list by ID' })
  @ApiResponse({ status: 200, description: 'Price list details' })
  async getPriceList(@Request() req, @Param('id') id: string) {
    return this.priceListRepo.findOne({
      where: { id, tenantId: req.user.tenantId },
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update price list' })
  @ApiResponse({ status: 200, description: 'Price list updated successfully' })
  async updatePriceList(@Request() req, @Param('id') id: string, @Body() dto: Partial<CreatePriceListDto>) {
    await this.priceListRepo.update(
      { id, tenantId: req.user.tenantId },
      dto,
    );
    return this.getPriceList(req, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete price list' })
  @ApiResponse({ status: 200, description: 'Price list deleted successfully' })
  async deletePriceList(@Request() req, @Param('id') id: string) {
    await this.priceListRepo.delete({ id, tenantId: req.user.tenantId });
    return { message: 'Price list deleted successfully' };
  }
}

@ApiTags('Discounts')
@Controller('discounts')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class DiscountController {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepo: Repository<Discount>,
    private readonly pricingEngine: PricingEngineService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create discount' })
  @ApiResponse({ status: 201, description: 'Discount created successfully' })
  async createDiscount(@Request() req, @Body() dto: CreateDiscountDto) {
    const discount = this.discountRepo.create({
      ...dto,
      tenantId: req.user.tenantId,
    });
    return this.discountRepo.save(discount);
  }

  @Get()
  @ApiOperation({ summary: 'Get all discounts' })
  @ApiResponse({ status: 200, description: 'List of discounts' })
  async getDiscounts(@Request() req) {
    return this.discountRepo.find({
      where: { tenantId: req.user.tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active discounts' })
  @ApiResponse({ status: 200, description: 'Active discounts' })
  async getActiveDiscounts(@Request() req) {
    const now = new Date();
    return this.discountRepo
      .createQueryBuilder('discount')
      .where('discount.tenantId = :tenantId', { tenantId: req.user.tenantId })
      .andWhere('discount.active = :active', { active: true })
      .andWhere('(discount.validFrom IS NULL OR discount.validFrom <= :now)', { now })
      .andWhere('(discount.validTo IS NULL OR discount.validTo >= :now)', { now })
      .andWhere('(discount.maxUses IS NULL OR discount.currentUses < discount.maxUses)')
      .getMany();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get discount by ID' })
  @ApiResponse({ status: 200, description: 'Discount details' })
  async getDiscount(@Request() req, @Param('id') id: string) {
    return this.discountRepo.findOne({
      where: { id, tenantId: req.user.tenantId },
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update discount' })
  @ApiResponse({ status: 200, description: 'Discount updated successfully' })
  async updateDiscount(@Request() req, @Param('id') id: string, @Body() dto: Partial<CreateDiscountDto>) {
    await this.discountRepo.update(
      { id, tenantId: req.user.tenantId },
      dto,
    );
    return this.getDiscount(req, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete discount' })
  @ApiResponse({ status: 200, description: 'Discount deleted successfully' })
  async deleteDiscount(@Request() req, @Param('id') id: string) {
    await this.discountRepo.delete({ id, tenantId: req.user.tenantId });
    return { message: 'Discount deleted successfully' };
  }

  @Post('validate-code')
  @ApiOperation({ summary: 'Validate discount code' })
  @ApiResponse({ status: 200, description: 'Discount code validation result' })
  async validateDiscountCode(
    @Request() req,
    @Body() body: { code: string; customerId?: string; cartTotal?: number },
  ) {
    return this.pricingEngine.applyDiscountCode(
      body.code,
      body.customerId,
      req.user.tenantId,
    );
  }
}

@ApiTags('Pricing')
@Controller('pricing')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class PricingController {
  constructor(private readonly pricingEngine: PricingEngineService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate price for a product' })
  @ApiResponse({ status: 200, description: 'Calculated price with breakdown' })
  async calculatePrice(@Request() req, @Body() dto: CalculatePriceDto) {
    return this.pricingEngine.calculatePrice(req.user.tenantId, dto);
  }

  @Post('calculate-bulk')
  @ApiOperation({ summary: 'Calculate prices for multiple products (cart)' })
  @ApiResponse({ status: 200, description: 'Calculated prices for all items' })
  async calculateBulkPrice(@Request() req, @Body() dto: BulkPriceCalculationDto) {
    return this.pricingEngine.calculateBulkPrice(req.user.tenantId, dto.items, dto.customerId);
  }

  @Post('apply-discount')
  @ApiOperation({ summary: 'Apply discount to a price' })
  @ApiResponse({ status: 200, description: 'Price after discount' })
  async applyDiscount(@Request() req, @Body() dto: ApplyDiscountDto) {
    return this.pricingEngine.applyDiscountCode(
      dto.code,
      dto.customerId,
      req.user.tenantId,
    );
  }
}
