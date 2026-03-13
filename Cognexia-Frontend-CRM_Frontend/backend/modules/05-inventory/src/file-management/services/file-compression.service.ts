import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as zlib from 'zlib';
import * as crypto from 'crypto';
import { promisify } from 'util';

// Promisify zlib methods
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);
const deflate = promisify(zlib.deflate);
const inflate = promisify(zlib.inflate);
const brotliCompress = promisify(zlib.brotliCompress);
const brotliDecompress = promisify(zlib.brotliDecompress);

export enum CompressionAlgorithm {
  GZIP = 'gzip',
  DEFLATE = 'deflate',
  BROTLI = 'brotli',
  LZ4 = 'lz4',
  ZSTD = 'zstd',
}

export interface CompressionConfig {
  defaultAlgorithm: CompressionAlgorithm;
  compressionLevel: number;
  enableAutoSelection: boolean;
  minFileSize: number;
  maxFileSize: number;
  skipMimeTypes: string[];
  enableStreamCompression: boolean;
}

export interface CompressionResult {
  success: boolean;
  compressedFilePath: string;
  algorithm: CompressionAlgorithm;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  compressionTime: number;
  checksumOriginal: string;
  checksumCompressed: string;
  metadata: {
    level: number;
    blockSize?: number;
    windowSize?: number;
    memLevel?: number;
  };
}

export interface DecompressionResult {
  success: boolean;
  decompressedFilePath: string;
  originalSize: number;
  decompressedSize: number;
  decompressionTime: number;
  verified: boolean;
  algorithm: CompressionAlgorithm;
}

@Injectable()
export class FileCompressionService {
  private readonly logger = new Logger(FileCompressionService.name);
  private readonly config: CompressionConfig;
  private readonly enableCompression: boolean;

  constructor(private configService: ConfigService) {
    this.enableCompression = this.configService.get<boolean>('ENABLE_FILE_COMPRESSION', true);
    
    this.config = {
      defaultAlgorithm: this.configService.get<CompressionAlgorithm>('COMPRESSION_ALGORITHM', CompressionAlgorithm.GZIP),
      compressionLevel: this.configService.get<number>('COMPRESSION_LEVEL', 6),
      enableAutoSelection: this.configService.get<boolean>('ENABLE_AUTO_COMPRESSION', true),
      minFileSize: this.configService.get<number>('MIN_COMPRESSION_SIZE', 1024), // 1KB
      maxFileSize: this.configService.get<number>('MAX_COMPRESSION_SIZE', 100 * 1024 * 1024), // 100MB
      skipMimeTypes: this.configService.get<string>('SKIP_COMPRESSION_TYPES', 'image/jpeg,image/png,video/mp4,audio/mpeg').split(','),
      enableStreamCompression: this.configService.get<boolean>('ENABLE_STREAM_COMPRESSION', true),
    };

    this.logger.log(`File compression service initialized with algorithm: ${this.config.defaultAlgorithm}`);
  }

  /**
   * Compress a file using the specified or auto-selected algorithm
   */
  async compressFile(
    inputPath: string,
    outputPath?: string,
    algorithm?: CompressionAlgorithm,
    options: {
      level?: number;
      mimeType?: string;
      forceCompression?: boolean;
    } = {}
  ): Promise<CompressionResult> {
    if (!this.enableCompression && !options.forceCompression) {
      throw new BadRequestException('File compression is disabled');
    }

    const startTime = Date.now();
    
    try {
      // Validate input file
      await fs.access(inputPath);
      const stats = await fs.stat(inputPath);
      const originalSize = stats.size;

      this.logger.debug(`Compressing file: ${path.basename(inputPath)} (${originalSize} bytes)`);

      // Check if file should be compressed
      if (!options.forceCompression && !this.shouldCompress(originalSize, options.mimeType)) {
        throw new BadRequestException(
          'File does not meet compression criteria (size or type restrictions)'
        );
      }

      // Select compression algorithm
      const selectedAlgorithm = algorithm || 
        (this.config.enableAutoSelection 
          ? await this.selectOptimalAlgorithm(inputPath, options.mimeType)
          : this.config.defaultAlgorithm);

      // Generate output path
      const compressedPath = outputPath || this.generateCompressedPath(inputPath, selectedAlgorithm);

      // Calculate original file checksum
      const checksumOriginal = await this.calculateFileChecksum(inputPath);

      // Perform compression
      const compressionResult = await this.performCompression(
        inputPath,
        compressedPath,
        selectedAlgorithm,
        {
          level: options.level || this.config.compressionLevel,
          originalSize,
        }
      );

      // Calculate compressed file checksum
      const checksumCompressed = await this.calculateFileChecksum(compressedPath);
      
      const compressedStats = await fs.stat(compressedPath);
      const compressedSize = compressedStats.size;
      const compressionRatio = (1 - compressedSize / originalSize) * 100;
      const compressionTime = Date.now() - startTime;

      const result: CompressionResult = {
        success: true,
        compressedFilePath: compressedPath,
        algorithm: selectedAlgorithm,
        originalSize,
        compressedSize,
        compressionRatio,
        compressionTime,
        checksumOriginal,
        checksumCompressed,
        metadata: compressionResult.metadata,
      };

      this.logger.log(
        `File compressed successfully: ${path.basename(inputPath)} ` +
        `(${originalSize} -> ${compressedSize} bytes, ${compressionRatio.toFixed(1)}% reduction, ${compressionTime}ms)`
      );

      return result;

    } catch (error) {
      this.logger.error(`File compression failed: ${inputPath}`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Compression failed: ${error.message}`);
    }
  }

  /**
   * Decompress a file
   */
  async decompressFile(
    inputPath: string,
    outputPath: string,
    algorithm: CompressionAlgorithm,
    options: {
      expectedChecksum?: string;
      expectedSize?: number;
    } = {}
  ): Promise<DecompressionResult> {
    const startTime = Date.now();
    
    try {
      // Validate input file
      await fs.access(inputPath);
      const compressedStats = await fs.stat(inputPath);

      this.logger.debug(`Decompressing file: ${path.basename(inputPath)} (${compressedStats.size} bytes)`);

      // Perform decompression
      await this.performDecompression(inputPath, outputPath, algorithm);

      // Get decompressed file stats
      const decompressedStats = await fs.stat(outputPath);
      const decompressedSize = decompressedStats.size;
      const decompressionTime = Date.now() - startTime;

      // Verify decompression if checksum provided
      let verified = true;
      if (options.expectedChecksum) {
        const actualChecksum = await this.calculateFileChecksum(outputPath);
        verified = actualChecksum === options.expectedChecksum;
      }

      // Verify size if provided
      if (options.expectedSize && options.expectedSize !== decompressedSize) {
        verified = false;
      }

      const result: DecompressionResult = {
        success: true,
        decompressedFilePath: outputPath,
        originalSize: compressedStats.size,
        decompressedSize,
        decompressionTime,
        verified,
        algorithm,
      };

      this.logger.log(
        `File decompressed successfully: ${path.basename(inputPath)} ` +
        `(${compressedStats.size} -> ${decompressedSize} bytes, ${decompressionTime}ms)`
      );

      return result;

    } catch (error) {
      this.logger.error(`File decompression failed: ${inputPath}`, error);
      throw new InternalServerErrorException(`Decompression failed: ${error.message}`);
    }
  }

  /**
   * Compress data in memory
   */
  async compressData(
    data: Buffer,
    algorithm: CompressionAlgorithm = this.config.defaultAlgorithm,
    level: number = this.config.compressionLevel
  ): Promise<{
    compressedData: Buffer;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    algorithm: CompressionAlgorithm;
  }> {
    try {
      const originalSize = data.length;
      let compressedData: Buffer;

      switch (algorithm) {
        case CompressionAlgorithm.GZIP:
          compressedData = await gzip(data, { level });
          break;
        
        case CompressionAlgorithm.DEFLATE:
          compressedData = await deflate(data, { level });
          break;
        
        case CompressionAlgorithm.BROTLI:
          compressedData = await brotliCompress(data, {
            params: {
              [zlib.constants.BROTLI_PARAM_QUALITY]: level,
            },
          });
          break;
        
        default:
          throw new BadRequestException(`Unsupported compression algorithm: ${algorithm}`);
      }

      const compressedSize = compressedData.length;
      const compressionRatio = (1 - compressedSize / originalSize) * 100;

      return {
        compressedData,
        originalSize,
        compressedSize,
        compressionRatio,
        algorithm,
      };

    } catch (error) {
      this.logger.error('Data compression failed:', error);
      throw new InternalServerErrorException(`Data compression failed: ${error.message}`);
    }
  }

  /**
   * Decompress data in memory
   */
  async decompressData(
    compressedData: Buffer,
    algorithm: CompressionAlgorithm
  ): Promise<Buffer> {
    try {
      let decompressedData: Buffer;

      switch (algorithm) {
        case CompressionAlgorithm.GZIP:
          decompressedData = await gunzip(compressedData);
          break;
        
        case CompressionAlgorithm.DEFLATE:
          decompressedData = await inflate(compressedData);
          break;
        
        case CompressionAlgorithm.BROTLI:
          decompressedData = await brotliDecompress(compressedData);
          break;
        
        default:
          throw new BadRequestException(`Unsupported decompression algorithm: ${algorithm}`);
      }

      return decompressedData;

    } catch (error) {
      this.logger.error('Data decompression failed:', error);
      throw new InternalServerErrorException(`Data decompression failed: ${error.message}`);
    }
  }

  /**
   * Test compression efficiency for different algorithms
   */
  async testCompressionEfficiency(
    filePath: string
  ): Promise<Map<CompressionAlgorithm, {
    compressionRatio: number;
    compressionTime: number;
    compressedSize: number;
  }>> {
    const results = new Map();

    try {
      const data = await fs.readFile(filePath);
      const originalSize = data.length;

      for (const algorithm of Object.values(CompressionAlgorithm)) {
        if (!this.isAlgorithmSupported(algorithm)) continue;

        try {
          const startTime = Date.now();
          const compressed = await this.compressData(data, algorithm);
          const compressionTime = Date.now() - startTime;

          results.set(algorithm, {
            compressionRatio: compressed.compressionRatio,
            compressionTime,
            compressedSize: compressed.compressedSize,
          });

        } catch (error) {
          this.logger.warn(`Failed to test ${algorithm} compression:`, error);
        }
      }

      return results;

    } catch (error) {
      this.logger.error('Compression efficiency test failed:', error);
      throw new InternalServerErrorException(`Compression test failed: ${error.message}`);
    }
  }

  /**
   * Get compression statistics
   */
  async getCompressionStats(filePath: string): Promise<{
    fileSize: number;
    isCompressible: boolean;
    recommendedAlgorithm: CompressionAlgorithm;
    estimatedCompressionRatio: number;
    mimeType?: string;
  }> {
    try {
      const stats = await fs.stat(filePath);
      const fileSize = stats.size;
      
      // Read a sample of the file for analysis
      const sampleSize = Math.min(fileSize, 8192); // 8KB sample
      const fileHandle = await fs.open(filePath, 'r');
      const sampleBuffer = Buffer.alloc(sampleSize);
      await fileHandle.read(sampleBuffer, 0, sampleSize, 0);
      await fileHandle.close();

      // Analyze file entropy to determine compressibility
      const entropy = this.calculateEntropy(sampleBuffer);
      const isCompressible = entropy < 7.5; // Files with lower entropy compress better

      // Test compression on sample
      let recommendedAlgorithm = this.config.defaultAlgorithm;
      let estimatedCompressionRatio = 0;

      if (isCompressible) {
        const testResults = new Map();
        
        for (const algorithm of [CompressionAlgorithm.GZIP, CompressionAlgorithm.BROTLI, CompressionAlgorithm.DEFLATE]) {
          if (!this.isAlgorithmSupported(algorithm)) continue;
          
          try {
            const compressed = await this.compressData(sampleBuffer, algorithm);
            testResults.set(algorithm, compressed.compressionRatio);
          } catch (error) {
            // Skip this algorithm
          }
        }

        // Select algorithm with best compression ratio
        let bestRatio = 0;
        for (const [algorithm, ratio] of testResults.entries()) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            recommendedAlgorithm = algorithm;
          }
        }

        estimatedCompressionRatio = bestRatio;
      }

      return {
        fileSize,
        isCompressible,
        recommendedAlgorithm,
        estimatedCompressionRatio,
      };

    } catch (error) {
      this.logger.error('Failed to get compression stats:', error);
      throw new InternalServerErrorException(`Failed to analyze file: ${error.message}`);
    }
  }

  // Private methods

  private shouldCompress(fileSize: number, mimeType?: string): boolean {
    // Check size limits
    if (fileSize < this.config.minFileSize || fileSize > this.config.maxFileSize) {
      return false;
    }

    // Check MIME type exclusions
    if (mimeType && this.config.skipMimeTypes.includes(mimeType)) {
      return false;
    }

    return true;
  }

  private async selectOptimalAlgorithm(
    filePath: string,
    mimeType?: string
  ): Promise<CompressionAlgorithm> {
    try {
      // For text-based files, Brotli often performs better
      if (mimeType && (
        mimeType.startsWith('text/') || 
        mimeType.includes('json') || 
        mimeType.includes('xml') ||
        mimeType.includes('javascript') ||
        mimeType.includes('css')
      )) {
        return CompressionAlgorithm.BROTLI;
      }

      // For binary files, test compression efficiency
      const stats = await this.getCompressionStats(filePath);
      return stats.recommendedAlgorithm;

    } catch (error) {
      this.logger.warn('Failed to select optimal algorithm, using default:', error);
      return this.config.defaultAlgorithm;
    }
  }

  private generateCompressedPath(inputPath: string, algorithm: CompressionAlgorithm): string {
    const ext = this.getFileExtension(algorithm);
    return `${inputPath}${ext}`;
  }

  private getFileExtension(algorithm: CompressionAlgorithm): string {
    switch (algorithm) {
      case CompressionAlgorithm.GZIP:
        return '.gz';
      case CompressionAlgorithm.DEFLATE:
        return '.deflate';
      case CompressionAlgorithm.BROTLI:
        return '.br';
      case CompressionAlgorithm.LZ4:
        return '.lz4';
      case CompressionAlgorithm.ZSTD:
        return '.zst';
      default:
        return '.compressed';
    }
  }

  private async performCompression(
    inputPath: string,
    outputPath: string,
    algorithm: CompressionAlgorithm,
    options: {
      level: number;
      originalSize: number;
    }
  ): Promise<{
    metadata: {
      level: number;
      blockSize?: number;
      windowSize?: number;
      memLevel?: number;
    };
  }> {
    if (this.config.enableStreamCompression && options.originalSize > 1024 * 1024) {
      // Use streaming for large files
      return await this.performStreamCompression(inputPath, outputPath, algorithm, options);
    } else {
      // Use in-memory compression for small files
      return await this.performMemoryCompression(inputPath, outputPath, algorithm, options);
    }
  }

  private async performStreamCompression(
    inputPath: string,
    outputPath: string,
    algorithm: CompressionAlgorithm,
    options: {
      level: number;
    }
  ): Promise<{
    metadata: {
      level: number;
      blockSize?: number;
      windowSize?: number;
      memLevel?: number;
    };
  }> {
    return new Promise((resolve, reject) => {
      let compressor: NodeJS.ReadWriteStream;

      switch (algorithm) {
        case CompressionAlgorithm.GZIP:
          compressor = zlib.createGzip({ level: options.level });
          break;
        case CompressionAlgorithm.DEFLATE:
          compressor = zlib.createDeflate({ level: options.level });
          break;
        case CompressionAlgorithm.BROTLI:
          compressor = zlib.createBrotliCompress({
            params: {
              [zlib.constants.BROTLI_PARAM_QUALITY]: options.level,
            },
          });
          break;
        default:
          return reject(new Error(`Unsupported streaming compression algorithm: ${algorithm}`));
      }

      const inputStream = require('fs').createReadStream(inputPath);
      const outputStream = require('fs').createWriteStream(outputPath);

      inputStream
        .pipe(compressor)
        .pipe(outputStream)
        .on('finish', () => {
          resolve({
            metadata: {
              level: options.level,
            },
          });
        })
        .on('error', reject);

      inputStream.on('error', reject);
    });
  }

  private async performMemoryCompression(
    inputPath: string,
    outputPath: string,
    algorithm: CompressionAlgorithm,
    options: {
      level: number;
    }
  ): Promise<{
    metadata: {
      level: number;
      blockSize?: number;
      windowSize?: number;
      memLevel?: number;
    };
  }> {
    const data = await fs.readFile(inputPath);
    const compressed = await this.compressData(data, algorithm, options.level);
    await fs.writeFile(outputPath, compressed.compressedData);

    return {
      metadata: {
        level: options.level,
      },
    };
  }

  private async performDecompression(
    inputPath: string,
    outputPath: string,
    algorithm: CompressionAlgorithm
  ): Promise<void> {
    const inputStats = await fs.stat(inputPath);
    
    if (this.config.enableStreamCompression && inputStats.size > 1024 * 1024) {
      // Use streaming for large files
      await this.performStreamDecompression(inputPath, outputPath, algorithm);
    } else {
      // Use in-memory decompression for small files
      await this.performMemoryDecompression(inputPath, outputPath, algorithm);
    }
  }

  private async performStreamDecompression(
    inputPath: string,
    outputPath: string,
    algorithm: CompressionAlgorithm
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let decompressor: NodeJS.ReadWriteStream;

      switch (algorithm) {
        case CompressionAlgorithm.GZIP:
          decompressor = zlib.createGunzip();
          break;
        case CompressionAlgorithm.DEFLATE:
          decompressor = zlib.createInflate();
          break;
        case CompressionAlgorithm.BROTLI:
          decompressor = zlib.createBrotliDecompress();
          break;
        default:
          return reject(new Error(`Unsupported streaming decompression algorithm: ${algorithm}`));
      }

      const inputStream = require('fs').createReadStream(inputPath);
      const outputStream = require('fs').createWriteStream(outputPath);

      inputStream
        .pipe(decompressor)
        .pipe(outputStream)
        .on('finish', resolve)
        .on('error', reject);

      inputStream.on('error', reject);
    });
  }

  private async performMemoryDecompression(
    inputPath: string,
    outputPath: string,
    algorithm: CompressionAlgorithm
  ): Promise<void> {
    const compressedData = await fs.readFile(inputPath);
    const decompressed = await this.decompressData(compressedData, algorithm);
    await fs.writeFile(outputPath, decompressed);
  }

  private async calculateFileChecksum(filePath: string): Promise<string> {
    try {
      const data = await fs.readFile(filePath);
      return crypto.createHash('sha256').update(data).digest('hex');
    } catch (error) {
      this.logger.error(`Failed to calculate checksum for ${filePath}:`, error);
      return '';
    }
  }

  private calculateEntropy(buffer: Buffer): number {
    const frequencies = new Map<number, number>();
    
    // Count byte frequencies
    for (const byte of buffer) {
      frequencies.set(byte, (frequencies.get(byte) || 0) + 1);
    }

    // Calculate entropy
    let entropy = 0;
    const length = buffer.length;
    
    for (const count of frequencies.values()) {
      const probability = count / length;
      entropy -= probability * Math.log2(probability);
    }

    return entropy;
  }

  private isAlgorithmSupported(algorithm: CompressionAlgorithm): boolean {
    switch (algorithm) {
      case CompressionAlgorithm.GZIP:
      case CompressionAlgorithm.DEFLATE:
      case CompressionAlgorithm.BROTLI:
        return true;
      case CompressionAlgorithm.LZ4:
      case CompressionAlgorithm.ZSTD:
        // These would require additional native modules
        return false;
      default:
        return false;
    }
  }
}
