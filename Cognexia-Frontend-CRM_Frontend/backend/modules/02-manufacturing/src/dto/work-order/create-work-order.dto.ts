import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWorkOrderDto {
  @IsNotEmpty()
  @IsString()
  orderNumber: string;

  @IsNotEmpty()
  @IsString()
  productionOrderId: string;

  @IsNotEmpty()
  @IsString()
  workCenterId: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  scheduledStartTime: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  scheduledEndTime: Date;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  operatorId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  setupTime?: number;

  @IsOptional()
  @IsNumber()
  runTime?: number;
}
