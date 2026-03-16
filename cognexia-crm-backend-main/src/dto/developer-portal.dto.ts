import { IsUUID, IsString, IsOptional, IsBoolean, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSandboxDto {
  @ApiProperty()
  @IsUUID()
  organizationId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  auto_reset?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}

export class SeedSandboxDataDto {
  @ApiProperty()
  @IsString()
  sandbox_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  seed_type?: string;
}

export class CreateDeploymentDto {
  @ApiProperty({ enum: ['development', 'staging', 'production'] })
  @IsEnum(['development', 'staging', 'production'])
  environment: string;

  @ApiProperty()
  @IsString()
  version_tag: string;

  @ApiProperty()
  @IsString()
  git_commit_sha: string;

  @ApiProperty({ enum: ['rolling', 'blue_green', 'canary', 'recreate'] })
  @IsEnum(['rolling', 'blue_green', 'canary', 'recreate'])
  deployment_strategy: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  release_notes?: string;
}

export class UpdateDeploymentDto {
  @ApiProperty({ enum: ['pending', 'in_progress', 'completed', 'failed', 'rolled_back'], required: false })
  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'failed', 'rolled_back'])
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  rollout_percentage?: number;
}
