import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as mime from 'mime-types';
import * as crypto from 'crypto';

export interface FileValidationConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  blockedExtensions: string[];
  scanContent: boolean;
  checkMimeTypeConsistency: boolean;
  enableMalwareDetection: boolean;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  detectedMimeType: string;
  fileSignature: string;
  isExecutable: boolean;
  hasSuspiciousContent: boolean;
}

@Injectable()
export class FileValidationService {
  private readonly logger = new Logger(FileValidationService.name);
  private readonly config: FileValidationConfig;
  
  // Common file signatures for validation
  private readonly fileSignatures = {
    'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffe3', 'ffd8ffe8'],
    'image/png': ['89504e47'],
    'image/gif': ['47494638'],
    'application/pdf': ['255044462d'],
    'application/zip': ['504b0304', '504b0506', '504b0708'],
    'text/plain': [],
    'application/json': [],
    'text/html': ['3c21444f435459504520', '3c68746d6c'],
    'application/msword': ['d0cf11e0a1b11ae1'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['504b030414'],
    'video/mp4': ['66747970'],
    'audio/mpeg': ['494433'],
  };

  // Executable file extensions
  private readonly executableExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.js', '.jar',
    '.msi', '.dll', '.sys', '.bin', '.app', '.deb', '.rpm', '.dmg',
  ];

  // Suspicious content patterns
  private readonly suspiciousPatterns = [
    /script\s*:/gi,
    /javascript\s*:/gi,
    /vbscript\s*:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /eval\s*\(/gi,
    /document\.write/gi,
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  ];

  constructor(private configService: ConfigService) {
    this.config = {
      maxFileSize: this.configService.get<number>('MAX_FILE_SIZE', 100 * 1024 * 1024), // 100MB
      allowedMimeTypes: this.configService.get<string>('ALLOWED_FILE_TYPES', '').split(',').filter(Boolean),
      allowedExtensions: this.configService.get<string>('ALLOWED_FILE_EXTENSIONS', '').split(',').filter(Boolean),
      blockedExtensions: this.configService.get<string>('BLOCKED_FILE_EXTENSIONS', '.exe,.bat,.cmd,.scr,.vbs').split(',').filter(Boolean),
      scanContent: this.configService.get<boolean>('ENABLE_CONTENT_SCANNING', true),
      checkMimeTypeConsistency: this.configService.get<boolean>('CHECK_MIME_CONSISTENCY', true),
      enableMalwareDetection: this.configService.get<boolean>('ENABLE_MALWARE_DETECTION', true),
    };

    this.logger.log(`File validation configured with max size: ${this.config.maxFileSize} bytes`);
  }

  /**
   * Comprehensive file validation
   */
  async validateFile(filePath: string, fileName: string): Promise<FileValidationResult> {
    const result: FileValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      detectedMimeType: '',
      fileSignature: '',
      isExecutable: false,
      hasSuspiciousContent: false,
    };

    try {
      // Check if file exists
      await fs.access(filePath);

      // Get file stats
      const stats = await fs.stat(filePath);

      // Validate file size
      if (stats.size > this.config.maxFileSize) {
        result.errors.push(`File size ${stats.size} bytes exceeds maximum allowed size of ${this.config.maxFileSize} bytes`);
        result.isValid = false;
      }

      // Validate file extension
      const fileExtension = path.extname(fileName).toLowerCase();
      if (this.config.blockedExtensions.includes(fileExtension)) {
        result.errors.push(`File extension '${fileExtension}' is blocked`);
        result.isValid = false;
      }

      if (this.config.allowedExtensions.length > 0 && !this.config.allowedExtensions.includes(fileExtension)) {
        result.errors.push(`File extension '${fileExtension}' is not in allowed list`);
        result.isValid = false;
      }

      // Check if file is executable
      result.isExecutable = this.executableExtensions.includes(fileExtension);
      if (result.isExecutable) {
        result.warnings.push('File appears to be executable');
      }

      // Detect MIME type
      result.detectedMimeType = mime.lookup(fileName) || 'application/octet-stream';

      // Get file signature
      result.fileSignature = await this.getFileSignature(filePath);

      // Validate MIME type consistency
      if (this.config.checkMimeTypeConsistency) {
        const isConsistent = await this.validateMimeTypeConsistency(
          result.detectedMimeType,
          result.fileSignature
        );
        
        if (!isConsistent) {
          result.warnings.push(`File signature does not match detected MIME type: ${result.detectedMimeType}`);
        }
      }

      // Validate against allowed MIME types
      if (this.config.allowedMimeTypes.length > 0 && !this.config.allowedMimeTypes.includes(result.detectedMimeType)) {
        result.errors.push(`MIME type '${result.detectedMimeType}' is not allowed`);
        result.isValid = false;
      }

      // Scan file content for suspicious patterns
      if (this.config.scanContent) {
        result.hasSuspiciousContent = await this.scanForSuspiciousContent(filePath, result.detectedMimeType);
        if (result.hasSuspiciousContent) {
          result.warnings.push('File contains potentially suspicious content');
        }
      }

      // Additional validations based on file type
      await this.performTypeSpecificValidation(filePath, result);

      this.logger.debug(`File validation completed: ${fileName}`, result);

    } catch (error) {
      this.logger.error(`File validation error for ${fileName}:`, error);
      result.errors.push(`Validation failed: ${error.message}`);
      result.isValid = false;
    }

    return result;
  }

  /**
   * Quick validation for basic file properties
   */
  async quickValidate(fileName: string, fileSize: number, mimeType: string): Promise<boolean> {
    try {
      // Size validation
      if (fileSize > this.config.maxFileSize) {
        return false;
      }

      // Extension validation
      const fileExtension = path.extname(fileName).toLowerCase();
      if (this.config.blockedExtensions.includes(fileExtension)) {
        return false;
      }

      // MIME type validation
      if (this.config.allowedMimeTypes.length > 0 && !this.config.allowedMimeTypes.includes(mimeType)) {
        return false;
      }

      return true;

    } catch (error) {
      this.logger.error(`Quick validation error:`, error);
      return false;
    }
  }

  /**
   * Validate image files specifically
   */
  async validateImageFile(filePath: string): Promise<{
    isValid: boolean;
    dimensions?: { width: number; height: number };
    colorSpace?: string;
    hasExifData?: boolean;
  }> {
    try {
      // For now, basic validation - could be enhanced with image processing libraries
      const signature = await this.getFileSignature(filePath);
      
      const isValidImage = 
        signature.startsWith('ffd8ff') || // JPEG
        signature.startsWith('89504e47') || // PNG
        signature.startsWith('47494638'); // GIF

      return {
        isValid: isValidImage,
        // Additional properties would require image processing library
      };

    } catch (error) {
      this.logger.error('Image validation error:', error);
      return { isValid: false };
    }
  }

  /**
   * Validate document files
   */
  async validateDocumentFile(filePath: string, mimeType: string): Promise<{
    isValid: boolean;
    isPasswordProtected?: boolean;
    pageCount?: number;
    hasEmbeddedFiles?: boolean;
  }> {
    try {
      const signature = await this.getFileSignature(filePath);
      let isValid = false;

      // Basic signature validation for common document types
      if (mimeType === 'application/pdf') {
        isValid = signature.startsWith('255044462d'); // %PDF-
      } else if (mimeType.includes('word') || mimeType.includes('excel') || mimeType.includes('powerpoint')) {
        isValid = signature.startsWith('504b03') || signature.startsWith('d0cf11e0'); // ZIP or OLE2
      } else if (mimeType === 'text/plain') {
        isValid = true; // Text files don't have specific signatures
      }

      return {
        isValid,
        // Additional properties would require document parsing libraries
      };

    } catch (error) {
      this.logger.error('Document validation error:', error);
      return { isValid: false };
    }
  }

  /**
   * Get configuration
   */
  getValidationConfig(): FileValidationConfig {
    return { ...this.config };
  }

  /**
   * Update validation config at runtime
   */
  updateConfig(updates: Partial<FileValidationConfig>): void {
    Object.assign(this.config, updates);
    this.logger.log('Validation configuration updated', updates);
  }

  // Private helper methods

  /**
   * Get file signature (magic bytes)
   */
  private async getFileSignature(filePath: string, bytesToRead: number = 20): Promise<string> {
    try {
      const fileHandle = await fs.open(filePath, 'r');
      const buffer = Buffer.alloc(bytesToRead);
      await fileHandle.read(buffer, 0, bytesToRead, 0);
      await fileHandle.close();
      
      return buffer.toString('hex').toLowerCase();

    } catch (error) {
      this.logger.error('Error reading file signature:', error);
      return '';
    }
  }

  /**
   * Validate MIME type consistency with file signature
   */
  private async validateMimeTypeConsistency(mimeType: string, signature: string): Promise<boolean> {
    const expectedSignatures = this.fileSignatures[mimeType];
    
    if (!expectedSignatures || expectedSignatures.length === 0) {
      // No signature validation available for this MIME type
      return true;
    }

    return expectedSignatures.some(expectedSig => signature.startsWith(expectedSig));
  }

  /**
   * Scan file content for suspicious patterns
   */
  private async scanForSuspiciousContent(filePath: string, mimeType: string): Promise<boolean> {
    try {
      // Only scan text-based files to avoid false positives
      if (!mimeType.includes('text') && !mimeType.includes('json') && !mimeType.includes('xml')) {
        return false;
      }

      const content = await fs.readFile(filePath, 'utf-8');
      
      return this.suspiciousPatterns.some(pattern => pattern.test(content));

    } catch (error) {
      // If we can't read as text, skip content scanning
      return false;
    }
  }

  /**
   * Perform type-specific validation
   */
  private async performTypeSpecificValidation(filePath: string, result: FileValidationResult): Promise<void> {
    try {
      const mimeType = result.detectedMimeType;

      if (mimeType.startsWith('image/')) {
        const imageValidation = await this.validateImageFile(filePath);
        if (!imageValidation.isValid) {
          result.errors.push('Invalid image file format');
          result.isValid = false;
        }
      } else if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
        const docValidation = await this.validateDocumentFile(filePath, mimeType);
        if (!docValidation.isValid) {
          result.errors.push('Invalid document file format');
          result.isValid = false;
        }
      } else if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) {
        // Basic media file validation
        const stats = await fs.stat(filePath);
        if (stats.size < 1024) { // Less than 1KB is suspicious for media files
          result.warnings.push('Media file is unusually small');
        }
      }

    } catch (error) {
      this.logger.error('Type-specific validation error:', error);
      result.warnings.push('Could not perform type-specific validation');
    }
  }

  /**
   * Check if file contains embedded executables
   */
  private async checkEmbeddedExecutables(filePath: string): Promise<boolean> {
    try {
      const content = await fs.readFile(filePath);
      const contentHex = content.toString('hex').toLowerCase();

      // Look for common executable signatures within the file
      const executableSignatures = ['4d5a', '7f454c46', 'cafebabe', 'feedface'];
      
      return executableSignatures.some(sig => contentHex.includes(sig));

    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate file entropy (to detect potentially compressed/encrypted content)
   */
  private async calculateEntropy(filePath: string): Promise<number> {
    try {
      const content = await fs.readFile(filePath);
      const frequencies = new Map<number, number>();
      
      // Count byte frequencies
      for (const byte of content) {
        frequencies.set(byte, (frequencies.get(byte) || 0) + 1);
      }

      // Calculate entropy
      let entropy = 0;
      const length = content.length;
      
      for (const count of frequencies.values()) {
        const probability = count / length;
        entropy -= probability * Math.log2(probability);
      }

      return entropy;

    } catch (error) {
      return 0;
    }
  }
}
