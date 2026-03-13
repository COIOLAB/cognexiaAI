import { IsString, IsDateString, IsNumber, IsEnum, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFinancialCohortDto {
  @ApiProperty()
  @IsDateString()
  cohort_month: string;

  @ApiProperty({ enum: ['signup_month', 'tier', 'industry', 'region'] })
  @IsEnum(['signup_month', 'tier', 'industry', 'region'])
  cohort_type: string;

  @ApiProperty()
  @IsString()
  cohort_name: string;

  @ApiProperty()
  @IsNumber()
  initial_customers: number;

  @ApiProperty()
  @IsNumber()
  initial_mrr: number;
}

export class CohortAnalysisQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['signup_month', 'tier', 'industry', 'region'])
  cohort_type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  end_date?: string;
}

export class CreateInvoiceDto {
  @ApiProperty()
  @IsUUID()
  organization_id: string;

  @ApiProperty()
  @IsDateString()
  invoice_date: string;

  @ApiProperty()
  @IsDateString()
  due_date: string;

  @ApiProperty()
  @IsArray()
  line_items: {
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  tax_amount?: number;
}

export class UpdateInvoiceStatusDto {
  @ApiProperty({ enum: ['draft', 'pending', 'paid', 'overdue', 'cancelled', 'refunded'] })
  @IsEnum(['draft', 'pending', 'paid', 'overdue', 'cancelled', 'refunded'])
  status: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  payment_method?: string;
}
