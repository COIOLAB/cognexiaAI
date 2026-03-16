import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface EncryptionConfig {
  algorithm: string;
  keyDerivation: string;
  saltLength: number;
  ivLength: number;
  tagLength: number;
  iterations: number;
  keyLength: number;
}

export interface EncryptionResult {
  success: boolean;
  encryptedFilePath: string;
  algorithm: string;
  keyId: string;
  fileSize: number;
  checksum: string;
  metadata: {
    originalSize: number;
    encryptionTime: number;
    salt: string;
    iv: string;
    tag?: string;
  };
}

export interface DecryptionResult {
  success: boolean;
  decryptedFilePath: string;
  originalSize: number;
  decryptionTime: number;
  verified: boolean;
}

export interface EncryptionKey {
  id: string;
  key: Buffer;
  algorithm: string;
  createdAt: Date;
  expiresAt?: Date;
  usage: number;
  maxUsage?: number;
}

@Injectable()
export class FileEncryptionService {
  private readonly logger = new Logger(FileEncryptionService.name);
  private readonly config: EncryptionConfig;
  private readonly enableEncryption: boolean;
  private readonly masterKey: Buffer;
  private readonly keyCache = new Map<string, EncryptionKey>();
  private readonly keyStorePath: string;

  constructor(private configService: ConfigService) {
    this.enableEncryption = this.configService.get<boolean>('ENABLE_FILE_ENCRYPTION', false);
    this.keyStorePath = this.configService.get<string>('ENCRYPTION_KEY_STORE', './encryption-keys');

    this.config = {
      algorithm: this.configService.get<string>('ENCRYPTION_ALGORITHM', 'aes-256-gcm'),
      keyDerivation: this.configService.get<string>('KEY_DERIVATION_ALGORITHM', 'pbkdf2'),
      saltLength: this.configService.get<number>('ENCRYPTION_SALT_LENGTH', 32),
      ivLength: this.configService.get<number>('ENCRYPTION_IV_LENGTH', 16),
      tagLength: this.configService.get<number>('ENCRYPTION_TAG_LENGTH', 16),
      iterations: this.configService.get<number>('KEY_DERIVATION_ITERATIONS', 100000),
      keyLength: this.configService.get<number>('ENCRYPTION_KEY_LENGTH', 32),
    };

    // Initialize master key
    const masterKeyString = this.configService.get<string>('MASTER_ENCRYPTION_KEY');
    if (masterKeyString) {
      this.masterKey = Buffer.from(masterKeyString, 'hex');
    } else {
      this.masterKey = this.generateRandomKey(32);
      this.logger.warn('No master encryption key found, generated temporary key');
    }

    this.initializeKeyStore();
  }

  /**
   * Encrypt a file
   */
  async encryptFile(inputPath: string, outputPath?: string): Promise<EncryptionResult> {
    if (!this.enableEncryption) {
      throw new BadRequestException('File encryption is disabled');
    }

    const startTime = Date.now();
    
    try {
      // Validate input file
      await fs.access(inputPath);
      const inputStats = await fs.stat(inputPath);
      
      if (inputStats.size === 0) {
        throw new BadRequestException('Cannot encrypt empty file');
      }

      this.logger.debug(`Encrypting file: ${path.basename(inputPath)} (${inputStats.size} bytes)`);

      // Generate encryption key and metadata
      const keyId = crypto.randomUUID();
      const salt = crypto.randomBytes(this.config.saltLength);
      const iv = crypto.randomBytes(this.config.ivLength);
      
      // Derive encryption key
      const derivedKey = await this.deriveKey(this.masterKey, salt, this.config.iterations);
      
      // Store key for later decryption
      await this.storeEncryptionKey({
        id: keyId,
        key: derivedKey,
        algorithm: this.config.algorithm,
        createdAt: new Date(),
        usage: 0,
        maxUsage: this.configService.get<number>('MAX_KEY_USAGE', 1000),
      });

      // Perform encryption
      const encryptedPath = outputPath || `${inputPath}.encrypted`;
      const encryptionResult = await this.performEncryption(
        inputPath,
        encryptedPath,
        derivedKey,
        iv,
        salt
      );

      const encryptionTime = Date.now() - startTime;
      
      const result: EncryptionResult = {
        success: true,
        encryptedFilePath: encryptedPath,
        algorithm: this.config.algorithm,
        keyId,
        fileSize: encryptionResult.encryptedSize,
        checksum: encryptionResult.checksum,
        metadata: {
          originalSize: inputStats.size,
          encryptionTime,
          salt: salt.toString('hex'),
          iv: iv.toString('hex'),
          tag: encryptionResult.tag,
        },
      };

      this.logger.log(`File encrypted successfully: ${path.basename(inputPath)} (${encryptionTime}ms)`);
      return result;

    } catch (error) {
      this.logger.error(`File encryption failed: ${inputPath}`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt a file
   */
  async decryptFile(
    inputPath: string, 
    outputPath: string,
    encryptionMetadata: {
      keyId: string;
      salt: string;
      iv: string;
      tag?: string;
      algorithm: string;
    }
  ): Promise<DecryptionResult> {
    if (!this.enableEncryption) {
      throw new BadRequestException('File encryption is disabled');
    }

    const startTime = Date.now();
    
    try {
      // Validate input file
      await fs.access(inputPath);
      
      this.logger.debug(`Decrypting file: ${path.basename(inputPath)}`);

      // Retrieve encryption key
      const encryptionKey = await this.getEncryptionKey(encryptionMetadata.keyId);
      if (!encryptionKey) {
        // Try to regenerate key from master key and salt
        const salt = Buffer.from(encryptionMetadata.salt, 'hex');
        const regeneratedKey = await this.deriveKey(this.masterKey, salt, this.config.iterations);
        
        // Perform decryption with regenerated key
        const decryptionResult = await this.performDecryption(
          inputPath,
          outputPath,
          regeneratedKey,
          Buffer.from(encryptionMetadata.iv, 'hex'),
          encryptionMetadata.tag ? Buffer.from(encryptionMetadata.tag, 'hex') : undefined
        );

        const decryptionTime = Date.now() - startTime;
        
        this.logger.log(`File decrypted successfully: ${path.basename(inputPath)} (${decryptionTime}ms)`);
        
        return {
          success: true,
          decryptedFilePath: outputPath,
          originalSize: decryptionResult.decryptedSize,
          decryptionTime,
          verified: decryptionResult.verified,
        };
      }

      // Perform decryption with stored key
      const decryptionResult = await this.performDecryption(
        inputPath,
        outputPath,
        encryptionKey.key,
        Buffer.from(encryptionMetadata.iv, 'hex'),
        encryptionMetadata.tag ? Buffer.from(encryptionMetadata.tag, 'hex') : undefined
      );

      // Update key usage
      encryptionKey.usage++;
      await this.updateEncryptionKey(encryptionKey);

      const decryptionTime = Date.now() - startTime;
      
      this.logger.log(`File decrypted successfully: ${path.basename(inputPath)} (${decryptionTime}ms)`);
      
      return {
        success: true,
        decryptedFilePath: outputPath,
        originalSize: decryptionResult.decryptedSize,
        decryptionTime,
        verified: decryptionResult.verified,
      };

    } catch (error) {
      this.logger.error(`File decryption failed: ${inputPath}`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Encrypt data in memory
   */
  async encryptData(data: Buffer, password?: string): Promise<{
    encryptedData: Buffer;
    salt: Buffer;
    iv: Buffer;
    tag?: Buffer;
  }> {
    try {
      const salt = crypto.randomBytes(this.config.saltLength);
      const iv = crypto.randomBytes(this.config.ivLength);
      
      const key = password 
        ? await this.deriveKey(Buffer.from(password), salt, this.config.iterations)
        : await this.deriveKey(this.masterKey, salt, this.config.iterations);

      const cipher = crypto.createCipher(this.config.algorithm, key);
      cipher.setAAD(salt); // Use salt as additional authenticated data

      let encrypted = cipher.update(data);
      encrypted = Buffer.concat([encrypted, cipher.final()]);

      const tag = this.config.algorithm.includes('gcm') ? cipher.getAuthTag() : undefined;

      return {
        encryptedData: encrypted,
        salt,
        iv,
        tag,
      };

    } catch (error) {
      this.logger.error('Data encryption failed:', error);
      throw new InternalServerErrorException(`Data encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt data in memory
   */
  async decryptData(
    encryptedData: Buffer,
    salt: Buffer,
    iv: Buffer,
    tag?: Buffer,
    password?: string
  ): Promise<Buffer> {
    try {
      const key = password 
        ? await this.deriveKey(Buffer.from(password), salt, this.config.iterations)
        : await this.deriveKey(this.masterKey, salt, this.config.iterations);

      const decipher = crypto.createDecipher(this.config.algorithm, key);
      
      if (tag && this.config.algorithm.includes('gcm')) {
        decipher.setAuthTag(tag);
      }
      
      decipher.setAAD(salt);

      let decrypted = decipher.update(encryptedData);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted;

    } catch (error) {
      this.logger.error('Data decryption failed:', error);
      throw new InternalServerErrorException(`Data decryption failed: ${error.message}`);
    }
  }

  /**
   * Generate a new encryption key
   */
  async generateEncryptionKey(algorithm?: string): Promise<EncryptionKey> {
    const keyId = crypto.randomUUID();
    const key = this.generateRandomKey(this.config.keyLength);
    
    const encryptionKey: EncryptionKey = {
      id: keyId,
      key,
      algorithm: algorithm || this.config.algorithm,
      createdAt: new Date(),
      usage: 0,
      maxUsage: this.configService.get<number>('MAX_KEY_USAGE', 1000),
    };

    await this.storeEncryptionKey(encryptionKey);
    return encryptionKey;
  }

  /**
   * Rotate encryption keys
   */
  async rotateKeys(): Promise<{
    rotatedKeys: number;
    newMasterKey: string;
    errors: string[];
  }> {
    const errors: string[] = [];
    let rotatedKeys = 0;

    try {
      this.logger.log('Starting key rotation process');

      // Generate new master key
      const newMasterKey = this.generateRandomKey(32);
      
      // Re-encrypt all stored keys with new master key
      const keyFiles = await fs.readdir(this.keyStorePath);
      
      for (const keyFile of keyFiles) {
        try {
          const keyPath = path.join(this.keyStorePath, keyFile);
          const keyData = await fs.readFile(keyPath, 'utf-8');
          const encryptedKey = JSON.parse(keyData);
          
          // Decrypt with old master key
          const oldKey = await this.decryptStoredKey(encryptedKey, this.masterKey);
          
          // Encrypt with new master key
          const newEncryptedKey = await this.encryptKeyForStorage(oldKey, newMasterKey);
          
          // Save updated key
          await fs.writeFile(keyPath, JSON.stringify(newEncryptedKey, null, 2));
          
          rotatedKeys++;
          
        } catch (error) {
          const errorMsg = `Failed to rotate key ${keyFile}: ${error.message}`;
          errors.push(errorMsg);
          this.logger.error(errorMsg);
        }
      }

      this.logger.log(`Key rotation completed: ${rotatedKeys} keys rotated, ${errors.length} errors`);
      
      return {
        rotatedKeys,
        newMasterKey: newMasterKey.toString('hex'),
        errors,
      };

    } catch (error) {
      this.logger.error('Key rotation failed:', error);
      throw new InternalServerErrorException(`Key rotation failed: ${error.message}`);
    }
  }

  /**
   * Clean up expired keys
   */
  async cleanupExpiredKeys(): Promise<{ deletedKeys: number; errors: string[] }> {
    const errors: string[] = [];
    let deletedKeys = 0;

    try {
      const now = new Date();
      
      for (const [keyId, key] of this.keyCache.entries()) {
        try {
          if (key.expiresAt && key.expiresAt < now) {
            await this.deleteEncryptionKey(keyId);
            deletedKeys++;
          } else if (key.maxUsage && key.usage >= key.maxUsage) {
            await this.deleteEncryptionKey(keyId);
            deletedKeys++;
          }
        } catch (error) {
          const errorMsg = `Failed to delete expired key ${keyId}: ${error.message}`;
          errors.push(errorMsg);
          this.logger.error(errorMsg);
        }
      }

      this.logger.log(`Key cleanup completed: ${deletedKeys} keys deleted, ${errors.length} errors`);
      
      return { deletedKeys, errors };

    } catch (error) {
      this.logger.error('Key cleanup failed:', error);
      throw new InternalServerErrorException(`Key cleanup failed: ${error.message}`);
    }
  }

  // Private methods

  private async performEncryption(
    inputPath: string,
    outputPath: string,
    key: Buffer,
    iv: Buffer,
    salt: Buffer
  ): Promise<{
    encryptedSize: number;
    checksum: string;
    tag?: string;
  }> {
    return new Promise((resolve, reject) => {
      const cipher = crypto.createCipheriv(this.config.algorithm, key, iv);
      const hash = crypto.createHash('sha256');
      const inputStream = require('fs').createReadStream(inputPath);
      const outputStream = require('fs').createWriteStream(outputPath);

      let encryptedSize = 0;

      // Write metadata header
      const header = Buffer.concat([
        Buffer.from('ENC1', 'ascii'), // Magic number and version
        Buffer.from([this.config.algorithm.length]),
        Buffer.from(this.config.algorithm, 'ascii'),
        Buffer.from([this.config.saltLength]),
        salt,
        Buffer.from([this.config.ivLength]),
        iv,
      ]);

      outputStream.write(header);
      encryptedSize += header.length;

      cipher.setAAD(salt);

      inputStream.on('data', (chunk) => {
        const encrypted = cipher.update(chunk);
        outputStream.write(encrypted);
        hash.update(chunk);
        encryptedSize += encrypted.length;
      });

      inputStream.on('end', () => {
        try {
          const finalChunk = cipher.final();
          outputStream.write(finalChunk);
          encryptedSize += finalChunk.length;

          const tag = this.config.algorithm.includes('gcm') ? cipher.getAuthTag() : undefined;
          
          if (tag) {
            outputStream.write(tag);
            encryptedSize += tag.length;
          }

          outputStream.end();
          
          const checksum = hash.digest('hex');
          
          resolve({
            encryptedSize,
            checksum,
            tag: tag?.toString('hex'),
          });
          
        } catch (error) {
          reject(error);
        }
      });

      inputStream.on('error', reject);
      outputStream.on('error', reject);
    });
  }

  private async performDecryption(
    inputPath: string,
    outputPath: string,
    key: Buffer,
    iv: Buffer,
    tag?: Buffer
  ): Promise<{
    decryptedSize: number;
    verified: boolean;
  }> {
    return new Promise(async (resolve, reject) => {
      try {
        // Read and validate header
        const fileHandle = await fs.open(inputPath, 'r');
        const headerBuffer = Buffer.alloc(1024); // Max header size
        const { bytesRead } = await fileHandle.read(headerBuffer, 0, 1024, 0);
        
        let offset = 0;
        const magic = headerBuffer.slice(offset, offset + 4).toString('ascii');
        offset += 4;
        
        if (magic !== 'ENC1') {
          throw new Error('Invalid encrypted file format');
        }

        const algorithmLength = headerBuffer[offset++];
        const algorithm = headerBuffer.slice(offset, offset + algorithmLength).toString('ascii');
        offset += algorithmLength;

        const saltLength = headerBuffer[offset++];
        const salt = headerBuffer.slice(offset, offset + saltLength);
        offset += saltLength;

        const ivLength = headerBuffer[offset++];
        const storedIv = headerBuffer.slice(offset, offset + ivLength);
        offset += ivLength;

        await fileHandle.close();

        // Create streams starting after header
        const decipher = crypto.createDecipheriv(algorithm, key, storedIv);
        const hash = crypto.createHash('sha256');
        const inputStream = require('fs').createReadStream(inputPath, { start: offset });
        const outputStream = require('fs').createWriteStream(outputPath);

        let decryptedSize = 0;
        let isTagProcessed = false;

        if (tag) {
          decipher.setAuthTag(tag);
        }
        
        decipher.setAAD(salt);

        inputStream.on('data', (chunk) => {
          try {
            let dataToDecrypt = chunk;
            
            // Handle authentication tag for GCM mode
            if (algorithm.includes('gcm') && !isTagProcessed) {
              const tagSize = this.config.tagLength;
              if (chunk.length >= tagSize) {
                // Assume tag is at the end of the file
                const lastChunkTag = chunk.slice(-tagSize);
                dataToDecrypt = chunk.slice(0, -tagSize);
                decipher.setAuthTag(lastChunkTag);
                isTagProcessed = true;
              }
            }

            if (dataToDecrypt.length > 0) {
              const decrypted = decipher.update(dataToDecrypt);
              outputStream.write(decrypted);
              hash.update(decrypted);
              decryptedSize += decrypted.length;
            }
          } catch (error) {
            inputStream.destroy();
            outputStream.destroy();
            reject(error);
          }
        });

        inputStream.on('end', () => {
          try {
            const finalChunk = decipher.final();
            outputStream.write(finalChunk);
            hash.update(finalChunk);
            decryptedSize += finalChunk.length;
            
            outputStream.end();
            
            resolve({
              decryptedSize,
              verified: true,
            });
            
          } catch (error) {
            reject(error);
          }
        });

        inputStream.on('error', reject);
        outputStream.on('error', reject);

      } catch (error) {
        reject(error);
      }
    });
  }

  private async deriveKey(password: Buffer, salt: Buffer, iterations: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, iterations, this.config.keyLength, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      });
    });
  }

  private generateRandomKey(length: number): Buffer {
    return crypto.randomBytes(length);
  }

  private async initializeKeyStore(): Promise<void> {
    try {
      await fs.mkdir(this.keyStorePath, { recursive: true });
      this.logger.log(`Encryption key store initialized: ${this.keyStorePath}`);
    } catch (error) {
      this.logger.error('Failed to initialize key store:', error);
    }
  }

  private async storeEncryptionKey(key: EncryptionKey): Promise<void> {
    try {
      const encryptedKeyData = await this.encryptKeyForStorage(key, this.masterKey);
      const keyPath = path.join(this.keyStorePath, `${key.id}.key`);
      
      await fs.writeFile(keyPath, JSON.stringify(encryptedKeyData, null, 2));
      this.keyCache.set(key.id, key);
      
    } catch (error) {
      this.logger.error(`Failed to store encryption key ${key.id}:`, error);
      throw error;
    }
  }

  private async getEncryptionKey(keyId: string): Promise<EncryptionKey | null> {
    try {
      // Check cache first
      if (this.keyCache.has(keyId)) {
        return this.keyCache.get(keyId)!;
      }

      // Load from storage
      const keyPath = path.join(this.keyStorePath, `${keyId}.key`);
      
      try {
        const keyData = await fs.readFile(keyPath, 'utf-8');
        const encryptedKeyData = JSON.parse(keyData);
        const key = await this.decryptStoredKey(encryptedKeyData, this.masterKey);
        
        this.keyCache.set(keyId, key);
        return key;
        
      } catch (error) {
        return null; // Key not found
      }
      
    } catch (error) {
      this.logger.error(`Failed to get encryption key ${keyId}:`, error);
      return null;
    }
  }

  private async updateEncryptionKey(key: EncryptionKey): Promise<void> {
    try {
      await this.storeEncryptionKey(key);
    } catch (error) {
      this.logger.error(`Failed to update encryption key ${key.id}:`, error);
    }
  }

  private async deleteEncryptionKey(keyId: string): Promise<void> {
    try {
      const keyPath = path.join(this.keyStorePath, `${keyId}.key`);
      await fs.unlink(keyPath);
      this.keyCache.delete(keyId);
      
    } catch (error) {
      this.logger.error(`Failed to delete encryption key ${keyId}:`, error);
    }
  }

  private async encryptKeyForStorage(key: EncryptionKey, masterKey: Buffer): Promise<any> {
    const salt = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);
    
    const keyData = JSON.stringify({
      id: key.id,
      key: key.key.toString('hex'),
      algorithm: key.algorithm,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
      usage: key.usage,
      maxUsage: key.maxUsage,
    });

    let encrypted = cipher.update(keyData, 'utf-8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
      encrypted: encrypted.toString('hex'),
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  private async decryptStoredKey(encryptedData: any, masterKey: Buffer): Promise<EncryptionKey> {
    const salt = Buffer.from(encryptedData.salt, 'hex');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    const encrypted = Buffer.from(encryptedData.encrypted, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    const keyData = JSON.parse(decrypted.toString('utf-8'));
    
    return {
      id: keyData.id,
      key: Buffer.from(keyData.key, 'hex'),
      algorithm: keyData.algorithm,
      createdAt: new Date(keyData.createdAt),
      expiresAt: keyData.expiresAt ? new Date(keyData.expiresAt) : undefined,
      usage: keyData.usage,
      maxUsage: keyData.maxUsage,
    };
  }
}
