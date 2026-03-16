import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsObject, IsBoolean, IsNumber } from 'class-validator';
import { SecurityLevel, ThreatLevel, ComplianceFramework } from '../entities/Cybersecurity';

export class CreateCybersecurityDto {
  @ApiProperty({ description: 'Security code' })
  @IsString()
  securityCode: string;

  @ApiProperty({ description: 'Security name' })
  @IsString()
  securityName: string;

  @ApiPropertyOptional({ description: 'Security description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Security level', enum: SecurityLevel })
  @IsEnum(SecurityLevel)
  securityLevel: SecurityLevel;

  @ApiProperty({ description: 'Current threat level', enum: ThreatLevel })
  @IsEnum(ThreatLevel)
  currentThreatLevel: ThreatLevel;

  @ApiProperty({ description: 'Compliance framework', enum: ComplianceFramework })
  @IsEnum(ComplianceFramework)
  complianceFramework: ComplianceFramework;

  @ApiPropertyOptional({ description: 'Security infrastructure configuration' })
  @IsOptional()
  @IsObject()
  securityInfrastructure?: {
    firewalls: object[];
    intrusion: object[];
    antimalware: object[];
    encryption: object[];
    authentication: object[];
    authorization: object[];
    monitoring: object[];
    backup: object[];
  };

  @ApiPropertyOptional({ description: 'Network security configuration' })
  @IsOptional()
  @IsObject()
  networkSecurity?: {
    segmentation: boolean;
    vlans: object[];
    dmz: boolean;
    vpn: object[];
    idsIps: object[];
    ddosProtection: boolean;
    trafficAnalysis: boolean;
    zeroTrust: boolean;
  };

  @ApiPropertyOptional({ description: 'Endpoint security configuration' })
  @IsOptional()
  @IsObject()
  endpointSecurity?: {
    antivirus: boolean;
    edr: boolean;
    deviceControl: boolean;
    patchManagement: boolean;
    privilegedAccess: boolean;
    mobileDeviceManagement: boolean;
    ueba: boolean;
  };

  @ApiPropertyOptional({ description: 'Identity management configuration' })
  @IsOptional()
  @IsObject()
  identityManagement?: {
    sso: boolean;
    mfa: boolean;
    pam: boolean;
    rbac: boolean;
    identityFederation: boolean;
    biometricAuth: boolean;
    zeroTrustAccess: boolean;
  };

  @ApiPropertyOptional({ description: 'Data protection configuration' })
  @IsOptional()
  @IsObject()
  dataProtection?: {
    encryption: object;
    dlp: boolean;
    backup: object;
    archival: object;
    dataClassification: object;
    privacyControls: object;
    anonymization: boolean;
    pseudonymization: boolean;
  };

  @ApiPropertyOptional({ description: 'Work center ID' })
  @IsOptional()
  @IsString()
  workCenterId?: string;

  @ApiPropertyOptional({ description: 'Quantum security enabled' })
  @IsOptional()
  @IsBoolean()
  quantumSecurityEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Blockchain security enabled' })
  @IsOptional()
  @IsBoolean()
  blockchainSecurityEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Annual security budget' })
  @IsOptional()
  @IsNumber()
  annualSecurityBudget?: number;
}