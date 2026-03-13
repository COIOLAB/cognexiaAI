import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import { SwaggerConfigService } from '../config/swagger.config';
import { ApiVersioningService } from '../config/api-versioning.config';

const execAsync = promisify(exec);

export interface DocumentationConfig {
  outputPath: string;
  formats: ('json' | 'yaml' | 'html' | 'pdf' | 'markdown')[];
  includeExamples: boolean;
  includeSchemas: boolean;
  includeSecuritySpecs: boolean;
  generatePostmanCollection: boolean;
  generateInsomnieCollection: boolean;
  generateSDKs: boolean;
  autoPublish: boolean;
  publishTargets: Array<{
    type: 'github' | 's3' | 'confluence' | 'gitbook' | 'notion';
    config: any;
  }>;
  monitoring: {
    enabled: boolean;
    checkInterval: number;
    alertOnErrors: boolean;
    healthCheckEndpoint: string;
  };
}

export interface GenerationResult {
  success: boolean;
  timestamp: string;
  formats: string[];
  files: Array<{
    format: string;
    path: string;
    size: number;
  }>;
  errors: string[];
  warnings: string[];
  stats: {
    endpoints: number;
    schemas: number;
    examples: number;
    generationTime: number;
  };
}

@Injectable()
export class DocumentationService {
  private readonly logger = new Logger(DocumentationService.name);
  private readonly config: DocumentationConfig;

  constructor(
    private configService: ConfigService,
    private swaggerConfig: SwaggerConfigService,
    private versioningService: ApiVersioningService,
  ) {
    this.config = {
      outputPath: this.configService.get('DOCS_OUTPUT_PATH', './docs/generated'),
      formats: ['json', 'yaml', 'html', 'markdown'],
      includeExamples: true,
      includeSchemas: true,
      includeSecuritySpecs: true,
      generatePostmanCollection: true,
      generateInsomnieCollection: true,
      generateSDKs: this.configService.get('GENERATE_SDKS', false),
      autoPublish: this.configService.get('AUTO_PUBLISH_DOCS', false),
      publishTargets: this.getPublishTargets(),
      monitoring: {
        enabled: this.configService.get('DOCS_MONITORING_ENABLED', true),
        checkInterval: 5 * 60 * 1000, // 5 minutes
        alertOnErrors: true,
        healthCheckEndpoint: '/health',
      },
    };
  }

  /**
   * Generate comprehensive API documentation
   */
  async generateDocumentation(version?: string): Promise<GenerationResult> {
    const startTime = Date.now();
    const result: GenerationResult = {
      success: false,
      timestamp: new Date().toISOString(),
      formats: [],
      files: [],
      errors: [],
      warnings: [],
      stats: {
        endpoints: 0,
        schemas: 0,
        examples: 0,
        generationTime: 0,
      },
    };

    try {
      this.logger.log('Starting documentation generation...');

      // Ensure output directory exists
      await this.ensureOutputDirectory();

      // Get OpenAPI specification
      const openApiSpec = await this.getOpenApiSpecification(version);
      result.stats.endpoints = this.countEndpoints(openApiSpec);
      result.stats.schemas = this.countSchemas(openApiSpec);
      result.stats.examples = this.countExamples(openApiSpec);

      // Generate documentation in various formats
      for (const format of this.config.formats) {
        try {
          const filePath = await this.generateFormat(openApiSpec, format, version);
          const stats = await fs.stat(filePath);
          
          result.files.push({
            format,
            path: filePath,
            size: stats.size,
          });
          result.formats.push(format);
        } catch (error) {
          result.errors.push(`Failed to generate ${format}: ${error.message}`);
        }
      }

      // Generate additional collections
      if (this.config.generatePostmanCollection) {
        try {
          const postmanPath = await this.generatePostmanCollection(openApiSpec, version);
          const stats = await fs.stat(postmanPath);
          result.files.push({
            format: 'postman',
            path: postmanPath,
            size: stats.size,
          });
        } catch (error) {
          result.errors.push(`Failed to generate Postman collection: ${error.message}`);
        }
      }

      if (this.config.generateInsomnieCollection) {
        try {
          const insomniaPath = await this.generateInsomniaCollection(openApiSpec, version);
          const stats = await fs.stat(insomniaPath);
          result.files.push({
            format: 'insomnia',
            path: insomniaPath,
            size: stats.size,
          });
        } catch (error) {
          result.errors.push(`Failed to generate Insomnia collection: ${error.message}`);
        }
      }

      // Generate SDKs if enabled
      if (this.config.generateSDKs) {
        try {
          await this.generateSDKs(openApiSpec, version);
        } catch (error) {
          result.errors.push(`Failed to generate SDKs: ${error.message}`);
        }
      }

      // Generate additional documentation
      await this.generateAdditionalDocs(version);

      // Auto-publish if enabled
      if (this.config.autoPublish) {
        await this.publishDocumentation(result);
      }

      result.success = result.errors.length === 0;
      result.stats.generationTime = Date.now() - startTime;

      this.logger.log(`Documentation generation completed in ${result.stats.generationTime}ms`);
      return result;

    } catch (error) {
      result.errors.push(`Documentation generation failed: ${error.message}`);
      result.stats.generationTime = Date.now() - startTime;
      this.logger.error('Documentation generation failed', error);
      return result;
    }
  }

  /**
   * Scheduled documentation generation
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async scheduledGeneration(): Promise<void> {
    try {
      this.logger.log('Running scheduled documentation generation');
      
      // Generate docs for all active versions
      const activeVersions = this.versioningService.getActiveVersions();
      
      for (const versionInfo of activeVersions) {
        await this.generateDocumentation(versionInfo.version);
      }
      
      // Generate version comparison report
      await this.generateVersionComparisonReport();
      
      this.logger.log('Scheduled documentation generation completed');
    } catch (error) {
      this.logger.error('Scheduled documentation generation failed', error);
    }
  }

  /**
   * Generate format-specific documentation
   */
  private async generateFormat(spec: any, format: string, version?: string): Promise<string> {
    const baseFileName = `api-docs${version ? `-${version}` : ''}`;
    const outputPath = path.join(this.config.outputPath, `${baseFileName}.${format}`);

    switch (format) {
      case 'json':
        await fs.writeFile(outputPath, JSON.stringify(spec, null, 2));
        break;

      case 'yaml':
        const yaml = require('yaml');
        await fs.writeFile(outputPath, yaml.stringify(spec));
        break;

      case 'html':
        await this.generateHtmlDocs(spec, outputPath, version);
        break;

      case 'markdown':
        await this.generateMarkdownDocs(spec, outputPath, version);
        break;

      case 'pdf':
        await this.generatePdfDocs(spec, outputPath, version);
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    return outputPath;
  }

  /**
   * Generate HTML documentation
   */
  private async generateHtmlDocs(spec: any, outputPath: string, version?: string): Promise<void> {
    try {
      // Use redoc-cli to generate HTML
      const command = `npx redoc-cli build-static ${JSON.stringify(JSON.stringify(spec))} --output ${outputPath}`;
      await execAsync(command);
    } catch (error) {
      // Fallback: generate simple HTML
      const html = this.generateSimpleHtml(spec, version);
      await fs.writeFile(outputPath, html);
    }
  }

  /**
   * Generate Markdown documentation
   */
  private async generateMarkdownDocs(spec: any, outputPath: string, version?: string): Promise<void> {
    const markdown = this.convertOpenApiToMarkdown(spec, version);
    await fs.writeFile(outputPath, markdown);
  }

  /**
   * Generate PDF documentation
   */
  private async generatePdfDocs(spec: any, outputPath: string, version?: string): Promise<void> {
    try {
      // First generate HTML, then convert to PDF
      const htmlPath = outputPath.replace('.pdf', '.html');
      await this.generateHtmlDocs(spec, htmlPath, version);
      
      // Use puppeteer to convert HTML to PDF
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(`file://${path.resolve(htmlPath)}`);
      await page.pdf({ path: outputPath, format: 'A4' });
      await browser.close();
      
      // Clean up temporary HTML file
      await fs.unlink(htmlPath);
    } catch (error) {
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  /**
   * Generate Postman collection
   */
  private async generatePostmanCollection(spec: any, version?: string): Promise<string> {
    const collection = this.convertOpenApiToPostman(spec, version);
    const outputPath = path.join(
      this.config.outputPath,
      `postman-collection${version ? `-${version}` : ''}.json`
    );
    
    await fs.writeFile(outputPath, JSON.stringify(collection, null, 2));
    return outputPath;
  }

  /**
   * Generate Insomnia collection
   */
  private async generateInsomniaCollection(spec: any, version?: string): Promise<string> {
    const collection = this.convertOpenApiToInsomnia(spec, version);
    const outputPath = path.join(
      this.config.outputPath,
      `insomnia-collection${version ? `-${version}` : ''}.json`
    );
    
    await fs.writeFile(outputPath, JSON.stringify(collection, null, 2));
    return outputPath;
  }

  /**
   * Generate SDKs in multiple languages
   */
  private async generateSDKs(spec: any, version?: string): Promise<void> {
    const languages = ['typescript', 'python', 'java', 'csharp', 'go', 'php'];
    
    for (const lang of languages) {
      try {
        const outputDir = path.join(this.config.outputPath, 'sdks', lang);
        await fs.mkdir(outputDir, { recursive: true });
        
        // Use openapi-generator to generate SDKs
        const command = `npx @openapitools/openapi-generator-cli generate -i ${JSON.stringify(JSON.stringify(spec))} -g ${lang} -o ${outputDir}`;
        await execAsync(command);
        
        this.logger.log(`Generated ${lang} SDK`);
      } catch (error) {
        this.logger.warn(`Failed to generate ${lang} SDK: ${error.message}`);
      }
    }
  }

  /**
   * Generate additional documentation files
   */
  private async generateAdditionalDocs(version?: string): Promise<void> {
    try {
      // Generate README
      const readme = await this.generateReadme(version);
      await fs.writeFile(path.join(this.config.outputPath, 'README.md'), readme);

      // Generate changelog
      const changelog = await this.generateChangelog();
      await fs.writeFile(path.join(this.config.outputPath, 'CHANGELOG.md'), changelog);

      // Generate migration guides
      await this.generateMigrationGuides();

      // Generate authentication guide
      const authGuide = await this.generateAuthenticationGuide();
      await fs.writeFile(path.join(this.config.outputPath, 'AUTHENTICATION.md'), authGuide);

      // Generate rate limiting guide
      const rateLimitGuide = await this.generateRateLimitingGuide();
      await fs.writeFile(path.join(this.config.outputPath, 'RATE_LIMITING.md'), rateLimitGuide);

      // Generate error handling guide
      const errorGuide = await this.generateErrorHandlingGuide();
      await fs.writeFile(path.join(this.config.outputPath, 'ERROR_HANDLING.md'), errorGuide);

    } catch (error) {
      this.logger.error('Failed to generate additional documentation', error);
    }
  }

  /**
   * Generate version comparison report
   */
  private async generateVersionComparisonReport(): Promise<void> {
    try {
      const versions = this.versioningService.getAllVersions();
      const comparison = {
        generatedAt: new Date().toISOString(),
        versions: versions.map(v => ({
          version: v.version,
          status: v.status,
          features: v.features,
          breaking: v.breaking,
        })),
        differences: await this.compareVersions(versions),
      };

      const outputPath = path.join(this.config.outputPath, 'version-comparison.json');
      await fs.writeFile(outputPath, JSON.stringify(comparison, null, 2));
    } catch (error) {
      this.logger.error('Failed to generate version comparison report', error);
    }
  }

  /**
   * Publish documentation to configured targets
   */
  private async publishDocumentation(result: GenerationResult): Promise<void> {
    for (const target of this.config.publishTargets) {
      try {
        await this.publishToTarget(target, result);
        this.logger.log(`Published documentation to ${target.type}`);
      } catch (error) {
        this.logger.error(`Failed to publish to ${target.type}: ${error.message}`);
      }
    }
  }

  // Helper methods
  private async getOpenApiSpecification(version?: string): Promise<any> {
    // This would typically fetch from your Swagger service
    // For now, return a mock structure
    return {
      openapi: '3.0.0',
      info: {
        title: 'Industry 5.0 Inventory Management API',
        version: version || '1.0.0',
      },
      paths: {},
      components: {
        schemas: {},
      },
    };
  }

  private async ensureOutputDirectory(): Promise<void> {
    await fs.mkdir(this.config.outputPath, { recursive: true });
  }

  private countEndpoints(spec: any): number {
    return Object.keys(spec.paths || {}).length;
  }

  private countSchemas(spec: any): number {
    return Object.keys(spec.components?.schemas || {}).length;
  }

  private countExamples(spec: any): number {
    // Count examples in paths and schemas
    let count = 0;
    // Implementation would count actual examples
    return count;
  }

  private generateSimpleHtml(spec: any, version?: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>API Documentation ${version ? `- ${version}` : ''}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .endpoint { border: 1px solid #ddd; margin: 10px 0; padding: 15px; }
        .method { font-weight: bold; color: #007bff; }
    </style>
</head>
<body>
    <h1>API Documentation ${version ? `- ${version}` : ''}</h1>
    <p>Generated on: ${new Date().toISOString()}</p>
    <!-- API documentation content would go here -->
</body>
</html>
    `;
  }

  private convertOpenApiToMarkdown(spec: any, version?: string): string {
    return `# API Documentation ${version ? `- ${version}` : ''}

Generated on: ${new Date().toISOString()}

## Overview
${spec.info?.description || 'API documentation'}

## Endpoints
<!-- Endpoint documentation would be generated here -->
`;
  }

  private convertOpenApiToPostman(spec: any, version?: string): any {
    return {
      info: {
        name: `${spec.info?.title || 'API'} ${version ? `- ${version}` : ''}`,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: [],
    };
  }

  private convertOpenApiToInsomnia(spec: any, version?: string): any {
    return {
      _type: 'export',
      __export_format: 4,
      resources: [],
    };
  }

  private async generateReadme(version?: string): Promise<string> {
    return `# Industry 5.0 Inventory Management API ${version ? `- ${version}` : ''}

## Quick Start
1. Obtain API credentials
2. Make your first request
3. Explore the full API documentation

## Authentication
This API uses JWT-based authentication with multi-factor authentication support.

## Rate Limits
- 1000 requests per hour per authenticated user
- 100 requests per hour per IP for unauthenticated requests

## Support
For support, please contact: api-support@industry5.0.com
`;
  }

  private async generateChangelog(): Promise<string> {
    const versionReport = this.versioningService.generateVersionReport();
    return `# Changelog

All notable changes to this API will be documented in this file.

${versionReport.versions.map(v => `
## [${v.version}] - ${v.releaseDate}
- Status: ${v.status}
- Features: ${v.featureCount} total features
${v.breaking ? '- **BREAKING CHANGES** in this version' : ''}
`).join('\n')}
`;
  }

  private async generateMigrationGuides(): Promise<void> {
    const versions = this.versioningService.getAllVersions();
    
    for (const version of versions) {
      if (version.migration) {
        const guide = `# Migration Guide - ${version.version}

## Overview
Migration guide for ${version.version}

## Breaking Changes
${version.breaking ? 'This version contains breaking changes' : 'No breaking changes'}

## Migration Steps
1. Review the changes
2. Update your code
3. Test thoroughly
4. Deploy

## Support
Migration support ends on: ${version.migration.supportEndDate}
`;
        
        const guidePath = path.join(this.config.outputPath, `migration-${version.version}.md`);
        await fs.writeFile(guidePath, guide);
      }
    }
  }

  private async generateAuthenticationGuide(): Promise<string> {
    return `# Authentication Guide

## Overview
This API supports multiple authentication methods for different use cases.

## JWT Authentication
The primary authentication method using JSON Web Tokens.

## Multi-Factor Authentication
Enhanced security with MFA support.

## OAuth2
OAuth2 integration for third-party applications.

## API Keys
Service-to-service authentication.
`;
  }

  private async generateRateLimitingGuide(): Promise<string> {
    return `# Rate Limiting Guide

## Overview
API requests are rate limited to ensure fair usage and system stability.

## Limits
- Authenticated users: 1000 requests per hour
- Unauthenticated requests: 100 requests per hour per IP

## Headers
Rate limit information is provided in response headers.

## Best Practices
- Implement exponential backoff
- Cache responses when appropriate
- Use webhooks instead of polling
`;
  }

  private async generateErrorHandlingGuide(): Promise<string> {
    return `# Error Handling Guide

## Overview
This guide explains how to handle errors when using the API.

## HTTP Status Codes
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Rate Limited
- 500: Internal Server Error

## Error Response Format
All errors follow a consistent format.

## Retry Logic
Implement appropriate retry logic for transient errors.
`;
  }

  private async compareVersions(versions: any[]): Promise<any> {
    // Implementation would compare API versions
    return {};
  }

  private async publishToTarget(target: any, result: GenerationResult): Promise<void> {
    switch (target.type) {
      case 'github':
        await this.publishToGitHub(target.config, result);
        break;
      case 's3':
        await this.publishToS3(target.config, result);
        break;
      case 'confluence':
        await this.publishToConfluence(target.config, result);
        break;
      default:
        throw new Error(`Unsupported publish target: ${target.type}`);
    }
  }

  private async publishToGitHub(config: any, result: GenerationResult): Promise<void> {
    // GitHub publishing implementation
  }

  private async publishToS3(config: any, result: GenerationResult): Promise<void> {
    // S3 publishing implementation
  }

  private async publishToConfluence(config: any, result: GenerationResult): Promise<void> {
    // Confluence publishing implementation
  }

  private getPublishTargets(): any[] {
    // Get from configuration
    return [];
  }
}
