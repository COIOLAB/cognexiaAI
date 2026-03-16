import { IsEnum, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserTier {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ADVANCED = 'advanced',
}

export interface TierConfiguration {
  basic: {
    enabled: boolean;
    maxUsers: number;
  };
  premium: {
    enabled: boolean;
    maxUsers: number;
  };
  advanced: {
    enabled: boolean;
    maxUsers: number | null; // null = unlimited
  };
}

export class UpdateUserTierDto {
  @ApiProperty({ enum: UserTier, description: 'User tier to update' })
  @IsEnum(UserTier)
  tier: UserTier;

  @ApiProperty({ description: 'Enable or disable this tier' })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ description: 'Custom max users (optional)' })
  @IsOptional()
  @IsNumber()
  customMaxUsers?: number;
}

export class UserTierAllocationDto {
  @ApiProperty({ description: 'Organization ID' })
  organizationId: string;

  @ApiProperty({ description: 'Current active tier' })
  activeTier: UserTier;

  @ApiProperty({ description: 'Tier configurations' })
  tierConfig: TierConfiguration;

  @ApiProperty({ description: 'Current user count' })
  currentUserCount: number;

  @ApiProperty({ description: 'Max allowed users' })
  maxAllowedUsers: number | null;

  @ApiProperty({ description: 'Can add more users' })
  canAddUsers: boolean;
}

export class UserAllocationResponse {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Updated tier allocation' })
  allocation?: UserTierAllocationDto;
}
