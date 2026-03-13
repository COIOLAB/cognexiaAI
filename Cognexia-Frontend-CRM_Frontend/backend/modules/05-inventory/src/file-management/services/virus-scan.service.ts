import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export interface VirusScanResult {
  isClean: boolean;
  scanEngine: string;
  threatName?: string;
  confidence: number;
  scanDuration: number;
  quarantined: boolean;
  scanDetails: {
    fileHash: string;
    fileSize: number;
    scanTime: Date;
    engineVersion?: string;
    signatureVersion?: string;
    scanId?: string;
  };
}

export interface ScanEngineConfig {
  enabled: boolean;
  priority: number;
  timeout: number;
  endpoint?: string;
  apiKey?: string;
  maxFileSize?: number;
}

@Injectable()
export class VirusScanService {
  private readonly logger = new Logger(VirusScanService.name);
  private readonly scanEngines: Map<string, ScanEngineConfig> = new Map();
  private readonly quarantinePath: string;
  private readonly enableScanning: boolean;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.enableScanning = this.configService.get<boolean>('ENABLE_VIRUS_SCANNING', false);
    this.quarantinePath = this.configService.get<string>('QUARANTINE_PATH', './quarantine');
    
    this.initializeScanEngines();
    this.initializeQuarantineDirectory();
  }

  /**
   * Scan file for viruses using available engines
   */
  async scanFile(filePath: string): Promise<VirusScanResult> {
    const startTime = Date.now();

    if (!this.enableScanning) {
      this.logger.debug('Virus scanning disabled, marking file as clean');
      return this.createCleanResult(filePath, 'disabled', Date.now() - startTime);
    }

    try {
      // Validate file exists
      await fs.access(filePath);
      const stats = await fs.stat(filePath);
      const fileHash = await this.calculateFileHash(filePath);

      this.logger.debug(`Starting virus scan: ${path.basename(filePath)} (${stats.size} bytes)`);

      // Get enabled scan engines sorted by priority
      const enabledEngines = Array.from(this.scanEngines.entries())
        .filter(([, config]) => config.enabled)
        .sort(([, a], [, b]) => a.priority - b.priority);

      if (enabledEngines.length === 0) {
        this.logger.warn('No virus scan engines enabled');
        return this.createCleanResult(filePath, 'no_engine', Date.now() - startTime);
      }

      // Try each engine until we get a definitive result
      for (const [engineName, config] of enabledEngines) {
        try {
          const result = await this.scanWithEngine(engineName, filePath, config);
          
          if (result) {
            // If threat detected, quarantine file
            if (!result.isClean) {
              await this.quarantineFile(filePath, result);
            }
            
            return result;
          }

        } catch (error) {
          this.logger.error(`Scan engine ${engineName} failed:`, error);
          continue; // Try next engine
        }
      }

      // If all engines failed, return clean result with warning
      this.logger.warn('All virus scan engines failed, marking as clean by default');
      return this.createCleanResult(filePath, 'fallback', Date.now() - startTime);

    } catch (error) {
      this.logger.error(`Virus scan failed for ${filePath}:`, error);
      throw new BadRequestException(`Virus scan failed: ${error.message}`);
    }
  }

  /**
   * Scan multiple files in batch
   */
  async scanFiles(filePaths: string[]): Promise<Map<string, VirusScanResult>> {
    const results = new Map<string, VirusScanResult>();

    for (const filePath of filePaths) {
      try {
        const result = await this.scanFile(filePath);
        results.set(filePath, result);
      } catch (error) {
        this.logger.error(`Batch scan failed for ${filePath}:`, error);
        results.set(filePath, {
          isClean: false,
          scanEngine: 'error',
          threatName: 'SCAN_ERROR',
          confidence: 0,
          scanDuration: 0,
          quarantined: false,
          scanDetails: {
            fileHash: '',
            fileSize: 0,
            scanTime: new Date(),
            scanId: crypto.randomUUID(),
          },
        });
      }
    }

    return results;
  }

  /**
   * Get quarantined files
   */
  async getQuarantinedFiles(): Promise<Array<{
    fileName: string;
    originalPath: string;
    quarantineTime: Date;
    threatName: string;
    scanEngine: string;
    fileSize: number;
    fileHash: string;
  }>> {
    try {
      const quarantineEntries = await fs.readdir(this.quarantinePath);
      const files = [];

      for (const entry of quarantineEntries) {
        try {
          const metaPath = path.join(this.quarantinePath, entry, 'metadata.json');
          const metaContent = await fs.readFile(metaPath, 'utf-8');
          const metadata = JSON.parse(metaContent);
          
          files.push({
            fileName: entry,
            originalPath: metadata.originalPath,
            quarantineTime: new Date(metadata.quarantineTime),
            threatName: metadata.threatName,
            scanEngine: metadata.scanEngine,
            fileSize: metadata.fileSize,
            fileHash: metadata.fileHash,
          });
          
        } catch (error) {
          this.logger.warn(`Failed to read quarantine metadata for ${entry}:`, error);
        }
      }

      return files.sort((a, b) => b.quarantineTime.getTime() - a.quarantineTime.getTime());

    } catch (error) {
      this.logger.error('Failed to get quarantined files:', error);
      return [];
    }
  }

  /**
   * Release file from quarantine
   */
  async releaseFromQuarantine(fileName: string, restorePath: string): Promise<void> {
    try {
      const quarantineDir = path.join(this.quarantinePath, fileName);
      const filePath = path.join(quarantineDir, 'file');
      const metaPath = path.join(quarantineDir, 'metadata.json');

      // Verify quarantined file exists
      await fs.access(filePath);
      
      // Read metadata
      const metaContent = await fs.readFile(metaPath, 'utf-8');
      const metadata = JSON.parse(metaContent);

      // Restore file
      await fs.copyFile(filePath, restorePath);
      
      // Remove from quarantine
      await fs.rm(quarantineDir, { recursive: true });

      this.logger.log(`File released from quarantine: ${fileName} -> ${restorePath}`);

    } catch (error) {
      this.logger.error(`Failed to release file from quarantine: ${fileName}`, error);
      throw new BadRequestException(`Failed to release file: ${error.message}`);
    }
  }

  /**
   * Delete quarantined file permanently
   */
  async deleteQuarantinedFile(fileName: string): Promise<void> {
    try {
      const quarantineDir = path.join(this.quarantinePath, fileName);
      await fs.rm(quarantineDir, { recursive: true });
      
      this.logger.log(`Quarantined file deleted permanently: ${fileName}`);

    } catch (error) {
      this.logger.error(`Failed to delete quarantined file: ${fileName}`, error);
      throw new BadRequestException(`Failed to delete quarantined file: ${error.message}`);
    }
  }

  /**
   * Update scan engine configuration
   */
  updateEngineConfig(engineName: string, config: Partial<ScanEngineConfig>): void {
    const currentConfig = this.scanEngines.get(engineName);
    if (currentConfig) {
      this.scanEngines.set(engineName, { ...currentConfig, ...config });
      this.logger.log(`Updated configuration for scan engine: ${engineName}`);
    }
  }

  /**
   * Get scan engine status
   */
  async getEngineStatus(): Promise<Map<string, {
    enabled: boolean;
    available: boolean;
    version?: string;
    lastCheck: Date;
  }>> {
    const status = new Map();

    for (const [engineName, config] of this.scanEngines.entries()) {
      try {
        const available = await this.checkEngineAvailability(engineName, config);
        status.set(engineName, {
          enabled: config.enabled,
          available,
          lastCheck: new Date(),
        });
      } catch (error) {
        status.set(engineName, {
          enabled: config.enabled,
          available: false,
          lastCheck: new Date(),
          error: error.message,
        });
      }
    }

    return status;
  }

  // Private methods

  private initializeScanEngines(): void {
    // ClamAV configuration
    this.scanEngines.set('clamav', {
      enabled: this.configService.get<boolean>('CLAMAV_ENABLED', true),
      priority: 1,
      timeout: this.configService.get<number>('CLAMAV_TIMEOUT', 30000),
      endpoint: this.configService.get<string>('CLAMAV_ENDPOINT', 'http://localhost:3310'),
      maxFileSize: this.configService.get<number>('CLAMAV_MAX_FILE_SIZE', 100 * 1024 * 1024),
    });

    // VirusTotal API configuration
    this.scanEngines.set('virustotal', {
      enabled: this.configService.get<boolean>('VIRUSTOTAL_ENABLED', false),
      priority: 2,
      timeout: this.configService.get<number>('VIRUSTOTAL_TIMEOUT', 60000),
      endpoint: 'https://www.virustotal.com/vtapi/v2/file/scan',
      apiKey: this.configService.get<string>('VIRUSTOTAL_API_KEY'),
      maxFileSize: 32 * 1024 * 1024, // VirusTotal limit
    });

    // Windows Defender (Windows only)
    if (process.platform === 'win32') {
      this.scanEngines.set('windows_defender', {
        enabled: this.configService.get<boolean>('WINDOWS_DEFENDER_ENABLED', false),
        priority: 3,
        timeout: this.configService.get<number>('WINDOWS_DEFENDER_TIMEOUT', 30000),
        maxFileSize: this.configService.get<number>('WINDOWS_DEFENDER_MAX_FILE_SIZE', 100 * 1024 * 1024),
      });
    }

    this.logger.log(`Initialized ${this.scanEngines.size} virus scan engines`);
  }

  private async initializeQuarantineDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.quarantinePath, { recursive: true });
      this.logger.log(`Quarantine directory initialized: ${this.quarantinePath}`);
    } catch (error) {
      this.logger.error('Failed to initialize quarantine directory:', error);
    }
  }

  private async scanWithEngine(
    engineName: string,
    filePath: string,
    config: ScanEngineConfig
  ): Promise<VirusScanResult | null> {
    const startTime = Date.now();
    
    try {
      switch (engineName) {
        case 'clamav':
          return await this.scanWithClamAV(filePath, config, startTime);
        
        case 'virustotal':
          return await this.scanWithVirusTotal(filePath, config, startTime);
        
        case 'windows_defender':
          return await this.scanWithWindowsDefender(filePath, config, startTime);
        
        default:
          this.logger.warn(`Unknown scan engine: ${engineName}`);
          return null;
      }
    } catch (error) {
      this.logger.error(`Scan engine ${engineName} error:`, error);
      return null;
    }
  }

  private async scanWithClamAV(
    filePath: string,
    config: ScanEngineConfig,
    startTime: number
  ): Promise<VirusScanResult> {
    try {
      // Try ClamAV daemon first
      if (config.endpoint) {
        return await this.scanWithClamAVDaemon(filePath, config, startTime);
      }
      
      // Fall back to command line
      return await this.scanWithClamAVCLI(filePath, config, startTime);

    } catch (error) {
      throw new Error(`ClamAV scan failed: ${error.message}`);
    }
  }

  private async scanWithClamAVDaemon(
    filePath: string,
    config: ScanEngineConfig,
    startTime: number
  ): Promise<VirusScanResult> {
    try {
      const formData = new FormData();
      const fileBuffer = await fs.readFile(filePath);
      formData.append('file', new Blob([fileBuffer]), path.basename(filePath));

      const response = await firstValueFrom(
        this.httpService.post(`${config.endpoint}/scan`, formData, {
          timeout: config.timeout,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );

      const result = response.data;
      const scanDuration = Date.now() - startTime;
      
      return {
        isClean: result.status === 'clean',
        scanEngine: 'clamav_daemon',
        threatName: result.threat || undefined,
        confidence: result.status === 'clean' ? 0.95 : 0.85,
        scanDuration,
        quarantined: false,
        scanDetails: {
          fileHash: await this.calculateFileHash(filePath),
          fileSize: (await fs.stat(filePath)).size,
          scanTime: new Date(),
          engineVersion: result.version,
          scanId: crypto.randomUUID(),
        },
      };

    } catch (error) {
      throw new Error(`ClamAV daemon scan failed: ${error.message}`);
    }
  }

  private async scanWithClamAVCLI(
    filePath: string,
    config: ScanEngineConfig,
    startTime: number
  ): Promise<VirusScanResult> {
    try {
      const { stdout, stderr } = await execPromise(`clamscan --no-summary "${filePath}"`);
      const scanDuration = Date.now() - startTime;
      
      const isClean = !stdout.includes('FOUND');
      const threatMatch = stdout.match(/: (.+) FOUND/);
      const threatName = threatMatch ? threatMatch[1] : undefined;

      return {
        isClean,
        scanEngine: 'clamav_cli',
        threatName,
        confidence: 0.9,
        scanDuration,
        quarantined: false,
        scanDetails: {
          fileHash: await this.calculateFileHash(filePath),
          fileSize: (await fs.stat(filePath)).size,
          scanTime: new Date(),
          scanId: crypto.randomUUID(),
        },
      };

    } catch (error) {
      throw new Error(`ClamAV CLI scan failed: ${error.message}`);
    }
  }

  private async scanWithVirusTotal(
    filePath: string,
    config: ScanEngineConfig,
    startTime: number
  ): Promise<VirusScanResult> {
    if (!config.apiKey) {
      throw new Error('VirusTotal API key not configured');
    }

    try {
      const fileBuffer = await fs.readFile(filePath);
      const fileHash = await this.calculateFileHash(filePath);

      // First check if file is already scanned
      const reportResponse = await firstValueFrom(
        this.httpService.get(`https://www.virustotal.com/vtapi/v2/file/report`, {
          params: {
            apikey: config.apiKey,
            resource: fileHash,
          },
          timeout: config.timeout,
        })
      );

      let scanResult = reportResponse.data;

      // If not scanned, submit for scanning
      if (scanResult.response_code === 0) {
        const formData = new FormData();
        formData.append('file', new Blob([fileBuffer]), path.basename(filePath));

        await firstValueFrom(
          this.httpService.post(`${config.endpoint}`, formData, {
            params: { apikey: config.apiKey },
            timeout: config.timeout,
          })
        );

        // Wait and check again (simplified - should use proper polling)
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        const newReportResponse = await firstValueFrom(
          this.httpService.get(`https://www.virustotal.com/vtapi/v2/file/report`, {
            params: {
              apikey: config.apiKey,
              resource: fileHash,
            },
            timeout: config.timeout,
          })
        );

        scanResult = newReportResponse.data;
      }

      const scanDuration = Date.now() - startTime;
      const positives = scanResult.positives || 0;
      const total = scanResult.total || 1;
      const isClean = positives === 0;

      return {
        isClean,
        scanEngine: 'virustotal',
        threatName: isClean ? undefined : `Detected by ${positives}/${total} engines`,
        confidence: Math.max(0.7, (total - positives) / total),
        scanDuration,
        quarantined: false,
        scanDetails: {
          fileHash,
          fileSize: (await fs.stat(filePath)).size,
          scanTime: new Date(),
          scanId: scanResult.scan_id,
        },
      };

    } catch (error) {
      throw new Error(`VirusTotal scan failed: ${error.message}`);
    }
  }

  private async scanWithWindowsDefender(
    filePath: string,
    config: ScanEngineConfig,
    startTime: number
  ): Promise<VirusScanResult> {
    if (process.platform !== 'win32') {
      throw new Error('Windows Defender only available on Windows');
    }

    try {
      const { stdout, stderr } = await execPromise(
        `powershell.exe -Command "Start-MpScan -ScanType CustomScan -ScanPath '${filePath}'"`
      );

      const scanDuration = Date.now() - startTime;
      const isClean = !stderr.includes('threat') && !stdout.includes('threat');

      return {
        isClean,
        scanEngine: 'windows_defender',
        threatName: isClean ? undefined : 'Threat detected',
        confidence: 0.85,
        scanDuration,
        quarantined: false,
        scanDetails: {
          fileHash: await this.calculateFileHash(filePath),
          fileSize: (await fs.stat(filePath)).size,
          scanTime: new Date(),
          scanId: crypto.randomUUID(),
        },
      };

    } catch (error) {
      throw new Error(`Windows Defender scan failed: ${error.message}`);
    }
  }

  private async quarantineFile(filePath: string, scanResult: VirusScanResult): Promise<void> {
    try {
      const fileName = path.basename(filePath);
      const quarantineId = crypto.randomUUID();
      const quarantineDir = path.join(this.quarantinePath, quarantineId);
      
      // Create quarantine directory
      await fs.mkdir(quarantineDir, { recursive: true });
      
      // Move file to quarantine
      const quarantinedFilePath = path.join(quarantineDir, 'file');
      await fs.copyFile(filePath, quarantinedFilePath);
      
      // Create metadata
      const metadata = {
        originalPath: filePath,
        originalName: fileName,
        quarantineTime: new Date(),
        threatName: scanResult.threatName,
        scanEngine: scanResult.scanEngine,
        fileSize: scanResult.scanDetails.fileSize,
        fileHash: scanResult.scanDetails.fileHash,
      };
      
      const metadataPath = path.join(quarantineDir, 'metadata.json');
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      
      // Remove original file
      await fs.unlink(filePath);
      
      scanResult.quarantined = true;
      this.logger.warn(`File quarantined: ${fileName} (${scanResult.threatName})`);

    } catch (error) {
      this.logger.error(`Failed to quarantine file: ${filePath}`, error);
    }
  }

  private async checkEngineAvailability(engineName: string, config: ScanEngineConfig): Promise<boolean> {
    try {
      switch (engineName) {
        case 'clamav':
          if (config.endpoint) {
            const response = await firstValueFrom(
              this.httpService.get(`${config.endpoint}/ping`, { timeout: 5000 })
            );
            return response.status === 200;
          } else {
            await execPromise('clamscan --version');
            return true;
          }
        
        case 'virustotal':
          return !!config.apiKey;
        
        case 'windows_defender':
          if (process.platform === 'win32') {
            await execPromise('powershell.exe -Command "Get-MpComputerStatus"');
            return true;
          }
          return false;
        
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  private createCleanResult(filePath: string, engine: string, duration: number): VirusScanResult {
    return {
      isClean: true,
      scanEngine: engine,
      confidence: engine === 'disabled' ? 0 : 0.5,
      scanDuration: duration,
      quarantined: false,
      scanDetails: {
        fileHash: '',
        fileSize: 0,
        scanTime: new Date(),
        scanId: crypto.randomUUID(),
      },
    };
  }

  private async calculateFileHash(filePath: string): Promise<string> {
    try {
      const fileBuffer = await fs.readFile(filePath);
      return crypto.createHash('sha256').update(fileBuffer).digest('hex');
    } catch (error) {
      return '';
    }
  }
}
