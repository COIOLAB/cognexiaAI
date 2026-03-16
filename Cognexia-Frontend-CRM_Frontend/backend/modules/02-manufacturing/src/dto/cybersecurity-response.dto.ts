import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SecurityLevel, ThreatLevel, ComplianceFramework } from '../entities/Cybersecurity';

export class CybersecurityResponseDto {
  @ApiProperty({ description: 'Cybersecurity unique identifier' })
  id: string;

  @ApiProperty({ description: 'Security code' })
  securityCode: string;

  @ApiProperty({ description: 'Security name' })
  securityName: string;

  @ApiPropertyOptional({ description: 'Security description' })
  description?: string;

  @ApiProperty({ description: 'Security level', enum: SecurityLevel })
  securityLevel: SecurityLevel;

  @ApiProperty({ description: 'Current threat level', enum: ThreatLevel })
  currentThreatLevel: ThreatLevel;

  @ApiProperty({ description: 'Compliance framework', enum: ComplianceFramework })
  complianceFramework: ComplianceFramework;

  @ApiPropertyOptional({ description: 'Security infrastructure configuration' })
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
  workCenterId?: string;

  @ApiPropertyOptional({ description: 'Quantum security enabled' })
  quantumSecurityEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Blockchain security enabled' })
  blockchainSecurityEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Annual security budget' })
  annualSecurityBudget?: number;

  @ApiPropertyOptional({ description: 'Security metrics' })
  securityMetrics?: {
    incidents: number;
    vulnerabilities: number;
    patchingRate: number;
    trainingCompletion: number;
    complianceScore: number;
    riskScore: number;
    maturityLevel: number;
  };

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}