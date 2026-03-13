import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreateIoTDeviceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  deviceType: string;

  @IsNotEmpty()
  @IsString()
  serialNumber: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  configuration?: any;

  @IsOptional()
  @IsString()
  workCenterId?: string;
}
