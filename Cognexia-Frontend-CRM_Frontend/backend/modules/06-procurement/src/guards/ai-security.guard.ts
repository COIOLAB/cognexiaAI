// Industry 5.0 ERP Backend - Procurement Module
// AI Security Guard - Advanced security for AI and blockchain operations
// Author: AI Assistant - Industry 5.0 Pioneer
// Date: 2024

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
  BadRequestException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ProcurementUser } from '../strategies/jwt.strategy';

export interface AIOperationConfig {
  maxDataPoints?: number;
  maxProcessingTime?: number; // in seconds
  requiresHumanApproval?: boolean;
  sensitivityLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiredClearanceLevel?: number;
  allowedDataSources?: string[];
  restrictedCategories?: string[];
  maxCostImpact?: number;
}

export interface BlockchainOperationConfig {
  maxTransactionValue?: number;
  requiredSignatures?: number;
  networkRestrictions?: string[];
  gasLimit?: number;
  requiresMultiSig?: boolean;
  allowedSmartContracts?: string[];
}

export interface DataPrivacyConfig {
  piiProtection?: boolean;
  dataClassification?: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'SECRET';
  retentionPeriod?: number; // in days
  anonymizationRequired?: boolean;
  geoRestrictions?: string[];
  complianceFrameworks?: string[];
}

@Injectable()
export class AISecurityGuard implements CanActivate {
  private readonly logger = new Logger(AISecurityGuard.name);

  // Rate limiting for AI operations (simple in-memory store)
  private readonly aiOperationLimits = new Map<string, { count: number; resetTime: number }>();
  private readonly blockchainLimits = new Map<string, { count: number; resetTime: number }>();

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as ProcurementUser;

    if (!user) {
      this.logger.warn('No user found in request for AI security check');
      throw new ForbiddenException('Authentication required');
    }

    // Get security configurations from metadata
    const aiConfig = this.reflector.get<AIOperationConfig>('aiOperationConfig', context.getHandler());
    const blockchainConfig = this.reflector.get<BlockchainOperationConfig>('blockchainConfig', context.getHandler());
    const privacyConfig = this.reflector.get<DataPrivacyConfig>('dataPrivacyConfig', context.getHandler());

    const endpoint = `${request.method} ${request.url}`;

    try {
      // Validate AI operations
      if (aiConfig) {
        await this.validateAIOperation(request, user, aiConfig);
      }

      // Validate blockchain operations
      if (blockchainConfig) {
        await this.validateBlockchainOperation(request, user, blockchainConfig);
      }

      // Validate data privacy requirements
      if (privacyConfig) {
        await this.validateDataPrivacy(request, user, privacyConfig);
      }

      // Apply rate limiting
      await this.checkRateLimits(user, aiConfig, blockchainConfig);

      // Log security validation success
      this.logger.log(`AI/Blockchain security validation passed for user ${user.email} on ${endpoint}`);

      return true;
    } catch (error) {
      this.logger.error(
        `AI/Blockchain security validation failed for user ${user.email} on ${endpoint}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  private async validateAIOperation(
    request: Request,
    user: ProcurementUser,
    config: AIOperationConfig
  ): Promise<void> {
    const body = request.body;

    // Check sensitivity level clearance
    if (config.sensitivityLevel && config.requiredClearanceLevel) {
      if (user.securityClearanceLevel < config.requiredClearanceLevel) {
        throw new ForbiddenException(
          `AI operation requires clearance level ${config.requiredClearanceLevel}, but user has level ${user.securityClearanceLevel}`
        );
      }
    }

    // Validate data points limit
    if (config.maxDataPoints && body.dataPoints) {
      const dataPointCount = Array.isArray(body.dataPoints) ? body.dataPoints.length : 1;
      if (dataPointCount > config.maxDataPoints) {
        throw new BadRequestException(
          `Request contains ${dataPointCount} data points, but maximum allowed is ${config.maxDataPoints}`
        );
      }
    }

    // Validate data sources
    if (config.allowedDataSources && body.dataSources) {
      const invalidSources = body.dataSources.filter(
        (source: string) => !config.allowedDataSources!.includes(source)
      );
      if (invalidSources.length > 0) {
        throw new ForbiddenException(
          `Unauthorized data sources detected: ${invalidSources.join(', ')}`
        );
      }
    }

    // Check for restricted categories in AI analysis
    if (config.restrictedCategories && body.categories) {
      const restrictedFound = body.categories.filter(
        (category: string) => config.restrictedCategories!.includes(category)
      );
      if (restrictedFound.length > 0) {
        throw new ForbiddenException(
          `AI analysis not permitted for restricted categories: ${restrictedFound.join(', ')}`
        );
      }
    }

    // Validate cost impact
    if (config.maxCostImpact && body.estimatedCostImpact) {
      if (body.estimatedCostImpact > config.maxCostImpact) {
        throw new ForbiddenException(
          `Estimated cost impact $${body.estimatedCostImpact.toLocaleString()} exceeds maximum allowed $${config.maxCostImpact.toLocaleString()}`
        );
      }
    }

    // Check for human approval requirement
    if (config.requiresHumanApproval && !body.humanApprovalId) {
      throw new BadRequestException(
        'This AI operation requires human approval. Please provide humanApprovalId.'
      );
    }

    // Log high-sensitivity AI operations
    if (config.sensitivityLevel === 'CRITICAL' || config.sensitivityLevel === 'HIGH') {
      this.logger.warn(
        `High-sensitivity AI operation initiated by user ${user.email}: ${config.sensitivityLevel} level`
      );
    }
  }

  private async validateBlockchainOperation(
    request: Request,
    user: ProcurementUser,
    config: BlockchainOperationConfig
  ): Promise<void> {
    const body = request.body;

    // Validate transaction value
    if (config.maxTransactionValue && body.transactionValue) {
      if (body.transactionValue > config.maxTransactionValue) {
        throw new ForbiddenException(
          `Transaction value $${body.transactionValue.toLocaleString()} exceeds maximum allowed $${config.maxTransactionValue.toLocaleString()}`
        );
      }
    }

    // Check required signatures
    if (config.requiredSignatures && body.signatures) {
      if (body.signatures.length < config.requiredSignatures) {
        throw new BadRequestException(
          `Operation requires ${config.requiredSignatures} signatures, but only ${body.signatures.length} provided`
        );
      }
    }

    // Validate network restrictions
    if (config.networkRestrictions && body.targetNetwork) {
      if (!config.networkRestrictions.includes(body.targetNetwork)) {
        throw new ForbiddenException(
          `Operations not allowed on network: ${body.targetNetwork}`
        );
      }
    }

    // Check gas limit
    if (config.gasLimit && body.gasLimit) {
      if (body.gasLimit > config.gasLimit) {
        throw new BadRequestException(
          `Gas limit ${body.gasLimit} exceeds maximum allowed ${config.gasLimit}`
        );
      }
    }

    // Validate smart contract allowlist
    if (config.allowedSmartContracts && body.contractAddress) {
      if (!config.allowedSmartContracts.includes(body.contractAddress)) {
        throw new ForbiddenException(
          `Smart contract ${body.contractAddress} is not in the approved list`
        );
      }
    }

    // Check multi-signature requirement
    if (config.requiresMultiSig && !body.multiSigWallet) {
      throw new BadRequestException(
        'This operation requires multi-signature wallet execution'
      );
    }

    // Log high-value blockchain operations
    if (body.transactionValue && body.transactionValue > 50000) {
      this.logger.warn(
        `High-value blockchain operation initiated by user ${user.email}: $${body.transactionValue.toLocaleString()}`
      );
    }
  }

  private async validateDataPrivacy(
    request: Request,
    user: ProcurementUser,
    config: DataPrivacyConfig
  ): Promise<void> {
    const body = request.body;

    // Check data classification access
    if (config.dataClassification) {
      const requiredClearance = this.getRequiredClearanceForClassification(config.dataClassification);
      if (user.securityClearanceLevel < requiredClearance) {
        throw new ForbiddenException(
          `Access to ${config.dataClassification} data requires clearance level ${requiredClearance}`
        );
      }
    }

    // Validate PII protection
    if (config.piiProtection && body.containsPII === undefined) {
      throw new BadRequestException(
        'Request must indicate whether it contains PII when PII protection is enabled'
      );
    }

    if (config.piiProtection && body.containsPII && !body.piiConsent) {
      throw new BadRequestException(
        'PII processing requires explicit consent'
      );
    }

    // Check geographic restrictions
    if (config.geoRestrictions && body.processingLocation) {
      if (config.geoRestrictions.includes(body.processingLocation)) {
        throw new ForbiddenException(
          `Data processing not allowed in location: ${body.processingLocation}`
        );
      }
    }

    // Validate compliance frameworks
    if (config.complianceFrameworks && body.complianceRequired) {
      const missingCompliance = config.complianceFrameworks.filter(
        framework => !body.complianceFrameworks?.includes(framework)
      );
      if (missingCompliance.length > 0) {
        throw new BadRequestException(
          `Missing required compliance frameworks: ${missingCompliance.join(', ')}`
        );
      }
    }

    // Check anonymization requirement
    if (config.anonymizationRequired && !body.isAnonymized) {
      throw new BadRequestException(
        'Data must be anonymized for this operation'
      );
    }

    // Validate data retention period
    if (config.retentionPeriod && body.retentionDays) {
      if (body.retentionDays > config.retentionPeriod) {
        throw new BadRequestException(
          `Requested retention period ${body.retentionDays} days exceeds maximum allowed ${config.retentionPeriod} days`
        );
      }
    }
  }

  private async checkRateLimits(
    user: ProcurementUser,
    aiConfig?: AIOperationConfig,
    blockchainConfig?: BlockchainOperationConfig
  ): Promise<void> {
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour window

    // AI operation rate limiting
    if (aiConfig) {
      const aiLimit = this.getAIRateLimit(user, aiConfig);
      const aiKey = `ai_${user.id}`;
      
      const aiLimitData = this.aiOperationLimits.get(aiKey);
      if (!aiLimitData || now > aiLimitData.resetTime) {
        this.aiOperationLimits.set(aiKey, { count: 1, resetTime: now + windowMs });
      } else {
        aiLimitData.count++;
        if (aiLimitData.count > aiLimit) {
          throw new ForbiddenException(
            `AI operation rate limit exceeded. Maximum ${aiLimit} operations per hour.`
          );
        }
      }
    }

    // Blockchain operation rate limiting
    if (blockchainConfig) {
      const blockchainLimit = this.getBlockchainRateLimit(user, blockchainConfig);
      const blockchainKey = `blockchain_${user.id}`;
      
      const blockchainLimitData = this.blockchainLimits.get(blockchainKey);
      if (!blockchainLimitData || now > blockchainLimitData.resetTime) {
        this.blockchainLimits.set(blockchainKey, { count: 1, resetTime: now + windowMs });
      } else {
        blockchainLimitData.count++;
        if (blockchainLimitData.count > blockchainLimit) {
          throw new ForbiddenException(
            `Blockchain operation rate limit exceeded. Maximum ${blockchainLimit} operations per hour.`
          );
        }
      }
    }
  }

  private getRequiredClearanceForClassification(classification: string): number {
    switch (classification) {
      case 'PUBLIC': return 1;
      case 'INTERNAL': return 2;
      case 'CONFIDENTIAL': return 3;
      case 'SECRET': return 4;
      default: return 2;
    }
  }

  private getAIRateLimit(user: ProcurementUser, config: AIOperationConfig): number {
    // Base limits by user role
    const baseLimits = {
      'admin': 1000,
      'procurement_admin': 500,
      'procurement_manager': 200,
      'senior_buyer': 100,
      'buyer': 50,
      'requester': 20,
      'viewer': 10
    };

    const userLimit = user.roles.reduce((max, role) => 
      Math.max(max, baseLimits[role] || 10), 0
    );

    // Adjust based on sensitivity level
    const sensitivityMultiplier = {
      'LOW': 1.0,
      'MEDIUM': 0.5,
      'HIGH': 0.2,
      'CRITICAL': 0.1
    };

    const multiplier = config.sensitivityLevel ? 
      sensitivityMultiplier[config.sensitivityLevel] : 1.0;

    return Math.floor(userLimit * multiplier);
  }

  private getBlockchainRateLimit(user: ProcurementUser, config: BlockchainOperationConfig): number {
    // More restrictive limits for blockchain operations
    const baseLimits = {
      'admin': 100,
      'procurement_admin': 50,
      'procurement_manager': 20,
      'senior_buyer': 10,
      'buyer': 5,
      'requester': 2,
      'viewer': 1
    };

    return user.roles.reduce((max, role) => 
      Math.max(max, baseLimits[role] || 1), 1
    );
  }
}

// Decorators for AI/Blockchain security configurations
export const ConfigureAISecurity = (config: AIOperationConfig) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata('aiOperationConfig', config)(target, propertyKey, descriptor);
    return descriptor;
  };
};

export const ConfigureBlockchainSecurity = (config: BlockchainOperationConfig) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata('blockchainConfig', config)(target, propertyKey, descriptor);
    return descriptor;
  };
};

export const ConfigureDataPrivacy = (config: DataPrivacyConfig) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata('dataPrivacyConfig', config)(target, propertyKey, descriptor);
    return descriptor;
  };
};

// Pre-configured security levels
export const RequireHighSecurityAI = () => ConfigureAISecurity({
  sensitivityLevel: 'HIGH',
  requiredClearanceLevel: 3,
  requiresHumanApproval: true,
  maxDataPoints: 1000,
  maxCostImpact: 100000
});

export const RequireCriticalAI = () => ConfigureAISecurity({
  sensitivityLevel: 'CRITICAL',
  requiredClearanceLevel: 4,
  requiresHumanApproval: true,
  maxDataPoints: 100,
  maxCostImpact: 50000
});

export const RequireSecureBlockchain = () => ConfigureBlockchainSecurity({
  maxTransactionValue: 1000000,
  requiredSignatures: 2,
  requiresMultiSig: true,
  gasLimit: 500000
});

export const RequireHighValueBlockchain = () => ConfigureBlockchainSecurity({
  maxTransactionValue: 10000000,
  requiredSignatures: 3,
  requiresMultiSig: true,
  gasLimit: 1000000
});

export const RequirePIIProtection = () => ConfigureDataPrivacy({
  piiProtection: true,
  dataClassification: 'CONFIDENTIAL',
  anonymizationRequired: true,
  complianceFrameworks: ['GDPR', 'CCPA']
});

export const RequireConfidentialData = () => ConfigureDataPrivacy({
  dataClassification: 'CONFIDENTIAL',
  retentionPeriod: 365,
  geoRestrictions: ['CN', 'RU', 'IR', 'KP'],
  complianceFrameworks: ['SOX', 'GDPR']
});
