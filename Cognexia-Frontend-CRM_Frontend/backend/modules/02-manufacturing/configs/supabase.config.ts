import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseConfigService {
  private supabaseClient: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.initializeSupabase();
  }

  private initializeSupabase(): void {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      db: {
        schema: 'public'
      }
    });
  }

  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  // Manufacturing-specific database configuration
  getManufacturingDatabaseConfig() {
    return {
      host: this.extractHostFromUrl(this.configService.get<string>('SUPABASE_URL')),
      port: 5432,
      username: 'postgres',
      password: this.configService.get<string>('SUPABASE_DB_PASSWORD'),
      database: 'postgres',
      schema: 'public',
      ssl: {
        rejectUnauthorized: false
      },
      synchronize: false, // Always false for production
      logging: this.configService.get<string>('NODE_ENV') === 'development',
      entities: [
        'dist/manufacturing/entities/*.entity.js'
      ],
      migrations: [
        'dist/manufacturing/migrations/*.js'
      ],
      migrationsTableName: 'manufacturing_migrations',
      extra: {
        // Connection pool settings
        max: 20,
        min: 5,
        idle: 10000,
        acquire: 30000,
        // Supabase specific settings
        application_name: 'Industry5.0-Manufacturing',
        statement_timeout: 30000,
        query_timeout: 30000,
        connectionTimeoutMillis: 30000,
        idleTimeoutMillis: 30000
      }
    };
  }

  private extractHostFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      throw new Error('Invalid Supabase URL format');
    }
  }

  // Real-time subscription configurations
  getRealtimeConfig() {
    return {
      manufacturing: {
        channels: {
          production_orders: 'production_orders_changes',
          work_orders: 'work_orders_changes',
          equipment_status: 'equipment_status_changes',
          quality_checks: 'quality_checks_changes',
          operation_logs: 'operation_logs_changes'
        },
        events: {
          insert: 'INSERT',
          update: 'UPDATE',
          delete: 'DELETE'
        }
      }
    };
  }

  // Row Level Security policies helper
  async enableRLS(tableName: string): Promise<void> {
    const { error } = await this.supabaseClient.rpc('enable_rls_for_table', {
      table_name: tableName
    });
    
    if (error) {
      console.error(`Failed to enable RLS for table ${tableName}:`, error);
      throw error;
    }
  }

  // Manufacturing-specific RLS policies
  async setupManufacturingRLS(): Promise<void> {
    const tables = [
      'work_centers',
      'production_lines',
      'bill_of_materials',
      'production_orders',
      'work_orders',
      'operation_logs',
      'routings',
      'quality_checks',
      'equipment_maintenance',
      'production_schedules',
      'iot_devices',
      'digital_twins',
      'robotics_systems',
      'cybersecurity_events'
    ];

    for (const table of tables) {
      try {
        await this.enableRLS(table);
        console.log(`RLS enabled for table: ${table}`);
      } catch (error) {
        console.warn(`Could not enable RLS for table ${table}:`, error.message);
      }
    }
  }

  // Health check for Supabase connection
  async healthCheck(): Promise<{ status: string; timestamp: Date; details?: any }> {
    try {
      const { data, error } = await this.supabaseClient
        .from('work_centers')
        .select('count')
        .limit(1);

      if (error) {
        return {
          status: 'unhealthy',
          timestamp: new Date(),
          details: error
        };
      }

      return {
        status: 'healthy',
        timestamp: new Date(),
        details: { connection: 'active', query_test: 'passed' }
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date(),
        details: error.message
      };
    }
  }
}
