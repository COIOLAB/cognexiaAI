import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ForecastCashFlowDto {
  @ApiProperty({ description: 'Number of days to forecast', example: 30, minimum: 1, maximum: 365 })
  @IsNumber()
  @Min(1)
  @Max(365)
  days!: number;

  @ApiProperty({ description: 'Baseline expected daily net cash', example: 1000, required: false })
  @IsOptional()
  @IsNumber()
  baselineDailyNet?: number;

  @ApiProperty({ description: 'Seasonality factors to apply per day index', example: [1, 0.9, 1.1], required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  seasonality?: number[];
}

export class OptimizeDisbursementDiscountDto {
  @ApiProperty({ description: 'Discount rate (e.g., 0.02 for 2%)', example: 0.02, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discountRate?: number;

  @ApiProperty({ description: 'Discount deadline as ISO string', example: '2025-09-01T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  deadline?: string;
}

export class OptimizeDisbursementPayableDto {
  @ApiProperty({ description: 'Payable ID', example: 'INV_123' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ description: 'Amount of the payable', example: 1200 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({ description: 'Currency code', example: 'USD' })
  @IsString()
  currency!: string;

  @ApiProperty({ description: 'Due date ISO string', example: '2025-09-10T00:00:00.000Z' })
  @IsDateString()
  dueDate!: string;

  @ApiProperty({ description: 'Optional early payment discount', required: false, type: OptimizeDisbursementDiscountDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => OptimizeDisbursementDiscountDto)
  discount?: { rate: number; deadline: string };
}

export class OptimizeDisbursementConstraintsDto {
  @ApiProperty({ description: 'Max spend per day', example: 50000, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxDailySpend?: number;

  @ApiProperty({ description: 'Prefer to capture discounts when possible', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  preferDiscounts?: boolean;
}

export class OptimizeDisbursementDto {
  @ApiProperty({ type: [OptimizeDisbursementPayableDto] })
  @ValidateNested({ each: true })
  @Type(() => OptimizeDisbursementPayableDto)
  payables!: OptimizeDisbursementPayableDto[];

  @ApiProperty({ required: false, type: OptimizeDisbursementConstraintsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => OptimizeDisbursementConstraintsDto)
  constraints?: OptimizeDisbursementConstraintsDto;
}

export class RecommendDiscountDto {
  @ApiProperty({ example: 10000 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  invoiceAmount!: number;

  @ApiProperty({ example: 0.02 })
  @Type(() => Number)
  @IsNumber()
  discountRate!: number;

  @ApiProperty({ example: '2025-09-01T00:00:00.000Z' })
  @IsDateString()
  discountDeadline!: string;

  @ApiProperty({ example: '2025-09-30T00:00:00.000Z' })
  @IsDateString()
  netDueDate!: string;

  @ApiProperty({ example: 0.12, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  costOfCapitalAPR?: number;
}

export class SelectPaymentRailDto {
  @ApiProperty({ example: 25000 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({ enum: ['low', 'medium', 'high'] })
  @IsEnum(['low', 'medium', 'high'])
  urgency!: 'low' | 'medium' | 'high';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  preferLowFees?: boolean;
}

export class ScenarioPaymentDto {
  @ApiProperty({ example: 5000 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiProperty({ enum: ['ach', 'wire', 'check', 'card', 'crypto'] })
  @IsEnum(['ach', 'wire', 'check', 'card', 'crypto'])
  method!: 'ach' | 'wire' | 'check' | 'card' | 'crypto';

  @ApiProperty({ example: '2025-09-05T00:00:00.000Z' })
  @IsDateString()
  date!: string;
}

export class ScenarioDto {
  @ApiProperty({ example: 'baseline' })
  @IsString()
  id!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [ScenarioPaymentDto] })
  @ValidateNested({ each: true })
  @Type(() => ScenarioPaymentDto)
  payments!: ScenarioPaymentDto[];
}

export class SimulatePaymentScenariosDto {
  @ApiProperty({ type: [ScenarioDto] })
  @ValidateNested({ each: true })
  @Type(() => ScenarioDto)
  scenarios!: ScenarioDto[];
}

