import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface RealtimeConfig {
  manufacturing: {
    channels: {
      production_orders: string;
      work_orders: string;
      equipment_status: string;
      quality_checks: string;
    };
  };
  crm: {
    channels: {
      customers: string;
      leads: string;
      opportunities: string;
      campaigns: string;
    };
  };
}

@Injectable()
export class SupabaseConfigService {
  private supabaseClient: SupabaseClient;
  private realtimeConfig: RealtimeConfig;

  constructor(private readonly configService: ConfigService) {
    this.initializeSupabase();
    this.setupRealtimeConfig();
  }

  private initializeSupabase(): void {
    const config = this.connectionConfig;
    this.supabaseClient = createClient(config.url, config.key, config.options);
  }

  private setupRealtimeConfig(): void {
    this.realtimeConfig = {
      manufacturing: {
        channels: {
          production_orders: 'production-orders-channel',
          work_orders: 'work-orders-channel',
          equipment_status: 'equipment-status-channel',
          quality_checks: 'quality-checks-channel',
        },
      },
      crm: {
        channels: {
          customers: 'customers-channel',
          leads: 'leads-channel',
          opportunities: 'opportunities-channel',
          campaigns: 'campaigns-channel',
        },
      },
    };
  }

  get supabaseUrl(): string {
    return this.configService.get<string>('SUPABASE_URL') || 'https://your-project.supabase.co';
  }

  get supabaseKey(): string {
    return this.configService.get<string>('SUPABASE_ANON_KEY') || 'your-anon-key';
  }

  get supabaseServiceRoleKey(): string {
    return this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || 'your-service-role-key';
  }

  get isDevelopment(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'development';
  }

  get connectionConfig() {
    return {
      url: this.supabaseUrl,
      key: this.supabaseKey,
      options: {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      },
    };
  }

  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  getRealtimeConfig(): RealtimeConfig {
    return this.realtimeConfig;
  }

  async healthCheck(): Promise<{ status: string; timestamp: Date; details?: string }> {
    try {
      // Test connection with a simple query
      const { data, error } = await this.supabaseClient
        .from('_health_check')
        .select('*')
        .limit(1);

      if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found" which is expected
        throw error;
      }

      return {
        status: 'healthy',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const health = await this.healthCheck();
      return health.status === 'healthy';
    } catch {
      return false;
    }
  }

  getConnectionInfo(): {
    url: string;
    connected: boolean;
    realtimeEnabled: boolean;
  } {
    return {
      url: this.supabaseUrl,
      connected: !!this.supabaseClient,
      realtimeEnabled: true,
    };
  }

  async closeConnection(): Promise<void> {
    if (this.supabaseClient) {
      this.supabaseClient.removeAllChannels();
    }
  }
}
