import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export class CreateDigitalTwinDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  entityType: string;

  @IsNotEmpty()
  @IsString()
  entityId: string;

  @IsOptional()
  @IsObject()
  model?: any;

  @IsOptional()
  @IsObject()
  configuration?: any;

  @IsOptional()
  @IsString()
  status?: string;
}
