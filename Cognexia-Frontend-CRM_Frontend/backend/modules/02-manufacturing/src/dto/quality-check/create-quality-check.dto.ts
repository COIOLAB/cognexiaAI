import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQualityCheckDto {
  @IsNotEmpty()
  @IsString()
  workOrderId: string;

  @IsNotEmpty()
  @IsString()
  checkType: string;

  @IsOptional()
  @IsString()
  inspectorId?: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  checkDate: Date;

  @IsNotEmpty()
  @IsBoolean()
  passed: boolean;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  defectType?: string;

  @IsOptional()
  @IsString()
  correctionAction?: string;
}
