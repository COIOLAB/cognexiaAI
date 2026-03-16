import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';

export class ImpersonateUserDto {
  @ApiProperty()
  @IsString()
  targetUserId: string;

  @ApiProperty()
  @IsString()
  reason: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ImpersonationResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  impersonationToken: string;

  @ApiProperty()
  targetUser: {
    id: string;
    email: string;
    name: string;
    organizationId: string;
  };

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  sessionId: string;
}

export class ActiveImpersonationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  adminEmail: string;

  @ApiProperty()
  targetEmail: string;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty()
  duration: number; // in seconds

  @ApiProperty()
  isActive: boolean;
}

export class UserSearchDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  organizationId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  status?: string;
}

export class BulkUserActionDto {
  @ApiProperty({ type: [String] })
  userIds: string[];

  @ApiProperty()
  @IsString()
  action: 'activate' | 'deactivate' | 'delete' | 'reset_password';

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class ForceLogoutDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}
