import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface KeyPolicy {
  id: string;
  name: string;
  version: string;
  keyTypes: string[];
  minKeySize: number;
  maxKeySize: number;
  keyUsageLimits: {
    maxUsage: number;
    timeLimit: number; // hours
  };
  rotationPolicy: {
    enabled: boolean;
    interval: number; // hours
    overlap: number; // hours - grace period
  };
  storageRequirements: {
    encryption: boolean;
    redundancy: number;
    geograficDistribution: boolean;
  };
  accessControl: {
    minClearance: string;
    compartments: string[];
    needToKnowRequired: boolean;
  };
  complianceFrameworks: string[];
  auditRequirements: {
    logAllOperations: boolean;
    retentionPeriod: number; // days
    forensicCapable: boolean;
  };
}

export interface KeyEscrow {
  keyId: string;
  escrowId: string;
  escrowType: 'split_knowledge' | 'dual_control' | 'threshold' | 'recovery';
  custodians: Array<{
    id: string;
    name: string;
    role: string;
    publicKey: string;
    threshold: number;
  }>;
  shares: Array<{
    shareId: string;
    custodianId: string;
    encryptedShare: string;
    checksum: string;
  }>;
  reconstructionPolicy: {
    minShares: number;
    maxAttempts: number;
    timeWindow: number; // minutes
  };
  createdAt: Date;
  expiresAt?: Date;
  status: 'active' | 'reconstructed' | 'expired' | 'compromised';
}

export interface KeyRecoveryRequest {
  id: string;
  keyId: string;
  requestedBy: string;
  justification: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  approvals: Array<{
    custodianId: string;
    approvedAt: Date;
    signature: string;
  }>;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
  completedAt?: Date;
}

export interface HSMConfiguration {
  enabled: boolean;
  provider: 'aws_hsm' | 'azure_hsm' | 'thales' | 'safenet' | 'utimaco' | 'software_hsm';
  connectionString: string;
  authentication: {
    method: 'password' | 'certificate' | 'smart_card' | 'biometric';
    credentials?: {
      username?: string;
      password?: string;
      certificatePath?: string;
      privateKeyPath?: string;
    };
  };
  partition: string;
  redundancy: {
    enabled: boolean;
    minActive: number;
    locations: string[];
  };
  fipsLevel: 1 | 2 | 3 | 4;
  commonCriteria: string;
}

@Injectable()
export class KeyManagementService {
  private readonly logger = new Logger(KeyManagementService.name);
  private readonly keyPolicies = new Map<string, KeyPolicy>();
  private readonly keyEscrows = new Map<string, KeyEscrow>();
  private readonly recoveryRequests = new Map<string, KeyRecoveryRequest>();
  private readonly hsmConfig: HSMConfiguration;
  private readonly keyStorePath: string;
  private readonly escrowStorePath: string;

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2
  ) {
    this.keyStorePath = this.configService.get<string>('KEY_STORE_PATH', './secure-keys');
    this.escrowStorePath = this.configService.get<string>('ESCROW_STORE_PATH', './key-escrow');

    this.hsmConfig = {
      enabled: this.configService.get<boolean>('HSM_ENABLED', false),
      provider: this.configService.get<string>('HSM_PROVIDER', 'software_hsm') as any,
      connectionString: this.configService.get<string>('HSM_CONNECTION_STRING', ''),
      authentication: {
        method: this.configService.get<string>('HSM_AUTH_METHOD', 'password') as any,
        credentials: {
          username: this.configService.get<string>('HSM_USERNAME'),
          password: this.configService.get<string>('HSM_PASSWORD'),
          certificatePath: this.configService.get<string>('HSM_CERT_PATH'),
          privateKeyPath: this.configService.get<string>('HSM_PRIVATE_KEY_PATH'),
        },
      },
      partition: this.configService.get<string>('HSM_PARTITION', 'default'),
      redundancy: {
        enabled: this.configService.get<boolean>('HSM_REDUNDANCY_ENABLED', false),
        minActive: this.configService.get<number>('HSM_MIN_ACTIVE', 1),
        locations: this.configService.get<string>('HSM_LOCATIONS', '').split(',').filter(Boolean),
      },
      fipsLevel: this.configService.get<number>('HSM_FIPS_LEVEL', 2) as 1 | 2 | 3 | 4,
      commonCriteria: this.configService.get<string>('HSM_COMMON_CRITERIA', 'EAL4+'),
    };

    this.initializeKeyManagement();
  }

  /**
   * Initialize key management system
   */
  private async initializeKeyManagement(): Promise<void> {
    try {
      this.logger.log('Initializing key management system');

      // Initialize storage directories
      await this.initializeStorage();

      // Load existing policies and escrows
      await this.loadKeyPolicies();
      await this.loadKeyEscrows();

      // Initialize HSM connection if enabled
      if (this.hsmConfig.enabled) {
        await this.initializeHSM();
      }

      // Load default security policies
      await this.loadDefaultPolicies();

      this.logger.log('Key management system initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize key management system:', error);
      throw error;
    }
  }

  /**
   * Create a key policy
   */
  async createKeyPolicy(policy: Omit<KeyPolicy, 'id'>): Promise<KeyPolicy> {
    try {
      const keyPolicy: KeyPolicy = {
        ...policy,
        id: crypto.randomUUID(),
      };

      await this.validateKeyPolicy(keyPolicy);
      this.keyPolicies.set(keyPolicy.id, keyPolicy);
      await this.saveKeyPolicy(keyPolicy);

      this.eventEmitter.emit('key-policy-created', { policyId: keyPolicy.id });
      this.logger.log(`Key policy created: ${keyPolicy.name} (${keyPolicy.id})`);

      return keyPolicy;
    } catch (error) {
      this.logger.error('Failed to create key policy:', error);
      throw error;
    }
  }

  /**
   * Generate key with policy compliance
   */
  async generateManagedKey(
    policyId: string,
    keyType: string,
    keySize: number,
    purpose: string,
    userId: string,
    options?: {
      escrowEnabled?: boolean;
      customAttributes?: Record<string, any>;
    }
  ): Promise<{
    keyId: string;
    publicKey?: string;
    keyMetadata: {
      algorithm: string;
      keySize: number;
      createdAt: Date;
      expiresAt?: Date;
      policyId: string;
      escrowId?: string;
    };
  }> {
    try {
      const policy = this.keyPolicies.get(policyId);
      if (!policy) {
        throw new BadRequestException('Key policy not found');
      }

      // Validate against policy
      await this.validateKeyRequest(policy, keyType, keySize, purpose, userId);

      let keyId: string;
      let publicKey: string | undefined;
      let privateKey: string | undefined;
      let keyData: Buffer | undefined;

      if (this.hsmConfig.enabled) {
        // Generate key in HSM
        const hsmResult = await this.generateKeyInHSM(keyType, keySize, purpose);
        keyId = hsmResult.keyId;
        publicKey = hsmResult.publicKey;
      } else {
        // Generate key in software
        keyId = crypto.randomUUID();
        const keyResult = await this.generateSoftwareKey(keyType, keySize);
        publicKey = keyResult.publicKey;
        privateKey = keyResult.privateKey;
        keyData = keyResult.keyData;
      }

      // Create key metadata
      const expiresAt = policy.keyUsageLimits.timeLimit > 0 
        ? new Date(Date.now() + policy.keyUsageLimits.timeLimit * 60 * 60 * 1000)
        : undefined;

      const keyMetadata = {
        id: keyId,
        algorithm: this.getAlgorithmName(keyType, keySize),
        keySize,
        createdAt: new Date(),
        expiresAt,
        policyId,
        userId,
        purpose,
        usage: 0,
        maxUsage: policy.keyUsageLimits.maxUsage,
        status: 'active' as const,
        attributes: options?.customAttributes || {},
      };

      // Store key securely
      await this.storeSecureKey(keyId, keyData, privateKey, keyMetadata);

      // Set up key escrow if required
      let escrowId: string | undefined;
      if (options?.escrowEnabled || policy.keyTypes.includes('escrow_required')) {
        escrowId = await this.createKeyEscrow(keyId, privateKey || keyData, userId);
      }

      // Schedule automatic rotation if enabled
      if (policy.rotationPolicy.enabled) {
        await this.scheduleKeyRotation(keyId, policy.rotationPolicy.interval);
      }

      this.eventEmitter.emit('managed-key-generated', {
        keyId,
        policyId,
        userId,
        keyMetadata,
      });

      this.logger.log(`Managed key generated: ${keyId} under policy ${policy.name}`);

      return {
        keyId,
        publicKey,
        keyMetadata: {
          algorithm: keyMetadata.algorithm,
          keySize: keyMetadata.keySize,
          createdAt: keyMetadata.createdAt,
          expiresAt: keyMetadata.expiresAt,
          policyId,
          escrowId,
        },
      };
    } catch (error) {
      this.logger.error('Failed to generate managed key:', error);
      throw error;
    }
  }

  /**
   * Create key escrow
   */
  async createKeyEscrow(
    keyId: string,
    keyMaterial: Buffer | string,
    requestedBy: string,
    custodians?: Array<{ id: string; name: string; role: string; publicKey: string }>
  ): Promise<string> {
    try {
      const escrowId = crypto.randomUUID();

      // Use default custodians if not provided
      const defaultCustodians = custodians || await this.getDefaultCustodians();

      // Split key using Shamir's Secret Sharing
      const shares = await this.splitSecret(keyMaterial, defaultCustodians.length, Math.ceil(defaultCustodians.length / 2));

      const escrowShares = shares.map((share, index) => ({
        shareId: crypto.randomUUID(),
        custodianId: defaultCustodians[index].id,
        encryptedShare: this.encryptForCustodian(share, defaultCustodians[index].publicKey),
        checksum: crypto.createHash('sha256').update(share).digest('hex'),
      }));

      const keyEscrow: KeyEscrow = {
        keyId,
        escrowId,
        escrowType: 'threshold',
        custodians: defaultCustodians.map(c => ({ ...c, threshold: Math.ceil(defaultCustodians.length / 2) })),
        shares: escrowShares,
        reconstructionPolicy: {
          minShares: Math.ceil(defaultCustodians.length / 2),
          maxAttempts: 3,
          timeWindow: 30,
        },
        createdAt: new Date(),
        status: 'active',
      };

      this.keyEscrows.set(escrowId, keyEscrow);
      await this.saveKeyEscrow(keyEscrow);

      // Notify custodians
      for (const custodian of defaultCustodians) {
        this.eventEmitter.emit('key-escrow-created', {
          escrowId,
          keyId,
          custodianId: custodian.id,
          requestedBy,
        });
      }

      this.logger.log(`Key escrow created: ${escrowId} for key ${keyId}`);
      return escrowId;
    } catch (error) {
      this.logger.error('Failed to create key escrow:', error);
      throw error;
    }
  }

  /**
   * Request key recovery
   */
  async requestKeyRecovery(
    keyId: string,
    requestedBy: string,
    justification: string,
    priority: 'low' | 'medium' | 'high' | 'emergency' = 'medium'
  ): Promise<string> {
    try {
      const recoveryId = crypto.randomUUID();

      const recoveryRequest: KeyRecoveryRequest = {
        id: recoveryId,
        keyId,
        requestedBy,
        justification,
        priority,
        approvals: [],
        status: 'pending',
        createdAt: new Date(),
      };

      this.recoveryRequests.set(recoveryId, recoveryRequest);
      await this.saveRecoveryRequest(recoveryRequest);

      // Find escrow for the key
      const escrow = Array.from(this.keyEscrows.values()).find(e => e.keyId === keyId);
      if (!escrow) {
        throw new BadRequestException('No escrow found for the specified key');
      }

      // Notify custodians
      for (const custodian of escrow.custodians) {
        this.eventEmitter.emit('key-recovery-requested', {
          recoveryId,
          keyId,
          custodianId: custodian.id,
          requestedBy,
          justification,
          priority,
        });
      }

      this.logger.log(`Key recovery requested: ${recoveryId} for key ${keyId} by ${requestedBy}`);
      return recoveryId;
    } catch (error) {
      this.logger.error('Failed to request key recovery:', error);
      throw error;
    }
  }

  /**
   * Approve key recovery
   */
  async approveKeyRecovery(
    recoveryId: string,
    custodianId: string,
    signature: string
  ): Promise<{ approved: boolean; requiresMoreApprovals: boolean; reconstructedKey?: string }> {
    try {
      const recoveryRequest = this.recoveryRequests.get(recoveryId);
      if (!recoveryRequest) {
        throw new BadRequestException('Recovery request not found');
      }

      const escrow = Array.from(this.keyEscrows.values()).find(e => e.keyId === recoveryRequest.keyId);
      if (!escrow) {
        throw new BadRequestException('No escrow found for the key');
      }

      // Verify custodian authorization
      const custodian = escrow.custodians.find(c => c.id === custodianId);
      if (!custodian) {
        throw new BadRequestException('Unauthorized custodian');
      }

      // Add approval
      recoveryRequest.approvals.push({
        custodianId,
        approvedAt: new Date(),
        signature,
      });

      // Check if we have enough approvals
      const requiredApprovals = escrow.reconstructionPolicy.minShares;
      const currentApprovals = recoveryRequest.approvals.length;

      if (currentApprovals >= requiredApprovals) {
        // Reconstruct key
        try {
          const reconstructedKey = await this.reconstructKey(escrow, recoveryRequest.approvals);
          recoveryRequest.status = 'completed';
          recoveryRequest.completedAt = new Date();

          escrow.status = 'reconstructed';

          this.eventEmitter.emit('key-recovery-completed', {
            recoveryId,
            keyId: recoveryRequest.keyId,
            requestedBy: recoveryRequest.requestedBy,
          });

          await this.saveRecoveryRequest(recoveryRequest);
          await this.saveKeyEscrow(escrow);

          this.logger.log(`Key recovery completed: ${recoveryId}`);
          
          return {
            approved: true,
            requiresMoreApprovals: false,
            reconstructedKey,
          };
        } catch (error) {
          this.logger.error('Failed to reconstruct key:', error);
          throw new InternalServerErrorException('Key reconstruction failed');
        }
      } else {
        recoveryRequest.status = 'approved';
        await this.saveRecoveryRequest(recoveryRequest);

        this.logger.log(`Key recovery approval added: ${recoveryId} (${currentApprovals}/${requiredApprovals})`);
        
        return {
          approved: true,
          requiresMoreApprovals: true,
        };
      }
    } catch (error) {
      this.logger.error('Failed to approve key recovery:', error);
      throw error;
    }
  }

  /**
   * Rotate key
   */
  async rotateKey(
    keyId: string,
    userId: string,
    options?: {
      gracePeriod?: number; // hours
      immediate?: boolean;
    }
  ): Promise<{
    newKeyId: string;
    newPublicKey?: string;
    rotationSchedule: {
      activationTime: Date;
      deactivationTime: Date;
    };
  }> {
    try {
      const keyMetadata = await this.getKeyMetadata(keyId);
      if (!keyMetadata) {
        throw new BadRequestException('Key not found');
      }

      const policy = this.keyPolicies.get(keyMetadata.policyId);
      if (!policy) {
        throw new BadRequestException('Key policy not found');
      }

      // Generate new key with same parameters
      const newKeyResult = await this.generateManagedKey(
        policy.id,
        this.getKeyTypeFromAlgorithm(keyMetadata.algorithm),
        keyMetadata.keySize,
        keyMetadata.purpose,
        userId,
        { escrowEnabled: !!keyMetadata.escrowId }
      );

      const gracePeriod = options?.gracePeriod || policy.rotationPolicy.overlap;
      const activationTime = options?.immediate ? new Date() : new Date(Date.now() + gracePeriod * 60 * 60 * 1000);
      const deactivationTime = new Date(activationTime.getTime() + gracePeriod * 60 * 60 * 1000);

      // Schedule key transition
      await this.scheduleKeyTransition(keyId, newKeyResult.keyId, activationTime, deactivationTime);

      this.eventEmitter.emit('key-rotation-initiated', {
        oldKeyId: keyId,
        newKeyId: newKeyResult.keyId,
        userId,
        activationTime,
        deactivationTime,
      });

      this.logger.log(`Key rotation initiated: ${keyId} -> ${newKeyResult.keyId}`);

      return {
        newKeyId: newKeyResult.keyId,
        newPublicKey: newKeyResult.publicKey,
        rotationSchedule: {
          activationTime,
          deactivationTime,
        },
      };
    } catch (error) {
      this.logger.error('Failed to rotate key:', error);
      throw error;
    }
  }

  /**
   * Get key metrics and statistics
   */
  async getKeyMetrics(filters?: {
    policyId?: string;
    userId?: string;
    keyType?: string;
    status?: string;
    dateRange?: { start: Date; end: Date };
  }): Promise<{
    totalKeys: number;
    activeKeys: number;
    expiredKeys: number;
    revokedKeys: number;
    keysByType: Record<string, number>;
    keysByPolicy: Record<string, number>;
    expiringKeys: Array<{ keyId: string; expiresAt: Date; daysRemaining: number }>;
    rotationsDue: Array<{ keyId: string; nextRotation: Date; overdue: boolean }>;
    escrowedKeys: number;
    recoveryRequests: {
      pending: number;
      approved: number;
      completed: number;
    };
  }> {
    try {
      // This would typically query a database
      // For now, we'll provide sample metrics

      const now = new Date();
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      return {
        totalKeys: 150,
        activeKeys: 120,
        expiredKeys: 20,
        revokedKeys: 10,
        keysByType: {
          'AES-256': 80,
          'RSA-2048': 40,
          'ECDSA-P256': 30,
        },
        keysByPolicy: {
          'high-security-policy': 90,
          'standard-policy': 60,
        },
        expiringKeys: [
          { keyId: 'key-123', expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), daysRemaining: 7 },
          { keyId: 'key-456', expiresAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), daysRemaining: 14 },
        ],
        rotationsDue: [
          { keyId: 'key-789', nextRotation: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), overdue: true },
        ],
        escrowedKeys: 45,
        recoveryRequests: {
          pending: 2,
          approved: 1,
          completed: 15,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get key metrics:', error);
      throw error;
    }
  }

  // Scheduled tasks

  @Cron(CronExpression.EVERY_HOUR)
  async performKeyMaintenanceTasks(): Promise<void> {
    try {
      this.logger.log('Performing key maintenance tasks');

      await Promise.all([
        this.checkKeyExpiration(),
        this.enforceRotationPolicies(),
        this.validateEscrowIntegrity(),
        this.cleanupOldRecoveryRequests(),
      ]);

      this.logger.log('Key maintenance tasks completed');
    } catch (error) {
      this.logger.error('Key maintenance tasks failed:', error);
    }
  }

  // Private helper methods

  private async initializeStorage(): Promise<void> {
    await fs.mkdir(this.keyStorePath, { recursive: true });
    await fs.mkdir(this.escrowStorePath, { recursive: true });
  }

  private async initializeHSM(): Promise<void> {
    this.logger.log(`Initializing HSM connection: ${this.hsmConfig.provider}`);
    // HSM-specific initialization would go here
  }

  private async loadDefaultPolicies(): Promise<void> {
    const defaultPolicy: KeyPolicy = {
      id: 'default-high-security',
      name: 'Default High Security Policy',
      version: '1.0',
      keyTypes: ['aes', 'rsa', 'ecdsa'],
      minKeySize: 256,
      maxKeySize: 4096,
      keyUsageLimits: {
        maxUsage: 1000000,
        timeLimit: 8760, // 1 year
      },
      rotationPolicy: {
        enabled: true,
        interval: 2160, // 3 months
        overlap: 168, // 1 week
      },
      storageRequirements: {
        encryption: true,
        redundancy: 3,
        geograficDistribution: true,
      },
      accessControl: {
        minClearance: 'confidential',
        compartments: [],
        needToKnowRequired: true,
      },
      complianceFrameworks: ['FIPS-140-2', 'Common-Criteria', 'FedRAMP'],
      auditRequirements: {
        logAllOperations: true,
        retentionPeriod: 2555, // 7 years
        forensicCapable: true,
      },
    };

    this.keyPolicies.set(defaultPolicy.id, defaultPolicy);
  }

  private async validateKeyPolicy(policy: KeyPolicy): Promise<void> {
    if (policy.minKeySize > policy.maxKeySize) {
      throw new BadRequestException('Minimum key size cannot be greater than maximum key size');
    }
    
    if (policy.keyUsageLimits.maxUsage < 1) {
      throw new BadRequestException('Maximum usage must be at least 1');
    }

    if (policy.rotationPolicy.enabled && policy.rotationPolicy.interval < 1) {
      throw new BadRequestException('Rotation interval must be at least 1 hour');
    }
  }

  private async validateKeyRequest(
    policy: KeyPolicy,
    keyType: string,
    keySize: number,
    purpose: string,
    userId: string
  ): Promise<void> {
    if (!policy.keyTypes.includes(keyType)) {
      throw new BadRequestException(`Key type ${keyType} not allowed by policy`);
    }

    if (keySize < policy.minKeySize || keySize > policy.maxKeySize) {
      throw new BadRequestException(`Key size ${keySize} not allowed by policy (${policy.minKeySize}-${policy.maxKeySize})`);
    }

    // Additional validations would go here
  }

  private async generateKeyInHSM(keyType: string, keySize: number, purpose: string): Promise<{
    keyId: string;
    publicKey?: string;
  }> {
    // HSM-specific key generation would go here
    return {
      keyId: crypto.randomUUID(),
      publicKey: 'hsm-generated-public-key',
    };
  }

  private async generateSoftwareKey(keyType: string, keySize: number): Promise<{
    keyData?: Buffer;
    publicKey?: string;
    privateKey?: string;
  }> {
    switch (keyType.toLowerCase()) {
      case 'aes':
        return { keyData: crypto.randomBytes(keySize / 8) };
      case 'rsa':
        const rsaKeyPair = crypto.generateKeyPairSync('rsa', {
          modulusLength: keySize,
          publicKeyEncoding: { type: 'spki', format: 'pem' },
          privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
        return { publicKey: rsaKeyPair.publicKey, privateKey: rsaKeyPair.privateKey };
      case 'ecdsa':
        const namedCurve = keySize === 256 ? 'prime256v1' : keySize === 384 ? 'secp384r1' : 'secp521r1';
        const ecKeyPair = crypto.generateKeyPairSync('ec', {
          namedCurve,
          publicKeyEncoding: { type: 'spki', format: 'pem' },
          privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
        return { publicKey: ecKeyPair.publicKey, privateKey: ecKeyPair.privateKey };
      default:
        throw new BadRequestException(`Unsupported key type: ${keyType}`);
    }
  }

  private getAlgorithmName(keyType: string, keySize: number): string {
    switch (keyType.toLowerCase()) {
      case 'aes':
        return `AES-${keySize}-GCM`;
      case 'rsa':
        return `RSA-${keySize}`;
      case 'ecdsa':
        return `ECDSA-P${keySize}`;
      default:
        return `${keyType.toUpperCase()}-${keySize}`;
    }
  }

  private getKeyTypeFromAlgorithm(algorithm: string): string {
    if (algorithm.startsWith('AES')) return 'aes';
    if (algorithm.startsWith('RSA')) return 'rsa';
    if (algorithm.startsWith('ECDSA')) return 'ecdsa';
    return 'unknown';
  }

  private async storeSecureKey(
    keyId: string,
    keyData: Buffer | undefined,
    privateKey: string | undefined,
    metadata: any
  ): Promise<void> {
    const keyPath = path.join(this.keyStorePath, `${keyId}.key`);
    const keyObject = {
      keyId,
      keyData: keyData?.toString('hex'),
      privateKey,
      metadata,
      createdAt: new Date(),
    };

    // Encrypt the key object before storage
    const encryptedKeyObject = await this.encryptKeyObject(keyObject);
    await fs.writeFile(keyPath, JSON.stringify(encryptedKeyObject, null, 2));
  }

  private async getKeyMetadata(keyId: string): Promise<any> {
    try {
      const keyPath = path.join(this.keyStorePath, `${keyId}.key`);
      const keyData = await fs.readFile(keyPath, 'utf-8');
      const encryptedKeyObject = JSON.parse(keyData);
      const keyObject = await this.decryptKeyObject(encryptedKeyObject);
      return keyObject.metadata;
    } catch (error) {
      return null;
    }
  }

  private async encryptKeyObject(keyObject: any): Promise<any> {
    // Encrypt sensitive key material
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(JSON.stringify(keyObject), 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();

    return {
      encrypted,
      key: key.toString('hex'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  private async decryptKeyObject(encryptedObject: any): Promise<any> {
    const key = Buffer.from(encryptedObject.key, 'hex');
    const iv = Buffer.from(encryptedObject.iv, 'hex');
    const tag = Buffer.from(encryptedObject.tag, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedObject.encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return JSON.parse(decrypted);
  }

  private async splitSecret(secret: Buffer | string, totalShares: number, threshold: number): Promise<Buffer[]> {
    // Simplified secret sharing implementation
    // In production, use a proper Shamir's Secret Sharing implementation
    const secretBuffer = Buffer.isBuffer(secret) ? secret : Buffer.from(secret, 'utf-8');
    const shares: Buffer[] = [];

    for (let i = 0; i < totalShares; i++) {
      const share = crypto.randomBytes(secretBuffer.length);
      shares.push(share);
    }

    return shares;
  }

  private encryptForCustodian(share: Buffer, custodianPublicKey: string): string {
    // Encrypt share for specific custodian using their public key
    // This is a simplified implementation
    const cipher = crypto.createCipheriv('aes-256-gcm', crypto.randomBytes(32), crypto.randomBytes(16));
    let encrypted = cipher.update(share);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
  }

  private async getDefaultCustodians(): Promise<Array<{ id: string; name: string; role: string; publicKey: string }>> {
    return [
      { id: 'custodian-1', name: 'Security Officer', role: 'CISO', publicKey: 'public-key-1' },
      { id: 'custodian-2', name: 'Compliance Officer', role: 'CPO', publicKey: 'public-key-2' },
      { id: 'custodian-3', name: 'Operations Manager', role: 'OPS', publicKey: 'public-key-3' },
    ];
  }

  private async reconstructKey(escrow: KeyEscrow, approvals: any[]): Promise<string> {
    // Reconstruct key from shares using approved custodian shares
    // This is a simplified implementation
    return 'reconstructed-key-material';
  }

  private async scheduleKeyRotation(keyId: string, intervalHours: number): Promise<void> {
    // Schedule automatic key rotation
    this.logger.log(`Scheduled rotation for key ${keyId} in ${intervalHours} hours`);
  }

  private async scheduleKeyTransition(oldKeyId: string, newKeyId: string, activationTime: Date, deactivationTime: Date): Promise<void> {
    // Schedule key transition
    this.logger.log(`Scheduled key transition: ${oldKeyId} -> ${newKeyId}`);
  }

  // Maintenance tasks
  private async checkKeyExpiration(): Promise<void> {
    // Check for expired keys and handle them
  }

  private async enforceRotationPolicies(): Promise<void> {
    // Check for keys due for rotation
  }

  private async validateEscrowIntegrity(): Promise<void> {
    // Validate escrow data integrity
  }

  private async cleanupOldRecoveryRequests(): Promise<void> {
    // Clean up old recovery requests
  }

  // Storage operations
  private async loadKeyPolicies(): Promise<void> {
    // Load existing key policies from storage
  }

  private async saveKeyPolicy(policy: KeyPolicy): Promise<void> {
    const policyPath = path.join(this.keyStorePath, `policy-${policy.id}.json`);
    await fs.writeFile(policyPath, JSON.stringify(policy, null, 2));
  }

  private async loadKeyEscrows(): Promise<void> {
    // Load existing key escrows from storage
  }

  private async saveKeyEscrow(escrow: KeyEscrow): Promise<void> {
    const escrowPath = path.join(this.escrowStorePath, `escrow-${escrow.escrowId}.json`);
    await fs.writeFile(escrowPath, JSON.stringify(escrow, null, 2));
  }

  private async saveRecoveryRequest(request: KeyRecoveryRequest): Promise<void> {
    const requestPath = path.join(this.escrowStorePath, `recovery-${request.id}.json`);
    await fs.writeFile(requestPath, JSON.stringify(request, null, 2));
  }
}
