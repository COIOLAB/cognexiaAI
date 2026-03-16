import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ApiVersion {
  version: string;
  path: string;
  description: string;
  releaseDate: string;
  deprecationDate?: string;
  sunsetDate?: string;
  status: 'active' | 'deprecated' | 'sunset';
  breaking: boolean;
  features: string[];
  migration?: {
    guide: string;
    automatedToolsAvailable: boolean;
    supportEndDate: string;
  };
}

export interface ApiVersioningConfig {
  defaultVersion: string;
  supportedVersions: ApiVersion[];
  deprecationPolicy: {
    minimumSupportPeriod: number; // months
    warningPeriod: number; // months before deprecation
    migrationGracePeriod: number; // months after deprecation
  };
  headers: {
    version: string;
    deprecation: string;
    sunset: string;
    link: string;
  };
}

@Injectable()
export class ApiVersioningService {
  private readonly config: ApiVersioningConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      defaultVersion: this.configService.get('API_DEFAULT_VERSION', 'v1'),
      supportedVersions: this.getSupportedVersions(),
      deprecationPolicy: {
        minimumSupportPeriod: 24, // 2 years
        warningPeriod: 6, // 6 months warning
        migrationGracePeriod: 12, // 1 year grace period
      },
      headers: {
        version: 'X-API-Version',
        deprecation: 'Deprecation',
        sunset: 'Sunset',
        link: 'Link',
      },
    };
  }

  private getSupportedVersions(): ApiVersion[] {
    return [
      {
        version: 'v1',
        path: 'v1',
        description: 'Initial API version with core inventory management features',
        releaseDate: '2023-01-01',
        deprecationDate: '2025-01-01',
        sunsetDate: '2026-01-01',
        status: 'deprecated',
        breaking: false,
        features: [
          'Basic inventory CRUD operations',
          'Simple stock tracking',
          'Basic reporting',
          'User authentication',
        ],
        migration: {
          guide: 'https://docs.industry5.0.com/migration/v1-to-v2',
          automatedToolsAvailable: true,
          supportEndDate: '2026-01-01',
        },
      },
      {
        version: 'v2',
        path: 'v2',
        description: 'Enhanced API with advanced features and improved security',
        releaseDate: '2024-01-01',
        status: 'active',
        breaking: true,
        features: [
          'Advanced inventory analytics',
          'Real-time tracking',
          'Multi-factor authentication',
          'Advanced reporting',
          'Bulk operations',
          'Webhook support',
          'GraphQL endpoints',
        ],
        migration: {
          guide: 'https://docs.industry5.0.com/migration/v2-features',
          automatedToolsAvailable: true,
          supportEndDate: '2027-01-01',
        },
      },
      {
        version: 'v3',
        path: 'v3',
        description: 'Latest API with AI/ML integration, blockchain, and Industry 5.0 features',
        releaseDate: '2024-06-01',
        status: 'active',
        breaking: true,
        features: [
          'AI-powered demand forecasting',
          'Blockchain supply chain tracking',
          'IoT device integration',
          'Advanced security (FIPS 140-2)',
          'Zero-trust architecture',
          'Government-grade compliance',
          'Quantum-ready cryptography',
          'Autonomous inventory management',
          'Digital twin integration',
          'Predictive maintenance',
        ],
      },
      {
        version: 'beta',
        path: 'beta',
        description: 'Beta API with experimental features and upcoming enhancements',
        releaseDate: '2024-08-01',
        status: 'active',
        breaking: false,
        features: [
          'Experimental AI features',
          'Advanced quantum algorithms',
          'Next-generation security',
          'Enhanced blockchain integration',
          'Experimental IoT protocols',
        ],
      },
    ];
  }

  getVersionConfig(version?: string): ApiVersion | null {
    const targetVersion = version || this.config.defaultVersion;
    return this.config.supportedVersions.find(v => v.version === targetVersion) || null;
  }

  getAllVersions(): ApiVersion[] {
    return this.config.supportedVersions;
  }

  getActiveVersions(): ApiVersion[] {
    return this.config.supportedVersions.filter(v => v.status === 'active');
  }

  getDeprecatedVersions(): ApiVersion[] {
    return this.config.supportedVersions.filter(v => v.status === 'deprecated');
  }

  isVersionSupported(version: string): boolean {
    return this.config.supportedVersions.some(v => v.version === version);
  }

  isVersionDeprecated(version: string): boolean {
    const versionConfig = this.getVersionConfig(version);
    return versionConfig?.status === 'deprecated';
  }

  isVersionSunset(version: string): boolean {
    const versionConfig = this.getVersionConfig(version);
    return versionConfig?.status === 'sunset';
  }

  getVersionHeaders(version: string): Record<string, string> {
    const versionConfig = this.getVersionConfig(version);
    const headers: Record<string, string> = {};

    if (!versionConfig) {
      return headers;
    }

    // Add version header
    headers[this.config.headers.version] = version;

    // Add deprecation headers if applicable
    if (versionConfig.status === 'deprecated' && versionConfig.deprecationDate) {
      headers[this.config.headers.deprecation] = versionConfig.deprecationDate;
    }

    // Add sunset headers if applicable
    if (versionConfig.sunsetDate) {
      headers[this.config.headers.sunset] = versionConfig.sunsetDate;
    }

    // Add link to migration guide
    if (versionConfig.migration?.guide) {
      headers[this.config.headers.link] = `<${versionConfig.migration.guide}>; rel="successor-version"`;
    }

    return headers;
  }

  getVersionMigrationInfo(version: string): any {
    const versionConfig = this.getVersionConfig(version);
    if (!versionConfig || !versionConfig.migration) {
      return null;
    }

    return {
      guide: versionConfig.migration.guide,
      automatedToolsAvailable: versionConfig.migration.automatedToolsAvailable,
      supportEndDate: versionConfig.migration.supportEndDate,
      recommendedActions: this.getRecommendedMigrationActions(version),
    };
  }

  private getRecommendedMigrationActions(version: string): string[] {
    const versionConfig = this.getVersionConfig(version);
    const actions: string[] = [];

    if (!versionConfig) {
      return actions;
    }

    if (versionConfig.status === 'deprecated') {
      actions.push('Plan migration to a supported API version');
      actions.push('Review breaking changes in the migration guide');
      actions.push('Update client applications to use newer endpoints');
      actions.push('Test thoroughly in development environment');
    }

    if (versionConfig.sunsetDate) {
      const sunsetDate = new Date(versionConfig.sunsetDate);
      const now = new Date();
      const monthsUntilSunset = Math.ceil((sunsetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));

      if (monthsUntilSunset <= 6) {
        actions.push('URGENT: This version will be sunset soon');
        actions.push('Immediate migration required to avoid service disruption');
      } else if (monthsUntilSunset <= 12) {
        actions.push('High priority migration required');
        actions.push('Contact support team for migration assistance');
      }
    }

    return actions;
  }

  generateVersionReport(): any {
    const report = {
      generatedAt: new Date().toISOString(),
      defaultVersion: this.config.defaultVersion,
      summary: {
        totalVersions: this.config.supportedVersions.length,
        activeVersions: this.getActiveVersions().length,
        deprecatedVersions: this.getDeprecatedVersions().length,
      },
      versions: this.config.supportedVersions.map(version => ({
        version: version.version,
        status: version.status,
        releaseDate: version.releaseDate,
        deprecationDate: version.deprecationDate,
        sunsetDate: version.sunsetDate,
        breaking: version.breaking,
        featureCount: version.features.length,
        migrationAvailable: !!version.migration,
      })),
      deprecationPolicy: this.config.deprecationPolicy,
      upcomingSunsets: this.getUpcomingSunsets(),
      migrationRecommendations: this.getMigrationRecommendations(),
    };

    return report;
  }

  private getUpcomingSunsets(): any[] {
    const now = new Date();
    const sixMonthsFromNow = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);

    return this.config.supportedVersions
      .filter(version => version.sunsetDate && new Date(version.sunsetDate) <= sixMonthsFromNow)
      .map(version => ({
        version: version.version,
        sunsetDate: version.sunsetDate,
        daysUntilSunset: Math.ceil((new Date(version.sunsetDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        migrationGuide: version.migration?.guide,
      }))
      .sort((a, b) => a.daysUntilSunset - b.daysUntilSunset);
  }

  private getMigrationRecommendations(): any[] {
    return this.config.supportedVersions
      .filter(version => version.status === 'deprecated' || version.sunsetDate)
      .map(version => ({
        version: version.version,
        status: version.status,
        recommendation: this.getVersionRecommendation(version),
        actions: this.getRecommendedMigrationActions(version.version),
      }));
  }

  private getVersionRecommendation(version: ApiVersion): string {
    if (version.status === 'sunset') {
      return 'Version is no longer supported. Immediate migration required.';
    }

    if (version.status === 'deprecated') {
      const activeVersions = this.getActiveVersions();
      const latestVersion = activeVersions[activeVersions.length - 1];
      return `Migrate to ${latestVersion.version} for latest features and continued support.`;
    }

    if (version.sunsetDate) {
      const sunsetDate = new Date(version.sunsetDate);
      const now = new Date();
      const daysUntilSunset = Math.ceil((sunsetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilSunset <= 90) {
        return 'URGENT: Version will be sunset within 90 days. Migrate immediately.';
      } else if (daysUntilSunset <= 180) {
        return 'Version will be sunset soon. Plan migration within next few weeks.';
      }
    }

    return 'Version is currently supported and actively maintained.';
  }

  // Middleware helper for version detection
  extractVersionFromRequest(request: any): string {
    // Check URL path first (e.g., /api/v2/inventory)
    const pathVersion = request.path.match(/\/v(\d+(\.\d+)*)/)?.[0]?.substring(1);
    if (pathVersion && this.isVersionSupported(pathVersion)) {
      return pathVersion;
    }

    // Check header
    const headerVersion = request.headers[this.config.headers.version.toLowerCase()];
    if (headerVersion && this.isVersionSupported(headerVersion)) {
      return headerVersion;
    }

    // Check query parameter
    const queryVersion = request.query?.version;
    if (queryVersion && this.isVersionSupported(queryVersion)) {
      return queryVersion;
    }

    // Check Accept header for content negotiation
    const acceptHeader = request.headers.accept;
    if (acceptHeader) {
      const versionMatch = acceptHeader.match(/application\/vnd\.industry5\.v(\d+)/);
      if (versionMatch) {
        const version = `v${versionMatch[1]}`;
        if (this.isVersionSupported(version)) {
          return version;
        }
      }
    }

    return this.config.defaultVersion;
  }

  getConfig(): ApiVersioningConfig {
    return this.config;
  }
}
