import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { TransactionType, TransactionStatus } from '../entities/revenue-transaction.entity';

export class CreateTransactionDto {
  @ApiProperty()
  @IsString()
  organizationId: string;

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class RevenueOverviewDto {
  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  mrr: number;

  @ApiProperty()
  arr: number;

  @ApiProperty()
  churnRate: number;

  @ApiProperty()
  failedPayments: number;

  @ApiProperty()
  refundedAmount: number;

  @ApiProperty()
  revenueByTier: {
    basic: number;
    premium: number;
    advanced: number;
  };
}

export class ChurnAnalysisDto {
  @ApiProperty()
  churnRate: number;

  @ApiProperty()
  churnedOrganizations: number;

  @ApiProperty()
  churnRevenueLoss: number;

  @ApiProperty({ type: [Object] })
  churnReasons: Array<{ reason: string; count: number }>;

  @ApiProperty({ type: [Object] })
  churnTrend: Array<{ month: string; churnRate: number }>;
}

export class GetTransactionsQueryDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  organizationId?: string;

  @ApiProperty({ enum: TransactionType, required: false })
  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;

  @ApiProperty({ enum: TransactionStatus, required: false })
  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class FailedPaymentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  organizationName: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  failureReason: string;

  @ApiProperty()
  attemptCount: number;

  @ApiProperty()
  nextRetryDate: Date;

  @ApiProperty()
  createdAt: Date;
}
